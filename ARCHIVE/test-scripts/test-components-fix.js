/**
 * Quick test to verify the components array fix
 * Run this in the browser console
 */

// Check and fix components array issue
(() => {
    console.log('=== Testing Components Fix ===');
    
    // Check if state manager exists
    const sm = window.stateManager || window.gmkbStateManager;
    if (!sm) {
        console.error('❌ State manager not found! Wait for page to load.');
        return;
    }
    
    // Get current state
    const state = sm.getState();
    
    // Check components type
    console.log('1. Checking components type...');
    const isArray = Array.isArray(state.components);
    const isObject = typeof state.components === 'object' && !isArray;
    
    if (isArray) {
        console.error('❌ Components is an ARRAY - This is WRONG!');
        console.log('   Attempting to fix...');
        
        // Fix it
        sm.setState({
            ...state,
            components: {}
        });
        
        // Check again
        const newState = sm.getState();
        if (!Array.isArray(newState.components)) {
            console.log('✅ Fixed! Components is now an object.');
        } else {
            console.error('❌ Fix failed. Manual intervention needed.');
        }
    } else if (isObject) {
        console.log('✅ Components is an OBJECT - Correct!');
    } else {
        console.error('❌ Components is neither array nor object:', typeof state.components);
    }
    
    // Test adding a component
    console.log('\n2. Testing component addition...');
    const testId = `test_${Date.now()}`;
    
    sm.addComponent({
        id: testId,
        type: 'test',
        props: { title: 'Test Component' }
    });
    
    // Check if it was added
    const updatedState = sm.getState();
    if (updatedState.components[testId]) {
        console.log('✅ Component added successfully!');
        console.log('   Component ID:', testId);
        console.log('   Total components:', Object.keys(updatedState.components).length);
        
        // Clean up test component
        sm.removeComponent(testId);
        console.log('   Test component removed.');
    } else {
        console.error('❌ Failed to add component!');
        console.log('   Components object:', updatedState.components);
    }
    
    // Summary
    console.log('\n=== Summary ===');
    const finalState = sm.getState();
    console.log('Components type:', Array.isArray(finalState.components) ? 'Array ❌' : 'Object ✅');
    console.log('Component count:', Object.keys(finalState.components || {}).length);
    console.log('Can add components:', updatedState.components[testId] ? 'Yes ✅' : 'No ❌');
    
    console.log('\n💡 If issues persist, run: npm run build && refresh page');
})();
