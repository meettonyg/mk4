<?php
/**
 * Questions Component - Pods Data Integration
 * 
 * PHASE 1 ARCHITECTURAL FIX: Component-level data integration
 * Handles all questions data operations with single responsibility
 * 
 * @package Guestify/Components/Questions
 * @version 1.0.0-phase1-component-isolation
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Load abstract base class
if (!class_exists('Abstract_Component_Integration')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/Abstract_Component_Integration.php';
}

/**
 * Questions-specific Pods data integration
 * Handles all data operations for Questions component only
 */
class Questions_Pods_Integration extends Abstract_Component_Integration {
    
    /**
     * Component identifier
     */
    protected static $component_type = 'questions';
    
    /**
     * Pods field mappings for questions (up to 10 questions)
     */
    protected static $field_mappings = array(
        'question_1' => 'question_1',
        'question_2' => 'question_2',
        'question_3' => 'question_3',
        'question_4' => 'question_4',
        'question_5' => 'question_5',
        'question_6' => 'question_6',
        'question_7' => 'question_7',
        'question_8' => 'question_8',
        'question_9' => 'question_9',
        'question_10' => 'question_10'
    );
    
    /**
     * Load questions data from Pods fields only
     * Implementation of abstract method
     * 
     * @param int $post_id Post ID
     * @return array Questions data with metadata
     */
    public static function load_component_data($post_id) {
        return self::load_questions_data($post_id);
    }
    
    /**
     * Save questions data to Pods fields only
     * Implementation of abstract method
     * 
     * @param int $post_id Post ID
     * @param array $data Questions data to save
     * @return array Save result with metadata
     */
    public static function save_component_data($post_id, $data) {
        return self::save_questions_data($post_id, $data);
    }
    
    /**
     * Check if questions data exists for post
     * Implementation of abstract method
     * 
     * @param int $post_id Post ID
     * @return bool True if questions exist
     */
    public static function has_component_data($post_id) {
        return self::has_questions_data($post_id);
    }
    
    /**
     * PHASE 1 FIX: Load questions from Pods fields only
     * 
     * @param int $post_id Post ID
     * @return array Questions data with metadata
     */
    public static function load_questions_data($post_id) {
        $result = array(
            'questions' => array(),
            'count' => 0,
            'source' => 'pods_fields',
            'component_type' => self::$component_type,
            'success' => false,
            'message' => '',
            'quality' => 'empty',
            'timestamp' => current_time('mysql')
        );
        
        if (!self::validate_post_id($post_id)) {
            $result['message'] = 'Invalid post ID';
            return $result;
        }
        
        // Load from Pods fields only - single source of truth
        foreach (self::$field_mappings as $field_key => $meta_key) {
            $question_value = get_post_meta($post_id, $meta_key, true);
            
            if (!empty($question_value) && is_string($question_value)) {
                $cleaned_value = sanitize_text_field(trim($question_value));
                if (strlen($cleaned_value) > 0) {
                    $result['questions'][$field_key] = $cleaned_value;
                    $result['count']++;
                    $result['success'] = true;
                    
                    self::debug_log("Found {$field_key} = {$cleaned_value} for post {$post_id}");
                }
            }
            
            // Ensure field exists even if empty
            if (!isset($result['questions'][$field_key])) {
                $result['questions'][$field_key] = '';
            }
        }
        
        // Set quality assessment
        if ($result['success']) {
            $result['quality'] = self::assess_data_quality($result['questions']);
            $result['message'] = "Loaded {$result['count']} questions from Pods";
        } else {
            $result['message'] = "No questions found in Pods fields for post {$post_id}";
        }
        
        // Add metadata
        $result['meta'] = array(
            'generated_date' => get_post_meta($post_id, 'questions_generated_date', true),
            'category' => get_post_meta($post_id, 'questions_category', true),
            'max_questions' => count(self::$field_mappings)
        );
        
        self::debug_log($result['message']);
        
        return $result;
    }
    
    /**
     * PHASE 1 FIX: Save questions to Pods fields only
     * 
     * @param int $post_id Post ID
     * @param array $questions_data Questions data to save
     * @return array Save result with metadata
     */
    public static function save_questions_data($post_id, $questions_data) {
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
        
        if (!is_array($questions_data)) {
            $result['message'] = 'Invalid questions data format';
            return $result;
        }
        
        try {
            // Save to Pods fields only - single source of truth
            foreach (self::$field_mappings as $field_key => $meta_key) {
                $question_value = '';
                
                // Extract value from different possible input formats
                if (isset($questions_data['questions'][$field_key])) {
                    $question_value = $questions_data['questions'][$field_key];
                } elseif (isset($questions_data[$field_key])) {
                    $question_value = $questions_data[$field_key];
                } elseif (isset($questions_data[$meta_key])) {
                    $question_value = $questions_data[$meta_key];
                }
                
                // Handle array format (from AJAX)
                if (is_array($question_value)) {
                    $question_value = $question_value['question'] ?? $question_value['title'] ?? '';
                }
                
                // Sanitize and save
                $cleaned_value = self::sanitize_field_value($question_value);
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
            update_post_meta($post_id, 'questions_last_saved', current_time('mysql'));
            update_post_meta($post_id, 'questions_save_method', 'pods_component_integration');
            update_post_meta($post_id, 'questions_component_type', self::$component_type);
            
            $result['success'] = true;
            $result['message'] = "Successfully saved {$result['count']} questions to Pods";
            
            self::debug_log($result['message']);
            
        } catch (Exception $e) {
            $result['message'] = 'Save error: ' . $e->getMessage();
            self::debug_log("Save Error: " . $e->getMessage());
        }
        
        return $result;
    }
    
    /**
     * Check if questions data exists for post
     * 
     * @param int $post_id Post ID
     * @return bool True if questions exist
     */
    public static function has_questions_data($post_id) {
        if (!self::validate_post_id($post_id)) {
            return false;
        }
        
        // Check if any question field has data
        foreach (self::$field_mappings as $field_key => $meta_key) {
            $question_value = get_post_meta($post_id, $meta_key, true);
            if (!empty($question_value) && is_string($question_value) && strlen(trim($question_value)) > 0) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Get questions data availability info
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
            'data_source' => 'pods_fields',
            'max_questions' => count(self::$field_mappings),
            'utilization' => 0
        );
        
        if (!self::validate_post_id($post_id)) {
            return $result;
        }
        
        foreach (self::$field_mappings as $field_key => $meta_key) {
            $question_value = get_post_meta($post_id, $meta_key, true);
            $has_data = !empty($question_value) && is_string($question_value) && strlen(trim($question_value)) > 0;
            
            if ($has_data) {
                $result['field_count']++;
                $result['has_data'] = true;
            } else {
                $result['empty_fields']++;
            }
        }
        
        // Calculate utilization percentage
        $result['utilization'] = $result['max_questions'] > 0 ? 
            round(($result['field_count'] / $result['max_questions']) * 100) : 0;
        
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
            $question_value = get_post_meta($post_id, $meta_key, true);
            if (!empty($question_value)) {
                $content_parts[] = $meta_key . ':' . $question_value;
            }
        }
        
        return md5(implode('|', $content_parts));
    }
    
    /**
     * Assess data quality
     * 
     * @param array $questions Questions data
     * @return string Quality level
     */
    private static function assess_data_quality($questions) {
        $non_empty = array_filter($questions, function($question) {
            return !empty($question) && strlen(trim($question)) > 0;
        });
        
        $count = count($non_empty);
        $total = count(self::$field_mappings);
        
        if ($count === 0) return 'empty';
        if ($count >= 8) return 'excellent';
        if ($count >= 5) return 'good';
        if ($count >= 3) return 'fair';
        return 'poor';
    }
}

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ PHASE 1: Questions Pods Integration loaded - Component-level data integration');
}
