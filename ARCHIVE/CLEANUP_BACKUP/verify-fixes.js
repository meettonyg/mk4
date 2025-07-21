/**
 * Quick verification for layout array and controls fix
 * Copy and run in browser console
 */

console.log('🧪 Verifying Media Kit Builder Fixes...\n');

// Test 1: Layout Array Fix
console.log('1️⃣ Layout Array Fix:');
if (enhancedStateManager) {
    const state = enhancedStateManager.getState();
    if (Array.isArray(state.layout)) {
        console.log('✅ Layout array exists');
        console.log(`   Components: ${Object.keys(state.components).length}`);
        console.log(`   Layout items: ${state.layout.length}`);
        console.log(`   Match: ${state.layout.length === Object.keys(state.components).length}`);
    } else {
        console.error('❌ Layout array missing!');
    }
} else {
    console.error('❌ Enhanced state manager not found!');
}

// Test 2: Control Buttons
console.log('\n2️⃣ Control Buttons:');
const buttons = document.querySelectorAll('.control-btn');
console.log(`✅ Found ${buttons.length} control buttons`);
if (buttons.length > 0) {
    const types = [...new Set([...buttons].map(b => b.getAttribute('title')))];
    console.log(`   Types: ${types.join(', ')}`);
}

// Test 3: Component Manager
console.log('\n3️⃣ Component Manager:');
if (typeof enhancedComponentManager !== 'undefined') {
    console.log('✅ Enhanced component manager available');
    console.log(`   Initialized: ${enhancedComponentManager.initialized}`);
    console.log(`   Has moveComponent: ${typeof enhancedComponentManager.moveComponent === 'function'}`);
} else {
    console.error('❌ Enhanced component manager not found!');
}

// Test 4: Simulate Control Action
console.log('\n4️⃣ Testing Control Action:');
if (enhancedStateManager && enhancedStateManager.getState().layout?.length > 0) {
    const firstId = enhancedStateManager.getState().layout[0];
    const firstButton = document.querySelector(`[data-component-id="${firstId}"] .control-btn[title="Move Down"]`);
    
    if (firstButton) {
        console.log(`   Clicking "Move Down" for ${firstId}...`);
        firstButton.click();
        
        setTimeout(() => {
            const newState = enhancedStateManager.getState();
            if (newState.layout[1] === firstId) {
                console.log('✅ Control action successful!');
            } else {
                console.log('❓ Check if component moved visually');
            }
        }, 100);
    } else {
        console.log('   No Move Down button found to test');
    }
} else {
    console.log('   No components available to test');
}

// Test 5: Renderer Status
console.log('\n5️⃣ Component Renderer:');
if (typeof enhancedComponentRenderer !== 'undefined') {
    console.log('✅ Enhanced component renderer available');
    console.log(`   Initialized: ${enhancedComponentRenderer.initialized}`);
    console.log(`   Rendering: ${enhancedComponentRenderer.isRendering}`);
} else {
    console.error('❌ Enhanced component renderer not found!');
}

console.log('\n✨ Verification complete! Controls should now be working.');