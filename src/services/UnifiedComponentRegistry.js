/**
 * Unified Component Registry
 * Single source of truth for all components with ONE consistent API
 * 
 * ROOT FIX: This replaces all the different registry implementations
 * with a single, clean system that works everywhere
 */

import { defineAsyncComponent, markRaw } from 'vue';
import FallbackRenderer from '../vue/components/FallbackRenderer.vue';

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
    const componentMap = {
      // Content components
      'hero': () => import('../../components/hero/HeroRenderer.vue'),
      'biography': () => import('../../components/biography/BiographyRenderer.vue'),
      'topics': () => import('../../components/topics/TopicsRenderer.vue'),
      'questions': () => import('../../components/questions/QuestionsRenderer.vue'),
      'guest-intro': () => import('../../components/guest-intro/GuestIntroRenderer.vue'),
      
      // Contact & Social
      'contact': () => import('../../components/contact/ContactRenderer.vue'),
      'social': () => import('../../components/social/SocialRenderer.vue'),
      
      // Social Proof
      'testimonials': () => import('../../components/testimonials/TestimonialsRenderer.vue'),
      'stats': () => import('../../components/stats/StatsRenderer.vue'),
      'authority-hook': () => import('../../components/authority-hook/AuthorityHookRenderer.vue'),
      'logo-grid': () => import('../../components/logo-grid/LogoGridRenderer.vue'),
      
      // Conversion
      'call-to-action': () => import('../../components/call-to-action/CallToActionRenderer.vue'),
      'booking-calendar': () => import('../../components/booking-calendar/BookingCalendarRenderer.vue'),
      
      // Media
      'video-intro': () => import('../../components/video-intro/VideoIntroRenderer.vue'),
      'photo-gallery': () => import('../../components/photo-gallery/PhotoGalleryRenderer.vue'),
      'podcast-player': () => import('../../components/podcast-player/PodcastPlayerRenderer.vue')
    };
    
    // Register each component as async
    Object.entries(componentMap).forEach(([type, loader]) => {
      this.vueComponents[type] = defineAsyncComponent({
        loader,
        errorComponent: markRaw(FallbackRenderer),
        delay: 0,
        timeout: 30000,
        onError: (error) => {
          console.error(`Failed to load Vue component ${type}:`, error);
        }
      });
      
      // Ensure we have a definition for this component
      if (!this.definitions[type]) {
        this.definitions[type] = this.createComponentDefinition(type);
      }
    });
    
    console.log('✅ Registered', Object.keys(this.vueComponents).length, 'Vue components');
  }
  
  /**
   * Create fallback definitions for all known components
   */
  createFallbackDefinitions() {
    const componentTypes = [
      // Essential
      { type: 'hero', name: 'Hero Section', category: 'essential' },
      { type: 'biography', name: 'Biography', category: 'essential' },
      { type: 'contact', name: 'Contact', category: 'essential' },
      
      // Content
      { type: 'topics', name: 'Topics', category: 'content' },
      { type: 'questions', name: 'Questions', category: 'content' },
      { type: 'guest-intro', name: 'Guest Introduction', category: 'content' },
      
      // Social
      { type: 'social', name: 'Social Links', category: 'social' },
      { type: 'testimonials', name: 'Testimonials', category: 'social' },
      { type: 'stats', name: 'Statistics', category: 'social' },
      { type: 'authority-hook', name: 'Authority Hook', category: 'social' },
      { type: 'logo-grid', name: 'Logo Grid', category: 'social' },
      
      // Conversion
      { type: 'call-to-action', name: 'Call to Action', category: 'conversion' },
      { type: 'booking-calendar', name: 'Booking Calendar', category: 'conversion' },
      
      // Media
      { type: 'video-intro', name: 'Video Introduction', category: 'media' },
      { type: 'photo-gallery', name: 'Photo Gallery', category: 'media' },
      { type: 'podcast-player', name: 'Podcast Player', category: 'media' }
    ];
    
    componentTypes.forEach(({ type, name, category }) => {
      this.definitions[type] = this.createComponentDefinition(type, name, category);
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
  createComponentDefinition(type, name = null, category = 'general') {
    return {
      type: type,
      name: name || this.formatComponentName(type),
      description: `${name || this.formatComponentName(type)} component`,
      category: category,
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
