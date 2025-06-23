/**
 * @file enhanced-component-renderer.js
 * @description Intelligent diff-based rendering with optimized updates. This is the primary renderer
 * for the new architecture, handling state changes and DOM updates efficiently.
 *
 * This version includes fixes for module imports to align with the new architecture.
 */

// FIX: Corrected import to use the named export for dynamicComponentLoader.
import {
    dynamicComponentLoader
} from '../components/dynamic-component-loader.js';
// FIX: Corrected import to use the named export for enhancedStateManager.
import {
    enhancedStateManager
} from './enhanced-state-manager.js';
import {
    performanceMonitor
} from '../utils/performance-monitor.js';
import {
    uiRegistry
} from './ui-registry.js';
import {
    eventBus
} from './event-bus.js';
import {
    structuredLogger
} from '../utils/structured-logger.js';
import {
    showToast
} from '../utils/toast-polyfill.js';

class EnhancedComponentRenderer {
    constructor() {
        this.initialized = false;
        this.previewContainer = null;
        this.renderQueue = new Set();
        this.isRendering = false;
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
        
        // Setup UI registry event listeners
        this.setupUIRegistryListeners();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
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
        }

        this.setupEmptyStateListeners();
    }

    onStateChange(newState) {
        if (!this.initialized || this.disableRendering) return;

        if (this.renderDebounceTimer) {
            clearTimeout(this.renderDebounceTimer);
        }

        this.renderDebounceTimer = setTimeout(async () => {
            if (this.isRendering) {
                this.renderQueue.add(newState);
                return;
            }

            const changes = this.diffState(this.lastState, newState);

            if (!changes.added.size && !changes.removed.size && !changes.updated.size && !changes.moved.size) {
                return;
            }

            this.isRendering = true;
            this.renderStartTime = Date.now();

            try {
                await this.processChanges(changes, newState);
                this.lastState = this.cloneState(newState);
            } catch (error) {
                console.error('Error during rendering process:', error);
            } finally {
                this.isRendering = false;
                this.renderStartTime = null;

                if (this.renderQueue.size > 0) {
                    const nextState = this.renderQueue.values().next().value;
                    this.renderQueue.clear();
                    this.onStateChange(nextState);
                }
            }
        }, 50);
    }

    diffState(oldState, newState) {
        const changes = {
            added: new Set(),
            removed: new Set(),
            updated: new Set(),
            moved: new Set()
        };

        if (!oldState) {
            Object.keys(newState.components).forEach(id => changes.added.add(id));
            return changes;
        }

        const oldKeys = new Set(Object.keys(oldState.components));
        const newKeys = new Set(Object.keys(newState.components));

        newKeys.forEach(key => {
            if (!oldKeys.has(key)) {
                changes.added.add(key);
            }
        });

        oldKeys.forEach(key => {
            if (!newKeys.has(key)) {
                changes.removed.add(key);
            }
        });

        newKeys.forEach(key => {
            if (oldKeys.has(key) && JSON.stringify(oldState.components[key]) !== JSON.stringify(newState.components[key])) {
                changes.updated.add(key);
            }
        });

        const oldLayout = oldState.layout || [];
        const newLayout = newState.layout || enhancedStateManager.getLayout();

        if (JSON.stringify(oldLayout) !== JSON.stringify(newLayout)) {
            newLayout.forEach(id => {
                if (!changes.added.has(id) && !changes.removed.has(id)) {
                    changes.moved.add(id);
                }
            });
        }
        return changes;
    }

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
        
        const fragment = document.createDocumentFragment();
        const renderPromises = Array.from(componentIds).map(id => {
            const componentState = newState.components[id];
            if (!componentState) {
                this.logger.error('RENDER', `State for new component ${id} not found!`);
                return null;
            }
            // FIX: Use the new dynamicComponentLoader instance
            return this.renderComponentWithLoader(id, componentState.type, componentState.props || componentState.data);
        });

        const renderedComponents = await Promise.all(renderPromises);
        renderedComponents.forEach(comp => {
            if (comp) {
                fragment.appendChild(comp.element);
                this.componentCache.set(comp.id, comp.element);
                
                // Register with UI registry
                const componentState = newState.components[comp.id];
                this.registerComponentWithUIRegistry(comp.id, comp.element, componentState);
            }
        });

        this.previewContainer.appendChild(fragment);

        const state = enhancedStateManager.getState();
        this.reorderComponents(state.layout);
        
        perfEnd();
        
        this.logger.debug('RENDER', `Rendered ${componentIds.size} new components`);
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
        if (!Array.isArray(layout)) {
            console.error('Renderer Error: reorderComponents called with invalid layout:', layout);
            const state = enhancedStateManager.getState();
            layout = state.layout || [];
            if (!Array.isArray(layout) || layout.length === 0) {
                console.warn('Unable to determine component layout');
                return;
            }
        }

        const perfEnd = performanceMonitor.start('reorder-components', {
            count: layout.length
        });

        const elementMap = new Map();
        Array.from(this.previewContainer.children).forEach(child => {
            elementMap.set(child.id, child);
        });

        layout.forEach((componentId, index) => {
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
     * @param {string} id - The unique ID of the component instance.
     * @param {string} type - The component type.
     * @param {object} props - The properties for the component.
     * @returns {Promise<{id: string, element: HTMLElement}>}
     */
    async renderComponentWithLoader(id, type, props) {
        try {
            // FIX: Correctly call the method on the imported loader instance
            const element = await dynamicComponentLoader.renderComponent({
                type,
                id,
                props
            });
            if (!element) throw new Error('Template produced no element');
            return {
                id,
                element
            };
        } catch (error) {
            console.error(`Error rendering component ${id} (${type}):`, error);
            const errorElement = document.createElement('div');
            errorElement.id = id;
            errorElement.className = 'component-error';
            errorElement.textContent = `Error rendering ${type}.`;
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
        this.renderQueue.clear();
        this.registeredComponents.clear();
        this.updateHandlers.clear();
        this.isRendering = false;
        
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
            queueSize: this.renderQueue.size,
            isRendering: this.isRendering,
            renderStartTime: this.renderStartTime
        };
    }
    
    /**
     * CRITICAL FIX: Add missing renderComponent method for system registrar interface
     * This method provides the standardized interface expected by the system registrar
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
            
            // Use existing renderComponentWithLoader method
            const result = await this.renderComponentWithLoader(config.id, config.type, config.props);
            
            this.logger.debug('RENDER', `renderComponent completed for ${config.type}`);
            return result;
            
        } catch (error) {
            this.logger.error('RENDER', 'renderComponent failed', error);
            throw error;
        }
    }
    
    /**
     * Manual render method - forces a complete re-render of all components
     * GEMINI FIX: Added missing render method for manual triggering
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
            
            // Clear existing components
            this.previewContainer.innerHTML = '';
            this.componentCache.clear();
            
            // Re-render all components
            const componentIds = Object.keys(state.components);
            await this.renderNewComponents(new Set(componentIds), state);
            
            // Update empty state
            this.updateEmptyState(state);
            
            this.logger.info('RENDER', `Manual render complete: ${componentCount} components rendered`);
            return true;
            
        } catch (error) {
            this.logger.error('RENDER', 'Manual render failed', error);
            return false;
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
        
        if (this.renderQueue.size > 0) {
            console.log('Render Queue:', Array.from(this.renderQueue));
        }
        
        console.groupEnd();
    }

    /**
     * Update empty state visibility based on component count
     */
    updateEmptyState(state) {
        const emptyStateEl = document.getElementById('empty-state');
        const dropZone = document.querySelector('.drop-zone--primary');

        if (!emptyStateEl) return;

        const hasComponents = Object.keys(state.components || {}).length > 0;

        if (hasComponents) {
            // Hide empty state
            emptyStateEl.style.display = 'none';
            if (dropZone) dropZone.style.display = 'none';
        } else {
            // Show empty state
            emptyStateEl.style.display = 'flex';
            if (dropZone) dropZone.style.display = 'none'; // Keep drop zone hidden
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

export const enhancedComponentRenderer = new EnhancedComponentRenderer();
