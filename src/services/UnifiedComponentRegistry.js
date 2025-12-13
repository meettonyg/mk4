/**
 * Unified Component Registry
 * Single source of truth for all components with ONE consistent API
 *
 * PHASE 2 ARCHITECTURE:
 * - WordPress/PHP ComponentDiscovery = Source of truth for METADATA (list of components)
 * - Vite import.meta.glob = Source for IMPLEMENTATION (Vue file mapping)
 *
 * The glob does NOT drive discovery - it only provides the Vue implementations
 * for component types that are already defined by WordPress.
 */

import { defineAsyncComponent, markRaw } from 'vue';
import FallbackRenderer from '../vue/components/FallbackRenderer.vue';

// Vite glob for Vue component IMPLEMENTATIONS only
// This is used to MAP component types to their Vue files, NOT to discover components
const componentModules = import.meta.glob('../../components/**/*Renderer.vue');

// Component.json files for fallback metadata (when WordPress data unavailable)
const componentMetaModules = import.meta.glob('../../components/*/component.json', { eager: true });

// DEBUG: Log what the glob pattern found at build time
if (typeof window !== 'undefined' && window.gmkbData?.debugMode) {
  console.log('🔍 DEBUG: componentModules keys at runtime:', Object.keys(componentModules));
  console.log('🔍 DEBUG: Total component modules found:', Object.keys(componentModules).length);
}

class UnifiedComponentRegistry {
  constructor() {
    // Component definitions - PRIMARY source is WordPress data
    this.definitions = {};

    // Vue component implementations - mapped from glob
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

    // Step 1: Load definitions from WordPress (SOURCE OF TRUTH)
    this.loadWordPressDefinitions();

    // Step 2: Map Vue implementations to defined component types
    this.mapVueImplementations();

    this.initialized = true;
    console.log('✅ UnifiedComponentRegistry: Initialized with', Object.keys(this.definitions).length, 'components');
    console.log('✅ UnifiedComponentRegistry:', Object.keys(this.vueComponents).length, 'have Vue renderers');
  }

  /**
   * Load component definitions from WordPress
   * This is the SINGLE SOURCE OF TRUTH for what components exist
   */
  loadWordPressDefinitions() {
    const wpData = window.gmkbData || window.guestifyData || {};

    if (wpData.componentRegistry && Object.keys(wpData.componentRegistry).length > 0) {
      // WordPress data is available - use it as source of truth
      this.definitions = { ...wpData.componentRegistry };
      this.categories = wpData.categories || [];
      console.log('✅ Loaded', Object.keys(this.definitions).length, 'component definitions from WordPress');
    } else {
      // Fallback: No WordPress data, use component.json files from glob
      console.warn('⚠️ No WordPress component data available, falling back to component.json discovery');
      this.createFallbackDefinitions();
    }
  }

  /**
   * Map Vue implementations to component types
   * This does NOT create new definitions - it only provides Vue components
   * for types that already exist in this.definitions
   */
  mapVueImplementations() {
    const availablePaths = Object.keys(componentModules);

    // For each component type in our definitions, try to find a Vue implementation
    Object.keys(this.definitions).forEach(type => {
      const vueComponent = this.findVueComponentForType(type, availablePaths);

      if (vueComponent) {
        this.vueComponents[type] = vueComponent;
        this.definitions[type].hasVueRenderer = true;
      } else {
        // No Vue implementation found - will use FallbackRenderer
        this.definitions[type].hasVueRenderer = false;
        if (window.gmkbData?.debugMode) {
          console.log(`ℹ️ No Vue renderer for "${type}" - will use server-side rendering`);
        }
      }
    });

    // Also check for any Vue components that exist but weren't in WordPress data
    // (This handles the case where a new component was added but WordPress cache is stale)
    this.discoverMissingComponents(availablePaths);

    console.log('✅ Mapped Vue implementations for', Object.keys(this.vueComponents).length, 'components');
  }

  /**
   * Find and create async Vue component for a given type
   */
  findVueComponentForType(type, availablePaths) {
    // Try multiple naming conventions
    const possiblePatterns = [
      `/${type}/${this.pascalCase(type)}Renderer.vue`,  // /offers/OffersRenderer.vue
      `/${type}/${type}Renderer.vue`,                    // /offers/offersRenderer.vue
      `/${type}/Renderer.vue`,                           // /offers/Renderer.vue
    ];

    for (const pattern of possiblePatterns) {
      const matchingPath = availablePaths.find(path => path.includes(pattern));
      if (matchingPath && componentModules[matchingPath]) {
        return defineAsyncComponent({
          loader: () => componentModules[matchingPath]().then(module => module.default || module),
          errorComponent: markRaw(FallbackRenderer),
          delay: 0,
          timeout: 30000,
          onError: (error) => {
            console.error(`Failed to load Vue component ${type}:`, error);
          }
        });
      }
    }

    // Fallback: Try to find any Renderer.vue in the component's directory
    const fallbackPath = availablePaths.find(path =>
      path.includes(`/${type}/`) && path.endsWith('Renderer.vue')
    );

    if (fallbackPath && componentModules[fallbackPath]) {
      return defineAsyncComponent({
        loader: () => componentModules[fallbackPath]().then(module => module.default || module),
        errorComponent: markRaw(FallbackRenderer),
        delay: 0,
        timeout: 30000
      });
    }

    return null;
  }

  /**
   * Discover components that have Vue files but weren't in WordPress data
   * This helps when WordPress cache is stale or a new component was just added
   */
  discoverMissingComponents(availablePaths) {
    availablePaths.forEach(path => {
      const match = path.match(/\/components\/([^/]+)\//);
      if (!match) return;

      const type = match[1];

      // If this type isn't in our definitions, add it from component.json
      if (!this.definitions[type]) {
        const meta = this.getComponentMeta(type);
        if (meta) {
          console.log(`🔍 Discovered new component "${type}" not in WordPress data - adding from component.json`);
          this.definitions[type] = this.createComponentDefinition(
            type,
            meta.name,
            meta.category,
            meta.icon,
            meta.accordionGroup
          );

          // Also create the Vue mapping
          const vueComponent = this.findVueComponentForType(type, availablePaths);
          if (vueComponent) {
            this.vueComponents[type] = vueComponent;
            this.definitions[type].hasVueRenderer = true;
          }
        }
      }
    });
  }

  /**
   * Get component metadata from component.json (via glob)
   */
  getComponentMeta(type) {
    const metaPath = Object.keys(componentMetaModules).find(p => p.includes(`/${type}/component.json`));
    if (metaPath) {
      const metaModule = componentMetaModules[metaPath];
      return metaModule?.default || metaModule;
    }
    return null;
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
   * Create fallback definitions from component.json files
   * Only used when WordPress data is unavailable
   */
  createFallbackDefinitions() {
    const metaPaths = Object.keys(componentMetaModules);

    metaPaths.forEach(path => {
      const match = path.match(/\/components\/([^/]+)\/component\.json/);
      if (!match) return;

      const type = match[1];
      const meta = componentMetaModules[path]?.default || componentMetaModules[path];

      if (meta) {
        this.definitions[type] = {
          ...this.createComponentDefinition(
            type,
            meta.name,
            meta.category,
            meta.icon,
            meta.accordionGroup
          ),
          description: meta.description || `${meta.name || this.formatComponentName(type)} component`
        };
      }
    });

    // Create categories based on discovered metadata
    const categoryMap = {};
    Object.values(this.definitions).forEach(def => {
      const category = def.category || 'general';
      if (!categoryMap[category]) {
        categoryMap[category] = { slug: category, name: this.formatCategoryName(category), count: 0 };
      }
      categoryMap[category].count++;
    });

    this.categories = Object.values(categoryMap);
    console.log('✅ Created fallback definitions for', Object.keys(this.definitions).length, 'components');
  }

  /**
   * Create a component definition
   */
  createComponentDefinition(type, name = null, category = 'general', icon = null, accordionGroup = 'basic') {
    return {
      type: type,
      name: name || this.formatComponentName(type),
      description: `${name || this.formatComponentName(type)} component`,
      category: category,
      icon: icon || 'fa-solid fa-cube',
      accordionGroup: accordionGroup || 'basic',
      hasVueRenderer: false,
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
    // First check if definition already has defaultProps
    if (this.definitions[type]?.defaultProps) {
      return this.definitions[type].defaultProps;
    }

    // Try to get from component.json metadata
    const meta = this.getComponentMeta(type);

    if (meta) {
      // Priority 1: Use defaultProps from component.json
      if (meta.defaultProps && typeof meta.defaultProps === 'object') {
        return meta.defaultProps;
      }

      // Priority 2: Use defaults from schema
      if (meta.schema?.defaults && typeof meta.schema.defaults === 'object') {
        return meta.schema.defaults;
      }

      // Priority 3: Extract from schema properties
      if (meta.schema?.properties && typeof meta.schema.properties === 'object') {
        const extracted = {};
        Object.entries(meta.schema.properties).forEach(([key, prop]) => {
          if (prop.default !== undefined) {
            extracted[key] = prop.default;
          }
        });
        if (Object.keys(extracted).length > 0) {
          return extracted;
        }
      }
    }

    return {};
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
   * Centralized validation and retrieval
   * @param {string} type Component type to validate and retrieve
   * @returns {Object} Component definition
   * @throws {Error} If type is invalid or component doesn't exist
   */
  validateAndGet(type) {
    if (!this.initialized) this.initialize();

    if (!type) {
      throw new Error('Component type is required');
    }

    if (typeof type !== 'string') {
      throw new Error(`Component type must be a string, got ${typeof type}`);
    }

    const invalidTypes = ['unknown_type', 'Unknown Component', ''];
    if (invalidTypes.includes(type)) {
      throw new Error(`Invalid component type: "${type}"`);
    }

    if (type.length > 50) {
      throw new Error(`Component type is too long (${type.length} chars). Type should be short identifier, not content.`);
    }

    const definition = this.definitions[type];
    if (!definition) {
      const availableTypes = Object.keys(this.definitions).join(', ');
      throw new Error(`Unknown component type: "${type}". Available types: ${availableTypes}`);
    }

    return definition;
  }

  /**
   * Get all component definitions
   * PHASE 2: Returns ALL components from WordPress data, not just those with Vue renderers
   * Components without Vue renderers will use FallbackRenderer
   * @returns {Array} All component definitions
   */
  getAll() {
    if (!this.initialized) this.initialize();
    return Object.values(this.definitions);
  }

  /**
   * Get all components that have Vue renderers available
   * @returns {Array} Components with Vue renderers
   */
  getAllWithVueRenderer() {
    if (!this.initialized) this.initialize();
    return Object.values(this.definitions).filter(def => this.vueComponents[def.type]);
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

    // Validate type
    if (!type || typeof type !== 'string' || type === 'unknown_type' || type === 'Unknown Component') {
      if (type !== 'unknown_type') {
        console.warn(`[UnifiedComponentRegistry] Invalid component type provided: ${type}. Using fallback.`);
      }
      return markRaw(FallbackRenderer);
    }

    // Return Vue component if available, otherwise FallbackRenderer
    const component = this.vueComponents[type];
    if (!component) {
      // Component exists in definitions but no Vue renderer - use fallback
      if (this.definitions[type]) {
        console.log(`[UnifiedComponentRegistry] Component "${type}" will use server-side rendering`);
      } else {
        console.warn(`[UnifiedComponentRegistry] Unknown component type: "${type}"`);
      }
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
   * Force refresh from WordPress data
   * Useful after WordPress cache is cleared
   */
  refresh() {
    this.initialized = false;
    this.definitions = {};
    this.vueComponents = {};
    this.categories = [];
    this.initialize();
    console.log('🔄 UnifiedComponentRegistry: Refreshed');
  }

  /**
   * Debug the registry
   */
  debug() {
    console.group('[UnifiedComponentRegistry] Debug Info');
    console.log('Initialized:', this.initialized);
    console.log('Definitions (total):', Object.keys(this.definitions).length);
    console.log('Vue Components (with renderers):', Object.keys(this.vueComponents).length);
    console.log('Categories:', this.categories.length);
    console.log('All component types:', Object.keys(this.definitions));
    console.log('Components with Vue:', Object.keys(this.vueComponents));
    console.log('Components without Vue:', Object.keys(this.definitions).filter(t => !this.vueComponents[t]));
    console.groupEnd();
  }
}

// Create and export singleton instance
const registry = new UnifiedComponentRegistry();

// Make it globally available
if (typeof window !== 'undefined') {
  window.gmkbComponentRegistry = registry;

  // Clean up old registries/adapters
  delete window.gmkbComponentRegistryAdapter;
  delete window.ComponentRegistryAdapter;
  delete window.GMKBComponentRegistry;
}

export default registry;
