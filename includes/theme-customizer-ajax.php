<?php
/**
 * AJAX Handler for Theme Customizer
 * Phase 4.2: Save Custom Themes
 * 
 * Handles saving custom themes via AJAX
 * 
 * @package GMKB/Ajax
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register AJAX actions
 */
add_action('wp_ajax_gmkb_save_custom_theme', 'gmkb_save_custom_theme');
add_action('wp_ajax_gmkb_get_custom_themes', 'gmkb_get_custom_themes');
add_action('wp_ajax_gmkb_delete_custom_theme', 'gmkb_delete_custom_theme');

/**
 * Save custom theme
 */
function gmkb_save_custom_theme() {
    // Verify nonce
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
        wp_send_json_error(array('message' => 'Security check failed'));
        return;
    }
    
    // Check permissions
    if (!current_user_can('edit_posts')) {
        wp_send_json_error(array('message' => 'Insufficient permissions'));
        return;
    }
    
    // Get theme data
    $theme_json = isset($_POST['theme']) ? stripslashes($_POST['theme']) : '';
    $theme = json_decode($theme_json, true);
    
    if (!$theme || !isset($theme['theme_id']) || !isset($theme['theme_name'])) {
        wp_send_json_error(array('message' => 'Invalid theme data'));
        return;
    }
    
    // Sanitize theme data
    $theme['theme_id'] = sanitize_key($theme['theme_id']);
    $theme['theme_name'] = sanitize_text_field($theme['theme_name']);
    $theme['description'] = isset($theme['description']) ? sanitize_text_field($theme['description']) : '';
    
    // Get existing custom themes
    $custom_themes = get_option('gmkb_custom_themes', array());
    if (!is_array($custom_themes)) {
        $custom_themes = array();
    }
    
    // Add or update theme
    $custom_themes[$theme['theme_id']] = $theme;
    
    // Save to database
    $saved = update_option('gmkb_custom_themes', $custom_themes);
    
    if ($saved) {
        // Also save as current theme if requested
        if (isset($_POST['set_as_current']) && $_POST['set_as_current'] === 'true') {
            update_option('gmkb_current_theme', $theme['theme_id']);
        }
        
        wp_send_json_success(array(
            'message' => 'Theme saved successfully',
            'theme_id' => $theme['theme_id']
        ));
    } else {
        wp_send_json_error(array('message' => 'Failed to save theme'));
    }
}

/**
 * Get custom themes
 */
function gmkb_get_custom_themes() {
    // Verify nonce
    if (!isset($_GET['nonce']) || !wp_verify_nonce($_GET['nonce'], 'gmkb_nonce')) {
        wp_send_json_error(array('message' => 'Security check failed'));
        return;
    }
    
    // Get custom themes
    $custom_themes = get_option('gmkb_custom_themes', array());
    
    // Convert to indexed array for JavaScript
    $themes_array = array_values($custom_themes);
    
    wp_send_json_success(array(
        'themes' => $themes_array,
        'count' => count($themes_array)
    ));
}

/**
 * Delete custom theme
 */
function gmkb_delete_custom_theme() {
    // Verify nonce
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
        wp_send_json_error(array('message' => 'Security check failed'));
        return;
    }
    
    // Check permissions
    if (!current_user_can('edit_posts')) {
        wp_send_json_error(array('message' => 'Insufficient permissions'));
        return;
    }
    
    // Get theme ID
    $theme_id = isset($_POST['theme_id']) ? sanitize_key($_POST['theme_id']) : '';
    
    if (!$theme_id) {
        wp_send_json_error(array('message' => 'Invalid theme ID'));
        return;
    }
    
    // Get existing custom themes
    $custom_themes = get_option('gmkb_custom_themes', array());
    
    // Check if theme exists
    if (!isset($custom_themes[$theme_id])) {
        wp_send_json_error(array('message' => 'Theme not found'));
        return;
    }
    
    // Remove theme
    unset($custom_themes[$theme_id]);
    
    // Save to database
    $saved = update_option('gmkb_custom_themes', $custom_themes);
    
    if ($saved) {
        wp_send_json_success(array(
            'message' => 'Theme deleted successfully',
            'theme_id' => $theme_id
        ));
    } else {
        wp_send_json_error(array('message' => 'Failed to delete theme'));
    }
}

/**
 * Make custom themes available to ThemeDiscovery
 */
add_filter('gmkb_discovered_themes', 'gmkb_add_custom_themes_to_discovery');

function gmkb_add_custom_themes_to_discovery($themes) {
    $custom_themes = get_option('gmkb_custom_themes', array());
    
    foreach ($custom_themes as $theme_id => $theme) {
        // Format theme for discovery system
        $themes[$theme_id] = array(
            'theme_id' => $theme_id,
            'theme_name' => $theme['theme_name'],
            'description' => $theme['description'] ?? '',
            'version' => $theme['version'] ?? '1.0.0',
            'is_custom' => true,
            'colors' => $theme['colors'] ?? array(),
            'typography' => $theme['typography'] ?? array(),
            'spacing' => $theme['spacing'] ?? array(),
            'effects' => $theme['effects'] ?? array(),
            'created_at' => $theme['created_at'] ?? current_time('mysql'),
            'parent' => $theme['parent'] ?? null
        );
    }
    
    return $themes;
}