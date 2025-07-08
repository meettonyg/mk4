/**
 * @file test-fixes.js  
 * @description Simple test to verify all fixes are working
 */

// Simple test function to verify fixes
window.testFixes = async function() {
    console.log('🧪 TESTING FIXES...');
    console.log('==================');
    
    const results = {
        timestamp: new Date().toISOString(),
        fixes: {},
        errors: []
    };
    
    // Test 1: Wait for initialization
    console.group('🕰️ Test 1: Initialization Wait');
    try {
        if (window.waitForInitialization) {
            await window.waitForInitialization(3000);
            console.log('✅ Initialization wait successful');
            results.fixes.initializationWait = true;
        } else {
            console.error('❌ waitForInitialization not available');
            results.fixes.initializationWait = false;
        }
    } catch (error) {
        console.error('❌ Initialization wait failed:', error.message);
        results.fixes.initializationWait = false;
        results.errors.push(error.message);
    }
    console.groupEnd();
    
    // Test 2: Enhanced Component Manager
    console.group('🧩 Test 2: Enhanced Component Manager');
    const ecmChecks = {
        available: !!window.enhancedComponentManager,
        hasAddComponent: typeof window.enhancedComponentManager?.addComponent === 'function',
        isInitialized: window.enhancedComponentManager?.isInitialized
    };
    
    Object.entries(ecmChecks).forEach(([check, result]) => {
        console.log(`${result ? '✅' : '❌'} ${check}: ${result}`);
    });
    
    results.fixes.enhancedComponentManager = Object.values(ecmChecks).every(v => v);
    console.groupEnd();
    
    // Test 3: Testing Foundation (No Recursion)
    console.group('🧪 Test 3: Testing Foundation');
    try {
        if (window.testingFoundation) {
            // Check if methods exist without calling them
            const tfChecks = {
                available: true,
                hasCreateEmptyStateTests: typeof window.testingFoundation.createEmptyStateTests === 'function',
                hasCreateComponentStateTests: typeof window.testingFoundation.createComponentStateTests === 'function',
                hasQuickTestAll: typeof window.testingFoundation.quickTestAll === 'function'
            };
            
            Object.entries(tfChecks).forEach(([check, result]) => {
                console.log(`${result ? '✅' : '❌'} ${check}: ${result}`);
            });
            
            // Try to create tests without executing them
            if (tfChecks.hasCreateEmptyStateTests) {
                const emptyTests = window.testingFoundation.createEmptyStateTests();
                const hasTestMethods = emptyTests && 
                    typeof emptyTests.testNoDataScenario === 'function' &&
                    typeof emptyTests.testLowQualityScenario === 'function' &&
                    typeof emptyTests.testHighQualityScenario === 'function';
                console.log(`${hasTestMethods ? '✅' : '❌'} Empty state test methods created: ${hasTestMethods}`);
                results.fixes.testingFoundation = hasTestMethods;
            } else {
                results.fixes.testingFoundation = false;
            }
        } else {
            console.error('❌ Testing foundation not available');
            results.fixes.testingFoundation = false;
        }
    } catch (error) {
        console.error('❌ Testing foundation error:', error.message);
        results.fixes.testingFoundation = false;
        results.errors.push(error.message);
    }
    console.groupEnd();
    
    // Test 4: Emergency Diagnostic
    console.group('🚨 Test 4: Emergency Diagnostic');
    try {
        if (typeof window.emergencyDiagnostic === 'function') {
            console.log('✅ Emergency diagnostic available');
            results.fixes.emergencyDiagnostic = true;
        } else {
            console.error('❌ Emergency diagnostic not available');
            results.fixes.emergencyDiagnostic = false;
        }
    } catch (error) {
        console.error('❌ Emergency diagnostic error:', error.message);
        results.fixes.emergencyDiagnostic = false;
    }
    console.groupEnd();
    
    // Test 5: Run a simple test without recursion
    console.group('🎯 Test 5: Simple Runtime Test');
    try {
        if (window.testingFoundation && window.testingFoundation.performance) {
            // Test performance measurement without recursion
            const testResult = await window.testingFoundation.performance.measure(
                async () => {
                    // Simple operation
                    await new Promise(resolve => setTimeout(resolve, 10));
                    return { success: true };
                },
                'simpleTest'
            );
            
            console.log('✅ Performance test completed:', {
                duration: testResult.duration,
                withinTarget: testResult.withinTarget
            });
            results.fixes.simpleRuntimeTest = true;
        } else {
            console.warn('⚠️ Performance testing not available');
            results.fixes.simpleRuntimeTest = false;
        }
    } catch (error) {
        console.error('❌ Simple runtime test failed:', error.message);
        results.fixes.simpleRuntimeTest = false;
        results.errors.push(error.message);
    }
    console.groupEnd();
    
    // Calculate success rate
    const fixResults = Object.values(results.fixes);
    const successCount = fixResults.filter(v => v === true).length;
    const totalCount = fixResults.length;
    const successRate = Math.round((successCount / totalCount) * 100);
    
    // Summary
    console.log('');
    console.log('📊 TEST SUMMARY');
    console.log('===============');
    console.log(`Success Rate: ${successRate}%`);
    console.log(`Passed: ${successCount}/${totalCount}`);
    console.log(`Errors: ${results.errors.length}`);
    
    if (successRate === 100) {
        console.log('%c🎉 ALL FIXES WORKING!', 'color: #10b981; font-weight: bold; font-size: 16px;');
        console.log('✅ Ready to run full test suite');
        console.log('💡 Next: Run emergencyDiagnostic() or comprehensivePhase23TestRunner()');
    } else if (successRate >= 80) {
        console.log('%c🟡 MOSTLY WORKING', 'color: #f59e0b; font-weight: bold; font-size: 16px;');
        console.log('⚠️ Some issues remain but core functionality works');
    } else {
        console.log('%c🔴 FIXES INCOMPLETE', 'color: #ef4444; font-weight: bold; font-size: 16px;');
        console.log('❌ Critical issues preventing tests from running');
    }
    
    if (results.errors.length > 0) {
        console.group('❌ Errors Encountered');
        results.errors.forEach(error => console.error(error));
        console.groupEnd();
    }
    
    window.lastFixTestResults = results;
    return results;
};

// Add to console help
console.log(`
🔧 Fix Testing Ready!

Run: await testFixes()

This will verify:
✓ Initialization wait mechanism
✓ Enhanced component manager availability
✓ Testing foundation without recursion
✓ Emergency diagnostic availability
✓ Simple runtime test execution

Results stored in: window.lastFixTestResults
`);
