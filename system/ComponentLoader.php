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
     * Map old component names to new directory names
     */
    private $componentMapping = [
        'bio' => 'biography',
        'calendar' => 'booking-calendar',
        'cta' => 'call-to-action',
        'gallery' => 'photo-gallery',
        'podcast' => 'podcast-player',
        'video' => 'video-intro'
    ];
    
    /**
     * Load and render a component
     * 
     * @param string $componentName Component directory name
     * @param array $props Component properties
     * @return string|false Rendered component or false on failure
     */
    public function loadComponent($componentName, $props = []) {
        // Map old component names to new ones if needed
        if (isset($this->componentMapping[$componentName])) {
            $componentName = $this->componentMapping[$componentName];
        }
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
     * Load and render a component's design panel
     * 
     * @param string $componentName Component directory name
     * @return string|false Rendered design panel or false on failure
     */
    public function loadDesignPanel($componentName) {
        // Map old component names to new ones if needed
        if (isset($this->componentMapping[$componentName])) {
            $componentName = $this->componentMapping[$componentName];
        }
        
        // Check if component exists
        $component = $this->discovery->getComponent($componentName);
        if (!$component) {
            return false;
        }

        // Check if design panel exists
        $panelPath = $this->componentsDir . '/' . $componentName . '/design-panel.php';
        if (!file_exists($panelPath)) {
            // Return a generic panel if no specific one exists
            return $this->getGenericDesignPanel($component);
        }

        // Capture output
        ob_start();
        include $panelPath;
        return ob_get_clean();
    }
    
    /**
     * Get a generic design panel for components without custom panels
     * 
     * @param array $component Component data
     * @return string Generic design panel HTML
     */
    private function getGenericDesignPanel($component) {
        ob_start();
        ?>
        <div class="element-editor__title">
            <?php echo esc_html($component['name']); ?> Settings
        </div>
        <div class="element-editor__subtitle">This component uses inline editing. Click on any text in the preview to edit.</div>
        
        <div class="form-section">
            <h4 class="form-section__title">Component Info</h4>
            <p class="form-help-text"><?php echo esc_html($component['description'] ?? 'Edit this component by clicking on elements in the preview area.'); ?></p>
        </div>
        
        <div class="form-section">
            <h4 class="form-section__title">Tips</h4>
            <ul class="tips-list">
                <li>Click any text to edit it directly</li>
                <li>Use the element controls to move or delete</li>
                <li>Changes are saved automatically</li>
            </ul>
        </div>
        <?php
        return ob_get_clean();
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
