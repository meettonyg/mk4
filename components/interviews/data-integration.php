<?php
/**
 * Interviews Component - Data Integration
 *
 * Self-contained component architecture for Interviews
 * Handles loading interview data for profiles using native WordPress
 *
 * @package Guestify/Components/Interviews
 * @version 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class Interviews_Data_Integration {

    /**
     * Component identifier
     */
    protected static $component_type = 'interviews';

    /**
     * Meta key for profile-interview relationship
     */
    const RELATIONSHIP_META_KEY = 'featured_interviews';

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
            error_log('[Interviews_Data_Integration] ' . $message);
        }
    }

    /**
     * Load interviews data for a profile
     *
     * @param int $post_id Profile post ID
     * @return array Interviews data with metadata
     */
    public static function load_component_data($post_id) {
        $result = array(
            'interviews' => array(),
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

        // Load featured interview IDs from profile meta
        $interview_ids = get_post_meta($post_id, self::RELATIONSHIP_META_KEY, true);

        if (empty($interview_ids) || !is_array($interview_ids)) {
            $result['message'] = "No interviews linked to profile {$post_id}";
            self::debug_log($result['message']);
            return $result;
        }

        // Load each interview's data
        foreach ($interview_ids as $interview_id) {
            $interview_id = absint($interview_id);
            if (!$interview_id) continue;

            $interview_post = get_post($interview_id);

            // Skip if interview doesn't exist or is wrong post type
            if (!$interview_post || $interview_post->post_type !== 'gmkb_interview') {
                self::debug_log("Skipping invalid interview ID: {$interview_id}");
                continue;
            }

            // Skip non-published interviews (unless in preview/edit context)
            if (!in_array($interview_post->post_status, array('publish', 'draft', 'private'))) {
                continue;
            }

            $interview_data = self::format_interview($interview_post);
            $result['interviews'][] = $interview_data;
            $result['count']++;
        }

        $result['success'] = $result['count'] > 0;
        $result['message'] = $result['success']
            ? "Loaded {$result['count']} interviews for profile {$post_id}"
            : "No valid interviews found for profile {$post_id}";

        self::debug_log($result['message']);

        return $result;
    }

    /**
     * Format single interview for component display
     *
     * @param WP_Post $post Interview post object
     * @return array Formatted interview data
     */
    private static function format_interview($post) {
        $topics = get_post_meta($post->ID, 'topics', true);
        if (is_string($topics)) {
            $topics = array_filter(array_map('trim', explode(',', $topics)));
        }

        return array(
            'id' => $post->ID,
            'title' => $post->post_title,
            'status' => $post->post_status,
            'podcast_name' => get_post_meta($post->ID, 'podcast_name', true),
            'episode_url' => get_post_meta($post->ID, 'episode_url', true),
            'publish_date' => get_post_meta($post->ID, 'publish_date', true),
            'host_name' => get_post_meta($post->ID, 'host_name', true),
            'duration' => get_post_meta($post->ID, 'duration', true),
            'topics' => $topics ?: array(),
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

        $props['interviews'] = $component_data['interviews'] ?? array();
        $props['interviews_count'] = count($props['interviews']);
        $props['has_interviews'] = !empty($props['interviews']);

        return $props;
    }

    /**
     * Save profile-interview associations
     *
     * @param int $post_id Profile post ID
     * @param array $data Data array containing interview IDs
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

        // Extract interview IDs from the data array
        $interview_ids = is_array($data) ? ($data['interviews'] ?? $data['interview_ids'] ?? $data) : array();

        if (!is_array($interview_ids)) {
            $interview_ids = array();
        }

        // Validate and sanitize interview IDs
        $valid_ids = array();
        foreach ($interview_ids as $interview_id) {
            $interview_id = absint($interview_id);
            if ($interview_id) {
                $post = get_post($interview_id);
                if ($post && $post->post_type === 'gmkb_interview') {
                    $valid_ids[] = $interview_id;
                }
            }
        }

        // Save to meta
        update_post_meta($post_id, self::RELATIONSHIP_META_KEY, $valid_ids);

        $result['success'] = true;
        $result['count'] = count($valid_ids);
        $result['message'] = "Saved {$result['count']} interview associations";

        self::debug_log($result['message']);

        return $result;
    }

    /**
     * Check if profile has any featured interviews
     *
     * @param int $post_id Profile post ID
     * @return bool
     */
    public static function has_component_data($post_id) {
        if (!self::validate_post_id($post_id)) {
            return false;
        }

        $interview_ids = get_post_meta($post_id, self::RELATIONSHIP_META_KEY, true);
        return !empty($interview_ids) && is_array($interview_ids);
    }

    /**
     * Link a single interview to a profile
     *
     * @param int $profile_id Profile post ID
     * @param int $interview_id Interview post ID
     * @return bool Success
     */
    public static function link_interview($profile_id, $interview_id) {
        if (!self::validate_post_id($profile_id) || !self::validate_post_id($interview_id)) {
            return false;
        }

        $interview_ids = get_post_meta($profile_id, self::RELATIONSHIP_META_KEY, true);
        if (!is_array($interview_ids)) {
            $interview_ids = array();
        }

        if (!in_array($interview_id, $interview_ids)) {
            $interview_ids[] = $interview_id;
            update_post_meta($profile_id, self::RELATIONSHIP_META_KEY, $interview_ids);
            self::debug_log("Linked interview {$interview_id} to profile {$profile_id}");
        }

        return true;
    }

    /**
     * Unlink a single interview from a profile
     *
     * @param int $profile_id Profile post ID
     * @param int $interview_id Interview post ID
     * @return bool Success
     */
    public static function unlink_interview($profile_id, $interview_id) {
        if (!self::validate_post_id($profile_id) || !self::validate_post_id($interview_id)) {
            return false;
        }

        $interview_ids = get_post_meta($profile_id, self::RELATIONSHIP_META_KEY, true);
        if (!is_array($interview_ids)) {
            return true; // Nothing to unlink
        }

        $interview_ids = array_values(array_diff($interview_ids, array($interview_id)));
        update_post_meta($profile_id, self::RELATIONSHIP_META_KEY, $interview_ids);

        self::debug_log("Unlinked interview {$interview_id} from profile {$profile_id}");

        return true;
    }
}

/**
 * Enrich interviews props for frontend rendering
 */
add_filter('gmkb_enrich_interviews_props', function($props, $post_id) {
    $interviews_data = Interviews_Data_Integration::load_component_data($post_id);

    if ($interviews_data['success']) {
        $props = Interviews_Data_Integration::prepare_template_props($interviews_data, $props);
    }

    return $props;
}, 10, 2);

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('[Interviews_Data_Integration] Self-contained data integration loaded');
}
