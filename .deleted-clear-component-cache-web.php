<?php
/**
 * Force Component Discovery Cache Clear - Web Version
 * 
 * Visit this file in your browser to clear ALL component discovery caches
 * http://your-site.local/wp-content/plugins/mk4/clear-component-cache-web.php
 * 
 * SECURITY: Delete this file after use!
 */

// Basic security check
$allowed_ips = ['127.0.0.1', '::1', 'localhost'];
$user_ip = $_SERVER['REMOTE_ADDR'] ?? '';

if (!in_array($user_ip, $allowed_ips) && $user_ip !== '::1') {
    die('❌ Access denied. Only localhost access allowed. Your IP: ' . htmlspecialchars($user_ip));
}

// Load WordPress
$wp_load_path = dirname(__FILE__) . '/../../../wp-load.php';
if (!file_exists($wp_load_path)) {
    die("❌ WordPress not found at: " . htmlspecialchars($wp_load_path));
}

require_once $wp_load_path;

?>
<!DOCTYPE html>
<html>
<head>
    <title>GMKB Component Cache Clearer</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            max-width: 900px;
            margin: 50px auto;
            padding: 20px;
            background: #0f172a;
            color: #f1f5f9;
        }
        h1 {
            color: #3b82f6;
            border-bottom: 2px solid #334155;
            padding-bottom: 15px;
        }
        h2 {
            color: #60a5fa;
            margin-top: 30px;
        }
        .success { color: #10b981; }
        .error { color: #ef4444; }
        .warning { color: #f59e0b; }
        .info { color: #94a3b8; }
        code {
            background: #1e293b;
            padding: 3px 8px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            color: #e2e8f0;
        }
        pre {
            background: #1e293b;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
            border-left: 4px solid #3b82f6;
        }
        .step {
            background: #1e293b;
            padding: 15px;
            margin: 15px 0;
            border-radius: 8px;
            border-left: 4px solid #334155;
        }
        .component-list {
            background: #1e293b;
            padding: 15px;
            border-radius: 8px;
            max-height: 300px;
            overflow-y: auto;
        }
        .component-item {
            padding: 8px;
            margin: 5px 0;
            background: #0f172a;
            border-radius: 4px;
            border-left: 3px solid #10b981;
        }
        .instructions {
            background: #1e293b;
            border: 2px solid #3b82f6;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }
        .instructions ol {
            margin: 10px 0;
            padding-left: 25px;
        }
        .instructions li {
            margin: 10px 0;
        }
    </style>
</head>
<body>

<h1>🧹 GMKB Component Discovery Cache Clearer</h1>

<?php

// 1. Clear WordPress transients
echo "<div class='step'>";
echo "<h2>1️⃣  Clearing WordPress Transients</h2>";
global $wpdb;

$components_dir = dirname(__FILE__) . '/components';
$cache_key = 'gmkb_component_discovery_' . md5($components_dir);

$deleted = delete_transient($cache_key);
echo "<p class='info'>Main cache key: <code>$cache_key</code></p>";
echo "<p class='" . ($deleted ? "success" : "warning") . "'>" . 
     ($deleted ? "✅ Main cache DELETED" : "⚠️  Main cache not found (already clear)") . "</p>";

// Find all gmkb transients
$gmkb_transients = $wpdb->get_col(
    "SELECT option_name FROM $wpdb->options 
     WHERE option_name LIKE '_transient_gmkb%' 
     OR option_name LIKE '_transient_timeout_gmkb%'"
);

echo "<p class='info'>Found " . count($gmkb_transients) . " GMKB-related transients</p>";

if (count($gmkb_transients) > 0) {
    echo "<ul>";
    foreach ($gmkb_transients as $transient_name) {
        $key = str_replace(array('_transient_timeout_', '_transient_'), '', $transient_name);
        delete_transient($key);
        echo "<li class='success'>✅ Deleted: <code>$key</code></li>";
    }
    echo "</ul>";
} else {
    echo "<p class='success'>✅ No stale transients found</p>";
}
echo "</div>";

// 2. Force ComponentDiscovery refresh
echo "<div class='step'>";
echo "<h2>2️⃣  Forcing ComponentDiscovery Refresh</h2>";

if (function_exists('gmkb_refresh_components')) {
    try {
        $result = gmkb_refresh_components();
        echo "<p class='success'>✅ ComponentDiscovery refreshed successfully</p>";
        
        global $gmkb_component_discovery;
        if ($gmkb_component_discovery) {
            $components = $gmkb_component_discovery->getComponents();
            echo "<p class='info'>📊 Found <strong>" . count($components) . "</strong> components:</p>";
            echo "<div class='component-list'>";
            foreach ($components as $key => $component) {
                $name = $component['name'] ?? $key;
                $type = $component['type'] ?? $key;
                echo "<div class='component-item'>✓ $name <code>($type)</code></div>";
            }
            echo "</div>";
        }
    } catch (Exception $e) {
        echo "<p class='error'>❌ Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    }
} else {
    echo "<p class='warning'>⚠️  gmkb_refresh_components() function not available</p>";
}
echo "</div>";

// 3. Clear OPcache
echo "<div class='step'>";
echo "<h2>3️⃣  Clearing OPcache</h2>";
if (function_exists('opcache_reset')) {
    if (opcache_reset()) {
        echo "<p class='success'>✅ OPcache cleared successfully</p>";
        $status = opcache_get_status();
        if ($status) {
            echo "<p class='info'>Memory usage: " . round($status['memory_usage']['used_memory'] / 1024 / 1024, 2) . " MB</p>";
            echo "<p class='info'>Cached scripts: " . $status['opcache_statistics']['num_cached_scripts'] . "</p>";
        }
    } else {
        echo "<p class='error'>❌ OPcache clear failed</p>";
    }
} else {
    echo "<p class='info'>⚠️  OPcache not available or not enabled</p>";
}
echo "</div>";

// 4. Clear object cache
echo "<div class='step'>";
echo "<h2>4️⃣  Clearing Object Cache</h2>";
if (function_exists('wp_cache_flush')) {
    if (wp_cache_flush()) {
        echo "<p class='success'>✅ WordPress object cache flushed</p>";
    } else {
        echo "<p class='error'>❌ Object cache flush failed</p>";
    }
} else {
    echo "<p class='info'>⚠️  Object cache not available (using database)</p>";
}
echo "</div>";

// 5. Verify Authority Hook removal
echo "<div class='step'>";
echo "<h2>5️⃣  Verifying Authority Hook Removal</h2>";
global $gmkb_component_discovery;
if ($gmkb_component_discovery) {
    $components = $gmkb_component_discovery->getComponents();
    
    $authority_exists = isset($components['authority-hook']);
    
    if ($authority_exists) {
        echo "<p class='error'>❌ FAIL: Authority Hook component still found in discovery system!</p>";
        $dir = dirname(__FILE__) . "/components/authority-hook";
        echo "<p class='info'>Checking directory: <code>$dir</code></p>";
        if (is_dir($dir)) {
            echo "<p class='error'>⚠️  Directory still exists! Please DELETE this folder manually.</p>";
        } else {
            echo "<p class='warning'>⚠️  Directory doesn't exist but component is still cached. Try clearing cache again.</p>";
        }
    } else {
        echo "<p class='success'>✅ PASS: Authority Hook component successfully removed from discovery</p>";
    }
    
    // Check aliases
    $aliases = $gmkb_component_discovery->getAliases();
    if (isset($aliases['authority']) || isset($aliases['authority-hook'])) {
        echo "<p class='error'>❌ FAIL: Authority Hook alias still present in discovery system!</p>";
        echo "<p class='info'>This means the code changes weren't applied. Check files:</p>";
        echo "<ul>";
        echo "<li><code>system/ComponentDiscovery.php</code></li>";
        echo "<li><code>src/vue/services/ComponentDiscoveryService.js</code></li>";
        echo "</ul>";
    } else {
        echo "<p class='success'>✅ PASS: Authority Hook alias removed from discovery</p>";
    }
    
    // Show component count
    echo "<p class='info'><strong>Current component count: " . count($components) . "</strong></p>";
    echo "<p class='info'>Expected: 12 components (Biography, Booking Calendar, Call to Action, Guest Introduction, Hero, Photo Gallery, Podcast Player, Social Media, Statistics, Speaking Topics, Topics & Questions, Video Introduction)</p>";
    
} else {
    echo "<p class='error'>❌ ComponentDiscovery not initialized</p>";
}
echo "</div>";

?>

<div class="instructions">
    <h2>📋 Next Steps</h2>
    <ol>
        <li><strong>Close ALL browser tabs</strong> that have the Media Kit Builder open</li>
        <li><strong>Clear your browser cache:</strong>
            <ul>
                <li>Chrome/Edge: Press <code>Ctrl + Shift + Delete</code></li>
                <li>Firefox: Press <code>Ctrl + Shift + Delete</code></li>
                <li>Safari: Press <code>Cmd + Option + E</code></li>
            </ul>
        </li>
        <li><strong>Open Media Kit Builder in a new incognito/private window</strong></li>
        <li><strong>Verify:</strong> Authority Hook component should NOT appear in the component library sidebar</li>
        <li><strong>Expected result:</strong> You should see exactly <strong>12 components</strong>, not 13</li>
    </ol>
    
    <h3>⚠️ Still seeing Authority Hook?</h3>
    <p>If Authority Hook still appears after following all steps:</p>
    <ol>
        <li>Check if <code>/components/authority-hook/</code> folder still exists - DELETE it</li>
        <li>Rebuild the JavaScript bundle: <code>npm run build</code></li>
        <li>Run this cache clearer again</li>
        <li>Clear browser cache again</li>
    </ol>
    
    <p class="error"><strong>🔒 SECURITY: DELETE THIS FILE AFTER USE!</strong></p>
    <p>This file should not be accessible in production environments.</p>
</div>

</body>
</html>
