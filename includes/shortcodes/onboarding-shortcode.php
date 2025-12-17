<?php
/**
 * Onboarding Dashboard Shortcode
 *
 * Renders the Vue Onboarding gamification dashboard
 * showing progress, tasks, and rewards.
 *
 * Usage: [gmkb_onboarding]
 *
 * @package GMKB
 * @since 2.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register the onboarding shortcode
 */
function gmkb_register_onboarding_shortcode() {
    add_shortcode('gmkb_onboarding', 'gmkb_onboarding_shortcode_handler');
}
add_action('init', 'gmkb_register_onboarding_shortcode');

/**
 * Onboarding shortcode handler
 *
 * @param array $atts Shortcode attributes
 * @return string HTML output
 */
function gmkb_onboarding_shortcode_handler($atts) {
    // Parse attributes
    $atts = shortcode_atts([
        'show_rewards' => 'true',
        'compact' => 'false',
    ], $atts, 'gmkb_onboarding');

    // Check permissions
    if (!is_user_logged_in()) {
        return '<div class="gmkb-error">Please log in to view your progress</div>';
    }

    // Enqueue assets
    gmkb_enqueue_onboarding_assets();

    // Build container classes
    $classes = ['gmkb-onboarding-container'];
    if ($atts['compact'] === 'true') {
        $classes[] = 'gmkb-onboarding--compact';
    }

    // Build data attributes
    $data_attrs = sprintf(
        'data-show-rewards="%s"',
        esc_attr($atts['show_rewards'])
    );

    // Return mount element
    return sprintf(
        '<div id="gmkb-onboarding-app" class="%s" %s></div>',
        esc_attr(implode(' ', $classes)),
        $data_attrs
    );
}

/**
 * Enqueue onboarding assets
 */
function gmkb_enqueue_onboarding_assets() {
    $plugin_url = plugin_dir_url(dirname(dirname(__FILE__)));
    $plugin_path = plugin_dir_path(dirname(dirname(__FILE__)));
    $dist_path = $plugin_path . 'dist/onboarding/';

    // Check if built files exist
    $js_file = $dist_path . 'gmkb-onboarding.iife.js';
    $css_file = $dist_path . 'gmkb-onboarding.css';

    if (!file_exists($js_file)) {
        // Development mode - show error
        add_action('wp_footer', function() {
            echo '<script>console.error("GMKB Onboarding: Build files not found. Run: npm run build:onboarding");</script>';
        });
        return;
    }

    $version = filemtime($js_file);

    // Enqueue CSS
    if (file_exists($css_file)) {
        wp_enqueue_style(
            'gmkb-onboarding',
            $plugin_url . 'dist/onboarding/gmkb-onboarding.css',
            [],
            filemtime($css_file)
        );
    }

    // Enqueue JS
    wp_enqueue_script(
        'gmkb-onboarding',
        $plugin_url . 'dist/onboarding/gmkb-onboarding.iife.js',
        [],
        $version,
        true
    );

    // Pass data to JavaScript
    wp_localize_script('gmkb-onboarding', 'gmkbOnboardingData', [
        'nonce' => wp_create_nonce('wp_rest'),
        'apiUrl' => rest_url(),
        'userId' => get_current_user_id(),
        'isAdmin' => current_user_can('manage_options'),
    ]);
}

/**
 * Register the profile strength widget shortcode
 *
 * A compact version that shows just the profile strength ring.
 *
 * Usage: [gmkb_profile_strength profile_id="123"]
 */
function gmkb_register_profile_strength_shortcode() {
    add_shortcode('gmkb_profile_strength', 'gmkb_profile_strength_shortcode_handler');
}
add_action('init', 'gmkb_register_profile_strength_shortcode');

/**
 * Profile strength shortcode handler
 *
 * @param array $atts Shortcode attributes
 * @return string HTML output
 */
function gmkb_profile_strength_shortcode_handler($atts) {
    // Parse attributes
    $atts = shortcode_atts([
        'profile_id' => null,
        'size' => 'medium', // small, medium, large
    ], $atts, 'gmkb_profile_strength');

    // Check permissions
    if (!is_user_logged_in()) {
        return '';
    }

    // Get profile ID
    $profile_id = $atts['profile_id'] ? intval($atts['profile_id']) : null;

    // If no profile ID, try to get from current user
    if (!$profile_id) {
        // Get the best profile for the user
        if (class_exists('GMKB_Onboarding_Repository')) {
            $repo = new GMKB_Onboarding_Repository();
            $profile_id = $repo->get_best_profile_for_user(get_current_user_id());
        }
    }

    // Still no profile? Return empty
    if (!$profile_id) {
        return '';
    }

    // Calculate profile strength
    $strength = 0;
    if (class_exists('GMKB_Onboarding_Repository')) {
        $repo = new GMKB_Onboarding_Repository();
        $data = $repo->calculate_profile_strength($profile_id);
        $strength = $data['percentage'] ?? 0;
    }

    // Size classes
    $size_class = 'gmkb-profile-strength--' . esc_attr($atts['size']);

    // Render inline (no Vue needed for simple display)
    ob_start();
    ?>
    <div class="gmkb-profile-strength <?php echo $size_class; ?>">
        <div class="gmkb-profile-strength__ring"
             style="--progress: <?php echo esc_attr($strength); ?>%">
            <span class="gmkb-profile-strength__value"><?php echo esc_html($strength); ?>%</span>
        </div>
        <span class="gmkb-profile-strength__label">Profile Strength</span>
    </div>
    <style>
    .gmkb-profile-strength {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }
    .gmkb-profile-strength__ring {
        position: relative;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: conic-gradient(
            #14b8a6 0% var(--progress),
            #e2e8f0 var(--progress) 100%
        );
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .gmkb-profile-strength__ring::before {
        content: '';
        position: absolute;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: white;
    }
    .gmkb-profile-strength__value {
        position: relative;
        font-size: 18px;
        font-weight: 700;
        color: #1e293b;
    }
    .gmkb-profile-strength__label {
        font-size: 12px;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .gmkb-profile-strength--small .gmkb-profile-strength__ring {
        width: 48px;
        height: 48px;
    }
    .gmkb-profile-strength--small .gmkb-profile-strength__ring::before {
        width: 36px;
        height: 36px;
    }
    .gmkb-profile-strength--small .gmkb-profile-strength__value {
        font-size: 12px;
    }
    .gmkb-profile-strength--large .gmkb-profile-strength__ring {
        width: 120px;
        height: 120px;
    }
    .gmkb-profile-strength--large .gmkb-profile-strength__ring::before {
        width: 90px;
        height: 90px;
    }
    .gmkb-profile-strength--large .gmkb-profile-strength__value {
        font-size: 28px;
    }
    </style>
    <?php
    return ob_get_clean();
}
