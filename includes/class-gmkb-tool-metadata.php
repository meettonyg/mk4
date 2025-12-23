<?php
/**
 * GMKB Tool Metadata Handler
 *
 * Reads tool meta.json files from the Vue components directory and provides
 * server-side access to tool metadata for SEO tag generation and landing pages.
 *
 * @package GMKB
 * @subpackage Metadata
 * @version 1.0.0
 * @since 2.3.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Tool_Metadata {

    /**
     * Singleton instance
     * @var GMKB_Tool_Metadata
     */
    private static $instance = null;

    /**
     * Cache of loaded tool metadata
     * @var array
     */
    private $tools_cache = null;

    /**
     * Path to generators directory
     * @var string
     */
    private $generators_path;

    /**
     * Category configuration
     * @var array
     */
    private $categories = array(
        'message-builder' => array(
            'name' => 'Message Builder',
            'description' => 'Create compelling bios, topics, and core messaging',
            'order' => 1,
        ),
        'value-builder' => array(
            'name' => 'Value Builder',
            'description' => 'Craft your elevator pitch, sound bites, and authority positioning',
            'order' => 2,
        ),
        'strategy' => array(
            'name' => 'Strategy',
            'description' => 'Develop your brand story, frameworks, and interview preparation',
            'order' => 3,
        ),
        'content' => array(
            'name' => 'Content',
            'description' => 'Generate blogs, press releases, and repurposed content',
            'order' => 4,
        ),
        'social-email' => array(
            'name' => 'Social & Email',
            'description' => 'Create social posts, emails, newsletters, and show notes',
            'order' => 5,
        ),
    );

    /**
     * Get singleton instance
     *
     * @return GMKB_Tool_Metadata
     */
    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Private constructor
     */
    private function __construct() {
        // Set path to generators directory relative to plugin root
        $this->generators_path = GMKB_PLUGIN_DIR . 'src/vue/components/generators/';
    }

    /**
     * Load all tool metadata from meta.json files
     *
     * @return array Associative array of tools by slug
     */
    private function load_all_tools() {
        if (null !== $this->tools_cache) {
            return $this->tools_cache;
        }

        $this->tools_cache = array();

        // Check if generators directory exists
        if (!is_dir($this->generators_path)) {
            return $this->tools_cache;
        }

        // Scan for tool directories
        $dirs = glob($this->generators_path . '*', GLOB_ONLYDIR);

        foreach ($dirs as $dir) {
            $meta_file = $dir . '/meta.json';

            if (file_exists($meta_file)) {
                $json_content = file_get_contents($meta_file);
                $meta = json_decode($json_content, true);

                if ($meta && isset($meta['slug'])) {
                    $this->tools_cache[$meta['slug']] = $meta;
                }
            }
        }

        return $this->tools_cache;
    }

    /**
     * Get all tools
     *
     * @return array Array of all tool metadata
     */
    public function get_all_tools() {
        return array_values($this->load_all_tools());
    }

    /**
     * Get a tool by slug
     *
     * @param string $slug The tool slug (e.g., 'topics-generator')
     * @return array|null Tool metadata or null if not found
     */
    public function get_tool_by_slug($slug) {
        $tools = $this->load_all_tools();
        return isset($tools[$slug]) ? $tools[$slug] : null;
    }

    /**
     * Get tools by category
     *
     * @param string $category Category slug
     * @return array Array of tools in the category
     */
    public function get_tools_by_category($category) {
        $all_tools = $this->get_all_tools();
        return array_filter($all_tools, function($tool) use ($category) {
            return isset($tool['category']) && $tool['category'] === $category;
        });
    }

    /**
     * Get tools grouped by category
     *
     * @return array Tools organized by category
     */
    public function get_tools_grouped_by_category() {
        $all_tools = $this->get_all_tools();
        $grouped = array();

        // Initialize categories
        foreach ($this->categories as $slug => $config) {
            $grouped[$slug] = array_merge($config, array(
                'slug' => $slug,
                'tools' => array(),
            ));
        }

        // Assign tools to categories
        foreach ($all_tools as $tool) {
            $category = isset($tool['category']) ? $tool['category'] : 'message-builder';
            if (isset($grouped[$category])) {
                $grouped[$category]['tools'][] = $tool;
            }
        }

        // Sort by order
        uasort($grouped, function($a, $b) {
            return $a['order'] - $b['order'];
        });

        return $grouped;
    }

    /**
     * Get related tools for a given tool
     *
     * @param string $slug Tool slug
     * @return array Array of related tool metadata
     */
    public function get_related_tools($slug) {
        $tool = $this->get_tool_by_slug($slug);

        if (!$tool || !isset($tool['landingContent']['relatedToolSlugs'])) {
            return array();
        }

        $related = array();
        foreach ($tool['landingContent']['relatedToolSlugs'] as $related_slug) {
            $related_tool = $this->get_tool_by_slug($related_slug);
            if ($related_tool) {
                $related[] = $related_tool;
            }
        }

        return $related;
    }

    /**
     * Get SEO metadata for a tool
     *
     * @param string $slug Tool slug
     * @return array|null SEO metadata or null if not found
     */
    public function get_seo_meta($slug) {
        $tool = $this->get_tool_by_slug($slug);

        if (!$tool || !isset($tool['seoMeta'])) {
            return null;
        }

        return $tool['seoMeta'];
    }

    /**
     * Get landing page content for a tool
     *
     * @param string $slug Tool slug
     * @return array|null Landing content or null if not found
     */
    public function get_landing_content($slug) {
        $tool = $this->get_tool_by_slug($slug);

        if (!$tool || !isset($tool['landingContent'])) {
            return null;
        }

        return $tool['landingContent'];
    }

    /**
     * Get category configuration
     *
     * @param string $category Category slug
     * @return array|null Category config or null if not found
     */
    public function get_category_config($category) {
        return isset($this->categories[$category]) ? $this->categories[$category] : null;
    }

    /**
     * Get all categories
     *
     * @return array All category configurations
     */
    public function get_all_categories() {
        return $this->categories;
    }

    /**
     * Get tool count
     *
     * @return int Number of tools
     */
    public function get_tool_count() {
        return count($this->load_all_tools());
    }

    /**
     * Output SEO meta tags for a tool page
     *
     * @param string $slug Tool slug
     */
    public function output_seo_tags($slug) {
        $seo = $this->get_seo_meta($slug);

        if (!$seo) {
            return;
        }

        // Title tag (handled by filter below)

        // Meta description
        if (!empty($seo['description'])) {
            echo '<meta name="description" content="' . esc_attr($seo['description']) . '">' . "\n";
        }

        // Keywords
        if (!empty($seo['keywords']) && is_array($seo['keywords'])) {
            echo '<meta name="keywords" content="' . esc_attr(implode(', ', $seo['keywords'])) . '">' . "\n";
        }

        // Canonical URL
        if (!empty($seo['canonicalPath'])) {
            echo '<link rel="canonical" href="' . esc_url(home_url($seo['canonicalPath'])) . '">' . "\n";
        }

        // Open Graph tags
        $tool = $this->get_tool_by_slug($slug);
        if ($tool) {
            echo '<meta property="og:title" content="' . esc_attr($seo['title']) . '">' . "\n";
            echo '<meta property="og:description" content="' . esc_attr($seo['description']) . '">' . "\n";
            echo '<meta property="og:type" content="website">' . "\n";
            if (!empty($seo['canonicalPath'])) {
                echo '<meta property="og:url" content="' . esc_url(home_url($seo['canonicalPath'])) . '">' . "\n";
            }
        }

        // Twitter card
        echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
        echo '<meta name="twitter:title" content="' . esc_attr($seo['title']) . '">' . "\n";
        echo '<meta name="twitter:description" content="' . esc_attr($seo['description']) . '">' . "\n";
    }

    /**
     * Get document title for a tool page
     *
     * @param string $slug Tool slug
     * @return string|null Title or null if not found
     */
    public function get_document_title($slug) {
        $seo = $this->get_seo_meta($slug);
        return $seo ? $seo['title'] : null;
    }

    /**
     * Generate JSON-LD structured data for a tool
     *
     * @param string $slug Tool slug
     * @return string JSON-LD script tag
     */
    public function get_json_ld($slug) {
        $tool = $this->get_tool_by_slug($slug);

        if (!$tool) {
            return '';
        }

        $seo = $tool['seoMeta'] ?? array();
        $landing = $tool['landingContent'] ?? array();

        $data = array(
            '@context' => 'https://schema.org',
            '@type' => 'WebApplication',
            'name' => $tool['name'],
            'description' => $tool['shortDescription'],
            'applicationCategory' => 'BusinessApplication',
            'operatingSystem' => 'Web',
            'offers' => array(
                '@type' => 'Offer',
                'price' => '0',
                'priceCurrency' => 'USD',
            ),
        );

        // Add FAQ if available
        if (!empty($landing['faq'])) {
            $faq_data = array(
                '@type' => 'FAQPage',
                'mainEntity' => array(),
            );

            foreach ($landing['faq'] as $item) {
                $faq_data['mainEntity'][] = array(
                    '@type' => 'Question',
                    'name' => $item['question'],
                    'acceptedAnswer' => array(
                        '@type' => 'Answer',
                        'text' => $item['answer'],
                    ),
                );
            }

            // Include as separate graph item
            $data = array(
                '@context' => 'https://schema.org',
                '@graph' => array($data, $faq_data),
            );
        }

        return '<script type="application/ld+json">' . wp_json_encode($data, JSON_UNESCAPED_SLASHES) . '</script>' . "\n";
    }

    /**
     * Clear the tools cache
     */
    public function clear_cache() {
        $this->tools_cache = null;
    }
}

/**
 * Helper function to access the singleton
 *
 * @return GMKB_Tool_Metadata
 */
function gmkb_tool_metadata() {
    return GMKB_Tool_Metadata::instance();
}
