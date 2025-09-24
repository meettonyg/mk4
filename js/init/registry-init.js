/**
 * Component Registry Initialization
 * Ensures component registry is properly set up for the Media Kit Builder
 */

(function() {
  'use strict';
  
  // Wait for DOM ready
  function initializeRegistry() {
    console.log('[ComponentRegistry Init] Checking registry status...');
    
    // Check if registry exists
    if (window.gmkbComponentRegistry) {
      console.log('[ComponentRegistry Init] Registry found, checking API...');
      
      // Log available methods
      const methods = Object.keys(window.gmkbComponentRegistry).filter(key => 
        typeof window.gmkbComponentRegistry[key] === 'function'
      );
      console.log('[ComponentRegistry Init] Available methods:', methods);
      
      // Create adapter if not exists
      if (!window.gmkbComponentRegistryAdapter) {
        // Import the adapter class if needed
        if (!window.ComponentRegistryAdapter) {
          console.warn('[ComponentRegistry Init] Adapter class not found, creating minimal adapter...');
          
          // Create inline adapter
          window.gmkbComponentRegistryAdapter = {
            getComponent: function(type) {
              if (typeof window.gmkbComponentRegistry.get === 'function') {
                return window.gmkbComponentRegistry.get(type);
              }
              return null;
            },
            getAllComponents: function() {
              if (typeof window.gmkbComponentRegistry.getAll === 'function') {
                return window.gmkbComponentRegistry.getAll();
              }
              return [];
            },
            hasComponent: function(type) {
              if (typeof window.gmkbComponentRegistry.has === 'function') {
                return window.gmkbComponentRegistry.has(type);
              }
              return false;
            },
            getDefaultProps: function(type) {
              const component = this.getComponent(type);
              if (!component) return {};
              
              const schema = component.schema || component.dataSchema || {};
              const defaults = {};
              
              if (schema.properties) {
                Object.keys(schema.properties).forEach(key => {
                  const prop = schema.properties[key];
                  if (prop.hasOwnProperty('default')) {
                    defaults[key] = prop.default;
                  }
                });
              }
              
              return defaults;
            }
          };
          
          console.log('[ComponentRegistry Init] Created inline adapter');
        }
      }
      
      // Make adapter available globally
      if (window.gmkbComponentRegistryAdapter) {
        // Add convenience methods to window for debugging
        window.getComponent = function(type) {
          return window.gmkbComponentRegistryAdapter.getComponent(type);
        };
        
        window.getAllComponents = function() {
          return window.gmkbComponentRegistryAdapter.getAllComponents();
        };
        
        console.log('[ComponentRegistry Init] ✅ Registry adapter ready');
        console.log('[ComponentRegistry Init] Available components:', window.gmkbComponentRegistryAdapter.getAllComponents().length);
        
        // Dispatch ready event
        window.dispatchEvent(new CustomEvent('gmkb:registry-adapter-ready', {
          detail: {
            componentCount: window.gmkbComponentRegistryAdapter.getAllComponents().length
          }
        }));
      }
    } else {
      console.warn('[ComponentRegistry Init] Registry not found, will retry...');
      
      // Retry after a short delay
      setTimeout(initializeRegistry, 100);
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeRegistry);
  } else {
    // DOM already loaded
    initializeRegistry();
  }
  
  // Also listen for registry ready event
  window.addEventListener('gmkb:component-registry-ready', initializeRegistry);
  
})();
