<?php
/**
 * Offers Component - Data Integration
 *
 * PHASE 8: Self-contained component architecture for Offers
 * Handles loading offer data for profiles using native WordPress
 *
 * @package Guestify/Components/Offers
 * @version 1.0.0-native
 */

if (!defined('ABSPATH')) {
    exit;
}

class Offers_Data_Integration {

    /**
     * Component identifier
     */
    protected static $component_type = 'offers';

    /**
     * Meta key for profile-offer relationship
     */
    const RELATIONSHIP_META_KEY = 'associated_offers';

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
            error_log('[Offers_Data_Integration] ' . $message);
        }
    }

    /**
     * Load offers data for a profile
     *
     * @param int $post_id Profile post ID
     * @return array Offers data with metadata
     */
    public static function load_component_data($post_id) {
        $result = array(
            'offers' => array(),
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

        // Load associated offer IDs from profile meta
        $offer_ids = get_post_meta($post_id, self::RELATIONSHIP_META_KEY, true);

        if (empty($offer_ids) || !is_array($offer_ids)) {
            $result['message'] = "No offers linked to profile {$post_id}";
            self::debug_log($result['message']);
            return $result;
        }

        // Load each offer's data
        foreach ($offer_ids as $offer_id) {
            $offer_id = absint($offer_id);
            if (!$offer_id) continue;

            $offer_post = get_post($offer_id);

            // Skip if offer doesn't exist or is wrong post type
            if (!$offer_post || $offer_post->post_type !== 'gmkb_offer') {
                self::debug_log("Skipping invalid offer ID: {$offer_id}");
                continue;
            }

            // Skip non-published offers (unless in preview/edit context)
            if (!in_array($offer_post->post_status, array('publish', 'draft', 'private'))) {
                continue;
            }

            $offer_data = self::format_offer($offer_post);
            $result['offers'][] = $offer_data;
            $result['count']++;
        }

        $result['success'] = $result['count'] > 0;
        $result['message'] = $result['success']
            ? "Loaded {$result['count']} offers for profile {$post_id}"
            : "No valid offers found for profile {$post_id}";

        self::debug_log($result['message']);

        return $result;
    }

    /**
     * Format single offer for component display
     *
     * @param WP_Post $post Offer post object
     * @return array Formatted offer data
     */
    private static function format_offer($post) {
        $offer = array(
            'id' => $post->ID,
            'title' => $post->post_title,
            'description' => $post->post_content,
            'status' => $post->post_status,
            'type' => self::get_offer_type($post->ID),
            'format' => get_post_meta($post->ID, 'offer_format', true),
            'cta_text' => get_post_meta($post->ID, 'offer_cta_text', true) ?: 'Learn More',
            'url' => get_post_meta($post->ID, 'offer_url', true),
            'retail_value' => (float) get_post_meta($post->ID, 'offer_retail_value', true),
            'expiry_date' => get_post_meta($post->ID, 'offer_expiry_date', true),
            'code' => get_post_meta($post->ID, 'offer_code', true),
            'clicks' => (int) get_post_meta($post->ID, 'offer_clicks', true),
        );

        // Add image data
        $image_id = get_post_meta($post->ID, 'offer_image_id', true);
        if ($image_id) {
            $offer['image'] = self::format_image($image_id);
            $offer['has_image'] = true;
        } else {
            $offer['image'] = null;
            $offer['has_image'] = false;
        }

        // Check if offer is expired
        $offer['is_expired'] = false;
        if (!empty($offer['expiry_date'])) {
            $expiry_timestamp = strtotime($offer['expiry_date']);
            if ($expiry_timestamp && $expiry_timestamp < time()) {
                $offer['is_expired'] = true;
            }
        }

        return $offer;
    }

    /**
     * Get offer type taxonomy term
     */
    private static function get_offer_type($post_id) {
        $terms = wp_get_object_terms($post_id, 'offer_type', array('fields' => 'slugs'));
        return !empty($terms) && !is_wp_error($terms) ? $terms[0] : null;
    }

    /**
     * Format image attachment data
     */
    private static function format_image($attachment_id) {
        $attachment_id = absint($attachment_id);
        if (!$attachment_id) {
            return null;
        }

        $attachment = get_post($attachment_id);
        if (!$attachment || $attachment->post_type !== 'attachment') {
            return null;
        }

        return array(
            'id' => $attachment_id,
            'url' => wp_get_attachment_url($attachment_id),
            'alt' => get_post_meta($attachment_id, '_wp_attachment_image_alt', true),
            'title' => $attachment->post_title,
            'thumbnail' => wp_get_attachment_image_url($attachment_id, 'thumbnail'),
            'medium' => wp_get_attachment_image_url($attachment_id, 'medium'),
            'large' => wp_get_attachment_image_url($attachment_id, 'large'),
            'full' => wp_get_attachment_image_url($attachment_id, 'full'),
        );
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

        $props['offers'] = $component_data['offers'] ?? array();
        $props['offers_count'] = count($props['offers']);
        $props['has_offers'] = !empty($props['offers']);

        // Filter out expired offers by default (unless showing all)
        $show_expired = $existing_props['show_expired'] ?? false;
        if (!$show_expired) {
            $props['offers'] = array_filter($props['offers'], function($offer) {
                return empty($offer['is_expired']);
            });
            $props['offers'] = array_values($props['offers']); // Re-index
            $props['offers_count'] = count($props['offers']);
        }

        return $props;
    }

    /**
     * Save profile-offer associations
     *
     * @param int $post_id Profile post ID
     * @param array $data Data array containing offer IDs (supports 'offers', 'offer_ids', or direct array)
     * @return array Save result
     */
    public static function save_component_data($post_id, $data) {
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

        // Extract offer IDs from the data array, supporting multiple formats for robustness
        $offer_ids = is_array($data) ? ($data['offers'] ?? $data['offer_ids'] ?? $data) : array();

        if (!is_array($offer_ids)) {
            $offer_ids = array();
        }

        // Validate and sanitize offer IDs
        $valid_ids = array();
        foreach ($offer_ids as $offer_id) {
            $offer_id = absint($offer_id);
            if ($offer_id) {
                $post = get_post($offer_id);
                if ($post && $post->post_type === 'gmkb_offer') {
                    $valid_ids[] = $offer_id;
                }
            }
        }

        // Save to meta
        update_post_meta($post_id, self::RELATIONSHIP_META_KEY, $valid_ids);

        $result['success'] = true;
        $result['count'] = count($valid_ids);
        $result['message'] = "Saved {$result['count']} offer associations";

        self::debug_log($result['message']);

        return $result;
    }

    /**
     * Check if profile has any associated offers
     *
     * @param int $post_id Profile post ID
     * @return bool
     */
    public static function has_component_data($post_id) {
        if (!self::validate_post_id($post_id)) {
            return false;
        }

        $offer_ids = get_post_meta($post_id, self::RELATIONSHIP_META_KEY, true);
        return !empty($offer_ids) && is_array($offer_ids);
    }

    /**
     * Link a single offer to a profile
     *
     * @param int $profile_id Profile post ID
     * @param int $offer_id Offer post ID
     * @return bool Success
     */
    public static function link_offer($profile_id, $offer_id) {
        if (!self::validate_post_id($profile_id) || !self::validate_post_id($offer_id)) {
            return false;
        }

        $offer_ids = get_post_meta($profile_id, self::RELATIONSHIP_META_KEY, true);
        if (!is_array($offer_ids)) {
            $offer_ids = array();
        }

        if (!in_array($offer_id, $offer_ids)) {
            $offer_ids[] = $offer_id;
            update_post_meta($profile_id, self::RELATIONSHIP_META_KEY, $offer_ids);
            self::debug_log("Linked offer {$offer_id} to profile {$profile_id}");
        }

        return true;
    }

    /**
     * Unlink a single offer from a profile
     *
     * @param int $profile_id Profile post ID
     * @param int $offer_id Offer post ID
     * @return bool Success
     */
    public static function unlink_offer($profile_id, $offer_id) {
        if (!self::validate_post_id($profile_id) || !self::validate_post_id($offer_id)) {
            return false;
        }

        $offer_ids = get_post_meta($profile_id, self::RELATIONSHIP_META_KEY, true);
        if (!is_array($offer_ids)) {
            return true; // Nothing to unlink
        }

        $offer_ids = array_values(array_diff($offer_ids, array($offer_id)));
        update_post_meta($profile_id, self::RELATIONSHIP_META_KEY, $offer_ids);

        self::debug_log("Unlinked offer {$offer_id} from profile {$profile_id}");

        return true;
    }
}

/**
 * Enrich offers props for frontend rendering
 */
add_filter('gmkb_enrich_offers_props', function($props, $post_id) {
    $offers_data = Offers_Data_Integration::load_component_data($post_id);

    if ($offers_data['success']) {
        $props = Offers_Data_Integration::prepare_template_props($offers_data, $props);
    }

    return $props;
}, 10, 2);

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('[Offers_Data_Integration] Self-contained data integration loaded');
}
