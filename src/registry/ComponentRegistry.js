/**
 * Component Registry - Maps component types to their renderers
 * Uses dynamic imports for code splitting
 */

export const ComponentRegistry = {};

// Register a component renderer
export function registerComponent(type, renderer) {
  ComponentRegistry[type] = renderer;
  console.log(`✅ Registered component: ${type}`);
}

// Check if component type exists
export function hasComponent(type) {
  return type in ComponentRegistry;
}

// Get component renderer
export function getComponentRenderer(type) {
  if (!hasComponent(type)) {
    console.warn(`Component type "${type}" not found in registry`);
    return null;
  }
  return ComponentRegistry[type];
}

// Load component renderers - using fallback renderers for production
export async function loadComponentRenderers() {
  try {
    // For production, we'll use fallback renderers since dynamic imports of external files
    // are problematic in bundled environments. The actual components are rendered server-side
    // or via the existing WordPress AJAX system.
    const componentTypes = ['hero', 'biography', 'topics', 'contact', 'cta', 'testimonials'];
    
    for (const type of componentTypes) {
      // Register a fallback renderer for each component type
      // These will create placeholder elements that the existing system can enhance
      registerComponent(type, createFallbackRenderer(type));
    }
    
    console.log('✅ Component renderers loaded:', Object.keys(ComponentRegistry));
  } catch (error) {
    console.error('Failed to load component renderers:', error);
  }
}

// Create a fallback renderer for missing components
function createFallbackRenderer(type) {
  return function fallbackRenderer(component) {
    const div = document.createElement('div');
    div.className = `component-${type} component-fallback`;
    div.innerHTML = `
      <div class="component-placeholder">
        <h3>${type.charAt(0).toUpperCase() + type.slice(1)} Component</h3>
        <p>Component data: ${JSON.stringify(component.data || {})}</p>
      </div>
    `;
    return div;
  };
}

// Initialize component registry on load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', loadComponentRenderers);
}
