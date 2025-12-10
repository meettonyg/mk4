<?php
/**
 * GMKB GraphQL Type Registration
 *
 * Custom types and resolvers for WPGraphQL integration.
 * Only loads if WPGraphQL plugin is active.
 *
 * Phase 4 of Native Data Layer Migration
 * @package GMKB
 * @since 3.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

// Only proceed if WPGraphQL is active
if (!function_exists('register_graphql_object_type')) {
    return;
}

add_action('graphql_register_types', function() {

    // Register SocialLink type
    register_graphql_object_type('GMKBSocialLink', [
        'description' => 'A social media link',
        'fields' => [
            'platform' => [
                'type' => 'String',
                'description' => 'The social media platform name',
            ],
            'url' => [
                'type' => 'String',
                'description' => 'The URL to the social media profile',
            ],
        ],
    ]);

    // Register Website type
    register_graphql_object_type('GMKBWebsite', [
        'description' => 'A website URL',
        'fields' => [
            'type' => [
                'type' => 'String',
                'description' => 'The type of website (primary, secondary)',
            ],
            'url' => [
                'type' => 'String',
                'description' => 'The website URL',
            ],
        ],
    ]);

    // Register Topic type
    register_graphql_object_type('GMKBTopic', [
        'description' => 'A speaking topic',
        'fields' => [
            'index' => [
                'type' => 'Int',
                'description' => 'The topic index (1-5)',
            ],
            'title' => [
                'type' => 'String',
                'description' => 'The topic title',
            ],
        ],
    ]);

    // Register Question type
    register_graphql_object_type('GMKBQuestion', [
        'description' => 'An interview question',
        'fields' => [
            'index' => [
                'type' => 'Int',
                'description' => 'The question index (1-25)',
            ],
            'question' => [
                'type' => 'String',
                'description' => 'The question text',
            ],
        ],
    ]);

    // Register MediaKitImage type
    register_graphql_object_type('GMKBMediaKitImage', [
        'description' => 'An image in a media kit',
        'fields' => [
            'id' => [
                'type' => 'Int',
                'description' => 'The attachment ID',
            ],
            'url' => [
                'type' => 'String',
                'description' => 'The full image URL',
            ],
            'alt' => [
                'type' => 'String',
                'description' => 'The image alt text',
            ],
            'title' => [
                'type' => 'String',
                'description' => 'The image title',
            ],
            'thumbnail' => [
                'type' => 'String',
                'description' => 'The thumbnail size URL',
            ],
            'medium' => [
                'type' => 'String',
                'description' => 'The medium size URL',
            ],
            'large' => [
                'type' => 'String',
                'description' => 'The large size URL',
            ],
        ],
    ]);

    // Add custom fields to the Guest (MediaKit) post type
    register_graphql_field('Guest', 'fullName', [
        'type' => 'String',
        'description' => 'The full name (first + last)',
        'resolve' => function($post) {
            $first = get_post_meta($post->databaseId, 'first_name', true);
            $last = get_post_meta($post->databaseId, 'last_name', true);
            return trim("$first $last");
        },
    ]);

    register_graphql_field('Guest', 'socialLinks', [
        'type' => ['list_of' => 'GMKBSocialLink'],
        'description' => 'All social media links',
        'resolve' => function($post) {
            $links = [];
            $platforms = [
                'twitter' => ['social_twitter', '1_twitter'],
                'facebook' => ['social_facebook', '1_facebook'],
                'instagram' => ['social_instagram', '1_instagram'],
                'linkedin' => ['social_linkedin', '1_linkedin'],
                'tiktok' => ['social_tiktok', '1_tiktok'],
                'pinterest' => ['social_pinterest', '1_pinterest'],
                'youtube' => ['social_youtube', 'guest_youtube'],
            ];

            foreach ($platforms as $platform => $fields) {
                foreach ($fields as $field) {
                    $url = get_post_meta($post->databaseId, $field, true);
                    if (!empty($url)) {
                        $links[] = [
                            'platform' => $platform,
                            'url' => $url,
                        ];
                        break;
                    }
                }
            }

            return $links;
        },
    ]);

    register_graphql_field('Guest', 'websites', [
        'type' => ['list_of' => 'GMKBWebsite'],
        'description' => 'Website URLs',
        'resolve' => function($post) {
            $websites = [];

            $primary = get_post_meta($post->databaseId, 'website_primary', true)
                ?: get_post_meta($post->databaseId, '1_website', true);
            if ($primary) {
                $websites[] = ['type' => 'primary', 'url' => $primary];
            }

            $secondary = get_post_meta($post->databaseId, 'website_secondary', true)
                ?: get_post_meta($post->databaseId, '2_website', true);
            if ($secondary) {
                $websites[] = ['type' => 'secondary', 'url' => $secondary];
            }

            return $websites;
        },
    ]);

    register_graphql_field('Guest', 'topics', [
        'type' => ['list_of' => 'GMKBTopic'],
        'description' => 'Speaking topics',
        'resolve' => function($post) {
            $topics = [];
            for ($i = 1; $i <= 5; $i++) {
                $topic = get_post_meta($post->databaseId, "topic_$i", true);
                if (!empty($topic)) {
                    $topics[] = [
                        'index' => $i,
                        'title' => $topic,
                    ];
                }
            }
            return $topics;
        },
    ]);

    register_graphql_field('Guest', 'questions', [
        'type' => ['list_of' => 'GMKBQuestion'],
        'description' => 'Interview questions',
        'resolve' => function($post) {
            $questions = [];
            for ($i = 1; $i <= 25; $i++) {
                $question = get_post_meta($post->databaseId, "question_$i", true);
                if (!empty($question)) {
                    $questions[] = [
                        'index' => $i,
                        'question' => $question,
                    ];
                }
            }
            return $questions;
        },
    ]);

    register_graphql_field('Guest', 'headshotImage', [
        'type' => 'GMKBMediaKitImage',
        'description' => 'The headshot image',
        'resolve' => function($post) {
            return gmkb_graphql_resolve_image($post->databaseId, 'headshot');
        },
    ]);

    register_graphql_field('Guest', 'profilePhotoImage', [
        'type' => 'GMKBMediaKitImage',
        'description' => 'The profile photo',
        'resolve' => function($post) {
            return gmkb_graphql_resolve_image($post->databaseId, 'profile_photo');
        },
    ]);

    register_graphql_field('Guest', 'companyLogoImage', [
        'type' => 'GMKBMediaKitImage',
        'description' => 'The company logo',
        'resolve' => function($post) {
            return gmkb_graphql_resolve_image($post->databaseId, 'company_logo');
        },
    ]);

    register_graphql_field('Guest', 'personalBrandLogoImage', [
        'type' => 'GMKBMediaKitImage',
        'description' => 'The personal brand logo',
        'resolve' => function($post) {
            return gmkb_graphql_resolve_image($post->databaseId, 'personal_brand_logo');
        },
    ]);

    register_graphql_field('Guest', 'galleryImages', [
        'type' => ['list_of' => 'GMKBMediaKitImage'],
        'description' => 'Photo gallery images',
        'resolve' => function($post) {
            $value = get_post_meta($post->databaseId, 'gallery_photos', true);
            $value = maybe_unserialize($value);

            if (!is_array($value)) {
                return [];
            }

            $images = [];
            foreach ($value as $item) {
                $id = is_array($item) && isset($item['ID']) ? $item['ID'] : $item;
                $image = gmkb_graphql_resolve_image_by_id(absint($id));
                if ($image) {
                    $images[] = $image;
                }
            }

            return $images;
        },
    ]);

    register_graphql_field('Guest', 'ownerUserId', [
        'type' => 'Int',
        'description' => 'The WordPress user ID who owns this media kit',
        'resolve' => function($post) {
            if (class_exists('GMKB_Permissions')) {
                return GMKB_Permissions::get_owner($post->databaseId);
            }
            return get_post_meta($post->databaseId, 'owner_user_id', true) ?: $post->post_author;
        },
    ]);

    register_graphql_field('Guest', 'canEdit', [
        'type' => 'Boolean',
        'description' => 'Whether the current user can edit this media kit',
        'resolve' => function($post) {
            if (class_exists('GMKB_Permissions')) {
                return GMKB_Permissions::can_edit($post->databaseId);
            }
            return false;
        },
    ]);
});

/**
 * Helper function to resolve an image field
 */
function gmkb_graphql_resolve_image($post_id, $meta_key) {
    $value = get_post_meta($post_id, $meta_key, true);

    if (empty($value)) {
        return null;
    }

    // Handle Pods array format
    if (is_array($value) && isset($value['ID'])) {
        $value = $value['ID'];
    }

    return gmkb_graphql_resolve_image_by_id(absint($value));
}

/**
 * Helper function to resolve an image by ID
 */
function gmkb_graphql_resolve_image_by_id($attachment_id) {
    if (!$attachment_id) {
        return null;
    }

    $attachment = get_post($attachment_id);
    if (!$attachment || $attachment->post_type !== 'attachment') {
        return null;
    }

    $thumbnail = wp_get_attachment_image_src($attachment_id, 'thumbnail');
    $medium = wp_get_attachment_image_src($attachment_id, 'medium');
    $large = wp_get_attachment_image_src($attachment_id, 'large');

    return [
        'id' => $attachment_id,
        'url' => wp_get_attachment_url($attachment_id),
        'alt' => get_post_meta($attachment_id, '_wp_attachment_image_alt', true),
        'title' => $attachment->post_title,
        'thumbnail' => $thumbnail ? $thumbnail[0] : null,
        'medium' => $medium ? $medium[0] : null,
        'large' => $large ? $large[0] : null,
    ];
}

// Log GraphQL registration
if (defined('WP_DEBUG') && WP_DEBUG) {
    add_action('graphql_register_types', function() {
        error_log('✅ GMKB Phase 4: GraphQL types registered');
    }, 999);
}
