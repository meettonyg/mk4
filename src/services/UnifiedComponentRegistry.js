/**
 * Unified Component Registry
 * Single source of truth for all components with ONE consistent API
 * 
 * ROOT FIX: Uses import.meta.glob for proper dynamic component loading
 */

import { defineAsyncComponent, markRaw } from 'vue';
import FallbackRenderer from '../vue/components/FallbackRenderer.vue';

// ROOT FIX: Use import.meta.glob to get all component renderers at build time
// This allows Vite to properly resolve and bundle all components
const componentModules = import.meta.glob('/components/*/*Renderer.vue');

class UnifiedComponentRegistry {
  constructor() {
    // Component definitions from WordPress
    this.definitions = {};
    
    // Vue component implementations
    this.vueComponents = {};
    
    // Component categories
    this.categories = [];
    
    // Initialization flag
    this.initialized = false;
    
    // Initialize immediately
    this.initialize();
  }
  
  /**
   * Initialize the registry with data from WordPress and Vue components
   */
  initialize() {
    if (this.initialized) return;
    
    // Step 1: Load definitions from WordPress data
    this.loadWordPressDefinitions();
    
    // Step 2: Register Vue components
    this.registerVueComponents();
    
    this.initialized = true;
    console.log('✅ UnifiedComponentRegistry: Initialized with', Object.keys(this.definitions).length, 'components');
  }
  
  /**
   * Load component definitions from WordPress
   */
  loadWordPressDefinitions() {
    const wpData = window.gmkbData || window.guestifyData || {};
    
    if (wpData.componentRegistry) {
      this.definitions = wpData.componentRegistry;
      this.categories = wpData.categories || [];
      console.log('✅ Loaded', Object.keys(this.definitions).length, 'component definitions from WordPress');
    } else {
      // Create fallback definitions for all known component types
      this.createFallbackDefinitions();
    }
  }
  
  /**
   * Register all Vue component implementations
   */
  registerVueComponents() {
    // ROOT FIX: Include topics-questions component
    const componentTypes = [
      'hero', 'biography', 'topics', 'topics-questions', 'questions', 'guest-intro',
      'contact', 'social', 'testimonials', 'stats', 'authority-hook',
      'logo-grid', 'call-to-action', 'booking-calendar', 'video-intro',
      'photo-gallery', 'podcast-player'
    ];
    
    componentTypes.forEach(type => {
      // Construct the path that matches the glob pattern
      const componentName = this.pascalCase(type);
      const path = `/components/${type}/${componentName}Renderer.vue`;
      
      if (componentModules[path]) {
        // Create async component that loads from the glob modules
        this.vueComponents[type] = defineAsyncComponent({
          loader: () => componentModules[path]().then(module => module.default || module),
          errorComponent: markRaw(FallbackRenderer),
          delay: 0,
          timeout: 30000,
          onError: (error) => {
            console.error(`Failed to load Vue component ${type}:`, error);
          }
        });
      } else {
        console.warn(`Component module not found for ${type} at ${path}`);
        this.vueComponents[type] = markRaw(FallbackRenderer);
      }
      
      // Ensure we have a definition for this component
      if (!this.definitions[type]) {
        this.definitions[type] = this.createComponentDefinition(type);
      }
    });
    
    console.log('✅ Registered', Object.keys(this.vueComponents).length, 'Vue components');
    console.log('Available component paths:', Object.keys(componentModules));
    
    // ROOT FIX: Recompute hasVueRenderer after Vue components are registered
    Object.keys(this.vueComponents).forEach(type => {
      if (this.definitions[type]) {
        this.definitions[type].hasVueRenderer = true;
      }
    });
    console.log('✅ Updated hasVueRenderer flags after registration');
  }
  
  /**
   * Convert kebab-case to PascalCase
   */
  pascalCase(str) {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
  
  /**
   * Create fallback definitions for all known components
   */
  createFallbackDefinitions() {
    const componentTypes = [
      // Essential
      { type: 'hero', name: 'Hero Section', category: 'essential', icon: 'fa-solid fa-user' },
      { type: 'biography', name: 'Biography', category: 'essential', icon: 'fa-solid fa-file-lines' },
      { type: 'contact', name: 'Contact', category: 'essential', icon: 'fa-solid fa-phone' },
      
      // Content
      { type: 'topics', name: 'Topics', category: 'content', icon: 'fa-solid fa-message' },
      { type: 'questions', name: 'Questions', category: 'content', icon: 'fa-solid fa-circle-question' },
      { type: 'guest-intro', name: 'Guest Introduction', category: 'content', icon: 'fa-solid fa-hand-wave' },
      
      // Social
      { type: 'social', name: 'Social Links', category: 'social', icon: 'fa-solid fa-share-nodes' },
      { type: 'testimonials', name: 'Testimonials', category: 'social', icon: 'fa-solid fa-message' },
      { type: 'stats', name: 'Statistics', category: 'social', icon: 'fa-solid fa-chart-simple' },
      { type: 'authority-hook', name: 'Authority Hook', category: 'social', icon: 'fa-solid fa-certificate' },
      { type: 'logo-grid', name: 'Logo Grid', category: 'social', icon: 'fa-solid fa-grid-2' },
      
      // Conversion
      { type: 'call-to-action', name: 'Call to Action', category: 'conversion', icon: 'fa-solid fa-bolt' },
      { type: 'booking-calendar', name: 'Booking Calendar', category: 'conversion', icon: 'fa-solid fa-calendar-days' },
      
      // Media
      { type: 'video-intro', name: 'Video Introduction', category: 'media', icon: 'fa-solid fa-video' },
      { type: 'photo-gallery', name: 'Photo Gallery', category: 'media', icon: 'fa-solid fa-images' },
      { type: 'podcast-player', name: 'Podcast Player', category: 'media', icon: 'fa-solid fa-podcast' }
    ];
    
    componentTypes.forEach(({ type, name, category, icon }) => {
      this.definitions[type] = this.createComponentDefinition(type, name, category, icon);
    });
    
    // Create categories
    const categoryMap = {};
    componentTypes.forEach(({ category }) => {
      if (!categoryMap[category]) {
        categoryMap[category] = { slug: category, name: this.formatCategoryName(category), count: 0 };
      }
      categoryMap[category].count++;
    });
    
    this.categories = Object.values(categoryMap);
  }
  
  /**
   * Create a component definition
   */
  createComponentDefinition(type, name = null, category = 'general', icon = null) {
    return {
      type: type,
      name: name || this.formatComponentName(type),
      description: `${name || this.formatComponentName(type)} component`,
      category: category,
      icon: icon || 'fa-solid fa-cube',
      hasVueRenderer: !!this.vueComponents[type],
      supports: {
        vueRender: true,
        designPanel: true
      },
      defaultProps: this.getDefaultPropsForType(type)
    };
  }
  
  /**
   * Format component type to display name
   */
  formatComponentName(type) {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  /**
   * Format category slug to display name
   */
  formatCategoryName(slug) {
    return slug.charAt(0).toUpperCase() + slug.slice(1);
  }
  
  /**
   * Get default props for a component type
   */
  getDefaultPropsForType(type) {
    const defaults = {
      hero: { title: 'Your Name', subtitle: 'Professional Title' },
      biography: { biography: 'Your professional biography...' },
      topics: { topics: [] },
      contact: { email: '', phone: '', website: '' },
      social: { links: [] },
      testimonials: { testimonials: [] },
      stats: { stats: [] },
      questions: { questions: [] },
      'call-to-action': { title: 'Get Started', buttonText: 'Contact Me' },
      'photo-gallery': { images: [] },
      'video-intro': { videoUrl: '' },
      'podcast-player': { episodes: [] },
      'booking-calendar': { availability: {} },
      'authority-hook': { credentials: [] },
      'logo-grid': { logos: [] },
      'guest-intro': { name: '', title: '', company: '' }
    };
    
    return defaults[type] || {};
  }
  
  // ========================================
  // PUBLIC API - SINGLE, CONSISTENT INTERFACE
  // ========================================
  
  /**
   * Get a component definition by type
   * @param {string} type Component type
   * @returns {Object} Component definition
   */
  get(type) {
    if (!this.initialized) this.initialize();
    
    const definition = this.definitions[type];
    if (!definition) {
      console.warn(`[UnifiedComponentRegistry] Component type '${type}' not found`);
      return this.createComponentDefinition(type);
    }
    
    return definition;
  }
  
  /**
   * Issue #14 FIX: Centralized validation and retrieval
   * Validates component type and returns definition in one call
   * Replaces scattered validation logic across the codebase
   * 
   * @param {string} type Component type to validate and retrieve
   * @returns {Object} Component definition
   * @throws {Error} If type is invalid or component doesn't exist
   */
  validateAndGet(type) {
    if (!this.initialized) this.initialize();
    
    // Validation 1: Check if type is provided
    if (!type) {
      throw new Error('Component type is required');
    }
    
    // Validation 2: Check if type is a string
    if (typeof type !== 'string') {
      throw new Error(`Component type must be a string, got ${typeof type}`);
    }
    
    // Validation 3: Check for known invalid types
    const invalidTypes = ['unknown_type', 'Unknown Component', ''];
    if (invalidTypes.includes(type)) {
      throw new Error(`Invalid component type: "${type}"`);
    }
    
    // Validation 4: Check if type is too long (likely contains content)
    if (type.length > 50) {
      throw new Error(`Component type is too long (${type.length} chars). Type should be short identifier, not content.`);
    }
    
    // Validation 5: Check if component exists in registry
    const definition = this.definitions[type];
    if (!definition) {
      const availableTypes = Object.keys(this.definitions).join(', ');
      throw new Error(`Unknown component type: "${type}". Available types: ${availableTypes}`);
    }
    
    // Validation 6: Warn if component has no schema (non-fatal)
    if (!definition.schema && !definition.defaultProps) {
      console.warn(`[UnifiedComponentRegistry] Component "${type}" has no schema or defaultProps defined`);
    }
    
    return definition;
  }
  
  /**
   * Get all component definitions
   * @returns {Array} All component definitions
   */
  getAll() {
    if (!this.initialized) this.initialize();
    return Object.values(this.definitions);
  }
  
  /**
   * Check if a component type exists
   * @param {string} type Component type
   * @returns {boolean} True if exists
   */
  has(type) {
    if (!this.initialized) this.initialize();
    return !!this.definitions[type];
  }
  
  /**
   * Get Vue component implementation
   * @param {string} type Component type
   * @returns {Object} Vue component
   */
  getVueComponent(type) {
    if (!this.initialized) this.initialize();
    
    // ROOT FIX: Add validation to prevent 'unknown_type' error
    if (!type || typeof type !== 'string' || type === 'unknown_type' || type === 'Unknown Component') {
      // Don't log warning for initialization placeholder types
      if (type !== 'unknown_type') {
        console.warn(`[UnifiedComponentRegistry] Invalid component type provided: ${type}. Using fallback.`);
      }
      return markRaw(FallbackRenderer);
    }
    
    const component = this.vueComponents[type];
    if (!component) {
      console.warn(`[UnifiedComponentRegistry] No Vue component for type '${type}', using fallback`);
      return markRaw(FallbackRenderer);
    }
    
    return component;
  }
  
  /**
   * Get components by category
   * @param {string} category Category slug
   * @returns {Array} Components in category
   */
  getByCategory(category) {
    if (!this.initialized) this.initialize();
    return this.getAll().filter(comp => comp.category === category);
  }
  
  /**
   * Get all categories
   * @returns {Array} Category list
   */
  getCategories() {
    if (!this.initialized) this.initialize();
    return this.categories;
  }
  
  /**
   * Get default props for a component type
   * @param {string} type Component type
   * @returns {Object} Default props
   */
  getDefaultProps(type) {
    const definition = this.get(type);
    return definition.defaultProps || this.getDefaultPropsForType(type);
  }
  
  /**
   * Debug the registry
   */
  debug() {
    console.group('[UnifiedComponentRegistry] Debug Info');
    console.log('Initialized:', this.initialized);
    console.log('Definitions:', Object.keys(this.definitions).length);
    console.log('Vue Components:', Object.keys(this.vueComponents).length);
    console.log('Categories:', this.categories.length);
    console.log('Component Types:', Object.keys(this.definitions));
    console.groupEnd();
  }
}

// Create and export singleton instance
const registry = new UnifiedComponentRegistry();

// Make it globally available with the EXACT API that everything expects
if (typeof window !== 'undefined') {
  // This is the ONE registry that everything will use
  window.gmkbComponentRegistry = registry;
  
  // Clean up old registries/adapters
  delete window.gmkbComponentRegistryAdapter;
  delete window.ComponentRegistryAdapter;
  delete window.GMKBComponentRegistry;
}

export default registry;
