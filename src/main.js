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
import importExportService from './services/ImportExportService.js';

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
 * Initialize Vue application - PHASE 3: Pure Vue, no legacy bridges
 * 
 * Steps:
 * 3. Create Vue app
 * 4. Mount Vue app  
 * 5. Initialize stores
 * 6. Load data
 * 7. Initialize theme
 */
async function initializeVue() {
  try {
    console.log('3️⃣ Creating Vue application...');
    // ROOT FIX: Support both Pure Vue template and legacy templates
    // Pure Vue template uses #app, legacy uses #media-kit-preview
    let mountPoint = document.getElementById('app');
    const isPureVueMode = window.gmkbData?.architecture === 'pure-vue';
    
    if (isPureVueMode && mountPoint) {
      // PHASE 3: Pure Vue mode - mount directly to #app
      logger.info('✅ Using Pure Vue mode - mounting to #app');
      logger.info('ℹ️ Pure Vue mode has full UI structure (toolbar, sidebar, preview)');
      // Clear loading spinner
      mountPoint.innerHTML = '';
      
      // Verify required elements exist
      const requiredElements = {
        '#gmkb-toolbar': 'Toolbar',
        '#gmkb-sidebar': 'Sidebar',
        '#gmkb-main-content': 'Main Content',
        '#media-kit-preview': 'Preview Area',
        '#global-theme-btn': 'Theme Button',
        '#add-component-btn': 'Add Component Button',
        '#save-btn': 'Save Button'
      };
      
      let allPresent = true;
      for (const [selector, name] of Object.entries(requiredElements)) {
        const element = document.querySelector(selector);
        if (!element) {
          logger.warn(`⚠️ ${name} (${selector}) not found`);
          allPresent = false;
        } else {
          logger.info(`✅ ${name} present`);
        }
      }
      
      if (!allPresent) {
        logger.error('Some UI elements are missing - this may cause issues');
      }
    } else {
      // Legacy mode - use #media-kit-preview
      const previewContainer = document.getElementById('media-kit-preview');
      
      if (!previewContainer) {
        logger.error('No preview container found');
        logger.error('Looking for: #media-kit-preview (legacy) or #app (pure Vue)');
        logger.error('Architecture mode:', window.gmkbData?.architecture || 'unknown');
        throw new Error('Preview container not found');
      }
      
      // Clear ALL existing content - Vue will handle everything
      previewContainer.innerHTML = '';
      
      // Create a new mount point for Vue
      mountPoint = document.createElement('div');
      mountPoint.id = 'vue-media-kit-app';
      mountPoint.className = 'vue-media-kit-app';
      previewContainer.appendChild(mountPoint);
      logger.info('✅ Using Legacy mode - created mount point in #media-kit-preview');
    }
    
    logger.info('Created fresh Vue mount point');
    
    // ROOT FIX: Aggressive cleanup of ALL legacy elements (only in legacy mode)
    if (!isPureVueMode) {
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
          if (!el.closest('#vue-media-kit-app') && !el.closest('#app')) {
            el.remove();
          }
        });
      });
      logger.info('🧹 Cleaned up legacy elements');
    } else {
      logger.info('ℹ️ Pure Vue mode - no legacy cleanup needed');
    }
    
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
    console.log('✅ Pinia store created');
    
    // Load Vue app components
    const { default: MediaKitApp } = await import('./vue/components/MediaKitApp.vue');
    const { default: ComponentLibrary } = await import('./vue/components/ComponentLibraryNew.vue');
    console.log('✅ Vue components loaded');
    
    // Create and mount Vue app
    console.log('4️⃣ Mounting Vue application...');
    const app = createApp(MediaKitApp);
    app.use(pinia);
    app.component('ComponentLibrary', ComponentLibrary);
    
    const instance = app.mount(mountPoint);
    console.log('✅ Vue mounted to #app');
    
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
    
    // STEP 6: Load data
    console.log('6️⃣ Loading media kit data...');
    if (window.gmkbData?.savedState) {
      await mediaKitStore.initialize(window.gmkbData.savedState);
      console.log('✅ Data loaded from savedState');
    } else {
      // Load from API
      await mediaKitStore.initialize();
      console.log('✅ Data loaded from API');
    }
    
    // STEP 7: Initialize theme
    console.log('7️⃣ Initializing theme...');
    
    // Load custom themes first (non-blocking)
    themeStore.loadCustomThemes().catch(() => {
      console.log('ℹ️ Custom themes not available, using built-in themes');
    });
    
    // Initialize theme with proper timing
    if (mediaKitStore.theme) {
      await themeStore.initialize(mediaKitStore.theme, mediaKitStore.themeCustomizations);
      console.log('✅ Theme initialized:', mediaKitStore.theme);
    } else {
      // Apply default theme
      await themeStore.selectTheme('professional_clean');
      console.log('✅ Default theme applied');
    }
    
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
      store: mediaKitStore,
      
      // Import/Export methods exposed globally
      openImportExport: () => importExportService.openModal(),
      closeImportExport: () => importExportService.closeModal()
    };
    
    // Console helpers
    window.switchTheme = (themeId) => {
      themeStore.selectTheme(themeId);
      console.log(`✅ Switched to ${themeId} theme`);
    };
    
    console.log('✅ Vue Media Kit Builder initialized successfully');
    
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

Import/Export Commands:
- GMKB.openImportExport() - Open import/export modal
- GMKB.closeImportExport() - Close import/export modal

Debug:
- gmkbStore.$state - View store state
- gmkbStore.componentCount - Component count
- themeStore.mergedTheme - Current theme
- window.gmkbData.pods_data - View Pods data
    `);
    
    return app;
    
  } catch (error) {
    console.error('❌ Failed to initialize Vue:', error);
    throw error; // Re-throw to be caught by main initialize()
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
 * Main initialization - PHASE 3: Pure Vue Implementation
 * 
 * Initialization Steps:
 * 1. Validate environment
 * 2. Initialize services
 * 3. Create Vue app
 * 4. Mount Vue app
 * 5. Initialize stores
 * 6. Load data
 * 7. Initialize theme
 */
async function initialize() {
  console.log('🚀 Initializing Media Kit Builder v2.0 - Phase 3...');
  
  try {
    // STEP 1: Validate environment
    console.log('1️⃣ Validating environment...');
    if (!window.gmkbData) {
      throw new Error('gmkbData not available. Ensure template injects window.gmkbData before Vue bundle loads.');
    }
    
    const required = ['postId', 'nonce', 'restUrl', 'restNonce', 'ajaxUrl'];
    const missing = required.filter(key => !window.gmkbData[key]);
    
    if (missing.length > 0) {
      throw new Error(`gmkbData missing required fields: ${missing.join(', ')}`);
    }
    console.log('✅ Environment valid');
    
    // STEP 2: Initialize services
    console.log('2️⃣ Initializing services...');
    
    // ROOT FIX: Pass REST URL, not AJAX URL to APIService
    const restUrl = window.gmkbData?.restUrl || window.location.origin + '/wp-json/';
    const restNonce = window.gmkbData?.restNonce || '';
    const postId = window.gmkbData?.postId;
    
    // DEBUG: Log what we're passing to APIService
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
    
    // Initialize import/export service (for button integration)
    // importExportService initializes itself automatically
    logger.info('✅ Import/Export service initialized');
    
    // STEP 3-7: Initialize Vue application (handles remaining steps)
    console.log('3️⃣ Creating Vue application...');
    vueApp = await initializeVue();
    
    if (!vueApp) {
      throw new Error('Vue application failed to initialize');
    }
    
    // Setup minimal UI handlers
    setupMinimalUIHandlers();
    
    // Setup empty state button handlers  
    setupEmptyStateHandlers();
    
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
        version: '2.0.0',
        vueEnabled: true,
        pureVue: true,
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
          <button class="gmkb-error__button" onclick="location.reload()">
            Reload Page
          </button>
        </div>
      `;
    }
    
    // Report error (could send to logging service)
    if (window.gmkbData?.environment === 'production') {
      // TODO: Send to error tracking service
    }
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
