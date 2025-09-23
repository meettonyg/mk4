/**
 * Vue Store Bridge
 * Connects the Vue Pinia store to the legacy rendering system
 * This ensures components added via Vue are actually rendered
 */

export function initializeVueStoreBridge() {
  console.log('Initializing Vue Store Bridge...');
  
  // Listen for component-added events from the Vue store
  document.addEventListener('gmkb:component-added', (event) => {
    const { componentId, component, sectionId } = event.detail;
    console.log('Vue Store Bridge: Component added event received', { componentId, type: component.type });
    
    // Try to trigger a render through various available systems
    triggerComponentRender(componentId, component, sectionId);
  });
  
  // Listen for state changes from the Vue store
  document.addEventListener('gmkb:state-changed', (event) => {
    const { action, state } = event.detail;
    console.log('Vue Store Bridge: State changed', action);
    
    if (action === 'component-added' || action === 'section-added') {
      // Trigger a full re-render of the preview area
      triggerPreviewRefresh(state);
    }
  });
  
  console.log('✅ Vue Store Bridge initialized');
}

function triggerComponentRender(componentId, component, sectionId) {
  // Method 1: Try using the global state manager if it exists
  if (window.stateManager) {
    console.log('Vue Store Bridge: Using stateManager to add component');
    
    // Update the state manager with the new component
    const currentState = window.stateManager.getState() || {};
    if (!currentState.components) currentState.components = {};
    if (!currentState.sections) currentState.sections = [];
    
    // Add component to state
    currentState.components[componentId] = component;
    
    // Add to section if specified
    if (sectionId) {
      const section = currentState.sections.find(s => s.section_id === sectionId);
      if (section) {
        if (!section.components) section.components = [];
        section.components.push(componentId);
      }
    }
    
    // Set the updated state
    window.stateManager.setState(currentState);
    
    // Dispatch render event
    document.dispatchEvent(new CustomEvent('stateChanged', {
      detail: { 
        action: 'COMPONENT_ADDED',
        componentId,
        component 
      }
    }));
    
    return;
  }
  
  // Method 2: Try refreshing specific containers
  refreshContainers();
}

function triggerPreviewRefresh(state) {
  console.log('Vue Store Bridge: Triggering preview refresh');
  
  // Method 1: Hide/show empty state based on content
  const emptyState = document.getElementById('empty-state');
  const savedContainer = document.getElementById('saved-components-container');
  
  if (state && state.components && Object.keys(state.components).length > 0) {
    // We have components, hide empty state and show saved container
    if (emptyState) {
      emptyState.style.display = 'none';
    }
    if (savedContainer) {
      savedContainer.style.display = 'block';
    }
    
    // Trigger rendering of components
    renderComponentsInPreview(state);
  }
}

function renderComponentsInPreview(state) {
  console.log('Vue Store Bridge: Rendering components in preview');
  
  // Find the container where components should be rendered
  const containers = [
    document.getElementById('components-direct-container'),
    document.getElementById('gmkb-sections-container'),
    document.getElementById('saved-components-container')
  ].filter(Boolean);
  
  if (containers.length === 0) {
    console.warn('Vue Store Bridge: No containers found for rendering');
    return;
  }
  
  // For each section, render its components
  if (state.sections && state.sections.length > 0) {
    const sectionsContainer = document.getElementById('gmkb-sections-container');
    if (sectionsContainer && state.sections.length > 0) {
      // Clear existing content
      sectionsContainer.innerHTML = '';
      
      // Render each section with its components
      state.sections.forEach(section => {
        const sectionEl = renderSection(section, state.components);
        if (sectionEl) {
          sectionsContainer.appendChild(sectionEl);
        }
      });
    }
  } else if (state.components && Object.keys(state.components).length > 0) {
    // No sections, render components directly
    const directContainer = document.getElementById('components-direct-container');
    if (directContainer) {
      directContainer.innerHTML = '';
      
      Object.entries(state.components).forEach(([id, component]) => {
        const componentEl = renderComponent(id, component);
        if (componentEl) {
          directContainer.appendChild(componentEl);
        }
      });
    }
  }
}

function renderSection(section, components) {
  const sectionEl = document.createElement('div');
  sectionEl.className = `gmkb-section gmkb-section--${section.layout || 'full_width'}`;
  sectionEl.dataset.sectionId = section.section_id;
  
  // Add section controls
  const controls = document.createElement('div');
  controls.className = 'gmkb-section-controls';
  controls.innerHTML = `
    <button class="gmkb-section-control" data-action="delete-section" title="Delete Section">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6"/>
      </svg>
    </button>
  `;
  sectionEl.appendChild(controls);
  
  // Add section content
  const content = document.createElement('div');
  content.className = 'gmkb-section-content';
  
  // Render components in this section
  if (section.components && section.components.length > 0) {
    section.components.forEach(componentId => {
      const component = components[componentId];
      if (component) {
        const componentEl = renderComponent(componentId, component);
        if (componentEl) {
          content.appendChild(componentEl);
        }
      }
    });
  } else {
    // Empty section placeholder
    content.innerHTML = `
      <div class="gmkb-section-placeholder">
        <p>Empty section - drag components here</p>
      </div>
    `;
  }
  
  sectionEl.appendChild(content);
  return sectionEl;
}

function renderComponent(componentId, component) {
  const componentEl = document.createElement('div');
  componentEl.className = `gmkb-component gmkb-component--${component.type}`;
  componentEl.dataset.componentId = componentId;
  componentEl.dataset.componentType = component.type;
  
  // Add component controls
  const controls = document.createElement('div');
  controls.className = 'gmkb-component-controls';
  controls.innerHTML = `
    <button class="gmkb-control" data-action="move-up" title="Move Up">↑</button>
    <button class="gmkb-control" data-action="move-down" title="Move Down">↓</button>
    <button class="gmkb-control" data-action="edit" title="Edit">✏️</button>
    <button class="gmkb-control" data-action="duplicate" title="Duplicate">📋</button>
    <button class="gmkb-control" data-action="delete" title="Delete">🗑️</button>
  `;
  componentEl.appendChild(controls);
  
  // Add component content with default rendering
  const content = document.createElement('div');
  content.className = 'gmkb-component-content';
  content.innerHTML = getDefaultComponentHTML(component);
  componentEl.appendChild(content);
  
  // Try to trigger the component's own renderer if available
  setTimeout(() => {
    if (window.GMKB?.componentRegistry?.get?.(component.type)) {
      const renderer = window.GMKB.componentRegistry.get(component.type);
      if (renderer && renderer.render) {
        try {
          const rendered = renderer.render(component.data || {});
          if (rendered) {
            content.innerHTML = rendered;
          }
        } catch (error) {
          console.error(`Failed to render component ${component.type}:`, error);
        }
      }
    }
  }, 100);
  
  return componentEl;
}

function getDefaultComponentHTML(component) {
  // Default HTML for different component types
  const templates = {
    hero: `
      <div class="hero-component">
        <h1>${component.data?.title || 'Hero Title'}</h1>
        <p>${component.data?.subtitle || 'Hero subtitle goes here'}</p>
      </div>
    `,
    biography: `
      <div class="biography-component">
        <h2>${component.data?.title || 'Biography'}</h2>
        <p>${component.data?.content || 'Biography content goes here...'}</p>
      </div>
    `,
    topics: `
      <div class="topics-component">
        <h2>${component.data?.title || 'Topics'}</h2>
        <ul>
          ${(component.data?.topics || ['Topic 1', 'Topic 2', 'Topic 3'])
            .map(topic => `<li>${topic}</li>`).join('')}
        </ul>
      </div>
    `,
    contact: `
      <div class="contact-component">
        <h2>${component.data?.title || 'Contact'}</h2>
        <p>Email: ${component.data?.email || 'email@example.com'}</p>
        <p>Phone: ${component.data?.phone || '(555) 123-4567'}</p>
      </div>
    `,
    social: `
      <div class="social-component">
        <h2>${component.data?.title || 'Connect With Me'}</h2>
        <div class="social-links">
          ${(component.data?.profiles || []).map(profile => 
            `<a href="${profile.url}" target="_blank">${profile.platform}</a>`
          ).join(' | ') || 'Social links will appear here'}
        </div>
      </div>
    `,
    default: `
      <div class="component-placeholder">
        <h3>${component.type.charAt(0).toUpperCase() + component.type.slice(1)} Component</h3>
        <p>Component content will appear here</p>
      </div>
    `
  };
  
  return templates[component.type] || templates.default;
}

function refreshContainers() {
  // Try to refresh various containers that might show components
  const containers = [
    'saved-components-container',
    'gmkb-sections-container',
    'components-direct-container',
    'media-kit-preview'
  ];
  
  containers.forEach(id => {
    const container = document.getElementById(id);
    if (container) {
      // Trigger a visual update by toggling display
      const display = container.style.display;
      container.style.display = 'none';
      setTimeout(() => {
        container.style.display = display || 'block';
      }, 10);
    }
  });
}

// Auto-initialize when script loads
initializeVueStoreBridge();

// Export for manual initialization if needed
export default initializeVueStoreBridge;
