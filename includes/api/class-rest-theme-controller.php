<?php
/**
 * REST API Theme Controller
 * 
 * Phase 5: Theme System Implementation
 * Provides REST API endpoints for theme operations
 * 
 * @package Guestify_Media_Kit_Builder
 * @version 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_REST_Theme_Controller {
    
    /**
     * Namespace for REST routes
     */
    const NAMESPACE = 'gmkb/v1';
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }
    
    /**
     * Register REST routes
     */
    public function register_routes() {
        // Get all themes (built-in and custom)
        // SECURITY FIX: Require authentication to view theme list
        register_rest_route(self::NAMESPACE, '/themes', array(
            'methods' => WP_REST_Server::READABLE,
            'callback' => array($this, 'get_themes'),
            'permission_callback' => array($this, 'read_permission_check')
        ));
        
        // Get custom themes - GEMINI FIX: Require auth for all theme operations
        register_rest_route(self::NAMESPACE, '/themes/custom', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_custom_themes'),
                'permission_callback' => array($this, 'write_permission_check') // Require auth for read
            ),
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'save_custom_theme'),
                'permission_callback' => array($this, 'write_permission_check') // Require auth for write
            )
        ));
        
        // Single custom theme operations
        // SECURITY FIX: Require authentication for all custom theme operations
        register_rest_route(self::NAMESPACE, '/themes/custom/(?P<id>[a-z0-9_-]+)', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_custom_theme'),
                'permission_callback' => array($this, 'read_permission_check'),
                'args' => array(
                    'id' => array(
                        'required' => true,
                        'type' => 'string',
                        'sanitize_callback' => 'sanitize_text_field'
                    )
                )
            ),
            array(
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => array($this, 'update_custom_theme'),
                'permission_callback' => array($this, 'write_permission_check'),
                'args' => array(
                    'id' => array(
                        'required' => true,
                        'type' => 'string',
                        'sanitize_callback' => 'sanitize_text_field'
                    )
                )
            ),
            array(
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => array($this, 'delete_custom_theme'),
                'permission_callback' => array($this, 'write_permission_check'),
                'args' => array(
                    'id' => array(
                        'required' => true,
                        'type' => 'string',
                        'sanitize_callback' => 'sanitize_text_field'
                    )
                )
            )
        ));
        
        // Theme selection endpoints
        // SECURITY FIX: Require authentication to view active theme
        register_rest_route(self::NAMESPACE, '/themes/active', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_active_theme'),
                'permission_callback' => array($this, 'read_permission_check')
            ),
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'set_active_theme'),
                'permission_callback' => array($this, 'write_permission_check')
            )
        ));
    }
    
    /**
     * Permission check for read operations
     * SECURITY FIX: Require user to be logged in for theme access
     */
    public function read_permission_check() {
        return is_user_logged_in();
    }

    /**
     * Permission check for write operations
     */
    public function write_permission_check() {
        return current_user_can('edit_posts');
    }
    
    /**
     * Get all available themes (built-in and custom)
     */
    public function get_themes($request) {
        $themes = array();
        
        // Get built-in themes from theme discovery
        if (file_exists(GMKB_PLUGIN_DIR . 'system/ThemeDiscovery.php')) {
            require_once GMKB_PLUGIN_DIR . 'system/ThemeDiscovery.php';
            $discovery = new ThemeDiscovery(GMKB_PLUGIN_DIR . 'themes');
            $built_in_themes = $discovery->getThemes();
            
            foreach ($built_in_themes as $theme) {
                $themes[] = array(
                    'id' => $theme['slug'],
                    'name' => $theme['name'],
                    'description' => $theme['description'] ?? '',
                    'colors' => $theme['colors'] ?? array(),
                    'typography' => $theme['typography'] ?? $theme['fonts'] ?? array(),
                    'spacing' => $theme['spacing'] ?? array(),
                    'effects' => $theme['effects'] ?? array(),
                    'isCustom' => false,
                    'isBuiltIn' => true
                );
            }
        }
        
        // Get custom themes from database
        $custom_themes = get_option('gmkb_custom_themes', array());
        if (is_array($custom_themes)) {
            foreach ($custom_themes as $theme_id => $theme) {
                $themes[] = array(
                    'id' => $theme_id,
                    'name' => $theme['name'] ?? 'Custom Theme',
                    'description' => $theme['description'] ?? '',
                    'colors' => $theme['colors'] ?? array(),
                    'typography' => $theme['typography'] ?? array(),
                    'spacing' => $theme['spacing'] ?? array(),
                    'effects' => $theme['effects'] ?? array(),
                    'isCustom' => true,
                    'isBuiltIn' => false,
                    'createdAt' => $theme['createdAt'] ?? null
                );
            }
        }
        
        return new WP_REST_Response(array(
            'themes' => $themes,
            'total' => count($themes)
        ), 200);
    }
    
    /**
     * Get custom themes only
     */
    public function get_custom_themes($request) {
        $custom_themes = get_option('gmkb_custom_themes', array());
        
        if (!is_array($custom_themes)) {
            $custom_themes = array();
        }
        
        // Convert to indexed array for JSON
        $themes = array();
        foreach ($custom_themes as $theme_id => $theme) {
            $theme['id'] = $theme_id;
            $themes[] = $theme;
        }
        
        return new WP_REST_Response(array(
            'themes' => $themes,
            'total' => count($themes)
        ), 200);
    }
    
    /**
     * Get a single custom theme
     */
    public function get_custom_theme($request) {
        $theme_id = $request->get_param('id');
        $custom_themes = get_option('gmkb_custom_themes', array());
        
        if (!isset($custom_themes[$theme_id])) {
            return new WP_Error('theme_not_found', 'Custom theme not found', array('status' => 404));
        }
        
        $theme = $custom_themes[$theme_id];
        $theme['id'] = $theme_id;
        
        return new WP_REST_Response($theme, 200);
    }
    
    /**
     * Save a new custom theme
     */
    public function save_custom_theme($request) {
        $theme_data = $request->get_json_params();
        
        // Validate theme data
        if (!isset($theme_data['colors']) || !is_array($theme_data['colors'])) {
            return new WP_Error('invalid_theme', 'Theme must include colors', array('status' => 400));
        }
        
        // Generate theme ID if not provided
        $theme_id = $theme_data['id'] ?? 'custom_' . time();
        
        // Ensure it's a custom theme ID
        if (!preg_match('/^(custom_|imported_)/', $theme_id)) {
            $theme_id = 'custom_' . $theme_id;
        }
        
        // Prepare theme data
        $theme = array(
            'id' => $theme_id,
            'name' => $theme_data['name'] ?? 'Custom Theme',
            'description' => $theme_data['description'] ?? '',
            'colors' => $theme_data['colors'],
            'typography' => $theme_data['typography'] ?? array(),
            'spacing' => $theme_data['spacing'] ?? array(),
            'effects' => $theme_data['effects'] ?? array(),
            'isCustom' => true,
            'createdAt' => $theme_data['createdAt'] ?? current_time('c'),
            'updatedAt' => current_time('c')
        );
        
        // Save to database
        $custom_themes = get_option('gmkb_custom_themes', array());
        if (!is_array($custom_themes)) {
            $custom_themes = array();
        }
        
        $custom_themes[$theme_id] = $theme;
        $result = update_option('gmkb_custom_themes', $custom_themes);
        
        if (!$result && get_option('gmkb_custom_themes') !== $custom_themes) {
            return new WP_Error('save_failed', 'Failed to save custom theme', array('status' => 500));
        }
        
        return new WP_REST_Response(array(
            'success' => true,
            'theme' => $theme
        ), 201);
    }
    
    /**
     * Update an existing custom theme
     */
    public function update_custom_theme($request) {
        $theme_id = $request->get_param('id');
        $theme_data = $request->get_json_params();
        
        // Get existing custom themes
        $custom_themes = get_option('gmkb_custom_themes', array());
        
        if (!isset($custom_themes[$theme_id])) {
            return new WP_Error('theme_not_found', 'Custom theme not found', array('status' => 404));
        }
        
        // Update theme data
        $theme = $custom_themes[$theme_id];
        
        if (isset($theme_data['name'])) $theme['name'] = $theme_data['name'];
        if (isset($theme_data['description'])) $theme['description'] = $theme_data['description'];
        if (isset($theme_data['colors'])) $theme['colors'] = $theme_data['colors'];
        if (isset($theme_data['typography'])) $theme['typography'] = $theme_data['typography'];
        if (isset($theme_data['spacing'])) $theme['spacing'] = $theme_data['spacing'];
        if (isset($theme_data['effects'])) $theme['effects'] = $theme_data['effects'];
        
        $theme['updatedAt'] = current_time('c');
        
        // Save back to database
        $custom_themes[$theme_id] = $theme;
        $result = update_option('gmkb_custom_themes', $custom_themes);
        
        if (!$result && get_option('gmkb_custom_themes') !== $custom_themes) {
            return new WP_Error('update_failed', 'Failed to update custom theme', array('status' => 500));
        }
        
        return new WP_REST_Response(array(
            'success' => true,
            'theme' => $theme
        ), 200);
    }
    
    /**
     * Delete a custom theme
     */
    public function delete_custom_theme($request) {
        $theme_id = $request->get_param('id');
        
        // Can't delete built-in themes
        if (!preg_match('/^(custom_|imported_)/', $theme_id)) {
            return new WP_Error('cannot_delete', 'Cannot delete built-in themes', array('status' => 403));
        }
        
        // Get existing custom themes
        $custom_themes = get_option('gmkb_custom_themes', array());
        
        if (!isset($custom_themes[$theme_id])) {
            return new WP_Error('theme_not_found', 'Custom theme not found', array('status' => 404));
        }
        
        // Remove the theme
        unset($custom_themes[$theme_id]);
        
        // Save back to database
        $result = update_option('gmkb_custom_themes', $custom_themes);
        
        if (!$result && get_option('gmkb_custom_themes') !== $custom_themes) {
            return new WP_Error('delete_failed', 'Failed to delete custom theme', array('status' => 500));
        }
        
        // If this was the active theme, reset to default
        $active_theme = get_option('gmkb_active_theme', 'professional_clean');
        if ($active_theme === $theme_id) {
            update_option('gmkb_active_theme', 'professional_clean');
        }
        
        return new WP_REST_Response(array(
            'success' => true,
            'message' => 'Theme deleted successfully'
        ), 200);
    }
    
    /**
     * Get the active theme
     */
    public function get_active_theme($request) {
        $post_id = $request->get_param('post_id');
        
        if ($post_id) {
            // Get post-specific theme
            $theme_id = get_post_meta($post_id, 'gmkb_selected_theme', true);
            
            // Check media kit state as fallback
            if (empty($theme_id)) {
                $state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
                if (is_array($state) && isset($state['theme'])) {
                    $theme_id = $state['theme'];
                }
            }
            
            if (empty($theme_id)) {
                $theme_id = get_option('gmkb_active_theme', 'professional_clean');
            }
        } else {
            // Get global theme
            $theme_id = get_option('gmkb_active_theme', 'professional_clean');
        }
        
        return new WP_REST_Response(array(
            'theme_id' => $theme_id,
            'post_id' => $post_id
        ), 200);
    }
    
    /**
     * Set the active theme
     */
    public function set_active_theme($request) {
        $theme_id = sanitize_text_field($request->get_param('theme_id'));
        $post_id = absint($request->get_param('post_id'));

        if (empty($theme_id)) {
            return new WP_Error('invalid_theme', 'Theme ID is required', array('status' => 400));
        }

        // SECURITY FIX: Validate theme_id length
        if (strlen($theme_id) > 100) {
            return new WP_Error('invalid_theme', 'Theme ID too long', array('status' => 400));
        }

        if ($post_id) {
            // SECURITY FIX: Verify user can edit this specific post
            if (!current_user_can('edit_post', $post_id)) {
                return new WP_Error('forbidden', 'You do not have permission to edit this post', array('status' => 403));
            }

            // Save post-specific theme
            update_post_meta($post_id, 'gmkb_selected_theme', $theme_id);
            
            // Also update in media kit state if it exists
            $state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
            if (is_array($state)) {
                $state['theme'] = $theme_id;
                update_post_meta($post_id, 'gmkb_media_kit_state', $state);
            }
            
            // ROOT FIX: Clear cache after updating theme selection
            clean_post_cache($post_id);
            wp_cache_delete($post_id, 'post_meta');
            
            $saved_to = 'post_meta';
        } else {
            // Save global theme
            update_option('gmkb_active_theme', $theme_id);
            $saved_to = 'global';
        }
        
        return new WP_REST_Response(array(
            'success' => true,
            'theme_id' => $theme_id,
            'post_id' => $post_id,
            'saved_to' => $saved_to
        ), 200);
    }
}

// ROOT FIX: Controller will be instantiated by main plugin file
// The controller should be instantiated once via the main plugin's init hook
// This comment serves as documentation - instantiation happens in guestify-media-kit-builder.php
