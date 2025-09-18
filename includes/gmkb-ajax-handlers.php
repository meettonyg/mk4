<?php
/**
 * ROOT FIX: Definitive AJAX Handlers
 * Single source of truth for all GMKB AJAX endpoints
 * No fallbacks, no workarounds - just proper implementation
 */

if (!defined('ABSPATH')) {
    exit;
}

// Include debug logger
require_once plugin_dir_path(dirname(__FILE__)) . 'includes/gmkb-debug-logger.php';

class GMKB_Ajax_Handlers {
    
    public function __construct() {
        // ROOT FIX: Proper error handling for AJAX requests
        // Only disable display errors in production, not during development
        if (defined('DOING_AJAX') && DOING_AJAX && !WP_DEBUG) {
            @ini_set('display_errors', 0);
            @ini_set('display_startup_errors', 0);
        }
        // Register missing AJAX handlers
        add_action('wp_ajax_gmkb_get_available_components', array($this, 'get_available_components'));
        add_action('wp_ajax_gmkb_get_themes', array($this, 'get_available_themes'));
        add_action('wp_ajax_gmkb_load_media_kit', array($this, 'load_media_kit'));
        add_action('wp_ajax_gmkb_save_media_kit', array($this, 'save_media_kit')); // ROOT FIX: Added missing save handler
        
        // ROOT FIX: Add server-side component rendering handler
        add_action('wp_ajax_guestify_render_component', array($this, 'render_component_server'));
        add_action('wp_ajax_nopriv_guestify_render_component', array($this, 'render_component_server'));
        
        // Debug endpoint
        add_action('wp_ajax_gmkb_get_debug_logs', array($this, 'get_debug_logs'));
    }
    
    /**
     * Get available components - ROOT FIX: Use ComponentDiscovery
     */
    public function get_available_components() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        // ROOT FIX: Use the existing ComponentDiscovery instance
        global $gmkb_component_discovery;
        
        if (!$gmkb_component_discovery) {
            // Create instance if not available
            require_once plugin_dir_path(dirname(__FILE__)) . 'system/ComponentDiscovery.php';
            $gmkb_component_discovery = new ComponentDiscovery(plugin_dir_path(dirname(__FILE__)) . 'components');
        }
        
        // Scan for components
        $gmkb_component_discovery->scan();
        $components = $gmkb_component_discovery->getComponents();
        $categories = $gmkb_component_discovery->getCategories();
        
        // Convert to array format for JavaScript
        $components_array = array();
        foreach ($components as $key => $component) {
            $component['type'] = $component['type'] ?? $key;
            $component['name'] = $component['name'] ?? ucfirst($key);
            $component['title'] = $component['title'] ?? $component['name'];
            $components_array[] = $component;
        }
        
        wp_send_json_success(array(
            'components' => $components_array,
            'categories' => $categories,
            'total' => count($components_array)
        ));
    }
    
    /**
     * Get available themes - ROOT FIX: Single method, no fallbacks
     */
    public function get_available_themes() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        try {
            // ROOT FIX: Single source - always use ThemeDiscovery
            $theme_dir = plugin_dir_path(dirname(__FILE__)) . 'themes/';
            $theme_discovery_file = plugin_dir_path(dirname(__FILE__)) . 'system/ThemeDiscovery.php';
            
            // Require ThemeDiscovery - fail if not found (no fallback)
            require_once $theme_discovery_file;
            
            // Create instance and scan
            $theme_discovery = new ThemeDiscovery($theme_dir);
            $theme_discovery->scan();
            $themes = $theme_discovery->getThemes();
            
            // Convert to array format for JavaScript
            $themes_array = array();
            foreach ($themes as $theme_id => $theme_data) {
                $theme_data['id'] = $theme_id;
                $themes_array[] = $theme_data;
            }
            
            wp_send_json_success(array(
                'themes' => $themes_array,
                'total' => count($themes_array)
            ));
            
        } catch (Exception $e) {
            wp_send_json_error('Theme discovery failed: ' . $e->getMessage());
        }
    }

    
    /**
     * COMPLIANT: Generic server-side component rendering
     * Components handle their own data loading via integration classes
     */
    public function render_component_server() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        $component_type = isset($_POST['component']) ? sanitize_text_field($_POST['component']) : '';
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        $props = isset($_POST['props']) ? json_decode(stripslashes($_POST['props']), true) : array();
        
        if (!$component_type || !$post_id) {
            wp_send_json_error('Missing component type or post ID');
            return;
        }
        
        // COMPLIANT: Generic approach - use consistent filename pattern
        // All components can have a data-integration.php file
        $integration_file = plugin_dir_path(dirname(__FILE__)) . "components/{$component_type}/data-integration.php";
        
        // Load component data if integration exists
        if (file_exists($integration_file)) {
            require_once $integration_file;
            
            // Build the class name using convention: Componentname_Data_Integration
            $class_name_parts = array_map('ucfirst', explode('-', $component_type));
            $integration_class = implode('_', $class_name_parts) . '_Data_Integration';
            
            if (class_exists($integration_class) && method_exists($integration_class, 'load_component_data')) {
                // Generic data loading - component handles its own structure
                $component_data = $integration_class::load_component_data($post_id);
                
                // Let the component integration provide template props
                if (method_exists($integration_class, 'prepare_template_props')) {
                    $props = $integration_class::prepare_template_props($component_data, $props);
                } else {
                    // Fallback: merge any returned data generically
                    if (!empty($component_data) && is_array($component_data)) {
                        $props = array_merge($props, $component_data);
                    }
                }
            }
        }
        
        // Get component template
        $template_file = plugin_dir_path(dirname(__FILE__)) . "components/{$component_type}/template.php";
        
        if (!file_exists($template_file)) {
            wp_send_json_error('Component template not found');
            return;
        }
        
        // Render the component template with data
        ob_start();
        
        // Make props available to template
        $component_id = $props['component_id'] ?? 'comp_' . uniqid();
        
        // Extract props for template use
        extract($props);
        
        // Include the template
        include $template_file;
        
        $html = ob_get_clean();
        
        wp_send_json_success(array(
            'html' => $html,
            'component_type' => $component_type,
            'has_data' => !empty($bio_content) || !empty($content)
        ));
    }
    
    /**
     * Load media kit - ROOT FIX: Properly retrieve and validate saved state
     */
    public function load_media_kit() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        
        if (!$post_id) {
            wp_send_json_error('No post ID provided');
            return;
        }
        
        // ROOT FIX: Get saved state - WordPress automatically unserializes it
        $saved_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        
        if ($saved_state) {
            // ROOT FIX: Debug the raw loaded state
            if (defined('WP_DEBUG') && WP_DEBUG) {
                GMKB_Debug_Logger::log('Raw saved state type: ' . gettype($saved_state));
                if (is_array($saved_state)) {
                    GMKB_Debug_Logger::log('State keys: ' . implode(', ', array_keys($saved_state)));
                    if (isset($saved_state['components'])) {
                        GMKB_Debug_Logger::log('Components type in loaded state: ' . gettype($saved_state['components']));
                        if (is_array($saved_state['components'])) {
                            $comp_count = count($saved_state['components']);
                            GMKB_Debug_Logger::log('Components count in loaded state: ' . $comp_count);
                            if ($comp_count > 0) {
                                $first_key = array_key_first($saved_state['components']);
                                GMKB_Debug_Logger::log('First component key: ' . $first_key);
                                GMKB_Debug_Logger::log('First component data: ' . json_encode($saved_state['components'][$first_key]));
                            }
                        }
                    }
                }
            }
            
            // ROOT FIX: Ensure components structure is preserved for JavaScript
            // JavaScript expects an object (associative array in PHP)
            if (!isset($saved_state['components'])) {
                // No components key - initialize as empty object
                $saved_state['components'] = new stdClass();
                GMKB_Debug_Logger::log('Initialized missing components as empty object');
            } else if (is_object($saved_state['components'])) {
                // Already an object (StdClass) - count properties
                $comp_count = count((array)$saved_state['components']);
                GMKB_Debug_Logger::log('Loaded ' . $comp_count . ' components from database (object format)');
            } else if (is_array($saved_state['components'])) {
                // Components exist as array - count them
                $comp_count = count($saved_state['components']);
                GMKB_Debug_Logger::log('Loaded ' . $comp_count . ' components from database (array format)');
                
                // ROOT FIX: Convert empty arrays to objects for JavaScript
                if ($comp_count === 0) {
                    // Empty array needs to become empty object {} in JSON
                    $saved_state['components'] = new stdClass();
                    GMKB_Debug_Logger::log('Converted empty array to object for JavaScript compatibility');
                } else if (array_keys($saved_state['components']) === range(0, count($saved_state['components']) - 1)) {
                    // Indexed array (should not happen with our save fix, but handle legacy data)
                    // Convert to associative array using component IDs
                    $components_obj = array();
                    foreach ($saved_state['components'] as $comp) {
                        if (is_array($comp) && isset($comp['id'])) {
                            $components_obj[$comp['id']] = $comp;
                        }
                    }
                    $saved_state['components'] = empty($components_obj) ? new stdClass() : $components_obj;
                    GMKB_Debug_Logger::log('Converted indexed array to associative array/object');
                }
            }
            
            // ROOT FIX: Reconstruct missing components from sections if needed
            // This handles the case where components are in sections but not in the components object
            if (isset($saved_state['sections']) && is_array($saved_state['sections'])) {
                $components_in_sections = array();
                foreach ($saved_state['sections'] as $section) {
                    if (isset($section['components']) && is_array($section['components'])) {
                        foreach ($section['components'] as $comp_ref) {
                            $comp_id = is_array($comp_ref) ? (isset($comp_ref['component_id']) ? $comp_ref['component_id'] : null) : $comp_ref;
                            if ($comp_id) {
                                $components_in_sections[$comp_id] = isset($section['section_id']) ? $section['section_id'] : null;
                            }
                        }
                    }
                }
                
                // Check if we have orphaned components
                $missing_components = array();
                foreach ($components_in_sections as $comp_id => $section_id) {
                    if (!isset($saved_state['components'][$comp_id])) {
                        $missing_components[] = $comp_id;
                    }
                }
                
                if (!empty($missing_components)) {
                    GMKB_Debug_Logger::log('RECOVERY: Found ' . count($missing_components) . ' components in sections but not in components object');
                    
                    // Reconstruct minimal component data
                    if (!is_array($saved_state['components'])) {
                        $saved_state['components'] = array();
                    }
                    
                    foreach ($missing_components as $comp_id) {
                        // Extract component type from ID if possible (format: type_timestamp_random)
                        $parts = explode('_', $comp_id);
                        $type = count($parts) > 2 ? $parts[0] : 'unknown';
                        
                        $saved_state['components'][$comp_id] = array(
                            'id' => $comp_id,
                            'type' => $type,
                            'sectionId' => $components_in_sections[$comp_id],
                            'data' => array(),
                            'props' => array(),
                            'recovered' => true // Flag to indicate this was recovered
                        );
                        
                        GMKB_Debug_Logger::log('Recovered component: ' . $comp_id . ' (type: ' . $type . ')');
                    }
                }
            }
            
            // ROOT FIX: Use debug logger for detailed tracking
            $debug_info = GMKB_Debug_Logger::log_load_operation($post_id, $saved_state);
            
            // ROOT FIX: Add component count to response for debugging
            $components_loaded = 0;
            if (isset($saved_state['components'])) {
                if (is_object($saved_state['components'])) {
                    $components_loaded = count((array)$saved_state['components']);
                } else if (is_array($saved_state['components'])) {
                    $components_loaded = count($saved_state['components']);
                }
            }
            
            wp_send_json_success(array(
                'state' => $saved_state,
                'debug' => $debug_info,
                'components_loaded' => $components_loaded,
                'message' => $components_loaded > 0 ? 'Loaded ' . $components_loaded . ' components' : 'No components found'
            ));
        } else {
            // ROOT FIX: Initialize with empty state structure
            $empty_state = array(
                'components' => new stdClass(), // Empty object for JS
                'sections' => array(),
                'layout' => array(),
                'theme' => 'default',
                'themeSettings' => new stdClass(),
                'globalSettings' => new stdClass()
            );
            
            GMKB_Debug_Logger::log('No saved state found for post ' . $post_id . ', returning empty state');
            
            wp_send_json_success(array(
                'state' => $empty_state, 
                'message' => 'No saved state found - initialized with empty state',
                'components_loaded' => 0
            ));
        }
    }
    
    /**
     * Save media kit - ROOT FIX: Properly handle JavaScript object -> PHP array conversion
     */
    public function save_media_kit() {
        // 1. Security Verification
        check_ajax_referer('gmkb_nonce', 'nonce');
        if (!current_user_can('edit_posts')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }

        // 2. Input Validation
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        if ($post_id <= 0) {
            wp_send_json_error(array('message' => 'Invalid Post ID provided.'));
            return;
        }

        if (!isset($_POST['state'])) {
            wp_send_json_error(array('message' => 'No state data received.'));
            return;
        }

        // 3. Data Processing
        $state_json = stripslashes($_POST['state']);
        
        // ROOT FIX: Debug the exact JSON structure
        error_log('GMKB Save - Raw JSON length: ' . strlen($state_json));
        
        // Check if components exists in the raw JSON string
        if (strpos($state_json, '"components":{') !== false) {
            error_log('GMKB Save - Found "components":{ in JSON');
            // Try to extract the components section
            preg_match('/"components":\{([^}]*)\}/', $state_json, $matches);
            if (!empty($matches[1])) {
                error_log('GMKB Save - Components content: ' . $matches[1]);
            }
        } else if (strpos($state_json, '"components":[') !== false) {
            error_log('GMKB Save - WARNING: Components is an array [], not an object {}');
        } else {
            error_log('GMKB Save - ERROR: No components found in JSON at all!');
        }
        
        // Parse JSON as associative array
        $state = json_decode($state_json, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json_error(array('message' => 'Invalid JSON data received.', 'error' => json_last_error_msg()));
            return;
        }
        
        // ROOT FIX: Immediately log what we received
        error_log('GMKB Save - Raw JSON components count: ' . substr_count($state_json, '"id":'));
        error_log('GMKB Save - Decoded state has components: ' . (isset($state['components']) ? 'YES' : 'NO'));
        if (isset($state['components'])) {
            error_log('GMKB Save - Components type: ' . gettype($state['components']));
            error_log('GMKB Save - Components count: ' . count($state['components']));
            if (!empty($state['components'])) {
                error_log('GMKB Save - Component IDs: ' . implode(', ', array_keys($state['components'])));
            }
        }

            
        
        // 4. ROOT FIX: Ensure components are preserved
        // The state from json_decode should already have components
        // We just need to ensure empty arrays become objects for JS compatibility
        if (!isset($state['components'])) {
            $state['components'] = new stdClass();
            error_log('GMKB Save - No components key, initialized as empty object');
        } else if (empty($state['components'])) {
            // Empty array should be an object for JavaScript
            $state['components'] = new stdClass();
            error_log('GMKB Save - Components was empty, converted to object');
        }
        // If components has data, leave it as-is (associative array)

        // 5. Save to Database
        $components_count = is_object($state['components']) ? 0 : count($state['components']);
        error_log('GMKB Save - About to save ' . $components_count . ' components to database');
        
        $result = update_post_meta($post_id, 'gmkb_media_kit_state', $state);
        
        if ($result === false) {
            error_log('GMKB Save - Failed to save to database');
            wp_send_json_error(array('message' => 'Failed to save data to the database.'));
            return;
        }
        
        // 6. Verify what was actually saved
        $saved_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        $saved_components_count = 0;
        
        if (isset($saved_state['components'])) {
            if (is_object($saved_state['components'])) {
                $saved_components_count = count((array)$saved_state['components']);
            } else if (is_array($saved_state['components'])) {
                $saved_components_count = count($saved_state['components']);
            }
            error_log('GMKB Save - Verified: ' . $saved_components_count . ' components in database');
        } else {
            error_log('GMKB Save - ERROR: No components key in saved state!');
        }
        
        $sections_count = isset($state['sections']) && is_array($state['sections']) ? count($state['sections']) : 0;

        // 7. Send Success Response
        wp_send_json_success(array(
            'message' => 'Media kit saved successfully',
            'timestamp' => time(),
            'post_id' => $post_id,
            'components_count' => $saved_components_count,
            'sections_count' => $sections_count,
            'data_size' => strlen($state_json)
        ));
    }

    
    /**
     * Get debug logs for troubleshooting
     */
    public function get_debug_logs() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }
        
        $lines = isset($_POST['lines']) ? intval($_POST['lines']) : 100;
        $logs = GMKB_Debug_Logger::get_recent_logs($lines);
        
        wp_send_json_success(array(
            'logs' => $logs,
            'lines' => $lines
        ));
    }
}

// ROOT FIX: Initialize as singleton
function gmkb_ajax_handlers_init() {
    static $instance = null;
    if ($instance === null) {
        $instance = new GMKB_Ajax_Handlers();
    }
    return $instance;
}

// Initialize on plugins_loaded to ensure everything is ready
add_action('plugins_loaded', 'gmkb_ajax_handlers_init', 5);
