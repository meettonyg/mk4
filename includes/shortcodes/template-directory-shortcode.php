<?php
/**
 * Template Directory Shortcode
 *
 * Displays the media kit template directory grid.
 * Usage: [gmkb_templates] or [gmkb_templates category="corporate" columns="3"]
 *
 * Attributes:
 * - category: Filter by category (corporate, creative, minimal, portfolio)
 * - columns: Number of columns (2, 3, 4) - default 3
 * - show_cta: Show call-to-action button (true/false) - default true
 * - limit: Maximum templates to show (-1 for all) - default -1
 *
 * @package GMKB
 * @subpackage Shortcodes
 * @since 2.4.0
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register template directory shortcode
 */
function gmkb_register_template_directory_shortcode() {
    add_shortcode('gmkb_templates', 'gmkb_template_directory_shortcode');
}
add_action('init', 'gmkb_register_template_directory_shortcode');

/**
 * Template directory shortcode callback
 *
 * @param array $atts Shortcode attributes
 * @return string HTML output
 */
function gmkb_template_directory_shortcode($atts) {
    $atts = shortcode_atts(array(
        'category' => '',
        'columns'  => 3,
        'show_cta' => 'true',
        'limit'    => -1,
        'class'    => '',
    ), $atts, 'gmkb_templates');

    // Load ThemeDiscovery
    if (!class_exists('ThemeDiscovery')) {
        $discovery_path = GMKB_PLUGIN_DIR . 'system/ThemeDiscovery.php';
        if (file_exists($discovery_path)) {
            require_once $discovery_path;
        } else {
            return '<p class="gmkb-error">Template discovery not available.</p>';
        }
    }

    $discovery = new ThemeDiscovery(GMKB_PLUGIN_DIR . 'themes');
    $templates = $discovery->getThemes();

    if (empty($templates)) {
        return '<p class="gmkb-no-templates">No templates available.</p>';
    }

    // Filter by category if specified
    $category = sanitize_text_field($atts['category']);
    if (!empty($category)) {
        $templates = array_filter($templates, function($template) use ($category) {
            return isset($template['category']) && $template['category'] === $category;
        });
    }

    // Limit templates
    $limit = intval($atts['limit']);
    if ($limit > 0) {
        $templates = array_slice($templates, 0, $limit, true);
    }

    // Column classes
    $columns = intval($atts['columns']);
    $columns = max(1, min(4, $columns)); // Clamp to 1-4

    $show_cta = filter_var($atts['show_cta'], FILTER_VALIDATE_BOOLEAN);
    $extra_class = sanitize_html_class($atts['class']);

    // Generate unique ID for this instance
    $instance_id = 'gmkb-templates-' . wp_rand(1000, 9999);

    ob_start();
    ?>
    <div id="<?php echo esc_attr($instance_id); ?>" class="gmkb-templates-shortcode <?php echo esc_attr($extra_class); ?>">
        <div class="gmkb-templates-grid gmkb-cols-<?php echo esc_attr($columns); ?>">
            <?php foreach ($templates as $slug => $template) : ?>
            <article class="gmkb-template-card">
                <a href="<?php echo esc_url(home_url('/templates/' . $slug . '/')); ?>" class="gmkb-template-link">
                    <div class="gmkb-template-thumbnail">
                        <?php if (!empty($template['preview_url'])) : ?>
                            <img src="<?php echo esc_url($template['preview_url']); ?>" alt="<?php echo esc_attr($template['theme_name'] ?? $slug); ?> template" loading="lazy">
                        <?php else : ?>
                            <div class="gmkb-template-placeholder">
                                <span><?php echo esc_html(strtoupper(substr($template['theme_name'] ?? $slug, 0, 2))); ?></span>
                            </div>
                        <?php endif; ?>
                        <?php if (!empty($template['metadata']['is_new'])) : ?>
                            <span class="gmkb-badge gmkb-badge-new">New</span>
                        <?php endif; ?>
                        <?php if (!empty($template['metadata']['is_premium'])) : ?>
                            <span class="gmkb-badge gmkb-badge-pro">Pro</span>
                        <?php endif; ?>
                    </div>
                    <div class="gmkb-template-info">
                        <h3><?php echo esc_html($template['theme_name'] ?? $slug); ?></h3>
                        <?php if (!empty($template['description'])) : ?>
                            <p><?php echo esc_html(wp_trim_words($template['description'], 15)); ?></p>
                        <?php endif; ?>
                        <?php if (!empty($template['category'])) : ?>
                            <span class="gmkb-template-category"><?php echo esc_html(ucfirst($template['category'])); ?></span>
                        <?php endif; ?>
                    </div>
                </a>
            </article>
            <?php endforeach; ?>
        </div>

        <?php if ($show_cta) : ?>
        <div class="gmkb-templates-cta-inline">
            <?php if (is_user_logged_in()) : ?>
                <a href="<?php echo esc_url(home_url('/tools/media-kit/')); ?>" class="gmkb-btn gmkb-btn-primary">Open Media Kit Builder</a>
            <?php else : ?>
                <a href="<?php echo esc_url(wp_registration_url()); ?>" class="gmkb-btn gmkb-btn-primary">Get Started Free</a>
            <?php endif; ?>
            <a href="<?php echo esc_url(home_url('/templates/')); ?>" class="gmkb-btn gmkb-btn-secondary">View All Templates</a>
        </div>
        <?php endif; ?>
    </div>

    <style>
    #<?php echo esc_attr($instance_id); ?> .gmkb-templates-grid {
        display: grid;
        gap: 24px;
    }
    #<?php echo esc_attr($instance_id); ?> .gmkb-cols-1 { grid-template-columns: 1fr; }
    #<?php echo esc_attr($instance_id); ?> .gmkb-cols-2 { grid-template-columns: repeat(2, 1fr); }
    #<?php echo esc_attr($instance_id); ?> .gmkb-cols-3 { grid-template-columns: repeat(3, 1fr); }
    #<?php echo esc_attr($instance_id); ?> .gmkb-cols-4 { grid-template-columns: repeat(4, 1fr); }

    #<?php echo esc_attr($instance_id); ?> .gmkb-template-card {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        transition: transform 0.2s, box-shadow 0.2s;
    }
    #<?php echo esc_attr($instance_id); ?> .gmkb-template-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
    }
    #<?php echo esc_attr($instance_id); ?> .gmkb-template-link {
        text-decoration: none;
        color: inherit;
        display: block;
    }
    #<?php echo esc_attr($instance_id); ?> .gmkb-template-thumbnail {
        position: relative;
        aspect-ratio: 16/10;
        background: #e2e8f0;
        overflow: hidden;
    }
    #<?php echo esc_attr($instance_id); ?> .gmkb-template-thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    #<?php echo esc_attr($instance_id); ?> .gmkb-template-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        color: white;
        font-size: 2rem;
        font-weight: 700;
    }
    #<?php echo esc_attr($instance_id); ?> .gmkb-badge {
        position: absolute;
        top: 12px;
        right: 12px;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    #<?php echo esc_attr($instance_id); ?> .gmkb-badge-new { background: #10b981; color: white; }
    #<?php echo esc_attr($instance_id); ?> .gmkb-badge-pro { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }
    #<?php echo esc_attr($instance_id); ?> .gmkb-template-info {
        padding: 16px;
    }
    #<?php echo esc_attr($instance_id); ?> .gmkb-template-info h3 {
        font-size: 1.125rem;
        margin: 0 0 8px;
        color: #1e293b;
    }
    #<?php echo esc_attr($instance_id); ?> .gmkb-template-info p {
        font-size: 0.875rem;
        color: #64748b;
        margin: 0 0 12px;
        line-height: 1.5;
    }
    #<?php echo esc_attr($instance_id); ?> .gmkb-template-category {
        display: inline-block;
        background: #f1f5f9;
        color: #475569;
        padding: 4px 12px;
        border-radius: 9999px;
        font-size: 0.75rem;
    }
    #<?php echo esc_attr($instance_id); ?> .gmkb-templates-cta-inline {
        margin-top: 32px;
        text-align: center;
        display: flex;
        gap: 16px;
        justify-content: center;
        flex-wrap: wrap;
    }
    #<?php echo esc_attr($instance_id); ?> .gmkb-btn {
        display: inline-block;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.2s;
    }
    #<?php echo esc_attr($instance_id); ?> .gmkb-btn-primary {
        background: #3b82f6;
        color: white;
    }
    #<?php echo esc_attr($instance_id); ?> .gmkb-btn-primary:hover {
        background: #2563eb;
    }
    #<?php echo esc_attr($instance_id); ?> .gmkb-btn-secondary {
        background: #e2e8f0;
        color: #475569;
    }
    #<?php echo esc_attr($instance_id); ?> .gmkb-btn-secondary:hover {
        background: #cbd5e1;
    }

    @media (max-width: 768px) {
        #<?php echo esc_attr($instance_id); ?> .gmkb-cols-3,
        #<?php echo esc_attr($instance_id); ?> .gmkb-cols-4 {
            grid-template-columns: repeat(2, 1fr);
        }
    }
    @media (max-width: 480px) {
        #<?php echo esc_attr($instance_id); ?> .gmkb-templates-grid {
            grid-template-columns: 1fr !important;
        }
    }
    </style>
    <?php

    return ob_get_clean();
}
