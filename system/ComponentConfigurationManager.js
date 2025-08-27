/**
 * Component Configuration Manager
 * Phase 2: Component Layer Architecture
 * 
 * Manages component configuration schemas and data bindings
 * Creates a sophisticated component configuration system with data bindings
 * 
 * @version 2.0.0-phase2
 * @package GMKB/System
 */

class ComponentConfigurationManager {
    constructor() {
        this.schemas = {};
        this.configurations = new Map();
        this.logger = window.StructuredLogger || console;
        
        this.logger.info('📋 PHASE 2: ComponentConfigurationManager initializing');
        this.initializeSchemas();
    }
    
    /**
     * Check if the configuration manager is ready
     * @returns {boolean} True if manager is initialized and ready to use
     */
    isReady() {
        return this.schemas && Object.keys(this.schemas).length > 0;
    }
    
    /**
     * Initialize component schemas from WordPress data
     */
    initializeSchemas() {
        if (typeof gmkbComponentSchemas !== 'undefined' && gmkbComponentSchemas.schemas) {
            this.schemas = gmkbComponentSchemas.schemas;
            this.logger.info('✅ PHASE 2: Loaded schemas for components:', Object.keys(this.schemas));
        } else if (typeof gmkbData !== 'undefined' && gmkbData.componentSchemas) {
            this.schemas = gmkbData.componentSchemas;
            this.logger.info('✅ PHASE 2: Loaded schemas from gmkbData for components:', Object.keys(this.schemas));
        } else {
            this.logger.warn('⚠️ PHASE 2: No component schemas available - using defaults');
            this.loadDefaultSchemas();
        }
    }
    
    /**
     * Load default schemas if none provided
     */
    loadDefaultSchemas() {
        this.schemas = {
            hero: {
                name: 'Hero Section',
                dataBindings: {
                    title: 'full_name',
                    subtitle: 'guest_title',
                    description: 'biography_short',
                    image: 'guest_headshot'
                },
                componentOptions: {
                    layout: {
                        type: 'select',
                        default: 'left_aligned',
                        options: {
                            left_aligned: 'Left Aligned',
                            center_aligned: 'Center Aligned',
                            right_aligned: 'Right Aligned'
                        }
                    },
                    showSocialLinks: {
                        type: 'boolean',
                        default: true
                    }
                }
            },
            topics: {
                name: 'Speaking Topics',
                dataBindings: {
                    topics: 'speaking_topics'
                },
                componentOptions: {
                    layout: {
                        type: 'select',
                        default: 'grid',
                        options: {
                            list: 'Vertical List',
                            grid: 'Grid Layout',
                            tags: 'Tag Cloud'
                        }
                    },
                    maxTopics: {
                        type: 'number',
                        default: 6,
                        min: 1,
                        max: 20
                    }
                }
            }
        };
        
        this.logger.info('📋 PHASE 2: Default schemas loaded');
    }
    
    /**
     * Register a component configuration
     * (Also aliased as registerConfiguration for backward compatibility)
     */
    registerComponentConfiguration(componentId, componentType, configuration = {}) {
        const schema = this.getSchema(componentType);
        if (!schema) {
            this.logger.warn(`⚠️ PHASE 2: No schema found for component type: ${componentType}`);
            return null;
        }
        
        // Create default configuration from schema
        const defaultConfig = this.getDefaultConfiguration(componentType);
        
        // Merge with provided configuration
        const finalConfig = {
            component_id: componentId,
            component_type: componentType,
            ...defaultConfig,
            ...configuration
        };
        
        this.configurations.set(componentId, finalConfig);
        
        this.logger.info(`✅ PHASE 2: Registered configuration for ${componentType} (${componentId})`);
        return finalConfig;
    }
    
    /**
     * Alias for registerComponentConfiguration (backward compatibility)
     * This is the method called by enhanced-component-manager.js
     */
    registerConfiguration(componentId, componentType, configuration = {}) {
        return this.registerComponentConfiguration(componentId, componentType, configuration);
    }
    
    /**
     * Remove component configuration (for cleanup)
     */
    removeConfiguration(componentId) {
        if (this.configurations.has(componentId)) {
            this.configurations.delete(componentId);
            this.logger.info(`🗑️ PHASE 2: Removed configuration for ${componentId}`);
            return true;
        }
        return false;
    }
    
    /**
     * Get schema for component type
     */
    getSchema(componentType) {
        return this.schemas[componentType] || null;
    }
    
    /**
     * Get default configuration for component type
     */
    getDefaultConfiguration(componentType) {
        const schema = this.getSchema(componentType);
        if (!schema) return {};
        
        const config = {
            dataBindings: schema.dataBindings || {},
            componentOptions: {},
            responsiveBehavior: schema.responsiveBehavior || {}
        };
        
        // Extract default values from schema
        if (schema.componentOptions) {
            Object.entries(schema.componentOptions).forEach(([key, option]) => {
                if (option.default !== undefined) {
                    config.componentOptions[key] = option.default;
                }
            });
        }
        
        return config;
    }
    
    /**
     * Get component configuration
     */
    getComponentConfiguration(componentId) {
        return this.configurations.get(componentId) || null;
    }
    
    /**
     * Update component configuration
     */
    updateComponentConfiguration(componentId, updates) {
        const existingConfig = this.configurations.get(componentId);
        if (!existingConfig) {
            this.logger.warn(`⚠️ PHASE 2: Cannot update - no configuration found for ${componentId}`);
            return null;
        }
        
        const updatedConfig = {
            ...existingConfig,
            ...updates,
            componentOptions: {
                ...existingConfig.componentOptions,
                ...(updates.componentOptions || {})
            }
        };
        
        this.configurations.set(componentId, updatedConfig);
        
        // Dispatch update event
        this.dispatchConfigurationUpdate(componentId, updatedConfig);
        
        return updatedConfig;
    }
    
    /**
     * Validate configuration against schema
     */
    validateConfiguration(componentType, configuration) {
        const schema = this.getSchema(componentType);
        if (!schema) {
            return {
                valid: false,
                errors: [`Unknown component type: ${componentType}`]
            };
        }
        
        const errors = [];
        const componentOptions = configuration.componentOptions || {};
        
        // Validate component options
        Object.entries(componentOptions).forEach(([optionKey, optionValue]) => {
            const optionSchema = schema.componentOptions?.[optionKey];
            if (!optionSchema) {
                errors.push(`Unknown option: ${optionKey}`);
                return;
            }
            
            const validation = this.validateOptionValue(optionValue, optionSchema);
            if (!validation.valid) {
                errors.push(`Invalid value for ${optionKey}: ${validation.errors.join(', ')}`);
            }
        });
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Validate individual option value
     */
    validateOptionValue(value, optionSchema) {
        const errors = [];
        const { type } = optionSchema;
        
        switch (type) {
            case 'select':
                const validOptions = Object.keys(optionSchema.options || {});
                if (!validOptions.includes(value)) {
                    errors.push(`Must be one of: ${validOptions.join(', ')}`);
                }
                break;
                
            case 'boolean':
                if (typeof value !== 'boolean' && !['true', 'false', '0', '1', 0, 1].includes(value)) {
                    errors.push('Must be a boolean value');
                }
                break;
                
            case 'number':
                if (typeof value !== 'number' && !Number.isFinite(Number(value))) {
                    errors.push('Must be a number');
                } else {
                    const numValue = Number(value);
                    if (optionSchema.min !== undefined && numValue < optionSchema.min) {
                        errors.push(`Must be at least ${optionSchema.min}`);
                    }
                    if (optionSchema.max !== undefined && numValue > optionSchema.max) {
                        errors.push(`Must be at most ${optionSchema.max}`);
                    }
                }
                break;
                
            case 'color':
                if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
                    errors.push('Must be a valid hex color (e.g., #ffffff)');
                }
                break;
                
            case 'string':
            case 'text':
            case 'textarea':
                if (typeof value !== 'string') {
                    errors.push('Must be a string');
                }
                break;
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Dispatch configuration update event
     */
    dispatchConfigurationUpdate(componentId, configuration) {
        const event = new CustomEvent('gmkb:component-configuration-updated', {
            detail: {
                componentId,
                configuration,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(event);
        
        this.logger.info(`🔄 PHASE 2: Configuration updated for ${componentId}`);
    }
    
    /**
     * Get all available component types with schemas
     */
    getAvailableComponentTypes() {
        return Object.keys(this.schemas);
    }
    
    /**
     * Get component options for UI generation
     */
    getComponentOptionsForUI(componentType) {
        const schema = this.getSchema(componentType);
        if (!schema || !schema.componentOptions) return [];
        
        return Object.entries(schema.componentOptions).map(([key, option]) => ({
            key,
            ...option,
            value: option.default
        }));
    }
    
    /**
     * Debug method - get current state
     */
    getDebugInfo() {
        return {
            schemas: Object.keys(this.schemas),
            configurationsCount: this.configurations.size,
            configurations: Array.from(this.configurations.entries())
        };
    }
}

// Global instance
window.ComponentConfigurationManager = ComponentConfigurationManager;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.componentConfigurationManager = new ComponentConfigurationManager();
    });
} else {
    window.componentConfigurationManager = new ComponentConfigurationManager();
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentConfigurationManager;
}
