/**
 * Quick diagnostic to check component selection system
 */

console.log('%c=== COMPONENT SELECTION DIAGNOSTIC ===', 'color: blue; font-size: 14px; font-weight: bold;');

// Check if managers exist
console.log('\n1. MANAGERS CHECK:');
console.log('   designPanel exists:', !!window.designPanel);
console.log('   componentSelectionManager exists:', !!window.componentSelectionManager);
console.log('   componentOptionsUI exists:', !!window.componentOptionsUI);

// Check event listeners
console.log('\n2. EVENT LISTENER TEST:');

// Test firing a selection event manually
setTimeout(() => {
    const testComponentId = 'test-component-123';
    console.log(`\n3. FIRING TEST EVENT: gmkb:component-selected for ${testComponentId}`);
    
    document.dispatchEvent(new CustomEvent('gmkb:component-selected', {
        detail: {
            componentId: testComponentId,
            componentType: 'test',
            timestamp: Date.now()
        }
    }));
    
    // Check if design panel responded
    setTimeout(() => {
        console.log('\n4. CHECKING DESIGN PANEL RESPONSE:');
        if (window.designPanel) {
            console.log('   Current component ID:', window.designPanel.currentComponentId);
            console.log('   Is updating:', window.designPanel.isUpdating);
        }
    }, 500);
}, 100);

// Try to find and select a real component
setTimeout(() => {
    console.log('\n5. LOOKING FOR REAL COMPONENTS:');
    const components = document.querySelectorAll('[data-component-id]');
    console.log(`   Found ${components.length} components in DOM`);
    
    if (components.length > 0) {
        const firstComponent = components[0];
        const componentId = firstComponent.getAttribute('data-component-id');
        console.log(`   First component ID: ${componentId}`);
        
        // Check if clicking works
        console.log('\n6. SIMULATING CLICK ON FIRST COMPONENT:');
        firstComponent.click();
        
        setTimeout(() => {
            console.log('   Design panel current component:', window.designPanel?.currentComponentId);
        }, 500);
    }
}, 1000);
