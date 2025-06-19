/**
 * @file enhanced-component-manager.js
 * @description Manages component interactions and state updates using the enhanced state manager.
 * This class acts as a bridge between user actions on components (like delete, duplicate) and
 * the centralized state management system.
 *
 * This version includes a fix for the import statement of the enhancedStateManager,
 * changing it from a default to a named import to resolve module loading errors.
 */

// FIX: Changed the import from a default to a named import to match the export in enhanced-state-manager.js
import {
    enhancedStateManager
} from './enhanced-state-manager.js';
import {
    generateUniqueId
} from '../utils/helpers.js';
import {
    performanceMonitor
} from '../utils/performance-monitor.js';

class EnhancedComponentManager {
    constructor() {
        this.previewContainer = document.getElementById('media-kit-preview');
        this.init();
        console.log('EnhancedComponentManager initialized');
    }

    init() {
        this.previewContainer.addEventListener('click', this.handleControls.bind(this));
    }

    /**
     * Handles clicks on component control buttons (delete, duplicate, etc.).
     * @param {Event} e - The click event.
     */
    handleControls(e) {
        const controlButton = e.target.closest('.control-btn');
        if (!controlButton) return;

        const componentElement = e.target.closest('[data-component-id]');
        if (!componentElement) return;

        const componentId = componentElement.dataset.componentId;
        const action = controlButton.title;

        console.log(`Control action: ${action} on component: ${componentId}`);
        performanceMonitor.log('control-action', {
            action,
            componentId
        });

        switch (action) {
            case 'Delete':
                this.removeComponent(componentId);
                break;
            case 'Duplicate':
                this.duplicateComponent(componentId);
                break;
                // Add cases for 'Move Up' and 'Move Down' if needed
        }
    }

    /**
     * Adds a new component to the state.
     * @param {string} componentType - The type of the component to add.
     * @param {object} props - The initial properties for the new component.
     */
    addComponent(componentType, props = {}) {
        const newComponent = {
            id: generateUniqueId(componentType),
            type: componentType,
            props: props,
        };
        enhancedStateManager.addComponent(newComponent);
    }

    /**
     * Removes a component from the state.
     * @param {string} componentId - The ID of the component to remove.
     */
    removeComponent(componentId) {
        enhancedStateManager.removeComponent(componentId);
    }

    /**
     * Duplicates an existing component.
     * @param {string} componentId - The ID of the component to duplicate.
     */
    duplicateComponent(componentId) {
        const originalComponent = enhancedStateManager.getComponent(componentId);
        if (originalComponent) {
            const newComponent = {
                ...originalComponent,
                id: generateUniqueId(originalComponent.type),
                props: { ...originalComponent.props
                }, // Deep copy props
            };
            enhancedStateManager.addComponent(newComponent);
        }
    }
}

export const enhancedComponentManager = new EnhancedComponentManager();
