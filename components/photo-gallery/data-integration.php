<?php
/**
 * Photo Gallery Component - Data Integration
 * 
 * SELF-CONTAINED: Handles REPEATABLE field pattern only
 * SIMPLE: One field, array data type, one purpose
 * 
 * @package Guestify/Components/PhotoGallery
 * @version 2.0.0-repeatable-only
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Photo Gallery Data Integration
 * ARCHITECTURAL PRINCIPLE: One component = one data pattern
 * This component handles ONLY the gallery_photos REPEATABLE field
 * For single profile photo, use the Profile Photo component
 */
class Photo_Gallery_Data_Integration {
    
    /**
     * Component identifier
     */
    protected static $component_type = 'photo-gallery';
    
    /**
     * Pods field mapping - REPEATABLE field only
     */
    protected static $field_name = 'gallery_photos';
    
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
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('[Photo_Gallery_Data_Integration] ' . $message);
        }
    }
    
    /**
     * Load photo gallery data from Pods field
     * 
     * REPEATABLE FIELD PATTERN: Returns array of photos
     * 
     * @param int $post_id Post ID
     * @return array Photo gallery data with metadata
     */
    public static function load_component_data($post_id) {
        $result = array(
            'photos' => array(),
            'count' => 0,
            'source' => 'pods_fields',
            'component_type' => self::$component_type,
            'success' => false,
            'message' => '',
            'timestamp' => current_time('mysql')
        );
        
        if (!self::validate_post_id($post_id)) {
            $result['message'] = 'Invalid post ID';
            return $result;
        }
        
        // REPEATABLE FIELD: gallery_photos (photo collection)
        // Use get_post_meta with FALSE to get array of values
        $gallery_photos = get_post_meta($post_id, self::$field_name, false);
        
        if (!empty($gallery_photos) && is_array($gallery_photos)) {
            foreach ($gallery_photos as $photo_data) {
                if (is_numeric($photo_data)) {
                    // Simple array of attachment IDs
                    $photo_url = wp_get_attachment_url($photo_data);
                    if ($photo_url) {
                        $attachment = get_post($photo_data);
                        $result['photos'][] = array(
                            'url' => $photo_url,
                            'caption' => $attachment ? $attachment->post_excerpt : '',
                            'alt' => $attachment ? $attachment->post_title : '',
                            'id' => $photo_data,
                            'source' => 'pods'
                        );
                        $result['count']++;
                        $result['success'] = true;
                        self::debug_log("Found gallery photo: {$photo_url}");
                    }
                } elseif (is_array($photo_data)) {
                    // Complex array with metadata
                    $photo_id = $photo_data['ID'] ?? $photo_data['id'] ?? null;
                    if ($photo_id) {
                        $photo_url = wp_get_attachment_url($photo_id);
                        if ($photo_url) {
                            $attachment = get_post($photo_id);
                            $result['photos'][] = array(
                                'url' => $photo_url,
                                'caption' => $photo_data['caption'] ?? ($attachment ? $attachment->post_excerpt : ''),
                                'alt' => $photo_data['alt'] ?? ($attachment ? $attachment->post_title : ''),
                                'id' => $photo_id,
                                'source' => 'pods'
                            );
                            $result['count']++;
                            $result['success'] = true;
                            self::debug_log("Found gallery photo with metadata: {$photo_url}");
                        }
                    }
                }
            }
        }
        
        if ($result['success']) {
            $result['message'] = "Loaded {$result['count']} photos from gallery_photos field";
        } else {
            $result['message'] = "No gallery photos found for post {$post_id}";
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
        
        if (!empty($component_data['success']) && !empty($component_data['photos'])) {
            $props['photos'] = $component_data['photos'];
            $props['photos_count'] = count($component_data['photos']);
            $props['has_photos'] = true;
        } else {
            $props['photos'] = array();
            $props['photos_count'] = 0;
            $props['has_photos'] = false;
        }
        
        return $props;
    }
    
    /**
     * Check if photo gallery data exists for post
     * 
     * @param int $post_id Post ID
     * @return bool True if photos exist
     */
    public static function has_component_data($post_id) {
        if (!self::validate_post_id($post_id)) {
            return false;
        }
        
        $gallery_photos = get_post_meta($post_id, self::$field_name, false);
        return !empty($gallery_photos);
    }
}

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ REPEATABLE FIELD PATTERN: Photo Gallery Data Integration loaded');
}

/**
 * Hook into component prop enrichment filter
 */
add_filter('gmkb_enrich_photo-gallery_props', function($props, $post_id) {
    $photos_data = Photo_Gallery_Data_Integration::load_component_data($post_id);
    
    if ($photos_data['success']) {
        $props = Photo_Gallery_Data_Integration::prepare_template_props($photos_data, $props);
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ Photo Gallery: Enriched props for post ' . $post_id);
            error_log('   - Photos count: ' . $props['photos_count']);
        }
    }
    
    return $props;
}, 10, 2);
