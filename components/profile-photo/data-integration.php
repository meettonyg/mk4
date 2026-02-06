<?php
/**
 * Profile Photo Component - Data Integration
 * 
 * PHASE 8: Uses native WordPress post_meta ONLY - NO Pods dependency
 * SINGLE field pattern: One field, single data type, one purpose
 * 
 * @package Guestify/Components/ProfilePhoto
 * @version 3.0.0-native
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Profile Photo Data Integration
 * ARCHITECTURAL PRINCIPLE: One component = one data pattern
 * This component handles ONLY the profile_photo SINGLE field
 * For multiple photos, use the Photo Gallery component
 */
class Profile_Photo_Data_Integration {
    
    /**
     * Component identifier
     */
    protected static $component_type = 'profile-photo';
    
    /**
     * Field mapping - SINGLE field only (native WordPress meta)
     */
    protected static $field_name = 'profile_photo';
    
    /**
     * Validate post ID
     */
    protected static function validate_post_id($post_id) {
        return is_numeric($post_id) && $post_id > 0;
    }
    
    /**
     * Debug logging
     */
    protected static function debug_log($message) {
        GMKB_Logger::info('[Profile_Photo] ' . $message);
    }
    
    /**
     * Load profile photo data from Pods field
     * 
     * SINGLE FIELD PATTERN: Returns single photo object or null
     * 
     * @param int $post_id Post ID
     * @return array Photo data with metadata
     */
    public static function load_component_data($post_id) {
        $result = array(
            'photo' => null,
            'has_photo' => false,
            'source' => 'native_meta',
            'component_type' => self::$component_type,
            'success' => false,
            'message' => '',
            'timestamp' => current_time('mysql')
        );
        
        if (!self::validate_post_id($post_id)) {
            $result['message'] = 'Invalid post ID';
            return $result;
        }
        
        // SINGLE FIELD: profile_photo (one image)
        // Use get_post_meta with TRUE to get single value
        $photo_id = get_post_meta($post_id, self::$field_name, true);
        
        if (!empty($photo_id)) {
            if (is_numeric($photo_id)) {
                // Simple attachment ID
                $photo_url = wp_get_attachment_url($photo_id);
                if ($photo_url) {
                    $attachment = get_post($photo_id);
                    $result['photo'] = array(
                        'url' => $photo_url,
                        'caption' => $attachment ? $attachment->post_excerpt : '',
                        'alt' => $attachment ? $attachment->post_title : 'Profile Photo',
                        'id' => $photo_id,
                        'source' => 'native_meta'
                    );
                    $result['has_photo'] = true;
                    $result['success'] = true;
                    self::debug_log("Found profile photo: {$photo_url}");
                }
            } elseif (is_array($photo_id)) {
                // Complex array with metadata
                $id = $photo_id['ID'] ?? $photo_id['id'] ?? null;
                if ($id) {
                    $photo_url = wp_get_attachment_url($id);
                    if ($photo_url) {
                        $result['photo'] = array(
                            'url' => $photo_url,
                            'caption' => $photo_id['caption'] ?? '',
                            'alt' => $photo_id['alt'] ?? 'Profile Photo',
                            'id' => $id,
                            'source' => 'native_meta'
                        );
                        $result['has_photo'] = true;
                        $result['success'] = true;
                        self::debug_log("Found profile photo with metadata: {$photo_url}");
                    }
                }
            }
        }
        
        if ($result['success']) {
            $result['message'] = "Loaded profile photo from profile_photo field";
        } else {
            $result['message'] = "No profile photo found for post {$post_id}";
        }
        
        self::debug_log($result['message']);
        
        return $result;
    }
    
    /**
     * Prepare template props from component data
     * 
     * @param array $component_data Data from load_component_data
     * @param array $existing_props Existing props to merge with
     * @return array Props ready for template
     */
    public static function prepare_template_props($component_data, $existing_props = array()) {
        $props = $existing_props;
        
        if (!empty($component_data['success']) && !empty($component_data['photo'])) {
            $props['photo'] = $component_data['photo'];
            $props['has_photo'] = true;
        } else {
            $props['photo'] = null;
            $props['has_photo'] = false;
        }
        
        return $props;
    }
    
    /**
     * Check if profile photo data exists for post
     * 
     * @param int $post_id Post ID
     * @return bool True if photo exists
     */
    public static function has_component_data($post_id) {
        if (!self::validate_post_id($post_id)) {
            return false;
        }
        
        $photo_id = get_post_meta($post_id, self::$field_name, true);
        return !empty($photo_id);
    }
}

GMKB_Logger::startup('Profile Photo Data Integration loaded');

/**
 * Hook into component prop enrichment filter
 */
add_filter('gmkb_enrich_profile-photo_props', function($props, $post_id) {
    $photo_data = Profile_Photo_Data_Integration::load_component_data($post_id);
    
    if ($photo_data['success']) {
        $props = Profile_Photo_Data_Integration::prepare_template_props($photo_data, $props);
        
        GMKB_Logger::debug('Profile Photo: Enriched props for post ' . $post_id . ' (has_photo: ' . ($props['has_photo'] ? 'Yes' : 'No') . ')');
    }
    
    return $props;
}, 10, 2);
