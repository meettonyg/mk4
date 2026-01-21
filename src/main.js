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

// ROOT FIX: Import global builder structure CSS
// This gets bundled into dist/gmkb.css by Vite
import './styles/builder.css';

// ROOT FIX: Import ENTIRE design system (includes sections.css with responsive rules)
// CRITICAL: This ensures device-mobile and device-tablet classes work properly
import '../design-system/index.css';

// Vue 3 imports
import { createApp } from 'vue';
import { createPinia } from 'pinia';

// CRITICAL FIX: Import XSS Sanitizer BEFORE anything else
import XSSSanitizer from './services/XSSSanitizer.js';

// ROOT FIX: Import optimized systems
// P0 FIX #12: LazyComponents import - only preload function is used
import { preloadCriticalComponents } from './services/LazyLoader.js';

// Pure utilities (no DOM manipulation, no event listeners)
import { APIService } from './services/APIService.js';
import { DataValidator } from './services/DataValidator.js';
import { logger } from './utils/logger.js';
import UnifiedComponentRegistry from './services/UnifiedComponentRegistry.js';
import profileDataIntegration from './core/ProfileDataIntegration.js';
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
// ROOT FIX: Import StorageService for centralized localStorage access
import storageService from './services/StorageService.js';

// ROOT FIX: Initialize core systems and GMKB namespace EARLY
// This ensures window.GMKB exists even if initialization fails
let apiService;
let vueApp = null;

// ARCHITECTURE FIX: Initialization guard to prevent race conditions
// Phase 1 Compliance: Event-Driven Initialization (no double execution)
// CRITICAL: Must be on window to prevent duplicate script loads from re-initializing
window.gmkbIsInitialized = window.gmkbIsInitialized || false;
console.log('🐛 DEBUG: Guard initialized, value:', window.gmkbIsInitialized);

// ARCHITECTURE FIX: Robust namespace initialization
// Phase 1 Compliance: No global object sniffing, declarative pattern
// Ensures .services always exists even if GMKB pre-exists
window.GMKB = window.GMKB || {};
console.log('🐛 DEBUG: GMKB exists:', !!window.GMKB, 'services exists:', !!window.GMKB.services);

// Merge defaults ensuring sub-objects are always defined
Object.assign(window.GMKB, {
  version: window.GMKB.version || '4.0.0-pure-vue',
  architecture: window.GMKB.architecture || 'pure-vue',
  initialization: window.GMKB.initialization || 'pending',
  stores: window.GMKB.stores || null,
  services: window.GMKB.services || {}, // CRITICAL: Always ensure services exists
  utils: window.GMKB.utils || { logger },
  error: window.GMKB.error || null
});
console.log('🐛 DEBUG: After Object.assign, services:', window.GMKB.services, 'type:', typeof window.GMKB.services);

// CRITICAL: Explicitly ensure XSS services exist
// This prevents "Cannot read properties of undefined" errors
window.GMKB.services.xss = window.GMKB.services.xss || XSSSanitizer;
window.GMKB.services.security = window.GMKB.services.security || XSSSanitizer;
console.log('🐛 DEBUG: After XSS setup, services.xss:', !!window.GMKB.services.xss, 'services.security:', !!window.GMKB.services.security);

// CRITICAL FIX: Add debug command immediately
window.GMKB.debugSanitization = (value, fieldName = '') => {
  const xss = window.GMKB.services.xss;
  if (!xss) {
    console.error('XSS Sanitizer not available');
    return;
  }
  
  console.log('🔍 Sanitization Debug');
  console.log('Input:', value);
  console.log('Field Name:', fieldName || 'not provided');
  console.log('Detected Type:', xss.detectDataType(value, fieldName));
  console.log('Sanitized Result:', xss.sanitizeValue(value, fieldName));
  
  // Test all methods
  console.log('\nMethod Results:');
  console.log('- sanitizeText():', xss.sanitizeText(value));
  console.log('- sanitizeURL():', xss.sanitizeURL(value));
  console.log('- sanitizeHTML():', xss.sanitizeHTML(value));
  
  return xss.sanitizeValue(value, fieldName);
};

console.log('🐛 DEBUG: === NAMESPACE SETUP COMPLETE ===');
console.log('🐛 DEBUG: Final window.GMKB:', window.GMKB);
console.log('🐛 DEBUG: Final window.GMKB.services:', window.GMKB.services);
console.log('🐛 DEBUG: Has xss?', !!window.GMKB.services?.xss);

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
  console.log('🐛 DEBUG: === initializeVue() START ===');
  console.log('🐛 DEBUG: window.GMKB at start:', window.GMKB);
  console.log('🐛 DEBUG: window.GMKB.services at start:', window.GMKB.services);
  console.log('🐛 DEBUG: Guard value:', window.gmkbIsInitialized);
  
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
    
    // ROOT FIX: Legacy systems no longer loaded - pure Vue architecture
    // No global object checks needed - if they exist, they're already inert
    // Vue handles ALL rendering, state management, and component lifecycle

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
    const { useTemplateStore } = await import('./stores/templates.js');

    const mediaKitStore = useMediaKitStore(pinia);
    const themeStore = useThemeStore(pinia);
    const templateStore = useTemplateStore(pinia);

    // ROOT FIX: Register stores immediately after creation
    window.GMKB.stores.mediaKit = mediaKitStore;
    window.GMKB.stores.theme = themeStore;
    window.GMKB.stores.templates = templateStore;
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
    
    // STEP 5.5: Set initial view based on content state
    console.log('5️⃣.5 Setting initial view...');
    const hasExistingContent = mediaKitStore.sections.length > 0 ||
                               Object.keys(mediaKitStore.components).length > 0;

    if (hasExistingContent) {
      // Has content - go directly to builder
      uiStore.showBuilder();
      console.log('✅ Existing content found - showing builder');
    } else {
      // No content - show template directory first
      uiStore.showTemplateDirectory();
      console.log('✅ No content - showing template directory');

      // Pre-fetch templates for faster selection
      templateStore.fetchTemplates().catch(err => {
        console.warn('⚠️ Template pre-fetch failed:', err);
      });
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
    
    // CRITICAL: Add global error handler to prevent app crashes and identify problematic components
    app.config.errorHandler = (err, instance, info) => {
      console.error('❌ Vue Error:', err);
      console.error('Component:', instance?.$options?.name || instance?.$?.type?.name || 'Unknown');
      console.error('Component Props:', instance?.$props);
      console.error('Error Info:', info);
      console.error('Full Instance:', instance);
      
      // Extract component details
      const componentId = instance?.$props?.componentId || instance?.$attrs?.['data-component-id'];
      if (componentId) {
        console.error('🔍 Failed Component ID:', componentId);
        const componentData = window.gmkbData?.savedState?.components?.[componentId];
        if (componentData) {
          console.error('🔍 Component Data:', componentData);
          console.error('🔍 Component Type:', componentData.type);
        }
      }
      
      // Show user-friendly error
      if (typeof window.showToast === 'function') {
        window.showToast(
          `Error in ${instance?.$options?.name || 'component'}: ${err.message}`,
          'error'
        );
      }
      
      // Log to error service in production
      if (window.gmkbData?.environment === 'production' && window.gmkbAnalytics) {
        window.gmkbAnalytics.track('vue_error', {
          error: err.message,
          component: instance?.$options?.name,
          componentId: componentId,
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
    
    // RESET FUNCTIONALITY: Register reset button components globally
    app.component('ComponentResetButton', () => import('./vue/components/ui/ComponentResetButton.vue'));
    app.component('SectionResetButton', () => import('./vue/components/ui/SectionResetButton.vue'));
    app.component('GlobalResetModal', () => import('./vue/components/ui/GlobalResetModal.vue'));
    
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
    window.GMKB.stores.templates = templateStore;
    window.GMKB.stores.ui = uiStore;
    window.GMKB.stores.pinia = pinia;
      
    // THEME INTEGRATION: Import and expose stylePresets
    const stylePresetsModule = await import('./utils/stylePresets.js');
    window.stylePresets = stylePresetsModule;
    console.log('✅ Style presets module exposed globally');
    
    // ROOT FIX: Enable dynamic CSS loading for components added after page load
    // This solves the issue where wp_enqueue_style() only runs during initial PHP render
    console.log('🎨 Enabling dynamic component CSS loading...');
    const { useDynamicComponentStyles } = await import('./composables/useDynamicComponentStyles.js');
    const dynamicStyles = useDynamicComponentStyles();
    
    // Enable auto-loading: watches store.components and loads CSS when new components added
    dynamicStyles.enableAutoLoad();
    
    // Make available globally for debugging
    window.GMKB.dynamicStyles = dynamicStyles;
    console.log('✅ Dynamic CSS loading enabled - components will load their CSS when added');
    
    console.log('🐛 DEBUG: Before service assignment');
    console.log('🐛 DEBUG: window.GMKB:', window.GMKB);
    console.log('🐛 DEBUG: window.GMKB.services:', window.GMKB.services);
    console.log('🐛 DEBUG: typeof window.GMKB.services:', typeof window.GMKB.services);
    console.log('🐛 DEBUG: window.GMKB.services.xss:', window.GMKB.services?.xss);
    
    // ARCHITECTURE FIX: Safe service assignment using Object.assign
    // Phase 2 Compliance: Simplicity first, no dangerous spread operators
    // XSS sanitizer already set during namespace creation
    Object.assign(window.GMKB.services, {
      api: apiService,
      security: window.GMKB.services.xss || XSSSanitizer, // Ensure it's set
      keyboard: keyboardManager,
      performance: performanceMonitor,
      analytics: analytics,
      toast: { show: showToast },
      console: ConsoleAPI,
      profile: profileDataIntegration,
      registry: UnifiedComponentRegistry,
      componentStyle: componentStyleService,
      stylePresets: stylePresetsModule,
      storage: storageService // ROOT FIX: Centralized localStorage access
    });
    
    // Utility functions
    window.GMKB.utils = {
      showToast,
      logger
    };
    
    // ROOT FIX: Single namespace pattern - no legacy aliases
    // Everything accessed through GMKB.stores.* and GMKB.services.*
    if (window.gmkbData?.debugMode) {
      console.log('✅ Single GMKB namespace created');
      console.log('📦 Available: GMKB.stores, GMKB.services, GMKB.utils');
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
    
    // ROOT FIX: Set up reactivity watcher for style updates
    // CRITICAL FIX: Watch $state.components instead of components getter
    // This ensures Vue's reactivity system properly detects all changes
    console.log('👁️ Setting up component style watcher...');
    
    // Import watch from Vue
    const { watch } = await import('vue');
    
    // ROOT FIX: Watch the store's $state.components directly
    // The getter-based approach was missing deeply nested changes
    watch(
      () => mediaKitStore.$state.components,
      () => {
        console.log('🔥 WATCHER FIRED! Updating all component styles');
        
        // Force update ALL component styles
        Object.entries(mediaKitStore.components).forEach(([id, comp]) => {
          if (comp?.settings) {
            componentStyleService.applyStyling(id, comp.settings);
          }
        });
      },
      { deep: true, immediate: false } // immediate: false to avoid double-render on init
    );
    
    console.log('✅ Component style watcher active (watching $state.components)');
    
    
    // Console API now handled by ConsoleAPI service (see ConsoleAPI.install above)
    
    console.log('✅ Vue Media Kit Builder initialized successfully');
    
    // Debug info
    setTimeout(() => {
      console.log('📊 Profile Data Check:');
      const profileData = window.gmkbData?.profile_data || window.gmkbData?.profileData || {};
      const fieldCount = Object.keys(profileData).length;
      console.log(`  Fields loaded: ${fieldCount}`);
      if (fieldCount > 0) {
        console.log('  Available fields:', Object.keys(profileData).slice(0, 5));
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
  console.log('🐛 DEBUG: initialize() called, guard value:', window.gmkbIsInitialized);
  console.log('🐛 DEBUG: window.GMKB.services at start of initialize():', window.GMKB.services);

  if (typeof window.gmkbData === 'undefined' && window.gmkbStandaloneTools) {
    console.info('ℹ️ GMKB: gmkbData not found, skipping builder initialization for standalone tools.');
    return;
  }
  
  // ARCHITECTURE FIX: Initialization guard - prevents race conditions
  // Phase 1 Compliance: Event-driven, single execution only
  // CRITICAL: Check GLOBAL flag to prevent duplicate script loads
  if (window.gmkbIsInitialized) {
    console.warn('⚠️ GMKB: Prevented duplicate initialization attempt (duplicate script detected)');
    console.log('🐛 DEBUG: Blocked second initialization, returning early');
    return;
  }
  window.gmkbIsInitialized = true;
  console.log('🐛 DEBUG: Set guard to true, proceeding with initialization');
  
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
    
    // Initialize profile data integration (accessible via GMKB.services.profile)
    window.profileDataIntegration = profileDataIntegration;
    logger.info('✅ Profile data integration initialized');
    
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

/**
 * Check if we're on a standalone tools page (not Media Kit Builder)
 */
function isStandaloneToolsPage() {
  // Check for standalone tools global data (set by PHP)
  if (window.gmkbStandaloneTools || window.gmkbPublicData || window.gmkbToolPageData) {
    // But only if gmkbData is NOT set (Media Kit Builder context)
    if (!window.gmkbData) {
      return true;
    }
  }

  // Check for standalone tool DOM elements
  const standaloneSelectors = [
    '[data-gmkb-tool]',
    '[data-mode="embedded"]',
    '[data-gmkb-page-type="tool"]',
    '[data-gmkb-page-type="directory"]'
  ];

  for (const selector of standaloneSelectors) {
    if (document.querySelector(selector)) {
      return true;
    }
  }

  return false;
}

/**
 * Initialize standalone tools using seo-tools-entry logic
 */
async function initializeStandaloneTools() {
  console.log('🔧 Initializing Standalone Tools mode...');

  // Dynamically import the seo-tools-entry module
  try {
    const seoToolsModule = await import('./seo-tools-entry.js');
    console.log('✅ Standalone Tools initialized');
  } catch (error) {
    console.error('❌ Failed to initialize standalone tools:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (isStandaloneToolsPage()) {
      initializeStandaloneTools();
    } else {
      initialize();
    }
  });
} else {
  setTimeout(() => {
    if (isStandaloneToolsPage()) {
      initializeStandaloneTools();
    } else {
      initialize();
    }
  }, 0);
}

// ROOT FIX: No exports needed - everything accessible via window.GMKB
// Removed: export { showToast } - this was causing Vite to replace window.GMKB
