<?php
/**
 * Plugin Name: Guestify Media Kit Builder
 * Description: Drag-and-drop media kit builder with customizable components
 * Version: 2.1.0-option-a-pure-vue
 * Author: Guestify Team
 * Text Domain: guestify-media-kit-builder
 * Domain Path: /languages
 * License: GPL v2 or later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// DEFINE CONSTANTS AT THE TOP LEVEL
define( 'GUESTIFY_VERSION', '2.1.0-option-a-pure-vue' );
define( 'GUESTIFY_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'GUESTIFY_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'GMKB_VERSION', '2.1.0-option-a-pure-vue' );
define( 'GMKB_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'GMKB_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'GMKB_WORDPRESS_COMPATIBLE', true );
define( 'GMKB_ARCHITECTURE', 'vue' ); // 100% Vue architecture
define( 'GMKB_USE_PURE_VUE', true ); // PHASE 3: Enable Pure Vue template
define( 'GMKB_DEV_MODE', defined( 'WP_DEBUG' ) && WP_DEBUG );

// Include Vue-only enqueue system
require_once GUESTIFY_PLUGIN_DIR . 'includes/enqueue.php';

// ADMIN FILES: Only load essential admin tools
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/Base_Component_Data_Service.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/Base_Component_Data_Service.php';
}

// PHASE 1 FIX: Include Pods data enrichment system
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/component-pods-enrichment.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/component-pods-enrichment.php';
}

// ROOT FIX: Include component data sanitization (prevent database bloat)
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/component-data-sanitization.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/component-data-sanitization.php';
}

// ROOT FIX: Include bi-directional field sync system
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/component-field-sync.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/component-field-sync.php';
}

// PHASE 4: Theme Generator for dynamic CSS generation
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/class-theme-generator.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/class-theme-generator.php';
}
// PHASE 3: AJAX handlers removed - all theme operations via REST API v2

// PHASE 5: Component Marketplace Ready
if (is_admin()) {
    if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/marketplace/ComponentPackageManager.php')) {
        require_once GUESTIFY_PLUGIN_DIR . 'includes/marketplace/ComponentPackageManager.php';
    }
    if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/marketplace/ComponentPackageValidator.php')) {
        require_once GUESTIFY_PLUGIN_DIR . 'includes/marketplace/ComponentPackageValidator.php';
    }
}

// PHASE 6: Import/Export System
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/export/ExportManager.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/export/ExportManager.php';
}
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/import/ImportManager.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/import/ImportManager.php';
}

// PHASE 3: AJAX handlers removed - all operations via REST API v2
// Data loaded via: GET /wp-json/gmkb/v2/mediakit/{id}
// Data saved via: POST /wp-json/gmkb/v2/mediakit/{id}

// ROOT FIX: Admin diagnostic tool for fixing component save issues
if (file_exists(GUESTIFY_PLUGIN_DIR . 'admin/diagnostic-tools.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'admin/diagnostic-tools.php';
}

// PHASE 7: Version Control System
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/version-control/VersionManager.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/version-control/VersionManager.php';
}

// PHASE 2 IMPLEMENTATION: Pure Vue REST API v2 - Unified Endpoint
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/api/v2/class-gmkb-rest-api-v2.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/api/v2/class-gmkb-rest-api-v2.php';
    
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('✅ GMKB Phase 2: REST API v2 file loaded');
        error_log('✅ GMKB Phase 2: GMKB_REST_API_V2 class exists: ' . (class_exists('GMKB_REST_API_V2') ? 'YES' : 'NO'));
    }
}

// PHASE 3: Component Discovery API for scalable component architecture
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/api/ComponentDiscoveryAPI.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/api/ComponentDiscoveryAPI.php';
    add_action('init', function() {
        if (class_exists('\GMKB\ComponentDiscoveryAPI')) {
            new \GMKB\ComponentDiscoveryAPI();
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('✅ GMKB Phase 3: ComponentDiscoveryAPI instantiated');
            }
        }
    }, 5);
}

// Component system files
// LEGACY CLEANUP: ComponentLoader and DesignPanel archived (Pure Vue migration)
// Only ComponentDiscovery needed for metadata
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/ComponentDiscovery.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/ComponentDiscovery.php';
}
// ARCHIVED: ComponentLoader.php -> ARCHIVE/legacy-rendering/ (PHP rendering removed)
// ARCHIVED: DesignPanel.php -> ARCHIVE/legacy-rendering/ (PHP panels removed)

// PHASE 3: enhanced-ajax.php removed (was already deprecated)

// ROOT FIX: Include frontend template router for conditional media kit display
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/frontend-template-router.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/frontend-template-router.php';
}

// PHASE 8: Enhanced Frontend Display with Theme Support
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/class-gmkb-frontend-display.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/class-gmkb-frontend-display.php';
}

// ADMIN TOOLS: Load essential admin functionality only
if (is_admin()) {
    $viewer_file = GUESTIFY_PLUGIN_DIR . 'admin/media-kit-viewer.php';
    if (file_exists($viewer_file)) {
        require_once $viewer_file;
    }
    
    $diagnostic_file = GUESTIFY_PLUGIN_DIR . 'admin/diagnostic-tools.php';
    if (file_exists($diagnostic_file)) {
        require_once $diagnostic_file;
    }
}

/**
 * Main plugin class - OPTION A: PURE VUE (PHP RENDERING REMOVED)
 */
class Guestify_Media_Kit_Builder {

    private static $instance;
    private static $initialized = false;
    private $component_discovery;
    // LEGACY CLEANUP: Removed $component_loader and $design_panel (archived to ARCHIVE/legacy-rendering/)

    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        if (self::$initialized) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB: Preventing double initialization - already initialized');
            }
            return;
        }
        self::$initialized = true;
        
        // Initialize component system
        $this->component_discovery = new ComponentDiscovery(GUESTIFY_PLUGIN_DIR . 'components');
        
        global $gmkb_component_discovery;
        $gmkb_component_discovery = $this->component_discovery;
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB: ComponentDiscovery initialized');
        }
        
        try {
            $scan_result = $this->component_discovery->scan(false);
            $components_found = $this->component_discovery->getComponents();
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('📊 GMKB: Found ' . count($components_found) . ' components');
            }
        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ GMKB: Component scan failed: ' . $e->getMessage());
            }
        }
        
        // LEGACY CLEANUP: ComponentLoader and DesignPanel no longer instantiated
        // All rendering handled by Vue.js components
        // Archived: ARCHIVE/legacy-rendering/ComponentLoader.php
        // Archived: ARCHIVE/legacy-rendering/DesignPanel.php
        
        $this->init_hooks();
        
        if (is_admin()) {
            add_action('admin_menu', array($this, 'add_admin_menu'));
        }
        
        add_action('init', array($this, 'ensure_topics_ajax_handlers_registered'), 5);
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB: Pure Vue initialization complete');
        }
    }

    private function init_hooks() {
        add_action( 'init', array( $this, 'load_textdomain' ) );
        add_action( 'wp', array( $this, 'early_builder_check' ), 1 );
        add_action( 'template_redirect', array( $this, 'isolated_builder_template_takeover' ) );
        add_shortcode( 'guestify_media_kit', array( $this, 'media_kit_shortcode' ) );
        add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
        
        // OPTION A: Component metadata ONLY (no rendering)
        add_action( 'wp_ajax_guestify_get_components', array( $this, 'ajax_get_components' ) );
        add_action( 'wp_ajax_nopriv_guestify_get_components', array( $this, 'ajax_get_components' ) );
        
        // OPTION A: PHP RENDERING COMPLETELY REMOVED
        // All component rendering now handled by Vue.js client-side
        // Data loaded via REST API v2: GET /gmkb/v2/mediakit/{id}
        // See ARCHIVE/option-a-php-rendering-removal/ for removed code
        
        // Component cache management
        add_action( 'wp_ajax_gmkb_clear_component_cache', array( $this, 'ajax_clear_component_cache' ) );
        add_action( 'wp_ajax_gmkb_refresh_components', array( $this, 'ajax_refresh_components' ) );
    }

    public function early_builder_check() {
        $is_builder_page = false;
        
        if (is_page('media-kit') || is_page('guestify-media-kit')) {
            $is_builder_page = true;
        }
        elseif (isset($_SERVER['REQUEST_URI'])) {
            $uri = $_SERVER['REQUEST_URI'];
            if (preg_match('#/tools/media-kit/?($|\?)#', $uri)) {
                $is_builder_page = true;
            }
        }
        elseif (is_admin() && isset($_GET['page']) && $_GET['page'] === 'guestify-media-kit-builder') {
            $is_builder_page = true;
        }
        
        if ($is_builder_page) {
            global $gmkb_template_active;
            $gmkb_template_active = true;
        }
    }
    
    public function isolated_builder_template_takeover() {
        $use_pure_vue = defined('GMKB_USE_PURE_VUE') && GMKB_USE_PURE_VUE;
        $use_pure_vue = $use_pure_vue || (isset($_GET['vue_mode']) && $_GET['vue_mode'] === 'pure');
        
        if ($use_pure_vue) {
            return;
        }
        
        $is_builder_page = false;
        
        if (is_page('media-kit') || is_page('guestify-media-kit')) {
            $is_builder_page = true;
        }
        elseif (isset($_SERVER['REQUEST_URI'])) {
            $uri = $_SERVER['REQUEST_URI'];
            if (preg_match('#/tools/media-kit/?($|\?)#', $uri)) {
                $is_builder_page = true;
            }
        }
        
        if (!$is_builder_page) {
            return;
        }
        
        global $gmkb_template_active;
        $gmkb_template_active = true;
        
        $post_id = $this->detect_mkcg_post_id();
        
        $saved_state = array();
        if ( $post_id > 0 ) {
            $saved_state = get_post_meta( $post_id, 'gmkb_media_kit_state', true );
            if ( empty( $saved_state ) ) {
                $saved_state = array(
                    'components' => array(),
                    'layout' => array(),
                    'globalSettings' => array()
                );
            }
        }
        
        ?>
        <!DOCTYPE html>
        <html <?php language_attributes(); ?> class="gmkb-isolated">
        <head>
            <meta charset="<?php bloginfo( 'charset' ); ?>" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="robots" content="noindex, nofollow" />
            <title>Media Kit Builder - <?php bloginfo('name'); ?></title>
            
            <style id="gmkb-isolation-styles">
                body, html { 
                    margin: 0; 
                    padding: 0; 
                    overflow: hidden; 
                    height: 100vh; 
                    width: 100vw; 
                    background: #1a1a1a;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                
                .gmkb-ready::before {
                    content: 'PURE VUE ✓';
                    position: fixed;
                    top: 5px;
                    left: 5px;
                    background: #10b981;
                    color: white;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-size: 10px;
                    z-index: 10002;
                    font-weight: bold;
                }
                
                #wpadminbar { display: none !important; }
                html { margin-top: 0 !important; }
            </style>
            
            <?php wp_head(); ?>
            
            <link rel="stylesheet" href="<?php echo GUESTIFY_PLUGIN_URL . 'css/guestify-builder.css?v=' . time(); ?>" type="text/css" media="all" />
        </head>
        <body class="media-kit-builder-isolated gmkb-isolated-builder gmkb-pure-vue" data-post-id="<?php echo esc_attr($post_id); ?>" data-template-version="option-a-pure-vue">
            
            <div id="gmkb-template-error-boundary" style="display: none;">
                <div style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: #fee;
                    border: 2px solid #f88;
                    padding: 30px;
                    border-radius: 8px;
                    text-align: center;
                    color: #d44;
                    max-width: 500px;
                    z-index: 10004;
                ">
                    <h2>⚠️ Template Error</h2>
                    <p>The builder template encountered an error.</p>
                    <button onclick="location.reload()" style="
                        background: #d44;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 4px;
                        cursor: pointer;
                        margin-top: 10px;
                    ">Reload Builder</button>
                </div>
            </div>
            
            <?php
            try {
                echo do_shortcode('[guestify_media_kit]');
            } catch (Exception $e) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('GMKB Template Error: ' . $e->getMessage());
                }
                echo '<script>document.getElementById("gmkb-template-error-boundary").style.display = "block";</script>';
            }
            
            wp_footer();
            ?>
        </body>
        </html>
        <?php
        exit();
    }

    public function media_kit_shortcode( $atts ) {
        ob_start();
        
        $use_simple_template = defined('GMKB_USE_LEAN_BUNDLE') && GMKB_USE_LEAN_BUNDLE;
        
        if ($use_simple_template) {
            $template = GUESTIFY_PLUGIN_DIR . 'templates/builder-template-simple.php';
        } else {
            $template = GUESTIFY_PLUGIN_DIR . 'templates/builder-template.php';
        }
        
        if (file_exists($template)) {
            include $template;
        } else {
            echo '<div style="padding: 20px; text-align: center; background: #fee; border: 2px solid #f88; border-radius: 8px; margin: 20px;">
                <h2>⚠️ Template Not Found</h2>
                <p>Builder template file not found: ' . esc_html($template) . '</p>
            </div>';
        }
        
        return ob_get_clean();
    }

    public function load_textdomain() {
        load_plugin_textdomain( 'guestify-media-kit-builder', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
    }
    
    public function register_rest_routes() {
        register_rest_route( 'guestify/v1', '/components', array(
            'methods' => 'GET',
            'callback' => array( $this, 'rest_get_components' ),
            'permission_callback' => '__return_true'
        ) );
    }
    
    public function rest_get_components() {
        $components = $this->component_discovery->getComponents();
        $categories = $this->component_discovery->getCategories();
        
        return array(
            'success' => true,
            'components' => $components,
            'categories' => $categories,
            'total' => count($components),
            'timestamp' => time()
        );
    }
    
    /**
     * OPTION A: Get component metadata ONLY (no rendering)
     */
    public function ajax_get_components() {
        $nonce_provided = isset($_POST['nonce']) ? $_POST['nonce'] : (isset($_GET['nonce']) ? $_GET['nonce'] : '');
        
        if ($nonce_provided && !wp_verify_nonce($nonce_provided, 'gmkb_nonce')) {
            wp_send_json_error('Security verification failed');
            return;
        }
        
        if (!$nonce_provided && (!defined('WP_DEBUG') || !WP_DEBUG)) {
            wp_send_json_error('Nonce required');
            return;
        }
        
        try {
            if (!$this->component_discovery) {
                throw new Exception('Component discovery not initialized');
            }
            
            $this->component_discovery->scan(true);
            
            $components = $this->component_discovery->getComponents();
            $categories = $this->component_discovery->getCategories();
            
            $components_array = array();
            foreach ($components as $key => $component) {
                $component['type'] = $component['type'] ?? $key;
                $component['name'] = $component['name'] ?? ucfirst($key);
                $component['title'] = $component['title'] ?? $component['name'];
                $component['description'] = $component['description'] ?? 'No description available';
                $component['category'] = $component['category'] ?? 'general';
                $component['premium'] = $component['isPremium'] ?? false;
                $component['icon'] = $component['icon'] ?? 'fa-puzzle-piece';
                
                $components_array[] = $component;
            }
            
            $categories_array = array();
            foreach ($categories as $cat_name => $cat_components) {
                $categories_array[] = array(
                    'slug' => $cat_name,
                    'name' => ucfirst($cat_name),
                    'description' => ucfirst($cat_name) . ' components'
                );
            }
            
            if (empty($components_array)) {
                $components_array = array(
                    array(
                        'type' => 'hero',
                        'name' => 'Hero Section',
                        'title' => 'Hero Section',
                        'description' => 'Main header section with title and bio',
                        'category' => 'essential',
                        'premium' => false,
                        'icon' => 'fa-star'
                    ),
                    array(
                        'type' => 'biography',
                        'name' => 'Biography',
                        'title' => 'Biography',
                        'description' => 'Professional biography section',
                        'category' => 'essential',
                        'premium' => false,
                        'icon' => 'fa-user'
                    ),
                    array(
                        'type' => 'topics',
                        'name' => 'Topics',
                        'title' => 'Speaking Topics',
                        'description' => 'Areas of expertise and speaking topics',
                        'category' => 'essential',
                        'premium' => false,
                        'icon' => 'fa-lightbulb'
                    )
                );
            }
            
            $result = array(
                'components' => $components_array,
                'categories' => $categories_array,
                'total' => count($components_array),
                'timestamp' => time(),
                'source' => 'php_discovery',
                'pure_vue' => true
            );
            
            wp_send_json_success($result);
            
        } catch (Exception $e) {
            $fallback_result = array(
                'components' => array(
                    array(
                        'type' => 'hero',
                        'name' => 'Hero Section',
                        'title' => 'Hero Section',
                        'description' => 'Main header section',
                        'category' => 'essential',
                        'premium' => false,
                        'icon' => 'fa-star'
                    )
                ),
                'categories' => array(
                    array(
                        'slug' => 'essential',
                        'name' => 'Essential',
                        'description' => 'Essential components'
                    )
                ),
                'total' => 1,
                'timestamp' => time(),
                'source' => 'fallback',
                'error' => $e->getMessage()
            );
            
            wp_send_json_success($fallback_result);
        }
    }
    
    public function ajax_clear_component_cache() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }
        
        if (isset($_POST['nonce']) && !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
            wp_send_json_error('Security verification failed');
            return;
        }
        
        try {
            $this->component_discovery->clearCache();
            
            wp_send_json_success(array(
                'message' => 'Component cache cleared successfully',
                'timestamp' => time()
            ));
        } catch (Exception $e) {
            wp_send_json_error('Failed to clear cache: ' . $e->getMessage());
        }
    }
    
    public function ajax_refresh_components() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }
        
        if (isset($_POST['nonce']) && !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
            wp_send_json_error('Security verification failed');
            return;
        }
        
        try {
            $categories = $this->component_discovery->forceRefresh();
            $components = $this->component_discovery->getComponents();
            
            wp_send_json_success(array(
                'message' => 'Components refreshed successfully',
                'components' => $components,
                'categories' => $categories,
                'total' => count($components),
                'timestamp' => time()
            ));
        } catch (Exception $e) {
            wp_send_json_error('Failed to refresh components: ' . $e->getMessage());
        }
    }
    
    public function add_admin_menu() {
        add_options_page(
            'GMKB Component Cache',
            'GMKB Cache',
            'manage_options',
            'gmkb-cache',
            array($this, 'admin_cache_page')
        );
    }
    
    public function admin_cache_page() {
        if (isset($_POST['clear_cache'])) {
            $this->component_discovery->clearCache();
            echo '<div class="notice notice-success"><p>Component cache cleared successfully!</p></div>';
        }
        
        if (isset($_POST['refresh_components'])) {
            $this->component_discovery->forceRefresh();
            echo '<div class="notice notice-success"><p>Components refreshed successfully!</p></div>';
        }
        
        $debug_info = $this->component_discovery->getDebugInfo();
        $cache_status = $debug_info['cache_status'];
        
        ?>
        <div class="wrap">
            <h1>GMKB Component Cache Management</h1>
            
            <div class="card">
                <h2>Cache Status</h2>
                <table class="form-table">
                    <tr>
                        <th>Cache Exists:</th>
                        <td><?php echo $cache_status['cache_exists'] ? '✅ Yes' : '❌ No'; ?></td>
                    </tr>
                    <?php if ($cache_status['cache_exists']): ?>
                    <tr>
                        <th>Cache Age:</th>
                        <td><?php echo human_time_diff(time() - $cache_status['cache_age']) . ' ago'; ?></td>
                    </tr>
                    <tr>
                        <th>Cache Size:</th>
                        <td><?php echo size_format($cache_status['cache_size']); ?></td>
                    </tr>
                    <?php endif; ?>
                    <tr>
                        <th>Components Found:</th>
                        <td><?php echo $debug_info['components_count']; ?></td>
                    </tr>
                    <tr>
                        <th>Categories:</th>
                        <td><?php echo implode(', ', $debug_info['category_names']); ?></td>
                    </tr>
                </table>
            </div>
            
            <div class="card">
                <h2>Cache Management</h2>
                <form method="post">
                    <?php wp_nonce_field('gmkb_cache_action'); ?>
                    <p>
                        <input type="submit" name="clear_cache" class="button button-secondary" value="Clear Cache" />
                        <span class="description">Clear the component cache. Next page load will scan the filesystem.</span>
                    </p>
                    <p>
                        <input type="submit" name="refresh_components" class="button button-primary" value="Refresh Components" />
                        <span class="description">Force a fresh scan and update the cache immediately.</span>
                    </p>
                </form>
            </div>
            
            <div class="card">
                <h2>Performance Information</h2>
                <p><strong>Why caching matters:</strong> Without caching, the system scans the filesystem every time the builder loads. 
                   With <?php echo $debug_info['components_count']; ?> components, this improves performance significantly.</p>
                <p><strong>When to refresh:</strong> Use "Refresh Components" after adding, removing, or modifying component files.</p>
                <p><strong>Cache duration:</strong> Cache expires automatically after 1 hour, or after 24 hours maximum.</p>
            </div>
        </div>
        <?php
    }

    public function ensure_topics_ajax_handlers_registered() {
        if (class_exists('GMKB_Topics_Ajax_Handler')) {
            $topics_handler = GMKB_Topics_Ajax_Handler::get_instance();
            
            $registered_actions = array(
                'wp_ajax_save_custom_topics',
                'wp_ajax_nopriv_save_custom_topics', 
                'wp_ajax_load_stored_topics',
                'wp_ajax_nopriv_load_stored_topics'
            );
            
            foreach ($registered_actions as $action) {
                if (!has_action($action)) {
                    if (strpos($action, 'save') !== false) {
                        add_action($action, array($topics_handler, 'ajax_save_topics'));
                    } else {
                        add_action($action, array($topics_handler, 'ajax_load_topics'));
                    }
                }
            }
        }
    }
    
    public function get_component_discovery() {
        return $this->component_discovery;
    }
    
    // LEGACY CLEANUP: get_component_loader() removed (ComponentLoader archived)
    
    private function detect_mkcg_post_id() {
        $post_id = 0;
        
        if (isset($_GET['post_id']) && is_numeric($_GET['post_id'])) {
            $post_id = intval($_GET['post_id']);
        }
        elseif (isset($_GET['p']) && is_numeric($_GET['p'])) {
            $post_id = intval($_GET['p']);
        }
        elseif (isset($_GET['page_id']) && is_numeric($_GET['page_id'])) {
            $post_id = intval($_GET['page_id']);
        }
        elseif (isset($_GET['mkcg_id']) && is_numeric($_GET['mkcg_id'])) {
            $post_id = intval($_GET['mkcg_id']);
        }
        elseif (isset($_GET['media_kit_id']) && is_numeric($_GET['media_kit_id'])) {
            $post_id = intval($_GET['media_kit_id']);
        }
        elseif (function_exists('get_the_ID') && get_the_ID()) {
            $post_id = get_the_ID();
        }
        elseif (isset($GLOBALS['post']) && is_object($GLOBALS['post']) && isset($GLOBALS['post']->ID)) {
            $post_id = intval($GLOBALS['post']->ID);
        }
        
        if ($post_id > 0) {
            $post = get_post($post_id);
            if (!$post || $post->post_status === 'trash') {
                return 0;
            }
        }
        
        return $post_id;
    }
}

if (!function_exists('is_media_kit_builder_page')) {
    function is_media_kit_builder_page() {
        global $gmkb_template_active;
        
        if ($gmkb_template_active === true) {
            return true;
        }
        
        $is_builder_page = false;
        
        if (is_page('media-kit') || is_page('guestify-media-kit')) {
            $is_builder_page = true;
        }
        elseif (isset($_SERVER['REQUEST_URI'])) {
            $uri = $_SERVER['REQUEST_URI'];
            if (preg_match('#/tools/media-kit/?($|\?)#', $uri)) {
                $is_builder_page = true;
            }
        }
        elseif (is_admin() && isset($_GET['page']) && $_GET['page'] === 'guestify-media-kit-builder') {
            $is_builder_page = true;
        }
        elseif (isset($_GET['mkcg_id']) && is_numeric($_GET['mkcg_id'])) {
            $is_builder_page = true;
        }
        
        return $is_builder_page;
    }
}

// Initialize the plugin
Guestify_Media_Kit_Builder::get_instance();

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('🚀 GMKB: Option A - Pure Vue plugin loaded');
    error_log('✅ All PHP rendering removed - 100% Vue.js');
}
