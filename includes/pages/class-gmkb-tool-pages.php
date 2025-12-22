<?php
/**
 * GMKB Tool Pages
 *
 * Creates virtual pages for AI tools without requiring WordPress page creation.
 * Registers rewrite rules for /tools/ and /tools/{slug}/ URLs.
 *
 * URLs:
 * - /tools/                    → Tools directory page
 * - /tools/biography-generator/ → Individual tool landing page
 *
 * SEO Features:
 * - Dynamic title tags from meta.json
 * - Meta descriptions and keywords
 * - Open Graph and Twitter Card tags
 * - JSON-LD structured data (WebApplication + FAQPage)
 * - Canonical URLs
 *
 * @package GMKB
 * @subpackage Pages
 * @version 1.0.0
 * @since 2.3.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Tool_Pages {

    /**
     * Singleton instance
     * @var GMKB_Tool_Pages
     */
    private static $instance = null;

    /**
     * Tool Discovery service
     * @var GMKB_Tool_Discovery
     */
    private $discovery = null;

    /**
     * Base URL path for tools
     * @var string
     */
    private $base_path = 'tools';

    /**
     * Query var for tool slug
     * @var string
     */
    private $query_var = 'gmkb_tool';

    /**
     * Query var for directory page
     * @var string
     */
    private $directory_var = 'gmkb_tools_directory';

    /**
     * Current tool being rendered
     * @var array|null
     */
    private $current_tool = null;

    /**
     * Current tool metadata
     * @var array|null
     */
    private $current_meta = null;

    /**
     * Get singleton instance
     *
     * @return GMKB_Tool_Pages
     */
    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        $this->load_dependencies();
        $this->init_hooks();
    }

    /**
     * Load required dependencies
     */
    private function load_dependencies() {
        $discovery_path = GMKB_PLUGIN_DIR . 'includes/services/class-gmkb-tool-discovery.php';
        if (file_exists($discovery_path)) {
            require_once $discovery_path;
            $this->discovery = GMKB_Tool_Discovery::instance();
        }
    }

    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        // Rewrite rules
        add_action('init', array($this, 'register_rewrite_rules'));
        add_filter('query_vars', array($this, 'register_query_vars'));

        // Template handling
        add_filter('template_include', array($this, 'load_template'));

        // SEO hooks
        add_action('wp_head', array($this, 'output_seo_tags'), 1);
        add_filter('document_title_parts', array($this, 'filter_title'));
        add_filter('pre_get_document_title', array($this, 'get_document_title'), 10);

        // Body class
        add_filter('body_class', array($this, 'add_body_class'));

        // Flush rewrite rules when needed
        add_action('admin_init', array($this, 'maybe_flush_rewrite_rules'));
    }

    /**
     * Register rewrite rules
     */
    public function register_rewrite_rules() {
        // Individual tool pages: /tools/{slug}/
        add_rewrite_rule(
            '^' . $this->base_path . '/([^/]+)/?$',
            'index.php?' . $this->query_var . '=$matches[1]',
            'top'
        );

        // Tools directory: /tools/
        add_rewrite_rule(
            '^' . $this->base_path . '/?$',
            'index.php?' . $this->directory_var . '=1',
            'top'
        );
    }

    /**
     * Register query variables
     *
     * @param array $vars Existing query vars
     * @return array Modified query vars
     */
    public function register_query_vars($vars) {
        $vars[] = $this->query_var;
        $vars[] = $this->directory_var;
        return $vars;
    }

    /**
     * Load custom template for tool pages
     *
     * @param string $template Current template path
     * @return string Modified template path
     */
    public function load_template($template) {
        global $wp_query;

        // Check for individual tool page
        $tool_slug = get_query_var($this->query_var);
        if (!empty($tool_slug)) {
            return $this->load_tool_template($tool_slug);
        }

        // Check for directory page
        if (get_query_var($this->directory_var)) {
            return $this->load_directory_template();
        }

        return $template;
    }

    /**
     * Load template for individual tool page
     *
     * @param string $tool_slug Tool slug
     * @return string Template path
     */
    private function load_tool_template($tool_slug) {
        global $wp_query;

        if (!$this->discovery) {
            $wp_query->set_404();
            return get_404_template();
        }

        // Get tool configuration
        $tool = $this->discovery->get_tool($tool_slug);
        if (!$tool) {
            $wp_query->set_404();
            return get_404_template();
        }

        // Get tool metadata
        $meta = $this->discovery->get_tool_metadata($tool_slug);

        // Store for later use
        $this->current_tool = $tool;
        $this->current_meta = $meta;

        // Mark as not 404
        $wp_query->is_404 = false;
        $wp_query->is_page = true;
        $wp_query->is_singular = true;

        // Check for theme template override
        $theme_template = locate_template(array(
            'gmkb-tool-' . $tool_slug . '.php',
            'gmkb-tool.php',
        ));

        if ($theme_template) {
            return $theme_template;
        }

        // Use plugin template
        $plugin_template = GMKB_PLUGIN_DIR . 'templates/tool-page.php';
        if (file_exists($plugin_template)) {
            return $plugin_template;
        }

        // Fallback: render inline
        return $this->get_inline_template();
    }

    /**
     * Load template for directory page
     *
     * @return string Template path
     */
    private function load_directory_template() {
        global $wp_query;

        // Mark as not 404
        $wp_query->is_404 = false;
        $wp_query->is_page = true;
        $wp_query->is_singular = true;

        // Check for theme template override
        $theme_template = locate_template(array(
            'gmkb-tools-directory.php',
        ));

        if ($theme_template) {
            return $theme_template;
        }

        // Use plugin template
        $plugin_template = GMKB_PLUGIN_DIR . 'templates/tools-directory.php';
        if (file_exists($plugin_template)) {
            return $plugin_template;
        }

        // Fallback: render inline
        return $this->get_directory_inline_template();
    }

    /**
     * Get inline template path for tool pages
     *
     * @return string Template path
     */
    private function get_inline_template() {
        // Create a temporary template
        $template_file = GMKB_PLUGIN_DIR . 'templates/tool-page.php';

        if (!file_exists($template_file)) {
            $this->create_tool_template($template_file);
        }

        return $template_file;
    }

    /**
     * Get inline template path for directory
     *
     * @return string Template path
     */
    private function get_directory_inline_template() {
        $template_file = GMKB_PLUGIN_DIR . 'templates/tools-directory.php';

        if (!file_exists($template_file)) {
            $this->create_directory_template($template_file);
        }

        return $template_file;
    }

    /**
     * Create tool page template file
     *
     * @param string $file Template file path
     */
    private function create_tool_template($file) {
        $dir = dirname($file);
        if (!is_dir($dir)) {
            wp_mkdir_p($dir);
        }

        $template = '<?php
/**
 * Tool Landing Page Template
 * Auto-generated by GMKB_Tool_Pages
 */
get_header();

$pages = GMKB_Tool_Pages::instance();
$pages->render_tool_page();

get_footer();
';
        file_put_contents($file, $template);
    }

    /**
     * Create directory template file
     *
     * @param string $file Template file path
     */
    private function create_directory_template($file) {
        $dir = dirname($file);
        if (!is_dir($dir)) {
            wp_mkdir_p($dir);
        }

        $template = '<?php
/**
 * Tools Directory Template
 * Auto-generated by GMKB_Tool_Pages
 */
get_header();

$pages = GMKB_Tool_Pages::instance();
$pages->render_directory_page();

get_footer();
';
        file_put_contents($file, $template);
    }

    /**
     * Render the tool landing page content
     */
    public function render_tool_page() {
        if (!$this->current_tool || !$this->current_meta) {
            echo '<div class="gmkb-error">Tool not found.</div>';
            return;
        }

        $tool = $this->current_tool;
        $meta = $this->current_meta;
        $landing = isset($meta['landing']) ? $meta['landing'] : array();

        ?>
        <div class="gmkb-tool-landing">
            <!-- Hero Section -->
            <section class="gmkb-tool-hero">
                <div class="gmkb-container">
                    <h1 class="gmkb-tool-hero__title">
                        <?php echo esc_html($landing['hero']['title'] ?? $meta['name']); ?>
                    </h1>
                    <?php if (!empty($landing['hero']['subtitle'])): ?>
                        <p class="gmkb-tool-hero__subtitle">
                            <?php echo esc_html($landing['hero']['subtitle']); ?>
                        </p>
                    <?php endif; ?>
                </div>
            </section>

            <!-- Tool Widget -->
            <section class="gmkb-tool-widget-section">
                <div class="gmkb-container">
                    <?php echo do_shortcode('[gmkb_tool tool="' . esc_attr($tool['id']) . '"]'); ?>
                </div>
            </section>

            <!-- How It Works -->
            <?php if (!empty($landing['howItWorks'])): ?>
            <section class="gmkb-tool-how-it-works">
                <div class="gmkb-container">
                    <h2>How It Works</h2>
                    <div class="gmkb-steps">
                        <?php foreach ($landing['howItWorks'] as $step): ?>
                            <div class="gmkb-step">
                                <div class="gmkb-step__number"><?php echo esc_html($step['step']); ?></div>
                                <h3 class="gmkb-step__title"><?php echo esc_html($step['title']); ?></h3>
                                <p class="gmkb-step__description"><?php echo esc_html($step['description']); ?></p>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </section>
            <?php endif; ?>

            <!-- Features -->
            <?php if (!empty($landing['features'])): ?>
            <section class="gmkb-tool-features">
                <div class="gmkb-container">
                    <h2>Features</h2>
                    <div class="gmkb-features-grid">
                        <?php foreach ($landing['features'] as $feature): ?>
                            <div class="gmkb-feature">
                                <h3 class="gmkb-feature__title"><?php echo esc_html($feature['title']); ?></h3>
                                <p class="gmkb-feature__description"><?php echo esc_html($feature['description']); ?></p>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </section>
            <?php endif; ?>

            <!-- Use Cases -->
            <?php if (!empty($meta['useCases'])): ?>
            <section class="gmkb-tool-use-cases">
                <div class="gmkb-container">
                    <h2>Use Cases</h2>
                    <ul class="gmkb-use-cases-list">
                        <?php foreach ($meta['useCases'] as $useCase): ?>
                            <li><?php echo esc_html($useCase); ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            </section>
            <?php endif; ?>

            <!-- FAQ -->
            <?php if (!empty($landing['faq'])): ?>
            <section class="gmkb-tool-faq">
                <div class="gmkb-container">
                    <h2>Frequently Asked Questions</h2>
                    <div class="gmkb-faq-list">
                        <?php foreach ($landing['faq'] as $item): ?>
                            <div class="gmkb-faq-item">
                                <h3 class="gmkb-faq-item__question"><?php echo esc_html($item['question']); ?></h3>
                                <p class="gmkb-faq-item__answer"><?php echo esc_html($item['answer']); ?></p>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </section>
            <?php endif; ?>

            <!-- Related Tools -->
            <?php if (!empty($landing['relatedToolSlugs'])): ?>
            <section class="gmkb-tool-related">
                <div class="gmkb-container">
                    <h2>Related Tools</h2>
                    <div class="gmkb-related-tools">
                        <?php foreach ($landing['relatedToolSlugs'] as $related_slug):
                            $related = $this->discovery->get_tool($related_slug);
                            $related_meta = $this->discovery->get_tool_metadata($related_slug);
                            if ($related && $related_meta):
                        ?>
                            <a href="<?php echo esc_url(home_url('/' . $this->base_path . '/' . $related_slug . '/')); ?>"
                               class="gmkb-related-tool">
                                <h3><?php echo esc_html($related_meta['name']); ?></h3>
                                <p><?php echo esc_html($related_meta['shortDescription']); ?></p>
                            </a>
                        <?php endif; endforeach; ?>
                    </div>
                </div>
            </section>
            <?php endif; ?>
        </div>

        <style>
            .gmkb-tool-landing {
                max-width: 1200px;
                margin: 0 auto;
                padding: 2rem 1rem;
            }
            .gmkb-container {
                max-width: 900px;
                margin: 0 auto;
            }
            .gmkb-tool-hero {
                text-align: center;
                padding: 3rem 0;
                margin-bottom: 2rem;
            }
            .gmkb-tool-hero__title {
                font-size: 2.5rem;
                font-weight: 700;
                margin: 0 0 1rem;
                color: #111827;
            }
            .gmkb-tool-hero__subtitle {
                font-size: 1.25rem;
                color: #6b7280;
                margin: 0;
            }
            .gmkb-tool-widget-section {
                margin-bottom: 3rem;
            }
            .gmkb-tool-how-it-works,
            .gmkb-tool-features,
            .gmkb-tool-use-cases,
            .gmkb-tool-faq,
            .gmkb-tool-related {
                padding: 3rem 0;
                border-top: 1px solid #e5e7eb;
            }
            .gmkb-tool-how-it-works h2,
            .gmkb-tool-features h2,
            .gmkb-tool-use-cases h2,
            .gmkb-tool-faq h2,
            .gmkb-tool-related h2 {
                font-size: 1.75rem;
                margin: 0 0 2rem;
                text-align: center;
            }
            .gmkb-steps {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 2rem;
            }
            .gmkb-step {
                text-align: center;
            }
            .gmkb-step__number {
                width: 48px;
                height: 48px;
                background: #3b82f6;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.25rem;
                font-weight: 700;
                margin: 0 auto 1rem;
            }
            .gmkb-step__title {
                font-size: 1.125rem;
                margin: 0 0 0.5rem;
            }
            .gmkb-step__description {
                color: #6b7280;
                margin: 0;
            }
            .gmkb-features-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
            }
            .gmkb-feature {
                padding: 1.5rem;
                background: #f9fafb;
                border-radius: 8px;
            }
            .gmkb-feature__title {
                font-size: 1rem;
                margin: 0 0 0.5rem;
            }
            .gmkb-feature__description {
                color: #6b7280;
                margin: 0;
                font-size: 0.875rem;
            }
            .gmkb-use-cases-list {
                list-style: none;
                padding: 0;
                margin: 0;
                display: grid;
                gap: 0.75rem;
            }
            .gmkb-use-cases-list li {
                padding: 0.75rem 1rem;
                background: #f9fafb;
                border-radius: 6px;
                position: relative;
                padding-left: 2rem;
            }
            .gmkb-use-cases-list li::before {
                content: "✓";
                position: absolute;
                left: 0.75rem;
                color: #10b981;
            }
            .gmkb-faq-list {
                display: grid;
                gap: 1rem;
            }
            .gmkb-faq-item {
                padding: 1.5rem;
                background: #f9fafb;
                border-radius: 8px;
            }
            .gmkb-faq-item__question {
                font-size: 1rem;
                margin: 0 0 0.5rem;
            }
            .gmkb-faq-item__answer {
                color: #6b7280;
                margin: 0;
            }
            .gmkb-related-tools {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1rem;
            }
            .gmkb-related-tool {
                display: block;
                padding: 1.5rem;
                background: #f9fafb;
                border-radius: 8px;
                text-decoration: none;
                color: inherit;
                transition: background 0.2s;
            }
            .gmkb-related-tool:hover {
                background: #f3f4f6;
            }
            .gmkb-related-tool h3 {
                font-size: 1rem;
                margin: 0 0 0.5rem;
                color: #3b82f6;
            }
            .gmkb-related-tool p {
                margin: 0;
                font-size: 0.875rem;
                color: #6b7280;
            }
        </style>
        <?php
    }

    /**
     * Render the tools directory page content
     */
    public function render_directory_page() {
        if (!$this->discovery) {
            echo '<div class="gmkb-error">Tool discovery not available.</div>';
            return;
        }

        $grouped = $this->discovery->get_tools_grouped_by_category();

        ?>
        <div class="gmkb-tools-directory-page">
            <section class="gmkb-directory-hero">
                <div class="gmkb-container">
                    <h1>Free AI Tools for Speakers & Authors</h1>
                    <p>Professional content generation tools to build your brand and grow your audience.</p>
                </div>
            </section>

            <div class="gmkb-container">
                <?php foreach ($grouped as $category_slug => $category): ?>
                    <?php if (!empty($category['tools'])): ?>
                    <section class="gmkb-directory-category">
                        <h2><?php echo esc_html($category['name']); ?></h2>
                        <p class="gmkb-category-description"><?php echo esc_html($category['description']); ?></p>

                        <div class="gmkb-tools-grid">
                            <?php foreach ($category['tools'] as $tool):
                                $meta = $this->discovery->get_tool_metadata($tool['id']);
                            ?>
                                <a href="<?php echo esc_url(home_url('/' . $this->base_path . '/' . $tool['id'] . '/')); ?>"
                                   class="gmkb-tool-card">
                                    <h3><?php echo esc_html($meta['name'] ?? $tool['name']); ?></h3>
                                    <p><?php echo esc_html($meta['shortDescription'] ?? ''); ?></p>
                                </a>
                            <?php endforeach; ?>
                        </div>
                    </section>
                    <?php endif; ?>
                <?php endforeach; ?>
            </div>
        </div>

        <style>
            .gmkb-tools-directory-page {
                max-width: 1200px;
                margin: 0 auto;
                padding: 2rem 1rem;
            }
            .gmkb-directory-hero {
                text-align: center;
                padding: 3rem 0;
                margin-bottom: 2rem;
            }
            .gmkb-directory-hero h1 {
                font-size: 2.5rem;
                font-weight: 700;
                margin: 0 0 1rem;
            }
            .gmkb-directory-hero p {
                font-size: 1.25rem;
                color: #6b7280;
                margin: 0;
            }
            .gmkb-directory-category {
                margin-bottom: 3rem;
            }
            .gmkb-directory-category h2 {
                font-size: 1.5rem;
                margin: 0 0 0.5rem;
            }
            .gmkb-category-description {
                color: #6b7280;
                margin: 0 0 1.5rem;
            }
            .gmkb-tools-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 1rem;
            }
            .gmkb-tool-card {
                display: block;
                padding: 1.5rem;
                background: #f9fafb;
                border-radius: 8px;
                text-decoration: none;
                color: inherit;
                transition: all 0.2s;
                border: 1px solid transparent;
            }
            .gmkb-tool-card:hover {
                background: white;
                border-color: #3b82f6;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .gmkb-tool-card h3 {
                font-size: 1.125rem;
                margin: 0 0 0.5rem;
                color: #3b82f6;
            }
            .gmkb-tool-card p {
                margin: 0;
                font-size: 0.875rem;
                color: #6b7280;
            }
        </style>
        <?php
    }

    /**
     * Output SEO meta tags
     */
    public function output_seo_tags() {
        // Individual tool page
        if ($this->current_tool && $this->current_meta) {
            $this->output_tool_seo_tags();
            return;
        }

        // Directory page
        if (get_query_var($this->directory_var)) {
            $this->output_directory_seo_tags();
        }
    }

    /**
     * Output SEO tags for tool page
     */
    private function output_tool_seo_tags() {
        $meta = $this->current_meta;
        $tool = $this->current_tool;
        $seo = isset($meta['seo']) ? $meta['seo'] : array();
        $landing = isset($meta['landing']) ? $meta['landing'] : array();

        $title = $seo['title'] ?? $meta['name'];
        $description = $seo['description'] ?? $meta['shortDescription'] ?? '';
        $keywords = isset($seo['keywords']) ? implode(', ', $seo['keywords']) : '';
        $canonical = home_url('/' . $this->base_path . '/' . $tool['id'] . '/');

        // Basic meta tags
        echo '<meta name="description" content="' . esc_attr($description) . '">' . "\n";
        if ($keywords) {
            echo '<meta name="keywords" content="' . esc_attr($keywords) . '">' . "\n";
        }
        echo '<link rel="canonical" href="' . esc_url($canonical) . '">' . "\n";

        // Open Graph
        echo '<meta property="og:title" content="' . esc_attr($title) . '">' . "\n";
        echo '<meta property="og:description" content="' . esc_attr($description) . '">' . "\n";
        echo '<meta property="og:url" content="' . esc_url($canonical) . '">' . "\n";
        echo '<meta property="og:type" content="website">' . "\n";
        echo '<meta property="og:site_name" content="' . esc_attr(get_bloginfo('name')) . '">' . "\n";

        // Twitter Card
        echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
        echo '<meta name="twitter:title" content="' . esc_attr($title) . '">' . "\n";
        echo '<meta name="twitter:description" content="' . esc_attr($description) . '">' . "\n";

        // JSON-LD: WebApplication
        $jsonld_app = array(
            '@context' => 'https://schema.org',
            '@type' => 'WebApplication',
            'name' => $meta['name'],
            'description' => $description,
            'url' => $canonical,
            'applicationCategory' => 'BusinessApplication',
            'operatingSystem' => 'Web',
            'offers' => array(
                '@type' => 'Offer',
                'price' => '0',
                'priceCurrency' => 'USD',
            ),
        );
        echo '<script type="application/ld+json">' . wp_json_encode($jsonld_app, JSON_UNESCAPED_SLASHES) . '</script>' . "\n";

        // JSON-LD: FAQPage
        if (!empty($landing['faq'])) {
            $faq_items = array();
            foreach ($landing['faq'] as $item) {
                $faq_items[] = array(
                    '@type' => 'Question',
                    'name' => $item['question'],
                    'acceptedAnswer' => array(
                        '@type' => 'Answer',
                        'text' => $item['answer'],
                    ),
                );
            }
            $jsonld_faq = array(
                '@context' => 'https://schema.org',
                '@type' => 'FAQPage',
                'mainEntity' => $faq_items,
            );
            echo '<script type="application/ld+json">' . wp_json_encode($jsonld_faq, JSON_UNESCAPED_SLASHES) . '</script>' . "\n";
        }
    }

    /**
     * Output SEO tags for directory page
     */
    private function output_directory_seo_tags() {
        $title = 'Free AI Tools for Speakers & Authors';
        $description = 'Professional AI-powered content generation tools. Create bios, topics, taglines, and more for your speaking and authoring career.';
        $canonical = home_url('/' . $this->base_path . '/');

        echo '<meta name="description" content="' . esc_attr($description) . '">' . "\n";
        echo '<link rel="canonical" href="' . esc_url($canonical) . '">' . "\n";

        // Open Graph
        echo '<meta property="og:title" content="' . esc_attr($title) . '">' . "\n";
        echo '<meta property="og:description" content="' . esc_attr($description) . '">' . "\n";
        echo '<meta property="og:url" content="' . esc_url($canonical) . '">' . "\n";
        echo '<meta property="og:type" content="website">' . "\n";

        // JSON-LD: ItemList
        if ($this->discovery) {
            $tools = $this->discovery->get_all_tools();
            $items = array();
            $position = 1;
            foreach ($tools as $tool) {
                $meta = $this->discovery->get_tool_metadata($tool['id']);
                $items[] = array(
                    '@type' => 'ListItem',
                    'position' => $position++,
                    'item' => array(
                        '@type' => 'WebApplication',
                        'name' => $meta['name'] ?? $tool['name'],
                        'url' => home_url('/' . $this->base_path . '/' . $tool['id'] . '/'),
                    ),
                );
            }
            $jsonld = array(
                '@context' => 'https://schema.org',
                '@type' => 'ItemList',
                'name' => $title,
                'itemListElement' => $items,
            );
            echo '<script type="application/ld+json">' . wp_json_encode($jsonld, JSON_UNESCAPED_SLASHES) . '</script>' . "\n";
        }
    }

    /**
     * Filter document title
     *
     * @param array $title_parts Title parts
     * @return array Modified title parts
     */
    public function filter_title($title_parts) {
        if ($this->current_meta) {
            $seo = isset($this->current_meta['seo']) ? $this->current_meta['seo'] : array();
            $title_parts['title'] = $seo['title'] ?? $this->current_meta['name'];
        } elseif (get_query_var($this->directory_var)) {
            $title_parts['title'] = 'Free AI Tools for Speakers & Authors';
        }
        return $title_parts;
    }

    /**
     * Get document title
     *
     * @param string $title Current title
     * @return string Modified title
     */
    public function get_document_title($title) {
        if ($this->current_meta) {
            $seo = isset($this->current_meta['seo']) ? $this->current_meta['seo'] : array();
            return ($seo['title'] ?? $this->current_meta['name']) . ' - ' . get_bloginfo('name');
        } elseif (get_query_var($this->directory_var)) {
            return 'Free AI Tools for Speakers & Authors - ' . get_bloginfo('name');
        }
        return $title;
    }

    /**
     * Add body class for tool pages
     *
     * @param array $classes Body classes
     * @return array Modified classes
     */
    public function add_body_class($classes) {
        if ($this->current_tool) {
            $classes[] = 'gmkb-tool-page';
            $classes[] = 'gmkb-tool-' . $this->current_tool['id'];
        } elseif (get_query_var($this->directory_var)) {
            $classes[] = 'gmkb-tools-directory-page';
        }
        return $classes;
    }

    /**
     * Maybe flush rewrite rules (once after plugin update)
     */
    public function maybe_flush_rewrite_rules() {
        $version_key = 'gmkb_tool_pages_version';
        $current_version = '1.0.0';

        if (get_option($version_key) !== $current_version) {
            flush_rewrite_rules();
            update_option($version_key, $current_version);
        }
    }

    /**
     * Flush rewrite rules
     */
    public function flush_rewrite_rules() {
        $this->register_rewrite_rules();
        flush_rewrite_rules();
        update_option('gmkb_tool_pages_version', '1.0.0');
    }

    /**
     * Get current tool
     *
     * @return array|null Current tool configuration
     */
    public function get_current_tool() {
        return $this->current_tool;
    }

    /**
     * Get current tool metadata
     *
     * @return array|null Current tool metadata
     */
    public function get_current_meta() {
        return $this->current_meta;
    }

    /**
     * Get tools base path
     *
     * @return string Base path
     */
    public function get_base_path() {
        return $this->base_path;
    }
}

/**
 * Initialize Tool Pages
 */
function gmkb_tool_pages() {
    return GMKB_Tool_Pages::instance();
}

// Initialize on plugins_loaded
add_action('plugins_loaded', 'gmkb_tool_pages');
