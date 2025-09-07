/**
 * Debug script for Component Design Panel
 * This script helps diagnose why the design panel isn't loading component options
 */

(function() {
    'use strict';
    
    console.log('🔍 DEBUG: Design Panel Diagnostic Starting...');
    
    // Check if ComponentOptionsUI is available
    const checkSystemStatus = () => {
        const status = {
            componentOptionsUI: !!window.componentOptionsUI,
            componentConfigurationManager: !!window.componentConfigurationManager,
            dataBindingEngine: !!window.dataBindingEngine,
            enhancedStateManager: !!window.enhancedStateManager,
            designPanel: !!window.designPanel
        };
        
        console.log('📊 System Status:', status);
        
        // Check if ComponentOptionsUI is initialized
        if (window.componentOptionsUI) {
            console.log('✅ ComponentOptionsUI is available');
            console.log('   isInitialized:', window.componentOptionsUI.isInitialized);
            console.log('   configManager:', !!window.componentOptionsUI.configManager);
            console.log('   stateManager:', !!window.componentOptionsUI.stateManager);
            console.log('   dataBinding:', !!window.componentOptionsUI.dataBinding);
        } else {
            console.error('❌ ComponentOptionsUI is NOT available');
        }
        
        // Check if ComponentConfigurationManager has schemas
        if (window.componentConfigurationManager) {
            console.log('✅ ComponentConfigurationManager is available');
            const schemas = window.componentConfigurationManager.schemas || {};
            console.log('   Loaded schemas:', Object.keys(schemas));
            console.log('   schemasInitialized:', window.componentConfigurationManager.schemasInitialized);
            
            // Check if hero schema is loaded
            if (schemas.hero) {
                console.log('   ✅ Hero schema loaded:', schemas.hero);
            } else {
                console.log('   ❌ Hero schema NOT loaded');
            }
        } else {
            console.error('❌ ComponentConfigurationManager is NOT available');
        }
        
        return status;
    };
    
    // Monitor design panel events
    const monitorDesignPanelEvents = () => {
        console.log('👂 Monitoring design panel events...');
        
        // Monitor component edit requests
        document.addEventListener('gmkb:component-edit-requested', (e) => {
            console.log('📝 Event: gmkb:component-edit-requested', e.detail);
        });
        
        // Monitor design panel opened
        document.addEventListener('gmkb:design-panel-opened', (e) => {
            console.log('📂 Event: gmkb:design-panel-opened', e.detail);
            
            // Check if ComponentOptionsUI responds
            setTimeout(() => {
                const panelElement = e.detail.panelElement;
                const hasOptions = panelElement?.querySelector('.component-options-container');
                if (hasOptions) {
                    console.log('✅ Component options loaded in panel');
                } else {
                    console.log('❌ Component options NOT loaded in panel');
                    
                    // Try to manually trigger options loading
                    if (window.componentOptionsUI && e.detail.componentId && e.detail.componentType) {
                        console.log('🔧 Attempting manual options load...');
                        window.componentOptionsUI.loadComponentOptions(
                            e.detail.componentId,
                            e.detail.componentType,
                            panelElement
                        );
                    }
                }
            }, 500);
        });
        
        // Monitor component selection
        document.addEventListener('gmkb:component-selected', (e) => {
            console.log('🎯 Event: gmkb:component-selected', e.detail);
        });
        
        // Monitor ComponentOptionsUI ready
        document.addEventListener('gmkb:component-options-ui-ready', (e) => {
            console.log('✅ Event: gmkb:component-options-ui-ready', e.detail);
        });
        
        // Monitor Phase 2 ready
        document.addEventListener('gmkb:phase2-ready', (e) => {
            console.log('✅ Event: gmkb:phase2-ready', e.detail);
        });
    };
    
    // Test manual component edit
    window.testDesignPanel = function(componentId) {
        console.log('🧪 Testing design panel for component:', componentId);
        
        // Get component from state
        if (!window.enhancedStateManager) {
            console.error('State manager not available');
            return;
        }
        
        const state = window.enhancedStateManager.getState();
        const component = state.components[componentId];
        
        if (!component) {
            console.error('Component not found:', componentId);
            console.log('Available components:', Object.keys(state.components));
            return;
        }
        
        console.log('Component found:', component);
        
        // Try to open design panel
        if (window.designPanel) {
            console.log('Opening design panel...');
            window.designPanel.load(componentId);
        } else {
            console.error('Design panel not available');
        }
    };
    
    // Test loading component options directly
    window.testComponentOptions = async function(componentId, componentType) {
        console.log('🧪 Testing component options for:', componentId, componentType);
        
        if (!window.componentOptionsUI) {
            console.error('ComponentOptionsUI not available');
            return;
        }
        
        // Create a test panel element
        const testPanel = document.createElement('div');
        testPanel.id = 'test-design-panel';
        testPanel.style.cssText = 'position: fixed; right: 0; top: 0; width: 400px; height: 100vh; background: white; z-index: 10000; padding: 20px; overflow-y: auto; box-shadow: -2px 0 10px rgba(0,0,0,0.1);';
        document.body.appendChild(testPanel);
        
        try {
            await window.componentOptionsUI.loadComponentOptions(componentId, componentType, testPanel);
            console.log('✅ Component options loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load component options:', error);
        }
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close Test Panel';
        closeBtn.style.cssText = 'position: absolute; top: 10px; right: 10px; padding: 5px 10px; background: #ef4444; color: white; border: none; cursor: pointer;';
        closeBtn.onclick = () => testPanel.remove();
        testPanel.appendChild(closeBtn);
    };
    
    // Initialize debugging when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                checkSystemStatus();
                monitorDesignPanelEvents();
                console.log('📋 Debug commands available:');
                console.log('   testDesignPanel("component-id") - Test opening design panel');
                console.log('   testComponentOptions("component-id", "component-type") - Test loading options directly');
            }, 1000);
        });
    } else {
        setTimeout(() => {
            checkSystemStatus();
            monitorDesignPanelEvents();
            console.log('📋 Debug commands available:');
            console.log('   testDesignPanel("component-id") - Test opening design panel');
            console.log('   testComponentOptions("component-id", "component-type") - Test loading options directly');
        }, 1000);
    }
    
    // Also check immediately
    console.log('🔍 Immediate system check:');
    console.log('   componentOptionsUI:', !!window.componentOptionsUI);
    console.log('   componentConfigurationManager:', !!window.componentConfigurationManager);
    console.log('   designPanel:', !!window.designPanel);
})();