<?php
/**
 * Architecture Configuration for Media Kit Builder
 * 
 * Controls which architecture mode the plugin runs in.
 * After Phase 5 completion, this should always be 'vue'.
 * 
 * @package Guestify
 * @version 4.0.0
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// ================================================
// ARCHITECTURE MODE CONFIGURATION
// ================================================

/**
 * Architecture Mode Options:
 * - 'vue'    : 100% Vue/Vite architecture (recommended)
 * - 'legacy' : Old jQuery/Vanilla JS architecture (deprecated)
 * - 'hybrid' : Both architectures (dangerous, for migration only)
 */
if ( ! defined( 'GMKB_ARCHITECTURE_MODE' ) ) {
    define( 'GMKB_ARCHITECTURE_MODE', 'vue' );
}

// ================================================
// ARCHITECTURE PATHS
// ================================================

// Vue/Vite paths
define( 'GMKB_VUE_DIST_PATH', GUESTIFY_PLUGIN_DIR . 'dist/' );
define( 'GMKB_VUE_BUNDLE_URL', GUESTIFY_PLUGIN_URL . 'dist/gmkb.iife.js' );
define( 'GMKB_VUE_STYLES_URL', GUESTIFY_PLUGIN_URL . 'dist/style.css' );

// Common paths
define( 'GMKB_CSS_PATH', GUESTIFY_PLUGIN_DIR . 'css/' );
define( 'GMKB_CSS_URL', GUESTIFY_PLUGIN_URL . 'css/' );
define( 'GMKB_COMPONENTS_PATH', GUESTIFY_PLUGIN_DIR . 'components/' );
define( 'GMKB_COMPONENTS_URL', GUESTIFY_PLUGIN_URL . 'components/' );

// Legacy paths (will be removed)
define( 'GMKB_LEGACY_JS_PATH', GUESTIFY_PLUGIN_DIR . 'js-legacy/' );
define( 'GMKB_LEGACY_JS_URL', GUESTIFY_PLUGIN_URL . 'js-legacy/' );

// ================================================
// FEATURE FLAGS
// ================================================

// Vue features
define( 'GMKB_VUE_DEV_MODE', defined( 'WP_DEBUG' ) && WP_DEBUG );
define( 'GMKB_VUE_HMR_ENABLED', false ); // Hot Module Replacement for development

// API features
define( 'GMKB_API_VERSION', 'v1' );
define( 'GMKB_API_NAMESPACE', 'gmkb/v1' );

// Component features
define( 'GMKB_COMPONENTS_CACHE', true );
define( 'GMKB_COMPONENTS_CACHE_TTL', 3600 ); // 1 hour

// ================================================
// COMPATIBILITY CHECKS
// ================================================

/**
 * Check if the environment supports the selected architecture
 */
function gmkb_check_architecture_compatibility() {
    $errors = array();
    
    if ( GMKB_ARCHITECTURE_MODE === 'vue' ) {
        // Check for Vue bundle
        if ( ! file_exists( GMKB_VUE_DIST_PATH . 'gmkb.iife.js' ) ) {
            $errors[] = 'Vue bundle not found. Run: npm run build';
        }
        
        // Check for required PHP version (7.4+)
        if ( version_compare( PHP_VERSION, '7.4.0', '<' ) ) {
            $errors[] = 'Vue mode requires PHP 7.4 or higher';
        }
        
        // Check for REST API availability
        if ( ! function_exists( 'rest_url' ) ) {
            $errors[] = 'WordPress REST API is not available';
        }
    }
    
    if ( GMKB_ARCHITECTURE_MODE === 'legacy' ) {
        // Check for legacy files
        if ( ! is_dir( GMKB_LEGACY_JS_PATH ) ) {
            $errors[] = 'Legacy JavaScript files not found';
        }
    }
    
    return $errors;
}

// Run compatibility check
add_action( 'admin_notices', function() {
    $errors = gmkb_check_architecture_compatibility();
    if ( ! empty( $errors ) ) {
        ?>
        <div class="notice notice-error">
            <p><strong>Media Kit Builder - Architecture Configuration Error</strong></p>
            <ul>
                <?php foreach ( $errors as $error ) : ?>
                    <li><?php echo esc_html( $error ); ?></li>
                <?php endforeach; ?>
            </ul>
            <p>Current architecture mode: <strong><?php echo esc_html( GMKB_ARCHITECTURE_MODE ); ?></strong></p>
        </div>
        <?php
    }
} );

// ================================================
// ARCHITECTURE INFO FOR DEBUGGING
// ================================================

if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
    add_action( 'init', function() {
        error_log( '========================================' );
        error_log( 'GMKB Architecture Configuration' );
        error_log( '========================================' );
        error_log( 'Mode: ' . GMKB_ARCHITECTURE_MODE );
        error_log( 'Vue Bundle: ' . ( file_exists( GMKB_VUE_DIST_PATH . 'gmkb.iife.js' ) ? 'Found' : 'Missing' ) );
        error_log( 'PHP Version: ' . PHP_VERSION );
        error_log( 'WordPress Version: ' . get_bloginfo( 'version' ) );
        error_log( 'REST API: ' . ( function_exists( 'rest_url' ) ? 'Available' : 'Not Available' ) );
        error_log( '========================================' );
    }, 1 );
}