<?php
/**
 * AJAX Handlers Class
 * 
 * Issue #13 FIX: Extracted from guestify-media-kit-builder.php
 * Handles all AJAX endpoints for component operations
 * 
 * @package Guestify
 * @since 4.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * AJAX handlers for GMKB
 */
class GMKB_Ajax {

    private static $instance;
    private $component_discovery;

    /**
     * Get singleton instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        $this->init_hooks();
    }

    /**
     * Initialize hooks
     */
    private function init_hooks() {
        // Component metadata endpoint
        add_action('wp_ajax_guestify_get_components', array($this, 'ajax_get_components'));
        add_action('wp_ajax_nopriv_guestify_get_components', array($this, 'ajax_get_components'));
        
        // Cache management endpoints
        add_action('wp_ajax_gmkb_clear_component_cache', array($this, 'ajax_clear_component_cache'));
        add_action('wp_ajax_gmkb_refresh_components', array($this, 'ajax_refresh_components'));
        
        // ARCHITECTURE FIX: Pods data update endpoint
        add_action('wp_ajax_gmkb_update_pods_field', array($this, 'ajax_update_pods_field'));
    }

    /**
     * Set component discovery instance
     */
    public function set_component_discovery($discovery) {
        $this->component_discovery = $discovery;
    }

    /**
     * AJAX: Get component metadata
     * Returns component definitions for the builder
     */
    public function ajax_get_components() {
        // Verify nonce
        $nonce_provided = isset($_POST['nonce']) ? $_POST['nonce'] : (isset($_GET['nonce']) ? $_GET['nonce'] : '');
        
        if ($nonce_provided && !wp_verify_nonce($nonce_provided, 'gmkb_nonce')) {
            wp_send_json_error('Security verification failed');
            return;
        }
        
        if (!$nonce_provided && (!defined('WP_DEBUG') || !WP_DEBUG)) {
            wp_send_json_error('Nonce required');
            return;
        }
        
        // Get component discovery instance
        if (!$this->component_discovery) {
            $plugin = GMKB_Plugin::get_instance();
            $this->component_discovery = $plugin->get_component_discovery();
        }
        
        try {
            if (!$this->component_discovery) {
                throw new Exception('Component discovery not initialized');
            }
            
            $this->component_discovery->scan(true);
            
            $components = $this->component_discovery->getComponents();
            $categories = $this->component_discovery->getCategories();
            
            // Format components array
            $components_array = array();
            foreach ($components as $key => $component) {
                $component['type'] = $component['type'] ?? $key;
                $component['name'] = $component['name'] ?? ucfirst($key);
                $component['title'] = $component['title'] ?? $component['name'];
                $component['description'] = $component['description'] ?? 'No description available';
                $component['category'] = $component['category'] ?? 'general';
                $component['premium'] = $component['isPremium'] ?? false;
                $component['icon'] = $component['icon'] ?? 'fa-puzzle-piece';
                
                $components_array[] = $component;
            }
            
            // Format categories array
            $categories_array = array();
            foreach ($categories as $cat_name => $cat_components) {
                $categories_array[] = array(
                    'slug' => $cat_name,
                    'name' => ucfirst($cat_name),
                    'description' => ucfirst($cat_name) . ' components'
                );
            }
            
            // Fallback components if none found
            if (empty($components_array)) {
                $components_array = $this->get_fallback_components();
            }
            
            $result = array(
                'components' => $components_array,
                'categories' => $categories_array,
                'total' => count($components_array),
                'timestamp' => time(),
                'source' => 'php_discovery',
                'pure_vue' => true
            );
            
            wp_send_json_success($result);
            
        } catch (Exception $e) {
            $fallback_result = array(
                'components' => $this->get_fallback_components(),
                'categories' => array(
                    array(
                        'slug' => 'essential',
                        'name' => 'Essential',
                        'description' => 'Essential components'
                    )
                ),
                'total' => 1,
                'timestamp' => time(),
                'source' => 'fallback',
                'error' => $e->getMessage()
            );
            
            wp_send_json_success($fallback_result);
        }
    }

    /**
     * Get fallback components when discovery fails
     */
    private function get_fallback_components() {
        return array(
            array(
                'type' => 'hero',
                'name' => 'Hero Section',
                'title' => 'Hero Section',
                'description' => 'Main header section with title and bio',
                'category' => 'essential',
                'premium' => false,
                'icon' => 'fa-star'
            ),
            array(
                'type' => 'biography',
                'name' => 'Biography',
                'title' => 'Biography',
                'description' => 'Professional biography section',
                'category' => 'essential',
                'premium' => false,
                'icon' => 'fa-user'
            ),
            array(
                'type' => 'topics',
                'name' => 'Topics',
                'title' => 'Speaking Topics',
                'description' => 'Areas of expertise and speaking topics',
                'category' => 'essential',
                'premium' => false,
                'icon' => 'fa-lightbulb'
            )
        );
    }

    /**
     * AJAX: Clear component cache
     */
    public function ajax_clear_component_cache() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }
        
        if (isset($_POST['nonce']) && !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
            wp_send_json_error('Security verification failed');
            return;
        }
        
        // Get component discovery instance
        if (!$this->component_discovery) {
            $plugin = GMKB_Plugin::get_instance();
            $this->component_discovery = $plugin->get_component_discovery();
        }
        
        try {
            $this->component_discovery->clearCache();
            
            wp_send_json_success(array(
                'message' => 'Component cache cleared successfully',
                'timestamp' => time()
            ));
        } catch (Exception $e) {
            wp_send_json_error('Failed to clear cache: ' . $e->getMessage());
        }
    }

    /**
     * AJAX: Refresh components
     */
    public function ajax_refresh_components() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }
        
        if (isset($_POST['nonce']) && !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
            wp_send_json_error('Security verification failed');
            return;
        }
        
        // Get component discovery instance
        if (!$this->component_discovery) {
            $plugin = GMKB_Plugin::get_instance();
            $this->component_discovery = $plugin->get_component_discovery();
        }
        
        try {
            $categories = $this->component_discovery->forceRefresh();
            $components = $this->component_discovery->getComponents();
            
            wp_send_json_success(array(
                'message' => 'Components refreshed successfully',
                'components' => $components,
                'categories' => $categories,
                'total' => count($components),
                'timestamp' => time()
            ));
        } catch (Exception $e) {
            wp_send_json_error('Failed to refresh components: ' . $e->getMessage());
        }
    }

    /**
     * ARCHITECTURE FIX: Update individual Pods field
     * Allows direct updates to Pods data (single source of truth)
     */
    public function ajax_update_pods_field() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
            wp_send_json_error(array('message' => 'Security verification failed'));
            return;
        }
        
        // Check user permissions
        if (!current_user_can('edit_posts')) {
            wp_send_json_error(array('message' => 'Insufficient permissions'));
            return;
        }
        
        // Get parameters
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        $field_name = isset($_POST['field_name']) ? sanitize_text_field($_POST['field_name']) : '';
        $field_value = isset($_POST['field_value']) ? wp_kses_post($_POST['field_value']) : '';
        
        // Validate parameters
        if (empty($post_id) || empty($field_name)) {
            wp_send_json_error(array('message' => 'Missing required parameters'));
            return;
        }
        
        // Verify post exists and is correct type
        $post = get_post($post_id);
        // ARCHITECTURE FIX: Accept both 'mkcg' and 'guests' post types
        if (!$post || !in_array($post->post_type, array('mkcg', 'guests'))) {
            wp_send_json_error(array('message' => 'Invalid post'));
            return;
        }
        
        // Update the post meta (Pods field)
        $result = update_post_meta($post_id, $field_name, $field_value);
        
        if ($result !== false) {
            // Success - meta was updated or already had this value
            wp_send_json_success(array(
                'message' => 'Pods field updated successfully',
                'field_name' => $field_name,
                'field_value' => $field_value,
                'post_id' => $post_id,
                'timestamp' => time()
            ));
        } else {
            // This could mean the value was the same or an error occurred
            // Check if the current value matches what we're trying to set
            $current_value = get_post_meta($post_id, $field_name, true);
            if ($current_value === $field_value) {
                wp_send_json_success(array(
                    'message' => 'Pods field already has this value',
                    'field_name' => $field_name,
                    'field_value' => $field_value,
                    'post_id' => $post_id,
                    'timestamp' => time(),
                    'was_same' => true
                ));
            } else {
                wp_send_json_error(array(
                    'message' => 'Failed to update Pods field',
                    'field_name' => $field_name,
                    'current_value' => $current_value,
                    'attempted_value' => $field_value
                ));
            }
        }
    }
}
