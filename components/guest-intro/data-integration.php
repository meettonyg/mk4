<?php
/**
 * Guest Intro Component - Data Integration
 * 
 * COMPLIANT: Generic data-integration.php pattern for Guest Intro component
 * Handles all data operations for Guest Introduction component
 * 
 * @package Guestify/Components/GuestIntro
 * @version 1.0.0-compliant
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Guest Intro Data Integration
 * COMPLIANT: Uses generic class naming pattern: {Component}_Data_Integration
 */
class Guest_Intro_Data_Integration {
    
    /**
     * Component identifier
     */
    protected static $component_type = 'guest-intro';
    
    /**
     * Field mappings for guest intro
     * Maps to Pods fields in guest post type
     */
    protected static $field_mappings = array(
        'name' => 'full_name',
        'first_name' => 'first_name',
        'last_name' => 'last_name',
        'tagline' => 'tagline',
        'title' => 'professional_title',
        'company' => 'company',
        'introduction' => 'introduction',
        'headshot' => 'headshot'
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
            error_log('[Guest_Intro_Data_Integration] ' . $message);
        }
    }
    
    /**
     * Load guest intro data from Pods fields
     * 
     * @param int $post_id Post ID
     * @return array Guest intro data with metadata
     */
    public static function load_component_data($post_id) {
        $result = array(
            'intro' => array(),
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
        
        // Only proceed if Pods is active
        if (!function_exists('pods')) {
            $result['message'] = 'Pods plugin not active';
            return $result;
        }
        
        try {
            $pod = pods('guests', $post_id);
            if (!$pod || !$pod->exists()) {
                $result['message'] = 'Guest post not found';
                return $result;
            }
            
            // Load fields
            $first_name = $pod->field('first_name');
            $last_name = $pod->field('last_name');
            
            $result['intro']['name'] = trim($first_name . ' ' . $last_name);
            $result['intro']['first_name'] = $first_name;
            $result['intro']['last_name'] = $last_name;
            $result['intro']['tagline'] = $pod->field('tagline');
            $result['intro']['title'] = $pod->field('professional_title');
            $result['intro']['company'] = $pod->field('company');
            $result['intro']['introduction'] = $pod->field('introduction');
            
            // Handle headshot - can be URL string or array
            $headshot = $pod->field('headshot');
            if (is_array($headshot) && isset($headshot['guid'])) {
                $result['intro']['headshot'] = $headshot['guid'];
            } elseif (is_string($headshot)) {
                $result['intro']['headshot'] = $headshot;
            } else {
                $result['intro']['headshot'] = '';
            }
            
            // Try .guid format
            if (empty($result['intro']['headshot'])) {
                $headshot_url = $pod->field('headshot.guid');
                if (!empty($headshot_url)) {
                    $result['intro']['headshot'] = $headshot_url;
                }
            }
            
            // Count non-empty fields
            foreach ($result['intro'] as $value) {
                if (!empty($value)) {
                    $result['count']++;
                }
            }
            
            if ($result['count'] > 0) {
                $result['success'] = true;
                $result['message'] = "Loaded {$result['count']} intro fields from Pods";
                self::debug_log($result['message']);
            } else {
                $result['message'] = "No intro data found for post {$post_id}";
            }
            
        } catch (Exception $e) {
            $result['message'] = 'Error loading intro data: ' . $e->getMessage();
            self::debug_log($result['message']);
        }
        
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
        
        if (!empty($component_data['success']) && !empty($component_data['intro'])) {
            // Flatten intro data into props
            foreach ($component_data['intro'] as $key => $value) {
                $props[$key] = $value;
            }
            
            // Add convenience flags
            $props['has_name'] = !empty($props['name']);
            $props['has_tagline'] = !empty($props['tagline']);
            $props['has_title'] = !empty($props['title']);
            $props['has_intro'] = !empty($props['introduction']);
            $props['has_headshot'] = !empty($props['headshot']);
        } else {
            // Ensure fields exist even if empty
            foreach (self::$field_mappings as $field_key => $meta_key) {
                if (!isset($props[$field_key])) {
                    $props[$field_key] = '';
                }
            }
            $props['has_name'] = false;
            $props['has_tagline'] = false;
            $props['has_title'] = false;
            $props['has_intro'] = false;
            $props['has_headshot'] = false;
        }
        
        return $props;
    }
    
    /**
     * Save guest intro data to Pods fields
     * 
     * @param int $post_id Post ID
     * @param array $intro_data Intro data to save
     * @return array Save result with metadata
     */
    public static function save_component_data($post_id, $intro_data) {
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
        
        if (!is_array($intro_data)) {
            $result['message'] = 'Invalid intro data format';
            return $result;
        }
        
        // Only proceed if Pods is active
        if (!function_exists('pods')) {
            $result['message'] = 'Pods plugin not active';
            return $result;
        }
        
        try {
            $pod = pods('guests', $post_id);
            if (!$pod || !$pod->exists()) {
                $result['message'] = 'Guest post not found';
                return $result;
            }
            
            $intro = isset($intro_data['intro']) ? $intro_data['intro'] : $intro_data;
            
            // Save fields via Pods
            $save_data = array();
            
            if (isset($intro['first_name'])) $save_data['first_name'] = sanitize_text_field($intro['first_name']);
            if (isset($intro['last_name'])) $save_data['last_name'] = sanitize_text_field($intro['last_name']);
            if (isset($intro['tagline'])) $save_data['tagline'] = sanitize_text_field($intro['tagline']);
            if (isset($intro['title'])) $save_data['professional_title'] = sanitize_text_field($intro['title']);
            if (isset($intro['company'])) $save_data['company'] = sanitize_text_field($intro['company']);
            if (isset($intro['introduction'])) $save_data['introduction'] = sanitize_textarea_field($intro['introduction']);
            if (isset($intro['headshot'])) $save_data['headshot'] = esc_url_raw($intro['headshot']);
            
            if (!empty($save_data)) {
                $pod->save($save_data);
                $result['count'] = count($save_data);
                $result['success'] = true;
                $result['message'] = "Successfully saved {$result['count']} intro fields to Pods";
            } else {
                $result['message'] = 'No data to save';
            }
            
            self::debug_log($result['message']);
            
        } catch (Exception $e) {
            $result['message'] = 'Save error: ' . $e->getMessage();
            self::debug_log($result['message']);
        }
        
        return $result;
    }
    
    /**
     * Check if guest intro data exists for post
     * 
     * @param int $post_id Post ID
     * @return bool True if intro data exists
     */
    public static function has_component_data($post_id) {
        if (!self::validate_post_id($post_id)) {
            return false;
        }
        
        if (!function_exists('pods')) {
            return false;
        }
        
        try {
            $pod = pods('guests', $post_id);
            if (!$pod || !$pod->exists()) {
                return false;
            }
            
            // Check for essential fields
            $first_name = $pod->field('first_name');
            $tagline = $pod->field('tagline');
            $introduction = $pod->field('introduction');
            
            return (!empty($first_name) || !empty($tagline) || !empty($introduction));
            
        } catch (Exception $e) {
            return false;
        }
    }
}

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ COMPLIANT: Guest Intro Data Integration loaded');
}

/**
 * ROOT FIX: Hook into component prop enrichment filter (ARCHITECTURE COMPLIANT)
 */
add_filter('gmkb_enrich_guest-intro_props', function($props, $post_id) {
    // Load guest intro data using the Guest_Intro_Data_Integration class
    $intro_data = Guest_Intro_Data_Integration::load_component_data($post_id);
    
    if ($intro_data['success']) {
        // Prepare props using the class method
        $props = Guest_Intro_Data_Integration::prepare_template_props($intro_data, $props);
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ Guest Intro: Enriched props for post ' . $post_id);
            error_log('   - Name: ' . ($props['name'] ?? 'N/A'));
            error_log('   - Has tagline: ' . ($props['has_tagline'] ? 'Yes' : 'No'));
        }
    }
    
    return $props;
}, 10, 2);
