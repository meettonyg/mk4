<?php
/**
 * Vue-Only Enqueue System - Clean Build Version
 *
 * @package Guestify
 * @version 4.0.5
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
    
    // Check for built files
    $bundle_js_path = GUESTIFY_PLUGIN_DIR . 'dist/gmkb.iife.js';
    if (!file_exists($bundle_js_path)) {
        add_action('wp_footer', 'gmkb_display_build_error_notice');
        add_action('admin_footer', 'gmkb_display_build_error_notice');
        return;
    }
    
    // --- JAVASCRIPT BUNDLE ---
    // Cache file modification time to reduce filesystem I/O (Issue #16 fix)
    $cache_key = 'gmkb_script_version_' . md5($bundle_js_path);
    $script_version = get_transient($cache_key);
    
    if (false === $script_version) {
        if (file_exists($bundle_js_path)) {
            $script_version = filemtime($bundle_js_path);
            // Cache for 5 minutes
            set_transient($cache_key, $script_version, 5 * MINUTE_IN_SECONDS);
        } else {
            $script_version = GMKB_VERSION; // Fallback to plugin version
        }
    }
    
    $script_url = GUESTIFY_PLUGIN_URL . 'dist/gmkb.iife.js';
    wp_enqueue_script('gmkb-vue-app', $script_url, array(), $script_version, true);

    // --- CSS BUNDLE (check both possible names) ---
    // After clean rebuild, should be gmkb.css
    // Cache CSS file operations too (Issue #16 fix)
    $css_paths = array(
        'gmkb.css' => GUESTIFY_PLUGIN_DIR . 'dist/gmkb.css',
        'style.css' => GUESTIFY_PLUGIN_DIR . 'dist/style.css'
    );
    
    foreach ($css_paths as $filename => $path) {
        if (file_exists($path)) {
            // Cache CSS file modification time
            $css_cache_key = 'gmkb_style_version_' . md5($path);
            $style_version = get_transient($css_cache_key);
            
            if (false === $style_version) {
                $style_version = filemtime($path);
                // Cache for 5 minutes
                set_transient($css_cache_key, $style_version, 5 * MINUTE_IN_SECONDS);
            }
            
            $style_url = GUESTIFY_PLUGIN_URL . 'dist/' . $filename;
            wp_enqueue_style('gmkb-vue-style', $style_url, array(), $style_version);
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('✅ GMKB: CSS loaded: ' . $filename);
            }
            break; // Only load one CSS file
        }
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
    
    // Validate post exists and user has permission (Issue #15 fix)
    if (!$post_id || !get_post($post_id)) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('⚠️ GMKB: Invalid post_id, assets not loaded');
        }
        return; // Don't inject data if post is invalid
    }
    
    // Check user has permission to edit this post
    if (!current_user_can('edit_post', $post_id)) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('⚠️ GMKB: User lacks permission for post_id ' . $post_id);
        }
        return; // Don't inject data if user lacks permission
    }
    
    $nonce = wp_create_nonce('gmkb_nonce');

    // Explicitly include the class files before using them
    require_once GUESTIFY_PLUGIN_DIR . 'system/ComponentDiscovery.php';
    require_once GUESTIFY_PLUGIN_DIR . 'system/ThemeDiscovery.php';

    // Ensure restUrl has trailing slash
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
        'themes'            => gmkb_get_theme_data(),
    );

    echo '<script type="text/javascript">';
    echo 'var gmkbData = ' . wp_json_encode($gmkb_data) . ';';
    echo '</script>';
}


// ===============================================
// HELPER FUNCTIONS
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
    if (class_exists('ComponentDiscovery')) {
        $discovery = new ComponentDiscovery(GUESTIFY_PLUGIN_DIR . 'components/');
        $discovery->scan();
        return $discovery->getComponents();
    }
    return [];
}

function gmkb_get_theme_data() {
    $themes_array = array();
    
    // Try ThemeDiscovery for filesystem themes
    $theme_discovery_file = GUESTIFY_PLUGIN_DIR . 'system/ThemeDiscovery.php';
    if (file_exists($theme_discovery_file)) {
        require_once $theme_discovery_file;
        
        if (class_exists('ThemeDiscovery')) {
            try {
                $theme_dir = GUESTIFY_PLUGIN_DIR . 'themes/';
                $theme_discovery = new ThemeDiscovery($theme_dir);
                $theme_discovery->scan();
                $themes = $theme_discovery->getThemes();
                
                foreach ($themes as $theme_id => $theme_data) {
                    $id = $theme_data['theme_id'] ?? $theme_id;
                    
                    $themes_array[] = array(
                        'id' => $id,
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
            } catch (Exception $e) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('⚠️ GMKB: ThemeDiscovery failed: ' . $e->getMessage());
                }
            }
        }
    }
    
    // Fallback themes
    if (empty($themes_array)) {
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
    
    // Add custom themes from database
    $custom_themes = get_option('gmkb_custom_themes', array());
    if (is_array($custom_themes) && !empty($custom_themes)) {
        foreach ($custom_themes as $theme_id => $theme_data) {
            if (!isset($theme_data['id'])) {
                $theme_data['id'] = $theme_id;
            }
            $theme_data['isCustom'] = true;
            $theme_data['isBuiltIn'] = false;
            $themes_array[] = $theme_data;
        }
    }
    
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
