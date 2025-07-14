<?php
/**
 * ROOT FIX: Bulletproof WordPress Script and Style Registration
 * 
 * FIXES IMPLEMENTED:
 * ✅ Simplified dependency chain with guaranteed loading order
 * ✅ Fixed AJAX data localization consistency across all scripts
 * ✅ Added admin script support for WordPress admin area
 * ✅ Removed script conflicts and duplicate class definitions
 * ✅ Enhanced component manager preservation
 * ✅ Bulletproof page detection
 * 
 * @package Guestify
 * @version ROOT-FIX-1.0.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * ROOT FIX: Main Script Manager - Simplified and Bulletproof
 */
class GMKB_Root_Fix_Script_Manager {
    
    private static $instance = null;
    private $is_builder_page = false;
    private $scripts_loaded = false;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        // ROOT FIX: Hook into WordPress script loading system
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'), 10);
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'), 10);
        
        // ROOT FIX: Early builder page detection
        add_action('init', array($this, 'detect_builder_page'), 1);
        
        // ROOT FIX: Add script attributes for modern loading
        add_filter('script_loader_tag', array($this, 'add_script_attributes'), 10, 3);
    }
    
    /**
     * ROOT FIX: Bulletproof builder page detection
     */
    public function detect_builder_page() {
        // Method 1: URL-based detection (most reliable)
        $request_uri = $_SERVER['REQUEST_URI'] ?? '';
        if (strpos($request_uri, 'guestify-media-kit') !== false) {
            $this->is_builder_page = true;
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('ROOT FIX: Builder page detected via URL');
            }
            return;
        }
        
        // Method 2: Query parameters
        if (isset($_GET['page']) && $_GET['page'] === 'guestify-media-kit') {
            $this->is_builder_page = true;
            return;
        }
        
        // Method 3: Post ID with media kit context
        if (isset($_GET['post_id']) && is_numeric($_GET['post_id'])) {
            $this->is_builder_page = true;
            return;
        }
        
        // Method 4: WordPress page detection (runs later)
        add_action('wp', array($this, 'wordpress_page_detection'));
    }
    
    /**
     * ROOT FIX: WordPress page detection fallback
     */
    public function wordpress_page_detection() {
        if (!$this->is_builder_page) {
            if (is_page('guestify-media-kit') || is_page('media-kit')) {
                $this->is_builder_page = true;
            }
        }
    }
    
    /**
     * ROOT FIX: Frontend script enqueuing
     */
    public function enqueue_frontend_scripts() {
        if (!$this->is_builder_page) {
            return;
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('ROOT FIX: Enqueuing frontend scripts for builder page');
        }
        
        $this->register_and_enqueue_scripts();
        $this->scripts_loaded = true;
    }
    
    /**
     * ROOT FIX: Admin script enqueuing
     */
    public function enqueue_admin_scripts($hook) {
        // Check if we're on a relevant admin page
        if (strpos($hook, 'guestify') !== false || isset($_GET['page']) && $_GET['page'] === 'guestify-media-kit') {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('ROOT FIX: Enqueuing admin scripts for: ' . $hook);
            }
            
            $this->register_and_enqueue_scripts();
            $this->scripts_loaded = true;
        }
    }
    
    /**
     * ROOT FIX: Clean script registration with bulletproof dependencies
     */
    private function register_and_enqueue_scripts() {
        $plugin_url = GUESTIFY_PLUGIN_URL;
        $version = GUESTIFY_VERSION . '-root-fix-' . time(); // Aggressive cache busting
        
        // ROOT FIX: Register styles first
        wp_register_style(
            'guestify-media-kit-builder-styles',
            $plugin_url . 'css/guestify-builder.css',
            array(),
            $version
        );
        wp_enqueue_style('guestify-media-kit-builder-styles');
        
        // ROOT FIX: STEP 1 - External dependencies
        wp_register_script(
            'sortable-js',
            'https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js',
            array(),
            '1.15.2',
            true // Load in footer
        );
        
        // ROOT FIX: STEP 2 - Enhanced Component Manager (MUST LOAD FIRST)
        wp_register_script(
            'guestify-enhanced-component-manager',
            $plugin_url . 'js/core/enhanced-component-manager.js',
            array('sortable-js'),
            $version,
            true
        );
        
        // ROOT FIX: STEP 3 - Core Systems Bundle (preserves enhanced manager)
        wp_register_script(
            'guestify-core-systems-bundle',
            $plugin_url . 'js/core-systems-bundle.js',
            array('guestify-enhanced-component-manager'), // Depends on enhanced manager
            $version,
            true
        );
        
        // ROOT FIX: STEP 4 - Application Bundle (UI and functionality)
        wp_register_script(
            'guestify-application-bundle',
            $plugin_url . 'js/application-bundle.js',
            array('guestify-core-systems-bundle'), // Depends on core systems
            $version,
            true
        );
        
        // ROOT FIX: STEP 5 - Topics Component Script (component functionality)
        wp_register_script(
            'guestify-topics-component',
            $plugin_url . 'components/topics/script.js',
            array('guestify-application-bundle'), // Depends on application bundle
            $version,
            true
        );
        
        // ROOT FIX: STEP 6 - Topics Panel Script (design panel)
        wp_register_script(
            'guestify-topics-panel',
            $plugin_url . 'components/topics/panel-script.js',
            array('guestify-topics-component'), // Depends on topics component
            $version,
            true
        );
        
        // ROOT FIX: Enqueue all scripts in dependency order
        wp_enqueue_script('guestify-enhanced-component-manager');
        wp_enqueue_script('guestify-core-systems-bundle');
        wp_enqueue_script('guestify-application-bundle');
        wp_enqueue_script('guestify-topics-component');
        wp_enqueue_script('guestify-topics-panel');
        
        // ROOT FIX: CRITICAL - Localize AJAX data to ALL scripts that need it
        $this->localize_ajax_data();
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('ROOT FIX: All scripts registered and enqueued successfully');
        }
    }
    
    /**
     * ROOT FIX: Consistent AJAX data localization
     */
    private function localize_ajax_data() {
        $ajax_data = array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'restUrl' => esc_url_raw(rest_url()),
            'nonce' => wp_create_nonce('guestify_media_kit_builder'),
            'restNonce' => wp_create_nonce('wp_rest'),
            'postId' => $this->get_current_post_id(),
            'pluginUrl' => GUESTIFY_PLUGIN_URL,
            'siteUrl' => home_url(),
            'pluginVersion' => GUESTIFY_VERSION,
            'builderPage' => true,
            'rootFixActive' => true,
            'timestamp' => time(),
            'saveActions' => array(
                'customTopics' => 'save_custom_topics',
                'mkcgTopics' => 'save_mkcg_topics'
            )
        );
        
        // ROOT FIX: Localize to MULTIPLE script handles for maximum compatibility
        $script_handles = array(
            'guestify-enhanced-component-manager',
            'guestify-application-bundle',
            'guestify-topics-component',
            'guestify-topics-panel'
        );
        
        foreach ($script_handles as $handle) {
            // Use both 'guestifyData' and 'guestifyMediaKit' for maximum compatibility
            wp_localize_script($handle, 'guestifyData', $ajax_data);
            wp_localize_script($handle, 'guestifyMediaKit', $ajax_data);
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('ROOT FIX: AJAX data localized to all script handles');
            error_log('ROOT FIX: AJAX URL: ' . $ajax_data['ajaxUrl']);
            error_log('ROOT FIX: Nonce: ' . substr($ajax_data['nonce'], 0, 10) . '...');
            error_log('ROOT FIX: Post ID: ' . $ajax_data['postId']);
        }
    }
    
    /**
     * ROOT FIX: Get current post ID with multiple detection methods
     */
    private function get_current_post_id() {
        // Try multiple detection strategies
        $post_id = 0;
        
        // Strategy 1: URL parameters
        if (isset($_GET['post_id']) && is_numeric($_GET['post_id'])) {
            $post_id = intval($_GET['post_id']);
        }
        // Strategy 2: WordPress globals
        elseif (isset($GLOBALS['post']) && $GLOBALS['post']) {
            $post_id = $GLOBALS['post']->ID;
        }
        // Strategy 3: get_the_ID() if available
        elseif (function_exists('get_the_ID') && get_the_ID()) {
            $post_id = get_the_ID();
        }
        
        // Validate post exists
        if ($post_id > 0 && get_post_status($post_id) === false) {
            return 0;
        }
        
        return $post_id;
    }
    
    /**
     * ROOT FIX: Add modern script attributes
     */
    public function add_script_attributes($tag, $handle, $src) {
        // List of scripts that should be deferred
        $deferred_scripts = array(
            'guestify-enhanced-component-manager',
            'guestify-core-systems-bundle',
            'guestify-application-bundle',
            'guestify-topics-component',
            'guestify-topics-panel'
        );
        
        if (in_array($handle, $deferred_scripts)) {
            // Add defer attribute for better performance
            $tag = str_replace(' src', ' defer src', $tag);
        }
        
        return $tag;
    }
    
    /**
     * ROOT FIX: Force builder page detection (for external calls)
     */
    public function force_builder_page_detection() {
        $this->is_builder_page = true;
        
        // If scripts haven't been loaded yet and we're in the right context, load them
        if (!$this->scripts_loaded && (did_action('wp_enqueue_scripts') || is_admin())) {
            $this->register_and_enqueue_scripts();
            $this->scripts_loaded = true;
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('ROOT FIX: Builder page detection forced - scripts will be loaded');
        }
    }
    
    /**
     * ROOT FIX: Direct script enqueuing method (for template calls)
     */
    public function enqueue_scripts() {
        if (!$this->scripts_loaded) {
            $this->register_and_enqueue_scripts();
            $this->scripts_loaded = true;
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('ROOT FIX: Scripts enqueued directly via enqueue_scripts() method');
            }
        }
    }
    
    /**
     * ROOT FIX: Get initialization status for debugging
     */
    public function get_status() {
        return array(
            'is_builder_page' => $this->is_builder_page,
            'scripts_loaded' => $this->scripts_loaded,
            'current_url' => $_SERVER['REQUEST_URI'] ?? '',
            'post_id' => $this->get_current_post_id(),
            'version' => 'ROOT-FIX-1.0.0',
            'architecture' => 'simplified-bulletproof-dependencies',
            'ajax_data_available' => true,
            'admin_support' => true,
            'cache_busting' => 'aggressive'
        );
    }
}

/**
 * ROOT FIX: Initialize the script manager
 */
function guestify_root_fix_init() {
    $manager = GMKB_Root_Fix_Script_Manager::get_instance();
    
    if (defined('WP_DEBUG') && WP_DEBUG) {
        $status = $manager->get_status();
        error_log('ROOT FIX: Script manager initialized - ' . json_encode($status));
    }
    
    return $manager;
}

// ROOT FIX: Initialize immediately
$gmkb_manager = guestify_root_fix_init();

/**
 * ROOT FIX: Backward compatibility alias
 * This ensures any references to the old class name will work
 */
if (!class_exists('GMKB_Enhanced_Script_Manager')) {
    class_alias('GMKB_Root_Fix_Script_Manager', 'GMKB_Enhanced_Script_Manager');
    
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('ROOT FIX: Backward compatibility alias created for GMKB_Enhanced_Script_Manager');
    }
}

/**
 * ROOT FIX: Global status function for debugging
 */
function gmkb_get_root_fix_status() {
    $manager = GMKB_Root_Fix_Script_Manager::get_instance();
    if ($manager) {
        return $manager->get_status();
    }
    return array('error' => 'Manager not initialized');
}

/**
 * ROOT FIX: Force builder page detection (for external calls)
 */
function gmkb_force_builder_page() {
    $manager = GMKB_Root_Fix_Script_Manager::get_instance();
    if ($manager) {
        $manager->force_builder_page_detection();
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('ROOT FIX: Builder page detection forced via global function');
        }
        
        return true;
    }
    return false;
}

/**
 * ROOT FIX: Check if scripts are properly loaded
 */
function gmkb_validate_script_loading() {
    global $wp_scripts;
    
    $required_scripts = array(
        'guestify-enhanced-component-manager',
        'guestify-core-systems-bundle', 
        'guestify-application-bundle',
        'guestify-topics-component',
        'guestify-topics-panel'
    );
    
    $validation_results = array();
    
    foreach ($required_scripts as $script) {
        $validation_results[$script] = array(
            'registered' => isset($wp_scripts->registered[$script]),
            'enqueued' => in_array($script, $wp_scripts->queue ?? []),
            'dependencies' => isset($wp_scripts->registered[$script]) ? 
                            $wp_scripts->registered[$script]->deps : []
        );
    }
    
    return array(
        'status' => 'ROOT-FIX-VALIDATION',
        'all_registered' => count(array_filter(array_column($validation_results, 'registered'))) === count($required_scripts),
        'scripts' => $validation_results,
        'timestamp' => current_time('mysql')
    );
}

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('ROOT FIX: Bulletproof enqueue.php loaded successfully');
}
