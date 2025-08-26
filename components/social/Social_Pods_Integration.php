<?php
/**
 * Social Media Component - Pods Data Integration
 * 
 * PHASE 1 ARCHITECTURAL FIX: Component-level data integration
 * Handles all social media data operations with single responsibility
 * 
 * @package Guestify/Components/Social
 * @version 1.0.0-phase1-component-isolation
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Load abstract base class
if (!class_exists('Abstract_Component_Integration')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/Abstract_Component_Integration.php';
}

/**
 * Social Media-specific Pods data integration
 * Handles all data operations for Social Media component only
 */
class Social_Pods_Integration extends Abstract_Component_Integration {
    
    /**
     * Component identifier
     */
    protected static $component_type = 'social';
    
    /**
     * Pods field mappings for social media platforms
     */
    protected static $field_mappings = array(
        'twitter' => 'social_twitter',
        'linkedin' => 'social_linkedin',
        'instagram' => 'social_instagram',
        'facebook' => 'social_facebook',
        'youtube' => 'social_youtube',
        'tiktok' => 'social_tiktok',
        'website' => 'social_website',
        'podcast' => 'social_podcast'
    );
    
    /**
     * Load social media data from Pods fields only
     * Implementation of abstract method
     * 
     * @param int $post_id Post ID
     * @return array Social media data with metadata
     */
    public static function load_component_data($post_id) {
        return self::load_social_data($post_id);
    }
    
    /**
     * Save social media data to Pods fields only
     * Implementation of abstract method
     * 
     * @param int $post_id Post ID
     * @param array $data Social media data to save
     * @return array Save result with metadata
     */
    public static function save_component_data($post_id, $data) {
        return self::save_social_data($post_id, $data);
    }
    
    /**
     * Check if social media data exists for post
     * Implementation of abstract method
     * 
     * @param int $post_id Post ID
     * @return bool True if social media exists
     */
    public static function has_component_data($post_id) {
        return self::has_social_data($post_id);
    }
    
    /**
     * PHASE 1 FIX: Load social media from Pods fields only
     * 
     * @param int $post_id Post ID
     * @return array Social media data with metadata
     */
    public static function load_social_data($post_id) {
        $result = array(
            'social_media' => array(),
            'count' => 0,
            'source' => 'pods_fields',
            'component_type' => self::$component_type,
            'success' => false,
            'message' => '',
            'quality' => 'empty',
            'timestamp' => current_time('mysql')
        );
        
        if (!self::validate_post_id($post_id)) {
            $result['message'] = 'Invalid post ID';
            return $result;
        }
        
        // Load from Pods fields only - single source of truth
        foreach (self::$field_mappings as $field_key => $meta_key) {
            $social_value = get_post_meta($post_id, $meta_key, true);
            
            if (!empty($social_value) && is_string($social_value)) {
                $cleaned_value = esc_url_raw(trim($social_value));
                if (strlen($cleaned_value) > 0 && self::is_valid_url($cleaned_value)) {
                    $result['social_media'][$field_key] = $cleaned_value;
                    $result['count']++;
                    $result['success'] = true;
                    
                    self::debug_log("Found {$field_key} = {$cleaned_value} for post {$post_id}");
                }
            }
            
            // Ensure field exists even if empty
            if (!isset($result['social_media'][$field_key])) {
                $result['social_media'][$field_key] = '';
            }
        }
        
        // Set quality assessment
        if ($result['success']) {
            $result['quality'] = self::assess_data_quality($result['social_media']);
            $result['message'] = "Loaded {$result['count']} social media links from Pods";
        } else {
            $result['message'] = "No social media links found in Pods fields for post {$post_id}";
        }
        
        // Add metadata
        $result['meta'] = array(
            'last_updated' => get_post_meta($post_id, 'social_last_updated', true),
            'verification_status' => get_post_meta($post_id, 'social_verification_status', true),
            'platforms_used' => $result['count']
        );
        
        self::debug_log($result['message']);
        
        return $result;
    }
    
    /**
     * PHASE 1 FIX: Save social media to Pods fields only
     * 
     * @param int $post_id Post ID
     * @param array $social_data Social media data to save
     * @return array Save result with metadata
     */
    public static function save_social_data($post_id, $social_data) {
        $result = array(
            'success' => false,
            'count' => 0,
            'message' => '',
            'component_type' => self::$component_type,
            'method' => 'pods_single_source',
            'timestamp' => current_time('mysql'),
            'operations' => array()
        );
        
        if (!self::validate_post_id($post_id)) {
            $result['message'] = 'Invalid post ID';
            return $result;
        }
        
        if (!is_array($social_data)) {
            $result['message'] = 'Invalid social media data format';
            return $result;
        }
        
        try {
            // Save to Pods fields only - single source of truth
            foreach (self::$field_mappings as $field_key => $meta_key) {
                $social_value = '';
                
                // Extract value from different possible input formats
                if (isset($social_data['social_media'][$field_key])) {
                    $social_value = $social_data['social_media'][$field_key];
                } elseif (isset($social_data[$field_key])) {
                    $social_value = $social_data[$field_key];
                } elseif (isset($social_data[$meta_key])) {
                    $social_value = $social_data[$meta_key];
                }
                
                // Handle array format (from AJAX)
                if (is_array($social_value)) {
                    $social_value = $social_value['url'] ?? $social_value['link'] ?? '';
                }
                
                // Sanitize and validate URL
                $cleaned_value = is_string($social_value) ? esc_url_raw(trim($social_value)) : '';
                if (!empty($cleaned_value) && !self::is_valid_url($cleaned_value)) {
                    $cleaned_value = ''; // Clear invalid URLs
                }
                
                $save_result = update_post_meta($post_id, $meta_key, $cleaned_value);
                
                $result['operations'][] = array(
                    'field' => $field_key,
                    'meta_key' => $meta_key,
                    'value' => $cleaned_value,
                    'success' => $save_result !== false
                );
                
                if (!empty($cleaned_value)) {
                    $result['count']++;
                }
            }
            
            // Save metadata
            update_post_meta($post_id, 'social_last_saved', current_time('mysql'));
            update_post_meta($post_id, 'social_save_method', 'pods_component_integration');
            update_post_meta($post_id, 'social_component_type', self::$component_type);
            
            $result['success'] = true;
            $result['message'] = "Successfully saved {$result['count']} social media links to Pods";
            
            self::debug_log($result['message']);
            
        } catch (Exception $e) {
            $result['message'] = 'Save error: ' . $e->getMessage();
            self::debug_log("Save Error: " . $e->getMessage());
        }
        
        return $result;
    }
    
    /**
     * Check if social media data exists for post
     * 
     * @param int $post_id Post ID
     * @return bool True if social media exists
     */
    public static function has_social_data($post_id) {
        if (!self::validate_post_id($post_id)) {
            return false;
        }
        
        // Check if any social media field has valid data
        foreach (self::$field_mappings as $field_key => $meta_key) {
            $social_value = get_post_meta($post_id, $meta_key, true);
            if (!empty($social_value) && is_string($social_value) && self::is_valid_url($social_value)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Get social media data availability info
     * 
     * @param int $post_id Post ID
     * @return array Availability information
     */
    public static function get_data_availability($post_id) {
        $result = array(
            'has_data' => false,
            'field_count' => 0,
            'empty_fields' => 0,
            'component_type' => self::$component_type,
            'data_source' => 'pods_fields',
            'platforms' => array(),
            'coverage' => 0
        );
        
        if (!self::validate_post_id($post_id)) {
            return $result;
        }
        
        foreach (self::$field_mappings as $field_key => $meta_key) {
            $social_value = get_post_meta($post_id, $meta_key, true);
            $has_data = !empty($social_value) && is_string($social_value) && self::is_valid_url($social_value);
            
            if ($has_data) {
                $result['field_count']++;
                $result['has_data'] = true;
            } else {
                $result['empty_fields']++;
            }
            
            $result['platforms'][$field_key] = $has_data;
        }
        
        // Calculate coverage percentage
        $total_platforms = count(self::$field_mappings);
        $result['coverage'] = $total_platforms > 0 ? 
            round(($result['field_count'] / $total_platforms) * 100) : 0;
        
        return $result;
    }
    
    /**
     * Calculate content hash for change detection
     * 
     * @param int $post_id Post ID
     * @return string Content hash
     */
    public static function calculate_content_hash($post_id) {
        if (!self::validate_post_id($post_id)) {
            return '';
        }
        
        $content_parts = array();
        
        foreach (self::$field_mappings as $field_key => $meta_key) {
            $social_value = get_post_meta($post_id, $meta_key, true);
            if (!empty($social_value)) {
                $content_parts[] = $meta_key . ':' . $social_value;
            }
        }
        
        return md5(implode('|', $content_parts));
    }
    
    /**
     * Validate URL
     * 
     * @param string $url URL to validate
     * @return bool True if valid URL
     */
    private static function is_valid_url($url) {
        return filter_var($url, FILTER_VALIDATE_URL) !== false;
    }
    
    /**
     * Assess data quality
     * 
     * @param array $social_media Social media data
     * @return string Quality level
     */
    private static function assess_data_quality($social_media) {
        $valid_links = array_filter($social_media, function($link) {
            return !empty($link) && self::is_valid_url($link);
        });
        
        $count = count($valid_links);
        $total = count(self::$field_mappings);
        
        if ($count === 0) return 'empty';
        if ($count >= 6) return 'excellent';
        if ($count >= 4) return 'good';
        if ($count >= 2) return 'fair';
        return 'poor';
    }
}

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ PHASE 1: Social Pods Integration loaded - Component-level data integration');
}
