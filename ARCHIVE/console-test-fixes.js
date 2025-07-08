/**
 * COPY THIS ENTIRE SCRIPT INTO BROWSER CONSOLE
 * Tests all the fixes applied to resolve the testing framework issues
 */

console.log('🔧 TESTING MEDIA KIT BUILDER FIXES');
console.log('==================================');

// Simple test function that doesn't depend on any imports
window.testAllFixes = async function() {
    const results = {
        timestamp: new Date().toISOString(),
        fixes: {},
        errors: []
    };
    
    // Test 1: Check if critical systems are available
    console.group('🏗️ Test 1: Critical Systems Check');
    const systems = {
        enhancedComponentManager: !!window.enhancedComponentManager,
        enhancedStateManager: !!window.enhancedStateManager,
        mkcgDataMapper: !!window.mkcgDataMapper,
        testingFoundation: !!window.testingFoundation,
        guestifyData: !!window.guestifyData,
        stateManager: !!window.stateManager,
        componentManager: !!window.componentManager
    };
    
    Object.entries(systems).forEach(([name, available]) => {
        results.fixes[name] = available;
        console.log(`${available ? '✅' : '❌'} ${name}: ${available ? 'Available' : 'Missing'}`);
    });
    console.groupEnd();
    
    // Test 2: Check if emergency diagnostic is available
    console.group('🚨 Test 2: Emergency Diagnostic');
    try {
        if (typeof window.emergencyDiagnostic === 'function') {
            console.log('✅ Emergency diagnostic function available');
            results.fixes.emergencyDiagnostic = true;
            
            // Run it
            const diagnosticResult = window.emergencyDiagnostic();
            results.diagnosticResult = diagnosticResult;
        } else {
            console.error('❌ Emergency diagnostic not available');
            results.fixes.emergencyDiagnostic = false;
        }
    } catch (error) {
        console.error('❌ Emergency diagnostic error:', error.message);
        results.fixes.emergencyDiagnostic = false;
        results.errors.push(error.message);
    }
    console.groupEnd();
    
    // Test 3: Test recursion fix
    console.group('🔄 Test 3: Recursion Fix Test');
    try {
        if (window.testingFoundation) {
            // Try to create test methods
            const emptyTests = window.testingFoundation.createEmptyStateTests();
            const componentTests = window.testingFoundation.createComponentStateTests();
            
            // Check if methods exist
            const hasEmptyTests = emptyTests && 
                typeof emptyTests.testNoDataScenario === 'function' &&
                typeof emptyTests.testLowQualityScenario === 'function' &&
                typeof emptyTests.testHighQualityScenario === 'function';
                
            const hasComponentTests = componentTests &&
                typeof componentTests.testMKCGPopulatedComponent === 'function' &&
                typeof componentTests.testManualComponent === 'function' &&
                typeof componentTests.testStaleComponent === 'function';
            
            results.fixes.recursionFixed = hasEmptyTests && hasComponentTests;
            console.log(`${results.fixes.recursionFixed ? '✅' : '❌'} Recursion fixed: ${results.fixes.recursionFixed}`);
            
            // Try a simple test
            if (results.fixes.recursionFixed) {
                console.log('🧪 Running simple performance test...');
                const perfTest = await window.testingFoundation.performance.measure(
                    async () => {
                        await new Promise(resolve => setTimeout(resolve, 10));
                        return { success: true };
                    },
                    'simpleTest'
                );
                console.log('✅ Performance test completed:', perfTest.duration.toFixed(2) + 'ms');
                results.simpleTestResult = perfTest;
            }
        } else {
            results.fixes.recursionFixed = false;
            console.error('❌ Testing foundation not available');
        }
    } catch (error) {
        results.fixes.recursionFixed = false;
        console.error('❌ Recursion test failed:', error.message);
        results.errors.push(error.message);
    }
    console.groupEnd();
    
    // Test 4: Check if wait for initialization is available
    console.group('⏳ Test 4: Initialization Wait Utility');
    try {
        if (typeof window.waitForInitialization === 'function') {
            console.log('✅ waitForInitialization function available');
            results.fixes.waitForInitialization = true;
        } else {
            console.error('❌ waitForInitialization not available');
            results.fixes.waitForInitialization = false;
        }
        
        if (typeof window.runTestsWhenReady === 'function') {
            console.log('✅ runTestsWhenReady function available');
            results.fixes.runTestsWhenReady = true;
        } else {
            console.error('❌ runTestsWhenReady not available');
            results.fixes.runTestsWhenReady = false;
        }
    } catch (error) {
        console.error('❌ Initialization utility error:', error.message);
        results.errors.push(error.message);
    }
    console.groupEnd();
    
    // Test 5: Check if comprehensive test runner is available
    console.group('🧪 Test 5: Test Runners');
    try {
        results.fixes.comprehensiveTestRunner = typeof window.comprehensivePhase23TestRunner === 'function';
        results.fixes.implementationValidator = !!window.implementationValidator;
        
        console.log(`${results.fixes.comprehensiveTestRunner ? '✅' : '❌'} comprehensivePhase23TestRunner: ${results.fixes.comprehensiveTestRunner ? 'Available' : 'Missing'}`);
        console.log(`${results.fixes.implementationValidator ? '✅' : '❌'} implementationValidator: ${results.fixes.implementationValidator ? 'Available' : 'Missing'}`);
    } catch (error) {
        console.error('❌ Test runner check error:', error.message);
        results.errors.push(error.message);
    }
    console.groupEnd();
    
    // Calculate summary
    const fixCount = Object.values(results.fixes).filter(v => v === true).length;
    const totalChecks = Object.values(results.fixes).length;
    const successRate = Math.round((fixCount / totalChecks) * 100);
    
    results.summary = {
        passed: fixCount,
        total: totalChecks,
        successRate: successRate,
        errorCount: results.errors.length
    };
    
    // Display summary
    console.log('');
    console.log('📊 TEST SUMMARY');
    console.log('===============');
    console.log(`✅ Passed: ${fixCount}/${totalChecks} (${successRate}%)`);
    console.log(`❌ Errors: ${results.errors.length}`);
    
    if (successRate === 100) {
        console.log('');
        console.log('%c🎉 ALL FIXES WORKING PERFECTLY!', 'color: #10b981; font-weight: bold; font-size: 16px;');
        console.log('');
        console.log('🚀 You can now run:');
        console.log('   emergencyDiagnostic()                          // System health check');
        console.log('   await comprehensivePhase23TestRunner()         // Full test suite');
        console.log('   await runTestsWhenReady(() => yourTest())      // Run test when ready');
    } else if (successRate >= 80) {
        console.log('');
        console.log('%c⚠️ MOSTLY WORKING', 'color: #f59e0b; font-weight: bold; font-size: 16px;');
        console.log('Some fixes are in place but not all systems are ready.');
    } else {
        console.log('');
        console.log('%c❌ CRITICAL ISSUES', 'color: #ef4444; font-weight: bold; font-size: 16px;');
        console.log('Many systems are missing. The page may not have loaded correctly.');
        console.log('Try refreshing the page.');
    }
    
    if (results.errors.length > 0) {
        console.group('❌ Errors Encountered');
        results.errors.forEach(error => console.error(error));
        console.groupEnd();
    }
    
    window.lastFixTestResults = results;
    return results;
};

// Run the test automatically
console.log('🚀 Running fix validation...');
console.log('');
testAllFixes().then(results => {
    console.log('');
    console.log('📋 Full results stored in: window.lastFixTestResults');
    console.log('🔄 To run again: await testAllFixes()');
});
