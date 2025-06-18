/**
 * Test script to verify component controls are working
 * Run this after the fixes to test control buttons
 */

console.clear();
console.log("🎮 TESTING COMPONENT CONTROLS");
console.log("=============================\n");

// 1. Check if component manager is available
console.log("1️⃣ COMPONENT MANAGER CHECK:");
console.log("  ✓ componentManager exists:", !!window.componentManager);
console.log("  ✓ handleControlAction exists:", !!(window.componentManager?.handleControlAction));

// 2. Check existing components
console.log("\n2️⃣ EXISTING COMPONENTS:");
const components = document.querySelectorAll('[data-component-id]');
console.log("  ✓ Found components:", components.length);

components.forEach((comp, index) => {
    const id = comp.getAttribute('data-component-id');
    const buttons = comp.querySelectorAll('.control-btn');
    console.log(`\n  Component ${index + 1} (${id}):`);
    console.log(`    - Control buttons found: ${buttons.length}`);
    
    // Check if buttons have click handlers
    buttons.forEach(btn => {
        const hasListener = btn.onclick !== null || btn._listeners;
        console.log(`    - Button "${btn.textContent.trim()}": ${hasListener ? 'Has listener' : 'No listener'}`);
    });
});

// 3. Test adding a component and checking its controls
console.log("\n3️⃣ TESTING NEW COMPONENT CONTROLS:");
console.log("  Adding test component...");

const testId = `test-controls-${Date.now()}`;
window.stateManager.initComponent(testId, 'hero', {
    name: 'Control Test Component',
    title: 'Testing Controls',
    bio: 'Testing control buttons'
});

// Wait for render and check
setTimeout(() => {
    const testComponent = document.querySelector(`[data-component-id="${testId}"]`);
    if (testComponent) {
        console.log("  ✅ Test component rendered");
        
        const controlBtns = testComponent.querySelectorAll('.control-btn');
        console.log(`  ✓ Control buttons found: ${controlBtns.length}`);
        
        // Try clicking a button programmatically
        const deleteBtn = Array.from(controlBtns).find(btn => btn.textContent.trim() === '×');
        if (deleteBtn) {
            console.log("  🧪 Testing delete button...");
            
            // Override confirm for testing
            const originalConfirm = window.confirm;
            window.confirm = () => {
                console.log("  ✓ Confirm dialog would appear");
                window.confirm = originalConfirm;
                return false; // Don't actually delete
            };
            
            deleteBtn.click();
        }
    } else {
        console.log("  ❌ Test component not rendered");
    }
    
    console.log("\n📊 SUMMARY:");
    console.log("If control buttons have listeners and clicking works,");
    console.log("the controls are properly set up!");
    
    console.log("\n💡 Manual Testing:");
    console.log("1. Click the ↑ ↓ buttons to move components");
    console.log("2. Click ⧉ to duplicate a component");
    console.log("3. Click × to delete a component");
    console.log("4. Check console for action logs");
}, 1000);
