<?php
/**
 * Component Schema Registry
 * Phase 2: Component Layer Architecture - Schema definitions for all component types
 * 
 * This file provides server-side component schema definitions that can be used by
 * both PHP and JavaScript systems for validation, configuration, and data binding.
 * 
 * @package Guestify
 * @version 2.0.0-phase2
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Component_Schema_Registry {
    
    /**
     * Component schemas cache
     */
    private static $schemas = null;
    
    /**
     * Get all component schemas
     * 
     * @return array Component schemas
     */
    public static function get_schemas() {
        if (self::$schemas === null) {
            self::$schemas = self::load_schemas();
        }
        return self::$schemas;
    }
    
    /**
     * Get schema for specific component type
     * 
     * @param string $component_type Component type
     * @return array|null Component schema or null if not found
     */
    public static function get_schema($component_type) {
        $schemas = self::get_schemas();
        return isset($schemas[$component_type]) ? $schemas[$component_type] : null;
    }
    
    /**
     * Load all component schemas
     * PHASE 2 ENHANCEMENT: Load from JSON files with fallback to hardcoded schemas
     * 
     * @return array Component schemas
     */
    private static function load_schemas() {
        $schemas = array();
        
        // PHASE 2: Try loading from JSON files first
        $json_schemas = self::load_json_schemas();
        if (!empty($json_schemas)) {
            $schemas = array_merge($schemas, $json_schemas);
        }
        
        // Fallback: Load hardcoded schemas for any missing types
        $hardcoded_schemas = self::load_hardcoded_schemas();
        foreach ($hardcoded_schemas as $type => $schema) {
            if (!isset($schemas[$type])) {
                $schemas[$type] = $schema;
            }
        }
        
        return $schemas;
    }
    
    /**
     * PHASE 2: Load schemas from component folders
     * CRITICAL FIX: Load ALL component.json files from component directories
     * 
     * @return array Schemas loaded from component folders
     */
    private static function load_json_schemas() {
        $schemas = array();
        $components_dir = GUESTIFY_PLUGIN_DIR . 'components/';
        
        if (!is_dir($components_dir)) {
            error_log('GMKB PHASE 2 CRITICAL: Components directory not found: ' . $components_dir);
            return array();
        }
        
        // CRITICAL FIX: Force scan all component directories
        $component_dirs = array_filter(glob($components_dir . '*'), 'is_dir');
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB PHASE 2: Scanning ' . count($component_dirs) . ' component directories');
        }
        
        foreach ($component_dirs as $component_path) {
            $component_dir = basename($component_path);
            $schema_file = $component_path . '/component.json';
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("GMKB PHASE 2: Processing {$component_dir} - JSON exists: " . (file_exists($schema_file) ? 'YES' : 'NO'));
            }
            
            if (file_exists($schema_file)) {
                $json_content = file_get_contents($schema_file);
                if ($json_content !== false) {
                    // ROOT FIX: Handle escaped newlines in JSON files
                    $json_content = str_replace('\\n', '', $json_content);
                    $schema = json_decode($json_content, true);
                    
                    if ($schema && is_array($schema)) {
                        // CRITICAL FIX: Ensure required fields for JavaScript compatibility
                        $schema['type'] = $component_dir;
                        $schema['directory'] = $component_dir;
                        $schema['version'] = $schema['version'] ?? '2.0.0-phase2';
                        
                        // Use directory name as component type
                        $schemas[$component_dir] = $schema;
                        
                        if (defined('WP_DEBUG') && WP_DEBUG) {
                            error_log("GMKB PHASE 2: ✅ Loaded {$component_dir} schema (version: {$schema['version']})");
                        }
                    } else {
                        error_log("GMKB PHASE 2: ❌ Invalid JSON in {$schema_file}");
                        if (defined('WP_DEBUG') && WP_DEBUG) {
                            error_log("JSON error: " . json_last_error_msg());
                        }
                    }
                } else {
                    error_log("GMKB PHASE 2: ❌ Could not read {$schema_file}");
                }
            } else {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("GMKB PHASE 2: ⚠️ No component.json found for {$component_dir}");
                }
            }
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB PHASE 2 CRITICAL: Loaded ' . count($schemas) . ' schemas from component folders');
            error_log('GMKB PHASE 2: Available components: ' . implode(', ', array_keys($schemas)));
        }
        
        return $schemas;
    }
    
    /**
     * Load hardcoded schemas (fallback)
     * 
     * @return array Hardcoded component schemas
     */
    private static function load_hardcoded_schemas() {
        return array(
            'hero' => array(
                'name' => 'Hero Section',
                'description' => 'Main hero section with profile image and introduction',
                'category' => 'essential',
                'dataBindings' => array(
                    'title' => 'full_name',
                    'subtitle' => 'guest_title',
                    'description' => 'biography_short',
                    'image' => 'guest_headshot'
                ),
                'componentOptions' => array(
                    'layout' => array(
                        'type' => 'select',
                        'label' => 'Layout Style',
                        'default' => 'left_aligned',
                        'options' => array(
                            'left_aligned' => 'Left Aligned',
                            'center_aligned' => 'Center Aligned',
                            'right_aligned' => 'Right Aligned'
                        ),
                        'section' => 'layout'
                    )
                ),
                'sections' => array(
                    'layout' => array(
                        'title' => 'Layout Options',
                        'order' => 1
                    )
                )
            )
        );
    }
    
    /**
     * Get component options for specific component type
     * 
     * @param string $component_type Component type
     * @return array Component options
     */
    public static function get_component_options($component_type) {
        $schema = self::get_schema($component_type);
        return isset($schema['componentOptions']) ? $schema['componentOptions'] : array();
    }
    
    /**
     * Get data bindings for specific component type
     * 
     * @param string $component_type Component type
     * @return array Data bindings
     */
    public static function get_data_bindings($component_type) {
        $schema = self::get_schema($component_type);
        return isset($schema['dataBindings']) ? $schema['dataBindings'] : array();
    }
    
    /**
     * Get default configuration for component type
     * 
     * @param string $component_type Component type
     * @return array Default configuration
     */
    public static function get_default_configuration($component_type) {
        $schema = self::get_schema($component_type);
        if (!$schema) {
            return array();
        }
        
        $config = array(
            'dataBindings' => isset($schema['dataBindings']) ? $schema['dataBindings'] : array(),
            'componentOptions' => array(),
            'responsiveBehavior' => isset($schema['responsiveBehavior']) ? $schema['responsiveBehavior'] : array()
        );
        
        // Extract default values from component options
        foreach (isset($schema['componentOptions']) ? $schema['componentOptions'] : array() as $key => $optionDef) {
            if (isset($optionDef['default'])) {
                $config['componentOptions'][$key] = $optionDef['default'];
            }
        }
        
        return $config;
    }
    
    /**
     * Get schemas formatted for JavaScript consumption
     * This is the method being called by enqueue.php
     * CRITICAL FIX: Force fresh load and clear cache to load all 16 components
     * 
     * @return array JavaScript-formatted schemas
     */
    public static function get_js_schemas() {
        // CRITICAL FIX: Force fresh load by clearing static cache
        self::$schemas = null;
        
        $schemas = self::get_schemas();
        
        // CRITICAL FIX: Additional validation and logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB PHP REGISTRY: get_js_schemas() called - found ' . count($schemas) . ' total schemas');
            error_log('GMKB PHP REGISTRY: Component types: ' . implode(', ', array_keys($schemas)));
        }
        
        // Format for JavaScript - ensure proper JSON serialization
        $js_schemas = array();
        
        foreach ($schemas as $type => $schema) {
            $js_schemas[$type] = array(
                'name' => $schema['name'] ?? ucfirst($type),
                'description' => $schema['description'] ?? 'No description available',
                'category' => $schema['category'] ?? 'general',
                'dataBindings' => isset($schema['dataBindings']) ? $schema['dataBindings'] : array(),
                'componentOptions' => isset($schema['componentOptions']) ? $schema['componentOptions'] : array(),
                'responsiveBehavior' => isset($schema['responsiveBehavior']) ? $schema['responsiveBehavior'] : array(),
                'sections' => isset($schema['sections']) ? $schema['sections'] : array(),
                'presets' => isset($schema['presets']) ? $schema['presets'] : array(),
                'version' => $schema['version'] ?? '2.0.0-phase2',
                'type' => $type,
                'directory' => $type
            );
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB PHP REGISTRY: Formatted ' . count($js_schemas) . ' schemas for JavaScript');
        }
        
        return $js_schemas;
    }
}

/**
 * Initialize schema registry
 */
function gmkb_init_component_schemas() {
    // Make schemas available to JavaScript
    if (!wp_script_is('gmkb-main', 'enqueued')) {
        return;
    }
    
    wp_localize_script('gmkb-main', 'gmkbComponentSchemas', array(
        'schemas' => GMKB_Component_Schema_Registry::get_schemas(),
        'version' => '2.0.0-phase2',
        'timestamp' => time()
    ));
}

// Hook to make schemas available to frontend
add_action('wp_enqueue_scripts', 'gmkb_init_component_schemas', 20);
add_action('admin_enqueue_scripts', 'gmkb_init_component_schemas', 20);
