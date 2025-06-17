/**
 * Debug script for localStorage loading issue
 * Run this in the browser console to diagnose the problem
 */

// Check localStorage data
console.log('=== LOCALSTORAGE DEBUG ===');
const savedData = localStorage.getItem('mediaKitData');
if (savedData) {
    const data = JSON.parse(savedData);
    console.log('Saved components:', Object.keys(data.components || {}).length);
    console.log('Component IDs:', Object.keys(data.components || {}));
} else {
    console.log('No saved data in localStorage');
}

// Check managers
console.log('\n=== MANAGER STATUS ===');
console.log('StateManager available:', !!window.stateManager);
console.log('ComponentManager available:', !!window.componentManager);
console.log('ComponentManager initialized:', window.componentManager?.initialized);
console.log('ComponentRenderer available:', !!window.componentRenderer);
console.log('ComponentRenderer initialized:', window.componentRenderer?.initialized);

// Check current state
if (window.stateManager) {
    const state = window.stateManager.getState();
    console.log('\n=== CURRENT STATE ===');
    console.log('Components in state:', Object.keys(state.components || {}).length);
    console.log('Component IDs in state:', Object.keys(state.components || {}));
}

// Check DOM
console.log('\n=== DOM STATUS ===');
const domComponents = document.querySelectorAll('[data-component-id]');
console.log('Components in DOM:', domComponents.length);
domComponents.forEach(comp => {
    console.log('- Component:', comp.getAttribute('data-component-id'), 'Type:', comp.getAttribute('data-component-type'));
});

// Check renderer status
if (window.componentRenderer) {
    console.log('\n=== RENDERER STATUS ===');
    console.log('Skip initial render:', window.componentRenderer.skipInitialRender);
    console.log('Is rendering:', window.componentRenderer.isRendering);
    console.log('Preview container:', !!window.componentRenderer.previewContainer);
}

// Force render test
console.log('\n=== FORCE RENDER TEST ===');
console.log('To force render from localStorage, run:');
console.log('window.componentRenderer.skipInitialRender = false;');
console.log('window.componentRenderer.onStateChange(window.stateManager.getState());');
