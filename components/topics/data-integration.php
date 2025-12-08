<?php
/**
 * Topics Component - Data Integration
 * 
 * PHASE 8: Uses native WordPress post_meta ONLY - NO Pods dependency
 * 
 * @package Guestify/Components/Topics
 * @version 3.0.0-native
 */

if (!defined('ABSPATH')) {
    exit;
}

class Topics_Data_Integration {
    
    protected static $component_type = 'topics';
    
    /**
     * Load topics data from native WordPress meta
     */
    public static function load_component_data($post_id) {
        $result = array(
            'topics' => array(),
            'count' => 0,
            'source' => 'native_meta',
            'component_type' => self::$component_type,
            'success' => false,
            'message' => '',
            'timestamp' => current_time('mysql')
        );
        
        if (!is_numeric($post_id) || $post_id <= 0) {
            $result['message'] = 'Invalid post ID';
            return $result;
        }
        
        // Load topics from topic_1 through topic_5
        for ($i = 1; $i <= 5; $i++) {
            $topic_value = get_post_meta($post_id, "topic_{$i}", true);
            
            if (!empty($topic_value)) {
                $topic_data = self::parse_topic_string(trim($topic_value), $i);
                $result['topics'][] = $topic_data;
                $result['count']++;
                $result['success'] = true;
            }
        }
        
        // Load optional metadata
        $result['title'] = get_post_meta($post_id, 'topics_title', true) ?: 'Speaking Topics';
        $result['subtitle'] = get_post_meta($post_id, 'topics_subtitle', true) ?: '';
        $result['description'] = get_post_meta($post_id, 'topics_description', true) ?: '';
        
        $result['message'] = $result['success'] 
            ? "Loaded {$result['count']} topics" 
            : "No topics found";
        
        return $result;
    }
    
    /**
     * Parse topic string into structured data
     * Handles "Title: Description" or just "Title"
     */
    private static function parse_topic_string($topic_string, $index) {
        $topic_data = array(
            'id' => 'topic_' . $index,
            'index' => $index,
            'title' => '',
            'description' => ''
        );
        
        if (strpos($topic_string, ':') !== false) {
            list($title, $description) = explode(':', $topic_string, 2);
            $topic_data['title'] = trim($title);
            $topic_data['description'] = trim($description);
        } else {
            $topic_data['title'] = $topic_string;
        }
        
        // Template compatibility - provide multiple field names
        $topic_data['name'] = $topic_data['title'];
        $topic_data['text'] = $topic_data['title'];
        
        return $topic_data;
    }
    
    /**
     * Save topics data to native WordPress meta
     */
    public static function save_component_data($post_id, $topics_data) {
        if (!is_numeric($post_id) || $post_id <= 0) {
            return array('success' => false, 'message' => 'Invalid post ID');
        }
        
        $topics = isset($topics_data['topics']) ? $topics_data['topics'] : $topics_data;
        $count = 0;
        
        for ($i = 1; $i <= 5; $i++) {
            $meta_key = "topic_{$i}";
            
            if (isset($topics[$i - 1])) {
                $topic = $topics[$i - 1];
                $topic_string = is_array($topic) 
                    ? ($topic['title'] ?? '') . (!empty($topic['description']) ? ': ' . $topic['description'] : '')
                    : $topic;
                
                update_post_meta($post_id, $meta_key, sanitize_text_field(trim($topic_string)));
                if (!empty($topic_string)) $count++;
            } else {
                delete_post_meta($post_id, $meta_key);
            }
        }
        
        return array('success' => true, 'count' => $count, 'message' => "Saved {$count} topics");
    }
    
    /**
     * Check if topics data exists
     */
    public static function has_component_data($post_id) {
        if (!is_numeric($post_id) || $post_id <= 0) {
            return false;
        }
        
        for ($i = 1; $i <= 5; $i++) {
            $topic = get_post_meta($post_id, "topic_{$i}", true);
            if (!empty($topic)) return true;
        }
        
        return false;
    }
    
    /**
     * Prepare template props
     */
    public static function prepare_template_props($component_data, $existing_props = array()) {
        $props = $existing_props;
        
        $props['topics'] = $component_data['topics'] ?? array();
        $props['topics_count'] = count($props['topics']);
        $props['has_topics'] = !empty($props['topics']);
        $props['title'] = $component_data['title'] ?? 'Speaking Topics';
        $props['subtitle'] = $component_data['subtitle'] ?? '';
        $props['description'] = $component_data['description'] ?? '';
        
        return $props;
    }
}

/**
 * Enrich topics props for frontend rendering
 */
add_filter('gmkb_enrich_topics_props', function($props, $post_id) {
    $topics_data = Topics_Data_Integration::load_component_data($post_id);
    
    if ($topics_data['success']) {
        $props = Topics_Data_Integration::prepare_template_props($topics_data, $props);
    }
    
    return $props;
}, 10, 2);
