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
class Guestify_Media_Kit_Builder {

    private static $instance;

    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        require_once GUESTIFY_PLUGIN_DIR . 'includes/enqueue.php';
        $this->init_hooks();
    }

    private function init_hooks() {
        add_action( 'init', array( $this, 'load_textdomain' ) );
        add_action( 'template_redirect', array( $this, 'isolated_builder_template_takeover' ) );
        add_shortcode( 'guestify_media_kit', array( $this, 'media_kit_shortcode' ) );
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
}

// Initialize the plugin
Guestify_Media_Kit_Builder::get_instance();
