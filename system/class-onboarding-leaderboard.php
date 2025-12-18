<?php
/**
 * Onboarding Leaderboard
 *
 * Displays top users ranked by onboarding progress.
 * Provides both a shortcode and REST API endpoint.
 *
 * Usage:
 * - Shortcode: [gmkb_leaderboard limit="10" show_avatars="true"]
 * - API: GET /gmkb/v2/onboarding/leaderboard
 *
 * @package GMKB
 * @since 2.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Onboarding_Leaderboard {

    /**
     * Default number of users to show
     */
    const DEFAULT_LIMIT = 10;

    /**
     * Cache duration in seconds (5 minutes)
     */
    const CACHE_DURATION = 300;

    /**
     * Initialize leaderboard
     */
    public static function init(): void {
        add_shortcode('gmkb_leaderboard', [__CLASS__, 'render_shortcode']);
        add_action('rest_api_init', [__CLASS__, 'register_routes']);
    }

    /**
     * Register REST API routes
     */
    public static function register_routes(): void {
        register_rest_route('gmkb/v2', '/onboarding/leaderboard', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'api_get_leaderboard'],
            'permission_callback' => '__return_true', // Public endpoint
            'args' => [
                'limit' => [
                    'default' => self::DEFAULT_LIMIT,
                    'sanitize_callback' => 'absint',
                ],
                'offset' => [
                    'default' => 0,
                    'sanitize_callback' => 'absint',
                ],
            ],
        ]);
    }

    /**
     * API endpoint handler
     *
     * @param WP_REST_Request $request Request object
     * @return WP_REST_Response
     */
    public static function api_get_leaderboard($request): WP_REST_Response {
        $limit = $request->get_param('limit');
        $offset = $request->get_param('offset');

        $data = self::get_leaderboard($limit, $offset);

        return new WP_REST_Response([
            'success' => true,
            'data' => $data,
        ], 200);
    }

    /**
     * Get leaderboard data
     *
     * @param int $limit Number of users to return
     * @param int $offset Offset for pagination
     * @return array Leaderboard data
     */
    public static function get_leaderboard(int $limit = 10, int $offset = 0): array {
        global $wpdb;

        // Try to get from cache
        $cache_key = 'gmkb_leaderboard_' . $limit . '_' . $offset;
        $cached = get_transient($cache_key);

        if ($cached !== false) {
            return $cached;
        }

        // Query users with progress, ordered by percentage
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT
                um.user_id,
                um.meta_value as progress_percent,
                u.display_name,
                u.user_email
             FROM {$wpdb->usermeta} um
             INNER JOIN {$wpdb->users} u ON um.user_id = u.ID
             WHERE um.meta_key = 'guestify_onboarding_progress_percent'
             AND um.meta_value > 0
             ORDER BY CAST(um.meta_value AS UNSIGNED) DESC, u.display_name ASC
             LIMIT %d OFFSET %d",
            $limit,
            $offset
        ), ARRAY_A);

        // Get total count for pagination
        $total = $wpdb->get_var(
            "SELECT COUNT(*)
             FROM {$wpdb->usermeta}
             WHERE meta_key = 'guestify_onboarding_progress_percent'
             AND meta_value > 0"
        );

        // Enrich with additional data
        $leaderboard = [];
        $rank = $offset + 1;

        foreach ($results as $row) {
            $user_id = (int) $row['user_id'];
            $percentage = (int) $row['progress_percent'];

            // Get user's best profile for avatar
            $profile_id = self::get_user_best_profile($user_id);
            $avatar_url = null;

            if ($profile_id) {
                $headshot = get_post_meta($profile_id, 'headshot_primary', true);
                if (is_array($headshot) && !empty($headshot['url'])) {
                    $avatar_url = $headshot['url'];
                }
            }

            // Fallback to Gravatar
            if (!$avatar_url) {
                $avatar_url = get_avatar_url($user_id, ['size' => 64]);
            }

            // Get points
            $points = self::get_user_points($user_id);

            $leaderboard[] = [
                'rank' => $rank,
                'user_id' => $user_id,
                'display_name' => $row['display_name'] ?: 'Anonymous',
                'avatar_url' => $avatar_url,
                'progress_percent' => $percentage,
                'points' => $points,
                'is_current_user' => is_user_logged_in() && get_current_user_id() === $user_id,
            ];

            $rank++;
        }

        $data = [
            'users' => $leaderboard,
            'total' => (int) $total,
            'limit' => $limit,
            'offset' => $offset,
            'has_more' => ($offset + $limit) < (int) $total,
        ];

        // Cache the results
        set_transient($cache_key, $data, self::CACHE_DURATION);

        return $data;
    }

    /**
     * Get current user's rank
     *
     * @param int $user_id User ID
     * @return int|null Rank or null if not ranked
     */
    public static function get_user_rank(int $user_id): ?int {
        global $wpdb;

        $user_progress = get_user_meta($user_id, 'guestify_onboarding_progress_percent', true);

        if (empty($user_progress)) {
            return null;
        }

        // Count users with higher progress
        $rank = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) + 1
             FROM {$wpdb->usermeta}
             WHERE meta_key = 'guestify_onboarding_progress_percent'
             AND CAST(meta_value AS UNSIGNED) > %d",
            (int) $user_progress
        ));

        return (int) $rank;
    }

    /**
     * Get user's best profile ID
     *
     * @param int $user_id User ID
     * @return int|null Profile ID
     */
    private static function get_user_best_profile(int $user_id): ?int {
        if (class_exists('GMKB_Onboarding_Repository')) {
            $repo = new GMKB_Onboarding_Repository();
            return $repo->get_best_profile_for_user($user_id);
        }

        // Fallback: get most recent profile
        $profiles = get_posts([
            'post_type' => 'guest_profile',
            'author' => $user_id,
            'post_status' => ['publish', 'draft', 'private'],
            'posts_per_page' => 1,
            'orderby' => 'modified',
            'order' => 'DESC',
            'fields' => 'ids',
        ]);

        return !empty($profiles) ? $profiles[0] : null;
    }

    /**
     * Get user's total points
     *
     * @param int $user_id User ID
     * @return int Points
     */
    private static function get_user_points(int $user_id): int {
        // Points = percentage (since max is 100)
        $percentage = (int) get_user_meta($user_id, 'guestify_onboarding_progress_percent', true);
        return $percentage;
    }

    /**
     * Enqueue leaderboard styles
     */
    private static function enqueue_styles(): void {
        $plugin_url = plugin_dir_url(dirname(__FILE__));
        $plugin_path = plugin_dir_path(dirname(__FILE__));
        $css_file = $plugin_path . 'dist/onboarding/gmkb-onboarding.css';

        if (file_exists($css_file)) {
            wp_enqueue_style(
                'gmkb-onboarding',
                $plugin_url . 'dist/onboarding/gmkb-onboarding.css',
                [],
                filemtime($css_file)
            );
        }
    }

    /**
     * Render leaderboard shortcode
     *
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public static function render_shortcode($atts): string {
        $atts = shortcode_atts([
            'limit' => self::DEFAULT_LIMIT,
            'show_avatars' => 'true',
            'show_points' => 'true',
            'highlight_current' => 'true',
            'title' => 'Leaderboard',
        ], $atts, 'gmkb_leaderboard');

        // Enqueue styles
        self::enqueue_styles();

        $limit = (int) $atts['limit'];
        $show_avatars = $atts['show_avatars'] === 'true';
        $show_points = $atts['show_points'] === 'true';
        $highlight_current = $atts['highlight_current'] === 'true';
        $title = sanitize_text_field($atts['title']);

        $data = self::get_leaderboard($limit);
        $current_user_id = get_current_user_id();
        $current_user_rank = $current_user_id ? self::get_user_rank($current_user_id) : null;

        ob_start();
        ?>
        <div class="gmkb-leaderboard">
            <?php if ($title): ?>
                <h3 class="gmkb-leaderboard__title"><?php echo esc_html($title); ?></h3>
            <?php endif; ?>

            <?php if (empty($data['users'])): ?>
                <p class="gmkb-leaderboard__empty">No users on the leaderboard yet. Be the first!</p>
            <?php else: ?>
                <div class="gmkb-leaderboard__list">
                    <?php foreach ($data['users'] as $user): ?>
                        <div class="gmkb-leaderboard__item <?php echo $user['is_current_user'] && $highlight_current ? 'gmkb-leaderboard__item--current' : ''; ?>">
                            <span class="gmkb-leaderboard__rank <?php echo self::get_rank_class($user['rank']); ?>">
                                <?php echo esc_html($user['rank']); ?>
                            </span>

                            <?php if ($show_avatars): ?>
                                <img
                                    class="gmkb-leaderboard__avatar"
                                    src="<?php echo esc_url($user['avatar_url']); ?>"
                                    alt="<?php echo esc_attr($user['display_name']); ?>"
                                    loading="lazy"
                                />
                            <?php endif; ?>

                            <span class="gmkb-leaderboard__name">
                                <?php echo esc_html($user['display_name']); ?>
                                <?php if ($user['is_current_user']): ?>
                                    <span class="gmkb-leaderboard__you">(You)</span>
                                <?php endif; ?>
                            </span>

                            <span class="gmkb-leaderboard__progress">
                                <span class="gmkb-leaderboard__progress-bar">
                                    <span class="gmkb-leaderboard__progress-fill" style="width: <?php echo esc_attr($user['progress_percent']); ?>%"></span>
                                </span>
                                <span class="gmkb-leaderboard__progress-text"><?php echo esc_html($user['progress_percent']); ?>%</span>
                            </span>

                            <?php if ($show_points): ?>
                                <span class="gmkb-leaderboard__points">
                                    <?php echo esc_html($user['points']); ?> pts
                                </span>
                            <?php endif; ?>
                        </div>
                    <?php endforeach; ?>
                </div>

                <?php if ($current_user_id && $current_user_rank && $current_user_rank > $limit): ?>
                    <div class="gmkb-leaderboard__current-rank">
                        Your rank: <strong>#<?php echo esc_html($current_user_rank); ?></strong>
                    </div>
                <?php endif; ?>
            <?php endif; ?>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Get CSS class for rank badge
     *
     * @param int $rank Rank number
     * @return string CSS class
     */
    private static function get_rank_class(int $rank): string {
        switch ($rank) {
            case 1:
                return 'gmkb-leaderboard__rank--gold';
            case 2:
                return 'gmkb-leaderboard__rank--silver';
            case 3:
                return 'gmkb-leaderboard__rank--bronze';
            default:
                return '';
        }
    }

    /**
     * Clear leaderboard cache
     */
    public static function clear_cache(): void {
        global $wpdb;

        // Delete all leaderboard transients
        $wpdb->query(
            "DELETE FROM {$wpdb->options}
             WHERE option_name LIKE '_transient_gmkb_leaderboard_%'
             OR option_name LIKE '_transient_timeout_gmkb_leaderboard_%'"
        );
    }
}

// Initialize leaderboard
add_action('init', ['GMKB_Onboarding_Leaderboard', 'init']);

// Clear cache when progress is updated
add_action('gmkb_onboarding_progress_updated', ['GMKB_Onboarding_Leaderboard', 'clear_cache']);
