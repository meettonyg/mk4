<?php
/**
 * Profile Repository - Data Access Layer
 *
 * Provides a clean interface for CRUD operations on guest profiles.
 * Isolates WordPress-specific database calls from business logic,
 * enabling future migration to other backends.
 *
 * @package GMKB
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Profile Repository Interface
 *
 * Defines the contract for profile data access.
 * Implement this interface to swap storage backends.
 */
interface GMKB_Profile_Repository_Interface {

    /**
     * Get a complete profile by ID
     *
     * @param int $id Post ID
     * @return array|null Profile data or null if not found
     */
    public function get(int $id): ?array;

    /**
     * Get a single field value
     *
     * @param int $id Post ID
     * @param string $field Field key
     * @return mixed Field value
     */
    public function get_field(int $id, string $field);

    /**
     * Update multiple fields
     *
     * @param int $id Post ID
     * @param array $data Associative array of field => value
     * @return array Result with 'success', 'updated', and 'errors' keys
     */
    public function update(int $id, array $data): array;

    /**
     * Update a single field
     *
     * @param int $id Post ID
     * @param string $field Field key
     * @param mixed $value Field value
     * @return bool|WP_Error True on success, WP_Error on failure
     */
    public function update_field(int $id, string $field, $value);

    /**
     * Delete a profile
     *
     * @param int $id Post ID
     * @return bool True on success
     */
    public function delete(int $id): bool;

    /**
     * Create a new profile
     *
     * @param array $data Initial profile data
     * @return int|WP_Error Post ID on success, WP_Error on failure
     */
    public function create(array $data);

    /**
     * List profiles for a user
     *
     * @param int $user_id User ID
     * @return array Array of profile summaries
     */
    public function list_for_user(int $user_id): array;
}

/**
 * WordPress Profile Repository
 *
 * Implements ProfileRepositoryInterface using WordPress post meta.
 */
class GMKB_Profile_Repository implements GMKB_Profile_Repository_Interface {

    /**
     * Post type for profiles
     */
    const POST_TYPE = 'guests';

    /**
     * Get a complete profile by ID
     *
     * @param int $id Post ID
     * @return array|null Profile data or null if not found
     */
    public function get(int $id): ?array {
        $post = get_post($id);

        if (!$post || $post->post_type !== self::POST_TYPE) {
            return null;
        }

        // Get all field keys from schema
        $field_keys = GMKB_Profile_Schema::get_all_field_keys();

        // Fetch all field values
        $profile_data = [];
        foreach ($field_keys as $field) {
            $value = get_post_meta($id, $field, true);

            // Expand image fields
            if (GMKB_Profile_Schema::is_image_field($field)) {
                $profile_data[$field] = $this->expand_image($value);
            }
            // Expand gallery fields
            elseif (GMKB_Profile_Schema::is_gallery_field($field)) {
                $profile_data[$field] = $this->expand_gallery($value);
            }
            // Regular fields
            else {
                $profile_data[$field] = $value;
            }
        }

        // Add post metadata
        $profile_data['_post'] = [
            'id' => $id,
            'title' => $post->post_title,
            'slug' => $post->post_name,
            'status' => $post->post_status,
            'created' => $post->post_date,
            'modified' => $post->post_modified,
            'author' => (int) $post->post_author,
            'permalink' => get_permalink($id),
        ];

        // Add taxonomy data
        $profile_data['_taxonomies'] = [
            'topic_category' => wp_get_post_terms($id, 'topic_category', ['fields' => 'all']),
            'layout' => wp_get_post_terms($id, 'layout', ['fields' => 'all']),
        ];

        return $profile_data;
    }

    /**
     * Get a single field value
     *
     * @param int $id Post ID
     * @param string $field Field key
     * @return mixed Field value
     */
    public function get_field(int $id, string $field) {
        $value = get_post_meta($id, $field, true);

        // Expand if image/gallery field
        if (GMKB_Profile_Schema::is_image_field($field)) {
            return $this->expand_image($value);
        }
        if (GMKB_Profile_Schema::is_gallery_field($field)) {
            return $this->expand_gallery($value);
        }

        return $value;
    }

    /**
     * Update multiple fields
     *
     * @param int $id Post ID
     * @param array $data Associative array of field => value
     * @return array Result with 'success', 'updated', and 'errors' keys
     */
    public function update(int $id, array $data): array {
        $updated = [];
        $errors = [];

        foreach ($data as $field => $value) {
            // Skip internal fields
            if (strpos($field, '_') === 0) {
                continue;
            }

            $result = $this->update_field($id, $field, $value);

            if (is_wp_error($result)) {
                $errors[$field] = $result->get_error_message();
            } else {
                $updated[$field] = $value;
            }
        }

        // Update post modified time
        wp_update_post([
            'ID' => $id,
            'post_modified' => current_time('mysql'),
            'post_modified_gmt' => current_time('mysql', true),
        ]);

        return [
            'success' => empty($errors),
            'updated' => $updated,
            'errors' => $errors,
        ];
    }

    /**
     * Update a single field
     *
     * @param int $id Post ID
     * @param string $field Field key
     * @param mixed $value Field value
     * @return bool|WP_Error True on success, WP_Error on failure
     */
    public function update_field(int $id, string $field, $value) {
        // Validate field exists in schema (allow unknown fields for flexibility)
        if (!GMKB_Profile_Schema::has_field($field)) {
            // For unknown fields, just sanitize as text
            $value = sanitize_text_field($value);
        } else {
            // Validate the value
            $validation = GMKB_Profile_Schema::validate($field, $value);
            if (is_wp_error($validation)) {
                return $validation;
            }

            // Sanitize the value
            $value = GMKB_Profile_Schema::sanitize($field, $value);
        }

        // Handle special post title field
        if ($field === 'full_name') {
            wp_update_post([
                'ID' => $id,
                'post_title' => $value,
            ]);
        }

        // Save to post meta
        $result = update_post_meta($id, $field, $value);

        if ($result === false) {
            return new WP_Error('save_failed', "Failed to save {$field}");
        }

        return true;
    }

    /**
     * Delete a profile (move to trash)
     *
     * @param int $id Post ID
     * @return bool True on success
     */
    public function delete(int $id): bool {
        $result = wp_trash_post($id);
        return $result !== false;
    }

    /**
     * Create a new profile
     *
     * @param array $data Initial profile data
     * @return int|WP_Error Post ID on success, WP_Error on failure
     */
    public function create(array $data) {
        $user_id = get_current_user_id();

        $first_name = isset($data['first_name']) ? sanitize_text_field($data['first_name']) : '';
        $last_name = isset($data['last_name']) ? sanitize_text_field($data['last_name']) : '';

        // Generate title
        $title = trim("{$first_name} {$last_name}");
        if (empty($title)) {
            $title = 'New Profile';
        }

        // Create the post
        $post_id = wp_insert_post([
            'post_type' => self::POST_TYPE,
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

        return $post_id;
    }

    /**
     * List profiles for a user
     *
     * @param int $user_id User ID
     * @return array Array of profile summaries
     */
    public function list_for_user(int $user_id): array {
        $profiles = [];
        $found_ids = [];

        // Query 1: Profiles owned by user (via owner_user_id or legacy user_id meta)
        $owner_query = new WP_Query([
            'post_type' => self::POST_TYPE,
            'posts_per_page' => -1,
            'post_status' => ['publish', 'draft', 'pending'],
            'orderby' => 'modified',
            'order' => 'DESC',
            'meta_query' => [
                'relation' => 'OR',
                [
                    'key' => 'owner_user_id',
                    'value' => $user_id,
                    'compare' => '=',
                ],
                [
                    'key' => 'user_id',
                    'value' => $user_id,
                    'compare' => '=',
                ],
            ],
        ]);

        foreach ($owner_query->posts as $post) {
            $profiles[] = $this->format_profile_card($post);
            $found_ids[] = $post->ID;
        }

        // Query 2: Profiles authored by user without explicit owner
        $author_query = new WP_Query([
            'post_type' => self::POST_TYPE,
            'posts_per_page' => -1,
            'post_status' => ['publish', 'draft', 'pending'],
            'author' => $user_id,
            'post__not_in' => $found_ids ?: [0],
            'meta_query' => [
                'relation' => 'AND',
                [
                    'relation' => 'OR',
                    ['key' => 'owner_user_id', 'compare' => 'NOT EXISTS'],
                    ['key' => 'owner_user_id', 'value' => '', 'compare' => '='],
                ],
                [
                    'relation' => 'OR',
                    ['key' => 'user_id', 'compare' => 'NOT EXISTS'],
                    ['key' => 'user_id', 'value' => '', 'compare' => '='],
                ],
            ],
        ]);

        foreach ($author_query->posts as $post) {
            $profiles[] = $this->format_profile_card($post);
        }

        // Sort by modified date
        usort($profiles, function($a, $b) {
            return strtotime($b['modified']) - strtotime($a['modified']);
        });

        return $profiles;
    }

    /**
     * Check if a user owns a profile
     *
     * @param int $post_id Post ID
     * @param int $user_id User ID
     * @return bool
     */
    public function is_owner(int $post_id, int $user_id): bool {
        // Check owner_user_id first (highest priority)
        $owner_id = get_post_meta($post_id, 'owner_user_id', true);
        if (!empty($owner_id)) {
            return (int) $owner_id === $user_id;
        }

        // Check legacy user_id field
        $legacy_user_id = get_post_meta($post_id, 'user_id', true);
        if (!empty($legacy_user_id)) {
            return (int) $legacy_user_id === $user_id;
        }

        // Fallback to post author
        $post = get_post($post_id);
        return $post && (int) $post->post_author === $user_id;
    }

    /**
     * Calculate profile completeness
     *
     * @param int $post_id Post ID
     * @return int Percentage (0-100)
     */
    public function calculate_completeness(int $post_id): int {
        $required_fields = GMKB_Profile_Schema::COMPLETENESS_FIELDS;
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
     * Format profile data for card display
     *
     * @param WP_Post $post Post object
     * @return array Card data
     */
    private function format_profile_card(WP_Post $post): array {
        $post_id = $post->ID;

        $first_name = get_post_meta($post_id, 'first_name', true);
        $last_name = get_post_meta($post_id, 'last_name', true);
        $headshot = get_post_meta($post_id, 'headshot_primary', true);
        $tagline = get_post_meta($post_id, 'tagline', true);

        $display_name = trim("{$first_name} {$last_name}");
        if (empty($display_name)) {
            $display_name = $post->post_title;
        }

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
            'completeness' => $this->calculate_completeness($post_id),
            'created' => $post->post_date,
            'modified' => $post->post_modified,
            'editUrl' => "/app/profiles/guest/profile/?entry={$post->post_name}",
            'viewUrl' => get_permalink($post_id),
        ];
    }

    /**
     * Expand image attachment ID to full data
     *
     * @param mixed $attachment_id Attachment ID
     * @return array|null Image data or null
     */
    private function expand_image($attachment_id): ?array {
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
     * Expand gallery field to array of image data
     *
     * @param mixed $value Gallery value (array or comma-separated string)
     * @return array Array of image data
     */
    private function expand_gallery($value): array {
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
            $expanded = $this->expand_image($id);
            if ($expanded) {
                $images[] = $expanded;
            }
        }

        return $images;
    }

    /**
     * Export a profile as portable JSON
     * Useful for migration to other systems
     *
     * @param int $id Post ID
     * @return array|null Portable profile data
     */
    public function export(int $id): ?array {
        $profile = $this->get($id);

        if (!$profile) {
            return null;
        }

        // Remove WordPress-specific metadata
        unset($profile['_post']['author']);
        unset($profile['_taxonomies']);

        // Add export metadata
        $profile['_export'] = [
            'version' => '1.0',
            'exported_at' => current_time('c'),
            'schema_version' => '2.0',
        ];

        return $profile;
    }

    /**
     * Import a profile from portable JSON
     *
     * @param array $data Profile data
     * @param int|null $user_id Owner user ID (defaults to current user)
     * @return int|WP_Error Post ID on success
     */
    public function import(array $data, ?int $user_id = null) {
        $user_id = $user_id ?? get_current_user_id();

        // Create the profile
        $post_id = $this->create([
            'first_name' => $data['first_name'] ?? '',
            'last_name' => $data['last_name'] ?? '',
        ]);

        if (is_wp_error($post_id)) {
            return $post_id;
        }

        // Remove metadata fields
        unset($data['_post']);
        unset($data['_taxonomies']);
        unset($data['_export']);

        // Update all fields
        $this->update($post_id, $data);

        return $post_id;
    }
}
