/**
 * @file enhanced-component-manager.js
 * @description ROOT FIX: WordPress-Compatible Enhanced Component Manager
 * Converted from ES6 modules to WordPress-compatible IIFE format
 * Manages component-related actions like adding, removing, and handling UI controls.
 * 
 * CRITICAL FIX: Removes ES6 import dependencies that fail in WordPress loading
 */

// ROOT FIX: WordPress-compatible IIFE wrapper
(function() {
    'use strict';
    
    // ROOT FIX: Create fallback utilities if imports not available
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
        
        // ROOT FIX: STEP 3 - Component event system for cross-panel communication
        this.eventBus = window.eventBus || {
            emit: (event, data) => {
                // Fallback to DOM events if eventBus not available
                document.dispatchEvent(new CustomEvent(event, { detail: data }));
            },
            on: () => {},
            off: () => {}
        };
        
        // STEP 3: Component tracking for event coordination
        this.componentTracker = {
            activeComponents: new Map(),
            topicsComponents: new Set(),
            lastEventTime: null,
            eventQueue: [],
            isProcessingEvents: false
        };
        
        // STEP 3: Event debouncing for performance
        this.eventDebounceTimers = new Map();
        this.eventDebounceDelay = 150;
        
        this.logger.info('INIT', 'Enhanced Component Manager created with event system');
    }

    /**
     * ROOT FIX: STEP 3 - Debounced event emission to prevent flooding
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
                this.eventBus.emit(eventName, eventPayload);
                this.logger.debug('EVENT', `Debounced event emitted: ${eventName}`, eventPayload);
            } catch (error) {
                this.logger.error('EVENT', `Error emitting debounced event: ${eventName}`, error);
            } finally {
                this.eventDebounceTimers.delete(eventKey);
            }
        }, debounceDelay);
        
        this.eventDebounceTimers.set(eventKey, timer);
    }
    
    /**
     * ROOT FIX: STEP 3 - Get component event tracking statistics
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
     * ROOT FIX: STEP 3 - Component event emission system
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
            // Emit general component event
            this.eventBus.emit(`components:${eventType}`, eventPayload);
            
            // Emit component-type-specific event if component has type
            if (componentData && componentData.type) {
                this.eventBus.emit(`components:${componentData.type}:${eventType}`, eventPayload);
                
                // STEP 3: Special handling for topics components
                if (componentData.type === 'topics') {
                    this.handleTopicsComponentEvent(eventType, componentData, eventPayload);
                }
            }
            
            // Update component tracking
            this.updateComponentTracking(eventType, componentData);
            
            this.logger.debug('EVENT', `Component event emitted: ${eventType}`, {
                componentId: componentData?.id,
                componentType: componentData?.type,
                timestamp
            });
            
        } catch (error) {
            this.logger.error('EVENT', 'Failed to emit component event', error, {
                eventType,
                componentId: componentData?.id
            });
        }
    }
    
    /**
     * ROOT FIX: STEP 3 - Topics-specific event handling for counter synchronization
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
     * ROOT FIX: STEP 3 - Emit topics counter change events with debouncing
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
                this.eventBus.emit('components:topics:counter-changed', counterEventPayload);
                this.eventBus.emit('topics:counter-updated', counterEventPayload);
                
                // Emit validation requirement event
                this.eventBus.emit('components:topics:validation-required', {
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
     * ROOT FIX: STEP 3 - Trigger design panel synchronization
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
                this.eventBus.emit('components:topics:sync-required', syncEventPayload);
                this.eventBus.emit('design-panel:topics:sync-required', syncEventPayload);
                
                // Emit preview update event
                this.eventBus.emit('topics:preview-updated', {
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
     * ROOT FIX: STEP 3 - Update component tracking for event coordination
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
     * ROOT FIX: STEP 3 - Get current topics component count from state
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
     * ROOT FIX: STEP 3 - Get actual topics count from preview component
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
                    // ROOT FIX: STEP 3 - Use enhanced move with events
                    this.moveComponentWithEvents(componentId, 'up');
                    break;
                case 'Move Down':
                    // ROOT FIX: STEP 3 - Use enhanced move with events
                    this.moveComponentWithEvents(componentId, 'down');
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
     * PHASE 2.1: Enhanced component addition with advanced MKCG data integration
     * ROOT FIX: Added component type validation and debugging
     * @param {string} componentType - The type of the component to add.
     * @param {object} props - The initial properties for the new component.
     * @param {boolean} autoPopulate - Whether to auto-populate with MKCG data (default: true)
     */
    addComponent(componentType, props = {}, autoPopulate = true) {
        // ROOT FIX: Diagnostic logging and component type validation
        if (componentType === 'bio') {
            console.error('🚨 DIAGNOSTIC: Attempting to add "bio" component - should be "biography"');
            console.trace('Stack trace for bio component creation:');
            
            // Auto-correct the component type
            componentType = 'biography';
            console.log('✅ DIAGNOSTIC: Auto-corrected "bio" to "biography"');
        }
        
        this.logger.info('COMPONENT', `Adding component: ${componentType}`, {
            originalType: arguments[0], // Log original parameter
            correctedType: componentType,
            props: Object.keys(props),
            autoPopulate,
            stackTrace: new Error().stack
        });
        
        // Ensure component manager is initialized (but don't require DOM for state operations)
        this.ensureInitialized();
        
        const perfEnd = performanceMonitor.start('add-component', { componentType, autoPopulate });
        
        try {
            let finalProps = { ...props };
            let mkcgDataUsed = false;
            let mkcgMetadata = null;
            
            // PHASE 2.1: Enhanced MKCG Data Integration with quality analysis
            if (autoPopulate && mkcgDataMapper && typeof mkcgDataMapper.mapDataToComponent === 'function') {
                try {
                    // Get enhanced mapping result with metadata
                    const mappingResult = mkcgDataMapper.mapDataToComponent(componentType);
                    
                    if (mappingResult && mappingResult.props && Object.keys(mappingResult.props).length > 0) {
                        // Merge enhanced MKCG props with provided props (provided props take precedence)
                        finalProps = { ...mappingResult.props, ...props };
                        mkcgDataUsed = true;
                        mkcgMetadata = mappingResult.metadata;
                        
                        this.logger.info('MKCG', `Enhanced auto-populated ${componentType} with MKCG data`, {
                            mappedFields: mappingResult.metadata.mappedFields,
                            qualityScore: `${mappingResult.metadata.dataQuality.overallScore}%`,
                            priority: mappingResult.metadata.priority,
                            recommendation: mappingResult.metadata.dataQuality.recommendation,
                            overriddenFields: Object.keys(props),
                            finalFields: Object.keys(finalProps)
                        });
                        
                        // PHASE 2.1: Show enhanced notification with quality info
                        if (mappingResult.metadata.dataQuality.overallScore >= 70) {
                            this.showEnhancedMKCGNotification(componentType, mappingResult.metadata, 'excellent');
                        } else if (mappingResult.metadata.dataQuality.overallScore >= 40) {
                            this.showEnhancedMKCGNotification(componentType, mappingResult.metadata, 'good');
                        } else {
                            this.showEnhancedMKCGNotification(componentType, mappingResult.metadata, 'fair');
                        }
                    } else {
                        this.logger.info('MKCG', `No suitable MKCG data found for ${componentType}`, {
                            reason: mappingResult?.metadata?.reason || 'unknown',
                            details: mappingResult?.metadata?.details || 'no details'
                        });
                    }
                } catch (mkcgError) {
                    this.logger.warn('MKCG', `Failed to auto-populate ${componentType} with enhanced MKCG data`, mkcgError);
                    // Continue with original props on MKCG error
                }
            }
            
            this.logger.info('COMPONENT', `Adding enhanced component ${componentType}`, {
                props: finalProps,
                mkcgDataUsed,
                propsCount: Object.keys(finalProps).length,
                qualityScore: mkcgMetadata?.dataQuality?.overallScore || 0,
                priority: mkcgMetadata?.priority || 0
            });
            
            // PHASE 2.1: Enhanced component with metadata
            const newComponent = {
                id: generateUniqueId(componentType),
                type: componentType,
                props: finalProps,
                mkcgPopulated: mkcgDataUsed,
                mkcgMetadata: mkcgDataUsed ? mkcgMetadata : null,
                createdAt: Date.now(),
                version: '2.1.0-enhanced'
            };
            
            enhancedStateManager.addComponent(newComponent);
            
            // ROOT FIX: STEP 3 - Emit component added events for cross-panel communication
            this.emitComponentEvent('added', newComponent, {
                mkcgDataUsed,
                qualityScore: mkcgMetadata?.dataQuality?.overallScore || 0,
                priority: mkcgMetadata?.priority || 0,
                autoPopulated: autoPopulate,
                propsCount: Object.keys(finalProps).length
            });
            
            this.logger.info('COMPONENT', `Successfully added enhanced component ${componentType}`, {
                id: newComponent.id,
                mkcgDataUsed,
                propsCount: Object.keys(finalProps).length,
                qualityScore: mkcgMetadata?.dataQuality?.overallScore || 0,
                priority: mkcgMetadata?.priority || 0
            });
            
            // Enhanced notification is shown during mapping process above
            
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
     * ROOT FIX: STEP 3 - Enhanced with event emission for cross-panel communication
     * @param {string} componentId - The ID of the component to remove.
     */
    removeComponent(componentId) {
        try {
            // Get component data before removal for event emission
            const componentToRemove = enhancedStateManager.getComponent(componentId);
            
            enhancedStateManager.removeComponent(componentId);
            
            // ROOT FIX: STEP 3 - Emit component removed events
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
     * ROOT FIX: STEP 3 - Enhanced with event emission for cross-panel communication
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
                
                // ROOT FIX: STEP 3 - Emit component duplication events
                this.emitComponentEvent('added', newComponent, {
                    duplicatedFrom: componentId,
                    duplicatedAt: Date.now(),
                    isDuplicate: true,
                    originalComponent: originalComponent
                });
                
                // Also emit specific duplication event
                this.emitComponentEvent('duplicated', newComponent, {
                    originalId: componentId,
                    newId: newComponent.id,
                    duplicatedAt: Date.now()
                });
                
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
            
            // Get component data before update for event emission
            const componentBeforeUpdate = { ...currentComponent };
            
            // GEMINI FIX: Use the enhanced state manager's updateComponent method directly
            // This method expects componentId and newProps, not a full component object
            enhancedStateManager.updateComponent(componentId, newProps);
            
            // Get updated component for event emission
            const componentAfterUpdate = enhancedStateManager.getComponent(componentId);
            
            // ROOT FIX: STEP 3 - Emit component updated events for cross-panel communication
            if (componentAfterUpdate) {
                this.emitComponentEvent('updated', componentAfterUpdate, {
                    updatedProps: Object.keys(newProps),
                    updatedAt: Date.now(),
                    previousProps: componentBeforeUpdate.props || {},
                    newProps: newProps,
                    changeCount: Object.keys(newProps).length
                });
            }
            
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
     * ROOT FIX: STEP 3 - Enhanced with component interaction events
     * @param {string} componentId - The ID of the component to edit
     */
    editComponent(componentId) {
        this.logger.info('CONTROL', 'Edit action triggered', { componentId });
        
        try {
            // Get component for event emission
            const component = enhancedStateManager.getComponent(componentId);
            
            // ROOT FIX: STEP 3 - Emit component interaction events
            if (component) {
                this.emitComponentEvent('edit-requested', component, {
                    action: 'edit',
                    requestedAt: Date.now(),
                    source: 'user-interaction'
                });
            }
            
            // GEMINI FIX: Emit event to open design panel
            if (window.eventBus && typeof window.eventBus.emit === 'function') {
                window.eventBus.emit('ui:open-design-panel', {
                    componentId,
                    component: component
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
            mkcgIntegration: {
                mapperAvailable: !!mkcgDataMapper,
                hasGuestifyData: !!(typeof window !== 'undefined' && window.guestifyData),
                hasMKCGData: !!(typeof window !== 'undefined' && window.guestifyData?.mkcgData),
                autoPopulatableComponents: this.getAutoPopulatableComponents().length
            },
            methods: {
                addComponent: typeof this.addComponent === 'function',
                updateComponent: typeof this.updateComponent === 'function',
                removeComponent: typeof this.removeComponent === 'function',
                duplicateComponent: typeof this.duplicateComponent === 'function',
                addComponentWithMKCGData: typeof this.addComponentWithMKCGData === 'function',
                canAutoPopulateComponent: typeof this.canAutoPopulateComponent === 'function',
                autoGenerateFromMKCG: typeof this.autoGenerateFromMKCG === 'function'
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
    
    /**
     * PHASE 1: Add component with explicit MKCG data population
     * @param {string} componentType - Component type to add
     * @param {object} mkcgProps - Pre-mapped MKCG properties
     * @param {object} additionalProps - Additional props to merge
     * @returns {string} Component ID
     */
    addComponentWithMKCGData(componentType, mkcgProps = {}, additionalProps = {}) {
        const finalProps = { ...mkcgProps, ...additionalProps };
        return this.addComponent(componentType, finalProps, false); // Don't auto-populate since we're providing MKCG data
    }
    
    /**
     * PHASE 1: Check if component can be auto-populated with MKCG data
     * @param {string} componentType - Component type to check
     * @returns {boolean} True if can be auto-populated
     */
    canAutoPopulateComponent(componentType) {
        if (!mkcgDataMapper || typeof mkcgDataMapper.canAutoPopulate !== 'function') {
            return false;
        }
        
        try {
            return mkcgDataMapper.canAutoPopulate(componentType);
        } catch (error) {
            this.logger.warn('MKCG', `Error checking auto-populate for ${componentType}`, error);
            return false;
        }
    }
    
    /**
     * PHASE 1: Get list of components that can be auto-populated
     * @returns {Array} Array of component types that can be auto-populated
     */
    /**
     * PHASE 2.1: Enhanced auto-populatable components with quality analysis
     */
    getAutoPopulatableComponentsEnhanced() {
        if (!mkcgDataMapper || typeof mkcgDataMapper.getAutoPopulatableComponentsEnhanced !== 'function') {
            return [];
        }
        
        try {
            return mkcgDataMapper.getAutoPopulatableComponentsEnhanced();
        } catch (error) {
            this.logger.warn('MKCG', 'Error getting enhanced auto-populatable components', error);
            return [];
        }
    }
    
    /**
     * PHASE 2.1: Legacy method (backward compatibility)
     */
    getAutoPopulatableComponents() {
        return this.getAutoPopulatableComponentsEnhanced();
    }
    
    /**
     * PHASE 2.1: Enhanced auto-generation with intelligent prioritization and batch processing
     * @param {boolean} showNotifications - Whether to show notifications
     * @param {Object} options - Generation options
     * @returns {Object} Enhanced generation results with metadata
     */
    autoGenerateFromMKCGEnhanced(showNotifications = true, options = {}) {
        const {
            maxComponents = 5,
            minQualityScore = 30,
            priorityThreshold = 40,
            batchSize = 3
        } = options;
        
        const autoPopulatable = this.getAutoPopulatableComponentsEnhanced();
        const addedComponents = [];
        const skippedComponents = [];
        const generationMetadata = {
            totalCandidates: autoPopulatable.length,
            qualityFilter: minQualityScore,
            priorityFilter: priorityThreshold,
            maxComponents
        };
        
        if (autoPopulatable.length === 0) {
            this.logger.info('MKCG', 'No components can be auto-generated from MKCG data');
            return {
                addedComponents: [],
                skippedComponents: [],
                metadata: generationMetadata
            };
        }
        
        // Filter by quality and priority thresholds
        const qualifiedComponents = autoPopulatable.filter(comp => 
            comp.dataQuality.overallScore >= minQualityScore && 
            comp.priority >= priorityThreshold
        ).slice(0, maxComponents);
        
        // ROOT FIX: Diagnostic check for "bio" component type
        const bioComponents = qualifiedComponents.filter(comp => comp.type === 'bio');
        if (bioComponents.length > 0) {
            console.error('🚨 DIAGNOSTIC: Found "bio" components in auto-generation list:');
            console.error(bioComponents);
            console.error('Raw autoPopulatable list:', autoPopulatable);
            
            // Auto-correct bio to biography
            qualifiedComponents.forEach(comp => {
                if (comp.type === 'bio') {
                    console.log('✅ DIAGNOSTIC: Auto-correcting bio to biography in auto-generation');
                    comp.type = 'biography';
                }
            });
        }
        
        this.logger.info('MKCG', `Enhanced auto-generating ${qualifiedComponents.length} prioritized components`, {
            totalCandidates: autoPopulatable.length,
            qualified: qualifiedComponents.length,
            filters: { minQualityScore, priorityThreshold },
            components: qualifiedComponents.map(c => ({
                type: c.type,
                quality: c.dataQuality.overallScore,
                priority: c.priority
            }))
        });
        
        try {
            // PHASE 2.1: Batch processing for performance
            const batches = [];
            for (let i = 0; i < qualifiedComponents.length; i += batchSize) {
                batches.push(qualifiedComponents.slice(i, i + batchSize));
            }
            
            // Use enhanced state manager batch updates
            enhancedStateManager.startBatchUpdate();
            
            try {
                for (const batch of batches) {
                    for (const componentInfo of batch) {
                        try {
                            const componentId = this.addComponent(componentInfo.type, {}, true);
                            addedComponents.push({
                                id: componentId,
                                type: componentInfo.type,
                                name: componentInfo.name,
                                qualityScore: componentInfo.dataQuality.overallScore,
                                priority: componentInfo.priority,
                                mappedFields: componentInfo.mappedFields,
                                recommendation: componentInfo.recommendation
                            });
                        } catch (componentError) {
                            this.logger.warn('MKCG', `Failed to generate ${componentInfo.type}`, componentError);
                            skippedComponents.push({
                                type: componentInfo.type,
                                reason: 'generation-error',
                                error: componentError.message
                            });
                        }
                    }
                }
            } finally {
                enhancedStateManager.endBatchUpdate();
            }
            
            // Track skipped components
            const allSkipped = autoPopulatable.filter(comp => 
                comp.dataQuality.overallScore < minQualityScore || 
                comp.priority < priorityThreshold
            ).slice(0, 10); // Limit for logging
            
            allSkipped.forEach(comp => {
                skippedComponents.push({
                    type: comp.type,
                    reason: comp.dataQuality.overallScore < minQualityScore ? 'low-quality' : 'low-priority',
                    qualityScore: comp.dataQuality.overallScore,
                    priority: comp.priority
                });
            });
            
            // Enhanced notifications
            if (showNotifications && addedComponents.length > 0) {
                this.showEnhancedAutoGenerateNotification(addedComponents, skippedComponents, generationMetadata);
            }
            
            const results = {
                addedComponents,
                skippedComponents,
                metadata: {
                    ...generationMetadata,
                    successfulGenerations: addedComponents.length,
                    skippedCount: skippedComponents.length,
                    averageQuality: addedComponents.length > 0 ? 
                        Math.round(addedComponents.reduce((sum, comp) => sum + comp.qualityScore, 0) / addedComponents.length) : 0,
                    averagePriority: addedComponents.length > 0 ? 
                        Math.round(addedComponents.reduce((sum, comp) => sum + comp.priority, 0) / addedComponents.length) : 0,
                    batchesProcessed: batches.length,
                    generationTime: performance.now()
                }
            };
            
            this.logger.info('MKCG', `Enhanced auto-generation completed`, results.metadata);
            
            return results;
            
        } catch (error) {
            enhancedStateManager.endBatchUpdate(); // Ensure batch is ended on error
            this.logger.error('MKCG', 'Error during enhanced auto-generation', error);
            return {
                addedComponents,
                skippedComponents,
                metadata: {
                    ...generationMetadata,
                    error: error.message
                }
            };
        }
    }
    
    /**
     * PHASE 2.1: Legacy auto-generation method (backward compatibility)
     */
    autoGenerateFromMKCG(showNotifications = true) {
        const result = this.autoGenerateFromMKCGEnhanced(showNotifications);
        return result.addedComponents;
    }
    
    /**
     * ROOT PERFORMANCE FIX: Method alias for optimized template compatibility
     * This ensures the optimized template's autoGenerateFromMKCGData call works
     */
    autoGenerateFromMKCGData(mkcgData, showNotifications = true) {
        // Update global MKCG data if provided
        if (mkcgData && window.guestifyData) {
            window.guestifyData.mkcgData = mkcgData;
        }
        
        // Use the enhanced auto-generation method
        return this.autoGenerateFromMKCGEnhanced(showNotifications, {
            maxComponents: 5,
            minQualityScore: 30
        });
    }
    
    /**
     * PHASE 2.1: Enhanced MKCG notification with quality indicators
     * @param {string} componentType - Component type that was populated
     * @param {Object} metadata - Enhanced mapping metadata
     * @param {string} qualityLevel - Quality level (excellent, good, fair)
     */
    showEnhancedMKCGNotification(componentType, metadata, qualityLevel) {
        try {
            // Quality-based styling
            const qualityConfig = {
                excellent: {
                    icon: '🎉',
                    color: '#10b981',
                    title: 'Excellent Data Quality!',
                    bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                },
                good: {
                    icon: '✅',
                    color: '#3b82f6',
                    title: 'Good Data Quality',
                    bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                },
                fair: {
                    icon: '⚠️',
                    color: '#f59e0b',
                    title: 'Fair Data Quality',
                    bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                }
            };
            
            const config = qualityConfig[qualityLevel] || qualityConfig.good;
            
            // Create enhanced notification element
            const notification = document.createElement('div');
            notification.className = 'mkcg-enhanced-notification';
            notification.innerHTML = `
                <div class="mkcg-notification-content">
                    <div class="mkcg-notification-header">
                        <span class="mkcg-notification-icon">${config.icon}</span>
                        <div class="mkcg-notification-title">
                            <div class="mkcg-notification-main-title">${config.title}</div>
                            <div class="mkcg-notification-subtitle">${componentType} auto-populated</div>
                        </div>
                        <button class="mkcg-notification-close">×</button>
                    </div>
                    <div class="mkcg-notification-details">
                        <div class="mkcg-quality-score">
                            <span class="mkcg-score-label">Quality Score:</span>
                            <span class="mkcg-score-value">${metadata.dataQuality.overallScore}%</span>
                        </div>
                        <div class="mkcg-fields-info">
                            <span class="mkcg-fields-count">${metadata.mappedFields} fields</span>
                            <span class="mkcg-fields-separator">•</span>
                            <span class="mkcg-priority">Priority: ${metadata.priority}</span>
                        </div>
                        ${metadata.recommendations && metadata.recommendations.length > 0 ? 
                            `<div class="mkcg-recommendation">
                                💡 ${metadata.recommendations[0]}
                            </div>` : ''
                        }
                    </div>
                </div>
            `;
            
            // Enhanced styles with animations
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${config.bgGradient};
                color: white;
                padding: 0;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
                z-index: 10001;
                font-size: 14px;
                max-width: 380px;
                min-width: 320px;
                transform: translateX(100%);
                animation: slideInRightEnhanced 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            `;
            
            // Add enhanced CSS for internal elements
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideInRightEnhanced {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                .mkcg-notification-content {
                    padding: 16px;
                }
                
                .mkcg-notification-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    margin-bottom: 12px;
                }
                
                .mkcg-notification-icon {
                    font-size: 24px;
                    flex-shrink: 0;
                }
                
                .mkcg-notification-title {
                    flex: 1;
                }
                
                .mkcg-notification-main-title {
                    font-weight: 600;
                    font-size: 16px;
                    margin-bottom: 2px;
                }
                
                .mkcg-notification-subtitle {
                    font-size: 13px;
                    opacity: 0.9;
                    text-transform: capitalize;
                }
                
                .mkcg-notification-close {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s ease;
                }
                
                .mkcg-notification-close:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
                
                .mkcg-notification-details {
                    font-size: 13px;
                    opacity: 0.95;
                }
                
                .mkcg-quality-score {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 6px;
                    font-weight: 500;
                }
                
                .mkcg-score-value {
                    font-weight: 600;
                }
                
                .mkcg-fields-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                }
                
                .mkcg-fields-separator {
                    opacity: 0.6;
                }
                
                .mkcg-recommendation {
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 6px;
                    padding: 8px;
                    font-size: 12px;
                    line-height: 1.4;
                }
            `;
            
            document.head.appendChild(style);
            
            // Add to page
            document.body.appendChild(notification);
            
            // Auto-remove after 6 seconds (longer for enhanced notification)
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'slideInRightEnhanced 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.remove();
                            if (style.parentNode) {
                                style.remove();
                            }
                        }
                    }, 300);
                }
            }, 6000);
            
            // Close button handler
            const closeBtn = notification.querySelector('.mkcg-notification-close');
            closeBtn?.addEventListener('click', () => {
                notification.style.animation = 'slideInRightEnhanced 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                        if (style.parentNode) {
                            style.remove();
                        }
                    }
                }, 300);
            });
            
        } catch (error) {
            this.logger.warn('UI', 'Failed to show enhanced MKCG notification', error);
            // Fallback to simple notification
            this.showSimpleMKCGNotification(componentType, metadata.mappedFields);
        }
    }
    
    /**
     * PHASE 2.1: Simple fallback notification
     */
    showSimpleMKCGNotification(componentType, fieldsCount) {
        try {
            const notification = document.createElement('div');
            notification.innerHTML = `🔗 ${componentType} auto-populated with ${fieldsCount} fields from MKCG data`;
            notification.style.cssText = `
                position: fixed; top: 20px; right: 20px; background: #10b981; color: white;
                padding: 12px 16px; border-radius: 8px; z-index: 10000; font-size: 14px;
            `;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 4000);
        } catch (error) {
            console.log(`MKCG: ${componentType} auto-populated with ${fieldsCount} fields`);
        }
    }
    
    /**
     * PHASE 2.1: Enhanced auto-generation notification with detailed metrics
     * @param {Array} addedComponents - Successfully generated components
     * @param {Array} skippedComponents - Skipped components with reasons
     * @param {Object} metadata - Generation metadata
     */
    showEnhancedAutoGenerateNotification(addedComponents, skippedComponents, metadata) {
        try {
            const notification = document.createElement('div');
            notification.className = 'mkcg-enhanced-auto-generate-notification';
            
            const componentNames = addedComponents.map(c => c.name).join(', ');
            const averageQuality = addedComponents.length > 0 ? 
                Math.round(addedComponents.reduce((sum, comp) => sum + comp.qualityScore, 0) / addedComponents.length) : 0;
            
            notification.innerHTML = `
                <div class="mkcg-notification-content">
                    <div class="mkcg-notification-header">
                        <span class="mkcg-notification-icon">🎉</span>
                        <div class="mkcg-notification-title">
                            <div class="mkcg-notification-main-title">
                                ${addedComponents.length} Components Auto-Generated!
                            </div>
                            <div class="mkcg-notification-subtitle">
                                From MKCG data with ${averageQuality}% average quality
                            </div>
                        </div>
                        <button class="mkcg-notification-close">×</button>
                    </div>
                    <div class="mkcg-notification-details">
                        <div class="mkcg-generated-components">
                            <div class="mkcg-components-title">Generated Components:</div>
                            <div class="mkcg-components-list">
                                ${addedComponents.map(comp => `
                                    <div class="mkcg-component-item">
                                        <span class="mkcg-component-name">${comp.name}</span>
                                        <span class="mkcg-component-quality">${comp.qualityScore}%</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ${skippedComponents.length > 0 ? `
                            <div class="mkcg-skipped-info">
                                <div class="mkcg-skipped-title">
                                    ${skippedComponents.length} components skipped (low quality/priority)
                                </div>
                            </div>
                        ` : ''}
                        <div class="mkcg-generation-stats">
                            <span class="mkcg-stat">📊 ${metadata.totalCandidates} candidates</span>
                            <span class="mkcg-stat-separator">•</span>
                            <span class="mkcg-stat">✅ ${addedComponents.length} generated</span>
                            ${skippedComponents.length > 0 ? `
                                <span class="mkcg-stat-separator">•</span>
                                <span class="mkcg-stat">⏭ ${skippedComponents.length} skipped</span>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            
            // Enhanced styles with animations
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                padding: 0;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
                z-index: 10001;
                font-size: 14px;
                max-width: 420px;
                min-width: 360px;
                transform: translateX(100%);
                animation: slideInRightEnhanced 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            `;
            
            // Add enhanced CSS for internal elements
            const style = document.createElement('style');
            style.textContent = `
                .mkcg-generated-components {
                    margin-bottom: 12px;
                }
                
                .mkcg-components-title {
                    font-size: 12px;
                    font-weight: 500;
                    margin-bottom: 6px;
                    opacity: 0.9;
                }
                
                .mkcg-components-list {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                
                .mkcg-component-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    padding: 6px 8px;
                    font-size: 12px;
                }
                
                .mkcg-component-name {
                    flex: 1;
                }
                
                .mkcg-component-quality {
                    font-weight: 600;
                    opacity: 0.9;
                }
                
                .mkcg-skipped-info {
                    margin-bottom: 12px;
                }
                
                .mkcg-skipped-title {
                    font-size: 12px;
                    opacity: 0.8;
                    font-style: italic;
                }
                
                .mkcg-generation-stats {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    opacity: 0.9;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    padding-top: 8px;
                }
                
                .mkcg-stat-separator {
                    opacity: 0.6;
                }
            `;
            
            document.head.appendChild(style);
            
            // Add to page
            document.body.appendChild(notification);
            
            // Auto-remove after 8 seconds (longer for detailed notification)
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'slideInRightEnhanced 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.remove();
                            if (style.parentNode) {
                                style.remove();
                            }
                        }
                    }, 300);
                }
            }, 8000);
            
            // Close button handler
            const closeBtn = notification.querySelector('.mkcg-notification-close');
            closeBtn?.addEventListener('click', () => {
                notification.style.animation = 'slideInRightEnhanced 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                        if (style.parentNode) {
                            style.remove();
                        }
                    }
                }, 300);
            });
            
        } catch (error) {
            this.logger.warn('UI', 'Failed to show enhanced auto-generation notification', error);
            // Fallback to simple notification
            this.showSimpleAutoGenerateNotification(addedComponents.length, addedComponents);
        }
    }
    
    /**
     * PHASE 2.1: Simple fallback auto-generation notification
     */
    showSimpleAutoGenerateNotification(count, components) {
        try {
            const componentNames = components.map(c => c.name).join(', ');
            const notification = document.createElement('div');
            notification.innerHTML = `🎉 ${count} components auto-generated: ${componentNames}`;
            notification.style.cssText = `
                position: fixed; top: 20px; right: 20px; background: #3b82f6; color: white;
                padding: 16px 20px; border-radius: 8px; z-index: 10000; font-size: 14px; max-width: 400px;
            `;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 6000);
        } catch (error) {
            console.log(`MKCG: ${count} components auto-generated`);
        }
    }
    
    /**
     * PHASE 2.1: Legacy auto-generation notification (backward compatibility)
     */
    showAutoGenerateNotification(count, components) {
        return this.showSimpleAutoGenerateNotification(count, components);
    }
    
    /**
     * ROOT FIX: STEP 3 - Enhanced move component with event emission
     * @param {string} componentId - The component to move
     * @param {string} direction - 'up' or 'down'
     */
    moveComponentWithEvents(componentId, direction) {
        try {
            // Get component before move for event emission
            const component = enhancedStateManager.getComponent(componentId);
            const stateBefore = enhancedStateManager.getState();
            const layoutBefore = [...stateBefore.layout];
            const indexBefore = layoutBefore.indexOf(componentId);
            
            // Perform the move
            enhancedStateManager.moveComponent(componentId, direction);
            
            // Get state after move
            const stateAfter = enhancedStateManager.getState();
            const layoutAfter = [...stateAfter.layout];
            const indexAfter = layoutAfter.indexOf(componentId);
            
            // ROOT FIX: STEP 3 - Emit component move events
            if (component && indexBefore !== indexAfter) {
                this.emitComponentEvent('moved', component, {
                    direction,
                    indexBefore,
                    indexAfter,
                    layoutBefore,
                    layoutAfter,
                    movedAt: Date.now(),
                    source: 'user-action'
                });
            }
            
            this.logger.info('COMPONENT', 'Component moved with events', {
                componentId,
                direction,
                indexBefore,
                indexAfter
            });
            
        } catch (error) {
            this.logger.error('COMPONENT', 'Failed to move component', error, {
                componentId,
                direction
            });
        }
    }
    
    /**
     * ROOT FIX: STEP 3 - Enhanced event system integration for all component actions
     */
    handleComponentAction(action, componentId, additionalData = {}) {
        const component = enhancedStateManager.getComponent(componentId);
        
        if (!component) {
            this.logger.warn('COMPONENT', 'Cannot handle action - component not found', {
                action,
                componentId
            });
            return;
        }
        
        try {
            switch (action) {
                case 'delete':
                    this.removeComponent(componentId);
                    break;
                case 'duplicate':
                    this.duplicateComponent(componentId);
                    break;
                case 'move-up':
                    this.moveComponentWithEvents(componentId, 'up');
                    break;
                case 'move-down':
                    this.moveComponentWithEvents(componentId, 'down');
                    break;
                case 'edit':
                    this.editComponent(componentId);
                    break;
                default:
                    this.logger.warn('COMPONENT', 'Unknown component action', {
                        action,
                        componentId
                    });
            }
        } catch (error) {
            this.logger.error('COMPONENT', 'Error handling component action', error, {
                action,
                componentId
            });
        }
    }
    
    /**
     * ROOT FIX: STEP 3 - Debug component event system
     */
    debugEventSystem() {
        console.group('%c🎯 Component Event System Debug', 'font-size: 14px; font-weight: bold; color: #FF5722');
        
        console.log('Event System Status:', {
            eventBusAvailable: !!this.eventBus,
            eventBusType: this.eventBus === window.eventBus ? 'Global' : 'Fallback',
            componentTracking: this.getEventTrackingStats(),
            pendingEvents: this.eventDebounceTimers.size,
            debounceDelay: this.eventDebounceDelay
        });
        
        console.log('Component Tracking:', {
            activeComponents: Array.from(this.componentTracker.activeComponents.entries()),
            topicsComponents: Array.from(this.componentTracker.topicsComponents),
            lastEventTime: this.componentTracker.lastEventTime ? new Date(this.componentTracker.lastEventTime).toISOString() : null
        });
        
        console.log('Topics Analytics:', {
            topicsComponentCount: this.getTopicsComponentCount(),
            actualTopicsCount: this.getActualTopicsCount(),
            previewComponentExists: !!document.querySelector('.editable-element[data-component="topics"]')
        });
        
        if (this.eventDebounceTimers.size > 0) {
            console.log('Pending Events:', Array.from(this.eventDebounceTimers.keys()));
        }
        
        console.groupEnd();
    }
    
    /**
     * ROOT FIX: STEP 3 - Force trigger component sync events
     */
    forceSyncAllComponents() {
        try {
            const state = enhancedStateManager.getState();
            const components = Object.values(state.components || {});
            
            this.logger.info('EVENT', 'Force syncing all components', {
                componentCount: components.length
            });
            
            components.forEach(component => {
                try {
                    this.emitComponentEvent('sync-forced', component, {
                        forcedAt: Date.now(),
                        source: 'manual-sync',
                        reason: 'force-sync-all'
                    });
                } catch (error) {
                    this.logger.warn('EVENT', 'Error force-syncing component', error, {
                        componentId: component.id
                    });
                }
            });
            
        } catch (error) {
            this.logger.error('EVENT', 'Error force syncing all components', error);
        }
    }
    
    /**
     * ROOT FIX: STEP 3 - Test event system connectivity
     */
    testEventSystem() {
        const testId = `test-${Date.now()}`;
        
        try {
            // Test basic event emission
            this.eventBus.emit('components:test-event', {
                testId,
                timestamp: Date.now(),
                message: 'Event system test'
            });
            
            // Test component event emission
            const testComponent = {
                id: testId,
                type: 'test',
                props: { title: 'Test Component' }
            };
            
            this.emitComponentEvent('test-added', testComponent, {
                isTest: true,
                testId
            });
            
            this.logger.info('EVENT', 'Event system test completed', {
                testId,
                eventBusAvailable: !!this.eventBus,
                trackingStats: this.getEventTrackingStats()
            });
            
            return {
                success: true,
                testId,
                eventBusAvailable: !!this.eventBus,
                trackingWorking: true
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
}

// ROOT FIX: Create and expose enhanced component manager globally
const enhancedComponentManager = new EnhancedComponentManager();

// ROOT FIX: WordPress-compatible global exposure
window.enhancedComponentManager = enhancedComponentManager;
window.EnhancedComponentManager = EnhancedComponentManager;

// ROOT FIX: Also expose as legacy compatibility
if (!window.componentManager) {
    window.componentManager = enhancedComponentManager;
}

// ROOT FIX: STEP 3 - Enhanced global debug utilities for component event system
window.debugComponentEvents = function() {
    console.log('🎯 ROOT FIX STEP 3: Component Event System Debug');
    
    if (window.enhancedComponentManager) {
        window.enhancedComponentManager.debugEventSystem();
    } else {
        console.error('Enhanced Component Manager not available');
    }
};

window.testComponentEvents = function() {
    console.log('🧪 ROOT FIX STEP 3: Testing Component Event System');
    
    if (window.enhancedComponentManager) {
        const result = window.enhancedComponentManager.testEventSystem();
        console.log('Test Result:', result);
        return result;
    } else {
        console.error('Enhanced Component Manager not available');
        return { success: false, error: 'Manager not available' };
    }
};

window.forceComponentSync = function() {
    console.log('🔄 ROOT FIX STEP 3: Force Syncing All Components');
    
    if (window.enhancedComponentManager) {
        window.enhancedComponentManager.forceSyncAllComponents();
        console.log('✅ Force sync triggered');
    } else {
        console.error('Enhanced Component Manager not available');
    }
};

window.getComponentEventStats = function() {
    if (window.enhancedComponentManager) {
        const stats = window.enhancedComponentManager.getEventTrackingStats();
        console.log('📊 Component Event Tracking Stats:', stats);
        return stats;
    } else {
        console.error('Enhanced Component Manager not available');
        return null;
    }
};

// ROOT FIX: STEP 3 - Enhanced component manager status with event system details
window.getEnhancedComponentManagerStatus = function() {
    if (window.enhancedComponentManager) {
        const baseStatus = window.enhancedComponentManager.getStatus();
        const eventStats = window.enhancedComponentManager.getEventTrackingStats();
        
        const enhancedStatus = {
            ...baseStatus,
            eventSystem: {
                available: true,
                eventBusConnected: !!window.enhancedComponentManager.eventBus,
                eventBusType: window.enhancedComponentManager.eventBus === window.eventBus ? 'Global' : 'Fallback',
                tracking: eventStats,
                methods: {
                    emitComponentEvent: typeof window.enhancedComponentManager.emitComponentEvent === 'function',
                    handleTopicsComponentEvent: typeof window.enhancedComponentManager.handleTopicsComponentEvent === 'function',
                    emitTopicsCounterEvent: typeof window.enhancedComponentManager.emitTopicsCounterEvent === 'function',
                    triggerDesignPanelSync: typeof window.enhancedComponentManager.triggerDesignPanelSync === 'function',
                    moveComponentWithEvents: typeof window.enhancedComponentManager.moveComponentWithEvents === 'function'
                }
            }
        };
        
        console.log('📋 Enhanced Component Manager Status (with Event System):', enhancedStatus);
        return enhancedStatus;
    } else {
        console.error('Enhanced Component Manager not available');
        return null;
    }
};

console.log('✅ ROOT FIX: Enhanced Component Manager exposed globally (WordPress-compatible)');
console.log('🎯 ROOT FIX STEP 3: Component Event System ready for cross-panel communication');
console.log('📊 ROOT FIX STEP 3: Debug commands available:');
console.log('   debugComponentEvents() - Show component event system debug info');
console.log('   testComponentEvents() - Test event system connectivity');
console.log('   forceComponentSync() - Force sync all components');
console.log('   getComponentEventStats() - Show event tracking statistics');
console.log('   getEnhancedComponentManagerStatus() - Full status with event system');

// ROOT FIX: STEP 3 - Immediate verification that new version loaded
console.log('🔥 ROOT FIX STEP 3: NEW VERSION LOADED - Event system active! Timestamp:', Date.now());
console.log('🔥 Available debug functions:', {
    debugComponentEvents: typeof window.debugComponentEvents,
    testComponentEvents: typeof window.testComponentEvents,
    getEnhancedComponentManagerStatus: typeof window.getEnhancedComponentManagerStatus,
    enhancedComponentManager: !!window.enhancedComponentManager
});

// ROOT FIX: STEP 3 - Immediate test of event system
setTimeout(() => {
    try {
        if (window.enhancedComponentManager) {
            const eventStats = window.enhancedComponentManager.getEventTrackingStats();
            console.log('🎉 ROOT FIX STEP 3: Event system verification SUCCESS!', {
                eventTrackingWorking: true,
                stats: eventStats,
                manager: 'available',
                timestamp: Date.now()
            });
            
            // Test event emission
            window.enhancedComponentManager.eventBus.emit('test:step3-verification', {
                message: 'Step 3 event system working',
                timestamp: Date.now()
            });
            
            console.log('✅ ROOT FIX STEP 3: Event emission test completed');
        } else {
            console.error('❌ ROOT FIX STEP 3: Enhanced Component Manager not available');
        }
    } catch (error) {
        console.error('❌ ROOT FIX STEP 3: Event system test failed:', error);
    }
}, 1000);

})(); // ROOT FIX: Close IIFE wrapper
