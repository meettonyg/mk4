<?php
/**
 * REST API endpoints for Offers
 *
 * Provides CRUD endpoints for the gmkb_offer post type.
 * Implements relational offer management for Media Kits.
 *
 * @package GMKB
 * @since 3.1.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Offers_API {

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
        // List all offers for current user
        register_rest_route(self::NAMESPACE, '/offers', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [__CLASS__, 'list_offers'],
                'permission_callback' => [__CLASS__, 'check_list_permission'],
                'args' => [
                    'status' => [
                        'default' => 'any',
                        'sanitize_callback' => 'sanitize_text_field',
                    ],
                    'type' => [
                        'default' => '',
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
                'callback' => [__CLASS__, 'create_offer'],
                'permission_callback' => [__CLASS__, 'check_list_permission'],
            ],
        ]);

        // Single offer CRUD
        register_rest_route(self::NAMESPACE, '/offers/(?P<id>\d+)', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [__CLASS__, 'get_offer'],
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
                'callback' => [__CLASS__, 'update_offer'],
                'permission_callback' => [__CLASS__, 'check_edit_permission'],
            ],
            [
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => [__CLASS__, 'delete_offer'],
                'permission_callback' => [__CLASS__, 'check_edit_permission'],
            ],
        ]);

        // Track offer clicks (semi-public - no auth required for increment)
        register_rest_route(self::NAMESPACE, '/offers/(?P<id>\d+)/track', [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [__CLASS__, 'track_click'],
            'permission_callback' => '__return_true', // Public tracking
            'args' => [
                'id' => [
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                ],
            ],
        ]);

        // Duplicate offer
        register_rest_route(self::NAMESPACE, '/offers/(?P<id>\d+)/duplicate', [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [__CLASS__, 'duplicate_offer'],
            'permission_callback' => [__CLASS__, 'check_read_permission'],
        ]);

        // Profile-Offer relationships
        register_rest_route(self::NAMESPACE, '/profiles/(?P<id>\d+)/offers', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [__CLASS__, 'get_profile_offers'],
                'permission_callback' => [__CLASS__, 'check_profile_read_permission'],
            ],
            [
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => [__CLASS__, 'update_profile_offers'],
                'permission_callback' => [__CLASS__, 'check_profile_edit_permission'],
            ],
        ]);

        // Link/unlink single offer to profile
        register_rest_route(self::NAMESPACE, '/profiles/(?P<profile_id>\d+)/offers/(?P<offer_id>\d+)', [
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => [__CLASS__, 'link_offer_to_profile'],
                'permission_callback' => [__CLASS__, 'check_profile_edit_permission_by_profile_id'],
            ],
            [
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => [__CLASS__, 'unlink_offer_from_profile'],
                'permission_callback' => [__CLASS__, 'check_profile_edit_permission_by_profile_id'],
            ],
        ]);
    }

    // =========================================================================
    // Permission Callbacks
    // =========================================================================

    /**
     * Check if user can list offers
     */
    public static function check_list_permission($request) {
        if (!is_user_logged_in()) {
            return new WP_Error('unauthorized', 'Authentication required', ['status' => 401]);
        }
        return true;
    }

    /**
     * Check if user can read the offer
     */
    public static function check_read_permission($request) {
        $post_id = (int) $request->get_param('id');
        $post = get_post($post_id);

        if (!$post || $post->post_type !== 'gmkb_offer') {
            return new WP_Error('not_found', 'Offer not found', ['status' => 404]);
        }

        if (!is_user_logged_in()) {
            return new WP_Error('unauthorized', 'Authentication required', ['status' => 401]);
        }

        $user_id = get_current_user_id();

        // Admins can read any offer
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

        return new WP_Error('forbidden', 'You do not have permission to view this offer', ['status' => 403]);
    }

    /**
     * Check if user can edit the offer
     */
    public static function check_edit_permission($request) {
        $post_id = (int) $request->get_param('id');
        $post = get_post($post_id);

        if (!$post || $post->post_type !== 'gmkb_offer') {
            return new WP_Error('not_found', 'Offer not found', ['status' => 404]);
        }

        if (!is_user_logged_in()) {
            return new WP_Error('unauthorized', 'Authentication required', ['status' => 401]);
        }

        $user_id = get_current_user_id();

        // Admins can edit any offer
        if (current_user_can('edit_others_posts')) {
            return true;
        }

        // Check ownership (post_author)
        if ((int) $post->post_author === $user_id) {
            return true;
        }

        return new WP_Error('forbidden', 'You do not have permission to edit this offer', ['status' => 403]);
    }

    /**
     * Check if user can read profile (for profile-offer endpoints)
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
     * Check profile permission by profile_id param
     */
    public static function check_profile_edit_permission_by_profile_id($request) {
        $profile_id = (int) $request->get_param('profile_id');
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
     * List offers for current user
     */
    public static function list_offers($request) {
        $user_id = get_current_user_id();
        $status = $request->get_param('status');
        $type = $request->get_param('type');
        $per_page = $request->get_param('per_page');
        $page = $request->get_param('page');

        $args = [
            'post_type' => 'gmkb_offer',
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

        // Filter by offer type taxonomy
        if ($type) {
            $args['tax_query'] = [
                [
                    'taxonomy' => 'offer_type',
                    'field' => 'slug',
                    'terms' => $type,
                ],
            ];
        }

        $query = new WP_Query($args);
        $offers = [];

        foreach ($query->posts as $post) {
            $offers[] = self::format_offer($post, 'list');
        }

        return rest_ensure_response([
            'success' => true,
            'offers' => $offers,
            'total' => (int) $query->found_posts,
            'pages' => (int) $query->max_num_pages,
            'page' => $page,
        ]);
    }

    /**
     * Get single offer (full detail)
     */
    public static function get_offer($request) {
        $post_id = (int) $request->get_param('id');
        $post = get_post($post_id);

        if (!$post) {
            return new WP_Error('not_found', 'Offer not found', ['status' => 404]);
        }

        return rest_ensure_response([
            'success' => true,
            'offer' => self::format_offer($post, 'detail'),
        ]);
    }

    /**
     * Create new offer
     */
    public static function create_offer($request) {
        $body = $request->get_json_params();
        $user_id = get_current_user_id();

        // Create post
        $post_data = [
            'post_type' => 'gmkb_offer',
            'post_status' => $body['status'] ?? 'draft',
            'post_title' => sanitize_text_field($body['title'] ?? 'New Offer'),
            'post_content' => wp_kses_post($body['description'] ?? ''),
            'post_author' => $user_id,
        ];

        $post_id = wp_insert_post($post_data, true);

        if (is_wp_error($post_id)) {
            return $post_id;
        }

        // Set offer type taxonomy
        if (!empty($body['type'])) {
            wp_set_object_terms($post_id, sanitize_text_field($body['type']), 'offer_type');
        }

        // Save meta fields
        self::save_offer_meta($post_id, $body);

        $post = get_post($post_id);

        return rest_ensure_response([
            'success' => true,
            'offer' => self::format_offer($post, 'detail'),
            'message' => 'Offer created successfully',
        ]);
    }

    /**
     * Update offer
     */
    public static function update_offer($request) {
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

        // Update offer type taxonomy
        if (isset($body['type'])) {
            wp_set_object_terms($post_id, sanitize_text_field($body['type']), 'offer_type');
        }

        // Update meta fields
        self::save_offer_meta($post_id, $body);

        $post = get_post($post_id);

        return rest_ensure_response([
            'success' => true,
            'offer' => self::format_offer($post, 'detail'),
            'message' => 'Offer updated successfully',
        ]);
    }

    /**
     * Delete offer (move to trash)
     */
    public static function delete_offer($request) {
        $post_id = (int) $request->get_param('id');

        $result = wp_trash_post($post_id);

        if (!$result) {
            return new WP_Error('delete_failed', 'Failed to delete offer', ['status' => 500]);
        }

        return rest_ensure_response([
            'success' => true,
            'message' => 'Offer moved to trash',
        ]);
    }

    /**
     * Track offer click (public endpoint)
     */
    public static function track_click($request) {
        $post_id = (int) $request->get_param('id');
        $post = get_post($post_id);

        if (!$post || $post->post_type !== 'gmkb_offer') {
            return new WP_Error('not_found', 'Offer not found', ['status' => 404]);
        }

        // Increment click counter
        $clicks = (int) get_post_meta($post_id, 'offer_clicks', true);
        update_post_meta($post_id, 'offer_clicks', $clicks + 1);

        return rest_ensure_response([
            'success' => true,
            'clicks' => $clicks + 1,
        ]);
    }

    /**
     * Duplicate offer
     */
    public static function duplicate_offer($request) {
        $post_id = (int) $request->get_param('id');
        $original = get_post($post_id);

        if (!$original) {
            return new WP_Error('not_found', 'Offer not found', ['status' => 404]);
        }

        // Create duplicate post
        $new_post = [
            'post_type' => 'gmkb_offer',
            'post_status' => 'draft',
            'post_title' => $original->post_title . ' (Copy)',
            'post_content' => $original->post_content,
            'post_author' => get_current_user_id(),
        ];

        $new_id = wp_insert_post($new_post, true);

        if (is_wp_error($new_id)) {
            return $new_id;
        }

        // Copy taxonomy terms
        $terms = wp_get_object_terms($post_id, 'offer_type', ['fields' => 'slugs']);
        if (!is_wp_error($terms) && !empty($terms)) {
            wp_set_object_terms($new_id, $terms, 'offer_type');
        }

        // Copy all meta fields
        $meta_keys = [
            'offer_format', 'offer_cta_text', 'offer_url', 'offer_retail_value',
            'offer_image_id', 'offer_expiry_date', 'offer_code',
            'offer_redemption_instructions', 'offer_price_cost', 'offer_discount_percent',
            'offer_quantity_limit', 'offer_scarcity_text', 'offer_video_url',
            'offer_reason', 'offer_notes',
        ];

        foreach ($meta_keys as $key) {
            $value = get_post_meta($post_id, $key, true);
            if ($value !== '') {
                update_post_meta($new_id, $key, $value);
            }
        }

        // Reset clicks to 0
        update_post_meta($new_id, 'offer_clicks', 0);

        $new_post = get_post($new_id);

        return rest_ensure_response([
            'success' => true,
            'offer' => self::format_offer($new_post, 'detail'),
            'message' => 'Offer duplicated successfully',
        ]);
    }

    // =========================================================================
    // Profile-Offer Relationship Endpoints
    // =========================================================================

    /**
     * Get offers linked to a profile
     */
    public static function get_profile_offers($request) {
        $profile_id = (int) $request->get_param('id');

        $offer_ids = get_post_meta($profile_id, 'associated_offers', true);

        if (empty($offer_ids) || !is_array($offer_ids)) {
            return rest_ensure_response([
                'success' => true,
                'offers' => [],
                'total' => 0,
            ]);
        }

        $offers = [];
        foreach ($offer_ids as $offer_id) {
            $post = get_post($offer_id);
            if ($post && $post->post_type === 'gmkb_offer') {
                $offers[] = self::format_offer($post, 'list');
            }
        }

        return rest_ensure_response([
            'success' => true,
            'offers' => $offers,
            'total' => count($offers),
        ]);
    }

    /**
     * Update all offers linked to a profile (replace)
     */
    public static function update_profile_offers($request) {
        $profile_id = (int) $request->get_param('id');
        $body = $request->get_json_params();

        $offer_ids = isset($body['offer_ids']) ? array_map('absint', (array) $body['offer_ids']) : [];

        // Validate all offer IDs exist
        $valid_ids = [];
        foreach ($offer_ids as $offer_id) {
            $post = get_post($offer_id);
            if ($post && $post->post_type === 'gmkb_offer') {
                $valid_ids[] = $offer_id;
            }
        }

        update_post_meta($profile_id, 'associated_offers', $valid_ids);

        return rest_ensure_response([
            'success' => true,
            'offer_ids' => $valid_ids,
            'message' => 'Profile offers updated',
        ]);
    }

    /**
     * Link single offer to profile
     */
    public static function link_offer_to_profile($request) {
        $profile_id = (int) $request->get_param('profile_id');
        $offer_id = (int) $request->get_param('offer_id');

        // Verify offer exists
        $offer = get_post($offer_id);
        if (!$offer || $offer->post_type !== 'gmkb_offer') {
            return new WP_Error('not_found', 'Offer not found', ['status' => 404]);
        }

        $offer_ids = get_post_meta($profile_id, 'associated_offers', true);
        if (!is_array($offer_ids)) {
            $offer_ids = [];
        }

        // Add if not already linked
        if (!in_array($offer_id, $offer_ids)) {
            $offer_ids[] = $offer_id;
            update_post_meta($profile_id, 'associated_offers', $offer_ids);
        }

        return rest_ensure_response([
            'success' => true,
            'message' => 'Offer linked to profile',
            'offer_ids' => $offer_ids,
        ]);
    }

    /**
     * Unlink offer from profile
     */
    public static function unlink_offer_from_profile($request) {
        $profile_id = (int) $request->get_param('profile_id');
        $offer_id = (int) $request->get_param('offer_id');

        $offer_ids = get_post_meta($profile_id, 'associated_offers', true);
        if (!is_array($offer_ids)) {
            $offer_ids = [];
        }

        // Remove the offer ID
        $offer_ids = array_values(array_diff($offer_ids, [$offer_id]));
        update_post_meta($profile_id, 'associated_offers', $offer_ids);

        return rest_ensure_response([
            'success' => true,
            'message' => 'Offer unlinked from profile',
            'offer_ids' => $offer_ids,
        ]);
    }

    // =========================================================================
    // Helper Methods
    // =========================================================================

    /**
     * Save offer meta fields
     */
    private static function save_offer_meta($post_id, $data) {
        $meta_fields = [
            'offer_format' => 'sanitize_text_field',
            'offer_cta_text' => 'sanitize_text_field',
            'offer_url' => 'esc_url_raw',
            'offer_retail_value' => 'floatval',
            'offer_image_id' => 'absint',
            'offer_expiry_date' => 'sanitize_text_field',
            'offer_code' => 'sanitize_text_field',
            'offer_redemption_instructions' => 'wp_kses_post',
            'offer_price_cost' => 'floatval',
            'offer_discount_percent' => 'absint',
            'offer_quantity_limit' => 'absint',
            'offer_scarcity_text' => 'sanitize_text_field',
            'offer_video_url' => 'esc_url_raw',
            'offer_reason' => 'sanitize_text_field',
            'offer_notes' => 'sanitize_textarea_field',
        ];

        foreach ($meta_fields as $field => $sanitize) {
            // Check for field without prefix in input
            $input_key = str_replace('offer_', '', $field);

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
     * Format offer for API response
     *
     * @param WP_Post $post The offer post
     * @param string $context 'list' or 'detail'
     * @return array Formatted offer data
     */
    private static function format_offer($post, $context = 'list') {
        $offer = [
            'id' => $post->ID,
            'title' => $post->post_title,
            'status' => $post->post_status,
            'type' => self::get_offer_type($post->ID),
            'format' => get_post_meta($post->ID, 'offer_format', true),
            'cta_text' => get_post_meta($post->ID, 'offer_cta_text', true),
            'url' => get_post_meta($post->ID, 'offer_url', true),
            'retail_value' => (float) get_post_meta($post->ID, 'offer_retail_value', true),
            'expiry_date' => get_post_meta($post->ID, 'offer_expiry_date', true),
            'clicks' => (int) get_post_meta($post->ID, 'offer_clicks', true),
            'created' => $post->post_date,
            'modified' => $post->post_modified,
        ];

        // Add image (expanded object)
        $image_id = get_post_meta($post->ID, 'offer_image_id', true);
        if ($image_id) {
            $offer['image'] = self::format_image($image_id);
        } else {
            $offer['image'] = null;
        }

        // Add detail fields for full view
        if ($context === 'detail') {
            $offer['description'] = $post->post_content;
            $offer['code'] = get_post_meta($post->ID, 'offer_code', true);
            $offer['redemption_instructions'] = get_post_meta($post->ID, 'offer_redemption_instructions', true);
            $offer['price_cost'] = (float) get_post_meta($post->ID, 'offer_price_cost', true);
            $offer['discount_percent'] = (int) get_post_meta($post->ID, 'offer_discount_percent', true);
            $offer['quantity_limit'] = (int) get_post_meta($post->ID, 'offer_quantity_limit', true);
            $offer['scarcity_text'] = get_post_meta($post->ID, 'offer_scarcity_text', true);
            $offer['video_url'] = get_post_meta($post->ID, 'offer_video_url', true);
            $offer['reason'] = get_post_meta($post->ID, 'offer_reason', true);
            $offer['notes'] = get_post_meta($post->ID, 'offer_notes', true);
            $offer['author'] = (int) $post->post_author;
        }

        return $offer;
    }

    /**
     * Get offer type taxonomy term slug
     */
    private static function get_offer_type($post_id) {
        $terms = wp_get_object_terms($post_id, 'offer_type', ['fields' => 'slugs']);
        return !empty($terms) && !is_wp_error($terms) ? $terms[0] : null;
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

// Initialize the API
GMKB_Offers_API::init();
