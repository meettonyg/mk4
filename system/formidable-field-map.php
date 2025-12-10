<?php
/**
 * Formidable Forms Field ID to Post Meta Key Mapping
 *
 * This file maps Formidable field IDs to their corresponding post meta keys
 * for the Guest Profile (Media Kit) custom post type.
 *
 * @package GMKB
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Complete mapping of Formidable field IDs to post meta keys
 */
class GMKB_Formidable_Field_Map {

    /**
     * Core profile fields mapping
     * Formidable Field ID => Post Meta Key
     */
    const PROFILE_FIELDS = [
        // Identity
        '8029' => 'first_name',
        '8176' => 'last_name',
        '8517' => 'full_name',
        '9706' => 'prefix',
        '9707' => 'suffix',
        '8031' => 'phonetic',
        '10388' => 'guest_title',
        '8032' => 'company',
        '8489' => 'tagline',
        '10098' => 'slug',
        '8260' => 'core_audience',
        '8261' => 'audience_expertise_highlighted',

        // Contact - Private
        '8030' => 'email',
        '8822' => 'phone',
        '8044' => 'skype',

        // Contact - Public
        '8042' => 'public_email',
        '8043' => 'public_phone',

        // Social Media
        '8035' => 'social_facebook',
        '8036' => 'social_twitter',
        '8037' => 'social_instagram',
        '8038' => 'social_linkedin',
        '8381' => 'social_youtube',
        '8382' => 'social_pinterest',
        '8383' => 'social_tiktok',
        '8041' => 'website_primary',
        '8040' => 'website_secondary',
        '8177' => 'website_secondary_alt',

        // Messaging
        '8045' => 'biography',
        '9710' => 'biography_alt',
        '8618' => 'podcast_intro',
        '8294' => 'why_book_you',
        '8821' => 'publish_to_show_notes',

        // Authority Hook Components
        '10296' => 'hook_who',
        '10387' => 'hook_when',
        '10297' => 'hook_what',
        '10298' => 'hook_how',
        '10358' => 'authority_hook',
        '10361' => 'impact_intro',

        // Topics
        '8498' => 'topic_1',
        '8499' => 'topic_2',
        '8500' => 'topic_3',
        '8501' => 'topic_4',
        '8502' => 'topic_5',
        '8387' => 'topics_legacy',

        // Questions - Topic 1
        '8505' => 'question_1',
        '8506' => 'question_2',
        '8507' => 'question_3',
        '8508' => 'question_4',
        '8509' => 'question_5',

        // Questions - Topic 2
        '8510' => 'question_6',
        '8511' => 'question_7',
        '8512' => 'question_8',
        '8513' => 'question_9',
        '8514' => 'question_10',

        // Questions - Topic 3
        '10370' => 'question_11',
        '10371' => 'question_12',
        '10372' => 'question_13',
        '10373' => 'question_14',
        '10374' => 'question_15',

        // Questions - Topic 4
        '10375' => 'question_16',
        '10376' => 'question_17',
        '10377' => 'question_18',
        '10378' => 'question_19',
        '10379' => 'question_20',

        // Questions - Topic 5
        '10380' => 'question_21',
        '10381' => 'question_22',
        '10382' => 'question_23',
        '10383' => 'question_24',
        '10384' => 'question_25',

        // Noteworthy Interviews
        '8529' => 'episode_1_title',
        '8530' => 'episode_1_link',
        '8531' => 'episode_2_title',
        '8533' => 'episode_2_link',
        '8532' => 'episode_3_title',
        '8534' => 'episode_3_link',

        // Simple Offers
        '10394' => 'offer_1',
        '10395' => 'offer_1_link',
        '10396' => 'offer_2',
        '10397' => 'offer_2_link',

        // Legacy Offers (simple)
        '9622' => 'offer_1_legacy',
        '8515' => 'cta_1',
        '8516' => 'offer_1_description',
        '8818' => 'offer_2_legacy',
        '8819' => 'cta_2',
        '8820' => 'offer_2_description',

        // Brands
        '10405' => 'my_brands',
        '10406' => 'other_brands',

        // Branding - Colors
        '9674' => 'color_primary',
        '9675' => 'color_accent',
        '9676' => 'color_contrasting',
        '9717' => 'color_background',
        '9718' => 'color_header',
        '10095' => 'color_header_accent',
        '10096' => 'color_header_text',
        '9719' => 'color_paragraph',

        // Branding - Fonts
        '9677' => 'font_primary',
        '9678' => 'font_secondary',

        // Branding - Images
        '8046' => 'headshot_primary',
        '9720' => 'headshot_vertical',
        '9721' => 'headshot_horizontal',
        '8047' => 'logos',
        '10423' => 'carousel_images',

        // Layout
        '9626' => 'layout',
        '10398' => 'guest_layout_options',

        // Taxonomy/Tags
        '9383' => 'expertise_tags',
        '9326' => 'topic_category_itunes',

        // System fields
        '8262' => 'owner_user_id',
        '10210' => 'ghl_id',
        '8263' => 'org_id',
        '9174' => 'password',
        '9670' => 'source',

        // AI/Generated content
        '9667' => 'suggested_questions',
        '9668' => 'suggested_intro',
    ];

    /**
     * Complex offer fields (linked entries)
     * These map to separate Formidable entries, not post meta
     */
    const OFFER_LINKED_FIELDS = [
        '9581' => 'offer_1_entry',
        '9582' => 'offer_2_entry',
        '9583' => 'offer_3_entry',
    ];

    /**
     * Offer sub-fields (within linked offer entries)
     */
    const OFFER_SUBFIELDS = [
        '1260' => 'status',
        '1505' => 'cta_image',
        '1516' => 'graphic_type',
        '1526' => 'offer_name',
        '1527' => 'expiry_date',
        '1528' => 'reason',
        '1529' => 'value',
        '1536' => 'description',
        '1538' => 'scarcity',
        '1540' => 'format',
        '1691' => 'user_id',
        '2089' => 'org_id',
        '7207' => 'offer_code',
        '7208' => 'how_to_redeem',
        '9017' => 'notes',
        '9201' => 'offer_type',
        '9269' => 'landing_page',
        '9271' => 'price',
        '9547' => 'call_to_action',
        '9587' => 'offer_title',
        '9589' => 'sponsorship_value',
        '9591' => 'signature',
        '9592' => 'authorization',
        '9595' => 'quantity',
        '9617' => 'video_link',
        '9619' => 'discount',
        '10221' => 'ghl_id',
    ];

    /**
     * Taxonomy fields (these save to taxonomies, not post meta)
     */
    const TAXONOMY_FIELDS = [
        '9326' => 'topic_category',  // Apple iTunes categories
        '9626' => 'layout',          // Layout taxonomy
        '10296' => 'audience_niche', // WHO do you help?
    ];

    /**
     * Get post meta key from Formidable field ID
     *
     * @param string|int $field_id Formidable field ID
     * @return string|null Post meta key or null if not found
     */
    public static function get_meta_key($field_id) {
        $field_id = (string) $field_id;
        return self::PROFILE_FIELDS[$field_id] ?? null;
    }

    /**
     * Get Formidable field ID from post meta key
     *
     * @param string $meta_key Post meta key
     * @return string|null Formidable field ID or null if not found
     */
    public static function get_field_id($meta_key) {
        $flipped = array_flip(self::PROFILE_FIELDS);
        return $flipped[$meta_key] ?? null;
    }

    /**
     * Get all profile fields grouped by category
     *
     * @return array Grouped fields
     */
    public static function get_grouped_fields() {
        return [
            'identity' => [
                'first_name', 'last_name', 'full_name', 'prefix', 'suffix',
                'phonetic', 'guest_title', 'company', 'tagline', 'slug',
                'core_audience', 'audience_expertise_highlighted', 'expertise_tags',
            ],
            'contact_private' => [
                'email', 'phone', 'skype',
            ],
            'contact_public' => [
                'public_email', 'public_phone',
            ],
            'social' => [
                'social_facebook', 'social_twitter', 'social_instagram',
                'social_linkedin', 'social_youtube', 'social_pinterest',
                'social_tiktok', 'website_primary', 'website_secondary',
            ],
            'messaging' => [
                'biography', 'podcast_intro', 'why_book_you', 'authority_hook',
                'impact_intro', 'publish_to_show_notes',
            ],
            'authority_hook' => [
                'hook_who', 'hook_when', 'hook_what', 'hook_how',
            ],
            'topics' => [
                'topic_1', 'topic_2', 'topic_3', 'topic_4', 'topic_5',
            ],
            'questions' => [
                'question_1', 'question_2', 'question_3', 'question_4', 'question_5',
                'question_6', 'question_7', 'question_8', 'question_9', 'question_10',
                'question_11', 'question_12', 'question_13', 'question_14', 'question_15',
                'question_16', 'question_17', 'question_18', 'question_19', 'question_20',
                'question_21', 'question_22', 'question_23', 'question_24', 'question_25',
            ],
            'interviews' => [
                'episode_1_title', 'episode_1_link',
                'episode_2_title', 'episode_2_link',
                'episode_3_title', 'episode_3_link',
            ],
            'offers' => [
                'offer_1', 'offer_1_link', 'offer_2', 'offer_2_link',
            ],
            'brands' => [
                'my_brands', 'other_brands',
            ],
            'branding_colors' => [
                'color_primary', 'color_accent', 'color_contrasting',
                'color_background', 'color_header', 'color_header_accent',
                'color_header_text', 'color_paragraph',
            ],
            'branding_fonts' => [
                'font_primary', 'font_secondary',
            ],
            'branding_images' => [
                'headshot_primary', 'headshot_vertical', 'headshot_horizontal',
                'logos', 'carousel_images',
            ],
            'layout' => [
                'layout', 'guest_layout_options',
            ],
            'system' => [
                'owner_user_id', 'ghl_id', 'org_id', 'password', 'source',
            ],
        ];
    }

    /**
     * Get field sanitization type
     *
     * @param string $meta_key Post meta key
     * @return string Sanitization type (text, html, url, email, int, array)
     */
    public static function get_sanitization_type($meta_key) {
        $html_fields = [
            'biography', 'podcast_intro', 'why_book_you',
            'authority_hook', 'impact_intro',
            'offer_1_description', 'offer_2_description',
        ];

        $url_fields = [
            'social_facebook', 'social_twitter', 'social_instagram',
            'social_linkedin', 'social_youtube', 'social_pinterest',
            'social_tiktok', 'website_primary', 'website_secondary',
            'episode_1_link', 'episode_2_link', 'episode_3_link',
            'offer_1_link', 'offer_2_link',
        ];

        $email_fields = ['email', 'public_email'];

        $int_fields = [
            'owner_user_id', 'org_id',
            'headshot_primary', 'headshot_vertical', 'headshot_horizontal',
        ];

        $array_fields = ['logos', 'carousel_images', 'expertise_tags'];

        $color_fields = [
            'color_primary', 'color_accent', 'color_contrasting',
            'color_background', 'color_header', 'color_header_accent',
            'color_header_text', 'color_paragraph',
        ];

        if (in_array($meta_key, $html_fields)) return 'html';
        if (in_array($meta_key, $url_fields)) return 'url';
        if (in_array($meta_key, $email_fields)) return 'email';
        if (in_array($meta_key, $int_fields)) return 'int';
        if (in_array($meta_key, $array_fields)) return 'array';
        if (in_array($meta_key, $color_fields)) return 'color';

        return 'text';
    }

    /**
     * Get human-readable label for a field
     *
     * @param string $meta_key Post meta key
     * @return string Human-readable label
     */
    public static function get_field_label($meta_key) {
        $labels = [
            'first_name' => 'First Name',
            'last_name' => 'Last Name',
            'full_name' => 'Full Name',
            'prefix' => 'Prefix',
            'suffix' => 'Suffix',
            'phonetic' => 'Phonetic Spelling',
            'guest_title' => 'Position / Title',
            'company' => 'Organization',
            'tagline' => 'Tagline',
            'core_audience' => 'Core Audience',
            'email' => 'Private Email',
            'phone' => 'Private Phone',
            'skype' => 'Skype',
            'public_email' => 'Public Email',
            'public_phone' => 'Public Phone',
            'social_facebook' => 'Facebook',
            'social_twitter' => 'Twitter / X',
            'social_instagram' => 'Instagram',
            'social_linkedin' => 'LinkedIn',
            'social_youtube' => 'YouTube',
            'social_pinterest' => 'Pinterest',
            'social_tiktok' => 'TikTok',
            'website_primary' => 'Website 1',
            'website_secondary' => 'Website 2',
            'biography' => 'Biography',
            'podcast_intro' => 'Podcast Intro',
            'why_book_you' => 'Why Should a Podcast Book You?',
            'authority_hook' => 'Authority Hook',
            'impact_intro' => 'Impact Intro',
            'hook_who' => 'WHO do you help?',
            'hook_when' => 'WHEN do they need you?',
            'hook_what' => 'WHAT result do you help them achieve?',
            'hook_how' => 'HOW do you help them achieve this result?',
            'topic_1' => 'Topic 1',
            'topic_2' => 'Topic 2',
            'topic_3' => 'Topic 3',
            'topic_4' => 'Topic 4',
            'topic_5' => 'Topic 5',
            'offer_1' => 'Offer 1',
            'offer_1_link' => 'Offer 1 Link',
            'offer_2' => 'Offer 2',
            'offer_2_link' => 'Offer 2 Link',
            'my_brands' => 'My Brands',
            'other_brands' => 'Other Brands',
            'color_primary' => 'Primary Color',
            'color_accent' => 'Accent Color',
            'color_contrasting' => 'Contrasting Color',
            'color_background' => 'Background Color',
            'color_header' => 'Header Color',
            'color_header_accent' => 'Header Accent',
            'color_header_text' => 'Header Text Color',
            'color_paragraph' => 'Paragraph Color',
            'font_primary' => 'Primary Font',
            'font_secondary' => 'Secondary Font',
            'headshot_primary' => 'Primary Headshot',
            'headshot_vertical' => 'Vertical Headshot',
            'headshot_horizontal' => 'Horizontal Headshot',
            'logos' => 'Logos',
            'carousel_images' => 'Carousel Images',
            'layout' => 'Layout',
        ];

        // Generate labels for questions
        for ($i = 1; $i <= 25; $i++) {
            $labels["question_{$i}"] = "Question {$i}";
        }

        return $labels[$meta_key] ?? ucwords(str_replace('_', ' ', $meta_key));
    }
}
