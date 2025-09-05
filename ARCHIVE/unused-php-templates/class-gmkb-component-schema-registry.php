<?php
/**
 * Component Schema Registry
 * Phase 2: Component Configuration System
 * 
 * Loads and provides component schemas from JSON files
 * 
 * @package GMKB
 * @since 2.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Component_Schema_Registry {
    
    private static $instance = null;
    private $schemas = array();
    private $schema_dir;
    
    /**
     * Get singleton instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        $this->schema_dir = plugin_dir_path(__FILE__);
        $this->load_schemas();
    }
    
    /**
     * Load all schema JSON files
     */
    private function load_schemas() {
        $json_files = glob($this->schema_dir . '*.json');
        
        foreach ($json_files as $file) {
            $schema_name = basename($file, '.json');
            $json_content = file_get_contents($file);
            $schema_data = json_decode($json_content, true);
            
            if ($schema_data && isset($schema_data['component_type'])) {
                $this->schemas[$schema_data['component_type']] = $schema_data;
                
                error_log('[PHASE 2] Loaded schema: ' . $schema_data['component_type']);
            } else {
                error_log('[PHASE 2] ERROR: Invalid schema file: ' . $file);
            }
        }
        
        error_log('[PHASE 2] Total schemas loaded: ' . count($this->schemas));
    }
    
    /**
     * Get all schemas
     */
    public function get_all_schemas() {
        return $this->schemas;
    }
    
    /**
     * Get schema by component type
     */
    public function get_schema($component_type) {
        return isset($this->schemas[$component_type]) ? $this->schemas[$component_type] : null;
    }
    
    /**
     * Get available component types
     */
    public function get_component_types() {
        return array_keys($this->schemas);
    }
    
    /**
     * Localize schemas for JavaScript
     */
    public function localize_schemas() {
        return array(
            'schemas' => $this->schemas,
            'componentTypes' => $this->get_component_types()
        );
    }
    
    /**
     * Get schemas for JavaScript
     * Static method to be called from enqueue.php
     */
    public static function get_js_schemas() {
        $instance = self::get_instance();
        return $instance->schemas;
    }
    
    /**
     * Get all schemas (alias for get_js_schemas)
     */
    public static function get_schemas() {
        return self::get_js_schemas();
    }
    
    /**
     * Get component options for UI generation
     */
    public function get_component_options($component_type) {
        $schema = $this->get_schema($component_type);
        
        if (!$schema || !isset($schema['componentOptions'])) {
            return array();
        }
        
        $options = array();
        foreach ($schema['componentOptions'] as $key => $option) {
            $options[] = array_merge(
                array('key' => $key),
                $option
            );
        }
        
        return $options;
    }
    
    /**
     * Validate component configuration
     */
    public function validate_configuration($component_type, $configuration) {
        $schema = $this->get_schema($component_type);
        
        if (!$schema) {
            return array(
                'valid' => false,
                'errors' => array('Unknown component type: ' . $component_type)
            );
        }
        
        $errors = array();
        
        // Validate component options
        if (isset($configuration['componentOptions']) && isset($schema['componentOptions'])) {
            foreach ($configuration['componentOptions'] as $option_key => $option_value) {
                if (!isset($schema['componentOptions'][$option_key])) {
                    $errors[] = 'Unknown option: ' . $option_key;
                    continue;
                }
                
                $option_schema = $schema['componentOptions'][$option_key];
                $validation = $this->validate_option_value($option_value, $option_schema);
                
                if (!$validation['valid']) {
                    foreach ($validation['errors'] as $error) {
                        $errors[] = $option_key . ': ' . $error;
                    }
                }
            }
        }
        
        return array(
            'valid' => empty($errors),
            'errors' => $errors
        );
    }
    
    /**
     * Validate individual option value
     */
    private function validate_option_value($value, $option_schema) {
        $errors = array();
        $type = $option_schema['type'];
        
        switch ($type) {
            case 'select':
                if (isset($option_schema['options'])) {
                    $valid_options = array_keys($option_schema['options']);
                    if (!in_array($value, $valid_options)) {
                        $errors[] = 'Must be one of: ' . implode(', ', $valid_options);
                    }
                }
                break;
                
            case 'boolean':
                if (!is_bool($value) && !in_array($value, array('true', 'false', '0', '1', 0, 1))) {
                    $errors[] = 'Must be a boolean value';
                }
                break;
                
            case 'number':
                if (!is_numeric($value)) {
                    $errors[] = 'Must be a number';
                } else {
                    $num_value = floatval($value);
                    if (isset($option_schema['min']) && $num_value < $option_schema['min']) {
                        $errors[] = 'Must be at least ' . $option_schema['min'];
                    }
                    if (isset($option_schema['max']) && $num_value > $option_schema['max']) {
                        $errors[] = 'Must be at most ' . $option_schema['max'];
                    }
                }
                break;
                
            case 'color':
                if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $value)) {
                    $errors[] = 'Must be a valid hex color (e.g., #ffffff)';
                }
                break;
                
            case 'text':
            case 'string':
            case 'textarea':
                if (!is_string($value)) {
                    $errors[] = 'Must be a string';
                }
                break;
        }
        
        return array(
            'valid' => empty($errors),
            'errors' => $errors
        );
    }
    
    /**
     * Get default configuration for component type
     */
    public function get_default_configuration($component_type) {
        $schema = $this->get_schema($component_type);
        
        if (!$schema) {
            return array();
        }
        
        $config = array(
            'component_type' => $component_type,
            'dataBindings' => isset($schema['dataBindings']) ? $schema['dataBindings'] : array(),
            'componentOptions' => array()
        );
        
        // Extract default values from schema
        if (isset($schema['componentOptions'])) {
            foreach ($schema['componentOptions'] as $key => $option) {
                if (isset($option['default'])) {
                    $config['componentOptions'][$key] = $option['default'];
                }
            }
        }
        
        // Merge with defaultOptions if available
        if (isset($schema['defaultOptions'])) {
            $config['componentOptions'] = array_merge(
                $schema['defaultOptions'],
                $config['componentOptions']
            );
        }
        
        return $config;
    }
}

// Initialize the registry
add_action('init', function() {
    GMKB_Component_Schema_Registry::get_instance();
});
