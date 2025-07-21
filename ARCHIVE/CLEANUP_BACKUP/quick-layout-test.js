/**
 * Quick console test for layout array fix
 * Run this in the browser console to verify the fix is working
 */

console.log('🔧 Testing Layout Array Fix...\n');

// Test 1: Check if state manager exists
if (typeof enhancedStateManager === 'undefined') {
    console.error('❌ Enhanced state manager not found. Make sure the page has loaded.');
} else {
    console.log('✅ Enhanced state manager found');
    
    // Test 2: Get current state and check layout
    const currentState = enhancedStateManager.getState();
    if (Array.isArray(currentState.layout)) {
        console.log(`✅ Layout array exists with ${currentState.layout.length} components`);
        console.log('   Layout:', currentState.layout);
    } else {
        console.error('❌ Layout array missing from state');
    }
    
    // Test 3: Test loading state without layout
    console.log('\n📋 Testing backward compatibility...');
    const testState = {
        version: '1.0.0',
        metadata: { title: 'Test' },
        components: [
            { id: 'test-hero', type: 'hero', order: 0, data: { title: 'Test Hero' } }
        ]
        // Note: No layout array
    };
    
    try {
        enhancedStateManager.loadSerializedState(testState);
        const newState = enhancedStateManager.getState();
        
        if (Array.isArray(newState.layout) && newState.layout.includes('test-hero')) {
            console.log('✅ Layout array created automatically from old state format');
        } else {
            console.error('❌ Failed to create layout array from old state');
        }
    } catch (error) {
        console.error('❌ Error loading state:', error);
    }
    
    // Test 4: Check renderer resilience
    console.log('\n🛡️ Testing renderer resilience...');
    if (typeof enhancedComponentRenderer !== 'undefined') {
        try {
            // This should not crash
            enhancedComponentRenderer.reorderComponents(undefined);
            console.log('✅ Renderer handles undefined layout gracefully');
        } catch (error) {
            console.error('❌ Renderer crashed with undefined layout:', error);
        }
    } else {
        console.warn('⚠️ Enhanced component renderer not found');
    }
    
    console.log('\n✨ Layout array fix verification complete!');
}