/**
 * Vue Component Bridge
 * Handles mounting Vue components within the existing component system
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';

class VueComponentBridge {
  constructor() {
    this.mountedComponents = new Map();
    this.pinia = createPinia();
  }

  /**
   * Mount a Vue component in a container
   * @param {Object} VueComponent - The Vue component to mount
   * @param {HTMLElement} container - The container element
   * @param {Object} props - Props to pass to the component
   * @returns {Object} The Vue app instance
   */
  mountComponent(VueComponent, container, props = {}) {
    // Check if component is already mounted in this container
    if (this.mountedComponents.has(container)) {
      this.unmountComponent(container);
    }

    // Create a new Vue app for this component
    const app = createApp(VueComponent, props);
    
    // Use the shared Pinia instance
    app.use(this.pinia);
    
    // Mount the app
    const instance = app.mount(container);
    
    // Store reference
    this.mountedComponents.set(container, {
      app,
      instance,
      component: VueComponent,
      props
    });
    
    return instance;
  }

  /**
   * Unmount a Vue component from a container
   * @param {HTMLElement} container - The container element
   */
  unmountComponent(container) {
    const mounted = this.mountedComponents.get(container);
    if (mounted) {
      mounted.app.unmount();
      this.mountedComponents.delete(container);
    }
  }

  /**
   * Update props for a mounted component
   * @param {HTMLElement} container - The container element
   * @param {Object} newProps - New props to apply
   */
  updateProps(container, newProps) {
    const mounted = this.mountedComponents.get(container);
    if (mounted) {
      // Remount with new props (Vue 3 doesn't support prop updates after mount)
      this.mountComponent(mounted.component, container, newProps);
    }
  }

  /**
   * Get the store instance
   * @returns {Object} The Pinia store
   */
  getStore() {
    // Store will be created when needed
    return this.pinia;
  }

  /**
   * Check if a container has a mounted component
   * @param {HTMLElement} container - The container element
   * @returns {boolean}
   */
  isMounted(container) {
    return this.mountedComponents.has(container);
  }

  /**
   * Unmount all components
   */
  unmountAll() {
    this.mountedComponents.forEach((mounted, container) => {
      mounted.app.unmount();
    });
    this.mountedComponents.clear();
  }
}

// Create singleton instance
const vueComponentBridge = new VueComponentBridge();

export default vueComponentBridge;
