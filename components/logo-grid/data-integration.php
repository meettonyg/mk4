<?php
/**
 * Logo Grid Component - Data Integration
 * 
 * PHASE 8: Uses native WordPress post_meta ONLY - NO Pods dependency
 * REPEATABLE field pattern: One field, array data type, one purpose
 * 
 * @package Guestify/Components/LogoGrid
 * @version 3.0.0-native
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Logo Grid Data Integration
 * ARCHITECTURAL PRINCIPLE: One component = one data pattern
 * This component handles ONLY the featured_logos REPEATABLE field
 * For personal/company brand logos, use the Brand Logo component
 */
class Logo_Grid_Data_Integration {
    
    /**
     * Component identifier
     */
    protected static $component_type = 'logo-grid';
    
    /**
     * Field mapping - REPEATABLE field only (native WordPress meta)
     */
    protected static $field_name = 'featured_logos';
    
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
        GMKB_Logger::info('[Logo_Grid] ' . $message);
    }
    
    /**
     * Load logo grid data from Pods field
     * 
     * REPEATABLE FIELD PATTERN: Returns array of logos
     * 
     * @param int $post_id Post ID
     * @return array Logo grid data with metadata
     */
    public static function load_component_data($post_id) {
        $result = array(
            'logos' => array(),
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
        
        // REPEATABLE FIELD: featured_logos (logo collection)
        // Use get_post_meta with FALSE to get array of values
        $featured_logos = get_post_meta($post_id, self::$field_name, false);
        
        if (!empty($featured_logos) && is_array($featured_logos)) {
            foreach ($featured_logos as $logo_data) {
                if (is_numeric($logo_data)) {
                    // Simple array of attachment IDs
                    $logo_url = wp_get_attachment_url($logo_data);
                    if ($logo_url) {
                        $result['logos'][] = array(
                            'url' => $logo_url,
                            'name' => get_the_title($logo_data),
                            'alt' => get_post_meta($logo_data, '_wp_attachment_image_alt', true) ?: get_the_title($logo_data),
                            'id' => $logo_data,
                            'source' => 'native_meta'
                        );
                        $result['count']++;
                        $result['success'] = true;
                        self::debug_log("Found featured logo: {$logo_url}");
                    }
                } elseif (is_array($logo_data)) {
                    // Complex array with metadata
                    $logo_id = $logo_data['ID'] ?? $logo_data['id'] ?? null;
                    if ($logo_id) {
                        $logo_url = wp_get_attachment_url($logo_id);
                        if ($logo_url) {
                            $result['logos'][] = array(
                                'url' => $logo_url,
                                'name' => $logo_data['name'] ?? $logo_data['logo_name'] ?? get_the_title($logo_id),
                                'alt' => $logo_data['alt'] ?? get_the_title($logo_id),
                                'id' => $logo_id,
                                'source' => 'pods'
                            );
                            $result['count']++;
                            $result['success'] = true;
                            self::debug_log("Found featured logo with metadata: {$logo_url}");
                        }
                    }
                }
            }
        }
        
        if ($result['success']) {
            $result['message'] = "Loaded {$result['count']} logos from featured_logos field";
        } else {
            $result['message'] = "No featured logos found for post {$post_id}";
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
        
        if (!empty($component_data['success']) && !empty($component_data['logos'])) {
            $props['logos'] = $component_data['logos'];
            $props['logos_count'] = count($component_data['logos']);
            $props['has_logos'] = true;
        } else {
            $props['logos'] = array();
            $props['logos_count'] = 0;
            $props['has_logos'] = false;
        }
        
        return $props;
    }
    
    /**
     * Check if logo grid data exists for post
     * 
     * @param int $post_id Post ID
     * @return bool True if logos exist
     */
    public static function has_component_data($post_id) {
        if (!self::validate_post_id($post_id)) {
            return false;
        }
        
        $featured_logos = get_post_meta($post_id, self::$field_name, false);
        return !empty($featured_logos);
    }
}

GMKB_Logger::startup('Logo Grid Data Integration loaded');

/**
 * Hook into component prop enrichment filter
 */
add_filter('gmkb_enrich_logo-grid_props', function($props, $post_id) {
    $logos_data = Logo_Grid_Data_Integration::load_component_data($post_id);
    
    if ($logos_data['success']) {
        $props = Logo_Grid_Data_Integration::prepare_template_props($logos_data, $props);
        
        GMKB_Logger::debug('Logo Grid: Enriched props for post ' . $post_id . ' (logos: ' . $props['logos_count'] . ')');
    }
    
    return $props;
}, 10, 2);
