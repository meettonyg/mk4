<?php
/**
 * GMKB Core Schema Definition
 *
 * Native WordPress CPT and meta field registration.
 * Replaces Pods UI-defined schema with code-first approach.
 *
 * @package GMKB
 * @since 3.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Core_Schema {

    private static $instance = null;

    /**
     * Schema version for migrations
     */
    const SCHEMA_VERSION = '3.0.0';

    /**
     * Get singleton instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Private constructor for singleton
     */
    private function __construct() {
        // Hook into init with priority 5 (before most plugins)
        add_action('init', [$this, 'register_post_types'], 5);
        add_action('init', [$this, 'register_meta_fields'], 6);
        
        // REST API customizations
        add_action('rest_api_init', [$this, 'register_rest_fields']);
    }

    /**
     * Initialize the schema system
     */
    public static function init() {
        return self::get_instance();
    }

    /**
     * Register Custom Post Types
     */
    public function register_post_types() {
        // Only register if Pods hasn't already registered it
        if (!post_type_exists('guests')) {
            $this->register_guests_cpt();
        }

        // Register legacy CPT if needed for backward compatibility
        if (!post_type_exists('mkcg')) {
            $this->register_mkcg_cpt();
        }
    }

    /**
     * Register the guests (Media Kit) Custom Post Type
     */
    private function register_guests_cpt() {
        register_post_type('guests', [
            'labels' => [
                'name' => __('Media Kits', 'gmkb'),
                'singular_name' => __('Media Kit', 'gmkb'),
                'add_new' => __('Add New Media Kit', 'gmkb'),
                'add_new_item' => __('Add New Media Kit', 'gmkb'),
                'edit_item' => __('Edit Media Kit', 'gmkb'),
                'new_item' => __('New Media Kit', 'gmkb'),
                'view_item' => __('View Media Kit', 'gmkb'),
                'view_items' => __('View Media Kits', 'gmkb'),
                'search_items' => __('Search Media Kits', 'gmkb'),
                'not_found' => __('No media kits found', 'gmkb'),
                'not_found_in_trash' => __('No media kits found in trash', 'gmkb'),
                'all_items' => __('All Media Kits', 'gmkb'),
                'archives' => __('Media Kit Archives', 'gmkb'),
                'attributes' => __('Media Kit Attributes', 'gmkb'),
            ],
            'public' => true,
            'publicly_queryable' => true,
            'show_ui' => true,
            'show_in_menu' => true,
            'show_in_nav_menus' => true,
            'show_in_admin_bar' => true,
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
                'excerpt',
            ],
            'rewrite' => [
                'slug' => 'media-kit',
                'with_front' => false,
            ],
            'delete_with_user' => false,
        ]);
    }

    /**
     * Register the mkcg (Legacy) Custom Post Type
     */
    private function register_mkcg_cpt() {
        register_post_type('mkcg', [
            'labels' => [
                'name' => __('Media Kit CG (Legacy)', 'gmkb'),
                'singular_name' => __('Media Kit CG', 'gmkb'),
            ],
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => 'edit.php?post_type=guests',
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
                'description' => __('First name', 'gmkb'),
                'sanitize' => 'sanitize_text_field',
            ],
            'last_name' => [
                'type' => 'string',
                'description' => __('Last name', 'gmkb'),
                'sanitize' => 'sanitize_text_field',
            ],
            'full_name' => [
                'type' => 'string',
                'description' => __('Full name', 'gmkb'),
                'sanitize' => 'sanitize_text_field',
            ],
            'guest_title' => [
                'type' => 'string',
                'description' => __('Professional title', 'gmkb'),
                'sanitize' => 'sanitize_text_field',
            ],
            'company' => [
                'type' => 'string',
                'description' => __('Company name', 'gmkb'),
                'sanitize' => 'sanitize_text_field',
            ],
            'biography' => [
                'type' => 'string',
                'description' => __('Short biography', 'gmkb'),
                'sanitize' => 'wp_kses_post',
            ],
            'biography_medium' => [
                'type' => 'string',
                'description' => __('Medium biography', 'gmkb'),
                'sanitize' => 'wp_kses_post',
            ],
            'biography_long' => [
                'type' => 'string',
                'description' => __('Extended biography', 'gmkb'),
                'sanitize' => 'wp_kses_post',
            ],
            'introduction' => [
                'type' => 'string',
                'description' => __('Introduction text', 'gmkb'),
                'sanitize' => 'wp_kses_post',
            ],
            'authority_hook' => [
                'type' => 'string',
                'description' => __('Authority hook / tagline', 'gmkb'),
                'sanitize' => 'sanitize_text_field',
            ],
            'tagline' => [
                'type' => 'string',
                'description' => __('Tagline', 'gmkb'),
                'sanitize' => 'sanitize_text_field',
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
                'description' => __('Contact email', 'gmkb'),
                'sanitize' => 'sanitize_email',
            ],
            'phone' => [
                'type' => 'string',
                'description' => __('Phone number', 'gmkb'),
                'sanitize' => 'sanitize_text_field',
            ],
            'skype' => [
                'type' => 'string',
                'description' => __('Skype username', 'gmkb'),
                'sanitize' => 'sanitize_text_field',
            ],
            'address' => [
                'type' => 'string',
                'description' => __('Street address', 'gmkb'),
                'sanitize' => 'sanitize_text_field',
            ],
            'city' => [
                'type' => 'string',
                'description' => __('City', 'gmkb'),
                'sanitize' => 'sanitize_text_field',
            ],
            'state' => [
                'type' => 'string',
                'description' => __('State/Province', 'gmkb'),
                'sanitize' => 'sanitize_text_field',
            ],
            'zip' => [
                'type' => 'string',
                'description' => __('Postal code', 'gmkb'),
                'sanitize' => 'sanitize_text_field',
            ],
            'country' => [
                'type' => 'string',
                'description' => __('Country', 'gmkb'),
                'sanitize' => 'sanitize_text_field',
            ],
            'timezone' => [
                'type' => 'string',
                'description' => __('Timezone', 'gmkb'),
                'sanitize' => 'sanitize_text_field',
            ],
        ];

        $this->register_field_group('guests', $fields);
    }

    /**
     * Social Media Fields
     */
    private function register_social_fields() {
        // Legacy field names (for backward compatibility with Pods)
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
     * Content Fields (Topics, Questions, Offers)
     */
    private function register_content_fields() {
        // Topics 1-10
        for ($i = 1; $i <= 10; $i++) {
            register_post_meta('guests', "topic_$i", [
                'show_in_rest' => true,
                'single' => true,
                'type' => 'string',
                'description' => "Speaking topic $i",
                'sanitize_callback' => 'wp_kses_post',
            ]);
        }

        // Questions 1-25
        for ($i = 1; $i <= 25; $i++) {
            $field_name = $i < 10 ? "question_0$i" : "question_$i";
            register_post_meta('guests', $field_name, [
                'show_in_rest' => true,
                'single' => true,
                'type' => 'string',
                'description' => "Interview question $i",
                'sanitize_callback' => 'wp_kses_post',
            ]);
            
            // Also register without leading zero for compatibility
            if ($i < 10) {
                register_post_meta('guests', "question_$i", [
                    'show_in_rest' => true,
                    'single' => true,
                    'type' => 'string',
                    'description' => "Interview question $i (alt)",
                    'sanitize_callback' => 'wp_kses_post',
                ]);
            }
        }

        // Offers 1-5
        for ($i = 1; $i <= 5; $i++) {
            register_post_meta('guests', "offer_$i", [
                'show_in_rest' => true,
                'single' => true,
                'type' => 'string',
                'description' => "Offer $i",
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
            'horizontal_image', 'vertical_image',
        ];

        foreach ($single_media as $field_name) {
            register_post_meta('guests', $field_name, [
                'show_in_rest' => [
                    'schema' => [
                        'type' => ['integer', 'object', 'null'],
                        'properties' => [
                            'ID' => ['type' => 'integer'],
                            'id' => ['type' => 'integer'],
                            'url' => ['type' => 'string'],
                        ],
                    ],
                    'prepare_callback' => [$this, 'prepare_media_field'],
                ],
                'single' => true,
                'type' => 'integer',
                'description' => 'Media attachment ID: ' . $field_name,
                'sanitize_callback' => [$this, 'sanitize_media_field'],
            ]);
        }

        // Array media fields (galleries)
        $array_media = ['gallery_photos', 'featured_logos'];

        foreach ($array_media as $field_name) {
            register_post_meta('guests', $field_name, [
                'show_in_rest' => [
                    'schema' => [
                        'type' => 'array',
                        'items' => [
                            'type' => ['integer', 'object'],
                        ],
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
        // Owner relationship
        register_post_meta('guests', 'owner_user_id', [
            'show_in_rest' => true,
            'single' => true,
            'type' => 'integer',
            'description' => __('WordPress user ID who owns this media kit', 'gmkb'),
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
            'description' => __('Media kit builder state', 'gmkb'),
        ]);

        // Selected theme
        register_post_meta('guests', 'gmkb_selected_theme', [
            'show_in_rest' => true,
            'single' => true,
            'type' => 'string',
            'description' => __('Selected theme for media kit', 'gmkb'),
            'sanitize_callback' => 'sanitize_text_field',
        ]);

        // Schema version tracking
        register_post_meta('guests', '_gmkb_schema_version', [
            'show_in_rest' => false,
            'single' => true,
            'type' => 'string',
            'description' => __('Schema version used when creating/updating', 'gmkb'),
            'sanitize_callback' => 'sanitize_text_field',
        ]);
    }

    /**
     * Register additional REST fields
     */
    public function register_rest_fields() {
        // Computed full name field
        register_rest_field('guests', 'computed_full_name', [
            'get_callback' => function($post) {
                $first = get_post_meta($post['id'], 'first_name', true);
                $last = get_post_meta($post['id'], 'last_name', true);
                return trim("$first $last");
            },
            'schema' => [
                'type' => 'string',
                'description' => __('Computed full name from first and last name', 'gmkb'),
            ],
        ]);

        // Social links as array
        register_rest_field('guests', 'social_links', [
            'get_callback' => [$this, 'get_social_links'],
            'schema' => [
                'type' => 'array',
                'items' => [
                    'type' => 'object',
                    'properties' => [
                        'platform' => ['type' => 'string'],
                        'url' => ['type' => 'string'],
                        'username' => ['type' => 'string'],
                    ],
                ],
            ],
        ]);

        // Topics as array
        register_rest_field('guests', 'topics_array', [
            'get_callback' => [$this, 'get_topics_array'],
            'schema' => [
                'type' => 'array',
                'items' => ['type' => 'string'],
            ],
        ]);

        // Questions as array
        register_rest_field('guests', 'questions_array', [
            'get_callback' => [$this, 'get_questions_array'],
            'schema' => [
                'type' => 'array',
                'items' => ['type' => 'string'],
            ],
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
     * Sanitize media field (handle both ID and array format)
     */
    public function sanitize_media_field($value) {
        // If array with ID (Pods format), extract ID
        if (is_array($value) && isset($value['ID'])) {
            return absint($value['ID']);
        }
        if (is_array($value) && isset($value['id'])) {
            return absint($value['id']);
        }
        return absint($value);
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
        } elseif (is_array($value) && isset($value['id'])) {
            $value = $value['id'];
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

        return array_values(array_filter(array_map(function($item) {
            // Handle Pods array format
            $id = is_array($item) && isset($item['ID']) ? $item['ID'] : $item;
            if (is_array($item) && isset($item['id'])) {
                $id = $item['id'];
            }
            return $this->prepare_media_field($id, null, null);
        }, $value)));
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
        return array_values(array_map(function($item) {
            if (is_array($item) && isset($item['ID'])) {
                return absint($item['ID']);
            }
            if (is_array($item) && isset($item['id'])) {
                return absint($item['id']);
            }
            return absint($item);
        }, array_filter($value)));
    }

    /**
     * Get image sizes for an attachment
     */
    private function get_image_sizes($attachment_id) {
        $sizes = [];
        $available_sizes = ['thumbnail', 'medium', 'medium_large', 'large', 'full'];

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
     * Get social links as structured array
     */
    public function get_social_links($post) {
        $links = [];
        $platforms = [
            'twitter' => ['1_twitter', 'social_twitter'],
            'facebook' => ['1_facebook', 'social_facebook'],
            'instagram' => ['1_instagram', 'social_instagram'],
            'linkedin' => ['1_linkedin', 'social_linkedin'],
            'tiktok' => ['1_tiktok', 'social_tiktok'],
            'pinterest' => ['1_pinterest', 'social_pinterest'],
            'youtube' => ['guest_youtube', 'social_youtube'],
        ];

        foreach ($platforms as $platform => $field_names) {
            $url = '';
            foreach ($field_names as $field) {
                $value = get_post_meta($post['id'], $field, true);
                if (!empty($value)) {
                    $url = $value;
                    break;
                }
            }

            if ($url) {
                $links[] = [
                    'platform' => $platform,
                    'url' => $url,
                    'username' => $this->extract_username_from_url($url, $platform),
                ];
            }
        }

        return $links;
    }

    /**
     * Get topics as array
     */
    public function get_topics_array($post) {
        $topics = [];
        for ($i = 1; $i <= 10; $i++) {
            $topic = get_post_meta($post['id'], "topic_$i", true);
            if (!empty($topic)) {
                $topics[] = $topic;
            }
        }
        return $topics;
    }

    /**
     * Get questions as array
     */
    public function get_questions_array($post) {
        $questions = [];
        for ($i = 1; $i <= 25; $i++) {
            $field = $i < 10 ? "question_0$i" : "question_$i";
            $question = get_post_meta($post['id'], $field, true);
            if (empty($question)) {
                // Try alternate format
                $question = get_post_meta($post['id'], "question_$i", true);
            }
            if (!empty($question)) {
                $questions[] = $question;
            }
        }
        return $questions;
    }

    /**
     * Extract username from social URL
     */
    private function extract_username_from_url($url, $platform) {
        if (empty($url)) {
            return '';
        }

        $patterns = [
            'twitter' => '/twitter\.com\/([^\/\?]+)/i',
            'facebook' => '/facebook\.com\/([^\/\?]+)/i',
            'instagram' => '/instagram\.com\/([^\/\?]+)/i',
            'linkedin' => '/linkedin\.com\/in\/([^\/\?]+)/i',
            'tiktok' => '/tiktok\.com\/@?([^\/\?]+)/i',
            'youtube' => '/youtube\.com\/(channel|c|user|@)\/([^\/\?]+)/i',
        ];

        if (!isset($patterns[$platform])) {
            return '';
        }

        if (preg_match($patterns[$platform], $url, $matches)) {
            // YouTube has nested group
            if ($platform === 'youtube' && isset($matches[2])) {
                return $matches[2];
            }
            return $matches[1] ?? '';
        }

        return '';
    }

    /**
     * Get the schema version
     */
    public static function get_version() {
        return self::SCHEMA_VERSION;
    }
}

// Initialize the schema
add_action('plugins_loaded', ['GMKB_Core_Schema', 'init'], 5);
