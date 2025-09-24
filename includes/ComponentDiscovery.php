<?php
/**
 * Component Discovery Service
 * 
 * Automatically discovers and registers all components in the /components/ directory
 * This is the single source of truth for available components
 * 
 * @package GMKB
 * @since 2.0.0
 */

namespace GMKB;

class ComponentDiscovery {
    
    /**
     * @var array Discovered components cache
     */
    private static $components_cache = null;
    
    /**
     * @var string Components directory path
     */
    private $components_dir;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->components_dir = GMKB_PLUGIN_DIR . 'components/';
    }
    
    /**
     * Discover all available components
     * 
     * @return array Array of component definitions
     */
    public function discover_components() {
        // Return cached components if available
        if (self::$components_cache !== null) {
            return self::$components_cache;
        }
        
        $components = [];
        
        // Check if components directory exists
        if (!is_dir($this->components_dir)) {
            error_log('[GMKB] Components directory not found: ' . $this->components_dir);
            return $components;
        }
        
        // Scan components directory
        $directories = scandir($this->components_dir);
        
        foreach ($directories as $dir) {
            // Skip special directories and files
            if ($dir === '.' || $dir === '..' || !is_dir($this->components_dir . $dir)) {
                continue;
            }
            
            // Skip documentation files
            if (in_array($dir, ['DATA-INTEGRATION-PATTERN.md', 'README.md', 'TEMPLATE-FALLBACK-PATTERN.md'])) {
                continue;
            }
            
            // Look for component.json
            $component_json_path = $this->components_dir . $dir . '/component.json';
            
            if (file_exists($component_json_path)) {
                $component_data = $this->load_component_manifest($component_json_path, $dir);
                if ($component_data) {
                    $components[] = $component_data;
                }
            } else {
                // Fallback: Try to load from schema.json for legacy components
                $schema_json_path = $this->components_dir . $dir . '/schema.json';
                if (file_exists($schema_json_path)) {
                    $component_data = $this->load_legacy_component($schema_json_path, $dir);
                    if ($component_data) {
                        $components[] = $component_data;
                    }
                }
            }
        }
        
        // Cache the discovered components
        self::$components_cache = $components;
        
        // Log discovered components for debugging
        error_log('[GMKB] Discovered ' . count($components) . ' components');
        
        return $components;
    }
    
    /**
     * Load component manifest from component.json
     * 
     * @param string $json_path Path to component.json file
     * @param string $directory Component directory name
     * @return array|false Component data or false on failure
     */
    private function load_component_manifest($json_path, $directory) {
        $json_content = file_get_contents($json_path);
        if (!$json_content) {
            error_log('[GMKB] Failed to read component.json: ' . $json_path);
            return false;
        }
        
        $manifest = json_decode($json_content, true);
        if (!$manifest) {
            error_log('[GMKB] Invalid JSON in component.json: ' . $json_path);
            return false;
        }
        
        // Build component data structure
        $component = [
            'id' => $directory,
            'type' => $manifest['type'] ?? $directory,
            'name' => $manifest['name'] ?? $this->format_name($directory),
            'title' => $manifest['name'] ?? $this->format_name($directory),
            'description' => $manifest['description'] ?? '',
            'category' => $manifest['category'] ?? 'general',
            'version' => $manifest['version'] ?? '1.0.0',
            'icon' => $this->find_icon($directory),
            'directory' => $directory,
            'renderers' => $manifest['renderers'] ?? [],
            'supports' => $manifest['supports'] ?? [],
            'schema_path' => $manifest['schema'] ?? 'schema.json',
            'styles' => $manifest['styles'] ?? 'styles.css'
        ];
        
        // Load schema if available
        $schema_path = $this->components_dir . $directory . '/' . $component['schema_path'];
        if (file_exists($schema_path)) {
            $schema_content = file_get_contents($schema_path);
            if ($schema_content) {
                $component['schema'] = json_decode($schema_content, true);
            }
        }
        
        // ROOT FIX: Check for pods-config.json (self-contained data configuration)
        $pods_config_path = $this->components_dir . $directory . '/pods-config.json';
        if (file_exists($pods_config_path)) {
            $pods_content = file_get_contents($pods_config_path);
            if ($pods_content) {
                $component['pods_config'] = json_decode($pods_content, true);
                $component['supports']['podsData'] = true;
            }
        }
        
        return $component;
    }
    
    /**
     * Load legacy component without component.json
     * 
     * @param string $schema_path Path to schema.json file
     * @param string $directory Component directory name
     * @return array|false Component data or false on failure
     */
    private function load_legacy_component($schema_path, $directory) {
        $schema_content = file_get_contents($schema_path);
        if (!$schema_content) {
            return false;
        }
        
        $schema = json_decode($schema_content, true);
        if (!$schema) {
            return false;
        }
        
        // Build component data from schema
        $component = [
            'id' => $directory,
            'type' => $schema['type'] ?? $directory,
            'name' => $schema['name'] ?? $this->format_name($directory),
            'title' => $schema['title'] ?? $schema['name'] ?? $this->format_name($directory),
            'description' => $schema['description'] ?? '',
            'category' => $schema['category'] ?? 'general',
            'version' => '1.0.0',
            'icon' => $this->find_icon($directory),
            'directory' => $directory,
            'renderers' => $this->detect_renderers($directory),
            'supports' => [
                'serverRender' => file_exists($this->components_dir . $directory . '/template.php'),
                'vueRender' => $this->has_vue_renderer($directory),
                'inlineEdit' => true,
                'designPanel' => true
            ],
            'schema' => $schema,
            'schema_path' => 'schema.json',
            'styles' => file_exists($this->components_dir . $directory . '/styles.css') ? 'styles.css' : null
        ];
        
        // ROOT FIX: Check for pods-config.json in legacy components too
        $pods_config_path = $this->components_dir . $directory . '/pods-config.json';
        if (file_exists($pods_config_path)) {
            $pods_content = file_get_contents($pods_config_path);
            if ($pods_content) {
                $component['pods_config'] = json_decode($pods_content, true);
                $component['supports']['podsData'] = true;
            }
        }
        
        return $component;
    }
    
    /**
     * Detect available renderers for a component
     * 
     * @param string $directory Component directory name
     * @return array Renderers configuration
     */
    private function detect_renderers($directory) {
        $renderers = [];
        $base_path = $this->components_dir . $directory . '/';
        
        if (file_exists($base_path . 'template.php')) {
            $renderers['php'] = 'template.php';
        }
        
        if (file_exists($base_path . 'renderer.js')) {
            $renderers['javascript'] = 'renderer.js';
        }
        
        // Check for Vue renderer variants
        $vue_files = [
            ucfirst($directory) . 'Renderer.vue',
            ucfirst($directory) . '.vue',
            'renderer.vue',
            'Renderer.vue'
        ];
        
        foreach ($vue_files as $vue_file) {
            if (file_exists($base_path . $vue_file)) {
                $renderers['vue'] = $vue_file;
                break;
            }
        }
        
        return $renderers;
    }
    
    /**
     * Check if component has Vue renderer
     * 
     * @param string $directory Component directory name
     * @return bool
     */
    private function has_vue_renderer($directory) {
        $base_path = $this->components_dir . $directory . '/';
        
        $vue_files = [
            ucfirst($directory) . 'Renderer.vue',
            ucfirst($directory) . '.vue',
            'renderer.vue',
            'Renderer.vue'
        ];
        
        foreach ($vue_files as $vue_file) {
            if (file_exists($base_path . $vue_file)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Find icon file for component
     * 
     * @param string $directory Component directory name
     * @return string|null Icon filename or null if not found
     */
    private function find_icon($directory) {
        $base_path = $this->components_dir . $directory . '/';
        
        // Check for various icon file patterns
        $icon_patterns = [
            $directory . '.svg',
            $directory . '-icon.svg',
            'icon.svg',
            $directory . '.png',
            'icon.png'
        ];
        
        foreach ($icon_patterns as $pattern) {
            if (file_exists($base_path . $pattern)) {
                return $pattern;
            }
        }
        
        // Check for any SVG file
        $files = scandir($base_path);
        foreach ($files as $file) {
            if (pathinfo($file, PATHINFO_EXTENSION) === 'svg') {
                return $file;
            }
        }
        
        return null;
    }
    
    /**
     * Format directory name to readable name
     * 
     * @param string $directory Directory name
     * @return string Formatted name
     */
    private function format_name($directory) {
        // Convert hyphenated names to Title Case
        $name = str_replace('-', ' ', $directory);
        $name = ucwords($name);
        return $name;
    }
    
    /**
     * Get a single component by type/id
     * 
     * @param string $type Component type/id
     * @return array|null Component data or null if not found
     */
    public function get_component($type) {
        $components = $this->discover_components();
        
        foreach ($components as $component) {
            if ($component['type'] === $type || $component['id'] === $type) {
                return $component;
            }
        }
        
        return null;
    }
    
    /**
     * Get components by category
     * 
     * @param string $category Category name
     * @return array Components in the category
     */
    public function get_components_by_category($category) {
        $components = $this->discover_components();
        $filtered = [];
        
        foreach ($components as $component) {
            if ($component['category'] === $category) {
                $filtered[] = $component;
            }
        }
        
        return $filtered;
    }
    
    /**
     * Get all component categories
     * 
     * @return array List of categories
     */
    public function get_categories() {
        $components = $this->discover_components();
        $categories = [];
        
        foreach ($components as $component) {
            $category = $component['category'];
            if (!in_array($category, $categories)) {
                $categories[] = $category;
            }
        }
        
        return $categories;
    }
    
    /**
     * Clear components cache
     */
    public function clear_cache() {
        self::$components_cache = null;
    }
}
