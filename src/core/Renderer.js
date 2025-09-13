/**
 * Simple Direct Renderer - No Virtual DOM, No Diffing
 * Just clear and re-render - fast enough for dozens of components
 */
import { getComponentRenderer, isVueComponent } from '../registry/ComponentRegistry.js';
import { logger } from '../utils/logger.js';

export class Renderer {
  constructor(stateManager, containerId = 'media-kit-preview') {
    this.stateManager = stateManager;
    this.container = document.getElementById(containerId);
    this.vueInstances = {}; // Track Vue component instances for cleanup
    
    if (!this.container) {
      logger.error(`Container #${containerId} not found`);
      return;
    }
    
    // Hide empty state and saved components initially
    const emptyState = document.getElementById('empty-state');
    const savedContainer = document.getElementById('saved-components-container');
    if (emptyState) emptyState.style.display = 'none';
    if (savedContainer) savedContainer.style.display = 'block';
    
    // Subscribe to state changes
    this.unsubscribe = this.stateManager.subscribe(() => this.render());
    
    // Initial render
    this.render();
  }

  render() {
    const state = this.stateManager.getState();
    logger.debug('🎨 Rendering state:', state);
    
    // Check if we have components to render
    const hasComponents = Object.keys(state.components).length > 0;
    const hasSections = state.sections && state.sections.length > 0;
    
    // Handle empty state visibility
    const emptyState = document.getElementById('empty-state');
    const savedContainer = document.getElementById('saved-components-container');
    
    if (!hasComponents && !hasSections) {
      // Show empty state
      if (emptyState) emptyState.style.display = 'block';
      if (savedContainer) savedContainer.style.display = 'none';
      this.renderEmptyState();
      return;
    }
    
    // Hide empty state, show components
    if (emptyState) emptyState.style.display = 'none';
    if (savedContainer) savedContainer.style.display = 'block';
    
    // Clean up Vue instances before clearing container
    this.cleanupVueInstances();
    
    // Clear container
    this.container.innerHTML = '';
    
    // Add theme class if we're the main container
    if (this.container.id === 'media-kit-preview' || this.container.id === 'gmkb-preview-area') {
      this.container.className = `preview-area theme-${state.theme || 'default'}`;
    }
    
    // Render sections or components directly
    if (hasSections) {
      this.renderSections(state);
    } else if (hasComponents) {
      this.renderComponentsDirectly(state);
    }
  }

  renderSections(state) {
    state.sections.forEach(section => {
      const sectionEl = this.renderSection(section, state);
      if (sectionEl) {
        this.container.appendChild(sectionEl);
      }
    });
  }

  renderSection(section, state) {
    const sectionEl = document.createElement('div');
    sectionEl.className = `gmkb-section gmkb-section--${section.type || 'full-width'}`;
    sectionEl.setAttribute('data-section-id', section.section_id);
    
    // Create section content wrapper
    const contentEl = document.createElement('div');
    contentEl.className = 'gmkb-section__content';
    
    // Render components in this section
    if (section.components && section.components.length > 0) {
      section.components.forEach(componentId => {
        const component = state.components[componentId];
        if (component) {
          const componentEl = this.renderComponent(component);
          if (componentEl) {
            contentEl.appendChild(componentEl);
          }
        }
      });
    } else {
      // Empty section placeholder
      contentEl.innerHTML = `
        <div class="gmkb-section__empty" data-drop-zone="true">
          <p>Drop components here</p>
        </div>
      `;
    }
    
    // Add section controls
    this.addSectionControls(sectionEl, section);
    
    sectionEl.appendChild(contentEl);
    return sectionEl;
  }

  renderComponentsDirectly(state) {
    // If no sections, render components directly
    Object.values(state.components).forEach(component => {
      const componentEl = this.renderComponent(component);
      if (componentEl) {
        this.container.appendChild(componentEl);
      }
    });
  }

  renderComponent(component) {
    const renderer = getComponentRenderer(component.type);
    if (!renderer) {
      logger.warn(`No renderer for component type: ${component.type}`);
      return this.renderFallbackComponent(component);
    }
    
    try {
      // Create wrapper first
      const wrapper = document.createElement('div');
      wrapper.className = `gmkb-component gmkb-component--${component.type}`;
      wrapper.setAttribute('data-component-id', component.id);
      wrapper.setAttribute('data-component-type', component.type);
      
      // Create content container for the component
      const contentContainer = document.createElement('div');
      contentContainer.className = 'gmkb-component__content';
      
      // Check if this is a Vue component
      if (isVueComponent(component.type)) {
        // Vue component rendering
        const vueInstance = renderer(contentContainer, component.data || component.props || {});
        
        // Store Vue instance for cleanup
        if (vueInstance) {
          this.vueInstances[component.id] = vueInstance;
        }
      } else {
        // Standard rendering
        let element;
        if (typeof renderer === 'function') {
          element = renderer(component);
        } else if (renderer.render) {
          element = renderer.render(component);
        } else {
          throw new Error('Invalid renderer format');
        }
        
        // Ensure element is a DOM node
        if (typeof element === 'string') {
          const div = document.createElement('div');
          div.innerHTML = element;
          element = div.firstElementChild || div;
        }
        
        contentContainer.appendChild(element);
      }
      
      // Add component controls
      this.addComponentControls(wrapper, component);
      
      wrapper.appendChild(contentContainer);
      return wrapper;
    } catch (error) {
      logger.error(`Error rendering component ${component.id}:`, error);
      return this.renderFallbackComponent(component);
    }
  }

  renderFallbackComponent(component) {
    const div = document.createElement('div');
    div.className = `gmkb-component gmkb-component--${component.type} gmkb-component--fallback`;
    div.setAttribute('data-component-id', component.id);
    div.innerHTML = `
      <div class="component-fallback">
        <h4>${component.type}</h4>
        <p>Component ID: ${component.id}</p>
      </div>
    `;
    this.addComponentControls(div, component);
    return div;
  }

  addComponentControls(element, component) {
    const controls = document.createElement('div');
    controls.className = 'component-controls';
    controls.innerHTML = `
      <button class="control-btn move-up" data-action="move-up" title="Move Up">↑</button>
      <button class="control-btn move-down" data-action="move-down" title="Move Down">↓</button>
      <button class="control-btn edit" data-action="edit" title="Edit">✏️</button>
      <button class="control-btn duplicate" data-action="duplicate" title="Duplicate">📋</button>
      <button class="control-btn delete" data-action="delete" title="Delete">🗑️</button>
    `;
    
    // Add event listeners
    controls.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (action) {
        this.handleComponentAction(action, component.id);
      }
    });
    
    element.appendChild(controls);
  }

  addSectionControls(element, section) {
    const controls = document.createElement('div');
    controls.className = 'section-controls';
    controls.innerHTML = `
      <button class="control-btn delete" data-action="delete-section" title="Delete Section">🗑️</button>
      <button class="control-btn settings" data-action="section-settings" title="Section Settings">⚙️</button>
    `;
    
    controls.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (action) {
        this.handleSectionAction(action, section.section_id);
      }
    });
    
    element.appendChild(controls);
  }

  handleComponentAction(action, componentId) {
    // Emit events for component actions
    document.dispatchEvent(new CustomEvent('gmkb:component-action', {
      detail: { action, componentId }
    }));
  }

  handleSectionAction(action, sectionId) {
    // Emit events for section actions
    document.dispatchEvent(new CustomEvent('gmkb:section-action', {
      detail: { action, sectionId }
    }));
  }

  renderEmptyState() {
    // If the empty state element already exists in the DOM, just ensure its handlers are set
    const existingEmptyState = document.getElementById('empty-state');
    if (existingEmptyState) {
      // Use the existing empty state from the template
      const addBtn = existingEmptyState.querySelector('#add-first-component');
      const sectionBtn = existingEmptyState.querySelector('#add-first-section');
      
      if (addBtn && !addBtn.hasAttribute('data-listener-attached')) {
        addBtn.addEventListener('click', () => {
          document.dispatchEvent(new CustomEvent('gmkb:open-component-library'));
        });
        addBtn.setAttribute('data-listener-attached', 'true');
      }
      
      if (sectionBtn && !sectionBtn.hasAttribute('data-listener-attached')) {
        sectionBtn.addEventListener('click', () => {
          this.addSection();
        });
        sectionBtn.setAttribute('data-listener-attached', 'true');
      }
      
      return;
    }
    
    // Fallback: create empty state if it doesn't exist
    this.container.innerHTML = `
      <div class="gmkb-empty-state">
        <h3>No components yet</h3>
        <p>Click "Add Component" to get started</p>
        <button id="empty-state-add-btn" class="btn btn-primary">Add Component</button>
      </div>
    `;
    
    // Add event listener for the button
    const btn = this.container.querySelector('#empty-state-add-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('gmkb:open-component-library'));
      });
    }
  }
  
  addSection() {
    const sectionId = `section_${Date.now()}`;
    const section = {
      section_id: sectionId,
      type: 'full_width',
      components: []
    };
    
    this.stateManager.dispatch({ type: 'ADD_SECTION', payload: section });
  }

  cleanupVueInstances() {
    // Clean up any existing Vue instances
    Object.values(this.vueInstances).forEach(instance => {
      if (instance && instance.destroy) {
        instance.destroy();
      }
    });
    this.vueInstances = {};
  }

  destroy() {
    this.cleanupVueInstances();
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
