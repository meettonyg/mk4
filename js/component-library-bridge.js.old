/**
 * Component Library Bridge
 * Connects the Add Component button to the Vue ComponentLibrary
 * 
 * COMPLIANT: Event-driven architecture, no patches
 */

document.addEventListener('DOMContentLoaded', function() {
    const initComponentLibraryButton = () => {
        const addComponentBtn = document.getElementById('add-component-btn');
        
        if (addComponentBtn) {
            // Clear any existing handlers and add our clean handler
            const newBtn = addComponentBtn.cloneNode(true);
            addComponentBtn.parentNode.replaceChild(newBtn, addComponentBtn);
            
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Use Vue component library
                if (typeof window.openComponentLibrary === 'function') {
                    window.openComponentLibrary();
                } else {
                    // Fallback: dispatch event for Vue to handle
                    document.dispatchEvent(new CustomEvent('gmkb:open-component-library'));
                }
            });
        }
    };
    
    // Initialize on DOM ready
    initComponentLibraryButton();
    
    // Re-initialize if Vue signals ready
    document.addEventListener('gmkb:ready', initComponentLibraryButton);
});
