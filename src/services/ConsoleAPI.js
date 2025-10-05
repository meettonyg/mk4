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
    
    // Create main console object
    window.GMKB = {
      // Version info
      version: '4.0.0-pure-vue',
      
      // Store references (read-only)
      get store() { return mediaKitStore; },
      get themeStore() { return themeStore; },
      get api() { return apiService; },
      
      // Component operations
      addComponent: (type, data) => {
        if (typeof type === 'object') {
          return mediaKitStore.addComponent(type);
        }
        return mediaKitStore.addComponent({ type, data });
      },
      
      removeComponent: (id) => mediaKitStore.removeComponent(id),
      
      duplicateComponent: (id) => mediaKitStore.duplicateComponent(id),
      
      updateComponent: (id, updates) => mediaKitStore.updateComponent(id, updates),
      
      // Section operations
      addSection: (type = 'full_width') => mediaKitStore.addSection(type),
      
      removeSection: (id) => mediaKitStore.removeSection(id),
      
      updateSection: (id, updates) => mediaKitStore.updateSection(id, updates),
      
      // State operations
      getState: () => ({
        components: mediaKitStore.components,
        sections: mediaKitStore.sections,
        theme: mediaKitStore.theme,
        podsData: mediaKitStore.podsData
      }),
      
      save: async () => {
        try {
          await mediaKitStore.save();
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
        if (themeStore) {
          themeStore.selectTheme(themeId);
          console.log(`✅ Switched to ${themeId} theme`);
        } else {
          console.error('Theme store not available');
        }
      },
      
      openThemeCustomizer: () => {
        if (themeStore) {
          themeStore.openCustomizer();
        } else {
          console.error('Theme store not available');
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
        if (apiService?.getCacheStatus) {
          return apiService.getCacheStatus();
        }
        return { error: 'API service not available' };
      },
      
      inflightStatus: () => {
        if (apiService?.getInflightStatus) {
          return apiService.getInflightStatus();
        }
        return { error: 'API service not available' };
      },
      
      // Orphaned components operations
      checkOrphans: () => {
        const result = mediaKitStore.checkForOrphanedComponents();
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
        console.log('🔧 Fixing orphaned components...');
        const result = mediaKitStore.fixOrphanedComponents();
        if (result.fixed > 0) {
          showToast(`Fixed ${result.fixed} orphaned components`, 'success', 5000);
        } else {
          showToast('No orphaned components found', 'info', 3000);
        }
        return result;
      },
      
      // History operations
      undo: () => {
        mediaKitStore.undo();
        console.log('↩️ Undo performed');
      },
      
      redo: () => {
        mediaKitStore.redo();
        console.log('↪️ Redo performed');
      },
      
      // Clear operations
      clearAll: () => {
        if (confirm('Are you sure you want to clear all components and sections?')) {
          mediaKitStore.clearAllComponents();
          mediaKitStore.clearAllSections();
          showToast('Cleared all content', 'warning');
          return true;
        }
        return false;
      },
      
      // Auto-generate content
      autoGenerate: async () => {
        const componentsToAdd = ['hero', 'biography', 'topics', 'authority-hook', 'contact'];
        componentsToAdd.forEach(type => {
          mediaKitStore.addComponent({ type });
        });
        showToast('Generated media kit components', 'success');
        await mediaKitStore.save();
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
  GMKB.store                       - Media kit store
  GMKB.themeStore                  - Theme store
  GMKB.api                         - API service
        `);
      }
    };
    
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
