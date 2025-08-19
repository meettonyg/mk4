/**
 * @file sortable-integration.js - SortableJS integration for component reordering
 * @description Complete drag-to-reorder functionality within the preview area  
 * @version 2.1.0 - GEMINI FIX IMPLEMENTED
 * 
 * ROOT FIX: Complete intra-preview drag-to-reorder functionality
 * - Integrates with existing drag-drop-manager.js
 * - Uses SortableJS for robust drag-to-reorder
 * - Preserves all existing move up/down functionality
 * - Integrates with existing StateManager for layout updates
 * - Follows developer checklist requirements
 * 
 * GEMINI FIX: Fixed critical logic error in onEnd handler
 * - Now uses evt.to.children directly from SortableJS event
 * - Eliminates incorrect DOM re-querying that ignored reorder
 * - Ensures component order changes are properly saved
 */

(function() {
    'use strict';

    if (window.gmkbData?.debugMode) {
        console.log('🔄 SortableManager: Loading enhanced sortable integration...');
    }

    /**
     * ROOT FIX: Enhanced Sortable Integration for Component Reordering
     * This extends the existing drag-drop-manager.js with intra-preview sorting
     * Fully integrated with existing GMKB architecture
     */
    const SortableManager = {
        sortableInstance: null,
        previewContainer: null,
        isEnabled: false,
        isInitialized: false,
        dragDropManager: null,

        /**
         * ROOT FIX: Enhanced initialization with coordination
         */
        init() {
            if (this.isInitialized) {
                if (window.gmkbData?.debugMode) {
                    console.log('🔄 SortableManager: Already initialized');
                }
                return;
            }
            
            if (window.gmkbData?.debugMode) {
                console.log('🔄 SortableManager: Initializing enhanced component reordering...');
            }
            
            // ROOT FIX: Event-driven initialization (NO POLLING)
            // Check if GMKB is already available
            if (window.GMKB && window.GMKB.subscribe) {
                if (window.gmkbData?.debugMode) {
                    console.log('✅ SortableManager: GMKB available immediately, setting up event listeners');
                }
                this.setupEventListeners();
                this.checkReadiness();
            } else {
                // ROOT FIX: Listen for GMKB to become available via event
                if (window.gmkbData?.debugMode) {
                    console.log('⚡ SortableManager: GMKB not ready, waiting for initialization event');
                }
                this.waitForDependencies();
            }
        },
        
        /**
         * ROOT FIX: Setup event listeners for coordination
         */
        setupEventListeners() {
            if (window.GMKB && window.GMKB.subscribe) {
                // Listen for components loaded
                window.GMKB.subscribe('gmkb:components-loaded', () => {
                    if (window.gmkbData?.debugMode) {
                        console.log('🔄 SortableManager: Components loaded');
                    }
                    this.refreshSortable();
                });
                
                // Listen for saved state loaded (components restored)
                window.GMKB.subscribe('gmkb:saved-state-loaded', () => {
                    if (window.gmkbData?.debugMode) {
                        console.log('🔄 SortableManager: Saved state loaded, setting up sortable');
                    }
                    setTimeout(() => this.setupSortable(), 500);
                });
                
                // Listen for component additions
                window.GMKB.subscribe('gmkb:component-added', () => {
                    if (window.gmkbData?.debugMode) {
                        console.log('🔄 SortableManager: Component added, refreshing sortable');
                    }
                    setTimeout(() => this.refreshSortable(), 100);
                });
                
                if (window.gmkbData?.debugMode) {
                    console.log('✅ SortableManager: Event listeners setup complete');
                }
            }
            
            this.isInitialized = true;
        },
        
        /**
         * ROOT FIX: Event-driven dependency check (NO POLLING)
         * Checklist compliance: Event-driven initialization, no polling
         */
        checkReadiness() {
            if (window.gmkbData?.debugMode) {
                console.log('🔍 SortableManager: Checking readiness...');
                console.log('  - SortableJS available:', typeof Sortable !== 'undefined');
                console.log('  - DragDropManager available:', !!window.DragDropManager);
                console.log('  - GMKB available:', !!window.GMKB);
            }
            
            if (typeof Sortable !== 'undefined' && window.DragDropManager && window.GMKB) {
                this.dragDropManager = window.DragDropManager;
                this.setupSortable();
            } else {
                // ROOT FIX: NO POLLING - use event listener instead
                if (window.gmkbData?.debugMode) {
                    console.log('⚡ SortableManager: Dependencies not ready, listening for initialization event...');
                }
                this.waitForDependencies();
            }
        },
        
        /**
         * ROOT FIX: Event-driven waiting (CHECKLIST COMPLIANT)
         * Instead of polling, listen for the initialization complete event
         */
        waitForDependencies() {
            // Listen for GMKB initialization complete
            const handleInitComplete = (event) => {
                if (window.gmkbData?.debugMode) {
                    console.log('⚡ SortableManager: Received initialization complete event');
                }
                document.removeEventListener('gmkb:initialization-complete', handleInitComplete);
                
                // Small delay to ensure all systems are fully ready
                setTimeout(() => {
                    this.checkReadiness();
                }, 100);
            };
            
            document.addEventListener('gmkb:initialization-complete', handleInitComplete);
            
            // Fallback: if event already fired, check again in 2 seconds
            setTimeout(() => {
                if (!this.isInitialized && window.gmkbData?.debugMode) {
                    console.log('⚡ SortableManager: Fallback check after initialization timeout');
                    this.checkReadiness();
                }
            }, 2000);
        },

        /**
         * ROOT FIX: Enhanced sortable setup with full integration
         */
        setupSortable() {
            if (window.gmkbData?.debugMode) {
                console.log('🔄 SortableManager: Setting up enhanced sortable functionality...');
            }
            
            this.previewContainer = document.getElementById('media-kit-preview');
            if (!this.previewContainer) {
                console.warn('🔄 SortableManager: Preview container not found, retrying...');
                setTimeout(() => this.setupSortable(), 1000);
                return;
            }

            if (typeof Sortable === 'undefined') {
                console.warn('🔄 SortableManager: SortableJS library not loaded, retrying...');
                setTimeout(() => this.setupSortable(), 1000);
                return;
            }
            
            // Clean up existing instance
            if (this.sortableInstance) {
                this.sortableInstance.destroy();
            }

            // ROOT FIX: Create enhanced sortable instance with full integration
            this.sortableInstance = Sortable.create(this.previewContainer, {
                // Only allow sorting of actual components, not empty state or drop zones
                draggable: '.media-kit-component',
                
                // Handle different types of drag sources
                group: {
                    name: 'media-kit-components',
                    pull: false, // Don't allow pulling components out of preview
                    put: false   // Don't allow external drops (handled by DragDropManager)
                },
                
                // Enhanced animation and visual feedback
                animation: 200,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                ghostClass: 'sortable-ghost',
                chosenClass: 'sortable-chosen', 
                dragClass: 'sortable-drag',
                fallbackClass: 'sortable-fallback',
                
                // ROOT FIX: Prevent conflicts with component controls and other interactions
                filter: '.component-controls, .drop-zone, #empty-state',
                preventOnFilter: true,
                
                // Delay to allow click events on component controls
                delay: 100,
                delayOnTouchOnly: true,
                
                // ROOT FIX: Enhanced event handlers with state management integration
                onStart: (evt) => {
                    if (window.gmkbData?.debugMode) {
                        console.log('🔄 SortableManager: Started sorting component:', evt.item.id);
                    }
                    
                    // Add global sorting state
                    document.body.classList.add('sorting-active', 'sorting-components');
                    
                    // Disable other interactions during sort
                    this.disableOtherInteractions();
                    
                    // Coordinate with DragDropManager
                    if (this.dragDropManager && this.dragDropManager.sortingEnabled) {
                        this.dragDropManager.sortingEnabled = false;
                    }
                    
                    // Dispatch sorting start event
                    if (window.GMKB && window.GMKB.dispatch) {
                        window.GMKB.dispatch('gmkb:component-sort-start', {
                            componentId: evt.item.id,
                            fromIndex: evt.oldIndex,
                            timestamp: Date.now()
                        });
                    }
                },
                
                onEnd: (evt) => {
                    if (window.gmkbData?.debugMode) {
                        console.log('🔄 SortableManager: Finished sorting component:', evt.item.id);
                        console.log('  From index:', evt.oldIndex, 'To index:', evt.newIndex);
                    }
                    
                    // Remove global sorting state
                    document.body.classList.remove('sorting-active', 'sorting-components');
                    
                    // Re-enable other interactions
                    this.enableOtherInteractions();
                    
                    // Restore DragDropManager sorting
                    if (this.dragDropManager) {
                        this.dragDropManager.sortingEnabled = true;
                    }
                    
                    // Only update if position actually changed
                    if (evt.oldIndex !== evt.newIndex) {
                        // ✅ GEMINI FIX: Get the new order directly from the event's "to" element
                        const newOrder = Array.from(evt.to.children)
                            .map(el => el.dataset.componentId || el.id)
                            .filter(id => id && id !== 'empty-state'); // Filter out empty state and invalid IDs
                        
                        if (window.gmkbData?.debugMode) {
                            console.log('🔄 SortableManager: New component order from SortableJS event:', newOrder);
                        }
                        
                        // Update state via StateManager
                        if (window.GMKB?.systems?.StateManager && newOrder.length > 0) {
                            const currentState = window.GMKB.systems.StateManager.getState();
                            const currentLayout = currentState.layout || [];
                            
                            // Only update if layout actually changed
                            if (JSON.stringify(newOrder) !== JSON.stringify(currentLayout)) {
                                window.GMKB.systems.StateManager.setState({ layout: newOrder });
                                if (window.gmkbData?.debugMode) {
                                    console.log('✅ SortableManager: Layout updated successfully via SortableJS event');
                                }
                            } else {
                                if (window.gmkbData?.debugMode) {
                                    console.log('🔄 SortableManager: Layout unchanged, skipping update');
                                }
                            }
                        } else {
                            console.error('🔄 SortableManager: StateManager not available or no valid components');
                        }
                        
                        // Show success feedback
                        this.showSortSuccess(evt.item.id);
                        
                        // Dispatch sorting complete event
                        if (window.GMKB && window.GMKB.dispatch) {
                            window.GMKB.dispatch('gmkb:component-sort-complete', {
                                componentId: evt.item.id,
                                fromIndex: evt.oldIndex,
                                toIndex: evt.newIndex,
                                newOrder: newOrder,
                                timestamp: Date.now()
                            });
                        }
                    } else {
                        if (window.gmkbData?.debugMode) {
                            console.log('🔄 SortableManager: No position change, skipping state update');
                        }
                    }
                },
                
                // ROOT FIX: Handle move events for better visual feedback
                onMove: (evt) => {
                    // Prevent dropping on certain elements
                    if (evt.related.classList.contains('component-controls') || 
                        evt.related.classList.contains('drop-zone') ||
                        evt.related.id === 'empty-state') {
                        return false;
                    }
                    return true;
                }
            });
            
            this.isEnabled = true;
            if (window.gmkbData?.debugMode) {
                console.log('✅ SortableManager: Enhanced sortable functionality enabled');
                console.log('🔗 SortableManager: Integrated with DragDropManager and StateManager');
            }
            
            // Add CSS classes for enhanced styling
            this.previewContainer.classList.add('sortable-enabled', 'drag-drop-complete');
        },
        
        /**
         * ROOT FIX: Disable other interactions during sorting
         */
        disableOtherInteractions() {
            // Disable component controls
            const controls = document.querySelectorAll('.component-controls');
            controls.forEach(control => {
                control.style.pointerEvents = 'none';
                control.style.opacity = '0.5';
            });
            
            // Disable sidebar
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.style.pointerEvents = 'none';
            }
            
            // Disable toolbar
            const toolbar = document.querySelector('.toolbar');
            if (toolbar) {
                toolbar.style.pointerEvents = 'none';
            }
        },
        
        /**
         * ROOT FIX: Re-enable other interactions after sorting
         */
        enableOtherInteractions() {
            // Re-enable component controls
            const controls = document.querySelectorAll('.component-controls');
            controls.forEach(control => {
                control.style.pointerEvents = '';
                control.style.opacity = '';
            });
            
            // Re-enable sidebar
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.style.pointerEvents = '';
            }
            
            // Re-enable toolbar
            const toolbar = document.querySelector('.toolbar');
            if (toolbar) {
                toolbar.style.pointerEvents = '';
            }
        },
        
        /**
         * ROOT FIX: Show visual feedback for successful sort
         */
        showSortSuccess(componentId) {
            const element = document.getElementById(componentId);
            if (element) {
                element.classList.add('reorder-success');
                setTimeout(() => {
                    element.classList.remove('reorder-success');
                }, 1000);
            }
        },
        
        /**
         * ROOT FIX: Refresh sortable when components are added/removed
         */
        refreshSortable() {
            if (this.sortableInstance && this.isEnabled) {
                if (window.gmkbData?.debugMode) {
                    console.log('🔄 SortableManager: Refreshing sortable instance');
                }
                // SortableJS automatically updates when DOM changes
                // But we can force a refresh if needed
                try {
                    // Check if there are sortable elements
                    const sortableElements = this.previewContainer.querySelectorAll('.media-kit-component');
                    if (window.gmkbData?.debugMode) {
                        console.log(`🔄 SortableManager: Found ${sortableElements.length} sortable components`);
                    }
                    
                    if (sortableElements.length === 0) {
                        if (window.gmkbData?.debugMode) {
                            console.log('🔄 SortableManager: No components to sort, disabling temporarily');
                        }
                        this.disable();
                    } else {
                        if (window.gmkbData?.debugMode) {
                            console.log('🔄 SortableManager: Components available, ensuring sortable is enabled');
                        }
                        this.enable();
                    }
                } catch (error) {
                    console.warn('🔄 SortableManager: Error refreshing sortable:', error);
                }
            }
        },

        /**
         * ROOT FIX: Enhanced layout update with validation and coordination
         * NOTE: This method is now primarily a fallback. The main reordering
         * logic uses SortableJS event data directly (Gemini fix in onEnd handler)
         */
        updateLayoutFromDOM() {
            if (!this.previewContainer) {
                console.error('🔄 SortableManager: Preview container not available for layout update');
                return;
            }
            
            if (!window.GMKB?.systems?.StateManager) {
                console.error('🔄 SortableManager: StateManager not available for layout update');
                return;
            }

            try {
                const componentElements = this.previewContainer.querySelectorAll('.media-kit-component');
                const newLayout = Array.from(componentElements)
                    .map(el => el.id)
                    .filter(id => id && id !== 'empty-state'); // Filter out empty state and invalid IDs
            
                if (newLayout.length > 0) {
                    console.log('🔄 SortableManager: Updating layout order to:', newLayout);
                    
                    // Get current state to validate
                    const currentState = window.GMKB.systems.StateManager.getState();
                    const currentLayout = currentState.layout || [];
                    
                    // Only update if layout actually changed
                    if (JSON.stringify(newLayout) !== JSON.stringify(currentLayout)) {
                        // Update state via StateManager
                        window.GMKB.systems.StateManager.setState({ layout: newLayout });
                        console.log('✅ SortableManager: Layout updated successfully');
                    } else {
                        console.log('🔄 SortableManager: Layout unchanged, skipping update');
                    }
                } else {
                    console.log('🔄 SortableManager: No components found for layout update');
                }
            } catch (error) {
                console.error('❌ SortableManager: Error updating layout from DOM:', error);
            }
        },

        /**
         * ROOT FIX: Enhanced disable with coordination
         */
        disable() {
            if (this.sortableInstance) {
                this.sortableInstance.option('disabled', true);
                if (window.gmkbData?.debugMode) {
                    console.log('🔄 SortableManager: Disabled sortable functionality');
                }
            }
        },

        /**
         * ROOT FIX: Enhanced enable with coordination
         */
        enable() {
            if (this.sortableInstance) {
                this.sortableInstance.option('disabled', false);
                if (window.gmkbData?.debugMode) {
                    console.log('🔄 SortableManager: Enabled sortable functionality');
                }
            }
        },
        
        /**
         * ROOT FIX: Destroy sortable instance
         */
        destroy() {
            if (this.sortableInstance) {
                this.sortableInstance.destroy();
                this.sortableInstance = null;
                this.isEnabled = false;
                if (window.gmkbData?.debugMode) {
                    console.log('🔄 SortableManager: Destroyed sortable instance');
                }
            }
        },

        /**
         * ROOT FIX: Enhanced status for debugging and monitoring
         */
        getStatus() {
            const componentElements = this.previewContainer ? 
                this.previewContainer.querySelectorAll('.media-kit-component') : [];
                
            return {
                isInitialized: this.isInitialized,
                isEnabled: this.isEnabled,
                hasInstance: !!this.sortableInstance,
                hasContainer: !!this.previewContainer,
                sortableAvailable: typeof Sortable !== 'undefined',
                dragDropManagerAvailable: !!this.dragDropManager,
                gmkbAvailable: !!window.GMKB,
                stateManagerAvailable: !!window.GMKB?.systems?.StateManager,
                componentCount: componentElements.length,
                sortableComponents: Array.from(componentElements).map(el => ({
                    id: el.id,
                    type: el.dataset.componentType
                })),
                architecture: 'enhanced-sortable-integration',
                version: '2.0.0'
            };
        }
    };

    // ROOT FIX: Event-driven auto-initialization (NO POLLING)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (window.gmkbData?.debugMode) {
                console.log('🔄 SortableManager: DOM ready, initializing...');
            }
            SortableManager.init();
        });
    } else {
        // DOM already ready
        if (window.gmkbData?.debugMode) {
            console.log('🔄 SortableManager: DOM already ready, initializing...');
        }
        SortableManager.init();
    }

    // Expose globally for debugging and coordination
    window.SortableManager = SortableManager;

    // ROOT FIX: Coordinate with DragDropManager
    if (window.DragDropManager) {
        if (window.gmkbData?.debugMode) {
            console.log('🔗 SortableManager: Coordinating with existing DragDropManager');
        }
    } else {
        if (window.gmkbData?.debugMode) {
            console.log('🔄 SortableManager: DragDropManager not yet available, will coordinate when ready');
        }
    }

    if (window.gmkbData?.debugMode) {
        console.log('✅ SortableManager: Enhanced module loaded with SortableJS integration');
        console.log('🎯 SortableManager: Root-level drag-to-reorder implementation complete');
    }

})();
