/**
 * Component Registry
 * Provides a global registry for components to self-register
 * Required by both lean bundle and standard architecture
 */

(function() {
    'use strict';
    
    // Create namespace if it doesn't exist
    window.GMKB = window.GMKB || {};
    
    /**
     * GMKBComponentRegistry - Global component registration system
     */
    class GMKBComponentRegistry {
        constructor() {
            this.components = new Map();
            this.renderers = new Map();
            this.editors = new Map();
            this.initialized = false;
            
            if (window.GMKB_DEBUG) {
                console.log('🔧 Component Registry: Initializing');
            }
        }
        
        /**
         * Register a component with the registry
         */
        register(type, component) {
            if (!type) {
                console.error('Component Registry: Cannot register component without type');
                return false;
            }
            
            // Store component data
            this.components.set(type, component);
            
            // Extract and store renderer if provided
            if (component.renderer) {
                this.renderers.set(type, component.renderer);
            }
            
            // Extract and store editor if provided  
            if (component.editor) {
                this.editors.set(type, component.editor);
            }
            
            if (window.GMKB_DEBUG) {
                console.log(`✅ Component Registry: Registered component '${type}'`);
            }
            
            // Dispatch event for other systems
            const event = new CustomEvent('gmkb:component-registered', {
                detail: { type, component }
            });
            document.dispatchEvent(event);
            
            return true;
        }
        
        /**
         * Get a registered component
         */
        get(type) {
            return this.components.get(type);
        }
        
        /**
         * Get a component renderer
         */
        getRenderer(type) {
            return this.renderers.get(type);
        }
        
        /**
         * Get a component editor
         */
        getEditor(type) {
            return this.editors.get(type);
        }
        
        /**
         * Check if a component is registered
         */
        has(type) {
            return this.components.has(type);
        }
        
        /**
         * Get all registered component types
         */
        getTypes() {
            return Array.from(this.components.keys());
        }
        
        /**
         * Get all registered components
         */
        getAll() {
            const result = {};
            this.components.forEach((component, type) => {
                result[type] = component;
            });
            return result;
        }
        
        /**
         * Clear all registrations
         */
        clear() {
            this.components.clear();
            this.renderers.clear();
            this.editors.clear();
        }
        
        /**
         * Initialize the registry
         */
        init() {
            if (this.initialized) {
                return;
            }
            
            this.initialized = true;
            
            // Dispatch ready event
            const event = new CustomEvent('gmkb:component-registry-ready');
            document.dispatchEvent(event);
            
            if (window.GMKB_DEBUG) {
                console.log('✅ Component Registry: Ready');
            }
        }
    }
    
    // Create and expose global instance
    const registryInstance = new GMKBComponentRegistry();
    
    // ROOT FIX: Check if a registry already exists from the bundle
    if (window.GMKBComponentRegistry && window.GMKBComponentRegistry.discover) {
        // Bundle's registry exists, create compatibility layer
        console.log('✅ Component Registry: Bundle registry detected, creating compatibility layer');
        
        // Add register method to bundle's registry for backward compatibility
        if (!window.GMKBComponentRegistry.register) {
            window.GMKBComponentRegistry.register = function(type, component) {
                // Store in local registry
                registryInstance.register(type, component);
                // Also trigger discovery in new system if available
                if (window.GMKBComponentRegistry.discover) {
                    window.GMKBComponentRegistry.discover(type);
                }
                return true;
            };
        }
        
        // Add other missing methods
        window.GMKBComponentRegistry.getRenderer = window.GMKBComponentRegistry.getRenderer || function(type) {
            return registryInstance.getRenderer(type);
        };
        window.GMKBComponentRegistry.getEditor = window.GMKBComponentRegistry.getEditor || function(type) {
            return registryInstance.getEditor(type);
        };
        window.GMKBComponentRegistry.getTypes = window.GMKBComponentRegistry.getTypes || function() {
            return registryInstance.getTypes();
        };
    } else {
        // No bundle registry, use our instance
        window.GMKBComponentRegistry = registryInstance;
        
        // Also expose the class for compatibility
        window.GMKBComponentRegistryClass = GMKBComponentRegistry;
        
        // Ensure register method is available as a direct function for legacy code
        // But check first to avoid infinite recursion
        if (!window.GMKBComponentRegistry.register || window.GMKBComponentRegistry.register !== registryInstance.register) {
            window.GMKBComponentRegistry.register = function(type, component) {
                return registryInstance.register(type, component);
            };
        }
    }
    
    // Also attach to GMKB namespace
    window.GMKB.ComponentRegistry = registryInstance;
    
    // Add a fallback in case something tries to instantiate it
    window.GMKB.ComponentRegistryClass = GMKBComponentRegistry;
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            registryInstance.init();
        });
    } else {
        registryInstance.init();
    }
    
    // Log availability with verification
    if (window.gmkbData?.debugMode || window.GMKB_DEBUG) {
        console.log('✅ GMKBComponentRegistry instance created');
        console.log('   Methods available:', typeof registryInstance.register === 'function' ? '✓ register' : '✗ register');
        console.log('   Direct method:', typeof window.GMKBComponentRegistry.register === 'function' ? '✓ register' : '✗ register');
        console.log('   Instance check:', registryInstance instanceof GMKBComponentRegistry);
    }
    
})();