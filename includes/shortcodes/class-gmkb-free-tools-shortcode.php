<?php
/**
 * GMKB Free Tools Shortcode
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Provides shortcode for embedding AI tools on public pages (standalone mode).
 *
 * Generic Usage: [gmkb_free_tool type="biography" title="Free Bio Generator"]
 *
 * Individual Shortcodes (25 tools):
 *
 * MESSAGE BUILDER:
 * - [gmkb_biography] - AI Biography Generator
 * - [gmkb_topics] - AI Topics Generator
 * - [gmkb_questions] - AI Questions Generator
 * - [gmkb_tagline] - AI Tagline Generator
 * - [gmkb_guest_intro] - AI Guest Intro Generator
 * - [gmkb_offers] - AI Offers Generator
 *
 * VALUE BUILDER:
 * - [gmkb_elevator_pitch] - Elevator Pitch Generator
 * - [gmkb_sound_bite] - Sound Bite Generator
 * - [gmkb_authority_hook] - Authority Hook Builder
 * - [gmkb_impact_intro] - Impact Intro Builder
 * - [gmkb_persona] - Ideal Client Persona Generator
 *
 * STRATEGY:
 * - [gmkb_brand_story] - Brand Story Generator
 * - [gmkb_signature_story] - Signature Story Generator
 * - [gmkb_credibility_story] - Credibility Story Generator
 * - [gmkb_framework] - Framework Builder
 * - [gmkb_interview_prep] - Interview Prep Generator
 *
 * CONTENT:
 * - [gmkb_blog] - Blog Post Generator
 * - [gmkb_content_repurpose] - Content Repurposer
 * - [gmkb_press_release] - Press Release Generator
 *
 * SOCIAL/EMAIL:
 * - [gmkb_social_post] - Social Post Generator
 * - [gmkb_email] - Email Writer
 * - [gmkb_newsletter] - Newsletter Writer
 * - [gmkb_youtube_description] - YouTube Description Generator
 * - [gmkb_podcast_notes] - Podcast Show Notes Generator
 * - [gmkb_seo_optimizer] - SEO Content Optimizer
 *
 * All shortcodes accept these attributes:
 * - title: Custom widget title
 * - description: Custom widget description
 * - class: Additional CSS classes
 * - theme: 'light' or 'dark' (default: light)
 * - cta_text: Call-to-action button text
 * - cta_url: Call-to-action URL
 * - show_usage: Show usage counter (true/false)
 *
 * @package GMKB
 * @subpackage Shortcodes
 * @version 2.0.0
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
        // Message Builder
        'biography',
        'topics',
        'questions',
        'tagline',
        'guest-intro',
        'offers',
        // Value Builder
        'elevator-pitch',
        'sound-bite',
        'authority-hook',
        'impact-intro',
        'persona',
        // Strategy
        'brand-story',
        'signature-story',
        'credibility-story',
        'framework',
        'interview-prep',
        // Content
        'blog',
        'content-repurpose',
        'press-release',
        // Social/Email
        'social-post',
        'email',
        'newsletter',
        'youtube-description',
        'podcast-notes',
        'seo-optimizer'
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
        // Register the generic shortcode
        add_shortcode('gmkb_free_tool', array($this, 'render'));

        // Register individual shortcodes for each tool type
        // Message Builder
        add_shortcode('gmkb_biography', array($this, 'render_biography'));
        add_shortcode('gmkb_topics', array($this, 'render_topics'));
        add_shortcode('gmkb_questions', array($this, 'render_questions'));
        add_shortcode('gmkb_tagline', array($this, 'render_tagline'));
        add_shortcode('gmkb_guest_intro', array($this, 'render_guest_intro'));
        add_shortcode('gmkb_offers', array($this, 'render_offers'));

        // Value Builder
        add_shortcode('gmkb_elevator_pitch', array($this, 'render_elevator_pitch'));
        add_shortcode('gmkb_sound_bite', array($this, 'render_sound_bite'));
        add_shortcode('gmkb_authority_hook', array($this, 'render_authority_hook'));
        add_shortcode('gmkb_impact_intro', array($this, 'render_impact_intro'));
        add_shortcode('gmkb_persona', array($this, 'render_persona'));

        // Strategy
        add_shortcode('gmkb_brand_story', array($this, 'render_brand_story'));
        add_shortcode('gmkb_signature_story', array($this, 'render_signature_story'));
        add_shortcode('gmkb_credibility_story', array($this, 'render_credibility_story'));
        add_shortcode('gmkb_framework', array($this, 'render_framework'));
        add_shortcode('gmkb_interview_prep', array($this, 'render_interview_prep'));

        // Content
        add_shortcode('gmkb_blog', array($this, 'render_blog'));
        add_shortcode('gmkb_content_repurpose', array($this, 'render_content_repurpose'));
        add_shortcode('gmkb_press_release', array($this, 'render_press_release'));

        // Social/Email
        add_shortcode('gmkb_social_post', array($this, 'render_social_post'));
        add_shortcode('gmkb_email', array($this, 'render_email'));
        add_shortcode('gmkb_newsletter', array($this, 'render_newsletter'));
        add_shortcode('gmkb_youtube_description', array($this, 'render_youtube_description'));
        add_shortcode('gmkb_podcast_notes', array($this, 'render_podcast_notes'));
        add_shortcode('gmkb_seo_optimizer', array($this, 'render_seo_optimizer'));

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB Free Tools Shortcode: Registered 25 shortcodes');
        }
    }

    /**
     * Render biography shortcode
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_biography($atts) {
        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = 'biography';
        return $this->render($atts);
    }

    /**
     * Render topics shortcode
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_topics($atts) {
        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = 'topics';
        return $this->render($atts);
    }

    /**
     * Render questions shortcode
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_questions($atts) {
        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = 'questions';
        return $this->render($atts);
    }

    /**
     * Render tagline shortcode
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_tagline($atts) {
        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = 'tagline';
        return $this->render($atts);
    }

    /**
     * Render guest intro shortcode
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_guest_intro($atts) {
        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = 'guest-intro';
        return $this->render($atts);
    }

    /**
     * Render offers shortcode
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_offers($atts) {
        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = 'offers';
        return $this->render($atts);
    }

    /**
     * Render authority hook shortcode
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_authority_hook($atts) {
        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = 'authority-hook';
        return $this->render($atts);
    }

    // ========== VALUE BUILDER ==========

    /**
     * Render elevator pitch shortcode
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_elevator_pitch($atts) {
        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = 'elevator-pitch';
        return $this->render($atts);
    }

    /**
     * Render sound bite shortcode
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_sound_bite($atts) {
        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = 'sound-bite';
        return $this->render($atts);
    }

    /**
     * Render impact intro shortcode
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_impact_intro($atts) {
        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = 'impact-intro';
        return $this->render($atts);
    }

    /**
     * Render persona shortcode
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_persona($atts) {
        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = 'persona';
        return $this->render($atts);
    }

    // ========== STRATEGY ==========

    /**
     * Render brand story shortcode
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_brand_story($atts) {
        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = 'brand-story';
        return $this->render($atts);
    }

    /**
     * Render signature story shortcode
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_signature_story($atts) {
        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = 'signature-story';
        return $this->render($atts);
    }

    /**
     * Render credibility story shortcode
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_credibility_story($atts) {
        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = 'credibility-story';
        return $this->render($atts);
    }

    /**
     * Render framework shortcode
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_framework($atts) {
        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = 'framework';
        return $this->render($atts);
    }

    /**
     * Render interview prep shortcode
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_interview_prep($atts) {
        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = 'interview-prep';
        return $this->render($atts);
    }

    // ========== CONTENT ==========

    /**
     * Render blog shortcode
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_blog($atts) {
        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = 'blog';
        return $this->render($atts);
    }

    /**
     * Render content repurpose shortcode
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_content_repurpose($atts) {
        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = 'content-repurpose';
        return $this->render($atts);
    }

    /**
     * Render press release shortcode
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_press_release($atts) {
        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = 'press-release';
        return $this->render($atts);
    }

    // ========== SOCIAL/EMAIL ==========

    /**
     * Render social post shortcode
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_social_post($atts) {
        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = 'social-post';
        return $this->render($atts);
    }

    /**
     * Render email shortcode
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_email($atts) {
        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = 'email';
        return $this->render($atts);
    }

    /**
     * Render newsletter shortcode
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_newsletter($atts) {
        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = 'newsletter';
        return $this->render($atts);
    }

    /**
     * Render youtube description shortcode
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_youtube_description($atts) {
        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = 'youtube-description';
        return $this->render($atts);
    }

    /**
     * Render podcast notes shortcode
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_podcast_notes($atts) {
        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = 'podcast-notes';
        return $this->render($atts);
    }

    /**
     * Render seo optimizer shortcode
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_seo_optimizer($atts) {
        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = 'seo-optimizer';
        return $this->render($atts);
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
            'data-nonce' => wp_create_nonce('gmkb_public_ai'), // Required for API authorization
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
        // Message Builder
        "biography": "Biography Generator",
        "topics": "Topics Generator",
        "questions": "Questions Generator",
        "tagline": "Tagline Generator",
        "guest-intro": "Guest Intro Generator",
        "offers": "Offers Generator",
        // Value Builder
        "elevator-pitch": "Elevator Pitch Generator",
        "sound-bite": "Sound Bite Generator",
        "authority-hook": "Authority Hook Builder",
        "impact-intro": "Impact Intro Builder",
        "persona": "Persona Generator",
        // Strategy
        "brand-story": "Brand Story Generator",
        "signature-story": "Signature Story Generator",
        "credibility-story": "Credibility Story Generator",
        "framework": "Framework Builder",
        "interview-prep": "Interview Prep Generator",
        // Content
        "blog": "Blog Post Generator",
        "content-repurpose": "Content Repurposer",
        "press-release": "Press Release Generator",
        // Social/Email
        "social-post": "Social Post Generator",
        "email": "Email Writer",
        "newsletter": "Newsletter Writer",
        "youtube-description": "YouTube Description Generator",
        "podcast-notes": "Podcast Notes Generator",
        "seo-optimizer": "SEO Optimizer"
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
            ),
            'authority-hook' => array(
                'title' => 'AI Authority Hook Builder',
                'description' => 'Create your unique authority positioning statement.',
                'icon' => 'zap',
                'fields' => array('name', 'expertise', 'audience', 'outcome')
            )
        );

        return isset($configs[$type]) ? $configs[$type] : null;
    }
}

// Initialize the shortcode
GMKB_Free_Tools_Shortcode::instance();
