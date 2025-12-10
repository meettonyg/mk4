<?php
/**
 * Social Component - Data Integration
 * 
 * PHASE 8: Uses native WordPress post_meta ONLY - NO Pods dependency
 * 
 * @package Guestify/Components/Social
 * @version 3.0.0-native
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Social Data Integration
 * COMPLIANT: Uses generic class naming pattern: {Component}_Data_Integration
 */
class Social_Data_Integration {
    
    /**
     * Component identifier
     */
    protected static $component_type = 'social';
    
    /**
     * Social platform field mappings
     * PHASE 2: Clean field names (migrated from legacy Pods names)
     *
     * Note: Email and phone belong to Contact component, not Social
     */
    protected static $field_mappings = array(
        'twitter' => 'social_twitter',
        'facebook' => 'social_facebook',
        'instagram' => 'social_instagram',
        'linkedin' => 'social_linkedin',
        'tiktok' => 'social_tiktok',
        'pinterest' => 'social_pinterest',
        'youtube' => 'social_youtube',
        'website' => 'website_primary',
        'website2' => 'website_secondary'
    );

    /**
     * Legacy field names for backward compatibility
     * Used during migration period to read from old fields
     */
    protected static $legacy_mappings = array(
        'twitter' => '1_twitter',
        'facebook' => '1_facebook',
        'instagram' => '1_instagram',
        'linkedin' => '1_linkedin',
        'tiktok' => '1_tiktok',
        'pinterest' => '1_pinterest',
        'youtube' => 'guest_youtube',
        'website' => '1_website',
        'website2' => '2_website'
    );
    
    /**
     * Platform display names and icons
     * ROOT FIX: Removed email and phone (belong to Contact component)
     */
    protected static $platform_config = array(
        'twitter' => array('label' => 'Twitter/X', 'icon' => 'fa-twitter'),
        'facebook' => array('label' => 'Facebook', 'icon' => 'fa-facebook'),
        'instagram' => array('label' => 'Instagram', 'icon' => 'fa-instagram'),
        'linkedin' => array('label' => 'LinkedIn', 'icon' => 'fa-linkedin'),
        'tiktok' => array('label' => 'TikTok', 'icon' => 'fa-tiktok'),
        'pinterest' => array('label' => 'Pinterest', 'icon' => 'fa-pinterest'),
        'youtube' => array('label' => 'YouTube', 'icon' => 'fa-youtube'),
        'website' => array('label' => 'Website', 'icon' => 'fa-globe'),
        'website2' => array('label' => 'Website 2', 'icon' => 'fa-globe')
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
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('[Social_Data_Integration] ' . $message);
        }
    }
    
    /**
     * Load social links data from native WordPress meta
     *
     * PHASE 2: Checks clean field names first, falls back to legacy names
     *
     * @param int $post_id Post ID
     * @return array Social data with metadata
     */
    public static function load_component_data($post_id) {
        $result = array(
            'links' => array(),
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

        // Load from native meta fields (clean names first, fallback to legacy)
        foreach (self::$field_mappings as $platform => $meta_key) {
            // Try clean field name first
            $value = get_post_meta($post_id, $meta_key, true);

            // Fallback to legacy field name if clean name is empty
            if (empty($value) && isset(self::$legacy_mappings[$platform])) {
                $legacy_key = self::$legacy_mappings[$platform];
                $value = get_post_meta($post_id, $legacy_key, true);

                if (!empty($value)) {
                    self::debug_log("Found {$platform} in legacy field: {$legacy_key}");
                }
            }

            if (!empty($value) && is_string($value)) {
                $cleaned_value = sanitize_text_field(trim($value));

                if (strlen($cleaned_value) > 0) {
                    // Build link data with metadata
                    $link_data = array(
                        'platform' => $platform,
                        'url' => $cleaned_value,
                        'label' => self::$platform_config[$platform]['label'] ?? ucfirst($platform),
                        'icon' => self::$platform_config[$platform]['icon'] ?? 'fa-link'
                    );

                    $result['links'][] = $link_data;
                    $result['count']++;
                    $result['success'] = true;

                    self::debug_log("Found {$platform}: {$cleaned_value}");
                }
            }
        }

        if ($result['success']) {
            $result['message'] = "Loaded {$result['count']} social links from native meta";
        } else {
            $result['message'] = "No social links found for post {$post_id}";
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
        
        if (!empty($component_data['success']) && !empty($component_data['links'])) {
            // Pass links array to template
            $props['links'] = $component_data['links'];
            $props['social_links'] = $component_data['links']; // Alias
            $props['links_count'] = count($component_data['links']);
            $props['has_links'] = true;
            
            // Create platform-indexed array for easy access
            $props['platforms'] = array();
            foreach ($component_data['links'] as $link) {
                $props['platforms'][$link['platform']] = $link;
            }
        } else {
            $props['links'] = array();
            $props['social_links'] = array();
            $props['links_count'] = 0;
            $props['has_links'] = false;
            $props['platforms'] = array();
        }
        
        return $props;
    }
    
    /**
     * Save social links data to native WordPress meta
     *
     * PHASE 2: Saves to clean field names, cleans up legacy fields
     *
     * @param int $post_id Post ID
     * @param array $links_data Social links data to save
     * @return array Save result with metadata
     */
    public static function save_component_data($post_id, $links_data) {
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

        if (!is_array($links_data)) {
            $result['message'] = 'Invalid links data format';
            return $result;
        }

        $links = isset($links_data['links']) ? $links_data['links'] : $links_data;

        // Save each platform using clean field names
        foreach (self::$field_mappings as $platform => $meta_key) {
            $value = '';

            // Find link for this platform
            foreach ($links as $link) {
                if (isset($link['platform']) && $link['platform'] === $platform) {
                    $value = $link['url'] ?? '';
                    break;
                }
            }

            // Clean and save to new clean field name
            $cleaned_value = sanitize_text_field(trim($value));

            if (!empty($cleaned_value)) {
                update_post_meta($post_id, $meta_key, $cleaned_value);
                $result['count']++;
            } else {
                delete_post_meta($post_id, $meta_key);
            }

            // Clean up legacy field if it exists
            if (isset(self::$legacy_mappings[$platform])) {
                $legacy_key = self::$legacy_mappings[$platform];
                delete_post_meta($post_id, $legacy_key);
            }
        }

        update_post_meta($post_id, 'social_links_last_saved', current_time('mysql'));

        $result['success'] = true;
        $result['message'] = "Successfully saved {$result['count']} social links to native meta";

        self::debug_log($result['message']);

        return $result;
    }
    
    /**
     * Check if social links exist for post
     *
     * PHASE 2: Checks both clean and legacy field names
     *
     * @param int $post_id Post ID
     * @return bool True if any social links exist
     */
    public static function has_component_data($post_id) {
        if (!self::validate_post_id($post_id)) {
            return false;
        }

        foreach (self::$field_mappings as $platform => $meta_key) {
            // Check clean field name
            $value = get_post_meta($post_id, $meta_key, true);
            if (!empty($value) && strlen(trim($value)) > 0) {
                return true;
            }

            // Check legacy field name
            if (isset(self::$legacy_mappings[$platform])) {
                $legacy_key = self::$legacy_mappings[$platform];
                $value = get_post_meta($post_id, $legacy_key, true);
                if (!empty($value) && strlen(trim($value)) > 0) {
                    return true;
                }
            }
        }

        return false;
    }
}

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ PHASE 8: Social Data Integration loaded (native meta)');
}

/**
 * ROOT FIX: Hook into component prop enrichment filter (ARCHITECTURE COMPLIANT)
 */
add_filter('gmkb_enrich_social_props', function($props, $post_id) {
    // Load social data using the Social_Data_Integration class
    $social_data = Social_Data_Integration::load_component_data($post_id);
    
    if ($social_data['success']) {
        // Prepare props using the class method
        $props = Social_Data_Integration::prepare_template_props($social_data, $props);
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ Social: Enriched props for post ' . $post_id);
            error_log('   - Links count: ' . count($props['links']));
        }
    }
    
    return $props;
}, 10, 2);
