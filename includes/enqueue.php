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

/**
 * Get list of components actually used on the current page
 * Used for dynamic CSS loading optimization
 * 
 * @return array Array of component type names (e.g., ['biography', 'hero', 'contact'])
 */
function gmkb_get_used_components_for_page() {
    // Get current post
    global $post;
    if (!$post || !is_singular(array('mkcg', 'guests'))) {
        return array(); // Not a media kit page
    }
    
    // Load the media kit state
    $state = get_post_meta($post->ID, 'gmkb_media_kit_state', true);
    if (empty($state)) {
        return array(); // No state found
    }
    
    $used_components = array();
    
    // Extract component types from the state
    if (isset($state['components']) && is_array($state['components'])) {
        foreach ($state['components'] as $component_id => $component) {
            if (isset($component['type'])) {
                $component_type = $component['type'];
                if (!in_array($component_type, $used_components)) {
                    $used_components[] = $component_type;
                }
            }
        }
    }
    
    return $used_components;
}

function gmkb_is_builder_page() {
    // ROOT FIX: STRICT URL-based detection ONLY
    // This prevents loading on ANY other tools pages
    
    // ROOT FIX: Add comprehensive debugging
    $debug = defined('WP_DEBUG') && WP_DEBUG;
    
    // Admin edit screen - check first
    if (is_admin()) {
        $screen = get_current_screen();
        if ($screen && $screen->post_type === 'mkcg' && $screen->base === 'post') {
            if ($debug) {
                error_log('🔍 GMKB: Detected BUILDER page (admin edit screen)');
            }
            return true;
        }
        return false; // Not a media kit admin page
    }
    
    // Frontend: ONLY check URL pattern - no WordPress functions that could be unreliable
    if (!isset($_SERVER['REQUEST_URI'])) {
        if ($debug) {
            error_log('❌ GMKB: REQUEST_URI not set');
        }
        return false;
    }
    
    $uri = $_SERVER['REQUEST_URI'];
    
    if ($debug) {
        error_log('🔍 GMKB: gmkb_is_builder_page() checking URI: ' . $uri);
    }
    
    // ROOT FIX: STRICT URL detection with explicit patterns
    // Must match EXACTLY these URL patterns - no other tools pages
    // 
    // PATTERN EXPLANATION:
    // - /tools/media-kit (with or without trailing slash, with or without query params)
    // - /media-kit (with or without trailing slash, with or without query params)  
    // - /guestify-media-kit (with or without trailing slash, with or without query params)
    //
    // ROOT FIX: Use explicit alternation for slash handling to avoid regex ambiguity
    $is_media_kit_url = (
        // Pattern 1: /tools/media-kit OR /tools/media-kit/ (anywhere in URL)
        preg_match('#/tools/media-kit($|/|\?|&)#', $uri) !== 0 ||
        // Pattern 2: ^/media-kit OR ^/media-kit/ (start of URL)
        preg_match('#^/media-kit($|/|\?|&)#', $uri) !== 0 ||
        // Pattern 3: ^/guestify-media-kit OR ^/guestify-media-kit/ (start of URL)
        preg_match('#^/guestify-media-kit($|/|\?|&)#', $uri) !== 0
    );
    
    if ($debug) {
        error_log('  - Pattern 1 (/tools/media-kit): ' . (preg_match('#/tools/media-kit($|/|\?|&)#', $uri) !== 0 ? 'MATCH' : 'NO MATCH'));
        error_log('  - Pattern 2 (^/media-kit): ' . (preg_match('#^/media-kit($|/|\?|&)#', $uri) !== 0 ? 'MATCH' : 'NO MATCH'));
        error_log('  - Pattern 3 (^/guestify-media-kit): ' . (preg_match('#^/guestify-media-kit($|/|\?|&)#', $uri) !== 0 ? 'MATCH' : 'NO MATCH'));
        error_log('  - Final result: ' . ($is_media_kit_url ? 'TRUE (is builder page)' : 'FALSE (not builder page)'));
    }
    
    if (!$is_media_kit_url) {
        if ($debug) {
            error_log('❌ GMKB: NOT a media kit URL, skipping. URI: ' . $uri);
        }
        return false;
    }
    
    // If we get here, the URL matches /tools/media-kit/ pattern
    if ($debug) {
        error_log('✅ GMKB: Detected BUILDER page (URL pattern match): ' . $uri);
    }
    
    return true;
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
    // ROOT FIX: NEVER filter on builder pages - media library needs jQuery
    if (gmkb_is_builder_page()) {
        return $tag; // Allow ALL scripts on builder
    }
    
    // Only filter on frontend media kit pages
    if (!gmkb_is_frontend_display()) {
        return $tag;
    }
    
    // Block jQuery and other unnecessary scripts ONLY on display pages
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
// ROOT FIX: WordPress media library REMOVED - using Pure Vue MediaUploader component
// The new MediaUploader uses REST API only (no jQuery/wp.media dependency)

// ROOT FIX: EMERGENCY TEST - Force log on EVERY page to verify hooks work
add_action('wp_enqueue_scripts', 'gmkb_emergency_test', 1);
add_action('admin_enqueue_scripts', 'gmkb_emergency_test', 1);
function gmkb_emergency_test() {
    error_log('🚨 EMERGENCY TEST: wp_enqueue_scripts hook IS FIRING');
    error_log('🚨 Current URL: ' . (isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : 'UNKNOWN'));
}

// Vue assets load (priority 20)
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
    
    // DYNAMIC CSS: Get components actually used on this page
    // This avoids loading CSS for ALL 16 components when only 2-3 are used
    $used_components = gmkb_get_used_components_for_page();
    
    if (defined('WP_DEBUG') && WP_DEBUG) {
        if (!empty($used_components)) {
            error_log('✅ GMKB Dynamic CSS: Found ' . count($used_components) . ' components on this page: ' . implode(', ', $used_components));
        } else {
            error_log('⚠️ GMKB Dynamic CSS: No components detected, falling back to loading all CSS');
        }
    }
    
    // ROOT FIX: ONLY load CSS files for components actually present on the page
    // If we couldn't detect components, fall back to loading all (backward compatibility)
    $load_all_css = empty($used_components);
    
    // ROOT FIX: Also load individual component CSS files
    // OPTIMIZATION: Only load CSS for components actually present on the page
    $components_dir = GUESTIFY_PLUGIN_DIR . 'components/';
    if (is_dir($components_dir)) {
        $component_folders = glob($components_dir . '*', GLOB_ONLYDIR);
        
        foreach ($component_folders as $component_path) {
            $component_name = basename($component_path);
            $styles_path = $component_path . '/styles.css';
            
            if (file_exists($styles_path)) {
                // DYNAMIC CSS: Only load if this component is actually used on the page
                if ($load_all_css || in_array($component_name, $used_components)) {
                    $component_version = filemtime($styles_path);
                    $styles_url = GUESTIFY_PLUGIN_URL . 'components/' . $component_name . '/styles.css';
                    
                    wp_enqueue_style(
                        'gmkb-component-' . $component_name,
                        $styles_url,
                        array('gmkb-design-system'),
                        $component_version
                    );
                    
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('✅ GMKB Dynamic CSS: Component CSS loaded: ' . $component_name);
                    }
                } else {
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('⏭️  GMKB Dynamic CSS: Skipped CSS for unused component: ' . $component_name);
                    }
                }
            }
        }
    }
}

// ROOT FIX: Block jQuery script tags from outputting on frontend media kit pages
// jQuery-free implementation - no longer needed for builder pages
add_filter('script_loader_tag', 'gmkb_filter_jquery_script_tag', 10, 3);
add_filter('style_loader_tag', 'gmkb_filter_style_tag', 10, 4);

// ROOT FIX: Block WordPress 6.7+ auto-sizes CSS on media kit pages
// Uses clean action removal approach (most efficient)
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

// Disable the feature for media kit pages as backup
add_filter('wp_img_tag_add_auto_sizes', 'gmkb_disable_auto_sizes_mediakit_only', 1);
function gmkb_disable_auto_sizes_mediakit_only($add_auto_sizes) {
    if (gmkb_is_frontend_display() || gmkb_is_builder_page()) {
        return false;
    }
    return $add_auto_sizes;
}

// REMOVED: jQuery-based media library functions
// The MediaUploader Vue component uses REST API only - no jQuery/wp.media needed
// This eliminates ~200KB of legacy JavaScript (jQuery, Backbone, Underscore, wp.media)
// Date Removed: November 10, 2025

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
    
    // ROOT FIX: Inject gmkbData using wp_add_inline_script to guarantee it loads BEFORE the Vue bundle
    $gmkb_data = gmkb_prepare_data_for_injection();
    
    // CRITICAL DEBUGGING: Check if data preparation failed
    if (empty($gmkb_data)) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('❌ GMKB CRITICAL: gmkb_prepare_data_for_injection() returned EMPTY data!');
        }
        // Add error to page for visibility
        $inline_script = 'console.error("❌ GMKB CRITICAL: Data preparation failed - gmkbData is empty");';
        $inline_script .= 'console.error("❌ Check WordPress debug.log for detailed error information");';
        $inline_script .= 'window.gmkbData = null;';
    } else {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            $component_count = isset($gmkb_data['componentRegistry']) ? count($gmkb_data['componentRegistry']) : 0;
            error_log('✅ GMKB: Data prepared successfully - ' . $component_count . ' components');
        }
        
        // ROOT FIX: Use wp_json_encode with JSON_UNESCAPED_UNICODE flag to prevent HTML encoding
        // This prevents font families like "Roboto, sans-serif" from becoming "&quot;Roboto&quot;"
        // CRITICAL: Don't use wp_json_encode - it forces JSON_HEX_QUOT which encodes quotes
        // Use native json_encode with proper flags and wp_kses to prevent double-encoding
        $json_data = json_encode($gmkb_data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP);
        
        // Wrap in script tag manually to prevent WordPress from encoding it
        $inline_script = sprintf(
            'window.gmkbData = %s;',
            $json_data
        );
        
        // Add detailed console logging
        $inline_script .= 'console.log("✅ GMKB: gmkbData injected successfully via wp_add_inline_script");';
        $inline_script .= 'console.log("📊 GMKB DATA SUMMARY:");';
        $inline_script .= 'console.log("  - Post ID:", window.gmkbData.postId);';
        $inline_script .= 'console.log("  - User Status:", window.gmkbData.user.isLoggedIn ? "Logged in (ID: " + window.gmkbData.user.userId + ")" : "Guest (view/edit only)");';
        $inline_script .= 'console.log("  - Can Save:", window.gmkbData.user.canSave ? "YES" : "NO (login required)");';
        $inline_script .= 'console.log("  - Components:", Object.keys(window.gmkbData.componentRegistry || {}).length);';
        $inline_script .= 'console.log("  - Themes:", window.gmkbData.themes ? window.gmkbData.themes.length : 0);';
        $inline_script .= 'console.log("  - Has saved state:", !!window.gmkbData.savedState);';
        $inline_script .= 'console.log("  - Pods data:", Object.keys(window.gmkbData.pods_data || {}).length + " fields");';
        $inline_script .= 'console.log("  - Deprecation config:", Object.keys(window.gmkbData.deprecationConfig || {}).length + " deprecated components");';
        $inline_script .= 'console.log("  - Full data:", window.gmkbData);';
        $inline_script .= 'if (!window.gmkbData.user.isLoggedIn) { console.log("📝 CARRD MODE: You can edit this media kit, but need to login to save changes"); }';
    }
    
    wp_add_inline_script('gmkb-vue-app', $inline_script, 'before');

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
    
    // ROOT FIX: ALSO load design system CSS in builder for accurate preview
    // This ensures components look the same in builder as they do on frontend
    $design_system_path = GUESTIFY_PLUGIN_DIR . 'design-system/index.css';
    if (file_exists($design_system_path)) {
        $design_system_version = defined('WP_DEBUG') && WP_DEBUG ? time() : filemtime($design_system_path);
        $design_system_url = GUESTIFY_PLUGIN_URL . 'design-system/index.css';
        
        wp_enqueue_style(
            'gmkb-design-system-builder',
            $design_system_url,
            array('gmkb-vue-style'), // Load after builder UI styles
            $design_system_version
        );
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ GMKB: Design system CSS loaded in builder for accurate preview');
        }
    }
    
    // ✅ ROOT FIX: CONDITIONAL DYNAMIC CSS LOADING FOR BUILDER
    // Only load CSS for components actually added to the preview
    // Reduces initial page load from 16+ CSS files to only what's needed
    $post_id = gmkb_get_post_id();
    $saved_state = gmkb_get_saved_state($post_id);
    
    // Extract component types from saved state
    $used_components = array();
    if ($saved_state && isset($saved_state['sections']) && is_array($saved_state['sections'])) {
        foreach ($saved_state['sections'] as $section) {
            // Handle full-width sections (components array)
            if (isset($section['components']) && is_array($section['components'])) {
                foreach ($section['components'] as $component_ref) {
                    // ROOT FIX: Components in sections are IDs, not full objects
                    $component_id = is_string($component_ref) ? $component_ref : $component_ref['component_id'];
                    
                    // Look up actual component in saved_state['components']
                    if (isset($saved_state['components'][$component_id]) && isset($saved_state['components'][$component_id]['type'])) {
                        $component_type = $saved_state['components'][$component_id]['type'];
                        if (!in_array($component_type, $used_components)) {
                            $used_components[] = $component_type;
                        }
                    }
                }
            }
            
            // ROOT FIX: Also handle multi-column sections (columns object)
            if (isset($section['columns']) && is_array($section['columns'])) {
                foreach ($section['columns'] as $column => $component_ids) {
                    if (is_array($component_ids)) {
                        foreach ($component_ids as $component_id) {
                            // Look up actual component
                            if (isset($saved_state['components'][$component_id]) && isset($saved_state['components'][$component_id]['type'])) {
                                $component_type = $saved_state['components'][$component_id]['type'];
                                if (!in_array($component_type, $used_components)) {
                                    $used_components[] = $component_type;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Load component CSS from registry (single source of truth)
    $gmkb_data = gmkb_prepare_data_for_injection();
    if (isset($gmkb_data['componentRegistry']) && is_array($gmkb_data['componentRegistry'])) {
        $loaded_count = 0;
        $skipped_count = 0;
        $missing_count = 0;
        
        // If no components found in state, load common core components only
        // This ensures basic functionality without loading everything
        $load_all = empty($used_components);
        $core_components = array('hero', 'biography', 'contact'); // Always available
        
        foreach ($gmkb_data['componentRegistry'] as $component_type => $component_info) {
            // Check if component declares a stylesheet
            if (!empty($component_info['styles'])) {
                $styles_file = $component_info['styles'];
                $styles_path = GUESTIFY_PLUGIN_DIR . 'components/' . $component_type . '/' . $styles_file;
                
                // ROOT FIX: CONDITIONAL LOADING LOGIC
                // Load if:
                // 1. Component is actually used in the preview, OR
                // 2. No state exists yet and this is a core component
                $should_load = $load_all ? in_array($component_type, $core_components) : in_array($component_type, $used_components);
                
                if ($should_load) {
                    // Only load if file actually exists (safety check)
                    if (file_exists($styles_path)) {
                        $styles_version = defined('WP_DEBUG') && WP_DEBUG ? time() : filemtime($styles_path);
                        $styles_url = GUESTIFY_PLUGIN_URL . 'components/' . $component_type . '/' . $styles_file;
                        
                        wp_enqueue_style(
                            'gmkb-component-' . $component_type,
                            $styles_url,
                            array('gmkb-design-system-builder'),
                            $styles_version
                        );
                        
                        $loaded_count++;
                        
                        if (defined('WP_DEBUG') && WP_DEBUG) {
                            error_log('✅ GMKB Builder Dynamic CSS: Loaded component CSS: ' . $component_type);
                        }
                    } else {
                        $missing_count++;
                        if (defined('WP_DEBUG') && WP_DEBUG) {
                            error_log('⚠️ GMKB Builder Dynamic CSS: Component declares stylesheet but file missing: ' . $component_type . ' → ' . $styles_path);
                        }
                    }
                } else {
                    // Component CSS not needed - skip it
                    $skipped_count++;
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('⏭️  GMKB Builder Dynamic CSS: Skipped unused component CSS: ' . $component_type);
                    }
                }
            }
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            $total_components = count($gmkb_data['componentRegistry']);
            error_log('✅ GMKB Builder Dynamic CSS Summary:');
            error_log('  - Total components in registry: ' . $total_components);
            error_log('  - Components with CSS in preview: ' . count($used_components));
            error_log('  - CSS files loaded: ' . $loaded_count);
            error_log('  - CSS files skipped (unused): ' . $skipped_count);
            error_log('  - Declared but file missing: ' . $missing_count);
            if (!empty($used_components)) {
                error_log('  - Components requiring CSS: ' . implode(', ', $used_components));
            } else {
                error_log('  - No saved state: Loaded core components only (' . implode(', ', $core_components) . ')');
            }
        }
    }
    
    // --- FONT AWESOME ---
    // ROOT FIX: Load Font Awesome 6.5 for builder icons (reset buttons, component icons, etc.)
    // The standalone builder template needs its own FA instance
    wp_enqueue_style(
        'gmkb-font-awesome',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
        array(),
        '6.5.1'
    );
    
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('✅ GMKB: Font Awesome 6.5.1 loaded');
    }
}


/**
 * Prepares the gmkbData object for injection into the page.
 * ROOT FIX: This is now called from gmkb_enqueue_vue_only_assets() and used with wp_add_inline_script()
 * @return array The prepared data array
 */
function gmkb_prepare_data_for_injection() {
    // STEP 1: Get post ID
    $post_id = gmkb_get_post_id();
    
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('🔍 GMKB DATA PREP - STEP 1: Post ID = ' . $post_id);
    }
    
    // STEP 2: Validate post exists
    if (!$post_id || !get_post($post_id)) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('❌ GMKB DATA PREP - STEP 2 FAILED: Invalid post_id');
        }
        return array(); // Return empty array if post is invalid
    }
    
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('✅ GMKB DATA PREP - STEP 2: Post exists');
    }
    
    // STEP 3: Check user login status (informational only - not blocking)
    $is_logged_in = is_user_logged_in();
    $user_id = get_current_user_id();
    
    if (defined('WP_DEBUG') && WP_DEBUG) {
        if ($is_logged_in) {
            error_log('✅ GMKB DATA PREP - STEP 3: User logged in (ID: ' . $user_id . ') - can save changes');
        } else {
            error_log('🔵 GMKB DATA PREP - STEP 3: User NOT logged in (view/edit only, cannot save)');
        }
    }
    
    // STEP 4: Check user permissions (only if logged in)
    $can_edit = false;
    if ($is_logged_in) {
        $post = get_post($post_id);
        $post_type_object = get_post_type_object($post->post_type);
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('🔍 GMKB DATA PREP - STEP 4: Checking permissions for post type = ' . $post->post_type);
        }
        
        // Get the appropriate capability for this post type
        $edit_cap = $post_type_object->cap->edit_post ?? 'edit_post';
        
        // Check if user can edit this specific post
        $can_edit = current_user_can($edit_cap, $post_id);
        
        // Fallback: Check if they can edit posts of this type at all
        if (!$can_edit) {
            $edit_posts_cap = $post_type_object->cap->edit_posts ?? 'edit_posts';
            $can_edit = current_user_can($edit_posts_cap);
        }
        
        // Additional fallback for administrators
        if (!$can_edit && current_user_can('manage_options')) {
            $can_edit = true;
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            if ($can_edit) {
                error_log('✅ GMKB DATA PREP - STEP 4: User has permission to save (cap: ' . $edit_cap . ')');
            } else {
                error_log('⚠️ GMKB DATA PREP - STEP 4: User logged in but lacks save permission');
            }
        }
    }
    
    $nonce = wp_create_nonce('gmkb_nonce');

    // STEP 5: Include required class files
    require_once GUESTIFY_PLUGIN_DIR . 'system/ComponentDiscovery.php';
    require_once GUESTIFY_PLUGIN_DIR . 'system/ThemeDiscovery.php';
    
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('✅ GMKB DATA PREP - STEP 5: Required classes loaded');
    }

    // Ensure restUrl has trailing slash
    $rest_url = rest_url();
    if (substr($rest_url, -1) !== '/') {
        $rest_url .= '/';
    }
    
    // STEP 6: Gather component data
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('🔍 GMKB DATA PREP - STEP 6: Gathering component registry...');
    }
    $component_registry = gmkb_get_component_registry_data();
    $component_count = is_array($component_registry) ? count($component_registry) : 0;
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('✅ GMKB DATA PREP - STEP 6: Component registry loaded (' . $component_count . ' components)');
    }
    
    // STEP 7: Gather theme data
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('🔍 GMKB DATA PREP - STEP 7: Gathering themes...');
    }
    $themes = gmkb_get_theme_data();
    $theme_count = is_array($themes) ? count($themes) : 0;
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('✅ GMKB DATA PREP - STEP 7: Themes loaded (' . $theme_count . ' themes)');
    }
    
    // STEP 8: Get saved state
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('🔍 GMKB DATA PREP - STEP 8: Loading saved state...');
    }
    $saved_state = gmkb_get_saved_state($post_id);
    if (defined('WP_DEBUG') && WP_DEBUG) {
        if ($saved_state) {
            error_log('✅ GMKB DATA PREP - STEP 8: Saved state loaded');
        } else {
            error_log('🔵 GMKB DATA PREP - STEP 8: No saved state (new media kit)');
        }
    }
    
    // STEP 9: Pods data - PHASE 8 FIX: Always call gmkb_get_pods_data()
    // It will use native WordPress meta fallback if Pods is not available
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('🔍 GMKB DATA PREP - STEP 9: Loading profile data...');
    }
    
    // PHASE 8 FIX: Always call this - it handles native fallback internally
    $pods_data = gmkb_get_pods_data($post_id);
    
    if (defined('WP_DEBUG') && WP_DEBUG) {
        $field_count = count($pods_data);
        if ($field_count > 0) {
            error_log('✅ GMKB DATA PREP - STEP 9: Loaded ' . $field_count . ' profile fields');
        } else {
            error_log('⚠️ GMKB DATA PREP - STEP 9: No profile data available');
        }
    }
    
    // STEP 10: Build final data array
    // ROOT FIX: Include pods_data if we managed to load it, otherwise Vue will fetch via REST API

    // ROOT FIX: Load deprecation configuration (empty by default, can be extended via filter)
    $deprecation_config = apply_filters('gmkb_deprecation_config', array());

    // PHASE 1: Branding Integration (2025-12-16)
    // Fetch profile branding from post meta for theme synchronization
    $profile_branding = gmkb_get_profile_branding($post_id);

    $gmkb_data = array(
        'ajaxUrl'           => admin_url('admin-ajax.php'),
        'nonce'             => $nonce,
        'postId'            => $post_id,
        'postType'          => get_post_type($post_id),
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
        'componentRegistry' => $component_registry,
        'themes'            => $themes,
        'savedState'        => $saved_state,
        'pods_data'         => $pods_data, // ROOT FIX: Include if available, empty array if not
        // PHASE 1: Profile branding data for theme synchronization
        'profileBranding'   => $profile_branding,
        // ROOT FIX: Inject deprecation configuration for ComponentDeprecationManager
        // Empty array by default - add deprecated components via 'gmkb_deprecation_config' filter
        'deprecationConfig' => $deprecation_config,
        // ROOT FIX: Inject API Configuration for usePodsFieldUpdate composable
        'apiSettings'       => array(
            'apiUrl' => esc_url_raw($rest_url . 'gmkb/v2'),
            'nonce' => wp_create_nonce('wp_rest'),
        ),
        // CARRD-STYLE: User status for frontend (can view/edit without login, but need login to save)
        'user'              => array(
            'isLoggedIn'    => $is_logged_in,
            'userId'        => $user_id,
            'canSave'       => $can_edit,
            'loginUrl'      => wp_login_url($_SERVER['REQUEST_URI'] ?? ''),
        ),
    );

    // STEP 11: Final validation and debugging
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('✅ GMKB DATA PREP - STEP 10: Final data array built');
        error_log('📊 GMKB DATA PREP - FINAL SUMMARY:');
        error_log('  - Post ID: ' . $post_id);
        error_log('  - User Status: ' . ($is_logged_in ? 'Logged in (ID: ' . $user_id . ')' : 'Guest (view/edit only)'));
        error_log('  - Can Save: ' . ($can_edit ? 'YES' : 'NO (login required)'));
        error_log('  - Components: ' . $component_count);
        error_log('  - Themes: ' . $theme_count);
        error_log('  - Has saved state: ' . ($saved_state ? 'YES' : 'NO'));
        error_log('  - Pods data: ' . count($pods_data) . ' fields loaded');
        error_log('  - Profile branding: ' . ($profile_branding['hasBrandingData'] ? 'YES' : 'NO'));
        error_log('  - Deprecation config: ' . count($deprecation_config) . ' deprecated components');
        error_log('  - Data keys: ' . implode(', ', array_keys($gmkb_data)));

        // Critical check: Verify componentRegistry is not empty
        if (empty($gmkb_data['componentRegistry'])) {
            error_log('❌ GMKB DATA PREP - WARNING: componentRegistry is EMPTY!');
        }
    }
    
    return $gmkb_data;
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
                    $themes_array[] = array(
                        'id' => $theme_data['theme_id'] ?? $theme_id,
                        'name' => $theme_data['theme_name'] ?? $theme_data['name'] ?? ucfirst(str_replace('_', ' ', $theme_id)),
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
    
    // PHASE 8 FIX: If Pods is not available, use native WordPress meta fallback
    if (!function_exists('pods') || !class_exists('Pods')) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('ℹ️ gmkb_get_pods_data: Pods not available, using native WordPress meta fallback');
        }
        return gmkb_get_native_meta_data($post_id);
    }
    
    try {
        // Get post type (support both 'mkcg' and 'guests')
        $post = get_post($post_id);
        if (!$post) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ gmkb_get_pods_data: Post #' . $post_id . ' not found');
            }
            return $pods_data;
        }
        
        $post_type = $post->post_type;
        
        if (!in_array($post_type, array('mkcg', 'guests'))) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('⚠️ gmkb_get_pods_data: Skipping Pods data - invalid post_type: ' . $post_type);
            }
            return $pods_data;
        }
        
        // ROOT FIX: Get field list using ComponentDiscovery (matches REST API v2)
        global $gmkb_component_discovery;
        $fields = array();
        
        // Try to get fields from ComponentDiscovery
        if ($gmkb_component_discovery && is_object($gmkb_component_discovery)) {
            // Check if components have been scanned
            $components = $gmkb_component_discovery->getComponents();
            if (empty($components)) {
                // Force a scan if no components found
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('⚠️ gmkb_get_pods_data: No components found, forcing scan...');
                }
                try {
                    $gmkb_component_discovery->scan(false);
                } catch (Exception $e) {
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('❌ gmkb_get_pods_data: Component scan failed: ' . $e->getMessage());
                    }
                }
            }
            
            // Now try to get the Pods fields
            if (method_exists($gmkb_component_discovery, 'getRequiredPodsFields')) {
                $fields = $gmkb_component_discovery->getRequiredPodsFields();
                
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('✅ gmkb_get_pods_data: Using ' . count($fields) . ' Pods fields from component discovery');
                }
            }
        }
        
        // FALLBACK: Manual field list if component discovery not available
        if (empty($fields)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('⚠️ gmkb_get_pods_data: No Pods fields from component discovery, using fallback field list');
            }
            
            $fields = array(
                // Base fields
                'biography',
                'biography_long',
                'introduction',
                'first_name',
                'last_name',
                'email',
                'phone',
                'website',
                'headshot',
                'expertise',
                'achievements'
            );
            
            // Add topics (1-5)
            for ($i = 1; $i <= 5; $i++) {
                $fields[] = "topic_$i";
            }
            
            // Add questions (1-10)
            for ($i = 1; $i <= 10; $i++) {
                $fields[] = "question_$i";
            }
            
            // Add social media fields
            $fields[] = '1_facebook';
            $fields[] = '1_instagram';
            $fields[] = '1_linkedin';
            $fields[] = '1_pinterest';
            $fields[] = '1_tiktok';
            $fields[] = '1_twitter';
            $fields[] = 'guest_youtube';
            $fields[] = '1_website';
            $fields[] = '2_website';
            
            // Add media fields
            $fields[] = 'profile_image';
            $fields[] = 'gallery_images';
            $fields[] = 'video_intro';
        }
        
        // ROOT FIX: Add timing for debugging
        $start_time = microtime(true);
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('🔍 gmkb_get_pods_data: Creating Pods object for ' . $post_type . ' #' . $post_id);
            error_log('  Pods fields to fetch: ' . count($fields));
        }
        
        // ROOT FIX: Create Pods object with better error handling
        $pod = pods($post_type, $post_id);
        
        // ROOT FIX: More thorough existence check (matches REST API v2)
        if (!$pod || !is_object($pod) || !method_exists($pod, 'exists')) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('❌ gmkb_get_pods_data: Pods object invalid');
                error_log('  - Pod object: ' . (is_object($pod) ? 'YES' : 'NO'));
                error_log('  - Has exists method: ' . (is_object($pod) && method_exists($pod, 'exists') ? 'YES' : 'NO'));
            }
            return $pods_data;
        }
        
        // ROOT FIX: REMOVE the $pod->exists() check - it fails early in WP lifecycle
        // REST API v2 doesn't strictly require this check, and it works fine
        // The Pod object is valid if we got here, so just try to fetch fields
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ gmkb_get_pods_data: Pods ready, fetching ' . count($fields) . ' fields');
        }
        
        // ROOT FIX: Fetch all fields in one query (matches REST API v2)
        foreach ($fields as $field) {
            try {
                $value = $pod->field($field);
                
                // ROOT FIX: Only store non-empty values to reduce payload size
                if (!empty($value) || $value === '0' || $value === 0) {
                    // Handle complex types
                    if (is_array($value) || is_object($value)) {
                        if (is_array($value) && isset($value['guid'])) {
                            // Image/file field - use URL
                            $pods_data[$field] = $value['guid'];
                        } elseif (is_array($value) && isset($value[0])) {
                            // Array of values - use first one
                            $pods_data[$field] = is_string($value[0]) ? $value[0] : null;
                        } else {
                            // Can't convert - skip it
                            continue;
                        }
                    } else {
                        // Simple value
                        $pods_data[$field] = $value;
                    }
                }
            } catch (Exception $e) {
                // ROOT FIX: Individual field errors shouldn't stop the whole process
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('⚠️ gmkb_get_pods_data: Error fetching field "' . $field . '": ' . $e->getMessage());
                }
                continue;
            }
        }
        
        // ROOT FIX: Enhanced debugging output (matches REST API v2)
        if (defined('WP_DEBUG') && WP_DEBUG) {
            $elapsed = round((microtime(true) - $start_time) * 1000, 2);
            $non_empty = count($pods_data);
            error_log('✅ gmkb_get_pods_data: Fetched ' . $non_empty . '/' . count($fields) . ' non-empty Pods fields in ' . $elapsed . 'ms');
            
            // Sample some data for verification
            if ($non_empty > 0) {
                $sample_fields = array_slice(array_keys($pods_data), 0, 5);
                error_log('  Sample fields: ' . implode(', ', $sample_fields));
            } else {
                error_log('⚠️ WARNING: All Pods fields are empty! This guest may have no data.');
            }
        }
        
    } catch (Exception $e) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('❌ gmkb_get_pods_data: Exception: ' . $e->getMessage());
            error_log('  Stack trace: ' . $e->getTraceAsString());
        }
    }
    
    return $pods_data;
}

/**
 * PHASE 1: Branding Integration (2025-12-16)
 *
 * Profile branding functions have been moved to includes/profile-branding.php
 * to eliminate code duplication between enqueue.php and REST API v2.
 *
 * Available functions from profile-branding.php:
 * - gmkb_get_profile_branding($post_id) - Get all branding data
 * - gmkb_expand_branding_image($post_id, $meta_key) - Expand single image
 * - gmkb_expand_branding_gallery($post_id, $meta_key) - Expand gallery
 *
 * @see includes/profile-branding.php
 */

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

/**
 * PHASE 8: Fetch profile data using native WordPress meta functions
 * 
 * This is the fallback when Pods plugin is not active.
 * Uses get_post_meta() to read the same data that Pods stored.
 * 
 * @param int $post_id The post ID
 * @return array Profile data
 */
function gmkb_get_native_meta_data($post_id) {
    $data = array();
    
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('🔍 gmkb_get_native_meta_data: Fetching native meta data for post #' . $post_id);
    }
    
    // Define all fields to fetch (same as Pods fields)
    $fields = array(
        // Personal info
        'first_name', 'last_name', 'biography', 'biography_long', 'introduction',
        // Contact info
        'email', 'phone', 'skype', 'address', 'city', 'state', 'zip', 'country', 'timezone',
        // Social media (legacy names)
        '1_twitter', '1_facebook', '1_instagram', '1_linkedin', '1_tiktok', '1_pinterest',
        'guest_youtube', '1_website', '2_website',
        // Social media (new names)
        'social_twitter', 'social_facebook', 'social_instagram', 'social_linkedin',
        'social_tiktok', 'social_pinterest', 'social_youtube', 'website_primary', 'website_secondary',
        // Media
        'headshot', 'guest_headshot', 'profile_photo', 'personal_brand_logo', 'company_logo',
        'gallery_photos', 'featured_logos', 'video_intro', 'calendar_url',
    );
    
    // Add topics 1-5
    for ($i = 1; $i <= 5; $i++) {
        $fields[] = "topic_$i";
    }
    
    // Add questions 1-25
    for ($i = 1; $i <= 25; $i++) {
        $fields[] = "question_$i";
    }
    
    // Fetch each field
    foreach ($fields as $field) {
        $value = get_post_meta($post_id, $field, true);
        
        // Handle media fields - expand to full object if it's an attachment ID
        if (!empty($value) && in_array($field, array('headshot', 'guest_headshot', 'profile_photo', 'personal_brand_logo', 'company_logo'))) {
            $attachment_id = is_array($value) && isset($value['ID']) ? $value['ID'] : absint($value);
            if ($attachment_id) {
                $attachment = get_post($attachment_id);
                if ($attachment && $attachment->post_type === 'attachment') {
                    $value = array(
                        'ID' => $attachment_id,
                        'guid' => wp_get_attachment_url($attachment_id),
                        'post_title' => $attachment->post_title,
                        'post_mime_type' => $attachment->post_mime_type,
                    );
                }
            }
        }
        
        // Handle gallery fields - expand array of IDs to full objects
        if (!empty($value) && in_array($field, array('gallery_photos', 'featured_logos'))) {
            $value = maybe_unserialize($value);
            if (is_array($value)) {
                $expanded = array();
                foreach ($value as $item) {
                    $attachment_id = is_array($item) && isset($item['ID']) ? $item['ID'] : absint($item);
                    if ($attachment_id) {
                        $attachment = get_post($attachment_id);
                        if ($attachment && $attachment->post_type === 'attachment') {
                            $expanded[] = array(
                                'ID' => $attachment_id,
                                'guid' => wp_get_attachment_url($attachment_id),
                                'post_title' => $attachment->post_title,
                                'post_mime_type' => $attachment->post_mime_type,
                            );
                        }
                    }
                }
                $value = $expanded;
            }
        }
        
        // Only store non-empty values
        if (!empty($value) || $value === '0' || $value === 0) {
            $data[$field] = $value;
        }
    }
    
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('✅ gmkb_get_native_meta_data: Fetched ' . count($data) . ' native meta fields');
        if (count($data) > 0) {
            error_log('  Sample fields: ' . implode(', ', array_slice(array_keys($data), 0, 5)));
        }
    }
    
    return $data;
}

// ROOT FIX: Debug console logging extracted to separate file
// Only loads when WP_DEBUG is enabled
add_action('wp_footer', 'gmkb_load_debug_console', 100);
add_action('admin_footer', 'gmkb_load_debug_console', 100);
function gmkb_load_debug_console() {
    if (!gmkb_is_builder_page()) return;
    
    // ROOT FIX: Check if debug console file exists before loading
    $debug_console_file = GUESTIFY_PLUGIN_DIR . 'includes/debug/console-logger.php';
    if (file_exists($debug_console_file)) {
        require_once $debug_console_file;
        gmkb_debug_console_diagnostics();
    } else {
        // File doesn't exist - skip debug console logging
        // This is not a critical error, so we just skip it silently
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('⚠️ GMKB: Debug console file not found (non-critical): ' . $debug_console_file);
        }
    }
}
