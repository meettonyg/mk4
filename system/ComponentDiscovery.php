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
}
