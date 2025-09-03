/**
 * Component Lifecycle Base Class
 * PHASE 1: Component Communication Redesign - Lifecycle Standard
 * 
 * Base class that ALL component editors must extend to ensure
 * consistent event-driven communication and proper lifecycle management
 * 
 * @version 1.0.0
 * @package GMKB/Core
 * 
 * ARCHITECTURAL PRINCIPLES:
 * - Event-driven initialization (no polling)
 * - Standardized lifecycle events
 * - Clear DOM ownership boundaries
 * - Root cause fixes, not patches
 */

(function(window) {
    'use strict';
    
    const logger = window.structuredLogger || console;
    
    /**
     * Standard lifecycle events that all components must emit
     */
    const LIFECYCLE_EVENTS = {
        RENDERING: 'component:rendering',       // Before render starts
        DOM_READY: 'component:dom-ready',       // DOM elements created
        EDITOR_READY: 'component:editor-ready', // Editor fully initialized
        DATA_CHANGED: 'component:data-changed', // Data modified
        DESTROYED: 'component:destroyed'        // Component removed
    };
    
    /**
     * ComponentLifecycle Base Class
     * All component editors MUST extend this class
     */
    class ComponentLifecycle {
        constructor(containerEl, componentId, componentType, initialData) {
            // Validate required parameters
            if (!containerEl) {
                throw new Error('ComponentLifecycle: containerEl is required');
            }
            if (!componentId) {
                throw new Error('ComponentLifecycle: componentId is required');
            }
            if (!componentType) {
                throw new Error('ComponentLifecycle: componentType is required');
            }
            
            // Core properties
            this.container = containerEl;
            this.componentId = componentId;
            this.componentType = componentType;
            this.data = initialData || {};
            
            // Lifecycle state
            this.isRendered = false;
            this.isReady = false;
            this.isDestroyed = false;
            
            // Event tracking
            this._eventListeners = new Map();
            
            logger.info('LIFECYCLE', `${componentType} component ${componentId} constructed`);
        }
        
        /**
         * Emit a lifecycle event with proper error handling
         */
        emitLifecycleEvent(eventType, detail = {}) {
            if (this.isDestroyed && eventType !== LIFECYCLE_EVENTS.DESTROYED) {
                logger.warn('LIFECYCLE', `Attempted to emit ${eventType} on destroyed component ${this.componentId}`);
                return;
            }
            
            const eventDetail = {
                componentId: this.componentId,
                componentType: this.componentType,
                timestamp: Date.now(),
                ...detail
            };
            
            // Dispatch the event
            document.dispatchEvent(new CustomEvent(eventType, {
                detail: eventDetail,
                bubbles: true
            }));
            
            logger.debug('LIFECYCLE', `${this.componentType} emitted ${eventType}`, eventDetail);
        }
        
        /**
         * Render the component (must be implemented by subclasses)
         */
        async render() {
            throw new Error(`${this.componentType} component must implement render() method`);
        }
        
        /**
         * Standard rendering wrapper that emits proper lifecycle events
         */
        async performRender() {
            if (this.isDestroyed) {
                logger.warn('LIFECYCLE', `Cannot render destroyed component ${this.componentId}`);
                return;
            }
            
            try {
                // Emit rendering event
                this.emitLifecycleEvent(LIFECYCLE_EVENTS.RENDERING);
                
                // Call the subclass render implementation
                await this.render();
                
                this.isRendered = true;
                
                // Emit DOM ready event
                this.emitLifecycleEvent(LIFECYCLE_EVENTS.DOM_READY, {
                    container: this.container
                });
                
                // Set up event listeners if needed
                this.attachEventListeners();
                
                // Mark as ready and emit event
                this.isReady = true;
                this.emitLifecycleEvent(LIFECYCLE_EVENTS.EDITOR_READY, {
                    container: this.container,
                    data: this.data
                });
                
            } catch (error) {
                logger.error('LIFECYCLE', `Error rendering ${this.componentType}:`, error);
                throw error;
            }
        }
        
        /**
         * Update component data with proper event emission
         */
        updateData(newData, skipEvents = false) {
            if (this.isDestroyed) {
                logger.warn('LIFECYCLE', `Cannot update destroyed component ${this.componentId}`);
                return;
            }
            
            const oldData = { ...this.data };
            this.data = { ...this.data, ...newData };
            
            if (!skipEvents) {
                this.emitLifecycleEvent(LIFECYCLE_EVENTS.DATA_CHANGED, {
                    oldData,
                    newData: this.data,
                    changes: newData
                });
            }
            
            logger.debug('LIFECYCLE', `${this.componentType} data updated`, newData);
        }
        
        /**
         * Attach event listeners (can be overridden by subclasses)
         */
        attachEventListeners() {
            // Subclasses can override this to add their own listeners
            // but should call super.attachEventListeners() first
        }
        
        /**
         * Clean up event listeners
         */
        detachEventListeners() {
            // Remove all tracked event listeners
            this._eventListeners.forEach((handler, key) => {
                const [element, eventType] = key.split(':');
                const el = element === 'document' ? document : 
                          element === 'window' ? window : 
                          document.querySelector(element);
                if (el) {
                    el.removeEventListener(eventType, handler);
                }
            });
            this._eventListeners.clear();
        }
        
        /**
         * Helper to add an event listener with tracking
         */
        addEventListener(element, eventType, handler, options) {
            const key = `${typeof element === 'string' ? element : element.id || 'element'}:${eventType}`;
            
            // Remove existing listener if any
            if (this._eventListeners.has(key)) {
                this.removeEventListener(element, eventType);
            }
            
            // Add new listener
            const el = typeof element === 'string' ? document.querySelector(element) : element;
            if (el) {
                el.addEventListener(eventType, handler, options);
                this._eventListeners.set(key, handler);
            }
        }
        
        /**
         * Helper to remove an event listener
         */
        removeEventListener(element, eventType) {
            const key = `${typeof element === 'string' ? element : element.id || 'element'}:${eventType}`;
            const handler = this._eventListeners.get(key);
            
            if (handler) {
                const el = typeof element === 'string' ? document.querySelector(element) : element;
                if (el) {
                    el.removeEventListener(eventType, handler);
                }
                this._eventListeners.delete(key);
            }
        }
        
        /**
         * Destroy the component and clean up
         */
        destroy() {
            if (this.isDestroyed) {
                logger.warn('LIFECYCLE', `Component ${this.componentId} already destroyed`);
                return;
            }
            
            // Emit destroyed event first
            this.emitLifecycleEvent(LIFECYCLE_EVENTS.DESTROYED);
            
            // Clean up event listeners
            this.detachEventListeners();
            
            // Clear container
            if (this.container) {
                this.container.innerHTML = '';
            }
            
            // Mark as destroyed
            this.isDestroyed = true;
            this.isReady = false;
            this.isRendered = false;
            
            logger.info('LIFECYCLE', `${this.componentType} component ${this.componentId} destroyed`);
        }
        
        /**
         * Check if component is ready
         */
        isComponentReady() {
            return this.isReady && !this.isDestroyed;
        }
        
        /**
         * Get current data
         */
        getData() {
            return { ...this.data };
        }
        
        /**
         * Get lifecycle state
         */
        getLifecycleState() {
            return {
                isRendered: this.isRendered,
                isReady: this.isReady,
                isDestroyed: this.isDestroyed
            };
        }
    }
    
    // Export lifecycle events for external use
    ComponentLifecycle.EVENTS = LIFECYCLE_EVENTS;
    
    // Make available globally
    window.ComponentLifecycle = ComponentLifecycle;
    window.COMPONENT_LIFECYCLE_EVENTS = LIFECYCLE_EVENTS;
    
    // Log successful load
    logger.info('LIFECYCLE', 'Component Lifecycle Base Class loaded');
    
})(window);
