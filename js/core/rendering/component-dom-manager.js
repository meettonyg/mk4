/**
 * @file component-dom-manager.js
 * @description Component DOM Management Service
 * Handles DOM manipulation, cleanup, reordering, and container management
 * 
 * ROOT FIX: Extracted from enhanced-component-renderer.js for better maintainability
 * Following checklist: Event-Driven, No Direct Manipulation, Graceful Failure
 */

(function() {
    'use strict';
    
    // Fallback utilities
    const structuredLogger = window.structuredLogger || {
        info: console.log,
        warn: console.warn,
        error: console.error,
        debug: console.debug
    };
    
    const eventBus = window.eventBus || {
        emit: () => {},
        on: () => {},
        off: () => {}
    };
    
    const performanceMonitor = window.performanceMonitor || {
        start: () => () => {}
    };

    class ComponentDOMManager {
        constructor() {
            this.logger = structuredLogger;
            this.componentCache = new Map();
            this.previewContainer = null;
            this.initialized = false;
            
            // Wait for DOM ready
            this.setupContainers();
        }

        /**
         * Initialize container references
         */
        setupContainers() {
            // Use event-driven approach for container setup
            document.addEventListener('DOMContentLoaded', () => {
                this.previewContainer = document.getElementById('media-kit-preview');
                this.initialized = true;
                this.logger.debug('DOM', 'Container references initialized');
                
                // Emit ready event
                document.dispatchEvent(new CustomEvent('gmkb:dom-manager-ready', {
                    detail: { manager: this }
                }));
            });
            
            // If DOM already loaded
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                this.previewContainer = document.getElementById('media-kit-preview');
                this.initialized = true;
            }
        }

        /**
         * Get the appropriate container for rendering
         */
        getTargetContainer(options = {}) {
            // Check if saved-components-container exists and should be used
            const savedContainer = document.getElementById('saved-components-container');
            if (savedContainer && savedContainer.style.display !== 'none') {
                this.logger.debug('DOM', 'Using saved-components-container');
                return {
                    container: savedContainer,
                    reason: 'saved_components_container'
                };
            }
            
            // Fall back to preview container
            if (this.previewContainer) {
                this.logger.debug('DOM', 'Using preview container');
                return {
                    container: this.previewContainer,
                    reason: 'preview_container'
                };
            }
            
            this.logger.error('DOM', 'No container available for rendering');
            return null;
        }

        /**
         * Insert component element into DOM
         */
        async insertComponent(componentId, element, options = {}) {
            try {
                const targetInfo = this.getTargetContainer(options);
                if (!targetInfo) {
                    throw new Error('No target container available');
                }
                
                const { container } = targetInfo;
                
                // Check for existing element
                const existing = document.getElementById(componentId);
                if (existing) {
                    this.logger.warn('DOM', `Component ${componentId} already exists, skipping insert`);
                    return false;
                }
                
                // Use DOM Render Coordinator if available
                if (window.domRenderCoordinator?.isInitialized) {
                    const success = await window.domRenderCoordinator.renderComponent(
                        componentId,
                        element,
                        container.id || 'media-kit-preview',
                        options
                    );
                    
                    if (success) {
                        this.componentCache.set(componentId, element);
                        this.logger.debug('DOM', `Component ${componentId} inserted via coordinator`);
                        return true;
                    }
                }
                
                // Fallback to direct insertion
                container.appendChild(element);
                this.componentCache.set(componentId, element);
                
                this.logger.debug('DOM', `Component ${componentId} inserted directly`);
                return true;
                
            } catch (error) {
                this.logger.error('DOM', `Failed to insert component ${componentId}:`, error);
                return false;
            }
        }

        /**
         * Remove component from DOM
         */
        removeComponent(componentId) {
            try {
                // Use DOM Render Coordinator if available
                if (window.domRenderCoordinator?.isInitialized) {
                    const success = window.domRenderCoordinator.removeComponent(componentId);
                    if (success) {
                        this.componentCache.delete(componentId);
                        this.logger.debug('DOM', `Component ${componentId} removed via coordinator`);
                        return true;
                    }
                }
                
                // Fallback to direct removal
                const element = this.componentCache.get(componentId) || document.getElementById(componentId);
                if (element) {
                    element.remove();
                    this.componentCache.delete(componentId);
                    this.logger.debug('DOM', `Component ${componentId} removed directly`);
                    return true;
                }
                
                return false;
                
            } catch (error) {
                this.logger.error('DOM', `Failed to remove component ${componentId}:`, error);
                return false;
            }
        }

        /**
         * Remove multiple components
         */
        removeComponents(componentIds) {
            const perfEnd = performanceMonitor.start('remove-components', {
                count: componentIds.size
            });
            
            let removedCount = 0;
            componentIds.forEach(id => {
                if (this.removeComponent(id)) {
                    removedCount++;
                }
            });
            
            perfEnd();
            this.logger.debug('DOM', `Removed ${removedCount} of ${componentIds.size} components`);
            
            return removedCount;
        }

        /**
         * Reorder components according to layout
         */
        reorderComponents(layout) {
            // Use DOM Render Coordinator for reordering if available
            if (window.domRenderCoordinator?.isInitialized) {
                this.logger.debug('DOM', 'Using DOM Render Coordinator for reordering');
                window.domRenderCoordinator.reorderComponents(layout);
                return;
            }
            
            // Enhanced layout validation
            const validatedLayout = this.validateLayout(layout);
            
            if (validatedLayout.length === 0) {
                this.logger.debug('DOM', 'reorderComponents: No layout to apply');
                return;
            }

            const perfEnd = performanceMonitor.start('reorder-components', {
                count: validatedLayout.length
            });

            // Find the correct container that has the components
            const activeContainer = this.findActiveContainer(validatedLayout);
            
            if (!activeContainer) {
                this.logger.error('DOM', 'No container with components found for reordering');
                perfEnd();
                return;
            }
            
            this.logger.info('DOM', `Reordering ${validatedLayout.length} components in ${activeContainer.id || 'container'}`);

            // Get current children from the active container
            const currentChildren = Array.from(activeContainer.children);
            const currentChildIds = this.extractComponentIds(currentChildren);
            
            // Check if reordering is needed
            if (this.layoutMatches(validatedLayout, currentChildIds)) {
                this.logger.debug('DOM', 'Layout already matches DOM order, skipping reorder');
                perfEnd();
                return;
            }
            
            // Remove components that shouldn't be there
            this.cleanupOrphanedComponents(activeContainer, validatedLayout);
            
            // Perform the actual reordering
            this.performReorder(activeContainer, validatedLayout);
            
            perfEnd();
            
            // Verify the reorder was successful
            this.verifyReorderSuccess(activeContainer, validatedLayout);
        }

        /**
         * Validate and normalize layout
         */
        validateLayout(layout) {
            if (!Array.isArray(layout)) {
                try {
                    const enhancedStateManager = window.enhancedStateManager;
                    const fallbackLayout = enhancedStateManager?.getLayout ? enhancedStateManager.getLayout() : [];
                    return Array.isArray(fallbackLayout) ? fallbackLayout : [];
                } catch (error) {
                    this.logger.warn('DOM', 'Failed to get fallback layout:', error);
                    return [];
                }
            }
            
            return layout.filter(item => typeof item === 'string' && item.length > 0);
        }

        /**
         * Find the container that currently has the components
         */
        findActiveContainer(layout) {
            const firstComponentId = layout[0];
            const firstComponent = document.getElementById(firstComponentId);
            
            if (firstComponent && firstComponent.parentElement) {
                const container = firstComponent.parentElement;
                this.logger.info('DOM', `Found components in container: ${container.id || container.className}`);
                
                // Check if components are in wrong container
                const savedContainer = document.getElementById('saved-components-container');
                if (savedContainer && savedContainer.style.display !== 'none' && container !== savedContainer) {
                    this.logger.warn('DOM', 'Components are in wrong container, moving to saved-components-container');
                    this.moveComponentsToContainer(layout, savedContainer);
                    return savedContainer;
                }
                
                return container;
            }
            
            // Fallback container selection
            const savedContainer = document.getElementById('saved-components-container');
            if (savedContainer && savedContainer.style.display !== 'none') {
                return savedContainer;
            }
            
            return this.previewContainer;
        }

        /**
         * Move components to specified container
         */
        moveComponentsToContainer(componentIds, targetContainer) {
            componentIds.forEach(componentId => {
                const component = document.getElementById(componentId);
                if (component && component.parentElement !== targetContainer) {
                    targetContainer.appendChild(component);
                }
            });
        }

        /**
         * Extract component IDs from DOM elements
         */
        extractComponentIds(elements) {
            return elements.map(child => {
                return child.id || child.getAttribute('data-component-id');
            }).filter(id => id);
        }

        /**
         * Check if layout matches current DOM order
         */
        layoutMatches(layout, currentIds) {
            return JSON.stringify(layout) === JSON.stringify(currentIds);
        }

        /**
         * Remove orphaned components from container
         */
        cleanupOrphanedComponents(container, validLayout) {
            const currentChildren = Array.from(container.children);
            const elementsToRemove = currentChildren.filter(child => {
                const childId = child.id || child.getAttribute('data-component-id');
                return childId && !validLayout.includes(childId);
            });
            
            if (elementsToRemove.length > 0) {
                this.logger.info('DOM', `Removing ${elementsToRemove.length} components no longer in layout`);
                elementsToRemove.forEach(element => {
                    element.remove();
                    const elementId = element.id || element.getAttribute('data-component-id');
                    if (elementId) {
                        this.componentCache.delete(elementId);
                        this.logger.debug('DOM', `Removed component from DOM: ${elementId}`);
                    }
                });
            }
        }

        /**
         * Perform the actual DOM reordering
         */
        performReorder(container, layout) {
            // Create a map of component elements
            const elementMap = new Map();
            Array.from(container.children).forEach(child => {
                const childId = child.id || child.getAttribute('data-component-id');
                if (childId) {
                    elementMap.set(childId, child);
                }
            });
            
            // Reorder components according to layout
            const fragment = document.createDocumentFragment();
            layout.forEach(componentId => {
                const element = elementMap.get(componentId);
                if (element) {
                    fragment.appendChild(element);
                    this.logger.debug('DOM', `Moving component ${componentId} to correct position`);
                } else {
                    this.logger.warn('DOM', `Component ${componentId} not found in DOM for reordering`);
                }
            });
            
            // Clear container and append reordered elements
            container.innerHTML = '';
            container.appendChild(fragment);
        }

        /**
         * Verify reorder operation was successful
         */
        verifyReorderSuccess(container, expectedLayout) {
            const finalChildIds = this.extractComponentIds(Array.from(container.children));
            const reorderSuccess = this.layoutMatches(expectedLayout, finalChildIds);
            
            this.logger.info('DOM', `Reorder ${reorderSuccess ? 'successful' : 'failed'}:`, {
                container: container.id || container.className,
                expectedOrder: expectedLayout,
                actualOrder: finalChildIds,
                success: reorderSuccess
            });
            
            return reorderSuccess;
        }

        /**
         * Conservative cleanup - only remove obvious orphans
         */
        conservativeCleanup(state) {
            if (!this.previewContainer) {
                this.logger.warn('DOM', 'No preview container for cleanup');
                return;
            }
            
            const currentStateComponentIds = new Set(Object.keys(state.components || {}));
            const elementsToRemove = [];
            
            // Check ALL containers, not just preview container
            const allContainers = ['saved-components-container', 'media-kit-preview']
                .map(id => document.getElementById(id))
                .filter(container => container !== null);
            
            allContainers.forEach(container => {
                for (const child of container.children) {
                    // Only remove elements that are definitely orphaned
                    if (!child.id || 
                        child.classList.contains('component-error') || 
                        child.classList.contains('component-placeholder') ||
                        child.textContent === 'Component loading...') {
                        elementsToRemove.push(child);
                    }
                    // Be more careful about removing components
                    else if (child.id && !currentStateComponentIds.has(child.id)) {
                        const renderTime = child.getAttribute('data-render-time');
                        const isRecentlyRendered = renderTime && (Date.now() - parseInt(renderTime)) < 2000;
                        
                        if (!isRecentlyRendered) {
                            elementsToRemove.push(child);
                            this.logger.debug('DOM', `Cleanup: Component ${child.id} no longer in state and not recent, removing`);
                        }
                    }
                }
            });
            
            // Remove orphaned elements
            elementsToRemove.forEach(element => {
                this.removeComponent(element.id || 'orphan');
            });
            
            if (elementsToRemove.length > 0) {
                this.logger.debug('DOM', `Cleanup: Removed ${elementsToRemove.length} orphaned elements`);
            }
        }

        /**
         * Update empty state display
         */
        updateEmptyState(state) {
            const emptyStateElement = document.getElementById('empty-state');
            if (!emptyStateElement) {
                return;
            }
            
            const hasComponents = state && state.components && Object.keys(state.components).length > 0;
            
            if (hasComponents) {
                emptyStateElement.style.display = 'none';
                this.logger.debug('DOM', 'Empty state hidden - components exist');
            } else {
                emptyStateElement.style.display = 'block';
                this.logger.debug('DOM', 'Empty state shown - no components');
            }
        }

        /**
         * Get cached component element
         */
        getCachedComponent(componentId) {
            return this.componentCache.get(componentId);
        }

        /**
         * Cache component element
         */
        cacheComponent(componentId, element) {
            this.componentCache.set(componentId, element);
        }

        /**
         * Clear component cache
         */
        clearCache() {
            this.componentCache.clear();
            this.logger.debug('DOM', 'Component cache cleared');
        }

        /**
         * Get DOM manager statistics
         */
        getStats() {
            return {
                initialized: this.initialized,
                cachedComponents: this.componentCache.size,
                hasPreviewContainer: !!this.previewContainer
            };
        }
    }

    // Export to global scope for WordPress compatibility
    window.ComponentDOMManager = ComponentDOMManager;
    
    // Create singleton instance
    if (!window.componentDOMManager) {
        window.componentDOMManager = new ComponentDOMManager();
    }

    // Emit ready event
    document.dispatchEvent(new CustomEvent('gmkb:component-dom-manager-ready', {
        detail: { 
            manager: window.componentDOMManager,
            timestamp: Date.now()
        }
    }));

})();