/**
 * Hero Component Vue Renderer
 * Bridges the Hero Vue component with the existing component system
 * Follows self-contained component architecture
 */

import { createApp } from 'vue';
import { ref, computed } from 'vue';

// Inline Vue component until build process is fixed
const HeroVue = {
  name: 'HeroComponent',
  template: `
    <div class="hero-component gmkb-component" :data-component-id="componentId">
      <div class="hero__content">
        <h1 class="hero__title" v-if="title">{{ title }}</h1>
        <p class="hero__subtitle" v-if="subtitle">{{ subtitle }}</p>
        <div class="hero__actions" v-if="ctaText">
          <a :href="ctaUrl" class="hero__cta btn btn--primary">{{ ctaText }}</a>
        </div>
      </div>
    </div>
  `,
  props: {
    title: { type: String, default: 'Welcome to Your Media Kit' },
    subtitle: { type: String, default: '' },
    ctaText: { type: String, default: '' },
    ctaUrl: { type: String, default: '#' },
    componentId: { type: String, required: true }
  }
};

export default {
  name: 'hero',
  
  /**
   * Render the Hero component using Vue
   * @param {Object} data - Component data
   * @param {HTMLElement} container - Container element
   * @returns {Object} Component instance
   */
  render(data = {}, container) {
    // Ensure container exists
    if (!container) {
      console.error('Hero Vue renderer: No container provided');
      return null;
    }
    
    // Prepare props from data
    const props = {
      title: data.title || data.heading || 'Welcome',
      subtitle: data.subtitle || data.subheading || '',
      backgroundImage: data.backgroundImage || data.background_image || '',
      ctaText: data.ctaText || data.cta_text || 'Get Started',
      ctaUrl: data.ctaUrl || data.cta_url || '#',
      alignment: data.alignment || 'center',
      componentId: data.id || `hero_${Date.now()}`
    };
    
    // Mount the Vue component directly
    const app = createApp(HeroVue, props);
    const instance = app.mount(container);
    
    console.log('Hero Vue component mounted with props:', props);
    
    return instance;
  },
  
  /**
   * Update the component with new data
   * @param {Object} data - New component data
   * @param {HTMLElement} container - Container element
   */
  update(data, container) {
    // Re-render the component with new data
    this.render(data, container);
  },
  
  /**
   * Unmount the component
   * @param {HTMLElement} container - Container element
   */
  destroy(container) {
    // Component cleanup handled by Vue
  },
  
  /**
   * Check if this is a Vue renderer
   */
  isVueRenderer: true
};
