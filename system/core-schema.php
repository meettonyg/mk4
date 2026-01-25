<?php
/**
 * GMKB Core Schema Definition
 *
 * Native WordPress CPT and meta field registration.
 * Replaces Pods UI-defined schema with code-first approach.
 *
 * Phase 2 of Native Data Layer Migration
 * @package GMKB
 * @since 3.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Core_Schema {

    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('init', [$this, 'register_post_types'], 5);
        add_action('init', [$this, 'register_taxonomies'], 5);
        add_action('init', [$this, 'register_meta_fields'], 6);
    }

    /**
     * Register Custom Post Types
     */
    public function register_post_types() {

        // Brand Kit CPT - Standalone brand identity assets
        register_post_type('gmkb_brand_kit', [
            'labels' => [
                'name' => __('Brand Kits', 'gmkb'),
                'singular_name' => __('Brand Kit', 'gmkb'),
                'add_new' => __('Add New Brand Kit', 'gmkb'),
                'add_new_item' => __('Add New Brand Kit', 'gmkb'),
                'edit_item' => __('Edit Brand Kit', 'gmkb'),
                'view_item' => __('View Brand Kit', 'gmkb'),
                'search_items' => __('Search Brand Kits', 'gmkb'),
                'not_found' => __('No brand kits found', 'gmkb'),
                'not_found_in_trash' => __('No brand kits found in trash', 'gmkb'),
            ],
            'public' => false,
            'publicly_queryable' => false,
            'show_ui' => true,
            'show_in_menu' => 'edit.php?post_type=guests',
            'show_in_rest' => true,
            'rest_base' => 'brand-kits',
            'rest_controller_class' => 'WP_REST_Posts_Controller',
            'capability_type' => 'post',
            'map_meta_cap' => true,
            'has_archive' => false,
            'hierarchical' => false,
            'menu_icon' => 'dashicons-art',
            'supports' => [
                'title',
                'author',
                'revisions',
                'custom-fields',
            ],
        ]);

        // Primary Media Kit CPT
        register_post_type('guests', [
            'labels' => [
                'name' => __('Media Kits', 'gmkb'),
                'singular_name' => __('Media Kit', 'gmkb'),
                'add_new' => __('Add New Media Kit', 'gmkb'),
                'add_new_item' => __('Add New Media Kit', 'gmkb'),
                'edit_item' => __('Edit Media Kit', 'gmkb'),
                'view_item' => __('View Media Kit', 'gmkb'),
                'search_items' => __('Search Media Kits', 'gmkb'),
                'not_found' => __('No media kits found', 'gmkb'),
            ],
            'public' => true,
            'publicly_queryable' => true,
            'show_ui' => true,
            'show_in_menu' => true,
            'show_in_rest' => true,
            'rest_base' => 'media-kits',
            'rest_controller_class' => 'WP_REST_Posts_Controller',
            'capability_type' => 'post',
            'has_archive' => true,
            'hierarchical' => false,
            'menu_position' => 25,
            'menu_icon' => 'dashicons-id-alt',
            'supports' => [
                'title',
                'editor',
                'thumbnail',
                'custom-fields',
                'revisions',
            ],
            'rewrite' => [
                'slug' => 'media-kit',
                'with_front' => false,
            ],
        ]);

        // Offers CPT - Reusable offer assets for Media Kits
        register_post_type('gmkb_offer', [
            'labels' => [
                'name' => __('Offers', 'gmkb'),
                'singular_name' => __('Offer', 'gmkb'),
                'add_new' => __('Add New Offer', 'gmkb'),
                'add_new_item' => __('Add New Offer', 'gmkb'),
                'edit_item' => __('Edit Offer', 'gmkb'),
                'view_item' => __('View Offer', 'gmkb'),
                'search_items' => __('Search Offers', 'gmkb'),
                'not_found' => __('No offers found', 'gmkb'),
                'not_found_in_trash' => __('No offers found in trash', 'gmkb'),
            ],
            'public' => false,
            'publicly_queryable' => false,
            'show_ui' => true,
            'show_in_menu' => 'edit.php?post_type=guests',
            'show_in_rest' => true,
            'rest_base' => 'offers',
            'rest_controller_class' => 'WP_REST_Posts_Controller',
            'capability_type' => 'post',
            'map_meta_cap' => true,
            'menu_icon' => 'dashicons-tag',
            'supports' => [
                'title',
                'editor',
                'author',
                'revisions',
                'custom-fields',
            ],
        ]);

        // BRIDGE ARCHITECTURE: gmkb_interview CPT DISABLED
        // Interview data is sourced from legacy ShowAuthority plugin table: wp_showauthority_appearances
        // The prepare_interviews_field() method and GMKB_Interviews_API now bridge to that legacy data.
        //
        // register_post_type('gmkb_interview', [
        //     'labels' => [
        //         'name' => __('Interviews', 'gmkb'),
        //         'singular_name' => __('Interview', 'gmkb'),
        //         'add_new' => __('Add New Interview', 'gmkb'),
        //         'add_new_item' => __('Add New Interview', 'gmkb'),
        //         'edit_item' => __('Edit Interview', 'gmkb'),
        //         'view_item' => __('View Interview', 'gmkb'),
        //         'search_items' => __('Search Interviews', 'gmkb'),
        //         'not_found' => __('No interviews found', 'gmkb'),
        //         'not_found_in_trash' => __('No interviews found in trash', 'gmkb'),
        //     ],
        //     'public' => false,
        //     'publicly_queryable' => false,
        //     'show_ui' => true,
        //     'show_in_menu' => 'edit.php?post_type=guests',
        //     'show_in_rest' => true,
        //     'rest_base' => 'interviews',
        //     'rest_controller_class' => 'WP_REST_Posts_Controller',
        //     'capability_type' => 'post',
        //     'map_meta_cap' => true,
        //     'menu_icon' => 'dashicons-microphone',
        //     'supports' => [
        //         'title',
        //         'editor',
        //         'author',
        //         'thumbnail',
        //         'revisions',
        //         'custom-fields',
        //     ],
        // ]);
    }

    /**
     * Register Taxonomies
     */
    public function register_taxonomies() {
        // Offer Type taxonomy - gift, prize, deal
        register_taxonomy('offer_type', 'gmkb_offer', [
            'labels' => [
                'name' => __('Offer Types', 'gmkb'),
                'singular_name' => __('Offer Type', 'gmkb'),
                'search_items' => __('Search Offer Types', 'gmkb'),
                'all_items' => __('All Offer Types', 'gmkb'),
                'edit_item' => __('Edit Offer Type', 'gmkb'),
                'update_item' => __('Update Offer Type', 'gmkb'),
                'add_new_item' => __('Add New Offer Type', 'gmkb'),
                'new_item_name' => __('New Offer Type Name', 'gmkb'),
                'menu_name' => __('Offer Types', 'gmkb'),
            ],
            'public' => false,
            'show_ui' => true,
            'show_in_rest' => true,
            'hierarchical' => false,
            'rewrite' => false,
        ]);

        // Insert default terms if they don't exist
        $this->ensure_offer_type_terms();
    }

    /**
     * Ensure default offer type terms exist
     */
    private function ensure_offer_type_terms() {
        $default_terms = [
            'gift' => __('Gift', 'gmkb'),
            'prize' => __('Prize', 'gmkb'),
            'deal' => __('Deal', 'gmkb'),
        ];

        foreach ($default_terms as $slug => $name) {
            if (!term_exists($slug, 'offer_type')) {
                wp_insert_term($name, 'offer_type', ['slug' => $slug]);
            }
        }
    }

    /**
     * Register all meta fields
     */
    public function register_meta_fields() {
        // Guest/Media Kit fields
        $this->register_personal_fields();
        $this->register_contact_fields();
        $this->register_social_fields();
        $this->register_content_fields();
        $this->register_media_fields();
        $this->register_system_fields();

        // Offer fields
        $this->register_offer_fields();

        // Relationship fields
        $this->register_relationship_fields();

        // Brand Kit fields
        $this->register_brand_kit_fields();
    }

    /**
     * Personal Information Fields
     */
    private function register_personal_fields() {
        $fields = [
            'first_name' => [
                'type' => 'string',
                'description' => 'First name',
                'sanitize' => 'sanitize_text_field',
            ],
            'last_name' => [
                'type' => 'string',
                'description' => 'Last name',
                'sanitize' => 'sanitize_text_field',
            ],
            'biography' => [
                'type' => 'string',
                'description' => 'Short biography',
                'sanitize' => 'wp_kses_post',
            ],
            'biography_long' => [
                'type' => 'string',
                'description' => 'Extended biography',
                'sanitize' => 'wp_kses_post',
            ],
            'introduction' => [
                'type' => 'string',
                'description' => 'Introduction text',
                'sanitize' => 'wp_kses_post',
            ],
        ];

        $this->register_field_group('guests', $fields);
    }

    /**
     * Contact Information Fields
     */
    private function register_contact_fields() {
        $fields = [
            'email' => [
                'type' => 'string',
                'description' => 'Contact email',
                'sanitize' => 'sanitize_email',
            ],
            'phone' => [
                'type' => 'string',
                'description' => 'Phone number',
                'sanitize' => 'sanitize_text_field',
            ],
            'skype' => [
                'type' => 'string',
                'description' => 'Skype username',
                'sanitize' => 'sanitize_text_field',
            ],
            'address' => [
                'type' => 'string',
                'description' => 'Street address',
                'sanitize' => 'sanitize_text_field',
            ],
            'city' => [
                'type' => 'string',
                'description' => 'City',
                'sanitize' => 'sanitize_text_field',
            ],
            'state' => [
                'type' => 'string',
                'description' => 'State/Province',
                'sanitize' => 'sanitize_text_field',
            ],
            'zip' => [
                'type' => 'string',
                'description' => 'Postal code',
                'sanitize' => 'sanitize_text_field',
            ],
            'country' => [
                'type' => 'string',
                'description' => 'Country',
                'sanitize' => 'sanitize_text_field',
            ],
            'timezone' => [
                'type' => 'string',
                'description' => 'Timezone',
                'sanitize' => 'sanitize_text_field',
            ],
        ];

        $this->register_field_group('guests', $fields);
    }

    /**
     * Social Media Fields
     */
    private function register_social_fields() {
        // Legacy field names (for backward compatibility)
        $legacy_fields = [
            '1_twitter', '1_facebook', '1_instagram', '1_linkedin',
            '1_tiktok', '1_pinterest', 'guest_youtube',
            '1_website', '2_website',
        ];

        // New standardized names
        $new_fields = [
            'social_twitter', 'social_facebook', 'social_instagram',
            'social_linkedin', 'social_tiktok', 'social_pinterest',
            'social_youtube', 'website_primary', 'website_secondary',
        ];

        $all_url_fields = array_merge($legacy_fields, $new_fields);
        $all_url_fields[] = 'video_intro';
        $all_url_fields[] = 'calendar_url';

        foreach ($all_url_fields as $field_name) {
            register_post_meta('guests', $field_name, [
                'show_in_rest' => true,
                'single' => true,
                'type' => 'string',
                'description' => 'URL field: ' . $field_name,
                'sanitize_callback' => 'esc_url_raw',
            ]);
        }
    }

    /**
     * Content Fields (Topics, Questions)
     */
    private function register_content_fields() {
        // Topics 1-5
        for ($i = 1; $i <= 5; $i++) {
            register_post_meta('guests', "topic_$i", [
                'show_in_rest' => true,
                'single' => true,
                'type' => 'string',
                'description' => "Speaking topic $i",
                'sanitize_callback' => 'sanitize_text_field',
            ]);
        }

        // Questions 1-25
        for ($i = 1; $i <= 25; $i++) {
            register_post_meta('guests', "question_$i", [
                'show_in_rest' => true,
                'single' => true,
                'type' => 'string',
                'description' => "Interview question $i",
                'sanitize_callback' => 'wp_kses_post',
            ]);
        }
    }

    /**
     * Media Fields (Images, Galleries)
     */
    private function register_media_fields() {
        // Single image fields
        $single_media = [
            'headshot', 'guest_headshot', 'profile_photo',
            'personal_brand_logo', 'company_logo',
        ];

        foreach ($single_media as $field_name) {
            register_post_meta('guests', $field_name, [
                'show_in_rest' => [
                    'schema' => ['type' => 'integer'],
                    'prepare_callback' => [$this, 'prepare_media_field'],
                ],
                'single' => true,
                'type' => 'integer',
                'description' => 'Media attachment ID: ' . $field_name,
                'sanitize_callback' => 'absint',
            ]);
        }

        // Array media fields (galleries)
        $array_media = ['gallery_photos', 'featured_logos'];

        foreach ($array_media as $field_name) {
            register_post_meta('guests', $field_name, [
                'show_in_rest' => [
                    'schema' => [
                        'type' => 'array',
                        'items' => ['type' => 'integer'],
                    ],
                    'prepare_callback' => [$this, 'prepare_gallery_field'],
                ],
                'single' => true,
                'type' => 'array',
                'description' => 'Media gallery: ' . $field_name,
                'sanitize_callback' => [$this, 'sanitize_id_array'],
            ]);
        }
    }

    /**
     * System Fields (Identity, State)
     */
    private function register_system_fields() {
        // Owner relationship (Phase 3)
        register_post_meta('guests', 'owner_user_id', [
            'show_in_rest' => true,
            'single' => true,
            'type' => 'integer',
            'description' => 'WordPress user ID who owns this media kit',
            'sanitize_callback' => 'absint',
            'auth_callback' => function() {
                return current_user_can('edit_posts');
            },
        ]);

        // Media kit builder state (existing)
        register_post_meta('guests', 'gmkb_media_kit_state', [
            'show_in_rest' => false, // Handled by custom endpoint
            'single' => true,
            'type' => 'object',
            'description' => 'Media kit builder state',
        ]);
    }

    /**
     * Helper: Register a group of fields
     */
    private function register_field_group($post_type, $fields) {
        foreach ($fields as $field_name => $config) {
            register_post_meta($post_type, $field_name, [
                'show_in_rest' => true,
                'single' => true,
                'type' => $config['type'],
                'description' => $config['description'] ?? '',
                'sanitize_callback' => $config['sanitize'] ?? 'sanitize_text_field',
            ]);
        }
    }

    /**
     * Prepare media field for REST API response
     * Expands attachment ID to full media object
     */
    public function prepare_media_field($value, $request, $args) {
        if (empty($value)) {
            return null;
        }

        // Handle Pods array format
        if (is_array($value) && isset($value['ID'])) {
            $value = $value['ID'];
        }

        $attachment_id = absint($value);
        if (!$attachment_id) {
            return null;
        }

        $attachment = get_post($attachment_id);
        if (!$attachment || $attachment->post_type !== 'attachment') {
            return null;
        }

        return [
            'id' => $attachment_id,
            'url' => wp_get_attachment_url($attachment_id),
            'alt' => get_post_meta($attachment_id, '_wp_attachment_image_alt', true),
            'title' => $attachment->post_title,
            'sizes' => $this->get_image_sizes($attachment_id),
        ];
    }

    /**
     * Prepare gallery field for REST API response
     */
    public function prepare_gallery_field($value, $request, $args) {
        if (empty($value)) {
            return [];
        }

        $value = maybe_unserialize($value);

        if (!is_array($value)) {
            return [];
        }

        return array_filter(array_map(function($item) {
            // Handle Pods array format
            $id = is_array($item) && isset($item['ID']) ? $item['ID'] : $item;
            return $this->prepare_media_field($id, null, null);
        }, $value));
    }

    /**
     * Sanitize array of IDs
     */
    public function sanitize_id_array($value) {
        if (!is_array($value)) {
            $value = maybe_unserialize($value);
        }
        if (!is_array($value)) {
            return [];
        }
        return array_map('absint', array_filter($value));
    }

    /**
     * Get image sizes for an attachment
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
     * Offer Meta Fields
     * Registered for gmkb_offer post type
     */
    private function register_offer_fields() {
        // List View Fields (needed for cards/grid)
        $list_fields = [
            'offer_format' => [
                'type' => 'string',
                'description' => 'Format: discount, trial, content, event, consultation, addon, delivery',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'offer_cta_text' => [
                'type' => 'string',
                'description' => 'Call to action button text',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'offer_url' => [
                'type' => 'string',
                'description' => 'Landing page URL',
                'sanitize_callback' => 'esc_url_raw',
            ],
            'offer_retail_value' => [
                'type' => 'number',
                'description' => 'Original retail value',
                'sanitize_callback' => function($value) { return floatval($value); },
            ],
            'offer_image_id' => [
                'type' => 'integer',
                'description' => 'Featured image attachment ID',
                'sanitize_callback' => 'absint',
            ],
            'offer_expiry_date' => [
                'type' => 'string',
                'description' => 'Expiry date (YYYY-MM-DD)',
                'sanitize_callback' => 'sanitize_text_field',
            ],
        ];

        // Detail View Fields (only loaded on single offer view)
        $detail_fields = [
            'offer_code' => [
                'type' => 'string',
                'description' => 'Promo/coupon code',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'offer_redemption_instructions' => [
                'type' => 'string',
                'description' => 'How to redeem the offer',
                'sanitize_callback' => 'wp_kses_post',
            ],
            'offer_price_cost' => [
                'type' => 'number',
                'description' => 'Cost to recipient (usually 0 for gifts)',
                'sanitize_callback' => function($value) { return floatval($value); },
            ],
            'offer_discount_percent' => [
                'type' => 'integer',
                'description' => 'Discount percentage (0-100)',
                'sanitize_callback' => 'absint',
            ],
            'offer_quantity_limit' => [
                'type' => 'integer',
                'description' => 'Limited quantity available',
                'sanitize_callback' => 'absint',
            ],
            'offer_scarcity_text' => [
                'type' => 'string',
                'description' => 'Scarcity message (e.g., "Only 5 spots available")',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'offer_video_url' => [
                'type' => 'string',
                'description' => 'Demo/promo video URL',
                'sanitize_callback' => 'esc_url_raw',
            ],
            'offer_reason' => [
                'type' => 'string',
                'description' => 'Reason for offer (holiday, thank you, etc.)',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'offer_notes' => [
                'type' => 'string',
                'description' => 'Internal notes (admin only)',
                'sanitize_callback' => 'sanitize_textarea_field',
            ],
            'offer_clicks' => [
                'type' => 'integer',
                'description' => 'Click tracking counter',
                'sanitize_callback' => 'absint',
                'default' => 0,
            ],
        ];

        // Register all offer fields
        $all_fields = array_merge($list_fields, $detail_fields);

        foreach ($all_fields as $field_name => $config) {
            register_post_meta('gmkb_offer', $field_name, [
                'show_in_rest' => true,
                'single' => true,
                'type' => $config['type'],
                'description' => $config['description'] ?? '',
                'sanitize_callback' => $config['sanitize_callback'] ?? 'sanitize_text_field',
                'default' => $config['default'] ?? null,
            ]);
        }

        // Register offer_image_id with prepare callback for full image object
        register_post_meta('gmkb_offer', 'offer_image_id', [
            'show_in_rest' => [
                'schema' => ['type' => 'integer'],
                'prepare_callback' => [$this, 'prepare_media_field'],
            ],
            'single' => true,
            'type' => 'integer',
            'description' => 'Featured image attachment ID',
            'sanitize_callback' => 'absint',
        ]);
    }

    /**
     * Relationship Fields
     * Links between CPTs (stored as ID arrays)
     */
    private function register_relationship_fields() {
        // Associated offers on guests/media kits
        register_post_meta('guests', 'associated_offers', [
            'show_in_rest' => [
                'schema' => [
                    'type' => 'array',
                    'items' => ['type' => 'integer'],
                ],
                'prepare_callback' => [$this, 'prepare_offers_field'],
            ],
            'single' => true,
            'type' => 'array',
            'description' => 'Array of associated offer IDs',
            'sanitize_callback' => [$this, 'sanitize_id_array'],
            'default' => [],
        ]);

        // Featured interviews on guests/media kits
        register_post_meta('guests', 'featured_interviews', [
            'show_in_rest' => [
                'schema' => [
                    'type' => 'array',
                    'items' => ['type' => 'integer'],
                ],
                'prepare_callback' => [$this, 'prepare_interviews_field'],
            ],
            'single' => true,
            'type' => 'array',
            'description' => 'Array of featured interview IDs',
            'sanitize_callback' => [$this, 'sanitize_id_array'],
            'default' => [],
        ]);
    }

    /**
     * Prepare associated offers field for REST API response
     * Expands offer IDs to full offer objects
     */
    public function prepare_offers_field($value, $request, $args) {
        if (empty($value)) {
            return [];
        }

        $value = maybe_unserialize($value);
        if (!is_array($value)) {
            return [];
        }

        $offers = [];
        foreach ($value as $offer_id) {
            $offer_id = absint($offer_id);
            if (!$offer_id) {
                continue;
            }

            $offer = get_post($offer_id);
            if (!$offer || $offer->post_type !== 'gmkb_offer') {
                continue;
            }

            // Build offer object with list-view fields
            $offer_data = [
                'id' => $offer_id,
                'title' => $offer->post_title,
                'status' => $offer->post_status,
                'type' => $this->get_offer_type($offer_id),
                'format' => get_post_meta($offer_id, 'offer_format', true),
                'cta_text' => get_post_meta($offer_id, 'offer_cta_text', true),
                'url' => get_post_meta($offer_id, 'offer_url', true),
                'retail_value' => (float) get_post_meta($offer_id, 'offer_retail_value', true),
                'expiry_date' => get_post_meta($offer_id, 'offer_expiry_date', true),
            ];

            // Add image if set
            $image_id = get_post_meta($offer_id, 'offer_image_id', true);
            if ($image_id) {
                $offer_data['image'] = $this->prepare_media_field($image_id, null, null);
            }

            $offers[] = $offer_data;
        }

        return $offers;
    }

    /**
     * Get offer type taxonomy term
     */
    private function get_offer_type($offer_id) {
        $terms = wp_get_object_terms($offer_id, 'offer_type', ['fields' => 'slugs']);
        return !empty($terms) && !is_wp_error($terms) ? $terms[0] : null;
    }

    /**
     * Register Brand Kit meta fields
     */
    private function register_brand_kit_fields() {
        // Load schema if available
        if (class_exists('GMKB_Brand_Kit_Schema')) {
            $fields = GMKB_Brand_Kit_Schema::get_all_fields();

            foreach ($fields as $field_name => $config) {
                register_post_meta('gmkb_brand_kit', $field_name, [
                    'show_in_rest' => true,
                    'single' => true,
                    'type' => $config['type'],
                    'description' => $config['description'] ?? '',
                    'sanitize_callback' => $config['sanitize_callback'] ?? 'sanitize_text_field',
                    'default' => $config['default'] ?? null,
                ]);
            }
        }

        // Add brand_kit_id field to guests (profiles) for linking
        register_post_meta('guests', 'brand_kit_id', [
            'show_in_rest' => true,
            'single' => true,
            'type' => 'integer',
            'description' => 'Associated Brand Kit ID',
            'sanitize_callback' => 'absint',
            'default' => 0,
        ]);
    }

    /**
     * Prepare featured interviews field for REST API response.
     * BRIDGE: Fetches interview data from PIT speaking_credits + engagements tables.
     *
     * @param mixed $value Array of speaking_credit IDs from post meta
     * @param WP_REST_Request $request REST request object
     * @param array $args Field arguments
     * @return array Hydrated interview objects
     */
    public function prepare_interviews_field($value, $request, $args) {
        if (empty($value)) {
            return [];
        }

        $value = maybe_unserialize($value);
        if (!is_array($value)) {
            return [];
        }

        global $wpdb;
        $credits_table = $wpdb->prefix . 'pit_speaking_credits';
        $engagements_table = $wpdb->prefix . 'pit_engagements';
        $podcasts_table = $wpdb->prefix . 'pit_podcasts';

        // Check if table exists
        $table_exists = $wpdb->get_var("SHOW TABLES LIKE '$credits_table'") === $credits_table;
        if (!$table_exists) {
            return [];
        }

        $interviews = [];
        $sanitized_ids = array_filter(array_map('absint', $value));

        if (!empty($sanitized_ids)) {
            $id_placeholders = implode(',', array_fill(0, count($sanitized_ids), '%d'));
            $query = $wpdb->prepare(
                "SELECT
                    sc.id,
                    sc.is_featured,
                    e.title AS episode_title,
                    e.url AS episode_url,
                    e.published_date AS episode_date,
                    e.thumbnail_url,
                    e.audio_url,
                    p.title AS podcast_name,
                    p.artwork_url AS podcast_image
                 FROM {$credits_table} sc
                 JOIN {$engagements_table} e ON sc.engagement_id = e.id
                 LEFT JOIN {$podcasts_table} p ON e.podcast_id = p.id
                 WHERE sc.id IN ($id_placeholders)",
                $sanitized_ids
            );
            $results_by_id = $wpdb->get_results($query, OBJECT_K);

            // Reorder results to match original $value order
            foreach ($sanitized_ids as $interview_id) {
                if (isset($results_by_id[$interview_id])) {
                    $interviews[] = GMKB_Interviews_API::format_interview($results_by_id[$interview_id]);
                }
            }
        }

        return $interviews;
    }
}

// Initialize
GMKB_Core_Schema::get_instance();
