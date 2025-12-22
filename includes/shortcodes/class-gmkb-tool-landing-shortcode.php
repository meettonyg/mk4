<?php
/**
 * GMKB Tool Landing Page Shortcode
 *
 * Renders full landing pages for AI tools with SEO content,
 * live tool preview, features, FAQ, and related tools sections.
 *
 * Usage: [gmkb_tool_landing tool="topics-generator"]
 *
 * Attributes:
 * - tool: The tool slug (e.g., 'topics-generator', 'biography-generator')
 * - base_url: Base URL for related tool links (default: /tools/)
 *
 * @package GMKB
 * @subpackage Shortcodes
 * @version 1.0.0
 * @since 2.3.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Tool_Landing_Shortcode {

    /**
     * Singleton instance
     * @var GMKB_Tool_Landing_Shortcode
     */
    private static $instance = null;

    /**
     * Whether assets have been enqueued
     * @var bool
     */
    private $enqueued = false;

    /**
     * Current tool slug being rendered
     * @var string
     */
    private $current_tool = null;

    /**
     * Get singleton instance
     *
     * @return GMKB_Tool_Landing_Shortcode
     */
    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Private constructor
     */
    private function __construct() {
        add_shortcode('gmkb_tool_landing', array($this, 'render'));

        // Add SEO hooks
        add_action('wp_head', array($this, 'output_seo_tags'), 1);
        add_filter('document_title_parts', array($this, 'filter_document_title'));
        add_filter('pre_get_document_title', array($this, 'get_document_title'));
    }

    /**
     * Enqueue required assets
     */
    private function enqueue_assets() {
        if ($this->enqueued) {
            return;
        }

        // Get plugin version for cache busting
        $version = defined('GMKB_VERSION') ? GMKB_VERSION : '1.0.0';

        // Check if built assets exist
        $js_file = GMKB_PLUGIN_PATH . 'dist/seo-tools/seo-tools.js';
        $css_file = GMKB_PLUGIN_PATH . 'dist/seo-tools/seo-tools.css';

        if (file_exists($js_file)) {
            // Enqueue built Vue app
            wp_enqueue_script(
                'gmkb-seo-tools',
                GMKB_PLUGIN_URL . 'dist/seo-tools/seo-tools.js',
                array(),
                $version,
                true
            );

            // Enqueue CSS if it exists
            if (file_exists($css_file)) {
                wp_enqueue_style(
                    'gmkb-seo-tools',
                    GMKB_PLUGIN_URL . 'dist/seo-tools/seo-tools.css',
                    array(),
                    $version
                );
            }

            // Add public nonce for API calls
            wp_localize_script('gmkb-seo-tools', 'gmkbPublicData', array(
                'publicNonce' => wp_create_nonce('gmkb_public_generate'),
                'ajaxUrl' => admin_url('admin-ajax.php'),
            ));
        }

        $this->enqueued = true;
    }

    /**
     * Render the tool landing page
     *
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render($atts) {
        $atts = shortcode_atts(array(
            'tool' => '',
            'base_url' => '/tools/',
        ), $atts, 'gmkb_tool_landing');

        $tool_slug = sanitize_text_field($atts['tool']);
        $base_url = esc_url($atts['base_url']);

        if (empty($tool_slug)) {
            return '<!-- GMKB Tool Landing: No tool specified -->';
        }

        // Get tool metadata
        $metadata = gmkb_tool_metadata();
        $tool = $metadata->get_tool_by_slug($tool_slug);

        if (!$tool) {
            return '<!-- GMKB Tool Landing: Tool not found: ' . esc_html($tool_slug) . ' -->';
        }

        // Store current tool for SEO hooks
        $this->current_tool = $tool_slug;

        // Enqueue assets
        $this->enqueue_assets();

        // Build output
        $output = '';

        // Add JSON-LD structured data
        $output .= $metadata->get_json_ld($tool_slug);

        // Create Vue mount point for the landing page
        $output .= '<div id="gmkb-tool-landing-' . esc_attr($tool_slug) . '" class="gmkb-tool-landing-container">';
        $output .= '<div data-gmkb-landing="' . esc_attr($tool_slug) . '" data-base-url="' . esc_attr($base_url) . '"></div>';
        $output .= '</div>';

        // Add inline script to mount the landing page component
        $output .= $this->get_mount_script($tool_slug, $base_url);

        return $output;
    }

    /**
     * Get the JavaScript to mount the landing page Vue component
     *
     * @param string $tool_slug Tool slug
     * @param string $base_url Base URL for links
     * @return string Script tag
     */
    private function get_mount_script($tool_slug, $base_url) {
        $script = "
        <script>
        (function() {
            function mountLanding() {
                if (typeof window.GMKBSeoTools !== 'undefined' && typeof window.GMKBSeoTools.mountLanding === 'function') {
                    var container = document.querySelector('[data-gmkb-landing=\"" . esc_js($tool_slug) . "\"]');
                    if (container) {
                        window.GMKBSeoTools.mountLanding(container, {
                            slug: '" . esc_js($tool_slug) . "',
                            baseUrl: '" . esc_js($base_url) . "'
                        });
                    }
                } else {
                    // Fallback: initialize the tool component directly
                    var toolContainer = document.querySelector('[data-gmkb-landing=\"" . esc_js($tool_slug) . "\"]');
                    if (toolContainer) {
                        // Convert landing container to tool container for backward compatibility
                        toolContainer.setAttribute('data-gmkb-tool', '" . esc_js($this->slug_to_tool_type($tool_slug)) . "');
                    }
                }
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                    setTimeout(mountLanding, 100);
                });
            } else {
                setTimeout(mountLanding, 100);
            }
        })();
        </script>";

        return $script;
    }

    /**
     * Convert tool slug to tool type for data attribute
     *
     * @param string $slug Tool slug (e.g., 'topics-generator')
     * @return string Tool type (e.g., 'topics')
     */
    private function slug_to_tool_type($slug) {
        // Remove common suffixes
        $type = preg_replace('/-(generator|builder|writer|optimizer|repurposer|notes)$/', '', $slug);
        return $type;
    }

    /**
     * Output SEO meta tags in wp_head
     */
    public function output_seo_tags() {
        if (empty($this->current_tool)) {
            return;
        }

        $metadata = gmkb_tool_metadata();
        $metadata->output_seo_tags($this->current_tool);
    }

    /**
     * Filter document title parts
     *
     * @param array $title_parts Title parts
     * @return array Modified title parts
     */
    public function filter_document_title($title_parts) {
        if (empty($this->current_tool)) {
            return $title_parts;
        }

        $metadata = gmkb_tool_metadata();
        $seo = $metadata->get_seo_meta($this->current_tool);

        if ($seo && !empty($seo['title'])) {
            $title_parts['title'] = $seo['title'];
        }

        return $title_parts;
    }

    /**
     * Get document title for SEO
     *
     * @param string $title Current title
     * @return string Modified title
     */
    public function get_document_title($title) {
        if (empty($this->current_tool)) {
            return $title;
        }

        $metadata = gmkb_tool_metadata();
        $new_title = $metadata->get_document_title($this->current_tool);

        return $new_title ? $new_title : $title;
    }

    /**
     * Set the current tool being rendered (for SEO)
     *
     * @param string $tool_slug Tool slug
     */
    public function set_current_tool($tool_slug) {
        $this->current_tool = $tool_slug;
    }
}

/**
 * Initialize the shortcode
 */
function gmkb_init_tool_landing_shortcode() {
    GMKB_Tool_Landing_Shortcode::instance();
}
add_action('init', 'gmkb_init_tool_landing_shortcode');
