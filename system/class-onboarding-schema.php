<?php
/**
 * Onboarding Schema - Single Source of Truth
 *
 * Defines all onboarding tasks, point values, task groups, and rewards.
 * This centralizes the gamification system configuration.
 *
 * @package GMKB
 * @since 2.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Onboarding_Schema {

    /**
     * Option key for storing rewards configuration
     */
    const REWARDS_OPTION_KEY = 'gmkb_onboarding_rewards';

    /**
     * Maximum points possible
     */
    const MAX_POINTS = 100;

    /**
     * Task Groups
     *
     * Defines the 4 main categories of onboarding tasks.
     * These map to the card sections in the UI.
     */
    const TASK_GROUPS = [
        'foundation' => [
            'label' => 'Foundation',
            'title' => 'Set Up for Success: Build Your Podcast Guest Foundation',
            'description' => 'Create your profile and complete initial setup',
            'icon' => 'tracker_5781526.png',
            'order' => 1,
        ],
        'discovery' => [
            'label' => 'Discovery',
            'title' => 'Find and Organize Your Ideal Guest Interview Opportunities',
            'description' => 'Search for podcasts and organize your outreach',
            'icon' => 'search_2920349.png',
            'order' => 2,
        ],
        'messaging' => [
            'label' => 'Messaging',
            'title' => 'Craft a Magnetic Message That Gets You Booked',
            'description' => 'Create compelling content that resonates with hosts',
            'icon' => 'authority_6083266.png',
            'order' => 3,
        ],
        'outreach' => [
            'label' => 'Outreach',
            'title' => 'Send Pitches That Get Podcast Hosts to Say YES',
            'description' => 'Start reaching out to podcast hosts',
            'icon' => 'pitch_6304921.png',
            'order' => 4,
        ],
    ];

    /**
     * Task Definitions
     *
     * Each task includes:
     * - group: Which task group it belongs to
     * - label: Short display name
     * - description: Longer explanation
     * - points: Point value (0-100)
     * - source: Where to check completion ('usermeta' or 'postmeta')
     * - check_type: How to evaluate completion
     * - meta_key: The key to check
     * - Additional fields depending on check_type
     */
    const TASKS = [
        'profile' => [
            'group' => 'foundation',
            'label' => 'Set up your guest profile',
            'description' => 'Create your podcast guest profile by adding your name, professional title, and website/social links to establish credibility.',
            'points' => 15,
            'source' => 'postmeta',
            'check_type' => 'profile_exists',
            'modal_id' => '#quickProfileModal',
            'link_type' => 'modal',  // Opens quick setup modal for low-effort quick win
            'order' => 1,
        ],
        'quickstart_call' => [
            'group' => 'foundation',
            'label' => 'Complete the Quickstart Onboarding Walkthrough',
            'description' => 'Follow the step-by-step walkthrough to get started with Guestify, set up your profile, and learn how to maximize podcast opportunities.',
            'points' => 15,
            'source' => 'usermeta',
            'check_type' => 'contains',
            'meta_key' => 'highlevel_tags',
            'meta_value' => 'cal: onboarding quickstart',
            'link' => '/onboarding/walkthrough/',
            'link_type' => 'new_tab',  // Opens in new tab
            'order' => 2,
        ],
        'survey' => [
            'group' => 'foundation',
            'label' => 'Unlock Personalized Guest Strategies: Complete Your Survey',
            'description' => 'Help us tailor your experience! Take 2 minutes to complete a quick survey about your podcasting goals, experience, and challenges.',
            'points' => 0,  // Tracked but not scored
            'source' => 'usermeta',
            'check_type' => 'exists',
            'meta_key' => '_gmkb_survey_completed',
            'modal_id' => '#surveyModal',
            'link_type' => 'modal',  // Opens survey modal
            'order' => 3,
        ],
        'search' => [
            'group' => 'discovery',
            'label' => 'Perform your first podcast search',
            'description' => 'Use AI-powered Podcast Prospector to quickly find a podcast that aligns with your niche and audience.',
            'points' => 10,
            'source' => 'usermeta',
            'check_type' => 'threshold',
            'meta_key' => 'guestify_total_searches',
            'threshold' => 1,
            'link' => '/app/prospector/search/',
            'order' => 1,
        ],
        'import' => [
            'group' => 'discovery',
            'label' => 'Import your first podcast into Interview Tracker',
            'description' => 'Save a podcast lead in your tracking system to keep your outreach organized and efficient.',
            'points' => 10,
            'source' => 'usermeta',
            'check_type' => 'threshold',
            'meta_key' => 'guestify_total_interview_entries',
            'threshold' => 1,
            'link' => '/app/prospector/search/',
            'order' => 2,
        ],
        'authority_hook' => [
            'group' => 'messaging',
            'label' => 'Define your authority hook',
            'description' => 'Craft your expert positioning statement to clearly communicate who you help, what results you drive, and how you do it.',
            'points' => 10,
            'source' => 'postmeta',
            'check_type' => 'not_empty',
            'meta_key' => 'authority_hook',
            'modal_id' => '#authorityHookModal',
            'link_type' => 'modal',  // Opens AI generator modal
            'order' => 1,
        ],
        'impact_intro' => [
            'group' => 'messaging',
            'label' => 'Write your Impact Intro',
            'description' => 'Introduce yourself with impact—summarize your expertise in 2-3 sentences to make a strong first impression.',
            'points' => 10,
            'source' => 'postmeta',
            'check_type' => 'not_empty',
            'meta_key' => 'impact_intro',
            'modal_id' => '#impactIntroModal',
            'link_type' => 'modal',  // Opens AI generator modal
            'order' => 2,
        ],
        'topics' => [
            'group' => 'messaging',
            'label' => 'Select your key topics',
            'description' => 'Outline your expert discussion topics—choose relevant topics that align with your audience and podcast hosts\' interests.',
            'points' => 10,
            'source' => 'postmeta',
            'check_type' => 'category',
            'meta_keys' => ['topic_1', 'topic_2', 'topic_3', 'topic_4', 'topic_5'],
            'min_required' => 3,
            'modal_id' => '#topicsModal',
            'link_type' => 'modal',  // Opens AI generator modal
            'order' => 3,
        ],
        'first_pitch' => [
            'group' => 'outreach',
            'label' => 'Send your first podcast pitch',
            'description' => 'Use AI Pitch Engine to craft and send a personalized pitch that increases your chances of getting booked.',
            'points' => 10,
            'source' => 'usermeta',
            'check_type' => 'threshold',
            'meta_key' => 'guestify_total_pitches_sent',
            'threshold' => 1,
            'link' => '/app/interview/board/',
            'order' => 1,
        ],
        'three_pitches' => [
            'group' => 'outreach',
            'label' => 'Send 3 podcast pitches',
            'description' => 'Test and refine your outreach strategy—see what works best and increase your response rate.',
            'points' => 10,
            'source' => 'usermeta',
            'check_type' => 'threshold',
            'meta_key' => 'guestify_total_pitches_sent',
            'threshold' => 3,
            'link' => '/app/interview/board/',
            'order' => 2,
        ],
    ];

    /**
     * Default Rewards Configuration
     *
     * These can be overridden via the admin panel.
     * Stored in wp_options table.
     */
    const DEFAULT_REWARDS = [
        [
            'id' => 'reward_15',
            'threshold' => 15,
            'title' => 'Guest Interview Secrets',
            'description' => 'Exclusive Training',
            'download_url' => '',
            'attachment_id' => null,
            'icon' => 'video',
        ],
        [
            'id' => 'reward_30',
            'threshold' => 30,
            'title' => 'FREE "Get Interviewed" Book',
            'description' => 'How to get more visibility & leads',
            'download_url' => '',
            'attachment_id' => null,
            'icon' => 'book',
        ],
        [
            'id' => 'reward_50',
            'threshold' => 50,
            'title' => 'Storytelling Cheatsheet',
            'description' => 'Proven formulas for engaging interviews',
            'download_url' => '',
            'attachment_id' => null,
            'icon' => 'document',
        ],
        [
            'id' => 'reward_75',
            'threshold' => 75,
            'title' => 'Exclusive Group Coaching Call',
            'description' => 'Live Q&A and strategy session',
            'download_url' => '',
            'attachment_id' => null,
            'icon' => 'users',
        ],
        [
            'id' => 'reward_100',
            'threshold' => 100,
            'title' => '30+ Podcast Promo Templates',
            'description' => 'Amplify & repurpose your interviews',
            'download_url' => '',
            'attachment_id' => null,
            'icon' => 'template',
        ],
    ];

    /**
     * Get all task groups
     *
     * @return array
     */
    public static function get_task_groups(): array {
        return self::TASK_GROUPS;
    }

    /**
     * Get a specific task group
     *
     * @param string $group_id Group identifier
     * @return array|null
     */
    public static function get_task_group(string $group_id): ?array {
        return self::TASK_GROUPS[$group_id] ?? null;
    }

    /**
     * Get all tasks
     *
     * @return array
     */
    public static function get_tasks(): array {
        return self::TASKS;
    }

    /**
     * Get a specific task
     *
     * @param string $task_id Task identifier
     * @return array|null
     */
    public static function get_task(string $task_id): ?array {
        return self::TASKS[$task_id] ?? null;
    }

    /**
     * Get tasks for a specific group
     *
     * @param string $group_id Group identifier
     * @return array Tasks in the group
     */
    public static function get_tasks_by_group(string $group_id): array {
        $tasks = [];
        foreach (self::TASKS as $task_id => $task) {
            if ($task['group'] === $group_id) {
                $tasks[$task_id] = $task;
            }
        }

        // Sort by order
        uasort($tasks, function($a, $b) {
            return ($a['order'] ?? 999) - ($b['order'] ?? 999);
        });

        return $tasks;
    }

    /**
     * Get rewards from database or return defaults
     *
     * @return array Rewards configuration
     */
    public static function get_rewards(): array {
        $saved = get_option(self::REWARDS_OPTION_KEY, null);

        if ($saved !== null && is_array($saved) && !empty($saved)) {
            return $saved;
        }

        return self::DEFAULT_REWARDS;
    }

    /**
     * Save rewards to database
     *
     * @param array $rewards Rewards configuration
     * @return bool Success status
     */
    public static function save_rewards(array $rewards): bool {
        // Validate rewards structure
        foreach ($rewards as $reward) {
            if (!isset($reward['id'], $reward['threshold'], $reward['title'])) {
                return false;
            }
        }

        return update_option(self::REWARDS_OPTION_KEY, $rewards);
    }

    /**
     * Reset rewards to defaults
     *
     * @return bool Success status
     */
    public static function reset_rewards(): bool {
        return delete_option(self::REWARDS_OPTION_KEY);
    }

    /**
     * Get maximum possible points
     *
     * @return int
     */
    public static function get_max_points(): int {
        return self::MAX_POINTS;
    }

    /**
     * Calculate total possible points from tasks
     *
     * @return int
     */
    public static function calculate_total_possible_points(): int {
        $total = 0;
        foreach (self::TASKS as $task) {
            $total += $task['points'];
        }
        return $total;
    }

    /**
     * Get tasks that contribute to Profile Strength
     *
     * Profile Strength is a subset view of onboarding (Foundation profile + Messaging)
     *
     * @return array Task IDs that contribute to profile strength
     */
    public static function get_profile_strength_tasks(): array {
        return ['profile', 'authority_hook', 'impact_intro', 'topics'];
    }

    /**
     * Get the schema for frontend consumption
     *
     * @return array Schema data optimized for Vue.js
     */
    public static function to_frontend_schema(): array {
        $groups = [];

        foreach (self::TASK_GROUPS as $group_id => $group) {
            $group_tasks = [];

            foreach (self::get_tasks_by_group($group_id) as $task_id => $task) {
                $group_tasks[] = [
                    'id' => $task_id,
                    'label' => $task['label'],
                    'description' => $task['description'],
                    'points' => $task['points'],
                    'link' => $task['link'] ?? null,
                    'modal_id' => $task['modal_id'] ?? null,  // Used when link_type is 'modal'
                    'link_type' => $task['link_type'] ?? 'default',  // modal, new_tab, or default
                    'order' => $task['order'] ?? 999,
                ];
            }

            $groups[] = [
                'id' => $group_id,
                'label' => $group['label'],
                'title' => $group['title'],
                'description' => $group['description'],
                'icon' => $group['icon'],
                'order' => $group['order'],
                'tasks' => $group_tasks,
            ];
        }

        // Sort groups by order
        usort($groups, function($a, $b) {
            return $a['order'] - $b['order'];
        });

        return [
            'version' => '2.0',
            'maxPoints' => self::MAX_POINTS,
            'groups' => $groups,
            'rewards' => self::get_rewards(),
        ];
    }
}
