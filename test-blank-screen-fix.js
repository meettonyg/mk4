/**
 * @file test-blank-screen-fix.js  
 * @description ROOT CAUSE FIX VERIFICATION: Test blank screen fix
 * 
 * ISSUE: Media Kit Builder shows blank screen despite having 4 components
 * ROOT CAUSE: Template container visibility logic was flawed
 * FIX: Enhanced PHP component detection + fixed container display logic
 */

(function() {
    'use strict';
    
    const testBlankScreenFix = () => {
        console.group('🔍 BLANK SCREEN FIX VERIFICATION');
        
        // 1. Check container visibility
        const savedContainer = document.getElementById('saved-components-container');
        const emptyState = document.getElementById('empty-state');
        const componentsDirectContainer = document.getElementById('components-direct-container');
        const sectionsContainer = document.getElementById('gmkb-sections-container');
        
        console.log('📋 CONTAINER STATUS:');
        console.log('  saved-components-container:', {
            exists: !!savedContainer,
            visible: savedContainer ? savedContainer.style.display !== 'none' : false,
            computedDisplay: savedContainer ? getComputedStyle(savedContainer).display : 'N/A'
        });
        
        console.log('  empty-state:', {
            exists: !!emptyState,
            visible: emptyState ? emptyState.style.display !== 'none' : false,
            computedDisplay: emptyState ? getComputedStyle(emptyState).display : 'N/A'
        });
        
        console.log('  components-direct-container:', {
            exists: !!componentsDirectContainer,
            childCount: componentsDirectContainer ? componentsDirectContainer.children.length : 0
        });
        
        console.log('  gmkb-sections-container:', {
            exists: !!sectionsContainer,
            childCount: sectionsContainer ? sectionsContainer.children.length : 0
        });
        
        // 2. Check state manager
        if (window.enhancedStateManager) {
            const state = window.enhancedStateManager.getState();
            console.log('📊 STATE MANAGER:');
            console.log('  Components count:', Object.keys(state.components || {}).length);
            console.log('  Layout count:', (state.layout || []).length);
            console.log('  Component IDs:', Object.keys(state.components || {}));
        } else {
            console.log('❌ State manager not available');
        }
        
        // 3. Check rendered components in DOM
        const renderedComponents = document.querySelectorAll('[data-component-id]');
        console.log('🎨 RENDERED COMPONENTS:');
        console.log('  Total rendered:', renderedComponents.length);
        
        renderedComponents.forEach((comp, index) => {
            console.log(`  ${index + 1}. ID: ${comp.dataset.componentId}, Type: ${comp.dataset.componentType}, Visible: ${comp.offsetParent !== null}`);
        });
        
        // 4. Check WordPress data
        if (window.gmkbData) {
            console.log('📡 WORDPRESS DATA:');
            console.log('  Has saved_components:', !!(window.gmkbData.saved_components));
            console.log('  Saved components count:', window.gmkbData.saved_components ? window.gmkbData.saved_components.length : 0);
            console.log('  Post ID:', window.gmkbData.postId);
        } else {
            console.log('❌ WordPress data not available');
        }
        
        // 5. Container visibility diagnosis
        console.log('🔍 DIAGNOSIS:');
        const hasComponents = window.enhancedStateManager ? 
            Object.keys(window.enhancedStateManager.getState().components || {}).length > 0 : false;
        
        const containerVisible = savedContainer && savedContainer.style.display !== 'none';
        const emptyVisible = emptyState && emptyState.style.display !== 'none';
        
        if (hasComponents && !containerVisible) {
            console.log('❌ ISSUE: Has components but container not visible');
            console.log('🔧 ATTEMPTING FIX: Show saved components container');
            if (savedContainer) {
                savedContainer.style.display = 'block';
            }
            if (emptyState) {
                emptyState.style.display = 'none';
            }
        } else if (hasComponents && containerVisible) {
            console.log('✅ CORRECT: Has components and container is visible');
        } else if (!hasComponents && emptyVisible) {
            console.log('✅ CORRECT: No components and empty state is visible');
        } else {
            console.log('⚠️ UNCLEAR: Component/container state unclear');
        }
        
        // 6. Force component rendering check
        if (window.enhancedComponentRenderer && hasComponents) {
            console.log('🎨 CHECKING COMPONENT RENDERER:');
            const stats = window.enhancedComponentRenderer.getStats();
            console.log('  Renderer stats:', stats);
            
            // Try to trigger re-render if needed
            const state = window.enhancedStateManager.getState();
            if (Object.keys(state.components).length > stats.cachedComponents) {
                console.log('🔄 TRIGGERING COMPONENT RE-RENDER...');
                window.enhancedComponentRenderer.processStateChange(state);
            }
        }
        
        console.groupEnd();
        
        // Summary
        console.log('\n📋 BLANK SCREEN FIX SUMMARY:');
        console.log(`Components in state: ${hasComponents ? 'YES' : 'NO'}`);
        console.log(`Container visible: ${containerVisible ? 'YES' : 'NO'}`);
        console.log(`Components rendered: ${renderedComponents.length}`);
        console.log(`Fix needed: ${hasComponents && (!containerVisible || renderedComponents.length === 0) ? 'YES' : 'NO'}`);
    };
    
    // Auto-run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', testBlankScreenFix);
    } else {
        testBlankScreenFix();
    }
    
    // Make available globally
    window.testBlankScreenFix = testBlankScreenFix;
    
})();

// Quick test function
window.quickBlankScreenCheck = () => {
    const hasState = !!(window.enhancedStateManager && Object.keys(window.enhancedStateManager.getState().components || {}).length > 0);
    const containerVisible = document.getElementById('saved-components-container')?.style.display !== 'none';
    const renderedCount = document.querySelectorAll('[data-component-id]').length;
    
    console.log(`🔍 Quick Check: Components(${hasState}) Container(${containerVisible}) Rendered(${renderedCount})`);
    
    if (hasState && !containerVisible) {
        const container = document.getElementById('saved-components-container');
        const emptyState = document.getElementById('empty-state');
        if (container) container.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';
        console.log('🔧 Applied quick fix - show components container');
    }
};
