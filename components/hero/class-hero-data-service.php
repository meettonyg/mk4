<?php
/**
 * Hero Component Data Service - SCALABLE ARCHITECTURE EXAMPLE
 * 
 * Demonstrates how to create component-specific services using Base_Component_Data_Service
 * This serves as a template for all other components
 * 
 * @package Guestify/Components/Hero
 * @version 1.0.0-scalable-base-service
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Load base service if not already loaded
if (!class_exists('Base_Component_Data_Service')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/Base_Component_Data_Service.php';
}

class Hero_Data_Service extends Base_Component_Data_Service {
    
    /**
     * Component type identifier
     */
    protected static $component_type = 'hero';
    
    /**
     * SCALABLE: Get unified component data
     * Implements base class abstract method for hero component
     * 
     * @param string $context Context where data is requested
     * @return array Hero component data
     */
    public static function get_unified_component_data($context = 'unknown') {
        // Use base class unified post ID detection
        $post_id_result = self::detect_post_id($context);
        $current_post_id = $post_id_result['post_id'];
        $post_id_source = $post_id_result['source'];
        
        // Load hero data using component-specific logic
        $hero_result = self::load_hero_data($current_post_id);
        
        // Comprehensive result using base class patterns
        $result = array(
            'hero_data' => $hero_result['data'],
            'post_id' => $current_post_id,
            'post_id_source' => $post_id_source,
            'data_source' => $hero_result['source'],
            'success' => $hero_result['success'],
            'message' => $hero_result['message'],
            'context' => $context,
            'component_type' => self::$component_type,
            'timestamp' => current_time('mysql'),
            'debug_info' => array(
                'post_id_methods' => $post_id_result['debug'],
                'data_methods' => $hero_result['debug'],
                'cache_stats' => self::get_cache_stats()
            )
        );
        
        // Enhanced debugging for scalable architecture
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("SCALABLE HERO: Context [{$context}] Post ID {$current_post_id} ({$post_id_source}), " . 
                     "data from {$result['data_source']}");
        }
        
        return $result;
    }
    
    /**
     * SCALABLE: Get component data for preview area
     * Implements base class abstract method
     * 
     * @param string $context Context identifier
     * @return array Preview-formatted data
     */
    public static function get_preview_data($context = 'preview') {
        $data = self::get_unified_component_data($context);
        
        return array(
            'hero_data' => $data['hero_data'],
            'found' => $data['success'],
            'loading_source' => $data['data_source'],
            'post_id' => $data['post_id'],
            'container_class' => $data['success'] ? 'has-hero-data' : 'no-hero-data',
            'component_type' => self::$component_type,
            'debug' => defined('WP_DEBUG') && WP_DEBUG ? $data['debug_info'] : null
        );
    }
    
    /**
     * SCALABLE: Get component data for sidebar/design panel
     * Implements base class abstract method
     * 
     * @param string $context Context identifier
     * @return array Sidebar-formatted data
     */
    public static function get_sidebar_data($context = 'sidebar') {
        $data = self::get_unified_component_data($context);
        
        return array(
            'hero_data' => $data['hero_data'],
            'found' => $data['success'],
            'post_id' => $data['post_id'],
            'message' => $data['message'],
            'component_type' => self::$component_type,
            'debug' => defined('WP_DEBUG') && WP_DEBUG ? $data['debug_info'] : null
        );
    }
    
    /**
     * HERO-SPECIFIC: Load hero data from multiple sources
     * 
     * @param int $post_id Post ID to load hero data from
     * @return array Hero data result
     */
    private static function load_hero_data($post_id) {
        $hero_data = array();
        $data_source = 'none';
        $success = false;
        $message = 'No hero data found';
        
        $debug_methods = array(
            'component_data' => null,
            'post_meta' => array(),
            'user_meta' => array(),
            'defaults' => array()
        );
        
        if ($post_id <= 0) {
            return array(
                'data' => $hero_data,
                'source' => $data_source,
                'success' => $success,
                'message' => 'No valid post ID detected',
                'debug' => $debug_methods
            );
        }
        
        // SCALABLE: Try to load from base class component data first
        $component_data = self::load_component_data($post_id);
        if (!empty($component_data)) {
            $debug_methods['component_data'] = $component_data;
            $hero_data = $component_data;
            $success = true;
            $data_source = 'component_data_scalable';
        }
        
        // LEGACY: Load from individual post meta fields
        if (!$success) {
            $meta_fields = array(
                'hero_name' => get_post_meta($post_id, 'hero_name', true),
                'hero_title' => get_post_meta($post_id, 'hero_title', true),
                'hero_bio' => get_post_meta($post_id, 'hero_bio', true),
                'hero_image' => get_post_meta($post_id, 'hero_image', true),
                'hero_bg_style' => get_post_meta($post_id, 'hero_bg_style', true),
                'hero_bg_color' => get_post_meta($post_id, 'hero_bg_color', true),
                'hero_text_color' => get_post_meta($post_id, 'hero_text_color', true)
            );
            
            $debug_methods['post_meta'] = $meta_fields;
            
            // Check if we have any hero data
            $has_data = false;
            foreach ($meta_fields as $key => $value) {
                if (!empty($value)) {
                    $has_data = true;
                    break;
                }
            }
            
            if ($has_data) {
                $hero_data = $meta_fields;
                $success = true;
                $data_source = 'post_meta_legacy';
            }
        }
        
        // FALLBACK: Default hero data from post
        if (!$success) {
            $post = get_post($post_id);
            if ($post) {
                $hero_data = array(
                    'hero_name' => $post->post_title,
                    'hero_title' => get_the_author_meta('description', $post->post_author),
                    'hero_bio' => wp_trim_words($post->post_content, 30),
                    'hero_image' => get_the_post_thumbnail_url($post_id, 'medium'),
                    'hero_bg_style' => 'gradient',
                    'hero_bg_color' => '#f8fafc',
                    'hero_text_color' => '#1e293b'
                );
                
                $debug_methods['defaults'] = $hero_data;
                $success = true;
                $data_source = 'post_defaults';
            }
        }
        
        // Update message
        if ($success) {
            $message = "Hero data loaded from {$data_source}";
        } else {
            $message = "No hero data found in post {$post_id}";
        }
        
        return array(
            'data' => $hero_data,
            'source' => $data_source,
            'success' => $success,
            'message' => $message,
            'debug' => $debug_methods
        );
    }
    
    /**
     * SCALABLE: Save hero data using base class patterns
     * 
     * @param int   $post_id   Post ID to save to
     * @param array $hero_data Hero data to save
     * @param array $options   Save options
     * @return bool Success status
     */
    public static function save_hero_data($post_id, $hero_data, $options = array()) {
        if ($post_id <= 0 || !is_array($hero_data)) {
            return false;
        }
        
        // Use base class save method
        $scalable_save = parent::save_component_data($post_id, $hero_data, $options);
        
        // BACKWARD COMPATIBILITY: Also save individual meta fields
        $legacy_save = true;
        $meta_fields = array(
            'hero_name', 'hero_title', 'hero_bio', 'hero_image',
            'hero_bg_style', 'hero_bg_color', 'hero_text_color'
        );
        
        foreach ($meta_fields as $field) {
            if (isset($hero_data[$field])) {
                $result = update_post_meta($post_id, $field, sanitize_text_field($hero_data[$field]));
                if ($result === false) {
                    $legacy_save = false;
                }
            }
        }
        
        $overall_success = $scalable_save && $legacy_save;
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("SCALABLE HERO: Saved hero data to post {$post_id}");
            error_log("  Scalable save: " . ($scalable_save ? 'SUCCESS' : 'FAILED'));
            error_log("  Legacy save: " . ($legacy_save ? 'SUCCESS' : 'FAILED'));
        }
        
        return $overall_success;
    }
    
    /**
     * SCALABLE: Validate hero data
     * Override base class method for hero-specific validation
     * 
     * @param array $data Hero data to validate
     * @return array|false Validated data or false on failure
     */
    protected static function validate_component_data($data) {
        if (!is_array($data)) {
            return false;
        }
        
        // Validate required fields
        $required_fields = array('hero_name');
        foreach ($required_fields as $field) {
            if (empty($data[$field])) {
                return false;
            }
        }
        
        // Sanitize and validate each field
        $validated = array();
        $validated['hero_name'] = sanitize_text_field($data['hero_name']);
        $validated['hero_title'] = sanitize_text_field($data['hero_title'] ?? '');
        $validated['hero_bio'] = sanitize_textarea_field($data['hero_bio'] ?? '');
        $validated['hero_image'] = esc_url_raw($data['hero_image'] ?? '');
        $validated['hero_bg_style'] = in_array($data['hero_bg_style'] ?? '', array('gradient', 'solid', 'image', 'pattern')) 
                                     ? $data['hero_bg_style'] : 'gradient';
        $validated['hero_bg_color'] = sanitize_hex_color($data['hero_bg_color'] ?? '#f8fafc');
        $validated['hero_text_color'] = sanitize_hex_color($data['hero_text_color'] ?? '#1e293b');
        
        return $validated;
    }
}

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ SCALABLE HERO: Hero Data Service loaded with scalable base architecture');
}
