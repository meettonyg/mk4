/**
 * Console API Service
 * Provides developer console commands for debugging and testing
 * Extracted from main.js to follow single responsibility principle
 */

import { showToast } from './ToastService.js';

export class ConsoleAPI {
  /**
   * Install console commands to window.GMKB
   * @param {Object} stores - Object containing mediaKitStore and themeStore
   * @param {Object} services - Object containing apiService and other services
   */
  static install({ mediaKitStore, themeStore, apiService }) {
    if (!mediaKitStore) {
      console.error('ConsoleAPI: mediaKitStore is required');
      return;
    }
    
    // ROOT FIX: Don't replace window.GMKB, extend it!
    // The stores object is already set by main.js
    if (!window.GMKB) {
      window.GMKB = {};
    }
    
    // Add console API methods to existing GMKB object
    // ROOT FIX: Single namespace pattern - NO duplicate accessors
    Object.assign(window.GMKB, {
      
      // Component operations (use stores.mediaKit internally)
      addComponent: (type, data) => {
        const store = window.GMKB.stores?.mediaKit;
        if (!store) {
          console.error('❌ Media kit store not available');
          return null;
        }
        if (typeof type === 'object') {
          return store.addComponent(type);
        }
        return store.addComponent({ type, data });
      },
      
      removeComponent: (id) => window.GMKB.stores?.mediaKit?.removeComponent(id),
      
      duplicateComponent: (id) => window.GMKB.stores?.mediaKit?.duplicateComponent(id),
      
      updateComponent: (id, updates) => window.GMKB.stores?.mediaKit?.updateComponent(id, updates),
      
      // Section operations
      addSection: (type = 'full_width') => window.GMKB.stores?.mediaKit?.addSection(type),
      
      removeSection: (id) => window.GMKB.stores?.mediaKit?.removeSection(id),
      
      updateSection: (id, updates) => window.GMKB.stores?.mediaKit?.updateSection(id, updates),
      
      // State operations
      getState: () => {
        const store = window.GMKB.stores?.mediaKit;
        if (!store) return null;
        return {
          components: store.components,
          sections: store.sections,
          theme: store.theme,
          podsData: store.podsData
        };
      },
      
      save: async () => {
        const store = window.GMKB.stores?.mediaKit;
        if (!store) {
          console.error('❌ Media kit store not available');
          return false;
        }
        try {
          await store.save();
          showToast('Saved successfully', 'success');
          return true;
        } catch (error) {
          showToast('Save failed', 'error');
          console.error('Save failed:', error);
          return false;
        }
      },
      
      // Theme operations
      switchTheme: (themeId) => {
        const store = window.GMKB.stores?.theme;
        if (store) {
          store.selectTheme(themeId);
          console.log(`✅ Switched to ${themeId} theme`);
        } else {
          console.error('❌ Theme store not available');
        }
      },
      
      openThemeCustomizer: () => {
        const store = window.GMKB.stores?.theme;
        if (store) {
          store.openCustomizer();
        } else {
          console.error('❌ Theme store not available');
        }
      },
      
      // Import/Export operations
      openImportExport: () => {
        document.dispatchEvent(new CustomEvent('gmkb:open-import-export'));
      },
      
      closeImportExport: () => {
        document.dispatchEvent(new CustomEvent('gmkb:close-import-export'));
      },
      
      // Debug operations
      cacheStatus: () => {
        const api = window.GMKB.services?.api;
        if (api?.getCacheStatus) {
          return api.getCacheStatus();
        }
        return { error: 'API service not available' };
      },
      
      inflightStatus: () => {
        const api = window.GMKB.services?.api;
        if (api?.getInflightStatus) {
          return api.getInflightStatus();
        }
        return { error: 'API service not available' };
      },
      
      // Orphaned components operations
      checkOrphans: () => {
        const store = window.GMKB.stores?.mediaKit;
        if (!store) {
          console.error('❌ Media kit store not available');
          return null;
        }
        const result = store.checkForOrphanedComponents();
        console.log('📊 Orphaned Components Report:');
        console.log(`  Total components: ${result.total}`);
        console.log(`  In sections: ${result.inSections}`);
        console.log(`  Orphaned: ${result.orphaned}`);
        if (result.orphaned > 0) {
          console.log(`  Orphaned IDs:`, result.orphanedIds);
        }
        return result;
      },
      
      fixOrphans: () => {
        const store = window.GMKB.stores?.mediaKit;
        if (!store) {
          console.error('❌ Media kit store not available');
          return null;
        }
        console.log('🔧 Fixing orphaned components...');
        const result = store.fixOrphanedComponents();
        if (result.fixed > 0) {
          showToast(`Fixed ${result.fixed} orphaned components`, 'success', 5000);
        } else {
          showToast('No orphaned components found', 'info', 3000);
        }
        return result;
      },
      
      // History operations
      undo: () => {
        const store = window.GMKB.stores?.mediaKit;
        if (store) {
          store.undo();
          console.log('↩️ Undo performed');
        }
      },
      
      redo: () => {
        const store = window.GMKB.stores?.mediaKit;
        if (store) {
          store.redo();
          console.log('↪️ Redo performed');
        }
      },
      
      // Clear operations
      clearAll: () => {
        const store = window.GMKB.stores?.mediaKit;
        if (!store) {
          console.error('❌ Media kit store not available');
          return false;
        }
        if (confirm('Are you sure you want to clear all components and sections?')) {
          store.clearAllComponents();
          store.clearAllSections();
          showToast('Cleared all content', 'warning');
          return true;
        }
        return false;
      },
      
      // Auto-generate content
      autoGenerate: async () => {
        const store = window.GMKB.stores?.mediaKit;
        if (!store) {
          console.error('❌ Media kit store not available');
          return false;
        }
        const componentsToAdd = ['hero', 'biography', 'topics', 'authority-hook', 'contact'];
        componentsToAdd.forEach(type => {
          store.addComponent({ type });
        });
        showToast('Generated media kit components', 'success');
        await store.save();
        return true;
      },
      
      // Help command
      help: () => {
        console.log(`
🎯 Media Kit Builder Console Commands
=====================================

Component Commands:
  GMKB.addComponent('hero')        - Add a component
  GMKB.removeComponent(id)          - Remove component
  GMKB.duplicateComponent(id)       - Duplicate component
  GMKB.updateComponent(id, data)   - Update component

Section Commands:
  GMKB.addSection('two_column')    - Add section
  GMKB.removeSection(id)            - Remove section
  GMKB.updateSection(id, data)     - Update section

State Commands:
  GMKB.getState()                  - View current state
  GMKB.save()                      - Save to WordPress
  GMKB.undo()                      - Undo last action
  GMKB.redo()                      - Redo action

Theme Commands:
  GMKB.switchTheme('modern_dark')  - Switch themes
  GMKB.openThemeCustomizer()       - Open customizer

Import/Export:
  GMKB.openImportExport()          - Open import/export modal

Debug Commands:
  GMKB.cacheStatus()               - Check API cache
  GMKB.inflightStatus()            - Check in-flight requests
  GMKB.checkOrphans()              - Check for orphaned components
  GMKB.fixOrphans()                - Fix orphaned components

Utility Commands:
  GMKB.clearAll()                  - Clear all content
  GMKB.autoGenerate()              - Generate sample content
  GMKB.help()                      - Show this help

Store Access:
  GMKB.stores.mediaKit             - Media kit store
  GMKB.stores.theme                - Theme store
  GMKB.stores.ui                   - UI store
  GMKB.services.api                - API service
        `);
      }
    });
    
    // Also add convenience global function
    window.switchTheme = (themeId) => {
      GMKB.switchTheme(themeId);
    };
    
    // Log success
    console.log('✅ Console API installed. Type GMKB.help() for commands.');
  }
  
  /**
   * Uninstall console commands (for cleanup)
   */
  static uninstall() {
    delete window.GMKB;
    delete window.switchTheme;
    console.log('Console API uninstalled');
  }
}

// Export for convenience
export const installConsoleAPI = ConsoleAPI.install;
export const uninstallConsoleAPI = ConsoleAPI.uninstall;
