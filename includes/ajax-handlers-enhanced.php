<?php
/**
 * Enhanced AJAX Handlers for WordPress-Vue Bridge
 * Architecture-compliant: Clean separation, structured responses
 */

class GMKB_Ajax_Handlers_Enhanced {
    
    public function __construct() {
        $this->register_ajax_handlers();
    }
    
    /**
     * Register all AJAX handlers
     */
    private function register_ajax_handlers() {
        // Public and logged-in users
        $actions = [
            'gmkb_get_initial_state',
            'gmkb_save_media_kit',
            'gmkb_get_components',
            'gmkb_get_themes',
            'gmkb_get_pods_data',
            'gmkb_update_component',
            'gmkb_delete_component'
        ];
        
        foreach ($actions as $action) {
            add_action("wp_ajax_{$action}", [$this, str_replace('gmkb_', 'handle_', $action)]);
            add_action("wp_ajax_nopriv_{$action}", [$this, str_replace('gmkb_', 'handle_', $action)]);
        }
    }
    
    /**
     * Verify nonce and permissions
     */
    private function verify_request() {
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_builder_nonce')) {
            wp_send_json_error(['message' => 'Security verification failed'], 403);
        }
        
        // Check user capabilities if needed
        if (!current_user_can('edit_posts')) {
            wp_send_json_error(['message' => 'Insufficient permissions'], 403);
        }
    }
    
    /**
     * Handle get initial state request
     */
    public function handle_get_initial_state() {
        $this->verify_request();
        
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        
        if (!$post_id) {
            wp_send_json_error(['message' => 'Invalid post ID']);
        }
        
        // Get saved media kit data
        $saved_state = get_post_meta($post_id, '_media_kit_data', true);
        
        // Parse saved state if it's a string
        if (is_string($saved_state) && !empty($saved_state)) {
            $decoded = json_decode($saved_state, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $saved_state = $decoded;
            }
        }
        
        // Ensure we have a valid state structure
        if (!is_array($saved_state)) {
            $saved_state = $this->get_default_state();
        }
        
        // Get component definitions
        $components = $this->get_available_components();
        
        // Get themes
        $themes = $this->get_available_themes();
        
        // Get Pods data if available
        $pods_data = $this->get_pods_data_for_post($post_id);
        
        wp_send_json_success([
            'savedState' => $saved_state,
            'components' => $components,
            'themes' => $themes,
            'podsData' => $pods_data,
            'postId' => $post_id,
            'timestamp' => current_time('mysql')
        ]);
    }
    
    /**
     * Handle save media kit request
     */
    public function handle_save_media_kit() {
        $this->verify_request();
        
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        $state = isset($_POST['state']) ? stripslashes($_POST['state']) : '';
        
        if (!$post_id) {
            wp_send_json_error(['message' => 'Invalid post ID']);
        }
        
        // Validate JSON
        $decoded_state = json_decode($state, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json_error(['message' => 'Invalid state data']);
        }
        
        // Save to post meta
        $result = update_post_meta($post_id, '_media_kit_data', $decoded_state);
        
        // Also save a backup
        update_post_meta($post_id, '_media_kit_backup_' . time(), $decoded_state);
        
        // Clean old backups (keep last 5)
        $this->clean_old_backups($post_id);
        
        wp_send_json_success([
            'message' => 'Media kit saved successfully',
            'saved' => $result !== false,
            'timestamp' => current_time('mysql')
        ]);
    }
    
    /**
     * Handle get components request
     */
    public function handle_get_components() {
        $this->verify_request();
        
        $components = $this->get_available_components();
        
        wp_send_json_success([
            'components' => $components,
            'count' => count($components)
        ]);
    }
    
    /**
     * Handle get themes request
     */
    public function handle_get_themes() {
        $this->verify_request();
        
        $themes = $this->get_available_themes();
        
        wp_send_json_success([
            'themes' => $themes,
            'count' => count($themes)
        ]);
    }
    
    /**
     * Handle get Pods data request
     */
    public function handle_get_pods_data() {
        $this->verify_request();
        
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        
        if (!$post_id) {
            wp_send_json_error(['message' => 'Invalid post ID']);
        }
        
        $pods_data = $this->get_pods_data_for_post($post_id);
        
        wp_send_json_success([
            'podsData' => $pods_data,
            'hasData' => !empty($pods_data)
        ]);
    }
    
    /**
     * Handle update component request
     */
    public function handle_update_component() {
        $this->verify_request();
        
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        $component_id = isset($_POST['component_id']) ? sanitize_text_field($_POST['component_id']) : '';
        $data = isset($_POST['data']) ? stripslashes($_POST['data']) : '';
        
        if (!$post_id || !$component_id) {
            wp_send_json_error(['message' => 'Invalid parameters']);
        }
        
        // Get current state
        $state = get_post_meta($post_id, '_media_kit_data', true);
        
        if (!is_array($state)) {
            $state = $this->get_default_state();
        }
        
        // Update component
        $component_data = json_decode($data, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $state['components'][$component_id] = $component_data;
            
            // Save updated state
            update_post_meta($post_id, '_media_kit_data', $state);
            
            wp_send_json_success([
                'message' => 'Component updated',
                'componentId' => $component_id
            ]);
        } else {
            wp_send_json_error(['message' => 'Invalid component data']);
        }
    }
    
    /**
     * Handle delete component request
     */
    public function handle_delete_component() {
        $this->verify_request();
        
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        $component_id = isset($_POST['component_id']) ? sanitize_text_field($_POST['component_id']) : '';
        
        if (!$post_id || !$component_id) {
            wp_send_json_error(['message' => 'Invalid parameters']);
        }
        
        // Get current state
        $state = get_post_meta($post_id, '_media_kit_data', true);
        
        if (!is_array($state)) {
            wp_send_json_error(['message' => 'No media kit data found']);
        }
        
        // Delete component
        if (isset($state['components'][$component_id])) {
            unset($state['components'][$component_id]);
            
            // Save updated state
            update_post_meta($post_id, '_media_kit_data', $state);
            
            wp_send_json_success([
                'message' => 'Component deleted',
                'componentId' => $component_id
            ]);
        } else {
            wp_send_json_error(['message' => 'Component not found']);
        }
    }
    
    /**
     * Get default state structure
     */
    private function get_default_state() {
        return [
            'components' => [],
            'sections' => [],
            'layout' => [],
            'globalSettings' => [
                'theme' => 'modern',
                'customTheme' => null
            ],
            'version' => '2.0.0'
        ];
    }
    
    /**
     * Get available components
     */
    private function get_available_components() {
        $components_dir = plugin_dir_path(dirname(__FILE__)) . 'components/';
        $components = [];
        
        if (is_dir($components_dir)) {
            $dirs = glob($components_dir . '*', GLOB_ONLYDIR);
            
            foreach ($dirs as $dir) {
                $component_name = basename($dir);
                $config_file = $dir . '/config.json';
                
                if (file_exists($config_file)) {
                    $config = json_decode(file_get_contents($config_file), true);
                    if ($config) {
                        $components[$component_name] = $config;
                    }
                }
            }
        }
        
        return $components;
    }
    
    /**
     * Get available themes
     */
    private function get_available_themes() {
        $themes_dir = plugin_dir_path(dirname(__FILE__)) . 'themes/';
        $themes = [];
        
        if (is_dir($themes_dir)) {
            $theme_files = glob($themes_dir . '*.json');
            
            foreach ($theme_files as $file) {
                $theme_name = basename($file, '.json');
                $theme_data = json_decode(file_get_contents($file), true);
                
                if ($theme_data) {
                    $themes[$theme_name] = $theme_data;
                }
            }
        }
        
        return $themes;
    }
    
    /**
     * Get Pods data for post
     */
    private function get_pods_data_for_post($post_id) {
        $pods_data = [];
        
        // Check if Pods is active
        if (!function_exists('pods')) {
            return $pods_data;
        }
        
        try {
            $pod = pods('post', $post_id);
            
            if ($pod && $pod->exists()) {
                // Get all pod fields
                $fields = $pod->fields();
                
                foreach ($fields as $field_name => $field_config) {
                    $value = $pod->field($field_name);
                    if ($value !== null) {
                        $pods_data[$field_name] = $value;
                    }
                }
            }
        } catch (Exception $e) {
            error_log('Pods data retrieval error: ' . $e->getMessage());
        }
        
        return $pods_data;
    }
    
    /**
     * Clean old backups
     */
    private function clean_old_backups($post_id) {
        global $wpdb;
        
        // Get all backup meta keys
        $backups = $wpdb->get_results($wpdb->prepare(
            "SELECT meta_key FROM {$wpdb->postmeta} 
             WHERE post_id = %d 
             AND meta_key LIKE '_media_kit_backup_%' 
             ORDER BY meta_key DESC",
            $post_id
        ));
        
        // Keep only the 5 most recent
        if (count($backups) > 5) {
            $to_delete = array_slice($backups, 5);
            foreach ($to_delete as $backup) {
                delete_post_meta($post_id, $backup->meta_key);
            }
        }
    }
}

// Initialize enhanced AJAX handlers
new GMKB_Ajax_Handlers_Enhanced();
