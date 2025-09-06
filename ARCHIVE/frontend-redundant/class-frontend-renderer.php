<?php
/**
 * Frontend Media Kit Renderer
 * 
 * Handles rendering of saved media kits on the public-facing website
 * Converts saved JSON data into HTML with proper theme application
 * 
 * @package GMKB/Frontend
 * @version 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Frontend_Renderer {
    
    /**
     * Instance holder
     */
    private static $instance = null;
    
    /**
     * Current media kit data
     */
    private $media_kit_data = null;
    
    /**
     * Current post ID
     */
    private $post_id = 0;
    
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
        // Hook into WordPress
        add_action('init', array($this, 'init'));
        
        // Add shortcode for embedding media kits
        add_shortcode('gmkb_media_kit', array($this, 'render_media_kit_shortcode'));
        
        // Add filter for the_content to auto-inject media kit
        add_filter('the_content', array($this, 'maybe_inject_media_kit'), 20);
    }
    
    /**
     * Initialize
     */
    public function init() {
        // Register frontend assets
        add_action('wp_enqueue_scripts', array($this, 'register_frontend_assets'));
    }
    
    /**
     * Register frontend assets
     */
    public function register_frontend_assets() {
        // Register styles
        wp_register_style(
            'gmkb-frontend',
            GMKB_PLUGIN_URL . 'css/frontend-mediakit.css',
            array(),
            GMKB_VERSION
        );
        
        // Register component styles
        wp_register_style(
            'gmkb-components',
            GMKB_PLUGIN_URL . 'css/modules/components.css',
            array('gmkb-frontend'),
            GMKB_VERSION
        );
        
        // Register theme variables
        wp_register_style(
            'gmkb-theme-variables',
            GMKB_PLUGIN_URL . 'css/theme-variables.css',
            array(),
            GMKB_VERSION
        );
        
        // Register scripts
        wp_register_script(
            'gmkb-frontend',
            GMKB_PLUGIN_URL . 'js/frontend-mediakit.js',
            array(),
            GMKB_VERSION,
            true
        );
    }
    
    /**
     * Maybe inject media kit into content
     */
    public function maybe_inject_media_kit($content) {
        // Only on singular guest posts
        if (!is_singular('guests')) {
            return $content;
        }
        
        // Check if media kit exists
        $post_id = get_the_ID();
        if (!$this->has_media_kit($post_id)) {
            return $content;
        }
        
        // Check if content already has shortcode
        if (has_shortcode($content, 'gmkb_media_kit')) {
            return $content;
        }
        
        // Get position setting
        $position = get_post_meta($post_id, 'gmkb_display_position', true);
        if (!$position) {
            $position = 'replace'; // Default to replacing content
        }
        
        // Render media kit
        $media_kit_html = $this->render_media_kit($post_id);
        
        // Insert based on position
        switch ($position) {
            case 'before':
                return $media_kit_html . $content;
                
            case 'after':
                return $content . $media_kit_html;
                
            case 'replace':
            default:
                return $media_kit_html;
        }
    }
    
    /**
     * Render media kit shortcode
     */
    public function render_media_kit_shortcode($atts) {
        $atts = shortcode_atts(array(
            'id' => get_the_ID(),
            'theme' => '',
            'class' => '',
        ), $atts, 'gmkb_media_kit');
        
        $post_id = intval($atts['id']);
        
        if (!$post_id || !$this->has_media_kit($post_id)) {
            return '<!-- Media Kit not found -->';
        }
        
        return $this->render_media_kit($post_id, $atts);
    }
    
    /**
     * Check if post has media kit
     */
    public function has_media_kit($post_id) {
        $media_kit_data = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        
        if (empty($media_kit_data) || !is_array($media_kit_data)) {
            return false;
        }
        
        // Check for components
        return !empty($media_kit_data['saved_components']) || !empty($media_kit_data['components']);
    }
    
    /**
     * Render media kit
     */
    public function render_media_kit($post_id, $args = array()) {
        // Get media kit data
        $this->media_kit_data = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        $this->post_id = $post_id;
        
        if (empty($this->media_kit_data)) {
            return '';
        }
        
        // Enqueue required assets
        wp_enqueue_style('gmkb-frontend');
        wp_enqueue_style('gmkb-components');
        wp_enqueue_style('gmkb-theme-variables');
        wp_enqueue_script('gmkb-frontend');
        
        // Apply theme CSS if specified
        $theme = isset($args['theme']) ? $args['theme'] : 
                 (isset($this->media_kit_data['globalSettings']['theme']) ? 
                  $this->media_kit_data['globalSettings']['theme'] : '');
        
        if ($theme) {
            $this->apply_theme_css($theme);
        }
        
        // Localize script data
        wp_localize_script('gmkb-frontend', 'gmkbFrontend', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'postId' => $post_id,
            'theme' => $theme,
            'nonce' => wp_create_nonce('gmkb_frontend')
        ));
        
        // Start output buffering
        ob_start();
        
        // Render the media kit
        $this->render_media_kit_html($args);
        
        return ob_get_clean();
    }
    
    /**
     * Apply theme CSS
     */
    private function apply_theme_css($theme_id) {
        // Load theme data
        $theme_file = GMKB_PLUGIN_DIR . "themes/{$theme_id}/theme.json";
        
        if (!file_exists($theme_file)) {
            return;
        }
        
        $theme_data = json_decode(file_get_contents($theme_file), true);
        
        if (!$theme_data) {
            return;
        }
        
        // Generate CSS variables
        $css = $this->generate_theme_css($theme_data);
        
        // Add inline CSS
        wp_add_inline_style('gmkb-theme-variables', $css);
    }
    
    /**
     * Generate theme CSS from theme data
     */
    private function generate_theme_css($theme) {
        $css_vars = array();
        
        // Typography
        if (isset($theme['typography'])) {
            $typo = $theme['typography'];
            
            if (isset($typo['primary_font']['family'])) {
                $css_vars[] = "--gmkb-font-primary: {$typo['primary_font']['family']}";
            }
            if (isset($typo['heading_font']['family'])) {
                $css_vars[] = "--gmkb-font-heading: {$typo['heading_font']['family']}";
            }
            if (isset($typo['font_scale'])) {
                $css_vars[] = "--gmkb-font-scale: {$typo['font_scale']}";
            }
        }
        
        // Colors
        if (isset($theme['colors'])) {
            foreach ($theme['colors'] as $key => $value) {
                $var_name = str_replace('_', '-', $key);
                $css_vars[] = "--gmkb-color-{$var_name}: {$value}";
            }
        }
        
        // Spacing
        if (isset($theme['spacing'])) {
            foreach ($theme['spacing'] as $key => $value) {
                $var_name = str_replace('_', '-', $key);
                $css_vars[] = "--gmkb-spacing-{$var_name}: {$value}";
            }
        }
        
        // Effects
        if (isset($theme['effects'])) {
            foreach ($theme['effects'] as $key => $value) {
                $var_name = str_replace('_', '-', $key);
                $css_vars[] = "--gmkb-{$var_name}: {$value}";
            }
        }
        
        return ":root {\n  " . implode(";\n  ", $css_vars) . ";\n}";
    }
    
    /**
     * Render media kit HTML
     */
    private function render_media_kit_html($args = array()) {
        $class = isset($args['class']) ? $args['class'] : '';
        
        // Get components and sections
        $sections = isset($this->media_kit_data['sections']) ? $this->media_kit_data['sections'] : array();
        $components = $this->get_ordered_components();
        
        ?>
        <div class="gmkb-media-kit-container gmkb-frontend-display <?php echo esc_attr($class); ?>" 
             data-post-id="<?php echo esc_attr($this->post_id); ?>">
            
            <?php if (empty($components)): ?>
                <div class="gmkb-empty-state">
                    <p><?php _e('Media kit content is being prepared.', 'gmkb'); ?></p>
                </div>
            <?php elseif (!empty($sections)): ?>
                <?php $this->render_with_sections($sections, $components); ?>
            <?php else: ?>
                <?php $this->render_components_only($components); ?>
            <?php endif; ?>
            
        </div>
        <?php
    }
    
    /**
     * Get ordered components
     */
    private function get_ordered_components() {
        $components = array();
        
        // Try saved_components first (already ordered)
        if (!empty($this->media_kit_data['saved_components'])) {
            return $this->media_kit_data['saved_components'];
        }
        
        // Try layout order with components map
        if (!empty($this->media_kit_data['layout']) && !empty($this->media_kit_data['components'])) {
            foreach ($this->media_kit_data['layout'] as $component_id) {
                if (isset($this->media_kit_data['components'][$component_id])) {
                    $component = $this->media_kit_data['components'][$component_id];
                    $component['id'] = $component_id;
                    $components[] = $component;
                }
            }
            return $components;
        }
        
        // Fallback to components map
        if (!empty($this->media_kit_data['components'])) {
            foreach ($this->media_kit_data['components'] as $id => $component) {
                $component['id'] = $id;
                $components[] = $component;
            }
        }
        
        return $components;
    }
    
    /**
     * Render with sections
     */
    private function render_with_sections($sections, $components) {
        ?>
        <div class="gmkb-sections-wrapper">
            <?php foreach ($sections as $section): ?>
                <?php $this->render_section($section, $components); ?>
            <?php endforeach; ?>
        </div>
        <?php
    }
    
    /**
     * Render a single section
     */
    private function render_section($section, $all_components) {
        $section_id = isset($section['section_id']) ? $section['section_id'] : '';
        $section_type = isset($section['section_type']) ? $section['section_type'] : 'full_width';
        $section_layout = isset($section['layout']) ? $section['layout'] : array();
        
        ?>
        <section class="gmkb-section gmkb-section--<?php echo esc_attr($section_type); ?>"
                 data-section-id="<?php echo esc_attr($section_id); ?>">
            
            <div class="gmkb-section-inner">
                <?php
                // Get components for this section
                $section_components = $this->get_section_components($section, $all_components);
                
                // Render based on section type
                if ($section_type === 'two_column' || $section_type === 'three_column') {
                    $this->render_multi_column_section($section, $section_components);
                } else {
                    $this->render_single_column_section($section_components);
                }
                ?>
            </div>
        </section>
        <?php
    }
    
    /**
     * Get components for a section
     */
    private function get_section_components($section, $all_components) {
        $section_components = array();
        
        if (!empty($section['components'])) {
            foreach ($section['components'] as $comp_ref) {
                $component_id = $comp_ref['component_id'];
                
                // Find component in all components
                foreach ($all_components as $component) {
                    if ($component['id'] === $component_id) {
                        $component['column'] = isset($comp_ref['column']) ? $comp_ref['column'] : 1;
                        $section_components[] = $component;
                        break;
                    }
                }
            }
        }
        
        return $section_components;
    }
    
    /**
     * Render multi-column section
     */
    private function render_multi_column_section($section, $components) {
        $columns = isset($section['layout']['columns']) ? $section['layout']['columns'] : 2;
        
        // Group components by column
        $column_groups = array();
        for ($i = 1; $i <= $columns; $i++) {
            $column_groups[$i] = array();
        }
        
        foreach ($components as $component) {
            $column = isset($component['column']) ? $component['column'] : 1;
            $column_groups[$column][] = $component;
        }
        
        ?>
        <div class="gmkb-section-columns gmkb-columns--<?php echo esc_attr($columns); ?>">
            <?php for ($i = 1; $i <= $columns; $i++): ?>
                <div class="gmkb-section-column" data-column="<?php echo $i; ?>">
                    <?php
                    if (!empty($column_groups[$i])) {
                        foreach ($column_groups[$i] as $component) {
                            $this->render_component($component);
                        }
                    }
                    ?>
                </div>
            <?php endfor; ?>
        </div>
        <?php
    }
    
    /**
     * Render single column section
     */
    private function render_single_column_section($components) {
        foreach ($components as $component) {
            $this->render_component($component);
        }
    }
    
    /**
     * Render components only (no sections)
     */
    private function render_components_only($components) {
        ?>
        <div class="gmkb-components-wrapper">
            <?php foreach ($components as $component): ?>
                <?php $this->render_component($component); ?>
            <?php endforeach; ?>
        </div>
        <?php
    }
    
    /**
     * Render a single component
     */
    private function render_component($component) {
        $type = isset($component['type']) ? $component['type'] : 'unknown';
        $id = isset($component['id']) ? $component['id'] : '';
        $props = isset($component['props']) ? $component['props'] : array();
        $data = isset($component['data']) ? $component['data'] : array();
        
        // Merge props and data for backward compatibility
        $component_data = array_merge($data, $props);
        
        ?>
        <div class="gmkb-component gmkb-component--<?php echo esc_attr($type); ?>"
             data-component-id="<?php echo esc_attr($id); ?>"
             data-component-type="<?php echo esc_attr($type); ?>">
            
            <?php
            // Try to load component-specific renderer
            $renderer_file = GMKB_PLUGIN_DIR . "components/{$type}/frontend-renderer.php";
            
            if (file_exists($renderer_file)) {
                include $renderer_file;
            } else {
                // Use generic renderer
                $this->render_component_generic($type, $component_data);
            }
            ?>
        </div>
        <?php
    }
    
    /**
     * Generic component renderer
     */
    private function render_component_generic($type, $data) {
        // Load component template if exists
        $template_file = GMKB_PLUGIN_DIR . "components/{$type}/template.php";
        
        if (file_exists($template_file)) {
            // Extract data as variables
            extract($data, EXTR_SKIP);
            
            // Set additional variables
            $props = $data;
            $is_frontend = true;
            $post_id = $this->post_id;
            
            // Include template
            include $template_file;
        } else {
            // Fallback display
            echo '<div class="gmkb-component-content">';
            echo '<p>' . sprintf(__('Component type "%s" display not available.', 'gmkb'), esc_html($type)) . '</p>';
            echo '</div>';
        }
    }
}

// Initialize
GMKB_Frontend_Renderer::get_instance();

// Helper function for templates
function gmkb_render_media_kit($post_id = null, $args = array()) {
    if (!$post_id) {
        $post_id = get_the_ID();
    }
    
    return GMKB_Frontend_Renderer::get_instance()->render_media_kit($post_id, $args);
}

// Helper function to check if post has media kit
function gmkb_has_media_kit($post_id = null) {
    if (!$post_id) {
        $post_id = get_the_ID();
    }
    
    return GMKB_Frontend_Renderer::get_instance()->has_media_kit($post_id);
}
