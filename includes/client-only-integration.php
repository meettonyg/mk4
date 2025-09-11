<?php
/**
 * Client-Only Rendering WordPress Integration
 * 
 * This file modifies the WordPress integration to support JavaScript-only rendering
 */

// Hook to modify the media kit builder page
add_filter('gmkb_builder_template', 'gmkb_use_client_only_template');
function gmkb_use_client_only_template($template) {
    // Use the new client-only template
    return plugin_dir_path(__FILE__) . 'templates/media-kit-builder-js-only.php';
}

// Modify the data passed to JavaScript
add_filter('gmkb_javascript_data', 'gmkb_client_only_data');
function gmkb_client_only_data($data) {
    // Add render mode flag
    $data['renderMode'] = 'client';
    
    // Remove any HTML from saved components
    if (isset($data['saved_components'])) {
        foreach ($data['saved_components'] as &$component) {
            // Remove any pre-rendered HTML
            unset($component['html']);
            unset($component['rendered']);
        }
    }
    
    return $data;
}

// AJAX endpoint for component HTML (if needed for server-side generation)
add_action('wp_ajax_gmkb_render_component_html', 'gmkb_render_component_html');
function gmkb_render_component_html() {
    check_ajax_referer('gmkb_nonce', 'nonce');
    
    $component_type = sanitize_text_field($_POST['type']);
    $component_props = json_decode(stripslashes($_POST['props']), true);
    
    // This is now only called when explicitly needed
    // Not for initial render
    $html = gmkb_generate_component_html($component_type, $component_props);
    
    wp_send_json_success(['html' => $html]);
}

// Simplified component HTML generation (only for specific server-side needs)
function gmkb_generate_component_html($type, $props) {
    // This function is now rarely used
    // Most rendering happens in JavaScript
    
    switch ($type) {
        case 'topics':
            // Only if Topics specifically needs server data
            if (gmkb_component_requires_server_data('topics')) {
                return gmkb_render_topics_with_pods_data($props);
            }
            break;
    }
    
    // Return empty - let JavaScript handle it
    return '';
}

// Check if a component type requires server-side data
function gmkb_component_requires_server_data($type) {
    $server_components = apply_filters('gmkb_server_side_components', []);
    return in_array($type, $server_components);
}
