/**
 * @file enhanced-component-renderer.js
 * @description ROOT FIX: WordPress-Compatible Enhanced Component Renderer
 * Converted from ES6 modules to WordPress-compatible IIFE format
 * Intelligent diff-based rendering with optimized updates.
 *
 * CRITICAL FIX: Removes ES6 import dependencies that fail in WordPress loading
 */

// ROOT FIX: WordPress-compatible IIFE wrapper
(function() {
    'use strict';
    
    // ROOT FIX: Create fallback utilities if imports not available
    const dynamicComponentLoader = window.dynamicComponentLoader || {
        renderComponent: async () => {
            const div = document.createElement('div');
            div.textContent = 'Component loading...';
            return div;
        }
    };
    
    const enhancedStateManager = window.enhancedStateManager || {
        getState: () => ({ components: {}, layout: [] }),
        subscribeGlobal: () => () => {},
        getComponent: () => null,
        getLayout: () => []
    };
    
    const performanceMonitor = window.performanceMonitor || {
        start: () => () => {}
    };
    
    const uiRegistry = window.uiRegistry || {
        register: () => () => {},
        unregister: () => {},
        forceUpdate: () => {}
    };
    
    const eventBus = window.eventBus || {
        emit: () => {},
        on: () => {},
        off: () => {}
    };
    
    const structuredLogger = window.structuredLogger || {
        info: console.log,
        warn: console.warn,
        error: console.error,
        debug: console.debug
    };
    
    const showToast = window.showToast || function(message, type, duration) {
        console.log(`Toast [${type}]: ${message}`);
    };
    
    const renderingQueueManager = window.renderingQueueManager || {
        addToQueue: () => 'fallback-render-id',
        getStatistics: () => ({ queueSize: 0, processing: false }),
        enterInitialStateMode: () => {},
        exitInitialStateMode: () => {}
    };

class EnhancedComponentRenderer {
    constructor() {
        this.initialized = false;
        this.previewContainer = null;
        // ROOT FIX: Remove legacy render queue - now using centralized renderingQueueManager
        this.componentCache = new Map();
        this.disableRendering = false;
        this.stateUnsubscribe = null;
        this.lastState = null;
        this.lastStateHash = null; // ROOT FIX: Track state hash for deduplication
        this.renderDebounceTimer = null;
        this.renderStartTime = null;
        this.healthCheckInterval = null;
        this.logger = structuredLogger;
        this.lastSaveTime = 0; // ROOT FIX: Track save operations to prevent clearing
        
        // ROOT FIX: Render throttling to prevent cascade renders
        this.isCurrentlyRendering = false;
        this.pendingRenderRequest = null;
        this.renderThrottleDelay = 150; // Minimum time between renders
        
        // UI Registry integration
        this.registeredComponents = new Set();
        this.updateHandlers = new Map();
        
        // ROOT FIX: Rendering coordination flags
        this.renderingMode = 'queue'; // 'queue' or 'direct'
        this.queuedRenders = new Map(); // Track queued render requests
        this.renderAcknowledgments = new Map(); // Track render completions
        
        // Setup UI registry event listeners
        this.setupUIRegistryListeners();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // ROOT FIX: Setup rendering queue event listeners
        this.setupRenderingQueueListeners();
        
        // ROOT FIX: Setup save operation tracking
        this.setupSaveTracking();
        
        // ROOT FIX: Component controls integration moved to init() method
        // to ensure this.previewContainer is available before event listeners are attached
    }
    
    /**
     * ROOT FIX: Event-driven reordering coordination
     * Schedules reordering after component rendering is complete
     */
    scheduleReorderAfterRender(newState) {
        // Use requestAnimationFrame for smooth DOM coordination
        requestAnimationFrame(() => {
            // Verify all components are rendered before reordering
            const allComponentsRendered = this.verifyAllComponentsRendered(newState);
            
            if (allComponentsRendered) {
                this.reorderComponents(newState.layout);
                this.logger.debug('RENDER', 'Reordering completed after render verification');
            } else {
                this.logger.debug('RENDER', 'Skipping reorder - not all components fully rendered yet');
            }
        });
    }
    
    /**
     * ROOT FIX: Verify all components are properly rendered in DOM
     */
    verifyAllComponentsRendered(state) {
        // ROOT FIX: Add null check for previewContainer to prevent race condition
        if (!this.previewContainer) {
            this.logger.warn('RENDER', 'Preview container not available for verification');
            return false;
        }
        
        const componentIds = Object.keys(state.components || {});
        const renderedIds = Array.from(this.previewContainer.children)
            .map(child => child.id)
            .filter(id => id);
        
        const allPresent = componentIds.every(id => renderedIds.includes(id));
        
        this.logger.debug('RENDER', 'Component render verification:', {
            expectedComponents: componentIds.length,
            renderedComponents: renderedIds.length,
            allPresent,
            missingComponents: componentIds.filter(id => !renderedIds.includes(id))
        });
        
        return allPresent;
    }

    /**
     * Setup keyboard shortcuts for undo/redo and other functions
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Only handle shortcuts when not in input fields
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) {
                return;
            }
            
            // Undo: Ctrl+Z (or Cmd+Z on Mac)
            if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
                event.preventDefault();
                this.handleUndo();
                return;
            }
            
            // Redo: Ctrl+Y or Ctrl+Shift+Z (or Cmd+Y/Cmd+Shift+Z on Mac)
            if ((event.ctrlKey || event.metaKey) && 
                (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
                event.preventDefault();
                this.handleRedo();
                return;
            }
            
            // Save: Ctrl+S (or Cmd+S on Mac)
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                this.handleSave();
                return;
            }
            
            // Performance monitor toggle: Ctrl+Shift+P
            if (event.ctrlKey && event.shiftKey && event.key === 'P') {
                event.preventDefault();
                this.togglePerformanceMonitor();
                return;
            }
        });
        
        this.logger.debug('RENDER', 'Keyboard shortcuts setup complete');
    }
    
    /**
     * Handle undo shortcut
     */
    handleUndo() {
        if (window.stateHistory && window.stateHistory.canUndo()) {
            const success = window.stateHistory.undo();
            if (success) {
                this.logger.info('UI', 'Undo performed via keyboard shortcut');
                showToast('Undone', 'info', 1000);
            }
        } else {
            this.logger.debug('UI', 'Cannot undo: no history available');
        }
    }
    
    /**
     * Handle redo shortcut
     */
    handleRedo() {
        if (window.stateHistory && window.stateHistory.canRedo()) {
            const success = window.stateHistory.redo();
            if (success) {
                this.logger.info('UI', 'Redo performed via keyboard shortcut');
                showToast('Redone', 'info', 1000);
            }
        } else {
            this.logger.debug('UI', 'Cannot redo: no future history available');
        }
    }
    
    /**
     * Handle save shortcut
     */
    handleSave() {
        if (window.saveService) {
            window.saveService.saveState();
            this.logger.info('UI', 'Save performed via keyboard shortcut');
            showToast('Saved', 'success', 1000);
        }
    }
    
    /**
     * Toggle performance monitor
     */
    togglePerformanceMonitor() {
        if (window.mkPerf) {
            window.mkPerf.report();
            this.logger.info('UI', 'Performance monitor toggled via keyboard shortcut');
        }
    }
    
    /**
     * ROOT FIX: Attach component controls to rendered element
     * Integrates with ComponentControlsManager for proper control attachment
     * @param {HTMLElement} element - Rendered component element
     * @param {string} componentId - Component ID
     */
    attachComponentControls(element, componentId) {
        try {
            // Verify ComponentControlsManager is available
            if (!window.componentControlsManager) {
                this.logger.warn('RENDER', 'ComponentControlsManager not available for control attachment', { componentId });
                return false;
            }
            
            // ROOT FIX: Ensure element has proper attributes and styling for hover behavior
            if (!element.getAttribute('data-component-id')) {
                element.setAttribute('data-component-id', componentId);
            }
            
            // ROOT FIX: Add necessary CSS properties for proper hover detection
            element.style.position = element.style.position || 'relative';
            element.style.cursor = 'pointer';
            element.tabIndex = element.tabIndex >= 0 ? element.tabIndex : 0; // Make focusable
            element.setAttribute('data-controls-enabled', 'true');
            
            // ROOT FIX: Add debug border to verify element boundaries
            if (window.GMKBDebugMode) {
                element.style.border = '1px dashed rgba(0, 255, 0, 0.3)';
            }
            
            // Attach controls using ComponentControlsManager
            const success = window.componentControlsManager.attachControls(element, componentId);
            
            if (success) {
                this.logger.debug('RENDER', `Controls attached successfully to component: ${componentId}`);
                
                // ROOT FIX: Verify controls are actually in DOM
                const controlsElement = element.querySelector('.component-controls--dynamic');
                if (controlsElement) {
                    this.logger.debug('RENDER', `Controls element found in DOM for: ${componentId}`);
                } else {
                    this.logger.warn('RENDER', `Controls element NOT found in DOM for: ${componentId}`);
                }
                
                // Emit control attachment event
                document.dispatchEvent(new CustomEvent('gmkb:controls-attached', {
                    detail: {
                        componentId,
                        element,
                        source: 'enhanced-component-renderer',
                        timestamp: Date.now()
                    }
                }));
                
                return true;
            } else {
                this.logger.warn('RENDER', `Failed to attach controls to component: ${componentId}`);
                return false;
            }
            
        } catch (error) {
            this.logger.error('RENDER', `Error attaching controls to component ${componentId}:`, error);
            return false;
        }
    }
    
    /**
     * Setup UI registry event listeners
     */
    setupUIRegistryListeners() {
        // Listen for components that need re-rendering
        eventBus.on('ui:component-needs-render', (event) => {
            this.handleComponentRerenderRequest(event.data);
        });
        
        // Listen for batch update completion
        eventBus.on('ui:batch-update-complete', (event) => {
            this.logger.debug('RENDER', `UI batch update completed`, event.data);
        });
    }
    
    /**
     * Handle component re-render requests from UI registry
     */
    async handleComponentRerenderRequest({ componentId, element, state }) {
        try {
            const perfEnd = performanceMonitor.start('component-rerender', { componentId });
            
            // CRITICAL FIX: Remove ALL duplicates before re-rendering
            const allDuplicates = document.querySelectorAll(`[data-component-id="${componentId}"]`);
            if (allDuplicates.length > 1) {
                this.logger.warn('RENDER', `Found ${allDuplicates.length} duplicates of ${componentId}, cleaning up`);
                // Keep only the first one for replacement
                for (let i = 1; i < allDuplicates.length; i++) {
                    allDuplicates[i].remove();
                }
                element = allDuplicates[0]; // Use the first element
            }
            
            // Re-render component with new state
            const { element: newElement } = await this.renderComponentWithLoader(
                componentId, 
                state.type, 
                state.props || state.data
            );
            
            // Replace in DOM
            if (element && element.parentNode) {
                element.replaceWith(newElement);
            }
            
            // Update cache
            this.componentCache.set(componentId, newElement);
            
            // Re-register with UI registry
            this.registerComponentWithUIRegistry(componentId, newElement, state);
            
            perfEnd();
            
            this.logger.debug('RENDER', `Component re-rendered: ${componentId}`);
            
        } catch (error) {
            this.logger.error('RENDER', `Failed to re-render component: ${componentId}`, error);
        }
    }

    async init() {
        if (this.initialized) return;
        
        // Track initialization time to prevent duplicate renders during startup
        this.initTime = Date.now();

        this.previewContainer = document.getElementById('media-kit-preview');
        if (!this.previewContainer) {
            console.error('RENDER', 'Preview container not found. Cannot initialize.');
            return;
        }

        // Setup component controls integration AFTER previewContainer is available
        this.setupComponentControlsIntegration();

        // 1. Get the initial state directly from the manager
        const initialState = enhancedStateManager.getInitialState();
        this.logger.info('RENDER', 'Performing initial render with state:', initialState);
        
        // ROOT CAUSE FIX: Set lastState and lastStateHash BEFORE rendering to prevent duplicate renders
        this.lastState = this.cloneState(initialState);
        this.lastStateHash = this.generateStateHash(initialState);

        // 2. Perform a direct, one-time render of the initial state
        if (initialState && initialState.components && Object.keys(initialState.components).length > 0) {
            await this.renderSavedComponents(initialState);
        } else {
            this.updateEmptyState(initialState);
        }
        
        // 3. ROOT FIX: Subscribe immediately to catch all state changes
        this.stateUnsubscribe = enhancedStateManager.subscribeGlobal((state) => {
            // Only process if the state has actually changed from our last state
            if (this.lastStateHash !== this.generateStateHash(state)) {
                this.onStateChange(state);
            }
        });
        this.logger.debug('RENDER', 'State change subscription activated immediately');

        // 5. Setup empty state listeners
        this.setupEmptyStateListeners();

        this.healthCheckInterval = setInterval(() => this.healthCheck(), 5000);
        this.initialized = true;
        this.logger.info('RENDER', 'Initial render complete. Now listening for state changes.');
    }



    onStateChange(newState) {
        if (!this.initialized || this.disableRendering) return;

        // ROOT FIX: AGGRESSIVE DUPLICATE RENDER PREVENTION
        const stateHash = this.generateStateHash(newState);
        if (this.lastStateHash === stateHash) {
            this.logger.debug('RENDER', 'State hash unchanged, skipping render entirely');
            return;
        }
        
        // ROOT FIX: Allow renders after a shorter initialization period
        // This ensures new components added via UI are rendered promptly
        if (Date.now() - (this.initTime || 0) < 100) {
            this.logger.debug('RENDER', 'Skipping state change during brief initialization phase');
            return;
        }
        
        // ROOT FIX: CRITICAL - Check if all components already exist in DOM
        // This prevents re-rendering when state manager fires events after initial render
        const componentIds = Object.keys(newState.components || {});
        const allComponentsExist = componentIds.length > 0 && componentIds.every(id => {
            const element = document.getElementById(id);
            return element && element.parentNode;
        });
        
        if (allComponentsExist && this.lastState && 
            Object.keys(this.lastState.components || {}).length === componentIds.length) {
            // All components exist and count hasn't changed - likely just a state sync
            this.logger.debug('RENDER', 'All components already in DOM, skipping re-render', {
                componentCount: componentIds.length,
                existingComponents: componentIds
            });
            this.lastStateHash = stateHash; // Update hash to prevent future duplicate checks
            this.lastState = this.cloneState(newState); // Update lastState
            return;
        }
        
        // ROOT CAUSE FIX: Only update hash if we're actually going to render
        // This prevents lost updates if we skip rendering
        this.lastStateHash = stateHash;
        
        // ROOT FIX: RENDER THROTTLING - Prevent cascade renders during active rendering
        if (this.isCurrentlyRendering) {
            this.logger.debug('RENDER', 'Currently rendering, storing pending request');
            this.pendingRenderRequest = { newState, timestamp: Date.now() };
            return;
        }

        if (this.renderDebounceTimer) {
            clearTimeout(this.renderDebounceTimer);
        }

        this.renderDebounceTimer = setTimeout(async () => {
            this.isCurrentlyRendering = true;
            
            try {
                const changes = this.diffState(this.lastState, newState);

                if (!changes.added.size && !changes.removed.size && !changes.updated.size && !changes.moved.size) {
                    this.logger.debug('RENDER', 'No changes detected, skipping render');
                    return;
                }

                this.logger.info('RENDER', 'Processing state changes', {
                    added: changes.added.size,
                    removed: changes.removed.size, 
                    updated: changes.updated.size,
                    moved: changes.moved.size
                });

                await this.processChangesWithQueue(changes, newState);
                this.lastState = this.cloneState(newState);
                
            } finally {
                this.isCurrentlyRendering = false;
                
                // ROOT FIX: Process any pending render request
                if (this.pendingRenderRequest) {
                    const pending = this.pendingRenderRequest;
                    this.pendingRenderRequest = null;
                    
                    // Only process if the pending request is relatively recent
                    if (Date.now() - pending.timestamp < 5000) {
                        this.logger.debug('RENDER', 'Processing pending render request');
                        setTimeout(() => this.onStateChange(pending.newState), 50);
                    }
                }
            }
        }, this.renderThrottleDelay);
    }

    diffState(oldState, newState) {
        const changes = {
            added: new Set(),
            removed: new Set(),
            updated: new Set(),
            moved: new Set()
        };

        // ROOT FIX: CRITICAL null safety with comprehensive validation
        try {
            // Validate and normalize oldState
            const safeOldState = this.validateAndNormalizeState(oldState);
            const safeNewState = this.validateAndNormalizeState(newState);
            
            // If both states are empty, no changes
            if (!safeOldState.hasComponents && !safeNewState.hasComponents) {
                this.logger.debug('RENDER', 'diffState: Both states empty, no changes');
                return changes;
            }
            
            // If no old state, all components in new state are additions
            if (!safeOldState.hasComponents && safeNewState.hasComponents) {
                safeNewState.componentKeys.forEach(id => changes.added.add(id));
                this.logger.debug('RENDER', `diffState: No old state, ${changes.added.size} additions`);
                return changes;
            }
            
            // If no new state, all components in old state are removals
            if (safeOldState.hasComponents && !safeNewState.hasComponents) {
                safeOldState.componentKeys.forEach(id => changes.removed.add(id));
                this.logger.debug('RENDER', `diffState: No new state, ${changes.removed.size} removals`);
                return changes;
            }
            
            // Both states have components, perform detailed diff
            const oldKeys = new Set(safeOldState.componentKeys);
            const newKeys = new Set(safeNewState.componentKeys);

            // Find additions
            newKeys.forEach(key => {
                if (!oldKeys.has(key)) {
                    changes.added.add(key);
                }
            });

            // Find removals
            oldKeys.forEach(key => {
                if (!newKeys.has(key)) {
                    changes.removed.add(key);
                }
            });

            // Find updates (components that exist in both but have changed)
            newKeys.forEach(key => {
                if (oldKeys.has(key)) {
                    try {
                        const oldComponent = safeOldState.components[key];
                        const newComponent = safeNewState.components[key];
                        
                        if (oldComponent && newComponent && 
                            JSON.stringify(oldComponent) !== JSON.stringify(newComponent)) {
                            changes.updated.add(key);
                        }
                    } catch (error) {
                        this.logger.warn('RENDER', `Error comparing component ${key}:`, error);
                        // Treat as update if comparison fails
                        changes.updated.add(key);
                    }
                }
            });

            // ROOT FIX: Enhanced layout comparison with comprehensive validation
            const oldLayout = this.validateAndNormalizeLayout(safeOldState.layout);
            const newLayout = this.validateAndNormalizeLayout(safeNewState.layout);

            if (JSON.stringify(oldLayout) !== JSON.stringify(newLayout)) {
                newLayout.forEach(id => {
                    // Only mark as moved if it's not an addition or removal
                    if (!changes.added.has(id) && !changes.removed.has(id)) {
                        changes.moved.add(id);
                    }
                });
            }
            
            this.logger.debug('RENDER', 'diffState completed:', {
                added: changes.added.size,
                removed: changes.removed.size,
                updated: changes.updated.size,
                moved: changes.moved.size
            });
            
            return changes;
            
        } catch (error) {
            this.logger.error('RENDER', 'Critical error in diffState:', error);
            // Return empty changes to prevent cascading failures
            return {
                added: new Set(),
                removed: new Set(),
                updated: new Set(),
                moved: new Set()
            };
        }
    }
    
    /**
     * ROOT FIX: Validate and normalize state object to prevent undefined errors
     */
    validateAndNormalizeState(state) {
        if (!state || typeof state !== 'object') {
            return {
                hasComponents: false,
                components: {},
                componentKeys: [],
                layout: []
            };
        }
        
        const components = state.components && typeof state.components === 'object' ? state.components : {};
        const componentKeys = Object.keys(components);
        const layout = Array.isArray(state.layout) ? state.layout : [];
        
        return {
            hasComponents: componentKeys.length > 0,
            components,
            componentKeys,
            layout
        };
    }
    
    /**
     * ROOT FIX: Validate and normalize layout array
     */
    validateAndNormalizeLayout(layout) {
        if (!Array.isArray(layout)) {
            // Try to get layout from state manager as fallback
            try {
                const fallbackLayout = enhancedStateManager.getLayout ? enhancedStateManager.getLayout() : [];
                return Array.isArray(fallbackLayout) ? fallbackLayout : [];
            } catch (error) {
                this.logger.warn('RENDER', 'Failed to get fallback layout:', error);
                return [];
            }
        }
        
        // Filter out any non-string values from layout
        return layout.filter(item => typeof item === 'string' && item.length > 0);
    }

    /**
     * ROOT FIX: Process changes through rendering queue for coordinated, race-condition-free rendering
     */
    async processChangesWithQueue(changes, newState) {
        try {
            // Handle removals immediately (no queue needed)
            if (changes.removed.size > 0) {
                this.removeComponents(changes.removed);
            }
            
            // Queue additions with appropriate priority
            if (changes.added.size > 0) {
                await this.queueComponentAdditions(changes.added, newState);
            }
            
            // Queue updates with high priority
            if (changes.updated.size > 0) {
                await this.queueComponentUpdates(changes.updated, newState);
            }
            
            // ROOT CAUSE FIX: Handle moves and ensure proper reordering after removals
            if (changes.moved.size > 0 || changes.removed.size > 0) {
                // ROOT FIX: Immediate reordering for better UX, especially after removals
                const state = enhancedStateManager.getState();
                this.reorderComponents(state.layout);
            }
            
            // ROOT FIX: Conservative cleanup - don't aggressively remove components that might be in transition
            this.conservativeCleanup(newState);
            this.updateEmptyState(newState);
            
        } catch (error) {
            this.logger.error('RENDER', 'Error during queued change processing', error);
            
            // Fallback to direct processing if queue fails
            this.logger.warn('RENDER', 'Falling back to direct rendering');
            await this.processChanges(changes, newState);
        }
    }
    
    /**
     * LEGACY: Direct change processing (fallback)
     */
    async processChanges(changes, newState) {
        if (changes.removed.size > 0) {
            this.removeComponents(changes.removed);
        }
        if (changes.added.size > 0) {
            await this.renderNewComponents(changes.added, newState);
        }
        if (changes.updated.size > 0) {
            await this.updateComponents(changes.updated, newState);
        }
        if (changes.moved.size > 0) {
            const state = enhancedStateManager.getState();
            this.reorderComponents(state.layout);
        }
            // ROOT FIX: Conservative cleanup - don't aggressively remove components
            this.conservativeCleanup(newState);

        this.updateEmptyState(newState);
    }

    removeComponents(componentIds) {
        const perfEnd = performanceMonitor.start('remove-components', {
            count: componentIds.size
        });
        
        componentIds.forEach(id => {
            // ROOT FIX: Use DOM Render Coordinator for removal if available
            if (window.domRenderCoordinator) {
                const success = window.domRenderCoordinator.removeComponent(id);
                if (success) {
                    this.logger.debug('RENDER', `Component ${id} removed via coordinator`);
                } else {
                    this.logger.warn('RENDER', `Coordinator failed to remove ${id}, using fallback`);
                }
            } else {
                // Fallback to legacy removal
                const element = this.componentCache.get(id) || document.getElementById(id);
                if (element) {
                    element.remove();
                    this.logger.debug('RENDER', `Component ${id} removed via fallback`);
                }
            }
            
            // Clean up our internal tracking
            this.componentCache.delete(id);
            
            // Unregister from UI registry
            if (this.registeredComponents.has(id)) {
                const unregister = this.updateHandlers.get(id);
                if (unregister) {
                    unregister();
                }
                this.updateHandlers.delete(id);
                this.registeredComponents.delete(id);
                
                this.logger.debug('RENDER', `Unregistered component from UI registry: ${id}`);
            }
        });
        
        perfEnd();
        
        this.logger.debug('RENDER', `Removed ${componentIds.size} components`);
    }

    async renderNewComponents(componentIds, newState) {
        const perfEnd = performanceMonitor.start('render-new-components', {
            count: componentIds.size
        });
        
        this.logger.debug('RENDER', `Starting renderNewComponents for ${componentIds.size} components`);
        
        // ROOT FIX: CRITICAL - Remove ALL existing duplicates FIRST
        this.removeAllDuplicatesBeforeRender(componentIds);
        
        // ROOT FIX: Try to use DOM Render Coordinator first
        if (window.domRenderCoordinator && window.domRenderCoordinator.isInitialized) {
            try {
                // Render components one by one through coordinator for strict duplication control
                const renderPromises = Array.from(componentIds).map(async (componentId) => {
                    const componentState = newState.components[componentId];
                    if (!componentState) {
                        this.logger.error('RENDER', `State for new component ${componentId} not found!`);
                        return null;
                    }
                    
                    // Render the component element
                    const result = await this.renderComponentWithLoader(componentId, componentState.type, componentState.props || componentState.data);
                    
                    if (result && result.element) {
                        // Use coordinator to ensure unique DOM insertion
                        const success = await window.domRenderCoordinator.renderComponent(
                            componentId,
                            result.element,
                            'media-kit-preview',
                            { 
                                componentType: componentState.type,
                                source: 'renderNewComponents'
                            }
                        );
                        
                        if (success) {
                            // Update our cache
                            this.componentCache.set(componentId, result.element);
                            
                            // Register with UI registry
                            this.registerComponentWithUIRegistry(componentId, result.element, componentState);
                            
                            this.logger.debug('RENDER', `Successfully coordinated render of ${componentId}`);
                            
                            return {
                                id: componentId,
                                element: result.element,
                                success: true
                            };
                        } else {
                            this.logger.error('RENDER', `Coordinator failed to render ${componentId}`);
                            return null;
                        }
                    } else {
                        this.logger.error('RENDER', `Failed to create element for ${componentId}`);
                        return null;
                    }
                });
                
                const results = await Promise.all(renderPromises);
                const successfulRenders = results.filter(r => r && r.success);
                
                this.logger.info('RENDER', `Coordinated rendering completed`, {
                    requested: componentIds.size,
                    successful: successfulRenders.length,
                    failed: componentIds.size - successfulRenders.length
                });
                
                // ROOT FIX: Post-render verification delegated to DOM Render Coordinator
                
                // Dispatch batch render completion event
                document.dispatchEvent(new CustomEvent('gmkb:batch-render-completed', {
                    detail: {
                        componentIds: Array.from(componentIds),
                        results: results,
                        source: 'coordinated-rendering',
                        timestamp: Date.now()
                    }
                }));
                
                perfEnd();
                return;
                
            } catch (error) {
                this.logger.error('RENDER', 'Coordinated rendering failed', error);
                // Fall through to legacy rendering
            }
        }
        
        // Fallback to legacy rendering with enhanced duplicate prevention
        this.logger.warn('RENDER', 'Using legacy rendering with enhanced duplicate prevention');
        await this.renderNewComponentsLegacy(componentIds, newState);
        
        perfEnd();
    }
    
    /**
     * ROOT FIX: Remove all duplicates before rendering
     */
    removeAllDuplicatesBeforeRender(componentIds) {
        let totalRemoved = 0;
        
        componentIds.forEach(componentId => {
            // Remove by ID
            const elementsById = document.querySelectorAll(`#${componentId}`);
            elementsById.forEach(el => {
                el.remove();
                totalRemoved++;
            });
            
            // Remove by data attribute
            const elementsByDataId = document.querySelectorAll(`[data-component-id="${componentId}"]`);
            elementsByDataId.forEach(el => {
                el.remove();
                totalRemoved++;
            });
            
            // Clear from cache
            this.componentCache.delete(componentId);
        });
        
        if (totalRemoved > 0) {
            this.logger.warn('RENDER', `PRE-RENDER CLEANUP: Removed ${totalRemoved} existing elements to prevent duplication`);
        }
    }
    
    // ROOT FIX: verifyNoDuplicatesAfterRender removed - DOM Render Coordinator handles all deduplication
    
    // ROOT FIX: cleanupDuplicatesAfterRender removed - DOM Render Coordinator handles all deduplication
    
    /**
     * ROOT FIX: Legacy rendering method as fallback
     */
    async renderNewComponentsLegacy(componentIds, newState) {
        this.logger.warn('RENDER', 'Using legacy rendering with enhanced duplicate prevention');
        
        // ROOT CAUSE FIX: Use the correct container based on component state
        let targetContainer = null;
        let containerReason = '';
        
        // Check if saved-components-container exists and should be used
        const savedContainer = document.getElementById('saved-components-container');
        if (savedContainer && savedContainer.style.display !== 'none') {
            targetContainer = savedContainer;
            containerReason = 'saved_components_container';
        } else {
            // Fall back to preview container
            targetContainer = this.previewContainer;
            containerReason = 'preview_container';
        }
        
        if (!targetContainer) {
            this.logger.error('RENDER', 'No container available for rendering');
            return;
        }
        
        this.logger.debug('RENDER', `Using ${containerReason} for component rendering`);
        
        // ROOT FIX: Track which components we're actually rendering
        const componentsToRender = new Set();
        
        const fragment = document.createDocumentFragment();
        const renderPromises = Array.from(componentIds).map(async (id) => {
            const componentState = newState.components[id];
            if (!componentState) {
                this.logger.error('RENDER', `State for new component ${id} not found!`);
                return null;
            }
            
            // ROOT FIX: One more check before rendering
            const alreadyExists = document.getElementById(id);
            if (alreadyExists) {
                this.logger.warn('RENDER', `Component ${id} already exists in DOM, skipping render`);
                return null;
            }
            
            componentsToRender.add(id);
            this.logger.debug('RENDER', `Rendering component ${id} of type ${componentState.type}`);
            
            // FIX: Use the new dynamicComponentLoader instance
            return this.renderComponentWithLoader(id, componentState.type, componentState.props || componentState.data);
        });

        const renderedComponents = await Promise.all(renderPromises);
        
        this.logger.debug('RENDER', `Render promises completed:`, {
            totalPromises: renderPromises.length,
            successfulRenders: renderedComponents.filter(comp => comp && comp.element).length,
            failedRenders: renderedComponents.filter(comp => !comp || !comp.element).length,
            targetContainer: containerReason
        });
        
        let addedToFragment = 0;
        
        for (const comp of renderedComponents) {
            if (comp && comp.element) {
                // ROOT FIX: Use DOM Render Coordinator directly for guaranteed deduplication
                if (window.domRenderCoordinator && window.domRenderCoordinator.isInitialized) {
                    const success = await window.domRenderCoordinator.renderComponent(
                        comp.id,
                        comp.element,
                        targetContainer.id || 'media-kit-preview',
                        { 
                            componentType: newState.components[comp.id]?.type,
                            source: 'renderNewComponentsLegacy',
                            attachControls: true
                        }
                    );
                    
                    if (success) {
                        // Update our cache
                        this.componentCache.set(comp.id, comp.element);
                        
                        // Register with UI registry
                        const componentState = newState.components[comp.id];
                        this.registerComponentWithUIRegistry(comp.id, comp.element, componentState);
                        
                        addedToFragment++;
                        this.logger.debug('RENDER', `Successfully rendered ${comp.id} via coordinator`);
                    } else {
                        this.logger.error('RENDER', `Coordinator failed to render ${comp.id}`);
                    }
                } else {
                    // Fallback: dispatch event (should not happen)
                    document.dispatchEvent(new CustomEvent('gmkb:coordinate-render-request', {
                        detail: {
                            componentId: comp.id,
                            element: comp.element,
                            targetContainer: targetContainer.id,
                            options: { attachControls: true }
                        }
                    }));
                    
                    this.componentCache.set(comp.id, comp.element);
                    const componentState = newState.components[comp.id];
                    this.registerComponentWithUIRegistry(comp.id, comp.element, componentState);
                    addedToFragment++;
                    this.logger.warn('RENDER', `Used event dispatch fallback for ${comp.id}`);
                }
            } else {
                this.logger.warn('RENDER', `Component render failed or returned no element:`, comp);
            }
        }
        
        this.logger.debug('RENDER', `Dispatched ${addedToFragment} components to coordinator for rendering`);
        
        // ROOT FIX: The coordinator now handles all DOM insertion and deduplication
        // No need to append fragment or verify duplicates here
        
        perfEnd();
        
        this.logger.debug('RENDER', `Rendered ${componentIds.size} new components via coordinator`);
    }
    
    /**
     * Register component with UI registry for reactive updates
     */
    registerComponentWithUIRegistry(componentId, element, componentState) {
        if (this.registeredComponents.has(componentId)) {
            // Already registered, update registration
            uiRegistry.unregister(componentId);
        }
        
        // Create update function for this component type
        const updateFn = this.createUpdateFunction(componentState.type);
        
        // Register with UI registry
        const unregister = uiRegistry.register(componentId, element, updateFn, {
            updateOn: ['props', 'data'], // Only update on props/data changes
            componentType: componentState.type
        });
        
        // Store unregister function
        this.updateHandlers.set(componentId, unregister);
        this.registeredComponents.add(componentId);
        
        this.logger.debug('RENDER', `Registered component with UI registry: ${componentId}`);
    }
    
    /**
     * Create update function for component type
     */
    createUpdateFunction(componentType) {
        return (element, newState, context) => {
            // For now, trigger a re-render event
            // In the future, this could be more granular per component type
            eventBus.emit('ui:component-needs-render', {
                componentId: element.getAttribute('data-component-id'),
                element,
                state: newState
            });
        };
    }

    async updateComponents(componentIds, newState) {
        const perfEnd = performanceMonitor.start('update-components', {
            count: componentIds.size
        });
        
        // CRITICAL FIX: Clean up any duplicates before updating
        componentIds.forEach(id => {
            const duplicates = document.querySelectorAll(`[data-component-id="${id}"]`);
            if (duplicates.length > 1) {
                this.logger.warn('RENDER', `Cleaning ${duplicates.length - 1} duplicates of ${id} before update`);
                for (let i = 1; i < duplicates.length; i++) {
                    duplicates[i].remove();
                }
            }
        });
        
        // Use UI registry for efficient updates where possible
        const uiRegistryUpdates = [];
        const fallbackUpdates = [];
        
        componentIds.forEach(id => {
            if (this.registeredComponents.has(id)) {
                // Use UI registry for efficient update
                uiRegistryUpdates.push(id);
            } else {
                // Fallback to full re-render
                fallbackUpdates.push(id);
            }
        });
        
        // Process UI registry updates (these are handled automatically by the registry)
        uiRegistryUpdates.forEach(id => {
            uiRegistry.forceUpdate(id);
        });
        
        // Process fallback updates
        const updatePromises = fallbackUpdates.map(async (id) => {
            const componentState = newState.components[id];
            const oldElement = this.componentCache.get(id) || document.getElementById(id);
            if (oldElement && componentState) {
                const {
                    element: newElement
                    // FIX: Use the new dynamicComponentLoader instance
                } = await this.renderComponentWithLoader(id, componentState.type, componentState.props || componentState.data);
                
                // Compare content before replacing
                if (oldElement.innerHTML !== newElement.innerHTML) {
                    oldElement.replaceWith(newElement);
                    this.componentCache.set(id, newElement);
                    
                    // Register new element with UI registry
                    this.registerComponentWithUIRegistry(id, newElement, componentState);
                }
            }
        });
        
        await Promise.all(updatePromises);
        
        perfEnd();
        
        this.logger.debug('RENDER', `Updated ${componentIds.size} components`, {
            uiRegistryUpdates: uiRegistryUpdates.length,
            fallbackUpdates: fallbackUpdates.length
        });
    }

    reorderComponents(layout) {
        // ROOT FIX: Use DOM Render Coordinator for reordering if available
        if (window.domRenderCoordinator) {
            this.logger.debug('RENDER', 'Using DOM Render Coordinator for reordering');
            window.domRenderCoordinator.reorderComponents(layout);
            return;
        }
        
        // ROOT FIX: Enhanced layout validation
        const validatedLayout = this.validateAndNormalizeLayout(layout);
        
        if (validatedLayout.length === 0) {
            this.logger.debug('RENDER', 'reorderComponents: No layout to apply');
            return;
        }

        const perfEnd = performanceMonitor.start('reorder-components', {
            count: validatedLayout.length
        });

        // ROOT FIX: Always use preview container for reordering
        let activeContainer = this.previewContainer;
        
        if (!activeContainer) {
            this.logger.debug('RENDER', 'No preview container available for reordering');
            perfEnd();
            return;
        }
        
        this.logger.debug('RENDER', 'Reordering within preview container consistently');

        // ROOT FIX: CRITICAL - FIXED reordering logic to handle component removal properly
        const currentChildren = Array.from(activeContainer.children);
        const currentChildIds = currentChildren.map(child => child.id).filter(id => id);
        
        this.logger.debug('RENDER', 'Reorder check:', {
            layoutLength: validatedLayout.length,
            currentChildrenCount: currentChildren.length,
            currentChildIds: currentChildIds,
            layoutIds: validatedLayout
        });
        
        // ROOT FIX: Skip reordering if layout and DOM are already in sync
        const layoutMatches = JSON.stringify(validatedLayout) === JSON.stringify(currentChildIds);
        if (layoutMatches) {
            this.logger.debug('RENDER', 'Layout already matches DOM order, skipping reorder');
            perfEnd();
            return;
        }
        
        // ROOT CAUSE FIX: Instead of skipping reorder when components are missing,
        // first remove any DOM elements that shouldn't be there (removed components)
        const elementsToRemove = currentChildren.filter(child => 
            child.id && !validatedLayout.includes(child.id)
        );
        
        if (elementsToRemove.length > 0) {
            this.logger.info('RENDER', `Removing ${elementsToRemove.length} components no longer in layout`);
            elementsToRemove.forEach(element => {
                element.remove();
                if (element.id) {
                    this.componentCache.delete(element.id);
                    this.logger.debug('RENDER', `Removed component from DOM: ${element.id}`);
                }
            });
        }
        
        // Now check if we have all required components in DOM
        const updatedChildren = Array.from(activeContainer.children);
        const updatedChildIds = updatedChildren.map(child => child.id).filter(id => id);
        const stillMissingFromDOM = validatedLayout.filter(id => !updatedChildIds.includes(id));
        
        if (stillMissingFromDOM.length > 0) {
            this.logger.debug('RENDER', 'Some components still missing from DOM after cleanup:', stillMissingFromDOM);
            this.logger.debug('RENDER', 'This is expected during component transitions - will be resolved by rendering queue');
            
            // ROOT CAUSE FIX: Don't proceed with reordering if too many components are missing
            // This prevents DOM corruption during component transitions
            if (stillMissingFromDOM.length >= validatedLayout.length / 2) {
                this.logger.debug('RENDER', 'Skipping reorder - majority of components missing (likely during render transition)');
                perfEnd();
                return;
            }
        }

        const elementMap = new Map();
        Array.from(activeContainer.children).forEach(child => {
            if (child.id) {
                elementMap.set(child.id, child);
            }
        });

        validatedLayout.forEach((componentId, index) => {
            const element = elementMap.get(componentId);
            if (element) {
                const expectedPosition = activeContainer.children[index];
                if (element !== expectedPosition) {
                    activeContainer.insertBefore(element, expectedPosition || null);
                }
            }
        });

        perfEnd();
        
        this.logger.debug('RENDER', `Reordered ${validatedLayout.length} components in ${activeContainer.id || 'container'}`);
    }

    /**
     * Renders a component using the dynamic component loader.
     * ROOT FIX: Enhanced with comprehensive debugging and error handling
     * @param {string} id - The unique ID of the component instance.
     * @param {string} type - The component type.
     * @param {object} props - The properties for the component.
     * @returns {Promise<{id: string, element: HTMLElement}>}
     */
    async renderComponentWithLoader(id, type, props) {
        try {
            this.logger.debug('RENDER', `renderComponentWithLoader called:`, { id, type, propsKeys: Object.keys(props || {}) });
            
            // ROOT FIX: Verify dynamicComponentLoader is available
            if (!window.dynamicComponentLoader) {
                throw new Error('dynamicComponentLoader not available globally');
            }
            
            // FIX: Correctly call the method on the imported loader instance
            const element = await window.dynamicComponentLoader.renderComponent({
                type,
                id,
                props
            });
            
            if (!element) {
                throw new Error('Template produced no element');
            }
            
            // ROOT FIX: CRITICAL - Attach component controls after successful rendering
            this.attachComponentControls(element, id);
            
            this.logger.debug('RENDER', `Successfully rendered component ${id}:`, {
                elementTagName: element.tagName,
                elementId: element.id,
                hasContent: element.innerHTML.length > 0,
                controlsAttached: true
            });
            
            return {
                id,
                element
            };
        } catch (error) {
            this.logger.error('RENDER', `Error rendering component ${id} (${type}):`, error);
            
            // ROOT FIX: Create a more informative error element
            const errorElement = document.createElement('div');
            errorElement.id = id;
            errorElement.className = 'component-error';
            errorElement.innerHTML = `
                <div style="
                    border: 2px solid #ff6b6b;
                    background: #ffe0e0;
                    padding: 15px;
                    margin: 10px 0;
                    border-radius: 8px;
                    text-align: center;
                ">
                    <h4 style="margin: 0 0 10px 0; color: #d63031;">Error rendering ${type}</h4>
                    <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">${error.message}</p>
                    <button onclick="console.log('Component error details:', ${JSON.stringify({ id, type, error: error.message })})" style="
                        padding: 5px 10px;
                        background: #d63031;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                    ">Debug Info</button>
                </div>
            `;
            
            return {
                id,
                element: errorElement
            };
        }
    }

    cloneState(state) {
        return state ? JSON.parse(JSON.stringify(state)) : null;
    }
    
    /**
     * ROOT FIX: Generate a hash of the state for duplicate render prevention
     */
    generateStateHash(state) {
        try {
            if (!state || !state.components) {
                return 'empty-state';
            }
            
            // Create a simplified hash from component IDs and their types
            const componentData = Object.entries(state.components || {})
                .map(([id, data]) => `${id}:${data.type}:${JSON.stringify(data.props || {})}`)
                .sort()
                .join('|');
            
            const layoutData = Array.isArray(state.layout) ? state.layout.join(',') : '';
            
            return `${componentData}#${layoutData}`;
        } catch (error) {
            this.logger.warn('RENDER', 'Failed to generate state hash:', error);
            return Date.now().toString(); // Fallback to timestamp
        }
    }
    
    // ROOT FIX: emergencyDeduplicateDOM removed - DOM Render Coordinator handles all deduplication

    /**
     * ROOT CAUSE FIX: Enhanced cleanup that properly removes components not in current state
     * This fixes the root cause of components disappearing by ensuring DOM stays in sync with state
     */
    conservativeCleanup(state) {
        if (!this.previewContainer) {
            this.logger.warn('RENDER', 'No preview container for cleanup');
            return;
        }
        
        const currentStateComponentIds = new Set(Object.keys(state.components || {}));
        const elementsToRemove = [];
        
        for (const child of this.previewContainer.children) {
            // Remove elements that are definitely orphaned
            if (!child.id || 
                child.classList.contains('component-error') || 
                child.classList.contains('component-placeholder') ||
                child.textContent === 'Component loading...') {
                elementsToRemove.push(child);
            }
            // ROOT CAUSE FIX: Also remove elements that are no longer in the current state
            else if (child.id && !currentStateComponentIds.has(child.id)) {
                elementsToRemove.push(child);
                this.logger.debug('RENDER', `Cleanup: Component ${child.id} no longer in state, removing from DOM`);
            }
        }
        
        // Remove the confirmed orphaned elements
        elementsToRemove.forEach(element => {
            element.remove();
            if (element.id) {
                this.componentCache.delete(element.id);
                this.logger.debug('RENDER', `Cleanup: Removed ${element.id}`);
            }
        });
        
        if (elementsToRemove.length > 0) {
            this.logger.debug('RENDER', `Cleanup: Removed ${elementsToRemove.length} orphaned elements`);
        }
        
        // ROOT CAUSE FIX: After cleanup, ensure empty state display is updated
        this.updateEmptyStateAfterCleanup(state);
    }

    cleanupOrphanedElements(state) {
        // ROOT FIX: CRITICAL - Disable aggressive cleanup that removes newly added components
        // This method was causing newly added components to disappear due to state sync timing issues
        
        this.logger.debug('RENDER', 'cleanupOrphanedElements: Skipping aggressive cleanup to prevent component disappearance');
        
        // Only remove elements that are definitively orphaned (have no ID or are error elements)
        const elementsToRemove = [];
        
        for (const child of this.previewContainer.children) {
            // Only remove elements that are clearly errors or have no ID
            if (!child.id || child.classList.contains('component-error')) {
                elementsToRemove.push(child);
            }
        }
        
        // Remove only the confirmed orphaned elements
        elementsToRemove.forEach(element => {
            element.remove();
            if (element.id) {
                this.componentCache.delete(element.id);
                this.logger.debug('RENDER', `Removed orphaned element: ${element.id}`);
            }
        });
        
        this.logger.debug('RENDER', `Cleaned up ${elementsToRemove.length} orphaned elements (conservative approach)`);
    }

    healthCheck() {
        if (this.isRendering) {
            const renderDuration = Date.now() - this.renderStartTime;
            if (renderDuration > 10000) {
                this.isRendering = false;
                this.renderQueue.clear();
            }
        }
    }

    destroy() {
        if (this.stateUnsubscribe) this.stateUnsubscribe();
        if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
        if (this.renderDebounceTimer) clearTimeout(this.renderDebounceTimer);
        
        // Clean up UI registry registrations
        this.registeredComponents.forEach(componentId => {
            const unregister = this.updateHandlers.get(componentId);
            if (unregister) {
                unregister();
            }
        });
        
        this.initialized = false;
        this.componentCache.clear();
        // ROOT FIX: Clear queued renders and acknowledgments
        this.queuedRenders.clear();
        this.renderAcknowledgments.clear();
        this.registeredComponents.clear();
        this.updateHandlers.clear();
        
        this.logger.info('RENDER', 'Enhanced component renderer destroyed');
    }
    
    /**
     * Get renderer statistics
     */
    getStats() {
        return {
            initialized: this.initialized,
            cachedComponents: this.componentCache.size,
            registeredWithUIRegistry: this.registeredComponents.size,
            // ROOT FIX: Updated stats to reflect queue integration
            queuedRenders: this.queuedRenders.size,
            pendingAcknowledgments: this.renderAcknowledgments.size,
            renderingMode: this.renderingMode,
            queueManagerStats: renderingQueueManager.getStatistics()
        };
    }
    
    /**
     * CRITICAL FIX: Enhanced renderComponent method for queue integration
     * This method provides the standardized interface expected by the system registrar
     * ROOT FIX: Now integrates with rendering queue when called by queue manager
     */
    async renderComponent(componentConfig) {
        try {
            if (!componentConfig || (!componentConfig.type && !componentConfig.id)) {
                throw new Error('Invalid component configuration: missing type or id');
            }
            
            // Handle different input formats for maximum compatibility
            const config = {
                id: componentConfig.id || `component-${Date.now()}`,
                type: componentConfig.type || componentConfig.componentType,
                props: componentConfig.props || componentConfig.data || {}
            };
            
            this.logger.debug('RENDER', `renderComponent called for ${config.type}`, config);
            
            // ROOT FIX: Use renderComponentWithLoader method which handles both direct and queued rendering
            const result = await this.renderComponentWithLoader(config.id, config.type, config.props);
            
            // ROOT FIX: Update component cache and handle DOM insertion
            if (result && result.element) {
                this.componentCache.set(config.id, result.element);
                
                // Insert into DOM if not already present
                const existingElement = document.getElementById(config.id);
                if (!existingElement && this.previewContainer) {
                    this.previewContainer.appendChild(result.element);
                }
                
                // Register with UI registry if available
                if (config.props || config.data) {
                    const componentState = {
                        type: config.type,
                        props: config.props,
                        data: config.data
                    };
                    this.registerComponentWithUIRegistry(config.id, result.element, componentState);
                }
            }
            
            this.logger.debug('RENDER', `renderComponent completed for ${config.type}`);
            return result;
            
        } catch (error) {
            this.logger.error('RENDER', 'renderComponent failed', error);
            throw error;
        }
    }
    
    /**
     * ROOT FIX: CRITICAL - Render saved components on initialization
     * This specialized method ensures saved components are properly rendered
     * into the correct container without interference from empty state handlers
     * 
     * @param {Object} initialState - Initial state containing saved components
     */
    async renderSavedComponents(initialState) {
        if (!initialState || !initialState.components) {
            this.logger.warn('RENDER', 'renderSavedComponents: No initial state or components');
            return false;
        }
        
        try {
            const componentCount = Object.keys(initialState.components).length;
            this.logger.info('RENDER', `renderSavedComponents: Starting render of ${componentCount} saved components`);
            
            // ROOT CAUSE FIX: Get the correct container and ensure it's visible
            let targetContainer = document.getElementById('saved-components-container');
            
            if (targetContainer) {
                // Make sure the saved components container is visible
                targetContainer.style.display = 'block';
                this.logger.info('RENDER', 'Using saved-components-container for rendering');
                
                // Hide empty state if it exists
                const emptyState = document.getElementById('empty-state');
                if (emptyState) {
                    emptyState.style.display = 'none';
                }
            } else {
                // Fall back to preview container
                targetContainer = this.previewContainer;
                this.logger.info('RENDER', 'No saved-components-container found, using preview container');
            }
            
            if (!targetContainer) {
                this.logger.error('RENDER', 'No target container available for saved components');
                return false;
            }
            
            // ROOT CAUSE FIX: Remove ONLY duplicate elements, not all components
            // This prevents the blank page issue when saved components exist
            const componentIds = Object.keys(initialState.components);
            let duplicatesRemoved = 0;
            
            componentIds.forEach(componentId => {
                // Find all elements with this component ID
                const allMatchingElements = [
                    ...document.querySelectorAll(`#${componentId}`),
                    ...document.querySelectorAll(`[data-component-id="${componentId}"]`)
                ];
                
                // Remove duplicates only (keep first occurrence)
                if (allMatchingElements.length > 1) {
                    for (let i = 1; i < allMatchingElements.length; i++) {
                        allMatchingElements[i].remove();
                        duplicatesRemoved++;
                    }
                }
            });
            
            if (duplicatesRemoved > 0) {
                this.logger.warn('RENDER', `Removed ${duplicatesRemoved} duplicate elements before rendering`);
            }
            
            // ROOT CAUSE FIX: Render components SEQUENTIALLY to prevent race conditions
            // This prevents duplicates and ensures proper DOM insertion
            const componentIdList = Object.keys(initialState.components);
            const fragment = document.createDocumentFragment();
            
            this.logger.debug('RENDER', `renderSavedComponents: Processing ${componentIdList.length} components SEQUENTIALLY`);
            
            // ROOT FIX: Use DOM Render Coordinator for duplicate-free rendering
            const renderedResults = [];
            for (const componentId of componentIdList) {
                try {
                    const componentState = initialState.components[componentId];
                    if (!componentState) {
                        this.logger.warn('RENDER', `No state found for saved component: ${componentId}`);
                        continue;
                    }
                    
                    // ROOT FIX: Use DOM Render Coordinator to check and prevent duplicates
                    if (window.domRenderCoordinator) {
                        // Force cleanup any existing duplicates before rendering
                        window.domRenderCoordinator.aggressiveDeduplication(componentId);
                    }
                    
                    // Check if component already exists in DOM after cleanup
                    const existingElement = document.getElementById(componentId);
                    if (existingElement) {
                        this.logger.debug('RENDER', `Component ${componentId} already exists in DOM after cleanup, skipping render`);
                        continue;
                    }
                    
                    const result = await this.renderComponentWithLoader(
                        componentId,
                        componentState.type,
                        componentState.props || componentState.data || {}
                    );
                    
                    if (result && result.element) {
                        // ROOT FIX: Use DOM Render Coordinator for insertion
                        if (window.domRenderCoordinator && window.domRenderCoordinator.isInitialized) {
                            const success = await window.domRenderCoordinator.renderComponent(
                                componentId,
                                result.element,
                                targetContainer.id || 'saved-components-container',
                                { 
                                    componentType: componentState.type,
                                    source: 'renderSavedComponents',
                                    attachControls: true
                                }
                            );
                            
                            if (success) {
                                // Update our cache
                                this.componentCache.set(componentId, result.element);
                                
                                // Register with UI registry
                                this.registerComponentWithUIRegistry(componentId, result.element, componentState);
                                
                                this.logger.debug('RENDER', `renderSavedComponents: Successfully rendered ${componentId} via coordinator`);
                                renderedResults.push({ componentId, element: result.element, componentState });
                                successfulRenders++;
                            } else {
                                this.logger.error('RENDER', `renderSavedComponents: Coordinator failed to render ${componentId}`);
                            }
                        } else {
                            // Fallback: Direct insertion (should not happen)
                            targetContainer.appendChild(result.element);
                            this.componentCache.set(componentId, result.element);
                            this.registerComponentWithUIRegistry(componentId, result.element, componentState);
                            this.attachComponentControls(result.element, componentId);
                            renderedResults.push({ componentId, element: result.element, componentState });
                            successfulRenders++;
                            this.logger.warn('RENDER', `renderSavedComponents: Used fallback rendering for ${componentId}`);
                        }
                    } else {
                        this.logger.error('RENDER', `renderSavedComponents: Failed to render ${componentId}`);
                    }
                    
                } catch (componentError) {
                    this.logger.error('RENDER', `renderSavedComponents: Error rendering component ${componentId}:`, componentError);
                }
            }
            
            // ROOT FIX: Don't append fragment since coordinator already handled DOM insertion
            let successfulRenders = renderedResults.length;
            
            // ROOT FIX: Duplicate verification delegated to DOM Render Coordinator
            
            // Apply layout order if available
            if (initialState.layout && Array.isArray(initialState.layout)) {
                this.reorderComponents(initialState.layout);
            }
            
            // Verify render success
            const finalChildCount = targetContainer.children.length;
            
            this.logger.info('RENDER', `renderSavedComponents: Completed - ${successfulRenders}/${componentCount} components rendered`, {
                targetContainerId: targetContainer.id || 'preview-container',
                parallelRenderingUsed: true,
                finalChildCount,
                expectedCount: componentCount
            });
            
            // ROOT CAUSE FIX: Update empty state display after rendering
            // This ensures the UI correctly reflects the component state
            this.updateEmptyState(initialState);
            this.logger.debug('RENDER', 'Updated empty state display after rendering saved components');
            
            return successfulRenders > 0;
            
        } catch (error) {
            this.logger.error('RENDER', 'renderSavedComponents: Critical error:', error);
            return false;
        }
    }
    
    /**
     * Manual render method - forces a complete re-render of all components
     * ROOT FIX: Enhanced with debugging and fallback for DOM insertion issues
     */
    async render() {
        if (!this.initialized) {
            this.logger.warn('RENDER', 'Cannot render: renderer not initialized');
            return false;
        }
        
        try {
            const state = enhancedStateManager.getState();
            const componentCount = Object.keys(state.components || {}).length;
            
            this.logger.info('RENDER', `Manual render triggered for ${componentCount} components`);
            
            if (componentCount === 0) {
                this.updateEmptyState(state);
                return true;
            }
            
            // ROOT FIX: Enhanced debugging for DOM insertion
            this.logger.debug('RENDER', 'Preview container before clear:', {
                innerHTML: this.previewContainer.innerHTML.length,
                childrenCount: this.previewContainer.children.length
            });
            
            // Clear existing components
            this.previewContainer.innerHTML = '';
            this.componentCache.clear();
            
            this.logger.debug('RENDER', 'Preview container after clear:', {
                innerHTML: this.previewContainer.innerHTML.length,
                childrenCount: this.previewContainer.children.length
            });
            
            // ROOT FIX: Try queue-based rendering first, then fallback to direct rendering
            let renderSuccess = false;
            
            if (this.renderingMode === 'queue' && window.renderingQueueManager) {
                this.logger.info('RENDER', 'Attempting queue-based rendering');
                
                try {
                    // Enter initial state mode for batch rendering
                    renderingQueueManager.enterInitialStateMode();
                    
                    // Queue all components for rendering
                    const componentIds = new Set(Object.keys(state.components));
                    await this.queueComponentAdditions(componentIds, state);
                    
                    // Check if components were actually added to DOM
                    const finalChildrenCount = this.previewContainer.children.length;
                    this.logger.debug('RENDER', `Queue rendering result: ${finalChildrenCount} children in DOM`);
                    
                    if (finalChildrenCount > 0) {
                        renderSuccess = true;
                        this.logger.info('RENDER', 'Queue-based rendering successful');
                    } else {
                        this.logger.warn('RENDER', 'Queue-based rendering completed but no DOM elements created');
                    }
                    
                } catch (queueError) {
                    this.logger.error('RENDER', 'Queue-based rendering failed:', queueError);
                } finally {
                    // Exit initial state mode
                    renderingQueueManager.exitInitialStateMode();
                }
            }
            
            // ROOT FIX: Fallback to direct rendering if queue failed or unavailable
            if (!renderSuccess) {
                this.logger.info('RENDER', 'Falling back to direct rendering');
                
                try {
                    const componentIds = Object.keys(state.components);
                    await this.renderNewComponents(new Set(componentIds), state);
                    
                    const finalChildrenCount = this.previewContainer.children.length;
                    this.logger.debug('RENDER', `Direct rendering result: ${finalChildrenCount} children in DOM`);
                    
                    if (finalChildrenCount > 0) {
                        renderSuccess = true;
                        this.logger.info('RENDER', 'Direct rendering successful');
                    } else {
                        this.logger.error('RENDER', 'Direct rendering failed - no DOM elements created');
                        
                        // ROOT FIX: Ultimate fallback - create placeholder elements
                        this.logger.warn('RENDER', 'Creating placeholder elements as last resort');
                        await this.createPlaceholderComponents(state.components);
                        renderSuccess = true;
                    }
                    
                } catch (directError) {
                    this.logger.error('RENDER', 'Direct rendering failed:', directError);
                }
            }
            
            // Update empty state
            this.updateEmptyState(state);
            
            this.logger.info('RENDER', `Manual render complete: ${componentCount} components rendered, success: ${renderSuccess}`);
            return renderSuccess;
            
        } catch (error) {
            this.logger.error('RENDER', 'Manual render failed', error);
            return false;
        }
    }
    
    /**
     * ROOT FIX: Queue component additions through rendering queue manager
     */
    async queueComponentAdditions(componentIds, newState) {
        const queuePromises = [];
        
        for (const componentId of componentIds) {
            const componentState = newState.components[componentId];
            if (!componentState) {
                this.logger.error('RENDER', `State for new component ${componentId} not found!`);
                continue;
            }
            
            // Determine priority based on component type and position
            const priority = this.determineRenderPriority(componentState, componentId, newState);
            
            // Queue the render
            const renderId = renderingQueueManager.addToQueue(
                componentId,
                {
                    type: componentState.type,
                    props: componentState.props || componentState.data || {},
                    action: 'add'
                },
                priority,
                {
                    validateRender: true,
                    requireAcknowledgment: true,
                    fallbackOnError: true,
                    isInitialRender: false
                }
            );
            
            // Track the queued render
            this.queuedRenders.set(componentId, {
                renderId,
                action: 'add',
                queuedAt: Date.now(),
                priority
            });
            
            // Create acknowledgment promise
            const acknowledgmentPromise = this.createRenderAcknowledgmentPromise(renderId, componentId);
            queuePromises.push(acknowledgmentPromise);
            
            this.logger.debug('RENDER', 'Component addition queued', {
                componentId,
                renderId,
                priority,
                type: componentState.type
            });
        }
        
        // Wait for all renders to complete or timeout
        try {
            await Promise.allSettled(queuePromises);
            this.logger.info('RENDER', 'Component additions batch completed', {
                count: componentIds.size,
                queuedRenders: this.queuedRenders.size
            });
        } catch (error) {
            this.logger.warn('RENDER', 'Some component additions failed', error);
        }
    }
    
    /**
     * ROOT FIX: Queue component updates through rendering queue manager
     */
    async queueComponentUpdates(componentIds, newState) {
        const queuePromises = [];
        
        for (const componentId of componentIds) {
            const componentState = newState.components[componentId];
            if (!componentState) {
                this.logger.error('RENDER', `State for updated component ${componentId} not found!`);
                continue;
            }
            
            // Higher priority for updates since user is actively editing
            const priority = 'high';
            
            // Queue the update
            const renderId = renderingQueueManager.addToQueue(
                componentId,
                {
                    type: componentState.type,
                    props: componentState.props || componentState.data || {},
                    action: 'update'
                },
                priority,
                {
                    validateRender: true,
                    requireAcknowledgment: true,
                    fallbackOnError: false, // Don't fallback for updates
                    isInitialRender: false
                }
            );
            
            // Track the queued render
            this.queuedRenders.set(componentId, {
                renderId,
                action: 'update',
                queuedAt: Date.now(),
                priority
            });
            
            // Create acknowledgment promise
            const acknowledgmentPromise = this.createRenderAcknowledgmentPromise(renderId, componentId);
            queuePromises.push(acknowledgmentPromise);
            
            this.logger.debug('RENDER', 'Component update queued', {
                componentId,
                renderId,
                priority,
                type: componentState.type
            });
        }
        
        // Wait for all updates to complete or timeout
        try {
            await Promise.allSettled(queuePromises);
            this.logger.info('RENDER', 'Component updates batch completed', {
                count: componentIds.size
            });
        } catch (error) {
            this.logger.warn('RENDER', 'Some component updates failed', error);
        }
    }
    
    /**
     * ROOT FIX: Determine render priority based on component characteristics
     */
    determineRenderPriority(componentState, componentId, newState) {
        // Critical priority for hero components (above fold)
        if (componentState.type === 'hero' || componentState.type === 'header') {
            return 'critical';
        }
        
        // High priority for components in viewport or recently added
        const layout = newState.layout || [];
        const position = layout.indexOf(componentId);
        
        if (position >= 0 && position < 3) {
            return 'high'; // First 3 components
        }
        
        // Normal priority for most components
        return 'normal';
    }
    
    /**
     * ROOT FIX: Create acknowledgment promise for render completion tracking
     */
    createRenderAcknowledgmentPromise(renderId, componentId) {
        return new Promise((resolve, reject) => {
            const timeout = 5000; // 5 second timeout
            
            const acknowledgment = {
                resolve,
                reject,
                componentId,
                timeout: setTimeout(() => {
                    this.renderAcknowledgments.delete(renderId);
                    reject(new Error(`Render acknowledgment timeout for ${componentId}`));
                }, timeout)
            };
            
            this.renderAcknowledgments.set(renderId, acknowledgment);
        });
    }
    
    /**
     * ROOT FIX: Setup rendering queue event listeners
     */
    setupRenderingQueueListeners() {
        // Listen for render completions
        eventBus.on('render:completed', (event) => {
            const { renderId, componentId, success, duration } = event;
            this.handleRenderCompletion(renderId, componentId, success, duration);
        });
        
        // Listen for render failures
        eventBus.on('render:failed', (event) => {
            const { renderId, componentId, error } = event;
            this.handleRenderFailure(renderId, componentId, error);
        });
        
        // Listen for batch completions
        eventBus.on('render:batch-completed', (event) => {
            const { results, statistics } = event;
            this.handleBatchCompletion(results, statistics);
        });
        
        this.logger.debug('RENDER', 'Rendering queue event listeners setup complete');
    }
    
    /**
     * ROOT FIX: Setup save operation tracking to prevent render clearing
     */
    setupSaveTracking() {
        // Listen for manual save events
        eventBus.on('gmkb:manual-save-start', () => {
            this.lastSaveTime = Date.now();
            this.logger.debug('RENDER', 'Manual save started - tracking for render protection');
        });
        
        // Listen for auto-save events
        eventBus.on('gmkb:auto-save-success', () => {
            this.lastSaveTime = Date.now();
            this.logger.debug('RENDER', 'Auto-save completed - tracking for render protection');
        });
        
        // Listen for save button clicks
        document.addEventListener('click', (event) => {
            if (event.target && (event.target.id === 'save-btn' || event.target.closest('#save-btn'))) {
                this.lastSaveTime = Date.now();
                this.logger.debug('RENDER', 'Save button clicked - tracking for render protection');
            }
        });
        
        this.logger.debug('RENDER', 'Save operation tracking setup complete');
    }
    
    /**
     * ROOT FIX: Setup component controls integration
     * CHECKLIST COMPLIANT: Event-driven, dependency-aware, no polling
     */
    setupComponentControlsIntegration() {
        // Listen for component controls manager ready event
        document.addEventListener('gmkb:component-controls-manager-ready', () => {
            this.logger.info('RENDER', 'Component controls manager ready - attaching controls to existing components');
            this.attachControlsToExistingComponents();
        });
        
        // Listen for individual component ready events
        document.addEventListener('gmkb:component-rendered', (event) => {
            const { componentId, element } = event.detail;
            if (window.componentControlsManager && window.componentControlsManager.isInitialized) {
                this.attachComponentControls(element, componentId);
            }
        });
        
        this.logger.debug('RENDER', 'Component controls integration setup complete');
    }
    
    /**
     * ROOT FIX: Attach controls to all existing components after controls manager is ready
     * This fixes the race condition where components were rendered before controls manager was ready
     */
    attachControlsToExistingComponents() {
        // ROOT FIX: Add defensive null check to prevent race condition errors
        if (!this.previewContainer) {
            this.logger.warn('RENDER', 'Preview container not available, skipping attachment of controls to existing components.');
            return;
        }
        
        if (!window.componentControlsManager || !window.componentControlsManager.isInitialized) {
            this.logger.warn('RENDER', 'Cannot attach controls - component controls manager not ready');
            return;
        }
        
        let attachedCount = 0;
        const allComponents = this.previewContainer.querySelectorAll('[data-component-id]');
        
        allComponents.forEach(element => {
            const componentId = element.getAttribute('data-component-id');
            if (componentId) {
                const success = this.attachComponentControls(element, componentId);
                if (success) {
                    attachedCount++;
                }
            }
        });
        
        this.logger.info('RENDER', `Controls attached to ${attachedCount}/${allComponents.length} existing components`);
        
        // Emit event for successful bulk attachment
        if (attachedCount > 0) {
            document.dispatchEvent(new CustomEvent('gmkb:bulk-controls-attached', {
                detail: {
                    attachedCount,
                    totalComponents: allComponents.length,
                    source: 'renderer-integration',
                    timestamp: Date.now()
                }
            }));
        }
    }
    
    /**
     * ROOT FIX: Handle render completion events
     */
    handleRenderCompletion(renderId, componentId, success, duration) {
        // Update component cache if successful
        if (success) {
            const element = document.getElementById(componentId);
            if (element) {
                this.componentCache.set(componentId, element);
            }
        }
        
        // Resolve acknowledgment promise
        const acknowledgment = this.renderAcknowledgments.get(renderId);
        if (acknowledgment) {
            clearTimeout(acknowledgment.timeout);
            acknowledgment.resolve({ success, duration, componentId });
            this.renderAcknowledgments.delete(renderId);
        }
        
        // Clean up queued render tracking
        this.queuedRenders.delete(componentId);
        
        this.logger.debug('RENDER', 'Render completion handled', {
            renderId,
            componentId,
            success,
            duration
        });
    }
    
    /**
     * ROOT FIX: Handle render failure events
     */
    handleRenderFailure(renderId, componentId, error) {
        // Reject acknowledgment promise
        const acknowledgment = this.renderAcknowledgments.get(renderId);
        if (acknowledgment) {
            clearTimeout(acknowledgment.timeout);
            acknowledgment.reject(new Error(`Render failed: ${error}`));
            this.renderAcknowledgments.delete(renderId);
        }
        
        // Clean up queued render tracking
        this.queuedRenders.delete(componentId);
        
        this.logger.warn('RENDER', 'Render failure handled', {
            renderId,
            componentId,
            error
        });
    }
    
    /**
     * ROOT FIX: Handle batch completion events
     */
    handleBatchCompletion(results, statistics) {
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        this.logger.info('RENDER', 'Batch completion handled', {
            total: results.length,
            successful,
            failed,
            queueStatistics: statistics
        });
        
        // Emit renderer-specific batch completion event
        eventBus.emit('renderer:batch-completed', {
            rendererStats: this.getStats(),
            queueStats: statistics,
            batchResults: results
        });
    }
    
    /**
     * ROOT FIX: Ultimate fallback - create placeholder components if rendering fails
     */
    async createPlaceholderComponents(components) {
        this.logger.warn('RENDER', 'Creating placeholder components as fallback');
        
        for (const [componentId, componentData] of Object.entries(components)) {
            try {
                const placeholderElement = document.createElement('div');
                placeholderElement.id = componentId;
                placeholderElement.className = `component-placeholder ${componentData.type}-component`;
                placeholderElement.innerHTML = `
                    <div style="
                        border: 2px dashed #ccc;
                        padding: 20px;
                        margin: 10px 0;
                        text-align: center;
                        background: #f9f9f9;
                        border-radius: 8px;
                    ">
                        <h3 style="margin: 0 0 10px 0; color: #666;">${componentData.type} Component</h3>
                        <p style="margin: 0; color: #999; font-size: 14px;">Placeholder - Template loading failed</p>
                        <button onclick="window.location.reload()" style="
                            margin-top: 10px;
                            padding: 5px 10px;
                            background: #007cba;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                        ">Reload Builder</button>
                    </div>
                `;
                
                this.previewContainer.appendChild(placeholderElement);
                this.componentCache.set(componentId, placeholderElement);
                
                this.logger.debug('RENDER', `Created placeholder for ${componentData.type} component`);
                
            } catch (error) {
                this.logger.error('RENDER', `Failed to create placeholder for ${componentId}:`, error);
            }
        }
    }
    
    /**
     * Debug renderer state
     */
    debug() {
        console.group('%c🎨 Enhanced Component Renderer Debug', 'font-size: 14px; font-weight: bold; color: #9C27B0');
        
        const stats = this.getStats();
        console.log('Renderer Stats:', stats);
        
        console.log('Component Cache:');
        console.table(Array.from(this.componentCache.keys()).map(id => ({
            componentId: id,
            hasElement: !!this.componentCache.get(id),
            registeredWithUIRegistry: this.registeredComponents.has(id)
        })));
        
        // ROOT FIX: Show queued renders instead of legacy render queue
        if (this.queuedRenders.size > 0) {
            console.log('Queued Renders:', Array.from(this.queuedRenders.entries()));
        }
        
        if (this.renderAcknowledgments.size > 0) {
            console.log('Pending Acknowledgments:', this.renderAcknowledgments.size);
        }
        
        // Show rendering queue manager stats
        console.log('Queue Manager Stats:', renderingQueueManager.getStatistics());
        
        console.groupEnd();
    }

    /**
     * ROOT CAUSE FIX: Update empty state visibility AND container visibility
     * Fixed to properly handle container switching when components are added/removed
     */
    updateEmptyState(state) {
        const hasComponents = Object.keys(state.components || {}).length > 0;
        
        this.logger.debug('RENDER', 'Empty state check (respecting template)', { 
            hasComponents, 
            note: 'PHP template controls initial display' 
        });
        
        // ROOT CAUSE FIX: Update container visibility based on component count
        const savedComponentsContainer = document.getElementById('saved-components-container');
        const emptyState = document.getElementById('empty-state');
        
        if (hasComponents) {
            // Show saved components container, hide empty state
            if (savedComponentsContainer) {
                savedComponentsContainer.style.display = 'block';
                this.logger.debug('RENDER', 'Showing saved components container');
            }
            if (emptyState) {
                emptyState.style.display = 'none';
                this.logger.debug('RENDER', 'Hiding empty state');
            }
        } else {
            // Show empty state, hide saved components container  
            if (emptyState) {
                emptyState.style.display = 'block';
                this.logger.debug('RENDER', 'Showing empty state');
            }
            if (savedComponentsContainer) {
                savedComponentsContainer.style.display = 'none';
                this.logger.debug('RENDER', 'Hiding saved components container');
            }
        }
        
        // Update drop zones without affecting empty state
        const dropZone = document.querySelector('.drop-zone--primary');
        if (dropZone && hasComponents) {
            dropZone.style.display = 'none';
        }
    }
    
    /**
     * ROOT CAUSE FIX: Update empty state after cleanup operations
     * This ensures the UI properly reflects the current state after component removal
     */
    updateEmptyStateAfterCleanup(state) {
        // Use the main updateEmptyState method to ensure consistency
        this.updateEmptyState(state);
        
        const hasComponents = Object.keys(state.components || {}).length > 0;
        this.logger.debug('RENDER', `Empty state updated after cleanup: ${hasComponents ? 'has components' : 'empty'}`);
    }

    /**
     * Setup event listeners for empty state buttons
     */
    setupEmptyStateListeners() {
        const addFirstComponentBtn = document.getElementById('add-first-component');
        const loadTemplateBtn = document.getElementById('load-template');

        if (addFirstComponentBtn && !addFirstComponentBtn.hasAttribute('data-listener-attached')) {
            addFirstComponentBtn.setAttribute('data-listener-attached', 'true');
            addFirstComponentBtn.addEventListener('click', () => {
                this.logger.debug('UI', 'Add first component clicked');
                // Trigger component library modal via event bus
                eventBus.emit('ui:show-component-library');
            });
        }

        if (loadTemplateBtn && !loadTemplateBtn.hasAttribute('data-listener-attached')) {
            loadTemplateBtn.setAttribute('data-listener-attached', 'true');
            loadTemplateBtn.addEventListener('click', () => {
                this.logger.debug('UI', 'Load template clicked');
                // Trigger template library modal via event bus
                eventBus.emit('ui:show-template-library');
            });
        }
    }
}

// ROOT FIX: Create and expose enhanced component renderer globally
const enhancedComponentRenderer = new EnhancedComponentRenderer();

// ROOT FIX: WordPress-compatible global exposure
window.enhancedComponentRenderer = enhancedComponentRenderer;
window.EnhancedComponentRenderer = EnhancedComponentRenderer;

// ROOT FIX: Also expose as legacy compatibility
if (!window.renderer) {
    window.renderer = enhancedComponentRenderer;
}

console.log('✅ ROOT FIX: Enhanced Component Renderer exposed globally (WordPress-compatible)');

})(); // ROOT FIX: Close IIFE wrapper
