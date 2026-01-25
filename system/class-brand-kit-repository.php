<?php
/**
 * Brand Kit Repository
 *
 * Data access layer for Brand Kit CRUD operations.
 * Follows the repository pattern used by Profile Repository.
 *
 * @package GMKB
 * @since 3.1.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Brand_Kit_Repository {

    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {}

    /**
     * Get a brand kit by ID
     *
     * @param int $id Brand kit post ID
     * @return array|null Brand kit data or null if not found
     */
    public function get($id) {
        $post = get_post($id);

        if (!$post || $post->post_type !== GMKB_Brand_Kit_Schema::POST_TYPE) {
            return null;
        }

        return $this->hydrate($post);
    }

    /**
     * Get all brand kits for a user
     *
     * @param int $user_id User ID
     * @param array $args Query arguments
     * @return array Array of brand kit data
     */
    public function get_for_user($user_id, $args = []) {
        $defaults = [
            'post_type' => GMKB_Brand_Kit_Schema::POST_TYPE,
            'author' => $user_id,
            'posts_per_page' => -1,
            'post_status' => 'publish',
            'orderby' => 'title',
            'order' => 'ASC',
        ];

        $query_args = wp_parse_args($args, $defaults);
        $posts = get_posts($query_args);

        return array_map([$this, 'hydrate'], $posts);
    }

    /**
     * Get all brand kits for an organization
     *
     * @param int $organization_id Organization ID
     * @param array $args Query arguments
     * @return array Array of brand kit data
     */
    public function get_for_organization($organization_id, $args = []) {
        $defaults = [
            'post_type' => GMKB_Brand_Kit_Schema::POST_TYPE,
            'posts_per_page' => -1,
            'post_status' => 'publish',
            'orderby' => 'title',
            'order' => 'ASC',
            'meta_query' => [
                [
                    'key' => 'organization_id',
                    'value' => $organization_id,
                    'compare' => '=',
                    'type' => 'NUMERIC',
                ],
            ],
        ];

        $query_args = wp_parse_args($args, $defaults);
        $posts = get_posts($query_args);

        return array_map([$this, 'hydrate'], $posts);
    }

    /**
     * Get brand kits available to a user (owned + organization)
     *
     * @param int $user_id User ID
     * @param int|null $organization_id Optional organization ID
     * @return array Array of brand kit data
     */
    public function get_available_for_user($user_id, $organization_id = null) {
        $brand_kits = [];

        // Get user's own brand kits
        $user_kits = $this->get_for_user($user_id);
        foreach ($user_kits as $kit) {
            $kit['ownership'] = 'owned';
            $brand_kits[] = $kit;
        }

        // Get organization brand kits if applicable
        if ($organization_id) {
            $org_kits = $this->get_for_organization($organization_id);
            foreach ($org_kits as $kit) {
                // Don't duplicate if user owns it
                if ($kit['author_id'] !== $user_id) {
                    $kit['ownership'] = 'organization';
                    $brand_kits[] = $kit;
                }
            }
        }

        return $brand_kits;
    }

    /**
     * Create a new brand kit
     *
     * @param array $data Brand kit data
     * @param int $user_id User ID (author)
     * @return int|WP_Error Post ID or error
     */
    public function create($data, $user_id) {
        // Validate data
        $validated = GMKB_Brand_Kit_Schema::validate($data);
        if (is_wp_error($validated)) {
            return $validated;
        }

        // Create post
        $post_data = [
            'post_type' => GMKB_Brand_Kit_Schema::POST_TYPE,
            'post_title' => sanitize_text_field($data['name'] ?? __('New Brand Kit', 'gmkb')),
            'post_status' => 'publish',
            'post_author' => $user_id,
        ];

        $post_id = wp_insert_post($post_data, true);

        if (is_wp_error($post_id)) {
            return $post_id;
        }

        // Save meta fields
        $this->save_meta($post_id, $data);

        return $post_id;
    }

    /**
     * Update a brand kit
     *
     * @param int $id Brand kit post ID
     * @param array $data Data to update
     * @return bool|WP_Error True on success, error on failure
     */
    public function update($id, $data) {
        $post = get_post($id);

        if (!$post || $post->post_type !== GMKB_Brand_Kit_Schema::POST_TYPE) {
            return new WP_Error('not_found', __('Brand kit not found', 'gmkb'));
        }

        // Validate data
        $validated = GMKB_Brand_Kit_Schema::validate($data);
        if (is_wp_error($validated)) {
            return $validated;
        }

        // Update post title if provided
        if (isset($data['name'])) {
            wp_update_post([
                'ID' => $id,
                'post_title' => sanitize_text_field($data['name']),
            ]);
        }

        // Update meta fields
        $this->save_meta($id, $data);

        return true;
    }

    /**
     * Delete a brand kit
     *
     * @param int $id Brand kit post ID
     * @param bool $force Force delete (skip trash)
     * @return bool|WP_Error True on success, error on failure
     */
    public function delete($id, $force = false) {
        $post = get_post($id);

        if (!$post || $post->post_type !== GMKB_Brand_Kit_Schema::POST_TYPE) {
            return new WP_Error('not_found', __('Brand kit not found', 'gmkb'));
        }

        // Check if brand kit is in use
        $usage = $this->get_usage($id);
        if (!empty($usage['profiles']) || !empty($usage['media_kits'])) {
            return new WP_Error(
                'in_use',
                __('Brand kit is in use by profiles or media kits. Remove associations first.', 'gmkb')
            );
        }

        // Delete associated media
        $this->delete_media($id);

        // Delete post
        $result = wp_delete_post($id, $force);

        return $result ? true : new WP_Error('delete_failed', __('Failed to delete brand kit', 'gmkb'));
    }

    /**
     * Duplicate a brand kit
     *
     * @param int $id Brand kit post ID to duplicate
     * @param int $user_id User ID for the new copy
     * @return int|WP_Error New post ID or error
     */
    public function duplicate($id, $user_id) {
        $original = $this->get($id);

        if (!$original) {
            return new WP_Error('not_found', __('Brand kit not found', 'gmkb'));
        }

        // Prepare data for new brand kit
        $data = $original;
        $data['name'] = sprintf(__('%s (Copy)', 'gmkb'), $original['name']);
        unset($data['id'], $data['author_id'], $data['created_at'], $data['updated_at']);

        // Reset organization (copy is private to user)
        $data['organization_id'] = 0;
        $data['visibility'] = 'private';

        return $this->create($data, $user_id);
    }

    /**
     * Get brand kit usage (profiles and media kits using it)
     *
     * @param int $id Brand kit post ID
     * @return array Array with 'profiles' and 'media_kits' keys
     */
    public function get_usage($id) {
        $usage = [
            'profiles' => [],
            'media_kits' => [],
        ];

        // Find profiles using this brand kit
        $profiles = get_posts([
            'post_type' => 'guests',
            'posts_per_page' => -1,
            'post_status' => 'any',
            'meta_query' => [
                [
                    'key' => 'brand_kit_id',
                    'value' => $id,
                    'compare' => '=',
                    'type' => 'NUMERIC',
                ],
            ],
            'fields' => 'ids',
        ]);

        foreach ($profiles as $profile_id) {
            $usage['profiles'][] = [
                'id' => $profile_id,
                'title' => get_the_title($profile_id),
            ];
        }

        return $usage;
    }

    /**
     * Add media to brand kit
     *
     * @param int $brand_kit_id Brand kit post ID
     * @param array $media_data Media data (media_id, category, tags, label, etc.)
     * @return int|WP_Error Media entry ID or error
     */
    public function add_media($brand_kit_id, $media_data) {
        global $wpdb;
        $table = $wpdb->prefix . 'gmkb_brand_kit_media';

        // Validate required fields
        if (empty($media_data['media_id'])) {
            return new WP_Error('missing_media_id', __('Media ID is required', 'gmkb'));
        }

        // Verify attachment exists
        $attachment = get_post($media_data['media_id']);
        if (!$attachment || $attachment->post_type !== 'attachment') {
            return new WP_Error('invalid_media', __('Invalid media attachment', 'gmkb'));
        }

        // Get next sort order
        $max_sort = $wpdb->get_var($wpdb->prepare(
            "SELECT MAX(sort_order) FROM $table WHERE brand_kit_id = %d",
            $brand_kit_id
        ));

        $insert_data = [
            'brand_kit_id' => $brand_kit_id,
            'media_id' => absint($media_data['media_id']),
            'category' => sanitize_text_field($media_data['category'] ?? 'photo'),
            'tags' => wp_json_encode($media_data['tags'] ?? []),
            'label' => sanitize_text_field($media_data['label'] ?? ''),
            'is_primary' => !empty($media_data['is_primary']) ? 1 : 0,
            'sort_order' => ($max_sort ?? 0) + 1,
            'metadata' => wp_json_encode($media_data['metadata'] ?? []),
            'created_at' => current_time('mysql'),
        ];

        $result = $wpdb->insert($table, $insert_data);

        if ($result === false) {
            return new WP_Error('db_error', __('Failed to add media to brand kit', 'gmkb'));
        }

        // If this is marked as primary, unset other primaries in same category
        if ($insert_data['is_primary']) {
            $this->set_primary_media($brand_kit_id, $wpdb->insert_id, $insert_data['category']);
        }

        return $wpdb->insert_id;
    }

    /**
     * Update brand kit media entry
     *
     * @param int $media_entry_id Media entry ID (from gmkb_brand_kit_media table)
     * @param array $data Data to update
     * @param int|null $brand_kit_id Brand kit ID for security validation (optional but recommended)
     * @return bool|WP_Error True on success, error on failure
     */
    public function update_media($media_entry_id, $data, $brand_kit_id = null) {
        global $wpdb;
        $table = $wpdb->prefix . 'gmkb_brand_kit_media';

        // Verify the media entry belongs to the specified brand kit (security check)
        if ($brand_kit_id !== null) {
            $entry_brand_kit_id = $wpdb->get_var($wpdb->prepare(
                "SELECT brand_kit_id FROM $table WHERE id = %d",
                $media_entry_id
            ));

            if (!$entry_brand_kit_id || (int) $entry_brand_kit_id !== (int) $brand_kit_id) {
                return new WP_Error('unauthorized', __('Media entry does not belong to this brand kit', 'gmkb'));
            }
        }

        $update_data = [];

        if (isset($data['category'])) {
            $update_data['category'] = sanitize_text_field($data['category']);
        }
        if (isset($data['tags'])) {
            $update_data['tags'] = wp_json_encode($data['tags']);
        }
        if (isset($data['label'])) {
            $update_data['label'] = sanitize_text_field($data['label']);
        }
        if (isset($data['is_primary'])) {
            $update_data['is_primary'] = !empty($data['is_primary']) ? 1 : 0;
        }
        if (isset($data['sort_order'])) {
            $update_data['sort_order'] = absint($data['sort_order']);
        }
        if (isset($data['metadata'])) {
            $update_data['metadata'] = wp_json_encode($data['metadata']);
        }

        if (empty($update_data)) {
            return true; // Nothing to update
        }

        // Include brand_kit_id in WHERE clause for additional security
        $where = ['id' => $media_entry_id];
        if ($brand_kit_id !== null) {
            $where['brand_kit_id'] = $brand_kit_id;
        }

        $result = $wpdb->update($table, $update_data, $where);

        if ($result === false) {
            return new WP_Error('db_error', __('Failed to update media', 'gmkb'));
        }

        // Handle primary status
        if (!empty($update_data['is_primary'])) {
            $entry = $wpdb->get_row($wpdb->prepare(
                "SELECT brand_kit_id, category FROM $table WHERE id = %d",
                $media_entry_id
            ));
            if ($entry) {
                $this->set_primary_media($entry->brand_kit_id, $media_entry_id, $entry->category);
            }
        }

        return true;
    }

    /**
     * Remove media from brand kit
     *
     * @param int $media_entry_id Media entry ID
     * @param int|null $brand_kit_id Brand kit ID for security validation (optional but recommended)
     * @return bool|WP_Error True on success, error on failure
     */
    public function remove_media($media_entry_id, $brand_kit_id = null) {
        global $wpdb;
        $table = $wpdb->prefix . 'gmkb_brand_kit_media';

        // Build WHERE clause with optional brand_kit_id for security
        $where = ['id' => $media_entry_id];
        if ($brand_kit_id !== null) {
            $where['brand_kit_id'] = $brand_kit_id;
        }

        $result = $wpdb->delete($table, $where);

        if ($result === 0 && $brand_kit_id !== null) {
            return new WP_Error('not_found', __('Media entry not found or does not belong to this brand kit', 'gmkb'));
        }

        return $result !== false ? true : new WP_Error('db_error', __('Failed to remove media', 'gmkb'));
    }

    /**
     * Bulk reorder media entries for a brand kit
     *
     * @param int $brand_kit_id Brand kit post ID
     * @param array $order Array of {id, sort_order} items
     * @return bool|WP_Error True on success, error on failure
     */
    public function reorder_media($brand_kit_id, $order) {
        global $wpdb;
        $table = $wpdb->prefix . 'gmkb_brand_kit_media';

        if (!is_array($order) || empty($order)) {
            return new WP_Error('invalid_order', __('Invalid order data', 'gmkb'));
        }

        // Collect all media entry IDs from the order array
        $entry_ids = array_filter(array_map(function($item) {
            return isset($item['id']) ? absint($item['id']) : 0;
        }, $order));

        if (empty($entry_ids)) {
            return new WP_Error('invalid_order', __('No valid media entry IDs provided', 'gmkb'));
        }

        // Verify all entries belong to this brand kit (security check)
        $placeholders = implode(',', array_fill(0, count($entry_ids), '%d'));
        $query = $wpdb->prepare(
            "SELECT id FROM $table WHERE brand_kit_id = %d AND id IN ($placeholders)",
            array_merge([$brand_kit_id], $entry_ids)
        );
        $valid_ids = $wpdb->get_col($query);

        if (count($valid_ids) !== count($entry_ids)) {
            return new WP_Error('unauthorized', __('Some media entries do not belong to this brand kit', 'gmkb'));
        }

        // Perform bulk update using a CASE statement for efficiency
        $cases = [];
        $params = [];
        foreach ($order as $item) {
            if (isset($item['id']) && isset($item['sort_order'])) {
                $cases[] = "WHEN id = %d THEN %d";
                $params[] = absint($item['id']);
                $params[] = absint($item['sort_order']);
            }
        }

        if (empty($cases)) {
            return true; // Nothing to update
        }

        // Add the brand_kit_id and entry IDs to params
        $params[] = $brand_kit_id;
        $params = array_merge($params, $entry_ids);

        $case_sql = implode(' ', $cases);
        $sql = $wpdb->prepare(
            "UPDATE $table SET sort_order = CASE $case_sql ELSE sort_order END WHERE brand_kit_id = %d AND id IN ($placeholders)",
            $params
        );

        $result = $wpdb->query($sql);

        return $result !== false ? true : new WP_Error('db_error', __('Failed to reorder media', 'gmkb'));
    }

    /**
     * Get all media for a brand kit
     *
     * @param int $brand_kit_id Brand kit post ID
     * @param string|null $category Optional category filter
     * @return array Array of media entries with full attachment data
     */
    public function get_media($brand_kit_id, $category = null) {
        global $wpdb;
        $table = $wpdb->prefix . 'gmkb_brand_kit_media';

        $sql = "SELECT * FROM $table WHERE brand_kit_id = %d";
        $params = [$brand_kit_id];

        if ($category) {
            $sql .= " AND category = %s";
            $params[] = $category;
        }

        $sql .= " ORDER BY category, sort_order ASC";

        $entries = $wpdb->get_results($wpdb->prepare($sql, $params));

        return array_map([$this, 'hydrate_media_entry'], $entries);
    }

    /**
     * Get media by tags
     *
     * @param int $brand_kit_id Brand kit post ID
     * @param array $tags Tags to filter by
     * @return array Array of media entries
     */
    public function get_media_by_tags($brand_kit_id, $tags) {
        $all_media = $this->get_media($brand_kit_id);

        return array_filter($all_media, function($entry) use ($tags) {
            $entry_tags = $entry['tags'] ?? [];
            return !empty(array_intersect($tags, $entry_tags));
        });
    }

    /**
     * Get primary media for a category
     *
     * @param int $brand_kit_id Brand kit post ID
     * @param string $category Category
     * @return array|null Media entry or null
     */
    public function get_primary_media($brand_kit_id, $category) {
        global $wpdb;
        $table = $wpdb->prefix . 'gmkb_brand_kit_media';

        $entry = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE brand_kit_id = %d AND category = %s AND is_primary = 1",
            $brand_kit_id,
            $category
        ));

        return $entry ? $this->hydrate_media_entry($entry) : null;
    }

    /**
     * Set a media entry as primary for its category
     *
     * @param int $brand_kit_id Brand kit post ID
     * @param int $media_entry_id Media entry ID to make primary
     * @param string $category Category
     */
    private function set_primary_media($brand_kit_id, $media_entry_id, $category) {
        global $wpdb;
        $table = $wpdb->prefix . 'gmkb_brand_kit_media';

        // Unset all primaries in this category
        $wpdb->update(
            $table,
            ['is_primary' => 0],
            ['brand_kit_id' => $brand_kit_id, 'category' => $category]
        );

        // Set the specified one as primary
        $wpdb->update(
            $table,
            ['is_primary' => 1],
            ['id' => $media_entry_id]
        );
    }

    /**
     * Delete all media for a brand kit
     *
     * @param int $brand_kit_id Brand kit post ID
     */
    private function delete_media($brand_kit_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'gmkb_brand_kit_media';

        $wpdb->delete($table, ['brand_kit_id' => $brand_kit_id]);
    }

    /**
     * Hydrate a brand kit post into a data array
     *
     * @param WP_Post $post Post object
     * @return array Brand kit data
     */
    private function hydrate($post) {
        $data = [
            'id' => $post->ID,
            'name' => $post->post_title,
            'author_id' => (int) $post->post_author,
            'created_at' => $post->post_date,
            'updated_at' => $post->post_modified,
        ];

        // Add meta fields
        $fields = GMKB_Brand_Kit_Schema::get_all_fields();
        foreach ($fields as $key => $config) {
            $value = get_post_meta($post->ID, $key, true);
            $data[$key] = $value !== '' ? $value : ($config['default'] ?? null);
        }

        // Add media summary
        $media = $this->get_media($post->ID);
        $data['media_summary'] = [
            'total' => count($media),
            'by_category' => [],
        ];

        foreach ($media as $entry) {
            $cat = $entry['category'];
            if (!isset($data['media_summary']['by_category'][$cat])) {
                $data['media_summary']['by_category'][$cat] = 0;
            }
            $data['media_summary']['by_category'][$cat]++;
        }

        return $data;
    }

    /**
     * Hydrate a media entry with full attachment data
     *
     * @param object $entry Database row
     * @return array Media entry data
     */
    private function hydrate_media_entry($entry) {
        $attachment_id = (int) $entry->media_id;
        $attachment = get_post($attachment_id);

        $data = [
            'id' => (int) $entry->id,
            'brand_kit_id' => (int) $entry->brand_kit_id,
            'media_id' => $attachment_id,
            'category' => $entry->category,
            'tags' => json_decode($entry->tags, true) ?: [],
            'label' => $entry->label,
            'is_primary' => (bool) $entry->is_primary,
            'sort_order' => (int) $entry->sort_order,
            'metadata' => json_decode($entry->metadata, true) ?: [],
            'created_at' => $entry->created_at,
        ];

        // Add attachment details
        if ($attachment && $attachment->post_type === 'attachment') {
            $data['url'] = wp_get_attachment_url($attachment_id);
            $data['alt'] = get_post_meta($attachment_id, '_wp_attachment_image_alt', true);
            $data['title'] = $attachment->post_title;
            $data['sizes'] = $this->get_image_sizes($attachment_id);
        }

        return $data;
    }

    /**
     * Get image sizes for an attachment
     *
     * @param int $attachment_id Attachment ID
     * @return array Size data
     */
    private function get_image_sizes($attachment_id) {
        $sizes = [];
        $available_sizes = ['thumbnail', 'medium', 'large', 'full'];

        foreach ($available_sizes as $size) {
            $image = wp_get_attachment_image_src($attachment_id, $size);
            if ($image) {
                $sizes[$size] = [
                    'url' => $image[0],
                    'width' => $image[1],
                    'height' => $image[2],
                ];
            }
        }

        return $sizes;
    }

    /**
     * Save meta fields for a brand kit
     *
     * @param int $post_id Post ID
     * @param array $data Data to save
     */
    private function save_meta($post_id, $data) {
        $fields = GMKB_Brand_Kit_Schema::get_all_fields();

        foreach ($fields as $key => $config) {
            if (isset($data[$key])) {
                $value = $data[$key];

                // Apply sanitization
                if (isset($config['sanitize_callback']) && is_callable($config['sanitize_callback'])) {
                    $value = call_user_func($config['sanitize_callback'], $value);
                }

                update_post_meta($post_id, $key, $value);
            }
        }
    }
}
