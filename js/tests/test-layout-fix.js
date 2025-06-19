/**
 * Test script to verify layout array fix
 * Tests that state loading from localStorage doesn't crash due to missing layout
 */

console.log('🧪 Testing Layout Array Fix...\n');

// Test function
async function testLayoutFix() {
    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };
    
    function test(name, fn) {
        try {
            fn();
            results.passed++;
            results.tests.push({ name, status: '✅ PASSED' });
            console.log(`✅ ${name}`);
        } catch (error) {
            results.failed++;
            results.tests.push({ name, status: '❌ FAILED', error: error.message });
            console.error(`❌ ${name}:`, error.message);
        }
    }
    
    // Access the enhanced state manager
    const { enhancedStateManager } = await import('../core/enhanced-state-manager.js');
    const { enhancedComponentRenderer } = await import('../core/enhanced-component-renderer.js');
    
    // Test 1: Load state without layout array
    test('State loads without layout array', () => {
        const oldState = {
            version: '1.0.0',
            metadata: { title: 'Test Kit' },
            components: [
                { id: 'hero-123', type: 'hero', order: 0, data: { title: 'Test' } },
                { id: 'bio-456', type: 'biography', order: 1, data: { content: 'Bio' } }
            ]
        };
        
        enhancedStateManager.loadSerializedState(oldState);
        const state = enhancedStateManager.getState();
        
        if (!Array.isArray(state.layout)) {
            throw new Error('Layout array not created');
        }
        
        if (state.layout.length !== 2) {
            throw new Error(`Layout should have 2 items, got ${state.layout.length}`);
        }
        
        if (state.layout[0] !== 'hero-123' || state.layout[1] !== 'bio-456') {
            throw new Error('Layout order incorrect');
        }
    });
    
    // Test 2: State with existing layout preserved
    test('Existing layout array is preserved', () => {
        const stateWithLayout = {
            version: '1.0.0',
            metadata: { title: 'Test Kit' },
            components: [
                { id: 'hero-123', type: 'hero', order: 0, data: { title: 'Test' } },
                { id: 'bio-456', type: 'biography', order: 1, data: { content: 'Bio' } }
            ],
            layout: ['bio-456', 'hero-123'] // Different order
        };
        
        enhancedStateManager.loadSerializedState(stateWithLayout);
        const state = enhancedStateManager.getState();
        
        if (state.layout[0] !== 'bio-456' || state.layout[1] !== 'hero-123') {
            throw new Error('Existing layout not preserved');
        }
    });
    
    // Test 3: Renderer doesn't crash with undefined layout
    test('Renderer handles undefined layout gracefully', () => {
        // This should not throw
        enhancedComponentRenderer.reorderComponents(undefined);
        enhancedComponentRenderer.reorderComponents(null);
        enhancedComponentRenderer.reorderComponents([]);
    });
    
    // Test 4: Layout maintained during component operations
    test('Layout maintained when adding components', async () => {
        enhancedStateManager.clearState();
        
        // Add first component
        await enhancedStateManager.addComponent('test-1', 'hero', { title: 'Test 1' });
        let state = enhancedStateManager.getState();
        
        if (!state.layout || state.layout.length !== 1) {
            throw new Error('Layout not updated after adding component');
        }
        
        // Add second component
        await enhancedStateManager.addComponent('test-2', 'biography', { content: 'Test 2' });
        state = enhancedStateManager.getState();
        
        if (state.layout.length !== 2) {
            throw new Error('Layout not updated after adding second component');
        }
    });
    
    // Test 5: Layout maintained during remove operations
    test('Layout maintained when removing components', () => {
        // Remove first component
        enhancedStateManager.removeComponent('test-1');
        const state = enhancedStateManager.getState();
        
        if (state.layout.length !== 1 || state.layout[0] !== 'test-2') {
            throw new Error('Layout not updated after removing component');
        }
    });
    
    // Test 6: Serialized state includes layout
    test('Serialized state includes layout array', () => {
        const serialized = enhancedStateManager.getSerializableState();
        
        if (!Array.isArray(serialized.layout)) {
            throw new Error('Serialized state missing layout array');
        }
    });
    
    // Summary
    console.log('\n📊 Test Results:');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
    
    if (results.failed > 0) {
        console.log('\n❌ Failed Tests:');
        results.tests.filter(t => t.status.includes('FAILED')).forEach(t => {
            console.log(`  - ${t.name}: ${t.error}`);
        });
    }
    
    return results.failed === 0;
}

// Run tests
testLayoutFix().then(success => {
    if (success) {
        console.log('\n🎉 All layout tests passed! The fix is working correctly.');
    } else {
        console.log('\n⚠️ Some tests failed. Please check the implementation.');
    }
});

// Export for use in other scripts
window.testLayoutFix = testLayoutFix;