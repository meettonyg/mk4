/**
 * Vue Renderer Bridge for Hero Component
 * This bridges the existing system with the new Vue component
 */

import { createApp } from 'vue';
import HeroComponent from './Hero.vue';

export function render(container, data = {}) {
  // Clear the container
  container.innerHTML = '';
  
  // Create a mount point for Vue
  const mountPoint = document.createElement('div');
  container.appendChild(mountPoint);
  
  // Create Vue app instance for this component
  const app = createApp(HeroComponent, {
    // Map data to props
    title: data.title || data.heading || 'Welcome',
    subtitle: data.subtitle || data.subheading || '',
    description: data.description || data.content || '',
    imageUrl: data.imageUrl || data.image_url || data.image || '',
    imageAlt: data.imageAlt || data.image_alt || '',
    primaryButton: data.primaryButton || data.primary_button || data.cta_primary || '',
    secondaryButton: data.secondaryButton || data.secondary_button || data.cta_secondary || '',
    theme: data.theme || 'default',
    
    // Event handlers
    onButtonClick: (event) => {
      console.log('Hero button clicked:', event);
      // Dispatch custom event for the main system to handle
      document.dispatchEvent(new CustomEvent('gmkb:component-action', {
        detail: {
          action: 'button-click',
          componentId: data.id,
          buttonType: event.type
        }
      }));
    }
  });
  
  // Mount the Vue component
  const instance = app.mount(mountPoint);
  
  // Return Vue app instance for cleanup if needed
  return {
    app,
    instance,
    update: (newData) => {
      // Update props reactively
      Object.keys(newData).forEach(key => {
        if (key in instance.$props) {
          instance[key] = newData[key];
        }
      });
    },
    destroy: () => {
      app.unmount();
      container.innerHTML = '';
    }
  };
}

// Export component metadata for discovery
export const metadata = {
  type: 'hero',
  name: 'Hero Section',
  description: 'Hero section with title, description, image, and CTAs',
  framework: 'vue',
  version: '2.0.0'
};
