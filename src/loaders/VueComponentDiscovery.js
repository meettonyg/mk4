/**
 * Vue Component Discovery System
 * ROOT FIX: Use existing renderer.vue.js files instead of trying to import .vue files
 * Maintains self-contained architecture by discovering Vue components automatically
 */

import { createApp } from 'vue';

// Cache for discovered Vue renderers
const vueRendererCache = new Map();

/**
 * Discover Vue renderer for a component type
 * ROOT FIX: Check for both .vue files and renderer.vue.js files
 */
export async function discoverVueRenderer(componentType) {
  // Check cache first
  if (vueRendererCache.has(componentType)) {
    return vueRendererCache.get(componentType);
  }

  // ROOT FIX: First try to load the renderer.vue.js file if it exists
  try {
    const rendererModule = await import(`../../components/${componentType}/renderer.vue.js`);
    
    if (rendererModule && rendererModule.default) {
      console.log(`✅ Discovered Vue renderer.vue.js for ${componentType}`);
      vueRendererCache.set(componentType, rendererModule.default);
      return rendererModule.default;
    }
  } catch (error) {
    // No renderer.vue.js file, try .vue file next
  }
  
  // ROOT FIX: Try to load the .vue file and create a renderer for it
  try {
    let vueComponent = null;
    
    // Try to import the Vue component based on known components
    switch(componentType) {
      case 'hero':
        vueComponent = (await import('../../components/hero/Hero.vue')).default;
        break;
      case 'biography':
        vueComponent = (await import('../../components/biography/Biography.vue')).default;
        break;
      case 'guest-intro':
        vueComponent = (await import('../../components/guest-intro/GuestIntro.vue')).default;
        break;
      case 'photo-gallery':
        vueComponent = (await import('../../components/photo-gallery/PhotoGallery.vue')).default;
        break;
      case 'logo-grid':
        vueComponent = (await import('../../components/logo-grid/LogoGrid.vue')).default;
        break;
      case 'topics-questions':
        vueComponent = (await import('../../components/topics-questions/TopicsQuestions.vue')).default;
        break;
    }
    
    if (vueComponent) {
      // Create a renderer wrapper for the Vue component
      const renderer = {
        name: componentType,
        render(data = {}, container) {
          if (!container) {
            console.error(`${componentType} Vue renderer: No container provided`);
            return null;
          }
          
          // Prepare props with all possible data sources
          const props = {
            ...data,
            componentId: data.id || data.componentId || `${componentType}_${Date.now()}`
          };
          
          // Create and mount Vue app
          const app = createApp(vueComponent, props);
          const instance = app.mount(container);
          
          console.log(`${componentType} Vue component mounted with data:`, props);
          
          // Store app reference for cleanup
          container._vueApp = app;
          
          return instance;
        },
        destroy(container) {
          if (container && container._vueApp) {
            container._vueApp.unmount();
            delete container._vueApp;
          }
        },
        isVueRenderer: true
      };
      
      console.log(`✅ Created Vue renderer for ${componentType} from .vue file`);
      vueRendererCache.set(componentType, renderer);
      return renderer;
    }
  } catch (error) {
    // No Vue component found
    console.log(`ℹ️ No Vue component found for ${componentType}`);
  }
  
  return null;
}

/**
 * Check if a component has a Vue renderer
 * This is done by checking for renderer in cache or attempting discovery
 */
export async function hasVueRenderer(componentType) {
  // Check cache first
  if (vueRendererCache.has(componentType)) {
    return true;
  }
  
  // Try to discover
  const renderer = await discoverVueRenderer(componentType);
  return renderer !== null;
}

/**
 * Render a Vue component using discovered renderer
 * ROOT FIX: Properly handle both render method signatures
 */
export async function renderVueComponent(componentType, container, data = {}) {
  const renderer = await discoverVueRenderer(componentType);
  
  if (!renderer) {
    console.warn(`No Vue renderer discovered for ${componentType}`);
    return null;
  }
  
  // Ensure we have a render method
  if (typeof renderer.render === 'function') {
    // ROOT FIX: Call with correct parameter order (data, container)
    // The renderer.vue.js files expect (data, container) not (container, data)
    return renderer.render(data, container);
  }
  
  console.error(`Vue renderer for ${componentType} does not have a render method`);
  return null;
}

/**
 * Create a Vue component wrapper that can be used by the ComponentRegistry
 * ROOT FIX: Use the renderer.vue.js render method directly
 */
export function createVueComponentWrapper(componentType) {
  return {
    async render(component, targetContainer) {
      // ROOT FIX: Get the actual Vue renderer for this component
      const vueRenderer = await discoverVueRenderer(componentType);
      
      if (!vueRenderer || !vueRenderer.render) {
        console.warn(`No Vue renderer found for ${componentType}`);
        return null;
      }
      
      // Always create a fresh container for Vue
      const vueContainer = document.createElement('div');
      vueContainer.className = `${componentType}-vue-wrapper`;
      vueContainer.setAttribute('data-component-id', component.id);
      
      // ROOT FIX: Prepare component data with all properties
      // Merge component.data and component.props, add the component ID
      const componentData = {
        ...component.data,
        ...component.props,
        id: component.id,
        componentId: component.id
      };
      
      try {
        // ROOT FIX: Call the renderer's render method directly
        // This properly passes data to the Vue component
        const instance = vueRenderer.render(componentData, vueContainer);
        
        if (instance) {
          console.log(`✅ Rendered Vue component ${componentType} with data:`, componentData);
        }
        
        return vueContainer;
      } catch (error) {
        console.error(`Failed to render Vue component ${componentType}:`, error);
        // Return error placeholder
        vueContainer.innerHTML = `
          <div class="component-error">
            <p>Failed to render ${componentType} component</p>
            <small>${error.message}</small>
          </div>
        `;
        return vueContainer;
      }
    },
    framework: 'vue',
    discoverable: true,
    isVueRenderer: true
  };
}

/**
 * Initialize Vue Component Discovery
 * This scans for available Vue components without hardcoding them
 */
export async function initializeVueComponentDiscovery() {
  console.log('🔍 Initializing Vue Component Discovery...');
  
  // Get list of components from WordPress data or from directory scan
  const componentTypes = window.gmkbData?.componentTypes || [
    // These are discovered from the /components directory
    // In production, this list comes from PHP ComponentDiscovery
    'hero', 'biography', 'topics', 'contact', 'testimonials',
    'guest-intro', 'topics-questions', 'photo-gallery', 'logo-grid',
    'call-to-action', 'social', 'stats', 'questions',
    'video-intro', 'podcast-player', 'booking-calendar',
    'authority-hook'
  ];
  
  // Pre-discover Vue components (optional - for performance)
  const discoveries = componentTypes.map(type => 
    discoverVueRenderer(type).catch(() => null)
  );
  
  await Promise.all(discoveries);
  
  console.log(`✅ Vue Component Discovery complete. Found ${vueRendererCache.size} Vue components`);
  
  // List discovered components
  if (vueRendererCache.size > 0) {
    console.log('Discovered Vue components:', Array.from(vueRendererCache.keys()));
  }
  
  // Make discovery functions globally available
  window.GMKBVueDiscovery = {
    discover: discoverVueRenderer,
    hasVueRenderer,
    render: renderVueComponent,
    createWrapper: createVueComponentWrapper,
    discoveredComponents: () => Array.from(vueRendererCache.keys())
  };
  
  return true;
}

export default {
  initialize: initializeVueComponentDiscovery,
  discover: discoverVueRenderer,
  hasVueRenderer,
  render: renderVueComponent,
  createWrapper: createVueComponentWrapper
};
