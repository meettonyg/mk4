/**
 * Element selection and editing functionality
 */

import { getState, setState } from '../state.js';
import { markUnsaved } from '../services/save-service.js';
import { saveCurrentState } from '../services/history-service.js';
import { showDesignPanel, clearDesignPanel } from '../components/design-panel-loader.js';

/**
 * Set up element selection functionality
 */
export function setupElementSelection() {
    const editableElements = document.querySelectorAll('.editable-element');

    editableElements.forEach(element => {
        element.addEventListener('click', function(e) {
            e.stopPropagation();
            selectElement(this);
        });
    });

    // Deselect when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.editable-element') && 
            !e.target.closest('.sidebar') && 
            !e.target.closest('.library') &&
            !e.target.closest('.modal__content')) {
            deselectAllElements();
        }
    });
}

/**
 * Select an element
 * @param {HTMLElement} element - The element to select
 */
export function selectElement(element) {
    // Remove selection from all elements
    document.querySelectorAll('.editable-element').forEach(el => {
        el.classList.remove('editable-element--selected');
    });

    // Select clicked element
    element.classList.add('editable-element--selected');
    setState('selectedElement', element);

    // Update design panel
    updateDesignPanel(element);

    // Switch to design tab
    const designTab = document.querySelector('.sidebar__tab[data-tab="design"]');
    if (designTab) {
        designTab.click();
    }
}

/**
 * Deselect all elements
 */
export function deselectAllElements() {
    document.querySelectorAll('.editable-element').forEach(el => {
        el.classList.remove('editable-element--selected');
    });
    setState('selectedElement', null);
    
    // Clear the design panel
    clearDesignPanel();
}

/**
 * Update the design panel based on the selected element
 * @param {HTMLElement} element - The selected element
 */
export async function updateDesignPanel(element) {
    const componentType = element.getAttribute('data-component');
    
    if (!componentType) {
        console.warn('Element has no data-component attribute');
        return;
    }
    
    // Load the appropriate design panel
    await showDesignPanel(componentType, element);
}

/**
 * Set up contenteditable live updates
 */
export function setupContentEditableUpdates() {
    // Use event delegation for dynamically added elements
    document.addEventListener('blur', function(e) {
        if (e.target.hasAttribute('contenteditable') && e.target.getAttribute('contenteditable') === 'true') {
            markUnsaved();
            saveCurrentState();
        }
    }, true);

    document.addEventListener('keydown', function(e) {
        if (e.target.hasAttribute('contenteditable') && e.target.getAttribute('contenteditable') === 'true') {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.target.blur();
            }
        }
    });
}

/**
 * Delete the selected element
 */
export function deleteSelectedElement() {
    const selectedElement = getState('selectedElement');
    if (selectedElement && selectedElement.getAttribute('data-component') !== 'hero') {
        selectedElement.remove();
        setState('selectedElement', null);
        clearDesignPanel();
        markUnsaved();
        saveCurrentState();
    }
}
