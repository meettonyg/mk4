/**
 * Test Script for Component Rendering Fix
 * Run this in the browser console to verify the fixes
 */

console.log('%c=== Component Rendering Root Fix Test ===', 'color: #4CAF50; font-weight: bold; font-size: 16px');

// Test 1: Check if we can add a component
console.group('Test 1: Add Component');
(async () => {
    if (window.enhancedComponentManager) {
        const componentId = await window.enhancedComponentManager.addComponent('hero');
        console.log('✅ Component added:', componentId);
        
        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const element = document.querySelector(`[data-component-id="${componentId}"]`);
        if (element) {
            console.log('✅ Component rendered in DOM');
        } else {
            console.error('❌ Component not found in DOM');
        }
    } else {
        console.error('❌ Component manager not available');
    }
})();
console.groupEnd();

// Test 2: Check component duplication
setTimeout(() => {
    console.group('Test 2: Duplicate Component');
    const firstComponent = document.querySelector('[data-component-id]');
    if (firstComponent) {
        const componentId = firstComponent.getAttribute('data-component-id');
        console.log('Duplicating:', componentId);
        
        const duplicateBtn = firstComponent.querySelector('.control-btn[title="Duplicate"]');
        if (duplicateBtn) {
            duplicateBtn.click();
            
            setTimeout(() => {
                const components = document.querySelectorAll('[data-component-id]');
                if (components.length > 1) {
                    console.log('✅ Component duplicated successfully');
                    console.log('Total components:', components.length);
                } else {
                    console.error('❌ Duplication failed');
                }
                console.groupEnd();
            }, 1000);
        }
    } else {
        console.log('No component to duplicate');
        console.groupEnd();
    }
}, 2000);

// Test 3: Check deletion
setTimeout(() => {
    console.group('Test 3: Delete Component');
    const components = document.querySelectorAll('[data-component-id]');
    if (components.length > 1) {
        const lastComponent = components[components.length - 1];
        const deleteBtn = lastComponent.querySelector('.control-btn[title="Delete"]');
        
        if (deleteBtn) {
            console.log('Deleting component...');
            
            // Temporarily override confirm
            const originalConfirm = window.confirm;
            window.confirm = () => true;
            
            deleteBtn.click();
            
            // Restore confirm
            window.confirm = originalConfirm;
            
            setTimeout(() => {
                const remainingComponents = document.querySelectorAll('[data-component-id]');
                if (remainingComponents.length < components.length) {
                    console.log('✅ Component deleted successfully');
                } else {
                    console.error('❌ Deletion failed');
                }
                console.groupEnd();
                
                console.log('%c=== All tests complete ===', 'color: #4CAF50; font-weight: bold');
            }, 500);
        }
    } else {
        console.log('Not enough components to test deletion');
        console.groupEnd();
    }
}, 4000);

// Debug info
console.log('\nDebug Commands:');
console.log('- Check state: window.enhancedStateManager.getState()');
console.log('- Check rendering: window.enhancedComponentRenderer.isRendering');
console.log('- Force render: window.enhancedComponentRenderer.forceRender()');
