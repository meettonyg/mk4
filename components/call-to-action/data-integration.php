<?php
/**
 * Call to Action Component - Data Integration
 *
 * PHASE 8: Uses native WordPress post_meta ONLY - NO Pods dependency
 *
 * @package Guestify/Components/CallToAction
 * @version 3.0.0-native
 */

if (!defined('ABSPATH')) {
    exit;
}

class Call_To_Action_Data_Integration {

    protected static $component_type = 'call-to-action';

    /**
     * Field mappings for CTA data
     */
    protected static $field_mappings = array(
        'title' => 'cta_title',
        'subtitle' => 'cta_subtitle',
        'description' => 'cta_description',
        'buttonText' => 'cta_button_text',
        'buttonUrl' => 'cta_button_url',
        'secondaryButtonText' => 'cta_secondary_button_text',
        'secondaryButtonUrl' => 'cta_secondary_button_url'
    );

    /**
     * Load CTA data from native WordPress meta
     */
    public static function load_component_data($post_id) {
        $result = array(
            'cta' => array(),
            'count' => 0,
            'source' => 'native_meta',
            'component_type' => self::$component_type,
            'success' => false,
            'message' => '',
            'timestamp' => current_time('mysql')
        );

        if (!is_numeric($post_id) || $post_id <= 0) {
            $result['message'] = 'Invalid post ID';
            return $result;
        }

        // Load all CTA fields
        foreach (self::$field_mappings as $key => $meta_key) {
            $value = get_post_meta($post_id, $meta_key, true);
            if (!empty($value)) {
                // URL fields need special handling
                if (strpos($key, 'Url') !== false) {
                    $result['cta'][$key] = esc_url_raw($value);
                } else {
                    $result['cta'][$key] = sanitize_text_field($value);
                }
                $result['count']++;
            }
        }

        if ($result['count'] > 0) {
            $result['success'] = true;
            $result['message'] = "Loaded {$result['count']} CTA fields from native meta";
        } else {
            $result['message'] = 'No CTA data found';
        }

        return $result;
    }

    /**
     * Save CTA data to native WordPress meta
     */
    public static function save_component_data($post_id, $data) {
        if (!is_numeric($post_id) || $post_id <= 0) {
            return array('success' => false, 'message' => 'Invalid post ID');
        }

        $cta = isset($data['cta']) ? $data['cta'] : $data;
        $count = 0;

        foreach (self::$field_mappings as $key => $meta_key) {
            if (isset($cta[$key])) {
                $value = strpos($key, 'Url') !== false
                    ? esc_url_raw($cta[$key])
                    : sanitize_text_field($cta[$key]);

                if (!empty($value)) {
                    update_post_meta($post_id, $meta_key, $value);
                    $count++;
                } else {
                    delete_post_meta($post_id, $meta_key);
                }
            }
        }

        return array('success' => true, 'count' => $count, 'message' => "Saved {$count} CTA fields");
    }

    /**
     * Check if CTA data exists
     */
    public static function has_component_data($post_id) {
        if (!is_numeric($post_id) || $post_id <= 0) {
            return false;
        }

        // Check for button URL (most critical CTA field)
        $button_url = get_post_meta($post_id, 'cta_button_url', true);
        if (!empty($button_url)) return true;

        // Check for button text
        $button_text = get_post_meta($post_id, 'cta_button_text', true);
        return !empty($button_text);
    }

    /**
     * Prepare template props
     */
    public static function prepare_template_props($component_data, $existing_props = array()) {
        $props = $existing_props;

        $cta = $component_data['cta'] ?? array();

        $props['title'] = $cta['title'] ?? '';
        $props['subtitle'] = $cta['subtitle'] ?? '';
        $props['description'] = $cta['description'] ?? '';
        $props['button_text'] = $cta['buttonText'] ?? 'Learn More';
        $props['button_url'] = $cta['buttonUrl'] ?? '';
        $props['secondary_button_text'] = $cta['secondaryButtonText'] ?? '';
        $props['secondary_button_url'] = $cta['secondaryButtonUrl'] ?? '';
        $props['has_cta'] = !empty($props['button_url']);
        $props['has_secondary'] = !empty($props['secondary_button_url']);

        return $props;
    }
}

/**
 * Enrich call-to-action props for frontend rendering
 */
add_filter('gmkb_enrich_call-to-action_props', function($props, $post_id) {
    $data = Call_To_Action_Data_Integration::load_component_data($post_id);

    if ($data['success']) {
        $props = Call_To_Action_Data_Integration::prepare_template_props($data, $props);
    }

    return $props;
}, 10, 2);

GMKB_Logger::startup('Call to Action Data Integration loaded');
