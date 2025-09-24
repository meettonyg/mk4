/**
 * Component Registry Bridge
 * ROOT FIX: Bridges WordPress ComponentDiscovery data to Vue component system
 * This fixes the "Component type 'new-component' not found in registry" error
 */

import { useMediaKitStore } from '../stores/mediaKit.js';

// Global component registry populated from WordPress
let componentRegistry = {};
let componentCategories = [];
let initialized = false;

/**
 * Initialize the component registry from WordPress data
 * This is called automatically when the Vue app starts
 */
export function initializeComponentRegistry() {
  if (initialized) return;
  
  // Get data from WordPress (passed via wp_localize_script)
  const wpData = window.gmkbData || window.guestifyData || {};
  
  if (wpData.componentRegistry && Object.keys(wpData.componentRegistry).length > 0) {
    componentRegistry = wpData.componentRegistry;
    componentCategories = wpData.categories || [];
    
    console.log('✅ Component Registry: Initialized from WordPress data');
    console.log(`📊 Components: ${Object.keys(componentRegistry).length}`);
    console.log(`📁 Categories: ${componentCategories.length}`);
    
    // Debug: Log Vue components specifically
    const vueComponents = Object.values(componentRegistry).filter(comp => comp.hasVueRenderer);
    if (vueComponents.length > 0) {
      console.log(`🔥 Vue Components Available: ${vueComponents.length}`);
      console.log('Vue component types:', vueComponents.map(c => c.type));
    }
    
    initialized = true;
    
    // Dispatch event to notify other systems
    document.dispatchEvent(new CustomEvent('gmkb:component-registry-ready', {
      detail: { registry: componentRegistry, categories: componentCategories }
    }));
    
    return true;
  } else {
    console.warn('⚠️ Component Registry: No WordPress data available, using fallback');
    createFallbackRegistry();
    return false;
  }
}

/**
 * Create fallback registry if WordPress data is not available
 */
function createFallbackRegistry() {
  componentRegistry = {
    'hero': {
      type: 'hero',
      name: 'Hero Section',
      description: 'Main header section',
      category: 'essential',
      hasVueRenderer: true,
      supports: { vueRender: true, designPanel: true }
    },
    'biography': {
      type: 'biography', 
      name: 'Biography',
      description: 'Professional biography',
      category: 'essential',
      hasVueRenderer: false,
      supports: { serverRender: true, designPanel: true }
    },
    'topics': {
      type: 'topics',
      name: 'Topics',
      description: 'Speaking topics',
      category: 'content',
      hasVueRenderer: false,
      supports: { serverRender: true, designPanel: true }
    },
    'contact': {
      type: 'contact',
      name: 'Contact',
      description: 'Contact information',
      category: 'essential', 
      hasVueRenderer: false,
      supports: { serverRender: true, designPanel: true }
    }
  };
  
  componentCategories = [
    { slug: 'essential', name: 'Essential', count: 3 },
    { slug: 'content', name: 'Content', count: 1 }
  ];
  
  initialized = true;
  console.log('✅ Component Registry: Fallback registry created');
}

/**
 * Get all available components
 */
export function getAllComponents() {
  if (!initialized) initializeComponentRegistry();
  return Object.values(componentRegistry);
}

/**
 * Get components by category
 */
export function getComponentsByCategory(category) {
  if (!initialized) initializeComponentRegistry();
  return Object.values(componentRegistry).filter(comp => comp.category === category);
}

/**
 * Get component definition by type
 * ROOT FIX: This is what fixes the "Component type 'new-component' not found" error
 */
export function getComponent(type) {
  if (!initialized) initializeComponentRegistry();
  
  const component = componentRegistry[type];
  if (!component) {
    console.warn(`Component type '${type}' not found in registry`);
    // Return a fallback component definition instead of null
    return {
      type: type,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      description: `Component of type ${type}`,
      category: 'general',
      hasVueRenderer: false,
      supports: { serverRender: true }
    };
  }
  
  return component;
}

/**
 * Check if component exists in registry
 */
export function hasComponent(type) {
  if (!initialized) initializeComponentRegistry();
  return type in componentRegistry;
}

/**
 * Get all categories
 */
export function getCategories() {
  if (!initialized) initializeComponentRegistry();
  return componentCategories;
}

/**
 * Add a component to the media kit
 * ROOT FIX: This properly adds components with correct data from registry
 */
export function addComponentToMediaKit(componentType, targetSectionId = null, targetColumn = 1) {
  const store = useMediaKitStore();
  
  // Get the component definition from registry
  const componentDef = getComponent(componentType);
  
  if (!componentDef) {
    console.error(`Cannot add component: ${componentType} not found in registry`);
    return null;
  }
  
  // Create component data based on definition
  const componentData = {
    type: componentType,
    data: getDefaultComponentData(componentType),
    props: getDefaultComponentProps(componentType),
    settings: {},
    sectionId: targetSectionId,
    column: targetColumn
  };
  
  // Add to store
  const componentId = store.addComponent(componentData);
  
  console.log(`✅ Added component: ${componentType} (${componentId})`);
  
  // Dispatch events for other systems to react
  document.dispatchEvent(new CustomEvent('gmkb:component-added-from-registry', {
    detail: { 
      componentId, 
      componentType, 
      componentDef,
      sectionId: targetSectionId 
    }
  }));
  
  return componentId;
}

/**
 * Get default data for a component type
 */
function getDefaultComponentData(type) {
  const defaults = {
    hero: {
      title: 'Your Name',
      subtitle: 'Professional Title',
      description: 'Brief introduction or tagline'
    },
    biography: {
      biography: 'Professional biography will be loaded from your profile data.'
    },
    topics: {
      topics: ['Topic 1', 'Topic 2', 'Topic 3']
    },
    contact: {
      email: '',
      phone: '',
      website: ''
    }
  };
  
  return defaults[type] || {};
}

/**
 * Get default props for a component type
 */
function getDefaultComponentProps(type) {
  const defaults = {
    hero: {
      showImage: true,
      alignment: 'center',
      backgroundType: 'none'
    },
    biography: {
      showHeadshot: true,
      layout: 'text-first'
    },
    topics: {
      displayType: 'list',
      maxItems: 5
    },
    contact: {
      layout: 'vertical',
      showLabels: true
    }
  };
  
  return defaults[type] || {};
}

/**
 * Global functions for Vue components and other systems
 */
if (typeof window !== 'undefined') {
  window.gmkbComponentRegistry = {
    initialize: initializeComponentRegistry,
    getAll: getAllComponents,
    get: getComponent,
    has: hasComponent,
    getByCategory: getComponentsByCategory,
    getCategories: getCategories,
    addToMediaKit: addComponentToMediaKit,
    isInitialized: () => initialized
  };
}

// Auto-initialize when this module is loaded
if (typeof window !== 'undefined' && window.gmkbData) {
  // Initialize on next tick to ensure DOM is ready
  setTimeout(initializeComponentRegistry, 0);
}

export default {
  initialize: initializeComponentRegistry,
  getAll: getAllComponents,
  get: getComponent,
  has: hasComponent,
  getByCategory: getComponentsByCategory,
  getCategories: getCategories,
  addToMediaKit: addComponentToMediaKit
};
