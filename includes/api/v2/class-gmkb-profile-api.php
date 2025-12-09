<?php
/**
 * REST API endpoints for Guest Profile data
 *
 * Provides endpoints to read and write profile fields directly to post meta.
 * Uses GMKB_Profile_Schema for field definitions and validation.
 * Uses GMKB_Profile_Repository for data access (enabling future backend swaps).
 *
 * @package GMKB
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Profile_API {

    /**
     * API namespace
     */
    const NAMESPACE = 'gmkb/v2';

    /**
     * Repository instance
     *
     * @var GMKB_Profile_Repository
     */
    private static $repository = null;

    /**
     * Get repository instance
     *
     * @return GMKB_Profile_Repository
     */
    private static function get_repository(): GMKB_Profile_Repository {
        if (self::$repository === null) {
            self::$repository = new GMKB_Profile_Repository();
        }
        return self::$repository;
    }

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
        // Get full profile
        register_rest_route(self::NAMESPACE, '/profile/(?P<id>\d+)', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [__CLASS__, 'get_profile'],
                'permission_callback' => [__CLASS__, 'check_read_permission'],
                'args' => [
                    'id' => [
                        'validate_callback' => function($param) {
                            return is_numeric($param);
                        }
                    ],
                ],
            ],
            [
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => [__CLASS__, 'update_profile'],
                'permission_callback' => [__CLASS__, 'check_edit_permission'],
                'args' => [
                    'id' => [
                        'validate_callback' => function($param) {
                            return is_numeric($param);
                        }
                    ],
                ],
            ],
        ]);

        // Update single field
        register_rest_route(self::NAMESPACE, '/profile/(?P<id>\d+)/field/(?P<field>[a-z0-9_]+)', [
            'methods' => WP_REST_Server::EDITABLE,
            'callback' => [__CLASS__, 'update_field'],
            'permission_callback' => [__CLASS__, 'check_edit_permission'],
            'args' => [
                'id' => [
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                ],
                'field' => [
                    'validate_callback' => function($param) {
                        return preg_match('/^[a-z0-9_]+$/', $param);
                    }
                ],
            ],
        ]);

        // Update multiple fields (batch)
        register_rest_route(self::NAMESPACE, '/profile/(?P<id>\d+)/fields', [
            'methods' => WP_REST_Server::EDITABLE,
            'callback' => [__CLASS__, 'update_fields'],
            'permission_callback' => [__CLASS__, 'check_edit_permission'],
        ]);

        // Get profile schema (field definitions)
        register_rest_route(self::NAMESPACE, '/profile/schema', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'get_schema'],
            'permission_callback' => '__return_true',
        ]);

        // Get JSON Schema (for frontend validation / migration)
        register_rest_route(self::NAMESPACE, '/profile/json-schema', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'get_json_schema'],
            'permission_callback' => '__return_true',
        ]);

        // List all profiles for current user
        register_rest_route(self::NAMESPACE, '/profiles', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'list_profiles'],
            'permission_callback' => [__CLASS__, 'check_list_permission'],
        ]);

        // Create new profile
        register_rest_route(self::NAMESPACE, '/profiles', [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [__CLASS__, 'create_profile'],
            'permission_callback' => [__CLASS__, 'check_list_permission'],
        ]);

        // Delete profile
        register_rest_route(self::NAMESPACE, '/profile/(?P<id>\d+)', [
            'methods' => WP_REST_Server::DELETABLE,
            'callback' => [__CLASS__, 'delete_profile'],
            'permission_callback' => [__CLASS__, 'check_edit_permission'],
        ]);

        // Export profile (portable JSON)
        register_rest_route(self::NAMESPACE, '/profile/(?P<id>\d+)/export', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'export_profile'],
            'permission_callback' => [__CLASS__, 'check_read_permission'],
        ]);
    }

    // =========================================================================
    // Permission Callbacks
    // =========================================================================

    /**
     * Check if user can read the profile
     */
    public static function check_read_permission($request) {
        $post_id = (int) $request->get_param('id');
        $post = get_post($post_id);

        if (!$post || $post->post_type !== 'guests') {
            return new WP_Error('not_found', 'Profile not found', ['status' => 404]);
        }

        if (!is_user_logged_in()) {
            return new WP_Error('unauthorized', 'Authentication required', ['status' => 401]);
        }

        $user_id = get_current_user_id();

        // Admins can read any profile
        if (current_user_can('edit_others_posts')) {
            return true;
        }

        // Check ownership via repository
        $repo = self::get_repository();
        if ($repo->is_owner($post_id, $user_id)) {
            return true;
        }

        return new WP_Error('forbidden', 'You do not have permission to view this profile', ['status' => 403]);
    }

    /**
     * Check if user can edit the profile
     */
    public static function check_edit_permission($request) {
        $post_id = (int) $request->get_param('id');
        $post = get_post($post_id);

        if (!$post || $post->post_type !== 'guests') {
            return new WP_Error('not_found', 'Profile not found', ['status' => 404]);
        }

        if (!is_user_logged_in()) {
            return new WP_Error('unauthorized', 'Authentication required', ['status' => 401]);
        }

        $user_id = get_current_user_id();

        // Admins can edit any profile
        if (current_user_can('edit_others_posts')) {
            return true;
        }

        // Check ownership via repository
        $repo = self::get_repository();
        if ($repo->is_owner($post_id, $user_id)) {
            return true;
        }

        return new WP_Error('forbidden', 'You do not have permission to edit this profile', ['status' => 403]);
    }

    /**
     * Check if user can list profiles
     */
    public static function check_list_permission($request) {
        if (!is_user_logged_in()) {
            return new WP_Error('unauthorized', 'Authentication required', ['status' => 401]);
        }
        return true;
    }

    // =========================================================================
    // API Endpoints
    // =========================================================================

    /**
     * Get full profile data
     */
    public static function get_profile($request) {
        $post_id = (int) $request->get_param('id');

        $repo = self::get_repository();
        $profile_data = $repo->get($post_id);

        if ($profile_data === null) {
            return new WP_Error('not_found', 'Profile not found', ['status' => 404]);
        }

        return rest_ensure_response([
            'success' => true,
            'data' => $profile_data,
        ]);
    }

    /**
     * Update full profile data
     */
    public static function update_profile($request) {
        $post_id = (int) $request->get_param('id');
        $fields = $request->get_json_params();

        if (empty($fields)) {
            return new WP_Error('invalid_data', 'No fields provided', ['status' => 400]);
        }

        $repo = self::get_repository();
        $result = $repo->update($post_id, $fields);

        return rest_ensure_response($result);
    }

    /**
     * Update a single field
     */
    public static function update_field($request) {
        $post_id = (int) $request->get_param('id');
        $field = $request->get_param('field');
        $body = $request->get_json_params();

        if (!isset($body['value'])) {
            return new WP_Error('invalid_data', 'Value is required', ['status' => 400]);
        }

        $value = $body['value'];

        $repo = self::get_repository();
        $result = $repo->update_field($post_id, $field, $value);

        if (is_wp_error($result)) {
            return $result;
        }

        return rest_ensure_response([
            'success' => true,
            'field' => $field,
            'value' => $value,
        ]);
    }

    /**
     * Update multiple fields (batch)
     */
    public static function update_fields($request) {
        $post_id = (int) $request->get_param('id');
        $fields = $request->get_json_params();

        if (empty($fields) || !is_array($fields)) {
            return new WP_Error('invalid_data', 'Fields object is required', ['status' => 400]);
        }

        $repo = self::get_repository();
        $result = $repo->update($post_id, $fields);

        return rest_ensure_response($result);
    }

    /**
     * Get profile field schema (grouped format for frontend)
     */
    public static function get_schema($request) {
        $schema = GMKB_Profile_Schema::to_frontend_schema();

        return rest_ensure_response([
            'success' => true,
            'schema' => $schema,
        ]);
    }

    /**
     * Get JSON Schema (standard format for validation/migration)
     */
    public static function get_json_schema($request) {
        $schema = GMKB_Profile_Schema::to_json_schema();

        return rest_ensure_response($schema);
    }

    /**
     * List all profiles for current user
     */
    public static function list_profiles($request) {
        $user_id = get_current_user_id();

        $repo = self::get_repository();
        $profiles = $repo->list_for_user($user_id);

        return rest_ensure_response([
            'success' => true,
            'profiles' => $profiles,
            'total' => count($profiles),
        ]);
    }

    /**
     * Create a new profile
     */
    public static function create_profile($request) {
        $body = $request->get_json_params();

        $repo = self::get_repository();
        $post_id = $repo->create($body);

        if (is_wp_error($post_id)) {
            return $post_id;
        }

        $post = get_post($post_id);

        return rest_ensure_response([
            'success' => true,
            'profile' => [
                'id' => $post_id,
                'title' => $post->post_title,
                'slug' => $post->post_name,
                'status' => $post->post_status,
                'editUrl' => "/app/profiles/guest/profile/?entry={$post->post_name}",
                'viewUrl' => get_permalink($post_id),
            ],
            'message' => 'Profile created successfully',
        ]);
    }

    /**
     * Delete a profile
     */
    public static function delete_profile($request) {
        $post_id = (int) $request->get_param('id');

        $repo = self::get_repository();
        $result = $repo->delete($post_id);

        if (!$result) {
            return new WP_Error('delete_failed', 'Failed to delete profile', ['status' => 500]);
        }

        return rest_ensure_response([
            'success' => true,
            'message' => 'Profile moved to trash',
        ]);
    }

    /**
     * Export profile as portable JSON
     */
    public static function export_profile($request) {
        $post_id = (int) $request->get_param('id');

        $repo = self::get_repository();
        $export = $repo->export($post_id);

        if ($export === null) {
            return new WP_Error('not_found', 'Profile not found', ['status' => 404]);
        }

        return rest_ensure_response([
            'success' => true,
            'data' => $export,
        ]);
    }
}

// Initialize the API
GMKB_Profile_API::init();
