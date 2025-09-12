/**
 * Force Initialization Script
 * 
 * This script forces initialization of critical managers when they fail to auto-initialize
 * Uses a simple, WordPress-compatible approach
 */

(function() {
    'use strict';
    
    console.log('🚨 Force Init: Starting critical system initialization...');
    
    // Wait for dependencies
    let attempts = 0;
    const maxAttempts = 20;
    
    function tryInit() {
        attempts++;
        
        if (attempts > maxAttempts) {
            console.error('❌ Force Init: Max attempts reached, giving up');
            return;
        }
        
        // Check if state manager exists (our primary dependency)
        if (!window.enhancedStateManager) {
            console.log('⏳ Force Init: Waiting for state manager... (attempt ' + attempts + ')');
            setTimeout(tryInit, 250);
            return;
        }
        
        console.log('✅ Force Init: State manager found, initializing managers...');
        
        // Initialize Component Manager
        if (!window.enhancedComponentManager && typeof EnhancedComponentManager !== 'undefined') {
            try {
                window.enhancedComponentManager = new EnhancedComponentManager();
                console.log('✅ Force Init: Component Manager created');
            } catch (e) {
                console.error('❌ Force Init: Failed to create Component Manager:', e);
            }
        }
        
        // Initialize Renderer
        if (!window.enhancedComponentRenderer && typeof SimplifiedComponentRenderer !== 'undefined') {
            try {
                window.enhancedComponentRenderer = new SimplifiedComponentRenderer();
                console.log('✅ Force Init: Component Renderer created');
            } catch (e) {
                console.error('❌ Force Init: Failed to create Renderer:', e);
            }
        }
        
        // Initialize Section Manager
        if (!window.sectionLayoutManager && typeof SectionLayoutManager !== 'undefined') {
            try {
                window.sectionLayoutManager = new SectionLayoutManager();
                console.log('✅ Force Init: Section Manager created');
            } catch (e) {
                console.error('❌ Force Init: Failed to create Section Manager:', e);
            }
        }
        
        // Initialize Section Renderer
        if (!window.sectionRenderer && typeof SectionRenderer !== 'undefined') {
            try {
                window.sectionRenderer = new SectionRenderer();
                console.log('✅ Force Init: Section Renderer created');
            } catch (e) {
                console.error('❌ Force Init: Failed to create Section Renderer:', e);
            }
        }
        
        // Check if we succeeded
        setTimeout(() => {
            const success = !!(window.enhancedComponentManager && window.enhancedComponentRenderer);
            
            if (success) {
                console.log('🎉 Force Init: All critical systems initialized!');
                
                // Notify coordinator
                if (window.coreSystemsCoordinator) {
                    window.coreSystemsCoordinator.checkSystemReadiness(true);
                }
                
                // Try to render existing components
                if (window.enhancedComponentRenderer && window.enhancedComponentRenderer.renderAllComponents) {
                    window.enhancedComponentRenderer.renderAllComponents();
                }
            } else {
                console.warn('⚠️ Force Init: Some systems still missing, may need manual initialization');
            }
        }, 100);
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInit);
    } else {
        setTimeout(tryInit, 100);
    }
})();
