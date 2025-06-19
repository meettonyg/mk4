/**
 * @file dnd.js
 * @description Handles all drag and drop functionality for the Media Kit Builder.
 * This includes dragging components from the sidebar to the preview area.
 *
 * This version has been updated to use the new enhancedComponentManager for adding components,
 * resolving module errors and aligning with the new architecture.
 */

// FIX: Import the enhancedComponentManager which is now responsible for all component actions.
import {
    enhancedComponentManager
} from '../core/enhanced-component-manager.js';

let draggedItem = null;

/**
 * Initializes all drag and drop event listeners.
 */
export function initializeDragAndDrop() {
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
        // FIX: Use the enhancedComponentManager to add the component.
        // This single call handles state updates and triggers the renderer.
        enhancedComponentManager.addComponent(componentType);
    }
}
