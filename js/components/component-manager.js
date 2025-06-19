/**
 * @file component-manager.js
 * @description This file contains the ComponentManager class, which is responsible for managing components
 * in the media kit builder. It handles adding, removing, and updating components, as well as managing their state.
 *
 * This version has been updated to work with the new DynamicComponentLoader, resolving module import errors.
 */
import {
    dynamicComponentLoader
} from './dynamic-component-loader.js';
import {
    state
} from '../state.js';
import {
    showToast
} from '../utils/toast-polyfill.js';
import {
    generateUniqueId
} from '../utils/helpers.js';
import {
    designPanel
} from '../ui/design-panel.js';


/**
 * Manages components in the media kit builder.
 * @class ComponentManager
 */
class ComponentManager {
    constructor() {
        this.previewContainer = document.getElementById('media-kit-preview');
    }

    /**
     * Adds a new component to the media kit.
     * @param {string} componentType - The type of component to add.
     * @param {object} props - The initial properties for the component.
     * @param {boolean} skipRender - If true, skips rendering the component.
     */
    async addComponent(componentType, props = {}, skipRender = false) {
        const newComponent = {
            id: generateUniqueId(componentType),
            type: componentType,
            props: props,
        };

        state.addComponent(newComponent);

        if (!skipRender) {
            await this.renderComponent(newComponent.id);
        }

        showToast(`Component "${componentType}" added.`);
        return newComponent.id;
    }

    /**
     * Renders a single component into the preview container.
     * @param {string} componentId - The ID of the component to render.
     */
    async renderComponent(componentId) {
        const component = state.getComponent(componentId);
        if (!component) {
            console.error(`Component with id ${componentId} not found`);
            return;
        }

        // FIX: Use the dynamicComponentLoader object and pass a single options object.
        const newElement = await dynamicComponentLoader.renderComponent({
            type: component.type,
            id: component.id,
            props: component.props
        });

        if (newElement) {
            this.previewContainer.appendChild(newElement);
            this.attachEventListeners(newElement);
        }
    }

    /**
     * Removes a component from the media kit.
     * @param {string} componentId - The ID of the component to remove.
     */
    removeComponent(componentId) {
        const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
        if (componentElement) {
            componentElement.remove();
            state.removeComponent(componentId);
            showToast('Component removed.');
        }
    }

    /**
     * Updates a component's properties and re-renders it.
     * @param {string} componentId - The ID of the component to update.
     * @param {object} newProps - The new properties to apply.
     */
    async updateComponent(componentId, newProps) {
        state.updateComponent(componentId, newProps);

        const oldElement = document.querySelector(`[data-component-id="${componentId}"]`);
        if (oldElement) {
            const component = state.getComponent(componentId);
            // FIX: Use the dynamicComponentLoader object and pass a single options object.
            const newElement = await dynamicComponentLoader.renderComponent({
                type: component.type,
                id: component.id,
                props: component.props
            });

            if (newElement) {
                oldElement.replaceWith(newElement);
                this.attachEventListeners(newElement);
            }
        }
    }

    /**
     * Attaches event listeners to component controls.
     * @param {HTMLElement} componentElement - The component element.
     */
    attachEventListeners(componentElement) {
        const componentId = componentElement.dataset.componentId;

        // Edit listener
        componentElement.addEventListener('click', (e) => {
            if (!e.target.closest('.element-controls')) {
                designPanel.load(componentId);
            }
        });


        const controls = componentElement.querySelector('.element-controls');
        if (controls) {
            controls.addEventListener('click', (e) => {
                const button = e.target.closest('button');
                if (!button) return;

                if (button.title === 'Delete') {
                    this.removeComponent(componentId);
                }
                // Add other control handlers here (move, duplicate)
            });
        }
    }
}

export const componentManager = new ComponentManager();
