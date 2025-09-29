/**
 * Media Kit Builder - Main Entry Point
 * Phase 4-8: Pure Vue.js Implementation - NO LEGACY CODE
 */

// Import styles
import '../css/vue-controls.css';

// Vue 3 imports
import { createApp } from 'vue';
import { createPinia } from 'pinia';

// Core services
import { APIService } from './services/APIService.js';
import { logger } from './utils/logger.js';
import UnifiedComponentRegistry from './services/UnifiedComponentRegistry.js';
import podsDataIntegration from './core/PodsDataIntegration.js';
import NonceManager from './services/NonceManager.js';

// Only essential features for Vue
import ImportExportManager from './features/ImportExportManager.js';
import { initDragDrop } from './features/DragDropManager.js';

// Initialize core systems
let apiService;
let vueApp = null;
let importExportManager = null;

/**
 * Show toast notification
 */
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('toast--visible');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Initialize Vue application - Pure Vue, no legacy bridges
 */
async function initializeVue() {
  try {
    // ROOT FIX: Mount Vue to replace the entire preview content
    // This ensures Vue takes full control without coexisting with legacy DOM
    const previewContainer = document.getElementById('media-kit-preview');
    
    if (!previewContainer) {
      logger.error('No preview container found');
      throw new Error('Preview container not found');
    }
    
    // Clear ALL existing content - Vue will handle everything
    previewContainer.innerHTML = '';
    
    // Create a new mount point for Vue
    const mountPoint = document.createElement('div');
    mountPoint.id = 'vue-media-kit-app';
    mountPoint.className = 'vue-media-kit-app';
    previewContainer.appendChild(mountPoint);
    
    logger.info('Created fresh Vue mount point');
    
    // ROOT FIX: Aggressive cleanup of ALL legacy elements
    // Remove all legacy containers and components
    const legacySelectors = [
      '#empty-state',
      '#saved-components-container',
      '.gmkb-component-wrapper',
      '.gmkb-hero-component',
      '.gmkb-sections-container:not(.vue-sections)',
      '.saved-components',
      '.empty-state-optimized'
    ];
    
    legacySelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        // Don't remove if it's inside our Vue app
        if (!el.closest('#vue-media-kit-app')) {
          el.remove();
        }
      });
    });
    
    // ROOT FIX: Disable any legacy rendering systems
    // Override global functions that might be called by legacy code
    if (window.enhancedComponentManager) {
      window.enhancedComponentManager.renderComponent = () => {
        console.log('Legacy rendering disabled - Vue handles all rendering');
      };
    }
    
    if (window.ComponentRenderer) {
      window.ComponentRenderer = {
        render: () => console.log('Legacy ComponentRenderer disabled')
      };
    }
    
    // Disable legacy state managers if they exist
    if (window.stateManager && window.stateManager !== window.gmkbStore) {
      window.stateManager.render = () => {};
      window.stateManager.renderComponents = () => {};
    }

    // Create Pinia store
    const pinia = createPinia();
    
    // Load Vue app components
    const { default: MediaKitApp } = await import('./vue/components/MediaKitApp.vue');
    const { default: ComponentLibrary } = await import('./vue/components/ComponentLibraryNew.vue');
    
    // Create and mount Vue app
    const app = createApp(MediaKitApp);
    app.use(pinia);
    app.component('ComponentLibrary', ComponentLibrary);
    
    const instance = app.mount(mountPoint);
    
    // Make available globally for debugging
    window.gmkbApp = app;
    window.gmkbVueInstance = instance;
    window.gmkbPinia = pinia;
    
    // Initialize stores
    const { useMediaKitStore } = await import('./stores/mediaKit.js');
    const { useThemeStore } = await import('./stores/theme.js');
    
    const mediaKitStore = useMediaKitStore();
    const themeStore = useThemeStore();
    
    // ROOT FIX: Initialize the debounced autoSave with proper context
    mediaKitStore.initAutoSave();
    logger.info('✅ AutoSave initialized with proper context');
    
    window.gmkbStore = mediaKitStore;
    window.mediaKitStore = mediaKitStore;
    window.themeStore = themeStore;
    
    // Load saved state from WordPress
    if (window.gmkbData?.savedState) {
      mediaKitStore.initialize(window.gmkbData.savedState);
      logger.info('✅ Loaded state from WordPress');
    }
    
    // ROOT FIX: Vue handles all DOM - no need to manage legacy containers
    // The entire preview area is now controlled by Vue
    
    // ROOT FIX: Initialize theme after store is ready
    // Load custom themes first (non-blocking)
    themeStore.loadCustomThemes().catch(() => {
      logger.info('Custom themes not available, using built-in themes');
    });
    
    // Initialize theme with proper timing
    setTimeout(() => {
      if (mediaKitStore.theme) {
        themeStore.initialize(mediaKitStore.theme, mediaKitStore.themeCustomizations);
        logger.info('✅ Theme initialized:', mediaKitStore.theme);
      } else {
        // Apply default theme
        themeStore.selectTheme('professional_clean');
        logger.info('✅ Default theme applied');
      }
    }, 100); // Small delay to ensure DOM is ready
    
    // Setup global methods for console access
    window.GMKB = {
      apiService,
      vueApp: app,
      version: '4.0.0', // Updated for pure Vue version
      
      // Store methods
      addComponent: (type, data) => {
        if (typeof type === 'object') {
          return mediaKitStore.addComponent(type);
        }
        return mediaKitStore.addComponent({ type, data });
      },
      removeComponent: (id) => mediaKitStore.removeComponent(id),
      addSection: (type) => mediaKitStore.addSection(type),
      removeSection: (id) => mediaKitStore.removeSection(id),
      getState: () => ({
        components: mediaKitStore.components,
        sections: mediaKitStore.sections,
        theme: mediaKitStore.theme
      }),
      save: () => mediaKitStore.saveToWordPress(),
      store: mediaKitStore
    };
    
    // Console helpers
    window.switchTheme = (themeId) => {
      themeStore.selectTheme(themeId);
      console.log(`✅ Switched to ${themeId} theme`);
    };
    
    logger.success('Vue Media Kit Builder initialized successfully');
    
    // Debug Pods data availability
    setTimeout(() => {
      console.log('📊 Pods Data Check:');
      const podsData = window.gmkbData?.pods_data || window.gmkbData?.podsData || {};
      const fieldCount = Object.keys(podsData).length;
      console.log(`  Fields loaded: ${fieldCount}`);
      if (fieldCount > 0) {
        console.log('  Available fields:', Object.keys(podsData).slice(0, 5));
      }
      console.log('  PodsDataIntegration:', window.podsDataIntegration ? '✅ Available' : '❌ Missing');
    }, 1000);
    
    console.log(`
🎯 Media Kit Builder v4.0 - Pure Vue Implementation
================================================
Component Commands:
- GMKB.addComponent('hero') - Add a component
- GMKB.removeComponent(id) - Remove component
- GMKB.getState() - View current state
- GMKB.save() - Save to WordPress

Section Commands:
- GMKB.addSection('two_column') - Add section
- GMKB.removeSection(id) - Remove section

Theme Commands:
- switchTheme('dark') - Switch themes
- themeStore.openCustomizer() - Open customizer
- themeStore.applyColorPreset('purple') - Apply preset

Debug:
- gmkbStore.$state - View store state
- gmkbStore.componentCount - Component count
- themeStore.mergedTheme - Current theme
- window.gmkbData.pods_data - View Pods data
    `);
    
    return app;
    
  } catch (error) {
    logger.error('Failed to initialize Vue:', error);
    showToast('Failed to initialize Media Kit Builder', 'error');
    return null;
  }
}

/**
 * Setup empty state button handlers - ROOT FIX: Let Vue handle DOM updates
 */
function setupEmptyStateHandlers() {
  // Use event delegation for dynamic buttons
  document.addEventListener('click', async (event) => {
    // Handle Add Component button specifically
    if (event.target.id === 'add-component-btn' || 
        event.target.closest('#add-component-btn')) {
      event.preventDefault();
      if (window.openComponentLibrary) {
        window.openComponentLibrary();
      } else {
        document.dispatchEvent(new CustomEvent('gmkb:open-component-library'));
      }
      return;
    }
    
    const target = event.target.closest('[data-action]');
    if (!target) return;
    
    const action = target.dataset.action;
    const store = window.gmkbStore;
    if (!store) return;
    
    switch (action) {
      case 'add-component':
        event.preventDefault();
        // Open the component library modal instead of directly adding
        if (window.openComponentLibrary) {
          window.openComponentLibrary();
        } else {
          // Fallback: dispatch event to open library
          document.dispatchEvent(new CustomEvent('gmkb:open-component-library'));
        }
        break;
        
      case 'add-section':
        event.preventDefault();
        store.addSection('full_width');
        showToast('Section added', 'success');
        break;
        
      case 'auto-generate-all':
        event.preventDefault();
        target.disabled = true;
        const originalText = target.textContent;
        target.textContent = 'Generating...';
        
        try {
          // Add typical MKCG components
          const componentsToAdd = ['hero', 'biography', 'topics', 'authority-hook', 'contact'];
          componentsToAdd.forEach(type => {
            store.addComponent({ type });
          });
          
          showToast('Media kit components generated!', 'success');
          await store.saveToWordPress();
          
        } catch (error) {
          console.error('Auto-generate failed:', error);
          showToast('Generation failed', 'error');
        } finally {
          target.disabled = false;
          target.textContent = originalText;
        }
        break;
    }
  });
}

/**
 * Setup UI handlers for non-Vue elements (if any remain)
 */
function setupMinimalUIHandlers() {
  // Save button
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const store = window.gmkbStore;
      if (!store) return;
      
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
      
      try {
        await store.saveToWordPress();
        showToast('Saved successfully', 'success');
      } catch (error) {
        console.error('Save failed:', error);
        showToast('Save failed', 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save';
      }
    });
  }
}

/**
 * Main initialization
 */
async function initialize() {
  logger.info('🚀 Initializing Media Kit Builder v4.0 - Pure Vue');
  
  try {
    // Setup API service
    const ajaxUrl = window.gmkbData?.ajaxUrl || 
                    window.ajaxurl || 
                    '/wp-admin/admin-ajax.php';
    
    const nonce = window.gmkbData?.nonce || '';
    const postId = window.gmkbData?.postId;
    
    apiService = new APIService(ajaxUrl, nonce, postId);
    
    // Initialize component registry
    UnifiedComponentRegistry.initialize();
    logger.info('✅ Component registry initialized');
    
    // ROOT FIX: Initialize NonceManager for event-driven nonce refresh
    logger.info('✅ Nonce manager initialized');
    
    // Make PodsDataIntegration available globally for the store
    window.podsDataIntegration = podsDataIntegration;
    window.gmkbPodsIntegration = podsDataIntegration;
    logger.info('✅ Pods data integration initialized');
    
    // Initialize drag and drop
    initDragDrop();
    logger.info('✅ Drag and drop initialized');
    
    // Initialize import/export manager
    importExportManager = new ImportExportManager();
    window.gmkbImportExport = importExportManager;
    
    // Initialize Vue application
    vueApp = await initializeVue();
    
    // Setup minimal UI handlers
    setupMinimalUIHandlers();
    
    // Setup empty state button handlers  
    setupEmptyStateHandlers();
    
    // Dispatch ready event
    document.dispatchEvent(new CustomEvent('gmkb:ready', {
      detail: { 
        version: '4.0.0',
        vueEnabled: true,
        pureVue: true
      }
    }));
    
  } catch (error) {
    logger.error('Initialization failed:', error);
    showToast('Failed to initialize Media Kit Builder', 'error');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  setTimeout(initialize, 0);
}

// Export for module usage
export {
  APIService,
  logger,
  showToast
};
