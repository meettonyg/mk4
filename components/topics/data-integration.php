<?php
/**
 * Topics Component - Data Integration
 * 
 * COMPLIANT: Generic data-integration.php pattern for Topics component
 * Handles all data operations for Topics component
 * 
 * @package Guestify/Components/Topics
 * @version 1.0.0-compliant
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Topics Data Integration
 * COMPLIANT: Uses generic class naming pattern: {Component}_Data_Integration
 */
class Topics_Data_Integration {
    
    /**
     * Component identifier
     */
    protected static $component_type = 'topics';
    
    /**
     * Pods field mappings for topics
     * The Media Kit Content Generator saves to topic_1 through topic_5
     */
    protected static $field_mappings = array(
        'topic_1' => 'topic_1',
        'topic_2' => 'topic_2',
        'topic_3' => 'topic_3',
        'topic_4' => 'topic_4',
        'topic_5' => 'topic_5',
        // Additional topic metadata fields
        'topics_title' => 'topics_title',
        'topics_subtitle' => 'topics_subtitle',
        'topics_description' => 'topics_description'
    );
    
    /**
     * Validate post ID
     */
    protected static function validate_post_id($post_id) {
        return is_numeric($post_id) && $post_id > 0;
    }
    
    /**
     * Debug logging
     */
    protected static function debug_log($message) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('[Topics_Data_Integration] ' . $message);
        }
    }
    
    /**
     * Load topics data from Pods fields
     * 
     * @param int $post_id Post ID
     * @return array Topics data with metadata
     */
    public static function load_component_data($post_id) {
        $result = array(
            'topics' => array(),
            'count' => 0,
            'source' => 'pods_fields',
            'component_type' => self::$component_type,
            'success' => false,
            'message' => '',
            'timestamp' => current_time('mysql')
        );
        
        if (!self::validate_post_id($post_id)) {
            $result['message'] = 'Invalid post ID';
            return $result;
        }
        
        // Load topics from topic_1 through topic_5
        $topics_found = 0;
        for ($i = 1; $i <= 5; $i++) {
            $topic_value = get_post_meta($post_id, "topic_{$i}", true);
            
            if (!empty($topic_value) && is_string($topic_value)) {
                $cleaned_value = sanitize_text_field(trim($topic_value));
                if (strlen($cleaned_value) > 0) {
                    // Parse topic format: "Title: Description" or just "Title"
                    $topic_data = self::parse_topic_string($cleaned_value, $i);
                    $result['topics'][] = $topic_data;
                    $topics_found++;
                    $result['success'] = true;
                    
                    self::debug_log("Found topic_{$i}: " . substr($cleaned_value, 0, 50) . "...");
                }
            }
        }
        
        // Load optional metadata fields
        $result['title'] = get_post_meta($post_id, 'topics_title', true) ?: 'Speaking Topics';
        $result['subtitle'] = get_post_meta($post_id, 'topics_subtitle', true) ?: '';
        $result['description'] = get_post_meta($post_id, 'topics_description', true) ?: '';
        
        $result['count'] = $topics_found;
        
        if ($result['success']) {
            $result['message'] = "Loaded {$topics_found} topics from Pods fields";
        } else {
            $result['message'] = "No topics found for post {$post_id}";
        }
        
        self::debug_log($result['message']);
        
        return $result;
    }
    
    /**
     * Parse topic string into structured data
     * Handles formats like "Topic Title: Topic description here"
     * 
     * @param string $topic_string Raw topic string
     * @param int $index Topic index (1-5)
     * @return array Structured topic data
     */
    private static function parse_topic_string($topic_string, $index) {
        $topic_data = array(
            'id' => 'topic_' . $index,
            'index' => $index,
            'raw' => $topic_string,
            'title' => '',
            'description' => '',
            'priority' => $index // Lower index = higher priority
        );
        
        // Check if the topic has a colon separator for title:description format
        if (strpos($topic_string, ':') !== false) {
            list($title, $description) = explode(':', $topic_string, 2);
            $topic_data['title'] = trim($title);
            $topic_data['description'] = trim($description);
        } else {
            // No separator, treat entire string as title
            $topic_data['title'] = $topic_string;
            $topic_data['description'] = '';
        }
        
        // Also provide alternative field names for template compatibility
        $topic_data['topic_title'] = $topic_data['title'];
        $topic_data['topic_description'] = $topic_data['description'];
        
        return $topic_data;
    }
    
    /**
     * Prepare template props from component data
     * Formats the data for use in the topics template
     * 
     * @param array $component_data Data from load_component_data
     * @param array $existing_props Existing props to merge with
     * @return array Props ready for template
     */
    public static function prepare_template_props($component_data, $existing_props = array()) {
        $props = $existing_props;
        
        if (!empty($component_data['success']) && !empty($component_data['topics'])) {
            // Pass topics array to template
            $props['topics'] = $component_data['topics'];
            $props['topics_count'] = count($component_data['topics']);
            
            // Pass metadata
            $props['title'] = $component_data['title'] ?? 'Speaking Topics';
            $props['subtitle'] = $component_data['subtitle'] ?? '';
            $props['description'] = $component_data['description'] ?? '';
            
            // Additional props for template flexibility
            $props['has_topics'] = !empty($component_data['topics']);
            $props['layout'] = $existing_props['layout'] ?? 'grid'; // Default to grid layout
            $props['columns'] = $existing_props['columns'] ?? 3; // Default to 3 columns
        } else {
            // No topics found, provide empty structure
            $props['topics'] = array();
            $props['topics_count'] = 0;
            $props['title'] = 'Speaking Topics';
            $props['has_topics'] = false;
        }
        
        return $props;
    }
    
    /**
     * Save topics data to Pods fields
     * 
     * @param int $post_id Post ID
     * @param array $topics_data Topics data to save
     * @return array Save result with metadata
     */
    public static function save_component_data($post_id, $topics_data) {
        $result = array(
            'success' => false,
            'count' => 0,
            'message' => '',
            'component_type' => self::$component_type,
            'timestamp' => current_time('mysql')
        );
        
        if (!self::validate_post_id($post_id)) {
            $result['message'] = 'Invalid post ID';
            return $result;
        }
        
        if (!is_array($topics_data)) {
            $result['message'] = 'Invalid topics data format';
            return $result;
        }
        
        // Save topics to topic_1 through topic_5
        $topics = isset($topics_data['topics']) ? $topics_data['topics'] : $topics_data;
        
        for ($i = 1; $i <= 5; $i++) {
            $meta_key = "topic_{$i}";
            
            if (isset($topics[$i - 1])) {
                $topic = $topics[$i - 1];
                
                // Format topic string
                if (is_array($topic)) {
                    $topic_string = $topic['title'] ?? '';
                    if (!empty($topic['description'])) {
                        $topic_string .= ': ' . $topic['description'];
                    }
                } else {
                    $topic_string = $topic;
                }
                
                $cleaned_value = sanitize_text_field(trim($topic_string));
                update_post_meta($post_id, $meta_key, $cleaned_value);
                
                if (!empty($cleaned_value)) {
                    $result['count']++;
                }
            } else {
                // Clear empty topic slots
                delete_post_meta($post_id, $meta_key);
            }
        }
        
        // Save metadata if provided
        if (isset($topics_data['title'])) {
            update_post_meta($post_id, 'topics_title', sanitize_text_field($topics_data['title']));
        }
        if (isset($topics_data['subtitle'])) {
            update_post_meta($post_id, 'topics_subtitle', sanitize_text_field($topics_data['subtitle']));
        }
        if (isset($topics_data['description'])) {
            update_post_meta($post_id, 'topics_description', sanitize_textarea_field($topics_data['description']));
        }
        
        // Save metadata
        update_post_meta($post_id, 'topics_last_saved', current_time('mysql'));
        
        $result['success'] = true;
        $result['message'] = "Successfully saved {$result['count']} topics to Pods fields";
        
        self::debug_log($result['message']);
        
        return $result;
    }
    
    /**
     * Check if topics data exists for post
     * 
     * @param int $post_id Post ID
     * @return bool True if topics exist
     */
    public static function has_component_data($post_id) {
        if (!self::validate_post_id($post_id)) {
            return false;
        }
        
        // Check if any topic field has data
        for ($i = 1; $i <= 5; $i++) {
            $topic_value = get_post_meta($post_id, "topic_{$i}", true);
            if (!empty($topic_value) && strlen(trim($topic_value)) > 0) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Get topics data availability info
     * 
     * @param int $post_id Post ID
     * @return array Availability information
     */
    public static function get_data_availability($post_id) {
        $result = array(
            'has_data' => false,
            'topics_count' => 0,
            'empty_slots' => 0,
            'component_type' => self::$component_type,
            'data_source' => 'pods_fields'
        );
        
        if (!self::validate_post_id($post_id)) {
            return $result;
        }
        
        for ($i = 1; $i <= 5; $i++) {
            $topic_value = get_post_meta($post_id, "topic_{$i}", true);
            if (!empty($topic_value) && strlen(trim($topic_value)) > 0) {
                $result['topics_count']++;
                $result['has_data'] = true;
            } else {
                $result['empty_slots']++;
            }
        }
        
        return $result;
    }
}

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ COMPLIANT: Topics Data Integration loaded - Generic data-integration.php pattern');
}
