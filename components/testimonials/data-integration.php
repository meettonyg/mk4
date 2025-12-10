<?php
/**
 * Testimonials Component - Data Integration
 *
 * PHASE 8: Uses native WordPress post_meta ONLY - NO Pods dependency
 *
 * @package Guestify/Components/Testimonials
 * @version 3.0.0-native
 */

if (!defined('ABSPATH')) {
    exit;
}

class Testimonials_Data_Integration {

    protected static $component_type = 'testimonials';

    /**
     * Maximum number of testimonials supported
     */
    const MAX_TESTIMONIALS = 10;

    /**
     * Load testimonials data from native WordPress meta
     */
    public static function load_component_data($post_id) {
        $result = array(
            'testimonials' => array(),
            'title' => '',
            'subtitle' => '',
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

        // Load section title/subtitle
        $result['title'] = get_post_meta($post_id, 'testimonials_title', true) ?: '';
        $result['subtitle'] = get_post_meta($post_id, 'testimonials_subtitle', true) ?: '';

        // Load individual testimonials (1-10)
        for ($i = 1; $i <= self::MAX_TESTIMONIALS; $i++) {
            // Try structured format first
            $quote = get_post_meta($post_id, "testimonial_{$i}_quote", true);
            $author = get_post_meta($post_id, "testimonial_{$i}_author", true);
            $company = get_post_meta($post_id, "testimonial_{$i}_company", true);
            $photo = get_post_meta($post_id, "testimonial_{$i}_photo", true);
            $rating = get_post_meta($post_id, "testimonial_{$i}_rating", true);

            // Fallback to simple testimonial_N field
            if (empty($quote)) {
                $quote = get_post_meta($post_id, "testimonial_{$i}", true);
            }

            if (!empty($quote)) {
                $testimonial = array(
                    'id' => 'testimonial_' . $i,
                    'index' => $i,
                    'quote' => wp_kses_post($quote),
                    'text' => wp_kses_post($quote),
                    'author' => sanitize_text_field($author),
                    'company' => sanitize_text_field($company),
                    'rating' => absint($rating) ?: 5
                );

                // Handle photo
                if (!empty($photo)) {
                    $photo_id = is_array($photo) ? ($photo['ID'] ?? 0) : absint($photo);
                    if ($photo_id > 0) {
                        $testimonial['photo'] = array(
                            'id' => $photo_id,
                            'url' => wp_get_attachment_url($photo_id),
                            'thumbnail' => wp_get_attachment_image_url($photo_id, 'thumbnail')
                        );
                    }
                }

                $result['testimonials'][] = $testimonial;
                $result['count']++;
            }
        }

        // Also check for serialized testimonials array
        $testimonials_array = get_post_meta($post_id, 'testimonials', true);
        if (!empty($testimonials_array) && is_array($testimonials_array) && empty($result['testimonials'])) {
            foreach ($testimonials_array as $index => $testimonial) {
                if (is_array($testimonial) && !empty($testimonial['quote'] ?? $testimonial['text'] ?? '')) {
                    $result['testimonials'][] = array(
                        'id' => 'testimonial_' . ($index + 1),
                        'index' => $index + 1,
                        'quote' => wp_kses_post($testimonial['quote'] ?? $testimonial['text'] ?? ''),
                        'text' => wp_kses_post($testimonial['quote'] ?? $testimonial['text'] ?? ''),
                        'author' => sanitize_text_field($testimonial['author'] ?? ''),
                        'company' => sanitize_text_field($testimonial['company'] ?? ''),
                        'rating' => absint($testimonial['rating'] ?? 5)
                    );
                    $result['count']++;
                }
            }
        }

        if ($result['count'] > 0) {
            $result['success'] = true;
            $result['message'] = "Loaded {$result['count']} testimonials from native meta";
        } else {
            $result['message'] = 'No testimonials data found';
        }

        return $result;
    }

    /**
     * Save testimonials data to native WordPress meta
     */
    public static function save_component_data($post_id, $data) {
        if (!is_numeric($post_id) || $post_id <= 0) {
            return array('success' => false, 'message' => 'Invalid post ID');
        }

        $count = 0;

        // Save title/subtitle
        if (isset($data['title'])) {
            update_post_meta($post_id, 'testimonials_title', sanitize_text_field($data['title']));
        }
        if (isset($data['subtitle'])) {
            update_post_meta($post_id, 'testimonials_subtitle', sanitize_text_field($data['subtitle']));
        }

        // Save individual testimonials
        $testimonials = isset($data['testimonials']) ? $data['testimonials'] : array();

        for ($i = 1; $i <= self::MAX_TESTIMONIALS; $i++) {
            $testimonial_index = $i - 1;

            if (isset($testimonials[$testimonial_index])) {
                $testimonial = $testimonials[$testimonial_index];

                $quote = is_array($testimonial) ? ($testimonial['quote'] ?? $testimonial['text'] ?? '') : $testimonial;

                if (!empty($quote)) {
                    update_post_meta($post_id, "testimonial_{$i}_quote", wp_kses_post($quote));
                    update_post_meta($post_id, "testimonial_{$i}", wp_kses_post($quote)); // Simple fallback

                    if (isset($testimonial['author'])) {
                        update_post_meta($post_id, "testimonial_{$i}_author", sanitize_text_field($testimonial['author']));
                    }
                    if (isset($testimonial['company'])) {
                        update_post_meta($post_id, "testimonial_{$i}_company", sanitize_text_field($testimonial['company']));
                    }
                    if (isset($testimonial['rating'])) {
                        update_post_meta($post_id, "testimonial_{$i}_rating", absint($testimonial['rating']));
                    }
                    if (isset($testimonial['photo'])) {
                        $photo_id = is_array($testimonial['photo']) ? ($testimonial['photo']['id'] ?? 0) : absint($testimonial['photo']);
                        if ($photo_id > 0) {
                            update_post_meta($post_id, "testimonial_{$i}_photo", $photo_id);
                        }
                    }
                    $count++;
                } else {
                    self::delete_testimonial_fields($post_id, $i);
                }
            } else {
                self::delete_testimonial_fields($post_id, $i);
            }
        }

        return array('success' => true, 'count' => $count, 'message' => "Saved {$count} testimonials");
    }

    /**
     * Delete all fields for a specific testimonial index
     */
    private static function delete_testimonial_fields($post_id, $index) {
        delete_post_meta($post_id, "testimonial_{$index}");
        delete_post_meta($post_id, "testimonial_{$index}_quote");
        delete_post_meta($post_id, "testimonial_{$index}_author");
        delete_post_meta($post_id, "testimonial_{$index}_company");
        delete_post_meta($post_id, "testimonial_{$index}_rating");
        delete_post_meta($post_id, "testimonial_{$index}_photo");
    }

    /**
     * Check if testimonials data exists
     */
    public static function has_component_data($post_id) {
        if (!is_numeric($post_id) || $post_id <= 0) {
            return false;
        }

        // Check for any testimonial
        for ($i = 1; $i <= self::MAX_TESTIMONIALS; $i++) {
            $quote = get_post_meta($post_id, "testimonial_{$i}_quote", true);
            if (!empty($quote)) return true;

            $simple = get_post_meta($post_id, "testimonial_{$i}", true);
            if (!empty($simple)) return true;
        }

        // Check serialized array
        $testimonials = get_post_meta($post_id, 'testimonials', true);
        return !empty($testimonials);
    }

    /**
     * Prepare template props
     */
    public static function prepare_template_props($component_data, $existing_props = array()) {
        $props = $existing_props;

        $props['title'] = $component_data['title'] ?? '';
        $props['subtitle'] = $component_data['subtitle'] ?? '';
        $props['testimonials'] = $component_data['testimonials'] ?? array();
        $props['testimonials_count'] = count($props['testimonials']);
        $props['has_testimonials'] = !empty($props['testimonials']);

        return $props;
    }
}

/**
 * Enrich testimonials props for frontend rendering
 */
add_filter('gmkb_enrich_testimonials_props', function($props, $post_id) {
    $data = Testimonials_Data_Integration::load_component_data($post_id);

    if ($data['success']) {
        $props = Testimonials_Data_Integration::prepare_template_props($data, $props);
    }

    return $props;
}, 10, 2);

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ PHASE 8: Testimonials Data Integration loaded (native meta)');
}
