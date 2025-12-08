<?php
/**
 * Native Data Layer Verification Test
 *
 * Tests if media kit data can be read using native WordPress functions
 * without Pods plugin dependency.
 *
 * Usage: yoursite.com/wp-admin/?gmkb_native_test=1&post_id=123
 *
 * @package GMKB
 * @since 3.0.0
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
