/**
 * @file component-container-manager.js
 * @description Component Container Management Service
 * Handles container logic, saved components rendering, and container switching
 * 
 * ROOT FIX: Extracted from enhanced-component-renderer.js for better maintainability
 * Following checklist: Event-Driven, Container Management Logic
 */

(function() {
    'use strict';
    
    // Wait for dependencies to be available
    const initWhenReady = () => {
        if (!window.structuredLogger) {
            setTimeout(initWhenReady, 100);
            return;
        }
        
        const structuredLogger = window.structuredLogger;
        const eventBus = window.eventBus || {
            emit: () => {},
            on: () => {},
            off: () => {}
        };
        
        structuredLogger.info('CONTAINER', 'ComponentContainerManager initializing...');

    class ComponentContainerManager {
        constructor() {
            this.logger = structuredLogger;
            this.containers = new Map();
            this.activeContainer = null;
            this.renderingSavedComponents = false;
            this.initialized = false;
            
            // Initialize containers when DOM is ready
            this.initializeContainers();
        }

        /**
         * Initialize container references
         */
        initializeContainers() {
            // Wait for DOM ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.setupContainers();
                });
            } else {
                this.setupContainers();
            }
        }

        /**
         * Setup container references and event listeners
         * ROOT FIX: Event-driven setup with periodic container detection
         */
        setupContainers() {
            // ROOT FIX: Always register core preview container first
            const previewRegistered = this.registerContainer('preview', document.getElementById('media-kit-preview'));
            
            // ROOT FIX: Register conditional containers - may not exist initially
            this.registerContainer('saved', document.getElementById('saved-components-container'));
            this.registerContainer('empty-state', document.getElementById('empty-state'));
            
            // ROOT FIX: Set up periodic container detection for conditional containers
            this.setupConditionalContainerDetection();
            
            // Setup empty state listeners
            this.setupEmptyStateListeners();
            
            this.initialized = true;
            this.logger.info('CONTAINER', `✅ Container manager initialized - ${this.containers.size} containers registered`);
            
            // Emit ready event
            document.dispatchEvent(new CustomEvent('gmkb:container-manager-ready', {
                detail: { 
                    manager: this,
                    registeredContainers: Array.from(this.containers.keys()),
                    timestamp: Date.now()
                }
            }));
        }

        /**
         * ROOT FIX: Set up detection for containers that may appear later
         * Event-driven approach - no polling, just mutation observation
         */
        setupConditionalContainerDetection() {
            // Use MutationObserver to detect when conditional containers are added
            if (typeof MutationObserver !== 'undefined') {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList') {
                            // Check for newly added containers
                            const savedContainer = document.getElementById('saved-components-container');
                            const emptyStateContainer = document.getElementById('empty-state');
                            
                            if (savedContainer && !this.containers.has('saved')) {
                                this.registerContainer('saved', savedContainer);
                                this.logger.info('CONTAINER', '🆕 Detected and registered saved-components-container');
                            }
                            
                            if (emptyStateContainer && !this.containers.has('empty-state')) {
                                this.registerContainer('empty-state', emptyStateContainer);
                                this.logger.info('CONTAINER', '🆕 Detected and registered empty-state');
                            }
                        }
                    });
                });
                
                // Observe the preview container for changes
                const previewContainer = document.getElementById('media-kit-preview');
                if (previewContainer) {
                    observer.observe(previewContainer, {
                        childList: true,
                        subtree: true
                    });
                }
                
                this.logger.debug('CONTAINER', '👁️ Set up container mutation observer');
            } else {
                // Fallback for older browsers - single retry after delay
                setTimeout(() => {
                    const savedContainer = document.getElementById('saved-components-container');
                    const emptyStateContainer = document.getElementById('empty-state');
                    
                    if (savedContainer && !this.containers.has('saved')) {
                        this.registerContainer('saved', savedContainer);
                    }
                    
                    if (emptyStateContainer && !this.containers.has('empty-state')) {
                        this.registerContainer('empty-state', emptyStateContainer);
                    }
                }, 1000);
            }
        }

        /**
         * Register a container
         * ROOT FIX: Fault-tolerant registration - containers may not exist initially
         */
        registerContainer(name, element) {
            if (element) {
                this.containers.set(name, {
                    element,
                    name,
                    isActive: false
                });
                this.logger.debug('CONTAINER', `✅ Registered container: ${name}`);
                return true;
            } else {
                // ROOT FIX: Don't warn for conditionally rendered containers
                if (this.isConditionalContainer(name)) {
                    this.logger.debug('CONTAINER', `📋 Conditional container not yet available: ${name}`);
                } else {
                    this.logger.warn('CONTAINER', `⚠️ Container not found: ${name}`);
                }
                return false;
            }
        }

        /**
         * ROOT FIX: Check if container is conditionally rendered
         */
        isConditionalContainer(name) {
            const conditionalContainers = ['saved', 'empty-state'];
            return conditionalContainers.includes(name);
        }

        /**
         * Get container by name
         */
        getContainer(name) {
            const container = this.containers.get(name);
            return container ? container.element : null;
        }

        /**
         * Get the appropriate target container for rendering
         */
        getTargetContainer(options = {}) {
                // ROOT FIX: Check which container should be used based on current state
            const emptyState = document.getElementById('empty-state');
            const savedContainer = document.getElementById('saved-components-container');
            const directContainer = document.getElementById('components-direct-container');
            
            // If empty state is showing, use preview container
            if (emptyState && emptyState.style.display !== 'none') {
                const previewContainer = this.getContainer('preview');
                if (previewContainer) {
                    this.logger.debug('CONTAINER', 'Using preview container (empty state active)');
                    return {
                        container: previewContainer,
                        reason: 'empty_state_active',
                        name: 'preview'
                    };
                }
            }
            
            // If saved components container exists and is visible, use direct container
            if (savedContainer && savedContainer.style.display !== 'none' && directContainer) {
                this.logger.debug('CONTAINER', 'Using components-direct-container for saved components');
                return {
                    container: directContainer,
                    reason: 'direct_components_container',
                    name: 'direct'
                };
            }
            
            // Check if saved-components-container should be used
            const savedContainer = this.getContainer('saved');
            if (savedContainer && savedContainer.style.display !== 'none') {
                this.logger.debug('CONTAINER', 'Using saved-components-container');
                return {
                    container: savedContainer,
                    reason: 'saved_components_container',
                    name: 'saved'
                };
            }
            
            // Fall back to preview container
            const previewContainer = this.getContainer('preview');
            if (previewContainer) {
                this.logger.debug('CONTAINER', 'Using preview container');
                return {
                    container: previewContainer,
                    reason: 'preview_container',
                    name: 'preview'
                };
            }
            
            this.logger.error('CONTAINER', 'No container available for rendering');
            return null;
        }

        /**
         * Switch to saved components view
         */
        showSavedComponentsContainer() {
            // ROOT FIX: Find containers by ID since they might not be registered
            const savedContainer = document.getElementById('saved-components-container');
            const emptyState = document.getElementById('empty-state');
            
            if (savedContainer) {
                savedContainer.style.display = 'block';
                this.setActiveContainer('saved');
                this.logger.info('CONTAINER', 'Switched to saved components container');
            } else {
                this.logger.warn('CONTAINER', 'Saved components container not found');
            }
            
            if (emptyState) {
                emptyState.style.display = 'none';
                this.logger.debug('CONTAINER', 'Hid empty-state element');
            }
            
            // Emit container switch event
            eventBus.emit('gmkb:container-switched', {
                from: this.activeContainer,
                to: 'saved',
                timestamp: Date.now()
            });
        }

        /**
         * Switch to preview container
         */
        showPreviewContainer() {
            const previewContainer = this.getContainer('preview');
            const savedContainer = this.getContainer('saved');
            
            if (savedContainer) {
                savedContainer.style.display = 'none';
            }
            
            if (previewContainer) {
                this.setActiveContainer('preview');
                this.logger.info('CONTAINER', 'Switched to preview container');
            }
            
            // Emit container switch event
            eventBus.emit('gmkb:container-switched', {
                from: this.activeContainer,
                to: 'preview',
                timestamp: Date.now()
            });
        }

        /**
         * Show empty state
         */
        showEmptyState() {
            // ROOT FIX: Find empty state by ID since it might not be registered
            const emptyState = document.getElementById('empty-state');
            const savedContainer = document.getElementById('saved-components-container');
            
            if (emptyState) {
                emptyState.style.display = 'block';
                this.logger.debug('CONTAINER', 'Showed empty-state element');
            } else {
                this.logger.warn('CONTAINER', 'Empty state element not found');
            }
            
            if (savedContainer) {
                savedContainer.style.display = 'none';
                this.logger.debug('CONTAINER', 'Hid saved-components-container');
            }
            
            this.setActiveContainer('empty-state');
            this.logger.info('CONTAINER', 'Showing empty state');
        }

        /**
         * Update container display based on state
         */
        updateContainerDisplay(state) {
            const hasComponents = state && state.components && Object.keys(state.components).length > 0;
            
            this.logger.info('CONTAINER', 'Updating container display', {
                hasComponents,
                componentCount: hasComponents ? Object.keys(state.components).length : 0
            });
            
            if (hasComponents) {
                this.showSavedComponentsContainer();
            } else {
                this.showEmptyState();
            }
        }

        /**
         * Set active container
         */
        setActiveContainer(name) {
            // Deactivate all containers
            this.containers.forEach(container => {
                container.isActive = false;
            });
            
            // Activate specified container
            const container = this.containers.get(name);
            if (container) {
                container.isActive = true;
                this.activeContainer = name;
            }
        }

        /**
         * Get active container
         */
        getActiveContainer() {
            return this.activeContainer;
        }

        /**
         * Find container that currently has components
         */
        findContainerWithComponents(componentIds) {
            if (!componentIds || componentIds.length === 0) {
                return null;
            }
            
            const firstComponentId = componentIds[0];
            const firstComponent = document.getElementById(firstComponentId);
            
            if (firstComponent && firstComponent.parentElement) {
                const parentContainer = firstComponent.parentElement;
                
                // Find which registered container this is
                for (const [name, containerInfo] of this.containers) {
                    if (containerInfo.element === parentContainer) {
                        this.logger.info('CONTAINER', `Components found in container: ${name}`);
                        return {
                            name,
                            element: parentContainer,
                            containerInfo
                        };
                    }
                }
                
                // Return the parent even if not registered
                return {
                    name: 'unknown',
                    element: parentContainer,
                    containerInfo: null
                };
            }
            
            return null;
        }

        /**
         * Move components between containers
         */
        moveComponentsToContainer(componentIds, targetContainerName) {
            const targetInfo = this.containers.get(targetContainerName);
            if (!targetInfo) {
                this.logger.error('CONTAINER', `Target container not found: ${targetContainerName}`);
                return false;
            }
            
            const targetContainer = targetInfo.element;
            let movedCount = 0;
            
            componentIds.forEach(componentId => {
                const component = document.getElementById(componentId);
                if (component && component.parentElement !== targetContainer) {
                    targetContainer.appendChild(component);
                    movedCount++;
                    this.logger.debug('CONTAINER', `Moved component ${componentId} to ${targetContainerName}`);
                }
            });
            
            this.logger.info('CONTAINER', `Moved ${movedCount} components to ${targetContainerName}`);
            return movedCount > 0;
        }

        /**
         * Render saved components into appropriate container
         */
        async renderSavedComponents(initialState) {
            if (!initialState || !initialState.components) {
                this.logger.warn('CONTAINER', 'renderSavedComponents: No initial state or components');
                return false;
            }
            
            // Prevent duplicate calls
            if (this.renderingSavedComponents) {
                this.logger.warn('CONTAINER', 'renderSavedComponents: Already rendering, skipping duplicate call');
                return false;
            }
            this.renderingSavedComponents = true;
            
            try {
                const componentCount = Object.keys(initialState.components).length;
                
                this.logger.info('CONTAINER', 'renderSavedComponents received initialState:', {
                    hasComponents: !!initialState.components,
                    componentCount: componentCount,
                    hasSavedComponents: !!initialState.saved_components,
                    savedComponentsCount: initialState.saved_components ? initialState.saved_components.length : 0,
                    hasLayout: !!initialState.layout,
                    layoutCount: initialState.layout ? initialState.layout.length : 0
                });
                
                // Get the correct container and ensure it's visible
                const targetInfo = this.getTargetContainer();
                if (!targetInfo) {
                    this.logger.error('CONTAINER', 'No target container available for saved components');
                    return false;
                }
                
                const { container: targetContainer, name: containerName } = targetInfo;
                
                // Make container visible if it's the saved container
                if (containerName === 'saved') {
                    this.showSavedComponentsContainer();
                }
                
                // Determine component rendering order
                let componentIdList = [];
                
                if (initialState.saved_components && Array.isArray(initialState.saved_components) && initialState.saved_components.length > 0) {
                    // Use saved_components array order
                    componentIdList = initialState.saved_components.map(comp => comp.id).filter(id => id);
                    this.logger.info('CONTAINER', `Using saved_components order (${componentIdList.length} components)`);
                } else if (initialState.layout && Array.isArray(initialState.layout) && initialState.layout.length > 0) {
                    // Use layout array order
                    componentIdList = initialState.layout.filter(id => initialState.components[id]);
                    this.logger.info('CONTAINER', `Using layout array order (${componentIdList.length} components)`);
                } else {
                    // Fall back to components object keys
                    componentIdList = Object.keys(initialState.components);
                    this.logger.warn('CONTAINER', `No order information found, using component keys (${componentIdList.length} components)`);
                }
                
                // Check if we're adding to existing components
                const existingComponentCount = targetContainer.querySelectorAll('[data-component-id]').length;
                const isAddingNew = existingComponentCount > 0;
                
                if (isAddingNew) {
                    this.logger.info('CONTAINER', 'Preserving existing components, will only add missing ones');
                } else {
                    // Clear container for fresh render
                    targetContainer.innerHTML = '';
                    this.logger.info('CONTAINER', 'Cleared target container for initial render');
                }
                
                // Delegate actual rendering to render engine
                if (window.componentRenderEngine) {
                    let successfulRenders = 0;
                    
                    for (const componentId of componentIdList) {
                        try {
                            // Skip if already exists (when adding new components)
                            if (isAddingNew && document.getElementById(componentId)) {
                                this.logger.debug('CONTAINER', `Component ${componentId} already exists, skipping`);
                                successfulRenders++;
                                continue;
                            }
                            
                            // Get component state
                            let componentState = null;
                            
                            if (initialState.saved_components && Array.isArray(initialState.saved_components)) {
                                const savedComponent = initialState.saved_components.find(comp => comp.id === componentId);
                                if (savedComponent) {
                                    componentState = {
                                        type: savedComponent.type,
                                        props: savedComponent.props || savedComponent.data || {}
                                    };
                                }
                            }
                            
                            // Fallback to components object
                            if (!componentState && initialState.components[componentId]) {
                                componentState = initialState.components[componentId];
                            }
                            
                            if (!componentState) {
                                this.logger.warn('CONTAINER', `No state found for saved component: ${componentId}`);
                                continue;
                            }
                            
                            // Render component
                            const result = await window.componentRenderEngine.renderComponent({
                                id: componentId,
                                type: componentState.type,
                                props: componentState.props || componentState.data || {}
                            });
                            
                            if (result.success && result.element) {
                                // Insert into container using DOM manager
                                if (window.componentDOMManager) {
                                    const inserted = await window.componentDOMManager.insertComponent(
                                        componentId,
                                        result.element,
                                        { targetContainer: containerName }
                                    );
                                    
                                    if (inserted) {
                                        successfulRenders++;
                                    }
                                } else {
                                    // Fallback direct insertion
                                    targetContainer.appendChild(result.element);
                                    successfulRenders++;
                                }
                                
                                this.logger.debug('CONTAINER', `Successfully rendered saved component: ${componentId}`);
                            }
                            
                        } catch (error) {
                            this.logger.error('CONTAINER', `Failed to render saved component ${componentId}:`, error);
                        }
                    }
                    
                    this.logger.info('CONTAINER', `Rendered ${successfulRenders} of ${componentIdList.length} saved components`);
                    
                    // Update container display
                    this.updateContainerDisplay(initialState);
                    
                    return successfulRenders > 0;
                }
                
                return false;
                
            } finally {
                this.renderingSavedComponents = false;
            }
        }

        /**
         * Setup empty state listeners
         */
        setupEmptyStateListeners() {
            const emptyStateButton = document.querySelector('#empty-state .btn-add-component');
            if (emptyStateButton) {
                emptyStateButton.addEventListener('click', () => {
                    this.logger.debug('CONTAINER', 'Empty state add component button clicked');
                    // Trigger component library modal
                    if (window.componentLibrary && window.componentLibrary.show) {
                        window.componentLibrary.show();
                    }
                });
            }
        }

        /**
         * Clear all containers
         */
        clearAllContainers() {
            this.containers.forEach((containerInfo, name) => {
                if (containerInfo.element && name !== 'empty-state') {
                    containerInfo.element.innerHTML = '';
                    this.logger.debug('CONTAINER', `Cleared container: ${name}`);
                }
            });
        }

        /**
         * Get container statistics
         */
        getStats() {
            const stats = {
                registered: this.containers.size,
                active: this.activeContainer,
                containers: {}
            };
            
            this.containers.forEach((containerInfo, name) => {
                stats.containers[name] = {
                    exists: !!containerInfo.element,
                    visible: containerInfo.element ? containerInfo.element.style.display !== 'none' : false,
                    childCount: containerInfo.element ? containerInfo.element.children.length : 0,
                    isActive: containerInfo.isActive
                };
            });
            
            return stats;
        }

        /**
         * Destroy container manager
         */
        destroy() {
            this.containers.clear();
            this.activeContainer = null;
            this.renderingSavedComponents = false;
            this.initialized = false;
            
            this.logger.debug('CONTAINER', 'Container manager destroyed');
        }
    }

    // Export to global scope for WordPress compatibility
    window.ComponentContainerManager = ComponentContainerManager;
    
    // Create singleton instance
    if (!window.componentContainerManager) {
        window.componentContainerManager = new ComponentContainerManager();
    }

    // Emit ready event
    document.dispatchEvent(new CustomEvent('gmkb:component-container-manager-ready', {
        detail: { 
            manager: window.componentContainerManager,
            timestamp: Date.now()
        }
    }));

        structuredLogger.info('CONTAINER', 'ComponentContainerManager ready and event emitted');
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWhenReady);
    } else {
        initWhenReady();
    }
    
})();