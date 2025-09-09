/**
 * Initial State Loader
 * ROOT FIX: Loads components and sections from saved state on page load
 * 
 * CHECKLIST COMPLIANT:
 * ✅ Phase 1: Event-driven, no polling
 * ✅ Phase 2: Uses state manager centrally
 * ✅ Phase 3: Graceful error handling
 * ✅ Phase 4: Proper WordPress integration
 * 
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    const logger = window.structuredLogger || console;
    
    class InitialStateLoader {
        constructor() {
            this.isLoaded = false;
            this.sectionsLoaded = false;
            this.componentsLoaded = false;
            
            logger.info('LOADER', '🔄 Initial State Loader created');
        }
        
        /**
         * Initialize the loader when systems are ready
         */
        initialize() {
            // Listen for core systems ready
            document.addEventListener('gmkb:core-systems-ready', () => {
                logger.info('LOADER', '🚀 Core systems ready - beginning initial load');
                this.loadInitialState();
            });
            
            // Also check if systems are already ready
            if (window.enhancedStateManager && window.sectionLayoutManager) {
                logger.info('LOADER', '🚀 Systems already ready - beginning initial load');
                this.loadInitialState();
            }
        }
        
        /**
         * Load the initial state from the state manager
         */
        async loadInitialState() {
            if (this.isLoaded) {
                logger.warn('LOADER', 'Initial state already loaded');
                return;
            }
            
            try {
                // Get the current state
                const state = window.enhancedStateManager?.getState();
                
                if (!state) {
                    logger.warn('LOADER', 'No state available from state manager');
                    return;
                }
                
                logger.info('LOADER', '📦 Loading initial state', {
                    sections: state.sections?.length || 0,
                    components: Object.keys(state.components || {}).length
                });
                
                // Step 1: Load sections first (they create containers for components)
                await this.loadSections(state.sections || []);
                
                // Step 2: Load orphaned components (components without sections)
                await this.loadOrphanedComponents(state.components || {});
                
                // Step 3: Update container display
                this.updateContainerDisplay(state);
                
                this.isLoaded = true;
                
                // Dispatch initial load complete event
                document.dispatchEvent(new CustomEvent('gmkb:initial-load-complete', {
                    detail: {
                        sectionsLoaded: this.sectionsLoaded,
                        componentsLoaded: this.componentsLoaded,
                        timestamp: Date.now()
                    }
                }));
                
                logger.info('LOADER', '✅ Initial state load complete');
                
            } catch (error) {
                logger.error('LOADER', 'Failed to load initial state:', error);
            }
        }
        
        /**
         * Load sections from state
         */
        async loadSections(sections) {
            if (!sections || sections.length === 0) {
                logger.info('LOADER', 'No sections to load');
                return;
            }
            
            if (!window.sectionLayoutManager) {
                logger.error('LOADER', 'Section layout manager not available');
                return;
            }
            
            logger.info('LOADER', `🏗️ Loading ${sections.length} sections`);
            
            // Sections should already be registered in state
            // Just ensure they're rendered
            for (const section of sections) {
                try {
                    // Check if section is already in DOM
                    const existingSection = document.querySelector(`[data-section-id="${section.section_id}"]`);
                    
                    if (!existingSection) {
                        // Section not in DOM, needs to be rendered
                        logger.info('LOADER', `Rendering section: ${section.section_id}`);
                        
                        // The section should already be in the layout manager
                        // Just trigger rendering via event
                        document.dispatchEvent(new CustomEvent('gmkb:section-registered', {
                            detail: {
                                sectionId: section.section_id,
                                sectionLayoutManager: window.sectionLayoutManager,
                                source: 'initial-load'
                            }
                        }));
                    } else {
                        logger.debug('LOADER', `Section already in DOM: ${section.section_id}`);
                    }
                } catch (error) {
                    logger.error('LOADER', `Failed to load section ${section.section_id}:`, error);
                }
            }
            
            this.sectionsLoaded = true;
            logger.info('LOADER', '✅ Sections loaded');
        }
        
        /**
         * Load orphaned components (components not assigned to sections)
         */
        async loadOrphanedComponents(components) {
            const componentIds = Object.keys(components);
            
            if (componentIds.length === 0) {
                logger.info('LOADER', 'No components to load');
                return;
            }
            
            // Filter out components that are in sections
            const orphanedComponents = componentIds.filter(id => {
                const component = components[id];
                return !component.sectionId; // No section assignment
            });
            
            if (orphanedComponents.length === 0) {
                logger.info('LOADER', 'No orphaned components to load (all components are in sections)');
                this.componentsLoaded = true;
                return;
            }
            
            logger.info('LOADER', `📦 Loading ${orphanedComponents.length} orphaned components`);
            
            // Check if component manager is available
            if (!window.enhancedComponentManager) {
                logger.error('LOADER', 'Component manager not available');
                return;
            }
            
            // Load each orphaned component
            for (const componentId of orphanedComponents) {
                try {
                    const componentData = components[componentId];
                    
                    // Check if component already exists in DOM
                    const existingElement = document.getElementById(componentId) || 
                                          document.querySelector(`[data-component-id="${componentId}"]`);
                    
                    if (!existingElement) {
                        // Component not in DOM, needs to be loaded
                        logger.info('LOADER', `Loading orphaned component: ${componentId} (${componentData.type})`);
                        
                        // Use the loadExistingComponent method if available
                        if (window.enhancedComponentManager.loadExistingComponent) {
                            await window.enhancedComponentManager.loadExistingComponent(
                                componentId,
                                componentData.type,
                                componentData.props || componentData.data || {},
                                null, // No section
                                null  // No column
                            );
                        } else {
                            // Fallback: trigger component add via renderer
                            logger.warn('LOADER', 'loadExistingComponent not available, using renderer');
                            
                            // The renderer's state change handler should pick this up
                            // but we can also trigger it directly
                            if (window.enhancedComponentRenderer) {
                                const element = await window.enhancedComponentRenderer.renderComponent(
                                    componentId,
                                    componentData
                                );
                                
                                if (element) {
                                    const container = document.getElementById('saved-components-container') ||
                                                    document.getElementById('media-kit-preview');
                                    if (container) {
                                        container.appendChild(element);
                                        logger.info('LOADER', `✅ Rendered orphaned component: ${componentId}`);
                                    }
                                }
                            }
                        }
                    } else {
                        logger.debug('LOADER', `Component already in DOM: ${componentId}`);
                    }
                } catch (error) {
                    logger.error('LOADER', `Failed to load component ${componentId}:`, error);
                }
            }
            
            this.componentsLoaded = true;
            logger.info('LOADER', '✅ Orphaned components loaded');
        }
        
        /**
         * Update container display based on state
         */
        updateContainerDisplay(state) {
            const hasComponents = state.components && Object.keys(state.components).length > 0;
            const hasSections = state.sections && state.sections.length > 0;
            
            const savedContainer = document.getElementById('saved-components-container');
            const emptyState = document.getElementById('empty-state');
            
            if (hasComponents || hasSections) {
                if (savedContainer) savedContainer.style.display = 'block';
                if (emptyState) emptyState.style.display = 'none';
                logger.info('LOADER', '👁️ Showing content containers');
            } else {
                if (savedContainer) savedContainer.style.display = 'none';
                if (emptyState) emptyState.style.display = 'block';
                logger.info('LOADER', '👁️ Showing empty state');
            }
        }
    }
    
    // Create and initialize the loader
    window.initialStateLoader = new InitialStateLoader();
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.initialStateLoader.initialize();
        });
    } else {
        // DOM already loaded
        window.initialStateLoader.initialize();
    }
    
    logger.info('LOADER', '✅ Initial State Loader ready');
    
})();