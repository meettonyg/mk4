<?php
/**
 * Base Component Data Service
 * 
 * Scalable foundation for ALL component data services
 * Provides unified post ID detection, data loading patterns, and caching
 * 
 * @package Guestify/Components/Base
 * @version 1.0.0-scalable-architecture
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

abstract class Base_Component_Data_Service {
    
    /**
     * Component type - must be defined by child classes
     */
    protected static $component_type = null;
    
    /**
     * Cache for post ID detection to avoid repeated lookups
     */
    private static $post_id_cache = array();
    
    /**
     * Cache for component data to improve performance
     */
    private static $data_cache = array();
    
    /**
     * EVENT-DRIVEN: Validate explicit post ID parameter
     * 
     * Replaces detection polling with explicit parameter validation
     * No global object sniffing or detection strategies
     * 
     * @param int $post_id Explicit post ID parameter (required)
     * @param string $context Context for debugging
     * @return array Validation result
     */
    protected static function validate_explicit_post_id($post_id, $context = 'unknown') {
        // EVENT-DRIVEN: No detection, only explicit validation
        $current_post_id = intval($post_id);
        
        if ($current_post_id <= 0) {
            return array(
                'post_id' => 0,
                'valid' => false,
                'source' => 'explicit_parameter',
                'context' => $context,
                'error' => 'Invalid post ID parameter provided',
                'timestamp' => current_time('mysql')
            );
        }
        
        // Validate post exists and is accessible
        $post = get_post($current_post_id);
        if (!$post || $post->post_status === 'trash') {
            return array(
                'post_id' => $current_post_id,
                'valid' => false,
                'source' => 'explicit_parameter',
                'context' => $context,
                'error' => 'Post not found or in trash',
                'timestamp' => current_time('mysql')
            );
        }
        
        GMKB_Logger::debug("Base Service: Post ID {$current_post_id} validated for " . (static::$component_type ?? 'unknown') . " component in context {$context}");
        
        return array(
            'post_id' => $current_post_id,
            'valid' => true,
            'source' => 'explicit_parameter',
            'context' => $context,
            'post_title' => $post->post_title,
            'timestamp' => current_time('mysql')
        );
    }
    
    /**
     * EVENT-DRIVEN: Get unified component data with explicit post ID
     * Must be implemented by all child classes
     * 
     * @param int $post_id Explicit post ID (required)
     * @param string $context Context where data is requested
     * @return array Standardized component data array
     */
    abstract public static function get_unified_component_data($post_id, $context = 'unknown');
    
    /**
     * EVENT-DRIVEN: Get component data for preview area with explicit post ID
     * Must be implemented by all child classes
     * 
     * @param int $post_id Explicit post ID (required)
     * @param string $context Context identifier
     * @return array Preview-formatted data
     */
    abstract public static function get_preview_data($post_id, $context = 'preview');
    
    /**
     * EVENT-DRIVEN: Get component data for sidebar/design panel with explicit post ID
     * Must be implemented by all child classes
     * 
     * @param int $post_id Explicit post ID (required)
     * @param string $context Context identifier  
     * @return array Sidebar-formatted data
     */
    abstract public static function get_sidebar_data($post_id, $context = 'sidebar');
    
    /**
     * UNIVERSAL: Save component data
     * Provides standardized saving with validation and error handling
     * 
     * @param int   $post_id Post ID to save to
     * @param array $data    Component data to save
     * @param array $options Save options
     * @return bool Success status
     */
    public static function save_component_data($post_id, $data, $options = array()) {
        if ($post_id <= 0 || !is_array($data)) {
            return false;
        }
        
        $component_type = static::$component_type ?? 'unknown';
        
        // Default save options
        $options = array_merge(array(
            'validate' => true,
            'backup' => true,
            'timestamp' => true,
            'sanitize' => true
        ), $options);
        
        // Validate data if requested
        if ($options['validate']) {
            $data = static::validate_component_data($data);
            if ($data === false) {
                GMKB_Logger::warning("Base Service: Data validation failed for {$component_type} component");
                return false;
            }
        }
        
        // Sanitize data if requested
        if ($options['sanitize']) {
            $data = static::sanitize_component_data($data);
        }
        
        // Add timestamp if requested
        if ($options['timestamp']) {
            $data['_saved_at'] = current_time('mysql');
            $data['_component_type'] = $component_type;
        }
        
        // Create backup if requested
        if ($options['backup']) {
            $existing_data = get_post_meta($post_id, "component_{$component_type}_data", true);
            if (!empty($existing_data)) {
                update_post_meta($post_id, "component_{$component_type}_data_backup", $existing_data);
            }
        }
        
        // Save primary data
        $meta_key = "component_{$component_type}_data";
        $success = update_post_meta($post_id, $meta_key, $data);
        
        // Clear cache on successful save
        if ($success !== false) {
            self::clear_component_cache($component_type, $post_id);
        }
        
        GMKB_Logger::info("Base Service: Saved {$component_type} data to post {$post_id} - " .
                     ($success !== false ? 'SUCCESS' : 'FAILED'));
        
        return $success !== false;
    }
    
    /**
     * UNIVERSAL: Load component data
     * Provides standardized loading with caching and fallbacks
     * 
     * @param int    $post_id Post ID to load from
     * @param array  $options Load options
     * @return array|false Component data or false on failure
     */
    public static function load_component_data($post_id, $options = array()) {
        if ($post_id <= 0) {
            return false;
        }
        
        $component_type = static::$component_type ?? 'unknown';
        
        // Default load options
        $options = array_merge(array(
            'use_cache' => true,
            'fallback_to_backup' => true,
            'include_metadata' => false
        ), $options);
        
        // Check cache first
        $cache_key = "{$component_type}_{$post_id}";
        if ($options['use_cache'] && isset(self::$data_cache[$cache_key])) {
            return self::$data_cache[$cache_key];
        }
        
        // Load primary data
        $meta_key = "component_{$component_type}_data";
        $data = get_post_meta($post_id, $meta_key, true);
        
        // Fallback to backup if primary data is empty
        if (empty($data) && $options['fallback_to_backup']) {
            $backup_key = "component_{$component_type}_data_backup";
            $data = get_post_meta($post_id, $backup_key, true);
            
            if (!empty($data)) {
                GMKB_Logger::warning("Base Service: Used backup data for {$component_type} component");
            }
        }
        
        // Include metadata if requested
        if ($options['include_metadata'] && !empty($data)) {
            $data['_loaded_at'] = current_time('mysql');
            $data['_cache_key'] = $cache_key;
        }
        
        // Cache result for performance
        if ($options['use_cache'] && !empty($data)) {
            self::$data_cache[$cache_key] = $data;
        }
        
        return !empty($data) ? $data : false;
    }
    
    /**
     * UNIVERSAL: Validate component data
     * Override in child classes for component-specific validation
     * 
     * @param array $data Component data to validate
     * @return array|false Validated data or false on failure
     */
    protected static function validate_component_data($data) {
        if (!is_array($data)) {
            return false;
        }
        
        // Basic validation - child classes should override for specific validation
        return $data;
    }
    
    /**
     * UNIVERSAL: Sanitize component data  
     * Override in child classes for component-specific sanitization
     * 
     * @param array $data Component data to sanitize
     * @return array Sanitized data
     */
    protected static function sanitize_component_data($data) {
        if (!is_array($data)) {
            return array();
        }
        
        // Basic sanitization - child classes should override for specific sanitization
        $sanitized = array();
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $sanitized[sanitize_key($key)] = sanitize_text_field($value);
            } elseif (is_array($value)) {
                $sanitized[sanitize_key($key)] = static::sanitize_component_data($value);
            } else {
                $sanitized[sanitize_key($key)] = $value;
            }
        }
        
        return $sanitized;
    }
    
    /**
     * UNIVERSAL: Clear component cache
     * 
     * @param string $component_type Component type to clear
     * @param int    $post_id       Specific post ID or 0 for all
     */
    public static function clear_component_cache($component_type = null, $post_id = 0) {
        if ($component_type && $post_id > 0) {
            // Clear specific component cache
            $cache_key = "{$component_type}_{$post_id}";
            unset(self::$data_cache[$cache_key]);
        } elseif ($component_type) {
            // Clear all cache for component type
            foreach (self::$data_cache as $key => $value) {
                if (strpos($key, $component_type . '_') === 0) {
                    unset(self::$data_cache[$key]);
                }
            }
        } else {
            // Clear all cache
            self::$data_cache = array();
        }
        
        // Also clear post ID cache
        self::$post_id_cache = array();
    }
    
    /**
     * UNIVERSAL: Get component type
     * 
     * @return string Component type
     */
    public static function get_component_type() {
        return static::$component_type ?? 'unknown';
    }
    
    /**
     * UNIVERSAL: Get cache statistics
     * 
     * @return array Cache statistics
     */
    public static function get_cache_stats() {
        return array(
            'data_cache_entries' => count(self::$data_cache),
            'post_id_cache_entries' => count(self::$post_id_cache),
            'component_type' => static::$component_type ?? 'unknown',
            'memory_usage' => memory_get_usage(),
            'cached_post_ids' => array_keys(self::$post_id_cache)
        );
    }
    
    /**
     * UNIVERSAL: Debug information
     * PHASE 1 FIX: Removed deprecated detect_post_id method - explicit post ID required
     * 
     * @param int $post_id Explicit post ID (required)
     * @param string $context Debug context
     * @return array Debug information
     */
    public static function get_debug_info($post_id, $context = 'unknown') {
        $validation = static::validate_explicit_post_id($post_id, $context);
        $cache_stats = static::get_cache_stats();
        
        return array(
            'component_type' => static::$component_type ?? 'unknown',
            'context' => $context,
            'post_id' => $post_id,
            'post_id_validation' => $validation,
            'cache_statistics' => $cache_stats,
            'class_name' => get_called_class(),
            'timestamp' => current_time('mysql'),
            'event_driven' => true
        );
    }
}

GMKB_Logger::startup('Base Component Data Service loaded - scalable foundation ready');
