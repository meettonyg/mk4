<?php
/**
 * Questions Component - Data Integration
 * 
 * COMPLIANT: Generic data-integration.php pattern for Questions component
 * Handles all data operations for Questions component
 * 
 * @package Guestify/Components/Questions
 * @version 1.0.0-compliant
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Questions Data Integration
 * COMPLIANT: Uses generic class naming pattern: {Component}_Data_Integration
 */
class Questions_Data_Integration {
    
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
            error_log('[Questions_Data_Integration] ' . $message);
        }
    }
    
    /**
     * Load questions data from Pods fields
     * 
     * @param int $post_id Post ID
     * @return array Questions data with metadata
     */
    public static function load_component_data($post_id) {
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
        
        // Load from Pods fields
        foreach (self::$field_mappings as $field_key => $meta_key) {
            $question_value = get_post_meta($post_id, $meta_key, true);
            
            if (!empty($question_value) && is_string($question_value)) {
                $cleaned_value = sanitize_text_field(trim($question_value));
                if (strlen($cleaned_value) > 0) {
                    $result['questions'][] = array(
                        'id' => $field_key,
                        'question' => $cleaned_value,
                        'index' => (int) str_replace('question_', '', $field_key)
                    );
                    $result['count']++;
                    $result['success'] = true;
                    
                    self::debug_log("Found {$field_key}: {$cleaned_value}");
                }
            }
        }
        
        // Set quality assessment
        if ($result['success']) {
            $count = $result['count'];
            if ($count >= 8) $result['quality'] = 'excellent';
            elseif ($count >= 5) $result['quality'] = 'good';
            elseif ($count >= 3) $result['quality'] = 'fair';
            else $result['quality'] = 'poor';
            
            $result['message'] = "Loaded {$result['count']} questions from Pods";
        } else {
            $result['message'] = "No questions found for post {$post_id}";
        }
        
        self::debug_log($result['message']);
        
        return $result;
    }
    
    /**
     * Prepare template props from component data
     * 
     * @param array $component_data Data from load_component_data
     * @param array $existing_props Existing props to merge with
     * @return array Props ready for template
     */
    public static function prepare_template_props($component_data, $existing_props = array()) {
        $props = $existing_props;
        
        if (!empty($component_data['success']) && !empty($component_data['questions'])) {
            $props['questions'] = $component_data['questions'];
            $props['questions_count'] = count($component_data['questions']);
            $props['has_questions'] = true;
            $props['quality'] = $component_data['quality'];
        } else {
            $props['questions'] = array();
            $props['questions_count'] = 0;
            $props['has_questions'] = false;
            $props['quality'] = 'empty';
        }
        
        return $props;
    }
    
    /**
     * Save questions data to Pods fields
     * 
     * @param int $post_id Post ID
     * @param array $questions_data Questions data to save
     * @return array Save result with metadata
     */
    public static function save_component_data($post_id, $questions_data) {
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
        
        if (!is_array($questions_data)) {
            $result['message'] = 'Invalid questions data format';
            return $result;
        }
        
        $questions = isset($questions_data['questions']) ? $questions_data['questions'] : $questions_data;
        
        // Save to Pods fields
        $index = 1;
        foreach ($questions as $question) {
            if ($index > 10) break; // Max 10 questions
            
            $meta_key = "question_{$index}";
            $question_text = '';
            
            if (is_array($question)) {
                $question_text = $question['question'] ?? $question['text'] ?? '';
            } else {
                $question_text = $question;
            }
            
            $cleaned_value = sanitize_text_field(trim($question_text));
            
            if (!empty($cleaned_value)) {
                update_post_meta($post_id, $meta_key, $cleaned_value);
                $result['count']++;
            } else {
                delete_post_meta($post_id, $meta_key);
            }
            
            $index++;
        }
        
        // Clear remaining slots
        for ($i = $index; $i <= 10; $i++) {
            delete_post_meta($post_id, "question_{$i}");
        }
        
        update_post_meta($post_id, 'questions_last_saved', current_time('mysql'));
        
        $result['success'] = true;
        $result['message'] = "Successfully saved {$result['count']} questions to Pods";
        
        self::debug_log($result['message']);
        
        return $result;
    }
    
    /**
     * Check if questions data exists for post
     * 
     * @param int $post_id Post ID
     * @return bool True if questions exist
     */
    public static function has_component_data($post_id) {
        if (!self::validate_post_id($post_id)) {
            return false;
        }
        
        foreach (self::$field_mappings as $field_key => $meta_key) {
            $question_value = get_post_meta($post_id, $meta_key, true);
            if (!empty($question_value) && strlen(trim($question_value)) > 0) {
                return true;
            }
        }
        
        return false;
    }
}

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ COMPLIANT: Questions Data Integration loaded');
}

/**
 * ROOT FIX: Hook into component prop enrichment filter (ARCHITECTURE COMPLIANT)
 */
add_filter('gmkb_enrich_questions_props', function($props, $post_id) {
    // Load questions data using the Questions_Data_Integration class
    $questions_data = Questions_Data_Integration::load_component_data($post_id);
    
    if ($questions_data['success']) {
        // Prepare props using the class method
        $props = Questions_Data_Integration::prepare_template_props($questions_data, $props);
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ Questions: Enriched props for post ' . $post_id);
            error_log('   - Questions count: ' . count($props['questions']));
            error_log('   - Quality: ' . $props['quality']);
        }
    }
    
    return $props;
}, 10, 2);
