<?php
/**
 * EMERGENCY PLUGIN DISABLE for Media Kit Builder Page
 * Add this to your theme's functions.php or create as a must-use plugin
 * 
 * This disables problematic plugins ONLY on the media kit builder page
 * to test jQuery-free operation.
 */

function guestify_emergency_plugin_disable() {
    // Only run on media kit builder page
    if (!is_page('guestify-media-kit')) {
        return;
    }
    
    // EMERGENCY: Disable LearnPress on media kit page
    add_filter('option_active_plugins', function($plugins) {
        if (!is_array($plugins)) return $plugins;
        
        $problematic_plugins = [
            'learnpress/learnpress.php',
            'learn-press/learnpress.php', 
            'formidable/formidable.php',
            'formidable-pro/formidable-pro.php',
            'elementor/elementor.php',
            'elementor-pro/elementor-pro.php'
        ];
        
        foreach ($problematic_plugins as $plugin) {
            $key = array_search($plugin, $plugins);
            if ($key !== false) {
                unset($plugins[$key]);
                error_log("Emergency disabled plugin on media kit page: $plugin");
            }
        }
        
        return array_values($plugins);
    });
    
    // EMERGENCY: Disable WordPress emoji completely
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('wp_print_styles', 'print_emoji_styles');
    remove_filter('the_content_feed', 'wp_staticize_emoji');
    remove_filter('comment_text_rss', 'wp_staticize_emoji');
    
    // Log for debugging
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('EMERGENCY: Disabled problematic plugins on media kit builder page');
    }
}

// Run very early to catch plugin loading
add_action('plugins_loaded', 'guestify_emergency_plugin_disable', 1);
add_action('init', 'guestify_emergency_plugin_disable', 1);
