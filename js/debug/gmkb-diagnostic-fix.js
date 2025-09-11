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
            hasAddComponent: typeof window.enhancedComponentManager?.addComponent === 'function'
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
        
        console.log('Section Renderer:', {
            exists: !!window.sectionRenderer,
            initialized: window.sectionRenderer?.initialized || false
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
            // Step 1: Check if managers exist, if not create them
            if (!window.enhancedComponentManager) {
                console.log('Creating Enhanced Component Manager...');
                // Load the script dynamically
                const script = document.createElement('script');
                script.src = window.gmkbData?.pluginUrl + 'js/core/enhanced-component-manager.js';
                document.head.appendChild(script);
                await new Promise(resolve => script.onload = resolve);
            }
            
            if (!window.sectionLayoutManager) {
                console.log('Creating Section Layout Manager...');
                const script = document.createElement('script');
                script.src = window.gmkbData?.pluginUrl + 'system/SectionLayoutManager.js';
                document.head.appendChild(script);
                await new Promise(resolve => script.onload = resolve);
            }
            
            if (!window.sectionRenderer) {
                console.log('Creating Section Renderer...');
                const script = document.createElement('script');
                script.src = window.gmkbData?.pluginUrl + 'system/SectionRenderer.js';
                document.head.appendChild(script);
                await new Promise(resolve => script.onload = resolve);
            }
            
            if (!window.initialStateLoader) {
                console.log('Creating Initial State Loader...');
                const script = document.createElement('script');
                script.src = window.gmkbData?.pluginUrl + 'js/loaders/initial-state-loader.js';
                document.head.appendChild(script);
                await new Promise(resolve => script.onload = resolve);
            }
            
            // Wait a moment for scripts to initialize
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Step 2: Initialize managers if not initialized
            if (window.enhancedComponentManager && !window.enhancedComponentManager.isInitialized) {
                console.log('Initializing Component Manager...');
                window.enhancedComponentManager.initialize();
            }
            
            if (window.sectionLayoutManager && !window.sectionLayoutManager.initialized) {
                console.log('Initializing Section Layout Manager...');
                window.sectionLayoutManager.init();
            }
            
            if (window.sectionRenderer && !window.sectionRenderer.initialized) {
                console.log('Initializing Section Renderer...');
                window.sectionRenderer.init();
            }
            
            // Step 3: Force core systems ready if needed
            if (window.coreSystemsCoordinator) {
                console.log('Forcing core systems ready...');
                window.coreSystemsCoordinator.forceCoreSystemsReady();
            }
            
            // Wait for systems to respond to events
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Step 4: Load initial state
            if (window.initialStateLoader && !window.initialStateLoader.isLoaded) {
                console.log('Loading initial state...');
                window.initialStateLoader.loadInitialState();
            } else if (window.initialStateLoader) {
                console.log('Reloading initial state...');
                window.initialStateLoader.reload();
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
    
    // Quick fix helper
    window.gmkbQuickFix = async function() {
        console.log('🚀 Running quick fix sequence...');
        
        try {
            // Load missing scripts
            const scripts = [
                'js/core/enhanced-component-manager.js',
                'system/SectionLayoutManager.js', 
                'system/SectionRenderer.js',
                'js/loaders/initial-state-loader.js'
            ];
            
            for (const scriptPath of scripts) {
                if (!document.querySelector(`script[src*="${scriptPath}"]`)) {
                    console.log(`Loading ${scriptPath}...`);
                    const script = document.createElement('script');
                    script.src = window.gmkbData?.pluginUrl + scriptPath;
                    document.head.appendChild(script);
                    await new Promise(resolve => {
                        script.onload = resolve;
                        script.onerror = () => {
                            console.error(`Failed to load ${scriptPath}`);
                            resolve();
                        };
                    });
                }
            }
            
            // Wait for scripts to initialize
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Force initialization
            if (window.coreSystemsCoordinator) {
                window.coreSystemsCoordinator.forceCoreSystemsReady();
            }
            
            // Wait for events
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Trigger initial state load
            if (window.initialStateLoader) {
                window.initialStateLoader.reload();
            }
            
            console.log('✅ Quick fix complete!');
            
            // Show results
            setTimeout(() => {
                window.gmkbDiagnose();
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
