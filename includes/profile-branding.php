<?php
/**
 * Profile Branding Data Functions
 *
 * PHASE 1: Branding Integration (2025-12-16)
 *
 * This file provides a single source of truth for fetching and mapping
 * profile branding data. Used by both:
 * - enqueue.php (initial page load via window.gmkbData)
 * - REST API v2 (AJAX fetches)
 *
 * MIGRATION NOTE: The output schema is platform-agnostic. If migrating away
 * from WordPress, only the internal get_post_meta() calls need updating.
 * The output structure remains the same.
 *
 * @package GMKB
 * @since 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Schema version for profile branding data structure.
 * Increment this when making breaking changes to the output schema.
 */
define('GMKB_PROFILE_BRANDING_SCHEMA_VERSION', '1.0');

/**
 * Get profile branding data from WordPress post meta
 *
 * Fetches brand colors, fonts, and images from the profile post meta
 * and maps them to a platform-agnostic schema for frontend consumption.
 *
 * @param int $post_id The post ID to fetch branding from
 * @return array Profile branding data structure
 */
function gmkb_get_profile_branding($post_id) {
    $branding = array(
        'schemaVersion' => GMKB_PROFILE_BRANDING_SCHEMA_VERSION,
        'colors' => array(
            'primary' => get_post_meta($post_id, 'color_primary', true) ?: null,
            'accent' => get_post_meta($post_id, 'color_accent', true) ?: null,
            'contrasting' => get_post_meta($post_id, 'color_contrasting', true) ?: null,
            'background' => get_post_meta($post_id, 'color_background', true) ?: null,
            'header' => get_post_meta($post_id, 'color_header', true) ?: null,
            'headerAccent' => get_post_meta($post_id, 'color_header_accent', true) ?: null,
            'headerText' => get_post_meta($post_id, 'color_header_text', true) ?: null,
            'paragraph' => get_post_meta($post_id, 'color_paragraph', true) ?: null,
        ),
        'fonts' => array(
            'primary' => get_post_meta($post_id, 'font_primary', true) ?: null,
            'secondary' => get_post_meta($post_id, 'font_secondary', true) ?: null,
        ),
        'images' => array(
            'headshotPrimary' => gmkb_expand_branding_image($post_id, 'headshot_primary'),
            'headshotVertical' => gmkb_expand_branding_image($post_id, 'headshot_vertical'),
            'headshotHorizontal' => gmkb_expand_branding_image($post_id, 'headshot_horizontal'),
            'logos' => gmkb_expand_branding_gallery($post_id, 'logos'),
            'carouselImages' => gmkb_expand_branding_gallery($post_id, 'carousel_images'),
        ),
    );

    // Check if any branding data exists
    $has_colors = !empty(array_filter($branding['colors']));
    $has_fonts = !empty(array_filter($branding['fonts']));
    $has_images = !empty($branding['images']['headshotPrimary']) ||
                  !empty($branding['images']['headshotVertical']) ||
                  !empty($branding['images']['headshotHorizontal']) ||
                  !empty($branding['images']['logos']) ||
                  !empty($branding['images']['carouselImages']);

    $branding['hasBrandingData'] = $has_colors || $has_fonts || $has_images;

    GMKB_Logger::debug('GMKB Profile Branding: Post #' . $post_id, [
        'schema_version' => GMKB_PROFILE_BRANDING_SCHEMA_VERSION,
        'has_colors' => $has_colors,
        'has_fonts' => $has_fonts,
        'has_images' => $has_images,
    ]);

    return $branding;
}

/**
 * Expand a single image field from attachment ID to full data
 *
 * Transforms a WordPress attachment ID into a platform-agnostic image object
 * with URL, alt text, and responsive size variants.
 *
 * @param int $post_id The post ID
 * @param string $meta_key The meta key for the image field
 * @return array|null Image data or null if not found
 */
function gmkb_expand_branding_image($post_id, $meta_key) {
    $attachment_id = get_post_meta($post_id, $meta_key, true);

    if (empty($attachment_id)) {
        return null;
    }

    // Handle case where meta stores full image data array (from Profile Editor)
    if (is_array($attachment_id) && isset($attachment_id['id'])) {
        return $attachment_id; // Already expanded
    }

    $attachment_id = (int) $attachment_id;

    if (!wp_attachment_is_image($attachment_id)) {
        return null;
    }

    // Map WordPress attachment to platform-agnostic structure
    return array(
        'id' => $attachment_id,
        'url' => wp_get_attachment_url($attachment_id),
        'alt' => get_post_meta($attachment_id, '_wp_attachment_image_alt', true) ?: '',
        'sizes' => array(
            'thumbnail' => wp_get_attachment_image_url($attachment_id, 'thumbnail'),
            'medium' => wp_get_attachment_image_url($attachment_id, 'medium'),
            'large' => wp_get_attachment_image_url($attachment_id, 'large'),
            'full' => wp_get_attachment_image_url($attachment_id, 'full'),
        ),
    );
}

/**
 * Expand a gallery field from attachment IDs to full data array
 *
 * Transforms an array of WordPress attachment IDs into platform-agnostic
 * image objects with URLs, alt text, and responsive size variants.
 *
 * @param int $post_id The post ID
 * @param string $meta_key The meta key for the gallery field
 * @return array Array of image data
 */
function gmkb_expand_branding_gallery($post_id, $meta_key) {
    $value = get_post_meta($post_id, $meta_key, true);

    if (empty($value)) {
        return array();
    }

    // Handle comma-separated string (legacy format)
    if (is_string($value)) {
        $ids = array_map('trim', explode(',', $value));
    } else {
        $ids = (array) $value;
    }

    $images = array();
    foreach ($ids as $id) {
        // Handle case where array contains full image objects
        if (is_array($id) && isset($id['id'])) {
            $images[] = $id;
            continue;
        }

        $attachment_id = (int) $id;
        if ($attachment_id && wp_attachment_is_image($attachment_id)) {
            // Map WordPress attachment to platform-agnostic structure
            $images[] = array(
                'id' => $attachment_id,
                'url' => wp_get_attachment_url($attachment_id),
                'alt' => get_post_meta($attachment_id, '_wp_attachment_image_alt', true) ?: '',
                'sizes' => array(
                    'thumbnail' => wp_get_attachment_image_url($attachment_id, 'thumbnail'),
                    'medium' => wp_get_attachment_image_url($attachment_id, 'medium'),
                    'large' => wp_get_attachment_image_url($attachment_id, 'large'),
                    'full' => wp_get_attachment_image_url($attachment_id, 'full'),
                ),
            );
        }
    }

    return $images;
}
