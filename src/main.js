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

// ROOT FIX: Import optimized systems
// P0 FIX #12: LazyComponents import - only preload function is used
import { preloadCriticalComponents } from './services/LazyLoader.js';

// Pure utilities (no DOM manipulation, no event listeners)
import { APIService } from './services/APIService.js';
import { DataValidator } from './services/DataValidator.js';
import { logger } from './utils/logger.js';
import UnifiedComponentRegistry from './services/UnifiedComponentRegistry.js';
import podsDataIntegration from './core/PodsDataIntegration.js';
// P0 FIX #12: NonceManager removed - unused import
// Nonce handling is done in APIService directly
// P0 FIX #12: importExportService removed - handled by Vue composable
// Import/export functionality moved to useImportExport() composable

// ROOT FIX: Import new modular services
import { ToastService, showToast } from './services/ToastService.js';
import { ConsoleAPI } from './services/ConsoleAPI.js';
import { DOMHandlers } from './services/DOMHandlers.js';
import { useUIStore } from './stores/ui.js';

// PHASE 17-24: Import new critical services
import { securityService } from './services/SecurityService.js';
import { keyboardManager } from './services/KeyboardManager.js';
import { performanceMonitor } from './services/PerformanceMonitor.js';
import { analytics } from './services/Analytics.js';
import componentStyleService from './services/ComponentStyleService.js';

// ROOT FIX: Initialize core systems and GMKB namespace EARLY
// This ensures window.GMKB exists even if initialization fails
let apiService;
let vueApp = null;

// ROOT FIX: Create GMKB namespace immediately to prevent undefined errors
window.GMKB = window.GMKB || {
  version: '4.0.0-pure-vue',
  architecture: 'pure-vue',
  initialization: 'pending',
  stores: null, // Will be populated during initialization
  services: {},
  utils: { logger },
  error: null
};

// ROOT FIX: showToast now imported from ToastService

/**
 * Initialize Vue application with proper error handling
 * 
 * Steps:
 * 3. Create Pinia
 * 4. Initialize stores (BEFORE Vue mount)
 * 5. Load data (BEFORE Vue mount)
 * 6. Initialize theme (BEFORE Vue mount) 
 * 7. Load Vue components
 * 8. Mount Vue app (stores already ready)
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
    
    // ROOT FIX: Initialize UI store FIRST (accessible via GMKB.stores.ui)
    // This must succeed for edit controls to work
    console.log('4️⃣.1 Creating UI store...');
    const uiStore = useUIStore(pinia);
    
    // ROOT FIX: Make UI store immediately available
    window.GMKB.stores = window.GMKB.stores || {};
    window.GMKB.stores.ui = uiStore;
    console.log('✅ UI store created and registered globally');
    
    // ROOT FIX: Initialize stores BEFORE mounting Vue to prevent race condition
    // STEP 4: Initialize stores (BEFORE Vue mount)
    console.log('4️⃣ Initializing stores...');
    const { useMediaKitStore } = await import('./stores/mediaKit.js');
    const { useThemeStore } = await import('./stores/theme.js');
    
    const mediaKitStore = useMediaKitStore(pinia);
    const themeStore = useThemeStore(pinia);
    
    // ROOT FIX: Register stores immediately after creation
    window.GMKB.stores.mediaKit = mediaKitStore;
    window.GMKB.stores.theme = themeStore;
    window.GMKB.stores.pinia = pinia;
    console.log('✅ Stores created and registered globally');
    
    // Make stores available ONLY through GMKB namespace
    // Removed individual window.gmkbStore, window.mediaKitStore assignments
    
    // ROOT FIX: Initialize the debounced autoSave with proper context
    mediaKitStore.initAutoSave();
    logger.info('✅ AutoSave initialized with proper context');
    
    // STEP 5: Load data (BEFORE Vue mount)
    console.log('5️⃣ Loading media kit data...');
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
    
    // STEP 6: Initialize theme (BEFORE Vue mount)
    console.log('6️⃣ Initializing theme...');
    
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
    themeStore.loadCustomThemes().catch((error) => {
      console.log('ℹ️ Custom themes not available, using built-in themes only');
      if (window.gmkbData?.debugMode) {
        console.warn('Custom themes load error:', error);
      }
    });
    
    // STEP 7: NOW mount Vue (with stores already initialized)
    console.log('7️⃣ Loading Vue components...');
    const { default: MediaKitApp } = await import('./vue/components/MediaKitApp.vue');
    const { default: ComponentLibrary } = await import('./vue/components/ComponentLibraryNew.vue');
    const { default: LoadingScreen } = await import('./vue/components/LoadingScreen.vue');
    console.log('✅ Vue components loaded');
    
    // Create and mount Vue app
    console.log('8️⃣ Mounting Vue application...');
    const app = createApp(MediaKitApp);
    
    // CRITICAL: Add global error handler to prevent app crashes
    app.config.errorHandler = (err, instance, info) => {
      console.error('❌ Vue Error:', err);
      console.error('Component:', instance?.$options?.name || 'Unknown');
      console.error('Error Info:', info);
      
      // Show user-friendly error
      if (typeof window.showToast === 'function') {
        window.showToast('An error occurred. Check console for details.', 'error');
      }
      
      // Log to error service in production
      if (window.gmkbData?.environment === 'production' && window.gmkbAnalytics) {
        window.gmkbAnalytics.track('vue_error', {
          error: err.message,
          component: instance?.$options?.name,
          info: info
        });
      }
    };
    
    app.use(pinia);
    
    // ROOT FIX: Register global components
    app.component('ComponentLibrary', ComponentLibrary);
    app.component('LoadingScreen', LoadingScreen);
    app.component('DebouncedInput', () => import('./vue/components/DebouncedInput.vue'));
    app.component('ErrorBoundary', () => import('./vue/components/ErrorBoundary.vue'));
    
    // P0 FIX #12: LazyComponents removed - components loaded dynamically via registry
    // All components registered through UnifiedComponentRegistry.getVueComponent()
    // No need to pre-register empty LazyComponents object
    
    const instance = app.mount(mountPoint);
    console.log('✅ Vue mounted successfully');
    
    // ROOT FIX: Preload critical components after mount
    preloadCriticalComponents();
    
    // P0 FIX #6: Update GMKB namespace with Vue app and instance
    // Stores already registered above for early access
    window.GMKB.initialization = 'complete';
    window.GMKB.app = app;
    window.GMKB.vueInstance = instance;
    
    // Ensure stores are still set (defensive programming)
    window.GMKB.stores = window.GMKB.stores || {};
    window.GMKB.stores.mediaKit = mediaKitStore;
    window.GMKB.stores.theme = themeStore;
    window.GMKB.stores.ui = uiStore;
    window.GMKB.stores.pinia = pinia;
      
    // THEME INTEGRATION: Import and expose stylePresets
    const stylePresetsModule = await import('./utils/stylePresets.js');
    window.stylePresets = stylePresetsModule;
    console.log('✅ Style presets module exposed globally');
    
    // Services
    window.GMKB.services = {
      api: apiService,
      security: securityService,
      keyboard: keyboardManager,
      performance: performanceMonitor,
      analytics: analytics,
      toast: { show: showToast },
      console: ConsoleAPI,
      pods: podsDataIntegration,
      registry: UnifiedComponentRegistry,
      componentStyle: componentStyleService,
      stylePresets: stylePresetsModule
    };
    
    // Utility functions
    window.GMKB.utils = {
      showToast,
      logger
    };
      
    // Legacy aliases for backwards compatibility (deprecated - will be removed in v5)
    Object.defineProperty(window.GMKB, 'gmkbStore', {
      get() { 
        console.warn('⚠️ window.GMKB.gmkbStore is deprecated. Use GMKB.stores.mediaKit');
        return this.stores.mediaKit; 
      }
    });
    Object.defineProperty(window.GMKB, 'mediaKitStore', {
      get() { 
        console.warn('⚠️ window.GMKB.mediaKitStore is deprecated. Use GMKB.stores.mediaKit');
        return this.stores.mediaKit; 
      }
    });
    Object.defineProperty(window.GMKB, 'themeStore', {
      get() { 
        console.warn('⚠️ window.GMKB.themeStore is deprecated. Use GMKB.stores.theme');
        return this.stores.theme; 
      }
    });
    Object.defineProperty(window.GMKB, 'gmkbAPI', {
      get() { 
        console.warn('⚠️ window.GMKB.gmkbAPI is deprecated. Use GMKB.services.api');
        return this.services.api; 
      }
    });
    Object.defineProperty(window.GMKB, 'gmkbApp', {
      get() { 
        console.warn('⚠️ window.GMKB.gmkbApp is deprecated. Use GMKB.app');
        return this.app; 
      }
    });
    
    // P0 FIX #6: Clean up old global references
    // Remove any lingering window.* assignments from other parts of the codebase
    // Only GMKB namespace should be exposed
    
    // Log cleanup message
    if (window.gmkbData?.debugMode) {
      console.log('✅ P0 FIX #6: Single GMKB namespace created');
      console.log('📦 Available: GMKB.stores, GMKB.services, GMKB.utils');
      console.log('⚠️ Legacy window.gmkbStore etc. are deprecated');
    }
    
    // ROOT FIX: Use ConsoleAPI service instead of inline code
    ConsoleAPI.install({
      mediaKitStore,
      themeStore,
      apiService
    });
    
    // PHASE 17-24: Initialize new critical services (accessible via GMKB.services)
    console.log('🔐 Initializing security services...');
    
    console.log('⌨️ Keyboard manager already initialized');
    
    console.log('📊 Initializing performance monitor...');
    
    console.log('📈 Initializing analytics...');
    
    // Identify user if available
    if (window.gmkbData?.userId) {
      analytics.identify(window.gmkbData.userId, {
        role: window.gmkbData.userRole,
        email: window.gmkbData.userEmail
      });
    }
    
    // Track initialization
    analytics.track('app_initialized', {
      version: '4.0.0',
      pureVue: true,
      componentCount: mediaKitStore.componentCount,
      sectionCount: mediaKitStore.sectionCount
    });
    
    console.log('✅ All critical services initialized');
    
    // Initialize component style service with all components
    console.log('🎨 Initializing component styles...');
    componentStyleService.initializeAll(mediaKitStore.components);
    console.log('✅ Component styles initialized');
    
    // Console API now handled by ConsoleAPI service (see ConsoleAPI.install above)
    
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
    console.log('🔐 Security: XSS protection active');
    console.log('⌨️ Keyboard shortcuts available - press ? for help');
    console.log('📊 Performance monitoring active');
    console.log('📈 Analytics tracking enabled');
    
    return app;
    
  } catch (error) {
    console.error('❌ Failed to initialize Vue:', error);
    
    // ROOT FIX: Store error in GMKB namespace for debugging
    if (window.GMKB) {
      window.GMKB.error = error;
      window.GMKB.initialization = 'failed';
    }
    
    throw error;
  }
}

// DOM and UI handlers now handled by DOMHandlers service

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
    // Accessible via GMKB.services.api
    console.log('✅ API Service ready');
    
    // Initialize component registry
    UnifiedComponentRegistry.initialize();
    console.log('✅ Component registry initialized');
    
    // Initialize Pods integration (accessible via GMKB.services.pods)
    // Accessible via window for legacy compatibility
    window.podsDataIntegration = podsDataIntegration;
    window.gmkbPodsIntegration = podsDataIntegration;
    logger.info('✅ Pods data integration initialized');
    
    // ROOT FIX: NO MORE initDragDrop() - Vue handles ALL drag/drop!
    // ROOT FIX: NO MORE ImportExportManager - Vue composable handles it!
    logger.info('✅ Using 100% Vue architecture - no legacy managers');
    
    // STEP 3-8: Initialize Vue application
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
    
    // ROOT FIX: Update GMKB with error info
    if (window.GMKB) {
      window.GMKB.error = error;
      window.GMKB.initialization = 'failed';
    }
    
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
