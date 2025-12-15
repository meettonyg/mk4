<?php
/**
 * REST API endpoints for Interviews
 *
 * Provides CRUD endpoints for the gmkb_interview post type.
 * Implements relational interview management for Media Kits.
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
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => [__CLASS__, 'create_interview'],
                'permission_callback' => [__CLASS__, 'check_list_permission'],
            ],
        ]);

        // Single interview CRUD
        register_rest_route(self::NAMESPACE, '/interviews/(?P<id>\d+)', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [__CLASS__, 'get_interview'],
                'permission_callback' => [__CLASS__, 'check_read_permission'],
                'args' => [
                    'id' => [
                        'validate_callback' => function($value, $request, $key) {
                            return is_numeric($value);
                        }
                    ],
                ],
            ],
            [
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => [__CLASS__, 'update_interview'],
                'permission_callback' => [__CLASS__, 'check_edit_permission'],
            ],
            [
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => [__CLASS__, 'delete_interview'],
                'permission_callback' => [__CLASS__, 'check_edit_permission'],
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
     * Check if user can list interviews
     */
    public static function check_list_permission($request) {
        if (!is_user_logged_in()) {
            return new WP_Error('unauthorized', 'Authentication required', ['status' => 401]);
        }
        return true;
    }

    /**
     * Check if user can read the interview
     */
    public static function check_read_permission($request) {
        $post_id = (int) $request->get_param('id');
        $post = get_post($post_id);

        if (!$post || $post->post_type !== 'gmkb_interview') {
            return new WP_Error('not_found', 'Interview not found', ['status' => 404]);
        }

        if (!is_user_logged_in()) {
            return new WP_Error('unauthorized', 'Authentication required', ['status' => 401]);
        }

        $user_id = get_current_user_id();

        // Admins can read any interview
        if (current_user_can('edit_others_posts')) {
            return true;
        }

        // Check ownership (post_author)
        if ((int) $post->post_author === $user_id) {
            return true;
        }

        // Check organization access (if applicable)
        if (self::user_in_same_org($user_id, (int) $post->post_author)) {
            return true;
        }

        return new WP_Error('forbidden', 'You do not have permission to view this interview', ['status' => 403]);
    }

    /**
     * Check if user can edit the interview
     */
    public static function check_edit_permission($request) {
        $post_id = (int) $request->get_param('id');
        $post = get_post($post_id);

        if (!$post || $post->post_type !== 'gmkb_interview') {
            return new WP_Error('not_found', 'Interview not found', ['status' => 404]);
        }

        if (!is_user_logged_in()) {
            return new WP_Error('unauthorized', 'Authentication required', ['status' => 401]);
        }

        $user_id = get_current_user_id();

        // Admins can edit any interview
        if (current_user_can('edit_others_posts')) {
            return true;
        }

        // Check ownership (post_author)
        if ((int) $post->post_author === $user_id) {
            return true;
        }

        return new WP_Error('forbidden', 'You do not have permission to edit this interview', ['status' => 403]);
    }

    /**
     * Check if user can read profile (for profile-interview endpoints)
     */
    public static function check_profile_read_permission($request) {
        $profile_id = (int) $request->get_param('id');
        return self::check_profile_permission($profile_id, 'read');
    }

    /**
     * Check if user can edit profile
     */
    public static function check_profile_edit_permission($request) {
        $profile_id = (int) $request->get_param('id');
        return self::check_profile_permission($profile_id, 'edit');
    }

    /**
     * Shared profile permission check
     */
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

    /**
     * Check if two users are in the same organization
     */
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
     * List interviews for current user
     */
    public static function list_interviews($request) {
        $user_id = get_current_user_id();
        $status = $request->get_param('status');
        $per_page = $request->get_param('per_page');
        $page = $request->get_param('page');

        $args = [
            'post_type' => 'gmkb_interview',
            'posts_per_page' => min($per_page, 100),
            'paged' => $page,
            'orderby' => 'modified',
            'order' => 'DESC',
        ];

        // Filter by author unless admin
        if (!current_user_can('edit_others_posts')) {
            $args['author'] = $user_id;
        }

        // Filter by status
        if ($status && $status !== 'any') {
            $args['post_status'] = $status;
        } else {
            $args['post_status'] = ['publish', 'draft', 'private'];
        }

        $query = new WP_Query($args);
        $interviews = [];

        foreach ($query->posts as $post) {
            $interviews[] = self::format_interview($post, 'list');
        }

        return rest_ensure_response([
            'success' => true,
            'interviews' => $interviews,
            'total' => (int) $query->found_posts,
            'pages' => (int) $query->max_num_pages,
            'page' => $page,
        ]);
    }

    /**
     * Get single interview (full detail)
     */
    public static function get_interview($request) {
        $post_id = (int) $request->get_param('id');
        $post = get_post($post_id);

        if (!$post) {
            return new WP_Error('not_found', 'Interview not found', ['status' => 404]);
        }

        return rest_ensure_response([
            'success' => true,
            'interview' => self::format_interview($post, 'detail'),
        ]);
    }

    /**
     * Create new interview
     */
    public static function create_interview($request) {
        $body = $request->get_json_params();
        $user_id = get_current_user_id();

        // Create post
        $post_data = [
            'post_type' => 'gmkb_interview',
            'post_status' => $body['status'] ?? 'publish',
            'post_title' => sanitize_text_field($body['title'] ?? 'New Interview'),
            'post_content' => wp_kses_post($body['description'] ?? ''),
            'post_author' => $user_id,
        ];

        $post_id = wp_insert_post($post_data, true);

        if (is_wp_error($post_id)) {
            return $post_id;
        }

        // Save meta fields
        self::save_interview_meta($post_id, $body);

        $post = get_post($post_id);

        return rest_ensure_response([
            'success' => true,
            'interview' => self::format_interview($post, 'detail'),
            'message' => 'Interview created successfully',
        ]);
    }

    /**
     * Update interview
     */
    public static function update_interview($request) {
        $post_id = (int) $request->get_param('id');
        $body = $request->get_json_params();

        // Update post
        $post_data = ['ID' => $post_id];

        if (isset($body['title'])) {
            $post_data['post_title'] = sanitize_text_field($body['title']);
        }
        if (isset($body['description'])) {
            $post_data['post_content'] = wp_kses_post($body['description']);
        }
        if (isset($body['status'])) {
            $post_data['post_status'] = sanitize_text_field($body['status']);
        }

        if (count($post_data) > 1) {
            $result = wp_update_post($post_data, true);
            if (is_wp_error($result)) {
                return $result;
            }
        }

        // Update meta fields
        self::save_interview_meta($post_id, $body);

        $post = get_post($post_id);

        return rest_ensure_response([
            'success' => true,
            'interview' => self::format_interview($post, 'detail'),
            'message' => 'Interview updated successfully',
        ]);
    }

    /**
     * Delete interview (move to trash)
     */
    public static function delete_interview($request) {
        $post_id = (int) $request->get_param('id');

        $result = wp_trash_post($post_id);

        if (!$result) {
            return new WP_Error('delete_failed', 'Failed to delete interview', ['status' => 500]);
        }

        return rest_ensure_response([
            'success' => true,
            'message' => 'Interview moved to trash',
        ]);
    }

    // =========================================================================
    // Profile-Interview Relationship Endpoints
    // =========================================================================

    /**
     * Get featured interviews linked to a profile
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

        $interviews = [];
        foreach ($interview_ids as $interview_id) {
            $post = get_post($interview_id);
            if ($post && $post->post_type === 'gmkb_interview') {
                $interviews[] = self::format_interview($post, 'list');
            }
        }

        return rest_ensure_response([
            'success' => true,
            'interviews' => $interviews,
            'total' => count($interviews),
        ]);
    }

    /**
     * Update featured interviews linked to a profile (replace)
     */
    public static function update_profile_interviews($request) {
        $profile_id = (int) $request->get_param('id');
        $body = $request->get_json_params();

        $interview_ids = isset($body['interview_ids']) ? array_map('absint', (array) $body['interview_ids']) : [];

        // Validate all interview IDs exist
        $valid_ids = [];
        foreach ($interview_ids as $interview_id) {
            $post = get_post($interview_id);
            if ($post && $post->post_type === 'gmkb_interview') {
                $valid_ids[] = $interview_id;
            }
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
     * Save interview meta fields
     */
    private static function save_interview_meta($post_id, $data) {
        $meta_fields = [
            'interview_podcast_name' => 'sanitize_text_field',
            'interview_episode_url' => 'esc_url_raw',
            'interview_publish_date' => 'sanitize_text_field',
            'interview_image_id' => 'absint',
            'interview_host_name' => 'sanitize_text_field',
            'interview_duration' => 'sanitize_text_field',
            'interview_topics' => 'sanitize_text_field',
        ];

        foreach ($meta_fields as $field => $sanitize) {
            // Check for field without prefix in input
            $input_key = str_replace('interview_', '', $field);

            if (isset($data[$field])) {
                $value = call_user_func($sanitize, $data[$field]);
                update_post_meta($post_id, $field, $value);
            } elseif (isset($data[$input_key])) {
                $value = call_user_func($sanitize, $data[$input_key]);
                update_post_meta($post_id, $field, $value);
            }
        }
    }

    /**
     * Format interview for API response
     *
     * @param WP_Post $post The interview post
     * @param string $context 'list' or 'detail'
     * @return array Formatted interview data
     */
    private static function format_interview($post, $context = 'list') {
        $podcast_name = get_post_meta($post->ID, 'interview_podcast_name', true);
        $episode_title = $post->post_title;
        $episode_url = get_post_meta($post->ID, 'interview_episode_url', true);

        $interview = [
            'id'            => $post->ID,
            'title'         => $episode_title,
            'subtitle'      => $podcast_name,
            'podcast_name'  => $podcast_name ?: 'Podcast',
            'episode_title' => $episode_title,
            'link'          => $episode_url,
            'episode_url'   => $episode_url,
            'publish_date'  => get_post_meta($post->ID, 'interview_publish_date', true),
            'status'        => $post->post_status,
            'label'         => ($podcast_name ? $podcast_name . ' - ' : '') . $episode_title,
            'created'       => $post->post_date,
            'modified'      => $post->post_modified,
        ];

        // Add image (expanded object)
        $image_id = get_post_meta($post->ID, 'interview_image_id', true);
        if ($image_id) {
            $interview['image'] = self::format_image($image_id);
            $interview['image_url'] = wp_get_attachment_url($image_id);
        } elseif (has_post_thumbnail($post->ID)) {
            $thumb_id = get_post_thumbnail_id($post->ID);
            $interview['image'] = self::format_image($thumb_id);
            $interview['image_url'] = wp_get_attachment_url($thumb_id);
        } else {
            $interview['image'] = null;
            $interview['image_url'] = null;
        }

        // Add detail fields for full view
        if ($context === 'detail') {
            $interview['description'] = $post->post_content;
            $interview['host_name'] = get_post_meta($post->ID, 'interview_host_name', true);
            $interview['duration'] = get_post_meta($post->ID, 'interview_duration', true);
            $interview['topics'] = get_post_meta($post->ID, 'interview_topics', true);
            $interview['author'] = (int) $post->post_author;
        }

        return $interview;
    }

    /**
     * Format image for API response (portable format)
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

        $image = [
            'id' => $attachment_id,
            'url' => wp_get_attachment_url($attachment_id),
            'alt' => get_post_meta($attachment_id, '_wp_attachment_image_alt', true),
            'title' => $attachment->post_title,
        ];

        // Add sizes
        $sizes = ['thumbnail', 'medium', 'large', 'full'];
        $image['sizes'] = [];

        foreach ($sizes as $size) {
            $src = wp_get_attachment_image_src($attachment_id, $size);
            if ($src) {
                $image['sizes'][$size] = [
                    'url' => $src[0],
                    'width' => $src[1],
                    'height' => $src[2],
                ];
            }
        }

        return $image;
    }
}

// Initialize the Interviews API
GMKB_Interviews_API::init();
