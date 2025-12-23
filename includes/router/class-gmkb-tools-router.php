<?php
/**
 * GMKB Tools Router
 *
 * A standalone router that handles /tools/ URLs by intercepting requests
 * very early in the WordPress lifecycle, BEFORE the main query runs.
 *
 * This approach bypasses WordPress's fragile rewrite rules system entirely.
 * Instead of relying on add_rewrite_rule() and hoping rules get flushed,
 * we directly parse the URL and handle the request ourselves.
 *
 * @package GMKB
 * @subpackage Router
 * @version 1.0.0
 * @since 2.4.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Tools_Router {

    /**
     * Singleton instance
     * @var GMKB_Tools_Router
     */
    private static $instance = null;

    /**
     * Base path for tools
     * @var string
     */
    private $base_path = 'tools';

    /**
     * Parsed route data
     * @var array|null
     */
    private $route = null;

    /**
     * Tool Discovery service
     * @var GMKB_Tool_Discovery
     */
    private $discovery = null;

    /**
     * Get singleton instance
     *
     * @return GMKB_Tools_Router
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
        // Parse the route immediately on construction
        $this->route = $this->parse_url();

        // If this is a tools route, hook in very early
        if ($this->route) {
            // CRITICAL: Block ALL redirects as early as possible
            // Theme or other plugins may try to redirect /tools/ to /app/tools/
            add_action('init', array($this, 'block_early_redirects'), 1);
            add_action('wp_loaded', array($this, 'block_early_redirects'), 1);
            add_action('parse_request', array($this, 'block_early_redirects'), 1);

            // Block canonical redirects via filter
            add_filter('redirect_canonical', '__return_false', 999);
            add_filter('wp_redirect', array($this, 'block_tools_redirect'), 1, 2);
            add_filter('wp_redirect_status', array($this, 'block_tools_redirect_status'), 1);

            // Prevent 404 status and redirects at template_redirect
            add_action('template_redirect', array($this, 'prevent_redirects'), -999);
            add_action('wp', array($this, 'fix_query_flags'), 1);

            // Hook into template_include to serve our templates
            add_filter('template_include', array($this, 'serve_template'), 999);

            // Set up SEO
            add_action('wp_head', array($this, 'output_seo_tags'), 1);
            add_filter('pre_get_document_title', array($this, 'get_page_title'), 999);
            add_filter('document_title_parts', array($this, 'filter_title_parts'), 999);

            // Body classes
            add_filter('body_class', array($this, 'add_body_classes'));

            // Enqueue assets
            add_action('wp_enqueue_scripts', array($this, 'enqueue_assets'));

            // Navigation filters
            add_filter('guestify_is_app_page', array($this, 'filter_is_app_page'));
        }
    }

    /**
     * Block early redirects from theme or other plugins
     */
    public function block_early_redirects() {
        // Remove common redirect actions
        remove_action('template_redirect', 'redirect_canonical');
        remove_action('template_redirect', 'wp_old_slug_redirect');

        // Set global flag to indicate we're handling this route
        if (!defined('GMKB_HANDLING_TOOLS_ROUTE')) {
            define('GMKB_HANDLING_TOOLS_ROUTE', true);
        }
    }

    /**
     * Block wp_redirect calls that try to redirect away from /tools/
     *
     * @param string $location Redirect location
     * @param int $status HTTP status code
     * @return string|false Location or false to block
     */
    public function block_tools_redirect($location, $status = 302) {
        // Block any redirect when we're on a tools route
        if ($this->route) {
            // Allow redirects within /tools/
            if (strpos($location, '/' . $this->base_path . '/') !== false ||
                strpos($location, '/' . $this->base_path) === strlen($location) - strlen('/' . $this->base_path)) {
                return $location;
            }
            // Block redirects to other locations (like /app/tools/)
            return false;
        }
        return $location;
    }

    /**
     * Block redirect status when blocking redirects
     *
     * @param int $status HTTP status code
     * @return int Status code
     */
    public function block_tools_redirect_status($status) {
        // If we blocked the redirect location, this won't matter
        // but return 200 just in case
        if ($this->route) {
            return 200;
        }
        return $status;
    }

    /**
     * Parse the current URL to detect tools routes
     *
     * @return array|null Route data or null if not a tools route
     */
    private function parse_url() {
        // Get request URI
        $request_uri = isset($_SERVER['REQUEST_URI']) ? sanitize_text_field(wp_unslash($_SERVER['REQUEST_URI'])) : '';

        // Parse to get path only
        $parsed = wp_parse_url($request_uri);
        $path = isset($parsed['path']) ? $parsed['path'] : '';

        // Get WordPress home path (for subdirectory installs)
        $home_path = trim(wp_parse_url(home_url(), PHP_URL_PATH) ?: '', '/');

        // Remove home path prefix if present
        $path = trim($path, '/');
        if (!empty($home_path) && strpos($path, $home_path) === 0) {
            $path = substr($path, strlen($home_path));
            $path = trim($path, '/');
        }

        // Check if path starts with our base
        if (empty($path) || strpos($path, $this->base_path) !== 0) {
            return null;
        }

        // Pattern: tools/{slug}/tool/ - Tool app page
        if (preg_match('#^' . preg_quote($this->base_path, '#') . '/([^/]+)/tool/?$#', $path, $matches)) {
            return array(
                'type' => 'tool_app',
                'slug' => sanitize_text_field($matches[1]),
            );
        }

        // Pattern: tools/{slug}/ - Tool landing page
        if (preg_match('#^' . preg_quote($this->base_path, '#') . '/([^/]+)/?$#', $path, $matches)) {
            return array(
                'type' => 'tool_landing',
                'slug' => sanitize_text_field($matches[1]),
            );
        }

        // Pattern: tools/ - Directory page
        if (preg_match('#^' . preg_quote($this->base_path, '#') . '/?$#', $path)) {
            return array(
                'type' => 'directory',
                'slug' => null,
            );
        }

        return null;
    }

    /**
     * Check if we're on a tools route
     *
     * @return bool
     */
    public function is_tools_route() {
        return $this->route !== null;
    }

    /**
     * Get current route data
     *
     * @return array|null
     */
    public function get_route() {
        return $this->route;
    }

    /**
     * Get Tool Discovery instance
     *
     * @return GMKB_Tool_Discovery|null
     */
    private function get_discovery() {
        if ($this->discovery === null) {
            $discovery_path = GMKB_PLUGIN_DIR . 'includes/services/class-gmkb-tool-discovery.php';
            if (file_exists($discovery_path)) {
                require_once $discovery_path;
                $this->discovery = GMKB_Tool_Discovery::instance();
            }
        }
        return $this->discovery;
    }

    /**
     * Fix WordPress query flags to prevent 404
     */
    public function fix_query_flags() {
        global $wp_query;

        if (!$this->route) {
            return;
        }

        // Force WordPress to not treat this as 404
        $wp_query->is_404 = false;
        $wp_query->is_home = false;
        $wp_query->is_page = true;
        $wp_query->is_singular = true;

        // Set HTTP 200 status
        status_header(200);
    }

    /**
     * Prevent any redirects
     */
    public function prevent_redirects() {
        if (!$this->route) {
            return;
        }

        // Remove canonical redirect
        remove_action('template_redirect', 'redirect_canonical');

        // Remove other potential redirects
        remove_action('template_redirect', 'wp_old_slug_redirect');
    }

    /**
     * Serve our template
     *
     * @param string $template Current template
     * @return string Our template path
     */
    public function serve_template($template) {
        if (!$this->route) {
            return $template;
        }

        // Get the appropriate template
        $our_template = $this->get_template_path();

        if ($our_template && file_exists($our_template)) {
            return $our_template;
        }

        // Fallback: create template on the fly
        return $this->create_inline_template();
    }

    /**
     * Get template path based on route type
     *
     * @return string|null Template path
     */
    private function get_template_path() {
        $templates_dir = GMKB_PLUGIN_DIR . 'templates/';

        switch ($this->route['type']) {
            case 'directory':
                // Check theme first
                $theme_template = locate_template('gmkb-tools-directory.php');
                if ($theme_template) {
                    return $theme_template;
                }
                return $templates_dir . 'tools-directory.php';

            case 'tool_landing':
            case 'tool_app':
                // Check theme first
                $theme_template = locate_template(array(
                    'gmkb-tool-' . $this->route['slug'] . '.php',
                    'gmkb-tool.php',
                ));
                if ($theme_template) {
                    return $theme_template;
                }
                return $templates_dir . 'tool-page.php';
        }

        return null;
    }

    /**
     * Create inline template if files don't exist
     *
     * @return string Template path
     */
    private function create_inline_template() {
        $templates_dir = GMKB_PLUGIN_DIR . 'templates/';

        // Ensure templates directory exists
        if (!is_dir($templates_dir)) {
            wp_mkdir_p($templates_dir);
        }

        $template_file = $templates_dir . 'router-template.php';

        if (!file_exists($template_file)) {
            $content = '<?php
/**
 * GMKB Router Template
 * Auto-generated template for tools pages
 */
get_header();

$router = GMKB_Tools_Router::instance();
$router->render_page();

get_footer();
';
            file_put_contents($template_file, $content);
        }

        return $template_file;
    }

    /**
     * Render the current page content
     */
    public function render_page() {
        if (!$this->route) {
            echo '<div class="gmkb-error">Invalid route.</div>';
            return;
        }

        switch ($this->route['type']) {
            case 'directory':
                $this->render_directory();
                break;

            case 'tool_landing':
                $this->render_tool_landing();
                break;

            case 'tool_app':
                $this->render_tool_app();
                break;
        }
    }

    /**
     * Render directory page
     */
    private function render_directory() {
        $discovery = $this->get_discovery();

        if (!$discovery) {
            echo '<div class="gmkb-error">Tool discovery not available.</div>';
            return;
        }

        $grouped = $discovery->get_tools_grouped_by_category();
        ?>
        <div class="gmkb-tools-directory">
            <div class="gmkb-container">
                <header class="gmkb-directory-header">
                    <h1>Free AI Tools for Speakers & Authors</h1>
                    <p>Professional content generation tools to build your brand and grow your audience.</p>
                </header>

                <?php foreach ($grouped as $category_slug => $category): ?>
                    <?php if (!empty($category['tools'])): ?>
                    <section class="gmkb-category-section">
                        <h2><?php echo esc_html($category['name']); ?></h2>
                        <p class="gmkb-category-desc"><?php echo esc_html($category['description']); ?></p>

                        <div class="gmkb-tools-grid">
                            <?php foreach ($category['tools'] as $tool):
                                $meta = $discovery->get_tool_metadata($tool['id']);
                            ?>
                            <a href="<?php echo esc_url(home_url('/' . $this->base_path . '/' . $tool['id'] . '/')); ?>" class="gmkb-tool-card">
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
        <?php
        $this->output_directory_styles();
    }

    /**
     * Render tool landing page
     */
    private function render_tool_landing() {
        $discovery = $this->get_discovery();
        $tool = $discovery ? $discovery->get_tool($this->route['slug']) : null;
        $meta = $discovery ? $discovery->get_tool_metadata($this->route['slug']) : null;

        if (!$tool || !$meta) {
            echo '<div class="gmkb-error">Tool not found: ' . esc_html($this->route['slug']) . '</div>';
            return;
        }

        $landing = $meta['landingContent'] ?? array();
        $cta_url = home_url('/' . $this->base_path . '/' . $tool['id'] . '/tool/');
        $cta_text = $landing['ctaText'] ?? 'Try ' . esc_html($meta['name']) . ' Free';
        ?>
        <div class="gmkb-tool-landing">
            <div class="gmkb-container">
                <section class="gmkb-hero">
                    <span class="gmkb-category-badge"><?php echo esc_html($this->get_category_label($meta['category'] ?? '')); ?></span>
                    <h1><?php echo esc_html($landing['heroTagline'] ?? $meta['name']); ?></h1>
                    <p class="gmkb-hero-subtitle"><?php echo esc_html($landing['heroSubtitle'] ?? $meta['shortDescription'] ?? ''); ?></p>
                    <a href="<?php echo esc_url($cta_url); ?>" class="gmkb-btn gmkb-btn-primary gmkb-btn-lg">
                        <?php echo esc_html($cta_text); ?>
                    </a>
                </section>

                <?php if (!empty($meta['keyBenefits'])): ?>
                <section class="gmkb-benefits">
                    <div class="gmkb-benefits-grid">
                        <?php foreach ($meta['keyBenefits'] as $benefit): ?>
                        <div class="gmkb-benefit">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            <span><?php echo esc_html($benefit); ?></span>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </section>
                <?php endif; ?>

                <?php if (!empty($landing['howItWorks'])): ?>
                <section class="gmkb-how-it-works">
                    <h2>How It Works</h2>
                    <div class="gmkb-steps">
                        <?php foreach ($landing['howItWorks'] as $step): ?>
                        <div class="gmkb-step">
                            <div class="gmkb-step-num"><?php echo esc_html($step['step']); ?></div>
                            <h3><?php echo esc_html($step['title']); ?></h3>
                            <p><?php echo esc_html($step['description']); ?></p>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </section>
                <?php endif; ?>

                <section class="gmkb-bottom-cta">
                    <h2>Ready to Get Started?</h2>
                    <p>Create your <?php echo esc_html(strtolower($meta['name'])); ?> in seconds with our free AI-powered tool.</p>
                    <a href="<?php echo esc_url($cta_url); ?>" class="gmkb-btn gmkb-btn-primary gmkb-btn-lg">
                        <?php echo esc_html($cta_text); ?>
                    </a>
                </section>
            </div>
        </div>
        <?php
        $this->output_landing_styles();
    }

    /**
     * Render tool app page
     */
    private function render_tool_app() {
        $discovery = $this->get_discovery();
        $tool = $discovery ? $discovery->get_tool($this->route['slug']) : null;
        $meta = $discovery ? $discovery->get_tool_metadata($this->route['slug']) : null;

        if (!$tool || !$meta) {
            echo '<div class="gmkb-error">Tool not found: ' . esc_html($this->route['slug']) . '</div>';
            return;
        }

        $landing = $meta['landingContent'] ?? array();
        ?>
        <div class="gmkb-tool-app">
            <div class="gmkb-container">
                <header class="gmkb-tool-header">
                    <a href="<?php echo esc_url(home_url('/' . $this->base_path . '/' . $tool['id'] . '/')); ?>" class="gmkb-back-link">
                        &larr; Back to Overview
                    </a>
                    <h1><?php echo esc_html($meta['name']); ?></h1>
                    <p><?php echo esc_html($meta['shortDescription'] ?? ''); ?></p>
                </header>

                <div class="gmkb-tool-layout">
                    <div class="gmkb-tool-main">
                        <?php echo do_shortcode('[gmkb_tool tool="' . esc_attr($tool['id']) . '" show_title="false"]'); ?>
                    </div>

                    <?php if (!empty($landing['howItWorks']) || !empty($landing['tips'])): ?>
                    <aside class="gmkb-tool-sidebar">
                        <?php if (!empty($landing['howItWorks'])): ?>
                        <div class="gmkb-sidebar-section">
                            <h3>How It Works</h3>
                            <?php foreach ($landing['howItWorks'] as $step): ?>
                            <div class="gmkb-mini-step">
                                <span class="gmkb-mini-num"><?php echo esc_html($step['step']); ?></span>
                                <div>
                                    <strong><?php echo esc_html($step['title']); ?></strong>
                                    <p><?php echo esc_html($step['description']); ?></p>
                                </div>
                            </div>
                            <?php endforeach; ?>
                        </div>
                        <?php endif; ?>

                        <?php if (!empty($landing['tips'])): ?>
                        <div class="gmkb-sidebar-section">
                            <h3>Pro Tips</h3>
                            <ul class="gmkb-tips-list">
                                <?php foreach ($landing['tips'] as $tip): ?>
                                <li><?php echo esc_html($tip); ?></li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                        <?php endif; ?>
                    </aside>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        <?php
        $this->output_app_styles();
    }

    /**
     * Enqueue assets for tool pages
     */
    public function enqueue_assets() {
        if (!$this->route || $this->route['type'] !== 'tool_app') {
            return;
        }

        $version = defined('GMKB_VERSION') ? GMKB_VERSION : '1.0.0';

        // Check for standalone tools bundle
        $js_file = GMKB_PLUGIN_DIR . 'dist/standalone-tools/standalone-tools.iife.js';
        $css_file = GMKB_PLUGIN_DIR . 'dist/standalone-tools/standalone-tools.css';

        // Fallback to seo-tools bundle
        if (!file_exists($js_file)) {
            $js_file = GMKB_PLUGIN_DIR . 'dist/seo-tools/seo-tools.iife.js';
            $css_file = GMKB_PLUGIN_DIR . 'dist/seo-tools/seo-tools.css';
        }

        if (file_exists($js_file)) {
            wp_enqueue_script(
                'gmkb-standalone-tools',
                str_replace(GMKB_PLUGIN_DIR, GMKB_PLUGIN_URL, $js_file),
                array(),
                $version,
                true
            );

            if (file_exists($css_file)) {
                wp_enqueue_style(
                    'gmkb-standalone-tools',
                    str_replace(GMKB_PLUGIN_DIR, GMKB_PLUGIN_URL, $css_file),
                    array(),
                    $version
                );
            }

            // Localize script data
            $is_logged_in = is_user_logged_in();
            $data = array(
                'nonce' => wp_create_nonce('gmkb_public_ai'),
                'apiBase' => rest_url('gmkb/v2'),
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'isLoggedIn' => $is_logged_in,
                'toolSlug' => $this->route['slug'],
            );

            if ($is_logged_in) {
                $data['restNonce'] = wp_create_nonce('wp_rest');
                $data['userId'] = get_current_user_id();
                $data['profilesEndpoint'] = rest_url('gmkb/v2/profiles');
                $data['profileEndpoint'] = rest_url('gmkb/v2/profile');
            }

            wp_localize_script('gmkb-standalone-tools', 'gmkbStandaloneTools', $data);
        }
    }

    /**
     * Add body classes
     *
     * @param array $classes Body classes
     * @return array Modified classes
     */
    public function add_body_classes($classes) {
        if (!$this->route) {
            return $classes;
        }

        $classes[] = 'gmkb-tools-page';
        $classes[] = 'gmkb-route-' . $this->route['type'];

        if ($this->route['slug']) {
            $classes[] = 'gmkb-tool-' . $this->route['slug'];
        }

        // Login status classes
        if (is_user_logged_in()) {
            $classes[] = 'gmkb-user-logged-in';
            $classes[] = 'gmkb-show-app-nav';
        } else {
            $classes[] = 'gmkb-user-logged-out';
            $classes[] = 'gmkb-show-frontend-nav';
        }

        return $classes;
    }

    /**
     * Filter is_app_page for navigation
     *
     * @param bool $is_app_page Current value
     * @return bool Modified value
     */
    public function filter_is_app_page($is_app_page) {
        if ($this->route) {
            return is_user_logged_in();
        }
        return $is_app_page;
    }

    /**
     * Get page title
     *
     * @param string $title Current title
     * @return string Modified title
     */
    public function get_page_title($title) {
        if (!$this->route) {
            return $title;
        }

        $site_name = get_bloginfo('name');

        switch ($this->route['type']) {
            case 'directory':
                return 'Free AI Tools for Speakers & Authors - ' . $site_name;

            case 'tool_landing':
            case 'tool_app':
                $discovery = $this->get_discovery();
                $meta = $discovery ? $discovery->get_tool_metadata($this->route['slug']) : null;
                if ($meta) {
                    $seo = $meta['seo'] ?? array();
                    return ($seo['title'] ?? $meta['name']) . ' - ' . $site_name;
                }
                break;
        }

        return $title;
    }

    /**
     * Filter title parts
     *
     * @param array $parts Title parts
     * @return array Modified parts
     */
    public function filter_title_parts($parts) {
        if (!$this->route) {
            return $parts;
        }

        switch ($this->route['type']) {
            case 'directory':
                $parts['title'] = 'Free AI Tools for Speakers & Authors';
                break;

            case 'tool_landing':
            case 'tool_app':
                $discovery = $this->get_discovery();
                $meta = $discovery ? $discovery->get_tool_metadata($this->route['slug']) : null;
                if ($meta) {
                    $seo = $meta['seo'] ?? array();
                    $parts['title'] = $seo['title'] ?? $meta['name'];
                }
                break;
        }

        return $parts;
    }

    /**
     * Output SEO tags
     */
    public function output_seo_tags() {
        if (!$this->route) {
            return;
        }

        switch ($this->route['type']) {
            case 'directory':
                $this->output_directory_seo();
                break;

            case 'tool_landing':
            case 'tool_app':
                $this->output_tool_seo();
                break;
        }
    }

    /**
     * Output directory SEO tags
     */
    private function output_directory_seo() {
        $description = 'Professional AI-powered content generation tools. Create bios, topics, taglines, and more.';
        $canonical = home_url('/' . $this->base_path . '/');

        echo '<meta name="description" content="' . esc_attr($description) . '">' . "\n";
        echo '<link rel="canonical" href="' . esc_url($canonical) . '">' . "\n";
        echo '<meta property="og:title" content="Free AI Tools for Speakers &amp; Authors">' . "\n";
        echo '<meta property="og:description" content="' . esc_attr($description) . '">' . "\n";
        echo '<meta property="og:url" content="' . esc_url($canonical) . '">' . "\n";
        echo '<meta property="og:type" content="website">' . "\n";
    }

    /**
     * Output tool SEO tags
     */
    private function output_tool_seo() {
        $discovery = $this->get_discovery();
        $meta = $discovery ? $discovery->get_tool_metadata($this->route['slug']) : null;

        if (!$meta) {
            return;
        }

        $seo = $meta['seo'] ?? array();
        $title = $seo['title'] ?? $meta['name'];
        $description = $seo['description'] ?? $meta['shortDescription'] ?? '';
        $canonical = home_url('/' . $this->base_path . '/' . $this->route['slug'] . '/');

        echo '<meta name="description" content="' . esc_attr($description) . '">' . "\n";
        echo '<link rel="canonical" href="' . esc_url($canonical) . '">' . "\n";
        echo '<meta property="og:title" content="' . esc_attr($title) . '">' . "\n";
        echo '<meta property="og:description" content="' . esc_attr($description) . '">' . "\n";
        echo '<meta property="og:url" content="' . esc_url($canonical) . '">' . "\n";
        echo '<meta property="og:type" content="website">' . "\n";
    }

    /**
     * Get category label
     *
     * @param string $category Category slug
     * @return string Label
     */
    private function get_category_label($category) {
        $labels = array(
            'seo-tools' => 'SEO Tools',
            'profile-content' => 'Profile Content',
            'value-builder' => 'Value Builder',
            'media-kit' => 'Media Kit',
            'messaging' => 'Messaging',
            'outreach' => 'Outreach',
        );
        return $labels[$category] ?? ucwords(str_replace('-', ' ', $category));
    }

    /**
     * Output directory page styles
     */
    private function output_directory_styles() {
        ?>
        <style>
        .gmkb-tools-directory { max-width: 1200px; margin: 0 auto; padding: 2rem 1rem; }
        .gmkb-directory-header { text-align: center; padding: 3rem 0; }
        .gmkb-directory-header h1 { font-size: 2.5rem; margin: 0 0 1rem; }
        .gmkb-directory-header p { font-size: 1.25rem; color: #6b7280; margin: 0; }
        .gmkb-category-section { margin-bottom: 3rem; }
        .gmkb-category-section h2 { font-size: 1.5rem; margin: 0 0 0.5rem; }
        .gmkb-category-desc { color: #6b7280; margin: 0 0 1.5rem; }
        .gmkb-tools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
        .gmkb-tool-card { display: block; padding: 1.5rem; background: #f9fafb; border-radius: 8px; text-decoration: none; color: inherit; transition: all 0.2s; border: 1px solid transparent; }
        .gmkb-tool-card:hover { background: white; border-color: #3b82f6; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .gmkb-tool-card h3 { font-size: 1.125rem; margin: 0 0 0.5rem; color: #3b82f6; }
        .gmkb-tool-card p { margin: 0; font-size: 0.875rem; color: #6b7280; }
        </style>
        <?php
    }

    /**
     * Output landing page styles
     */
    private function output_landing_styles() {
        ?>
        <style>
        .gmkb-tool-landing { max-width: 900px; margin: 0 auto; padding: 2rem 1rem; }
        .gmkb-hero { text-align: center; padding: 4rem 0 3rem; }
        .gmkb-category-badge { display: inline-block; padding: 0.25rem 0.75rem; background: #eff6ff; color: #3b82f6; border-radius: 9999px; font-size: 0.875rem; margin-bottom: 1rem; }
        .gmkb-hero h1 { font-size: 2.75rem; font-weight: 800; margin: 0 0 1rem; line-height: 1.2; }
        .gmkb-hero-subtitle { font-size: 1.25rem; color: #6b7280; margin: 0 0 2rem; }
        .gmkb-btn { display: inline-flex; align-items: center; font-weight: 600; border-radius: 8px; text-decoration: none; transition: all 0.2s; }
        .gmkb-btn-primary { background: #3b82f6; color: white; }
        .gmkb-btn-primary:hover { background: #2563eb; color: white; }
        .gmkb-btn-lg { padding: 1rem 2rem; font-size: 1.125rem; }
        .gmkb-benefits { padding: 2rem; background: #f9fafb; border-radius: 12px; margin-bottom: 2rem; }
        .gmkb-benefits-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 1.5rem 2.5rem; }
        .gmkb-benefit { display: flex; align-items: center; gap: 0.5rem; }
        .gmkb-benefit svg { width: 20px; height: 20px; color: #10b981; }
        .gmkb-how-it-works { padding: 3rem 0; border-top: 1px solid #e5e7eb; }
        .gmkb-how-it-works h2 { text-align: center; margin: 0 0 2rem; }
        .gmkb-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; }
        .gmkb-step { text-align: center; }
        .gmkb-step-num { width: 48px; height: 48px; background: #3b82f6; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 700; margin: 0 auto 1rem; }
        .gmkb-step h3 { font-size: 1.125rem; margin: 0 0 0.5rem; }
        .gmkb-step p { color: #6b7280; margin: 0; }
        .gmkb-bottom-cta { padding: 4rem; text-align: center; background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%); border-radius: 16px; margin-top: 2rem; }
        .gmkb-bottom-cta h2 { font-size: 2rem; margin: 0 0 0.75rem; }
        .gmkb-bottom-cta p { color: #6b7280; margin: 0 0 1.5rem; font-size: 1.125rem; }
        </style>
        <?php
    }

    /**
     * Output app page styles
     */
    private function output_app_styles() {
        ?>
        <style>
        .gmkb-tool-app { max-width: 1400px; margin: 0 auto; padding: 0 1rem 2rem; }
        .gmkb-tool-header { padding: 2rem 0; border-bottom: 1px solid #e5e7eb; margin-bottom: 2rem; }
        .gmkb-back-link { display: inline-flex; color: #6b7280; text-decoration: none; font-size: 0.875rem; margin-bottom: 0.5rem; }
        .gmkb-back-link:hover { color: #3b82f6; }
        .gmkb-tool-header h1 { font-size: 1.75rem; font-weight: 700; margin: 0 0 0.5rem; }
        .gmkb-tool-header p { color: #6b7280; margin: 0; }
        .gmkb-tool-layout { display: grid; grid-template-columns: 1fr 380px; gap: 2rem; align-items: start; }
        .gmkb-tool-main { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1.5rem; }
        .gmkb-tool-sidebar { position: sticky; top: 2rem; }
        .gmkb-sidebar-section { background: #f9fafb; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; }
        .gmkb-sidebar-section h3 { font-size: 1rem; font-weight: 600; margin: 0 0 1rem; color: #374151; }
        .gmkb-mini-step { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
        .gmkb-mini-step:last-child { margin-bottom: 0; }
        .gmkb-mini-num { width: 24px; height: 24px; background: #3b82f6; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; flex-shrink: 0; }
        .gmkb-mini-step strong { display: block; font-size: 0.875rem; margin-bottom: 0.25rem; }
        .gmkb-mini-step p { font-size: 0.8125rem; color: #6b7280; margin: 0; }
        .gmkb-tips-list { list-style: none; padding: 0; margin: 0; }
        .gmkb-tips-list li { padding: 0.5rem 0 0.5rem 1.5rem; position: relative; font-size: 0.875rem; }
        .gmkb-tips-list li::before { content: "💡"; position: absolute; left: 0; }
        @media (max-width: 1024px) {
            .gmkb-tool-layout { grid-template-columns: 1fr; }
            .gmkb-tool-sidebar { position: static; }
        }
        </style>
        <?php
    }
}

/**
 * Initialize the router
 * Must be called early - during plugins_loaded
 */
function gmkb_tools_router() {
    return GMKB_Tools_Router::instance();
}

// Initialize IMMEDIATELY when file is loaded - don't wait for any hooks
// This ensures we catch the route before anything else can redirect
gmkb_tools_router();

// Also register on plugins_loaded as backup
add_action('plugins_loaded', 'gmkb_tools_router', 1);
