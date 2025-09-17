<?php
/**
 * Enhanced System Initialization
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Initialize the enhanced schema-driven system
 */
class GMKB_Enhanced_System {
    
    /**
     * CRITICAL FIX: Enhanced constructor with early hooks integration
     */
    public function __construct() {
        // CRITICAL FIX: Ultra-early hooks for enhanced script manager integration
        add_action('plugins_loaded', array($this, 'early_integration'), 2); // After script manager
        add_action('init', array($this, 'init'), 10);
        add_action('admin_init', array($this, 'admin_init'));
        
        // Add custom capabilities
        add_action('admin_init', array($this, 'add_capabilities'));
        
        // CRITICAL FIX: Enhanced system coordination
        add_action('wp_loaded', array($this, 'ensure_systems_ready'));
    }
    
    /**
     * CRITICAL FIX: Enhanced early integration with better error handling
     */
    public function early_integration() {
        // Use simple, safe detection at this early stage
        $is_builder_page = $this->early_builder_page_detection();
        
        if ($is_builder_page) {
            // Ensure coordination with enhanced script manager
            $this->coordinate_with_script_manager();
            
            // Set enhanced system flags
            if (!defined('GMKB_ENHANCED_SYSTEM_ACTIVE')) {
                define('GMKB_ENHANCED_SYSTEM_ACTIVE', true);
            }
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Enhanced System: Early integration active');
            }
        }
    }
    
    /**
     * CRITICAL FIX: Safe early builder page detection
     */
    private function early_builder_page_detection() {
        // Use only safe detection methods at this early stage
        $detection_methods = array(
            // Method 1: Check if already detected by script manager
            defined('GMKB_BUILDER_PAGE') && GMKB_BUILDER_PAGE,
            
            // Method 2: URL analysis (always safe)
            isset($_SERVER['REQUEST_URI']) && strpos($_SERVER['REQUEST_URI'], 'guestify-media-kit') !== false,
            
            // Method 3: Query parameters (always safe)
            isset($_GET['page']) && in_array($_GET['page'], array('guestify-builder', 'guestify-media-kit')),
            
            // Method 4: Post ID detection (if available)
            isset($_GET['p']) && function_exists('get_post_field') && get_post_field('post_name', $_GET['p']) === 'guestify-media-kit'
        );
        
        return array_reduce($detection_methods, function($carry, $method) {
            return $carry || $method;
        }, false);
    }
    
    /**
     * CRITICAL FIX: Coordinate with enhanced script manager
     */
    private function coordinate_with_script_manager() {
        // Ensure script manager is available
        if (class_exists('GMKB_Enhanced_Script_Manager')) {
            $script_manager = GMKB_Enhanced_Script_Manager::get_instance();
            
            // Add coordination hooks
            add_action('wp_enqueue_scripts', array($this, 'enhance_script_coordination'), 6);
            add_action('wp_head', array($this, 'add_system_coordination_data'), 3);
        }
    }
    
    /**
     * CRITICAL FIX: Enhanced script coordination
     */
    public function enhance_script_coordination() {
        if (!$this->is_builder_page()) {
            return;
        }
        
        // Add enhanced system flags to scripts
        $coordination_data = array(
            'enhancedSystemActive' => true,
            'coordinationVersion' => '1.0.0-phase1',
            'systemIntegration' => array(
                'scriptManager' => class_exists('GMKB_Enhanced_Script_Manager'),
                'enhancedInit' => true,
                'isolation' => defined('GMKB_BUILDER_PAGE'),
                'earlyDetection' => defined('GMKB_BUILDER_PAGE')
            )
        );
        
        // Add inline script for coordination
        $coordination_script = 'window.gmkbSystemCoordination = ' . wp_json_encode($coordination_data) . ';';
        wp_add_inline_script('guestify-builder-script', $coordination_script, 'before');
    }
    
    /**
     * CRITICAL FIX: Add system coordination data to head
     */
    public function add_system_coordination_data() {
        if (!$this->is_builder_page()) {
            return;
        }
        
        ?>
        <script id="gmkb-system-coordination">
            /* CRITICAL FIX: System coordination data */
            window.gmkbSystemCoordination = window.gmkbSystemCoordination || {};
            window.gmkbSystemCoordination.headInjected = true;
            window.gmkbSystemCoordination.timestamp = <?php echo time(); ?>;
            
            console.log('🤝 GMKB Enhanced System: Coordination active');
        </script>
        <?php
    }
    
    /**
     * CRITICAL FIX: Enhanced system readiness check with error handling
     */
    public function ensure_systems_ready() {
        try {
            if (!$this->safe_is_builder_page()) {
                return;
            }
            
            // Validate system readiness
            $system_checks = array(
                'enhanced_script_manager' => class_exists('GMKB_Enhanced_Script_Manager'),
                'builder_page_detected' => defined('GMKB_BUILDER_PAGE'),
                'enhanced_system_active' => defined('GMKB_ENHANCED_SYSTEM_ACTIVE'),
                'wp_loaded' => true
            );
            
            $all_ready = array_reduce($system_checks, function($carry, $check) {
                return $carry && $check;
            }, true);
            
            if ($all_ready) {
                if (!defined('GMKB_SYSTEMS_READY')) {
                    define('GMKB_SYSTEMS_READY', true);
                }
                
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('GMKB Enhanced System: All systems ready for initialization');
                }
            } else {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('GMKB Enhanced System: System readiness check failed: ' . wp_json_encode($system_checks));
                }
            }
        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Enhanced System: Error in ensure_systems_ready: ' . $e->getMessage());
            }
        }
    }
    
    /**
     * CRITICAL FIX: Enhanced initialization with error handling and state loading coordination
     */
    public function init() {
        try {
            // Register any additional hooks needed
            $this->register_hooks();
            
            // CRITICAL FIX: Enhanced initialization coordination (with safe detection)
            if ($this->safe_is_builder_page()) {
                $this->setup_enhanced_environment();
                
                // ROOT FIX: Add critical footer hook for state loading coordination
                add_action('wp_footer', array($this, 'inject_state_loading_coordination'), 998);
            }
        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Enhanced System Init Error: ' . $e->getMessage());
            }
        }
    }
    
    /**
     * CRITICAL FIX: Safe builder page detection for init hook
     */
    private function safe_is_builder_page() {
        try {
            return $this->is_builder_page();
        } catch (Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB Enhanced System: Fallback to simple detection due to error: ' . $e->getMessage());
            }
            
            // Fallback to simple detection
            return $this->early_builder_page_detection();
        }
    }
    
    /**
     * CRITICAL FIX: Setup enhanced environment
     */
    private function setup_enhanced_environment() {
        // Add enhanced body classes
        add_filter('body_class', function($classes) {
            $classes[] = 'gmkb-enhanced-system';
            $classes[] = 'gmkb-phase1-active';
            return $classes;
        });
        
        // Add enhanced admin notices for debug
        if (defined('WP_DEBUG') && WP_DEBUG && is_admin()) {
            add_action('admin_notices', array($this, 'show_enhanced_system_notice'));
        }
    }
    
    /**
     * CRITICAL FIX: Show enhanced system notice
     */
    public function show_enhanced_system_notice() {
        if (!$this->is_builder_page()) {
            return;
        }
        
        ?>
        <div class="notice notice-success is-dismissible">
            <p><strong>GMKB Enhanced System Active:</strong> Phase 1 fixes are running with improved race condition prevention.</p>
        </div>
        <?php
    }
    
    /**
     * ROOT FIX: Inject state loading coordination script - DISABLED
     * Bundles handle all coordination - no PHP coordination needed
     */
    public function inject_state_loading_coordination() {
        // ROOT FIX: DISABLED - bundles handle all coordination
        return;
        
        if (!$this->is_builder_page()) {
            return;
        }
        
        // ROOT FIX: Coordination disabled - output debug info only
        ?>
        <script id="gmkb-state-loading-coordination-disabled">
            /* ROOT FIX: PHP State Loading Coordination DISABLED */
            console.log('🚫 ROOT FIX: PHP coordination disabled - bundles handle everything');
            window.gmkbPHPCoordinationDisabled = true;
        </script>
        <?php
    }
    
    /**
     * Admin initialization
     */
    public function admin_init() {
        // Check if we need to upgrade from old system
        $this->maybe_upgrade();
    }
    
    /**
     * Register hooks
     */
    private function register_hooks() {
        // Add builder page modifications
        add_action('admin_head', array($this, 'add_admin_styles'));
        
        // Add custom script loader attributes
        add_filter('script_loader_tag', array($this, 'add_module_to_scripts'), 10, 3);
    }
    
    /**
     * Add module type to our ES6 scripts
     */
    public function add_module_to_scripts($tag, $handle, $src) {
        $module_scripts = array(
            'gmkb-state-manager',
            'gmkb-data-binding',
            'gmkb-design-panel',
            'gmkb-enhanced-history'
        );
        
        if (in_array($handle, $module_scripts)) {
            $tag = '<script type="module" src="' . esc_url($src) . '" id="' . esc_attr($handle) . '-js"></script>';
        }
        
        return $tag;
    }
    
    /**
     * Add admin styles
     */
    public function add_admin_styles() {
        if (!$this->is_builder_page()) {
            return;
        }
        ?>
        <style>
            /* Additional inline styles for enhanced system */
            .gmkb-enhanced-indicator {
                position: absolute;
                top: 10px;
                right: 10px;
                background: #10b981;
                color: white;
                font-size: 11px;
                padding: 2px 8px;
                border-radius: 3px;
                font-weight: 500;
            }
            
            /* Loading states */
            .gmkb-loading {
                position: relative;
                pointer-events: none;
            }
            
            .gmkb-loading::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            /* Schema-driven panels */
            .schema-driven-panel {
                position: relative;
            }
            
            .schema-driven-panel .auto-generated-notice {
                position: absolute;
                top: 5px;
                right: 5px;
                font-size: 10px;
                color: #6b7280;
                background: #f3f4f6;
                padding: 2px 6px;
                border-radius: 3px;
            }
        </style>
        <?php
    }
    
    /**
    * CRITICAL FIX: Enhanced builder page detection with proper WordPress hook timing
    */
private function is_builder_page() {
    // First check if already detected early
    if (defined('GMKB_BUILDER_PAGE') && GMKB_BUILDER_PAGE) {
        return true;
    }
    
    // Check multiple possible page detection methods
    $detection_methods = array();
    
    // Method 1: URL-based detection (always available)
    if (isset($_SERVER['REQUEST_URI'])) {
        $detection_methods[] = strpos($_SERVER['REQUEST_URI'], 'guestify-media-kit') !== false;
    }
    
    // Method 2: Query parameter detection (always available)
    if (isset($_GET['page'])) {
        $detection_methods[] = in_array($_GET['page'], array('guestify-builder', 'guestify-media-kit'));
    }
    
    // Method 3: WordPress page function (if available)
    if (function_exists('is_page')) {
        $detection_methods[] = is_page('guestify-media-kit') || is_page('media-kit');
    }
    
    // Method 4: Admin screen detection (only if function exists and we're in admin)
    if (function_exists('get_current_screen') && is_admin()) {
        $screen = get_current_screen();
        if ($screen) {
            $detection_methods[] = in_array($screen->id, array(
                'toplevel_page_guestify-builder',
                'toplevel_page_guestify-media-kit',
                'guestify-media-kit'
            ));
        }
    }
    
    // Method 5: Post slug detection (if available)
    if (function_exists('get_query_var')) {
        $detection_methods[] = get_query_var('pagename') === 'guestify-media-kit';
    }
    
    // Return true if any detection method succeeds
    return array_reduce($detection_methods, function($carry, $method) {
        return $carry || $method;
    }, false);
}
    
    /**
     * Maybe upgrade from old system
     */
    private function maybe_upgrade() {
        $current_version = get_option('gmkb_enhanced_version', '0');
        
        if (version_compare($current_version, '1.0.0', '<')) {
            $this->upgrade_to_enhanced();
            update_option('gmkb_enhanced_version', '1.0.0');
        }
    }
    
    /**
     * Upgrade to enhanced system
     */
    private function upgrade_to_enhanced() {
        // Any upgrade logic needed
        // For now, just log that we've upgraded
        error_log('GMKB: Upgraded to enhanced schema-driven system');
    }
    
    /**
     * Add capabilities for media kit management
     */
    public function add_capabilities() {
        $role = get_role('administrator');
        if ($role) {
            $role->add_cap('edit_media_kits');
            $role->add_cap('edit_others_media_kits');
            $role->add_cap('publish_media_kits');
            $role->add_cap('read_private_media_kits');
            $role->add_cap('delete_media_kits');
        }
    }
}

// Initialize the enhanced system
new GMKB_Enhanced_System();

// Include enhanced AJAX handlers
require_once GUESTIFY_PLUGIN_DIR . 'includes/enhanced-ajax.php';

// ROOT FIX: Template completion coordination DISABLED - bundles handle all events
add_action('wp_footer', function() {
    if (is_page('guestify-media-kit') || is_page('media-kit') || 
        (defined('GMKB_BUILDER_PAGE') && GMKB_BUILDER_PAGE)) {
        ?>
        <script id="gmkb-template-completion-disabled">
        /* ROOT FIX: Template completion coordination DISABLED - bundles handle all events */
        console.log('🚫 ROOT FIX: PHP template completion disabled - bundles handle events');
        window.gmkbPHPTemplateCompletionDisabled = true;
        </script>
        <?php
    }
}, 999);