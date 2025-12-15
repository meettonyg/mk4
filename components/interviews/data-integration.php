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
     * Queries PIT tables (pit_speaking_credits, pit_engagements, pit_podcasts)
     * using speaking_credit IDs stored in featured_interviews meta.
     *
     * @param int $post_id Profile post ID
     * @return array Interviews data with metadata
     */
    public static function load_component_data($post_id) {
        $result = array(
            'interviews' => array(),
            'count' => 0,
            'source' => 'pit_tables',
            'component_type' => self::$component_type,
            'success' => false,
            'message' => '',
            'timestamp' => current_time('mysql')
        );

        if (!self::validate_post_id($post_id)) {
            $result['message'] = 'Invalid post ID';
            return $result;
        }

        // Load featured interview IDs (speaking_credit IDs) from profile meta
        $interview_ids = get_post_meta($post_id, self::RELATIONSHIP_META_KEY, true);

        if (empty($interview_ids) || !is_array($interview_ids)) {
            $result['message'] = "No interviews linked to profile {$post_id}";
            self::debug_log($result['message']);
            return $result;
        }

        global $wpdb;
        $credits_table = $wpdb->prefix . 'pit_speaking_credits';
        $engagements_table = $wpdb->prefix . 'pit_engagements';
        $podcasts_table = $wpdb->prefix . 'pit_podcasts';

        // Check if PIT tables exist
        $table_exists = $wpdb->get_var("SHOW TABLES LIKE '$credits_table'") === $credits_table;
        if (!$table_exists) {
            $result['message'] = 'PIT tables not found';
            self::debug_log($result['message']);
            return $result;
        }

        $sanitized_ids = array_filter(array_map('absint', $interview_ids));

        if (empty($sanitized_ids)) {
            $result['message'] = "No valid interview IDs for profile {$post_id}";
            self::debug_log($result['message']);
            return $result;
        }

        // Query PIT tables for interview data
        $id_placeholders = implode(',', array_fill(0, count($sanitized_ids), '%d'));
        $query = $wpdb->prepare(
            "SELECT
                sc.id,
                sc.is_featured,
                e.title AS episode_title,
                e.url AS episode_url,
                e.published_date AS episode_date,
                e.thumbnail_url,
                p.title AS podcast_name,
                p.artwork_url AS podcast_image
             FROM {$credits_table} sc
             JOIN {$engagements_table} e ON sc.engagement_id = e.id
             LEFT JOIN {$podcasts_table} p ON e.podcast_id = p.id
             WHERE sc.id IN ($id_placeholders)",
            $sanitized_ids
        );
        $results_by_id = $wpdb->get_results($query, OBJECT_K);

        // Reorder results to match original interview_ids order
        foreach ($sanitized_ids as $id) {
            if (isset($results_by_id[$id])) {
                $result['interviews'][] = self::format_pit_interview($results_by_id[$id]);
                $result['count']++;
            }
        }

        $result['success'] = $result['count'] > 0;
        $result['message'] = $result['success']
            ? "Loaded {$result['count']} interviews for profile {$post_id}"
            : "No valid interviews found for profile {$post_id}";

        self::debug_log($result['message']);

        return $result;
    }

    /**
     * Format interview data from PIT tables for component display
     *
     * @param object $row Database row from PIT tables query
     * @return array Formatted interview data
     */
    private static function format_pit_interview($row) {
        $podcast_name = $row->podcast_name ?? '';
        $episode_title = $row->episode_title ?? '';
        $podcast_image = $row->podcast_image ?? $row->thumbnail_url ?? null;

        return array(
            'id'            => (int) $row->id,
            'title'         => $podcast_name ?: $episode_title,
            'subtitle'      => $episode_title,
            'podcast_name'  => $podcast_name ?: 'Podcast',
            'episode_title' => $episode_title,
            'episode_url'   => $row->episode_url ?? '',
            'publish_date'  => $row->episode_date ?? '',
            'image'         => $podcast_image,
            'image_url'     => $podcast_image,
            'is_featured'   => !empty($row->is_featured),
            'status'        => 'publish',
            // For backwards compatibility with templates expecting these fields
            'host_name'     => '',
            'topics'        => array(),
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
     * Validates speaking_credit IDs against PIT tables before saving.
     *
     * @param int $post_id Profile post ID
     * @param array $data Data array containing interview IDs (speaking_credit IDs)
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

        // Sanitize IDs
        $sanitized_ids = array_filter(array_map('absint', $interview_ids));

        // Validate IDs against PIT speaking_credits table
        $valid_ids = array();
        if (!empty($sanitized_ids)) {
            global $wpdb;
            $credits_table = $wpdb->prefix . 'pit_speaking_credits';

            $table_exists = $wpdb->get_var("SHOW TABLES LIKE '$credits_table'") === $credits_table;
            if ($table_exists) {
                $id_placeholders = implode(',', array_fill(0, count($sanitized_ids), '%d'));
                $query = $wpdb->prepare("SELECT id FROM {$credits_table} WHERE id IN ({$id_placeholders})", $sanitized_ids);
                $valid_ids = array_map('intval', $wpdb->get_col($query));
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
     * @param int $interview_id Speaking credit ID from PIT tables
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
     * @param int $interview_id Speaking credit ID from PIT tables
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
