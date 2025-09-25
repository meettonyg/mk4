<?php
/**
 * Theme AJAX Handlers
 * Phase 4: AJAX handlers for theme operations that aren't in the main generator class
 * 
 * @package GMKB/Includes
 * @since 4.0.0
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// The main theme AJAX handlers are in the GMKB_Theme_Generator class
// This file is for any additional theme-related AJAX handlers that might be needed

// Get discovered themes
add_action('wp_ajax_gmkb_get_discovered_themes', 'gmkb_ajax_get_discovered_themes');
add_action('wp_ajax_nopriv_gmkb_get_discovered_themes', 'gmkb_ajax_get_discovered_themes');
function gmkb_ajax_get_discovered_themes() {
    // Initialize theme discovery
    require_once plugin_dir_path(dirname(__FILE__)) . 'system/ThemeDiscovery.php';
    $theme_discovery = new ThemeDiscovery(plugin_dir_path(dirname(__FILE__)) . 'themes');
    
    // Get all themes
    $themes = $theme_discovery->getThemes();
    
    wp_send_json_success(array(
        'themes' => $themes,
        'count' => count($themes)
    ));
}

// ROOT FIX: Save theme preference
add_action('wp_ajax_gmkb_save_theme', 'gmkb_ajax_save_theme');
add_action('wp_ajax_nopriv_gmkb_save_theme', 'gmkb_ajax_save_theme');
function gmkb_ajax_save_theme() {
    // Verify nonce
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
        wp_send_json_error(array(
            'message' => 'Invalid nonce',
            'debug' => 'Nonce verification failed'
        ));
        return;
    }
    
    // Get theme ID from request
    $theme_id = isset($_POST['theme_id']) ? sanitize_text_field($_POST['theme_id']) : '';
    
    if (empty($theme_id)) {
        wp_send_json_error(array(
            'message' => 'No theme ID provided',
            'debug' => 'theme_id parameter missing'
        ));
        return;
    }
    
    // Get post ID if provided (for post-specific themes)
    $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
    
    // Save theme preference
    if ($post_id > 0) {
        // Save theme for specific post
        update_post_meta($post_id, 'gmkb_selected_theme', $theme_id);
        
        // Also update in the media kit state if it exists
        $state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        if (is_array($state)) {
            if (!isset($state['globalSettings'])) {
                $state['globalSettings'] = array();
            }
            $state['globalSettings']['theme'] = $theme_id;
            update_post_meta($post_id, 'gmkb_media_kit_state', $state);
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB: Theme saved for post ' . $post_id . ': ' . $theme_id);
        }
    } else {
        // Save global theme preference
        update_option('gmkb_current_theme', $theme_id);
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB: Global theme saved: ' . $theme_id);
        }
    }
    
    wp_send_json_success(array(
        'message' => 'Theme saved successfully',
        'theme_id' => $theme_id,
        'post_id' => $post_id,
        'saved_to' => $post_id > 0 ? 'post_meta' : 'global_option'
    ));
}

// ROOT FIX: Load saved theme preference
add_action('wp_ajax_gmkb_load_theme', 'gmkb_ajax_load_theme');
add_action('wp_ajax_nopriv_gmkb_load_theme', 'gmkb_ajax_load_theme');
function gmkb_ajax_load_theme() {
    // Verify nonce
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
        wp_send_json_error(array(
            'message' => 'Invalid nonce'
        ));
        return;
    }
    
    // Get post ID if provided
    $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
    
    $theme_id = '';
    
    if ($post_id > 0) {
        // Try to get post-specific theme first
        $theme_id = get_post_meta($post_id, 'gmkb_selected_theme', true);
        
        // If not found, check media kit state
        if (empty($theme_id)) {
            $state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
            if (is_array($state) && isset($state['globalSettings']['theme'])) {
                $theme_id = $state['globalSettings']['theme'];
            }
        }
    }
    
    // Fall back to global theme if no post-specific theme
    if (empty($theme_id)) {
        $theme_id = get_option('gmkb_current_theme', 'professional_clean');
    }
    
    wp_send_json_success(array(
        'theme_id' => $theme_id,
        'source' => $post_id > 0 ? 'post_specific' : 'global'
    ));
}

// ROOT FIX: Add missing custom themes loader
add_action('wp_ajax_gmkb_load_custom_themes', 'gmkb_load_custom_themes_handler');
add_action('wp_ajax_nopriv_gmkb_load_custom_themes', 'gmkb_load_custom_themes_handler');

function gmkb_load_custom_themes_handler() {
    // Security check - accept both nonces for compatibility
    $nonce = $_POST['nonce'] ?? $_REQUEST['nonce'] ?? '';
    if (!$nonce || (!wp_verify_nonce($nonce, 'gmkb_nonce') && !wp_verify_nonce($nonce, 'mkcg_nonce'))) {
        wp_send_json_error(array('message' => 'Security check failed'), 400);
        return;
    }
    
    // Capability check (optional - allow all logged-in users to view themes)
    if (!is_user_logged_in()) {
        wp_send_json_error(array('message' => 'User not logged in'), 403);
        return;
    }
    
    // Get custom themes from database
    $custom_themes = get_option('gmkb_custom_themes', array());
    
    // Ensure it's an array
    if (!is_array($custom_themes)) {
        $custom_themes = array();
    }
    
    // Return success with themes
    wp_send_json_success(array(
        'themes' => array_values($custom_themes), // Ensure indexed array
        'count' => count($custom_themes),
        'message' => 'Custom themes loaded successfully'
    ));
}

// ROOT FIX: Add missing save custom theme handler
add_action('wp_ajax_gmkb_save_custom_theme', 'gmkb_save_custom_theme_handler');
add_action('wp_ajax_nopriv_gmkb_save_custom_theme', 'gmkb_save_custom_theme_handler');

function gmkb_save_custom_theme_handler() {
    // Security check
    $nonce = $_POST['nonce'] ?? $_REQUEST['nonce'] ?? '';
    if (!$nonce || !wp_verify_nonce($nonce, 'gmkb_nonce')) {
        wp_send_json_error(array('message' => 'Security check failed'), 403);
        return;
    }
    
    // Capability check
    if (!current_user_can('edit_posts')) {
        wp_send_json_error(array('message' => 'Insufficient permissions'), 403);
        return;
    }
    
    // Get theme data
    $theme_json = isset($_POST['theme']) ? stripslashes($_POST['theme']) : '';
    if (empty($theme_json)) {
        wp_send_json_error(array('message' => 'No theme data provided'), 400);
        return;
    }
    
    // Parse and validate theme
    $theme = json_decode($theme_json, true);
    if (!$theme || !isset($theme['id']) || !isset($theme['colors'])) {
        wp_send_json_error(array('message' => 'Invalid theme data'), 400);
        return;
    }
    
    // Save to database
    $custom_themes = get_option('gmkb_custom_themes', array());
    if (!is_array($custom_themes)) {
        $custom_themes = array();
    }
    
    // Add or update theme
    $custom_themes[$theme['id']] = $theme;
    update_option('gmkb_custom_themes', $custom_themes);
    
    wp_send_json_success(array(
        'message' => 'Theme saved successfully',
        'theme' => $theme
    ));
}

// ROOT FIX: Add get custom themes handler with correct action name
add_action('wp_ajax_gmkb_get_custom_themes', 'gmkb_get_custom_themes_handler');
add_action('wp_ajax_nopriv_gmkb_get_custom_themes', 'gmkb_get_custom_themes_handler');

function gmkb_get_custom_themes_handler() {
    // This is an alias for gmkb_load_custom_themes_handler
    gmkb_load_custom_themes_handler();
}

// Example: Export all custom themes
add_action('wp_ajax_gmkb_export_all_themes', 'gmkb_ajax_export_all_themes');
function gmkb_ajax_export_all_themes() {
    // Verify user can manage themes
    if (!current_user_can('edit_themes')) {
        wp_send_json_error('Insufficient permissions');
        return;
    }
    
    // Verify nonce
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
        wp_send_json_error('Invalid nonce');
        return;
    }
    
    global $wpdb;
    
    // Get all custom themes
    $custom_themes = $wpdb->get_results(
        "SELECT option_name, option_value 
         FROM {$wpdb->options} 
         WHERE option_name LIKE 'gmkb_custom_theme_%'",
        ARRAY_A
    );
    
    $themes = array();
    foreach ($custom_themes as $theme_data) {
        $theme = maybe_unserialize($theme_data['option_value']);
        if (is_array($theme)) {
            $themes[] = $theme;
        }
    }
    
    wp_send_json_success(array(
        'themes' => $themes,
        'count' => count($themes)
    ));
}

// Example: Delete a custom theme
add_action('wp_ajax_gmkb_delete_theme', 'gmkb_ajax_delete_theme');
function gmkb_ajax_delete_theme() {
    // Verify user can manage themes
    if (!current_user_can('edit_themes')) {
        wp_send_json_error('Insufficient permissions');
        return;
    }
    
    // Verify nonce
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
        wp_send_json_error('Invalid nonce');
        return;
    }
    
    $theme_id = isset($_POST['theme_id']) ? sanitize_text_field($_POST['theme_id']) : '';
    
    if (!$theme_id || !preg_match('/^(custom_|imported_)/', $theme_id)) {
        wp_send_json_error('Invalid theme ID or cannot delete built-in themes');
        return;
    }
    
    // Delete the theme
    delete_option('gmkb_custom_theme_' . $theme_id);
    
    // If it's the current theme, reset to default
    if (get_option('gmkb_current_theme') === $theme_id) {
        update_option('gmkb_current_theme', 'professional_clean');
    }
    
    wp_send_json_success(array(
        'message' => 'Theme deleted successfully',
        'theme_id' => $theme_id
    ));
}
