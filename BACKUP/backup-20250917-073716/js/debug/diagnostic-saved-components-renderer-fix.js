/**
 * @file diagnostic-saved-components-renderer-fix.js
 * @description Diagnostic tool to debug saved_components rendering issues
 * ROOT FIX: Identifies why saved_components array is not being used by renderer
 */

(function() {
    'use strict';
    
    // Expose diagnostic function globally
    window.diagnoseSavedComponentsIssue = function() {
        console.group('🔍 SAVED COMPONENTS RENDERING DIAGNOSTIC');
        
        try {
            // Step 1: Check WordPress data
            console.group('📝 Step 1: WordPress Data Analysis');
            const wpData = window.gmkbData || window.guestifyData || window.MKCG;
            console.log('WordPress data object:', wpData);
            
            if (wpData) {
                console.log('Data keys:', Object.keys(wpData));
                console.log('Has saved_components:', !!wpData.saved_components);
                console.log('saved_components type:', Array.isArray(wpData.saved_components) ? 'array' : typeof wpData.saved_components);
                console.log('saved_components length:', wpData.saved_components ? wpData.saved_components.length : 0);
                
                if (wpData.saved_components && wpData.saved_components.length > 0) {
                    console.log('First saved component:', wpData.saved_components[0]);
                    console.log('All saved component IDs:', wpData.saved_components.map(c => c.id));
                }
                
                console.log('Has saved_state:', !!wpData.saved_state);
                if (wpData.saved_state) {
                    console.log('saved_state keys:', Object.keys(wpData.saved_state));
                    console.log('saved_state has saved_components:', !!wpData.saved_state.saved_components);
                }
            } else {
                console.error('❌ No WordPress data found!');
            }
            console.groupEnd();
            
            // Step 2: Check State Manager
            console.group('🏪 Step 2: State Manager Analysis');
            if (window.enhancedStateManager) {
                console.log('State manager initialized:', window.enhancedStateManager.isInitialized);
                
                const currentState = window.enhancedStateManager.getState();
                console.log('Current state:', currentState);
                console.log('Current state keys:', Object.keys(currentState));
                console.log('Current state has saved_components:', !!currentState.saved_components);
                console.log('Current state saved_components length:', currentState.saved_components ? currentState.saved_components.length : 0);
                
                const initialState = window.enhancedStateManager.getInitialState();
                console.log('Initial state has saved_components:', !!initialState.saved_components);
                console.log('Initial state saved_components length:', initialState.saved_components ? initialState.saved_components.length : 0);
                
                if (initialState.saved_components && initialState.saved_components.length > 0) {
                    console.log('Initial state saved_components:', initialState.saved_components);
                }
                
            } else {
                console.error('❌ Enhanced state manager not found!');
            }
            console.groupEnd();
            
            // Step 3: Check Component Renderer
            console.group('🎨 Step 3: Component Renderer Analysis');
            if (window.enhancedComponentRenderer) {
                console.log('Renderer initialized:', window.enhancedComponentRenderer.initialized);
                console.log('Renderer lastState:', window.enhancedComponentRenderer.lastState);
                
                if (window.enhancedComponentRenderer.lastState) {
                    console.log('Renderer lastState has saved_components:', !!window.enhancedComponentRenderer.lastState.saved_components);
                    console.log('Renderer lastState saved_components length:', window.enhancedComponentRenderer.lastState.saved_components ? window.enhancedComponentRenderer.lastState.saved_components.length : 0);
                }
                
            } else {
                console.error('❌ Enhanced component renderer not found!');
            }
            console.groupEnd();
            
            // Step 4: DOM Analysis
            console.group('🏠 Step 4: DOM State Analysis');
            const savedContainer = document.getElementById('saved-components-container');
            const previewContainer = document.getElementById('media-kit-preview');
            
            console.log('saved-components-container exists:', !!savedContainer);
            if (savedContainer) {
                console.log('saved-components-container display:', savedContainer.style.display);
                console.log('saved-components-container children:', savedContainer.children.length);
                console.log('saved-components-container child IDs:', Array.from(savedContainer.children).map(c => c.id));
            }
            
            console.log('media-kit-preview exists:', !!previewContainer);
            if (previewContainer) {
                console.log('media-kit-preview children:', previewContainer.children.length);
                console.log('media-kit-preview child IDs:', Array.from(previewContainer.children).map(c => c.id));
            }
            
            // Check for components with data-component-id
            const allComponents = document.querySelectorAll('[data-component-id]');
            console.log('Total components in DOM:', allComponents.length);
            console.log('Component IDs in DOM:', Array.from(allComponents).map(c => c.getAttribute('data-component-id')));
            console.groupEnd();
            
            // Step 5: Test State Manager Methods
            console.group('🧪 Step 5: Testing State Manager Methods');
            if (window.enhancedStateManager) {
                try {
                    const testInitialState = window.enhancedStateManager.getInitialStateFromSources();
                    console.log('getInitialStateFromSources() result:', testInitialState);
                    console.log('Test result has saved_components:', !!testInitialState.saved_components);
                    console.log('Test result saved_components length:', testInitialState.saved_components ? testInitialState.saved_components.length : 0);
                } catch (error) {
                    console.error('Error testing getInitialStateFromSources:', error);
                }
            }
            console.groupEnd();
            
            // Step 6: Recommendations
            console.group('💡 Step 6: Diagnostic Results & Recommendations');
            
            let issues = [];
            let solutions = [];
            
            if (!wpData) {
                issues.push('WordPress data not available');
                solutions.push('Check wp_localize_script in enqueue.php');
            }
            
            if (wpData && !wpData.saved_components) {
                issues.push('saved_components not in WordPress data');
                solutions.push('Check PHP side - ensure saved_components is being added to wp_data array');
            }
            
            if (wpData && wpData.saved_components && window.enhancedStateManager) {
                const state = window.enhancedStateManager.getState();
                if (!state.saved_components) {
                    issues.push('saved_components lost during state initialization');
                    solutions.push('Check validateAndNormalizeState method - ensure saved_components is preserved');
                }
            }
            
            if (window.enhancedComponentRenderer && window.enhancedComponentRenderer.lastState && !window.enhancedComponentRenderer.lastState.saved_components) {
                issues.push('saved_components not passed to renderer');
                solutions.push('Check renderer.init() method - ensure initial state includes saved_components');
            }
            
            if (issues.length === 0) {
                console.log('✅ No obvious issues found. The saved_components should be working.');
                console.log('If components still not rendering in correct order, check the renderSavedComponents method logic.');
            } else {
                console.log('❌ Issues found:');
                issues.forEach((issue, i) => {
                    console.log(`${i + 1}. ${issue}`);
                });
                
                console.log('💡 Suggested solutions:');
                solutions.forEach((solution, i) => {
                    console.log(`${i + 1}. ${solution}`);
                });
            }
            
            console.groupEnd();
            
        } catch (error) {
            console.error('Diagnostic error:', error);
        }
        
        console.groupEnd();
        
        return {
            wpData: window.gmkbData,
            stateManager: window.enhancedStateManager,
            renderer: window.enhancedComponentRenderer,
            timestamp: new Date().toISOString()
        };
    };
    
    // Expose shortcut
    window.diagSavedComponents = window.diagnoseSavedComponentsIssue;
    
    console.log('🔍 DIAGNOSTIC LOADED: Use diagnoseSavedComponentsIssue() or diagSavedComponents() to run diagnostic');
    
})();
