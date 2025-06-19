<?php
/**
 * Script and Style Registration for Guestify Media Kit Builder
 *
 * @package Guestify
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Add module type to the main builder script tag to enable ES module loading.
 */
add_filter('script_loader_tag', 'guestify_add_module_type_attribute', 10, 3);
function guestify_add_module_type_attribute($tag, $handle, $src) {
    // List of scripts that need module type
    $module_scripts = array(
        'guestify-builder-script',
        'gmkb-state-manager',
        'gmkb-data-binding',
        'gmkb-design-panel',
        'gmkb-enhanced-history',
        'gmkb-component-manager'
    );
    
    if (in_array($handle, $module_scripts)) {
        $tag = '<script type="module" src="' . esc_url($src) . '" id="' . esc_attr($handle) . '-js"></script>';
    }
    return $tag;
}

/**
 * Register scripts and styles for the Media Kit Builder.
 * These are registered here but conditionally printed by the main plugin file.
 */
function guestify_media_kit_builder_enqueue_scripts() {
    $plugin_url = GUESTIFY_PLUGIN_URL;
    $version = GUESTIFY_VERSION;

    // Register styles
    wp_register_style(
        'guestify-media-kit-builder-styles',
        $plugin_url . 'css/guestify-builder.css',
        [],
        $version
    );

    // Register SortableJS from CDN
    wp_register_script(
        'sortable-js',
        'https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js',
        [],
        null,
        true
    );

    // Register main builder script (as a module)
    wp_register_script(
        'guestify-builder-script',
        $plugin_url . 'js/main.js',
        ['jquery', 'sortable-js'], // Add jQuery dependency for ajaxurl
        $version,
        true
    );

    // Get component data from the plugin instance
    $plugin_instance = Guestify_Media_Kit_Builder::get_instance();
    $component_discovery = $plugin_instance->get_component_discovery();
    
    // Get components and ensure they're in array format
    $components = $component_discovery->getComponents();
    $components_array = is_array($components) ? array_values($components) : [];
    
    // Prepare component schemas for localization
    $component_schemas = array();
    foreach ($components_array as $component) {
        // Use the directory name, not the display name
        $component_dir = isset($component['directory']) ? $component['directory'] : $component['name'];
        $schema_path = GUESTIFY_PLUGIN_DIR . 'components/' . $component_dir . '/component.json';
        
        if (file_exists($schema_path)) {
            $schema_content = file_get_contents($schema_path);
            if ($schema_content !== false) {
                $schema = json_decode($schema_content, true);
                
                // Check for JSON errors
                if (json_last_error() === JSON_ERROR_NONE && $schema !== null) {
                    // Use directory name as key for consistency
                    $component_schemas[$component_dir] = $schema;
                    
                    // Also add using the component name for backwards compatibility
                    if (isset($component['name']) && $component['name'] !== $component_dir) {
                        $component_schemas[$component['name']] = $schema;
                    }
                } else {
                    error_log('Media Kit Builder: Failed to parse schema JSON for component: ' . $component_dir . ' - ' . json_last_error_msg());
                }
            } else {
                error_log('Media Kit Builder: Failed to read schema file for component: ' . $component_dir);
            }
        } else {
            // This is not necessarily an error - component might not have a schema
            // Only log in debug mode
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Media Kit Builder: Schema file not found for component: ' . $component_dir . ' at ' . $schema_path);
            }
        }
    }
    
    // Get existing component data from any saved state
    $saved_state = get_option('guestify_media_kit_state', array());
    
    // Prepare data for localization with validation
    $localized_data = [
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'ajax_url' => admin_url('admin-ajax.php'), // Duplicate for compatibility
        'nonce' => wp_create_nonce('guestify_media_kit_builder'),
        'restUrl' => esc_url_raw(rest_url()),
        'restNonce' => wp_create_nonce('wp_rest'),
        'pluginUrl' => $plugin_url,
        'pluginVersion' => GUESTIFY_VERSION,
        'components' => $components_array, // Ensure it's a proper array
        'categories' => $component_discovery->getCategories(),
        'componentSchemas' => $component_schemas, // Add schemas for immediate access
        'initialState' => $saved_state, // Add any saved state
        'features' => array( // Add feature flags from PHP
            'useEnhancedInit' => true,
            'useBatchUpdates' => true,
            'usePendingActions' => true
        ),
        // Add data validation flags
        'dataReady' => true,
        'timestamp' => time(),
        'validation' => array(
            'pluginUrl' => !empty($plugin_url),
            'components' => is_array($components_array) && count($components_array) > 0,
            'schemas' => is_array($component_schemas) && count($component_schemas) > 0
        )
    ];
    
    // Validate critical data before localizing
    if (empty($plugin_url)) {
        error_log('Media Kit Builder: Critical error - Plugin URL is empty during script localization');
        // Set a fallback URL
        $localized_data['pluginUrl'] = plugin_dir_url(dirname(__FILE__));
    }
    
    if (empty($components_array)) {
        error_log('Media Kit Builder: Warning - No components found during script localization');
    }
    
    // Localize script with validated WordPress data
    wp_localize_script(
        'guestify-builder-script',
        'guestifyData',
        $localized_data
    );
    
    // Add inline script to set data ready flag and provide backup
    wp_add_inline_script(
        'guestify-builder-script',
        'window.guestifyDataBackup = ' . wp_json_encode($localized_data) . '; window.guestifyDataReady = true;',
        'before'
    );
}
// Run on a hook that fires before template_redirect.
add_action('wp_loaded', 'guestify_media_kit_builder_enqueue_scripts');
