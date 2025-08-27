/**
 * @file component-ui-integration.js
 * @description Component UI Integration Service
 * Handles UI registry integration, component controls, and event coordination
 * 
 * ROOT FIX: Extracted from enhanced-component-renderer.js for better maintainability
 * Following checklist: Event-Driven Initialization, No Global Object Sniffing
 */

(function() {
    'use strict';
    
    // ✅ CHECKLIST COMPLIANT: Pure event-driven initialization  
    const initWhenReady = () => {
        // Check if dependencies are already available
        if (window.structuredLogger && window.eventBus) {
            initializeUIIntegration();
            return;
        }
        
        // ✅ NO POLLING: Listen for dependency ready events only
        const requiredDependencies = ['structuredLogger', 'eventBus'];
        let loadedDependencies = 0;
        
        const checkDependency = () => {
            loadedDependencies++;
            if (loadedDependencies >= requiredDependencies.length || 
                (window.structuredLogger && window.eventBus)) {
                initializeUIIntegration();
            }
        };
        
        // ✅ EVENT-DRIVEN: Listen for service ready events
        document.addEventListener('gmkb:structured-logger-ready', checkDependency, { once: true });
        document.addEventListener('gmkb:event-bus-ready', checkDependency, { once: true });
        document.addEventListener('gmkb:core-systems-ready', checkDependency, { once: true });
    };
    
    const initializeUIIntegration = () => {
        // ✅ ROOT CAUSE FIX: Dependencies guaranteed to be available
        const structuredLogger = window.structuredLogger;
        const eventBus = window.eventBus;
        const uiRegistry = window.uiRegistry || {
            register: () => () => {},
            unregister: () => {},
            forceUpdate: () => {}
        };
        const showToast = window.showToast || function(message, type, duration) {
            console.log(`Toast [${type}]: ${message}`);
        };
        
        if (!structuredLogger || !eventBus) {
            console.error('❌ CRITICAL: Dependencies not available in ComponentUIIntegration');
            return;
        }
        
        structuredLogger.info('UI_INTEGRATION', 'ComponentUIIntegration initializing with event-driven architecture...');

    class ComponentUIIntegration {
        constructor() {
            this.logger = structuredLogger;
            this.registeredComponents = new Set();
            this.updateHandlers = new Map();
            this.keyboardListeners = new Map();
            this.initialized = false;
            
            // Setup event listeners when ready
            this.setupEventListeners();
            this.setupKeyboardShortcuts();
        }

        /**
         * Initialize UI integration
         */
        init() {
            if (this.initialized) {
                return;
            }
            
            this.logger.debug('UI', 'Initializing UI integration');
            this.initialized = true;
            
            // Emit ready event
            document.dispatchEvent(new CustomEvent('gmkb:ui-integration-ready', {
                detail: { 
                    integration: this,
                    timestamp: Date.now()
                }
            }));
        }

        /**
         * Setup event listeners for UI integration
         */
        setupEventListeners() {
            // Listen for components that need re-rendering
            eventBus.on('ui:component-needs-render', (event) => {
                this.handleComponentRerenderRequest(event.data);
            });
            
            // Listen for batch update completion
            eventBus.on('ui:batch-update-complete', (event) => {
                this.logger.debug('UI', `UI batch update completed`, event.data);
            });
            
            // Listen for component rendered events
            document.addEventListener('gmkb:component-rendered', (event) => {
                const { componentId, element } = event.detail;
                if (componentId && element) {
                    this.attachComponentControls(element, componentId);
                }
            });
            
            this.logger.debug('UI', 'Event listeners setup complete');
        }

        /**
         * Setup keyboard shortcuts for undo/redo and other functions
         */
        setupKeyboardShortcuts() {
            const keyboardHandler = (event) => {
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
            };
            
            document.addEventListener('keydown', keyboardHandler);
            this.keyboardListeners.set('main', keyboardHandler);
            
            this.logger.debug('UI', 'Keyboard shortcuts setup complete');
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
         * Attach component controls to rendered element
         */
        attachComponentControls(element, componentId) {
            try {
                // Verify ComponentControlsManager is available
                if (!window.componentControlsManager) {
                    this.logger.warn('UI', 'ComponentControlsManager not available for control attachment', { componentId });
                    return false;
                }
                
                // Ensure element has proper attributes and styling for hover behavior
                if (!element.getAttribute('data-component-id')) {
                    element.setAttribute('data-component-id', componentId);
                }
                
                // Add necessary CSS properties for proper hover detection
                element.style.position = element.style.position || 'relative';
                element.style.cursor = 'pointer';
                element.tabIndex = element.tabIndex >= 0 ? element.tabIndex : 0; // Make focusable
                element.setAttribute('data-controls-enabled', 'true');
                
                // Add debug border if in debug mode
                if (window.GMKBDebugMode) {
                    element.style.border = '1px dashed rgba(0, 255, 0, 0.3)';
                }
                
                // Attach controls using ComponentControlsManager
                const success = window.componentControlsManager.attachControls(element, componentId);
                
                if (success) {
                    this.logger.debug('UI', `Controls attached successfully to component: ${componentId}`);
                    
                    // Verify controls are actually in DOM
                    const controlsElement = element.querySelector('.component-controls--dynamic');
                    if (controlsElement) {
                        this.logger.debug('UI', `Controls element found in DOM for: ${componentId}`);
                    } else {
                        this.logger.warn('UI', `Controls element NOT found in DOM for: ${componentId}`);
                    }
                    
                    // Emit control attachment event
                    document.dispatchEvent(new CustomEvent('gmkb:controls-attached', {
                        detail: {
                            componentId,
                            element,
                            source: 'component-ui-integration',
                            timestamp: Date.now()
                        }
                    }));
                    
                    return true;
                } else {
                    this.logger.warn('UI', `Failed to attach controls to component: ${componentId}`);
                    return false;
                }
                
            } catch (error) {
                this.logger.error('UI', `Error attaching controls to component ${componentId}:`, error);
                return false;
            }
        }

        /**
         * Handle component re-render requests from UI registry
         */
        async handleComponentRerenderRequest({ componentId, element, state }) {
            try {
                this.logger.debug('UI', `Processing re-render request for component: ${componentId}`);
                
                // Check for duplicates and clean up
                const allDuplicates = document.querySelectorAll(`[data-component-id="${componentId}"]`);
                if (allDuplicates.length > 1) {
                    this.logger.warn('UI', `Found ${allDuplicates.length} duplicates of ${componentId}, cleaning up`);
                    // Keep only the first one for replacement
                    for (let i = 1; i < allDuplicates.length; i++) {
                        allDuplicates[i].remove();
                    }
                    element = allDuplicates[0]; // Use the first element
                }
                
                // Check if props have actually changed (dirty check)
                const currentElement = element || document.getElementById(componentId);
                if (currentElement && window.componentRenderEngine) {
                    const needsUpdate = window.componentRenderEngine.needsRerender(
                        currentElement, 
                        state.props || state.data
                    );
                    
                    if (!needsUpdate) {
                        this.logger.debug('UI', `Props unchanged for ${componentId}, skipping re-render`);
                        return;
                    }
                }
                
                // Re-render component with new state
                if (window.componentRenderEngine) {
                    const result = await window.componentRenderEngine.renderComponent({
                        id: componentId,
                        type: state.type,
                        props: state.props || state.data
                    });
                    
                    if (result.success && result.element && currentElement) {
                        // Update content preserving controls
                        const success = await window.componentRenderEngine.updateComponentContent(
                            currentElement,
                            result.element
                        );
                        
                        if (success) {
                            // Update component props
                            await window.componentRenderEngine.updateComponentProps(
                                currentElement,
                                state.props || state.data
                            );
                            
                            this.logger.debug('UI', `Component re-rendered successfully: ${componentId}`);
                        }
                    }
                }
                
            } catch (error) {
                this.logger.error('UI', `Failed to re-render component: ${componentId}`, error);
            }
        }

        /**
         * Register component with UI registry
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
            
            this.logger.debug('UI', `Registered component with UI registry: ${componentId}`);
        }

        /**
         * Create update function for component type
         */
        createUpdateFunction(componentType) {
            return (element, newState, context) => {
                // Trigger a re-render event
                eventBus.emit('ui:component-needs-render', {
                    componentId: element.getAttribute('data-component-id'),
                    element,
                    state: newState
                });
            };
        }

        /**
         * Unregister component from UI registry
         */
        unregisterComponent(componentId) {
            if (this.registeredComponents.has(componentId)) {
                const unregister = this.updateHandlers.get(componentId);
                if (unregister) {
                    unregister();
                }
                this.updateHandlers.delete(componentId);
                this.registeredComponents.delete(componentId);
                uiRegistry.unregister(componentId);
                
                this.logger.debug('UI', `Unregistered component from UI registry: ${componentId}`);
                return true;
            }
            return false;
        }

        /**
         * Setup empty state listeners
         */
        setupEmptyStateListeners() {
            // Listen for component library button clicks in empty state
            const emptyStateButton = document.querySelector('#empty-state .btn-add-component');
            if (emptyStateButton) {
                emptyStateButton.addEventListener('click', () => {
                    this.logger.debug('UI', 'Empty state add component button clicked');
                    // Trigger component library modal
                    if (window.componentLibrary && window.componentLibrary.show) {
                        window.componentLibrary.show();
                    }
                });
            }
        }

        /**
         * Clean up UI integration
         */
        destroy() {
            // Clean up UI registry registrations
            this.registeredComponents.forEach(componentId => {
                this.unregisterComponent(componentId);
            });
            
            // Clean up keyboard listeners
            this.keyboardListeners.forEach((handler, key) => {
                document.removeEventListener('keydown', handler);
            });
            this.keyboardListeners.clear();
            
            // Clean up event listeners
            eventBus.off('ui:component-needs-render');
            eventBus.off('ui:batch-update-complete');
            
            this.initialized = false;
            this.logger.debug('UI', 'UI integration destroyed');
        }

        /**
         * Get UI integration statistics
         */
        getStats() {
            return {
                initialized: this.initialized,
                registeredComponents: this.registeredComponents.size,
                activeUpdateHandlers: this.updateHandlers.size,
                keyboardListeners: this.keyboardListeners.size
            };
        }
    }

    // Export to global scope for WordPress compatibility
    window.ComponentUIIntegration = ComponentUIIntegration;
    
    // Create singleton instance
    if (!window.componentUIIntegration) {
        window.componentUIIntegration = new ComponentUIIntegration();
    }

    // Emit ready event
    document.dispatchEvent(new CustomEvent('gmkb:component-ui-integration-ready', {
        detail: { 
            integration: window.componentUIIntegration,
            timestamp: Date.now()
        }
    }));

        structuredLogger.info('UI_INTEGRATION', 'ComponentUIIntegration ready and event emitted');
    };
    
    // ✅ EVENT-DRIVEN: Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWhenReady);
    } else {
        initWhenReady();
    }
    
})();