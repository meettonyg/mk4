/**
 * Quick Fix Script - Paste this into console to fix the issues
 */

(function() {
    console.log('🔧 Applying fixes for delete and add component...');
    
    // Fix 1: Override the addComponentToZone to use enhanced manager
    window.addComponentToZone = async function(componentType, zone) {
        console.log(`Adding ${componentType} to zone`);
        
        // Use the enhanced component manager
        const componentId = await window.componentManager.addComponent(componentType);
        
        // Hide empty state if needed
        const emptyState = document.getElementById('empty-state');
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        
        const preview = document.getElementById('media-kit-preview');
        if (preview) {
            preview.classList.add('has-components');
        }
        
        return componentId;
    };
    
    // Fix 2: Setup add component button if not working
    const addBtn = document.getElementById('add-component-btn');
    if (addBtn) {
        // Remove old listeners and add new one
        const newBtn = addBtn.cloneNode(true);
        addBtn.parentNode.replaceChild(newBtn, addBtn);
        
        newBtn.addEventListener('click', () => {
            console.log('Add component button clicked');
            const modal = document.getElementById('component-library-overlay');
            if (modal) {
                modal.style.display = 'flex';
                modal.style.opacity = '1';
                modal.style.visibility = 'visible';
            } else {
                // Try the show event
                document.dispatchEvent(new CustomEvent('show-component-library'));
            }
        });
    }
    
    // Fix 3: Clear any stuck pending actions
    if (window.enhancedStateManager && window.enhancedStateManager.pendingActions) {
        window.enhancedStateManager.pendingActions.clear();
        console.log('✅ Cleared all pending actions');
    }
    
    console.log('✅ Fixes applied!');
    console.log('\nTry these actions now:');
    console.log('1. Click the Add Component button');
    console.log('2. Try deleting a component');
    
})();