console.log('=== Delete Button Debug Test ===');

// Test function to simulate what happens when delete is clicked
function testDeleteFlow() {
    console.log('1. Testing control button action detection:');
    
    // Find a component with controls
    const component = document.querySelector('[data-component-id]');
    if (!component) {
        console.error('No component found to test');
        return;
    }
    
    const deleteBtn = component.querySelector('.control-btn[title="Delete"]');
    if (!deleteBtn) {
        console.error('No delete button found');
        return;
    }
    
    console.log('Delete button found:', {
        title: deleteBtn.title,
        textContent: deleteBtn.textContent,
        dataAction: deleteBtn.getAttribute('data-action'),
        classList: deleteBtn.classList.toString()
    });
    
    // Check state before action
    console.log('2. Current state components:');
    if (window.stateManager) {
        const state = window.stateManager.getState();
        console.log('Components in state:', Object.keys(state.components));
    }
    
    // Check for duplicate event listeners
    console.log('3. Checking for duplicate event listeners:');
    const controls = component.querySelector('.element-controls');
    if (controls) {
        // Get event listeners (this is a Chrome DevTools API, won't work in regular console)
        console.log('Controls element:', controls);
        console.log('Has data-interactive:', component.hasAttribute('data-interactive'));
    }
    
    console.log('4. Component Manager status:');
    console.log('Component Manager initialized:', window.componentManager?.initialized);
    
    console.log('5. Component Renderer status:');
    console.log('Component Renderer initialized:', window.componentRenderer?.initialized);
    console.log('Is deleting component:', window.componentRenderer?.isDeletingComponent);
    
    console.log('\n=== To manually test: ===');
    console.log('1. Click the delete button (×) on any component');
    console.log('2. Watch the console for the debug messages');
    console.log('3. Check if the component is deleted or duplicated');
}

// Run the test
setTimeout(testDeleteFlow, 1000);

// Also add a global click listener to debug all button clicks
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.control-btn');
    if (btn) {
        console.log('=== Control Button Click Debug ===');
        console.log('Button:', {
            title: btn.title,
            textContent: btn.textContent,
            dataAction: btn.getAttribute('data-action'),
            innerHTML: btn.innerHTML
        });
        console.log('Component:', btn.closest('[data-component-id]')?.getAttribute('data-component-id'));
    }
}, true); // Use capture phase to catch event early
