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

// ROOT FIX: CRITICAL - Enqueue media library on 'wp' hook (fires before template)
// This ensures wp.media is available when template loads
add_action('wp', function() {
    // Only on media kit builder pages
    if (isset($_SERVER['REQUEST_URI']) && preg_match('#/tools/media-kit($|/|\?|&)#', $_SERVER['REQUEST_URI'])) {
        // ROOT FIX: Enqueue all required media scripts with proper dependencies
        wp_enqueue_media();
        
        // These are the core media library scripts that wp_enqueue_media() should load:
        // But we'll explicitly enqueue them to be sure
        wp_enqueue_script('media-models');
        wp_enqueue_script('wp-plupload');
        wp_enqueue_script('media-views');
        wp_enqueue_script('media-editor');
        wp_enqueue_script('media-audiovideo');
        
        // Enqueue media styles
        wp_enqueue_style('media-views');
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB MAIN: Enqueued ALL media scripts on wp hook');
        }
    }
}, 1);

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

// PHASE 1 ARCHITECTURAL FIX: Centralized Pods enrichment REMOVED
// Components now self-contained - load data via usePodsData() composable
// Archived: _archive/PHASE1-ENRICHMENT-REMOVAL-2025-10-27/component-pods-enrichment.php

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

// PHASE 7: Version Control System
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/version-control/VersionManager.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/version-control/VersionManager.php';
}

// PHASE 8: Native Code-First Data Layer (Headless Architecture Migration)
// Replaces Pods dependency with native WordPress CPT and meta field registration
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/core-schema.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/core-schema.php';
}

if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/field-migration-map.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/field-migration-map.php';
}

// Formidable Field ID to Post Meta mapping (for Vue Profile Editor)
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/formidable-field-map.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/formidable-field-map.php';
}

if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/permissions.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/permissions.php';
}

// PHASE 8.4: GraphQL Integration (Optional - requires WPGraphQL plugin)
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/graphql-types.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/graphql-types.php';
}

// Native data layer test scripts (admin only)
if (is_admin()) {
    // Check both possible locations for test files
    $native_test_paths = [
        'tests/native-data-test.php',
        'tests/native-migration/native-data-test.php',
    ];
    foreach ($native_test_paths as $path) {
        if (file_exists(GUESTIFY_PLUGIN_DIR . $path)) {
            require_once GUESTIFY_PLUGIN_DIR . $path;
            break;
        }
    }
}

// PHASE 2 IMPLEMENTATION: Pure Vue REST API v2 - Unified Endpoint
// ROOT FIX: Removed MediaKitAPI (v1) - redundant code, frontend only uses v2
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/api/v2/class-gmkb-rest-api-v2.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/api/v2/class-gmkb-rest-api-v2.php';
}

// Profile API - Direct post meta editing for Vue Profile Editor
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/api/v2/class-gmkb-profile-api.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/api/v2/class-gmkb-profile-api.php';
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

// ROOT FIX: Theme REST API Controller - CRITICAL for theme saving functionality
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/api/class-rest-theme-controller.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/api/class-rest-theme-controller.php';
    add_action('init', function() {
        if (class_exists('GMKB_REST_Theme_Controller')) {
            new GMKB_REST_Theme_Controller();
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('✅ GMKB: Theme REST API Controller instantiated');
            }
        }
    }, 5);
}

// Component system files
if (file_exists(GUESTIFY_PLUGIN_DIR . 'system/ComponentDiscovery.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/ComponentDiscovery.php';
}

// ROOT FIX: Auto-load component data-integration files (ARCHITECTURE COMPLIANT)
// This ensures each component's data integration logic is loaded
$components_dir = GUESTIFY_PLUGIN_DIR . 'components';
if (is_dir($components_dir)) {
    $component_folders = glob($components_dir . '/*', GLOB_ONLYDIR);
    foreach ($component_folders as $component_folder) {
        $data_integration_file = $component_folder . '/data-integration.php';
        if (file_exists($data_integration_file)) {
            require_once $data_integration_file;
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('✅ GMKB: Loaded data integration for ' . basename($component_folder));
            }
        }
    }
}

// ROOT FIX: Include frontend template router for conditional media kit display
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/frontend-template-router.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/frontend-template-router.php';
}

// Profile Editor Shortcode - Vue-based profile editing
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/shortcodes/profile-shortcode.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/shortcodes/profile-shortcode.php';
}

// ROOT FIX: Include debug REST endpoint for troubleshooting
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/debug-rest-endpoint.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/debug-rest-endpoint.php';
}

// ROOT FIX: Load frontend display class on BOTH admin and frontend
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/class-gmkb-frontend-display.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/class-gmkb-frontend-display.php';
}

// ADMIN TOOLS: Load essential admin functionality only
if (is_admin()) {
    // ROOT FIX: Load comprehensive diagnostic tool
    $diagnostic_file = GUESTIFY_PLUGIN_DIR . 'admin/diagnostic-tools.php';
    if (file_exists($diagnostic_file)) {
        require_once $diagnostic_file;
    }
    
    $viewer_file = GUESTIFY_PLUGIN_DIR . 'admin/media-kit-viewer.php';
    if (file_exists($viewer_file)) {
        require_once $viewer_file;
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

// ROOT FIX: Ensure ComponentDiscovery is globally available immediately
// This fixes race condition where REST API can't find ComponentDiscovery
global $gmkb_component_discovery;
if (!isset($gmkb_component_discovery)) {
    $gmkb_component_discovery = $gmkb_plugin->get_component_discovery();
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('✅ GMKB: ComponentDiscovery made globally available from main plugin file');
    }
}

// ROOT FIX: Initialize REST API v2 AFTER ComponentDiscovery is ready
// This ensures Pods fields can be discovered from component configs
global $gmkb_rest_api_v2;
if (class_exists('GMKB_REST_API_V2')) {
    $gmkb_rest_api_v2 = new GMKB_REST_API_V2();
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('✅ GMKB: REST API v2 initialized with ComponentDiscovery ready');
    }
}

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
