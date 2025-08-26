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
     * 
     * @return array Component schemas
     */
    private static function load_schemas() {
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
                    ),
                    'imageStyle' => array(
                        'type' => 'select',
                        'label' => 'Image Style',
                        'default' => 'rounded',
                        'options' => array(
                            'rounded' => 'Rounded',
                            'circle' => 'Circle',
                            'square' => 'Square'
                        ),
                        'section' => 'appearance'
                    ),
                    'showSocialLinks' => array(
                        'type' => 'boolean',
                        'label' => 'Show Social Links',
                        'default' => true,
                        'section' => 'content'
                    ),
                    'backgroundColor' => array(
                        'type' => 'color',
                        'label' => 'Background Color',
                        'default' => '#ffffff',
                        'section' => 'appearance'
                    ),
                    'textColor' => array(
                        'type' => 'color',
                        'label' => 'Text Color',
                        'default' => '#333333',
                        'section' => 'appearance'
                    )
                ),
                'responsiveBehavior' => array(
                    'mobile' => 'stack_vertical',
                    'tablet' => 'maintain_layout'
                ),
                'sections' => array(
                    'content' => array(
                        'title' => 'Content',
                        'order' => 1
                    ),
                    'layout' => array(
                        'title' => 'Layout',
                        'order' => 2
                    ),
                    'appearance' => array(
                        'title' => 'Appearance',
                        'order' => 3
                    )
                )
            ),
            
            'topics' => array(
                'name' => 'Speaking Topics',
                'description' => 'Areas of expertise and speaking topics',
                'category' => 'essential',
                'dataBindings' => array(
                    'topics' => 'speaking_topics',
                    'expertise' => 'areas_of_expertise'
                ),
                'componentOptions' => array(
                    'layout' => array(
                        'type' => 'select',
                        'label' => 'Display Layout',
                        'default' => 'grid',
                        'options' => array(
                            'list' => 'Vertical List',
                            'grid' => 'Grid Layout',
                            'tags' => 'Tag Cloud'
                        ),
                        'section' => 'layout'
                    ),
                    'maxTopics' => array(
                        'type' => 'number',
                        'label' => 'Maximum Topics to Show',
                        'default' => 6,
                        'min' => 1,
                        'max' => 20,
                        'section' => 'content'
                    ),
                    'showPriority' => array(
                        'type' => 'boolean',
                        'label' => 'Show Priority Indicators',
                        'default' => false,
                        'section' => 'content'
                    ),
                    'columnsDesktop' => array(
                        'type' => 'select',
                        'label' => 'Desktop Columns',
                        'default' => '3',
                        'options' => array(
                            '2' => '2 Columns',
                            '3' => '3 Columns',
                            '4' => '4 Columns'
                        ),
                        'section' => 'layout'
                    )
                ),
                'sections' => array(
                    'content' => array(
                        'title' => 'Content Options',
                        'order' => 1
                    ),
                    'layout' => array(
                        'title' => 'Layout Settings',
                        'order' => 2
                    )
                )
            ),
            
            'contact' => array(
                'name' => 'Contact Information',
                'description' => 'Contact details and communication methods',
                'category' => 'essential',
                'dataBindings' => array(
                    'email' => 'email',
                    'phone' => 'phone',
                    'website' => 'website',
                    'location' => 'location'
                ),
                'componentOptions' => array(
                    'layout' => array(
                        'type' => 'select',
                        'label' => 'Layout Style',
                        'default' => 'vertical',
                        'options' => array(
                            'vertical' => 'Vertical List',
                            'horizontal' => 'Horizontal Row',
                            'grid' => 'Grid Layout'
                        ),
                        'section' => 'layout'
                    ),
                    'showIcons' => array(
                        'type' => 'boolean',
                        'label' => 'Show Icons',
                        'default' => true,
                        'section' => 'appearance'
                    ),
                    'showLabels' => array(
                        'type' => 'boolean',
                        'label' => 'Show Field Labels',
                        'default' => true,
                        'section' => 'appearance'
                    )
                ),
                'sections' => array(
                    'layout' => array(
                        'title' => 'Layout Options',
                        'order' => 1
                    ),
                    'appearance' => array(
                        'title' => 'Appearance',
                        'order' => 2
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
     * Validate component configuration against schema
     * 
     * @param string $component_type Component type
     * @param array $configuration Component configuration
     * @return array Validation result
     */
    public static function validate_configuration($component_type, $configuration) {
        $schema = self::get_schema($component_type);
        if (!$schema) {
            return array(
                'valid' => false,
                'errors' => array("Unknown component type: {$component_type}")
            );
        }
        
        $errors = array();
        $componentOptions = isset($configuration['componentOptions']) ? $configuration['componentOptions'] : array();
        
        // Validate component options
        foreach ($componentOptions as $optionKey => $optionValue) {
            $optionSchema = isset($schema['componentOptions'][$optionKey]) ? $schema['componentOptions'][$optionKey] : null;
            if (!$optionSchema) {
                $errors[] = "Unknown option: {$optionKey}";
                continue;
            }
            
            $validationResult = self::validate_option_value($optionValue, $optionSchema);
            if (!$validationResult['valid']) {
                $errors[] = "Invalid value for {$optionKey}: " . implode(', ', $validationResult['errors']);
            }
        }
        
        return array(
            'valid' => empty($errors),
            'errors' => $errors
        );
    }
    
    /**
     * Validate individual option value
     * 
     * @param mixed $value Option value
     * @param array $optionSchema Option schema
     * @return array Validation result
     */
    private static function validate_option_value($value, $optionSchema) {
        $errors = array();
        $type = $optionSchema['type'];
        
        switch ($type) {
            case 'select':
                $validOptions = array_keys($optionSchema['options']);
                if (!in_array($value, $validOptions)) {
                    $errors[] = 'Must be one of: ' . implode(', ', $validOptions);
                }
                break;
                
            case 'boolean':
                if (!is_bool($value) && !in_array($value, array(0, 1, '0', '1', 'true', 'false'))) {
                    $errors[] = 'Must be a boolean value';
                }
                break;
                
            case 'number':
                if (!is_numeric($value)) {
                    $errors[] = 'Must be a number';
                } else {
                    $numValue = (float)$value;
                    if (isset($optionSchema['min']) && $numValue < $optionSchema['min']) {
                        $errors[] = "Must be at least {$optionSchema['min']}";
                    }
                    if (isset($optionSchema['max']) && $numValue > $optionSchema['max']) {
                        $errors[] = "Must be at most {$optionSchema['max']}";
                    }
                }
                break;
                
            case 'color':
                if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $value)) {
                    $errors[] = 'Must be a valid hex color (e.g., #ffffff)';
                }
                break;
                
            case 'string':
            case 'text':
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
     * 
     * @return array JavaScript-formatted schemas
     */
    public static function get_js_schemas() {
        $schemas = self::get_schemas();
        
        // Format for JavaScript - ensure proper JSON serialization
        $js_schemas = array();
        
        foreach ($schemas as $type => $schema) {
            $js_schemas[$type] = array(
                'name' => $schema['name'],
                'description' => $schema['description'],
                'category' => $schema['category'],
                'dataBindings' => isset($schema['dataBindings']) ? $schema['dataBindings'] : array(),
                'componentOptions' => isset($schema['componentOptions']) ? $schema['componentOptions'] : array(),
                'responsiveBehavior' => isset($schema['responsiveBehavior']) ? $schema['responsiveBehavior'] : array(),
                'sections' => isset($schema['sections']) ? $schema['sections'] : array(),
                'version' => '2.0.0-phase2'
            );
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
