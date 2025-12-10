<?php
/**
 * Biography Component - Data Integration
 * 
 * PHASE 8: Uses native WordPress post_meta ONLY - NO Pods dependency
 * 
 * @package Guestify/Components/Biography
 * @version 3.0.0-native
 */

if (!defined('ABSPATH')) {
    exit;
}

class Biography_Data_Integration {
    
    protected static $component_type = 'biography';
    
    /**
     * Load biography data from native WordPress meta
     */
    public static function load_component_data($post_id) {
        $result = array(
            'biography' => array(),
            'count' => 0,
            'source' => 'native_meta',
            'component_type' => self::$component_type,
            'success' => false,
            'message' => '',
            'timestamp' => current_time('mysql')
        );
        
        if (!is_numeric($post_id) || $post_id <= 0) {
            $result['message'] = 'Invalid post ID';
            return $result;
        }
        
        // Get biography from native WordPress meta
        $bio = get_post_meta($post_id, 'biography', true);
        
        // Fallbacks
        if (empty($bio)) {
            $bio = get_post_meta($post_id, 'introduction', true);
        }
        if (empty($bio)) {
            $bio = get_post_meta($post_id, 'biography_long', true);
        }
        
        if (!empty($bio)) {
            $result['biography']['biography'] = $bio;
            $result['count'] = 1;
            $result['success'] = true;
            $result['message'] = 'Loaded biography from native meta';
        } else {
            $result['message'] = 'No biography found';
        }
        
        return $result;
    }
    
    /**
     * Save biography data to native WordPress meta
     */
    public static function save_component_data($post_id, $data) {
        if (!is_numeric($post_id) || $post_id <= 0) {
            return array('success' => false, 'message' => 'Invalid post ID');
        }
        
        $bio = '';
        if (isset($data['biography']['biography'])) {
            $bio = $data['biography']['biography'];
        } elseif (isset($data['biography'])) {
            $bio = $data['biography'];
        } elseif (isset($data['bio'])) {
            $bio = $data['bio'];
        }
        
        update_post_meta($post_id, 'biography', sanitize_textarea_field($bio));
        
        return array('success' => true, 'message' => 'Biography saved');
    }
    
    /**
     * Check if biography data exists
     */
    public static function has_component_data($post_id) {
        if (!is_numeric($post_id) || $post_id <= 0) {
            return false;
        }
        
        $bio = get_post_meta($post_id, 'biography', true);
        if (!empty($bio)) return true;
        
        $bio = get_post_meta($post_id, 'introduction', true);
        return !empty($bio);
    }
    
    /**
     * Prepare template props
     */
    public static function prepare_template_props($component_data, $existing_props = array()) {
        $props = $existing_props;
        
        $bio = $component_data['biography']['biography'] ?? '';
        
        $props['bio'] = $bio;
        $props['biography'] = $bio;
        $props['bio_content'] = $bio;
        $props['content'] = $bio;
        
        return $props;
    }
}

/**
 * Enrich biography props for frontend rendering
 */
add_filter('gmkb_enrich_biography_props', function($props, $post_id) {
    // Get biography from native WordPress meta
    $bio = get_post_meta($post_id, 'biography', true);
    
    if (empty($bio)) {
        $bio = get_post_meta($post_id, 'introduction', true);
    }
    if (empty($bio)) {
        $bio = get_post_meta($post_id, 'biography_long', true);
    }
    
    $props['bio'] = $bio;
    $props['biography'] = $bio;
    $props['bio_content'] = $bio;
    $props['content'] = $bio;
    
    return $props;
}, 10, 2);
