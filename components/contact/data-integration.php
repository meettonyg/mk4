<?php
/**
 * Contact Component - Data Integration
 * 
 * PHASE 8: Uses native WordPress post_meta ONLY - NO Pods dependency
 * 
 * @package Guestify/Components/Contact
 * @version 3.0.0-native
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Contact Data Integration
 * COMPLIANT: Uses generic class naming pattern: {Component}_Data_Integration
 */
class Contact_Data_Integration {
    
    /**
     * Component identifier
     */
    protected static $component_type = 'contact';
    
    /**
     * Contact field mappings (uses native WordPress post_meta)
     * Website removed - handled by Social component
     */
    protected static $field_mappings = array(
        'email' => 'email',
        'phone' => 'phone',
        'skype' => 'skype',
        'address' => 'address',
        'city' => 'city',
        'state' => 'state',
        'zip' => 'zip',
        'country' => 'country'
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
        GMKB_Logger::info('[Contact] ' . $message);
    }
    
    /**
     * Load contact data from Pods fields
     * 
     * @param int $post_id Post ID
     * @return array Contact data with metadata
     */
    public static function load_component_data($post_id) {
        $result = array(
            'contact' => array(),
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
            $value = get_post_meta($post_id, $meta_key, true);
            
            if (!empty($value) && is_string($value)) {
                $cleaned_value = sanitize_text_field(trim($value));
                
                if (strlen($cleaned_value) > 0) {
                    $result['contact'][$field_key] = $cleaned_value;
                    $result['count']++;
                    $result['success'] = true;
                    
                    self::debug_log("Found {$field_key}: {$cleaned_value}");
                }
            }
            
            // Ensure field exists even if empty
            if (!isset($result['contact'][$field_key])) {
                $result['contact'][$field_key] = '';
            }
        }
        
        // Build formatted address if components exist
        if (!empty($result['contact']['address'])) {
            $address_parts = array();
            if (!empty($result['contact']['address'])) $address_parts[] = $result['contact']['address'];
            if (!empty($result['contact']['city'])) $address_parts[] = $result['contact']['city'];
            if (!empty($result['contact']['state'])) $address_parts[] = $result['contact']['state'];
            if (!empty($result['contact']['zip'])) $address_parts[] = $result['contact']['zip'];
            if (!empty($result['contact']['country'])) $address_parts[] = $result['contact']['country'];
            
            $result['contact']['full_address'] = implode(', ', $address_parts);
        } else {
            $result['contact']['full_address'] = '';
        }
        
        if ($result['success']) {
            $result['message'] = "Loaded {$result['count']} contact fields from native meta";
        } else {
            $result['message'] = "No contact info found for post {$post_id}";
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
        
        if (!empty($component_data['success']) && !empty($component_data['contact'])) {
            // Flatten contact data into props
            foreach ($component_data['contact'] as $key => $value) {
                $props[$key] = $value;
            }
            
            // Add convenience flags
            $props['has_email'] = !empty($props['email']);
            $props['has_phone'] = !empty($props['phone']);
            $props['has_website'] = !empty($props['website']);
            $props['has_address'] = !empty($props['full_address']);
            $props['has_contact_info'] = true;
        } else {
            // Ensure fields exist even if empty
            foreach (self::$field_mappings as $field_key => $meta_key) {
                $props[$field_key] = '';
            }
            $props['full_address'] = '';
            $props['has_email'] = false;
            $props['has_phone'] = false;
            $props['has_website'] = false;
            $props['has_address'] = false;
            $props['has_contact_info'] = false;
        }
        
        return $props;
    }
    
    /**
     * Save contact data to Pods fields
     * 
     * @param int $post_id Post ID
     * @param array $contact_data Contact data to save
     * @return array Save result with metadata
     */
    public static function save_component_data($post_id, $contact_data) {
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
        
        if (!is_array($contact_data)) {
            $result['message'] = 'Invalid contact data format';
            return $result;
        }
        
        $contact = isset($contact_data['contact']) ? $contact_data['contact'] : $contact_data;
        
        // Save each field
        foreach (self::$field_mappings as $field_key => $meta_key) {
            $value = $contact[$field_key] ?? '';
            $cleaned_value = sanitize_text_field(trim($value));
            
            if (!empty($cleaned_value)) {
                update_post_meta($post_id, $meta_key, $cleaned_value);
                $result['count']++;
            } else {
                delete_post_meta($post_id, $meta_key);
            }
        }
        
        update_post_meta($post_id, 'contact_last_saved', current_time('mysql'));
        
        $result['success'] = true;
        $result['message'] = "Successfully saved {$result['count']} contact fields to native meta";
        
        self::debug_log($result['message']);
        
        return $result;
    }
    
    /**
     * Check if contact data exists for post
     * 
     * @param int $post_id Post ID
     * @return bool True if contact info exists
     */
    public static function has_component_data($post_id) {
        if (!self::validate_post_id($post_id)) {
            return false;
        }
        
        // Check for essential contact fields
        $email = get_post_meta($post_id, 'email', true);
        $phone = get_post_meta($post_id, 'phone', true);
        $website = get_post_meta($post_id, 'website', true);
        
        return (!empty($email) || !empty($phone) || !empty($website));
    }
}

GMKB_Logger::startup('Contact Data Integration loaded');

/**
 * ROOT FIX: Hook into component prop enrichment filter (ARCHITECTURE COMPLIANT)
 */
add_filter('gmkb_enrich_contact_props', function($props, $post_id) {
    // Load contact data using the Contact_Data_Integration class
    $contact_data = Contact_Data_Integration::load_component_data($post_id);
    
    if ($contact_data['success']) {
        // Prepare props using the class method
        $props = Contact_Data_Integration::prepare_template_props($contact_data, $props);
        
        GMKB_Logger::debug('Contact: Enriched props for post ' . $post_id . ' (fields: ' . $contact_data['count'] . ', has_email: ' . ($props['has_email'] ? 'Yes' : 'No') . ')');
    }
    
    return $props;
}, 10, 2);
