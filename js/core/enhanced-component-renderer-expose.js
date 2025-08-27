/**
 * @file enhanced-component-renderer-expose.js
 * @description ROOT FIX: Ensures EnhancedComponentRenderer is properly exposed globally
 * This file creates and exposes the global instance that CoreSystemsCoordinator needs
 */

(function() {
    'use strict';
    
    // Wait for DOM to be ready
    const initRenderer = () => {
        // Check if EnhancedComponentRenderer class exists
        if (typeof EnhancedComponentRenderer === 'undefined') {
            console.warn('EnhancedComponentRenderer class not found, retrying...');
            setTimeout(initRenderer, 100);
            return;
        }
        
        // Check if already exposed
        if (window.enhancedComponentRenderer) {
            console.log('✅ Enhanced Component Renderer: Already exposed globally');
            return;
        }
        
        try {
            // Create and expose the global instance
            const renderer = new EnhancedComponentRenderer();
            window.enhancedComponentRenderer = renderer;
            
            // Initialize the renderer
            if (renderer.init && typeof renderer.init === 'function') {
                renderer.init();
            }
            
            // Dispatch ready event for CoreSystemsCoordinator
            document.dispatchEvent(new CustomEvent('gmkb:component-renderer-ready', {
                detail: { 
                    renderer,
                    source: 'enhanced-component-renderer-expose'
                }
            }));
            
            console.log('✅ ROOT FIX: Enhanced Component Renderer exposed globally and initialized');
            
        } catch (error) {
            console.error('Failed to create EnhancedComponentRenderer:', error);
        }
    };
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRenderer);
    } else {
        // DOM is already ready
        initRenderer();
    }
    
})();
