<?php
/**
 * Hero Component - Data Integration
 *
 * PHASE 8: Uses native WordPress post_meta ONLY - NO Pods dependency
 *
 * @package Guestify/Components/Hero
 * @version 3.0.0-native
 */

if (!defined('ABSPATH')) {
    exit;
}

class Hero_Data_Integration {

    protected static $component_type = 'hero';

    /**
     * Field mappings for hero data
     */
    protected static $field_mappings = array(
        'title' => 'full_name',
        'subtitle' => 'guest_title',
        'description' => 'biography_short',
        'image' => 'guest_headshot',
        'ctaText' => 'cta_button_text',
        'ctaLink' => 'cta_button_link'
    );

    /**
     * Load hero data from native WordPress meta
     */
    public static function load_component_data($post_id) {
        $result = array(
            'hero' => array(),
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

        // Load text fields
        foreach (self::$field_mappings as $key => $meta_key) {
            if ($key === 'image') continue; // Handle image separately

            $value = get_post_meta($post_id, $meta_key, true);
            if (!empty($value)) {
                $result['hero'][$key] = sanitize_text_field($value);
                $result['count']++;
            }
        }

        // Fallback for title - try first_name + last_name
        if (empty($result['hero']['title'])) {
            $first = get_post_meta($post_id, 'first_name', true);
            $last = get_post_meta($post_id, 'last_name', true);
            if (!empty($first) || !empty($last)) {
                $result['hero']['title'] = trim($first . ' ' . $last);
                $result['count']++;
            }
        }

        // Fallback for description - try biography
        if (empty($result['hero']['description'])) {
            $bio = get_post_meta($post_id, 'biography', true);
            if (!empty($bio)) {
                $result['hero']['description'] = wp_trim_words($bio, 30, '...');
                $result['count']++;
            }
        }

        // Load image (headshot)
        $image_id = get_post_meta($post_id, 'guest_headshot', true);
        if (empty($image_id)) {
            $image_id = get_post_meta($post_id, 'profile_photo', true);
        }
        if (empty($image_id)) {
            $image_id = get_post_meta($post_id, 'headshot', true);
        }

        if (!empty($image_id)) {
            $image_data = self::get_image_data($image_id);
            if ($image_data) {
                $result['hero']['image'] = $image_data;
                $result['count']++;
            }
        }

        if ($result['count'] > 0) {
            $result['success'] = true;
            $result['message'] = "Loaded {$result['count']} hero fields from native meta";
        } else {
            $result['message'] = 'No hero data found';
        }

        return $result;
    }

    /**
     * Get image data from attachment ID
     */
    private static function get_image_data($image_id) {
        // Handle Pods array format
        if (is_array($image_id) && isset($image_id['ID'])) {
            $image_id = $image_id['ID'];
        }

        $image_id = absint($image_id);
        if (!$image_id) return null;

        $url = wp_get_attachment_url($image_id);
        if (!$url) return null;

        return array(
            'id' => $image_id,
            'url' => $url,
            'alt' => get_post_meta($image_id, '_wp_attachment_image_alt', true),
            'sizes' => array(
                'thumbnail' => wp_get_attachment_image_url($image_id, 'thumbnail'),
                'medium' => wp_get_attachment_image_url($image_id, 'medium'),
                'large' => wp_get_attachment_image_url($image_id, 'large'),
                'full' => wp_get_attachment_image_url($image_id, 'full')
            )
        );
    }

    /**
     * Save hero data to native WordPress meta
     */
    public static function save_component_data($post_id, $data) {
        if (!is_numeric($post_id) || $post_id <= 0) {
            return array('success' => false, 'message' => 'Invalid post ID');
        }

        $hero = isset($data['hero']) ? $data['hero'] : $data;
        $count = 0;

        foreach (self::$field_mappings as $key => $meta_key) {
            if ($key === 'image') continue;

            if (isset($hero[$key])) {
                $value = $key === 'ctaLink'
                    ? esc_url_raw($hero[$key])
                    : sanitize_text_field($hero[$key]);

                if (!empty($value)) {
                    update_post_meta($post_id, $meta_key, $value);
                    $count++;
                } else {
                    delete_post_meta($post_id, $meta_key);
                }
            }
        }

        // Save image if provided
        if (isset($hero['image'])) {
            $image_id = is_array($hero['image']) ? ($hero['image']['id'] ?? 0) : absint($hero['image']);
            if ($image_id > 0) {
                update_post_meta($post_id, 'guest_headshot', $image_id);
                $count++;
            }
        }

        return array('success' => true, 'count' => $count, 'message' => "Saved {$count} hero fields");
    }

    /**
     * Check if hero data exists
     */
    public static function has_component_data($post_id) {
        if (!is_numeric($post_id) || $post_id <= 0) {
            return false;
        }

        // Check for name
        $name = get_post_meta($post_id, 'full_name', true);
        if (!empty($name)) return true;

        $first = get_post_meta($post_id, 'first_name', true);
        if (!empty($first)) return true;

        // Check for headshot
        $headshot = get_post_meta($post_id, 'guest_headshot', true);
        return !empty($headshot);
    }

    /**
     * Prepare template props
     */
    public static function prepare_template_props($component_data, $existing_props = array()) {
        $props = $existing_props;

        $hero = $component_data['hero'] ?? array();

        $props['title'] = $hero['title'] ?? '';
        $props['subtitle'] = $hero['subtitle'] ?? '';
        $props['description'] = $hero['description'] ?? '';
        $props['image'] = $hero['image'] ?? null;
        $props['image_url'] = isset($hero['image']['url']) ? $hero['image']['url'] : '';
        $props['cta_text'] = $hero['ctaText'] ?? '';
        $props['cta_link'] = $hero['ctaLink'] ?? '';
        $props['has_image'] = !empty($props['image_url']);
        $props['has_cta'] = !empty($props['cta_link']);

        return $props;
    }
}

/**
 * Enrich hero props for frontend rendering
 */
add_filter('gmkb_enrich_hero_props', function($props, $post_id) {
    $data = Hero_Data_Integration::load_component_data($post_id);

    if ($data['success']) {
        $props = Hero_Data_Integration::prepare_template_props($data, $props);
    }

    return $props;
}, 10, 2);

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ PHASE 8: Hero Data Integration loaded (native meta)');
}
