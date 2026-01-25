<?php
/**
 * Media Library Schema Definition
 *
 * Defines the data structure for standalone Media Library items.
 * Media can exist independently and be linked to multiple Brand Kits.
 *
 * @package GMKB
 * @since 3.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Media_Library_Schema {

    /**
     * Media library table name (without prefix)
     */
    const TABLE_NAME = 'gmkb_media_library';

    /**
     * Brand kit media links table name (without prefix)
     */
    const LINKS_TABLE_NAME = 'gmkb_brand_kit_media_links';

    /**
     * Media categories with their metadata
     */
    public static function get_categories() {
        return [
            'headshot' => [
                'label' => __('Headshots & Portraits', 'gmkb'),
                'icon' => 'dashicons-admin-users',
                'description' => __('Professional photos of the speaker', 'gmkb'),
                'suggested_tags' => ['primary', 'vertical', 'horizontal', 'casual', 'formal'],
            ],
            'logo' => [
                'label' => __('Logos & Brand Assets', 'gmkb'),
                'icon' => 'dashicons-building',
                'description' => __('Brand logos, client logos, media logos', 'gmkb'),
                'suggested_tags' => ['brand', 'client', 'media', 'certification', 'partner'],
            ],
            'photo' => [
                'label' => __('Photos & Gallery', 'gmkb'),
                'icon' => 'dashicons-format-gallery',
                'description' => __('Speaking photos, event photos, action shots', 'gmkb'),
                'suggested_tags' => ['speaking', 'event', 'action', 'team', 'behind-scenes'],
            ],
            'background' => [
                'label' => __('Backgrounds & Textures', 'gmkb'),
                'icon' => 'dashicons-art',
                'description' => __('Background images, patterns, textures', 'gmkb'),
                'suggested_tags' => ['hero', 'section', 'pattern', 'texture'],
            ],
        ];
    }

    /**
     * Get table schema for media library
     */
    public static function get_table_schema() {
        global $wpdb;
        $table_name = $wpdb->prefix . self::TABLE_NAME;
        $charset_collate = $wpdb->get_charset_collate();

        return "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            media_id bigint(20) unsigned NOT NULL,
            category varchar(50) NOT NULL DEFAULT 'photo',
            label varchar(255) DEFAULT '',
            alt varchar(255) DEFAULT '',
            tags longtext,
            metadata longtext,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY media_id (media_id),
            KEY category (category)
        ) $charset_collate;";
    }

    /**
     * Get table schema for brand kit media links (many-to-many)
     */
    public static function get_links_table_schema() {
        global $wpdb;
        $table_name = $wpdb->prefix . self::LINKS_TABLE_NAME;
        $charset_collate = $wpdb->get_charset_collate();

        return "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            brand_kit_id bigint(20) unsigned NOT NULL,
            media_library_id bigint(20) unsigned NOT NULL,
            is_primary tinyint(1) DEFAULT 0,
            sort_order int(11) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY brand_media_unique (brand_kit_id, media_library_id),
            KEY brand_kit_id (brand_kit_id),
            KEY media_library_id (media_library_id)
        ) $charset_collate;";
    }

    /**
     * Create tables
     */
    public static function create_tables() {
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

        dbDelta(self::get_table_schema());
        dbDelta(self::get_links_table_schema());
    }

    /**
     * Validate media data
     *
     * @param array $data Data to validate
     * @return array|WP_Error Validated data or error
     */
    public static function validate($data) {
        $errors = [];

        // media_id is required
        if (empty($data['media_id'])) {
            $errors[] = __('Media ID is required', 'gmkb');
        } else {
            // Verify attachment exists
            $attachment = get_post($data['media_id']);
            if (!$attachment || $attachment->post_type !== 'attachment') {
                $errors[] = __('Invalid media attachment', 'gmkb');
            }
        }

        // Validate category
        if (!empty($data['category'])) {
            $valid_categories = array_keys(self::get_categories());
            if (!in_array($data['category'], $valid_categories)) {
                $errors[] = __('Invalid media category', 'gmkb');
            }
        }

        if (!empty($errors)) {
            return new WP_Error('validation_error', implode(', ', $errors));
        }

        return $data;
    }
}
