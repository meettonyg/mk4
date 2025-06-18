/**
 * Test for Component Deletion Fix
 * 
 * To verify the fix works:
 * 1. Add a biography component
 * 2. Try clicking the delete (×) button multiple times rapidly
 * 3. Component should only be deleted once with no console errors
 * 4. Visual feedback should show immediately (component fades/disables)
 */

// Test rapid delete clicks
function testRapidDeleteClicks() {
    console.log('=== Testing Rapid Delete Clicks ===');
    
    // Find a biography component
    const bioComponent = document.querySelector('[data-component-type="biography"]');
    if (!bioComponent) {
        console.log('No biography component found. Add one first.');
        return;
    }
    
    const componentId = bioComponent.getAttribute('data-component-id');
    const deleteBtn = bioComponent.querySelector('.control-btn:first-child'); // × button
    
    if (!deleteBtn) {
        console.log('Delete button not found');
        return;
    }
    
    console.log('Found component:', componentId);
    console.log('Simulating rapid delete clicks...');
    
    // Simulate 5 rapid clicks
    let clickCount = 0;
    const clickInterval = setInterval(() => {
        clickCount++;
        console.log(`Click ${clickCount}`);
        deleteBtn.click();
        
        if (clickCount >= 5) {
            clearInterval(clickInterval);
            console.log('Test complete. Check console for errors.');
        }
    }, 50); // Click every 50ms
}

// Test component state during deletion
function testComponentStateDuringDeletion() {
    console.log('=== Testing Component State During Deletion ===');
    
    const bioComponent = document.querySelector('[data-component-type="biography"]');
    if (!bioComponent) {
        console.log('No biography component found. Add one first.');
        return;
    }
    
    const componentId = bioComponent.getAttribute('data-component-id');
    
    // Monitor component state
    console.log('Initial state:', {
        inState: !!window.stateManager.getComponent(componentId),
        inDOM: !!document.querySelector(`[data-component-id="${componentId}"]`),
        hasDeleteClass: bioComponent.classList.contains('component-deleting'),
        pointerEvents: window.getComputedStyle(bioComponent).pointerEvents
    });
    
    // Click delete
    const deleteBtn = bioComponent.querySelector('.control-btn:first-child');
    deleteBtn.click();
    
    // Check state immediately after click
    setTimeout(() => {
        console.log('After delete click (100ms):', {
            inState: !!window.stateManager.getComponent(componentId),
            inDOM: !!document.querySelector(`[data-component-id="${componentId}"]`),
            hasDeleteClass: bioComponent.classList.contains('component-deleting'),
            pointerEvents: window.getComputedStyle(bioComponent).pointerEvents
        });
    }, 100);
    
    // Check state after expected removal
    setTimeout(() => {
        console.log('After expected removal (500ms):', {
            inState: !!window.stateManager.getComponent(componentId),
            inDOM: !!document.querySelector(`[data-component-id="${componentId}"]`)
        });
    }, 500);
}

// Run tests
console.log('Delete functionality tests loaded.');
console.log('Run testRapidDeleteClicks() to test rapid clicking');
console.log('Run testComponentStateDuringDeletion() to test state management');

// Export for console access
window.deleteTests = {
    testRapidDeleteClicks,
    testComponentStateDuringDeletion
};
