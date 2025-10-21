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
        // ROOT FIX: Hook into WordPress template selection system with HIGHEST priority
        // Priority 999 ensures we run AFTER the theme and can override its template
        add_filter('template_include', array($this, 'route_media_kit_template'), 999);
        
        // ROOT FIX: Also try single_template filter which is more specific
        add_filter('single_template', array($this, 'route_media_kit_template'), 999);
        
        // ROOT FIX: And the post type specific filter
        add_filter('single_template_hierarchy', array($this, 'modify_template_hierarchy'), 10);
        
        // Enqueue frontend assets when media kit template is used
        add_action('wp_enqueue_scripts', array($this, 'enqueue_media_kit_assets'));
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB Template Router: Initialized with multiple filters');
        }
    }
    
    /**
     * ROOT FIX: Modify template hierarchy to prioritize media kit templates
     */
    public function modify_template_hierarchy($templates) {
        global $post;
        
        if (!$post || $post->post_type !== 'guests') {
            return $templates;
        }
        
        // Check if this post has media kit data
        $media_kit_state = get_post_meta($post->ID, 'gmkb_media_kit_state', true);
        
        if (!empty($media_kit_state) && (isset($media_kit_state['components']) || isset($media_kit_state['saved_components']))) {
            // Add our media kit template to the beginning of the hierarchy
            array_unshift($templates, 'mediakit-frontend-template.php');
            // Also add with single- prefix for WordPress compatibility
            array_unshift($templates, 'single-mediakit-display.php');
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Template Router: Modified template hierarchy for post ' . $post->ID);
            }
        }
        
        return $templates;
    }
    
    /**
     * PHASE 3: Route to PURE VUE template for builder pages
     * Uses builder-template-vue-pure.php for 100% Vue SPA
     * 
     * @param string $template Current template path
     * @return string Modified template path
     */
    public function route_media_kit_template($template) {
        // ROOT FIX: Check for media_kit_id query parameter for quick display
        if (isset($_GET['media_kit_id'])) {
            $post_id = intval($_GET['media_kit_id']);
            if ($post_id > 0) {
                // Override post query to display this media kit
                global $post, $wp_query;
                $post = get_post($post_id);
                if ($post && $post->post_type === 'guests') {
                    setup_postdata($post);
                    $media_kit_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
                    
                    if (!empty($media_kit_state) && (isset($media_kit_state['components']) || isset($media_kit_state['saved_components']))) {
                        $media_kit_template = GMKB_PLUGIN_DIR . 'templates/mediakit-frontend-template.php';
                        
                        if (file_exists($media_kit_template)) {
                            // Set globals for template use
                            $GLOBALS['gmkb_using_media_kit_template'] = true;
                            $GLOBALS['gmkb_media_kit_state'] = $media_kit_state;
                            $GLOBALS['gmkb_media_kit_post_id'] = $post_id;
                            
                            if (defined('WP_DEBUG') && WP_DEBUG) {
                                error_log('✅ GMKB: Loading media kit via query parameter - Post ID: ' . $post_id);
                            }
                            
                            return $media_kit_template;
                        }
                    }
                }
            }
        }
        
        // ROOT FIX: STRICT URL check - only load on media kit URLs
        // This prevents loading on other tools pages with post_id parameters
        $is_builder_page = false;
        
        if (isset($_SERVER['REQUEST_URI'])) {
            $uri = $_SERVER['REQUEST_URI'];
            
            // Only match /tools/media-kit/ URLs specifically
            if (preg_match('#/tools/media-kit/?($|\?|&)#', $uri)) {
                // Now check for builder parameters
                if (isset($_GET['mkcg_id']) || isset($_GET['post_id'])) {
                    $is_builder_page = true;
                }
            }
        }
        
        if ($is_builder_page) {
            $vue_pure_template = GMKB_PLUGIN_DIR . 'templates/builder-template-vue-pure.php';
            
            if (file_exists($vue_pure_template)) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('🎯 GMKB Phase 3: Using Pure Vue template for builder on /tools/media-kit/');
                }
                return $vue_pure_template;
            }
        } else if (defined('WP_DEBUG') && WP_DEBUG && (isset($_GET['mkcg_id']) || isset($_GET['post_id']))) {
            error_log('❌ GMKB: Not loading builder template - URL is not /tools/media-kit/. URI: ' . ($_SERVER['REQUEST_URI'] ?? 'unknown'));
        }
        // ROOT FIX: Debug current template being used
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB Template Router: Current template: ' . $template);
            error_log('GMKB Template Router: is_singular check: guests=' . (is_singular('guests') ? 'YES' : 'NO'));
        }
        
        // ROOT FIX: Check if this is a singular post of any type
        if (!is_singular()) {
            return $template;
        }
        
        // Get supported post types (guests and any others registered)
        $supported_post_types = apply_filters('gmkb_supported_post_types', array('guests'));
        
        // Check if current post type is supported
        $post_type = get_post_type();
        if (!in_array($post_type, $supported_post_types)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Template Router: Post type ' . $post_type . ' not supported for media kits');
            }
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
        
        // ROOT FIX: Use the media kit display template when media kit data exists
        // This is the PRIMARY template for displaying media kits on the frontend
        $media_kit_template = GMKB_PLUGIN_DIR . 'templates/mediakit-frontend-template.php';
            
        if (!file_exists($media_kit_template)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Template Router ERROR: Media kit template not found at: ' . $media_kit_template);
                error_log('GMKB Template Router: Falling back to theme template: ' . $template);
            }
            return $template;
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB Template Router: Using media kit display template');
            error_log('GMKB Template Router: Using: ' . $media_kit_template);
        }
        
        // Set globals for template use
        $GLOBALS['gmkb_using_media_kit_template'] = true;
        $GLOBALS['gmkb_media_kit_state'] = $media_kit_state;
        $GLOBALS['gmkb_media_kit_post_id'] = $post_id;
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            $component_count = count($media_kit_state['saved_components'] ?? $media_kit_state['components'] ?? []);
            error_log('GMKB Template Router: Rendering ' . $component_count . ' components');
            
            // ROOT FIX: Log sections if present
            if (!empty($media_kit_state['sections'])) {
                error_log('GMKB Template Router: Found ' . count($media_kit_state['sections']) . ' sections');
            }
        }
        
        return $media_kit_template;
    }
    
    /**
     * Enqueue assets for media kit display
     */
    public function enqueue_media_kit_assets() {
        // Only load assets if using media kit template
        if (empty($GLOBALS['gmkb_using_media_kit_template'])) {
            return;
        }
        
        // The enhanced frontend display class will handle asset enqueuing
        // This method is kept for backward compatibility
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB Template Router: Assets handled by GMKB_Frontend_Display class');
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

// ROOT FIX: Log that the router was loaded and verify filters are added
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('GMKB: Frontend Template Router file loaded and initialized at ' . current_action());
    
    // Verify our filters are registered
    add_action('init', function() {
        global $wp_filter;
        
        error_log('GMKB: Template router active at init hook');
        
        // Check if our filters are registered
        if (isset($wp_filter['template_include'])) {
            $found_our_filter = false;
            foreach ($wp_filter['template_include'] as $priority => $hooks) {
                foreach ($hooks as $hook) {
                    if (is_array($hook['function']) && isset($hook['function'][0])) {
                        if (is_object($hook['function'][0]) && get_class($hook['function'][0]) === 'GMKB_Frontend_Template_Router') {
                            error_log('GMKB: Found our template_include filter at priority ' . $priority);
                            $found_our_filter = true;
                        }
                    }
                }
            }
            if (!$found_our_filter) {
                error_log('GMKB ERROR: Our template_include filter is NOT registered!');
            }
        } else {
            error_log('GMKB ERROR: No template_include filters registered at all!');
        }
    }, 100);
}
