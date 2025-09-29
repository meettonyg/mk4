/**
 * Component Discovery Service
 * Automatically discovers and loads self-contained components
 * Implements scalable component architecture
 */

import { defineAsyncComponent, markRaw } from 'vue';

// ROOT FIX: Use import.meta.glob for proper module resolution
const componentModules = import.meta.glob('/components/*/*Renderer.vue');
const editorModules = import.meta.glob('/components/*/*Editor.vue');

class ComponentDiscoveryService {
  constructor() {
    this.componentCache = new Map();
    this.componentManifests = new Map();
    this.discoveredComponents = new Set();
    this.initializeKnownComponents();
  }

  /**
   * Initialize with known component types from UnifiedComponentRegistry
   * These serve as the baseline, but components can self-register too
   */
  initializeKnownComponents() {
    const knownTypes = [
      'hero', 'biography', 'topics', 'questions', 'contact',
      'social', 'testimonials', 'photo-gallery', 'logo-grid',
      'call-to-action', 'stats', 'video-intro', 'podcast-player',
      'booking-calendar', 'guest-intro', 'topics-questions',
      'authority-hook'
    ];
    
    knownTypes.forEach(type => this.discoveredComponents.add(type));
  }

  /**
   * Register a component manifest (from component.json)
   * This allows components to self-register when they're loaded
   */
  registerComponent(type, manifest) {
    this.componentManifests.set(type, manifest);
    this.discoveredComponents.add(type);
    
    console.log(`📦 Registered component: ${type}`, manifest);
    
    // Dispatch event for other systems
    document.dispatchEvent(new CustomEvent('gmkb:component-registered', {
      detail: { type, manifest }
    }));
  }

  /**
   * Get the Vue component for a given type
   * Tries multiple loading strategies in order of preference
   */
  async getComponent(type) {
    // Check cache first
    if (this.componentCache.has(type)) {
      return this.componentCache.get(type);
    }

    // Try loading strategies in order
    const loaders = [
      () => this.loadFromSelfContained(type),
      () => this.loadFromEditForms(type),
      () => this.loadFromVueComponents(type),
      () => this.loadFromLegacyLocation(type)
    ];

    for (const loader of loaders) {
      try {
        const component = await loader();
        if (component) {
          // Cache the loaded component
          this.componentCache.set(type, markRaw(component));
          return component;
        }
      } catch (error) {
        // Continue to next loader
        console.debug(`Loader failed for ${type}:`, error.message);
      }
    }

    console.warn(`⚠️ Component "${type}" not found in any location`);
    return null;
  }

  /**
   * Load from self-contained component structure
   * This is the preferred method for scalable components
   */
  async loadFromSelfContained(type) {
    // ROOT FIX: Use import.meta.glob for proper component loading
    const componentName = this.pascalCase(type);
    const path = `/components/${type}/${componentName}Renderer.vue`;
    
    if (componentModules[path]) {
      return defineAsyncComponent(() => 
        componentModules[path]().then(module => module.default || module)
      );
    }
    
    console.debug(`Component ${type} not found at ${path}`);
    return null;
  }

  /**
   * Load from edit forms directory
   * ROOT FIX: Return null instead of trying to import non-existent files
   */
  async loadFromEditForms(type) {
    // These edit forms don't exist yet, so return null
    // When they're created, this can be re-enabled
    return null;
  }

  /**
   * Load from vue/components directory
   * ROOT FIX: Return null instead of trying non-existent imports
   */
  async loadFromVueComponents(type) {
    // These components don't exist in this location
    return null;
  }

  /**
   * Load from legacy locations (backward compatibility)
   * ROOT FIX: Return null since we don't have legacy components
   */
  async loadFromLegacyLocation(type) {
    // No legacy components to load
    return null;
  }

  /**
   * Get the editor component for a type
   */
  async getEditor(type) {
    const manifest = this.componentManifests.get(type);
    const componentName = this.pascalCase(type);
    
    if (manifest?.renderers?.editor) {
      const editorPath = manifest.renderers.editor;
      
      try {
        return defineAsyncComponent(() => {
          // Ensure .vue extension is included
          if (editorPath.endsWith('.vue')) {
            return import(/* @vite-ignore */ `../../../components/${type}/${editorPath}`);
          } else {
            return import(/* @vite-ignore */ `../../../components/${type}/${editorPath}.vue`);
          }
        });
      } catch (e) {
        console.warn(`Failed to load editor for ${type}:`, e);
      }
    }

    // Try default editor locations with explicit .vue extension
    return defineAsyncComponent(() => 
      import(/* @vite-ignore */ `../../../components/${type}/${componentName}Editor.vue`)
        .catch(() => import(/* @vite-ignore */ `../edit-forms/${componentName}Editor.vue`))
        .catch(() => null)
    );
  }

  /**
   * Load component manifest from component.json
   */
  async loadManifest(type) {
    try {
      const response = await fetch(`/wp-content/plugins/guestify-media-kit-builder/components/${type}/component.json`);
      if (response.ok) {
        const manifest = await response.json();
        this.registerComponent(type, manifest);
        return manifest;
      }
    } catch (error) {
      console.debug(`No manifest found for ${type}`);
    }
    return null;
  }

  /**
   * Discover all available components
   * This can be called to dynamically find new components
   */
  async discoverComponents() {
    // Get list from backend if available
    try {
      const response = await fetch('/wp-json/gmkb/v1/components/discover');
      if (response.ok) {
        const components = await response.json();
        components.forEach(comp => {
          this.discoveredComponents.add(comp.type);
          if (comp.manifest) {
            this.componentManifests.set(comp.type, comp.manifest);
          }
        });
      }
    } catch (error) {
      console.debug('Component discovery API not available');
    }

    // Try loading manifests for all discovered components
    for (const type of this.discoveredComponents) {
      if (!this.componentManifests.has(type)) {
        await this.loadManifest(type);
      }
    }

    return Array.from(this.discoveredComponents);
  }

  /**
   * Check if a component type is available
   */
  hasComponent(type) {
    return this.discoveredComponents.has(type);
  }

  /**
   * Get all discovered component types
   */
  getAvailableTypes() {
    return Array.from(this.discoveredComponents);
  }

  /**
   * Helper to convert kebab-case to PascalCase
   */
  pascalCase(str) {
    return str.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  /**
   * Get expected component file name
   */
  getComponentFileName(type) {
    // Map of special cases
    const specialCases = {
      'call-to-action': 'CallToAction',
      'photo-gallery': 'PhotoGallery',
      'logo-grid': 'LogoGrid',
      'video-intro': 'VideoIntro',
      'podcast-player': 'PodcastPlayer',
      'booking-calendar': 'BookingCalendar',
      'guest-intro': 'GuestIntro',
      'topics-questions': 'TopicsQuestions',
      'authority-hook': 'AuthorityHook'
    };

    return specialCases[type] || this.pascalCase(type);
  }

  /**
   * Clear component cache (useful for development)
   */
  clearCache() {
    this.componentCache.clear();
    console.log('🗑️ Component cache cleared');
  }
}

// Export singleton instance
export default new ComponentDiscoveryService();
