/**
 * State Bridge - Syncs legacy StateManager with Pinia Store
 * This allows gradual migration from legacy to Vue architecture
 */

export class StateBridge {
  constructor(legacyStateManager, piniaStore) {
    this.legacy = legacyStateManager;
    this.store = piniaStore;
    this.isSyncing = false;
    
    // Initialize Pinia store from legacy state
    this.syncToPinia();
    
    // Subscribe to legacy state changes
    this.legacy.subscribe((state) => {
      if (!this.isSyncing) {
        this.syncToPinia();
      }
    });
    
    // Subscribe to Pinia store changes
    this.store.$subscribe((mutation, state) => {
      if (!this.isSyncing) {
        this.syncToLegacy();
      }
    });
    
    console.log('✅ State bridge initialized - legacy and Pinia stores synced');
  }
  
  syncToPinia() {
    this.isSyncing = true;
    
    try {
      const legacyState = this.legacy.getState();
      
      // Map legacy state to Pinia store format
      const piniaState = {
        components: legacyState.components || {},
        sections: legacyState.sections || [],
        theme: legacyState.theme || 'default',
        themeCustomizations: legacyState.themeSettings || {}
      };
      
      // Update Pinia store
      this.store.$patch(piniaState);
      
    } finally {
      this.isSyncing = false;
    }
  }
  
  syncToLegacy() {
    this.isSyncing = true;
    
    try {
      // Get Pinia state
      const piniaState = {
        components: this.store.components,
        sections: this.store.sections,
        theme: this.store.theme,
        themeSettings: this.store.themeCustomizations
      };
      
      // Update legacy state manager
      this.legacy.setState(piniaState);
      
    } finally {
      this.isSyncing = false;
    }
  }
  
  // Bridge methods for compatibility
  addComponent(type, data = {}) {
    return this.store.addComponent({ type, data });
  }
  
  removeComponent(componentId) {
    this.store.removeComponent(componentId);
  }
  
  updateComponent(componentId, updates) {
    this.store.updateComponent(componentId, updates);
  }
  
  addSection(type = 'full_width') {
    return this.store.addSection(type);
  }
  
  removeSection(sectionId) {
    this.store.removeSection(sectionId);
  }
  
  getState() {
    return {
      components: this.store.components,
      sections: this.store.sections,
      theme: this.store.theme,
      themeSettings: this.store.themeCustomizations
    };
  }
}
