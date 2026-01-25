<?php
/**
 * Media Library Repository
 *
 * Data access layer for standalone Media Library CRUD operations.
 * Manages media independently of Brand Kits with many-to-many linking.
 *
 * @package GMKB
 * @since 3.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Media_Library_Repository {

    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {}

    /**
     * Get table names
     */
    private function get_table() {
        global $wpdb;
        return $wpdb->prefix . GMKB_Media_Library_Schema::TABLE_NAME;
    }

    private function get_links_table() {
        global $wpdb;
        return $wpdb->prefix . GMKB_Media_Library_Schema::LINKS_TABLE_NAME;
    }

    /**
     * Get a media item by ID
     *
     * @param int $id Media library entry ID
     * @return array|null Media data or null if not found
     */
    public function get($id) {
        global $wpdb;
        $table = $this->get_table();

        $row = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE id = %d",
            $id
        ), ARRAY_A);

        if (!$row) {
            return null;
        }

        return $this->hydrate($row);
    }

    /**
     * Get all media for a user
     *
     * @param int $user_id User ID
     * @param array $args Query arguments
     * @return array Array of media data
     */
    public function get_for_user($user_id, $args = []) {
        global $wpdb;
        $table = $this->get_table();

        $defaults = [
            'category' => null,
            'limit' => -1,
            'offset' => 0,
            'orderby' => 'created_at',
            'order' => 'DESC',
        ];
        $args = wp_parse_args($args, $defaults);

        $where = "WHERE user_id = %d";
        $params = [$user_id];

        if ($args['category']) {
            $where .= " AND category = %s";
            $params[] = $args['category'];
        }

        $order = sanitize_sql_orderby($args['orderby'] . ' ' . $args['order']) ?: 'created_at DESC';

        $limit_clause = '';
        if ($args['limit'] > 0) {
            $limit_clause = $wpdb->prepare(" LIMIT %d OFFSET %d", $args['limit'], $args['offset']);
        }

        $query = "SELECT * FROM $table $where ORDER BY $order $limit_clause";
        $rows = $wpdb->get_results($wpdb->prepare($query, ...$params), ARRAY_A);

        return array_map([$this, 'hydrate'], $rows ?: []);
    }

    /**
     * Get media count for a user
     *
     * @param int $user_id User ID
     * @param string|null $category Optional category filter
     * @return int Count
     */
    public function get_count_for_user($user_id, $category = null) {
        global $wpdb;
        $table = $this->get_table();

        if ($category) {
            return (int) $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM $table WHERE user_id = %d AND category = %s",
                $user_id,
                $category
            ));
        }

        return (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $table WHERE user_id = %d",
            $user_id
        ));
    }

    /**
     * Create a new media library entry
     *
     * @param array $data Media data
     * @param int $user_id User ID (owner)
     * @return int|WP_Error Entry ID or error
     */
    public function create($data, $user_id) {
        global $wpdb;
        $table = $this->get_table();

        // Validate data
        $validated = GMKB_Media_Library_Schema::validate($data);
        if (is_wp_error($validated)) {
            return $validated;
        }

        // Check if this media already exists for user
        $existing = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM $table WHERE user_id = %d AND media_id = %d",
            $user_id,
            $data['media_id']
        ));

        if ($existing) {
            return new WP_Error('duplicate', __('This media is already in your library', 'gmkb'));
        }

        $insert_data = [
            'user_id' => $user_id,
            'media_id' => absint($data['media_id']),
            'category' => sanitize_text_field($data['category'] ?? 'photo'),
            'label' => sanitize_text_field($data['label'] ?? ''),
            'alt' => sanitize_text_field($data['alt'] ?? ''),
            'tags' => wp_json_encode($data['tags'] ?? []),
            'metadata' => wp_json_encode($data['metadata'] ?? []),
            'created_at' => current_time('mysql'),
            'updated_at' => current_time('mysql'),
        ];

        $result = $wpdb->insert($table, $insert_data);

        if ($result === false) {
            return new WP_Error('db_error', __('Failed to add media to library', 'gmkb'));
        }

        return $wpdb->insert_id;
    }

    /**
     * Update a media library entry
     *
     * @param int $id Entry ID
     * @param array $data Data to update
     * @param int|null $user_id User ID for ownership verification
     * @return bool|WP_Error True on success, error on failure
     */
    public function update($id, $data, $user_id = null) {
        global $wpdb;
        $table = $this->get_table();

        // Verify ownership if user_id provided
        if ($user_id !== null) {
            $owner = $wpdb->get_var($wpdb->prepare(
                "SELECT user_id FROM $table WHERE id = %d",
                $id
            ));
            if (!$owner || (int) $owner !== (int) $user_id) {
                return new WP_Error('unauthorized', __('You do not own this media', 'gmkb'));
            }
        }

        $update_data = [];

        if (isset($data['category'])) {
            $update_data['category'] = sanitize_text_field($data['category']);
        }
        if (isset($data['label'])) {
            $update_data['label'] = sanitize_text_field($data['label']);
        }
        if (isset($data['alt'])) {
            $update_data['alt'] = sanitize_text_field($data['alt']);
        }
        if (isset($data['tags'])) {
            $update_data['tags'] = wp_json_encode($data['tags']);
        }
        if (isset($data['metadata'])) {
            $update_data['metadata'] = wp_json_encode($data['metadata']);
        }

        if (empty($update_data)) {
            return true; // Nothing to update
        }

        $update_data['updated_at'] = current_time('mysql');

        $result = $wpdb->update($table, $update_data, ['id' => $id]);

        return $result !== false;
    }

    /**
     * Delete a media library entry
     *
     * @param int $id Entry ID
     * @param int|null $user_id User ID for ownership verification
     * @return bool|WP_Error True on success, error on failure
     */
    public function delete($id, $user_id = null) {
        global $wpdb;
        $table = $this->get_table();
        $links_table = $this->get_links_table();

        // Verify ownership if user_id provided
        if ($user_id !== null) {
            $owner = $wpdb->get_var($wpdb->prepare(
                "SELECT user_id FROM $table WHERE id = %d",
                $id
            ));
            if (!$owner || (int) $owner !== (int) $user_id) {
                return new WP_Error('unauthorized', __('You do not own this media', 'gmkb'));
            }
        }

        // Delete all brand kit links first
        $wpdb->delete($links_table, ['media_library_id' => $id]);

        // Delete the media entry
        $result = $wpdb->delete($table, ['id' => $id]);

        return $result !== false;
    }

    /**
     * Link media to a brand kit
     *
     * @param int $media_id Media library entry ID
     * @param int $brand_kit_id Brand kit post ID
     * @param array $options Additional options (is_primary, sort_order)
     * @return int|WP_Error Link ID or error
     */
    public function link_to_brand_kit($media_id, $brand_kit_id, $options = []) {
        global $wpdb;
        $links_table = $this->get_links_table();

        // Check if link already exists
        $existing = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM $links_table WHERE media_library_id = %d AND brand_kit_id = %d",
            $media_id,
            $brand_kit_id
        ));

        if ($existing) {
            return (int) $existing; // Already linked
        }

        // Get next sort order
        $max_sort = $wpdb->get_var($wpdb->prepare(
            "SELECT MAX(sort_order) FROM $links_table WHERE brand_kit_id = %d",
            $brand_kit_id
        ));

        $insert_data = [
            'media_library_id' => $media_id,
            'brand_kit_id' => $brand_kit_id,
            'is_primary' => !empty($options['is_primary']) ? 1 : 0,
            'sort_order' => $options['sort_order'] ?? (($max_sort ?? 0) + 1),
            'created_at' => current_time('mysql'),
        ];

        $result = $wpdb->insert($links_table, $insert_data);

        if ($result === false) {
            return new WP_Error('db_error', __('Failed to link media to brand kit', 'gmkb'));
        }

        // Handle primary flag
        if ($insert_data['is_primary']) {
            $media = $this->get($media_id);
            if ($media) {
                $this->set_primary_in_brand_kit($brand_kit_id, $media_id, $media['category']);
            }
        }

        return $wpdb->insert_id;
    }

    /**
     * Unlink media from a brand kit
     *
     * @param int $media_id Media library entry ID
     * @param int $brand_kit_id Brand kit post ID
     * @return bool Success
     */
    public function unlink_from_brand_kit($media_id, $brand_kit_id) {
        global $wpdb;
        $links_table = $this->get_links_table();

        $result = $wpdb->delete($links_table, [
            'media_library_id' => $media_id,
            'brand_kit_id' => $brand_kit_id,
        ]);

        return $result !== false;
    }

    /**
     * Get all media linked to a brand kit
     *
     * @param int $brand_kit_id Brand kit post ID
     * @return array Array of media data with link info
     */
    public function get_for_brand_kit($brand_kit_id) {
        global $wpdb;
        $table = $this->get_table();
        $links_table = $this->get_links_table();

        $rows = $wpdb->get_results($wpdb->prepare(
            "SELECT m.*, l.is_primary, l.sort_order, l.id as link_id
             FROM $table m
             INNER JOIN $links_table l ON m.id = l.media_library_id
             WHERE l.brand_kit_id = %d
             ORDER BY l.sort_order ASC",
            $brand_kit_id
        ), ARRAY_A);

        return array_map([$this, 'hydrate'], $rows ?: []);
    }

    /**
     * Get brand kits that a media item is linked to
     *
     * @param int $media_id Media library entry ID
     * @return array Array of brand kit IDs
     */
    public function get_linked_brand_kits($media_id) {
        global $wpdb;
        $links_table = $this->get_links_table();

        return $wpdb->get_col($wpdb->prepare(
            "SELECT brand_kit_id FROM $links_table WHERE media_library_id = %d",
            $media_id
        ));
    }

    /**
     * Set media as primary within a brand kit for its category
     *
     * @param int $brand_kit_id Brand kit post ID
     * @param int $media_id Media library entry ID
     * @param string $category Media category
     */
    public function set_primary_in_brand_kit($brand_kit_id, $media_id, $category) {
        global $wpdb;
        $table = $this->get_table();
        $links_table = $this->get_links_table();

        // First, unset all primaries of this category in this brand kit
        $wpdb->query($wpdb->prepare(
            "UPDATE $links_table l
             INNER JOIN $table m ON l.media_library_id = m.id
             SET l.is_primary = 0
             WHERE l.brand_kit_id = %d AND m.category = %s",
            $brand_kit_id,
            $category
        ));

        // Set this one as primary
        $wpdb->update(
            $links_table,
            ['is_primary' => 1],
            [
                'brand_kit_id' => $brand_kit_id,
                'media_library_id' => $media_id,
            ]
        );
    }

    /**
     * Update link properties (is_primary, sort_order)
     *
     * @param int $media_id Media library entry ID
     * @param int $brand_kit_id Brand kit post ID
     * @param array $data Data to update
     * @return bool Success
     */
    public function update_link($media_id, $brand_kit_id, $data) {
        global $wpdb;
        $links_table = $this->get_links_table();

        $update_data = [];

        if (isset($data['is_primary'])) {
            $update_data['is_primary'] = $data['is_primary'] ? 1 : 0;

            // Handle primary flag
            if ($update_data['is_primary']) {
                $media = $this->get($media_id);
                if ($media) {
                    $this->set_primary_in_brand_kit($brand_kit_id, $media_id, $media['category']);
                    return true; // set_primary_in_brand_kit already handled the update
                }
            }
        }

        if (isset($data['sort_order'])) {
            $update_data['sort_order'] = (int) $data['sort_order'];
        }

        if (empty($update_data)) {
            return true;
        }

        $result = $wpdb->update($links_table, $update_data, [
            'media_library_id' => $media_id,
            'brand_kit_id' => $brand_kit_id,
        ]);

        return $result !== false;
    }

    /**
     * Hydrate a database row into a media object
     *
     * @param array $row Database row
     * @return array Hydrated media data
     */
    private function hydrate($row) {
        $attachment_id = (int) $row['media_id'];
        $attachment = get_post($attachment_id);

        $data = [
            'id' => (int) $row['id'],
            'user_id' => (int) $row['user_id'],
            'media_id' => $attachment_id,
            'category' => $row['category'],
            'label' => $row['label'],
            'alt' => $row['alt'] ?: ($attachment ? $attachment->post_title : ''),
            'tags' => json_decode($row['tags'] ?: '[]', true),
            'metadata' => json_decode($row['metadata'] ?: '{}', true),
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
        ];

        // Include link-specific data if present
        if (isset($row['is_primary'])) {
            $data['is_primary'] = (bool) $row['is_primary'];
        }
        if (isset($row['sort_order'])) {
            $data['sort_order'] = (int) $row['sort_order'];
        }
        if (isset($row['link_id'])) {
            $data['link_id'] = (int) $row['link_id'];
        }

        // Get attachment details
        if ($attachment) {
            $data['url'] = wp_get_attachment_url($attachment_id);
            $data['mime_type'] = $attachment->post_mime_type;

            // Get sizes
            $data['sizes'] = [];
            foreach (['thumbnail', 'medium', 'large', 'full'] as $size) {
                $img = wp_get_attachment_image_src($attachment_id, $size);
                if ($img) {
                    $data['sizes'][$size] = [
                        'url' => $img[0],
                        'width' => $img[1],
                        'height' => $img[2],
                    ];
                }
            }
        }

        return $data;
    }
}
