<?php
/**
 * IMMEDIATE DEBUG - Check current plugin status
 */

// Check if WordPress is available
if (!defined('ABSPATH')) {
    die('WordPress not loaded - run this from WordPress admin or frontend');
}

echo "<h1>🔍 PLUGIN DEBUG STATUS</h1>";
echo "<style>body{font-family:monospace;background:#f1f1f1;padding:20px;} .success{color:#10b981;} .error{color:#ef4444;} .warning{color:#f59e0b;}</style>";

// 1. Check if main plugin file exists and is readable
echo "<h2>📁 File Status</h2>";
$main_file = __DIR__ . '/guestify-media-kit-builder.php';
$enqueue_file = __DIR__ . '/includes/enqueue.php';

echo "Main plugin file: " . ($main_file) . "<br>";
echo "Exists: " . (file_exists($main_file) ? '<span class="success">✅ YES</span>' : '<span class="error">❌ NO</span>') . "<br>";
echo "Readable: " . (is_readable($main_file) ? '<span class="success">✅ YES</span>' : '<span class="error">❌ NO</span>') . "<br><br>";

echo "Enqueue file: " . ($enqueue_file) . "<br>";
echo "Exists: " . (file_exists($enqueue_file) ? '<span class="success">✅ YES</span>' : '<span class="error">❌ NO</span>') . "<br>";
echo "Readable: " . (is_readable($enqueue_file) ? '<span class="success">✅ YES</span>' : '<span class="error">❌ NO</span>') . "<br><br>";

// 2. Check if classes are loaded
echo "<h2>🏗️ Class Status</h2>";
echo "GMKB_Root_Fix_Script_Manager: " . (class_exists('GMKB_Root_Fix_Script_Manager') ? '<span class="success">✅ EXISTS</span>' : '<span class="error">❌ NOT FOUND</span>') . "<br>";
echo "GMKB_Enhanced_Script_Manager: " . (class_exists('GMKB_Enhanced_Script_Manager') ? '<span class="success">✅ EXISTS (alias)</span>' : '<span class="error">❌ NOT FOUND</span>') . "<br>";
echo "Guestify_Media_Kit_Builder: " . (class_exists('Guestify_Media_Kit_Builder') ? '<span class="success">✅ EXISTS</span>' : '<span class="error">❌ NOT FOUND</span>') . "<br><br>";

// 3. Check if plugin is active
echo "<h2>🔌 Plugin Status</h2>";
if (function_exists('is_plugin_active')) {
    $plugin_path = 'guestify-media-kit-builder/guestify-media-kit-builder.php';
    echo "Plugin active: " . (is_plugin_active($plugin_path) ? '<span class="success">✅ ACTIVE</span>' : '<span class="error">❌ INACTIVE</span>') . "<br>";
} else {
    echo "Cannot check plugin status (function not available)<br>";
}

// 4. Check for recent PHP errors
echo "<h2>🚨 Recent PHP Errors</h2>";
$error_log = ini_get('error_log');
if ($error_log && file_exists($error_log)) {
    $recent_errors = file_get_contents($error_log);
    $lines = explode("\n", $recent_errors);
    $relevant_errors = array_filter($lines, function($line) {
        return strpos($line, 'guestify') !== false || strpos($line, 'GMKB') !== false;
    });
    
    if (empty($relevant_errors)) {
        echo '<span class="success">✅ No recent plugin-related errors found</span><br>';
    } else {
        echo '<span class="error">❌ Recent errors found:</span><br>';
        foreach (array_slice($relevant_errors, -5) as $error) {
            echo "<code>" . htmlspecialchars($error) . "</code><br>";
        }
    }
} else {
    echo '<span class="warning">⚠️ Cannot access error log</span><br>';
}

// 5. Test class instantiation
echo "<h2>🧪 Class Instantiation Test</h2>";
try {
    if (class_exists('GMKB_Root_Fix_Script_Manager')) {
        $manager = GMKB_Root_Fix_Script_Manager::get_instance();
        echo '<span class="success">✅ GMKB_Root_Fix_Script_Manager instantiated successfully</span><br>';
        
        $status = $manager->get_status();
        echo "Manager status:<br>";
        foreach ($status as $key => $value) {
            echo "&nbsp;&nbsp;$key: " . (is_bool($value) ? ($value ? 'true' : 'false') : htmlspecialchars($value)) . "<br>";
        }
    } else {
        echo '<span class="error">❌ GMKB_Root_Fix_Script_Manager class not found</span><br>';
    }
} catch (Exception $e) {
    echo '<span class="error">❌ Error instantiating manager: ' . htmlspecialchars($e->getMessage()) . '</span><br>';
}

// 6. Check current page context
echo "<h2>📍 Current Page Context</h2>";
$current_url = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : 'Unknown';
echo "Current URL: " . htmlspecialchars($current_url) . "<br>";
echo "Is admin: " . (is_admin() ? '<span class="success">✅ YES</span>' : '<span class="warning">⚠️ NO</span>') . "<br>";
echo "Is builder page: " . (strpos($current_url, 'guestify-media-kit') !== false ? '<span class="success">✅ YES</span>' : '<span class="warning">⚠️ NO</span>') . "<br>";

// 7. Check if scripts are enqueued (if on frontend)
if (!is_admin()) {
    echo "<h2>📜 Script Status</h2>";
    global $wp_scripts;
    if ($wp_scripts) {
        $our_scripts = [
            'guestify-core-systems-bundle',
            'guestify-application-bundle',
            'guestify-topics-component'
        ];
        
        foreach ($our_scripts as $script) {
            $registered = isset($wp_scripts->registered[$script]);
            $queued = in_array($script, $wp_scripts->queue ?? []);
            echo "$script: ";
            echo "Registered: " . ($registered ? '<span class="success">✅</span>' : '<span class="error">❌</span>') . " ";
            echo "Queued: " . ($queued ? '<span class="success">✅</span>' : '<span class="error">❌</span>') . "<br>";
        }
    } else {
        echo '<span class="warning">⚠️ wp_scripts not available</span><br>';
    }
}

// 8. Memory and performance
echo "<h2>💾 System Info</h2>";
echo "PHP Version: " . PHP_VERSION . "<br>";
echo "Memory Usage: " . round(memory_get_usage() / 1024 / 1024, 2) . " MB<br>";
echo "Memory Limit: " . ini_get('memory_limit') . "<br>";
echo "WordPress Version: " . (defined('WP_VERSION') ? WP_VERSION : 'Unknown') . "<br>";

echo "<h2>🎯 NEXT STEPS</h2>";
echo "1. If classes don't exist → PHP fatal error still occurring<br>";
echo "2. If plugin inactive → Activate it in Plugins admin<br>";
echo "3. If recent errors → Those need to be fixed first<br>";
echo "4. If scripts not loading → Check builder page detection<br>";
echo "5. If everything looks good → Frontend caching issue<br>";

echo "<br><strong>Run this debug by visiting: " . home_url() . "/wp-content/plugins/guestify-media-kit-builder/debug-current-status.php</strong>";
?>