// Quick test to verify edit functionality is working
console.log('🧪 Quick Edit Functionality Test');

// Check if design panel is available
console.log('Design Panel available:', !!window.designPanel);

// Test the first component
const firstComponent = document.querySelector('[data-component-id]');
if (firstComponent) {
    const componentId = firstComponent.getAttribute('data-component-id');
    console.log('Testing edit for component:', componentId);
    
    // Dispatch edit event
    document.dispatchEvent(new CustomEvent('gmkb:component-edit-requested', {
        detail: { componentId }
    }));
    
    console.log('Edit event dispatched - check if design panel opens');
} else {
    console.log('No components found to test');
}
