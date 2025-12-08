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
        add_action('init', [$this, 'register_meta_fields'], 6);
    }

    /**
     * Register Custom Post Types
     */
    public function register_post_types() {

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

        // Legacy CPT (if needed for backward compatibility)
        register_post_type('mkcg', [
            'labels' => [
                'name' => __('Media Kit CG (Legacy)', 'gmkb'),
            ],
            'public' => false,
            'show_in_rest' => true,
            'rest_base' => 'media-kits-legacy',
            'supports' => ['title', 'custom-fields'],
        ]);
    }

    /**
     * Register all meta fields
     */
    public function register_meta_fields() {
        $this->register_personal_fields();
        $this->register_contact_fields();
        $this->register_social_fields();
        $this->register_content_fields();
        $this->register_media_fields();
        $this->register_system_fields();
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
}

// Initialize
GMKB_Core_Schema::get_instance();
