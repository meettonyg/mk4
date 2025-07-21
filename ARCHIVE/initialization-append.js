
    // Store the systems globally for debugging and external access
    window.GMKB = Object.freeze(GMKB);
    window.StateManager = StateManager;
    window.ComponentManager = ComponentManager;
    
    console.log('✅ GMKB: Systems registered globally for debugging');
    
    /**
     * ROOT FIX: Initialize the streamlined UICoordinator system on DOM ready
     * This is the SINGLE, CORRECT initialization entry point
     */
    function initializeGMKBSystems() {
        console.log('%c🚀 GMKB: Starting streamlined initialization...', 'font-weight: bold; color: #2563eb; background: #eff6ff; padding: 4px 8px; border-radius: 4px;');
        
        try {
            // Initialize global action listeners first
            GMKB.initializeGlobalActionListeners();
            
            // Initialize UICoordinator (this handles StateManager and ComponentManager initialization)
            UICoordinator.init();
            
            console.log('%c✅ GMKB: Streamlined initialization complete', 'font-weight: bold; color: #10b981; background: #f0fdf4; padding: 4px 8px; border-radius: 4px;');
        } catch (error) {
            console.error('%c❌ GMKB: Initialization failed:', 'font-weight: bold; color: #ef4444; background: #fef2f2; padding: 4px 8px; border-radius: 4px;', error);
        }
    }
    
    // ROOT FIX: Single DOMContentLoaded listener for streamlined initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('📄 DOM ready - starting streamlined GMKB initialization...');
            initializeGMKBSystems();
        });
    } else {
        // DOM already loaded
        console.log('📄 DOM already ready - starting streamlined GMKB initialization...');
        initializeGMKBSystems();
    }
    
})();

console.log('%c🎯 GMKB main.js LOADED SUCCESSFULLY (VANILLA JS)', 'font-weight: bold; color: #059669; background: #f0fdf4; padding: 4px 8px; border-radius: 4px;');