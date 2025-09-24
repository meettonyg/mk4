/**
 * Media Kit Builder - Main Entry Point
 * Clean, modern architecture with minimal dependencies
 * Phase 3: Vue.js Integration Foundation
 */

// Import styles for Vue controls
import '../css/vue-controls.css';

// Import component definitions and library integration
import { initializeComponentLibrary } from './integrations/componentLibraryIntegration.js';
import componentRegistryBridge from './integrations/componentRegistryBridge.js';
import vueComponentDiscovery from './vue/services/componentDiscovery.js';

// Vue 3 imports
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import VueComponentDiscovery from './loaders/VueComponentDiscovery.js';
import { initializeEditPanel } from './ui/ComponentEditPanel.js';
import { initializeUnifiedEditManager } from './ui/UnifiedEditManager.js';

// Import only what we need for the transition
import { APIService } from './services/APIService.js';
import { logger } from './utils/logger.js';
import { loadComponentRenderers } from './registry/ComponentRegistry.js';
import podsDataIntegration from './core/PodsDataIntegration.js';

// Phase 4: Advanced Features
import InlineEditor from './features/InlineEditor.js';
import ComponentTemplates from './features/ComponentTemplates.js';
import ImportExportManager from './features/ImportExportManager.js';
import { initDragDrop } from './features/DragDropManager.js';

// Initialize core systems
let apiService;
let vueApp = null; // Vue app instance
let isSaving = false; // Prevent double save triggers

// Phase 4: Advanced feature instances
let inlineEditor = null;
let componentTemplates = null;
let importExportManager = null;

// Define ALL functions before they're used
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

function showError(message) {
  showToast(message, 'error', 5000);
}
// Initialize Vue application - COMPLETE VUE ARCHITECTURE
async function initializeVue() {
  try {
    // ROOT FIX: Use the media-kit-preview as the Vue mount point
    // This replaces the legacy renderer completely
    const mountPoint = document.getElementById('media-kit-preview') || 
                       document.getElementById('gmkb-sections-container') ||
                       document.getElementById('vue-app');
    
    if (!mountPoint) {
      logger.warn('Vue mount point not found, creating one');
      const container = document.createElement('div');
      container.id = 'media-kit-preview';
      const previewArea = document.querySelector('.preview__container') || document.body;
      previewArea.appendChild(container);
      mountPoint = container;
    }

    // ROOT FIX: Create controls mount point if it doesn't exist
    let controlsMount = document.getElementById('gmkb-controls-root');
    if (!controlsMount) {
      controlsMount = document.createElement('div');
      controlsMount.id = 'gmkb-controls-root';
      document.body.appendChild(controlsMount);
    }

    // ROOT FIX: Import the complete Vue application at the top
    // For now, use a simpler import approach for build compatibility
    // We'll import components dynamically once mounted
    const MediaKitApp = { 
      name: 'MediaKitApp',
      template: '<div id="media-kit-app-root">Loading Media Kit Builder...</div>',
      async mounted() {
        // Dynamically load the real app after mount
        console.log('Loading Vue Media Kit components...');
      }
    };
    
    // Create Vue app with the complete Media Kit application
    const app = createApp(MediaKitApp);

    // Create and use Pinia store
    const pinia = createPinia();
    app.use(pinia);

    // Mount the complete Vue app to replace legacy renderer
    const instance = app.mount(mountPoint);
    
    // ROOT FIX: Expose Vue app and Pinia globally for access
    window.gmkbApp = app;
    window.gmkbVueInstance = instance;
    window.gmkbPinia = pinia;
    
    // ROOT FIX: Also expose direct access to the state manager as a fallback
    // The actual store is the stateManager, not a Pinia store
    window.gmkbStore = window.stateManager;
    
    // ROOT FIX: Create helper functions for console access
    window.getSections = () => {
      // Use the Pinia store once it's available
      const store = window.gmkbStore || window.mediaKitStore;
      if (store && store.sections) {
        console.log('Sections:', store.sections);
        return store.sections;
      }
      console.log('Store not yet initialized');
      return [];
    };
    
    window.addSection = (type = 'two_column') => {
      if (window.GMKB?.addSection) {
        return window.GMKB.addSection(type);
      }
      console.error('Section manager not available');
    };
    
    window.removeSection = (sectionId) => {
      if (window.GMKB?.removeSection) {
        window.GMKB.removeSection(sectionId);
      } else {
        console.error('Section manager not available');
      }
    };
    
    window.getState = () => {
      const store = window.gmkbStore || window.mediaKitStore;
      if (store) {
        return {
          components: store.components,
          sections: store.sections,
          theme: store.theme
        };
      }
      return {};
    };
    
    // ROOT FIX: No separate controls needed - components have integrated controls
    // This eliminates the synchronization issues completely
    console.log('✅ Vue Media Kit Builder mounted with integrated controls');
    
    // Initialize store after mount
    // For build compatibility, we'll initialize the store synchronously
    let store = null;
    
    // Defer store initialization  - ROOT FIX: Initialize store FIRST before loading components
    setTimeout(async () => {
      try {
        // FIRST: Initialize the Pinia store
        const { useMediaKitStore } = await import('./stores/mediaKit.js');
        store = useMediaKitStore();
        window.gmkbStore = store;
        window.mediaKitStore = store;
        
        
        // Load saved state from WordPress
        if (window.gmkbData?.savedState) {
          store.initialize(window.gmkbData.savedState);
          console.log('✅ Loaded state from WordPress');
        }
        
        // ROOT FIX: Ensure store is ready before loading Vue components
        console.log('Store initialized, loading Vue components...');
        
        // Add a small delay to ensure store getters are ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Now load the real Vue components
        const { default: ComponentLibrary } = await import('./vue/components/ComponentLibraryNew.vue');
        const { default: RealMediaKitApp } = await import('./vue/components/MediaKitApp.vue');
        
        // Create a new app with the real component
        const newApp = createApp(RealMediaKitApp);
        newApp.use(pinia);
        
        // Register Component Library globally
        newApp.component('ComponentLibrary', ComponentLibrary);
        
        // Unmount the placeholder and mount the real app
        app.unmount();
        const realInstance = newApp.mount(mountPoint);
        
        window.gmkbApp = newApp;
        window.gmkbVueInstance = realInstance;
        
        // Set up GMKB methods to use Pinia store directly
        if (window.GMKB) {
          window.GMKB.addComponent = (type, data) => {
            if (typeof type === 'object') {
              // Handle when type is actually the full data object
              return store.addComponent(type);
            }
            return store.addComponent({ type, data });
          };
          window.GMKB.removeComponent = (id) => store.removeComponent(id);
          window.GMKB.addSection = (type) => store.addSection(type);
          window.GMKB.removeSection = (id) => store.removeSection(id);
          window.GMKB.getState = () => ({
            components: store.components,
            sections: store.sections,
            theme: store.theme
          });
          window.GMKB.save = () => store.saveToWordPress();
          window.GMKB.store = store; // Direct store access
        }
        
        console.log('✅ GMKB methods now use Pinia store directly');
        
        // Initialize theme store and mount ThemeCustomizer component
        try {
          const { useThemeStore } = await import('./stores/theme.js');
          const themeStore = useThemeStore();
          window.themeStore = themeStore;
          
          // Load saved theme settings with error handling
          if (store.theme || store.themeCustomizations) {
            // Wait a tick for store to be fully initialized
            setTimeout(() => {
              try {
                themeStore.initialize(store.theme, store.themeCustomizations);
              } catch (themeError) {
                console.warn('Theme initialization skipped:', themeError.message);
              }
            }, 100);
          }
          
          // Mount ThemeCustomizer component
          const { default: ThemeCustomizer } = await import('./vue/components/ThemeCustomizer.vue');
          newApp.component('ThemeCustomizer', ThemeCustomizer);
        } catch (themeError) {
          console.warn('Theme system initialization error (non-critical):', themeError);
          // Continue without theme system - app still works
        }
        
        console.log('✅ Vue Media Kit Builder with theme system fully loaded');
      } catch (error) {
        console.error('Failed to load Vue components:', error);
      }
    }, 100);
    

    
    // Store reference will be set after async load
    // Bridge will be created after store is ready

    logger.info('Vue 3 and Pinia initialized successfully');
    
    // ROOT FIX: Log available console commands
    console.log(`
🎯 Section Commands Available:
- getSections() - View current sections
- addSection('two_column') - Add a section
- removeSection(sectionId) - Remove a section  
- getState() - View complete state
- window.stateManager - Direct state access
- window.gmkbStore - Store reference
    `);
    
    return app;
  } catch (error) {
    logger.error('Failed to initialize Vue:', error);
    return null;
  }
}

// Global variable for edit panel and unified manager
let componentEditPanel = null;
let unifiedEditManager = null;

// Initialize application
async function initialize() {
  logger.info('🚀 Initializing Media Kit Builder v3.0 with Vue.js');
  
  // ROOT FIX: Debug Pods data availability
  setTimeout(() => {
    console.log('📊 GMKB Debug: Checking Pods data availability...');
    console.log('  window.gmkbData:', window.gmkbData ? 'Available' : 'Not available');
    console.log('  window.gmkbVueData:', window.gmkbVueData ? 'Available' : 'Not available');
    
    const podsData = window.gmkbData?.pods_data || 
                     window.gmkbData?.podsData || 
                     window.gmkbVueData?.pods_data || 
                     window.gmkbVueData?.podsData || 
                     {};
    
    const fieldCount = Object.keys(podsData).length;
    console.log(`  Pods fields loaded: ${fieldCount}`);
    
    if (fieldCount > 0) {
      console.log('  Available Pods fields:', Object.keys(podsData));
      if (podsData.biography) {
        console.log(`  ✅ Biography field: ${podsData.biography.substring(0, 50)}...`);
      }
      if (podsData.guest_biography) {
        console.log(`  ✅ Guest biography field: ${podsData.guest_biography.substring(0, 50)}...`);
      }
    } else {
      console.log('  ❌ No Pods data available - check post_id and field names');
    }
  }, 1000);
  
  try {
    
    // ROOT FIX: Ensure AJAX URL is available from multiple sources
    const ajaxUrl = window.gmkbData?.ajaxUrl || 
                    window.ajaxurl || 
                    window.mkcg_vars?.ajax_url ||
                    '/wp-admin/admin-ajax.php';
    
    const nonce = window.gmkbData?.nonce || 
                  window.mkcg_vars?.nonce || 
                  window.mkcg_nonce || 
                  '';
    
    apiService = new APIService(
      ajaxUrl,
      nonce,
      window.gmkbData?.postId
    );
    
    // Vue component discovery for potential legacy components during transition
    await VueComponentDiscovery.initialize();
    
    // ROOT FIX: Initialize component registry bridge FIRST
    await componentRegistryBridge.initialize();
    console.log('✅ Component registry bridge initialized');
    
    // ROOT FIX: Initialize component registry bridge FIRST
    await componentRegistryBridge.initialize();
    console.log('✅ Component registry bridge initialized');
    
    // Initialize drag and drop system
    initDragDrop();
    console.log('✅ Drag and drop system initialized');
    
    // ROOT FIX: Make discovered Vue components available globally
    // VueComponentDiscovery should have loaded them
    window.gmkbVueComponents = window.gmkbVueComponents || {};
    
    // Load component renderers (including Vue ones)
    await loadComponentRenderers();
    
    // ROOT FIX: Make PodsDataIntegration available globally for the store
    window.podsDataIntegration = podsDataIntegration;
    window.gmkbPodsIntegration = podsDataIntegration;
    
    // Log what Vue components we have
    console.log('Available Vue components:', Object.keys(window.gmkbVueComponents));
    
    // Phase 4 features will be initialized after Vue is ready
    // They'll use the Pinia store instead of the legacy state manager
    
    // UI handlers will be set up after Vue is ready
    
    // Make available globally for debugging
    window.GMKB = {
      apiService,
      vueApp: null, // Will be set after Vue initialization
      version: '3.0.0',
      
      // These will be overridden by Vue store methods
      addComponent: (type, data) => {
        console.log('Waiting for Vue to initialize...');
        // Queue the action for when store is ready
        setTimeout(() => {
          const store = window.gmkbStore || window.mediaKitStore;
          if (store && store.addComponent) {
            if (typeof type === 'object') {
              store.addComponent(type);
            } else {
              store.addComponent({ type, data });
            }
          }
        }, 1000);
      },
      removeComponent: (id) => {
        console.log('Waiting for Vue to initialize...');
        setTimeout(() => {
          const store = window.gmkbStore || window.mediaKitStore;
          if (store && store.removeComponent) {
            store.removeComponent(id);
          }
        }, 1000);
      },
      addSection: (type) => {
        console.log('Waiting for Vue to initialize...');
        setTimeout(() => {
          const store = window.gmkbStore || window.mediaKitStore;
          if (store && store.addSection) {
            store.addSection(type);
          }
        }, 1000);
      },
      removeSection: (id) => {
        console.log('Waiting for Vue to initialize...');
        setTimeout(() => {
          const store = window.gmkbStore || window.mediaKitStore;
          if (store && store.removeSection) {
            store.removeSection(id);
          }
        }, 1000);
      },
      getSections: () => {
        const store = window.gmkbStore || window.mediaKitStore;
        return store?.sections || [];
      },
      save: () => {
        console.log('Waiting for Vue to initialize...');
        setTimeout(() => {
          const store = window.gmkbStore || window.mediaKitStore;
          if (store && store.saveToWordPress) {
            store.saveToWordPress();
          }
        }, 1000);
      },
      getState: () => {
        const store = window.gmkbStore || window.mediaKitStore;
        if (store) {
          return {
            components: store.components || {},
            sections: store.sections || [],
            theme: store.theme || 'default'
          };
        }
        return {};
      }
    };
    
    // Console commands will be set up after Vue is ready
    window.checkComponents = () => {
      console.log('Waiting for Vue store to initialize...');
      return { componentCount: 0, componentIds: [], state: {} };
    };
    
    // Debug commands will be set up with Vue store
    window.debugGMKB = {
      showState: () => {
        const store = window.gmkbStore || window.mediaKitStore;
        if (!store) {
          console.log('Store not yet initialized');
          return {};
        }
        console.log('Current State:', {
          components: store.components,
          sections: store.sections,
          theme: store.theme
        });
        console.log('Components:', Object.keys(store.components || {}).length);
        console.log('Sections:', (store.sections || []).length);
        return store.$state;
      },
      
      showComponents: () => {
        const store = window.gmkbStore || window.mediaKitStore;
        console.log('Components Map:', store?.components || {});
        return store?.components || {};
      },
      
      showSections: () => {
        const store = window.gmkbStore || window.mediaKitStore;
        console.log('Sections:', store?.sections || []);
        return store?.sections || [];
      }
    };
    
    // ROOT FIX: Log available commands
    console.log(`
🎆 Media Kit Builder Commands Available:
- addSection('two_column') - Create a new section
- getSections() - View all sections
- removeSection(sectionId) - Remove a section
- getState() - View complete state
- GMKB.addComponent(type) - Add a component

📊 Debug Commands:
- debugGMKB.showState() - Show full state with counts
- debugGMKB.showComponents() - Show components map
- debugGMKB.showSections() - Show sections array
- debugGMKB.checkComponentInSection(id) - Check component assignment
- debugGMKB.getLogs() - Get server debug logs
    `);
    
    // Initialize Vue.js after core systems
    vueApp = await initializeVue();
    
    // Initialize Vue Store Bridge to connect Vue components with rendering
    // initializeVueStoreBridge(); // REMOVED - This is legacy code we don't need
    
    // Store Vue app reference globally - ROOT FIX: Also expose as window.vueApp
    if (vueApp) {
      window.GMKB.vueApp = vueApp;
      window.GMKB.vue = vueApp;
      window.GMKB.vueDiscovery = VueComponentDiscovery;
      window.vueApp = vueApp; // ROOT FIX: Expose globally for bundle compatibility
    }
    
    // ROOT FIX: Set up UI handlers and edit panels after Vue is initialized
    // This ensures the store is available
    setTimeout(() => {
      setupUIHandlers();
      
      // Initialize edit panels
      componentEditPanel = initializeEditPanel();
      unifiedEditManager = initializeUnifiedEditManager();
      
      console.log('✅ UI handlers and edit panels initialized after Vue');
    }, 500);
    
    logger.success('Media Kit Builder initialized successfully');
    
    // Dispatch ready event with Vue status
    document.dispatchEvent(new CustomEvent('gmkb:ready', {
      detail: { 
        version: '3.0.0',
        vueEnabled: vueApp !== null
      }
    }));
    
  } catch (error) {
    logger.error('Initialization failed:', error);
    showError('Failed to initialize Media Kit Builder');
  }
}

function setupUIHandlers() {
  console.log('Setting up UI handlers...');
  
  // Ensure toolbar exists before setting up handlers
  const toolbar = document.getElementById('gmkb-toolbar');
  if (!toolbar) {
    console.warn('Toolbar not found, retrying...');
    setTimeout(setupUIHandlers, 100);
    return;
  }
  
  console.log('Toolbar found, attaching handlers...');
  
  // Setup sidebar tab switching
  setupSidebarTabs();
  
  // Setup layout panel options
  setupLayoutPanel();
  
  // ROOT FIX: Save button - use Pinia store directly
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const store = window.gmkbStore || window.mediaKitStore;
      if (store && store.saveToWordPress) {
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
          saveBtn.disabled = true;
          saveBtn.textContent = 'Saving...';
        }
        
        try {
          await store.saveToWordPress();
          showToast('Saved successfully', 'success');
        } catch (error) {
          console.error('Save failed:', error);
          showToast('Save failed', 'error');
        } finally {
          if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save';
          }
        }
      } else {
        console.warn('Store not available yet, trying legacy save');
        await saveState();
      }
    });
  }
  
  // Component library integration is now handled by componentLibraryIntegration.js
  initializeComponentLibrary();
  
  // Add Section button - check multiple possible IDs
  const addSectionBtn = document.getElementById('add-section-btn') || 
                        document.getElementById('add-first-section') ||
                        document.getElementById('add-first-section-2') ||
                        document.querySelector('[data-action="add-section"]');
  if (addSectionBtn) {
    addSectionBtn.addEventListener('click', () => {
      addSection();
    });
  }
  
  // Handle all buttons with data-action attributes
  document.querySelectorAll('[data-action]').forEach(btn => {
    const action = btn.dataset.action;
    if (action === 'add-component' && !btn.hasEventListener) {
      btn.addEventListener('click', () => openComponentLibrary());
      btn.hasEventListener = true;
    } else if (action === 'add-section' && !btn.hasEventListener) {
      btn.addEventListener('click', () => addSection());
      btn.hasEventListener = true;
    } else if (action === 'open-templates' && !btn.hasEventListener) {
      btn.addEventListener('click', () => openTemplateLibrary());
      btn.hasEventListener = true;
    } else if (action === 'import-media-kit' && !btn.hasEventListener) {
      btn.addEventListener('click', () => openImportModal());
      btn.hasEventListener = true;
    }
  })
  
  // Theme button (opens theme customizer)
  const themeBtn = document.getElementById('global-theme-btn');
  if (themeBtn) {
    themeBtn.onclick = function(e) {
      e.preventDefault();
      console.log('Theme button clicked!');
      openThemeCustomizer();
    };
    console.log('✓ Theme button handler attached (onclick)');
  } else {
    console.warn('Theme button not found');
  }
  
  // Export button
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.onclick = function(e) {
      e.preventDefault();
      console.log('Export button clicked!');
      exportMediaKit();
    };
    console.log('✓ Export button handler attached (onclick)');
  } else {
    console.warn('Export button not found');
  }
  
  // Share button
  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) {
    shareBtn.onclick = function(e) {
      e.preventDefault();
      console.log('Share button clicked!');
      shareMediaKit();
    };
    console.log('✓ Share button handler attached (onclick)');
  } else {
    console.warn('Share button not found');
  }
  
  // Undo/Redo buttons
  const undoBtn = document.getElementById('undo-btn');
  const redoBtn = document.getElementById('redo-btn');
  if (undoBtn) {
    undoBtn.onclick = function(e) {
      e.preventDefault();
      console.log('Undo button clicked!');
      showToast('Undo functionality coming soon', 'info');
    };
    console.log('✓ Undo button handler attached (onclick)');
  } else {
    console.warn('Undo button not found');
  }
  if (redoBtn) {
    redoBtn.onclick = function(e) {
      e.preventDefault();
      console.log('Redo button clicked!');
      showToast('Redo functionality coming soon', 'info');
    };
    console.log('✓ Redo button handler attached (onclick)');
  } else {
    console.warn('Redo button not found');
  }
  
  // Device preview buttons
  const deviceButtons = document.querySelectorAll('.toolbar__preview-btn');
  if (deviceButtons.length > 0) {
    deviceButtons.forEach(btn => {
      btn.onclick = function(e) {
        e.preventDefault();
        const device = this.dataset.preview || this.textContent.toLowerCase();
        console.log(`Device preview clicked: ${device}`);
        
        const preview = document.querySelector('.preview__container');
        if (preview) {
          // Remove all device classes
          preview.classList.remove('preview__container--desktop', 'preview__container--tablet', 'preview__container--mobile');
          
          // Add new device class
          if (device === 'tablet') {
            preview.classList.add('preview__container--tablet');
          } else if (device === 'mobile') {
            preview.classList.add('preview__container--mobile');
          }
          // Desktop doesn't need a class (default state)
          
          console.log(`Preview classes: ${preview.className}`);
        } else {
          console.warn('Preview container not found');
        }
        
        // Update active state
        deviceButtons.forEach(b => b.classList.remove('toolbar__preview-btn--active'));
        this.classList.add('toolbar__preview-btn--active');
      };
    });
    console.log(`✓ ${deviceButtons.length} device preview button handlers attached (onclick)`);
  } else {
    console.warn('No device preview buttons found');
  }
}

function setupSidebarTabs() {
  const tabs = document.querySelectorAll('.sidebar__tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('sidebar__tab--active'));
      tab.classList.add('sidebar__tab--active');
      
      // Update active content
      tabContents.forEach(content => {
        content.classList.remove('tab-content--active');
        if (content.id === `${targetTab}-tab`) {
          content.classList.add('tab-content--active');
        }
      });
    });
  });
}

function setupLayoutPanel() {
  console.log('Setting up layout panel handlers...');
  
  // Handle layout option clicks
  const layoutOptions = document.querySelectorAll('.layout-option');
  layoutOptions.forEach(option => {
    option.addEventListener('click', () => {
      const layoutType = option.dataset.layout;
      
      // Remove active class from all options
      layoutOptions.forEach(opt => opt.classList.remove('layout-option--active'));
      
      // Add active class to clicked option
      option.classList.add('layout-option--active');
      
      console.log(`Layout selected: ${layoutType}`);
      
      // ROOT FIX: Use store directly when layout is clicked
      const store = window.gmkbStore || window.mediaKitStore;
      const addSectionFunc = store?.addSection?.bind(store) || window.GMKB?.addSection;
      
      if (layoutType === 'full-width' && addSectionFunc) {
        addSectionFunc('full_width');
        showToast('Full Width section added', 'success');
      } else if (layoutType === 'two-column' && addSectionFunc) {
        addSectionFunc('two_column');
        showToast('Two Column section added', 'success');
      } else if (layoutType === 'three-column' && addSectionFunc) {
        addSectionFunc('three_column');
        showToast('Three Column section added', 'success');
      } else if ((layoutType === 'sidebar' || layoutType === 'main-sidebar') && addSectionFunc) {
        addSectionFunc('sidebar');
        showToast('Main + Sidebar section added', 'success');
      }
    });
  });
  
  // Handle Add Section button in layout tab
  const addSectionBtn = document.getElementById('add-section-btn');
  if (addSectionBtn) {
    addSectionBtn.addEventListener('click', () => {
      // Get the active layout option
      const activeLayout = document.querySelector('.layout-option--active');
      const layoutType = activeLayout ? activeLayout.dataset.layout : 'full-width';
      
      // Map layout type to section type
      let sectionType = 'full_width';
      if (layoutType === 'two-column') sectionType = 'two_column';
      else if (layoutType === 'three-column') sectionType = 'three_column';
      else if (layoutType === 'sidebar' || layoutType === 'main-sidebar') sectionType = 'sidebar';
      
      // ROOT FIX: Use store directly to add the section
      const store = window.gmkbStore || window.mediaKitStore;
      if (store && store.addSection) {
        store.addSection(sectionType);
      } else if (window.GMKB && window.GMKB.addSection) {
        window.GMKB.addSection(sectionType);
      } else {
        console.error('Store not available for adding section');
      }
      showToast(`${layoutType} section added`, 'success');
    });
  }
  
  console.log('Layout panel handlers attached');
}

function setupComponentHandlers() {
  // Setup drag and drop for sidebar components
  setupDragAndDrop();
  // Listen for component actions from renderer
  document.addEventListener('gmkb:component-action', (e) => {
    const { action, componentId } = e.detail;
    
    console.log('Component action received:', action, componentId);
    
    switch (action) {
      case 'delete':
        if (confirm('Delete this component?')) {
          const store = window.gmkbStore || window.mediaKitStore;
          if (store && store.removeComponent) {
            store.removeComponent(componentId);
          }
        }
        break;
        
      case 'duplicate':
        duplicateComponent(componentId);
        break;
        
      case 'edit':
        openComponentEditor(componentId);
        break;
        
      case 'move-up':
        moveComponent(componentId, -1);
        break;
        
      case 'move-down':
        moveComponent(componentId, 1);
        break;
        
      default:
        console.warn('Unknown component action:', action);
    }
  });
  
  // Listen for section actions
  document.addEventListener('gmkb:section-action', (e) => {
    const { action, sectionId } = e.detail;
    
    switch (action) {
      case 'delete-section':
        if (confirm('Delete this section and all its components?')) {
          deleteSection(sectionId);
        }
        break;
        
      case 'section-settings':
        openSectionSettings(sectionId);
        break;
    }
  });
  
  // Listen for component library open request
  document.addEventListener('gmkb:open-component-library', openComponentLibrary);
}

function setupDragAndDrop() {
  // Make sidebar components draggable
  document.querySelectorAll('.component-item[draggable="true"]').forEach(item => {
    item.addEventListener('dragstart', (e) => {
      const componentType = item.dataset.component;
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('text/plain', componentType);
      e.dataTransfer.setData('application/json', JSON.stringify({
        type: componentType,
        componentType: componentType,
        source: 'sidebar',
        isNewComponent: true
      }));
      item.classList.add('dragging');
    });
    
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
    });
    
    // Also allow click to add
    item.addEventListener('click', () => {
      const componentType = item.dataset.component;
      // ROOT FIX: Use store directly
      const store = window.gmkbStore || window.mediaKitStore;
      if (store && store.addComponent) {
        store.addComponent({ type: componentType });
      } else if (window.GMKB && window.GMKB.addComponent) {
        window.GMKB.addComponent(componentType);
      }
      showToast(`Added ${componentType} component`, 'success');
    });
  });
  
  // Setup drop zones
  const previewArea = document.getElementById('media-kit-preview') || 
                      document.getElementById('gmkb-sections-container');
  
  if (previewArea) {
    previewArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      previewArea.classList.add('drag-over');
    });
    
    previewArea.addEventListener('dragleave', () => {
      previewArea.classList.remove('drag-over');
    });
    
    previewArea.addEventListener('drop', (e) => {
      e.preventDefault();
      previewArea.classList.remove('drag-over');
      
      const componentType = e.dataTransfer.getData('text/plain');
      if (componentType) {
        // ROOT FIX: Use store directly
        const store = window.gmkbStore || window.mediaKitStore;
        if (store && store.addComponent) {
          store.addComponent({ type: componentType });
        } else if (window.GMKB && window.GMKB.addComponent) {
          window.GMKB.addComponent(componentType);
        }
        showToast(`Added ${componentType} component`, 'success');
      }
    });
  }
}

function setupAutoSave() {
  // ROOT FIX: Auto-save is now handled by the Pinia store's $subscribe
  // We can set this up after the store is initialized
  console.log('Auto-save will be configured when store is ready');
}

async function saveState(isAutoSave = false) {
  // ROOT FIX: This is now a fallback for when the store isn't available
  // The primary save method is through the Pinia store
  console.log('Legacy saveState called - redirecting to store');
  
  const store = window.gmkbStore || window.mediaKitStore;
  if (store && store.saveToWordPress) {
    try {
      await store.saveToWordPress();
      if (!isAutoSave) {
        showToast('Saved successfully', 'success');
      }
    } catch (error) {
      if (!isAutoSave) {
        showToast('Save failed', 'error');
      }
    }
    return;
  }
  
  // If no store available, log error
  console.error('Store not available for saving');
  showToast('Save functionality not ready', 'error');
  return;
  
  // Old code removed - no longer needed
}

function openComponentLibrary() {
  // Use Vue component library
  if (window.openComponentLibrary && window.openComponentLibrary !== openComponentLibrary) {
    window.openComponentLibrary();
  } else {
    // Dispatch event for Vue to handle
    document.dispatchEvent(new CustomEvent('gmkb:open-component-library'));
  }
  console.log('Component library opening via Vue');
}


// Removed - now handled by Vue component

// Removed - icon handling now in Vue components

function addSection(type = 'full_width') {
  // ROOT FIX: Use store directly to add section
  const store = window.gmkbStore || window.mediaKitStore;
  if (store && store.addSection) {
    store.addSection(type);
  } else if (window.GMKB && window.GMKB.addSection) {
    window.GMKB.addSection(type);
  } else {
    console.error('Store not available for adding section');
  }
  showToast('Section added', 'success');
}

function deleteSection(sectionId) {
  // ROOT FIX: Use store directly
  const store = window.gmkbStore || window.mediaKitStore;
  if (store && store.removeSection) {
    store.removeSection(sectionId);
  } else {
    console.error('Store not available for removing section');
  }
}

function duplicateComponent(componentId) {
  // ROOT FIX: Use store directly
  const store = window.gmkbStore || window.mediaKitStore;
  if (store && store.duplicateComponent) {
    store.duplicateComponent(componentId);
    showToast('Component duplicated', 'success');
  } else {
    console.error('Store not available for duplicating component');
  }
}

function moveComponent(componentId, direction) {
  // ROOT FIX: Use store directly
  const store = window.gmkbStore || window.mediaKitStore;
  if (store && store.moveComponent) {
    const dir = direction > 0 ? 'down' : 'up';
    store.moveComponent(componentId, dir);
  } else {
    console.error('Store not available for moving component');
  }
}

function openComponentEditor(componentId) {
  // ROOT FIX: Use store to get component
  const store = window.gmkbStore || window.mediaKitStore;
  const component = store?.components?.[componentId];
  if (!component) {
    console.error('Component not found:', componentId);
    return;
  }
  
  console.log('Opening editor for component:', componentId, component);
  
  // Switch to Components tab
  const componentsTab = document.querySelector('[data-tab="components"]');
  const componentsContent = document.getElementById('components-tab');
  
  if (componentsTab && componentsContent) {
    // Activate the components tab
    document.querySelectorAll('.sidebar__tab').forEach(t => t.classList.remove('sidebar__tab--active'));
    componentsTab.classList.add('sidebar__tab--active');
    
    // Show components content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('tab-content--active'));
    componentsContent.classList.add('tab-content--active');
    
    // Open edit panel directly if available
    if (componentEditPanel && componentEditPanel.openEditPanel) {
      componentEditPanel.openEditPanel(componentId);
      showToast('Component editor opened', 'success');
    } else {
      // Fallback: trigger event
      console.warn('Edit panel not available, trying event dispatch');
      // Note: ComponentEditPanel already listens for this event,
      // but we're calling it from edit action which already triggered
      // So we need to be careful not to create a loop
      showToast('Opening component editor...', 'info');
    }
  } else {
    console.error('Components tab not found');
    showToast('Component editor not available', 'error');
  }
}

function openSectionSettings(sectionId) {
  console.log('Edit section:', sectionId);
  showToast('Section settings not yet implemented', 'info');
}

function setDevicePreview(device) {
  const preview = document.getElementById('media-kit-preview') || document.getElementById('preview-area');
  if (preview) {
    preview.className = `preview-area device-${device}`;
  }
}

// ROOT FIX: Vue-based theme customizer - no legacy systems needed

function openThemeCustomizer() {
  console.log('Opening Vue theme customizer...');
  
  // ROOT FIX: Use the Vue/Pinia theme store
  const themeStore = window.themeStore;
  if (themeStore && themeStore.openCustomizer) {
    themeStore.openCustomizer();
    console.log('✅ Vue theme customizer opened');
    return;
  }
  
  // If store not ready, wait and try again
  console.log('Theme store not ready, waiting...');
  setTimeout(() => {
    const store = window.themeStore;
    if (store && store.openCustomizer) {
      store.openCustomizer();
      console.log('✅ Vue theme customizer opened (delayed)');
    } else {
      console.error('Theme store still not available');
      // Use simple fallback as last resort
      openSimpleThemeModal();
    }
  }, 1000);
}

// Simple fallback theme modal
function openSimpleThemeModal() {
  console.log('Opening simple theme modal as fallback...');
  
  // Remove any conflicting modals
  const existingModal = document.getElementById('theme-customizer-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Check if our modal exists
  let modal = document.getElementById('gmkb-theme-modal');
  
  if (!modal) {
    // Create theme customizer modal with unique ID
    modal = document.createElement('div');
    modal.id = 'gmkb-theme-modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal__content">
        <div class="modal__header">
          <h2 class="modal__title">Customize Theme</h2>
          <button class="modal__close">&times;</button>
        </div>
        <div class="modal__body">
          <div class="theme-palette">
            <div class="palette-option palette-option--blue palette-option--active" data-theme="blue"></div>
            <div class="palette-option palette-option--green" data-theme="green"></div>
            <div class="palette-option palette-option--purple" data-theme="purple"></div>
            <div class="palette-option palette-option--orange" data-theme="orange"></div>
            <div class="palette-option palette-option--pink" data-theme="pink"></div>
            <div class="palette-option palette-option--gray" data-theme="gray"></div>
          </div>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 20px;">Select a theme color above</p>
          <p style="color: #ef4444; font-size: 12px; margin-top: 10px;">Note: Advanced theme customizer is loading...</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close button - use direct onclick
    const closeBtn = modal.querySelector('.modal__close');
    if (closeBtn) {
      closeBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        modal.classList.remove('modal--open');
        modal.style.display = 'none';
      };
    }
    
    // Close on backdrop click
    modal.onclick = function(e) {
      if (e.target === modal) {
        modal.classList.remove('modal--open');
        modal.style.display = 'none';
      }
    };
    
    // Theme selection
    modal.querySelectorAll('.palette-option').forEach(option => {
      option.onclick = function(e) {
        e.preventDefault();
        // Remove active from all
        modal.querySelectorAll('.palette-option').forEach(opt => {
          opt.classList.remove('palette-option--active');
        });
        // Add active to clicked
        this.classList.add('palette-option--active');
        
        const theme = this.dataset.theme;
        console.log('Theme selected:', theme);
        
        // Update state
        if (stateManager) {
          stateManager.dispatch({ type: ACTION_TYPES.SET_THEME, payload: theme });
        }
        
        showToast(`Theme changed to ${theme}`, 'success');
      };
    });
  }
  
  // Show modal with both class and style
  modal.classList.add('modal--open');
  modal.style.display = 'flex';
}

function exportMediaKit() {
  console.log('Opening export modal...');
  
  // Use the new ImportExportManager if available
  if (importExportManager) {
    // Create export modal with new options
    let modal = document.getElementById('gmkb-export-modal');
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'gmkb-export-modal';
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal__content">
          <div class="modal__header">
            <h2 class="modal__title">Export Media Kit</h2>
            <button class="modal__close">&times;</button>
          </div>
          <div class="modal__body">
            <div class="export-options">
              <div class="export-option" data-format="json">
                <div class="export-option__icon">📄</div>
                <div class="export-option__title">Full Export</div>
                <div class="export-option__description">Complete media kit with all content</div>
              </div>
              <div class="export-option" data-format="template">
                <div class="export-option__icon">🎨</div>
                <div class="export-option__title">Template</div>
                <div class="export-option__description">Structure only, no content</div>
              </div>
              <div class="export-option" data-format="with-pods">
                <div class="export-option__icon">🔗</div>
                <div class="export-option__title">With Pods Data</div>
                <div class="export-option__description">Include WordPress custom fields</div>
              </div>
              <div class="export-option" data-format="pdf">
                <div class="export-option__icon">📑</div>
                <div class="export-option__title">PDF</div>
                <div class="export-option__description">Document format (coming soon)</div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Close button
      const closeBtn = modal.querySelector('.modal__close');
      if (closeBtn) {
        closeBtn.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          modal.classList.remove('modal--open');
          modal.style.display = 'none';
        };
      }
      
      // Close on backdrop click
      modal.onclick = function(e) {
        if (e.target === modal) {
          modal.classList.remove('modal--open');
          modal.style.display = 'none';
        }
      };
      
      // Export options
      modal.querySelectorAll('.export-option').forEach(option => {
        option.onclick = async function(e) {
          e.preventDefault();
          const format = this.dataset.format;
          
          if (format === 'json') {
            await importExportManager.exportMediaKit('json');
            showToast('Media kit exported as JSON', 'success');
            modal.classList.remove('modal--open');
            modal.style.display = 'none';
          } else if (format === 'template') {
            await importExportManager.exportMediaKit('template');
            showToast('Template exported successfully', 'success');
            modal.classList.remove('modal--open');
            modal.style.display = 'none';
          } else if (format === 'with-pods') {
            await importExportManager.exportMediaKit('json', { includePods: true });
            showToast('Media kit exported with Pods data', 'success');
            modal.classList.remove('modal--open');
            modal.style.display = 'none';
          } else {
            showToast(`${format.toUpperCase()} export coming soon`, 'info');
          }
        };
      });
    }
    
    // Show modal
    modal.classList.add('modal--open');
    modal.style.display = 'flex';
  }
}

function shareMediaKit() {
  console.log('Opening share modal...');
  
  // Check if modal exists
  let modal = document.getElementById('share-modal');
  
  if (!modal) {
    // Create share modal
    modal = document.createElement('div');
    modal.id = 'share-modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal__content">
        <div class="modal__header">
          <h2 class="modal__title">Share Media Kit</h2>
          <button class="modal__close">&times;</button>
        </div>
        <div class="modal__body">
          <div style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 48px; margin-bottom: 20px;">🔗</div>
            <h3 style="color: #e2e8f0; margin-bottom: 10px;">Share Feature Coming Soon!</h3>
            <p style="color: #94a3b8; font-size: 14px;">You'll be able to generate shareable links, embed codes, and collaborate with team members.</p>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close button
    modal.querySelector('.modal__close').addEventListener('click', () => {
      modal.classList.remove('modal--open');
    });
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('modal--open');
      }
    });
  }
  
  // Show modal
  modal.classList.add('modal--open');
}

function undo() {
  showToast('Undo functionality coming soon', 'info');
  // TODO: Integrate with state history
}

function redo() {
  showToast('Redo functionality coming soon', 'info');
  // TODO: Integrate with state history
}

// Phase 4: Template Library Modal
function openTemplateLibrary() {
  console.log('Opening template library...');
  
  if (!componentTemplates) {
    showToast('Template system not initialized', 'error');
    return;
  }
  
  let modal = document.getElementById('template-library-modal');
  
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'template-library-modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal__content" style="max-width: 800px;">
        <div class="modal__header">
          <h2 class="modal__title">Template Library</h2>
          <button class="modal__close">&times;</button>
        </div>
        <div class="modal__body">
          <div class="template-categories">
            <button class="template-category-btn active" data-category="all">All Templates</button>
            <button class="template-category-btn" data-category="hero">Hero</button>
            <button class="template-category-btn" data-category="biography">Biography</button>
            <button class="template-category-btn" data-category="topics">Topics</button>
            <button class="template-category-btn" data-category="contact">Contact</button>
          </div>
          <div class="template-grid" id="template-grid">
            <!-- Templates will be loaded here -->
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close button
    modal.querySelector('.modal__close').addEventListener('click', () => {
      modal.classList.remove('modal--open');
    });
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('modal--open');
      }
    });
    
    // Category buttons
    modal.querySelectorAll('.template-category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.template-category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const category = btn.dataset.category;
        renderTemplates(category);
      });
    });
  }
  
  // Show modal and render templates
  modal.classList.add('modal--open');
  renderTemplates('all');
}

function renderTemplates(category = 'all') {
  const grid = document.getElementById('template-grid');
  if (!grid || !componentTemplates) return;
  
  const templates = componentTemplates.templates || {};
  const filteredTemplates = category === 'all' 
    ? Object.values(templates)
    : Object.values(templates).filter(t => t.category === category);
  
  if (filteredTemplates.length === 0) {
    grid.innerHTML = '<p style="text-align: center; color: #94a3b8;">No templates available for this category</p>';
    return;
  }
  
  grid.innerHTML = filteredTemplates.map(template => `
    <div class="template-card" data-template-id="${template.id}">
      <div class="template-preview">
        ${template.thumbnail ? `<img src="${template.thumbnail}" alt="${template.name}">` : '<div class="template-placeholder">📄</div>'}
      </div>
      <h4>${template.name}</h4>
      <p>${template.description || 'No description'}</p>
      <button class="btn btn-primary apply-template-btn" data-template="${template.id}" data-component="${template.component || template.category}">
        Apply Template
      </button>
    </div>
  `).join('');
  
  // Add click handlers for apply buttons
  grid.querySelectorAll('.apply-template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const templateId = btn.dataset.template;
      const componentType = btn.dataset.component;
      const template = templates[templateId];
      
      if (template && template.data) {
        // Add new component with template data
        window.GMKB.addComponent(componentType, template.data);
        
        // Close modal
        const modal = document.getElementById('template-library-modal');
        if (modal) {
          modal.classList.remove('modal--open');
        }
        
        showToast(`Applied ${template.name} template`, 'success');
      }
    });
  });
}

// Phase 4: Import Modal
function openImportModal() {
  console.log('Opening import modal...');
  
  if (!importExportManager) {
    showToast('Import/Export system not initialized', 'error');
    return;
  }
  
  let modal = document.getElementById('import-modal');
  
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'import-modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal__content">
        <div class="modal__header">
          <h2 class="modal__title">Import Media Kit</h2>
          <button class="modal__close">&times;</button>
        </div>
        <div class="modal__body">
          <div style="padding: 20px; text-align: center;">
            <div style="border: 2px dashed #475569; border-radius: 8px; padding: 40px 20px;">
              <div style="font-size: 48px; margin-bottom: 20px;">📁</div>
              <h3 style="color: #e2e8f0; margin-bottom: 10px;">Choose a file to import</h3>
              <p style="color: #94a3b8; margin-bottom: 20px;">Select a JSON file exported from Media Kit Builder</p>
              <input type="file" id="import-file-input" accept=".json" style="display: none;">
              <button class="btn btn-primary" id="import-browse-btn">Browse Files</button>
            </div>
            <div id="import-preview" style="display: none; margin-top: 20px; padding: 20px; background: #1e293b; border-radius: 8px;">
              <h4 style="color: #e2e8f0;">File selected:</h4>
              <p id="import-filename" style="color: #94a3b8;"></p>
              <div style="margin-top: 20px;">
                <button class="btn btn-primary" id="import-confirm-btn">Import</button>
                <button class="btn btn-secondary" id="import-cancel-btn" style="margin-left: 10px;">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close button
    modal.querySelector('.modal__close').addEventListener('click', () => {
      modal.classList.remove('modal--open');
    });
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('modal--open');
      }
    });
    
    // File input handlers
    const fileInput = modal.querySelector('#import-file-input');
    const browseBtn = modal.querySelector('#import-browse-btn');
    const preview = modal.querySelector('#import-preview');
    const filename = modal.querySelector('#import-filename');
    const confirmBtn = modal.querySelector('#import-confirm-btn');
    const cancelBtn = modal.querySelector('#import-cancel-btn');
    
    let selectedFile = null;
    
    browseBtn.addEventListener('click', () => {
      fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && file.type === 'application/json') {
        selectedFile = file;
        filename.textContent = file.name;
        preview.style.display = 'block';
      } else {
        showToast('Please select a valid JSON file', 'error');
      }
    });
    
    confirmBtn.addEventListener('click', async () => {
      if (selectedFile) {
        try {
          const text = await selectedFile.text();
          const data = JSON.parse(text);
          
          // Import the media kit
          await importExportManager.importMediaKit(data);
          
          modal.classList.remove('modal--open');
          showToast('Media kit imported successfully', 'success');
          
          // Refresh the page to show imported content
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (error) {
          console.error('Import error:', error);
          showToast('Failed to import media kit', 'error');
        }
      }
    });
    
    cancelBtn.addEventListener('click', () => {
      selectedFile = null;
      preview.style.display = 'none';
      fileInput.value = '';
    });
  }
  
  // Show modal
  modal.classList.add('modal--open');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  // DOM is already loaded, but wait for next tick to ensure all elements are rendered
  setTimeout(initialize, 0);
}

// Export for module usage
export {
  APIService,
  logger
};
