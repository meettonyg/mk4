<?php
/**
 * Media Kit API Handler
 *
 * This version has been refactored to use the traditional WordPress admin-ajax.php
 * endpoint for core data operations (load/save) to ensure maximum compatibility
 * with various hosting environments and security configurations. The REST API is
 * now only used for secondary features like theme management.
 *
 * @package GMKB
 * @since 4.0.0
 */

namespace GMKB;

if (!defined('ABSPATH')) {
    exit;
}

class MediaKitAPI {
    
    /**
     * Initialize the API handlers.
     * Hooks into WordPress AJAX actions for primary data handling and the REST API for themes.
     */
    public function __construct() {
        // Core data operations via admin-ajax.php for reliability
        add_action('wp_ajax_gmkb_load_media_kit_vue', array($this, 'ajax_get_mediakit'));
        add_action('wp_ajax_gmkb_save_media_kit_vue', array($this, 'ajax_save_mediakit'));

        // Secondary features like theme management can still use the REST API
        add_action('rest_api_init', array($this, 'register_rest_routes'));
    }

    /**
     * AJAX handler for loading all media kit data.
     * This is the primary data source for the Vue application.
     */
    public function ajax_get_mediakit() {
        // Security: Verify the AJAX nonce sent from the frontend.
        if (!check_ajax_referer('gmkb_nonce', 'nonce', false)) {
            wp_send_json_error(array('message' => 'Invalid security token. Please refresh the page.'), 403);
            return;
        }

        // Input validation.
        if (!isset($_POST['post_id']) || !is_numeric($_POST['post_id'])) {
            wp_send_json_error(array('message' => 'Missing or invalid Post ID.'), 400);
            return;
        }

        $post_id = intval($_POST['post_id']);

        // Permission check: Ensure the current user has rights to edit this post.
        if (!current_user_can('edit_post', $post_id)) {
             wp_send_json_error(array('message' => 'You do not have permission to access this media kit.'), 403);
             return;
        }

        // Get the data using our shared helper function.
        $response_data = $this->get_mediakit_data($post_id);

        if (is_wp_error($response_data)) {
            wp_send_json_error(array('message' => $response_data->get_error_message()), 404);
        } else {
            wp_send_json_success($response_data);
        }
    }

    /**
     * AJAX handler for saving the media kit state.
     */
    public function ajax_save_mediakit() {
        // Security: Verify the AJAX nonce.
        if (!check_ajax_referer('gmkb_nonce', 'nonce', false)) {
            wp_send_json_error(array('message' => 'Your session has expired. Please refresh the page to continue saving.'), 403);
            return;
        }

        // Input validation.
        if (!isset($_POST['post_id']) || !is_numeric($_POST['post_id'])) {
            wp_send_json_error(array('message' => 'Missing or invalid Post ID.'), 400);
            return;
        }

        $post_id = intval($_POST['post_id']);

        // Permission check.
        if (!current_user_can('edit_post', $post_id)) {
             wp_send_json_error(array('message' => 'You do not have permission to save this media kit.'), 403);
             return;
        }

        if (!isset($_POST['state'])) {
            wp_send_json_error(array('message' => 'Missing state data.'), 400);
            return;
        }

        // Process and save the data.
        $state_json = stripslashes($_POST['state']);
        $data = json_decode($state_json, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json_error(array('message' => 'Invalid state data format.'), 400);
            return;
        }
        
        $result = $this->save_mediakit_data($post_id, $data);

        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()), 500);
        } else {
            wp_send_json_success($result);
        }
    }

    /**
     * Helper function to fetch all data for a media kit.
     *
     * @param int $post_id The ID of the post.
     * @return array|\WP_Error The complete data array or a WP_Error on failure.
     */
    private function get_mediakit_data($post_id) {
        $post = get_post($post_id);
        if (!$post) {
            return new \WP_Error('post_not_found', 'Post not found', array('status' => 404));
        }
        
        $media_kit_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        if (empty($media_kit_state) || !is_array($media_kit_state)) {
            $media_kit_state = array(
                'components' => new \stdClass(),
                'layout' => array(),
                'sections' => array(),
                'theme' => 'professional_clean',
                'themeSettings' => new \stdClass(),
                'globalSettings' => new \stdClass(),
            );
        }

        $pods_data = $this->fetch_all_pods_data($post_id);
        
        return array(
            'version' => '1.0-ajax',
            'postId' => $post_id,
            'postType' => $post->post_type,
            'components' => $media_kit_state['components'] ?? new \stdClass(),
            'layout' => $media_kit_state['layout'] ?? $media_kit_state['sections'] ?? array(), // Handle legacy 'sections' as layout
            'sections' => $media_kit_state['sections'] ?? $media_kit_state['layout'] ?? array(), // Handle legacy 'layout' as sections
            'theme' => $media_kit_state['theme'] ?? 'professional_clean',
            'themeSettings' => $media_kit_state['themeSettings'] ?? new \stdClass(),
            'globalSettings' => $media_kit_state['globalSettings'] ?? new \stdClass(),
            'podsData' => $pods_data,
            'timestamp' => current_time('mysql')
        );
    }

    /**
     * Helper function to save the media kit state.
     *
     * @param int $post_id The ID of the post.
     * @param array $data The state data from the frontend.
     * @return array|\WP_Error Success array or a WP_Error on failure.
     */
    private function save_mediakit_data($post_id, $data) {
        if (!isset($data['components']) || !isset($data['layout'])) {
            return new \WP_Error('missing_data', 'Incomplete state data: components and layout are required.', array('status' => 400));
        }

        $state = array(
            'components' => $data['components'] ?? new \stdClass(),
            'layout' => $data['layout'] ?? array(),
            'sections' => $data['layout'] ?? array(), // Ensure sections and layout are synced.
            'theme' => $data['theme'] ?? 'professional_clean',
            'themeSettings' => $data['themeSettings'] ?? new \stdClass(),
            'globalSettings' => $data['globalSettings'] ?? new \stdClass(),
            'timestamp' => current_time('mysql')
        );

        $updated = update_post_meta($post_id, 'gmkb_media_kit_state', $state);
        
        if ($updated === false) {
            return new \WP_Error('save_failed', 'Failed to write media kit state to the database.', array('status' => 500));
        }

        return array(
            'success' => true,
            'timestamp' => $state['timestamp'],
            'message' => 'Media kit saved successfully.'
        );
    }
    
    /**
     * Fetch all relevant Pods data for a post in a single efficient operation.
     *
     * @param int $post_id The ID of the post.
     * @return array The fetched data.
     */
    private function fetch_all_pods_data($post_id) {
        $data = array();
        
        $fields = array(
            'biography', 'biography_short', 'first_name', 'last_name', 
            'guest_title', 'tagline', 'email', 'phone', 'website', 'guest_headshot'
        );
        
        for ($i = 1; $i <= 5; $i++) { $fields[] = "topic_{$i}"; }
        for ($i = 1; $i <= 10; $i++) { $fields[] = "question_{$i}"; }
        
        foreach ($fields as $field) {
            $value = get_post_meta($post_id, $field, true);
            if (!empty($value)) {
                $data[$field] = $value;
            }
        }
        
        if (empty($data['biography']) && function_exists('pods')) {
            try {
                $pod = pods('mkcg', $post_id);
                if ($pod && $pod->exists()) {
                    foreach ($fields as $field) {
                        if (empty($data[$field])) { // Only fill if not already set by get_post_meta
                            $value = $pod->field($field);
                            if (!empty($value)) {
                                $data[$field] = $value;
                            }
                        }
                    }
                }
            } catch (\Exception $e) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('GMKB Pods API Error: ' . $e->getMessage());
                }
            }
        }
        
        return $data;
    }
    
    /**
     * Register REST API routes for non-essential features like themes.
     */
    public function register_rest_routes() {
        $namespace = 'gmkb/v1';
        
        register_rest_route($namespace, '/themes/custom', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_custom_themes'),
            'permission_callback' => array($this, 'check_themes_permission')
        ));
        
        register_rest_route($namespace, '/themes/custom', array(
            'methods' => 'POST',
            'callback' => array($this, 'save_custom_theme'),
            'permission_callback' => array($this, 'check_themes_permission')
        ));
    }
    
    /**
     * Get custom themes from the database via REST API.
     */
    public function get_custom_themes($request) {
        if (!is_user_logged_in()) {
            return rest_ensure_response(array(
                'themes' => array(),
                'message' => 'Login required for custom themes'
            ));
        }
        
        $custom_themes = get_option('gmkb_custom_themes', array());
        
        return rest_ensure_response(array(
            'themes' => is_array($custom_themes) ? array_values($custom_themes) : array(),
        ));
    }
    
    /**
     * Save a custom theme to the database via REST API.
     */
    public function save_custom_theme($request) {
        $theme = $request->get_json_params();
        
        if (!$theme || !isset($theme['id']) || !isset($theme['colors'])) {
            return new \WP_Error('invalid_theme', 'Invalid theme data.', array('status' => 400));
        }
        
        $custom_themes = get_option('gmkb_custom_themes', array());
        if (!is_array($custom_themes)) {
            $custom_themes = array();
        }
        
        $custom_themes[$theme['id']] = $theme;
        update_option('gmkb_custom_themes', $custom_themes);
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Theme saved successfully.',
            'theme' => $theme
        ));
    }
    
    /**
     * Permission check for the theme-related REST endpoints.
     */
    public function check_themes_permission(\WP_REST_Request $request) {
        // Anyone can view themes.
        if ($request->get_method() === 'GET') {
            return true;
        }
        
        // Only authenticated users who can edit posts can save themes.
        $nonce = $request->get_header('X-WP-Nonce');
        if (!$nonce || !wp_verify_nonce($nonce, 'wp_rest')) {
            return new \WP_Error('rest_nonce_invalid', 'Invalid authentication.', array('status' => 403));
        }
        
        return current_user_can('edit_posts');
    }
}

// Initialize the API handler.
new MediaKitAPI();
