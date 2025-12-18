<?php
/**
 * Profile Scoring System (Cialdini Model) Tests
 *
 * Tests the influence-based profile scoring system including pillar calculations,
 * recommendations, and status determination.
 *
 * Usage:
 *   - Admin URL: yoursite.com/wp-admin/?gmkb_profile_scoring_test=1&profile_id=123
 *   - WP-CLI: wp gmkb profile-scoring-test [--profile_id=123]
 *
 * @package GMKB
 * @since 2.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Profile_Scoring_Test {

    private $profile_id;
    private $results = [];

    public function __construct(?int $profile_id = null) {
        $this->profile_id = $profile_id;
    }

    /**
     * Run all profile scoring tests
     */
    public function run_all_tests(): array {
        $this->results = [
            'profile_id' => $this->profile_id,
            'timestamp' => current_time('mysql'),
            'tests' => [],
            'summary' => [],
        ];

        $this->test_class_exists();
        $this->test_pillar_weights();
        $this->test_schema_structure();

        if ($this->profile_id) {
            $this->test_calculate_strength();
            $this->test_pillar_calculations();
            $this->test_recommendations();
            $this->test_status_determination();
        }

        $this->calculate_summary();

        return $this->results;
    }

    /**
     * Test class exists
     */
    private function test_class_exists(): void {
        $tests = [];

        $tests['class_exists'] = [
            'description' => 'GMKB_Profile_Scoring class exists',
            'passed' => class_exists('GMKB_Profile_Scoring'),
        ];

        $this->results['tests']['class'] = [
            'tests' => $tests,
            'passed_count' => count(array_filter(array_column($tests, 'passed'))),
            'total_count' => count($tests),
        ];
    }

    /**
     * Test pillar weights sum to 100
     */
    private function test_pillar_weights(): void {
        $tests = [];

        if (!class_exists('GMKB_Profile_Scoring')) {
            $tests['class_required'] = [
                'description' => 'Class required for this test',
                'passed' => false,
            ];
            $this->results['tests']['pillar_weights'] = [
                'tests' => $tests,
                'passed_count' => 0,
                'total_count' => 1,
            ];
            return;
        }

        $weights = GMKB_Profile_Scoring::PILLAR_WEIGHTS;

        $tests['weights_defined'] = [
            'description' => 'Pillar weights are defined',
            'passed' => !empty($weights),
            'value' => count($weights) . ' pillars',
        ];

        // Test weights sum to 100
        $total = array_sum($weights);
        $tests['weights_sum_100'] = [
            'description' => 'Pillar weights sum to 100',
            'passed' => $total === 100,
            'value' => $total,
        ];

        // Test each pillar has correct weight
        $expected_weights = [
            'identity' => 20,
            'authority' => 30,
            'value' => 30,
            'proof' => 20,
        ];

        foreach ($expected_weights as $pillar => $expected) {
            $actual = $weights[$pillar] ?? 0;
            $tests["weight_{$pillar}"] = [
                'description' => "'{$pillar}' pillar weight is {$expected}",
                'passed' => $actual === $expected,
                'value' => $actual,
            ];
        }

        $this->results['tests']['pillar_weights'] = [
            'tests' => $tests,
            'passed_count' => count(array_filter(array_column($tests, 'passed'))),
            'total_count' => count($tests),
        ];
    }

    /**
     * Test schema structure
     */
    private function test_schema_structure(): void {
        $tests = [];

        if (!class_exists('GMKB_Profile_Scoring')) {
            $tests['class_required'] = [
                'description' => 'Class required for this test',
                'passed' => false,
            ];
            $this->results['tests']['schema'] = [
                'tests' => $tests,
                'passed_count' => 0,
                'total_count' => 1,
            ];
            return;
        }

        $schema = GMKB_Profile_Scoring::get_schema();

        $tests['schema_returns_array'] = [
            'description' => 'get_schema() returns array',
            'passed' => is_array($schema),
        ];

        $tests['schema_has_pillars'] = [
            'description' => 'Schema has pillars',
            'passed' => isset($schema['pillars']) && is_array($schema['pillars']),
            'value' => isset($schema['pillars']) ? count($schema['pillars']) . ' pillars' : 'missing',
        ];

        $tests['schema_has_total_points'] = [
            'description' => 'Schema has total_points = 100',
            'passed' => isset($schema['total_points']) && $schema['total_points'] === 100,
            'value' => $schema['total_points'] ?? 'missing',
        ];

        $tests['schema_has_thresholds'] = [
            'description' => 'Schema has status thresholds',
            'passed' => isset($schema['thresholds']) && is_array($schema['thresholds']),
        ];

        // Verify each pillar in schema
        if (isset($schema['pillars'])) {
            foreach ($schema['pillars'] as $pillar) {
                $pillar_id = $pillar['id'] ?? 'unknown';
                $tests["pillar_{$pillar_id}_structure"] = [
                    'description' => "Pillar '{$pillar_id}' has required fields",
                    'passed' => isset($pillar['id'], $pillar['label'], $pillar['max_points']),
                ];
            }
        }

        $this->results['tests']['schema'] = [
            'tests' => $tests,
            'passed_count' => count(array_filter(array_column($tests, 'passed'))),
            'total_count' => count($tests),
        ];
    }

    /**
     * Test calculate_strength with actual profile
     */
    private function test_calculate_strength(): void {
        $tests = [];

        if (!class_exists('GMKB_Profile_Scoring')) {
            $tests['class_required'] = [
                'description' => 'Class required for this test',
                'passed' => false,
            ];
            $this->results['tests']['calculate_strength'] = [
                'tests' => $tests,
                'passed_count' => 0,
                'total_count' => 1,
            ];
            return;
        }

        $strength = GMKB_Profile_Scoring::calculate_strength($this->profile_id);

        $tests['returns_array'] = [
            'description' => 'calculate_strength() returns array',
            'passed' => is_array($strength),
        ];

        // Test required keys
        $required_keys = ['profile_id', 'total_score', 'percentage', 'status', 'pillars', 'recommendations'];
        foreach ($required_keys as $key) {
            $tests["has_{$key}"] = [
                'description' => "Result has '{$key}' key",
                'passed' => isset($strength[$key]),
            ];
        }

        // Test score range
        $tests['score_in_range'] = [
            'description' => 'Total score between 0-100',
            'passed' => isset($strength['total_score']) &&
                       $strength['total_score'] >= 0 &&
                       $strength['total_score'] <= 100,
            'value' => $strength['total_score'] ?? 'undefined',
        ];

        // Test percentage matches score
        $tests['percentage_matches'] = [
            'description' => 'Percentage equals total_score',
            'passed' => $strength['total_score'] === $strength['percentage'],
            'value' => $strength['percentage'] ?? 'undefined',
        ];

        // Test profile_id matches
        $tests['profile_id_matches'] = [
            'description' => 'Returned profile_id matches input',
            'passed' => $strength['profile_id'] === $this->profile_id,
        ];

        // Test boolean flags
        $tests['has_is_complete'] = [
            'description' => 'Has is_complete boolean',
            'passed' => isset($strength['is_complete']) && is_bool($strength['is_complete']),
            'value' => $strength['is_complete'] ? 'true' : 'false',
        ];

        $tests['has_is_publishable'] = [
            'description' => 'Has is_publishable boolean',
            'passed' => isset($strength['is_publishable']) && is_bool($strength['is_publishable']),
            'value' => $strength['is_publishable'] ? 'true' : 'false',
        ];

        $this->results['tests']['calculate_strength'] = [
            'tests' => $tests,
            'passed_count' => count(array_filter(array_column($tests, 'passed'))),
            'total_count' => count($tests),
        ];
    }

    /**
     * Test pillar calculations
     */
    private function test_pillar_calculations(): void {
        $tests = [];

        $strength = GMKB_Profile_Scoring::calculate_strength($this->profile_id);
        $pillars = $strength['pillars'] ?? [];

        $pillar_ids = ['identity', 'authority', 'value', 'proof'];

        foreach ($pillar_ids as $pillar_id) {
            $pillar = $pillars[$pillar_id] ?? null;

            $tests["{$pillar_id}_exists"] = [
                'description' => "Pillar '{$pillar_id}' exists in result",
                'passed' => $pillar !== null,
            ];

            if ($pillar) {
                // Test pillar structure
                $tests["{$pillar_id}_has_score"] = [
                    'description' => "Pillar '{$pillar_id}' has score",
                    'passed' => isset($pillar['score']),
                    'value' => $pillar['score'] ?? 'missing',
                ];

                $tests["{$pillar_id}_has_max"] = [
                    'description' => "Pillar '{$pillar_id}' has max",
                    'passed' => isset($pillar['max']),
                    'value' => $pillar['max'] ?? 'missing',
                ];

                $tests["{$pillar_id}_score_in_range"] = [
                    'description' => "Pillar '{$pillar_id}' score <= max",
                    'passed' => isset($pillar['score'], $pillar['max']) &&
                               $pillar['score'] <= $pillar['max'],
                    'value' => ($pillar['score'] ?? 0) . '/' . ($pillar['max'] ?? 0),
                ];

                $tests["{$pillar_id}_has_percentage"] = [
                    'description' => "Pillar '{$pillar_id}' has percentage",
                    'passed' => isset($pillar['percentage']),
                    'value' => ($pillar['percentage'] ?? 'missing') . '%',
                ];
            }
        }

        // Test that pillar scores sum to total
        $pillar_sum = 0;
        foreach ($pillars as $pillar) {
            $pillar_sum += $pillar['score'] ?? 0;
        }
        $tests['pillar_sum_equals_total'] = [
            'description' => 'Pillar scores sum to total_score',
            'passed' => $pillar_sum === ($strength['total_score'] ?? -1),
            'value' => "Sum: {$pillar_sum}, Total: " . ($strength['total_score'] ?? 'undefined'),
        ];

        $this->results['tests']['pillar_calculations'] = [
            'tests' => $tests,
            'passed_count' => count(array_filter(array_column($tests, 'passed'))),
            'total_count' => count($tests),
        ];
    }

    /**
     * Test recommendations
     */
    private function test_recommendations(): void {
        $tests = [];

        $strength = GMKB_Profile_Scoring::calculate_strength($this->profile_id);
        $recommendations = $strength['recommendations'] ?? [];

        $tests['recommendations_is_array'] = [
            'description' => 'Recommendations is an array',
            'passed' => is_array($recommendations),
            'value' => count($recommendations) . ' recommendations',
        ];

        $tests['recommendations_max_5'] = [
            'description' => 'Recommendations limited to 5',
            'passed' => count($recommendations) <= 5,
        ];

        // Test recommendation structure
        if (!empty($recommendations)) {
            $first = $recommendations[0];
            $tests['rec_has_priority'] = [
                'description' => 'Recommendation has priority',
                'passed' => isset($first['priority']),
                'value' => $first['priority'] ?? 'missing',
            ];

            $tests['rec_has_field'] = [
                'description' => 'Recommendation has field',
                'passed' => isset($first['field']),
            ];

            $tests['rec_has_message'] = [
                'description' => 'Recommendation has message',
                'passed' => isset($first['message']),
            ];

            $tests['rec_has_points'] = [
                'description' => 'Recommendation has points',
                'passed' => isset($first['points']),
                'value' => $first['points'] ?? 'missing',
            ];

            // Test priority ordering
            $valid_order = true;
            $priority_values = ['critical' => 0, 'high' => 1, 'medium' => 2, 'low' => 3];
            $prev_priority = -1;

            foreach ($recommendations as $rec) {
                $current_priority = $priority_values[$rec['priority']] ?? 99;
                if ($current_priority < $prev_priority) {
                    $valid_order = false;
                    break;
                }
                $prev_priority = $current_priority;
            }

            $tests['recommendations_sorted'] = [
                'description' => 'Recommendations sorted by priority',
                'passed' => $valid_order,
            ];
        }

        $this->results['tests']['recommendations'] = [
            'tests' => $tests,
            'passed_count' => count(array_filter(array_column($tests, 'passed'))),
            'total_count' => count($tests),
        ];
    }

    /**
     * Test status determination
     */
    private function test_status_determination(): void {
        $tests = [];

        $strength = GMKB_Profile_Scoring::calculate_strength($this->profile_id);
        $status = $strength['status'] ?? [];

        $tests['status_is_array'] = [
            'description' => 'Status is an array',
            'passed' => is_array($status),
        ];

        // Test status structure
        $status_keys = ['level', 'label', 'message', 'color'];
        foreach ($status_keys as $key) {
            $tests["status_has_{$key}"] = [
                'description' => "Status has '{$key}'",
                'passed' => isset($status[$key]),
                'value' => $status[$key] ?? 'missing',
            ];
        }

        // Test status level is valid
        $valid_levels = ['draft', 'needs_work', 'good', 'strong', 'excellent'];
        $tests['status_level_valid'] = [
            'description' => 'Status level is valid',
            'passed' => isset($status['level']) && in_array($status['level'], $valid_levels),
            'value' => $status['level'] ?? 'missing',
        ];

        // Test status color is valid
        $valid_colors = ['gray', 'orange', 'yellow', 'blue', 'green'];
        $tests['status_color_valid'] = [
            'description' => 'Status color is valid',
            'passed' => isset($status['color']) && in_array($status['color'], $valid_colors),
            'value' => $status['color'] ?? 'missing',
        ];

        // Test status consistency with score
        $score = $strength['total_score'] ?? 0;
        $identity_complete = ($strength['pillars']['identity']['score'] ?? 0) === 20;

        if (!$identity_complete) {
            $tests['draft_when_identity_incomplete'] = [
                'description' => "Status is 'draft' when identity incomplete",
                'passed' => ($status['level'] ?? '') === 'draft',
            ];
        } elseif ($score >= 90) {
            $tests['excellent_when_90plus'] = [
                'description' => "Status is 'excellent' when score >= 90",
                'passed' => ($status['level'] ?? '') === 'excellent',
            ];
        } elseif ($score >= 70) {
            $tests['strong_when_70plus'] = [
                'description' => "Status is 'strong' when score >= 70",
                'passed' => ($status['level'] ?? '') === 'strong',
            ];
        }

        $this->results['tests']['status'] = [
            'tests' => $tests,
            'passed_count' => count(array_filter(array_column($tests, 'passed'))),
            'total_count' => count($tests),
        ];
    }

    /**
     * Calculate summary
     */
    private function calculate_summary(): void {
        $total_passed = 0;
        $total_tests = 0;
        $failed_tests = [];

        foreach ($this->results['tests'] as $group_name => $group) {
            $total_passed += $group['passed_count'];
            $total_tests += $group['total_count'];

            foreach ($group['tests'] as $test_name => $test_data) {
                if (!($test_data['passed'] ?? false)) {
                    $failed_tests[] = "{$group_name}.{$test_name}";
                }
            }
        }

        $this->results['summary'] = [
            'total_tests' => $total_tests,
            'passed' => $total_passed,
            'failed' => $total_tests - $total_passed,
            'pass_rate' => $total_tests > 0 ? round(($total_passed / $total_tests) * 100, 1) : 0,
            'failed_tests' => $failed_tests,
            'overall_status' => empty($failed_tests) ? 'PASS' : 'FAIL',
        ];
    }
}

// Register admin test endpoint
add_action('admin_init', function() {
    if (!isset($_GET['gmkb_profile_scoring_test'])) {
        return;
    }

    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized');
    }

    $profile_id = isset($_GET['profile_id']) ? absint($_GET['profile_id']) : null;

    $tester = new GMKB_Profile_Scoring_Test($profile_id);
    $results = $tester->run_all_tests();

    header('Content-Type: application/json');
    echo json_encode($results, JSON_PRETTY_PRINT);
    exit;
});

// WP-CLI command
if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command('gmkb profile-scoring-test', function($args, $assoc_args) {
        $profile_id = isset($assoc_args['profile_id']) ? absint($assoc_args['profile_id']) : null;

        $tester = new GMKB_Profile_Scoring_Test($profile_id);
        $results = $tester->run_all_tests();

        WP_CLI::log('');
        WP_CLI::log('=== Profile Scoring (Cialdini Model) Tests ===');
        WP_CLI::log('');
        WP_CLI::log('Profile ID: ' . ($results['profile_id'] ?: 'None (schema tests only)'));
        WP_CLI::log('Timestamp: ' . $results['timestamp']);
        WP_CLI::log('');

        foreach ($results['tests'] as $group_name => $group) {
            $status_icon = $group['passed_count'] === $group['total_count'] ? '✓' : '✗';
            WP_CLI::log("[$status_icon] " . strtoupper(str_replace('_', ' ', $group_name)) .
                       " ({$group['passed_count']}/{$group['total_count']})");

            foreach ($group['tests'] as $test_name => $test_data) {
                $icon = ($test_data['passed'] ?? false) ? '  ✓' : '  ✗';
                $value = isset($test_data['value']) ? " [{$test_data['value']}]" : '';
                WP_CLI::log("{$icon} {$test_data['description']}{$value}");
            }
            WP_CLI::log('');
        }

        WP_CLI::log('=== SUMMARY ===');
        WP_CLI::log('Total: ' . $results['summary']['total_tests']);
        WP_CLI::log('Passed: ' . $results['summary']['passed']);
        WP_CLI::log('Failed: ' . $results['summary']['failed']);
        WP_CLI::log('Pass Rate: ' . $results['summary']['pass_rate'] . '%');

        if ($results['summary']['overall_status'] === 'PASS') {
            WP_CLI::success('All tests passed!');
        } else {
            WP_CLI::warning('Some tests failed');
        }
    }, [
        'shortdesc' => 'Run Profile Scoring (Cialdini model) tests',
        'synopsis' => [
            [
                'type' => 'assoc',
                'name' => 'profile_id',
                'description' => 'Profile ID to test against',
                'optional' => true,
            ],
        ],
    ]);
}
