<?php
/**
 * REST API Routes Verification Script
 * 
 * Run this in WordPress admin to verify REST routes are registered
 * Copy and paste this entire file content into a PHP execution plugin or
 * run via WP-CLI: wp eval-file verify-rest-routes.php
 */

// Get all registered REST routes
$rest_server = rest_get_server();
$namespaces = $rest_server->get_namespaces();
$routes = $rest_server->get_routes();

echo "\n====================================\n";
echo "GMKB REST API ROUTES VERIFICATION\n";
echo "====================================\n\n";

// Check for GMKB v1 routes
echo "--- GMKB v1 Routes (/gmkb/v1/) ---\n";
$v1_routes_found = false;
foreach ($routes as $route => $handlers) {
    if (strpos($route, '/gmkb/v1/') === 0) {
        $v1_routes_found = true;
        echo "✅ " . $route . "\n";
        foreach ($handlers as $handler) {
            if (isset($handler['methods'])) {
                $methods = array_keys($handler['methods']);
                echo "   Methods: " . implode(', ', $methods) . "\n";
            }
        }
    }
}
if (!$v1_routes_found) {
    echo "❌ No GMKB v1 routes found!\n";
    echo "   Expected routes:\n";
    echo "   - /gmkb/v1/media-kit/(?P<id>\\d+)\n";
    echo "   - /gmkb/v1/media-kit/(?P<id>\\d+)/customizations\n";
    echo "   - /gmkb/v1/themes/custom\n";
}

echo "\n--- GMKB v2 Routes (/gmkb/v2/) ---\n";
$v2_routes_found = false;
foreach ($routes as $route => $handlers) {
    if (strpos($route, '/gmkb/v2/') === 0) {
        $v2_routes_found = true;
        echo "✅ " . $route . "\n";
        foreach ($handlers as $handler) {
            if (isset($handler['methods'])) {
                $methods = array_keys($handler['methods']);
                echo "   Methods: " . implode(', ', $methods) . "\n";
            }
        }
    }
}
if (!$v2_routes_found) {
    echo "❌ No GMKB v2 routes found!\n";
}

echo "\n--- GMKB Namespaces ---\n";
$gmkb_namespaces = array_filter($namespaces, function($ns) {
    return strpos($ns, 'gmkb') !== false;
});
if (empty($gmkb_namespaces)) {
    echo "❌ No GMKB namespaces found!\n";
} else {
    foreach ($gmkb_namespaces as $ns) {
        echo "✅ " . $ns . "\n";
    }
}

echo "\n--- Loaded GMKB API Classes ---\n";
echo "MediaKitAPI class exists: " . (class_exists('GMKB\\MediaKitAPI') ? '✅ YES' : '❌ NO') . "\n";
echo "GMKB_REST_API_V2 class exists: " . (class_exists('GMKB_REST_API_V2') ? '✅ YES' : '❌ NO') . "\n";

echo "\n--- File Existence ---\n";
$v1_file = GMKB_PLUGIN_DIR . 'includes/api/MediaKitAPI.php';
$v2_file = GMKB_PLUGIN_DIR . 'includes/api/v2/class-gmkb-rest-api-v2.php';
echo "MediaKitAPI.php exists: " . (file_exists($v1_file) ? '✅ YES' : '❌ NO') . "\n";
echo "class-gmkb-rest-api-v2.php exists: " . (file_exists($v2_file) ? '✅ YES' : '❌ NO') . "\n";

echo "\n====================================\n";
echo "SUMMARY\n";
echo "====================================\n";

if ($v1_routes_found && $v2_routes_found) {
    echo "✅ All REST API routes are properly registered!\n";
    echo "\nNext steps:\n";
    echo "1. Test the endpoints using the browser console test script\n";
    echo "2. If still showing 404s, flush permalinks again:\n";
    echo "   WordPress Admin → Settings → Permalinks → Save Changes\n";
} else {
    echo "❌ Some REST API routes are missing!\n";
    echo "\nTroubleshooting:\n";
    echo "1. Deactivate and reactivate the plugin\n";
    echo "2. Flush permalinks: Settings → Permalinks → Save Changes\n";
    echo "3. Check for PHP errors in WordPress debug log\n";
    echo "4. Verify the MediaKitAPI.php file is being included in the main plugin file\n";
}

echo "\n====================================\n\n";
