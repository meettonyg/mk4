<?php
/**
 * ARCHITECTURE SEPARATION CONFIGURATION
 * Controls which system loads: Vue/Vite (modern) or Legacy
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// ================================================
// MASTER SWITCH - CHANGE THIS TO CONTROL SYSTEM
// ================================================

/**
 * System Architecture Modes:
 * 'vue'    - Pure Vue 3 + Pinia (PRODUCTION READY)
 * 
 * Legacy and hybrid modes have been removed in v4.0.0
 * This ensures a clean, maintainable codebase
 */
define( 'GMKB_ARCHITECTURE_MODE', 'vue' );
define( 'GMKB_FORCE_PURE_VUE', true );

// ================================================
// FEATURE FLAGS FOR EACH ARCHITECTURE
// ================================================

if ( GMKB_ARCHITECTURE_MODE === 'vue' ) {
    // Vue/Vite Configuration
    define( 'GMKB_USE_LEAN_BUNDLE', true );
    define( 'GMKB_LOAD_LEGACY_SCRIPTS', false );
    define( 'GMKB_VUE_DEV_MODE', false ); // Set to true for Vue DevTools
    define( 'GMKB_HOT_MODULE_REPLACEMENT', false ); // For Vite HMR in dev
    
} elseif ( GMKB_ARCHITECTURE_MODE === 'legacy' ) {
    // Legacy Configuration
    define( 'GMKB_USE_LEAN_BUNDLE', false );
    define( 'GMKB_LOAD_LEGACY_SCRIPTS', true );
    define( 'GMKB_VUE_DEV_MODE', false );
    define( 'GMKB_HOT_MODULE_REPLACEMENT', false );
    
} elseif ( GMKB_ARCHITECTURE_MODE === 'hybrid' ) {
    // Hybrid Mode - DEBUGGING ONLY!
    define( 'GMKB_USE_LEAN_BUNDLE', true );
    define( 'GMKB_LOAD_LEGACY_SCRIPTS', true );
    define( 'GMKB_VUE_DEV_MODE', true );
    define( 'GMKB_HOT_MODULE_REPLACEMENT', false );
    
    // Show warning in admin
    add_action( 'admin_notices', function() {
        echo '<div class="notice notice-warning"><p><strong>GMKB Warning:</strong> Running in HYBRID mode - both Vue and Legacy systems active. This may cause conflicts!</p></div>';
    });
}

// ================================================
// PATH CONFIGURATION
// ================================================

// Vue/Modern paths
define( 'GMKB_VUE_SRC_PATH', GUESTIFY_PLUGIN_DIR . 'src/' );
define( 'GMKB_VUE_DIST_PATH', GUESTIFY_PLUGIN_DIR . 'dist/' );
define( 'GMKB_VUE_BUNDLE_URL', GUESTIFY_PLUGIN_URL . 'dist/gmkb.iife.js' );

// Legacy paths  
define( 'GMKB_LEGACY_JS_PATH', GUESTIFY_PLUGIN_DIR . 'js-legacy/' );
define( 'GMKB_LEGACY_JS_URL', GUESTIFY_PLUGIN_URL . 'js-legacy/' );

// Shared resources (works with both)
define( 'GMKB_COMPONENTS_PATH', GUESTIFY_PLUGIN_DIR . 'components/' );
define( 'GMKB_THEMES_PATH', GUESTIFY_PLUGIN_DIR . 'themes/' );
define( 'GMKB_CSS_URL', GUESTIFY_PLUGIN_URL . 'css/' );

// ================================================
// DEBUG CONFIGURATION
// ================================================

if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
    // Log which architecture is active
    error_log( '🏗️ GMKB Architecture Mode: ' . GMKB_ARCHITECTURE_MODE );
    error_log( '📦 Lean Bundle: ' . ( GMKB_USE_LEAN_BUNDLE ? 'ENABLED' : 'DISABLED' ) );
    error_log( '🔧 Legacy Scripts: ' . ( GMKB_LOAD_LEGACY_SCRIPTS ? 'ENABLED' : 'DISABLED' ) );
}

// ================================================
// NAMESPACE ISOLATION
// ================================================

/**
 * Prevent namespace conflicts by prefixing based on architecture
 */
function gmkb_get_namespace_prefix() {
    if ( GMKB_ARCHITECTURE_MODE === 'vue' ) {
        return 'gmkbVue';
    } elseif ( GMKB_ARCHITECTURE_MODE === 'legacy' ) {
        return 'gmkbLegacy';
    } else {
        return 'gmkbHybrid';
    }
}

// ================================================
// CONDITIONAL LOADING HELPER
// ================================================

/**
 * Check if a feature should load based on architecture
 */
function gmkb_should_load_feature( $feature ) {
    $vue_features = array(
        'vue-app',
        'pinia-store',
        'vue-components',
        'vite-hmr'
    );
    
    $legacy_features = array(
        'enhanced-state-manager',
        'component-controls-manager',
        'section-layout-manager',
        'theme-manager'
    );
    
    if ( GMKB_ARCHITECTURE_MODE === 'vue' ) {
        return in_array( $feature, $vue_features );
    } elseif ( GMKB_ARCHITECTURE_MODE === 'legacy' ) {
        return in_array( $feature, $legacy_features );
    } else {
        // Hybrid mode - load everything (dangerous!)
        return true;
    }
}
