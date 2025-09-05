<?php
/**
 * Theme System AJAX Handlers
 * Phase 4: Theme Layer System
 * 
 * Handles AJAX requests for theme management
 * 
 * @package GMKB
 * @version 4.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Handle theme save AJAX request
 */
add_action('wp_ajax_gmkb_save_theme', 'gmkb_ajax_save_theme');
add_action('wp_ajax_nopriv_gmkb_save_theme', 'gmkb_ajax_save_theme');

function gmkb_ajax_save_theme() {
    // Verify nonce
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
        wp_send_json_error('Invalid security token');
        return;
    }
    
    // Get parameters
    $theme_id = sanitize_text_field($_POST['theme_id'] ?? '');
    $theme_data = $_POST['theme_data'] ?? '';
    $post_id = intval($_POST['post_id'] ?? 0);
    
    if (empty($theme_id)) {
        wp_send_json_error('Theme ID is required');
        return;
    }
    
    // Decode theme data
    $theme_data_array = json_decode(stripslashes($theme_data), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        wp_send_json_error('Invalid theme data format');
        return;
    }
    
    // Save to user meta for global preference
    $user_id = get_current_user_id();
    if ($user_id > 0) {
        update_user_meta($user_id, 'gmkb_preferred_theme', $theme_id);
        update_user_meta($user_id, 'gmkb_theme_settings_' . $theme_id, $theme_data_array);
    }
    
    // Save to post meta if post ID provided
    if ($post_id > 0) {
        update_post_meta($post_id, 'gmkb_theme', $theme_id);
        update_post_meta($post_id, 'gmkb_theme_settings', $theme_data_array);
        
        // Also update the media kit state with theme info
        $media_kit_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        if (!is_array($media_kit_state)) {
            $media_kit_state = array();
        }
        
        if (!isset($media_kit_state['globalSettings'])) {
            $media_kit_state['globalSettings'] = array();
        }
        
        $media_kit_state['globalSettings']['theme'] = $theme_id;
        $media_kit_state['globalSettings']['themeSettings'] = $theme_data_array;
        
        update_post_meta($post_id, 'gmkb_media_kit_state', $media_kit_state);
    }
    
    // Save to options table for site-wide defaults
    update_option('gmkb_current_theme', $theme_id);
    update_option('gmkb_theme_' . $theme_id, $theme_data_array);
    
    wp_send_json_success(array(
        'message' => 'Theme saved successfully',
        'theme_id' => $theme_id,
        'post_id' => $post_id,
        'user_id' => $user_id
    ));
}

/**
 * Handle get theme AJAX request
 */
add_action('wp_ajax_gmkb_get_theme', 'gmkb_ajax_get_theme');
add_action('wp_ajax_nopriv_gmkb_get_theme', 'gmkb_ajax_get_theme');

function gmkb_ajax_get_theme() {
    // Verify nonce
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
        wp_send_json_error('Invalid security token');
        return;
    }
    
    $post_id = intval($_POST['post_id'] ?? 0);
    $user_id = get_current_user_id();
    
    // Try to get theme from post meta first
    $theme_id = '';
    $theme_settings = array();
    
    if ($post_id > 0) {
        $theme_id = get_post_meta($post_id, 'gmkb_theme', true);
        $theme_settings = get_post_meta($post_id, 'gmkb_theme_settings', true);
    }
    
    // Fallback to user preference
    if (empty($theme_id) && $user_id > 0) {
        $theme_id = get_user_meta($user_id, 'gmkb_preferred_theme', true);
        if ($theme_id) {
            $theme_settings = get_user_meta($user_id, 'gmkb_theme_settings_' . $theme_id, true);
        }
    }
    
    // Fallback to site default
    if (empty($theme_id)) {
        $theme_id = get_option('gmkb_current_theme', 'default');
        $theme_settings = get_option('gmkb_theme_' . $theme_id, array());
    }
    
    wp_send_json_success(array(
        'theme_id' => $theme_id,
        'theme_settings' => $theme_settings,
        'source' => $post_id > 0 ? 'post' : ($user_id > 0 ? 'user' : 'site')
    ));
}

/**
 * Handle get templates AJAX request
 */
add_action('wp_ajax_gmkb_get_templates', 'gmkb_ajax_get_templates');
add_action('wp_ajax_nopriv_gmkb_get_templates', 'gmkb_ajax_get_templates');

function gmkb_ajax_get_templates() {
    // Verify nonce
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
        wp_send_json_error('Invalid security token');
        return;
    }
    
    // Get predefined templates
    $templates = array(
        array(
            'id' => 'professional',
            'name' => 'Professional Speaker',
            'description' => 'Clean, professional layout perfect for keynote speakers and thought leaders',
            'thumbnail' => '',
            'components' => array('hero', 'biography', 'topics', 'contact'),
            'theme' => 'professional_clean'
        ),
        array(
            'id' => 'creative',
            'name' => 'Creative Expert',
            'description' => 'Bold, creative design that stands out and captures attention',
            'thumbnail' => '',
            'components' => array('hero', 'biography', 'topics', 'social', 'contact'),
            'theme' => 'creative_bold'
        ),
        array(
            'id' => 'minimal',
            'name' => 'Minimalist',
            'description' => 'Simple, elegant layout that focuses on your content',
            'thumbnail' => '',
            'components' => array('hero', 'biography', 'contact'),
            'theme' => 'minimal_elegant'
        ),
        array(
            'id' => 'corporate',
            'name' => 'Corporate Executive',
            'description' => 'Traditional, professional layout for business leaders',
            'thumbnail' => '',
            'components' => array('hero', 'biography', 'topics', 'testimonials', 'contact'),
            'theme' => 'professional_clean'
        ),
        array(
            'id' => 'influencer',
            'name' => 'Social Influencer',
            'description' => 'Modern layout optimized for social media presence',
            'thumbnail' => '',
            'components' => array('hero', 'biography', 'social', 'topics', 'contact'),
            'theme' => 'modern_dark'
        ),
        array(
            'id' => 'author',
            'name' => 'Author & Writer',
            'description' => 'Content-focused layout for authors and writers',
            'thumbnail' => '',
            'components' => array('hero', 'biography', 'topics', 'testimonials', 'contact'),
            'theme' => 'minimal_elegant'
        )
    );
    
    // Allow filtering of templates
    $templates = apply_filters('gmkb_templates', $templates);
    
    wp_send_json_success(array(
        'templates' => $templates,
        'count' => count($templates)
    ));
}

/**
 * Handle load template AJAX request
 */
add_action('wp_ajax_gmkb_load_template', 'gmkb_ajax_load_template');
add_action('wp_ajax_nopriv_gmkb_load_template', 'gmkb_ajax_load_template');

function gmkb_ajax_load_template() {
    // Verify nonce
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
        wp_send_json_error('Invalid security token');
        return;
    }
    
    $template_id = sanitize_text_field($_POST['template_id'] ?? '');
    $post_id = intval($_POST['post_id'] ?? 0);
    
    if (empty($template_id)) {
        wp_send_json_error('Template ID is required');
        return;
    }
    
    // Get template configuration
    $template_configs = array(
        'professional' => array(
            'theme' => 'professional_clean',
            'components' => array(
                array('type' => 'hero', 'props' => array('layout' => 'center', 'style' => 'professional')),
                array('type' => 'biography', 'props' => array('style' => 'professional', 'layout' => 'two-column')),
                array('type' => 'topics', 'props' => array('columns' => 2, 'style' => 'cards')),
                array('type' => 'contact', 'props' => array('style' => 'minimal'))
            ),
            'sections' => array(
                array('type' => 'full_width', 'options' => array())
            )
        ),
        'creative' => array(
            'theme' => 'creative_bold',
            'components' => array(
                array('type' => 'hero', 'props' => array('layout' => 'asymmetric', 'style' => 'creative')),
                array('type' => 'biography', 'props' => array('style' => 'creative', 'layout' => 'full-width')),
                array('type' => 'topics', 'props' => array('columns' => 3, 'style' => 'colorful')),
                array('type' => 'social', 'props' => array('style' => 'colorful', 'size' => 'large')),
                array('type' => 'contact', 'props' => array('style' => 'bold'))
            ),
            'sections' => array(
                array('type' => 'full_width', 'options' => array()),
                array('type' => 'two_column', 'options' => array('ratio' => '60-40'))
            )
        ),
        'minimal' => array(
            'theme' => 'minimal_elegant',
            'components' => array(
                array('type' => 'hero', 'props' => array('layout' => 'minimal', 'style' => 'clean')),
                array('type' => 'biography', 'props' => array('style' => 'minimal', 'layout' => 'single-column')),
                array('type' => 'contact', 'props' => array('style' => 'minimal'))
            ),
            'sections' => array(
                array('type' => 'full_width', 'options' => array('padding' => 'large'))
            )
        ),
        'corporate' => array(
            'theme' => 'professional_clean',
            'components' => array(
                array('type' => 'hero', 'props' => array('layout' => 'corporate', 'style' => 'formal')),
                array('type' => 'biography', 'props' => array('style' => 'formal', 'layout' => 'structured')),
                array('type' => 'topics', 'props' => array('columns' => 2, 'style' => 'list')),
                array('type' => 'testimonials', 'props' => array('style' => 'corporate')),
                array('type' => 'contact', 'props' => array('style' => 'professional'))
            ),
            'sections' => array(
                array('type' => 'full_width', 'options' => array()),
                array('type' => 'three_column', 'options' => array())
            )
        )
    );
    
    // Allow filtering of template configurations
    $template_configs = apply_filters('gmkb_template_configs', $template_configs);
    
    if (!isset($template_configs[$template_id])) {
        wp_send_json_error('Template not found');
        return;
    }
    
    $config = $template_configs[$template_id];
    
    // If post ID provided, save the template configuration
    if ($post_id > 0) {
        // Clear existing state and apply template
        $new_state = array(
            'components' => array(),
            'layout' => array(),
            'sections' => array(),
            'globalSettings' => array(
                'theme' => $config['theme']
            ),
            'saved_components' => array()
        );
        
        // Generate component IDs and add to state
        foreach ($config['components'] as $index => $component) {
            $component_id = 'component_' . wp_generate_uuid4();
            $new_state['components'][$component_id] = array(
                'type' => $component['type'],
                'props' => $component['props'],
                'data' => $component['props'],
                'timestamp' => time()
            );
            $new_state['layout'][] = $component_id;
            $new_state['saved_components'][] = array(
                'id' => $component_id,
                'type' => $component['type'],
                'props' => $component['props'],
                'data' => $component['props']
            );
        }
        
        // Add sections
        $new_state['sections'] = $config['sections'];
        
        // Save state
        update_post_meta($post_id, 'gmkb_media_kit_state', $new_state);
        update_post_meta($post_id, 'gmkb_theme', $config['theme']);
    }
    
    wp_send_json_success(array(
        'message' => 'Template loaded successfully',
        'template_id' => $template_id,
        'config' => $config,
        'post_id' => $post_id
    ));
}

// Log that theme AJAX handlers are loaded
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ GMKB Phase 4: Theme AJAX handlers loaded');
}
