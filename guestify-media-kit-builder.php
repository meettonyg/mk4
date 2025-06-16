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

// Define plugin constants
define( 'GUESTIFY_VERSION', '2.1.0' );
define( 'GUESTIFY_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'GUESTIFY_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Main plugin class
 */
// Require component system files
require_once GUESTIFY_PLUGIN_DIR . 'system/ComponentDiscovery.php';
require_once GUESTIFY_PLUGIN_DIR . 'system/ComponentLoader.php';
require_once GUESTIFY_PLUGIN_DIR . 'system/DesignPanel.php';

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
        require_once GUESTIFY_PLUGIN_DIR . 'includes/enqueue.php';
        
        // Initialize component system
        $this->component_discovery = new ComponentDiscovery(GUESTIFY_PLUGIN_DIR . 'components');
        $this->component_discovery->scan();
        $this->component_loader = new ComponentLoader(GUESTIFY_PLUGIN_DIR . 'components', $this->component_discovery);
        $this->design_panel = new DesignPanel(GUESTIFY_PLUGIN_DIR . 'components');
        
        $this->init_hooks();
    }

    private function init_hooks() {
        add_action( 'init', array( $this, 'load_textdomain' ) );
        add_action( 'template_redirect', array( $this, 'isolated_builder_template_takeover' ) );
        add_shortcode( 'guestify_media_kit', array( $this, 'media_kit_shortcode' ) );
        
        // Register REST API endpoints
        add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
        
        // Register AJAX handlers for backwards compatibility
        add_action( 'wp_ajax_guestify_get_components', array( $this, 'ajax_get_components' ) );
        add_action( 'wp_ajax_nopriv_guestify_get_components', array( $this, 'ajax_get_components' ) );
        add_action( 'wp_ajax_guestify_render_component', array( $this, 'ajax_render_component' ) );
        add_action( 'wp_ajax_nopriv_guestify_render_component', array( $this, 'ajax_render_component' ) );
        add_action( 'wp_ajax_guestify_render_design_panel', array( $this, 'ajax_render_design_panel' ) );
        add_action( 'wp_ajax_nopriv_guestify_render_design_panel', array( $this, 'ajax_render_design_panel' ) );
    }

    /**
     * If the current page is the media kit builder, this function hijacks the
     * template rendering to output a clean, isolated HTML document.
     */
    public function isolated_builder_template_takeover() {
        // Change 'media-kit-builder' to the actual slug of your page
        if ( ! is_page('guestify-media-kit') ) {
            return;
        }

        // Set up the necessary script and style handles
        guestify_media_kit_builder_enqueue_scripts();

        ?>
        <!DOCTYPE html>
        <html <?php language_attributes(); ?>>
        <head>
            <meta charset="<?php bloginfo( 'charset' ); ?>" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title><?php wp_title(); ?></title>
            <style>
                body, html { margin: 0; padding: 0; overflow: hidden; height: 100vh; width: 100vw; background: #1a1a1a; }
            </style>
            <?php
            // Manually print the registered styles and scripts for a clean head
            wp_print_styles('guestify-media-kit-builder-styles');
            ?>
        </head>
        <body class="media-kit-builder-isolated">
            <?php
            // Render the builder content via the shortcode
            echo do_shortcode('[guestify_media_kit]');

            // Manually print the registered footer scripts
            wp_print_scripts(['sortable-js', 'guestify-builder-script']);
            ?>
        </body>
        </html>
        <?php
        // Stop WordPress from loading the theme's template
        exit();
    }

    public function media_kit_shortcode( $atts ) {
        ob_start();
        include GUESTIFY_PLUGIN_DIR . 'templates/builder-template.php';
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
        
        register_rest_route( 'guestify/v1', '/render-design-panel', array(
            'methods' => 'POST',
            'callback' => array( $this, 'rest_render_design_panel' ),
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
     * REST API: Render design panel for a component
     */
    public function rest_render_design_panel( $request ) {
        $params = $request->get_json_params();
        $component_slug = isset( $params['component'] ) ? sanitize_text_field( $params['component'] ) : '';
        
        // For now, return a generic design panel
        // In future, this could load component-specific design panels
        return array(
            'success' => true,
            'html' => '<div class="design-panel-content">Design settings for ' . esc_html( $component_slug ) . '</div>'
        );
    }
    
    /**
     * AJAX: Get all components
     */
    public function ajax_get_components() {
        wp_send_json( $this->rest_get_components() );
    }
    
    /**
     * AJAX: Render a component
     */
    public function ajax_render_component() {
        $component_slug = isset( $_POST['component'] ) ? sanitize_text_field( $_POST['component'] ) : '';
        $props = isset( $_POST['props'] ) ? $_POST['props'] : array();
        
        if ( empty( $component_slug ) ) {
            wp_send_json_error( 'Component slug is required' );
        }
        
        $html = $this->component_loader->loadComponent( $component_slug, $props );
        
        if ( $html === false ) {
            wp_send_json_error( 'Component not found' );
        }
        
        wp_send_json_success( array( 'html' => $html ) );
    }
    
    /**
     * AJAX: Render design panel
     */
    public function ajax_render_design_panel() {
        $component_slug = isset( $_POST['component'] ) ? sanitize_text_field( $_POST['component'] ) : '';
        
        wp_send_json_success( array(
            'html' => '<div class="design-panel-content">Design settings for ' . esc_html( $component_slug ) . '</div>'
        ) );
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
}

// Initialize the plugin
Guestify_Media_Kit_Builder::get_instance();
