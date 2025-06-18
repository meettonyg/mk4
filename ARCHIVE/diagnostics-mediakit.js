/**
 * Diagnostic script to check Media Kit Builder data loading
 */

(function diagnostics() {
    console.log('=== Media Kit Builder Diagnostics ===');
    
    // Check guestifyData
    console.log('\n1. Checking guestifyData:');
    if (window.guestifyData) {
        console.log('✅ guestifyData exists');
        console.log('- ajaxUrl:', window.guestifyData.ajaxUrl ? '✅' : '❌');
        console.log('- nonce:', window.guestifyData.nonce ? '✅' : '❌');
        console.log('- pluginUrl:', window.guestifyData.pluginUrl || 'Not set');
        console.log('- components:', Array.isArray(window.guestifyData.components) ? `✅ (${window.guestifyData.components.length} components)` : '❌');
        console.log('- componentSchemas:', typeof window.guestifyData.componentSchemas === 'object' ? `✅ (${Object.keys(window.guestifyData.componentSchemas).length} schemas)` : '❌');
        console.log('- features:', window.guestifyData.features || 'Not set');
        
        // List components
        if (window.guestifyData.components && window.guestifyData.components.length > 0) {
            console.log('\nAvailable components:');
            window.guestifyData.components.forEach(comp => {
                console.log(`  - ${comp.name} (dir: ${comp.directory || 'N/A'})`);
            });
        }
        
        // List schemas
        if (window.guestifyData.componentSchemas && Object.keys(window.guestifyData.componentSchemas).length > 0) {
            console.log('\nLoaded schemas:');
            Object.keys(window.guestifyData.componentSchemas).forEach(key => {
                console.log(`  - ${key}`);
            });
        }
    } else {
        console.log('❌ guestifyData not found');
    }
    
    // Check managers
    console.log('\n2. Checking Managers:');
    console.log('- stateManager:', window.stateManager ? '✅' : '❌');
    console.log('- componentManager:', window.componentManager ? '✅' : '❌');
    console.log('- componentRenderer:', window.componentRenderer ? '✅' : '❌');
    console.log('- enhancedStateManager:', window.enhancedStateManager ? '✅' : '❌');
    console.log('- enhancedComponentManager:', window.enhancedComponentManager ? '✅' : '❌');
    console.log('- enhancedComponentRenderer:', window.enhancedComponentRenderer ? '✅' : '❌');
    
    // Check which managers are being used
    console.log('\n3. Active Manager Check:');
    console.log('- Using enhanced state:', window.stateManager === window.enhancedStateManager ? '✅' : '❌');
    console.log('- Using enhanced component:', window.componentManager === window.enhancedComponentManager ? '✅' : '❌');
    console.log('- Using enhanced renderer:', window.componentRenderer === window.enhancedComponentRenderer ? '✅' : '❌');
    
    // Check current state
    console.log('\n4. Current State:');
    const state = window.stateManager?.getState();
    if (state) {
        const componentCount = Object.keys(state.components || {}).length;
        console.log(`- Components in state: ${componentCount}`);
        if (componentCount > 0) {
            console.log('- Component IDs:');
            Object.keys(state.components).forEach(id => {
                const comp = state.components[id];
                console.log(`  - ${id} (type: ${comp.type})`);
            });
        }
    }
    
    // Check feature flags
    console.log('\n5. Feature Flags:');
    if (window.mediaKitFeatures) {
        Object.entries(window.mediaKitFeatures.FEATURES).forEach(([key, value]) => {
            console.log(`- ${key}: ${value ? '✅' : '❌'}`);
        });
    } else {
        console.log('❌ Feature flags not found');
    }
    
    // Check initialization
    console.log('\n6. Initialization:');
    console.log('- mediaKitBuilderInitialized:', window.mediaKitBuilderInitialized ? '✅' : '❌');
    
    // Check for common issues
    console.log('\n7. Common Issues Check:');
    
    // Check if jQuery is loaded
    console.log('- jQuery loaded:', typeof jQuery !== 'undefined' ? '✅' : '❌');
    
    // Check if preview container exists
    const previewContainer = document.getElementById('media-kit-preview');
    console.log('- Preview container exists:', previewContainer ? '✅' : '❌');
    
    // Check if components are loading
    if (window.componentManager && window.componentManager.componentRegistry) {
        console.log(`- Component registry size: ${window.componentManager.componentRegistry.size}`);
    }
    
    // Check localStorage
    console.log('\n8. Storage Check:');
    const savedData = localStorage.getItem('mediaKitData');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            console.log('✅ Saved data found');
            console.log(`- Components saved: ${parsed.components ? parsed.components.length : 0}`);
        } catch (e) {
            console.log('❌ Saved data is corrupted');
        }
    } else {
        console.log('- No saved data in localStorage');
    }
    
    console.log('\n=== Diagnostics Complete ===');
})();