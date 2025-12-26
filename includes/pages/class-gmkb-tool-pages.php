<?php
/**
 * GMKB Tool Pages
 *
 * Creates virtual pages for AI tools without requiring WordPress page creation.
 * Registers rewrite rules for /tools/, /tools/{slug}/, and /tools/{slug}/tool/ URLs.
 *
 * URLs:
 * - /tools/                         → Tools directory page
 * - /tools/biography-generator/     → Individual tool landing page (SEO)
 * - /tools/biography-generator/tool/ → Interactive tool app
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

        // Backward compatibility redirect for ?use=1 to /tool/
        add_action('template_redirect', array($this, 'redirect_legacy_use_param'));

        // Enqueue scripts early for tool pages
        add_action('wp_enqueue_scripts', array($this, 'enqueue_tool_assets'));

        // SEO hooks
        add_action('wp_head', array($this, 'output_seo_tags'), 1);
        add_filter('document_title_parts', array($this, 'filter_title'));
        add_filter('pre_get_document_title', array($this, 'get_document_title'), 10);

        // Body class
        add_filter('body_class', array($this, 'add_body_class'));

        // Navigation type filter for theme integration
        add_filter('guestify_is_app_page', array($this, 'filter_is_app_page'), 10, 1);
        add_filter('gmkb_tool_page_navigation_type', array($this, 'get_navigation_type'), 10, 1);

        // Flush rewrite rules when needed
        add_action('admin_init', array($this, 'maybe_flush_rewrite_rules'));
    }

    /**
     * Check if current page is a tool or directory page
     *
     * @return bool True if on a tool or directory page
     */
    private function is_tool_or_directory_page() {
        return $this->current_tool || get_query_var($this->directory_var);
    }

    /**
     * Filter whether current page should use app navigation
     * For tool pages: show app nav only for logged-in users
     *
     * @param bool $is_app_page Current is_app_page value
     * @return bool Modified value
     */
    public function filter_is_app_page($is_app_page) {
        if ($this->is_tool_or_directory_page()) {
            // Logged-in users get app navigation
            // Public users get frontend navigation
            return is_user_logged_in();
        }

        return $is_app_page;
    }

    /**
     * Get the navigation type for current tool page
     *
     * @param string $default Default navigation type
     * @return string 'app' or 'frontend'
     */
    public function get_navigation_type($default = 'frontend') {
        if ($this->is_tool_or_directory_page()) {
            return is_user_logged_in() ? 'app' : 'frontend';
        }
        return $default;
    }

    /**
     * Redirect legacy ?use=1 URLs to new /tool/ URLs
     */
    public function redirect_legacy_use_param() {
        $tool_slug = get_query_var($this->query_var);
        $use_param = isset($_GET['use']) ? sanitize_text_field(wp_unslash($_GET['use'])) : null;

        // Only redirect if we have a tool slug and ?use=1 (not already on /tool/)
        if (!empty($tool_slug) && '1' === $use_param && !get_query_var('gmkb_tool_app')) {
            $new_url = home_url('/' . $this->get_base_path() . '/' . $tool_slug . '/tool/');
            wp_redirect($new_url, 301);
            exit;
        }
    }

    /**
     * Enqueue tool assets for virtual pages
     * Must be called during wp_enqueue_scripts hook (before content rendering)
     */
    public function enqueue_tool_assets() {
        global $wp_query;

        // Check if this is a tool page
        $tool_slug = get_query_var($this->query_var);
        if (empty($tool_slug)) {
            return;
        }

        // Only enqueue scripts on the tool app page (/tool/ or legacy ?use=1)
        $use_param = isset($_GET['use']) ? sanitize_text_field(wp_unslash($_GET['use'])) : null;
        $is_tool_app = get_query_var('gmkb_tool_app') || ('1' === $use_param);
        if (!$is_tool_app) {
            return;
        }

        // Verify tool exists
        if (!$this->discovery) {
            return;
        }

        $tool = $this->discovery->get_tool($tool_slug);
        if (!$tool) {
            return;
        }

        $version = defined('GMKB_VERSION') ? GMKB_VERSION : '1.0.0';

        // Check for standalone tools bundle first
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

            // Add global data for Vue components
            $is_logged_in = is_user_logged_in();
            $standalone_data = array(
                'nonce' => wp_create_nonce('gmkb_public_ai'),
                'apiBase' => rest_url('gmkb/v2'),
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'isLoggedIn' => $is_logged_in,
                'toolSlug' => $tool_slug,
            );

            // For logged-in users, add profile context
            if ($is_logged_in) {
                $standalone_data['restNonce'] = wp_create_nonce('wp_rest');
                $standalone_data['userId'] = get_current_user_id();
                $standalone_data['profilesEndpoint'] = rest_url('gmkb/v2/profiles');
                $standalone_data['profileEndpoint'] = rest_url('gmkb/v2/profile');
            }

            wp_localize_script('gmkb-standalone-tools', 'gmkbStandaloneTools', $standalone_data);
        }
    }

    /**
     * Register rewrite rules for tools pages
     */
    public function register_rewrite_rules() {
        // Tool app page: /tools/{slug}/tool/
        add_rewrite_rule(
            '^' . $this->base_path . '/([^/]+)/tool/?$',
            'index.php?' . $this->query_var . '=$matches[1]&gmkb_tool_app=1',
            'top'
        );

        // Individual tool landing pages: /tools/{slug}/
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
        $vars[] = 'gmkb_tool_app';
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
     * Render the tool page content
     * Detects /tool/ path or legacy ?use=1 for tool app vs landing page
     */
    public function render_tool_page() {
        if (!$this->current_tool || !$this->current_meta) {
            echo '<div class="gmkb-error">Tool not found.</div>';
            return;
        }

        // Check if this is the tool app view (/tool/ or legacy ?use=1)
        $use_param = isset($_GET['use']) ? sanitize_text_field(wp_unslash($_GET['use'])) : null;
        $is_tool_app = get_query_var('gmkb_tool_app') || ('1' === $use_param);
        if ($is_tool_app) {
            $this->render_tool_app_page();
            return;
        }

        // Otherwise render the SEO landing page
        $this->render_tool_landing_page();
    }

    /**
     * Render the tool app page with 2-column layout
     * Uses the legacy generator design system for consistent styling
     */
    private function render_tool_app_page() {
        $tool = $this->current_tool;
        $meta = $this->current_meta;
        $landing = isset($meta['landingContent']) ? $meta['landingContent'] : array();

        // Get guidance content from meta.json
        $examples = $landing['examples'] ?? array();
        $tips = $landing['tips'] ?? array();

        // Check if user is logged in for profile features
        $is_logged_in = is_user_logged_in();
        ?>
        <div class="gmkb-generator-root generator__container" data-generator="<?php echo esc_attr($tool['id']); ?>">
            <div class="generator__header">
                <h1 class="generator__title"><?php echo esc_html($meta['name']); ?></h1>
            </div>

            <?php if ($is_logged_in): ?>
            <!-- Profile Selection Bar for Logged-in Users -->
            <div class="generator__profile-bar" id="gmkb-profile-bar">
                <div class="generator__profile-selector">
                    <label for="gmkb-profile-select">Saving to Profile:</label>
                    <select id="gmkb-profile-select" class="generator__profile-dropdown">
                        <option value="">Loading profiles...</option>
                    </select>
                </div>
                <div class="generator__save-actions">
                    <span id="gmkb-save-status" class="generator__save-status"></span>
                    <button type="button" id="gmkb-save-btn" class="generator__button--call-to-action" disabled>
                        💾 Save to Profile
                    </button>
                </div>
            </div>
            <?php endif; ?>

            <div class="generator__content">
                <!-- LEFT PANEL: Tool Form -->
                <div class="generator__panel generator__panel--left">
                    <!-- Introduction Text -->
                    <p class="generator__intro">
                        <?php echo esc_html($meta['shortDescription']); ?>
                    </p>

                    <!-- Tool Builder Widget -->
                    <div class="generator__builder" id="<?php echo esc_attr($tool['id']); ?>-builder" data-component="<?php echo esc_attr($tool['id']); ?>">
                        <?php echo do_shortcode('[gmkb_tool tool="' . esc_attr($tool['id']) . '" show_title="false"]'); ?>
                    </div>
                </div>

                <!-- RIGHT PANEL: Guidance -->
                <div class="generator__panel generator__panel--right">
                    <h2 class="generator__guidance-header">How to Create Your <?php echo esc_html($meta['name']); ?></h2>
                    <p class="generator__guidance-subtitle">
                        <?php echo esc_html($meta['shortDescription']); ?>
                    </p>

                    <!-- Formula Box -->
                    <?php if (!empty($landing['formula'])): ?>
                    <div class="generator__formula-box">
                        <span class="generator__formula-label">FORMULA</span>
                        <?php echo wp_kses_post($this->format_formula($landing['formula'])); ?>
                    </div>
                    <?php endif; ?>

                    <!-- How It Works / Process Steps -->
                    <?php if (!empty($landing['howItWorks'])): ?>
                    <?php foreach ($landing['howItWorks'] as $step): ?>
                    <div class="generator__process-step">
                        <div class="generator__process-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </div>
                        <div class="generator__process-content">
                            <h3 class="generator__process-title"><?php echo esc_html($step['title']); ?></h3>
                            <p class="generator__process-description">
                                <?php echo esc_html($step['description']); ?>
                            </p>
                        </div>
                    </div>
                    <?php endforeach; ?>
                    <?php endif; ?>

                    <!-- Examples -->
                    <?php if (!empty($examples)): ?>
                    <h3 class="generator__examples-header">Examples:</h3>
                    <?php foreach ($examples as $example): ?>
                    <div class="generator__example-card">
                        <?php if (is_array($example) && isset($example['content'])): ?>
                        <p><?php echo esc_html($example['content']); ?></p>
                        <?php else: ?>
                        <p><?php echo esc_html(is_string($example) ? $example : ''); ?></p>
                        <?php endif; ?>
                    </div>
                    <?php endforeach; ?>
                    <?php endif; ?>

                    <!-- Tips -->
                    <?php if (!empty($tips)): ?>
                    <div class="generator__process-step">
                        <div class="generator__process-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                        </div>
                        <div class="generator__process-content">
                            <h3 class="generator__process-title">Pro Tips</h3>
                            <ul class="generator__tips-list">
                                <?php foreach ($tips as $tip): ?>
                                <li><?php echo esc_html($tip); ?></li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <?php if ($is_logged_in): ?>
        <!-- Profile Bar Styles -->
        <style>
        .generator__profile-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--mkcg-space-md, 16px);
            margin-bottom: var(--mkcg-space-lg, 24px);
            background: var(--mkcg-bg-secondary, #f9fafb);
            border: 1px solid var(--mkcg-border-light, #e9ecef);
            border-radius: var(--mkcg-radius, 8px);
            flex-wrap: wrap;
            gap: 12px;
        }
        .generator__profile-selector {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .generator__profile-selector label {
            font-weight: 500;
            color: var(--mkcg-text-secondary, #5a6d7e);
            font-size: 14px;
        }
        .generator__profile-dropdown {
            padding: 8px 32px 8px 12px;
            font-size: 14px;
            border: 1px solid var(--mkcg-border-medium, #dce1e5);
            border-radius: var(--mkcg-radius-sm, 4px);
            background: white;
            min-width: 200px;
            cursor: pointer;
        }
        .generator__profile-dropdown:focus {
            outline: none;
            border-color: var(--mkcg-primary, #1a9bdc);
            box-shadow: 0 0 0 3px rgba(26, 155, 220, 0.15);
        }
        .generator__save-actions {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .generator__save-status {
            font-size: 13px;
            color: var(--mkcg-text-secondary, #5a6d7e);
        }
        .generator__save-status.success {
            color: var(--mkcg-success, #34c759);
        }
        .generator__save-status.error {
            color: var(--mkcg-error, #ff3b30);
        }
        .generator__button--call-to-action {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 600;
            color: white;
            background: var(--mkcg-primary, #1a9bdc);
            border: none;
            border-radius: var(--mkcg-radius, 8px);
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .generator__button--call-to-action:hover:not(:disabled) {
            background: var(--mkcg-primary-dark, #0d8ecf);
        }
        .generator__button--call-to-action:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        @media (max-width: 640px) {
            .generator__profile-bar {
                flex-direction: column;
                align-items: stretch;
            }
            .generator__profile-selector,
            .generator__save-actions {
                justify-content: center;
            }
        }
        </style>

        <!-- Profile Management Script -->
        <script>
        (function() {
            var toolId = '<?php echo esc_js($tool['id']); ?>';
            var apiBase = '<?php echo esc_url(rest_url('gmkb/v2')); ?>';
            var nonce = '<?php echo esc_js(wp_create_nonce('wp_rest')); ?>';

            var profileSelect = document.getElementById('gmkb-profile-select');
            var saveBtn = document.getElementById('gmkb-save-btn');
            var saveStatus = document.getElementById('gmkb-save-status');

            var currentData = {};
            var selectedProfileId = null;

            // Load user's profiles
            function loadProfiles() {
                fetch(apiBase + '/profiles', {
                    headers: { 'X-WP-Nonce': nonce }
                })
                .then(function(r) { return r.json(); })
                .then(function(response) {
                    // API returns { success: true, profiles: [...] }
                    var profiles = response.profiles || response || [];
                    profileSelect.innerHTML = '';
                    if (!profiles || profiles.length === 0) {
                        profileSelect.innerHTML = '<option value="">No profiles found</option>';
                        return;
                    }
                    profiles.forEach(function(p) {
                        var opt = document.createElement('option');
                        opt.value = p.id;
                        opt.textContent = p.title || p.name || 'Profile #' + p.id;
                        profileSelect.appendChild(opt);
                    });
                    // Auto-select first profile
                    if (profiles.length > 0) {
                        selectedProfileId = profiles[0].id;
                        profileSelect.value = selectedProfileId;
                        saveBtn.disabled = false;
                        loadProfileData(selectedProfileId);
                    }
                })
                .catch(function(err) {
                    console.error('Failed to load profiles:', err);
                    profileSelect.innerHTML = '<option value="">Error loading profiles</option>';
                });
            }

            // Load existing data from selected profile
            function loadProfileData(profileId) {
                fetch(apiBase + '/profile/' + profileId, {
                    headers: { 'X-WP-Nonce': nonce }
                })
                .then(function(r) { return r.json(); })
                .then(function(profile) {
                    // Pre-populate the tool with existing data if available
                    if (profile && profile.fields) {
                        // Map profile fields back to tool field names
                        var fieldData = mapProfileFieldsToTool(toolId, profile.fields);
                        // Pre-populate the Vue component inputs
                        populateToolFields(fieldData);
                    }
                })
                .catch(function(err) {
                    console.error('Failed to load profile data:', err);
                });
            }

            // Map profile field names back to tool field names
            function mapProfileFieldsToTool(toolId, fields) {
                var reverseMapping = {
                    'authority-hook-builder': {
                        'hook_who': 'who',
                        'hook_what': 'what',
                        'hook_when': 'when',
                        'hook_how': 'how',
                        'hook_where': 'where',
                        'hook_why': 'why'
                    },
                    'elevator-pitch-generator': {
                        'elevator_pitch': 'pitch'
                    },
                    'tagline-generator': {
                        'tagline': 'tagline'
                    },
                    'biography-generator': {
                        'biography': 'biography'
                    }
                };

                var mapping = reverseMapping[toolId] || {};
                var result = {};

                for (var profileField in fields) {
                    if (mapping[profileField]) {
                        result[mapping[profileField]] = fields[profileField];
                    }
                }

                return result;
            }

            // Populate Vue component input fields
            function populateToolFields(fieldData) {
                // Wait for Vue component to be fully rendered
                var attempts = 0;
                var maxAttempts = 10;

                function tryPopulate() {
                    attempts++;
                    var container = document.getElementById(toolId + '-builder');
                    if (!container) {
                        if (attempts < maxAttempts) {
                            setTimeout(tryPopulate, 200);
                        }
                        return;
                    }

                    // Field order in the Vue component (matches AUTHORITY_HOOK_FIELDS array order)
                    var fieldOrder = ['who', 'what', 'when', 'how', 'where', 'why'];

                    // Find all input fields within hook field containers (more specific selector)
                    var inputs = container.querySelectorAll('.gmkb-ai-hook-fields .gmkb-ai-hook-field input.gmkb-ai-input');

                    // If we don't have all 6 inputs yet, Vue may not be ready
                    if (inputs.length < 6 && attempts < maxAttempts) {
                        setTimeout(tryPopulate, 200);
                        return;
                    }

                    inputs.forEach(function(input, index) {
                        var fieldKey = fieldOrder[index];
                        if (fieldKey && fieldData[fieldKey]) {
                            input.value = fieldData[fieldKey];
                            // Trigger input event to update Vue's reactivity
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    });

                    // Also store in currentData for save
                    currentData = { hook: fieldData };
                }

                // Start attempting to populate after initial delay
                setTimeout(tryPopulate, 300);
            }

            // Handle profile change
            profileSelect.addEventListener('change', function() {
                selectedProfileId = this.value;
                saveBtn.disabled = !selectedProfileId;
                if (selectedProfileId) {
                    loadProfileData(selectedProfileId);
                }
            });

            // Listen for tool data changes
            document.addEventListener('gmkb:applied', function(e) {
                currentData = e.detail || {};
                showStatus('Changes detected', '');
            });

            document.addEventListener('gmkb:generated', function(e) {
                currentData = e.detail || {};
                showStatus('Content generated', '');
            });

            // Save to profile
            saveBtn.addEventListener('click', function() {
                if (!selectedProfileId || !currentData) return;

                saveBtn.disabled = true;
                showStatus('Saving...', '');

                // Map tool data to profile fields based on tool type
                var fieldsToSave = mapToolDataToFields(toolId, currentData);

                fetch(apiBase + '/profile/' + selectedProfileId + '/fields', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': nonce
                    },
                    body: JSON.stringify({ fields: fieldsToSave })
                })
                .then(function(r) {
                    if (!r.ok) throw new Error('Save failed');
                    return r.json();
                })
                .then(function() {
                    showStatus('✓ Saved successfully!', 'success');
                    saveBtn.disabled = false;
                })
                .catch(function(err) {
                    console.error('Save error:', err);
                    showStatus('✗ Save failed', 'error');
                    saveBtn.disabled = false;
                });
            });

            function showStatus(msg, type) {
                saveStatus.textContent = msg;
                saveStatus.className = 'generator__save-status' + (type ? ' ' + type : '');
                if (type === 'success') {
                    setTimeout(function() { saveStatus.textContent = ''; }, 3000);
                }
            }

            // Map tool-specific data to profile field names
            function mapToolDataToFields(toolId, data) {
                var fields = {};
                var toolMappings = {
                    'authority-hook-builder': {
                        'who': 'hook_who',
                        'what': 'hook_what',
                        'when': 'hook_when',
                        'how': 'hook_how',
                        'where': 'hook_where',
                        'why': 'hook_why',
                        'polished': 'authority_hook_complete'
                    },
                    'elevator-pitch-generator': {
                        'pitch': 'elevator_pitch'
                    },
                    'tagline-generator': {
                        'tagline': 'tagline'
                    },
                    'biography-generator': {
                        'biography': 'biography'
                    }
                };

                var mapping = toolMappings[toolId] || {};

                // Handle nested data structures
                var hookData = data.hook || data.original || data;
                for (var key in hookData) {
                    if (mapping[key]) {
                        fields[mapping[key]] = hookData[key];
                    }
                }

                // Handle polished/generated content
                if (data.polished && mapping['polished']) {
                    fields[mapping['polished']] = data.polished;
                }

                return fields;
            }

            // Initialize
            loadProfiles();
        })();
        </script>
        <?php endif; ?><?php
    }

    /**
     * Format formula text with highlights for placeholders like [WHO], [WHAT], etc.
     *
     * @param string $formula The formula text
     * @return string HTML formatted formula
     */
    private function format_formula($formula) {
        // Replace [PLACEHOLDER] patterns with highlighted spans
        return preg_replace(
            '/\[([A-Z]+)\]/',
            '<span class="generator__highlight">[$1]</span>',
            esc_html($formula)
        );
    }

    /**
     * Render the SEO landing page content
     */
    private function render_tool_landing_page() {
        $tool = $this->current_tool;
        $meta = $this->current_meta;
        $landing = isset($meta['landingContent']) ? $meta['landingContent'] : array();

        // CTA URL - links to the tool app page
        $cta_url = home_url('/' . $this->get_base_path() . '/' . $tool['id'] . '/tool/');
        $cta_text = $landing['ctaText'] ?? 'Try ' . esc_html($meta['name']) . ' Free';

        ?>
        <div class="gmkb-tool-landing">
            <!-- Hero Section -->
            <section class="gmkb-tool-hero">
                <div class="gmkb-container">
                    <span class="gmkb-tool-hero__category"><?php echo esc_html($this->get_category_label($meta['category'] ?? '')); ?></span>
                    <h1 class="gmkb-tool-hero__title">
                        <?php echo esc_html($landing['heroTagline'] ?? $meta['name']); ?>
                    </h1>
                    <?php if (!empty($landing['heroSubtitle'])): ?>
                        <p class="gmkb-tool-hero__subtitle">
                            <?php echo esc_html($landing['heroSubtitle']); ?>
                        </p>
                    <?php elseif (!empty($meta['shortDescription'])): ?>
                        <p class="gmkb-tool-hero__subtitle">
                            <?php echo esc_html($meta['shortDescription']); ?>
                        </p>
                    <?php endif; ?>
                    <div class="gmkb-tool-hero__cta">
                        <a href="<?php echo esc_url($cta_url); ?>" class="gmkb-btn gmkb-btn--primary gmkb-btn--large">
                            <?php echo esc_html($cta_text); ?>
                        </a>
                    </div>
                </div>
            </section>

            <!-- Key Benefits -->
            <?php if (!empty($meta['keyBenefits'])): ?>
            <section class="gmkb-tool-benefits">
                <div class="gmkb-container">
                    <div class="gmkb-benefits-grid">
                        <?php foreach ($meta['keyBenefits'] as $benefit): ?>
                            <div class="gmkb-benefit">
                                <svg class="gmkb-benefit__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                <span><?php echo esc_html($benefit); ?></span>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </section>
            <?php endif; ?>

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

            <!-- Target Audience -->
            <?php if (!empty($meta['targetAudience'])): ?>
            <section class="gmkb-tool-audience">
                <div class="gmkb-container">
                    <h2>Who Is This For?</h2>
                    <ul class="gmkb-audience-list">
                        <?php foreach ($meta['targetAudience'] as $audience): ?>
                            <li><?php echo esc_html($audience); ?></li>
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

            <!-- Bottom CTA -->
            <section class="gmkb-tool-bottom-cta">
                <div class="gmkb-container">
                    <h2>Ready to Get Started?</h2>
                    <p>Create your <?php echo esc_html(strtolower($meta['name'])); ?> in seconds with our free AI-powered tool.</p>
                    <a href="<?php echo esc_url($cta_url); ?>" class="gmkb-btn gmkb-btn--primary gmkb-btn--large">
                        <?php echo esc_html($cta_text); ?>
                    </a>
                </div>
            </section>

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
                            <a href="<?php echo esc_url(home_url('/' . $this->get_base_path() . '/' . $related_slug . '/')); ?>"
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
            /* Hero Section */
            .gmkb-tool-hero {
                text-align: center;
                padding: 4rem 0 3rem;
            }
            .gmkb-tool-hero__category {
                display: inline-block;
                padding: 0.25rem 0.75rem;
                background: #eff6ff;
                color: #3b82f6;
                border-radius: 9999px;
                font-size: 0.875rem;
                font-weight: 500;
                margin-bottom: 1rem;
            }
            .gmkb-tool-hero__title {
                font-size: 2.75rem;
                font-weight: 800;
                margin: 0 0 1rem;
                color: #111827;
                line-height: 1.2;
            }
            .gmkb-tool-hero__subtitle {
                font-size: 1.25rem;
                color: #6b7280;
                margin: 0 0 2rem;
                max-width: 600px;
                margin-left: auto;
                margin-right: auto;
            }
            .gmkb-tool-hero__cta {
                margin-top: 2rem;
            }
            /* CTA Button */
            .gmkb-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                border-radius: 8px;
                transition: all 0.2s;
                text-decoration: none;
                cursor: pointer;
            }
            .gmkb-btn--primary {
                background: #3b82f6;
                color: white;
            }
            .gmkb-btn--primary:hover {
                background: #2563eb;
                color: white;
            }
            .gmkb-btn--large {
                padding: 1rem 2rem;
                font-size: 1.125rem;
            }
            /* Key Benefits */
            .gmkb-tool-benefits {
                padding: 2rem 0;
                background: #f9fafb;
                border-radius: 12px;
                margin-bottom: 2rem;
            }
            .gmkb-benefits-grid {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 1.5rem 2.5rem;
            }
            .gmkb-benefit {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: #374151;
            }
            .gmkb-benefit__icon {
                width: 20px;
                height: 20px;
                color: #10b981;
                flex-shrink: 0;
            }
            /* Section Styling */
            .gmkb-tool-how-it-works,
            .gmkb-tool-features,
            .gmkb-tool-use-cases,
            .gmkb-tool-audience,
            .gmkb-tool-faq,
            .gmkb-tool-related {
                padding: 3rem 0;
                border-top: 1px solid #e5e7eb;
            }
            .gmkb-tool-how-it-works h2,
            .gmkb-tool-features h2,
            .gmkb-tool-use-cases h2,
            .gmkb-tool-audience h2,
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
            /* Audience List */
            .gmkb-audience-list {
                list-style: none;
                padding: 0;
                margin: 0;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 0.75rem;
            }
            .gmkb-audience-list li {
                padding: 0.75rem 1rem;
                background: #f9fafb;
                border-radius: 6px;
                position: relative;
                padding-left: 2.5rem;
            }
            .gmkb-audience-list li::before {
                content: "→";
                position: absolute;
                left: 1rem;
                color: #3b82f6;
            }
            /* Bottom CTA */
            .gmkb-tool-bottom-cta {
                padding: 4rem 0;
                text-align: center;
                background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
                border-radius: 16px;
                margin-top: 2rem;
            }
            .gmkb-tool-bottom-cta h2 {
                font-size: 2rem;
                margin: 0 0 0.75rem;
                color: #111827;
            }
            .gmkb-tool-bottom-cta p {
                color: #6b7280;
                margin: 0 0 1.5rem;
                font-size: 1.125rem;
            }
            /* Responsive */
            @media (max-width: 768px) {
                .gmkb-tool-hero__title {
                    font-size: 2rem;
                }
                .gmkb-tool-hero__subtitle {
                    font-size: 1rem;
                }
                .gmkb-benefits-grid {
                    flex-direction: column;
                    align-items: center;
                }
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
                                <a href="<?php echo esc_url(home_url('/' . $this->get_base_path() . '/' . $tool['id'] . '/')); ?>"
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
        $canonical = home_url('/' . $this->get_base_path() . '/' . $tool['id'] . '/');

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
        $canonical = home_url('/' . $this->get_base_path() . '/');

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
                        'url' => home_url('/' . $this->get_base_path() . '/' . $tool['id'] . '/'),
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
     * Add login status classes to body
     *
     * @param array $classes Body classes array (passed by reference)
     */
    private function add_login_status_classes(&$classes) {
        if (is_user_logged_in()) {
            $classes[] = 'gmkb-user-logged-in';
            $classes[] = 'gmkb-show-app-nav';
        } else {
            $classes[] = 'gmkb-user-logged-out';
            $classes[] = 'gmkb-show-frontend-nav';
        }
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

            $this->add_login_status_classes($classes);

            // Check if this is the tool app view
            $use_param = isset($_GET['use']) ? sanitize_text_field(wp_unslash($_GET['use'])) : null;
            $is_tool_app = get_query_var('gmkb_tool_app') || ('1' === $use_param);
            if ($is_tool_app) {
                $classes[] = 'gmkb-tool-app-view';
            } else {
                $classes[] = 'gmkb-tool-landing-view';
            }
        } elseif (get_query_var($this->directory_var)) {
            $classes[] = 'gmkb-tools-directory-page';

            $this->add_login_status_classes($classes);
        }
        return $classes;
    }

    /**
     * Get human-readable category label
     *
     * @param string $category Category slug
     * @return string Category label
     */
    private function get_category_label($category) {
        $labels = array(
            'seo-tools' => 'SEO Tools',
            'profile-content' => 'Profile Content',
            'value-builder' => 'Value Builder',
            'media-kit' => 'Media Kit',
            'messaging' => 'Messaging',
            'outreach' => 'Outreach',
            'social-media' => 'Social Media',
            'content-creation' => 'Content Creation',
        );
        return $labels[$category] ?? ucwords(str_replace('-', ' ', $category));
    }

    /**
     * Maybe flush rewrite rules (once after plugin update)
     */
    public function maybe_flush_rewrite_rules() {
        $version_key = 'gmkb_tool_pages_version';
        $current_version = '1.0.3'; // Cleaned up to use only /tools/ path

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
        update_option('gmkb_tool_pages_version', '1.0.3');
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
