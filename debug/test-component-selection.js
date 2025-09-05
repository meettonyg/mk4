/**
 * Test script to verify component selection and design panel integration
 */

console.log('%c🧪 COMPONENT SELECTION TEST', 'color: blue; font-size: 14px; font-weight: bold;');

// Test 1: Check if all managers are available
console.log('1. Checking managers...');
console.log('   - componentSelectionManager:', !!window.componentSelectionManager);
console.log('   - designPanel:', !!window.designPanel);
console.log('   - componentOptionsUI:', !!window.componentOptionsUI);

// Test 2: Try to select a component programmatically
setTimeout(() => {
    console.log('\n2. Looking for components in DOM...');
    const components = document.querySelectorAll('[data-component-id]');
    console.log(`   Found ${components.length} components`);
    
    if (components.length > 0) {
        const firstComponent = components[0];
        const componentId = firstComponent.getAttribute('data-component-id');
        const componentType = firstComponent.getAttribute('data-component-type');
        
        console.log(`\n3. Attempting to select component: ${componentId} (${componentType})`);
        
        // Try using the selection manager
        if (window.componentSelectionManager && window.componentSelectionManager.selectComponentById) {
            console.log('   Using componentSelectionManager.selectComponentById()');
            window.componentSelectionManager.selectComponentById(componentId);
        } else {
            console.log('   Manually dispatching selection event');
            document.dispatchEvent(new CustomEvent('gmkb:component-selected', {
                detail: {
                    componentId: componentId,
                    componentType: componentType,
                    element: firstComponent,
                    timestamp: Date.now()
                }
            }));
        }
        
        // Check if design panel loaded after a short delay
        setTimeout(() => {
            console.log('\n4. Checking design panel state...');
            if (window.designPanel) {
                console.log('   - Current component ID:', window.designPanel.currentComponentId);
                console.log('   - Panel content:', window.designPanel.panel?.querySelector('.element-editor__title')?.textContent);
            }
            
            console.log('\n✅ Test complete. Check if the design panel opened with the component.');
        }, 1000);
    } else {
        console.log('   ❌ No components found in DOM. Add a component first.');
    }
}, 500);
