<?php
/**
 * Profile Limits Admin Page
 *
 * Admin interface for managing membership tiers and profile limits.
 *
 * @package GMKB
 * @since 2.4.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Profile_Limits_Admin {

    /**
     * Initialize admin hooks
     */
    public static function init(): void {
        add_action('admin_menu', [__CLASS__, 'register_admin_menu']);
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueue_admin_scripts']);
    }

    /**
     * Register admin menu item
     */
    public static function register_admin_menu(): void {
        add_submenu_page(
            'edit.php?post_type=guests',         // Parent slug (under Guests post type)
            'Profile Limits',                    // Page title
            'Profile Limits',                    // Menu title
            'manage_options',                    // Capability
            'gmkb-profile-limits',               // Menu slug
            [__CLASS__, 'render_admin_page']     // Callback
        );
    }

    /**
     * Enqueue admin scripts and styles
     *
     * @param string $hook_suffix The current admin page hook
     */
    public static function enqueue_admin_scripts(string $hook_suffix): void {
        // Only load on our admin page
        if ($hook_suffix !== 'guests_page_gmkb-profile-limits') {
            return;
        }

        $plugin_url = plugin_dir_url(dirname(dirname(__FILE__)));
        $plugin_path = plugin_dir_path(dirname(dirname(__FILE__)));
        $dist_path = $plugin_path . 'dist/profile-limits-admin/';

        // Check if built files exist
        $js_file = $dist_path . 'gmkb-profile-limits-admin.iife.js';
        $css_file = $dist_path . 'gmkb-profile-limits-admin.css';

        if (file_exists($js_file)) {
            $version = filemtime($js_file);

            // Enqueue CSS
            if (file_exists($css_file)) {
                wp_enqueue_style(
                    'gmkb-profile-limits-admin',
                    $plugin_url . 'dist/profile-limits-admin/gmkb-profile-limits-admin.css',
                    [],
                    filemtime($css_file)
                );
            }

            // Enqueue JS
            wp_enqueue_script(
                'gmkb-profile-limits-admin',
                $plugin_url . 'dist/profile-limits-admin/gmkb-profile-limits-admin.iife.js',
                [],
                $version,
                true
            );

            // Pass data to JavaScript
            wp_localize_script('gmkb-profile-limits-admin', 'gmkbProfileLimitsData', [
                'nonce' => wp_create_nonce('wp_rest'),
                'apiUrl' => rest_url(),
                'isAdmin' => current_user_can('manage_options'),
                'tiers' => GMKB_Profile_Limits::get_tiers(),
                'defaultTiers' => GMKB_Profile_Limits::DEFAULT_TIERS,
            ]);
        }

        // Also enqueue inline styles for the page
        wp_add_inline_style('common', self::get_inline_styles());
    }

    /**
     * Get inline styles for admin page
     */
    private static function get_inline_styles(): string {
        return '
            .gmkb-profile-limits-wrap {
                max-width: 1200px;
            }
            .gmkb-stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
                margin-bottom: 24px;
            }
            .gmkb-stat-card {
                background: #fff;
                border: 1px solid #c3c4c7;
                border-radius: 4px;
                padding: 20px;
                text-align: center;
            }
            .gmkb-stat-value {
                display: block;
                font-size: 32px;
                font-weight: 600;
                color: #1d2327;
                line-height: 1.2;
            }
            .gmkb-stat-label {
                display: block;
                font-size: 13px;
                color: #646970;
                margin-top: 4px;
            }
            .gmkb-tier-table {
                width: 100%;
                border-collapse: collapse;
                background: #fff;
                margin-bottom: 20px;
            }
            .gmkb-tier-table th,
            .gmkb-tier-table td {
                padding: 12px 15px;
                text-align: left;
                border-bottom: 1px solid #c3c4c7;
            }
            .gmkb-tier-table th {
                background: #f0f0f1;
                font-weight: 600;
            }
            .gmkb-tier-table tr:hover td {
                background: #f6f7f7;
            }
            .gmkb-tag-list {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
            }
            .gmkb-tag {
                background: #ddd;
                padding: 2px 8px;
                border-radius: 3px;
                font-size: 12px;
            }
            .gmkb-tier-unlimited {
                color: #0073aa;
                font-weight: 600;
            }
            .gmkb-section {
                background: #fff;
                border: 1px solid #c3c4c7;
                border-radius: 4px;
                padding: 20px;
                margin-bottom: 20px;
            }
            .gmkb-section h2 {
                margin-top: 0;
                padding-bottom: 10px;
                border-bottom: 1px solid #c3c4c7;
            }
        ';
    }

    /**
     * Render the admin page
     */
    public static function render_admin_page(): void {
        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_die('You do not have sufficient permissions to access this page.');
        }

        // Get statistics
        $stats = self::get_limit_stats();
        $tiers = GMKB_Profile_Limits::get_tiers();

        ?>
        <div class="wrap gmkb-profile-limits-wrap">
            <h1>Profile Limits Settings</h1>
            <p>Configure membership tiers and profile limits. These settings control how many guest profiles users can create based on their membership level (WP Fusion tags from HighLevel).</p>

            <!-- Statistics Overview -->
            <div class="gmkb-section">
                <h2>Usage Statistics</h2>
                <div class="gmkb-stats-grid">
                    <div class="gmkb-stat-card">
                        <span class="gmkb-stat-value"><?php echo esc_html($stats['total_users']); ?></span>
                        <span class="gmkb-stat-label">Total Users with Profiles</span>
                    </div>
                    <div class="gmkb-stat-card">
                        <span class="gmkb-stat-value"><?php echo esc_html($stats['total_profiles']); ?></span>
                        <span class="gmkb-stat-label">Total Profiles</span>
                    </div>
                    <div class="gmkb-stat-card">
                        <span class="gmkb-stat-value"><?php echo esc_html(round($stats['avg_profiles_per_user'], 1)); ?></span>
                        <span class="gmkb-stat-label">Avg Profiles per User</span>
                    </div>
                    <div class="gmkb-stat-card">
                        <span class="gmkb-stat-value"><?php echo esc_html($stats['users_at_limit']); ?></span>
                        <span class="gmkb-stat-label">Users at Limit</span>
                    </div>
                </div>
            </div>

            <!-- Current Tier Configuration -->
            <div class="gmkb-section">
                <h2>Membership Tiers</h2>
                <p>Tiers are matched in priority order. When a user has multiple matching tags, the tier with the highest priority is used.</p>

                <table class="gmkb-tier-table widefat">
                    <thead>
                        <tr>
                            <th>Priority</th>
                            <th>Tier Name</th>
                            <th>WP Fusion Tags</th>
                            <th>Profile Limit</th>
                            <th>Display Limit</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        // Sort tiers by priority (highest first)
                        uasort($tiers, function($a, $b) {
                            return ($b['priority'] ?? 0) - ($a['priority'] ?? 0);
                        });

                        foreach ($tiers as $key => $tier):
                        ?>
                        <tr>
                            <td><?php echo esc_html($tier['priority'] ?? 0); ?></td>
                            <td><strong><?php echo esc_html($tier['name']); ?></strong></td>
                            <td>
                                <?php if (!empty($tier['tags'])): ?>
                                <div class="gmkb-tag-list">
                                    <?php foreach ($tier['tags'] as $tag): ?>
                                    <span class="gmkb-tag"><?php echo esc_html($tag); ?></span>
                                    <?php endforeach; ?>
                                </div>
                                <?php else: ?>
                                <em>Default (no tags required)</em>
                                <?php endif; ?>
                            </td>
                            <td>
                                <?php if (($tier['profile_limit'] ?? 1) === -1): ?>
                                <span class="gmkb-tier-unlimited">Unlimited</span>
                                <?php else: ?>
                                <?php echo esc_html($tier['profile_limit'] ?? 1); ?>
                                <?php endif; ?>
                            </td>
                            <td>
                                <?php if (($tier['display_limit'] ?? 1) === -1): ?>
                                <span class="gmkb-tier-unlimited">Unlimited</span>
                                <?php else: ?>
                                <?php echo esc_html($tier['display_limit'] ?? 1); ?>
                                <?php endif; ?>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <!-- Vue App Mount Point -->
            <div class="gmkb-section">
                <h2>Manage Tiers</h2>
                <div id="gmkb-profile-limits-admin-app">
                    <!-- Vue app mounts here -->
                    <p class="loading-message">Loading tier manager...</p>
                </div>
            </div>

            <!-- WP Fusion Integration Notes -->
            <div class="gmkb-section">
                <h2>WP Fusion Integration</h2>
                <p>This system integrates with WP Fusion to read user membership tags from HighLevel CRM. Tags are matched exactly as shown above.</p>
                <h4>Current Tag Mappings</h4>
                <ul>
                    <li><strong>Unlimited:</strong> <code>mem: guestify pos unlimited</code></li>
                    <li><strong>Zenith (3 profiles):</strong> <code>mem: guestify zenith</code>, <code>mem: guestify zenith trial</code></li>
                    <li><strong>Velocity (2 profiles):</strong> <code>mem: guestify velocity</code>, <code>mem: guestify velocity trial</code></li>
                    <li><strong>Accelerator (1 profile):</strong> <code>mem: guestify accel</code>, <code>mem: guestify accel trial</code>, <code>mem: guestify pos free</code></li>
                    <li><strong>Free (1 profile):</strong> Default tier when no matching tags</li>
                </ul>
            </div>
        </div>
        <?php
    }

    /**
     * Get profile limit statistics
     *
     * @return array Statistics data
     */
    private static function get_limit_stats(): array {
        global $wpdb;

        // Total users with profiles
        $total_users = $wpdb->get_var(
            "SELECT COUNT(DISTINCT COALESCE(pm.meta_value, p.post_author))
             FROM {$wpdb->posts} p
             LEFT JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id AND pm.meta_key = 'owner_user_id'
             WHERE p.post_type = 'guests'
             AND p.post_status IN ('publish', 'draft', 'private')"
        );

        // Total profiles
        $total_profiles = $wpdb->get_var(
            "SELECT COUNT(*)
             FROM {$wpdb->posts}
             WHERE post_type = 'guests'
             AND post_status IN ('publish', 'draft', 'private')"
        );

        // Average profiles per user
        $avg_profiles = $total_users > 0 ? $total_profiles / $total_users : 0;

        // Users at their limit (this is approximate - would need more complex query)
        $users_at_limit = 0;

        return [
            'total_users' => (int) $total_users,
            'total_profiles' => (int) $total_profiles,
            'avg_profiles_per_user' => (float) $avg_profiles,
            'users_at_limit' => (int) $users_at_limit,
        ];
    }
}

// Initialize admin
GMKB_Profile_Limits_Admin::init();
