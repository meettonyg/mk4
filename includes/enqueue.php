<?php
/**
 * Clean Enqueue System - Single Filter Approach
 *
 * @package Guestify
 * @version 4.1.0
 */

if (!defined('ABSPATH')) {
    exit;
}

// ===============================================
// HELPER FUNCTIONS (Must be defined first)
// ===============================================

function gmkb_is_builder_page() {
    // ROOT FIX: Check for explicit builder mode first
    if (isset($_GET['mkcg_id']) && is_numeric($_GET['mkcg_id'])) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('🔍 GMKB: Detected BUILDER page (via mkcg_id parameter)');
        }
        return true; // Explicit builder mode
    }
    
    // Admin edit screen
    if (is_admin()) {
        $screen = get_current_screen();
        if ($screen && $screen->post_type === 'mkcg' && $screen->base === 'post') {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('🔍 GMKB: Detected BUILDER page (admin edit screen)');
            }
            return true; // Admin editor
        }
    }
    
    return false;
}

function gmkb_is_frontend_display() {
    // ROOT FIX: Frontend DISPLAY pages (not builder)
    // These show the rendered media kit to visitors
    
    // NOT builder mode
    if (isset($_GET['mkcg_id']) || is_admin()) {
        return false;
    }
    
    // Check if we're on a singular mkcg post page
    if (is_singular('mkcg') || is_singular('guests')) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('🔍 GMKB: Detected FRONTEND DISPLAY page');
        }
        return true; // Frontend media kit display
    }
    
    return false;
}

// ===============================================
// CLEAN FILTER APPROACH - OUTPUT BLOCKING
// ===============================================

/**
 * ROOT FIX: Clean approach - filter script tags at output time
 * This is more elegant than dequeue and handles stubborn enqueues
 */
function gmkb_filter_jquery_script_tag($tag, $handle, $src) {
    // Only filter on frontend media kit pages
    if (!gmkb_is_frontend_display()) {
        return $tag;
    }
    
    // Block jQuery and other unnecessary scripts
    $blocked_scripts = array(
        'jquery',
        'jquery-core',
        'jquery-migrate',
        'wp-embed',
    );
    
    if (in_array($handle, $blocked_scripts)) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB: Blocked script: ' . $handle);
        }
        return ''; // Don't output the tag
    }
    
    return $tag;
}

/**
 * ROOT FIX: Clean approach - filter style tags at output time
 */
function gmkb_filter_style_tag($tag, $handle, $href, $media) {
    // Only filter on frontend media kit pages
    if (!gmkb_is_frontend_display()) {
        return $tag;
    }
    
    // Block theme and plugin styles
    $blocked_styles = array(
        'guestify-style',
        'guestify-style-css',
        'wpf-admin-bar',
        'contact-form-7',
        'wp-block-library',
        'wp-block-library-theme',
        'global-styles',
    );
    
    // Also block if handle contains 'theme' or 'guestify'
    if (in_array($handle, $blocked_styles) || 
        stripos($handle, 'theme') !== false || 
        stripos($handle, 'guestify') !== false) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB: Blocked style: ' . $handle);
        }
        return ''; // Don't output the tag
    }
    
    return $tag;
}

// ===============================================
// MAIN ENQUEUE HOOKS
// ===============================================
add_action('wp_enqueue_scripts', 'gmkb_enqueue_vue_only_assets', 20);
add_action('admin_enqueue_scripts', 'gmkb_enqueue_vue_only_assets', 20);

// ROOT FIX: Enqueue design system CSS on frontend media kit pages
add_action('wp_enqueue_scripts', 'gmkb_enqueue_frontend_assets', 20);

function gmkb_enqueue_frontend_assets() {
    // Only load on frontend media kit display pages
    if (!gmkb_is_frontend_display()) {
        return;
    }
    
    // Enqueue design system CSS (single source of truth)
    $design_system_path = GUESTIFY_PLUGIN_DIR . 'design-system/index.css';
    if (file_exists($design_system_path)) {
        $design_system_version = filemtime($design_system_path);
        $design_system_url = GUESTIFY_PLUGIN_URL . 'design-system/index.css';
        
        wp_enqueue_style(
            'gmkb-design-system',
            $design_system_url,
            array(),
            $design_system_version
        );
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB: Design system CSS enqueued for frontend');
        }
    }
}

// ROOT FIX: Block jQuery script tags from outputting on frontend media kit pages
// This is the cleanest approach - filters the HTML output
add_filter('script_loader_tag', 'gmkb_filter_jquery_script_tag', 10, 3);
add_filter('style_loader_tag', 'gmkb_filter_style_tag', 10, 4);

// ROOT FIX: AGGRESSIVELY block WordPress 6.7+ auto-sizes CSS on media kit pages ONLY
// Multiple approaches to ensure it's removed

// Approach 1: Remove the WordPress core action that injects this CSS
add_action('template_redirect', 'gmkb_remove_wp_auto_sizes_action', 1);
function gmkb_remove_wp_auto_sizes_action() {
    if (gmkb_is_frontend_display() || gmkb_is_builder_page()) {
        // Remove WordPress core function that prints the auto-sizes CSS
        remove_action('wp_head', 'wp_print_auto_sizes_contain_intrinsic_size_style');
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB: Removed wp_print_auto_sizes_contain_intrinsic_size_style action');
        }
    }
}

// Approach 2: Disable the feature for media kit pages
add_filter('wp_img_tag_add_auto_sizes', 'gmkb_disable_auto_sizes_mediakit_only', 1);
function gmkb_disable_auto_sizes_mediakit_only($add_auto_sizes) {
    if (gmkb_is_frontend_display() || gmkb_is_builder_page()) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB: Disabled auto-sizes via filter');
        }
        return false;
    }
    return $add_auto_sizes;
}

// Approach 3: Remove the inline style from wp_head output on media kit pages
add_action('wp_head', 'gmkb_remove_auto_sizes_inline_style', 1);
add_action('admin_head', 'gmkb_remove_auto_sizes_inline_style', 1);
function gmkb_remove_auto_sizes_inline_style() {
    if (gmkb_is_frontend_display() || gmkb_is_builder_page()) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB: Starting output buffer to strip auto-sizes CSS');
        }
        
        // Start output buffering to catch and remove the style
        ob_start(function($html) {
            // Remove the contain-intrinsic-size CSS with multiple pattern variations
            $patterns = array(
                '/<style[^>]*>\s*img:is\(\[sizes="auto" i\][^}]+contain-intrinsic-size[^}]+}\s*<\/style>/i',
                '/<style>img:is\(\[sizes="auto" i\][^<]+<\/style>/i',
                '/<style[^>]*>\s*img:is\(\[sizes=.auto.\s+i\][^}]*contain-intrinsic-size[^}]*}\s*<\/style>/is'
            );
            
            foreach ($patterns as $pattern) {
                $original = $html;
                $html = preg_replace($pattern, '', $html);
                
                if ($html !== $original && defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('✅ GMKB: Stripped auto-sizes CSS with pattern');
                }
            }
            
            return $html;
        });
    }
}

// Approach 4: Close the output buffer at the end of wp_head on media kit pages
add_action('wp_head', 'gmkb_close_auto_sizes_buffer', 999);
add_action('admin_head', 'gmkb_close_auto_sizes_buffer', 999);
function gmkb_close_auto_sizes_buffer() {
    if (gmkb_is_frontend_display() || gmkb_is_builder_page()) {
        if (ob_get_level() > 0) {
            ob_end_flush();
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('✅ GMKB: Closed output buffer');
            }
        }
    }
}

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
    // ROOT FIX: Load Font Awesome where it's actually needed:
    // - Admin/builder pages (for UI)
    // - Frontend media kit pages (for social icons, icon lists, etc.)
    // - Do NOT load on other random pages
    $load_font_awesome = false;
    
    if (gmkb_is_builder_page()) {
        // Builder or admin - needs Font Awesome for UI
        $load_font_awesome = true;
    } elseif (gmkb_is_frontend_display()) {
        // Frontend media kit - needs Font Awesome for social icons
        $load_font_awesome = true;
    }
    
    if ($load_font_awesome) {
        wp_enqueue_style(
            'gmkb-font-awesome',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
            array(),
            '6.4.0'
        );
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
        'savedState'        => gmkb_get_saved_state($post_id),
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
    
    // DEBUG: Output pods_data structure
    if (defined('WP_DEBUG') && WP_DEBUG && !empty($gmkb_data['pods_data'])) {
        echo 'console.log("🔍 PHP DEBUG: Pods data keys:", ' . json_encode(array_keys($gmkb_data['pods_data'])) . ');';
        // Check for non-string values
        $non_string_fields = array();
        foreach ($gmkb_data['pods_data'] as $key => $value) {
            if (!is_null($value) && !is_string($value) && !is_numeric($value)) {
                $non_string_fields[$key] = gettype($value);
            }
        }
        if (!empty($non_string_fields)) {
            echo 'console.warn("⚠️ PHP DEBUG: Non-string Pods fields:", ' . json_encode($non_string_fields) . ');';
        }
    }
    echo '</script>';

    echo '<script type="text/javascript">';
    echo 'var gmkbData = ' . wp_json_encode($gmkb_data) . ';';
    echo '</script>';
}


// ===============================================
// HELPER FUNCTIONS
// ===============================================

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
        
        // ROOT FIX: AGGRESSIVE CACHE CLEAR - Clear ALL related transients
        // Component discovery cache
        $cache_key = 'gmkb_component_discovery_' . md5(GUESTIFY_PLUGIN_DIR . 'components/');
        delete_transient($cache_key);
        
        // Clear old cache keys
        delete_transient('gmkb_components_cache');
        delete_transient('gmkb_component_registry');
        
        // FIX: Clear file version caches using proper paths
        $bundle_js_path = GUESTIFY_PLUGIN_DIR . 'dist/gmkb.iife.js';
        if (file_exists($bundle_js_path)) {
            delete_transient('gmkb_script_version_' . md5($bundle_js_path));
        }
        
        $css_files = array(
            GUESTIFY_PLUGIN_DIR . 'dist/gmkb.css',
            GUESTIFY_PLUGIN_DIR . 'dist/style.css'
        );
        
        foreach ($css_files as $css_path) {
            if (file_exists($css_path)) {
                delete_transient('gmkb_style_version_' . md5($css_path));
            }
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

function gmkb_get_saved_state($post_id) {
    $saved_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
    
    // If no saved state, return null
    if (!$saved_state) {
        return null;
    }
    
    // ROOT FIX: Sanitize saved state to prevent .replace() errors
    // Ensure all component props are simple types
    if (isset($saved_state['sections']) && is_array($saved_state['sections'])) {
        foreach ($saved_state['sections'] as &$section) {
            if (isset($section['components']) && is_array($section['components'])) {
                foreach ($section['components'] as &$component) {
                    if (isset($component['props']) && is_array($component['props'])) {
                        $component['props'] = gmkb_sanitize_component_props($component['props']);
                    }
                }
            }
        }
    }
    
    return $saved_state;
}

function gmkb_sanitize_component_props($props) {
    $sanitized = array();
    
    foreach ($props as $key => $value) {
        // Handle different value types
        if (is_null($value)) {
            $sanitized[$key] = null;
        } elseif (is_string($value) || is_numeric($value) || is_bool($value)) {
            // Simple types - keep as is
            $sanitized[$key] = $value;
        } elseif (is_array($value)) {
            // Arrays - recursively sanitize
            $sanitized[$key] = array_map(function($item) {
                if (is_array($item)) {
                    return gmkb_sanitize_component_props($item);
                } elseif (is_object($item)) {
                    return null; // Can't use objects
                } else {
                    return $item;
                }
            }, $value);
        } elseif (is_object($value)) {
            // Objects - convert to null (can't be serialized safely)
            $sanitized[$key] = null;
        } else {
            // Unknown type - use null
            $sanitized[$key] = null;
        }
    }
    
    return $sanitized;
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
                $value = $pod->field($field);
                
                // ROOT FIX: Ensure all values are simple types (string/null)
                // Pods can return complex objects/arrays for relationship fields
                if (is_array($value) || is_object($value)) {
                    // For complex types, try to extract a simple value
                    if (is_array($value) && isset($value['guid'])) {
                        // Image/file field - use URL
                        $pods_data[$field] = $value['guid'];
                    } elseif (is_array($value) && isset($value[0])) {
                        // Array of values - use first one
                        $pods_data[$field] = is_string($value[0]) ? $value[0] : null;
                    } else {
                        // Can't convert - use null
                        $pods_data[$field] = null;
                    }
                } else {
                    // Simple value (string/number/null) - use as is
                    $pods_data[$field] = $value;
                }
            }
            
            // Add topics
            for ($i = 1; $i <= 5; $i++) {
                $value = $pod->field("topic_$i");
                
                // ROOT FIX: Sanitize topic values too
                if (is_array($value) || is_object($value)) {
                    $pods_data["topic_$i"] = null;
                } else {
                    $pods_data["topic_$i"] = $value;
                }
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
