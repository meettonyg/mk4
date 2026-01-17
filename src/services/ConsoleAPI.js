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
          profileData: store.profileData
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
      
      // Media Library Diagnostic Commands
      testMediaLibrary: () => {
        console.log('🔍 WordPress Media Library Diagnostic');
        console.log('=====================================');
        
        const tests = {
          'window.wp exists': typeof window.wp !== 'undefined',
          'wp.media exists': typeof window.wp !== 'undefined' && typeof window.wp.media !== 'undefined',
          'wp.media is function': typeof window.wp !== 'undefined' && typeof window.wp.media === 'function',
          'jQuery loaded': typeof window.jQuery !== 'undefined',
          'Backbone loaded': typeof window.Backbone !== 'undefined',
          'Underscore loaded': typeof window._ !== 'undefined',
          'Plupload settings': typeof window._wpPluploadSettings !== 'undefined',
          'Media views script': document.querySelector('script[src*="media-views"]') !== null,
          'Media models script': document.querySelector('script[src*="media-models"]') !== null,
          'Media templates in DOM': document.querySelectorAll('script[type="text/html"][id^="tmpl-"]').length > 0
        };
        
        let allPassed = true;
        let failedTests = [];
        
        Object.entries(tests).forEach(([test, result]) => {
          const status = result ? '✅' : '❌';
          console.log(`${status} ${test}: ${result}`);
          if (!result) {
            allPassed = false;
            failedTests.push(test);
          }
        });
        
        console.log('=====================================');
        
        if (allPassed) {
          console.log('✅ All tests passed! Media library should work correctly.');
          console.log('💡 Try: GMKB.openTestMedia() to open the media library');
        } else {
          console.error('❌ Some tests failed:', failedTests.join(', '));
          console.log('🔧 Troubleshooting:');
          
          if (!tests['Media templates in DOM']) {
            console.log('  - Media templates not found. wp_print_media_templates() may not have been called.');
            console.log('  - Check if gmkb_print_media_templates_on_frontend() is running.');
          }
          
          if (!tests['wp.media is function']) {
            console.log('  - wp.media is not a function. Media library scripts may not be loaded.');
            console.log('  - Check if wp_enqueue_media() is being called.');
          }
          
          if (!tests['Plupload settings']) {
            console.log('  - Plupload settings missing. File uploads may fail.');
            console.log('  - Check if wp_plupload_default_settings() is being output.');
          }
        }
        
        return allPassed;
      },
      
      openTestMedia: () => {
        if (typeof window.wp === 'undefined' || typeof window.wp.media !== 'function') {
          console.error('❌ Cannot open media library - wp.media is not available');
          console.log('Run GMKB.testMediaLibrary() for diagnostics');
          return;
        }
        
        try {
          const frame = window.wp.media({
            title: 'Test Media Library',
            button: { text: 'Select' },
            multiple: false,
            library: { type: 'image' }
          });
          
          frame.on('select', function() {
            const attachment = frame.state().get('selection').first().toJSON();
            console.log('✅ Image selected:', {
              id: attachment.id,
              url: attachment.url,
              title: attachment.title
            });
            showToast('Image selected: ' + attachment.title, 'success');
          });
          
          frame.open();
          console.log('✅ Media library opened successfully');
        } catch (error) {
          console.error('❌ Failed to open media library:', error);
          showToast('Failed to open media library', 'error');
        }
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

Media Library Commands:
  GMKB.testMediaLibrary()          - Run media library diagnostic
  GMKB.openTestMedia()             - Test opening media library

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
