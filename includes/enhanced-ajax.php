<?php
/**
 * Enhanced AJAX Handlers for Schema-Driven System
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Get all available components
 */
add_action('wp_ajax_gmkb_get_components', 'gmkb_ajax_get_components');
function gmkb_ajax_get_components() {
    // Verify nonce
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
        wp_die('Security check failed');
    }
    
    $components_dir = GMKB_PLUGIN_DIR . 'components/';
    $components = array();
    
    if (is_dir($components_dir)) {
        $dirs = array_filter(glob($components_dir . '*'), 'is_dir');
        
        foreach ($dirs as $dir) {
            $component_name = basename($dir);
            $json_file = $dir . '/component.json';
            
            if (file_exists($json_file)) {
                $json_content = file_get_contents($json_file);
                $component_data = json_decode($json_content, true);
                
                if ($component_data) {
                    $component_data['type'] = $component_name;
                    $components[] = $component_data;
                }
            }
        }
    }
    
    // Sort by order
    usort($components, function($a, $b) {
        $order_a = isset($a['order']) ? $a['order'] : 999;
        $order_b = isset($b['order']) ? $b['order'] : 999;
        return $order_a - $order_b;
    });
    
    wp_send_json_success($components);
}

/**
 * Load design panel for a component
 */
add_action('wp_ajax_gmkb_load_design_panel', 'gmkb_ajax_load_design_panel');
function gmkb_ajax_load_design_panel() {
    // Verify nonce
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
        wp_die('Security check failed');
    }
    
    $component_type = sanitize_text_field($_POST['component_type']);
    $component_id = sanitize_text_field($_POST['component_id']);
    
    // Check if custom design panel exists
    $panel_file = GMKB_PLUGIN_DIR . 'components/' . $component_type . '/design-panel.php';
    
    if (file_exists($panel_file)) {
        // Load custom panel
        ob_start();
        include $panel_file;
        $panel_html = ob_get_clean();
        
        echo $panel_html;
    } else {
        // Return empty - JavaScript will generate from schema
        echo '';
    }
    
    wp_die();
}

/**
 * ROOT FIX: Load design panel for component (matching JavaScript expectation)
 * This is the AJAX handler that design-panel-loader.js expects
 */
add_action('wp_ajax_guestify_render_design_panel', 'guestify_ajax_render_design_panel');
function guestify_ajax_render_design_panel() {
    // Verify nonce - ROOT FIX: Match the nonce name from enqueue.php
    $nonce_to_check = $_POST['nonce'] ?? '';
    $valid_nonce = wp_verify_nonce($nonce_to_check, 'guestify_media_kit_builder') || 
                   wp_verify_nonce($nonce_to_check, 'guestify_nonce');
    
    if (empty($nonce_to_check) || !$valid_nonce) {
        // ROOT FIX: More detailed error logging for debugging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('GMKB AJAX Error: Nonce verification failed');
            error_log('GMKB: Received nonce: ' . substr($nonce_to_check, 0, 10) . '...');
        }
        wp_send_json_error('Security check failed - invalid nonce');
    }
    
    $component_type = sanitize_text_field($_POST['component']);
    
    if (empty($component_type)) {
        wp_send_json_error('Component type is required');
    }
    
    // Security: Validate component type to prevent path traversal
    if (!preg_match('/^[a-zA-Z0-9_-]+$/', $component_type)) {
        wp_send_json_error('Invalid component type');
    }
    
    // ROOT FIX: Enhanced path validation and loading
    $panel_file = GMKB_PLUGIN_DIR . 'components/' . $component_type . '/design-panel.php';
    
    // ROOT FIX: Log the panel loading attempt
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log("GMKB AJAX: Loading design panel for {$component_type}");
        error_log("GMKB: Panel file path: {$panel_file}");
        error_log("GMKB: Panel file exists: " . (file_exists($panel_file) ? 'YES' : 'NO'));
    }
    
    if (file_exists($panel_file)) {
        // Load custom panel
        ob_start();
        include $panel_file;
        $panel_html = ob_get_clean();
        
        if (empty($panel_html)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("GMKB AJAX Error: Panel file exists but returned empty content for {$component_type}");
            }
            wp_send_json_error('Failed to load design panel content - panel file returned empty content');
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("GMKB AJAX Success: Loaded custom design panel for {$component_type} (" . strlen($panel_html) . " chars)");
        }
        
        wp_send_json_success(array(
            'html' => $panel_html,
            'component' => $component_type,
            'source' => 'custom'
        ));
    } else {
        // Fallback: Return generic panel
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("GMKB AJAX: Using generic panel fallback for {$component_type}");
        }
        
        $generic_panel = guestify_get_generic_design_panel($component_type);
        wp_send_json_success(array(
            'html' => $generic_panel,
            'component' => $component_type,
            'fallback' => true,
            'source' => 'generic'
        ));
    }
}

/**
 * Generate generic design panel for components without custom panels
 */
function guestify_get_generic_design_panel($component_type) {
    $component_name = ucwords(str_replace(array('-', '_'), ' ', $component_type));
    
    return '
        <div class="element-editor__title">' . esc_html($component_name) . ' Settings</div>
        <div class="element-editor__subtitle">Configure this component</div>
        
        <div class="form-section">
            <h4 class="form-section__title">Basic Properties</h4>
            <div class="form-group">
                <label class="form-label">Component Name</label>
                <input type="text" class="form-input" data-property="name" placeholder="Component name">
            </div>
        </div>
        
        <div class="form-section">
            <h4 class="form-section__title">Actions</h4>
            <div class="form-help-text">
                This component doesn\'t have custom settings. You can edit it directly in the preview area.
            </div>
        </div>
    ';
}

/**
 * Save media kit state
 */
add_action('wp_ajax_gmkb_save_media_kit', 'gmkb_ajax_save_media_kit');
function gmkb_ajax_save_media_kit() {
    // Verify nonce
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
        wp_send_json_error('Security check failed');
    }
    
    // Get state data
    $state = json_decode(stripslashes($_POST['state']), true);
    if (!$state) {
        wp_send_json_error('Invalid state data');
    }
    
    // Get or create media kit post
    $media_kit_id = isset($_POST['media_kit_id']) ? intval($_POST['media_kit_id']) : 0;
    
    if (!$media_kit_id) {
        // Create new media kit
        $post_data = array(
            'post_title'   => $state['metadata']['title'] ?? 'My Media Kit',
            'post_type'    => 'gmkb_media_kit',
            'post_status'  => 'publish',
            'post_content' => ''
        );
        
        $media_kit_id = wp_insert_post($post_data);
        
        if (is_wp_error($media_kit_id)) {
            wp_send_json_error('Failed to create media kit');
        }
    } else {
        // Update existing
        $post_data = array(
            'ID'          => $media_kit_id,
            'post_title'  => $state['metadata']['title'] ?? 'My Media Kit',
            'post_modified' => current_time('mysql')
        );
        
        wp_update_post($post_data);
    }
    
    // Save state as post meta
    update_post_meta($media_kit_id, '_gmkb_state', $state);
    update_post_meta($media_kit_id, '_gmkb_version', $state['version'] ?? '1.0.0');
    
    // Generate static HTML for frontend display
    $html = gmkb_generate_static_html($state);
    update_post_meta($media_kit_id, '_gmkb_html', $html);
    
    wp_send_json_success(array(
        'media_kit_id' => $media_kit_id,
        'preview_url' => get_permalink($media_kit_id),
        'edit_url' => admin_url('admin.php?page=guestify-builder&media_kit_id=' . $media_kit_id)
    ));
}

/**
 * Load media kit state
 */
add_action('wp_ajax_gmkb_load_media_kit', 'gmkb_ajax_load_media_kit');
function gmkb_ajax_load_media_kit() {
    // Verify nonce
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
        wp_send_json_error('Security check failed');
    }
    
    $media_kit_id = intval($_POST['media_kit_id']);
    
    if (!$media_kit_id) {
        wp_send_json_error('Invalid media kit ID');
    }
    
    // Check permissions
    if (!current_user_can('edit_post', $media_kit_id)) {
        wp_send_json_error('Permission denied');
    }
    
    // Get state from post meta
    $state = get_post_meta($media_kit_id, '_gmkb_state', true);
    
    if (!$state) {
        wp_send_json_error('Media kit not found');
    }
    
    $post = get_post($media_kit_id);
    
    wp_send_json_success(array(
        'state' => $state,
        'media_kit_id' => $media_kit_id,
        'title' => $post->post_title,
        'preview_url' => get_permalink($media_kit_id)
    ));
}

/**
 * Generate static HTML from state
 */
function gmkb_generate_static_html($state) {
    ob_start();
    ?>
    <div class="gmkb-media-kit" data-theme="<?php echo esc_attr($state['metadata']['theme'] ?? 'default'); ?>">
        <?php
        // Sort components by order
        $components = $state['components'] ?? array();
        usort($components, function($a, $b) {
            return ($a['order'] ?? 0) - ($b['order'] ?? 0);
        });
        
        // Render each component
        foreach ($components as $component) {
            gmkb_render_static_component($component);
        }
        ?>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Render a static component
 */
function gmkb_render_static_component($component) {
    $type = $component['type'];
    $data = $component['data'];
    $template_file = GMKB_PLUGIN_DIR . 'components/' . $type . '/template.php';
    
    if (file_exists($template_file)) {
        // Extract data for use in template
        extract($data);
        include $template_file;
    }
}

/**
 * Register custom post type for media kits
 */
add_action('init', 'gmkb_register_media_kit_post_type');
function gmkb_register_media_kit_post_type() {
    register_post_type('gmkb_media_kit', array(
        'labels' => array(
            'name' => 'Media Kits',
            'singular_name' => 'Media Kit',
            'add_new' => 'Add New',
            'add_new_item' => 'Add New Media Kit',
            'edit_item' => 'Edit Media Kit',
            'new_item' => 'New Media Kit',
            'view_item' => 'View Media Kit',
            'search_items' => 'Search Media Kits',
            'not_found' => 'No media kits found',
            'not_found_in_trash' => 'No media kits found in trash'
        ),
        'public' => true,
        'show_ui' => true,
        'show_in_menu' => false, // We'll add it to our custom menu
        'capability_type' => 'page',
        'supports' => array('title', 'author'),
        'rewrite' => array('slug' => 'media-kit')
    ));
}

/**
 * Enqueue enhanced scripts for the builder
 */
add_action('admin_enqueue_scripts', 'gmkb_enqueue_enhanced_scripts', 20);
add_action('wp_enqueue_scripts', 'gmkb_enqueue_enhanced_scripts_frontend', 20);

function gmkb_enqueue_enhanced_scripts($hook) {
    // Check if we're on a builder-related page
    $is_builder_page = false;
    
    if (isset($_GET['page'])) {
        $page = $_GET['page'];
        if (in_array($page, array('guestify-builder', 'guestify-media-kit'))) {
            $is_builder_page = true;
        }
    }
    
    if (!$is_builder_page && !in_array($hook, array('toplevel_page_guestify-builder', 'toplevel_page_guestify-media-kit'))) {
        return;
    }
    
    gmkb_enqueue_builder_scripts();
}

function gmkb_enqueue_enhanced_scripts_frontend() {
    // Check if we're on the media kit page
    if (!is_page('guestify-media-kit')) {
        return;
    }
    
    gmkb_enqueue_builder_scripts();
}

function gmkb_enqueue_builder_scripts() {
    // Ensure jQuery is loaded first for ajaxurl
    wp_enqueue_script('jquery');
    
    // Add inline script to define ajaxurl if not already defined
    wp_add_inline_script('jquery', '
        if (typeof ajaxurl === "undefined") {
            window.ajaxurl = "' . admin_url('admin-ajax.php') . '";
        }
    ');
    
    // Enqueue enhanced CSS
    wp_enqueue_style(
        'gmkb-enhancements',
        GMKB_PLUGIN_URL . 'css/modules/enhancements.css',
        array(), // Removed gmkb-builder dependency to avoid potential load order issues
        GMKB_VERSION
    );
    
    // ROOT FIX: Localize script data with proper guestifyData for design panel loader
    $localize_data = array(
        'nonce' => wp_create_nonce('guestify_nonce'),
        'upload_nonce' => wp_create_nonce('media-form'),
        'ajax_url' => admin_url('admin-ajax.php'),
        'ajaxUrl' => admin_url('admin-ajax.php'), // Alternative name for compatibility
        'plugin_url' => GMKB_PLUGIN_URL,
        'pluginUrl' => GMKB_PLUGIN_URL, // Alternative name for compatibility
        'media_kit_id' => isset($_GET['media_kit_id']) ? intval($_GET['media_kit_id']) : 0,
        'restUrl' => rest_url(),
        'restNonce' => wp_create_nonce('wp_rest')
    );
    
    // Localize as both gmkb_data and guestifyData for compatibility
    wp_localize_script('guestify-builder-script', 'gmkb_data', $localize_data);
    wp_localize_script('guestify-builder-script', 'guestifyData', $localize_data);
}

// Initialize the enhanced system
require_once GMKB_PLUGIN_DIR . 'includes/enhanced-init.php';