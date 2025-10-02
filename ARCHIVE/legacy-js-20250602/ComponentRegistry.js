/**
 * Component Registry - Discovery-based architecture
 * Components are discovered, not registered
 * Maintains self-contained component architecture
 */

import VueComponentDiscovery from '../loaders/VueComponentDiscovery.js';

// Component registry object - populated by discovery
export const ComponentRegistry = {};

// Component schemas - populated by discovery
const ComponentSchemas = {};

/**
 * Discover and register a component
 * This respects the self-contained architecture
 */
export async function discoverComponent(type) {
  // First check if it's a Vue component
  const hasVue = await VueComponentDiscovery.hasVueRenderer(type);
  
  if (hasVue) {
    // Create Vue wrapper for this component
    ComponentRegistry[type] = VueComponentDiscovery.createWrapper(type);
    console.log(`✅ Discovered Vue component: ${type}`);
    return true;
  }
  
  // Check for standard renderer.js
  try {
    const rendererModule = await import(`../../components/${type}/renderer.js`);
    if (rendererModule.default) {
      ComponentRegistry[type] = rendererModule.default;
      console.log(`✅ Discovered standard component: ${type}`);
      return true;
    }
  } catch (error) {
    // No standard renderer found
  }
  
  // Fallback to simple renderer
  ComponentRegistry[type] = createSimpleRenderer(type);
  console.log(`ℹ️ Using fallback renderer for: ${type}`);
  return true;
}

/**
 * Discover component schema
 */
export async function discoverSchema(type) {
  try {
    const schemaModule = await import(`../../components/${type}/schema.json`);
    if (schemaModule.default) {
      ComponentSchemas[type] = schemaModule.default;
      return schemaModule.default;
    }
  } catch (error) {
    // No schema found
  }
  return null;
}

// Check if component type exists
export function hasComponent(type) {
  return type in ComponentRegistry;
}

// Check if a component uses Vue
export function isVueComponent(type) {
  const renderer = ComponentRegistry[type];
  return renderer && typeof renderer === 'object' && renderer.framework === 'vue';
}

// Get component renderer (with lazy discovery)
export async function getComponentRenderer(type) {
  if (!hasComponent(type)) {
    // Try to discover it
    await discoverComponent(type);
  }
  
  if (!hasComponent(type)) {
    console.warn(`Component type "${type}" not found`);
    return createSimpleRenderer(type);
  }
  
  return ComponentRegistry[type];
}

// Get component schema (with lazy discovery)
export async function getComponentSchema(type) {
  if (!ComponentSchemas[type]) {
    await discoverSchema(type);
  }
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
        
      case 'guest-intro':
        const fullName = data.full_name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Guest Name';
        content = `
          <div class="gmkb-guest-intro">
            <h2>${fullName}</h2>
            ${data.guest_title ? `<h3>${data.guest_title}</h3>` : ''}
            ${data.company ? `<p>${data.company}</p>` : ''}
            ${data.tagline ? `<blockquote>${data.tagline}</blockquote>` : ''}
            ${data.introduction ? `<p>${data.introduction}</p>` : ''}
          </div>
        `;
        break;
        
      case 'topics-questions':
        const topics = [];
        const questions = [];
        
        // Collect topics
        for (let i = 1; i <= 5; i++) {
          if (data[`topic_${i}`]) topics.push(data[`topic_${i}`]);
        }
        
        // Collect questions  
        for (let i = 1; i <= 25; i++) {
          if (data[`question_${i}`]) questions.push(data[`question_${i}`]);
        }
        
        content = `
          <div class="gmkb-topics-questions">
            ${topics.length > 0 ? `
              <div class="topics-section">
                <h3>Topics</h3>
                <ul>${topics.map(t => `<li>${t}</li>`).join('')}</ul>
              </div>
            ` : ''}
            ${questions.length > 0 ? `
              <div class="questions-section">
                <h3>Questions</h3>
                <ol>${questions.map(q => `<li>${q}</li>`).join('')}</ol>
              </div>
            ` : ''}
          </div>
        `;
        break;
        
      case 'photo-gallery':
        content = `
          <div class="gmkb-photo-gallery">
            <h3>${data.title || 'Photo Gallery'}</h3>
            <p>Gallery component - images would display here</p>
          </div>
        `;
        break;
        
      case 'logo-grid':
        content = `
          <div class="gmkb-logo-grid">
            <h3>${data.title || 'Logos'}</h3>
            <p>Logo grid component - logos would display here</p>
          </div>
        `;
        break;
        
      case 'topics':
        const topicList = data.topics || [];
        content = `
          <div class="gmkb-topics">
            <h2>Topics</h2>
            ${topicList.length > 0 ? 
              `<ul>${topicList.map(t => `<li>${t}</li>`).join('')}</ul>` : 
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

/**
 * Load all component renderers through discovery
 * This maintains the self-contained architecture
 */
export async function loadComponentRenderers() {
  console.log('🔍 Starting component discovery...');
  
  // Initialize Vue discovery system
  await VueComponentDiscovery.initialize();
  
  // Get component types from WordPress data
  // In production, this comes from PHP ComponentDiscovery
  const componentTypes = window.gmkbData?.componentTypes || [
    // Default list for development
    'hero', 'biography', 'topics', 'contact', 'cta', 'testimonials',
    'guest-intro', 'topics-questions', 'photo-gallery', 'logo-grid',
    'call-to-action', 'social', 'stats', 'questions',
    'video-intro', 'podcast-player', 'booking-calendar',
    'authority-hook'
  ];
  
  // Discover all components in parallel
  const discoveries = componentTypes.map(type => discoverComponent(type));
  await Promise.all(discoveries);
  
  console.log('✅ Component discovery complete:', Object.keys(ComponentRegistry));
  return ComponentRegistry;
}

// Create the global registry that existing components might expect
if (typeof window !== 'undefined') {
  window.GMKBComponentRegistry = {
    discover: discoverComponent,
    get: getComponentRenderer,
    has: hasComponent,
    getSchema: getComponentSchema,
    registry: ComponentRegistry
  };
}

export default {
  ComponentRegistry,
  discoverComponent,
  hasComponent,
  isVueComponent,
  getComponentRenderer,
  getComponentSchema,
  loadComponentRenderers
};
