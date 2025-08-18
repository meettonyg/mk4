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
        this.renderDebounceTimer = null;
        this.renderStartTime = null;
        this.healthCheckInterval = null;
        this.logger = structuredLogger;
        
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
            
            // Re-render component with new state
            const { element: newElement } = await this.renderComponentWithLoader(
                componentId, 
                state.type, 
                state.props || state.data
            );
            
            // Replace in DOM
            element.replaceWith(newElement);
            
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

    init() {
        if (this.initialized) return;

        this.previewContainer = document.getElementById('media-kit-preview');
        if (!this.previewContainer) return;

        this.initializeFromDOM();

        this.stateUnsubscribe = enhancedStateManager.subscribeGlobal((state) => {
            this.onStateChange(state);
        });

        this.healthCheckInterval = setInterval(() => this.healthCheck(), 5000);
        this.initialized = true;
    }

    initializeFromDOM() {
        const initialState = enhancedStateManager.getState();
        if (initialState) {
            this.lastState = this.cloneState(initialState);
            Array.from(this.previewContainer.children).forEach(element => {
                if (element.id && this.lastState.components[element.id]) {
                    this.componentCache.set(element.id, element);
                }
            });

            this.updateEmptyState(initialState);
            
            // ROOT FIX: Only check for components, don't force render - let state subscription handle it
            const componentCount = Object.keys(initialState.components || {}).length;
            if (componentCount > 0) {
                this.logger.info('RENDER', `Found ${componentCount} saved components - will render via state subscription`);
            } else {
                this.logger.debug('RENDER', 'No saved components found initially');
            }
        }

        this.setupEmptyStateListeners();
    }

    onStateChange(newState) {
        if (!this.initialized || this.disableRendering) return;

        if (this.renderDebounceTimer) {
            clearTimeout(this.renderDebounceTimer);
        }

        // ROOT FIX: Prevent duplicate renders by checking for actual changes
        this.renderDebounceTimer = setTimeout(async () => {
            // ROOT FIX: Skip rendering if this is the same state we just processed
            if (this.lastState && JSON.stringify(this.lastState) === JSON.stringify(newState)) {
                this.logger.debug('RENDER', 'State unchanged, skipping render');
                return;
            }
            
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

            // ROOT FIX: Process changes through rendering queue for race-condition-free rendering
            await this.processChangesWithQueue(changes, newState);
            this.lastState = this.cloneState(newState);
        }, 50);
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
            
            // Handle moves immediately (layout changes)
            if (changes.moved.size > 0) {
                const state = enhancedStateManager.getState();
                this.reorderComponents(state.layout);
            }
            
            // Cleanup and update empty state
            this.cleanupOrphanedElements(newState);
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
        this.cleanupOrphanedElements(newState);

        this.updateEmptyState(newState);
    }

    removeComponents(componentIds) {
        const perfEnd = performanceMonitor.start('remove-components', {
            count: componentIds.size
        });
        
        componentIds.forEach(id => {
            const element = this.componentCache.get(id) || document.getElementById(id);
            if (element) {
                element.remove();
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
        
        const fragment = document.createDocumentFragment();
        const renderPromises = Array.from(componentIds).map(id => {
            const componentState = newState.components[id];
            if (!componentState) {
                this.logger.error('RENDER', `State for new component ${id} not found!`);
                return null;
            }
            
            this.logger.debug('RENDER', `Rendering component ${id} of type ${componentState.type}`);
            
            // FIX: Use the new dynamicComponentLoader instance
            return this.renderComponentWithLoader(id, componentState.type, componentState.props || componentState.data);
        });

        const renderedComponents = await Promise.all(renderPromises);
        
        this.logger.debug('RENDER', `Render promises completed:`, {
            totalPromises: renderPromises.length,
            successfulRenders: renderedComponents.filter(comp => comp && comp.element).length,
            failedRenders: renderedComponents.filter(comp => !comp || !comp.element).length
        });
        
        let addedToFragment = 0;
        
        renderedComponents.forEach(comp => {
            if (comp && comp.element) {
                fragment.appendChild(comp.element);
                this.componentCache.set(comp.id, comp.element);
                addedToFragment++;
                
                // Register with UI registry
                const componentState = newState.components[comp.id];
                this.registerComponentWithUIRegistry(comp.id, comp.element, componentState);
                
                this.logger.debug('RENDER', `Added component ${comp.id} to fragment`);
            } else {
                this.logger.warn('RENDER', `Component render failed or returned no element:`, comp);
            }
        });
        
        this.logger.debug('RENDER', `Fragment created with ${addedToFragment} components, appending to preview container`);
        
        // ROOT FIX: Verify preview container exists before appending
        if (!this.previewContainer) {
            this.logger.error('RENDER', 'Preview container not found! Cannot append components.');
            return;
        }
        
        this.previewContainer.appendChild(fragment);
        
        // ROOT FIX: Verify components were actually added to DOM
        const finalChildrenCount = this.previewContainer.children.length;
        this.logger.debug('RENDER', `After appendChild: preview container has ${finalChildrenCount} children`);
        
        if (finalChildrenCount === 0 && componentIds.size > 0) {
            this.logger.error('RENDER', 'DOM insertion failed - no children in preview container after appendChild');
        }

        const state = enhancedStateManager.getState();
        this.reorderComponents(state.layout);
        
        perfEnd();
        
        this.logger.debug('RENDER', `Rendered ${componentIds.size} new components, ${addedToFragment} added to DOM`);
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
        // ROOT FIX: Enhanced layout validation
        const validatedLayout = this.validateAndNormalizeLayout(layout);
        
        if (validatedLayout.length === 0) {
            this.logger.debug('RENDER', 'reorderComponents: No layout to apply');
            return;
        }

        const perfEnd = performanceMonitor.start('reorder-components', {
            count: validatedLayout.length
        });

        const elementMap = new Map();
        Array.from(this.previewContainer.children).forEach(child => {
            elementMap.set(child.id, child);
        });

        validatedLayout.forEach((componentId, index) => {
            const element = elementMap.get(componentId);
            if (element) {
                const expectedPosition = this.previewContainer.children[index];
                if (element !== expectedPosition) {
                    this.previewContainer.insertBefore(element, expectedPosition || null);
                }
            }
        });

        perfEnd();
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
            
            this.logger.debug('RENDER', `Successfully rendered component ${id}:`, {
                elementTagName: element.tagName,
                elementId: element.id,
                hasContent: element.innerHTML.length > 0
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

    cleanupOrphanedElements(state) {
        const componentIdsInState = new Set(Object.keys(state.components));
        for (const child of this.previewContainer.children) {
            if (!componentIdsInState.has(child.id)) {
                child.remove();
                this.componentCache.delete(child.id);
            }
        }
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
     * Update empty state visibility based on component count
     * DISABLED: Do not override PHP template rendering
     */
    updateEmptyState(state) {
        // ROOT FIX: DO NOT MANIPULATE DISPLAY STYLES - LET PHP TEMPLATE CONTROL RENDERING
        // The PHP template already renders the correct empty state based on MKCG data availability
        // JavaScript should not override the template's display decisions
        
        const hasComponents = Object.keys(state.components || {}).length > 0;
        
        // Only log the state for debugging, do not manipulate DOM
        this.logger.debug('RENDER', 'Empty state check (non-invasive)', { 
            hasComponents, 
            note: 'PHP template controls empty state display' 
        });
        
        // Optional: Update drop zones without affecting empty state
        const dropZone = document.querySelector('.drop-zone--primary');
        if (dropZone && hasComponents) {
            // Only hide primary drop zone when components exist, but don't show it otherwise
            dropZone.style.display = 'none';
        }
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
