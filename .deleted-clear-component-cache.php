#!/usr/bin/env php
<?php
/**
 * Force Component Discovery Cache Clear
 * 
 * Run this script to clear ALL component discovery caches
 * including WordPress transients
 * 
 * Usage: php clear-component-cache.php
 */

// Load WordPress
$wp_load_path = dirname(__FILE__) . '/../../../wp-load.php';
if (!file_exists($wp_load_path)) {
    die("❌ WordPress not found at: $wp_load_path\n");
}

require_once $wp_load_path;

echo "\n";
echo "🧹 GMKB Component Discovery Cache Clearer\n";
echo "==========================================\n\n";

// 1. Clear WordPress transients
echo "1️⃣  Clearing WordPress Transients...\n";
global $wpdb;

$components_dir = dirname(__FILE__) . '/components';
$cache_key = 'gmkb_component_discovery_' . md5($components_dir);

$deleted = delete_transient($cache_key);
echo "   - Main cache key: " . ($deleted ? "✅ DELETED" : "⚠️  Not found") . "\n";

// Find all gmkb transients
$gmkb_transients = $wpdb->get_col(
    "SELECT option_name FROM $wpdb->options 
     WHERE option_name LIKE '_transient_gmkb%' 
     OR option_name LIKE '_transient_timeout_gmkb%'"
);

echo "   - Found " . count($gmkb_transients) . " GMKB transients\n";

foreach ($gmkb_transients as $transient_name) {
    // Remove _transient_ or _transient_timeout_ prefix
    $key = str_replace(array('_transient_timeout_', '_transient_'), '', $transient_name);
    delete_transient($key);
    echo "     ✅ Deleted: $key\n";
}

// 2. Force ComponentDiscovery refresh
echo "\n2️⃣  Forcing ComponentDiscovery Refresh...\n";

if (function_exists('gmkb_refresh_components')) {
    try {
        $result = gmkb_refresh_components();
        echo "   ✅ ComponentDiscovery refreshed\n";
        
        global $gmkb_component_discovery;
        if ($gmkb_component_discovery) {
            $components = $gmkb_component_discovery->getComponents();
            echo "   📊 Found " . count($components) . " components:\n";
            foreach ($components as $key => $component) {
                echo "      - " . ($component['name'] ?? $key) . " (" . $key . ")\n";
            }
        }
    } catch (Exception $e) {
        echo "   ❌ Error: " . $e->getMessage() . "\n";
    }
} else {
    echo "   ⚠️  gmkb_refresh_components() not available\n";
}

// 3. Clear OPcache if available
echo "\n3️⃣  Clearing OPcache...\n";
if (function_exists('opcache_reset')) {
    if (opcache_reset()) {
        echo "   ✅ OPcache cleared\n";
    } else {
        echo "   ❌ OPcache clear failed\n";
    }
} else {
    echo "   ⚠️  OPcache not available\n";
}

// 4. Clear object cache if available
echo "\n4️⃣  Clearing Object Cache...\n";
if (function_exists('wp_cache_flush')) {
    if (wp_cache_flush()) {
        echo "   ✅ Object cache flushed\n";
    } else {
        echo "   ❌ Object cache flush failed\n";
    }
} else {
    echo "   ⚠️  Object cache not available\n";
}

// 5. Verify Authority Hook is gone
echo "\n5️⃣  Verifying Authority Hook Removal...\n";
global $gmkb_component_discovery;
if ($gmkb_component_discovery) {
    $components = $gmkb_component_discovery->getComponents();
    
    if (isset($components['authority-hook'])) {
        echo "   ❌ FAIL: Authority Hook still present!\n";
        echo "   📁 Check: " . dirname(__FILE__) . "/components/authority-hook\n";
        if (is_dir(dirname(__FILE__) . "/components/authority-hook")) {
            echo "   ⚠️  Directory still exists - DELETE IT!\n";
        }
    } else {
        echo "   ✅ PASS: Authority Hook successfully removed\n";
    }
    
    // Check aliases
    $aliases = $gmkb_component_discovery->getAliases();
    if (isset($aliases['authority']) || isset($aliases['authority-hook'])) {
        echo "   ❌ FAIL: Authority Hook alias still present!\n";
    } else {
        echo "   ✅ PASS: Authority Hook alias removed\n";
    }
}

echo "\n";
echo "==========================================\n";
echo "✅ Cache clearing complete!\n\n";
echo "Next steps:\n";
echo "1. Close ALL browser tabs with media kit builder\n";
echo "2. Clear browser cache (Ctrl+Shift+Delete)\n";
echo "3. Open builder in new incognito window\n";
echo "4. Verify Authority Hook is NOT in component library\n";
echo "\n";
