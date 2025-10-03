<?php
/**
 * GMKB Frontend Display Class
 * 
 * Enhanced frontend display with theme support, section rendering, and performance optimization
 * 
 * @package GMKB
 * @since 2.1.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Frontend_Display {
    
    /**
     * Instance
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
     * Component Discovery instance
     */
    private $component_discovery;
    
    /**
     * Current theme configuration
     */
    private $current_theme = null;
    
    /**
     * Generated theme CSS cache
     */
    private $theme_css_cache = array();
    
    /**
     * Get instance
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
        // Initialize dependencies
        $this->init_dependencies();
        
        // Register shortcode
        add_shortcode('display_media_kit', array($this, 'render_shortcode'));
        
        // Register AJAX handlers for dynamic component loading
        add_action('wp_ajax_gmkb_render_frontend_component', array($this, 'ajax_render_component'));
        add_action('wp_ajax_nopriv_gmkb_render_frontend_component', array($this, 'ajax_render_component'));
        
        // Enqueue frontend assets
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));
        
        // Add support for theme CSS caching
        add_action('init', array($this, 'setup_css_cache'));
    }
    
    /**
     * Initialize dependencies
     */
    private function init_dependencies() {
        // Initialize Theme Discovery
        if (!class_exists('ThemeDiscovery')) {
            require_once GMKB_PLUGIN_DIR . 'system/ThemeDiscovery.php';
        }
        $this->theme_discovery = new ThemeDiscovery(GMKB_PLUGIN_DIR . 'themes');
        
        // Initialize Theme Generator
        if (!class_exists('GMKB_Theme_Generator')) {
            require_once GMKB_PLUGIN_DIR . 'includes/class-theme-generator.php';
        }
        $this->theme_generator = new GMKB_Theme_Generator();
        
        // Get Component Discovery from global if available
        global $gmkb_component_discovery;
        if ($gmkb_component_discovery) {
            $this->component_discovery = $gmkb_component_discovery;
        } else {
            // Initialize if not available
            if (!class_exists('ComponentDiscovery')) {
                require_once GMKB_PLUGIN_DIR . 'system/ComponentDiscovery.php';
            }
            $this->component_discovery = new ComponentDiscovery(GMKB_PLUGIN_DIR . 'components');
        }
    }
    
    /**
     * Setup CSS cache for themes
     */
    public function setup_css_cache() {
        // Register dynamic CSS endpoint
        add_rewrite_rule(
            'gmkb-theme-css/([^/]+)/?$',
            'index.php?gmkb_theme_css=$matches[1]',
            'top'
        );
        
        add_filter('query_vars', function($vars) {
            $vars[] = 'gmkb_theme_css';
            return $vars;
        });
        
        add_action('template_redirect', array($this, 'serve_theme_css'));
    }
    
    /**
     * Serve cached theme CSS
     */
    public function serve_theme_css() {
        $theme_id = get_query_var('gmkb_theme_css');
        if (!$theme_id) {
            return;
        }
        
        // Get cached CSS
        $cache_key = 'gmkb_theme_css_' . $theme_id;
        $css = get_transient($cache_key);
        
        if (!$css) {
            // Generate CSS
            $theme = $this->load_theme($theme_id);
            if ($theme) {
                $css = $this->generate_theme_css($theme);
                // Cache for 1 hour
                set_transient($cache_key, $css, HOUR_IN_SECONDS);
            }
        }
        
        if ($css) {
            header('Content-Type: text/css');
            header('Cache-Control: public, max-age=3600');
            echo $css;
            exit;
        }
    }
    
    /**
     * Render media kit template directly (for custom post type templates)
     * 
     * @param array $state Media kit state
     * @param int $post_id Post ID
     * @param string $theme_id Theme ID
     */
    public function render_media_kit_template($state, $post_id, $theme_id = null) {
        // Apply Pods data enrichment
        $state = apply_filters('gmkb_load_media_kit_state', $state, $post_id);
        
        // Load theme
        $theme_id = $theme_id ?: ($state['globalSettings']['theme'] ?? 'professional_clean');
        $this->current_theme = $this->load_theme($theme_id);
        
        // Enqueue necessary assets
        $this->enqueue_template_assets();
        
        // Render media kit
        $atts = array(
            'responsive' => 'true',
            'lazy_load' => 'true',
            'section_animation' => 'fade',
            'class' => 'gmkb-template-render'
        );
        
        $this->render_media_kit($state, $post_id, $atts);
    }
    
    /**
     * Enqueue assets for template rendering
     */
    private function enqueue_template_assets() {
        // ROOT FIX: Use design system (single source of truth)
        $design_system_path = GMKB_PLUGIN_DIR . 'design-system/index.css';
        if (file_exists($design_system_path)) {
            $design_system_version = filemtime($design_system_path);
            $design_system_url = GMKB_PLUGIN_URL . 'design-system/index.css';
            wp_enqueue_style('gmkb-design-system', $design_system_url, array(), $design_system_version);
            wp_print_styles('gmkb-design-system');
        }
        
        // Optional: Print any JS needed
        wp_print_scripts('gmkb-frontend-lazy');
        wp_print_scripts('gmkb-frontend-animations');
    }
    
    /**
     * Render shortcode
     * 
     * @param array $atts Shortcode attributes
     * @return string Rendered HTML
     */
    public function render_shortcode($atts) {
        // Parse attributes
        $atts = shortcode_atts(array(
            'id' => 0,
            'theme' => '',
            'class' => '',
            'responsive' => 'true',
            'lazy_load' => 'true',
            'section_animation' => 'fade',
            'cache' => 'true'
        ), $atts, 'display_media_kit');
        
        // Get post ID
        $post_id = $atts['id'] ? intval($atts['id']) : get_the_ID();
        
        if (!$post_id) {
            return '<div class="gmkb-error">No media kit ID specified</div>';
        }
        
        // Check cache if enabled
        if ($atts['cache'] === 'true') {
            $cache_key = 'gmkb_frontend_' . $post_id . '_' . md5(serialize($atts));
            $cached_html = get_transient($cache_key);
            
            if ($cached_html !== false) {
                return $cached_html;
            }
        }
        
        // Load media kit state
        $state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        
        if (empty($state)) {
            return '<div class="gmkb-error">Media kit not found</div>';
        }
        
        // Apply Pods data enrichment
        $state = apply_filters('gmkb_load_media_kit_state', $state, $post_id);
        
        // Load theme
        $theme_id = $atts['theme'] ?: ($state['globalSettings']['theme'] ?? 'professional_clean');
        $this->current_theme = $this->load_theme($theme_id);
        
        // Start output buffering
        ob_start();
        
        // Render media kit
        $this->render_media_kit($state, $post_id, $atts);
        
        $html = ob_get_clean();
        
        // Cache if enabled
        if ($atts['cache'] === 'true') {
            set_transient($cache_key, $html, 15 * MINUTE_IN_SECONDS);
        }
        
        return $html;
    }
    
    /**
     * Render media kit
     * 
     * @param array $state Media kit state
     * @param int $post_id Post ID
     * @param array $atts Attributes
     */
    private function render_media_kit($state, $post_id, $atts) {
        // Get theme customizations
        $theme_customizations = get_post_meta($post_id, 'gmkb_theme_customizations', true) ?: array();
        $theme_id = $atts['theme'] ?: ($state['globalSettings']['theme'] ?? 'professional_clean');
        $sections = $state['sections'] ?? array();
        $components = $state['components'] ?? array();
        $layout = $state['layout'] ?? array();
        $saved_components = $state['saved_components'] ?? array();
        
        // Build component order
        $ordered_components = $this->get_ordered_components($state);
        
        // Render wrapper
        $wrapper_classes = array(
            'gmkb-frontend-display',
            'gmkb-theme--' . $this->current_theme['theme_id']
        );
        
        if ($atts['class']) {
            $wrapper_classes[] = esc_attr($atts['class']);
        }
        
        if ($atts['responsive'] === 'true') {
            $wrapper_classes[] = 'gmkb-responsive';
        }
        
        ?>
        <div class="<?php echo implode(' ', $wrapper_classes); ?>" 
             data-media-kit-id="<?php echo esc_attr($post_id); ?>"
             data-gmkb-theme="<?php echo esc_attr($theme_id); ?>"
             data-gmkb-post-id="<?php echo esc_attr($post_id); ?>">
            
            <?php
            // Inject theme customizations as inline CSS
            $this->render_theme_customizations($theme_customizations, $post_id);
            ?>
            
            <?php if (!empty($sections)): ?>
                <?php $this->render_sections($sections, $components, $post_id, $atts); ?>
            <?php else: ?>
                <?php $this->render_components($ordered_components, $post_id, $atts); ?>
            <?php endif; ?>
            
        </div>
        
        <?php
        // Add inline theme CSS
        $this->add_inline_theme_css();
    }
    
    /**
     * Render sections with components
     * 
     * @param array $sections Sections array
     * @param array $components Components map
     * @param int $post_id Post ID
     * @param array $atts Attributes
     */
    private function render_sections($sections, $components, $post_id, $atts) {
        foreach ($sections as $section) {
            $section_id = $section['section_id'] ?? 'section-' . uniqid();
            // ROOT FIX: Check both 'section_type' and 'type' keys
            $section_type = $section['section_type'] ?? $section['type'] ?? $section['layout'] ?? 'full_width';
            $section_components = $section['components'] ?? array();
            $section_styles = $section['styles'] ?? array();
            
            // Build section classes
            $section_classes = array(
                'gmkb-section',
                'gmkb-section--' . $section_type
            );
            
            if ($atts['section_animation'] !== 'none') {
                $section_classes[] = 'gmkb-animate';
                $section_classes[] = 'gmkb-animate--' . $atts['section_animation'];
            }
            
            // Build section styles
            $section_style = $this->build_section_styles($section_styles);
            
            ?>
            <section class="<?php echo implode(' ', $section_classes); ?>"
                     data-section-id="<?php echo esc_attr($section_id); ?>"
                     data-section-type="<?php echo esc_attr($section_type); ?>"
                     <?php if ($section_style): ?>style="<?php echo esc_attr($section_style); ?>"<?php endif; ?>>
                
                <div class="gmkb-section__inner">
                    <?php 
                    // ROOT FIX: For multi-column layouts, check for 'columns' key first
                    switch ($section_type) {
                        case 'two_column':
                            // Pass columns data if it exists, otherwise components
                            $section_data = isset($section['columns']) ? $section['columns'] : $section_components;
                            $this->render_two_column_section($section_data, $components, $post_id, $atts);
                            break;
                        case 'three_column':
                            // Pass columns data if it exists, otherwise components
                            $section_data = isset($section['columns']) ? $section['columns'] : $section_components;
                            $this->render_three_column_section($section_data, $components, $post_id, $atts);
                            break;
                        default:
                            $this->render_full_width_section($section_components, $components, $post_id, $atts);
                    }
                    ?>
                </div>
            </section>
            <?php
        }
    }
    
    /**
     * Render full width section
     */
    private function render_full_width_section($section_components, $components, $post_id, $atts) {
        ?>
        <div class="gmkb-section__content">
            <?php
            // ROOT FIX: Handle both string IDs and array refs
            foreach ($section_components as $comp_ref) {
                if (is_string($comp_ref)) {
                    $component_id = $comp_ref;
                } elseif (is_array($comp_ref)) {
                    $component_id = $comp_ref['component_id'] ?? null;
                } else {
                    $component_id = null;
                }
                if ($component_id && isset($components[$component_id])) {
                    $this->render_component($components[$component_id], $component_id, $post_id, $atts);
                }
            }
            ?>
        </div>
        <?php
    }
    
    /**
     * Render two column section
     */
    private function render_two_column_section($section_components, $components, $post_id, $atts) {
        // ROOT FIX: Handle both formats - columns object OR flat array
        $columns = array(1 => array(), 2 => array());
        
        // Check if we have a 'columns' key in the section (Vue format)
        if (is_array($section_components) && isset($section_components['1']) && isset($section_components['2'])) {
            // Vue saves as: columns: {1: [...], 2: [...], 3: [...]}
            $columns[1] = $section_components['1'] ?? array();
            $columns[2] = $section_components['2'] ?? array();
        } else {
            // Legacy format: flat array with column property
            foreach ($section_components as $comp_ref) {
                $column = is_array($comp_ref) ? ($comp_ref['column'] ?? 1) : 1;
                $columns[$column][] = $comp_ref;
            }
        }
        
        ?>
        <div class="gmkb-section__columns gmkb-section__columns--2">
            <?php for ($col = 1; $col <= 2; $col++): ?>
                <div class="gmkb-section__column" data-column="<?php echo $col; ?>">
                    <?php
                    foreach ($columns[$col] as $comp_ref) {
                        // ROOT FIX: Handle both string and array format
                        if (is_string($comp_ref)) {
                            $component_id = $comp_ref;
                        } elseif (is_array($comp_ref)) {
                            $component_id = $comp_ref['component_id'] ?? null;
                        } else {
                            $component_id = null;
                        }
                        if ($component_id && isset($components[$component_id])) {
                            $this->render_component($components[$component_id], $component_id, $post_id, $atts);
                        }
                    }
                    ?>
                </div>
            <?php endfor; ?>
        </div>
        <?php
    }
    
    /**
     * Render three column section
     */
    private function render_three_column_section($section_components, $components, $post_id, $atts) {
        // ROOT FIX: Handle both formats - columns object OR flat array
        $columns = array(1 => array(), 2 => array(), 3 => array());
        
        // Check if we have a 'columns' key in the section (Vue format)
        if (is_array($section_components) && isset($section_components['1'])) {
            // Vue saves as: columns: {1: [...], 2: [...], 3: [...]}
            $columns[1] = $section_components['1'] ?? array();
            $columns[2] = $section_components['2'] ?? array();
            $columns[3] = $section_components['3'] ?? array();
        } else {
            // Legacy format: flat array with column property
            foreach ($section_components as $comp_ref) {
                $column = is_array($comp_ref) ? ($comp_ref['column'] ?? 1) : 1;
                $columns[$column][] = $comp_ref;
            }
        }
        
        ?>
        <div class="gmkb-section__columns gmkb-section__columns--3">
            <?php for ($col = 1; $col <= 3; $col++): ?>
                <div class="gmkb-section__column" data-column="<?php echo $col; ?>">
                    <?php
                    foreach ($columns[$col] as $comp_ref) {
                        // ROOT FIX: Handle both string and array format
                        if (is_string($comp_ref)) {
                            $component_id = $comp_ref;
                        } elseif (is_array($comp_ref)) {
                            $component_id = $comp_ref['component_id'] ?? null;
                        } else {
                            $component_id = null;
                        }
                        if ($component_id && isset($components[$component_id])) {
                            $this->render_component($components[$component_id], $component_id, $post_id, $atts);
                        }
                    }
                    ?>
                </div>
            <?php endfor; ?>
        </div>
        <?php
    }
    
    /**
     * Render components without sections
     */
    private function render_components($components, $post_id, $atts) {
        ?>
        <div class="gmkb-components">
            <?php
            foreach ($components as $component) {
                $component_id = $component['id'] ?? 'comp-' . uniqid();
                $this->render_component($component, $component_id, $post_id, $atts);
            }
            ?>
        </div>
        <?php
    }
    
    /**
     * Render single component (includes user customizations)
     * 
     * @param array $component Component data
     * @param string $component_id Component ID
     * @param int $post_id Post ID
     * @param array $atts Attributes
     */
    private function render_component($component, $component_id, $post_id, $atts) {
        $component_type = $component['type'] ?? 'unknown';
        $component_data = $component['data'] ?? array();
        $component_props = $component['props'] ?? array();
        $component_settings = $component['settings'] ?? array();
        
        // Build inline styles from component settings (user customizations)
        $inline_styles = $this->build_component_inline_styles($component_settings);
        
        // Component classes
        $component_classes = array(
            'gmkb-component',
            'gmkb-component--' . $component_type
        );
        
        if ($atts['lazy_load'] === 'true') {
            $component_classes[] = 'gmkb-lazy';
        }
        
        if (!empty($component_settings['customClass'])) {
            $component_classes[] = sanitize_html_class($component_settings['customClass']);
        }
        
        ?>
        <div class="<?php echo implode(' ', $component_classes); ?>"
             id="<?php echo esc_attr($component_id); ?>"
             data-component-id="<?php echo esc_attr($component_id); ?>"
             data-component-type="<?php echo esc_attr($component_type); ?>"
             <?php if ($inline_styles): ?>style="<?php echo esc_attr($inline_styles); ?>"<?php endif; ?>>
            
            <?php
            // Inject custom CSS if provided
            if (!empty($component_settings['customCSS'])) {
                $this->render_component_custom_css($component_id, $component_settings['customCSS']);
            }
            ?>
            
            <?php
            // ROOT FIX: Merge data and props - props take precedence
            $merged_data = array_merge($component_data, $component_props);
            
            // Load component template with merged data
            $this->load_component_template($component_type, array_merge($merged_data, array(
                'component_id' => $component_id,
                'post_id' => $post_id,
                'data' => $component_data,
                'is_frontend' => true,
                'theme' => $this->current_theme
            )));
            ?>
            
        </div>
        <?php
    }
    
    /**
     * Load component template
     * 
     * @param string $component_type Component type
     * @param array $props Component props
     */
    private function load_component_template($component_type, $props) {
        // Check for frontend-specific template first
        $frontend_template = GMKB_PLUGIN_DIR . "components/{$component_type}/frontend-template.php";
        $template = GMKB_PLUGIN_DIR . "components/{$component_type}/template.php";
        
        if (file_exists($frontend_template)) {
            $template_file = $frontend_template;
        } elseif (file_exists($template)) {
            $template_file = $template;
        } else {
            echo $this->render_component_fallback($component_type, $props);
            return;
        }
        
        // Extract props as variables for template
        extract($props, EXTR_SKIP);
        
        // Include template
        include $template_file;
    }
    
    /**
     * Render component fallback
     */
    private function render_component_fallback($type, $props) {
        $data = $props['data'] ?? array();
        
        ob_start();
        ?>
        <div class="gmkb-component-fallback">
            <div class="gmkb-component-fallback__header">
                <h3><?php echo esc_html(ucwords(str_replace('-', ' ', $type))); ?></h3>
            </div>
            <div class="gmkb-component-fallback__content">
                <?php if (!empty($data)): ?>
                    <pre><?php echo esc_html(json_encode($data, JSON_PRETTY_PRINT)); ?></pre>
                <?php else: ?>
                    <p>No data available for this component.</p>
                <?php endif; ?>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Get ordered components
     */
    private function get_ordered_components($state) {
        $components = array();
        
        // First try saved_components
        if (!empty($state['saved_components'])) {
            return $state['saved_components'];
        }
        
        // Then try layout order
        if (!empty($state['layout']) && !empty($state['components'])) {
            foreach ($state['layout'] as $component_id) {
                if (isset($state['components'][$component_id])) {
                    $component = $state['components'][$component_id];
                    $component['id'] = $component_id;
                    $components[] = $component;
                }
            }
            return $components;
        }
        
        // Fallback to all components
        if (!empty($state['components'])) {
            foreach ($state['components'] as $id => $component) {
                $component['id'] = $id;
                $components[] = $component;
            }
        }
        
        return $components;
    }
    
    /**
     * Load theme configuration
     * 
     * @param string $theme_id Theme ID
     * @return array Theme configuration
     */
    private function load_theme($theme_id) {
        // First check if theme exists in discovery
        $theme = $this->theme_discovery->getTheme($theme_id);
        
        if (!$theme) {
            // Check for custom theme
            $custom_theme = get_option('gmkb_custom_theme_' . $theme_id);
            if ($custom_theme) {
                return $custom_theme;
            }
            
            // Fallback to default
            $theme = $this->theme_discovery->getTheme('professional_clean');
        }
        
        return $theme;
    }
    
    /**
     * Generate theme CSS
     * 
     * @param array $theme Theme configuration
     * @return string CSS
     */
    private function generate_theme_css($theme) {
        // Check cache first
        if (isset($this->theme_css_cache[$theme['theme_id']])) {
            return $this->theme_css_cache[$theme['theme_id']];
        }
        
        // Use theme generator to create CSS
        $css = $this->theme_generator->generate_theme_css($theme);
        
        // Cache it
        $this->theme_css_cache[$theme['theme_id']] = $css;
        
        return $css;
    }
    
    /**
     * Render theme customizations as inline CSS
     * 
     * @param array $customizations User customizations
     * @param int $post_id Post ID
     */
    private function render_theme_customizations($customizations, $post_id) {
        if (empty($customizations)) {
            return;
        }
        
        ?>
        <style id="gmkb-theme-customizations-<?php echo esc_attr($post_id); ?>">
            /* User's custom theme overrides */
            [data-gmkb-post-id="<?php echo esc_attr($post_id); ?>"] {
                <?php
                // Color overrides
                if (!empty($customizations['colors'])) {
                    foreach ($customizations['colors'] as $key => $value) {
                        if ($value) {
                            echo '--gmkb-color-' . esc_attr($key) . ': ' . esc_attr($value) . ';';
                        }
                    }
                }
                
                // Typography overrides
                if (!empty($customizations['typography'])) {
                    if (!empty($customizations['typography']['fontFamily'])) {
                        echo '--gmkb-font-primary: ' . esc_attr($customizations['typography']['fontFamily']) . ';';
                    }
                    if (!empty($customizations['typography']['headingFont'])) {
                        echo '--gmkb-font-heading: ' . esc_attr($customizations['typography']['headingFont']) . ';';
                    }
                    if (!empty($customizations['typography']['fontSize'])) {
                        echo '--gmkb-font-size-base: ' . esc_attr($customizations['typography']['fontSize']) . 'px;';
                    }
                    if (!empty($customizations['typography']['lineHeight'])) {
                        echo '--gmkb-line-height-base: ' . esc_attr($customizations['typography']['lineHeight']) . ';';
                    }
                }
                
                // Spacing overrides
                if (!empty($customizations['spacing'])) {
                    if (!empty($customizations['spacing']['sectionGap'])) {
                        echo '--gmkb-section-gap: ' . esc_attr($customizations['spacing']['sectionGap']) . 'px;';
                    }
                    if (!empty($customizations['spacing']['componentGap'])) {
                        echo '--gmkb-component-gap: ' . esc_attr($customizations['spacing']['componentGap']) . 'px;';
                    }
                    if (!empty($customizations['spacing']['containerPadding'])) {
                        echo '--gmkb-container-padding: ' . esc_attr($customizations['spacing']['containerPadding']) . 'px;';
                    }
                }
                
                // Effects overrides
                if (!empty($customizations['effects'])) {
                    if (isset($customizations['effects']['borderRadius'])) {
                        echo '--gmkb-radius-base: ' . esc_attr($customizations['effects']['borderRadius']) . 'px;';
                        echo '--gmkb-radius-lg: ' . esc_attr($customizations['effects']['borderRadius'] * 2) . 'px;';
                    }
                    if (!empty($customizations['effects']['boxShadow'])) {
                        echo '--gmkb-shadow-base: ' . esc_attr($customizations['effects']['boxShadow']) . ';';
                    }
                }
                ?>
            }
        </style>
        <?php
    }
    
    /**
     * Add inline theme CSS
     */
    private function add_inline_theme_css() {
        if (!$this->current_theme) {
            return;
        }
        
        $css = $this->generate_theme_css($this->current_theme);
        
        if ($css) {
            ?>
            <style id="gmkb-theme-css-<?php echo esc_attr($this->current_theme['theme_id']); ?>">
                <?php echo $css; ?>
            </style>
            <?php
        }
    }
    
    /**
     * Build section styles from configuration (includes user customizations)
     * 
     * @param array $styles Style configuration
     * @return string CSS string
     */
    private function build_section_styles($styles) {
        if (empty($styles)) {
            return '';
        }
        $css_rules = array();
        
        // Background
        if (!empty($styles['background'])) {
            $bg = $styles['background'];
            
            if (!empty($bg['type'])) {
                switch ($bg['type']) {
                    case 'color':
                        if (!empty($bg['color'])) {
                            $css_rules[] = 'background-color: ' . $bg['color'];
                        }
                        break;
                    case 'gradient':
                        if (!empty($bg['gradient'])) {
                            $css_rules[] = 'background: ' . $bg['gradient'];
                        }
                        break;
                    case 'image':
                        if (!empty($bg['image'])) {
                            $css_rules[] = 'background-image: url(' . $bg['image'] . ')';
                            $css_rules[] = 'background-size: ' . ($bg['size'] ?? 'cover');
                            $css_rules[] = 'background-position: ' . ($bg['position'] ?? 'center');
                        }
                        break;
                }
            }
        }
        
        // Spacing
        if (!empty($styles['padding'])) {
            $css_rules[] = 'padding: ' . $styles['padding'];
        }
        if (!empty($styles['margin'])) {
            $css_rules[] = 'margin: ' . $styles['margin'];
        }
        
        // Layout
        if (!empty($styles['max_width'])) {
            $css_rules[] = 'max-width: ' . $styles['max_width'];
        }
        if (!empty($styles['min_height'])) {
            $css_rules[] = 'min-height: ' . $styles['min_height'];
        }
        
        return implode('; ', $css_rules);
    }
    
    /**
     * Build component inline styles from settings (user customizations)
     * 
     * @param array $settings Component settings
     * @return string CSS string
     */
    private function build_component_inline_styles($settings) {
        if (empty($settings)) {
            return '';
        }
        
        $styles = array();
        
        // Background
        if (!empty($settings['backgroundColor'])) {
            $styles[] = 'background-color: ' . $settings['backgroundColor'];
        }
        
        // Text color
        if (!empty($settings['textColor'])) {
            $styles[] = 'color: ' . $settings['textColor'];
        }
        
        // Font size
        if (!empty($settings['fontSize'])) {
            $styles[] = 'font-size: ' . $settings['fontSize'];
        }
        
        // Padding
        if (!empty($settings['padding'])) {
            $styles[] = 'padding: ' . $settings['padding'];
        }
        
        // Margin
        if (!empty($settings['margin'])) {
            $styles[] = 'margin: ' . $settings['margin'];
        }
        
        // Border radius
        if (!empty($settings['borderRadius'])) {
            $styles[] = 'border-radius: ' . $settings['borderRadius'];
        }
        
        // Box shadow
        if (!empty($settings['boxShadow'])) {
            $styles[] = 'box-shadow: ' . $settings['boxShadow'];
        }
        
        // Display (for hiding)
        if (isset($settings['hidden']) && $settings['hidden']) {
            $styles[] = 'display: none';
        }
        
        return implode('; ', $styles);
    }
    
    /**
     * Render component custom CSS (scoped to component)
     * 
     * @param string $component_id Component ID
     * @param string $custom_css Custom CSS
     */
    private function render_component_custom_css($component_id, $custom_css) {
        // Scope custom CSS to this component only
        $scoped_css = "#{$component_id} { {$custom_css} }";
        
        ?>
        <style id="<?php echo esc_attr($component_id); ?>-custom">
            <?php echo wp_strip_all_tags($scoped_css); ?>
        </style>
        <?php
    }
    
    /**
     * Get component theme styles
     * 
     * @param string $component_type Component type
     * @return string CSS string
     */
    private function get_component_theme_styles($component_type) {
        if (!$this->current_theme) {
            return '';
        }
        
        $css_rules = array();
        
        // Apply component-specific theme styles
        if (isset($this->current_theme['components'][$component_type])) {
            $comp_styles = $this->current_theme['components'][$component_type];
            
            if (!empty($comp_styles['padding'])) {
                $css_rules[] = 'padding: ' . $comp_styles['padding'];
            }
            if (!empty($comp_styles['margin'])) {
                $css_rules[] = 'margin: ' . $comp_styles['margin'];
            }
            if (!empty($comp_styles['background'])) {
                $css_rules[] = 'background: ' . $comp_styles['background'];
            }
        }
        
        return implode('; ', $css_rules);
    }
    
    /**
     * Enqueue frontend assets
     */
    public function enqueue_frontend_assets() {
        // Only enqueue on pages with our shortcode
        global $post;
        if (!$post || !has_shortcode($post->post_content, 'display_media_kit')) {
            return;
        }
        
        // ROOT FIX: Use design system (single source of truth)
        $design_system_path = GMKB_PLUGIN_DIR . 'design-system/index.css';
        if (file_exists($design_system_path)) {
            $design_system_version = filemtime($design_system_path);
            $design_system_url = GMKB_PLUGIN_URL . 'design-system/index.css';
            wp_enqueue_style('gmkb-design-system', $design_system_url, array(), $design_system_version);
        }
        
        // Lazy loading JS if needed
        wp_enqueue_script(
            'gmkb-frontend-lazy',
            GMKB_PLUGIN_URL . 'js/frontend/lazy-load.js',
            array(),
            GMKB_VERSION,
            true
        );
        
        // Animation JS if needed
        wp_enqueue_script(
            'gmkb-frontend-animations',
            GMKB_PLUGIN_URL . 'js/frontend/animations.js',
            array(),
            GMKB_VERSION,
            true
        );
        
        // Localize script
        wp_localize_script('gmkb-frontend-lazy', 'gmkbFrontend', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('gmkb_frontend'),
            'lazyOffset' => 200,
            'animationDuration' => 600
        ));
    }
    
    /**
     * AJAX handler for rendering components
     */
    public function ajax_render_component() {
        // Verify nonce
        check_ajax_referer('gmkb_frontend', 'nonce');
        
        $component_type = isset($_POST['type']) ? sanitize_text_field($_POST['type']) : '';
        $component_id = isset($_POST['id']) ? sanitize_text_field($_POST['id']) : '';
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        $props = isset($_POST['props']) ? json_decode(stripslashes($_POST['props']), true) : array();
        
        if (!$component_type || !$post_id) {
            wp_send_json_error('Invalid parameters');
        }
        
        // Load component template
        ob_start();
        $this->load_component_template($component_type, array_merge($props, array(
            'component_id' => $component_id,
            'post_id' => $post_id,
            'is_frontend' => true,
            'is_ajax' => true
        )));
        $html = ob_get_clean();
        
        wp_send_json_success(array(
            'html' => $html,
            'component_id' => $component_id
        ));
    }
}

// Initialize the frontend display
GMKB_Frontend_Display::get_instance();
