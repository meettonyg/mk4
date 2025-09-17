<?php
/**
 * Theme Generator Class
 * Phase 4: Dynamic CSS Generation from Theme Configuration
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
     */
    public function init() {
        // Register theme CSS endpoint
        add_action('wp_enqueue_scripts', array($this, 'enqueue_theme_styles'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_theme_styles'));
    }
    
    /**
     * Enqueue theme styles
     */
    public function enqueue_theme_styles() {
        // Check if we're on a media kit page
        if (!$this->is_media_kit_page()) {
            return;
        }
        
        // Get current theme
        $theme_id = get_option('gmkb_current_theme', 'professional_clean');
        $theme = $this->load_theme($theme_id);
        
        if ($theme) {
            // Generate CSS
            $css = $this->generate_theme_css($theme);
            
            // Add inline styles
            wp_add_inline_style('gmkb-builder-styles', $css);
        }
    }
    
    /**
     * Load theme configuration
     * 
     * @param string $theme_id Theme identifier
     * @return array|false Theme configuration or false
     */
    public function load_theme($theme_id) {
        // First check for custom saved themes
        $custom_theme = get_option('gmkb_custom_theme_' . $theme_id);
        if ($custom_theme) {
            return $custom_theme;
        }
        
        // Use theme discovery to load from self-contained theme directory
        $theme = $this->theme_discovery->getTheme($theme_id);
        if ($theme) {
            return $theme;
        }
        
        // Fallback to default theme
        return $this->get_default_theme();
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
     * 
     * @param array $theme Theme configuration
     * @return string Generated CSS
     */
    public function generate_theme_css($theme) {
        $css = ":root {\n";
        
        // Typography CSS variables
        if (isset($theme['typography'])) {
            $typography = $theme['typography'];
            
            if (isset($typography['primary_font'])) {
                $css .= "  --gmkb-font-primary: " . $typography['primary_font']['family'] . ";\n";
            }
            
            if (isset($typography['heading_font'])) {
                $css .= "  --gmkb-font-heading: " . $typography['heading_font']['family'] . ";\n";
            }
            
            if (isset($typography['font_scale'])) {
                $scale = $typography['font_scale'];
                $base_size = 16;
                
                $css .= "  --gmkb-font-scale: " . $scale . ";\n";
                $css .= "  --gmkb-font-size-xs: " . round($base_size * 0.75) . "px;\n";
                $css .= "  --gmkb-font-size-sm: " . round($base_size * 0.875) . "px;\n";
                $css .= "  --gmkb-font-size-base: " . $base_size . "px;\n";
                $css .= "  --gmkb-font-size-lg: " . round($base_size * $scale) . "px;\n";
                $css .= "  --gmkb-font-size-xl: " . round($base_size * $scale * 1.25) . "px;\n";
                $css .= "  --gmkb-font-size-2xl: " . round($base_size * $scale * 1.5) . "px;\n";
                $css .= "  --gmkb-font-size-3xl: " . round($base_size * $scale * 1.875) . "px;\n";
                $css .= "  --gmkb-font-size-4xl: " . round($base_size * $scale * 2.25) . "px;\n";
            }
            
            if (isset($typography['line_height'])) {
                $css .= "  --gmkb-line-height-body: " . $typography['line_height']['body'] . ";\n";
                $css .= "  --gmkb-line-height-heading: " . $typography['line_height']['heading'] . ";\n";
            }
        }
        
        // Color CSS variables
        if (isset($theme['colors'])) {
            foreach ($theme['colors'] as $key => $value) {
                $var_name = str_replace('_', '-', $key);
                $css .= "  --gmkb-color-" . $var_name . ": " . $value . ";\n";
            }
        }
        
        // Spacing CSS variables
        if (isset($theme['spacing'])) {
            foreach ($theme['spacing'] as $key => $value) {
                $var_name = str_replace('_', '-', $key);
                $css .= "  --gmkb-spacing-" . $var_name . ": " . $value . ";\n";
            }
            
            // Generate spacing scale
            if (isset($theme['spacing']['base_unit'])) {
                $base_unit = intval($theme['spacing']['base_unit']);
                for ($i = 1; $i <= 12; $i++) {
                    $css .= "  --gmkb-space-" . $i . ": " . ($base_unit * $i) . "px;\n";
                }
            }
        }
        
        // Effects CSS variables
        if (isset($theme['effects'])) {
            foreach ($theme['effects'] as $key => $value) {
                $var_name = str_replace('_', '-', $key);
                $css .= "  --gmkb-" . $var_name . ": " . $value . ";\n";
            }
        }
        
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
     * Generate component-specific styles
     * 
     * @param array $theme Theme configuration
     * @return string Component CSS
     */
    private function generate_component_styles($theme) {
        $css = "";
        
        // Apply theme to components
        $css .= "/* Theme Component Styles */\n";
        
        // Base text styles
        $css .= ".gmkb-media-kit-builder {\n";
        $css .= "  font-family: var(--gmkb-font-primary);\n";
        $css .= "  color: var(--gmkb-color-text);\n";
        $css .= "  line-height: var(--gmkb-line-height-body);\n";
        $css .= "}\n\n";
        
        // Headings
        $css .= ".gmkb-media-kit-builder h1,\n";
        $css .= ".gmkb-media-kit-builder h2,\n";
        $css .= ".gmkb-media-kit-builder h3,\n";
        $css .= ".gmkb-media-kit-builder h4,\n";
        $css .= ".gmkb-media-kit-builder h5,\n";
        $css .= ".gmkb-media-kit-builder h6 {\n";
        $css .= "  font-family: var(--gmkb-font-heading);\n";
        $css .= "  line-height: var(--gmkb-line-height-heading);\n";
        $css .= "  color: var(--gmkb-color-text);\n";
        $css .= "}\n\n";
        
        // Component containers
        $css .= ".gmkb-component {\n";
        $css .= "  background: var(--gmkb-color-surface);\n";
        $css .= "  border-radius: var(--gmkb-border-radius);\n";
        $css .= "  margin-bottom: var(--gmkb-spacing-component-gap);\n";
        $css .= "  transition: var(--gmkb-transitions);\n";
        $css .= "}\n\n";
        
        // Sections
        $css .= ".gmkb-section {\n";
        $css .= "  margin-bottom: var(--gmkb-spacing-section-gap);\n";
        $css .= "}\n\n";
        
        // Buttons
        if (isset($theme['components']['button'])) {
            $button = $theme['components']['button'];
            $css .= ".gmkb-button {\n";
            $css .= "  background: var(--gmkb-color-primary);\n";
            $css .= "  color: var(--gmkb-color-background);\n";
            $css .= "  border-radius: var(--gmkb-border-radius);\n";
            $css .= "  transition: var(--gmkb-transitions);\n";
            
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
            $css .= "  background: var(--gmkb-color-primary-hover, var(--gmkb-color-primary));\n";
            $css .= "  transform: translateY(-2px);\n";
            $css .= "  box-shadow: var(--gmkb-shadow);\n";
            $css .= "}\n\n";
        }
        
        // Cards
        if (isset($theme['components']['card'])) {
            $card = $theme['components']['card'];
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
        
        // Inputs
        if (isset($theme['components']['input'])) {
            $input = $theme['components']['input'];
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
            $css .= "  border-radius: var(--gmkb-border-radius-sm, var(--gmkb-border-radius));\n";
            $css .= "  background: var(--gmkb-color-background);\n";
            $css .= "  color: var(--gmkb-color-text);\n";
            $css .= "  transition: var(--gmkb-transitions);\n";
            $css .= "}\n\n";
            
            $css .= ".gmkb-input:focus,\n";
            $css .= ".gmkb-textarea:focus,\n";
            $css .= ".gmkb-select:focus {\n";
            $css .= "  border-color: var(--gmkb-color-border-focus, var(--gmkb-color-primary));\n";
            $css .= "  outline: none;\n";
            $css .= "  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);\n";
            $css .= "}\n\n";
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
                $css .= "    --gmkb-font-size-4xl: " . round($base_size * 2.25 * $scale) . "px;\n";
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
        $theme = $this->load_theme($theme_id);
        
        if (!$theme) {
            wp_send_json_error('Theme not found');
            return;
        }
        
        $css = $this->generate_theme_css($theme);
        
        wp_send_json_success(array(
            'css' => $css,
            'theme' => $theme
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
