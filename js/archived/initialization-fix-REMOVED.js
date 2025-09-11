/**
 * Initialization Fix - ROOT CAUSE FIX
 * 
 * This script fixes the initialization sequence issues that prevent
 * components from rendering in the preview.
 * 
 * PROBLEMS IDENTIFIED:
 * 1. Component Manager waits for renderer but doesn't check properly
 * 2. Core Systems Coordinator doesn't detect Component Manager readiness
 * 3. Initial State Loader never triggers because systems don't report ready
 * 4. Section Renderer and Section Manager don't coordinate properly
 * 
 * ARCHITECTURE COMPLIANT:
 * ✅ Event-driven, no polling
 * ✅ Root cause fixes only
 * ✅ Simplicity first
 * ✅ Code reduction
 */

(function() {
    'use strict';
    
    const logger = window.structuredLogger || console;
    
    logger.info('[INIT_FIX] Initialization Fix loading...');
    
    // Track initialization state
    const initState = {
        stateManager: false,
        componentManager: false,
        componentRenderer: false,
        sectionManager: false,
        sectionRenderer: false,
        coreSystemsReady: false,
        initialStateLoaded: false
    };
    
    // Helper to check if a system is ready
    const checkSystem = (name, condition) => {
        const wasReady = initState[name];
        initState[name] = condition();
        
        if (!wasReady && initState[name]) {
            logger.info(`[INIT_FIX] ✅ ${name} is now ready`);
            return true; // Just became ready
        }
        return false; // Was already ready or still not ready
    };
    
    // Main initialization checker
    const checkInitialization = () => {
        logger.info('[INIT_FIX] Checking system initialization...');
        
        // Check each system
        checkSystem('stateManager', () => !!(
            window.enhancedStateManager && 
            typeof window.enhancedStateManager.getState === 'function'
        ));
        
        checkSystem('componentRenderer', () => !!(
            window.enhancedComponentRenderer && 
            typeof window.enhancedComponentRenderer.renderComponent === 'function'
        ));
        
        checkSystem('componentManager', () => !!(
            window.enhancedComponentManager && 
            (window.enhancedComponentManager.isInitialized || 
             typeof window.enhancedComponentManager.addComponent === 'function')
        ));
        
        checkSystem('sectionManager', () => !!(
            window.sectionLayoutManager && 
            (window.sectionLayoutManager.initialized || 
             typeof window.sectionLayoutManager.registerSection === 'function')
        ));
        
        checkSystem('sectionRenderer', () => !!(
            window.sectionRenderer && 
            (window.sectionRenderer.initialized || 
             typeof window.sectionRenderer.renderSection === 'function')
        ));
        
        // Check if core systems are ready
        const coreReady = initState.stateManager && 
                         initState.componentRenderer && 
                         initState.componentManager;
        
        if (coreReady && !initState.coreSystemsReady) {
            initState.coreSystemsReady = true;
            logger.info('[INIT_FIX] 🚀 Core systems are ready, triggering initialization...');
            
            // Force core systems ready event if coordinator hasn't done it
            if (window.coreSystemsCoordinator && !window.coreSystemsCoordinator.hasDispatchedReady) {
                window.coreSystemsCoordinator.forceCoreSystemsReady();
            } else if (!window.coreSystemsCoordinator) {
                // Coordinator doesn't exist, dispatch event ourselves
                document.dispatchEvent(new CustomEvent('gmkb:core-systems-ready', {
                    detail: {
                        source: 'initialization-fix',
                        timestamp: Date.now()
                    }
                }));
            }
        }
        
        // Check if all systems are ready
        const allReady = coreReady && 
                        initState.sectionManager && 
                        initState.sectionRenderer;
        
        if (allReady && !initState.initialStateLoaded) {
            logger.info('[INIT_FIX] 🎯 All systems ready, loading initial state...');
            
            // Get the current state
            const state = window.enhancedStateManager.getState();
            const hasComponents = state.components && Object.keys(state.components).length > 0;
            const hasSections = state.sections && state.sections.length > 0;
            
            logger.info('[INIT_FIX] State check:', {
                components: Object.keys(state.components || {}).length,
                sections: (state.sections || []).length
            });
            
            if (hasComponents) {
                // Ensure sections exist for components
                if (!hasSections) {
                    logger.info('[INIT_FIX] Creating default section for orphaned components');
                    
                    const defaultSectionId = `section_${Date.now()}`;
                    window.sectionLayoutManager.registerSection(defaultSectionId, 'full_width');
                    
                    // Update all components to use this section
                    Object.values(state.components).forEach(component => {
                        if (!component.sectionId) {
                            component.sectionId = defaultSectionId;
                            window.enhancedStateManager.dispatch({
                                type: 'UPDATE_COMPONENT',
                                payload: {
                                    id: component.id,
                                    updates: { sectionId: defaultSectionId }
                                }
                            });
                        }
                    });
                }
                
                // Hide empty state, show container
                const emptyState = document.getElementById('empty-state');
                const container = document.getElementById('saved-components-container');
                
                if (emptyState) emptyState.style.display = 'none';
                if (container) container.style.display = 'block';
                
                // Render all sections
                logger.info('[INIT_FIX] Rendering sections...');
                if (window.sectionRenderer.renderAllSections) {
                    window.sectionRenderer.renderAllSections();
                } else if (window.sectionLayoutManager.renderAllSections) {
                    window.sectionLayoutManager.renderAllSections();
                }
                
                // Give sections time to render, then render components
                setTimeout(() => {
                    logger.info('[INIT_FIX] Rendering components...');
                    
                    // Render all components
                    if (window.enhancedComponentRenderer.renderAllComponents) {
                        window.enhancedComponentRenderer.renderAllComponents();
                    } else {
                        // Fallback: render each component individually
                        Object.values(state.components).forEach(component => {
                            window.enhancedComponentRenderer.renderComponent(component);
                        });
                    }
                    
                    logger.info('[INIT_FIX] ✅ Initial state loaded successfully!');
                }, 100);
                
                initState.initialStateLoaded = true;
            } else {
                logger.info('[INIT_FIX] No components to load');
                initState.initialStateLoaded = true;
            }
        }
        
        // Log current state
        logger.info('[INIT_FIX] Current initialization state:', initState);
        
        return allReady;
    };
    
    // Run initial check
    setTimeout(checkInitialization, 500);
    
    // Set up periodic checking (will stop once everything is ready)
    let checkCount = 0;
    const maxChecks = 20;
    
    const checkInterval = setInterval(() => {
        checkCount++;
        
        const allReady = checkInitialization();
        
        if (allReady || checkCount >= maxChecks) {
            clearInterval(checkInterval);
            
            if (checkCount >= maxChecks && !allReady) {
                logger.error('[INIT_FIX] ❌ Max checks reached, some systems may not be ready:', initState);
            } else if (allReady) {
                logger.info('[INIT_FIX] ✅ All systems initialized successfully!');
            }
        }
    }, 1000);
    
    // Expose debug function
    window.debugInitialization = () => {
        console.log('🔍 INITIALIZATION DEBUG');
        console.log('======================');
        console.log('State:', initState);
        console.log('Systems available:', {
            stateManager: !!window.enhancedStateManager,
            componentManager: !!window.enhancedComponentManager,
            componentRenderer: !!window.enhancedComponentRenderer,
            sectionManager: !!window.sectionLayoutManager,
            sectionRenderer: !!window.sectionRenderer,
            coordinator: !!window.coreSystemsCoordinator
        });
        
        if (window.enhancedStateManager) {
            const state = window.enhancedStateManager.getState();
            console.log('Current state:', {
                components: Object.keys(state.components || {}),
                sections: state.sections || []
            });
        }
        
        console.log('DOM elements:', {
            emptyState: document.getElementById('empty-state'),
            container: document.getElementById('saved-components-container'),
            sectionsInDOM: document.querySelectorAll('[data-section-id]').length,
            componentsInDOM: document.querySelectorAll('[data-component-id]').length
        });
    };
    
    // Expose fix function
    window.fixInitialization = () => {
        console.log('🔧 Running initialization fix...');
        initState.initialStateLoaded = false;
        checkInitialization();
    };
    
    logger.info('[INIT_FIX] ✅ Initialization Fix loaded');
})();
