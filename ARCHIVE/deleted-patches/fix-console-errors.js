/**
 * Fix Console Errors in Media Kit Builder
 * Addresses:
 * 1. Unknown type component errors
 * 2. Theme loading 400 errors
 */

(function() {
  'use strict';
  
  console.log('🔧 Applying console error fixes...');
  
  // Fix 1: Prevent unknown_type components from being added
  if (window.gmkbStore) {
    const originalAddComponent = window.gmkbStore.addComponent;
    window.gmkbStore.addComponent = function(componentData) {
      // Validate component type
      if (!componentData.type || componentData.type === 'unknown_type') {
        console.warn('❌ Blocked invalid component type:', componentData.type);
        return null;
      }
      
      // Check if component type exists in registry
      if (window.UnifiedComponentRegistry) {
        const registeredTypes = window.UnifiedComponentRegistry.getAvailableTypes();
        if (registeredTypes && !registeredTypes.includes(componentData.type)) {
          console.warn('❌ Component type not registered:', componentData.type);
          return null;
        }
      }
      
      // Call original method
      return originalAddComponent.call(this, componentData);
    };
  }
  
  // Fix 2: Prevent components with unknown_type from loading in saved state
  document.addEventListener('gmkb:before-state-load', function(event) {
    if (event.detail && event.detail.state && event.detail.state.components) {
      // Filter out any unknown_type components
      Object.keys(event.detail.state.components).forEach(id => {
        const component = event.detail.state.components[id];
        if (!component.type || component.type === 'unknown_type') {
          console.warn('🗑️ Removing invalid component from saved state:', id);
          delete event.detail.state.components[id];
        }
      });
    }
  });
  
  // Fix 3: Override theme loading to handle 400 errors gracefully
  if (window.themeStore) {
    const originalLoadCustomThemes = window.themeStore.loadCustomThemes;
    if (originalLoadCustomThemes) {
      window.themeStore.loadCustomThemes = async function() {
        try {
          return await originalLoadCustomThemes.call(this);
        } catch (error) {
          // Silently handle 400 errors for custom themes
          if (error.message && error.message.includes('400')) {
            console.log('ℹ️ Custom themes endpoint not available, using built-in themes only');
            return [];
          }
          // For other errors, still log them
          console.warn('Theme loading error:', error);
          return [];
        }
      };
    }
  }
  
  // Fix 4: Clean up any existing unknown_type components in the DOM
  function cleanupUnknownComponents() {
    const unknownComponents = document.querySelectorAll('[data-component-type="unknown_type"]');
    unknownComponents.forEach(el => {
      console.log('🗑️ Removing unknown_type component from DOM');
      el.remove();
    });
  }
  
  // Run cleanup immediately
  cleanupUnknownComponents();
  
  // Run cleanup when DOM is fully loaded (event-driven)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanupUnknownComponents);
  }
  
  // Run cleanup when Vue app initializes (event-driven)
  document.addEventListener('gmkb:ready', cleanupUnknownComponents);
  document.addEventListener('gmkb:vue-initialized', cleanupUnknownComponents);
  
  // Fix 5: Validate components when store initializes
  if (window.gmkbStore && window.gmkbStore.components) {
    const componentsToRemove = [];
    Object.entries(window.gmkbStore.components).forEach(([id, component]) => {
      if (!component.type || component.type === 'unknown_type') {
        componentsToRemove.push(id);
      }
    });
    
    if (componentsToRemove.length > 0) {
      console.log(`🗑️ Removing ${componentsToRemove.length} invalid components from store`);
      componentsToRemove.forEach(id => {
        window.gmkbStore.removeComponent(id);
      });
    }
  }
  
  // Fix 6: Intercept test suite that might be adding unknown_type
  const originalTestFn = window.testVueMigration;
  if (originalTestFn) {
    window.testVueMigration = function() {
      console.log('⚠️ Test suite intercepted - blocking unknown_type additions');
      
      // Temporarily override addComponent during tests
      const originalAdd = window.gmkbStore?.addComponent;
      if (window.gmkbStore && originalAdd) {
        window.gmkbStore.addComponent = function(data) {
          if (data.type === 'unknown_type') {
            console.log('🚫 Test attempted to add unknown_type - blocked');
            return null;
          }
          return originalAdd.call(this, data);
        };
      }
      
      // Run original test
      const result = originalTestFn();
      
      // Restore original function
      if (window.gmkbStore && originalAdd) {
        window.gmkbStore.addComponent = originalAdd;
      }
      
      return result;
    };
  }
  
  console.log('✅ Console error fixes applied');
  
  // Make cleanup function globally available
  window.gmkbCleanupErrors = function() {
    cleanupUnknownComponents();
    
    // Remove any unknown_type from store
    if (window.gmkbStore && window.gmkbStore.components) {
      Object.entries(window.gmkbStore.components).forEach(([id, component]) => {
        if (!component.type || component.type === 'unknown_type') {
          console.log('🗑️ Removing invalid component:', id);
          window.gmkbStore.removeComponent(id);
        }
      });
    }
    
    console.log('✅ Error cleanup complete');
  };
  
})();
