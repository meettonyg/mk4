/**
 * Element controls functionality (move, duplicate, delete)
 * Enhanced to use centralized component manager
 */

// ROOT FIX: Use global objects instead of ES6 imports
// markUnsaved, selectElement, and enhancedComponentManager will be available globally

/**
 * Setup event listeners for element control buttons
 */
function setupElementControls() {
    // Use event delegation on the preview container
    const previewArea = document.getElementById('media-kit-preview');
    if (previewArea) {
        previewArea.addEventListener('click', handleControlButtonClick);
    }
    console.log('Element controls initialized using event delegation.');
}



/**
 * Handle control button click events via delegation
 * @param {Event} e - The click event
 */
function handleControlButtonClick(e) {
    const button = e.target.closest('.control-btn');
    if (!button) return;

    e.stopPropagation();
    e.preventDefault();

    const element = button.closest('.editable-element');
    const componentId = element?.getAttribute('data-component-id');

    if (!componentId) {
        console.warn('Control button clicked but no parent component ID found');
        return;
    }

    const action = button.getAttribute('title');
    console.log(`Control action: ${action} on component: ${componentId}`);

    switch (action) {
        case 'Move Up':
            if (window.enhancedComponentManager) {
                window.enhancedComponentManager.moveComponent(componentId, 'up');
            }
            break;
        case 'Move Down':
            if (window.enhancedComponentManager) {
                window.enhancedComponentManager.moveComponent(componentId, 'down');
            }
            break;
        case 'Duplicate':
            if (window.enhancedComponentManager) {
                window.enhancedComponentManager.duplicateComponent(componentId);
            }
            break;
        case 'Delete':
            if (window.enhancedComponentManager) {
                window.enhancedComponentManager.removeComponent(componentId);
            }
            break;
    }
    
    // Mark as unsaved after any action
    if (window.markUnsaved) {
        window.markUnsaved();
    }
}

// ROOT FIX: Expose functions globally
window.elementControls = {
    setup: setupElementControls,
    handleClick: handleControlButtonClick
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupElementControls);
} else {
    setupElementControls();
}

console.log('✅ Element Controls: Global namespace setup complete');

