/**
 * @file dnd.js
 * @description Handles all drag and drop functionality for the Media Kit Builder.
 * This includes dragging components from the sidebar to the preview area.
 *
 * ROOT FIX: Converted from ES6 imports to WordPress global namespace approach
 * No more ES6 imports - uses global enhancedComponentManager
 */

// ROOT FIX: Remove ES6 imports - use global namespace
// enhancedComponentManager will be available globally via WordPress enqueue system

let draggedItem = null;

/**
 * Initializes all drag and drop event listeners.
 */
function initializeDragAndDrop() {
    const componentItems = document.querySelectorAll('.component-item');
    const dropZone = document.getElementById('media-kit-preview');

    // Add drag listeners to all component items in the sidebar
    componentItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
    });

    // Add drop listeners to the main preview area
    if (dropZone) {
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragenter', handleDragEnter);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);
    }
}

function handleDragStart(e) {
    draggedItem = e.target.closest('.component-item');
    if (draggedItem) {
        // Add a class to give visual feedback
        draggedItem.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'copy';
        // Set the data to be transferred (the component type)
        e.dataTransfer.setData('text/plain', draggedItem.dataset.component);
    }
}

function handleDragEnd() {
    // Clean up visual feedback class
    if (draggedItem) {
        draggedItem.classList.remove('dragging');
    }
    draggedItem = null;
}

function handleDragOver(e) {
    e.preventDefault(); // Necessary to allow for dropping
    e.dataTransfer.dropEffect = 'copy';
}

function handleDragEnter(e) {
    e.preventDefault();
    const previewContainer = e.target.closest('#media-kit-preview');
    if (previewContainer) {
        previewContainer.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    const previewContainer = e.target.closest('#media-kit-preview');
    if (previewContainer) {
        previewContainer.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    const previewContainer = e.target.closest('#media-kit-preview');
    if (previewContainer) {
        previewContainer.classList.remove('drag-over');
    }

    const componentType = e.dataTransfer.getData('text/plain');

    if (componentType) {
        // ROOT FIX: Use global enhancedComponentManager to add the component
        if (window.enhancedComponentManager && window.enhancedComponentManager.addComponent) {
            window.enhancedComponentManager.addComponent(componentType);
            console.log(`✅ DND: Component ${componentType} added via enhancedComponentManager`);
        } else {
            console.error('❌ DND: enhancedComponentManager not available globally');
        }
    }
}

// ROOT FIX: Expose functions globally instead of ES6 export
window.dragAndDropSystem = {
    initializeDragAndDrop: initializeDragAndDrop,
    handleDragStart: handleDragStart,
    handleDragEnd: handleDragEnd,
    handleDragOver: handleDragOver,
    handleDragEnter: handleDragEnter,
    handleDragLeave: handleDragLeave,
    handleDrop: handleDrop
};

// ROOT FIX: Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDragAndDrop);
} else {
    initializeDragAndDrop();
}

console.log('✅ Drag and Drop System: Global namespace setup complete');
