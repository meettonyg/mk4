/**
 * @file layout.js
 * @description Manages the layout of the media kit, including drag-and-drop functionality
 * and the empty state display.
 *
 * GEMINI FIX: Updated to use globally available enhancedComponentManager instead of importing
 * from outdated path. This aligns with the new architecture where systems are registered globally.
 */
// ROOT FIX: Use global state object instead of ES6 import
// state will be available globally

let dragCounter = 0;

/**
 * Initializes layout-related functionality, including drag-and-drop listeners.
 */
function initializeLayout() {
    const previewContainer = document.getElementById('media-kit-preview');
    const layoutTab = document.getElementById('layout-tab');
    const componentTab = document.getElementById('components-tab');

    if (!previewContainer || !layoutTab || !componentTab) return;

    // Drag start on component items from the sidebar
    componentTab.addEventListener('dragstart', e => {
        if (e.target.classList.contains('component-item')) {
            e.dataTransfer.setData('text/plain', e.target.dataset.component);
            e.dataTransfer.effectAllowed = 'copy';
        }
    });

    // Drag over the preview container
    previewContainer.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });

    // Drag enter the preview container
    previewContainer.addEventListener('dragenter', e => {
        e.preventDefault();
        dragCounter++;
        previewContainer.classList.add('drag-over');
    });

    // Drag leave the preview container
    previewContainer.addEventListener('dragleave', e => {
        dragCounter--;
        if (dragCounter === 0) {
            previewContainer.classList.remove('drag-over');
        }
    });

    // Drop on the preview container
    previewContainer.addEventListener('drop', e => {
        e.preventDefault();
        dragCounter = 0;
        previewContainer.classList.remove('drag-over');
        const componentType = e.dataTransfer.getData('text/plain');
        if (componentType) {
            // GEMINI FIX: Use the globally available enhancedComponentManager
            // This is registered and available on window by the time layout.js runs
            if (window.enhancedComponentManager && typeof window.enhancedComponentManager.addComponent === 'function') {
                window.enhancedComponentManager.addComponent(componentType);
            } else {
                console.error('Enhanced component manager not available for drag-and-drop');
                // Fallback to legacy component manager if available
                if (window.componentManager && typeof window.componentManager.addComponent === 'function') {
                    window.componentManager.addComponent(componentType);
                } else {
                    console.error('No component manager available for adding component:', componentType);
                }
            }
        }
    });

    console.log('Layout options initialized with drag-and-drop functionality.');
    updateEmptyState(); // Initial check
}

/**
 * Updates the visibility of the "empty state" message.
 * This is shown when there are no components in the media kit.
 */
function updateEmptyState() {
    const emptyStateContainer = document.getElementById('empty-state');
    if (!emptyStateContainer) return;

    // ROOT FIX: Use global state
    const globalState = window.state || (window.enhancedStateManager ? window.enhancedStateManager.getState() : {});
    const hasComponents = globalState.layout && globalState.layout.length > 0;
    emptyStateContainer.style.display = hasComponents ? 'none' : 'flex';
}

// ROOT FIX: Expose functions globally
window.layoutManager = {
    initialize: initializeLayout,
    updateEmptyState: updateEmptyState
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLayout);
} else {
    initializeLayout();
}

console.log('✅ Layout Manager: Global namespace setup complete');
