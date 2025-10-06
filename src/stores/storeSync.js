/**
 * Store Synchronization Service - Phase 10
 * 
 * Ensures bidirectional synchronization between mediaKit and theme stores
 * Prevents circular updates and maintains consistency
 * 
 * @version 1.0.0
 */

import { watch, nextTick } from 'vue';
import { useMediaKitStore } from '@/stores/mediaKit';
import { useThemeStore } from '@/stores/theme';
import eventBus from '@/services/EventBus';

export class StoreSync {
  constructor() {
    this.mediaKitStore = null;
    this.themeStore = null;
    this.syncActive = false;
    this.syncQueue = [];
    this.unwatchers = [];
    this.syncHistory = [];
    this.maxHistorySize = 50;
    this.initialized = false;
  }

  /**
   * Initialize store synchronization
   */
  initialize() {
    if (this.initialized) {
      console.warn('⚠️ StoreSync already initialized');
      return;
    }

    try {
      this.mediaKitStore = useMediaKitStore();
      this.themeStore = useThemeStore();
      
      this.setupWatchers();
      this.setupEventListeners();
      this.performInitialSync();
      
      this.initialized = true;
      eventBus.emit('storesync:initialized');
      
      console.log('✅ Store synchronization initialized');
    } catch (error) {
      console.error('Failed to initialize StoreSync:', error);
      throw error;
    }
  }

  /**
   * Perform initial sync to ensure stores are aligned
   */
  performInitialSync() {
    // Sync theme from mediaKit store (source of truth)
    if (this.mediaKitStore.theme && this.mediaKitStore.theme !== this.themeStore.currentTheme) {
      this.syncActive = true;
      this.themeStore.setTheme(this.mediaKitStore.theme);
      this.syncActive = false;
      
      this.logSync('initial', 'mediaKit', 'theme', 'theme', this.mediaKitStore.theme);
    }

    // Sync customizations
    if (this.mediaKitStore.themeCustomizations) {
      this.syncActive = true;
      this.themeStore.applyCustomizations(this.mediaKitStore.themeCustomizations);
      this.syncActive = false;
      
      this.logSync('initial', 'mediaKit', 'theme', 'customizations', this.mediaKitStore.themeCustomizations);
    }
  }

  /**
   * Setup reactive watchers for store properties
   */
  setupWatchers() {
    // Watch theme changes in mediaKit store
    const unwatch1 = watch(
      () => this.mediaKitStore.theme,
      (newTheme, oldTheme) => {
        if (this.syncActive || newTheme === oldTheme) return;
        
        this.queueSync('theme', 'mediaKit', 'theme', newTheme, () => {
          this.syncActive = true;
          this.themeStore.setTheme(newTheme);
          this.syncActive = false;
        });
      }
    );

    // Watch theme changes in theme store
    const unwatch2 = watch(
      () => this.themeStore.currentTheme,
      (newTheme, oldTheme) => {
        if (this.syncActive || newTheme === oldTheme) return;
        
        this.queueSync('theme', 'theme', 'mediaKit', newTheme, () => {
          this.syncActive = true;
          this.mediaKitStore.theme = newTheme;
          this.syncActive = false;
        });
      }
    );

    // Watch theme customizations in mediaKit store
    const unwatch3 = watch(
      () => this.mediaKitStore.themeCustomizations,
      (newCustomizations, oldCustomizations) => {
        if (this.syncActive) return;
        
        // Check if actually changed (deep comparison)
        const hasChanged = JSON.stringify(newCustomizations) !== JSON.stringify(oldCustomizations);
        if (!hasChanged) return;
        
        this.queueSync('customizations', 'mediaKit', 'theme', newCustomizations, () => {
          this.syncActive = true;
          this.themeStore.applyCustomizations(newCustomizations);
          this.syncActive = false;
        });
      },
      { deep: true }
    );

    // Watch theme customizations in theme store
    const unwatch4 = watch(
      () => this.themeStore.customizations,
      (newCustomizations, oldCustomizations) => {
        if (this.syncActive) return;
        
        const hasChanged = JSON.stringify(newCustomizations) !== JSON.stringify(oldCustomizations);
        if (!hasChanged) return;
        
        this.queueSync('customizations', 'theme', 'mediaKit', newCustomizations, () => {
          this.syncActive = true;
          this.mediaKitStore.themeCustomizations = { ...newCustomizations };
          this.syncActive = false;
        });
      },
      { deep: true }
    );

    // Watch selected theme preset in theme store
    const unwatch5 = watch(
      () => this.themeStore.selectedPreset,
      (newPreset) => {
        if (this.syncActive || !newPreset) return;
        
        this.queueSync('preset', 'theme', 'mediaKit', newPreset, () => {
          this.syncActive = true;
          
          // Apply preset to mediaKit store
          if (newPreset.id) {
            this.mediaKitStore.theme = newPreset.id;
          }
          
          if (newPreset.customizations) {
            this.mediaKitStore.themeCustomizations = { ...newPreset.customizations };
          }
          
          this.syncActive = false;
        });
      }
    );

    this.unwatchers = [unwatch1, unwatch2, unwatch3, unwatch4, unwatch5];
  }

  /**
   * Queue a sync operation to prevent race conditions
   */
  queueSync(property, source, target, value, syncFn) {
    // Check for circular sync
    const lastSync = this.syncHistory[this.syncHistory.length - 1];
    if (lastSync && 
        lastSync.property === property && 
        lastSync.source === target && 
        lastSync.target === source &&
        Date.now() - lastSync.timestamp < 100) {
      console.warn(`⚠️ Circular sync detected for ${property}, skipping`);
      return;
    }

    // Add to queue
    this.syncQueue.push({
      property,
      source,
      target,
      value,
      syncFn,
      timestamp: Date.now()
    });

    // Process queue
    this.processQueue();
  }

  /**
   * Process sync queue
   */
  async processQueue() {
    if (this.syncQueue.length === 0) return;
    
    // Process in next tick to batch updates
    await nextTick();
    
    while (this.syncQueue.length > 0) {
      const sync = this.syncQueue.shift();
      
      try {
        sync.syncFn();
        this.logSync('sync', sync.source, sync.target, sync.property, sync.value);
        
        // Emit sync event
        eventBus.emit('stores:synced', {
          property: sync.property,
          source: sync.source,
          target: sync.target,
          value: sync.value
        });
      } catch (error) {
        console.error(`Sync failed for ${sync.property}:`, error);
        
        // Emit error event
        eventBus.emit('stores:sync-error', {
          property: sync.property,
          source: sync.source,
          target: sync.target,
          error
        });
      }
    }
  }

  /**
   * Setup event listeners for manual sync triggers
   */
  setupEventListeners() {
    // Listen for manual sync requests
    eventBus.on('storesync:force-sync', () => {
      this.forceSync();
    });

    // Listen for theme changes from external sources
    eventBus.on('theme:external-change', (data) => {
      this.syncActive = true;
      this.mediaKitStore.theme = data.theme;
      if (data.customizations) {
        this.mediaKitStore.themeCustomizations = data.customizations;
      }
      this.syncActive = false;
    });
  }

  /**
   * Force a full sync between stores
   */
  forceSync() {
    console.log('🔄 Forcing store synchronization...');
    
    this.syncActive = true;
    
    try {
      // Use mediaKit store as source of truth
      this.themeStore.setTheme(this.mediaKitStore.theme);
      this.themeStore.applyCustomizations(this.mediaKitStore.themeCustomizations);
      
      this.logSync('force', 'mediaKit', 'theme', 'all', {
        theme: this.mediaKitStore.theme,
        customizations: this.mediaKitStore.themeCustomizations
      });
      
      console.log('✅ Force sync completed');
    } catch (error) {
      console.error('Force sync failed:', error);
    } finally {
      this.syncActive = false;
    }
  }

  /**
   * Log sync operation for debugging
   */
  logSync(type, source, target, property, value) {
    const entry = {
      type,
      source,
      target,
      property,
      value: value ? JSON.stringify(value).substring(0, 100) : null,
      timestamp: Date.now()
    };
    
    this.syncHistory.push(entry);
    
    // Trim history
    if (this.syncHistory.length > this.maxHistorySize) {
      this.syncHistory = this.syncHistory.slice(-this.maxHistorySize);
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[StoreSync] ${type}: ${source} → ${target} (${property})`);
    }
  }

  /**
   * Get sync status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      syncActive: this.syncActive,
      queueSize: this.syncQueue.length,
      historySize: this.syncHistory.length,
      watchersActive: this.unwatchers.length,
      stores: {
        mediaKit: {
          theme: this.mediaKitStore?.theme,
          hasCustomizations: !!this.mediaKitStore?.themeCustomizations
        },
        theme: {
          currentTheme: this.themeStore?.currentTheme,
          hasCustomizations: !!this.themeStore?.customizations
        }
      }
    };
  }

  /**
   * Get sync history for debugging
   */
  getHistory(limit = 10) {
    return this.syncHistory.slice(-limit);
  }

  /**
   * Check if stores are in sync
   */
  isInSync() {
    if (!this.initialized) return false;
    
    const themeMatch = this.mediaKitStore.theme === this.themeStore.currentTheme;
    const customizationsMatch = JSON.stringify(this.mediaKitStore.themeCustomizations) === 
                                JSON.stringify(this.themeStore.customizations);
    
    return themeMatch && customizationsMatch;
  }

  /**
   * Clean up and destroy sync
   */
  destroy() {
    // Stop all watchers
    this.unwatchers.forEach(unwatch => {
      try {
        unwatch();
      } catch (error) {
        console.error('Failed to stop watcher:', error);
      }
    });
    
    // Clear state
    this.unwatchers = [];
    this.syncQueue = [];
    this.syncHistory = [];
    this.syncActive = false;
    this.initialized = false;
    
    console.log('🔚 Store synchronization destroyed');
  }
}

// Create singleton instance
const storeSync = new StoreSync();

// Auto-initialize when stores are ready
if (typeof window !== 'undefined') {
  // Wait for app to be ready
  eventBus.on('app:ready', () => {
    try {
      storeSync.initialize();
    } catch (error) {
      console.error('Failed to initialize store sync:', error);
    }
  });
  
  // Expose for debugging in development
  if (process.env.NODE_ENV === 'development') {
    window.__storeSync = storeSync;
    console.log('[StoreSync] Available at window.__storeSync');
  }
}

export default storeSync;
