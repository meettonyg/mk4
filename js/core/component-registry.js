/**
 * @file component-registry.js
 * @description Global Component Registry for self-registration architecture
 * 
 * ✅ CHECKLIST COMPLIANT:
 * - Phase 1: Event-driven initialization, no polling
 * - Phase 2: Simplicity first, root cause fix
 * - Phase 3: Centralized registry for all components
 * - Phase 4: Comprehensive error handling
 * - Phase 5: WordPress integration ready
 * 
 * ARCHITECTURE: Components self-register, renderer is component-agnostic
 */

(function() {
    'use strict';
    
    /**
     * Global Component Registry
     * Components self-register their renderers and schemas
     */
    window.GMKBComponentRegistry = {
        renderers: {},
        schemas: {},
        errors: [],
        initialized: false,
        
        /**
         * Initialize the registry (called once)
         */
        init() {
            if (this.initialized) return;
            
            console.log('🎯 GMKBComponentRegistry: Initializing...');
            
            // Dispatch ready event
            document.dispatchEvent(new CustomEvent('gmkb:component-registry-ready', {
                detail: { 
                    registry: this,
                    timestamp: Date.now()
                }
            }));
            
            this.initialized = true;
            console.log('✅ GMKBComponentRegistry: Ready');
        },
        
        /**
         * Register a component renderer with optional schema
         * @param {string} type - Component type identifier
         * @param {function} renderer - Function that generates HTML for the component
         * @param {object} schema - Optional component schema with dataBindings, layouts, defaults
         * @returns {boolean} Registration success
         */
        register(type, renderer, schema) {
            try {
                // Validate inputs
                if (!type || typeof type !== 'string') {
                    throw new Error(`Invalid component type: ${type}`);
                }
                if (typeof renderer !== 'function') {
                    throw new Error(`Renderer for ${type} must be a function`);
                }
                
                // Validate schema if provided
                if (schema && !this.validateSchema(schema)) {
                    throw new Error(`Invalid schema for ${type}`);
                }
                
                // Check for duplicate registration
                if (this.renderers[type]) {
                    console.warn(`⚠️ Component ${type} already registered, overwriting`);
                }
                
                // Register component
                this.renderers[type] = renderer;
                if (schema) {
                    this.schemas[type] = schema;
                }
                
                // Dispatch success event
                document.dispatchEvent(new CustomEvent('gmkb:component-registered', {
                    detail: { 
                        type, 
                        hasSchema: !!schema,
                        timestamp: Date.now()
                    }
                }));
                
                console.log(`✅ Component registered: ${type}`);
                return true;
                
            } catch (error) {
                this.errors.push({ 
                    type, 
                    error: error.message,
                    timestamp: Date.now()
                });
                console.error(`❌ Failed to register ${type}:`, error);
                
                // Dispatch failure event
                document.dispatchEvent(new CustomEvent('gmkb:component-registration-failed', {
                    detail: { 
                        type, 
                        error: error.message 
                    }
                }));
                
                return false;
            }
        },
        
        /**
         * Validate component schema structure
         * @param {object} schema - Schema to validate
         * @returns {boolean} Validation result
         */
        validateSchema(schema) {
            // Required fields for a valid schema
            const requiredFields = ['dataBindings', 'layouts', 'defaults'];
            const hasRequiredFields = requiredFields.every(field => field in schema);
            
            if (!hasRequiredFields) {
                console.warn('Schema missing required fields:', requiredFields.filter(f => !(f in schema)));
                return false;
            }
            
            // Validate field types
            if (typeof schema.dataBindings !== 'object') {
                console.warn('Schema dataBindings must be an object');
                return false;
            }
            
            if (!Array.isArray(schema.layouts)) {
                console.warn('Schema layouts must be an array');
                return false;
            }
            
            if (typeof schema.defaults !== 'object') {
                console.warn('Schema defaults must be an object');
                return false;
            }
            
            return true;
        },
        
        /**
         * Get renderer for a component type
         * @param {string} type - Component type
         * @returns {function} Renderer function or generic fallback
         */
        getRenderer(type) {
            if (!this.renderers[type]) {
                console.warn(`No renderer for ${type}, using generic fallback`);
                return this.genericRenderer.bind(this);
            }
            return this.renderers[type];
        },
        
        /**
         * Get schema for a component type
         * @param {string} type - Component type
         * @returns {object|null} Component schema or null
         */
        getSchema(type) {
            return this.schemas[type] || null;
        },
        
        /**
         * Generic fallback renderer for unregistered components
         * @param {object} data - Component data
         * @param {object} options - Rendering options
         * @returns {string} Generic HTML
         */
        genericRenderer(data, options) {
            const type = options.type || 'Unknown';
            // Handle both hyphenated and non-hyphenated component names
            const displayName = type.split(/[-_]/).map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            
            return `<div class="gmkb-component gmkb-generic">
                <div class="gmkb-component__header">
                    <h3>${this.escapeHtml(displayName)} Component</h3>
                    <span class="gmkb-component__badge">Generic Renderer</span>
                </div>
                <div class="gmkb-component__content">
                    <p class="gmkb-component__notice">⚠️ No specific renderer registered for this component type.</p>
                    <details class="gmkb-component__debug">
                        <summary>Component Data</summary>
                        <pre>${this.escapeHtml(JSON.stringify(data, null, 2))}</pre>
                    </details>
                </div>
            </div>`;
        },
        
        /**
         * Check if a component type is registered
         * @param {string} type - Component type
         * @returns {boolean} Registration status
         */
        isRegistered(type) {
            return !!this.renderers[type];
        },
        
        /**
         * Get list of all registered component types
         * @returns {string[]} Array of component types
         */
        getRegisteredTypes() {
            return Object.keys(this.renderers);
        },
        
        /**
         * Get registration errors
         * @returns {array} Array of error objects
         */
        getRegistrationErrors() {
            return this.errors;
        },
        
        /**
         * Clear registration errors
         */
        clearErrors() {
            this.errors = [];
        },
        
        /**
         * Get registry statistics
         * @returns {object} Registry stats
         */
        getStats() {
            return {
                registeredComponents: Object.keys(this.renderers).length,
                componentsWithSchemas: Object.keys(this.schemas).length,
                registrationErrors: this.errors.length,
                types: this.getRegisteredTypes()
            };
        },
        
        /**
         * HTML escape utility
         * @param {string} text - Text to escape
         * @returns {string} Escaped HTML
         */
        escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = String(text);
            return div.innerHTML;
        }
    };
    
    // Initialize registry when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.GMKBComponentRegistry.init();
        });
    } else {
        // DOM already loaded
        window.GMKBComponentRegistry.init();
    }
    
    // Make registry available globally
    console.log('📦 GMKBComponentRegistry: Available globally');
    
})();