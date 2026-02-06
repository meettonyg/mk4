<?php
/**
 * Video Intro Component - Data Integration
 *
 * PHASE 8: Uses native WordPress post_meta ONLY - NO Pods dependency
 * Handles all data operations for Video Intro component
 *
 * @package Guestify/Components/VideoIntro
 * @version 3.0.0-native
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Video Intro Data Integration
 * COMPLIANT: Uses generic class naming pattern: {Component}_Data_Integration
 */
class Video_Intro_Data_Integration {
    
    /**
     * Component identifier
     */
    protected static $component_type = 'video-intro';
    
    /**
     * Field mapping (native WordPress meta)
     */
    protected static $field_mappings = array(
        'video_intro' => 'video_intro'
    );
    
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
        GMKB_Logger::info('[Video_Intro] ' . $message);
    }
    
    /**
     * Load video intro data from native meta
     *
     * @param int $post_id Post ID
     * @return array Video intro data with metadata
     */
    public static function load_component_data($post_id) {
        $result = array(
            'video_intro' => array(),
            'count' => 0,
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
        
        // Load from Pods fields
        foreach (self::$field_mappings as $field_key => $meta_key) {
            $video_url = get_post_meta($post_id, $meta_key, true);
            
            if (!empty($video_url) && is_string($video_url)) {
                $cleaned_url = esc_url_raw(trim($video_url));
                
                if (strlen($cleaned_url) > 0) {
                    $result['video_intro'][$field_key] = $cleaned_url;
                    $result['count']++;
                    $result['success'] = true;
                    
                    self::debug_log("Found {$field_key}: {$cleaned_url}");
                }
            }
            
            // Ensure field exists even if empty
            if (!isset($result['video_intro'][$field_key])) {
                $result['video_intro'][$field_key] = '';
            }
        }
        
        if ($result['success']) {
            $result['message'] = "Loaded video intro from native meta";
        } else {
            $result['message'] = "No video intro found for post {$post_id}";
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
        
        if (!empty($component_data['success']) && !empty($component_data['video_intro'])) {
            $video_url = $component_data['video_intro']['video_intro'] ?? '';
            
            // Convert to embed URL if needed
            $embed_url = self::convert_to_embed_url($video_url);
            
            // Provide in multiple formats for compatibility
            $props['video_intro'] = $video_url;
            $props['video_url'] = $embed_url;
            $props['videoUrl'] = $embed_url;
            $props['url'] = $embed_url;
            $props['has_video'] = true;
            
            self::debug_log('Video intro props prepared: ' . $embed_url);
        } else {
            $props['video_intro'] = '';
            $props['video_url'] = '';
            $props['videoUrl'] = '';
            $props['url'] = '';
            $props['has_video'] = false;
        }
        
        return $props;
    }
    
    /**
     * Convert video URL to embed format
     * Supports YouTube and Vimeo
     * 
     * @param string $url Video URL
     * @return string Embed URL
     */
    protected static function convert_to_embed_url($url) {
        if (empty($url)) {
            return '';
        }
        
        // Already an embed URL
        if (strpos($url, '/embed/') !== false) {
            return $url;
        }
        
        // YouTube
        if (preg_match('/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/', $url, $matches)) {
            return 'https://www.youtube.com/embed/' . $matches[1];
        }
        if (preg_match('/youtu\.be\/([a-zA-Z0-9_-]+)/', $url, $matches)) {
            return 'https://www.youtube.com/embed/' . $matches[1];
        }
        
        // Vimeo
        if (preg_match('/vimeo\.com\/([0-9]+)/', $url, $matches)) {
            return 'https://player.vimeo.com/video/' . $matches[1];
        }
        
        // Return original URL if no pattern matched
        return $url;
    }
    
    /**
     * Save video intro data to Pods fields
     * 
     * @param int $post_id Post ID
     * @param array $video_data Video data to save
     * @return array Save result with metadata
     */
    public static function save_component_data($post_id, $video_data) {
        $result = array(
            'success' => false,
            'count' => 0,
            'message' => '',
            'component_type' => self::$component_type,
            'timestamp' => current_time('mysql')
        );
        
        if (!self::validate_post_id($post_id)) {
            $result['message'] = 'Invalid post ID';
            return $result;
        }
        
        if (!is_array($video_data)) {
            $result['message'] = 'Invalid video data format';
            return $result;
        }
        
        // Extract video URL from various possible formats
        $video_url = '';
        if (isset($video_data['video_intro'])) {
            $video_url = $video_data['video_intro'];
        } elseif (isset($video_data['video_url'])) {
            $video_url = $video_data['video_url'];
        } elseif (isset($video_data['url'])) {
            $video_url = $video_data['url'];
        }
        
        $cleaned_url = esc_url_raw(trim($video_url));
        
        if (!empty($cleaned_url)) {
            update_post_meta($post_id, 'video_intro', $cleaned_url);
            $result['count'] = 1;
        } else {
            delete_post_meta($post_id, 'video_intro');
        }
        
        update_post_meta($post_id, 'video_intro_last_saved', current_time('mysql'));
        
        $result['success'] = true;
        $result['message'] = "Successfully saved video intro to native meta";

        self::debug_log($result['message']);

        return $result;
    }

    /**
     * Check if video intro data exists for post
     * 
     * @param int $post_id Post ID
     * @return bool True if video intro exists
     */
    public static function has_component_data($post_id) {
        if (!self::validate_post_id($post_id)) {
            return false;
        }
        
        $video_url = get_post_meta($post_id, 'video_intro', true);
        return (!empty($video_url) && strlen(trim($video_url)) > 0);
    }
}

GMKB_Logger::startup('Video Intro Data Integration loaded');

/**
 * ROOT FIX: Hook into component prop enrichment filter (ARCHITECTURE COMPLIANT)
 */
add_filter('gmkb_enrich_video-intro_props', function($props, $post_id) {
    // Load video intro data using the Video_Intro_Data_Integration class
    $video_data = Video_Intro_Data_Integration::load_component_data($post_id);
    
    if ($video_data['success']) {
        // Prepare props using the class method
        $props = Video_Intro_Data_Integration::prepare_template_props($video_data, $props);
        
        GMKB_Logger::debug('Video Intro: Enriched props for post ' . $post_id . ' (has_video: ' . ($props['has_video'] ? 'Yes' : 'No') . ')');
    }
    
    return $props;
}, 10, 2);
