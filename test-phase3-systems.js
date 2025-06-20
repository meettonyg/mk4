/**
 * Phase 3 Systems Validation Test
 * Run this in browser console to validate all Phase 3 systems are working
 * 
 * Usage: Copy and paste this entire script into browser console
 */

console.log('%c🧪 Phase 3 Systems Validation Test', 'font-size: 16px; font-weight: bold; color: #00BCD4');
console.log('=====================================\n');

// Test suite for Phase 3 systems
async function validatePhase3Systems() {
    const results = {
        passed: 0,
        failed: 0,
        total: 0,
        details: []
    };

    function test(name, testFn) {
        results.total++;
        try {
            const result = testFn();
            if (result) {
                results.passed++;
                console.log(`✅ ${name}: PASS`);
                results.details.push({ name, status: 'PASS', result });
            } else {
                results.failed++;
                console.log(`❌ ${name}: FAIL`);
                results.details.push({ name, status: 'FAIL', result });
            }
        } catch (error) {
            results.failed++;
            console.log(`❌ ${name}: ERROR - ${error.message}`);
            results.details.push({ name, status: 'ERROR', error: error.message });
        }
    }

    console.log('🔍 Testing System Availability...\n');

    // Test 1: Enhanced State Manager
    test('Enhanced State Manager', () => {
        const available = !!window.enhancedStateManager;
        const hasGetState = window.enhancedStateManager?.getState;
        const hasAddComponent = window.enhancedStateManager?.addComponent;
        
        if (available && hasGetState && hasAddComponent) {
            const state = window.enhancedStateManager.getState();
            return !!state && typeof state === 'object';
        }
        return false;
    });

    // Test 2: State Validator
    test('State Validator', () => {
        const available = !!window.stateValidator;
        const hasValidateState = window.stateValidator?.validateState;
        const hasGetStats = window.stateValidator?.getStats;
        
        if (available && hasValidateState && hasGetStats) {
            const stats = window.stateValidator.getStats();
            return !!stats && typeof stats.total === 'number';
        }
        return false;
    });

    // Test 3: UI Registry
    test('UI Registry', () => {
        const available = !!window.uiRegistry;
        const hasRegister = window.uiRegistry?.register;
        const hasGetStats = window.uiRegistry?.getStats;
        
        if (available && hasRegister && hasGetStats) {
            const stats = window.uiRegistry.getStats();
            return !!stats && typeof stats.registeredComponents === 'number';
        }
        return false;
    });

    // Test 4: State History
    test('State History', () => {
        const available = !!window.stateHistory;
        const hasUndo = window.stateHistory?.undo;
        const hasRedo = window.stateHistory?.redo;
        const hasGetStats = window.stateHistory?.getStats;
        
        if (available && hasUndo && hasRedo && hasGetStats) {
            const stats = window.stateHistory.getStats();
            return !!stats && typeof stats.totalSnapshots === 'number';
        }
        return false;
    });

    // Test 5: Event Bus
    test('Event Bus', () => {
        const available = !!window.eventBus;
        const hasOn = window.eventBus?.on;
        const hasEmit = window.eventBus?.emit;
        const hasGetStats = window.eventBus?.getStats;
        
        if (available && hasOn && hasEmit && hasGetStats) {
            // Test event system
            let testPassed = false;
            window.eventBus.on('test:phase3-validation', () => {
                testPassed = true;
            });
            window.eventBus.emit('test:phase3-validation', { test: true });
            return testPassed;
        }
        return false;
    });

    // Test 6: Save Service
    test('Save Service', () => {
        const available = !!window.saveService;
        const hasSaveState = window.saveService?.saveState;
        const hasLoadState = window.saveService?.loadState;
        const hasGetStats = window.saveService?.getStats;
        
        if (available && hasSaveState && hasLoadState && hasGetStats) {
            const stats = window.saveService.getStats();
            return !!stats && typeof stats.hasSavedData === 'boolean';
        }
        return false;
    });

    console.log('\n🧪 Testing Functional Integration...\n');

    // Test 7: State Management Integration
    test('State Management Integration', () => {
        if (!window.enhancedStateManager || !window.stateValidator) return false;
        
        try {
            // Test adding a component
            const testComponent = {
                id: 'test-phase3-integration',
                type: 'custom',
                props: { test: true }
            };
            
            // Add component
            window.enhancedStateManager.addComponent(testComponent);
            
            // Check if it was added
            const state = window.enhancedStateManager.getState();
            const componentExists = !!state.components[testComponent.id];
            
            // Clean up
            if (componentExists) {
                window.enhancedStateManager.removeComponent(testComponent.id);
            }
            
            return componentExists;
        } catch (error) {
            console.warn('State management integration test error:', error.message);
            return false;
        }
    });

    // Test 8: Keyboard Shortcuts
    test('Keyboard Shortcuts', () => {
        // Test if keyboard shortcuts are set up
        const hasUndo = window.stateHistory?.canUndo;
        const hasRedo = window.stateHistory?.canRedo;
        
        if (hasUndo && hasRedo) {
            // Check if we can get undo/redo status
            const canUndo = window.stateHistory.canUndo();
            const canRedo = window.stateHistory.canRedo();
            return typeof canUndo === 'boolean' && typeof canRedo === 'boolean';
        }
        return false;
    });

    // Test 9: Performance Monitoring
    test('Performance Monitoring', () => {
        const available = !!window.mkPerf;
        const hasReport = window.mkPerf?.report;
        const hasTrack = window.mkPerf?.track;
        
        if (available && hasReport && hasTrack) {
            // Test tracking
            const startTime = performance.now();
            window.mkPerf.track('phase3-test', startTime, { test: true });
            return true;
        }
        return false;
    });

    // Test 10: Race Condition Prevention
    test('Race Condition Prevention', () => {
        if (!window.enhancedStateManager || !window.uiRegistry) return false;
        
        try {
            // Test batch operations (RACE 4 fix)
            window.enhancedStateManager.startBatchUpdate();
            
            // Add multiple components rapidly
            for (let i = 0; i < 3; i++) {
                window.enhancedStateManager.addComponent({
                    id: `race-test-${i}`,
                    type: 'custom',
                    props: { index: i }
                });
            }
            
            window.enhancedStateManager.endBatchUpdate();
            
            // Check if all components were added
            const state = window.enhancedStateManager.getState();
            const testComponents = Object.keys(state.components).filter(id => 
                id.startsWith('race-test-')
            );
            
            // Clean up
            testComponents.forEach(id => {
                window.enhancedStateManager.removeComponent(id);
            });
            
            return testComponents.length === 3;
        } catch (error) {
            console.warn('Race condition test error:', error.message);
            return false;
        }
    });

    // Display results
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    console.log(`Total Tests: ${results.total}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

    if (results.passed === results.total) {
        console.log('\n🎉 ALL TESTS PASSED! Phase 3 systems are working correctly.');
        
        // Show system stats
        console.log('\n📈 System Statistics:');
        if (window.stateValidator) {
            console.log('State Validator:', window.stateValidator.getStats());
        }
        if (window.uiRegistry) {
            console.log('UI Registry:', window.uiRegistry.getStats());
        }
        if (window.stateHistory) {
            console.log('State History:', window.stateHistory.getStats());
        }
        
    } else {
        console.log('\n⚠️ Some tests failed. Check the details above.');
        console.log('\n🔧 Failed Tests:');
        results.details.filter(d => d.status !== 'PASS').forEach(detail => {
            console.log(`   ${detail.name}: ${detail.status}`);
            if (detail.error) {
                console.log(`      Error: ${detail.error}`);
            }
        });
    }

    // Test keyboard shortcuts info
    console.log('\n⌨️ Keyboard Shortcuts Available:');
    console.log('   Ctrl+Z: Undo');
    console.log('   Ctrl+Y: Redo');
    console.log('   Ctrl+S: Manual Save');

    return results;
}

// Auto-run the test
validatePhase3Systems().then(results => {
    window.phase3TestResults = results;
    console.log('\n💾 Test results saved to window.phase3TestResults');
});
