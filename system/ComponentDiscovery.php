<?php
/**
 * Component Discovery System
 * 
 * This file handles scanning the components directory, loading component data,
 * and organizing components by category.
 */

class ComponentDiscovery {
    private $componentsDir;
    private $categories = [];
    private $components = [];
    private $aliases = [];
    
    /**
     * Component type aliases mapping
     * Maps requested component types to actual directory names
     */
    private $component_aliases = array(
        'bio' => 'biography',
        'social-links' => 'social',
        'social-media' => 'social',
        'authority' => 'authority-hook',
        'cta' => 'call-to-action',
        'booking' => 'booking-calendar',
        'gallery' => 'photo-gallery',
        'player' => 'podcast-player',
        'intro' => 'guest-intro',
        'video' => 'video-intro',
        'logos' => 'logo-grid'
    );

    /**
     * Constructor
     * 
     * @param string $componentsDir Path to the components directory
     */
    public function __construct($componentsDir) {
        $this->componentsDir = $componentsDir;
    }

    /**
     * Scan components directory and load component data
     * Uses WordPress transients for caching to improve performance
     * 
     * @param bool $force_refresh Force a fresh scan, ignoring cache
     * @return array Components organized by category
     */
    public function scan($force_refresh = false) {
        // Check cache first unless forced refresh
        if (!$force_refresh) {
            $cached_data = $this->loadFromCache();
            if ($cached_data !== false) {
                $this->components = $cached_data['components'];
                $this->categories = $cached_data['categories'];
                $this->aliases = $cached_data['aliases'];
                
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('ComponentDiscovery: Loaded ' . count($this->components) . ' components from cache');
                }
                
                return $this->categories;
            }
        }
        
        $this->components = [];
        $this->categories = [];

        // Check if components directory exists
        if (!is_dir($this->componentsDir)) {
            throw new Exception("Components directory does not exist: {$this->componentsDir}");
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('ComponentDiscovery: Performing fresh filesystem scan...');
        }

        // Get all component directories
        $componentDirs = glob($this->componentsDir . '/*', GLOB_ONLYDIR);

        foreach ($componentDirs as $componentDir) {
            $componentName = basename($componentDir);
            $componentJsonPath = $componentDir . '/component.json';

            // Check if component.json exists
            if (!file_exists($componentJsonPath)) {
                continue;
            }

            // Load component data
            $componentData = $this->loadComponentJson($componentJsonPath);
            
            // Skip if required fields are missing
            if (!isset($componentData['name']) || !isset($componentData['category'])) {
                continue;
            }

            // Set default values if not provided
            $componentData['order'] = $componentData['order'] ?? 999;
            $componentData['isPremium'] = $componentData['isPremium'] ?? false;
            $componentData['dependencies'] = $componentData['dependencies'] ?? [];
            
            // Add component directory
            $componentData['directory'] = $componentName;
            
            // Add component to the list
            $this->components[$componentName] = $componentData;
            
            // Add category if it doesn't exist
            $category = $componentData['category'];
            if (!isset($this->categories[$category])) {
                $this->categories[$category] = [];
            }
            
            // Add component to category
            $this->categories[$category][] = $componentData;
        }

        // Build aliases mapping (reverse lookup)
        $this->aliases = array();
        foreach ($this->component_aliases as $alias => $actual) {
            if (isset($this->components[$actual])) {
                $this->aliases[$alias] = $this->components[$actual];
            }
        }

        // Sort categories by component order
        foreach ($this->categories as $category => $components) {
            usort($this->categories[$category], function($a, $b) {
                return $a['order'] - $b['order'];
            });
        }
        
        // ROOT FIX: Ensure topics component is properly registered
        $this->ensure_topics_component_registered();
        
        // Save to cache for next time
        $this->saveToCache();
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('ComponentDiscovery: Fresh scan complete - found ' . count($this->components) . ' components, saved to cache');
        }

        return $this->categories;
    }
    
    /**
     * Load component data from WordPress transients cache
     * 
     * @return array|false Cached data or false if not found/expired
     */
    private function loadFromCache() {
        $cache_key = 'gmkb_component_discovery_' . md5($this->componentsDir);
        $cached_data = get_transient($cache_key);
        
        if ($cached_data !== false && is_array($cached_data)) {
            // Verify cache structure
            if (isset($cached_data['components'], $cached_data['categories'], $cached_data['aliases'], $cached_data['timestamp'])) {
                // Check if cache is not too old (24 hours max)
                $cache_age = time() - $cached_data['timestamp'];
                if ($cache_age < DAY_IN_SECONDS) {
                    return $cached_data;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Save component data to WordPress transients cache
     * Cache expires after 1 hour by default
     */
    private function saveToCache() {
        $cache_key = 'gmkb_component_discovery_' . md5($this->componentsDir);
        $cache_data = [
            'components' => $this->components,
            'categories' => $this->categories,
            'aliases' => $this->aliases,
            'timestamp' => time(),
            'components_dir' => $this->componentsDir,
            'total_components' => count($this->components)
        ];
        
        // Cache for 1 hour (can be cleared manually via clearCache())
        set_transient($cache_key, $cache_data, HOUR_IN_SECONDS);
    }
    
    /**
     * Clear the component discovery cache
     * Call this when components are added/removed/modified
     */
    public function clearCache() {
        $cache_key = 'gmkb_component_discovery_' . md5($this->componentsDir);
        delete_transient($cache_key);
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('ComponentDiscovery: Cache cleared - next scan will be fresh');
        }
    }

    /**
     * Load component.json file
     * 
     * @param string $path Path to component.json file
     * @return array Component data
     */
    private function loadComponentJson($path) {
        $json = file_get_contents($path);
        $data = json_decode($json, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return [];
        }
        
        return $data;
    }

    /**
     * Get all components
     * 
     * @return array All components
     */
    public function getComponents() {
        return $this->components;
    }

    /**
     * Get components by category
     * 
     * @return array Components organized by category
     */
    public function getCategories() {
        return $this->categories;
    }

    /**
     * Get a specific component by its directory name
     * 
     * @param string $componentName Component directory name
     * @return array|null Component data or null if not found
     */
    public function getComponent($componentName) {
        return $this->components[$componentName] ?? null;
    }
    
    /**
     * Get a component by type (handles aliases)
     * 
     * @param string $componentType Component type (may be an alias)
     * @return array|null Component data or null if not found
     */
    public function getComponentByType($componentType) {
        // Check direct match first
        if (isset($this->components[$componentType])) {
            return $this->components[$componentType];
        }
        
        // Check aliases
        if (isset($this->aliases[$componentType])) {
            return $this->aliases[$componentType];
        }
        
        return null;
    }
    
    /**
     * Resolve component type from alias to actual directory name
     * 
     * @param string $requestedType The requested component type (may be an alias)
     * @return string The actual component directory name
     */
    public function resolveComponentType($requestedType) {
        // Check if it's an alias
        if (isset($this->component_aliases[$requestedType])) {
            return $this->component_aliases[$requestedType];
        }
        
        // Return the original type if no alias found
        return $requestedType;
    }
    
    /**
     * Get all component aliases
     * 
     * @return array Component aliases mapping
     */
    public function getAliases() {
        return $this->component_aliases;
    }
    
    /**
     * Check if a component type exists (including aliases)
     * 
     * @param string $componentType Component type to check
     * @return bool True if component exists
     */
    public function componentExists($componentType) {
        return isset($this->components[$componentType]) || isset($this->aliases[$componentType]);
    }
    
    /**
     * Get debugging information about the discovery system
     * 
     * @return array Debug information
     */
    public function getDebugInfo() {
        $cache_key = 'gmkb_component_discovery_' . md5($this->componentsDir);
        $cached_data = get_transient($cache_key);
        
        return array(
            'components_dir' => $this->componentsDir,
            'components_count' => count($this->components),
            'categories_count' => count($this->categories),
            'components_dir_exists' => is_dir($this->componentsDir),
            'components_dir_readable' => is_readable($this->componentsDir),
            'component_names' => array_keys($this->components),
            'category_names' => array_keys($this->categories),
            'aliases_count' => count($this->aliases),
            'cache_status' => [
                'cache_key' => $cache_key,
                'cache_exists' => $cached_data !== false,
                'cache_age' => $cached_data ? (time() - $cached_data['timestamp']) : 0,
                'cache_size' => $cached_data ? strlen(serialize($cached_data)) : 0
            ]
        );
    }
    
    /**
     * ROOT FIX: Ensure topics component is properly registered
     * Force registration even if component.json is missing or invalid
     */
    public function ensure_topics_component_registered() {
        $topics_dir = $this->componentsDir . '/topics';
        
        if (!is_dir($topics_dir)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("GMKB ROOT FIX: Topics component directory not found: {$topics_dir}");
            }
            return false;
        }

        // ROOT FIX: Force registration of topics component
        $topics_config = array(
            'name' => 'Speaking Topics',
            'description' => 'Showcase your areas of expertise and speaking topics',
            'category' => 'essential',
            'icon' => 'topics-icon.svg',
            'type' => 'topics',
            'template' => $topics_dir . '/template.php',
            'script' => $topics_dir . '/script.js',
            'panel_script' => $topics_dir . '/panel-script.js',
            'design_panel' => $topics_dir . '/design-panel.php',
            'ajax_handler' => $topics_dir . '/ajax-handler.php',
            'directory' => 'topics',
            'order' => 3,
            'isPremium' => false,
            'dependencies' => array(),
            'root_fix' => true,
            'single_step_render' => true
        );

        // Verify all required files exist
        $required_files = array('template', 'ajax_handler');
        foreach ($required_files as $file_key) {
            if (isset($topics_config[$file_key]) && !file_exists($topics_config[$file_key])) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("GMKB ROOT FIX: Required topics file missing: {$topics_config[$file_key]}");
                }
                return false;
            }
        }

        // Force add to components array (overwrite if exists)
        $this->components['topics'] = $topics_config;
        
        // Ensure essential category exists
        if (!isset($this->categories['essential'])) {
            $this->categories['essential'] = array();
        }
        
        // Check if topics is already in essential category
        $topics_in_category = false;
        foreach ($this->categories['essential'] as $component) {
            if (isset($component['directory']) && $component['directory'] === 'topics') {
                $topics_in_category = true;
                break;
            }
        }
        
        // Add to category if not already there
        if (!$topics_in_category) {
            $this->categories['essential'][] = $topics_config;
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB ROOT FIX: Topics component force-registered successfully');
        }

        return true;
    }
    
    /**
     * Force refresh components by clearing cache and rescanning
     * 
     * @return array Components organized by category
     */
    public function forceRefresh() {
        $this->clearCache();
        return $this->scan(true);
    }
}

/**
 * Helper function to clear component discovery cache
 * Can be called from admin interfaces or development tools
 */
function gmkb_clear_component_cache() {
    global $gmkb_component_discovery;
    if ($gmkb_component_discovery && $gmkb_component_discovery instanceof ComponentDiscovery) {
        $gmkb_component_discovery->clearCache();
        return true;
    }
    return false;
}

/**
 * Helper function to force refresh component discovery
 * Useful for development and when adding new components
 */
function gmkb_refresh_components() {
    global $gmkb_component_discovery;
    if ($gmkb_component_discovery && $gmkb_component_discovery instanceof ComponentDiscovery) {
        return $gmkb_component_discovery->forceRefresh();
    }
    return false;
}
