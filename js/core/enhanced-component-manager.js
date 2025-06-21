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
        this.previewContainer = null; // Will be set when DOM is ready
        this.isInitialized = false;
        console.log('EnhancedComponentManager created (DOM-independent)');
    }

    /**
     * Initialize the component manager - call this when DOM is ready
     * This method is safe to call multiple times
     */
    init() {
        if (this.isInitialized) {
            return; // Already initialized
        }
        
        // Find preview container when we actually need it
        this.previewContainer = document.getElementById('media-kit-preview');
        
        if (!this.previewContainer) {
            console.warn('EnhancedComponentManager: media-kit-preview not found, will retry on first use');
            return false;
        }
        
        // Set up event listeners
        this.previewContainer.addEventListener('click', this.handleControls.bind(this));
        this.isInitialized = true;
        
        console.log('EnhancedComponentManager initialized successfully');
        return true;
    }
    
    /**
     * Ensures the component manager is initialized before use
     * @returns {boolean} True if ready, false if DOM not available
     */
    ensureInitialized() {
        if (this.isInitialized) {
            return true;
        }
        
        return this.init();
    }

    /**
     * Handles clicks on component control buttons (delete, duplicate, etc.).
     * @param {Event} e - The click event.
     */
    handleControls(e) {
        // Ensure we're initialized before handling events
        if (!this.ensureInitialized()) {
            console.warn('EnhancedComponentManager: Cannot handle controls, DOM not ready');
            return;
        }
        
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
        // Ensure component manager is initialized (but don't require DOM for state operations)
        this.ensureInitialized();
        
        console.log(`EnhancedComponentManager: Adding component ${componentType}`, props);
        
        const newComponent = {
            id: generateUniqueId(componentType),
            type: componentType,
            props: props,
        };
        
        try {
            enhancedStateManager.addComponent(newComponent);
            console.log(`EnhancedComponentManager: Successfully added component ${componentType} with ID ${newComponent.id}`);
        } catch (error) {
            console.error(`EnhancedComponentManager: Failed to add component ${componentType}:`, error);
            throw error;
        }
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
