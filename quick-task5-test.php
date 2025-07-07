#!/usr/bin/env php
<?php
/**
 * @file quick-task5-test.php  
 * @description Quick command-line test for Task 5 PHP fix
 * 
 * Usage: php quick-task5-test.php
 * Or copy this code into WordPress admin > Tools > Site Health > Info tab
 */

echo "🔧 Task 5 PHP Class Loading Quick Test\n";
echo "=====================================\n\n";

// Define plugin directory (adjust path as needed)
$plugin_dir = dirname(__FILE__) . '/';
define('GMKB_PLUGIN_DIR', $plugin_dir);

echo "Plugin Directory: {$plugin_dir}\n\n";

// Test 1: File existence
echo "📁 Test 1: File Existence\n";
$files = [
    'includes/class-gmkb-mkcg-data-integration.php',
    'includes/class-gmkb-mkcg-refresh-ajax-handlers.php'
];

$files_ok = true;
foreach ($files as $file) {
    $path = $plugin_dir . $file;
    if (file_exists($path)) {
        echo "✅ Found: {$file}\n";
    } else {
        echo "❌ Missing: {$file}\n";
        $files_ok = false;
    }
}

if (!$files_ok) {
    echo "\n❌ Missing files detected. Cannot proceed with class tests.\n";
    exit(1);
}

echo "\n";

// Test 2: Load files in correct order
echo "🔄 Test 2: Class Loading Order\n";

try {
    // Load data integration first
    require_once $plugin_dir . 'includes/class-gmkb-mkcg-data-integration.php';
    echo "✅ Loaded: GMKB_MKCG_Data_Integration\n";
    
    // Check if class exists
    if (class_exists('GMKB_MKCG_Data_Integration')) {
        echo "✅ Class exists: GMKB_MKCG_Data_Integration\n";
    } else {
        echo "❌ Class not found: GMKB_MKCG_Data_Integration\n";
        exit(1);
    }
    
    // Load AJAX handlers second
    require_once $plugin_dir . 'includes/class-gmkb-mkcg-refresh-ajax-handlers.php';
    echo "✅ Loaded: GMKB_MKCG_Refresh_AJAX_Handlers\n";
    
    // Check if class exists
    if (class_exists('GMKB_MKCG_Refresh_AJAX_Handlers')) {
        echo "✅ Class exists: GMKB_MKCG_Refresh_AJAX_Handlers\n";
    } else {
        echo "❌ Class not found: GMKB_MKCG_Refresh_AJAX_Handlers\n";
        exit(1);
    }
    
} catch (Exception $e) {
    echo "❌ Error loading classes: " . $e->getMessage() . "\n";
    exit(1);
} catch (Error $e) {
    echo "❌ Fatal error: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n";

// Test 3: Instance creation (simulate WordPress environment)
echo "🏗️ Test 3: Instance Creation (Simulated)\n";

// Mock WordPress functions for testing
if (!function_exists('add_action')) {
    function add_action($hook, $callback, $priority = 10, $accepted_args = 1) {
        echo "📝 Mock: add_action called for {$hook}\n";
        return true;
    }
}

if (!function_exists('wp_verify_nonce')) {
    function wp_verify_nonce($nonce, $action) {
        return true; // Mock verification
    }
}

if (!function_exists('current_user_can')) {
    function current_user_can($capability) {
        return true; // Mock capability check
    }
}

if (!function_exists('get_post_meta')) {
    function get_post_meta($post_id, $key, $single = false) {
        return 'mock_value'; // Mock meta value
    }
}

if (!function_exists('get_post')) {
    function get_post($post_id) {
        return (object) ['ID' => $post_id, 'post_title' => 'Mock Post'];
    }
}

if (!function_exists('current_time')) {
    function current_time($type) {
        return date('Y-m-d H:i:s');
    }
}

try {
    // Try to create data integration instance
    $data_integration = GMKB_MKCG_Data_Integration::get_instance();
    if ($data_integration) {
        echo "✅ Created: GMKB_MKCG_Data_Integration instance\n";
    }
    
    // Try to create AJAX handlers instance  
    // Note: This might trigger WordPress hooks, so we just check the class
    $reflection = new ReflectionClass('GMKB_MKCG_Refresh_AJAX_Handlers');
    $constructor = $reflection->getConstructor();
    if ($constructor) {
        echo "✅ Constructor available: GMKB_MKCG_Refresh_AJAX_Handlers\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error creating instances: " . $e->getMessage() . "\n";
    exit(1);
} catch (Error $e) {
    echo "❌ Fatal error in instances: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n";

// Test 4: Method availability
echo "🔍 Test 4: Required Methods\n";

$required_methods = [
    'get_post_data',
    'compare_data_freshness',
    'get_fresh_mkcg_data', 
    'get_data_availability'
];

$missing_methods = [];
foreach ($required_methods as $method) {
    if (method_exists($data_integration, $method)) {
        echo "✅ Method: {$method}\n";
    } else {
        echo "❌ Missing: {$method}\n";
        $missing_methods[] = $method;
    }
}

echo "\n";

// Summary
echo "📋 Summary\n";
echo "==========\n";

if (empty($missing_methods) && $files_ok) {
    echo "🎉 SUCCESS: All tests passed!\n";
    echo "   The PHP Fatal error should be resolved.\n";
    echo "   Classes can be loaded in the correct order.\n\n";
    
    echo "🚀 Next Steps:\n";
    echo "   1. Upload the fixed files to your WordPress installation\n";
    echo "   2. Test in browser with test-task5-fix.php\n";
    echo "   3. Run JavaScript tests with: testTask5Comprehensive()\n";
    
    exit(0);
} else {
    echo "❌ ISSUES DETECTED:\n";
    if (!$files_ok) echo "   - Missing required files\n";
    if (!empty($missing_methods)) echo "   - Missing methods: " . implode(', ', $missing_methods) . "\n";
    echo "\n   Please check the implementation and try again.\n";
    
    exit(1);
}
