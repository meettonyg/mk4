<?php
/**
 * Phase 2 API Fix Script
 * 
 * Run this to:
 * 1. Verify the v2 API file exists
 * 2. Flush WordPress permalinks
 * 3. Test the API endpoint
 * 
 * Access via: /wp-content/plugins/mk4/fix-phase2-api.php
 */

// Load WordPress
require_once(__DIR__ . '/../../../wp-load.php');

// Must be admin
if (!current_user_can('manage_options')) {
    die('Unauthorized');
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Phase 2 API Fix</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
        }
        .step {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .success { color: #10b981; }
        .error { color: #ef4444; }
        button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <h1>Phase 2 API Diagnostic & Fix</h1>

    <?php
    $results = array();
    
    // Step 1: Check if file exists
    $api_file = __DIR__ . '/includes/api/v2/class-gmkb-rest-api-v2.php';
    $results['file_exists'] = file_exists($api_file);
    
    // Step 2: Check if class is loaded
    $results['class_loaded'] = class_exists('GMKB_REST_API_V2');
    
    // Step 3: Flush permalinks if requested
    if (isset($_GET['action']) && $_GET['action'] === 'flush') {
        flush_rewrite_rules();
        $results['flushed'] = true;
    }
    
    // Step 4: Check available routes
    $routes = rest_get_server()->get_routes();
    $gmkb_routes = array_filter(array_keys($routes), function($route) {
        return strpos($route, '/gmkb/') === 0;
    });
    
    $results['v2_routes'] = array_filter($gmkb_routes, function($route) {
        return strpos($route, '/gmkb/v2/') === 0;
    });
    ?>

    <div class="step">
        <h2>Step 1: File Check</h2>
        <?php if ($results['file_exists']): ?>
            <p class="success">✅ API file exists at: <?php echo $api_file; ?></p>
        <?php else: ?>
            <p class="error">❌ API file NOT found at: <?php echo $api_file; ?></p>
            <p>Please verify the file was created correctly.</p>
        <?php endif; ?>
    </div>

    <div class="step">
        <h2>Step 2: Class Check</h2>
        <?php if ($results['class_loaded']): ?>
            <p class="success">✅ GMKB_REST_API_V2 class is loaded</p>
        <?php else: ?>
            <p class="error">❌ GMKB_REST_API_V2 class NOT loaded</p>
            <p>The class may not be included in the main plugin file.</p>
        <?php endif; ?>
    </div>

    <div class="step">
        <h2>Step 3: Route Registration</h2>
        <?php if (!empty($results['v2_routes'])): ?>
            <p class="success">✅ v2 routes found:</p>
            <ul>
                <?php foreach ($results['v2_routes'] as $route): ?>
                    <li><?php echo esc_html($route); ?></li>
                <?php endforeach; ?>
            </ul>
        <?php else: ?>
            <p class="error">❌ No v2 routes found</p>
            <p>Routes need to be registered. Try flushing permalinks:</p>
            <form method="get">
                <input type="hidden" name="action" value="flush" />
                <button type="submit">Flush Permalinks & Refresh</button>
            </form>
        <?php endif; ?>
    </div>

    <?php if (isset($results['flushed'])): ?>
    <div class="step">
        <h2>Permalink Flush Result</h2>
        <p class="success">✅ Permalinks flushed! Refresh this page to check if routes are now available.</p>
    </div>
    <?php endif; ?>

    <div class="step">
        <h2>Step 4: All GMKB Routes</h2>
        <?php if (!empty($gmkb_routes)): ?>
            <p>Found <?php echo count($gmkb_routes); ?> GMKB routes:</p>
            <ul>
                <?php foreach ($gmkb_routes as $route): ?>
                    <li><?php echo esc_html($route); ?></li>
                <?php endforeach; ?>
            </ul>
        <?php else: ?>
            <p class="error">❌ No GMKB routes found at all</p>
        <?php endif; ?>
    </div>

    <div class="step">
        <h2>Manual Fix Steps</h2>
        <ol>
            <li>Go to <strong>Settings → Permalinks</strong></li>
            <li>Click <strong>Save Changes</strong> (don't change anything)</li>
            <li>This flushes the permalink cache</li>
            <li>Come back and check if routes appear above</li>
        </ol>
    </div>

    <div class="step">
        <h2>Debug Information</h2>
        <p><strong>PHP Debug Log:</strong></p>
        <p>Check <code>wp-content/debug.log</code> for messages like:</p>
        <ul>
            <li>✅ GMKB Phase 2: REST API v2 loaded (unified endpoint)</li>
            <li>❌ GMKB Phase 2: REST API v2 not found...</li>
        </ul>
    </div>

</body>
</html>
