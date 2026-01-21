<?php
/**
 * GMKB Tool Shortcode
 *
 * Embeds individual AI tools on any WordPress page.
 *
 * Generic usage: [gmkb_tool tool="topics-generator"]
 *
 * Convenience aliases (25 tools):
 *
 * MESSAGE BUILDER:
 * - [gmkb_biography] - Biography Generator
 * - [gmkb_topics] - Topics Generator
 * - [gmkb_questions] - Questions Generator
 * - [gmkb_tagline] - Tagline Generator
 * - [gmkb_guest_intro] - Guest Intro Generator
 * - [gmkb_offers] - Offers Generator
 *
 * VALUE BUILDER:
 * - [gmkb_elevator_pitch] - Elevator Pitch Generator
 * - [gmkb_sound_bite] - Sound Bite Generator
 * - [gmkb_authority_hook] - Authority Hook Builder
 * - [gmkb_impact_intro] - Impact Intro Builder
 * - [gmkb_persona] - Persona Generator
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
 * - [gmkb_repurpose] - Content Repurposer
 * - [gmkb_press_release] - Press Release Generator
 *
 * SOCIAL/EMAIL:
 * - [gmkb_social] - Social Post Generator
 * - [gmkb_email] - Email Writer
 * - [gmkb_newsletter] - Newsletter Writer
 * - [gmkb_youtube] - YouTube Description Generator
 * - [gmkb_podcast_notes] - Podcast Show Notes Generator
 * - [gmkb_seo] - SEO Content Optimizer
 *
 * Attributes:
 * - tool: The tool slug (required for generic shortcode)
 * - mode: 'standalone' (default) or 'compact'
 * - title: Custom title (optional)
 * - show_title: Whether to show title (default: true)
 *
 * @package GMKB
 * @subpackage Shortcodes
 * @version 1.0.0
 * @since 2.3.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Tool_Shortcode {

    /**
     * Singleton instance
     * @var GMKB_Tool_Shortcode
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
     * Tool shortcode aliases
     * @var array
     */
    private $aliases = array(
        'gmkb_topics' => 'topics-generator',
        'gmkb_biography' => 'biography-generator',
        'gmkb_questions' => 'questions-generator',
        'gmkb_tagline' => 'tagline-generator',
        'gmkb_authority_hook' => 'authority-hook-builder',
        'gmkb_elevator_pitch' => 'elevator-pitch-generator',
        'gmkb_sound_bite' => 'sound-bite-generator',
        'gmkb_offers' => 'offers-generator',
        'gmkb_guest_intro' => 'guest-intro-generator',
        'gmkb_impact_intro' => 'impact-intro-builder',
        'gmkb_persona' => 'persona-generator',
        'gmkb_brand_story' => 'brand-story-generator',
        'gmkb_signature_story' => 'signature-story-generator',
        'gmkb_credibility_story' => 'credibility-story-generator',
        'gmkb_framework' => 'framework-builder',
        'gmkb_interview_prep' => 'interview-prep-generator',
        'gmkb_blog' => 'blog-generator',
        'gmkb_repurpose' => 'content-repurposer',
        'gmkb_press_release' => 'press-release-generator',
        'gmkb_seo' => 'seo-optimizer',
        'gmkb_social' => 'social-post-generator',
        'gmkb_email' => 'email-writer',
        'gmkb_newsletter' => 'newsletter-writer',
        'gmkb_youtube' => 'youtube-description-generator',
        'gmkb_podcast_notes' => 'podcast-notes-generator',
    );

    /**
     * Get singleton instance
     *
     * @return GMKB_Tool_Shortcode
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
        // Register generic shortcode
        add_shortcode('gmkb_tool', array($this, 'render'));

        // Register convenience aliases
        foreach ($this->aliases as $shortcode => $tool_slug) {
            add_shortcode($shortcode, array($this, 'render_alias'));
        }

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

            // Add global data for Vue
            $is_logged_in = is_user_logged_in();
            $standalone_data = array(
                'nonce' => wp_create_nonce('gmkb_public_ai'),
                'apiBase' => rest_url('gmkb/v2'),
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'isLoggedIn' => $is_logged_in,
                'signupUrl' => home_url('/pricing/'),
            );

            // For logged-in users, add profile context
            if ($is_logged_in) {
                $standalone_data['restNonce'] = wp_create_nonce('wp_rest');
                $standalone_data['userId'] = get_current_user_id();
                $standalone_data['profilesEndpoint'] = rest_url('gmkb/v2/profiles');
                $standalone_data['profileEndpoint'] = rest_url('gmkb/v2/profile');
            }

            wp_localize_script('gmkb-tools', 'gmkbStandaloneTools', $standalone_data);
        }

        $this->enqueued = true;
    }

    /**
     * Render alias shortcode
     *
     * @param array $atts Shortcode attributes
     * @param string $content Shortcode content
     * @param string $tag Shortcode tag
     * @return string HTML output
     */
    public function render_alias($atts, $content = '', $tag = '') {
        // Get tool slug from alias
        $tool_slug = $this->aliases[$tag] ?? '';

        if (empty($tool_slug)) {
            return $this->render_admin_error("Unknown shortcode alias: {$tag}");
        }

        // Merge with provided attributes
        $atts = shortcode_atts(array(
            'mode' => 'standalone',
            'title' => '',
            'show_title' => 'true',
        ), $atts, $tag);

        $atts['tool'] = $tool_slug;

        return $this->render($atts);
    }

    /**
     * Render the tool shortcode
     *
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render($atts) {
        $atts = shortcode_atts(array(
            'tool' => '',
            'mode' => 'standalone',
            'title' => '',
            'show_title' => 'true',
            'class' => '',
        ), $atts, 'gmkb_tool');

        $tool_slug = sanitize_text_field($atts['tool']);

        if (empty($tool_slug)) {
            return $this->render_admin_error('No tool specified. Usage: [gmkb_tool tool="topics-generator"]');
        }

        if (!$this->tool_discovery) {
            return $this->render_admin_error('Tool Discovery service not available.');
        }

        // Get tool config
        $tool = $this->tool_discovery->get_tool($tool_slug);

        if (!$tool) {
            return $this->render_admin_error("Tool not found: {$tool_slug}");
        }

        // Get tool metadata
        $metadata = $this->tool_discovery->get_tool_metadata($tool_slug);
        $tool_name = $metadata['name'] ?? $tool['name'] ?? $tool_slug;
        $custom_title = !empty($atts['title']) ? sanitize_text_field($atts['title']) : $tool_name;

        // Enqueue assets
        $this->enqueue_assets();

        // Generate unique container ID
        $container_id = 'gmkb-tool-' . $tool_slug . '-' . uniqid();

        // Build tool data
        $tool_data = array(
            'tool' => $tool_slug,
            'toolConfig' => $tool,
            'metadata' => $metadata,
            'mode' => sanitize_text_field($atts['mode']),
            'showTitle' => filter_var($atts['show_title'], FILTER_VALIDATE_BOOLEAN),
            'title' => $custom_title,
            'nonce' => wp_create_nonce('gmkb_public_ai'),
            'apiBase' => rest_url('gmkb/v2'),
        );

        // Build CSS classes
        $classes = array(
            'gmkb-tool-container',
            'gmkb-tool--' . $tool_slug,
            'gmkb-tool--' . sanitize_text_field($atts['mode']),
        );
        if (!empty($atts['class'])) {
            $classes[] = sanitize_html_class($atts['class']);
        }

        ob_start();
        ?>
        <div id="<?php echo esc_attr($container_id); ?>" class="<?php echo esc_attr(implode(' ', $classes)); ?>">
            <?php if (filter_var($atts['show_title'], FILTER_VALIDATE_BOOLEAN)): ?>
                <h3 class="gmkb-tool-title"><?php echo esc_html($custom_title); ?></h3>
            <?php endif; ?>

            <div class="gmkb-tool-mount" data-tool="<?php echo esc_attr($tool_slug); ?>">
                <div class="gmkb-tool-loading">
                    <div class="gmkb-loading-spinner"></div>
                    <p>Loading <?php echo esc_html($tool_name); ?>...</p>
                </div>
            </div>
        </div>

        <script type="application/json" id="<?php echo esc_attr($container_id); ?>-data">
            <?php echo wp_json_encode($tool_data); ?>
        </script>

        <script>
        (function() {
            function mountTool() {
                var container = document.getElementById('<?php echo esc_js($container_id); ?>');
                var dataEl = document.getElementById('<?php echo esc_js($container_id); ?>-data');
                var mountPoint = container ? container.querySelector('.gmkb-tool-mount') : null;

                if (!container || !dataEl || !mountPoint) return;

                var data = JSON.parse(dataEl.textContent);

                // Set nonce in global variable for API requests
                if (data.nonce) {
                    window.gmkbStandaloneTools = window.gmkbStandaloneTools || {};
                    window.gmkbStandaloneTools.nonce = data.nonce;
                    if (data.apiBase) {
                        window.gmkbStandaloneTools.apiBase = data.apiBase;
                    }
                }

                // Try different mount methods based on available globals
                if (window.GMKB && window.GMKB.mountTool) {
                    window.GMKB.mountTool(mountPoint, data);
                } else if (window.GMKBStandaloneTools && window.GMKBStandaloneTools.mount) {
                    window.GMKBStandaloneTools.mount(mountPoint, data.tool, data);
                } else if (window.GMKBSeoTools && window.GMKBSeoTools.initializeTool) {
                    // Set tool type via data attribute for initializeTool
                    mountPoint.setAttribute('data-tool', data.tool);
                    window.GMKBSeoTools.initializeTool(mountPoint, data.tool);
                } else {
                    // Fallback: set data attribute for later mounting
                    mountPoint.setAttribute('data-tool-config', JSON.stringify(data));
                }
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                    setTimeout(mountTool, 100);
                });
            } else {
                setTimeout(mountTool, 100);
            }
        })();
        </script>

        <style>
        .gmkb-tool-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            color: #64748b;
        }
        .gmkb-loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e2e8f0;
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: gmkb-spin 0.8s linear infinite;
            margin-bottom: 16px;
        }
        @keyframes gmkb-spin {
            to { transform: rotate(360deg); }
        }
        .gmkb-tool-title {
            margin: 0 0 20px 0;
            font-size: 1.5rem;
            font-weight: 600;
            color: #1e293b;
        }
        .gmkb-tool-container {
            max-width: 800px;
            margin: 0 auto;
        }
        </style>
        <?php

        return ob_get_clean();
    }

    /**
     * Render admin-only error message
     *
     * @param string $message Error message
     * @return string HTML or empty string
     */
    private function render_admin_error($message) {
        if (current_user_can('manage_options')) {
            return '<div class="gmkb-tool-error" style="padding: 20px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; color: #856404; margin: 20px 0;">
                <strong>Tool Shortcode Error:</strong> ' . esc_html($message) . '
            </div>';
        }
        return '<!-- GMKB Tool: ' . esc_html($message) . ' -->';
    }

    /**
     * Get available tool aliases
     *
     * @return array
     */
    public function get_aliases() {
        return $this->aliases;
    }
}

/**
 * Initialize the shortcode
 */
function gmkb_init_tool_shortcode() {
    GMKB_Tool_Shortcode::instance();
}
add_action('init', 'gmkb_init_tool_shortcode');
