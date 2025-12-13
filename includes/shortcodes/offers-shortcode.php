<?php
/**
 * Offers Shortcode
 *
 * Display offers on any page via shortcode.
 *
 * Usage:
 *   [gmkb_offers]                          - Show current user's offers
 *   [gmkb_offers profile_id="123"]         - Show offers for specific profile
 *   [gmkb_offers ids="1,2,3"]              - Show specific offers by ID
 *   [gmkb_offers type="gift"]              - Filter by type (gift, prize, deal)
 *   [gmkb_offers layout="grid" columns="3"] - Layout options
 *
 * @package GMKB
 * @subpackage Shortcodes
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register the offers shortcode
 */
function gmkb_register_offers_shortcode() {
    add_shortcode('gmkb_offers', 'gmkb_offers_shortcode_handler');
}
add_action('init', 'gmkb_register_offers_shortcode');

/**
 * Offers shortcode handler
 *
 * @param array $atts Shortcode attributes
 * @return string HTML output
 */
function gmkb_offers_shortcode_handler($atts) {
    // Parse attributes with defaults
    $atts = shortcode_atts([
        'profile_id' => null,
        'ids' => '',
        'type' => 'all',
        'layout' => 'grid',
        'columns' => '3',
        'max' => 6,
        'title' => '',
        'show_image' => 'true',
        'show_value' => 'true',
        'show_description' => 'true',
        'show_expiry' => 'true',
        'show_cta' => 'true',
        'card_style' => 'elevated',
        'class' => '',
    ], $atts, 'gmkb_offers');

    // Convert string booleans
    $show_image = filter_var($atts['show_image'], FILTER_VALIDATE_BOOLEAN);
    $show_value = filter_var($atts['show_value'], FILTER_VALIDATE_BOOLEAN);
    $show_description = filter_var($atts['show_description'], FILTER_VALIDATE_BOOLEAN);
    $show_expiry = filter_var($atts['show_expiry'], FILTER_VALIDATE_BOOLEAN);
    $show_cta = filter_var($atts['show_cta'], FILTER_VALIDATE_BOOLEAN);

    // Get offers based on parameters
    $offers = [];

    // Priority 1: Specific IDs
    if (!empty($atts['ids'])) {
        $ids = array_map('intval', array_filter(explode(',', $atts['ids'])));
        $offers = gmkb_shortcode_get_offers_by_ids($ids);
    }
    // Priority 2: Profile ID
    elseif (!empty($atts['profile_id'])) {
        $offers = gmkb_shortcode_get_profile_offers((int) $atts['profile_id']);
    }
    // Priority 3: Current user's offers
    elseif (is_user_logged_in()) {
        $offers = gmkb_shortcode_get_user_offers(get_current_user_id());
    }

    // Filter by type
    if ($atts['type'] !== 'all' && !empty($offers)) {
        $filter_type = sanitize_text_field($atts['type']);
        $offers = array_filter($offers, function($offer) use ($filter_type) {
            return ($offer['type'] ?? '') === $filter_type;
        });
    }

    // Filter out expired offers
    $now = time();
    $offers = array_filter($offers, function($offer) use ($now) {
        if (empty($offer['expiry_date'])) return true;
        return strtotime($offer['expiry_date']) > $now;
    });

    // Limit
    $max = (int) $atts['max'];
    $offers = array_slice(array_values($offers), 0, $max);

    // Enqueue styles
    gmkb_enqueue_offers_shortcode_styles();

    // Build output
    $layout = sanitize_text_field($atts['layout']);
    $columns = sanitize_text_field($atts['columns']);
    $card_style = sanitize_text_field($atts['card_style']);
    $title = sanitize_text_field($atts['title']);
    $custom_class = sanitize_html_class($atts['class']);

    ob_start();
    ?>
    <div class="gmkb-offers-shortcode <?php echo esc_attr($custom_class); ?>">
        <?php if ($title): ?>
            <h2 class="gmkb-offers-title"><?php echo esc_html($title); ?></h2>
        <?php endif; ?>

        <?php if (empty($offers)): ?>
            <div class="gmkb-offers-empty">
                <p>No offers available at this time.</p>
            </div>
        <?php elseif ($layout === 'grid'): ?>
            <div class="gmkb-offers-grid gmkb-grid-<?php echo esc_attr($columns); ?>">
                <?php foreach ($offers as $offer): ?>
                    <?php echo gmkb_shortcode_render_offer_card($offer, $card_style, $show_image, $show_value, $show_description, $show_expiry, $show_cta); ?>
                <?php endforeach; ?>
            </div>
        <?php elseif ($layout === 'list'): ?>
            <div class="gmkb-offers-list">
                <?php foreach ($offers as $offer): ?>
                    <?php echo gmkb_shortcode_render_offer_list_item($offer, $card_style, $show_image, $show_value, $show_description, $show_expiry, $show_cta); ?>
                <?php endforeach; ?>
            </div>
        <?php elseif ($layout === 'carousel'): ?>
            <div class="gmkb-offers-carousel" data-autoplay="true">
                <?php foreach ($offers as $offer): ?>
                    <div class="gmkb-carousel-item">
                        <?php echo gmkb_shortcode_render_offer_card($offer, $card_style, $show_image, $show_value, $show_description, $show_expiry, $show_cta); ?>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php elseif ($layout === 'featured' && !empty($offers[0])): ?>
            <?php echo gmkb_shortcode_render_offer_featured($offers[0], $card_style, $show_image, $show_value, $show_description, $show_expiry, $show_cta); ?>
        <?php endif; ?>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Get offers by IDs
 */
function gmkb_shortcode_get_offers_by_ids($ids) {
    if (empty($ids)) return [];

    $offers = [];
    $query = new WP_Query([
        'post_type' => 'gmkb_offer',
        'post__in' => $ids,
        'post_status' => 'publish',
        'posts_per_page' => count($ids),
        'orderby' => 'post__in',
    ]);

    while ($query->have_posts()) {
        $query->the_post();
        $offers[] = gmkb_shortcode_format_offer(get_post());
    }
    wp_reset_postdata();

    return $offers;
}

/**
 * Get profile's associated offers
 */
function gmkb_shortcode_get_profile_offers($profile_id) {
    $offer_ids = get_post_meta($profile_id, 'associated_offers', true);
    if (empty($offer_ids) || !is_array($offer_ids)) return [];
    return gmkb_shortcode_get_offers_by_ids($offer_ids);
}

/**
 * Get current user's offers
 */
function gmkb_shortcode_get_user_offers($user_id) {
    $offers = [];
    $query = new WP_Query([
        'post_type' => 'gmkb_offer',
        'author' => $user_id,
        'post_status' => 'publish',
        'posts_per_page' => 50,
        'orderby' => 'date',
        'order' => 'DESC',
    ]);

    while ($query->have_posts()) {
        $query->the_post();
        $offers[] = gmkb_shortcode_format_offer(get_post());
    }
    wp_reset_postdata();

    return $offers;
}

/**
 * Format offer for display
 */
function gmkb_shortcode_format_offer($post) {
    $image_id = get_post_meta($post->ID, 'offer_image_id', true);
    $image = null;

    if ($image_id) {
        $image = [
            'id' => $image_id,
            'url' => wp_get_attachment_url($image_id),
            'thumbnail' => wp_get_attachment_image_url($image_id, 'thumbnail'),
            'medium' => wp_get_attachment_image_url($image_id, 'medium'),
        ];
    }

    // Get offer type from taxonomy
    $terms = wp_get_post_terms($post->ID, 'offer_type', ['fields' => 'slugs']);
    $type = !empty($terms) && !is_wp_error($terms) ? $terms[0] : '';

    return [
        'id' => $post->ID,
        'title' => $post->post_title,
        'description' => $post->post_content,
        'type' => $type,
        'format' => get_post_meta($post->ID, 'offer_format', true),
        'url' => get_post_meta($post->ID, 'offer_url', true),
        'cta_text' => get_post_meta($post->ID, 'offer_cta_text', true),
        'retail_value' => get_post_meta($post->ID, 'offer_retail_value', true),
        'expiry_date' => get_post_meta($post->ID, 'offer_expiry_date', true),
        'image' => $image,
    ];
}

/**
 * Render offer card (grid)
 */
function gmkb_shortcode_render_offer_card($offer, $card_style, $show_image, $show_value, $show_description, $show_expiry, $show_cta) {
    ob_start();
    ?>
    <div class="gmkb-offer-card gmkb-card-<?php echo esc_attr($card_style); ?>">
        <?php if ($show_image && !empty($offer['image']['medium'])): ?>
            <div class="gmkb-offer-image">
                <img src="<?php echo esc_url($offer['image']['medium']); ?>" alt="<?php echo esc_attr($offer['title']); ?>" loading="lazy" />
                <?php if (!empty($offer['type'])): ?>
                    <span class="gmkb-offer-badge gmkb-badge-<?php echo esc_attr($offer['type']); ?>">
                        <?php echo esc_html(ucfirst($offer['type'])); ?>
                    </span>
                <?php endif; ?>
            </div>
        <?php endif; ?>

        <div class="gmkb-offer-content">
            <h3 class="gmkb-offer-title"><?php echo esc_html($offer['title']); ?></h3>

            <?php if ($show_value && !empty($offer['retail_value'])): ?>
                <div class="gmkb-offer-value">
                    $<?php echo esc_html(number_format((float) $offer['retail_value'], 2)); ?> Value
                </div>
            <?php endif; ?>

            <?php if ($show_description && !empty($offer['description'])): ?>
                <p class="gmkb-offer-description">
                    <?php echo esc_html(wp_trim_words(wp_strip_all_tags($offer['description']), 20)); ?>
                </p>
            <?php endif; ?>

            <?php if ($show_expiry && !empty($offer['expiry_date'])): ?>
                <div class="gmkb-offer-expiry">
                    Expires <?php echo esc_html(date('M j, Y', strtotime($offer['expiry_date']))); ?>
                </div>
            <?php endif; ?>

            <?php if ($show_cta && !empty($offer['url'])): ?>
                <a href="<?php echo esc_url($offer['url']); ?>" class="gmkb-offer-cta" target="_blank" rel="noopener noreferrer">
                    <?php echo esc_html($offer['cta_text'] ?: 'Get Offer'); ?>
                </a>
            <?php endif; ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Render offer list item
 */
function gmkb_shortcode_render_offer_list_item($offer, $card_style, $show_image, $show_value, $show_description, $show_expiry, $show_cta) {
    ob_start();
    ?>
    <div class="gmkb-offer-list-item gmkb-card-<?php echo esc_attr($card_style); ?>">
        <?php if ($show_image && !empty($offer['image']['thumbnail'])): ?>
            <div class="gmkb-offer-list-image">
                <img src="<?php echo esc_url($offer['image']['thumbnail']); ?>" alt="<?php echo esc_attr($offer['title']); ?>" loading="lazy" />
            </div>
        <?php endif; ?>

        <div class="gmkb-offer-list-content">
            <div class="gmkb-offer-list-header">
                <h3 class="gmkb-offer-title"><?php echo esc_html($offer['title']); ?></h3>
                <?php if (!empty($offer['type'])): ?>
                    <span class="gmkb-offer-badge gmkb-badge-<?php echo esc_attr($offer['type']); ?>">
                        <?php echo esc_html(ucfirst($offer['type'])); ?>
                    </span>
                <?php endif; ?>
            </div>

            <?php if ($show_description && !empty($offer['description'])): ?>
                <p class="gmkb-offer-description">
                    <?php echo esc_html(wp_trim_words(wp_strip_all_tags($offer['description']), 30)); ?>
                </p>
            <?php endif; ?>

            <div class="gmkb-offer-list-footer">
                <?php if ($show_value && !empty($offer['retail_value'])): ?>
                    <span class="gmkb-offer-value">$<?php echo esc_html(number_format((float) $offer['retail_value'], 2)); ?></span>
                <?php endif; ?>

                <?php if ($show_expiry && !empty($offer['expiry_date'])): ?>
                    <span class="gmkb-offer-expiry">Expires <?php echo esc_html(date('M j', strtotime($offer['expiry_date']))); ?></span>
                <?php endif; ?>

                <?php if ($show_cta && !empty($offer['url'])): ?>
                    <a href="<?php echo esc_url($offer['url']); ?>" class="gmkb-offer-cta" target="_blank" rel="noopener noreferrer">
                        <?php echo esc_html($offer['cta_text'] ?: 'Get Offer'); ?>
                    </a>
                <?php endif; ?>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Render featured offer
 */
function gmkb_shortcode_render_offer_featured($offer, $card_style, $show_image, $show_value, $show_description, $show_expiry, $show_cta) {
    ob_start();
    ?>
    <div class="gmkb-offer-featured gmkb-card-<?php echo esc_attr($card_style); ?>">
        <?php if ($show_image && !empty($offer['image']['url'])): ?>
            <div class="gmkb-offer-featured-image">
                <img src="<?php echo esc_url($offer['image']['url']); ?>" alt="<?php echo esc_attr($offer['title']); ?>" loading="lazy" />
                <?php if (!empty($offer['type'])): ?>
                    <span class="gmkb-offer-badge gmkb-badge-<?php echo esc_attr($offer['type']); ?>">
                        <?php echo esc_html(ucfirst($offer['type'])); ?>
                    </span>
                <?php endif; ?>
            </div>
        <?php endif; ?>

        <div class="gmkb-offer-featured-content">
            <h3 class="gmkb-offer-featured-title"><?php echo esc_html($offer['title']); ?></h3>

            <?php if ($show_value && !empty($offer['retail_value'])): ?>
                <div class="gmkb-offer-featured-value">
                    $<?php echo esc_html(number_format((float) $offer['retail_value'], 2)); ?> Value
                </div>
            <?php endif; ?>

            <?php if ($show_description && !empty($offer['description'])): ?>
                <div class="gmkb-offer-featured-description">
                    <?php echo wp_kses_post($offer['description']); ?>
                </div>
            <?php endif; ?>

            <?php if ($show_expiry && !empty($offer['expiry_date'])): ?>
                <div class="gmkb-offer-featured-meta">
                    <span class="gmkb-offer-expiry">Expires <?php echo esc_html(date('F j, Y', strtotime($offer['expiry_date']))); ?></span>
                </div>
            <?php endif; ?>

            <?php if ($show_cta && !empty($offer['url'])): ?>
                <a href="<?php echo esc_url($offer['url']); ?>" class="gmkb-offer-featured-cta" target="_blank" rel="noopener noreferrer">
                    <?php echo esc_html($offer['cta_text'] ?: 'Claim This Offer'); ?>
                </a>
            <?php endif; ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Enqueue shortcode styles
 */
function gmkb_enqueue_offers_shortcode_styles() {
    if (wp_style_is('gmkb-offers-shortcode', 'enqueued')) {
        return;
    }

    $css = '
    .gmkb-offers-shortcode {
        margin: 2rem 0;
    }

    .gmkb-offers-title {
        margin: 0 0 1.5rem;
        text-align: center;
    }

    .gmkb-offers-empty {
        text-align: center;
        padding: 2rem;
        color: #6b7280;
    }

    /* Grid Layout */
    .gmkb-offers-grid {
        display: grid;
        gap: 1.5rem;
    }

    .gmkb-grid-1 { grid-template-columns: 1fr; }
    .gmkb-grid-2 { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
    .gmkb-grid-3 { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
    .gmkb-grid-4 { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }

    /* Card Styles */
    .gmkb-offer-card {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-radius: 12px;
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .gmkb-offer-card:hover {
        transform: translateY(-4px);
    }

    .gmkb-card-bordered {
        border: 1px solid #e5e7eb;
        background: #fff;
    }

    .gmkb-card-elevated {
        background: #fff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .gmkb-card-elevated:hover {
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    .gmkb-card-flat {
        background: #f9fafb;
    }

    /* Image */
    .gmkb-offer-image {
        position: relative;
        aspect-ratio: 16/9;
        overflow: hidden;
    }

    .gmkb-offer-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .gmkb-offer-badge {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        padding: 0.25rem 0.75rem;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        border-radius: 9999px;
        color: #fff;
    }

    .gmkb-badge-gift { background: #10b981; }
    .gmkb-badge-prize { background: #f59e0b; }
    .gmkb-badge-deal { background: #3b82f6; }

    /* Content */
    .gmkb-offer-content {
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        flex: 1;
    }

    .gmkb-offer-title {
        margin: 0 0 0.5rem;
        font-size: 1.125rem;
    }

    .gmkb-offer-value {
        font-size: 1.25rem;
        font-weight: 700;
        color: #3b82f6;
        margin-bottom: 0.75rem;
    }

    .gmkb-offer-description {
        margin: 0 0 1rem;
        color: #6b7280;
        font-size: 0.9rem;
        line-height: 1.5;
        flex: 1;
    }

    .gmkb-offer-expiry {
        font-size: 0.8rem;
        color: #9ca3af;
        margin-bottom: 1rem;
    }

    .gmkb-offer-cta {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.75rem 1.5rem;
        background: #3b82f6;
        color: #fff;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        transition: background 0.2s;
        margin-top: auto;
    }

    .gmkb-offer-cta:hover {
        background: #2563eb;
        color: #fff;
    }

    /* List Layout */
    .gmkb-offers-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .gmkb-offer-list-item {
        display: flex;
        gap: 1.25rem;
        padding: 1.25rem;
        border-radius: 12px;
    }

    .gmkb-offer-list-image {
        flex-shrink: 0;
        width: 120px;
        height: 90px;
        border-radius: 8px;
        overflow: hidden;
    }

    .gmkb-offer-list-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .gmkb-offer-list-content {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .gmkb-offer-list-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.5rem;
    }

    .gmkb-offer-list-footer {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        margin-top: auto;
    }

    /* Featured Layout */
    .gmkb-offer-featured {
        max-width: 600px;
        margin: 0 auto;
        overflow: hidden;
        border-radius: 16px;
    }

    .gmkb-offer-featured-image {
        position: relative;
        aspect-ratio: 16/9;
    }

    .gmkb-offer-featured-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .gmkb-offer-featured-content {
        padding: 2rem;
        text-align: center;
    }

    .gmkb-offer-featured-title {
        margin: 0 0 0.75rem;
        font-size: 1.5rem;
    }

    .gmkb-offer-featured-value {
        font-size: 2rem;
        font-weight: 700;
        color: #3b82f6;
        margin-bottom: 1rem;
    }

    .gmkb-offer-featured-description {
        margin-bottom: 1.5rem;
        color: #6b7280;
        line-height: 1.6;
    }

    .gmkb-offer-featured-meta {
        margin-bottom: 1.5rem;
    }

    .gmkb-offer-featured-cta {
        display: inline-flex;
        padding: 1rem 2.5rem;
        background: #3b82f6;
        color: #fff;
        text-decoration: none;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 1.1rem;
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .gmkb-offer-featured-cta:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(59,130,246,0.4);
        color: #fff;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .gmkb-offers-grid {
            grid-template-columns: 1fr !important;
        }

        .gmkb-offer-list-item {
            flex-direction: column;
        }

        .gmkb-offer-list-image {
            width: 100%;
            height: 160px;
        }

        .gmkb-offer-list-footer {
            flex-wrap: wrap;
        }
    }
    ';

    wp_register_style('gmkb-offers-shortcode', false);
    wp_enqueue_style('gmkb-offers-shortcode');
    wp_add_inline_style('gmkb-offers-shortcode', $css);
}
