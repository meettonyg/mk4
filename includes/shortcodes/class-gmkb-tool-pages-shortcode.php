<?php
/**
 * GMKB Tool Pages Shortcode
 *
 * Provides shortcodes for the tool directory and individual tool pages
 * using the new two-panel GeneratorLayout design.
 *
 * Shortcodes:
 * - [gmkb_tool_directory] - Displays grid of all available AI tools
 * - [gmkb_tool_page slug="biography"] - Displays a specific tool with two-panel layout
 * - [gmkb_tool_page] - Auto-detects tool from URL (e.g., /tools/biography/)
 *
 * @package GMKB
 * @subpackage Shortcodes
 * @version 1.0.0
 * @since 2.3.0
 */

if (!defined('ABSPATH')) {
    exit;
}

// Debug: Log when this file is loaded
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('GMKB Tool Pages Shortcode FILE LOADED at ' . current_action());
}

class GMKB_Tool_Pages_Shortcode {

    /**
     * Singleton instance
     * @var GMKB_Tool_Pages_Shortcode
     */
    private static $instance = null;

    /**
     * Whether assets have been enqueued
     * @var bool
     */
    private $enqueued = false;

    /**
     * Valid tool slugs (matches /tools/ directory structure)
     * @var array
     */
    private $valid_slugs = array(
        // Message Builder
        'biography',
        'topics',
        'questions',
        'tagline',
        'guest-intro',
        'authority-hook',
        'offers',
        // Value Builder
        'elevator-pitch',
        'sound-bite',
        'persona',
        'impact-intro',
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
     * @return GMKB_Tool_Pages_Shortcode
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
        // Register shortcodes
        add_shortcode('gmkb_tool_directory', array($this, 'render_directory'));
        add_shortcode('gmkb_tool_page', array($this, 'render_tool_page'));

        // Add rewrite rules for clean URLs
        add_action('init', array($this, 'add_rewrite_rules'));
        add_filter('query_vars', array($this, 'add_query_vars'));

        // VIRTUAL PAGE HANDLING:
        // The key issue is WordPress runs its query, finds no page, sets 404,
        // then redirect_canonical redirects to home. We must prevent this.

        // 1. template_redirect priority 0 - BEFORE redirect_canonical fires
        // This sets is_404 = false and removes the canonical redirect
        add_action('template_redirect', array($this, 'prevent_canonical_redirect'), 0);

        // 2. Prevent canonical redirect filter (backup)
        add_filter('redirect_canonical', array($this, 'prevent_tools_redirect'), 10, 2);

        // 3. template_redirect priority 1 - render the virtual page
        add_action('template_redirect', array($this, 'handle_virtual_pages_template'), 1);

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB Tool Pages Shortcode: Registered directory and tool page shortcodes');
        }
    }

    /**
     * Check if current request is a /tools/ or /app/tools/ URL
     *
     * @return array|false Array with 'type', 'slug', and 'base_path' keys, or false if not a tools URL
     */
    private function is_tools_url() {
        $uri = trim($_SERVER['REQUEST_URI'], '/');
        $uri = strtok($uri, '?');
        $uri = trim($uri, '/');

        // Support both /tools/ and /app/tools/ paths
        $tools_paths = apply_filters('gmkb_tools_page_slugs', array('tools', 'app/tools'));

        foreach ($tools_paths as $tools_slug) {
            // Check for /tools/{slug}/use/ (2-panel tool page)
            if (preg_match('#^' . preg_quote($tools_slug, '#') . '/([^/\?]+)/use/?$#', $uri, $matches)) {
                $tool_slug = $matches[1];
                if (in_array($tool_slug, $this->valid_slugs)) {
                    return array('type' => 'use', 'slug' => $tool_slug, 'base_path' => '/' . $tools_slug . '/');
                }
                continue;
            }

            // Check for /tools/{slug}/ (landing page)
            if (preg_match('#^' . preg_quote($tools_slug, '#') . '/([^/\?]+)/?$#', $uri, $matches)) {
                $tool_slug = $matches[1];
                if (in_array($tool_slug, $this->valid_slugs)) {
                    return array('type' => 'landing', 'slug' => $tool_slug, 'base_path' => '/' . $tools_slug . '/');
                }
                continue;
            }

            // Check for /tools/ (directory)
            if (preg_match('#^' . preg_quote($tools_slug, '#') . '/?$#', $uri)) {
                return array('type' => 'directory', 'slug' => null, 'base_path' => '/' . $tools_slug . '/');
            }
        }

        return false;
    }

    /**
     * Prevent WordPress canonical redirect for virtual pages
     * This runs at template_redirect priority 0, BEFORE redirect_canonical
     *
     * WordPress runs its main query, finds no page, sets 404 status,
     * then redirect_canonical redirects to home. We must prevent this.
     */
    public function prevent_canonical_redirect() {
        global $wp_query;

        $tools_info = $this->is_tools_url();

        if ($tools_info) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Virtual Pages: Preventing canonical redirect for /tools/ URL');
                error_log('GMKB Virtual Pages: Type = ' . $tools_info['type'] . ', Slug = ' . ($tools_info['slug'] ?: 'directory'));
            }

            // Tell WordPress this is NOT a 404
            $wp_query->is_404 = false;
            $wp_query->is_home = false;
            $wp_query->is_page = true;

            // Set HTTP 200 status
            status_header(200);

            // Remove the canonical redirect action
            remove_action('template_redirect', 'redirect_canonical');
        }
    }

    /**
     * Prevent WordPress canonical redirect for /tools/ URLs (filter backup)
     *
     * @param string $redirect_url The redirect URL
     * @param string $requested_url The requested URL
     * @return string|false The redirect URL or false to cancel redirect
     */
    public function prevent_tools_redirect($redirect_url, $requested_url) {
        if ($this->is_tools_url()) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Virtual Pages: Blocking redirect via filter');
            }
            return false;
        }
        return $redirect_url;
    }

    /**
     * Handle virtual tool pages at template_redirect (priority 1)
     * This renders the virtual page after we've prevented the canonical redirect
     */
    public function handle_virtual_pages_template() {
        $tools_info = $this->is_tools_url();

        if (!$tools_info) {
            return;
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB Virtual Pages: Rendering virtual page');
            error_log('GMKB Virtual Pages: Type = ' . $tools_info['type'] . ', Slug = ' . ($tools_info['slug'] ?: 'directory'));
        }

        $this->enqueue_assets();
        $this->render_virtual_page($tools_info['slug'], $tools_info['type']);
        exit;
    }

    /**
     * Render a virtual tool page
     *
     * @param string|null $tool_slug Tool slug or null for directory
     * @param string $mode 'directory', 'landing', or 'use'
     */
    private function render_virtual_page($tool_slug = null, $mode = 'directory') {
        if ($mode === 'directory') {
            $page_title = 'AI Content Tools';
        } elseif ($mode === 'landing') {
            $page_title = $this->get_tool_name($tool_slug);
        } else {
            $page_title = $this->get_tool_name($tool_slug) . ' - Use Tool';
        }
        $site_name = get_bloginfo('name');

        ?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php echo esc_html($page_title . ' - ' . $site_name); ?></title>
    <?php wp_head(); ?>
</head>
<body <?php body_class('gmkb-virtual-page gmkb-tools-page'); ?>>
    <?php
    // Try to include theme header if it exists
    if (function_exists('get_header')) {
        get_header();
    }
    ?>

    <main class="gmkb-tools-main">
        <?php
        if ($mode === 'directory') {
            echo $this->render_directory(array());
        } else {
            echo $this->render_tool_page(array('slug' => $tool_slug, 'mode' => $mode));
        }
        ?>
    </main>

    <?php
    // Try to include theme footer if it exists
    if (function_exists('get_footer')) {
        get_footer();
    }

    wp_footer();
    ?>
</body>
</html>
        <?php
    }

    /**
     * Add rewrite rules for /tools/{slug}/ URLs
     */
    public function add_rewrite_rules() {
        // Get the tools page ID (you may need to configure this)
        $tools_page_slug = apply_filters('gmkb_tools_page_slug', 'tools');

        // Add rewrite rule: /tools/{tool-slug}/ -> tools page with tool_slug query var
        add_rewrite_rule(
            '^' . $tools_page_slug . '/([^/]+)/?$',
            'index.php?pagename=' . $tools_page_slug . '&gmkb_tool_slug=$matches[1]',
            'top'
        );
    }

    /**
     * Add custom query vars
     */
    public function add_query_vars($vars) {
        $vars[] = 'gmkb_tool_slug';
        return $vars;
    }

    /**
     * Render the tool directory shortcode
     *
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_directory($atts) {
        // Auto-detect base_url from current URL if not provided
        $default_base_url = $this->detect_base_url();

        $atts = shortcode_atts(array(
            'class' => '',
            'base_url' => $default_base_url,
            'theme' => 'light'
        ), $atts, 'gmkb_tool_directory');

        $this->enqueue_assets();

        $unique_id = 'gmkb-tool-directory-' . wp_generate_uuid4();

        $classes = array(
            'gmkb-tool-directory-container',
            'gmkb-tool-page--theme-' . esc_attr($atts['theme'])
        );

        if (!empty($atts['class'])) {
            $classes[] = esc_attr($atts['class']);
        }

        $html = sprintf(
            '<div id="%s" class="%s" data-gmkb-page-type="directory" data-gmkb-base-url="%s"></div>',
            esc_attr($unique_id),
            esc_attr(implode(' ', $classes)),
            esc_attr($atts['base_url'])
        );

        // Noscript fallback
        $html .= $this->get_noscript_fallback('Tool Directory');

        return $html;
    }

    /**
     * Render an individual tool page
     *
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_tool_page($atts) {
        // Auto-detect directory_url from current URL if not provided
        $default_base_url = $this->detect_base_url();

        $atts = shortcode_atts(array(
            'slug' => '',
            'class' => '',
            'theme' => 'light',
            'directory_url' => $default_base_url,
            'mode' => '' // 'landing' or 'use' - if empty, auto-detect from URL
        ), $atts, 'gmkb_tool_page');

        // Auto-detect slug from URL if not provided
        $slug = $atts['slug'];
        if (empty($slug)) {
            $slug = $this->detect_slug_from_url();
        }

        // Validate slug
        if (!empty($slug) && !in_array($slug, $this->valid_slugs)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Tool Pages: Invalid tool slug "' . $slug . '"');
            }
            // Show directory instead of error
            return $this->render_directory(array(
                'class' => $atts['class'],
                'base_url' => $atts['directory_url']
            ));
        }

        $this->enqueue_assets();

        $unique_id = 'gmkb-tool-page-' . wp_generate_uuid4();

        $classes = array(
            'gmkb-tool-page-container',
            'gmkb-tool-page--theme-' . esc_attr($atts['theme'])
        );

        if (!empty($slug)) {
            $classes[] = 'gmkb-tool-page--' . esc_attr($slug);
        }

        if (!empty($atts['class'])) {
            $classes[] = esc_attr($atts['class']);
        }

        // If no slug, render directory
        $page_type = empty($slug) ? 'directory' : 'tool';

        // Determine mode: 'use' (2-panel tool) or 'landing' (marketing page)
        // Use mode from atts if provided, otherwise detect from URL
        if (!empty($atts['mode'])) {
            $mode = $atts['mode'];
        } else {
            // Check if URL ends with /use/
            $uri = trim($_SERVER['REQUEST_URI'], '/');
            $mode = preg_match('#/use/?$#', $uri) ? 'use' : 'landing';
        }

        $html = sprintf(
            '<div id="%s" class="%s" data-gmkb-page-type="%s" data-gmkb-tool-slug="%s" data-gmkb-directory-url="%s" data-gmkb-mode="%s"></div>',
            esc_attr($unique_id),
            esc_attr(implode(' ', $classes)),
            esc_attr($page_type),
            esc_attr($slug),
            esc_attr($atts['directory_url']),
            esc_attr($mode)
        );

        // Noscript fallback
        $tool_name = $this->get_tool_name($slug);
        $html .= $this->get_noscript_fallback($tool_name ?: 'AI Tool');

        return $html;
    }

    /**
     * Detect the base URL for tools from current URL
     *
     * @return string Base URL (e.g., '/tools/' or '/app/tools/')
     */
    private function detect_base_url() {
        $path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');

        // Check for /app/tools/ pattern first (more specific)
        if (strpos($path, 'app/tools') === 0) {
            return '/app/tools/';
        }

        // Check for /tools/ pattern
        if (strpos($path, 'tools') === 0) {
            return '/tools/';
        }

        // Default to /tools/
        return '/tools/';
    }

    /**
     * Detect tool slug from URL
     *
     * @return string Tool slug or empty string
     */
    private function detect_slug_from_url() {
        // First check query var (from rewrite rules)
        $slug = get_query_var('gmkb_tool_slug', '');
        if (!empty($slug)) {
            return sanitize_text_field($slug);
        }

        // Fallback: parse URL path
        $path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
        $parts = explode('/', $path);

        // Find "tools" in path and get next segment
        // Support both /tools/{slug} and /app/tools/{slug}
        $tools_index = array_search('tools', $parts);
        if ($tools_index !== false && isset($parts[$tools_index + 1])) {
            $potential_slug = $parts[$tools_index + 1];
            // Skip if it's 'use' (that's the mode, not the slug)
            if ($potential_slug !== 'use') {
                return sanitize_text_field($potential_slug);
            }
        }

        return '';
    }

    /**
     * Get human-readable tool name
     *
     * @param string $slug Tool slug
     * @return string Tool name
     */
    private function get_tool_name($slug) {
        $names = array(
            'biography' => 'Biography Generator',
            'topics' => 'Topics Generator',
            'questions' => 'Questions Generator',
            'tagline' => 'Tagline Generator',
            'guest-intro' => 'Guest Intro Generator',
            'authority-hook' => 'Authority Hook Builder',
            'offers' => 'Offers Generator',
            'elevator-pitch' => 'Elevator Pitch Generator',
            'sound-bite' => 'Sound Bite Generator',
            'persona' => 'Persona Generator',
            'impact-intro' => 'Impact Intro Builder',
            'brand-story' => 'Brand Story Generator',
            'signature-story' => 'Signature Story Generator',
            'credibility-story' => 'Credibility Story Generator',
            'framework' => 'Framework Generator',
            'interview-prep' => 'Interview Prep Generator',
            'blog' => 'Blog Post Generator',
            'content-repurpose' => 'Content Repurposer',
            'press-release' => 'Press Release Generator',
            'social-post' => 'Social Post Generator',
            'email' => 'Email Writer',
            'newsletter' => 'Newsletter Generator',
            'youtube-description' => 'YouTube Description Generator',
            'podcast-notes' => 'Podcast Notes Generator',
            'seo-optimizer' => 'SEO Optimizer'
        );

        return isset($names[$slug]) ? $names[$slug] : '';
    }

    /**
     * Enqueue required assets
     */
    private function enqueue_assets() {
        if ($this->enqueued) {
            return;
        }

        // Check if the SEO tools bundle exists
        $seo_tools_js = GMKB_PLUGIN_DIR . 'dist/seo-tools/seo-tools.iife.js';
        $seo_tools_css = GMKB_PLUGIN_DIR . 'dist/seo-tools/seo-tools.css';

        $use_standalone = file_exists($seo_tools_js);

        if ($use_standalone) {
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
        } else {
            // Fallback: Use placeholder styles
            wp_enqueue_style(
                'gmkb-tool-pages-placeholder',
                false
            );
            wp_add_inline_style('gmkb-tool-pages-placeholder', $this->get_placeholder_styles());

            wp_enqueue_script(
                'gmkb-tool-pages-placeholder',
                false,
                array(),
                GMKB_VERSION,
                true
            );
            wp_add_inline_script('gmkb-tool-pages-placeholder', $this->get_placeholder_script());

            $script_handle = 'gmkb-tool-pages-placeholder';
        }

        // Pass data to JavaScript
        wp_localize_script($script_handle, 'gmkbToolPageData', array(
            'restUrl' => rest_url('gmkb/v2/'),
            'publicNonce' => wp_create_nonce('gmkb_public_ai'),
            'siteUrl' => home_url(),
            'toolsBaseUrl' => home_url('/tools/'),
            'version' => GMKB_VERSION,
            'debug' => defined('WP_DEBUG') && WP_DEBUG
        ));

        $this->enqueued = true;

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB Tool Pages: Assets enqueued');
        }
    }

    /**
     * Get noscript fallback HTML
     *
     * @param string $title Page title
     * @return string HTML
     */
    private function get_noscript_fallback($title) {
        return sprintf(
            '<noscript>
                <div class="gmkb-tool-page-noscript">
                    <h2>%s</h2>
                    <p>This tool requires JavaScript to run. Please enable JavaScript in your browser.</p>
                </div>
            </noscript>',
            esc_html($title)
        );
    }

    /**
     * Get placeholder styles
     *
     * @return string CSS
     */
    private function get_placeholder_styles() {
        return '
.gmkb-tool-directory-container,
.gmkb-tool-page-container {
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.gmkb-tool-page-loading {
    text-align: center;
}

.gmkb-tool-page-loading .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e5e7eb;
    border-top-color: #1a9bdc;
    border-radius: 50%;
    animation: gmkb-tool-spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes gmkb-tool-spin {
    to { transform: rotate(360deg); }
}

.gmkb-tool-page-noscript {
    text-align: center;
    padding: 2rem;
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 8px;
    color: #92400e;
    max-width: 500px;
    margin: 2rem auto;
}
';
    }

    /**
     * Get placeholder script
     *
     * @return string JavaScript
     */
    private function get_placeholder_script() {
        return '
(function() {
    "use strict";

    document.addEventListener("DOMContentLoaded", function() {
        // Handle tool directory containers
        var directories = document.querySelectorAll("[data-gmkb-page-type=\"directory\"]");
        directories.forEach(function(container) {
            container.innerHTML = "<div class=\"gmkb-tool-page-loading\">" +
                "<div class=\"spinner\"></div>" +
                "<p>Loading tool directory...</p>" +
                "</div>";
        });

        // Handle tool page containers
        var toolPages = document.querySelectorAll("[data-gmkb-page-type=\"tool\"]");
        toolPages.forEach(function(container) {
            var slug = container.getAttribute("data-gmkb-tool-slug");
            container.innerHTML = "<div class=\"gmkb-tool-page-loading\">" +
                "<div class=\"spinner\"></div>" +
                "<p>Loading " + (slug || "tool") + "...</p>" +
                "</div>";
        });
    });
})();
';
    }

    /**
     * Flush rewrite rules on activation
     */
    public static function activate() {
        self::instance()->add_rewrite_rules();
        flush_rewrite_rules();
    }
}

// Initialize the shortcode
GMKB_Tool_Pages_Shortcode::instance();
