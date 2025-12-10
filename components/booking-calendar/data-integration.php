<?php
/**
 * Booking Calendar Component - Data Integration
 *
 * PHASE 8: Uses native WordPress post_meta ONLY - NO Pods dependency
 *
 * @package Guestify/Components/BookingCalendar
 * @version 3.0.0-native
 */

if (!defined('ABSPATH')) {
    exit;
}

class Booking_Calendar_Data_Integration {

    protected static $component_type = 'booking-calendar';

    /**
     * Field mappings for booking calendar data
     */
    protected static $field_mappings = array(
        'title' => 'booking_section_title',
        'subtitle' => 'booking_subtitle',
        'bookingType' => 'booking_type',
        'description' => 'booking_description',
        'calendarUrl' => 'booking_url',
        'calendlyUrl' => 'calendly_url',
        'availabilityText' => 'availability_info',
        'timezone' => 'default_timezone'
    );

    /**
     * Load booking calendar data from native WordPress meta
     */
    public static function load_component_data($post_id) {
        $result = array(
            'booking' => array(),
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

        // Load all booking fields
        foreach (self::$field_mappings as $key => $meta_key) {
            $value = get_post_meta($post_id, $meta_key, true);
            if (!empty($value)) {
                $result['booking'][$key] = sanitize_text_field($value);
                $result['count']++;
            }
        }

        // Also check for legacy calendar_url field
        if (empty($result['booking']['calendarUrl'])) {
            $legacy_url = get_post_meta($post_id, 'calendar_url', true);
            if (!empty($legacy_url)) {
                $result['booking']['calendarUrl'] = esc_url_raw($legacy_url);
                $result['count']++;
            }
        }

        if ($result['count'] > 0) {
            $result['success'] = true;
            $result['message'] = "Loaded {$result['count']} booking fields from native meta";
        } else {
            $result['message'] = 'No booking calendar data found';
        }

        return $result;
    }

    /**
     * Save booking calendar data to native WordPress meta
     */
    public static function save_component_data($post_id, $data) {
        if (!is_numeric($post_id) || $post_id <= 0) {
            return array('success' => false, 'message' => 'Invalid post ID');
        }

        $booking = isset($data['booking']) ? $data['booking'] : $data;
        $count = 0;

        foreach (self::$field_mappings as $key => $meta_key) {
            if (isset($booking[$key])) {
                $value = $key === 'calendarUrl' || $key === 'calendlyUrl'
                    ? esc_url_raw($booking[$key])
                    : sanitize_text_field($booking[$key]);

                if (!empty($value)) {
                    update_post_meta($post_id, $meta_key, $value);
                    $count++;
                } else {
                    delete_post_meta($post_id, $meta_key);
                }
            }
        }

        return array('success' => true, 'count' => $count, 'message' => "Saved {$count} booking fields");
    }

    /**
     * Check if booking calendar data exists
     */
    public static function has_component_data($post_id) {
        if (!is_numeric($post_id) || $post_id <= 0) {
            return false;
        }

        // Check for any calendar URL
        $calendly = get_post_meta($post_id, 'calendly_url', true);
        if (!empty($calendly)) return true;

        $booking_url = get_post_meta($post_id, 'booking_url', true);
        if (!empty($booking_url)) return true;

        $calendar_url = get_post_meta($post_id, 'calendar_url', true);
        return !empty($calendar_url);
    }

    /**
     * Prepare template props
     */
    public static function prepare_template_props($component_data, $existing_props = array()) {
        $props = $existing_props;

        $booking = $component_data['booking'] ?? array();

        $props['title'] = $booking['title'] ?? '';
        $props['subtitle'] = $booking['subtitle'] ?? '';
        $props['description'] = $booking['description'] ?? '';
        $props['calendar_url'] = $booking['calendarUrl'] ?? $booking['calendlyUrl'] ?? '';
        $props['calendly_url'] = $booking['calendlyUrl'] ?? '';
        $props['availability_text'] = $booking['availabilityText'] ?? '';
        $props['timezone'] = $booking['timezone'] ?? '';
        $props['has_calendar'] = !empty($props['calendar_url']) || !empty($props['calendly_url']);

        return $props;
    }
}

/**
 * Enrich booking-calendar props for frontend rendering
 */
add_filter('gmkb_enrich_booking-calendar_props', function($props, $post_id) {
    $data = Booking_Calendar_Data_Integration::load_component_data($post_id);

    if ($data['success']) {
        $props = Booking_Calendar_Data_Integration::prepare_template_props($data, $props);
    }

    return $props;
}, 10, 2);

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ PHASE 8: Booking Calendar Data Integration loaded (native meta)');
}
