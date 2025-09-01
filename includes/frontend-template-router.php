<?php
/**
 * Frontend Template Router for Media Kit Display
 * 
 * ROOT IMPLEMENTATION: Conditional template loading based on media kit data
 * 
 * CHECKLIST COMPLIANCE:
 * ✅ No Polling: Direct template filter, no waiting loops
 * ✅ Event-Driven: Hooks into WordPress template hierarchy
 * ✅ Root Cause Fix: Solves display problem at template selection level
 * ✅ Simplicity First: Minimal code, leverages WordPress core
 * ✅ WordPress Integration: Uses proper template_include filter
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Frontend_Template_Router {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        // ROOT FIX: Hook into WordPress template selection system
        add_filter('template_include', array($this, 'route_media_kit_template'), 99);
        
        // Enqueue frontend assets when media kit template is used
        add_action('wp_enqueue_scripts', array($this, 'enqueue_media_kit_assets'));
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB Template Router: Initialized');
        }
    }
    
    /**
     * ROOT FIX: Route to media kit template if data exists
     * 
     * @param string $template Current template path
     * @return string Modified template path
     */
    public function route_media_kit_template($template) {
        // Only process for single guest posts
        if (!is_singular('guests')) {
            return $template;
        }
        
        // Get current post
        global $post;
        if (!$post || !isset($post->ID)) {
            return $template;
        }
        
        $post_id = $post->ID;
        
        // ROOT FIX: Check for media kit data presence
        $media_kit_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB Template Router: Checking post ' . $post_id);
            error_log('GMKB Template Router: Media kit data exists: ' . (!empty($media_kit_state) ? 'YES' : 'NO'));
        }
        
        // If no media kit data, use default template
        if (empty($media_kit_state)) {
            return $template;
        }
        
        // ROOT FIX: Validate media kit data has components
        $has_components = false;
        if (is_array($media_kit_state)) {
            // Check multiple possible component storage formats
            if (!empty($media_kit_state['saved_components'])) {
                $has_components = true;
            } elseif (!empty($media_kit_state['components'])) {
                $has_components = true;
            }
        }
        
        // If no components, fall back to traditional template
        if (!$has_components) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Template Router: Media kit exists but has no components - using default template');
            }
            return $template;
        }
        
        // Look for media kit template in theme
        $media_kit_template = locate_template('single-guests-mediakit.php');
        
        if ($media_kit_template) {
            // Set flag for asset loading
            $GLOBALS['gmkb_using_media_kit_template'] = true;
            $GLOBALS['gmkb_media_kit_state'] = $media_kit_state;
            $GLOBALS['gmkb_media_kit_post_id'] = $post_id;
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Template Router: Using media kit template for post ' . $post_id);
                $component_count = count($media_kit_state['saved_components'] ?? $media_kit_state['components'] ?? []);
                error_log('GMKB Template Router: Rendering ' . $component_count . ' components');
            }
            
            return $media_kit_template;
        }
        
        // Media kit template not found - log and use default
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB Template Router: Media kit template not found in theme - using default');
        }
        
        return $template;
    }
    
    /**
     * Enqueue assets for media kit display
     */
    public function enqueue_media_kit_assets() {
        // Only load assets if using media kit template
        if (empty($GLOBALS['gmkb_using_media_kit_template'])) {
            return;
        }
        
        // Enqueue media kit frontend CSS
        wp_enqueue_style(
            'gmkb-frontend-display',
            GMKB_PLUGIN_URL . 'css/frontend-mediakit.css',
            array(),
            GMKB_VERSION
        );
        
        // Enqueue component-specific styles
        wp_enqueue_style(
            'gmkb-components',
            GMKB_PLUGIN_URL . 'css/modules/components.css',
            array(),
            GMKB_VERSION
        );
        
        // Enqueue media kit frontend JS if needed
        wp_enqueue_script(
            'gmkb-frontend-display',
            GMKB_PLUGIN_URL . 'js/frontend-mediakit.js',
            array(),
            GMKB_VERSION,
            true
        );
        
        // Pass data to JavaScript
        wp_localize_script('gmkb-frontend-display', 'gmkbFrontend', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'postId' => $GLOBALS['gmkb_media_kit_post_id'] ?? 0,
            'nonce' => wp_create_nonce('gmkb_frontend'),
            'isMediaKit' => true
        ));
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB Template Router: Frontend assets enqueued');
        }
    }
    
    /**
     * Helper method to check if current post has media kit
     */
    public static function post_has_media_kit($post_id = null) {
        if (!$post_id) {
            $post_id = get_the_ID();
        }
        
        if (!$post_id) {
            return false;
        }
        
        $media_kit_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        
        if (empty($media_kit_state) || !is_array($media_kit_state)) {
            return false;
        }
        
        // Check for components in various formats
        return !empty($media_kit_state['saved_components']) || !empty($media_kit_state['components']);
    }
}

// Initialize the template router
GMKB_Frontend_Template_Router::get_instance();
