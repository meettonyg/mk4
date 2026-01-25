<?php
/**
 * Brand Kit Database Migration
 *
 * Creates the brand_kit_media table and handles data migration
 * from existing profile branding data.
 *
 * @package GMKB
 * @since 3.1.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Brand_Kit_Migration {

    /**
     * Database version for this migration
     */
    const DB_VERSION = '1.0.0';

    /**
     * Option name for tracking migration version
     */
    const VERSION_OPTION = 'gmkb_brand_kit_db_version';

    /**
     * Run migrations if needed
     */
    public static function maybe_run() {
        $current_version = get_option(self::VERSION_OPTION, '0.0.0');

        if (version_compare($current_version, self::DB_VERSION, '<')) {
            self::run_migrations($current_version);
            update_option(self::VERSION_OPTION, self::DB_VERSION);
        }
    }

    /**
     * Run all migrations from current version
     */
    private static function run_migrations($from_version) {
        // Create media table (always runs on first install)
        self::create_media_table();

        // Future migrations can be added here with version checks
        // if (version_compare($from_version, '1.1.0', '<')) {
        //     self::migrate_to_1_1_0();
        // }
    }

    /**
     * Create the brand kit media table
     */
    public static function create_media_table() {
        global $wpdb;

        $table_name = $wpdb->prefix . 'gmkb_brand_kit_media';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            brand_kit_id bigint(20) unsigned NOT NULL,
            media_id bigint(20) unsigned NOT NULL,
            category varchar(50) NOT NULL DEFAULT 'photo',
            tags longtext DEFAULT NULL,
            label varchar(255) DEFAULT '',
            is_primary tinyint(1) NOT NULL DEFAULT 0,
            sort_order int(11) NOT NULL DEFAULT 0,
            metadata longtext DEFAULT NULL,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY brand_kit_id (brand_kit_id),
            KEY media_id (media_id),
            KEY category (category),
            KEY is_primary (is_primary),
            KEY sort_order (sort_order)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);

        // Log the creation
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB: Created brand_kit_media table');
        }
    }

    /**
     * Migrate existing profile branding data to brand kits
     *
     * This should be run manually or via admin action, not automatically,
     * as it creates new brand kit posts for each profile with branding data.
     *
     * @param bool $dry_run If true, only reports what would be migrated
     * @return array Migration results
     */
    public static function migrate_profile_branding($dry_run = true) {
        global $wpdb;

        $results = [
            'total_profiles' => 0,
            'profiles_with_branding' => 0,
            'brand_kits_created' => 0,
            'media_migrated' => 0,
            'errors' => [],
            'migrated' => [],
        ];

        // Find all profiles (guests) with branding data
        $profiles = get_posts([
            'post_type' => 'guests',
            'posts_per_page' => -1,
            'post_status' => 'any',
        ]);

        $results['total_profiles'] = count($profiles);

        foreach ($profiles as $profile) {
            $has_branding = self::profile_has_branding($profile->ID);

            if (!$has_branding) {
                continue;
            }

            $results['profiles_with_branding']++;

            if ($dry_run) {
                $results['migrated'][] = [
                    'profile_id' => $profile->ID,
                    'profile_name' => $profile->post_title,
                    'status' => 'would_migrate',
                ];
                continue;
            }

            // Perform actual migration
            $migration_result = self::migrate_single_profile($profile);

            if (is_wp_error($migration_result)) {
                $results['errors'][] = [
                    'profile_id' => $profile->ID,
                    'error' => $migration_result->get_error_message(),
                ];
            } else {
                $results['brand_kits_created']++;
                $results['media_migrated'] += $migration_result['media_count'];
                $results['migrated'][] = [
                    'profile_id' => $profile->ID,
                    'profile_name' => $profile->post_title,
                    'brand_kit_id' => $migration_result['brand_kit_id'],
                    'media_count' => $migration_result['media_count'],
                    'status' => 'migrated',
                ];
            }
        }

        return $results;
    }

    /**
     * Check if a profile has any branding data
     */
    private static function profile_has_branding($profile_id) {
        // Check for colors
        $color_fields = [
            'color_primary', 'color_accent', 'color_contrasting',
            'color_background', 'color_header', 'color_header_accent',
            'color_header_text', 'color_paragraph',
        ];

        foreach ($color_fields as $field) {
            $value = get_post_meta($profile_id, $field, true);
            if (!empty($value)) {
                return true;
            }
        }

        // Check for fonts
        if (get_post_meta($profile_id, 'font_primary', true) ||
            get_post_meta($profile_id, 'font_secondary', true)) {
            return true;
        }

        // Check for headshots
        $headshot_fields = ['headshot_primary', 'headshot_vertical', 'headshot_horizontal'];
        foreach ($headshot_fields as $field) {
            $value = get_post_meta($profile_id, $field, true);
            if (!empty($value)) {
                return true;
            }
        }

        // Check for logos
        $logos = get_post_meta($profile_id, 'logos', true);
        if (!empty($logos) && is_array($logos)) {
            return true;
        }

        // Check for carousel images
        $carousel = get_post_meta($profile_id, 'carousel_images', true);
        if (!empty($carousel) && is_array($carousel)) {
            return true;
        }

        return false;
    }

    /**
     * Migrate a single profile's branding data to a brand kit
     */
    private static function migrate_single_profile($profile) {
        $repository = GMKB_Brand_Kit_Repository::get_instance();

        // Prepare brand kit data from profile
        $brand_kit_data = [
            'name' => sprintf(__('%s Brand Kit', 'gmkb'), $profile->post_title),
            'visibility' => 'private',
        ];

        // Map colors (old field names to new)
        $color_mapping = [
            'color_primary' => 'color_primary',
            'color_accent' => 'color_secondary',      // accent → secondary
            'color_contrasting' => 'color_accent',    // contrasting → accent
            'color_background' => 'color_background',
            'color_header' => 'color_surface',        // header → surface
            'color_paragraph' => 'color_text',        // paragraph → text
            'color_header_text' => 'color_text_muted', // header_text → text_muted
            'color_header_accent' => 'color_link',    // header_accent → link
        ];

        foreach ($color_mapping as $old_key => $new_key) {
            $value = get_post_meta($profile->ID, $old_key, true);
            if (!empty($value)) {
                $brand_kit_data[$new_key] = $value;
            }
        }

        // Map fonts
        $font_primary = get_post_meta($profile->ID, 'font_primary', true);
        $font_secondary = get_post_meta($profile->ID, 'font_secondary', true);

        if ($font_primary) {
            $brand_kit_data['font_primary'] = $font_primary;
            $brand_kit_data['font_heading'] = $font_secondary ?: $font_primary;
        } elseif ($font_secondary) {
            $brand_kit_data['font_primary'] = $font_secondary;
            $brand_kit_data['font_heading'] = $font_secondary;
        }

        // Create the brand kit
        $brand_kit_id = $repository->create($brand_kit_data, $profile->post_author);

        if (is_wp_error($brand_kit_id)) {
            return $brand_kit_id;
        }

        // Migrate media
        $media_count = 0;

        // Migrate headshots
        $headshot_fields = [
            'headshot_primary' => ['tags' => ['primary'], 'label' => 'Primary Headshot', 'is_primary' => true],
            'headshot_vertical' => ['tags' => ['vertical'], 'label' => 'Vertical Headshot'],
            'headshot_horizontal' => ['tags' => ['horizontal'], 'label' => 'Horizontal Headshot'],
        ];

        foreach ($headshot_fields as $field => $config) {
            $value = get_post_meta($profile->ID, $field, true);
            $media_id = self::extract_media_id($value);

            if ($media_id) {
                $result = $repository->add_media($brand_kit_id, [
                    'media_id' => $media_id,
                    'category' => 'headshot',
                    'tags' => $config['tags'],
                    'label' => $config['label'],
                    'is_primary' => $config['is_primary'] ?? false,
                ]);

                if (!is_wp_error($result)) {
                    $media_count++;
                }
            }
        }

        // Migrate logos
        $logos = get_post_meta($profile->ID, 'logos', true);
        if (!empty($logos) && is_array($logos)) {
            $is_first = true;
            foreach ($logos as $logo) {
                $media_id = self::extract_media_id($logo);

                if ($media_id) {
                    $result = $repository->add_media($brand_kit_id, [
                        'media_id' => $media_id,
                        'category' => 'logo',
                        'tags' => ['brand'],
                        'label' => is_array($logo) ? ($logo['alt'] ?? '') : '',
                        'is_primary' => $is_first,
                    ]);

                    if (!is_wp_error($result)) {
                        $media_count++;
                    }
                    $is_first = false;
                }
            }
        }

        // Migrate carousel images (as logos with 'media' tag)
        $carousel = get_post_meta($profile->ID, 'carousel_images', true);
        if (!empty($carousel) && is_array($carousel)) {
            foreach ($carousel as $image) {
                $media_id = self::extract_media_id($image);

                if ($media_id) {
                    $result = $repository->add_media($brand_kit_id, [
                        'media_id' => $media_id,
                        'category' => 'logo',
                        'tags' => ['media', 'carousel'],
                        'label' => is_array($image) ? ($image['alt'] ?? '') : '',
                    ]);

                    if (!is_wp_error($result)) {
                        $media_count++;
                    }
                }
            }
        }

        // Link profile to brand kit
        update_post_meta($profile->ID, 'brand_kit_id', $brand_kit_id);

        return [
            'brand_kit_id' => $brand_kit_id,
            'media_count' => $media_count,
        ];
    }

    /**
     * Extract media ID from various formats
     */
    private static function extract_media_id($value) {
        if (empty($value)) {
            return null;
        }

        // Already an ID
        if (is_numeric($value)) {
            return absint($value);
        }

        // Array with 'id' key
        if (is_array($value) && isset($value['id'])) {
            return absint($value['id']);
        }

        // Array with 'ID' key (Pods format)
        if (is_array($value) && isset($value['ID'])) {
            return absint($value['ID']);
        }

        return null;
    }

    /**
     * Drop the media table (for uninstall)
     */
    public static function drop_media_table() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'gmkb_brand_kit_media';
        $wpdb->query("DROP TABLE IF EXISTS $table_name");
        delete_option(self::VERSION_OPTION);
    }

    /**
     * Get migration status
     */
    public static function get_status() {
        global $wpdb;

        $table_name = $wpdb->prefix . 'gmkb_brand_kit_media';
        $table_exists = $wpdb->get_var("SHOW TABLES LIKE '$table_name'") === $table_name;

        return [
            'db_version' => get_option(self::VERSION_OPTION, '0.0.0'),
            'target_version' => self::DB_VERSION,
            'table_exists' => $table_exists,
            'needs_migration' => version_compare(
                get_option(self::VERSION_OPTION, '0.0.0'),
                self::DB_VERSION,
                '<'
            ),
        ];
    }
}
