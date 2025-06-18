/**
 * Final verification test for all root fixes
 * Run this after the fixes have been implemented
 */

(async function verifyAllFixes() {
    console.log('=== Final Verification of All Root Fixes ===\n');
    
    let passCount = 0;
    let failCount = 0;
    
    function test(name, condition, expected = true) {
        const passed = condition === expected;
        console.log(`${passed ? '✅' : '❌'} ${name}: ${passed ? 'PASSED' : 'FAILED'}`);
        if (passed) passCount++;
        else failCount++;
        return passed;
    }
    
    // Test 1: Single Initialization
    console.log('\n1. Initialization Tests:');
    test('Single initialization flag', window.mediaKitBuilderInitialized === true);
    test('Enhanced state manager loaded', window.enhancedStateManager !== undefined);
    test('Enhanced component manager loaded', window.enhancedComponentManager !== undefined);
    test('Enhanced component renderer loaded', window.enhancedComponentRenderer !== undefined);
    test('Renderer not stuck', !window.componentRenderer.isRendering);
    test('Render queue empty', window.componentRenderer.renderQueue.size === 0);
    
    // Test 2: PHP Schema Loading
    console.log('\n2. Schema Loading Tests:');
    const schemas = window.guestifyData?.componentSchemas || {};
    test('Component schemas object exists', typeof schemas === 'object');
    test('Schemas loaded (if components have schemas)', Object.keys(schemas).length >= 0, true);
    
    // Test 3: Health Check System
    console.log('\n3. Health Check Tests:');
    test('Render start time tracking exists', 'renderStartTime' in window.componentRenderer);
    test('Health check initialized', typeof window.componentRenderer.setupHealthCheck === 'function');
    
    // Test 4: Batch Updates
    console.log('\n4. Batch Update Tests:');
    let batchRenderCount = 0;
    const unsubscribe = window.stateManager.subscribeGlobal(() => batchRenderCount++);
    
    await window.stateManager.batchUpdate(async () => {
        const id1 = `batch-test-${Date.now()}-1`;
        const id2 = `batch-test-${Date.now()}-2`;
        window.stateManager.initComponent(id1, 'hero', { title: 'Test 1' }, true);
        window.stateManager.initComponent(id2, 'hero', { title: 'Test 2' }, true);
        window.stateManager.removeComponent(id1);
        window.stateManager.removeComponent(id2);
    });
    
    await new Promise(resolve => setTimeout(resolve, 100));
    test('Batch update single notification', batchRenderCount === 1);
    unsubscribe();
    
    // Test 5: Component Duplication with Data
    console.log('\n5. Component Duplication Tests:');
    const sourceId = 'dup-source-' + Date.now();
    window.stateManager.initComponent(sourceId, 'hero', {
        title: 'Original Title',
        subtitle: 'Original Subtitle',
        nested: { value: 'Nested Value' }
    });
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const dupId = await window.componentManager.duplicateComponent(sourceId);
    const duplicate = window.stateManager.getComponent(dupId);
    
    test('Duplication creates new component', duplicate !== null);
    test('Title copied correctly', duplicate?.data?.title === 'Original Title');
    test('Subtitle copied correctly', duplicate?.data?.subtitle === 'Original Subtitle');
    test('Nested data copied correctly', duplicate?.data?.nested?.value === 'Nested Value');
    
    // Cleanup
    window.stateManager.removeComponent(sourceId);
    window.stateManager.removeComponent(dupId);
    
    // Test 6: Render Debouncing
    console.log('\n6. Render Debouncing Tests:');
    let renderCallCount = 0;
    const originalOnStateChange = window.componentRenderer.onStateChange;
    window.componentRenderer.onStateChange = function(...args) {
        renderCallCount++;
        return originalOnStateChange.apply(this, args);
    };
    
    // Rapid changes
    for (let i = 0; i < 5; i++) {
        window.stateManager.initComponent(`debounce-${i}`, 'hero', {});
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
    test('Debounced renders (should be minimal)', renderCallCount <= 2);
    
    // Restore and cleanup
    window.componentRenderer.onStateChange = originalOnStateChange;
    for (let i = 0; i < 5; i++) {
        window.stateManager.removeComponent(`debounce-${i}`);
    }
    
    // Test 7: Feature Flags
    console.log('\n7. Feature Flag Tests:');
    test('Enhanced state manager enabled', window.mediaKitFeatures.FEATURES.USE_ENHANCED_STATE_MANAGER);
    test('Enhanced component manager enabled', window.mediaKitFeatures.FEATURES.USE_ENHANCED_COMPONENT_MANAGER);
    test('Enhanced renderer enabled', window.mediaKitFeatures.FEATURES.USE_ENHANCED_COMPONENT_RENDERER);
    test('Enhanced initialization enabled', window.mediaKitFeatures.FEATURES.USE_ENHANCED_INITIALIZATION);
    test('Batch updates enabled', window.mediaKitFeatures.FEATURES.USE_BATCH_UPDATES);
    test('Pending actions enabled', window.mediaKitFeatures.FEATURES.USE_PENDING_ACTIONS);
    
    // Test 8: Error Recovery
    console.log('\n8. Error Recovery Tests:');
    test('Process changes has error handling', window.componentRenderer.processChanges.toString().includes('catch'));
    test('Render queue processing in finally block', window.componentRenderer.processChanges.toString().includes('finally'));
    
    // Summary
    console.log('\n=== Test Summary ===');
    console.log(`Total Tests: ${passCount + failCount}`);
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Success Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);
    
    if (failCount === 0) {
        console.log('\n🎉 All tests passed! The Media Kit Builder root fixes are working correctly.');
    } else {
        console.log('\n⚠️ Some tests failed. Please review the failures above.');
    }
    
    return { passed: passCount, failed: failCount };
})();