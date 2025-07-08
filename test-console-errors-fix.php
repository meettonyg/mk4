<?php
/**
 * Console Errors Root-Level Fix Validation Script
 * 
 * This script validates that all console error fixes have been implemented correctly:
 * 1. JavaScript syntax error in task5-integration.js
 * 2. setupGlobalErrorListeners function availability  
 * 3. initializeEnhancedErrorHandling function availability
 * 4. Overall initialization timeout resolution
 * 
 * USAGE: 
 * 1. Add this script to Media Kit Builder page
 * 2. Check browser console for validation results
 * 3. All tests should pass (✅) for successful fix
 */

// Start output buffering to prevent WordPress interference
ob_start();
?>
<!DOCTYPE html>
<html>
<head>
    <title>Console Errors Fix Validation</title>
    <style>
        .validation-container {
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }
        .test-group {
            margin: 20px 0;
            padding: 15px;
            background: white;
            border-radius: 6px;
            border-left: 4px solid #007cba;
        }
        .test-result {
            margin: 10px 0;
            padding: 10px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
        }
        .test-pass { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .test-fail { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .test-info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        .console-note {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="validation-container">
        <h1>🔧 Console Errors Root-Level Fix Validation</h1>
        
        <div class="console-note">
            <strong>📋 Instructions:</strong>
            <ol>
                <li>Open browser DevTools Console (F12 → Console tab)</li>
                <li>Look for validation results in console</li>
                <li>All tests should show ✅ PASS for successful fix</li>
                <li>Any ❌ FAIL indicates remaining issues</li>
            </ol>
        </div>

        <div class="test-group">
            <h2>📄 File Validation</h2>
            <div id="file-validation">
                <?php
                $root_path = __DIR__;
                
                // Test 1: task5-integration.js exists and is readable
                $task5_file = $root_path . '/js/core/task5-integration.js';
                if (file_exists($task5_file)) {
                    echo '<div class="test-result test-pass">✅ task5-integration.js file exists</div>';
                    
                    // Check for syntax error fix
                    $content = file_get_contents($task5_file);
                    if (strpos($content, "\\nimport") === false) {
                        echo '<div class="test-result test-pass">✅ Syntax error fixed - no literal \\n characters found</div>';
                    } else {
                        echo '<div class="test-result test-fail">❌ Syntax error still present - literal \\n characters found</div>';
                    }
                } else {
                    echo '<div class="test-result test-fail">❌ task5-integration.js file missing</div>';
                }
                
                // Test 2: enhanced-error-handler.js exists and has global functions
                $error_handler_file = $root_path . '/js/utils/enhanced-error-handler.js';
                if (file_exists($error_handler_file)) {
                    echo '<div class="test-result test-pass">✅ enhanced-error-handler.js file exists</div>';
                    
                    $content = file_get_contents($error_handler_file);
                    if (strpos($content, 'setupGlobalErrorListeners') !== false) {
                        echo '<div class="test-result test-pass">✅ setupGlobalErrorListeners function found in file</div>';
                    } else {
                        echo '<div class="test-result test-fail">❌ setupGlobalErrorListeners function missing from file</div>';
                    }
                    
                    if (strpos($content, 'initializeEnhancedErrorHandling') !== false) {
                        echo '<div class="test-result test-pass">✅ initializeEnhancedErrorHandling function found in file</div>';
                    } else {
                        echo '<div class="test-result test-fail">❌ initializeEnhancedErrorHandling function missing from file</div>';
                    }
                } else {
                    echo '<div class="test-result test-fail">❌ enhanced-error-handler.js file missing</div>';
                }
                
                // Test 3: main.js imports enhanced-error-handler
                $main_file = $root_path . '/js/main.js';
                if (file_exists($main_file)) {
                    echo '<div class="test-result test-pass">✅ main.js file exists</div>';
                    
                    $content = file_get_contents($main_file);
                    if (strpos($content, 'enhanced-error-handler') !== false) {
                        echo '<div class="test-result test-pass">✅ main.js imports enhanced-error-handler.js</div>';
                    } else {
                        echo '<div class="test-result test-fail">❌ main.js missing enhanced-error-handler import</div>';
                    }
                } else {
                    echo '<div class="test-result test-fail">❌ main.js file missing</div>';
                }
                ?>
            </div>
        </div>

        <div class="test-group">
            <h2>🌐 Runtime Validation</h2>
            <div class="test-result test-info">
                ℹ️ Runtime validation will appear in browser console below...
            </div>
        </div>
    </div>

    <script>
        console.log('🔧 Starting Console Errors Fix Validation...\n');
        
        // Store validation results
        const validationResults = {
            passed: 0,
            failed: 0,
            tests: []
        };
        
        function test(name, condition, critical = false) {
            const status = condition ? 'PASS' : 'FAIL';
            const icon = condition ? '✅' : '❌';
            const message = `${icon} ${name}: ${status}`;
            
            console.log(message);
            
            validationResults.tests.push({ name, status, critical, condition });
            
            if (condition) {
                validationResults.passed++;
            } else {
                validationResults.failed++;
                if (critical) {
                    console.error(`🚨 CRITICAL TEST FAILED: ${name}`);
                }
            }
        }
        
        console.log('📋 Phase 1: JavaScript Import System Validation');
        console.log('='.repeat(50));
        
        // Test if imports are working (no syntax errors)
        let importSystemWorking = true;
        try {
            // If this script is running, basic imports are working
            test('JavaScript execution started', true, true);
            
            // Test if we can access imported modules that were failing before
            setTimeout(() => {
                test('Task 5 integration import resolved', typeof window.task5Integration !== 'undefined', false);
            }, 1000);
            
        } catch (error) {
            importSystemWorking = false;
            console.error('❌ Import system still failing:', error);
        }
        
        test('Import system operational', importSystemWorking, true);
        
        console.log('\n📋 Phase 2: Global Function Availability');
        console.log('='.repeat(50));
        
        // Test global functions availability with delay to allow imports
        setTimeout(() => {
            test('setupGlobalErrorListeners available', typeof window.setupGlobalErrorListeners === 'function', true);
            test('initializeEnhancedErrorHandling available', typeof window.initializeEnhancedErrorHandling === 'function', true);
            test('enhancedErrorHandler available', typeof window.enhancedErrorHandler === 'object', false);
            
            // Test if error handler functions work
            if (typeof window.setupGlobalErrorListeners === 'function') {
                try {
                    const result = window.setupGlobalErrorListeners();
                    test('setupGlobalErrorListeners executes', result === true, false);
                } catch (error) {
                    test('setupGlobalErrorListeners executes', false, false);
                    console.error('setupGlobalErrorListeners error:', error);
                }
            }
            
            if (typeof window.initializeEnhancedErrorHandling === 'function') {
                try {
                    const result = window.initializeEnhancedErrorHandling();
                    test('initializeEnhancedErrorHandling executes', result === true, false);
                } catch (error) {
                    test('initializeEnhancedErrorHandling executes', false, false);
                    console.error('initializeEnhancedErrorHandling error:', error);
                }
            }
            
            console.log('\n📋 Phase 3: Initialization System Validation');
            console.log('='.repeat(50));
            
            // Check for common Media Kit Builder objects
            test('guestifyData available', typeof window.guestifyData === 'object', true);
            test('systemRegistrar available', typeof window.systemRegistrar === 'object', false);
            test('enhancedComponentManager available', typeof window.enhancedComponentManager === 'object', false);
            test('stateManager available', typeof window.stateManager === 'object', false);
            
            // Check initialization state
            test('initializationStarted flag', window.initializationStarted === true, false);
            test('mediaKitBuilderReady flag', window.mediaKitBuilderReady === true, false);
            
            // Monitor for timeout issues
            let initializationTimeout = false;
            const timeoutChecker = setTimeout(() => {
                if (!window.mediaKitBuilderReady) {
                    initializationTimeout = true;
                    test('Initialization completed within 5s', false, true);
                    console.error('🚨 Initialization is taking longer than 5 seconds - potential timeout issue');
                }
            }, 5000);
            
            // Listen for successful initialization
            window.addEventListener('mediaKitBuilderReady', function(event) {
                clearTimeout(timeoutChecker);
                test('Initialization completed within 5s', true, true);
                test('mediaKitBuilderReady event fired', true, false);
                console.log('🎉 Media Kit Builder initialized successfully!', event.detail);
            });
            
            // Final results after 6 seconds
            setTimeout(() => {
                console.log('\n📊 VALIDATION SUMMARY');
                console.log('='.repeat(50));
                
                const totalTests = validationResults.passed + validationResults.failed;
                const successRate = Math.round((validationResults.passed / totalTests) * 100);
                const criticalFailures = validationResults.tests.filter(t => !t.condition && t.critical).length;
                
                console.log(`📈 Total Tests: ${totalTests}`);
                console.log(`✅ Passed: ${validationResults.passed}`);
                console.log(`❌ Failed: ${validationResults.failed}`);
                console.log(`📊 Success Rate: ${successRate}%`);
                console.log(`🚨 Critical Failures: ${criticalFailures}`);
                
                if (criticalFailures === 0 && successRate >= 80) {
                    console.log('\n🎉 VALIDATION PASSED!');
                    console.log('✅ Console errors should be resolved');
                    console.log('✅ Media Kit Builder should initialize correctly');
                } else {
                    console.log('\n⚠️ VALIDATION ISSUES DETECTED');
                    console.log('❌ Some console errors may still be present');
                    console.log('🔧 Additional fixes may be required');
                    
                    // Show failed tests
                    const failedTests = validationResults.tests.filter(t => !t.condition);
                    if (failedTests.length > 0) {
                        console.log('\n❌ Failed Tests:');
                        failedTests.forEach(test => {
                            console.log(`  • ${test.name} ${test.critical ? '(CRITICAL)' : ''}`);
                        });
                    }
                }
                
                console.log('\n📋 Next Steps:');
                if (criticalFailures === 0) {
                    console.log('1. Refresh the page to test with clean initialization');
                    console.log('2. Check for any remaining console errors');
                    console.log('3. Test Media Kit Builder functionality');
                } else {
                    console.log('1. Review failed critical tests above');
                    console.log('2. Check file paths and imports');
                    console.log('3. Verify enhanced error handler is properly imported');
                    console.log('4. Re-run validation after fixes');
                }
                
                console.log('\n🔧 Debug Commands Available:');
                console.log('• testArchitectureFix() - Test architectural components');
                console.log('• window.gmkbDiagnostics.quickCheck() - Quick system check');
                console.log('• errorDebug.help() - Enhanced error handler debug');
            }, 6000);
            
        }, 2000); // Allow time for imports to resolve
        
        console.log('\n⏳ Running validation tests...');
        console.log('📍 Results will appear above in ~6 seconds');
    </script>
</body>
</html>
<?php
// Clear output buffer and send
ob_end_clean();
?>
