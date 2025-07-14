<?php
/**
 * EMERGENCY AJAX HANDLER FIX
 * Add this to functions.php if AJAX handlers aren't working
 */

// Emergency AJAX handler registration
if (!has_action('wp_ajax_load_stored_topics')) {
    add_action('wp_ajax_load_stored_topics', 'emergency_load_stored_topics');
    add_action('wp_ajax_nopriv_load_stored_topics', 'emergency_load_stored_topics');
}

function emergency_load_stored_topics() {
    // Verify nonce
    if (!wp_verify_nonce($_POST['nonce'] ?? '', 'guestify_media_kit_builder')) {
        wp_send_json_error('Invalid nonce');
        return;
    }
    
    $post_id = intval($_POST['post_id'] ?? 0);
    
    if ($post_id <= 0) {
        wp_send_json_error('Invalid post ID');
        return;
    }
    
    // Get topics directly from meta
    $topics = [];
    $meta_formats = ['mkcg_topic_', 'topic_', 'topics_', '_topic_'];
    
    foreach ($meta_formats as $format) {
        for ($i = 1; $i <= 5; $i++) {
            $meta_key = $format . $i;
            $value = get_post_meta($post_id, $meta_key, true);
            if (!empty($value)) {
                $topics["topic_{$i}"] = [
                    'value' => sanitize_text_field($value),
                    'meta_key' => $meta_key,
                    'source' => 'emergency_handler'
                ];
            }
        }
        
        if (!empty($topics)) {
            break; // Found topics with this format
        }
    }
    
    wp_send_json_success([
        'topics' => $topics,
        'post_id' => $post_id,
        'total_topics' => count($topics),
        'handler' => 'emergency',
        'timestamp' => time()
    ]);
}
