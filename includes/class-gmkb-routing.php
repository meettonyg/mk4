<?php
/**
 * Template Routing Class
 * 
 * Issue #13 FIX: Extracted from guestify-media-kit-builder.php
 * Handles template routing and builder page detection
 * 
 * @package Guestify
 * @since 4.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Template routing for GMKB
 */
class GMKB_Routing {

    private static $instance;

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
        add_action('wp', array($this, 'early_builder_check'), 1);
        add_action('template_redirect', array($this, 'isolated_builder_template_takeover'));
    }

    /**
     * Early builder check - Mark builder pages
     * Used by template router to identify builder pages
     */
    public function early_builder_check() {
        $is_builder_page = false;
        
        if (is_page('media-kit') || is_page('guestify-media-kit')) {
            $is_builder_page = true;
        } elseif (isset($_SERVER['REQUEST_URI'])) {
            $uri = $_SERVER['REQUEST_URI'];
            if (preg_match('#/tools/media-kit/?($|\?)#', $uri)) {
                $is_builder_page = true;
            }
        } elseif (is_admin() && isset($_GET['page']) && $_GET['page'] === 'guestify-media-kit-builder') {
            $is_builder_page = true;
        } elseif (isset($_GET['mkcg_id']) || isset($_GET['post_id'])) {
            $is_builder_page = true;
        }
        
        if ($is_builder_page) {
            global $gmkb_template_active;
            $gmkb_template_active = true;
        }
    }

    /**
     * Template takeover for isolated builder
     * P0 FIX #9: Pure Vue only - no PHP rendering
     */
    public function isolated_builder_template_takeover() {
        // P0 FIX #9: ALWAYS use Pure Vue - no PHP rendering
        // PHP template takeover completely removed in favor of Vue SPA
        // This maintains the hook for other plugins but doesn't render anything
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ P0 FIX #9: Template takeover disabled - Pure Vue only');
        }
        return;
        // P0 FIX #9: All template logic removed - Vue handles everything
        // The shortcode [guestify_media_kit] loads the Pure Vue template
    }
}

/**
 * Helper function to check if current page is builder
 */
if (!function_exists('is_media_kit_builder_page')) {
    function is_media_kit_builder_page() {
        global $gmkb_template_active;
        
        if ($gmkb_template_active === true) {
            return true;
        }
        
        $is_builder_page = false;
        
        if (is_page('media-kit') || is_page('guestify-media-kit')) {
            $is_builder_page = true;
        } elseif (isset($_SERVER['REQUEST_URI'])) {
            $uri = $_SERVER['REQUEST_URI'];
            if (preg_match('#/tools/media-kit/?($|\?)#', $uri)) {
                $is_builder_page = true;
            }
        } elseif (is_admin() && isset($_GET['page']) && $_GET['page'] === 'guestify-media-kit-builder') {
            $is_builder_page = true;
        } elseif (isset($_GET['mkcg_id']) && is_numeric($_GET['mkcg_id'])) {
            $is_builder_page = true;
        }
        
        return $is_builder_page;
    }
}
