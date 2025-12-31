<?php
/**
 * GMKB Template Pages
 *
 * Creates virtual pages for media kit templates without requiring WordPress page creation.
 * Registers rewrite rules for /templates/ and /templates/{slug}/ URLs.
 *
 * URLs:
 * - /templates/                    -> Template directory page (SEO landing)
 * - /templates/professional-clean/ -> Individual template preview page
 *
 * SEO Features:
 * - Dynamic title tags from theme.json
 * - Meta descriptions and keywords
 * - Open Graph and Twitter Card tags
 * - JSON-LD structured data
 * - Canonical URLs
 *
 * @package GMKB
 * @subpackage Pages
 * @version 1.0.0
 * @since 2.4.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Template_Pages {

    /**
     * Singleton instance
     * @var GMKB_Template_Pages
     */
    private static $instance = null;

    /**
     * ThemeDiscovery service
     * @var ThemeDiscovery
     */
    private $discovery = null;

    /**
     * Base URL path for templates
     * @var string
     */
    private $base_path = 'templates';

    /**
     * Query var for template slug
     * @var string
     */
    private $query_var = 'gmkb_template';

    /**
     * Query var for directory page
     * @var string
     */
    private $directory_var = 'gmkb_templates_directory';

    /**
     * Current template being rendered
     * @var array|null
     */
    private $current_template = null;

    /**
     * Get singleton instance
     *
     * @return GMKB_Template_Pages
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
        $discovery_path = GMKB_PLUGIN_DIR . 'system/ThemeDiscovery.php';
        if (file_exists($discovery_path)) {
            require_once $discovery_path;
            $this->discovery = new ThemeDiscovery(GMKB_PLUGIN_DIR . 'themes');
        }
    }

    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        // Rewrite rules - use priority 10 (same as tool pages)
        add_action('init', array($this, 'register_rewrite_rules'), 10);
        add_filter('query_vars', array($this, 'register_query_vars'));

        // Template handling
        add_filter('template_include', array($this, 'load_template'));

        // SEO hooks
        add_action('wp_head', array($this, 'output_seo_tags'), 1);
        add_filter('document_title_parts', array($this, 'filter_title'));
        add_filter('pre_get_document_title', array($this, 'get_document_title'), 10);

        // Body class
        add_filter('body_class', array($this, 'add_body_class'));

        // Flush rewrite rules on first load or when needed
        add_action('init', array($this, 'maybe_flush_rewrite_rules'), 99);

        // Check if rules need to be added (first time setup)
        add_action('admin_init', array($this, 'check_rewrite_rules'));
    }

    /**
     * Check if current page is a template or directory page
     *
     * @return bool
     */
    public function is_template_page() {
        return $this->current_template || get_query_var($this->directory_var);
    }

    /**
     * Register rewrite rules for template pages
     */
    public function register_rewrite_rules() {
        // Individual template pages: /templates/{slug}/
        add_rewrite_rule(
            '^' . $this->base_path . '/([^/]+)/?$',
            'index.php?' . $this->query_var . '=$matches[1]',
            'top'
        );

        // Templates directory: /templates/
        add_rewrite_rule(
            '^' . $this->base_path . '/?$',
            'index.php?' . $this->directory_var . '=1',
            'top'
        );

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB Template Pages: Rewrite rules registered');
            error_log('   - Single: ^' . $this->base_path . '/([^/]+)/?$ => ' . $this->query_var);
            error_log('   - Directory: ^' . $this->base_path . '/?$ => ' . $this->directory_var);
        }
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
     * Load custom template for template pages
     *
     * @param string $template Current template path
     * @return string Modified template path
     */
    public function load_template($template) {
        // Debug: Log all query vars
        if (defined('WP_DEBUG') && WP_DEBUG) {
            global $wp_query;
            $request_uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : 'unknown';
            error_log('🔍 GMKB Template Pages: load_template() called');
            error_log('   - Request URI: ' . $request_uri);
            error_log('   - Query var (' . $this->query_var . '): ' . get_query_var($this->query_var));
            error_log('   - Directory var (' . $this->directory_var . '): ' . get_query_var($this->directory_var));
            error_log('   - is_404: ' . ($wp_query->is_404 ? 'true' : 'false'));
        }

        // Check for individual template page
        $template_slug = get_query_var($this->query_var);
        if (!empty($template_slug)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('✅ GMKB: Loading single template for: ' . $template_slug);
            }
            return $this->load_single_template($template_slug);
        }

        // Check for directory page
        if (get_query_var($this->directory_var)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('✅ GMKB: Loading directory template');
            }
            return $this->load_directory_template();
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('ℹ️ GMKB: No template match, returning original: ' . $template);
        }

        return $template;
    }

    /**
     * Load template for individual template page
     *
     * @param string $template_slug Template slug
     * @return string Template path
     */
    private function load_single_template($template_slug) {
        global $wp_query;

        if (!$this->discovery) {
            $wp_query->set_404();
            return get_404_template();
        }

        $template_data = $this->discovery->getTheme($template_slug);
        if (!$template_data) {
            $wp_query->set_404();
            return get_404_template();
        }

        // Store for SEO hooks
        $this->current_template = $template_data;
        $this->current_template['slug'] = $template_slug;

        // CRITICAL: Force 200 OK status - WordPress defaults to 404 for virtual pages
        status_header(200);
        $wp_query->is_404 = false;
        $wp_query->is_page = true;
        $wp_query->is_singular = true;

        // Check for theme template override
        $theme_template = locate_template('gmkb-template-single.php');
        if ($theme_template) {
            return $theme_template;
        }

        // Use plugin template
        $plugin_template = GMKB_PLUGIN_DIR . 'templates/template-single.php';
        if (file_exists($plugin_template)) {
            return $plugin_template;
        }

        // Fallback: create inline template
        return $this->create_inline_template('single');
    }

    /**
     * Load template for directory page
     *
     * @return string Template path
     */
    private function load_directory_template() {
        global $wp_query;

        // CRITICAL: Force 200 OK status - WordPress defaults to 404 for virtual pages
        status_header(200);
        $wp_query->is_404 = false;
        $wp_query->is_page = true;
        $wp_query->is_singular = true;
        $wp_query->is_archive = true; // Helps with some SEO plugins

        // Check for theme template override
        $theme_template = locate_template('gmkb-template-directory.php');
        if ($theme_template) {
            return $theme_template;
        }

        // Use plugin template
        $plugin_template = GMKB_PLUGIN_DIR . 'templates/template-directory.php';
        if (file_exists($plugin_template)) {
            return $plugin_template;
        }

        // Fallback: create inline template
        return $this->create_inline_template('directory');
    }

    /**
     * Create inline template file for fallback
     *
     * @param string $type 'single' or 'directory'
     * @return string Template path
     */
    private function create_inline_template($type) {
        $temp_file = wp_tempnam('gmkb-template-' . $type);

        if ($type === 'directory') {
            $content = $this->get_directory_template_content();
        } else {
            $content = $this->get_single_template_content();
        }

        file_put_contents($temp_file, $content);
        return $temp_file;
    }

    /**
     * Get directory template HTML content
     *
     * @return string PHP template content
     */
    private function get_directory_template_content() {
        ob_start();
        ?>
<?php get_header(); ?>

<div class="gmkb-template-directory-page">
    <div class="gmkb-template-hero">
        <div class="container">
            <h1>Media Kit Templates</h1>
            <p class="lead">Choose from our professionally designed templates to create your perfect media kit. Each template is fully customizable to match your brand.</p>
        </div>
    </div>

    <div class="gmkb-templates-grid-wrapper">
        <div class="container">
            <?php
            $discovery = new ThemeDiscovery(GMKB_PLUGIN_DIR . 'themes');
            $templates = $discovery->getThemes();

            if (!empty($templates)) :
            ?>
            <div class="gmkb-templates-grid">
                <?php foreach ($templates as $slug => $template) : ?>
                <article class="gmkb-template-card">
                    <a href="<?php echo esc_url(home_url('/templates/' . $slug . '/')); ?>" class="gmkb-template-link">
                        <div class="gmkb-template-thumbnail">
                            <?php if (!empty($template['preview_url'])) : ?>
                                <img src="<?php echo esc_url($template['preview_url']); ?>" alt="<?php echo esc_attr($template['theme_name'] ?? $slug); ?> template preview" loading="lazy">
                            <?php else : ?>
                                <div class="gmkb-template-placeholder">
                                    <span><?php echo esc_html(strtoupper(substr($template['theme_name'] ?? $slug, 0, 2))); ?></span>
                                </div>
                            <?php endif; ?>
                            <?php if (!empty($template['metadata']['is_new'])) : ?>
                                <span class="gmkb-badge gmkb-badge-new">New</span>
                            <?php endif; ?>
                            <?php if (!empty($template['metadata']['is_premium'])) : ?>
                                <span class="gmkb-badge gmkb-badge-pro">Pro</span>
                            <?php endif; ?>
                        </div>
                        <div class="gmkb-template-info">
                            <h2><?php echo esc_html($template['theme_name'] ?? $slug); ?></h2>
                            <?php if (!empty($template['description'])) : ?>
                                <p><?php echo esc_html($template['description']); ?></p>
                            <?php endif; ?>
                            <?php if (!empty($template['category'])) : ?>
                                <span class="gmkb-template-category"><?php echo esc_html(ucfirst($template['category'])); ?></span>
                            <?php endif; ?>
                        </div>
                    </a>
                </article>
                <?php endforeach; ?>
            </div>
            <?php else : ?>
            <p class="gmkb-no-templates">No templates available.</p>
            <?php endif; ?>
        </div>
    </div>

    <div class="gmkb-templates-cta">
        <div class="container">
            <h2>Ready to Create Your Media Kit?</h2>
            <p>Sign up for free and start building your professional media kit today.</p>
            <?php if (is_user_logged_in()) : ?>
                <a href="<?php echo esc_url(home_url('/tools/media-kit/')); ?>" class="gmkb-btn gmkb-btn-primary">Open Media Kit Builder</a>
            <?php else : ?>
                <a href="<?php echo esc_url(wp_registration_url()); ?>" class="gmkb-btn gmkb-btn-primary">Get Started Free</a>
            <?php endif; ?>
        </div>
    </div>
</div>

<style>
.gmkb-template-directory-page { background: #f8fafc; min-height: 100vh; }
.gmkb-template-hero { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 80px 20px; text-align: center; }
.gmkb-template-hero h1 { font-size: 2.5rem; margin-bottom: 1rem; font-weight: 700; }
.gmkb-template-hero .lead { font-size: 1.125rem; opacity: 0.9; max-width: 600px; margin: 0 auto; }
.gmkb-templates-grid-wrapper { padding: 60px 20px; }
.gmkb-templates-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px; max-width: 1200px; margin: 0 auto; }
.gmkb-template-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); transition: transform 0.2s, box-shadow 0.2s; }
.gmkb-template-card:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.gmkb-template-link { text-decoration: none; color: inherit; display: block; }
.gmkb-template-thumbnail { position: relative; aspect-ratio: 16/10; background: #e2e8f0; overflow: hidden; }
.gmkb-template-thumbnail img { width: 100%; height: 100%; object-fit: cover; }
.gmkb-template-placeholder { display: flex; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; font-size: 2rem; font-weight: 700; }
.gmkb-badge { position: absolute; top: 12px; right: 12px; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
.gmkb-badge-new { background: #10b981; color: white; }
.gmkb-badge-pro { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }
.gmkb-template-info { padding: 20px; }
.gmkb-template-info h2 { font-size: 1.25rem; margin: 0 0 8px; color: #1e293b; }
.gmkb-template-info p { font-size: 0.875rem; color: #64748b; margin: 0 0 12px; line-height: 1.5; }
.gmkb-template-category { display: inline-block; background: #f1f5f9; color: #475569; padding: 4px 12px; border-radius: 9999px; font-size: 0.75rem; }
.gmkb-templates-cta { background: #1e293b; color: white; padding: 80px 20px; text-align: center; }
.gmkb-templates-cta h2 { font-size: 2rem; margin-bottom: 1rem; }
.gmkb-templates-cta p { opacity: 0.9; margin-bottom: 2rem; }
.gmkb-btn { display: inline-block; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; transition: all 0.2s; }
.gmkb-btn-primary { background: #3b82f6; color: white; }
.gmkb-btn-primary:hover { background: #2563eb; transform: scale(1.02); }
.container { max-width: 1200px; margin: 0 auto; }
@media (max-width: 768px) {
    .gmkb-template-hero h1 { font-size: 1.75rem; }
    .gmkb-templates-grid { grid-template-columns: 1fr; }
}
</style>

<?php get_footer(); ?>
        <?php
        return ob_get_clean();
    }

    /**
     * Get single template HTML content
     *
     * @return string PHP template content
     */
    private function get_single_template_content() {
        ob_start();
        ?>
<?php
get_header();
$template_pages = GMKB_Template_Pages::instance();
$template = $template_pages->get_current_template();
$slug = $template['slug'] ?? '';
?>

<div class="gmkb-template-single-page">
    <div class="gmkb-template-header">
        <div class="container">
            <nav class="gmkb-breadcrumb">
                <a href="<?php echo esc_url(home_url('/templates/')); ?>">Templates</a>
                <span>/</span>
                <span><?php echo esc_html($template['theme_name'] ?? $slug); ?></span>
            </nav>
            <h1><?php echo esc_html($template['theme_name'] ?? $slug); ?></h1>
            <?php if (!empty($template['description'])) : ?>
                <p class="lead"><?php echo esc_html($template['description']); ?></p>
            <?php endif; ?>
            <div class="gmkb-template-meta">
                <?php if (!empty($template['category'])) : ?>
                    <span class="gmkb-meta-item">
                        <strong>Category:</strong> <?php echo esc_html(ucfirst($template['category'])); ?>
                    </span>
                <?php endif; ?>
                <?php if (!empty($template['metadata']['tags'])) : ?>
                    <span class="gmkb-meta-item">
                        <strong>Tags:</strong> <?php echo esc_html(implode(', ', $template['metadata']['tags'])); ?>
                    </span>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <div class="gmkb-template-preview-section">
        <div class="container">
            <div class="gmkb-preview-frame">
                <?php if (!empty($template['preview_url'])) : ?>
                    <img src="<?php echo esc_url($template['preview_url']); ?>" alt="<?php echo esc_attr($template['theme_name'] ?? $slug); ?> preview" class="gmkb-preview-image">
                <?php else : ?>
                    <div class="gmkb-preview-placeholder">
                        <div class="gmkb-placeholder-content">
                            <span class="gmkb-placeholder-icon"><?php echo esc_html(strtoupper(substr($template['theme_name'] ?? $slug, 0, 2))); ?></span>
                            <p>Preview coming soon</p>
                        </div>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <div class="gmkb-template-features">
        <div class="container">
            <h2>Template Features</h2>
            <div class="gmkb-features-grid">
                <div class="gmkb-feature">
                    <div class="gmkb-feature-icon">🎨</div>
                    <h3>Fully Customizable</h3>
                    <p>Customize colors, fonts, and layouts to match your brand identity.</p>
                </div>
                <div class="gmkb-feature">
                    <div class="gmkb-feature-icon">📱</div>
                    <h3>Mobile Responsive</h3>
                    <p>Looks great on all devices - desktop, tablet, and mobile.</p>
                </div>
                <div class="gmkb-feature">
                    <div class="gmkb-feature-icon">⚡</div>
                    <h3>Fast Loading</h3>
                    <p>Optimized for performance to ensure quick load times.</p>
                </div>
                <div class="gmkb-feature">
                    <div class="gmkb-feature-icon">🔧</div>
                    <h3>Drag & Drop</h3>
                    <p>Easy-to-use builder with intuitive drag and drop interface.</p>
                </div>
            </div>
        </div>
    </div>

    <div class="gmkb-template-cta">
        <div class="container">
            <h2>Start Building with This Template</h2>
            <?php if (is_user_logged_in()) : ?>
                <p>Ready to create your media kit? Click below to start customizing this template.</p>
                <a href="<?php echo esc_url(home_url('/tools/media-kit/?template=' . $slug)); ?>" class="gmkb-btn gmkb-btn-primary gmkb-btn-large">Use This Template</a>
            <?php else : ?>
                <p>Create a free account to start building your media kit with this template.</p>
                <a href="<?php echo esc_url(wp_registration_url()); ?>" class="gmkb-btn gmkb-btn-primary gmkb-btn-large">Get Started Free</a>
                <p class="gmkb-login-link">Already have an account? <a href="<?php echo esc_url(wp_login_url(home_url('/tools/media-kit/?template=' . $slug))); ?>">Log in</a></p>
            <?php endif; ?>
        </div>
    </div>
</div>

<style>
.gmkb-template-single-page { background: #f8fafc; min-height: 100vh; }
.gmkb-template-header { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 60px 20px 80px; }
.gmkb-breadcrumb { margin-bottom: 1.5rem; font-size: 0.875rem; opacity: 0.8; }
.gmkb-breadcrumb a { color: white; text-decoration: none; }
.gmkb-breadcrumb a:hover { text-decoration: underline; }
.gmkb-breadcrumb span { margin: 0 8px; }
.gmkb-template-header h1 { font-size: 2.5rem; margin-bottom: 1rem; font-weight: 700; }
.gmkb-template-header .lead { font-size: 1.125rem; opacity: 0.9; max-width: 700px; }
.gmkb-template-meta { margin-top: 1.5rem; display: flex; gap: 2rem; flex-wrap: wrap; }
.gmkb-meta-item { font-size: 0.875rem; opacity: 0.9; }
.gmkb-template-preview-section { padding: 0 20px; margin-top: -40px; margin-bottom: 60px; }
.gmkb-preview-frame { background: white; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); overflow: hidden; max-width: 900px; margin: 0 auto; }
.gmkb-preview-image { width: 100%; display: block; }
.gmkb-preview-placeholder { aspect-ratio: 16/10; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #e2e8f0, #cbd5e1); }
.gmkb-placeholder-content { text-align: center; }
.gmkb-placeholder-icon { display: block; font-size: 4rem; font-weight: 700; color: #64748b; margin-bottom: 1rem; }
.gmkb-template-features { padding: 80px 20px; background: white; }
.gmkb-template-features h2 { text-align: center; font-size: 2rem; margin-bottom: 3rem; color: #1e293b; }
.gmkb-features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; max-width: 1000px; margin: 0 auto; }
.gmkb-feature { text-align: center; padding: 30px; }
.gmkb-feature-icon { font-size: 2.5rem; margin-bottom: 1rem; }
.gmkb-feature h3 { font-size: 1.25rem; margin-bottom: 0.75rem; color: #1e293b; }
.gmkb-feature p { font-size: 0.9375rem; color: #64748b; line-height: 1.6; }
.gmkb-template-cta { background: #1e293b; color: white; padding: 80px 20px; text-align: center; }
.gmkb-template-cta h2 { font-size: 2rem; margin-bottom: 1rem; }
.gmkb-template-cta p { opacity: 0.9; margin-bottom: 2rem; max-width: 500px; margin-left: auto; margin-right: auto; }
.gmkb-btn-large { padding: 16px 40px; font-size: 1.125rem; }
.gmkb-login-link { margin-top: 1.5rem; font-size: 0.875rem; opacity: 0.8; }
.gmkb-login-link a { color: #60a5fa; }
.container { max-width: 1200px; margin: 0 auto; }
.gmkb-btn { display: inline-block; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; transition: all 0.2s; }
.gmkb-btn-primary { background: #3b82f6; color: white; }
.gmkb-btn-primary:hover { background: #2563eb; transform: scale(1.02); }
@media (max-width: 768px) {
    .gmkb-template-header h1 { font-size: 1.75rem; }
    .gmkb-template-meta { flex-direction: column; gap: 0.5rem; }
}
</style>

<?php get_footer(); ?>
        <?php
        return ob_get_clean();
    }

    /**
     * Get current template data
     *
     * @return array|null
     */
    public function get_current_template() {
        return $this->current_template;
    }

    /**
     * Output SEO meta tags
     */
    public function output_seo_tags() {
        if (!$this->is_template_page()) {
            return;
        }

        $is_directory = get_query_var($this->directory_var);

        if ($is_directory) {
            $this->output_directory_seo();
        } elseif ($this->current_template) {
            $this->output_single_seo();
        }
    }

    /**
     * Output SEO tags for directory page
     */
    private function output_directory_seo() {
        $site_name = get_bloginfo('name');
        $title = 'Media Kit Templates - ' . $site_name;
        $description = 'Browse our collection of professionally designed media kit templates. Choose from corporate, creative, minimal, and portfolio styles. Fully customizable and easy to use.';
        $url = home_url('/templates/');

        echo "\n<!-- GMKB Template Directory SEO -->\n";
        echo '<meta name="description" content="' . esc_attr($description) . '">' . "\n";
        echo '<link rel="canonical" href="' . esc_url($url) . '">' . "\n";

        // Open Graph
        echo '<meta property="og:type" content="website">' . "\n";
        echo '<meta property="og:title" content="' . esc_attr($title) . '">' . "\n";
        echo '<meta property="og:description" content="' . esc_attr($description) . '">' . "\n";
        echo '<meta property="og:url" content="' . esc_url($url) . '">' . "\n";
        echo '<meta property="og:site_name" content="' . esc_attr($site_name) . '">' . "\n";

        // Twitter Card
        echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
        echo '<meta name="twitter:title" content="' . esc_attr($title) . '">' . "\n";
        echo '<meta name="twitter:description" content="' . esc_attr($description) . '">' . "\n";

        // JSON-LD structured data
        $this->output_directory_jsonld();
    }

    /**
     * Output SEO tags for single template page
     */
    private function output_single_seo() {
        $template = $this->current_template;
        $slug = $template['slug'] ?? '';
        $name = $template['theme_name'] ?? $slug;
        $site_name = get_bloginfo('name');

        $title = $name . ' Media Kit Template - ' . $site_name;
        $description = !empty($template['description'])
            ? $template['description']
            : 'Create a stunning media kit with our ' . $name . ' template. Fully customizable, mobile-responsive, and easy to use.';
        $url = home_url('/templates/' . $slug . '/');

        echo "\n<!-- GMKB Template Single SEO -->\n";
        echo '<meta name="description" content="' . esc_attr($description) . '">' . "\n";
        echo '<link rel="canonical" href="' . esc_url($url) . '">' . "\n";

        // Keywords from tags
        if (!empty($template['metadata']['tags'])) {
            echo '<meta name="keywords" content="' . esc_attr(implode(', ', $template['metadata']['tags'])) . ', media kit, template">' . "\n";
        }

        // Open Graph
        echo '<meta property="og:type" content="product">' . "\n";
        echo '<meta property="og:title" content="' . esc_attr($title) . '">' . "\n";
        echo '<meta property="og:description" content="' . esc_attr($description) . '">' . "\n";
        echo '<meta property="og:url" content="' . esc_url($url) . '">' . "\n";
        echo '<meta property="og:site_name" content="' . esc_attr($site_name) . '">' . "\n";

        if (!empty($template['preview_url'])) {
            echo '<meta property="og:image" content="' . esc_url($template['preview_url']) . '">' . "\n";
        }

        // Twitter Card
        echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
        echo '<meta name="twitter:title" content="' . esc_attr($title) . '">' . "\n";
        echo '<meta name="twitter:description" content="' . esc_attr($description) . '">' . "\n";

        if (!empty($template['preview_url'])) {
            echo '<meta name="twitter:image" content="' . esc_url($template['preview_url']) . '">' . "\n";
        }

        // JSON-LD structured data
        $this->output_single_jsonld();
    }

    /**
     * Output JSON-LD for directory page
     */
    private function output_directory_jsonld() {
        $templates = $this->discovery ? $this->discovery->getThemes() : array();
        $items = array();

        $position = 1;
        foreach ($templates as $slug => $template) {
            $items[] = array(
                '@type' => 'ListItem',
                'position' => $position++,
                'name' => $template['theme_name'] ?? $slug,
                'url' => home_url('/templates/' . $slug . '/'),
            );
        }

        $jsonld = array(
            '@context' => 'https://schema.org',
            '@type' => 'ItemList',
            'name' => 'Media Kit Templates',
            'description' => 'Collection of professionally designed media kit templates',
            'numberOfItems' => count($items),
            'itemListElement' => $items,
        );

        echo '<script type="application/ld+json">' . wp_json_encode($jsonld, JSON_UNESCAPED_SLASHES) . '</script>' . "\n";
    }

    /**
     * Output JSON-LD for single template page
     */
    private function output_single_jsonld() {
        $template = $this->current_template;
        $slug = $template['slug'] ?? '';
        $name = $template['theme_name'] ?? $slug;

        $jsonld = array(
            '@context' => 'https://schema.org',
            '@type' => 'Product',
            'name' => $name . ' Media Kit Template',
            'description' => $template['description'] ?? 'Professional media kit template',
            'url' => home_url('/templates/' . $slug . '/'),
            'category' => 'Media Kit Template',
            'brand' => array(
                '@type' => 'Brand',
                'name' => get_bloginfo('name'),
            ),
            'offers' => array(
                '@type' => 'Offer',
                'price' => '0',
                'priceCurrency' => 'USD',
                'availability' => 'https://schema.org/InStock',
            ),
        );

        if (!empty($template['preview_url'])) {
            $jsonld['image'] = $template['preview_url'];
        }

        echo '<script type="application/ld+json">' . wp_json_encode($jsonld, JSON_UNESCAPED_SLASHES) . '</script>' . "\n";
    }

    /**
     * Filter document title parts
     *
     * @param array $title_parts Title parts
     * @return array Modified title parts
     */
    public function filter_title($title_parts) {
        if (!$this->is_template_page()) {
            return $title_parts;
        }

        if (get_query_var($this->directory_var)) {
            $title_parts['title'] = 'Media Kit Templates';
        } elseif ($this->current_template) {
            $name = $this->current_template['theme_name'] ?? $this->current_template['slug'];
            $title_parts['title'] = $name . ' Media Kit Template';
        }

        return $title_parts;
    }

    /**
     * Get document title for template pages
     *
     * @param string $title Current title
     * @return string Modified title
     */
    public function get_document_title($title) {
        if (!$this->is_template_page()) {
            return $title;
        }

        $site_name = get_bloginfo('name');

        if (get_query_var($this->directory_var)) {
            return 'Media Kit Templates - ' . $site_name;
        }

        if ($this->current_template) {
            $name = $this->current_template['theme_name'] ?? $this->current_template['slug'];
            return $name . ' Media Kit Template - ' . $site_name;
        }

        return $title;
    }

    /**
     * Add body class for template pages
     *
     * @param array $classes Body classes
     * @return array Modified classes
     */
    public function add_body_class($classes) {
        if (get_query_var($this->directory_var)) {
            $classes[] = 'gmkb-template-directory';
            $classes[] = 'gmkb-templates-page';
        } elseif ($this->current_template) {
            $classes[] = 'gmkb-template-single';
            $classes[] = 'gmkb-templates-page';
            $classes[] = 'gmkb-template-' . sanitize_html_class($this->current_template['slug'] ?? '');
        }

        return $classes;
    }

    /**
     * Maybe flush rewrite rules
     */
    public function maybe_flush_rewrite_rules() {
        if (get_option('gmkb_template_pages_flush_rewrite')) {
            flush_rewrite_rules();
            delete_option('gmkb_template_pages_flush_rewrite');

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('✅ GMKB Template Pages: Flushed rewrite rules');
            }
        }
    }

    /**
     * Check if rewrite rules exist, if not schedule a flush
     */
    public function check_rewrite_rules() {
        $rules = get_option('rewrite_rules');

        // Check if our rules exist
        $has_directory_rule = false;
        $has_single_rule = false;

        if (is_array($rules)) {
            foreach ($rules as $pattern => $query) {
                if (strpos($pattern, $this->base_path) !== false) {
                    if (strpos($query, $this->directory_var) !== false) {
                        $has_directory_rule = true;
                    }
                    if (strpos($query, $this->query_var) !== false) {
                        $has_single_rule = true;
                    }
                }
            }
        }

        // If rules are missing, schedule a flush
        if (!$has_directory_rule || !$has_single_rule) {
            self::schedule_flush();

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('⚠️ GMKB Template Pages: Rewrite rules missing, scheduled flush');
            }
        }
    }

    /**
     * Schedule rewrite rules flush
     */
    public static function schedule_flush() {
        update_option('gmkb_template_pages_flush_rewrite', true);
    }

    /**
     * Force flush rewrite rules (for manual trigger)
     */
    public static function force_flush() {
        flush_rewrite_rules();
        delete_option('gmkb_template_pages_flush_rewrite');

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB Template Pages: Force flushed rewrite rules');
        }
    }
}

// Initialize
GMKB_Template_Pages::instance();

// Add admin action to force flush via URL parameter
// Visit: /wp-admin/?gmkb_flush_template_rules=1
add_action('admin_init', function() {
    if (isset($_GET['gmkb_flush_template_rules']) && current_user_can('manage_options')) {
        GMKB_Template_Pages::force_flush();
        add_action('admin_notices', function() {
            echo '<div class="notice notice-success is-dismissible"><p>GMKB Template rewrite rules flushed successfully.</p></div>';
        });
    }

    // Debug: Show rewrite rules status
    // Visit: /wp-admin/?gmkb_debug_template_rules=1
    if (isset($_GET['gmkb_debug_template_rules']) && current_user_can('manage_options')) {
        add_action('admin_notices', function() {
            $rules = get_option('rewrite_rules');
            $template_rules = array();

            if (is_array($rules)) {
                foreach ($rules as $pattern => $query) {
                    if (strpos($pattern, 'templates') !== false || strpos($query, 'gmkb_template') !== false) {
                        $template_rules[$pattern] = $query;
                    }
                }
            }

            echo '<div class="notice notice-info">';
            echo '<h3>GMKB Template Rewrite Rules Debug</h3>';

            if (empty($template_rules)) {
                echo '<p style="color: red;"><strong>❌ No template rules found!</strong></p>';
                echo '<p>The rewrite rules for /templates/ are not registered. Try:</p>';
                echo '<ol>';
                echo '<li><a href="' . admin_url('?gmkb_flush_template_rules=1') . '">Force flush rewrite rules</a></li>';
                echo '<li>Go to Settings → Permalinks and click Save</li>';
                echo '</ol>';
            } else {
                echo '<p style="color: green;"><strong>✅ Found ' . count($template_rules) . ' template rule(s):</strong></p>';
                echo '<table class="widefat" style="max-width: 800px;">';
                echo '<thead><tr><th>Pattern</th><th>Query</th></tr></thead>';
                echo '<tbody>';
                foreach ($template_rules as $pattern => $query) {
                    echo '<tr><td><code>' . esc_html($pattern) . '</code></td><td><code>' . esc_html($query) . '</code></td></tr>';
                }
                echo '</tbody></table>';
            }

            // Check for conflicting pages
            $conflicting_pages = get_posts(array(
                'post_type' => array('page', 'post'),
                'name' => 'templates',
                'post_status' => array('publish', 'draft', 'trash', 'pending'),
                'posts_per_page' => -1,
            ));

            if (!empty($conflicting_pages)) {
                echo '<p style="color: orange;"><strong>⚠️ Found conflicting pages with slug "templates":</strong></p>';
                echo '<ul>';
                foreach ($conflicting_pages as $page) {
                    echo '<li>' . esc_html($page->post_title) . ' (ID: ' . $page->ID . ', Status: ' . $page->post_status . ') - ';
                    echo '<a href="' . get_edit_post_link($page->ID) . '">Edit</a>';
                    if ($page->post_status === 'trash') {
                        echo ' | <a href="' . get_delete_post_link($page->ID, '', true) . '">Delete Permanently</a>';
                    }
                    echo '</li>';
                }
                echo '</ul>';
            } else {
                echo '<p style="color: green;">✅ No conflicting pages found with slug "templates"</p>';
            }

            echo '<p><strong>Test URLs:</strong></p>';
            echo '<ul>';
            echo '<li><a href="' . home_url('/templates/') . '" target="_blank">/templates/</a></li>';
            echo '<li><a href="' . home_url('/templates/professional_clean/') . '" target="_blank">/templates/professional_clean/</a></li>';
            echo '</ul>';
            echo '</div>';
        });
    }
});

// Helper function for template access
function gmkb_get_template_pages() {
    return GMKB_Template_Pages::instance();
}
