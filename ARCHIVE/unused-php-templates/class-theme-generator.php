<?php
/**
 * Theme Generator Class
 * Phase 4: Theme Layer System
 * 
 * Generates dynamic CSS from theme configurations
 * 
 * @package GMKB
 * @since 4.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Theme_Generator {
    
    private static $instance = null;
    private $current_theme = null;
    private $themes = array();
    
    /**
     * Get singleton instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        $this->load_themes();
        add_action('wp_head', array($this, 'output_theme_styles'), 5);
        add_action('wp_ajax_gmkb_save_theme', array($this, 'ajax_save_theme'));
        add_action('wp_ajax_gmkb_load_theme', array($this, 'ajax_load_theme'));
    }
    
    /**
     * Load available themes
     */
    private function load_themes() {
        // Load JSON theme files if they exist
        $theme_dir = plugin_dir_path(__FILE__) . '../includes/themes/';
        
        if (is_dir($theme_dir)) {
            $theme_files = glob($theme_dir . '*.json');
            
            foreach ($theme_files as $file) {
                $theme_data = json_decode(file_get_contents($file), true);
                if ($theme_data && isset($theme_data['theme_id'])) {
                    $this->themes[$theme_data['theme_id']] = $theme_data;
                }
            }
        }
        
        // Add default theme if no themes loaded
        if (empty($this->themes)) {
            $this->themes['default'] = $this->get_default_theme();
        }
    }
    
    /**
     * Get default theme configuration
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
     */
    public function generate_css($theme_id = 'default') {
        $theme = isset($this->themes[$theme_id]) ? $this->themes[$theme_id] : $this->themes['default'];
        $css = ':root {' . PHP_EOL;
        
        // Typography variables
        if (isset($theme['typography'])) {
            $typo = $theme['typography'];
            $css .= '  --gmkb-font-primary: ' . $typo['primary_font']['family'] . ';' . PHP_EOL;
            $css .= '  --gmkb-font-heading: ' . $typo['heading_font']['family'] . ';' . PHP_EOL;
            $css .= '  --gmkb-font-scale: ' . $typo['font_scale'] . ';' . PHP_EOL;
            $css .= '  --gmkb-line-height-body: ' . $typo['line_height']['body'] . ';' . PHP_EOL;
            $css .= '  --gmkb-line-height-heading: ' . $typo['line_height']['heading'] . ';' . PHP_EOL;
            
            // Font sizes
            $base_size = 16;
            $scale = $typo['font_scale'];
            $css .= '  --gmkb-font-size-xs: ' . round($base_size * 0.75) . 'px;' . PHP_EOL;
            $css .= '  --gmkb-font-size-sm: ' . round($base_size * 0.875) . 'px;' . PHP_EOL;
            $css .= '  --gmkb-font-size-base: ' . $base_size . 'px;' . PHP_EOL;
            $css .= '  --gmkb-font-size-lg: ' . round($base_size * $scale) . 'px;' . PHP_EOL;
            $css .= '  --gmkb-font-size-xl: ' . round($base_size * $scale * 1.25) . 'px;' . PHP_EOL;
            $css .= '  --gmkb-font-size-2xl: ' . round($base_size * $scale * 1.5) . 'px;' . PHP_EOL;
            $css .= '  --gmkb-font-size-3xl: ' . round($base_size * $scale * 1.875) . 'px;' . PHP_EOL;
            $css .= '  --gmkb-font-size-4xl: ' . round($base_size * $scale * 2.25) . 'px;' . PHP_EOL;
        }
        
        // Color variables
        if (isset($theme['colors'])) {
            foreach ($theme['colors'] as $key => $value) {
                $var_name = str_replace('_', '-', $key);
                $css .= '  --gmkb-color-' . $var_name . ': ' . $value . ';' . PHP_EOL;
            }
        }
        
        // Spacing variables
        if (isset($theme['spacing'])) {
            foreach ($theme['spacing'] as $key => $value) {
                $var_name = str_replace('_', '-', $key);
                $css .= '  --gmkb-spacing-' . $var_name . ': ' . $value . ';' . PHP_EOL;
            }
            
            // Generate spacing scale
            $base_unit = intval($theme['spacing']['base_unit']);
            for ($i = 1; $i <= 12; $i++) {
                $css .= '  --gmkb-space-' . $i . ': ' . ($base_unit * $i) . 'px;' . PHP_EOL;
            }
        }
        
        // Effects variables
        if (isset($theme['effects'])) {
            foreach ($theme['effects'] as $key => $value) {
                $var_name = str_replace('_', '-', $key);
                $css .= '  --gmkb-' . $var_name . ': ' . $value . ';' . PHP_EOL;
            }
        }
        
        $css .= '}' . PHP_EOL;
        
        // Add component styles using theme variables
        $css .= $this->generate_component_styles();
        
        return $css;
    }
    
    /**
     * Generate component styles using theme variables
     */
    private function generate_component_styles() {
        $css = '
/* Component styles using theme variables */
.gmkb-component {
    font-family: var(--gmkb-font-primary);
    color: var(--gmkb-color-text);
    margin-bottom: var(--gmkb-spacing-component-gap);
}

.gmkb-component h1,
.gmkb-component h2,
.gmkb-component h3,
.gmkb-component h4,
.gmkb-component h5,
.gmkb-component h6 {
    font-family: var(--gmkb-font-heading);
    color: var(--gmkb-color-text);
    line-height: var(--gmkb-line-height-heading);
}

.gmkb-component h1 { font-size: var(--gmkb-font-size-4xl); }
.gmkb-component h2 { font-size: var(--gmkb-font-size-3xl); }
.gmkb-component h3 { font-size: var(--gmkb-font-size-2xl); }
.gmkb-component h4 { font-size: var(--gmkb-font-size-xl); }
.gmkb-component h5 { font-size: var(--gmkb-font-size-lg); }
.gmkb-component h6 { font-size: var(--gmkb-font-size-base); }

.gmkb-component p {
    line-height: var(--gmkb-line-height-body);
    color: var(--gmkb-color-text-light);
}

.gmkb-component a {
    color: var(--gmkb-color-primary);
    transition: var(--gmkb-transitions);
}

.gmkb-component a:hover {
    color: var(--gmkb-color-accent);
}

.gmkb-component .btn-primary {
    background-color: var(--gmkb-color-primary);
    color: var(--gmkb-color-background);
    border-radius: var(--gmkb-border-radius);
    padding: var(--gmkb-space-2) var(--gmkb-space-4);
    transition: var(--gmkb-transitions);
    box-shadow: var(--gmkb-shadow);
}

.gmkb-component .btn-primary:hover {
    background-color: var(--gmkb-color-secondary);
}

/* Section styles */
.gmkb-section {
    padding: var(--gmkb-spacing-section-gap) 0;
    background-color: var(--gmkb-color-background);
}

.gmkb-section--alt {
    background-color: var(--gmkb-color-surface);
}

/* Card styles */
.gmkb-card {
    background-color: var(--gmkb-color-background);
    border: 1px solid var(--gmkb-color-border);
    border-radius: var(--gmkb-border-radius);
    padding: var(--gmkb-space-4);
    box-shadow: var(--gmkb-shadow);
}
';
        
        return $css;
    }
    
    /**
     * Output theme styles in wp_head
     */
    public function output_theme_styles() {
        // Only output on media kit builder pages
        if (!$this->is_media_kit_page()) {
            return;
        }
        
        // Get current theme from user preference or default
        $theme_id = $this->get_current_theme_id();
        $css = $this->generate_css($theme_id);
        
        echo '<style id="gmkb-theme-styles-php">' . $css . '</style>' . PHP_EOL;
    }
    
    /**
     * Get current theme ID
     */
    private function get_current_theme_id() {
        // Check user meta
        $user_id = get_current_user_id();
        if ($user_id) {
            $saved_theme = get_user_meta($user_id, 'gmkb_theme_preference', true);
            if ($saved_theme && isset($this->themes[$saved_theme])) {
                return $saved_theme;
            }
        }
        
        // Check post meta
        $post_id = get_the_ID();
        if ($post_id) {
            $post_theme = get_post_meta($post_id, 'gmkb_theme', true);
            if ($post_theme && isset($this->themes[$post_theme])) {
                return $post_theme;
            }
        }
        
        return 'default';
    }
    
    /**
     * Check if current page is media kit builder
     */
    private function is_media_kit_page() {
        // Check various indicators
        if (is_page('media-kit') || is_page('guestify-media-kit')) {
            return true;
        }
        
        if (isset($_GET['mkcg_id']) || isset($_GET['media_kit_id'])) {
            return true;
        }
        
        global $gmkb_template_active;
        if (!empty($gmkb_template_active)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * AJAX handler to save theme preference
     */
    public function ajax_save_theme() {
        check_ajax_referer('gmkb_nonce', 'nonce');
        
        $theme_id = isset($_POST['theme_id']) ? sanitize_text_field($_POST['theme_id']) : '';
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        
        if (empty($theme_id) || !isset($this->themes[$theme_id])) {
            wp_send_json_error('Invalid theme ID');
            return;
        }
        
        // Save to user meta
        $user_id = get_current_user_id();
        if ($user_id) {
            update_user_meta($user_id, 'gmkb_theme_preference', $theme_id);
        }
        
        // Save to post meta if post ID provided
        if ($post_id > 0) {
            update_post_meta($post_id, 'gmkb_theme', $theme_id);
        }
        
        wp_send_json_success(array(
            'message' => 'Theme saved successfully',
            'theme_id' => $theme_id
        ));
    }
    
    /**
     * AJAX handler to load available themes
     */
    public function ajax_load_theme() {
        $current_theme = $this->get_current_theme_id();
        
        wp_send_json_success(array(
            'themes' => array_values($this->themes),
            'current_theme' => $current_theme
        ));
    }
    
    /**
     * Get available themes for JavaScript
     */
    public function get_themes_for_js() {
        return $this->themes;
    }
}

// Initialize the theme generator
add_action('init', function() {
    GMKB_Theme_Generator::get_instance();
});
