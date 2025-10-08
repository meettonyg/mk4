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

            // ROOT CAUSE DEBUG: Log each component being processed
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("ComponentDiscovery: Processing component '{$componentName}'");
                error_log("ComponentDiscovery: JSON path: {$componentJsonPath}");
                error_log("ComponentDiscovery: JSON exists: " . (file_exists($componentJsonPath) ? 'YES' : 'NO'));
            }

            // Check if component.json exists
            if (!file_exists($componentJsonPath)) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("ComponentDiscovery: Skipping '{$componentName}' - no component.json");
                }
                continue;
            }

            // Load component data
            $componentData = $this->loadComponentJson($componentJsonPath);
            
            // ROOT FIX: Self-contained architecture - load schema.json if exists
            $schemaJsonPath = $componentDir . '/schema.json';
            if (file_exists($schemaJsonPath)) {
                $schemaData = json_decode(file_get_contents($schemaJsonPath), true);
                if ($schemaData) {
                    $componentData['schema'] = $schemaData;
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log("ComponentDiscovery: Loaded schema.json for '{$componentName}'");
                    }
                }
            }
            
            // ROOT CAUSE DEBUG: Log loaded data
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("ComponentDiscovery: Loaded data for '{$componentName}': " . print_r($componentData, true));
            }
            
            // Skip if required fields are missing
            if (!isset($componentData['name']) || !isset($componentData['category'])) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("ComponentDiscovery: Skipping '{$componentName}' - missing required fields (name: " . (isset($componentData['name']) ? 'YES' : 'NO') . ", category: " . (isset($componentData['category']) ? 'YES' : 'NO') . ")");
                }
                continue;
            }

            // ROOT CAUSE FIX: Set required fields for JavaScript compatibility
            $componentData['order'] = $componentData['order'] ?? 999;
            $componentData['isPremium'] = $componentData['isPremium'] ?? false;
            $componentData['dependencies'] = $componentData['dependencies'] ?? [];
            
            // CRITICAL FIX: Preserve icon from component.json (Font Awesome class name)
            // This is the ROOT CAUSE - icon field was not being preserved!
            if (!isset($componentData['icon'])) {
                $componentData['icon'] = 'fa-solid fa-cube'; // Generic fallback
            }
            
            // CRITICAL FIX: Add 'type' field that JavaScript expects
            $componentData['type'] = $componentName;
            $componentData['directory'] = $componentName;
            
            // ROOT CAUSE FIX: Ensure title exists (JavaScript fallback)
            if (!isset($componentData['title'])) {
                $componentData['title'] = $componentData['name'];
            }
            
            // ROOT CAUSE DEBUG: Log final component data
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("ComponentDiscovery: Successfully processed '{$componentName}' with type: {$componentData['type']}");
            }
            
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
        // ROOT FIX: Check BOTH topics and topics-questions components
        $components_to_register = array(
            'topics' => array(
                'name' => 'Speaking Topics',
                'description' => 'Showcase your areas of expertise and speaking topics',
                'category' => 'essential',
                'icon' => 'topics-icon.svg',
                'type' => 'topics',
                'order' => 3,
                'has_vue_renderer' => true  // ROOT FIX: Mark as having Vue renderer
            ),
            'topics-questions' => array(
                'name' => 'Topics & Questions',
                'description' => 'Combined topics and questions component',
                'category' => 'essential',
                'icon' => 'topics-questions-icon.svg',
                'type' => 'topics-questions',
                'order' => 4,
                'has_vue_renderer' => true  // ROOT FIX: Mark as having Vue renderer
            )
        );
        
        foreach ($components_to_register as $component_type => $base_config) {
            $component_dir = $this->componentsDir . '/' . $component_type;
            
            if (!is_dir($component_dir)) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("GMKB ROOT FIX: {$component_type} component directory not found: {$component_dir}");
                }
                continue;
            }

            // Build full config
            $topics_config = array_merge($base_config, array(
                'template' => $component_dir . '/template.php',
                'script' => $component_dir . '/script.js',
                'panel_script' => $component_dir . '/panel-script.js',
                'design_panel' => $component_dir . '/design-panel.php',
                'ajax_handler' => $component_dir . '/ajax-handler.php',
                'directory' => $component_type,
                'isPremium' => false,
                'dependencies' => array(),
                'root_fix' => true,
                'single_step_render' => true
            ));

            // Verify all required files exist
            $required_files = array('template', 'ajax_handler');
            $all_files_exist = true;
            foreach ($required_files as $file_key) {
                if (isset($topics_config[$file_key]) && !file_exists($topics_config[$file_key])) {
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log("GMKB ROOT FIX: Required {$component_type} file missing: {$topics_config[$file_key]}");
                    }
                    $all_files_exist = false;
                    break;
                }
            }
            
            if (!$all_files_exist) {
                continue;
            }

            // Force add to components array (overwrite if exists)
            $this->components[$component_type] = $topics_config;
            
            // Ensure essential category exists
            if (!isset($this->categories['essential'])) {
                $this->categories['essential'] = array();
            }
            
            // Check if component is already in essential category
            $component_in_category = false;
            foreach ($this->categories['essential'] as $existing_component) {
                if (isset($existing_component['directory']) && $existing_component['directory'] === $component_type) {
                    $component_in_category = true;
                    break;
                }
            }
            
            // Add to category if not already there
            if (!$component_in_category) {
                $this->categories['essential'][] = $topics_config;
            }

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("GMKB ROOT FIX: {$component_type} component force-registered successfully");
            }
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
