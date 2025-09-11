/**
 * Media Kit Builder Diagnostic & Fix Tool
 * Run window.gmkbDiagnose() in console to check status
 * Run window.gmkbFix() to attempt automatic fixes
 */

(function() {
    'use strict';
    
    // Diagnostic function
    window.gmkbDiagnose = function() {
        console.group('🔍 GMKB System Diagnosis');
        
        // Check core systems
        console.log('=== Core Systems ===');
        console.log('State Manager:', {
            exists: !!window.enhancedStateManager,
            initialized: window.enhancedStateManager?.isInitialized || false,
            hasGetState: typeof window.enhancedStateManager?.getState === 'function'
        });
        
        console.log('Component Manager:', {
            exists: !!window.enhancedComponentManager,
            initialized: window.enhancedComponentManager?.isInitialized || false,
            hasInitialize: typeof window.enhancedComponentManager?.initialize === 'function'
        });
        
        console.log('Component Renderer:', {
            exists: !!window.enhancedComponentRenderer,
            initialized: window.enhancedComponentRenderer?.initialized || false,
            hasRenderComponent: typeof window.enhancedComponentRenderer?.renderComponent === 'function'
        });
        
        console.log('Section Layout Manager:', {
            exists: !!window.sectionLayoutManager,
            initialized: window.sectionLayoutManager?.initialized || false
        });
        
        console.log('Initial State Loader:', {
            exists: !!window.initialStateLoader,
            isLoaded: window.initialStateLoader?.isLoaded || false
        });
        
        // Check state contents
        console.log('\n=== State Contents ===');
        const state = window.enhancedStateManager?.getState?.();
        if (state) {
            console.log('Components:', Object.keys(state.components || {}).length);
            console.log('Sections:', (state.sections || []).length);
            console.log('Layout:', (state.layout || []).length);
            
            // List components
            if (state.components) {
                console.log('Component IDs:', Object.keys(state.components));
            }
            
            // List sections
            if (state.sections && state.sections.length > 0) {
                console.log('Section IDs:', state.sections.map(s => s.section_id));
            }
        } else {
            console.log('❌ No state available');
        }
        
        // Check DOM
        console.log('\n=== DOM Status ===');
        const components = document.querySelectorAll('[data-component-id]');
        const sections = document.querySelectorAll('[data-section-id]');
        console.log('Components in DOM:', components.length);
        console.log('Sections in DOM:', sections.length);
        
        // Check containers
        console.log('Saved Components Container:', {
            exists: !!document.getElementById('saved-components-container'),
            visible: document.getElementById('saved-components-container')?.style.display !== 'none'
        });
        
        console.log('Empty State:', {
            exists: !!document.getElementById('empty-state'),
            visible: document.getElementById('empty-state')?.style.display !== 'none'
        });
        
        console.groupEnd();
    };
    
    // Fix function
    window.gmkbFix = async function() {
        console.group('🔧 GMKB Automatic Fix');
        
        try {
            // Step 1: Initialize State Manager
            if (window.enhancedStateManager && !window.enhancedStateManager.isInitialized) {
                console.log('Initializing State Manager...');
                if (window.enhancedStateManager.initializeAfterSystems) {
                    await window.enhancedStateManager.initializeAfterSystems();
                }
            }
            
            // Step 2: Initialize Component Manager
            if (window.enhancedComponentManager && !window.enhancedComponentManager.isInitialized) {
                console.log('Initializing Component Manager...');
                window.enhancedComponentManager.initialize();
            }
            
            // Step 3: Initialize Section Layout Manager
            if (window.sectionLayoutManager && !window.sectionLayoutManager.initialized) {
                console.log('Initializing Section Layout Manager...');
                window.sectionLayoutManager.init();
            }
            
            // Step 4: Force Core Systems Ready
            if (window.coreSystemsCoordinator) {
                console.log('Forcing core systems ready...');
                window.coreSystemsCoordinator.forceCoreSystemsReady();
            }
            
            // Step 5: Load Initial State
            if (window.initialStateLoader && !window.initialStateLoader.isLoaded) {
                console.log('Loading initial state...');
                await window.initialStateLoader.loadInitialState();
            }
            
            // Step 6: Check for orphaned components and create sections
            const state = window.enhancedStateManager?.getState?.();
            if (state && state.components) {
                const componentsWithSections = [];
                Object.entries(state.components).forEach(([id, comp]) => {
                    if (comp.sectionId) {
                        componentsWithSections.push({
                            componentId: id,
                            sectionId: comp.sectionId,
                            type: comp.type
                        });
                    }
                });
                
                if (componentsWithSections.length > 0) {
                    console.log(`Found ${componentsWithSections.length} components with section assignments`);
                    
                    // Create missing sections
                    const existingSectionIds = (state.sections || []).map(s => s.section_id);
                    const neededSections = new Set(componentsWithSections.map(c => c.sectionId));
                    
                    for (const sectionId of neededSections) {
                        if (!existingSectionIds.includes(sectionId)) {
                            console.log(`Creating missing section: ${sectionId}`);
                            if (window.sectionLayoutManager) {
                                window.sectionLayoutManager.registerSection(sectionId, 'full_width', {
                                    auto_created: true,
                                    recovered: true
                                });
                            }
                        }
                    }
                    
                    // Re-render sections
                    if (window.sectionRenderer) {
                        console.log('Rendering all sections...');
                        window.sectionRenderer.renderAllSections();
                    }
                }
            }
            
            console.log('✅ Fix complete! Running diagnosis...\n');
            
            // Run diagnosis to show results
            setTimeout(() => {
                window.gmkbDiagnose();
            }, 1000);
            
        } catch (error) {
            console.error('❌ Fix failed:', error);
        }
        
        console.groupEnd();
    };
    
    // Auto-fix helper
    window.gmkbQuickFix = function() {
        console.log('🚀 Running quick fix sequence...');
        
        // Force all systems to initialize
        try {
            // 1. State manager
            if (window.enhancedStateManager && !window.enhancedStateManager.isInitialized) {
                window.enhancedStateManager.initializeAfterSystems();
            }
            
            // 2. Component manager
            if (window.enhancedComponentManager && !window.enhancedComponentManager.isInitialized) {
                window.enhancedComponentManager.initialize();
            }
            
            // 3. Section manager
            if (window.sectionLayoutManager && !window.sectionLayoutManager.initialized) {
                window.sectionLayoutManager.init();
            }
            
            // 4. Force core systems ready
            if (window.forceCoreSystemsReady) {
                window.forceCoreSystemsReady();
            }
            
            // 5. Load initial state after a delay
            setTimeout(() => {
                if (window.initialStateLoader) {
                    window.initialStateLoader.loadInitialState();
                }
                console.log('✅ Quick fix complete!');
            }, 500);
            
        } catch (error) {
            console.error('Quick fix error:', error);
        }
    };
    
    console.log('🔧 GMKB Diagnostic Tools Loaded');
    console.log('Commands:');
    console.log('- window.gmkbDiagnose() - Check system status');
    console.log('- window.gmkbFix() - Run automatic fixes');
    console.log('- window.gmkbQuickFix() - Quick initialization sequence');
    
})();