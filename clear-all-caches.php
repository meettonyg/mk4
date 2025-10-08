<?php
/**
 * Clear All Caches Utility
 * Run this file to force clear ALL WordPress caches and verify icon loading
 * 
 * Usage: php clear-all-caches.php
 * Or visit: /wp-content/plugins/guestify-media-kit-builder/clear-all-caches.php
 */

// Bootstrap WordPress if running from command line
if (php_sapi_name() === 'cli') {
    // Try to find wp-load.php
    $wp_load_paths = [
        __DIR__ . '/../../../../wp-load.php',
        __DIR__ . '/../../../wp-load.php',
        __DIR__ . '/../../wp-load.php'
    ];
    
    foreach ($wp_load_paths as $wp_load) {
        if (file_exists($wp_load)) {
            require_once $wp_load;
            break;
        }
    }
}

if (!defined('ABSPATH')) {
    die('WordPress not loaded');
}

echo "========================================\n";
echo "GUESTIFY MEDIA KIT BUILDER\n";
echo "Cache Clearing Utility\n";
echo "========================================\n\n";

// 1. Clear all transients related to component discovery
echo "1. Clearing component discovery caches...\n";

$transients_to_clear = [
    'gmkb_component_discovery_' . md5(GUESTIFY_PLUGIN_DIR . 'components/'),
    'gmkb_components_cache',
    'gmkb_component_registry',
];

foreach ($transients_to_clear as $transient) {
    $result = delete_transient($transient);
    echo "   - {$transient}: " . ($result ? 'CLEARED' : 'NOT FOUND') . "\n";
}

// 2. Clear file version caches
echo "\n2. Clearing file version caches...\n";

$bundle_js_path = GUESTIFY_PLUGIN_DIR . 'dist/gmkb.iife.js';
$css_paths = [
    'gmkb.css' => GUESTIFY_PLUGIN_DIR . 'dist/gmkb.css',
    'style.css' => GUESTIFY_PLUGIN_DIR . 'dist/style.css'
];

delete_transient('gmkb_script_version_' . md5($bundle_js_path));
echo "   - Script version cache: CLEARED\n";

foreach ($css_paths as $name => $path) {
    delete_transient('gmkb_style_version_' . md5($path));
    echo "   - {$name} version cache: CLEARED\n";
}

// 3. Clear WordPress object cache if available
echo "\n3. Clearing WordPress object cache...\n";
if (function_exists('wp_cache_flush')) {
    wp_cache_flush();
    echo "   - Object cache: FLUSHED\n";
} else {
    echo "   - Object cache: NOT AVAILABLE\n";
}

// 4. Force rescan components and verify icons
echo "\n4. Rescanning components and verifying icons...\n";

if (!class_exists('ComponentDiscovery')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/ComponentDiscovery.php';
}

$discovery = new ComponentDiscovery(GUESTIFY_PLUGIN_DIR . 'components/');
$discovery->clearCache();
$discovery->scan(true);
$components = $discovery->getComponents();

echo "   - Found " . count($components) . " components\n\n";

echo "5. Icon verification:\n";
echo "   Component Name          | Icon Class\n";
echo "   " . str_repeat('-', 60) . "\n";

$components_without_icons = [];
foreach ($components as $type => $component) {
    $icon = $component['icon'] ?? 'MISSING';
    $name = str_pad($component['name'] ?? $type, 24);
    echo "   {$name}| {$icon}\n";
    
    if (!isset($component['icon']) || $icon === 'fa-solid fa-cube') {
        $components_without_icons[] = $type;
    }
}

echo "\n";

if (empty($components_without_icons)) {
    echo "✅ SUCCESS: All components have custom icons defined!\n";
} else {
    echo "⚠️  WARNING: " . count($components_without_icons) . " components using fallback icon:\n";
    foreach ($components_without_icons as $type) {
        echo "   - {$type}\n";
    }
}

echo "\n========================================\n";
echo "Cache clearing complete!\n";
echo "\nNext steps:\n";
echo "1. Hard refresh your browser (Ctrl+Shift+R / Cmd+Shift+R)\n";
echo "2. Check browser console for icon debugging messages\n";
echo "3. Verify Font Awesome is loading (check Network tab)\n";
echo "========================================\n";
