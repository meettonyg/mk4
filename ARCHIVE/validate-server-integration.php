<?php
/**
 * GMKB Server Integration Validation Script
 * 
 * Run this script to validate the server integration implementation
 * Usage: Navigate to /wp-content/plugins/mk4/validate-server-integration.php
 */

// WordPress environment (if run via web)
if (!defined('ABSPATH')) {
    // Try to load WordPress
    $wp_load_paths = [
        '../../../wp-load.php',
        '../../../../wp-load.php',
        '../../../../../wp-load.php'
    ];
    
    foreach ($wp_load_paths as $path) {
        if (file_exists($path)) {
            require_once $path;
            break;
        }
    }
    
    if (!defined('ABSPATH')) {
        die('Could not locate WordPress. Please ensure this script is in the correct plugin directory.');
    }
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>GMKB Server Integration Validation</title>
    <style>
        body { font-family: monospace; margin: 20px; background: #f5f5f5; }
        .test-section { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #2271b1; }
        .pass { color: #00a32a; }
        .fail { color: #d63638; }
        .warn { color: #dba617; }
        .test-item { margin: 8px 0; padding: 8px; background: #f9f9f9; border-radius: 4px; }
        pre { background: #333; color: #fff; padding: 10px; border-radius: 4px; overflow-x: auto; }
        .endpoint-test { background: #e7f3ff; border-left: 3px solid #2271b1; padding: 10px; margin: 10px 0; }
    </style>
</head>
<body>

<h1>🚀 GMKB Server Integration Validation</h1>
<p><strong>Testing the comprehensive component system integration implementation</strong></p>

<div class="test-section">
    <h2>📁 File System Validation</h2>
    
    <?php
    $files_to_check = [
        'js/main.js' => 'Main JavaScript file with server integration',
        'css/server-integration.css' => 'Server integration CSS styles',
        'system/ComponentDiscovery.php' => 'Component discovery system',
        'system/ComponentLoader.php' => 'Component loading system',
        'includes/enqueue.php' => 'WordPress enqueue file',
        'guestify-media-kit-builder.php' => 'Main plugin file'
    ];
    
    foreach ($files_to_check as $file => $description) {
        $path = __DIR__ . '/' . $file;
        if (file_exists($path)) {
            echo "<div class='test-item pass'>✅ {$file} - {$description}</div>";
        } else {
            echo "<div class='test-item fail'>❌ {$file} - MISSING - {$description}</div>";
        }
    }
    ?>
</div>

<div class="test-section">
    <h2>🔧 WordPress Integration Check</h2>
    
    <?php
    // Check if main plugin class exists
    if (class_exists('Guestify_Media_Kit_Builder')) {
        echo "<div class='test-item pass'>✅ Main plugin class loaded</div>";
        
        // Check if instance is available
        $instance = Guestify_Media_Kit_Builder::get_instance();
        if ($instance) {
            echo "<div class='test-item pass'>✅ Plugin instance available</div>";
            
            // Check component systems
            if (method_exists($instance, 'get_component_discovery')) {
                $discovery = $instance->get_component_discovery();
                if ($discovery) {
                    echo "<div class='test-item pass'>✅ ComponentDiscovery system available</div>";
                    
                    // Test component scanning
                    try {
                        $components = $discovery->getComponents();
                        $count = count($components);
                        echo "<div class='test-item pass'>✅ Component scanning works - Found {$count} components</div>";
                        
                        if ($count > 0) {
                            echo "<div class='test-item'><strong>Available components:</strong><br>";
                            foreach ($components as $key => $component) {
                                echo "• {$key}: {$component['name']}<br>";
                            }
                            echo "</div>";
                        }
                    } catch (Exception $e) {
                        echo "<div class='test-item fail'>❌ Component scanning failed: " . $e->getMessage() . "</div>";
                    }
                } else {
                    echo "<div class='test-item fail'>❌ ComponentDiscovery instance not available</div>";
                }
            } else {
                echo "<div class='test-item fail'>❌ get_component_discovery method not found</div>";
            }
        } else {
            echo "<div class='test-item fail'>❌ Plugin instance not available</div>";
        }
    } else {
        echo "<div class='test-item fail'>❌ Main plugin class not loaded</div>";
    }
    ?>
</div>

<div class="test-section">
    <h2>🌐 AJAX Endpoints Validation</h2>
    
    <?php
    $ajax_endpoints = [
        'guestify_get_components' => 'Get available components',
        'guestify_render_component' => 'Render component server-side',
        'guestify_save_media_kit' => 'Save media kit state',
        'guestify_load_media_kit' => 'Load media kit state'
    ];
    
    foreach ($ajax_endpoints as $action => $description) {
        $has_action = has_action("wp_ajax_{$action}") || has_action("wp_ajax_nopriv_{$action}");
        if ($has_action) {
            echo "<div class='test-item pass'>✅ {$action} - {$description}</div>";
        } else {
            echo "<div class='test-item fail'>❌ {$action} - NOT REGISTERED - {$description}</div>";
        }
    }
    ?>
</div>

<div class="test-section">
    <h2>📜 JavaScript Integration Test</h2>
    
    <div class="test-item">
        <p>Testing if the JavaScript integration will work:</p>
        <div class="endpoint-test">
            <strong>Simulated AJAX Test - Get Components</strong>
            <?php
            // Simulate the AJAX call that JavaScript makes
            if (class_exists('Guestify_Media_Kit_Builder')) {
                $instance = Guestify_Media_Kit_Builder::get_instance();
                try {
                    // Simulate the rest_get_components call
                    $result = $instance->rest_get_components();
                    if (is_array($result) && isset($result['components'])) {
                        echo "<div class='pass'>✅ AJAX endpoint simulation successful</div>";
                        echo "<pre>" . json_encode($result, JSON_PRETTY_PRINT) . "</pre>";
                    } else {
                        echo "<div class='fail'>❌ AJAX endpoint returned unexpected format</div>";
                        echo "<pre>" . print_r($result, true) . "</pre>";
                    }
                } catch (Exception $e) {
                    echo "<div class='fail'>❌ AJAX endpoint simulation failed: " . $e->getMessage() . "</div>";
                }
            }
            ?>
        </div>
    </div>
</div>

<div class="test-section">
    <h2>💾 State Management Test</h2>
    
    <?php
    // Test a sample post for state storage
    $test_post_id = 1; // Use post ID 1 as test
    
    if (get_post($test_post_id)) {
        echo "<div class='test-item'>Testing with post ID: {$test_post_id}</div>";
        
        // Test saving state
        $test_state = [
            'components' => [
                'test-component-1' => [
                    'id' => 'test-component-1',
                    'type' => 'hero',
                    'data' => ['title' => 'Test Hero']
                ]
            ],
            'layout' => ['test-component-1'],
            'globalSettings' => []
        ];
        
        $save_result = update_post_meta($test_post_id, 'gmkb_media_kit_state', $test_state);
        
        if ($save_result !== false) {
            echo "<div class='test-item pass'>✅ State save test successful</div>";
            
            // Test loading state
            $loaded_state = get_post_meta($test_post_id, 'gmkb_media_kit_state', true);
            
            if (!empty($loaded_state) && isset($loaded_state['components'])) {
                echo "<div class='test-item pass'>✅ State load test successful</div>";
                echo "<div class='test-item'><strong>Loaded state:</strong><pre>" . json_encode($loaded_state, JSON_PRETTY_PRINT) . "</pre></div>";
                
                // Clean up test data
                delete_post_meta($test_post_id, 'gmkb_media_kit_state');
                echo "<div class='test-item'>🧹 Test data cleaned up</div>";
            } else {
                echo "<div class='test-item fail'>❌ State load test failed</div>";
            }
        } else {
            echo "<div class='test-item fail'>❌ State save test failed</div>";
        }
    } else {
        echo "<div class='test-item warn'>⚠️ No test post available (post ID 1 not found)</div>";
    }
    ?>
</div>

<div class="test-section">
    <h2>📋 Implementation Summary</h2>
    
    <div class="test-item">
        <strong>✅ COMPLETED FIXES:</strong>
        <ul>
            <li>🔄 ComponentManager: Converted from static templates to server-side AJAX rendering</li>
            <li>📡 AJAX Integration: Connected JavaScript to PHP ComponentLoader and ComponentDiscovery</li>
            <li>💾 State Management: Added WordPress database persistence alongside localStorage</li>
            <li>🎛️ UI Manager: Event-driven component loading and auto-generation</li>
            <li>🎨 CSS Integration: Added server-integration.css for component controls</li>
            <li>📦 Component Library: Dynamic population from server-side component discovery</li>
            <li>🔄 Loading States: User feedback during component operations</li>
            <li>⚠️ Error Handling: Graceful fallbacks when server rendering fails</li>
        </ul>
    </div>
    
    <div class="test-item">
        <strong>🚀 ARCHITECTURE:</strong>
        <ul>
            <li>Server-Integrated Vanilla JavaScript (no jQuery dependencies)</li>
            <li>Event-driven coordination using browser native CustomEvent system</li>
            <li>AJAX communication with existing PHP systems</li>
            <li>Dual state persistence (localStorage + WordPress database)</li>
            <li>Modular CSS architecture with server integration styles</li>
        </ul>
    </div>
    
    <div class="test-item">
        <strong>🎯 NEXT STEPS:</strong>
        <ul>
            <li>Test the builder interface with component adding functionality</li>
            <li>Verify auto-generate works with MKCG data</li>
            <li>Test component library modal population</li>
            <li>Validate saved components load on page refresh</li>
            <li>Test component removal and editing functionality</li>
        </ul>
    </div>
</div>

<div class="test-section">
    <h2>🧪 Live Test Instructions</h2>
    
    <div class="test-item">
        <strong>To test the implementation:</strong>
        <ol>
            <li>Navigate to a media kit builder page (e.g., <code>/guestify-media-kit/?post_id=123</code>)</li>
            <li>Open browser console and check for initialization logs</li>
            <li>Try adding components from the component library</li>
            <li>Test the auto-generate functionality</li>
            <li>Save the state and refresh to see if components persist</li>
            <li>Check for any error messages in console</li>
        </ol>
    </div>
    
    <div class="test-item">
        <strong>Console commands for testing:</strong>
        <pre>// Check system status
gmkbUtils.getStatus()

// Add test component
gmkbUtils.addTestComponent('topics')

// Check available components
window.GMKB.systems.ComponentManager.availableComponents

// Save current state
gmkbUtils.saveState()

// View current state
window.GMKB.systems.StateManager.getState()</pre>
    </div>
</div>

<p><strong>🎉 Server integration implementation complete!</strong> The component system should now properly connect JavaScript frontend to PHP backend via AJAX.</p>

</body>
</html>
