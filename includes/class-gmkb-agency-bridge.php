<?php
/**
 * Agency Bridge for Media Kit Builder
 *
 * Integrates Media Kit Builder with the Guestify Core agency system.
 * Handles scoping, transfer hooks, and export data.
 *
 * @package Guestify\MediaKitBuilder
 * @since 5.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class GMKB_Agency_Bridge
 *
 * Bridges Media Kit Builder with the agency management system.
 */
class GMKB_Agency_Bridge {

    /**
     * Instance.
     *
     * @var GMKB_Agency_Bridge|null
     */
    private static ?GMKB_Agency_Bridge $instance = null;

    /**
     * Get instance.
     *
     * @return GMKB_Agency_Bridge
     */
    public static function get_instance(): GMKB_Agency_Bridge {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor.
     */
    private function __construct() {
        $this->init_hooks();
    }

    /**
     * Initialize hooks.
     */
    private function init_hooks(): void {
        // Transfer handler - update media kit ownership when client is transferred
        add_action('gfy_client_ownership_transferred', [$this, 'handle_client_transfer'], 10, 3);

        // Export data handler - include media kits in client exports
        add_filter('gfy_client_export_data', [$this, 'add_export_data'], 10, 3);

        // Scope media kit queries based on context
        add_filter('gmkb_profile_query_args', [$this, 'scope_profile_query']);
        add_filter('gmkb_profile_list_args', [$this, 'scope_profile_list']);

        // Add agency/client meta to profile on create
        add_action('gmkb_profile_created', [$this, 'set_profile_agency_context']);

        // REST API permission filter
        add_filter('gmkb_can_edit_profile', [$this, 'check_edit_permission'], 10, 2);
        add_filter('gmkb_can_view_profile', [$this, 'check_view_permission'], 10, 2);
    }

    /**
     * Handle client transfer - update media kit ownership.
     *
     * Called when a client is transferred from agency to personal workspace.
     *
     * @param int $client_id      Client ID being transferred
     * @param int $target_user_id User receiving the data
     * @param int $agency_id      Former agency ID
     */
    public function handle_client_transfer(int $client_id, int $target_user_id, int $agency_id): void {
        global $wpdb;

        // Get all media kit post IDs for this client
        $post_ids = $wpdb->get_col($wpdb->prepare(
            "SELECT post_id FROM {$wpdb->postmeta}
             WHERE meta_key = 'client_id' AND meta_value = %d",
            $client_id
        ));

        if (empty($post_ids)) {
            return;
        }

        // Update post author to target user
        $ids_placeholder = implode(',', array_map('intval', $post_ids));
        $wpdb->query($wpdb->prepare(
            "UPDATE {$wpdb->posts}
             SET post_author = %d
             WHERE ID IN ($ids_placeholder)",
            $target_user_id
        ));

        // Update ownership meta for each profile
        foreach ($post_ids as $post_id) {
            // Set new owner
            update_post_meta($post_id, 'owner_user_id', $target_user_id);

            // Clear agency association
            delete_post_meta($post_id, 'agency_id');
            delete_post_meta($post_id, 'client_id');
            delete_post_meta($post_id, 'managed_by_agency');
        }

        // Log the transfer
        error_log("GMKB Agency Bridge: Transferred " . count($post_ids) . " media kits from client {$client_id} to user {$target_user_id}");
    }

    /**
     * Add media kit data to client export.
     *
     * @param array $export_data Current export data
     * @param int   $client_id   Client ID
     * @param int   $agency_id   Agency ID
     * @return array Modified export data
     */
    public function add_export_data(array $export_data, int $client_id, int $agency_id): array {
        $media_kits = $this->get_client_media_kits($client_id);

        $export_data['media_kits'] = [];

        foreach ($media_kits as $post) {
            $profile_data = [
                'id' => $post->ID,
                'title' => $post->post_title,
                'slug' => $post->post_name,
                'status' => $post->post_status,
                'created_at' => $post->post_date,
                'modified_at' => $post->post_modified,
                'meta' => [],
                'components' => [],
            ];

            // Get all post meta
            $meta = get_post_meta($post->ID);
            foreach ($meta as $key => $values) {
                // Skip internal meta
                if (strpos($key, '_') === 0 && $key !== '_thumbnail_id') {
                    continue;
                }
                $profile_data['meta'][$key] = count($values) === 1 ? $values[0] : $values;
            }

            // Get component data
            $components_json = get_post_meta($post->ID, 'gmkb_components', true);
            if ($components_json) {
                $profile_data['components'] = json_decode($components_json, true);
            }

            // Get featured image URL
            $thumbnail_id = get_post_thumbnail_id($post->ID);
            if ($thumbnail_id) {
                $profile_data['featured_image'] = wp_get_attachment_url($thumbnail_id);
            }

            $export_data['media_kits'][] = $profile_data;
        }

        return $export_data;
    }

    /**
     * Scope profile query based on current agency context.
     *
     * @param array $args WP_Query args
     * @return array Modified args
     */
    public function scope_profile_query(array $args): array {
        // Check if guestify-core is active
        if (!function_exists('gfy_is_agency_context')) {
            return $args;
        }

        if (gfy_is_agency_context()) {
            $agency_id = GFY_Agency_Context::get_agency_id();
            $client_id = GFY_Agency_Context::get_client_id();

            if (!isset($args['meta_query'])) {
                $args['meta_query'] = [];
            }

            $args['meta_query'][] = [
                'key' => 'agency_id',
                'value' => $agency_id,
                'type' => 'NUMERIC',
            ];

            if ($client_id) {
                $args['meta_query'][] = [
                    'key' => 'client_id',
                    'value' => $client_id,
                    'type' => 'NUMERIC',
                ];
            }
        } else {
            // Personal context - only show profiles without agency_id
            if (!isset($args['meta_query'])) {
                $args['meta_query'] = [];
            }

            $args['meta_query'][] = [
                'relation' => 'OR',
                [
                    'key' => 'agency_id',
                    'compare' => 'NOT EXISTS',
                ],
                [
                    'key' => 'agency_id',
                    'value' => '',
                    'compare' => '=',
                ],
            ];

            // Also ensure personal ownership
            $args['author'] = get_current_user_id();
        }

        return $args;
    }

    /**
     * Scope profile list for display.
     *
     * @param array $args Query args
     * @return array Modified args
     */
    public function scope_profile_list(array $args): array {
        return $this->scope_profile_query($args);
    }

    /**
     * Set agency context when profile is created.
     *
     * @param int $post_id Profile post ID
     */
    public function set_profile_agency_context(int $post_id): void {
        if (!function_exists('gfy_is_agency_context')) {
            return;
        }

        if (gfy_is_agency_context()) {
            $agency_id = GFY_Agency_Context::get_agency_id();
            $client_id = GFY_Agency_Context::get_client_id();

            update_post_meta($post_id, 'agency_id', $agency_id);
            update_post_meta($post_id, 'managed_by_agency', 1);

            if ($client_id) {
                update_post_meta($post_id, 'client_id', $client_id);
            }
        } else {
            // Personal context
            update_post_meta($post_id, 'owner_user_id', get_current_user_id());
        }
    }

    /**
     * Check if user can edit a profile.
     *
     * @param bool $can_edit Current permission
     * @param int  $post_id  Profile post ID
     * @return bool
     */
    public function check_edit_permission(bool $can_edit, int $post_id): bool {
        if (!function_exists('gfy_user_can')) {
            return $can_edit;
        }

        $agency_id = get_post_meta($post_id, 'agency_id', true);

        // Not an agency profile - use default permission
        if (!$agency_id) {
            return $can_edit;
        }

        $client_id = get_post_meta($post_id, 'client_id', true);

        return gfy_user_can('edit_client_data', (int) $agency_id, $client_id ? (int) $client_id : null);
    }

    /**
     * Check if user can view a profile.
     *
     * @param bool $can_view Current permission
     * @param int  $post_id  Profile post ID
     * @return bool
     */
    public function check_view_permission(bool $can_view, int $post_id): bool {
        if (!function_exists('gfy_user_can')) {
            return $can_view;
        }

        $agency_id = get_post_meta($post_id, 'agency_id', true);

        // Not an agency profile - use default permission
        if (!$agency_id) {
            return $can_view;
        }

        $client_id = get_post_meta($post_id, 'client_id', true);

        return gfy_user_can('view_client_data', (int) $agency_id, $client_id ? (int) $client_id : null);
    }

    /**
     * Get media kits for a client.
     *
     * @param int $client_id Client ID
     * @return array WP_Post objects
     */
    private function get_client_media_kits(int $client_id): array {
        $args = [
            'post_type' => 'gmkb_profile',
            'posts_per_page' => -1,
            'post_status' => ['publish', 'draft', 'private'],
            'meta_query' => [
                [
                    'key' => 'client_id',
                    'value' => $client_id,
                    'type' => 'NUMERIC',
                ],
            ],
        ];

        $query = new WP_Query($args);
        return $query->posts;
    }

    /**
     * Get profiles count by agency.
     *
     * @param int $agency_id Agency ID
     * @return int Count
     */
    public static function count_by_agency(int $agency_id): int {
        $args = [
            'post_type' => 'gmkb_profile',
            'posts_per_page' => -1,
            'post_status' => ['publish', 'draft', 'private'],
            'fields' => 'ids',
            'meta_query' => [
                [
                    'key' => 'agency_id',
                    'value' => $agency_id,
                    'type' => 'NUMERIC',
                ],
            ],
        ];

        $query = new WP_Query($args);
        return $query->found_posts;
    }

    /**
     * Get profiles count by client.
     *
     * @param int $client_id Client ID
     * @return int Count
     */
    public static function count_by_client(int $client_id): int {
        $args = [
            'post_type' => 'gmkb_profile',
            'posts_per_page' => -1,
            'post_status' => ['publish', 'draft', 'private'],
            'fields' => 'ids',
            'meta_query' => [
                [
                    'key' => 'client_id',
                    'value' => $client_id,
                    'type' => 'NUMERIC',
                ],
            ],
        ];

        $query = new WP_Query($args);
        return $query->found_posts;
    }
}

// Initialize on plugins_loaded if guestify-core is active
add_action('plugins_loaded', function() {
    if (class_exists('Guestify_Core')) {
        GMKB_Agency_Bridge::get_instance();
    }
}, 20);
