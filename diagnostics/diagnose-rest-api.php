<?php
/**
 * CRITICAL DIAGNOSTIC - Find Why REST Routes Aren't Registering
 * 
 * INSTRUCTIONS:
 * 1. Upload to WordPress root
 * 2. Visit: https://guestify.ai/diagnose-rest-api.php
 * 3. Review detailed diagnostics
 * 4. Delete after fixing
 */

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once('./wp-load.php');

if (!current_user_can('manage_options')) {
    die('Unauthorized');
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>REST API Diagnostic</title>
    <style>
        body { font-family: monospace; max-width: 1200px; margin: 20px auto; padding: 20px; background: #1e1e1e; color: #d4d4d4; }
        .success { background: #0e5c0e; padding: 10px; margin: 10px 0; border-left: 4px solid #14a514; }
        .error { background: #5c0e0e; padding: 10px; margin: 10px 0; border-left: 4px solid #a51414; }
        .warning { background: #5c4a0e; padding: 10px; margin: 10px 0; border-left: 4px solid #a58914; }
        .info { background: #0e2a5c; padding: 10px; margin: 10px 0; border-left: 4px solid #1454a5; }
        pre { background: #2d2d2d; padding: 15px; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; }
        h1 { color: #4fc3f7; }
        h2 { color: #81c784; border-bottom: 2px solid #444; padding-bottom: 10px; }
        code { background: #2d2d2d; padding: 2px 6px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>🔍 REST API DEEP DIAGNOSTIC</h1>
    <p>Timestamp: <?php echo date('Y-m-d H:i:s'); ?></p>
    
    <hr>
    
    <?php
    echo "<h2>TEST 1: PHP Errors Check</h2>";
    
    // Check if there are any PHP errors in error log
    $error_log = ini_get('error_log');
    if ($error_log && file_exists($error_log)) {
        $recent_errors = array_slice(file($error_log), -50);
        $gmkb_errors = array_filter($recent_errors, function($line) {
            return stripos($line, 'gmkb') !== false || stripos($line, 'mediakit') !== false;
        });
        
        if (!empty($gmkb_errors)) {
            echo '<div class="error">';
            echo '<strong>❌ FOUND PHP ERRORS:</strong><pre>';
            echo implode('', $gmkb_errors);
            echo '</pre></div>';
        } else {
            echo '<div class="success">✅ No recent GMKB-related PHP errors found</div>';
        }
    }
    
    echo "<h2>TEST 2: File Existence & Permissions</h2>";
    
    $file_path = WP_PLUGIN_DIR . '/guestify-media-kit-builder/includes/api/MediaKitAPI.php';
    
    if (file_exists($file_path)) {
        $perms = fileperms($file_path);
        $mod_time = filemtime($file_path);
        $size = filesize($file_path);
        
        echo '<div class="success">';
        echo '<strong>✅ File Exists</strong><br>';
        echo 'Path: ' . $file_path . '<br>';
        echo 'Size: ' . number_format($size) . ' bytes<br>';
        echo 'Modified: ' . date('Y-m-d H:i:s', $mod_time) . '<br>';
        echo 'Permissions: ' . substr(sprintf('%o', $perms), -4) . '<br>';
        echo '</div>';
        
        // Check if file is readable
        if (!is_readable($file_path)) {
            echo '<div class="error">❌ File is NOT readable! Check permissions.</div>';
        }
        
        // Try to include it manually to catch syntax errors
        ob_start();
        try {
            include_once($file_path);
            ob_end_clean();
            echo '<div class="success">✅ File includes without syntax errors</div>';
        } catch (Exception $e) {
            $error = ob_get_clean();
            echo '<div class="error">';
            echo '<strong>❌ SYNTAX ERROR IN FILE:</strong><pre>';
            echo htmlspecialchars($e->getMessage());
            if ($error) echo "\n\n" . htmlspecialchars($error);
            echo '</pre></div>';
        }
    } else {
        echo '<div class="error">❌ FILE NOT FOUND: ' . $file_path . '</div>';
    }
    
    echo "<h2>TEST 3: Namespace & Class Check</h2>";
    
    // Check if class exists with namespace
    if (class_exists('GMKB\\MediaKitAPI')) {
        echo '<div class="success">✅ Class GMKB\\MediaKitAPI exists</div>';
        
        // Check if class has the methods we need
        $reflection = new ReflectionClass('GMKB\\MediaKitAPI');
        $methods = $reflection->getMethods();
        
        $required_methods = [
            'register_rest_routes',
            'rest_get_media_kit',
            'rest_get_customizations',
            'check_media_kit_read_permission'
        ];
        
        foreach ($required_methods as $method) {
            if ($reflection->hasMethod($method)) {
                echo '<div class="success">✅ Method exists: ' . $method . '</div>';
            } else {
                echo '<div class="error">❌ Method MISSING: ' . $method . '</div>';
            }
        }
    } else {
        echo '<div class="error">❌ Class GMKB\\MediaKitAPI NOT FOUND</div>';
        
        // Check if it exists without namespace
        if (class_exists('MediaKitAPI')) {
            echo '<div class="warning">⚠️ Found MediaKitAPI without namespace - namespace issue!</div>';
        }
    }
    
    echo "<h2>TEST 4: WordPress Hook Registration</h2>";
    
    // Check if rest_api_init action has our callback
    global $wp_filter;
    
    if (isset($wp_filter['rest_api_init'])) {
        echo '<div class="info">Checking rest_api_init hooks...</div>';
        
        $found = false;
        foreach ($wp_filter['rest_api_init']->callbacks as $priority => $hooks) {
            foreach ($hooks as $hook) {
                if (is_array($hook['function'])) {
                    $obj = $hook['function'][0];
                    $method = $hook['function'][1];
                    
                    if (is_object($obj) && get_class($obj) === 'GMKB\\MediaKitAPI' && $method === 'register_rest_routes') {
                        echo '<div class="success">';
                        echo '✅ Found register_rest_routes hook at priority ' . $priority;
                        echo '</div>';
                        $found = true;
                    }
                }
            }
        }
        
        if (!$found) {
            echo '<div class="error">❌ register_rest_routes hook NOT registered!</div>';
            echo '<div class="warning">';
            echo '<strong>This means:</strong><br>';
            echo '1. The class constructor is not running, OR<br>';
            echo '2. The class is not being instantiated, OR<br>';
            echo '3. The add_action call failed<br>';
            echo '</div>';
        }
    }
    
    echo "<h2>TEST 5: Check Class Instantiation</h2>";
    
    // Check if class is instantiated at bottom of file
    $file_contents = file_get_contents($file_path);
    
    if (strpos($file_contents, 'new MediaKitAPI()') !== false) {
        echo '<div class="success">✅ Found instantiation: new MediaKitAPI()</div>';
    } else {
        echo '<div class="error">❌ NO INSTANTIATION FOUND!</div>';
        echo '<div class="warning">';
        echo '<strong>CRITICAL ISSUE:</strong> The class is defined but never instantiated.<br>';
        echo 'The file should end with: <code>new MediaKitAPI();</code><br>';
        echo '</div>';
    }
    
    // Check namespace declaration
    if (strpos($file_contents, 'namespace GMKB;') !== false) {
        echo '<div class="success">✅ Namespace declared: namespace GMKB;</div>';
    } else {
        echo '<div class="error">❌ Namespace declaration NOT FOUND</div>';
    }
    
    echo "<h2>TEST 6: REST Route Registration</h2>";
    
    $server = rest_get_server();
    $routes = $server->get_routes();
    
    $gmkb_routes = array_filter(array_keys($routes), function($route) {
        return strpos($route, '/gmkb/v1/') !== false;
    });
    
    if (!empty($gmkb_routes)) {
        echo '<div class="success">';
        echo '<strong>✅ Found GMKB Routes (' . count($gmkb_routes) . '):</strong><br>';
        foreach ($gmkb_routes as $route) {
            echo '&nbsp;&nbsp;• ' . $route . '<br>';
        }
        echo '</div>';
        
        // Check for specific routes
        $found_media_kit = false;
        $found_customizations = false;
        
        foreach ($gmkb_routes as $route) {
            if (preg_match('#/media-kit/\(\?P<id>.*?\)#', $route)) {
                if (strpos($route, 'customizations') !== false) {
                    $found_customizations = true;
                } else {
                    $found_media_kit = true;
                }
            }
        }
        
        if ($found_media_kit) {
            echo '<div class="success">✅ Media kit data endpoint registered</div>';
        } else {
            echo '<div class="error">❌ Media kit data endpoint NOT registered</div>';
        }
        
        if ($found_customizations) {
            echo '<div class="success">✅ Customizations endpoint registered</div>';
        } else {
            echo '<div class="error">❌ Customizations endpoint NOT registered</div>';
        }
    } else {
        echo '<div class="error">❌ NO GMKB ROUTES FOUND AT ALL</div>';
        echo '<div class="warning">';
        echo '<strong>This confirms register_rest_routes() is not being called.</strong><br>';
        echo '</div>';
    }
    
    echo "<h2>TEST 7: Manual Registration Test</h2>";
    
    // Try to manually instantiate and check
    try {
        if (class_exists('GMKB\\MediaKitAPI')) {
            echo '<div class="info">Attempting to reflect on class constructor...</div>';
            
            $reflection = new ReflectionClass('GMKB\\MediaKitAPI');
            $constructor = $reflection->getConstructor();
            
            if ($constructor) {
                $code = file($file_path);
                $start = $constructor->getStartLine() - 1;
                $end = $constructor->getEndLine();
                $constructor_code = array_slice($code, $start, $end - $start);
                
                echo '<div class="info">';
                echo '<strong>Constructor code:</strong><pre>';
                echo htmlspecialchars(implode('', $constructor_code));
                echo '</pre></div>';
                
                // Check if rest_api_init is registered in constructor
                $constructor_str = implode('', $constructor_code);
                if (strpos($constructor_str, 'rest_api_init') !== false) {
                    echo '<div class="success">✅ rest_api_init hook found in constructor</div>';
                } else {
                    echo '<div class="error">❌ rest_api_init hook NOT in constructor</div>';
                }
            }
        }
    } catch (Exception $e) {
        echo '<div class="error">Error reflecting: ' . $e->getMessage() . '</div>';
    }
    
    echo "<h2>📊 SUMMARY & SOLUTION</h2>";
    
    // Determine the issue
    if (!class_exists('GMKB\\MediaKitAPI')) {
        echo '<div class="error">';
        echo '<h3>❌ ISSUE: Class Not Loaded</h3>';
        echo '<strong>Solution:</strong><br>';
        echo '1. Check the file was uploaded correctly<br>';
        echo '2. Check there are no PHP syntax errors<br>';
        echo '3. Check the file is being included by WordPress<br>';
        echo '</div>';
    } elseif (empty($gmkb_routes)) {
        echo '<div class="error">';
        echo '<h3>❌ ISSUE: Routes Not Registered</h3>';
        echo '<strong>Most Likely Cause:</strong> Class exists but is not instantiated<br><br>';
        echo '<strong>Solution:</strong><br>';
        echo '1. Check the file ends with: <code>new MediaKitAPI();</code><br>';
        echo '2. If missing, add this line at the end of MediaKitAPI.php<br>';
        echo '3. The instantiation should be OUTSIDE the class definition<br>';
        echo '4. It should be OUTSIDE the namespace block<br>';
        echo '</div>';
    } else {
        echo '<div class="success">';
        echo '<h3>✅ Everything Looks Good!</h3>';
        echo 'Routes are registered. The 404s might be a caching issue.<br>';
        echo 'Try clearing all caches (server, CDN, browser).<br>';
        echo '</div>';
    }
    
    ?>
    
    <hr>
    <p><strong>⚠️ DELETE THIS FILE AFTER REVIEWING</strong></p>
</body>
</html>
