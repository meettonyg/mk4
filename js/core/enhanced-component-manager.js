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
            // GEMINI FIX: Enhanced control action handling with performance tracking
            const actionPerfEnd = performanceMonitor.start(`control-${action.toLowerCase().replace(' ', '-')}`, { componentId });
            
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
                    actionPerfEnd();
                    return; // Exit early for unknown actions
            }
            
            actionPerfEnd();
            this.logger.info('CONTROL', `Successfully executed ${action}`, { componentId });
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
     * Updates a component's properties in the state.
     * GEMINI FIX: Enhanced updateComponent method required by design panel.
     * @param {string} componentId - The ID of the component to update.
     * @param {object} newProps - The new properties to apply to the component.
     */
    updateComponent(componentId, newProps) {
        // Ensure component manager is initialized
        if (!this.ensureInitialized()) {
            this.logger.warn('COMPONENT', 'Cannot update component, DOM not ready', { componentId });
            throw new Error('Component manager not initialized');
        }
        
        try {
            this.logger.info('COMPONENT', `Updating component ${componentId}`, newProps);
            
            // Get the current component from state
            const currentComponent = enhancedStateManager.getComponent(componentId);
            
            if (!currentComponent) {
                this.logger.warn('COMPONENT', 'Cannot update - component not found', { componentId });
                throw new Error(`Component ${componentId} not found in state`);
            }
            
            // GEMINI FIX: Use the enhanced state manager's updateComponent method directly
            // This method expects componentId and newProps, not a full component object
            enhancedStateManager.updateComponent(componentId, newProps);
            
            this.logger.info('COMPONENT', `Successfully updated component ${componentId}`, {
                updatedProps: Object.keys(newProps)
            });
            
            return true;
            
        } catch (error) {
            this.logger.error('COMPONENT', `Failed to update component ${componentId}`, error, {
                newProps,
                hasComponent: !!enhancedStateManager.getComponent(componentId)
            });
            throw error;
        }
    }

    /**
     * Opens edit panel for component
     * @param {string} componentId - The ID of the component to edit
     */
    editComponent(componentId) {
        this.logger.info('CONTROL', 'Edit action triggered', { componentId });
        
        try {
            // GEMINI FIX: Emit event to open design panel
            if (window.eventBus && typeof window.eventBus.emit === 'function') {
                window.eventBus.emit('ui:open-design-panel', {
                    componentId,
                    component: enhancedStateManager.getComponent(componentId)
                });
            } else {
                // Fallback to direct method call if event bus not available
                if (window.designPanel && typeof window.designPanel.open === 'function') {
                    window.designPanel.open(componentId);
                } else {
                    this.logger.warn('CONTROL', 'Design panel system not available', { componentId });
                }
            }
        } catch (error) {
            this.logger.error('CONTROL', 'Failed to open edit panel', error, { componentId });
        }
    }
    
    /**
     * GEMINI FIX: Get component manager status for debugging
     * @returns {object} Status information
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            hasPreviewContainer: !!this.previewContainer,
            previewContainerId: this.previewContainer?.id || null,
            componentCount: Object.keys(enhancedStateManager.getState().components || {}).length,
            methods: {
                addComponent: typeof this.addComponent === 'function',
                updateComponent: typeof this.updateComponent === 'function',
                removeComponent: typeof this.removeComponent === 'function',
                duplicateComponent: typeof this.duplicateComponent === 'function'
            }
        };
    }
    
    /**
     * GEMINI FIX: Manual initialization retry for debugging
     * @returns {boolean} True if successful
     */
    forceInitialization() {
        this.isInitialized = false;
        return this.init();
    }
}

export const enhancedComponentManager = new EnhancedComponentManager();
