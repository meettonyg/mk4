/**
 * Debug script to test if Biography component is triggering server-side rendering
 */
(function() {
    'use strict';
    
    console.log('🔍 Testing server-side rendering for Biography component...');
    
    // Wait for systems to be ready
    const testServerRender = () => {
        if (!window.enhancedComponentRenderer) {
            console.error('❌ Component renderer not found');
            return;
        }
        
        // Test checkServerRenderRequirement method
        const testComponent = async (type) => {
            const result = await window.enhancedComponentRenderer.checkServerRenderRequirement(type);
            console.log(`📊 ${type}: requiresServerRender = ${result}`);
            
            // Check configuration sources
            console.log(`  - gmkbData.components:`, window.gmkbData?.components?.find(c => c.type === type));
            console.log(`  - gmkbData.componentSchemas:`, window.gmkbData?.componentSchemas?.[type]);
            console.log(`  - componentConfigurationManager:`, window.componentConfigurationManager?.getComponentSchema?.(type));
        };
        
        // Test both components
        testComponent('biography');
        testComponent('topics');
        
        // Check if components array is properly loaded
        console.log('📋 All components in gmkbData:', window.gmkbData?.components?.map(c => ({
            type: c.type,
            name: c.name,
            requiresServerRender: c.requiresServerRender
        })));
    };
    
    // Run test when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', testServerRender);
    } else {
        setTimeout(testServerRender, 1000);
    }
    
    // Add console command for manual testing
    window.testBiographyServerRender = async () => {
        console.log('🧪 Manual test: Adding Biography component...');
        
        const stateManager = window.enhancedStateManager;
        const renderer = window.enhancedComponentRenderer;
        
        if (!stateManager || !renderer) {
            console.error('Required systems not available');
            return;
        }
        
        const componentId = 'test-bio-' + Date.now();
        const componentData = {
            type: 'biography',
            props: {},
            data: {}
        };
        
        // Add to state
        stateManager.dispatch({
            type: 'ADD_COMPONENT',
            payload: {
                id: componentId,
                componentData: componentData
            }
        });
        
        // Check if server render was triggered
        console.log('✅ Component added. Check Network tab for AJAX call to guestify_render_component');
    };
    
    console.log('💡 Use window.testBiographyServerRender() to manually test');
    
})();
