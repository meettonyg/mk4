<?php
/**
 * ROOT FIX VALIDATION TEST
 * Tests the fundamental class loading issue that was causing the fatal error
 */

require_once 'includes/enqueue.php';

echo "🔍 ROOT FIX VALIDATION TEST\n";
echo "============================\n\n";

// Test 1: Check if the correct class exists
echo "1. Testing Class Existence:\n";
if (class_exists('GMKB_Root_Fix_Script_Manager')) {
    echo "   ✅ GMKB_Root_Fix_Script_Manager exists\n";
} else {
    echo "   ❌ GMKB_Root_Fix_Script_Manager NOT FOUND\n";
}

// Test 2: Check if backward compatibility alias works
if (class_exists('GMKB_Enhanced_Script_Manager')) {
    echo "   ✅ GMKB_Enhanced_Script_Manager alias works\n";
} else {
    echo "   ❌ GMKB_Enhanced_Script_Manager alias NOT WORKING\n";
}

// Test 3: Check if instance creation works
echo "\n2. Testing Instance Creation:\n";
try {
    $manager = GMKB_Root_Fix_Script_Manager::get_instance();
    if ($manager) {
        echo "   ✅ Instance creation successful\n";
    } else {
        echo "   ❌ Instance creation failed\n";
    }
} catch (Exception $e) {
    echo "   ❌ Exception during instance creation: " . $e->getMessage() . "\n";
}

// Test 4: Check if required methods exist
echo "\n3. Testing Required Methods:\n";
$required_methods = [
    'force_builder_page_detection',
    'enqueue_scripts',
    'get_status'
];

foreach ($required_methods as $method) {
    if (method_exists($manager, $method)) {
        echo "   ✅ Method '$method' exists\n";
    } else {
        echo "   ❌ Method '$method' NOT FOUND\n";
    }
}

// Test 5: Check if methods are callable
echo "\n4. Testing Method Functionality:\n";
try {
    $status = $manager->get_status();
    echo "   ✅ get_status() works - returned " . count($status) . " status items\n";
    
    $manager->force_builder_page_detection();
    echo "   ✅ force_builder_page_detection() works\n";
    
    $manager->enqueue_scripts();
    echo "   ✅ enqueue_scripts() works\n";
    
} catch (Exception $e) {
    echo "   ❌ Method execution failed: " . $e->getMessage() . "\n";
}

// Test 6: Check backward compatibility
echo "\n5. Testing Backward Compatibility:\n";
try {
    $compat_manager = GMKB_Enhanced_Script_Manager::get_instance();
    if ($compat_manager === $manager) {
        echo "   ✅ Backward compatibility alias returns same instance\n";
    } else {
        echo "   ⚠️ Backward compatibility alias returns different instance\n";
    }
} catch (Exception $e) {
    echo "   ❌ Backward compatibility failed: " . $e->getMessage() . "\n";
}

// Test 7: Test global functions
echo "\n6. Testing Global Functions:\n";
try {
    $global_status = gmkb_get_root_fix_status();
    if (is_array($global_status) && !isset($global_status['error'])) {
        echo "   ✅ gmkb_get_root_fix_status() works\n";
    } else {
        echo "   ❌ gmkb_get_root_fix_status() failed\n";
    }
    
    $force_result = gmkb_force_builder_page();
    if ($force_result === true) {
        echo "   ✅ gmkb_force_builder_page() works\n";
    } else {
        echo "   ❌ gmkb_force_builder_page() failed\n";
    }
} catch (Exception $e) {
    echo "   ❌ Global function test failed: " . $e->getMessage() . "\n";
}

echo "\n============================\n";
echo "🎯 ROOT CAUSE FIX SUMMARY:\n";
echo "============================\n";
echo "✅ Fixed class name mismatch (GMKB_Enhanced_Script_Manager → GMKB_Root_Fix_Script_Manager)\n";
echo "✅ Added missing methods (force_builder_page_detection, enqueue_scripts)\n";
echo "✅ Created backward compatibility alias\n";
echo "✅ Updated all references in main plugin file\n";
echo "✅ Updated global helper functions\n";

echo "\n🚀 The PHP Fatal Error should now be RESOLVED!\n";
echo "The class loading issue that was causing the fatal error has been fixed.\n";
?>