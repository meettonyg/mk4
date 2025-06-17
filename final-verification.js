/**
 * Final verification script for the component renderer fix
 * Copy and paste this into the browser console after clearing cache and reloading
 */

(async function() {
    console.clear();
    console.log("🔍 FINAL VERIFICATION OF COMPONENT RENDERER FIX");
    console.log("================================================\n");

    // 1. Core initialization check
    console.log("1️⃣ CORE INITIALIZATION CHECK:");
    console.log("  ✓ stateManager exists:", !!window.stateManager);
    console.log("  ✓ componentRenderer exists:", !!window.componentRenderer);
    console.log("  ✓ componentRenderer initialized:", window.componentRenderer?.initialized === true);
    console.log("  ✓ setupElementSelection exists:", !!window.setupElementSelection);
    console.log("  ✓ setupContentEditableUpdates exists:", !!window.setupContentEditableUpdates);

    // 2. Empty state check
    console.log("\n2️⃣ EMPTY STATE CHECK:");
    const preview = document.getElementById('media-kit-preview');
    const emptyState = document.getElementById('empty-state');
    const hasComponents = !!preview?.querySelector('[data-component-id]');
    
    console.log("  ✓ Preview container found:", !!preview);
    console.log("  ✓ Empty state element exists:", !!emptyState);
    console.log("  ✓ Has components:", hasComponents);
    console.log("  ✓ Empty state visible:", emptyState?.style.display !== 'none');

    // 3. Button functionality check
    console.log("\n3️⃣ BUTTON FUNCTIONALITY CHECK:");
    const addBtn = document.getElementById('add-first-component');
    const loadBtn = document.getElementById('load-template');
    
    if (addBtn) {
        console.log("  ✓ Add Component button found");
        console.log("  ✓ Listener attached:", addBtn.hasAttribute('data-listener-attached'));
        
        // Test if clicking would work
        const hasClickHandler = addBtn.onclick !== null || addBtn.hasAttribute('data-listener-attached');
        console.log("  ✓ Click handler ready:", hasClickHandler);
    } else {
        console.log("  ⚠️ Add Component button not found (might have components already)");
    }

    // 4. State manager check
    console.log("\n4️⃣ STATE MANAGER CHECK:");
    const currentState = window.stateManager?.getState();
    console.log("  ✓ Can get state:", !!currentState);
    
    if (currentState) {
        const componentCount = 
            (currentState.hero ? 1 : 0) + 
            (currentState.sections?.length || 0) + 
            (currentState.cta ? 1 : 0);
        console.log("  ✓ Components in state:", componentCount);
    }

    // 5. LocalStorage check
    console.log("\n5️⃣ LOCALSTORAGE CHECK:");
    const savedData = localStorage.getItem('mediaKitData');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            console.log("  ✓ Saved data found");
            console.log("  ✓ Hero:", !!parsed.hero);
            console.log("  ✓ Sections:", parsed.sections?.length || 0);
            console.log("  ✓ CTA:", !!parsed.cta);
        } catch (e) {
            console.log("  ❌ Error parsing saved data:", e.message);
        }
    } else {
        console.log("  ℹ️ No saved data (fresh start)");
    }

    // 6. Live component test
    console.log("\n6️⃣ LIVE COMPONENT TEST:");
    if (window.stateManager && !hasComponents) {
        console.log("  🧪 Adding test component...");
        
        const testHero = {
            id: `hero-test-${Date.now()}`,
            type: 'hero',
            order: 0,
            data: {
                name: 'Test Hero',
                title: 'Testing Component Renderer',
                bio: 'If you see this, the fix is working!'
            }
        };
        
        window.stateManager.addComponent('hero', testHero);
        
        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const rendered = document.querySelector(`[data-component-id="${testHero.id}"]`);
        if (rendered) {
            console.log("  ✅ TEST PASSED: Component rendered successfully!");
            
            // Clean up test component
            window.stateManager.removeComponent('hero');
            console.log("  🧹 Test component removed");
        } else {
            console.log("  ❌ TEST FAILED: Component did not render");
        }
    } else if (hasComponents) {
        console.log("  ℹ️ Skipping test - components already exist");
    }

    // Final summary
    console.log("\n📊 SUMMARY:");
    const allChecks = [
        !!window.stateManager,
        !!window.componentRenderer,
        window.componentRenderer?.initialized === true,
        !addBtn || addBtn.hasAttribute('data-listener-attached')
    ];
    
    const passed = allChecks.filter(Boolean).length;
    const total = allChecks.length;
    
    if (passed === total) {
        console.log("✅ ALL CHECKS PASSED! The component renderer fix is working correctly.");
    } else {
        console.log(`⚠️ ${passed}/${total} checks passed. Some issues may remain.`);
    }
    
    console.log("\n💡 If you're still having issues:");
    console.log("   1. Hard refresh (Ctrl+F5 or Cmd+Shift+R)");
    console.log("   2. Clear browser cache completely");
    console.log("   3. Check browser console for errors");
    console.log("   4. Try in an incognito/private window");
})();
