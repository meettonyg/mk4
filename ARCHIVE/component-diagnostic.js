/**
 * Media Kit Builder Component Diagnostic
 * Diagnoses and fixes component loading issues
 */

(function() {
    'use strict';
    
    console.log('🔍 GMKB Component Diagnostic Starting...');
    
    // Check 1: Component Registry
    function checkRegistry() {
        console.log('\n📦 Component Registry Check:');
        
        if (typeof window.GMKBComponentRegistry === 'undefined') {
            console.error('❌ GMKBComponentRegistry is not defined');
            return false;
        }
        
        console.log('✅ GMKBComponentRegistry exists');
        console.log('   Type:', typeof window.GMKBComponentRegistry);
        console.log('   Has register method:', typeof window.GMKBComponentRegistry.register === 'function');
        
        if (window.GMKBComponentRegistry.getTypes) {
            const types = window.GMKBComponentRegistry.getTypes();
            console.log('   Registered component types:', types.length > 0 ? types : 'None');
        }
        
        return true;
    }
    
    // Check 2: Component Data
    function checkComponentData() {
        console.log('\n📊 Component Data Check:');
        
        if (!window.gmkbData) {
            console.error('❌ gmkbData is not available');
            return false;
        }
        
        console.log('✅ gmkbData exists');
        console.log('   Components in data:', window.gmkbData.components ? window.gmkbData.components.length : 0);
        console.log('   Component types:', window.gmkbData.componentTypes || 'Not defined');
        
        if (window.gmkbData.components && window.gmkbData.components.length > 0) {
            console.log('   Sample component:', window.gmkbData.components[0]);
        }
        
        return true;
    }
    
    // Check 3: State Manager
    function checkStateManager() {
        console.log('\n💾 State Manager Check:');
        
        if (!window.enhancedStateManager) {
            console.error('❌ enhancedStateManager is not available');
            return false;
        }
        
        console.log('✅ enhancedStateManager exists');
        
        const state = window.enhancedStateManager.getState();
        if (state) {
            const componentCount = state.components ? Object.keys(state.components).length : 0;
            console.log('   Components in state:', componentCount);
            
            if (componentCount > 0) {
                console.log('   Component IDs:', Object.keys(state.components));
            }
        }
        
        return true;
    }
    
    // Check 4: Component Renderer
    function checkRenderer() {
        console.log('\n🎨 Component Renderer Check:');
        
        if (!window.enhancedComponentRenderer) {
            console.error('❌ enhancedComponentRenderer is not available');
            return false;
        }
        
        console.log('✅ enhancedComponentRenderer exists');
        console.log('   Has render method:', typeof window.enhancedComponentRenderer.render === 'function');
        console.log('   Has renderAll method:', typeof window.enhancedComponentRenderer.renderAll === 'function');
        
        return true;
    }
    
    // Check 5: DOM Containers
    function checkContainers() {
        console.log('\n📦 DOM Container Check:');
        
        const containers = {
            'saved-components-container': document.getElementById('saved-components-container'),
            'empty-state-container': document.getElementById('empty-state-container'),
            'media-kit-preview': document.getElementById('media-kit-preview'),
            'gmkb-sections-container': document.getElementById('gmkb-sections-container')
        };
        
        let hasContainer = false;
        for (const [id, element] of Object.entries(containers)) {
            if (element) {
                console.log(`✅ ${id} exists`);
                hasContainer = true;
                
                // Check visibility
                const display = window.getComputedStyle(element).display;
                if (display === 'none') {
                    console.warn(`   ⚠️ Container is hidden (display: none)`);
                }
            } else {
                console.log(`❌ ${id} not found`);
            }
        }
        
        return hasContainer;
    }
    
    // Fix 1: Force component registration
    function forceRegisterComponents() {
        console.log('\n🔧 Attempting to force register components...');
        
        if (!window.GMKBComponentRegistry || !window.gmkbData?.components) {
            console.error('Cannot force register - missing registry or component data');
            return;
        }
        
        window.gmkbData.components.forEach(comp => {
            if (comp.type) {
                window.GMKBComponentRegistry.register(comp.type, comp);
                console.log(`   Registered: ${comp.type}`);
            }
        });
    }
    
    // Fix 2: Force render components
    function forceRenderComponents() {
        console.log('\n🔧 Attempting to force render components...');
        
        if (!window.enhancedComponentRenderer || !window.enhancedStateManager) {
            console.error('Cannot force render - missing renderer or state manager');
            return;
        }
        
        const state = window.enhancedStateManager.getState();
        if (state?.components && Object.keys(state.components).length > 0) {
            window.enhancedComponentRenderer.renderAll();
            console.log('   Called renderAll()');
        } else {
            console.log('   No components to render');
        }
    }
    
    // Fix 3: Fix container visibility
    function fixContainerVisibility() {
        console.log('\n🔧 Fixing container visibility...');
        
        const savedContainer = document.getElementById('saved-components-container');
        const emptyContainer = document.getElementById('empty-state-container');
        
        if (!window.enhancedStateManager) {
            console.error('Cannot fix visibility - state manager not available');
            return;
        }
        
        const state = window.enhancedStateManager.getState();
        const hasComponents = state?.components && Object.keys(state.components).length > 0;
        
        if (hasComponents) {
            if (savedContainer) {
                savedContainer.style.display = 'block';
                console.log('   Showing saved-components-container');
            }
            if (emptyContainer) {
                emptyContainer.style.display = 'none';
                console.log('   Hiding empty-state-container');
            }
        } else {
            if (savedContainer) {
                savedContainer.style.display = 'none';
                console.log('   Hiding saved-components-container');
            }
            if (emptyContainer) {
                emptyContainer.style.display = 'block';
                console.log('   Showing empty-state-container');
            }
        }
    }
    
    // Run all checks
    function runDiagnostic() {
        console.log('=' .repeat(50));
        console.log('🏥 GMKB Component Diagnostic Report');
        console.log('=' .repeat(50));
        
        const results = {
            registry: checkRegistry(),
            data: checkComponentData(),
            state: checkStateManager(),
            renderer: checkRenderer(),
            containers: checkContainers()
        };
        
        console.log('\n📋 Summary:');
        console.log('   Registry:', results.registry ? '✅' : '❌');
        console.log('   Data:', results.data ? '✅' : '❌');
        console.log('   State:', results.state ? '✅' : '❌');
        console.log('   Renderer:', results.renderer ? '✅' : '❌');
        console.log('   Containers:', results.containers ? '✅' : '❌');
        
        return results;
    }
    
    // Auto-fix function
    function autoFix() {
        console.log('\n🔧 Attempting auto-fix...');
        
        forceRegisterComponents();
        fixContainerVisibility();
        forceRenderComponents();
        
        console.log('✅ Auto-fix complete');
    }
    
    // Expose diagnostic functions globally
    window.gmkbDiagnostic = {
        run: runDiagnostic,
        checkRegistry: checkRegistry,
        checkData: checkComponentData,
        checkState: checkStateManager,
        checkRenderer: checkRenderer,
        checkContainers: checkContainers,
        forceRegister: forceRegisterComponents,
        forceRender: forceRenderComponents,
        fixVisibility: fixContainerVisibility,
        autoFix: autoFix
    };
    
    // Run diagnostic after a short delay to ensure everything is loaded
    setTimeout(function() {
        console.log('\n🚀 Running initial diagnostic...');
        const results = runDiagnostic();
        
        // Auto-fix if there are issues
        if (!results.registry || !results.renderer || !results.containers) {
            console.log('\n⚠️ Issues detected. Running auto-fix...');
            autoFix();
        }
    }, 2000);
    
    console.log('\n💡 Diagnostic commands available:');
    console.log('   gmkbDiagnostic.run() - Run full diagnostic');
    console.log('   gmkbDiagnostic.autoFix() - Attempt automatic fixes');
    console.log('   gmkbDiagnostic.forceRender() - Force render all components');
    
})();