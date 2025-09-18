/**
 * Unified Edit Panel Manager
 * Bridges between Vue components and standard components for editing
 */

export class UnifiedEditManager {
  constructor() {
    this.init();
  }
  
  init() {
    // Listen for Vue panel open requests
    document.addEventListener('gmkb:open-vue-panel', (e) => {
      const { componentId } = e.detail;
      this.openVueEditPanel(componentId);
    });
  }
  
  openVueEditPanel(componentId) {
    // Get the Vue component instance
    const componentEl = document.querySelector(`[data-component-id="${componentId}"]`);
    
    if (componentEl) {
      // Trigger Vue component's own edit panel
      // The Biography component listens for this
      componentEl.dispatchEvent(new CustomEvent('open-edit-panel', {
        detail: { componentId }
      }));
      
      // Alternative: Use the Vue instance directly if available
      const vueInstance = componentEl.__vueApp__ || componentEl.__vue__;
      if (vueInstance) {
        // If we have access to the Vue instance, call its method
        if (vueInstance.openEditPanel) {
          vueInstance.openEditPanel();
        }
      }
    }
  }
}

// Auto-initialize
let unifiedEditManager = null;

export function initializeUnifiedEditManager() {
  if (!unifiedEditManager) {
    unifiedEditManager = new UnifiedEditManager();
  }
  return unifiedEditManager;
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeUnifiedEditManager);
} else {
  setTimeout(initializeUnifiedEditManager, 0);
}
