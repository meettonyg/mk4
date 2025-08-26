<?php
/**
 * Component Integration Registry
 * 
 * PHASE 1 ARCHITECTURAL FIX: Central registry for component integrations
 * Manages discovery, loading, and coordination of component-level integrations
 * 
 * @package Guestify/System
 * @version 1.0.0-phase1-component-isolation
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Component Integration Registry
 * Central registry for managing component-specific data integrations
 */
class Component_Integration_Registry {
    
    /**
     * Registry of component integrations
     */
    private static $integrations = array();
    
    /**
     * Registry of component paths
     */
    private static $component_paths = array();
    
    /**
     * Initialization status
     */
    private static $initialized = false;
    
    /**
     * Initialize the registry
     */
    public static function initialize() {
        if (self::$initialized) {
            return;
        }
        
        // Register component integrations
        self::register_component_integrations();
        
        // Load all registered integrations
        self::load_integrations();
        
        self::$initialized = true;
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ Component Integration Registry: Initialized with ' . count(self::$integrations) . ' integrations');
        }
    }
    
    /**
     * Register all component integrations
     */
    private static function register_component_integrations() {
        $components_dir = GUESTIFY_PLUGIN_DIR . 'components/';
        
        // PHASE 1: Core component integrations
        $component_configs = array(
            'topics' => array(
                'class' => 'Topics_Pods_Integration',
                'file' => 'Topics_Pods_Integration.php',
                'path' => $components_dir . 'topics/',
                'fields' => array('topic_1', 'topic_2', 'topic_3', 'topic_4', 'topic_5')
            ),
            'biography' => array(
                'class' => 'Biography_Pods_Integration',
                'file' => 'Biography_Pods_Integration.php',
                'path' => $components_dir . 'biography/',
                'fields' => array('biography_name', 'biography_short', 'biography_medium', 'biography_long')
            ),
            'authority_hook' => array(
                'class' => 'Authority_Hook_Pods_Integration',
                'file' => 'Authority_Hook_Pods_Integration.php',
                'path' => $components_dir . 'authority-hook/',
                'fields' => array('authority_hook_who', 'authority_hook_what', 'authority_hook_why', 'authority_hook_how')
            ),
            'questions' => array(
                'class' => 'Questions_Pods_Integration',
                'file' => 'Questions_Pods_Integration.php',
                'path' => $components_dir . 'questions/',
                'fields' => array('question_1', 'question_2', 'question_3', 'question_4', 'question_5')
            ),
            'social' => array(
                'class' => 'Social_Pods_Integration',
                'file' => 'Social_Pods_Integration.php',
                'path' => $components_dir . 'social/',
                'fields' => array('social_twitter', 'social_linkedin', 'social_instagram', 'social_facebook')
            )
        );
        
        foreach ($component_configs as $component_type => $config) {
            self::register_integration($component_type, $config);
        }
    }
    
    /**
     * Register a component integration
     * 
     * @param string $component_type Component type identifier
     * @param array $config Integration configuration
     */
    public static function register_integration($component_type, $config) {
        self::$integrations[$component_type] = $config;
        self::$component_paths[$component_type] = $config['path'];
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Component Registry: Registered {$component_type} integration");
        }
    }
    
    /**
     * Load all registered integrations
     */
    private static function load_integrations() {
        foreach (self::$integrations as $component_type => $config) {
            self::load_integration($component_type, $config);
        }
    }
    
    /**
     * Load a specific integration
     * 
     * @param string $component_type Component type
     * @param array $config Integration configuration
     */
    private static function load_integration($component_type, $config) {
        $file_path = $config['path'] . $config['file'];
        
        if (file_exists($file_path)) {
            require_once $file_path;
            
            if (class_exists($config['class'])) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("Component Registry: Loaded {$component_type} integration class");
                }
            } else {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("Component Registry: ERROR - Class {$config['class']} not found after loading file");
                }
            }
        } else {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("Component Registry: ERROR - Integration file not found: {$file_path}");
            }
        }
    }
    
    /**
     * Get integration for component type
     * 
     * @param string $component_type Component type
     * @return array|null Integration config or null if not found
     */
    public static function get_integration($component_type) {
        if (!self::$initialized) {
            self::initialize();
        }
        
        return isset(self::$integrations[$component_type]) ? self::$integrations[$component_type] : null;
    }
    
    /**
     * Get integration class for component type
     * 
     * @param string $component_type Component type
     * @return string|null Integration class name or null if not found
     */
    public static function get_integration_class($component_type) {
        $integration = self::get_integration($component_type);
        return $integration ? $integration['class'] : null;
    }
    
    /**
     * Check if component has integration
     * 
     * @param string $component_type Component type
     * @return bool True if integration exists
     */
    public static function has_integration($component_type) {
        if (!self::$initialized) {
            self::initialize();
        }
        
        return isset(self::$integrations[$component_type]);
    }
    
    /**
     * Get all registered component types
     * 
     * @return array Array of component types
     */
    public static function get_component_types() {
        if (!self::$initialized) {
            self::initialize();
        }
        
        return array_keys(self::$integrations);
    }
    
    /**
     * Load component data using appropriate integration
     * 
     * @param string $component_type Component type
     * @param int $post_id Post ID
     * @return array Component data or error result
     */
    public static function load_component_data($component_type, $post_id) {
        $integration_class = self::get_integration_class($component_type);
        
        if (!$integration_class) {
            return array(
                'success' => false,
                'message' => "No integration found for component type: {$component_type}",
                'component_type' => $component_type,
                'post_id' => $post_id
            );
        }
        
        if (!class_exists($integration_class)) {
            return array(
                'success' => false,
                'message' => "Integration class not found: {$integration_class}",
                'component_type' => $component_type,
                'post_id' => $post_id
            );
        }
        
        try {
            return call_user_func(array($integration_class, 'load_component_data'), $post_id);
        } catch (Exception $e) {
            return array(
                'success' => false,
                'message' => "Error loading {$component_type} data: " . $e->getMessage(),
                'component_type' => $component_type,
                'post_id' => $post_id
            );
        }
    }
    
    /**
     * Save component data using appropriate integration
     * 
     * @param string $component_type Component type
     * @param int $post_id Post ID
     * @param array $data Component data
     * @return array Save result
     */
    public static function save_component_data($component_type, $post_id, $data) {
        $integration_class = self::get_integration_class($component_type);
        
        if (!$integration_class) {
            return array(
                'success' => false,
                'message' => "No integration found for component type: {$component_type}",
                'component_type' => $component_type,
                'post_id' => $post_id
            );
        }
        
        if (!class_exists($integration_class)) {
            return array(
                'success' => false,
                'message' => "Integration class not found: {$integration_class}",
                'component_type' => $component_type,
                'post_id' => $post_id
            );
        }
        
        try {
            return call_user_func(array($integration_class, 'save_component_data'), $post_id, $data);
        } catch (Exception $e) {
            return array(
                'success' => false,
                'message' => "Error saving {$component_type} data: " . $e->getMessage(),
                'component_type' => $component_type,
                'post_id' => $post_id
            );
        }
    }
    
    /**
     * Check if component has data using appropriate integration
     * 
     * @param string $component_type Component type
     * @param int $post_id Post ID
     * @return bool True if component has data
     */
    public static function has_component_data($component_type, $post_id) {
        $integration_class = self::get_integration_class($component_type);
        
        if (!$integration_class || !class_exists($integration_class)) {
            return false;
        }
        
        try {
            return call_user_func(array($integration_class, 'has_component_data'), $post_id);
        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("Component Registry: Error checking {$component_type} data: " . $e->getMessage());
            }
            return false;
        }
    }
    
    /**
     * Get data availability for component using appropriate integration
     * 
     * @param string $component_type Component type
     * @param int $post_id Post ID
     * @return array Availability information
     */
    public static function get_component_availability($component_type, $post_id) {
        $integration_class = self::get_integration_class($component_type);
        
        if (!$integration_class || !class_exists($integration_class)) {
            return array(
                'has_data' => false,
                'component_type' => $component_type,
                'error' => 'Integration not available'
            );
        }
        
        try {
            return call_user_func(array($integration_class, 'get_data_availability'), $post_id);
        } catch (Exception $e) {
            return array(
                'has_data' => false,
                'component_type' => $component_type,
                'error' => $e->getMessage()
            );
        }
    }
    
    /**
     * Calculate content hash for component using appropriate integration
     * 
     * @param string $component_type Component type
     * @param int $post_id Post ID
     * @return string Content hash
     */
    public static function calculate_component_hash($component_type, $post_id) {
        $integration_class = self::get_integration_class($component_type);
        
        if (!$integration_class || !class_exists($integration_class)) {
            return '';
        }
        
        try {
            return call_user_func(array($integration_class, 'calculate_content_hash'), $post_id);
        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("Component Registry: Error calculating {$component_type} hash: " . $e->getMessage());
            }
            return '';
        }
    }
    
    /**
     * Get comprehensive post data from all components
     * 
     * @param int $post_id Post ID
     * @return array Comprehensive post data
     */
    public static function get_post_data_comprehensive($post_id) {
        $result = array(
            'post_id' => $post_id,
            'components' => array(),
            'availability' => array(),
            'success' => true,
            'message' => '',
            'timestamp' => current_time('mysql'),
            'total_components' => 0,
            'components_with_data' => 0
        );
        
        if (!is_numeric($post_id) || intval($post_id) <= 0) {
            $result['success'] = false;
            $result['message'] = 'Invalid post ID';
            return $result;
        }
        
        foreach (self::get_component_types() as $component_type) {
            $result['total_components']++;
            
            // Load component data
            $component_data = self::load_component_data($component_type, $post_id);
            $result['components'][$component_type] = $component_data;
            
            // Get availability info
            $availability = self::get_component_availability($component_type, $post_id);
            $result['availability'][$component_type] = $availability;
            
            if ($availability['has_data']) {
                $result['components_with_data']++;
            }
        }
        
        $result['message'] = "Loaded data from {$result['components_with_data']} of {$result['total_components']} components";
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Component Registry: {$result['message']} for post {$post_id}");
        }
        
        return $result;
    }
    
    /**
     * Get registry statistics
     * 
     * @return array Registry statistics
     */
    public static function get_registry_stats() {
        if (!self::$initialized) {
            self::initialize();
        }
        
        $stats = array(
            'total_integrations' => count(self::$integrations),
            'initialized' => self::$initialized,
            'component_types' => self::get_component_types(),
            'integration_classes' => array()
        );
        
        foreach (self::$integrations as $component_type => $config) {
            $stats['integration_classes'][$component_type] = array(
                'class' => $config['class'],
                'file' => $config['file'],
                'exists' => class_exists($config['class']),
                'field_count' => count($config['fields'])
            );
        }
        
        return $stats;
    }
}

// Auto-initialize when WordPress is ready
add_action('init', array('Component_Integration_Registry', 'initialize'));

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ PHASE 1: Component Integration Registry loaded - Central component management');
}
