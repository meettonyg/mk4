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
     * SEO-related fields for settings endpoints
     */
    private const SEO_FIELDS = [
        'seo_schema_enabled',
        'seo_schema_types',
        'seo_custom_title',
        'seo_custom_description',
        'seo_enabled_features',
        'alumni_of',
        'awards',
        'member_of',
        'certifications',
    ];

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

        // Quick setup (minimal fields for onboarding quick win)
        register_rest_route(self::NAMESPACE, '/profiles/quick-setup', [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [__CLASS__, 'quick_setup_profile'],
            'permission_callback' => [__CLASS__, 'check_list_permission'],
        ]);

        // Export profile (portable JSON)
        register_rest_route(self::NAMESPACE, '/profile/(?P<id>\d+)/export', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'export_profile'],
            'permission_callback' => [__CLASS__, 'check_read_permission'],
        ]);

        // Get AEO Score (Answer Engine Optimization)
        register_rest_route(self::NAMESPACE, '/profile/(?P<id>\d+)/aeo-score', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'get_aeo_score'],
            'permission_callback' => [__CLASS__, 'check_read_permission'],
            'args' => [
                'id' => [
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                ],
            ],
        ]);

        // Get/Update SEO Settings
        register_rest_route(self::NAMESPACE, '/profile/(?P<id>\d+)/seo-settings', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [__CLASS__, 'get_seo_settings'],
                'permission_callback' => [__CLASS__, 'check_read_permission'],
            ],
            [
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => [__CLASS__, 'update_seo_settings'],
                'permission_callback' => [__CLASS__, 'check_edit_permission'],
            ],
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

        // Fire action for onboarding progress tracking
        $user_id = get_post_field('post_author', $post_id);
        if ($user_id) {
            do_action('gmkb_profile_updated', $post_id, (int) $user_id);
        }

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

        // Fire action for onboarding progress tracking
        do_action('gmkb_profile_field_updated', $post_id, $field, $value);

        // Handle slug field response (includes actual slug set and adjustment info)
        if ($field === 'slug' && is_array($result)) {
            return rest_ensure_response([
                'success' => true,
                'field' => $field,
                'value' => $result['slug'],
                'slug' => $result['slug'],
                'adjusted' => $result['adjusted'] ?? false,
                'original' => $result['original'] ?? $value,
                'url' => $repo->get_public_url($post_id),
            ]);
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

        // Fire action for onboarding progress tracking
        $user_id = get_post_field('post_author', $post_id);
        if ($user_id) {
            do_action('gmkb_profile_updated', $post_id, (int) $user_id);
        }

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

        // Get limit status for current user
        $limit_status = null;
        if (class_exists('GMKB_Profile_Limits')) {
            $limit_status = GMKB_Profile_Limits::get_limit_status($user_id);

            // Apply display limit if configured
            $display_limit = $limit_status['display_limit'] ?? -1;
            if ($display_limit !== -1 && count($profiles) > $display_limit) {
                // Sort by modified date descending before limiting
                usort($profiles, function($a, $b) {
                    return strtotime($b['modified'] ?? 0) - strtotime($a['modified'] ?? 0);
                });
                $profiles = array_slice($profiles, 0, $display_limit);
            }
        }

        return rest_ensure_response([
            'success' => true,
            'profiles' => $profiles,
            'total' => count($profiles),
            'limit_status' => $limit_status,
        ]);
    }

    /**
     * Create a new profile
     */
    public static function create_profile($request) {
        $user_id = get_current_user_id();

        // Check profile limits before creation
        if (class_exists('GMKB_Profile_Limits')) {
            if (!GMKB_Profile_Limits::can_create_profile($user_id)) {
                $limit_status = GMKB_Profile_Limits::get_limit_status($user_id);

                return new WP_Error(
                    'profile_limit_reached',
                    sprintf(
                        'You have reached your profile limit of %d. Please upgrade your membership to create more profiles.',
                        $limit_status['profile_limit']
                    ),
                    [
                        'status' => 403,
                        'limit_status' => $limit_status,
                    ]
                );
            }
        }

        $body = $request->get_json_params();

        $repo = self::get_repository();
        $post_id = $repo->create($body);

        if (is_wp_error($post_id)) {
            return $post_id;
        }

        $post = get_post($post_id);

        // Get updated limit status after creation
        $limit_status = null;
        if (class_exists('GMKB_Profile_Limits')) {
            $limit_status = GMKB_Profile_Limits::get_limit_status($user_id);
        }

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
            'limit_status' => $limit_status,
            'message' => 'Profile created successfully',
        ]);
    }

    /**
     * Quick setup - create or update profile with minimal fields
     *
     * This endpoint provides a low-friction way to complete the "Set up your guest profile"
     * onboarding task. It accepts just name, title, and optional website.
     *
     * If user already has a profile, it updates the existing one.
     * If not, it creates a new profile.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public static function quick_setup_profile($request) {
        $user_id = get_current_user_id();
        $body = $request->get_json_params();

        // Validate required fields
        if (empty($body['name'])) {
            return new WP_Error('missing_name', 'Name is required', ['status' => 400]);
        }

        if (empty($body['title'])) {
            return new WP_Error('missing_title', 'Professional title is required', ['status' => 400]);
        }

        $repo = self::get_repository();

        // Check if user already has a profile
        $existing_profiles = $repo->list_for_user($user_id);
        $profile_id = null;

        if (!empty($existing_profiles)) {
            // Update the first/primary profile
            $profile_id = $existing_profiles[0]['id'];
        } else {
            // Check profile limits before creation
            if (class_exists('GMKB_Profile_Limits')) {
                if (!GMKB_Profile_Limits::can_create_profile($user_id)) {
                    $limit_status = GMKB_Profile_Limits::get_limit_status($user_id);

                    return new WP_Error(
                        'profile_limit_reached',
                        'You have reached your profile limit.',
                        [
                            'status' => 403,
                            'limit_status' => $limit_status,
                        ]
                    );
                }
            }

            // Create new profile with the name as title
            $profile_id = $repo->create([
                'post_title' => sanitize_text_field($body['name']),
                'post_status' => 'publish',
            ]);

            if (is_wp_error($profile_id)) {
                return $profile_id;
            }
        }

        // Update profile fields
        $fields_to_update = [
            'name' => sanitize_text_field($body['name']),
            'professional_title' => sanitize_text_field($body['title']),
        ];

        // Add website if provided
        if (!empty($body['website'])) {
            $fields_to_update['website'] = esc_url_raw($body['website']);
        }

        // Update the profile fields
        $result = $repo->update($profile_id, $fields_to_update);

        // Also update the post title to match the name
        wp_update_post([
            'ID' => $profile_id,
            'post_title' => sanitize_text_field($body['name']),
        ]);

        // Fire action for onboarding progress tracking
        do_action('gmkb_profile_updated', $profile_id, $user_id);

        $post = get_post($profile_id);

        return rest_ensure_response([
            'success' => true,
            'profile' => [
                'id' => $profile_id,
                'title' => $post->post_title,
                'slug' => $post->post_name,
                'status' => $post->post_status,
                'editUrl' => "/app/profiles/guest/profile/?entry={$post->post_name}",
                'viewUrl' => get_permalink($profile_id),
            ],
            'message' => empty($existing_profiles) ? 'Profile created successfully' : 'Profile updated successfully',
            'is_new' => empty($existing_profiles),
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

    /**
     * Get AEO Score for a profile
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public static function get_aeo_score($request) {
        $post_id = (int) $request->get_param('id');

        // Check if AEO Optimizer class exists
        if (!class_exists('GMKB_AEO_Optimizer')) {
            $aeo_file = GUESTIFY_PLUGIN_DIR . 'includes/seo/class-aeo-optimizer.php';
            if (file_exists($aeo_file)) {
                require_once $aeo_file;
            } else {
                return new WP_Error('not_available', 'AEO optimizer not available', ['status' => 500]);
            }
        }

        try {
            $optimizer = new GMKB_AEO_Optimizer($post_id);
            $score = $optimizer->calculate_score();

            return rest_ensure_response($score);
        } catch (Exception $e) {
            return new WP_Error('calculation_error', $e->getMessage(), ['status' => 500]);
        }
    }

    /**
     * Get SEO settings for a profile
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public static function get_seo_settings($request) {
        $post_id = (int) $request->get_param('id');

        $settings = [];
        foreach (self::SEO_FIELDS as $field) {
            $value = get_post_meta($post_id, $field, true);
            $settings[$field] = $value;
        }

        // Get schema preview if service is available
        $schema_preview = null;
        if (class_exists('GMKB_Profile_SEO_Service')) {
            try {
                $service = GMKB_Profile_SEO_Service::get_instance();
                $schema_preview = $service->get_schema_preview($post_id);
            } catch (Exception $e) {
                // Ignore preview errors
            }
        }

        // Check premium status
        $is_premium = true; // Default to true for now
        if (class_exists('GMKB_Premium_Features')) {
            $is_premium = GMKB_Premium_Features::is_enabled_for_profile(
                GMKB_Premium_Features::FEATURE_SCHEMA_SEO,
                $post_id
            );
        }

        return rest_ensure_response([
            'success' => true,
            'settings' => $settings,
            'schema_preview' => $schema_preview,
            'is_premium' => $is_premium,
        ]);
    }

    /**
     * Update SEO settings for a profile
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public static function update_seo_settings($request) {
        $post_id = (int) $request->get_param('id');
        $body = $request->get_json_params();

        // Check premium status for SEO features
        if (class_exists('GMKB_Premium_Features')) {
            $is_premium = GMKB_Premium_Features::is_enabled_for_profile(
                GMKB_Premium_Features::FEATURE_SCHEMA_SEO,
                $post_id
            );

            if (!$is_premium) {
                // Only allow authority fields for non-premium
                $allowed_fields = ['alumni_of', 'awards', 'member_of', 'certifications'];
                $body = array_intersect_key($body, array_flip($allowed_fields));
            }
        }

        $updated = [];
        foreach (self::SEO_FIELDS as $field) {
            if (isset($body[$field])) {
                $value = $body[$field];

                // Sanitize based on field type
                if (is_array($value)) {
                    $value = array_map('sanitize_text_field', $value);
                } else {
                    $value = sanitize_text_field($value);
                }

                update_post_meta($post_id, $field, $value);
                $updated[$field] = $value;
            }
        }

        return rest_ensure_response([
            'success' => true,
            'updated' => $updated,
            'message' => 'SEO settings updated successfully',
        ]);
    }
}

// Initialize the API
GMKB_Profile_API::init();
