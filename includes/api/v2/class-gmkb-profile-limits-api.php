<?php
/**
 * REST API endpoints for Profile Limits management
 *
 * Provides admin endpoints for managing membership tiers and
 * user-facing endpoints for checking profile limits.
 *
 * @package GMKB
 * @since 2.4.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Profile_Limits_API {

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
        // Get current user's limit status
        register_rest_route(self::NAMESPACE, '/profile-limits/status', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'get_limit_status'],
            'permission_callback' => [__CLASS__, 'check_user_permission'],
        ]);

        // Admin: Get all tiers
        register_rest_route(self::NAMESPACE, '/profile-limits/tiers', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'get_tiers'],
            'permission_callback' => [__CLASS__, 'check_admin_permission'],
        ]);

        // Admin: Update all tiers
        register_rest_route(self::NAMESPACE, '/profile-limits/tiers', [
            'methods' => WP_REST_Server::EDITABLE,
            'callback' => [__CLASS__, 'update_tiers'],
            'permission_callback' => [__CLASS__, 'check_admin_permission'],
        ]);

        // Admin: Update a single tier
        register_rest_route(self::NAMESPACE, '/profile-limits/tiers/(?P<key>[a-z0-9_-]+)', [
            'methods' => WP_REST_Server::EDITABLE,
            'callback' => [__CLASS__, 'update_tier'],
            'permission_callback' => [__CLASS__, 'check_admin_permission'],
        ]);

        // Admin: Delete a tier
        register_rest_route(self::NAMESPACE, '/profile-limits/tiers/(?P<key>[a-z0-9_-]+)', [
            'methods' => WP_REST_Server::DELETABLE,
            'callback' => [__CLASS__, 'delete_tier'],
            'permission_callback' => [__CLASS__, 'check_admin_permission'],
        ]);

        // Admin: Reset to defaults
        register_rest_route(self::NAMESPACE, '/profile-limits/reset', [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [__CLASS__, 'reset_tiers'],
            'permission_callback' => [__CLASS__, 'check_admin_permission'],
        ]);

        // Admin: Check user's tier (by user ID)
        register_rest_route(self::NAMESPACE, '/profile-limits/user/(?P<user_id>\d+)', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'get_user_tier'],
            'permission_callback' => [__CLASS__, 'check_admin_permission'],
        ]);
    }

    // =========================================================================
    // Permission Callbacks
    // =========================================================================

    /**
     * Check if user is logged in
     */
    public static function check_user_permission($request) {
        if (!is_user_logged_in()) {
            return new WP_Error('unauthorized', 'Authentication required', ['status' => 401]);
        }
        return true;
    }

    /**
     * Check if user is admin
     */
    public static function check_admin_permission($request) {
        if (!is_user_logged_in()) {
            return new WP_Error('unauthorized', 'Authentication required', ['status' => 401]);
        }

        if (!current_user_can('manage_options')) {
            return new WP_Error('forbidden', 'Admin access required', ['status' => 403]);
        }

        return true;
    }

    // =========================================================================
    // API Endpoints
    // =========================================================================

    /**
     * Get current user's profile limit status
     */
    public static function get_limit_status($request) {
        $user_id = get_current_user_id();
        $status = GMKB_Profile_Limits::get_limit_status($user_id);

        return rest_ensure_response([
            'success' => true,
            'data' => $status,
        ]);
    }

    /**
     * Get all configured tiers (admin only)
     */
    public static function get_tiers($request) {
        $tiers = GMKB_Profile_Limits::get_tiers();

        return rest_ensure_response([
            'success' => true,
            'tiers' => $tiers,
            'defaults' => GMKB_Profile_Limits::DEFAULT_TIERS,
        ]);
    }

    /**
     * Update all tiers at once (admin only)
     */
    public static function update_tiers($request) {
        $body = $request->get_json_params();

        if (!isset($body['tiers']) || !is_array($body['tiers'])) {
            return new WP_Error('invalid_data', 'Tiers array is required', ['status' => 400]);
        }

        $tiers = $body['tiers'];

        // Validate each tier
        foreach ($tiers as $key => $tier) {
            if (!isset($tier['name']) || !isset($tier['profile_limit'])) {
                return new WP_Error(
                    'invalid_tier',
                    "Tier '$key' is missing required fields (name, profile_limit)",
                    ['status' => 400]
                );
            }

            // Sanitize
            $tiers[$key]['name'] = sanitize_text_field($tier['name']);
            $tiers[$key]['profile_limit'] = (int) $tier['profile_limit'];
            $tiers[$key]['display_limit'] = (int) ($tier['display_limit'] ?? $tier['profile_limit']);
            $tiers[$key]['priority'] = (int) ($tier['priority'] ?? 0);

            if (isset($tier['tags']) && is_array($tier['tags'])) {
                $tiers[$key]['tags'] = array_map('sanitize_text_field', $tier['tags']);
            } else {
                $tiers[$key]['tags'] = [];
            }
        }

        $result = GMKB_Profile_Limits::save_tiers($tiers);

        if (!$result) {
            return new WP_Error('save_failed', 'Failed to save tiers', ['status' => 500]);
        }

        return rest_ensure_response([
            'success' => true,
            'tiers' => GMKB_Profile_Limits::get_tiers(),
            'message' => 'Tiers updated successfully',
        ]);
    }

    /**
     * Update a single tier (admin only)
     */
    public static function update_tier($request) {
        $key = sanitize_key($request->get_param('key'));
        $body = $request->get_json_params();

        if (!isset($body['name']) || !isset($body['profile_limit'])) {
            return new WP_Error('invalid_data', 'Name and profile_limit are required', ['status' => 400]);
        }

        $tier_data = [
            'name' => sanitize_text_field($body['name']),
            'profile_limit' => (int) $body['profile_limit'],
            'display_limit' => (int) ($body['display_limit'] ?? $body['profile_limit']),
            'priority' => (int) ($body['priority'] ?? 0),
            'tags' => [],
        ];

        if (isset($body['tags']) && is_array($body['tags'])) {
            $tier_data['tags'] = array_map('sanitize_text_field', $body['tags']);
        }

        $result = GMKB_Profile_Limits::update_tier($key, $tier_data);

        if (!$result) {
            return new WP_Error('save_failed', 'Failed to save tier', ['status' => 500]);
        }

        return rest_ensure_response([
            'success' => true,
            'tier' => array_merge(['key' => $key], $tier_data),
            'message' => 'Tier updated successfully',
        ]);
    }

    /**
     * Delete a tier (admin only)
     */
    public static function delete_tier($request) {
        $key = sanitize_key($request->get_param('key'));

        if (in_array($key, ['unlimited', 'free'], true)) {
            return new WP_Error(
                'cannot_delete',
                'The "unlimited" and "free" tiers cannot be deleted',
                ['status' => 400]
            );
        }

        $result = GMKB_Profile_Limits::delete_tier($key);

        if (!$result) {
            return new WP_Error('delete_failed', 'Failed to delete tier', ['status' => 500]);
        }

        return rest_ensure_response([
            'success' => true,
            'message' => 'Tier deleted successfully',
        ]);
    }

    /**
     * Reset tiers to defaults (admin only)
     */
    public static function reset_tiers($request) {
        $result = GMKB_Profile_Limits::reset_to_defaults();

        if (!$result) {
            return new WP_Error('reset_failed', 'Failed to reset tiers', ['status' => 500]);
        }

        return rest_ensure_response([
            'success' => true,
            'tiers' => GMKB_Profile_Limits::get_tiers(),
            'message' => 'Tiers reset to defaults',
        ]);
    }

    /**
     * Get a specific user's tier info (admin only)
     */
    public static function get_user_tier($request) {
        $user_id = (int) $request->get_param('user_id');

        $user = get_user_by('id', $user_id);
        if (!$user) {
            return new WP_Error('not_found', 'User not found', ['status' => 404]);
        }

        $tier = GMKB_Profile_Limits::get_user_tier($user_id);
        $status = GMKB_Profile_Limits::get_limit_status($user_id);
        $tags = GMKB_Profile_Limits::get_user_tags($user_id);

        return rest_ensure_response([
            'success' => true,
            'user' => [
                'id' => $user_id,
                'display_name' => $user->display_name,
                'email' => $user->user_email,
            ],
            'tier' => $tier,
            'status' => $status,
            'wpf_tags' => $tags,
        ]);
    }
}

// Initialize the API
GMKB_Profile_Limits_API::init();
