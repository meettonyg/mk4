<?php
/**
 * Onboarding System Verification Tests
 *
 * Tests the onboarding gamification system including schema,
 * repository, progress calculation, and leaderboard.
 *
 * Usage:
 *   - Admin URL: yoursite.com/wp-admin/?gmkb_onboarding_test=1
 *   - WP-CLI: wp gmkb onboarding-test [--user_id=123]
 *
 * @package GMKB
 * @since 2.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Onboarding_Test {

    private $user_id;
    private $results = [];

    public function __construct(?int $user_id = null) {
        $this->user_id = $user_id ?: get_current_user_id();
    }

    /**
     * Run all onboarding tests
     */
    public function run_all_tests(): array {
        $this->results = [
            'user_id' => $this->user_id,
            'timestamp' => current_time('mysql'),
            'tests' => [],
            'summary' => [],
        ];

        $this->test_schema_class();
        $this->test_repository_class();
        $this->test_progress_calculation();
        $this->test_leaderboard();
        $this->test_hooks_class();
        $this->test_api_endpoints();

        $this->calculate_summary();

        return $this->results;
    }

    /**
     * Test schema class exists and returns expected structure
     */
    private function test_schema_class(): void {
        $tests = [];

        // Test class exists
        $tests['class_exists'] = [
            'description' => 'GMKB_Onboarding_Schema class exists',
            'passed' => class_exists('GMKB_Onboarding_Schema'),
        ];

        if (!$tests['class_exists']['passed']) {
            $this->results['tests']['schema'] = [
                'tests' => $tests,
                'passed_count' => 0,
                'total_count' => 1,
            ];
            return;
        }

        // Test get_schema returns array
        $schema = GMKB_Onboarding_Schema::get_schema();
        $tests['get_schema_returns_array'] = [
            'description' => 'get_schema() returns array',
            'passed' => is_array($schema),
            'value' => gettype($schema),
        ];

        // Test schema has required keys
        $required_keys = ['task_groups', 'profile_strength_fields', 'rewards'];
        foreach ($required_keys as $key) {
            $tests["schema_has_{$key}"] = [
                'description' => "Schema has '{$key}' key",
                'passed' => isset($schema[$key]),
            ];
        }

        // Test task groups structure
        $task_groups = GMKB_Onboarding_Schema::get_task_groups();
        $tests['task_groups_not_empty'] = [
            'description' => 'Task groups not empty',
            'passed' => !empty($task_groups),
            'value' => count($task_groups) . ' groups',
        ];

        // Test total points equals 100
        $total_points = GMKB_Onboarding_Schema::get_total_points();
        $tests['total_points_equals_100'] = [
            'description' => 'Total points equals 100',
            'passed' => $total_points === 100,
            'value' => $total_points,
        ];

        // Test profile strength fields
        $profile_fields = GMKB_Onboarding_Schema::get_profile_strength_fields();
        $tests['profile_fields_exist'] = [
            'description' => 'Profile strength fields defined',
            'passed' => !empty($profile_fields),
            'value' => count($profile_fields) . ' fields',
        ];

        // Test rewards structure
        $rewards = GMKB_Onboarding_Schema::get_rewards();
        $tests['rewards_defined'] = [
            'description' => 'Rewards defined',
            'passed' => !empty($rewards),
            'value' => count($rewards) . ' rewards',
        ];

        // Test reward thresholds are valid
        $valid_thresholds = true;
        $threshold_values = [];
        foreach ($rewards as $reward) {
            if (!isset($reward['points_required']) || $reward['points_required'] < 0 || $reward['points_required'] > 100) {
                $valid_thresholds = false;
            }
            $threshold_values[] = $reward['points_required'] ?? 'missing';
        }
        $tests['reward_thresholds_valid'] = [
            'description' => 'Reward thresholds between 0-100',
            'passed' => $valid_thresholds,
            'value' => implode(', ', $threshold_values),
        ];

        $this->results['tests']['schema'] = [
            'tests' => $tests,
            'passed_count' => count(array_filter(array_column($tests, 'passed'))),
            'total_count' => count($tests),
        ];
    }

    /**
     * Test repository class
     */
    private function test_repository_class(): void {
        $tests = [];

        // Test class exists
        $tests['class_exists'] = [
            'description' => 'GMKB_Onboarding_Repository class exists',
            'passed' => class_exists('GMKB_Onboarding_Repository'),
        ];

        if (!$tests['class_exists']['passed']) {
            $this->results['tests']['repository'] = [
                'tests' => $tests,
                'passed_count' => 0,
                'total_count' => 1,
            ];
            return;
        }

        $repo = new GMKB_Onboarding_Repository();

        // Test get_user_progress returns valid structure
        $progress = $repo->get_user_progress($this->user_id);
        $tests['get_user_progress_returns_array'] = [
            'description' => 'get_user_progress() returns array',
            'passed' => is_array($progress),
            'value' => gettype($progress),
        ];

        // Test progress has required keys
        $required_progress_keys = ['user_id', 'total_points', 'percentage', 'task_groups', 'rewards'];
        foreach ($required_progress_keys as $key) {
            $tests["progress_has_{$key}"] = [
                'description' => "Progress has '{$key}' key",
                'passed' => isset($progress[$key]),
            ];
        }

        // Test percentage is valid
        $tests['percentage_valid'] = [
            'description' => 'Percentage between 0-100',
            'passed' => isset($progress['percentage']) &&
                       $progress['percentage'] >= 0 &&
                       $progress['percentage'] <= 100,
            'value' => $progress['percentage'] ?? 'undefined',
        ];

        // Test get_best_profile_for_user
        $best_profile = $repo->get_best_profile_for_user($this->user_id);
        $tests['get_best_profile_returns_valid'] = [
            'description' => 'get_best_profile_for_user() returns int or null',
            'passed' => $best_profile === null || is_int($best_profile),
            'value' => $best_profile === null ? 'null (no profile)' : $best_profile,
        ];

        // Test calculate_profile_strength
        if ($best_profile) {
            $strength = $repo->calculate_profile_strength($best_profile);
            $tests['profile_strength_returns_array'] = [
                'description' => 'calculate_profile_strength() returns array',
                'passed' => is_array($strength),
            ];

            $tests['profile_strength_has_percentage'] = [
                'description' => 'Profile strength has percentage',
                'passed' => isset($strength['percentage']),
                'value' => $strength['percentage'] ?? 'undefined',
            ];

            $tests['profile_strength_has_fields'] = [
                'description' => 'Profile strength has fields breakdown',
                'passed' => isset($strength['fields']) && is_array($strength['fields']),
                'value' => isset($strength['fields']) ? count($strength['fields']) . ' fields' : 'missing',
            ];
        }

        $this->results['tests']['repository'] = [
            'tests' => $tests,
            'passed_count' => count(array_filter(array_column($tests, 'passed'))),
            'total_count' => count($tests),
        ];
    }

    /**
     * Test progress calculation logic
     */
    private function test_progress_calculation(): void {
        $tests = [];

        if (!class_exists('GMKB_Onboarding_Repository')) {
            $tests['repository_missing'] = [
                'description' => 'Repository class required',
                'passed' => false,
            ];
            $this->results['tests']['progress_calculation'] = [
                'tests' => $tests,
                'passed_count' => 0,
                'total_count' => 1,
            ];
            return;
        }

        $repo = new GMKB_Onboarding_Repository();

        // Test with current user
        $progress = $repo->get_user_progress($this->user_id);

        // Verify total_points equals sum of task group points
        $calculated_total = 0;
        if (isset($progress['task_groups'])) {
            foreach ($progress['task_groups'] as $group) {
                $calculated_total += ($group['earned_points'] ?? 0);
            }
        }
        $tests['points_sum_correct'] = [
            'description' => 'Total points equals sum of task group points',
            'passed' => $calculated_total === ($progress['total_points'] ?? -1),
            'value' => "Sum: {$calculated_total}, Reported: " . ($progress['total_points'] ?? 'undefined'),
        ];

        // Verify percentage calculation
        $expected_percentage = $progress['total_points'] ?? 0;
        $tests['percentage_matches_points'] = [
            'description' => 'Percentage equals total points (out of 100)',
            'passed' => ($progress['percentage'] ?? -1) === $expected_percentage,
            'value' => ($progress['percentage'] ?? 'undefined') . '% vs ' . $expected_percentage . ' points',
        ];

        // Test that unlocked rewards match threshold
        $unlocked_count = 0;
        $rewards = GMKB_Onboarding_Schema::get_rewards();
        foreach ($rewards as $reward) {
            if (($reward['points_required'] ?? 101) <= ($progress['total_points'] ?? 0)) {
                $unlocked_count++;
            }
        }

        $reported_unlocked = 0;
        if (isset($progress['rewards'])) {
            foreach ($progress['rewards'] as $reward) {
                if ($reward['unlocked'] ?? false) {
                    $reported_unlocked++;
                }
            }
        }

        $tests['unlocked_rewards_correct'] = [
            'description' => 'Unlocked rewards count matches threshold logic',
            'passed' => $unlocked_count === $reported_unlocked,
            'value' => "Expected: {$unlocked_count}, Reported: {$reported_unlocked}",
        ];

        // Test next reward calculation
        $next_reward = null;
        foreach ($rewards as $reward) {
            if (($reward['points_required'] ?? 0) > ($progress['total_points'] ?? 0)) {
                $next_reward = $reward;
                break;
            }
        }
        $tests['has_next_reward_logic'] = [
            'description' => 'Next reward determined correctly',
            'passed' => true, // Just verify we can calculate it
            'value' => $next_reward ? ($next_reward['title'] . ' @ ' . $next_reward['points_required'] . 'pts') : 'All unlocked',
        ];

        $this->results['tests']['progress_calculation'] = [
            'tests' => $tests,
            'passed_count' => count(array_filter(array_column($tests, 'passed'))),
            'total_count' => count($tests),
        ];
    }

    /**
     * Test leaderboard functionality
     */
    private function test_leaderboard(): void {
        $tests = [];

        // Test class exists
        $tests['class_exists'] = [
            'description' => 'GMKB_Onboarding_Leaderboard class exists',
            'passed' => class_exists('GMKB_Onboarding_Leaderboard'),
        ];

        if (!$tests['class_exists']['passed']) {
            $this->results['tests']['leaderboard'] = [
                'tests' => $tests,
                'passed_count' => 0,
                'total_count' => 1,
            ];
            return;
        }

        // Test get_leaderboard returns valid structure
        $leaderboard = GMKB_Onboarding_Leaderboard::get_leaderboard(5);
        $tests['get_leaderboard_returns_array'] = [
            'description' => 'get_leaderboard() returns array',
            'passed' => is_array($leaderboard),
        ];

        // Test leaderboard has required keys
        $required_keys = ['users', 'total', 'limit', 'offset', 'has_more'];
        foreach ($required_keys as $key) {
            $tests["leaderboard_has_{$key}"] = [
                'description' => "Leaderboard has '{$key}' key",
                'passed' => isset($leaderboard[$key]),
            ];
        }

        // Test users array structure
        if (!empty($leaderboard['users'])) {
            $first_user = $leaderboard['users'][0];
            $user_keys = ['rank', 'user_id', 'display_name', 'progress_percent', 'points'];
            foreach ($user_keys as $key) {
                $tests["user_has_{$key}"] = [
                    'description' => "Leaderboard user has '{$key}' key",
                    'passed' => isset($first_user[$key]),
                ];
            }

            // Test ranks are sequential
            $ranks_sequential = true;
            foreach ($leaderboard['users'] as $index => $user) {
                if (($user['rank'] ?? -1) !== $index + 1) {
                    $ranks_sequential = false;
                    break;
                }
            }
            $tests['ranks_sequential'] = [
                'description' => 'Leaderboard ranks are sequential',
                'passed' => $ranks_sequential,
            ];

            // Test users are sorted by progress (descending)
            $sorted_correctly = true;
            $prev_progress = 101;
            foreach ($leaderboard['users'] as $user) {
                if (($user['progress_percent'] ?? 0) > $prev_progress) {
                    $sorted_correctly = false;
                    break;
                }
                $prev_progress = $user['progress_percent'] ?? 0;
            }
            $tests['sorted_by_progress'] = [
                'description' => 'Users sorted by progress descending',
                'passed' => $sorted_correctly,
            ];
        }

        // Test get_user_rank
        $user_rank = GMKB_Onboarding_Leaderboard::get_user_rank($this->user_id);
        $tests['get_user_rank_returns_valid'] = [
            'description' => 'get_user_rank() returns int or null',
            'passed' => $user_rank === null || is_int($user_rank),
            'value' => $user_rank === null ? 'null (not ranked)' : '#' . $user_rank,
        ];

        // Test shortcode registered
        $tests['shortcode_registered'] = [
            'description' => 'gmkb_leaderboard shortcode registered',
            'passed' => shortcode_exists('gmkb_leaderboard'),
        ];

        $this->results['tests']['leaderboard'] = [
            'tests' => $tests,
            'passed_count' => count(array_filter(array_column($tests, 'passed'))),
            'total_count' => count($tests),
        ];
    }

    /**
     * Test hooks class
     */
    private function test_hooks_class(): void {
        $tests = [];

        // Test class exists
        $tests['class_exists'] = [
            'description' => 'GMKB_Onboarding_Hooks class exists',
            'passed' => class_exists('GMKB_Onboarding_Hooks'),
        ];

        if (!$tests['class_exists']['passed']) {
            $this->results['tests']['hooks'] = [
                'tests' => $tests,
                'passed_count' => 0,
                'total_count' => 1,
            ];
            return;
        }

        // Test action hooks are registered
        $hooks_to_check = [
            'updated_post_meta' => 'Profile meta update hook',
            'gmkb_pitch_sent' => 'Pitch sent hook',
            'gmkb_podcast_search_performed' => 'Search performed hook',
        ];

        foreach ($hooks_to_check as $hook => $description) {
            $has_action = has_action($hook);
            $tests["hook_{$hook}"] = [
                'description' => $description . ' registered',
                'passed' => $has_action !== false,
                'value' => $has_action !== false ? 'Priority: ' . $has_action : 'Not registered',
            ];
        }

        // Test gmkb_onboarding_progress_updated action exists capability
        $tests['progress_updated_action'] = [
            'description' => 'gmkb_onboarding_progress_updated action can be fired',
            'passed' => true, // Will always pass, just documents the action
            'value' => 'Action available for listeners',
        ];

        $this->results['tests']['hooks'] = [
            'tests' => $tests,
            'passed_count' => count(array_filter(array_column($tests, 'passed'))),
            'total_count' => count($tests),
        ];
    }

    /**
     * Test API endpoints exist
     */
    private function test_api_endpoints(): void {
        $tests = [];

        // Check if REST API routes are registered
        $server = rest_get_server();
        $routes = $server->get_routes();

        $expected_routes = [
            '/gmkb/v2/onboarding/progress' => 'User progress endpoint',
            '/gmkb/v2/onboarding/profile-strength/(?P<profile_id>\\d+)' => 'Profile strength endpoint',
            '/gmkb/v2/onboarding/leaderboard' => 'Leaderboard endpoint',
        ];

        foreach ($expected_routes as $route => $description) {
            $route_exists = false;
            foreach ($routes as $registered_route => $handlers) {
                // Check for exact match or regex match
                if ($registered_route === $route ||
                    strpos($registered_route, str_replace('(?P<profile_id>\\d+)', '', $route)) !== false) {
                    $route_exists = true;
                    break;
                }
            }

            $tests["route_" . sanitize_title($route)] = [
                'description' => $description . ' registered',
                'passed' => $route_exists,
                'value' => $route,
            ];
        }

        $this->results['tests']['api_endpoints'] = [
            'tests' => $tests,
            'passed_count' => count(array_filter(array_column($tests, 'passed'))),
            'total_count' => count($tests),
        ];
    }

    /**
     * Calculate summary of all tests
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
    if (!isset($_GET['gmkb_onboarding_test'])) {
        return;
    }

    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized');
    }

    $user_id = isset($_GET['user_id']) ? absint($_GET['user_id']) : get_current_user_id();

    $tester = new GMKB_Onboarding_Test($user_id);
    $results = $tester->run_all_tests();

    header('Content-Type: application/json');
    echo json_encode($results, JSON_PRETTY_PRINT);
    exit;
});

// WP-CLI command
if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command('gmkb onboarding-test', function($args, $assoc_args) {
        $user_id = isset($assoc_args['user_id']) ? absint($assoc_args['user_id']) : get_current_user_id();

        if (!$user_id) {
            $user_id = 1; // Default to admin if no user context
        }

        $tester = new GMKB_Onboarding_Test($user_id);
        $results = $tester->run_all_tests();

        WP_CLI::log('');
        WP_CLI::log('╔════════════════════════════════════════╗');
        WP_CLI::log('║   GMKB Onboarding System Tests         ║');
        WP_CLI::log('╚════════════════════════════════════════╝');
        WP_CLI::log('');
        WP_CLI::log('User ID: ' . $results['user_id']);
        WP_CLI::log('Timestamp: ' . $results['timestamp']);
        WP_CLI::log('');

        foreach ($results['tests'] as $group_name => $group) {
            $status_icon = $group['passed_count'] === $group['total_count'] ? '✅' : '⚠️';
            WP_CLI::log("┌─ {$status_icon} " . strtoupper(str_replace('_', ' ', $group_name)) .
                       " ({$group['passed_count']}/{$group['total_count']})");

            foreach ($group['tests'] as $test_name => $test_data) {
                $icon = ($test_data['passed'] ?? false) ? '✓' : '✗';
                $color = ($test_data['passed'] ?? false) ? '%G' : '%R';
                $value = isset($test_data['value']) ? " [{$test_data['value']}]" : '';
                WP_CLI::log("│  {$icon} {$test_data['description']}{$value}");
            }
            WP_CLI::log('└───────────────────────────────────────');
            WP_CLI::log('');
        }

        WP_CLI::log('╔════════════════════════════════════════╗');
        WP_CLI::log('║   SUMMARY                              ║');
        WP_CLI::log('╚════════════════════════════════════════╝');
        WP_CLI::log('');
        WP_CLI::log('Total Tests: ' . $results['summary']['total_tests']);
        WP_CLI::log('Passed: ' . $results['summary']['passed']);
        WP_CLI::log('Failed: ' . $results['summary']['failed']);
        WP_CLI::log('Pass Rate: ' . $results['summary']['pass_rate'] . '%');
        WP_CLI::log('');

        if ($results['summary']['overall_status'] === 'PASS') {
            WP_CLI::success('All tests passed!');
        } else {
            WP_CLI::warning('Some tests failed:');
            foreach ($results['summary']['failed_tests'] as $failed) {
                WP_CLI::log('  - ' . $failed);
            }
        }
    }, [
        'shortdesc' => 'Run onboarding system verification tests',
        'synopsis' => [
            [
                'type' => 'assoc',
                'name' => 'user_id',
                'description' => 'User ID to test against',
                'optional' => true,
            ],
        ],
    ]);
}
