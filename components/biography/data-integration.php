<?php
/**
 * Biography Component - Data Integration
 * 
 * COMPLIANT: Generic data-integration.php pattern that all components can follow
 * Handles all data operations for Biography component
 * 
 * @package Guestify/Components/Biography
 * @version 2.0.0-compliant
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Biography Data Integration
 * COMPLIANT: Uses generic class naming pattern: {Component}_Data_Integration
 */
class Biography_Data_Integration {
    
    /**
     * Component identifier
     */
    protected static $component_type = 'biography';
    
    /**
     * Pods field mappings for biography
     * ROOT FIX: Map to actual Pods fields from guest post type
     */
    protected static $field_mappings = array(
        'biography' => 'biography',          // Main biography field
        'name' => 'full_name',              // Full name field  
        'first_name' => 'first_name',      // First name
        'last_name' => 'last_name',        // Last name
        'title' => 'guest_title',          // Professional title
        'company' => 'company',            // Company/organization
        'tagline' => 'tagline',            // Tagline
        'introduction' => 'introduction'    // Introduction field
    );
    
    /**
     * ROOT FIX: Validate post ID
     */
    protected static function validate_post_id($post_id) {
        return is_numeric($post_id) && $post_id > 0;
    }
    
    /**
     * ROOT FIX: Debug logging
     */
    protected static function debug_log($message) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('[Biography_Pods_Integration] ' . $message);
        }
    }
    
    /**
     * Load biography data from Pods fields only
     * 
     * @param int $post_id Post ID
     * @return array Biography data with metadata
     */
    public static function load_component_data($post_id) {
        return self::load_biography_data($post_id);
    }
    
    /**
     * Save biography data to Pods fields only
     * 
     * @param int $post_id Post ID
     * @param array $data Biography data to save
     * @return array Save result with metadata
     */
    public static function save_component_data($post_id, $data) {
        return self::save_biography_data($post_id, $data);
    }
    
    /**
     * Check if biography data exists for post
     * 
     * @param int $post_id Post ID
     * @return bool True if biography exists
     */
    public static function has_component_data($post_id) {
        return self::has_biography_data($post_id);
    }
    
    /**
     * ROOT FIX: Load biography from Pods fields only
     * 
     * @param int $post_id Post ID
     * @return array Biography data with metadata
     */
    public static function load_biography_data($post_id) {
        $result = array(
            'biography' => array(),
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
            $bio_value = get_post_meta($post_id, $meta_key, true);
            
            if (!empty($bio_value) && is_string($bio_value)) {
                $cleaned_value = sanitize_textarea_field(trim($bio_value));
                if (strlen($cleaned_value) > 0) {
                    $result['biography'][$field_key] = $cleaned_value;
                    $result['count']++;
                    $result['success'] = true;
                    
                    self::debug_log("Found {$field_key} = " . substr($cleaned_value, 0, 50) . "... for post {$post_id}");
                }
            }
            
            // Ensure field exists even if empty
            if (!isset($result['biography'][$field_key])) {
                $result['biography'][$field_key] = '';
            }
        }
        
        // Set quality assessment
        if ($result['success']) {
            $result['quality'] = self::assess_data_quality($result['biography']);
            $result['message'] = "Loaded {$result['count']} biography fields from Pods";
        } else {
            $result['message'] = "No biography found in Pods fields for post {$post_id}";
        }
        
        // Add metadata
        $result['meta'] = array(
            'generated_date' => get_post_meta($post_id, 'biography_generated_date', true),
            'word_count' => isset($result['biography']['long']) ? str_word_count($result['biography']['long']) : 0,
            'tone_style' => get_post_meta($post_id, 'biography_tone_style', true)
        );
        
        self::debug_log($result['message']);
        
        return $result;
    }
    
    /**
     * Save biography to Pods fields only
     * 
     * @param int $post_id Post ID
     * @param array $biography_data Biography data to save
     * @return array Save result with metadata
     */
    public static function save_biography_data($post_id, $biography_data) {
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
        
        if (!is_array($biography_data)) {
            $result['message'] = 'Invalid biography data format';
            return $result;
        }
        
        try {
            // Save to Pods fields only - single source of truth
            foreach (self::$field_mappings as $field_key => $meta_key) {
                $bio_value = '';
                
                // Extract value from different possible input formats
                if (isset($biography_data['biography'][$field_key])) {
                    $bio_value = $biography_data['biography'][$field_key];
                } elseif (isset($biography_data[$field_key])) {
                    $bio_value = $biography_data[$field_key];
                } elseif (isset($biography_data[$meta_key])) {
                    $bio_value = $biography_data[$meta_key];
                }
                
                // Sanitize and save
                $cleaned_value = is_string($bio_value) ? sanitize_textarea_field(trim($bio_value)) : '';
                $save_result = update_post_meta($post_id, $meta_key, $cleaned_value);
                
                $result['operations'][] = array(
                    'field' => $field_key,
                    'meta_key' => $meta_key,
                    'value' => substr($cleaned_value, 0, 100) . (strlen($cleaned_value) > 100 ? '...' : ''),
                    'success' => $save_result !== false
                );
                
                if (!empty($cleaned_value)) {
                    $result['count']++;
                }
            }
            
            // Save metadata
            update_post_meta($post_id, 'biography_last_saved', current_time('mysql'));
            update_post_meta($post_id, 'biography_save_method', 'pods_component_integration');
            update_post_meta($post_id, 'biography_component_type', self::$component_type);
            
            $result['success'] = true;
            $result['message'] = "Successfully saved {$result['count']} biography fields to Pods";
            
            self::debug_log($result['message']);
            
        } catch (Exception $e) {
            $result['message'] = 'Save error: ' . $e->getMessage();
            self::debug_log("Save Error: " . $e->getMessage());
        }
        
        return $result;
    }
    
    /**
     * Check if biography data exists for post
     * 
     * @param int $post_id Post ID
     * @return bool True if biography exists
     */
    public static function has_biography_data($post_id) {
        if (!self::validate_post_id($post_id)) {
            return false;
        }
        
        // ROOT FIX: Check actual biography field from Pods
        $bio_value = get_post_meta($post_id, 'biography', true);
        if (!empty($bio_value) && is_string($bio_value) && strlen(trim($bio_value)) > 0) {
            return true;
        }
        
        // Also check for name and title as secondary indicators
        $name_value = get_post_meta($post_id, 'full_name', true);
        if (!empty($name_value) && is_string($name_value) && strlen(trim($name_value)) > 0) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Get biography data availability info
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
            'core_fields' => array(),
            'optional_fields' => array()
        );
        
        if (!self::validate_post_id($post_id)) {
            return $result;
        }
        
        // ROOT FIX: Use actual field names
        $core_fields = array('biography', 'name', 'title');
        
        foreach (self::$field_mappings as $field_key => $meta_key) {
            $bio_value = get_post_meta($post_id, $meta_key, true);
            $has_data = !empty($bio_value) && is_string($bio_value) && strlen(trim($bio_value)) > 0;
            
            if ($has_data) {
                $result['field_count']++;
                $result['has_data'] = true;
            } else {
                $result['empty_fields']++;
            }
            
            if (in_array($field_key, $core_fields)) {
                $result['core_fields'][$field_key] = $has_data;
            } else {
                $result['optional_fields'][$field_key] = $has_data;
            }
        }
        
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
            $bio_value = get_post_meta($post_id, $meta_key, true);
            if (!empty($bio_value)) {
                $content_parts[] = $meta_key . ':' . md5($bio_value);
            }
        }
        
        return md5(implode('|', $content_parts));
    }
    
    /**
     * COMPLIANT: Prepare template props from component data
     * This keeps component-specific logic within the component
     * 
     * @param array $component_data Data from load_component_data
     * @param array $existing_props Existing props to merge with
     * @return array Props ready for template
     */
    public static function prepare_template_props($component_data, $existing_props = array()) {
        $props = $existing_props;
        
        if (!empty($component_data['success']) && !empty($component_data['biography'])) {
            // ROOT FIX: Get the main biography field from Pods
            $bio_content = $component_data['biography']['biography'] ?? '';
            
            // Fallback to introduction if biography is empty
            if (empty($bio_content) && !empty($component_data['biography']['introduction'])) {
                $bio_content = $component_data['biography']['introduction'];
            }
            
            // Provide content in multiple formats for template compatibility
            $props['bio'] = $bio_content;
            $props['content'] = $bio_content;
            $props['biography'] = $bio_content;
            $props['bio_content'] = $bio_content;  // Add bio_content key used in template
            
            // Add name data - combine first and last if full_name not available
            $props['name'] = $component_data['biography']['name'] ?? '';
            if (empty($props['name']) && (!empty($component_data['biography']['first_name']) || !empty($component_data['biography']['last_name']))) {
                $props['name'] = trim(
                    ($component_data['biography']['first_name'] ?? '') . ' ' . 
                    ($component_data['biography']['last_name'] ?? '')
                );
            }
            
            $props['title'] = $component_data['biography']['title'] ?? '';
            $props['company'] = $component_data['biography']['company'] ?? '';
            $props['tagline'] = $component_data['biography']['tagline'] ?? '';
            
            // Add debugging info
            self::debug_log('Biography props prepared: ' . json_encode(array(
                'has_bio' => !empty($bio_content),
                'bio_length' => strlen($bio_content),
                'name' => $props['name'],
                'title' => $props['title']
            )));
        }
        
        return $props;
    }
    
    /**
     * Assess data quality
     * 
     * @param array $biography Biography data
     * @return string Quality level
     */
    private static function assess_data_quality($biography) {
        // ROOT FIX: Use actual field names from Pods
        $core_fields = array('biography', 'name', 'title');
        $filled_core = 0;
        $filled_optional = 0;
        
        foreach ($biography as $field_key => $value) {
            if (!empty($value) && strlen(trim($value)) > 0) {
                if (in_array($field_key, $core_fields)) {
                    $filled_core++;
                } else {
                    $filled_optional++;
                }
            }
        }
        
        // ROOT FIX: Adjust quality levels for actual fields
        if ($filled_core >= 3 && $filled_optional >= 2) return 'excellent';
        if ($filled_core >= 2 && $filled_optional >= 1) return 'good';
        if ($filled_core >= 2) return 'fair';
        if ($filled_core >= 1) return 'minimal';
        return 'empty';
    }
}

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ COMPLIANT: Biography Data Integration loaded - Generic data-integration.php pattern');
}

/**
 * ROOT FIX: Hook into component prop enrichment filter (ARCHITECTURE COMPLIANT)
 * This keeps biography-specific logic in the biography component
 */
add_filter('gmkb_enrich_biography_props', function($props, $post_id) {
    // Only proceed if Pods is active
    if (!function_exists('pods')) {
        return $props;
    }
    
    try {
        $pod = pods('guests', $post_id);
        if (!$pod || !$pod->exists()) {
            return $props;
        }
        
        // ROOT FIX: Helper to extract string value from Pods fields (handles arrays)
        $extract_value = function($value) {
            if (is_array($value)) {
                // Handle array returns from Pods relationship/pick fields
                if (isset($value[0])) {
                    return is_string($value[0]) ? $value[0] : '';
                }
                // Handle associative arrays (post objects, etc)
                if (isset($value['name'])) return $value['name'];
                if (isset($value['post_title'])) return $value['post_title'];
                return '';
            }
            return is_string($value) ? $value : '';
        };
        
        // Load guest data from Pods - matching Vue component prop names
        $first_name = $extract_value($pod->field('first_name'));
        $last_name = $extract_value($pod->field('last_name'));
        
        $props['name'] = trim($first_name . ' ' . $last_name);
        $props['title'] = $extract_value($pod->field('professional_title'));
        $props['company'] = $extract_value($pod->field('company'));
        $props['location'] = $extract_value($pod->field('location'));
        
        $bio = $extract_value($pod->field('biography'));
        $props['bio'] = $bio;
        $props['biography'] = $bio; // Alias
        $props['bio_content'] = $bio; // Template uses this
        
        // Handle headshot image
        $headshot = $pod->field('headshot');
        if (is_array($headshot) && isset($headshot['guid'])) {
            $props['image_url'] = $headshot['guid'];
        } elseif (is_string($headshot)) {
            $props['image_url'] = $headshot;
        } else {
            // Try dot notation
            $props['image_url'] = $extract_value($pod->field('headshot.guid'));
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ Biography Filter: Enriched props for post ' . $post_id);
            error_log('   - Name: ' . $props['name']);
            error_log('   - Title: ' . $props['title']);
            error_log('   - Company: ' . $props['company']);
            error_log('   - Location: ' . ($props['location'] ?? 'NONE'));
            error_log('   - Bio length: ' . strlen($bio));
        }
        
    } catch (Exception $e) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('⚠️ Biography Filter: Error enriching props: ' . $e->getMessage());
        }
    }
    
    return $props;
}, 10, 2);
