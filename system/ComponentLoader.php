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

        // ROOT FIX: Enhance props with post data and MKCG integration
        $enhancedProps = $this->enhancePropsWithPostData($props, $componentName);
        
        // Extract enhanced props to make them available in the template
        extract($enhancedProps);

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
     * ROOT FIX: Enhance props with post data and MKCG integration
     * 
     * @param array $props Original component props
     * @param string $componentName Component name being loaded
     * @return array Enhanced props with post data
     */
    private function enhancePropsWithPostData($props, $componentName) {
        $enhancedProps = $props;
        
        // Detect post_id from multiple sources
        $post_id = $this->detectPostId($props);
        
        if ($post_id > 0) {
            // Add post_id to props
            $enhancedProps['post_id'] = $post_id;
            
            // For components that benefit from MKCG data, add it
            $mkcgComponents = ['topics', 'biography', 'questions', 'authority-hook', 'social'];
            
            if (in_array($componentName, $mkcgComponents)) {
                $mkcgData = $this->getMkcgDataForComponent($post_id, $componentName);
                if ($mkcgData) {
                    $enhancedProps['mkcg_data'] = $mkcgData;
                    
                    // Add component-specific data to props
                    switch ($componentName) {
                        case 'topics':
                            if (isset($mkcgData['topics']['topics'])) {
                                $enhancedProps['topics'] = array_values($mkcgData['topics']['topics']);
                            }
                            break;
                        case 'biography':
                            if (isset($mkcgData['biography']['biography'])) {
                                $enhancedProps = array_merge($enhancedProps, $mkcgData['biography']['biography']);
                            }
                            break;
                        case 'questions':
                            if (isset($mkcgData['questions']['questions'])) {
                                $enhancedProps['questions'] = array_values($mkcgData['questions']['questions']);
                            }
                            break;
                        case 'authority-hook':
                            if (isset($mkcgData['authority_hook']['authority_hook'])) {
                                $enhancedProps = array_merge($enhancedProps, $mkcgData['authority_hook']['authority_hook']);
                            }
                            break;
                        case 'social':
                            if (isset($mkcgData['social_media'])) {
                                $enhancedProps['social_links'] = $mkcgData['social_media'];
                            }
                            break;
                    }
                }
            }
            
            // Log successful data enhancement for debugging
            if (defined('WP_DEBUG') && WP_DEBUG && isset($enhancedProps['mkcg_data'])) {
                error_log("ComponentLoader: Enhanced {$componentName} component with MKCG data for post {$post_id}");
            }
        }
        
        return $enhancedProps;
    }
    
    /**
     * ROOT FIX: Detect post_id from multiple sources
     * 
     * @param array $props Component props
     * @return int Post ID or 0 if not found
     */
    private function detectPostId($props) {
        // Check props first
        if (isset($props['post_id']) && is_numeric($props['post_id'])) {
            return intval($props['post_id']);
        }
        
        // Check URL parameters
        if (isset($_GET['post_id']) && is_numeric($_GET['post_id'])) {
            return intval($_GET['post_id']);
        }
        
        if (isset($_GET['p']) && is_numeric($_GET['p'])) {
            return intval($_GET['p']);
        }
        
        if (isset($_GET['page_id']) && is_numeric($_GET['page_id'])) {
            return intval($_GET['page_id']);
        }
        
        // Check for MKCG specific parameter
        if (isset($_GET['mkcg_post']) && is_numeric($_GET['mkcg_post'])) {
            return intval($_GET['mkcg_post']);
        }
        
        // Check WordPress globals if in WordPress context
        if (function_exists('get_the_ID')) {
            $wp_post_id = get_the_ID();
            if ($wp_post_id && $wp_post_id > 0) {
                return $wp_post_id;
            }
        }
        
        return 0;
    }
    
    /**
     * ROOT FIX: Get MKCG data for a specific component
     * 
     * @param int $post_id Post ID
     * @param string $componentName Component name
     * @return array|null MKCG data or null if not available
     */
    private function getMkcgDataForComponent($post_id, $componentName) {
        // Check if MKCG integration class is available
        if (!class_exists('GMKB_MKCG_Data_Integration')) {
            return null;
        }
        
        try {
            $mkcg_integration = GMKB_MKCG_Data_Integration::get_instance();
            $post_data = $mkcg_integration->get_post_data($post_id);
            
            if (!$post_data) {
                return null;
            }
            
            // Return relevant data for the component
            switch ($componentName) {
                case 'topics':
                    return isset($post_data['topics']) ? $post_data : null;
                case 'biography':
                    return isset($post_data['biography']) ? $post_data : null;
                case 'questions':
                    return isset($post_data['questions']) ? $post_data : null;
                case 'authority-hook':
                    return isset($post_data['authority_hook']) ? $post_data : null;
                case 'social':
                    return isset($post_data['social_media']) ? $post_data : null;
                default:
                    return $post_data;
            }
            
        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("ComponentLoader: Error getting MKCG data for {$componentName}: " . $e->getMessage());
            }
            return null;
        }
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
    
    /**
     * ROOT FIX: Get enhanced component loading status
     * 
     * @return array Status information for debugging
     */
    public function getLoadingStatus() {
        return [
            'loaded_components' => array_keys($this->loadedComponents),
            'mkcg_integration_available' => class_exists('GMKB_MKCG_Data_Integration'),
            'enhanced_props_enabled' => true,
            'version' => 'root-fix-enhanced'
        ];
    }
}
