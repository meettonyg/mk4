/**
 * Component Library Bridge
 * Bridges Vue component library with legacy buttons
 * 
 * This file is optional - the Vue bundle handles its own component library
 * This is only for backwards compatibility with legacy UI elements
 */

(function() {
    'use strict';
    
    // Wait for Vue app to be ready
    const checkVueApp = setInterval(() => {
        if (window.gmkbVueApp || window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
            clearInterval(checkVueApp);
            initBridge();
        }
    }, 100);
    
    // Timeout after 5 seconds
    setTimeout(() => {
        clearInterval(checkVueApp);
        console.warn('Component Library Bridge: Vue app not detected, bridge disabled');
    }, 5000);
    
    function initBridge() {
        console.log('✅ Component Library Bridge initialized');
        
        // Bridge functions for legacy buttons to trigger Vue component library
        window.gmkbBridge = {
            openComponentLibrary: () => {
                // Dispatch event that Vue can listen to
                window.dispatchEvent(new CustomEvent('gmkb:open-component-library'));
            },
            
            addComponent: (type) => {
                window.dispatchEvent(new CustomEvent('gmkb:add-component', {
                    detail: { type }
                }));
            }
        };
        
        // Listen for legacy button clicks
        document.addEventListener('click', (e) => {
            // Add Component button
            if (e.target.matches('[data-action="add-component"], .add-component-btn')) {
                e.preventDefault();
                window.gmkbBridge?.openComponentLibrary();
            }
        });
    }
})();
