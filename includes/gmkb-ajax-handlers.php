<?php
/**
 * ROOT FIX: Definitive AJAX Handlers
 * Single source of truth for all GMKB AJAX endpoints
 * No fallbacks, no workarounds - just proper implementation
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Ajax_Handlers {
    
    public function __construct() {
        // Register missing AJAX handlers
        add_action('wp_ajax_gmkb_get_available_components', array($this, 'get_available_components'));
        add_action('wp_ajax_gmkb_get_themes', array($this, 'get_available_themes'));
        add_action('wp_ajax_gmkb_load_media_kit', array($this, 'load_media_kit'));
    }
    
    /**
     * Get available components - ROOT FIX: Use ComponentDiscovery
     */
    public function get_available_components() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        // ROOT FIX: Use the existing ComponentDiscovery instance
        global $gmkb_component_discovery;
        
        if (!$gmkb_component_discovery) {
            // Create instance if not available
            require_once plugin_dir_path(dirname(__FILE__)) . 'system/ComponentDiscovery.php';
            $gmkb_component_discovery = new ComponentDiscovery(plugin_dir_path(dirname(__FILE__)) . 'components');
        }
        
        // Scan for components
        $gmkb_component_discovery->scan();
        $components = $gmkb_component_discovery->getComponents();
        $categories = $gmkb_component_discovery->getCategories();
        
        // Convert to array format for JavaScript
        $components_array = array();
        foreach ($components as $key => $component) {
            $component['type'] = $component['type'] ?? $key;
            $component['name'] = $component['name'] ?? ucfirst($key);
            $component['title'] = $component['title'] ?? $component['name'];
            $components_array[] = $component;
        }
        
        wp_send_json_success(array(
            'components' => $components_array,
            'categories' => $categories,
            'total' => count($components_array)
        ));
    }
    
    /**
     * Get available themes - ROOT FIX: Single method, no fallbacks
     */
    public function get_available_themes() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        try {
            // ROOT FIX: Single source - always use ThemeDiscovery
            $theme_dir = plugin_dir_path(dirname(__FILE__)) . 'themes/';
            $theme_discovery_file = plugin_dir_path(dirname(__FILE__)) . 'system/ThemeDiscovery.php';
            
            // Require ThemeDiscovery - fail if not found (no fallback)
            require_once $theme_discovery_file;
            
            // Create instance and scan
            $theme_discovery = new ThemeDiscovery($theme_dir);
            $theme_discovery->scan();
            $themes = $theme_discovery->getThemes();
            
            // Convert to array format for JavaScript
            $themes_array = array();
            foreach ($themes as $theme_id => $theme_data) {
                $theme_data['id'] = $theme_id;
                $themes_array[] = $theme_data;
            }
            
            wp_send_json_success(array(
                'themes' => $themes_array,
                'total' => count($themes_array)
            ));
            
        } catch (Exception $e) {
            wp_send_json_error('Theme discovery failed: ' . $e->getMessage());
        }
    }

    
    /**
     * Load media kit
     */
    public function load_media_kit() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        
        if (!$post_id) {
            wp_send_json_error('No post ID provided');
            return;
        }
        
        // Get saved state
        $saved_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        
        if ($saved_state) {
            wp_send_json_success(array('state' => $saved_state));
        } else {
            wp_send_json_success(array('state' => null, 'message' => 'No saved state found'));
        }
    }
}

// ROOT FIX: Initialize as singleton
function gmkb_ajax_handlers_init() {
    static $instance = null;
    if ($instance === null) {
        $instance = new GMKB_Ajax_Handlers();
    }
    return $instance;
}

// Initialize on plugins_loaded to ensure everything is ready
add_action('plugins_loaded', 'gmkb_ajax_handlers_init', 5);
