<?php
/**
 * Media Kit Home Widget Shortcode
 *
 * Renders a compact widget for the Guestify Home Dashboard showing
 * profile completion status and quick actions.
 *
 * Usage: [gmkb_home_widget]
 *
 * @package GMKB
 * @since 2.3.0
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register the home widget shortcode
 */
function gmkb_register_home_widget_shortcode() {
    add_shortcode('gmkb_home_widget', 'gmkb_home_widget_handler');
}
add_action('init', 'gmkb_register_home_widget_shortcode');

/**
 * Home widget shortcode handler
 *
 * @param array $atts Shortcode attributes
 * @return string HTML output
 */
function gmkb_home_widget_handler($atts) {
    // Parse attributes
    $atts = shortcode_atts([
        'show_actions' => 'true',
        'compact' => 'false',
    ], $atts, 'gmkb_home_widget');

    // Check permissions
    if (!is_user_logged_in()) {
        return '<div class="gmkb-home-widget gmkb-home-widget--empty">Please log in to view your Media Kit</div>';
    }

    $user_id = get_current_user_id();

    // Get profile data
    $profile_data = gmkb_get_home_widget_data($user_id);

    // Build classes
    $classes = ['gmkb-home-widget'];
    if ($atts['compact'] === 'true') {
        $classes[] = 'gmkb-home-widget--compact';
    }

    ob_start();
    ?>
    <div class="<?php echo esc_attr(implode(' ', $classes)); ?>">
        <?php if ($profile_data['has_profile']): ?>
            <div class="gmkb-home-widget__header">
                <?php if (!empty($profile_data['headshot'])): ?>
                    <img src="<?php echo esc_url($profile_data['headshot']); ?>"
                         alt="<?php echo esc_attr($profile_data['name']); ?>"
                         class="gmkb-home-widget__avatar">
                <?php else: ?>
                    <div class="gmkb-home-widget__avatar gmkb-home-widget__avatar--initials">
                        <?php echo esc_html($profile_data['initials']); ?>
                    </div>
                <?php endif; ?>
                <div class="gmkb-home-widget__info">
                    <h4 class="gmkb-home-widget__name"><?php echo esc_html($profile_data['name']); ?></h4>
                    <p class="gmkb-home-widget__tagline"><?php echo esc_html($profile_data['tagline']); ?></p>
                </div>
            </div>

            <div class="gmkb-home-widget__progress">
                <div class="gmkb-home-widget__progress-bar">
                    <div class="gmkb-home-widget__progress-fill" style="width: <?php echo esc_attr($profile_data['completion']); ?>%"></div>
                </div>
                <span class="gmkb-home-widget__progress-text"><?php echo esc_html($profile_data['completion']); ?>% Complete</span>
            </div>

            <?php if ($atts['show_actions'] === 'true'): ?>
                <div class="gmkb-home-widget__actions">
                    <a href="<?php echo esc_url(home_url('/app/media-kit/')); ?>" class="gmkb-home-widget__btn gmkb-home-widget__btn--primary">
                        <i class="fa-solid fa-pen-to-square"></i>
                        Edit Profile
                    </a>
                    <?php if ($profile_data['completion'] >= 80): ?>
                        <a href="<?php echo esc_url($profile_data['public_url']); ?>" class="gmkb-home-widget__btn gmkb-home-widget__btn--secondary" target="_blank">
                            <i class="fa-solid fa-share-from-square"></i>
                            Share
                        </a>
                    <?php endif; ?>
                </div>
            <?php endif; ?>

        <?php else: ?>
            <div class="gmkb-home-widget__empty">
                <div class="gmkb-home-widget__empty-icon">
                    <i class="fa-solid fa-id-card"></i>
                </div>
                <h4>Create Your Media Kit</h4>
                <p>Build a professional guest profile to share with podcast hosts.</p>
                <a href="<?php echo esc_url(home_url('/app/media-kit/')); ?>" class="gmkb-home-widget__btn gmkb-home-widget__btn--primary">
                    <i class="fa-solid fa-plus"></i>
                    Get Started
                </a>
            </div>
        <?php endif; ?>
    </div>

    <style>
        .gmkb-home-widget {
            background: var(--gfy-surface, #fff);
            border-radius: var(--gfy-radius-lg, 12px);
            padding: var(--gfy-spacing-lg, 20px);
            border: 1px solid var(--gfy-border, #e2e8f0);
        }
        .gmkb-home-widget__header {
            display: flex;
            align-items: center;
            gap: var(--gfy-spacing-md, 12px);
            margin-bottom: var(--gfy-spacing-md, 12px);
        }
        .gmkb-home-widget__avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            object-fit: cover;
            flex-shrink: 0;
        }
        .gmkb-home-widget__avatar--initials {
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--gfy-primary, #0ea5e9);
            color: white;
            font-weight: 600;
            font-size: 18px;
        }
        .gmkb-home-widget__info {
            flex: 1;
            min-width: 0;
        }
        .gmkb-home-widget__name {
            font-size: 16px;
            font-weight: 600;
            color: var(--gfy-text-primary, #1e293b);
            margin: 0 0 2px 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .gmkb-home-widget__tagline {
            font-size: 13px;
            color: var(--gfy-text-secondary, #64748b);
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .gmkb-home-widget__progress {
            margin-bottom: var(--gfy-spacing-md, 12px);
        }
        .gmkb-home-widget__progress-bar {
            height: 6px;
            background: var(--gfy-bg-subtle, #f1f5f9);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 6px;
        }
        .gmkb-home-widget__progress-fill {
            height: 100%;
            background: var(--gfy-success, #10b981);
            border-radius: 3px;
            transition: width 0.3s ease;
        }
        .gmkb-home-widget__progress-text {
            font-size: 12px;
            color: var(--gfy-text-secondary, #64748b);
        }
        .gmkb-home-widget__actions {
            display: flex;
            gap: var(--gfy-spacing-sm, 8px);
        }
        .gmkb-home-widget__btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 8px 14px;
            font-size: 13px;
            font-weight: 500;
            border-radius: var(--gfy-radius-md, 8px);
            text-decoration: none;
            transition: all 0.15s ease;
            flex: 1;
        }
        .gmkb-home-widget__btn--primary {
            background: var(--gfy-primary, #0ea5e9);
            color: white;
        }
        .gmkb-home-widget__btn--primary:hover {
            background: var(--gfy-primary-hover, #0284c7);
            color: white;
        }
        .gmkb-home-widget__btn--secondary {
            background: var(--gfy-bg-subtle, #f1f5f9);
            color: var(--gfy-text-primary, #1e293b);
            border: 1px solid var(--gfy-border, #e2e8f0);
        }
        .gmkb-home-widget__btn--secondary:hover {
            background: var(--gfy-bg-hover, #e2e8f0);
            color: var(--gfy-text-primary, #1e293b);
        }
        .gmkb-home-widget__empty {
            text-align: center;
            padding: var(--gfy-spacing-md, 12px);
        }
        .gmkb-home-widget__empty-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: var(--gfy-bg-subtle, #f1f5f9);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto var(--gfy-spacing-md, 12px);
            color: var(--gfy-text-secondary, #64748b);
            font-size: 20px;
        }
        .gmkb-home-widget__empty h4 {
            font-size: 15px;
            font-weight: 600;
            color: var(--gfy-text-primary, #1e293b);
            margin: 0 0 6px 0;
        }
        .gmkb-home-widget__empty p {
            font-size: 13px;
            color: var(--gfy-text-secondary, #64748b);
            margin: 0 0 var(--gfy-spacing-md, 12px) 0;
        }
        .gmkb-home-widget--compact {
            padding: var(--gfy-spacing-md, 12px);
        }
        .gmkb-home-widget--compact .gmkb-home-widget__avatar {
            width: 36px;
            height: 36px;
            font-size: 14px;
        }
        .gmkb-home-widget--compact .gmkb-home-widget__name {
            font-size: 14px;
        }
    </style>
    <?php
    return ob_get_clean();
}

/**
 * Get profile data for home widget
 *
 * @param int $user_id
 * @return array
 */
function gmkb_get_home_widget_data($user_id) {
    $data = [
        'has_profile' => false,
        'name' => '',
        'initials' => '',
        'tagline' => 'Guest Expert',
        'headshot' => '',
        'completion' => 0,
        'public_url' => '',
    ];

    // Try to get profile using repository
    if (class_exists('GMKB_Onboarding_Repository')) {
        try {
            $repo = new GMKB_Onboarding_Repository();
            $profile_id = $repo->get_best_profile_for_user($user_id);

            if ($profile_id) {
                $data['has_profile'] = true;

                // Get profile details
                $profile = get_post($profile_id);
                if ($profile) {
                    $data['name'] = $profile->post_title ?: 'Guest Expert';
                    $data['initials'] = strtoupper(substr($data['name'], 0, 1));
                    $data['public_url'] = get_permalink($profile_id);
                }

                // Get meta data
                $tagline = get_post_meta($profile_id, 'gmkb_tagline', true);
                if ($tagline) {
                    $data['tagline'] = $tagline;
                }

                $headshot = get_post_meta($profile_id, 'gmkb_headshot', true);
                if ($headshot) {
                    $data['headshot'] = wp_get_attachment_url($headshot);
                }

                // Get completion percentage
                $strength = $repo->calculate_profile_strength($profile_id);
                $data['completion'] = $strength['percentage'] ?? 0;
            }
        } catch (Exception $e) {
            // Fallback to basic user data
        }
    }

    // Fallback to user data if no profile
    if (!$data['has_profile']) {
        $user = get_userdata($user_id);
        if ($user) {
            $data['name'] = $user->display_name;
            $data['initials'] = strtoupper(substr($user->display_name, 0, 1));
        }
    }

    return $data;
}
