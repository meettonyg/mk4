<?php
/**
 * Vue-Only Enqueue System
 * Clean, simple asset loading for 100% Vue architecture
 * 
 * @package Guestify
 * @version 4.0.0-vue-only
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// ================================================
// MAIN ENQUEUE FUNCTION - VUE ONLY
// ================================================
add_action( 'wp_enqueue_scripts', 'gmkb_enqueue_vue_only_assets', 20 );
add_action( 'admin_enqueue_scripts', 'gmkb_enqueue_vue_only_assets', 20 );

function gmkb_enqueue_vue_only_assets() {
    // Check if this is a media kit builder page
    if ( ! gmkb_is_builder_page() ) {
        return;
    }
    
    // Prevent double execution
    static $assets_enqueued = false;
    if ( $assets_enqueued ) {
        return;
    }
    $assets_enqueued = true;
    
    $post_id = gmkb_get_post_id();
    
    if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
        error_log( '🚀 GMKB: Loading 100% Vue architecture' );
        error_log( '📦 GMKB: Post ID: ' . $post_id );
    }
    
    // Check if Vue bundle exists
    $bundle_path = GUESTIFY_PLUGIN_DIR . 'dist/gmkb.iife.js';
    if ( ! file_exists( $bundle_path ) ) {
        gmkb_show_build_notice();
        return;
    }
    
    // ================================================
    // ENQUEUE VUE BUNDLE
    // ================================================
    wp_enqueue_script(
        'gmkb-vue-bundle',
        GUESTIFY_PLUGIN_URL . 'dist/gmkb.iife.js',
        array(), // No dependencies - it's self-contained
        filemtime( $bundle_path ),
        true
    );
    
    // ================================================
    // PREPARE AND LOCALIZE DATA
    // ================================================
    $vue_data = gmkb_prepare_vue_data( $post_id );
    wp_localize_script( 'gmkb-vue-bundle', 'gmkbData', $vue_data );
    
    // ================================================
    // ENQUEUE STYLES
    // ================================================
    
    // Main Vue styles
    if ( file_exists( GUESTIFY_PLUGIN_DIR . 'dist/style.css' ) ) {
        wp_enqueue_style(
            'gmkb-vue-styles',
            GUESTIFY_PLUGIN_URL . 'dist/style.css',
            array(),
            filemtime( GUESTIFY_PLUGIN_DIR . 'dist/style.css' )
        );
    }
    
    // Theme variables (if needed)
    if ( file_exists( GUESTIFY_PLUGIN_DIR . 'css/theme-variables.css' ) ) {
        wp_enqueue_style(
            'gmkb-theme-variables',
            GUESTIFY_PLUGIN_URL . 'css/theme-variables.css',
            array( 'gmkb-vue-styles' ),
            filemtime( GUESTIFY_PLUGIN_DIR . 'css/theme-variables.css' )
        );
    }
    
    // ================================================
    // DEVELOPMENT MODE
    // ================================================
    if ( defined( 'WP_DEBUG' ) && WP_DEBUG && defined( 'GMKB_DEV_MODE' ) && GMKB_DEV_MODE ) {
        // Add Vue DevTools
        wp_add_inline_script(
            'gmkb-vue-bundle',
            'window.__VUE_PROD_DEVTOOLS__ = true;',
            'before'
        );
        
        // Add development indicator
        wp_add_inline_style(
            'gmkb-vue-styles',
            '
            body::before {
                content: "VUE DEV MODE";
                position: fixed;
                top: 32px;
                right: 10px;
                background: #42b883;
                color: white;
                padding: 5px 10px;
                border-radius: 3px;
                font-size: 11px;
                font-weight: bold;
                z-index: 99999;
                pointer-events: none;
            }
            '
        );
    }
    
    if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
        error_log( '✅ GMKB: Vue assets loaded successfully' );
        error_log( '📊 GMKB: Bundle size: ' . number_format( filesize( $bundle_path ) / 1024, 2 ) . ' KB' );
    }
}

// ================================================
// DATA PREPARATION FOR VUE
// ================================================
function gmkb_prepare_vue_data( $post_id ) {
    $data = array(
        // ============================================
        // API Configuration
        // ============================================
        'api' => array(
            'root' => rest_url( 'gmkb/v1/' ),
            'nonce' => wp_create_nonce( 'wp_rest' ),
            'namespace' => 'gmkb/v1'
        ),
        
        // Legacy support (will be removed in next version)
        'ajaxUrl' => admin_url( 'admin-ajax.php' ),
        'ajaxNonce' => wp_create_nonce( 'gmkb_nonce' ),
        
        // ============================================
        // Post & User Data
        // ============================================
        'post' => array(
            'id' => $post_id,
            'type' => $post_id ? get_post_type( $post_id ) : '',
            'title' => $post_id ? get_the_title( $post_id ) : '',
            'status' => $post_id ? get_post_status( $post_id ) : '',
        ),
        
        'user' => array(
            'id' => get_current_user_id(),
            'canEdit' => current_user_can( 'edit_posts' ),
            'canPublish' => current_user_can( 'publish_posts' ),
        ),
        
        // ============================================
        // Plugin Configuration
        // ============================================
        'config' => array(
            'pluginUrl' => GUESTIFY_PLUGIN_URL,
            'pluginVersion' => defined( 'GMKB_VERSION' ) ? GMKB_VERSION : '4.0.0',
            'siteUrl' => home_url(),
            'adminUrl' => admin_url(),
            'isRTL' => is_rtl(),
            'locale' => get_locale(),
            'dateFormat' => get_option( 'date_format' ),
            'timeFormat' => get_option( 'time_format' ),
        ),
        
        // ============================================
        // Components & Themes
        // ============================================
        'components' => gmkb_get_components_for_vue(),
        'themes' => gmkb_get_themes_for_vue(),
        
        // ============================================
        // Initial State & Data
        // ============================================
        'initialState' => gmkb_get_initial_state( $post_id ),
        'podsData' => gmkb_get_pods_data_for_vue( $post_id ),
        
        // ============================================
        // Feature Flags
        // ============================================
        'features' => array(
            'autoSave' => true,
            'autoSaveInterval' => 30000, // 30 seconds
            'maxFileSize' => 5 * 1024 * 1024, // 5MB
            'allowedFileTypes' => array( 'jpg', 'jpeg', 'png', 'gif', 'svg' ),
            'enableVersioning' => true,
            'enableTemplates' => true,
            'enableThemes' => true,
            'enableExport' => true,
            'enableImport' => true,
        ),
        
        // ============================================
        // Debug Information
        // ============================================
        'debug' => defined( 'WP_DEBUG' ) && WP_DEBUG ? array(
            'mode' => true,
            'timestamp' => time(),
            'memory' => memory_get_usage( true ),
            'phpVersion' => PHP_VERSION,
            'wpVersion' => get_bloginfo( 'version' ),
        ) : false,
    );
    
    // Allow filtering
    return apply_filters( 'gmkb_vue_data', $data, $post_id );
}

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Check if current page is a media kit builder page
 */
function gmkb_is_builder_page() {
    global $gmkb_template_active;
    
    // Quick check for global flag
    if ( $gmkb_template_active === true ) {
        return true;
    }
    
    // Check various conditions
    if ( is_page( 'media-kit' ) || is_page( 'guestify-media-kit' ) ) {
        return true;
    }
    
    if ( isset( $_SERVER['REQUEST_URI'] ) ) {
        $uri = $_SERVER['REQUEST_URI'];
        if ( preg_match( '#/tools/media-kit/?($|\?)#', $uri ) ) {
            return true;
        }
    }
    
    if ( isset( $_GET['mkcg_id'] ) && is_numeric( $_GET['mkcg_id'] ) ) {
        return true;
    }
    
    if ( is_admin() && isset( $_GET['page'] ) && $_GET['page'] === 'guestify-media-kit-builder' ) {
        return true;
    }
    
    return false;
}

/**
 * Get current post ID from various sources
 */
function gmkb_get_post_id() {
    // Try URL parameters first
    $params = array( 'mkcg_id', 'post_id', 'p', 'page_id', 'media_kit_id' );
    foreach ( $params as $param ) {
        if ( isset( $_GET[ $param ] ) && is_numeric( $_GET[ $param ] ) ) {
            return intval( $_GET[ $param ] );
        }
    }
    
    // Try WordPress context
    if ( function_exists( 'get_the_ID' ) && get_the_ID() ) {
        return get_the_ID();
    }
    
    // Try global post
    global $post;
    if ( $post && isset( $post->ID ) ) {
        return $post->ID;
    }
    
    return 0;
}

/**
 * Get components for Vue
 */
function gmkb_get_components_for_vue() {
    // Use ComponentDiscovery to get components
    if ( ! class_exists( 'ComponentDiscovery' ) ) {
        $discovery_file = GUESTIFY_PLUGIN_DIR . 'system/ComponentDiscovery.php';
        if ( file_exists( $discovery_file ) ) {
            require_once $discovery_file;
        } else {
            return array();
        }
    }
    
    $discovery = new ComponentDiscovery( GUESTIFY_PLUGIN_DIR . 'components' );
    $discovery->scan( false ); // Use cache if available
    $components = $discovery->getComponents();
    
    // Transform for Vue consumption
    $vue_components = array();
    foreach ( $components as $type => $component ) {
        $vue_components[] = array(
            'type' => $type,
            'name' => $component['name'] ?? ucfirst( str_replace( '-', ' ', $type ) ),
            'title' => $component['title'] ?? $component['name'] ?? '',
            'description' => $component['description'] ?? '',
            'category' => $component['category'] ?? 'general',
            'icon' => $component['icon'] ?? 'cube',
            'premium' => $component['isPremium'] ?? false,
            'schema' => $component['schema'] ?? null,
        );
    }
    
    return $vue_components;
}

/**
 * Get themes for Vue
 */
function gmkb_get_themes_for_vue() {
    // Hardcoded themes for now (can be made dynamic later)
    return array(
        array(
            'id' => 'modern',
            'name' => 'Modern',
            'description' => 'Clean and contemporary design',
            'thumbnail' => GUESTIFY_PLUGIN_URL . 'images/themes/modern.jpg',
            'colors' => array(
                'primary' => '#1a73e8',
                'secondary' => '#f8f9fa',
                'text' => '#202124',
                'background' => '#ffffff',
            ),
        ),
        array(
            'id' => 'dark',
            'name' => 'Dark',
            'description' => 'Elegant dark theme',
            'thumbnail' => GUESTIFY_PLUGIN_URL . 'images/themes/dark.jpg',
            'colors' => array(
                'primary' => '#bb86fc',
                'secondary' => '#121212',
                'text' => '#ffffff',
                'background' => '#000000',
            ),
        ),
        array(
            'id' => 'creative',
            'name' => 'Creative',
            'description' => 'Bold and colorful design',
            'thumbnail' => GUESTIFY_PLUGIN_URL . 'images/themes/creative.jpg',
            'colors' => array(
                'primary' => '#ff6b6b',
                'secondary' => '#4ecdc4',
                'text' => '#2d3436',
                'background' => '#f5f5f5',
            ),
        ),
    );
}

/**
 * Get initial state for Vue
 */
function gmkb_get_initial_state( $post_id ) {
    if ( ! $post_id ) {
        return array(
            'components' => new stdClass(), // Empty object for JavaScript
            'sections' => array(),
            'theme' => 'modern',
            'settings' => array(),
        );
    }
    
    // Get saved state from database
    $saved_state = get_post_meta( $post_id, 'gmkb_media_kit_state', true );
    
    if ( empty( $saved_state ) ) {
        return array(
            'components' => new stdClass(),
            'sections' => array(),
            'theme' => 'modern',
            'settings' => array(),
        );
    }
    
    // Ensure proper structure
    if ( ! isset( $saved_state['components'] ) ) {
        $saved_state['components'] = new stdClass();
    } elseif ( is_array( $saved_state['components'] ) && empty( $saved_state['components'] ) ) {
        $saved_state['components'] = new stdClass(); // Convert empty array to object
    }
    
    if ( ! isset( $saved_state['sections'] ) ) {
        $saved_state['sections'] = array();
    }
    
    if ( ! isset( $saved_state['theme'] ) ) {
        $saved_state['theme'] = 'modern';
    }
    
    if ( ! isset( $saved_state['settings'] ) ) {
        $saved_state['settings'] = array();
    }
    
    return $saved_state;
}

/**
 * Get Pods data for Vue
 */
function gmkb_get_pods_data_for_vue( $post_id ) {
    if ( ! $post_id || $post_id <= 0 ) {
        return array();
    }
    
    $pods_data = array();
    
    // Define all possible Pods fields
    $fields = array(
        // Biography fields
        'biography',
        'guest_biography',
        'biography_short',
        'professional_bio',
        'bio',
        
        // Personal info
        'first_name',
        'last_name',
        'guest_title',
        'tagline',
        'company',
        'introduction',
        
        // Topics (1-5)
        'topic_1', 'topic_2', 'topic_3', 'topic_4', 'topic_5',
        
        // Questions (1-25)
        'question_1', 'question_2', 'question_3', 'question_4', 'question_5',
        'question_6', 'question_7', 'question_8', 'question_9', 'question_10',
        'question_11', 'question_12', 'question_13', 'question_14', 'question_15',
        'question_16', 'question_17', 'question_18', 'question_19', 'question_20',
        'question_21', 'question_22', 'question_23', 'question_24', 'question_25',
        
        // Contact
        'email',
        'phone',
        'website',
        'linkedin',
        'twitter',
        'facebook',
        'instagram',
        'youtube',
        
        // Media
        'guest_headshot',
        'guest_headshot_url',
        'logo',
        'logo_url',
        
        // Other
        'credentials',
        'achievements',
        'testimonials',
        'booking_link',
        'media_kit_url',
    );
    
    // Fetch all fields
    foreach ( $fields as $field ) {
        $value = get_post_meta( $post_id, $field, true );
        if ( ! empty( $value ) ) {
            $pods_data[ $field ] = $value;
        }
    }
    
    // Also try with pods_ prefix
    foreach ( $fields as $field ) {
        if ( ! isset( $pods_data[ $field ] ) ) {
            $value = get_post_meta( $post_id, 'pods_' . $field, true );
            if ( ! empty( $value ) ) {
                $pods_data[ $field ] = $value;
            }
        }
    }
    
    // Try Pods API if available
    if ( function_exists( 'pods' ) && empty( $pods_data ) ) {
        try {
            $pod = pods( 'mkcg', $post_id );
            if ( $pod && $pod->exists() ) {
                foreach ( $fields as $field ) {
                    $value = $pod->field( $field );
                    if ( ! empty( $value ) ) {
                        $pods_data[ $field ] = $value;
                    }
                }
            }
        } catch ( Exception $e ) {
            if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
                error_log( 'GMKB: Pods API error: ' . $e->getMessage() );
            }
        }
    }
    
    if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
        $count = count( $pods_data );
        error_log( "GMKB: Loaded {$count} Pods fields for post {$post_id}" );
    }
    
    return $pods_data;
}

/**
 * Show build notice if Vue bundle is missing
 */
function gmkb_show_build_notice() {
    ?>
    <div style="margin: 50px; padding: 30px; background: #f44336; color: white; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h2 style="margin: 0 0 20px 0; font-size: 24px;">
            ⚠️ Media Kit Builder - Vue Bundle Missing
        </h2>
        <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">
            The Vue bundle has not been built yet. Please run the build command to generate the necessary files.
        </p>
        <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 4px; font-family: 'Courier New', monospace;">
            <strong>Run this command in the plugin directory:</strong><br>
            <code style="font-size: 14px;">npm install && npm run build</code>
        </div>
        <p style="margin: 20px 0 0 0; font-size: 14px; opacity: 0.9;">
            After building, refresh this page to load the Media Kit Builder.
        </p>
    </div>
    <?php
}

/**
 * Output any necessary inline scripts for Vue initialization
 */
add_action( 'wp_footer', 'gmkb_vue_init_scripts', 100 );
function gmkb_vue_init_scripts() {
    if ( ! gmkb_is_builder_page() ) {
        return;
    }
    ?>
    <script>
    // Ensure Vue app initializes when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('✅ GMKB: DOM ready, Vue app should initialize');
        });
    } else {
        console.log('✅ GMKB: DOM already loaded, Vue app can initialize immediately');
    }
    
    // Verify Vue bundle loaded
    if (typeof window.gmkbApp !== 'undefined') {
        console.log('✅ GMKB: Vue app detected');
    } else {
        console.warn('⚠️ GMKB: Vue app not detected - checking for initialization...');
        // Vue app should self-initialize from the bundle
    }
    </script>
    <?php
}