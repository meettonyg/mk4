<?php
/**
 * Profile Schema - Single Source of Truth
 *
 * Defines all profile fields, their types, validation rules, and labels.
 * This replaces the legacy Formidable field mapping and provides:
 * - Field definitions with type, sanitization, and validation
 * - Grouped field organization
 * - JSON Schema export for frontend/migration
 *
 * @package GMKB
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Profile_Schema {

    /**
     * Field type constants
     */
    const TYPE_STRING = 'string';
    const TYPE_TEXT = 'text';
    const TYPE_HTML = 'html';
    const TYPE_URL = 'url';
    const TYPE_EMAIL = 'email';
    const TYPE_INT = 'integer';
    const TYPE_ARRAY = 'array';
    const TYPE_COLOR = 'color';
    const TYPE_IMAGE = 'image';
    const TYPE_GALLERY = 'gallery';

    /**
     * Complete field definitions
     *
     * Each field contains:
     * - type: Data type for validation
     * - sanitize: Sanitization method to apply
     * - label: Human-readable label
     * - group: Logical grouping for organization
     * - required: Whether field is required (optional, default false)
     * - pattern: Regex pattern for validation (optional)
     */
    const FIELDS = [
        // =====================
        // Identity Fields
        // =====================
        'first_name' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'First Name',
            'group' => 'identity',
            'required' => true,
        ],
        'last_name' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Last Name',
            'group' => 'identity',
            'required' => true,
        ],
        'full_name' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Full Name',
            'group' => 'identity',
        ],
        'prefix' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Prefix',
            'group' => 'identity',
        ],
        'suffix' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Suffix',
            'group' => 'identity',
        ],
        'phonetic' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Phonetic Spelling',
            'group' => 'identity',
        ],
        'guest_title' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Position / Title',
            'group' => 'identity',
        ],
        'company' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Organization',
            'group' => 'identity',
        ],
        'tagline' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Tagline',
            'group' => 'identity',
        ],
        'slug' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'URL Slug',
            'group' => 'identity',
        ],
        'core_audience' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Core Audience',
            'group' => 'identity',
        ],
        'audience_expertise_highlighted' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Audience Expertise Highlighted',
            'group' => 'identity',
        ],
        'expertise_tags' => [
            'type' => self::TYPE_ARRAY,
            'sanitize' => 'array:text',
            'label' => 'Areas of Expertise',
            'group' => 'identity',
        ],

        // =====================
        // Contact - Private
        // =====================
        'email' => [
            'type' => self::TYPE_EMAIL,
            'sanitize' => 'email',
            'label' => 'Private Email',
            'group' => 'contact_private',
        ],
        'phone' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Private Phone',
            'group' => 'contact_private',
        ],
        'skype' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Skype',
            'group' => 'contact_private',
        ],

        // =====================
        // Contact - Public
        // =====================
        'public_email' => [
            'type' => self::TYPE_EMAIL,
            'sanitize' => 'email',
            'label' => 'Public Email',
            'group' => 'contact_public',
        ],
        'public_phone' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Public Phone',
            'group' => 'contact_public',
        ],

        // =====================
        // Social Media
        // =====================
        'social_facebook' => [
            'type' => self::TYPE_URL,
            'sanitize' => 'url',
            'label' => 'Facebook',
            'group' => 'social',
        ],
        'social_twitter' => [
            'type' => self::TYPE_URL,
            'sanitize' => 'url',
            'label' => 'Twitter / X',
            'group' => 'social',
        ],
        'social_instagram' => [
            'type' => self::TYPE_URL,
            'sanitize' => 'url',
            'label' => 'Instagram',
            'group' => 'social',
        ],
        'social_linkedin' => [
            'type' => self::TYPE_URL,
            'sanitize' => 'url',
            'label' => 'LinkedIn',
            'group' => 'social',
        ],
        'social_youtube' => [
            'type' => self::TYPE_URL,
            'sanitize' => 'url',
            'label' => 'YouTube',
            'group' => 'social',
        ],
        'social_pinterest' => [
            'type' => self::TYPE_URL,
            'sanitize' => 'url',
            'label' => 'Pinterest',
            'group' => 'social',
        ],
        'social_tiktok' => [
            'type' => self::TYPE_URL,
            'sanitize' => 'url',
            'label' => 'TikTok',
            'group' => 'social',
        ],
        'website_primary' => [
            'type' => self::TYPE_URL,
            'sanitize' => 'url',
            'label' => 'Website 1',
            'group' => 'social',
        ],
        'website_secondary' => [
            'type' => self::TYPE_URL,
            'sanitize' => 'url',
            'label' => 'Website 2',
            'group' => 'social',
        ],
        'website_secondary_alt' => [
            'type' => self::TYPE_URL,
            'sanitize' => 'url',
            'label' => 'Website 3',
            'group' => 'social',
        ],

        // =====================
        // Messaging
        // =====================
        'biography' => [
            'type' => self::TYPE_HTML,
            'sanitize' => 'html',
            'label' => 'Biography',
            'group' => 'messaging',
        ],
        'biography_alt' => [
            'type' => self::TYPE_HTML,
            'sanitize' => 'html',
            'label' => 'Biography (Alt)',
            'group' => 'messaging',
        ],
        'podcast_intro' => [
            'type' => self::TYPE_HTML,
            'sanitize' => 'html',
            'label' => 'Podcast Intro',
            'group' => 'messaging',
        ],
        'why_book_you' => [
            'type' => self::TYPE_HTML,
            'sanitize' => 'html',
            'label' => 'Why Should a Podcast Book You?',
            'group' => 'messaging',
        ],
        'publish_to_show_notes' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Publish to Show Notes',
            'group' => 'messaging',
        ],

        // =====================
        // Authority Hook
        // =====================
        'hook_who' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'WHO do you help?',
            'group' => 'authority_hook',
        ],
        'hook_when' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'WHEN do they need you?',
            'group' => 'authority_hook',
        ],
        'hook_what' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'WHAT result do you help them achieve?',
            'group' => 'authority_hook',
        ],
        'hook_how' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'HOW do you help them achieve this result?',
            'group' => 'authority_hook',
        ],
        'authority_hook' => [
            'type' => self::TYPE_HTML,
            'sanitize' => 'html',
            'label' => 'Authority Hook',
            'group' => 'authority_hook',
        ],
        'impact_intro' => [
            'type' => self::TYPE_HTML,
            'sanitize' => 'html',
            'label' => 'Impact Intro',
            'group' => 'authority_hook',
        ],

        // =====================
        // Topics (1-5)
        // =====================
        'topic_1' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Topic 1',
            'group' => 'topics',
        ],
        'topic_2' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Topic 2',
            'group' => 'topics',
        ],
        'topic_3' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Topic 3',
            'group' => 'topics',
        ],
        'topic_4' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Topic 4',
            'group' => 'topics',
        ],
        'topic_5' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Topic 5',
            'group' => 'topics',
        ],
        'topics_legacy' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Topics (Legacy)',
            'group' => 'topics',
        ],

        // =====================
        // Questions (1-25)
        // =====================
        'question_1' => ['type' => self::TYPE_STRING, 'sanitize' => 'text', 'label' => 'Question 1', 'group' => 'questions'],
        'question_2' => ['type' => self::TYPE_STRING, 'sanitize' => 'text', 'label' => 'Question 2', 'group' => 'questions'],
        'question_3' => ['type' => self::TYPE_STRING, 'sanitize' => 'text', 'label' => 'Question 3', 'group' => 'questions'],
        'question_4' => ['type' => self::TYPE_STRING, 'sanitize' => 'text', 'label' => 'Question 4', 'group' => 'questions'],
        'question_5' => ['type' => self::TYPE_STRING, 'sanitize' => 'text', 'label' => 'Question 5', 'group' => 'questions'],
        'question_6' => ['type' => self::TYPE_STRING, 'sanitize' => 'text', 'label' => 'Question 6', 'group' => 'questions'],
        'question_7' => ['type' => self::TYPE_STRING, 'sanitize' => 'text', 'label' => 'Question 7', 'group' => 'questions'],
        'question_8' => ['type' => self::TYPE_STRING, 'sanitize' => 'text', 'label' => 'Question 8', 'group' => 'questions'],
        'question_9' => ['type' => self::TYPE_STRING, 'sanitize' => 'text', 'label' => 'Question 9', 'group' => 'questions'],
        'question_10' => ['type' => self::TYPE_STRING, 'sanitize' => 'text', 'label' => 'Question 10', 'group' => 'questions'],
        'question_11' => ['type' => self::TYPE_STRING, 'sanitize' => 'text', 'label' => 'Question 11', 'group' => 'questions'],
        'question_12' => ['type' => self::TYPE_STRING, 'sanitize' => 'text', 'label' => 'Question 12', 'group' => 'questions'],
        'question_13' => ['type' => self::TYPE_STRING, 'sanitize' => 'text', 'label' => 'Question 13', 'group' => 'questions'],
        'question_14' => ['type' => self::TYPE_STRING, 'sanitize' => 'text', 'label' => 'Question 14', 'group' => 'questions'],
        'question_15' => ['type' => self::TYPE_STRING, 'sanitize' => 'text', 'label' => 'Question 15', 'group' => 'questions'],
        'question_16' => ['type' => self::TYPE_STRING, 'sanitize' => 'text', 'label' => 'Question 16', 'group' => 'questions'],
        'question_17' => ['type' => self::TYPE_STRING, 'sanitize' => 'text', 'label' => 'Question 17', 'group' => 'questions'],
        'question_18' => ['type' => self::TYPE_STRING, 'sanitize' => 'text', 'label' => 'Question 18', 'group' => 'questions'],
        'question_19' => ['type' => self::TYPE_STRING, 'sanitize' => 'text', 'label' => 'Question 19', 'group' => 'questions'],
        'question_20' => ['type' => self::TYPE_STRING, 'sanitize' => 'text', 'label' => 'Question 20', 'group' => 'questions'],
        'question_21' => ['type' => self::TYPE_STRING, 'sanitize' => 'text', 'label' => 'Question 21', 'group' => 'questions'],
        'question_22' => ['type' => self::TYPE_STRING, 'sanitize' => 'text', 'label' => 'Question 22', 'group' => 'questions'],
        'question_23' => ['type' => self::TYPE_STRING, 'sanitize' => 'text', 'label' => 'Question 23', 'group' => 'questions'],
        'question_24' => ['type' => self::TYPE_STRING, 'sanitize' => 'text', 'label' => 'Question 24', 'group' => 'questions'],
        'question_25' => ['type' => self::TYPE_STRING, 'sanitize' => 'text', 'label' => 'Question 25', 'group' => 'questions'],

        // =====================
        // Noteworthy Interviews
        // =====================
        'episode_1_title' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Episode 1 Title',
            'group' => 'interviews',
        ],
        'episode_1_link' => [
            'type' => self::TYPE_URL,
            'sanitize' => 'url',
            'label' => 'Episode 1 Link',
            'group' => 'interviews',
        ],
        'episode_2_title' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Episode 2 Title',
            'group' => 'interviews',
        ],
        'episode_2_link' => [
            'type' => self::TYPE_URL,
            'sanitize' => 'url',
            'label' => 'Episode 2 Link',
            'group' => 'interviews',
        ],
        'episode_3_title' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Episode 3 Title',
            'group' => 'interviews',
        ],
        'episode_3_link' => [
            'type' => self::TYPE_URL,
            'sanitize' => 'url',
            'label' => 'Episode 3 Link',
            'group' => 'interviews',
        ],

        // =====================
        // Offers
        // =====================
        'offer_1' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Offer 1',
            'group' => 'offers',
        ],
        'offer_1_link' => [
            'type' => self::TYPE_URL,
            'sanitize' => 'url',
            'label' => 'Offer 1 Link',
            'group' => 'offers',
        ],
        'offer_2' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Offer 2',
            'group' => 'offers',
        ],
        'offer_2_link' => [
            'type' => self::TYPE_URL,
            'sanitize' => 'url',
            'label' => 'Offer 2 Link',
            'group' => 'offers',
        ],

        // =====================
        // Legacy Offers
        // =====================
        'offer_1_legacy' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Offer 1 (Legacy)',
            'group' => 'offers_legacy',
        ],
        'cta_1' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'CTA 1',
            'group' => 'offers_legacy',
        ],
        'offer_1_description' => [
            'type' => self::TYPE_HTML,
            'sanitize' => 'html',
            'label' => 'Offer 1 Description',
            'group' => 'offers_legacy',
        ],
        'offer_2_legacy' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Offer 2 (Legacy)',
            'group' => 'offers_legacy',
        ],
        'cta_2' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'CTA 2',
            'group' => 'offers_legacy',
        ],
        'offer_2_description' => [
            'type' => self::TYPE_HTML,
            'sanitize' => 'html',
            'label' => 'Offer 2 Description',
            'group' => 'offers_legacy',
        ],

        // =====================
        // Brands
        // =====================
        'my_brands' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'My Brands',
            'group' => 'brands',
        ],
        'other_brands' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Other Brands',
            'group' => 'brands',
        ],

        // =====================
        // Branding - Colors
        // =====================
        'color_primary' => [
            'type' => self::TYPE_COLOR,
            'sanitize' => 'color',
            'label' => 'Primary Color',
            'group' => 'branding_colors',
            'pattern' => '/^#[a-fA-F0-9]{6}$/',
        ],
        'color_accent' => [
            'type' => self::TYPE_COLOR,
            'sanitize' => 'color',
            'label' => 'Accent Color',
            'group' => 'branding_colors',
            'pattern' => '/^#[a-fA-F0-9]{6}$/',
        ],
        'color_contrasting' => [
            'type' => self::TYPE_COLOR,
            'sanitize' => 'color',
            'label' => 'Contrasting Color',
            'group' => 'branding_colors',
            'pattern' => '/^#[a-fA-F0-9]{6}$/',
        ],
        'color_background' => [
            'type' => self::TYPE_COLOR,
            'sanitize' => 'color',
            'label' => 'Background Color',
            'group' => 'branding_colors',
            'pattern' => '/^#[a-fA-F0-9]{6}$/',
        ],
        'color_header' => [
            'type' => self::TYPE_COLOR,
            'sanitize' => 'color',
            'label' => 'Header Color',
            'group' => 'branding_colors',
            'pattern' => '/^#[a-fA-F0-9]{6}$/',
        ],
        'color_header_accent' => [
            'type' => self::TYPE_COLOR,
            'sanitize' => 'color',
            'label' => 'Header Accent',
            'group' => 'branding_colors',
            'pattern' => '/^#[a-fA-F0-9]{6}$/',
        ],
        'color_header_text' => [
            'type' => self::TYPE_COLOR,
            'sanitize' => 'color',
            'label' => 'Header Text Color',
            'group' => 'branding_colors',
            'pattern' => '/^#[a-fA-F0-9]{6}$/',
        ],
        'color_paragraph' => [
            'type' => self::TYPE_COLOR,
            'sanitize' => 'color',
            'label' => 'Paragraph Color',
            'group' => 'branding_colors',
            'pattern' => '/^#[a-fA-F0-9]{6}$/',
        ],

        // =====================
        // Branding - Fonts
        // =====================
        'font_primary' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Primary Font',
            'group' => 'branding_fonts',
        ],
        'font_secondary' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Secondary Font',
            'group' => 'branding_fonts',
        ],

        // =====================
        // Branding - Images
        // =====================
        'headshot_primary' => [
            'type' => self::TYPE_IMAGE,
            'sanitize' => 'int',
            'label' => 'Primary Headshot',
            'group' => 'branding_images',
        ],
        'headshot_vertical' => [
            'type' => self::TYPE_IMAGE,
            'sanitize' => 'int',
            'label' => 'Vertical Headshot',
            'group' => 'branding_images',
        ],
        'headshot_horizontal' => [
            'type' => self::TYPE_IMAGE,
            'sanitize' => 'int',
            'label' => 'Horizontal Headshot',
            'group' => 'branding_images',
        ],
        'logos' => [
            'type' => self::TYPE_GALLERY,
            'sanitize' => 'array:int',
            'label' => 'Logos',
            'group' => 'branding_images',
        ],
        'carousel_images' => [
            'type' => self::TYPE_GALLERY,
            'sanitize' => 'array:int',
            'label' => 'Carousel Images',
            'group' => 'branding_images',
        ],

        // =====================
        // Layout
        // =====================
        'layout' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Layout',
            'group' => 'layout',
        ],
        'guest_layout_options' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Layout Options',
            'group' => 'layout',
        ],

        // =====================
        // Taxonomy/Tags
        // =====================
        'topic_category_itunes' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'iTunes Category',
            'group' => 'taxonomy',
        ],

        // =====================
        // System Fields
        // =====================
        'owner_user_id' => [
            'type' => self::TYPE_INT,
            'sanitize' => 'int',
            'label' => 'Owner User ID',
            'group' => 'system',
        ],
        'ghl_id' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'GoHighLevel ID',
            'group' => 'system',
        ],
        'org_id' => [
            'type' => self::TYPE_INT,
            'sanitize' => 'int',
            'label' => 'Organization ID',
            'group' => 'system',
        ],
        'password' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Password',
            'group' => 'system',
        ],
        'source' => [
            'type' => self::TYPE_STRING,
            'sanitize' => 'text',
            'label' => 'Source',
            'group' => 'system',
        ],

        // =====================
        // AI/Generated Content
        // =====================
        'suggested_questions' => [
            'type' => self::TYPE_HTML,
            'sanitize' => 'html',
            'label' => 'Suggested Questions',
            'group' => 'ai_generated',
        ],
        'suggested_intro' => [
            'type' => self::TYPE_HTML,
            'sanitize' => 'html',
            'label' => 'Suggested Intro',
            'group' => 'ai_generated',
        ],
    ];

    /**
     * Fields that contribute to profile completeness
     */
    const COMPLETENESS_FIELDS = [
        'first_name',
        'last_name',
        'biography',
        'tagline',
        'headshot_primary',
        'topic_1',
        'question_1',
        'social_linkedin',
        'website_primary',
        'why_book_you',
    ];

    /**
     * Image fields that need URL expansion
     */
    const IMAGE_FIELDS = [
        'headshot_primary',
        'headshot_vertical',
        'headshot_horizontal',
    ];

    /**
     * Gallery fields that need URL expansion
     */
    const GALLERY_FIELDS = [
        'logos',
        'carousel_images',
    ];

    /**
     * Get all field definitions
     *
     * @return array
     */
    public static function get_fields(): array {
        return self::FIELDS;
    }

    /**
     * Get a single field definition
     *
     * @param string $key Field key
     * @return array|null Field definition or null if not found
     */
    public static function get_field(string $key): ?array {
        return self::FIELDS[$key] ?? null;
    }

    /**
     * Check if a field exists in the schema
     *
     * @param string $key Field key
     * @return bool
     */
    public static function has_field(string $key): bool {
        return isset(self::FIELDS[$key]);
    }

    /**
     * Get all unique group names
     *
     * @return array
     */
    public static function get_groups(): array {
        $groups = [];
        foreach (self::FIELDS as $field) {
            if (!in_array($field['group'], $groups)) {
                $groups[] = $field['group'];
            }
        }
        return $groups;
    }

    /**
     * Get all field keys for a specific group
     *
     * @param string $group Group name
     * @return array Field keys
     */
    public static function get_fields_by_group(string $group): array {
        $fields = [];
        foreach (self::FIELDS as $key => $definition) {
            if ($definition['group'] === $group) {
                $fields[] = $key;
            }
        }
        return $fields;
    }

    /**
     * Get fields organized by group (for API compatibility)
     *
     * @return array Associative array of group => [field keys]
     */
    public static function get_grouped_fields(): array {
        $grouped = [];
        foreach (self::FIELDS as $key => $definition) {
            $group = $definition['group'];
            if (!isset($grouped[$group])) {
                $grouped[$group] = [];
            }
            $grouped[$group][] = $key;
        }
        return $grouped;
    }

    /**
     * Get all field keys (flat list)
     *
     * @return array
     */
    public static function get_all_field_keys(): array {
        return array_keys(self::FIELDS);
    }

    /**
     * Get the sanitization type for a field
     *
     * @param string $key Field key
     * @return string Sanitization type (defaults to 'text')
     */
    public static function get_sanitization_type(string $key): string {
        $field = self::get_field($key);
        return $field['sanitize'] ?? 'text';
    }

    /**
     * Get the label for a field
     *
     * @param string $key Field key
     * @return string Human-readable label
     */
    public static function get_field_label(string $key): string {
        $field = self::get_field($key);
        if ($field && isset($field['label'])) {
            return $field['label'];
        }
        // Fallback: convert snake_case to Title Case
        return ucwords(str_replace('_', ' ', $key));
    }

    /**
     * Get the type for a field
     *
     * @param string $key Field key
     * @return string Field type
     */
    public static function get_field_type(string $key): string {
        $field = self::get_field($key);
        return $field['type'] ?? self::TYPE_STRING;
    }

    /**
     * Check if a field is required
     *
     * @param string $key Field key
     * @return bool
     */
    public static function is_required(string $key): bool {
        $field = self::get_field($key);
        return $field['required'] ?? false;
    }

    /**
     * Check if a field is an image field
     *
     * @param string $key Field key
     * @return bool
     */
    public static function is_image_field(string $key): bool {
        return in_array($key, self::IMAGE_FIELDS);
    }

    /**
     * Check if a field is a gallery field
     *
     * @param string $key Field key
     * @return bool
     */
    public static function is_gallery_field(string $key): bool {
        return in_array($key, self::GALLERY_FIELDS);
    }

    /**
     * Sanitize a value based on field definition
     *
     * @param string $key Field key
     * @param mixed $value Value to sanitize
     * @return mixed Sanitized value
     */
    public static function sanitize(string $key, $value) {
        $sanitize_type = self::get_sanitization_type($key);

        // Handle array types (e.g., 'array:text', 'array:int')
        if (strpos($sanitize_type, 'array:') === 0) {
            $item_type = substr($sanitize_type, 6);
            if (!is_array($value)) {
                // Handle comma-separated string
                if (is_string($value) && !empty($value)) {
                    $value = array_map('trim', explode(',', $value));
                } else {
                    $value = [];
                }
            }
            return array_map(function($item) use ($item_type) {
                return self::sanitize_value($item, $item_type);
            }, $value);
        }

        return self::sanitize_value($value, $sanitize_type);
    }

    /**
     * Sanitize a single value by type
     *
     * @param mixed $value Value to sanitize
     * @param string $type Sanitization type
     * @return mixed Sanitized value
     */
    private static function sanitize_value($value, string $type) {
        switch ($type) {
            case 'html':
                return wp_kses_post($value);

            case 'url':
                return esc_url_raw($value);

            case 'email':
                return sanitize_email($value);

            case 'int':
                return absint($value);

            case 'color':
                if (empty($value)) {
                    return '';
                }
                // Validate hex color format
                if (!preg_match('/^#[a-fA-F0-9]{6}$/', $value)) {
                    return '';
                }
                return sanitize_hex_color($value);

            case 'text':
            default:
                return sanitize_text_field($value);
        }
    }

    /**
     * Validate a value based on field definition
     *
     * @param string $key Field key
     * @param mixed $value Value to validate
     * @return bool|WP_Error True if valid, WP_Error if invalid
     */
    public static function validate(string $key, $value) {
        $field = self::get_field($key);

        if (!$field) {
            return new WP_Error('unknown_field', "Unknown field: {$key}");
        }

        // Check required
        if (($field['required'] ?? false) && empty($value)) {
            return new WP_Error('required_field', "{$field['label']} is required");
        }

        // Check pattern
        if (!empty($value) && isset($field['pattern'])) {
            if (!preg_match($field['pattern'], $value)) {
                return new WP_Error('invalid_format', "Invalid format for {$field['label']}");
            }
        }

        // Type-specific validation
        switch ($field['type']) {
            case self::TYPE_EMAIL:
                if (!empty($value) && !is_email($value)) {
                    return new WP_Error('invalid_email', "Invalid email address for {$field['label']}");
                }
                break;

            case self::TYPE_URL:
                if (!empty($value) && !filter_var($value, FILTER_VALIDATE_URL)) {
                    return new WP_Error('invalid_url', "Invalid URL for {$field['label']}");
                }
                break;

            case self::TYPE_INT:
            case self::TYPE_IMAGE:
                if (!empty($value) && !is_numeric($value)) {
                    return new WP_Error('invalid_integer', "{$field['label']} must be a number");
                }
                break;

            case self::TYPE_COLOR:
                if (!empty($value) && !preg_match('/^#[a-fA-F0-9]{6}$/', $value)) {
                    return new WP_Error('invalid_color', "Invalid color format for {$field['label']}");
                }
                break;
        }

        return true;
    }

    /**
     * Export schema as JSON Schema format
     * Useful for frontend validation and migration to other systems
     *
     * @return array JSON Schema compatible structure
     */
    public static function to_json_schema(): array {
        $properties = [];
        $required = [];

        foreach (self::FIELDS as $key => $field) {
            $property = [
                'title' => $field['label'],
            ];

            // Map types to JSON Schema types
            switch ($field['type']) {
                case self::TYPE_INT:
                case self::TYPE_IMAGE:
                    $property['type'] = 'integer';
                    break;

                case self::TYPE_ARRAY:
                case self::TYPE_GALLERY:
                    $property['type'] = 'array';
                    $property['items'] = ['type' => 'string'];
                    break;

                case self::TYPE_EMAIL:
                    $property['type'] = 'string';
                    $property['format'] = 'email';
                    break;

                case self::TYPE_URL:
                    $property['type'] = 'string';
                    $property['format'] = 'uri';
                    break;

                default:
                    $property['type'] = 'string';
            }

            // Add pattern if defined
            if (isset($field['pattern'])) {
                $property['pattern'] = $field['pattern'];
            }

            $properties[$key] = $property;

            // Track required fields
            if ($field['required'] ?? false) {
                $required[] = $key;
            }
        }

        return [
            '$schema' => 'https://json-schema.org/draft/2020-12/schema',
            'type' => 'object',
            'title' => 'Guest Profile',
            'properties' => $properties,
            'required' => $required,
        ];
    }

    /**
     * Export schema for frontend consumption
     * Returns a simplified format optimized for Vue.js forms
     *
     * @return array
     */
    public static function to_frontend_schema(): array {
        $schema = [];

        foreach (self::get_groups() as $group) {
            $schema[$group] = [];
            foreach (self::get_fields_by_group($group) as $key) {
                $field = self::get_field($key);
                $schema[$group][$key] = [
                    'key' => $key,
                    'type' => $field['type'],
                    'label' => $field['label'],
                    'required' => $field['required'] ?? false,
                    'pattern' => $field['pattern'] ?? null,
                ];
            }
        }

        return $schema;
    }
}
