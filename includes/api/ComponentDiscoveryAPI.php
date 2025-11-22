<?php
/**
 * Component Discovery API Endpoint
 * Provides component manifest information for scalable discovery
 */

namespace GMKB;

if (!defined('ABSPATH')) {
    exit;
}

class ComponentDiscoveryAPI {
    
    private $components_dir;
    
    public function __construct() {
        $this->components_dir = GUESTIFY_PLUGIN_DIR . 'components/';
        add_action('rest_api_init', array($this, 'register_routes'));
    }
    
    /**
     * Register REST API routes
     * SECURITY FIX: Require authentication for component discovery
     */
    public function register_routes() {
        register_rest_route('gmkb/v1', '/components/discover', array(
            'methods' => 'GET',
            'callback' => array($this, 'discover_components'),
            'permission_callback' => array($this, 'check_permissions')
        ));

        register_rest_route('gmkb/v1', '/components/(?P<type>[a-z0-9-]+)/manifest', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_component_manifest'),
            'permission_callback' => array($this, 'check_permissions'),
            'args' => array(
                'type' => array(
                    'validate_callback' => function($param) {
                        return preg_match('/^[a-z0-9-]+$/', $param);
                    }
                )
            )
        ));
    }

    /**
     * SECURITY FIX: Permission check - require logged-in user
     */
    public function check_permissions() {
        return is_user_logged_in();
    }
    
    /**
     * Discover all available components
     */
    public function discover_components($request) {
        $components = array();
        
        // Check if components directory exists
        if (!is_dir($this->components_dir)) {
            return rest_ensure_response(array());
        }
        
        // Scan components directory
        $dirs = scandir($this->components_dir);
        
        foreach ($dirs as $dir) {
            // Skip . and .. and non-directories
            if ($dir === '.' || $dir === '..' || !is_dir($this->components_dir . $dir)) {
                continue;
            }
            
            // Check for component.json
            $manifest_file = $this->components_dir . $dir . '/component.json';
            
            if (file_exists($manifest_file)) {
                $manifest = json_decode(file_get_contents($manifest_file), true);
                
                if ($manifest) {
                    // Add directory path for reference
                    $manifest['directory'] = $dir;
                    
                    // Check for actual component files
                    $manifest['files'] = $this->scan_component_files($dir);
                    
                    $components[] = array(
                        'type' => $manifest['type'] ?? $dir,
                        'name' => $manifest['name'] ?? ucfirst(str_replace('-', ' ', $dir)),
                        'manifest' => $manifest,
                        'available' => true
                    );
                }
            } else {
                // Component without manifest - still discoverable
                $components[] = array(
                    'type' => $dir,
                    'name' => ucfirst(str_replace('-', ' ', $dir)),
                    'manifest' => null,
                    'available' => $this->has_component_files($dir)
                );
            }
        }
        
        return rest_ensure_response($components);
    }
    
    /**
     * Get specific component manifest
     */
    public function get_component_manifest($request) {
        $type = $request->get_param('type');
        $manifest_file = $this->components_dir . $type . '/component.json';
        
        if (file_exists($manifest_file)) {
            $manifest = json_decode(file_get_contents($manifest_file), true);
            
            if ($manifest) {
                // Add additional metadata
                $manifest['directory'] = $type;
                $manifest['files'] = $this->scan_component_files($type);
                // SECURITY FIX: Don't expose full server paths in API responses

                return rest_ensure_response($manifest);
            }
        }

        // Return basic info even without manifest
        if (is_dir($this->components_dir . $type)) {
            return rest_ensure_response(array(
                'type' => $type,
                'name' => ucfirst(str_replace('-', ' ', $type)),
                'directory' => $type,
                'files' => $this->scan_component_files($type)
                // SECURITY FIX: Removed path exposure
            ));
        }
        
        return new \WP_Error('not_found', 'Component not found', array('status' => 404));
    }
    
    /**
     * Scan component directory for files
     */
    private function scan_component_files($dir) {
        $component_dir = $this->components_dir . $dir;
        $files = array();
        
        // Check for common component files
        $file_patterns = array(
            'vue' => array('*.vue', ucfirst($this->to_pascal_case($dir)) . '.vue'),
            'renderer' => array('*Renderer.vue', 'renderer.vue'),
            'editor' => array('*Editor.vue', 'editor.vue'),
            'styles' => array('styles.css', 'style.css'),
            'script' => array('script.js', 'index.js'),
            'template' => array('template.php', 'render.php'),
            'schema' => array('schema.json', 'config.json')
        );
        
        foreach ($file_patterns as $type => $patterns) {
            foreach ($patterns as $pattern) {
                $matches = glob($component_dir . '/' . $pattern);
                if (!empty($matches)) {
                    $files[$type] = basename($matches[0]);
                    break;
                }
            }
        }
        
        return $files;
    }
    
    /**
     * Check if component has necessary files
     */
    private function has_component_files($dir) {
        $component_dir = $this->components_dir . $dir;
        
        // Must have at least one renderer file
        $required_patterns = array(
            '*.vue',
            'template.php',
            'renderer.js'
        );
        
        foreach ($required_patterns as $pattern) {
            $matches = glob($component_dir . '/' . $pattern);
            if (!empty($matches)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Convert kebab-case to PascalCase
     */
    private function to_pascal_case($str) {
        return str_replace(' ', '', ucwords(str_replace('-', ' ', $str)));
    }
}

// Initialize the API
new ComponentDiscoveryAPI();
