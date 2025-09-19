<?php
/**
 * ARCHITECTURE-SEPARATED Enqueue System
 * Clean separation between Vue/Vite and Legacy systems
 * 
 * @package Guestify
 * @version 3.0.0-separated
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// ================================================
// LOAD ARCHITECTURE CONFIGURATION
// ================================================
require_once GUESTIFY_PLUGIN_DIR . 'includes/architecture-config.php';

// ================================================
// MAIN ENQUEUE FUNCTION
// ================================================
add_action( 'wp_enqueue_scripts', 'gmkb_enqueue_separated_assets', 20 );
add_action( 'admin_enqueue_scripts', 'gmkb_enqueue_separated_assets', 20 );

function gmkb_enqueue_separated_assets() {
    // Check if this is a media kit builder page
    if ( ! is_media_kit_builder_page() ) {
        return;
    }
    
    // Prevent double execution
    static $assets_enqueued = false;
    if ( $assets_enqueued ) {
        return;
    }
    $assets_enqueued = true;
    
    // Log architecture mode
    if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
        error_log( '🏗️ GMKB Loading with architecture: ' . GMKB_ARCHITECTURE_MODE );
    }
    
    // Route to appropriate enqueue function
    switch ( GMKB_ARCHITECTURE_MODE ) {
        case 'vue':
            gmkb_enqueue_vue_assets();
            break;
            
        case 'legacy':
            gmkb_enqueue_legacy_assets();
            break;
            
        case 'hybrid':
            // Dangerous! Load both
            gmkb_enqueue_vue_assets();
            gmkb_enqueue_legacy_assets();
            gmkb_enqueue_conflict_resolver();
            break;
            
        default:
            error_log( 'GMKB ERROR: Invalid architecture mode: ' . GMKB_ARCHITECTURE_MODE );
    }
}

// ================================================
// VUE/VITE ASSET LOADER
// ================================================
function gmkb_enqueue_vue_assets() {
    $plugin_url = GUESTIFY_PLUGIN_URL;
    $version = '3.0.0-vue-' . time();
    $post_id = get_current_post_id_safe();
    
    if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
        error_log( '🚀 Loading Vue/Vite architecture' );
    }
    
    // Check if bundle exists
    if ( ! file_exists( GMKB_VUE_DIST_PATH . 'gmkb.iife.js' ) ) {
        error_log( '❌ GMKB ERROR: Vue bundle not found! Run: npm run build' );
        gmkb_show_bundle_missing_notice();
        return;
    }
    
    // Load Vue bundle data
    $bundle_data = gmkb_prepare_vue_data( $post_id );
    
    // Enqueue the lean bundle
    wp_enqueue_script(
        'gmkb-vue-bundle',
        GMKB_VUE_BUNDLE_URL,
        array(), // No dependencies - it's self-contained
        filemtime( GMKB_VUE_DIST_PATH . 'gmkb.iife.js' ),
        true
    );
    
    // ROOT FIX: Component library bridge for event-driven connection
    wp_enqueue_script(
        'gmkb-component-library-bridge',
        $plugin_url . 'js/component-library-bridge.js',
        array( 'gmkb-vue-bundle' ),
        $version,
        true
    );
    
    // ROOT FIX: Legacy modal cleanup - ensures only Vue component library is used
    wp_enqueue_script(
        'gmkb-legacy-modal-cleanup',
        $plugin_url . 'js/legacy-modal-cleanup.js',
        array( 'gmkb-vue-bundle' ),
        $version,
        true
    );
    
    // Localize data for Vue
    wp_localize_script( 'gmkb-vue-bundle', 'gmkbVueData', $bundle_data );
    
    // ROOT FIX: Also make data available as gmkbData for component compatibility
    wp_add_inline_script( 
        'gmkb-vue-bundle', 
        'window.gmkbData = window.gmkbVueData;', 
        'before' 
    );
    
    // Vue-specific styles
    gmkb_enqueue_vue_styles();
    
    // Development tools
    if ( GMKB_VUE_DEV_MODE ) {
        wp_enqueue_script(
            'vue-devtools',
            'https://unpkg.com/@vue/devtools@6.5.0/dist/backend.js',
            array( 'gmkb-vue-bundle' ),
            '6.5.0',
            true
        );
    }
    
    if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
        error_log( '✅ Vue/Vite assets loaded successfully' );
    }
}

// ================================================
// LEGACY ASSET LOADER
// ================================================
function gmkb_enqueue_legacy_assets() {
    $plugin_url = GUESTIFY_PLUGIN_URL;
    $version = '2.0.0-legacy-' . time();
    $post_id = get_current_post_id_safe();
    
    if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
        error_log( '🔧 Loading Legacy architecture' );
    }
    
    // Check if legacy files exist
    if ( ! is_dir( GMKB_LEGACY_JS_PATH ) ) {
        error_log( '❌ GMKB ERROR: Legacy files not found! Run: separate-architectures.bat' );
        gmkb_show_legacy_missing_notice();
        return;
    }
    
    // Load legacy data
    $legacy_data = gmkb_prepare_legacy_data( $post_id );
    
    // Load all legacy scripts (from js-legacy directory)
    gmkb_enqueue_legacy_scripts();
    
    // Localize data for legacy
    wp_localize_script( 'gmkb-legacy-main', 'gmkbLegacyData', $legacy_data );
    
    // Legacy styles
    gmkb_enqueue_legacy_styles();
    
    if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
        error_log( '✅ Legacy assets loaded (60+ files)' );
    }
}

// ================================================
// VUE STYLES
// ================================================
function gmkb_enqueue_vue_styles() {
    $plugin_url = GUESTIFY_PLUGIN_URL;
    $version = '3.0.0';
    
    // Main Vue app styles
    wp_enqueue_style(
        'gmkb-vue-styles',
        $plugin_url . 'dist/style.css',
        array(),
        $version
    );
    
    // Shared styles (work with both architectures)
    wp_enqueue_style(
        'gmkb-shared-styles',
        GMKB_CSS_URL . 'shared.css',
        array(),
        $version
    );
    
    // Theme variables
    wp_enqueue_style(
        'gmkb-theme-variables',
        GMKB_CSS_URL . 'theme-variables.css',
        array(),
        $version
    );
    
    // Component library CSS
    wp_enqueue_style(
        'gmkb-component-library',
        GMKB_CSS_URL . 'component-library.css',
        array(),
        $version
    );
    
    // Modal CSS
    wp_enqueue_style(
        'gmkb-modals',
        GMKB_CSS_URL . 'modules/modals.css',
        array(),
        $version
    );
}

// ================================================
// LEGACY STYLES
// ================================================
function gmkb_enqueue_legacy_styles() {
    $plugin_url = GUESTIFY_PLUGIN_URL;
    $version = '2.0.0';
    
    // Legacy builder styles
    wp_enqueue_style(
        'gmkb-legacy-builder',
        GMKB_CSS_URL . 'guestify-builder.css',
        array(),
        $version
    );
    
    // Legacy component styles
    wp_enqueue_style(
        'gmkb-legacy-components',
        GMKB_CSS_URL . 'components.css',
        array(),
        $version
    );
    
    // Shared styles
    wp_enqueue_style(
        'gmkb-shared-styles',
        GMKB_CSS_URL . 'shared.css',
        array(),
        $version
    );
}

// ================================================
// LEGACY SCRIPTS LOADER
// ================================================
function gmkb_enqueue_legacy_scripts() {
    $base_url = GMKB_LEGACY_JS_URL;
    $version = '2.0.0-legacy';
    
    // This would load all 60+ legacy scripts
    // Simplified for example - in reality, this would be the full list
    $legacy_scripts = array(
        'structured-logger' => 'utils/structured-logger.js',
        'enhanced-state-manager' => 'core/enhanced-state-manager-simple.js',
        'component-controls-manager' => 'core/component-controls-manager.js',
        'enhanced-component-renderer' => 'core/enhanced-component-renderer-simplified.js',
        // ... 50+ more scripts
    );
    
    $prev = array();
    foreach ( $legacy_scripts as $handle => $path ) {
        wp_enqueue_script(
            'gmkb-legacy-' . $handle,
            $base_url . $path,
            $prev,
            $version,
            true
        );
        $prev[] = 'gmkb-legacy-' . $handle;
    }
    
    // Main legacy entry point
    wp_enqueue_script(
        'gmkb-legacy-main',
        $base_url . 'main.js',
        $prev,
        $version,
        true
    );
}

// ================================================
// CONFLICT RESOLVER (Hybrid Mode Only)
// ================================================
function gmkb_enqueue_conflict_resolver() {
    wp_add_inline_script(
        'gmkb-vue-bundle',
        '
        console.warn("⚠️ GMKB Running in HYBRID mode - conflicts possible!");
        
        // Namespace isolation
        window.gmkbVue = window.GMKB || {};
        window.gmkbLegacy = {};
        
        // Prevent cross-contamination
        (function() {
            const vueGlobals = ["Vue", "createApp", "gmkbApp", "gmkbPinia"];
            const legacyGlobals = ["enhancedStateManager", "componentControlsManager"];
            
            vueGlobals.forEach(name => {
                if (window[name]) {
                    window.gmkbVue[name] = window[name];
                }
            });
            
            legacyGlobals.forEach(name => {
                if (window[name]) {
                    window.gmkbLegacy[name] = window[name];
                    delete window[name]; // Remove from global scope
                }
            });
        })();
        ',
        'before'
    );
}

// ================================================
// DATA PREPARATION
// ================================================
function gmkb_prepare_vue_data( $post_id ) {
    // Prepare clean data for Vue
    $data = array(
        'ajaxUrl' => admin_url( 'admin-ajax.php' ),
        'ajax_url' => admin_url( 'admin-ajax.php' ), // Also provide snake_case version
        'ajaxurl' => admin_url( 'admin-ajax.php' ), // And lowercase version for compatibility
        'restUrl' => rest_url(),
        'nonce' => wp_create_nonce( 'gmkb_nonce' ), // Use gmkb_nonce for consistency with AJAX handlers
        'postId' => $post_id,
        'post_id' => $post_id, // Also provide snake_case version
        'architecture' => 'vue',
        'version' => '3.0.0',
        'components' => gmkb_get_component_definitions(),
        'themes' => gmkb_get_theme_definitions(),
        'savedState' => gmkb_get_saved_state( $post_id ),
        'podsData' => gmkb_get_pods_data( $post_id ),
        'pods_data' => gmkb_get_pods_data( $post_id ), // Also provide snake_case version
    );
    
    return apply_filters( 'gmkb_vue_data', $data );
}

function gmkb_prepare_legacy_data( $post_id ) {
    // Prepare data for legacy system
    $data = array(
        'ajaxUrl' => admin_url( 'admin-ajax.php' ),
        'nonce' => wp_create_nonce( 'gmkb_legacy_nonce' ),
        'postId' => $post_id,
        'post_id' => $post_id, // Legacy uses snake_case
        'architecture' => 'legacy',
        'version' => '2.0.0',
        'components' => gmkb_get_component_definitions(),
        'saved_components' => gmkb_get_saved_components( $post_id ),
        'saved_state' => gmkb_get_saved_state( $post_id ),
        'pods_data' => gmkb_get_pods_data( $post_id ),
    );
    
    return apply_filters( 'gmkb_legacy_data', $data );
}

// ================================================
// ERROR NOTICES
// ================================================
function gmkb_show_bundle_missing_notice() {
    ?>
    <div class="notice notice-error">
        <h2>Media Kit Builder - Vue Bundle Missing</h2>
        <p>The Vue bundle has not been built yet. Please run:</p>
        <pre>npm run build</pre>
        <p>Or use the batch file:</p>
        <pre>rebuild-lean-bundle.bat</pre>
    </div>
    <?php
}

function gmkb_show_legacy_missing_notice() {
    ?>
    <div class="notice notice-error">
        <h2>Media Kit Builder - Legacy Files Missing</h2>
        <p>Legacy JavaScript files not found. Please run:</p>
        <pre>separate-architectures.bat</pre>
        <p>Or switch to Vue mode in architecture-config.php</p>
    </div>
    <?php
}

// ================================================
// HELPER FUNCTIONS (from original enqueue.php)
// ================================================
function is_media_kit_builder_page() {
    // Your existing detection logic
    return true; // Simplified for example
}

function get_current_post_id_safe() {
    // Your existing post ID logic
    return isset( $_GET['mkcg_id'] ) ? intval( $_GET['mkcg_id'] ) : 0;
}

function gmkb_get_component_definitions() {
    // ROOT FIX: Use ComponentDiscovery to get components from self-contained directories
    if ( ! class_exists( 'ComponentDiscovery' ) ) {
        require_once GUESTIFY_PLUGIN_DIR . 'system/ComponentDiscovery.php';
    }
    
    $component_discovery = new ComponentDiscovery( GUESTIFY_PLUGIN_DIR . 'components' );
    $component_discovery->scan( false ); // Use cache if available
    $components = $component_discovery->getComponents();
    
    // Transform for JavaScript consumption
    $js_components = array();
    foreach ( $components as $type => $component ) {
        // Each component's data comes from its self-contained component.json
        $js_components[] = array(
            'type' => $type,
            'name' => $component['name'] ?? ucfirst( str_replace( '-', ' ', $type ) ),
            'title' => $component['title'] ?? $component['name'] ?? ucfirst( str_replace( '-', ' ', $type ) ),
            'description' => $component['description'] ?? '',
            'category' => $component['category'] ?? 'general',
            'icon' => $component['icon'] ?? '',
            'isPremium' => $component['isPremium'] ?? false,
        );
    }
    
    if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
        error_log( 'GMKB: ComponentDiscovery found ' . count( $js_components ) . ' components' );
    }
    
    return $js_components;
}

function gmkb_get_theme_definitions() {
    // ROOT FIX: Use ThemeDiscovery to get themes from self-contained directories
    if ( ! class_exists( 'ThemeDiscovery' ) ) {
        if ( file_exists( GUESTIFY_PLUGIN_DIR . 'system/ThemeDiscovery.php' ) ) {
            require_once GUESTIFY_PLUGIN_DIR . 'system/ThemeDiscovery.php';
        } else {
            // ThemeDiscovery might not exist yet
            return array();
        }
    }
    
    $theme_discovery = new ThemeDiscovery( GUESTIFY_PLUGIN_DIR . 'themes' );
    $themes = $theme_discovery->getThemes();
    
    // Transform for JavaScript consumption
    $js_themes = array();
    foreach ( $themes as $slug => $theme ) {
        // Each theme's data comes from its self-contained theme.json
        $js_themes[] = array(
            'slug' => $slug,
            'name' => $theme['name'] ?? ucfirst( str_replace( '-', ' ', $slug ) ),
            'description' => $theme['description'] ?? '',
            'colors' => $theme['colors'] ?? array(),
            'fonts' => $theme['fonts'] ?? array(),
        );
    }
    
    if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
        error_log( 'GMKB: ThemeDiscovery found ' . count( $js_themes ) . ' themes' );
    }
    
    return $js_themes;
}

function gmkb_get_saved_state( $post_id ) {
    // Your existing saved state logic
    return get_post_meta( $post_id, 'gmkb_media_kit_state', true );
}

function gmkb_get_saved_components( $post_id ) {
    // Legacy format for components
    $state = gmkb_get_saved_state( $post_id );
    return isset( $state['saved_components'] ) ? $state['saved_components'] : array();
}

function gmkb_get_pods_data( $post_id ) {
    // ROOT FIX: Load actual Pods data for JavaScript components
    if ( ! $post_id || $post_id <= 0 ) {
        return array();
    }
    
    $pods_data = array();
    
    // Biography fields
    $pods_data['guest_biography'] = get_post_meta( $post_id, 'guest_biography', true );
    $pods_data['biography'] = get_post_meta( $post_id, 'biography', true );
    $pods_data['Biography'] = get_post_meta( $post_id, 'Biography', true );
    $pods_data['bio'] = get_post_meta( $post_id, 'bio', true );
    $pods_data['biography_short'] = get_post_meta( $post_id, 'biography_short', true );
    $pods_data['professional_bio'] = get_post_meta( $post_id, 'professional_bio', true );
    
    // Guest info fields
    $pods_data['first_name'] = get_post_meta( $post_id, 'first_name', true );
    $pods_data['last_name'] = get_post_meta( $post_id, 'last_name', true );
    $pods_data['guest_title'] = get_post_meta( $post_id, 'guest_title', true );
    $pods_data['tagline'] = get_post_meta( $post_id, 'tagline', true );
    $pods_data['company'] = get_post_meta( $post_id, 'company', true );
    $pods_data['introduction'] = get_post_meta( $post_id, 'introduction', true );
    
    // Topics fields (topic_1 through topic_5)
    for ( $i = 1; $i <= 5; $i++ ) {
        $field_key = "topic_{$i}";
        $pods_data[ $field_key ] = get_post_meta( $post_id, $field_key, true );
    }
    
    // Questions fields (question_1 through question_25)
    for ( $i = 1; $i <= 25; $i++ ) {
        $field_key = "question_{$i}";
        $pods_data[ $field_key ] = get_post_meta( $post_id, $field_key, true );
    }
    
    // Contact fields
    $pods_data['email'] = get_post_meta( $post_id, 'email', true );
    $pods_data['phone'] = get_post_meta( $post_id, 'phone', true );
    $pods_data['website'] = get_post_meta( $post_id, 'website', true );
    $pods_data['linkedin'] = get_post_meta( $post_id, 'linkedin', true );
    $pods_data['twitter'] = get_post_meta( $post_id, 'twitter', true );
    $pods_data['facebook'] = get_post_meta( $post_id, 'facebook', true );
    $pods_data['instagram'] = get_post_meta( $post_id, 'instagram', true );
    
    // Other useful fields
    $pods_data['guest_headshot'] = get_post_meta( $post_id, 'guest_headshot', true );
    $pods_data['credentials'] = get_post_meta( $post_id, 'credentials', true );
    $pods_data['achievements'] = get_post_meta( $post_id, 'achievements', true );
    
    // Clean up empty values
    $pods_data = array_filter( $pods_data, function( $value ) {
        return ! empty( $value );
    });
    
    if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
        $field_count = count( $pods_data );
        error_log( "GMKB: Loaded {$field_count} Pods fields for post {$post_id}" );
        if ( isset( $pods_data['biography'] ) ) {
            error_log( "GMKB: Biography field loaded with " . strlen( $pods_data['biography'] ) . " characters" );
        }
        if ( isset( $pods_data['guest_biography'] ) ) {
            error_log( "GMKB: Guest biography field loaded with " . strlen( $pods_data['guest_biography'] ) . " characters" );
        }
    }
    
    return $pods_data;
}