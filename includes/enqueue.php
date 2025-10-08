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
    // ROOT FIX: Force fresh bundle loading by using current timestamp
    // This ensures browser always gets the latest version with icon support
    if (defined('WP_DEBUG') && WP_DEBUG) {
        // In development, always use current time to force cache busting
        $script_version = time();
    } else {
        // In production, use file modification time but don't cache it
        if (file_exists($bundle_js_path)) {
            $script_version = filemtime($bundle_js_path);
        } else {
            $script_version = GMKB_VERSION;
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
            // ROOT FIX: Force fresh CSS loading
            if (defined('WP_DEBUG') && WP_DEBUG) {
                $style_version = time();
            } else {
                $style_version = filemtime($path);
            }
            
            $style_url = GUESTIFY_PLUGIN_URL . 'dist/' . $filename;
            wp_enqueue_style('gmkb-vue-style', $style_url, array(), $style_version);
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('✅ GMKB: CSS loaded: ' . $filename);
            }
            break; // Only load one CSS file
        }
    }
    
    // --- FONT AWESOME for clean monochrome icons ---
    wp_enqueue_style(
        'gmkb-font-awesome',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
        array(),
        '6.4.0'
    );
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
        'postTitle'         => get_the_title($post_id),
        'pluginUrl'         => GUESTIFY_PLUGIN_URL,
        'isDevelopment'     => defined('GMKB_DEV_MODE') && GMKB_DEV_MODE,
        'restUrl'           => esc_url_raw($rest_url),
        'restNonce'         => wp_create_nonce('wp_rest'),
        'environment'       => defined('WP_DEBUG') && WP_DEBUG ? 'development' : 'production',
        'version'           => '4.0.0-phase6',
        'timestamp'         => time(),
        'architecture'      => 'pure-vue',
        'debugMode'         => defined('WP_DEBUG') && WP_DEBUG,
        'componentRegistry' => gmkb_get_component_registry_data(),
        'themes'            => gmkb_get_theme_data(),
        'savedState'        => get_post_meta($post_id, 'gmkb_media_kit_state', true) ?: null,
        'pods_data'         => gmkb_get_pods_data($post_id),
    );

    // DEBUG: Output component registry info to console
    $component_count = is_array($gmkb_data['componentRegistry']) ? count($gmkb_data['componentRegistry']) : 0;
    echo '<script type="text/javascript">';
    echo 'console.log("🔍 PHP DEBUG: Component count from PHP:", ' . $component_count . ');';
    echo 'console.log("🔍 PHP DEBUG: ComponentRegistry type from PHP:", "' . gettype($gmkb_data['componentRegistry']) . '");';
    if ($component_count > 0) {
        $first_key = array_key_first($gmkb_data['componentRegistry']);
        echo 'console.log("🔍 PHP DEBUG: First component key:", "' . esc_js($first_key) . '");';
    }
    echo '</script>';

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
    // DEBUG: Log that function is called
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('🔍 GMKB: gmkb_get_component_registry_data() called');
    }
    
    if (class_exists('ComponentDiscovery')) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB: ComponentDiscovery class exists');
        }
        
        $discovery = new ComponentDiscovery(GUESTIFY_PLUGIN_DIR . 'components/');
        
        // ROOT FIX: AGGRESSIVE CACHE CLEAR - Force delete ALL related transients
        // Clear component discovery cache
        $cache_key = 'gmkb_component_discovery_' . md5(GUESTIFY_PLUGIN_DIR . 'components/');
    delete_transient($cache_key);
    
    // Also clear any lingering old cache keys
    delete_transient('gmkb_components_cache');
    delete_transient('gmkb_component_registry');
    
    // Clear file version caches to force fresh script/style loading
    delete_transient('gmkb_script_version_' . md5($bundle_js_path));
    $css_paths = array(
        'gmkb.css' => GUESTIFY_PLUGIN_DIR . 'dist/gmkb.css',
        'style.css' => GUESTIFY_PLUGIN_DIR . 'dist/style.css'
    );
    foreach ($css_paths as $path) {
        delete_transient('gmkb_style_version_' . md5($path));
    }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('🔍 GMKB: Cache cleared, key: ' . $cache_key);
        }
        
        // Force fresh scan
        $discovery->scan(true);
        $components = $discovery->getComponents();
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('🔍 GMKB: Component count: ' . count($components));
            error_log('🔍 GMKB: Component keys: ' . implode(', ', array_keys($components)));
        }
        
        // ROOT FIX: Detailed icon field debugging
        if (defined('WP_DEBUG') && WP_DEBUG && !empty($components)) {
            $first_component = reset($components);
            error_log('🔍 GMKB DEBUG: First component data: ' . print_r($first_component, true));
            error_log('🔍 GMKB DEBUG: First component icon field: ' . (isset($first_component['icon']) ? $first_component['icon'] : 'MISSING'));
            
            // Check ALL components for icon field
            $components_without_icons = array();
            foreach ($components as $type => $comp) {
                if (!isset($comp['icon']) || empty($comp['icon'])) {
                    $components_without_icons[] = $type;
                }
            }
            if (!empty($components_without_icons)) {
                error_log('⚠️ GMKB: Components missing icon field: ' . implode(', ', $components_without_icons));
            } else {
                error_log('✅ GMKB: All components have icon field defined');
            }
        }
        
        return $components;
    } else {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('❌ GMKB: ComponentDiscovery class NOT found!');
        }
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

function gmkb_get_pods_data($post_id) {
    $pods_data = array();
    
    // Only load Pods data if Pods is active
    if (!function_exists('pods')) {
        return $pods_data;
    }
    
    try {
        $pod = pods('guests', $post_id);
        if ($pod && $pod->exists()) {
            $fields = array(
                'biography', 'first_name', 'last_name', 'email', 
                'phone', 'website', 'headshot'
            );
            
            foreach ($fields as $field) {
                $pods_data[$field] = $pod->field($field);
            }
            
            // Add topics
            for ($i = 1; $i <= 5; $i++) {
                $pods_data["topic_$i"] = $pod->field("topic_$i");
            }
        }
    } catch (Exception $e) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('⚠️ GMKB: Error loading Pods data: ' . $e->getMessage());
        }
    }
    
    return $pods_data;
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
            
            // DEBUG: Log ALL gmkbData keys
            console.log('🔍 GMKB DEBUG: gmkbData keys:', Object.keys(window.gmkbData));
            
            // ROOT FIX: Comprehensive icon field debugging
            if (window.gmkbData.componentRegistry) {
                console.log('✅ GMKB: Component Registry exists');
                console.log('🔍 GMKB DEBUG: Component Registry:', window.gmkbData.componentRegistry);
                console.log('🔍 GMKB DEBUG: Component Registry type:', typeof window.gmkbData.componentRegistry);
                console.log('🔍 GMKB DEBUG: Component Registry keys:', Object.keys(window.gmkbData.componentRegistry));
                
                // Check ALL components for icon field
                const components = window.gmkbData.componentRegistry;
                const componentsWithoutIcons = [];
                const iconMap = {};
                
                Object.keys(components).forEach(type => {
                    const comp = components[type];
                    if (!comp.icon || comp.icon === 'fa-solid fa-cube') {
                        componentsWithoutIcons.push(type);
                    }
                    iconMap[type] = comp.icon || 'MISSING';
                });
                
                console.log('🎨 GMKB: Icon mapping for all components:', iconMap);
                
                if (componentsWithoutIcons.length > 0) {
                    console.warn('⚠️ GMKB: Components using fallback cube icon:', componentsWithoutIcons);
                } else {
                    console.log('✅ GMKB: All components have custom icons defined');
                }
                
                // Check first component for detailed debugging
                const firstComponent = Object.values(components)[0];
                if (firstComponent) {
                    console.log('🔍 GMKB DEBUG: First component full data:', firstComponent);
                    console.log('🔍 GMKB DEBUG: First component icon:', firstComponent.icon);
                } else {
                    console.warn('⚠️ GMKB: componentRegistry is EMPTY!');
                }
            } else {
                console.error('❌ GMKB: componentRegistry is UNDEFINED or NULL!');
                console.log('🔍 GMKB DEBUG: Full gmkbData:', window.gmkbData);
            }
        } else {
            console.error('❌ GMKB CRITICAL: Backend data (gmkbData) is MISSING.');
        }
    });
    </script>
    <?php
}
