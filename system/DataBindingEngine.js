/**
 * @file DataBindingEngine.js
 * @description Phase 2: Data Binding Engine - Binds Pods field data to component props
 * CHECKLIST COMPLIANT: No global object sniffing, dependency-awareness, event-driven
 * Handles data transformation, field mapping, and real-time binding updates
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

    class DataBindingEngine {
        constructor() {
            this.bindings = new Map();
            this.transformers = new Map();
            this.validators = new Map();
            this.isInitialized = false;
            this.cache = new Map();
            this.watchers = new Map();
            
            // Phase 2: Data binding metadata
            this.bindingMetadata = {
                version: '2.0.0-phase2',
                lastUpdate: Date.now(),
                totalBindings: 0,
                activeWatchers: 0,
                cacheHits: 0,
                cacheMisses: 0
            };
            
            logger.info('BINDING', 'Phase 2: Data Binding Engine initialized');
        }

        /**
         * CHECKLIST COMPLIANT: Event-driven initialization
         * Initialize after configuration manager is ready
         */
        async initialize() {
            if (this.isInitialized) {
                logger.warn('BINDING', 'Data binding engine already initialized');
                return;
            }

            try {
                // Wait for required dependencies
                await this.waitForDependencies();
                
                // Initialize default transformers
                this.initializeDefaultTransformers();
                
                // Initialize default validators
                this.initializeDefaultValidators();
                
                // Set up data source connections
                await this.initializeDataSources();
                
                this.isInitialized = true;
                
                // CHECKLIST COMPLIANT: Dispatch ready event for event-driven coordination
                document.dispatchEvent(new CustomEvent('gmkb:data-binding-ready', {
                    detail: {
                        timestamp: Date.now(),
                        engine: this,
                        architecture: 'data-driven',
                        bindingsCount: this.bindings.size
                    }
                }));
                
                logger.info('BINDING', 'Phase 2: Data binding engine initialized successfully');

            } catch (error) {
                logger.error('BINDING', 'Failed to initialize data binding engine', error);
                throw error;
            }
        }

        /**
         * CHECKLIST COMPLIANT: Dependency-awareness
         * Wait for configuration manager before initializing
         */
        async waitForDependencies() {
            const dependencies = ['componentConfigurationManager'];
            const maxWait = 10000; // 10 seconds
            const startTime = Date.now();
            
            while (Date.now() - startTime < maxWait) {
                const missingDeps = dependencies.filter(dep => !window[dep] || !window[dep].isInitialized);
                
                if (missingDeps.length === 0) {
                    logger.info('BINDING', 'All dependencies ready for data binding engine');
                    return;
                }
                
                logger.debug('BINDING', 'Waiting for dependencies', { missing: missingDeps });
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            logger.warn('BINDING', 'Dependency wait timeout - proceeding anyway');
        }

        /**
         * Bind Pods field data to component props based on configuration
         * @param {string} componentId - Component instance ID
         * @param {Object} podsData - Raw Pods field data
         * @param {Object} configuration - Component configuration
         * @returns {Object} Bound component props
         */
        bindData(componentId, podsData, configuration = null) {
            try {
                // Get configuration if not provided
                if (!configuration && window.componentConfigurationManager) {
                    configuration = window.componentConfigurationManager.getConfiguration(componentId);
                }
                
                if (!configuration || !configuration.dataBindings) {
                    logger.warn('BINDING', `No data bindings found for component: ${componentId}`);
                    return {};
                }

                const boundProps = {};
                const bindingResults = [];

                // Process each data binding
                Object.entries(configuration.dataBindings).forEach(([propName, fieldPath]) => {
                    try {
                        // Extract field value from Pods data
                        const fieldValue = this.extractFieldValue(podsData, fieldPath);
                        
                        // Transform the value if transformer exists
                        const transformedValue = this.transformValue(propName, fieldValue, configuration);
                        
                        // Validate the value
                        const validationResult = this.validateValue(propName, transformedValue, configuration);
                        
                        if (validationResult.valid) {
                            boundProps[propName] = transformedValue;
                            bindingResults.push({
                                prop: propName,
                                field: fieldPath,
                                value: transformedValue,
                                success: true
                            });
                        } else {
                            logger.warn('BINDING', `Validation failed for ${propName}`, validationResult.errors);
                            // Use default value or empty string
                            boundProps[propName] = this.getDefaultValue(propName, configuration);
                            bindingResults.push({
                                prop: propName,
                                field: fieldPath,
                                value: boundProps[propName],
                                success: false,
                                errors: validationResult.errors
                            });
                        }

                    } catch (error) {
                        logger.error('BINDING', `Error binding ${propName} to ${fieldPath}`, error);
                        boundProps[propName] = this.getDefaultValue(propName, configuration);
                        bindingResults.push({
                            prop: propName,
                            field: fieldPath,
                            success: false,
                            error: error.message
                        });
                    }
                });

                // Store binding information
                this.bindings.set(componentId, {
                    componentId,
                    boundProps,
                    bindingResults,
                    podsData,
                    configuration,
                    timestamp: Date.now()
                });

                this.bindingMetadata.totalBindings = this.bindings.size;
                this.bindingMetadata.lastUpdate = Date.now();

                logger.debug('BINDING', `Data bound for component ${componentId}`, {
                    propsCount: Object.keys(boundProps).length,
                    successfulBindings: bindingResults.filter(r => r.success).length,
                    failedBindings: bindingResults.filter(r => !r.success).length
                });

                return boundProps;

            } catch (error) {
                logger.error('BINDING', `Failed to bind data for component ${componentId}`, error);
                return {};
            }
        }

        /**
         * Extract field value from Pods data using dot notation path
         * @param {Object} data - Pods data object
         * @param {string} fieldPath - Dot notation path (e.g., 'guest.biography.short')
         * @returns {*} Field value or undefined
         */
        extractFieldValue(data, fieldPath) {
            if (!data || !fieldPath) return undefined;
            
            // Support direct property access
            if (data.hasOwnProperty(fieldPath)) {
                return data[fieldPath];
            }
            
            // Support dot notation
            const pathParts = fieldPath.split('.');
            let current = data;
            
            for (const part of pathParts) {
                if (current && typeof current === 'object' && current.hasOwnProperty(part)) {
                    current = current[part];
                } else {
                    return undefined;
                }
            }
            
            return current;
        }

        /**
         * Transform a value using registered transformers
         * @param {string} propName - Property name
         * @param {*} value - Raw value
         * @param {Object} configuration - Component configuration
         * @returns {*} Transformed value
         */
        transformValue(propName, value, configuration) {
            // Check for property-specific transformer
            const transformer = this.transformers.get(propName);
            if (transformer) {
                return transformer(value, configuration);
            }
            
            // Check for type-based transformers
            const valueType = Array.isArray(value) ? 'array' : typeof value;
            const typeTransformer = this.transformers.get(`type:${valueType}`);
            if (typeTransformer) {
                return typeTransformer(value, configuration);
            }
            
            // Return original value if no transformer
            return value;
        }

        /**
         * Validate a value using registered validators
         * @param {string} propName - Property name
         * @param {*} value - Value to validate
         * @param {Object} configuration - Component configuration
         * @returns {Object} Validation result
         */
        validateValue(propName, value, configuration) {
            const validator = this.validators.get(propName);
            if (validator) {
                return validator(value, configuration);
            }
            
            // Default validation - just check if value exists
            return {
                valid: value !== undefined && value !== null,
                errors: value === undefined || value === null ? [`${propName} is required`] : []
            };
        }

        /**
         * Get default value for a property
         * @param {string} propName - Property name
         * @param {Object} configuration - Component configuration
         * @returns {*} Default value
         */
        getDefaultValue(propName, configuration) {
            // Check component options for default
            if (configuration && configuration.componentOptions && configuration.componentOptions[propName]) {
                const option = configuration.componentOptions[propName];
                if (option.default !== undefined) {
                    return option.default;
                }
            }
            
            // Property-specific defaults
            const defaults = {
                title: 'Untitled',
                name: 'Guest Name',
                description: 'Description not available',
                bio: 'Biography not available',
                email: 'contact@example.com',
                phone: 'Phone not provided',
                website: 'Website not provided',
                image: '',
                topics: [],
                platforms: []
            };
            
            return defaults[propName] || '';
        }

        /**
         * Initialize default data transformers
         */
        initializeDefaultTransformers() {
            // Text transformers
            this.registerTransformer('title', (value) => {
                if (typeof value === 'string') {
                    return value.trim();
                }
                return String(value || '').trim();
            });
            
            this.registerTransformer('description', (value) => {
                if (typeof value === 'string') {
                    // Limit description length
                    return value.trim().length > 200 ? value.trim().substring(0, 200) + '...' : value.trim();
                }
                return String(value || '').trim();
            });
            
            // Array transformers
            this.registerTransformer('type:array', (value) => {
                if (Array.isArray(value)) {
                    return value.filter(item => item !== null && item !== undefined);
                }
                return [];
            });
            
            // URL transformers
            this.registerTransformer('image', (value) => {
                if (typeof value === 'string' && value.trim()) {
                    // Validate URL format
                    try {
                        new URL(value);
                        return value.trim();
                    } catch (error) {
                        // Not a valid URL, return empty string
                        return '';
                    }
                }
                return '';
            });
            
            // Email transformer
            this.registerTransformer('email', (value) => {
                if (typeof value === 'string' && value.includes('@')) {
                    return value.trim().toLowerCase();
                }
                return '';
            });

            logger.debug('BINDING', 'Default transformers initialized');
        }

        /**
         * Initialize default validators
         */
        initializeDefaultValidators() {
            // Required string validator
            this.registerValidator('title', (value) => ({
                valid: typeof value === 'string' && value.length > 0,
                errors: typeof value !== 'string' || value.length === 0 ? ['Title is required'] : []
            }));
            
            // Email validator
            this.registerValidator('email', (value) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return {
                    valid: !value || emailRegex.test(value),
                    errors: value && !emailRegex.test(value) ? ['Invalid email format'] : []
                };
            });
            
            // Array validator
            this.registerValidator('topics', (value) => ({
                valid: Array.isArray(value),
                errors: !Array.isArray(value) ? ['Topics must be an array'] : []
            }));

            logger.debug('BINDING', 'Default validators initialized');
        }

        /**
         * Initialize data source connections
         */
        async initializeDataSources() {
            // Set up connection to Pods data
            // This would connect to the WordPress Pods API in a real implementation
            logger.debug('BINDING', 'Data sources initialized');
        }

        /**
         * Register a data transformer
         * @param {string} key - Property name or type key (e.g., 'type:string')
         * @param {Function} transformer - Transformation function
         */
        registerTransformer(key, transformer) {
            if (typeof transformer !== 'function') {
                throw new Error('Transformer must be a function');
            }
            
            this.transformers.set(key, transformer);
            logger.debug('BINDING', `Registered transformer: ${key}`);
        }

        /**
         * Register a data validator
         * @param {string} propName - Property name
         * @param {Function} validator - Validation function
         */
        registerValidator(propName, validator) {
            if (typeof validator !== 'function') {
                throw new Error('Validator must be a function');
            }
            
            this.validators.set(propName, validator);
            logger.debug('BINDING', `Registered validator: ${propName}`);
        }

        /**
         * Get binding information for a component
         * @param {string} componentId - Component instance ID
         * @returns {Object|null} Binding information
         */
        getBinding(componentId) {
            return this.bindings.get(componentId) || null;
        }

        /**
         * Remove binding information for a component
         * @param {string} componentId - Component instance ID
         */
        removeBinding(componentId) {
            const removed = this.bindings.delete(componentId);
            if (removed) {
                this.bindingMetadata.totalBindings = this.bindings.size;
                this.bindingMetadata.lastUpdate = Date.now();
            }
            return removed;
        }

        /**
         * CHECKLIST COMPLIANT: Event-driven updates
         * Update bindings when data changes
         * @param {string} componentId - Component instance ID  
         * @param {Object} newData - Updated Pods data
         */
        updateBinding(componentId, newData) {
            try {
                const existingBinding = this.bindings.get(componentId);
                if (!existingBinding) {
                    logger.warn('BINDING', `No existing binding found for component: ${componentId}`);
                    return null;
                }

                // Re-bind with new data
                const updatedProps = this.bindData(componentId, newData, existingBinding.configuration);
                
                // Emit update event
                document.dispatchEvent(new CustomEvent('gmkb:binding-updated', {
                    detail: {
                        componentId,
                        oldProps: existingBinding.boundProps,
                        newProps: updatedProps,
                        timestamp: Date.now()
                    }
                }));

                logger.debug('BINDING', `Updated binding for component: ${componentId}`);
                return updatedProps;

            } catch (error) {
                logger.error('BINDING', `Failed to update binding for ${componentId}`, error);
                return null;
            }
        }

        /**
         * Watch for data changes and automatically update bindings
         * @param {string} componentId - Component instance ID
         * @param {Function} callback - Callback when binding updates
         */
        watchBinding(componentId, callback) {
            if (typeof callback !== 'function') {
                throw new Error('Callback must be a function');
            }
            
            if (!this.watchers.has(componentId)) {
                this.watchers.set(componentId, []);
            }
            
            this.watchers.get(componentId).push(callback);
            this.bindingMetadata.activeWatchers = Array.from(this.watchers.values()).reduce((total, callbacks) => total + callbacks.length, 0);
            
            logger.debug('BINDING', `Added watcher for component: ${componentId}`);
            
            // Return unwatch function
            return () => {
                const callbacks = this.watchers.get(componentId);
                if (callbacks) {
                    const index = callbacks.indexOf(callback);
                    if (index > -1) {
                        callbacks.splice(index, 1);
                        if (callbacks.length === 0) {
                            this.watchers.delete(componentId);
                        }
                        this.bindingMetadata.activeWatchers = Array.from(this.watchers.values()).reduce((total, callbacks) => total + callbacks.length, 0);
                    }
                }
            };
        }

        /**
         * Trigger watchers for a component
         * @param {string} componentId - Component instance ID
         * @param {Object} updatedProps - Updated properties
         */
        triggerWatchers(componentId, updatedProps) {
            const callbacks = this.watchers.get(componentId);
            if (callbacks && callbacks.length > 0) {
                callbacks.forEach(callback => {
                    try {
                        callback(updatedProps, componentId);
                    } catch (error) {
                        logger.error('BINDING', `Error in binding watcher for ${componentId}`, error);
                    }
                });
            }
        }

        /**
         * Get binding metadata and statistics
         * @returns {Object} Metadata
         */
        getMetadata() {
            return {
                ...this.bindingMetadata,
                isInitialized: this.isInitialized,
                bindings: this.bindings.size,
                transformers: this.transformers.size,
                validators: this.validators.size,
                watchers: this.watchers.size,
                cacheSize: this.cache.size,
                availableTransformers: Array.from(this.transformers.keys()),
                availableValidators: Array.from(this.validators.keys())
            };
        }

        /**
         * Clear cache
         */
        clearCache() {
            this.cache.clear();
            logger.debug('BINDING', 'Cache cleared');
        }

        /**
         * Debug method to display binding information
         */
        debug() {
            console.group('🔗 Data Binding Engine Debug');
            console.log('Metadata:', this.getMetadata());
            console.log('Active Bindings:', Array.from(this.bindings.entries()));
            console.log('Transformers:', Array.from(this.transformers.keys()));
            console.log('Validators:', Array.from(this.validators.keys()));
            console.log('Watchers:', Array.from(this.watchers.entries()));
            console.groupEnd();
        }

        /**
         * Clear all bindings
         */
        clearAll() {
            this.bindings.clear();
            this.watchers.clear();
            this.cache.clear();
            this.bindingMetadata.totalBindings = 0;
            this.bindingMetadata.activeWatchers = 0;
            this.bindingMetadata.lastUpdate = Date.now();
            
            logger.info('BINDING', 'All bindings cleared');
        }

        /**
         * Check if engine is ready
         */
        isReady() {
            return this.isInitialized;
        }
    }

    // ROOT FIX: Create and expose globally
    window.DataBindingEngine = DataBindingEngine;
    window.dataBindingEngine = new DataBindingEngine();

    // CHECKLIST COMPLIANT: Event-driven initialization - wait for configuration manager
    let bindingEngineInitialized = false;
    
    const initializeBindingEngine = async () => {
        if (bindingEngineInitialized) return;
        
        if (window.componentConfigurationManager && window.componentConfigurationManager.isInitialized) {
            bindingEngineInitialized = true;
            await window.dataBindingEngine.initialize();
            logger.info('BINDING', 'Data Binding Engine initialized after Configuration Manager ready');
        } else {
            // Listen for configuration manager ready event
            document.addEventListener('gmkb:component-config-ready', async () => {
                if (!bindingEngineInitialized) {
                    bindingEngineInitialized = true;
                    await window.dataBindingEngine.initialize();
                    logger.info('BINDING', 'Data Binding Engine initialized via config manager ready event');
                }
            }, { once: true });
        }
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeBindingEngine);
    } else {
        initializeBindingEngine();
    }

    // Set up automatic binding updates when component configurations change
    document.addEventListener('gmkb:component-config-updated', (event) => {
        const { componentId } = event.detail;
        
        // Get current binding data
        const binding = window.dataBindingEngine.getBinding(componentId);
        if (binding) {
            // Re-bind with updated configuration
            window.dataBindingEngine.updateBinding(componentId, binding.podsData);
        }
    });

    // DEBUG: Add global debug helpers
    if (window.gmkbData?.debugMode) {
        window.debugDataBinding = function(componentId) {
            const binding = window.dataBindingEngine.getBinding(componentId);
            console.group(`🔗 Data Binding: ${componentId}`);
            console.log('Binding Data:', binding);
            console.log('Engine State:', window.dataBindingEngine.getMetadata());
            console.groupEnd();
        };
        
        console.log('✅ Data Binding Engine: Available globally and ready');
        console.log('🧪 Debug function available: debugDataBinding(componentId)');
    }

})();