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
 * @version 1.1.0
 * @since 2.4.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Template_Pages {

    private static $instance = null;
    private $discovery = null;
    private $base_path = 'templates';
    private $query_var = 'gmkb_template';
    private $directory_var = 'gmkb_templates_directory';
    private $current_template = null;

    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->load_dependencies();
        $this->init_hooks();
    }

    private function load_dependencies() {
        $discovery_path = GMKB_PLUGIN_DIR . 'system/ThemeDiscovery.php';
        if (file_exists($discovery_path)) {
            require_once $discovery_path;
            $this->discovery = new ThemeDiscovery(GMKB_PLUGIN_DIR . 'themes');
        }
    }

    private function init_hooks() {
        // Register rewrite rules on init, or immediately if init already fired
        add_action('init', array($this, 'register_rewrite_rules'), 10);
        if (did_action('init') > 0) {
            $this->register_rewrite_rules();
        }

        add_filter('query_vars', array($this, 'register_query_vars'));

        // Catch template URLs during request parsing (before 404 detection)
        add_action('parse_request', array($this, 'parse_template_request'), 1);

        // Template handling
        add_filter('template_include', array($this, 'load_template'), 99);

        // SEO hooks
        add_action('wp_head', array($this, 'output_seo_tags'), 1);
        add_filter('document_title_parts', array($this, 'filter_title'));
        add_filter('pre_get_document_title', array($this, 'get_document_title'), 10);

        // Body class
        add_filter('body_class', array($this, 'add_body_class'));

        // Flush rewrite rules on first load or when needed
        add_action('init', array($this, 'maybe_flush_rewrite_rules'), 99);
        add_action('admin_init', array($this, 'check_rewrite_rules'));
    }

    public function is_template_page() {
        return $this->current_template || get_query_var($this->directory_var);
    }

    public function register_rewrite_rules() {
        add_rewrite_rule(
            '^' . $this->base_path . '/([^/]+)/?$',
            'index.php?' . $this->query_var . '=$matches[1]',
            'top'
        );
        add_rewrite_rule(
            '^' . $this->base_path . '/?$',
            'index.php?' . $this->directory_var . '=1',
            'top'
        );
    }

    public function register_query_vars($vars) {
        $vars[] = $this->query_var;
        $vars[] = $this->directory_var;
        return $vars;
    }

    /**
     * Parse template request - catches URLs that rewrite rules might miss
     */
    public function parse_template_request($wp) {
        $request = trim($wp->request, '/');

        // Match /templates/ (directory)
        if ($request === $this->base_path || $request === $this->base_path . '/') {
            $wp->query_vars[$this->directory_var] = '1';
            return;
        }

        // Match /templates/{slug}/ (individual template)
        if (preg_match('#^' . preg_quote($this->base_path, '#') . '/([^/]+)/?$#', $request, $matches)) {
            $template_slug = sanitize_file_name($matches[1]);
            if ($this->discovery && $this->discovery->getTheme($template_slug)) {
                $wp->query_vars[$this->query_var] = $template_slug;
            }
        }
    }

    public function load_template($template) {
        $template_slug = get_query_var($this->query_var);
        if (!empty($template_slug)) {
            return $this->load_single_template($template_slug);
        }

        if (get_query_var($this->directory_var)) {
            return $this->load_directory_template();
        }

        return $template;
    }

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

        $this->current_template = $template_data;
        $this->current_template['slug'] = $template_slug;

        status_header(200);
        $wp_query->is_404 = false;
        $wp_query->is_page = true;
        $wp_query->is_singular = true;

        $theme_template = locate_template('gmkb-template-single.php');
        if ($theme_template) {
            return $theme_template;
        }

        $plugin_template = GMKB_PLUGIN_DIR . 'templates/template-single.php';
        if (file_exists($plugin_template)) {
            return $plugin_template;
        }

        return $this->create_inline_template('single');
    }

    private function load_directory_template() {
        global $wp_query;

        status_header(200);
        $wp_query->is_404 = false;
        $wp_query->is_page = true;
        $wp_query->is_singular = true;
        $wp_query->is_archive = true;

        $theme_template = locate_template('gmkb-template-directory.php');
        if ($theme_template) {
            return $theme_template;
        }

        $plugin_template = GMKB_PLUGIN_DIR . 'templates/template-directory.php';
        if (file_exists($plugin_template)) {
            return $plugin_template;
        }

        return $this->create_inline_template('directory');
    }

    private function create_inline_template($type) {
        $temp_file = wp_tempnam('gmkb-template-' . $type);
        $content = ($type === 'directory')
            ? $this->get_directory_template_content()
            : $this->get_single_template_content();
        file_put_contents($temp_file, $content);
        return $temp_file;
    }

    private function get_directory_template_content() {
        ob_start();
        ?>
<?php get_header(); ?>
<div class="gmkb-template-directory-page">
    <div class="gmkb-template-hero">
        <div class="container">
            <h1>Media Kit Templates</h1>
            <p class="lead">Choose from our professionally designed templates to create your perfect media kit.</p>
        </div>
    </div>
    <div class="gmkb-templates-grid-wrapper">
        <div class="container">
            <?php
            $discovery = new ThemeDiscovery(GMKB_PLUGIN_DIR . 'themes');
            $templates = $discovery->getThemes();
            if (!empty($templates)) : ?>
            <div class="gmkb-templates-grid">
                <?php foreach ($templates as $slug => $template) : ?>
                <article class="gmkb-template-card">
                    <a href="<?php echo esc_url(home_url('/templates/' . $slug . '/')); ?>" class="gmkb-template-link">
                        <div class="gmkb-template-thumbnail">
                            <?php if (!empty($template['preview_url'])) : ?>
                                <img src="<?php echo esc_url($template['preview_url']); ?>" alt="<?php echo esc_attr($template['theme_name'] ?? $slug); ?>" loading="lazy">
                            <?php else : ?>
                                <div class="gmkb-template-placeholder"><span><?php echo esc_html(strtoupper(substr($template['theme_name'] ?? $slug, 0, 2))); ?></span></div>
                            <?php endif; ?>
                        </div>
                        <div class="gmkb-template-info">
                            <h2><?php echo esc_html($template['theme_name'] ?? $slug); ?></h2>
                            <?php if (!empty($template['description'])) : ?><p><?php echo esc_html($template['description']); ?></p><?php endif; ?>
                        </div>
                    </a>
                </article>
                <?php endforeach; ?>
            </div>
            <?php else : ?><p class="gmkb-no-templates">No templates available.</p><?php endif; ?>
        </div>
    </div>
    <div class="gmkb-templates-cta">
        <div class="container">
            <h2>Ready to Create Your Media Kit?</h2>
            <?php if (is_user_logged_in()) : ?>
                <a href="<?php echo esc_url(home_url('/tools/media-kit/')); ?>" class="gmkb-btn gmkb-btn-primary">Open Media Kit Builder</a>
            <?php else : ?>
                <a href="<?php echo esc_url(wp_registration_url()); ?>" class="gmkb-btn gmkb-btn-primary">Get Started Free</a>
            <?php endif; ?>
        </div>
    </div>
</div>
<style>
.gmkb-template-directory-page{background:#f8fafc;min-height:100vh}
.gmkb-template-hero{background:linear-gradient(135deg,#1e293b,#334155);color:#fff;padding:80px 20px;text-align:center}
.gmkb-template-hero h1{font-size:2.5rem;margin-bottom:1rem;font-weight:700}
.gmkb-template-hero .lead{font-size:1.125rem;opacity:.9;max-width:600px;margin:0 auto}
.gmkb-templates-grid-wrapper{padding:60px 20px}
.gmkb-templates-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:30px;max-width:1200px;margin:0 auto}
.gmkb-template-card{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,.1);transition:transform .2s,box-shadow .2s}
.gmkb-template-card:hover{transform:translateY(-4px);box-shadow:0 20px 25px -5px rgba(0,0,0,.1)}
.gmkb-template-link{text-decoration:none;color:inherit;display:block}
.gmkb-template-thumbnail{position:relative;aspect-ratio:16/10;background:#e2e8f0;overflow:hidden}
.gmkb-template-thumbnail img{width:100%;height:100%;object-fit:cover}
.gmkb-template-placeholder{display:flex;align-items:center;justify-content:center;height:100%;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;font-size:2rem;font-weight:700}
.gmkb-template-info{padding:20px}
.gmkb-template-info h2{font-size:1.25rem;margin:0 0 8px;color:#1e293b}
.gmkb-template-info p{font-size:.875rem;color:#64748b;margin:0;line-height:1.5}
.gmkb-templates-cta{background:#1e293b;color:#fff;padding:80px 20px;text-align:center}
.gmkb-templates-cta h2{font-size:2rem;margin-bottom:2rem}
.gmkb-btn{display:inline-block;padding:14px 32px;border-radius:8px;font-weight:600;text-decoration:none;transition:all .2s}
.gmkb-btn-primary{background:#3b82f6;color:#fff}
.gmkb-btn-primary:hover{background:#2563eb}
.container{max-width:1200px;margin:0 auto}
@media(max-width:768px){.gmkb-template-hero h1{font-size:1.75rem}.gmkb-templates-grid{grid-template-columns:1fr}}
</style>
<?php get_footer(); ?>
        <?php
        return ob_get_clean();
    }

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
            <nav class="gmkb-breadcrumb"><a href="<?php echo esc_url(home_url('/templates/')); ?>">Templates</a> / <span><?php echo esc_html($template['theme_name'] ?? $slug); ?></span></nav>
            <h1><?php echo esc_html($template['theme_name'] ?? $slug); ?></h1>
            <?php if (!empty($template['description'])) : ?><p class="lead"><?php echo esc_html($template['description']); ?></p><?php endif; ?>
        </div>
    </div>
    <div class="gmkb-template-preview-section">
        <div class="container">
            <div class="gmkb-preview-frame">
                <?php if (!empty($template['preview_url'])) : ?>
                    <img src="<?php echo esc_url($template['preview_url']); ?>" alt="<?php echo esc_attr($template['theme_name'] ?? $slug); ?>" class="gmkb-preview-image">
                <?php else : ?>
                    <div class="gmkb-preview-placeholder"><span><?php echo esc_html(strtoupper(substr($template['theme_name'] ?? $slug, 0, 2))); ?></span></div>
                <?php endif; ?>
            </div>
        </div>
    </div>
    <div class="gmkb-template-cta">
        <div class="container">
            <h2>Start Building with This Template</h2>
            <?php if (is_user_logged_in()) : ?>
                <a href="<?php echo esc_url(home_url('/tools/media-kit/?template=' . $slug)); ?>" class="gmkb-btn gmkb-btn-primary">Use This Template</a>
            <?php else : ?>
                <a href="<?php echo esc_url(wp_registration_url()); ?>" class="gmkb-btn gmkb-btn-primary">Get Started Free</a>
            <?php endif; ?>
        </div>
    </div>
</div>
<style>
.gmkb-template-single-page{background:#f8fafc;min-height:100vh}
.gmkb-template-header{background:linear-gradient(135deg,#1e293b,#334155);color:#fff;padding:60px 20px 80px}
.gmkb-breadcrumb{margin-bottom:1.5rem;font-size:.875rem;opacity:.8}
.gmkb-breadcrumb a{color:#fff;text-decoration:none}
.gmkb-template-header h1{font-size:2.5rem;margin-bottom:1rem;font-weight:700}
.gmkb-template-header .lead{font-size:1.125rem;opacity:.9;max-width:700px}
.gmkb-template-preview-section{padding:0 20px;margin-top:-40px;margin-bottom:60px}
.gmkb-preview-frame{background:#fff;border-radius:16px;box-shadow:0 25px 50px -12px rgba(0,0,0,.15);overflow:hidden;max-width:900px;margin:0 auto}
.gmkb-preview-image{width:100%;display:block}
.gmkb-preview-placeholder{aspect-ratio:16/10;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;font-size:4rem;font-weight:700}
.gmkb-template-cta{background:#1e293b;color:#fff;padding:80px 20px;text-align:center}
.gmkb-template-cta h2{font-size:2rem;margin-bottom:2rem}
.gmkb-btn{display:inline-block;padding:14px 32px;border-radius:8px;font-weight:600;text-decoration:none}
.gmkb-btn-primary{background:#3b82f6;color:#fff}
.gmkb-btn-primary:hover{background:#2563eb}
.container{max-width:1200px;margin:0 auto}
@media(max-width:768px){.gmkb-template-header h1{font-size:1.75rem}}
</style>
<?php get_footer(); ?>
        <?php
        return ob_get_clean();
    }

    public function get_current_template() {
        return $this->current_template;
    }

    public function output_seo_tags() {
        if (!$this->is_template_page()) return;

        if (get_query_var($this->directory_var)) {
            $this->output_directory_seo();
        } elseif ($this->current_template) {
            $this->output_single_seo();
        }
    }

    private function output_directory_seo() {
        $site_name = get_bloginfo('name');
        $title = 'Media Kit Templates - ' . $site_name;
        $description = 'Browse our collection of professionally designed media kit templates. Fully customizable and easy to use.';
        $url = home_url('/templates/');

        echo "\n<!-- GMKB SEO -->\n";
        echo '<meta name="description" content="' . esc_attr($description) . '">' . "\n";
        echo '<link rel="canonical" href="' . esc_url($url) . '">' . "\n";
        echo '<meta property="og:type" content="website">' . "\n";
        echo '<meta property="og:title" content="' . esc_attr($title) . '">' . "\n";
        echo '<meta property="og:description" content="' . esc_attr($description) . '">' . "\n";
        echo '<meta property="og:url" content="' . esc_url($url) . '">' . "\n";
        echo '<meta name="twitter:card" content="summary_large_image">' . "\n";

        $this->output_directory_jsonld();
    }

    private function output_single_seo() {
        $template = $this->current_template;
        $slug = $template['slug'] ?? '';
        $name = $template['theme_name'] ?? $slug;
        $site_name = get_bloginfo('name');
        $title = $name . ' Media Kit Template - ' . $site_name;
        $description = $template['description'] ?? 'Create a stunning media kit with our ' . $name . ' template.';
        $url = home_url('/templates/' . $slug . '/');

        echo "\n<!-- GMKB SEO -->\n";
        echo '<meta name="description" content="' . esc_attr($description) . '">' . "\n";
        echo '<link rel="canonical" href="' . esc_url($url) . '">' . "\n";
        echo '<meta property="og:type" content="product">' . "\n";
        echo '<meta property="og:title" content="' . esc_attr($title) . '">' . "\n";
        echo '<meta property="og:description" content="' . esc_attr($description) . '">' . "\n";
        echo '<meta property="og:url" content="' . esc_url($url) . '">' . "\n";
        if (!empty($template['preview_url'])) {
            echo '<meta property="og:image" content="' . esc_url($template['preview_url']) . '">' . "\n";
        }
        echo '<meta name="twitter:card" content="summary_large_image">' . "\n";

        $this->output_single_jsonld();
    }

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
            'numberOfItems' => count($items),
            'itemListElement' => $items,
        );
        echo '<script type="application/ld+json">' . wp_json_encode($jsonld, JSON_UNESCAPED_SLASHES) . '</script>' . "\n";
    }

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
            'offers' => array('@type' => 'Offer', 'price' => '0', 'priceCurrency' => 'USD'),
        );
        if (!empty($template['preview_url'])) {
            $jsonld['image'] = $template['preview_url'];
        }
        echo '<script type="application/ld+json">' . wp_json_encode($jsonld, JSON_UNESCAPED_SLASHES) . '</script>' . "\n";
    }

    public function filter_title($title_parts) {
        if (!$this->is_template_page()) return $title_parts;

        if (get_query_var($this->directory_var)) {
            $title_parts['title'] = 'Media Kit Templates';
        } elseif ($this->current_template) {
            $title_parts['title'] = ($this->current_template['theme_name'] ?? $this->current_template['slug']) . ' Media Kit Template';
        }
        return $title_parts;
    }

    public function get_document_title($title) {
        if (!$this->is_template_page()) return $title;

        $site_name = get_bloginfo('name');
        if (get_query_var($this->directory_var)) {
            return 'Media Kit Templates - ' . $site_name;
        }
        if ($this->current_template) {
            return ($this->current_template['theme_name'] ?? $this->current_template['slug']) . ' Media Kit Template - ' . $site_name;
        }
        return $title;
    }

    public function add_body_class($classes) {
        if (get_query_var($this->directory_var)) {
            $classes[] = 'gmkb-template-directory';
        } elseif ($this->current_template) {
            $classes[] = 'gmkb-template-single';
            $classes[] = 'gmkb-template-' . sanitize_html_class($this->current_template['slug'] ?? '');
        }
        return $classes;
    }

    public function maybe_flush_rewrite_rules() {
        if (get_option('gmkb_template_pages_flush_rewrite')) {
            flush_rewrite_rules();
            delete_option('gmkb_template_pages_flush_rewrite');
        }
    }

    public function check_rewrite_rules() {
        $rules = get_option('rewrite_rules');
        $has_rules = is_array($rules) && (
            array_filter(array_keys($rules), fn($p) => strpos($p, $this->base_path) !== false)
        );
        if (!$has_rules) {
            update_option('gmkb_template_pages_flush_rewrite', true);
        }
    }

    public static function schedule_flush() {
        update_option('gmkb_template_pages_flush_rewrite', true);
    }

    public static function force_flush() {
        flush_rewrite_rules();
        delete_option('gmkb_template_pages_flush_rewrite');
    }
}

// Initialize
$gmkb_template_pages = GMKB_Template_Pages::instance();

// Admin flush action: /wp-admin/?gmkb_flush_template_rules=1
add_action('admin_init', function() {
    if (isset($_GET['gmkb_flush_template_rules']) && current_user_can('manage_options')) {
        GMKB_Template_Pages::force_flush();
        add_action('admin_notices', fn() =>
            print '<div class="notice notice-success is-dismissible"><p>Template rewrite rules flushed.</p></div>'
        );
    }
});

function gmkb_get_template_pages() {
    return GMKB_Template_Pages::instance();
}
