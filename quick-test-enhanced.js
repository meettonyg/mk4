/**
 * Quick Test Script for Enhanced System
 * Copy and paste this into console after page reload
 */

// Quick test - paste this into console
(function() {
    console.clear();
    console.log('%c🚀 Enhanced System Quick Test', 'color: #0ea5e9; font-size: 18px');
    
    // Wait for initialization
    setTimeout(() => {
        // Check what's loaded
        const checks = {
            'Feature Flags': !!window.mediaKitFeatures,
            'Enhanced State': window.stateManager === window.enhancedStateManager,
            'Enhanced Components': window.componentManager === window.enhancedComponentManager,
            'Enhanced Renderer': window.componentRenderer === window.enhancedComponentRenderer,
            'Batch Updates': typeof window.stateManager?.batchUpdate === 'function',
            'Pending Actions': typeof window.stateManager?.setPendingAction === 'function'
        };
        
        console.log('\n📊 System Status:');
        Object.entries(checks).forEach(([name, status]) => {
            console.log(`${status ? '✅' : '❌'} ${name}`);
        });
        
        // Test enhanced features if available
        if (window.stateManager?.setPendingAction) {
            console.log('\n🧪 Testing Enhanced Features:');
            
            // Test 1: Add component
            window.componentManager.addComponent('hero').then(id => {
                console.log('✅ Component added:', id);
                
                // Test 2: Check meta
                const comp = window.stateManager.getComponent(id);
                console.log('✅ Has meta:', !!comp?.meta);
                
                // Test 3: Rapid click prevention
                console.log('\n🔨 Testing rapid click prevention...');
                for(let i = 0; i < 3; i++) {
                    window.componentManager.handleControlAction('×', id);
                }
                
                setTimeout(() => {
                    const stillExists = !!window.stateManager.getComponent(id);
                    console.log(stillExists ? '❌ Component still exists (good - prevented duplicate deletes)' : '✅ Component deleted');
                }, 1000);
            });
        }
        
    }, 1500);
})();