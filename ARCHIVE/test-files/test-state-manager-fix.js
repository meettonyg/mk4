/**
 * Quick test to verify the state manager fix
 */

window.testStateManagerFix = function() {
    console.log('🔍 Testing State Manager Fix');
    console.log('============================');
    
    // Check available state managers
    console.log('Available State Managers:');
    console.log(`  enhancedStateManager: ${!!window.enhancedStateManager}`);
    console.log(`  stateManager: ${!!window.stateManager}`);
    console.log(`  legacy state: ${!!window.state}`);
    
    // Check components in each
    if (window.enhancedStateManager) {
        try {
            const state = window.enhancedStateManager.getState();
            const componentIds = Object.keys(state.components || {});
            console.log(`  Enhanced components (${componentIds.length}):`, componentIds);
        } catch (e) {
            console.log('  Enhanced state error:', e.message);
        }
    }
    
    if (window.stateManager) {
        try {
            const state = window.stateManager.getState();
            const componentIds = Object.keys(state.components || {});
            console.log(`  Regular components (${componentIds.length}):`, componentIds);
        } catch (e) {
            console.log('  Regular state error:', e.message);
        }
    }
    
    if (window.state) {
        const componentIds = Object.keys(window.state.components || {});
        console.log(`  Legacy components (${componentIds.length}):`, componentIds);
    }
    
    // Test the design panel's getComponent method
    const components = document.querySelectorAll('[data-component-id]');
    if (components.length > 0) {
        const firstComponentId = components[0].getAttribute('data-component-id');
        console.log(`\\nTesting design panel with component: ${firstComponentId}`);
        
        if (window.designPanel && typeof window.designPanel.getComponent === 'function') {
            const component = window.designPanel.getComponent(firstComponentId);
            console.log('Design panel found component:', !!component);
            if (component) {
                console.log('Component type:', component.type);
                console.log('Component props:', Object.keys(component.props || component.data || {}));
            }
        } else {
            console.log('Design panel getComponent method not available');
        }
    }
    
    console.log('\\n🎯 Try clicking a component now - it should load properly!');
};

// Auto-run the test
testStateManagerFix();
