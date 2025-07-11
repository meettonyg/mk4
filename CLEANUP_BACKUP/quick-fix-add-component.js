/**
 * Quick fix to ensure add component and load template work
 * Run this in the console to fix the issue immediately
 */

console.log('🔧 Applying quick fix for Add Component and Load Template...\n');

// Fix 1: Ensure global managers are available
if (!window.componentManager && window.enhancedComponentManager) {
    window.componentManager = window.enhancedComponentManager;
    console.log('✅ Set window.componentManager to enhanced version');
}

if (!window.stateManager && window.enhancedStateManager) {
    window.stateManager = window.enhancedStateManager;
    console.log('✅ Set window.stateManager to enhanced version');
}

if (!window.componentRenderer && window.enhancedComponentRenderer) {
    window.componentRenderer = window.enhancedComponentRenderer;
    console.log('✅ Set window.componentRenderer to enhanced version');
}

// Fix 2: Initialize managers if not initialized
if (window.enhancedComponentManager && !window.enhancedComponentManager.initialized) {
    console.log('Initializing enhanced component manager...');
    window.enhancedComponentManager.init().then(() => {
        console.log('✅ Enhanced component manager initialized');
    });
}

if (window.enhancedComponentRenderer && !window.enhancedComponentRenderer.initialized) {
    console.log('Initializing enhanced component renderer...');
    window.enhancedComponentRenderer.init();
    console.log('✅ Enhanced component renderer initialized');
}

// Fix 3: Test add component button
setTimeout(() => {
    const addBtn = document.getElementById('add-component-btn');
    if (addBtn) {
        console.log('\n📋 Add Component button found. Try clicking it now.');
    } else {
        console.log('\n❌ Add Component button not found');
    }
    
    const loadBtn = document.getElementById('load-template');
    if (loadBtn) {
        console.log('📋 Load Template button found. Try clicking it now.');
    } else {
        console.log('❌ Load Template button not found');
    }
    
    console.log('\n✨ Quick fix applied! Try adding components or loading templates now.');
}, 100);