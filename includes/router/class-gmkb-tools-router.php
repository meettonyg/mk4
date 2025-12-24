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
            echo '<div class="gmkb-error" style="padding:2rem;background:red;color:white;">Tool discovery not available.</div>';
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
                        <div class="gmkb-category-header">
                            <div class="gmkb-category-icon"><?php echo $this->get_category_icon($category_slug); ?></div>
                            <div>
                                <h2><?php echo esc_html($category['name']); ?></h2>
                                <p class="gmkb-category-desc"><?php echo esc_html($category['description']); ?></p>
                            </div>
                        </div>

                        <div class="gmkb-tools-grid">
                            <?php foreach ($category['tools'] as $tool):
                                $meta = $discovery->get_tool_metadata($tool['id']);
                                $icon = $tool['icon'] ?? 'SparklesIcon';
                            ?>
                            <a href="<?php echo esc_url(home_url('/' . $this->base_path . '/' . $tool['id'] . '/')); ?>" class="gmkb-tool-card">
                                <div class="gmkb-tool-icon"><?php echo $this->get_tool_icon($icon); ?></div>
                                <div class="gmkb-tool-content">
                                    <h3><?php echo esc_html($meta['name'] ?? $tool['name']); ?></h3>
                                    <p><?php echo esc_html($meta['shortDescription'] ?? $tool['description'] ?? ''); ?></p>
                                </div>
                                <div class="gmkb-tool-arrow">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </div>
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
     * Get SVG icon for a tool
     *
     * @param string $icon_name Icon name from tool.json
     * @return string SVG markup
     */
    private function get_tool_icon($icon_name) {
        $icons = array(
            'UserCircleIcon' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
            'ChatBubbleLeftRightIcon' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"/></svg>',
            'QuestionMarkCircleIcon' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"/></svg>',
            'TagIcon' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z"/></svg>',
            'LightBulbIcon' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/></svg>',
            'RocketLaunchIcon' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/></svg>',
            'BookOpenIcon' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>',
            'DocumentTextIcon' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>',
            'ArrowPathIcon' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>',
            'NewspaperIcon' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"/></svg>',
            'EnvelopeIcon' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>',
            'MicrophoneIcon' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"/></svg>',
            'ShareIcon' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"/></svg>',
            'VideoCameraIcon' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"/></svg>',
            'PresentationChartBarIcon' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"/></svg>',
            'CubeTransparentIcon' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"/></svg>',
            'GiftIcon' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/></svg>',
            'UserGroupIcon' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg>',
            'MagnifyingGlassIcon' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>',
            'SparklesIcon' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/></svg>',
            'AcademicCapIcon' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"/></svg>',
            'BoltIcon' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>',
        );

        return $icons[$icon_name] ?? $icons['SparklesIcon'];
    }

    /**
     * Get SVG icon for a category
     *
     * @param string $category_slug Category slug
     * @return string SVG markup
     */
    private function get_category_icon($category_slug) {
        $icons = array(
            'message-builder' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/></svg>',
            'value-builder' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m3.044 0a6.726 6.726 0 002.749-1.35m0 0a6.772 6.772 0 01-3.044 0"/></svg>',
            'strategy' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/></svg>',
            'content' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>',
            'social-email' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"/></svg>',
        );

        return $icons[$category_slug] ?? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>';
    }

    /**
     * Format formula text with highlighted placeholders
     *
     * @param string $formula The formula text
     * @return string HTML with highlighted placeholders
     */
    private function format_formula($formula) {
        // Replace [PLACEHOLDER] patterns with highlighted spans
        $formatted = preg_replace(
            '/\[([^\]]+)\]/',
            '<span class="gmkb-highlight">[$1]</span>',
            esc_html($formula)
        );
        return $formatted;
    }

    /**
     * Get SVG icon for a process step
     *
     * @param int|string $step_num Step number
     * @return string SVG markup
     */
    private function get_step_icon($step_num) {
        $icons = array(
            1 => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',
            2 => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
            3 => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
            4 => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>',
        );
        return $icons[(int)$step_num] ?? $icons[1];
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

        $icon = $tool['icon'] ?? 'SparklesIcon';
        ?>
        <div class="gmkb-tool-app">
            <div class="gmkb-container">
                <!-- Compact Header -->
                <header class="gmkb-tool-header">
                    <a href="<?php echo esc_url(home_url('/' . $this->base_path . '/')); ?>" class="gmkb-back-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        All Tools
                    </a>
                    <div class="gmkb-header-title">
                        <div class="gmkb-header-icon"><?php echo $this->get_tool_icon($icon); ?></div>
                        <div>
                            <h1><?php echo esc_html($meta['name']); ?></h1>
                            <p><?php echo esc_html($meta['shortDescription'] ?? ''); ?></p>
                        </div>
                    </div>
                </header>

                <!-- Vue Component Mount Point - Component handles its own layout -->
                <div class="gmkb-tool-wrapper">
                    <div data-gmkb-tool="<?php echo esc_attr($tool['id']); ?>" class="gmkb-tool-mount"></div>
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

            // Localize script data - provide both variable names for compatibility
            $is_logged_in = is_user_logged_in();
            $public_nonce = wp_create_nonce('gmkb_public_ai');

            $data = array(
                'nonce' => $public_nonce,
                'publicNonce' => $public_nonce,
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

            // Provide multiple variable names for bundle compatibility
            wp_localize_script('gmkb-standalone-tools', 'gmkbStandaloneTools', $data);
            wp_localize_script('gmkb-standalone-tools', 'gmkbPublicData', $data);

            // Add inline script to set gmkbPublicNonce for bundle auto-initialization
            wp_add_inline_script('gmkb-standalone-tools', 'window.gmkbPublicNonce = "' . esc_js($public_nonce) . '";', 'before');
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
     * FIX: Return FALSE for directory page to prevent theme redirect to /app/tools/
     * The theme intercepts "app pages" and tries to enforce /app/ URL structure.
     * For directory, we want frontend nav. For individual tools, app nav for logged-in users.
     *
     * @param bool $is_app_page Current value
     * @return bool Modified value
     */
    public function filter_is_app_page($is_app_page) {
        if ($this->route) {
            // Directory page should NOT be an app page - prevents theme redirect
            if ($this->route['type'] === 'directory') {
                return false;
            }
            // Individual tool pages: app nav for logged-in users
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
        .gmkb-directory-header { text-align: center; padding: 3rem 0 2rem; }
        .gmkb-directory-header h1 { font-size: 2.5rem; font-weight: 800; margin: 0 0 1rem; color: #111827; }
        .gmkb-directory-header p { font-size: 1.25rem; color: #6b7280; margin: 0; max-width: 600px; margin-left: auto; margin-right: auto; }

        .gmkb-category-section { margin-bottom: 3rem; }
        .gmkb-category-header { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb; }
        .gmkb-category-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .gmkb-category-icon svg { width: 24px; height: 24px; color: white; }
        .gmkb-category-header h2 { font-size: 1.5rem; font-weight: 700; margin: 0 0 0.25rem; color: #111827; }
        .gmkb-category-desc { color: #6b7280; margin: 0; font-size: 0.9375rem; }

        .gmkb-tools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }

        .gmkb-tool-card {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.25rem;
            background: white;
            border-radius: 12px;
            text-decoration: none;
            color: inherit;
            transition: all 0.2s ease;
            border: 1px solid #e5e7eb;
            box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }
        .gmkb-tool-card:hover {
            border-color: #3b82f6;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
            transform: translateY(-2px);
        }

        .gmkb-tool-icon {
            width: 48px;
            height: 48px;
            background: #eff6ff;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: all 0.2s ease;
        }
        .gmkb-tool-icon svg { width: 24px; height: 24px; color: #3b82f6; }
        .gmkb-tool-card:hover .gmkb-tool-icon { background: #3b82f6; }
        .gmkb-tool-card:hover .gmkb-tool-icon svg { color: white; }

        .gmkb-tool-content { flex: 1; min-width: 0; }
        .gmkb-tool-content h3 {
            font-size: 1rem;
            font-weight: 600;
            margin: 0 0 0.25rem;
            color: #111827;
            transition: color 0.2s ease;
        }
        .gmkb-tool-card:hover .gmkb-tool-content h3 { color: #3b82f6; }
        .gmkb-tool-content p {
            margin: 0;
            font-size: 0.875rem;
            color: #6b7280;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .gmkb-tool-arrow {
            color: #d1d5db;
            flex-shrink: 0;
            transition: all 0.2s ease;
        }
        .gmkb-tool-card:hover .gmkb-tool-arrow { color: #3b82f6; transform: translateX(4px); }

        @media (max-width: 640px) {
            .gmkb-directory-header h1 { font-size: 1.75rem; }
            .gmkb-directory-header p { font-size: 1rem; }
            .gmkb-tools-grid { grid-template-columns: 1fr; }
            .gmkb-tool-card { padding: 1rem; }
            .gmkb-tool-icon { width: 40px; height: 40px; }
            .gmkb-tool-icon svg { width: 20px; height: 20px; }
        }
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
        /* Tool App Container */
        .gmkb-tool-app { max-width: 1400px; margin: 0 auto; padding: 0 1rem 2rem; }

        /* Header */
        .gmkb-tool-header {
            padding: 1.5rem 0;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 2rem;
        }
        .gmkb-tool-app .gmkb-back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            color: #6b7280;
            text-decoration: none;
            font-size: 0.875rem;
            margin-bottom: 1rem;
            transition: color 0.2s;
        }
        .gmkb-tool-app .gmkb-back-link:hover { color: #3b82f6; }
        .gmkb-header-title {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        .gmkb-header-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .gmkb-header-icon svg { width: 24px; height: 24px; color: white; }
        .gmkb-header-title h1 {
            font-size: 1.5rem;
            font-weight: 700;
            margin: 0 0 0.25rem;
            color: #111827;
        }
        .gmkb-header-title p {
            color: #6b7280;
            margin: 0;
            font-size: 0.9375rem;
        }

        /* Tool Wrapper - Vue component handles its own layout */
        .gmkb-tool-wrapper {
            /* Let Vue component control the layout */
        }

        /* Responsive */
        @media (max-width: 640px) {
            .gmkb-header-title { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
            .gmkb-header-icon { width: 40px; height: 40px; }
            .gmkb-header-icon svg { width: 20px; height: 20px; }
            .gmkb-header-title h1 { font-size: 1.25rem; }
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
