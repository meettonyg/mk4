/**
 * Media Kit Builder - Main Entry Point
 * Clean, modern architecture with minimal dependencies
 */
import { StateManager } from './core/StateManager.js';
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

// Initialize application
async function initialize() {
  logger.info('🚀 Initializing Media Kit Builder v3.0');
  
  try {
    // Create core instances
    eventBus = new EventBus();
    apiService = new APIService();
    
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
    
    // Create state manager with initial state
    stateManager = new StateManager(initialState);
    
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
            type: 'ADD_SECTION',
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
        
        stateManager.dispatch({ type: 'ADD_COMPONENT', payload: component });
        return componentId;
      },
      
      removeComponent: (componentId) => {
        stateManager.dispatch({ type: 'REMOVE_COMPONENT', payload: componentId });
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
  // Save button
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      await saveState();
    });
  }
  
  // Add Component button
  const addComponentBtn = document.getElementById('add-component-btn');
  if (addComponentBtn) {
    addComponentBtn.addEventListener('click', () => {
      openComponentLibrary();
    });
  }
  
  // Add Section button
  const addSectionBtn = document.getElementById('add-section-btn');
  if (addSectionBtn) {
    addSectionBtn.addEventListener('click', () => {
      addSection();
    });
  }
  
  // Theme switcher
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      stateManager.dispatch({ type: 'SET_THEME', payload: e.target.value });
    });
  }
  
  // Device preview buttons
  const deviceButtons = document.querySelectorAll('[data-device]');
  deviceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const device = btn.dataset.device;
      setDevicePreview(device);
    });
  });
}

function setupComponentHandlers() {
  // Listen for component actions from renderer
  document.addEventListener('gmkb:component-action', (e) => {
    const { action, componentId } = e.detail;
    
    switch (action) {
      case 'delete':
        if (confirm('Delete this component?')) {
          stateManager.dispatch({ type: 'REMOVE_COMPONENT', payload: componentId });
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
  // Simple component library modal
  const modal = document.getElementById('component-library-modal');
  if (modal) {
    modal.style.display = 'block';
    renderComponentLibrary();
  } else {
    createComponentLibraryModal();
  }
}

function createComponentLibraryModal() {
  const modal = document.createElement('div');
  modal.id = 'component-library-modal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Add Component</h2>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body" id="component-library-list"></div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close button
  modal.querySelector('.modal-close').addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  renderComponentLibrary();
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
        modal.style.display = 'none';
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
  
  stateManager.dispatch({ type: 'ADD_SECTION', payload: section });
  showToast('Section added', 'success');
}

function deleteSection(sectionId) {
  const state = stateManager.getState();
  const sections = state.sections.filter(s => s.section_id !== sectionId);
  
  // Also remove components in this section
  const section = state.sections.find(s => s.section_id === sectionId);
  if (section && section.components) {
    section.components.forEach(componentId => {
      stateManager.dispatch({ type: 'REMOVE_COMPONENT', payload: componentId });
    });
  }
  
  stateManager.dispatch({ type: 'UPDATE_SECTIONS', payload: sections });
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
    
    stateManager.dispatch({ type: 'ADD_COMPONENT', payload: duplicate });
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
  
  stateManager.dispatch({ type: 'UPDATE_SECTIONS', payload: updatedSections });
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Export for module usage
export {
  StateManager,
  EventBus,
  Renderer,
  APIService,
  logger
};
