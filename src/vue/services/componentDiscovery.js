/**
 * Component Discovery Integration for Vue
 * 
 * @deprecated PHASE 2: This service is deprecated in favor of direct REST API usage.
 * Component metadata should be fetched from /gmkb/v2/components via APIService.
 * 
 * This module bridges the PHP ComponentDiscovery system with Vue's component registry.
 * It maintains the self-contained component architecture while enabling Vue rendering.
 * 
 * MIGRATION PATH:
 * - Use APIService.loadComponents() instead
 * - ComponentLibraryNew.vue now uses REST API directly
 * - This file will be removed in a future version
 */

console.warn('⚠️ componentDiscovery.js is deprecated. Use APIService.loadComponents() instead.');

class VueComponentDiscovery {
  constructor() {
    this.discoveredComponents = new Map();
    this.vueRenderers = new Map();
    
    // ROOT FIX: Store handler references for cleanup
    this.componentRegisteredHandler = null;
    this.wordpressDataReadyHandler = null;
    this.isInitialized = false;
    
    this.initializeDiscovery();
  }

  /**
   * Initialize discovery system
   * ROOT FIX: Prevent duplicate initialization and store handler references
   */
  initializeDiscovery() {
    // ROOT FIX: Prevent duplicate initialization
    if (this.isInitialized) {
      console.warn('⚠️ ComponentDiscovery already initialized, skipping');
      return;
    }
    
    // Check for components from PHP discovery
    if (window.gmkbData?.components) {
      this.processDiscoveredComponents(window.gmkbData.components);
    }

    // ROOT FIX: Create named handlers so we can remove them later
    this.componentRegisteredHandler = this.handleComponentRegistered.bind(this);
    this.wordpressDataReadyHandler = this.handleWordPressDataReady.bind(this);
    
    // Listen for dynamic component discovery
    window.addEventListener('gmkb:component-registered', this.componentRegisteredHandler);
    
    // Listen for WordPress data ready
    window.addEventListener('gmkb:wordpress-data-ready', this.wordpressDataReadyHandler);
    
    this.isInitialized = true;
    console.log('✅ ComponentDiscovery: Event listeners registered');
  }

  /**
   * Process components discovered by PHP
   */
  processDiscoveredComponents(components) {
    components.forEach(component => {
      this.registerComponent(component);
    });

    // Notify Vue system about discovered components
    this.notifyVueSystem();
  }

  /**
   * Register a discovered component
   */
  registerComponent(component) {
    const { type, name, path, config, has_vue_renderer } = component;
    
    this.discoveredComponents.set(type, {
      type,
      name,
      path,
      config,
      hasVueRenderer: has_vue_renderer || this.checkForVueRenderer(type),
      requiresServerRender: config?.requiresServerRender || false,
      schema: config?.schema || {},
      componentOptions: config?.componentOptions || {}
    });
  }

  /**
   * Check if a Vue renderer exists for a component
   */
  checkForVueRenderer(type) {
    // List of components with Vue renderers
    const vueEnabledComponents = [
      'hero', 'biography', 'topics', 'contact', 'social',
      'testimonials', 'call-to-action', 'questions', 'stats',
      'video-intro', 'photo-gallery', 'podcast-player',
      'booking-calendar', 'authority-hook', 'guest-intro', 'logo-grid'
    ];
    
    return vueEnabledComponents.includes(type);
  }

  /**
   * Handle dynamically registered components
   */
  handleComponentRegistered(event) {
    const component = event.detail;
    if (component) {
      this.registerComponent(component);
      this.notifyVueSystem();
    }
  }

  /**
   * Handle WordPress data ready event
   */
  handleWordPressDataReady(event) {
    if (event.detail?.components) {
      this.processDiscoveredComponents(event.detail.components);
    }
  }

  /**
   * Notify Vue system about discovered components
   */
  notifyVueSystem() {
    const componentsArray = Array.from(this.discoveredComponents.values());
    
    // Dispatch event for Vue ComponentRenderer to consume
    window.dispatchEvent(new CustomEvent('gmkb:components-discovered', {
      detail: { 
        components: componentsArray,
        timestamp: Date.now()
      }
    }));
  }

  /**
   * Get component configuration for Vue
   */
  getComponentConfig(type) {
    return this.discoveredComponents.get(type) || null;
  }

  /**
   * Check if component should use server rendering
   */
  shouldUseServerRender(type) {
    const config = this.getComponentConfig(type);
    return config?.requiresServerRender || false;
  }

  /**
   * Register a Vue renderer for a component type
   */
  registerVueRenderer(type, renderer) {
    this.vueRenderers.set(type, renderer);
  }

  /**
   * Get all discovered components
   */
  getAllComponents() {
    return Array.from(this.discoveredComponents.values());
  }

  /**
   * Check if a component type is registered
   */
  isComponentRegistered(type) {
    return this.discoveredComponents.has(type);
  }

  /**
   * Get component schema
   */
  getComponentSchema(type) {
    const config = this.getComponentConfig(type);
    return config?.schema || null;
  }
  
  /**
   * ROOT FIX: Cleanup method for removing event listeners
   */
  cleanup() {
    if (this.componentRegisteredHandler) {
      window.removeEventListener('gmkb:component-registered', this.componentRegisteredHandler);
    }
    
    if (this.wordpressDataReadyHandler) {
      window.removeEventListener('gmkb:wordpress-data-ready', this.wordpressDataReadyHandler);
    }
    
    this.isInitialized = false;
    console.log('✅ ComponentDiscovery: Event listeners cleaned up');
  }
  
  /**
   * ROOT FIX: Reset instance (for HMR)
   */
  reset() {
    this.cleanup();
    this.discoveredComponents.clear();
    this.vueRenderers.clear();
    this.componentRegisteredHandler = null;
    this.wordpressDataReadyHandler = null;
    console.log('✅ ComponentDiscovery: Instance reset');
  }
}

// PHASE 2: Deprecation warning
if (window.gmkbData?.debugMode) {
  console.log('%c⚠️ DEPRECATED: componentDiscovery.js', 'color: orange; font-weight: bold');
  console.log('Use APIService.loadComponents() for component metadata.');
  console.log('See /gmkb/v2/components REST API endpoint.');
}

// ROOT FIX: Check if singleton already exists
if (window.vueComponentDiscovery) {
  // Clean up existing instance
  console.log('⚠️ ComponentDiscovery: Cleaning up existing instance');
  window.vueComponentDiscovery.cleanup();
}

// Create singleton instance
const vueComponentDiscovery = new VueComponentDiscovery();

// Expose to global scope for integration
window.vueComponentDiscovery = vueComponentDiscovery;

// ROOT FIX: Handle HMR cleanup
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    console.log('🔄 HMR: Cleaning up ComponentDiscovery');
    vueComponentDiscovery.cleanup();
  });
}

// Export for ES6 modules
export default vueComponentDiscovery;
