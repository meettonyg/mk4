/**
 * Test script to verify root fixes are working correctly
 * Run this in the browser console after the page loads
 */

(async function testRootFixes() {
    console.log('=== Testing Media Kit Builder Root Fixes ===');
    
    // Test 1: Check initialization
    console.log('\n1. Testing Initialization:');
    console.log('- Single initialization:', window.mediaKitBuilderInitialized === true);
    console.log('- Enhanced systems loaded:', 
        window.enhancedStateManager !== undefined,
        window.enhancedComponentManager !== undefined,
        window.enhancedComponentRenderer !== undefined
    );
    
    // Test 2: Check localized data
    console.log('\n2. Testing PHP Data Localization:');
    console.log('- Component schemas available:', 
        window.guestifyData?.componentSchemas !== undefined);
    console.log('- Number of schemas:', 
        Object.keys(window.guestifyData?.componentSchemas || {}).length);
    
    // Test 3: Test batch updates
    console.log('\n3. Testing Batch Updates:');
    let renderCount = 0;
    const unsubscribe = window.stateManager.subscribeGlobal(() => {
        renderCount++;
    });
    
    await window.stateManager.batchUpdate(async () => {
        // Multiple operations that should trigger only one render
        const id1 = `test-${Date.now()}-1`;
        const id2 = `test-${Date.now()}-2`;
        
        window.stateManager.initComponent(id1, 'hero', { title: 'Test 1' }, true);
        window.stateManager.initComponent(id2, 'hero', { title: 'Test 2' }, true);
        window.stateManager.updateComponent(id1, 'title', 'Updated Test 1');
        window.stateManager.removeComponent(id2);
    });
    
    // Wait for any debounced renders
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log(`- Batch update render count: ${renderCount} (should be 1)`);
    unsubscribe();
    
    // Test 4: Test pending actions
    console.log('\n4. Testing Pending Actions:');
    const testComponentId = 'test-pending-' + Date.now();
    window.stateManager.initComponent(testComponentId, 'hero', { title: 'Pending Test' });
    
    // Try to delete twice quickly
    const deletePromises = [
        window.componentManager.handleControlAction('delete', testComponentId),
        window.componentManager.handleControlAction('delete', testComponentId)
    ];
    
    // Cancel the confirm dialog
    window.confirm = () => false;
    
    await Promise.all(deletePromises);
    
    console.log('- Component still exists after double delete attempt:', 
        window.stateManager.getComponent(testComponentId) !== null);
    
    // Cleanup
    window.stateManager.removeComponent(testComponentId);
    
    // Test 5: Test render debouncing
    console.log('\n5. Testing Render Debouncing:');
    let renderStartCount = 0;
    const originalProcessChanges = window.componentRenderer.processChanges;
    window.componentRenderer.processChanges = function(...args) {
        renderStartCount++;
        return originalProcessChanges.apply(this, args);
    };
    
    // Rapid state changes
    for (let i = 0; i < 5; i++) {
        const id = `debounce-test-${i}`;
        window.stateManager.initComponent(id, 'hero', { title: `Test ${i}` });
    }
    
    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log(`- Rapid changes resulted in ${renderStartCount} renders (should be 1)`);
    
    // Restore original function
    window.componentRenderer.processChanges = originalProcessChanges;
    
    // Test 6: Component duplication
    console.log('\n6. Testing Component Duplication:');
    const sourceId = 'source-' + Date.now();
    window.stateManager.initComponent(sourceId, 'hero', { 
        title: 'Original', 
        subtitle: 'To be duplicated' 
    });
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const newId = await window.componentManager.duplicateComponent(sourceId);
    const duplicate = window.stateManager.getComponent(newId);
    
    console.log('- Duplication successful:', duplicate !== null);
    console.log('- Data copied correctly:', 
        duplicate?.data?.title === 'Original' && 
        duplicate?.data?.subtitle === 'To be duplicated'
    );
    
    // Cleanup
    window.stateManager.removeComponent(sourceId);
    window.stateManager.removeComponent(newId);
    
    console.log('\n=== All Root Fix Tests Complete ===');
    
    // Test 7: Check feature flags
    console.log('\n7. Feature Flags Status:');
    Object.entries(window.mediaKitFeatures.FEATURES).forEach(([key, value]) => {
        console.log(`- ${key}: ${value}`);
    });
    
})();