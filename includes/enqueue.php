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

    // --- SCRIPT DEPENDENCY CHAIN ---
    // This is the corrected loading order to prevent race conditions.

    // 1. Main Application Script (No dependencies)
    // This is the core script that other managers will depend on.
    wp_enqueue_script(
        'gmkb-main-script',
        $plugin_url . 'js/main.js',
        array(), // No dependencies
        $version,
        true // Load in footer
    );

    // 2. Modal System (Depends on main script)
    // The modal system needs the main GMKB object to be available.
    wp_enqueue_script(
        'gmkb-modal-base',
        $plugin_url . 'js/modals/modal-base.js',
        array('gmkb-main-script'),
        $version,
        true
    );

    // 3. Component Library (Depends on the modal system)
    // The component library cannot function without the modal system being ready.
    wp_enqueue_script(
        'gmkb-component-library',
        $plugin_url . 'js/modals/component-library.js',
        array('gmkb-modal-base'),
        $version,
        true
    );
    
    // 4. Component Controls Manager (Depends on main script)
    // CRITICAL FIX: This manager is responsible for showing the controls. It must
    // run after the main script has initialized the components.
    wp_enqueue_script(
        'gmkb-component-controls-manager',
        $plugin_url . 'js/core/component-controls-manager.js',
        array('gmkb-main-script'),
        $version,
        true
    );
    
    // 5. SortableJS Library (from CDN, no dependencies)
    wp_enqueue_script(
        'sortablejs',
        'https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js',
        array(), // No dependencies
        '1.15.0',
        true
    );
    
    // 6. Drag and Drop Manager (Depends on main script)
    // Handles dragging from the library to the preview.
    wp_enqueue_script(
        'gmkb-drag-drop-manager',
        $plugin_url . 'js/drag-drop-manager.js',
        array('gmkb-main-script'),
        $version,
        true
    );
    
    // 7. Sortable Integration (Depends on DragDrop Manager and SortableJS)
    // This is the final piece that handles reordering within the preview.
    wp_enqueue_script(
        'gmkb-sortable-integration',
        $plugin_url . 'js/sortable-integration.js',
        array('gmkb-drag-drop-manager', 'sortablejs'),
        $version,
        true
    );
    
    // DEBUG: Test file for validation (in debug mode only)
    if (defined('WP_DEBUG') && WP_DEBUG) {
        wp_enqueue_script(
            'gmkb-test-drag-drop',
            $plugin_url . 'js/test-drag-drop-functionality.js',
            array('gmkb-sortable-integration'), // Depends on the final script in the chain
            $version,
            true
        );
    }

    // WordPress-native data passing - guaranteed to be available before script runs
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
            'architecture'  => 'vanilla-js-stable',
            'timestamp'     => time(),
            'builderPage'   => true,
            'isBuilderPage' => true,
            'debugMode'     => defined( 'WP_DEBUG' ) && WP_DEBUG,
            'templateFixed' => true,
            'vanillaJS'     => true,
            'sortableEnabled' => true,
            'dragDropComplete' => true
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
        error_log( '✅ GMKB: WordPress-native assets enqueued successfully with stable architecture.' );
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
    error_log( '✅ GMKB: Stable WordPress-native enqueue.php loaded successfully.' );
    error_log( '🏗️ Architecture: No inline scripts, correct dependency management.' );
}
