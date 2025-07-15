/**
 * @file enhanced-component-manager.js
 * @description GEMINI'S ARCHITECTURAL SOLUTION: Event-Driven Enhanced Component Manager
 * @version 2.0.0 - GEMINI ARCHITECTURE
 * 
 * GEMINI'S ARCHITECTURAL IMPROVEMENTS:
 * ✅ Registers with GMKB System Initializer
 * ✅ Uses GMKB event system for communication
 * ✅ Event-driven initialization sequence
 * ✅ Cross-panel communication through events
 * ✅ WordPress-compatible IIFE format
 */

// GEMINI ARCHITECTURE: WordPress-compatible IIFE wrapper
(function() {
    'use strict';
    
    // GEMINI ARCHITECTURE: Create fallback utilities if imports not available
    const enhancedStateManager = window.enhancedStateManager || {
        getState: () => ({ components: {}, layout: [] }),
        addComponent: () => {},
        removeComponent: () => {},
        updateComponent: () => {},
        moveComponent: () => {},
        subscribeGlobal: () => () => {},
        getComponent: () => null
    };
    
    const structuredLogger = window.structuredLogger || {
        info: console.log,
        warn: console.warn,
        error: console.error,
        debug: console.debug
    };
    
    const performanceMonitor = window.performanceMonitor || {
        start: () => () => {}
    };
    
    const generateUniqueId = window.generateUniqueId || function(prefix = 'component') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };
    
    const mkcgDataMapper = window.mkcgDataMapper || {
        mapDataToComponent: () => null,
        canAutoPopulate: () => false,
        getAutoPopulatableComponentsEnhanced: () => []
    };

class EnhancedComponentManager {
    constructor() {
        this.logger = structuredLogger;
        this.previewContainer = null;
        this.isInitialized = false;
        
        // GEMINI ARCHITECTURE: Use GMKB event system
        this.eventBus = window.GMKB || {
            dispatch: (event, data) => {
                // Fallback to DOM events if GMKB not available
                document.dispatchEvent(new CustomEvent(event, { detail: data }));
            },
            subscribe: () => {},
            unsubscribe: () => {}
        };
        
        // GEMINI ARCHITECTURE: Component tracking for event coordination
        this.componentTracker = {
            activeComponents: new Map(),
            topicsComponents: new Set(),
            lastEventTime: null,
            eventQueue: [],
            isProcessingEvents: false
        };
        
        // GEMINI ARCHITECTURE: Event debouncing for performance
        this.eventDebounceTimers = new Map();
        this.eventDebounceDelay = 150;
        
        this.logger.info('INIT', 'Enhanced Component Manager created with GMKB event system');
    }

    /**
     * GEMINI ARCHITECTURE: Debounced event emission to prevent flooding
     */
    emitDebouncedEvent(eventKey, eventName, eventPayload, delay = null) {
        const debounceDelay = delay || this.eventDebounceDelay;
        
        // Clear existing timer
        if (this.eventDebounceTimers.has(eventKey)) {
            clearTimeout(this.eventDebounceTimers.get(eventKey));
        }
        
        // Set new timer
        const timer = setTimeout(() => {
            try {
                this.eventBus.dispatch(eventName, eventPayload);
                this.logger.debug('EVENT', `Debounced event emitted via GMKB: ${eventName}`, eventPayload);
            } catch (error) {
                this.logger.error('EVENT', `Error emitting debounced event via GMKB: ${eventName}`, error);
            } finally {
                this.eventDebounceTimers.delete(eventKey);
            }
        }, debounceDelay);
        
        this.eventDebounceTimers.set(eventKey, timer);
    }
    
    /**
     * GEMINI ARCHITECTURE: Get component event tracking statistics
     */
    getEventTrackingStats() {
        return {
            activeComponents: this.componentTracker.activeComponents.size,
            topicsComponents: this.componentTracker.topicsComponents.size,
            lastEventTime: this.componentTracker.lastEventTime,
            pendingEvents: this.eventDebounceTimers.size,
            eventQueueSize: this.componentTracker.eventQueue.length,
            isProcessingEvents: this.componentTracker.isProcessingEvents
        };
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
     * GEMINI ARCHITECTURE: Component event emission system
     * Emits component lifecycle events for cross-panel communication
     */
    emitComponentEvent(eventType, componentData, additionalData = {}) {
        const timestamp = Date.now();
        const eventPayload = {
            type: eventType,
            component: componentData,
            timestamp,
            source: 'enhanced-component-manager',
            ...additionalData
        };
        
        try {
            // Emit general component event using GMKB
            this.eventBus.dispatch(`components:${eventType}`, eventPayload);
            
            // Emit component-type-specific event if component has type
            if (componentData && componentData.type) {
                this.eventBus.dispatch(`components:${componentData.type}:${eventType}`, eventPayload);
                
                // GEMINI ARCHITECTURE: Special handling for topics components
                if (componentData.type === 'topics') {
                    this.handleTopicsComponentEvent(eventType, componentData, eventPayload);
                }
            }
            
            // Update component tracking
            this.updateComponentTracking(eventType, componentData);
            
            this.logger.debug('EVENT', `Component event emitted via GMKB: ${eventType}`, {
                componentId: componentData?.id,
                componentType: componentData?.type,
                timestamp
            });
            
        } catch (error) {
            this.logger.error('EVENT', 'Failed to emit component event via GMKB', error, {
                eventType,
                componentId: componentData?.id
            });
        }
    }
    
    /**
     * GEMINI ARCHITECTURE: Topics-specific event handling for counter synchronization
     */
    handleTopicsComponentEvent(eventType, componentData, eventPayload) {
        try {
            // Track topics components
            if (eventType === 'added') {
                this.componentTracker.topicsComponents.add(componentData.id);
            } else if (eventType === 'removed') {
                this.componentTracker.topicsComponents.delete(componentData.id);
            }
            
            // Calculate current topics count
            const topicsCount = this.getTopicsComponentCount();
            
            // Emit topics-specific counter events
            this.emitTopicsCounterEvent(eventType, topicsCount, componentData, eventPayload);
            
            // Trigger design panel sync
            this.triggerDesignPanelSync(eventType, componentData, topicsCount);
            
            this.logger.debug('EVENT', 'Topics component event handled', {
                eventType,
                componentId: componentData.id,
                topicsCount,
                totalTopicsComponents: this.componentTracker.topicsComponents.size
            });
            
        } catch (error) {
            this.logger.error('EVENT', 'Error handling topics component event', error);
        }
    }
    
    /**
     * GEMINI ARCHITECTURE: Emit topics counter change events with debouncing
     */
    emitTopicsCounterEvent(eventType, topicsCount, componentData, originalEventPayload) {
        const counterEventKey = 'topics-counter-change';
        
        // Clear existing debounce timer
        if (this.eventDebounceTimers.has(counterEventKey)) {
            clearTimeout(this.eventDebounceTimers.get(counterEventKey));
        }
        
        // Set new debounced event
        const timer = setTimeout(() => {
            try {
                const counterEventPayload = {
                    type: 'counter-changed',
                    eventType,
                    topicsCount,
                    component: componentData,
                    timestamp: Date.now(),
                    source: 'enhanced-component-manager-counter',
                    originalEvent: originalEventPayload
                };
                
                // Emit counter-specific events
                this.eventBus.dispatch('components:topics:counter-changed', counterEventPayload);
                this.eventBus.dispatch('topics:counter-updated', counterEventPayload);
                
                // Emit validation requirement event
                this.eventBus.dispatch('components:topics:validation-required', {
                    ...counterEventPayload,
                    reason: 'counter-change'
                });
                
                this.logger.debug('EVENT', 'Topics counter event emitted', {
                    topicsCount,
                    eventType,
                    componentId: componentData?.id
                });
                
            } catch (error) {
                this.logger.error('EVENT', 'Error emitting topics counter event', error);
            } finally {
                this.eventDebounceTimers.delete(counterEventKey);
            }
        }, this.eventDebounceDelay);
        
        this.eventDebounceTimers.set(counterEventKey, timer);
    }
    
    /**
     * GEMINI ARCHITECTURE: Trigger design panel synchronization
     */
    triggerDesignPanelSync(eventType, componentData, topicsCount) {
        const syncEventKey = 'design-panel-sync';
        
        // Clear existing sync timer
        if (this.eventDebounceTimers.has(syncEventKey)) {
            clearTimeout(this.eventDebounceTimers.get(syncEventKey));
        }
        
        // Set debounced sync event
        const timer = setTimeout(() => {
            try {
                const syncEventPayload = {
                    type: 'sync-required',
                    eventType,
                    component: componentData,
                    topicsCount,
                    timestamp: Date.now(),
                    source: 'enhanced-component-manager-sync',
                    target: 'design-panel'
                };
                
                // Emit design panel sync events
                this.eventBus.dispatch('components:topics:sync-required', syncEventPayload);
                this.eventBus.dispatch('design-panel:topics:sync-required', syncEventPayload);
                
                // Emit preview update event
                this.eventBus.dispatch('topics:preview-updated', {
                    ...syncEventPayload,
                    count: topicsCount,
                    source: 'component-manager'
                });
                
                this.logger.debug('EVENT', 'Design panel sync triggered', {
                    eventType,
                    topicsCount,
                    componentId: componentData?.id
                });
                
            } catch (error) {
                this.logger.error('EVENT', 'Error triggering design panel sync', error);
            } finally {
                this.eventDebounceTimers.delete(syncEventKey);
            }
        }, this.eventDebounceDelay);
        
        this.eventDebounceTimers.set(syncEventKey, timer);
    }
    
    /**
     * GEMINI ARCHITECTURE: Update component tracking for event coordination
     */
    updateComponentTracking(eventType, componentData) {
        if (!componentData || !componentData.id) return;
        
        const componentId = componentData.id;
        
        switch (eventType) {
            case 'added':
                this.componentTracker.activeComponents.set(componentId, {
                    id: componentId,
                    type: componentData.type,
                    addedAt: Date.now(),
                    lastUpdated: Date.now()
                });
                break;
                
            case 'removed':
                this.componentTracker.activeComponents.delete(componentId);
                this.componentTracker.topicsComponents.delete(componentId);
                break;
                
            case 'updated':
                const existing = this.componentTracker.activeComponents.get(componentId);
                if (existing) {
                    existing.lastUpdated = Date.now();
                }
                break;
        }
        
        this.componentTracker.lastEventTime = Date.now();
    }
    
    /**
     * GEMINI ARCHITECTURE: Get current topics component count from state
     */
    getTopicsComponentCount() {
        try {
            const state = enhancedStateManager.getState();
            const components = state.components || {};
            
            // Count topics components
            let topicsCount = 0;
            Object.values(components).forEach(component => {
                if (component.type === 'topics') {
                    topicsCount++;
                }
            });
            
            return topicsCount;
            
        } catch (error) {
            this.logger.warn('EVENT', 'Error getting topics component count', error);
            return this.componentTracker.topicsComponents.size; // Fallback to tracker
        }
    }
    
    /**
     * GEMINI ARCHITECTURE: Get actual topics count from preview component
     */
    getActualTopicsCount() {
        try {
            const previewComponent = document.querySelector('.editable-element[data-component="topics"]');
            if (!previewComponent) {
                return -1;
            }
            
            const topicItems = previewComponent.querySelectorAll('.topic-item');
            const realTopics = Array.from(topicItems).filter(item => {
                const title = item.querySelector('.topic-title');
                const titleText = title?.textContent?.trim();
                const source = item.getAttribute('data-topic-source');
                
                return source !== 'placeholder' && titleText && titleText.length > 0;
            });
            
            return realTopics.length;
            
        } catch (error) {
            this.logger.warn('EVENT', 'Error getting actual topics count', error);
            return -1;
        }
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
            // GEMINI ARCHITECTURE: Enhanced control action handling
            switch (action) {
                case 'Delete':
                    this.removeComponent(componentId);
                    break;
                case 'Duplicate':
                    this.duplicateComponent(componentId);
                    break;
                case 'Move Up':
                    this.moveComponentWithEvents(componentId, 'up');
                    break;
                case 'Move Down':
                    this.moveComponentWithEvents(componentId, 'down');
                    break;
                case 'Edit':
                    this.editComponent(componentId);
                    break;
                default:
                    this.logger.warn('CONTROL', `Unknown control action: ${action}`, { componentId });
                    return;
            }
            
            this.logger.info('CONTROL', `Successfully executed ${action}`, { componentId });
        } catch (error) {
            this.logger.error('CONTROL', `Failed to execute control action: ${action}`, error, { componentId });
        } finally {
            perfEnd();
        }
    }

    /**
     * GEMINI ARCHITECTURE: Enhanced component addition with MKCG integration
     * @param {string} componentType - The type of the component to add.
     * @param {object} props - The initial properties for the new component.
     * @param {boolean} autoPopulate - Whether to auto-populate with MKCG data (default: true)
     */
    addComponent(componentType, props = {}, autoPopulate = true) {
        // GEMINI ARCHITECTURE: Component type validation
        if (componentType === 'bio') {
            console.error('🚨 DIAGNOSTIC: Attempting to add "bio" component - should be "biography"');
            componentType = 'biography';
            console.log('✅ DIAGNOSTIC: Auto-corrected "bio" to "biography"');
        }
        
        this.logger.info('COMPONENT', `Adding component: ${componentType}`, {
            correctedType: componentType,
            props: Object.keys(props),
            autoPopulate
        });
        
        // Ensure component manager is initialized
        this.ensureInitialized();
        
        const perfEnd = performanceMonitor.start('add-component', { componentType, autoPopulate });
        
        try {
            let finalProps = { ...props };
            let mkcgDataUsed = false;
            let mkcgMetadata = null;
            
            // GEMINI ARCHITECTURE: Enhanced MKCG Data Integration
            if (autoPopulate && mkcgDataMapper && typeof mkcgDataMapper.mapDataToComponent === 'function') {
                try {
                    const mappingResult = mkcgDataMapper.mapDataToComponent(componentType);
                    
                    if (mappingResult && mappingResult.props && Object.keys(mappingResult.props).length > 0) {
                        finalProps = { ...mappingResult.props, ...props };
                        mkcgDataUsed = true;
                        mkcgMetadata = mappingResult.metadata;
                        
                        this.logger.info('MKCG', `Enhanced auto-populated ${componentType} with MKCG data`);
                    }
                } catch (mkcgError) {
                    this.logger.warn('MKCG', `Failed to auto-populate ${componentType}`, mkcgError);
                }
            }
            
            // GEMINI ARCHITECTURE: Create enhanced component
            const newComponent = {
                id: generateUniqueId(componentType),
                type: componentType,
                props: finalProps,
                mkcgPopulated: mkcgDataUsed,
                mkcgMetadata: mkcgDataUsed ? mkcgMetadata : null,
                createdAt: Date.now(),
                version: '2.0.0-gemini'
            };
            
            enhancedStateManager.addComponent(newComponent);
            
            // GEMINI ARCHITECTURE: Emit component added events
            this.emitComponentEvent('added', newComponent, {
                mkcgDataUsed,
                autoPopulated: autoPopulate,
                propsCount: Object.keys(finalProps).length
            });
            
            this.logger.info('COMPONENT', `Successfully added component ${componentType}`, {
                id: newComponent.id,
                mkcgDataUsed
            });
            
            return newComponent.id;
            
        } catch (error) {
            this.logger.error('COMPONENT', `Failed to add component ${componentType}`, error);
            throw error;
        } finally {
            perfEnd();
        }
    }

    /**
     * Removes a component from the state.
     * GEMINI ARCHITECTURE: Enhanced with event emission
     * @param {string} componentId - The ID of the component to remove.
     */
    removeComponent(componentId) {
        try {
            // Get component data before removal for event emission
            const componentToRemove = enhancedStateManager.getComponent(componentId);
            
            enhancedStateManager.removeComponent(componentId);
            
            // GEMINI ARCHITECTURE: Emit component removed events
            if (componentToRemove) {
                this.emitComponentEvent('removed', componentToRemove, {
                    removedAt: Date.now(),
                    removedBy: 'user-action'
                });
            }
            
            this.logger.info('COMPONENT', 'Component removed', { componentId });
        } catch (error) {
            this.logger.error('COMPONENT', 'Failed to remove component', error, { componentId });
        }
    }

    /**
     * Duplicates an existing component.
     * GEMINI ARCHITECTURE: Enhanced with event emission
     * @param {string} componentId - The ID of the component to duplicate.
     */
    duplicateComponent(componentId) {
        try {
            const originalComponent = enhancedStateManager.getComponent(componentId);
            if (originalComponent) {
                const newComponent = {
                    ...originalComponent,
                    id: generateUniqueId(originalComponent.type),
                    props: { ...originalComponent.props },
                };
                enhancedStateManager.addComponent(newComponent);
                
                // GEMINI ARCHITECTURE: Emit component duplication events
                this.emitComponentEvent('added', newComponent, {
                    duplicatedFrom: componentId,
                    duplicatedAt: Date.now(),
                    isDuplicate: true
                });
                
                this.logger.info('COMPONENT', 'Component duplicated', { 
                    originalId: componentId, 
                    newId: newComponent.id 
                });
            }
        } catch (error) {
            this.logger.error('COMPONENT', 'Failed to duplicate component', error, { componentId });
        }
    }

    /**
     * Updates a component's properties in the state.
     * GEMINI ARCHITECTURE: Enhanced updateComponent method
     * @param {string} componentId - The ID of the component to update.
     * @param {object} newProps - The new properties to apply to the component.
     */
    updateComponent(componentId, newProps) {
        if (!this.ensureInitialized()) {
            this.logger.warn('COMPONENT', 'Cannot update component, DOM not ready', { componentId });
            throw new Error('Component manager not initialized');
        }
        
        try {
            this.logger.info('COMPONENT', `Updating component ${componentId}`, newProps);
            
            const currentComponent = enhancedStateManager.getComponent(componentId);
            
            if (!currentComponent) {
                throw new Error(`Component ${componentId} not found in state`);
            }
            
            // Get component data before update for event emission
            const componentBeforeUpdate = { ...currentComponent };
            
            // Use the enhanced state manager's updateComponent method
            enhancedStateManager.updateComponent(componentId, newProps);
            
            // Get updated component for event emission
            const componentAfterUpdate = enhancedStateManager.getComponent(componentId);
            
            // GEMINI ARCHITECTURE: Emit component updated events
            if (componentAfterUpdate) {
                this.emitComponentEvent('updated', componentAfterUpdate, {
                    updatedProps: Object.keys(newProps),
                    updatedAt: Date.now(),
                    changeCount: Object.keys(newProps).length
                });
            }
            
            this.logger.info('COMPONENT', `Successfully updated component ${componentId}`);
            return true;
            
        } catch (error) {
            this.logger.error('COMPONENT', `Failed to update component ${componentId}`, error);
            throw error;
        }
    }

    /**
     * Opens edit panel for component
     * GEMINI ARCHITECTURE: Enhanced with component interaction events
     * @param {string} componentId - The ID of the component to edit
     */
    editComponent(componentId) {
        this.logger.info('CONTROL', 'Edit action triggered', { componentId });
        
        try {
            const component = enhancedStateManager.getComponent(componentId);
            
            // GEMINI ARCHITECTURE: Emit component interaction events
            if (component) {
                this.emitComponentEvent('edit-requested', component, {
                    action: 'edit',
                    requestedAt: Date.now(),
                    source: 'user-interaction'
                });
            }
            
            // GEMINI ARCHITECTURE: Emit event to open design panel
            if (window.GMKB && typeof window.GMKB.dispatch === 'function') {
                window.GMKB.dispatch('ui:open-design-panel', {
                    componentId,
                    component: component
                });
            } else {
                // Fallback to direct method call
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
     * GEMINI ARCHITECTURE: Get component manager status for debugging
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            hasPreviewContainer: !!this.previewContainer,
            componentCount: Object.keys(enhancedStateManager.getState().components || {}).length,
            architecture: 'gemini-event-driven',
            eventSystem: {
                available: !!this.eventBus,
                type: this.eventBus === window.GMKB ? 'GMKB' : 'Fallback'
            },
            methods: {
                addComponent: typeof this.addComponent === 'function',
                updateComponent: typeof this.updateComponent === 'function',
                removeComponent: typeof this.removeComponent === 'function',
                duplicateComponent: typeof this.duplicateComponent === 'function'
            }
        };
    }

    /**
     * GEMINI ARCHITECTURE: Enhanced move component with event emission
     */
    moveComponentWithEvents(componentId, direction) {
        try {
            const component = enhancedStateManager.getComponent(componentId);
            
            enhancedStateManager.moveComponent(componentId, direction);
            
            // GEMINI ARCHITECTURE: Emit component move events
            if (component) {
                this.emitComponentEvent('moved', component, {
                    direction,
                    movedAt: Date.now(),
                    source: 'user-action'
                });
            }
            
            this.logger.info('COMPONENT', 'Component moved with events', {
                componentId,
                direction
            });
            
        } catch (error) {
            this.logger.error('COMPONENT', 'Failed to move component', error, {
                componentId,
                direction
            });
        }
    }
    
    /**
     * GEMINI ARCHITECTURE: Debug component event system
     */
    debugEventSystem() {
        console.group('%c🎯 GMKB Component Event System Debug', 'font-size: 14px; font-weight: bold; color: #2563eb');
        
        console.log('Event System Status:', {
            eventBusAvailable: !!this.eventBus,
            eventBusType: this.eventBus === window.GMKB ? 'GMKB' : 'Fallback',
            componentTracking: this.getEventTrackingStats(),
            pendingEvents: this.eventDebounceTimers.size
        });
        
        console.log('Component Tracking:', {
            activeComponents: Array.from(this.componentTracker.activeComponents.entries()),
            topicsComponents: Array.from(this.componentTracker.topicsComponents),
            lastEventTime: this.componentTracker.lastEventTime
        });
        
        console.groupEnd();
    }
    
    /**
     * GEMINI ARCHITECTURE: Test event system connectivity
     */
    testEventSystem() {
        const testId = `test-${Date.now()}`;
        
        try {
            // Test basic event emission
            this.eventBus.dispatch('components:test-event', {
                testId,
                timestamp: Date.now(),
                message: 'GMKB event system test'
            });
            
            return {
                success: true,
                testId,
                eventBusAvailable: !!this.eventBus,
                eventBusType: this.eventBus === window.GMKB ? 'GMKB' : 'Fallback',
                architecture: 'gemini-event-driven'
            };
            
        } catch (error) {
            this.logger.error('EVENT', 'Event system test failed', error);
            
            return {
                success: false,
                error: error.message,
                testId
            };
        }
    }

    /**
     * GEMINI ARCHITECTURE: Force sync all components
     */
    forceSyncAllComponents() {
        try {
            const state = enhancedStateManager.getState();
            const components = Object.values(state.components || {});
            
            components.forEach(component => {
                this.emitComponentEvent('sync-forced', component, {
                    forcedAt: Date.now(),
                    source: 'manual-sync'
                });
            });
            
        } catch (error) {
            this.logger.error('EVENT', 'Error force syncing all components', error);
        }
    }
}

// GEMINI ARCHITECTURE: Register with GMKB System Initializer
if (window.GMKB && window.GMKB.initializer) {
    // Register Enhanced Component Manager with the system initializer
    window.GMKB.initializer.register('EnhancedComponentManager', () => {
        const manager = new EnhancedComponentManager();
        
        // Initialize the manager
        manager.init();
        
        return manager;
    }, {
        priority: 100, // High priority - core system
        required: true,
        dependencies: [] // No dependencies
    });
    
    console.log('✅ GMKB: Enhanced Component Manager registered with system initializer');
} else {
    // Fallback for development/testing
    console.warn('⚠️ GMKB system initializer not available, using fallback registration');
    
    const enhancedComponentManager = new EnhancedComponentManager();
    enhancedComponentManager.init();
    
    // Expose globally for backward compatibility
    window.enhancedComponentManager = enhancedComponentManager;
    window.EnhancedComponentManager = EnhancedComponentManager;
    
    if (!window.componentManager) {
        window.componentManager = enhancedComponentManager;
    }
}

// GEMINI ARCHITECTURE: Set up global exposure when system is ready
if (window.GMKB) {
    window.GMKB.subscribe('core:systems-ready', (event) => {
        const manager = window.GMKB.systems.EnhancedComponentManager;
        
        if (manager) {
            // Expose globally for backward compatibility
            window.enhancedComponentManager = manager;
            window.EnhancedComponentManager = EnhancedComponentManager;
            
            if (!window.componentManager) {
                window.componentManager = manager;
            }
            
            console.log('✅ GEMINI ARCHITECTURE: Enhanced Component Manager exposed globally');
            
            // Set up debug commands
            setupGlobalDebugCommands(manager);
            
            // Test event system
            testEventSystemConnectivity(manager);
        }
    });
}

// GEMINI ARCHITECTURE: Setup global debug commands
function setupGlobalDebugCommands(manager) {
    window.debugComponentEvents = () => manager.debugEventSystem();
    window.testComponentEvents = () => manager.testEventSystem();
    window.forceComponentSync = () => manager.forceSyncAllComponents();
    window.getComponentEventStats = () => manager.getEventTrackingStats();
    window.getEnhancedComponentManagerStatus = () => {
        const baseStatus = manager.getStatus();
        const eventStats = manager.getEventTrackingStats();
        
        return {
            ...baseStatus,
            eventSystem: {
                available: true,
                eventBusConnected: !!manager.eventBus,
                tracking: eventStats
            }
        };
    };
    
    console.log('📊 GEMINI ARCHITECTURE: Debug commands available:');
    console.log('   debugComponentEvents() - Show component event system debug info');
    console.log('   testComponentEvents() - Test event system connectivity');
    console.log('   forceComponentSync() - Force sync all components');
    console.log('   getComponentEventStats() - Show event tracking statistics');
    console.log('   getEnhancedComponentManagerStatus() - Full status with event system');
}

// GEMINI ARCHITECTURE: Test event system connectivity
function testEventSystemConnectivity(manager) {
    setTimeout(() => {
        try {
            if (manager && manager.testEventSystem) {
                const testResult = manager.testEventSystem();
                console.log('🎉 GEMINI ARCHITECTURE: Event system verification SUCCESS!', testResult);
            }
        } catch (error) {
            console.error('❌ GEMINI ARCHITECTURE: Event system test failed:', error);
        }
    }, 1000);
}

console.log('🔥 GEMINI ARCHITECTURE: Enhanced Component Manager v2.0 with Event-Driven Architecture!');

})(); // GEMINI ARCHITECTURE: Close IIFE wrapper
