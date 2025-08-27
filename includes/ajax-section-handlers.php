<?php
/**
 * AJAX Handler for Section Operations
 * Handles saving sections and media kit state
 * 
 * @package GMKB
 * @version 1.0.0
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register AJAX handlers for section operations
 */
function gmkb_register_section_ajax_handlers() {
    // Save media kit (includes sections)
    add_action('wp_ajax_gmkb_save_media_kit', 'gmkb_handle_save_media_kit');
    add_action('wp_ajax_nopriv_gmkb_save_media_kit', 'gmkb_handle_save_media_kit_nopriv');
}
add_action('init', 'gmkb_register_section_ajax_handlers');

/**
 * Handle save media kit AJAX request
 */
function gmkb_handle_save_media_kit() {
    // Check nonce
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
        wp_send_json_error(array(
            'message' => 'Invalid nonce'
        ));
        return;
    }
    
    // Check capabilities
    if (!current_user_can('edit_posts')) {
        wp_send_json_error(array(
            'message' => 'Insufficient permissions'
        ));
        return;
    }
    
    // Get post ID
    $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
    
    if (!$post_id) {
        wp_send_json_error(array(
            'message' => 'Invalid post ID'
        ));
        return;
    }
    
    // Get state data
    $state = isset($_POST['state']) ? json_decode(stripslashes($_POST['state']), true) : array();
    
    if (!is_array($state)) {
        wp_send_json_error(array(
            'message' => 'Invalid state data'
        ));
        return;
    }
    
    // Save the state to post meta
    $updated = update_post_meta($post_id, 'gmkb_media_kit_state', $state);
    
    if ($updated !== false) {
        wp_send_json_success(array(
            'message' => 'Media kit saved successfully',
            'sections_count' => isset($state['sections']) ? count($state['sections']) : 0,
            'components_count' => isset($state['components']) ? count($state['components']) : 0,
            'post_id' => $post_id
        ));
    } else {
        wp_send_json_error(array(
            'message' => 'Failed to save media kit'
        ));
    }
}

/**
 * Handle non-privileged save request
 */
function gmkb_handle_save_media_kit_nopriv() {
    wp_send_json_error(array(
        'message' => 'Authentication required'
    ));
}

/**
 * Load sections from saved state
 */
function gmkb_get_saved_sections($post_id) {
    $state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
    
    if (!empty($state) && isset($state['sections'])) {
        return $state['sections'];
    }
    
    return array();
}

/**
 * Add sections data to localized script data
 */
function gmkb_add_sections_to_script_data($data) {
    if (isset($data['post_id']) && $data['post_id']) {
        $sections = gmkb_get_saved_sections($data['post_id']);
        $data['sections'] = $sections;
    }
    
    return $data;
}
add_filter('gmkb_script_data', 'gmkb_add_sections_to_script_data');