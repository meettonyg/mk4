/**
 * Test the duplicate button fix
 * Run this to verify duplicate functionality works
 */

console.clear();
console.log("🔧 TESTING DUPLICATE BUTTON FIX");
console.log("================================\n");

// 1. Check current components
console.log("1️⃣ CURRENT COMPONENTS:");
const beforeComponents = window.stateManager.getOrderedComponents();
console.log(`  Components before: ${beforeComponents.length}`);
beforeComponents.forEach((comp, idx) => {
    console.log(`  ${idx + 1}. ${comp.id} (${comp.type})`);
});

// 2. Test duplicate functionality directly
console.log("\n2️⃣ TESTING DUPLICATE FUNCTION:");
if (beforeComponents.length > 0) {
    const firstComponent = beforeComponents[0];
    console.log(`  Duplicating: ${firstComponent.id}`);
    
    // Call duplicate directly
    window.componentManager.duplicateComponent(firstComponent.id);
    
    // Wait and check
    setTimeout(() => {
        const afterComponents = window.stateManager.getOrderedComponents();
        console.log(`\n3️⃣ RESULT:`);
        console.log(`  Components after: ${afterComponents.length}`);
        
        if (afterComponents.length > beforeComponents.length) {
            console.log("  ✅ DUPLICATE SUCCESSFUL!");
            afterComponents.forEach((comp, idx) => {
                console.log(`  ${idx + 1}. ${comp.id} (${comp.type})`);
            });
        } else {
            console.log("  ❌ DUPLICATE FAILED");
            console.log("  Check console for error messages above");
        }
        
        // Find the duplicated component
        const newComponent = afterComponents.find(c => !beforeComponents.some(b => b.id === c.id));
        if (newComponent) {
            console.log(`\n  New component ID: ${newComponent.id}`);
            console.log(`  Type: ${newComponent.type}`);
            console.log(`  Data:`, newComponent.data);
        }
    }, 1000);
} else {
    console.log("  No components to duplicate. Add a component first.");
}

console.log("\n💡 The duplicate button should now work!");
console.log("Click the ⧉ button on any component to test.");
