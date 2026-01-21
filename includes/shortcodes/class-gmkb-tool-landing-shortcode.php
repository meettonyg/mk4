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
 * - show_tool: Whether to show the interactive tool (default: true)
 * - show_faq: Whether to show FAQ section (default: true)
 *
 * @package GMKB
 * @subpackage Shortcodes
 * @version 2.0.0
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
     * Tool Discovery service
     * @var GMKB_Tool_Discovery
     */
    private $tool_discovery = null;

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
     * Current tool metadata
     * @var array
     */
    private $current_metadata = null;

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

        // Load tool discovery
        $this->load_tool_discovery();
    }

    /**
     * Load Tool Discovery service
     */
    private function load_tool_discovery() {
        $discovery_path = GMKB_PLUGIN_DIR . 'includes/services/class-gmkb-tool-discovery.php';

        if (file_exists($discovery_path)) {
            require_once $discovery_path;
            $this->tool_discovery = GMKB_Tool_Discovery::instance();
        }
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

        // Use unified gmkb bundle
        $js_file = GMKB_PLUGIN_DIR . 'dist/gmkb.iife.js';
        $css_file = GMKB_PLUGIN_DIR . 'dist/gmkb.css';

        if (file_exists($js_file)) {
            wp_enqueue_script(
                'gmkb-tools',
                GMKB_PLUGIN_URL . 'dist/gmkb.iife.js',
                array(),
                $version,
                true
            );

            if (file_exists($css_file)) {
                wp_enqueue_style(
                    'gmkb-tools',
                    GMKB_PLUGIN_URL . 'dist/gmkb.css',
                    array(),
                    $version
                );
            }

            // Add public nonce and API data
            wp_localize_script('gmkb-tools', 'gmkbToolLanding', array(
                'nonce' => wp_create_nonce('gmkb_public_ai'),
                'apiBase' => rest_url('gmkb/v2'),
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
            'show_tool' => 'true',
            'show_faq' => 'true',
            'show_features' => 'true',
            'show_related' => 'true',
        ), $atts, 'gmkb_tool_landing');

        $tool_slug = sanitize_text_field($atts['tool']);
        $base_url = esc_url($atts['base_url']);

        if (empty($tool_slug)) {
            return $this->render_admin_error('No tool specified. Usage: [gmkb_tool_landing tool="topics-generator"]');
        }

        if (!$this->tool_discovery) {
            return $this->render_admin_error('Tool Discovery service not available.');
        }

        // Get tool config from /tools/{slug}/tool.json
        $tool = $this->tool_discovery->get_tool($tool_slug);

        if (!$tool) {
            return $this->render_admin_error('Tool not found: ' . esc_html($tool_slug));
        }

        // Get tool metadata from /tools/{slug}/meta.json
        $metadata = $this->tool_discovery->get_tool_metadata($tool_slug);

        if (!$metadata) {
            return $this->render_admin_error('Tool metadata not found: ' . esc_html($tool_slug));
        }

        // Store for SEO hooks
        $this->current_tool = $tool_slug;
        $this->current_metadata = $metadata;

        // Enqueue assets
        $this->enqueue_assets();

        // Build landing page data
        $landing_data = array(
            'tool' => $tool,
            'metadata' => $metadata,
            'config' => array(
                'baseUrl' => $base_url,
                'showTool' => filter_var($atts['show_tool'], FILTER_VALIDATE_BOOLEAN),
                'showFaq' => filter_var($atts['show_faq'], FILTER_VALIDATE_BOOLEAN),
                'showFeatures' => filter_var($atts['show_features'], FILTER_VALIDATE_BOOLEAN),
                'showRelated' => filter_var($atts['show_related'], FILTER_VALIDATE_BOOLEAN),
            ),
            'nonce' => wp_create_nonce('gmkb_public_ai'),
            'apiBase' => rest_url('gmkb/v2'),
        );

        // Get related tools
        if (!empty($metadata['landingContent']['relatedToolSlugs'])) {
            $related = array();
            foreach ($metadata['landingContent']['relatedToolSlugs'] as $related_slug) {
                $related_meta = $this->tool_discovery->get_tool_metadata($related_slug);
                if ($related_meta) {
                    $related[] = array(
                        'slug' => $related_slug,
                        'name' => $related_meta['name'] ?? $related_slug,
                        'shortDescription' => $related_meta['shortDescription'] ?? '',
                        'icon' => $related_meta['icon'] ?? 'SparklesIcon',
                    );
                }
            }
            $landing_data['relatedTools'] = $related;
        }

        // Build output
        $output = '';

        // Add JSON-LD structured data
        $output .= $this->get_json_ld($tool_slug, $metadata);

        // Container with data attribute
        $container_id = 'gmkb-tool-landing-' . esc_attr($tool_slug);
        $output .= '<div id="' . $container_id . '" class="gmkb-tool-landing-container">';
        $output .= '<div class="gmkb-tool-landing" data-tool="' . esc_attr($tool_slug) . '">';

        // Server-side rendered content for SEO (Vue will hydrate/replace)
        $output .= $this->render_static_content($metadata, $atts);

        $output .= '</div>';
        $output .= '</div>';

        // Add data and mount script
        $output .= '<script type="application/json" id="' . $container_id . '-data">';
        $output .= wp_json_encode($landing_data);
        $output .= '</script>';

        $output .= $this->get_mount_script($container_id, $tool_slug);

        return $output;
    }

    /**
     * Render static HTML content for SEO (before Vue hydration)
     *
     * @param array $metadata Tool metadata
     * @param array $atts Shortcode attributes
     * @return string HTML
     */
    private function render_static_content($metadata, $atts) {
        $landing = $metadata['landingContent'] ?? array();
        $html = '';

        // Hero Section
        $html .= '<section class="gmkb-landing-hero">';
        $html .= '<h1 class="gmkb-landing-hero__title">' . esc_html($landing['heroTagline'] ?? $metadata['name'] ?? '') . '</h1>';
        if (!empty($landing['heroSubtitle'])) {
            $html .= '<p class="gmkb-landing-hero__subtitle">' . esc_html($landing['heroSubtitle']) . '</p>';
        }
        $html .= '</section>';

        // Features Section
        if (filter_var($atts['show_features'], FILTER_VALIDATE_BOOLEAN) && !empty($landing['features'])) {
            $html .= '<section class="gmkb-landing-features">';
            $html .= '<h2>Features</h2>';
            $html .= '<div class="gmkb-landing-features__grid">';
            foreach ($landing['features'] as $feature) {
                $html .= '<div class="gmkb-landing-feature">';
                $html .= '<h3>' . esc_html($feature['title'] ?? '') . '</h3>';
                $html .= '<p>' . esc_html($feature['description'] ?? '') . '</p>';
                $html .= '</div>';
            }
            $html .= '</div>';
            $html .= '</section>';
        }

        // How It Works Section
        if (!empty($landing['howItWorks'])) {
            $html .= '<section class="gmkb-landing-how-it-works">';
            $html .= '<h2>How It Works</h2>';
            $html .= '<ol class="gmkb-landing-steps">';
            foreach ($landing['howItWorks'] as $step) {
                $html .= '<li class="gmkb-landing-step">';
                $html .= '<strong>' . esc_html($step['title'] ?? '') . '</strong>';
                $html .= '<p>' . esc_html($step['description'] ?? '') . '</p>';
                $html .= '</li>';
            }
            $html .= '</ol>';
            $html .= '</section>';
        }

        // Tool Section (placeholder for Vue)
        if (filter_var($atts['show_tool'], FILTER_VALIDATE_BOOLEAN)) {
            $html .= '<section class="gmkb-landing-tool">';
            $html .= '<h2>Try ' . esc_html($metadata['name'] ?? 'This Tool') . '</h2>';
            $html .= '<div class="gmkb-landing-tool__container" data-tool-mount="true">';
            $html .= '<div class="gmkb-landing-tool__loading">Loading tool...</div>';
            $html .= '</div>';
            $html .= '</section>';
        }

        // FAQ Section
        if (filter_var($atts['show_faq'], FILTER_VALIDATE_BOOLEAN) && !empty($landing['faq'])) {
            $html .= '<section class="gmkb-landing-faq">';
            $html .= '<h2>Frequently Asked Questions</h2>';
            $html .= '<div class="gmkb-landing-faq__list">';
            foreach ($landing['faq'] as $item) {
                $html .= '<details class="gmkb-landing-faq__item">';
                $html .= '<summary>' . esc_html($item['question'] ?? '') . '</summary>';
                $html .= '<p>' . esc_html($item['answer'] ?? '') . '</p>';
                $html .= '</details>';
            }
            $html .= '</div>';
            $html .= '</section>';
        }

        return $html;
    }

    /**
     * Get JSON-LD structured data
     *
     * @param string $tool_slug Tool slug
     * @param array $metadata Tool metadata
     * @return string Script tag with JSON-LD
     */
    private function get_json_ld($tool_slug, $metadata) {
        $seo = $metadata['seoMeta'] ?? array();

        $schema = array(
            '@context' => 'https://schema.org',
            '@type' => 'WebApplication',
            'name' => $metadata['name'] ?? $tool_slug,
            'description' => $seo['description'] ?? $metadata['shortDescription'] ?? '',
            'url' => home_url('/tools/' . $tool_slug . '/'),
            'applicationCategory' => 'BusinessApplication',
            'operatingSystem' => 'Web Browser',
            'offers' => array(
                '@type' => 'Offer',
                'price' => '0',
                'priceCurrency' => 'USD',
            ),
        );

        // Add FAQ schema if present
        if (!empty($metadata['landingContent']['faq'])) {
            $faq_schema = array(
                '@context' => 'https://schema.org',
                '@type' => 'FAQPage',
                'mainEntity' => array(),
            );

            foreach ($metadata['landingContent']['faq'] as $item) {
                $faq_schema['mainEntity'][] = array(
                    '@type' => 'Question',
                    'name' => $item['question'] ?? '',
                    'acceptedAnswer' => array(
                        '@type' => 'Answer',
                        'text' => $item['answer'] ?? '',
                    ),
                );
            }

            return '<script type="application/ld+json">' . wp_json_encode($schema) . '</script>' . "\n" .
                   '<script type="application/ld+json">' . wp_json_encode($faq_schema) . '</script>' . "\n";
        }

        return '<script type="application/ld+json">' . wp_json_encode($schema) . '</script>' . "\n";
    }

    /**
     * Get the JavaScript to mount the landing page Vue component
     *
     * @param string $container_id Container ID
     * @param string $tool_slug Tool slug
     * @return string Script tag
     */
    private function get_mount_script($container_id, $tool_slug) {
        return "
        <script>
        (function() {
            function mountToolLanding() {
                var container = document.getElementById('" . esc_js($container_id) . "');
                var dataEl = document.getElementById('" . esc_js($container_id) . "-data');

                if (!container || !dataEl) return;

                var data = JSON.parse(dataEl.textContent);

                // Set nonce in global variable for API requests
                if (data.nonce) {
                    window.gmkbToolLanding = window.gmkbToolLanding || {};
                    window.gmkbToolLanding.nonce = data.nonce;
                    window.gmkbToolLanding.apiBase = data.apiBase;
                }

                if (window.GMKB && window.GMKB.mountToolLanding) {
                    window.GMKB.mountToolLanding(container, data);
                } else if (window.GMKBSeoTools && window.GMKBSeoTools.mountLanding) {
                    window.GMKBSeoTools.mountLanding(container.querySelector('.gmkb-tool-landing'), {
                        slug: '" . esc_js($tool_slug) . "',
                        baseUrl: data.config.baseUrl
                    });
                }
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', mountToolLanding);
            } else {
                mountToolLanding();
            }
        })();
        </script>";
    }

    /**
     * Output SEO meta tags in wp_head
     */
    public function output_seo_tags() {
        if (empty($this->current_tool) || empty($this->current_metadata)) {
            return;
        }

        $seo = $this->current_metadata['seoMeta'] ?? array();

        if (!empty($seo['description'])) {
            echo '<meta name="description" content="' . esc_attr($seo['description']) . '">' . "\n";
        }

        if (!empty($seo['keywords']) && is_array($seo['keywords'])) {
            echo '<meta name="keywords" content="' . esc_attr(implode(', ', $seo['keywords'])) . '">' . "\n";
        }

        // Open Graph
        if (!empty($seo['title'])) {
            echo '<meta property="og:title" content="' . esc_attr($seo['title']) . '">' . "\n";
        }
        if (!empty($seo['description'])) {
            echo '<meta property="og:description" content="' . esc_attr($seo['description']) . '">' . "\n";
        }
        echo '<meta property="og:type" content="website">' . "\n";
        if (!empty($seo['canonicalPath'])) {
            echo '<meta property="og:url" content="' . esc_attr(home_url($seo['canonicalPath'])) . '">' . "\n";
        }

        // Twitter Card
        echo '<meta name="twitter:card" content="summary">' . "\n";
        if (!empty($seo['title'])) {
            echo '<meta name="twitter:title" content="' . esc_attr($seo['title']) . '">' . "\n";
        }
        if (!empty($seo['description'])) {
            echo '<meta name="twitter:description" content="' . esc_attr($seo['description']) . '">' . "\n";
        }

        // Canonical URL
        if (!empty($seo['canonicalPath'])) {
            echo '<link rel="canonical" href="' . esc_attr(home_url($seo['canonicalPath'])) . '">' . "\n";
        }
    }

    /**
     * Filter document title parts
     *
     * @param array $title_parts Title parts
     * @return array Modified title parts
     */
    public function filter_document_title($title_parts) {
        if (empty($this->current_metadata)) {
            return $title_parts;
        }

        $seo = $this->current_metadata['seoMeta'] ?? array();

        if (!empty($seo['title'])) {
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
        if (empty($this->current_metadata)) {
            return $title;
        }

        $seo = $this->current_metadata['seoMeta'] ?? array();

        return !empty($seo['title']) ? $seo['title'] : $title;
    }

    /**
     * Render admin-only error message
     *
     * @param string $message Error message
     * @return string HTML or empty string
     */
    private function render_admin_error($message) {
        if (current_user_can('manage_options')) {
            return '<div class="gmkb-tool-landing-error" style="padding: 20px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; color: #856404; margin: 20px 0;">
                <strong>Tool Landing Error:</strong> ' . esc_html($message) . '
            </div>';
        }
        return '<!-- GMKB Tool Landing: ' . esc_html($message) . ' -->';
    }
}

/**
 * Initialize the shortcode
 */
function gmkb_init_tool_landing_shortcode() {
    GMKB_Tool_Landing_Shortcode::instance();
}
add_action('init', 'gmkb_init_tool_landing_shortcode');
