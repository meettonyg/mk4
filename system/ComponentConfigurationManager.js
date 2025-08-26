/**
 * @file ComponentConfigurationManager.js
 * @description Phase 2: Component Configuration Manager - Configuration-driven rendering system
 * CHECKLIST COMPLIANT: Event-driven initialization, centralized state, root cause fix
 * Manages component configurations, data bindings, and rendering options
 */

(function() {
    'use strict';
    
    // ROOT FIX: Emergency logger fallback
    const logger = window.structuredLogger || {
        info: (category, message, data) => console.log(`[${category}] ${message}`, data || ''),
        debug: (category, message, data) => console.debug(`[${category}] ${message}`, data || ''),
        warn: (category, message, data) => console.warn(`[${category}] ${message}`, data || ''),
        error: (category, message, error, data) => console.error(`[${category}] ${message}`, error, data || '')
    };

    class ComponentConfigurationManager {
        constructor() {
            this.configurations = new Map();
            this.schemas = new Map();
            this.inheritanceChain = new Map();
            this.isInitialized = false;
            this.validators = new Map();
            this.defaultConfigurations = new Map();
            
            // Phase 2: Configuration metadata
            this.configurationMetadata = {
                version: '2.0.0-phase2',
                lastUpdated: Date.now(),
                totalConfigurations: 0,
                activeInheritances: 0
            };
            
            logger.info('CONFIG', 'Phase 2: Component Configuration Manager initialized');
        }

        /**
         * CHECKLIST COMPLIANT: Event-driven initialization
         * Initialize after all core systems are ready
         */
        async initialize() {
            if (this.isInitialized) {
                logger.warn('CONFIG', 'Configuration manager already initialized');
                return;
            }

            try {
                // Wait for required dependencies
                await this.waitForDependencies();
                
                // Load default component schemas
                await this.loadDefaultSchemas();
                
                // Initialize component type configurations
                await this.initializeComponentConfigurations();
                
                this.isInitialized = true;
                
                // CHECKLIST COMPLIANT: Dispatch ready event for event-driven coordination
                document.dispatchEvent(new CustomEvent('gmkb:component-config-ready', {
                    detail: {
                        timestamp: Date.now(),
                        manager: this,
                        architecture: 'configuration-driven',
                        totalConfigurations: this.configurations.size
                    }
                }));
                
                logger.info('CONFIG', 'Phase 2: Configuration manager initialized successfully', {
                    configurations: this.configurations.size,
                    schemas: this.schemas.size
                });

            } catch (error) {
                logger.error('CONFIG', 'Failed to initialize configuration manager', error);
                throw error;
            }
        }

        /**
         * CHECKLIST COMPLIANT: Dependency-awareness
         * Wait for required systems before initializing
         */
        async waitForDependencies() {
            const dependencies = [
                'enhancedStateManager',
                'enhancedComponentManager'
            ];
            
            const maxWait = 10000; // 10 seconds
            const startTime = Date.now();
            
            while (Date.now() - startTime < maxWait) {
                const missingDeps = dependencies.filter(dep => !window[dep] || !window[dep].isInitialized);
                
                if (missingDeps.length === 0) {
                    logger.info('CONFIG', 'All dependencies ready for configuration manager');
                    return;
                }
                
                logger.debug('CONFIG', 'Waiting for dependencies', { missing: missingDeps });
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            logger.warn('CONFIG', 'Dependency wait timeout - proceeding anyway');
        }

        /**
         * Register a component configuration
         * @param {string} componentId - Unique component instance ID
         * @param {string} componentType - Component type
         * @param {Object} configuration - Component configuration
         */
        registerConfiguration(componentId, componentType, configuration = {}) {
            try {
                // Validate inputs
                if (!componentId || !componentType) {
                    throw new Error('Component ID and type are required');
                }

                // Get default configuration for this component type
                const defaultConfig = this.getDefaultConfiguration(componentType);
                
                // Merge with defaults
                const mergedConfig = this.mergeConfigurations(defaultConfig, configuration);
                
                // Validate configuration
                const validation = this.validateConfiguration(componentType, mergedConfig);
                if (!validation.valid) {
                    logger.warn('CONFIG', `Configuration validation failed for ${componentId}`, validation.errors);
                    // Use default configuration as fallback
                    mergedConfig = defaultConfig;
                }

                // Store configuration
                this.configurations.set(componentId, {
                    componentId,
                    componentType,
                    configuration: mergedConfig,
                    timestamp: Date.now(),
                    version: '2.0.0'
                });

                this.configurationMetadata.totalConfigurations = this.configurations.size;
                this.configurationMetadata.lastUpdated = Date.now();

                logger.debug('CONFIG', `Registered configuration for ${componentId}`, {
                    type: componentType,
                    hasDataBindings: !!(mergedConfig.dataBindings && Object.keys(mergedConfig.dataBindings).length > 0),
                    hasOptions: !!(mergedConfig.componentOptions && Object.keys(mergedConfig.componentOptions).length > 0)
                });

                return componentId;

            } catch (error) {
                logger.error('CONFIG', `Failed to register configuration for ${componentId}`, error);
                throw error;
            }
        }

        /**
         * Get component configuration
         * @param {string} componentId - Component instance ID
         * @returns {Object|null} Component configuration
         */
        getConfiguration(componentId) {
            const configData = this.configurations.get(componentId);
            return configData ? configData.configuration : null;
        }

        /**
         * Update component configuration
         * @param {string} componentId - Component instance ID
         * @param {Object} updates - Configuration updates
         */
        updateConfiguration(componentId, updates) {
            try {
                const existingData = this.configurations.get(componentId);
                if (!existingData) {
                    logger.warn('CONFIG', `Configuration not found for update: ${componentId}`);
                    return false;
                }

                // Merge updates with existing configuration
                const updatedConfig = this.mergeConfigurations(existingData.configuration, updates);
                
                // Validate updated configuration
                const validation = this.validateConfiguration(existingData.componentType, updatedConfig);
                if (!validation.valid) {
                    logger.warn('CONFIG', `Updated configuration validation failed for ${componentId}`, validation.errors);
                    // Continue with update but log the warnings
                }

                // Update stored configuration
                this.configurations.set(componentId, {
                    ...existingData,
                    configuration: updatedConfig,
                    timestamp: Date.now()
                });

                this.configurationMetadata.lastUpdated = Date.now();

                // CHECKLIST COMPLIANT: Event-driven state updates
                document.dispatchEvent(new CustomEvent('gmkb:component-config-updated', {
                    detail: {
                        componentId,
                        componentType: existingData.componentType,
                        updates,
                        timestamp: Date.now()
                    }
                }));

                logger.debug('CONFIG', `Updated configuration for ${componentId}`, updates);
                return true;

            } catch (error) {
                logger.error('CONFIG', `Failed to update configuration for ${componentId}`, error);
                return false;
            }
        }

        /**
         * Remove component configuration
         * @param {string} componentId - Component instance ID
         */
        removeConfiguration(componentId) {
            try {
                const removed = this.configurations.delete(componentId);
                if (removed) {
                    this.configurationMetadata.totalConfigurations = this.configurations.size;
                    this.configurationMetadata.lastUpdated = Date.now();
                    
                    logger.debug('CONFIG', `Removed configuration for ${componentId}`);
                }
                return removed;

            } catch (error) {
                logger.error('CONFIG', `Failed to remove configuration for ${componentId}`, error);
                return false;
            }
        }

        /**
         * Load default component schemas and configurations
         */
        async loadDefaultSchemas() {
            try {
                // Define default schemas for common component types
                const defaultSchemas = {
                    hero: {
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
                                options: ['left_aligned', 'center_aligned', 'right_aligned']
                            },
                            imageStyle: {
                                type: 'select',
                                default: 'rounded',
                                options: ['rounded', 'circle', 'square']
                            },
                            showSocialLinks: {
                                type: 'boolean',
                                default: true
                            }
                        },
                        responsiveBehavior: {
                            mobile: 'stack_vertical',
                            tablet: 'maintain_layout'
                        }
                    },
                    
                    biography: {
                        dataBindings: {
                            content: 'biography_full',
                            shortBio: 'biography_short',
                            name: 'full_name'
                        },
                        componentOptions: {
                            length: {
                                type: 'select',
                                default: 'medium',
                                options: ['short', 'medium', 'long']
                            },
                            showReadMore: {
                                type: 'boolean',
                                default: true
                            }
                        }
                    },
                    
                    contact: {
                        dataBindings: {
                            email: 'email',
                            phone: 'phone',
                            website: 'website',
                            location: 'location'
                        },
                        componentOptions: {
                            layout: {
                                type: 'select',
                                default: 'vertical',
                                options: ['vertical', 'horizontal', 'grid']
                            },
                            showIcons: {
                                type: 'boolean',
                                default: true
                            }
                        }
                    },
                    
                    topics: {
                        dataBindings: {
                            topics: 'speaking_topics',
                            expertise: 'areas_of_expertise'
                        },
                        componentOptions: {
                            layout: {
                                type: 'select',
                                default: 'grid',
                                options: ['list', 'grid', 'tags']
                            },
                            maxTopics: {
                                type: 'number',
                                default: 6,
                                min: 1,
                                max: 20
                            },
                            showPriority: {
                                type: 'boolean',
                                default: false
                            }
                        }
                    },

                    social: {
                        dataBindings: {
                            platforms: 'social_media_links'
                        },
                        componentOptions: {
                            style: {
                                type: 'select',
                                default: 'icons',
                                options: ['icons', 'buttons', 'text']
                            },
                            size: {
                                type: 'select',
                                default: 'medium',
                                options: ['small', 'medium', 'large']
                            }
                        }
                    }
                };

                // Store schemas and create default configurations
                for (const [componentType, schema] of Object.entries(defaultSchemas)) {
                    this.schemas.set(componentType, schema);
                    this.defaultConfigurations.set(componentType, this.createDefaultConfiguration(schema));
                }

                logger.info('CONFIG', 'Default schemas loaded', {
                    schemaCount: this.schemas.size,
                    types: Object.keys(defaultSchemas)
                });

            } catch (error) {
                logger.error('CONFIG', 'Failed to load default schemas', error);
            }
        }

        /**
         * Initialize configurations for existing components
         */
        async initializeComponentConfigurations() {
            try {
                // Check if we have any existing components in state
                if (window.enhancedStateManager && window.enhancedStateManager.isInitialized) {
                    const currentState = window.enhancedStateManager.getState();
                    
                    if (currentState && currentState.components) {
                        // Initialize configurations for existing components
                        Object.values(currentState.components).forEach(component => {
                            if (component.id && component.type) {
                                // Check if configuration already exists
                                if (!this.configurations.has(component.id)) {
                                    this.registerConfiguration(component.id, component.type, component.props || {});
                                }
                            }
                        });
                    }
                }

                logger.debug('CONFIG', 'Component configurations initialized');

            } catch (error) {
                logger.warn('CONFIG', 'Error initializing component configurations', error);
            }
        }

        /**
         * Create default configuration from schema
         * @param {Object} schema - Component schema
         * @returns {Object} Default configuration
         */
        createDefaultConfiguration(schema) {
            const config = {
                dataBindings: schema.dataBindings || {},
                componentOptions: {},
                responsiveBehavior: schema.responsiveBehavior || {}
            };

            // Extract default values from component options
            if (schema.componentOptions) {
                Object.entries(schema.componentOptions).forEach(([key, optionDef]) => {
                    if (optionDef.default !== undefined) {
                        config.componentOptions[key] = optionDef.default;
                    }
                });
            }

            return config;
        }

        /**
         * Get default configuration for component type
         * @param {string} componentType - Component type
         * @returns {Object} Default configuration
         */
        getDefaultConfiguration(componentType) {
            return this.defaultConfigurations.get(componentType) || {
                dataBindings: {},
                componentOptions: {},
                responsiveBehavior: {}
            };
        }

        /**
         * Merge two configurations with deep merge
         * @param {Object} base - Base configuration
         * @param {Object} overlay - Overlay configuration
         * @returns {Object} Merged configuration
         */
        mergeConfigurations(base, overlay) {
            const merged = JSON.parse(JSON.stringify(base)); // Deep clone

            Object.entries(overlay).forEach(([key, value]) => {
                if (value && typeof value === 'object' && !Array.isArray(value) && merged[key]) {
                    merged[key] = { ...merged[key], ...value };
                } else {
                    merged[key] = value;
                }
            });

            return merged;
        }

        /**
         * Validate component configuration
         * @param {string} componentType - Component type
         * @param {Object} configuration - Configuration to validate
         * @returns {Object} Validation result
         */
        validateConfiguration(componentType, configuration) {
            const schema = this.schemas.get(componentType);
            const errors = [];

            // Basic structure validation
            if (!configuration.dataBindings) {
                errors.push('Missing dataBindings');
            }
            if (!configuration.componentOptions) {
                errors.push('Missing componentOptions');
            }

            // Schema-specific validation
            if (schema && schema.componentOptions) {
                Object.entries(configuration.componentOptions || {}).forEach(([key, value]) => {
                    const optionDef = schema.componentOptions[key];
                    if (optionDef && !this.validateOptionValue(value, optionDef)) {
                        errors.push(`Invalid value for option '${key}': ${value}`);
                    }
                });
            }

            return {
                valid: errors.length === 0,
                errors
            };
        }

        /**
         * Validate individual option value
         * @param {*} value - Value to validate
         * @param {Object} optionDef - Option definition
         * @returns {boolean} Is valid
         */
        validateOptionValue(value, optionDef) {
            switch (optionDef.type) {
                case 'select':
                    return !optionDef.options || optionDef.options.includes(value);
                case 'boolean':
                    return typeof value === 'boolean';
                case 'number':
                    const num = Number(value);
                    if (isNaN(num)) return false;
                    if (optionDef.min !== undefined && num < optionDef.min) return false;
                    if (optionDef.max !== undefined && num > optionDef.max) return false;
                    return true;
                case 'string':
                    return typeof value === 'string';
                default:
                    return true; // Unknown types are considered valid
            }
        }

        /**
         * Get all configurations for a component type
         * @param {string} componentType - Component type
         * @returns {Array} Array of configurations
         */
        getConfigurationsByType(componentType) {
            const configurations = [];
            
            for (const [componentId, configData] of this.configurations) {
                if (configData.componentType === componentType) {
                    configurations.push({
                        componentId,
                        ...configData
                    });
                }
            }

            return configurations;
        }

        /**
         * Get component schema
         * @param {string} componentType - Component type
         * @returns {Object|null} Component schema
         */
        getSchema(componentType) {
            return this.schemas.get(componentType) || null;
        }

        /**
         * Register custom schema
         * @param {string} componentType - Component type
         * @param {Object} schema - Schema definition
         */
        registerSchema(componentType, schema) {
            try {
                this.schemas.set(componentType, schema);
                this.defaultConfigurations.set(componentType, this.createDefaultConfiguration(schema));
                
                logger.debug('CONFIG', `Registered schema for ${componentType}`);
                return true;

            } catch (error) {
                logger.error('CONFIG', `Failed to register schema for ${componentType}`, error);
                return false;
            }
        }

        /**
         * Get configuration metadata and statistics
         * @returns {Object} Metadata
         */
        getMetadata() {
            const typeDistribution = {};
            for (const [componentId, configData] of this.configurations) {
                const type = configData.componentType;
                typeDistribution[type] = (typeDistribution[type] || 0) + 1;
            }

            return {
                ...this.configurationMetadata,
                isInitialized: this.isInitialized,
                configurations: this.configurations.size,
                schemas: this.schemas.size,
                defaultConfigurations: this.defaultConfigurations.size,
                typeDistribution,
                availableSchemas: Array.from(this.schemas.keys())
            };
        }

        /**
         * CHECKLIST COMPLIANT: Centralized state access
         * Export configuration to state for persistence
         */
        exportToState() {
            const exportData = {};
            
            for (const [componentId, configData] of this.configurations) {
                exportData[componentId] = {
                    componentType: configData.componentType,
                    configuration: configData.configuration,
                    timestamp: configData.timestamp
                };
            }

            return {
                version: '2.0.0-phase2',
                timestamp: Date.now(),
                configurations: exportData,
                metadata: this.configurationMetadata
            };
        }

        /**
         * Import configuration from state
         * @param {Object} importData - Imported data
         */
        importFromState(importData) {
            try {
                if (!importData || !importData.configurations) {
                    logger.warn('CONFIG', 'No configuration data to import');
                    return false;
                }

                let importedCount = 0;
                
                Object.entries(importData.configurations).forEach(([componentId, configData]) => {
                    if (configData.componentType && configData.configuration) {
                        this.configurations.set(componentId, {
                            componentId,
                            componentType: configData.componentType,
                            configuration: configData.configuration,
                            timestamp: configData.timestamp || Date.now(),
                            version: configData.version || '2.0.0'
                        });
                        importedCount++;
                    }
                });

                this.configurationMetadata.totalConfigurations = this.configurations.size;
                this.configurationMetadata.lastUpdated = Date.now();

                logger.info('CONFIG', `Imported ${importedCount} configurations`);
                return true;

            } catch (error) {
                logger.error('CONFIG', 'Failed to import configurations', error);
                return false;
            }
        }

        /**
         * Debug method to display configuration information
         */
        debug() {
            console.group('🎛️ Component Configuration Manager Debug');
            console.log('Metadata:', this.getMetadata());
            console.log('Configurations:', Array.from(this.configurations.entries()));
            console.log('Schemas:', Array.from(this.schemas.entries()));
            console.log('Default Configurations:', Array.from(this.defaultConfigurations.entries()));
            console.groupEnd();
        }

        /**
         * Clear all configurations
         */
        clearAll() {
            this.configurations.clear();
            this.configurationMetadata.totalConfigurations = 0;
            this.configurationMetadata.lastUpdated = Date.now();
            
            logger.info('CONFIG', 'All configurations cleared');
        }

        /**
         * Check if manager is ready
         */
        isReady() {
            return this.isInitialized;
        }
    }

    // ROOT FIX: Create and expose globally
    window.ComponentConfigurationManager = ComponentConfigurationManager;
    window.componentConfigurationManager = new ComponentConfigurationManager();

    // CHECKLIST COMPLIANT: Event-driven initialization - wait for core systems
    let configManagerInitialized = false;
    
    const initializeConfigManager = async () => {
        if (configManagerInitialized) return;
        
        // Wait for required dependencies
        const dependencies = ['enhancedStateManager', 'enhancedComponentManager'];
        let allReady = dependencies.every(dep => window[dep] && window[dep].isInitialized);
        
        if (allReady) {
            configManagerInitialized = true;
            await window.componentConfigurationManager.initialize();
            logger.info('CONFIG', 'Configuration Manager initialized after dependencies ready');
        } else {
            // Listen for dependency ready events
            const checkDependencies = () => {
                allReady = dependencies.every(dep => window[dep] && window[dep].isInitialized);
                if (allReady && !configManagerInitialized) {
                    configManagerInitialized = true;
                    window.componentConfigurationManager.initialize();
                    logger.info('CONFIG', 'Configuration Manager initialized via dependency events');
                }
            };
            
            document.addEventListener('gmkb:state-manager-ready', checkDependencies, { once: true });
            document.addEventListener('gmkb:component-manager-ready', checkDependencies, { once: true });
        }
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeConfigManager);
    } else {
        initializeConfigManager();
    }

    // DEBUG: Add global debug helpers
    if (window.gmkbData?.debugMode) {
        window.debugComponentConfig = function(componentId) {
            const config = window.componentConfigurationManager.getConfiguration(componentId);
            console.group(`🎛️ Component Configuration: ${componentId}`);
            console.log('Configuration:', config);
            console.log('Manager State:', window.componentConfigurationManager.getMetadata());
            console.groupEnd();
        };
        
        console.log('✅ Component Configuration Manager: Available globally and ready');
        console.log('🧪 Debug function available: debugComponentConfig(componentId)');
    }

})();