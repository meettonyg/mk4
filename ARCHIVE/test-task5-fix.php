<?php
/**
 * @file test-task5-fix.php
 * @description Quick test to verify Task 5 PHP class loading fix
 * 
 * Add this to your WordPress installation and access via browser
 * OR create a WordPress page with this PHP code to test
 */

// Only run if WordPress is loaded
if (!defined('ABSPATH')) {
    die('This script must be run within WordPress environment');
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Task 5 PHP Fix Verification</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .pass { color: #28a745; font-weight: bold; }
        .fail { color: #dc3545; font-weight: bold; }
        .warning { color: #ffc107; font-weight: bold; }
        .test { margin: 15px 0; padding: 10px; border-left: 4px solid #ddd; }
        .test.pass { border-left-color: #28a745; background: #f8fff9; }
        .test.fail { border-left-color: #dc3545; background: #fff8f8; }
        .test.warning { border-left-color: #ffc107; background: #fffdf7; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Task 5 PHP Class Loading Fix Verification</h1>
        <p>Testing if the PHP Fatal error "Class GMKB_MKCG_Data_Integration not found" has been resolved.</p>
        
        <?php
        $tests_passed = 0;
        $total_tests = 0;
        
        // Test 1: Data Integration Class
        $total_tests++;
        echo '<div class="test ';
        if (class_exists('GMKB_MKCG_Data_Integration')) {
            echo 'pass"><span class="pass">✅ PASS</span>';
            $tests_passed++;
        } else {
            echo 'fail"><span class="fail">❌ FAIL</span>';
        }
        echo ' <strong>Test 1:</strong> GMKB_MKCG_Data_Integration class exists</div>';
        
        // Test 2: AJAX Handlers Class
        $total_tests++;
        echo '<div class="test ';
        if (class_exists('GMKB_MKCG_Refresh_AJAX_Handlers')) {
            echo 'pass"><span class="pass">✅ PASS</span>';
            $tests_passed++;
        } else {
            echo 'fail"><span class="fail">❌ FAIL</span>';
        }
        echo ' <strong>Test 2:</strong> GMKB_MKCG_Refresh_AJAX_Handlers class exists</div>';
        
        // Test 3: Instance Creation
        $total_tests++;
        $instance_test = false;
        if (class_exists('GMKB_MKCG_Data_Integration')) {
            try {
                $instance = GMKB_MKCG_Data_Integration::get_instance();
                if ($instance) {
                    $instance_test = true;
                    $tests_passed++;
                }
            } catch (Exception $e) {
                echo '<div class="test fail"><span class="fail">❌ ERROR</span> <strong>Exception:</strong> ' . $e->getMessage() . '</div>';
            }
        }
        
        echo '<div class="test ';
        if ($instance_test) {
            echo 'pass"><span class="pass">✅ PASS</span>';
        } else {
            echo 'fail"><span class="fail">❌ FAIL</span>';
        }
        echo ' <strong>Test 3:</strong> Can create GMKB_MKCG_Data_Integration instance</div>';
        
        // Test 4: AJAX Actions Registered
        $total_tests++;
        $ajax_test = has_action('wp_ajax_gmkb_check_mkcg_freshness') && 
                     has_action('wp_ajax_gmkb_get_fresh_mkcg_data');
        
        echo '<div class="test ';
        if ($ajax_test) {
            echo 'pass"><span class="pass">✅ PASS</span>';
            $tests_passed++;
        } else {
            echo 'warning"><span class="warning">⚠️ WARNING</span>';
        }
        echo ' <strong>Test 4:</strong> AJAX handlers are registered</div>';
        
        // Test 5: File Existence
        $total_tests++;
        $files_exist = file_exists(GMKB_PLUGIN_DIR . 'includes/class-gmkb-mkcg-data-integration.php') &&
                       file_exists(GMKB_PLUGIN_DIR . 'includes/class-gmkb-mkcg-refresh-ajax-handlers.php');
        
        echo '<div class="test ';
        if ($files_exist) {
            echo 'pass"><span class="pass">✅ PASS</span>';
            $tests_passed++;
        } else {
            echo 'fail"><span class="fail">❌ FAIL</span>';
        }
        echo ' <strong>Test 5:</strong> Required files exist</div>';
        
        // Summary
        $success_rate = round(($tests_passed / $total_tests) * 100);
        echo '<div style="margin-top: 30px; padding: 20px; border-radius: 5px; ';
        
        if ($success_rate >= 80) {
            echo 'background: #d4edda; border: 2px solid #28a745;">';
            echo '<h2 style="color: #28a745; margin: 0;">🎉 SUCCESS: PHP Fix Verified!</h2>';
            echo '<p>All critical tests passed. The "Class not found" error should be resolved.</p>';
        } elseif ($success_rate >= 60) {
            echo 'background: #fff3cd; border: 2px solid #ffc107;">';
            echo '<h2 style="color: #856404; margin: 0;">⚠️ PARTIAL SUCCESS</h2>';
            echo '<p>Most tests passed, but there may be minor issues.</p>';
        } else {
            echo 'background: #f8d7da; border: 2px solid #dc3545;">';
            echo '<h2 style="color: #721c24; margin: 0;">❌ ISSUES DETECTED</h2>';
            echo '<p>Several tests failed. The PHP error may still occur.</p>';
        }
        
        echo "<p><strong>Score:</strong> {$tests_passed}/{$total_tests} tests passed ({$success_rate}%)</p>";
        echo '</div>';
        
        // Debugging Information
        echo '<div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px;">';
        echo '<h3>🔍 Debug Information</h3>';
        echo '<p><strong>WordPress Version:</strong> ' . get_bloginfo('version') . '</p>';
        echo '<p><strong>PHP Version:</strong> ' . PHP_VERSION . '</p>';
        echo '<p><strong>Plugin Directory:</strong> ' . (defined('GMKB_PLUGIN_DIR') ? GMKB_PLUGIN_DIR : 'Not defined') . '</p>';
        echo '<p><strong>Timestamp:</strong> ' . current_time('mysql') . '</p>';
        
        // Check if main plugin class exists
        if (class_exists('Guestify_Media_Kit_Builder')) {
            echo '<p><strong>Main Plugin Class:</strong> ✅ Loaded</p>';
        } else {
            echo '<p><strong>Main Plugin Class:</strong> ❌ Not loaded</p>';
        }
        
        echo '</div>';
        
        // Next Steps
        echo '<div style="margin-top: 20px; padding: 15px; background: #e7f3ff; border-radius: 5px; border-left: 4px solid #007cba;">';
        echo '<h3>📋 Next Steps</h3>';
        
        if ($success_rate >= 80) {
            echo '<ol>';
            echo '<li>✅ The PHP class loading fix appears to be working</li>';
            echo '<li>🧪 Test the JavaScript functionality with: <code>testTask5Comprehensive()</code></li>';
            echo '<li>🔄 Try using the refresh functionality in the Media Kit Builder</li>';
            echo '<li>📊 Check browser console for any JavaScript errors</li>';
            echo '</ol>';
        } else {
            echo '<ol>';
            echo '<li>🔧 Review the plugin file loading order</li>';
            echo '<li>📁 Ensure all files are properly uploaded</li>';
            echo '<li>🔄 Try deactivating and reactivating the plugin</li>';
            echo '<li>📝 Check WordPress error logs for additional details</li>';
            echo '</ol>';
        }
        
        echo '</div>';
        ?>
    </div>
</body>
</html>
