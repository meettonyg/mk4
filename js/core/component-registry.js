/**
 * Component Registry Service
 * 
 * Client-side source of truth for component information
 * Reads component data passed from PHP via wp_localize_script
 * 
 * @package GMKB
 * @since 2.0.0
 */

(function() {
    'use strict';

    class ComponentRegistry {
        constructor() {
            this.components = new Map();
            this.categories = new Set();
            this.initialized = false;
            this.initializeRegistry();
        }

        /**
         * Initialize the registry with data from PHP
         */
        initializeRegistry() {
            // Check if gmkbData exists
            if (typeof window.gmkbData === 'undefined') {
                console.error('[ComponentRegistry] gmkbData not found. Component registry cannot initialize.');
                return;
            }

            // Load components from gmkbData
            if (window.gmkbData.components && Array.isArray(window.gmkbData.components)) {
                window.gmkbData.components.forEach(component => {
                    this.registerComponent(component);
                });
                
                console.log(`[ComponentRegistry] Initialized with ${this.components.size} components`);
            } else {
                console.warn('[ComponentRegistry] No components found in gmkbData');
            }

            // Load categories
            if (window.gmkbData.categories) {
                if (Array.isArray(window.gmkbData.categories)) {
                    window.gmkbData.categories.forEach(category => {
                        if (typeof category === 'string') {
                            this.categories.add(category);
                        } else if (category.slug) {
                            this.categories.add(category.slug);
                        }
                    });
                }
            }

            this.initialized = true;
            
            // Dispatch registry ready event
            window.dispatchEvent(new CustomEvent('gmkb:component-registry-ready', {
                detail: {
                    componentCount: this.components.size,
                    categories: Array.from(this.categories)
                }
            }));
        }

        /**
         * Register a component in the registry
         * 
         * @param {Object} component Component data
         */
        registerComponent(component) {
            if (!component.type) {
                console.error('[ComponentRegistry] Cannot register component without type', component);
                return;
            }

            // Store component by type
            this.components.set(component.type, {
                type: component.type,
                id: component.id || component.type,
                name: component.name || component.type,
                title: component.title || component.name || component.type,
                description: component.description || '',
                category: component.category || 'general',
                version: component.version || '1.0.0',
                icon: component.icon || null,
                directory: component.directory || component.type,
                hasVueRenderer: component.hasVueRenderer || false,
                vueRendererPath: component.vueRendererPath || null,
                hasSchema: component.hasSchema || false,
                schema: component.schema || null,
                supports: component.supports || {},
                config: component.config || {},
                order: component.order || 999
            });

            // Track category
            if (component.category) {
                this.categories.add(component.category);
            }
        }

        /**
         * Get a component by type
         * 
         * @param {string} type Component type
         * @return {Object|null} Component data or null if not found
         */
        getComponent(type) {
            if (!type) {
                console.error('[ComponentRegistry] getComponent called without type');
                return null;
            }

            const component = this.components.get(type);
            
            if (!component) {
                console.warn(`[ComponentRegistry] Component type '${type}' not found in registry`);
                // List available components for debugging
                if (this.components.size > 0) {
                    console.log('[ComponentRegistry] Available components:', Array.from(this.components.keys()));
                }
                return null;
            }

            return { ...component }; // Return a copy to prevent external mutation
        }

        /**
         * Get all components
         * 
         * @return {Array} Array of all components
         */
        getAllComponents() {
            return Array.from(this.components.values()).map(comp => ({ ...comp }));
        }

        /**
         * Get components by category
         * 
         * @param {string} category Category slug
         * @return {Array} Components in the category
         */
        getComponentsByCategory(category) {
            return this.getAllComponents().filter(comp => comp.category === category);
        }

        /**
         * Get all categories
         * 
         * @return {Array} Array of category slugs
         */
        getCategories() {
            return Array.from(this.categories);
        }

        /**
         * Get default schema for a component type
         * 
         * @param {string} type Component type
         * @return {Object|null} Component schema or null
         */
        getComponentSchema(type) {
            const component = this.getComponent(type);
            return component ? (component.schema || null) : null;
        }

        /**
         * Get default props for a component
         * 
         * @param {string} type Component type
         * @return {Object} Default props based on schema
         */
        getDefaultProps(type) {
            const schema = this.getComponentSchema(type);
            
            if (!schema) {
                console.warn(`[ComponentRegistry] No schema found for component type '${type}'`);
                return {};
            }

            // Extract default values from schema
            const defaults = {};
            
            if (schema.properties) {
                Object.keys(schema.properties).forEach(key => {
                    const prop = schema.properties[key];
                    if (prop.hasOwnProperty('default')) {
                        defaults[key] = prop.default;
                    } else if (prop.type === 'string') {
                        defaults[key] = '';
                    } else if (prop.type === 'number') {
                        defaults[key] = 0;
                    } else if (prop.type === 'boolean') {
                        defaults[key] = false;
                    } else if (prop.type === 'array') {
                        defaults[key] = [];
                    } else if (prop.type === 'object') {
                        defaults[key] = {};
                    }
                });
            }

            // Add default values from schema root
            if (schema.defaults) {
                Object.assign(defaults, schema.defaults);
            }

            return defaults;
        }

        /**
         * Check if a component type exists
         * 
         * @param {string} type Component type
         * @return {boolean} True if component exists
         */
        hasComponent(type) {
            return this.components.has(type);
        }

        /**
         * Check if registry is initialized
         * 
         * @return {boolean} True if initialized
         */
        isInitialized() {
            return this.initialized;
        }

        /**
         * Get component icon URL
         * 
         * @param {string} type Component type
         * @return {string|null} Icon URL or null
         */
        getComponentIcon(type) {
            const component = this.getComponent(type);
            
            if (!component || !component.icon) {
                return null;
            }

            // If icon is a full path, return it
            if (component.icon.startsWith('http') || component.icon.startsWith('/')) {
                return component.icon;
            }

            // Build path to icon in component directory
            const pluginUrl = window.gmkbData?.pluginUrl || '';
            return `${pluginUrl}components/${component.directory}/${component.icon}`;
        }

        /**
         * Get Vue component path
         * 
         * @param {string} type Component type
         * @return {string|null} Path to Vue component or null
         */
        getVueComponentPath(type) {
            const component = this.getComponent(type);
            
            if (!component || !component.hasVueRenderer || !component.vueRendererPath) {
                return null;
            }

            const pluginUrl = window.gmkbData?.pluginUrl || '';
            return `${pluginUrl}components/${component.directory}/${component.vueRendererPath}`;
        }

        /**
         * Debug method to log registry state
         */
        debug() {
            console.group('[ComponentRegistry] Debug Info');
            console.log('Initialized:', this.initialized);
            console.log('Components:', this.components.size);
            console.log('Categories:', Array.from(this.categories));
            console.log('Component Map:', Object.fromEntries(this.components));
            console.groupEnd();
        }
    }

    // Create global instance
    window.ComponentRegistry = ComponentRegistry;
    window.gmkbComponentRegistry = new ComponentRegistry();

    // Make available via GMKB namespace when it's ready
    if (window.GMKB) {
        window.GMKB.componentRegistry = window.gmkbComponentRegistry;
    } else {
        // Wait for GMKB to be available
        window.addEventListener('gmkb:ready', () => {
            if (window.GMKB) {
                window.GMKB.componentRegistry = window.gmkbComponentRegistry;
            }
        });
    }

})();
