/**
 * Media Kit Builder - Main Entry Point (Pure Vue)
 * Version: 4.0.0 - 100% Vue.js SPA
 * 
 * ROOT FIX: Removed ALL legacy JavaScript competing with Vue
 * - No more DragDropManager (Vue handles it)
 * - No more ImportExportManager (Vue composable handles it)  
 * - No more StateManager/EventBus (Pinia handles it)
 * - 100% Vue-driven architecture
 */

// Vue 3 imports
import { createApp } from 'vue';
import { createPinia } from 'pinia';

// Pure utilities (no DOM manipulation, no event listeners)
import { APIService } from './services/APIService.js';
import { DataValidator } from './services/DataValidator.js';
import { logger } from './utils/logger.js';
import UnifiedComponentRegistry from './services/UnifiedComponentRegistry.js';
import podsDataIntegration from './core/PodsDataIntegration.js';
import NonceManager from './services/NonceManager.js';
import importExportService from './services/ImportExportService.js';

// ROOT FIX: Import new modular services
import { ToastService, showToast } from './services/ToastService.js';
import { ConsoleAPI } from './services/ConsoleAPI.js';
import { DOMHandlers } from './services/DOMHandlers.js';

// Initialize core systems
let apiService;
let vueApp = null;

// ROOT FIX: showToast now imported from ToastService

/**
 * Initialize Vue application with proper error handling
 * 
 * Steps:
 * 3. Create Vue app
 * 4. Mount Vue app  
 * 5. Initialize stores
 * 6. Load data with retry
 * 7. Initialize theme
 */
async function initializeVue() {
  try {
    console.log('3️⃣ Creating Vue application...');
    
    // ROOT FIX: Support both Pure Vue template and legacy templates
    let mountPoint = document.getElementById('app');
    const isPureVueMode = window.gmkbData?.architecture === 'pure-vue';
    
    if (isPureVueMode && mountPoint) {
      logger.info('✅ Using Pure Vue mode - mounting to #app');
      // Clear loading spinner
      mountPoint.innerHTML = '';
    } else {
      const previewContainer = document.getElementById('media-kit-preview');
      
      if (!previewContainer) {
        throw new Error('Preview container not found');
      }
      
      previewContainer.innerHTML = '';
      mountPoint = document.createElement('div');
      mountPoint.id = 'vue-media-kit-app';
      mountPoint.className = 'vue-media-kit-app';
      previewContainer.appendChild(mountPoint);
      logger.info('✅ Using Legacy mode - created mount point in #media-kit-preview');
    }
    
    // ROOT FIX: Disable any legacy rendering systems
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
    
    if (window.stateManager && window.stateManager !== window.gmkbStore) {
      window.stateManager.render = () => {};
      window.stateManager.renderComponents = () => {};
    }

    // Create Pinia store
    const pinia = createPinia();
    console.log('✅ Pinia store created');
    
    // Load Vue app components
    const { default: MediaKitApp } = await import('./vue/components/MediaKitApp.vue');
    const { default: ComponentLibrary } = await import('./vue/components/ComponentLibraryNew.vue');
    const { default: LoadingScreen } = await import('./vue/components/LoadingScreen.vue');
    console.log('✅ Vue components loaded');
    
    // Create and mount Vue app
    console.log('4️⃣ Mounting Vue application...');
    const app = createApp(MediaKitApp);
    app.use(pinia);
    app.component('ComponentLibrary', ComponentLibrary);
    app.component('LoadingScreen', LoadingScreen);
    
    const instance = app.mount(mountPoint);
    console.log('✅ Vue mounted successfully');
    
    // Make available globally for debugging
    window.gmkbApp = app;
    window.gmkbVueInstance = instance;
    window.gmkbPinia = pinia;
    
    // STEP 5: Initialize stores
    console.log('5️⃣ Initializing stores...');
    const { useMediaKitStore } = await import('./stores/mediaKit.js');
    const { useThemeStore } = await import('./stores/theme.js');
    
    const mediaKitStore = useMediaKitStore();
    const themeStore = useThemeStore();
    console.log('✅ Stores initialized');
    
    // ROOT FIX: Initialize the debounced autoSave with proper context
    mediaKitStore.initAutoSave();
    logger.info('✅ AutoSave initialized with proper context');
    
    window.gmkbStore = mediaKitStore;
    window.mediaKitStore = mediaKitStore;
    window.themeStore = themeStore;
    
    // Load data with retry logic and better error handling
    console.log('6️⃣ Loading media kit data...');
    try {
      if (window.gmkbData?.savedState) {
        await mediaKitStore.initialize(window.gmkbData.savedState);
        console.log('✅ Data loaded from savedState');
      } else {
        // Load from API with built-in retry
        await mediaKitStore.initialize();
        console.log('✅ Data loaded from API');
      }
    } catch (error) {
      console.error('❌ Failed to load data:', error);
      
      // Try to restore from localStorage as fallback
      const restored = mediaKitStore.restoreFromLocalStorage();
      if (restored) {
        console.log('♻️ Restored from local backup');
        showToast('Restored from local backup', 'warning');
      } else {
        throw error; // Re-throw if no backup available
      }
    }
    
    // STEP 7: Initialize theme
    console.log('7️⃣ Initializing theme...');
    
    // ROOT FIX: Initialize themes from PHP data FIRST, before anything else
    // Pass the saved theme from the media kit store
    const savedTheme = mediaKitStore.theme || 'professional_clean';
    const savedCustomizations = mediaKitStore.themeCustomizations || {};
    
    console.log('🎨 Initializing theme store with saved theme:', savedTheme);
    await themeStore.initialize(savedTheme, savedCustomizations);
    console.log('✅ Theme initialized:', themeStore.activeThemeId);
    
    // CRITICAL: If the theme changed during initialization (e.g., theme not found),
    // update the media kit store to match
    if (themeStore.activeThemeId !== savedTheme) {
      console.warn('⚠️ Theme mismatch detected, updating media kit store');
      mediaKitStore.theme = themeStore.activeThemeId;
    }
    
    // Load custom themes after (non-blocking)
    themeStore.loadCustomThemes().catch(() => {
      console.log('ℹ️ Custom themes not available, using built-in themes');
    })
    
    // ROOT FIX: Use ConsoleAPI service instead of inline code
    ConsoleAPI.install({
      mediaKitStore,
      themeStore,
      apiService
    });
    
    // DEPRECATED: Old inline console API replaced by ConsoleAPI service
    /*
    window.GMKB = {
      apiService,
      vueApp: app,
      version: '4.0.0-pure-vue',
      
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
      store: mediaKitStore,
      
      // Import/Export methods
      openImportExport: () => importExportService.openModal(),
      closeImportExport: () => importExportService.closeModal(),
      
      // Debug methods
      cacheStatus: () => apiService.getCacheStatus(),
      inflightStatus: () => apiService.getInflightStatus(),
      
      // ROOT FIX: Orphaned components debug methods
      checkOrphans: () => {
        if (!window.gmkbStore && !window.mediaKitStore) {
          console.error('Store not initialized');
          return { error: 'Store not available' };
        }
        const store = window.gmkbStore || window.mediaKitStore;
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
        if (!window.gmkbStore && !window.mediaKitStore) {
          console.error('Store not initialized');
          return { error: 'Store not available' };
        }
        const store = window.gmkbStore || window.mediaKitStore;
        console.log('🔧 Fixing orphaned components...');
        const result = store.fixOrphanedComponents();
        if (result.fixed > 0) {
          showToast(`Fixed ${result.fixed} orphaned components`, 'success', 5000);
        } else {
          showToast('No orphaned components found', 'info', 3000);
        }
        return result;
      }
    };
    */
    
    // DEPRECATED: Now handled by ConsoleAPI
    /*
    window.switchTheme = (themeId) => {
      themeStore.selectTheme(themeId);
      console.log(`✅ Switched to ${themeId} theme`);
    };
    */
    
    console.log('✅ Vue Media Kit Builder initialized successfully');
    
    // Debug info
    setTimeout(() => {
      console.log('📊 Pods Data Check:');
      const podsData = window.gmkbData?.pods_data || window.gmkbData?.podsData || {};
      const fieldCount = Object.keys(podsData).length;
      console.log(`  Fields loaded: ${fieldCount}`);
      if (fieldCount > 0) {
        console.log('  Available fields:', Object.keys(podsData).slice(0, 5));
      }
    }, 1000);
    
    // ROOT FIX: Console help now handled by ConsoleAPI.help()
    console.log('🎯 Media Kit Builder v4.0 initialized. Type GMKB.help() for commands.');
    
    return app;
    
  } catch (error) {
    console.error('❌ Failed to initialize Vue:', error);
    throw error;
  }
}

// ROOT FIX: DOM handlers moved to DOMHandlers service
/*
function setupEmptyStateHandlers() {
  document.addEventListener('click', async (event) => {
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
        if (window.openComponentLibrary) {
          window.openComponentLibrary();
        } else {
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
*/

// ROOT FIX: UI handlers moved to DOMHandlers service
/*
function setupMinimalUIHandlers() {
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
*/

/**
 * Main initialization with enhanced error handling
 * 
 * Initialization Steps:
 * 1. Validate environment
 * 2. Initialize services
 * 3. Create Vue app
 * 4. Mount Vue app
 * 5. Initialize stores
 * 6. Load data (with retry)
 * 7. Initialize theme
 */
async function initialize() {
  console.log('🚀 Initializing Media Kit Builder v4.0 - Pure Vue...');
  
  try {
    // STEP 1: Validate environment using DataValidator
    console.log('1️⃣ Validating environment...');
    DataValidator.validateGmkbData();
    console.log('✅ Environment valid');
    
    // STEP 2: Initialize services (utilities only, no DOM manipulation)
    console.log('2️⃣ Initializing services...');
    
    const restUrl = window.gmkbData?.restUrl || window.location.origin + '/wp-json/';
    const restNonce = window.gmkbData?.restNonce || '';
    const postId = window.gmkbData?.postId;
    
    console.log('🔧 Initializing APIService with:', {
      restUrl,
      restNonce: restNonce ? 'present' : 'missing',
      postId
    });
    
    apiService = new APIService(restUrl, restNonce, postId);
    window.gmkbAPI = apiService;
    console.log('✅ API Service ready');
    
    // Initialize component registry
    UnifiedComponentRegistry.initialize();
    console.log('✅ Component registry initialized');
    
    // Initialize Pods integration (utility only)
    window.podsDataIntegration = podsDataIntegration;
    window.gmkbPodsIntegration = podsDataIntegration;
    logger.info('✅ Pods data integration initialized');
    
    // ROOT FIX: NO MORE initDragDrop() - Vue handles ALL drag/drop!
    // ROOT FIX: NO MORE ImportExportManager - Vue composable handles it!
    logger.info('✅ Using 100% Vue architecture - no legacy managers');
    
    // STEP 3-7: Initialize Vue application
    console.log('3️⃣ Creating Vue application...');
    vueApp = await initializeVue();
    
    if (!vueApp) {
      throw new Error('Vue application failed to initialize');
    }
    
    // ROOT FIX: Use DOMHandlers service for UI event handling
    DOMHandlers.initialize();
    
    // SUCCESS!
    console.log('✅ Media Kit Builder initialized successfully!');
    console.log('📊 State:', {
      components: window.gmkbStore?.componentCount || 0,
      sections: window.gmkbStore?.sectionCount || 0,
      theme: window.gmkbStore?.theme || 'not set'
    });
    
    // Dispatch ready event
    document.dispatchEvent(new CustomEvent('gmkb:ready', {
      detail: { 
        version: '4.0.0-pure-vue',
        vueEnabled: true,
        pureVue: true,
        legacyRemoved: true,
        timestamp: Date.now()
      }
    }));
    
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    
    // Show error in UI
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
        <div class="gmkb-error">
          <h1 class="gmkb-error__title">⚠️ Initialization Failed</h1>
          <p class="gmkb-error__message">
            ${error.message}
          </p>
          <p class="gmkb-error__detail">
            Check the browser console for more details.
          </p>
          <button class="gmkb-error__button" onclick="location.reload()">
            Reload Page
          </button>
        </div>
      `;
    }
    
    // Report error
    if (window.gmkbData?.environment === 'production') {
      // TODO: Send to error tracking service
      console.error('Production error:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  setTimeout(initialize, 0);
}

// ROOT FIX: Clean exports - only what's truly needed
export {
  showToast  // From ToastService, commonly used
};
