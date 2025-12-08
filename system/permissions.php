<?php
/**
 * GMKB Permission Helpers
 *
 * Implements owner-based permission model for headless architecture.
 * Separates user authentication from media kit ownership.
 *
 * @package GMKB
 * @since 3.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Permissions {

    /**
     * Initialize permission hooks
     */
    public static function init() {
        // Map meta capabilities
        add_filter('map_meta_cap', [__CLASS__, 'map_meta_cap'], 10, 4);

        // REST API permission callbacks
        add_filter('rest_pre_dispatch', [__CLASS__, 'rest_pre_dispatch'], 10, 3);
    }

    /**
     * Check if user can view a media kit
     *
     * @param int $post_id Post ID
     * @param int|null $user_id User ID (defaults to current user)
     * @return bool
     */
    public static function can_view($post_id, $user_id = null) {
        $post = get_post($post_id);

        if (!$post) {
            return false;
        }

        // Published posts are public
        if ($post->post_status === 'publish') {
            return true;
        }

        // Otherwise, must be owner or have capability
        if (self::is_owner($post_id, $user_id)) {
            return true;
        }

        // Admins can view anything
        $user_id = $user_id ?? get_current_user_id();
        if ($user_id && user_can($user_id, 'edit_others_posts')) {
            return true;
        }

        return false;
    }

    /**
     * Check if user can edit a media kit
     *
     * @param int $post_id Post ID
     * @param int|null $user_id User ID (defaults to current user)
     * @return bool
     */
    public static function can_edit($post_id, $user_id = null) {
        if ($user_id === null) {
            $user_id = get_current_user_id();
        }

        if (!$user_id) {
            return false;
        }

        // Admins can edit anything
        if (user_can($user_id, 'manage_options')) {
            return true;
        }

        // Editors can edit any media kit
        if (user_can($user_id, 'edit_others_posts')) {
            return true;
        }

        // Otherwise must be owner
        return self::is_owner($post_id, $user_id);
    }

    /**
     * Check if user can delete a media kit
     *
     * @param int $post_id Post ID
     * @param int|null $user_id User ID (defaults to current user)
     * @return bool
     */
    public static function can_delete($post_id, $user_id = null) {
        if ($user_id === null) {
            $user_id = get_current_user_id();
        }

        if (!$user_id) {
            return false;
        }

        // Admins can delete anything
        if (user_can($user_id, 'manage_options')) {
            return true;
        }

        // Only owner can delete their media kit
        return self::is_owner($post_id, $user_id);
    }

    /**
     * Check if user can create a media kit
     *
     * @param int|null $user_id User ID (defaults to current user)
     * @return bool
     */
    public static function can_create($user_id = null) {
        if ($user_id === null) {
            $user_id = get_current_user_id();
        }

        if (!$user_id) {
            return false;
        }

        // Must have at least publish_posts capability
        return user_can($user_id, 'publish_posts');
    }

    /**
     * Check if user owns a media kit
     *
     * @param int $post_id Post ID
     * @param int|null $user_id User ID (defaults to current user)
     * @return bool
     */
    public static function is_owner($post_id, $user_id = null) {
        if ($user_id === null) {
            $user_id = get_current_user_id();
        }

        if (!$user_id) {
            return false;
        }

        // Check owner_user_id meta field first (Phase 3 standard)
        $owner_id = get_post_meta($post_id, 'owner_user_id', true);

        // Fallback to post author during migration period
        if (empty($owner_id)) {
            $post = get_post($post_id);
            $owner_id = $post ? $post->post_author : 0;
        }

        return absint($owner_id) === absint($user_id);
    }

    /**
     * Get the owner user ID for a media kit
     *
     * @param int $post_id Post ID
     * @return int|false Owner user ID or false if not found
     */
    public static function get_owner($post_id) {
        $owner_id = get_post_meta($post_id, 'owner_user_id', true);

        if (!$owner_id) {
            $post = get_post($post_id);
            $owner_id = $post ? $post->post_author : 0;
        }

        return $owner_id ? absint($owner_id) : false;
    }

    /**
     * Set the owner for a media kit
     *
     * @param int $post_id Post ID
     * @param int $user_id User ID
     * @return bool Success
     */
    public static function set_owner($post_id, $user_id) {
        return update_post_meta($post_id, 'owner_user_id', absint($user_id)) !== false;
    }

    /**
     * Get all media kits owned by a user
     *
     * @param int|null $user_id User ID (defaults to current user)
     * @param array $args Additional query args
     * @return WP_Post[] Array of post objects
     */
    public static function get_user_media_kits($user_id = null, $args = []) {
        if ($user_id === null) {
            $user_id = get_current_user_id();
        }

        if (!$user_id) {
            return [];
        }

        $default_args = [
            'post_type' => 'guests',
            'posts_per_page' => -1,
            'post_status' => ['publish', 'draft', 'private', 'pending'],
            'meta_query' => [
                'relation' => 'OR',
                [
                    'key' => 'owner_user_id',
                    'value' => $user_id,
                    'compare' => '=',
                    'type' => 'NUMERIC',
                ],
            ],
            'author' => $user_id, // Fallback for posts without owner_user_id
        ];

        $query_args = wp_parse_args($args, $default_args);

        return get_posts($query_args);
    }

    /**
     * Count media kits owned by a user
     *
     * @param int|null $user_id User ID (defaults to current user)
     * @return int Count
     */
    public static function count_user_media_kits($user_id = null) {
        if ($user_id === null) {
            $user_id = get_current_user_id();
        }

        if (!$user_id) {
            return 0;
        }

        return count(self::get_user_media_kits($user_id));
    }

    /**
     * REST API permission callback
     *
     * @param WP_REST_Request $request
     * @return bool|WP_Error
     */
    public static function rest_permission_callback($request) {
        $post_id = $request->get_param('id');
        $method = $request->get_method();

        // Handle creation (no post_id yet)
        if ($method === 'POST' && !$post_id) {
            if (!self::can_create()) {
                return new WP_Error(
                    'rest_forbidden',
                    __('You do not have permission to create media kits.', 'gmkb'),
                    ['status' => 403]
                );
            }
            return true;
        }

        // View permissions
        if ($method === 'GET') {
            if (!self::can_view($post_id)) {
                return new WP_Error(
                    'rest_forbidden',
                    __('You do not have permission to view this media kit.', 'gmkb'),
                    ['status' => 403]
                );
            }
            return true;
        }

        // Edit permissions (PUT, PATCH, POST with ID)
        if (in_array($method, ['PUT', 'PATCH']) || ($method === 'POST' && $post_id)) {
            if (!self::can_edit($post_id)) {
                return new WP_Error(
                    'rest_forbidden',
                    __('You do not have permission to edit this media kit.', 'gmkb'),
                    ['status' => 403]
                );
            }
            return true;
        }

        // Delete permissions
        if ($method === 'DELETE') {
            if (!self::can_delete($post_id)) {
                return new WP_Error(
                    'rest_forbidden',
                    __('You do not have permission to delete this media kit.', 'gmkb'),
                    ['status' => 403]
                );
            }
            return true;
        }

        return true;
    }

    /**
     * Map meta capabilities for the guests post type
     *
     * @param array $caps Required capabilities
     * @param string $cap Capability being checked
     * @param int $user_id User ID
     * @param array $args Additional arguments
     * @return array Modified capabilities
     */
    public static function map_meta_cap($caps, $cap, $user_id, $args) {
        // Only modify capabilities for guests post type
        if (!in_array($cap, ['edit_post', 'delete_post', 'read_post'])) {
            return $caps;
        }

        if (empty($args[0])) {
            return $caps;
        }

        $post = get_post($args[0]);
        if (!$post || $post->post_type !== 'guests') {
            return $caps;
        }

        switch ($cap) {
            case 'edit_post':
                if (self::can_edit($post->ID, $user_id)) {
                    return ['exist']; // Grant capability
                }
                break;

            case 'delete_post':
                if (self::can_delete($post->ID, $user_id)) {
                    return ['exist'];
                }
                break;

            case 'read_post':
                if (self::can_view($post->ID, $user_id)) {
                    return ['exist'];
                }
                break;
        }

        return $caps;
    }

    /**
     * REST API pre-dispatch filter for additional security
     *
     * @param mixed $result Response to replace dispatch result
     * @param WP_REST_Server $server Server instance
     * @param WP_REST_Request $request Request
     * @return mixed
     */
    public static function rest_pre_dispatch($result, $server, $request) {
        $route = $request->get_route();

        // Only intercept our API routes
        if (strpos($route, '/gmkb/') === false && strpos($route, '/media-kits') === false) {
            return $result;
        }

        // Log access attempts for security auditing (if enabled)
        if (defined('GMKB_LOG_API_ACCESS') && GMKB_LOG_API_ACCESS) {
            self::log_access_attempt($request);
        }

        return $result;
    }

    /**
     * Log API access attempt
     *
     * @param WP_REST_Request $request
     */
    private static function log_access_attempt($request) {
        $log = [
            'timestamp' => current_time('mysql'),
            'user_id' => get_current_user_id(),
            'route' => $request->get_route(),
            'method' => $request->get_method(),
            'params' => $request->get_params(),
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        ];

        error_log('GMKB API Access: ' . json_encode($log));
    }

    /**
     * Backfill owner_user_id from post_author for existing posts
     *
     * @param int $batch_size Posts per batch
     * @return array Results
     */
    public static function backfill_owner_ids($batch_size = 100) {
        $posts = get_posts([
            'post_type' => ['guests', 'mkcg'],
            'posts_per_page' => $batch_size,
            'post_status' => 'any',
            'meta_query' => [
                [
                    'key' => 'owner_user_id',
                    'compare' => 'NOT EXISTS',
                ],
            ],
        ]);

        $updated = 0;
        foreach ($posts as $post) {
            if ($post->post_author) {
                update_post_meta($post->ID, 'owner_user_id', $post->post_author);
                $updated++;
            }
        }

        return [
            'updated' => $updated,
            'remaining' => self::count_missing_owners(),
        ];
    }

    /**
     * Count posts missing owner_user_id
     *
     * @return int Count
     */
    public static function count_missing_owners() {
        global $wpdb;

        return (int) $wpdb->get_var("
            SELECT COUNT(*)
            FROM {$wpdb->posts} p
            LEFT JOIN {$wpdb->postmeta} pm
                ON p.ID = pm.post_id
                AND pm.meta_key = 'owner_user_id'
            WHERE p.post_type IN ('guests', 'mkcg')
            AND pm.meta_id IS NULL
        ");
    }
}

// Initialize permissions
add_action('init', ['GMKB_Permissions', 'init']);
