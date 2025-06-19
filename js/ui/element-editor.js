/**
 * @file element-editor.js
 * @description Manages inline editing of component properties directly in the preview.
 *
 * This version is updated to correctly import the 'state' object and use its methods,
 * resolving module import errors.
 */
import {
    state
} from '../state.js';
import {
    debounce
} from '../utils/helpers.js';

class ElementEditor {
    constructor() {
        this.previewContainer = document.getElementById('media-kit-preview');
        this.isEditing = false;
        this.boundHandleBlur = null;

        this.init();
    }

    init() {
        this.previewContainer.addEventListener('input', debounce(e => {
            if (e.target.isContentEditable) {
                this.handleInput(e);
            }
        }, 300));
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

export const elementEditor = new ElementEditor();
