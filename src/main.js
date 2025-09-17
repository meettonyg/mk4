/**
 * Media Kit Builder - Main Entry Point
 * Clean, modern architecture with minimal dependencies
 * Phase 3: Vue.js Integration Foundation
 */

// Vue 3 imports
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import VueComponentDiscovery from './loaders/VueComponentDiscovery.js';
import { initializeEditPanel } from './ui/ComponentEditPanel.js';

// ROOT FIX: Import global commands to ensure they're in the bundle
import { initializeGlobalCommands } from './global-commands.js';

// Phase 2: Using Enhanced State Manager with reducer pattern
import { StateManager, ACTION_TYPES } from './core/StateManager.js';
import { EventBus } from './core/EventBus.js';
import { Renderer } from './core/Renderer.js';
import { APIService } from './services/APIService.js';
import { logger } from './utils/logger.js';
import { loadComponentRenderers } from './registry/ComponentRegistry.js';
import podsDataIntegration from './core/PodsDataIntegration.js';
import SectionDragDropManager from './core/SectionDragDropManager.js';

// Phase 4: Advanced Features
import InlineEditor from './features/InlineEditor.js';
import ComponentTemplates from './features/ComponentTemplates.js';
import ImportExportManager from './features/ImportExportManager.js';

// Initialize core systems
let stateManager;
let eventBus;
let apiService;
let renderer;
let vueApp = null; // Vue app instance
let dragDropManager = null; // Drag and drop manager
let isSaving = false; // ROOT FIX: Prevent double save triggers

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
// Initialize Vue application
function initializeVue() {
  try {
    // Check if Vue mount point exists
    const mountPoint = document.getElementById('vue-app');
    if (!mountPoint) {
      logger.warn('Vue mount point not found, skipping Vue initialization');
      return null;
    }

    // Create Vue app with minimal root component
    const app = createApp({
      name: 'MediaKitBuilderVue',
      data() {
        return {
          message: 'Vue.js successfully integrated!',
          isVisible: false
        };
      },
      mounted() {
        logger.success('✅ Vue app mounted successfully');
        // Dispatch Vue ready event
        document.dispatchEvent(new CustomEvent('gmkb:vue-ready', {
          detail: { version: '3.4.0' }
        }));
      },
      template: `
        <div v-if="isVisible" class="vue-integration-notice" style="background: #10b981; color: white; padding: 10px; border-radius: 4px; margin: 10px 0;">
          <strong>{{ message }}</strong>
          <br>Vue components can now be progressively integrated.
        </div>
      `
    });

    // Create and use Pinia store
    const pinia = createPinia();
    app.use(pinia);

    // Mount the app
    const instance = app.mount('#vue-app');
    
    // ROOT FIX: Expose Vue app and Pinia globally for access
    window.gmkbApp = app;
    window.gmkbVueInstance = instance;
    window.gmkbPinia = pinia;
    
    // ROOT FIX: Also expose direct access to the state manager as a fallback
    // The actual store is the stateManager, not a Pinia store
    window.gmkbStore = window.stateManager;
    
    // ROOT FIX: Create helper functions for console access
    window.getSections = () => {
      const state = window.stateManager?.getState();
      console.log('Sections:', state?.sections || []);
      return state?.sections || [];
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
      return window.stateManager?.getState() || {};
    };
    
    // Make visible briefly to confirm integration
    mountPoint.style.display = 'block';
    instance.isVisible = true;
    setTimeout(() => {
      instance.isVisible = false;
      setTimeout(() => {
        mountPoint.style.display = 'none';
      }, 300);
    }, 3000);

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
    // Create core instances
    eventBus = new EventBus();
    
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
    
    // Removed verbose logging for cleaner console
    
    // Initialize Vue component discovery
    await VueComponentDiscovery.initialize();
    
    // Load component renderers
    await loadComponentRenderers();
    
    // ROOT FIX: Proper data loading hierarchy
    // 1. WordPress database is the source of truth when editing a post
    // 2. localStorage is only for temporary unsaved changes or new media kits
    
    const postId = window.gmkbData?.postId || apiService.postId;
    const hasPostId = postId && postId !== 'new' && postId !== '0';
    
    let initialState = {};
    
    if (hasPostId) {
      // EDITING AN EXISTING POST - WordPress is source of truth
      console.log('Loading media kit from WordPress database for post:', postId);
      initialState = window.gmkbData?.savedState || window.gmkbData?.saved_state || {};
      
      // ROOT FIX: Log what we're loading
      if (initialState.components) {
        const componentCount = Object.keys(initialState.components).length;
        console.log(`Loading ${componentCount} components from WordPress`);
        if (componentCount > 0) {
          console.log('Component IDs:', Object.keys(initialState.components));
        }
      }
      
      // Create state manager with WordPress data
      stateManager = new StateManager(initialState);
      
      // DO NOT load from localStorage when editing a specific post
      // localStorage might have stale data from a different post!
      console.log('✅ Loaded state from WordPress database');
      
    } else {
      // NEW MEDIA KIT - localStorage can be used for drafts
      console.log('Creating new media kit - checking localStorage for draft');
      
      // Create state manager with empty state
      stateManager = new StateManager({});
      
      // Check localStorage for unsaved draft
      const hasDraft = stateManager.loadFromStorage();
      if (hasDraft) {
        console.log('✅ Loaded draft from localStorage');
      } else {
        console.log('✅ Starting with fresh media kit');
      }
    }
    
    // ROOT FIX: Expose state manager globally for Vue bundle access
    window.stateManager = stateManager;
    window.gmkbStateManager = stateManager;
    window.gmkbStore = stateManager; // Also expose as store for consistency
    
    // Initialize renderer with correct container ID
    // Try multiple container IDs to find the right one
  const possibleContainers = [
    'gmkb-sections-container',
    'saved-components-container', 
    'media-kit-preview',
    'gmkb-preview-area'
  ];
  
  let containerId = 'media-kit-preview';
  for (const id of possibleContainers) {
    if (document.getElementById(id)) {
      containerId = id;
      logger.info(`Using container: ${id}`);
      break;
    }
  }
  
  renderer = new Renderer(stateManager, containerId);
    
    // Initialize drag and drop manager
    dragDropManager = new SectionDragDropManager(stateManager, eventBus);
    
    // Phase 4: Initialize advanced features
    // Initialize inline editor
    inlineEditor = new InlineEditor(stateManager);
    
    // Initialize component templates
    componentTemplates = new ComponentTemplates();
    componentTemplates.loadCustomTemplates(); // Load any saved custom templates
    
    // Initialize import/export manager
    importExportManager = new ImportExportManager(stateManager, '3.0.0');
    
    // Phase 4: Auto-initialize inline editing after DOM is ready
    setTimeout(() => {
      if (inlineEditor) {
        inlineEditor.init();
        console.log('✅ Inline editor initialized - double-click text to edit');
      }
    }, 1000);
    
    console.log('✅ Phase 4 features initialized: Inline Editor, Templates, Import/Export');
    
    // Set up UI event handlers
    setupUIHandlers();
    
    // Initialize component edit panel
    initializeEditPanel();
    
    // Set up component action handlers
    setupComponentHandlers();
    
    // Set up auto-save
    setupAutoSave();
    
    // Make available globally for debugging
    window.GMKB = {
      stateManager,
      eventBus,
      apiService,
      renderer,
      vueApp: null, // Will be set after Vue initialization
      version: '3.0.0',
      
      // Phase 4: Advanced features
      inlineEditor,
      componentTemplates,
      importExportManager,
      
      // Helper methods
      addComponent: (type, data = {}) => {
        const componentId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const component = {
          id: componentId,
          type,
          data,
          props: data
        };
        
        // ROOT FIX: Enrich component with Pods data
        podsDataIntegration.enrichComponentData(component);
        
        // Let the ADD_COMPONENT action in reducer handle section creation/assignment
        
        stateManager.dispatch({ type: ACTION_TYPES.ADD_COMPONENT, payload: component });
        return componentId;
      },
      
      removeComponent: (componentId) => {
        stateManager.dispatch({ type: ACTION_TYPES.REMOVE_COMPONENT, payload: componentId });
      },
      
      // ROOT FIX: Add section management methods
      addSection: (type = 'two_column') => {
        const sectionId = `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const section = {
          id: sectionId,
          section_id: sectionId,
          type,
          components: []
        };
        stateManager.dispatch({ type: ACTION_TYPES.ADD_SECTION, payload: section });
        return section;
      },
      
      getSections: () => {
        const state = stateManager.getState();
        return state.sections || [];
      },
      
      removeSection: (sectionId) => {
        stateManager.dispatch({ type: ACTION_TYPES.REMOVE_SECTION, payload: sectionId });
        console.log('✅ Section removed:', sectionId);
      },
      
      save: () => saveState(),
      
      getState: () => stateManager.getState()
    };
    
    // ROOT FIX: Also expose section commands globally for easy console access
    window.addSection = window.GMKB.addSection;
    window.getSections = window.GMKB.getSections;
    window.removeSection = window.GMKB.removeSection;
    window.getState = window.GMKB.getState;
    
    // ROOT FIX: Add quick diagnostic function
    window.checkComponents = () => {
      const state = stateManager.getState();
      const componentCount = Object.keys(state.components || {}).length;
      const componentIds = Object.keys(state.components || {});
      
      console.log('=== Component Check ===');
      console.log('Components type:', typeof state.components, Array.isArray(state.components) ? '(ARRAY!)' : '(object)');
      console.log('Component count:', componentCount);
      
      if (componentCount > 0) {
        console.log('Component IDs:', componentIds);
        componentIds.forEach(id => {
          const comp = state.components[id];
          console.log(`  - ${id}: type=${comp?.type}, section=${comp?.sectionId}`);
        });
      } else {
        console.log('No components in state.components');
        
        // Check sections
        let componentsInSections = 0;
        state.sections?.forEach(section => {
          const sectionComps = section.components || [];
          if (sectionComps.length > 0) {
            console.log(`Section ${section.section_id} has ${sectionComps.length} components`);
            componentsInSections += sectionComps.length;
          }
        });
        
        if (componentsInSections > 0) {
          console.warn('⚠️ Components exist in sections but NOT in components object!');
          console.log('This is why save shows 0 components');
        }
      }
      
      return { componentCount, componentIds, state };
    };
    
    // ROOT FIX: Initialize global commands for console access
    initializeGlobalCommands();
    
    // ROOT FIX: Test/debug scripts removed from production
    // Debug functions can be accessed via debugGMKB object instead
    // This prevents 404 errors for test-save-fix.js in production
    
    // ROOT FIX: Add debug commands
    window.debugGMKB = {
      showState: () => {
        const state = stateManager.getState();
        console.log('Current State:', state);
        console.log('Components:', Object.keys(state.components || {}).length);
        console.log('Sections:', (state.sections || []).length);
        let componentRefs = 0;
        if (state.sections) {
          state.sections.forEach(s => {
            if (s.components) componentRefs += s.components.length;
          });
        }
        console.log('Component references in sections:', componentRefs);
        return state;
      },
      
      showComponents: () => {
        const state = stateManager.getState();
        console.log('Components Map:', state.components);
        return state.components;
      },
      
      showSections: () => {
        const state = stateManager.getState();
        console.log('Sections:', state.sections);
        return state.sections;
      },
      
      checkComponentInSection: (componentId) => {
        const state = stateManager.getState();
        const component = state.components[componentId];
        if (!component) {
          console.log('Component not found:', componentId);
          return null;
        }
        console.log('Component:', component);
        console.log('Assigned to section:', component.sectionId || 'NONE');
        
        // Find in sections
        let foundInSection = null;
        if (state.sections) {
          state.sections.forEach(section => {
            if (section.components) {
              const found = section.components.find(c => 
                (typeof c === 'string' ? c : c.component_id) === componentId
              );
              if (found) {
                foundInSection = section.section_id;
              }
            }
          });
        }
        console.log('Found in section:', foundInSection || 'NOT FOUND');
        return { component, foundInSection };
      },
      
      getLogs: async () => {
        try {
          const formData = new FormData();
          formData.append('action', 'gmkb_get_debug_logs');
          formData.append('nonce', apiService.nonce);
          formData.append('lines', '50');
          
          const response = await fetch(apiService.ajaxUrl, {
            method: 'POST',
            body: formData
          });
          
          const result = await response.json();
          if (result.success && result.data.logs) {
            console.log('=== GMKB Debug Logs ===');
            console.log(result.data.logs);
            return result.data.logs;
          }
        } catch (error) {
          console.error('Failed to get logs:', error);
        }
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
    vueApp = initializeVue();
    
    // Store Vue app reference globally - ROOT FIX: Also expose as window.vueApp
    if (vueApp) {
      window.GMKB.vueApp = vueApp;
      window.GMKB.vue = vueApp;
      window.GMKB.vueDiscovery = VueComponentDiscovery;
      window.vueApp = vueApp; // ROOT FIX: Expose globally for bundle compatibility
    }
    
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
  // Save button
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      await saveState();
    });
  }
  
  // Add Component button - check multiple possible IDs
  const addComponentBtn = document.getElementById('add-component-btn') || 
                         document.getElementById('add-first-component') ||
                         document.querySelector('[data-action="add-component"]');
  if (addComponentBtn) {
    addComponentBtn.addEventListener('click', () => {
      // Use our own component library modal
      openComponentLibrary();
    });
  }
  
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
      
      // When a layout is clicked, add a new section of that type
      if (layoutType === 'full-width') {
        window.GMKB.addSection('full_width');
        showToast('Full Width section added', 'success');
      } else if (layoutType === 'two-column') {
        window.GMKB.addSection('two_column');
        showToast('Two Column section added', 'success');
      } else if (layoutType === 'three-column') {
        window.GMKB.addSection('three_column');
        showToast('Three Column section added', 'success');
      } else if (layoutType === 'sidebar' || layoutType === 'main-sidebar') {
        window.GMKB.addSection('sidebar');
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
      
      // Add the section
      window.GMKB.addSection(sectionType);
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
    
    switch (action) {
      case 'delete':
        if (confirm('Delete this component?')) {
          stateManager.dispatch({ type: ACTION_TYPES.REMOVE_COMPONENT, payload: componentId });
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
        type: 'new-component',
        componentType: componentType
      }));
      item.classList.add('dragging');
    });
    
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
    });
    
    // Also allow click to add
    item.addEventListener('click', () => {
      const componentType = item.dataset.component;
      window.GMKB.addComponent(componentType);
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
        window.GMKB.addComponent(componentType);
        showToast(`Added ${componentType} component`, 'success');
      }
    });
  }
}

function setupAutoSave() {
  let saveTimeout;
  
  // Auto-save on state changes (debounced)
  stateManager.subscribe(() => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      // ROOT FIX: Only auto-save if we have a valid nonce and post ID
      const hasValidNonce = window.gmkbData?.nonce || window.mkcg_vars?.nonce || window.mkcg_nonce;
      const hasPostId = apiService?.postId && apiService.postId !== 'new' && apiService.postId !== '0';
      
      if (!isSaving && hasValidNonce && hasPostId) { 
        saveState(true); // true = auto-save
      }
    }, 30000); // 30 seconds debounce (was 5 seconds)
  });
}

async function saveState(isAutoSave = false) {
  // ROOT FIX: Prevent double saves
  if (isSaving) {
    console.log('Save already in progress, skipping duplicate save');
    return;
  }
  
  isSaving = true;
  const saveBtn = document.getElementById('save-btn');
  
  if (!isAutoSave && saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
  }
  
  try {
    const state = stateManager.getState();
    
    // ROOT FIX: Ensure we're getting the actual components from state
    const cleanState = {
      components: state.components || {}, // ROOT FIX: Use state.components directly
      layout: state.layout || [],
      sections: state.sections || [],
      theme: state.theme || 'default',
      themeSettings: state.themeSettings || [],
      globalSettings: state.globalSettings || {}
    };
    
    // ROOT FIX: Components are already in cleanState.components from state
    // Just clean up any problematic properties without rebuilding
    if (cleanState.components && typeof cleanState.components === 'object') {
      Object.keys(cleanState.components).forEach(compId => {
        const comp = cleanState.components[compId];
        if (comp) {
          // Just remove problematic Vue/internal properties
          delete comp.__vueComponent;
          delete comp._state;
          delete comp.renderer;
          
          // Ensure component has essential properties
          if (!comp.id) {
            comp.id = compId;
          }
          if (!comp.type) {
            comp.type = 'unknown';
          }
        }
      });
    }
    
    // Log what we're actually saving
    console.log('Saving state with components:', Object.keys(cleanState.components || {}).length);
    console.log('Component IDs being saved:', Object.keys(cleanState.components || {}));

    
    // State cleaned and ready to save
    
    const saveResult = await apiService.save(cleanState);
    
    // ROOT FIX: Handle silent failures (like nonce expiry) gracefully
    if (saveResult?.silent) {
      // Don't show error for silent failures like expired nonce on auto-save
      return;
    }
    
    // ROOT FIX: Clear localStorage after successful database save
    // WordPress is the source of truth, localStorage was just for temporary changes
    if (apiService.postId && apiService.postId !== 'new' && apiService.postId !== '0') {
    const storageKey = `gmkb_state_post_${apiService.postId}`;
    localStorage.removeItem(storageKey);
    // Removed console.log for cleaner output
    }
    
    if (!isAutoSave) {
      showToast('Saved successfully', 'success');
    }
    
    logger.success('State saved to WordPress database');
  } catch (error) {
    // ROOT FIX: Only log and show errors if not a silent failure
    if (!error.message?.includes('Invalid nonce')) {
      logger.error('Save failed:', error);
      if (!isAutoSave) {
        showToast('Save failed', 'error');
      }
    }
  } finally {
    isSaving = false; // ROOT FIX: Reset flag
    if (!isAutoSave && saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save';
    }
  }
}

function openComponentLibrary() {
  // Check if modal exists
  let modal = document.getElementById('component-library-modal');
  
  if (!modal) {
    // Create modal if it doesn't exist
    modal = document.createElement('div');
    modal.id = 'component-library-modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal__content">
        <div class="modal__header">
          <h2 class="modal__title">Add Component</h2>
          <button class="modal__close">&times;</button>
        </div>
        <div class="modal__body" id="component-library-list"></div>
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
  
  // Show modal with proper class
  modal.classList.add('modal--open');
  
  // Render component library
  renderComponentLibrary();
  
  console.log('Component library modal opened');
}


function renderComponentLibrary() {
  const list = document.getElementById('component-library-list');
  if (!list) return;
  
  // ROOT FIX: Get components from multiple sources
  let components = [];
  
  // First try to get from gmkbData
  if (window.gmkbData?.components && Array.isArray(window.gmkbData.components)) {
    components = window.gmkbData.components;
  }
  
  // If no components from gmkbData, try componentTypes
  if (components.length === 0 && window.gmkbData?.componentTypes) {
    // Convert component types to component objects
    components = window.gmkbData.componentTypes.map(type => ({
      type: type,
      name: type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' '),
      description: `Add ${type} component to your media kit`
    }));
  }
  
  // If still no components, use default fallback list
  if (components.length === 0) {
    components = [
      { type: 'hero', name: 'Hero', description: 'Hero section with title and image' },
      { type: 'biography', name: 'Biography', description: 'Professional biography' },
      { type: 'topics', name: 'Topics', description: 'Speaking topics list' },
      { type: 'contact', name: 'Contact', description: 'Contact information' },
      { type: 'social', name: 'Social Media', description: 'Social media links' },
      { type: 'testimonials', name: 'Testimonials', description: 'Client testimonials' },
      { type: 'call-to-action', name: 'Call to Action', description: 'CTA button section' },
      { type: 'questions', name: 'Questions', description: 'FAQ section' },
      { type: 'stats', name: 'Statistics', description: 'Key numbers and stats' },
      { type: 'video-intro', name: 'Video Introduction', description: 'Embedded video' },
      { type: 'photo-gallery', name: 'Photo Gallery', description: 'Image gallery' },
      { type: 'podcast-player', name: 'Podcast Player', description: 'Audio player' },
      { type: 'booking-calendar', name: 'Booking Calendar', description: 'Schedule availability' },
      { type: 'authority-hook', name: 'Authority Hook', description: 'Credibility builder' },
      { type: 'guest-intro', name: 'Guest Introduction', description: 'Introduction section' },
      { type: 'logo-grid', name: 'Logo Grid', description: 'Client or partner logos' },
      { type: 'topics-questions', name: 'Topics & Questions', description: 'Combined topics and Q&A' }
    ];
  }
  
  console.log('Rendering component library with', components.length, 'components');
  
  // Create component cards
  list.innerHTML = components.map(comp => `
    <div class="component-card" data-component-type="${comp.type}">
      <div class="component-card__icon">
        ${getComponentIcon(comp.type)}
      </div>
      <h3 class="component-card__title">${comp.name || comp.type}</h3>
      <p class="component-card__description">${comp.description || 'No description available'}</p>
      <button class="btn btn-primary add-component-btn" data-type="${comp.type}">
        Add Component
      </button>
    </div>
  `).join('');
  
  // Add click handlers
  list.querySelectorAll('.add-component-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      window.GMKB.addComponent(type);
      
      // Close modal
      const modal = document.getElementById('component-library-modal');
      if (modal) {
        modal.classList.remove('modal--open');
      }
      
      showToast(`Added ${type} component`, 'success');
    });
  });
}

// Helper function to get component icons
function getComponentIcon(type) {
  const icons = {
    hero: '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
    biography: '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    topics: '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    contact: '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    social: '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
    testimonials: '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>'
  };
  
  return icons[type] || '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>';
}

function addSection(type = 'full_width') {
  const sectionId = `section_${Date.now()}`;
  const section = {
    section_id: sectionId,
    type,
    components: []
  };
  
  stateManager.dispatch({ type: ACTION_TYPES.ADD_SECTION, payload: section });
  showToast('Section added', 'success');
}

function deleteSection(sectionId) {
  const state = stateManager.getState();
  const sections = state.sections.filter(s => s.section_id !== sectionId);
  
  // Also remove components in this section
  const section = state.sections.find(s => s.section_id === sectionId);
  if (section && section.components && section.components.length > 0) {
    section.components.forEach(compRef => {
      // Handle both string IDs and object references
      const componentId = typeof compRef === 'string' ? compRef : (compRef.component_id || compRef.id);
      
      // Only remove if component exists
      if (componentId && state.components[componentId]) {
        stateManager.dispatch({ type: ACTION_TYPES.REMOVE_COMPONENT, payload: componentId });
      }
    });
  }
  
  stateManager.dispatch({ type: ACTION_TYPES.UPDATE_SECTIONS, payload: sections });
}

function duplicateComponent(componentId) {
  const state = stateManager.getState();
  const original = state.components[componentId];
  
  if (original) {
    const newId = `${original.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const duplicate = {
      ...original,
      id: newId,
      data: { ...original.data }
    };
    
    stateManager.dispatch({ type: ACTION_TYPES.ADD_COMPONENT, payload: duplicate });
    showToast('Component duplicated', 'success');
  }
}

function moveComponent(componentId, direction) {
  const state = stateManager.getState();
  const component = state.components[componentId];
  
  if (!component || !component.sectionId) return;
  
  const section = state.sections.find(s => s.section_id === component.sectionId);
  if (!section) return;
  
  const index = section.components.indexOf(componentId);
  if (index === -1) return;
  
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= section.components.length) return;
  
  // Swap positions
  const components = [...section.components];
  [components[index], components[newIndex]] = [components[newIndex], components[index]];
  
  // Update section
  const updatedSections = state.sections.map(s => 
    s.section_id === section.section_id 
      ? { ...s, components }
      : s
  );
  
  stateManager.dispatch({ type: ACTION_TYPES.UPDATE_SECTIONS, payload: updatedSections });
}

function openComponentEditor(componentId) {
  // Simple inline editor for now
  const component = stateManager.getState().components[componentId];
  if (!component) return;
  
  // This would open a design panel in a full implementation
  console.log('Edit component:', component);
  showToast('Component editor not yet implemented', 'info');
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

// Placeholder functions for toolbar actions
function openThemeCustomizer() {
  console.log('Opening advanced theme customizer...');
  
  // Check if the advanced theme customizer is available
  if (window.themeCustomizer && typeof window.themeCustomizer.open === 'function') {
    // Use the advanced theme customizer from ThemeCustomizer.js
    window.themeCustomizer.open();
    console.log('Advanced theme customizer opened');
  } else if (window.openThemeSettings && typeof window.openThemeSettings === 'function') {
    // Alternative method if available
    window.openThemeSettings();
    console.log('Theme settings opened via alternative method');
  } else {
    // Fallback: Dispatch event to open theme customizer
    document.dispatchEvent(new CustomEvent('gmkb:open-theme-customizer', {
      detail: { source: 'toolbar' }
    }));
    console.log('Dispatched open-theme-customizer event');
    
    // If still no customizer, show simple fallback after a short delay
    setTimeout(() => {
      if (!document.getElementById('theme-customizer-modal')) {
        openSimpleThemeModal();
      }
    }, 100);
  }
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
  StateManager,
  EventBus,
  Renderer,
  APIService,
  logger
};
