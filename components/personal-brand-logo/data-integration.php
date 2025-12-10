<?php
/**
 * Personal Brand Logo Component - Data Integration
 *
 * PHASE 8: Uses native WordPress post_meta ONLY - NO Pods dependency
 * SIMPLE: One field, single data type, one purpose
 *
 * @package Guestify/Components/PersonalBrandLogo
 * @version 3.0.0-native
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Personal Brand Logo Data Integration
 * ARCHITECTURAL PRINCIPLE: One component = one data pattern
 * This component handles ONLY the personal_brand_logo SINGLE field
 * For company logos, use the Company Logo component
 * For multiple client/partner logos, use the Logo Grid component
 */
class Personal_Brand_Logo_Data_Integration {
    
    /**
     * Component identifier
     */
    protected static $component_type = 'personal-brand-logo';
    
    /**
     * Field mapping (native WordPress meta) - SINGLE field only
     */
    protected static $field_name = 'personal_brand_logo';
    
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
            error_log('[Personal_Brand_Logo_Data_Integration] ' . $message);
        }
    }
    
    /**
     * Load personal brand logo data from native meta
     *
     * SINGLE FIELD PATTERN: Returns single logo object or null
     *
     * @param int $post_id Post ID
     * @return array Logo data with metadata
     */
    public static function load_component_data($post_id) {
        $result = array(
            'logo' => null,
            'has_logo' => false,
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
        
        // SINGLE FIELD: personal_brand_logo (one logo)
        // Use get_post_meta with TRUE to get single value
        $logo_id = get_post_meta($post_id, self::$field_name, true);
        
        if (!empty($logo_id)) {
            if (is_numeric($logo_id)) {
                // Simple attachment ID
                $logo_url = wp_get_attachment_url($logo_id);
                if ($logo_url) {
                    $attachment = get_post($logo_id);
                    $result['logo'] = array(
                        'url' => $logo_url,
                        'alt' => $attachment ? $attachment->post_title : 'Personal Brand Logo',
                        'id' => $logo_id,
                        'type' => 'personal',
                        'source' => 'native_meta'
                    );
                    $result['has_logo'] = true;
                    $result['success'] = true;
                    self::debug_log("Found personal brand logo: {$logo_url}");
                }
            } elseif (is_array($logo_id)) {
                // Complex array with metadata
                $id = $logo_id['ID'] ?? $logo_id['id'] ?? null;
                if ($id) {
                    $logo_url = wp_get_attachment_url($id);
                    if ($logo_url) {
                        $result['logo'] = array(
                            'url' => $logo_url,
                            'alt' => $logo_id['alt'] ?? 'Personal Brand Logo',
                            'id' => $id,
                            'type' => 'personal',
                            'source' => 'native_meta'
                        );
                        $result['has_logo'] = true;
                        $result['success'] = true;
                        self::debug_log("Found personal brand logo with metadata: {$logo_url}");
                    }
                }
            }
        }
        
        if ($result['success']) {
            $result['message'] = "Loaded personal brand logo from personal_brand_logo field";
        } else {
            $result['message'] = "No personal brand logo found for post {$post_id}";
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
        
        if (!empty($component_data['success']) && !empty($component_data['logo'])) {
            $props['logo'] = $component_data['logo'];
            $props['has_logo'] = true;
        } else {
            $props['logo'] = null;
            $props['has_logo'] = false;
        }
        
        return $props;
    }
    
    /**
     * Check if personal brand logo data exists for post
     * 
     * @param int $post_id Post ID
     * @return bool True if logo exists
     */
    public static function has_component_data($post_id) {
        if (!self::validate_post_id($post_id)) {
            return false;
        }
        
        $logo_id = get_post_meta($post_id, self::$field_name, true);
        return !empty($logo_id);
    }
}

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ PHASE 8: Personal Brand Logo Data Integration loaded (native meta)');
}

/**
 * Hook into component prop enrichment filter
 */
add_filter('gmkb_enrich_personal-brand-logo_props', function($props, $post_id) {
    $logo_data = Personal_Brand_Logo_Data_Integration::load_component_data($post_id);
    
    if ($logo_data['success']) {
        $props = Personal_Brand_Logo_Data_Integration::prepare_template_props($logo_data, $props);
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ Personal Brand Logo: Enriched props for post ' . $post_id);
            error_log('   - Has logo: ' . ($props['has_logo'] ? 'Yes' : 'No'));
        }
    }
    
    return $props;
}, 10, 2);
