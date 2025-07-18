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
     * UNIFIED POST ID DETECTION - IDENTICAL FOR ALL COMPONENTS
     * 
     * This is the single source of truth for post ID detection across
     * all components, ensuring 100% consistency between preview and design panels
     * 
     * @param string $context Context where detection is called (for debugging)
     * @return array {
     *     @type int    $post_id       Resolved post ID
     *     @type string $source        Source of post ID detection
     *     @type array  $debug         Debug information
     * }
     */
    protected static function detect_post_id($context = 'unknown') {
        $cache_key = $context;
        
        // Return cached result if available
        if (isset(self::$post_id_cache[$cache_key])) {
            return self::$post_id_cache[$cache_key];
        }
        
        // UNIVERSAL DETECTION STRATEGIES - PRIORITY ORDER
        $methods = array(
            // Priority 1: Global component context (set by AJAX handler)
            'global_component_context' => $GLOBALS['gmkb_component_post_id'] ?? null,
            
            // Priority 2: WordPress constant (set by AJAX handler)
            'wordpress_constant' => defined('GMKB_CURRENT_POST_ID') ? GMKB_CURRENT_POST_ID : null,
            
            // Priority 3: URL parameters (GET)
            'url_post_id' => $_GET['post_id'] ?? null,
            'url_p' => $_GET['p'] ?? null,
            
            // Priority 4: POST parameters (AJAX contexts)
            'post_post_id' => $_POST['post_id'] ?? null,
            'post_media_kit_id' => $_POST['media_kit_id'] ?? null,
            
            // Priority 5: REQUEST fallback
            'request_post_id' => $_REQUEST['post_id'] ?? null,
            
            // Priority 6: WordPress context
            'global_post' => (isset($GLOBALS['post']->ID) ? $GLOBALS['post']->ID : null),
            'wp_get_the_id' => (function_exists('get_the_ID') ? get_the_ID() : null),
            'wp_query' => (isset($GLOBALS['wp_query']->post->ID) ? $GLOBALS['wp_query']->post->ID : null),
            
            // Priority 7: JavaScript data fallback (if passed through)
            'js_data' => $_POST['js_post_id'] ?? null
        );
        
        // Find first valid post ID
        $current_post_id = 0;
        $post_id_source = 'none';
        
        foreach ($methods as $method => $value) {
            if (!empty($value) && is_numeric($value) && $value > 0) {
                $current_post_id = intval($value);
                $post_id_source = $method;
                break;
            }
        }
        
        // Validate post exists and is accessible
        if ($current_post_id > 0) {
            $post = get_post($current_post_id);
            if (!$post || $post->post_status === 'trash') {
                $current_post_id = 0;
                $post_id_source = 'invalid_post';
            }
        }
        
        $result = array(
            'post_id' => $current_post_id,
            'source' => $post_id_source,
            'context' => $context,
            'timestamp' => current_time('mysql'),
            'debug' => array(
                'methods_checked' => $methods,
                'cache_key' => $cache_key,
                'component_type' => static::$component_type ?? 'unknown'
            )
        );
        
        // Cache result for performance
        self::$post_id_cache[$cache_key] = $result;
        
        // Enhanced debugging for development
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("BASE SERVICE: Post ID detection for " . (static::$component_type ?? 'unknown') . " component");
            error_log("  Context: {$context}");
            error_log("  Result: Post ID {$current_post_id} from {$post_id_source}");
            if ($current_post_id === 0) {
                error_log("  WARNING: No post ID detected - all methods failed");
            }
        }
        
        return $result;
    }
    
    /**
     * ABSTRACT METHOD: Get unified component data
     * Must be implemented by all child classes
     * 
     * @param string $context Context where data is requested
     * @return array Standardized component data array
     */
    abstract public static function get_unified_component_data($context = 'unknown');
    
    /**
     * ABSTRACT METHOD: Get component data for preview area
     * Must be implemented by all child classes
     * 
     * @param string $context Context identifier
     * @return array Preview-formatted data
     */
    abstract public static function get_preview_data($context = 'preview');
    
    /**
     * ABSTRACT METHOD: Get component data for sidebar/design panel
     * Must be implemented by all child classes
     * 
     * @param string $context Context identifier  
     * @return array Sidebar-formatted data
     */
    abstract public static function get_sidebar_data($context = 'sidebar');
    
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
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("BASE SERVICE: Data validation failed for {$component_type} component");
                }
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
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("BASE SERVICE: Saved {$component_type} data to post {$post_id} - " . 
                     ($success !== false ? 'SUCCESS' : 'FAILED'));
        }
        
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
            
            if (!empty($data) && defined('WP_DEBUG') && WP_DEBUG) {
                error_log("BASE SERVICE: Used backup data for {$component_type} component");
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
     * 
     * @param string $context Debug context
     * @return array Debug information
     */
    public static function get_debug_info($context = 'unknown') {
        $post_id_result = static::detect_post_id($context);
        $cache_stats = static::get_cache_stats();
        
        return array(
            'component_type' => static::$component_type ?? 'unknown',
            'context' => $context,
            'post_id_detection' => $post_id_result,
            'cache_statistics' => $cache_stats,
            'class_name' => get_called_class(),
            'timestamp' => current_time('mysql')
        );
    }
}

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ BASE SERVICE: Base Component Data Service loaded - scalable foundation ready');
}
