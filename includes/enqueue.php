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
        ['sortable-js'],
        $version,
        true
    );

    // Get component data from the plugin instance
    $plugin_instance = Guestify_Media_Kit_Builder::get_instance();
    $component_discovery = $plugin_instance->get_component_discovery();
    
    // Localize script with WordPress data
    wp_localize_script(
        'guestify-builder-script',
        'guestifyData',
        [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('guestify_media_kit_builder'),
            'restUrl' => esc_url_raw(rest_url()),
            'restNonce' => wp_create_nonce('wp_rest'),
            'pluginUrl' => $plugin_url,
            'components' => $component_discovery->getComponents(),
            'categories' => $component_discovery->getCategories(),
        ]
    );
}
// Run on a hook that fires before template_redirect.
add_action('wp_loaded', 'guestify_media_kit_builder_enqueue_scripts');
