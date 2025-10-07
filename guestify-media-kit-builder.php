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
if (!defined('ABSPATH')) {
    exit;
}

// DEFINE CONSTANTS AT THE TOP LEVEL
define('GUESTIFY_VERSION', '2.1.0-option-a-pure-vue');
define('GUESTIFY_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('GUESTIFY_PLUGIN_URL', plugin_dir_url(__FILE__));
define('GMKB_VERSION', '2.1.0-option-a-pure-vue');
define('GMKB_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('GMKB_PLUGIN_URL', plugin_dir_url(__FILE__));
define('GMKB_WORDPRESS_COMPATIBLE', true);
define('GMKB_ARCHITECTURE', 'pure-vue'); // PHASE 3 COMPLETE: 100% Vue architecture, no PHP rendering
define('GMKB_USE_PURE_VUE', true); // PHASE 3: Always use Pure Vue template
define('GMKB_DEV_MODE', defined('WP_DEBUG') && WP_DEBUG);

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
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/ComponentDiscovery.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/ComponentDiscovery.php';
}

// ROOT FIX: Include frontend template router for conditional media kit display
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/frontend-template-router.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/frontend-template-router.php';
}

// ROOT FIX: Include debug REST endpoint for troubleshooting
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/debug-rest-endpoint.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/debug-rest-endpoint.php';
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

// ============================================
// Issue #13 FIX: Load refactored class files
// Split 870-line file into 4 separate classes
// ============================================

require_once GUESTIFY_PLUGIN_DIR . 'includes/class-gmkb-plugin.php';
require_once GUESTIFY_PLUGIN_DIR . 'includes/class-gmkb-admin.php';
require_once GUESTIFY_PLUGIN_DIR . 'includes/class-gmkb-ajax.php';
require_once GUESTIFY_PLUGIN_DIR . 'includes/class-gmkb-routing.php';

// Backward compatibility alias
class Guestify_Media_Kit_Builder extends GMKB_Plugin {}

// Initialize the plugin
$gmkb_plugin = GMKB_Plugin::get_instance();

// Initialize admin functionality
$gmkb_admin = GMKB_Admin::get_instance();
$gmkb_admin->set_component_discovery($gmkb_plugin->get_component_discovery());

// Initialize AJAX handlers
$gmkb_ajax = GMKB_Ajax::get_instance();
$gmkb_ajax->set_component_discovery($gmkb_plugin->get_component_discovery());

// Initialize routing
$gmkb_routing = GMKB_Routing::get_instance();

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('🚀 GMKB: Option A - Pure Vue plugin loaded');
    error_log('✅ All PHP rendering removed - 100% Vue.js');
    error_log('✅ Issue #13: Refactored into 4 class files');
}
