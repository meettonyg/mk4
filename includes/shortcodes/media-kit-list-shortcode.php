<?php
/**
 * Media Kit List Shortcode
 *
 * Renders the Vue Media Kit List app showing all user's media kits
 *
 * Usage: [gmkb_mediakits]
 *
 * @package GMKB
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register the media kit list shortcode
 */
function gmkb_register_media_kit_list_shortcode() {
    add_shortcode('gmkb_mediakits', 'gmkb_media_kit_list_shortcode_handler');
}
add_action('init', 'gmkb_register_media_kit_list_shortcode');

/**
 * Media kit list shortcode handler
 *
 * @param array $atts Shortcode attributes
 * @return string HTML output
 */
function gmkb_media_kit_list_shortcode_handler($atts) {
    // Parse attributes
    $atts = shortcode_atts([
        'show_create' => 'true',
    ], $atts, 'gmkb_mediakits');

    // Check permissions
    if (!is_user_logged_in()) {
        return '<div class="gmkb-error gmkb-media-kit-list-login-required">
            <p>Please log in to view your media kits.</p>
            <a href="' . esc_url(wp_login_url(get_permalink())) . '" class="gmkb-login-button">Log In</a>
        </div>';
    }

    // Enqueue assets
    gmkb_enqueue_media_kit_list_assets($atts);

    // Return mount element
    return '<div id="gmkb-media-kit-list-app"></div>';
}

/**
 * Enqueue media kit list assets
 *
 * @param array $atts Shortcode attributes
 */
function gmkb_enqueue_media_kit_list_assets($atts = []) {
    $plugin_url = plugin_dir_url(dirname(dirname(__FILE__)));
    $plugin_path = plugin_dir_path(dirname(dirname(__FILE__)));
    $dist_path = $plugin_path . 'dist/media-kit-list/';

    // Check if built files exist
    $js_file = $dist_path . 'gmkb-media-kit-list.iife.js';
    $css_file = $dist_path . 'gmkb-media-kit-list.css';

    if (!file_exists($js_file)) {
        // Development mode - show helpful error
        add_action('wp_footer', function() {
            echo '<script>console.error("GMKB Media Kit List: Build files not found. Run: npm run build:media-kit-list");</script>';
        });
        return;
    }

    $version = filemtime($js_file);

    // Enqueue CSS
    if (file_exists($css_file)) {
        wp_enqueue_style(
            'gmkb-media-kit-list',
            $plugin_url . 'dist/media-kit-list/gmkb-media-kit-list.css',
            [],
            filemtime($css_file)
        );
    }

    // Enqueue JS
    wp_enqueue_script(
        'gmkb-media-kit-list',
        $plugin_url . 'dist/media-kit-list/gmkb-media-kit-list.iife.js',
        [],
        $version,
        true
    );

    // Pass data to JavaScript
    wp_localize_script('gmkb-media-kit-list', 'gmkbMediaKitListData', [
        'nonce' => wp_create_nonce('wp_rest'),
        'apiUrl' => rest_url(),
        'userId' => get_current_user_id(),
        'isAdmin' => current_user_can('edit_others_posts'),
        'createUrl' => home_url('/templates/'),
        'showCreate' => $atts['show_create'] === 'true',
    ]);
}
