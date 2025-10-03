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
    
    // ROOT FIX: Enqueue design system FIRST (single source of truth)
    $design_system_path = GUESTIFY_PLUGIN_DIR . 'design-system/index.css';
    if (file_exists($design_system_path)) {
        $design_system_version = filemtime($design_system_path);
        $design_system_url = GUESTIFY_PLUGIN_URL . 'design-system/index.css';
        wp_enqueue_style('gmkb-design-system', $design_system_url, array(), $design_system_version);
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB: Design System CSS loaded');
        }
    }
    
    $bundle_js_path = GUESTIFY_PLUGIN_DIR . 'dist/gmkb.iife.js';
    if (!file_exists($bundle_js_path)) {
        add_action('wp_footer', 'gmkb_display_build_error_notice');
        add_action('admin_footer', 'gmkb_display_build_error_notice');
        return;
    }
    
    $bundle_css_path = GUESTIFY_PLUGIN_DIR . 'dist/style.css';
    
    // --- SCRIPT ENQUEUEING ---
    $script_version = time(); // AGGRESSIVE cache bust - use current timestamp
    $script_url = GUESTIFY_PLUGIN_URL . 'dist/gmkb.iife.js';

    wp_enqueue_script('gmkb-vue-app', $script_url, array(), $script_version, true);

    // --- STYLE ENQUEUEING (Vue component styles) ---
    // This should EXTEND the design system, not replace it
    if (file_exists($bundle_css_path)) {
        $style_version = filemtime($bundle_css_path);
        $style_url = GUESTIFY_PLUGIN_URL . 'dist/style.css';
        // Depends on design system
        wp_enqueue_style('gmkb-vue-style', $style_url, array('gmkb-design-system'), $style_version);
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

    // ROOT FIX: Ensure restUrl has trailing slash for proper API endpoint construction
    $rest_url = rest_url();
    if (substr($rest_url, -1) !== '/') {
        $rest_url .= '/';
    }
    
    $gmkb_data = array(
        'ajaxUrl'           => admin_url('admin-ajax.php'),
        'nonce'             => $nonce,
        'postId'            => $post_id,
        'pluginUrl'         => GUESTIFY_PLUGIN_URL,
        'isDevelopment'     => defined('GMKB_DEV_MODE') && GMKB_DEV_MODE,
        'restUrl'           => esc_url_raw($rest_url),
        'restNonce'         => wp_create_nonce('wp_rest'),
        'componentRegistry' => gmkb_get_component_registry_data(),
        'themes'            => gmkb_get_theme_data(), // ROOT FIX: Changed from 'themeData' to 'themes' for Vue compatibility
    );
    
    // DEBUG: Log the REST URL being set
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('✅ GMKB: Setting restUrl to: ' . $rest_url);
        error_log('✅ GMKB: Expected API endpoint: ' . $rest_url . 'gmkb/v2/mediakit/' . $post_id);
    }

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
    // ROOT FIX: ComponentDiscovery is not namespaced, use global class
    if (class_exists('ComponentDiscovery')) {
        $discovery = new ComponentDiscovery(GUESTIFY_PLUGIN_DIR . 'components/');
        $discovery->scan(); // Ensure components are scanned
        return $discovery->getComponents(); // Use correct method name
    }
    return [];
}

function gmkb_get_theme_data() {
    // ROOT FIX: Load themes using ThemeDiscovery and return flat array for Vue
    // Gemini feedback: Vue expects direct array, not nested structure
    
    $themes_array = array();
    
    // Strategy 1: Try ThemeDiscovery for filesystem themes
    $theme_discovery_file = GUESTIFY_PLUGIN_DIR . 'system/ThemeDiscovery.php';
    if (file_exists($theme_discovery_file)) {
        require_once $theme_discovery_file;
        
        if (class_exists('ThemeDiscovery')) {
            try {
                $theme_dir = GUESTIFY_PLUGIN_DIR . 'themes/';
                $theme_discovery = new ThemeDiscovery($theme_dir);
                $theme_discovery->scan();
                $themes = $theme_discovery->getThemes();
                
                // Convert to flat array with proper structure
                foreach ($themes as $theme_id => $theme_data) {
                    // ROOT FIX: Ensure ID is set - use theme_id from JSON or array key
                    $id = $theme_data['theme_id'] ?? $theme_id;
                    
                    // Ensure theme has required fields for Vue
                    $themes_array[] = array(
                        'id' => $id,  // Use the validated ID
                        'name' => $theme_data['name'] ?? ucfirst(str_replace('_', ' ', $theme_id)),
                        'description' => $theme_data['description'] ?? '',
                        'colors' => $theme_data['colors'] ?? array(),
                        'typography' => $theme_data['typography'] ?? array(),
                        'spacing' => $theme_data['spacing'] ?? array(),
                        'effects' => $theme_data['effects'] ?? array(),
                        'isCustom' => false,
                        'isBuiltIn' => true
                    );
                }
                
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('✅ GMKB: Loaded ' . count($themes_array) . ' themes via ThemeDiscovery');
                }
            } catch (Exception $e) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('⚠️ GMKB: ThemeDiscovery failed: ' . $e->getMessage());
                }
            }
        }
    }
    
    // Strategy 2: Fallback to hardcoded themes if discovery failed
    if (empty($themes_array)) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('⚠️ GMKB: ThemeDiscovery not available, using fallback themes');
        }
        
        $themes_array = array(
            array(
                'id' => 'professional_clean',
                'name' => 'Professional Clean',
                'description' => 'Clean and professional design',
                'colors' => array(
                    'primary' => '#3b82f6',
                    'secondary' => '#2563eb',
                    'background' => '#ffffff',
                    'surface' => '#f8fafc',
                    'text' => '#1e293b'
                ),
                'isCustom' => false,
                'isBuiltIn' => true
            ),
            array(
                'id' => 'creative_bold',
                'name' => 'Creative Bold',
                'description' => 'Bold and creative design',
                'colors' => array(
                    'primary' => '#f97316',
                    'secondary' => '#ea580c'
                ),
                'isCustom' => false,
                'isBuiltIn' => true
            ),
            array(
                'id' => 'minimal_elegant',
                'name' => 'Minimal Elegant',
                'description' => 'Minimal and elegant design',
                'colors' => array(
                    'primary' => '#18181b',
                    'secondary' => '#27272a'
                ),
                'isCustom' => false,
                'isBuiltIn' => true
            ),
            array(
                'id' => 'modern_dark',
                'name' => 'Modern Dark',
                'description' => 'Modern dark theme',
                'colors' => array(
                    'primary' => '#8b5cf6',
                    'secondary' => '#7c3aed'
                ),
                'isCustom' => false,
                'isBuiltIn' => true
            )
        );
    }
    
    // Strategy 3: Add custom themes from database
    $custom_themes = get_option('gmkb_custom_themes', array());
    if (is_array($custom_themes) && !empty($custom_themes)) {
        foreach ($custom_themes as $theme_id => $theme_data) {
            // Ensure custom theme has ID
            if (!isset($theme_data['id'])) {
                $theme_data['id'] = $theme_id;
            }
            $theme_data['isCustom'] = true;
            $theme_data['isBuiltIn'] = false;
            $themes_array[] = $theme_data;
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB: Added ' . count($custom_themes) . ' custom themes from database');
        }
    }
    
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('✅ GMKB: Total themes available: ' . count($themes_array));
        $theme_ids = array_column($themes_array, 'id');
        error_log('✅ GMKB: Theme IDs: ' . implode(', ', $theme_ids));
    }
    
    // ROOT FIX: Return flat array, not nested structure (Vue compatibility)
    return $themes_array;
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