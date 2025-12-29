<?php
/**
 * Profile Limits System
 *
 * Manages profile creation and display limits based on user membership levels.
 * Integrates with WP Fusion tags (from HighLevel) to determine membership tier.
 *
 * @package GMKB
 * @since 2.4.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Profile_Limits {

    /**
     * Option name for storing membership tier configuration
     */
    const OPTION_KEY = 'gmkb_membership_tiers';

    /**
     * Option name for storing default tier settings
     */
    const DEFAULT_TIER_OPTION = 'gmkb_default_profile_limit';

    /**
     * Default membership tiers configuration
     * Maps WP Fusion tags to profile limits
     */
    const DEFAULT_TIERS = [
        'unlimited' => [
            'name' => 'Unlimited',
            'tags' => ['mem: guestify pos unlimited'],
            'profile_limit' => -1, // -1 = unlimited
            'display_limit' => -1,
            'priority' => 100, // Higher priority wins when user has multiple tags
        ],
        'zenith' => [
            'name' => 'Zenith',
            'tags' => ['mem: guestify zenith', 'mem: guestify zenith trial'],
            'profile_limit' => 3,
            'display_limit' => 3,
            'priority' => 80,
        ],
        'velocity' => [
            'name' => 'Velocity',
            'tags' => ['mem: guestify velocity', 'mem: guestify velocity trial'],
            'profile_limit' => 2,
            'display_limit' => 2,
            'priority' => 60,
        ],
        'accel' => [
            'name' => 'Accelerator',
            'tags' => ['mem: guestify accel', 'mem: guestify accel trial', 'mem: guestify pos free'],
            'profile_limit' => 1,
            'display_limit' => 1,
            'priority' => 40,
        ],
        'free' => [
            'name' => 'Free',
            'tags' => [],
            'profile_limit' => 1,
            'display_limit' => 1,
            'priority' => 0,
        ],
    ];

    /**
     * Get all configured membership tiers
     *
     * @return array Membership tier configurations
     */
    public static function get_tiers(): array {
        $tiers = get_option(self::OPTION_KEY, null);

        if ($tiers === null || !is_array($tiers)) {
            // Initialize with defaults
            $tiers = self::DEFAULT_TIERS;
            update_option(self::OPTION_KEY, $tiers);
        }

        return $tiers;
    }

    /**
     * Save membership tier configuration
     *
     * @param array $tiers Tier configuration array
     * @return bool Whether the save was successful
     */
    public static function save_tiers(array $tiers): bool {
        return update_option(self::OPTION_KEY, $tiers);
    }

    /**
     * Get a user's effective membership tier
     *
     * @param int|null $user_id User ID (defaults to current user)
     * @return array Tier configuration for the user
     */
    public static function get_user_tier(?int $user_id = null): array {
        if ($user_id === null) {
            $user_id = get_current_user_id();
        }

        if (!$user_id) {
            return self::get_default_tier();
        }

        // Admins get unlimited
        if (user_can($user_id, 'manage_options')) {
            $tiers = self::get_tiers();
            return $tiers['unlimited'] ?? self::get_unlimited_tier();
        }

        // Get user's WP Fusion tags
        $user_tags = self::get_user_tags($user_id);

        if (empty($user_tags)) {
            return self::get_default_tier();
        }

        // Find the highest priority tier that matches the user's tags
        $tiers = self::get_tiers();
        $matched_tier = null;
        $highest_priority = -1;

        foreach ($tiers as $tier_key => $tier) {
            if (empty($tier['tags'])) {
                continue;
            }

            // Check if any of the user's tags match this tier
            $tag_match = array_intersect($user_tags, $tier['tags']);

            if (!empty($tag_match) && ($tier['priority'] ?? 0) > $highest_priority) {
                $matched_tier = $tier;
                $matched_tier['key'] = $tier_key;
                $highest_priority = $tier['priority'] ?? 0;
            }
        }

        return $matched_tier ?? self::get_default_tier();
    }

    /**
     * Get the default (free) tier
     *
     * @return array Default tier configuration
     */
    public static function get_default_tier(): array {
        $tiers = self::get_tiers();
        $default = $tiers['free'] ?? self::DEFAULT_TIERS['free'];
        $default['key'] = 'free';
        return $default;
    }

    /**
     * Get unlimited tier config
     *
     * @return array Unlimited tier configuration
     */
    private static function get_unlimited_tier(): array {
        return array_merge(self::DEFAULT_TIERS['unlimited'], ['key' => 'unlimited']);
    }

    /**
     * Get WP Fusion tags for a user
     *
     * @param int $user_id User ID
     * @return array Array of tag names
     */
    public static function get_user_tags(int $user_id): array {
        $tags = [];

        // Check if WP Fusion is active
        if (function_exists('wp_fusion') && method_exists(wp_fusion()->user, 'get_tags')) {
            $tag_ids = wp_fusion()->user->get_tags($user_id);

            if (!empty($tag_ids) && is_array($tag_ids)) {
                // Convert tag IDs to tag names
                foreach ($tag_ids as $tag_id) {
                    $tag_name = wp_fusion()->user->get_tag_label($tag_id);
                    if ($tag_name) {
                        $tags[] = $tag_name;
                    }
                }
            }
        }

        /**
         * Filter user membership tags
         * Allows other plugins to add/modify tags
         *
         * @param array $tags Current tags
         * @param int   $user_id User ID
         */
        return apply_filters('gmkb_user_membership_tags', $tags, $user_id);
    }

    /**
     * Get the profile limit for a user
     *
     * @param int|null $user_id User ID (defaults to current user)
     * @return int Profile limit (-1 for unlimited)
     */
    public static function get_profile_limit(?int $user_id = null): int {
        $tier = self::get_user_tier($user_id);
        return $tier['profile_limit'] ?? 1;
    }

    /**
     * Get the display limit for a user (max profiles shown in list)
     *
     * @param int|null $user_id User ID (defaults to current user)
     * @return int Display limit (-1 for unlimited)
     */
    public static function get_display_limit(?int $user_id = null): int {
        $tier = self::get_user_tier($user_id);
        return $tier['display_limit'] ?? 1;
    }

    /**
     * Get the current profile count for a user
     *
     * @param int|null $user_id User ID (defaults to current user)
     * @return int Number of profiles owned by user
     */
    public static function get_profile_count(?int $user_id = null): int {
        if ($user_id === null) {
            $user_id = get_current_user_id();
        }

        if (!$user_id) {
            return 0;
        }

        global $wpdb;

        // Count profiles where user is owner (via owner_user_id meta) or author
        $count = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(DISTINCT p.ID)
             FROM {$wpdb->posts} p
             LEFT JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id AND pm.meta_key = 'owner_user_id'
             WHERE p.post_type = 'guests'
             AND p.post_status IN ('publish', 'draft', 'private')
             AND COALESCE(pm.meta_value, p.post_author) = %d",
            $user_id
        ));

        return (int) $count;
    }

    /**
     * Check if a user can create more profiles
     *
     * @param int|null $user_id User ID (defaults to current user)
     * @return bool Whether the user can create more profiles
     */
    public static function can_create_profile(?int $user_id = null): bool {
        $limit = self::get_profile_limit($user_id);

        // Unlimited
        if ($limit === -1) {
            return true;
        }

        $current_count = self::get_profile_count($user_id);

        return $current_count < $limit;
    }

    /**
     * Get remaining profile slots for a user
     *
     * @param int|null $user_id User ID (defaults to current user)
     * @return int Remaining slots (-1 for unlimited)
     */
    public static function get_remaining_slots(?int $user_id = null): int {
        $limit = self::get_profile_limit($user_id);

        if ($limit === -1) {
            return -1;
        }

        $current_count = self::get_profile_count($user_id);

        return max(0, $limit - $current_count);
    }

    /**
     * Get complete limit status for a user (for API responses)
     *
     * @param int|null $user_id User ID (defaults to current user)
     * @return array Limit status data
     */
    public static function get_limit_status(?int $user_id = null): array {
        $tier = self::get_user_tier($user_id);
        $profile_limit = $tier['profile_limit'] ?? 1;
        $display_limit = $tier['display_limit'] ?? 1;
        $current_count = self::get_profile_count($user_id);
        $is_unlimited = $profile_limit === -1;

        return [
            'tier' => [
                'key' => $tier['key'] ?? 'free',
                'name' => $tier['name'] ?? 'Free',
            ],
            'profile_limit' => $profile_limit,
            'display_limit' => $display_limit,
            'current_count' => $current_count,
            'is_unlimited' => $is_unlimited,
            'can_create' => $is_unlimited || $current_count < $profile_limit,
            'remaining_slots' => $is_unlimited ? -1 : max(0, $profile_limit - $current_count),
            'at_limit' => !$is_unlimited && $current_count >= $profile_limit,
            'upgrade_url' => self::get_upgrade_url(),
        ];
    }

    /**
     * Get upgrade URL for users at their limit
     *
     * @return string URL to upgrade page
     */
    public static function get_upgrade_url(): string {
        /**
         * Filter the upgrade URL
         *
         * @param string $url Default upgrade URL
         */
        return apply_filters('gmkb_profile_limits_upgrade_url', home_url('/pricing/'));
    }

    /**
     * Apply display limit to a profile array
     *
     * @param array    $profiles Array of profiles
     * @param int|null $user_id  User ID (defaults to current user)
     * @return array Limited array of profiles
     */
    public static function apply_display_limit(array $profiles, ?int $user_id = null): array {
        $limit = self::get_display_limit($user_id);

        if ($limit === -1 || $limit >= count($profiles)) {
            return $profiles;
        }

        return array_slice($profiles, 0, $limit);
    }

    /**
     * Check if user should see upgrade CTA
     *
     * @param int|null $user_id User ID (defaults to current user)
     * @return bool Whether to show upgrade CTA
     */
    public static function should_show_upgrade_cta(?int $user_id = null): bool {
        $tier = self::get_user_tier($user_id);

        // Don't show for unlimited users
        if (($tier['profile_limit'] ?? 1) === -1) {
            return false;
        }

        $current_count = self::get_profile_count($user_id);

        // Show upgrade CTA when at or above limit
        return $current_count >= ($tier['profile_limit'] ?? 1);
    }

    /**
     * Add or update a membership tier
     *
     * @param string $tier_key Unique tier key
     * @param array  $tier_data Tier configuration
     * @return bool Whether the save was successful
     */
    public static function update_tier(string $tier_key, array $tier_data): bool {
        $tiers = self::get_tiers();

        // Validate required fields
        if (!isset($tier_data['name']) || !isset($tier_data['profile_limit'])) {
            return false;
        }

        // Ensure numeric values
        $tier_data['profile_limit'] = (int) $tier_data['profile_limit'];
        $tier_data['display_limit'] = (int) ($tier_data['display_limit'] ?? $tier_data['profile_limit']);
        $tier_data['priority'] = (int) ($tier_data['priority'] ?? 0);

        // Ensure tags is an array
        if (!isset($tier_data['tags']) || !is_array($tier_data['tags'])) {
            $tier_data['tags'] = [];
        }

        $tiers[$tier_key] = $tier_data;

        return self::save_tiers($tiers);
    }

    /**
     * Delete a membership tier
     *
     * @param string $tier_key Tier key to delete
     * @return bool Whether the delete was successful
     */
    public static function delete_tier(string $tier_key): bool {
        // Prevent deletion of required tiers
        if (in_array($tier_key, ['unlimited', 'free'], true)) {
            return false;
        }

        $tiers = self::get_tiers();

        if (!isset($tiers[$tier_key])) {
            return false;
        }

        unset($tiers[$tier_key]);

        return self::save_tiers($tiers);
    }

    /**
     * Reset tiers to defaults
     *
     * @return bool Whether the reset was successful
     */
    public static function reset_to_defaults(): bool {
        return update_option(self::OPTION_KEY, self::DEFAULT_TIERS);
    }
}
