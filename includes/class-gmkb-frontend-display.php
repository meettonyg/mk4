<?php
/**
 * GMKB Frontend Display Class
 *
 * Simplified frontend display using pre-rendered HTML from the builder.
 * All component rendering happens in Vue at save time - no PHP templates needed.
 *
 * @package GMKB
 * @since 3.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Frontend_Display {

    /**
     * Singleton instance
     */
    private static $instance = null;

    /**
     * Theme Discovery instance
     */
    private $theme_discovery;

    /**
     * Theme Generator instance
     */
    private $theme_generator;

    /**
     * Current theme configuration
     */
    private $current_theme = null;

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
        $this->init_dependencies();
        add_shortcode('display_media_kit', array($this, 'render_shortcode'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));
    }

    /**
     * Initialize dependencies
     */
    private function init_dependencies() {
        if (!class_exists('ThemeDiscovery')) {
            require_once GMKB_PLUGIN_DIR . 'system/ThemeDiscovery.php';
        }
        $this->theme_discovery = new ThemeDiscovery(GMKB_PLUGIN_DIR . 'themes');

        if (!class_exists('GMKB_Theme_Generator')) {
            require_once GMKB_PLUGIN_DIR . 'includes/class-theme-generator.php';
        }
        $this->theme_generator = new GMKB_Theme_Generator();
    }

    /**
     * Render the media kit shortcode
     *
     * @param array $atts Shortcode attributes
     * @return string Rendered HTML
     */
    public function render_shortcode($atts) {
        $atts = shortcode_atts(array(
            'id' => 0,
            'class' => '',
            'responsive' => 'true'
        ), $atts, 'display_media_kit');

        $post_id = $atts['id'] ? intval($atts['id']) : get_the_ID();

        if (!$post_id) {
            return '<div class="gmkb-error">No media kit ID specified</div>';
        }

        // Get pre-rendered HTML (saved from Vue builder)
        $pre_rendered_html = get_post_meta($post_id, 'gmkb_rendered_html', true);

        if (empty($pre_rendered_html)) {
            // Check if state exists but HTML wasn't captured
            $state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
            $has_state = !empty($state);
            $component_count = is_array($state) && isset($state['components']) ? count($state['components']) : 0;

            return '<div class="gmkb-error" style="padding: 40px; text-align: center; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; margin: 20px;">' .
                '<h3 style="color: #dc2626; margin: 0 0 10px;">Media Kit Needs Re-Save</h3>' .
                '<p style="color: #7f1d1d; margin: 0;">This media kit needs to be opened and saved in the builder to display.</p>' .
                '<p style="color: #991b1b; font-size: 12px; margin-top: 10px;">Debug: State exists: ' . ($has_state ? 'Yes' : 'No') . ', Components: ' . $component_count . '</p>' .
                '</div>';
        }

        // Load state for theme information
        $state = get_post_meta($post_id, 'gmkb_media_kit_state', true);

        // Get theme ID from state
        $theme_id = $state['theme'] ?? $state['globalSettings']['theme'] ?? 'professional_clean';
        $this->current_theme = $this->load_theme($theme_id);

        // Get theme customizations
        $theme_customizations = $state['themeCustomizations'] ?? array();

        // Build wrapper classes
        $wrapper_classes = array(
            'gmkb-frontend-display',
            'gmkb-theme--' . ($this->current_theme['theme_id'] ?? 'professional_clean')
        );

        if ($atts['class']) {
            $wrapper_classes[] = esc_attr($atts['class']);
        }

        if ($atts['responsive'] === 'true') {
            $wrapper_classes[] = 'gmkb-responsive';
        }

        ob_start();
        ?>
        <div class="<?php echo implode(' ', $wrapper_classes); ?>"
             data-media-kit-id="<?php echo esc_attr($post_id); ?>"
             data-gmkb-theme="<?php echo esc_attr($theme_id); ?>"
             data-gmkb-post-id="<?php echo esc_attr($post_id); ?>">

            <?php $this->inject_theme_css($theme_customizations, $post_id); ?>
            <?php $this->inject_component_css($post_id); ?>

            <div class="gmkb-prerendered-content">
                <?php echo $pre_rendered_html; ?>
            </div>

        </div>
        <?php

        return ob_get_clean();
    }

    /**
     * Render media kit from template (called by mediakit-frontend-template.php)
     *
     * @param array $state Media kit state
     * @param int $post_id Post ID
     * @param string|null $theme_id Optional theme ID
     */
    public function render_media_kit_template($state, $post_id, $theme_id = null) {
        // Get pre-rendered HTML
        $pre_rendered_html = get_post_meta($post_id, 'gmkb_rendered_html', true);

        if (empty($pre_rendered_html)) {
            $component_count = is_array($state) && isset($state['components']) ? count($state['components']) : 0;
            ?>
            <div class="gmkb-error" style="padding: 40px; text-align: center; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; margin: 20px;">
                <h3 style="color: #dc2626; margin: 0 0 10px;">Media Kit Needs Re-Save</h3>
                <p style="color: #7f1d1d; margin: 0;">This media kit needs to be opened and saved in the builder to display.</p>
                <p style="color: #991b1b; font-size: 12px; margin-top: 10px;">Debug: Components in state: <?php echo $component_count; ?></p>
            </div>
            <?php
            return;
        }

        // Load theme
        $theme_id = $theme_id ?? $state['theme'] ?? 'professional_clean';
        $this->current_theme = $this->load_theme($theme_id);

        // Get theme customizations
        $theme_customizations = $state['themeCustomizations'] ?? array();

        // Build wrapper classes
        $wrapper_classes = array(
            'gmkb-frontend-display',
            'gmkb-theme--' . ($this->current_theme['theme_id'] ?? 'professional_clean'),
            'gmkb-responsive'
        );
        ?>
        <div class="<?php echo implode(' ', $wrapper_classes); ?>"
             data-media-kit-id="<?php echo esc_attr($post_id); ?>"
             data-gmkb-theme="<?php echo esc_attr($theme_id); ?>"
             data-gmkb-post-id="<?php echo esc_attr($post_id); ?>">

            <?php $this->inject_theme_css($theme_customizations, $post_id); ?>
            <?php $this->inject_component_css($post_id); ?>

            <div class="gmkb-prerendered-content">
                <?php echo $pre_rendered_html; ?>
            </div>

        </div>
        <?php
    }

    /**
     * Inject component-specific CSS
     *
     * Component CSS is generated by Vue's ComponentStyleService during save
     * and stored in gmkb_rendered_css. This CSS handles:
     * - Background colors
     * - Typography overrides
     * - Spacing (padding/margin)
     * - Borders and effects
     *
     * @param int $post_id Post ID
     */
    private function inject_component_css($post_id) {
        $component_css = get_post_meta($post_id, 'gmkb_rendered_css', true);

        if (empty($component_css)) {
            return;
        }
        ?>
        <style id="gmkb-component-styles-<?php echo esc_attr($post_id); ?>">
            <?php echo $component_css; // Already sanitized during save ?>
        </style>
        <?php
    }

    /**
     * Inject theme CSS variables
     *
     * @param array $customizations Theme customizations
     * @param int $post_id Post ID
     */
    private function inject_theme_css($customizations, $post_id) {
        $theme = $this->current_theme ?: $this->get_minimal_theme_config();

        // Build base CSS variables from theme
        $css_vars = $this->build_theme_css_vars($theme);

        // Build customization overrides
        $custom_vars = $this->build_customization_css_vars($customizations);
        ?>
        <style id="gmkb-theme-vars-<?php echo esc_attr($post_id); ?>">
            :root {
                <?php foreach ($css_vars as $var_name => $var_value): ?>
                <?php echo esc_attr($var_name) . ': ' . $var_value . ';'; ?>
                <?php endforeach; ?>
            }
            <?php if (!empty($custom_vars)): ?>
            .gmkb-frontend-display[data-gmkb-post-id="<?php echo esc_attr($post_id); ?>"] {
                <?php foreach ($custom_vars as $var_name => $var_value): ?>
                <?php echo esc_attr($var_name) . ': ' . $var_value . ' !important;'; ?>
                <?php endforeach; ?>
            }
            <?php endif; ?>
        </style>
        <?php
    }

    /**
     * Build CSS variables from theme configuration
     *
     * @param array $theme Theme configuration
     * @return array CSS variables
     */
    private function build_theme_css_vars($theme) {
        $css_vars = array();

        // Colors
        if (!empty($theme['colors'])) {
            foreach ($theme['colors'] as $key => $value) {
                $css_key = strtolower(preg_replace('/([A-Z])/', '-$1', $key));
                $css_vars['--gmkb-color-' . $css_key] = trim($value, '\'" ');
            }
        }

        // Typography
        $typo = $theme['typography'] ?? array();
        $primary_font = $typo['fontFamily'] ?? $typo['primary_font']['family'] ?? "'Inter', sans-serif";
        $heading_font = $typo['headingFamily'] ?? $typo['heading_font']['family'] ?? $primary_font;

        $css_vars['--gmkb-font-primary'] = trim($primary_font, '\'" ');
        $css_vars['--gmkb-font-heading'] = trim($heading_font, '\'" ');

        $base_size = $typo['baseFontSize'] ?? 16;
        $css_vars['--gmkb-font-size-base'] = $base_size . 'px';
        $css_vars['--gmkb-font-size-sm'] = ($base_size * 0.875) . 'px';
        $css_vars['--gmkb-font-size-lg'] = ($base_size * 1.125) . 'px';
        $css_vars['--gmkb-font-size-xl'] = ($base_size * 1.25) . 'px';
        $css_vars['--gmkb-font-size-2xl'] = ($base_size * 1.5) . 'px';
        $css_vars['--gmkb-font-size-3xl'] = ($base_size * 1.875) . 'px';
        $css_vars['--gmkb-line-height'] = $typo['lineHeight'] ?? 1.6;

        // Spacing
        $spacing = $theme['spacing'] ?? array();
        $unit = $spacing['baseUnit'] ?? 8;

        $css_vars['--gmkb-spacing-xs'] = ($unit * 0.5) . 'px';
        $css_vars['--gmkb-spacing-sm'] = ($unit * 0.75) . 'px';
        $css_vars['--gmkb-spacing-md'] = $unit . 'px';
        $css_vars['--gmkb-spacing-lg'] = ($unit * 1.5) . 'px';
        $css_vars['--gmkb-spacing-xl'] = ($unit * 2) . 'px';
        $css_vars['--gmkb-spacing-2xl'] = ($unit * 3) . 'px';
        $css_vars['--gmkb-spacing-component-gap'] = ($spacing['componentGap'] ?? 48) . 'px';
        $css_vars['--gmkb-spacing-section-padding'] = ($spacing['sectionPadding'] ?? 96) . 'px';
        $css_vars['--gmkb-container-max-width'] = ($spacing['containerMaxWidth'] ?? 1200) . 'px';

        // Effects
        $effects = $theme['effects'] ?? array();
        $radius = $effects['borderRadius'] ?? '12px';
        $css_vars['--gmkb-border-radius'] = trim($radius, '\'" ');
        $css_vars['--gmkb-border-radius-sm'] = 'calc(' . trim($radius, '\'" ') . ' * 0.5)';
        $css_vars['--gmkb-border-radius-lg'] = 'calc(' . trim($radius, '\'" ') . ' * 1.5)';

        $shadows = array(
            'none' => 'none',
            'subtle' => '0 1px 3px rgba(0, 0, 0, 0.1)',
            'medium' => '0 4px 6px rgba(0, 0, 0, 0.1)',
            'strong' => '0 10px 25px rgba(0, 0, 0, 0.15)'
        );
        $intensity = $effects['shadowIntensity'] ?? 'medium';
        $css_vars['--gmkb-shadow'] = $shadows[$intensity] ?? $shadows['medium'];

        $speeds = array('none' => '0ms', 'fast' => '150ms', 'normal' => '300ms', 'slow' => '500ms');
        $speed = $effects['animationSpeed'] ?? 'normal';
        $css_vars['--gmkb-transition-speed'] = $speeds[$speed] ?? $speeds['normal'];

        return $css_vars;
    }

    /**
     * Build CSS variables from user customizations
     *
     * @param array|object $customizations User customizations
     * @return array CSS variables
     */
    private function build_customization_css_vars($customizations) {
        $css_vars = array();

        if (empty($customizations)) {
            return $css_vars;
        }

        // Convert stdClass to array
        if (is_object($customizations)) {
            $customizations = json_decode(json_encode($customizations), true);
        }

        // Colors
        if (!empty($customizations['colors'])) {
            foreach ($customizations['colors'] as $key => $value) {
                if (!empty($value)) {
                    $css_key = strtolower(preg_replace('/([A-Z])/', '-$1', $key));
                    $css_vars['--gmkb-color-' . $css_key] = trim($value, '\'" ');
                }
            }
        }

        // Typography
        if (!empty($customizations['typography'])) {
            $typo = $customizations['typography'];
            if (!empty($typo['fontFamily'])) {
                $css_vars['--gmkb-font-primary'] = trim($typo['fontFamily'], '\'" ');
            }
            if (!empty($typo['headingFamily'])) {
                $css_vars['--gmkb-font-heading'] = trim($typo['headingFamily'], '\'" ');
            }
            if (!empty($typo['baseFontSize'])) {
                $css_vars['--gmkb-font-size-base'] = $typo['baseFontSize'] . 'px';
            }
        }

        // Spacing
        if (!empty($customizations['spacing'])) {
            $spacing = $customizations['spacing'];
            if (!empty($spacing['componentGap'])) {
                $css_vars['--gmkb-spacing-component-gap'] = $spacing['componentGap'] . 'px';
            }
            if (!empty($spacing['sectionPadding'])) {
                $css_vars['--gmkb-spacing-section-padding'] = $spacing['sectionPadding'] . 'px';
            }
        }

        // Effects
        if (!empty($customizations['effects'])) {
            $effects = $customizations['effects'];
            if (!empty($effects['borderRadius'])) {
                $css_vars['--gmkb-border-radius'] = trim($effects['borderRadius'], '\'" ');
            }
        }

        return $css_vars;
    }

    /**
     * Load theme configuration
     *
     * @param string $theme_id Theme ID
     * @return array Theme configuration
     */
    private function load_theme($theme_id) {
        $theme = $this->theme_discovery->getTheme($theme_id);

        if ($theme) {
            return $theme;
        }

        // Check for custom theme
        $custom_theme = get_option('gmkb_custom_theme_' . $theme_id);
        if ($custom_theme) {
            return $custom_theme;
        }

        // Fallback to default
        $fallback = $this->theme_discovery->getTheme('professional_clean');
        return $fallback ?: $this->get_minimal_theme_config();
    }

    /**
     * Get minimal fallback theme configuration
     *
     * @return array Minimal theme
     */
    private function get_minimal_theme_config() {
        return array(
            'theme_id' => 'fallback',
            'theme_name' => 'Fallback Theme',
            'colors' => array(
                'primary' => '#3b82f6',
                'text' => '#1f2937',
                'background' => '#ffffff',
                'surface' => '#f9fafb',
                'border' => '#e5e7eb'
            ),
            'typography' => array(
                'fontFamily' => 'system-ui, sans-serif',
                'headingFamily' => 'system-ui, sans-serif',
                'baseFontSize' => 16,
                'lineHeight' => 1.6
            ),
            'spacing' => array(
                'baseUnit' => 8,
                'componentGap' => 24,
                'sectionPadding' => 48
            ),
            'effects' => array(
                'borderRadius' => '8px',
                'shadowIntensity' => 'medium',
                'animationSpeed' => 'normal'
            )
        );
    }

    /**
     * Enqueue frontend assets
     */
    public function enqueue_frontend_assets() {
        if (!is_singular()) {
            return;
        }

        $post_id = get_the_ID();
        $pre_rendered = get_post_meta($post_id, 'gmkb_rendered_html', true);

        if (empty($pre_rendered)) {
            return;
        }

        // Enqueue frontend CSS
        if (file_exists(GMKB_PLUGIN_DIR . 'dist/gmkb.css')) {
            wp_enqueue_style(
                'gmkb-frontend',
                GMKB_PLUGIN_URL . 'dist/gmkb.css',
                array(),
                filemtime(GMKB_PLUGIN_DIR . 'dist/gmkb.css')
            );
        }
    }
}
