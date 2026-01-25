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

        // Group templates by persona type
        $personas = array();
        $templates_by_persona = array();

        foreach ($templates as $id => $template) {
            $persona = $template['persona'] ?? array();
            $persona_type = $persona['type'] ?? 'other';

            // Store unique personas
            if (!isset($personas[$persona_type])) {
                $personas[$persona_type] = array(
                    'type' => $persona_type,
                    'label' => $persona['label'] ?? ucfirst($persona_type),
                    'icon' => $persona['icon'] ?? 'fa-solid fa-user',
                    'description' => $this->get_persona_description($persona_type),
                    'count' => 0
                );
            }
            $personas[$persona_type]['count']++;

            // Group templates by persona
            if (!isset($templates_by_persona[$persona_type])) {
                $templates_by_persona[$persona_type] = array();
            }
            $templates_by_persona[$persona_type][$id] = $template;
        }

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
                <?php foreach ($personas as $persona_type => $persona) : ?>
                <button type="button" class="gmkb-persona-card" data-persona="<?php echo esc_attr($persona_type); ?>">
                    <div class="gmkb-persona-icon">
                        <i class="<?php echo esc_attr($persona['icon']); ?>"></i>
                    </div>
                    <h3><?php echo esc_html($persona['label']); ?></h3>
                    <p><?php echo esc_html($persona['description']); ?></p>
                    <span class="gmkb-template-count"><?php echo intval($persona['count']); ?> templates</span>
                </button>
                <?php endforeach; ?>
            </div>
            <div class="gmkb-view-all-wrapper">
                <button type="button" class="gmkb-view-all-btn" data-action="view-all">
                    <i class="fa-solid fa-grid-2"></i>
                    View All Templates
                </button>
            </div>
        </div>
    </section>

    <!-- Step 2: Pick Template -->
    <section class="gmkb-step gmkb-step-2" data-step="2">
        <div class="gmkb-container">
            <div class="gmkb-step-header">
                <button type="button" class="gmkb-back-btn" data-goto="1">
                    <i class="fa-solid fa-arrow-left"></i> Back to personas
                </button>
                <span class="gmkb-step-number">Step 2 of 2</span>
                <h1 class="gmkb-step2-title">Choose Your Template</h1>
                <p class="gmkb-subtitle">Pick a layout style that fits your brand</p>
            </div>

            <!-- Template cards for each persona (shown/hidden via JS) -->
            <?php foreach ($templates_by_persona as $persona_type => $persona_templates) : ?>
            <div class="gmkb-template-group" data-persona="<?php echo esc_attr($persona_type); ?>" style="display: none;">
                <div class="gmkb-template-grid">
                    <?php foreach ($persona_templates as $id => $template) :
                        $layout_variant = $template['persona']['layout_variant'] ?? 'standard';
                        $layout_label = $this->get_layout_label($layout_variant);
                    ?>
                    <button type="button" class="gmkb-template-card" data-template="<?php echo esc_attr($id); ?>">
                        <div class="gmkb-template-preview">
                            <i class="<?php echo esc_attr($template['persona']['icon'] ?? 'fa-solid fa-file'); ?>"></i>
                        </div>
                        <div class="gmkb-template-info">
                            <h3><?php echo esc_html($template['template_name'] ?? $id); ?></h3>
                            <p><?php echo esc_html($template['description'] ?? ''); ?></p>
                            <span class="gmkb-layout-badge"><?php echo esc_html($layout_label); ?></span>
                        </div>
                    </button>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endforeach; ?>

            <!-- All templates (for "View All" mode) -->
            <div class="gmkb-template-group gmkb-all-templates" data-persona="all" style="display: none;">
                <div class="gmkb-template-grid">
                    <?php foreach ($templates as $id => $template) :
                        $persona = $template['persona'] ?? array();
                        $layout_variant = $persona['layout_variant'] ?? 'standard';
                        $layout_label = $this->get_layout_label($layout_variant);
                    ?>
                    <button type="button" class="gmkb-template-card" data-template="<?php echo esc_attr($id); ?>">
                        <div class="gmkb-template-preview">
                            <i class="<?php echo esc_attr($persona['icon'] ?? 'fa-solid fa-file'); ?>"></i>
                        </div>
                        <div class="gmkb-template-info">
                            <h3><?php echo esc_html($template['template_name'] ?? $id); ?></h3>
                            <p><?php echo esc_html($template['description'] ?? ''); ?></p>
                            <div class="gmkb-template-meta">
                                <span class="gmkb-persona-badge"><?php echo esc_html($persona['label'] ?? 'General'); ?></span>
                                <span class="gmkb-layout-badge"><?php echo esc_html($layout_label); ?></span>
                            </div>
                        </div>
                    </button>
                    <?php endforeach; ?>
                </div>
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
    margin: 0 0 12px;
    line-height: 1.5;
}

.gmkb-template-count {
    display: inline-block;
    padding: 4px 12px;
    background: var(--gmkb-border);
    color: var(--gmkb-text-light);
    font-size: 0.75rem;
    font-weight: 500;
    border-radius: 100px;
}

/* View All Button */
.gmkb-view-all-wrapper {
    text-align: center;
    margin-top: 32px;
    padding-top: 32px;
    border-top: 1px solid var(--gmkb-border);
}

.gmkb-view-all-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: transparent;
    border: 1px solid var(--gmkb-border);
    border-radius: 8px;
    color: var(--gmkb-text-light);
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.gmkb-view-all-btn:hover {
    background: var(--gmkb-surface);
    border-color: var(--gmkb-primary);
    color: var(--gmkb-primary);
}

/* Template Grid (Step 2) */
.gmkb-template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
}

.gmkb-template-card {
    background: var(--gmkb-surface);
    border: 2px solid var(--gmkb-border);
    border-radius: var(--gmkb-radius);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
}

.gmkb-template-card:hover {
    border-color: var(--gmkb-primary);
    box-shadow: var(--gmkb-shadow-lg);
    transform: translateY(-4px);
}

.gmkb-template-preview {
    height: 160px;
    background: linear-gradient(135deg, var(--gmkb-primary), #7c3aed);
    display: flex;
    align-items: center;
    justify-content: center;
}

.gmkb-template-preview i {
    font-size: 3rem;
    color: white;
    opacity: 0.9;
}

.gmkb-template-info {
    padding: 20px;
}

.gmkb-template-info h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--gmkb-text);
    margin: 0 0 8px;
}

.gmkb-template-info p {
    font-size: 0.875rem;
    color: var(--gmkb-text-light);
    margin: 0 0 12px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.gmkb-template-meta {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.gmkb-persona-badge {
    display: inline-block;
    padding: 4px 10px;
    background: #eff6ff;
    color: #3b82f6;
    font-size: 0.75rem;
    font-weight: 500;
    border-radius: 100px;
}

.gmkb-layout-badge {
    display: inline-block;
    padding: 4px 10px;
    background: #fef3c7;
    color: #d97706;
    font-size: 0.75rem;
    font-weight: 500;
    border-radius: 100px;
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

    let selectedPersona = null;
    const step2Title = picker.querySelector('.gmkb-step2-title');
    const personaLabels = {
        'author': 'Authors & Writers',
        'speaker': 'Speakers & Trainers',
        'podcast-guest': 'Podcast Guests',
        'consultant': 'Consultants & Advisors',
        'influencer': 'Creators & Influencers',
        'executive': 'Executives',
        'creative': 'Creative Professionals'
    };

    // Persona selection (Step 1)
    picker.querySelectorAll('.gmkb-persona-card').forEach(card => {
        card.addEventListener('click', function() {
            selectedPersona = this.dataset.persona;

            // Update selection state
            picker.querySelectorAll('.gmkb-persona-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');

            // Update Step 2 title
            const label = personaLabels[selectedPersona] || 'Your';
            if (step2Title) {
                step2Title.textContent = 'Choose Your ' + label + ' Template';
            }

            // Show templates for selected persona
            showTemplatesForPersona(selectedPersona);

            // Go to step 2
            goToStep(2);
        });
    });

    // View All button
    const viewAllBtn = picker.querySelector('.gmkb-view-all-btn');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', function() {
            selectedPersona = 'all';

            // Update Step 2 title
            if (step2Title) {
                step2Title.textContent = 'All Templates';
            }

            // Show all templates
            showTemplatesForPersona('all');

            // Go to step 2
            goToStep(2);
        });
    }

    // Template selection (Step 2)
    picker.querySelectorAll('.gmkb-template-card').forEach(card => {
        card.addEventListener('click', function() {
            const templateId = this.dataset.template;

            // Redirect to builder with template
            const url = new URL('<?php echo esc_url(home_url('/tools/media-kit/')); ?>');
            url.searchParams.set('template', templateId);
            window.location.href = url.toString();
        });
    });

    // Back button
    picker.querySelectorAll('.gmkb-back-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            goToStep(parseInt(this.dataset.goto));
        });
    });

    function showTemplatesForPersona(persona) {
        // Hide all template groups
        picker.querySelectorAll('.gmkb-template-group').forEach(group => {
            group.style.display = 'none';
        });

        // Show the selected persona's templates
        const targetGroup = picker.querySelector('.gmkb-template-group[data-persona="' + persona + '"]');
        if (targetGroup) {
            targetGroup.style.display = 'block';
        }
    }

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
     * Get human-readable persona description
     */
    private function get_persona_description($persona_type) {
        $descriptions = array(
            'author' => 'Media kits for book authors, writers, and literary professionals',
            'speaker' => 'Professional press kits for keynote speakers and workshop facilitators',
            'podcast-guest' => 'One-sheets optimized for podcast booking and audio interviews',
            'consultant' => 'Credibility kits for business consultants and professional advisors',
            'influencer' => 'Media kits showcasing social stats and brand collaboration info',
            'executive' => 'Executive bios and leadership profiles for C-suite professionals',
            'creative' => 'Portfolio-style kits for artists, designers, and creative professionals'
        );
        return $descriptions[$persona_type] ?? 'Professional media kit templates';
    }

    /**
     * Get human-readable layout variant label
     */
    private function get_layout_label($layout_variant) {
        $labels = array(
            'standard' => 'Classic',
            'split-layout' => 'Split Screen',
            'minimal' => 'Minimal',
            'centered' => 'Centered',
            'bold' => 'Bold',
            'image-left' => 'Image Left',
            'image-right' => 'Image Right'
        );
        return $labels[$layout_variant] ?? ucfirst($layout_variant);
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
