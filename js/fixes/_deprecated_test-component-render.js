/**
 * Component Render Test Script
 * Quick test to verify component rendering, duplication, and deletion are working
 */

console.log('%c=== Media Kit Builder Component Render Test ===', 'color: #00bcd4; font-weight: bold; font-size: 14px');

// Test 1: Check if render fix is loaded
console.group('Test 1: Render Fix Status');
if (window.componentRenderFix && window.componentRenderFix.initialized) {
    console.log('✅ Component Render Fix is loaded and initialized');
} else {
    console.error('❌ Component Render Fix is NOT loaded');
}
console.groupEnd();

// Test 2: Check state/DOM sync
console.group('Test 2: State/DOM Synchronization');
if (window.mkDiag && window.mkDiag.state) {
    const synced = window.mkDiag.state();
    if (synced) {
        console.log('✅ State and DOM are synchronized');
    } else {
        console.warn('⚠️ State and DOM are NOT synchronized');
        console.log('Running auto-fix...');
        window.mkDiag.checkSync();
    }
} else {
    console.log('Checking manually...');
    const state = window.enhancedStateManager?.getState();
    const stateCount = Object.keys(state?.components || {}).length;
    const domCount = document.querySelectorAll('[data-component-id]').length;
    console.log(`State components: ${stateCount}, DOM components: ${domCount}`);
    if (stateCount !== domCount) {
        console.warn('⚠️ Mismatch detected!');
    }
}
console.groupEnd();

// Test 3: Component duplication test
console.group('Test 3: Component Duplication');
async function testDuplication() {
    const components = document.querySelectorAll('[data-component-id]');
    if (components.length === 0) {
        console.log('No components to test. Adding a test component...');
        
        // Add a test hero component
        if (window.enhancedComponentManager) {
            const componentId = await window.enhancedComponentManager.addComponent('hero');
            console.log(`Added test component: ${componentId}`);
            
            // Wait for render
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    
    // Try to duplicate the first component
    const firstComponent = document.querySelector('[data-component-id]');
    if (firstComponent) {
        const componentId = firstComponent.getAttribute('data-component-id');
        console.log(`Duplicating component: ${componentId}`);
        
        const initialCount = document.querySelectorAll('[data-component-id]').length;
        
        // Trigger duplication
        if (window.enhancedComponentManager) {
            await window.enhancedComponentManager.duplicateComponent(componentId);
            
            // Wait for render
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const newCount = document.querySelectorAll('[data-component-id]').length;
            
            if (newCount > initialCount) {
                console.log('✅ Component duplicated successfully');
                console.log(`Components: ${initialCount} → ${newCount}`);
            } else {
                console.error('❌ Component duplication failed');
                console.log('Attempting recovery...');
                if (window.mkDiag) {
                    await window.mkDiag.recover();
                }
            }
        }
    }
}

// Run duplication test
testDuplication().then(() => {
    console.groupEnd();
    
    // Test 4: Component deletion test
    console.group('Test 4: Component Deletion');
    const components = document.querySelectorAll('[data-component-id]');
    if (components.length > 1) {
        const lastComponent = components[components.length - 1];
        const componentId = lastComponent.getAttribute('data-component-id');
        console.log(`Deleting component: ${componentId}`);
        
        const initialCount = components.length;
        
        // Trigger deletion
        if (window.enhancedComponentManager) {
            window.enhancedComponentManager.removeComponent(componentId).then(() => {
                // Wait for animation
                setTimeout(() => {
                    const newCount = document.querySelectorAll('[data-component-id]').length;
                    
                    if (newCount < initialCount) {
                        console.log('✅ Component deleted successfully');
                        console.log(`Components: ${initialCount} → ${newCount}`);
                    } else {
                        console.error('❌ Component deletion failed');
                    }
                    
                    console.groupEnd();
                    
                    // Final summary
                    console.group('Summary');
                    console.log('Test complete. Diagnostics available via:');
                    console.log('- window.mkDiag.state() - Check state/DOM sync');
                    console.log('- window.mkDiag.recover() - Recover missing components');
                    console.log('- window.mkDiag.checkSync() - Force sync check');
                    console.log('- window.mkDiag.forceRender() - Force re-render all');
                    console.groupEnd();
                }, 400);
            });
        }
    } else {
        console.log('Not enough components to test deletion');
        console.groupEnd();
    }
}).catch(error => {
    console.error('Test failed:', error);
    console.groupEnd();
});
