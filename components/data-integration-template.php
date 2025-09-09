<?php
/**
 * Component Data Integration Template
 * 
 * TEMPLATE: Copy this file to your component folder as data-integration.php
 * Replace "Example" with your component name (e.g., "Topics", "Hero", "Contact")
 * 
 * This file follows the self-contained component architecture where each
 * component handles its own data loading and preparation.
 * 
 * @package Guestify/Components
 * @version 1.0.0-template
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Example Component Data Integration
 * 
 * CLASS NAMING CONVENTION: {ComponentName}_Data_Integration
 * Examples:
 * - Biography_Data_Integration
 * - Topics_Data_Integration
 * - Hero_Data_Integration
 * - Contact_Data_Integration
 * 
 * For hyphenated component names, use underscores:
 * - Social_Links_Data_Integration (for social-links component)
 * - Call_To_Action_Data_Integration (for call-to-action component)
 */
class Example_Data_Integration {
    
    /**
     * Component identifier
     */
    protected static $component_type = 'example'; // Change to your component type
    
    /**
     * Pods field mappings
     * Map your component's data fields to WordPress post meta keys
     */
    protected static $field_mappings = array(
        'title' => 'example_title',
        'content' => 'example_content',
        'image' => 'example_image',
        // Add your field mappings here
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
            error_log('[' . static::$component_type . '_Data_Integration] ' . $message);
        }
    }
    
    /**
     * Load component data from database
     * This is the main method called by the AJAX handler
     * 
     * @param int $post_id Post ID
     * @return array Component data with metadata
     */
    public static function load_component_data($post_id) {
        $result = array(
            'data' => array(),
            'count' => 0,
            'source' => 'database',
            'component_type' => self::$component_type,
            'success' => false,
            'message' => '',
            'timestamp' => current_time('mysql')
        );
        
        if (!self::validate_post_id($post_id)) {
            $result['message'] = 'Invalid post ID';
            return $result;
        }
        
        // Load data from database
        foreach (self::$field_mappings as $field_key => $meta_key) {
            $value = get_post_meta($post_id, $meta_key, true);
            
            if (!empty($value)) {
                $result['data'][$field_key] = $value;
                $result['count']++;
                $result['success'] = true;
            }
        }
        
        if ($result['success']) {
            $result['message'] = "Loaded {$result['count']} fields from database";
        } else {
            $result['message'] = "No data found for post {$post_id}";
        }
        
        self::debug_log($result['message']);
        
        return $result;
    }
    
    /**
     * Prepare template props from component data
     * This method formats the data for use in the component template
     * 
     * @param array $component_data Data from load_component_data
     * @param array $existing_props Existing props to merge with
     * @return array Props ready for template
     */
    public static function prepare_template_props($component_data, $existing_props = array()) {
        $props = $existing_props;
        
        if (!empty($component_data['success']) && !empty($component_data['data'])) {
            // Map your data to template props
            foreach ($component_data['data'] as $key => $value) {
                $props[$key] = $value;
            }
            
            // Add any additional processing or defaults
            // Example:
            // $props['title'] = $props['title'] ?? 'Default Title';
            // $props['show_image'] = !empty($props['image']);
        }
        
        return $props;
    }
    
    /**
     * Save component data to database
     * Optional method for saving data back to the database
     * 
     * @param int $post_id Post ID
     * @param array $data Data to save
     * @return array Save result with metadata
     */
    public static function save_component_data($post_id, $data) {
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
        
        if (!is_array($data)) {
            $result['message'] = 'Invalid data format';
            return $result;
        }
        
        // Save each field
        foreach (self::$field_mappings as $field_key => $meta_key) {
            if (isset($data[$field_key])) {
                $value = sanitize_text_field($data[$field_key]);
                update_post_meta($post_id, $meta_key, $value);
                $result['count']++;
            }
        }
        
        $result['success'] = true;
        $result['message'] = "Saved {$result['count']} fields to database";
        
        self::debug_log($result['message']);
        
        return $result;
    }
    
    /**
     * Check if component has data
     * 
     * @param int $post_id Post ID
     * @return bool True if component has data
     */
    public static function has_component_data($post_id) {
        if (!self::validate_post_id($post_id)) {
            return false;
        }
        
        foreach (self::$field_mappings as $field_key => $meta_key) {
            $value = get_post_meta($post_id, $meta_key, true);
            if (!empty($value)) {
                return true;
            }
        }
        
        return false;
    }
}

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ Example_Data_Integration loaded - Template for component data integration');
}
