<?php
/**
 * Profile List Shortcode
 *
 * Renders the Vue Profile List app showing all user's profiles
 *
 * Usage: [gmkb_profiles]
 *
 * @package GMKB
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register the profile list shortcode
 */
function gmkb_register_profile_list_shortcode() {
    add_shortcode('gmkb_profiles', 'gmkb_profile_list_shortcode_handler');
}
add_action('init', 'gmkb_register_profile_list_shortcode');

/**
 * Profile list shortcode handler
 *
 * @param array $atts Shortcode attributes
 * @return string HTML output
 */
function gmkb_profile_list_shortcode_handler($atts) {
    // Check permissions
    if (!is_user_logged_in()) {
        return '<div class="gmkb-error">Please log in to view your profiles</div>';
    }

    // Enqueue assets
    gmkb_enqueue_profile_list_assets();

    // Return mount element
    return '<div id="gmkb-profile-list-app"></div>';
}

/**
 * Enqueue profile list assets
 */
function gmkb_enqueue_profile_list_assets() {
    $plugin_url = plugin_dir_url(dirname(dirname(__FILE__)));
    $plugin_path = plugin_dir_path(dirname(dirname(__FILE__)));
    $dist_path = $plugin_path . 'dist/profile-list/';

    // Check if built files exist
    $js_file = $dist_path . 'gmkb-profile-list.iife.js';
    $css_file = $dist_path . 'gmkb-profile-list.css';

    if (!file_exists($js_file)) {
        // Development mode - load from src
        add_action('wp_footer', function() {
            echo '<script>console.error("GMKB Profile List: Build files not found. Run: npm run build:profile-list");</script>';
        });
        return;
    }

    $version = filemtime($js_file);

    // Enqueue CSS
    if (file_exists($css_file)) {
        wp_enqueue_style(
            'gmkb-profile-list',
            $plugin_url . 'dist/profile-list/gmkb-profile-list.css',
            [],
            filemtime($css_file)
        );
    }

    // Enqueue JS
    wp_enqueue_script(
        'gmkb-profile-list',
        $plugin_url . 'dist/profile-list/gmkb-profile-list.iife.js',
        [],
        $version,
        true
    );

    // Pass data to JavaScript
    wp_localize_script('gmkb-profile-list', 'gmkbProfileListData', [
        'nonce' => wp_create_nonce('wp_rest'),
        'apiUrl' => rest_url(),
        'userId' => get_current_user_id(),
        'isAdmin' => current_user_can('edit_others_posts'),
        'createUrl' => '/app/profiles/guest/profile/',
    ]);
}
