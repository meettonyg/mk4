<?php
/**
 * Media Library REST API
 *
 * REST API endpoints for standalone media library management.
 *
 * @package GMKB
 * @since 3.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Media_Library_API {

    /**
     * API namespace
     */
    const NAMESPACE = 'gmkb/v2';

    /**
     * Register REST API routes
     */
    public static function register_routes() {
        // Media library CRUD
        register_rest_route(self::NAMESPACE, '/media-library', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [__CLASS__, 'get_items'],
                'permission_callback' => [__CLASS__, 'check_read_permission'],
                'args' => self::get_collection_params(),
            ],
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => [__CLASS__, 'create_item'],
                'permission_callback' => [__CLASS__, 'check_create_permission'],
            ],
        ]);

        // Single media item
        register_rest_route(self::NAMESPACE, '/media-library/(?P<id>\d+)', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [__CLASS__, 'get_item'],
                'permission_callback' => [__CLASS__, 'check_item_permission'],
            ],
            [
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => [__CLASS__, 'update_item'],
                'permission_callback' => [__CLASS__, 'check_item_permission'],
            ],
            [
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => [__CLASS__, 'delete_item'],
                'permission_callback' => [__CLASS__, 'check_item_permission'],
            ],
        ]);

        // Brand kit linking
        register_rest_route(self::NAMESPACE, '/media-library/(?P<id>\d+)/brand-kits', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [__CLASS__, 'get_linked_brand_kits'],
                'permission_callback' => [__CLASS__, 'check_item_permission'],
            ],
        ]);

        register_rest_route(self::NAMESPACE, '/media-library/(?P<id>\d+)/brand-kits/(?P<brand_kit_id>\d+)', [
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => [__CLASS__, 'link_to_brand_kit'],
                'permission_callback' => [__CLASS__, 'check_link_permission'],
            ],
            [
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => [__CLASS__, 'update_link'],
                'permission_callback' => [__CLASS__, 'check_link_permission'],
            ],
            [
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => [__CLASS__, 'unlink_from_brand_kit'],
                'permission_callback' => [__CLASS__, 'check_link_permission'],
            ],
        ]);

        // Get media for a specific brand kit
        register_rest_route(self::NAMESPACE, '/brand-kits/(?P<brand_kit_id>\d+)/media-library', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [__CLASS__, 'get_brand_kit_media'],
                'permission_callback' => [__CLASS__, 'check_brand_kit_read_permission'],
            ],
        ]);

        // Schema endpoint
        register_rest_route(self::NAMESPACE, '/media-library/schema', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [__CLASS__, 'get_schema'],
                'permission_callback' => '__return_true',
            ],
        ]);
    }

    /**
     * Get collection params for list endpoint
     */
    private static function get_collection_params() {
        return [
            'category' => [
                'type' => 'string',
                'enum' => array_keys(GMKB_Media_Library_Schema::get_categories()),
            ],
            'per_page' => [
                'type' => 'integer',
                'default' => -1,
                'minimum' => -1,
                'maximum' => 100,
            ],
            'page' => [
                'type' => 'integer',
                'default' => 1,
                'minimum' => 1,
            ],
        ];
    }

    /**
     * Get all media for current user
     */
    public static function get_items($request) {
        $repository = GMKB_Media_Library_Repository::get_instance();
        $user_id = get_current_user_id();

        $args = [
            'category' => $request->get_param('category'),
            'limit' => (int) $request->get_param('per_page'),
            'offset' => max(0, ((int) $request->get_param('page') - 1) * (int) $request->get_param('per_page')),
        ];

        if ($args['limit'] === -1) {
            $args['limit'] = 0;
            $args['offset'] = 0;
        }

        $items = $repository->get_for_user($user_id, $args);
        $total = $repository->get_count_for_user($user_id, $args['category']);

        $response = rest_ensure_response($items);
        $response->header('X-WP-Total', $total);

        return $response;
    }

    /**
     * Get a single media item
     */
    public static function get_item($request) {
        $repository = GMKB_Media_Library_Repository::get_instance();
        $item = $repository->get((int) $request->get_param('id'));

        if (!$item) {
            return new WP_Error('not_found', __('Media not found', 'gmkb'), ['status' => 404]);
        }

        // Include linked brand kits
        $item['linked_brand_kits'] = $repository->get_linked_brand_kits($item['id']);

        return rest_ensure_response($item);
    }

    /**
     * Create a new media item
     */
    public static function create_item($request) {
        $repository = GMKB_Media_Library_Repository::get_instance();
        $user_id = get_current_user_id();

        $data = [
            'media_id' => $request->get_param('media_id'),
            'category' => $request->get_param('category') ?: 'photo',
            'label' => $request->get_param('label') ?: '',
            'alt' => $request->get_param('alt') ?: '',
            'tags' => $request->get_param('tags') ?: [],
            'metadata' => $request->get_param('metadata') ?: [],
        ];

        $result = $repository->create($data, $user_id);

        if (is_wp_error($result)) {
            return $result;
        }

        $item = $repository->get($result);

        // If brand_kit_id provided, link to brand kit
        $brand_kit_id = $request->get_param('brand_kit_id');
        if ($brand_kit_id) {
            $repository->link_to_brand_kit($result, $brand_kit_id, [
                'is_primary' => $request->get_param('is_primary') ?: false,
            ]);
            $item['linked_brand_kits'] = [$brand_kit_id];
        }

        return rest_ensure_response($item);
    }

    /**
     * Update a media item
     */
    public static function update_item($request) {
        $repository = GMKB_Media_Library_Repository::get_instance();
        $user_id = get_current_user_id();
        $id = (int) $request->get_param('id');

        $data = [];

        if ($request->has_param('category')) {
            $data['category'] = $request->get_param('category');
        }
        if ($request->has_param('label')) {
            $data['label'] = $request->get_param('label');
        }
        if ($request->has_param('alt')) {
            $data['alt'] = $request->get_param('alt');
        }
        if ($request->has_param('tags')) {
            $data['tags'] = $request->get_param('tags');
        }
        if ($request->has_param('metadata')) {
            $data['metadata'] = $request->get_param('metadata');
        }

        $result = $repository->update($id, $data, $user_id);

        if (is_wp_error($result)) {
            return $result;
        }

        $item = $repository->get($id);
        $item['linked_brand_kits'] = $repository->get_linked_brand_kits($id);

        return rest_ensure_response($item);
    }

    /**
     * Delete a media item
     */
    public static function delete_item($request) {
        $repository = GMKB_Media_Library_Repository::get_instance();
        $user_id = get_current_user_id();
        $id = (int) $request->get_param('id');

        $result = $repository->delete($id, $user_id);

        if (is_wp_error($result)) {
            return $result;
        }

        return rest_ensure_response(['deleted' => true, 'id' => $id]);
    }

    /**
     * Get brand kits linked to a media item
     */
    public static function get_linked_brand_kits($request) {
        $repository = GMKB_Media_Library_Repository::get_instance();
        $id = (int) $request->get_param('id');

        $brand_kit_ids = $repository->get_linked_brand_kits($id);

        // Get brand kit details
        $brand_kits = [];
        foreach ($brand_kit_ids as $kit_id) {
            $post = get_post($kit_id);
            if ($post) {
                $brand_kits[] = [
                    'id' => (int) $kit_id,
                    'name' => $post->post_title,
                ];
            }
        }

        return rest_ensure_response($brand_kits);
    }

    /**
     * Link media to a brand kit
     */
    public static function link_to_brand_kit($request) {
        $repository = GMKB_Media_Library_Repository::get_instance();
        $media_id = (int) $request->get_param('id');
        $brand_kit_id = (int) $request->get_param('brand_kit_id');

        $options = [
            'is_primary' => $request->get_param('is_primary') ?: false,
            'sort_order' => $request->get_param('sort_order'),
        ];

        $result = $repository->link_to_brand_kit($media_id, $brand_kit_id, $options);

        if (is_wp_error($result)) {
            return $result;
        }

        return rest_ensure_response([
            'linked' => true,
            'media_id' => $media_id,
            'brand_kit_id' => $brand_kit_id,
            'link_id' => $result,
        ]);
    }

    /**
     * Update link properties
     */
    public static function update_link($request) {
        $repository = GMKB_Media_Library_Repository::get_instance();
        $media_id = (int) $request->get_param('id');
        $brand_kit_id = (int) $request->get_param('brand_kit_id');

        $data = [];
        if ($request->has_param('is_primary')) {
            $data['is_primary'] = $request->get_param('is_primary');
        }
        if ($request->has_param('sort_order')) {
            $data['sort_order'] = $request->get_param('sort_order');
        }

        $result = $repository->update_link($media_id, $brand_kit_id, $data);

        return rest_ensure_response([
            'updated' => $result,
            'media_id' => $media_id,
            'brand_kit_id' => $brand_kit_id,
        ]);
    }

    /**
     * Unlink media from a brand kit
     */
    public static function unlink_from_brand_kit($request) {
        $repository = GMKB_Media_Library_Repository::get_instance();
        $media_id = (int) $request->get_param('id');
        $brand_kit_id = (int) $request->get_param('brand_kit_id');

        $result = $repository->unlink_from_brand_kit($media_id, $brand_kit_id);

        return rest_ensure_response([
            'unlinked' => $result,
            'media_id' => $media_id,
            'brand_kit_id' => $brand_kit_id,
        ]);
    }

    /**
     * Get media for a specific brand kit
     */
    public static function get_brand_kit_media($request) {
        $repository = GMKB_Media_Library_Repository::get_instance();
        $brand_kit_id = (int) $request->get_param('brand_kit_id');

        $items = $repository->get_for_brand_kit($brand_kit_id);

        return rest_ensure_response($items);
    }

    /**
     * Get schema
     */
    public static function get_schema($request) {
        return rest_ensure_response([
            'categories' => GMKB_Media_Library_Schema::get_categories(),
        ]);
    }

    /**
     * Permission callbacks
     */
    public static function check_read_permission($request) {
        return is_user_logged_in();
    }

    public static function check_create_permission($request) {
        return current_user_can('edit_posts');
    }

    public static function check_item_permission($request) {
        if (!is_user_logged_in()) {
            return false;
        }

        $repository = GMKB_Media_Library_Repository::get_instance();
        $item = $repository->get((int) $request->get_param('id'));

        if (!$item) {
            return false;
        }

        // Owner can access
        if ((int) $item['user_id'] === get_current_user_id()) {
            return true;
        }

        // Admins can access
        if (current_user_can('edit_others_posts')) {
            return true;
        }

        return false;
    }

    public static function check_link_permission($request) {
        if (!self::check_item_permission($request)) {
            return false;
        }

        // Also verify access to brand kit
        $brand_kit_id = (int) $request->get_param('brand_kit_id');
        $post = get_post($brand_kit_id);

        if (!$post || $post->post_type !== GMKB_Brand_Kit_Schema::POST_TYPE) {
            return false;
        }

        // Owner or admin can link
        if ((int) $post->post_author === get_current_user_id()) {
            return true;
        }

        return current_user_can('edit_others_posts');
    }

    public static function check_brand_kit_read_permission($request) {
        if (!is_user_logged_in()) {
            return false;
        }

        $brand_kit_id = (int) $request->get_param('brand_kit_id');
        $post = get_post($brand_kit_id);

        if (!$post || $post->post_type !== GMKB_Brand_Kit_Schema::POST_TYPE) {
            return false;
        }

        // Owner can read
        if ((int) $post->post_author === get_current_user_id()) {
            return true;
        }

        // Admins can read
        return current_user_can('edit_others_posts');
    }
}

// Register routes
add_action('rest_api_init', ['GMKB_Media_Library_API', 'register_routes']);
