<?php
/**
 * GMKB Free Tools Shortcode
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Provides shortcode for embedding AI tools on public pages (standalone mode).
 *
 * Generic Usage: [gmkb_free_tool type="biography" title="Free Bio Generator"]
 *
 * Individual Shortcodes (25 tools):
 *
 * MESSAGE BUILDER:
 * - [gmkb_biography] - AI Biography Generator
 * - [gmkb_topics] - AI Topics Generator
 * - [gmkb_questions] - AI Questions Generator
 * - [gmkb_tagline] - AI Tagline Generator
 * - [gmkb_guest_intro] - AI Guest Intro Generator
 * - [gmkb_offers] - AI Offers Generator
 *
 * VALUE BUILDER:
 * - [gmkb_elevator_pitch] - Elevator Pitch Generator
 * - [gmkb_sound_bite] - Sound Bite Generator
 * - [gmkb_authority_hook] - Authority Hook Builder
 * - [gmkb_impact_intro] - Impact Intro Builder
 * - [gmkb_persona] - Ideal Client Persona Generator
 *
 * STRATEGY:
 * - [gmkb_brand_story] - Brand Story Generator
 * - [gmkb_signature_story] - Signature Story Generator
 * - [gmkb_credibility_story] - Credibility Story Generator
 * - [gmkb_framework] - Framework Builder
 * - [gmkb_interview_prep] - Interview Prep Generator
 *
 * CONTENT:
 * - [gmkb_blog] - Blog Post Generator
 * - [gmkb_content_repurpose] - Content Repurposer
 * - [gmkb_press_release] - Press Release Generator
 *
 * SOCIAL/EMAIL:
 * - [gmkb_social_post] - Social Post Generator
 * - [gmkb_email] - Email Writer
 * - [gmkb_newsletter] - Newsletter Writer
 * - [gmkb_youtube_description] - YouTube Description Generator
 * - [gmkb_podcast_notes] - Podcast Show Notes Generator
 * - [gmkb_seo_optimizer] - SEO Content Optimizer
 *
 * All shortcodes accept these attributes:
 * - title: Custom widget title
 * - description: Custom widget description
 * - class: Additional CSS classes
 * - theme: 'light' or 'dark' (default: light)
 * - cta_text: Call-to-action button text
 * - cta_url: Call-to-action URL
 * - show_usage: Show usage counter (true/false)
 *
 * @package GMKB
 * @subpackage Shortcodes
 * @version 2.0.0
 * @since 2.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Free_Tools_Shortcode {

    /**
     * Singleton instance
     * @var GMKB_Free_Tools_Shortcode
     */
    private static $instance = null;

    /**
     * Whether assets have been enqueued
     * @var bool
     */
    private $enqueued = false;

    /**
     * Valid tool types
     * @var array
     */
    private $valid_types = array(
        // Message Builder
        'biography',
        'topics',
        'questions',
        'tagline',
        'guest-intro',
        'offers',
        // Value Builder
        'elevator-pitch',
        'sound-bite',
        'authority-hook',
        'impact-intro',
        'persona',
        // Strategy
        'brand-story',
        'signature-story',
        'credibility-story',
        'framework',
        'interview-prep',
        // Content
        'blog',
        'content-repurpose',
        'press-release',
        // Social/Email
        'social-post',
        'email',
        'newsletter',
        'youtube-description',
        'podcast-notes',
        'seo-optimizer'
    );

    /**
     * Get singleton instance
     *
     * @return GMKB_Free_Tools_Shortcode
     */
    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Tools organized by category with metadata
     * @var array
     */
    private $tools_by_category = array(
        'message-builder' => array(
            'label' => 'Message Builder',
            'description' => 'Craft your core messaging and professional content',
            'icon' => 'message-square',
            'tools' => array(
                'biography' => array(
                    'title' => 'Biography Generator',
                    'description' => 'Create professional bios for media kits, speaker profiles, and websites.',
                    'icon' => 'user',
                    'slug' => 'biography-generator'
                ),
                'topics' => array(
                    'title' => 'Topics Generator',
                    'description' => 'Generate compelling speaking and interview topics.',
                    'icon' => 'list',
                    'slug' => 'topics-generator'
                ),
                'questions' => array(
                    'title' => 'Questions Generator',
                    'description' => 'Create 25 engaging interview questions for podcasts and media.',
                    'icon' => 'help-circle',
                    'slug' => 'questions-generator'
                ),
                'tagline' => array(
                    'title' => 'Tagline Generator',
                    'description' => 'Craft memorable taglines and positioning statements.',
                    'icon' => 'tag',
                    'slug' => 'tagline-generator'
                ),
                'guest-intro' => array(
                    'title' => 'Guest Intro Generator',
                    'description' => 'Write host-ready introductions for podcast appearances.',
                    'icon' => 'mic',
                    'slug' => 'guest-intro-generator'
                ),
                'offers' => array(
                    'title' => 'Offers Generator',
                    'description' => 'Create compelling service packages and offers.',
                    'icon' => 'package',
                    'slug' => 'offers-generator'
                )
            )
        ),
        'value-builder' => array(
            'label' => 'Value Builder',
            'description' => 'Define your unique value and authority positioning',
            'icon' => 'award',
            'tools' => array(
                'elevator-pitch' => array(
                    'title' => 'Elevator Pitch Generator',
                    'description' => 'Create a compelling 30-second pitch that captures attention.',
                    'icon' => 'trending-up',
                    'slug' => 'elevator-pitch-generator'
                ),
                'sound-bite' => array(
                    'title' => 'Sound Bite Generator',
                    'description' => 'Generate quotable sound bites for media appearances.',
                    'icon' => 'volume-2',
                    'slug' => 'sound-bite-generator'
                ),
                'authority-hook' => array(
                    'title' => 'Authority Hook Builder',
                    'description' => 'Build your unique authority positioning statement.',
                    'icon' => 'zap',
                    'slug' => 'authority-hook-builder'
                ),
                'impact-intro' => array(
                    'title' => 'Impact Intro Builder',
                    'description' => 'Create powerful introductions that showcase your impact.',
                    'icon' => 'target',
                    'slug' => 'impact-intro-builder'
                ),
                'persona' => array(
                    'title' => 'Ideal Client Persona',
                    'description' => 'Define your ideal client avatar with clarity.',
                    'icon' => 'users',
                    'slug' => 'persona-generator'
                )
            )
        ),
        'strategy' => array(
            'label' => 'Strategy',
            'description' => 'Develop your brand narrative and frameworks',
            'icon' => 'compass',
            'tools' => array(
                'brand-story' => array(
                    'title' => 'Brand Story Generator',
                    'description' => 'Craft your compelling brand origin story.',
                    'icon' => 'book-open',
                    'slug' => 'brand-story-generator'
                ),
                'signature-story' => array(
                    'title' => 'Signature Story Generator',
                    'description' => 'Create your signature transformation story.',
                    'icon' => 'edit-3',
                    'slug' => 'signature-story-generator'
                ),
                'credibility-story' => array(
                    'title' => 'Credibility Story Generator',
                    'description' => 'Build stories that establish your expertise.',
                    'icon' => 'shield',
                    'slug' => 'credibility-story-generator'
                ),
                'framework' => array(
                    'title' => 'Framework Builder',
                    'description' => 'Create your proprietary methodology framework.',
                    'icon' => 'grid',
                    'slug' => 'framework-builder'
                ),
                'interview-prep' => array(
                    'title' => 'Interview Prep Generator',
                    'description' => 'Prepare talking points and answers for interviews.',
                    'icon' => 'clipboard',
                    'slug' => 'interview-prep-generator'
                )
            )
        ),
        'content' => array(
            'label' => 'Content',
            'description' => 'Generate long-form content and press materials',
            'icon' => 'file-text',
            'tools' => array(
                'blog' => array(
                    'title' => 'Blog Post Generator',
                    'description' => 'Create SEO-optimized blog posts from your expertise.',
                    'icon' => 'edit',
                    'slug' => 'blog-generator'
                ),
                'content-repurpose' => array(
                    'title' => 'Content Repurposer',
                    'description' => 'Transform content into multiple formats.',
                    'icon' => 'refresh-cw',
                    'slug' => 'content-repurposer'
                ),
                'press-release' => array(
                    'title' => 'Press Release Generator',
                    'description' => 'Write professional press releases for announcements.',
                    'icon' => 'send',
                    'slug' => 'press-release-generator'
                )
            )
        ),
        'social-email' => array(
            'label' => 'Social & Email',
            'description' => 'Create content for social media and email marketing',
            'icon' => 'share-2',
            'tools' => array(
                'social-post' => array(
                    'title' => 'Social Post Generator',
                    'description' => 'Create engaging posts for LinkedIn, Twitter, and more.',
                    'icon' => 'share',
                    'slug' => 'social-post-generator'
                ),
                'email' => array(
                    'title' => 'Email Writer',
                    'description' => 'Write compelling emails that convert.',
                    'icon' => 'mail',
                    'slug' => 'email-writer'
                ),
                'newsletter' => array(
                    'title' => 'Newsletter Writer',
                    'description' => 'Create engaging newsletter content.',
                    'icon' => 'inbox',
                    'slug' => 'newsletter-writer'
                ),
                'youtube-description' => array(
                    'title' => 'YouTube Description Generator',
                    'description' => 'Write SEO-optimized YouTube video descriptions.',
                    'icon' => 'youtube',
                    'slug' => 'youtube-description-generator'
                ),
                'podcast-notes' => array(
                    'title' => 'Podcast Show Notes',
                    'description' => 'Generate comprehensive podcast show notes.',
                    'icon' => 'headphones',
                    'slug' => 'podcast-show-notes-generator'
                ),
                'seo-optimizer' => array(
                    'title' => 'SEO Content Optimizer',
                    'description' => 'Optimize your content for search engines.',
                    'icon' => 'search',
                    'slug' => 'seo-optimizer'
                )
            )
        )
    );

    /**
     * Constructor
     */
    private function __construct() {
        // Register the generic shortcode
        add_shortcode('gmkb_free_tool', array($this, 'render'));

        // Register the tools directory shortcode
        add_shortcode('gmkb_tools_directory', array($this, 'render_directory'));

        // Register individual shortcodes dynamically for each tool type
        foreach ($this->valid_types as $type) {
            $shortcode_tag = 'gmkb_' . str_replace('-', '_', $type);
            add_shortcode($shortcode_tag, array($this, 'render_from_tag'));
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB Free Tools Shortcode: Registered ' . (count($this->valid_types) + 2) . ' shortcodes');
        }
    }

    /**
     * Generic renderer for individual tool shortcodes.
     * Derives tool type from the shortcode tag.
     *
     * @param array  $atts    Shortcode attributes.
     * @param string $content Shortcode content.
     * @param string $tag     The shortcode tag.
     * @return string HTML output.
     */
    public function render_from_tag($atts, $content = null, $tag = '') {
        // Convert shortcode tag to tool type (gmkb_brand_story -> brand-story)
        $type = str_replace('gmkb_', '', $tag);
        $type = str_replace('_', '-', $type);

        // Validate type (safeguard)
        if (!in_array($type, $this->valid_types)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Free Tools: Invalid dynamic shortcode tag "' . $tag . '"');
            }
            return '<!-- GMKB: Invalid tool type -->';
        }

        $atts = is_array($atts) ? $atts : array();
        $atts['type'] = $type;
        return $this->render($atts);
    }

    /**
     * Render the shortcode
     *
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render($atts) {
        $atts = shortcode_atts(array(
            'type' => 'biography',
            'title' => '',
            'description' => '',
            'class' => '',
            'theme' => 'light',  // light or dark
            'cta_text' => 'Get Unlimited Access',
            'cta_url' => '',
            'show_usage' => 'true'
        ), $atts, 'gmkb_free_tool');

        // Validate type
        if (!in_array($atts['type'], $this->valid_types)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Free Tools: Invalid type "' . $atts['type'] . '"');
            }
            return '<!-- GMKB: Invalid tool type "' . esc_attr($atts['type']) . '" -->';
        }

        // Enqueue assets (only once per page)
        $this->enqueue_assets();

        // Generate unique ID
        $unique_id = 'gmkb-free-tool-' . wp_generate_uuid4();

        // Build CSS classes
        $classes = array(
            'gmkb-free-tool-container',
            'gmkb-free-tool--' . esc_attr($atts['type']),
            'gmkb-free-tool--theme-' . esc_attr($atts['theme'])
        );

        if (!empty($atts['class'])) {
            $classes[] = esc_attr($atts['class']);
        }

        // Build data attributes for Vue initialization
        // Note: Nonce is passed globally via wp_localize_script (gmkbPublicData.publicNonce)
        $data_attrs = array(
            'data-gmkb-tool' => esc_attr($atts['type']),
            'data-gmkb-title' => esc_attr($atts['title']),
            'data-gmkb-description' => esc_attr($atts['description']),
            'data-gmkb-theme' => esc_attr($atts['theme']),
            'data-gmkb-cta-text' => esc_attr($atts['cta_text']),
            'data-gmkb-cta-url' => esc_attr($atts['cta_url'] ?: home_url('/pricing/')),
            'data-gmkb-show-usage' => esc_attr($atts['show_usage'])
        );

        $data_attrs_string = '';
        foreach ($data_attrs as $key => $value) {
            $data_attrs_string .= ' ' . $key . '="' . $value . '"';
        }

        // Build HTML output
        $html = sprintf(
            '<div id="%s" class="%s"%s></div>',
            esc_attr($unique_id),
            esc_attr(implode(' ', $classes)),
            $data_attrs_string
        );

        // Add loading placeholder (replaced by Vue when mounted)
        $html .= '<noscript>';
        $html .= '<div class="gmkb-free-tool-noscript">';
        $html .= '<p>This tool requires JavaScript to run. Please enable JavaScript in your browser.</p>';
        $html .= '</div>';
        $html .= '</noscript>';

        return $html;
    }

    /**
     * Render the tools directory shortcode
     *
     * Usage: [gmkb_tools_directory]
     * Options:
     *   - base_url: Base URL for tool links (default: /tools/)
     *   - layout: 'grid' or 'list' (default: grid)
     *   - show_descriptions: 'true' or 'false' (default: true)
     *   - category: Filter to specific category (default: all)
     *   - columns: Number of columns for grid (default: 3)
     *
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function render_directory($atts) {
        $atts = shortcode_atts(array(
            'base_url' => '/tools/',
            'layout' => 'grid',
            'show_descriptions' => 'true',
            'category' => '',
            'columns' => '3',
            'class' => ''
        ), $atts, 'gmkb_tools_directory');

        // Ensure base_url has trailing slash
        $base_url = trailingslashit($atts['base_url']);
        $show_descriptions = $atts['show_descriptions'] === 'true';
        $columns = intval($atts['columns']);
        if ($columns < 1 || $columns > 4) {
            $columns = 3;
        }

        // Enqueue directory styles
        $this->enqueue_directory_styles();

        // Build CSS classes
        $container_classes = array(
            'gmkb-tools-directory',
            'gmkb-tools-directory--' . esc_attr($atts['layout']),
            'gmkb-tools-directory--cols-' . $columns
        );
        if (!empty($atts['class'])) {
            $container_classes[] = esc_attr($atts['class']);
        }

        $html = '<div class="' . esc_attr(implode(' ', $container_classes)) . '">';

        // Filter categories if specified
        $categories = $this->tools_by_category;
        if (!empty($atts['category']) && isset($categories[$atts['category']])) {
            $categories = array($atts['category'] => $categories[$atts['category']]);
        }

        foreach ($categories as $category_key => $category) {
            $html .= '<div class="gmkb-tools-category" id="tools-' . esc_attr($category_key) . '">';

            // Category header
            $html .= '<div class="gmkb-tools-category__header">';
            $html .= '<h2 class="gmkb-tools-category__title">' . esc_html($category['label']) . '</h2>';
            if ($show_descriptions && !empty($category['description'])) {
                $html .= '<p class="gmkb-tools-category__description">' . esc_html($category['description']) . '</p>';
            }
            $html .= '</div>';

            // Tools grid/list
            $html .= '<div class="gmkb-tools-category__tools">';

            foreach ($category['tools'] as $tool_key => $tool) {
                $tool_url = home_url($base_url . $tool['slug'] . '/');

                $html .= '<a href="' . esc_url($tool_url) . '" class="gmkb-tool-card">';
                $html .= '<div class="gmkb-tool-card__icon">';
                $html .= $this->get_icon_svg($tool['icon']);
                $html .= '</div>';
                $html .= '<div class="gmkb-tool-card__content">';
                $html .= '<h3 class="gmkb-tool-card__title">' . esc_html($tool['title']) . '</h3>';
                if ($show_descriptions && !empty($tool['description'])) {
                    $html .= '<p class="gmkb-tool-card__description">' . esc_html($tool['description']) . '</p>';
                }
                $html .= '</div>';
                $html .= '<div class="gmkb-tool-card__arrow">';
                $html .= $this->get_icon_svg('arrow-right');
                $html .= '</div>';
                $html .= '</a>';
            }

            $html .= '</div>'; // .gmkb-tools-category__tools
            $html .= '</div>'; // .gmkb-tools-category
        }

        $html .= '</div>'; // .gmkb-tools-directory

        return $html;
    }

    /**
     * Get SVG icon markup
     *
     * @param string $icon Icon name
     * @return string SVG markup
     */
    private function get_icon_svg($icon) {
        $icons = array(
            'user' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
            'list' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
            'help-circle' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            'tag' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>',
            'mic' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>',
            'package' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>',
            'trending-up' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>',
            'volume-2' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>',
            'zap' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
            'target' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',
            'users' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
            'book-open' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',
            'edit-3' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>',
            'shield' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
            'grid' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
            'clipboard' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>',
            'edit' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
            'refresh-cw' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>',
            'send' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
            'share' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>',
            'mail' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
            'inbox' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>',
            'youtube' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>',
            'headphones' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>',
            'search' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
            'arrow-right' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
            'message-square' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
            'award' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>',
            'compass' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>',
            'file-text' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
            'share-2' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>'
        );

        return isset($icons[$icon]) ? $icons[$icon] : '';
    }

    /**
     * Enqueue directory-specific styles
     */
    private function enqueue_directory_styles() {
        wp_enqueue_style(
            'gmkb-tools-directory',
            false // Inline styles
        );

        wp_add_inline_style('gmkb-tools-directory', $this->get_directory_styles());
    }

    /**
     * Get CSS styles for the tools directory
     *
     * @return string CSS styles
     */
    private function get_directory_styles() {
        return '
/* Tools Directory Styles */
.gmkb-tools-directory {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.gmkb-tools-category {
    margin-bottom: 3rem;
}

.gmkb-tools-category__header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e5e7eb;
}

.gmkb-tools-category__title {
    margin: 0 0 0.5rem;
    font-size: 1.75rem;
    font-weight: 700;
    color: #111827;
}

.gmkb-tools-category__description {
    margin: 0;
    font-size: 1rem;
    color: #6b7280;
}

/* Grid Layout */
.gmkb-tools-directory--grid .gmkb-tools-category__tools {
    display: grid;
    gap: 1.5rem;
}

.gmkb-tools-directory--cols-2 .gmkb-tools-category__tools {
    grid-template-columns: repeat(2, 1fr);
}

.gmkb-tools-directory--cols-3 .gmkb-tools-category__tools {
    grid-template-columns: repeat(3, 1fr);
}

.gmkb-tools-directory--cols-4 .gmkb-tools-category__tools {
    grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 1024px) {
    .gmkb-tools-directory--cols-4 .gmkb-tools-category__tools,
    .gmkb-tools-directory--cols-3 .gmkb-tools-category__tools {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 640px) {
    .gmkb-tools-directory--cols-4 .gmkb-tools-category__tools,
    .gmkb-tools-directory--cols-3 .gmkb-tools-category__tools,
    .gmkb-tools-directory--cols-2 .gmkb-tools-category__tools {
        grid-template-columns: 1fr;
    }
}

/* List Layout */
.gmkb-tools-directory--list .gmkb-tools-category__tools {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

/* Tool Card */
.gmkb-tool-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s ease;
}

.gmkb-tool-card:hover {
    border-color: #6366f1;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
    transform: translateY(-2px);
}

.gmkb-tool-card__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border-radius: 10px;
    color: #fff;
}

.gmkb-tool-card__icon svg {
    width: 24px;
    height: 24px;
}

.gmkb-tool-card__content {
    flex: 1;
    min-width: 0;
}

.gmkb-tool-card__title {
    margin: 0 0 0.25rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
}

.gmkb-tool-card__description {
    margin: 0;
    font-size: 0.875rem;
    color: #6b7280;
    line-height: 1.5;
}

.gmkb-tool-card__arrow {
    flex-shrink: 0;
    color: #9ca3af;
    transition: transform 0.2s ease, color 0.2s ease;
}

.gmkb-tool-card__arrow svg {
    width: 20px;
    height: 20px;
}

.gmkb-tool-card:hover .gmkb-tool-card__arrow {
    color: #6366f1;
    transform: translateX(4px);
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
    .gmkb-tools-directory {
        background: #111827;
    }

    .gmkb-tools-category__header {
        border-bottom-color: #374151;
    }

    .gmkb-tools-category__title {
        color: #f9fafb;
    }

    .gmkb-tools-category__description {
        color: #9ca3af;
    }

    .gmkb-tool-card {
        background: #1f2937;
        border-color: #374151;
    }

    .gmkb-tool-card:hover {
        border-color: #6366f1;
    }

    .gmkb-tool-card__title {
        color: #f9fafb;
    }

    .gmkb-tool-card__description {
        color: #9ca3af;
    }
}
';
    }

    /**
     * Get all tools organized by category (public accessor)
     *
     * @return array Tools by category
     */
    public function get_tools_by_category() {
        return $this->tools_by_category;
    }

    /**
     * Get tool info by type
     *
     * @param string $type Tool type (e.g., 'biography', 'topics')
     * @return array|null Tool info or null if not found
     */
    public function get_tool_info($type) {
        foreach ($this->tools_by_category as $category) {
            if (isset($category['tools'][$type])) {
                return $category['tools'][$type];
            }
        }
        return null;
    }

    /**
     * Enqueue required assets
     */
    private function enqueue_assets() {
        if ($this->enqueued) {
            return;
        }

        // Check if the SEO tools bundle exists (built from Vue)
        $seo_tools_js = GMKB_PLUGIN_DIR . 'dist/seo-tools/seo-tools.iife.js';
        $seo_tools_css = GMKB_PLUGIN_DIR . 'dist/seo-tools/seo-tools.css';

        // Use full builder bundle as fallback until standalone bundle is built
        $use_standalone = file_exists($seo_tools_js);

        if ($use_standalone) {
            // Enqueue standalone SEO tools bundle (lightweight, ~50KB)
            wp_enqueue_style(
                'gmkb-seo-tools',
                GMKB_PLUGIN_URL . 'dist/seo-tools/seo-tools.css',
                array(),
                GMKB_VERSION
            );

            wp_enqueue_script(
                'gmkb-seo-tools',
                GMKB_PLUGIN_URL . 'dist/seo-tools/seo-tools.iife.js',
                array(),
                GMKB_VERSION,
                true
            );

            $script_handle = 'gmkb-seo-tools';

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Free Tools: Using standalone SEO tools bundle');
            }
        } else {
            // Fallback: Use placeholder inline script until Vue bundle is built
            // This provides basic functionality for testing
            wp_enqueue_style(
                'gmkb-free-tools-placeholder',
                false // No CSS file, just register
            );

            // Add inline placeholder styles
            wp_add_inline_style('gmkb-free-tools-placeholder', $this->get_placeholder_styles());

            wp_enqueue_script(
                'gmkb-free-tools-placeholder',
                false, // No JS file, just register
                array(),
                GMKB_VERSION,
                true
            );

            // Add inline placeholder script
            wp_add_inline_script('gmkb-free-tools-placeholder', $this->get_placeholder_script());

            $script_handle = 'gmkb-free-tools-placeholder';

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Free Tools: Using placeholder (Vue bundle not built yet)');
            }
        }

        // CRITICAL: Pass public nonce to JavaScript
        // This nonce is verified by the AI Controller for public requests
        wp_localize_script($script_handle, 'gmkbPublicData', array(
            'restUrl' => rest_url('gmkb/v2/'),
            'publicNonce' => wp_create_nonce('gmkb_public_ai'),
            'siteUrl' => home_url(),
            'signupUrl' => home_url('/pricing/'),
            'version' => GMKB_VERSION,
            'debug' => defined('WP_DEBUG') && WP_DEBUG
        ));

        // Also set as separate variable for backwards compatibility
        wp_add_inline_script(
            $script_handle,
            'window.gmkbPublicNonce = "' . wp_create_nonce('gmkb_public_ai') . '";',
            'before'
        );

        $this->enqueued = true;

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB Free Tools: Assets enqueued with public nonce');
        }
    }

    /**
     * Get placeholder styles for pre-Vue-build state
     *
     * @return string CSS styles
     */
    private function get_placeholder_styles() {
        return '
.gmkb-free-tool-container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 2rem;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.gmkb-free-tool--theme-dark {
    background: #1a1a2e;
    color: #eee;
}

.gmkb-free-tool-placeholder {
    text-align: center;
    padding: 3rem 1rem;
}

.gmkb-free-tool-placeholder h3 {
    margin: 0 0 1rem;
    font-size: 1.5rem;
}

.gmkb-free-tool-placeholder p {
    color: #666;
    margin: 0 0 1.5rem;
}

.gmkb-free-tool--theme-dark .gmkb-free-tool-placeholder p {
    color: #aaa;
}

.gmkb-free-tool-placeholder .gmkb-loading {
    display: inline-block;
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #6366f1;
    border-radius: 50%;
    animation: gmkb-spin 1s linear infinite;
}

@keyframes gmkb-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.gmkb-free-tool-noscript {
    text-align: center;
    padding: 2rem;
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 8px;
    color: #92400e;
}
';
    }

    /**
     * Get placeholder script for pre-Vue-build state
     *
     * @return string JavaScript code
     */
    private function get_placeholder_script() {
        return '
(function() {
    "use strict";

    // Tool display names
    var toolNames = {
        // Message Builder
        "biography": "Biography Generator",
        "topics": "Topics Generator",
        "questions": "Questions Generator",
        "tagline": "Tagline Generator",
        "guest-intro": "Guest Intro Generator",
        "offers": "Offers Generator",
        // Value Builder
        "elevator-pitch": "Elevator Pitch Generator",
        "sound-bite": "Sound Bite Generator",
        "authority-hook": "Authority Hook Builder",
        "impact-intro": "Impact Intro Builder",
        "persona": "Persona Generator",
        // Strategy
        "brand-story": "Brand Story Generator",
        "signature-story": "Signature Story Generator",
        "credibility-story": "Credibility Story Generator",
        "framework": "Framework Builder",
        "interview-prep": "Interview Prep Generator",
        // Content
        "blog": "Blog Post Generator",
        "content-repurpose": "Content Repurposer",
        "press-release": "Press Release Generator",
        // Social/Email
        "social-post": "Social Post Generator",
        "email": "Email Writer",
        "newsletter": "Newsletter Writer",
        "youtube-description": "YouTube Description Generator",
        "podcast-notes": "Podcast Notes Generator",
        "seo-optimizer": "SEO Optimizer"
    };

    // Initialize placeholders when DOM is ready
    document.addEventListener("DOMContentLoaded", function() {
        var containers = document.querySelectorAll("[data-gmkb-tool]");

        containers.forEach(function(container) {
            var type = container.getAttribute("data-gmkb-tool");
            var title = container.getAttribute("data-gmkb-title") || "AI " + (toolNames[type] || "Content Generator");

            // Create placeholder content
            var placeholder = document.createElement("div");
            placeholder.className = "gmkb-free-tool-placeholder";
            placeholder.innerHTML = "<div class=\"gmkb-loading\"></div>" +
                "<h3>" + title + "</h3>" +
                "<p>Loading AI tool...</p>" +
                "<p style=\"font-size: 0.875rem; color: #999;\">Vue component bundle will replace this placeholder when built.</p>";

            container.appendChild(placeholder);

            console.log("[GMKB] Free tool placeholder rendered for:", type);
            console.log("[GMKB] Public nonce available:", !!window.gmkbPublicNonce);
        });
    });
})();
';
    }

    /**
     * Get tool configuration for a specific type
     *
     * @param string $type Tool type
     * @return array Tool configuration
     */
    public static function get_tool_config($type) {
        $configs = array(
            'biography' => array(
                'title' => 'AI Biography Generator',
                'description' => 'Generate professional biographies in seconds.',
                'icon' => 'user',
                'fields' => array('name', 'authorityHook', 'tone', 'length', 'pov')
            ),
            'topics' => array(
                'title' => 'AI Topics Generator',
                'description' => 'Create compelling interview and speaking topics.',
                'icon' => 'list',
                'fields' => array('authorityHook', 'expertise')
            ),
            'questions' => array(
                'title' => 'AI Questions Generator',
                'description' => 'Generate 25 engaging interview questions.',
                'icon' => 'help-circle',
                'fields' => array('authorityHook', 'topics')
            ),
            'tagline' => array(
                'title' => 'AI Tagline Generator',
                'description' => 'Create memorable taglines for your brand.',
                'icon' => 'tag',
                'fields' => array('authorityHook', 'name', 'tone')
            ),
            'guest-intro' => array(
                'title' => 'AI Guest Intro Generator',
                'description' => 'Write compelling guest introductions.',
                'icon' => 'mic',
                'fields' => array('name', 'biography', 'credentials', 'tagline')
            ),
            'offers' => array(
                'title' => 'AI Offers Generator',
                'description' => 'Create service packages and offers.',
                'icon' => 'package',
                'fields' => array('authorityHook', 'services')
            ),
            'authority-hook' => array(
                'title' => 'AI Authority Hook Builder',
                'description' => 'Create your unique authority positioning statement.',
                'icon' => 'zap',
                'fields' => array('name', 'expertise', 'audience', 'outcome')
            )
        );

        return isset($configs[$type]) ? $configs[$type] : null;
    }
}

// Initialize the shortcode
GMKB_Free_Tools_Shortcode::instance();
