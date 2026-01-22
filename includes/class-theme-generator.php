<?php
/**
 * Theme Generator Class
 * Phase 4: Dynamic CSS Generation from Theme Configuration
 * Generate ALL required CSS variables (100% coverage)
 *
 * @package GMKB/Includes
 * @since 4.0.0
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class GMKB_Theme_Generator {

    /**
     * Current theme configuration
     * @var array
     */
    private $theme;

    /**
     * Theme discovery instance
     * @var ThemeDiscovery
     */
    private $theme_discovery;

    /**
     * Generated CSS cache
     * @var string
     */
    private $generated_css = '';

    /**
     * Constructor
     */
    public function __construct() {
        // Initialize theme discovery
        require_once plugin_dir_path(dirname(__FILE__)) . 'system/ThemeDiscovery.php';
        $this->theme_discovery = new ThemeDiscovery(plugin_dir_path(dirname(__FILE__)) . 'themes');

        add_action('init', array($this, 'init'));
        add_action('wp_ajax_gmkb_save_theme', array($this, 'ajax_save_theme'));
        add_action('wp_ajax_gmkb_get_theme_css', array($this, 'ajax_get_theme_css'));
    }

    /**
     * Initialize theme generator
     * CSS is now handled by:
     * 1. Builder: wp_add_inline_style in enqueue_theme_styles()
     * 2. Frontend: inject_theme_css_variables() in class-gmkb-frontend-display.php
     */
    public function init() {
        // Register theme CSS endpoint
        add_action('wp_enqueue_scripts', array($this, 'enqueue_theme_styles'), 999);
        add_action('admin_enqueue_scripts', array($this, 'enqueue_theme_styles'), 999);
    }

    /**
     * Enqueue theme styles
     * Only run in BUILDER, not on frontend display
     * Frontend CSS is handled by class-gmkb-frontend-display.php
     */
    public function enqueue_theme_styles() {
        // Only run in BUILDER (admin or builder page)
        if (!is_admin()) {
            // Check if this is a builder page (has mkcg_id parameter)
            if (!isset($_GET['mkcg_id'])) {
                return;
            }
        }

        // Check if we're on a media kit page
        if (!$this->is_media_kit_page()) {
            return;
        }

        // Get post ID to load customizations
        global $post;
        $post_id = null;

        if (is_admin()) {
            $post_id = isset($_GET['post']) ? intval($_GET['post']) : null;
        } elseif ($post) {
            $post_id = $post->ID;
        }

        // Get current theme
        $theme_id = get_option('gmkb_current_theme', 'minimal_elegant');
        $theme = $this->load_theme($theme_id, $post_id);

        if ($theme) {
            // Generate CSS
            $css = $this->generate_theme_css($theme);

            // Use multiple approaches to ensure CSS is injected
            if (wp_style_is('gmkb-vue-style', 'enqueued') || wp_style_is('gmkb-vue-style', 'registered')) {
                wp_add_inline_style('gmkb-vue-style', $css);
            } elseif (wp_style_is('gmkb-design-system', 'enqueued') || wp_style_is('gmkb-design-system', 'registered')) {
                wp_add_inline_style('gmkb-design-system', $css);
            } else {
                add_action('wp_head', function() use ($css) {
                    echo "\n<style id=\"gmkb-theme-variables\">\n" . $css . "\n</style>\n";
                }, 100);
                add_action('admin_head', function() use ($css) {
                    echo "\n<style id=\"gmkb-theme-variables\">\n" . $css . "\n</style>\n";
                }, 100);
            }
        }
    }

    /**
     * Direct output method for theme CSS variables
     */
    public function output_theme_variables_direct() {
        // Check if we're on a media kit page
        if (!$this->is_media_kit_page()) {
            return;
        }

        // Get post ID to load customizations
        global $post;
        $post_id = null;

        if (is_admin()) {
            $post_id = isset($_GET['post']) ? intval($_GET['post']) : null;
        } elseif ($post) {
            $post_id = $post->ID;
        }

        // Get current theme
        $theme_id = get_option('gmkb_current_theme', 'minimal_elegant');
        $theme = $this->load_theme($theme_id, $post_id);

        if (!$theme) {
            return;
        }

        // Generate ONLY the CSS variables (not component styles)
        $css = $this->generate_css_variables_only($theme);

        // Output directly
        echo "\n<style id=\"gmkb-theme-variables-direct\">\n" . $css . "\n</style>\n";
    }

    /**
     * Generate ONLY CSS variables (not component styles)
     * Used for direct output to avoid duplication
     */
    private function generate_css_variables_only($theme) {
        $css = "/* GMKB Theme CSS Variables (Direct Output) - " . ($theme['theme_id'] ?? 'unknown') . " */\n";
        $css .= ":root {\n";

        // Generate all variable categories
        $css .= $this->generate_color_variables($theme);
        $css .= $this->generate_typography_variables($theme);
        $css .= $this->generate_spacing_variables($theme);
        $css .= $this->generate_effects_variables($theme);
        $css .= $this->generate_layout_variables($theme);

        $css .= "}\n";

        return $css;
    }

    /**
     * Load theme configuration
     * Merge per-post customizations with base theme
     *
     * @param string $theme_id Theme identifier
     * @param int|null $post_id Post ID to load customizations from
     * @return array|false Theme configuration or false
     */
    public function load_theme($theme_id, $post_id = null) {
        // First check for custom saved themes
        $custom_theme = get_option('gmkb_custom_theme_' . $theme_id);
        if ($custom_theme) {
            $theme = $custom_theme;
        } else {
            // Use theme discovery to load from self-contained theme directory
            $theme = $this->theme_discovery->getTheme($theme_id);
            if (!$theme) {
                // Fallback to default theme
                $theme = $this->get_default_theme();
            }
        }

        // Load and merge per-post customizations if post_id provided
        if ($post_id && $theme) {
            $theme = $this->merge_post_customizations($theme, $post_id);
        }

        return $theme;
    }

    /**
     * Load and merge per-post theme customizations
     *
     * @param array $theme Base theme configuration
     * @param int $post_id Post ID
     * @return array Theme with customizations merged
     */
    private function merge_post_customizations($theme, $post_id) {
        // Load saved state from post meta
        $state = get_post_meta($post_id, 'gmkb_media_kit_state', true);

        if (empty($state) || !isset($state['themeCustomizations'])) {
            return $theme;
        }

        $customizations = $state['themeCustomizations'];

        // Deep merge customizations into theme
        if (isset($customizations->colors) || (is_array($customizations) && isset($customizations['colors']))) {
            $custom_colors = is_object($customizations) ? (array)$customizations->colors : $customizations['colors'];
            $theme['colors'] = array_merge($theme['colors'] ?? array(), $custom_colors);
        }

        if (isset($customizations->typography) || (is_array($customizations) && isset($customizations['typography']))) {
            $custom_typo = is_object($customizations) ? (array)$customizations->typography : $customizations['typography'];
            $theme['typography'] = array_merge($theme['typography'] ?? array(), $custom_typo);
        }

        if (isset($customizations->spacing) || (is_array($customizations) && isset($customizations['spacing']))) {
            $custom_spacing = is_object($customizations) ? (array)$customizations->spacing : $customizations['spacing'];
            $theme['spacing'] = array_merge($theme['spacing'] ?? array(), $custom_spacing);
        }

        if (isset($customizations->effects) || (is_array($customizations) && isset($customizations['effects']))) {
            $custom_effects = is_object($customizations) ? (array)$customizations->effects : $customizations['effects'];
            $theme['effects'] = array_merge($theme['effects'] ?? array(), $custom_effects);
        }

        // Mark that customizations were applied
        $theme['_customizations_applied'] = true;
        $theme['_post_id'] = $post_id;

        return $theme;
    }

    /**
     * Get default theme configuration
     *
     * @return array Default theme
     */
    private function get_default_theme() {
        return array(
            'theme_id' => 'default',
            'theme_name' => 'Default Theme',
            'version' => '1.0.0',
            'typography' => array(
                'primary_font' => array(
                    'family' => '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    'weights' => array(300, 400, 600, 700)
                ),
                'heading_font' => array(
                    'family' => 'inherit',
                    'weights' => array(400, 600, 700, 800)
                ),
                'font_scale' => 1.2,
                'line_height' => array(
                    'body' => 1.6,
                    'heading' => 1.2
                )
            ),
            'colors' => array(
                'primary' => '#295cff',
                'secondary' => '#1c0d5a',
                'accent' => '#295cff',
                'text' => '#333333',
                'text_light' => '#666666',
                'background' => '#ffffff',
                'surface' => '#f8f9fa',
                'border' => '#e1e5e9'
            ),
            'spacing' => array(
                'base_unit' => '8px',
                'component_gap' => '40px',
                'section_gap' => '80px'
            ),
            'effects' => array(
                'border_radius' => '8px',
                'shadow' => '0 4px 6px rgba(0, 0, 0, 0.1)',
                'transitions' => 'all 0.3s ease'
            )
        );
    }

    /**
     * Generate CSS from theme configuration
     * Generate ALL expected CSS variables for 100% coverage
     *
     * @param array $theme Theme configuration
     * @return string Generated CSS
     */
    public function generate_theme_css($theme) {
        $css = "/* GMKB Theme CSS Variables - Generated from " . ($theme['theme_id'] ?? 'unknown') . " */\n";
        $css .= ":root {\n";

        // COLORS (19 variables)
        $css .= $this->generate_color_variables($theme);

        // TYPOGRAPHY (22 variables)
        $css .= $this->generate_typography_variables($theme);

        // SPACING (11 variables)
        $css .= $this->generate_spacing_variables($theme);

        // EFFECTS (16 variables)
        $css .= $this->generate_effects_variables($theme);

        // LAYOUT (10 variables)
        $css .= $this->generate_layout_variables($theme);

        $css .= "}\n\n";

        // Add component-specific styles
        $css .= $this->generate_component_styles($theme);

        // Add responsive styles
        $css .= $this->generate_responsive_styles($theme);

        // Add theme-specific overrides
        $css .= $this->generate_theme_overrides($theme);

        return $css;
    }

    /**
     * Generate color CSS variables with derived colors
     * Generate ALL 19 expected color variables
     */
    private function generate_color_variables($theme) {
        $css = "  /* Colors (19 variables) */\n";
        $colors = $theme['colors'] ?? array();

        // Primary colors with derived variants
        $primary = $colors['primary'] ?? '#295cff';
        $css .= "  --gmkb-color-primary: {$primary};\n";
        $css .= "  --gmkb-color-primary-dark: " . $this->darken_color($primary, 20) . ";\n";
        $css .= "  --gmkb-color-primary-light: " . $this->lighten_color($primary, 20) . ";\n";

        // Secondary colors with derived variants
        $secondary = $colors['secondary'] ?? '#333333';
        $css .= "  --gmkb-color-secondary: {$secondary};\n";
        $css .= "  --gmkb-color-secondary-dark: " . $this->darken_color($secondary, 20) . ";\n";
        $css .= "  --gmkb-color-secondary-light: " . $this->lighten_color($secondary, 20) . ";\n";

        // Accent colors
        $accent = $colors['accent'] ?? $primary;
        $css .= "  --gmkb-color-accent: {$accent};\n";

        // Background and surface colors
        $background = $colors['background'] ?? '#ffffff';
        $surface = $colors['surface'] ?? '#fafafa';
        $css .= "  --gmkb-color-background: {$background};\n";
        $css .= "  --gmkb-color-surface: {$surface};\n";

        // Text colors
        $text = $colors['text'] ?? '#000000';
        $text_light = $colors['text_light'] ?? '#666666';
        $text_muted = $colors['text_muted'] ?? '#999999';
        $css .= "  --gmkb-color-text: {$text};\n";
        $css .= "  --gmkb-color-text-light: {$text_light};\n";
        $css .= "  --gmkb-color-text-muted: {$text_muted};\n";

        // Border colors
        $border = $colors['border'] ?? '#eeeeee';
        $css .= "  --gmkb-color-border: {$border};\n";

        // Link colors
        $css .= "  --gmkb-color-link: {$primary};\n";
        $css .= "  --gmkb-color-link-hover: " . $this->darken_color($primary, 15) . ";\n";

        // Status colors
        $css .= "  --gmkb-color-success: " . ($colors['success'] ?? '#008800') . ";\n";
        $css .= "  --gmkb-color-warning: " . ($colors['warning'] ?? '#ff8800') . ";\n";
        $css .= "  --gmkb-color-error: " . ($colors['error'] ?? '#cc0000') . ";\n";
        $css .= "  --gmkb-color-info: " . ($colors['info'] ?? '#0066cc') . ";\n";

        return $css;
    }

    /**
     * Generate typography CSS variables
     * Generate ALL 22 expected typography variables
     */
    private function generate_typography_variables($theme) {
        $css = "\n  /* Typography (22 variables) */\n";
        $typography = $theme['typography'] ?? array();

        // Font families
        $primary_font = $typography['primary_font']['family'] ?? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        $heading_font = $typography['heading_font']['family'] ?? $primary_font;
        $css .= "  --gmkb-font-primary: {$primary_font};\n";
        $css .= "  --gmkb-font-secondary: {$primary_font};\n";
        $css .= "  --gmkb-font-heading: {$heading_font};\n";

        // Font sizes (complete scale)
        $base_size = 16;
        $scale = $typography['font_scale'] ?? 1.2;
        $css .= "  --gmkb-font-size-xs: " . round($base_size * 0.75) . "px;\n";
        $css .= "  --gmkb-font-size-sm: " . round($base_size * 0.875) . "px;\n";
        $css .= "  --gmkb-font-size-md: " . $base_size . "px;\n";
        $css .= "  --gmkb-font-size-base: " . $base_size . "px;\n";
        $css .= "  --gmkb-font-size-lg: " . round($base_size * $scale) . "px;\n";
        $css .= "  --gmkb-font-size-xl: " . round($base_size * $scale * 1.25) . "px;\n";
        $css .= "  --gmkb-font-size-2xl: " . round($base_size * $scale * 1.5) . "px;\n";
        $css .= "  --gmkb-font-size-3xl: " . round($base_size * $scale * 1.875) . "px;\n";

        // Font weights (complete scale)
        $css .= "  --gmkb-font-weight-normal: 400;\n";
        $css .= "  --gmkb-font-weight-medium: 500;\n";
        $css .= "  --gmkb-font-weight-semibold: 600;\n";
        $css .= "  --gmkb-font-weight-bold: 700;\n";

        // Line heights (complete variants)
        $css .= "  --gmkb-line-height-tight: 1.25;\n";
        $css .= "  --gmkb-line-height-normal: 1.5;\n";
        $css .= "  --gmkb-line-height-relaxed: 1.75;\n";
        $css .= "  --gmkb-line-height-loose: 2;\n";

        // Letter spacing (complete variants)
        $css .= "  --gmkb-letter-spacing-tight: -0.025em;\n";
        $css .= "  --gmkb-letter-spacing-normal: 0;\n";
        $css .= "  --gmkb-letter-spacing-wide: 0.1em;\n";

        return $css;
    }

    /**
     * Generate spacing CSS variables
     * Generate ALL 11 expected spacing variables
     */
    private function generate_spacing_variables($theme) {
        $css = "\n  /* Spacing (11 variables) */\n";
        $spacing = $theme['spacing'] ?? array();

        // Named spacing values
        $base_unit = intval($spacing['base_unit'] ?? '8px');
        $css .= "  --gmkb-spacing-xs: " . round($base_unit * 0.5) . "px;\n";
        $css .= "  --gmkb-spacing-sm: " . round($base_unit * 0.75) . "px;\n";
        $css .= "  --gmkb-spacing-md: {$base_unit}px;\n";
        $css .= "  --gmkb-spacing-lg: " . round($base_unit * 1.5) . "px;\n";
        $css .= "  --gmkb-spacing-xl: " . round($base_unit * 2) . "px;\n";
        $css .= "  --gmkb-spacing-2xl: " . round($base_unit * 3) . "px;\n";
        $css .= "  --gmkb-spacing-3xl: " . round($base_unit * 4) . "px;\n";

        // Component and section spacing
        $component_gap = $spacing['component_gap'] ?? '32px';
        $section_gap = $spacing['section_gap'] ?? '64px';
        $section_padding = $spacing['section_padding'] ?? $section_gap;
        $container_padding = $spacing['container_padding'] ?? '20px';

        $css .= "  --gmkb-spacing-component-gap: {$component_gap};\n";
        $css .= "  --gmkb-spacing-section-gap: {$section_gap};\n";
        $css .= "  --gmkb-spacing-section-padding: {$section_padding};\n";
        $css .= "  --gmkb-spacing-container-padding: {$container_padding};\n";

        return $css;
    }

    /**
     * Generate effects CSS variables
     * Generate ALL 16 expected effects variables
     */
    private function generate_effects_variables($theme) {
        $css = "\n  /* Effects (16 variables) */\n";
        $effects = $theme['effects'] ?? array();

        // Border radius (complete scale)
        $base_radius = $effects['border_radius'] ?? '8px';
        $css .= "  --gmkb-border-radius: {$base_radius};\n";
        $css .= "  --gmkb-border-radius-sm: " . ($effects['border_radius_sm'] ?? '4px') . ";\n";
        $css .= "  --gmkb-border-radius-md: {$base_radius};\n";
        $css .= "  --gmkb-border-radius-lg: " . ($effects['border_radius_lg'] ?? '12px') . ";\n";
        $css .= "  --gmkb-border-radius-xl: 16px;\n";
        $css .= "  --gmkb-border-radius-full: 9999px;\n";
        $css .= "  --gmkb-border-width: 1px;\n";

        // Shadows (complete scale)
        $css .= "  --gmkb-shadow-sm: " . ($effects['shadow_sm'] ?? 'none') . ";\n";
        $css .= "  --gmkb-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);\n";
        $css .= "  --gmkb-shadow-lg: " . ($effects['shadow_lg'] ?? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)') . ";\n";
        $css .= "  --gmkb-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);\n";

        // Transitions (complete scale)
        $css .= "  --gmkb-transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);\n";
        $css .= "  --gmkb-transition-normal: 200ms cubic-bezier(0.4, 0, 0.2, 1);\n";
        $css .= "  --gmkb-transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);\n";

        // Opacity values
        $css .= "  --gmkb-opacity-disabled: 0.5;\n";
        $css .= "  --gmkb-opacity-hover: " . ($effects['hover_opacity'] ?? '0.8') . ";\n";

        return $css;
    }

    /**
     * Generate layout CSS variables
     * Generate ALL 10 expected layout variables
     */
    private function generate_layout_variables($theme) {
        $css = "\n  /* Layout (10 variables) */\n";
        $spacing = $theme['spacing'] ?? array();
        $responsive = $theme['responsive'] ?? array();
        $breakpoints = $responsive['breakpoints'] ?? array();

        // Container widths
        $max_width = $spacing['content_max_width'] ?? '1000px';
        $css .= "  --gmkb-container-max-width: {$max_width};\n";
        $css .= "  --gmkb-container-width: 100%;\n";

        // Layout dimensions
        $css .= "  --gmkb-sidebar-width: 300px;\n";
        $css .= "  --gmkb-header-height: 64px;\n";
        $css .= "  --gmkb-footer-height: 80px;\n";
        $css .= "  --gmkb-content-width: {$max_width};\n";

        // Breakpoints
        $css .= "  --gmkb-breakpoint-sm: " . ($breakpoints['sm'] ?? '640px') . ";\n";
        $css .= "  --gmkb-breakpoint-md: " . ($breakpoints['md'] ?? '768px') . ";\n";
        $css .= "  --gmkb-breakpoint-lg: " . ($breakpoints['lg'] ?? '1024px') . ";\n";
        $css .= "  --gmkb-breakpoint-xl: " . ($breakpoints['xl'] ?? '1280px') . ";\n";

        return $css;
    }

    /**
     * Helper: Darken a hex color
     */
    private function darken_color($hex, $percent) {
        $hex = str_replace('#', '', $hex);
        $r = hexdec(substr($hex, 0, 2));
        $g = hexdec(substr($hex, 2, 2));
        $b = hexdec(substr($hex, 4, 2));

        $r = max(0, $r - ($r * $percent / 100));
        $g = max(0, $g - ($g * $percent / 100));
        $b = max(0, $b - ($b * $percent / 100));

        return sprintf("#%02x%02x%02x", $r, $g, $b);
    }

    /**
     * Helper: Lighten a hex color
     */
    private function lighten_color($hex, $percent) {
        $hex = str_replace('#', '', $hex);
        $r = hexdec(substr($hex, 0, 2));
        $g = hexdec(substr($hex, 2, 2));
        $b = hexdec(substr($hex, 4, 2));

        $r = min(255, $r + ((255 - $r) * $percent / 100));
        $g = min(255, $g + ((255 - $g) * $percent / 100));
        $b = min(255, $b + ((255 - $b) * $percent / 100));

        return sprintf("#%02x%02x%02x", $r, $g, $b);
    }

    /**
     * Generate component-specific styles
     * DYNAMIC LOADING: Only generates CSS for components actually present on the page
     *
     * @param array $theme Theme configuration
     * @param array $used_components Optional array of component types to generate CSS for
     * @return string Component CSS
     */
    public function generate_component_styles($theme, $used_components = array()) {
        $css = "";

        // If no used_components specified, generate ALL styles (backward compatibility for builder)
        $generate_all = empty($used_components);

        // Helper function to check if we should generate CSS for a component
        $should_generate = function($component_type) use ($generate_all, $used_components) {
            return $generate_all || in_array($component_type, $used_components);
        };

        // Apply theme to components
        $css .= "/* Theme Component Styles" . ($generate_all ? " (ALL)" : " (DYNAMIC: " . implode(', ', $used_components) . ")") . " */\n";

        // Base text styles (ALWAYS include - required for all pages)
        $css .= ".gmkb-media-kit-builder {\n";
        $css .= "  font-family: var(--gmkb-font-primary);\n";
        $css .= "  color: var(--gmkb-color-text);\n";
        $css .= "  line-height: var(--gmkb-line-height-normal);\n";
        $css .= "}\n\n";

        // Headings (ALWAYS include - required for all pages)
        $css .= ".gmkb-media-kit-builder h1,\n";
        $css .= ".gmkb-media-kit-builder h2,\n";
        $css .= ".gmkb-media-kit-builder h3,\n";
        $css .= ".gmkb-media-kit-builder h4,\n";
        $css .= ".gmkb-media-kit-builder h5,\n";
        $css .= ".gmkb-media-kit-builder h6 {\n";
        $css .= "  font-family: var(--gmkb-font-heading);\n";
        $css .= "  line-height: var(--gmkb-line-height-tight);\n";
        $css .= "  color: var(--gmkb-color-text);\n";
        $css .= "}\n\n";

        // Component containers (ALWAYS include - required for all pages)
        $css .= ".gmkb-component {\n";
        $css .= "  background: var(--gmkb-color-surface);\n";
        $css .= "  border-radius: var(--gmkb-border-radius);\n";
        $css .= "  margin-bottom: var(--gmkb-spacing-component-gap);\n";
        $css .= "  transition: var(--gmkb-transition-normal);\n";
        $css .= "}\n\n";

        // Sections (ALWAYS include - required for all pages)
        $css .= ".gmkb-section {\n";
        $css .= "  margin-bottom: var(--gmkb-spacing-section-gap);\n";
        $css .= "}\n\n";

        // === DYNAMIC COMPONENT STYLES ===

        // Buttons (used by: call-to-action, contact, booking-calendar)
        if ($should_generate('call-to-action') || $should_generate('contact') || $should_generate('booking-calendar')) {
            if (isset($theme['components']['button'])) {
                $button = $theme['components']['button'];
                $css .= "/* Button Styles */\n";
                $css .= ".gmkb-button {\n";
                $css .= "  background: var(--gmkb-color-primary);\n";
                $css .= "  color: var(--gmkb-color-background);\n";
                $css .= "  border-radius: var(--gmkb-border-radius);\n";
                $css .= "  transition: var(--gmkb-transition-normal);\n";

                if (isset($button['padding'])) {
                    $css .= "  padding: " . $button['padding'] . ";\n";
                }
                if (isset($button['font_weight'])) {
                    $css .= "  font-weight: " . $button['font_weight'] . ";\n";
                }
                if (isset($button['letter_spacing'])) {
                    $css .= "  letter-spacing: " . $button['letter_spacing'] . ";\n";
                }

                $css .= "}\n\n";

                $css .= ".gmkb-button:hover {\n";
                $css .= "  background: var(--gmkb-color-primary-dark);\n";
                $css .= "  transform: translateY(-2px);\n";
                $css .= "  box-shadow: var(--gmkb-shadow-md);\n";
                $css .= "}\n\n";
            }
        }

        // Cards (used by: testimonials, stats, topics)
        if ($should_generate('testimonials') || $should_generate('stats') || $should_generate('topics')) {
            if (isset($theme['components']['card'])) {
                $card = $theme['components']['card'];
                $css .= "/* Card Styles */\n";
                $css .= ".gmkb-card {\n";

                if (isset($card['padding'])) {
                    $css .= "  padding: " . $card['padding'] . ";\n";
                }
                if (isset($card['shadow'])) {
                    $css .= "  box-shadow: " . $card['shadow'] . ";\n";
                }

                $css .= "  background: var(--gmkb-color-surface);\n";
                $css .= "  border-radius: var(--gmkb-border-radius);\n";
                $css .= "}\n\n";
            }
        }

        // Inputs (used by: contact)
        if ($should_generate('contact')) {
            if (isset($theme['components']['input'])) {
                $input = $theme['components']['input'];
                $css .= "/* Input Styles */\n";
                $css .= ".gmkb-input,\n";
                $css .= ".gmkb-textarea,\n";
                $css .= ".gmkb-select {\n";

                if (isset($input['padding'])) {
                    $css .= "  padding: " . $input['padding'] . ";\n";
                }
                if (isset($input['border_width'])) {
                    $css .= "  border-width: " . $input['border_width'] . ";\n";
                }

                $css .= "  border-color: var(--gmkb-color-border);\n";
                $css .= "  border-radius: var(--gmkb-border-radius-sm);\n";
                $css .= "  background: var(--gmkb-color-background);\n";
                $css .= "  color: var(--gmkb-color-text);\n";
                $css .= "  transition: var(--gmkb-transition-normal);\n";
                $css .= "}\n\n";

                $css .= ".gmkb-input:focus,\n";
                $css .= ".gmkb-textarea:focus,\n";
                $css .= ".gmkb-select:focus {\n";
                $css .= "  border-color: var(--gmkb-color-primary);\n";
                $css .= "  outline: none;\n";
                $css .= "  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);\n";
                $css .= "}\n\n";
            }
        }

        return $css;
    }

    /**
     * Generate responsive styles
     *
     * @param array $theme Theme configuration
     * @return string Responsive CSS
     */
    private function generate_responsive_styles($theme) {
        $css = "";

        if (!isset($theme['responsive'])) {
            return $css;
        }

        $responsive = $theme['responsive'];

        // Mobile styles
        if (isset($responsive['breakpoints']['md'])) {
            $css .= "@media (max-width: " . $responsive['breakpoints']['md'] . ") {\n";
            $css .= "  :root {\n";

            if (isset($responsive['font_scale_mobile'])) {
                $scale = $responsive['font_scale_mobile'];
                $base_size = 16;

                $css .= "    --gmkb-font-size-xs: " . round($base_size * 0.75 * $scale) . "px;\n";
                $css .= "    --gmkb-font-size-sm: " . round($base_size * 0.875 * $scale) . "px;\n";
                $css .= "    --gmkb-font-size-base: " . round($base_size * $scale) . "px;\n";
                $css .= "    --gmkb-font-size-lg: " . round($base_size * 1.125 * $scale) . "px;\n";
                $css .= "    --gmkb-font-size-xl: " . round($base_size * 1.25 * $scale) . "px;\n";
                $css .= "    --gmkb-font-size-2xl: " . round($base_size * 1.5 * $scale) . "px;\n";
                $css .= "    --gmkb-font-size-3xl: " . round($base_size * 1.875 * $scale) . "px;\n";
            }

            if (isset($responsive['spacing_scale_mobile']) && isset($theme['spacing'])) {
                $scale = $responsive['spacing_scale_mobile'];
                foreach ($theme['spacing'] as $key => $value) {
                    $numeric_value = intval($value);
                    if ($numeric_value > 0) {
                        $var_name = str_replace('_', '-', $key);
                        $css .= "    --gmkb-spacing-" . $var_name . ": " . round($numeric_value * $scale) . "px;\n";
                    }
                }
            }

            $css .= "  }\n";
            $css .= "}\n\n";
        }

        return $css;
    }

    /**
     * Generate theme-specific overrides
     *
     * @param array $theme Theme configuration
     * @return string Theme override CSS
     */
    private function generate_theme_overrides($theme) {
        $css = "";

        // Add data attribute for theme-specific styling
        $css .= "[data-gmkb-theme=\"" . $theme['theme_id'] . "\"] {\n";

        // Special theme overrides
        if (isset($theme['special'])) {
            $special = $theme['special'];

            // Dark mode optimized
            if (isset($special['dark_mode_optimized']) && $special['dark_mode_optimized']) {
                $css .= "  color-scheme: dark;\n";
            }

            // Glassmorphism effects
            if (isset($special['use_glassmorphism']) && $special['use_glassmorphism']) {
                $css .= "  .gmkb-component {\n";
                $css .= "    backdrop-filter: var(--gmkb-backdrop-blur, blur(12px));\n";
                $css .= "    background: rgba(255, 255, 255, 0.05);\n";
                $css .= "    border: 1px solid rgba(255, 255, 255, 0.1);\n";
                $css .= "  }\n";
            }
        }

        $css .= "}\n\n";

        // Add animation keyframes if defined
        if (isset($theme['animations'])) {
            $css .= "/* Theme Animations */\n";
            $css .= "@keyframes bounce {\n";
            $css .= "  0%, 100% { transform: translateY(0); }\n";
            $css .= "  50% { transform: translateY(-10px); }\n";
            $css .= "}\n\n";

            $css .= "@keyframes pulse {\n";
            $css .= "  0% { opacity: 1; }\n";
            $css .= "  50% { opacity: 0.7; }\n";
            $css .= "  100% { opacity: 1; }\n";
            $css .= "}\n\n";

            $css .= "@keyframes glowPulse {\n";
            $css .= "  0% { box-shadow: 0 0 5px var(--gmkb-color-primary); }\n";
            $css .= "  50% { box-shadow: 0 0 20px var(--gmkb-color-primary), 0 0 30px var(--gmkb-color-primary); }\n";
            $css .= "  100% { box-shadow: 0 0 5px var(--gmkb-color-primary); }\n";
            $css .= "}\n\n";
        }

        return $css;
    }

    /**
     * AJAX handler for saving theme
     */
    public function ajax_save_theme() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
            wp_send_json_error('Invalid nonce');
            return;
        }

        // Get theme data
        $theme_id = isset($_POST['theme_id']) ? sanitize_text_field($_POST['theme_id']) : '';
        $theme_data = isset($_POST['theme_data']) ? json_decode(stripslashes($_POST['theme_data']), true) : null;

        if (!$theme_id || !$theme_data) {
            wp_send_json_error('Invalid theme data');
            return;
        }

        // Save current theme ID
        update_option('gmkb_current_theme', $theme_id);

        // If it's a custom theme, save the configuration
        if (strpos($theme_id, 'custom_') === 0 || strpos($theme_id, 'imported_') === 0) {
            update_option('gmkb_custom_theme_' . $theme_id, $theme_data);
        }

        // Clear any cached CSS
        delete_transient('gmkb_theme_css_' . $theme_id);

        wp_send_json_success(array(
            'message' => 'Theme saved successfully',
            'theme_id' => $theme_id
        ));
    }

    /**
     * AJAX handler for getting theme CSS
     */
    public function ajax_get_theme_css() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
            wp_send_json_error('Invalid nonce');
            return;
        }

        $theme_id = isset($_POST['theme_id']) ? sanitize_text_field($_POST['theme_id']) : 'default';
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : null;

        $theme = $this->load_theme($theme_id, $post_id);

        if (!$theme) {
            wp_send_json_error('Theme not found');
            return;
        }

        $css = $this->generate_theme_css($theme);

        wp_send_json_success(array(
            'css' => $css,
            'theme' => $theme,
            'customizations_applied' => !empty($theme['_customizations_applied'])
        ));
    }

    /**
     * Check if current page is a media kit page
     *
     * @return bool
     */
    private function is_media_kit_page() {
        global $post;

        // Check admin pages
        if (is_admin()) {
            $screen = get_current_screen();
            return $screen && ($screen->id === 'guests_page_media-kit-builder' || $screen->post_type === 'guests');
        }

        // Check frontend pages
        return $post && ($post->post_type === 'guests' || has_shortcode($post->post_content, 'display_media_kit'));
    }
}

// Initialize theme generator
new GMKB_Theme_Generator();
