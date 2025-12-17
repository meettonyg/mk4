<?php
/**
 * Onboarding Repository - Progress Calculation & Data Access
 *
 * Provides methods to calculate user progress, check task completion,
 * and manage onboarding data. Uses native WordPress data (usermeta/postmeta).
 *
 * @package GMKB
 * @since 2.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Onboarding_Repository {

    /**
     * Profile Repository instance
     *
     * @var GMKB_Profile_Repository|null
     */
    private $profile_repository = null;

    /**
     * Get Profile Repository instance
     *
     * @return GMKB_Profile_Repository
     */
    private function get_profile_repository(): GMKB_Profile_Repository {
        if ($this->profile_repository === null) {
            $this->profile_repository = new GMKB_Profile_Repository();
        }
        return $this->profile_repository;
    }

    /**
     * Calculate full progress for a user (aggregate across all profiles)
     *
     * This is the main method that returns all onboarding data.
     *
     * @param int $user_id WordPress user ID
     * @return array Complete progress data
     */
    public function calculate_progress(int $user_id): array {
        if ($user_id <= 0) {
            return $this->get_empty_progress();
        }

        // Get user's best profile for postmeta checks
        $profile_id = $this->get_best_profile_for_user($user_id);

        // Calculate task completion
        $tasks = $this->calculate_tasks($user_id, $profile_id);

        // Calculate totals
        $total_points = 0;
        foreach ($tasks as $task) {
            $total_points += $task['points'];
        }

        // Calculate group summaries
        $groups = $this->calculate_group_summaries($tasks);

        // Get rewards status
        $rewards = $this->get_rewards_status($total_points);

        // Get user's profiles for selector
        $profiles = $this->get_user_profiles($user_id);

        return [
            'user_id' => $user_id,
            'profile_id' => $profile_id,
            'points' => [
                'total' => $total_points,
                'max' => GMKB_Onboarding_Schema::MAX_POINTS,
                'percentage' => $total_points, // Same as total since max is 100
            ],
            'tasks' => $tasks,
            'groups' => $groups,
            'rewards' => $rewards,
            'profiles' => $profiles,
        ];
    }

    /**
     * Calculate task completion statuses
     *
     * @param int $user_id User ID
     * @param int|null $profile_id Best profile ID (for postmeta checks)
     * @return array Task completion data
     */
    private function calculate_tasks(int $user_id, ?int $profile_id): array {
        $tasks = [];
        $schema_tasks = GMKB_Onboarding_Schema::get_tasks();

        foreach ($schema_tasks as $task_id => $task) {
            $complete = $this->check_task_complete($user_id, $profile_id, $task);
            $earned = $complete ? $task['points'] : 0;

            $tasks[$task_id] = [
                'complete' => $complete,
                'points' => $earned,
                'max_points' => $task['points'],
                'group' => $task['group'],
                'label' => $task['label'],
                'description' => $task['description'],
                'link' => $task['link'],
            ];
        }

        return $tasks;
    }

    /**
     * Check if a specific task is complete
     *
     * @param int $user_id User ID
     * @param int|null $profile_id Profile ID for postmeta checks
     * @param array $task Task definition
     * @return bool Whether the task is complete
     */
    private function check_task_complete(int $user_id, ?int $profile_id, array $task): bool {
        $source = $task['source'];
        $check_type = $task['check_type'];

        // Get the value based on source
        if ($source === 'usermeta') {
            $value = get_user_meta($user_id, $task['meta_key'], true);
        } elseif ($source === 'postmeta' && $profile_id) {
            // Special handling for profile_exists check
            if ($check_type === 'profile_exists') {
                return $profile_id > 0;
            }
            $value = get_post_meta($profile_id, $task['meta_key'], true);
        } else {
            return false;
        }

        // Evaluate completion based on check type
        switch ($check_type) {
            case 'exists':
                return !empty($value);

            case 'not_empty':
                return !empty(trim((string) $value));

            case 'contains':
                return is_string($value) && strpos($value, $task['meta_value']) !== false;

            case 'threshold':
                return intval($value) >= $task['threshold'];

            case 'category':
                return $this->check_category_complete($profile_id, $task);

            case 'profile_exists':
                return $profile_id > 0;

            default:
                return false;
        }
    }

    /**
     * Check category completion (e.g., 3+ topics filled)
     *
     * @param int|null $profile_id Profile ID
     * @param array $task Task definition with meta_keys and min_required
     * @return bool Whether the category requirement is met
     */
    private function check_category_complete(?int $profile_id, array $task): bool {
        if (!$profile_id) {
            return false;
        }

        $filled = 0;
        $meta_keys = $task['meta_keys'] ?? [];
        $min_required = $task['min_required'] ?? 1;

        foreach ($meta_keys as $key) {
            $value = get_post_meta($profile_id, $key, true);
            if (!empty(trim((string) $value))) {
                $filled++;
            }
        }

        return $filled >= $min_required;
    }

    /**
     * Calculate group summaries
     *
     * @param array $tasks Calculated task data
     * @return array Group summary data
     */
    private function calculate_group_summaries(array $tasks): array {
        $groups = [];

        foreach (GMKB_Onboarding_Schema::TASK_GROUPS as $group_id => $group_def) {
            $complete = 0;
            $total = 0;
            $points = 0;
            $max_points = 0;

            foreach ($tasks as $task) {
                if ($task['group'] === $group_id) {
                    $total++;
                    $max_points += $task['max_points'];

                    if ($task['complete']) {
                        $complete++;
                        $points += $task['points'];
                    }
                }
            }

            $groups[$group_id] = [
                'label' => $group_def['label'],
                'title' => $group_def['title'],
                'complete' => $complete,
                'total' => $total,
                'points' => $points,
                'max_points' => $max_points,
            ];
        }

        return $groups;
    }

    /**
     * Get rewards with unlock status based on points
     *
     * @param int $total_points User's total points
     * @return array Rewards status data
     */
    private function get_rewards_status(int $total_points): array {
        $rewards = GMKB_Onboarding_Schema::get_rewards();
        $unlocked = [];
        $next_threshold = null;

        foreach ($rewards as &$reward) {
            $reward['unlocked'] = $total_points >= $reward['threshold'];

            if ($reward['unlocked']) {
                $unlocked[] = $reward['id'];
            } elseif ($next_threshold === null) {
                $next_threshold = $reward['threshold'];
            }
        }

        return [
            'list' => $rewards,
            'unlocked' => $unlocked,
            'next_threshold' => $next_threshold,
            'points_to_next' => $next_threshold ? $next_threshold - $total_points : 0,
        ];
    }

    /**
     * Find user's most complete profile (User Mastery approach)
     *
     * Returns the profile with the most messaging fields complete
     * (authority_hook, impact_intro, topics)
     *
     * @param int $user_id User ID
     * @return int|null Best profile ID or null if none found
     */
    public function get_best_profile_for_user(int $user_id): ?int {
        $repo = $this->get_profile_repository();
        $profiles = $repo->list_for_user($user_id);

        if (empty($profiles)) {
            return null;
        }

        // If only one profile, return it
        if (count($profiles) === 1) {
            return $profiles[0]['id'];
        }

        // Score each profile based on messaging completeness
        $best_id = null;
        $best_score = -1;

        foreach ($profiles as $profile) {
            $profile_id = $profile['id'];
            $score = $this->calculate_profile_messaging_score($profile_id);

            if ($score > $best_score) {
                $best_score = $score;
                $best_id = $profile_id;
            }
        }

        return $best_id;
    }

    /**
     * Calculate messaging completeness score for a profile
     *
     * @param int $profile_id Profile ID
     * @return int Score (0-4 based on messaging fields filled)
     */
    private function calculate_profile_messaging_score(int $profile_id): int {
        $score = 0;

        // Check authority_hook
        $authority_hook = get_post_meta($profile_id, 'authority_hook', true);
        if (!empty(trim((string) $authority_hook))) {
            $score++;
        }

        // Check impact_intro
        $impact_intro = get_post_meta($profile_id, 'impact_intro', true);
        if (!empty(trim((string) $impact_intro))) {
            $score++;
        }

        // Check topics (count how many are filled)
        $topics_filled = 0;
        for ($i = 1; $i <= 5; $i++) {
            $topic = get_post_meta($profile_id, "topic_$i", true);
            if (!empty(trim((string) $topic))) {
                $topics_filled++;
            }
        }

        // Add partial score for topics (0, 0.5, or 1)
        if ($topics_filled >= 3) {
            $score += 1;
        } elseif ($topics_filled >= 1) {
            $score += 0.5;
        }

        // Check basic profile info exists
        $first_name = get_post_meta($profile_id, 'first_name', true);
        if (!empty(trim((string) $first_name))) {
            $score++;
        }

        return $score;
    }

    /**
     * Get list of user's profiles for the selector
     *
     * @param int $user_id User ID
     * @return array Profile summaries
     */
    public function get_user_profiles(int $user_id): array {
        $repo = $this->get_profile_repository();
        $profiles = $repo->list_for_user($user_id);

        return array_map(function($profile) {
            return [
                'id' => $profile['id'],
                'name' => $profile['title'],
                'created' => $profile['created'],
                'completeness' => $profile['completeness'] ?? 0,
            ];
        }, $profiles);
    }

    /**
     * Calculate Profile Strength (subset for Media Kit display)
     *
     * Profile Strength shows completion of profile-related tasks only:
     * - Profile creation
     * - Authority Hook
     * - Impact Intro
     * - Topics
     *
     * @param int $user_id User ID
     * @param int|null $profile_id Optional specific profile ID
     * @return int Percentage (0-100)
     */
    public function calculate_profile_strength(int $user_id, ?int $profile_id = null): int {
        if (!$profile_id) {
            $profile_id = $this->get_best_profile_for_user($user_id);
        }

        if (!$profile_id) {
            return 0;
        }

        $profile_tasks = GMKB_Onboarding_Schema::get_profile_strength_tasks();
        $schema_tasks = GMKB_Onboarding_Schema::get_tasks();

        $total_points = 0;
        $earned_points = 0;

        foreach ($profile_tasks as $task_id) {
            if (!isset($schema_tasks[$task_id])) {
                continue;
            }

            $task = $schema_tasks[$task_id];
            $total_points += $task['points'];

            if ($this->check_task_complete($user_id, $profile_id, $task)) {
                $earned_points += $task['points'];
            }
        }

        if ($total_points === 0) {
            return 0;
        }

        return (int) round(($earned_points / $total_points) * 100);
    }

    /**
     * Update onboarding progress in user meta
     *
     * This is called after progress calculation to cache the percentage
     * and sync with GHL via WP Fusion.
     *
     * @param int $user_id User ID
     * @param int $percentage Progress percentage
     * @return bool Success
     */
    public function update_progress_meta(int $user_id, int $percentage): bool {
        $result = update_user_meta($user_id, 'guestify_onboarding_progress_percent', $percentage);

        // Sync to GHL via WP Fusion if available
        if (function_exists('wp_fusion')) {
            wp_fusion()->user->push_user_meta($user_id, [
                'guestify_onboarding_progress_percent' => $percentage,
            ]);
        }

        return $result !== false;
    }

    /**
     * Mark survey as completed for a user
     *
     * @param int $user_id User ID
     * @return bool Success
     */
    public function mark_survey_completed(int $user_id): bool {
        return update_user_meta($user_id, '_gmkb_survey_completed', current_time('mysql')) !== false;
    }

    /**
     * Check if user has completed the survey
     *
     * @param int $user_id User ID
     * @return bool
     */
    public function has_completed_survey(int $user_id): bool {
        $value = get_user_meta($user_id, '_gmkb_survey_completed', true);
        return !empty($value);
    }

    /**
     * Get empty progress structure (for unauthenticated users)
     *
     * @return array Empty progress data
     */
    private function get_empty_progress(): array {
        return [
            'user_id' => 0,
            'profile_id' => null,
            'points' => [
                'total' => 0,
                'max' => GMKB_Onboarding_Schema::MAX_POINTS,
                'percentage' => 0,
            ],
            'tasks' => [],
            'groups' => [],
            'rewards' => [
                'list' => GMKB_Onboarding_Schema::get_rewards(),
                'unlocked' => [],
                'next_threshold' => 15,
                'points_to_next' => 15,
            ],
            'profiles' => [],
        ];
    }

    /**
     * Get progress for a specific profile (instead of aggregate)
     *
     * @param int $user_id User ID
     * @param int $profile_id Specific profile ID
     * @return array Progress data for that profile
     */
    public function calculate_progress_for_profile(int $user_id, int $profile_id): array {
        if ($user_id <= 0 || $profile_id <= 0) {
            return $this->get_empty_progress();
        }

        // Verify ownership
        $repo = $this->get_profile_repository();
        if (!$repo->is_owner($profile_id, $user_id)) {
            return $this->get_empty_progress();
        }

        // Calculate using specific profile
        $tasks = $this->calculate_tasks($user_id, $profile_id);

        $total_points = 0;
        foreach ($tasks as $task) {
            $total_points += $task['points'];
        }

        $groups = $this->calculate_group_summaries($tasks);
        $rewards = $this->get_rewards_status($total_points);
        $profiles = $this->get_user_profiles($user_id);

        return [
            'user_id' => $user_id,
            'profile_id' => $profile_id,
            'points' => [
                'total' => $total_points,
                'max' => GMKB_Onboarding_Schema::MAX_POINTS,
                'percentage' => $total_points,
            ],
            'tasks' => $tasks,
            'groups' => $groups,
            'rewards' => $rewards,
            'profiles' => $profiles,
        ];
    }
}
