/**
 * Component Registry Adapter
 * 
 * Provides a consistent API for component registry access,
 * adapting between different registry implementations
 */

class ComponentRegistryAdapter {
  constructor(registry) {
    this.registry = registry;
    
    // Detect which API the registry uses
    this.useNewApi = typeof registry?.getComponent === 'function';
    this.useOldApi = typeof registry?.get === 'function';
    
    if (!this.useNewApi && !this.useOldApi) {
      console.warn('[ComponentRegistryAdapter] Registry does not have expected methods');
    }
  }
  
  /**
   * Get a component by type/name
   * @param {string} type Component type
   * @returns {Object|null} Component data or null
   */
  getComponent(type) {
    if (!this.registry) return null;
    
    if (this.useNewApi) {
      return this.registry.getComponent(type);
    } else if (this.useOldApi) {
      return this.registry.get(type);
    }
    
    return null;
  }
  
  /**
   * Get all components
   * @returns {Array} Array of components
   */
  getAllComponents() {
    if (!this.registry) return [];
    
    if (this.useNewApi && typeof this.registry.getAllComponents === 'function') {
      return this.registry.getAllComponents();
    } else if (this.useOldApi && typeof this.registry.getAll === 'function') {
      return this.registry.getAll();
    }
    
    return [];
  }
  
  /**
   * Check if a component exists
   * @param {string} type Component type
   * @returns {boolean} True if component exists
   */
  hasComponent(type) {
    if (!this.registry) return false;
    
    if (this.useNewApi && typeof this.registry.hasComponent === 'function') {
      return this.registry.hasComponent(type);
    } else if (this.useOldApi && typeof this.registry.has === 'function') {
      return this.registry.has(type);
    }
    
    return this.getComponent(type) !== null;
  }
  
  /**
   * Get components by category
   * @param {string} category Category name
   * @returns {Array} Components in category
   */
  getComponentsByCategory(category) {
    if (!this.registry) return [];
    
    if (this.useNewApi && typeof this.registry.getComponentsByCategory === 'function') {
      return this.registry.getComponentsByCategory(category);
    } else if (this.useOldApi && typeof this.registry.getByCategory === 'function') {
      return this.registry.getByCategory(category);
    }
    
    // Fallback: filter all components
    const all = this.getAllComponents();
    return all.filter(comp => comp.category === category);
  }
  
  /**
   * Get default props for a component
   * @param {string} type Component type
   * @returns {Object} Default props
   */
  getDefaultProps(type) {
    if (!this.registry) return {};
    
    // Try new API first
    if (this.useNewApi && typeof this.registry.getDefaultProps === 'function') {
      return this.registry.getDefaultProps(type);
    }
    
    // Extract from component schema
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
    
    // Also check for defaults at root level
    if (schema.defaults) {
      Object.assign(defaults, schema.defaults);
    }
    
    return defaults;
  }
  
  /**
   * Get the original registry
   * @returns {Object} Original registry object
   */
  getOriginalRegistry() {
    return this.registry;
  }
  
  /**
   * Debug the registry
   */
  debug() {
    console.group('[ComponentRegistryAdapter] Debug Info');
    console.log('Has registry:', !!this.registry);
    console.log('Uses new API:', this.useNewApi);
    console.log('Uses old API:', this.useOldApi);
    
    if (this.registry) {
      console.log('Registry methods:', Object.keys(this.registry).filter(key => typeof this.registry[key] === 'function'));
      console.log('Total components:', this.getAllComponents().length);
      
      const components = this.getAllComponents();
      if (components.length > 0) {
        console.log('Sample component:', components[0]);
      }
    }
    
    console.groupEnd();
  }
}

// Create global adapter if registry exists
if (typeof window !== 'undefined') {
  if (window.gmkbComponentRegistry && !window.gmkbComponentRegistryAdapter) {
    window.gmkbComponentRegistryAdapter = new ComponentRegistryAdapter(window.gmkbComponentRegistry);
    console.log('[ComponentRegistryAdapter] Created adapter for existing registry');
  }
  
  // Also export the class for use elsewhere
  window.ComponentRegistryAdapter = ComponentRegistryAdapter;
}

export default ComponentRegistryAdapter;
