<?php
/**
 * REST API Templates Endpoint
 * 
 * Provides batch template loading functionality to eliminate race conditions
 * and improve performance by loading all templates in a single request.
 * 
 * @package Guestify_Media_Kit_Builder
 * @since 2.2.0
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class GMKB_REST_Templates_Controller {
    
    /**
     * Namespace for REST routes
     */
    const NAMESPACE = 'guestify/v1';
    
    /**
     * Base for routes
     */
    const BASE = 'templates';
    
    /**
     * Template cache duration in seconds (1 hour)
     */
    const CACHE_DURATION = 3600;
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }
    
    /**
     * Register REST routes
     */
    public function register_routes() {
        // Batch endpoint - returns all templates
        register_rest_route(self::NAMESPACE, '/' . self::BASE . '/batch', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($this, 'get_all_templates'),
            'permission_callback' => '__return_true',
            'args'                => array(
                'version' => array(
                    'description' => 'Client version for cache validation',
                    'type'        => 'string',
                    'required'    => false
                )
            )
        ));
        
        // Individual template endpoint (for backward compatibility)
        register_rest_route(self::NAMESPACE, '/' . self::BASE . '/(?P<type>[a-zA-Z0-9\-]+)', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($this, 'get_single_template'),
            'permission_callback' => '__return_true',
            'args'                => array(
                'type' => array(
                    'description' => 'Component type',
                    'type'        => 'string',
                    'required'    => true,
                    'validate_callback' => function($param) {
                        return preg_match('/^[a-zA-Z0-9\-]+$/', $param);
                    }
                )
            )
        ));
    }
    
    /**
     * Get all component templates in a single response
     * 
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response|WP_Error
     */
    public function get_all_templates($request) {
        $start_time = microtime(true);
        
        // Check if client has cached version
        $client_version = $request->get_param('version');
        $current_version = $this->get_templates_version();
        
        // Set cache headers
        $cache_headers = array(
            'Cache-Control' => 'public, max-age=' . self::CACHE_DURATION,
            'ETag'         => '"' . $current_version . '"',
            'Last-Modified' => gmdate('D, d M Y H:i:s', strtotime($current_version)) . ' GMT'
        );
        
        // Check if client cache is still valid
        if ($client_version === $current_version) {
            return new WP_REST_Response(array(
                'cached' => true,
                'version' => $current_version
            ), 304, $cache_headers);
        }
        
        // Get component discovery instance
        $plugin = Guestify_Media_Kit_Builder::get_instance();
        $discovery = $plugin->get_component_discovery();
        $components = $discovery->getComponents();
        
        $templates = array();
        $errors = array();
        
        // Load all templates
        foreach ($components as $type => $component) {
            $template_path = GMKB_PLUGIN_DIR . 'components/' . $type . '/template.php';
            
            if (file_exists($template_path)) {
                // Capture template content
                ob_start();
                include $template_path;
                $template_content = ob_get_clean();
                
                // Get template metadata
                $templates[$type] = array(
                    'html'        => $template_content,
                    'name'        => $component['name'],
                    'category'    => $component['category'],
                    'description' => $component['description'] ?? '',
                    'isPremium'   => $component['isPremium'] ?? false,
                    'version'     => $component['version'] ?? '1.0.0',
                    'schema'      => $this->get_component_schema($type)
                );
            } else {
                $errors[] = array(
                    'type'    => $type,
                    'message' => 'Template file not found'
                );
            }
        }
        
        // Add preset templates info
        $preset_templates = $this->get_preset_templates();
        
        $load_time = round((microtime(true) - $start_time) * 1000, 2);
        
        $response_data = array(
            'success'   => true,
            'version'   => $current_version,
            'templates' => $templates,
            'presets'   => $preset_templates,
            'errors'    => $errors,
            'meta'      => array(
                'total_templates'  => count($templates),
                'load_time_ms'     => $load_time,
                'cache_duration'   => self::CACHE_DURATION,
                'timestamp'        => current_time('mysql')
            )
        );
        
        return new WP_REST_Response($response_data, 200, $cache_headers);
    }
    
    /**
     * Get single template (backward compatibility)
     * 
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response|WP_Error
     */
    public function get_single_template($request) {
        $type = $request->get_param('type');
        $template_path = GMKB_PLUGIN_DIR . 'components/' . $type . '/template.php';
        
        if (!file_exists($template_path)) {
            return new WP_Error(
                'template_not_found',
                sprintf('Template for component type "%s" not found', $type),
                array('status' => 404)
            );
        }
        
        // Capture template content
        ob_start();
        include $template_path;
        $template_content = ob_get_clean();
        
        $response_data = array(
            'success' => true,
            'type'    => $type,
            'html'    => $template_content
        );
        
        return new WP_REST_Response($response_data, 200);
    }
    
    /**
     * Get templates version for cache validation
     * 
     * @return string Version string
     */
    private function get_templates_version() {
        // Use plugin version + last modified time of components directory
        $components_dir = GMKB_PLUGIN_DIR . 'components';
        $last_modified = filemtime($components_dir);
        
        return GMKB_VERSION . '-' . $last_modified;
    }
    
    /**
     * Get component schema if available
     * 
     * @param string $type Component type
     * @return array|null Schema data or null
     */
    private function get_component_schema($type) {
        $schema_path = GMKB_PLUGIN_DIR . 'components/' . $type . '/schema.json';
        
        if (file_exists($schema_path)) {
            $schema_content = file_get_contents($schema_path);
            return json_decode($schema_content, true);
        }
        
        return null;
    }
    
    /**
     * Get preset templates information
     * 
     * @return array Preset templates data
     */
    private function get_preset_templates() {
        $presets_dir = GMKB_PLUGIN_DIR . 'templates/presets/';
        $presets = array();
        
        if (is_dir($presets_dir)) {
            $files = glob($presets_dir . '*.json');
            
            foreach ($files as $file) {
                $preset_id = basename($file, '.json');
                $preset_data = json_decode(file_get_contents($file), true);
                
                if ($preset_data) {
                    $presets[$preset_id] = array(
                        'name'        => $preset_data['name'] ?? $preset_id,
                        'description' => $preset_data['description'] ?? '',
                        'thumbnail'   => $preset_data['thumbnail'] ?? '',
                        'components'  => count($preset_data['components'] ?? array()),
                        'version'     => $preset_data['version'] ?? '1.0.0'
                    );
                }
            }
        }
        
        return $presets;
    }
}

// Initialize the controller
new GMKB_REST_Templates_Controller();
