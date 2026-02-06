<?php
/**
 * Brand Kit Database Migration
 *
 * Creates database tables for:
 * - brand_kit_media: Legacy media tied directly to brand kits
 * - gmkb_media_library: Standalone media library (independent of brand kits)
 * - gmkb_brand_kit_media_links: Many-to-many links between media library and brand kits
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
     * Increment when adding new tables or schema changes
     */
    const DB_VERSION = '2.0.0';

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
            self::create_media_table();
            self::create_media_library_tables();
            update_option(self::VERSION_OPTION, self::DB_VERSION);
        }
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

        GMKB_Logger::info('GMKB: Created brand_kit_media table');
    }

    /**
     * Create the standalone media library tables
     */
    public static function create_media_library_tables() {
        if (class_exists('GMKB_Media_Library_Schema')) {
            GMKB_Media_Library_Schema::create_tables();

            GMKB_Logger::info('GMKB: Created media_library tables');
        }
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
     * Drop all media library tables (for uninstall)
     */
    public static function drop_media_library_tables() {
        global $wpdb;
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}gmkb_media_library");
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}gmkb_brand_kit_media_links");
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
