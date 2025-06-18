/**
 * Test script for localStorage loading after fixes
 * Run this in the browser console after the page loads
 */

// Check for duplicate components
console.log('=== DUPLICATE COMPONENT CHECK ===');
const components = document.querySelectorAll('[data-component-id]');
const componentIds = new Map();

components.forEach(comp => {
    const id = comp.getAttribute('data-component-id');
    if (!componentIds.has(id)) {
        componentIds.set(id, 1);
    } else {
        componentIds.set(id, componentIds.get(id) + 1);
    }
});

let hasDuplicates = false;
componentIds.forEach((count, id) => {
    if (count > 1) {
        console.error(`DUPLICATE FOUND: Component ${id} appears ${count} times`);
        hasDuplicates = true;
    }
});

if (!hasDuplicates) {
    console.log('✅ No duplicate components found');
} else {
    console.log('❌ Duplicate components detected');
}

// Check render state
console.log('\n=== RENDERER STATE ===');
console.log('Skip initial render:', window.componentRenderer?.skipInitialRender);
console.log('Is rendering:', window.componentRenderer?.isRendering);
console.log('Debounce timer active:', !!window.componentRenderer?.renderDebounceTimer);

// Check state vs DOM
console.log('\n=== STATE VS DOM ===');
const state = window.stateManager?.getState();
const stateComponentCount = Object.keys(state?.components || {}).length;
const domComponentCount = components.length;

console.log('Components in state:', stateComponentCount);
console.log('Components in DOM:', domComponentCount);

if (stateComponentCount === domComponentCount) {
    console.log('✅ State and DOM are in sync');
} else {
    console.log('❌ State and DOM mismatch');
}

// Force single render test
console.log('\n=== SINGLE RENDER TEST ===');
console.log('To test a single render, run:');
console.log('window.componentRenderer.skipInitialRender = false;');
console.log('window.componentRenderer.renderWithDiff(window.stateManager.getState());');
