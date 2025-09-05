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
