<?php
/**
 * Plugin Name: Guestify Media Kit Builder
 * Description: Drag-and-drop media kit builder with customizable components
 * Version: 2.0.0
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
define( 'GUESTIFY_VERSION', '2.0.0' );
define( 'GUESTIFY_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'GUESTIFY_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'GUESTIFY_PLUGIN_FILE', __FILE__ );
define( 'GUESTIFY_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

/**
 * Main plugin class
 */
class Guestify_Media_Kit_Builder {

    /**
     * Instance of this class
     *
     * @var Guestify_Media_Kit_Builder
     */
    private static $instance;

    /**
     * Plugin initialization
     */
    public function __construct() {
        // Include required files
        $this->includes();

        // Initialize hooks
        $this->init_hooks();
    }

    /**
     * Get the singleton instance
     *
     * @return Guestify_Media_Kit_Builder
     */
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Include required files
     */
    private function includes() {
        // Include the enqueue file
        require_once GUESTIFY_PLUGIN_DIR . 'includes/enqueue.php';
        
        // Include other files as needed
        // require_once GUESTIFY_PLUGIN_DIR . 'includes/class-guestify-post-types.php';
        // require_once GUESTIFY_PLUGIN_DIR . 'includes/class-guestify-shortcodes.php';
        // require_once GUESTIFY_PLUGIN_DIR . 'includes/class-guestify-api.php';
        // require_once GUESTIFY_PLUGIN_DIR . 'includes/class-guestify-admin.php';
    }

    /**
     * Initialize hooks
     */
    private function init_hooks() {
        // Register activation and deactivation hooks
        register_activation_hook( __FILE__, array( $this, 'activate' ) );
        register_deactivation_hook( __FILE__, array( $this, 'deactivate' ) );
        
        // Add shortcode
        add_shortcode( 'guestify_media_kit', array( $this, 'media_kit_shortcode' ) );
        
        // Add action hooks
        add_action( 'init', array( $this, 'load_textdomain' ) );
    }

    /**
     * Plugin activation
     */
    public function activate() {
        // Activation logic
        // Create necessary database tables, add options, etc.
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }

    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Deactivation logic
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }

    /**
     * Load plugin textdomain
     */
    public function load_textdomain() {
        load_plugin_textdomain( 'guestify-media-kit-builder', false, dirname( GUESTIFY_PLUGIN_BASENAME ) . '/languages' );
    }

    /**
     * Media kit shortcode callback
     *
     * @param array $atts Shortcode attributes
     * @return string Shortcode output
     */
    public function media_kit_shortcode( $atts ) {
        // Parse shortcode attributes
        $atts = shortcode_atts( array(
            'id' => 0,
            'template' => 'default',
        ), $atts, 'guestify_media_kit' );
        
        // Start output buffering
        ob_start();
        
        // Include the template
        include GUESTIFY_PLUGIN_DIR . 'templates/builder-template.php';
        
        // Return the buffered content
        return ob_get_clean();
    }
}

// Initialize the plugin
function guestify_media_kit_builder() {
    return Guestify_Media_Kit_Builder::get_instance();
}
guestify_media_kit_builder();
