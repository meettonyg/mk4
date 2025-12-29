<?php
/**
 * Profile Schema Markup Generator
 *
 * Generates Schema.org structured data (JSON-LD) for user profiles.
 * Supports Person, ProfilePage, FAQPage, and SpeakableSpecification schemas.
 *
 * @package GMKB
 * @since 2.3.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Profile_Schema_Markup {

    /**
     * Profile post ID
     *
     * @var int
     */
    private int $post_id;

    /**
     * Cached profile data
     *
     * @var array|null
     */
    private ?array $profile_data = null;

    /**
     * Constructor
     *
     * @param int $post_id Profile post ID
     */
    public function __construct(int $post_id) {
        $this->post_id = $post_id;
    }

    /**
     * Get the profile URL
     *
     * @return string Profile URL
     */
    private function get_profile_url(): string {
        return get_permalink($this->post_id);
    }

    /**
     * Get the profile's unique ID for schema @id
     *
     * @param string $fragment Fragment to append (e.g., 'person', 'webpage')
     * @return string Schema @id URL
     */
    private function get_schema_id(string $fragment = ''): string {
        $url = $this->get_profile_url();
        return $fragment ? $url . '#' . $fragment : $url;
    }

    /**
     * Get profile data (cached)
     *
     * @return array Profile data array
     */
    private function get_profile_data(): array {
        if ($this->profile_data !== null) {
            return $this->profile_data;
        }

        $this->profile_data = [];

        // Get all post meta
        $meta = get_post_meta($this->post_id);

        foreach ($meta as $key => $values) {
            $this->profile_data[$key] = isset($values[0]) ? maybe_unserialize($values[0]) : '';
        }

        // Get post data
        $post = get_post($this->post_id);
        if ($post) {
            $this->profile_data['_post_title'] = $post->post_title;
            $this->profile_data['_post_date'] = $post->post_date;
            $this->profile_data['_post_modified'] = $post->post_modified;
        }

        return $this->profile_data;
    }

    /**
     * Get a profile field value
     *
     * @param string $key Field key
     * @param mixed  $default Default value if not found
     * @return mixed Field value
     */
    private function get_field(string $key, $default = '') {
        $data = $this->get_profile_data();
        return $data[$key] ?? $default;
    }

    /**
     * Get the full name
     *
     * @return string Full name
     */
    private function get_full_name(): string {
        $full_name = $this->get_field('full_name');
        if (!empty($full_name)) {
            return $full_name;
        }

        $first = $this->get_field('first_name');
        $last = $this->get_field('last_name');

        return trim($first . ' ' . $last);
    }

    /**
     * Get headshot URL
     *
     * @return string|null Image URL or null
     */
    private function get_headshot_url(): ?string {
        $headshot = $this->get_field('headshot_primary');

        if (empty($headshot)) {
            return null;
        }

        // Handle array format (from image field)
        if (is_array($headshot)) {
            if (isset($headshot['url'])) {
                return $headshot['url'];
            }
            if (isset($headshot['ID'])) {
                $headshot = $headshot['ID'];
            } elseif (isset($headshot['id'])) {
                $headshot = $headshot['id'];
            }
        }

        // Handle attachment ID
        if (is_numeric($headshot)) {
            return wp_get_attachment_url((int) $headshot);
        }

        // Handle URL string
        if (is_string($headshot) && filter_var($headshot, FILTER_VALIDATE_URL)) {
            return $headshot;
        }

        return null;
    }

    /**
     * Build sameAs links array from social profiles
     *
     * @return array Array of social profile URLs
     */
    public function build_same_as_links(): array {
        $links = [];

        $social_fields = [
            'social_linkedin',
            'social_twitter',
            'social_facebook',
            'social_instagram',
            'social_youtube',
            'social_tiktok',
            'social_pinterest',
            'website_primary',
            'website_secondary',
        ];

        foreach ($social_fields as $field) {
            $url = $this->get_field($field);
            if (!empty($url) && filter_var($url, FILTER_VALIDATE_URL)) {
                $links[] = $url;
            }
        }

        return $links;
    }

    /**
     * Get expertise topics
     *
     * @return array Array of topic strings
     */
    public function get_expertise_topics(): array {
        $topics = [];

        // Check expertise_tags array field first
        $expertise_tags = $this->get_field('expertise_tags');
        if (is_array($expertise_tags) && !empty($expertise_tags)) {
            return array_filter($expertise_tags);
        }

        // Fall back to individual topic fields - dynamically from schema
        $topic_fields = GMKB_Profile_Schema::get_fields_by_group('topics');
        foreach ($topic_fields as $field) {
            // Only include topic_N fields, not legacy
            if (strpos($field, 'topic_') === 0 && strpos($field, 'legacy') === false) {
                $topic = $this->get_field($field);
                if (!empty($topic)) {
                    $topics[] = $topic;
                }
            }
        }

        return $topics;
    }

    /**
     * Get interview questions with answers
     *
     * @return array Array of ['question' => string, 'answer' => string]
     */
    public function get_questions(): array {
        $questions = [];

        // Dynamically get question fields from schema
        $question_fields = GMKB_Profile_Schema::get_fields_by_group('questions');
        foreach ($question_fields as $field) {
            $question = $this->get_field($field);
            if (!empty($question)) {
                // For FAQ schema, we need an answer
                // Use the question itself or a default answer pattern
                $questions[] = [
                    'question' => $question,
                    'answer' => $this->generate_question_answer($question),
                ];
            }
        }

        return $questions;
    }

    /**
     * Generate an answer for a question (for FAQ schema)
     *
     * @param string $question The question text
     * @return string Generated answer
     */
    private function generate_question_answer(string $question): string {
        $name = $this->get_full_name();

        // Use authority hook or biography as context for the answer
        $authority_hook = $this->get_field('authority_hook');
        $biography = $this->get_field('biography');

        if (!empty($authority_hook)) {
            $context = wp_strip_all_tags($authority_hook);
        } elseif (!empty($biography)) {
            $context = wp_strip_all_tags(wp_trim_words($biography, 50));
        } else {
            $context = "This is a topic {$name} discusses in interviews.";
        }

        return "This is a great question to ask {$name}. {$context}";
    }

    /**
     * Strip HTML and clean text for schema
     *
     * @param string $text Text to clean
     * @param int    $max_length Maximum length (0 for no limit)
     * @return string Cleaned text
     */
    private function clean_text(string $text, int $max_length = 0): string {
        $text = wp_strip_all_tags($text);
        $text = html_entity_decode($text, ENT_QUOTES, 'UTF-8');
        $text = preg_replace('/\s+/', ' ', $text);
        $text = trim($text);

        if ($max_length > 0 && strlen($text) > $max_length) {
            $text = substr($text, 0, $max_length - 3) . '...';
        }

        return $text;
    }

    /**
     * Generate Person schema
     *
     * @return array Person schema array
     */
    public function generate_person_schema(): array {
        $name = $this->get_full_name();
        $first_name = $this->get_field('first_name');
        $last_name = $this->get_field('last_name');

        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'Person',
            '@id' => $this->get_schema_id('person'),
            'name' => $name,
            'url' => $this->get_profile_url(),
        ];

        // Add given/family name if available
        if (!empty($first_name)) {
            $schema['givenName'] = $first_name;
        }
        if (!empty($last_name)) {
            $schema['familyName'] = $last_name;
        }

        // Job title
        $job_title = $this->get_field('guest_title');
        if (!empty($job_title)) {
            $schema['jobTitle'] = $job_title;
        }

        // Description (from tagline, authority_hook, or biography)
        $description = $this->get_field('tagline');
        if (empty($description)) {
            $description = $this->get_field('authority_hook');
        }
        if (empty($description)) {
            $description = $this->get_field('biography');
        }
        if (!empty($description)) {
            $schema['description'] = $this->clean_text($description, 300);
        }

        // Image
        $headshot = $this->get_headshot_url();
        if ($headshot) {
            $schema['image'] = $headshot;
        }

        // Works for (Organization)
        $company = $this->get_field('company');
        if (!empty($company)) {
            $schema['worksFor'] = [
                '@type' => 'Organization',
                'name' => $company,
            ];
        }

        // Same as (social profiles)
        $same_as = $this->build_same_as_links();
        if (!empty($same_as)) {
            $schema['sameAs'] = $same_as;
        }

        // Knows about (expertise topics)
        $topics = $this->get_expertise_topics();
        if (!empty($topics)) {
            $schema['knowsAbout'] = $topics;
        }

        // Alumni of
        $alumni_of = $this->get_field('alumni_of');
        if (!empty($alumni_of)) {
            $schema['alumniOf'] = $alumni_of;
        }

        // Awards
        $awards = $this->get_field('awards');
        if (!empty($awards)) {
            $schema['award'] = $this->clean_text($awards);
        }

        // Member of
        $member_of = $this->get_field('member_of');
        if (!empty($member_of)) {
            $schema['memberOf'] = $this->clean_text($member_of);
        }

        return $schema;
    }

    /**
     * Generate ProfilePage schema
     *
     * @return array ProfilePage schema array
     */
    public function generate_profile_page_schema(): array {
        $name = $this->get_full_name();
        $data = $this->get_profile_data();

        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'ProfilePage',
            '@id' => $this->get_schema_id('webpage'),
            'url' => $this->get_profile_url(),
            'name' => $name . ' - Media Kit',
            'mainEntity' => [
                '@id' => $this->get_schema_id('person'),
            ],
        ];

        // Description
        $description = $this->get_field('tagline');
        if (empty($description)) {
            $description = $this->get_field('authority_hook');
        }
        if (!empty($description)) {
            $schema['description'] = $this->clean_text($description, 160);
        }

        // Date modified
        $modified = $data['_post_modified'] ?? '';
        if (!empty($modified)) {
            $schema['dateModified'] = date('c', strtotime($modified));
        }

        // Date published
        $published = $data['_post_date'] ?? '';
        if (!empty($published)) {
            $schema['datePublished'] = date('c', strtotime($published));
        }

        // Image
        $headshot = $this->get_headshot_url();
        if ($headshot) {
            $schema['primaryImageOfPage'] = [
                '@type' => 'ImageObject',
                'url' => $headshot,
            ];
        }

        return $schema;
    }

    /**
     * Generate FAQPage schema from interview questions
     *
     * @return array|null FAQPage schema array or null if no questions
     */
    public function generate_faq_schema(): ?array {
        $questions = $this->get_questions();

        if (empty($questions)) {
            return null;
        }

        $faq_items = [];
        foreach ($questions as $q) {
            $faq_items[] = [
                '@type' => 'Question',
                'name' => $q['question'],
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => $q['answer'],
                ],
            ];
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            '@id' => $this->get_schema_id('faq'),
            'mainEntity' => $faq_items,
        ];
    }

    /**
     * Generate SpeakableSpecification schema for AEO
     *
     * @return array SpeakableSpecification schema array
     */
    public function generate_speakable_schema(): array {
        // Get the best content for voice/AI answers
        $speakable_content = [];

        // Tagline is the primary speakable
        $tagline = $this->get_field('tagline');
        if (!empty($tagline)) {
            $speakable_content[] = $this->clean_text($tagline);
        }

        // Authority hook
        $authority_hook = $this->get_field('authority_hook');
        if (!empty($authority_hook)) {
            $speakable_content[] = $this->clean_text($authority_hook);
        }

        // Impact intro
        $impact_intro = $this->get_field('impact_intro');
        if (!empty($impact_intro)) {
            $speakable_content[] = $this->clean_text($impact_intro);
        }

        return [
            '@type' => 'SpeakableSpecification',
            'cssSelector' => [
                '.gmkb-component-tagline',
                '.gmkb-component-biography',
                '.gmkb-component-authority-hook',
            ],
        ];
    }

    /**
     * Generate BreadcrumbList schema
     *
     * @return array BreadcrumbList schema array
     */
    public function generate_breadcrumb_schema(): array {
        $name = $this->get_full_name();

        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => [
                [
                    '@type' => 'ListItem',
                    'position' => 1,
                    'name' => get_bloginfo('name'),
                    'item' => home_url('/'),
                ],
                [
                    '@type' => 'ListItem',
                    'position' => 2,
                    'name' => 'Media Kits',
                    'item' => home_url('/media-kit/'),
                ],
                [
                    '@type' => 'ListItem',
                    'position' => 3,
                    'name' => $name,
                    'item' => $this->get_profile_url(),
                ],
            ],
        ];
    }

    /**
     * Generate all enabled schemas combined
     *
     * @param array $enabled_types Array of schema types to include
     * @return array Combined schema graph
     */
    public function generate_combined_schema(array $enabled_types = ['person', 'profilepage']): array {
        $graph = [];

        if (in_array('person', $enabled_types, true)) {
            $graph[] = $this->generate_person_schema();
        }

        if (in_array('profilepage', $enabled_types, true)) {
            $graph[] = $this->generate_profile_page_schema();
        }

        if (in_array('faq', $enabled_types, true)) {
            $faq = $this->generate_faq_schema();
            if ($faq) {
                $graph[] = $faq;
            }
        }

        if (in_array('breadcrumb', $enabled_types, true)) {
            $graph[] = $this->generate_breadcrumb_schema();
        }

        // If only one schema, return it directly
        if (count($graph) === 1) {
            return $graph[0];
        }

        // Return as graph for multiple schemas
        return [
            '@context' => 'https://schema.org',
            '@graph' => array_map(function($schema) {
                // Remove @context from individual schemas in graph
                unset($schema['@context']);
                return $schema;
            }, $graph),
        ];
    }

    /**
     * Output all enabled schemas as JSON-LD script tags
     *
     * @param array $enabled_types Array of schema types to include
     * @return string HTML script tag with JSON-LD
     */
    public function output_all_schemas(array $enabled_types = ['person', 'profilepage']): string {
        $schema = $this->generate_combined_schema($enabled_types);

        if (empty($schema)) {
            return '';
        }

        $json = wp_json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        return '<script type="application/ld+json">' . $json . '</script>';
    }

    /**
     * Get schema as JSON string
     *
     * @param array $enabled_types Array of schema types to include
     * @return string JSON string
     */
    public function get_schema_json(array $enabled_types = ['person', 'profilepage']): string {
        $schema = $this->generate_combined_schema($enabled_types);
        return wp_json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }
}
