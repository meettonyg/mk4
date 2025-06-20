/**
 * @file component-manager.js
 * @description This file contains the ComponentManager class, which is responsible for managing components
 * in the media kit builder. It handles adding, removing, and updating components, as well as managing their state.
 *
 * Phase 3 Update: Migrated to use enhancedStateManager instead of legacy state.js.
 */
import {
    dynamicComponentLoader
} from './dynamic-component-loader.js';
import {
    enhancedStateManager
} from '../core/enhanced-state-manager.js';
import {
    eventBus
} from '../core/event-bus.js';
import {
    structuredLogger
} from '../utils/structured-logger.js';
import {
    showToast
} from '../utils/toast-polyfill.js';
import {
    generateUniqueId
} from '../utils/helpers.js';
import {
    designPanel
} from '../ui/design-panel.js';
import {
    performanceMonitor
} from '../utils/performance-monitor.js';


/**
 * Manages components in the media kit builder.
 * @class ComponentManager
 */
class ComponentManager {
    constructor() {
        this.previewContainer = document.getElementById('media-kit-preview');
        this.logger = structuredLogger;
        
        this.logger.info('COMPONENT', 'Component manager initialized');
    }

    /**
     * Adds a new component to the media kit.
     * @param {string} componentType - The type of component to add.
     * @param {object} props - The initial properties for the component.
     * @param {boolean} skipRender - If true, skips rendering the component.
     */
    async addComponent(componentType, props = {}, skipRender = false) {
        const perfEnd = performanceMonitor.start('component-add', { type: componentType });
        
        try {
            const newComponent = {
                id: generateUniqueId(componentType),
                type: componentType,
                props: props,
            };

            // Use enhanced state manager
            enhancedStateManager.addComponent(newComponent);

            if (!skipRender) {
                await this.renderComponent(newComponent.id);
            }

            perfEnd();
            
            this.logger.info('COMPONENT', `Component added: ${componentType}`, {
                id: newComponent.id,
                skipRender
            });
            
            showToast(`Component "${componentType}" added.`);
            
            // Emit event
            eventBus.emit('component:added', {
                componentId: newComponent.id,
                componentType,
                props
            });
            
            return newComponent.id;
            
        } catch (error) {
            perfEnd();
            this.logger.error('COMPONENT', `Failed to add component: ${componentType}`, error);
            showToast(`Error adding component: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Renders a single component into the preview container.
     * @param {string} componentId - The ID of the component to render.
     */
    async renderComponent(componentId) {
        const perfEnd = performanceMonitor.start('component-render', { componentId });
        
        try {
            const component = enhancedStateManager.getComponent(componentId);
            if (!component) {
                this.logger.error('COMPONENT', `Component with id ${componentId} not found`);
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
                
                perfEnd();
                
                this.logger.debug('COMPONENT', `Component rendered: ${componentId}`);
                
                // Emit event
                eventBus.emit('component:rendered', {
                    componentId,
                    element: newElement
                });
            } else {
                throw new Error('Failed to create component element');
            }
            
        } catch (error) {
            perfEnd();
            this.logger.error('COMPONENT', `Failed to render component: ${componentId}`, error);
            throw error;
        }
    }

    /**
     * Removes a component from the media kit.
     * @param {string} componentId - The ID of the component to remove.
     */
    removeComponent(componentId) {
        const perfEnd = performanceMonitor.start('component-remove', { componentId });
        
        try {
            const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
            if (componentElement) {
                componentElement.remove();
                
                // Use enhanced state manager
                enhancedStateManager.removeComponent(componentId);
                
                perfEnd();
                
                this.logger.info('COMPONENT', `Component removed: ${componentId}`);
                showToast('Component removed.');
                
                // Emit event
                eventBus.emit('component:removed', {
                    componentId
                });
            } else {
                this.logger.warn('COMPONENT', `Component element not found for removal: ${componentId}`);
            }
        } catch (error) {
            perfEnd();
            this.logger.error('COMPONENT', `Failed to remove component: ${componentId}`, error);
            showToast(`Error removing component: ${error.message}`, 'error');
        }
    }

    /**
     * Updates a component's properties and re-renders it.
     * @param {string} componentId - The ID of the component to update.
     * @param {object} newProps - The new properties to apply.
     */
    async updateComponent(componentId, newProps) {
        const perfEnd = performanceMonitor.start('component-update', { componentId });
        
        try {
            // Use enhanced state manager
            enhancedStateManager.updateComponent(componentId, newProps);

            const oldElement = document.querySelector(`[data-component-id="${componentId}"]`);
            if (oldElement) {
                const component = enhancedStateManager.getComponent(componentId);
                
                // FIX: Use the dynamicComponentLoader object and pass a single options object.
                const newElement = await dynamicComponentLoader.renderComponent({
                    type: component.type,
                    id: component.id,
                    props: component.props
                });

                if (newElement) {
                    oldElement.replaceWith(newElement);
                    this.attachEventListeners(newElement);
                    
                    perfEnd();
                    
                    this.logger.debug('COMPONENT', `Component updated: ${componentId}`, { newProps });
                    
                    // Emit event
                    eventBus.emit('component:updated', {
                        componentId,
                        newProps,
                        element: newElement
                    });
                } else {
                    throw new Error('Failed to create updated component element');
                }
            } else {
                this.logger.warn('COMPONENT', `Component element not found for update: ${componentId}`);
            }
        } catch (error) {
            perfEnd();
            this.logger.error('COMPONENT', `Failed to update component: ${componentId}`, error);
            showToast(`Error updating component: ${error.message}`, 'error');
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
