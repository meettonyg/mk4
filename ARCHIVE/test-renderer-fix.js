/**
 * Test script to verify the component renderer fix
 * Run this in the browser console after page load
 */

console.clear();
console.log("=== Testing Component Renderer Fix ===");

// 1. Check if core objects exist
console.log("\n1. Core Objects Check:");
console.log("  - window.stateManager:", !!window.stateManager);
console.log("  - window.componentRenderer:", !!window.componentRenderer);
console.log("  - componentRenderer.initialized:", window.componentRenderer?.initialized);

// 2. Check if empty state buttons have listeners
console.log("\n2. Empty State Button Check:");
const addBtn = document.getElementById('add-first-component');
const loadBtn = document.getElementById('load-template');

console.log("  - Add Component button exists:", !!addBtn);
console.log("  - Add Component listener attached:", addBtn?.hasAttribute('data-listener-attached'));
console.log("  - Load Template button exists:", !!loadBtn);
console.log("  - Load Template listener attached:", loadBtn?.hasAttribute('data-listener-attached'));

// 3. Test adding a component programmatically
console.log("\n3. Testing Component Addition:");
if (window.stateManager) {
    const testComponent = {
        id: `hero-${Date.now()}`,
        type: 'hero',
        order: 0,
        data: {
            name: 'Test Hero Component',
            title: 'Test Title',
            bio: 'This is a test component'
        }
    };
    
    console.log("  - Adding test component to state...");
    window.stateManager.addComponent('hero', testComponent);
    
    setTimeout(() => {
        const renderedComponent = document.querySelector(`[data-component-id="${testComponent.id}"]`);
        console.log("  - Component rendered in DOM:", !!renderedComponent);
        
        if (renderedComponent) {
            console.log("  ✅ SUCCESS: Component system is working!");
        } else {
            console.log("  ❌ FAILED: Component was not rendered");
        }
    }, 1000);
}

// 4. Check localStorage data
console.log("\n4. Checking Saved Data:");
const savedData = localStorage.getItem('mediaKitData');
if (savedData) {
    try {
        const parsed = JSON.parse(savedData);
        console.log("  - Saved components found:");
        if (parsed.hero) console.log("    - Hero component");
        if (parsed.sections?.length > 0) console.log(`    - ${parsed.sections.length} sections`);
        if (parsed.cta) console.log("    - CTA component");
    } catch (e) {
        console.log("  - Error parsing saved data:", e.message);
    }
} else {
    console.log("  - No saved data in localStorage");
}

console.log("\n=== Test Complete ===");
console.log("If you see listener attached = true and component renders, the fix is working!");
