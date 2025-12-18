<?php
/**
 * REST API endpoints for Onboarding Progress
 *
 * Provides endpoints to read onboarding progress and task definitions.
 * Uses GMKB_Onboarding_Schema for definitions and GMKB_Onboarding_Repository for data.
 *
 * @package GMKB
 * @since 2.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Onboarding_API {

    /**
     * API namespace
     */
    const NAMESPACE = 'gmkb/v2';

    /**
     * Repository instance
     *
     * @var GMKB_Onboarding_Repository|null
     */
    private static $repository = null;

    /**
     * Get repository instance
     *
     * @return GMKB_Onboarding_Repository
     */
    private static function get_repository(): GMKB_Onboarding_Repository {
        if (self::$repository === null) {
            self::$repository = new GMKB_Onboarding_Repository();
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
        // Get user's onboarding progress (aggregate across all profiles)
        register_rest_route(self::NAMESPACE, '/onboarding/progress', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'get_progress'],
            'permission_callback' => [__CLASS__, 'check_user_permission'],
        ]);

        // Get progress for a specific profile
        register_rest_route(self::NAMESPACE, '/onboarding/progress/(?P<profile_id>\d+)', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'get_progress_for_profile'],
            'permission_callback' => [__CLASS__, 'check_profile_permission'],
            'args' => [
                'profile_id' => [
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                ],
            ],
        ]);

        // Get task definitions (schema)
        register_rest_route(self::NAMESPACE, '/onboarding/tasks', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'get_tasks'],
            'permission_callback' => '__return_true',
        ]);

        // Get rewards with unlock status
        register_rest_route(self::NAMESPACE, '/onboarding/rewards', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'get_rewards'],
            'permission_callback' => [__CLASS__, 'check_user_permission'],
        ]);

        // Mark a task as manually complete (for tasks like survey)
        register_rest_route(self::NAMESPACE, '/onboarding/complete/(?P<task_id>[a-z_]+)', [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [__CLASS__, 'complete_task'],
            'permission_callback' => [__CLASS__, 'check_user_permission'],
            'args' => [
                'task_id' => [
                    'validate_callback' => function($param) {
                        return preg_match('/^[a-z_]+$/', $param);
                    }
                ],
            ],
        ]);

        // Get profile strength (subset for Media Kit)
        register_rest_route(self::NAMESPACE, '/onboarding/profile-strength', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'get_profile_strength'],
            'permission_callback' => [__CLASS__, 'check_user_permission'],
        ]);

        // Get profile strength for specific profile
        register_rest_route(self::NAMESPACE, '/onboarding/profile-strength/(?P<profile_id>\d+)', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'get_profile_strength_for_profile'],
            'permission_callback' => [__CLASS__, 'check_profile_permission'],
            'args' => [
                'profile_id' => [
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                ],
            ],
        ]);

        // Get Cialdini-based profile influence score (detailed breakdown)
        register_rest_route(self::NAMESPACE, '/profile/(?P<profile_id>\d+)/strength', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'get_cialdini_strength'],
            'permission_callback' => [__CLASS__, 'check_profile_permission'],
            'args' => [
                'profile_id' => [
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                ],
            ],
        ]);

        // Get Profile Scoring schema
        register_rest_route(self::NAMESPACE, '/profile/strength-schema', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'get_strength_schema'],
            'permission_callback' => '__return_true',
        ]);

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB Onboarding API: Routes registered');
        }
    }

    // =========================================================================
    // Permission Callbacks
    // =========================================================================

    /**
     * Check if user is logged in
     *
     * @param WP_REST_Request $request
     * @return bool|WP_Error
     */
    public static function check_user_permission($request) {
        if (!is_user_logged_in()) {
            return new WP_Error(
                'unauthorized',
                'Authentication required',
                ['status' => 401]
            );
        }
        return true;
    }

    /**
     * Check if user owns the specified profile
     *
     * @param WP_REST_Request $request
     * @return bool|WP_Error
     */
    public static function check_profile_permission($request) {
        if (!is_user_logged_in()) {
            return new WP_Error(
                'unauthorized',
                'Authentication required',
                ['status' => 401]
            );
        }

        $profile_id = (int) $request->get_param('profile_id');
        $user_id = get_current_user_id();

        // Admins can access any profile
        if (current_user_can('edit_others_posts')) {
            return true;
        }

        // Check ownership via Profile Repository
        if (class_exists('GMKB_Profile_Repository')) {
            $repo = new GMKB_Profile_Repository();
            if ($repo->is_owner($profile_id, $user_id)) {
                return true;
            }
        }

        return new WP_Error(
            'forbidden',
            'You do not have permission to access this profile',
            ['status' => 403]
        );
    }

    // =========================================================================
    // API Endpoints
    // =========================================================================

    /**
     * GET /gmkb/v2/onboarding/progress
     *
     * Get user's aggregate onboarding progress
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function get_progress($request) {
        $user_id = get_current_user_id();
        $repo = self::get_repository();

        $progress = $repo->calculate_progress($user_id);

        // Update cached percentage in user meta
        $repo->update_progress_meta($user_id, $progress['points']['percentage']);

        return rest_ensure_response([
            'success' => true,
            'data' => $progress,
        ]);
    }

    /**
     * GET /gmkb/v2/onboarding/progress/{profile_id}
     *
     * Get progress for a specific profile
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function get_progress_for_profile($request) {
        $user_id = get_current_user_id();
        $profile_id = (int) $request->get_param('profile_id');
        $repo = self::get_repository();

        $progress = $repo->calculate_progress_for_profile($user_id, $profile_id);

        return rest_ensure_response([
            'success' => true,
            'data' => $progress,
        ]);
    }

    /**
     * GET /gmkb/v2/onboarding/tasks
     *
     * Get task definitions (schema)
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function get_tasks($request) {
        $schema = GMKB_Onboarding_Schema::to_frontend_schema();

        return rest_ensure_response([
            'success' => true,
            'data' => $schema,
        ]);
    }

    /**
     * GET /gmkb/v2/onboarding/rewards
     *
     * Get rewards with unlock status
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function get_rewards($request) {
        $user_id = get_current_user_id();
        $repo = self::get_repository();

        $progress = $repo->calculate_progress($user_id);

        return rest_ensure_response([
            'success' => true,
            'data' => [
                'rewards' => $progress['rewards'],
                'total_points' => $progress['points']['total'],
            ],
        ]);
    }

    /**
     * POST /gmkb/v2/onboarding/complete/{task_id}
     *
     * Manually mark a task as complete
     * Currently only supports 'survey' task
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public static function complete_task($request) {
        $user_id = get_current_user_id();
        $task_id = $request->get_param('task_id');
        $repo = self::get_repository();

        // Validate task exists
        $task = GMKB_Onboarding_Schema::get_task($task_id);
        if (!$task) {
            return new WP_Error(
                'invalid_task',
                'Unknown task ID',
                ['status' => 400]
            );
        }

        // Handle specific tasks that can be manually completed
        switch ($task_id) {
            case 'survey':
                $result = $repo->mark_survey_completed($user_id);
                break;

            default:
                return new WP_Error(
                    'task_not_completable',
                    'This task cannot be manually completed',
                    ['status' => 400]
                );
        }

        if (!$result) {
            return new WP_Error(
                'completion_failed',
                'Failed to mark task as complete',
                ['status' => 500]
            );
        }

        // Return updated progress
        $progress = $repo->calculate_progress($user_id);
        $repo->update_progress_meta($user_id, $progress['points']['percentage']);

        return rest_ensure_response([
            'success' => true,
            'message' => 'Task marked as complete',
            'task_id' => $task_id,
            'data' => $progress,
        ]);
    }

    /**
     * GET /gmkb/v2/onboarding/profile-strength
     *
     * Get profile strength (subset for Media Kit display)
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function get_profile_strength($request) {
        $user_id = get_current_user_id();
        $repo = self::get_repository();

        $strength = $repo->calculate_profile_strength($user_id);

        return rest_ensure_response([
            'success' => true,
            'data' => [
                'strength' => $strength,
                'max' => 100,
            ],
        ]);
    }

    /**
     * GET /gmkb/v2/onboarding/profile-strength/{profile_id}
     *
     * Get profile strength for a specific profile
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function get_profile_strength_for_profile($request) {
        $user_id = get_current_user_id();
        $profile_id = (int) $request->get_param('profile_id');
        $repo = self::get_repository();

        $strength = $repo->calculate_profile_strength($user_id, $profile_id);

        return rest_ensure_response([
            'success' => true,
            'data' => [
                'profile_id' => $profile_id,
                'strength' => $strength,
                'max' => 100,
            ],
        ]);
    }

    /**
     * GET /gmkb/v2/profile/{profile_id}/strength
     *
     * Get Cialdini-based profile influence score with detailed breakdown
     * This uses the new GMKB_Profile_Scoring class for quality-based scoring.
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public static function get_cialdini_strength($request) {
        $profile_id = (int) $request->get_param('profile_id');

        // Verify class exists
        if (!class_exists('GMKB_Profile_Scoring')) {
            return new WP_Error(
                'class_not_found',
                'Profile Scoring class not available',
                ['status' => 500]
            );
        }

        // Verify profile exists
        $profile = get_post($profile_id);
        if (!$profile || $profile->post_type !== 'guest_profile') {
            return new WP_Error(
                'profile_not_found',
                'Profile not found',
                ['status' => 404]
            );
        }

        // Calculate strength using Cialdini model
        $strength = GMKB_Profile_Scoring::calculate_strength($profile_id);

        return rest_ensure_response([
            'success' => true,
            'data'    => $strength,
        ]);
    }

    /**
     * GET /gmkb/v2/profile/strength-schema
     *
     * Get the Profile Scoring schema definition
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function get_strength_schema($request) {
        if (!class_exists('GMKB_Profile_Scoring')) {
            return new WP_Error(
                'class_not_found',
                'Profile Scoring class not available',
                ['status' => 500]
            );
        }

        return rest_ensure_response([
            'success' => true,
            'data'    => GMKB_Profile_Scoring::get_schema(),
        ]);
    }
}

// Initialize the API
GMKB_Onboarding_API::init();
