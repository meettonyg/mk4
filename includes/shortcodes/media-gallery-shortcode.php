<?php
/**
 * Media Gallery Shortcode
 *
 * Renders the Vue Media Gallery app - shows all media across all brand kits
 *
 * Usage: [gmkb_media_gallery]
 *
 * @package GMKB
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register the media gallery shortcode
 */
function gmkb_register_media_gallery_shortcode() {
    add_shortcode('gmkb_media_gallery', 'gmkb_media_gallery_shortcode_handler');
}
add_action('init', 'gmkb_register_media_gallery_shortcode');

/**
 * Media gallery shortcode handler
 *
 * @param array $atts Shortcode attributes
 * @return string HTML output
 */
function gmkb_media_gallery_shortcode_handler($atts) {
    // Parse attributes
    $atts = shortcode_atts([
        'category' => '', // Optional: filter by category (headshot, logo, photo, background)
    ], $atts, 'gmkb_media_gallery');

    // Check permissions - must be logged in
    if (!is_user_logged_in()) {
        return '<div class="gmkb-error">Please log in to view your media gallery</div>';
    }

    // Must have edit_posts capability
    if (!current_user_can('edit_posts')) {
        return '<div class="gmkb-error">You do not have permission to view the media gallery</div>';
    }

    // Enqueue assets
    gmkb_enqueue_media_gallery_assets($atts['category']);

    // Return mount element
    $data_attrs = '';
    if ($atts['category']) {
        $data_attrs = sprintf(' data-category="%s"', esc_attr($atts['category']));
    }

    return sprintf(
        '<div id="gmkb-media-gallery-app"%s></div>',
        $data_attrs
    );
}

/**
 * Enqueue media gallery assets
 *
 * @param string $category Optional category filter
 */
function gmkb_enqueue_media_gallery_assets($category = '') {
    $plugin_url = plugin_dir_url(dirname(dirname(__FILE__)));
    $plugin_path = plugin_dir_path(dirname(dirname(__FILE__)));
    $dist_path = $plugin_path . 'dist/media-gallery/';

    // Check if built files exist
    $js_file = $dist_path . 'gmkb-media-gallery.iife.js';
    $css_file = $dist_path . 'gmkb-media-gallery.css';

    if (!file_exists($js_file)) {
        // Development mode - provide feedback
        add_action('wp_footer', function() {
            echo '<script>console.error("GMKB Media Gallery: Build files not found. Run: npm run build:media-gallery");</script>';
        });
        return;
    }

    $version = filemtime($js_file);

    // Enqueue CSS
    if (file_exists($css_file)) {
        wp_enqueue_style(
            'gmkb-media-gallery',
            $plugin_url . 'dist/media-gallery/gmkb-media-gallery.css',
            [],
            filemtime($css_file)
        );
    }

    // Enqueue JS
    wp_enqueue_script(
        'gmkb-media-gallery',
        $plugin_url . 'dist/media-gallery/gmkb-media-gallery.iife.js',
        [],
        $version,
        true
    );

    // Enqueue WordPress media library
    wp_enqueue_media();

    // Pass data to JavaScript
    wp_localize_script('gmkb-media-gallery', 'gmkbMediaGalleryData', [
        'category' => $category,
        'nonce' => wp_create_nonce('wp_rest'),
        'apiUrl' => rest_url(),
        'userId' => get_current_user_id(),
        'isAdmin' => current_user_can('edit_others_posts'),
    ]);
}
