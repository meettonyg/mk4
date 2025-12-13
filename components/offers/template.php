<?php
/**
 * Offers Component - Server-side Template
 *
 * Renders offers for Media Kit display.
 *
 * @package GMKB
 * @subpackage Components
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Render offers component
 *
 * @param array $data Component data
 * @param array $settings Component settings
 * @return string HTML output
 */
function gmkb_render_offers_component($data = [], $settings = []) {
    // Extract options with defaults
    $title = $data['customTitle'] ?? 'Special Offers';
    $title_alignment = $data['titleAlignment'] ?? 'center';
    $layout = $data['layout'] ?? 'grid';
    $columns = $data['columns'] ?? '3';
    $card_style = $data['cardStyle'] ?? 'elevated';
    $filter_by_type = $data['filterByType'] ?? 'all';
    $max_offers = (int) ($data['maxOffers'] ?? 6);
    $show_image = $data['showImage'] ?? true;
    $show_value = $data['showValue'] ?? true;
    $show_description = $data['showDescription'] ?? true;
    $show_expiry = $data['showExpiry'] ?? true;
    $show_cta = $data['showCTA'] ?? true;

    // Get offers
    $offers = [];

    // Use embedded offers data if available
    if (!empty($data['offersData']) && is_array($data['offersData'])) {
        $offers = $data['offersData'];
    }
    // Or fetch by selected IDs
    elseif (!empty($data['selectedOfferIds']) && is_array($data['selectedOfferIds'])) {
        $offers = gmkb_get_offers_by_ids($data['selectedOfferIds']);
    }
    // Or fetch by profile ID
    elseif (!empty($data['profileId'])) {
        $offers = gmkb_get_profile_offers($data['profileId']);
    }

    // Filter by type
    if ($filter_by_type !== 'all' && !empty($offers)) {
        $offers = array_filter($offers, function($offer) use ($filter_by_type) {
            return ($offer['type'] ?? '') === $filter_by_type;
        });
    }

    // Filter out expired
    $now = time();
    $offers = array_filter($offers, function($offer) use ($now) {
        if (empty($offer['expiry_date'])) return true;
        return strtotime($offer['expiry_date']) > $now;
    });

    // Limit
    $offers = array_slice(array_values($offers), 0, $max_offers);

    // Start output
    ob_start();
    ?>
    <div class="component-root offers-component">
        <?php if ($title): ?>
            <h2 class="offers-title" style="text-align: <?php echo esc_attr($title_alignment); ?>">
                <?php echo esc_html($title); ?>
            </h2>
        <?php endif; ?>

        <?php if (empty($offers)): ?>
            <div class="offers-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
                <p>No offers available</p>
            </div>
        <?php elseif ($layout === 'grid'): ?>
            <div class="offers-grid grid-<?php echo esc_attr($columns); ?>">
                <?php foreach ($offers as $offer): ?>
                    <?php echo gmkb_render_offer_card($offer, $card_style, $show_image, $show_value, $show_description, $show_expiry, $show_cta); ?>
                <?php endforeach; ?>
            </div>
        <?php elseif ($layout === 'list'): ?>
            <div class="offers-list">
                <?php foreach ($offers as $offer): ?>
                    <?php echo gmkb_render_offer_list_item($offer, $card_style, $show_image, $show_value, $show_description, $show_expiry, $show_cta); ?>
                <?php endforeach; ?>
            </div>
        <?php elseif ($layout === 'featured' && !empty($offers[0])): ?>
            <div class="offers-featured">
                <?php echo gmkb_render_offer_featured($offers[0], $card_style, $show_image, $show_value, $show_description, $show_expiry, $show_cta); ?>
            </div>
        <?php endif; ?>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Render a single offer card (grid layout)
 */
function gmkb_render_offer_card($offer, $card_style, $show_image, $show_value, $show_description, $show_expiry, $show_cta) {
    ob_start();
    ?>
    <div class="offer-card card-<?php echo esc_attr($card_style); ?>">
        <?php if ($show_image && !empty($offer['image']['url'])): ?>
            <div class="offer-image">
                <img src="<?php echo esc_url($offer['image']['sizes']['medium']['url'] ?? $offer['image']['url']); ?>" alt="<?php echo esc_attr($offer['title']); ?>" />
                <?php if (!empty($offer['type'])): ?>
                    <span class="offer-type-badge badge-<?php echo esc_attr($offer['type']); ?>">
                        <?php echo esc_html($offer['type']); ?>
                    </span>
                <?php endif; ?>
            </div>
        <?php endif; ?>

        <div class="offer-content">
            <h3 class="offer-title"><?php echo esc_html($offer['title']); ?></h3>

            <?php if ($show_value && !empty($offer['retail_value'])): ?>
                <div class="offer-value">
                    $<?php echo esc_html(gmkb_format_offer_value($offer['retail_value'])); ?> Value
                </div>
            <?php endif; ?>

            <?php if ($show_description && !empty($offer['description'])): ?>
                <p class="offer-description">
                    <?php echo esc_html(gmkb_truncate_text(wp_strip_all_tags($offer['description']), 120)); ?>
                </p>
            <?php endif; ?>

            <?php if ($show_expiry && !empty($offer['expiry_date'])): ?>
                <div class="offer-expiry">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Expires <?php echo esc_html(gmkb_format_offer_date($offer['expiry_date'])); ?>
                </div>
            <?php endif; ?>

            <?php if ($show_cta && !empty($offer['url'])): ?>
                <a href="<?php echo esc_url($offer['url']); ?>" class="offer-cta" target="_blank" rel="noopener" data-offer-id="<?php echo esc_attr($offer['id']); ?>">
                    <?php echo esc_html($offer['cta_text'] ?? 'Get Offer'); ?>
                </a>
            <?php endif; ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Render a single offer list item
 */
function gmkb_render_offer_list_item($offer, $card_style, $show_image, $show_value, $show_description, $show_expiry, $show_cta) {
    ob_start();
    ?>
    <div class="offer-list-item card-<?php echo esc_attr($card_style); ?>">
        <?php if ($show_image && !empty($offer['image']['url'])): ?>
            <div class="offer-list-image">
                <img src="<?php echo esc_url($offer['image']['sizes']['thumbnail']['url'] ?? $offer['image']['url']); ?>" alt="<?php echo esc_attr($offer['title']); ?>" />
            </div>
        <?php endif; ?>

        <div class="offer-list-content">
            <div class="offer-list-header">
                <h3 class="offer-title"><?php echo esc_html($offer['title']); ?></h3>
                <?php if (!empty($offer['type'])): ?>
                    <span class="offer-type-badge badge-<?php echo esc_attr($offer['type']); ?>">
                        <?php echo esc_html($offer['type']); ?>
                    </span>
                <?php endif; ?>
            </div>

            <?php if ($show_description && !empty($offer['description'])): ?>
                <p class="offer-description">
                    <?php echo esc_html(gmkb_truncate_text(wp_strip_all_tags($offer['description']), 200)); ?>
                </p>
            <?php endif; ?>

            <div class="offer-list-footer">
                <?php if ($show_value && !empty($offer['retail_value'])): ?>
                    <span class="offer-value">$<?php echo esc_html(gmkb_format_offer_value($offer['retail_value'])); ?></span>
                <?php endif; ?>

                <?php if ($show_expiry && !empty($offer['expiry_date'])): ?>
                    <span class="offer-expiry">Expires <?php echo esc_html(gmkb_format_offer_date($offer['expiry_date'])); ?></span>
                <?php endif; ?>

                <?php if ($show_cta && !empty($offer['url'])): ?>
                    <a href="<?php echo esc_url($offer['url']); ?>" class="offer-cta" target="_blank" rel="noopener">
                        <?php echo esc_html($offer['cta_text'] ?? 'Get Offer'); ?>
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
function gmkb_render_offer_featured($offer, $card_style, $show_image, $show_value, $show_description, $show_expiry, $show_cta) {
    ob_start();
    ?>
    <div class="offer-featured-card card-<?php echo esc_attr($card_style); ?>">
        <?php if ($show_image && !empty($offer['image']['url'])): ?>
            <div class="offer-featured-image">
                <img src="<?php echo esc_url($offer['image']['url']); ?>" alt="<?php echo esc_attr($offer['title']); ?>" />
                <?php if (!empty($offer['type'])): ?>
                    <span class="offer-type-badge badge-<?php echo esc_attr($offer['type']); ?>">
                        <?php echo esc_html($offer['type']); ?>
                    </span>
                <?php endif; ?>
            </div>
        <?php endif; ?>

        <div class="offer-featured-content">
            <h3 class="offer-featured-title"><?php echo esc_html($offer['title']); ?></h3>

            <?php if ($show_value && !empty($offer['retail_value'])): ?>
                <div class="offer-featured-value">
                    $<?php echo esc_html(gmkb_format_offer_value($offer['retail_value'])); ?> Value
                </div>
            <?php endif; ?>

            <?php if ($show_description && !empty($offer['description'])): ?>
                <div class="offer-featured-description">
                    <?php echo wp_kses_post($offer['description']); ?>
                </div>
            <?php endif; ?>

            <?php if ($show_expiry && !empty($offer['expiry_date'])): ?>
                <div class="offer-featured-meta">
                    <span class="offer-expiry">Expires <?php echo esc_html(gmkb_format_offer_date($offer['expiry_date'])); ?></span>
                </div>
            <?php endif; ?>

            <?php if ($show_cta && !empty($offer['url'])): ?>
                <a href="<?php echo esc_url($offer['url']); ?>" class="offer-featured-cta" target="_blank" rel="noopener">
                    <?php echo esc_html($offer['cta_text'] ?? 'Claim This Offer'); ?>
                </a>
            <?php endif; ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Get offers by IDs
 */
function gmkb_get_offers_by_ids($ids) {
    if (empty($ids)) return [];

    $offers = [];
    foreach ($ids as $id) {
        $post = get_post($id);
        if ($post && $post->post_type === 'gmkb_offer' && $post->post_status === 'publish') {
            $offers[] = gmkb_format_offer_for_display($post);
        }
    }
    return $offers;
}

/**
 * Get profile's associated offers
 */
function gmkb_get_profile_offers($profile_id) {
    $offer_ids = get_post_meta($profile_id, 'associated_offers', true);
    if (empty($offer_ids) || !is_array($offer_ids)) return [];
    return gmkb_get_offers_by_ids($offer_ids);
}

/**
 * Format offer post for display
 */
function gmkb_format_offer_for_display($post) {
    $image_id = get_post_meta($post->ID, 'offer_image_id', true);
    $image = null;

    if ($image_id) {
        $image = [
            'id' => $image_id,
            'url' => wp_get_attachment_url($image_id),
            'sizes' => [
                'thumbnail' => ['url' => wp_get_attachment_image_url($image_id, 'thumbnail')],
                'medium' => ['url' => wp_get_attachment_image_url($image_id, 'medium')],
            ]
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
 * Format offer value
 */
function gmkb_format_offer_value($value) {
    $num = floatval($value);
    return ($num == floor($num)) ? number_format($num, 0) : number_format($num, 2);
}

/**
 * Format offer date
 */
function gmkb_format_offer_date($date_str) {
    $timestamp = strtotime($date_str);
    return date('M j, Y', $timestamp);
}

/**
 * Truncate text
 */
function gmkb_truncate_text($text, $max_length) {
    if (strlen($text) <= $max_length) return $text;
    return substr($text, 0, $max_length) . '...';
}
