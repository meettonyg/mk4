<?php
/**
 * GMKB Permission Helpers
 *
 * Implements owner-based permission model for headless architecture.
 *
 * Phase 3 of Native Data Layer Migration
 * @package GMKB
 * @since 3.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Permissions {

    /**
     * Check if user can view a media kit
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

        // Otherwise, must be owner
        return self::is_owner($post_id, $user_id);
    }

    /**
     * Check if user can edit a media kit
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

        return self::is_owner($post_id, $user_id);
    }

    /**
     * Check if user owns a media kit
     */
    public static function is_owner($post_id, $user_id = null) {
        if ($user_id === null) {
            $user_id = get_current_user_id();
        }

        if (!$user_id) {
            return false;
        }

        // Check owner_user_id meta field
        $owner_id = get_post_meta($post_id, 'owner_user_id', true);
        if ($owner_id && absint($owner_id) === absint($user_id)) {
            return true;
        }

        // Check legacy user_id field (from Formidable)
        $legacy_user_id = get_post_meta($post_id, 'user_id', true);
        if ($legacy_user_id && absint($legacy_user_id) === absint($user_id)) {
            return true;
        }

        // Fallback to post author during migration
        $post = get_post($post_id);
        if ($post && absint($post->post_author) === absint($user_id)) {
            return true;
        }

        return false;
    }

    /**
     * Get all media kits owned by a user
     */
    public static function get_user_media_kits($user_id = null) {
        if ($user_id === null) {
            $user_id = get_current_user_id();
        }

        $posts = [];
        $found_ids = [];

        // Query 1: Get profiles by owner_user_id or legacy user_id
        $owner_query = new WP_Query([
            'post_type' => 'guests',
            'posts_per_page' => -1,
            'post_status' => ['publish', 'draft', 'private', 'pending'],
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
            $posts[] = $post;
            $found_ids[] = $post->ID;
        }

        // Query 2: Get profiles by post author (fallback for posts without owner fields)
        $author_query = new WP_Query([
            'post_type' => 'guests',
            'posts_per_page' => -1,
            'post_status' => ['publish', 'draft', 'private', 'pending'],
            'author' => $user_id,
            'post__not_in' => $found_ids ?: [0],
        ]);

        foreach ($author_query->posts as $post) {
            $posts[] = $post;
        }

        return $posts;
    }

    /**
     * REST API permission callback for GET requests
     */
    public static function rest_permission_callback($request) {
        $post_id = $request->get_param('id');
        $method = $request->get_method();

        if ($method === 'GET') {
            return self::can_view($post_id);
        }

        return self::can_edit($post_id);
    }

    /**
     * REST API permission callback for edit requests
     */
    public static function rest_edit_permission_callback($request) {
        $post_id = $request->get_param('id');
        return self::can_edit($post_id);
    }

    /**
     * REST API permission callback for create requests
     */
    public static function rest_create_permission_callback($request) {
        return is_user_logged_in();
    }

    /**
     * Check if current user can create a new media kit
     */
    public static function can_create($user_id = null) {
        if ($user_id === null) {
            $user_id = get_current_user_id();
        }

        if (!$user_id) {
            return false;
        }

        // Any logged-in user can create media kits by default
        return true;
    }

    /**
     * Check if current user can delete a media kit
     */
    public static function can_delete($post_id, $user_id = null) {
        if ($user_id === null) {
            $user_id = get_current_user_id();
        }

        if (!$user_id) {
            return false;
        }

        // Only admins and owners can delete
        if (user_can($user_id, 'manage_options')) {
            return true;
        }

        return self::is_owner($post_id, $user_id);
    }

    /**
     * Set the owner of a media kit
     */
    public static function set_owner($post_id, $user_id) {
        return update_post_meta($post_id, 'owner_user_id', absint($user_id));
    }

    /**
     * Get the owner ID of a media kit
     */
    public static function get_owner($post_id) {
        // Check owner_user_id first
        $owner_id = get_post_meta($post_id, 'owner_user_id', true);
        if (!empty($owner_id)) {
            return absint($owner_id);
        }

        // Fallback to legacy user_id field (from Formidable)
        $legacy_user_id = get_post_meta($post_id, 'user_id', true);
        if (!empty($legacy_user_id)) {
            return absint($legacy_user_id);
        }

        // Final fallback to post author
        $post = get_post($post_id);
        return $post ? absint($post->post_author) : 0;
    }

    /**
     * Transfer ownership of a media kit
     */
    public static function transfer_ownership($post_id, $new_owner_id, $current_user_id = null) {
        // Must be current owner or admin to transfer
        if (!self::can_edit($post_id, $current_user_id)) {
            return new WP_Error('unauthorized', 'You do not have permission to transfer this media kit.');
        }

        // Verify new owner exists
        $new_owner = get_user_by('id', $new_owner_id);
        if (!$new_owner) {
            return new WP_Error('invalid_user', 'The specified user does not exist.');
        }

        $result = self::set_owner($post_id, $new_owner_id);

        if ($result) {
            do_action('gmkb_ownership_transferred', $post_id, $new_owner_id, self::get_owner($post_id));
        }

        return $result;
    }
}

// Backfill owner_user_id function (run once via admin or WP-CLI)
function gmkb_backfill_owner_user_id() {
    $posts = get_posts([
        'post_type' => ['guests', 'mkcg'],
        'posts_per_page' => -1,
        'meta_query' => [
            [
                'key' => 'owner_user_id',
                'compare' => 'NOT EXISTS',
            ],
        ],
    ]);

    $count = 0;
    foreach ($posts as $post) {
        // Prefer legacy user_id field if set, otherwise use post_author
        $legacy_user_id = get_post_meta($post->ID, 'user_id', true);
        $owner_id = !empty($legacy_user_id) ? absint($legacy_user_id) : $post->post_author;
        update_post_meta($post->ID, 'owner_user_id', $owner_id);
        $count++;
    }

    return $count;
}

// Register admin backfill endpoint
add_action('admin_init', function() {
    if (!isset($_GET['gmkb_backfill_owners'])) {
        return;
    }

    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized');
    }

    $count = gmkb_backfill_owner_user_id();

    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'message' => "Backfilled owner_user_id for {$count} posts.",
        'count' => $count,
    ], JSON_PRETTY_PRINT);
    exit;
});

// WP-CLI support for backfill
if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command('gmkb backfill-owners', function() {
        $count = gmkb_backfill_owner_user_id();
        WP_CLI::success("Backfilled owner_user_id for {$count} posts.");
    });
}

// Hook into post creation to set owner automatically
add_action('save_post_guests', function($post_id, $post, $update) {
    if ($update) {
        return; // Only on new posts
    }

    $owner_id = get_post_meta($post_id, 'owner_user_id', true);
    if (empty($owner_id)) {
        GMKB_Permissions::set_owner($post_id, $post->post_author);
    }
}, 10, 3);
