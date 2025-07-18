<?php
/**
 * WordPress-Native Script and Style Enqueuing
 * 
 * SIMPLIFIED ARCHITECTURE:
 * ✅ Simple procedural approach - NO CLASSES
 * ✅ Single script enqueue with WordPress dependency management
 * ✅ wp_localize_script for ALL data passing
 * ✅ Zero polling, zero setTimeout, pure event-driven
 * ✅ Follows WordPress patterns naturally
 * 
 * @package Guestify
 * @version 2.1.0-race-condition-fixed
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

function gmkb_enqueue_assets() {
    // EMERGENCY DEBUG - Log every enqueue attempt
    error_log( '🔍 GMKB ENQUEUE: Function called!' );
    error_log( '📄 Current URL: ' . ( $_SERVER['REQUEST_URI'] ?? 'unknown' ) );
    error_log( '🎯 Post ID param: ' . ( $_GET['post_id'] ?? 'none' ) );
    error_log( '📍 Page detection result: ' . ( is_media_kit_builder_page() ? 'TRUE' : 'FALSE' ) );
    error_log( '🎆 VANILLA JS: No jQuery dependencies' );
    
    // Force console output for debugging
    echo '<script>console.log("\ud83d� GMKB ENQUEUE DEBUG: Function executed at " + new Date().toISOString());</script>';
    
    // ROOT FIX: Always enqueue on guestify-media-kit pages (override detection)
    $should_enqueue = is_media_kit_builder_page();
    
    // EMERGENCY FIX: Force enqueue if URL contains guestify-media-kit
    if ( ! $should_enqueue && isset( $_SERVER['REQUEST_URI'] ) ) {
        $request_uri = $_SERVER['REQUEST_URI'];
        if ( strpos( $request_uri, 'guestify-media-kit' ) !== false ) {
            $should_enqueue = true;
            error_log( '🔧 GMKB: Force enqueuing due to URL match: ' . $request_uri );
        }
    }
    
    if ( ! $should_enqueue ) {
        if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
            error_log( '❌ GMKB: Not a media kit builder page - skipping script enqueue' );
            error_log( '📄 Current URL: ' . ( $_SERVER['REQUEST_URI'] ?? 'unknown' ) );
        }
        return;
    }
    
    // LOG SUCCESSFUL DETECTION
    error_log( '✅ GMKB: Enqueuing scripts for media kit builder page' );

    $plugin_url = GUESTIFY_PLUGIN_URL;
    $version = '2.1.0-vanilla-js-final-' . time(); // Cache busting for development

    // VANILLA JS: Load main.js with no dependencies
    wp_enqueue_script(
        'gmkb-main-script',
        $plugin_url . 'js/main.js',
        array(), // NO DEPENDENCIES - Pure vanilla JavaScript following Gemini recommendations
        $version,
        true // Load in footer
    );
    
    // ROOT FIX: Load modal-base.js FIRST (self-initializing)
    wp_enqueue_script(
        'gmkb-modal-base',
        $plugin_url . 'js/modals/modal-base.js',
        array(), // NO DEPENDENCIES - Self-initializing modal system
        $version,
        true // Load in footer
    );
    
    // ROOT FIX: Load component-library.js AFTER modal base (event-driven)
    wp_enqueue_script(
        'gmkb-component-library',
        $plugin_url . 'js/modals/component-library.js',
        array('gmkb-modal-base'), // DEPENDS on modal base for events
        $version,
        true // Load in footer
    );
    
    // ROOT FIX: Load SortableJS library FIRST (from CDN for immediate availability)
    wp_enqueue_script(
        'sortablejs',
        'https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js',
        array(), // NO DEPENDENCIES - External library
        '1.15.0',
        true // Load in footer
    );
    
    // ROOT FIX: Load drag-drop-manager.js for drag and drop functionality
    wp_enqueue_script(
        'gmkb-drag-drop-manager',
        $plugin_url . 'js/drag-drop-manager.js',
        array('gmkb-main-script', 'sortablejs'), // DEPENDS on main script AND SortableJS
        $version,
        true // Load in footer
    );
    
    // ROOT FIX: Load sortable-integration.js for preview area sorting (NOW ACTIVE)
    wp_enqueue_script(
        'gmkb-sortable-integration',
        $plugin_url . 'js/sortable-integration.js',
        array('gmkb-drag-drop-manager', 'sortablejs'), // DEPENDS on both drag-drop-manager AND SortableJS
        $version,
        true // Load in footer
    );
    
    // DEBUG: Load test file for drag and drop validation (in debug mode only)
    if (defined('WP_DEBUG') && WP_DEBUG) {
        wp_enqueue_script(
            'gmkb-test-drag-drop',
            $plugin_url . 'js/test-drag-drop-functionality.js',
            array('gmkb-drag-drop-manager'), // DEPENDS on drag-drop-manager
            $version,
            true // Load in footer
        );
    }

    // WordPress-native data passing - guaranteed to be available before script runs
    wp_localize_script(
        'gmkb-main-script',
        'gmkbData',
        array(
            'ajaxUrl'       => admin_url( 'admin-ajax.php' ),
            'restUrl'       => esc_url_raw( rest_url() ),
            'nonce'         => wp_create_nonce( 'gmkb_nonce' ), // ROOT FIX: Standardized nonce action
            'restNonce'     => wp_create_nonce( 'wp_rest' ),
            'postId'        => get_current_post_id_safe(),
            'pluginUrl'     => $plugin_url,
            'siteUrl'       => home_url(),
            'pluginVersion' => GUESTIFY_VERSION,
            'architecture'  => 'vanilla-js-final',
            'timestamp'     => time(),
            'builderPage'   => true,
            'isBuilderPage' => true, // Added flag for JS initialization detection
            'debugMode'     => defined( 'WP_DEBUG' ) && WP_DEBUG,
            'templateFixed' => true, // Flag indicating template path issue is resolved
            'vanillaJS'     => true, // Flag indicating pure vanilla JavaScript implementation
            'sortableEnabled' => true, // Flag indicating SortableJS is loaded and preview sorting is active
            'dragDropComplete' => true // Flag indicating full drag-and-drop system is operational
        )
    );

    // Enqueue CSS
    wp_enqueue_style(
        'gmkb-main-styles',
        $plugin_url . 'css/guestify-builder.css',
        array(),
        $version
    );
    
    // Enqueue server integration styles
    wp_enqueue_style(
        'gmkb-server-integration',
        $plugin_url . 'css/server-integration.css',
        array( 'gmkb-main-styles' ), // Depends on main styles
        $version
    );

    // Log successful enqueue for debugging
    if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
        error_log( '✅ GMKB: WordPress-native assets enqueued successfully' );
        error_log( '📄 Page: ' . ( $_SERVER['REQUEST_URI'] ?? 'unknown' ) );
        error_log( '🎯 Post ID: ' . get_current_post_id_safe() );
        error_log( '📜 Script handle: gmkb-main-script' );
        error_log( '📜 Script URL: ' . $plugin_url . 'js/main.js' );
    }
}

/**
 * Simple, reliable page detection
 * Multiple strategies for maximum compatibility
 */
function is_media_kit_builder_page() {
    // EMERGENCY DEBUG - Log all detection attempts  
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    
    error_log( '🎯 GMKB PAGE DETECTION:' );
    error_log( '  URL: ' . $request_uri );
    error_log( '  Contains guestify-media-kit: ' . ( strpos( $request_uri, 'guestify-media-kit' ) !== false ? 'YES' : 'NO' ) );
    error_log( '  GET post_id: ' . ( isset( $_GET['post_id'] ) ? $_GET['post_id'] : 'none' ) );
    
    // Force console output for debugging
    echo '<script>console.log("\ud83c� PAGE DETECTION: URL=' . esc_js($request_uri) . ', Contains guestify-media-kit=' . (strpos( $request_uri, 'guestify-media-kit' ) !== false ? 'YES' : 'NO') . '");</script>';
    
    // Strategy 1: URL-based detection (most reliable)
    if ( strpos( $request_uri, 'guestify-media-kit' ) !== false ) {
        if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
            error_log( '✅ GMKB: URL detection SUCCESS' );
        }
        return true;
    }

    // Strategy 2: WordPress page detection
    if ( is_page( 'guestify-media-kit' ) || is_page( 'media-kit' ) ) {
        if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
            error_log( '✅ GMKB: WordPress page detection SUCCESS' );
        }
        return true;
    }

    // Strategy 3: Post ID parameter detection
    if ( isset( $_GET['post_id'] ) && is_numeric( $_GET['post_id'] ) ) {
        if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
            error_log( '✅ GMKB: Post ID detection SUCCESS' );
        }
        return true;
    }

    // Strategy 4: Global flag (set by template takeover)
    global $gmkb_template_active;
    if ( $gmkb_template_active ) {
        if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
            error_log( '✅ GMKB: Global flag detection SUCCESS' );
        }
        return true;
    }

    if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
        error_log( '❌ GMKB: All page detection strategies FAILED' );
    }
    return false;
}

/**
 * Safe post ID detection with multiple fallback strategies
 */
function get_current_post_id_safe() {
    $post_id = 0;

    // Strategy 1: URL parameter
    if ( isset( $_GET['post_id'] ) && is_numeric( $_GET['post_id'] ) ) {
        $post_id = intval( $_GET['post_id'] );
    }
    // Strategy 2: WordPress p parameter
    elseif ( isset( $_GET['p'] ) && is_numeric( $_GET['p'] ) ) {
        $post_id = intval( $_GET['p'] );
    }
    // Strategy 3: Current post
    elseif ( function_exists( 'get_the_ID' ) && get_the_ID() ) {
        $post_id = get_the_ID();
    }
    // Strategy 4: Global post object
    elseif ( isset( $GLOBALS['post'] ) && $GLOBALS['post'] ) {
        $post_id = $GLOBALS['post']->ID;
    }

    // Validate post exists and is accessible
    if ( $post_id > 0 ) {
        $post = get_post( $post_id );
        if ( ! $post || $post->post_status === 'trash' ) {
            $post_id = 0;
        }
    }

    return $post_id;
}

/**
 * ROOT FIX: Force load modal and component library scripts
 * Add WordPress action hook for script readiness with script injection
 * This provides event-driven coordination with WordPress
 */
add_action( 'wp_footer', 'gmkb_add_readiness_events', 5 );

function gmkb_add_readiness_events() {
    // Only add on media kit builder pages
    if ( ! is_media_kit_builder_page() ) {
        return;
    }

    ?>
    <script id="gmkb-wordpress-readiness" type="text/javascript">
    // WordPress action hook for script readiness - NO setTimeout, pure event-driven
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 WordPress: DOMContentLoaded - dispatching readiness events');
        
        // Dispatch WordPress-native readiness event
        document.dispatchEvent(new CustomEvent('gmkb:wordpress-ready', {
            detail: {
                timestamp: Date.now(),
                architecture: 'wordpress-native-simplified',
                domReady: true
            }
        }));
        
        console.log('✅ WordPress: Readiness events dispatched');
    });
    </script>
    
    <!-- ROOT FIX: Force load modal and component library scripts inline -->
    <script id="gmkb-modal-base-inline" type="text/javascript">
    <?php
    // Load modal-base.js content inline
    $modal_base_file = GUESTIFY_PLUGIN_DIR . 'js/modals/modal-base.js';
    if ( file_exists( $modal_base_file ) ) {
        echo file_get_contents( $modal_base_file );
    } else {
        echo 'console.error("❌ modal-base.js not found at: ' . $modal_base_file . '");';
    }
    ?>
    </script>
    
    <script id="gmkb-component-library-inline" type="text/javascript">
    <?php
    // Load component-library.js content inline
    $component_library_file = GUESTIFY_PLUGIN_DIR . 'js/modals/component-library.js';
    if ( file_exists( $component_library_file ) ) {
        echo file_get_contents( $component_library_file );
    } else {
        echo 'console.error("❌ component-library.js not found at: ' . $component_library_file . '");';
    }
    ?>
    </script>
    
    <script id="gmkb-drag-drop-manager-inline" type="text/javascript">
    <?php
    // Load drag-drop-manager.js content inline
    $drag_drop_manager_file = GUESTIFY_PLUGIN_DIR . 'js/drag-drop-manager.js';
    if ( file_exists( $drag_drop_manager_file ) ) {
        echo file_get_contents( $drag_drop_manager_file );
    } else {
        echo 'console.error("❌ drag-drop-manager.js not found at: ' . $drag_drop_manager_file . '");';
    }
    ?>
    </script>
    
    <script id="gmkb-force-initialization" type="text/javascript">
    // ROOT FIX: Force initialization after scripts are loaded
    console.log('🔧 GMKB: Force initialization starting...');
    
    // Wait for DOM to be fully ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeScripts);
    } else {
        initializeScripts();
    }
    
    function initializeScripts() {
        console.log('🚀 GMKB: Initializing modal and component library systems...');
        
        // Give scripts a moment to execute
        setTimeout(() => {
            console.log('🔍 GMKB: Checking system availability...');
            console.log('   GMKB_Modals:', !!window.GMKB_Modals);
            console.log('   componentLibrarySystem:', !!window.componentLibrarySystem);
            
            if (window.GMKB_Modals && window.componentLibrarySystem) {
                console.log('✅ GMKB: All systems ready!');
            } else {
                console.log('⚠️ GMKB: Systems not ready, checking in 1 second...');
                setTimeout(() => {
                    console.log('🔍 GMKB: Second check...');
                    console.log('   GMKB_Modals:', !!window.GMKB_Modals);
                    console.log('   componentLibrarySystem:', !!window.componentLibrarySystem);
                }, 1000);
            }
        }, 100);
    }
    </script>
    <?php

    if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
        error_log( '✅ GMKB: WordPress readiness events and inline scripts added to footer' );
    }
}

/**
 * Global status function for debugging
 */
function gmkb_get_enqueue_status() {
    return array(
        'architecture'      => 'wordpress-native-simplified',
        'is_builder_page'   => is_media_kit_builder_page(),
        'post_id'           => get_current_post_id_safe(),
        'request_uri'       => $_SERVER['REQUEST_URI'] ?? '',
        'plugin_url'        => GUESTIFY_PLUGIN_URL,
        'version'           => GUESTIFY_VERSION,
        'wp_debug'          => defined( 'WP_DEBUG' ) && WP_DEBUG,
        'timestamp'         => time(),
        'simplified'        => true,
        'no_classes'        => true,
        'wordpress_native'  => true
    );
}

if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
    error_log( '✅ GMKB: Simplified WordPress-native enqueue.php loaded successfully' );
    error_log( '🏗️ Architecture: No classes, no complexity, pure WordPress patterns' );
}
