<?php
/**
 * Field Name Migration Map
 *
 * Maps legacy Pods field names to new standardized names.
 * Used during transition period for backward compatibility.
 *
 * Phase 2 of Native Data Layer Migration
 * @package GMKB
 * @since 3.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Field_Migration {

    /**
     * Legacy to new field name mapping
     */
    const FIELD_MAP = [
        // Social Media
        '1_twitter' => 'social_twitter',
        '1_facebook' => 'social_facebook',
        '1_instagram' => 'social_instagram',
        '1_linkedin' => 'social_linkedin',
        '1_tiktok' => 'social_tiktok',
        '1_pinterest' => 'social_pinterest',
        'guest_youtube' => 'social_youtube',

        // Websites
        '1_website' => 'website_primary',
        '2_website' => 'website_secondary',
    ];

    /**
     * Get field value with fallback to legacy name
     */
    public static function get_field($post_id, $field_name) {
        // Try new name first
        $value = get_post_meta($post_id, $field_name, true);

        if (!empty($value)) {
            return $value;
        }

        // Try legacy name
        $legacy_name = array_search($field_name, self::FIELD_MAP);
        if ($legacy_name) {
            return get_post_meta($post_id, $legacy_name, true);
        }

        // Try if this IS a legacy name
        if (isset(self::FIELD_MAP[$field_name])) {
            return get_post_meta($post_id, self::FIELD_MAP[$field_name], true);
        }

        return $value;
    }

    /**
     * Migrate a post's fields from legacy to new names
     */
    public static function migrate_post($post_id) {
        $migrated = [];

        foreach (self::FIELD_MAP as $legacy => $new) {
            $legacy_value = get_post_meta($post_id, $legacy, true);

            if (!empty($legacy_value)) {
                // Copy to new field
                update_post_meta($post_id, $new, $legacy_value);
                $migrated[$legacy] = $new;
            }
        }

        return $migrated;
    }

    /**
     * Batch migrate all posts
     */
    public static function migrate_all($batch_size = 50) {
        $posts = get_posts([
            'post_type' => ['guests', 'mkcg'],
            'posts_per_page' => $batch_size,
            'meta_query' => [
                [
                    'key' => '_gmkb_fields_migrated',
                    'compare' => 'NOT EXISTS',
                ],
            ],
        ]);

        $results = [];

        foreach ($posts as $post) {
            $migrated = self::migrate_post($post->ID);
            update_post_meta($post->ID, '_gmkb_fields_migrated', time());
            $results[$post->ID] = $migrated;
        }

        return [
            'processed' => count($posts),
            'details' => $results,
            'remaining' => self::count_remaining(),
        ];
    }

    /**
     * Count posts not yet migrated
     */
    public static function count_remaining() {
        global $wpdb;

        return $wpdb->get_var("
            SELECT COUNT(*)
            FROM {$wpdb->posts} p
            LEFT JOIN {$wpdb->postmeta} pm
                ON p.ID = pm.post_id
                AND pm.meta_key = '_gmkb_fields_migrated'
            WHERE p.post_type IN ('guests', 'mkcg')
            AND pm.meta_id IS NULL
        ");
    }

    /**
     * Get all social links for a post (using both legacy and new names)
     */
    public static function get_social_links($post_id) {
        $platforms = [
            'twitter' => ['social_twitter', '1_twitter'],
            'facebook' => ['social_facebook', '1_facebook'],
            'instagram' => ['social_instagram', '1_instagram'],
            'linkedin' => ['social_linkedin', '1_linkedin'],
            'tiktok' => ['social_tiktok', '1_tiktok'],
            'pinterest' => ['social_pinterest', '1_pinterest'],
            'youtube' => ['social_youtube', 'guest_youtube'],
        ];

        $links = [];
        foreach ($platforms as $platform => $fields) {
            foreach ($fields as $field) {
                $value = get_post_meta($post_id, $field, true);
                if (!empty($value)) {
                    $links[$platform] = $value;
                    break; // Use first found value
                }
            }
        }

        return $links;
    }

    /**
     * Get website URLs for a post
     */
    public static function get_websites($post_id) {
        $websites = [];

        $primary = get_post_meta($post_id, 'website_primary', true)
            ?: get_post_meta($post_id, '1_website', true);
        if ($primary) {
            $websites['primary'] = $primary;
        }

        $secondary = get_post_meta($post_id, 'website_secondary', true)
            ?: get_post_meta($post_id, '2_website', true);
        if ($secondary) {
            $websites['secondary'] = $secondary;
        }

        return $websites;
    }
}

// Register admin migration endpoint
add_action('admin_init', function() {
    if (!isset($_GET['gmkb_migrate_fields'])) {
        return;
    }

    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized');
    }

    $batch_size = isset($_GET['batch_size']) ? absint($_GET['batch_size']) : 50;
    $results = GMKB_Field_Migration::migrate_all($batch_size);

    header('Content-Type: application/json');
    echo json_encode($results, JSON_PRETTY_PRINT);
    exit;
});

// WP-CLI support for migration
if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command('gmkb migrate-fields', function($args, $assoc_args) {
        $batch_size = isset($assoc_args['batch']) ? absint($assoc_args['batch']) : 50;
        $all = isset($assoc_args['all']);

        WP_CLI::log('Starting field migration...');

        $total_processed = 0;
        do {
            $results = GMKB_Field_Migration::migrate_all($batch_size);
            $total_processed += $results['processed'];

            WP_CLI::log("Processed {$results['processed']} posts. Remaining: {$results['remaining']}");

            if (!$all || $results['remaining'] == 0) {
                break;
            }
        } while ($results['remaining'] > 0);

        WP_CLI::success("Migration complete. Total processed: {$total_processed}");
    });
}
