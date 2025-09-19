/**
 * Component Library Bridge
 * Connects the Add Component button to the Vue ComponentLibrary
 * 
 * ROOT FIX: This is a minimal event bridge, not a patch
 * It follows the event-driven architecture principle
 */

document.addEventListener('DOMContentLoaded', function() {
    // ROOT FIX: Wait for Vue to expose the openComponentLibrary function
    const initComponentLibraryButton = () => {
        const addComponentBtn = document.getElementById('add-component-btn');
        
        if (addComponentBtn) {
            addComponentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // ROOT FIX: Use the exposed Vue function if available
                if (typeof window.openComponentLibrary === 'function') {
                    window.openComponentLibrary();
                } else {
                    // Dispatch event for Vue to listen to
                    document.dispatchEvent(new CustomEvent('gmkb:open-component-library'));
                }
            });
        }
    };
    
    // Initialize immediately and after Vue loads
    initComponentLibraryButton();
    
    // Also listen for Vue ready event
    document.addEventListener('gmkb:ready', initComponentLibraryButton);
});
</content>
</invoke>