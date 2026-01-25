<?php
/**
 * Brand Kits Manager Shortcode
 *
 * Renders the Vue Brand Kits Manager app
 *
 * Usage: [gmkb_brand_kits]
 *
 * @package GMKB
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register the brand kits shortcode
 */
function gmkb_register_brand_kits_shortcode() {
    add_shortcode('gmkb_brand_kits', 'gmkb_brand_kits_shortcode_handler');
}
add_action('init', 'gmkb_register_brand_kits_shortcode');

/**
 * Brand kits shortcode handler
 *
 * @param array $atts Shortcode attributes
 * @return string HTML output
 */
function gmkb_brand_kits_shortcode_handler($atts) {
    // Parse attributes
    $atts = shortcode_atts([
        'id' => null, // Optional: open specific brand kit for editing
    ], $atts, 'gmkb_brand_kits');

    // Check permissions - must be logged in
    if (!is_user_logged_in()) {
        return '<div class="gmkb-error">Please log in to manage brand kits</div>';
    }

    // Must have edit_posts capability
    if (!current_user_can('edit_posts')) {
        return '<div class="gmkb-error">You do not have permission to manage brand kits</div>';
    }

    // Enqueue assets
    gmkb_enqueue_brand_kits_assets($atts['id']);

    // Return mount element
    $data_attrs = '';
    if ($atts['id']) {
        $data_attrs = sprintf(' data-brand-kit-id="%d"', esc_attr($atts['id']));
    }

    return sprintf(
        '<div id="gmkb-brand-kits-app"%s></div>',
        $data_attrs
    );
}

/**
 * Enqueue brand kits manager assets
 *
 * @param int|null $brand_kit_id Optional brand kit ID to open
 */
function gmkb_enqueue_brand_kits_assets($brand_kit_id = null) {
    $plugin_url = plugin_dir_url(dirname(dirname(__FILE__)));
    $plugin_path = plugin_dir_path(dirname(dirname(__FILE__)));
    $dist_path = $plugin_path . 'dist/brand-kits/';

    // Check if built files exist
    $js_file = $dist_path . 'gmkb-brand-kits.iife.js';
    $css_file = $dist_path . 'gmkb-brand-kits.css';

    if (!file_exists($js_file)) {
        // Development mode - provide feedback
        add_action('wp_footer', function() {
            echo '<script>console.error("GMKB Brand Kits: Build files not found. Run: npm run build:brand-kits");</script>';
        });
        return;
    }

    $version = filemtime($js_file);

    // Enqueue CSS
    if (file_exists($css_file)) {
        wp_enqueue_style(
            'gmkb-brand-kits',
            $plugin_url . 'dist/brand-kits/gmkb-brand-kits.css',
            [],
            filemtime($css_file)
        );
    }

    // Enqueue JS
    wp_enqueue_script(
        'gmkb-brand-kits',
        $plugin_url . 'dist/brand-kits/gmkb-brand-kits.iife.js',
        [],
        $version,
        true
    );

    // Enqueue WordPress media library
    wp_enqueue_media();

    // Pass data to JavaScript
    wp_localize_script('gmkb-brand-kits', 'gmkbBrandKitsData', [
        'brandKitId' => $brand_kit_id,
        'nonce' => wp_create_nonce('wp_rest'),
        'apiUrl' => rest_url(),
        'userId' => get_current_user_id(),
        'isAdmin' => current_user_can('edit_others_posts'),
    ]);
}
