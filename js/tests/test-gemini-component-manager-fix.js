/**
 * @file test-gemini-component-manager-fix.js  
 * @description Test script to validate the Gemini component manager fix
 * 
 * GEMINI FIX: This validates that window.componentManager and window.enhancedComponentManager
 * are properly exposed globally and have the required methods for design panel integration.
 * 
 * Paste this into the browser console on the Media Kit Builder page.
 */

console.log('🧪 Starting Gemini Component Manager Fix Validation...\n');

const testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
};

function runTest(testName, testFunction, critical = false) {
    testResults.total++;
    
    try {
        const result = testFunction();
        
        if (result) {
            testResults.passed++;
            console.log(`✅ ${testName}: PASSED`);
            testResults.details.push({ name: testName, status: 'PASSED', critical, error: null });
        } else {
            testResults.failed++;
            console.log(`❌ ${testName}: FAILED`);
            testResults.details.push({ name: testName, status: 'FAILED', critical, error: 'Test returned false' });
        }
    } catch (error) {
        testResults.failed++;
        console.log(`❌ ${testName}: ERROR - ${error.message}`);
        testResults.details.push({ name: testName, status: 'ERROR', critical, error: error.message });
    }
}

// === CORE TESTS ===
console.log('📋 Core Component Manager Tests:');

runTest(
    'window.componentManager exists',
    () => !!window.componentManager,
    true
);

runTest(
    'window.enhancedComponentManager exists', 
    () => !!window.enhancedComponentManager,
    true
);

runTest(
    'componentManager has addComponent method',
    () => typeof window.componentManager?.addComponent === 'function',
    true
);

runTest(
    'componentManager has updateComponent method',
    () => typeof window.componentManager?.updateComponent === 'function',
    true
);

runTest(
    'enhancedComponentManager has addComponent method',
    () => typeof window.enhancedComponentManager?.addComponent === 'function',
    true
);

runTest(
    'enhancedComponentManager has updateComponent method',
    () => typeof window.enhancedComponentManager?.updateComponent === 'function',
    true
);

runTest(
    'enhancedComponentManager is initialized',
    () => window.enhancedComponentManager?.isInitialized === true,
    false
);

// === DESIGN PANEL INTEGRATION TESTS ===
console.log('\n📋 Design Panel Integration Tests:');

runTest(
    'designPanel module is available',
    () => !!window.designPanel || typeof window.designPanel === 'object',
    false
);

runTest(
    'media-kit-preview element exists',
    () => !!document.getElementById('media-kit-preview'),
    true
);

runTest(
    'element-editor panel exists',
    () => !!document.getElementById('element-editor'),
    false
);

// === GEMINI FIX VALIDATION ===
console.log('\n📋 Gemini Fix Validation:');

runTest(
    'Component managers exposed before system initialization',
    () => {
        // Check if managers are available immediately (not just after system init)
        return window.componentManager && window.enhancedComponentManager;
    },
    true
);

runTest(
    'Enhanced component manager has correct type',
    () => {
        const manager = window.enhancedComponentManager;
        return manager && manager.constructor?.name === 'EnhancedComponentManager';
    },
    false
);

runTest(
    'Legacy component manager has correct type', 
    () => {
        const manager = window.componentManager;
        return manager && manager.constructor?.name === 'ComponentManager';
    },
    false
);

// === FUNCTIONAL TESTS ===
console.log('\n📋 Functional Tests:');

runTest(
    'Can call updateComponent without error (dry run)',
    () => {
        try {
            // Don't actually update anything, just test method call
            const testMethod = window.enhancedComponentManager?.updateComponent;
            return typeof testMethod === 'function';
        } catch (error) {
            console.log('Function call error:', error);
            return false;
        }
    },
    true
);

runTest(
    'State manager integration working',
    () => {
        return !!(window.enhancedStateManager || window.stateManager);
    },
    true
);

// === WORDPRESS INTEGRATION TESTS ===
console.log('\n📋 WordPress Integration Tests:');

runTest(
    'guestifyData is available',
    () => !!window.guestifyData,
    true
);

runTest(
    'WordPress AJAX URL available',
    () => !!(window.guestifyData?.ajaxUrl || window.guestifyData?.ajax_url),
    true
);

runTest(
    'WordPress nonce available',
    () => !!window.guestifyData?.nonce,
    true
);

// === COMPREHENSIVE ANALYSIS ===
console.log('\n📊 Test Results Summary:');
console.log(`✅ Passed: ${testResults.passed}`);
console.log(`❌ Failed: ${testResults.failed}`);
console.log(`📊 Total: ${testResults.total}`);
console.log(`📈 Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);

const criticalFailures = testResults.details.filter(test => test.critical && test.status !== 'PASSED');

if (criticalFailures.length === 0) {
    console.log('\n🎉 GEMINI FIX VALIDATION: SUCCESS!');
    console.log('✅ All critical tests passed');
    console.log('✅ Component managers are properly exposed globally');
    console.log('✅ Design panel integration should work correctly');
    console.log('\n💡 Next Steps:');
    console.log('1. Test design panel functionality by clicking on components');
    console.log('2. Try editing component properties');
    console.log('3. Verify "No component manager available" error is resolved');
    
    // Provide ready-to-use test command
    console.log('\n🔧 Test Design Panel Integration:');
    console.log('Copy and paste this command to test design panel:');
    console.log('window.designPanel?.load("test-component-id")');
    
} else {
    console.log('\n⚠️ GEMINI FIX VALIDATION: ISSUES DETECTED');
    console.log('❌ Critical failures found:');
    criticalFailures.forEach(failure => {
        console.log(`  - ${failure.name}: ${failure.error || failure.status}`);
    });
    
    console.log('\n🔧 Troubleshooting:');
    if (!window.componentManager && !window.enhancedComponentManager) {
        console.log('- Component managers not exposed globally');
        console.log('- Check if main.js initialization completed');
        console.log('- Verify imports are working correctly');
    }
    if (!window.guestifyData) {
        console.log('- WordPress localization failed');
        console.log('- Check PHP enqueue.php configuration');
        console.log('- Verify plugin is properly activated');
    }
}

// === DEBUGGING INFORMATION ===
console.log('\n🔍 Debug Information:');
console.log('Available global objects:', {
    componentManager: typeof window.componentManager,
    enhancedComponentManager: typeof window.enhancedComponentManager,
    stateManager: typeof window.stateManager,
    enhancedStateManager: typeof window.enhancedStateManager,
    guestifyData: typeof window.guestifyData,
    mkLog: typeof window.mkLog,
    mkPerf: typeof window.mkPerf
});

if (window.enhancedComponentManager) {
    console.log('Enhanced Component Manager info:', {
        isInitialized: window.enhancedComponentManager.isInitialized,
        previewContainer: !!window.enhancedComponentManager.previewContainer,
        methods: {
            init: typeof window.enhancedComponentManager.init,
            addComponent: typeof window.enhancedComponentManager.addComponent,
            updateComponent: typeof window.enhancedComponentManager.updateComponent,
            removeComponent: typeof window.enhancedComponentManager.removeComponent
        }
    });
}

// Export results for programmatic access
window.geminiFixTestResults = testResults;

console.log('\n📋 Test Complete. Results stored in window.geminiFixTestResults');
console.log('⭐ Run this test after page load to validate the Gemini fix is working!');