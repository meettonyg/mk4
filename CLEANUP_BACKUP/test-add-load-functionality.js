/**
 * Test Add Component and Load Template functionality
 * Run this after page reload to verify fixes
 */

(async function() {
    console.log('🧪 Testing Add Component and Load Template...\n');
    
    // Wait a bit for initialization
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test 1: Check initialization
    console.log('1️⃣ Initialization Check:');
    console.log('Enhanced init used:', window.mediaKitBuilderInitialized);
    console.log('Component manager ready:', window.componentManager && window.componentManager.initialized);
    console.log('State has layout:', Array.isArray(window.stateManager?.getState()?.layout));
    
    // Test 2: Test Add Component
    console.log('\n2️⃣ Testing Add Component:');
    const addBtn = document.getElementById('add-component-btn') || document.querySelector('.add-component-btn');
    if (addBtn) {
        console.log('✅ Add Component button found');
        
        // Trigger click
        addBtn.click();
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const modal = document.getElementById('component-library-overlay');
        if (modal && modal.style.display !== 'none') {
            console.log('✅ Component library opened!');
            
            // Find first non-premium component
            const componentCard = modal.querySelector('.component-card:not(.component-card--premium)');
            if (componentCard) {
                const componentType = componentCard.getAttribute('data-component');
                console.log(`   Selecting component: ${componentType}`);
                componentCard.click();
                
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Check if component was added
                const state = window.stateManager.getState();
                const hasComponent = Object.values(state.components).some(c => c.type === componentType);
                if (hasComponent) {
                    console.log('✅ Component added successfully!');
                } else {
                    console.log('❌ Component was not added');
                }
            }
        } else {
            console.log('❌ Component library did not open');
        }
    } else {
        console.log('❌ Add Component button not found');
    }
    
    // Test 3: Test Load Template
    console.log('\n3️⃣ Testing Load Template:');
    const loadBtn = document.getElementById('load-template');
    if (loadBtn) {
        console.log('✅ Load Template button found');
        
        // Trigger click
        loadBtn.click();
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const modal = document.getElementById('template-library-modal');
        if (modal && modal.style.display !== 'none') {
            console.log('✅ Template library opened!');
            modal.style.display = 'none'; // Close it
        } else {
            console.log('❌ Template library did not open');
        }
    } else {
        console.log('❌ Load Template button not found');
    }
    
    // Test 4: Component Controls
    console.log('\n4️⃣ Testing Component Controls:');
    const controlBtn = document.querySelector('.control-btn');
    if (controlBtn) {
        console.log('✅ Control buttons found and should work');
    } else {
        console.log('ℹ️ No components to test controls');
    }
    
    console.log('\n✨ Test complete! Check results above.');
})();