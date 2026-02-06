<?php
/**
 * REST API endpoints for Onboarding Admin (Rewards Management)
 *
 * Provides admin-only endpoints to manage reward tiers.
 * Uses GMKB_Onboarding_Schema for storage.
 *
 * @package GMKB
 * @since 2.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Onboarding_Admin_API {

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
        // Get all rewards
        register_rest_route(self::NAMESPACE, '/admin/rewards', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [__CLASS__, 'get_rewards'],
                'permission_callback' => [__CLASS__, 'check_admin_permission'],
            ],
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => [__CLASS__, 'save_rewards'],
                'permission_callback' => [__CLASS__, 'check_admin_permission'],
            ],
        ]);

        // Update single reward
        register_rest_route(self::NAMESPACE, '/admin/rewards/(?P<id>[a-z0-9_]+)', [
            'methods' => WP_REST_Server::EDITABLE,
            'callback' => [__CLASS__, 'update_reward'],
            'permission_callback' => [__CLASS__, 'check_admin_permission'],
            'args' => [
                'id' => [
                    'validate_callback' => function($param) {
                        return preg_match('/^[a-z0-9_]+$/', $param);
                    }
                ],
            ],
        ]);

        // Reset rewards to defaults
        register_rest_route(self::NAMESPACE, '/admin/rewards/reset', [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [__CLASS__, 'reset_rewards'],
            'permission_callback' => [__CLASS__, 'check_admin_permission'],
        ]);

        // Get onboarding leaderboard (admin view)
        register_rest_route(self::NAMESPACE, '/admin/onboarding/leaderboard', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'get_leaderboard'],
            'permission_callback' => [__CLASS__, 'check_admin_permission'],
            'args' => [
                'limit' => [
                    'default' => 20,
                    'validate_callback' => function($param) {
                        return is_numeric($param) && $param > 0 && $param <= 100;
                    }
                ],
            ],
        ]);

        GMKB_Logger::startup('GMKB Onboarding Admin API: Routes registered');
    }

    // =========================================================================
    // Permission Callbacks
    // =========================================================================

    /**
     * Check if user is admin
     *
     * @param WP_REST_Request $request
     * @return bool|WP_Error
     */
    public static function check_admin_permission($request) {
        if (!is_user_logged_in()) {
            return new WP_Error(
                'unauthorized',
                'Authentication required',
                ['status' => 401]
            );
        }

        if (!current_user_can('manage_options')) {
            return new WP_Error(
                'forbidden',
                'Administrator access required',
                ['status' => 403]
            );
        }

        return true;
    }

    // =========================================================================
    // API Endpoints
    // =========================================================================

    /**
     * GET /gmkb/v2/admin/rewards
     *
     * Get all reward tiers
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function get_rewards($request) {
        $rewards = GMKB_Onboarding_Schema::get_rewards();
        $defaults = GMKB_Onboarding_Schema::DEFAULT_REWARDS;

        // Check if using defaults or custom
        $is_default = get_option(GMKB_Onboarding_Schema::REWARDS_OPTION_KEY, null) === null;

        return rest_ensure_response([
            'success' => true,
            'data' => [
                'rewards' => $rewards,
                'is_default' => $is_default,
                'defaults' => $defaults,
            ],
        ]);
    }

    /**
     * POST /gmkb/v2/admin/rewards
     *
     * Save all reward tiers
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public static function save_rewards($request) {
        $body = $request->get_json_params();

        if (!isset($body['rewards']) || !is_array($body['rewards'])) {
            return new WP_Error(
                'invalid_data',
                'Rewards array is required',
                ['status' => 400]
            );
        }

        $rewards = $body['rewards'];

        // Validate each reward
        foreach ($rewards as $index => $reward) {
            $validation = self::validate_reward($reward);
            if (is_wp_error($validation)) {
                return new WP_Error(
                    'invalid_reward',
                    "Reward at index {$index}: " . $validation->get_error_message(),
                    ['status' => 400]
                );
            }
        }

        // Sanitize rewards
        $sanitized = array_map([__CLASS__, 'sanitize_reward'], $rewards);

        // Save
        $result = GMKB_Onboarding_Schema::save_rewards($sanitized);

        if (!$result) {
            return new WP_Error(
                'save_failed',
                'Failed to save rewards',
                ['status' => 500]
            );
        }

        return rest_ensure_response([
            'success' => true,
            'message' => 'Rewards saved successfully',
            'data' => [
                'rewards' => $sanitized,
            ],
        ]);
    }

    /**
     * PUT /gmkb/v2/admin/rewards/{id}
     *
     * Update a single reward
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public static function update_reward($request) {
        $reward_id = $request->get_param('id');
        $body = $request->get_json_params();

        if (empty($body)) {
            return new WP_Error(
                'invalid_data',
                'Reward data is required',
                ['status' => 400]
            );
        }

        // Get current rewards
        $rewards = GMKB_Onboarding_Schema::get_rewards();

        // Find the reward to update
        $found = false;
        foreach ($rewards as &$reward) {
            if ($reward['id'] === $reward_id) {
                // Merge updates
                $reward = array_merge($reward, $body);

                // Validate
                $validation = self::validate_reward($reward);
                if (is_wp_error($validation)) {
                    return $validation;
                }

                // Sanitize
                $reward = self::sanitize_reward($reward);
                $found = true;
                break;
            }
        }

        if (!$found) {
            return new WP_Error(
                'not_found',
                'Reward not found',
                ['status' => 404]
            );
        }

        // Save
        $result = GMKB_Onboarding_Schema::save_rewards($rewards);

        if (!$result) {
            return new WP_Error(
                'save_failed',
                'Failed to save reward',
                ['status' => 500]
            );
        }

        return rest_ensure_response([
            'success' => true,
            'message' => 'Reward updated successfully',
            'data' => [
                'reward_id' => $reward_id,
                'rewards' => $rewards,
            ],
        ]);
    }

    /**
     * POST /gmkb/v2/admin/rewards/reset
     *
     * Reset rewards to defaults
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function reset_rewards($request) {
        GMKB_Onboarding_Schema::reset_rewards();

        return rest_ensure_response([
            'success' => true,
            'message' => 'Rewards reset to defaults',
            'data' => [
                'rewards' => GMKB_Onboarding_Schema::DEFAULT_REWARDS,
            ],
        ]);
    }

    /**
     * GET /gmkb/v2/admin/onboarding/leaderboard
     *
     * Get onboarding leaderboard data
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function get_leaderboard($request) {
        global $wpdb;

        $limit = (int) $request->get_param('limit');

        // Query users with onboarding progress
        $users = $wpdb->get_results($wpdb->prepare(
            "SELECT
                u.ID as user_id,
                u.user_email,
                u.display_name,
                um.meta_value as progress_percent,
                um2.meta_value as ghl_id
            FROM {$wpdb->users} u
            LEFT JOIN {$wpdb->usermeta} um ON u.ID = um.user_id AND um.meta_key = 'guestify_onboarding_progress_percent'
            LEFT JOIN {$wpdb->usermeta} um2 ON u.ID = um2.user_id AND um2.meta_key = 'highlevel_contact_id'
            WHERE um.meta_value IS NOT NULL AND um.meta_value != ''
            ORDER BY CAST(um.meta_value AS UNSIGNED) DESC
            LIMIT %d",
            $limit
        ), ARRAY_A);

        // Add rank
        $rank = 1;
        $prev_percent = null;
        $tied_rank = 1;

        foreach ($users as &$user) {
            $percent = intval($user['progress_percent']);

            if ($prev_percent !== null && $prev_percent !== $percent) {
                $tied_rank = $rank;
            }

            $user['rank'] = $tied_rank;
            $user['progress_percent'] = $percent;

            $prev_percent = $percent;
            $rank++;
        }

        return rest_ensure_response([
            'success' => true,
            'data' => [
                'leaderboard' => $users,
                'total' => count($users),
            ],
        ]);
    }

    // =========================================================================
    // Helper Methods
    // =========================================================================

    /**
     * Validate a reward object
     *
     * @param array $reward Reward data
     * @return true|WP_Error
     */
    private static function validate_reward(array $reward) {
        if (empty($reward['id'])) {
            return new WP_Error('missing_id', 'Reward ID is required');
        }

        if (!isset($reward['threshold']) || !is_numeric($reward['threshold'])) {
            return new WP_Error('invalid_threshold', 'Valid threshold is required');
        }

        if ($reward['threshold'] < 0 || $reward['threshold'] > 100) {
            return new WP_Error('threshold_range', 'Threshold must be between 0 and 100');
        }

        if (empty($reward['title'])) {
            return new WP_Error('missing_title', 'Reward title is required');
        }

        return true;
    }

    /**
     * Sanitize a reward object
     *
     * @param array $reward Raw reward data
     * @return array Sanitized reward
     */
    private static function sanitize_reward(array $reward): array {
        return [
            'id' => sanitize_key($reward['id']),
            'threshold' => absint($reward['threshold']),
            'title' => sanitize_text_field($reward['title']),
            'description' => sanitize_text_field($reward['description'] ?? ''),
            'download_url' => esc_url_raw($reward['download_url'] ?? ''),
            'attachment_id' => !empty($reward['attachment_id']) ? absint($reward['attachment_id']) : null,
            'icon' => sanitize_key($reward['icon'] ?? 'gift'),
        ];
    }
}

// Initialize the API
GMKB_Onboarding_Admin_API::init();
