<?php
/**
 * Onboarding Hooks - Event Integration
 *
 * Automatically updates onboarding progress when:
 * - Profile fields are updated
 * - Pitches are sent
 * - Searches are performed
 * - Imports are completed
 *
 * @package GMKB
 * @since 2.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Onboarding_Hooks {

    /**
     * Fields that affect profile strength calculation
     */
    const PROFILE_STRENGTH_FIELDS = [
        'authority_hook',
        'impact_intro',
        'topic_1',
        'topic_2',
        'topic_3',
        'topic_4',
        'topic_5',
        'question_1',
        'question_2',
        'question_3',
        'biography',
        'tagline',
        'headshot_primary',
    ];

    /**
     * Initialize hooks
     */
    public static function init(): void {
        // Profile update hooks
        add_action('updated_post_meta', [__CLASS__, 'on_profile_meta_updated'], 10, 4);
        add_action('added_post_meta', [__CLASS__, 'on_profile_meta_added'], 10, 4);

        // REST API profile update hook
        add_action('gmkb_profile_updated', [__CLASS__, 'on_profile_updated'], 10, 2);
        add_action('gmkb_profile_field_updated', [__CLASS__, 'on_profile_field_updated'], 10, 3);

        // Pitch tracking hooks
        add_action('gmkb_pitch_sent', [__CLASS__, 'on_pitch_sent'], 10, 2);
        add_action('guestify_pitch_created', [__CLASS__, 'on_pitch_sent'], 10, 2);

        // Search tracking hooks
        add_action('gmkb_search_performed', [__CLASS__, 'on_search_performed'], 10, 2);
        add_action('guestify_search_completed', [__CLASS__, 'on_search_performed'], 10, 2);

        // Import tracking hooks
        add_action('gmkb_podcast_imported', [__CLASS__, 'on_podcast_imported'], 10, 2);
        add_action('guestify_import_completed', [__CLASS__, 'on_podcast_imported'], 10, 2);

        // User meta update hooks (for tracking counters)
        add_action('updated_user_meta', [__CLASS__, 'on_user_meta_updated'], 10, 4);

        // Profile creation hook
        add_action('wp_insert_post', [__CLASS__, 'on_profile_created'], 10, 3);
    }

    /**
     * Handle profile meta update
     *
     * @param int $meta_id Meta ID
     * @param int $post_id Post ID
     * @param string $meta_key Meta key
     * @param mixed $meta_value Meta value
     */
    public static function on_profile_meta_updated(int $meta_id, int $post_id, string $meta_key, $meta_value): void {
        // Only process guest_profile post type
        if (get_post_type($post_id) !== 'guest_profile') {
            return;
        }

        // Check if this field affects profile strength
        if (in_array($meta_key, self::PROFILE_STRENGTH_FIELDS, true)) {
            self::schedule_progress_update($post_id);
        }
    }

    /**
     * Handle profile meta added
     *
     * @param int $meta_id Meta ID
     * @param int $post_id Post ID
     * @param string $meta_key Meta key
     * @param mixed $meta_value Meta value
     */
    public static function on_profile_meta_added(int $meta_id, int $post_id, string $meta_key, $meta_value): void {
        self::on_profile_meta_updated($meta_id, $post_id, $meta_key, $meta_value);
    }

    /**
     * Handle profile updated via REST API
     *
     * @param int $profile_id Profile post ID
     * @param int $user_id User ID
     */
    public static function on_profile_updated(int $profile_id, int $user_id): void {
        self::update_user_progress($user_id);
    }

    /**
     * Handle single field update via REST API
     *
     * @param int $profile_id Profile post ID
     * @param string $field_name Field name
     * @param mixed $value New value
     */
    public static function on_profile_field_updated(int $profile_id, string $field_name, $value): void {
        $user_id = get_post_field('post_author', $profile_id);
        if ($user_id) {
            self::update_user_progress((int) $user_id);
        }
    }

    /**
     * Handle pitch sent
     *
     * @param int $user_id User ID
     * @param array $pitch_data Pitch data
     */
    public static function on_pitch_sent(int $user_id, array $pitch_data = []): void {
        // Increment pitch counter
        $current_count = (int) get_user_meta($user_id, 'guestify_total_pitches_sent', true);
        update_user_meta($user_id, 'guestify_total_pitches_sent', $current_count + 1);

        // Update progress
        self::update_user_progress($user_id);

        // Fire task completion events for milestone pitches
        if ($current_count === 0) {
            // First pitch
            do_action('gmkb_onboarding_task_completed', $user_id, 'first_pitch', [
                'points' => 10,
                'label' => 'First Pitch Sent',
            ]);
        }

        if ($current_count + 1 >= 3 && $current_count < 3) {
            // Third pitch reached
            do_action('gmkb_onboarding_task_completed', $user_id, 'three_pitches', [
                'points' => 10,
                'label' => 'Three Pitches Sent',
            ]);
        }
    }

    /**
     * Handle search performed
     *
     * @param int $user_id User ID
     * @param array $search_data Search data
     */
    public static function on_search_performed(int $user_id, array $search_data = []): void {
        // Increment search counter
        $current_count = (int) get_user_meta($user_id, 'guestify_total_searches', true);
        update_user_meta($user_id, 'guestify_total_searches', $current_count + 1);

        // Update progress on first search
        if ($current_count === 0) {
            self::update_user_progress($user_id);

            do_action('gmkb_onboarding_task_completed', $user_id, 'search', [
                'points' => 10,
                'label' => 'First Search',
            ]);
        }
    }

    /**
     * Handle podcast imported
     *
     * @param int $user_id User ID
     * @param array $import_data Import data
     */
    public static function on_podcast_imported(int $user_id, array $import_data = []): void {
        // Increment import counter
        $current_count = (int) get_user_meta($user_id, 'guestify_total_interview_entries', true);
        update_user_meta($user_id, 'guestify_total_interview_entries', $current_count + 1);

        // Update progress on first import
        if ($current_count === 0) {
            self::update_user_progress($user_id);

            do_action('gmkb_onboarding_task_completed', $user_id, 'import', [
                'points' => 10,
                'label' => 'First Import',
            ]);
        }
    }

    /**
     * Handle user meta update (for counter changes)
     *
     * @param int $meta_id Meta ID
     * @param int $user_id User ID
     * @param string $meta_key Meta key
     * @param mixed $meta_value Meta value
     */
    public static function on_user_meta_updated(int $meta_id, int $user_id, string $meta_key, $meta_value): void {
        // Track relevant counter updates
        $tracked_keys = [
            'guestify_total_pitches_sent',
            'guestify_total_searches',
            'guestify_total_interview_entries',
            'highlevel_tags', // For quickstart call detection
        ];

        if (in_array($meta_key, $tracked_keys, true)) {
            // Debounce by scheduling instead of immediate update
            self::schedule_progress_update(0, $user_id);
        }
    }

    /**
     * Handle profile creation
     *
     * @param int $post_id Post ID
     * @param WP_Post $post Post object
     * @param bool $update Whether this is an update
     */
    public static function on_profile_created(int $post_id, $post, bool $update): void {
        // Only on new posts, not updates
        if ($update) {
            return;
        }

        // Only for guest_profile post type
        if ($post->post_type !== 'guest_profile') {
            return;
        }

        $user_id = (int) $post->post_author;
        if ($user_id <= 0) {
            return;
        }

        // Check if this is the user's first profile
        $profile_count = count(get_posts([
            'post_type' => 'guest_profile',
            'author' => $user_id,
            'post_status' => ['publish', 'draft', 'private'],
            'fields' => 'ids',
            'posts_per_page' => 2,
        ]));

        if ($profile_count === 1) {
            // First profile created
            do_action('gmkb_onboarding_task_completed', $user_id, 'profile', [
                'points' => 15,
                'label' => 'Profile Created',
            ]);

            self::update_user_progress($user_id);
        }
    }

    /**
     * Schedule progress update (debounced)
     *
     * @param int $post_id Profile post ID (0 if user-level update)
     * @param int $user_id User ID (optional, derived from post if not provided)
     */
    private static function schedule_progress_update(int $post_id, int $user_id = 0): void {
        if ($user_id <= 0 && $post_id > 0) {
            $user_id = (int) get_post_field('post_author', $post_id);
        }

        if ($user_id <= 0) {
            return;
        }

        // Use transient to debounce multiple updates within a short time
        $transient_key = 'gmkb_progress_update_' . $user_id;
        if (get_transient($transient_key)) {
            return; // Already scheduled
        }

        // Set transient to prevent duplicate updates (expires in 5 seconds)
        set_transient($transient_key, true, 5);

        // Schedule the update
        if (!wp_next_scheduled('gmkb_update_user_progress', [$user_id])) {
            wp_schedule_single_event(time() + 2, 'gmkb_update_user_progress', [$user_id]);
        }
    }

    /**
     * Update user progress (called by scheduled event or directly)
     *
     * @param int $user_id User ID
     */
    public static function update_user_progress(int $user_id): void {
        if ($user_id <= 0) {
            return;
        }

        if (!class_exists('GMKB_Onboarding_Repository')) {
            return;
        }

        $repo = new GMKB_Onboarding_Repository();
        $progress = $repo->calculate_progress($user_id);
        $repo->update_progress_meta($user_id, $progress['points']['percentage'], $progress);

        GMKB_Logger::info(sprintf(
            'Onboarding Hooks: Updated progress for user %d: %d%%',
            $user_id,
            $progress['points']['percentage']
        ));
    }
}

// Initialize hooks
add_action('init', ['GMKB_Onboarding_Hooks', 'init']);

// Register scheduled event handler
add_action('gmkb_update_user_progress', ['GMKB_Onboarding_Hooks', 'update_user_progress']);
