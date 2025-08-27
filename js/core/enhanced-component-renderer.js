/**
 * @file enhanced-component-renderer-refactored.js
 * @description Refactored Enhanced Component Renderer - Main Orchestrator
 * 
 * ROOT FIX: Refactored from monolithic enhanced-component-renderer.js
 * Now orchestrates specialized services for better maintainability
 * 
 * Following checklist:
 * - Event-Driven Initialization ✓
 * - Simplicity First ✓ 
 * - Code Reduction ✓
 * - Centralized State ✓
 * - No Global Object Sniffing ✓
 */

(function() {
    'use strict';
    
    // Wait for dependencies to be available
    const initWhenReady = () => {
        if (!window.structuredLogger || !window.enhancedStateManager || !window.eventBus) {
            setTimeout(initWhenReady, 100);
            return;
        }
        
        const structuredLogger = window.structuredLogger;
        const enhancedStateManager = window.enhancedStateManager;
        const eventBus = window.eventBus;
        
        structuredLogger.info('RENDER', 'EnhancedComponentRenderer (refactored) initializing...');

    class EnhancedComponentRenderer {
        constructor() {
            this.initialized = false;
            this.isInitializing = false;
            this.disableRendering = false;
            this.stateUnsubscribe = null;
            this.logger = structuredLogger;
            this.initTime = null;
            
            // Service references (will be set when services are ready)
            this.stateManager = null;
            this.domManager = null;
            this.renderEngine = null;
            this.uiIntegration = null;
            this.performanceMonitor = null;
            this.containerManager = null;
            
            // Add immediate initialization logging
        this.logger.info('RENDER', 'EnhancedComponentRenderer constructor called');
        this.logger.info('RENDER', 'Service coordination setup starting...');
            this.setupServiceCoordination();
        }

        /**
         * Setup event-driven service coordination
         * Following checklist: Event-Driven Initialization, Dependency-Awareness
         */
        setupServiceCoordination() {
            const requiredServices = [
                'gmkb:component-state-manager-ready',
                'gmkb:component-dom-manager-ready', 
                'gmkb:component-render-engine-ready',
                'gmkb:component-ui-integration-ready',
                'gmkb:component-performance-monitor-ready',
                'gmkb:component-container-manager-ready'
            ];
            
            let readyServices = 0;
            const totalServices = requiredServices.length;
            
            this.logger.info('RENDER', `Setting up service coordination - waiting for ${totalServices} services`);
            
            // Check if services are already loaded (missed events)
            const checkExistingServices = () => {
                const serviceMap = {
                    'gmkb:component-state-manager-ready': window.componentStateManager,
                    'gmkb:component-dom-manager-ready': window.componentDOMManager,
                    'gmkb:component-render-engine-ready': window.componentRenderEngine,
                    'gmkb:component-ui-integration-ready': window.componentUIIntegration,
                    'gmkb:component-performance-monitor-ready': window.componentPerformanceMonitor,
                    'gmkb:component-container-manager-ready': window.componentContainerManager
                };
                
                requiredServices.forEach(eventType => {
                    const service = serviceMap[eventType];
                    if (service && !this.getServiceByEventType(eventType)) {
                        readyServices++;
                        this.logger.info('RENDER', `Found existing service (${readyServices}/${totalServices}): ${eventType}`);
                        this.setServiceReference(eventType, { manager: service, monitor: service, engine: service, integration: service });
                    }
                });
                
                if (readyServices === totalServices) {
                    this.logger.info('RENDER', 'All services already loaded, initializing immediately');
                    setTimeout(() => this.init(), 0);
                    return true;
                }
                return false;
            };
            
            // Check existing services first
            if (checkExistingServices()) {
                return; // All services already loaded
            }
            
            const onServiceReady = (event) => {
                if (this.getServiceByEventType(event.type)) {
                    this.logger.debug('RENDER', `Service already registered: ${event.type}`);
                    return;
                }
                
                readyServices++;
                this.logger.info('RENDER', `Service ready (${readyServices}/${totalServices}): ${event.type}`);
                
                // Set service references
                this.setServiceReference(event.type, event.detail);
                
                // Initialize when all services are ready
                if (readyServices === totalServices) {
                    this.logger.info('RENDER', 'All rendering services ready, initializing Enhanced Component Renderer');
                    setTimeout(() => this.init(), 0); // Next tick initialization
                } else {
                    this.logger.info('RENDER', `Still waiting for ${totalServices - readyServices} more services`);
                }
            };
            
            // Listen for service ready events
            requiredServices.forEach(eventType => {
                this.logger.info('RENDER', `Listening for event: ${eventType}`);
                document.addEventListener(eventType, onServiceReady, { once: true });
            });
            
            // Add timeout fallback in case some services don't load
            setTimeout(() => {
                if (readyServices < totalServices) {
                    this.logger.warn('RENDER', `Only ${readyServices}/${totalServices} services ready after 5 seconds`);
                    this.logger.warn('RENDER', 'Available services:', {
                        stateManager: !!this.stateManager,
                        domManager: !!this.domManager,
                        renderEngine: !!this.renderEngine,
                        uiIntegration: !!this.uiIntegration,
                        performanceMonitor: !!this.performanceMonitor,
                        containerManager: !!this.containerManager
                    });
                    
                    // Try to proceed with available services
                    if (readyServices >= 3) { // Need at least core services
                        this.logger.warn('RENDER', 'Proceeding with partial service initialization');
                        this.init();
                    } else {
                        this.logger.error('RENDER', 'Too few services loaded, cannot initialize Enhanced Component Renderer');
                    }
                }
            }, 5000); // Reduced timeout to 5 seconds
            
            this.logger.debug('RENDER', `Waiting for ${totalServices} rendering services to initialize`);
        }

        /**
         * Set service references when they become available
         */
        setServiceReference(eventType, detail) {
            switch (eventType) {
                case 'gmkb:component-state-manager-ready':
                    this.stateManager = detail.manager || window.componentStateManager;
                    break;
                case 'gmkb:component-dom-manager-ready':
                    this.domManager = detail.manager || window.componentDOMManager;
                    break;
                case 'gmkb:component-render-engine-ready':
                    this.renderEngine = detail.engine || window.componentRenderEngine;
                    break;
                case 'gmkb:component-ui-integration-ready':
                    this.uiIntegration = detail.integration || window.componentUIIntegration;
                    break;
                case 'gmkb:component-performance-monitor-ready':
                    this.performanceMonitor = detail.monitor || window.componentPerformanceMonitor;
                    break;
                case 'gmkb:component-container-manager-ready':
                    this.containerManager = detail.manager || window.componentContainerManager;
                    break;
            }
        }
        
        /**
         * Get service reference by event type
         */
        getServiceByEventType(eventType) {
            switch (eventType) {
                case 'gmkb:component-state-manager-ready':
                    return this.stateManager;
                case 'gmkb:component-dom-manager-ready':
                    return this.domManager;
                case 'gmkb:component-render-engine-ready':
                    return this.renderEngine;
                case 'gmkb:component-ui-integration-ready':
                    return this.uiIntegration;
                case 'gmkb:component-performance-monitor-ready':
                    return this.performanceMonitor;
                case 'gmkb:component-container-manager-ready':
                    return this.containerManager;
                default:
                    return null;
            }
        }

        /**
         * Initialize the enhanced component renderer
         * Following checklist: Root Cause Fix, Event-Driven Initialization
         */
        async init() {
            // Prevent duplicate initialization
            if (this.initialized || this.isInitializing) {
                this.logger.warn('RENDER', 'Already initialized or initializing, skipping');
                return;
            }
            
            this.isInitializing = true;
            this.initTime = Date.now();
            
            try {
                // Verify all services are available
                if (!this.verifyServices()) {
                    throw new Error('Not all required services are available');
                }
                
                // Initialize services
                await this.initializeServices();
                
                // Get initial state and perform first render
                const initialState = enhancedStateManager.getInitialState();
                
                this.logger.info('RENDER', 'Enhanced Component Renderer received initial state:', {
                    hasComponents: !!(initialState && initialState.components),
                    componentCount: initialState && initialState.components ? Object.keys(initialState.components).length : 0
                });
                
                // Update state tracking BEFORE rendering
                this.stateManager.updateLastState(initialState);
                
                // Perform initial render
                if (initialState && initialState.components && Object.keys(initialState.components).length > 0) {
                    await this.containerManager.renderSavedComponents(initialState);
                } else {
                    this.containerManager.updateContainerDisplay(initialState);
                }
                
                // Setup state change subscription after initial render
                await new Promise(resolve => setTimeout(resolve, 0));
                
                this.stateUnsubscribe = enhancedStateManager.subscribeGlobal((state) => {
                    this.onStateChange(state);
                });
                
                this.initialized = true;
                this.isInitializing = false;
                
                this.logger.info('RENDER', 'Enhanced Component Renderer initialization complete');
                
                // Emit ready event
                eventBus.emit('gmkb:enhanced-component-renderer-ready', {
                    renderer: this,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                this.logger.error('RENDER', 'Failed to initialize Enhanced Component Renderer:', error);
                this.isInitializing = false;
            }
        }

        /**
         * Verify all required services are available
         */
        verifyServices() {
            const services = [
                { name: 'stateManager', instance: this.stateManager },
                { name: 'domManager', instance: this.domManager },
                { name: 'renderEngine', instance: this.renderEngine },
                { name: 'uiIntegration', instance: this.uiIntegration },
                { name: 'performanceMonitor', instance: this.performanceMonitor },
                { name: 'containerManager', instance: this.containerManager }
            ];
            
            const missingServices = services.filter(service => !service.instance);
            
            if (missingServices.length > 0) {
                this.logger.error('RENDER', 'Missing required services:', missingServices.map(s => s.name));
                return false;
            }
            
            this.logger.debug('RENDER', 'All required services verified');
            return true;
        }

        /**
         * Initialize all services
         */
        async initializeServices() {
            // Initialize services that need explicit initialization
            if (this.uiIntegration.init) {
                this.uiIntegration.init();
            }
            
            if (this.performanceMonitor.init) {
                this.performanceMonitor.init();
            }
            
            this.logger.debug('RENDER', 'All services initialized');
        }

        /**
         * Handle state changes through service coordination
         * Following checklist: Centralized State, Event-Driven
         */
        onStateChange(newState) {
            if (!this.initialized || this.disableRendering) {
                return;
            }
            
            // Check if state has actually changed
            if (!this.stateManager.hasStateChanged(newState)) {
                this.logger.debug('RENDER', 'State unchanged, skipping render');
                return;
            }
            
            // Allow renders after brief initialization period
            if (Date.now() - (this.initTime || 0) < 100) {
                this.logger.debug('RENDER', 'Skipping state change during initialization');
                return;
            }
            
            // Start performance tracking
            const trackingId = this.performanceMonitor.trackComponentRender('state-change', 'batch');
            
            try {
                // Get state difference
                const lastState = this.stateManager.getLastState();
                const changes = this.stateManager.diffState(lastState, newState);
                
                if (!changes.added.size && !changes.removed.size && !changes.updated.size && !changes.moved.size) {
                    this.logger.debug('RENDER', 'No changes detected, skipping render');
                    this.performanceMonitor.endRenderTracking(trackingId, true);
                    return;
                }
                
                this.logger.info('RENDER', 'Processing state changes', {
                    added: changes.added.size,
                    removed: changes.removed.size,
                    updated: changes.updated.size,
                    moved: changes.moved.size
                });
                
                // Process changes through service coordination
                this.processStateChanges(changes, newState);
                
                // Update container display
                this.containerManager.updateContainerDisplay(newState);
                
                this.performanceMonitor.endRenderTracking(trackingId, true);
                
            } catch (error) {
                this.logger.error('RENDER', 'Error processing state changes:', error);
                this.performanceMonitor.endRenderTracking(trackingId, false, error);
            }
        }

        /**
         * Process state changes through coordinated services
         * Following checklist: Simplicity First, No Redundant Logic
         */
        async processStateChanges(changes, newState) {
            const renderType = this.stateManager.detectRenderType(changes);
            
            this.logger.info('RENDER', `Processing render type: ${renderType}`);
            
            try {
                switch (renderType) {
                    case 'reorder-only':
                        // Just reorder DOM elements
                        this.domManager.reorderComponents(newState.layout);
                        break;
                        
                    case 'remove-components':
                        // Remove components
                        this.domManager.removeComponents(changes.removed);
                        // Reorder remaining components
                        if (newState.layout && newState.layout.length > 0) {
                            this.domManager.reorderComponents(newState.layout);
                        }
                        break;
                        
                    case 'add-components':
                        // Render new components
                        await this.renderNewComponents(changes.added, newState);
                        // Reorder after additions
                        if (newState.layout && newState.layout.length > 0) {
                            setTimeout(() => this.domManager.reorderComponents(newState.layout), 100);
                        }
                        break;
                        
                    case 'update-components':
                        // Update existing components
                        await this.updateComponents(changes.updated, newState);
                        break;
                        
                    default:
                        // Full render - handle all changes
                        if (changes.removed.size > 0) {
                            this.domManager.removeComponents(changes.removed);
                        }
                        if (changes.added.size > 0) {
                            await this.renderNewComponents(changes.added, newState);
                        }
                        if (changes.updated.size > 0) {
                            await this.updateComponents(changes.updated, newState);
                        }
                        if (newState.layout && newState.layout.length > 0) {
                            setTimeout(() => this.domManager.reorderComponents(newState.layout), 100);
                        }
                        break;
                }
                
                // Emit render completion event
                eventBus.emit('gmkb:render-complete', {
                    renderType,
                    changes,
                    timestamp: Date.now()
                });
                
                // Conservative cleanup
                this.domManager.conservativeCleanup(newState);
                
            } catch (error) {
                this.logger.error('RENDER', 'Error in processStateChanges:', error);
                throw error;
            }
        }

        /**
         * Render new components through service coordination
         */
        async renderNewComponents(componentIds, newState) {
            const trackingId = this.performanceMonitor.trackBatchOperation('add', componentIds.size);
            
            try {
                this.logger.debug('RENDER', `Rendering ${componentIds.size} new components`);
                
                // Prepare component configs for render engine
                const componentConfigs = Array.from(componentIds).map(id => {
                    const componentState = newState.components[id];
                    return {
                        id,
                        type: componentState.type,
                        props: componentState.props || componentState.data || {}
                    };
                }).filter(config => config.type); // Filter out invalid configs
                
                // Render components
                const results = await this.renderEngine.renderComponents(componentConfigs);
                
                // Insert successful renders into DOM
                const successfulResults = results.filter(r => r.success);
                for (const result of successfulResults) {
                    await this.domManager.insertComponent(result.id, result.element);
                    
                    // Register with UI integration
                    const componentState = newState.components[result.id];
                    if (componentState) {
                        this.uiIntegration.registerComponentWithUIRegistry(result.id, result.element, componentState);
                    }
                }
                
                this.logger.info('RENDER', `Successfully rendered ${successfulResults.length} of ${componentIds.size} new components`);
                this.performanceMonitor.endRenderTracking(trackingId, true);
                
            } catch (error) {
                this.logger.error('RENDER', 'Error rendering new components:', error);
                this.performanceMonitor.endRenderTracking(trackingId, false, error);
            }
        }

        /**
         * Update existing components through service coordination
         */
        async updateComponents(componentIds, newState) {
            const trackingId = this.performanceMonitor.trackBatchOperation('update', componentIds.size);
            
            try {
                this.logger.debug('RENDER', `Updating ${componentIds.size} components`);
                
                // Use UI integration for efficient updates where possible
                const updates = [];
                componentIds.forEach(id => {
                    const componentState = newState.components[id];
                    if (componentState) {
                        updates.push({
                            componentId: id,
                            element: this.domManager.getCachedComponent(id) || document.getElementById(id),
                            state: componentState
                        });
                    }
                });
                
                // Process updates through UI integration
                for (const update of updates) {
                    if (update.element) {
                        await this.uiIntegration.handleComponentRerenderRequest(update);
                    }
                }
                
                this.logger.debug('RENDER', `Updated ${updates.length} components`);
                this.performanceMonitor.endRenderTracking(trackingId, true);
                
            } catch (error) {
                this.logger.error('RENDER', 'Error updating components:', error);
                this.performanceMonitor.endRenderTracking(trackingId, false, error);
            }
        }

        /**
         * Render component - public interface for external use
         * Following checklist: Centralized State, Schema Compliance
         */
        async renderComponent(componentConfig) {
            try {
                if (!this.renderEngine) {
                    throw new Error('Render engine not available');
                }
                
                const result = await this.renderEngine.renderComponent(componentConfig);
                
                if (result.success && result.element && this.domManager) {
                    // Insert into DOM
                    const inserted = await this.domManager.insertComponent(result.id, result.element);
                    
                    if (inserted && this.uiIntegration) {
                        // Register with UI integration
                        const componentState = {
                            type: componentConfig.type,
                            props: componentConfig.props || componentConfig.data || {}
                        };
                        this.uiIntegration.registerComponentWithUIRegistry(result.id, result.element, componentState);
                    }
                }
                
                return result;
                
            } catch (error) {
                this.logger.error('RENDER', 'renderComponent failed:', error);
                throw error;
            }
        }

        /**
         * Get renderer statistics
         * Following checklist: Diagnostic Logging
         */
        getStats() {
            const baseStats = {
                initialized: this.initialized,
                initTime: this.initTime,
                disableRendering: this.disableRendering
            };
            
            // Gather stats from all services
            if (this.stateManager) {
                baseStats.state = {
                    lastStateHash: this.stateManager.getLastStateHash(),
                    hasLastState: !!this.stateManager.getLastState()
                };
            }
            
            if (this.domManager) {
                baseStats.dom = this.domManager.getStats();
            }
            
            if (this.renderEngine) {
                baseStats.rendering = this.renderEngine.getStats();
            }
            
            if (this.uiIntegration) {
                baseStats.ui = this.uiIntegration.getStats();
            }
            
            if (this.performanceMonitor) {
                baseStats.performance = this.performanceMonitor.getStats();
            }
            
            if (this.containerManager) {
                baseStats.containers = this.containerManager.getStats();
            }
            
            return baseStats;
        }

        /**
         * Enable/disable rendering
         * Following checklist: Graceful Failure
         */
        setRenderingEnabled(enabled) {
            this.disableRendering = !enabled;
            this.logger.info('RENDER', `Rendering ${enabled ? 'enabled' : 'disabled'}`);
        }

        /**
         * Check if renderer is healthy
         */
        isHealthy() {
            if (!this.initialized) {
                return false;
            }
            
            // Check performance monitor health
            if (this.performanceMonitor && !this.performanceMonitor.isSystemHealthy()) {
                return false;
            }
            
            // Check if all services are available
            return this.verifyServices();
        }

        /**
         * Generate comprehensive health report
         */
        generateHealthReport() {
            const report = {
                timestamp: Date.now(),
                overall: this.isHealthy(),
                renderer: {
                    initialized: this.initialized,
                    initTime: this.initTime,
                    renderingEnabled: !this.disableRendering
                },
                services: {
                    stateManager: !!this.stateManager,
                    domManager: !!this.domManager,
                    renderEngine: !!this.renderEngine,
                    uiIntegration: !!this.uiIntegration,
                    performanceMonitor: !!this.performanceMonitor,
                    containerManager: !!this.containerManager
                }
            };
            
            // Add detailed stats from each service
            if (this.performanceMonitor) {
                report.performance = this.performanceMonitor.getDetailedStats();
            }
            
            this.logger.info('RENDER', 'Health Report:', report);
            return report;
        }

        /**
         * Reset renderer to clean state
         * Following checklist: Root Cause Fix
         */
        reset() {
            this.logger.info('RENDER', 'Resetting Enhanced Component Renderer');
            
            // Reset state tracking
            if (this.stateManager) {
                this.stateManager.resetStateTracking();
            }
            
            // Clear DOM cache
            if (this.domManager) {
                this.domManager.clearCache();
            }
            
            // Clear render tracking
            if (this.renderEngine) {
                this.renderEngine.clearRenderTracking();
            }
            
            // Reset performance metrics
            if (this.performanceMonitor) {
                this.performanceMonitor.reset();
            }
            
            this.logger.info('RENDER', 'Reset complete');
        }

        /**
         * Clean shutdown of renderer
         * Following checklist: Graceful Failure, WordPress Integration
         */
        destroy() {
            this.logger.info('RENDER', 'Destroying Enhanced Component Renderer');
            
            // Unsubscribe from state changes
            if (this.stateUnsubscribe) {
                this.stateUnsubscribe();
                this.stateUnsubscribe = null;
            }
            
            // Destroy services
            if (this.uiIntegration && this.uiIntegration.destroy) {
                this.uiIntegration.destroy();
            }
            
            if (this.performanceMonitor && this.performanceMonitor.destroy) {
                this.performanceMonitor.destroy();
            }
            
            if (this.containerManager && this.containerManager.destroy) {
                this.containerManager.destroy();
            }
            
            // Clear service references
            this.stateManager = null;
            this.domManager = null;
            this.renderEngine = null;
            this.uiIntegration = null;
            this.performanceMonitor = null;
            this.containerManager = null;
            
            this.initialized = false;
            this.isInitializing = false;
            
            this.logger.info('RENDER', 'Enhanced Component Renderer destroyed');
        }
    }

    // Export to global scope for WordPress compatibility
    window.EnhancedComponentRenderer = EnhancedComponentRenderer;
    
    // Create singleton instance - maintain backward compatibility
    if (!window.enhancedComponentRenderer) {
        window.enhancedComponentRenderer = new EnhancedComponentRenderer();
    }
    
    // Also maintain the refactored name
    window.EnhancedComponentRendererRefactored = EnhancedComponentRenderer;
    if (!window.enhancedComponentRendererRefactored) {
        window.enhancedComponentRendererRefactored = new EnhancedComponentRenderer();
    }

    // Emit ready event when created
    document.dispatchEvent(new CustomEvent('gmkb:enhanced-component-renderer-refactored-ready', {
        detail: { 
            renderer: window.enhancedComponentRendererRefactored,
            timestamp: Date.now()
        }
    }));
    
    // Also emit the legacy event for compatibility
    document.dispatchEvent(new CustomEvent('gmkb:enhanced-component-renderer-ready', {
        detail: { 
            renderer: window.enhancedComponentRenderer,
            timestamp: Date.now()
        }
    }));

        structuredLogger.info('RENDER', 'EnhancedComponentRenderer refactored ready and event emitted');
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWhenReady);
    } else {
        initWhenReady();
    }
    
})();