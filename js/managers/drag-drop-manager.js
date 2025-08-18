/**
 * @file drag-drop-manager.js - Drag and Drop System for Media Kit Builder
 * @description Implements drag and drop functionality for components
 * @version 1.0.0
 * 
 * ROOT FIX: Complete drag and drop implementation
 * - Drag from component library to preview
 * - Visual feedback during drag operations
 * - Drop zone management
 * - Integration with existing ComponentManager
 */

(function() {
    'use strict';

    console.log('🎯 DragDropManager: Initializing drag and drop system...');

    /**
     * Drag and Drop Manager
     * Handles all drag and drop functionality for the media kit builder
     */
    const DragDropManager = {
        draggedComponentType: null,
        draggedElement: null,
        draggedFromPreview: false,
        draggedPreviewComponent: null,
        dropZones: [],
        previewContainer: null,
        isInitialized: false,
        sortableEnabled: true,
        
        // Preview area sorting state
        sortingEnabled: true,
        draggedComponentId: null,
        dragPlaceholder: null,
        lastValidDropTarget: null,

        /**
         * Initialize the drag and drop system
         */
        init() {
            if (this.isInitialized) {
                console.log('🎯 DragDropManager: Already initialized');
                return;
            }

            console.log('🎯 DragDropManager: Starting initialization...');

            // Wait for core systems to be ready
            if (window.GMKB && window.GMKB.subscribe) {
                // Listen for components loaded event
                window.GMKB.subscribe('gmkb:components-loaded', (event) => {
                    console.log('🎯 DragDropManager: Components loaded, setting up drag handlers');
                    this.setupComponentLibraryDrag();
                });

                // Listen for initialization complete
                window.GMKB.subscribe('gmkb:initialization-complete', (event) => {
                console.log('🎯 DragDropManager: System initialized, setting up drop zones and preview sorting');
                this.setupDropZones();
                    // this.setupPreviewSorting();
            });
            } else {
                // ROOT FIX: Event-driven fallback (NO POLLING)
                console.log('⚡ DragDropManager: GMKB not ready, waiting for initialization event');
                const handleInitComplete = (event) => {
                    console.log('⚡ DragDropManager: Received initialization complete event');
                    document.removeEventListener('gmkb:initialization-complete', handleInitComplete);
                    
                    this.setupComponentLibraryDrag();
                    this.setupDropZones();
                };
                
                document.addEventListener('gmkb:initialization-complete', handleInitComplete);
                
                // Fallback timeout (single check, not polling)
                setTimeout(() => {
                    if (!this.isInitialized) {
                        console.log('⚡ DragDropManager: Fallback timeout, attempting initialization');
                        this.setupComponentLibraryDrag();
                        this.setupDropZones();
                    }
                }, 3000);
            }

            this.isInitialized = true;
            console.log('✅ DragDropManager: Initialization complete');
        },

        /**
         * Setup drag functionality for component library items
         */
        setupComponentLibraryDrag() {
            console.log('🎯 DragDropManager: Setting up component library drag handlers');

            // Find component library
            const componentLibrary = document.getElementById('component-grid');
            if (!componentLibrary) {
                console.warn('🎯 DragDropManager: Component library not found, retrying...');
                setTimeout(() => this.setupComponentLibraryDrag(), 1000);
                return;
            }

            // Add drag handlers to existing components
            this.updateComponentLibraryDragHandlers();

            // Watch for new components being added to library
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE && (node.classList.contains('component-card') || node.classList.contains('component-item'))) {
                this.makeComponentDraggable(node);
                }
                });
                }
                });
            });

            observer.observe(componentLibrary, { childList: true, subtree: true });
            console.log('✅ DragDropManager: Component library drag setup complete');
        },

        /**
         * Update drag handlers for all component library items
         */
        updateComponentLibraryDragHandlers() {
            const componentItems = document.querySelectorAll('.component-card, .component-item');
            console.log(`🎯 DragDropManager: Adding drag handlers to ${componentItems.length} components`);

            componentItems.forEach(item => {
                this.makeComponentDraggable(item);
            });
            
            console.log('✅ DragDropManager: Component library drag setup complete');
        },

        /**
         * Make a component item draggable
         */
        makeComponentDraggable(componentItem) {
            const componentType = componentItem.getAttribute('data-component-type') || 
                                 componentItem.getAttribute('data-component');
            if (!componentType) {
                console.warn('🎯 DragDropManager: Component item missing data-component-type or data-component');
                return;
            }

            // Make element draggable
            componentItem.draggable = true;
            componentItem.classList.add('draggable-component');

            // Add drag start handler
            componentItem.addEventListener('dragstart', (e) => {
                console.log(`🎯 DragDropManager: Drag started for ${componentType}`);
                
                this.draggedComponentType = componentType;
                this.draggedElement = componentItem;
                
                // Set drag data
                e.dataTransfer.setData('text/plain', componentType);
                e.dataTransfer.setData('application/x-component-type', componentType);
                e.dataTransfer.effectAllowed = 'copy';

                // Add visual feedback
                componentItem.classList.add('dragging');
                this.showDropZones();

                // Create drag image
                this.createDragImage(componentItem, e.dataTransfer);
            });

            // Add drag end handler
            componentItem.addEventListener('dragend', (e) => {
                console.log(`🎯 DragDropManager: Drag ended for ${componentType}`);
                
                // Clean up
                componentItem.classList.remove('dragging');
                this.hideDropZones();
                this.draggedComponentType = null;
                this.draggedElement = null;
            });

            console.log(`✅ DragDropManager: Made ${componentType} draggable`);
        },

        /**
         * Create custom drag image
         */
        createDragImage(componentItem, dataTransfer) {
            try {
                const dragImage = componentItem.cloneNode(true);
                dragImage.style.cssText = `
                    position: absolute;
                    top: -1000px;
                    left: -1000px;
                    width: ${componentItem.offsetWidth}px;
                    height: ${componentItem.offsetHeight}px;
                    opacity: 0.8;
                    transform: rotate(2deg);
                    pointer-events: none;
                    z-index: 10000;
                `;
                
                document.body.appendChild(dragImage);
                
                dataTransfer.setDragImage(dragImage, 
                    componentItem.offsetWidth / 2, 
                    componentItem.offsetHeight / 2
                );

                // Clean up drag image after drag starts
                setTimeout(() => {
                    if (dragImage.parentNode) {
                        dragImage.parentNode.removeChild(dragImage);
                    }
                }, 0);
            } catch (error) {
                console.warn('🎯 DragDropManager: Could not create custom drag image:', error);
            }
        },

        /**
         * Setup drag-to-reorder functionality within preview area
         */
        setupPreviewSorting() {
            console.log('🎯 DragDropManager: Setting up preview area sorting...');
            
            if (!this.previewContainer) {
                this.previewContainer = document.getElementById('media-kit-preview');
            }
            
            if (!this.previewContainer) {
                console.warn('🎯 DragDropManager: Preview container not found for sorting');
                return;
            }
            
            // Listen for component additions to make them sortable
            if (window.GMKB && window.GMKB.subscribe) {
                window.GMKB.subscribe('gmkb:component-added', (event) => {
                    setTimeout(() => {
                        this.makePreviewComponentsSortable();
                    }, 100);
                });
                
                window.GMKB.subscribe('gmkb:saved-state-loaded', (event) => {
                    setTimeout(() => {
                        this.makePreviewComponentsSortable();
                    }, 500);
                });
            }
            
            console.log('✅ DragDropManager: Preview sorting setup complete');
        },

        /**
         * Make components in preview area sortable
         */
        makePreviewComponentsSortable() {
            const components = this.previewContainer.querySelectorAll('.media-kit-component');
            console.log(`🎯 DragDropManager: Making ${components.length} components sortable`);
            
            components.forEach(component => {
                this.makeComponentSortable(component);
            });
        },

        /**
         * Make a single component sortable within preview
         */
        makeComponentSortable(componentElement) {
            const componentId = componentElement.id;
            if (!componentId) {
                console.warn('🎯 DragDropManager: Component missing ID for sorting');
                return;
            }
            
            // Skip if already sortable
            if (componentElement.hasAttribute('data-sortable-enabled')) {
                return;
            }
            
            // Make element draggable for sorting
            componentElement.draggable = true;
            componentElement.setAttribute('data-sortable-enabled', 'true');
            componentElement.classList.add('sortable-component');
            
            // Add drag start handler for sorting
            componentElement.addEventListener('dragstart', (e) => {
                console.log(`🎯 DragDropManager: Started sorting component ${componentId}`);
                
                this.draggedComponentId = componentId;
                this.draggedElement = componentElement;
                
                // Set drag data for sorting
                e.dataTransfer.setData('text/plain', 'sort-component');
                e.dataTransfer.setData('application/x-component-id', componentId);
                e.dataTransfer.effectAllowed = 'move';
                
                // Visual feedback for sorting
                componentElement.classList.add('dragging-for-sort');
                document.body.classList.add('sorting-components');
                
                // Create drag placeholder
                this.createSortingPlaceholder(componentElement);
                
                // Enable drop zones for sorting
                this.enableSortingDropZones();
            });
            
            // Add drag end handler for sorting
            componentElement.addEventListener('dragend', (e) => {
                console.log(`🎯 DragDropManager: Finished sorting component ${componentId}`);
                
                // Clean up sorting state
                componentElement.classList.remove('dragging-for-sort');
                document.body.classList.remove('sorting-components');
                
                this.removeSortingPlaceholder();
                this.disableSortingDropZones();
                
                this.draggedComponentId = null;
                this.draggedElement = null;
                this.lastValidDropTarget = null;
            });
            
            console.log(`✅ DragDropManager: Component ${componentId} is now sortable`);
        },

        /**
         * Create visual placeholder during sorting
         */
        createSortingPlaceholder(componentElement) {
            this.dragPlaceholder = document.createElement('div');
            this.dragPlaceholder.className = 'drag-sort-placeholder';
            this.dragPlaceholder.style.cssText = `
                height: ${componentElement.offsetHeight}px;
                margin: ${getComputedStyle(componentElement).margin};
                border: 2px dashed #3b82f6;
                border-radius: 6px;
                background: rgba(59, 130, 246, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #3b82f6;
                font-weight: 500;
                opacity: 0;
                transition: opacity 0.2s;
            `;
            this.dragPlaceholder.innerHTML = '↕️ Drop here to reorder';
            
            // Insert placeholder after the dragged element
            componentElement.parentNode.insertBefore(this.dragPlaceholder, componentElement.nextSibling);
            
            // Animate in
            setTimeout(() => {
                this.dragPlaceholder.style.opacity = '1';
            }, 10);
        },

        /**
         * Remove sorting placeholder
         */
        removeSortingPlaceholder() {
            if (this.dragPlaceholder) {
                this.dragPlaceholder.style.opacity = '0';
                setTimeout(() => {
                    if (this.dragPlaceholder && this.dragPlaceholder.parentNode) {
                        this.dragPlaceholder.parentNode.removeChild(this.dragPlaceholder);
                    }
                    this.dragPlaceholder = null;
                }, 200);
            }
        },

        /**
         * Enable drop zones for component sorting
         */
        enableSortingDropZones() {
            const components = this.previewContainer.querySelectorAll('.media-kit-component');
            
            components.forEach(component => {
                if (component.id === this.draggedComponentId) return;
                
                component.addEventListener('dragover', this.handleSortingDragOver.bind(this));
                component.addEventListener('drop', this.handleSortingDrop.bind(this));
                component.classList.add('sorting-drop-target');
            });
            
            // Also enable container as drop target
            this.previewContainer.addEventListener('dragover', this.handleContainerDragOver.bind(this));
            this.previewContainer.addEventListener('drop', this.handleContainerDrop.bind(this));
        },

        /**
         * Disable sorting drop zones
         */
        disableSortingDropZones() {
            const components = this.previewContainer.querySelectorAll('.media-kit-component');
            
            components.forEach(component => {
                component.removeEventListener('dragover', this.handleSortingDragOver.bind(this));
                component.removeEventListener('drop', this.handleSortingDrop.bind(this));
                component.classList.remove('sorting-drop-target', 'drop-above', 'drop-below');
            });
            
            this.previewContainer.removeEventListener('dragover', this.handleContainerDragOver.bind(this));
            this.previewContainer.removeEventListener('drop', this.handleContainerDrop.bind(this));
        },

        /**
         * Handle drag over for component sorting
         */
        handleSortingDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            const targetComponent = e.currentTarget;
            const rect = targetComponent.getBoundingClientRect();
            const midpoint = rect.top + (rect.height / 2);
            
            // Clear previous drop indicators
            document.querySelectorAll('.drop-above, .drop-below').forEach(el => {
                el.classList.remove('drop-above', 'drop-below');
            });
            
            // Determine if we should drop above or below
            if (e.clientY < midpoint) {
                targetComponent.classList.add('drop-above');
                this.lastValidDropTarget = { element: targetComponent, position: 'before' };
            } else {
                targetComponent.classList.add('drop-below');
                this.lastValidDropTarget = { element: targetComponent, position: 'after' };
            }
        },

        /**
         * Handle drop for component sorting
         */
        handleSortingDrop(e) {
            e.preventDefault();
            
            const componentId = e.dataTransfer.getData('application/x-component-id');
            if (!componentId || componentId !== this.draggedComponentId) {
                console.warn('🎯 DragDropManager: Invalid component drop for sorting');
                return;
            }
            
            const targetComponent = e.currentTarget;
            console.log(`🎯 DragDropManager: Dropping component ${componentId} near ${targetComponent.id}`);
            
            // Determine drop position
            const rect = targetComponent.getBoundingClientRect();
            const midpoint = rect.top + (rect.height / 2);
            const dropPosition = e.clientY < midpoint ? 'before' : 'after';
            
            this.reorderComponent(componentId, targetComponent.id, dropPosition);
        },

        /**
         * Handle drag over for empty container areas
         */
        handleContainerDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        },

        /**
         * Handle drop on empty container areas
         */
        handleContainerDrop(e) {
            e.preventDefault();
            
            const componentId = e.dataTransfer.getData('application/x-component-id');
            if (!componentId || componentId !== this.draggedComponentId) {
                return;
            }
            
            // If dropped on empty area, move to end
            const components = this.previewContainer.querySelectorAll('.media-kit-component');
            if (components.length > 1) {
                const lastComponent = components[components.length - 1];
                if (lastComponent.id !== componentId) {
                    this.reorderComponent(componentId, lastComponent.id, 'after');
                }
            }
        },

        /**
         * Reorder component in layout and DOM
         */
        async reorderComponent(draggedId, targetId, position) {
            console.log(`🎯 DragDropManager: Reordering ${draggedId} ${position} ${targetId}`);
            
            if (!window.GMKB?.systems?.StateManager) {
                console.error('🎯 DragDropManager: StateManager not available for reordering');
                return;
            }
            
            const stateManager = window.GMKB.systems.StateManager;
            const currentState = stateManager.getState();
            const currentLayout = [...currentState.layout];
            
            // Find current positions
            const draggedIndex = currentLayout.indexOf(draggedId);
            const targetIndex = currentLayout.indexOf(targetId);
            
            if (draggedIndex === -1 || targetIndex === -1) {
                console.error('🎯 DragDropManager: Component not found in layout');
                return;
            }
            
            // Remove dragged item from current position
            currentLayout.splice(draggedIndex, 1);
            
            // Calculate new position
            let newIndex;
            if (position === 'before') {
                newIndex = targetIndex <= draggedIndex ? targetIndex : targetIndex - 1;
            } else {
                newIndex = targetIndex < draggedIndex ? targetIndex + 1 : targetIndex;
            }
            
            // Insert at new position
            currentLayout.splice(newIndex, 0, draggedId);
            
            // Update state
            stateManager.setState({ layout: currentLayout });
            
            // Update DOM order
            this.updateDOMOrder(currentLayout);
            
            // Visual feedback
            this.showReorderSuccess(draggedId);
            
            console.log('✅ DragDropManager: Component reordering complete');
        },

        /**
         * Update DOM to match layout order
         */
        updateDOMOrder(layout) {
            const fragment = document.createDocumentFragment();
            
            layout.forEach(componentId => {
                const element = document.getElementById(componentId);
                if (element) {
                    fragment.appendChild(element);
                }
            });
            
            // Append all components in new order
            const emptyState = this.previewContainer.querySelector('#empty-state');
            const dropZones = this.previewContainer.querySelectorAll('.drop-zone');
            
            // Add components after empty state and drop zones
            this.previewContainer.appendChild(fragment);
            
            console.log('✅ DragDropManager: DOM order updated to match layout');
        },

        /**
         * Show visual feedback for successful reorder
         */
        showReorderSuccess(componentId) {
            const element = document.getElementById(componentId);
            if (element) {
                element.classList.add('reorder-success');
                setTimeout(() => {
                    element.classList.remove('reorder-success');
                }, 1000);
            }
        },
        setupDropZones() {
            console.log('🎯 DragDropManager: Setting up drop zones');

            // Get preview container
            this.previewContainer = document.getElementById('media-kit-preview');
            if (!this.previewContainer) {
                console.warn('🎯 DragDropManager: Preview container not found, retrying...');
                setTimeout(() => this.setupDropZones(), 1000);
                return;
            }

            // Make preview container a drop zone
            this.makeDropZone(this.previewContainer);

            // Find existing drop zones
            const existingDropZones = document.querySelectorAll('.drop-zone');
            existingDropZones.forEach(zone => {
                this.makeDropZone(zone);
            });

            console.log('✅ DragDropManager: Drop zones setup complete');
        },

        /**
         * Make an element a drop zone
         */
        makeDropZone(element) {
            // Add drop event handlers
            element.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                
                // Add hover effect
                if (element.classList.contains('drop-zone') || element.id === 'media-kit-preview') {
                    element.classList.add('drag-over');
                }
            });

            element.addEventListener('dragleave', (e) => {
                // Remove hover effect (with some tolerance for child elements)
                if (!element.contains(e.relatedTarget)) {
                    element.classList.remove('drag-over');
                }
            });

            element.addEventListener('drop', (e) => {
                e.preventDefault();
                console.log('🎯 DragDropManager: Drop event triggered');

                // Remove hover effects
                element.classList.remove('drag-over');
                
                // Get component type from drag data
                const componentType = e.dataTransfer.getData('application/x-component-type') || 
                                    e.dataTransfer.getData('text/plain');

                if (componentType && this.draggedComponentType === componentType) {
                    console.log(`🎯 DragDropManager: Dropping ${componentType} component`);
                    this.handleComponentDrop(componentType, element, e);
                } else {
                    console.warn('🎯 DragDropManager: Invalid drop - component type mismatch');
                }
            });

            console.log(`✅ DragDropManager: Made element a drop zone:`, element.className || element.id);
        },

        /**
         * Handle component drop
         */
        async handleComponentDrop(componentType, dropZone, event) {
            console.log(`🎯 DragDropManager: Handling drop of ${componentType}`);

            try {
                // Check if ComponentManager is available
                if (!window.GMKB || !window.GMKB.systems || !window.GMKB.systems.ComponentManager) {
                    console.error('🎯 DragDropManager: ComponentManager not available');
                    this.showDropError('Component system not ready');
                    return;
                }

                // Show loading state
                this.showDropLoading(dropZone);

                // Add component using existing ComponentManager
                const componentId = await window.GMKB.systems.ComponentManager.addComponent(componentType, {
                    // Add any default data for the component
                    droppedAt: new Date().toISOString(),
                    dragDropCreated: true
                });

                if (componentId) {
                    console.log(`✅ DragDropManager: Successfully added ${componentType} with ID ${componentId}`);
                    this.showDropSuccess(dropZone);
                    
                    // Scroll to new component
                    setTimeout(() => {
                        const newComponent = document.getElementById(componentId);
                        if (newComponent) {
                            newComponent.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 500);
                } else {
                    throw new Error('Component creation failed');
                }

            } catch (error) {
                console.error(`❌ DragDropManager: Error dropping ${componentType}:`, error);
                this.showDropError(`Failed to add ${componentType} component`);
            } finally {
                // Clean up loading state
                setTimeout(() => {
                    this.hideDropLoading(dropZone);
                }, 1000);
            }
        },

        /**
         * Show drop zones during drag
         */
        showDropZones() {
            console.log('🎯 DragDropManager: Showing drop zones');
            
            // Show preview container as drop zone
            if (this.previewContainer) {
                this.previewContainer.classList.add('drag-active');
            }

            // Show any hidden drop zones
            const dropZones = document.querySelectorAll('.drop-zone');
            dropZones.forEach(zone => {
                zone.style.display = 'flex';
                zone.classList.add('drop-zone-visible');
            });

            // Add body class for global drag state
            document.body.classList.add('dragging-component');
        },

        /**
         * Hide drop zones after drag
         */
        hideDropZones() {
            console.log('🎯 DragDropManager: Hiding drop zones');
            
            // Remove drag state from preview container
            if (this.previewContainer) {
                this.previewContainer.classList.remove('drag-active', 'drag-over');
            }

            // Hide drop zones if empty
            const dropZones = document.querySelectorAll('.drop-zone');
            dropZones.forEach(zone => {
                zone.classList.remove('drop-zone-visible', 'drag-over');
                // Hide empty drop zones
                if (zone.classList.contains('drop-zone--empty')) {
                    zone.style.display = 'none';
                }
            });

            // Remove body class
            document.body.classList.remove('dragging-component');
        },

        /**
         * Show loading state during drop
         */
        showDropLoading(dropZone) {
            const loadingEl = document.createElement('div');
            loadingEl.className = 'drop-loading';
            loadingEl.innerHTML = `
                <div class="drop-loading-content">
                    <div class="drop-loading-spinner">⏳</div>
                    <div class="drop-loading-text">Adding component...</div>
                </div>
            `;
            
            loadingEl.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 255, 255, 0.95);
                border: 2px solid #3b82f6;
                border-radius: 8px;
                padding: 20px;
                z-index: 10000;
                text-align: center;
                min-width: 200px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            `;

            document.body.appendChild(loadingEl);
        },

        /**
         * Hide loading state
         */
        hideDropLoading(dropZone) {
            const loadingEl = document.querySelector('.drop-loading');
            if (loadingEl) {
                loadingEl.style.opacity = '0';
                setTimeout(() => {
                    if (loadingEl.parentNode) {
                        loadingEl.parentNode.removeChild(loadingEl);
                    }
                }, 300);
            }
        },

        /**
         * Show drop success feedback
         */
        showDropSuccess(dropZone) {
            this.showDropFeedback('✅ Component added successfully!', 'success');
        },

        /**
         * Show drop error feedback
         */
        showDropError(message) {
            this.showDropFeedback(`❌ ${message}`, 'error');
        },

        /**
         * Show drop feedback
         */
        showDropFeedback(message, type) {
            const feedbackEl = document.createElement('div');
            feedbackEl.className = `drop-feedback drop-feedback--${type}`;
            feedbackEl.textContent = message;
            
            feedbackEl.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#10b981' : '#ef4444'};
                color: white;
                padding: 12px 20px;
                border-radius: 6px;
                z-index: 10001;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                transform: translateX(400px);
                transition: transform 0.3s ease;
            `;

            document.body.appendChild(feedbackEl);

            // Animate in
            setTimeout(() => {
                feedbackEl.style.transform = 'translateX(0)';
            }, 10);

            // Auto remove
            setTimeout(() => {
                feedbackEl.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    if (feedbackEl.parentNode) {
                        feedbackEl.parentNode.removeChild(feedbackEl);
                    }
                }, 300);
            }, 3000);
        },

        /**
         * Get drag and drop status
         */
        getStatus() {
            return {
                isInitialized: this.isInitialized,
                draggedComponentType: this.draggedComponentType,
                hasPreviewContainer: !!this.previewContainer,
                dropZonesCount: this.dropZones.length,
                sortingEnabled: this.sortingEnabled,
                draggedComponentId: this.draggedComponentId,
                isCurrentlySorting: !!this.draggedComponentId
            };
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            DragDropManager.init();
        });
    } else {
        // DOM already ready
        DragDropManager.init();
    }

    // Expose to global scope for debugging
    window.DragDropManager = DragDropManager;
    
    console.log('✅ DragDropManager: Module loaded successfully');

})();
