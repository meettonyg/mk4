<?php
/**
 * Company Logo Component - Data Integration
 * 
 * SELF-CONTAINED: Handles SINGLE field pattern only
 * SIMPLE: One field, single data type, one purpose
 * 
 * @package Guestify/Components/CompanyLogo
 * @version 1.0.0-single-field
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Company Logo Data Integration
 * ARCHITECTURAL PRINCIPLE: One component = one data pattern
 * This component handles ONLY the company_logo SINGLE field
 * For personal brand logos, use the Personal Brand Logo component
 * For multiple client/partner logos, use the Logo Grid component
 */
class Company_Logo_Data_Integration {
    
    /**
     * Component identifier
     */
    protected static $component_type = 'company-logo';
    
    /**
     * Pods field mapping - SINGLE field only
     */
    protected static $field_name = 'company_logo';
    
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
            error_log('[Company_Logo_Data_Integration] ' . $message);
        }
    }
    
    /**
     * Load company logo data from Pods field
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
        
        // SINGLE FIELD: company_logo (one logo)
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
                        'alt' => $attachment ? $attachment->post_title : 'Company Logo',
                        'id' => $logo_id,
                        'type' => 'company',
                        'source' => 'pods'
                    );
                    $result['has_logo'] = true;
                    $result['success'] = true;
                    self::debug_log("Found company logo: {$logo_url}");
                }
            } elseif (is_array($logo_id)) {
                // Complex array with metadata
                $id = $logo_id['ID'] ?? $logo_id['id'] ?? null;
                if ($id) {
                    $logo_url = wp_get_attachment_url($id);
                    if ($logo_url) {
                        $result['logo'] = array(
                            'url' => $logo_url,
                            'alt' => $logo_id['alt'] ?? 'Company Logo',
                            'id' => $id,
                            'type' => 'company',
                            'source' => 'pods'
                        );
                        $result['has_logo'] = true;
                        $result['success'] = true;
                        self::debug_log("Found company logo with metadata: {$logo_url}");
                    }
                }
            }
        }
        
        if ($result['success']) {
            $result['message'] = "Loaded company logo from company_logo field";
        } else {
            $result['message'] = "No company logo found for post {$post_id}";
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
     * Check if company logo data exists for post
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
    error_log('✅ SINGLE FIELD PATTERN: Company Logo Data Integration loaded');
}

/**
 * Hook into component prop enrichment filter
 */
add_filter('gmkb_enrich_company-logo_props', function($props, $post_id) {
    $logo_data = Company_Logo_Data_Integration::load_component_data($post_id);
    
    if ($logo_data['success']) {
        $props = Company_Logo_Data_Integration::prepare_template_props($logo_data, $props);
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ Company Logo: Enriched props for post ' . $post_id);
            error_log('   - Has logo: ' . ($props['has_logo'] ? 'Yes' : 'No'));
        }
    }
    
    return $props;
}, 10, 2);
