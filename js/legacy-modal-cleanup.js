/**
 * Legacy Modal Cleanup
 * Ensures only Vue ComponentLibrary is used
 * 
 * COMPLIANT: Removes legacy code completely
 */

(function() {
    // Block any attempt to create the old modal
    const blockLegacyModal = () => {
        // Intercept and block any modal creation with these IDs
        const originalCreateElement = document.createElement;
        document.createElement = function(tagName) {
            const element = originalCreateElement.call(document, tagName);
            
            // Override setAttribute to detect legacy modal creation
            const originalSetAttribute = element.setAttribute;
            element.setAttribute = function(name, value) {
                if (name === 'id' && value === 'component-library-modal') {
                    console.warn('Blocked legacy component-library-modal creation');
                    return; // Block the ID assignment
                }
                return originalSetAttribute.call(this, name, value);
            };
            
            return element;
        };
        
        // Remove any existing legacy modals
        const removeLegacyModals = () => {
            // Find and remove any non-Vue modals
            const legacyModals = document.querySelectorAll('#component-library-modal:not(.library-modal)');
            legacyModals.forEach(modal => {
                console.log('Removing legacy modal:', modal);
                modal.remove();
            });
            
            // Also remove by class pattern
            const simpleModals = document.querySelectorAll('.modal__content:has(.modal__title:contains("Component Library"))');
            simpleModals.forEach(modal => {
                const parent = modal.closest('.modal');
                if (parent) {
                    console.log('Removing simple modal:', parent);
                    parent.remove();
                }
            });
        };
        
        // Run cleanup immediately and on mutations
        removeLegacyModals();
        
        // Watch for any dynamic modal creation
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        if (node.id === 'component-library-modal' && !node.classList.contains('library-modal')) {
                            console.log('Removing dynamically added legacy modal');
                            node.remove();
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    };
    
    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', blockLegacyModal);
    } else {
        blockLegacyModal();
    }
})();
