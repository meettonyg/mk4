// Component Loader for Vue Components
// Maintains self-contained architecture while enabling bundling

import { createApp, computed } from 'vue';

// Registry for Vue component definitions
const vueComponents = new Map();

// Register Biography Vue component
export async function registerBiographyVue() {
  try {
    // Import the Vue component from its self-contained directory
    const module = await import('../../components/biography/Biography.vue');
    vueComponents.set('biography', module.default || module);
    console.log('✅ Biography Vue component registered for bundling');
    return true;
  } catch (error) {
    console.log('Biography Vue component not found, using inline definition');
    
    // Inline fallback for Biography component
    const BiographyVue = {
      name: 'BiographyComponent',
      template: `
        <div class="biography-component gmkb-component" :data-component-id="componentId">
          <div class="biography__content">
            <h2 class="biography__title" v-if="showTitle">{{ title }}</h2>
            <div class="biography__text" v-html="formattedBiography"></div>
            <div v-if="!localBiography" class="biography__empty">
              <p>No biography available.</p>
              <button @click="loadFromPods" class="btn btn--primary btn--sm" v-if="podsData.biography">
                Load from Guest Post Data
              </button>
            </div>
          </div>
        </div>
      `,
      props: {
        biography: { type: String, default: '' },
        title: { type: String, default: 'Biography' },
        showTitle: { type: Boolean, default: true },
        componentId: { type: String, required: true }
      },
      setup(props) {
        const podsData = window.gmkbData?.pods_data || {};
        
        // Auto-load from Pods if empty
        const localBiography = props.biography || podsData.biography || '';
        
        const formattedBiography = computed(() => {
          if (!localBiography) return '';
          let formatted = localBiography;
          formatted = formatted.replace(/\n\n/g, '</p><p>');
          formatted = formatted.replace(/\n/g, '<br>');
          return `<p>${formatted}</p>`;
        });
        
        const loadFromPods = () => {
          if (window.GMKB?.stateManager && props.componentId && podsData.biography) {
            window.GMKB.stateManager.updateComponent(props.componentId, {
              data: { biography: podsData.biography },
              props: { biography: podsData.biography }
            });
          }
        };
        
        return { localBiography, formattedBiography, podsData, loadFromPods };
      }
    };
    
    vueComponents.set('biography', BiographyVue);
    return true;
  }
}

// Register Hero Vue component
export async function registerHeroVue() {
  try {
    const module = await import('../../components/hero/Hero.vue');
    vueComponents.set('hero', module.default || module);
    console.log('✅ Hero Vue component registered for bundling');
    return true;
  } catch (error) {
    console.log('Hero Vue component not found, using inline definition');
    
    // Inline fallback for Hero component
    const HeroVue = {
      name: 'HeroComponent',
      template: `
        <div class="hero-component gmkb-component" :data-component-id="componentId">
          <div class="hero__content">
            <h1 class="hero__title" v-if="displayTitle">{{ displayTitle }}</h1>
            <p class="hero__subtitle" v-if="displaySubtitle">{{ displaySubtitle }}</p>
            <div class="hero__actions" v-if="ctaText">
              <a :href="ctaUrl" class="hero__cta btn btn--primary">{{ ctaText }}</a>
            </div>
          </div>
        </div>
      `,
      props: {
        title: { type: String, default: '' },
        subtitle: { type: String, default: '' },
        ctaText: { type: String, default: '' },
        ctaUrl: { type: String, default: '#' },
        componentId: { type: String, required: true }
      },
      setup(props) {
        const podsData = window.gmkbData?.pods_data || {};
        
        // Use Pods data as defaults
        const displayTitle = computed(() => 
          props.title || `${podsData.first_name || ''} ${podsData.last_name || ''}`.trim() || 'Welcome'
        );
        const displaySubtitle = computed(() => 
          props.subtitle || podsData.tagline || ''
        );
        
        return { displayTitle, displaySubtitle };
      }
    };
    
    vueComponents.set('hero', HeroVue);
    return true;
  }
}

// Render a Vue component
export function renderVueComponent(type, container, props = {}) {
  const VueComponent = vueComponents.get(type);
  
  if (!VueComponent) {
    console.warn(`Vue component ${type} not registered`);
    return null;
  }
  
  // Ensure container is a proper DOM element
  if (typeof container === 'string') {
    container = document.querySelector(container);
  }
  
  if (!container || !container.nodeType) {
    console.error('Invalid container for Vue component');
    return null;
  }
  
  // Add Pods data to props if not already provided
  const podsData = window.gmkbData?.pods_data || {};
  if (type === 'biography' && !props.biography && podsData.biography) {
    props.biography = podsData.biography;
    console.log('Biography: Auto-loaded from Pods data');
  } else if (type === 'hero') {
    if (!props.title && (podsData.first_name || podsData.last_name)) {
      props.title = `${podsData.first_name || ''} ${podsData.last_name || ''}`.trim();
    }
    if (!props.subtitle && podsData.tagline) {
      props.subtitle = podsData.tagline;
    }
  }
  
  try {
    // Create and mount Vue app
    const app = createApp(VueComponent, props);
    const instance = app.mount(container);
    
    // Store app reference for cleanup
    container._vueApp = app;
    
    console.log(`✅ ${type} Vue component rendered with props:`, props);
    
    return instance;
  } catch (error) {
    console.error(`Failed to mount Vue component ${type}:`, error);
    // Fallback: render as HTML
    if (type === 'biography' && props.biography) {
      container.innerHTML = `
        <div class="biography-component">
          <h2>${props.title || 'Biography'}</h2>
          <div class="biography__text">${props.biography}</div>
        </div>
      `;
    }
    return null;
  }
}

// Note: New Vue components are now registered via VueComponentDiscovery.js
// This avoids build-time import issues with renderer.vue.js files
// Components are discovered and imported directly as .vue files

// Initialize Vue components
export async function initializeVueComponents() {
  await registerBiographyVue();
  await registerHeroVue();
  
  // New Vue components are discovered via VueComponentDiscovery.js
  
  // Make render function globally available
  window.GMKBVueRenderer = {
    render: renderVueComponent,
    hasComponent: (type) => vueComponents.has(type)
  };
  
  console.log('✅ Vue component system initialized with', vueComponents.size, 'components');
  return true;
}
