<?php
/**
 * GMKB Template Pages
 *
 * Serves the /templates page as a Vue-powered template picker.
 * PHP provides a thin shell; Vue handles all UI rendering.
 *
 * SEO-friendly URLs:
 * - /templates/                     - Persona selection (Step 1)
 * - /templates/authors-writers/     - Author/Writer templates
 * - /templates/podcast-guests/      - Podcast Guest templates
 * - /templates/speakers-coaches/    - Speaker/Coach templates
 * - /templates/business-professionals/ - Business templates
 *
 * @package GMKB
 * @since 3.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Template_Pages {

    private static $instance = null;

    /**
     * Valid persona slugs mapped to their display info
     * Slugs use hyphens for URLs, types use underscores internally
     */
    private static $persona_map = array(
        'authors-writers' => array(
            'type' => 'author',
            'label' => 'Authors & Writers',
            'description' => 'Media kit templates designed for authors, writers, and literary professionals.',
        ),
        'podcast-guests' => array(
            'type' => 'podcast_guest',
            'label' => 'Podcast Guests',
            'description' => 'Media kit templates for podcast guests and interview subjects.',
        ),
        'speakers-coaches' => array(
            'type' => 'speaker',
            'label' => 'Speakers & Coaches',
            'description' => 'Media kit templates for speakers, coaches, and consultants.',
        ),
        'business-professionals' => array(
            'type' => 'business',
            'label' => 'Business Professionals',
            'description' => 'Media kit templates for business professionals and entrepreneurs.',
        ),
    );

    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->init_hooks();
    }

    private function init_hooks() {
        add_action('init', array($this, 'register_rewrite_rules'), 10);
        add_filter('query_vars', array($this, 'register_query_vars'));
        add_action('parse_request', array($this, 'parse_request'), 1);
        add_filter('template_include', array($this, 'load_template'), 99);
        add_action('wp_head', array($this, 'output_seo_tags'), 1);
        add_filter('pre_get_document_title', array($this, 'get_document_title'), 10);
        add_filter('body_class', array($this, 'add_body_class'));
        add_action('init', array($this, 'maybe_flush_rewrite_rules'), 99);
    }

    public function register_rewrite_rules() {
        // Base templates page
        add_rewrite_rule('^templates/?$', 'index.php?gmkb_templates=1', 'top');
        // Persona-specific pages: /templates/{persona-slug}/
        add_rewrite_rule('^templates/([^/]+)/?$', 'index.php?gmkb_templates=1&gmkb_persona=$matches[1]', 'top');
    }

    public function register_query_vars($vars) {
        $vars[] = 'gmkb_templates';
        $vars[] = 'gmkb_persona';
        return $vars;
    }

    public function parse_request($wp) {
        $request = trim($wp->request, '/');

        // Match /templates or /templates/{slug}
        if (preg_match('#^templates(?:/([^/]+))?/?$#', $request, $matches)) {
            $wp->query_vars['gmkb_templates'] = '1';
            if (!empty($matches[1])) {
                $wp->query_vars['gmkb_persona'] = sanitize_title($matches[1]);
            }
        }
    }

    /**
     * Get current persona data from URL
     */
    private function get_current_persona() {
        $slug = get_query_var('gmkb_persona', '');
        if ($slug && isset(self::$persona_map[$slug])) {
            return array_merge(
                self::$persona_map[$slug],
                array('slug' => $slug)
            );
        }
        return null;
    }

    public function load_template($template) {
        if (!get_query_var('gmkb_templates')) {
            return $template;
        }

        global $wp_query;
        status_header(200);
        $wp_query->is_404 = false;
        $wp_query->is_page = true;

        // Check for theme file first
        $theme_template = locate_template('gmkb-templates.php');
        if ($theme_template) {
            return $theme_template;
        }

        // Use inline template
        $temp_file = @tempnam(get_temp_dir(), 'gmkb-templates');

        if ($temp_file === false) {
            $temp_file = @tempnam(sys_get_temp_dir(), 'gmkb-templates');
        }

        if ($temp_file === false) {
            error_log('GMKB Error: Failed to create temporary file for template rendering.');
            return '';
        }

        file_put_contents($temp_file, $this->get_template_content());
        return $temp_file;
    }

    /**
     * Generate the Vue shell page content
     */
    private function get_template_content() {
        $plugin_url = GMKB_PLUGIN_URL;
        $rest_url = rest_url('gmkb/v1/');
        $rest_nonce = wp_create_nonce('wp_rest');
        $builder_url = home_url('/tools/media-kit/');
        $login_url = wp_login_url(home_url('/templates/'));
        $is_logged_in = is_user_logged_in();
        $current_persona = $this->get_current_persona();
        $base_url = home_url('/templates/');

        ob_start();
        ?>
<?php get_header(); ?>

<div id="gmkb-template-picker-app" class="gmkb-template-picker-shell">
    <!-- Loading state while Vue initializes -->
    <div class="gmkb-loading-state">
        <div class="gmkb-loading-spinner"></div>
        <p>Loading templates...</p>
    </div>
</div>

<style>
/* Shell styles - Vue takes over once loaded */
.gmkb-template-picker-shell {
    min-height: 100vh;
    background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.gmkb-loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    color: rgba(255, 255, 255, 0.7);
}

.gmkb-loading-spinner {
    width: 48px;
    height: 48px;
    border: 3px solid rgba(255, 255, 255, 0.2);
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: gmkb-spin 0.8s linear infinite;
    margin-bottom: 16px;
}

@keyframes gmkb-spin {
    to { transform: rotate(360deg); }
}

/* Hide loading state when Vue is ready */
.gmkb-vue-mounted .gmkb-loading-state {
    display: none;
}
</style>

<script>
// Configuration for Vue template picker
window.gmkbTemplatePickerData = {
    isTemplatePicker: true,
    restUrl: '<?php echo esc_js($rest_url); ?>',
    restNonce: '<?php echo esc_js($rest_nonce); ?>',
    builderUrl: '<?php echo esc_js($builder_url); ?>',
    loginUrl: '<?php echo esc_js($login_url); ?>',
    isLoggedIn: <?php echo $is_logged_in ? 'true' : 'false'; ?>,
    pluginUrl: '<?php echo esc_js($plugin_url); ?>',
    baseUrl: '<?php echo esc_js($base_url); ?>',
    // SEO-friendly persona routing
    initialPersona: <?php echo $current_persona ? json_encode($current_persona) : 'null'; ?>,
    personaSlugs: <?php echo json_encode(self::$persona_map); ?>
};
</script>

<!-- Load Font Awesome for icons -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" crossorigin="anonymous">

<!-- Load Vue bundle -->
<link rel="stylesheet" href="<?php echo esc_url($plugin_url . 'dist/gmkb.css'); ?>">
<script src="<?php echo esc_url($plugin_url . 'dist/gmkb.iife.js'); ?>"></script>

<script>
// Initialize Vue template picker after bundle loads
(function() {
    function initTemplatePicker() {
        if (typeof window.GMKB === 'undefined' || !window.GMKB.initTemplatePicker) {
            // Retry if GMKB not ready yet
            setTimeout(initTemplatePicker, 100);
            return;
        }

        window.GMKB.initTemplatePicker('#gmkb-template-picker-app');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTemplatePicker);
    } else {
        initTemplatePicker();
    }
})();
</script>

<?php get_footer(); ?>
        <?php
        return ob_get_clean();
    }

    public function output_seo_tags() {
        if (!get_query_var('gmkb_templates')) return;

        $site_name = get_bloginfo('name');
        $persona = $this->get_current_persona();

        if ($persona) {
            // Persona-specific SEO
            $title = $persona['label'] . ' Media Kit Templates - ' . $site_name;
            $description = $persona['description'];
            $url = home_url('/templates/' . $persona['slug'] . '/');
        } else {
            // Main templates page SEO
            $title = 'Create Your Media Kit - ' . $site_name;
            $description = 'Build a professional media kit in minutes. Choose your persona and visual style to get started.';
            $url = home_url('/templates/');
        }

        echo "\n<!-- GMKB SEO -->\n";
        echo '<meta name="description" content="' . esc_attr($description) . '">' . "\n";
        echo '<link rel="canonical" href="' . esc_url($url) . '">' . "\n";
        echo '<meta property="og:type" content="website">' . "\n";
        echo '<meta property="og:title" content="' . esc_attr($title) . '">' . "\n";
        echo '<meta property="og:description" content="' . esc_attr($description) . '">' . "\n";
        echo '<meta property="og:url" content="' . esc_url($url) . '">' . "\n";
        echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
    }

    public function get_document_title($title) {
        if (!get_query_var('gmkb_templates')) return $title;

        $site_name = get_bloginfo('name');
        $persona = $this->get_current_persona();

        if ($persona) {
            return $persona['label'] . ' Media Kit Templates - ' . $site_name;
        }
        return 'Create Your Media Kit - ' . $site_name;
    }

    public function add_body_class($classes) {
        if (get_query_var('gmkb_templates')) {
            $classes[] = 'gmkb-template-picker-page';
        }
        return $classes;
    }

    public function maybe_flush_rewrite_rules() {
        if (get_option('gmkb_template_pages_flush_rewrite')) {
            flush_rewrite_rules();
            delete_option('gmkb_template_pages_flush_rewrite');
        }
    }

    public static function schedule_flush() {
        update_option('gmkb_template_pages_flush_rewrite', true);
    }
}

// Initialize
GMKB_Template_Pages::instance();

// Admin flush action
add_action('admin_init', function() {
    if (isset($_GET['gmkb_flush_template_rules']) && current_user_can('manage_options')) {
        GMKB_Template_Pages::schedule_flush();
        flush_rewrite_rules();
    }
});

// Schedule flush when this file's rewrite rules version changes
// This ensures new persona URL patterns are registered
add_action('init', function() {
    $current_version = '2.0'; // Bump this when adding new rewrite rules
    $stored_version = get_option('gmkb_template_pages_rewrite_version', '1.0');
    if ($current_version !== $stored_version) {
        GMKB_Template_Pages::schedule_flush();
        update_option('gmkb_template_pages_rewrite_version', $current_version);
    }
}, 5);
