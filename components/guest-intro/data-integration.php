<?php
/**
 * Guest Intro Component - Data Integration
 * 
 * PHASE 8: Uses native WordPress post_meta ONLY - NO Pods dependency
 * 
 * @package Guestify/Components/GuestIntro
 * @version 3.0.0-native
 */

if (!defined('ABSPATH')) {
    exit;
}

class Guest_Intro_Data_Integration {
    
    protected static $component_type = 'guest-intro';
    
    /**
     * Load guest intro data from native WordPress meta
     */
    public static function load_component_data($post_id) {
        $result = array(
            'intro' => array(),
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
        
        // Get introduction from native WordPress meta
        $introduction = get_post_meta($post_id, 'introduction', true);
        
        // Fallback to biography if introduction is empty
        if (empty($introduction)) {
            $introduction = get_post_meta($post_id, 'biography', true);
        }
        
        if (!empty($introduction)) {
            $result['intro']['introduction'] = $introduction;
            $result['count'] = 1;
            $result['success'] = true;
            $result['message'] = 'Loaded introduction from native meta';
        } else {
            $result['message'] = 'No introduction found';
        }
        
        return $result;
    }
    
    /**
     * Save guest intro data to native WordPress meta
     */
    public static function save_component_data($post_id, $data) {
        if (!is_numeric($post_id) || $post_id <= 0) {
            return array('success' => false, 'message' => 'Invalid post ID');
        }
        
        $intro = '';
        if (isset($data['intro']['introduction'])) {
            $intro = $data['intro']['introduction'];
        } elseif (isset($data['introduction'])) {
            $intro = $data['introduction'];
        }
        
        update_post_meta($post_id, 'introduction', sanitize_textarea_field($intro));
        
        return array('success' => true, 'message' => 'Introduction saved');
    }
    
    /**
     * Check if guest intro data exists
     */
    public static function has_component_data($post_id) {
        if (!is_numeric($post_id) || $post_id <= 0) {
            return false;
        }
        
        $intro = get_post_meta($post_id, 'introduction', true);
        if (!empty($intro)) return true;
        
        $bio = get_post_meta($post_id, 'biography', true);
        return !empty($bio);
    }
    
    /**
     * Prepare template props
     */
    public static function prepare_template_props($component_data, $existing_props = array()) {
        $props = $existing_props;
        
        $intro = $component_data['intro']['introduction'] ?? '';
        
        $props['introduction'] = $intro;
        $props['has_intro'] = !empty($intro);
        
        return $props;
    }
}

/**
 * Enrich guest-intro props for frontend rendering
 */
add_filter('gmkb_enrich_guest-intro_props', function($props, $post_id) {
    // Get introduction from native WordPress meta
    $introduction = get_post_meta($post_id, 'introduction', true);
    
    if (empty($introduction)) {
        $introduction = get_post_meta($post_id, 'biography', true);
    }
    
    $props['introduction'] = $introduction;
    $props['has_intro'] = !empty($introduction);
    
    return $props;
}, 10, 2);
