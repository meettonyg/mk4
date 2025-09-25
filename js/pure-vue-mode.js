/**
 * Pure Vue Mode - Disables all legacy rendering systems
 * This file ensures that ONLY Vue handles component rendering
 * Used as a safety mechanism to prevent dual rendering
 */

(function() {
    'use strict';
    
    console.log('🚀 GMKB: Pure Vue Mode Active - Disabling legacy rendering systems');
    
    // Mark that Vue mode is active
    window.GMKB_PURE_VUE_MODE = true;
    
    // Disable legacy component managers if they exist
    if (window.enhancedComponentManager) {
        const originalRender = window.enhancedComponentManager.renderComponent;
        window.enhancedComponentManager.renderComponent = function() {
            console.log('Legacy rendering blocked - Vue handles all rendering');
            return null;
        };
        window.enhancedComponentManager._legacyDisabled = true;
    }
    
    // Disable legacy ComponentRenderer
    if (window.ComponentRenderer) {
        window.ComponentRenderer = {
            render: () => console.log('Legacy ComponentRenderer disabled - Vue active'),
            _legacyDisabled: true
        };
    }
    
    // Disable legacy state managers
    if (window.stateManager && window.stateManager !== window.gmkbStore) {
        if (window.stateManager.render) {
            window.stateManager.render = () => {};
        }
        if (window.stateManager.renderComponents) {
            window.stateManager.renderComponents = () => {};
        }
        window.stateManager._legacyDisabled = true;
    }
    
    // Override Renderer.js if it loads
    if (window.Renderer) {
        window.Renderer = {
            render: () => console.log('Legacy Renderer disabled - Vue active'),
            _legacyDisabled: true
        };
    }
    
    // Prevent legacy component rendering on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        // Remove legacy containers
        const legacySelectors = [
            '#empty-state:not(.vue-managed)',
            '#saved-components-container:not(.vue-managed)',
            '.gmkb-component-wrapper:not(.vue-component)',
            '.saved-components:not(.vue-managed)'
        ];
        
        legacySelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                console.log('Removing legacy element:', selector);
                el.remove();
            });
        });
    });
    
    // Listen for any attempts to render legacy components
    document.addEventListener('gmkb:component:render', function(e) {
        if (!e.detail?.vueManaged) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Blocked legacy component render event');
        }
    });
    
    // Mark DOM as Vue-controlled
    document.documentElement.setAttribute('data-gmkb-mode', 'vue');
    
    console.log('✅ GMKB: Legacy rendering systems disabled');
    
})();