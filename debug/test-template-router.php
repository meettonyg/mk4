<?php
/**
 * Debug Script: Test Template Router
 * 
 * This script tests if the template router is working correctly
 * Place this in your theme's functions.php temporarily
 */

// Test if the template router is being called
add_action('init', function() {
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('=== TEMPLATE ROUTER DEBUG ===');
        error_log('Current page: ' . (is_singular() ? 'singular' : 'not singular'));
        
        if (is_singular()) {
            global $post;
            if ($post) {
                error_log('Post type: ' . $post->post_type);
                error_log('Post ID: ' . $post->ID);
                
                // Check for media kit data
                $media_kit_state = get_post_meta($post->ID, 'gmkb_media_kit_state', true);
                error_log('Has media kit data: ' . (!empty($media_kit_state) ? 'YES' : 'NO'));
                
                if (!empty($media_kit_state)) {
                    error_log('Components count: ' . count($media_kit_state['components'] ?? []));
                    error_log('Sections count: ' . count($media_kit_state['sections'] ?? []));
                }
            }
        }
    }
}, 999);

// Test template selection
add_filter('template_include', function($template) {
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('=== TEMPLATE INCLUDE FILTER (Priority 9999) ===');
        error_log('Template being used: ' . $template);
        
        if (is_singular('guests')) {
            error_log('This IS a guests post');
            global $post;
            if ($post) {
                $media_kit_state = get_post_meta($post->ID, 'gmkb_media_kit_state', true);
                if (!empty($media_kit_state)) {
                    error_log('This post HAS media kit data - should use plugin template!');
                    error_log('Plugin template path would be: ' . GMKB_PLUGIN_DIR . 'templates/single-guests-mediakit-fallback.php');
                    error_log('File exists: ' . (file_exists(GMKB_PLUGIN_DIR . 'templates/single-guests-mediakit-fallback.php') ? 'YES' : 'NO'));
                }
            }
        }
    }
    return $template;
}, 9999);
