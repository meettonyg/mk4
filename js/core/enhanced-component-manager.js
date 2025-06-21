/**
 * @file enhanced-component-manager.js
 * @description Manages component-related actions like adding, removing, and handling UI controls.
 * It acts as an intermediary between the UI and the state manager for component operations.
 */

import {
    enhancedStateManager
} from './enhanced-state-manager.js';
import {
    structuredLogger
} from '../utils/structured-logger.js';
import {
    performanceMonitor
} from '../utils/performance-monitor.js';
import {
    generateUniqueId
} from '../utils/helpers.js';

class EnhancedComponentManager {
    constructor() {
        this.logger = structuredLogger;
        this.previewContainer = null;
        this.isInitialized = false;
        this.logger.info('INIT', 'Enhanced Component Manager created');
    }

    /**
     * Initialize the component manager - call this when DOM is ready
     * This method is safe to call multiple times
     */
    init() {
        if (this.isInitialized) {
            return true; // Already initialized
        }
        
        // Find the preview container - there is only one correct element
        this.previewContainer = document.getElementById('media-kit-preview');
        
        if (!this.previewContainer) {
            this.logger.warn('INIT', 'media-kit-preview element not found, initialization deferred');
            return false;
        }
        
        // Set up event listeners
        this.setupEventListeners();
        this.isInitialized = true;
        
        this.logger.info('INIT', 'Enhanced Component Manager initialized successfully');
        return true;
    }
    
    /**
     * Setup event listeners for component controls
     */
    setupEventListeners() {
        this.previewContainer.addEventListener('click', this.handleControls.bind(this));
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
     * Get component and action from event
     */
    getComponentAndAction(event) {
        const controlButton = event.target.closest('.control-btn');
        const componentElement = controlButton?.closest('[data-component-id]');
        const componentId = componentElement?.dataset.componentId;
        const action = controlButton?.title;
        return { componentId, action };
    }

    /**
     * Handles clicks on component control buttons (delete, duplicate, etc.).
     * @param {Event} event - The click event.
     */
    handleControls(event) {
        // Ensure we're initialized before handling events
        if (!this.ensureInitialized()) {
            this.logger.warn('CONTROL', 'Cannot handle controls, DOM not ready');
            return;
        }
        
        const { componentId, action } = this.getComponentAndAction(event);
        if (!componentId || !action) return;

        const perfEnd = performanceMonitor.start('control-action', {
            action,
            componentId
        });
        this.logger.info('CONTROL', `Action: ${action}`, { componentId });

        try {
            switch (action) {
                case 'Delete':
                    this.removeComponent(componentId);
                    break;
                case 'Duplicate':
                    this.duplicateComponent(componentId);
                    break;
                case 'Move Up':
                    enhancedStateManager.moveComponent(componentId, 'up');
                    break;
                case 'Move Down':
                    enhancedStateManager.moveComponent(componentId, 'down');
                    break;
                case 'Edit':
                    this.editComponent(componentId);
                    break;
                default:
                    this.logger.warn('CONTROL', `Unknown control action: ${action}`, { componentId });
            }
        } catch (error) {
            this.logger.error('CONTROL', `Failed to execute control action: ${action}`, error, { componentId });
        } finally {
            perfEnd();
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
        
        this.logger.info('COMPONENT', `Adding component ${componentType}`, props);
        
        const newComponent = {
            id: generateUniqueId(componentType),
            type: componentType,
            props: props,
        };
        
        try {
            enhancedStateManager.addComponent(newComponent);
            this.logger.info('COMPONENT', `Successfully added component ${componentType}`, { id: newComponent.id });
        } catch (error) {
            this.logger.error('COMPONENT', `Failed to add component ${componentType}`, error);
            throw error;
        }
    }

    /**
     * Removes a component from the state.
     * @param {string} componentId - The ID of the component to remove.
     */
    removeComponent(componentId) {
        try {
            enhancedStateManager.removeComponent(componentId);
            this.logger.info('COMPONENT', 'Component removed', { componentId });
        } catch (error) {
            this.logger.error('COMPONENT', 'Failed to remove component', error, { componentId });
        }
    }

    /**
     * Duplicates an existing component.
     * @param {string} componentId - The ID of the component to duplicate.
     */
    duplicateComponent(componentId) {
        try {
            const originalComponent = enhancedStateManager.getComponent(componentId);
            if (originalComponent) {
                const newComponent = {
                    ...originalComponent,
                    id: generateUniqueId(originalComponent.type),
                    props: { ...originalComponent.props }, // Deep copy props
                };
                enhancedStateManager.addComponent(newComponent);
                this.logger.info('COMPONENT', 'Component duplicated', { 
                    originalId: componentId, 
                    newId: newComponent.id 
                });
            } else {
                this.logger.warn('COMPONENT', 'Cannot duplicate - component not found', { componentId });
            }
        } catch (error) {
            this.logger.error('COMPONENT', 'Failed to duplicate component', error, { componentId });
        }
    }

    /**
     * Opens edit panel for component
     * @param {string} componentId - The ID of the component to edit
     */
    editComponent(componentId) {
        this.logger.info('CONTROL', 'Edit action triggered', { componentId });
        // TODO: Implement edit panel opening logic
        // This would typically emit an event or call a method to open the design panel
    }
}

export const enhancedComponentManager = new EnhancedComponentManager();
