/**
 * Component Registry Shim
 * Ensures GMKBComponentRegistry is always available, even before the main registry loads
 * This prevents "register is not a function" errors in bundled code
 */

(function() {
    'use strict';
    
    // ROOT FIX: Create a queue for early registration attempts
    const earlyRegistrations = [];
    
    // Create a temporary registry object with register method
    const shimRegistry = {
        register: function(type, component) {
            // Queue the registration for when the real registry is ready
            earlyRegistrations.push({ type, component });
            
            if (window.gmkbData?.debugMode) {
                console.log(`📦 Registry Shim: Queued registration for '${type}'`);
            }
            
            return true;
        },
        
        // Stub other methods to prevent errors
        get: function() { return null; },
        getRenderer: function() { return null; },
        getEditor: function() { return null; },
        has: function() { return false; },
        getTypes: function() { return []; },
        getAll: function() { return {}; },
        clear: function() { },
        init: function() { }
    };
    
    // Only install shim if registry doesn't exist yet
    if (typeof window.GMKBComponentRegistry === 'undefined') {
        window.GMKBComponentRegistry = shimRegistry;
        
        if (window.gmkbData?.debugMode) {
            console.log('🔧 Component Registry Shim: Installed temporary registry');
        }
    }
    
    // Listen for the real registry to be ready
    document.addEventListener('gmkb:component-registry-ready', function() {
        // Process any queued registrations
        if (earlyRegistrations.length > 0) {
            const realRegistry = window.GMKBComponentRegistry;
            
            if (realRegistry && typeof realRegistry.register === 'function') {
                earlyRegistrations.forEach(function(item) {
                    realRegistry.register(item.type, item.component);
                });
                
                if (window.gmkbData?.debugMode) {
                    console.log(`✅ Registry Shim: Processed ${earlyRegistrations.length} queued registrations`);
                }
                
                // Clear the queue
                earlyRegistrations.length = 0;
            }
        }
    });
    
    // ROOT FIX: Event-driven fallback without polling
    // Override the shimRegistry when real registry loads
    Object.defineProperty(window, 'GMKBComponentRegistry', {
        get: function() {
            return shimRegistry;
        },
        set: function(newRegistry) {
            // When the real registry is set, process queued registrations
            if (newRegistry && newRegistry !== shimRegistry && 
                typeof newRegistry.register === 'function') {
                
                // Process any queued registrations
                if (earlyRegistrations.length > 0) {
                    earlyRegistrations.forEach(function(item) {
                        newRegistry.register(item.type, item.component);
                    });
                    
                    if (window.gmkbData?.debugMode) {
                        console.log(`✅ Registry Shim: Processed ${earlyRegistrations.length} queued registrations via setter`);
                    }
                    
                    earlyRegistrations.length = 0;
                }
                
                // Remove the property descriptor and set the real registry
                delete window.GMKBComponentRegistry;
                window.GMKBComponentRegistry = newRegistry;
            }
        },
        configurable: true,
        enumerable: true
    });
    
})();