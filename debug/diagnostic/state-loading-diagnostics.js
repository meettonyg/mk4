/**
 * @file state-loading-diagnostics.js
 * @description Diagnostic tools for debugging state loading issues
 * 
 * ROOT FIX: Comprehensive state loading system debugging
 */

import { structuredLogger } from '../utils/structured-logger.js';

class StateLoadingDiagnostics {
    constructor() {
        this.logger = structuredLogger;
    }
    
    /**
     * Run comprehensive state loading diagnostics
     */
    async runDiagnostics() {
        console.group('💾 State Loading Diagnostics');
        
        try {
            // Step 1: Check localStorage data
            const storageData = this.checkLocalStorageData();
            console.log('🗄️ localStorage Data:', storageData);
            
            // Step 2: Check enhanced state manager loading
            const stateManagerData = this.checkStateManagerLoading();
            console.log('🔄 State Manager Loading:', stateManagerData);
            
            // Step 3: Check current state
            const currentStateData = this.checkCurrentState();
            console.log('📊 Current State:', currentStateData);
            
            // Step 4: Check renderer state
            const rendererData = this.checkRendererState();
            console.log('🎨 Renderer State:', rendererData);
            
            // Step 5: Check initialization sequence
            const initData = this.checkInitializationSequence();
            console.log('🚀 Initialization:', initData);
            
            // Step 6: Provide recommendations
            this.provideRecommendations(storageData, stateManagerData, currentStateData, rendererData, initData);
            
        } catch (error) {
            console.error('❌ State loading diagnostics failed:', error);
        } finally {
            console.groupEnd();
        }
    }
    
    /**
     * Check localStorage data
     */
    checkLocalStorageData() {
        const keys = [
            'guestifyMediaKitState',
            'guestifyMediaKitState_backup',
            'guestifyMediaKitState_history'
        ];
        
        const results = {};
        
        keys.forEach(key => {
            try {
                const data = localStorage.getItem(key);
                if (data) {
                    const parsed = JSON.parse(data);
                    results[key] = {
                        exists: true,
                        size: Math.round(data.length / 1024) + 'KB',
                        components: Object.keys(parsed.components || {}).length,
                        layout: (parsed.layout || []).length,
                        version: parsed.meta?.version || parsed.version || 'unknown',
                        savedAt: parsed.meta?.savedAt || 'unknown'
                    };
                } else {
                    results[key] = { exists: false };
                }
            } catch (error) {
                results[key] = { 
                    exists: true, 
                    error: `Parse error: ${error.message}` 
                };
            }
        });
        
        return results;
    }
    
    /**
     * Check enhanced state manager loading capability
     */
    checkStateManagerLoading() {
        const stateManager = window.enhancedStateManager;
        
        if (!stateManager) {
            return {
                exists: false,
                error: 'Enhanced state manager not available'
            };
        }
        
        try {
            return {
                exists: true,
                methods: {
                    hasLoadStateFromStorage: typeof stateManager.loadStateFromStorage === 'function',
                    hasAutoLoadSavedState: typeof stateManager.autoLoadSavedState === 'function',
                    hasInitializeAfterSystems: typeof stateManager.initializeAfterSystems === 'function',
                    hasSetInitialState: typeof stateManager.setInitialState === 'function'
                },
                properties: {
                    saveKey: stateManager.SAVE_KEY || 'unknown',
                    saveVersion: stateManager.SAVE_VERSION || 'unknown'
                },
                testLoad: this.testStateManagerLoad(stateManager)
            };
        } catch (error) {
            return {
                exists: true,
                error: `Error checking state manager: ${error.message}`
            };
        }
    }
    
    /**
     * Test state manager loading
     */
    testStateManagerLoad(stateManager) {
        try {
            // Try to load from storage without affecting current state
            const loadedData = stateManager.loadStateFromStorage();
            
            return {
                success: true,
                hasData: !!loadedData,
                components: loadedData ? Object.keys(loadedData.components || {}).length : 0,
                layout: loadedData ? (loadedData.layout || []).length : 0,
                structure: loadedData ? {
                    hasComponents: !!loadedData.components,
                    hasLayout: !!loadedData.layout,
                    hasGlobalSettings: !!loadedData.globalSettings,
                    hasVersion: !!loadedData.version
                } : null
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Check current state
     */
    checkCurrentState() {
        const stateManager = window.enhancedStateManager;
        
        if (!stateManager) {
            return {
                stateManagerExists: false,
                error: 'Enhanced state manager not available'
            };
        }
        
        try {
            const currentState = stateManager.getState();
            
            return {
                stateManagerExists: true,
                hasState: !!currentState,
                state: currentState ? {
                    components: Object.keys(currentState.components || {}).length,
                    layout: (currentState.layout || []).length,
                    hasGlobalSettings: !!currentState.globalSettings,
                    version: currentState.version || 'unknown'
                } : null,
                componentDetails: currentState && currentState.components ? 
                    Object.keys(currentState.components).map(id => ({
                        id,
                        type: currentState.components[id].type || 'unknown',
                        hasProps: !!currentState.components[id].props
                    })) : []
            };
        } catch (error) {
            return {
                stateManagerExists: true,
                error: error.message
            };
        }
    }
    
    /**
     * Check renderer state
     */
    checkRendererState() {
        const renderer = window.renderer;
        
        if (!renderer) {
            return {
                exists: false,
                error: 'Renderer not available'
            };
        }
        
        try {
            return {
                exists: true,
                initialized: renderer.initialized || false,
                isRendering: renderer.isRendering || false,
                hasStateSubscription: !!renderer.stateUnsubscribe,
                previewElement: {
                    exists: !!document.getElementById('media-kit-preview'),
                    hasChildren: document.getElementById('media-kit-preview')?.children.length || 0,
                    innerHTML: document.getElementById('media-kit-preview')?.innerHTML?.length || 0
                }
            };
        } catch (error) {
            return {
                exists: true,
                error: error.message
            };
        }
    }
    
    /**
     * Check initialization sequence
     */
    checkInitializationSequence() {
        return {
            systems: {
                enhancedStateManager: !!window.enhancedStateManager,
                saveService: !!window.saveService,
                stateHistory: !!window.stateHistory,
                renderer: !!window.renderer,
                toolbarInteractions: !!window.toolbarInteractions
            },
            events: {
                // Check if we can detect if initialization events fired
                templateComplete: !!window.gmkbTemplateComplete,
                templateLoadTime: window.gmkbTemplateLoadTime || null
            },
            domReady: document.readyState,
            timing: {
                now: Date.now(),
                performanceNow: performance.now()
            }
        };
    }
    
    /**
     * Provide recommendations
     */
    provideRecommendations(storageData, stateManagerData, currentStateData, rendererData, initData) {
        console.group('💡 Recommendations');
        
        const issues = [];
        const fixes = [];
        
        // Check if there's saved data but no current state
        const hasSavedData = storageData.guestifyMediaKitState?.exists && 
                            storageData.guestifyMediaKitState?.components > 0;
        const hasCurrentState = currentStateData.hasState && 
                               currentStateData.state?.components > 0;
        
        if (hasSavedData && !hasCurrentState) {
            issues.push('Saved data exists but not loaded into current state');
            fixes.push('Try: window.enhancedStateManager.autoLoadSavedState()');
            fixes.push('Try: manuallyLoadState()');
        }
        
        if (hasCurrentState && (!rendererData.previewElement?.hasChildren || rendererData.previewElement?.hasChildren === 0)) {
            issues.push('State has components but they are not rendered');
            fixes.push('Try: window.renderer.forceRender()');
            fixes.push('Check if renderer is subscribed to state changes');
        }
        
        if (!stateManagerData.exists) {
            issues.push('Enhanced state manager not available');
            fixes.push('Refresh the page and check for JavaScript errors');
        }
        
        if (!rendererData.exists) {
            issues.push('Renderer not available');
            fixes.push('Check if renderer is properly initialized');
        }
        
        if (stateManagerData.exists && !stateManagerData.methods.hasAutoLoadSavedState) {
            issues.push('State manager missing auto-load method');
            fixes.push('Check enhanced-state-manager.js for missing methods');
        }
        
        // Show results
        if (issues.length === 0) {
            console.log('✅ No critical issues detected');
            
            if (hasSavedData && hasCurrentState) {
                console.log('✅ Saved data exists and is loaded');
                if (rendererData.previewElement?.hasChildren > 0) {
                    console.log('✅ Components are rendered');
                } else {
                    console.log('⚠️ Components may not be visible - check renderer');
                }
            } else if (!hasSavedData) {
                console.log('ℹ️ No saved data found - this is normal for new sessions');
            }
        } else {
            console.log('❌ Issues detected:');
            issues.forEach(issue => console.log(`   - ${issue}`));
            
            console.log('\\n🔧 Suggested fixes:');
            fixes.forEach(fix => console.log(`   - ${fix}`));
        }
        
        console.log('\\n🛠️ Manual recovery options:');
        console.log('1. manuallyLoadState() - Force load from localStorage');
        console.log('2. checkSavedComponents() - Show what components are saved');
        console.log('3. forceStateReload() - Complete state reload');
        console.log('4. resetAndReload() - Clear state and reload page');
        
        console.groupEnd();
    }
    
    /**
     * Manual state loading
     */
    async manuallyLoadState() {
        console.log('🔄 Attempting manual state loading...');
        
        const stateManager = window.enhancedStateManager;
        if (!stateManager) {
            console.error('❌ Enhanced state manager not available');
            return false;
        }
        
        try {
            // Try to load from storage
            const savedState = stateManager.loadStateFromStorage();
            
            if (!savedState) {
                console.log('ℹ️ No saved state found in localStorage');
                return false;
            }
            
            console.log('📦 Found saved state:', {
                components: Object.keys(savedState.components || {}).length,
                layout: (savedState.layout || []).length
            });
            
            // Apply the loaded state
            stateManager.applyTransaction({
                type: 'SET_STATE',
                payload: savedState
            });
            
            console.log('✅ State loaded manually');
            return true;
            
        } catch (error) {
            console.error('❌ Manual state loading failed:', error);
            return false;
        }
    }
    
    /**
     * Show saved components
     */
    checkSavedComponents() {
        console.log('🔍 Checking saved components...');
        
        try {
            const savedData = localStorage.getItem('guestifyMediaKitState');
            if (!savedData) {
                console.log('ℹ️ No saved data found');
                return;
            }
            
            const parsed = JSON.parse(savedData);
            const components = parsed.components || {};
            const layout = parsed.layout || [];
            
            console.log('📊 Saved data summary:', {
                totalComponents: Object.keys(components).length,
                layoutOrder: layout.length,
                version: parsed.meta?.version || parsed.version,
                savedAt: parsed.meta?.savedAt
            });
            
            if (Object.keys(components).length > 0) {
                console.log('\\n📋 Component details:');
                Object.entries(components).forEach(([id, component]) => {
                    console.log(`   ${id}: ${component.type || 'unknown type'}`);
                });
                
                console.log('\\n📐 Layout order:');
                layout.forEach((id, index) => {
                    console.log(`   ${index + 1}. ${id}`);
                });
            } else {
                console.log('ℹ️ No components found in saved data');
            }
            
        } catch (error) {
            console.error('❌ Error checking saved components:', error);
        }
    }
    
    /**
     * Force complete state reload
     */
    async forceStateReload() {
        console.log('🔄 Forcing complete state reload...');
        
        try {
            // Step 1: Manual load
            const loadSuccess = await this.manuallyLoadState();
            
            if (loadSuccess) {
                // Step 2: Force render
                if (window.renderer && window.renderer.forceRender) {
                    console.log('🎨 Forcing renderer update...');
                    window.renderer.forceRender();
                }
                
                // Step 3: Update toolbar buttons
                if (window.toolbarInteractions && window.toolbarInteractions.updateButtonStates) {
                    console.log('🔘 Updating button states...');
                    window.toolbarInteractions.updateButtonStates();
                }
                
                console.log('✅ Complete state reload finished');
                return true;
            } else {
                console.log('❌ State reload failed at loading step');
                return false;
            }
            
        } catch (error) {
            console.error('❌ Force state reload failed:', error);
            return false;
        }
    }
}

// Create and export singleton
export const stateLoadingDiagnostics = new StateLoadingDiagnostics();

// Expose globally for easy access
window.stateLoadingDiagnostics = stateLoadingDiagnostics;

// Convenience functions
export const runStateLoadingDiagnostics = () => stateLoadingDiagnostics.runDiagnostics();
export const manuallyLoadState = () => stateLoadingDiagnostics.manuallyLoadState();
export const checkSavedComponents = () => stateLoadingDiagnostics.checkSavedComponents();
export const forceStateReload = () => stateLoadingDiagnostics.forceStateReload();
