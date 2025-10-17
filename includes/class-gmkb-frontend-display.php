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
        }
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
                        case 'main_sidebar':
                            // Main + Sidebar (70% / 30%) - use two column rendering
                            $section_data = isset($section['columns']) ? $section['columns'] : $section_components;
                            $this->render_two_column_section($section_data, $components, $post_id, $atts);
                            break;
                        case 'sidebar_main':
                            // Sidebar + Main (30% / 70%) - use two column rendering
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
     * ROOT FIX: Enhanced to support advanced settings (custom classes, IDs, responsive visibility)
     * ROOT FIX 2: Inject ComponentStyleService-compatible CSS
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
        
        // ROOT FIX: Generate ComponentStyleService-compatible CSS instead of inline styles
        $this->inject_component_css($component_id, $component_settings);
        
        // Build inline styles from component settings (user customizations) - DEPRECATED but kept for legacy
        $inline_styles = ''; // No longer use inline styles - use injected CSS instead
        
        // Component classes
        $component_classes = array(
            'gmkb-component',
            'gmkb-component--' . $component_type
        );
        
        if ($atts['lazy_load'] === 'true') {
            $component_classes[] = 'gmkb-lazy';
        }
        
        // PHASE 2: Add custom CSS classes from settings.advanced.custom.cssClasses
        if (!empty($component_settings['advanced']['custom']['cssClasses'])) {
            $custom_classes = $component_settings['advanced']['custom']['cssClasses'];
            // Handle both string and array format
            if (is_string($custom_classes)) {
                $custom_classes = explode(' ', $custom_classes);
            }
            foreach ($custom_classes as $class) {
                $component_classes[] = sanitize_html_class(trim($class));
            }
        }
        
        // Legacy support: settings.customClass
        if (!empty($component_settings['customClass'])) {
            $component_classes[] = sanitize_html_class($component_settings['customClass']);
        }
        
        // PHASE 2: Add responsive visibility classes
        if (!empty($component_settings['responsive'])) {
            $responsive = $component_settings['responsive'];
            if (!empty($responsive['hideOnMobile'])) {
                $component_classes[] = 'gmkb-hide-mobile';
            }
            if (!empty($responsive['hideOnTablet'])) {
                $component_classes[] = 'gmkb-hide-tablet';
            }
            if (!empty($responsive['hideOnDesktop'])) {
                $component_classes[] = 'gmkb-hide-desktop';
            }
        }
        
        // Custom ID from settings.advanced.custom.cssId
        $custom_id = null;
        if (!empty($component_settings['advanced']['custom']['cssId'])) {
            $custom_id = sanitize_html_class($component_settings['advanced']['custom']['cssId']);
        }
        
        
        // Build data attributes
        $data_attrs = array(
            'data-component-id' => $component_id,
            'data-component-type' => $component_type
        );
        
        // Add responsive visibility data attributes for JavaScript
        if (!empty($component_settings['responsive'])) {
            $responsive = $component_settings['responsive'];
            if (!empty($responsive['hideOnMobile'])) {
                $data_attrs['data-hide-mobile'] = 'true';
            }
            if (!empty($responsive['hideOnTablet'])) {
                $data_attrs['data-hide-tablet'] = 'true';
            }
            if (!empty($responsive['hideOnDesktop'])) {
                $data_attrs['data-hide-desktop'] = 'true';
            }
        }
        
        ?>
        <div class="<?php echo implode(' ', $component_classes); ?>"
             id="<?php echo esc_attr($custom_id ?: $component_id); ?>"
             <?php foreach ($data_attrs as $key => $value): ?>
             <?php echo esc_attr($key); ?>="<?php echo esc_attr($value); ?>"
             <?php endforeach; ?>
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
        
        // ROOT FIX: Allow components to enrich their own props via filter
        // This maintains self-contained component architecture
        $props = apply_filters('gmkb_enrich_component_props', $props, $component_type, $props['post_id'] ?? 0);
        $props = apply_filters("gmkb_enrich_{$component_type}_props", $props, $props['post_id'] ?? 0);
        
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
        
        if ($theme) {
            return $theme;
        }
        
        // Check for custom theme
        $custom_theme = get_option('gmkb_custom_theme_' . $theme_id);
        if ($custom_theme) {
            return $custom_theme;
        }
        
        // Fallback to default
        $fallback_theme = $this->theme_discovery->getTheme('professional_clean');
        
        if (!$fallback_theme) {
            error_log("[GMKB Frontend] CRITICAL: Default theme 'professional_clean' not found!");
            return $this->get_minimal_theme_config();
        }
        
        return $fallback_theme;
    }
    
    /**
     * Get minimal theme configuration as last resort fallback
     * 
     * @return array Minimal theme configuration
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
        // ROOT FIX: First inject BASE theme CSS variables (same as builder)
        $this->inject_theme_css_variables($post_id);
        
        // Then apply user customizations on top
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
     * ROOT FIX: Inject base theme CSS variables to frontend
     * Mirrors themeStore.applyThemeToDOM() from builder
     * Handles both snake_case (JSON) and camelCase (custom) formats
     * 
     * @param int $post_id Post ID
     */
    private function inject_theme_css_variables($post_id) {
        if (!$this->current_theme) {
            return;
        }
        
        $theme = $this->current_theme;
        
        ?>
        <style id="gmkb-theme-vars-<?php echo esc_attr($post_id); ?>">
            /* Base theme CSS variables (matches builder) */
            [data-gmkb-post-id="<?php echo esc_attr($post_id); ?>"] {
                <?php
                // COLORS - Already in correct format, just convert keys to kebab-case
                if (!empty($theme['colors'])) {
                    foreach ($theme['colors'] as $key => $value) {
                        $css_key = strtolower(preg_replace('/([A-Z])/', '-$1', $key));
                        echo '--gmkb-color-' . esc_attr($css_key) . ': ' . esc_attr($value) . ';' . "\n";
                    }
                }
                
                // TYPOGRAPHY - Handle both formats
                $typo = $theme['typography'] ?? array();
                
                // Font families - check both snake_case and camelCase
                $primary_font = $typo['fontFamily'] ?? ($typo['primary_font']['family'] ?? "'Inter', sans-serif");
                $heading_font = $typo['headingFamily'] ?? ($typo['heading_font']['family'] ?? $primary_font);
                echo '--gmkb-font-primary: ' . esc_attr($primary_font) . ';' . "\n";
                echo '--gmkb-font-heading: ' . esc_attr($heading_font) . ';' . "\n";
                
                // Font sizes
                $base_size = $typo['baseFontSize'] ?? 16;
                echo '--gmkb-font-size-base: ' . esc_attr($base_size) . 'px;' . "\n";
                echo '--gmkb-font-size-sm: ' . esc_attr($base_size * 0.875) . 'px;' . "\n";
                echo '--gmkb-font-size-lg: ' . esc_attr($base_size * 1.125) . 'px;' . "\n";
                echo '--gmkb-font-size-xl: ' . esc_attr($base_size * 1.25) . 'px;' . "\n";
                echo '--gmkb-font-size-2xl: ' . esc_attr($base_size * 1.5) . 'px;' . "\n";
                echo '--gmkb-font-size-3xl: ' . esc_attr($base_size * 1.875) . 'px;' . "\n";
                
                // Line height - handle both formats
                $line_height = $typo['lineHeight'] ?? (isset($typo['line_height']['body']) ? $typo['line_height']['body'] : 1.6);
                echo '--gmkb-line-height: ' . esc_attr($line_height) . ';' . "\n";
                
                // Font weight
                $font_weight = $typo['fontWeight'] ?? 400;
                echo '--gmkb-font-weight: ' . esc_attr($font_weight) . ';' . "\n";
                
                // Heading scale
                $heading_scale = $typo['headingScale'] ?? ($typo['font_scale'] ?? 1.25);
                echo '--gmkb-heading-scale: ' . esc_attr($heading_scale) . ';' . "\n";
                
                // SPACING - Handle both formats
                $spacing = $theme['spacing'] ?? array();
                
                // Base unit - handle both base_unit (string with px) and baseUnit (number)
                if (isset($spacing['base_unit'])) {
                    $unit = intval(str_replace('px', '', $spacing['base_unit']));
                } else {
                    $unit = $spacing['baseUnit'] ?? 8;
                }
                
                echo '--gmkb-spacing-xs: ' . esc_attr($unit * 0.5) . 'px;' . "\n";
                echo '--gmkb-spacing-sm: ' . esc_attr($unit * 0.75) . 'px;' . "\n";
                echo '--gmkb-spacing-md: ' . esc_attr($unit) . 'px;' . "\n";
                echo '--gmkb-spacing-lg: ' . esc_attr($unit * 1.5) . 'px;' . "\n";
                echo '--gmkb-spacing-xl: ' . esc_attr($unit * 2) . 'px;' . "\n";
                echo '--gmkb-spacing-2xl: ' . esc_attr($unit * 3) . 'px;' . "\n";
                echo '--gmkb-spacing-3xl: ' . esc_attr($unit * 4) . 'px;' . "\n";
                
                // Component gap - handle both formats
                if (isset($spacing['component_gap'])) {
                    $gap = intval(str_replace('px', '', $spacing['component_gap']));
                } else {
                    $gap = $spacing['componentGap'] ?? 48;
                }
                echo '--gmkb-spacing-component-gap: ' . esc_attr($gap) . 'px;' . "\n";
                
                // Section padding - maps from section_gap in JSON or sectionPadding in camelCase
                if (isset($spacing['section_gap'])) {
                    $section_padding = intval(str_replace('px', '', $spacing['section_gap']));
                } else {
                    $section_padding = $spacing['sectionPadding'] ?? 96;
                }
                echo '--gmkb-spacing-section-padding: ' . esc_attr($section_padding) . 'px;' . "\n";
                
                // Container max width
                if (isset($spacing['content_max_width'])) {
                    $max_width = intval(str_replace('px', '', $spacing['content_max_width']));
                } else {
                    $max_width = $spacing['containerMaxWidth'] ?? 1200;
                }
                echo '--gmkb-container-max-width: ' . esc_attr($max_width) . 'px;' . "\n";
                
                // EFFECTS - Handle both formats
                $effects = $theme['effects'] ?? array();
                
                // Border radius - handle both formats
                $radius = $effects['borderRadius'] ?? ($effects['border_radius'] ?? '12px');
                echo '--gmkb-border-radius: ' . esc_attr($radius) . ';' . "\n";
                echo '--gmkb-border-radius-sm: calc(' . esc_attr($radius) . ' * 0.5);' . "\n";
                echo '--gmkb-border-radius-lg: calc(' . esc_attr($radius) . ' * 1.5);' . "\n";
                
                // Shadow - use shadowIntensity if available, otherwise analyze shadow property
                $shadows = array(
                    'none' => 'none',
                    'subtle' => '0 1px 3px rgba(0, 0, 0, 0.1)',
                    'medium' => '0 4px 6px rgba(0, 0, 0, 0.1)',
                    'strong' => '0 10px 25px rgba(0, 0, 0, 0.15)'
                );
                
                if (isset($effects['shadowIntensity'])) {
                    $intensity = $effects['shadowIntensity'];
                } elseif (isset($effects['shadow'])) {
                    // Analyze shadow to determine intensity
                    $shadow = $effects['shadow'];
                    if (strpos($shadow, '20px') !== false || strpos($shadow, '25px') !== false) {
                        $intensity = 'strong';
                    } elseif (strpos($shadow, '10px') !== false || strpos($shadow, '15px') !== false) {
                        $intensity = 'medium';
                    } else {
                        $intensity = 'subtle';
                    }
                } else {
                    $intensity = 'medium';
                }
                
                echo '--gmkb-shadow: ' . esc_attr($shadows[$intensity] ?? $shadows['medium']) . ';' . "\n";
                echo '--gmkb-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);' . "\n";
                echo '--gmkb-shadow-lg: 0 20px 40px rgba(0, 0, 0, 0.2);' . "\n";
                
                // Animation speed
                $speeds = array(
                    'none' => '0ms',
                    'fast' => '150ms',
                    'normal' => '300ms',
                    'slow' => '500ms'
                );
                
                if (isset($effects['animationSpeed'])) {
                    $speed = $effects['animationSpeed'];
                } elseif (isset($effects['transitions'])) {
                    // Analyze transitions to determine speed
                    $transition = $effects['transitions'];
                    if (strpos($transition, '0.5s') !== false || strpos($transition, '500ms') !== false) {
                        $speed = 'slow';
                    } elseif (strpos($transition, '0.15s') !== false || strpos($transition, '150ms') !== false) {
                        $speed = 'fast';
                    } else {
                        $speed = 'normal';
                    }
                } else {
                    $speed = 'normal';
                }
                
                echo '--gmkb-transition-speed: ' . esc_attr($speeds[$speed] ?? $speeds['normal']) . ';' . "\n";
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
     * ROOT FIX: Enhanced to parse nested settings.style structure from JSON
     * 
     * @param array $settings Component settings
     * @return string CSS string
     */
    private function build_component_inline_styles($settings) {
        if (empty($settings)) {
            return '';
        }
        
        $styles = array();
        
        // PHASE 2: Parse nested settings.style structure
        $style_config = $settings['style'] ?? $settings;
        
        // SPACING - Handle nested spacing.margin and spacing.padding
        if (!empty($style_config['spacing'])) {
            $spacing = $style_config['spacing'];
            
            // Margin - support both string and array format
            if (!empty($spacing['margin'])) {
                if (is_array($spacing['margin'])) {
                    // Array format: [top, right, bottom, left]
                    $styles[] = 'margin: ' . implode('px ', $spacing['margin']) . 'px';
                } else {
                    // String format: "32px 0px 32px 0px"
                    $styles[] = 'margin: ' . $spacing['margin'];
                }
            }
            
            // Padding - support both string and array format
            if (!empty($spacing['padding'])) {
                if (is_array($spacing['padding'])) {
                    // Array format: [top, right, bottom, left]
                    $styles[] = 'padding: ' . implode('px ', $spacing['padding']) . 'px';
                } else {
                    // String format: "40px 32px 40px 32px"
                    $styles[] = 'padding: ' . $spacing['padding'];
                }
            }
        }
        
        // BACKGROUND - Handle nested background.color and background.opacity
        if (!empty($style_config['background'])) {
            $background = $style_config['background'];
            
            if (!empty($background['color'])) {
                $bg_color = $background['color'];
                
                // Apply opacity if specified
                if (isset($background['opacity']) && $background['opacity'] < 1) {
                    // Convert hex to rgba if needed
                    if (strpos($bg_color, '#') === 0) {
                        $hex = str_replace('#', '', $bg_color);
                        if (strlen($hex) === 3) {
                            $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
                        }
                        $r = hexdec(substr($hex, 0, 2));
                        $g = hexdec(substr($hex, 2, 2));
                        $b = hexdec(substr($hex, 4, 2));
                        $bg_color = "rgba({$r}, {$g}, {$b}, {$background['opacity']})";
                    }
                }
                
                $styles[] = 'background-color: ' . $bg_color;
            }
            
            // Gradient support
            if (!empty($background['gradient'])) {
                $styles[] = 'background: ' . $background['gradient'];
            }
            
            // Image support
            if (!empty($background['image'])) {
                $styles[] = 'background-image: url(' . esc_url($background['image']) . ')';
                if (!empty($background['size'])) {
                    $styles[] = 'background-size: ' . $background['size'];
                }
                if (!empty($background['position'])) {
                    $styles[] = 'background-position: ' . $background['position'];
                }
                if (!empty($background['repeat'])) {
                    $styles[] = 'background-repeat: ' . $background['repeat'];
                }
            }
        }
        
        // TYPOGRAPHY - Handle nested typography settings
        if (!empty($style_config['typography'])) {
            $typography = $style_config['typography'];
            
            if (!empty($typography['fontFamily'])) {
                $styles[] = 'font-family: ' . $typography['fontFamily'];
            }
            
            if (!empty($typography['fontSize'])) {
                $font_size = $typography['fontSize'];
                // Add 'px' if not present
                if (is_numeric($font_size)) {
                    $font_size .= 'px';
                }
                $styles[] = 'font-size: ' . $font_size;
            }
            
            if (!empty($typography['fontWeight'])) {
                $styles[] = 'font-weight: ' . $typography['fontWeight'];
            }
            
            if (!empty($typography['lineHeight'])) {
                $styles[] = 'line-height: ' . $typography['lineHeight'];
            }
            
            if (!empty($typography['letterSpacing'])) {
                $styles[] = 'letter-spacing: ' . $typography['letterSpacing'];
            }
            
            if (!empty($typography['textAlign'])) {
                $styles[] = 'text-align: ' . $typography['textAlign'];
            }
            
            if (!empty($typography['textTransform'])) {
                $styles[] = 'text-transform: ' . $typography['textTransform'];
            }
            
            if (!empty($typography['color'])) {
                $styles[] = 'color: ' . $typography['color'];
            }
        }
        
        // BORDER - Handle nested border settings
        if (!empty($style_config['border'])) {
            $border = $style_config['border'];
            
            // Border width
            if (isset($border['width'])) {
                $width = is_numeric($border['width']) ? $border['width'] . 'px' : $border['width'];
                $style = $border['style'] ?? 'solid';
                $color = $border['color'] ?? 'currentColor';
                $styles[] = 'border: ' . $width . ' ' . $style . ' ' . $color;
            }
            
            // Border radius - support both single value and object
            if (!empty($border['radius'])) {
                if (is_array($border['radius'])) {
                    // Object format: {topLeft, topRight, bottomRight, bottomLeft}
                    $radius_parts = array(
                        $border['radius']['topLeft'] ?? '0',
                        $border['radius']['topRight'] ?? '0',
                        $border['radius']['bottomRight'] ?? '0',
                        $border['radius']['bottomLeft'] ?? '0'
                    );
                    $styles[] = 'border-radius: ' . implode('px ', $radius_parts) . 'px';
                } else {
                    // Single value
                    $radius = is_numeric($border['radius']) ? $border['radius'] . 'px' : $border['radius'];
                    $styles[] = 'border-radius: ' . $radius;
                }
            }
            
            // Individual borders
            if (!empty($border['top'])) {
                $styles[] = 'border-top: ' . $border['top'];
            }
            if (!empty($border['right'])) {
                $styles[] = 'border-right: ' . $border['right'];
            }
            if (!empty($border['bottom'])) {
                $styles[] = 'border-bottom: ' . $border['bottom'];
            }
            if (!empty($border['left'])) {
                $styles[] = 'border-left: ' . $border['left'];
            }
        }
        
        // EFFECTS - Handle box shadow and other effects
        if (!empty($style_config['effects'])) {
            $effects = $style_config['effects'];
            
            if (!empty($effects['boxShadow'])) {
                $styles[] = 'box-shadow: ' . $effects['boxShadow'];
            }
            
            if (!empty($effects['opacity'])) {
                $styles[] = 'opacity: ' . $effects['opacity'];
            }
            
            if (!empty($effects['filter'])) {
                $styles[] = 'filter: ' . $effects['filter'];
            }
            
            if (!empty($effects['transform'])) {
                $styles[] = 'transform: ' . $effects['transform'];
            }
            
            if (!empty($effects['transition'])) {
                $styles[] = 'transition: ' . $effects['transition'];
            }
        }
        
        // ADVANCED LAYOUT SETTINGS
        if (!empty($settings['advanced'])) {
            $advanced = $settings['advanced'];
            
            // Layout settings
            if (!empty($advanced['layout'])) {
                $layout = $advanced['layout'];
                
                if (!empty($layout['width'])) {
                    $width = is_numeric($layout['width']) ? $layout['width'] . 'px' : $layout['width'];
                    $styles[] = 'width: ' . $width;
                }
                
                if (!empty($layout['maxWidth'])) {
                    $max_width = is_numeric($layout['maxWidth']) ? $layout['maxWidth'] . 'px' : $layout['maxWidth'];
                    $styles[] = 'max-width: ' . $max_width;
                }
                
                if (!empty($layout['minHeight'])) {
                    $min_height = is_numeric($layout['minHeight']) ? $layout['minHeight'] . 'px' : $layout['minHeight'];
                    $styles[] = 'min-height: ' . $min_height;
                }
                
                if (!empty($layout['alignment'])) {
                    // Text alignment
                    $styles[] = 'text-align: ' . $layout['alignment'];
                }
                
                if (!empty($layout['display'])) {
                    $styles[] = 'display: ' . $layout['display'];
                }
                
                if (!empty($layout['flexDirection'])) {
                    $styles[] = 'flex-direction: ' . $layout['flexDirection'];
                }
                
                if (!empty($layout['justifyContent'])) {
                    $styles[] = 'justify-content: ' . $layout['justifyContent'];
                }
                
                if (!empty($layout['alignItems'])) {
                    $styles[] = 'align-items: ' . $layout['alignItems'];
                }
            }
        }
        
        // LEGACY FLAT STRUCTURE SUPPORT (for backwards compatibility)
        // Only apply if not already set by nested structure
        
        if (empty($style_config['background']) && !empty($settings['backgroundColor'])) {
            $styles[] = 'background-color: ' . $settings['backgroundColor'];
        }
        
        if (empty($style_config['typography']) && !empty($settings['textColor'])) {
            $styles[] = 'color: ' . $settings['textColor'];
        }
        
        if (empty($style_config['typography']) && !empty($settings['fontSize'])) {
            $styles[] = 'font-size: ' . $settings['fontSize'];
        }
        
        if (empty($style_config['spacing']) && !empty($settings['padding'])) {
            $styles[] = 'padding: ' . $settings['padding'];
        }
        
        if (empty($style_config['spacing']) && !empty($settings['margin'])) {
            $styles[] = 'margin: ' . $settings['margin'];
        }
        
        if (empty($style_config['border']) && !empty($settings['borderRadius'])) {
            $styles[] = 'border-radius: ' . $settings['borderRadius'];
        }
        
        if (empty($style_config['effects']) && !empty($settings['boxShadow'])) {
            $styles[] = 'box-shadow: ' . $settings['boxShadow'];
        }
        
        // VISIBILITY - Handle hidden state
        if (isset($settings['hidden']) && $settings['hidden']) {
            $styles[] = 'display: none';
        }
        
        // Responsive visibility (hideOnMobile, hideOnTablet, hideOnDesktop)
        // Note: These should be handled via CSS classes for proper media query support
        // But we can add a data attribute for JavaScript to handle
        
        return implode('; ', $styles);
    }
    
    /**
     * ROOT FIX: Inject component CSS matching ComponentStyleService logic
     * This mirrors the JavaScript generateCSS() method for frontend consistency
     * 
     * @param string $component_id Component ID
     * @param array $settings Component settings
     */
    private function inject_component_css($component_id, $settings) {
        if (empty($settings) || !is_array($settings)) {
            return;
        }
        
        $style = isset($settings['style']) ? $settings['style'] : array();
        $advanced = isset($settings['advanced']) ? $settings['advanced'] : array();
        
        if (empty($style) && empty($advanced)) {
            return;
        }
        
        $rules = array();
        
        // Selectors matching ComponentStyleService (both builder and frontend)
        $wrapper_selector = ".gmkb-component[data-component-id=\"{$component_id}\"]";
        $component_selector = ".gmkb-component[data-component-id=\"{$component_id}\"] .component-root";
        
        $wrapper_rules = array(); // For margin only
        $component_rules = array(); // For everything else
        
        // SPACING
        if (!empty($style['spacing'])) {
            // Margin (wrapper)
            if (!empty($style['spacing']['margin'])) {
                $m = $style['spacing']['margin'];
                $unit = isset($m['unit']) ? $m['unit'] : 'px';
                $wrapper_rules[] = "margin: {$m['top']}{$unit} {$m['right']}{$unit} {$m['bottom']}{$unit} {$m['left']}{$unit}";
            }
            // Padding (component root)
            if (!empty($style['spacing']['padding'])) {
                $p = $style['spacing']['padding'];
                $unit = isset($p['unit']) ? $p['unit'] : 'px';
                $component_rules[] = "padding: {$p['top']}{$unit} {$p['right']}{$unit} {$p['bottom']}{$unit} {$p['left']}{$unit}";
            }
        }
        
        // BACKGROUND
        if (!empty($style['background'])) {
            if (!empty($style['background']['color'])) {
                $component_rules[] = "background-color: {$style['background']['color']} !important";
            }
            if (isset($style['background']['opacity']) && $style['background']['opacity'] !== 100) {
                $opacity = $style['background']['opacity'] / 100;
                $component_rules[] = "opacity: {$opacity}";
            }
        }
        
        // TYPOGRAPHY - CRITICAL: Must include !important to override component defaults
        if (!empty($style['typography'])) {
            $t = $style['typography'];
            
            if (!empty($t['fontFamily'])) {
                $font_family = $this->format_font_family($t['fontFamily']);
                $component_rules[] = "font-family: {$font_family} !important";
            }
            
            if (!empty($t['fontSize'])) {
                $unit = isset($t['fontSize']['unit']) ? $t['fontSize']['unit'] : 'px';
                $component_rules[] = "font-size: {$t['fontSize']['value']}{$unit} !important";
            }
            
            if (!empty($t['fontWeight'])) {
                $component_rules[] = "font-weight: {$t['fontWeight']} !important";
            }
            
            if (!empty($t['lineHeight'])) {
                if (is_array($t['lineHeight']) && isset($t['lineHeight']['value'])) {
                    $lh_value = $t['lineHeight']['value'];
                    $lh_unit = isset($t['lineHeight']['unit']) && $t['lineHeight']['unit'] !== 'unitless' ? $t['lineHeight']['unit'] : '';
                    $component_rules[] = "line-height: {$lh_value}{$lh_unit} !important";
                } else {
                    $component_rules[] = "line-height: {$t['lineHeight']} !important";
                }
            }
            
            if (!empty($t['color'])) {
                $component_rules[] = "color: {$t['color']} !important";
            }
            
            if (!empty($t['textAlign'])) {
                $component_rules[] = "text-align: {$t['textAlign']} !important";
            }
        }
        
        // BORDER
        if (!empty($style['border'])) {
            $b = $style['border'];
            
            if (!empty($b['width'])) {
                $unit = isset($b['width']['unit']) ? $b['width']['unit'] : 'px';
                $has_width = !empty($b['width']['top']) || !empty($b['width']['right']) || 
                            !empty($b['width']['bottom']) || !empty($b['width']['left']);
                
                if ($has_width) {
                    $top = isset($b['width']['top']) ? $b['width']['top'] : 0;
                    $right = isset($b['width']['right']) ? $b['width']['right'] : 0;
                    $bottom = isset($b['width']['bottom']) ? $b['width']['bottom'] : 0;
                    $left = isset($b['width']['left']) ? $b['width']['left'] : 0;
                    
                    $component_rules[] = "border-width: {$top}{$unit} {$right}{$unit} {$bottom}{$unit} {$left}{$unit}";
                    
                    if (!empty($b['color'])) {
                        $component_rules[] = "border-color: {$b['color']}";
                    }
                    if (!empty($b['style'])) {
                        $component_rules[] = "border-style: {$b['style']}";
                    }
                }
            }
            
            if (!empty($b['radius'])) {
                $unit = isset($b['radius']['unit']) ? $b['radius']['unit'] : 'px';
                $tl = isset($b['radius']['topLeft']) ? $b['radius']['topLeft'] : 0;
                $tr = isset($b['radius']['topRight']) ? $b['radius']['topRight'] : 0;
                $br = isset($b['radius']['bottomRight']) ? $b['radius']['bottomRight'] : 0;
                $bl = isset($b['radius']['bottomLeft']) ? $b['radius']['bottomLeft'] : 0;
                
                $component_rules[] = "border-radius: {$tl}{$unit} {$tr}{$unit} {$br}{$unit} {$bl}{$unit}";
            }
        }
        
        // EFFECTS
        if (!empty($style['effects'])) {
            if (!empty($style['effects']['boxShadow']) && $style['effects']['boxShadow'] !== 'none') {
                $component_rules[] = "box-shadow: {$style['effects']['boxShadow']} !important";
            }
            if (isset($style['effects']['opacity']) && $style['effects']['opacity'] !== 100) {
                $opacity = $style['effects']['opacity'] / 100;
                $component_rules[] = "opacity: {$opacity} !important";
            }
        }
        
        // ADVANCED LAYOUT
        if (!empty($advanced['layout'])) {
            $layout = $advanced['layout'];
            
            if (!empty($layout['width'])) {
                if ($layout['width']['type'] === 'full') {
                    $wrapper_rules[] = 'width: 100%';
                } elseif ($layout['width']['type'] === 'custom' && isset($layout['width']['value'])) {
                    $unit = isset($layout['width']['unit']) ? $layout['width']['unit'] : 'px';
                    $wrapper_rules[] = "width: {$layout['width']['value']}{$unit}";
                }
            }
            
            if (!empty($layout['alignment'])) {
                if ($layout['alignment'] === 'center') {
                    $wrapper_rules[] = 'margin-left: auto';
                    $wrapper_rules[] = 'margin-right: auto';
                } elseif ($layout['alignment'] === 'right') {
                    $wrapper_rules[] = 'margin-left: auto';
                }
            }
        }
        
        // Build CSS
        $css = '';
        
        if (!empty($wrapper_rules)) {
            $css .= $wrapper_selector . " { " . implode('; ', $wrapper_rules) . "; }\n";
        }
        
        if (!empty($component_rules)) {
            $css .= $component_selector . " { " . implode('; ', $component_rules) . "; }\n";
        }
        
        // RESPONSIVE
        if (!empty($advanced['responsive'])) {
            $resp = $advanced['responsive'];
            
            if (!empty($resp['hideOnMobile'])) {
                $css .= "@media (max-width: 767px) { {$wrapper_selector} { display: none !important; } }\n";
            }
            
            if (!empty($resp['hideOnTablet'])) {
                $css .= "@media (min-width: 768px) and (max-width: 1024px) { {$wrapper_selector} { display: none !important; } }\n";
            }
            
            if (!empty($resp['hideOnDesktop'])) {
                $css .= "@media (min-width: 1025px) { {$wrapper_selector} { display: none !important; } }\n";
            }
        }
        
        if (!empty($css)) {
            echo "<style id=\"component-styles-{$component_id}\">\n{$css}</style>\n";
        }
    }
    
    /**
     * Format font family for CSS (helper method)
     * 
     * @param string $font_family Font family value
     * @return string Formatted CSS font-family value
     */
    private function format_font_family($font_family) {
        if (!$font_family) return 'inherit';
        
        // Decode HTML entities
        $decoded = html_entity_decode($font_family, ENT_QUOTES, 'UTF-8');
        
        // Split by comma to handle font stacks
        $fonts = array_map('trim', explode(',', $decoded));
        
        $formatted = array();
        $generic_families = array('serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'inherit');
        
        foreach ($fonts as $font) {
            // Don't quote generic families
            if (in_array(strtolower($font), $generic_families)) {
                $formatted[] = $font;
            }
            // Quote fonts with spaces
            elseif (strpos($font, ' ') !== false && strpos($font, "'") !== 0 && strpos($font, '"') !== 0) {
                $formatted[] = "'{$font}'";
            }
            // Remove and re-add quotes for consistency
            else {
                $unquoted = trim($font, '"\' ');
                if (strpos($unquoted, ' ') !== false) {
                    $formatted[] = "'{$unquoted}'";
                } else {
                    $formatted[] = $unquoted;
                }
            }
        }
        
        return implode(', ', $formatted);
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
