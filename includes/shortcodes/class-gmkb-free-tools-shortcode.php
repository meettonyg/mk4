<?php
/**
 * GMKB Free Tools Shortcode
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Provides shortcode for embedding AI tools on public pages (standalone mode).
 *
 * Tools are dynamically discovered from the /tools/ directory via GMKB_Tool_Discovery.
 *
 * Usage:
 *
 * Generic: [gmkb_free_tool type="biography" title="Free Bio Generator"]
 * Directory: [gmkb_tools_directory]
 *
 * Shortcode names are auto-generated from tool IDs by removing suffixes:
 * - biography-generator -> [gmkb_biography]
 * - content-repurposer -> [gmkb_content]
 * - seo-optimizer -> [gmkb_seo]
 *
 * Note: For the most reliable tool embedding, use [gmkb_tool tool="..."] from
 * class-gmkb-tool-shortcode.php with explicit tool slugs.
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
 * @version 2.1.0
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
     * Tool Discovery service
     * @var GMKB_Tool_Discovery
     */
    private $tool_discovery = null;

    /**
     * Icon service
     * @var GMKB_Icon_Service
     */
    private $icon_service = null;

    /**
     * Valid tool types (built dynamically from Tool Discovery)
     * @var array
     */
    private $valid_types = null;

    /**
     * Tools organized by category (built dynamically from Tool Discovery)
     * @var array
     */
    private $tools_by_category = null;


    /**
     * Icon mapping from HeroIcons to Feather icons for directory display
     * @var array
     */
    private $icon_map = array(
        'UserCircleIcon' => 'user',
        'ChatBubbleLeftRightIcon' => 'list',
        'QuestionMarkCircleIcon' => 'help-circle',
        'TagIcon' => 'tag',
        'MicrophoneIcon' => 'mic',
        'CubeIcon' => 'package',
        'RocketLaunchIcon' => 'trending-up',
        'SpeakerWaveIcon' => 'volume-2',
        'BoltIcon' => 'zap',
        'SparklesIcon' => 'target',
        'UsersIcon' => 'users',
        'BookOpenIcon' => 'book-open',
        'PencilSquareIcon' => 'edit-3',
        'ShieldCheckIcon' => 'shield',
        'Squares2X2Icon' => 'grid',
        'ClipboardDocumentListIcon' => 'clipboard',
        'DocumentTextIcon' => 'edit',
        'ArrowPathIcon' => 'refresh-cw',
        'NewspaperIcon' => 'send',
        'ShareIcon' => 'share',
        'EnvelopeIcon' => 'mail',
        'InboxIcon' => 'inbox',
        'PlayCircleIcon' => 'youtube',
        'MagnifyingGlassIcon' => 'search',
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
        // Load services
        $this->load_tool_discovery();
        $this->load_icon_service();

        // Build tools data from discovery
        $this->build_tools_data();

        // Register the generic shortcode
        add_shortcode('gmkb_free_tool', array($this, 'render'));

        // Register the tools directory shortcode
        add_shortcode('gmkb_tools_directory', array($this, 'render_directory'));

        // Register individual shortcodes dynamically for each tool type
        if ($this->valid_types) {
            foreach ($this->valid_types as $type) {
                $shortcode_tag = 'gmkb_' . str_replace('-', '_', $type);
                add_shortcode($shortcode_tag, array($this, 'render_from_tag'));
            }
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            $type_count = $this->valid_types ? count($this->valid_types) : 0;
            error_log('GMKB Free Tools Shortcode: Registered ' . ($type_count + 2) . ' shortcodes');
        }
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
     * Load Icon service
     */
    private function load_icon_service() {
        $icon_path = GMKB_PLUGIN_DIR . 'includes/services/class-gmkb-icon-service.php';

        if (file_exists($icon_path)) {
            require_once $icon_path;
            $this->icon_service = GMKB_Icon_Service::instance();
        }
    }

    /**
     * Build tools data from Tool Discovery service
     */
    private function build_tools_data() {
        if (!$this->tool_discovery) {
            // Fallback to empty arrays if discovery not available
            $this->valid_types = array();
            $this->tools_by_category = array();
            return;
        }

        $this->valid_types = array();
        $this->tools_by_category = array();

        // Get categories from discovery
        $categories = $this->tool_discovery->get_all_categories();

        // Get all tools grouped by category
        $grouped = $this->tool_discovery->get_tools_grouped_by_category();

        foreach ($grouped as $category_slug => $category_data) {
            // Build category structure (icon comes from Tool Discovery)
            $this->tools_by_category[$category_slug] = array(
                'label' => $category_data['name'],
                'description' => $category_data['description'],
                'icon' => isset($category_data['icon']) ? $category_data['icon'] : 'folder',
                'tools' => array(),
            );

            // Process tools in this category
            foreach ($category_data['tools'] as $tool) {
                // Get metadata for richer display info
                $metadata = $this->tool_discovery->get_tool_metadata($tool['id']);

                // Derive short type from tool ID (e.g., biography-generator -> biography)
                $short_type = str_replace('-generator', '', $tool['id']);
                $short_type = str_replace('-builder', '', $short_type);
                $short_type = str_replace('-writer', '', $short_type);
                $short_type = str_replace('-repurposer', '', $short_type);
                $short_type = str_replace('-optimizer', '', $short_type);

                // Add to valid types
                $this->valid_types[] = $short_type;

                // Map icon to feather icon format
                $tool_icon = isset($tool['icon']) ? $tool['icon'] : 'file';
                if (isset($this->icon_map[$tool_icon])) {
                    $tool_icon = $this->icon_map[$tool_icon];
                }

                // Build tool entry
                $this->tools_by_category[$category_slug]['tools'][$short_type] = array(
                    'title' => $metadata ? $metadata['name'] : $tool['name'],
                    'description' => $metadata ? $metadata['shortDescription'] : '',
                    'icon' => $tool_icon,
                    'slug' => $tool['id'],
                );
            }
        }

        // Remove duplicates from valid_types
        $this->valid_types = array_unique($this->valid_types);
    }

    /**
     * Generic renderer for individual tool shortcodes.
     * Derives tool type from the shortcode tag.
     *
     * @param array  $atts    Shortcode attributes.
     * @param string $content Shortcode content.
     * @param string $tag     The shortcode tag.
     * @return string HTML output.
     */
    public function render_from_tag($atts, $content = null, $tag = '') {
        // Convert shortcode tag to tool type (gmkb_brand_story -> brand-story)
        $type = str_replace('gmkb_', '', $tag);
        $type = str_replace('_', '-', $type);

        // Validate type (safeguard)
        if (!in_array($type, $this->valid_types)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Free Tools: Invalid dynamic shortcode tag "' . $tag . '"');
            }
            return '<!-- GMKB: Invalid tool type -->';
        }

        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = $type;
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
        // Note: Nonce is passed globally via wp_localize_script (gmkbPublicData.publicNonce)
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
     * Render the tools directory shortcode
     *
     * Usage: [gmkb_tools_directory]
     * Options:
     *   - base_url: Base URL for tool links (default: /tools/)
     *   - layout: 'grid' or 'list' (default: grid)
     *   - show_descriptions: 'true' or 'false' (default: true)
     *   - category: Filter to specific category (default: all)
     *   - columns: Number of columns for grid (default: 3)
     *
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_directory($atts) {
        $atts = shortcode_atts(array(
            'base_url' => '/tools/',
            'layout' => 'grid',
            'show_descriptions' => 'true',
            'category' => '',
            'columns' => '3',
            'class' => ''
        ), $atts, 'gmkb_tools_directory');

        // Ensure base_url has trailing slash
        $base_url = trailingslashit($atts['base_url']);
        $show_descriptions = $atts['show_descriptions'] === 'true';
        $columns = intval($atts['columns']);
        if ($columns < 1 || $columns > 4) {
            $columns = 3;
        }

        // Enqueue directory styles
        $this->enqueue_directory_styles();

        // Build CSS classes
        $container_classes = array(
            'gmkb-tools-directory',
            'gmkb-tools-directory--' . esc_attr($atts['layout']),
            'gmkb-tools-directory--cols-' . $columns
        );
        if (!empty($atts['class'])) {
            $container_classes[] = esc_attr($atts['class']);
        }

        $html = '<div class="' . esc_attr(implode(' ', $container_classes)) . '">';

        // Filter categories if specified
        $categories = $this->tools_by_category;
        if (!empty($atts['category']) && isset($categories[$atts['category']])) {
            $categories = array($atts['category'] => $categories[$atts['category']]);
        }

        foreach ($categories as $category_key => $category) {
            $html .= '<div class="gmkb-tools-category" id="tools-' . esc_attr($category_key) . '">';

            // Category header
            $html .= '<div class="gmkb-tools-category__header">';
            $html .= '<h2 class="gmkb-tools-category__title">' . esc_html($category['label']) . '</h2>';
            if ($show_descriptions && !empty($category['description'])) {
                $html .= '<p class="gmkb-tools-category__description">' . esc_html($category['description']) . '</p>';
            }
            $html .= '</div>';

            // Tools grid/list
            $html .= '<div class="gmkb-tools-category__tools">';

            foreach ($category['tools'] as $tool_key => $tool) {
                $tool_url = home_url($base_url . $tool['slug'] . '/');

                $html .= '<a href="' . esc_url($tool_url) . '" class="gmkb-tool-card">';
                $html .= '<div class="gmkb-tool-card__icon">';
                $html .= $this->get_icon_svg($tool['icon']);
                $html .= '</div>';
                $html .= '<div class="gmkb-tool-card__content">';
                $html .= '<h3 class="gmkb-tool-card__title">' . esc_html($tool['title']) . '</h3>';
                if ($show_descriptions && !empty($tool['description'])) {
                    $html .= '<p class="gmkb-tool-card__description">' . esc_html($tool['description']) . '</p>';
                }
                $html .= '</div>';
                $html .= '<div class="gmkb-tool-card__arrow">';
                $html .= $this->get_icon_svg('arrow-right');
                $html .= '</div>';
                $html .= '</a>';
            }

            $html .= '</div>'; // .gmkb-tools-category__tools
            $html .= '</div>'; // .gmkb-tools-category
        }

        $html .= '</div>'; // .gmkb-tools-directory

        return $html;
    }

    /**
     * Get SVG icon markup
     *
     * Uses GMKB_Icon_Service to load icons from assets/icons/ directory.
     *
     * @param string $icon Icon name
     * @return string SVG markup
     */
    private function get_icon_svg($icon) {
        if ($this->icon_service) {
            return $this->icon_service->get_icon($icon);
        }

        // Fallback if icon service not available
        return '';
    }

    /**
     * Enqueue directory-specific styles
     */
    private function enqueue_directory_styles() {
        wp_enqueue_style(
            'gmkb-tools-directory',
            false // Inline styles
        );

        wp_add_inline_style('gmkb-tools-directory', $this->get_directory_styles());
    }

    /**
     * Get CSS styles for the tools directory
     *
     * @return string CSS styles
     */
    private function get_directory_styles() {
        return '
/* Tools Directory Styles */
.gmkb-tools-directory {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.gmkb-tools-category {
    margin-bottom: 3rem;
}

.gmkb-tools-category__header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e5e7eb;
}

.gmkb-tools-category__title {
    margin: 0 0 0.5rem;
    font-size: 1.75rem;
    font-weight: 700;
    color: #111827;
}

.gmkb-tools-category__description {
    margin: 0;
    font-size: 1rem;
    color: #6b7280;
}

/* Grid Layout */
.gmkb-tools-directory--grid .gmkb-tools-category__tools {
    display: grid;
    gap: 1.5rem;
}

.gmkb-tools-directory--cols-2 .gmkb-tools-category__tools {
    grid-template-columns: repeat(2, 1fr);
}

.gmkb-tools-directory--cols-3 .gmkb-tools-category__tools {
    grid-template-columns: repeat(3, 1fr);
}

.gmkb-tools-directory--cols-4 .gmkb-tools-category__tools {
    grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 1024px) {
    .gmkb-tools-directory--cols-4 .gmkb-tools-category__tools,
    .gmkb-tools-directory--cols-3 .gmkb-tools-category__tools {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 640px) {
    .gmkb-tools-directory--cols-4 .gmkb-tools-category__tools,
    .gmkb-tools-directory--cols-3 .gmkb-tools-category__tools,
    .gmkb-tools-directory--cols-2 .gmkb-tools-category__tools {
        grid-template-columns: 1fr;
    }
}

/* List Layout */
.gmkb-tools-directory--list .gmkb-tools-category__tools {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

/* Tool Card */
.gmkb-tool-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s ease;
}

.gmkb-tool-card:hover {
    border-color: #6366f1;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
    transform: translateY(-2px);
}

.gmkb-tool-card__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border-radius: 10px;
    color: #fff;
}

.gmkb-tool-card__icon svg {
    width: 24px;
    height: 24px;
}

.gmkb-tool-card__content {
    flex: 1;
    min-width: 0;
}

.gmkb-tool-card__title {
    margin: 0 0 0.25rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
}

.gmkb-tool-card__description {
    margin: 0;
    font-size: 0.875rem;
    color: #6b7280;
    line-height: 1.5;
}

.gmkb-tool-card__arrow {
    flex-shrink: 0;
    color: #9ca3af;
    transition: transform 0.2s ease, color 0.2s ease;
}

.gmkb-tool-card__arrow svg {
    width: 20px;
    height: 20px;
}

.gmkb-tool-card:hover .gmkb-tool-card__arrow {
    color: #6366f1;
    transform: translateX(4px);
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
    .gmkb-tools-directory {
        background: #111827;
    }

    .gmkb-tools-category__header {
        border-bottom-color: #374151;
    }

    .gmkb-tools-category__title {
        color: #f9fafb;
    }

    .gmkb-tools-category__description {
        color: #9ca3af;
    }

    .gmkb-tool-card {
        background: #1f2937;
        border-color: #374151;
    }

    .gmkb-tool-card:hover {
        border-color: #6366f1;
    }

    .gmkb-tool-card__title {
        color: #f9fafb;
    }

    .gmkb-tool-card__description {
        color: #9ca3af;
    }
}
';
    }

    /**
     * Get all tools organized by category (public accessor)
     *
     * @return array Tools by category
     */
    public function get_tools_by_category() {
        return $this->tools_by_category;
    }

    /**
     * Get tool info by type
     *
     * @param string $type Tool type (e.g., 'biography', 'topics')
     * @return array|null Tool info or null if not found
     */
    public function get_tool_info($type) {
        foreach ($this->tools_by_category as $category) {
            if (isset($category['tools'][$type])) {
                return $category['tools'][$type];
            }
        }
        return null;
    }

    /**
     * Enqueue required assets
     */
    private function enqueue_assets() {
        if ($this->enqueued) {
            return;
        }

        // Use unified gmkb bundle
        $gmkb_js = GMKB_PLUGIN_DIR . 'dist/gmkb.iife.js';
        $gmkb_css = GMKB_PLUGIN_DIR . 'dist/gmkb.css';

        $use_bundle = file_exists($gmkb_js);

        if ($use_bundle) {
            // Enqueue unified gmkb bundle
            wp_enqueue_style(
                'gmkb-tools',
                GMKB_PLUGIN_URL . 'dist/gmkb.css',
                array(),
                GMKB_VERSION
            );

            wp_enqueue_script(
                'gmkb-tools',
                GMKB_PLUGIN_URL . 'dist/gmkb.iife.js',
                array(),
                GMKB_VERSION,
                true
            );

            $script_handle = 'gmkb-tools';

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Free Tools: Using gmkb bundle');
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
