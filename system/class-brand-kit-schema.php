<?php
/**
 * Brand Kit Schema Definition
 *
 * Defines the data structure for Brand Kits - standalone brand identity assets
 * that can be shared across profiles and media kits.
 *
 * @package GMKB
 * @since 3.1.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Brand_Kit_Schema {

    /**
     * Post type name
     */
    const POST_TYPE = 'gmkb_brand_kit';

    /**
     * Media category taxonomy
     */
    const MEDIA_CATEGORY_TAXONOMY = 'gmkb_media_category';

    /**
     * Color field definitions
     */
    public static function get_color_fields() {
        return [
            'color_primary' => [
                'label' => __('Primary Color', 'gmkb'),
                'description' => __('Main brand color for buttons and accents', 'gmkb'),
                'default' => '#3b82f6',
            ],
            'color_secondary' => [
                'label' => __('Secondary Color', 'gmkb'),
                'description' => __('Secondary brand color', 'gmkb'),
                'default' => '#2563eb',
            ],
            'color_accent' => [
                'label' => __('Accent Color', 'gmkb'),
                'description' => __('Accent color for highlights', 'gmkb'),
                'default' => '#f59e0b',
            ],
            'color_background' => [
                'label' => __('Background Color', 'gmkb'),
                'description' => __('Page background color', 'gmkb'),
                'default' => '#ffffff',
            ],
            'color_surface' => [
                'label' => __('Surface Color', 'gmkb'),
                'description' => __('Card and panel background color', 'gmkb'),
                'default' => '#f8fafc',
            ],
            'color_text' => [
                'label' => __('Text Color', 'gmkb'),
                'description' => __('Primary text color', 'gmkb'),
                'default' => '#1e293b',
            ],
            'color_text_muted' => [
                'label' => __('Muted Text Color', 'gmkb'),
                'description' => __('Secondary/muted text color', 'gmkb'),
                'default' => '#64748b',
            ],
            'color_link' => [
                'label' => __('Link Color', 'gmkb'),
                'description' => __('Hyperlink color', 'gmkb'),
                'default' => '#3b82f6',
            ],
        ];
    }

    /**
     * Typography field definitions
     */
    public static function get_typography_fields() {
        return [
            'font_primary' => [
                'label' => __('Primary Font', 'gmkb'),
                'description' => __('Main body text font', 'gmkb'),
                'default' => 'Inter',
            ],
            'font_heading' => [
                'label' => __('Heading Font', 'gmkb'),
                'description' => __('Font for headings', 'gmkb'),
                'default' => 'Inter',
            ],
            'font_accent' => [
                'label' => __('Accent Font', 'gmkb'),
                'description' => __('Optional accent font for special text', 'gmkb'),
                'default' => '',
            ],
        ];
    }

    /**
     * Media categories with their tags
     */
    public static function get_media_categories() {
        return [
            'headshot' => [
                'label' => __('Headshots & Portraits', 'gmkb'),
                'icon' => 'dashicons-admin-users',
                'description' => __('Professional photos of the speaker', 'gmkb'),
                'suggested_tags' => ['primary', 'vertical', 'horizontal', 'casual', 'formal'],
                'used_by' => ['profile-photo', 'header', 'about-section'],
            ],
            'logo' => [
                'label' => __('Logos & Brand Assets', 'gmkb'),
                'icon' => 'dashicons-building',
                'description' => __('Brand logos, client logos, media logos', 'gmkb'),
                'suggested_tags' => ['brand', 'client', 'media', 'certification', 'partner'],
                'used_by' => ['logo-grid', 'header', 'footer'],
            ],
            'photo' => [
                'label' => __('Photos & Gallery', 'gmkb'),
                'icon' => 'dashicons-format-gallery',
                'description' => __('Speaking photos, event photos, action shots', 'gmkb'),
                'suggested_tags' => ['speaking', 'event', 'action', 'team', 'behind-scenes'],
                'used_by' => ['photo-gallery', 'hero', 'testimonial'],
            ],
            'background' => [
                'label' => __('Backgrounds & Textures', 'gmkb'),
                'icon' => 'dashicons-art',
                'description' => __('Background images, patterns, textures', 'gmkb'),
                'suggested_tags' => ['hero', 'section', 'pattern', 'texture'],
                'used_by' => ['section-background', 'hero-background'],
            ],
        ];
    }

    /**
     * Visibility options
     */
    public static function get_visibility_options() {
        return [
            'private' => __('Private - Only you can use', 'gmkb'),
            'organization' => __('Organization - Team members can use', 'gmkb'),
            'public' => __('Public - Anyone can view', 'gmkb'),
        ];
    }

    /**
     * Get all field definitions for registration
     */
    public static function get_all_fields() {
        $fields = [];

        // Color fields
        foreach (self::get_color_fields() as $key => $config) {
            $fields[$key] = [
                'type' => 'string',
                'description' => $config['description'],
                'sanitize_callback' => 'sanitize_hex_color',
                'default' => $config['default'],
            ];
        }

        // Typography fields
        foreach (self::get_typography_fields() as $key => $config) {
            $fields[$key] = [
                'type' => 'string',
                'description' => $config['description'],
                'sanitize_callback' => 'sanitize_text_field',
                'default' => $config['default'],
            ];
        }

        // System fields
        $fields['visibility'] = [
            'type' => 'string',
            'description' => __('Brand kit visibility level', 'gmkb'),
            'sanitize_callback' => 'sanitize_text_field',
            'default' => 'private',
        ];

        $fields['organization_id'] = [
            'type' => 'integer',
            'description' => __('Organization ID (for agency feature)', 'gmkb'),
            'sanitize_callback' => 'absint',
            'default' => 0,
        ];

        return $fields;
    }

    /**
     * Get default brand kit data
     */
    public static function get_defaults() {
        $defaults = [
            'visibility' => 'private',
            'organization_id' => 0,
        ];

        foreach (self::get_color_fields() as $key => $config) {
            $defaults[$key] = $config['default'];
        }

        foreach (self::get_typography_fields() as $key => $config) {
            $defaults[$key] = $config['default'];
        }

        return $defaults;
    }

    /**
     * Validate brand kit data
     *
     * @param array $data Data to validate
     * @return array|WP_Error Validated data or error
     */
    public static function validate($data) {
        $errors = [];

        // Validate colors (must be valid hex)
        foreach (self::get_color_fields() as $key => $config) {
            if (isset($data[$key]) && !empty($data[$key])) {
                if (!preg_match('/^#[a-fA-F0-9]{6}$/', $data[$key])) {
                    $errors[] = sprintf(
                        __('%s must be a valid hex color (e.g., #3b82f6)', 'gmkb'),
                        $config['label']
                    );
                }
            }
        }

        // Validate visibility
        if (isset($data['visibility'])) {
            $valid_visibility = array_keys(self::get_visibility_options());
            if (!in_array($data['visibility'], $valid_visibility)) {
                $errors[] = __('Invalid visibility option', 'gmkb');
            }
        }

        if (!empty($errors)) {
            return new WP_Error('validation_error', implode(', ', $errors));
        }

        return $data;
    }
}
