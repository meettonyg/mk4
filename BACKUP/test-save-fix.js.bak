/**
 * Test script to verify save fix
 * This file helps debug the component saving issue
 */

// Test function to check state before save
window.testSaveState = function() {
    console.log('=== Testing Save State ===');
    
    // Get current state
    const state = window.stateManager?.getState();
    if (!state) {
        console.error('No state manager found');
        return;
    }
    
    console.log('Current state structure:');
    console.log('- Components object:', state.components);
    console.log('- Components type:', typeof state.components);
    console.log('- Components count:', Object.keys(state.components || {}).length);
    console.log('- Is array?:', Array.isArray(state.components));
    console.log('- Component IDs:', Object.keys(state.components || {}));
    
    // Check sections
    console.log('- Sections:', state.sections);
    console.log('- Sections count:', (state.sections || []).length);
    
    // Check what will be sent
    const cleanState = {
        components: state.components || {},
        layout: state.layout || [],
        sections: state.sections || [],
        theme: state.theme || 'default',
        themeSettings: state.themeSettings || [],
        globalSettings: state.globalSettings || {}
    };
    
    console.log('State to be sent:');
    console.log(JSON.stringify(cleanState, null, 2));
    
    // Test JSON encoding/decoding
    const jsonString = JSON.stringify(cleanState);
    const decoded = JSON.parse(jsonString);
    
    console.log('After JSON round-trip:');
    console.log('- Components type:', typeof decoded.components);
    console.log('- Components count:', Object.keys(decoded.components || {}).length);
    console.log('- Is array?:', Array.isArray(decoded.components));
    
    return cleanState;
};

// Function to manually trigger save with debug
window.testManualSave = async function() {
    console.log('=== Manual Save Test ===');
    
    const state = window.testSaveState();
    if (!state) return;
    
    // Get API service
    const apiService = window.GMKB?.apiService;
    if (!apiService) {
        console.error('No API service found');
        return;
    }
    
    console.log('Calling apiService.save() with state...');
    
    try {
        const result = await apiService.save(state);
        console.log('Save result:', result);
    } catch (error) {
        console.error('Save error:', error);
    }
};

// Function to add a test component
window.addTestComponent = function() {
    console.log('=== Adding Test Component ===');
    
    const componentId = `test_component_${Date.now()}`;
    const component = {
        id: componentId,
        type: 'hero',
        props: {
            title: 'Test Hero Component',
            subtitle: 'This is a test'
        },
        data: {},
        content: {}
    };
    
    console.log('Adding component:', component);
    
    // Add using state manager
    if (window.stateManager) {
        window.stateManager.addComponent(component);
        console.log('Component added via stateManager');
    } else if (window.GMKB) {
        window.GMKB.addComponent('hero', component.props);
        console.log('Component added via GMKB');
    } else {
        console.error('No way to add component found');
    }
    
    // Check state after adding
    setTimeout(() => {
        const state = window.stateManager?.getState();
        console.log('State after adding:');
        console.log('- Components:', state?.components);
        console.log('- Component count:', Object.keys(state?.components || {}).length);
    }, 100);
};

// Make functions globally available
window.testSaveState = testSaveState;
window.testManualSave = testManualSave;
window.addTestComponent = addTestComponent;

// Auto-log when ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('✅ Save fix test functions available:');
        console.log('  - testSaveState() : Check current state structure');
        console.log('  - testManualSave() : Manually trigger save with debug');
        console.log('  - addTestComponent() : Add a test component');
    });
} else {
    // Already loaded
    console.log('✅ Save fix test functions available:');
    console.log('  - testSaveState() : Check current state structure');
    console.log('  - testManualSave() : Manually trigger save with debug');
    console.log('  - addTestComponent() : Add a test component');
}
