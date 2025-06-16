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
     * Constructor
     */
    public function __construct() {
        // Initialize hooks
        add_action('init', array($this, 'init'));
        add_action('admin_init', array($this, 'admin_init'));
        
        // Add custom capabilities
        add_action('admin_init', array($this, 'add_capabilities'));
    }
    
    /**
     * Initialize the system
     */
    public function init() {
        // Register any additional hooks needed
        $this->register_hooks();
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
    * Check if current page is builder
    */
private function is_builder_page() {
    // Check multiple possible page names
    if (isset($_GET['page'])) {
        $page = $_GET['page'];
        return in_array($page, array('guestify-builder', 'guestify-media-kit'));
    }
    
    $screen = get_current_screen();
    if ($screen) {
        return in_array($screen->id, array(
            'toplevel_page_guestify-builder',
            'toplevel_page_guestify-media-kit',
            'guestify-media-kit'
        ));
    }
    
    // Also check if we're on the media kit page
    return is_page('guestify-media-kit');
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
require_once GMKB_PLUGIN_DIR . 'includes/enhanced-ajax.php';