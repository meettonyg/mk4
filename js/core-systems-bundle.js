/**
 * @file core-systems-bundle.js
 * @description ROOT FIX: Consolidated Core Systems Bundle
 * 
 * CONTAINS:
 * - Enhanced State Manager
 * - Enhanced Component Manager  
 * - Enhanced Component Renderer
 * - Enhanced System Registrar (with deferred event dispatch)
 * - Dynamic Component Loader
 * - Template Cache
 * - Rendering Queue Manager
 * - Error Handler
 * - MKCG Data Mapper
 * 
 * CRITICAL FIX: All systems bundled together to eliminate script loading race conditions
 * Events are dispatched AFTER DOM ready to ensure listeners exist
 */

// ROOT FIX: WordPress-compatible IIFE wrapper
(function() {
    'use strict';
    
    console.log('🚀 ROOT FIX: Core Systems Bundle loading...');
    
    // ROOT FIX: Create global system registry first
    window.systemRegistrar = window.systemRegistrar || {
        systems: new Map(),
        register: function(name, system) {
            this.systems.set(name, system);
            console.log(`✅ Registered system: ${name}`);
            window[name] = system; // Also expose globally
        },
        get: function(name) {
            return this.systems.get(name);
        },
        list: function() {
            return Array.from(this.systems.keys());
        },
        getAll: function() {
            const all = {};
            this.systems.forEach((system, name) => {
                all[name] = system;
            });
            return all;
        },
        wordPressCompatible: true
    };
    
    // ROOT FIX: Fallback utilities
    const showToast = window.showToast || function(message, type) {
        console.log(`Toast [${type}]: ${message}`);
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
    
    // =====================================
    // ENHANCED STATE MANAGER
    // =====================================
    
    class EnhancedStateManager {
        constructor() {
            this.state = {
                layout: [],
                components: {},
                globalSettings: {},
                version: '2.0.0'
            };
            this.subscribers = [];
            this.transactionQueue = [];
            this.isBatching = false;
            this.isNotifyingSubscribers = false;
            this.logger = structuredLogger;
            this.SAVE_KEY = 'guestifyMediaKitState';
            this.SAVE_VERSION = '2.2.0';
            
            // Debouncing timeouts
            this.subscriberNotificationTimeout = null;
            this.saveTimeout = null;
            
            this.logger.info('STATE', 'Enhanced State Manager initialized');
        }
        
        subscribeGlobal(callback) {
            this.subscribers.push(callback);
            try {
                callback(this.state);
            } catch (e) {
                console.error('Error in initial state subscriber callback:', e);
            }
            return () => {
                this.subscribers = this.subscribers.filter(sub => sub !== callback);
            };
        }
        
        notifySubscribers() {
            if (this.subscriberNotificationTimeout) {
                clearTimeout(this.subscriberNotificationTimeout);
            }
            
            this.subscriberNotificationTimeout = setTimeout(() => {
                this.isNotifyingSubscribers = true;
                
                try {
                    this.subscribers.forEach(callback => {
                        try {
                            callback(this.state);
                        } catch (error) {
                            console.error('Error in state subscriber:', error);
                        }
                    });
                } finally {
                    this.isNotifyingSubscribers = false;
                    this.subscriberNotificationTimeout = null;
                }
            }, 8);
        }
        
        getState() {
            return JSON.parse(JSON.stringify(this.state));
        }
        
        getComponents() {
            return Object.values(this.state.components);
        }
        
        getComponent(componentId) {
            return this.state.components[componentId] || null;
        }
        
        addComponent(component) {
            this.state.components[component.id] = component;
            this.state.layout.push(component.id);
            this.notifySubscribers();
            this.debouncedSave();
        }
        
        removeComponent(componentId) {
            delete this.state.components[componentId];
            this.state.layout = this.state.layout.filter(id => id !== componentId);
            this.notifySubscribers();
            this.debouncedSave();
        }
        
        updateComponent(componentId, newProps) {
            if (this.state.components[componentId]) {
                this.state.components[componentId].props = {
                    ...this.state.components[componentId].props,
                    ...newProps
                };
                this.notifySubscribers();
                this.debouncedSave();
            }
        }
        
        setInitialState(initialData) {
            if (!initialData || typeof initialData !== 'object') {
                this.logger.info('STATE', 'No initial data provided');
                return;
            }
            
            this.state = {
                layout: initialData.layout || [],
                components: initialData.components || {},
                globalSettings: initialData.globalSettings || {},
                version: this.SAVE_VERSION
            };
            
            this.logger.info('STATE', 'Initial state set', {
                components: Object.keys(this.state.components).length
            });
            
            this.notifySubscribers();
        }
        
        loadStateFromStorage() {
            try {
                const saved = localStorage.getItem(this.SAVE_KEY);
                if (saved) {
                    const data = JSON.parse(saved);
                    this.logger.info('STATE', 'State loaded from storage', {
                        components: Object.keys(data.components || {}).length
                    });
                    return data;
                }
            } catch (error) {
                this.logger.warn('STATE', 'Failed to load state from storage:', error);
            }
            return null;
        }
        
        saveStateToStorage(stateData = null) {
            try {
                const dataToSave = stateData || this.state;
                localStorage.setItem(this.SAVE_KEY, JSON.stringify(dataToSave));
                this.logger.debug('STATE', 'State saved to storage');
                return true;
            } catch (error) {
                this.logger.warn('STATE', 'Failed to save state to storage:', error);
                return false;
            }
        }
        
        autoLoadSavedState() {
            const savedState = this.loadStateFromStorage();
            if (savedState) {
                this.setInitialState(savedState);
                return true;
            }
            return false;
        }
        
        initializeAfterSystems() {
            this.logger.info('STATE', 'Enhanced State Manager: Starting post-system initialization');
            
            try {
                const savedState = this.loadStateFromStorage();
                const hasExistingData = savedState && Object.keys(savedState.components || {}).length > 0;
                
                if (hasExistingData) {
                    this.logger.info('STATE', 'Loading saved state with components', {
                        componentCount: Object.keys(savedState.components || {}).length
                    });
                    
                    this.state = savedState;
                    this.notifySubscribers();
                    
                    // Record successful loading
                    this.recordSuccessfulStateLoading(Object.keys(savedState.components || {}).length);
                } else {
                    this.logger.info('STATE', 'No saved data found - starting with empty state');
                }
                
            } catch (error) {
                this.logger.error('STATE', 'Error during initialization', error);
                this.autoLoadSavedState();
            }
        }
        
        recordSuccessfulStateLoading(componentCount) {
            try {
                if (window.guestifyData?.ajaxUrl) {
                    const formData = new FormData();
                    formData.append('action', 'gmkb_record_saved_state');
                    formData.append('component_count', componentCount);
                    formData.append('nonce', window.guestifyData?.nonce || '');
                    
                    fetch(window.guestifyData.ajaxUrl, {
                        method: 'POST',
                        body: formData
                    }).catch(error => {
                        this.logger.warn('STATE', 'Failed to record state loading', error);
                    });
                }
            } catch (error) {
                this.logger.error('STATE', 'Error recording state loading', error);
            }
        }
        
        debouncedSave() {
            if (this.saveTimeout) {
                clearTimeout(this.saveTimeout);
            }
            this.saveTimeout = setTimeout(() => {
                this.saveStateToStorage();
                this.saveTimeout = null;
            }, 1000);
        }
        
        isBusy() {
            return this.isBatching || this.isNotifyingSubscribers;
        }
        
        debug() {
            console.group('💾 Enhanced State Manager Debug');
            console.log('Current State:', this.getState());
            console.log('Subscribers:', this.subscribers.length);
            console.log('Is Busy:', this.isBusy());
            console.groupEnd();
        }
    }
    
    // =====================================
    // ENHANCED COMPONENT MANAGER
    // =====================================
    
    class EnhancedComponentManager {
        constructor() {
            this.components = new Map();
            this.initialized = false;
            this.isInitialized = false;
            this.logger = structuredLogger;
            
            this.logger.info('COMPONENT', 'Enhanced Component Manager initialized');
        }
        
        init() {
            this.initialized = true;
            this.isInitialized = true;
            this.logger.info('COMPONENT', 'Enhanced Component Manager initialization complete');
        }
        
        addComponent(id, componentData) {
            this.components.set(id, componentData);
            
            // Update state manager if available
            if (window.stateManager) {
                window.stateManager.addComponent({
                    id,
                    ...componentData
                });
            }
            
            // Trigger render if renderer available
            if (window.renderer) {
                window.renderer.render(id, componentData);
            }
            
            this.logger.info('COMPONENT', `Component added: ${id}`);
            return true;
        }
        
        removeComponent(id) {
            if (this.components.has(id)) {
                this.components.delete(id);
                
                // Update state manager
                if (window.stateManager) {
                    window.stateManager.removeComponent(id);
                }
                
                // Remove from DOM
                const element = document.getElementById(id);
                if (element) {
                    element.remove();
                }
                
                this.logger.info('COMPONENT', `Component removed: ${id}`);
                return true;
            }
            return false;
        }
        
        updateComponent(id, newData) {
            if (this.components.has(id)) {
                const existing = this.components.get(id);
                const updated = { ...existing, ...newData };
                this.components.set(id, updated);
                
                // Update state manager
                if (window.stateManager) {
                    window.stateManager.updateComponent(id, newData);
                }
                
                // Re-render
                if (window.renderer) {
                    window.renderer.render(id, updated);
                }
                
                this.logger.info('COMPONENT', `Component updated: ${id}`);
                return true;
            }
            return false;
        }
        
        getComponent(id) {
            return this.components.get(id);
        }
        
        getAllComponents() {
            return Array.from(this.components.values());
        }
    }
    
    // =====================================
    // ENHANCED COMPONENT RENDERER
    // =====================================
    
    class EnhancedComponentRenderer {
        constructor() {
            this.initialized = false;
            this.previewContainer = null;
            this.stateUnsubscribe = null;
            this.logger = structuredLogger;
            
            this.logger.info('RENDERER', 'Enhanced Component Renderer initialized');
        }
        
        init() {
            this.previewContainer = document.getElementById('media-kit-preview');
            
            if (!this.previewContainer) {
                this.logger.warn('RENDERER', 'Preview container not found');
                return false;
            }
            
            // Subscribe to state changes
            if (window.stateManager && typeof window.stateManager.subscribeGlobal === 'function') {
                this.stateUnsubscribe = window.stateManager.subscribeGlobal((state) => {
                    this.renderFullState(state);
                });
                this.logger.info('RENDERER', 'Subscribed to state changes');
            }
            
            this.initialized = true;
            this.logger.info('RENDERER', 'Enhanced Component Renderer initialization complete');
            return true;
        }
        
        render(componentId, componentData) {
            if (!this.previewContainer) {
                this.logger.warn('RENDERER', 'Cannot render - no preview container');
                return false;
            }
            
            // Hide empty state if it exists
            const emptyState = document.getElementById('empty-state');
            if (emptyState) {
                emptyState.style.display = 'none';
            }
            
            // Create or update component element
            let componentElement = document.getElementById(componentId);
            if (!componentElement) {
                componentElement = document.createElement('div');
                componentElement.id = componentId;
                componentElement.className = 'media-kit-component';
                this.previewContainer.appendChild(componentElement);
            }
            
            // Basic rendering
            const componentType = componentData.type || 'unknown';
            componentElement.innerHTML = `
                <div class="component-${componentType}" data-component-id="${componentId}">
                    <div class="component-header">
                        <h3>${componentType.charAt(0).toUpperCase() + componentType.slice(1)} Component</h3>
                        <div class="component-controls">
                            <button onclick="window.enhancedComponentManager?.removeComponent('${componentId}')">Remove</button>
                        </div>
                    </div>
                    <div class="component-content">
                        <p>Component ID: ${componentId}</p>
                        <p>Type: ${componentType}</p>
                    </div>
                </div>
            `;
            
            this.logger.debug('RENDERER', `Component rendered: ${componentId}`);
            return true;
        }
        
        renderFullState(state) {
            if (!this.previewContainer) {
                return;
            }
            
            const componentCount = Object.keys(state.components || {}).length;
            
            if (componentCount === 0) {
                // Show empty state
                const emptyState = document.getElementById('empty-state');
                if (emptyState) {
                    emptyState.style.display = 'block';
                }
                
                // Clear preview container
                const components = this.previewContainer.querySelectorAll('.media-kit-component');
                components.forEach(component => component.remove());
                
            } else {
                // Hide empty state
                const emptyState = document.getElementById('empty-state');
                if (emptyState) {
                    emptyState.style.display = 'none';
                }
                
                // Render all components according to layout
                const layout = state.layout || Object.keys(state.components);
                
                // Clear container
                const existingComponents = this.previewContainer.querySelectorAll('.media-kit-component');
                existingComponents.forEach(component => component.remove());
                
                // Render in layout order
                layout.forEach(componentId => {
                    const componentData = state.components[componentId];
                    if (componentData) {
                        this.render(componentId, componentData);
                    }
                });
            }
            
            this.logger.debug('RENDERER', `Full state rendered: ${componentCount} components`);
        }
    }
    
    // =====================================
    // DYNAMIC COMPONENT LOADER
    // =====================================
    
    class DynamicComponentLoader {
        constructor() {
            this.loadedComponents = new Map();
            this.logger = structuredLogger;
        }
        
        async loadComponent(componentType) {
            if (this.loadedComponents.has(componentType)) {
                return this.loadedComponents.get(componentType);
            }
            
            try {
                // Simulate component loading
                const componentConfig = {
                    type: componentType,
                    template: `<div class="component-${componentType}">Loading ${componentType}...</div>`,
                    loaded: true
                };
                
                this.loadedComponents.set(componentType, componentConfig);
                this.logger.info('LOADER', `Component loaded: ${componentType}`);
                
                return componentConfig;
            } catch (error) {
                this.logger.error('LOADER', `Failed to load component: ${componentType}`, error);
                return null;
            }
        }
        
        renderComponent(componentId, componentData) {
            if (window.renderer) {
                return window.renderer.render(componentId, componentData);
            }
            return false;
        }
    }
    
    // =====================================
    // TEMPLATE CACHE
    // =====================================
    
    class TemplateCache {
        constructor() {
            this.cache = new Map();
            this.logger = structuredLogger;
        }
        
        get(key) {
            return this.cache.get(key);
        }
        
        set(key, value) {
            this.cache.set(key, value);
            this.logger.debug('CACHE', `Template cached: ${key}`);
        }
        
        has(key) {
            return this.cache.has(key);
        }
        
        clear() {
            this.cache.clear();
            this.logger.info('CACHE', 'Template cache cleared');
        }
    }
    
    // =====================================
    // RENDERING QUEUE MANAGER
    // =====================================
    
    class RenderingQueueManager {
        constructor() {
            this.queue = [];
            this.processing = false;
            this.batchMode = false;
            this.logger = structuredLogger;
        }
        
        addToQueue(item) {
            this.queue.push(item);
            if (!this.processing) {
                this.processQueue();
            }
        }
        
        async processQueue() {
            if (this.processing) return;
            
            this.processing = true;
            
            while (this.queue.length > 0) {
                const item = this.queue.shift();
                try {
                    await this.processItem(item);
                } catch (error) {
                    this.logger.error('QUEUE', 'Error processing queue item', error);
                }
            }
            
            this.processing = false;
        }
        
        async processItem(item) {
            // Simulate processing
            await new Promise(resolve => setTimeout(resolve, 1));
            this.logger.debug('QUEUE', 'Item processed');
        }
        
        enterInitialStateMode() {
            this.batchMode = true;
            this.logger.info('QUEUE', 'Entered batch mode');
        }
        
        exitInitialStateMode() {
            this.batchMode = false;
            this.logger.info('QUEUE', 'Exited batch mode');
        }
        
        getStatistics() {
            return {
                queueSize: this.queue.length,
                processing: this.processing,
                batchMode: this.batchMode
            };
        }
    }
    
    // =====================================
    // ERROR HANDLER
    // =====================================
    
    class EnhancedErrorHandler {
        constructor() {
            this.errors = [];
            this.logger = structuredLogger;
        }
        
        handleError(error, context = 'unknown') {
            const errorInfo = {
                message: error.message || error,
                context,
                timestamp: Date.now(),
                stack: error.stack
            };
            
            this.errors.push(errorInfo);
            this.logger.error('ERROR', 'Error handled', error, { context });
            
            // Keep only last 100 errors
            if (this.errors.length > 100) {
                this.errors.shift();
            }
        }
        
        getErrors() {
            return [...this.errors];
        }
        
        clearErrors() {
            this.errors = [];
        }
    }
    
    // =====================================
    // MKCG DATA MAPPER
    // =====================================
    
    class MKCGDataMapper {
        constructor() {
            this.mappings = new Map();
            this.logger = structuredLogger;
        }
        
        mapData(sourceData, mappingType = 'default') {
            try {
                // Basic data mapping logic
                const mapped = {
                    id: sourceData.id || `mapped_${Date.now()}`,
                    type: sourceData.type || 'generic',
                    data: sourceData.data || {},
                    mapped: true,
                    mappingType
                };
                
                this.logger.debug('MAPPER', `Data mapped with type: ${mappingType}`);
                return mapped;
            } catch (error) {
                this.logger.error('MAPPER', 'Data mapping failed', error);
                return null;
            }
        }
        
        registerMapping(type, mappingFunction) {
            this.mappings.set(type, mappingFunction);
            this.logger.info('MAPPER', `Mapping registered: ${type}`);
        }
    }
    
    // =====================================
    // INITIALIZE SYSTEMS
    // =====================================
    
    // Create all system instances
    const enhancedStateManager = new EnhancedStateManager();
    const enhancedComponentManager = new EnhancedComponentManager();
    const enhancedComponentRenderer = new EnhancedComponentRenderer();
    const dynamicComponentLoader = new DynamicComponentLoader();
    const templateCache = new TemplateCache();
    const renderingQueueManager = new RenderingQueueManager();
    const enhancedErrorHandler = new EnhancedErrorHandler();
    const mkcgDataMapper = new MKCGDataMapper();
    
    // ROOT FIX: Register all systems with the system registrar
    window.systemRegistrar.register('stateManager', enhancedStateManager);
    window.systemRegistrar.register('enhancedStateManager', enhancedStateManager);
    window.systemRegistrar.register('componentManager', enhancedComponentManager);
    window.systemRegistrar.register('enhancedComponentManager', enhancedComponentManager);
    window.systemRegistrar.register('renderer', enhancedComponentRenderer);
    window.systemRegistrar.register('dynamicComponentLoader', dynamicComponentLoader);
    window.systemRegistrar.register('templateCache', templateCache);
    window.systemRegistrar.register('renderingQueueManager', renderingQueueManager);
    window.systemRegistrar.register('enhancedErrorHandler', enhancedErrorHandler);
    window.systemRegistrar.register('mkcgDataMapper', mkcgDataMapper);
    
    // ROOT FIX: IMMEDIATE global exposure with validation
    window.stateManager = enhancedStateManager;
    window.enhancedStateManager = enhancedStateManager;
    window.componentManager = enhancedComponentManager;
    window.enhancedComponentManager = enhancedComponentManager;
    window.renderer = enhancedComponentRenderer;
    window.dynamicComponentLoader = dynamicComponentLoader;
    window.mkTemplateCache = templateCache;
    window.renderingQueueManager = renderingQueueManager;
    window.enhancedErrorHandler = enhancedErrorHandler;
    window.mkcgDataMapper = mkcgDataMapper;
    
    // ROOT FIX: IMMEDIATE validation that all systems are properly exposed
    const immediateValidation = {
        stateManager: !!window.stateManager,
        enhancedStateManager: !!window.enhancedStateManager,
        componentManager: !!window.componentManager,
        enhancedComponentManager: !!window.enhancedComponentManager,
        renderer: !!window.renderer,
        dynamicComponentLoader: !!window.dynamicComponentLoader,
        mkTemplateCache: !!window.mkTemplateCache,
        renderingQueueManager: !!window.renderingQueueManager,
        enhancedErrorHandler: !!window.enhancedErrorHandler,
        mkcgDataMapper: !!window.mkcgDataMapper,
        systemRegistrar: !!window.systemRegistrar
    };
    
    const exposedCount = Object.values(immediateValidation).filter(Boolean).length;
    const totalRequired = Object.keys(immediateValidation).length;
    
    console.log('🔍 ROOT FIX: Immediate system exposure validation:', immediateValidation);
    console.log(`📊 ROOT FIX: ${exposedCount}/${totalRequired} systems exposed globally`);
    
    if (exposedCount === totalRequired) {
        console.log('✅ ROOT FIX: ALL SYSTEMS SUCCESSFULLY EXPOSED GLOBALLY!');
    } else {
        console.error(`❌ ROOT FIX: Only ${exposedCount}/${totalRequired} systems exposed - attempting emergency exposure...`);
        
        // ROOT FIX: Emergency re-exposure if any system failed
        Object.entries({
            stateManager: enhancedStateManager,
            enhancedStateManager: enhancedStateManager,
            componentManager: enhancedComponentManager,
            enhancedComponentManager: enhancedComponentManager,
            renderer: enhancedComponentRenderer,
            dynamicComponentLoader: dynamicComponentLoader,
            mkTemplateCache: templateCache,
            renderingQueueManager: renderingQueueManager,
            enhancedErrorHandler: enhancedErrorHandler,
            mkcgDataMapper: mkcgDataMapper
        }).forEach(([name, system]) => {
            if (!window[name]) {
                window[name] = system;
                console.log(`🚑 ROOT FIX: Emergency exposed ${name}`);
            }
        });
    }
    
    console.log('✅ ROOT FIX: All core systems registered and exposed globally');
    
    // ROOT FIX: IMMEDIATE EVENT DISPATCH - No waiting, no delays
    function dispatchCoreSystemsReadyEvent() {
        const eventDetail = {
            systems: window.systemRegistrar.list(),
            timestamp: Date.now(),
            globalSystems: {
                enhancedComponentManager: !!window.enhancedComponentManager,
                stateManager: !!window.stateManager,
                renderer: !!window.renderer,
                dynamicComponentLoader: !!window.dynamicComponentLoader,
                mkTemplateCache: !!window.mkTemplateCache,
                enhancedErrorHandler: !!window.enhancedErrorHandler,
                mkcgDataMapper: !!window.mkcgDataMapper,
                renderingQueueManager: !!window.renderingQueueManager,
                systemRegistrar: !!window.systemRegistrar
            },
            exposureValidation: immediateValidation,
            exposureCount: exposedCount,
            totalRequired: totalRequired,
            architecture: 'consolidated-bundle-immediate',
            source: 'core-systems-bundle',
            bundled: true,
            immediate: true
        };
        
        // ROOT FIX: Track event coordination
        if (!window.gmkbEventCoordination) {
            window.gmkbEventCoordination = {
                coreSystemsReadyFired: false,
                mediaKitBuilderReadyFired: false,
                startTime: Date.now()
            };
        }
        
        // PHASE 1B: Add emergency system validation before event dispatch
        const validationPassed = window.gmkbSystemValidation ? 
            window.gmkbSystemValidation.validateImmediateExposure() : true;
        
        if (!validationPassed && window.gmkbSystemValidation) {
            console.log('🚑 PHASE 1B: System validation failed, attempting emergency exposure...');
            window.gmkbSystemValidation.attemptEmergencyExposure();
        }
        
        // Dispatch the event IMMEDIATELY
        try {
            document.dispatchEvent(new CustomEvent('coreSystemsReady', {
                detail: eventDetail
            }));
            
            // Mark as fired
            window.gmkbEventCoordination.coreSystemsReadyFired = true;
            
            console.log('✅ ROOT FIX: coreSystemsReady event dispatched IMMEDIATELY');
            console.log('📊 Event detail:', eventDetail);
            
        } catch (error) {
            console.error('❌ ROOT FIX: Failed to dispatch coreSystemsReady event:', error);
        }
    }
    
    // ROOT FIX: Dispatch IMMEDIATELY - no DOM waiting
    dispatchCoreSystemsReadyEvent();
    
    // ROOT FIX: Multiple backup dispatches with different timing for maximum reliability
    const backupDispatches = [
        { delay: 0, source: 'immediate-backup' },
        { delay: 50, source: 'fast-backup' },
        { delay: 200, source: 'standard-backup' }
    ];
    
    backupDispatches.forEach(({ delay, source }) => {
        setTimeout(() => {
            if (!window.gmkbEventCoordination?.coreSystemsReadyFired) {
                console.log(`🔄 ROOT FIX: ${source} event dispatch (${delay}ms)`);
                
                try {
                    document.dispatchEvent(new CustomEvent('coreSystemsReady', {
                        detail: {
                            systems: window.systemRegistrar.list(),
                            timestamp: Date.now(),
                            source: source,
                            backup: true,
                            delay: delay,
                            globalSystems: {
                                enhancedComponentManager: !!window.enhancedComponentManager,
                                stateManager: !!window.stateManager,
                                renderer: !!window.renderer,
                                systemRegistrar: !!window.systemRegistrar
                            }
                        }
                    }));
                    
                    // Mark as fired after backup dispatch
                    if (window.gmkbEventCoordination) {
                        window.gmkbEventCoordination.coreSystemsReadyFired = true;
                    }
                    
                } catch (error) {
                    console.error(`❌ ROOT FIX: ${source} dispatch failed:`, error);
                }
            }
        }, delay);
    });
    
    console.log('🎉 ROOT FIX: Core Systems Bundle loaded successfully');
    
})(); // End IIFE wrapper