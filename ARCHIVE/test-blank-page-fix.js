/**
 * Test script to verify the blank page fix
 * Run this after clearing cache and reloading
 */

console.clear();
console.log("🔧 TESTING BLANK PAGE FIX");
console.log("==========================\n");

// 1. Check state structure
console.log("1️⃣ STATE STRUCTURE CHECK:");
const state = window.stateManager?.getState();
if (state) {
    console.log("  ✓ State exists");
    console.log("  ✓ Components object:", !!state.components);
    console.log("  ✓ Number of components:", Object.keys(state.components || {}).length);
    
    // Show component details
    if (state.components) {
        Object.entries(state.components).forEach(([id, comp]) => {
            console.log(`    - ${id}: type=${comp.type}, order=${comp.order}`);
        });
    }
} else {
    console.log("  ❌ State not available");
}

// 2. Test adding a component
console.log("\n2️⃣ COMPONENT ADDITION TEST:");
console.log("  Adding test component...");

const testComponent = {
    id: `test-hero-${Date.now()}`,
    type: 'hero',
    order: 0,
    data: {
        name: 'Test Fix Component',
        title: 'Testing the Fix',
        bio: 'If you see this, the fix is working!'
    }
};

// Use state manager's proper method
window.stateManager.initComponent(testComponent.id, testComponent.type, testComponent.data);

// Wait and check
setTimeout(() => {
    const newState = window.stateManager.getState();
    const componentInState = newState.components[testComponent.id];
    const componentInDOM = document.querySelector(`[data-component-id="${testComponent.id}"]`);
    
    console.log("\n3️⃣ VERIFICATION:");
    console.log("  ✓ Component in state:", !!componentInState);
    console.log("  ✓ Component in DOM:", !!componentInDOM);
    console.log("  ✓ Preview visible:", !document.getElementById('empty-state')?.style.display || document.getElementById('empty-state')?.style.display === 'none');
    
    if (componentInState && componentInDOM) {
        console.log("\n✅ SUCCESS: Blank page issue is fixed!");
        console.log("Components are now properly rendered from the new state structure.");
        
        // Clean up test component
        window.stateManager.removeComponent(testComponent.id);
        console.log("🧹 Test component removed");
    } else {
        console.log("\n❌ ISSUE PERSISTS");
        console.log("Check the console for errors above.");
    }
}, 1000);

// 4. Check renderer's getSortedComponents
console.log("\n4️⃣ RENDERER METHOD CHECK:");
const renderer = window.componentRenderer;
if (renderer && renderer.getSortedComponents) {
    const components = renderer.getSortedComponents(state);
    console.log("  ✓ getSortedComponents returns:", components.length, "components");
} else {
    console.log("  ❌ Renderer or method not available");
}

console.log("\n💡 If the page is still blank:");
console.log("  1. Hard refresh (Ctrl+F5)");
console.log("  2. Clear ALL browser data for this site");
console.log("  3. Check for JavaScript errors in console");
