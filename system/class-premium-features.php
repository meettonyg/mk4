<?php
/**
 * Premium Features Gating System
 *
 * Provides a centralized way to check if premium features are enabled
 * for a given user or profile. This is the single source of truth for
 * feature availability.
 *
 * @package GMKB
 * @since 2.3.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Premium_Features {

    /**
     * Feature constants
     */
    const FEATURE_SCHEMA_SEO = 'schema_seo';
    const FEATURE_SCHEMA_FAQ = 'schema_faq';
    const FEATURE_SCHEMA_SPEAKABLE = 'schema_speakable';
    const FEATURE_AEO_OPTIMIZATION = 'aeo_optimization';
    const FEATURE_CUSTOM_SEO_META = 'custom_seo_meta';
    const FEATURE_ADVANCED_ANALYTICS = 'advanced_analytics';

    /**
     * Tier constants
     */
    const TIER_FREE = 'free';
    const TIER_PRO = 'pro';
    const TIER_ENTERPRISE = 'enterprise';

    /**
     * Features available per tier
     *
     * @var array
     */
    const TIER_FEATURES = [
        self::TIER_FREE => [],
        self::TIER_PRO => [
            self::FEATURE_SCHEMA_SEO,
            self::FEATURE_SCHEMA_FAQ,
            self::FEATURE_SCHEMA_SPEAKABLE,
            self::FEATURE_AEO_OPTIMIZATION,
            self::FEATURE_CUSTOM_SEO_META,
        ],
        self::TIER_ENTERPRISE => [
            self::FEATURE_SCHEMA_SEO,
            self::FEATURE_SCHEMA_FAQ,
            self::FEATURE_SCHEMA_SPEAKABLE,
            self::FEATURE_AEO_OPTIMIZATION,
            self::FEATURE_CUSTOM_SEO_META,
            self::FEATURE_ADVANCED_ANALYTICS,
        ],
    ];

    /**
     * Feature metadata (labels, descriptions, icons)
     *
     * @var array
     */
    const FEATURE_META = [
        self::FEATURE_SCHEMA_SEO => [
            'label' => 'Schema.org SEO Markup',
            'description' => 'Add structured data to help search engines understand your profile',
            'icon' => 'code',
            'min_tier' => self::TIER_PRO,
        ],
        self::FEATURE_SCHEMA_FAQ => [
            'label' => 'FAQ Schema',
            'description' => 'Convert interview questions to FAQ rich snippets',
            'icon' => 'help-circle',
            'min_tier' => self::TIER_PRO,
        ],
        self::FEATURE_SCHEMA_SPEAKABLE => [
            'label' => 'Voice Search Optimization',
            'description' => 'Optimize for voice assistants and AI answers',
            'icon' => 'mic',
            'min_tier' => self::TIER_PRO,
        ],
        self::FEATURE_AEO_OPTIMIZATION => [
            'label' => 'AEO Score & Recommendations',
            'description' => 'Get AI visibility score and optimization tips',
            'icon' => 'trending-up',
            'min_tier' => self::TIER_PRO,
        ],
        self::FEATURE_CUSTOM_SEO_META => [
            'label' => 'Custom SEO Meta Tags',
            'description' => 'Override default title and description',
            'icon' => 'edit',
            'min_tier' => self::TIER_PRO,
        ],
        self::FEATURE_ADVANCED_ANALYTICS => [
            'label' => 'Advanced Analytics',
            'description' => 'Track profile views, clicks, and engagement',
            'icon' => 'bar-chart-2',
            'min_tier' => self::TIER_ENTERPRISE,
        ],
    ];

    /**
     * Check if a feature is enabled for a user
     *
     * @param string   $feature Feature constant
     * @param int|null $user_id User ID (defaults to current user)
     * @return bool Whether the feature is enabled
     */
    public static function is_enabled(string $feature, ?int $user_id = null): bool {
        if ($user_id === null) {
            $user_id = get_current_user_id();
        }

        // Allow admins to access all features
        if (user_can($user_id, 'manage_options')) {
            return true;
        }

        // Get user's tier
        $tier = self::get_user_tier($user_id);

        // Check if feature is available in tier
        $tier_features = self::TIER_FEATURES[$tier] ?? [];
        $has_feature = in_array($feature, $tier_features, true);

        /**
         * Filter whether a premium feature is enabled for a user
         *
         * @param bool   $has_feature Whether the feature is enabled
         * @param string $feature     The feature being checked
         * @param int    $user_id     The user ID
         * @param string $tier        The user's tier
         */
        return apply_filters("gmkb_premium_feature_{$feature}", $has_feature, $feature, $user_id, $tier);
    }

    /**
     * Check if a feature is enabled for a specific profile
     *
     * @param string $feature  Feature constant
     * @param int    $post_id  Profile post ID
     * @return bool Whether the feature is enabled
     */
    public static function is_enabled_for_profile(string $feature, int $post_id): bool {
        // Get profile owner
        $owner_id = get_post_meta($post_id, 'owner_user_id', true);

        if (!$owner_id) {
            $post = get_post($post_id);
            $owner_id = $post ? $post->post_author : 0;
        }

        if (!$owner_id) {
            return false;
        }

        // Check if feature is enabled for the owner
        if (!self::is_enabled($feature, (int) $owner_id)) {
            return false;
        }

        // Check if the user has enabled this specific feature for this profile
        $enabled_features = get_post_meta($post_id, 'seo_enabled_features', true);

        if (!is_array($enabled_features)) {
            // Default: enable basic schema if user has access
            return in_array($feature, [self::FEATURE_SCHEMA_SEO, self::FEATURE_AEO_OPTIMIZATION], true);
        }

        return in_array($feature, $enabled_features, true);
    }

    /**
     * Get a user's subscription tier
     *
     * @param int|null $user_id User ID (defaults to current user)
     * @return string Tier constant (free, pro, enterprise)
     */
    public static function get_user_tier(?int $user_id = null): string {
        if ($user_id === null) {
            $user_id = get_current_user_id();
        }

        if (!$user_id) {
            return self::TIER_FREE;
        }

        // Check for admin override
        if (user_can($user_id, 'manage_options')) {
            return self::TIER_ENTERPRISE;
        }

        // Check user meta for tier
        $tier = get_user_meta($user_id, 'gmkb_subscription_tier', true);

        if ($tier && in_array($tier, [self::TIER_FREE, self::TIER_PRO, self::TIER_ENTERPRISE], true)) {
            return $tier;
        }

        /**
         * Filter to determine user tier from external sources
         * (e.g., WooCommerce Subscriptions, Stripe, etc.)
         *
         * @param string $tier    Current tier
         * @param int    $user_id User ID
         */
        $tier = apply_filters('gmkb_user_subscription_tier', self::TIER_FREE, $user_id);

        return $tier;
    }

    /**
     * Set a user's subscription tier
     *
     * @param int    $user_id User ID
     * @param string $tier    Tier constant
     * @return bool Whether the update was successful
     */
    public static function set_user_tier(int $user_id, string $tier): bool {
        if (!in_array($tier, [self::TIER_FREE, self::TIER_PRO, self::TIER_ENTERPRISE], true)) {
            return false;
        }

        return (bool) update_user_meta($user_id, 'gmkb_subscription_tier', $tier);
    }

    /**
     * Get all features available in a tier
     *
     * @param string $tier Tier constant
     * @return array Array of feature constants
     */
    public static function get_tier_features(string $tier): array {
        return self::TIER_FEATURES[$tier] ?? [];
    }

    /**
     * Get feature metadata
     *
     * @param string $feature Feature constant
     * @return array|null Feature metadata or null if not found
     */
    public static function get_feature_meta(string $feature): ?array {
        return self::FEATURE_META[$feature] ?? null;
    }

    /**
     * Get all features with their metadata and availability for a user
     *
     * @param int|null $user_id User ID (defaults to current user)
     * @return array Array of features with metadata and enabled status
     */
    public static function get_features_for_user(?int $user_id = null): array {
        $features = [];
        $user_tier = self::get_user_tier($user_id);

        foreach (self::FEATURE_META as $feature => $meta) {
            $features[$feature] = array_merge($meta, [
                'key' => $feature,
                'enabled' => self::is_enabled($feature, $user_id),
                'user_tier' => $user_tier,
                'requires_upgrade' => !self::is_enabled($feature, $user_id),
            ]);
        }

        return $features;
    }

    /**
     * Check if user needs to upgrade to access a feature
     *
     * @param string   $feature Feature constant
     * @param int|null $user_id User ID (defaults to current user)
     * @return bool Whether an upgrade is needed
     */
    public static function needs_upgrade(string $feature, ?int $user_id = null): bool {
        return !self::is_enabled($feature, $user_id);
    }

    /**
     * Get the minimum tier required for a feature
     *
     * @param string $feature Feature constant
     * @return string Tier constant
     */
    public static function get_required_tier(string $feature): string {
        $meta = self::get_feature_meta($feature);
        return $meta['min_tier'] ?? self::TIER_PRO;
    }

    /**
     * Get upgrade URL for premium features
     *
     * @return string URL to upgrade page
     */
    public static function get_upgrade_url(): string {
        /**
         * Filter the upgrade URL
         *
         * @param string $url Default upgrade URL
         */
        return apply_filters('gmkb_premium_upgrade_url', home_url('/pricing/'));
    }

    /**
     * Get all SEO-related features
     *
     * @return array Array of SEO feature constants
     */
    public static function get_seo_features(): array {
        return [
            self::FEATURE_SCHEMA_SEO,
            self::FEATURE_SCHEMA_FAQ,
            self::FEATURE_SCHEMA_SPEAKABLE,
            self::FEATURE_AEO_OPTIMIZATION,
            self::FEATURE_CUSTOM_SEO_META,
        ];
    }
}
