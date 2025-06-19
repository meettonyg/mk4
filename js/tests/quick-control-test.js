// Quick console test - copy and paste this entire block
(function() {
    console.log('🧪 Media Kit Builder Controls Test');
    
    // Check state
    const state = enhancedStateManager?.getState();
    console.log('Layout:', state?.layout?.length || 0, 'items');
    console.log('Buttons:', document.querySelectorAll('.control-btn').length);
    
    // Test first control
    const btn = document.querySelector('.control-btn[title="Move Down"]');
    if (btn) {
        const id = btn.closest('[data-component-id]')?.dataset.componentId;
        console.log('Testing move down for:', id);
        btn.click();
        setTimeout(() => {
            const newPos = enhancedStateManager.getState().layout.indexOf(id);
            console.log('New position:', newPos);
        }, 100);
    } else {
        console.log('No move down button found');
    }
})();