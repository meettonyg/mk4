<?php
/**
 * Component Field Sync
 * Synchronizes component data with individual Pods custom fields
 * 
 * This ensures that when users edit components in the Media Kit Builder,
 * the changes are saved back to the original Pods custom fields.
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Component_Field_Sync {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        // Hook into the media kit save process
        add_action('gmkb_after_save_media_kit', array($this, 'sync_to_pods_fields'), 10, 2);
        
        // Add filter to modify save process
        add_filter('gmkb_before_save_state', array($this, 'prepare_field_sync'), 10, 2);
    }
    
    /**
     * Sync component data back to individual Pods fields
     * Called after media kit state is saved
     */
    public function sync_to_pods_fields($post_id, $state) {
        if (!$post_id || empty($state)) {
            return;
        }
        
        // Verify this is a guest post
        $post = get_post($post_id);
        if (!$post || $post->post_type !== 'guests') {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Field Sync: Post ' . $post_id . ' is not a guest post, skipping field sync');
            }
            return;
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB Field Sync: Starting sync for post ' . $post_id);
        }
        
        // Process each component and sync relevant fields
        if (isset($state['components']) && is_array($state['components'])) {
            foreach ($state['components'] as $component_id => $component) {
                $this->sync_component_fields($post_id, $component);
            }
        }
        
        // Also process saved_components if available
        if (isset($state['saved_components']) && is_array($state['saved_components'])) {
            foreach ($state['saved_components'] as $component) {
                $this->sync_component_fields($post_id, $component);
            }
        }
    }
    
    /**
     * Sync individual component fields based on component type
     */
    private function sync_component_fields($post_id, $component) {
        if (!isset($component['type'])) {
            return;
        }
        
        $type = $component['type'];
        $props = $component['props'] ?? $component['data'] ?? array();
        
        switch ($type) {
            case 'hero':
                $this->sync_hero_fields($post_id, $props);
                break;
                
            case 'biography':
                $this->sync_biography_fields($post_id, $props);
                break;
                
            case 'topics':
                $this->sync_topics_fields($post_id, $props);
                break;
                
            case 'contact':
                $this->sync_contact_fields($post_id, $props);
                break;
                
            case 'questions':
                $this->sync_questions_fields($post_id, $props);
                break;
                
            // Add more component types as needed
        }
    }
    
    /**
     * Sync hero component fields
     */
    private function sync_hero_fields($post_id, $props) {
        $fields_to_sync = array(
            'name' => 'first_name',
            'lastName' => 'last_name', 
            'title' => 'guest_title',
            'tagline' => 'tagline',
            'headshot' => 'guest_headshot'
        );
        
        foreach ($fields_to_sync as $prop_key => $field_name) {
            if (isset($props[$prop_key]) && !empty($props[$prop_key])) {
                update_post_meta($post_id, $field_name, $props[$prop_key]);
                
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('GMKB Field Sync: Updated ' . $field_name . ' for post ' . $post_id);
                }
            }
        }
    }
    
    /**
     * Sync biography component fields
     */
    private function sync_biography_fields($post_id, $props) {
        // Main biography field
        if (isset($props['bio']) && !empty($props['bio'])) {
            update_post_meta($post_id, 'biography', $props['bio']);
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Field Sync: Updated biography for post ' . $post_id);
            }
        }
        
        // Short biography
        if (isset($props['shortBio']) && !empty($props['shortBio'])) {
            update_post_meta($post_id, 'biography_short', $props['shortBio']);
        }
    }
    
    /**
     * Sync topics component fields
     */
    private function sync_topics_fields($post_id, $props) {
        // Topics can be in different formats
        $topics = array();
        
        // Check for topics array
        if (isset($props['topics']) && is_array($props['topics'])) {
            $topics = $props['topics'];
        }
        // Check for loaded_topics
        elseif (isset($props['loaded_topics']) && is_array($props['loaded_topics'])) {
            $topics = $props['loaded_topics'];
        }
        // Check for individual topic fields
        else {
            for ($i = 1; $i <= 5; $i++) {
                if (isset($props["topic_$i"])) {
                    $topics[] = $props["topic_$i"];
                }
            }
        }
        
        // Save topics to individual fields
        for ($i = 1; $i <= 5; $i++) {
            $topic_value = isset($topics[$i - 1]) ? $topics[$i - 1] : '';
            
            // Handle topic as array (might have title and description)
            if (is_array($topic_value)) {
                $topic_text = $topic_value['title'] ?? $topic_value['text'] ?? $topic_value['value'] ?? '';
            } else {
                $topic_text = $topic_value;
            }
            
            update_post_meta($post_id, "topic_$i", $topic_text);
            
            if (defined('WP_DEBUG') && WP_DEBUG && !empty($topic_text)) {
                error_log('GMKB Field Sync: Updated topic_' . $i . ' = "' . $topic_text . '" for post ' . $post_id);
            }
        }
    }
    
    /**
     * Sync contact component fields
     */
    private function sync_contact_fields($post_id, $props) {
        $fields_to_sync = array(
            'email' => 'email',
            'phone' => 'phone',
            'website' => 'website',
            'linkedin' => 'linkedin_url',
            'twitter' => 'twitter_url',
            'facebook' => 'facebook_url',
            'instagram' => 'instagram_url'
        );
        
        foreach ($fields_to_sync as $prop_key => $field_name) {
            if (isset($props[$prop_key]) && !empty($props[$prop_key])) {
                update_post_meta($post_id, $field_name, $props[$prop_key]);
                
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('GMKB Field Sync: Updated ' . $field_name . ' for post ' . $post_id);
                }
            }
        }
    }
    
    /**
     * Sync questions component fields
     */
    private function sync_questions_fields($post_id, $props) {
        // Questions can be in array format
        $questions = array();
        
        if (isset($props['questions']) && is_array($props['questions'])) {
            $questions = $props['questions'];
        } else {
            // Check for individual question fields
            for ($i = 1; $i <= 10; $i++) {
                if (isset($props["question_$i"])) {
                    $questions[] = $props["question_$i"];
                }
            }
        }
        
        // Save questions to individual fields
        for ($i = 1; $i <= 10; $i++) {
            $question_value = isset($questions[$i - 1]) ? $questions[$i - 1] : '';
            
            // Handle question as array
            if (is_array($question_value)) {
                $question_text = $question_value['question'] ?? $question_value['text'] ?? $question_value['value'] ?? '';
            } else {
                $question_text = $question_value;
            }
            
            update_post_meta($post_id, "question_$i", $question_text);
            
            if (defined('WP_DEBUG') && WP_DEBUG && !empty($question_text)) {
                error_log('GMKB Field Sync: Updated question_' . $i . ' for post ' . $post_id);
            }
        }
    }
    
    /**
     * Prepare field sync data before save
     */
    public function prepare_field_sync($state, $post_id) {
        // Add a flag to indicate field sync is needed
        $state['field_sync_enabled'] = true;
        $state['field_sync_timestamp'] = time();
        
        return $state;
    }
}

// Initialize the field sync system
GMKB_Component_Field_Sync::get_instance();

/**
 * Helper function to manually trigger field sync
 */
function gmkb_sync_media_kit_to_fields($post_id) {
    $state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
    if (!empty($state)) {
        $sync = GMKB_Component_Field_Sync::get_instance();
        $sync->sync_to_pods_fields($post_id, $state);
        return true;
    }
    return false;
}

/**
 * AJAX handler for manual field sync
 */
add_action('wp_ajax_gmkb_sync_fields', function() {
    check_ajax_referer('gmkb_nonce', 'nonce');
    
    $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
    if (!$post_id) {
        wp_send_json_error('Invalid post ID');
        return;
    }
    
    $result = gmkb_sync_media_kit_to_fields($post_id);
    
    if ($result) {
        wp_send_json_success(array(
            'message' => 'Fields synchronized successfully',
            'post_id' => $post_id
        ));
    } else {
        wp_send_json_error('No media kit data found to sync');
    }
});
