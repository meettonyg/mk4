<?php
/**
 * Onboarding Sync - GoHighLevel Integration via WP Fusion
 *
 * Handles synchronization of onboarding progress data to GoHighLevel CRM.
 * Triggers tag applications and custom field updates based on task completion.
 *
 * @package GMKB
 * @since 2.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Onboarding_Sync {

    /**
     * Tag mappings for milestones
     * Maps percentage thresholds to GHL tag names
     */
    const MILESTONE_TAGS = [
        25 => 'onboarding: 25% complete',
        50 => 'onboarding: 50% complete',
        75 => 'onboarding: 75% complete',
        100 => 'onboarding: 100% complete',
    ];

    /**
     * Tag mappings for task completion
     * Maps task IDs to GHL tag names
     */
    const TASK_TAGS = [
        'profile' => 'task: profile created',
        'quickstart_call' => 'task: quickstart completed',
        'survey' => 'task: survey completed',
        'search' => 'task: first search',
        'import' => 'task: first import',
        'authority_hook' => 'task: authority hook',
        'impact_intro' => 'task: impact intro',
        'topics' => 'task: topics complete',
        'first_pitch' => 'task: first pitch',
        'three_pitches' => 'task: three pitches',
    ];

    /**
     * Custom fields to sync
     */
    const CUSTOM_FIELDS = [
        'guestify_onboarding_progress_percent',
        'guestify_onboarding_points',
        'guestify_total_pitches_sent',
        'guestify_total_searches',
    ];

    /**
     * Initialize sync hooks
     */
    public static function init(): void {
        // Hook into task completion events
        add_action('gmkb_onboarding_task_completed', [__CLASS__, 'on_task_completed'], 10, 3);

        // Hook into progress updates
        add_action('gmkb_onboarding_progress_updated', [__CLASS__, 'on_progress_updated'], 10, 2);

        // Hook into milestone achievements
        add_action('gmkb_onboarding_milestone_reached', [__CLASS__, 'on_milestone_reached'], 10, 2);

        // Hook into reward unlocks
        add_action('gmkb_onboarding_reward_unlocked', [__CLASS__, 'on_reward_unlocked'], 10, 3);

        // Register custom fields with WP Fusion
        add_filter('wpf_meta_fields', [__CLASS__, 'register_wpf_fields']);
        add_filter('wpf_meta_field_groups', [__CLASS__, 'register_wpf_field_groups']);
    }

    /**
     * Check if WP Fusion is available
     */
    public static function is_wpf_available(): bool {
        return function_exists('wp_fusion');
    }

    /**
     * Handle task completion
     *
     * @param int $user_id WordPress user ID
     * @param string $task_id Task identifier
     * @param array $task_data Task data
     */
    public static function on_task_completed(int $user_id, string $task_id, array $task_data): void {
        if (!self::is_wpf_available()) {
            return;
        }

        // Apply task-specific tag if defined
        if (isset(self::TASK_TAGS[$task_id])) {
            $tag_name = self::TASK_TAGS[$task_id];
            self::apply_tag($user_id, $tag_name);

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log(sprintf(
                    '[Onboarding Sync] User %d completed task "%s" - applied tag "%s"',
                    $user_id,
                    $task_id,
                    $tag_name
                ));
            }
        }

        // Trigger custom action for extensibility
        do_action('gmkb_onboarding_sync_task_completed', $user_id, $task_id, $task_data);
    }

    /**
     * Handle progress update
     *
     * @param int $user_id WordPress user ID
     * @param array $progress Progress data
     */
    public static function on_progress_updated(int $user_id, array $progress): void {
        if (!self::is_wpf_available()) {
            return;
        }

        $percentage = $progress['points']['percentage'] ?? 0;
        $points = $progress['points']['earned'] ?? 0;

        // Push custom fields to GHL
        self::push_user_meta($user_id, [
            'guestify_onboarding_progress_percent' => $percentage,
            'guestify_onboarding_points' => $points,
        ]);

        // Check for milestone achievements
        foreach (self::MILESTONE_TAGS as $threshold => $tag) {
            $previous_percentage = (int) get_user_meta($user_id, '_gmkb_last_synced_percentage', true);

            if ($percentage >= $threshold && $previous_percentage < $threshold) {
                do_action('gmkb_onboarding_milestone_reached', $user_id, $threshold);
            }
        }

        // Update last synced percentage
        update_user_meta($user_id, '_gmkb_last_synced_percentage', $percentage);
    }

    /**
     * Handle milestone achievement
     *
     * @param int $user_id WordPress user ID
     * @param int $milestone Milestone percentage
     */
    public static function on_milestone_reached(int $user_id, int $milestone): void {
        if (!self::is_wpf_available()) {
            return;
        }

        if (isset(self::MILESTONE_TAGS[$milestone])) {
            $tag_name = self::MILESTONE_TAGS[$milestone];
            self::apply_tag($user_id, $tag_name);

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log(sprintf(
                    '[Onboarding Sync] User %d reached %d%% milestone - applied tag "%s"',
                    $user_id,
                    $milestone,
                    $tag_name
                ));
            }
        }

        // Trigger custom action for extensibility
        do_action('gmkb_onboarding_sync_milestone_reached', $user_id, $milestone);
    }

    /**
     * Handle reward unlock
     *
     * @param int $user_id WordPress user ID
     * @param string $reward_id Reward identifier
     * @param array $reward_data Reward data
     */
    public static function on_reward_unlocked(int $user_id, string $reward_id, array $reward_data): void {
        if (!self::is_wpf_available()) {
            return;
        }

        // Apply reward-specific tag
        $tag_name = 'reward: ' . sanitize_title($reward_data['title'] ?? $reward_id);
        self::apply_tag($user_id, $tag_name);

        // Trigger custom action for extensibility
        do_action('gmkb_onboarding_sync_reward_unlocked', $user_id, $reward_id, $reward_data);
    }

    /**
     * Apply a tag to a user via WP Fusion
     *
     * @param int $user_id WordPress user ID
     * @param string $tag_name Tag name to apply
     * @return bool Success
     */
    public static function apply_tag(int $user_id, string $tag_name): bool {
        if (!self::is_wpf_available()) {
            return false;
        }

        try {
            // Get or create the tag ID
            $tag_id = wp_fusion()->user->get_tag_id($tag_name);

            if (!$tag_id) {
                // Tag doesn't exist, try to create it or use the name directly
                $tag_id = $tag_name;
            }

            // Apply the tag
            wp_fusion()->user->apply_tags([$tag_id], $user_id);

            return true;
        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log(sprintf(
                    '[Onboarding Sync] Failed to apply tag "%s" to user %d: %s',
                    $tag_name,
                    $user_id,
                    $e->getMessage()
                ));
            }
            return false;
        }
    }

    /**
     * Remove a tag from a user via WP Fusion
     *
     * @param int $user_id WordPress user ID
     * @param string $tag_name Tag name to remove
     * @return bool Success
     */
    public static function remove_tag(int $user_id, string $tag_name): bool {
        if (!self::is_wpf_available()) {
            return false;
        }

        try {
            $tag_id = wp_fusion()->user->get_tag_id($tag_name);

            if ($tag_id) {
                wp_fusion()->user->remove_tags([$tag_id], $user_id);
            }

            return true;
        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log(sprintf(
                    '[Onboarding Sync] Failed to remove tag "%s" from user %d: %s',
                    $tag_name,
                    $user_id,
                    $e->getMessage()
                ));
            }
            return false;
        }
    }

    /**
     * Push user meta to GHL via WP Fusion
     *
     * @param int $user_id WordPress user ID
     * @param array $meta_data Key-value pairs of meta to push
     * @return bool Success
     */
    public static function push_user_meta(int $user_id, array $meta_data): bool {
        if (!self::is_wpf_available()) {
            return false;
        }

        try {
            wp_fusion()->user->push_user_meta($user_id, $meta_data);
            return true;
        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log(sprintf(
                    '[Onboarding Sync] Failed to push meta for user %d: %s',
                    $user_id,
                    $e->getMessage()
                ));
            }
            return false;
        }
    }

    /**
     * Sync all onboarding data for a user
     *
     * @param int $user_id WordPress user ID
     * @return bool Success
     */
    public static function sync_user(int $user_id): bool {
        if (!self::is_wpf_available()) {
            return false;
        }

        if (!class_exists('GMKB_Onboarding_Repository')) {
            return false;
        }

        $repo = new GMKB_Onboarding_Repository();
        $progress = $repo->calculate_progress($user_id);

        // Push all custom fields
        $meta_data = [
            'guestify_onboarding_progress_percent' => $progress['points']['percentage'],
            'guestify_onboarding_points' => $progress['points']['earned'],
        ];

        // Add activity counts
        $meta_data['guestify_total_pitches_sent'] = (int) get_user_meta($user_id, 'guestify_total_pitches_sent', true);
        $meta_data['guestify_total_searches'] = (int) get_user_meta($user_id, 'guestify_total_searches', true);

        self::push_user_meta($user_id, $meta_data);

        // Apply appropriate milestone tags
        foreach (self::MILESTONE_TAGS as $threshold => $tag_name) {
            if ($progress['points']['percentage'] >= $threshold) {
                self::apply_tag($user_id, $tag_name);
            }
        }

        // Apply task completion tags
        foreach ($progress['tasks'] as $task_id => $task) {
            if ($task['complete'] && isset(self::TASK_TAGS[$task_id])) {
                self::apply_tag($user_id, self::TASK_TAGS[$task_id]);
            }
        }

        return true;
    }

    /**
     * Register custom fields with WP Fusion
     *
     * @param array $fields Existing fields
     * @return array Modified fields
     */
    public static function register_wpf_fields(array $fields): array {
        $fields['guestify_onboarding_progress_percent'] = [
            'type' => 'int',
            'label' => 'Onboarding Progress %',
            'group' => 'guestify_onboarding',
        ];

        $fields['guestify_onboarding_points'] = [
            'type' => 'int',
            'label' => 'Onboarding Points',
            'group' => 'guestify_onboarding',
        ];

        $fields['guestify_total_pitches_sent'] = [
            'type' => 'int',
            'label' => 'Total Pitches Sent',
            'group' => 'guestify_onboarding',
        ];

        $fields['guestify_total_searches'] = [
            'type' => 'int',
            'label' => 'Total Searches',
            'group' => 'guestify_onboarding',
        ];

        return $fields;
    }

    /**
     * Register field groups with WP Fusion
     *
     * @param array $groups Existing groups
     * @return array Modified groups
     */
    public static function register_wpf_field_groups(array $groups): array {
        $groups['guestify_onboarding'] = [
            'title' => 'Guestify Onboarding',
            'fields' => [],
        ];

        return $groups;
    }

    /**
     * Bulk sync all users (for migration)
     *
     * @param int $batch_size Number of users to process per batch
     * @return array Results
     */
    public static function bulk_sync(int $batch_size = 50): array {
        global $wpdb;

        $results = [
            'processed' => 0,
            'synced' => 0,
            'errors' => [],
        ];

        if (!self::is_wpf_available()) {
            $results['errors'][] = 'WP Fusion is not available';
            return $results;
        }

        // Get users with profiles
        $user_ids = $wpdb->get_col(
            "SELECT DISTINCT post_author
             FROM {$wpdb->posts}
             WHERE post_type = 'guest_profile'
             AND post_status IN ('publish', 'draft', 'private')
             AND post_author > 0
             LIMIT {$batch_size}"
        );

        foreach ($user_ids as $user_id) {
            $results['processed']++;

            try {
                if (self::sync_user((int) $user_id)) {
                    $results['synced']++;
                }
            } catch (Exception $e) {
                $results['errors'][] = sprintf('User %d: %s', $user_id, $e->getMessage());
            }
        }

        return $results;
    }
}

// Initialize sync hooks
add_action('init', ['GMKB_Onboarding_Sync', 'init']);
