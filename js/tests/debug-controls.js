/**
 * Debug script for component control buttons
 * Run this in the console to diagnose why controls aren't working
 */

console.log('🔍 Debugging Component Controls...\n');

// Test 1: Check if enhanced component manager is initialized
if (typeof enhancedComponentManager !== 'undefined') {
    console.log('✅ Enhanced component manager found');
    console.log('   Initialized:', enhancedComponentManager.initialized);
} else {
    console.error('❌ Enhanced component manager not found!');
}

// Test 2: Check if control buttons exist
const controlButtons = document.querySelectorAll('.control-btn');
console.log(`\n📊 Found ${controlButtons.length} control buttons`);
if (controlButtons.length > 0) {
    console.log('   First button:', {
        title: controlButtons[0].getAttribute('title'),
        className: controlButtons[0].className,
        hasDataAction: controlButtons[0].hasAttribute('data-action')
    });
}

// Test 3: Check for duplicate event listeners
console.log('\n🎯 Testing click handling...');
let clickHandled = false;

// Temporarily add a test listener
const testHandler = (e) => {
    const button = e.target.closest('.control-btn');
    if (button) {
        clickHandled = true;
        console.log('✅ Click detected on control button:', button.getAttribute('title'));
        const componentId = button.closest('[data-component-id]')?.dataset.componentId;
        console.log('   Component ID:', componentId);
        
        // Check if the enhanced state manager has the moveComponent method
        if (enhancedStateManager && enhancedStateManager.moveComponent) {
            console.log('✅ enhancedStateManager.moveComponent exists');
        } else {
            console.error('❌ enhancedStateManager.moveComponent missing!');
        }
    }
};

document.body.addEventListener('click', testHandler, true);

// Test 4: Simulate a button click
if (controlButtons.length > 0) {
    console.log('\n🖱️ Simulating click on first control button...');
    controlButtons[0].click();
    
    setTimeout(() => {
        if (!clickHandled) {
            console.error('❌ Click was not handled!');
        }
        document.body.removeEventListener('click', testHandler, true);
    }, 100);
}

// Test 5: Check state manager
console.log('\n📦 Checking state manager...');
if (typeof enhancedStateManager !== 'undefined') {
    const state = enhancedStateManager.getState();
    console.log('✅ State manager accessible');
    console.log('   Layout exists:', Array.isArray(state.layout));
    console.log('   Layout length:', state.layout?.length || 0);
    console.log('   Components:', Object.keys(state.components || {}).length);
    
    // Test moveComponent method
    if (state.layout && state.layout.length > 1) {
        console.log('\n🔄 Testing moveComponent...');
        const firstId = state.layout[0];
        console.log(`   Moving ${firstId} down...`);
        
        try {
            enhancedStateManager.moveComponent(firstId, 'down');
            const newState = enhancedStateManager.getState();
            if (newState.layout[1] === firstId) {
                console.log('✅ Move successful!');
            } else {
                console.log('❌ Move failed - component didn\'t move');
            }
        } catch (error) {
            console.error('❌ Error during move:', error);
        }
    }
}

console.log('\n✨ Control button debugging complete!');