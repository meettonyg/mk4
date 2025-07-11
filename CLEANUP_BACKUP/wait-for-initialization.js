/**
 * @file wait-for-initialization.js
 * @description Utility to wait for Media Kit Builder initialization before running tests
 */

// Create a promise that resolves when all systems are ready
window.waitForInitialization = function(timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const checkSystems = () => {
            const elapsed = Date.now() - startTime;
            
            // Check for all critical systems
            const systemsReady = {
                enhancedComponentManager: !!window.enhancedComponentManager,
                enhancedStateManager: !!window.enhancedStateManager,
                mkcgDataMapper: !!window.mkcgDataMapper,
                guestifyData: !!window.guestifyData,
                stateManager: !!window.stateManager,
                componentManager: !!window.componentManager,
                testingFoundation: !!window.testingFoundation,
                implementationValidator: !!window.implementationValidator
            };
            
            // Count ready systems
            const readySystems = Object.values(systemsReady).filter(ready => ready).length;
            const totalSystems = Object.keys(systemsReady).length;
            
            console.log(`⏳ Waiting for initialization: ${readySystems}/${totalSystems} systems ready...`);
            
            // Check if critical systems are ready
            const criticalReady = systemsReady.enhancedComponentManager && 
                                systemsReady.enhancedStateManager && 
                                systemsReady.guestifyData;
            
            if (criticalReady) {
                console.log('✅ Critical systems ready!');
                resolve(systemsReady);
            } else if (elapsed > timeout) {
                console.warn('⚠️ Timeout waiting for initialization');
                reject(new Error(`Initialization timeout after ${timeout}ms. Ready systems: ${JSON.stringify(systemsReady)}`));
            } else {
                // Check again in 100ms
                setTimeout(checkSystems, 100);
            }
        };
        
        // Start checking
        checkSystems();
    });
};

// Listen for the mediaKitBuilderReady event as well
window.addEventListener('mediaKitBuilderReady', function(event) {
    console.log('🎉 Media Kit Builder Ready Event Received!', event.detail);
    window.mediaKitBuilderReady = true;
});

// Create a wrapper for safe test execution
window.runTestsWhenReady = async function(testFunction, testName = 'Test') {
    console.log(`🚀 Preparing to run ${testName}...`);
    
    try {
        // Wait for initialization
        await window.waitForInitialization();
        
        console.log(`✅ Systems ready, running ${testName}...`);
        
        // Run the test function
        const result = await testFunction();
        
        console.log(`✅ ${testName} completed successfully`);
        return result;
        
    } catch (error) {
        console.error(`❌ Failed to run ${testName}:`, error);
        return {
            error: error.message,
            status: 'FAILED'
        };
    }
};

// Expose a manual initialization trigger for testing
window.forceInitializeEnhancedComponentManager = function() {
    if (!window.enhancedComponentManager) {
        console.error('❌ Enhanced Component Manager not available to initialize');
        return false;
    }
    
    try {
        // Force initialization
        if (typeof window.enhancedComponentManager.forceInitialization === 'function') {
            const result = window.enhancedComponentManager.forceInitialization();
            console.log('✅ Forced initialization result:', result);
            return result;
        } else if (typeof window.enhancedComponentManager.init === 'function') {
            const result = window.enhancedComponentManager.init();
            console.log('✅ Init result:', result);
            return result;
        } else {
            console.error('❌ No initialization method available');
            return false;
        }
    } catch (error) {
        console.error('❌ Force initialization failed:', error);
        return false;
    }
};

console.log(`
🛠️ Initialization Utilities Ready!

Commands:
- await waitForInitialization()                    // Wait for all systems
- await runTestsWhenReady(testFn, 'Test Name')    // Run test when ready
- forceInitializeEnhancedComponentManager()        // Force init component manager

Example:
  await runTestsWhenReady(() => emergencyDiagnostic(), 'Emergency Diagnostic');
`);
