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

// Component system files
require_once GUESTIFY_PLUGIN_DIR . 'system/ComponentDiscovery.php';
require_once GUESTIFY_PLUGIN_DIR . 'system/ComponentLoader.php';
require_once GUESTIFY_PLUGIN_DIR . 'system/DesignPanel.php';

// ROOT FIX: Load AJAX handlers for component functionality
require_once GUESTIFY_PLUGIN_DIR . 'components/topics/ajax-handler.php';
require_once GUESTIFY_PLUGIN_DIR . 'includes/enhanced-ajax.php';
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
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB: ComponentDiscovery initialized with dir: ' . GUESTIFY_PLUGIN_DIR . 'components');
        }
        
        $this->component_discovery->scan();
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            $debug_info = $this->component_discovery->getDebugInfo();
            error_log('✅ GMKB: ComponentDiscovery scan complete. Found ' . $debug_info['components_count'] . ' components');
            error_log('📋 GMKB: Available components: ' . implode(', ', $debug_info['component_names']));
        }
        $this->component_loader = new ComponentLoader(GUESTIFY_PLUGIN_DIR . 'components', $this->component_discovery);
        $this->design_panel = new DesignPanel(GUESTIFY_PLUGIN_DIR . 'components');
        
        // WordPress hooks only
        $this->init_hooks();
        
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
        add_action( 'wp_ajax_guestify_render_design_panel', array( $this, 'ajax_render_design_panel' ) );
        add_action( 'wp_ajax_nopriv_guestify_render_design_panel', array( $this, 'ajax_render_design_panel' ) );
        
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
                'nonce'         => wp_create_nonce( 'guestify_media_kit_builder' ), // ROOT FIX: Match AJAX handler expectation
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
        
        $html = $this->component_loader->loadComponent( $component_slug, $props );
        
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
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'guestify_media_kit_builder')) {
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
    
    public function ajax_render_component() {
        // Verify nonce for security
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'guestify_media_kit_builder')) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB: ajax_render_component - Nonce verification failed');
            }
            wp_send_json_error('Security verification failed');
            return;
        }
        
        $component_slug = isset( $_POST['component'] ) ? sanitize_text_field( $_POST['component'] ) : '';
        $props = isset( $_POST['props'] ) ? json_decode( stripslashes( $_POST['props'] ), true ) : array();
        
        if ( empty( $component_slug ) ) {
            wp_send_json_error( 'Component slug is required' );
            return;
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB: ajax_render_component - Rendering component: ' . $component_slug);
        }
        
        $html = $this->component_loader->loadComponent( $component_slug, $props );
        
        if ( $html === false ) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB: ajax_render_component - Component not found: ' . $component_slug);
            }
            wp_send_json_error( 'Component not found' );
            return;
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB: ajax_render_component - Successfully rendered: ' . $component_slug);
        }
        
        wp_send_json_success( array( 'html' => $html ) );
    }
    
    public function ajax_render_design_panel() {
        // Verify nonce for security
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'guestify_media_kit_builder')) {
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
     * FIXED: Save media kit state to database with enhanced error handling
     */
    public function ajax_save_media_kit() {
        // Enhanced error logging for debugging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('🔄 GMKB: ajax_save_media_kit called');
            error_log('📊 POST data: ' . print_r($_POST, true));
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
        
        // Verify nonce for security
        if (!wp_verify_nonce($nonce, 'guestify_media_kit_builder')) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB: Nonce verification failed');
                error_log('  Provided nonce: ' . $nonce);
                error_log('  Expected action: guestify_media_kit_builder');
            }
            wp_send_json_error('Invalid nonce');
            return;
        }
        
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        $state_data = isset($_POST['state']) ? $_POST['state'] : '';
        
        if (!$post_id) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB: No post ID provided');
            }
            wp_send_json_error('Post ID is required');
            return;
        }
        
        if (empty($state_data)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB: No state data provided');
            }
            wp_send_json_error('State data is required');
            return;
        }
        
        // Decode and validate JSON
        $state = json_decode(stripslashes($state_data), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB: JSON decode error: ' . json_last_error_msg());
            }
            wp_send_json_error('Invalid JSON data: ' . json_last_error_msg());
            return;
        }
        
        // Validate post exists
        $post = get_post($post_id);
        if (!$post) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB: Post not found: ' . $post_id);
            }
            wp_send_json_error('Post not found');
            return;
        }
        
        // Save to post meta
        $success = update_post_meta($post_id, 'gmkb_media_kit_state', $state);
        
        if ($success !== false) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('✅ GMKB: Media kit saved successfully for post ' . $post_id);
                error_log('📊 Components saved: ' . count($state['components'] ?? []));
            }
            wp_send_json_success(array(
                'message' => 'Media kit saved successfully',
                'timestamp' => time(),
                'post_id' => $post_id,
                'components_count' => count($state['components'] ?? [])
            ));
        } else {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB: Failed to save media kit to post ' . $post_id);
            }
            wp_send_json_error('Failed to save media kit');
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
