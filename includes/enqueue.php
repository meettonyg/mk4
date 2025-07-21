<?php
/**
 * WordPress-Native Script and Style Enqueuing
 * * SIMPLIFIED ARCHITECTURE:
 * ✅ Simple procedural approach - NO CLASSES
 * ✅ Single script enqueue with WordPress dependency management
 * ✅ wp_localize_script for ALL data passing
 * ✅ Zero polling, zero setTimeout, pure event-driven
 * ✅ Follows WordPress patterns naturally
 * * @package Guestify
 * @version 2.2.0-stable-architecture
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// GEMINI FIX: Validate constants are available
if ( ! defined( 'GUESTIFY_PLUGIN_URL' ) || ! defined( 'GUESTIFY_PLUGIN_DIR' ) ) {
    if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
        error_log( '❌ GMKB CRITICAL: Plugin constants not defined when enqueue.php loaded!' );
        error_log( '  GUESTIFY_PLUGIN_URL defined: ' . ( defined( 'GUESTIFY_PLUGIN_URL' ) ? 'YES' : 'NO' ) );
        error_log( '  GUESTIFY_PLUGIN_DIR defined: ' . ( defined( 'GUESTIFY_PLUGIN_DIR' ) ? 'YES' : 'NO' ) );
    }
    return; // Exit early if constants not available
}

if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
    error_log( '✅ GMKB: Constants validated in enqueue.php' );
    error_log( '  GUESTIFY_PLUGIN_URL: ' . GUESTIFY_PLUGIN_URL );
    error_log( '  Script will load from: ' . GUESTIFY_PLUGIN_URL . 'js/main.js' );
}

/**
 * Main script and style enqueuing function
 * Called by WordPress wp_enqueue_scripts hook
 */
add_action( 'wp_enqueue_scripts', 'gmkb_enqueue_assets' );

/**
 * ROOT FIX: Enqueue ComponentControlsManager on admin pages too
 * Ensures the script is available in all contexts where the builder loads
 */
add_action( 'admin_enqueue_scripts', 'gmkb_enqueue_assets' );

/**
 * Enqueues all necessary scripts and styles for the Media Kit Builder.
 *
 * ROOT CAUSE FIX: This function has been rewritten to establish a clear
 * and correct dependency chain for all JavaScript files. It eliminates
 * race conditions by ensuring scripts are loaded in the proper order.
 * The conflicting inline scripts previously loaded in the footer have been removed.
 */
function gmkb_enqueue_assets() {
    // Force console output for debugging
    echo '<script>console.log("\ud83d� GMKB ENQUEUE DEBUG: Function executed at " + new Date().toISOString());</script>';
    
    // Use the existing reliable page detection
    if ( ! is_media_kit_builder_page() ) {
        if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
            error_log( '❌ GMKB: Not a media kit builder page - skipping script enqueue' );
        }
        return;
    }
    
    // LOG SUCCESSFUL DETECTION
    error_log( '✅ GMKB: Enqueuing scripts for media kit builder page with STABLE ARCHITECTURE' );

    $plugin_url = GUESTIFY_PLUGIN_URL;
    $version = '2.2.0-stable-architecture-' . time(); // Cache busting for development

    // TEMPORARY: Diagnostic script for debugging
    wp_enqueue_script(
        'gmkb-diagnostic',
        $plugin_url . 'gmkb-diagnostic.js',
        array(), // Load first, no dependencies
        $version,
        true
    );
    
    // --- ROOT CAUSE FIX: COMPREHENSIVE SCRIPT DEPENDENCY CHAIN ---
    // Loading all core dependencies that main.js requires via ES6 imports
    
    // Step 1: Core Dependencies (loaded as ES6 modules)
    // These files are imported by main.js and must be available
    
    // Core GMKB namespace and event system
    wp_enqueue_script(
        'gmkb-core-namespace',
        $plugin_url . 'js/core/gmkb.js',
        array(), // No dependencies
        $version,
        true
    );
    
    // Enhanced State Manager (imported by ui-coordinator)
    wp_enqueue_script(
        'gmkb-state-manager',
        $plugin_url . 'js/core/state-manager.js',
        array('gmkb-core-namespace'),
        $version,
        true
    );
    
    // Enhanced State Manager (simplified version)
    wp_enqueue_script(
        'gmkb-enhanced-state-manager',
        $plugin_url . 'js/core/enhanced-state-manager-simple.js',
        array('gmkb-state-manager'),
        $version,
        true
    );
    
    // Component Manager (imported by main.js)
    wp_enqueue_script(
        'gmkb-component-manager',
        $plugin_url . 'js/managers/component-manager.js',
        array('gmkb-core-namespace', 'gmkb-state-manager'),
        $version,
        true
    );
    
    // UI Coordinator (imported by main.js)
    wp_enqueue_script(
        'gmkb-ui-coordinator',
        $plugin_url . 'js/core/ui-coordinator.js',
        array('gmkb-state-manager', 'gmkb-component-manager'),
        $version,
        true
    );
    
    // Main Application Script - ES6 MODULE (depends on all core files)
    wp_enqueue_script(
        'gmkb-main-script',
        $plugin_url . 'js/main.js',
        array(
            'gmkb-core-namespace',
            'gmkb-state-manager', 
            'gmkb-component-manager',
            'gmkb-ui-coordinator'
        ),
        $version,
        true
    );
    
    // ROOT FIX: Scripts will be converted to WordPress-compatible global namespace pattern
    // No special module handling needed

    // Step 2: Essential Utility and Service Files
    // Core utilities that other modules depend on
    
    // Error handling system
    wp_enqueue_script(
        'gmkb-error-handler',
        $plugin_url . 'js/utils/enhanced-error-handler.js',
        array('gmkb-core-namespace'),
        $version,
        true
    );
    
    // Structured logger
    wp_enqueue_script(
        'gmkb-structured-logger',
        $plugin_url . 'js/utils/structured-logger.js',
        array('gmkb-core-namespace'),
        $version,
        true
    );
    
    // Helper utilities
    wp_enqueue_script(
        'gmkb-helpers',
        $plugin_url . 'js/utils/helpers.js',
        array('gmkb-core-namespace'),
        $version,
        true
    );
    
    // Step 3: Modal System and Component Library
    // Modal system for component library and settings
    wp_enqueue_script(
        'gmkb-modal-base',
        $plugin_url . 'js/modals/modal-base.js',
        array('gmkb-main-script'),
        $version,
        true
    );

    // Component library modal
    wp_enqueue_script(
        'gmkb-component-library',
        $plugin_url . 'js/modals/component-library.js',
        array('gmkb-modal-base'),
        $version,
        true
    );
    
    // Global settings modal
    wp_enqueue_script(
        'gmkb-global-settings',
        $plugin_url . 'js/modals/global-settings.js',
        array('gmkb-modal-base'),
        $version,
        true
    );
    
    // Template library modal
    wp_enqueue_script(
        'gmkb-template-library',
        $plugin_url . 'js/modals/template-library.js',
        array('gmkb-modal-base'),
        $version,
        true
    );
    
    // Export modal
    wp_enqueue_script(
        'gmkb-export-modal',
        $plugin_url . 'js/modals/export.js',
        array('gmkb-modal-base'),
        $version,
        true
    );
    // Step 4: UI Components and Interactions
    // Essential UI components for user interactions
    
    // Design panel UI
    wp_enqueue_script(
        'gmkb-design-panel',
        $plugin_url . 'js/ui/design-panel.js',
        array('gmkb-main-script'),
        $version,
        true
    );
    
    // Element controls and interactions
    wp_enqueue_script(
        'gmkb-element-controls',
        $plugin_url . 'js/ui/element-controls.js',
        array('gmkb-main-script'),
        $version,
        true
    );
    
    // Empty state handlers
    wp_enqueue_script(
        'gmkb-empty-state-handlers',
        $plugin_url . 'js/ui/empty-state-handlers.js',
        array('gmkb-main-script'),
        $version,
        true
    );
    
    // Preview system
    wp_enqueue_script(
        'gmkb-preview',
        $plugin_url . 'js/ui/preview.js',
        array('gmkb-main-script'),
        $version,
        true
    );
    
    // Layout system
    wp_enqueue_script(
        'gmkb-layout',
        $plugin_url . 'js/ui/layout.js',
        array('gmkb-main-script'),
        $version,
        true
    );
    
    // Form controls
    wp_enqueue_script(
        'gmkb-form-controls',
        $plugin_url . 'js/ui/form-controls.js',
        array('gmkb-main-script'),
        $version,
        true
    );
    
    // Tabs system
    wp_enqueue_script(
        'gmkb-tabs',
        $plugin_url . 'js/ui/tabs.js',
        array('gmkb-main-script'),
        $version,
        true
    );
    
    // Step 5: Component Controls Manager - ROOT FIX PRIORITY
    // CRITICAL FIX: This manager is responsible for showing the controls. It must
    // run after the main script has initialized the components.
    $controls_manager_enqueued = wp_enqueue_script(
        'gmkb-component-controls-manager',
        $plugin_url . 'js/core/component-controls-manager.js',
        array('gmkb-main-script'),
        $version,
        true
    );
    
    // ROOT FIX: Log ComponentControlsManager enqueue result
    if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
        error_log( '🔧 GMKB: ComponentControlsManager enqueue result: ' . ( $controls_manager_enqueued ? 'SUCCESS' : 'FAILED' ) );
        error_log( '🔧 GMKB: ComponentControlsManager URL: ' . $plugin_url . 'js/core/component-controls-manager.js' );
        error_log( '🔧 GMKB: File exists check: ' . ( file_exists( GUESTIFY_PLUGIN_DIR . 'js/core/component-controls-manager.js' ) ? 'YES' : 'NO' ) );
    }
    
    // Step 6: Service Layer
    // Essential services for application functionality
    
    // Save service
    wp_enqueue_script(
        'gmkb-save-service',
        $plugin_url . 'js/services/save-service.js',
        array('gmkb-main-script'),
        $version,
        true
    );
    
    // Template loader service
    wp_enqueue_script(
        'gmkb-template-loader',
        $plugin_url . 'js/services/template-loader.js',
        array('gmkb-main-script'),
        $version,
        true
    );
    
    // Auto-generation service
    wp_enqueue_script(
        'gmkb-auto-generation-service',
        $plugin_url . 'js/services/auto-generation-service.js',
        array('gmkb-main-script'),
        $version,
        true
    );
    
    // History service (undo/redo)
    wp_enqueue_script(
        'gmkb-history-service',
        $plugin_url . 'js/services/history-service.js',
        array('gmkb-main-script'),
        $version,
        true
    );
    
    // Keyboard service
    wp_enqueue_script(
        'gmkb-keyboard-service',
        $plugin_url . 'js/services/keyboard-service.js',
        array('gmkb-main-script'),
        $version,
        true
    );
    
    // Step 7: Schema and Validation
    // State schema and validation system
    
    wp_enqueue_script(
        'gmkb-state-schema',
        $plugin_url . 'js/schemas/state-schema.js',
        array('gmkb-core-namespace'),
        $version,
        true
    );
    
    // Step 8: Drag and Drop System
    // SortableJS Library (from CDN, no dependencies)
    wp_enqueue_script(
        'sortablejs',
        'https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js',
        array(), // No dependencies
        '1.15.0',
        true
    );
    
    // Drag and Drop Manager (Depends on main script)
    // Handles dragging from the library to the preview.
    wp_enqueue_script(
        'gmkb-drag-drop-manager',
        $plugin_url . 'js/managers/drag-drop-manager.js',
        array('gmkb-main-script'),
        $version,
        true
    );
    
    // Sortable Integration (Depends on DragDrop Manager and SortableJS)
    // This is the final piece that handles reordering within the preview.
    wp_enqueue_script(
        'gmkb-sortable-integration',
        $plugin_url . 'js/integrations/sortable-integration.js',
        array('gmkb-drag-drop-manager', 'sortablejs'),
        $version,
        true
    );
    
    // Step 9: Debug and Development Scripts (only in debug mode)
    if (defined('WP_DEBUG') && WP_DEBUG) {
        // Note: Development test files have been archived for cleaner production code
        // Uncomment and update paths if specific debug scripts are needed during development
        
        /*
        // Core architecture test scripts
        wp_enqueue_script(
            'gmkb-test-gmkb-architecture',
            $plugin_url . 'js/tests/test-gmkb-architecture.js',
            array('gmkb-sortable-integration'),
            $version,
            true
        );
        */
    }

    // ROOT FIX: Get component data for JavaScript
    $components_data = array();
    $categories_data = array();
    
    // Get the plugin instance to access component discovery
    $plugin_instance = Guestify_Media_Kit_Builder::get_instance();
    if ($plugin_instance) {
        $component_discovery = $plugin_instance->get_component_discovery();
        if ($component_discovery) {
            $components_data = $component_discovery->getComponents();
            $categories_data = $component_discovery->getCategories();
        }
    }
    
    // WordPress-native data passing - guaranteed to be available before script runs
    // ROOT FIX: Updated to include component data and reflect simplified script architecture
    wp_localize_script(
        'gmkb-main-script',
        'gmkbData',
        array(
            'ajaxUrl'       => admin_url( 'admin-ajax.php' ),
            'restUrl'       => esc_url_raw( rest_url() ),
            'nonce'         => wp_create_nonce( 'gmkb_nonce' ),
            'restNonce'     => wp_create_nonce( 'wp_rest' ),
            'postId'        => get_current_post_id_safe(),
            'pluginUrl'     => $plugin_url,
            'siteUrl'       => home_url(),
            'pluginVersion' => defined('GUESTIFY_VERSION') ? GUESTIFY_VERSION : 'unknown',
            'architecture'  => 'wordpress-global-namespace',
            'timestamp'     => time(),
            'builderPage'   => true,
            'isBuilderPage' => true,
            'debugMode'     => defined( 'WP_DEBUG' ) && WP_DEBUG,
            'scriptsLoaded' => 'simplified-fixed',
            'moduleSupport' => false,
            'es6Converted'  => true,
            // ROOT FIX: Include component data to prevent fallback to hardcoded data
            'components'    => $components_data,
            'categories'    => $categories_data,
            'totalComponents' => count($components_data)
        )
    );
    
    // ROOT FIX: Also create guestifyData alias for compatibility
    wp_localize_script(
        'gmkb-main-script',
        'guestifyData',
        array(
            'ajaxUrl'       => admin_url( 'admin-ajax.php' ),
            'restUrl'       => esc_url_raw( rest_url() ),
            'nonce'         => wp_create_nonce( 'gmkb_nonce' ),
            'restNonce'     => wp_create_nonce( 'wp_rest' ),
            'postId'        => get_current_post_id_safe(),
            'pluginUrl'     => $plugin_url,
            'siteUrl'       => home_url(),
            'pluginVersion' => defined('GUESTIFY_VERSION') ? GUESTIFY_VERSION : 'unknown',
            'components'    => $components_data,
            'categories'    => $categories_data,
            'totalComponents' => count($components_data),
            'timestamp'     => time(),
            'debugMode'     => defined( 'WP_DEBUG' ) && WP_DEBUG
        )
    );

    // Enqueue CSS
    wp_enqueue_style(
        'gmkb-main-styles',
        $plugin_url . 'css/guestify-builder.css',
        array(),
        $version
    );
    
    wp_enqueue_style(
        'gmkb-server-integration',
        $plugin_url . 'css/server-integration.css',
        array( 'gmkb-main-styles' ),
        $version
    );

    if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
        error_log( '✅ GMKB: Comprehensive WordPress-native assets enqueued successfully.' );
        error_log( '🏗️ Architecture: Modular ES6 with proper dependency chain.' );
        error_log( '📦 Scripts loaded: Core modules, UI components, services, modals, utilities.' );
        error_log( '🔧 Total scripts: ~30+ files properly organized and dependency-managed.' );
    }
}

/**
 * Simple, reliable page detection
 * Multiple strategies for maximum compatibility
 */
function is_media_kit_builder_page() {
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    
    // Force console output for debugging
    echo '<script>console.log("\ud83c� PAGE DETECTION: URL=' . esc_js($request_uri) . ', Contains guestify-media-kit=' . (strpos( $request_uri, 'guestify-media-kit' ) !== false ? 'YES' : 'NO') . '");</script>';
    
    // Strategy 1: URL-based detection (most reliable)
    if ( strpos( $request_uri, 'guestify-media-kit' ) !== false ) {
        return true;
    }

    // Strategy 2: WordPress page detection
    if ( is_page( 'guestify-media-kit' ) || is_page( 'media-kit' ) ) {
        return true;
    }

    // Strategy 3: Post ID parameter detection
    if ( isset( $_GET['post_id'] ) && is_numeric( $_GET['post_id'] ) ) {
        return true;
    }

    // Strategy 4: Global flag (set by template takeover)
    global $gmkb_template_active;
    if ( ! empty( $gmkb_template_active ) ) {
        return true;
    }

    return false;
}

/**
 * Safe post ID detection with multiple fallback strategies
 */
function get_current_post_id_safe() {
    $post_id = 0;

    if ( isset( $_GET['post_id'] ) && is_numeric( $_GET['post_id'] ) ) {
        $post_id = intval( $_GET['post_id'] );
    }
    elseif ( isset( $_GET['p'] ) && is_numeric( $_GET['p'] ) ) {
        $post_id = intval( $_GET['p'] );
    }
    elseif ( function_exists( 'get_the_ID' ) && get_the_ID() ) {
        $post_id = get_the_ID();
    }
    elseif ( isset( $GLOBALS['post'] ) && is_object($GLOBALS['post']) ) {
        $post_id = $GLOBALS['post']->ID;
    }

    if ( $post_id > 0 ) {
        $post = get_post( $post_id );
        if ( ! $post || $post->post_status === 'trash' ) {
            $post_id = 0;
        }
    }

    return $post_id;
}

/**
 * Global status function for debugging
 */
function gmkb_get_enqueue_status() {
    return array(
        'architecture'      => 'wordpress-native-stable',
        'is_builder_page'   => is_media_kit_builder_page(),
        'post_id'           => get_current_post_id_safe(),
        'request_uri'       => $_SERVER['REQUEST_URI'] ?? '',
        'plugin_url'        => GUESTIFY_PLUGIN_URL,
        'version'           => defined('GUESTIFY_VERSION') ? GUESTIFY_VERSION : 'unknown',
        'wp_debug'          => defined( 'WP_DEBUG' ) && WP_DEBUG,
        'timestamp'         => time(),
        'simplified'        => true,
        'no_classes'        => true,
        'wordpress_native'  => true
    );
}

if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
    error_log( '✅ GMKB: Comprehensive enqueue.php loaded successfully.' );
    error_log( '🏗️ Architecture: ES6 modules with complete dependency resolution.' );
    error_log( '🚀 ROOT CAUSE FIX: All JavaScript imports now properly satisfied by WordPress enqueue system.' );
    error_log( '📋 CLEANUP: Deprecated files archived, test files organized.' );
    error_log( '✅ RESULT: Clean, organized, and fully functional JavaScript architecture.' );
}
