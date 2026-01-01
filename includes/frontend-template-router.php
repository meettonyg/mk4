<?php
/**
 * Frontend Template Router for Media Kit Display
 *
 * Conditional template loading based on media kit data
 *
 * CHECKLIST COMPLIANCE:
 * - No Polling: Direct template filter, no waiting loops
 * - Event-Driven: Hooks into WordPress template hierarchy
 * - Root Cause Fix: Solves display problem at template selection level
 * - Simplicity First: Minimal code, leverages WordPress core
 * - WordPress Integration: Uses proper template_include filter
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
        // Hook into WordPress template selection system with HIGHEST priority
        add_filter('template_include', array($this, 'route_media_kit_template'), 999);
        add_filter('single_template', array($this, 'route_media_kit_template'), 999);
        add_filter('single_template_hierarchy', array($this, 'modify_template_hierarchy'), 10);

        // Enqueue frontend assets when media kit template is used
        add_action('wp_enqueue_scripts', array($this, 'enqueue_media_kit_assets'));
    }

    /**
     * Modify template hierarchy to prioritize media kit templates
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
            array_unshift($templates, 'single-mediakit-display.php');
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
        // Check for media_kit_id query parameter for quick display
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

                            return $media_kit_template;
                        }
                    }
                }
            }
        }

        // STRICT URL check - only load on media kit URLs
        $is_builder_page = false;

        if (isset($_SERVER['REQUEST_URI'])) {
            $uri = $_SERVER['REQUEST_URI'];

            // Match /tools/media-kit/ URLs - with or without mkcg_id
            // When no ID is provided, load builder in "create new" mode
            // This allows non-registered users to create media kits
            if (preg_match('#/tools/media-kit/?($|\?|&)#', $uri)) {
                $is_builder_page = true;
            }
        }

        if ($is_builder_page) {
            $vue_pure_template = GMKB_PLUGIN_DIR . 'templates/builder-template-vue-pure.php';

            if (file_exists($vue_pure_template)) {
                return $vue_pure_template;
            }
        }

        // Check if this is a singular post of any type
        if (!is_singular()) {
            return $template;
        }

        // Get supported post types (guests and any others registered)
        $supported_post_types = apply_filters('gmkb_supported_post_types', array('guests'));

        // Check if current post type is supported
        $post_type = get_post_type();
        if (!in_array($post_type, $supported_post_types)) {
            return $template;
        }

        // Get current post
        global $post;
        if (!$post || !isset($post->ID)) {
            return $template;
        }

        $post_id = $post->ID;

        // Check for media kit data presence
        $media_kit_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);

        // If no media kit data, use default template
        if (empty($media_kit_state)) {
            return $template;
        }

        // Validate media kit data has components
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
            return $template;
        }

        // Use the media kit display template when media kit data exists
        $media_kit_template = GMKB_PLUGIN_DIR . 'templates/mediakit-frontend-template.php';

        if (!file_exists($media_kit_template)) {
            return $template;
        }

        // Set globals for template use
        $GLOBALS['gmkb_using_media_kit_template'] = true;
        $GLOBALS['gmkb_media_kit_state'] = $media_kit_state;
        $GLOBALS['gmkb_media_kit_post_id'] = $post_id;

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
