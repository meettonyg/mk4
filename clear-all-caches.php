<?php
/**
 * OpCache and WordPress Cache Clearer
 * 
 * Visit this file in your browser to clear all caches:
 * http://your-site.com/wp-content/plugins/mk4/clear-all-caches.php
 * 
 * SECURITY: Delete this file after use!
 */

// Basic security check
$allowed_ips = ['127.0.0.1', '::1', 'localhost'];
$user_ip = $_SERVER['REMOTE_ADDR'] ?? '';

if (!in_array($user_ip, $allowed_ips)) {
    die('Access denied. Only localhost access allowed.');
}

echo "<h1>Cache Clearing Utility</h1>";
echo "<style>body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; } .success { color: #10b981; } .error { color: #ef4444; } code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; }</style>";

echo "<h2>1. PHP OpCache</h2>";
if (function_exists('opcache_reset')) {
    if (opcache_reset()) {
        echo "<p class='success'>✅ OPcache cleared successfully!</p>";
    } else {
        echo "<p class='error'>❌ OPcache clear failed</p>";
    }
    
    // Show OpCache stats
    $status = opcache_get_status();
    if ($status) {
        echo "<p>Memory used: " . round($status['memory_usage']['used_memory'] / 1024 / 1024, 2) . " MB</p>";
        echo "<p>Cached scripts: " . $status['opcache_statistics']['num_cached_scripts'] . "</p>";
    }
} else {
    echo "<p class='error'>❌ OPcache not available or not enabled</p>";
}

echo "<h2>2. WordPress Object Cache</h2>";
// Try to load WordPress
$wp_load_path = dirname(__FILE__) . '/../../../../wp-load.php';
if (file_exists($wp_load_path)) {
    require_once $wp_load_path;
    
    if (function_exists('wp_cache_flush')) {
        if (wp_cache_flush()) {
            echo "<p class='success'>✅ WordPress object cache cleared!</p>";
        } else {
            echo "<p class='error'>❌ WordPress cache clear failed</p>";
        }
    } else {
        echo "<p class='error'>❌ wp_cache_flush() not available</p>";
    }
    
    // Clear transients
    global $wpdb;
    $cleared = $wpdb->query("DELETE FROM $wpdb->options WHERE option_name LIKE '_transient_%'");
    echo "<p class='success'>✅ Cleared $cleared transients</p>";
    
    // Clear media kit specific transients
    $gmkb_transients = $wpdb->get_col("SELECT option_name FROM $wpdb->options WHERE option_name LIKE '%gmkb%' AND option_name LIKE '_transient_%'");
    foreach ($gmkb_transients as $transient) {
        delete_transient(str_replace('_transient_', '', $transient));
    }
    echo "<p class='success'>✅ Cleared " . count($gmkb_transients) . " media kit transients</p>";
    
} else {
    echo "<p class='error'>❌ WordPress not found at: <code>$wp_load_path</code></p>";
}

echo "<h2>3. File Modification Times</h2>";
$files_to_check = [
    'templates/builder-template-vue-pure.php',
    'dist/gmkb.iife.js',
    'dist/gmkb.css',
    'src/vue/components/MediaKitToolbarComplete.vue',
    'src/vue/components/sidebar/SidebarTabs.vue'
];

foreach ($files_to_check as $file) {
    $full_path = dirname(__FILE__) . '/' . $file;
    if (file_exists($full_path)) {
        $mtime = filemtime($full_path);
        $ago = time() - $mtime;
        $ago_str = $ago < 60 ? "$ago seconds ago" : ($ago < 3600 ? round($ago/60) . " minutes ago" : round($ago/3600) . " hours ago");
        
        echo "<p><code>$file</code>: Modified $ago_str</p>";
    } else {
        echo "<p class='error'><code>$file</code>: NOT FOUND</p>";
    }
}

echo "<h2>4. What to do next</h2>";
echo "<ol>";
echo "<li>Close ALL browser tabs with the media kit builder</li>";
echo "<li>Clear browser cache (Ctrl + Shift + Delete)</li>";
echo "<li>Open a new Incognito/Private window</li>";
echo "<li>Load the media kit builder fresh</li>";
echo "<li>Toggle dark mode and verify colors</li>";
echo "</ol>";

echo "<h2>5. Expected Colors</h2>";
echo "<h3>Light Mode:</h3>";
echo "<ul>";
echo "<li>Sidebar: <code style='background: white; color: black; border: 1px solid #ccc;'>WHITE (#ffffff)</code></li>";
echo "<li>Preview: <code style='background: #f8f9fb; color: black;'>Light Gray (#f8f9fb)</code></li>";
echo "</ul>";

echo "<h3>Dark Mode:</h3>";
echo "<ul>";
echo "<li>Sidebar: <code style='background: #0f172a; color: white;'>Slate-900 (#0f172a)</code></li>";
echo "<li>Preview: <code style='background: #475569; color: white;'>Slate-600 (#475569)</code></li>";
echo "</ul>";

echo "<hr>";
echo "<p style='color: #ef4444; font-weight: bold;'>⚠️ SECURITY WARNING: Delete this file after use!</p>";
echo "<p>This file should not be accessible in production.</p>";
?>
