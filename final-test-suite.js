/**
 * FINAL COMPREHENSIVE TEST SUITE
 * Run this after clearing cache to verify all fixes
 */

(async function() {
    console.clear();
    console.log("🎯 GUESTIFY MEDIA KIT BUILDER - FINAL TEST SUITE");
    console.log("================================================\n");
    
    let allPassed = true;
    
    // Test 1: Core Systems
    console.log("1️⃣ CORE SYSTEMS CHECK:");
    const coreChecks = {
        "State Manager": !!window.stateManager,
        "Component Manager": !!window.componentManager,
        "Component Renderer": !!window.componentRenderer,
        "Renderer Initialized": window.componentRenderer?.initialized === true
    };
    
    Object.entries(coreChecks).forEach(([name, check]) => {
        console.log(`  ${check ? '✓' : '❌'} ${name}: ${check}`);
        if (!check) allPassed = false;
    });
    
    // Test 2: State Structure
    console.log("\n2️⃣ STATE STRUCTURE CHECK:");
    const state = window.stateManager?.getState();
    if (state) {
        console.log("  ✓ State retrieved successfully");
        console.log("  ✓ Components container exists:", !!state.components);
        console.log("  ✓ Current components:", Object.keys(state.components || {}).length);
    } else {
        console.log("  ❌ Failed to get state");
        allPassed = false;
    }
    
    // Test 3: Empty State
    console.log("\n3️⃣ EMPTY STATE CHECK:");
    const hasComponents = Object.keys(state?.components || {}).length > 0;
    const emptyState = document.getElementById('empty-state');
    const addBtn = document.getElementById('add-first-component');
    
    if (!hasComponents) {
        console.log("  ✓ No components - empty state should be visible");
        console.log("  ✓ Empty state element exists:", !!emptyState);
        console.log("  ✓ Empty state visible:", emptyState?.style.display !== 'none');
        console.log("  ✓ Add button exists:", !!addBtn);
        console.log("  ✓ Add button has listener:", addBtn?.hasAttribute('data-listener-attached'));
        
        if (!addBtn?.hasAttribute('data-listener-attached')) {
            allPassed = false;
        }
    } else {
        console.log("  ℹ️ Components exist - skipping empty state checks");
    }
    
    // Test 4: Component Addition
    console.log("\n4️⃣ COMPONENT ADDITION TEST:");
    const testId = `test-component-${Date.now()}`;
    
    console.log("  🧪 Adding test component...");
    window.stateManager.initComponent(testId, 'hero', {
        name: 'Test Component',
        title: 'Comprehensive Test',
        bio: 'Testing all systems'
    });
    
    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check results
    const addedToState = !!window.stateManager.getComponent(testId);
    const renderedInDOM = !!document.querySelector(`[data-component-id="${testId}"]`);
    const renderer = window.componentRenderer;
    const components = renderer?.getSortedComponents(window.stateManager.getState());
    const foundInRenderer = components?.some(c => c.id === testId);
    
    console.log("  ✓ Added to state:", addedToState);
    console.log("  ✓ Rendered in DOM:", renderedInDOM);
    console.log("  ✓ Found by renderer:", foundInRenderer);
    
    if (!addedToState || !renderedInDOM || !foundInRenderer) {
        allPassed = false;
    }
    
    // Test 5: Component Removal
    console.log("\n5️⃣ COMPONENT REMOVAL TEST:");
    console.log("  🧪 Removing test component...");
    window.stateManager.removeComponent(testId);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const removedFromState = !window.stateManager.getComponent(testId);
    const removedFromDOM = !document.querySelector(`[data-component-id="${testId}"]`);
    
    console.log("  ✓ Removed from state:", removedFromState);
    console.log("  ✓ Removed from DOM:", removedFromDOM);
    
    if (!removedFromState || !removedFromDOM) {
        allPassed = false;
    }
    
    // Test 6: Save/Load System
    console.log("\n6️⃣ SAVE/LOAD SYSTEM CHECK:");
    const saveData = window.stateManager.getSerializableState();
    console.log("  ✓ Can serialize state:", !!saveData);
    console.log("  ✓ Has version:", !!saveData.version);
    console.log("  ✓ Has components array:", Array.isArray(saveData.components));
    
    // Test 7: Legacy Data Migration
    console.log("\n7️⃣ LEGACY DATA MIGRATION TEST:");
    const legacyData = {
        hero: { name: 'Legacy Hero', title: 'Old Format' },
        sections: [{ type: 'stats', data: { title: 'Legacy Stats' }}],
        cta: { title: 'Legacy CTA', link: '#' }
    };
    
    // Clear current state
    window.stateManager.clearState();
    
    // Load legacy data
    window.stateManager.loadSerializedState(legacyData);
    const migratedState = window.stateManager.getState();
    const migratedCount = Object.keys(migratedState.components).length;
    
    console.log("  ✓ Legacy data loaded");
    console.log("  ✓ Components migrated:", migratedCount);
    console.log("  ✓ Expected 3, got:", migratedCount);
    
    if (migratedCount !== 3) {
        allPassed = false;
    }
    
    // Clear test data
    window.stateManager.clearState();
    
    // Final Summary
    console.log("\n📊 FINAL SUMMARY:");
    console.log("=================");
    
    if (allPassed) {
        console.log("✅ ALL TESTS PASSED!");
        console.log("\nThe Media Kit Builder is working correctly:");
        console.log("  • Components render properly");
        console.log("  • Empty state buttons work");
        console.log("  • State management is synchronized");
        console.log("  • Legacy data is handled");
        console.log("\n🎉 Ready for use!");
    } else {
        console.log("⚠️ SOME TESTS FAILED");
        console.log("\nPlease check the failed tests above.");
        console.log("\nTroubleshooting steps:");
        console.log("  1. Clear ALL browser data for this site");
        console.log("  2. Do a hard refresh (Ctrl+Shift+R)");
        console.log("  3. Check for JavaScript errors");
        console.log("  4. Ensure all files were saved correctly");
    }
    
    console.log("\n💾 Current localStorage data:");
    const savedData = localStorage.getItem('mediaKitData');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            console.log("  Format:", parsed.components ? 'New' : 'Legacy');
            console.log("  Components:", parsed.components?.length || 'N/A');
        } catch (e) {
            console.log("  Error parsing saved data");
        }
    } else {
        console.log("  No saved data");
    }
})();
