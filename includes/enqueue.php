<?php
/**
 * Clean Enqueue System - Single Filter Approach
 *
 * @package Guestify
 * @version 4.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

// ===============================================
// HELPER FUNCTIONS (Must be defined first)
// ===============================================

/**
 * Get list of components actually used on the current page
 */
function gmkb_get_used_components_for_page() {
    global $post;
    if (!$post || !is_singular('guests')) {
        return array();
    }

    $state = get_post_meta($post->ID, 'gmkb_media_kit_state', true);
    if (empty($state)) {
        return array();
    }

    $used_components = array();
    if (isset($state['components']) && is_array($state['components'])) {
        foreach ($state['components'] as $component_id => $component) {
            if (isset($component['type']) && !in_array($component['type'], $used_components)) {
                $used_components[] = $component['type'];
            }
        }
    }

    return $used_components;
}

function gmkb_is_builder_page() {
    // Admin edit screen
    if (is_admin()) {
        $screen = get_current_screen();
        if ($screen && $screen->post_type === 'guests' && $screen->base === 'post') {
            return true;
        }
        return false;
    }

    // Frontend: Check URL pattern
    if (!isset($_SERVER['REQUEST_URI'])) {
        return false;
    }

    $uri = $_SERVER['REQUEST_URI'];

    return (
        preg_match('#/tools/media-kit($|/|\?|&)#', $uri) !== 0 ||
        preg_match('#^/media-kit($|/|\?|&)#', $uri) !== 0 ||
        preg_match('#^/guestify-media-kit($|/|\?|&)#', $uri) !== 0
    );
}

function gmkb_is_frontend_display() {
    if (isset($_GET['mkcg_id']) || is_admin()) {
        return false;
    }
    return is_singular('guests');
}

// ===============================================
// CLEAN FILTER APPROACH - OUTPUT BLOCKING
// ===============================================

function gmkb_filter_jquery_script_tag($tag, $handle, $src) {
    if (gmkb_is_builder_page()) {
        return $tag;
    }

    if (!gmkb_is_frontend_display()) {
        return $tag;
    }

    $blocked_scripts = array('jquery', 'jquery-core', 'jquery-migrate', 'wp-embed');

    if (in_array($handle, $blocked_scripts)) {
        return '';
    }

    return $tag;
}

function gmkb_filter_style_tag($tag, $handle, $href, $media) {
    if (!gmkb_is_frontend_display()) {
        return $tag;
    }

    $blocked_styles = array(
        'guestify-style', 'guestify-style-css', 'wpf-admin-bar',
        'contact-form-7', 'wp-block-library', 'wp-block-library-theme', 'global-styles',
    );

    if (in_array($handle, $blocked_styles) ||
        stripos($handle, 'theme') !== false ||
        stripos($handle, 'guestify') !== false) {
        return '';
    }

    return $tag;
}

// ===============================================
// MAIN ENQUEUE HOOKS
// ===============================================

add_action('wp_enqueue_scripts', 'gmkb_enqueue_vue_only_assets', 20);
add_action('admin_enqueue_scripts', 'gmkb_enqueue_vue_only_assets', 20);
add_action('wp_enqueue_scripts', 'gmkb_enqueue_frontend_assets', 20);

function gmkb_enqueue_frontend_assets() {
    if (!gmkb_is_frontend_display()) {
        return;
    }

    // Design system CSS
    $design_system_path = GUESTIFY_PLUGIN_DIR . 'design-system/index.css';
    if (file_exists($design_system_path)) {
        wp_enqueue_style(
            'gmkb-design-system',
            GUESTIFY_PLUGIN_URL . 'design-system/index.css',
            array(),
            filemtime($design_system_path)
        );
    }

    // Dynamic CSS loading
    $used_components = gmkb_get_used_components_for_page();
    $load_all_css = empty($used_components);

    $components_dir = GUESTIFY_PLUGIN_DIR . 'components/';
    if (is_dir($components_dir)) {
        $component_folders = glob($components_dir . '*', GLOB_ONLYDIR);

        foreach ($component_folders as $component_path) {
            $component_name = basename($component_path);
            $styles_path = $component_path . '/styles.css';

            if (file_exists($styles_path)) {
                if ($load_all_css || in_array($component_name, $used_components)) {
                    wp_enqueue_style(
                        'gmkb-component-' . $component_name,
                        GUESTIFY_PLUGIN_URL . 'components/' . $component_name . '/styles.css',
                        array('gmkb-design-system'),
                        filemtime($styles_path)
                    );
                }
            }
        }
    }
}

add_filter('script_loader_tag', 'gmkb_filter_jquery_script_tag', 10, 3);
add_filter('style_loader_tag', 'gmkb_filter_style_tag', 10, 4);

// Block WordPress 6.7+ auto-sizes CSS on media kit pages
add_action('template_redirect', 'gmkb_remove_wp_auto_sizes_action', 1);
function gmkb_remove_wp_auto_sizes_action() {
    if (gmkb_is_frontend_display() || gmkb_is_builder_page()) {
        remove_action('wp_head', 'wp_print_auto_sizes_contain_intrinsic_size_style');
    }
}

add_filter('wp_img_tag_add_auto_sizes', 'gmkb_disable_auto_sizes_mediakit_only', 1);
function gmkb_disable_auto_sizes_mediakit_only($add_auto_sizes) {
    if (gmkb_is_frontend_display() || gmkb_is_builder_page()) {
        return false;
    }
    return $add_auto_sizes;
}

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

    // JavaScript bundle
    $script_version = defined('WP_DEBUG') && WP_DEBUG ? time() : filemtime($bundle_js_path);
    wp_enqueue_script('gmkb-vue-app', GUESTIFY_PLUGIN_URL . 'dist/gmkb.iife.js', array(), $script_version, true);

    // Inject gmkbData
    $gmkb_data = gmkb_prepare_data_for_injection();

    if (empty($gmkb_data)) {
        $inline_script = 'console.error("GMKB: Data preparation failed");window.gmkbData = null;';
    } else {
        $json_data = json_encode($gmkb_data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP);
        $inline_script = sprintf('window.gmkbData = %s;', $json_data);
        $inline_script .= 'console.log("GMKB: Data loaded successfully");';
    }

    wp_add_inline_script('gmkb-vue-app', $inline_script, 'before');

    // CSS bundle
    $css_paths = array(
        'gmkb.css' => GUESTIFY_PLUGIN_DIR . 'dist/gmkb.css',
        'style.css' => GUESTIFY_PLUGIN_DIR . 'dist/style.css'
    );

    foreach ($css_paths as $filename => $path) {
        if (file_exists($path)) {
            $style_version = defined('WP_DEBUG') && WP_DEBUG ? time() : filemtime($path);
            wp_enqueue_style('gmkb-vue-style', GUESTIFY_PLUGIN_URL . 'dist/' . $filename, array(), $style_version);
            break;
        }
    }

    // Design system CSS in builder
    $design_system_path = GUESTIFY_PLUGIN_DIR . 'design-system/index.css';
    if (file_exists($design_system_path)) {
        $design_system_version = defined('WP_DEBUG') && WP_DEBUG ? time() : filemtime($design_system_path);
        wp_enqueue_style(
            'gmkb-design-system-builder',
            GUESTIFY_PLUGIN_URL . 'design-system/index.css',
            array('gmkb-vue-style'),
            $design_system_version
        );
    }

    // Dynamic CSS loading for builder
    $post_id = gmkb_get_post_id();
    $saved_state = gmkb_get_saved_state($post_id);

    $used_components = array();
    if ($saved_state && isset($saved_state['sections']) && is_array($saved_state['sections'])) {
        foreach ($saved_state['sections'] as $section) {
            if (isset($section['components']) && is_array($section['components'])) {
                foreach ($section['components'] as $component_ref) {
                    $component_id = is_string($component_ref) ? $component_ref : $component_ref['component_id'];
                    if (isset($saved_state['components'][$component_id]['type'])) {
                        $component_type = $saved_state['components'][$component_id]['type'];
                        if (!in_array($component_type, $used_components)) {
                            $used_components[] = $component_type;
                        }
                    }
                }
            }
            if (isset($section['columns']) && is_array($section['columns'])) {
                foreach ($section['columns'] as $column => $component_ids) {
                    if (is_array($component_ids)) {
                        foreach ($component_ids as $component_id) {
                            if (isset($saved_state['components'][$component_id]['type'])) {
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

    // Load component CSS from registry
    $gmkb_data = gmkb_prepare_data_for_injection();
    if (isset($gmkb_data['componentRegistry']) && is_array($gmkb_data['componentRegistry'])) {
        $load_all = empty($used_components);
        $core_components = array('hero', 'biography', 'contact');

        foreach ($gmkb_data['componentRegistry'] as $component_type => $component_info) {
            if (!empty($component_info['styles'])) {
                $styles_file = $component_info['styles'];
                $styles_path = GUESTIFY_PLUGIN_DIR . 'components/' . $component_type . '/' . $styles_file;

                $should_load = $load_all ? in_array($component_type, $core_components) : in_array($component_type, $used_components);

                if ($should_load && file_exists($styles_path)) {
                    $styles_version = defined('WP_DEBUG') && WP_DEBUG ? time() : filemtime($styles_path);
                    wp_enqueue_style(
                        'gmkb-component-' . $component_type,
                        GUESTIFY_PLUGIN_URL . 'components/' . $component_type . '/' . $styles_file,
                        array('gmkb-design-system-builder'),
                        $styles_version
                    );
                }
            }
        }
    }

    // Font Awesome
    wp_enqueue_style(
        'gmkb-font-awesome',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
        array(),
        '6.5.1'
    );
}

function gmkb_prepare_data_for_injection() {
    $post_id = gmkb_get_post_id();
    $is_new_media_kit = (!$post_id || !get_post($post_id));

    $is_logged_in = is_user_logged_in();
    $user_id = get_current_user_id();

    // For new media kits, everyone can edit until they try to save
    // Save will require registration
    $can_edit = true;
    $can_save = false;

    if ($is_logged_in) {
        // Logged in users can always save new media kits
        if ($is_new_media_kit) {
            $can_save = true;
        } else {
            // For existing media kits, check edit permissions
            $post = get_post($post_id);
            $post_type_object = get_post_type_object($post->post_type);
            $edit_cap = $post_type_object->cap->edit_post ?? 'edit_post';
            $can_save = current_user_can($edit_cap, $post_id);

            if (!$can_save) {
                $edit_posts_cap = $post_type_object->cap->edit_posts ?? 'edit_posts';
                $can_save = current_user_can($edit_posts_cap);
            }

            if (!$can_save && current_user_can('manage_options')) {
                $can_save = true;
            }
        }
    }

    $nonce = wp_create_nonce('gmkb_nonce');

    require_once GUESTIFY_PLUGIN_DIR . 'system/ComponentDiscovery.php';
    require_once GUESTIFY_PLUGIN_DIR . 'system/ThemeDiscovery.php';

    $rest_url = rest_url('gmkb/v2/');
    if (substr($rest_url, -1) !== '/') {
        $rest_url .= '/';
    }

    $component_registry = gmkb_get_component_registry_data();
    $themes = gmkb_get_theme_data();
    $deprecation_config = apply_filters('gmkb_deprecation_config', array());

    // For new media kits, provide empty defaults
    $linked_profile_id = null;
    if ($is_new_media_kit) {
        $saved_state = null;
        $pods_data = array();
        $profile_branding = null;
        $post_type = 'guests';
        $post_title = 'New Media Kit';
    } else {
        $saved_state = gmkb_get_saved_state($post_id);
        $pods_data = gmkb_get_pods_data($post_id);
        $profile_branding = gmkb_get_profile_branding($post_id);
        $post_type = get_post_type($post_id);
        $post_title = get_the_title($post_id);

        // Get linked profile ID from media kit meta
        // Check both meta keys for backwards compatibility
        $linked_profile_id = get_post_meta($post_id, '_gmkb_profile_id', true);
        if (empty($linked_profile_id)) {
            $linked_profile_id = get_post_meta($post_id, 'profile_id', true);
        }
        $linked_profile_id = $linked_profile_id ? intval($linked_profile_id) : null;
    }

    // Also check URL parameter for profile_id (explicit override)
    if (isset($_GET['profile_id']) && is_numeric($_GET['profile_id'])) {
        $linked_profile_id = intval($_GET['profile_id']);
    }

    // Get linked profile name for display in header
    $linked_profile_name = null;
    $linked_profile_slug = null;
    $linked_profile_edit_url = null;
    if ($linked_profile_id) {
        $profile_post = get_post($linked_profile_id);
        if ($profile_post) {
            // Get profile slug for edit URL
            $linked_profile_slug = $profile_post->post_name;

            // Construct profile edit URL (frontend profile editor)
            if ($linked_profile_slug) {
                $linked_profile_edit_url = home_url('/app/profiles/guest/profile/?entry=' . $linked_profile_slug);
            }

            // Try to get a display name from meta, fall back to post title
            $linked_profile_name = get_post_meta($linked_profile_id, 'guest_name', true);
            if (empty($linked_profile_name)) {
                $linked_profile_name = get_post_meta($linked_profile_id, 'name', true);
            }
            if (empty($linked_profile_name)) {
                $linked_profile_name = $profile_post->post_title;
            }
        }
    }

    // Get view URL for the media kit (public permalink)
    $view_url = null;
    $preview_url = null;
    if ($post_id && !$is_new_media_kit) {
        $post = get_post($post_id);
        $post_status = get_post_status($post_id);

        // For published posts, use the actual permalink
        if ($post_status === 'publish') {
            $view_url = get_permalink($post_id);
        } else {
            // For draft posts, construct the URL from slug to show what it WILL be
            // get_permalink() returns ugly URL for drafts, so we build it manually
            $post_type_obj = get_post_type_object($post->post_type);
            $rewrite_slug = $post_type_obj->rewrite['slug'] ?? $post->post_type;
            $post_slug = $post->post_name;

            // If no slug yet, generate one from the title
            if (empty($post_slug)) {
                $post_slug = sanitize_title($post->post_title);
            }

            // Construct the pretty permalink
            $view_url = trailingslashit(home_url($rewrite_slug . '/' . $post_slug));

            // Also provide a working preview URL
            $preview_url = add_query_arg('preview', 'true', get_permalink($post_id));
        }
    }

    // Build registration URL for anonymous users
    $register_url = wp_registration_url();
    $current_url = $_SERVER['REQUEST_URI'] ?? '/tools/media-kit/';

    return array(
        'ajaxUrl'           => admin_url('admin-ajax.php'),
        'nonce'             => $nonce,
        'postId'            => $post_id ?: null,
        'postType'          => $post_type,
        'postTitle'         => $post_title,
        'isNewMediaKit'     => $is_new_media_kit,
        'linkedProfileId'   => $linked_profile_id,  // Profile linked to this media kit
        'profileId'         => $linked_profile_id,  // Alias for backwards compatibility
        'linkedProfileName' => $linked_profile_name, // Display name for header
        'linkedProfileSlug' => $linked_profile_slug, // Profile slug for URL construction
        'linkedProfileEditUrl' => $linked_profile_edit_url, // Frontend profile edit URL
        'viewUrl'           => $view_url,           // Public permalink for "View" link
        'previewUrl'        => $preview_url,        // Preview URL for draft posts
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
        // Profile data - preferred key for component profile integration (Phase 7)
        'profile_data'      => $pods_data,
        // @deprecated 2.6.0 - Use profile_data instead. Kept for backward compatibility.
        'pods_data'         => $pods_data,
        'profileBranding'   => $profile_branding,
        'deprecationConfig' => $deprecation_config,
        'apiSettings'       => array(
            'apiUrl' => esc_url_raw(rtrim($rest_url, '/')),
            'nonce' => wp_create_nonce('wp_rest'),
        ),
        'user'              => array(
            'isLoggedIn'    => $is_logged_in,
            'userId'        => $user_id,
            'canEdit'       => $can_edit,
            'canSave'       => $can_save,
            'loginUrl'      => wp_login_url($current_url),
            'registerUrl'   => add_query_arg('redirect_to', urlencode($current_url), $register_url),
        ),
    );
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
    if (!class_exists('ComponentDiscovery')) {
        return [];
    }

    $discovery = new ComponentDiscovery(GUESTIFY_PLUGIN_DIR . 'components/');

    // Clear caches
    $cache_key = 'gmkb_component_discovery_' . md5(GUESTIFY_PLUGIN_DIR . 'components/');
    delete_transient($cache_key);
    delete_transient('gmkb_components_cache');
    delete_transient('gmkb_component_registry');

    $discovery->scan(true);
    return $discovery->getComponents();
}

function gmkb_get_theme_data() {
    $themes_array = array();

    $theme_discovery_file = GUESTIFY_PLUGIN_DIR . 'system/ThemeDiscovery.php';
    if (file_exists($theme_discovery_file)) {
        require_once $theme_discovery_file;

        if (class_exists('ThemeDiscovery')) {
            try {
                $theme_dir = GUESTIFY_PLUGIN_DIR . 'themes/';
                $theme_discovery = new ThemeDiscovery($theme_dir);
                $theme_discovery->scan(true); // Force fresh scan to pick up new themes
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
                        'metadata' => $theme_data['metadata'] ?? array(),
                        'defaultContent' => $theme_data['defaultContent'] ?? null,
                        'isCustom' => false,
                        'isBuiltIn' => true
                    );
                }
            } catch (Exception $e) {
                // Theme discovery failed, use fallbacks
            }
        }
    }

    // Fallback themes
    if (empty($themes_array)) {
        $themes_array = array(
            array('id' => 'professional_clean', 'name' => 'Professional Clean', 'description' => 'Clean and professional design', 'colors' => array('primary' => '#3b82f6'), 'isCustom' => false, 'isBuiltIn' => true),
            array('id' => 'creative_bold', 'name' => 'Creative Bold', 'description' => 'Bold and creative design', 'colors' => array('primary' => '#f97316'), 'isCustom' => false, 'isBuiltIn' => true),
            array('id' => 'minimal_elegant', 'name' => 'Minimal Elegant', 'description' => 'Minimal and elegant design', 'colors' => array('primary' => '#18181b'), 'isCustom' => false, 'isBuiltIn' => true),
            array('id' => 'modern_dark', 'name' => 'Modern Dark', 'description' => 'Modern dark theme', 'colors' => array('primary' => '#8b5cf6'), 'isCustom' => false, 'isBuiltIn' => true),
        );
    }

    // Add custom themes
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

    if (!$saved_state) {
        return null;
    }

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
        if (is_null($value)) {
            $sanitized[$key] = null;
        } elseif (is_string($value) || is_numeric($value) || is_bool($value)) {
            $sanitized[$key] = $value;
        } elseif (is_array($value)) {
            $sanitized[$key] = array_map(function($item) {
                if (is_array($item)) {
                    return gmkb_sanitize_component_props($item);
                } elseif (is_object($item)) {
                    return null;
                } else {
                    return $item;
                }
            }, $value);
        } elseif (is_object($value)) {
            $sanitized[$key] = null;
        } else {
            $sanitized[$key] = null;
        }
    }

    return $sanitized;
}

function gmkb_get_pods_data($post_id) {
    $pods_data = array();

    if (!function_exists('pods') || !class_exists('Pods')) {
        return gmkb_get_native_meta_data($post_id);
    }

    try {
        $post = get_post($post_id);
        if (!$post) {
            return $pods_data;
        }

        $post_type = $post->post_type;

        if ($post_type !== 'guests') {
            return $pods_data;
        }

        global $gmkb_component_discovery;
        $fields = array();

        if ($gmkb_component_discovery && is_object($gmkb_component_discovery)) {
            $components = $gmkb_component_discovery->getComponents();
            if (empty($components)) {
                try {
                    $gmkb_component_discovery->scan(false);
                } catch (Exception $e) {
                    // Scan failed
                }
            }

            if (method_exists($gmkb_component_discovery, 'getRequiredPodsFields')) {
                $fields = $gmkb_component_discovery->getRequiredPodsFields();
            }
        }

        // Fallback field list
        if (empty($fields)) {
            $fields = array(
                'biography', 'biography_long', 'introduction', 'first_name', 'last_name',
                'email', 'phone', 'website', 'headshot', 'expertise', 'achievements'
            );

            for ($i = 1; $i <= 5; $i++) { $fields[] = "topic_$i"; }
            for ($i = 1; $i <= 10; $i++) { $fields[] = "question_$i"; }

            $fields = array_merge($fields, array(
                '1_facebook', '1_instagram', '1_linkedin', '1_pinterest', '1_tiktok',
                '1_twitter', 'guest_youtube', '1_website', '2_website',
                'profile_image', 'gallery_images', 'video_intro'
            ));
        }

        $pod = pods($post_type, $post_id);

        if (!$pod || !is_object($pod) || !method_exists($pod, 'exists')) {
            return $pods_data;
        }

        foreach ($fields as $field) {
            try {
                $value = $pod->field($field);

                if (!empty($value) || $value === '0' || $value === 0) {
                    if (is_array($value) || is_object($value)) {
                        if (is_array($value) && isset($value['guid'])) {
                            $pods_data[$field] = $value['guid'];
                        } elseif (is_array($value) && isset($value[0])) {
                            $pods_data[$field] = is_string($value[0]) ? $value[0] : null;
                        } else {
                            continue;
                        }
                    } else {
                        $pods_data[$field] = $value;
                    }
                }
            } catch (Exception $e) {
                continue;
            }
        }

    } catch (Exception $e) {
        // Exception caught
    }

    return $pods_data;
}

function gmkb_display_build_error_notice() {
    ?>
    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80%; max-width: 600px; background: #fff; border: 2px solid #d63638; padding: 30px; z-index: 99999;">
        <h2>Media Kit Builder Files Missing</h2>
        <p>The main application script has not been built yet. Please run the build command.</p>
        <div style="background: #f0f0f1; padding: 15px;"><code>npm install && npm run build</code></div>
    </div>
    <?php
}

function gmkb_get_native_meta_data($post_id) {
    $data = array();

    $fields = array(
        'first_name', 'last_name', 'biography', 'biography_long', 'introduction',
        'email', 'phone', 'skype', 'address', 'city', 'state', 'zip', 'country', 'timezone',
        '1_twitter', '1_facebook', '1_instagram', '1_linkedin', '1_tiktok', '1_pinterest',
        'guest_youtube', '1_website', '2_website',
        'social_twitter', 'social_facebook', 'social_instagram', 'social_linkedin',
        'social_tiktok', 'social_pinterest', 'social_youtube', 'website_primary', 'website_secondary',
        'headshot', 'guest_headshot', 'profile_photo', 'personal_brand_logo', 'company_logo',
        'gallery_photos', 'featured_logos', 'video_intro', 'calendar_url',
    );

    for ($i = 1; $i <= 5; $i++) { $fields[] = "topic_$i"; }
    for ($i = 1; $i <= 25; $i++) { $fields[] = "question_$i"; }

    $image_fields = array('headshot', 'guest_headshot', 'profile_photo', 'personal_brand_logo', 'company_logo');
    $gallery_fields = array('gallery_photos', 'featured_logos');

    foreach ($fields as $field) {
        $value = get_post_meta($post_id, $field, true);

        if (!empty($value) && in_array($field, $image_fields)) {
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

        if (!empty($value) && in_array($field, $gallery_fields)) {
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

        if (!empty($value) || $value === '0' || $value === 0) {
            $data[$field] = $value;
        }
    }

    return $data;
}

// Debug console loading
add_action('wp_footer', 'gmkb_load_debug_console', 100);
add_action('admin_footer', 'gmkb_load_debug_console', 100);
function gmkb_load_debug_console() {
    if (!gmkb_is_builder_page()) return;

    $debug_console_file = GUESTIFY_PLUGIN_DIR . 'includes/debug/console-logger.php';
    if (file_exists($debug_console_file)) {
        require_once $debug_console_file;
        gmkb_debug_console_diagnostics();
    }
}
