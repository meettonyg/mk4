<?php
/**
 * Script and Style Enqueuing for Guestify Media Kit Builder
 *
 * @package Guestify
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Check if we're on the isolated Media Kit Builder template
 * 
 * @return bool True if on the isolated template
 */
function guestify_is_isolated_template() {
    global $template;
    return basename($template) === 'page-media-kit-builder.php';
}

/**
 * Enqueue scripts and styles for the Media Kit Builder
 * IMPORTANT: This function doesn't affect the isolated template because it doesn't use wp_head/wp_footer
 */
function guestify_media_kit_builder_enqueue_scripts() {
    // Skip if we're on the isolated template (it handles its own scripts)
    if (guestify_is_isolated_template()) {
        return;
    }
    
    // Get plugin URLs - fix the paths to match actual file structure
    $plugin_dir = plugin_dir_path(dirname(__FILE__));
    $plugin_url = plugin_dir_url(dirname(__FILE__));
    $version = defined('GUESTIFY_VERSION') ? GUESTIFY_VERSION : '2.0.0';
    
    // Only enqueue on relevant pages
    if (!is_page('media-kit-builder') && 
        !(isset($_GET['page']) && $_GET['page'] === 'guestify-media-kit-builder')) {
        return;
    }
    
    // Debug the paths to help troubleshooting
    error_log('Plugin URL for standard page: ' . $plugin_url);
    error_log('CSS Path for standard page: ' . $plugin_url . 'css/guestify-builder.css');
    
    // Register and enqueue styles - FIXED PATH
    wp_register_style(
        'guestify-media-kit-builder-styles',
        $plugin_url . 'css/guestify-builder.css', // Using the actual file name
        array(),
        $version
    );
    wp_enqueue_style('guestify-media-kit-builder-styles');
    
    // Load SortableJS from CDN
    wp_register_script(
        'sortable-js',
        'https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js',
        array(),
        null,
        true
    );
    wp_enqueue_script('sortable-js');
    
    // Register and enqueue main builder script - USING CORRECT FILENAME TO MATCH PRODUCTION
    wp_register_script(
        'guestify-builder-script',
        $plugin_url . 'js/guestify-builder.js', // Matching the production filename
        array('jquery', 'sortable-js'),
        $version,
        true
    );
    
    // Localize script with WordPress data
    wp_localize_script(
        'guestify-builder-script',
        'guestifyData',
        array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('guestify_media_kit_builder'),
            'restUrl' => esc_url_raw(rest_url()),
            'restNonce' => wp_create_nonce('wp_rest'),
            'isAdmin' => current_user_can('manage_options'),
            'isPro' => guestify_is_pro_active(),
            'isIsolated' => false,
            'pluginUrl' => $plugin_url,
            'userData' => array(
                'userId' => get_current_user_id(),
                'displayName' => wp_get_current_user()->display_name,
            ),
        )
    );

    // Enqueue the main script
    wp_enqueue_script('guestify-builder-script');
    
    // Add debugging
    wp_add_inline_script(
        'guestify-builder-script', 
        'console.log("Guestify Media Kit Builder loaded in standard mode");
         console.log("Plugin URL: ' . esc_js($plugin_url) . '");', 
        'before'
    );
}
add_action('wp_enqueue_scripts', 'guestify_media_kit_builder_enqueue_scripts');
add_action('admin_enqueue_scripts', 'guestify_media_kit_builder_enqueue_scripts');

/**
 * Enqueue scripts for the admin dashboard widget/page
 */
function guestify_admin_enqueue_scripts($hook) {
    // Only load on specific admin pages
    if ('toplevel_page_guestify-media-kit-builder' !== $hook && 'guestify_page_media-kit-builder-settings' !== $hook) {
        return;
    }

    // Enqueue the same scripts for admin pages
    guestify_media_kit_builder_enqueue_scripts();
}
add_action('admin_enqueue_scripts', 'guestify_admin_enqueue_scripts');

/**
 * Check if Guestify Pro is active
 *
 * @return bool
 */
function guestify_is_pro_active() {
    return defined('GUESTIFY_PRO_VERSION');
}
