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
     * Current section being rendered (for context in helper methods)
     */
    private $current_section = null;
    
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
        
        // ROOT FIX: Safe theme ID extraction with proper array key checks
        if (!$theme_id) {
            $theme_id = isset($state['globalSettings']) && is_array($state['globalSettings']) && isset($state['globalSettings']['theme']) 
                ? $state['globalSettings']['theme'] 
                : 'professional_clean';
        }
        $this->current_theme = $this->load_theme($theme_id);
        
        // Enqueue necessary assets
        $this->enqueue_template_assets();
        
        // Render media kit
        // ROOT FIX: Disable lazy_load on frontend - we don't have Vue to hydrate
        $atts = array(
            'responsive' => 'true',
            'lazy_load' => 'false',  // No Vue on frontend, use PHP templates
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
        // ROOT FIX: Disable lazy_load by default - no Vue on frontend
        $atts = shortcode_atts(array(
            'id' => 0,
            'theme' => '',
            'class' => '',
            'responsive' => 'true',
            'lazy_load' => 'false',  // No Vue on frontend, use PHP templates
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
        
        // ROOT FIX: Safe theme ID extraction with proper array key checks
        if (!empty($atts['theme'])) {
            $theme_id = $atts['theme'];
        } elseif (isset($state['globalSettings']) && is_array($state['globalSettings']) && isset($state['globalSettings']['theme'])) {
            $theme_id = $state['globalSettings']['theme'];
        } else {
            $theme_id = 'professional_clean';
        }
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
        
        // ROOT FIX: Safe theme ID extraction with proper array key checks
        if (!empty($atts['theme'])) {
            $theme_id = $atts['theme'];
        } elseif (isset($state['globalSettings']) && is_array($state['globalSettings']) && isset($state['globalSettings']['theme'])) {
            $theme_id = $state['globalSettings']['theme'];
        } else {
            $theme_id = 'professional_clean';
        }
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
     * ROOT FIX: Inject collected CSS at section level for valid HTML structure
     * 
     * @param array $sections Sections array
     * @param array $components Components map
     * @param int $post_id Post ID
     * @param array $atts Attributes
     */
    private function render_sections($sections, $components, $post_id, $atts) {
        // PHASE 1 BLOAT ELIMINATION: Disabled competing CSS injection
        // $this->inject_collected_css();
        
        foreach ($sections as $section) {
            // ROOT FIX: Store current section for helper methods
            $this->current_section = $section;
            
            $section_id = $section['section_id'] ?? 'section-' . uniqid();
            // ROOT FIX: Check both 'section_type' and 'type' keys
            $section_type = $section['section_type'] ?? $section['type'] ?? $section['layout'] ?? 'full_width';
            $section_components = $section['components'] ?? array();
            // ROOT FIX: Read from 'settings' (Vue format) not 'styles'
            $section_settings = $section['settings'] ?? array();
            $section_styles = $section_settings['style'] ?? array();
            
            // Build section classes
            $section_classes = array(
                'gmkb-section',
                'gmkb-section--' . $section_type
            );
            
            // ROOT FIX: Add custom CSS classes from section settings
            if (!empty($section_settings['advanced']['custom']['cssClasses'])) {
                $custom_classes = $section_settings['advanced']['custom']['cssClasses'];
                // Handle both string and array format
                if (is_string($custom_classes)) {
                    $custom_classes = explode(' ', $custom_classes);
                }
                if (is_array($custom_classes)) {
                    foreach ($custom_classes as $class) {
                        $section_classes[] = sanitize_html_class(trim($class));
                    }
                }
            }
            
            if ($atts['section_animation'] !== 'none') {
                $section_classes[] = 'gmkb-animate';
                $section_classes[] = 'gmkb-animate--' . $atts['section_animation'];
            }
            
            // ROOT FIX: Add custom ID from section settings
            $custom_section_id = null;
            if (!empty($section_settings['advanced']['custom']['cssId'])) {
                $custom_section_id = sanitize_html_class($section_settings['advanced']['custom']['cssId']);
            }
            
            // Build section styles
            $section_style = $this->build_section_styles($section_styles);
            
            ?>
            <section class="<?php echo implode(' ', $section_classes); ?>"
                     <?php if ($custom_section_id): ?>id="<?php echo esc_attr($custom_section_id); ?>"<?php endif; ?>
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
            // PHASE 1 BLOAT ELIMINATION: Disabled competing CSS injection
            // $this->inject_collected_css();
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
        
        // DEBUG: Log what we received
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB: render_two_column_section called');
            error_log('GMKB: section_components type: ' . gettype($section_components));
            error_log('GMKB: section_components: ' . print_r($section_components, true));
            error_log('GMKB: components count: ' . count($components));
            error_log('GMKB: components keys: ' . implode(', ', array_keys($components)));
        }
        
        // Check if we have a 'columns' key in the section (Vue format)
        if (is_array($section_components) && isset($section_components['1']) && isset($section_components['2'])) {
            // Vue saves as: columns: {1: [...], 2: [...], 3: [...]}
            $columns[1] = $section_components['1'] ?? array();
            $columns[2] = $section_components['2'] ?? array();
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB: Using Vue format columns');
                error_log('GMKB: Column 1 items: ' . count($columns[1]));
                error_log('GMKB: Column 2 items: ' . count($columns[2]));
            }
        } else {
            // Legacy format: flat array with column property
            foreach ($section_components as $comp_ref) {
                $column = is_array($comp_ref) ? ($comp_ref['column'] ?? 1) : 1;
                $columns[$column][] = $comp_ref;
            }
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB: Using legacy format columns');
                error_log('GMKB: Column 1 items: ' . count($columns[1]));
                error_log('GMKB: Column 2 items: ' . count($columns[2]));
            }
        }
        
        // ROOT FIX: Get vertical alignment class
        $valign_class = $this->get_section_vertical_align_class();
        
        ?>
        <div class="gmkb-section__columns gmkb-section__columns--2 <?php echo esc_attr($valign_class); ?>">
            <?php for ($col = 1; $col <= 2; $col++): ?>
                <div class="gmkb-section__column" data-column="<?php echo $col; ?>">
                    <?php
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('GMKB: Rendering column ' . $col . ' with ' . count($columns[$col]) . ' items');
                    }
                    
                    if (empty($columns[$col])) {
                        if (defined('WP_DEBUG') && WP_DEBUG) {
                            error_log('GMKB: Column ' . $col . ' is EMPTY');
                        }
                        echo '<!-- GMKB: Column ' . $col . ' has no components -->';
                    }
                    
                    foreach ($columns[$col] as $index => $comp_ref) {
                        // ROOT FIX: Handle both string and array format
                        if (is_string($comp_ref)) {
                            $component_id = $comp_ref;
                        } elseif (is_array($comp_ref)) {
                            $component_id = $comp_ref['component_id'] ?? null;
                        } else {
                            $component_id = null;
                        }
                        
                        if (defined('WP_DEBUG') && WP_DEBUG) {
                            error_log('GMKB: Column ' . $col . ' item ' . $index . ': component_id = ' . ($component_id ?? 'NULL'));
                            error_log('GMKB: Component exists in map? ' . (isset($components[$component_id]) ? 'YES' : 'NO'));
                        }
                        
                        if ($component_id && isset($components[$component_id])) {
                            if (defined('WP_DEBUG') && WP_DEBUG) {
                                error_log('GMKB: Rendering component: ' . $component_id);
                            }
                            $this->render_component($components[$component_id], $component_id, $post_id, $atts);
                        } else {
                            if (defined('WP_DEBUG') && WP_DEBUG) {
                                error_log('GMKB: SKIPPING component - ID: ' . ($component_id ?? 'NULL') . ', exists: ' . (isset($components[$component_id]) ? 'yes' : 'no'));
                            }
                            echo '<!-- GMKB: Component not found: ' . esc_attr($component_id ?? 'null') . ' -->';
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
        
        // ROOT FIX: Get vertical alignment class
        $valign_class = $this->get_section_vertical_align_class();
        
        ?>
        <div class="gmkb-section__columns gmkb-section__columns--3 <?php echo esc_attr($valign_class); ?>">
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
    
    // PHASE 3 BLOAT ELIMINATION: Removed component_css_cache - no longer needed with token system
    
    /**
     * PHASE 2: Build CSS variable overrides from component settings
     * Maps ALL user customizations to theme tokens
     * 
     * @param array $settings Component settings
     * @return string Inline CSS variable string
     */
    private function build_token_overrides($settings) {
        if (empty($settings['style'])) {
            return '';
        }
        
        $vars = array();
        $style = $settings['style'];
        
        // === BACKGROUND ===
        if (!empty($style['background']['color'])) {
            $vars[] = '--gmkb-color-surface: ' . $style['background']['color'];
        }
        
        if (isset($style['background']['opacity'])) {
            $opacity = floatval($style['background']['opacity']) / 100; // Convert 0-100 to 0-1
            $vars[] = '--gmkb-background-opacity: ' . $opacity;
        }
        
        // === TYPOGRAPHY ===
        if (!empty($style['typography']['color'])) {
            $vars[] = '--gmkb-color-text: ' . $style['typography']['color'];
        }
        
        if (!empty($style['typography']['fontFamily'])) {
            $vars[] = '--gmkb-font-primary: ' . $this->format_font_family($style['typography']['fontFamily']);
        }
        
        if (!empty($style['typography']['fontSize'])) {
            $size = $style['typography']['fontSize'];
            $value = is_array($size) ? ($size['value'] ?? $size) : $size;
            $unit = is_array($size) && isset($size['unit']) ? $size['unit'] : 'px';
            $vars[] = '--gmkb-font-size-base: ' . $value . $unit;
        }
        
        if (!empty($style['typography']['fontWeight'])) {
            $vars[] = '--gmkb-font-weight: ' . $style['typography']['fontWeight'];
        }
        
        if (!empty($style['typography']['lineHeight'])) {
            $lineHeight = $style['typography']['lineHeight'];
            $value = is_array($lineHeight) ? ($lineHeight['value'] ?? $lineHeight) : $lineHeight;
            $vars[] = '--gmkb-line-height: ' . $value;
        }
        
        if (!empty($style['typography']['textAlign'])) {
            $vars[] = '--gmkb-text-align: ' . $style['typography']['textAlign'];
        }
        
        // === SPACING - Padding ===
        if (!empty($style['spacing']['padding'])) {
            $p = $style['spacing']['padding'];
            if (is_array($p)) {
                $unit = $p['unit'] ?? 'px';
                $top = $p['top'] ?? 0;
                $right = $p['right'] ?? 0;
                $bottom = $p['bottom'] ?? 0;
                $left = $p['left'] ?? 0;
                $vars[] = '--gmkb-spacing-component: ' . $top . $unit . ' ' . $right . $unit . ' ' . $bottom . $unit . ' ' . $left . $unit;
                
                // Individual values for granular control
                $vars[] = '--gmkb-padding-top: ' . $top . $unit;
                $vars[] = '--gmkb-padding-right: ' . $right . $unit;
                $vars[] = '--gmkb-padding-bottom: ' . $bottom . $unit;
                $vars[] = '--gmkb-padding-left: ' . $left . $unit;
            }
        }
        
        // === SPACING - Margin ===
        if (!empty($style['spacing']['margin'])) {
            $m = $style['spacing']['margin'];
            if (is_array($m)) {
                $unit = $m['unit'] ?? 'px';
                $top = $m['top'] ?? 0;
                $right = $m['right'] ?? 0;
                $bottom = $m['bottom'] ?? 0;
                $left = $m['left'] ?? 0;
                $vars[] = '--gmkb-margin: ' . $top . $unit . ' ' . $right . $unit . ' ' . $bottom . $unit . ' ' . $left . $unit;
                
                // Individual values for granular control
                $vars[] = '--gmkb-margin-top: ' . $top . $unit;
                $vars[] = '--gmkb-margin-right: ' . $right . $unit;
                $vars[] = '--gmkb-margin-bottom: ' . $bottom . $unit;
                $vars[] = '--gmkb-margin-left: ' . $left . $unit;
            }
        }
        
        // === BORDER - Width (all sides) ===
        if (!empty($style['border']['width'])) {
            $bw = $style['border']['width'];
            if (is_array($bw)) {
                $unit = $bw['unit'] ?? 'px';
                $top = $bw['top'] ?? 0;
                $right = $bw['right'] ?? 0;
                $bottom = $bw['bottom'] ?? 0;
                $left = $bw['left'] ?? 0;
                
                // Set individual border widths
                $vars[] = '--gmkb-border-width-top: ' . $top . $unit;
                $vars[] = '--gmkb-border-width-right: ' . $right . $unit;
                $vars[] = '--gmkb-border-width-bottom: ' . $bottom . $unit;
                $vars[] = '--gmkb-border-width-left: ' . $left . $unit;
                
                // If all equal, set shorthand
                if ($top === $right && $right === $bottom && $bottom === $left) {
                    $vars[] = '--gmkb-border-width: ' . $top . $unit;
                }
            } elseif (isset($bw) && $bw !== '' && $bw !== 0) {
                // Single value format
                $unit = 'px';
                $vars[] = '--gmkb-border-width: ' . $bw . $unit;
            }
        }
        
        // === BORDER - Style ===
        if (!empty($style['border']['style'])) {
            $vars[] = '--gmkb-border-style: ' . $style['border']['style'];
        }
        
        // === BORDER - Color ===
        if (!empty($style['border']['color'])) {
            $vars[] = '--gmkb-border-color: ' . $style['border']['color'];
        }
        
        // === BORDER - Radius ===
        if (!empty($style['border']['radius'])) {
            $r = $style['border']['radius'];
            if (is_array($r)) {
                $unit = $r['unit'] ?? 'px';
                $tl = $r['topLeft'] ?? 0;
                $tr = $r['topRight'] ?? 0;
                $br = $r['bottomRight'] ?? 0;
                $bl = $r['bottomLeft'] ?? 0;
                
                // Individual corners
                $vars[] = '--gmkb-border-radius-tl: ' . $tl . $unit;
                $vars[] = '--gmkb-border-radius-tr: ' . $tr . $unit;
                $vars[] = '--gmkb-border-radius-br: ' . $br . $unit;
                $vars[] = '--gmkb-border-radius-bl: ' . $bl . $unit;
                
                // If all equal, set shorthand
                if ($tl === $tr && $tr === $br && $br === $bl) {
                    $vars[] = '--gmkb-border-radius: ' . $tl . $unit;
                } else {
                    $vars[] = '--gmkb-border-radius: ' . $tl . $unit . ' ' . $tr . $unit . ' ' . $br . $unit . ' ' . $bl . $unit;
                }
            }
        }
        
        // === EFFECTS - Box Shadow ===
        if (!empty($style['effects']['boxShadow']) && $style['effects']['boxShadow'] !== 'none') {
            $vars[] = '--gmkb-shadow: ' . $style['effects']['boxShadow'];
        }
        
        return implode('; ', $vars);
    }
    
    /**
     * Render single component (includes user customizations)
     * ROOT FIX: Collect CSS for batch injection, not inline
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
        
        // PHASE 1 BLOAT ELIMINATION: Disabled competing CSS system - using theme tokens instead
        // $this->collect_component_css($component_id, $component_settings);
        
        // Build inline styles from component settings (user customizations) - DEPRECATED but kept for legacy
        $inline_styles = ''; // No longer use inline styles - use injected CSS instead
        
        // Component classes
        $component_classes = array(
            'gmkb-component',
            'gmkb-component--' . $component_type
        );
        
        // ROOT FIX: NEVER use lazy loading on frontend - no Vue to hydrate it
        // Templates render directly via PHP
        // if ($atts['lazy_load'] === 'true') {
        //     $component_classes[] = 'gmkb-lazy';
        // }
        
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
        
        // PHASE 3 BLOAT ELIMINATION: Removed custom CSS collection
        // Custom CSS should be minimal - use token overrides for styling
        
        // ROOT FIX: Merge data and props - props take precedence
        $merged_data = array_merge($component_data, $component_props);
        
        // Build data attributes string
        $data_attrs_string = '';
        foreach ($data_attrs as $key => $value) {
            $data_attrs_string .= ' ' . esc_attr($key) . '="' . esc_attr($value) . '"';
        }
        
        // PHASE 2: Build inline CSS variable overrides from settings
        $inline_vars = $this->build_token_overrides($component_settings);
        
        // ROOT FIX: Wrap component with proper div structure
        ?>
        <div class="<?php echo esc_attr(implode(' ', $component_classes)); ?>" 
             <?php if ($custom_id): ?>id="<?php echo esc_attr($custom_id); ?>"<?php endif; ?>
             <?php if ($inline_vars): ?>style="<?php echo esc_attr($inline_vars); ?>"<?php endif; ?>
             <?php echo $data_attrs_string; ?>>
            <?php
            // Load template with proper error handling
            try {
                $this->load_component_template($component_type, array_merge($merged_data, array(
                    'component_id' => $component_id,
                    'post_id' => $post_id,
                    'data' => $component_data,
                    'is_frontend' => true,
                    'theme' => $this->current_theme
                )));
            } catch (Exception $e) {
                error_log('GMKB Frontend Error: Failed to load component template - ' . $e->getMessage());
                echo '<div class="gmkb-component-error">Component failed to load</div>';
            }
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
        
        // ROOT FIX: Debug template loading
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('🔍 GMKB Template Loading: ' . $component_type);
            error_log('  - Frontend template path: ' . $frontend_template);
            error_log('  - Frontend template exists: ' . (file_exists($frontend_template) ? 'YES' : 'NO'));
            error_log('  - Standard template path: ' . $template);
            error_log('  - Standard template exists: ' . (file_exists($template) ? 'YES' : 'NO'));
            error_log('  - Props keys: ' . implode(', ', array_keys($props)));
        }
        
        if (file_exists($frontend_template)) {
            $template_file = $frontend_template;
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('✅ GMKB: Using frontend template');
            }
        } elseif (file_exists($template)) {
            $template_file = $template;
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('✅ GMKB: Using standard template');
            }
        } else {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB: NO TEMPLATE FOUND - showing fallback');
            }
            echo $this->render_component_fallback($component_type, $props);
            return;
        }
        
        // ROOT FIX: Allow components to enrich their own props via filter
        // This maintains self-contained component architecture
        $props = apply_filters('gmkb_enrich_component_props', $props, $component_type, $props['post_id'] ?? 0);
        $props = apply_filters("gmkb_enrich_{$component_type}_props", $props, $props['post_id'] ?? 0);
        
        // ROOT FIX: Debug enriched props
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('📊 GMKB Enriched Props for ' . $component_type . ':');
            error_log('  - Keys: ' . implode(', ', array_keys($props)));
            if (isset($props['biography'])) {
                error_log('  - Has biography: ' . (strlen($props['biography']) > 0 ? 'YES (' . strlen($props['biography']) . ' chars)' : 'EMPTY'));
            }
            if (isset($props['name'])) {
                error_log('  - Name: ' . $props['name']);
            }
        }
        
        // Extract props as variables for template
        extract($props, EXTR_SKIP);
        
        // ROOT FIX: Include template with error handling
        try {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('✅ GMKB: Including template file: ' . $template_file);
            }
            include $template_file;
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('✅ GMKB: Template included successfully');
            }
        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB Template Error: ' . $e->getMessage());
            }
            echo $this->render_component_fallback($component_type, $props);
        }
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
     * ROOT FIX: Get vertical alignment CSS class for section columns
     * Reads from current section settings and returns appropriate class
     * 
     * @return string CSS class for vertical alignment
     */
    private function get_section_vertical_align_class() {
        if (!$this->current_section) {
            return 'gmkb-section__columns--valign-start'; // Default
        }
        
        // Get vertical align setting from section settings
        $section_settings = $this->current_section['settings'] ?? array();
        $vertical_align = $section_settings['verticalAlign'] ?? 'start';
        
        // Map to CSS class
        return 'gmkb-section__columns--valign-' . esc_attr($vertical_align);
    }
    
    // PHASE 3 BLOAT ELIMINATION: Deleted build_component_inline_styles() - 330+ lines removed
    // This legacy method generated CSS strings - replaced by token override system in build_token_overrides()
    
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
    
    // PHASE 3 BLOAT ELIMINATION: Deleted render_component_custom_css() - 15 lines removed
    // Custom CSS rendering no longer needed with token-based system
    
    // PHASE 3 BLOAT ELIMINATION: Deleted get_component_theme_styles() - 30 lines removed
    // Component theme styles now handled via CSS token inheritance
    
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
