/**
 * Initial State Loader - ARCHITECTURE COMPLIANT
 * 
 * PRINCIPLES:
 * ✅ Event-driven, no polling
 * ✅ Loads saved state on initialization
 * ✅ Coordinates section and component rendering
 * ✅ Root cause fixes only
 */

class InitialStateLoader {
    constructor() {
        this.isLoaded = false;
        this.logger = window.structuredLogger || console;
        
        // Event-driven initialization
        this.setupEventListeners();
        
        this.logger.info('[STATE_LOADER] Initial State Loader created');
    }
    
    setupEventListeners() {
        // Wait for all required systems to be ready
        let systemsReady = {
            stateManager: false,
            sectionManager: false,
            componentManager: false,
            renderer: false
        };
        
        const checkAllSystemsReady = () => {
            const allReady = Object.values(systemsReady).every(ready => ready === true);
            if (allReady && !this.isLoaded) {
                this.logger.info('[STATE_LOADER] All systems ready, loading initial state');
                this.loadInitialState();
            }
        };
        
        // Listen for individual system ready events
        document.addEventListener('gmkb:core-systems-ready', () => {
            systemsReady.stateManager = true;
            systemsReady.renderer = true; // Core systems include renderer
            checkAllSystemsReady();
        });
        
        document.addEventListener('gmkb:section-manager-ready', () => {
            systemsReady.sectionManager = true;
            checkAllSystemsReady();
        });
        
        document.addEventListener('gmkb:component-manager-ready', () => {
            systemsReady.componentManager = true;
            checkAllSystemsReady();
        });
        
        // Fallback: Check after DOM ready
        if (document.readyState === 'complete') {
            this.checkSystemsAndLoad();
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                this.checkSystemsAndLoad();
            });
        }
    }
    
    checkSystemsAndLoad() {
        // Give systems time to initialize
        setTimeout(() => {
            if (!this.isLoaded && this.areSystemsAvailable()) {
                this.logger.info('[STATE_LOADER] Systems available, loading initial state (fallback)');
                this.loadInitialState();
            }
        }, 500);
    }
    
    areSystemsAvailable() {
        return !!(
            window.enhancedStateManager &&
            window.sectionLayoutManager &&
            window.enhancedComponentManager &&
            window.enhancedComponentRenderer
        );
    }
    
    async loadInitialState() {
        if (this.isLoaded) {
            this.logger.info('[STATE_LOADER] Initial state already loaded');
            return;
        }
        
        const stateManager = window.enhancedStateManager;
        const sectionManager = window.sectionLayoutManager;
        const componentManager = window.enhancedComponentManager;
        const renderer = window.enhancedComponentRenderer;
        
        if (!this.areSystemsAvailable()) {
            this.logger.error('[STATE_LOADER] Required systems not available:', {
                stateManager: !!stateManager,
                sectionManager: !!sectionManager,
                componentManager: !!componentManager,
                renderer: !!renderer
            });
            return;
        }
        
        this.isLoaded = true;
        
        try {
            const state = stateManager.getState();
            
            this.logger.info('[STATE_LOADER] Loading initial state:', {
                components: Object.keys(state.components || {}).length,
                sections: (state.sections || []).length
            });
            
            // Step 1: Ensure sections exist
            if (state.sections && state.sections.length > 0) {
                this.logger.info('[STATE_LOADER] Rendering sections from state');
                
                // Render all sections
                if (sectionManager.renderAllSections) {
                    sectionManager.renderAllSections();
                }
            } else if (state.components && Object.keys(state.components).length > 0) {
                // Have components but no sections - create default section
                this.logger.info('[STATE_LOADER] No sections found but have components, creating default section');
                
                const defaultSectionId = `section_${Date.now()}`;
                sectionManager.registerSection(defaultSectionId, 'full_width');
                
                // Assign all orphaned components to this section
                Object.values(state.components).forEach(component => {
                    if (!component.sectionId) {
                        component.sectionId = defaultSectionId;
                        stateManager.dispatch({
                            type: 'UPDATE_COMPONENT',
                            payload: {
                                id: component.id,
                                updates: { sectionId: defaultSectionId }
                            }
                        });
                    }
                });
            }
            
            // Step 2: Render all components
            if (state.components && Object.keys(state.components).length > 0) {
                this.logger.info('[STATE_LOADER] Rendering components from state');
                
                // Hide empty state
                const emptyState = document.getElementById('empty-state');
                if (emptyState) {
                    emptyState.style.display = 'none';
                }
                
                // Show saved components container
                const container = document.getElementById('saved-components-container');
                if (container) {
                    container.style.display = 'block';
                }
                
                // Render all components
                if (renderer.renderAllComponents) {
                    renderer.renderAllComponents();
                } else {
                    // Fallback: render each component
                    Object.values(state.components).forEach(component => {
                        if (renderer.renderComponent) {
                            renderer.renderComponent(component);
                        }
                    });
                }
            } else {
                this.logger.info('[STATE_LOADER] No components to load, showing empty state');
                
                // Show empty state
                const emptyState = document.getElementById('empty-state');
                if (emptyState) {
                    emptyState.style.display = 'block';
                }
                
                // Hide saved components container
                const container = document.getElementById('saved-components-container');
                if (container) {
                    container.style.display = 'none';
                }
            }
            
            this.logger.info('[STATE_LOADER] ✅ Initial state loaded successfully');
            
            // Dispatch loaded event
            document.dispatchEvent(new CustomEvent('gmkb:initial-state-loaded', {
                detail: {
                    componentsLoaded: Object.keys(state.components || {}).length,
                    sectionsLoaded: (state.sections || []).length
                }
            }));
            
        } catch (error) {
            this.logger.error('[STATE_LOADER] Error loading initial state:', error);
            this.isLoaded = false; // Allow retry
        }
    }
    
    // Public method to force reload
    reload() {
        this.isLoaded = false;
        this.loadInitialState();
    }
}

// Wait for all dependencies before creating the loader
// ARCHITECTURE COMPLIANT: Event-driven initialization
(function() {
    'use strict';
    
    let loaderCreated = false;
    
    const createLoader = () => {
        if (loaderCreated) return;
        
        // Check if all dependencies are available
        if (!window.structuredLogger || 
            !window.enhancedStateManager || 
            !window.sectionLayoutManager ||
            !window.sectionRenderer ||
            !window.enhancedComponentManager ||
            !window.enhancedComponentRenderer) {
            
            // Wait a bit more for all systems
            return;
        }
        
        loaderCreated = true;
        
        // Create and expose globally
        window.initialStateLoader = new InitialStateLoader();
        
        // Log availability
        if (window.structuredLogger) {
            window.structuredLogger.info('[STATE_LOADER] Initial State Loader available globally');
        } else {
            console.log('✅ Initial State Loader available globally');
        }
    };
    
    // Listen for all systems to be ready
    document.addEventListener('gmkb:core-systems-ready', () => {
        // Wait a moment for all managers to initialize
        setTimeout(createLoader, 100);
    });
    
    document.addEventListener('gmkb:section-manager-ready', () => {
        setTimeout(createLoader, 100);
    });
    
    document.addEventListener('gmkb:component-manager-ready', () => {
        setTimeout(createLoader, 100);
    });
    
    document.addEventListener('gmkb:section-renderer-ready', () => {
        setTimeout(createLoader, 100);
    });
})();
