<?php
/**
 * Field Name Migration Map
 *
 * Maps legacy Pods field names to new standardized names.
 * Used during transition period for backward compatibility.
 *
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
     * Fields that should be preserved as-is (no migration needed)
     */
    const PRESERVED_FIELDS = [
        'first_name', 'last_name', 'full_name', 'email', 'phone',
        'biography', 'biography_medium', 'biography_long', 'introduction',
        'authority_hook', 'tagline', 'guest_title', 'company',
        'address', 'city', 'state', 'zip', 'country', 'timezone', 'skype',
        'headshot', 'guest_headshot', 'profile_photo',
        'personal_brand_logo', 'company_logo',
        'horizontal_image', 'vertical_image',
        'gallery_photos', 'featured_logos',
        'video_intro', 'calendar_url',
        'owner_user_id', 'gmkb_media_kit_state', 'gmkb_selected_theme',
    ];

    /**
     * Get field value with fallback to legacy name
     *
     * @param int $post_id Post ID
     * @param string $field_name Field name to retrieve
     * @return mixed Field value
     */
    public static function get_field($post_id, $field_name) {
        // Try the requested name first
        $value = get_post_meta($post_id, $field_name, true);

        if (!empty($value)) {
            return self::normalize_value($value, $field_name);
        }

        // Check if this is a new name, try legacy
        $legacy_name = array_search($field_name, self::FIELD_MAP);
        if ($legacy_name) {
            $value = get_post_meta($post_id, $legacy_name, true);
            if (!empty($value)) {
                return self::normalize_value($value, $field_name);
            }
        }

        // Check if this IS a legacy name, try new name
        if (isset(self::FIELD_MAP[$field_name])) {
            $value = get_post_meta($post_id, self::FIELD_MAP[$field_name], true);
            if (!empty($value)) {
                return self::normalize_value($value, $field_name);
            }
        }

        // For numbered fields, try alternate formats
        if (preg_match('/^(topic|question|offer)_(\d+)$/', $field_name, $matches)) {
            $prefix = $matches[1];
            $num = intval($matches[2]);
            
            // Try with leading zero
            $alt_name = sprintf('%s_%02d', $prefix, $num);
            if ($alt_name !== $field_name) {
                $value = get_post_meta($post_id, $alt_name, true);
                if (!empty($value)) {
                    return self::normalize_value($value, $field_name);
                }
            }
            
            // Try without leading zero
            $alt_name = sprintf('%s_%d', $prefix, $num);
            if ($alt_name !== $field_name) {
                $value = get_post_meta($post_id, $alt_name, true);
                if (!empty($value)) {
                    return self::normalize_value($value, $field_name);
                }
            }
        }

        return $value;
    }

    /**
     * Set field value, updating both legacy and new names during transition
     *
     * @param int $post_id Post ID
     * @param string $field_name Field name
     * @param mixed $value Value to set
     * @param bool $sync_both Whether to sync both field names
     * @return bool Success
     */
    public static function set_field($post_id, $field_name, $value, $sync_both = true) {
        // Normalize the value before saving
        $value = self::prepare_value_for_storage($value, $field_name);

        // Update the requested field
        $result = update_post_meta($post_id, $field_name, $value);

        // During transition, also update the corresponding name
        if ($sync_both) {
            // If using new name, also update legacy
            $legacy_name = array_search($field_name, self::FIELD_MAP);
            if ($legacy_name) {
                update_post_meta($post_id, $legacy_name, $value);
            }

            // If using legacy name, also update new
            if (isset(self::FIELD_MAP[$field_name])) {
                update_post_meta($post_id, self::FIELD_MAP[$field_name], $value);
            }
        }

        return $result !== false;
    }

    /**
     * Normalize a value based on field type
     *
     * @param mixed $value Raw value
     * @param string $field_name Field name for context
     * @return mixed Normalized value
     */
    private static function normalize_value($value, $field_name) {
        // Handle Pods media array format
        if (self::is_media_field($field_name)) {
            if (is_array($value) && isset($value['ID'])) {
                return intval($value['ID']);
            }
            if (is_array($value) && isset($value['id'])) {
                return intval($value['id']);
            }
            return intval($value);
        }

        // Handle serialized arrays
        if (self::is_array_field($field_name)) {
            $value = maybe_unserialize($value);
            if (is_array($value)) {
                // Normalize array items
                return array_values(array_map(function($item) {
                    if (is_array($item) && isset($item['ID'])) {
                        return intval($item['ID']);
                    }
                    if (is_array($item) && isset($item['id'])) {
                        return intval($item['id']);
                    }
                    return is_numeric($item) ? intval($item) : $item;
                }, $value));
            }
        }

        return $value;
    }

    /**
     * Prepare value for storage
     *
     * @param mixed $value Value to prepare
     * @param string $field_name Field name for context
     * @return mixed Prepared value
     */
    private static function prepare_value_for_storage($value, $field_name) {
        // Ensure media fields are stored as integers
        if (self::is_media_field($field_name)) {
            if (is_array($value) && isset($value['ID'])) {
                return intval($value['ID']);
            }
            if (is_array($value) && isset($value['id'])) {
                return intval($value['id']);
            }
            return intval($value);
        }

        // Array fields should be arrays of integers
        if (self::is_array_field($field_name)) {
            if (!is_array($value)) {
                return [];
            }
            return array_values(array_map(function($item) {
                if (is_array($item) && isset($item['ID'])) {
                    return intval($item['ID']);
                }
                if (is_array($item) && isset($item['id'])) {
                    return intval($item['id']);
                }
                return is_numeric($item) ? intval($item) : $item;
            }, $value));
        }

        return $value;
    }

    /**
     * Check if field is a media field
     */
    private static function is_media_field($field_name) {
        return in_array($field_name, [
            'headshot', 'guest_headshot', 'profile_photo',
            'personal_brand_logo', 'company_logo',
            'horizontal_image', 'vertical_image',
        ]);
    }

    /**
     * Check if field is an array field
     */
    private static function is_array_field($field_name) {
        return in_array($field_name, [
            'gallery_photos', 'featured_logos',
        ]);
    }

    /**
     * Migrate a post's fields from legacy to new names
     *
     * @param int $post_id Post ID
     * @return array Migration results
     */
    public static function migrate_post($post_id) {
        $migrated = [];

        foreach (self::FIELD_MAP as $legacy => $new) {
            $legacy_value = get_post_meta($post_id, $legacy, true);

            if (!empty($legacy_value)) {
                // Copy to new field (normalized)
                $normalized = self::normalize_value($legacy_value, $new);
                update_post_meta($post_id, $new, $normalized);
                $migrated[$legacy] = [
                    'new_name' => $new,
                    'value_type' => gettype($normalized),
                ];
            }
        }

        // Mark as migrated
        update_post_meta($post_id, '_gmkb_fields_migrated', time());
        update_post_meta($post_id, '_gmkb_schema_version', GMKB_Core_Schema::get_version());

        return $migrated;
    }

    /**
     * Batch migrate all posts
     *
     * @param int $batch_size Number of posts per batch
     * @return array Migration results
     */
    public static function migrate_all($batch_size = 50) {
        $posts = get_posts([
            'post_type' => ['guests', 'mkcg'],
            'posts_per_page' => $batch_size,
            'post_status' => ['publish', 'draft', 'private', 'pending'],
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
            $results[$post->ID] = [
                'title' => $post->post_title,
                'fields_migrated' => count($migrated),
                'details' => $migrated,
            ];
        }

        return [
            'processed' => count($posts),
            'details' => $results,
            'remaining' => self::count_remaining(),
        ];
    }

    /**
     * Count posts not yet migrated
     *
     * @return int Number of posts remaining
     */
    public static function count_remaining() {
        global $wpdb;

        return (int) $wpdb->get_var("
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
     * Get migration status
     *
     * @return array Migration status
     */
    public static function get_status() {
        global $wpdb;

        $total = (int) $wpdb->get_var("
            SELECT COUNT(*) FROM {$wpdb->posts}
            WHERE post_type IN ('guests', 'mkcg')
        ");

        $migrated = (int) $wpdb->get_var("
            SELECT COUNT(DISTINCT post_id) FROM {$wpdb->postmeta}
            WHERE meta_key = '_gmkb_fields_migrated'
        ");

        return [
            'total_posts' => $total,
            'migrated' => $migrated,
            'remaining' => $total - $migrated,
            'percentage' => $total > 0 ? round(($migrated / $total) * 100, 1) : 0,
        ];
    }

    /**
     * Reset migration status for a post (for re-migration)
     *
     * @param int $post_id Post ID
     * @return bool Success
     */
    public static function reset_migration($post_id) {
        return delete_post_meta($post_id, '_gmkb_fields_migrated');
    }

    /**
     * Reset all migration status
     *
     * @return int Number of posts reset
     */
    public static function reset_all_migrations() {
        global $wpdb;

        return $wpdb->query("
            DELETE FROM {$wpdb->postmeta}
            WHERE meta_key = '_gmkb_fields_migrated'
        ");
    }
}

/**
 * Register migration admin page and AJAX handlers
 */
add_action('admin_menu', function() {
    add_submenu_page(
        'tools.php',
        __('GMKB Field Migration', 'gmkb'),
        __('GMKB Migration', 'gmkb'),
        'manage_options',
        'gmkb-field-migration',
        'gmkb_render_migration_page'
    );
});

/**
 * Render migration admin page
 */
function gmkb_render_migration_page() {
    if (!current_user_can('manage_options')) {
        wp_die(__('Unauthorized', 'gmkb'));
    }

    // Handle actions
    $message = '';
    if (isset($_POST['gmkb_migrate_batch']) && check_admin_referer('gmkb_migrate_fields')) {
        $result = GMKB_Field_Migration::migrate_all(50);
        $message = sprintf(
            __('Migrated %d posts. %d remaining.', 'gmkb'),
            $result['processed'],
            $result['remaining']
        );
    }

    if (isset($_POST['gmkb_reset_all']) && check_admin_referer('gmkb_migrate_fields')) {
        $count = GMKB_Field_Migration::reset_all_migrations();
        $message = sprintf(__('Reset migration status for %d posts.', 'gmkb'), $count);
    }

    $status = GMKB_Field_Migration::get_status();
    ?>
    <div class="wrap">
        <h1><?php _e('GMKB Field Migration', 'gmkb'); ?></h1>

        <?php if ($message): ?>
        <div class="notice notice-success is-dismissible">
            <p><?php echo esc_html($message); ?></p>
        </div>
        <?php endif; ?>

        <div class="card">
            <h2><?php _e('Migration Status', 'gmkb'); ?></h2>
            <table class="widefat" style="max-width: 400px;">
                <tr><th><?php _e('Total Posts', 'gmkb'); ?></th><td><?php echo $status['total_posts']; ?></td></tr>
                <tr><th><?php _e('Migrated', 'gmkb'); ?></th><td><?php echo $status['migrated']; ?></td></tr>
                <tr><th><?php _e('Remaining', 'gmkb'); ?></th><td><?php echo $status['remaining']; ?></td></tr>
                <tr><th><?php _e('Progress', 'gmkb'); ?></th><td><?php echo $status['percentage']; ?>%</td></tr>
            </table>

            <div style="margin-top: 20px;">
                <progress value="<?php echo $status['migrated']; ?>" max="<?php echo $status['total_posts']; ?>" style="width: 300px; height: 20px;"></progress>
            </div>
        </div>

        <div class="card" style="margin-top: 20px;">
            <h2><?php _e('Actions', 'gmkb'); ?></h2>
            <form method="post">
                <?php wp_nonce_field('gmkb_migrate_fields'); ?>

                <p>
                    <button type="submit" name="gmkb_migrate_batch" class="button button-primary">
                        <?php _e('Migrate Next 50 Posts', 'gmkb'); ?>
                    </button>
                </p>

                <p style="margin-top: 20px;">
                    <button type="submit" name="gmkb_reset_all" class="button" onclick="return confirm('Are you sure? This will reset all migration status.');">
                        <?php _e('Reset All Migration Status', 'gmkb'); ?>
                    </button>
                </p>
            </form>
        </div>

        <div class="card" style="margin-top: 20px;">
            <h2><?php _e('Field Mapping Reference', 'gmkb'); ?></h2>
            <table class="widefat striped">
                <thead>
                    <tr>
                        <th><?php _e('Legacy Name (Pods)', 'gmkb'); ?></th>
                        <th><?php _e('New Name (Native)', 'gmkb'); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach (GMKB_Field_Migration::FIELD_MAP as $legacy => $new): ?>
                    <tr>
                        <td><code><?php echo esc_html($legacy); ?></code></td>
                        <td><code><?php echo esc_html($new); ?></code></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
    <?php
}
