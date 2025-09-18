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

  async render() {
    const state = this.stateManager.getState();
    logger.debug('🎨 Rendering state:', state);
    
    // ROOT FIX: Add render guard to prevent double rendering
    if (this._isRendering) {
      // Silently skip if already rendering to prevent race conditions
      return;
    }
    this._isRendering = true;
    
    try {
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
    if (this.container.id === 'media-kit-preview' || this.container.id === 'gmkb-preview-area' || this.container.id === 'gmkb-sections-container') {
      this.container.className = `preview-area theme-${state.theme || 'default'}`;
    }
    
    // ROOT FIX: Determine render mode - EXCLUSIVE section vs direct rendering
    // If we have ANY sections (empty or not), use section rendering ONLY
    // This prevents double rendering when components exist in both sections and layout
    
    if (hasSections) {
      // If sections exist, ONLY render via sections (never direct)
      // This prevents components from being rendered twice
      console.log('Rendering via sections only');
      await this.renderSections(state);
    } else if (hasComponents) {
      // Only render directly if NO sections exist at all
      console.log('Rendering components directly (no sections)');
      await this.renderComponentsDirectly(state);
    } else {
      // No components and no sections - empty state is already shown
      console.log('No components or sections to render');
    }
    } finally {
      this._isRendering = false;
    }
  }

  async renderSections(state) {
    for (const section of state.sections) {
      const sectionEl = await this.renderSection(section, state);
      if (sectionEl) {
        this.container.appendChild(sectionEl);
      }
    }
  }

  async renderSection(section, state) {
    const sectionEl = document.createElement('div');
    sectionEl.className = `gmkb-section gmkb-section--${section.type || 'full_width'}`;
    sectionEl.setAttribute('data-section-id', section.section_id);
    sectionEl.setAttribute('data-section-type', section.type || 'full_width');
    
    // Create inner container for proper structure
    const innerContainer = document.createElement('div');
    innerContainer.className = 'gmkb-section__inner';
    
    // ROOT FIX: Create proper multi-column structure based on section type
    if (section.type === 'two_column') {
      // Two column layout with proper drop zones
      innerContainer.innerHTML = `
        <div class="gmkb-section__column gmkb-section__column--1 gmkb-section__column--left" 
             data-drop-zone="true" 
             data-column="left"
             data-column-index="1">
          <div class="gmkb-section__drop-zone">
            <span class="gmkb-section__drop-text">Drop to Column 1</span>
          </div>
        </div>
        <div class="gmkb-section__column gmkb-section__column--2 gmkb-section__column--right" 
             data-drop-zone="true" 
             data-column="right"
             data-column-index="2">
          <div class="gmkb-section__drop-zone">
            <span class="gmkb-section__drop-text">Drop to Column 2</span>
          </div>
        </div>
      `;
      
      // Render components into appropriate columns
      if (section.components && section.components.length > 0) {
        const leftColumn = innerContainer.querySelector('.gmkb-section__column--left');
        const rightColumn = innerContainer.querySelector('.gmkb-section__column--right');
        
        // Clear drop zone text when components exist
        leftColumn.innerHTML = '';
        rightColumn.innerHTML = '';
        
        for (const compRef of section.components) {
          const componentId = typeof compRef === 'string' ? compRef : compRef.component_id;
          const component = state.components[componentId];
          
          if (component) {
            const componentEl = await this.renderComponent(component);
            if (componentEl) {
              // Place component in appropriate column based on columnIndex
              const columnIndex = component.columnIndex || 1;
              if (columnIndex === 2) {
                rightColumn.appendChild(componentEl);
              } else {
                leftColumn.appendChild(componentEl);
              }
            }
          }
        }
      }
      
    } else if (section.type === 'three_column') {
      // Three column layout with proper drop zones
      innerContainer.innerHTML = `
        <div class="gmkb-section__column gmkb-section__column--1 gmkb-section__column--left" 
             data-drop-zone="true" 
             data-column="left"
             data-column-index="1">
          <div class="gmkb-section__drop-zone">
            <span class="gmkb-section__drop-text">Drop to Column 1</span>
          </div>
        </div>
        <div class="gmkb-section__column gmkb-section__column--2 gmkb-section__column--center" 
             data-drop-zone="true" 
             data-column="center"
             data-column-index="2">
          <div class="gmkb-section__drop-zone">
            <span class="gmkb-section__drop-text">Drop to Column 2</span>
          </div>
        </div>
        <div class="gmkb-section__column gmkb-section__column--3 gmkb-section__column--right" 
             data-drop-zone="true" 
             data-column="right"
             data-column-index="3">
          <div class="gmkb-section__drop-zone">
            <span class="gmkb-section__drop-text">Drop to Column 3</span>
          </div>
        </div>
      `;
      
      // Render components into appropriate columns
      if (section.components && section.components.length > 0) {
        const columns = innerContainer.querySelectorAll('.gmkb-section__column');
        
        // Clear drop zone text when components exist
        columns.forEach(col => col.innerHTML = '');
        
        for (const compRef of section.components) {
          const componentId = typeof compRef === 'string' ? compRef : compRef.component_id;
          const component = state.components[componentId];
          
          if (component) {
            const componentEl = await this.renderComponent(component);
            if (componentEl) {
              // Place component in appropriate column based on columnIndex
              const columnIndex = Math.min(component.columnIndex || 1, 3);
              const targetColumn = columns[columnIndex - 1];
              if (targetColumn) {
                targetColumn.appendChild(componentEl);
              }
            }
          }
        }
      }
      
    } else if (section.type === 'sidebar' || section.type === 'main_sidebar') {
      // Main + Sidebar layout
      innerContainer.innerHTML = `
        <div class="gmkb-section__column gmkb-section__column--1 gmkb-section__column--main" 
             data-drop-zone="true" 
             data-column="main"
             data-column-index="1">
          <div class="gmkb-section__drop-zone">
            <span class="gmkb-section__drop-text">Drop to Main Area</span>
          </div>
        </div>
        <div class="gmkb-section__column gmkb-section__column--2 gmkb-section__column--sidebar" 
             data-drop-zone="true" 
             data-column="sidebar"
             data-column-index="2">
          <div class="gmkb-section__drop-zone">
            <span class="gmkb-section__drop-text">Drop to Sidebar</span>
          </div>
        </div>
      `;
      
      // Render components into appropriate columns
      if (section.components && section.components.length > 0) {
        const mainColumn = innerContainer.querySelector('.gmkb-section__column--main');
        const sidebarColumn = innerContainer.querySelector('.gmkb-section__column--sidebar');
        
        // Clear drop zone text when components exist
        mainColumn.innerHTML = '';
        sidebarColumn.innerHTML = '';
        
        for (const compRef of section.components) {
          const componentId = typeof compRef === 'string' ? compRef : compRef.component_id;
          const component = state.components[componentId];
          
          if (component) {
            const componentEl = await this.renderComponent(component);
            if (componentEl) {
              // Place component in appropriate column based on columnIndex
              const columnIndex = component.columnIndex || 1;
              if (columnIndex === 2) {
                sidebarColumn.appendChild(componentEl);
              } else {
                mainColumn.appendChild(componentEl);
              }
            }
          }
        }
      }
      
    } else {
      // Full width or default - single content area
      const contentEl = document.createElement('div');
      contentEl.className = 'gmkb-section__content';
      contentEl.setAttribute('data-drop-zone', 'true');
      contentEl.setAttribute('data-column', 'full');
      contentEl.setAttribute('data-column-index', '1');
      
      // Render components in this section
      if (section.components && section.components.length > 0) {
        for (const compRef of section.components) {
          const componentId = typeof compRef === 'string' ? compRef : compRef.component_id;
          const component = state.components[componentId];
          
          if (component) {
            const componentEl = await this.renderComponent(component);
            if (componentEl) {
              contentEl.appendChild(componentEl);
            }
          }
        }
      } else {
        // Empty section placeholder
        contentEl.innerHTML = `
          <div class="gmkb-section__drop-zone">
            <span class="gmkb-section__drop-text">Drop components here</span>
          </div>
        `;
      }
      
      innerContainer.appendChild(contentEl);
    }
    
    // Add inner container to section
    sectionEl.appendChild(innerContainer);
    
    // ROOT FIX: Section controls handled by Vue ControlsOverlay
    // No controls added here - unified Vue system handles all controls
    
    return sectionEl;
  }

  async renderComponentsDirectly(state) {
    // Use layout order if available, otherwise use components object order
    let componentsToRender = [];
    
    if (state.layout && Array.isArray(state.layout)) {
      // Render in layout order
      componentsToRender = state.layout
        .map(id => state.components[id])
        .filter(Boolean); // Remove any undefined components
    } else {
      // Fall back to object values
      componentsToRender = Object.values(state.components);
    }
    
    // Render each component
    for (const component of componentsToRender) {
      const componentEl = await this.renderComponent(component);
      if (componentEl) {
        this.container.appendChild(componentEl);
      }
    }
  }

  async renderComponent(component) {
    const renderer = await getComponentRenderer(component.type);
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
      
      // Check if this is a Vue component wrapper
      if (typeof renderer === 'object' && renderer.framework === 'vue' && renderer.render) {
        // Vue component wrapper - async render
        // ROOT FIX: Pass complete component data to Vue renderer
        const vueElement = await renderer.render(component, contentContainer);
        if (vueElement && vueElement.nodeType) {
          contentContainer.appendChild(vueElement);
        }
      } else if (typeof renderer === 'function') {
        // Standard renderer function
        const element = renderer(component);
        
        // ROOT FIX: Insert HTML content directly, not wrapped
        if (typeof element === 'string') {
          // Insert the HTML directly into the content container
          contentContainer.innerHTML = element;
        } else if (element && element.nodeType) {
          contentContainer.appendChild(element);
        } else {
          throw new Error('Renderer did not return a valid element');
        }
      } else if (typeof renderer === 'object' && renderer.render) {
        // Object with render method (non-Vue)
        const element = renderer.render(component);
        
        // Ensure element is a DOM node
        if (typeof element === 'string') {
          const div = document.createElement('div');
          div.innerHTML = element;
          contentContainer.appendChild(div.firstElementChild || div);
        } else if (element && element.nodeType) {
          contentContainer.appendChild(element);
        } else {
          throw new Error('Renderer did not return a valid element');
        }
      } else {
        throw new Error('Invalid renderer format');
      }
      
      // ROOT FIX: Controls are now handled by Vue ControlsOverlay
      // No controls added here - unified Vue system handles all controls
      
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
    div.setAttribute('data-component-type', component.type);
    div.innerHTML = `
      <div class="component-fallback">
        <h4>${component.type}</h4>
        <p>Component ID: ${component.id}</p>
      </div>
    `;
    // Controls handled by Vue ControlsOverlay
    return div;
  }

  // REMOVED: Component controls now handled by Vue ControlsOverlay
  addComponentControls(element, component) {
    // Controls are now managed by Vue ControlsOverlay - no controls added here
  }

  // REMOVED: Section controls now handled by Vue ControlsOverlay
  addSectionControls(element, section) {
    // Controls are now managed by Vue ControlsOverlay - no controls added here
    return; // Early return - no controls added
    const controls = document.createElement('div');
    controls.className = 'section-controls';
    controls.innerHTML = `
      <button class="control-btn control-btn--move-up" data-action="move-section-up" title="Move Section Up">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="19" x2="12" y2="5"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
      </button>
      <button class="control-btn control-btn--move-down" data-action="move-section-down" title="Move Section Down">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <polyline points="19 12 12 19 5 12"></polyline>
        </svg>
      </button>
      <button class="control-btn control-btn--settings" data-action="section-settings" title="Section Settings">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6m3.22-10.22l4.24-4.24M4.54 7.54l4.24-4.24M20.46 16.46l-4.24-4.24M7.78 13.78l-4.24 4.24"></path>
        </svg>
      </button>
      <button class="control-btn control-btn--delete" data-action="delete-section" title="Delete Section">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    `;
    
    controls.addEventListener('click', (e) => {
      e.stopPropagation();
      const btn = e.target.closest('.control-btn');
      if (btn) {
        const action = btn.dataset.action;
        if (action) {
          this.handleSectionAction(action, section.section_id);
        }
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
    const state = this.stateManager.getState();
    const sections = [...state.sections];
    const sectionIndex = sections.findIndex(s => s.section_id === sectionId);
    
    switch (action) {
      case 'delete-section':
        if (confirm('Delete this section and all its components?')) {
          // Emit event for main app to handle
          document.dispatchEvent(new CustomEvent('gmkb:section-action', {
            detail: { action, sectionId }
          }));
        }
        break;
        
      case 'move-section-up':
        if (sectionIndex > 0) {
          [sections[sectionIndex - 1], sections[sectionIndex]] = 
          [sections[sectionIndex], sections[sectionIndex - 1]];
          this.stateManager.dispatch({ 
            type: 'UPDATE_SECTIONS', 
            payload: sections 
          });
        }
        break;
        
      case 'move-section-down':
        if (sectionIndex < sections.length - 1) {
          [sections[sectionIndex], sections[sectionIndex + 1]] = 
          [sections[sectionIndex + 1], sections[sectionIndex]];
          this.stateManager.dispatch({ 
            type: 'UPDATE_SECTIONS', 
            payload: sections 
          });
        }
        break;
        
      case 'section-settings':
        // Emit event for settings panel
        document.dispatchEvent(new CustomEvent('gmkb:section-action', {
          detail: { action, sectionId }
        }));
        break;
    }
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
