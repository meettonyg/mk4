/**
 * Enhanced System Test Script
 * Copy and paste this into the console after page reload
 */

(function() {
    console.clear();
    console.log('%c🚀 Enhanced Media Kit Builder Test', 'color: #0ea5e9; font-size: 20px; font-weight: bold');
    console.log('%c══════════════════════════════════════════', 'color: #64748b');
    
    // Wait a moment for initialization
    setTimeout(() => {
        // Check what system is loaded
        console.log('\n%c📋 System Check:', 'color: #8b5cf6; font-weight: bold');
        
        const checks = [
            {
                name: 'Feature Flags',
                test: () => window.mediaKitFeatures !== undefined,
                details: () => window.mediaKitFeatures?.FEATURES
            },
            {
                name: 'Enhanced State Manager',
                test: () => window.enhancedStateManager !== undefined,
                details: () => window.stateManager === window.enhancedStateManager ? '✅ Active' : '❌ Not active'
            },
            {
                name: 'Enhanced Component Manager',
                test: () => window.enhancedComponentManager !== undefined,
                details: () => window.componentManager === window.enhancedComponentManager ? '✅ Active' : '❌ Not active'
            },
            {
                name: 'Enhanced Component Renderer',
                test: () => window.enhancedComponentRenderer !== undefined,
                details: () => window.componentRenderer === window.enhancedComponentRenderer ? '✅ Active' : '❌ Not active'
            },
            {
                name: 'Batch Updates',
                test: () => window.stateManager?.batchUpdate !== undefined,
                details: () => typeof window.stateManager?.batchUpdate
            },
            {
                name: 'Pending Actions',
                test: () => window.stateManager?.setPendingAction !== undefined,
                details: () => window.stateManager?.pendingActions?.size || 0
            }
        ];
        
        let score = 0;
        checks.forEach(check => {
            const passed = check.test();
            console.log(`${passed ? '✅' : '❌'} ${check.name}${check.details && passed ? ' - ' + check.details() : ''}`);
            if (passed) score++;
        });
        
        console.log(`\n📊 Score: ${score}/${checks.length}`);
        
        // Enhanced features test
        if (score === checks.length) {
            console.log('\n%c✅ Enhanced system is active!', 'color: #10b981; font-size: 16px; font-weight: bold');
            
            // Quick feature tests
            console.log('\n%c🧪 Testing Enhanced Features:', 'color: #8b5cf6; font-weight: bold');
            
            // Test 1: Pending Actions
            console.log('\nTest 1: Pending Actions');
            window.stateManager.setPendingAction('test', 'component-123');
            console.log(`Set pending action: ${window.stateManager.isPendingAction('test', 'component-123') ? '✅ Success' : '❌ Failed'}`);
            
            // Test 2: Component Meta
            console.log('\nTest 2: Component Meta');
            const testId = 'test-' + Date.now();
            window.stateManager.initComponent(testId, 'test', {});
            window.stateManager.updateComponentMeta(testId, { isDeleting: true });
            const comp = window.stateManager.getComponent(testId);
            console.log(`Component meta: ${comp?.meta?.isDeleting ? '✅ Success' : '❌ Failed'}`);
            window.stateManager.removeComponent(testId);
            
            // Test 3: Batch Update
            console.log('\nTest 3: Batch Update');
            let notifyCount = 0;
            const unsub = window.stateManager.subscribeGlobal(() => notifyCount++);
            
            window.stateManager.batchUpdate(async () => {
                for (let i = 0; i < 3; i++) {
                    window.stateManager.initComponent(`batch-${i}`, 'test', {}, true);
                }
            }).then(() => {
                console.log(`Batch update notifications: ${notifyCount === 1 ? '✅ Success (1 notification)' : '❌ Failed (' + notifyCount + ' notifications)'}`);
                unsub();
                
                // Cleanup
                for (let i = 0; i < 3; i++) {
                    window.stateManager.removeComponent(`batch-${i}`);
                }
            });
            
        } else {
            console.log('\n%c⚠️ Enhanced system not fully active', 'color: #f59e0b; font-size: 16px; font-weight: bold');
            console.log('The page may still be using the legacy system.');
            console.log('\nTry refreshing the page or check the console for errors.');
        }
        
        // Show debug info
        console.log('\n%c🔍 Debug Info:', 'color: #8b5cf6; font-weight: bold');
        console.log('Use gmkbDebug.checkEnhanced() to verify enhanced systems');
        console.log('Use gmkbDebug.getManagers() to see all available managers');
        
    }, 1000);
    
})();