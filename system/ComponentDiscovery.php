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
     * 
     * @return array Components organized by category
     */
    public function scan() {
        $this->components = [];
        $this->categories = [];

        // Check if components directory exists
        if (!is_dir($this->componentsDir)) {
            throw new Exception("Components directory does not exist: {$this->componentsDir}");
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

        return $this->categories;
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
        return array(
            'components_dir' => $this->componentsDir,
            'components_count' => count($this->components),
            'categories_count' => count($this->categories),
            'components_dir_exists' => is_dir($this->componentsDir),
            'components_dir_readable' => is_readable($this->componentsDir),
            'component_names' => array_keys($this->components),
            'category_names' => array_keys($this->categories),
            'aliases_count' => count($this->aliases)
        );
    }
}
