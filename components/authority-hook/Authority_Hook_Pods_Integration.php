<?php
/**
 * Authority Hook Component - Pods Data Integration
 * 
 * PHASE 1 ARCHITECTURAL FIX: Component-level data integration
 * Handles all authority hook data operations with single responsibility
 * 
 * @package Guestify/Components/AuthorityHook
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
 * Authority Hook-specific Pods data integration
 * Handles all data operations for Authority Hook component only
 */
class Authority_Hook_Pods_Integration extends Abstract_Component_Integration {
    
    /**
     * Component identifier
     */
    protected static $component_type = 'authority_hook';
    
    /**
     * Pods field mappings for authority hook
     */
    protected static $field_mappings = array(
        'who' => 'authority_hook_who',
        'what' => 'authority_hook_what',
        'when' => 'authority_hook_when',
        'where' => 'authority_hook_where',
        'why' => 'authority_hook_why',
        'how' => 'authority_hook_how'
    );
    
    /**
     * Load authority hook data from Pods fields only
     * Implementation of abstract method
     * 
     * @param int $post_id Post ID
     * @return array Authority hook data with metadata
     */
    public static function load_component_data($post_id) {
        return self::load_authority_hook_data($post_id);
    }
    
    /**
     * Save authority hook data to Pods fields only
     * Implementation of abstract method
     * 
     * @param int $post_id Post ID
     * @param array $data Authority hook data to save
     * @return array Save result with metadata
     */
    public static function save_component_data($post_id, $data) {
        return self::save_authority_hook_data($post_id, $data);
    }
    
    /**
     * Check if authority hook data exists for post
     * Implementation of abstract method
     * 
     * @param int $post_id Post ID
     * @return bool True if authority hook exists
     */
    public static function has_component_data($post_id) {
        return self::has_authority_hook_data($post_id);
    }
    
    /**
     * PHASE 1 FIX: Load authority hook from Pods fields only
     * 
     * @param int $post_id Post ID
     * @return array Authority hook data with metadata
     */
    public static function load_authority_hook_data($post_id) {
        $result = array(
            'authority_hook' => array(),
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
            $hook_value = get_post_meta($post_id, $meta_key, true);
            
            if (!empty($hook_value) && is_string($hook_value)) {
                $cleaned_value = sanitize_textarea_field(trim($hook_value));
                if (strlen($cleaned_value) > 0) {
                    $result['authority_hook'][$field_key] = $cleaned_value;
                    $result['count']++;
                    $result['success'] = true;
                    
                    self::debug_log("Found {$field_key} = " . substr($cleaned_value, 0, 50) . "... for post {$post_id}");
                }
            }
            
            // Ensure field exists even if empty
            if (!isset($result['authority_hook'][$field_key])) {
                $result['authority_hook'][$field_key] = '';
            }
        }
        
        // Set quality assessment
        if ($result['success']) {
            $result['quality'] = self::assess_data_quality($result['authority_hook']);
            $result['message'] = "Loaded {$result['count']} authority hook elements from Pods";
        } else {
            $result['message'] = "No authority hook found in Pods fields for post {$post_id}";
        }
        
        // Add metadata
        $result['meta'] = array(
            'generated_date' => get_post_meta($post_id, 'authority_hook_generated_date', true),
            'style' => get_post_meta($post_id, 'authority_hook_style', true),
            'complete' => $result['count'] >= 4 // At least 4 components for complete hook
        );
        
        self::debug_log($result['message']);
        
        return $result;
    }
    
    /**
     * PHASE 1 FIX: Save authority hook to Pods fields only
     * 
     * @param int $post_id Post ID
     * @param array $hook_data Authority hook data to save
     * @return array Save result with metadata
     */
    public static function save_authority_hook_data($post_id, $hook_data) {
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
        
        if (!is_array($hook_data)) {
            $result['message'] = 'Invalid authority hook data format';
            return $result;
        }
        
        try {
            // Save to Pods fields only - single source of truth
            foreach (self::$field_mappings as $field_key => $meta_key) {
                $hook_value = '';
                
                // Extract value from different possible input formats
                if (isset($hook_data['authority_hook'][$field_key])) {
                    $hook_value = $hook_data['authority_hook'][$field_key];
                } elseif (isset($hook_data[$field_key])) {
                    $hook_value = $hook_data[$field_key];
                } elseif (isset($hook_data[$meta_key])) {
                    $hook_value = $hook_data[$meta_key];
                }
                
                // Sanitize and save
                $cleaned_value = is_string($hook_value) ? sanitize_textarea_field(trim($hook_value)) : '';
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
            update_post_meta($post_id, 'authority_hook_last_saved', current_time('mysql'));
            update_post_meta($post_id, 'authority_hook_save_method', 'pods_component_integration');
            update_post_meta($post_id, 'authority_hook_component_type', self::$component_type);
            
            $result['success'] = true;
            $result['message'] = "Successfully saved {$result['count']} authority hook elements to Pods";
            
            self::debug_log($result['message']);
            
        } catch (Exception $e) {
            $result['message'] = 'Save error: ' . $e->getMessage();
            self::debug_log("Save Error: " . $e->getMessage());
        }
        
        return $result;
    }
    
    /**
     * Check if authority hook data exists for post
     * 
     * @param int $post_id Post ID
     * @return bool True if authority hook exists
     */
    public static function has_authority_hook_data($post_id) {
        if (!self::validate_post_id($post_id)) {
            return false;
        }
        
        // Check if any core authority hook field has data
        $core_fields = array('who', 'what', 'why', 'how');
        foreach ($core_fields as $field_key) {
            if (isset(self::$field_mappings[$field_key])) {
                $meta_key = self::$field_mappings[$field_key];
                $hook_value = get_post_meta($post_id, $meta_key, true);
                if (!empty($hook_value) && is_string($hook_value) && strlen(trim($hook_value)) > 0) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Get authority hook data availability info
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
            'core_elements' => array(),
            'completeness' => 0
        );
        
        if (!self::validate_post_id($post_id)) {
            return $result;
        }
        
        foreach (self::$field_mappings as $field_key => $meta_key) {
            $hook_value = get_post_meta($post_id, $meta_key, true);
            $has_data = !empty($hook_value) && is_string($hook_value) && strlen(trim($hook_value)) > 0;
            
            if ($has_data) {
                $result['field_count']++;
                $result['has_data'] = true;
            } else {
                $result['empty_fields']++;
            }
            
            $result['core_elements'][$field_key] = $has_data;
        }
        
        // Calculate completeness percentage
        $total_fields = count(self::$field_mappings);
        $result['completeness'] = $total_fields > 0 ? round(($result['field_count'] / $total_fields) * 100) : 0;
        
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
            $hook_value = get_post_meta($post_id, $meta_key, true);
            if (!empty($hook_value)) {
                $content_parts[] = $meta_key . ':' . md5($hook_value);
            }
        }
        
        return md5(implode('|', $content_parts));
    }
    
    /**
     * Assess data quality
     * 
     * @param array $authority_hook Authority hook data
     * @return string Quality level
     */
    private static function assess_data_quality($authority_hook) {
        $core_elements = array('who', 'what', 'why', 'how');
        $filled_core = 0;
        $filled_context = 0;
        
        foreach ($authority_hook as $field_key => $value) {
            if (!empty($value) && strlen(trim($value)) > 0) {
                if (in_array($field_key, $core_elements)) {
                    $filled_core++;
                } else {
                    $filled_context++;
                }
            }
        }
        
        if ($filled_core >= 4 && $filled_context >= 1) return 'excellent';
        if ($filled_core >= 4) return 'good';
        if ($filled_core >= 3) return 'fair';
        if ($filled_core >= 2) return 'poor';
        return 'empty';
    }
}

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ PHASE 1: Authority Hook Pods Integration loaded - Component-level data integration');
}
