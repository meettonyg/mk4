<?php
/**
 * Onboarding Admin Page
 *
 * Admin interface for managing onboarding rewards and viewing stats.
 *
 * @package GMKB
 * @since 2.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Onboarding_Admin {

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
            'edit.php?post_type=guest_profile', // Parent slug (under Guest Profiles)
            'Onboarding Settings',               // Page title
            'Onboarding',                        // Menu title
            'manage_options',                    // Capability
            'gmkb-onboarding',                   // Menu slug
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
        if ($hook_suffix !== 'guest_profile_page_gmkb-onboarding') {
            return;
        }

        $plugin_url = plugin_dir_url(dirname(dirname(__FILE__)));
        $plugin_path = plugin_dir_path(dirname(dirname(__FILE__)));
        $dist_path = $plugin_path . 'dist/onboarding-admin/';

        // Check if built files exist
        $js_file = $dist_path . 'gmkb-onboarding-admin.iife.js';
        $css_file = $dist_path . 'gmkb-onboarding-admin.css';

        if (file_exists($js_file)) {
            $version = filemtime($js_file);

            // Enqueue CSS
            if (file_exists($css_file)) {
                wp_enqueue_style(
                    'gmkb-onboarding-admin',
                    $plugin_url . 'dist/onboarding-admin/gmkb-onboarding-admin.css',
                    [],
                    filemtime($css_file)
                );
            }

            // Enqueue JS
            wp_enqueue_script(
                'gmkb-onboarding-admin',
                $plugin_url . 'dist/onboarding-admin/gmkb-onboarding-admin.iife.js',
                [],
                $version,
                true
            );

            // Pass data to JavaScript
            wp_localize_script('gmkb-onboarding-admin', 'gmkbAdminData', [
                'nonce' => wp_create_nonce('wp_rest'),
                'apiUrl' => rest_url(),
                'isAdmin' => current_user_can('manage_options'),
            ]);
        }
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
        $stats = self::get_onboarding_stats();

        ?>
        <div class="wrap">
            <h1>Onboarding Settings</h1>

            <!-- Statistics Overview -->
            <div class="gmkb-onboarding-stats">
                <h2>Statistics Overview</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="stat-value"><?php echo esc_html($stats['total_users']); ?></span>
                        <span class="stat-label">Total Users</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value"><?php echo esc_html(round($stats['avg_progress'], 1)); ?>%</span>
                        <span class="stat-label">Avg Progress</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value"><?php echo esc_html($stats['completed_users']); ?></span>
                        <span class="stat-label">Completed (100%)</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value"><?php echo esc_html($stats['active_users']); ?></span>
                        <span class="stat-label">Active (>50%)</span>
                    </div>
                </div>
            </div>

            <!-- Rewards Manager (Vue App) -->
            <div class="gmkb-onboarding-rewards">
                <div id="gmkb-onboarding-admin-app">
                    <!-- Vue app mounts here -->
                    <p class="loading-message">Loading rewards manager...</p>
                </div>
            </div>

            <!-- WP-CLI Commands Reference -->
            <div class="gmkb-onboarding-cli">
                <h2>WP-CLI Commands</h2>
                <p>Use these commands to manage onboarding data:</p>
                <table class="widefat">
                    <thead>
                        <tr>
                            <th>Command</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><code>wp gmkb onboarding stats</code></td>
                            <td>View onboarding progress statistics</td>
                        </tr>
                        <tr>
                            <td><code>wp gmkb onboarding migrate</code></td>
                            <td>Recalculate progress for all users</td>
                        </tr>
                        <tr>
                            <td><code>wp gmkb onboarding migrate --dry-run</code></td>
                            <td>Preview migration without making changes</td>
                        </tr>
                        <tr>
                            <td><code>wp gmkb onboarding recalculate &lt;user_id&gt;</code></td>
                            <td>Recalculate progress for a specific user</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <style>
            .gmkb-onboarding-stats,
            .gmkb-onboarding-rewards,
            .gmkb-onboarding-cli {
                margin: 20px 0;
                padding: 20px;
                background: white;
                border: 1px solid #c3c4c7;
                border-radius: 4px;
            }

            .gmkb-onboarding-stats h2,
            .gmkb-onboarding-rewards h2,
            .gmkb-onboarding-cli h2 {
                margin-top: 0;
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 16px;
            }

            .stat-card {
                background: #f9f9f9;
                padding: 20px;
                border-radius: 4px;
                text-align: center;
                border: 1px solid #e0e0e0;
            }

            .stat-value {
                display: block;
                font-size: 32px;
                font-weight: 600;
                color: #2271b1;
                line-height: 1.2;
            }

            .stat-label {
                display: block;
                font-size: 12px;
                color: #646970;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-top: 4px;
            }

            .loading-message {
                padding: 40px;
                text-align: center;
                color: #646970;
            }

            .gmkb-onboarding-cli code {
                background: #f1f1f1;
                padding: 2px 6px;
                border-radius: 3px;
            }
        </style>
        <?php
    }

    /**
     * Get onboarding statistics
     *
     * @return array Statistics data
     */
    private static function get_onboarding_stats(): array {
        global $wpdb;

        // Total users with profiles
        $total_users = $wpdb->get_var(
            "SELECT COUNT(DISTINCT post_author)
             FROM {$wpdb->posts}
             WHERE post_type = 'guest_profile'
             AND post_status IN ('publish', 'draft', 'private')
             AND post_author > 0"
        );

        // Average progress
        $avg_progress = $wpdb->get_var(
            "SELECT AVG(CAST(meta_value AS UNSIGNED))
             FROM {$wpdb->usermeta}
             WHERE meta_key = 'guestify_onboarding_progress_percent'"
        );

        // Completed users (100%)
        $completed_users = $wpdb->get_var(
            "SELECT COUNT(*)
             FROM {$wpdb->usermeta}
             WHERE meta_key = 'guestify_onboarding_progress_percent'
             AND CAST(meta_value AS UNSIGNED) = 100"
        );

        // Active users (>50%)
        $active_users = $wpdb->get_var(
            "SELECT COUNT(*)
             FROM {$wpdb->usermeta}
             WHERE meta_key = 'guestify_onboarding_progress_percent'
             AND CAST(meta_value AS UNSIGNED) > 50"
        );

        return [
            'total_users' => (int) $total_users,
            'avg_progress' => (float) ($avg_progress ?? 0),
            'completed_users' => (int) $completed_users,
            'active_users' => (int) $active_users,
        ];
    }
}

// Initialize admin
add_action('admin_init', ['GMKB_Onboarding_Admin', 'init']);
