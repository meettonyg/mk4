<?php
/**
 * GMKB Free Tools Shortcode
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Provides shortcode for embedding AI tools on public pages (standalone mode).
 *
 * Usage: [gmkb_free_tool type="biography" title="Free Bio Generator"]
 *
 * Available types:
 * - biography: AI Biography Generator
 * - topics: AI Topics Generator
 * - questions: AI Questions Generator
 * - tagline: AI Tagline Generator
 * - guest-intro: AI Guest Intro Generator
 * - offers: AI Offers Generator
 *
 * @package GMKB
 * @subpackage Shortcodes
 * @version 1.0.0
 * @since 2.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Free_Tools_Shortcode {

    /**
     * Singleton instance
     * @var GMKB_Free_Tools_Shortcode
     */
    private static $instance = null;

    /**
     * Whether assets have been enqueued
     * @var bool
     */
    private $enqueued = false;

    /**
     * Valid tool types
     * @var array
     */
    private $valid_types = array(
        'biography',
        'topics',
        'questions',
        'tagline',
        'guest-intro',
        'offers'
    );

    /**
     * Get singleton instance
     *
     * @return GMKB_Free_Tools_Shortcode
     */
    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        add_shortcode('gmkb_free_tool', array($this, 'render'));

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB Free Tools Shortcode: Registered [gmkb_free_tool]');
        }
    }

    /**
     * Render the shortcode
     *
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render($atts) {
        $atts = shortcode_atts(array(
            'type' => 'biography',
            'title' => '',
            'description' => '',
            'class' => '',
            'theme' => 'light',  // light or dark
            'cta_text' => 'Get Unlimited Access',
            'cta_url' => '',
            'show_usage' => 'true'
        ), $atts, 'gmkb_free_tool');

        // Validate type
        if (!in_array($atts['type'], $this->valid_types)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Free Tools: Invalid type "' . $atts['type'] . '"');
            }
            return '<!-- GMKB: Invalid tool type "' . esc_attr($atts['type']) . '" -->';
        }

        // Enqueue assets (only once per page)
        $this->enqueue_assets();

        // Generate unique ID
        $unique_id = 'gmkb-free-tool-' . wp_generate_uuid4();

        // Build CSS classes
        $classes = array(
            'gmkb-free-tool-container',
            'gmkb-free-tool--' . esc_attr($atts['type']),
            'gmkb-free-tool--theme-' . esc_attr($atts['theme'])
        );

        if (!empty($atts['class'])) {
            $classes[] = esc_attr($atts['class']);
        }

        // Build data attributes for Vue initialization
        $data_attrs = array(
            'data-gmkb-tool' => esc_attr($atts['type']),
            'data-gmkb-title' => esc_attr($atts['title']),
            'data-gmkb-description' => esc_attr($atts['description']),
            'data-gmkb-theme' => esc_attr($atts['theme']),
            'data-gmkb-cta-text' => esc_attr($atts['cta_text']),
            'data-gmkb-cta-url' => esc_attr($atts['cta_url'] ?: home_url('/pricing/')),
            'data-gmkb-show-usage' => esc_attr($atts['show_usage'])
        );

        $data_attrs_string = '';
        foreach ($data_attrs as $key => $value) {
            $data_attrs_string .= ' ' . $key . '="' . $value . '"';
        }

        // Build HTML output
        $html = sprintf(
            '<div id="%s" class="%s"%s></div>',
            esc_attr($unique_id),
            esc_attr(implode(' ', $classes)),
            $data_attrs_string
        );

        // Add loading placeholder (replaced by Vue when mounted)
        $html .= '<noscript>';
        $html .= '<div class="gmkb-free-tool-noscript">';
        $html .= '<p>This tool requires JavaScript to run. Please enable JavaScript in your browser.</p>';
        $html .= '</div>';
        $html .= '</noscript>';

        return $html;
    }

    /**
     * Enqueue required assets
     */
    private function enqueue_assets() {
        if ($this->enqueued) {
            return;
        }

        // Check if the SEO tools bundle exists (built from Vue)
        $seo_tools_js = GMKB_PLUGIN_DIR . 'dist/seo-tools/seo-tools.iife.js';
        $seo_tools_css = GMKB_PLUGIN_DIR . 'dist/seo-tools/seo-tools.css';

        // Use full builder bundle as fallback until standalone bundle is built
        $use_standalone = file_exists($seo_tools_js);

        if ($use_standalone) {
            // Enqueue standalone SEO tools bundle (lightweight, ~50KB)
            wp_enqueue_style(
                'gmkb-seo-tools',
                GMKB_PLUGIN_URL . 'dist/seo-tools/seo-tools.css',
                array(),
                GMKB_VERSION
            );

            wp_enqueue_script(
                'gmkb-seo-tools',
                GMKB_PLUGIN_URL . 'dist/seo-tools/seo-tools.iife.js',
                array(),
                GMKB_VERSION,
                true
            );

            $script_handle = 'gmkb-seo-tools';

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Free Tools: Using standalone SEO tools bundle');
            }
        } else {
            // Fallback: Use placeholder inline script until Vue bundle is built
            // This provides basic functionality for testing
            wp_enqueue_style(
                'gmkb-free-tools-placeholder',
                false // No CSS file, just register
            );

            // Add inline placeholder styles
            wp_add_inline_style('gmkb-free-tools-placeholder', $this->get_placeholder_styles());

            wp_enqueue_script(
                'gmkb-free-tools-placeholder',
                false, // No JS file, just register
                array(),
                GMKB_VERSION,
                true
            );

            // Add inline placeholder script
            wp_add_inline_script('gmkb-free-tools-placeholder', $this->get_placeholder_script());

            $script_handle = 'gmkb-free-tools-placeholder';

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Free Tools: Using placeholder (Vue bundle not built yet)');
            }
        }

        // CRITICAL: Pass public nonce to JavaScript
        // This nonce is verified by the AI Controller for public requests
        wp_localize_script($script_handle, 'gmkbPublicData', array(
            'restUrl' => rest_url('gmkb/v2/'),
            'publicNonce' => wp_create_nonce('gmkb_public_ai'),
            'siteUrl' => home_url(),
            'signupUrl' => home_url('/pricing/'),
            'version' => GMKB_VERSION,
            'debug' => defined('WP_DEBUG') && WP_DEBUG
        ));

        // Also set as separate variable for backwards compatibility
        wp_add_inline_script(
            $script_handle,
            'window.gmkbPublicNonce = "' . wp_create_nonce('gmkb_public_ai') . '";',
            'before'
        );

        $this->enqueued = true;

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB Free Tools: Assets enqueued with public nonce');
        }
    }

    /**
     * Get placeholder styles for pre-Vue-build state
     *
     * @return string CSS styles
     */
    private function get_placeholder_styles() {
        return '
.gmkb-free-tool-container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 2rem;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.gmkb-free-tool--theme-dark {
    background: #1a1a2e;
    color: #eee;
}

.gmkb-free-tool-placeholder {
    text-align: center;
    padding: 3rem 1rem;
}

.gmkb-free-tool-placeholder h3 {
    margin: 0 0 1rem;
    font-size: 1.5rem;
}

.gmkb-free-tool-placeholder p {
    color: #666;
    margin: 0 0 1.5rem;
}

.gmkb-free-tool--theme-dark .gmkb-free-tool-placeholder p {
    color: #aaa;
}

.gmkb-free-tool-placeholder .gmkb-loading {
    display: inline-block;
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #6366f1;
    border-radius: 50%;
    animation: gmkb-spin 1s linear infinite;
}

@keyframes gmkb-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.gmkb-free-tool-noscript {
    text-align: center;
    padding: 2rem;
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 8px;
    color: #92400e;
}
';
    }

    /**
     * Get placeholder script for pre-Vue-build state
     *
     * @return string JavaScript code
     */
    private function get_placeholder_script() {
        return '
(function() {
    "use strict";

    // Tool display names
    var toolNames = {
        "biography": "Biography Generator",
        "topics": "Topics Generator",
        "questions": "Questions Generator",
        "tagline": "Tagline Generator",
        "guest-intro": "Guest Intro Generator",
        "offers": "Offers Generator"
    };

    // Initialize placeholders when DOM is ready
    document.addEventListener("DOMContentLoaded", function() {
        var containers = document.querySelectorAll("[data-gmkb-tool]");

        containers.forEach(function(container) {
            var type = container.getAttribute("data-gmkb-tool");
            var title = container.getAttribute("data-gmkb-title") || "AI " + (toolNames[type] || "Content Generator");

            // Create placeholder content
            var placeholder = document.createElement("div");
            placeholder.className = "gmkb-free-tool-placeholder";
            placeholder.innerHTML = "<div class=\"gmkb-loading\"></div>" +
                "<h3>" + title + "</h3>" +
                "<p>Loading AI tool...</p>" +
                "<p style=\"font-size: 0.875rem; color: #999;\">Vue component bundle will replace this placeholder when built.</p>";

            container.appendChild(placeholder);

            console.log("[GMKB] Free tool placeholder rendered for:", type);
            console.log("[GMKB] Public nonce available:", !!window.gmkbPublicNonce);
        });
    });
})();
';
    }

    /**
     * Get tool configuration for a specific type
     *
     * @param string $type Tool type
     * @return array Tool configuration
     */
    public static function get_tool_config($type) {
        $configs = array(
            'biography' => array(
                'title' => 'AI Biography Generator',
                'description' => 'Generate professional biographies in seconds.',
                'icon' => 'user',
                'fields' => array('name', 'authorityHook', 'tone', 'length', 'pov')
            ),
            'topics' => array(
                'title' => 'AI Topics Generator',
                'description' => 'Create compelling interview and speaking topics.',
                'icon' => 'list',
                'fields' => array('authorityHook', 'expertise')
            ),
            'questions' => array(
                'title' => 'AI Questions Generator',
                'description' => 'Generate 25 engaging interview questions.',
                'icon' => 'help-circle',
                'fields' => array('authorityHook', 'topics')
            ),
            'tagline' => array(
                'title' => 'AI Tagline Generator',
                'description' => 'Create memorable taglines for your brand.',
                'icon' => 'tag',
                'fields' => array('authorityHook', 'name', 'tone')
            ),
            'guest-intro' => array(
                'title' => 'AI Guest Intro Generator',
                'description' => 'Write compelling guest introductions.',
                'icon' => 'mic',
                'fields' => array('name', 'biography', 'credentials', 'tagline')
            ),
            'offers' => array(
                'title' => 'AI Offers Generator',
                'description' => 'Create service packages and offers.',
                'icon' => 'package',
                'fields' => array('authorityHook', 'services')
            )
        );

        return isset($configs[$type]) ? $configs[$type] : null;
    }
}

// Initialize the shortcode
GMKB_Free_Tools_Shortcode::instance();
