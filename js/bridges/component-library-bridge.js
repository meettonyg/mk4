/**
 * WordPress-Vue Component Library Bridge
 * Architecture-compliant: Event-driven, no polling
 */

(function() {
    'use strict';
    
    console.log('🚀 Initializing Component Library Bridge');
    
    // Wait for DOM ready
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }
    
    // Create bridge object
    window.gmkbBridge = window.gmkbBridge || {};
    
    // Bridge API
    window.gmkbBridge.componentLibrary = {
        // Open component library
        open: function(config) {
            console.log('Bridge: Opening component library', config);
            
            // Dispatch event for Vue to handle
            document.dispatchEvent(new CustomEvent('gmkb:open-component-library', {
                detail: config || {}
            }));
        },
        
        // Add component directly
        addComponent: function(type, data) {
            console.log('Bridge: Adding component', type, data);
            
            // Check if Vue store is available
            if (window.gmkbStore && typeof window.gmkbStore.addComponent === 'function') {
                window.gmkbStore.addComponent({ type: type, ...data });
                return true;
            }
            
            // Fallback: dispatch event
            document.dispatchEvent(new CustomEvent('gmkb:add-component', {
                detail: { type: type, data: data }
            }));
            
            return false;
        },
        
        // Check if bridge is ready
        isReady: function() {
            return window.gmkbStore && window.gmkbApp;
        }
    };
    
    // Setup button event delegation
    function setupEventDelegation() {
        console.log('Setting up event delegation for component library buttons');
        
        // Handle all "Add Component" buttons
        document.body.addEventListener('click', function(e) {
            // Check if clicked element is an add component button
            const button = e.target.closest('#add-component-btn, #add-first-component, [data-action="add-component"]');
            
            if (button) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Add component button clicked');
                window.gmkbBridge.componentLibrary.open();
            }
            
            // Handle sidebar component items
            const componentItem = e.target.closest('.component-item[data-component]');
            if (componentItem) {
                const type = componentItem.dataset.component;
                console.log('Sidebar component clicked:', type);
                
                // Prevent if already processed
                if (e.defaultPrevented) return;
                
                e.preventDefault();
                window.gmkbBridge.componentLibrary.addComponent(type);
            }
        });
    }
    
    // Initialize
    ready(function() {
        setupEventDelegation();
        
        // Global API
        window.openComponentLibrary = function() {
            window.gmkbBridge.componentLibrary.open();
        };
        
        // Dispatch bridge ready event
        console.log('✅ Component Library Bridge ready');
        document.dispatchEvent(new CustomEvent('gmkb:bridge:ready', {
            detail: { module: 'componentLibrary' }
        }));
    });
})();
