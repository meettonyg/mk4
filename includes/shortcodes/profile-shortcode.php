<?php
/**
 * Profile Editor Shortcode
 *
 * Renders the Vue Profile Editor app
 *
 * Usage: [gmkb_profile] or [gmkb_profile id="123"]
 *
 * @package GMKB
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register the profile editor shortcode
 */
function gmkb_register_profile_shortcode() {
    add_shortcode('gmkb_profile', 'gmkb_profile_shortcode_handler');
}
add_action('init', 'gmkb_register_profile_shortcode');

/**
 * Profile shortcode handler
 *
 * @param array $atts Shortcode attributes
 * @return string HTML output
 */
function gmkb_profile_shortcode_handler($atts) {
    // Parse attributes
    $atts = shortcode_atts([
        'id' => null,
    ], $atts, 'gmkb_profile');

    // Get post ID
    $post_id = $atts['id'];

    // If no ID provided, try to get from query var or current post
    if (!$post_id) {
        // Check for entry query var (from Formidable)
        $entry_key = isset($_GET['entry']) ? sanitize_text_field($_GET['entry']) : null;
        if ($entry_key) {
            // Look up post by entry key (slug)
            $post = get_page_by_path($entry_key, OBJECT, 'guests');
            if ($post) {
                $post_id = $post->ID;
            }
        }

        // Fall back to current post
        if (!$post_id) {
            $post_id = get_the_ID();
        }
    }

    // Validate post
    $post = get_post($post_id);
    if (!$post || $post->post_type !== 'guests') {
        return '<div class="gmkb-error">Profile not found</div>';
    }

    // Check permissions
    if (!is_user_logged_in()) {
        return '<div class="gmkb-error">Please log in to view this profile</div>';
    }

    $user_id = get_current_user_id();
    $owner_id = get_post_meta($post_id, 'owner_user_id', true);
    $can_view = current_user_can('edit_others_posts') ||
                ((int) $owner_id === $user_id) ||
                ((int) $post->post_author === $user_id);

    if (!$can_view) {
        return '<div class="gmkb-error">You do not have permission to view this profile</div>';
    }

    // Enqueue assets
    gmkb_enqueue_profile_assets($post_id);

    // Return mount element
    return sprintf(
        '<div id="gmkb-profile-app" data-post-id="%d"></div>',
        esc_attr($post_id)
    );
}

/**
 * Enqueue profile editor assets
 *
 * @param int $post_id Post ID
 */
function gmkb_enqueue_profile_assets($post_id) {
    $plugin_url = plugin_dir_url(dirname(dirname(__FILE__)));
    $plugin_path = plugin_dir_path(dirname(dirname(__FILE__)));
    $dist_path = $plugin_path . 'dist/profile/';

    // Check if built files exist
    $js_file = $dist_path . 'gmkb-profile.iife.js';
    $css_file = $dist_path . 'gmkb-profile.css';

    if (!file_exists($js_file)) {
        // Development mode - load from src
        // This won't work without a dev server, but provides feedback
        add_action('wp_footer', function() {
            echo '<script>console.error("GMKB Profile: Build files not found. Run: npm run build:profile");</script>';
        });
        return;
    }

    $version = filemtime($js_file);

    // Enqueue CSS
    if (file_exists($css_file)) {
        wp_enqueue_style(
            'gmkb-profile',
            $plugin_url . 'dist/profile/gmkb-profile.css',
            [],
            filemtime($css_file)
        );
    }

    // Enqueue JS
    wp_enqueue_script(
        'gmkb-profile',
        $plugin_url . 'dist/profile/gmkb-profile.iife.js',
        [],
        $version,
        true
    );

    // Pass data to JavaScript
    wp_localize_script('gmkb-profile', 'gmkbProfileData', [
        'postId' => $post_id,
        'nonce' => wp_create_nonce('wp_rest'),
        'apiUrl' => rest_url(),
        'userId' => get_current_user_id(),
        'isAdmin' => current_user_can('edit_others_posts'),
    ]);
}

/**
 * Add profile page rewrite rules
 */
function gmkb_profile_rewrite_rules() {
    // Add rewrite for /app/profiles/guest/profile/?entry=xxx
    add_rewrite_rule(
        '^app/profiles/guest/profile/?$',
        'index.php?pagename=app/profiles/guest/profile',
        'top'
    );
}
add_action('init', 'gmkb_profile_rewrite_rules');
