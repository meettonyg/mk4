/**
 * Critical Script Loader
 * 
 * This ensures critical scripts load even if WordPress dependency chain fails
 * Architecture compliant: Event-driven, no polling
 */
(function() {
    'use strict';
    
    // Only run if critical systems are missing
    if (window.enhancedComponentManager && window.enhancedComponentRenderer) {
        console.log('✅ Critical systems already loaded');
        return;
    }
    
    console.log('🚨 Critical systems missing, initializing recovery...');
    
    // Wait for state manager which we know loads successfully
    function initializeCriticalSystems() {
        if (!window.enhancedStateManager) {
            console.log('⏳ Waiting for state manager...');
            setTimeout(initializeCriticalSystems, 100);
            return;
        }
        
        console.log('✅ State manager ready, loading critical systems...');
        
        // Load critical scripts in order
        const baseUrl = window.gmkbData?.pluginUrl || '/wp-content/plugins/guestify-media-kit-builder/';
        const scripts = [
            'js/core/enhanced-component-manager.js',
            'js/core/enhanced-component-renderer-simplified.js',
            'system/SectionLayoutManager.js', 
            'system/SectionRenderer.js'
        ];
        
        let loadIndex = 0;
        
        function loadNext() {
            if (loadIndex >= scripts.length) {
                console.log('✅ All critical scripts loaded');
                
                // Notify coordinator
                if (window.coreSystemsCoordinator) {
                    window.coreSystemsCoordinator.checkSystemReadiness(true);
                }
                
                // Load main.js if it exists and hasn't loaded
                if (!window.gmkbMainLoaded) {
                    const mainScript = document.createElement('script');
                    mainScript.src = baseUrl + 'js/main.js';
                    mainScript.onload = () => {
                        console.log('✅ Main.js loaded');
                        window.gmkbMainLoaded = true;
                    };
                    mainScript.onerror = () => console.warn('⚠️ Main.js failed to load, but critical systems are ready');
                    document.head.appendChild(mainScript);
                }
                return;
            }
            
            const script = document.createElement('script');
            script.src = baseUrl + scripts[loadIndex];
            script.onload = () => {
                console.log(`✅ Loaded: ${scripts[loadIndex]}`);
                loadIndex++;
                loadNext();
            };
            script.onerror = () => {
                console.error(`❌ Failed to load: ${scripts[loadIndex]}`);
                loadIndex++;
                loadNext(); // Continue with next script
            };
            document.head.appendChild(script);
        }
        
        loadNext();
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCriticalSystems);
    } else {
        initializeCriticalSystems();
    }
})();
