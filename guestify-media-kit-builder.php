<?php
/**
 * Plugin Name: Guestify Media Kit Builder
 * Description: Drag-and-drop media kit builder with customizable components
 * Version: 2.1.0
 * Author: Guestify Team
 * Text Domain: guestify-media-kit-builder
 * Domain Path: /languages
 * License: GPL v2 or later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// === GEMINI FIX START ===
// DEFINE CONSTANTS AT THE TOP LEVEL - BEFORE ANY INCLUDES
define( 'GUESTIFY_VERSION', '2.1.0-vanilla-js-final' );
define( 'GUESTIFY_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'GUESTIFY_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Define GMKB constants for compatibility
define( 'GMKB_VERSION', '2.1.0-vanilla-js-final' );
define( 'GMKB_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'GMKB_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// WordPress compatibility flag
define( 'GMKB_WORDPRESS_COMPATIBLE', true );

// NOW include files that need these constants
require_once GUESTIFY_PLUGIN_DIR . 'includes/enqueue.php';

// SCALABLE ARCHITECTURE: Load base component service before specific components
require_once GUESTIFY_PLUGIN_DIR . 'system/Base_Component_Data_Service.php';

// Component system files
require_once GUESTIFY_PLUGIN_DIR . 'system/ComponentDiscovery.php';
require_once GUESTIFY_PLUGIN_DIR . 'system/ComponentLoader.php';
require_once GUESTIFY_PLUGIN_DIR . 'system/DesignPanel.php';

// ROOT FIX: Load AJAX handlers for component functionality
require_once GUESTIFY_PLUGIN_DIR . 'components/topics/ajax-handler.php';
require_once GUESTIFY_PLUGIN_DIR . 'includes/enhanced-ajax.php';

// SCALABLE ARCHITECTURE: Include test suite in development
if (defined('WP_DEBUG') && WP_DEBUG) {
    add_action('wp_footer', function() {
        if (strpos($_SERVER['REQUEST_URI'] ?? '', 'guestify-media-kit') !== false) {
            echo '<script src="' . GUESTIFY_PLUGIN_URL . 'test-scalable-architecture.js?v=' . time() . '"></script>';
        }
    }, 999);
}
// === GEMINI FIX END ===

/**
 * Main plugin class - SIMPLIFIED
 */
class Guestify_Media_Kit_Builder {

    private static $instance;
    private $component_discovery;
    private $component_loader;
    private $design_panel;

    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // SIMPLIFIED: Constructor only handles WordPress hooks - NO file includes or constants
        
        // Initialize component system
        $this->component_discovery = new ComponentDiscovery(GUESTIFY_PLUGIN_DIR . 'components');
        
        // Make ComponentDiscovery available globally for cache management
        global $gmkb_component_discovery;
        $gmkb_component_discovery = $this->component_discovery;
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB: ComponentDiscovery initialized with dir: ' . GUESTIFY_PLUGIN_DIR . 'components');
        }
        
        $this->component_discovery->scan();
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            $debug_info = $this->component_discovery->getDebugInfo();
            error_log('✅ GMKB: ComponentDiscovery scan complete. Found ' . $debug_info['components_count'] . ' components');
            error_log('📋 GMKB: Available components: ' . implode(', ', $debug_info['component_names']));
            if (isset($debug_info['cache_status']['cache_exists'])) {
                error_log('🗄️ GMKB: Cache status - exists: ' . ($debug_info['cache_status']['cache_exists'] ? 'yes' : 'no') . ', age: ' . $debug_info['cache_status']['cache_age'] . 's');
            }
        }
        $this->component_loader = new ComponentLoader(GUESTIFY_PLUGIN_DIR . 'components', $this->component_discovery);
        $this->design_panel = new DesignPanel(GUESTIFY_PLUGIN_DIR . 'components');
        
        // WordPress hooks only
        $this->init_hooks();
        
        // Add admin menu for cache management
        if (is_admin()) {
            add_action('admin_menu', array($this, 'add_admin_menu'));
        }
        
        // ROOT FIX: Ensure topics AJAX handlers are registered
        add_action('init', array($this, 'ensure_topics_ajax_handlers_registered'), 5);
        
        // Log simplified initialization
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB: Simplified WordPress-native initialization complete');
            error_log('✅ GMKB: Constants defined before enqueue.php loaded');
        }
    }

    private function init_hooks() {
        add_action( 'init', array( $this, 'load_textdomain' ) );
        
        // Early builder page check
        add_action( 'wp', array( $this, 'early_builder_check' ), 1 );
        
        add_action( 'template_redirect', array( $this, 'isolated_builder_template_takeover' ) );
        add_shortcode( 'guestify_media_kit', array( $this, 'media_kit_shortcode' ) );
        
        // Register REST API endpoints
        add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
        
        // Register AJAX handlers with consistent nonce validation
        add_action( 'wp_ajax_guestify_get_components', array( $this, 'ajax_get_components' ) );
        add_action( 'wp_ajax_nopriv_guestify_get_components', array( $this, 'ajax_get_components' ) );
        add_action( 'wp_ajax_guestify_render_component', array( $this, 'ajax_render_component' ) );
        add_action( 'wp_ajax_nopriv_guestify_render_component', array( $this, 'ajax_render_component' ) );
        add_action( 'wp_ajax_guestify_render_component_enhanced', array( $this, 'ajax_render_component_enhanced' ) );
        add_action( 'wp_ajax_nopriv_guestify_render_component_enhanced', array( $this, 'ajax_render_component_enhanced' ) );
        add_action( 'wp_ajax_guestify_render_design_panel', array( $this, 'ajax_render_design_panel' ) );
        add_action( 'wp_ajax_nopriv_guestify_render_design_panel', array( $this, 'ajax_render_design_panel' ) );
        
        // Component cache management AJAX handlers
        add_action( 'wp_ajax_gmkb_clear_component_cache', array( $this, 'ajax_clear_component_cache' ) );
        add_action( 'wp_ajax_gmkb_refresh_components', array( $this, 'ajax_refresh_components' ) );
        
        // Media kit save/load handlers with consistent nonce validation
        add_action( 'wp_ajax_guestify_save_media_kit', array( $this, 'ajax_save_media_kit' ) );
        add_action( 'wp_ajax_nopriv_guestify_save_media_kit', array( $this, 'ajax_save_media_kit' ) );
        add_action( 'wp_ajax_guestify_load_media_kit', array( $this, 'ajax_load_media_kit' ) );
        add_action( 'wp_ajax_nopriv_guestify_load_media_kit', array( $this, 'ajax_load_media_kit' ) );
    }

    /**
     * SIMPLIFIED: Early builder page detection
     */
    public function early_builder_check() {
        // Simple builder page detection
        $is_builder_page = false;
        
        // URL-based detection
        if (isset($_SERVER['REQUEST_URI']) && strpos($_SERVER['REQUEST_URI'], 'guestify-media-kit') !== false) {
            $is_builder_page = true;
        }
        // WordPress page detection
        elseif (is_page('guestify-media-kit') || is_page('media-kit')) {
            $is_builder_page = true;
        }
        
        if ($is_builder_page) {
            // Set global flag for enqueue.php
            global $gmkb_template_active;
            $gmkb_template_active = true;
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('✅ GMKB: Builder page detected - WordPress will handle scripts');
            }
        }
    }
    
    /**
     * SIMPLIFIED: Template takeover
     */
    public function isolated_builder_template_takeover() {
        // Simple detection
        $is_builder_page = false;
        
        if (isset($_SERVER['REQUEST_URI']) && strpos($_SERVER['REQUEST_URI'], 'guestify-media-kit') !== false) {
            $is_builder_page = true;
        }
        elseif (is_page('guestify-media-kit') || is_page('media-kit')) {
            $is_builder_page = true;
        }
        
        if (!$is_builder_page) {
            return;
        }
        
        // Set global flag for script enqueuing
        global $gmkb_template_active;
        $gmkb_template_active = true;
        
        // Simple post_id detection
        $post_id = $this->detect_mkcg_post_id();
        
        // MISSING: Load existing media kit state from database
        $saved_state = array();
        if ( $post_id > 0 ) {
            $saved_state = get_post_meta( $post_id, 'gmkb_media_kit_state', true );
            if ( empty( $saved_state ) ) {
                $saved_state = array(
                    'components' => array(),
                    'layout' => array(),
                    'globalSettings' => array()
                );
            }
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB: Simplified template takeover active');
            error_log('✅ GMKB: Post ID: ' . $post_id);
            error_log('✅ CRITICAL FIX: Scripts manually enqueued in template takeover');
            error_log('🎆 VANILLA JS: No jQuery dependencies');
            error_log('📁 Plugin URL in takeover: ' . GUESTIFY_PLUGIN_URL);
        }
        
        ?>
        <!DOCTYPE html>
        <html <?php language_attributes(); ?> class="gmkb-isolated">
        <head>
            <meta charset="<?php bloginfo( 'charset' ); ?>" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="robots" content="noindex, nofollow" />
            <title>Media Kit Builder - <?php bloginfo('name'); ?></title>
            
            <style id="gmkb-isolation-styles">
                body, html { 
                    margin: 0; 
                    padding: 0; 
                    overflow: hidden; 
                    height: 100vh; 
                    width: 100vw; 
                    background: #1a1a1a;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                
                .gmkb-ready::before {
                    content: 'SIMPLIFIED ✓';
                    position: fixed;
                    top: 5px;
                    left: 5px;
                    background: #10b981;
                    color: white;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-size: 10px;
                    z-index: 10002;
                    font-weight: bold;
                }
                
                .gmkb-initializing {
                    position: relative;
                }
                
                .gmkb-initializing::after {
                    content: 'Loading WordPress-Native Builder...';
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0, 0, 0, 0.9);
                    color: #10b981;
                    padding: 20px 30px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    z-index: 10003;
                    border: 2px solid #10b981;
                }
                
                #wpadminbar { display: none !important; }
                html { margin-top: 0 !important; }
            </style>
            
            <?php wp_head(); ?>
            
            <!-- CRITICAL FIX: Direct script output since wp_enqueue_script doesn't work in template takeover -->
            <script id="gmkbData" type="text/javascript">
            var gmkbData = <?php echo json_encode(array(
                'ajaxUrl'       => admin_url( 'admin-ajax.php' ),
                'restUrl'       => esc_url_raw( rest_url() ),
                'nonce'         => wp_create_nonce( 'gmkb_nonce' ), // ROOT FIX: Match AJAX handler expectation
                'restNonce'     => wp_create_nonce( 'wp_rest' ),
                'postId'        => $post_id,
                'pluginUrl'     => GUESTIFY_PLUGIN_URL,
                'siteUrl'       => home_url(),
                'pluginVersion' => GUESTIFY_VERSION,
                'architecture'  => 'vanilla-js-final',
                'timestamp'     => time(),
                'builderPage'   => true,
                'isBuilderPage' => true,
                'debugMode'     => defined( 'WP_DEBUG' ) && WP_DEBUG,
                'templateFixed' => true,
                'vanillaJS'     => true,
                'savedState'    => $saved_state  // MISSING: Pass existing state to JavaScript
            )); ?>;
            console.log('✅ WordPress Data: gmkbData loaded directly in template', gmkbData);
            if (gmkbData.savedState && Object.keys(gmkbData.savedState.components || {}).length > 0) {
                console.log('🔄 Existing components found:', Object.keys(gmkbData.savedState.components).length, 'components');
            } else {
                console.log('📝 No existing components - starting with empty state');
            }
            </script>
            
            <script src="<?php echo GUESTIFY_PLUGIN_URL . 'js/main.js?v=' . time(); ?>" type="text/javascript"></script>
            
            <!-- ROOT FIX: Manual enqueue ComponentControlsManager in template takeover -->
            <script src="<?php echo GUESTIFY_PLUGIN_URL . 'js/core/component-controls-manager.js?v=' . time(); ?>" type="text/javascript"></script>
            
            <link rel="stylesheet" href="<?php echo GUESTIFY_PLUGIN_URL . 'css/guestify-builder.css?v=' . time(); ?>" type="text/css" media="all" />
        </head>
        <body class="media-kit-builder-isolated gmkb-isolated-builder gmkb-initializing gmkb-simplified" data-post-id="<?php echo esc_attr($post_id); ?>" data-template-version="simplified-wordpress-native">
            
            <!-- Error boundary for template -->
            <div id="gmkb-template-error-boundary" style="display: none;">
                <div style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: #fee;
                    border: 2px solid #f88;
                    padding: 30px;
                    border-radius: 8px;
                    text-align: center;
                    color: #d44;
                    max-width: 500px;
                    z-index: 10004;
                ">
                    <h2>⚠️ Template Error</h2>
                    <p>The builder template encountered an error.</p>
                    <button onclick="location.reload()" style="
                        background: #d44;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 4px;
                        cursor: pointer;
                        margin-top: 10px;
                    ">Reload Builder</button>
                </div>
            </div>
            
            <?php
            try {
                echo do_shortcode('[guestify_media_kit]');
            } catch (Exception $e) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('GMKB Template Error: ' . $e->getMessage());
                }
                echo '<script>document.getElementById("gmkb-template-error-boundary").style.display = "block";</script>';
            }
            
            wp_footer();
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('✅ GMKB: WordPress footer rendered - scripts handled by WordPress');
            }
            ?>
        </body>
        </html>
        <?php
        exit();
    }

    public function media_kit_shortcode( $atts ) {
        ob_start();
        
        $template = GUESTIFY_PLUGIN_DIR . 'templates/builder-template.php';
        
        if (file_exists($template)) {
            include $template;
        } else {
            echo '<div style="padding: 20px; text-align: center; background: #fee; border: 2px solid #f88; border-radius: 8px; margin: 20px;">
                <h2>⚠️ Template Not Found</h2>
                <p>Builder template file not found: ' . esc_html($template) . '</p>
            </div>';
        }
        
        return ob_get_clean();
    }

    public function load_textdomain() {
        load_plugin_textdomain( 'guestify-media-kit-builder', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
    }
    
    /**
     * Register REST API routes
     */
    public function register_rest_routes() {
        register_rest_route( 'guestify/v1', '/components', array(
            'methods' => 'GET',
            'callback' => array( $this, 'rest_get_components' ),
            'permission_callback' => '__return_true'
        ) );
        
        register_rest_route( 'guestify/v1', '/render-component', array(
            'methods' => 'POST',
            'callback' => array( $this, 'rest_render_component' ),
            'permission_callback' => '__return_true'
        ) );
    }
    
    /**
     * REST API: Get all components
     */
    public function rest_get_components() {
        $components = $this->component_discovery->getComponents();
        $categories = $this->component_discovery->getCategories();
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB: rest_get_components - Found ' . count($components) . ' components');
            error_log('GMKB: Components: ' . print_r(array_keys($components), true));
        }
        
        // Ensure we return proper format for AJAX
        return array(
            'success' => true,
            'components' => $components,
            'categories' => $categories,
            'total' => count($components),
            'timestamp' => time()
        );
    }
    
    /**
     * REST API: Render a component
     */
    public function rest_render_component( $request ) {
        $params = $request->get_json_params();
        $component_slug = isset( $params['component'] ) ? sanitize_text_field( $params['component'] ) : '';
        $props = isset( $params['props'] ) ? $params['props'] : array();
        
        if ( empty( $component_slug ) ) {
            return new WP_Error( 'invalid_component', 'Component slug is required', array( 'status' => 400 ) );
        }
        
        // ROOT FIX: Ensure post ID is passed to component
                $enhanced_props = array_merge($props, [
                    'post_id' => $post_id,
                    'component_id' => $componentId ?? uniqid('component_')
                ]);
                
                $html = $this->component_loader->loadComponent( $component_slug, $enhanced_props );
        
        if ( $html === false ) {
            return new WP_Error( 'component_not_found', 'Component not found', array( 'status' => 404 ) );
        }
        
        return array(
            'success' => true,
            'html' => $html
        );
    }
    
    /**
     * AJAX handlers with consistent nonce validation
     */
    public function ajax_get_components() {
        // Verify nonce for security
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB: ajax_get_components - Nonce verification failed');
                error_log('GMKB: Provided nonce: ' . ($_POST['nonce'] ?? 'missing'));
            }
            wp_send_json_error('Security verification failed');
            return;
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB: ajax_get_components - Processing request');
        }
        
        try {
            // Get components from discovery system
            $components = $this->component_discovery->getComponents();
            $categories = $this->component_discovery->getCategories();
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB: ajax_get_components - Raw components count: ' . count($components));
                error_log('GMKB: ajax_get_components - Component keys: ' . implode(', ', array_keys($components)));
                error_log('GMKB: ajax_get_components - Categories count: ' . count($categories));
            }
            
            // Get debug information
            $debug_info = $this->component_discovery->getDebugInfo();
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB: ajax_get_components - Debug info: ' . print_r($debug_info, true));
            }
            
            // Prepare response
            $result = array(
                'success' => true,
                'components' => $components,
                'categories' => $categories,
                'total' => count($components),
                'timestamp' => time(),
                'debug' => $debug_info
            );
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB: ajax_get_components - Returning response with ' . count($components) . ' components');
            }
            
            wp_send_json_success($result);
            
        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB: ajax_get_components - Exception: ' . $e->getMessage());
                error_log('GMKB: ajax_get_components - Exception trace: ' . $e->getTraceAsString());
            }
            
            wp_send_json_error(array(
                'message' => 'Failed to load components',
                'error' => defined('WP_DEBUG') && WP_DEBUG ? $e->getMessage() : 'Internal error',
                'debug' => defined('WP_DEBUG') && WP_DEBUG ? array(
                    'exception' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ) : null
            ));
        }
    }
    
    /**
     * AJAX handler to render a single component server-side.
     * --- ROOT FIX: SINGLE-STEP RENDER LOGIC ---
     * This function is now responsible for fetching data for components like 'topics'
     * before rendering, creating a more reliable "single-step render".
     */
    public function ajax_render_component() {
        check_ajax_referer('gmkb_nonce', 'nonce');

        $component_type = isset($_POST['component']) ? sanitize_text_field($_POST['component']) : '';
        $props_json = isset($_POST['props']) ? stripslashes($_POST['props']) : '{}';
        $props = json_decode($props_json, true);

        if (empty($component_type)) {
            wp_send_json_error('Component type not provided.');
            return;
        }

        // --- ROOT FIX: SINGLE-STEP RENDER LOGIC ---
        // Pre-load data for components that need server-side data loading
        if ($component_type === 'topics') {
            $topics_ajax_handler_path = GMKB_PLUGIN_DIR . 'components/topics/ajax-handler.php';
            if (file_exists($topics_ajax_handler_path)) {
                require_once $topics_ajax_handler_path;
                if (class_exists('GMKB_Topics_Ajax_Handler')) {
                    $topics_handler = GMKB_Topics_Ajax_Handler::get_instance();
                    
                    // CRITICAL FIX: Multiple data source ID detection strategies
                    $data_source_id = 0;
                    
                    // Strategy 1: From props (various parameter names)
                    $data_source_id = $props['post_id'] ?? $props['dataSourceId'] ?? $props['postId'] ?? $props['data_source_id'] ?? 0;
                    
                    // Strategy 2: From POST parameters if not in props
                    if (!$data_source_id) {
                        $data_source_id = intval($_POST['post_id'] ?? $_POST['media_kit_post_id'] ?? 0);
                    }
                    
                    // Strategy 3: From URL parameters as fallback
                    if (!$data_source_id) {
                        $data_source_id = intval($_GET['post_id'] ?? $_GET['p'] ?? 0);
                    }
                    
                    // Strategy 4: Auto-detect from current context
                    if (!$data_source_id) {
                        $data_source_id = $this->detect_mkcg_post_id();
                    }
                    
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log("ROOT FIX: Topics data source ID detection: {$data_source_id}");
                        error_log("ROOT FIX: Props keys: " . implode(', ', array_keys($props)));
                    }
                    
                    // Load topics data with the detected ID
                    $loaded_topics = array();
                    if ($data_source_id > 0) {
                        $loaded_topics = $topics_handler->load_topics_direct($data_source_id);
                        
                        if (defined('WP_DEBUG') && WP_DEBUG) {
                            error_log("ROOT FIX: Loaded " . count($loaded_topics) . " topics for post {$data_source_id}");
                        }
                    }
                    
                    $props['loaded_topics'] = $loaded_topics;
                    $props['post_id'] = $data_source_id;
                    $props['topics_data_source'] = 'single_step_render';
                }
            }
        }
        // --- END SINGLE-STEP RENDER LOGIC ---

        $template_path = GMKB_PLUGIN_DIR . "components/{$component_type}/template.php";
        if (file_exists($template_path)) {
            ob_start();
            include $template_path;
            $html = ob_get_clean();
            $scripts_data = $this->get_component_scripts($component_type, $props);
            wp_send_json_success(['html' => $html, 'scripts' => $scripts_data]);
        } else {
            wp_send_json_error("Template file not found for component: {$component_type}");
        }
    }
    
    /**
     * Get component scripts for AJAX response
     * ROOT FIX: Support for component script loading in single-step render
     */
    private function get_component_scripts($component_type, $props) {
        $scripts = array();
        
        // Check for component-specific scripts
        $component_dir = GMKB_PLUGIN_DIR . "components/{$component_type}/";
        
        // Look for main script file
        $main_script = $component_dir . 'script.js';
        if (file_exists($main_script)) {
            $scripts[] = array(
                'src' => GMKB_PLUGIN_URL . "components/{$component_type}/script.js",
                'type' => 'main',
                'component' => $component_type
            );
        }
        
        // Look for panel script file
        $panel_script = $component_dir . 'panel-script.js';
        if (file_exists($panel_script)) {
            $scripts[] = array(
                'src' => GMKB_PLUGIN_URL . "components/{$component_type}/panel-script.js", 
                'type' => 'panel',
                'component' => $component_type
            );
        }
        
        return $scripts;
    }
    
    public function ajax_render_design_panel() {
        // Verify nonce for security
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB: ajax_render_design_panel - Nonce verification failed');
            }
            wp_send_json_error('Security verification failed');
            return;
        }
        
        $component_slug = isset( $_POST['component'] ) ? sanitize_text_field( $_POST['component'] ) : '';
        
        if ( empty( $component_slug ) ) {
            wp_send_json_error( 'Component slug is required' );
            return;
        }
        
        // EVENT-DRIVEN: Validate post_id parameter (no global injection)
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            if ($post_id > 0) {
                error_log("EVENT-DRIVEN: post_id={$post_id} parameter for component '{$component_slug}' - no global injection");
            } else {
                error_log("EVENT-DRIVEN: No post_id provided for component '{$component_slug}' - will show error state");
            }
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB: ajax_render_design_panel - Loading design panel for: ' . $component_slug);
        }
        
        $html = $this->component_loader->loadDesignPanel( $component_slug );
        
        if ( $html === false ) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB: ajax_render_design_panel - Design panel not found for: ' . $component_slug);
            }
            
            // Provide fallback generic design panel
            $html = $this->get_generic_design_panel( $component_slug );
            
            wp_send_json_success( array( 
                'html' => $html,
                'fallback' => true,
                'component' => $component_slug
            ) );
            return;
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB: ajax_render_design_panel - Successfully loaded design panel for: ' . $component_slug);
        }
        
        wp_send_json_success( array( 
            'html' => $html,
            'component' => $component_slug
        ) );
    }
    
    /**
     * ROOT FIX: Save media kit state to database with comprehensive error handling and diagnostics
     */
    public function ajax_save_media_kit() {
        // Enhanced error logging for debugging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('🔄 GMKB: ajax_save_media_kit called');
            error_log('📊 POST data keys: ' . implode(', ', array_keys($_POST)));
            error_log('📊 POST data sizes: nonce=' . strlen($_POST['nonce'] ?? '') . ', state=' . strlen($_POST['state'] ?? '') . ', post_id=' . ($_POST['post_id'] ?? 'missing'));
        }
        
        // Check if nonce exists
        $nonce = isset($_POST['nonce']) ? $_POST['nonce'] : '';
        if (empty($nonce)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB: No nonce provided in request');
            }
            wp_send_json_error('No nonce provided');
            return;
        }
        
        // Verify nonce for security - ROOT FIX: Use correct action that matches JavaScript
        if (!wp_verify_nonce($nonce, 'gmkb_nonce')) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB: Nonce verification failed');
                error_log('  Provided nonce: ' . $nonce);
                error_log('  Expected action: gmkb_nonce');
            }
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB: Nonce verification passed');
        }
        
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        $state_data = isset($_POST['state']) ? $_POST['state'] : '';
        
        // ROOT FIX: Enhanced post ID validation
        if (!$post_id || $post_id <= 0) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB: Invalid post ID provided: ' . var_export($post_id, true));
            }
            wp_send_json_error('Valid post ID is required');
            return;
        }
        
        // ROOT FIX: Handle empty state data gracefully for auto-save
        if (empty($state_data)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('ℹ️ GMKB: No state data provided - treating as valid empty save');
            }
            wp_send_json_success(array(
                'message' => 'No state data to save',
                'timestamp' => time(),
                'post_id' => $post_id,
                'components_count' => 0,
                'empty_save' => true
            ));
            return;
        }
        
        // ROOT FIX: Enhanced JSON validation with detailed error reporting
        $state = json_decode(stripslashes($state_data), true);
        $json_error = json_last_error();
        if ($json_error !== JSON_ERROR_NONE) {
            $json_error_msg = json_last_error_msg();
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB: JSON decode error: ' . $json_error_msg);
                error_log('❌ GMKB: JSON error code: ' . $json_error);
                error_log('❌ GMKB: Raw state data length: ' . strlen($state_data));
                error_log('❌ GMKB: First 200 chars of state data: ' . substr($state_data, 0, 200));
            }
            wp_send_json_error('Invalid JSON data: ' . $json_error_msg);
            return;
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB: JSON decoded successfully');
            error_log('📊 GMKB: State structure keys: ' . implode(', ', array_keys($state)));
        }
        
        // ROOT FIX: Enhanced post validation with detailed diagnostics
        $post = get_post($post_id);
        if (!$post) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB: Post not found: ' . $post_id);
                // Check if post exists in database
                global $wpdb;
                $post_exists = $wpdb->get_var($wpdb->prepare("SELECT ID FROM {$wpdb->posts} WHERE ID = %d", $post_id));
                error_log('❌ GMKB: Database check - post exists: ' . ($post_exists ? 'YES' : 'NO'));
            }
            wp_send_json_error('Post not found (ID: ' . $post_id . ')');
            return;
        }
        
        // ROOT FIX: Check post status and permissions
        if ($post->post_status === 'trash') {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB: Post is in trash: ' . $post_id);
            }
            wp_send_json_error('Cannot save to trashed post');
            return;
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB: Post validation passed - ID: ' . $post_id . ', Title: ' . $post->post_title . ', Status: ' . $post->post_status);
        }
        
        // ROOT FIX: Enhanced data structure validation
        if (!is_array($state)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB: State is not an array: ' . gettype($state));
            }
            wp_send_json_error('Invalid state data structure');
            return;
        }
        
        // ROOT FIX: Validate state structure
        $required_keys = array('components', 'layout', 'globalSettings');
        foreach ($required_keys as $key) {
            if (!isset($state[$key])) {
                $state[$key] = array(); // Provide defaults
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('⚠️ GMKB: Missing state key "' . $key . '" - providing default empty array');
                }
            }
        }
        
        // ROOT FIX: Check data size before saving
        $serialized_state = maybe_serialize($state);
        $data_size = strlen($serialized_state);
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('📊 GMKB: Serialized data size: ' . number_format($data_size) . ' bytes');
            error_log('📊 GMKB: Components count: ' . count($state['components']));
        }
        
        // ROOT FIX: Check WordPress meta value size limit (usually 64KB for most setups)
        if ($data_size > 65536) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB: Data too large for meta storage: ' . number_format($data_size) . ' bytes');
            }
            wp_send_json_error('Data too large to save (' . number_format($data_size) . ' bytes)');
            return;
        }
        
        // ROOT FIX: Pre-save database connectivity test
        global $wpdb;
        $db_test = $wpdb->get_var("SELECT 1");
        if ($db_test !== '1') {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB: Database connectivity test failed');
                error_log('❌ GMKB: WordPress database error: ' . $wpdb->last_error);
            }
            wp_send_json_error('Database connectivity issue');
            return;
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB: Pre-save validations passed - attempting meta update');
        }
        
        // ROOT FIX: Enhanced save operation with detailed error reporting
        $meta_key = 'gmkb_media_kit_state';
        
        // Check if meta already exists
        $existing_meta = get_post_meta($post_id, $meta_key, true);
        $is_update = !empty($existing_meta);
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('📊 GMKB: Meta operation type: ' . ($is_update ? 'UPDATE' : 'CREATE'));
            if ($is_update) {
                $existing_size = strlen(maybe_serialize($existing_meta));
                error_log('📊 GMKB: Existing meta size: ' . number_format($existing_size) . ' bytes');
            }
        }
        
        // Perform the save with enhanced error detection
        $save_start_time = microtime(true);
        $success = update_post_meta($post_id, $meta_key, $state);
        $save_duration = microtime(true) - $save_start_time;
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('⏱️ GMKB: Save operation took: ' . number_format($save_duration * 1000, 2) . 'ms');
            error_log('📊 GMKB: update_post_meta() returned: ' . var_export($success, true));
        }
        
        // ROOT FIX: Enhanced success/failure detection with WordPress behavior handling
        if ($success !== false) {
            // Verify the save actually worked by reading back
            $verification_data = get_post_meta($post_id, $meta_key, true);
            $verification_success = !empty($verification_data) && is_array($verification_data);
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('✅ GMKB: Save verification: ' . ($verification_success ? 'PASSED' : 'FAILED'));
                if ($verification_success) {
                    error_log('✅ GMKB: Media kit saved successfully for post ' . $post_id);
                    error_log('📊 GMKB: Components saved: ' . count($state['components'] ?? []));
                    error_log('📊 GMKB: Verified components: ' . count($verification_data['components'] ?? []));
                } else {
                    error_log('❌ GMKB: Save verification failed - data not found after save');
                }
            }
            
            if ($verification_success) {
                wp_send_json_success(array(
                    'message' => 'Media kit saved successfully',
                    'timestamp' => time(),
                    'post_id' => $post_id,
                    'components_count' => count($state['components'] ?? []),
                    'data_size' => $data_size,
                    'save_duration_ms' => round($save_duration * 1000, 2),
                    'operation_type' => $is_update ? 'update' : 'create'
                ));
            } else {
                wp_send_json_error('Save completed but verification failed - data may be corrupted');
            }
        } else {
            // ROOT FIX: Handle WordPress "false" for identical data (not an error)
            $wp_error = '';
            if (!empty($wpdb->last_error)) {
                $wp_error = $wpdb->last_error;
            }
            
            // Check for common scenarios where WordPress returns false
            $is_identical_data = false;
            $has_meta_permissions = false;
            
            // Test post meta permissions
            $test_meta = update_post_meta($post_id, 'gmkb_test_meta', 'test_value');
            if ($test_meta !== false) {
                $has_meta_permissions = true;
                delete_post_meta($post_id, 'gmkb_test_meta'); // Clean up
            }
            
            // Check if data is identical (WordPress optimization)
            if ($is_update && $existing_meta === $state) {
                $is_identical_data = true;
            }
            
            // ROOT FIX: If data is identical and we have permissions, treat as success
            if ($is_identical_data && $has_meta_permissions) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('✅ GMKB: Data unchanged but this is success - WordPress optimization');
                    error_log('✅ GMKB: Media kit state is current for post ' . $post_id);
                }
                
                wp_send_json_success(array(
                    'message' => 'Media kit is already up to date',
                    'timestamp' => time(),
                    'post_id' => $post_id,
                    'components_count' => count($state['components'] ?? []),
                    'data_size' => $data_size,
                    'save_duration_ms' => round($save_duration * 1000, 2),
                    'operation_type' => 'no_change',
                    'wordpress_optimization' => true
                ));
                return;
            }
            
            // Actual failure scenarios
            $failure_reasons = array();
            
            if (!$has_meta_permissions) {
                $failure_reasons[] = 'No permission to update post meta';
            }
            
            if (!empty($wp_error)) {
                $failure_reasons[] = 'Database error: ' . $wp_error;
            }
            
            if (empty($failure_reasons)) {
                $failure_reasons[] = 'Unknown WordPress update_post_meta failure';
            }
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB: Actual save failure for post ' . $post_id);
                error_log('❌ GMKB: WordPress database error: ' . $wp_error);
                error_log('❌ GMKB: Failure analysis: ' . implode(', ', $failure_reasons));
                error_log('❌ GMKB: Has meta permissions: ' . ($has_meta_permissions ? 'YES' : 'NO'));
                error_log('❌ GMKB: Is identical data: ' . ($is_identical_data ? 'YES' : 'NO'));
                error_log('❌ GMKB: Last WordPress query: ' . $wpdb->last_query);
            }
            
            $error_message = 'Failed to save media kit: ' . implode(', ', $failure_reasons);
            wp_send_json_error($error_message);
        }
    }
    
    /**
     * FIXED: Load media kit state from database with enhanced error handling
     */
    public function ajax_load_media_kit() {
        // Enhanced error logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('🔄 GMKB: ajax_load_media_kit called');
            error_log('📊 GET data: ' . print_r($_GET, true));
        }
        
        $post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;
        
        if (!$post_id) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB: No post ID provided for load');
            }
            wp_send_json_error('Post ID is required');
            return;
        }
        
        // Validate post exists
        $post = get_post($post_id);
        if (!$post) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB: Post not found for load: ' . $post_id);
            }
            wp_send_json_error('Post not found');
            return;
        }
        
        // Load from post meta
        $state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        
        if (empty($state)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('📝 GMKB: No saved state found for post ' . $post_id);
            }
            // Return empty state if nothing saved
            wp_send_json_success(array(
                'state' => array(
                    'components' => array(),
                    'layout' => array(),
                    'globalSettings' => array()
                ),
                'message' => 'No saved state found',
                'post_id' => $post_id
            ));
        } else {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('✅ GMKB: Loaded state for post ' . $post_id);
                error_log('📊 Components loaded: ' . count($state['components'] ?? []));
            }
            wp_send_json_success(array(
                'state' => $state,
                'message' => 'Media kit loaded successfully',
                'post_id' => $post_id,
                'components_count' => count($state['components'] ?? [])
            ));
        }
    }
    
    /**
     * Get generic design panel for components without custom panels
     */
    private function get_generic_design_panel($component_slug) {
        $component_name = ucwords(str_replace(array('-', '_'), ' ', $component_slug));
        
        return '
            <div class="element-editor__title">' . esc_html($component_name) . ' Settings</div>
            <div class="element-editor__subtitle">Configure this component</div>
            
            <div class="form-section">
                <h4 class="form-section__title">Basic Properties</h4>
                <div class="form-group">
                    <label class="form-label">Component Name</label>
                    <input type="text" class="form-input" data-property="name" placeholder="Component name">
                </div>
            </div>
            
            <div class="form-section">
                <h4 class="form-section__title">Actions</h4>
                <div class="form-help-text">
                    This component doesn\'t have custom settings. You can edit it directly in the preview area.
                </div>
                <div class="form-group">
                    <button type="button" class="btn btn--secondary btn--small" onclick="console.log(\'Edit component directly in preview\')">
                        Edit in Preview
                    </button>
                </div>
            </div>
        ';
    }
    
    /**
     * AJAX handler to clear component discovery cache
     */
    public function ajax_clear_component_cache() {
        // Verify user permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }
        
        // Verify nonce if provided
        if (isset($_POST['nonce']) && !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
            wp_send_json_error('Security verification failed');
            return;
        }
        
        try {
            $this->component_discovery->clearCache();
            
            wp_send_json_success(array(
                'message' => 'Component cache cleared successfully',
                'timestamp' => time()
            ));
        } catch (Exception $e) {
            wp_send_json_error('Failed to clear cache: ' . $e->getMessage());
        }
    }
    
    /**
     * AJAX handler to refresh component discovery
     */
    public function ajax_refresh_components() {
        // Verify user permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }
        
        // Verify nonce if provided
        if (isset($_POST['nonce']) && !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
            wp_send_json_error('Security verification failed');
            return;
        }
        
        try {
            $categories = $this->component_discovery->forceRefresh();
            $components = $this->component_discovery->getComponents();
            
            wp_send_json_success(array(
                'message' => 'Components refreshed successfully',
                'components' => $components,
                'categories' => $categories,
                'total' => count($components),
                'timestamp' => time()
            ));
        } catch (Exception $e) {
            wp_send_json_error('Failed to refresh components: ' . $e->getMessage());
        }
    }
    
    /**
     * Add admin menu for GMKB settings
     */
    public function add_admin_menu() {
        add_options_page(
            'GMKB Component Cache',
            'GMKB Cache',
            'manage_options',
            'gmkb-cache',
            array($this, 'admin_cache_page')
        );
    }
    
    /**
     * Admin page for component cache management
     */
    public function admin_cache_page() {
        if (isset($_POST['clear_cache'])) {
            $this->component_discovery->clearCache();
            echo '<div class="notice notice-success"><p>Component cache cleared successfully!</p></div>';
        }
        
        if (isset($_POST['refresh_components'])) {
            $this->component_discovery->forceRefresh();
            echo '<div class="notice notice-success"><p>Components refreshed successfully!</p></div>';
        }
        
        $debug_info = $this->component_discovery->getDebugInfo();
        $cache_status = $debug_info['cache_status'];
        
        ?>
        <div class="wrap">
            <h1>GMKB Component Cache Management</h1>
            
            <div class="card">
                <h2>Cache Status</h2>
                <table class="form-table">
                    <tr>
                        <th>Cache Exists:</th>
                        <td><?php echo $cache_status['cache_exists'] ? '✅ Yes' : '❌ No'; ?></td>
                    </tr>
                    <?php if ($cache_status['cache_exists']): ?>
                    <tr>
                        <th>Cache Age:</th>
                        <td><?php echo human_time_diff(time() - $cache_status['cache_age']) . ' ago'; ?></td>
                    </tr>
                    <tr>
                        <th>Cache Size:</th>
                        <td><?php echo size_format($cache_status['cache_size']); ?></td>
                    </tr>
                    <?php endif; ?>
                    <tr>
                        <th>Components Found:</th>
                        <td><?php echo $debug_info['components_count']; ?></td>
                    </tr>
                    <tr>
                        <th>Categories:</th>
                        <td><?php echo implode(', ', $debug_info['category_names']); ?></td>
                    </tr>
                </table>
            </div>
            
            <div class="card">
                <h2>Cache Management</h2>
                <form method="post">
                    <?php wp_nonce_field('gmkb_cache_action'); ?>
                    <p>
                        <input type="submit" name="clear_cache" class="button button-secondary" value="Clear Cache" />
                        <span class="description">Clear the component cache. Next page load will scan the filesystem.</span>
                    </p>
                    <p>
                        <input type="submit" name="refresh_components" class="button button-primary" value="Refresh Components" />
                        <span class="description">Force a fresh scan and update the cache immediately.</span>
                    </p>
                </form>
            </div>
            
            <div class="card">
                <h2>Performance Information</h2>
                <p><strong>Why caching matters:</strong> Without caching, the system scans the filesystem every time the builder loads. 
                   With <?php echo $debug_info['components_count']; ?> components, this improves performance significantly.</p>
                <p><strong>When to refresh:</strong> Use "Refresh Components" after adding, removing, or modifying component files.</p>
                <p><strong>Cache duration:</strong> Cache expires automatically after 1 hour, or after 24 hours maximum.</p>
            </div>
        </div>
        <?php
    }
    
    /**
     * ROOT FIX: Ensure topics AJAX handlers are properly registered
     * Addresses core issue where topics components fail to populate
     */
    public function ensure_topics_ajax_handlers_registered() {
        // ROOT FIX: Force registration of topics AJAX handlers
        if (class_exists('GMKB_Topics_Ajax_Handler')) {
            $topics_handler = GMKB_Topics_Ajax_Handler::get_instance();
            
            // Verify handlers are registered
            $registered_actions = array(
                'wp_ajax_save_custom_topics',
                'wp_ajax_nopriv_save_custom_topics', 
                'wp_ajax_load_stored_topics',
                'wp_ajax_nopriv_load_stored_topics'
            );
            
            foreach ($registered_actions as $action) {
                if (!has_action($action)) {
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log("GMKB ROOT FIX: Re-registering missing AJAX action: {$action}");
                    }
                    
                    // Force re-registration
                    if (strpos($action, 'save') !== false) {
                        add_action($action, array($topics_handler, 'ajax_save_topics'));
                    } else {
                        add_action($action, array($topics_handler, 'ajax_load_topics'));
                    }
                }
            }
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB ROOT FIX: Topics AJAX handlers verification complete');
            }
        }
    }
    
    /**
     * ROOT FIX: Enhanced AJAX render component method
     * Improved server-side component rendering with topics data pre-loading
     */
    public function ajax_render_component_enhanced() {
        check_ajax_referer('gmkb_nonce', 'nonce');

        $component_type = isset($_POST['component']) ? sanitize_text_field($_POST['component']) : '';
        $props_json = isset($_POST['props']) ? stripslashes($_POST['props']) : '{}';
        $props = json_decode($props_json, true);

        if (empty($component_type)) {
            wp_send_json_error('Component type not provided.');
            return;
        }

        // ROOT FIX: Enhanced topics handling with single-step render
        if ($component_type === 'topics') {
            return $this->render_topics_component_enhanced($props);
        }

        // Handle other components with existing logic
        $this->ajax_render_component();
    }
    
    /**
     * ROOT FIX: Enhanced topics component rendering
     * Single-step render with pre-loaded data to eliminate loading states
     */
    private function render_topics_component_enhanced($props) {
        // CRITICAL FIX: Multiple data source ID detection strategies (same as main method)
        $data_source_id = 0;
        
        // Strategy 1: From props (various parameter names)
        $data_source_id = $props['post_id'] ?? $props['dataSourceId'] ?? $props['postId'] ?? $props['data_source_id'] ?? 0;
        
        // Strategy 2: From POST parameters if not in props
        if (!$data_source_id) {
            $data_source_id = intval($_POST['post_id'] ?? $_POST['media_kit_post_id'] ?? 0);
        }
        
        // Strategy 3: From URL parameters as fallback
        if (!$data_source_id) {
            $data_source_id = intval($_GET['post_id'] ?? $_GET['p'] ?? 0);
        }
        
        // Strategy 4: Auto-detect from current context
        if (!$data_source_id) {
            $data_source_id = $this->detect_mkcg_post_id();
        }
        
        if ($data_source_id <= 0) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('ROOT FIX: No valid post ID for topics data loading - tried all strategies');
                error_log('ROOT FIX: Props available: ' . print_r(array_keys($props), true));
            }
            wp_send_json_error('No valid post ID for topics data loading');
            return;
        }

        // ROOT FIX: Pre-load topics data using enhanced topics handler
        $loaded_topics = array();
        $topics_handler_path = GUESTIFY_PLUGIN_DIR . 'components/topics/ajax-handler.php';
        
        if (file_exists($topics_handler_path)) {
            require_once $topics_handler_path;
            if (class_exists('GMKB_Topics_Ajax_Handler')) {
                $topics_handler = GMKB_Topics_Ajax_Handler::get_instance();
                $loaded_topics = $topics_handler->load_topics_direct($data_source_id);
                
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("ROOT FIX: Enhanced method loaded " . count($loaded_topics) . " topics for post {$data_source_id}");
                }
            }
        }

        // ROOT FIX: Add loaded topics to props for single-step render
        $enhanced_props = array_merge($props, array(
            'loaded_topics' => $loaded_topics,
            'post_id' => $data_source_id,
            'component_id' => $props['component_id'] ?? uniqid('topics_'),
            'single_step_render' => true,
            'root_fix_active' => true,
            'topics_data_source' => 'enhanced_single_step_render'
        ));

        // ROOT FIX: Render template with enhanced props
        $template_path = GUESTIFY_PLUGIN_DIR . "components/topics/template.php";
        if (file_exists($template_path)) {
            ob_start();
            
            // Extract props as variables for template
            extract($enhanced_props, EXTR_SKIP);
            
            include $template_path;
            $html = ob_get_clean();
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("GMKB ROOT FIX: Enhanced topics component rendered with " . count($loaded_topics) . " pre-loaded topics");
            }
            
            wp_send_json_success(array(
                'html' => $html,
                'topics_count' => count($loaded_topics),
                'single_step_render' => true,
                'root_fix' => 'complete',
                'data_source_id' => $data_source_id
            ));
        } else {
            wp_send_json_error("Topics template file not found: {$template_path}");
        }
    }
    
    /**
     * Get component discovery instance
     */
    public function get_component_discovery() {
        return $this->component_discovery;
    }
    
    /**
     * Get component loader instance
     */
    public function get_component_loader() {
        return $this->component_loader;
    }
    
    /**
     * Detect post ID from URL parameters
     */
    private function detect_mkcg_post_id() {
        $post_id = 0;
        
        if (isset($_GET['post_id']) && is_numeric($_GET['post_id'])) {
            $post_id = intval($_GET['post_id']);
        }
        elseif (isset($_GET['p']) && is_numeric($_GET['p'])) {
            $post_id = intval($_GET['p']);
        }
        elseif (function_exists('get_the_ID') && get_the_ID()) {
            $post_id = get_the_ID();
        }
        
        // Validate post exists
        if ($post_id > 0) {
            $post = get_post($post_id);
            if (!$post || $post->post_status === 'trash') {
                return 0;
            }
        }
        
        return $post_id;
    }
}

// === GEMINI FIX: INSTANTIATE CLASS AT THE END ===
// Initialize the plugin after everything is set up
Guestify_Media_Kit_Builder::get_instance();

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('🚀 GMKB: Plugin loaded with constants defined BEFORE enqueue.php');
    error_log('✅ GUESTIFY_PLUGIN_URL: ' . GUESTIFY_PLUGIN_URL);
    error_log('✅ GUESTIFY_PLUGIN_DIR: ' . GUESTIFY_PLUGIN_DIR);
}
