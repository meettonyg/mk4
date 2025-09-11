/**
 * ROOT FIX: Force Component Manager Initialization
 * This file ensures the Enhanced Component Manager initializes properly
 */

(function() {
    'use strict';
    
    console.log('🔧 ROOT FIX: Component Manager Force Init starting...');
    
    // Function to force initialize the component manager
    const forceInitComponentManager = () => {
        // Check if component manager exists but isn't initialized
        if (window.enhancedComponentManager && !window.enhancedComponentManager.isInitialized) {
            console.log('🔧 ROOT FIX: Found uninitialized component manager, forcing init...');
            
            try {
                // Check if state manager is available
                if (window.enhancedStateManager && typeof window.enhancedStateManager.getState === 'function') {
                    console.log('🔧 ROOT FIX: State manager available, initializing component manager...');
                    
                    // Force initialization
                    window.enhancedComponentManager.initialize();
                    
                    console.log('✅ ROOT FIX: Component manager force initialized successfully!');
                    
                    // Dispatch ready event
                    document.dispatchEvent(new CustomEvent('gmkb:component-manager-ready', {
                        detail: {
                            componentManager: window.enhancedComponentManager,
                            forcedInit: true,
                            timestamp: Date.now()
                        }
                    }));
                    
                    // Update core systems coordinator if available
                    if (window.coreSystemsCoordinator) {
                        window.coreSystemsCoordinator.checkSystemReadiness();
                    }
                    
                    return true;
                } else {
                    console.log('⏳ ROOT FIX: State manager not ready yet, will retry...');
                    return false;
                }
            } catch (error) {
                console.error('❌ ROOT FIX: Error initializing component manager:', error);
                return false;
            }
        } else if (window.enhancedComponentManager && window.enhancedComponentManager.isInitialized) {
            console.log('✅ ROOT FIX: Component manager already initialized');
            return true;
        } else {
            console.log('⏳ ROOT FIX: Component manager not found yet');
            return false;
        }
    };
    
    // Try to initialize immediately
    forceInitComponentManager();
    
    // Listen for state manager ready event
    document.addEventListener('gmkb:state-manager-ready', () => {
        console.log('🔧 ROOT FIX: State manager ready event received');
        forceInitComponentManager();
    });
    
    // Listen for core systems ready event
    document.addEventListener('gmkb:core-systems-ready', () => {
        console.log('🔧 ROOT FIX: Core systems ready event received');
        if (!window.enhancedComponentManager?.isInitialized) {
            forceInitComponentManager();
        }
    });
    
    // Also try on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                if (!window.enhancedComponentManager?.isInitialized) {
                    console.log('🔧 ROOT FIX: Trying after DOM ready...');
                    forceInitComponentManager();
                }
            }, 100);
        });
    } else {
        // DOM already loaded, try after a short delay
        setTimeout(() => {
            if (!window.enhancedComponentManager?.isInitialized) {
                console.log('🔧 ROOT FIX: Trying after delay...');
                forceInitComponentManager();
            }
        }, 100);
    }
    
    // Retry mechanism with exponential backoff
    let retryCount = 0;
    const maxRetries = 10;
    
    const retryInit = () => {
        if (retryCount >= maxRetries) {
            console.error('❌ ROOT FIX: Max retries reached for component manager init');
            return;
        }
        
        if (!window.enhancedComponentManager?.isInitialized) {
            const success = forceInitComponentManager();
            if (!success) {
                retryCount++;
                const delay = Math.min(100 * Math.pow(2, retryCount), 5000);
                console.log(`🔧 ROOT FIX: Retry ${retryCount}/${maxRetries} in ${delay}ms...`);
                setTimeout(retryInit, delay);
            }
        }
    };
    
    // Start retry mechanism after initial delay
    setTimeout(retryInit, 200);
    
    // Also expose a manual init function for debugging
    window.forceInitComponentManager = forceInitComponentManager;
    
    console.log('🔧 ROOT FIX: Component Manager Force Init script loaded');
    console.log('🔧 ROOT FIX: Run window.forceInitComponentManager() to manually initialize');
    
})();
