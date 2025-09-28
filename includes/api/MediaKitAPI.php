<?php
/**
 * Media Kit REST API Handler
 * Phase 1: Clean REST API for Vue frontend
 * 
 * @package GMKB
 * @since 2.0.0
 */

namespace GMKB;

if (!defined('ABSPATH')) {
    exit;
}

class MediaKitAPI {
    
    /**
     * Initialize the REST API routes
     */
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }
    
    /**
     * Register REST API routes
     */
    public function register_routes() {
        $namespace = 'gmkb/v1';
        
        // GET /mediakit/{id} - Fetch media kit data
        register_rest_route($namespace, '/mediakit/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_mediakit'),
            'permission_callback' => array($this, 'check_permissions'),
            'args' => array(
                'id' => array(
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                )
            )
        ));
        
        // POST /mediakit/{id}/save - Save media kit data
        register_rest_route($namespace, '/mediakit/(?P<id>\d+)/save', array(
            'methods' => 'POST',
            'callback' => array($this, 'save_mediakit'),
            'permission_callback' => array($this, 'check_permissions'),
            'args' => array(
                'id' => array(
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                )
            )
        ));
        
        // GET /themes/custom - Get custom themes
        register_rest_route($namespace, '/themes/custom', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_custom_themes'),
            'permission_callback' => '__return_true' // Public endpoint for logged-in users
        ));
        
        // POST /themes/custom - Save custom theme
        register_rest_route($namespace, '/themes/custom', array(
            'methods' => 'POST',
            'callback' => array($this, 'save_custom_theme'),
            'permission_callback' => function() {
                return current_user_can('edit_posts');
            }
        ));
    }
    
    /**
     * Check if user has permission to access the endpoint
     * ROOT FIX: More flexible permission check for viewing (not just editing)
     */
    public function check_permissions($request) {
        $post_id = $request->get_param('id');
        
        // Check if post exists
        $post = get_post($post_id);
        if (!$post) {
            return false;
        }
        
        // For viewing, check if user can read the post
        if ($request->get_method() === 'GET') {
            // Allow if post is published
            if ($post->post_status === 'publish') {
                return true;
            }
            // Otherwise check if user can read private posts
            return current_user_can('read_private_posts') || current_user_can('edit_post', $post_id);
        }
        
        // For editing (POST/PUT/DELETE), check edit capability
        return current_user_can('edit_post', $post_id);
    }
    
    /**
     * Get media kit data
     * Implements Phase 1: Single API call for all data
     */
    public function get_mediakit($request) {
        $post_id = intval($request->get_param('id'));
        
        // Get saved state from post meta
        $media_kit_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        if (empty($media_kit_state)) {
            $media_kit_state = array(
                'components' => new \stdClass(),
                'sections' => array(),
                'theme' => 'professional_clean',
                'themeCustomizations' => array()
            );
        }
        
        // Fetch ALL Pods data in one go - no N+1 queries!
        $pods_data = $this->fetch_all_pods_data($post_id);
        
        // Get post type for context
        $post = get_post($post_id);
        $post_type = $post ? $post->post_type : '';
        
        // Return complete data structure
        return rest_ensure_response(array(
            'version' => '1.0',
            'postId' => $post_id,
            'postType' => $post_type,
            'components' => $media_kit_state['components'] ?? new \stdClass(),
            'sections' => $media_kit_state['sections'] ?? array(),
            'theme' => $media_kit_state['theme'] ?? 'professional_clean',
            'themeCustomizations' => $media_kit_state['themeCustomizations'] ?? array(),
            'podsData' => $pods_data,
            'timestamp' => current_time('mysql')
        ));
    }
    
    /**
     * Save media kit data
     */
    public function save_mediakit($request) {
        $post_id = intval($request->get_param('id'));
        
        // Get JSON payload
        $data = $request->get_json_params();
        
        // Validate required fields
        if (!isset($data['components']) || !isset($data['sections'])) {
            return new \WP_Error('missing_data', 'Components and sections are required', array('status' => 400));
        }
        
        // Prepare state for saving
        $state = array(
            'components' => $data['components'] ?? new \stdClass(),
            'sections' => $data['sections'] ?? array(),
            'theme' => $data['theme'] ?? 'professional_clean',
            'themeCustomizations' => $data['themeCustomizations'] ?? array(),
            'timestamp' => current_time('mysql')
        );
        
        // Save to post meta
        $updated = update_post_meta($post_id, 'gmkb_media_kit_state', $state);
        
        if ($updated === false) {
            return new \WP_Error('save_failed', 'Failed to save media kit', array('status' => 500));
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'timestamp' => $state['timestamp'],
            'message' => 'Media kit saved successfully'
        ));
    }
    
    /**
     * Fetch all Pods data in a single operation
     * Prevents N+1 query problems
     */
    private function fetch_all_pods_data($post_id) {
        $data = array();
        
        // Define all fields to fetch
        $fields = array(
            // Biography fields
            'biography',
            'biography_short',
            
            // Name fields
            'first_name',
            'last_name',
            'guest_title',
            'tagline',
            
            // Contact fields
            'email',
            'phone',
            'website',
            
            // Image fields
            'guest_headshot'
        );
        
        // Add topic fields (1-5)
        for ($i = 1; $i <= 5; $i++) {
            $fields[] = "topic_{$i}";
        }
        
        // Add question fields (1-10)
        for ($i = 1; $i <= 10; $i++) {
            $fields[] = "question_{$i}";
        }
        
        // Fetch all meta fields at once
        foreach ($fields as $field) {
            $value = get_post_meta($post_id, $field, true);
            if (!empty($value)) {
                $data[$field] = $value;
            }
        }
        
        // Try Pods API if available and no data found
        if (empty($data['biography']) && function_exists('pods')) {
            try {
                $pod = pods('mkcg', $post_id);
                if ($pod && $pod->exists()) {
                    foreach ($fields as $field) {
                        $value = $pod->field($field);
                        if (!empty($value)) {
                            $data[$field] = $value;
                        }
                    }
                }
            } catch (\Exception $e) {
                // Pods API failed, continue with what we have
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('GMKB API: Pods API error - ' . $e->getMessage());
                }
            }
        }
        
        return $data;
    }
    
    /**
     * Get custom themes from database
     * Phase 1 compliant - REST API instead of AJAX
     */
    public function get_custom_themes($request) {
        // Check if user is logged in for custom themes
        if (!is_user_logged_in()) {
            // Return empty for non-logged in users
            return rest_ensure_response(array(
                'themes' => array(),
                'count' => 0,
                'message' => 'Login required for custom themes'
            ));
        }
        
        // Get custom themes from database
        $custom_themes = get_option('gmkb_custom_themes', array());
        
        // Ensure it's an array
        if (!is_array($custom_themes)) {
            $custom_themes = array();
        }
        
        return rest_ensure_response(array(
            'themes' => array_values($custom_themes), // Ensure indexed array
            'count' => count($custom_themes),
            'message' => 'Custom themes loaded successfully'
        ));
    }
    
    /**
     * Save custom theme to database
     * Phase 1 compliant - REST API instead of AJAX
     */
    public function save_custom_theme($request) {
        // Get theme data from request
        $theme = $request->get_json_params();
        
        // Validate theme data
        if (!$theme || !isset($theme['id']) || !isset($theme['colors'])) {
            return new \WP_Error('invalid_theme', 'Invalid theme data', array('status' => 400));
        }
        
        // Get existing custom themes
        $custom_themes = get_option('gmkb_custom_themes', array());
        if (!is_array($custom_themes)) {
            $custom_themes = array();
        }
        
        // Add or update theme
        $custom_themes[$theme['id']] = $theme;
        update_option('gmkb_custom_themes', $custom_themes);
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Theme saved successfully',
            'theme' => $theme
        ));
    }
}

// Initialize the API
new MediaKitAPI();
