/**
 * Test script to diagnose and fix component move issues
 */

// Function to test component movement
window.testComponentMove = function() {
    console.group('🔧 Testing Component Move Functionality');
    
    // Get current state
    const state = window.enhancedStateManager.getState();
    console.log('Current state:', state);
    console.log('Current layout:', state.layout);
    console.log('Components in state:', Object.keys(state.components));
    
    // Check DOM state
    const savedContainer = document.getElementById('saved-components-container');
    const previewContainer = document.getElementById('media-kit-preview');
    
    console.log('Saved container exists:', !!savedContainer);
    console.log('Saved container children:', savedContainer ? savedContainer.children.length : 0);
    console.log('Preview container exists:', !!previewContainer);
    console.log('Preview container children:', previewContainer ? previewContainer.children.length : 0);
    
    // Check which container has components
    const componentsInDOM = document.querySelectorAll('[data-component-id]');
    console.log('Total components in DOM:', componentsInDOM.length);
    
    if (componentsInDOM.length > 0) {
        console.log('Components are in:', componentsInDOM[0].parentElement.id || componentsInDOM[0].parentElement.className);
        
        // List component IDs and their positions
        componentsInDOM.forEach((comp, index) => {
            const id = comp.getAttribute('data-component-id') || comp.id;
            console.log(`Position ${index}: ${id}`);
        });
    }
    
    console.groupEnd();
};

// Function to manually trigger a move
window.manualMoveComponent = function(componentId, direction) {
    console.group(`🚀 Manually moving component ${componentId} ${direction}`);
    
    // Check if component exists
    const component = document.querySelector(`[data-component-id="${componentId}"], #${componentId}`);
    if (!component) {
        console.error('Component not found in DOM:', componentId);
        console.groupEnd();
        return;
    }
    
    console.log('Component found:', component);
    console.log('Current parent:', component.parentElement.id || component.parentElement.className);
    
    // Trigger state change
    console.log('Triggering state manager moveComponent...');
    window.enhancedStateManager.moveComponent(componentId, direction);
    
    // Check new state
    setTimeout(() => {
        const newState = window.enhancedStateManager.getState();
        console.log('New layout after move:', newState.layout);
        
        // Check DOM
        const movedComponent = document.querySelector(`[data-component-id="${componentId}"], #${componentId}`);
        if (movedComponent) {
            const siblings = Array.from(movedComponent.parentElement.children);
            const newIndex = siblings.indexOf(movedComponent);
            console.log('Component new position in DOM:', newIndex);
        }
        
        console.groupEnd();
    }, 500);
};

// Function to force reorder
window.forceReorderComponents = function() {
    console.group('🔄 Forcing component reorder');
    
    const state = window.enhancedStateManager.getState();
    const layout = state.layout;
    
    console.log('Current layout:', layout);
    
    if (window.enhancedComponentRenderer && window.enhancedComponentRenderer.reorderComponents) {
        console.log('Calling reorderComponents directly...');
        window.enhancedComponentRenderer.reorderComponents(layout);
        console.log('Reorder complete');
    } else {
        console.error('Enhanced component renderer or reorderComponents method not available');
    }
    
    console.groupEnd();
};

// Function to diagnose render issues
window.diagnoseRenderIssues = function() {
    console.group('🔍 Diagnosing Render Issues');
    
    // Check renderer state
    if (window.enhancedComponentRenderer) {
        console.log('Renderer initialized:', window.enhancedComponentRenderer.initialized);
        console.log('Renderer stats:', window.enhancedComponentRenderer.getStats());
        console.log('Is currently rendering:', window.enhancedComponentRenderer.isCurrentlyRendering);
        console.log('Disable rendering flag:', window.enhancedComponentRenderer.disableRendering);
    } else {
        console.error('Enhanced component renderer not available');
    }
    
    // Check state manager
    if (window.enhancedStateManager) {
        console.log('State manager initialized:', window.enhancedStateManager.isInitialized);
        console.log('Is batching:', window.enhancedStateManager.isBatching);
        console.log('Is busy:', window.enhancedStateManager.isBusy());
    } else {
        console.error('Enhanced state manager not available');
    }
    
    // Check DOM render coordinator
    if (window.domRenderCoordinator) {
        console.log('DOM Render Coordinator initialized:', window.domRenderCoordinator.isInitialized);
    } else {
        console.warn('DOM Render Coordinator not available');
    }
    
    console.groupEnd();
};

// Auto-run diagnostics on load
if (document.readyState === 'complete') {
    setTimeout(() => {
        console.log('🚀 Component Move Test Script Loaded');
        console.log('Available commands:');
        console.log('- testComponentMove() : Check current component state');
        console.log('- manualMoveComponent(id, "up"|"down") : Manually move a component');
        console.log('- forceReorderComponents() : Force DOM reordering');
        console.log('- diagnoseRenderIssues() : Check renderer state');
        
        // Run initial test
        testComponentMove();
    }, 1000);
} else {
    window.addEventListener('load', () => {
        setTimeout(() => {
            console.log('🚀 Component Move Test Script Loaded');
            testComponentMove();
        }, 1000);
    });
}
