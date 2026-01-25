<?php
/**
 * Brand Kit REST API Controller
 *
 * Handles REST API endpoints for Brand Kit CRUD operations.
 *
 * @package GMKB
 * @since 3.1.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Brand_Kit_API {

    const NAMESPACE = 'gmkb/v2';

    /**
     * Initialize - register routes on rest_api_init
     */
    public static function init() {
        add_action('rest_api_init', [__CLASS__, 'register_routes']);
    }

    /**
     * Register REST routes
     */
    public static function register_routes() {
        // List and create brand kits
        register_rest_route(self::NAMESPACE, '/brand-kits', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [__CLASS__, 'get_brand_kits'],
                'permission_callback' => [__CLASS__, 'check_read_permission'],
            ],
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => [__CLASS__, 'create_brand_kit'],
                'permission_callback' => [__CLASS__, 'check_create_permission'],
                'args' => self::get_create_args(),
            ],
        ]);

        // Single brand kit operations
        register_rest_route(self::NAMESPACE, '/brand-kits/(?P<id>\d+)', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [__CLASS__, 'get_brand_kit'],
                'permission_callback' => [__CLASS__, 'check_item_read_permission'],
                'args' => [
                    'id' => [
                        'validate_callback' => function($param) {
                            return is_numeric($param);
                        },
                    ],
                ],
            ],
            [
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => [__CLASS__, 'update_brand_kit'],
                'permission_callback' => [__CLASS__, 'check_edit_permission'],
                'args' => self::get_update_args(),
            ],
            [
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => [__CLASS__, 'delete_brand_kit'],
                'permission_callback' => [__CLASS__, 'check_delete_permission'],
            ],
        ]);

        // Duplicate brand kit
        register_rest_route(self::NAMESPACE, '/brand-kits/(?P<id>\d+)/duplicate', [
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => [__CLASS__, 'duplicate_brand_kit'],
                'permission_callback' => [__CLASS__, 'check_item_read_permission'],
            ],
        ]);

        // Brand kit usage
        register_rest_route(self::NAMESPACE, '/brand-kits/(?P<id>\d+)/usage', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [__CLASS__, 'get_brand_kit_usage'],
                'permission_callback' => [__CLASS__, 'check_item_read_permission'],
            ],
        ]);

        // Brand kit media
        register_rest_route(self::NAMESPACE, '/brand-kits/(?P<id>\d+)/media', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [__CLASS__, 'get_brand_kit_media'],
                'permission_callback' => [__CLASS__, 'check_item_read_permission'],
                'args' => [
                    'category' => [
                        'type' => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ],
                    'tags' => [
                        'type' => 'array',
                        'items' => ['type' => 'string'],
                    ],
                ],
            ],
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => [__CLASS__, 'add_brand_kit_media'],
                'permission_callback' => [__CLASS__, 'check_edit_permission'],
                'args' => self::get_media_args(),
            ],
        ]);

        // Single media entry operations
        register_rest_route(self::NAMESPACE, '/brand-kits/(?P<id>\d+)/media/(?P<media_id>\d+)', [
            [
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => [__CLASS__, 'update_brand_kit_media'],
                'permission_callback' => [__CLASS__, 'check_edit_permission'],
            ],
            [
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => [__CLASS__, 'remove_brand_kit_media'],
                'permission_callback' => [__CLASS__, 'check_edit_permission'],
            ],
        ]);

        // Bulk media operations
        register_rest_route(self::NAMESPACE, '/brand-kits/(?P<id>\d+)/media/reorder', [
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => [__CLASS__, 'reorder_brand_kit_media'],
                'permission_callback' => [__CLASS__, 'check_edit_permission'],
            ],
        ]);

        // Schema/metadata endpoints
        register_rest_route(self::NAMESPACE, '/brand-kits/schema', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [__CLASS__, 'get_schema'],
                'permission_callback' => '__return_true',
            ],
        ]);

        // Migrate profile branding to brand kit
        register_rest_route(self::NAMESPACE, '/profiles/(?P<profile_id>\d+)/migrate-branding', [
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => [__CLASS__, 'migrate_profile_branding'],
                'permission_callback' => [__CLASS__, 'check_profile_edit_permission'],
                'args' => [
                    'profile_id' => [
                        'validate_callback' => function($param) {
                            return is_numeric($param);
                        },
                    ],
                    'name' => [
                        'type' => 'string',
                        'default' => '',
                        'sanitize_callback' => 'sanitize_text_field',
                    ],
                ],
            ],
        ]);
    }

    /**
     * Get all brand kits for current user
     */
    public static function get_brand_kits($request) {
        $user_id = get_current_user_id();
        $repository = GMKB_Brand_Kit_Repository::get_instance();

        // Get organization ID if user is part of one (future feature)
        $organization_id = self::get_user_organization_id($user_id);

        $brand_kits = $repository->get_available_for_user($user_id, $organization_id);

        return new WP_REST_Response([
            'success' => true,
            'data' => $brand_kits,
            'meta' => [
                'total' => count($brand_kits),
            ],
        ], 200);
    }

    /**
     * Get single brand kit
     */
    public static function get_brand_kit($request) {
        $id = (int) $request->get_param('id');
        $repository = GMKB_Brand_Kit_Repository::get_instance();

        $brand_kit = $repository->get($id);

        if (!$brand_kit) {
            return new WP_REST_Response([
                'success' => false,
                'message' => __('Brand kit not found', 'gmkb'),
            ], 404);
        }

        // Include full media
        $brand_kit['media'] = $repository->get_media($id);

        return new WP_REST_Response([
            'success' => true,
            'data' => $brand_kit,
        ], 200);
    }

    /**
     * Create new brand kit
     */
    public static function create_brand_kit($request) {
        $user_id = get_current_user_id();
        $repository = GMKB_Brand_Kit_Repository::get_instance();

        $data = [
            'name' => $request->get_param('name'),
        ];

        // Add color fields
        foreach (GMKB_Brand_Kit_Schema::get_color_fields() as $key => $config) {
            if ($request->has_param($key)) {
                $data[$key] = $request->get_param($key);
            }
        }

        // Add typography fields
        foreach (GMKB_Brand_Kit_Schema::get_typography_fields() as $key => $config) {
            if ($request->has_param($key)) {
                $data[$key] = $request->get_param($key);
            }
        }

        // Add system fields
        if ($request->has_param('visibility')) {
            $data['visibility'] = $request->get_param('visibility');
        }
        if ($request->has_param('organization_id')) {
            $data['organization_id'] = $request->get_param('organization_id');
        }

        $result = $repository->create($data, $user_id);

        if (is_wp_error($result)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => $result->get_error_message(),
            ], 400);
        }

        $brand_kit = $repository->get($result);

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Brand kit created successfully', 'gmkb'),
            'data' => $brand_kit,
        ], 201);
    }

    /**
     * Update brand kit
     */
    public static function update_brand_kit($request) {
        $id = (int) $request->get_param('id');
        $repository = GMKB_Brand_Kit_Repository::get_instance();

        $data = [];

        // Name
        if ($request->has_param('name')) {
            $data['name'] = $request->get_param('name');
        }

        // Color fields
        foreach (GMKB_Brand_Kit_Schema::get_color_fields() as $key => $config) {
            if ($request->has_param($key)) {
                $data[$key] = $request->get_param($key);
            }
        }

        // Typography fields
        foreach (GMKB_Brand_Kit_Schema::get_typography_fields() as $key => $config) {
            if ($request->has_param($key)) {
                $data[$key] = $request->get_param($key);
            }
        }

        // System fields
        if ($request->has_param('visibility')) {
            $data['visibility'] = $request->get_param('visibility');
        }

        $result = $repository->update($id, $data);

        if (is_wp_error($result)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => $result->get_error_message(),
            ], 400);
        }

        $brand_kit = $repository->get($id);

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Brand kit updated successfully', 'gmkb'),
            'data' => $brand_kit,
        ], 200);
    }

    /**
     * Delete brand kit
     */
    public static function delete_brand_kit($request) {
        $id = (int) $request->get_param('id');
        $force = $request->get_param('force') === true;
        $repository = GMKB_Brand_Kit_Repository::get_instance();

        $result = $repository->delete($id, $force);

        if (is_wp_error($result)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => $result->get_error_message(),
            ], 400);
        }

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Brand kit deleted successfully', 'gmkb'),
        ], 200);
    }

    /**
     * Duplicate brand kit
     */
    public static function duplicate_brand_kit($request) {
        $id = (int) $request->get_param('id');
        $user_id = get_current_user_id();
        $repository = GMKB_Brand_Kit_Repository::get_instance();

        $result = $repository->duplicate($id, $user_id);

        if (is_wp_error($result)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => $result->get_error_message(),
            ], 400);
        }

        $brand_kit = $repository->get($result);

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Brand kit duplicated successfully', 'gmkb'),
            'data' => $brand_kit,
        ], 201);
    }

    /**
     * Get brand kit usage
     */
    public static function get_brand_kit_usage($request) {
        $id = (int) $request->get_param('id');
        $repository = GMKB_Brand_Kit_Repository::get_instance();

        $usage = $repository->get_usage($id);

        return new WP_REST_Response([
            'success' => true,
            'data' => $usage,
        ], 200);
    }

    /**
     * Get brand kit media
     */
    public static function get_brand_kit_media($request) {
        $id = (int) $request->get_param('id');
        $category = $request->get_param('category');
        $tags = $request->get_param('tags');

        $repository = GMKB_Brand_Kit_Repository::get_instance();

        if (!empty($tags)) {
            $media = $repository->get_media_by_tags($id, $tags);
        } else {
            $media = $repository->get_media($id, $category);
        }

        // Group by category for easier frontend consumption
        $grouped = [];
        foreach ($media as $entry) {
            $cat = $entry['category'];
            if (!isset($grouped[$cat])) {
                $grouped[$cat] = [];
            }
            $grouped[$cat][] = $entry;
        }

        return new WP_REST_Response([
            'success' => true,
            'data' => [
                'items' => $media,
                'grouped' => $grouped,
                'total' => count($media),
            ],
        ], 200);
    }

    /**
     * Add media to brand kit
     */
    public static function add_brand_kit_media($request) {
        $id = (int) $request->get_param('id');
        $repository = GMKB_Brand_Kit_Repository::get_instance();

        $media_data = [
            'media_id' => $request->get_param('media_id'),
            'category' => $request->get_param('category') ?: 'photo',
            'tags' => $request->get_param('tags') ?: [],
            'label' => $request->get_param('label') ?: '',
            'is_primary' => $request->get_param('is_primary') ?: false,
            'metadata' => $request->get_param('metadata') ?: [],
        ];

        $result = $repository->add_media($id, $media_data);

        if (is_wp_error($result)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => $result->get_error_message(),
            ], 400);
        }

        // Get updated media list
        $media = $repository->get_media($id);

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Media added to brand kit', 'gmkb'),
            'data' => [
                'entry_id' => $result,
                'media' => $media,
            ],
        ], 201);
    }

    /**
     * Update brand kit media entry
     */
    public static function update_brand_kit_media($request) {
        $brand_kit_id = (int) $request->get_param('id');
        $media_entry_id = (int) $request->get_param('media_id');
        $repository = GMKB_Brand_Kit_Repository::get_instance();

        $data = [];
        if ($request->has_param('category')) {
            $data['category'] = $request->get_param('category');
        }
        if ($request->has_param('tags')) {
            $data['tags'] = $request->get_param('tags');
        }
        if ($request->has_param('label')) {
            $data['label'] = $request->get_param('label');
        }
        if ($request->has_param('is_primary')) {
            $data['is_primary'] = $request->get_param('is_primary');
        }
        if ($request->has_param('metadata')) {
            $data['metadata'] = $request->get_param('metadata');
        }

        $result = $repository->update_media($media_entry_id, $data, $brand_kit_id);

        if (is_wp_error($result)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => $result->get_error_message(),
            ], 400);
        }

        $media = $repository->get_media($brand_kit_id);

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Media updated', 'gmkb'),
            'data' => [
                'media' => $media,
            ],
        ], 200);
    }

    /**
     * Remove media from brand kit
     */
    public static function remove_brand_kit_media($request) {
        $brand_kit_id = (int) $request->get_param('id');
        $media_entry_id = (int) $request->get_param('media_id');
        $repository = GMKB_Brand_Kit_Repository::get_instance();

        $result = $repository->remove_media($media_entry_id, $brand_kit_id);

        if (is_wp_error($result)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => $result->get_error_message(),
            ], 400);
        }

        $media = $repository->get_media($brand_kit_id);

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Media removed from brand kit', 'gmkb'),
            'data' => [
                'media' => $media,
            ],
        ], 200);
    }

    /**
     * Reorder brand kit media
     */
    public static function reorder_brand_kit_media($request) {
        $brand_kit_id = (int) $request->get_param('id');
        $order = $request->get_param('order'); // Array of {id, sort_order}
        $repository = GMKB_Brand_Kit_Repository::get_instance();

        if (!is_array($order)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => __('Invalid order data', 'gmkb'),
            ], 400);
        }

        // Use bulk reorder for efficiency and security
        $result = $repository->reorder_media($brand_kit_id, $order);

        if (is_wp_error($result)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => $result->get_error_message(),
            ], 400);
        }

        $media = $repository->get_media($brand_kit_id);

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Media reordered', 'gmkb'),
            'data' => [
                'media' => $media,
            ],
        ], 200);
    }

    /**
     * Get schema/metadata
     */
    public static function get_schema($request) {
        return new WP_REST_Response([
            'success' => true,
            'data' => [
                'colors' => GMKB_Brand_Kit_Schema::get_color_fields(),
                'typography' => GMKB_Brand_Kit_Schema::get_typography_fields(),
                'media_categories' => GMKB_Brand_Kit_Schema::get_media_categories(),
                'visibility_options' => GMKB_Brand_Kit_Schema::get_visibility_options(),
                'defaults' => GMKB_Brand_Kit_Schema::get_defaults(),
            ],
        ], 200);
    }

    /**
     * Migrate profile branding to a new brand kit
     */
    public static function migrate_profile_branding($request) {
        $profile_id = (int) $request->get_param('profile_id');
        $name = $request->get_param('name');

        // Check if migration class exists
        if (!class_exists('GMKB_Brand_Kit_Migration')) {
            return new WP_REST_Response([
                'success' => false,
                'message' => __('Migration class not available', 'gmkb'),
            ], 500);
        }

        // Use custom name if provided
        if (!empty($name)) {
            add_filter('gmkb_brand_kit_migration_name', function($default_name, $profile) use ($name, $profile_id) {
                if ($profile->ID === $profile_id) {
                    return $name;
                }
                return $default_name;
            }, 10, 2);
        }

        // Run migration for this single profile
        $brand_kit_id = GMKB_Brand_Kit_Migration::migrate_single_profile($profile_id);

        if (is_wp_error($brand_kit_id)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => $brand_kit_id->get_error_message(),
            ], 400);
        }

        if (!$brand_kit_id) {
            return new WP_REST_Response([
                'success' => false,
                'message' => __('No branding data to migrate', 'gmkb'),
            ], 400);
        }

        // Get the created brand kit
        $repository = GMKB_Brand_Kit_Repository::get_instance();
        $brand_kit = $repository->get($brand_kit_id);
        $brand_kit['media'] = $repository->get_media($brand_kit_id);

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Branding data migrated successfully', 'gmkb'),
            'data' => $brand_kit,
        ], 201);
    }

    /**
     * Permission callbacks
     */
    public static function check_read_permission($request) {
        return is_user_logged_in();
    }

    /**
     * Check permission for reading a single brand kit item
     * Prevents IDOR by verifying ownership or access rights
     */
    public static function check_item_read_permission($request) {
        if (!is_user_logged_in()) {
            return false;
        }

        $id = (int) $request->get_param('id');
        if (!$id) {
            return false;
        }

        return self::user_can_access_brand_kit($id);
    }

    /**
     * Check permission to edit a profile (for migration endpoint)
     */
    public static function check_profile_edit_permission($request) {
        if (!current_user_can('edit_posts')) {
            return false;
        }

        $profile_id = (int) $request->get_param('profile_id');
        if (!$profile_id) {
            return false;
        }

        $post = get_post($profile_id);
        if (!$post || $post->post_type !== 'guests') {
            return false;
        }

        // Check if user is the author or has edit capabilities
        $user_id = get_current_user_id();
        if ((int) $post->post_author === $user_id) {
            return true;
        }

        return current_user_can('edit_post', $profile_id);
    }

    public static function check_create_permission($request) {
        return current_user_can('edit_posts');
    }

    public static function check_edit_permission($request) {
        if (!current_user_can('edit_posts')) {
            return false;
        }

        $id = (int) $request->get_param('id');
        if (!$id) {
            return true; // Creating new
        }

        return self::user_can_edit_brand_kit($id);
    }

    public static function check_delete_permission($request) {
        if (!current_user_can('edit_posts')) {
            return false;
        }

        $id = (int) $request->get_param('id');
        return self::user_can_edit_brand_kit($id);
    }

    /**
     * Check if current user can access (read) a brand kit
     */
    private static function user_can_access_brand_kit($brand_kit_id) {
        $user_id = get_current_user_id();
        $post = get_post($brand_kit_id);

        if (!$post || $post->post_type !== GMKB_Brand_Kit_Schema::POST_TYPE) {
            return false;
        }

        // Author can always access
        if ((int) $post->post_author === $user_id) {
            return true;
        }

        // Check organization access (future feature)
        $organization_id = get_post_meta($brand_kit_id, 'organization_id', true);
        if ($organization_id) {
            $user_org_id = self::get_user_organization_id($user_id);
            if ($user_org_id && $user_org_id === (int) $organization_id) {
                return true;
            }
        }

        // Check visibility - public brand kits can be read by anyone
        $visibility = get_post_meta($brand_kit_id, 'visibility', true);
        if ($visibility === 'public') {
            return true;
        }

        // Admins can access all
        return current_user_can('manage_options');
    }

    /**
     * Check if current user can edit a brand kit
     */
    private static function user_can_edit_brand_kit($brand_kit_id) {
        $user_id = get_current_user_id();
        $post = get_post($brand_kit_id);

        if (!$post || $post->post_type !== GMKB_Brand_Kit_Schema::POST_TYPE) {
            return false;
        }

        // Author can always edit
        if ((int) $post->post_author === $user_id) {
            return true;
        }

        // Check organization access (future feature)
        $organization_id = get_post_meta($brand_kit_id, 'organization_id', true);
        if ($organization_id) {
            $user_org_id = self::get_user_organization_id($user_id);
            if ($user_org_id && $user_org_id === (int) $organization_id) {
                // User is in the same organization
                // TODO: Check role-based permissions
                return true;
            }
        }

        // Admins can edit all
        return current_user_can('manage_options');
    }

    /**
     * Get user's organization ID (placeholder for future agency feature)
     */
    private static function get_user_organization_id($user_id) {
        // TODO: Implement when agency feature is built
        // For now, return null (no organization)
        return null;
    }

    /**
     * Argument definitions for create endpoint
     */
    private static function get_create_args() {
        $args = [
            'name' => [
                'type' => 'string',
                'required' => true,
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'visibility' => [
                'type' => 'string',
                'default' => 'private',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'organization_id' => [
                'type' => 'integer',
                'default' => 0,
                'sanitize_callback' => 'absint',
            ],
        ];

        // Add color fields
        foreach (GMKB_Brand_Kit_Schema::get_color_fields() as $key => $config) {
            $args[$key] = [
                'type' => 'string',
                'default' => $config['default'],
                'sanitize_callback' => 'sanitize_hex_color',
            ];
        }

        // Add typography fields
        foreach (GMKB_Brand_Kit_Schema::get_typography_fields() as $key => $config) {
            $args[$key] = [
                'type' => 'string',
                'default' => $config['default'],
                'sanitize_callback' => 'sanitize_text_field',
            ];
        }

        return $args;
    }

    /**
     * Argument definitions for update endpoint
     */
    private static function get_update_args() {
        $args = self::get_create_args();
        $args['name']['required'] = false;
        return $args;
    }

    /**
     * Argument definitions for media endpoints
     */
    private static function get_media_args() {
        return [
            'media_id' => [
                'type' => 'integer',
                'required' => true,
                'sanitize_callback' => 'absint',
            ],
            'category' => [
                'type' => 'string',
                'default' => 'photo',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'tags' => [
                'type' => 'array',
                'default' => [],
                'items' => ['type' => 'string'],
            ],
            'label' => [
                'type' => 'string',
                'default' => '',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'is_primary' => [
                'type' => 'boolean',
                'default' => false,
            ],
            'metadata' => [
                'type' => 'object',
                'default' => [],
            ],
        ];
    }
}
