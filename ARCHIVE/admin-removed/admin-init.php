<?php
/**
 * Admin initialization file
 * Ensures admin components are loaded at the right time
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Hook into WordPress init to ensure everything is ready
add_action('init', function() {
    if (is_admin()) {
        // Debug log
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB: Admin init - loading admin viewer');
        }
        
        // Include admin viewer if not already loaded
        if (!class_exists('GMKB_Admin_Media_Kit_Viewer')) {
            $viewer_file = GUESTIFY_PLUGIN_DIR . 'admin/media-kit-viewer.php';
            if (file_exists($viewer_file)) {
                require_once $viewer_file;
                
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('GMKB: Admin viewer loaded from init hook');
                }
            }
        }
    }
}, 5); // Early priority to ensure it loads before admin_menu

// Also try loading directly if we're in admin
if (is_admin() && !class_exists('GMKB_Admin_Media_Kit_Viewer')) {
    $viewer_file = GUESTIFY_PLUGIN_DIR . 'admin/media-kit-viewer.php';
    if (file_exists($viewer_file)) {
        require_once $viewer_file;
    }
}
