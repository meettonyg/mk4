<?php
/**
 * Topics Component - Pods Data Integration
 * 
 * PHASE 1 ARCHITECTURAL FIX: Component-level data integration
 * Follows single responsibility principle and component isolation
 * 
 * @package Guestify/Components/Topics
 * @version 1.0.0-phase1-component-isolation
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Load abstract base class
if (!class_exists('Abstract_Component_Integration')) {
    // ROOT FIX: Use plugin_dir_path instead of undefined constant
    $base_path = plugin_dir_path(dirname(dirname(__FILE__))) . 'system/Abstract_Component_Integration.php';
    if (file_exists($base_path)) {
        require_once $base_path;
    }
}

/**
 * Topics-specific Pods data integration
 * Handles all data operations for Topics component only
 */
class Topics_Pods_Integration extends Abstract_Component_Integration {
    
    /**
     * Component identifier
     */
    protected static $component_type = 'topics';
    
    /**
     * Pods field mappings for topics
     */
    protected static $field_mappings = array(
        'topic_1' => 'topic_1',
        'topic_2' => 'topic_2', 
        'topic_3' => 'topic_3',
        'topic_4' => 'topic_4',
        'topic_5' => 'topic_5'
    );
    
    /**
     * PHASE 1 FIX: Load topics from Pods fields only
     * Implementation of abstract method
     * 
     * @param int $post_id Post ID
     * @return array Topics data with metadata
     */
    public static function load_component_data($post_id) {
        return self::load_topics_data($post_id);
    }
    
    /**
     * PHASE 1 FIX: Save topics to Pods fields only
     * Implementation of abstract method
     * 
     * @param int $post_id Post ID
     * @param array $data Component data to save
     * @return array Save result with metadata
     */
    public static function save_component_data($post_id, $data) {
        return self::save_topics_data($post_id, $data);
    }
    
    /**
     * Implementation of abstract method
     * Check if topics data exists for post
     * 
     * @param int $post_id Post ID
     * @return bool True if topics exist
     */
    public static function has_component_data($post_id) {
        return self::has_topics_data($post_id);
    }
    
    /**
     * PHASE 1 FIX: Load topics from Pods fields only
     * 
     * @param int $post_id Post ID
     * @return array Topics data with metadata
     */
    public static function load_topics_data($post_id) {
        $result = array(
            'topics' => array(),
            'count' => 0,
            'source' => 'pods_fields',
            'component_type' => self::$component_type,
            'success' => false,
            'message' => '',
            'quality' => 'empty',
            'timestamp' => current_time('mysql')
        );
        
        // ROOT FIX: Ensure we have a valid post ID
        if (empty($post_id)) {
            $result['message'] = 'No post ID provided';
            return $result;
        }
        
        if (!self::validate_post_id($post_id)) {
            $result['message'] = 'Invalid post ID';
            return $result;
        }
        
        // Load from Pods fields only - single source of truth
        foreach (self::$field_mappings as $field_key => $meta_key) {
            $topic_value = get_post_meta($post_id, $meta_key, true);
            
            if (!empty($topic_value) && is_string($topic_value)) {
                $cleaned_value = sanitize_text_field(trim($topic_value));
                if (strlen($cleaned_value) > 0) {
                    $result['topics'][$field_key] = $cleaned_value;
                    $result['count']++;
                    $result['success'] = true;
                    
                    self::debug_log("Found {$field_key} = {$cleaned_value} for post {$post_id}");
                }
            }
            
            // Ensure field exists even if empty
            if (!isset($result['topics'][$field_key])) {
                $result['topics'][$field_key] = '';
            }
        }
        
        // Set quality assessment
        if ($result['success']) {
            $result['quality'] = self::assess_data_quality($result['topics']);
            $result['message'] = "Loaded {$result['count']} topics from Pods fields";
        } else {
            $result['message'] = "No topics found in Pods fields for post {$post_id}";
        }
        
        self::debug_log($result['message']);
        
        return $result;
    }
    
    /**
     * PHASE 1 FIX: Save topics to Pods fields only
     * 
     * @param int $post_id Post ID
     * @param array $topics_data Topics data to save
     * @return array Save result with metadata
     */
    public static function save_topics_data($post_id, $topics_data) {
        $result = array(
            'success' => false,
            'count' => 0,
            'message' => '',
            'component_type' => self::$component_type,
            'method' => 'pods_single_source',
            'timestamp' => current_time('mysql'),
            'operations' => array()
        );
        
        if (!self::validate_post_id($post_id)) {
            $result['message'] = 'Invalid post ID';
            return $result;
        }
        
        if (!is_array($topics_data)) {
            $result['message'] = 'Invalid topics data format';
            return $result;
        }
        
        try {
            // Save to Pods fields only - single source of truth
            foreach (self::$field_mappings as $field_key => $meta_key) {
                $topic_value = '';
                
                // Extract value from different possible input formats
                if (isset($topics_data[$field_key])) {
                    $topic_value = $topics_data[$field_key];
                } elseif (isset($topics_data[$meta_key])) {
                    $topic_value = $topics_data[$meta_key];
                }
                
                // Handle array format (from AJAX)
                if (is_array($topic_value)) {
                    $topic_value = $topic_value['title'] ?? '';
                }
                
                // Sanitize and save
                $cleaned_value = self::sanitize_field_value($topic_value);
                $save_result = update_post_meta($post_id, $meta_key, $cleaned_value);
                
                $result['operations'][] = array(
                    'field' => $field_key,
                    'meta_key' => $meta_key,
                    'value' => $cleaned_value,
                    'success' => $save_result !== false
                );
                
                if (!empty($cleaned_value)) {
                    $result['count']++;
                }
            }
            
            // Save metadata
            update_post_meta($post_id, 'topics_last_saved', current_time('mysql'));
            update_post_meta($post_id, 'topics_save_method', 'pods_component_integration');
            update_post_meta($post_id, 'topics_component_type', self::$component_type);
            
            $result['success'] = true;
            $result['message'] = "Successfully saved {$result['count']} topics to Pods fields";
            
            self::debug_log($result['message']);
            
        } catch (Exception $e) {
            $result['message'] = 'Save error: ' . $e->getMessage();
            self::debug_log("Save Error: " . $e->getMessage());
        }
        
        return $result;
    }
    
    /**
     * Check if topics data exists for post
     * 
     * @param int $post_id Post ID
     * @return bool True if topics exist
     */
    public static function has_topics_data($post_id) {
        if (!self::validate_post_id($post_id)) {
            return false;
        }
        
        // Check if any topic field has data
        foreach (self::$field_mappings as $field_key => $meta_key) {
            $topic_value = get_post_meta($post_id, $meta_key, true);
            if (!empty($topic_value) && is_string($topic_value) && strlen(trim($topic_value)) > 0) {
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
            'field_count' => 0,
            'empty_fields' => 0,
            'component_type' => self::$component_type,
            'data_source' => 'pods_fields'
        );
        
        if (!self::validate_post_id($post_id)) {
            return $result;
        }
        
        foreach (self::$field_mappings as $field_key => $meta_key) {
            $topic_value = get_post_meta($post_id, $meta_key, true);
            if (!empty($topic_value) && is_string($topic_value) && strlen(trim($topic_value)) > 0) {
                $result['field_count']++;
                $result['has_data'] = true;
            } else {
                $result['empty_fields']++;
            }
        }
        
        return $result;
    }
    
    /**
     * Calculate content hash for change detection
     * 
     * @param int $post_id Post ID
     * @return string Content hash
     */
    public static function calculate_content_hash($post_id) {
        if (!self::validate_post_id($post_id)) {
            return '';
        }
        
        $content_parts = array();
        
        foreach (self::$field_mappings as $field_key => $meta_key) {
            $topic_value = get_post_meta($post_id, $meta_key, true);
            if (!empty($topic_value)) {
                $content_parts[] = $meta_key . ':' . $topic_value;
            }
        }
        
        return md5(implode('|', $content_parts));
    }
    
    /**
     * Assess data quality
     * 
     * @param array $topics Topics data
     * @return string Quality level
     */
    private static function assess_data_quality($topics) {
        $non_empty = array_filter($topics, function($topic) {
            return !empty($topic) && strlen(trim($topic)) > 0;
        });
        
        $count = count($non_empty);
        
        if ($count === 0) return 'empty';
        if ($count >= 4) return 'excellent';
        if ($count >= 3) return 'good';
        if ($count >= 2) return 'fair';
        return 'poor';
    }
}

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ PHASE 1: Topics Pods Integration loaded - Component-level data integration');
}
