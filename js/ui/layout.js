/**
 * @file layout.js
 * @description Manages the layout of the media kit, including drag-and-drop functionality
 * and the empty state display.
 *
 * This version is updated to use the modern componentManager for adding components,
 * resolving module import errors and aligning with the new architecture.
 */
import {
    state
} from '../state.js';
// FIX: The componentManager is now the single point of contact for adding components.
import {
    componentManager
} from '../components/component-manager.js';

let dragCounter = 0;

/**
 * Initializes layout-related functionality, including drag-and-drop listeners.
 */
export function initializeLayout() {
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
            // FIX: Use the componentManager to add the new component.
            // This properly updates the state and triggers a re-render.
            componentManager.addComponent(componentType);
        }
    });

    console.log('Layout options initialized with drag-and-drop functionality.');
    updateEmptyState(); // Initial check
}

/**
 * Updates the visibility of the "empty state" message.
 * This is shown when there are no components in the media kit.
 */
export function updateEmptyState() {
    const emptyStateContainer = document.getElementById('empty-state');
    if (!emptyStateContainer) return;

    const hasComponents = state.layout && state.layout.length > 0;
    emptyStateContainer.style.display = hasComponents ? 'none' : 'flex';
}
