<?php
/**
 * Debug endpoint to check database state
 * Add this to your main plugin file temporarily
 */

// Add this to guestify-media-kit-builder.php in the init_hooks() method:
/*
add_action('wp_ajax_gmkb_debug_check_database', array($this, 'debug_check_database'));
add_action('wp_ajax_nopriv_gmkb_debug_check_database', array($this, 'debug_check_database'));
*/

// Add this method to the class:
public function debug_check_database() {
    // Verify nonce
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
        wp_send_json_error('Invalid nonce');
        return;
    }
    
    $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
    
    if (!$post_id) {
        wp_send_json_error('No post ID provided');
        return;
    }
    
    // Get all meta for this post
    $all_meta = get_post_meta($post_id);
    
    // Get specific media kit state
    $media_kit_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
    
    // Get raw database value
    global $wpdb;
    $raw_value = $wpdb->get_var($wpdb->prepare(
        "SELECT meta_value FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key = %s",
        $post_id,
        'gmkb_media_kit_state'
    ));
    
    $debug_info = array(
        'post_id' => $post_id,
        'post_exists' => !!get_post($post_id),
        'post_type' => get_post_type($post_id),
        'post_title' => get_the_title($post_id),
        'has_media_kit_meta' => !empty($media_kit_state),
        'media_kit_state' => $media_kit_state,
        'components_count' => is_array($media_kit_state) && isset($media_kit_state['components']) ? count($media_kit_state['components']) : 0,
        'saved_components_count' => is_array($media_kit_state) && isset($media_kit_state['saved_components']) ? count($media_kit_state['saved_components']) : 0,
        'raw_value_length' => strlen($raw_value),
        'all_meta_keys' => array_keys($all_meta),
        'timestamp' => current_time('mysql'),
        'raw_value_preview' => substr($raw_value, 0, 200) . '...'
    );
    
    // Try to decode if it's serialized
    if ($raw_value) {
        $unserialized = @unserialize($raw_value);
        if ($unserialized !== false) {
            $debug_info['is_serialized'] = true;
            $debug_info['unserialized_type'] = gettype($unserialized);
        } else {
            $debug_info['is_serialized'] = false;
        }
    }
    
    wp_send_json_success($debug_info);
}
