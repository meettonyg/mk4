/**
 * Quick Fix for Component Registry
 * Run this in the browser console to fix the registry issue immediately
 */

// Create adapter for existing registry
if (window.gmkbComponentRegistry && !window.gmkbComponentRegistryAdapter) {
  console.log('🔧 Creating registry adapter...');
  
  window.gmkbComponentRegistryAdapter = {
    getComponent: function(type) {
      if (typeof window.gmkbComponentRegistry.get === 'function') {
        return window.gmkbComponentRegistry.get(type);
      } else if (typeof window.gmkbComponentRegistry.getComponent === 'function') {
        return window.gmkbComponentRegistry.getComponent(type);
      }
      return null;
    },
    
    getAllComponents: function() {
      if (typeof window.gmkbComponentRegistry.getAll === 'function') {
        return window.gmkbComponentRegistry.getAll();
      } else if (typeof window.gmkbComponentRegistry.getAllComponents === 'function') {
        return window.gmkbComponentRegistry.getAllComponents();
      }
      return [];
    },
    
    hasComponent: function(type) {
      if (typeof window.gmkbComponentRegistry.has === 'function') {
        return window.gmkbComponentRegistry.has(type);
      } else if (typeof window.gmkbComponentRegistry.hasComponent === 'function') {
        return window.gmkbComponentRegistry.hasComponent(type);
      }
      return this.getComponent(type) !== null;
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
          } else if (prop.type === 'string') {
            defaults[key] = '';
          } else if (prop.type === 'number') {
            defaults[key] = 0;
          } else if (prop.type === 'boolean') {
            defaults[key] = false;
          } else if (prop.type === 'array') {
            defaults[key] = [];
          } else if (prop.type === 'object') {
            defaults[key] = {};
          }
        });
      }
      
      return defaults;
    }
  };
  
  // Also patch the registry to have both APIs
  if (!window.gmkbComponentRegistry.getComponent && window.gmkbComponentRegistry.get) {
    window.gmkbComponentRegistry.getComponent = window.gmkbComponentRegistry.get;
  }
  if (!window.gmkbComponentRegistry.getAllComponents && window.gmkbComponentRegistry.getAll) {
    window.gmkbComponentRegistry.getAllComponents = window.gmkbComponentRegistry.getAll;
  }
  if (!window.gmkbComponentRegistry.hasComponent && window.gmkbComponentRegistry.has) {
    window.gmkbComponentRegistry.hasComponent = window.gmkbComponentRegistry.has;
  }
  
  console.log('✅ Registry adapter created successfully!');
  console.log('📊 Available components:', window.gmkbComponentRegistryAdapter.getAllComponents().length);
  
  // Test the adapter
  const allComponents = window.gmkbComponentRegistryAdapter.getAllComponents();
  console.log('📦 Components:', allComponents.map(c => c.type || c.name).join(', '));
  
  // Dispatch event to notify systems
  window.dispatchEvent(new CustomEvent('gmkb:registry-adapter-ready', {
    detail: {
      componentCount: allComponents.length
    }
  }));
  
  console.log('🎉 You can now try dragging components again!');
} else if (window.gmkbComponentRegistryAdapter) {
  console.log('✅ Registry adapter already exists');
} else {
  console.error('❌ Component registry not found!');
}
