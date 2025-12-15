<?php
/**
 * REST API endpoints for Interviews - BRIDGE EDITION
 *
 * This API fetches data from PIT tables:
 * - pit_speaking_credits (links guest to engagement)
 * - pit_engagements (episode/interview data)
 * - pit_podcasts (podcast info)
 *
 * @package GMKB
 * @since 3.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Interviews_API {

    /**
     * API namespace
     */
    const NAMESPACE = 'gmkb/v2';

    /**
     * Initialize the API
     */
    public static function init() {
        add_action('rest_api_init', [__CLASS__, 'register_routes']);
    }

    /**
     * Register REST API routes
     */
    public static function register_routes() {
        // List all interviews for current user
        register_rest_route(self::NAMESPACE, '/interviews', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [__CLASS__, 'list_interviews'],
                'permission_callback' => [__CLASS__, 'check_list_permission'],
                'args' => [
                    'status' => [
                        'default' => 'any',
                        'sanitize_callback' => 'sanitize_text_field',
                    ],
                    'per_page' => [
                        'default' => 20,
                        'sanitize_callback' => 'absint',
                    ],
                    'page' => [
                        'default' => 1,
                        'sanitize_callback' => 'absint',
                    ],
                ],
            ],
        ]);

        // Single interview by ID (speaking_credit ID)
        register_rest_route(self::NAMESPACE, '/interviews/(?P<id>\d+)', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [__CLASS__, 'get_interview'],
                'permission_callback' => [__CLASS__, 'check_list_permission'],
                'args' => [
                    'id' => [
                        'validate_callback' => function($value, $request, $key) {
                            return is_numeric($value);
                        }
                    ],
                ],
            ],
        ]);

        // Profile-Interview relationships
        register_rest_route(self::NAMESPACE, '/profiles/(?P<id>\d+)/interviews', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [__CLASS__, 'get_profile_interviews'],
                'permission_callback' => [__CLASS__, 'check_profile_read_permission'],
            ],
            [
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => [__CLASS__, 'update_profile_interviews'],
                'permission_callback' => [__CLASS__, 'check_profile_edit_permission'],
            ],
        ]);
    }

    // =========================================================================
    // Permission Callbacks
    // =========================================================================

    /**
     * Check if user can list interviews (requires authentication).
     *
     * @param WP_REST_Request $request Request object.
     * @return bool|WP_Error True if authorized, WP_Error otherwise.
     */
    public static function check_list_permission($request) {
        if (!is_user_logged_in()) {
            return new WP_Error('unauthorized', 'Authentication required', ['status' => 401]);
        }
        return true;
    }

    /**
     * Check if user can read profile (for profile-interview endpoints).
     *
     * @param WP_REST_Request $request Request object.
     * @return bool|WP_Error True if authorized, WP_Error otherwise.
     */
    public static function check_profile_read_permission($request) {
        $profile_id = (int) $request->get_param('id');
        return self::check_profile_permission($profile_id, 'read');
    }

    /**
     * Check if user can edit profile.
     *
     * @param WP_REST_Request $request Request object.
     * @return bool|WP_Error True if authorized, WP_Error otherwise.
     */
    public static function check_profile_edit_permission($request) {
        $profile_id = (int) $request->get_param('id');
        return self::check_profile_permission($profile_id, 'edit');
    }

    private static function check_profile_permission($profile_id, $action = 'read') {
        $post = get_post($profile_id);

        if (!$post || $post->post_type !== 'guests') {
            return new WP_Error('not_found', 'Profile not found', ['status' => 404]);
        }

        if (!is_user_logged_in()) {
            return new WP_Error('unauthorized', 'Authentication required', ['status' => 401]);
        }

        $user_id = get_current_user_id();

        // Admins can do anything
        if (current_user_can('edit_others_posts')) {
            return true;
        }

        // Check ownership
        $owner_id = (int) get_post_meta($profile_id, 'owner_user_id', true);
        if ($owner_id === $user_id || (int) $post->post_author === $user_id) {
            return true;
        }

        // Organization access for read
        if ($action === 'read' && self::user_in_same_org($user_id, (int) $post->post_author)) {
            return true;
        }

        return new WP_Error('forbidden', "You do not have permission to {$action} this profile", ['status' => 403]);
    }

    private static function user_in_same_org($user_id_1, $user_id_2) {
        $org_1 = get_user_meta($user_id_1, 'mepr_org', true);
        $org_2 = get_user_meta($user_id_2, 'mepr_org', true);

        if (empty($org_1) || empty($org_2)) {
            return false;
        }

        return $org_1 === $org_2;
    }

    // =========================================================================
    // API Endpoints
    // =========================================================================

    /**
     * List interviews for current user from PIT speaking_credits + engagements.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error Response object.
     */
    public static function list_interviews($request) {
        $guest_id = self::get_target_guest_id();

        if (!$guest_id) {
            return rest_ensure_response([
                'success' => true,
                'interviews' => [],
                'total' => 0,
                'pages' => 0,
                'page' => 1,
            ]);
        }

        global $wpdb;
        $credits_table = $wpdb->prefix . 'pit_speaking_credits';
        $engagements_table = $wpdb->prefix . 'pit_engagements';
        $podcasts_table = $wpdb->prefix . 'pit_podcasts';

        // Check if tables exist
        $table_exists = $wpdb->get_var("SHOW TABLES LIKE '$credits_table'") === $credits_table;
        if (!$table_exists) {
            return rest_ensure_response([
                'success' => true,
                'interviews' => [],
                'total' => 0,
                'pages' => 0,
                'page' => 1,
                'message' => 'PIT speaking_credits table not found',
            ]);
        }

        $per_page = min((int) $request->get_param('per_page'), 100);
        $page = (int) $request->get_param('page');
        $offset = ($page - 1) * $per_page;

        // Count total
        $total = $wpdb->get_var(
            $wpdb->prepare("SELECT COUNT(*) FROM {$credits_table} WHERE guest_id = %d", $guest_id)
        );

        // Fetch speaking credits with engagement and podcast info
        $results = $wpdb->get_results(
            $wpdb->prepare(
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
                 WHERE sc.guest_id = %d
                 ORDER BY e.published_date DESC
                 LIMIT %d OFFSET %d",
                $guest_id,
                $per_page,
                $offset
            )
        );

        $interviews = [];
        foreach ($results as $row) {
            $interviews[] = self::format_interview($row);
        }

        return rest_ensure_response([
            'success' => true,
            'interviews' => $interviews,
            'total' => (int) $total,
            'pages' => ceil($total / $per_page),
            'page' => $page,
        ]);
    }

    /**
     * Get single interview by speaking_credit ID.
     *
     * @param WP_REST_Request $request Request object.
     * @return WP_REST_Response|WP_Error Response object.
     */
    public static function get_interview($request) {
        $interview_id = (int) $request->get_param('id');

        global $wpdb;
        $credits_table = $wpdb->prefix . 'pit_speaking_credits';
        $engagements_table = $wpdb->prefix . 'pit_engagements';
        $podcasts_table = $wpdb->prefix . 'pit_podcasts';

        $interview = $wpdb->get_row(
            $wpdb->prepare(
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
                 WHERE sc.id = %d",
                $interview_id
            )
        );

        if (!$interview) {
            return new WP_Error('not_found', 'Interview not found', ['status' => 404]);
        }

        return rest_ensure_response([
            'success' => true,
            'interview' => self::format_interview($interview),
        ]);
    }

    // =========================================================================
    // Profile-Interview Relationship Endpoints
    // =========================================================================

    /**
     * Get featured interviews linked to a profile.
     * IDs are speaking_credit IDs stored in profile meta.
     */
    public static function get_profile_interviews($request) {
        $profile_id = (int) $request->get_param('id');

        $interview_ids = get_post_meta($profile_id, 'featured_interviews', true);

        if (empty($interview_ids) || !is_array($interview_ids)) {
            return rest_ensure_response([
                'success' => true,
                'interviews' => [],
                'total' => 0,
            ]);
        }

        global $wpdb;
        $credits_table = $wpdb->prefix . 'pit_speaking_credits';
        $engagements_table = $wpdb->prefix . 'pit_engagements';
        $podcasts_table = $wpdb->prefix . 'pit_podcasts';

        $table_exists = $wpdb->get_var("SHOW TABLES LIKE '$credits_table'") === $credits_table;
        if (!$table_exists) {
            return rest_ensure_response([
                'success' => true,
                'interviews' => [],
                'total' => 0,
            ]);
        }

        $interviews = [];
        $sanitized_ids = array_filter(array_map('absint', $interview_ids));

        if (!empty($sanitized_ids)) {
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

            // Reorder results to match original $interview_ids order
            foreach ($sanitized_ids as $id) {
                if (isset($results_by_id[$id])) {
                    $interviews[] = self::format_interview($results_by_id[$id]);
                }
            }
        }

        return rest_ensure_response([
            'success' => true,
            'interviews' => $interviews,
            'total' => count($interviews),
        ]);
    }

    /**
     * Update featured interviews linked to a profile.
     * Stores speaking_credit IDs in profile meta.
     */
    public static function update_profile_interviews($request) {
        $profile_id = (int) $request->get_param('id');
        $body = $request->get_json_params();

        $interview_ids = isset($body['interview_ids']) ? array_map('absint', (array) $body['interview_ids']) : [];

        global $wpdb;
        $credits_table = $wpdb->prefix . 'pit_speaking_credits';

        $valid_ids = [];
        $sanitized_ids = array_filter(array_map('absint', $interview_ids));

        if (!empty($sanitized_ids)) {
            $id_placeholders = implode(',', array_fill(0, count($sanitized_ids), '%d'));
            $query = $wpdb->prepare("SELECT id FROM {$credits_table} WHERE id IN ({$id_placeholders})", $sanitized_ids);
            $valid_ids = array_map('intval', $wpdb->get_col($query));
        }

        update_post_meta($profile_id, 'featured_interviews', $valid_ids);

        return rest_ensure_response([
            'success' => true,
            'interview_ids' => $valid_ids,
            'message' => 'Featured interviews updated',
        ]);
    }

    // =========================================================================
    // Helper Methods
    // =========================================================================

    /**
     * Get the Guest ID associated with the current user.
     *
     * @return int|false Guest ID or false if not found.
     */
    private static function get_target_guest_id() {
        $user_id = get_current_user_id();
        if (!$user_id) {
            return false;
        }

        global $wpdb;
        $table = $wpdb->prefix . 'pit_guests';

        $table_exists = $wpdb->get_var("SHOW TABLES LIKE '$table'") === $table;
        if (!$table_exists) {
            return false;
        }

        return $wpdb->get_var(
            $wpdb->prepare(
                "SELECT id FROM {$table} WHERE claimed_by_user_id = %d OR created_by_user_id = %d LIMIT 1",
                $user_id,
                $user_id
            )
        );
    }

    /**
     * Format database row for Vue frontend.
     *
     * @param object $row Database row with interview data.
     * @return array Formatted interview data for frontend.
     */
    public static function format_interview($row) {
        $podcast_name = $row->podcast_name ?? '';
        $episode_title = $row->episode_title ?? '';
        $podcast_image = $row->podcast_image ?? $row->thumbnail_url ?? null;

        return [
            'id'            => (int) $row->id,
            'title'         => $podcast_name ?: $episode_title,
            'subtitle'      => $episode_title,
            'podcast_name'  => $podcast_name ?: 'Podcast',
            'episode_title' => $episode_title,
            'label'         => ($podcast_name ? $podcast_name . ' - ' : '') . $episode_title,
            'link'          => $row->episode_url ?? '',
            'episode_url'   => $row->episode_url ?? '',
            'date'          => $row->episode_date ?? '',
            'publish_date'  => $row->episode_date ?? '',
            'image'         => $podcast_image,
            'image_url'     => $podcast_image,
            'is_featured'   => !empty($row->is_featured),
            'status'        => 'publish',
        ];
    }
}

// Initialize the Interviews API
GMKB_Interviews_API::init();
