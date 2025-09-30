<?php
/**
 * Vue-Only Enqueue System - Final Patched Version
 *
 * This version includes explicit require_once calls for discovery classes to prevent
 * fatal errors if files are not autoloaded, ensuring gmkbData is always populated.
 * It uses a direct script injection method for localizing data, which is more robust
 * than wp_localize_script and prevents race conditions.
 *
 * @package Guestify
 * @version 4.0.4-final
 */

if (!defined('ABSPATH')) {
    exit;
}

// ===============================================
// MAIN ENQUEUE HOOKS
// ===============================================
add_action('wp_enqueue_scripts', 'gmkb_enqueue_vue_only_assets', 20);
add_action('admin_enqueue_scripts', 'gmkb_enqueue_vue_only_assets', 20);

// Hook to print the critical data object directly into the head.
add_action('wp_head', 'gmkb_inject_data_object_script', 1);
add_action('admin_head', 'gmkb_inject_data_object_script', 1);


/**
 * Enqueues all necessary assets for the Vue.js media kit builder.
 */
function gmkb_enqueue_vue_only_assets() {
    if (!gmkb_is_builder_page()) {
        return;
    }

    static $assets_enqueued = false;
    if ($assets_enqueued) {
        return;
    }
    $assets_enqueued = true;
    
    $bundle_js_path = GUESTIFY_PLUGIN_DIR . 'dist/gmkb.iife.js';
    if (!file_exists($bundle_js_path)) {
        add_action('wp_footer', 'gmkb_display_build_error_notice');
        add_action('admin_footer', 'gmkb_display_build_error_notice');
        return;
    }
    
    $bundle_css_path = GUESTIFY_PLUGIN_DIR . 'dist/style.css';
    
    // --- SCRIPT ENQUEUEING ---
    $script_version = filemtime($bundle_js_path);
    $script_url = GUESTIFY_PLUGIN_URL . 'dist/gmkb.iife.js';

    wp_enqueue_script('gmkb-vue-app', $script_url, array(), $script_version, true);

    // --- STYLE ENQUEUEING ---
    if (file_exists($bundle_css_path)) {
        $style_version = filemtime($bundle_css_path);
        $style_url = GUESTIFY_PLUGIN_URL . 'dist/style.css';
        wp_enqueue_style('gmkb-vue-style', $style_url, array(), $style_version);
    }
}

/**
 * Directly prints the gmkbData object into the <head> of the document.
 */
function gmkb_inject_data_object_script() {
    if (!gmkb_is_builder_page()) {
        return;
    }

    $post_id = gmkb_get_post_id();
    $nonce = wp_create_nonce('gmkb_nonce');

    // [THE CRITICAL FIX] Explicitly include the class files before using them.
    require_once GUESTIFY_PLUGIN_DIR . 'system/ComponentDiscovery.php';
    require_once GUESTIFY_PLUGIN_DIR . 'system/ThemeDiscovery.php';

    $gmkb_data = array(
        'ajaxUrl'           => admin_url('admin-ajax.php'),
        'nonce'             => $nonce,
        'postId'            => $post_id,
        'pluginUrl'         => GUESTIFY_PLUGIN_URL,
        'isDevelopment'     => defined('GMKB_DEV_MODE') && GMKB_DEV_MODE,
        'restUrl'           => esc_url_raw(rest_url()),
        'restNonce'         => wp_create_nonce('wp_rest'),
        'componentRegistry' => gmkb_get_component_registry_data(),
        'themeData'         => gmkb_get_theme_data(),
    );

    echo '<script type="text/javascript">';
    echo 'var gmkbData = ' . wp_json_encode($gmkb_data) . ';';
    echo '</script>';
    
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('✅ GMKB: gmkbData object injected into head.');
    }
}


// ===============================================
// HELPER FUNCTIONS (Preserved from original file)
// ===============================================

function gmkb_is_builder_page() {
    if (isset($_GET['mkcg_id']) && is_numeric($_GET['mkcg_id'])) {
        return true;
    }
    if (is_singular('mkcg')) {
        return true;
    }
    if (is_admin()) {
        $screen = get_current_screen();
        if ($screen && $screen->post_type === 'mkcg' && $screen->base === 'post') {
            return true;
        }
    }
    return false;
}

function gmkb_get_post_id() {
    if (isset($_GET['mkcg_id']) && is_numeric($_GET['mkcg_id'])) {
        return intval($_GET['mkcg_id']);
    }
    return get_the_ID();
}

function gmkb_get_component_registry_data() {
    if (class_exists('\GMKB\ComponentDiscovery')) {
        $discovery = new \GMKB\ComponentDiscovery(GUESTIFY_PLUGIN_DIR . 'components/');
        return $discovery->get_all_components();
    }
    return [];
}

function gmkb_get_theme_data() {
    // ROOT FIX: Always provide built-in themes, custom themes are optional
    $theme_data = array(
        'builtIn' => array(
            array(
                'id' => 'professional_clean',
                'name' => 'Professional Clean',
                'description' => 'Clean and professional design'
            ),
            array(
                'id' => 'creative_bold',
                'name' => 'Creative Bold',
                'description' => 'Bold and creative design'
            ),
            array(
                'id' => 'minimal_elegant',
                'name' => 'Minimal Elegant',
                'description' => 'Minimal and elegant design'
            ),
            array(
                'id' => 'modern_dark',
                'name' => 'Modern Dark',
                'description' => 'Modern dark theme'
            )
        ),
        'custom' => array()
    );
    
    // Try to load custom themes if ThemeDiscovery exists
    if (class_exists('\GMKB\ThemeDiscovery')) {
        try {
            $theme_discovery = new \GMKB\ThemeDiscovery(GUESTIFY_PLUGIN_DIR . 'themes/');
            $discovered = $theme_discovery->discover();
            if (!empty($discovered)) {
                $theme_data['builtIn'] = array_values($discovered);
            }
        } catch (Exception $e) {
            // Silently fail - built-in themes already defined above
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('GMKB: ThemeDiscovery failed, using built-in themes: ' . $e->getMessage());
            }
        }
    }
    
    // Try to load custom themes from database
    $custom_themes = get_option('gmkb_custom_themes', array());
    if (is_array($custom_themes) && !empty($custom_themes)) {
        $theme_data['custom'] = array_values($custom_themes);
    }
    
    return $theme_data;
}

function gmkb_display_build_error_notice() {
    ?>
    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80%; max-width: 600px; background: #fff; border: 2px solid #d63638; padding: 30px; z-index: 99999;">
        <h2>Media Kit Builder Files Missing</h2>
        <p>The main application script has not been built yet. Please run the build command.</p>
        <div style="background: #f0f0f1; padding: 15px;">
            <code>npm install && npm run build</code>
        </div>
    </div>
    <?php
}

add_action('wp_footer', 'gmkb_vue_init_scripts', 100);
add_action('admin_footer', 'gmkb_vue_init_scripts', 100);
function gmkb_vue_init_scripts() {
    if (!gmkb_is_builder_page()) return;
    ?>
    <script type="text/javascript">
    document.addEventListener('DOMContentLoaded', function() {
        console.log('✅ GMKB: DOM ready, running diagnostics...');
        if (window.gmkbData && window.gmkbData.ajaxUrl) {
            console.log('✅ GMKB: Backend data (gmkbData) is available.');
        } else {
            console.error('❌ GMKB CRITICAL: Backend data (gmkbData) is MISSING.');
        }
    });
    </script>
    <?php
}