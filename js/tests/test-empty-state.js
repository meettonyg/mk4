/**
 * Test script for empty state functionality
 * Run in console to test add component and load template buttons
 */

console.log('🧪 Testing Empty State Functionality...\n');

// Test 1: Check empty state visibility
const emptyState = document.getElementById('empty-state');
const state = enhancedStateManager?.getState();
const hasComponents = Object.keys(state?.components || {}).length > 0;

console.log('1️⃣ Empty State Status:');
console.log(`   Components in state: ${Object.keys(state?.components || {}).length}`);
console.log(`   Empty state element exists: ${!!emptyState}`);
console.log(`   Empty state display: ${emptyState?.style.display}`);
console.log(`   Should show empty state: ${!hasComponents}`);

// Test 2: Check buttons
const addFirstBtn = document.getElementById('add-first-component');
const loadTemplateBtn = document.getElementById('load-template');
const addComponentBtn = document.getElementById('add-component-btn');

console.log('\n2️⃣ Button Status:');
console.log(`   Add First Component button: ${!!addFirstBtn}`);
console.log(`   Load Template button: ${!!loadTemplateBtn}`);
console.log(`   Add Component (sidebar) button: ${!!addComponentBtn}`);

// Test 3: Simulate empty state
console.log('\n3️⃣ Simulating Empty State:');
if (emptyState) {
    emptyState.style.display = 'flex';
    console.log('✅ Empty state shown');
    
    // Test button clicks
    if (addFirstBtn) {
        console.log('   Testing "Add Component" button...');
        addFirstBtn.click();
        setTimeout(() => {
            const modal = document.querySelector('.modal-overlay[style*="display: flex"]');
            if (modal) {
                console.log('   ✅ Component library opened');
                modal.style.display = 'none';
            } else {
                console.log('   ❌ Component library did not open');
            }
        }, 100);
    }
    
    if (loadTemplateBtn) {
        setTimeout(() => {
            console.log('   Testing "Load Template" button...');
            loadTemplateBtn.click();
            setTimeout(() => {
                const modal = document.getElementById('template-library-modal');
                if (modal && modal.style.display !== 'none') {
                    console.log('   ✅ Template library opened');
                    modal.style.display = 'none';
                } else {
                    console.log('   ❌ Template library did not open');
                }
            }, 100);
        }, 500);
    }
}

// Test 4: Check enhanced component renderer
console.log('\n4️⃣ Enhanced Component Renderer:');
if (enhancedComponentRenderer) {
    console.log('✅ Renderer exists');
    console.log(`   updateEmptyState method: ${typeof enhancedComponentRenderer.updateEmptyState === 'function'}`);
    console.log(`   setupEmptyStateListeners method: ${typeof enhancedComponentRenderer.setupEmptyStateListeners === 'function'}`);
    
    // Force update empty state
    enhancedComponentRenderer.updateEmptyState(state);
    console.log('   Empty state updated based on current state');
} else {
    console.error('❌ Enhanced component renderer not found');
}

console.log('\n✨ Empty state test complete!');