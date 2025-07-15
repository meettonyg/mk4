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
    // Simple, robust page detection
    if ( ! is_media_kit_builder_page() ) {
        if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
            error_log( '❌ GMKB: Not a media kit builder page - skipping script enqueue' );
            error_log( '📄 Current URL: ' . ( $_SERVER['REQUEST_URI'] ?? 'unknown' ) );
        }
        return;
    }

    $plugin_url = GUESTIFY_PLUGIN_URL;
    $version = '2.1.0-race-condition-fixed-' . time(); // Cache busting for development

    // Single script enqueue - WordPress handles dependency management
    wp_enqueue_script(
        'gmkb-main-script',
        $plugin_url . 'js/main.js',
        array( 'jquery' ), // Simple dependency - let WordPress manage it
        $version,
        true // Load in footer
    );

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
            'pluginVersion' => GUESTIFY_VERSION,
            'architecture'  => 'wordpress-native-simplified',
            'timestamp'     => time(),
            'builderPage'   => true,
            'isBuilderPage' => true, // Added flag for JS initialization detection
            'debugMode'     => defined( 'WP_DEBUG' ) && WP_DEBUG,
            'templateFixed' => true // Flag indicating template path issue is resolved
        )
    );

    // Enqueue CSS
    wp_enqueue_style(
        'gmkb-main-styles',
        $plugin_url . 'css/guestify-builder.css',
        array(),
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
    // Strategy 1: URL-based detection (most reliable)
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
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
    if ( $gmkb_template_active ) {
        return true;
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
 * Add WordPress action hook for script readiness
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
    <?php

    if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
        error_log( '✅ GMKB: WordPress readiness events added to footer' );
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
