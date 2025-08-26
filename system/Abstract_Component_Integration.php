<?php
/**
 * Abstract Base Component Integration
 * 
 * PHASE 1 ARCHITECTURAL FIX: Component-level data integration pattern
 * Establishes interface for all component-specific data integrations
 * 
 * @package Guestify/System
 * @version 1.0.0-phase1-component-isolation
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Abstract base class for component-specific data integrations
 * Enforces consistent interface across all components
 */
abstract class Abstract_Component_Integration {
    
    /**
     * Component type identifier
     * Must be implemented by child classes
     */
    protected static $component_type = '';
    
    /**
     * Field mappings for the component
     * Must be implemented by child classes
     */
    protected static $field_mappings = array();
    
    /**
     * Load component data from Pods fields
     * Must be implemented by child classes
     * 
     * @param int $post_id Post ID
     * @return array Component data with metadata
     */
    abstract public static function load_component_data($post_id);
    
    /**
     * Save component data to Pods fields
     * Must be implemented by child classes
     * 
     * @param int $post_id Post ID
     * @param array $data Component data to save
     * @return array Save result with metadata
     */
    abstract public static function save_component_data($post_id, $data);
    
    /**
     * Check if component data exists for post
     * Must be implemented by child classes
     * 
     * @param int $post_id Post ID
     * @return bool True if data exists
     */
    abstract public static function has_component_data($post_id);
    
    /**
     * Get component data availability info
     * Must be implemented by child classes
     * 
     * @param int $post_id Post ID
     * @return array Availability information
     */
    abstract public static function get_data_availability($post_id);
    
    /**
     * Calculate content hash for change detection
     * Must be implemented by child classes
     * 
     * @param int $post_id Post ID
     * @return string Content hash
     */
    abstract public static function calculate_content_hash($post_id);
    
    /**
     * Validate post ID (shared implementation)
     * 
     * @param mixed $post_id Post ID to validate
     * @return bool True if valid
     */
    protected static function validate_post_id($post_id) {
        return is_numeric($post_id) && intval($post_id) > 0 && get_post_status($post_id) !== false;
    }
    
    /**
     * Get component type (shared implementation)
     * 
     * @return string Component type
     */
    public static function get_component_type() {
        return static::$component_type;
    }
    
    /**
     * Get component field mappings (shared implementation)
     * 
     * @return array Field mappings
     */
    public static function get_field_mappings() {
        return static::$field_mappings;
    }
    
    /**
     * Sanitize field value (shared implementation)
     * 
     * @param mixed $value Value to sanitize
     * @return string Sanitized value
     */
    protected static function sanitize_field_value($value) {
        if (is_array($value)) {
            $value = $value['title'] ?? $value['content'] ?? '';
        }
        
        return is_string($value) ? sanitize_text_field(trim($value)) : '';
    }
    
    /**
     * Log debug message (shared implementation)
     * 
     * @param string $message Debug message
     * @param array $context Additional context
     */
    protected static function debug_log($message, $context = array()) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            $component_type = static::$component_type;
            $log_message = "{$component_type} Integration: {$message}";
            
            if (!empty($context)) {
                $log_message .= ' | Context: ' . print_r($context, true);
            }
            
            error_log($log_message);
        }
    }
}

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ PHASE 1: Abstract Component Integration loaded - Component isolation pattern established');
}
