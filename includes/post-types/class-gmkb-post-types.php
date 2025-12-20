<?php
/**
 * GMKB Post Types - Pitch and Interview CPTs
 *
 * Registers Custom Post Types for the Onboarding System:
 * - gmkb_pitch: Stores pitch submissions (replaces Formidable Form 621)
 * - gmkb_interview: Stores interview opportunities (replaces Formidable Form 518)
 *
 * @package GMKB
 * @since 3.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Post_Types {

    /**
     * Singleton instance
     *
     * @var GMKB_Post_Types|null
     */
    private static $instance = null;

    /**
     * Get singleton instance
     *
     * @return GMKB_Post_Types
     */
    public static function get_instance(): GMKB_Post_Types {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor - register hooks
     */
    private function __construct() {
        add_action('init', [$this, 'register_post_types'], 5);
        add_action('init', [$this, 'register_meta_fields'], 6);
    }

    /**
     * Register Custom Post Types
     */
    public function register_post_types(): void {
        // Pitch CPT - Replaces Formidable Form 621
        register_post_type('gmkb_pitch', [
            'labels' => [
                'name'               => __('Pitches', 'gmkb'),
                'singular_name'      => __('Pitch', 'gmkb'),
                'add_new'            => __('Add New Pitch', 'gmkb'),
                'add_new_item'       => __('Add New Pitch', 'gmkb'),
                'edit_item'          => __('Edit Pitch', 'gmkb'),
                'view_item'          => __('View Pitch', 'gmkb'),
                'search_items'       => __('Search Pitches', 'gmkb'),
                'not_found'          => __('No pitches found', 'gmkb'),
                'not_found_in_trash' => __('No pitches found in trash', 'gmkb'),
                'all_items'          => __('All Pitches', 'gmkb'),
            ],
            'public'              => false,
            'publicly_queryable'  => false,
            'show_ui'             => true,
            'show_in_menu'        => 'edit.php?post_type=guests',
            'show_in_rest'        => true,
            'rest_base'           => 'pitches',
            'rest_controller_class' => 'WP_REST_Posts_Controller',
            'capability_type'     => 'post',
            'map_meta_cap'        => true,
            'hierarchical'        => false,
            'menu_icon'           => 'dashicons-email-alt',
            'supports'            => [
                'title',
                'editor',
                'author',
                'custom-fields',
            ],
            'rewrite'             => false,
        ]);

        // Interview CPT - Replaces Formidable Form 518
        // Stores interview opportunity submissions and tracking
        register_post_type('gmkb_interview', [
            'labels' => [
                'name'               => __('Interviews', 'gmkb'),
                'singular_name'      => __('Interview', 'gmkb'),
                'add_new'            => __('Add New Interview', 'gmkb'),
                'add_new_item'       => __('Add New Interview', 'gmkb'),
                'edit_item'          => __('Edit Interview', 'gmkb'),
                'view_item'          => __('View Interview', 'gmkb'),
                'search_items'       => __('Search Interviews', 'gmkb'),
                'not_found'          => __('No interviews found', 'gmkb'),
                'not_found_in_trash' => __('No interviews found in trash', 'gmkb'),
                'all_items'          => __('All Interviews', 'gmkb'),
            ],
            'public'              => false,
            'publicly_queryable'  => false,
            'show_ui'             => true,
            'show_in_menu'        => 'edit.php?post_type=guests',
            'show_in_rest'        => true,
            'rest_base'           => 'interviews',
            'rest_controller_class' => 'WP_REST_Posts_Controller',
            'capability_type'     => 'post',
            'map_meta_cap'        => true,
            'hierarchical'        => true,  // Supports parent-child relationships
            'menu_icon'           => 'dashicons-microphone',
            'supports'            => [
                'title',
                'editor',
                'author',
                'thumbnail',
                'custom-fields',
            ],
            'rewrite'             => false,
        ]);
    }

    /**
     * Register meta fields for Pitch and Interview CPTs
     */
    public function register_meta_fields(): void {
        $this->register_pitch_fields();
        $this->register_interview_fields();
    }

    /**
     * Register Pitch CPT meta fields
     */
    private function register_pitch_fields(): void {
        $fields = [
            // Target podcast/show information
            'pitch_podcast_name' => [
                'type'        => 'string',
                'description' => 'Target podcast name',
                'sanitize'    => 'sanitize_text_field',
            ],
            'pitch_podcast_url' => [
                'type'        => 'string',
                'description' => 'Target podcast URL',
                'sanitize'    => 'esc_url_raw',
            ],
            'pitch_host_name' => [
                'type'        => 'string',
                'description' => 'Podcast host name',
                'sanitize'    => 'sanitize_text_field',
            ],
            'pitch_host_email' => [
                'type'        => 'string',
                'description' => 'Podcast host email',
                'sanitize'    => 'sanitize_email',
            ],

            // Pitch content
            'pitch_subject' => [
                'type'        => 'string',
                'description' => 'Email subject line',
                'sanitize'    => 'sanitize_text_field',
            ],
            'pitch_body' => [
                'type'        => 'string',
                'description' => 'Pitch email body content',
                'sanitize'    => 'wp_kses_post',
            ],
            'pitch_template_id' => [
                'type'        => 'integer',
                'description' => 'Template used for this pitch',
                'sanitize'    => 'absint',
            ],

            // Status tracking
            'pitch_status' => [
                'type'        => 'string',
                'description' => 'Pitch status: draft, sent, opened, replied, booked, declined',
                'sanitize'    => 'sanitize_text_field',
            ],
            'pitch_sent_at' => [
                'type'        => 'string',
                'description' => 'Timestamp when pitch was sent',
                'sanitize'    => 'sanitize_text_field',
            ],
            'pitch_opened_at' => [
                'type'        => 'string',
                'description' => 'Timestamp when pitch was opened (if tracked)',
                'sanitize'    => 'sanitize_text_field',
            ],
            'pitch_replied_at' => [
                'type'        => 'string',
                'description' => 'Timestamp when host replied',
                'sanitize'    => 'sanitize_text_field',
            ],

            // Related profile
            'pitch_profile_id' => [
                'type'        => 'integer',
                'description' => 'Related guest profile ID',
                'sanitize'    => 'absint',
            ],

            // Opportunity reference (from Prospector)
            'pitch_opportunity_id' => [
                'type'        => 'integer',
                'description' => 'Related opportunity ID from PIT tables',
                'sanitize'    => 'absint',
            ],

            // Analytics
            'pitch_follow_up_count' => [
                'type'        => 'integer',
                'description' => 'Number of follow-up emails sent',
                'sanitize'    => 'absint',
            ],
            'pitch_notes' => [
                'type'        => 'string',
                'description' => 'Internal notes about this pitch',
                'sanitize'    => 'sanitize_textarea_field',
            ],
        ];

        foreach ($fields as $field_name => $config) {
            register_post_meta('gmkb_pitch', $field_name, [
                'show_in_rest'      => true,
                'single'            => true,
                'type'              => $config['type'],
                'description'       => $config['description'] ?? '',
                'sanitize_callback' => $config['sanitize'] ?? 'sanitize_text_field',
            ]);
        }
    }

    /**
     * Register Interview CPT meta fields
     */
    private function register_interview_fields(): void {
        $fields = [
            // Podcast information
            'interview_podcast_name' => [
                'type'        => 'string',
                'description' => 'Podcast name',
                'sanitize'    => 'sanitize_text_field',
            ],
            'interview_podcast_url' => [
                'type'        => 'string',
                'description' => 'Podcast URL',
                'sanitize'    => 'esc_url_raw',
            ],
            'interview_podcast_artwork' => [
                'type'        => 'string',
                'description' => 'Podcast artwork URL',
                'sanitize'    => 'esc_url_raw',
            ],

            // Episode information
            'interview_episode_title' => [
                'type'        => 'string',
                'description' => 'Episode title',
                'sanitize'    => 'sanitize_text_field',
            ],
            'interview_episode_url' => [
                'type'        => 'string',
                'description' => 'Episode URL',
                'sanitize'    => 'esc_url_raw',
            ],
            'interview_episode_audio' => [
                'type'        => 'string',
                'description' => 'Episode audio file URL',
                'sanitize'    => 'esc_url_raw',
            ],
            'interview_published_date' => [
                'type'        => 'string',
                'description' => 'Episode publish date (YYYY-MM-DD)',
                'sanitize'    => 'sanitize_text_field',
            ],
            'interview_duration' => [
                'type'        => 'integer',
                'description' => 'Episode duration in seconds',
                'sanitize'    => 'absint',
            ],

            // Host information
            'interview_host_name' => [
                'type'        => 'string',
                'description' => 'Podcast host name',
                'sanitize'    => 'sanitize_text_field',
            ],
            'interview_host_email' => [
                'type'        => 'string',
                'description' => 'Podcast host email',
                'sanitize'    => 'sanitize_email',
            ],

            // Status tracking
            'interview_status' => [
                'type'        => 'string',
                'description' => 'Interview status: prospect, pitched, scheduled, recorded, published',
                'sanitize'    => 'sanitize_text_field',
            ],
            'interview_scheduled_date' => [
                'type'        => 'string',
                'description' => 'Scheduled interview date',
                'sanitize'    => 'sanitize_text_field',
            ],
            'interview_recorded_date' => [
                'type'        => 'string',
                'description' => 'Date interview was recorded',
                'sanitize'    => 'sanitize_text_field',
            ],

            // Related data
            'interview_profile_id' => [
                'type'        => 'integer',
                'description' => 'Related guest profile ID',
                'sanitize'    => 'absint',
            ],
            'interview_pitch_id' => [
                'type'        => 'integer',
                'description' => 'Related pitch post ID',
                'sanitize'    => 'absint',
            ],
            'interview_opportunity_id' => [
                'type'        => 'integer',
                'description' => 'Related opportunity ID from PIT tables',
                'sanitize'    => 'absint',
            ],

            // Metrics
            'interview_is_featured' => [
                'type'        => 'boolean',
                'description' => 'Whether to feature on media kit',
                'sanitize'    => 'rest_sanitize_boolean',
            ],
            'interview_notes' => [
                'type'        => 'string',
                'description' => 'Internal notes about this interview',
                'sanitize'    => 'sanitize_textarea_field',
            ],
        ];

        foreach ($fields as $field_name => $config) {
            register_post_meta('gmkb_interview', $field_name, [
                'show_in_rest'      => true,
                'single'            => true,
                'type'              => $config['type'],
                'description'       => $config['description'] ?? '',
                'sanitize_callback' => $config['sanitize'] ?? 'sanitize_text_field',
            ]);
        }
    }

    /**
     * Get pitch status labels
     *
     * @return array Status slug => label mapping
     */
    public static function get_pitch_statuses(): array {
        return [
            'draft'    => __('Draft', 'gmkb'),
            'sent'     => __('Sent', 'gmkb'),
            'opened'   => __('Opened', 'gmkb'),
            'replied'  => __('Replied', 'gmkb'),
            'booked'   => __('Booked', 'gmkb'),
            'declined' => __('Declined', 'gmkb'),
        ];
    }

    /**
     * Get interview status labels
     *
     * @return array Status slug => label mapping
     */
    public static function get_interview_statuses(): array {
        return [
            'prospect'  => __('Prospect', 'gmkb'),
            'pitched'   => __('Pitched', 'gmkb'),
            'scheduled' => __('Scheduled', 'gmkb'),
            'recorded'  => __('Recorded', 'gmkb'),
            'published' => __('Published', 'gmkb'),
        ];
    }

    /**
     * Count pitches for a user
     *
     * @param int $user_id User ID
     * @param string|null $status Optional status filter
     * @return int Pitch count
     */
    public static function count_user_pitches(int $user_id, ?string $status = null): int {
        $args = [
            'post_type'   => 'gmkb_pitch',
            'author'      => $user_id,
            'post_status' => ['publish', 'private', 'draft'],
            'fields'      => 'ids',
            'posts_per_page' => -1,
        ];

        if ($status) {
            $args['meta_query'] = [
                [
                    'key'   => 'pitch_status',
                    'value' => $status,
                ],
            ];
        }

        return count(get_posts($args));
    }

    /**
     * Count interviews for a user
     *
     * @param int $user_id User ID
     * @param string|null $status Optional status filter
     * @return int Interview count
     */
    public static function count_user_interviews(int $user_id, ?string $status = null): int {
        $args = [
            'post_type'   => 'gmkb_interview',
            'author'      => $user_id,
            'post_status' => ['publish', 'private', 'draft'],
            'fields'      => 'ids',
            'posts_per_page' => -1,
        ];

        if ($status) {
            $args['meta_query'] = [
                [
                    'key'   => 'interview_status',
                    'value' => $status,
                ],
            ];
        }

        return count(get_posts($args));
    }
}

// Initialize
GMKB_Post_Types::get_instance();
