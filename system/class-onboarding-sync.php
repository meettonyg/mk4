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
     * Pitch count milestones for GHL tags
     * Maps pitch count thresholds to tag names
     */
    const PITCH_MILESTONES = [
        1 => 'pitches: 1 sent',
        3 => 'pitches: 3 sent',
        5 => 'pitches: 5 sent',
        10 => 'pitches: 10 sent',
        25 => 'pitches: 25 sent',
        50 => 'pitches: 50 sent',
        100 => 'pitches: 100 sent',
    ];

    /**
     * Import count milestones for GHL tags
     * Maps import count thresholds to tag names
     */
    const IMPORT_MILESTONES = [
        1 => 'imports: 1 podcast',
        5 => 'imports: 5 podcasts',
        10 => 'imports: 10 podcasts',
        25 => 'imports: 25 podcasts',
        50 => 'imports: 50 podcasts',
    ];

    /**
     * Custom fields to sync
     */
    const CUSTOM_FIELDS = [
        'guestify_onboarding_progress_percent',
        'guestify_onboarding_points',
        'guestify_total_pitches_sent',
        'guestify_total_searches',
        'guestify_total_interview_entries',
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

        // =========================================================
        // THE BRIDGE: Prospector Interview Finder Integration
        // Listen for imports from the Podcast Interview Tracker plugin
        // =========================================================
        add_action('interview_finder_import_completed', [__CLASS__, 'on_interview_finder_import'], 10, 2);

        // =========================================================
        // THE BRIDGE: Outreach Email Integration
        // Listen for messages sent from guestify-email-outreach plugin
        // =========================================================
        add_action('guestify_outreach_message_sent', [__CLASS__, 'on_outreach_message_sent'], 10, 2);

        // =========================================================
        // THE REACTOR: GHL/WP Fusion Sync on Meta Updates
        // Push to GHL when milestone counts are reached
        // =========================================================
        add_action('updated_user_meta', [__CLASS__, 'on_user_meta_updated_for_sync'], 10, 4);

        // Hook into save_post for gmkb_pitch to track pitch counts
        add_action('save_post_gmkb_pitch', [__CLASS__, 'on_pitch_saved'], 10, 3);
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

        $fields['guestify_total_interview_entries'] = [
            'type' => 'int',
            'label' => 'Total Podcasts Imported',
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

    // =========================================================
    // THE BRIDGE: Prospector Interview Finder Integration
    // =========================================================

    /**
     * Handle interview finder import completion
     *
     * CRITICAL: This is the bridge between the Podcast Interview Tracker (PIT)
     * plugin and the GMKB Onboarding System. When an interview opportunity is
     * imported via the Interview Finder, this method:
     *
     * 1. Queries the wp_pit_opportunities table for the user
     * 2. Counts total opportunities imported by that user
     * 3. Updates the guestify_total_interview_entries user meta
     * 4. Triggers onboarding progress recalculation
     *
     * @param int $user_id WordPress user ID who imported the opportunity
     * @param array $import_data Optional data about the import (opportunity_id, etc.)
     */
    public static function on_interview_finder_import(int $user_id, array $import_data = []): void {
        if ($user_id <= 0) {
            return;
        }

        // Count opportunities from the PIT table
        $opportunity_count = self::count_user_opportunities($user_id);

        // Update user meta with total interview entries
        $previous_count = (int) get_user_meta($user_id, 'guestify_total_interview_entries', true);
        update_user_meta($user_id, 'guestify_total_interview_entries', $opportunity_count);

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log(sprintf(
                '[Onboarding Sync BRIDGE] User %d imported opportunity. Count: %d -> %d (import_data: %s)',
                $user_id,
                $previous_count,
                $opportunity_count,
                json_encode($import_data)
            ));
        }

        // Check if this is the first import (trigger task completion)
        if ($previous_count === 0 && $opportunity_count > 0) {
            do_action('gmkb_onboarding_task_completed', $user_id, 'import', [
                'points' => 10,
                'label'  => 'First Podcast Imported',
            ]);
        }

        // Check for import milestones and apply GHL tags
        self::check_and_apply_import_milestones($user_id, $previous_count, $opportunity_count);

        // Trigger progress recalculation
        if (class_exists('GMKB_Onboarding_Repository')) {
            $repo = new GMKB_Onboarding_Repository();
            $progress = $repo->calculate_progress($user_id);
            $repo->update_progress_meta($user_id, $progress['points']['percentage'], $progress);
        }

        // Push to GHL via WP Fusion
        if (self::is_wpf_available()) {
            self::push_user_meta($user_id, [
                'guestify_total_interview_entries' => $opportunity_count,
            ]);
        }

        // Fire extensibility action
        do_action('gmkb_onboarding_sync_import_completed', $user_id, $opportunity_count, $import_data);
    }

    // =========================================================
    // THE BRIDGE: Outreach Email Integration
    // =========================================================

    /**
     * Handle outreach message sent
     *
     * CRITICAL: This is the bridge between the guestify-email-outreach plugin
     * and the GMKB Onboarding System. When a message is sent, this method:
     *
     * 1. Queries the wp_guestify_messages table for the user
     * 2. Counts total sent messages by that user
     * 3. Updates the guestify_total_pitches_sent user meta
     * 4. Triggers onboarding progress recalculation
     * 5. Applies milestone tags via WP Fusion
     *
     * @param int $user_id WordPress user ID who sent the message
     * @param array $message_data Optional data about the message (message_id, etc.)
     */
    public static function on_outreach_message_sent(int $user_id, array $message_data = []): void {
        if ($user_id <= 0) {
            return;
        }

        // Count messages from the Outreach table
        $message_count = self::count_user_messages($user_id);

        // Update user meta with total pitches sent
        $previous_count = (int) get_user_meta($user_id, 'guestify_total_pitches_sent', true);
        update_user_meta($user_id, 'guestify_total_pitches_sent', $message_count);

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log(sprintf(
                '[Onboarding Sync OUTREACH] User %d sent message. Count: %d -> %d (message_data: %s)',
                $user_id,
                $previous_count,
                $message_count,
                json_encode($message_data)
            ));
        }

        // Check for first pitch (task completion)
        if ($previous_count === 0 && $message_count > 0) {
            do_action('gmkb_onboarding_task_completed', $user_id, 'first_pitch', [
                'points' => 10,
                'label'  => 'First Pitch Sent',
            ]);
        }

        // Check for three pitches (task completion)
        if ($previous_count < 3 && $message_count >= 3) {
            do_action('gmkb_onboarding_task_completed', $user_id, 'three_pitches', [
                'points' => 10,
                'label'  => 'Three Pitches Sent',
            ]);
        }

        // Check for pitch milestones and apply GHL tags
        self::check_and_apply_pitch_milestones($user_id, $previous_count, $message_count);

        // Trigger progress recalculation
        if (class_exists('GMKB_Onboarding_Repository')) {
            $repo = new GMKB_Onboarding_Repository();
            $progress = $repo->calculate_progress($user_id);
            $repo->update_progress_meta($user_id, $progress['points']['percentage'], $progress);
        }

        // Push to GHL via WP Fusion
        if (self::is_wpf_available()) {
            self::push_user_meta($user_id, [
                'guestify_total_pitches_sent' => $message_count,
            ]);
        }

        // Fire extensibility action
        do_action('gmkb_onboarding_sync_message_sent', $user_id, $message_count, $message_data);
    }

    /**
     * Count sent messages for a user from the Outreach tables
     *
     * Queries the wp_guestify_messages table to count all sent messages
     * for the given user ID.
     *
     * @param int $user_id WordPress user ID
     * @return int Number of sent messages
     */
    public static function count_user_messages(int $user_id): int {
        global $wpdb;

        $table_name = $wpdb->prefix . 'guestify_messages';

        // Check if table exists
        $table_exists = $wpdb->get_var(
            $wpdb->prepare("SHOW TABLES LIKE %s", $table_name)
        );

        if ($table_exists !== $table_name) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log(sprintf(
                    '[Onboarding Sync OUTREACH] Table %s does not exist',
                    $table_name
                ));
            }
            return 0;
        }

        // Count sent messages for this user
        $count = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$table_name} WHERE user_id = %d AND status = 'sent'",
            $user_id
        ));

        return (int) $count;
    }

    /**
     * Check and apply pitch milestone tags
     *
     * @param int $user_id WordPress user ID
     * @param int $previous_count Previous pitch count
     * @param int $new_count New pitch count
     */
    public static function check_and_apply_pitch_milestones(int $user_id, int $previous_count, int $new_count): void {
        if (!self::is_wpf_available()) {
            return;
        }

        foreach (self::PITCH_MILESTONES as $threshold => $tag_name) {
            // If threshold is between old and new counts, milestone just reached
            if ($new_count >= $threshold && $previous_count < $threshold) {
                self::apply_tag($user_id, $tag_name);

                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log(sprintf(
                        '[Onboarding Sync] User %d reached pitch milestone %d - applied tag "%s"',
                        $user_id,
                        $threshold,
                        $tag_name
                    ));
                }
            }
        }
    }

    /**
     * Check and apply import milestone tags
     *
     * @param int $user_id WordPress user ID
     * @param int $previous_count Previous import count
     * @param int $new_count New import count
     */
    public static function check_and_apply_import_milestones(int $user_id, int $previous_count, int $new_count): void {
        if (!self::is_wpf_available()) {
            return;
        }

        foreach (self::IMPORT_MILESTONES as $threshold => $tag_name) {
            // If threshold is between old and new counts, milestone just reached
            if ($new_count >= $threshold && $previous_count < $threshold) {
                self::apply_tag($user_id, $tag_name);

                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log(sprintf(
                        '[Onboarding Sync] User %d reached import milestone %d - applied tag "%s"',
                        $user_id,
                        $threshold,
                        $tag_name
                    ));
                }
            }
        }
    }

    /**
     * Count opportunities for a user from the PIT tables
     *
     * Queries the wp_pit_opportunities table to count all opportunities
     * associated with the given user ID.
     *
     * @param int $user_id WordPress user ID
     * @return int Number of opportunities
     */
    public static function count_user_opportunities(int $user_id): int {
        global $wpdb;

        $table_name = $wpdb->prefix . 'pit_opportunities';

        // Check if table exists
        $table_exists = $wpdb->get_var(
            $wpdb->prepare("SHOW TABLES LIKE %s", $table_name)
        );

        if ($table_exists !== $table_name) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log(sprintf(
                    '[Onboarding Sync BRIDGE] Table %s does not exist',
                    $table_name
                ));
            }
            return 0;
        }

        // Count opportunities for this user
        $count = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$table_name} WHERE user_id = %d",
            $user_id
        ));

        return (int) $count;
    }

    /**
     * Handle user meta updates for sync purposes
     *
     * Listens for updates to onboarding-related user meta and triggers
     * GHL sync when milestones are reached.
     *
     * @param int $meta_id Meta ID
     * @param int $user_id User ID
     * @param string $meta_key Meta key
     * @param mixed $meta_value New meta value
     */
    public static function on_user_meta_updated_for_sync(int $meta_id, int $user_id, string $meta_key, $meta_value): void {
        // Only process relevant meta keys
        $sync_keys = [
            'guestify_total_pitches_sent',
            'guestify_total_searches',
            'guestify_total_interview_entries',
            'guestify_onboarding_progress_percent',
        ];

        if (!in_array($meta_key, $sync_keys, true)) {
            return;
        }

        // Push to GHL if WP Fusion is available
        if (self::is_wpf_available()) {
            self::push_user_meta($user_id, [
                $meta_key => $meta_value,
            ]);
        }
    }

    /**
     * Handle pitch save to update pitch counts
     *
     * When a gmkb_pitch post is created/updated, this method:
     * 1. Counts total pitches for the user
     * 2. Updates guestify_total_pitches_sent user meta
     * 3. Triggers onboarding progress recalculation
     *
     * @param int $post_id Post ID
     * @param WP_Post $post Post object
     * @param bool $update Whether this is an update
     */
    public static function on_pitch_saved(int $post_id, $post, bool $update): void {
        // Skip auto-drafts and revisions
        if (wp_is_post_autosave($post_id) || wp_is_post_revision($post_id)) {
            return;
        }

        // Skip drafts for counting (only count published/private pitches with 'sent' status)
        $pitch_status = get_post_meta($post_id, 'pitch_status', true);
        if ($pitch_status !== 'sent' && $pitch_status !== 'opened' && $pitch_status !== 'replied' && $pitch_status !== 'booked') {
            return;
        }

        $user_id = (int) $post->post_author;
        if ($user_id <= 0) {
            return;
        }

        // Count sent pitches using the Post Types helper
        $pitch_count = 0;
        if (class_exists('GMKB_Post_Types')) {
            // Count pitches with sent-like statuses
            $sent_statuses = ['sent', 'opened', 'replied', 'booked'];
            foreach ($sent_statuses as $status) {
                $pitch_count += GMKB_Post_Types::count_user_pitches($user_id, $status);
            }
        } else {
            // Fallback: count via direct query
            $pitch_count = count(get_posts([
                'post_type'   => 'gmkb_pitch',
                'author'      => $user_id,
                'post_status' => ['publish', 'private'],
                'meta_query'  => [
                    [
                        'key'     => 'pitch_status',
                        'value'   => ['sent', 'opened', 'replied', 'booked'],
                        'compare' => 'IN',
                    ],
                ],
                'fields'      => 'ids',
                'posts_per_page' => -1,
            ]));
        }

        // Get previous count
        $previous_count = (int) get_user_meta($user_id, 'guestify_total_pitches_sent', true);

        // Update user meta
        update_user_meta($user_id, 'guestify_total_pitches_sent', $pitch_count);

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log(sprintf(
                '[Onboarding Sync] User %d pitch saved. Count: %d -> %d',
                $user_id,
                $previous_count,
                $pitch_count
            ));
        }

        // Check milestones
        if ($previous_count === 0 && $pitch_count >= 1) {
            do_action('gmkb_onboarding_task_completed', $user_id, 'first_pitch', [
                'points' => 10,
                'label'  => 'First Pitch Sent',
            ]);
        }

        if ($previous_count < 3 && $pitch_count >= 3) {
            do_action('gmkb_onboarding_task_completed', $user_id, 'three_pitches', [
                'points' => 10,
                'label'  => 'Three Pitches Sent',
            ]);
        }

        // Trigger progress recalculation
        if (class_exists('GMKB_Onboarding_Repository')) {
            $repo = new GMKB_Onboarding_Repository();
            $progress = $repo->calculate_progress($user_id);
            $repo->update_progress_meta($user_id, $progress['points']['percentage'], $progress);
        }
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
