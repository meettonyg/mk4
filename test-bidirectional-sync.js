/**
 * Test Bi-Directional Sync
 * Run these commands in browser console to test the universal sync system
 */

// Test 1: Check if Universal Sync is loaded
console.log('Universal Sync Loaded:', !!window.UniversalComponentSync);
console.log('Component Sync API:', !!window.ComponentSync);

// Test 2: Debug current sync status
if (window.ComponentSync) {
    window.ComponentSync.debug();
}

// Test 3: Enable editing for all existing components
if (window.ComponentSync) {
    window.ComponentSync.enableAll();
    console.log('✅ All components should now be editable in preview!');
    console.log('💡 Try clicking on any text in the preview to edit it');
}

// Test 4: Check which components are synced
if (window.UniversalComponentSync) {
    console.log('Synced Components:', window.UniversalComponentSync.syncedComponents.size);
    window.UniversalComponentSync.syncedComponents.forEach((data, id) => {
        console.log(`- ${id}: ${data.type}`);
    });
}

// Test 5: Force enable a specific component (replace component-id)
function enableComponent(componentId) {
    const component = document.querySelector(`[data-component-id="${componentId}"]`);
    if (component) {
        const type = component.getAttribute('data-component-type');
        window.UniversalComponentSync.enablePreviewEditing(componentId, type);
        console.log(`✅ Enabled editing for ${componentId}`);
    } else {
        console.log(`❌ Component ${componentId} not found`);
    }
}

// Test 6: Make all text editable (quick test)
function makeAllEditable() {
    document.querySelectorAll('[data-component-id]').forEach(comp => {
        const texts = comp.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span:not(:has(*)), li');
        texts.forEach(el => {
            el.setAttribute('contenteditable', 'true');
            el.style.cursor = 'text';
            el.style.minHeight = '20px';
            
            el.addEventListener('focus', () => {
                el.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                el.style.outline = '2px solid rgba(59, 130, 246, 0.4)';
            });
            
            el.addEventListener('blur', () => {
                el.style.backgroundColor = '';
                el.style.outline = '';
                console.log(`Updated: ${el.textContent}`);
            });
        });
    });
    console.log('✅ All text elements are now editable!');
}

console.log('=== BI-DIRECTIONAL SYNC TEST COMMANDS ===');
console.log('Run: ComponentSync.enableAll() - Enable all components');
console.log('Run: ComponentSync.debug() - Show sync status');
console.log('Run: makeAllEditable() - Quick enable all text');
console.log('Run: enableComponent("component-id") - Enable specific component');
console.log('=========================================');
