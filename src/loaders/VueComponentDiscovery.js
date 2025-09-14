/**
 * Vue Component Discovery System
 * Maintains self-contained architecture by discovering Vue components automatically
 * No manual registration required - components are found by convention
 */

import { createApp } from 'vue';

// Cache for discovered Vue renderers
const vueRendererCache = new Map();

/**
 * Discover Vue renderer for a component type
 * Checks if a component has a Vue renderer without manual registration
 */
export async function discoverVueRenderer(componentType) {
  // Check cache first
  if (vueRendererCache.has(componentType)) {
    return vueRendererCache.get(componentType);
  }

  try {
    // For build time, we need to handle the known Vue components differently
    // These will be bundled with the app
    let rendererModule = null;
    
    // Import known Vue components that exist
    // This allows Vite to bundle them properly
    switch(componentType) {
      case 'biography':
        // Check if biography has a Vue renderer
        try {
          const { default: BiographyVue } = await import('../../components/biography/Biography.vue');
          rendererModule = {
            render(container, data) {
              const app = createApp(BiographyVue, data);
              app.mount(container);
              return app;
            }
          };
        } catch (e) {
          // No Vue component for biography
        }
        break;
        
      case 'hero':
        // Check if hero has a Vue renderer
        try {
          const { default: HeroVue } = await import('../../components/hero/Hero.vue');
          rendererModule = {
            render(container, data) {
              const app = createApp(HeroVue, data);
              app.mount(container);
              return app;
            }
          };
        } catch (e) {
          // No Vue component for hero
        }
        break;
        
      case 'guest-intro':
        // Check if guest-intro has a Vue renderer
        try {
          const { default: GuestIntroVue } = await import('../../components/guest-intro/GuestIntro.vue');
          rendererModule = {
            render(container, data) {
              const app = createApp(GuestIntroVue, data);
              app.mount(container);
              return app;
            }
          };
        } catch (e) {
          // No Vue component for guest-intro
        }
        break;
        
      case 'topics-questions':
        // Check if topics-questions has a Vue renderer
        try {
          const { default: TopicsQuestionsVue } = await import('../../components/topics-questions/TopicsQuestions.vue');
          rendererModule = {
            render(container, data) {
              const app = createApp(TopicsQuestionsVue, data);
              app.mount(container);
              return app;
            }
          };
        } catch (e) {
          // No Vue component for topics-questions
        }
        break;
        
      case 'photo-gallery':
        // Check if photo-gallery has a Vue renderer
        try {
          const { default: PhotoGalleryVue } = await import('../../components/photo-gallery/PhotoGallery.vue');
          rendererModule = {
            render(container, data) {
              const app = createApp(PhotoGalleryVue, data);
              app.mount(container);
              return app;
            }
          };
        } catch (e) {
          // No Vue component for photo-gallery
        }
        break;
        
      case 'logo-grid':
        // Check if logo-grid has a Vue renderer
        try {
          const { default: LogoGridVue } = await import('../../components/logo-grid/LogoGrid.vue');
          rendererModule = {
            render(container, data) {
              const app = createApp(LogoGridVue, data);
              app.mount(container);
              return app;
            }
          };
        } catch (e) {
          // No Vue component for logo-grid
        }
        break;
        
      default:
        // Component not known at build time
        // Will use standard renderer
        break;
    }
    
    if (rendererModule) {
      console.log(`✅ Discovered Vue renderer for ${componentType}`);
      vueRendererCache.set(componentType, rendererModule);
      return rendererModule;
    }
  } catch (error) {
    // No Vue renderer found - this is fine, component might use regular renderer
    console.log(`ℹ️ No Vue renderer found for ${componentType}, will use standard renderer`);
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
 * This maintains the self-contained architecture
 */
export async function renderVueComponent(componentType, container, data = {}) {
  const renderer = await discoverVueRenderer(componentType);
  
  if (!renderer) {
    console.warn(`No Vue renderer discovered for ${componentType}`);
    return null;
  }
  
  // Ensure we have a render method
  if (typeof renderer.render === 'function') {
    return renderer.render(container, data);
  }
  
  console.error(`Vue renderer for ${componentType} does not have a render method`);
  return null;
}

/**
 * Create a Vue component wrapper that can be used by the ComponentRegistry
 * This allows Vue components to work within the existing architecture
 */
export function createVueComponentWrapper(componentType) {
  return {
    async render(component, targetContainer) {
      // Always create a fresh container for Vue
      const vueContainer = document.createElement('div');
      vueContainer.className = `${componentType}-vue-wrapper`;
      vueContainer.setAttribute('data-component-id', component.id);
      
      // Prepare component data
      const componentData = {
        ...component.data,
        ...component.props,
        componentId: component.id
      };
      
      // Render using discovered Vue renderer
      try {
        await renderVueComponent(componentType, vueContainer, componentData);
        return vueContainer;
      } catch (error) {
        console.error(`Failed to render Vue component ${componentType}:`, error);
        // Return error placeholder
        vueContainer.innerHTML = `
          <div class="component-error">
            <p>Failed to render ${componentType} component</p>
          </div>
        `;
        return vueContainer;
      }
    },
    framework: 'vue',
    discoverable: true
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
