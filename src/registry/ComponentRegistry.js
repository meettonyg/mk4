/**
 * Component Registry - Direct imports for lean bundle
 * Imports component renderers directly as modules
 */

// Component registry object
export const ComponentRegistry = {};

// Component schemas
const ComponentSchemas = {};

// Register a component renderer
export function registerComponent(type, renderer, schema = null) {
  ComponentRegistry[type] = renderer;
  if (schema) {
    ComponentSchemas[type] = schema;
  }
  console.log(`✅ Registered component: ${type}`);
  return true;
}

// Check if component type exists
export function hasComponent(type) {
  return type in ComponentRegistry;
}

// Get component renderer
export function getComponentRenderer(type) {
  if (!hasComponent(type)) {
    console.warn(`Component type "${type}" not found in registry`);
    return createSimpleRenderer(type);
  }
  
  const renderer = ComponentRegistry[type];
  
  // Check if it's a Vue renderer object
  if (typeof renderer === 'object' && renderer.render) {
    return renderer.render;
  }
  
  // Check if it's a function that needs to be called
  if (typeof renderer === 'function') {
    return renderer;
  }
  
  return renderer;
}

// Check if a component uses Vue
export function isVueComponent(type) {
  const renderer = ComponentRegistry[type];
  return renderer && typeof renderer === 'object' && renderer.framework === 'vue';
}

// Get component schema
export function getComponentSchema(type) {
  return ComponentSchemas[type] || null;
}

// Create a simple renderer for components
function createSimpleRenderer(type) {
  return function simpleRenderer(component) {
    // Extract component data
    const data = component.data || component.props || {};
    
    // Create basic HTML structure based on component type
    let content = '';
    
    switch(type) {
      case 'hero':
        content = `
          <div class="gmkb-hero">
            <h1>${data.title || data.full_name || 'Guest Name'}</h1>
            ${data.subtitle ? `<h2>${data.subtitle}</h2>` : ''}
            ${data.description ? `<p>${data.description}</p>` : ''}
          </div>
        `;
        break;
        
      case 'biography':
        content = `
          <div class="gmkb-biography">
            <h2>Biography</h2>
            <p>${data.biography || 'No biography available.'}</p>
          </div>
        `;
        break;
        
      case 'topics':
        const topics = data.topics || [];
        content = `
          <div class="gmkb-topics">
            <h2>Topics</h2>
            ${topics.length > 0 ? 
              `<ul>${topics.map(t => `<li>${t}</li>`).join('')}</ul>` : 
              '<p>No topics available.</p>'
            }
          </div>
        `;
        break;
        
      case 'contact':
        content = `
          <div class="gmkb-contact">
            <h2>Contact</h2>
            ${data.email ? `<p>Email: ${data.email}</p>` : ''}
            ${data.phone ? `<p>Phone: ${data.phone}</p>` : ''}
            ${data.website ? `<p>Website: ${data.website}</p>` : ''}
          </div>
        `;
        break;
        
      case 'cta':
      case 'call-to-action':
        content = `
          <div class="gmkb-cta">
            <h2>${data.title || 'Call to Action'}</h2>
            ${data.description ? `<p>${data.description}</p>` : ''}
            ${data.button_text ? 
              `<button class="btn btn-primary">${data.button_text}</button>` : ''
            }
          </div>
        `;
        break;
        
      case 'testimonials':
        const testimonials = data.testimonials || [];
        content = `
          <div class="gmkb-testimonials">
            <h2>Testimonials</h2>
            ${testimonials.length > 0 ?
              testimonials.map(t => `
                <blockquote>
                  <p>${t.text || ''}</p>
                  <cite>- ${t.author || 'Anonymous'}</cite>
                </blockquote>
              `).join('') :
              '<p>No testimonials available.</p>'
            }
          </div>
        `;
        break;
        
      default:
        content = `
          <div class="gmkb-component gmkb-component--${type}">
            <h3>${type.charAt(0).toUpperCase() + type.slice(1)} Component</h3>
            <pre>${JSON.stringify(data, null, 2)}</pre>
          </div>
        `;
    }
    
    // Create DOM element
    const div = document.createElement('div');
    div.innerHTML = content;
    return div.firstElementChild;
  };
}

// Try to load Vue renderer for a component
async function tryLoadVueRenderer(type) {
  try {
    // Try to import Vue renderer
    const vueRendererPath = `../../components/${type}/renderer.vue.js`;
    const module = await import(vueRendererPath);
    
    if (module.render) {
      console.log(`✅ Loaded Vue renderer for ${type}`);
      return module.render;
    }
  } catch (error) {
    // Vue renderer not found, fall back to regular renderer
    console.log(`ℹ️ No Vue renderer for ${type}, using standard renderer`);
  }
  
  return null;
}

// Initialize component registry with simple renderers
export async function loadComponentRenderers() {
  // Register simple renderers for all component types
  const componentTypes = ['hero', 'biography', 'topics', 'contact', 'cta', 'testimonials'];
  
  // Try to load Vue renderers first, fall back to simple renderers
  for (const type of componentTypes) {
    if (!hasComponent(type)) {
      // Try Vue renderer first
      const vueRenderer = await tryLoadVueRenderer(type);
      
      if (vueRenderer) {
        // Register Vue renderer with metadata
        registerComponent(type, {
          render: vueRenderer,
          framework: 'vue'
        });
      } else {
        // Fall back to simple renderer
        registerComponent(type, createSimpleRenderer(type));
      }
    }
  }
  
  console.log('✅ Component renderers loaded:', Object.keys(ComponentRegistry));
  return ComponentRegistry;
}

// Create the global registry that existing components might expect
if (typeof window !== 'undefined') {
  window.GMKBComponentRegistry = {
    register: registerComponent,
    get: getComponentRenderer,
    has: hasComponent,
    getSchema: getComponentSchema
  };
}
