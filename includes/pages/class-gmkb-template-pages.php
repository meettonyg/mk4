<?php
/**
 * GMKB Template Pages
 *
 * Two-step template selection flow:
 * Step 1: Pick persona (Author, Speaker, Podcast Guest, etc.)
 * Step 2: Pick visual theme (Professional Clean, Modern Dark, etc.)
 * Then redirect to /tools/media-kit/?template={persona}&theme={style}
 *
 * @package GMKB
 * @since 3.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Template_Pages {

    private static $instance = null;
    private $template_discovery = null;
    private $theme_discovery = null;

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
        if (file_exists(GMKB_PLUGIN_DIR . 'system/TemplateDiscovery.php')) {
            require_once GMKB_PLUGIN_DIR . 'system/TemplateDiscovery.php';
            $this->template_discovery = new TemplateDiscovery(GMKB_PLUGIN_DIR . 'starter-templates');
        }
        if (file_exists(GMKB_PLUGIN_DIR . 'system/ThemeDiscovery.php')) {
            require_once GMKB_PLUGIN_DIR . 'system/ThemeDiscovery.php';
            $this->theme_discovery = new ThemeDiscovery(GMKB_PLUGIN_DIR . 'themes');
        }
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
        add_rewrite_rule('^templates/?$', 'index.php?gmkb_templates=1', 'top');
    }

    public function register_query_vars($vars) {
        $vars[] = 'gmkb_templates';
        return $vars;
    }

    public function parse_request($wp) {
        $request = trim($wp->request, '/');
        if ($request === 'templates') {
            $wp->query_vars['gmkb_templates'] = '1';
        }
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
            // Fallback to sys_get_temp_dir if get_temp_dir fails
            $temp_file = @tempnam(sys_get_temp_dir(), 'gmkb-templates');
        }

        if ($temp_file === false) {
            error_log('GMKB Error: Failed to create temporary file for template rendering.');
            return '';
        }

        file_put_contents($temp_file, $this->get_template_content());
        return $temp_file;
    }

    private function get_template_content() {
        $templates = $this->template_discovery ? $this->template_discovery->getTemplates() : array();
        $themes = $this->get_visual_themes();

        ob_start();
        ?>
<?php get_header(); ?>

<div id="gmkb-template-picker" class="gmkb-picker">
    <!-- Step 1: Pick Persona -->
    <section class="gmkb-step gmkb-step-1 gmkb-active" data-step="1">
        <div class="gmkb-container">
            <div class="gmkb-step-header">
                <span class="gmkb-step-number">Step 1 of 2</span>
                <h1>I'm a...</h1>
                <p class="gmkb-subtitle">Choose the type of media kit that best fits your needs</p>
            </div>
            <div class="gmkb-persona-grid">
                <?php foreach ($templates as $id => $template) :
                    $persona = $template['persona'] ?? array();
                    $icon = $persona['icon'] ?? 'fa-solid fa-user';
                ?>
                <button type="button" class="gmkb-persona-card" data-template="<?php echo esc_attr($id); ?>">
                    <div class="gmkb-persona-icon">
                        <i class="<?php echo esc_attr($icon); ?>"></i>
                    </div>
                    <h3><?php echo esc_html($persona['label'] ?? $template['template_name'] ?? $id); ?></h3>
                    <p><?php echo esc_html($template['description'] ?? ''); ?></p>
                </button>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <!-- Step 2: Pick Theme -->
    <section class="gmkb-step gmkb-step-2" data-step="2">
        <div class="gmkb-container">
            <div class="gmkb-step-header">
                <button type="button" class="gmkb-back-btn" data-goto="1">
                    <i class="fa-solid fa-arrow-left"></i> Back
                </button>
                <span class="gmkb-step-number">Step 2 of 2</span>
                <h1>I want it to look...</h1>
                <p class="gmkb-subtitle">Choose a visual style for your media kit</p>
            </div>
            <div class="gmkb-theme-grid">
                <?php foreach ($themes as $id => $theme) :
                    $colors = $theme['colors'] ?? array();
                    $primary = $colors['primary'] ?? '#2563eb';
                    $secondary = $colors['secondary'] ?? '#1e40af';
                    $bg = $colors['background'] ?? '#ffffff';
                    $is_dark = $theme['metadata']['is_dark'] ?? false;
                ?>
                <button type="button" class="gmkb-theme-card <?php echo $is_dark ? 'gmkb-theme-dark' : ''; ?>" data-theme="<?php echo esc_attr($id); ?>">
                    <div class="gmkb-theme-preview" style="background: <?php echo esc_attr($bg); ?>">
                        <div class="gmkb-theme-colors">
                            <span style="background: <?php echo esc_attr($primary); ?>"></span>
                            <span style="background: <?php echo esc_attr($secondary); ?>"></span>
                        </div>
                        <div class="gmkb-theme-mockup">
                            <div class="gmkb-mockup-header" style="background: linear-gradient(135deg, <?php echo esc_attr($primary); ?>, <?php echo esc_attr($secondary); ?>)"></div>
                            <div class="gmkb-mockup-content">
                                <div class="gmkb-mockup-line" style="background: <?php echo esc_attr($primary); ?>"></div>
                                <div class="gmkb-mockup-line gmkb-short"></div>
                                <div class="gmkb-mockup-line gmkb-short"></div>
                            </div>
                        </div>
                    </div>
                    <div class="gmkb-theme-info">
                        <h3><?php echo esc_html($theme['theme_name'] ?? $id); ?></h3>
                        <p><?php echo esc_html($theme['style']['label'] ?? $theme['description'] ?? ''); ?></p>
                    </div>
                </button>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
</div>

<style>
:root {
    --gmkb-primary: #2563eb;
    --gmkb-primary-hover: #1d4ed8;
    --gmkb-bg: #f8fafc;
    --gmkb-surface: #ffffff;
    --gmkb-text: #1e293b;
    --gmkb-text-light: #64748b;
    --gmkb-border: #e2e8f0;
    --gmkb-radius: 16px;
    --gmkb-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
    --gmkb-shadow-lg: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
}

.gmkb-picker {
    min-height: 100vh;
    background: var(--gmkb-bg);
}

.gmkb-step {
    display: none;
    padding: 60px 20px 100px;
}

.gmkb-step.gmkb-active {
    display: block;
    animation: gmkbFadeIn 0.3s ease;
}

@keyframes gmkbFadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.gmkb-container {
    max-width: 1200px;
    margin: 0 auto;
}

.gmkb-step-header {
    text-align: center;
    margin-bottom: 48px;
}

.gmkb-step-number {
    display: inline-block;
    background: var(--gmkb-primary);
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 6px 16px;
    border-radius: 100px;
    margin-bottom: 24px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.gmkb-step-header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--gmkb-text);
    margin: 0 0 12px;
}

.gmkb-subtitle {
    font-size: 1.125rem;
    color: var(--gmkb-text-light);
    margin: 0;
}

.gmkb-back-btn {
    position: absolute;
    left: 0;
    top: 0;
    background: none;
    border: none;
    color: var(--gmkb-text-light);
    font-size: 0.875rem;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 0.2s;
}

.gmkb-back-btn:hover {
    background: var(--gmkb-border);
    color: var(--gmkb-text);
}

.gmkb-step-header {
    position: relative;
}

/* Persona Grid */
.gmkb-persona-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
}

.gmkb-persona-card {
    background: var(--gmkb-surface);
    border: 2px solid var(--gmkb-border);
    border-radius: var(--gmkb-radius);
    padding: 32px 24px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
}

.gmkb-persona-card:hover {
    border-color: var(--gmkb-primary);
    box-shadow: var(--gmkb-shadow-lg);
    transform: translateY(-4px);
}

.gmkb-persona-card.selected {
    border-color: var(--gmkb-primary);
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(37, 99, 235, 0.1));
}

.gmkb-persona-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, var(--gmkb-primary), #7c3aed);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
}

.gmkb-persona-icon i {
    font-size: 1.5rem;
    color: white;
}

.gmkb-persona-card h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--gmkb-text);
    margin: 0 0 8px;
}

.gmkb-persona-card p {
    font-size: 0.875rem;
    color: var(--gmkb-text-light);
    margin: 0;
    line-height: 1.5;
}

/* Theme Grid */
.gmkb-theme-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 24px;
}

.gmkb-theme-card {
    background: var(--gmkb-surface);
    border: 2px solid var(--gmkb-border);
    border-radius: var(--gmkb-radius);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
}

.gmkb-theme-card:hover {
    border-color: var(--gmkb-primary);
    box-shadow: var(--gmkb-shadow-lg);
    transform: translateY(-4px);
}

.gmkb-theme-preview {
    padding: 20px;
    position: relative;
}

.gmkb-theme-colors {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
}

.gmkb-theme-colors span {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.gmkb-theme-mockup {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.gmkb-theme-dark .gmkb-theme-mockup {
    background: #1e293b;
}

.gmkb-mockup-header {
    height: 40px;
}

.gmkb-mockup-content {
    padding: 12px;
}

.gmkb-mockup-line {
    height: 8px;
    border-radius: 4px;
    margin-bottom: 8px;
    opacity: 0.7;
}

.gmkb-mockup-line:last-child {
    margin-bottom: 0;
}

.gmkb-mockup-line.gmkb-short {
    width: 60%;
    background: #e2e8f0;
}

.gmkb-theme-dark .gmkb-mockup-line.gmkb-short {
    background: #334155;
}

.gmkb-theme-info {
    padding: 20px;
    border-top: 1px solid var(--gmkb-border);
}

.gmkb-theme-info h3 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--gmkb-text);
    margin: 0 0 4px;
}

.gmkb-theme-info p {
    font-size: 0.813rem;
    color: var(--gmkb-text-light);
    margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
    .gmkb-step {
        padding: 40px 16px 80px;
    }
    .gmkb-step-header h1 {
        font-size: 1.75rem;
    }
    .gmkb-persona-grid,
    .gmkb-theme-grid {
        grid-template-columns: 1fr;
    }
}
</style>

<script>
(function() {
    const picker = document.getElementById('gmkb-template-picker');
    if (!picker) return;

    let selectedTemplate = null;
    let selectedTheme = null;

    // Persona selection
    picker.querySelectorAll('.gmkb-persona-card').forEach(card => {
        card.addEventListener('click', function() {
            selectedTemplate = this.dataset.template;

            // Update selection state
            picker.querySelectorAll('.gmkb-persona-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');

            // Go to step 2
            goToStep(2);
        });
    });

    // Theme selection
    picker.querySelectorAll('.gmkb-theme-card').forEach(card => {
        card.addEventListener('click', function() {
            selectedTheme = this.dataset.theme;

            // Redirect to builder
            const url = new URL('<?php echo esc_url(home_url('/tools/media-kit/')); ?>');
            url.searchParams.set('template', selectedTemplate);
            url.searchParams.set('theme', selectedTheme);
            window.location.href = url.toString();
        });
    });

    // Back button
    picker.querySelectorAll('.gmkb-back-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            goToStep(parseInt(this.dataset.goto));
        });
    });

    function goToStep(step) {
        picker.querySelectorAll('.gmkb-step').forEach(s => {
            s.classList.remove('gmkb-active');
            if (parseInt(s.dataset.step) === step) {
                s.classList.add('gmkb-active');
            }
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
})();
</script>

<?php get_footer(); ?>
        <?php
        return ob_get_clean();
    }

    /**
     * Get visual-only themes (exclude old mixed themes with defaultContent)
     */
    private function get_visual_themes() {
        if (!$this->theme_discovery) {
            return array();
        }

        $all_themes = $this->theme_discovery->getThemes();
        $visual_themes = array();

        foreach ($all_themes as $id => $theme) {
            // Skip themes that have layout content (old architecture)
            if (isset($theme['defaultContent'])) {
                continue;
            }
            $visual_themes[$id] = $theme;
        }

        return $visual_themes;
    }

    public function output_seo_tags() {
        if (!get_query_var('gmkb_templates')) return;

        $site_name = get_bloginfo('name');
        $title = 'Create Your Media Kit - ' . $site_name;
        $description = 'Build a professional media kit in minutes. Choose your persona and visual style to get started.';
        $url = home_url('/templates/');

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
        return 'Create Your Media Kit - ' . get_bloginfo('name');
    }

    public function add_body_class($classes) {
        if (get_query_var('gmkb_templates')) {
            $classes[] = 'gmkb-template-picker';
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
