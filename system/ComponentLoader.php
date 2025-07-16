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
     * ROOT LEVEL FIX: Enhanced auto-enqueue with proper GMKB dependency management
     * 
     * @param string $componentName Component name
     */
    private function enqueueComponentScript($componentName) {
        // Prevent duplicate enqueuing
        static $enqueuedScripts = array();
        if (isset($enqueuedScripts[$componentName])) {
            return;
        }
        
        $plugin_url = defined('GUESTIFY_PLUGIN_URL') ? GUESTIFY_PLUGIN_URL : '';
        $version = defined('GUESTIFY_VERSION') ? GUESTIFY_VERSION : time();
        
        // Check for component scripts with enhanced dependency management
        $scripts = array(
            'panel-script.js' => 'panel',
            'script.js' => 'main'
        );
        
        foreach ($scripts as $filename => $type) {
            $script_path = $this->componentsDir . '/' . $componentName . '/' . $filename;
            $script_url = $plugin_url . 'components/' . $componentName . '/' . $filename;
            
            if (file_exists($script_path)) {
                $handle = 'gmkb-' . $componentName . '-' . $type . '-script';
                
                // ROOT FIX: Enhanced dependency chain ensures proper initialization order
                wp_enqueue_script(
                    $handle,
                    $script_url,
                    array('gmkb-main-script'), // Main GMKB system must be loaded first
                    $version,
                    true // Load in footer after main system
                );
                
                // ROOT FIX: Enhanced component data with GMKB readiness detection
                wp_localize_script(
                    $handle,
                    $componentName . 'ComponentData',
                    array(
                        'postId' => $this->getPostIdFromContext(),
                        'ajaxUrl' => admin_url('admin-ajax.php'),
                        'restUrl' => esc_url_raw(rest_url()),
                        'nonce' => wp_create_nonce('guestify_media_kit_builder'),
                        'restNonce' => wp_create_nonce('wp_rest'),
                        'component' => $componentName,
                        'componentType' => $componentName,
                        'pluginUrl' => $plugin_url,
                        'siteUrl' => home_url(),
                        'gmkbReady' => true, // Flag for component scripts
                        'architecture' => 'component-auto-load',
                        'timestamp' => time(),
                        'debugMode' => defined('WP_DEBUG') && WP_DEBUG
                    )
                );
                
                // ROOT FIX: Add GMKB initialization coordination script
                $this->addGMKBCoordinationScript($handle, $componentName, $type);
                
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("✅ ROOT FIX: Auto-enqueued {$componentName} {$type} script with GMKB coordination: {$script_url}");
                }
            }
        }
        
        $enqueuedScripts[$componentName] = true;
    }
    
    /**
     * ROOT FIX: Add GMKB coordination script to ensure proper initialization
     * 
     * @param string $handle Script handle
     * @param string $componentName Component name  
     * @param string $type Script type (main|panel)
     */
    private function addGMKBCoordinationScript($handle, $componentName, $type) {
        // Add inline script to coordinate with GMKB system
        $coordination_script = "
        // ROOT FIX: GMKB Component Coordination for {$componentName} {$type}
        (function() {
            'use strict';
            
            console.log('🔗 GMKB Coordination: {$componentName} {$type} script loading...');
            
            // Wait for both DOM and GMKB system
            function waitForGMKBAndInitialize() {
                if (typeof window !== 'undefined' && window.GMKB && document.readyState !== 'loading') {
                    console.log('✅ GMKB Coordination: {$componentName} {$type} - GMKB system ready');
                    
                    // Dispatch component script ready event
                    if (window.GMKB.dispatch) {
                        window.GMKB.dispatch('gmkb:component-script-ready', {
                            component: '{$componentName}',
                            type: '{$type}',
                            timestamp: Date.now()
                        });
                    }
                    
                    // Ensure component managers are globally available
                    if (!window.topicsDesignPanelManager && '{$componentName}' === 'topics' && '{$type}' === 'panel') {
                        console.log('🎨 GMKB Coordination: Topics design panel manager will initialize when DOM ready');
                    }
                    
                } else {
                    console.log('⏳ GMKB Coordination: {$componentName} {$type} - waiting for GMKB system...');
                    
                    // Listen for GMKB ready event
                    document.addEventListener('gmkb:initialization-complete', function(e) {
                        console.log('✅ GMKB Coordination: {$componentName} {$type} - initialization complete event received');
                        
                        // Small delay to ensure all systems are ready
                        setTimeout(function() {
                            if (window.GMKB && window.GMKB.dispatch) {
                                window.GMKB.dispatch('gmkb:component-script-ready', {
                                    component: '{$componentName}',
                                    type: '{$type}',
                                    timestamp: Date.now(),
                                    viaEvent: true
                                });
                            }
                        }, 100);
                    });
                    
                    // Fallback check every 500ms (max 10 times = 5 seconds)
                    let checkCount = 0;
                    const fallbackCheck = setInterval(function() {
                        checkCount++;
                        if (window.GMKB || checkCount >= 10) {
                            clearInterval(fallbackCheck);
                            if (window.GMKB) {
                                console.log('✅ GMKB Coordination: {$componentName} {$type} - fallback check successful');
                                if (window.GMKB.dispatch) {
                                    window.GMKB.dispatch('gmkb:component-script-ready', {
                                        component: '{$componentName}',
                                        type: '{$type}',
                                        timestamp: Date.now(),
                                        viaFallback: true
                                    });
                                }
                            } else {
                                console.warn('⚠️ GMKB Coordination: {$componentName} {$type} - GMKB system not available after 5 seconds');
                            }
                        }
                    }, 500);
                }
            }
            
            // Initialize coordination
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', waitForGMKBAndInitialize);
            } else {
                waitForGMKBAndInitialize();
            }
        })();
        ";
        
        wp_add_inline_script($handle, $coordination_script, 'before');
    }
    
    /**
     * ROOT FIX: Enhanced post ID detection with comprehensive fallbacks
     * 
     * @return int Post ID
     */
    private function getPostIdFromContext() {
        $post_id = 0;
        
        // Priority 1: URL parameters
        if (isset($_GET['post_id']) && is_numeric($_GET['post_id'])) {
            $post_id = intval($_GET['post_id']);
        }
        elseif (isset($_GET['p']) && is_numeric($_GET['p'])) {
            $post_id = intval($_GET['p']);
        }
        elseif (isset($_GET['page_id']) && is_numeric($_GET['page_id'])) {
            $post_id = intval($_GET['page_id']);
        }
        
        // Priority 2: WordPress context
        if ($post_id === 0 && function_exists('get_the_ID') && get_the_ID()) {
            $post_id = get_the_ID();
        }
        
        // Priority 3: Global post object
        if ($post_id === 0 && isset($GLOBALS['post']) && $GLOBALS['post']) {
            $post_id = $GLOBALS['post']->ID;
        }
        
        // Validate post exists
        if ($post_id > 0) {
            $post = get_post($post_id);
            if (!$post || $post->post_status === 'trash') {
                $post_id = 0;
            }
        }
        
        return $post_id;
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

        // PHASE 1.3 FIX: Auto-load component scripts in footer
        $this->enqueueComponentScript($componentName);

        // ROOT FIX: Enhance props with post data and MKCG integration
        $enhancedProps = $this->enhancePropsWithPostData($props, $componentName);
        
        // ROOT FIX: Debug enhanced props before template
        if (defined('WP_DEBUG') && WP_DEBUG && $componentName === 'topics') {
            error_log("ComponentLoader ROOT FIX: 🚀 About to load topics template with enhanced props:");
            error_log("ComponentLoader ROOT FIX: 📊 Enhanced props keys: " . implode(', ', array_keys($enhancedProps)));
            error_log("ComponentLoader ROOT FIX: 🎯 post_id=" . ($enhancedProps['post_id'] ?? 'undefined') . ", topics=" . (isset($enhancedProps['topics']) ? count($enhancedProps['topics']) : 'undefined'));
        }
        
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
                            
                            // ROOT FIX: Enhanced logging for topics data
                        if (defined('WP_DEBUG') && WP_DEBUG) {
                            error_log("ComponentLoader ROOT FIX: ✅ Enhanced topics props with " . count($enhancedProps['topics']) . " topics from MKCG");
                        }
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
            
            // ROOT FIX: Enhanced logging for data enhancement
            if (defined('WP_DEBUG') && WP_DEBUG && isset($enhancedProps['mkcg_data'])) {
                error_log("ComponentLoader ROOT FIX: ✅ Enhanced {$componentName} component with MKCG data for post {$post_id}");
                
                // Special logging for topics component
                if ($componentName === 'topics' && isset($enhancedProps['topics'])) {
                    error_log("ComponentLoader ROOT FIX: 📝 Topics data passed to template: " . print_r($enhancedProps['topics'], true));
                }
            }
        }
        
        return $enhancedProps;
    }
    
    /**
     * ROOT FIX: Enhanced post_id detection with comprehensive logging
     * 
     * @param array $props Component props
     * @return int Post ID or 0 if not found
     */
    private function detectPostId($props) {
        $detected_post_id = 0;
        $detection_method = 'none';
        
        // PRIORITY 1: Check props first
        if (isset($props['post_id']) && is_numeric($props['post_id'])) {
            $detected_post_id = intval($props['post_id']);
            $detection_method = 'props';
        }
        // PRIORITY 2: URL parameters (?post_id=32372)
        elseif (isset($_GET['post_id']) && is_numeric($_GET['post_id'])) {
            $detected_post_id = intval($_GET['post_id']);
            $detection_method = 'url_post_id';
        }
        elseif (isset($_GET['p']) && is_numeric($_GET['p'])) {
            $detected_post_id = intval($_GET['p']);
            $detection_method = 'url_p';
        }
        elseif (isset($_GET['page_id']) && is_numeric($_GET['page_id'])) {
            $detected_post_id = intval($_GET['page_id']);
            $detection_method = 'url_page_id';
        }
        elseif (isset($_GET['mkcg_post']) && is_numeric($_GET['mkcg_post'])) {
            $detected_post_id = intval($_GET['mkcg_post']);
            $detection_method = 'url_mkcg_post';
        }
        // PRIORITY 3: WordPress globals as fallback
        elseif (function_exists('get_the_ID')) {
            $wp_post_id = get_the_ID();
            if ($wp_post_id && $wp_post_id > 0) {
                $detected_post_id = $wp_post_id;
                $detection_method = 'get_the_id';
            }
        }
        
        // ROOT FIX: Enhanced logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            if ($detected_post_id > 0) {
                error_log("ComponentLoader ROOT FIX: ✅ Post ID {$detected_post_id} detected via {$detection_method}");
            } else {
                error_log("ComponentLoader ROOT FIX: ❌ No post ID detected. Available: props=" . 
                    (isset($props['post_id']) ? $props['post_id'] : 'none') . 
                    ", GET=" . print_r($_GET, true));
            }
        }
        
        return $detected_post_id;
    }
    
    /**
     * ROOT FIX: Get MKCG data for a specific component with direct meta fallback
     * 
     * @param int $post_id Post ID
     * @param string $componentName Component name
     * @return array|null MKCG data or null if not available
     */
    private function getMkcgDataForComponent($post_id, $componentName) {
        // First try MKCG integration class
        if (class_exists('GMKB_MKCG_Data_Integration')) {
            try {
                $mkcg_integration = GMKB_MKCG_Data_Integration::get_instance();
                $post_data = $mkcg_integration->get_post_data($post_id);
                
                if ($post_data) {
                    // Return relevant data for the component
                    switch ($componentName) {
                        case 'topics':
                            if (isset($post_data['topics']['topics']) && !empty($post_data['topics']['topics'])) {
                                return $post_data;
                            }
                            break;
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
                }
            } catch (Exception $e) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("ComponentLoader: Error getting MKCG data for {$componentName}: " . $e->getMessage());
                }
            }
        }
        
        // ROOT FIX: Fallback to direct meta key detection for topics
        if ($componentName === 'topics') {
            return $this->getTopicsFromDirectMeta($post_id);
        }
        
        return null;
    }
    
    /**
     * ROOT FIX: Get topics directly from post meta (fallback method)
     * 
     * @param int $post_id Post ID
     * @return array|null Topics data in MKCG format or null
     */
    private function getTopicsFromDirectMeta($post_id) {
        $topics = [];
        
        // Try user's format first: topic_1, topic_2, etc.
        $meta_formats = [
            'topic_',       // USER'S FORMAT (highest priority)
            'mkcg_topic_',  // MKCG format
            'topics_',      // Plural format
            '_topic_'       // Underscore prefix
        ];
        
        foreach ($meta_formats as $format) {
            $found_topics = [];
            
            for ($i = 1; $i <= 5; $i++) {
                $meta_key = $format . $i;
                $topic_value = get_post_meta($post_id, $meta_key, true);
                
                if (!empty($topic_value)) {
                    $found_topics["topic_{$i}"] = sanitize_text_field($topic_value);
                }
            }
            
            if (!empty($found_topics)) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("ComponentLoader ROOT FIX: ✅ Found " . count($found_topics) . " topics using direct meta format '{$format}'");
                }
                
                // Return in MKCG-compatible format
                return [
                    'topics' => [
                        'topics' => $found_topics,
                        'meta' => [
                            'source' => 'direct_meta_' . rtrim($format, '_'),
                            'format_used' => $format,
                            'count' => count($found_topics)
                        ]
                    ]
                ];
            }
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("ComponentLoader ROOT FIX: ❌ No topics found in any meta format for post {$post_id}");
        }
        
        return null;
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
