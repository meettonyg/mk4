# Native Code-First Data Layer Migration Plan

## Project: Media Kit Builder Headless Architecture Migration

**Version:** 1.0
**Created:** December 2024
**Status:** Planning Complete - Ready for Implementation

---

## Executive Summary

This plan outlines the migration from Pods Framework to a Native WordPress Code-First Data Layer for the Media Kit Builder. The goal is to create a production-ready headless architecture that:

- Removes plugin dependencies
- Enables version-controlled schema
- Improves API performance
- Supports modern headless patterns (REST/GraphQL)
- Maintains backward compatibility during transition

**Key Insight:** The existing `*_Data_Integration` classes implement the Adapter Pattern, meaning the backend can be swapped with minimal frontend impact.

---

## Current State Analysis

### Architecture Strengths (Already in Place)

| Component | Status | Headless Ready |
|-----------|--------|----------------|
| REST API v2 | `/gmkb/v2/mediakit/{id}` | ✅ Yes |
| Frontend | 100% Vue.js, no PHP rendering | ✅ Yes |
| Components | Self-contained with `pods-config.json` | ✅ Yes |
| Data Abstraction | `*_Data_Integration` classes | ✅ Yes |
| Caching | 5-minute transient + ETag | ✅ Yes |

### Current Pods Implementation Issues

| Issue | Impact | Severity |
|-------|--------|----------|
| Plugin dependency | System fails if Pods deactivated | High |
| Schema in database | Can't version control field definitions | High |
| Inconsistent naming | `1_twitter` vs `guest_youtube` vs `profile_photo` | Medium |
| Table-based storage risk | Data may be in `wp_pods_*` tables | Medium |
| Media field format | Pods returns objects, native returns IDs | Medium |

---

## Migration Phases Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    MIGRATION TIMELINE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Phase 0        Phase 1        Phase 2        Phase 3    Phase 4│
│  DB Audit       Verification   Schema         Identity   GraphQL│
│  ─────────      ───────────    ──────         ────────   ───────│
│  [2 days]       [1 week]       [2 weeks]      [1 week]   [2-3wk]│
│                                                                  │
│  ●───────────●───────────────●──────────────●──────────●────────│
│  │           │               │              │          │        │
│  │           │               │              │          │        │
│  Check       Test native     Code-first    User/Kit   WPGraphQL│
│  storage     data reads      schema        separation integration│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Total Duration: 6-8 weeks
```

---

## Phase 0: Database Audit

**Duration:** 2 days
**Risk Level:** Low
**Prerequisites:** Database access, staging environment

### Objective

Determine how Pods is storing data before attempting migration.

### Tasks

#### 0.1 Check for Pods-Specific Tables

```sql
-- Run on staging/production database
SHOW TABLES LIKE 'wp_pods_%';
```

**Expected Outcomes:**

| Result | Meaning | Action |
|--------|---------|--------|
| No tables found | Pods using meta-based storage | ✅ Proceed to Phase 1 |
| Tables like `wp_pods_guests` | Pods using table-based storage | ⚠️ Migration script needed |
| Tables like `wp_pods_guests_topics` | Repeater fields in separate tables | ⚠️ Migration script needed |

#### 0.2 Verify Field Storage Location

```sql
-- Check where profile data is stored
SELECT meta_key, LEFT(meta_value, 100) as value_preview
FROM wp_postmeta
WHERE post_id = [TEST_POST_ID]
AND meta_key IN (
    'first_name', 'last_name', 'biography',
    'topic_1', 'topic_2',
    'gallery_photos',
    '1_twitter', 'guest_youtube',
    'headshot', 'profile_photo'
)
ORDER BY meta_key;
```

#### 0.3 Check for Serialized Data

```sql
-- Identify serialized values
SELECT meta_key,
       CASE
         WHEN meta_value LIKE 'a:%' THEN 'serialized_array'
         WHEN meta_value LIKE 'O:%' THEN 'serialized_object'
         WHEN meta_value REGEXP '^[0-9]+$' THEN 'integer'
         ELSE 'string'
       END as data_type,
       LEFT(meta_value, 50) as preview
FROM wp_postmeta
WHERE post_id = [TEST_POST_ID]
AND meta_key LIKE '%topic%' OR meta_key LIKE '%gallery%';
```

### Deliverables

- [ ] Database storage map document
- [ ] List of fields in `wp_postmeta` vs Pods tables
- [ ] Identification of serialized fields
- [ ] Go/No-Go decision for Phase 1

### Success Criteria

All critical fields (`biography`, `topics`, `headshot`, `social links`) confirmed in `wp_postmeta`.

---

## Phase 1: Verification

**Duration:** 1 week
**Risk Level:** Medium
**Prerequisites:** Phase 0 complete, staging environment

### Objective

Prove that media kit data can be read without the Pods plugin active.

### Tasks

#### 1.1 Create Comprehensive Test Script

**File:** `tests/native-data-test.php`

```php
<?php
/**
 * Native Data Layer Verification Test
 *
 * Tests if media kit data can be read using native WordPress functions
 * without Pods plugin dependency.
 *
 * Usage: yoursite.com/wp-admin/?gmkb_native_test=1&post_id=123
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Native_Data_Test {

    private $post_id;
    private $results = [];

    public function __construct($post_id) {
        $this->post_id = absint($post_id);
    }

    public function run_all_tests() {
        $this->results = [
            'post_id' => $this->post_id,
            'timestamp' => current_time('mysql'),
            'pods_active' => class_exists('Pods'),
            'tests' => [],
            'summary' => [],
        ];

        $this->test_simple_text_fields();
        $this->test_html_fields();
        $this->test_url_fields();
        $this->test_numbered_fields();
        $this->test_media_fields();
        $this->test_array_fields();

        $this->calculate_summary();

        return $this->results;
    }

    private function test_simple_text_fields() {
        $fields = [
            'first_name', 'last_name', 'email', 'phone',
            'address', 'city', 'state', 'zip', 'country', 'skype'
        ];

        $this->results['tests']['simple_text'] = $this->test_field_group($fields, 'text');
    }

    private function test_html_fields() {
        $fields = ['biography', 'introduction', 'biography_long'];
        $this->results['tests']['html'] = $this->test_field_group($fields, 'html');
    }

    private function test_url_fields() {
        $fields = [
            '1_twitter', '1_facebook', '1_instagram', '1_linkedin',
            '1_tiktok', '1_pinterest', 'guest_youtube',
            '1_website', '2_website', 'video_intro', 'calendar_url'
        ];
        $this->results['tests']['url'] = $this->test_field_group($fields, 'url');
    }

    private function test_numbered_fields() {
        $topic_fields = [];
        for ($i = 1; $i <= 5; $i++) {
            $topic_fields[] = "topic_$i";
        }
        $this->results['tests']['topics'] = $this->test_field_group($topic_fields, 'text');

        $question_fields = [];
        for ($i = 1; $i <= 10; $i++) { // Test first 10
            $question_fields[] = "question_$i";
        }
        $this->results['tests']['questions'] = $this->test_field_group($question_fields, 'text');
    }

    private function test_media_fields() {
        $fields = ['headshot', 'guest_headshot', 'profile_photo',
                   'personal_brand_logo', 'company_logo'];

        $results = [];
        foreach ($fields as $field) {
            $value = get_post_meta($this->post_id, $field, true);
            $results[$field] = [
                'raw_value' => $value,
                'type' => gettype($value),
                'is_numeric' => is_numeric($value),
                'is_array' => is_array($value),
                'attachment_exists' => is_numeric($value) ?
                    (get_post($value) !== null) : false,
                'passed' => !empty($value),
            ];

            // If it's an array (Pods format), extract ID
            if (is_array($value) && isset($value['ID'])) {
                $results[$field]['pods_format'] = true;
                $results[$field]['extracted_id'] = $value['ID'];
            }
        }

        $this->results['tests']['media'] = [
            'fields' => $results,
            'passed_count' => count(array_filter(array_column($results, 'passed'))),
            'total_count' => count($results),
        ];
    }

    private function test_array_fields() {
        $fields = ['gallery_photos', 'featured_logos'];

        $results = [];
        foreach ($fields as $field) {
            $value = get_post_meta($this->post_id, $field, true);
            $unserialized = maybe_unserialize($value);

            $results[$field] = [
                'raw_value' => $value,
                'raw_type' => gettype($value),
                'is_serialized' => is_serialized($value),
                'unserialized' => $unserialized,
                'unserialized_type' => gettype($unserialized),
                'item_count' => is_array($unserialized) ? count($unserialized) : 0,
                'passed' => !empty($value),
            ];
        }

        $this->results['tests']['arrays'] = [
            'fields' => $results,
            'passed_count' => count(array_filter(array_column($results, 'passed'))),
            'total_count' => count($results),
        ];
    }

    private function test_field_group($fields, $type) {
        $results = [];
        foreach ($fields as $field) {
            $value = get_post_meta($this->post_id, $field, true);
            $results[$field] = [
                'value' => $type === 'html' ?
                    wp_trim_words(strip_tags($value), 10) : $value,
                'full_length' => strlen($value),
                'type' => gettype($value),
                'passed' => !empty($value),
            ];
        }

        return [
            'fields' => $results,
            'passed_count' => count(array_filter(array_column($results, 'passed'))),
            'total_count' => count($results),
        ];
    }

    private function calculate_summary() {
        $total_passed = 0;
        $total_fields = 0;
        $failed_fields = [];

        foreach ($this->results['tests'] as $group_name => $group) {
            $total_passed += $group['passed_count'];
            $total_fields += $group['total_count'];

            foreach ($group['fields'] as $field_name => $field_data) {
                if (!$field_data['passed']) {
                    $failed_fields[] = $field_name;
                }
            }
        }

        $this->results['summary'] = [
            'total_fields_tested' => $total_fields,
            'fields_with_data' => $total_passed,
            'fields_empty' => $total_fields - $total_passed,
            'failed_fields' => $failed_fields,
            'overall_status' => $total_passed > 0 ? 'PASS' : 'FAIL',
            'ready_for_phase_2' => empty($failed_fields) ||
                count($failed_fields) < ($total_fields * 0.1), // Allow 10% empty
        ];
    }
}

// Register test endpoint
add_action('admin_init', function() {
    if (!isset($_GET['gmkb_native_test'])) {
        return;
    }

    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized');
    }

    $post_id = isset($_GET['post_id']) ? absint($_GET['post_id']) : 0;

    if (!$post_id) {
        wp_die('post_id parameter required');
    }

    $tester = new GMKB_Native_Data_Test($post_id);
    $results = $tester->run_all_tests();

    header('Content-Type: application/json');
    echo json_encode($results, JSON_PRETTY_PRINT);
    exit;
});
```

#### 1.2 Run Tests with Pods Active

1. Deploy test script to staging
2. Run test on 3-5 different media kit posts
3. Document baseline results

#### 1.3 Run Tests with Pods Deactivated

1. Deactivate Pods plugin on staging
2. Run same tests on same posts
3. Compare results

#### 1.4 Analyze Gaps

| Scenario | Action |
|----------|--------|
| All fields pass | Proceed to Phase 2 |
| Media fields return arrays instead of IDs | Add format handling in Phase 2 |
| Array fields return serialized strings | Add `maybe_unserialize()` handling |
| Some fields completely missing | Check for Pods table storage |

### Deliverables

- [ ] Test script deployed and working
- [ ] Test results with Pods active (baseline)
- [ ] Test results with Pods deactivated (target)
- [ ] Gap analysis document
- [ ] Go/No-Go decision for Phase 2

### Success Criteria

- 90%+ of fields readable without Pods
- Clear understanding of any format differences
- Migration path identified for any gaps

---

## Phase 2: Schema Codification

**Duration:** 2 weeks
**Risk Level:** Medium
**Prerequisites:** Phase 1 complete with PASS status

### Objective

Define all Custom Post Types and meta fields in version-controlled PHP code.

### Tasks

#### 2.1 Create Core Schema File

**File:** `system/core-schema.php`

```php
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
```

#### 2.2 Create Field Name Migration Map

**File:** `system/field-migration-map.php`

```php
<?php
/**
 * Field Name Migration Map
 *
 * Maps legacy Pods field names to new standardized names.
 * Used during transition period for backward compatibility.
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Field_Migration {

    /**
     * Legacy to new field name mapping
     */
    const FIELD_MAP = [
        // Social Media
        '1_twitter' => 'social_twitter',
        '1_facebook' => 'social_facebook',
        '1_instagram' => 'social_instagram',
        '1_linkedin' => 'social_linkedin',
        '1_tiktok' => 'social_tiktok',
        '1_pinterest' => 'social_pinterest',
        'guest_youtube' => 'social_youtube',

        // Websites
        '1_website' => 'website_primary',
        '2_website' => 'website_secondary',
    ];

    /**
     * Get field value with fallback to legacy name
     */
    public static function get_field($post_id, $field_name) {
        // Try new name first
        $value = get_post_meta($post_id, $field_name, true);

        if (!empty($value)) {
            return $value;
        }

        // Try legacy name
        $legacy_name = array_search($field_name, self::FIELD_MAP);
        if ($legacy_name) {
            return get_post_meta($post_id, $legacy_name, true);
        }

        // Try if this IS a legacy name
        if (isset(self::FIELD_MAP[$field_name])) {
            return get_post_meta($post_id, self::FIELD_MAP[$field_name], true);
        }

        return $value;
    }

    /**
     * Migrate a post's fields from legacy to new names
     */
    public static function migrate_post($post_id) {
        $migrated = [];

        foreach (self::FIELD_MAP as $legacy => $new) {
            $legacy_value = get_post_meta($post_id, $legacy, true);

            if (!empty($legacy_value)) {
                // Copy to new field
                update_post_meta($post_id, $new, $legacy_value);
                $migrated[$legacy] = $new;
            }
        }

        return $migrated;
    }

    /**
     * Batch migrate all posts
     */
    public static function migrate_all($batch_size = 50) {
        $posts = get_posts([
            'post_type' => ['guests', 'mkcg'],
            'posts_per_page' => $batch_size,
            'meta_query' => [
                [
                    'key' => '_gmkb_fields_migrated',
                    'compare' => 'NOT EXISTS',
                ],
            ],
        ]);

        $results = [];

        foreach ($posts as $post) {
            $migrated = self::migrate_post($post->ID);
            update_post_meta($post->ID, '_gmkb_fields_migrated', time());
            $results[$post->ID] = $migrated;
        }

        return [
            'processed' => count($posts),
            'details' => $results,
            'remaining' => self::count_remaining(),
        ];
    }

    /**
     * Count posts not yet migrated
     */
    public static function count_remaining() {
        global $wpdb;

        return $wpdb->get_var("
            SELECT COUNT(*)
            FROM {$wpdb->posts} p
            LEFT JOIN {$wpdb->postmeta} pm
                ON p.ID = pm.post_id
                AND pm.meta_key = '_gmkb_fields_migrated'
            WHERE p.post_type IN ('guests', 'mkcg')
            AND pm.meta_id IS NULL
        ");
    }
}
```

#### 2.3 Update Main Plugin to Load Schema

**Edit:** `guestify-media-kit-builder.php`

Add after line ~140:

```php
// PHASE 2: Native Code-First Schema
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/core-schema.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/core-schema.php';
}

if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/field-migration-map.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/field-migration-map.php';
}
```

### Deliverables

- [ ] `system/core-schema.php` - All fields defined in code
- [ ] `system/field-migration-map.php` - Legacy name support
- [ ] Main plugin updated to load schema
- [ ] Fields visible in REST API without Pods
- [ ] All existing data still accessible

### Success Criteria

- Native REST API returns all profile fields
- Media fields expand to full objects
- Array fields properly serialize/deserialize
- Legacy field names still work

---

## Phase 3: Identity Model

**Duration:** 1 week
**Risk Level:** Low
**Prerequisites:** Phase 2 complete

### Objective

Separate user authentication from media kit ownership.

### Tasks

#### 3.1 Add Owner User ID Field

Already included in Phase 2 schema. Verify it's working:

```php
// Test
update_post_meta($media_kit_id, 'owner_user_id', get_current_user_id());
$owner = get_post_meta($media_kit_id, 'owner_user_id', true);
```

#### 3.2 Create Permission Helper

**File:** `system/permissions.php`

```php
<?php
/**
 * GMKB Permission Helpers
 *
 * Implements owner-based permission model for headless architecture.
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Permissions {

    /**
     * Check if user can view a media kit
     */
    public static function can_view($post_id, $user_id = null) {
        $post = get_post($post_id);

        if (!$post) {
            return false;
        }

        // Published posts are public
        if ($post->post_status === 'publish') {
            return true;
        }

        // Otherwise, must be owner
        return self::is_owner($post_id, $user_id);
    }

    /**
     * Check if user can edit a media kit
     */
    public static function can_edit($post_id, $user_id = null) {
        if ($user_id === null) {
            $user_id = get_current_user_id();
        }

        if (!$user_id) {
            return false;
        }

        // Admins can edit anything
        if (user_can($user_id, 'manage_options')) {
            return true;
        }

        return self::is_owner($post_id, $user_id);
    }

    /**
     * Check if user owns a media kit
     */
    public static function is_owner($post_id, $user_id = null) {
        if ($user_id === null) {
            $user_id = get_current_user_id();
        }

        if (!$user_id) {
            return false;
        }

        // Check owner_user_id meta field
        $owner_id = get_post_meta($post_id, 'owner_user_id', true);

        // Fallback to post author during migration
        if (empty($owner_id)) {
            $post = get_post($post_id);
            $owner_id = $post ? $post->post_author : 0;
        }

        return absint($owner_id) === absint($user_id);
    }

    /**
     * Get all media kits owned by a user
     */
    public static function get_user_media_kits($user_id = null) {
        if ($user_id === null) {
            $user_id = get_current_user_id();
        }

        return get_posts([
            'post_type' => 'guests',
            'posts_per_page' => -1,
            'post_status' => ['publish', 'draft', 'private'],
            'meta_query' => [
                'relation' => 'OR',
                [
                    'key' => 'owner_user_id',
                    'value' => $user_id,
                    'compare' => '=',
                ],
            ],
            'author' => $user_id, // Fallback for posts without owner_user_id
        ]);
    }

    /**
     * REST API permission callback
     */
    public static function rest_permission_callback($request) {
        $post_id = $request->get_param('id');
        $method = $request->get_method();

        if ($method === 'GET') {
            return self::can_view($post_id);
        }

        return self::can_edit($post_id);
    }
}
```

#### 3.3 Update REST API Permissions

**Edit:** `includes/api/v2/class-gmkb-rest-api-v2.php`

Update permission callbacks to use new system:

```php
// In register_routes()
register_rest_route($this->namespace, '/mediakit/(?P<id>\d+)', [
    'methods' => 'GET',
    'callback' => [$this, 'get_mediakit'],
    'permission_callback' => ['GMKB_Permissions', 'rest_permission_callback'],
    // ...
]);
```

#### 3.4 Backfill Owner User ID

Create migration script to set `owner_user_id` from `post_author`:

```php
// Run once via WP-CLI or admin action
function gmkb_backfill_owner_user_id() {
    $posts = get_posts([
        'post_type' => ['guests', 'mkcg'],
        'posts_per_page' => -1,
        'meta_query' => [
            [
                'key' => 'owner_user_id',
                'compare' => 'NOT EXISTS',
            ],
        ],
    ]);

    foreach ($posts as $post) {
        update_post_meta($post->ID, 'owner_user_id', $post->post_author);
    }

    return count($posts);
}
```

### Deliverables

- [ ] `system/permissions.php` - Owner-based permission checks
- [ ] REST API using new permission model
- [ ] All existing posts have `owner_user_id` set
- [ ] Users can only edit their own media kits

### Success Criteria

- Permission checks use `owner_user_id` not post author
- One user can own multiple media kits
- API returns 403 for unauthorized access

---

## Phase 4: GraphQL Integration

**Duration:** 2-3 weeks
**Risk Level:** Low
**Prerequisites:** Phase 3 complete

### Objective

Add WPGraphQL support for modern headless frontend development.

### Tasks

#### 4.1 Install WPGraphQL

```bash
# Via Composer (recommended)
composer require wp-graphql/wp-graphql

# Or download from WordPress.org
```

#### 4.2 Verify Auto-Registration

Native `register_post_meta` with `show_in_rest => true` should automatically expose fields to GraphQL.

Test query:

```graphql
query GetMediaKit {
  guest(id: "123", idType: DATABASE_ID) {
    databaseId
    title
    firstName
    lastName
    biography
    email
    socialTwitter
    headshot {
      id
      sourceUrl
      altText
    }
  }
}
```

#### 4.3 Create Custom Types (if needed)

**File:** `system/graphql-types.php`

```php
<?php
/**
 * GMKB GraphQL Type Registration
 */

add_action('graphql_register_types', function() {

    // Register MediaKit type alias
    register_graphql_object_type('MediaKit', [
        'description' => 'A media kit profile',
        'fields' => [
            'id' => ['type' => 'ID'],
            'title' => ['type' => 'String'],
            'firstName' => ['type' => 'String'],
            'lastName' => ['type' => 'String'],
            'fullName' => [
                'type' => 'String',
                'resolve' => function($post) {
                    $first = get_post_meta($post->ID, 'first_name', true);
                    $last = get_post_meta($post->ID, 'last_name', true);
                    return trim("$first $last");
                },
            ],
            'biography' => ['type' => 'String'],
            'socialLinks' => [
                'type' => ['list_of' => 'SocialLink'],
                'resolve' => function($post) {
                    $links = [];
                    $platforms = [
                        'twitter', 'facebook', 'instagram',
                        'linkedin', 'tiktok', 'youtube',
                    ];
                    foreach ($platforms as $platform) {
                        $url = get_post_meta($post->ID, "social_$platform", true)
                            ?: get_post_meta($post->ID, "1_$platform", true);
                        if ($url) {
                            $links[] = [
                                'platform' => $platform,
                                'url' => $url,
                            ];
                        }
                    }
                    return $links;
                },
            ],
        ],
    ]);

    // Social Link type
    register_graphql_object_type('SocialLink', [
        'fields' => [
            'platform' => ['type' => 'String'],
            'url' => ['type' => 'String'],
        ],
    ]);
});
```

#### 4.4 Update Frontend (Optional)

If migrating frontend to GraphQL:

```javascript
// src/services/GraphQLService.js
import { gql } from '@apollo/client';

export const GET_MEDIA_KIT = gql`
  query GetMediaKit($id: ID!) {
    mediaKit(id: $id, idType: DATABASE_ID) {
      id
      title
      firstName
      lastName
      biography
      headshot {
        sourceUrl
        altText
      }
      socialLinks {
        platform
        url
      }
      topics {
        topic1
        topic2
        topic3
        topic4
        topic5
      }
    }
  }
`;
```

### Deliverables

- [ ] WPGraphQL installed and configured
- [ ] All profile fields queryable via GraphQL
- [ ] Custom types for complex data (socialLinks, etc.)
- [ ] GraphQL IDE (GraphiQL) accessible for testing
- [ ] Documentation for frontend developers

### Success Criteria

- GraphQL endpoint returns all media kit data
- Queries more efficient than REST (no over-fetching)
- Frontend can optionally use GraphQL

---

## Post-Migration Tasks

### Remove Pods Dependency

After all phases complete and verified:

1. Remove Pods from required plugins
2. Update documentation
3. Archive `pods-config.json` files (keep for reference)
4. Remove Pods-specific code paths

### Performance Verification

- [ ] Compare API response times (before/after)
- [ ] Verify caching still works
- [ ] Load test with multiple concurrent users

### Documentation Updates

- [ ] Update `ARCHITECTURE.md`
- [ ] Update component documentation
- [ ] Create headless deployment guide

---

## Risk Mitigation

### Rollback Plan

If issues discovered:

1. Re-activate Pods plugin
2. Data is unchanged (still in wp_postmeta)
3. Pods reads same meta keys
4. System returns to previous state

### Data Safety

- No data migration required (same storage)
- Only reading/writing method changes
- All changes reversible

### Testing Requirements

- [ ] Unit tests for schema registration
- [ ] Integration tests for REST API
- [ ] E2E tests for frontend functionality
- [ ] Load tests for performance

---

## Appendix A: Full Field Inventory

| Field Name | Type | Category | REST | GraphQL |
|------------|------|----------|------|---------|
| first_name | string | Personal | ✅ | ✅ |
| last_name | string | Personal | ✅ | ✅ |
| biography | string (HTML) | Personal | ✅ | ✅ |
| biography_long | string (HTML) | Personal | ✅ | ✅ |
| introduction | string (HTML) | Personal | ✅ | ✅ |
| email | string | Contact | ✅ | ✅ |
| phone | string | Contact | ✅ | ✅ |
| skype | string | Contact | ✅ | ✅ |
| address | string | Contact | ✅ | ✅ |
| city | string | Contact | ✅ | ✅ |
| state | string | Contact | ✅ | ✅ |
| zip | string | Contact | ✅ | ✅ |
| country | string | Contact | ✅ | ✅ |
| timezone | string | Contact | ✅ | ✅ |
| social_twitter | URL | Social | ✅ | ✅ |
| social_facebook | URL | Social | ✅ | ✅ |
| social_instagram | URL | Social | ✅ | ✅ |
| social_linkedin | URL | Social | ✅ | ✅ |
| social_tiktok | URL | Social | ✅ | ✅ |
| social_youtube | URL | Social | ✅ | ✅ |
| social_pinterest | URL | Social | ✅ | ✅ |
| website_primary | URL | Social | ✅ | ✅ |
| website_secondary | URL | Social | ✅ | ✅ |
| video_intro | URL | Media | ✅ | ✅ |
| calendar_url | URL | Booking | ✅ | ✅ |
| topic_1 - topic_5 | string | Content | ✅ | ✅ |
| question_1 - question_25 | string | Content | ✅ | ✅ |
| headshot | integer (ID) | Media | ✅ | ✅ |
| guest_headshot | integer (ID) | Media | ✅ | ✅ |
| profile_photo | integer (ID) | Media | ✅ | ✅ |
| personal_brand_logo | integer (ID) | Media | ✅ | ✅ |
| company_logo | integer (ID) | Media | ✅ | ✅ |
| gallery_photos | array (IDs) | Media | ✅ | ✅ |
| featured_logos | array (IDs) | Media | ✅ | ✅ |
| owner_user_id | integer | System | ✅ | ✅ |

---

## Appendix B: Legacy Field Name Mapping

| Legacy (Pods) | New (Standardized) |
|---------------|-------------------|
| 1_twitter | social_twitter |
| 1_facebook | social_facebook |
| 1_instagram | social_instagram |
| 1_linkedin | social_linkedin |
| 1_tiktok | social_tiktok |
| 1_pinterest | social_pinterest |
| guest_youtube | social_youtube |
| 1_website | website_primary |
| 2_website | website_secondary |

---

**Document Version:** 1.0
**Last Updated:** December 2024
**Status:** Ready for Implementation
