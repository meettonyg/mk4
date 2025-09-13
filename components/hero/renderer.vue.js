/**
 * Hero Component Vue Renderer
 * Bridges the Hero Vue component with the existing component system
 * Follows self-contained component architecture
 */

import HeroVue from './Hero.vue';
import vueComponentBridge from '../../src/vue/VueComponentBridge.js';

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
    
    // Mount the Vue component
    const instance = vueComponentBridge.mountComponent(HeroVue, container, props);
    
    console.log('Hero Vue component mounted with props:', props);
    
    return instance;
  },
  
  /**
   * Update the component with new data
   * @param {Object} data - New component data
   * @param {HTMLElement} container - Container element
   */
  update(data, container) {
    if (!container) return;
    
    const props = {
      title: data.title || data.heading || 'Welcome',
      subtitle: data.subtitle || data.subheading || '',
      backgroundImage: data.backgroundImage || data.background_image || '',
      ctaText: data.ctaText || data.cta_text || 'Get Started',
      ctaUrl: data.ctaUrl || data.cta_url || '#',
      alignment: data.alignment || 'center',
      componentId: data.id
    };
    
    vueComponentBridge.updateProps(container, props);
  },
  
  /**
   * Unmount the component
   * @param {HTMLElement} container - Container element
   */
  destroy(container) {
    if (container) {
      vueComponentBridge.unmountComponent(container);
    }
  },
  
  /**
   * Check if this is a Vue renderer
   */
  isVueRenderer: true
};
