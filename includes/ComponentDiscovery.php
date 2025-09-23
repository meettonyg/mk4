<?php
/**
 * Component Discovery System for Media Kit Builder
 * 
 * This class automatically discovers and registers components
 * from the components directory, maintaining the self-contained
 * component architecture.
 */

class ComponentDiscovery {
    private $components_dir;
    private $components = [];
    private $component_cache = [];
    
    public function __construct($components_dir = null) {
        $this->components_dir = $components_dir ?: plugin_dir_path(__FILE__) . '../components/';
        $this->discover_components();
    }
    
    /**
     * Discover all components in the components directory
     */
    public function discover_components() {
        // Check cache first
        $cache_key = 'gmkb_discovered_components_v2';
        $cached = get_transient($cache_key);
        
        if ($cached !== false && !defined('WP_DEBUG')) {
            $this->components = $cached;
            return $cached;
        }
        
        // Scan components directory
        if (!is_dir($this->components_dir)) {
            return [];
        }
        
        $directories = glob($this->components_dir . '*', GLOB_ONLYDIR);
        
        foreach ($directories as $dir) {
            $component_type = basename($dir);
            
            // Check for component.json first (new standard)
            $manifest_file = $dir . '/component.json';
            if (file_exists($manifest_file)) {
                $manifest = json_decode(file_get_contents($manifest_file), true);
                if ($manifest) {
                    $this->register_component_from_manifest($component_type, $dir, $manifest);
                    continue;
                }
            }
            
            // Fallback: Check for legacy component files
            $this->discover_legacy_component($component_type, $dir);
        }
        
        // Cache for 1 hour
        set_transient($cache_key, $this->components, HOUR_IN_SECONDS);
        
        return $this->components;
    }
    
    /**
     * Register a component from its manifest file
     */
    private function register_component_from_manifest($type, $dir, $manifest) {
        $component = [
            'type' => $type,
            'name' => $manifest['name'] ?? ucfirst(str_replace('-', ' ', $type)),
            'description' => $manifest['description'] ?? '',
            'category' => $manifest['category'] ?? 'general',
            'version' => $manifest['version'] ?? '1.0.0',
            'path' => $dir,
            'has_vue_renderer' => false,
            'has_php_template' => false,
            'has_js_renderer' => false,
            'has_schema' => false,
            'has_styles' => false,
            'supports' => $manifest['supports'] ?? []
        ];
        
        // Check for renderers
        if (isset($manifest['renderers'])) {
            if (!empty($manifest['renderers']['vue'])) {
                $vue_file = $dir . '/' . $manifest['renderers']['vue'];
                $component['has_vue_renderer'] = file_exists($vue_file);
                $component['vue_renderer_path'] = $manifest['renderers']['vue'];
            }
            
            if (!empty($manifest['renderers']['php'])) {
                $php_file = $dir . '/' . $manifest['renderers']['php'];
                $component['has_php_template'] = file_exists($php_file);
                $component['php_template_path'] = $manifest['renderers']['php'];
            }
            
            if (!empty($manifest['renderers']['javascript'])) {
                $js_file = $dir . '/' . $manifest['renderers']['javascript'];
                $component['has_js_renderer'] = file_exists($js_file);
                $component['js_renderer_path'] = $manifest['renderers']['javascript'];
            }
        }
        
        // Check for other files
        if (!empty($manifest['schema'])) {
            $schema_file = $dir . '/' . $manifest['schema'];
            $component['has_schema'] = file_exists($schema_file);
            if ($component['has_schema']) {
                $component['schema'] = json_decode(file_get_contents($schema_file), true);
            }
        }
        
        if (!empty($manifest['styles'])) {
            $styles_file = $dir . '/' . $manifest['styles'];
            $component['has_styles'] = file_exists($styles_file);
            $component['styles_path'] = $manifest['styles'];
        }
        
        $this->components[$type] = $component;
    }
    
    /**
     * Discover legacy components without manifest files
     */
    private function discover_legacy_component($type, $dir) {
        $component = [
            'type' => $type,
            'name' => ucfirst(str_replace('-', ' ', $type)),
            'path' => $dir,
            'has_vue_renderer' => false,
            'has_php_template' => false,
            'has_js_renderer' => false,
            'has_schema' => false,
            'has_styles' => false,
            'supports' => []
        ];
        
        // Check for Vue renderer (multiple possible names)
        $vue_files = [
            $type . 'Renderer.vue',
            ucfirst(str_replace('-', '', $type)) . 'Renderer.vue',
            'renderer.vue',
            'component.vue'
        ];
        
        foreach ($vue_files as $vue_file) {
            if (file_exists($dir . '/' . $vue_file)) {
                $component['has_vue_renderer'] = true;
                $component['vue_renderer_path'] = $vue_file;
                break;
            }
        }
        
        // Check for PHP template
        if (file_exists($dir . '/template.php')) {
            $component['has_php_template'] = true;
            $component['php_template_path'] = 'template.php';
        }
        
        // Check for JavaScript renderer
        if (file_exists($dir . '/renderer.js')) {
            $component['has_js_renderer'] = true;
            $component['js_renderer_path'] = 'renderer.js';
        }
        
        // Check for schema
        if (file_exists($dir . '/schema.json')) {
            $component['has_schema'] = true;
            $schema_content = file_get_contents($dir . '/schema.json');
            $component['schema'] = json_decode($schema_content, true);
        }
        
        // Check for styles
        if (file_exists($dir . '/styles.css')) {
            $component['has_styles'] = true;
            $component['styles_path'] = 'styles.css';
        }
        
        // Auto-detect support based on files
        $component['supports'] = [
            'serverRender' => $component['has_php_template'],
            'vueRender' => $component['has_vue_renderer'],
            'jsRender' => $component['has_js_renderer'],
            'designPanel' => $component['has_schema']
        ];
        
        $this->components[$type] = $component;
    }
    
    /**
     * Get all discovered components
     */
    public function get_components() {
        return $this->components;
    }
    
    /**
     * Get a specific component by type
     */
    public function get_component($type) {
        return $this->components[$type] ?? null;
    }
    
    /**
     * Check if a component has a Vue renderer
     */
    public function has_vue_renderer($type) {
        return $this->components[$type]['has_vue_renderer'] ?? false;
    }
    
    /**
     * Get components by category
     */
    public function get_components_by_category($category) {
        return array_filter($this->components, function($component) use ($category) {
            return ($component['category'] ?? 'general') === $category;
        });
    }
    
    /**
     * Get components that support a specific feature
     */
    public function get_components_with_support($feature) {
        return array_filter($this->components, function($component) use ($feature) {
            return !empty($component['supports'][$feature]);
        });
    }
    
    /**
     * Clear the component cache
     */
    public function clear_cache() {
        delete_transient('gmkb_discovered_components_v2');
        $this->discover_components();
    }
    
    /**
     * Export component data for JavaScript
     */
    public function export_for_js() {
        $export = [];
        
        foreach ($this->components as $type => $component) {
            // Include only necessary data for frontend
            $export[] = [
                'type' => $type,
                'name' => $component['name'],
                'description' => $component['description'] ?? '',
                'category' => $component['category'] ?? 'general',
                'has_vue_renderer' => $component['has_vue_renderer'],
                'supports' => $component['supports'] ?? [],
                'config' => [
                    'schema' => $component['schema'] ?? null,
                    'requiresServerRender' => !empty($component['supports']['serverRender']) && empty($component['supports']['vueRender'])
                ]
            ];
        }
        
        return $export;
    }
}
