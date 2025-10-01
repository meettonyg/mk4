<?php
/**
 * Media Kit Builder Diagnostic Check
 * 
 * Run this script to diagnose common issues with the Media Kit Builder
 * Access via: /wp-content/plugins/mk4/diagnostic-check.php
 */

// Bootstrap WordPress if not already loaded
if (!defined('ABSPATH')) {
    // Try to find WordPress
    $wordpress_root = dirname(dirname(dirname(dirname(__FILE__))));
    if (file_exists($wordpress_root . '/wp-load.php')) {
        require_once($wordpress_root . '/wp-load.php');
    } else {
        die('WordPress not found. Please run this script from WordPress admin or ensure WordPress is properly installed.');
    }
}

// Security check
if (!current_user_can('manage_options')) {
    wp_die('You do not have permission to access this diagnostic tool.');
}

header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Media Kit Builder - Diagnostic Check</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            max-width: 1200px;
            margin: 40px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .card {
            background: white;
            border-radius: 8px;
            padding: 24px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            margin-top: 0;
        }
        h2 {
            color: #34495e;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: bold;
            margin-left: 10px;
        }
        .status.pass {
            background: #d4edda;
            color: #155724;
        }
        .status.fail {
            background: #f8d7da;
            color: #721c24;
        }
        .status.warn {
            background: #fff3cd;
            color: #856404;
        }
        .check-item {
            padding: 12px;
            margin: 8px 0;
            border-left: 4px solid #ccc;
            background: #f8f9fa;
        }
        .check-item.pass {
            border-left-color: #28a745;
        }
        .check-item.fail {
            border-left-color: #dc3545;
        }
        .check-item.warn {
            border-left-color: #ffc107;
        }
        pre {
            background: #2d3748;
            color: #e2e8f0;
            padding: 16px;
            border-radius: 4px;
            overflow-x: auto;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            border: none;
            cursor: pointer;
        }
        .btn:hover {
            background: #2980b9;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>🔍 Media Kit Builder - Diagnostic Check</h1>
        <p>This diagnostic tool checks for common issues and configuration problems.</p>
    </div>

    <?php
    // DIAGNOSTIC 1: PHP Version & Extensions
    echo '<div class="card">';
    echo '<h2>PHP Environment</h2>';
    
    $php_version = phpversion();
    $php_ok = version_compare($php_version, '7.4', '>=');
    echo '<div class="check-item ' . ($php_ok ? 'pass' : 'fail') . '">';
    echo '<strong>PHP Version:</strong> ' . $php_version;
    echo '<span class="status ' . ($php_ok ? 'pass' : 'fail') . '">';
    echo $php_ok ? '✓ PASS' : '✗ FAIL (7.4+ required)';
    echo '</span></div>';
    
    $extensions = ['json', 'mbstring', 'curl'];
    foreach ($extensions as $ext) {
        $loaded = extension_loaded($ext);
        echo '<div class="check-item ' . ($loaded ? 'pass' : 'fail') . '">';
        echo '<strong>Extension ' . $ext . ':</strong> ';
        echo '<span class="status ' . ($loaded ? 'pass' : 'fail') . '">';
        echo $loaded ? '✓ Loaded' : '✗ Missing';
        echo '</span></div>';
    }
    echo '</div>';
    
    // DIAGNOSTIC 2: WordPress Constants
    echo '<div class="card">';
    echo '<h2>WordPress Constants</h2>';
    
    $constants = [
        'GUESTIFY_VERSION',
        'GUESTIFY_PLUGIN_DIR',
        'GUESTIFY_PLUGIN_URL',
        'GMKB_VERSION',
        'GMKB_PLUGIN_DIR',
        'GMKB_PLUGIN_URL'
    ];
    
    foreach ($constants as $constant) {
        $defined = defined($constant);
        echo '<div class="check-item ' . ($defined ? 'pass' : 'fail') . '">';
        echo '<strong>' . $constant . ':</strong> ';
        if ($defined) {
            echo '<code>' . constant($constant) . '</code>';
            echo '<span class="status pass">✓ Defined</span>';
        } else {
            echo '<span class="status fail">✗ Not Defined</span>';
        }
        echo '</div>';
    }
    echo '</div>';
    
    // DIAGNOSTIC 3: File Structure
    echo '<div class="card">';
    echo '<h2>File Structure</h2>';
    
    $plugin_dir = defined('GUESTIFY_PLUGIN_DIR') ? GUESTIFY_PLUGIN_DIR : plugin_dir_path(__FILE__);
    
    $critical_files = [
        'dist/gmkb.iife.js' => 'Vue Bundle',
        'dist/style.css' => 'Styles',
        'includes/enqueue-vue-only.php' => 'Enqueue System',
        'system/ComponentDiscovery.php' => 'Component Discovery',
        'system/ComponentLoader.php' => 'Component Loader',
        'src/main.js' => 'Vue Entry Point',
        'vite.config.js' => 'Build Config'
    ];
    
    foreach ($critical_files as $file => $label) {
        $path = $plugin_dir . $file;
        $exists = file_exists($path);
        $readable = $exists && is_readable($path);
        
        echo '<div class="check-item ' . ($readable ? 'pass' : 'fail') . '">';
        echo '<strong>' . $label . ':</strong> ';
        echo '<code>' . $file . '</code>';
        
        if ($readable) {
            $size = filesize($path);
            echo ' <small>(' . number_format($size / 1024, 2) . ' KB)</small>';
            echo '<span class="status pass">✓ Exists & Readable</span>';
        } elseif ($exists) {
            echo '<span class="status warn">⚠ Not Readable</span>';
        } else {
            echo '<span class="status fail">✗ Not Found</span>';
        }
        echo '</div>';
    }
    echo '</div>';
    
    // DIAGNOSTIC 4: Component Discovery
    echo '<div class="card">';
    echo '<h2>Component Discovery</h2>';
    
    if (class_exists('ComponentDiscovery')) {
        echo '<div class="check-item pass">';
        echo '<strong>ComponentDiscovery Class:</strong> ';
        echo '<span class="status pass">✓ Loaded</span>';
        echo '</div>';
        
        try {
            $discovery = new ComponentDiscovery($plugin_dir . 'components/');
            $discovery->scan(true); // Force fresh scan
            $components = $discovery->getComponents();
            $categories = $discovery->getCategories();
            
            echo '<div class="check-item pass">';
            echo '<strong>Components Found:</strong> ' . count($components);
            echo '<span class="status pass">✓ ' . count($components) . ' components</span>';
            echo '</div>';
            
            echo '<div class="check-item pass">';
            echo '<strong>Categories Found:</strong> ' . count($categories);
            echo '<span class="status pass">✓ ' . count($categories) . ' categories</span>';
            echo '</div>';
            
            if (!empty($components)) {
                echo '<pre>';
                echo "Components:\n";
                foreach ($components as $name => $data) {
                    echo "  - {$name}: {$data['name']} ({$data['category']})\n";
                }
                echo '</pre>';
            }
        } catch (Exception $e) {
            echo '<div class="check-item fail">';
            echo '<strong>Error:</strong> ' . esc_html($e->getMessage());
            echo '<span class="status fail">✗ Failed</span>';
            echo '</div>';
        }
    } else {
        echo '<div class="check-item fail">';
        echo '<strong>ComponentDiscovery Class:</strong> ';
        echo '<span class="status fail">✗ Not Found</span>';
        echo '<p>The ComponentDiscovery class is not loaded. Check if system/ComponentDiscovery.php is included properly.</p>';
        echo '</div>';
    }
    echo '</div>';
    
    // DIAGNOSTIC 5: WordPress Database
    echo '<div class="card">';
    echo '<h2>WordPress Database</h2>';
    
    global $wpdb;
    $db_test = $wpdb->get_var("SELECT 1");
    
    echo '<div class="check-item ' . ($db_test === '1' ? 'pass' : 'fail') . '">';
    echo '<strong>Database Connection:</strong> ';
    echo '<span class="status ' . ($db_test === '1' ? 'pass' : 'fail') . '">';
    echo $db_test === '1' ? '✓ Connected' : '✗ Failed';
    echo '</span></div>';
    
    if ($db_test === '1') {
        // Check for media kit posts
        $post_count = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'mkcg' AND post_status != 'trash'");
        echo '<div class="check-item ' . ($post_count > 0 ? 'pass' : 'warn') . '">';
        echo '<strong>Media Kit Posts:</strong> ' . $post_count;
        echo '<span class="status ' . ($post_count > 0 ? 'pass' : 'warn') . '">';
        echo $post_count > 0 ? '✓ ' . $post_count . ' posts' : '⚠ No posts found';
        echo '</span></div>';
    }
    echo '</div>';
    
    // DIAGNOSTIC 6: Ajax Handlers
    echo '<div class="card">';
    echo '<h2>AJAX Handlers</h2>';
    
    $ajax_actions = [
        'guestify_get_components',
        'guestify_render_component',
        'guestify_save_media_kit',
        'guestify_load_media_kit',
        'gmkb_save_media_kit',
        'gmkb_load_media_kit'
    ];
    
    foreach ($ajax_actions as $action) {
        $has_handler = has_action("wp_ajax_{$action}") || has_action("wp_ajax_nopriv_{$action}");
        echo '<div class="check-item ' . ($has_handler ? 'pass' : 'warn') . '">';
        echo '<strong>' . $action . ':</strong> ';
        echo '<span class="status ' . ($has_handler ? 'pass' : 'warn') . '">';
        echo $has_handler ? '✓ Registered' : '⚠ Not Registered';
        echo '</span></div>';
    }
    echo '</div>';
    
    // DIAGNOSTIC 7: Build Status
    echo '<div class="card">';
    echo '<h2>Build Status</h2>';
    
    $package_json = $plugin_dir . 'package.json';
    if (file_exists($package_json)) {
        $package = json_decode(file_get_contents($package_json), true);
        
        echo '<div class="check-item pass">';
        echo '<strong>Package:</strong> ' . ($package['name'] ?? 'Unknown');
        echo ' <small>v' . ($package['version'] ?? 'Unknown') . '</small>';
        echo '<span class="status pass">✓ Found</span>';
        echo '</div>';
        
        // Check if node_modules exists
        $node_modules = $plugin_dir . 'node_modules/';
        $has_deps = is_dir($node_modules);
        echo '<div class="check-item ' . ($has_deps ? 'pass' : 'warn') . '">';
        echo '<strong>Dependencies:</strong> ';
        echo '<span class="status ' . ($has_deps ? 'pass' : 'warn') . '">';
        echo $has_deps ? '✓ Installed' : '⚠ Run npm install';
        echo '</span></div>';
        
        // Check build output
        $build_file = $plugin_dir . 'dist/gmkb.iife.js';
        if (file_exists($build_file)) {
            $build_time = filemtime($build_file);
            $age = time() - $build_time;
            $age_text = $age < 3600 ? round($age / 60) . ' minutes ago' : round($age / 3600) . ' hours ago';
            
            echo '<div class="check-item pass">';
            echo '<strong>Build:</strong> ' . date('Y-m-d H:i:s', $build_time);
            echo ' <small>(' . $age_text . ')</small>';
            echo '<span class="status pass">✓ Built</span>';
            echo '</div>';
        } else {
            echo '<div class="check-item fail">';
            echo '<strong>Build:</strong> Not found';
            echo '<span class="status fail">✗ Run npm run build</span>';
            echo '</div>';
        }
    } else {
        echo '<div class="check-item fail">';
        echo '<strong>package.json:</strong> Not found';
        echo '<span class="status fail">✗ Missing</span>';
        echo '</div>';
    }
    echo '</div>';
    
    // DIAGNOSTIC 8: Browser Compatibility
    echo '<div class="card">';
    echo '<h2>Quick Fixes</h2>';
    echo '<p>If you\'re experiencing issues, try these fixes:</p>';
    
    echo '<form method="post" style="margin: 20px 0;">';
    wp_nonce_field('gmkb_diagnostic_action', 'gmkb_diagnostic_nonce');
    
    echo '<button type="submit" name="action" value="clear_cache" class="btn">Clear Component Cache</button> ';
    echo '<button type="submit" name="action" value="rebuild" class="btn">Force Rebuild (npm)</button>';
    echo '</form>';
    
    // Handle actions
    if (isset($_POST['action']) && wp_verify_nonce($_POST['gmkb_diagnostic_nonce'], 'gmkb_diagnostic_action')) {
        if ($_POST['action'] === 'clear_cache') {
            if (class_exists('ComponentDiscovery')) {
                $discovery = new ComponentDiscovery($plugin_dir . 'components/');
                $discovery->clearCache();
                echo '<div class="check-item pass">✓ Component cache cleared successfully!</div>';
            }
        } elseif ($_POST['action'] === 'rebuild') {
            $output = [];
            $return_var = 0;
            exec('cd ' . escapeshellarg($plugin_dir) . ' && npm run build 2>&1', $output, $return_var);
            
            if ($return_var === 0) {
                echo '<div class="check-item pass">✓ Build completed successfully!</div>';
            } else {
                echo '<div class="check-item fail">✗ Build failed. Output:</div>';
                echo '<pre>' . implode("\n", $output) . '</pre>';
            }
        }
    }
    
    echo '</div>';
    ?>

    <div class="card">
        <h2>Next Steps</h2>
        <ul>
            <li>If components are not loading, try clearing the component cache</li>
            <li>If the Vue bundle is missing, run <code>npm install && npm run build</code></li>
            <li>Check the browser console for JavaScript errors</li>
            <li>Check WordPress error logs for PHP errors</li>
            <li>Ensure all file permissions are correct (readable by web server)</li>
        </ul>
        
        <a href="<?php echo admin_url(); ?>" class="btn">← Back to WordPress Admin</a>
    </div>
</body>
</html>
