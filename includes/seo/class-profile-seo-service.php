<?php
/**
 * Profile SEO Service
 *
 * Handles SEO meta tags and Schema.org structured data output
 * for user profile pages (media kits).
 *
 * @package GMKB
 * @since 2.3.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Profile_SEO_Service {

    /**
     * Singleton instance
     *
     * @var self|null
     */
    private static ?self $instance = null;

    /**
     * Get singleton instance
     *
     * @return self
     */
    public static function get_instance(): self {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        $this->init_hooks();
    }

    /**
     * Initialize WordPress hooks
     */
    private function init_hooks(): void {
        // Hook for schema output (called from template)
        add_action('gmkb_profile_head_schema', [$this, 'output_schema_markup']);

        // Hook for enhanced meta tags
        add_action('gmkb_profile_head_meta', [$this, 'output_meta_tags']);

        // Also hook into wp_head for media kit pages
        add_action('wp_head', [$this, 'maybe_output_on_wp_head'], 5);
    }

    /**
     * Check if current page is a media kit profile
     *
     * @return int|false Post ID if media kit page, false otherwise
     */
    private function is_media_kit_page() {
        global $post;

        // Check if we have a global media kit post ID
        if (isset($GLOBALS['gmkb_media_kit_post_id'])) {
            return (int) $GLOBALS['gmkb_media_kit_post_id'];
        }

        // Check post type
        if ($post && $post->post_type === 'guests') {
            return $post->ID;
        }

        return false;
    }

    /**
     * Maybe output schema on wp_head (fallback for templates without hook)
     */
    public function maybe_output_on_wp_head(): void {
        $post_id = $this->is_media_kit_page();

        if (!$post_id) {
            return;
        }

        // Check if schema is enabled for this profile
        if (!$this->is_schema_enabled($post_id)) {
            return;
        }

        // Output schema
        $this->output_schema_markup($post_id);

        // Output enhanced meta tags
        $this->output_meta_tags($post_id);
    }

    /**
     * Check if schema is enabled for a profile
     *
     * @param int $post_id Profile post ID
     * @return bool Whether schema is enabled
     */
    private function is_schema_enabled(int $post_id): bool {
        // Check premium feature access
        if (class_exists('GMKB_Premium_Features')) {
            if (!GMKB_Premium_Features::is_enabled_for_profile(
                GMKB_Premium_Features::FEATURE_SCHEMA_SEO,
                $post_id
            )) {
                return false;
            }
        }

        // Check if user has enabled schema for this profile
        $schema_enabled = get_post_meta($post_id, 'seo_schema_enabled', true);

        // Default to enabled if premium access is granted
        if ($schema_enabled === '') {
            return true; // Default enabled for premium users
        }

        return (bool) $schema_enabled;
    }

    /**
     * Get enabled schema types for a profile
     *
     * @param int $post_id Profile post ID
     * @return array Array of enabled schema type strings
     */
    private function get_enabled_schema_types(int $post_id): array {
        $types = get_post_meta($post_id, 'seo_schema_types', true);

        if (!is_array($types) || empty($types)) {
            // Default schema types
            return ['person', 'profilepage', 'breadcrumb'];
        }

        return $types;
    }

    /**
     * Output Schema.org markup for a profile
     *
     * @param int $post_id Profile post ID
     */
    public function output_schema_markup(int $post_id): void {
        // Prevent duplicate output
        static $output_for = [];
        if (isset($output_for[$post_id])) {
            return;
        }
        $output_for[$post_id] = true;

        // Require the schema markup class
        if (!class_exists('GMKB_Profile_Schema_Markup')) {
            $schema_file = dirname(__DIR__, 2) . '/system/class-profile-schema-markup.php';
            if (file_exists($schema_file)) {
                require_once $schema_file;
            } else {
                return;
            }
        }

        // Get enabled schema types
        $enabled_types = $this->get_enabled_schema_types($post_id);

        // Check FAQ schema premium feature
        if (in_array('faq', $enabled_types, true)) {
            if (class_exists('GMKB_Premium_Features')) {
                if (!GMKB_Premium_Features::is_enabled_for_profile(
                    GMKB_Premium_Features::FEATURE_SCHEMA_FAQ,
                    $post_id
                )) {
                    $enabled_types = array_diff($enabled_types, ['faq']);
                }
            }
        }

        // Generate and output schema
        $markup = new GMKB_Profile_Schema_Markup($post_id);
        echo $markup->output_all_schemas($enabled_types);
    }

    /**
     * Output enhanced meta tags for a profile
     *
     * @param int $post_id Profile post ID
     */
    public function output_meta_tags(int $post_id): void {
        // Prevent duplicate output
        static $meta_output_for = [];
        if (isset($meta_output_for[$post_id])) {
            return;
        }
        $meta_output_for[$post_id] = true;

        // Get profile data
        $full_name = $this->get_profile_name($post_id);
        $description = $this->get_profile_description($post_id);
        $image_url = $this->get_profile_image($post_id);
        $url = get_permalink($post_id);

        // Custom SEO overrides (premium feature)
        $custom_title = get_post_meta($post_id, 'seo_custom_title', true);
        $custom_description = get_post_meta($post_id, 'seo_custom_description', true);

        if (!empty($custom_title)) {
            $full_name = $custom_title;
        }
        if (!empty($custom_description)) {
            $description = $custom_description;
        }

        $title = $full_name . ' - Media Kit';

        // Output Open Graph tags
        echo "\n<!-- GMKB SEO Meta Tags -->\n";
        echo '<meta property="og:type" content="profile">' . "\n";
        echo '<meta property="og:title" content="' . esc_attr($title) . '">' . "\n";
        echo '<meta property="og:description" content="' . esc_attr($description) . '">' . "\n";
        echo '<meta property="og:url" content="' . esc_url($url) . '">' . "\n";
        echo '<meta property="og:site_name" content="' . esc_attr(get_bloginfo('name')) . '">' . "\n";

        if ($image_url) {
            echo '<meta property="og:image" content="' . esc_url($image_url) . '">' . "\n";
        }

        // Output Twitter Card tags
        echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
        echo '<meta name="twitter:title" content="' . esc_attr($title) . '">' . "\n";
        echo '<meta name="twitter:description" content="' . esc_attr($description) . '">' . "\n";

        if ($image_url) {
            echo '<meta name="twitter:image" content="' . esc_url($image_url) . '">' . "\n";
        }

        // Canonical URL
        echo '<link rel="canonical" href="' . esc_url($url) . '">' . "\n";

        // Person-specific meta
        echo '<meta property="profile:first_name" content="' . esc_attr(get_post_meta($post_id, 'first_name', true)) . '">' . "\n";
        echo '<meta property="profile:last_name" content="' . esc_attr(get_post_meta($post_id, 'last_name', true)) . '">' . "\n";

        echo "<!-- /GMKB SEO Meta Tags -->\n\n";
    }

    /**
     * Get profile full name
     *
     * @param int $post_id Profile post ID
     * @return string Full name
     */
    private function get_profile_name(int $post_id): string {
        $full_name = get_post_meta($post_id, 'full_name', true);
        if (!empty($full_name)) {
            return $full_name;
        }

        $first = get_post_meta($post_id, 'first_name', true);
        $last = get_post_meta($post_id, 'last_name', true);

        return trim($first . ' ' . $last);
    }

    /**
     * Get profile description for meta tags
     *
     * @param int $post_id Profile post ID
     * @return string Description text
     */
    private function get_profile_description(int $post_id): string {
        // Try tagline first
        $description = get_post_meta($post_id, 'tagline', true);

        // Fall back to authority hook
        if (empty($description)) {
            $description = get_post_meta($post_id, 'authority_hook', true);
        }

        // Fall back to biography
        if (empty($description)) {
            $description = get_post_meta($post_id, 'biography', true);
        }

        // Clean and truncate
        $description = wp_strip_all_tags($description);
        $description = preg_replace('/\s+/', ' ', $description);
        $description = trim($description);

        if (strlen($description) > 160) {
            $description = substr($description, 0, 157) . '...';
        }

        return $description;
    }

    /**
     * Get profile headshot image URL
     *
     * @param int $post_id Profile post ID
     * @return string|null Image URL or null
     */
    private function get_profile_image(int $post_id): ?string {
        $headshot = get_post_meta($post_id, 'headshot_primary', true);

        if (empty($headshot)) {
            return null;
        }

        // Handle array format
        if (is_array($headshot)) {
            if (isset($headshot['url'])) {
                return $headshot['url'];
            }
            if (isset($headshot['ID'])) {
                $headshot = $headshot['ID'];
            } elseif (isset($headshot['id'])) {
                $headshot = $headshot['id'];
            }
        }

        // Handle attachment ID
        if (is_numeric($headshot)) {
            return wp_get_attachment_url((int) $headshot);
        }

        // Handle URL string
        if (is_string($headshot) && filter_var($headshot, FILTER_VALIDATE_URL)) {
            return $headshot;
        }

        return null;
    }

    /**
     * Get schema preview data for the admin UI
     *
     * @param int $post_id Profile post ID
     * @return array Preview data
     */
    public function get_schema_preview(int $post_id): array {
        if (!class_exists('GMKB_Profile_Schema_Markup')) {
            $schema_file = dirname(__DIR__, 2) . '/system/class-profile-schema-markup.php';
            if (file_exists($schema_file)) {
                require_once $schema_file;
            }
        }

        $enabled_types = $this->get_enabled_schema_types($post_id);
        $markup = new GMKB_Profile_Schema_Markup($post_id);

        return [
            'enabled' => $this->is_schema_enabled($post_id),
            'types' => $enabled_types,
            'json' => $markup->get_schema_json($enabled_types),
            'preview' => $markup->generate_combined_schema($enabled_types),
        ];
    }

    /**
     * Update schema settings for a profile
     *
     * @param int   $post_id  Profile post ID
     * @param bool  $enabled  Whether schema is enabled
     * @param array $types    Array of enabled schema types
     * @return bool Whether update was successful
     */
    public function update_schema_settings(int $post_id, bool $enabled, array $types = []): bool {
        // Validate types
        $valid_types = ['person', 'profilepage', 'faq', 'breadcrumb', 'speakable'];
        $types = array_intersect($types, $valid_types);

        update_post_meta($post_id, 'seo_schema_enabled', $enabled ? '1' : '0');
        update_post_meta($post_id, 'seo_schema_types', $types);

        return true;
    }
}

// Initialize the service
add_action('init', function() {
    GMKB_Profile_SEO_Service::get_instance();
}, 20);
