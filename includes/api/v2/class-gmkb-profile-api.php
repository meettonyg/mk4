<?php
/**
 * REST API endpoints for Guest Profile data
 *
 * Provides endpoints to read and write profile fields directly to post meta,
 * bypassing Formidable Forms for the Vue profile editor.
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
    }

    /**
     * Check if user can read the profile
     */
    public static function check_read_permission($request) {
        $post_id = $request->get_param('id');
        $post = get_post($post_id);

        if (!$post || $post->post_type !== 'guests') {
            return new WP_Error('not_found', 'Profile not found', ['status' => 404]);
        }

        // Check if user is logged in
        if (!is_user_logged_in()) {
            return new WP_Error('unauthorized', 'Authentication required', ['status' => 401]);
        }

        $user_id = get_current_user_id();

        // Admins can read any profile
        if (current_user_can('edit_others_posts')) {
            return true;
        }

        // Users can read their own profiles
        $owner_id = get_post_meta($post_id, 'owner_user_id', true);
        if ($owner_id && (int) $owner_id === $user_id) {
            return true;
        }

        // Check if user is the post author
        if ((int) $post->post_author === $user_id) {
            return true;
        }

        return new WP_Error('forbidden', 'You do not have permission to view this profile', ['status' => 403]);
    }

    /**
     * Check if user can edit the profile
     */
    public static function check_edit_permission($request) {
        $post_id = $request->get_param('id');
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

        // Users can edit their own profiles
        $owner_id = get_post_meta($post_id, 'owner_user_id', true);
        if ($owner_id && (int) $owner_id === $user_id) {
            return true;
        }

        // Check if user is the post author
        if ((int) $post->post_author === $user_id) {
            return true;
        }

        return new WP_Error('forbidden', 'You do not have permission to edit this profile', ['status' => 403]);
    }

    /**
     * Get full profile data
     */
    public static function get_profile($request) {
        $post_id = (int) $request->get_param('id');
        $post = get_post($post_id);

        if (!$post) {
            return new WP_Error('not_found', 'Profile not found', ['status' => 404]);
        }

        // Load the field map
        if (!class_exists('GMKB_Formidable_Field_Map')) {
            require_once GMKB_PLUGIN_DIR . 'system/formidable-field-map.php';
        }

        $grouped_fields = GMKB_Formidable_Field_Map::get_grouped_fields();
        $all_fields = [];

        // Flatten the grouped fields
        foreach ($grouped_fields as $group => $fields) {
            foreach ($fields as $field) {
                $all_fields[] = $field;
            }
        }

        // Get all field values
        $profile_data = [];
        foreach ($all_fields as $field) {
            $value = get_post_meta($post_id, $field, true);

            // Expand image fields to include URLs
            if (in_array($field, ['headshot_primary', 'headshot_vertical', 'headshot_horizontal'])) {
                $profile_data[$field] = self::expand_image_field($value);
            } elseif (in_array($field, ['logos', 'carousel_images'])) {
                $profile_data[$field] = self::expand_gallery_field($value);
            } else {
                $profile_data[$field] = $value;
            }
        }

        // Add post data
        $profile_data['_post'] = [
            'id' => $post_id,
            'title' => $post->post_title,
            'slug' => $post->post_name,
            'status' => $post->post_status,
            'created' => $post->post_date,
            'modified' => $post->post_modified,
            'author' => (int) $post->post_author,
            'permalink' => get_permalink($post_id),
        ];

        // Add taxonomy data
        $profile_data['_taxonomies'] = [
            'topic_category' => wp_get_post_terms($post_id, 'topic_category', ['fields' => 'all']),
            'layout' => wp_get_post_terms($post_id, 'layout', ['fields' => 'all']),
        ];

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

        // Load the field map
        if (!class_exists('GMKB_Formidable_Field_Map')) {
            require_once GMKB_PLUGIN_DIR . 'system/formidable-field-map.php';
        }

        $updated = [];
        $errors = [];

        foreach ($fields as $field => $value) {
            // Skip internal fields
            if (strpos($field, '_') === 0) {
                continue;
            }

            $result = self::save_field($post_id, $field, $value);

            if (is_wp_error($result)) {
                $errors[$field] = $result->get_error_message();
            } else {
                $updated[$field] = $value;
            }
        }

        // Update post modified time
        wp_update_post([
            'ID' => $post_id,
            'post_modified' => current_time('mysql'),
            'post_modified_gmt' => current_time('mysql', true),
        ]);

        return rest_ensure_response([
            'success' => empty($errors),
            'updated' => $updated,
            'errors' => $errors,
        ]);
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

        // Load the field map
        if (!class_exists('GMKB_Formidable_Field_Map')) {
            require_once GMKB_PLUGIN_DIR . 'system/formidable-field-map.php';
        }

        $result = self::save_field($post_id, $field, $value);

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

        // Load the field map
        if (!class_exists('GMKB_Formidable_Field_Map')) {
            require_once GMKB_PLUGIN_DIR . 'system/formidable-field-map.php';
        }

        $updated = [];
        $errors = [];

        foreach ($fields as $field => $value) {
            $result = self::save_field($post_id, $field, $value);

            if (is_wp_error($result)) {
                $errors[$field] = $result->get_error_message();
            } else {
                $updated[$field] = $value;
            }
        }

        return rest_ensure_response([
            'success' => empty($errors),
            'updated' => $updated,
            'errors' => $errors,
        ]);
    }

    /**
     * Get profile field schema
     */
    public static function get_schema($request) {
        if (!class_exists('GMKB_Formidable_Field_Map')) {
            require_once GMKB_PLUGIN_DIR . 'system/formidable-field-map.php';
        }

        $grouped_fields = GMKB_Formidable_Field_Map::get_grouped_fields();
        $schema = [];

        foreach ($grouped_fields as $group => $fields) {
            $schema[$group] = [];
            foreach ($fields as $field) {
                $schema[$group][$field] = [
                    'key' => $field,
                    'label' => GMKB_Formidable_Field_Map::get_field_label($field),
                    'type' => GMKB_Formidable_Field_Map::get_sanitization_type($field),
                ];
            }
        }

        return rest_ensure_response([
            'success' => true,
            'schema' => $schema,
        ]);
    }

    /**
     * Save a single field with proper sanitization
     */
    private static function save_field($post_id, $field, $value) {
        $type = GMKB_Formidable_Field_Map::get_sanitization_type($field);

        // Sanitize based on field type
        switch ($type) {
            case 'html':
                $value = wp_kses_post($value);
                break;

            case 'url':
                $value = esc_url_raw($value);
                break;

            case 'email':
                $value = sanitize_email($value);
                break;

            case 'int':
                $value = absint($value);
                break;

            case 'color':
                // Validate hex color
                if (!empty($value) && !preg_match('/^#[a-fA-F0-9]{6}$/', $value)) {
                    return new WP_Error('invalid_color', "Invalid color format for {$field}");
                }
                $value = sanitize_hex_color($value);
                break;

            case 'array':
                if (!is_array($value)) {
                    $value = [];
                }
                // Sanitize each item in the array
                $value = array_map(function($item) {
                    if (is_numeric($item)) {
                        return absint($item);
                    }
                    return sanitize_text_field($item);
                }, $value);
                break;

            default:
                $value = sanitize_text_field($value);
        }

        // Handle special post title field
        if ($field === 'full_name') {
            wp_update_post([
                'ID' => $post_id,
                'post_title' => $value,
            ]);
        }

        // Save to post meta
        $result = update_post_meta($post_id, $field, $value);

        if ($result === false) {
            return new WP_Error('save_failed', "Failed to save {$field}");
        }

        return true;
    }

    /**
     * Expand image field to include URLs and sizes
     */
    private static function expand_image_field($attachment_id) {
        if (empty($attachment_id)) {
            return null;
        }

        $attachment_id = (int) $attachment_id;

        if (!wp_attachment_is_image($attachment_id)) {
            return null;
        }

        return [
            'id' => $attachment_id,
            'url' => wp_get_attachment_url($attachment_id),
            'alt' => get_post_meta($attachment_id, '_wp_attachment_image_alt', true),
            'sizes' => [
                'thumbnail' => wp_get_attachment_image_url($attachment_id, 'thumbnail'),
                'medium' => wp_get_attachment_image_url($attachment_id, 'medium'),
                'large' => wp_get_attachment_image_url($attachment_id, 'large'),
                'full' => wp_get_attachment_image_url($attachment_id, 'full'),
            ],
        ];
    }

    /**
     * Expand gallery field to include URLs for each image
     */
    private static function expand_gallery_field($value) {
        if (empty($value)) {
            return [];
        }

        // Handle comma-separated string
        if (is_string($value)) {
            $ids = array_map('trim', explode(',', $value));
        } else {
            $ids = (array) $value;
        }

        $images = [];
        foreach ($ids as $id) {
            $expanded = self::expand_image_field($id);
            if ($expanded) {
                $images[] = $expanded;
            }
        }

        return $images;
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

    /**
     * List all profiles for current user
     */
    public static function list_profiles($request) {
        $user_id = get_current_user_id();

        // Query profiles owned by the current user (via owner_user_id meta)
        $args = [
            'post_type' => 'guests',
            'posts_per_page' => -1,
            'post_status' => ['publish', 'draft', 'pending'],
            'orderby' => 'modified',
            'order' => 'DESC',
            'meta_query' => [
                [
                    'key' => 'owner_user_id',
                    'value' => $user_id,
                    'compare' => '=',
                ],
            ],
        ];

        $query = new WP_Query($args);
        $profiles = [];

        foreach ($query->posts as $post) {
            $profiles[] = self::format_profile_card($post);
        }

        // Also query by author (for profiles without owner_user_id set)
        $author_args = [
            'post_type' => 'guests',
            'posts_per_page' => -1,
            'post_status' => ['publish', 'draft', 'pending'],
            'author' => $user_id,
            'meta_query' => [
                'relation' => 'OR',
                [
                    'key' => 'owner_user_id',
                    'compare' => 'NOT EXISTS',
                ],
                [
                    'key' => 'owner_user_id',
                    'value' => '',
                    'compare' => '=',
                ],
            ],
        ];

        $author_query = new WP_Query($author_args);
        foreach ($author_query->posts as $post) {
            // Avoid duplicates
            $existing_ids = array_column($profiles, 'id');
            if (!in_array($post->ID, $existing_ids)) {
                $profiles[] = self::format_profile_card($post);
            }
        }

        return rest_ensure_response([
            'success' => true,
            'profiles' => $profiles,
            'total' => count($profiles),
        ]);
    }

    /**
     * Format profile data for card display
     */
    private static function format_profile_card($post) {
        $post_id = $post->ID;

        // Get key fields for display
        $first_name = get_post_meta($post_id, 'first_name', true);
        $last_name = get_post_meta($post_id, 'last_name', true);
        $headshot = get_post_meta($post_id, 'headshot_primary', true);
        $tagline = get_post_meta($post_id, 'tagline', true);

        // Build display name
        $display_name = trim("{$first_name} {$last_name}");
        if (empty($display_name)) {
            $display_name = $post->post_title;
        }

        // Calculate profile completeness
        $completeness = self::calculate_completeness($post_id);

        // Get headshot URL
        $headshot_url = null;
        if ($headshot) {
            $headshot_url = wp_get_attachment_image_url($headshot, 'thumbnail');
        }

        return [
            'id' => $post_id,
            'title' => $display_name,
            'slug' => $post->post_name,
            'tagline' => $tagline,
            'headshot' => $headshot_url,
            'status' => $post->post_status,
            'completeness' => $completeness,
            'created' => $post->post_date,
            'modified' => $post->post_modified,
            'editUrl' => "/app/profiles/guest/profile/?entry={$post->post_name}",
            'viewUrl' => get_permalink($post_id),
        ];
    }

    /**
     * Calculate profile completeness percentage
     */
    private static function calculate_completeness($post_id) {
        // Key fields that contribute to completeness
        $required_fields = [
            'first_name',
            'last_name',
            'biography',
            'tagline',
            'headshot_primary',
            'topic_1',
            'question_1',
            'social_linkedin',
            'website_primary',
            'why_book_you',
        ];

        $filled = 0;
        foreach ($required_fields as $field) {
            $value = get_post_meta($post_id, $field, true);
            if (!empty($value)) {
                $filled++;
            }
        }

        return round(($filled / count($required_fields)) * 100);
    }

    /**
     * Create a new profile
     */
    public static function create_profile($request) {
        $user_id = get_current_user_id();
        $body = $request->get_json_params();

        $first_name = isset($body['first_name']) ? sanitize_text_field($body['first_name']) : '';
        $last_name = isset($body['last_name']) ? sanitize_text_field($body['last_name']) : '';

        // Generate title
        $title = trim("{$first_name} {$last_name}");
        if (empty($title)) {
            $title = 'New Profile';
        }

        // Create the post
        $post_id = wp_insert_post([
            'post_type' => 'guests',
            'post_title' => $title,
            'post_status' => 'draft',
            'post_author' => $user_id,
        ]);

        if (is_wp_error($post_id)) {
            return $post_id;
        }

        // Set owner
        update_post_meta($post_id, 'owner_user_id', $user_id);

        // Set initial fields
        if ($first_name) {
            update_post_meta($post_id, 'first_name', $first_name);
        }
        if ($last_name) {
            update_post_meta($post_id, 'last_name', $last_name);
        }

        $post = get_post($post_id);

        return rest_ensure_response([
            'success' => true,
            'profile' => self::format_profile_card($post),
            'message' => 'Profile created successfully',
        ]);
    }

    /**
     * Delete a profile
     */
    public static function delete_profile($request) {
        $post_id = (int) $request->get_param('id');

        $result = wp_trash_post($post_id);

        if (!$result) {
            return new WP_Error('delete_failed', 'Failed to delete profile', ['status' => 500]);
        }

        return rest_ensure_response([
            'success' => true,
            'message' => 'Profile moved to trash',
        ]);
    }
}

// Initialize the API
GMKB_Profile_API::init();
