<?php
/**
 * Onboarding Migration - Progress Recalculation
 *
 * Provides tools to:
 * 1. Recalculate onboarding progress for all users
 * 2. Migrate legacy data structures
 * 3. Sync progress with GHL via WP Fusion
 *
 * @package GMKB
 * @since 2.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Onboarding_Migration {

    /**
     * Run the full migration
     *
     * @param bool $dry_run If true, only report what would be done
     * @return array Migration results
     */
    public static function run(bool $dry_run = false): array {
        $start_time = microtime(true);
        $results = [
            'users_processed' => 0,
            'users_updated' => 0,
            'users_skipped' => 0,
            'errors' => [],
            'dry_run' => $dry_run,
        ];

        // Ensure dependencies are loaded
        if (!class_exists('GMKB_Onboarding_Repository') || !class_exists('GMKB_Onboarding_Schema')) {
            $results['errors'][] = 'Required classes not loaded. Ensure plugin is fully initialized.';
            return $results;
        }

        $repo = new GMKB_Onboarding_Repository();

        // Get all users with profiles (more efficient than all users)
        $user_ids = self::get_users_with_profiles();

        if (empty($user_ids)) {
            $results['errors'][] = 'No users with profiles found.';
            return $results;
        }

        foreach ($user_ids as $user_id) {
            $results['users_processed']++;

            try {
                // Calculate progress
                $progress = $repo->calculate_progress($user_id);
                $percentage = $progress['points']['percentage'];

                // Get current stored value
                $current = get_user_meta($user_id, 'guestify_onboarding_progress_percent', true);

                if ($dry_run) {
                    if ($current != $percentage) {
                        $results['users_updated']++;
                        if (defined('WP_DEBUG') && WP_DEBUG) {
                            error_log(sprintf(
                                '[Onboarding Migration] DRY RUN: User %d would update from %s to %d',
                                $user_id,
                                $current ?: 'null',
                                $percentage
                            ));
                        }
                    } else {
                        $results['users_skipped']++;
                    }
                } else {
                    // Update the progress meta
                    $repo->update_progress_meta($user_id, $percentage);
                    $results['users_updated']++;

                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log(sprintf(
                            '[Onboarding Migration] User %d updated: %s → %d',
                            $user_id,
                            $current ?: 'null',
                            $percentage
                        ));
                    }
                }
            } catch (Exception $e) {
                $results['errors'][] = sprintf(
                    'User %d: %s',
                    $user_id,
                    $e->getMessage()
                );
            }
        }

        $results['execution_time'] = round(microtime(true) - $start_time, 2);

        return $results;
    }

    /**
     * Get all user IDs that have at least one profile
     *
     * @return array User IDs
     */
    private static function get_users_with_profiles(): array {
        global $wpdb;

        $user_ids = $wpdb->get_col(
            "SELECT DISTINCT post_author
             FROM {$wpdb->posts}
             WHERE post_type = 'guest_profile'
             AND post_status IN ('publish', 'draft', 'private')
             AND post_author > 0"
        );

        return array_map('intval', $user_ids);
    }

    /**
     * Recalculate progress for a single user
     *
     * @param int $user_id WordPress user ID
     * @return array|false Progress data or false on error
     */
    public static function recalculate_user(int $user_id) {
        if (!class_exists('GMKB_Onboarding_Repository')) {
            return false;
        }

        $repo = new GMKB_Onboarding_Repository();
        $progress = $repo->calculate_progress($user_id);
        $repo->update_progress_meta($user_id, $progress['points']['percentage']);

        return $progress;
    }

    /**
     * Get migration statistics
     *
     * @return array Statistics about current state
     */
    public static function get_stats(): array {
        global $wpdb;

        // Users with profiles
        $users_with_profiles = count(self::get_users_with_profiles());

        // Users with progress meta
        $users_with_progress = $wpdb->get_var(
            "SELECT COUNT(DISTINCT user_id)
             FROM {$wpdb->usermeta}
             WHERE meta_key = 'guestify_onboarding_progress_percent'"
        );

        // Progress distribution
        $distribution = $wpdb->get_results(
            "SELECT
                CASE
                    WHEN CAST(meta_value AS UNSIGNED) = 0 THEN '0%'
                    WHEN CAST(meta_value AS UNSIGNED) BETWEEN 1 AND 25 THEN '1-25%'
                    WHEN CAST(meta_value AS UNSIGNED) BETWEEN 26 AND 50 THEN '26-50%'
                    WHEN CAST(meta_value AS UNSIGNED) BETWEEN 51 AND 75 THEN '51-75%'
                    WHEN CAST(meta_value AS UNSIGNED) BETWEEN 76 AND 99 THEN '76-99%'
                    WHEN CAST(meta_value AS UNSIGNED) = 100 THEN '100%'
                END as bracket,
                COUNT(*) as count
             FROM {$wpdb->usermeta}
             WHERE meta_key = 'guestify_onboarding_progress_percent'
             GROUP BY bracket
             ORDER BY MIN(CAST(meta_value AS UNSIGNED))",
            ARRAY_A
        );

        // Average progress
        $avg_progress = $wpdb->get_var(
            "SELECT AVG(CAST(meta_value AS UNSIGNED))
             FROM {$wpdb->usermeta}
             WHERE meta_key = 'guestify_onboarding_progress_percent'"
        );

        return [
            'users_with_profiles' => (int) $users_with_profiles,
            'users_with_progress' => (int) $users_with_progress,
            'users_missing_progress' => max(0, $users_with_profiles - $users_with_progress),
            'average_progress' => round((float) $avg_progress, 1),
            'distribution' => $distribution,
        ];
    }

    /**
     * Register WP-CLI commands if available
     */
    public static function register_cli_commands(): void {
        if (!defined('WP_CLI') || !WP_CLI) {
            return;
        }

        WP_CLI::add_command('gmkb onboarding migrate', function($args, $assoc_args) {
            $dry_run = isset($assoc_args['dry-run']);

            WP_CLI::log('Starting onboarding progress migration...');

            $results = self::run($dry_run);

            if ($dry_run) {
                WP_CLI::log('DRY RUN - No changes made');
            }

            WP_CLI::log(sprintf('Users processed: %d', $results['users_processed']));
            WP_CLI::log(sprintf('Users updated: %d', $results['users_updated']));
            WP_CLI::log(sprintf('Users skipped: %d', $results['users_skipped']));
            WP_CLI::log(sprintf('Execution time: %ss', $results['execution_time']));

            if (!empty($results['errors'])) {
                WP_CLI::warning('Errors encountered:');
                foreach ($results['errors'] as $error) {
                    WP_CLI::log('  - ' . $error);
                }
            }

            WP_CLI::success('Migration complete!');
        }, [
            'shortdesc' => 'Recalculate onboarding progress for all users',
            'synopsis' => [
                [
                    'type' => 'flag',
                    'name' => 'dry-run',
                    'description' => 'Preview changes without applying them',
                    'optional' => true,
                ],
            ],
        ]);

        WP_CLI::add_command('gmkb onboarding stats', function($args, $assoc_args) {
            $stats = self::get_stats();

            WP_CLI::log('Onboarding Progress Statistics:');
            WP_CLI::log(sprintf('  Users with profiles: %d', $stats['users_with_profiles']));
            WP_CLI::log(sprintf('  Users with progress: %d', $stats['users_with_progress']));
            WP_CLI::log(sprintf('  Users missing progress: %d', $stats['users_missing_progress']));
            WP_CLI::log(sprintf('  Average progress: %s%%', $stats['average_progress']));

            if (!empty($stats['distribution'])) {
                WP_CLI::log('  Distribution:');
                foreach ($stats['distribution'] as $row) {
                    WP_CLI::log(sprintf('    %s: %d users', $row['bracket'], $row['count']));
                }
            }
        }, [
            'shortdesc' => 'Show onboarding progress statistics',
        ]);

        WP_CLI::add_command('gmkb onboarding recalculate', function($args, $assoc_args) {
            if (empty($args[0])) {
                WP_CLI::error('Please provide a user ID');
                return;
            }

            $user_id = (int) $args[0];
            $user = get_user_by('id', $user_id);

            if (!$user) {
                WP_CLI::error("User {$user_id} not found");
                return;
            }

            $progress = self::recalculate_user($user_id);

            if ($progress === false) {
                WP_CLI::error('Failed to recalculate progress');
                return;
            }

            WP_CLI::success(sprintf(
                'User %d (%s) progress recalculated: %d%%',
                $user_id,
                $user->user_email,
                $progress['points']['percentage']
            ));

            WP_CLI::log('Task completion:');
            foreach ($progress['tasks'] as $task_id => $task) {
                $status = $task['complete'] ? '✓' : '✗';
                WP_CLI::log(sprintf('  %s %s (%d/%d pts)', $status, $task_id, $task['points'], $task['max_points']));
            }
        }, [
            'shortdesc' => 'Recalculate progress for a specific user',
            'synopsis' => [
                [
                    'type' => 'positional',
                    'name' => 'user_id',
                    'description' => 'The WordPress user ID',
                    'optional' => false,
                ],
            ],
        ]);
    }

    /**
     * Register admin AJAX handlers
     */
    public static function register_ajax_handlers(): void {
        add_action('wp_ajax_gmkb_run_onboarding_migration', [__CLASS__, 'ajax_run_migration']);
        add_action('wp_ajax_gmkb_get_onboarding_stats', [__CLASS__, 'ajax_get_stats']);
    }

    /**
     * AJAX handler: Run migration
     */
    public static function ajax_run_migration(): void {
        check_ajax_referer('gmkb_admin', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Unauthorized'], 403);
        }

        $dry_run = isset($_POST['dry_run']) && $_POST['dry_run'] === 'true';
        $results = self::run($dry_run);

        wp_send_json_success($results);
    }

    /**
     * AJAX handler: Get stats
     */
    public static function ajax_get_stats(): void {
        check_ajax_referer('gmkb_admin', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Unauthorized'], 403);
        }

        $stats = self::get_stats();
        wp_send_json_success($stats);
    }
}

// Register CLI commands on init
add_action('cli_init', ['GMKB_Onboarding_Migration', 'register_cli_commands']);

// Register AJAX handlers
add_action('admin_init', ['GMKB_Onboarding_Migration', 'register_ajax_handlers']);
