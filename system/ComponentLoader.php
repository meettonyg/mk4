<?php
/**
 * Component Loader
 * 
 * This file handles loading component templates, styles, and scripts.
 */

class ComponentLoader {
    private $componentsDir;
    private $loadedComponents = [];
    private $discovery;

    /**
     * Constructor
     * 
     * @param string $componentsDir Path to the components directory
     * @param ComponentDiscovery $discovery Component discovery instance
     */
    public function __construct($componentsDir, ComponentDiscovery $discovery) {
        $this->componentsDir = $componentsDir;
        $this->discovery = $discovery;
    }

    /**
     * Load and render a component
     * 
     * @param string $componentName Component directory name
     * @param array $props Component properties
     * @return string|false Rendered component or false on failure
     */
    public function loadComponent($componentName, $props = []) {
        // Check if component exists
        $component = $this->discovery->getComponent($componentName);
        if (!$component) {
            return false;
        }

        // Check if component template exists
        $templatePath = $this->componentsDir . '/' . $componentName . '/template.php';
        if (!file_exists($templatePath)) {
            return false;
        }

        // Add component to loaded components list for script and style loading
        $this->loadedComponents[$componentName] = $component;

        // Extract props to make them available in the template
        extract($props);

        // Capture output
        ob_start();
        include $templatePath;
        return ob_get_clean();
    }

    /**
     * Get styles for all loaded components
     * 
     * @return string Combined CSS styles
     */
    public function getStyles() {
        $styles = [];

        foreach ($this->loadedComponents as $componentName => $component) {
            $stylePath = $this->componentsDir . '/' . $componentName . '/styles.css';
            if (file_exists($stylePath)) {
                $styles[] = file_get_contents($stylePath);
            }
        }

        return implode("\n\n", $styles);
    }

    /**
     * Get scripts for all loaded components
     * 
     * @return string Combined JavaScript
     */
    public function getScripts() {
        $scripts = [];

        foreach ($this->loadedComponents as $componentName => $component) {
            $scriptPath = $this->componentsDir . '/' . $componentName . '/script.js';
            if (file_exists($scriptPath)) {
                $scripts[] = file_get_contents($scriptPath);
            }
        }

        return implode("\n\n", $scripts);
    }

    /**
     * Get loaded components
     * 
     * @return array Loaded components
     */
    public function getLoadedComponents() {
        return $this->loadedComponents;
    }

    /**
     * Check if a component is premium
     * 
     * @param string $componentName Component directory name
     * @return bool Whether the component is premium
     */
    public function isPremium($componentName) {
        $component = $this->discovery->getComponent($componentName);
        return $component ? ($component['isPremium'] ?? false) : false;
    }

    /**
     * Check if current user has access to premium components
     * 
     * @return bool Whether the user has access to premium components
     */
    public function hasPremiumAccess() {
        // This would be replaced with actual logic to check if the user has premium access
        // For now, we'll just return true for simplicity
        return true;
    }
}
