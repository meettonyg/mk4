<?php
/**
 * Topics Editor AJAX Save Handler
 * Saves topics directly to Pods custom fields
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Topics_Save_Handler {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        // SECURITY FIX: Remove nopriv action - only authenticated users can save topics
        add_action('wp_ajax_gmkb_save_topics_to_pods', array($this, 'save_topics_to_pods'));
    }

    public function save_topics_to_pods() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce(sanitize_text_field($_POST['nonce']), 'gmkb_nonce')) {
            wp_send_json_error('Invalid security token');
            return;
        }

        $post_id = isset($_POST['post_id']) ? absint($_POST['post_id']) : 0;

        // SECURITY FIX: Check user can edit this specific post
        if (!current_user_can('edit_post', $post_id)) {
            wp_send_json_error('You do not have permission to edit this post');
            return;
        }
        $topics_json = isset($_POST['topics']) ? stripslashes($_POST['topics']) : '[]';
        
        if (!$post_id) {
            wp_send_json_error('No post ID provided');
            return;
        }
        
        // Decode the topics array
        $topics = json_decode($topics_json, true);
        if (!is_array($topics)) {
            wp_send_json_error('Invalid topics data');
            return;
        }
        
        // Check if Pods is active
        if (!function_exists('pods')) {
            wp_send_json_error('Pods plugin is not active');
            return;
        }
        
        try {
            // Load the Pods object for this post
            $pods = pods('guest_media_kit', $post_id);
            
            if (!$pods || !$pods->exists()) {
                // Try with 'post' if guest_media_kit doesn't work
                $pods = pods('post', $post_id);
                
                if (!$pods || !$pods->exists()) {
                    wp_send_json_error('Could not load Pods data for post ' . $post_id);
                    return;
                }
            }
            
            // Save topics to individual Pods fields (topic_1 through topic_5)
            $saved_count = 0;
            for ($i = 1; $i <= 5; $i++) {
                $field_name = 'topic_' . $i;
                $value = isset($topics[$i - 1]) ? sanitize_text_field($topics[$i - 1]) : '';
                
                // Save the field
                $pods->save($field_name, $value);
                
                if ($value) {
                    $saved_count++;
                }
            }
            
            // Also save as a serialized array if there's a 'topics' field
            if ($pods->fields('topics')) {
                $pods->save('topics', $topics);
            }
            
            // Log the save for debugging
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Topics Save: Saved ' . $saved_count . ' topics to post ' . $post_id);
                error_log('GMKB Topics Save: Topics data: ' . print_r($topics, true));
            }
            
            wp_send_json_success(array(
                'message' => 'Topics saved successfully',
                'saved_count' => $saved_count,
                'post_id' => $post_id
            ));
            
        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Topics Save Error: ' . $e->getMessage());
            }
            
            wp_send_json_error('Error saving topics: ' . $e->getMessage());
        }
    }
}

// Initialize the handler
GMKB_Topics_Save_Handler::get_instance();
