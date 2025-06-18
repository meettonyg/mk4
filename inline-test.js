// Quick inline test for component rendering
// Copy and paste this entire block into the browser console

console.log('%c=== Testing Component Rendering ===', 'color: #4CAF50; font-weight: bold; font-size: 16px');

// Test function
async function testComponentRendering() {
    // Test 1: Count current components
    const initialCount = document.querySelectorAll('[data-component-id]').length;
    console.log(`Current components: ${initialCount}`);
    
    // Test 2: Find a component to duplicate
    const firstComponent = document.querySelector('[data-component-id]');
    if (!firstComponent) {
        console.log('No components found. Add one first.');
        return;
    }
    
    const componentId = firstComponent.getAttribute('data-component-id');
    console.log(`Testing with component: ${componentId}`);
    
    // Test 3: Click duplicate button
    const duplicateBtn = firstComponent.querySelector('.control-btn[title="Duplicate"]');
    if (duplicateBtn) {
        console.log('Clicking duplicate button...');
        duplicateBtn.click();
        
        // Wait for duplication
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newCount = document.querySelectorAll('[data-component-id]').length;
        if (newCount > initialCount) {
            console.log('✅ Duplication successful!');
            console.log(`Components: ${initialCount} → ${newCount}`);
            
            // Test 4: Delete the duplicated component
            console.log('\nTesting deletion...');
            const components = document.querySelectorAll('[data-component-id]');
            const lastComponent = components[components.length - 1];
            const deleteBtn = lastComponent.querySelector('.control-btn[title="Delete"]');
            
            if (deleteBtn) {
                // Override confirm temporarily
                const originalConfirm = window.confirm;
                window.confirm = () => true;
                
                deleteBtn.click();
                
                // Restore confirm
                window.confirm = originalConfirm;
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const finalCount = document.querySelectorAll('[data-component-id]').length;
                if (finalCount === initialCount) {
                    console.log('✅ Deletion successful!');
                    console.log(`Components: ${newCount} → ${finalCount}`);
                } else {
                    console.log('❌ Deletion may have issues');
                }
            }
        } else {
            console.log('❌ Duplication failed');
        }
    } else {
        console.log('Duplicate button not found');
    }
    
    console.log('\n%c=== Test Complete ===', 'color: #4CAF50; font-weight: bold');
}

// Run the test
testComponentRendering();
