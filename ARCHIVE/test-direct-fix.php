<?php
/**
 * DIRECT FIX VALIDATION - Test if our class name fix worked
 */

echo "<h1>🧪 DIRECT FIX VALIDATION</h1>";
echo "<style>body{font-family:monospace;background:#f1f1f1;padding:20px;} .success{color:#10b981;} .error{color:#ef4444;}</style>";

// Test 1: Include the files directly and check for errors
echo "<h2>📁 Direct File Inclusion Test</h2>";

try {
    // Include enqueue.php first
    require_once __DIR__ . '/includes/enqueue.php';
    echo '<span class="success">✅ includes/enqueue.php loaded successfully</span><br>';
} catch (ParseError $e) {
    echo '<span class="error">❌ PARSE ERROR in enqueue.php: ' . $e->getMessage() . '</span><br>';
    echo 'File: ' . $e->getFile() . '<br>';
    echo 'Line: ' . $e->getLine() . '<br>';
} catch (Error $e) {
    echo '<span class="error">❌ FATAL ERROR in enqueue.php: ' . $e->getMessage() . '</span><br>';
} catch (Exception $e) {
    echo '<span class="error">❌ EXCEPTION in enqueue.php: ' . $e->getMessage() . '</span><br>';
}

// Test 2: Try to include the main plugin file
echo "<h2>🔌 Main Plugin File Test</h2>";

try {
    // Don't use require_once since it might already be loaded
    include __DIR__ . '/guestify-media-kit-builder.php';
    echo '<span class="success">✅ guestify-media-kit-builder.php loaded successfully</span><br>';
} catch (ParseError $e) {
    echo '<span class="error">❌ PARSE ERROR in main plugin: ' . $e->getMessage() . '</span><br>';
    echo 'File: ' . $e->getFile() . '<br>';
    echo 'Line: ' . $e->getLine() . '<br>';
} catch (Error $e) {
    echo '<span class="error">❌ FATAL ERROR in main plugin: ' . $e->getMessage() . '</span><br>';
    echo 'This is likely the issue - the class name fix did not work<br>';
} catch (Exception $e) {
    echo '<span class="error">❌ EXCEPTION in main plugin: ' . $e->getMessage() . '</span><br>';
}

// Test 3: Check what classes are available
echo "<h2>🏗️ Available Classes</h2>";
$classes = [
    'GMKB_Root_Fix_Script_Manager',
    'GMKB_Enhanced_Script_Manager', 
    'Guestify_Media_Kit_Builder'
];

foreach ($classes as $class) {
    if (class_exists($class)) {
        echo "$class: <span class='success'>✅ EXISTS</span><br>";
        
        // Try to get instance if it has get_instance method
        if (method_exists($class, 'get_instance')) {
            try {
                $instance = $class::get_instance();
                echo "&nbsp;&nbsp;→ Can instantiate: <span class='success'>✅ YES</span><br>";
                
                // Check for required methods
                $required_methods = ['force_builder_page_detection', 'enqueue_scripts', 'get_status'];
                foreach ($required_methods as $method) {
                    if (method_exists($instance, $method)) {
                        echo "&nbsp;&nbsp;→ Method $method: <span class='success'>✅ EXISTS</span><br>";
                    } else {
                        echo "&nbsp;&nbsp;→ Method $method: <span class='error'>❌ MISSING</span><br>";
                    }
                }
            } catch (Exception $e) {
                echo "&nbsp;&nbsp;→ Cannot instantiate: <span class='error'>❌ " . $e->getMessage() . "</span><br>";
            }
        }
    } else {
        echo "$class: <span class='error'>❌ NOT FOUND</span><br>";
    }
}

// Test 4: Check specific line that was causing the error
echo "<h2>🎯 Error Line Test</h2>";
echo "Testing the specific lines that were causing the fatal error...<br>";

try {
    // This should not throw an error now
    if (class_exists('GMKB_Enhanced_Script_Manager')) {
        $script_manager = GMKB_Enhanced_Script_Manager::get_instance();
        echo '<span class="success">✅ Line 159 equivalent: GMKB_Enhanced_Script_Manager::get_instance() works</span><br>';
        
        if (method_exists($script_manager, 'force_builder_page_detection')) {
            echo '<span class="success">✅ Method force_builder_page_detection() exists</span><br>';
        } else {
            echo '<span class="error">❌ Method force_builder_page_detection() missing</span><br>';
        }
        
    } else {
        echo '<span class="error">❌ GMKB_Enhanced_Script_Manager class still not found</span><br>';
        echo 'The class alias did not work or there are other issues<br>';
    }
} catch (Error $e) {
    echo '<span class="error">❌ FATAL ERROR still occurring: ' . $e->getMessage() . '</span><br>';
    echo 'Our fix did not work - the class issue persists<br>';
}

echo "<br><strong>🔍 Run this test: " . $_SERVER['HTTP_HOST'] . "/wp-content/plugins/guestify-media-kit-builder/test-direct-fix.php</strong>";
?>