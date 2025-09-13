/**
 * Media Kit Builder - Main Entry Point
 * Clean, modern architecture with minimal dependencies
 */
// Phase 2: Using Enhanced State Manager with reducer pattern
import { StateManager, ACTION_TYPES } from './core/StateManager.js';
import { EventBus } from './core/EventBus.js';
import { Renderer } from './core/Renderer.js';
import { APIService } from './services/APIService.js';
import { logger } from './utils/logger.js';
import { loadComponentRenderers } from './registry/ComponentRegistry.js';

// Initialize core systems
let stateManager;
let eventBus;
let apiService;
let renderer;

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
// Initialize application
async function initialize() {
  logger.info('🚀 Initializing Media Kit Builder v3.0');
  
  try {
    // Create core instances
    eventBus = new EventBus();
    apiService = new APIService(
      window.gmkbData?.ajaxUrl,
      window.gmkbData?.nonce,
      window.gmkbData?.postId
    );
    
    // Load component renderers first
    await loadComponentRenderers();
    
    // Load initial state from WordPress or use default
    const initialState = window.gmkbData?.savedState || window.gmkbData?.saved_state || {};
    
    // Ensure we have default structure
    if (!initialState.components) initialState.components = {};
    if (!initialState.sections || !Array.isArray(initialState.sections)) {
      initialState.sections = [];
      // Create a default section if we have components but no sections
      if (Object.keys(initialState.components).length > 0) {
        initialState.sections = [{
          section_id: `section_${Date.now()}`,
          type: 'full_width',
          components: Object.keys(initialState.components)
        }];
      }
    }
    
    // Create enhanced state manager with initial state
    stateManager = new StateManager(initialState);
    
    // Load from localStorage if available
    stateManager.loadFromStorage();
    
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
    
    // Set up UI event handlers
    setupUIHandlers();
    
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
      version: '3.0.0',
      
      // Helper methods
      addComponent: (type, data = {}) => {
        const componentId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const component = {
          id: componentId,
          type,
          data,
          props: data
        };
        
        // Ensure we have at least one section
        const state = stateManager.getState();
        if (state.sections.length === 0) {
          const sectionId = `section_${Date.now()}`;
          stateManager.dispatch({
            type: ACTION_TYPES.ADD_SECTION,
            payload: {
              section_id: sectionId,
              type: 'full_width',
              components: []
            }
          });
          component.sectionId = sectionId;
        } else {
          component.sectionId = state.sections[0].section_id;
        }
        
        stateManager.dispatch({ type: ACTION_TYPES.ADD_COMPONENT, payload: component });
        return componentId;
      },
      
      removeComponent: (componentId) => {
        stateManager.dispatch({ type: ACTION_TYPES.REMOVE_COMPONENT, payload: componentId });
      },
      
      save: () => saveState(),
      
      getState: () => stateManager.getState()
    };
    
    logger.success('Media Kit Builder initialized successfully');
    
    // Dispatch ready event
    document.dispatchEvent(new CustomEvent('gmkb:ready', {
      detail: { version: '3.0.0' }
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
      saveState(true); // true = auto-save
    }, 5000); // 5 seconds debounce
  });
}

async function saveState(isAutoSave = false) {
  const saveBtn = document.getElementById('save-btn');
  
  if (!isAutoSave && saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
  }
  
  try {
    const state = stateManager.getState();
    await apiService.save(state);
    
    if (!isAutoSave) {
      showToast('Saved successfully', 'success');
    }
    
    logger.success('State saved');
  } catch (error) {
    logger.error('Save failed:', error);
    if (!isAutoSave) {
      showToast('Save failed', 'error');
    }
  } finally {
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
  
  const components = window.gmkbData?.components || [
    { type: 'hero', name: 'Hero', description: 'Hero section with title and image' },
    { type: 'biography', name: 'Biography', description: 'Professional biography' },
    { type: 'topics', name: 'Topics', description: 'Speaking topics list' },
    { type: 'contact', name: 'Contact', description: 'Contact information' },
    { type: 'cta', name: 'Call to Action', description: 'CTA button section' },
    { type: 'testimonials', name: 'Testimonials', description: 'Client testimonials' }
  ];
  
  list.innerHTML = components.map(comp => `
    <div class="component-card" data-component-type="${comp.type}">
      <h3>${comp.name}</h3>
      <p>${comp.description}</p>
      <button class="btn btn-primary add-component-btn" data-type="${comp.type}">
        Add ${comp.name}
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
  if (section && section.components) {
    section.components.forEach(componentId => {
      stateManager.dispatch({ type: ACTION_TYPES.REMOVE_COMPONENT, payload: componentId });
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
  
  // First, remove any existing export modal to avoid conflicts
  const existingModal = document.getElementById('export-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Check if our modal exists
  let modal = document.getElementById('gmkb-export-modal');
  
  if (!modal) {
    // Create export modal with unique ID
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
              <div class="export-option__title">JSON</div>
              <div class="export-option__description">For backup and import</div>
            </div>
            <div class="export-option" data-format="html">
              <div class="export-option__icon">🌐</div>
              <div class="export-option__title">HTML</div>
              <div class="export-option__description">Static webpage (coming soon)</div>
            </div>
            <div class="export-option" data-format="pdf">
              <div class="export-option__icon">📑</div>
              <div class="export-option__title">PDF</div>
              <div class="export-option__description">Document format (coming soon)</div>
            </div>
            <div class="export-option" data-format="link">
              <div class="export-option__icon">🔗</div>
              <div class="export-option__title">Share Link</div>
              <div class="export-option__description">Get shareable link (coming soon)</div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close button - use direct onclick to avoid conflicts
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
      option.onclick = function(e) {
        e.preventDefault();
        const format = this.dataset.format;
        
        if (format === 'json') {
          // Export as JSON
          if (!stateManager) {
            showToast('Export not ready', 'error');
            return;
          }
          
          const state = stateManager.getState();
          const dataStr = JSON.stringify(state, null, 2);
          const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
          
          const exportFileDefaultName = `media-kit-${Date.now()}.json`;
          
          const linkElement = document.createElement('a');
          linkElement.setAttribute('href', dataUri);
          linkElement.setAttribute('download', exportFileDefaultName);
          linkElement.click();
          
          showToast('Media kit exported as JSON', 'success');
          modal.classList.remove('modal--open');
          modal.style.display = 'none';
        } else {
          showToast(`${format.toUpperCase()} export coming soon`, 'info');
        }
      };
    });
  }
  
  // Show modal with both class and style for compatibility
  modal.classList.add('modal--open');
  modal.style.display = 'flex';
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
