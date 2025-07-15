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
define( 'GUESTIFY_VERSION', '2.1.0-race-condition-fixed' );
define( 'GUESTIFY_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'GUESTIFY_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Define GMKB constants for compatibility
define( 'GMKB_VERSION', '2.1.0-race-condition-fixed' );
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
        $this->component_discovery->scan();
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
        
        // Register AJAX handlers
        add_action( 'wp_ajax_guestify_get_components', array( $this, 'ajax_get_components' ) );
        add_action( 'wp_ajax_nopriv_guestify_get_components', array( $this, 'ajax_get_components' ) );
        add_action( 'wp_ajax_guestify_render_component', array( $this, 'ajax_render_component' ) );
        add_action( 'wp_ajax_nopriv_guestify_render_component', array( $this, 'ajax_render_component' ) );
        add_action( 'wp_ajax_guestify_render_design_panel', array( $this, 'ajax_render_design_panel' ) );
        add_action( 'wp_ajax_nopriv_guestify_render_design_panel', array( $this, 'ajax_render_design_panel' ) );
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
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB: Simplified template takeover active');
            error_log('✅ GMKB: Post ID: ' . $post_id);
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
        return array(
            'success' => true,
            'components' => $this->component_discovery->getComponents(),
            'categories' => $this->component_discovery->getCategories()
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
     * AJAX handlers
     */
    public function ajax_get_components() {
        wp_send_json( $this->rest_get_components() );
    }
    
    public function ajax_render_component() {
        $component_slug = isset( $_POST['component'] ) ? sanitize_text_field( $_POST['component'] ) : '';
        $props = isset( $_POST['props'] ) ? json_decode( stripslashes( $_POST['props'] ), true ) : array();
        
        if ( empty( $component_slug ) ) {
            wp_send_json_error( 'Component slug is required' );
        }
        
        $html = $this->component_loader->loadComponent( $component_slug, $props );
        
        if ( $html === false ) {
            wp_send_json_error( 'Component not found' );
        }
        
        wp_send_json_success( array( 'html' => $html ) );
    }
    
    public function ajax_render_design_panel() {
        $component_slug = isset( $_POST['component'] ) ? sanitize_text_field( $_POST['component'] ) : '';
        
        if ( empty( $component_slug ) ) {
            wp_send_json_error( 'Component slug is required' );
        }
        
        $html = $this->component_loader->loadDesignPanel( $component_slug );
        
        if ( $html === false ) {
            wp_send_json_error( 'Design panel not found' );
        }
        
        wp_send_json_success( array( 'html' => $html ) );
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
