<?php
/**
 * Biography Component - Data Integration
 * 
 * COMPLIANT: Generic data-integration.php pattern that all components can follow
 * Handles all data operations for Biography component
 * 
 * @package Guestify/Components/Biography
 * @version 2.0.0-compliant
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Biography Data Integration
 * COMPLIANT: Uses generic class naming pattern: {Component}_Data_Integration
 */
class Biography_Data_Integration {
    
    /**
     * Component identifier
     */
    protected static $component_type = 'biography';
    
    /**
     * Pods field mappings for biography
     */
    protected static $field_mappings = array(
        'name' => 'biography_name',
        'title' => 'biography_title',
        'organization' => 'biography_organization',
        'short' => 'biography_short',
        'medium' => 'biography_medium',
        'long' => 'biography_long',
        'tone' => 'biography_tone',
        'expertise' => 'biography_expertise',
        'achievements' => 'biography_achievements'
    );
    
    /**
     * ROOT FIX: Validate post ID
     */
    protected static function validate_post_id($post_id) {
        return is_numeric($post_id) && $post_id > 0;
    }
    
    /**
     * ROOT FIX: Debug logging
     */
    protected static function debug_log($message) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('[Biography_Pods_Integration] ' . $message);
        }
    }
    
    /**
     * Load biography data from Pods fields only
     * 
     * @param int $post_id Post ID
     * @return array Biography data with metadata
     */
    public static function load_component_data($post_id) {
        return self::load_biography_data($post_id);
    }
    
    /**
     * Save biography data to Pods fields only
     * 
     * @param int $post_id Post ID
     * @param array $data Biography data to save
     * @return array Save result with metadata
     */
    public static function save_component_data($post_id, $data) {
        return self::save_biography_data($post_id, $data);
    }
    
    /**
     * Check if biography data exists for post
     * 
     * @param int $post_id Post ID
     * @return bool True if biography exists
     */
    public static function has_component_data($post_id) {
        return self::has_biography_data($post_id);
    }
    
    /**
     * ROOT FIX: Load biography from Pods fields only
     * 
     * @param int $post_id Post ID
     * @return array Biography data with metadata
     */
    public static function load_biography_data($post_id) {
        $result = array(
            'biography' => array(),
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
            $bio_value = get_post_meta($post_id, $meta_key, true);
            
            if (!empty($bio_value) && is_string($bio_value)) {
                $cleaned_value = sanitize_textarea_field(trim($bio_value));
                if (strlen($cleaned_value) > 0) {
                    $result['biography'][$field_key] = $cleaned_value;
                    $result['count']++;
                    $result['success'] = true;
                    
                    self::debug_log("Found {$field_key} = " . substr($cleaned_value, 0, 50) . "... for post {$post_id}");
                }
            }
            
            // Ensure field exists even if empty
            if (!isset($result['biography'][$field_key])) {
                $result['biography'][$field_key] = '';
            }
        }
        
        // Set quality assessment
        if ($result['success']) {
            $result['quality'] = self::assess_data_quality($result['biography']);
            $result['message'] = "Loaded {$result['count']} biography fields from Pods";
        } else {
            $result['message'] = "No biography found in Pods fields for post {$post_id}";
        }
        
        // Add metadata
        $result['meta'] = array(
            'generated_date' => get_post_meta($post_id, 'biography_generated_date', true),
            'word_count' => isset($result['biography']['long']) ? str_word_count($result['biography']['long']) : 0,
            'tone_style' => get_post_meta($post_id, 'biography_tone_style', true)
        );
        
        self::debug_log($result['message']);
        
        return $result;
    }
    
    /**
     * Save biography to Pods fields only
     * 
     * @param int $post_id Post ID
     * @param array $biography_data Biography data to save
     * @return array Save result with metadata
     */
    public static function save_biography_data($post_id, $biography_data) {
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
        
        if (!is_array($biography_data)) {
            $result['message'] = 'Invalid biography data format';
            return $result;
        }
        
        try {
            // Save to Pods fields only - single source of truth
            foreach (self::$field_mappings as $field_key => $meta_key) {
                $bio_value = '';
                
                // Extract value from different possible input formats
                if (isset($biography_data['biography'][$field_key])) {
                    $bio_value = $biography_data['biography'][$field_key];
                } elseif (isset($biography_data[$field_key])) {
                    $bio_value = $biography_data[$field_key];
                } elseif (isset($biography_data[$meta_key])) {
                    $bio_value = $biography_data[$meta_key];
                }
                
                // Sanitize and save
                $cleaned_value = is_string($bio_value) ? sanitize_textarea_field(trim($bio_value)) : '';
                $save_result = update_post_meta($post_id, $meta_key, $cleaned_value);
                
                $result['operations'][] = array(
                    'field' => $field_key,
                    'meta_key' => $meta_key,
                    'value' => substr($cleaned_value, 0, 100) . (strlen($cleaned_value) > 100 ? '...' : ''),
                    'success' => $save_result !== false
                );
                
                if (!empty($cleaned_value)) {
                    $result['count']++;
                }
            }
            
            // Save metadata
            update_post_meta($post_id, 'biography_last_saved', current_time('mysql'));
            update_post_meta($post_id, 'biography_save_method', 'pods_component_integration');
            update_post_meta($post_id, 'biography_component_type', self::$component_type);
            
            $result['success'] = true;
            $result['message'] = "Successfully saved {$result['count']} biography fields to Pods";
            
            self::debug_log($result['message']);
            
        } catch (Exception $e) {
            $result['message'] = 'Save error: ' . $e->getMessage();
            self::debug_log("Save Error: " . $e->getMessage());
        }
        
        return $result;
    }
    
    /**
     * Check if biography data exists for post
     * 
     * @param int $post_id Post ID
     * @return bool True if biography exists
     */
    public static function has_biography_data($post_id) {
        if (!self::validate_post_id($post_id)) {
            return false;
        }
        
        // Check if any core biography field has data
        $core_fields = array('name', 'short', 'medium', 'long');
        foreach ($core_fields as $field_key) {
            if (isset(self::$field_mappings[$field_key])) {
                $meta_key = self::$field_mappings[$field_key];
                $bio_value = get_post_meta($post_id, $meta_key, true);
                if (!empty($bio_value) && is_string($bio_value) && strlen(trim($bio_value)) > 0) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Get biography data availability info
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
            'core_fields' => array(),
            'optional_fields' => array()
        );
        
        if (!self::validate_post_id($post_id)) {
            return $result;
        }
        
        $core_fields = array('name', 'short', 'medium', 'long');
        
        foreach (self::$field_mappings as $field_key => $meta_key) {
            $bio_value = get_post_meta($post_id, $meta_key, true);
            $has_data = !empty($bio_value) && is_string($bio_value) && strlen(trim($bio_value)) > 0;
            
            if ($has_data) {
                $result['field_count']++;
                $result['has_data'] = true;
            } else {
                $result['empty_fields']++;
            }
            
            if (in_array($field_key, $core_fields)) {
                $result['core_fields'][$field_key] = $has_data;
            } else {
                $result['optional_fields'][$field_key] = $has_data;
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
            $bio_value = get_post_meta($post_id, $meta_key, true);
            if (!empty($bio_value)) {
                $content_parts[] = $meta_key . ':' . md5($bio_value);
            }
        }
        
        return md5(implode('|', $content_parts));
    }
    
    /**
     * COMPLIANT: Prepare template props from component data
     * This keeps component-specific logic within the component
     * 
     * @param array $component_data Data from load_component_data
     * @param array $existing_props Existing props to merge with
     * @return array Props ready for template
     */
    public static function prepare_template_props($component_data, $existing_props = array()) {
        $props = $existing_props;
        
        if (!empty($component_data['success']) && !empty($component_data['biography'])) {
            // Prioritize 'medium' field (standard biography from Media Kit Content Generator)
            $bio_content = '';
            if (!empty($component_data['biography']['medium'])) {
                $bio_content = $component_data['biography']['medium'];
            } elseif (!empty($component_data['biography']['long'])) {
                $bio_content = $component_data['biography']['long'];
            } elseif (!empty($component_data['biography']['short'])) {
                $bio_content = $component_data['biography']['short'];
            }
            
            // Provide content in multiple formats for template compatibility
            $props['bio'] = $bio_content;
            $props['content'] = $bio_content;
            $props['biography'] = $bio_content;
            $props['name'] = $component_data['biography']['name'] ?? '';
            $props['title'] = $component_data['biography']['title'] ?? '';
            $props['organization'] = $component_data['biography']['organization'] ?? '';
        }
        
        return $props;
    }
    
    /**
     * Assess data quality
     * 
     * @param array $biography Biography data
     * @return string Quality level
     */
    private static function assess_data_quality($biography) {
        $core_fields = array('name', 'short', 'medium', 'long');
        $filled_core = 0;
        $filled_optional = 0;
        
        foreach ($biography as $field_key => $value) {
            if (!empty($value) && strlen(trim($value)) > 0) {
                if (in_array($field_key, $core_fields)) {
                    $filled_core++;
                } else {
                    $filled_optional++;
                }
            }
        }
        
        if ($filled_core >= 3 && $filled_optional >= 2) return 'excellent';
        if ($filled_core >= 2 && $filled_optional >= 1) return 'good';
        if ($filled_core >= 2) return 'fair';
        if ($filled_core >= 1) return 'poor';
        return 'empty';
    }
}

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ COMPLIANT: Biography Data Integration loaded - Generic data-integration.php pattern');
}
