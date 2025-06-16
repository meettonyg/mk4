/**
 * Element controls functionality (move, duplicate, delete)
 * Enhanced to use centralized component manager
 */

import { markUnsaved } from '../services/save-service.js';
import { selectElement } from './element-editor.js';
import { componentManager } from '../components/component-manager.js';

/**
 * Setup event listeners for element control buttons
 */
export function setupElementControls() {
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
            componentManager.moveComponent(componentId, 'up');
            break;
        case 'Move Down':
            componentManager.moveComponent(componentId, 'down');
            break;
        case 'Duplicate':
            componentManager.duplicateComponent(componentId);
            break;
        case 'Delete':
            componentManager.removeComponent(componentId);
            break;
    }
    
    // Mark as unsaved after any action
    markUnsaved();
}


