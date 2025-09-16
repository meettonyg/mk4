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
    
    // ROOT FIX: Fetch Pods data for hero content
    const podsData = window.gmkbData?.pods_data || {};
    
    // Build hero title from Pods data
    const fullName = podsData.first_name && podsData.last_name 
      ? `${podsData.first_name} ${podsData.last_name}` 
      : podsData.full_name || '';
    
    // Prepare props from Pods data first, component config second
    const props = {
      // Content from Pods data
      title: fullName || data.title || data.heading || 'Welcome',
      subtitle: podsData.guest_title || podsData.tagline || data.subtitle || data.subheading || '',
      backgroundImage: podsData.hero_image || podsData.guest_headshot || data.backgroundImage || data.background_image || '',
      ctaText: data.ctaText || data.cta_text || 'Get Started',
      ctaUrl: data.ctaUrl || data.cta_url || '#',
      alignment: data.alignment || 'center',
      componentId: data.id || `hero_${Date.now()}`
    };
    
    // Mount the Vue component directly
    const app = createApp(HeroVue, props);
    
    // ROOT FIX: Set up update handler for consistency
    app.config.globalProperties.$updateData = (newData) => {
      // Only save configuration, not Pods content
      const configOnly = {
        ctaText: newData.ctaText,
        ctaUrl: newData.ctaUrl,
        alignment: newData.alignment,
        // Don't save title/subtitle - those come from Pods
      };
      
      if (window.GMKB?.stateManager) {
        window.GMKB.stateManager.updateComponent(props.componentId, {
          config: configOnly,
          data: { dataSource: 'pods' },
          props: {}
        });
      }
      
      // Re-render with fresh data
      app.unmount();
      this.render({ ...data, ...configOnly }, container);
    };
    
    const instance = app.mount(container);
    
    console.log('🤸 Hero Vue component mounted with props:', props);
    console.log('🤸 Hero: Full name from Pods:', fullName);
    console.log('🤸 Hero: Title/subtitle from Pods:', podsData.guest_title || podsData.tagline || 'No subtitle');
    
    // Store app reference for cleanup
    container._vueApp = app;
    
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
    // ROOT FIX: Properly clean up Vue app
    if (container && container._vueApp) {
      container._vueApp.unmount();
      delete container._vueApp;
    }
  },
  
  /**
   * Check if this is a Vue renderer
   */
  isVueRenderer: true
};
