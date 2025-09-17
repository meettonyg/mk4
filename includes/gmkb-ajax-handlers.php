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
     * Load media kit
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
        
        // Get saved state
        $saved_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        
        if ($saved_state) {
            // ROOT FIX: Ensure components is an object for JavaScript
            if (isset($saved_state['components']) && is_array($saved_state['components']) && empty($saved_state['components'])) {
                // Convert empty array to empty object for JavaScript
                $saved_state['components'] = new stdClass();
                GMKB_Debug_Logger::log('Converted empty components array to object');
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
            wp_send_json_success(array('state' => null, 'message' => 'No saved state found'));
        }
    }
    
    /**
     * Save media kit - ROOT FIX: Extract components from sections
     */
    public function save_media_kit() {
        // ROOT FIX: Fixed at source - disabled polling-detector-injector.php
        // No need for defensive output buffering
        
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
        
        // Check user capabilities
        if (!current_user_can('edit_post', $post_id)) {
            wp_send_json_error('You do not have permission to edit this media kit');
            return;
        }
        
        // Get state from POST
        $state_json = isset($_POST['state']) ? stripslashes($_POST['state']) : '';
        
        if (empty($state_json)) {
            wp_send_json_error('No state data provided');
            return;
        }
        
        // Decode state
        $state = json_decode($state_json, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json_error('Invalid JSON data');
            return;
        }
        
        // ROOT FIX: Debug the state structure
        if (defined('WP_DEBUG') && WP_DEBUG) {
            if (isset($state['components'])) {
                GMKB_Debug_Logger::log('Components type: ' . gettype($state['components']));
                
                if (is_array($state['components'])) {
                    GMKB_Debug_Logger::log('Components count: ' . count($state['components']));
                    if (count($state['components']) > 0) {
                        $first_key = array_key_first($state['components']);
                        GMKB_Debug_Logger::log('First component key: ' . $first_key);
                    }
                }
            } else {
                GMKB_Debug_Logger::log('No components key in state');
            }
        }
        
        // ROOT FIX: Properly count components
        $components_count = 0;
        
        // Count components in the components object (this is the main storage)
        if (isset($state['components'])) {
            if (is_array($state['components'])) {
                // Simply count the array - PHP handles both indexed and associative arrays
                $components_count = count($state['components']);
                
                // Log component IDs for debugging
                if ($components_count > 0 && defined('WP_DEBUG') && WP_DEBUG) {
                    $component_ids = array_keys($state['components']);
                    GMKB_Debug_Logger::log('Components being saved: ' . implode(', ', array_slice($component_ids, 0, 5)) . 
                                          ($components_count > 5 ? '... (' . $components_count . ' total)' : ''));
                }
            } else if (is_object($state['components'])) {
                // If it's a standard object, convert and count
                $components_array = (array)$state['components'];
                $components_count = count($components_array);
                
                // Log component IDs for debugging
                if ($components_count > 0 && defined('WP_DEBUG') && WP_DEBUG) {
                    $component_ids = array_keys($components_array);
                    GMKB_Debug_Logger::log('Components being saved (object): ' . implode(', ', array_slice($component_ids, 0, 5)) . 
                                          ($components_count > 5 ? '... (' . $components_count . ' total)' : ''));
                }
            }
        }
        
        // Count sections and component references in sections
        $sections_count = 0;
        $components_in_sections = 0;
        if (isset($state['sections']) && is_array($state['sections'])) {
            $sections_count = count($state['sections']);
            
            // Count component references in sections
            foreach ($state['sections'] as $section) {
                if (isset($section['components']) && is_array($section['components'])) {
                    $components_in_sections += count($section['components']);
                }
            }
        }
        
        // ROOT FIX: Ensure components object is properly maintained
        // If components in sections but no components object, log warning
        if ($components_count === 0 && $components_in_sections > 0 && !isset($state['components'])) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Warning: Components in sections but no components object. State may be corrupted.');
            }
        }
        
        // ROOT FIX: Use debug logger for comprehensive logging
        $debug_info = GMKB_Debug_Logger::log_save_operation($post_id, $state);
        
        // Save the state
        update_post_meta($post_id, 'gmkb_media_kit_state', $state);
        
        // Get data size for debugging
        $data_size = strlen($state_json);
        
        // Send clean JSON response
        wp_send_json_success(array(
            'message' => 'Media kit saved successfully',
            'timestamp' => time(),
            'post_id' => $post_id,
            'components_count' => $components_count,
            'sections_count' => $sections_count,
            'components_in_sections' => $components_in_sections,
            'data_size' => $data_size,
            'save_method' => 'database',
            'debug' => $debug_info
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
