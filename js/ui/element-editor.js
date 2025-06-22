/**
 * @file element-editor.js
 * @description Manages inline editing of component properties directly in the preview.
 * Also handles element selection and connection to the design panel.
 *
 * This version is updated to correctly import the 'state' object and use its methods,
 * resolving module import errors.
 * 
 * GEMINI FIX: Added element selection functionality and design panel integration.
 */
import {
    state
} from '../state.js';
import {
    debounce
} from '../utils/helpers.js';

// GEMINI FIX: Import the designPanel so it can be called upon selection.
import { designPanel } from './design-panel.js';

// Global variable to track selected element
let selectedElement = null;

/**
 * Selects an element for editing.
 * GEMINI FIX: This function provides the missing connection between element selection and design panel.
 * @param {HTMLElement} element - The element to select.
 */
export function selectElement(element) {
    if (selectedElement) {
        selectedElement.classList.remove('selected');
        // Hide controls when deselecting
        const oldControls = selectedElement.querySelector('.element-controls');
        if (oldControls) {
            oldControls.style.display = 'none';
        }
    }

    selectedElement = element;
    if (selectedElement) {
        selectedElement.classList.add('selected');
        // Show controls for the newly selected element
        let controls = selectedElement.querySelector('.element-controls');
        if (!controls) {
            controls = createControls();
            selectedElement.appendChild(controls);
        }
        controls.style.display = 'flex';

        // GEMINI FIX: Load the design panel for the selected component.
        const componentId = selectedElement.getAttribute('data-component-id');
        if (componentId) {
            designPanel.load(componentId);
            console.log(`🎯 Component selected: ${componentId} - Design panel should open`);
        } else {
            console.warn('⚠️ Selected element has no data-component-id attribute');
        }
    } else {
        // If nothing is selected, hide the panel
        designPanel.hide();
    }
}

/**
 * Creates control buttons for selected elements
 * @returns {HTMLElement} Controls element
 */
function createControls() {
    const controls = document.createElement('div');
    controls.className = 'element-controls';
    controls.innerHTML = `
        <button class="control-btn" title="Move Up">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
        </button>
        <button class="control-btn" title="Move Down">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        </button>
        <button class="control-btn" title="Duplicate">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
        </button>
        <button class="control-btn" title="Delete">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
        </button>
    `;
    return controls;
}

class ElementEditor {
    constructor() {
        this.previewContainer = document.getElementById('media-kit-preview');
        this.isEditing = false;
        this.boundHandleBlur = null;

        this.init();
    }

    init() {
        // Handle inline editing
        this.previewContainer.addEventListener('input', debounce(e => {
            if (e.target.isContentEditable) {
                this.handleInput(e);
            }
        }, 300));
        
        // GEMINI FIX: Handle element selection clicks
        this.previewContainer.addEventListener('click', (e) => {
            // Only handle clicks that are not on control buttons
            if (e.target.closest('.control-btn')) {
                return; // Let element-controls.js handle this
            }
            
            // Find the clicked component
            const componentElement = e.target.closest('[data-component-id]');
            if (componentElement) {
                e.stopPropagation();
                selectElement(componentElement);
            } else {
                // Clicked on empty area, deselect
                selectElement(null);
            }
        });
        
        console.log('🎯 Element editor initialized with selection handling');
    }

    handleInput(e) {
        const element = e.target;
        const componentElement = element.closest('[data-component-id]');
        if (!componentElement) return;

        const componentId = componentElement.dataset.componentId;
        const propName = element.dataset.prop;

        if (componentId && propName) {
            const newProps = {};
            newProps[propName] = element.innerHTML; // Use innerHTML to preserve formatting
            
            // FIX: Use the state object's updateComponent method
            state.updateComponent(componentId, newProps);
        }
    }
}

/**
 * Gets the currently selected element
 * @returns {HTMLElement|null} The selected element
 */
export function getSelectedElement() {
    return selectedElement;
}

/**
 * Deselects the currently selected element
 */
export function deselectElement() {
    selectElement(null);
}

export const elementEditor = new ElementEditor();
