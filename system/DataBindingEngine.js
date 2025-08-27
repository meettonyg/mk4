/**
 * Data Binding Engine
 * Phase 2: Component Layer Architecture
 * 
 * Handles binding of Pods field data to component properties
 * Creates a sophisticated data binding system for components
 * 
 * @version 2.0.0-phase2  
 * @package GMKB/System
 */

class DataBindingEngine {
    constructor() {
        this.bindings = new Map();
        this.dataCache = new Map();
        this.logger = window.StructuredLogger || console;
        
        this.logger.info('🔗 PHASE 2: DataBindingEngine initializing');
        this.initializeEngine();
    }
    
    /**
     * Initialize the data binding engine
     */
    initializeEngine() {
        // Listen for configuration updates to update bindings
        document.addEventListener('gmkb:component-configuration-updated', (event) => {
            const { componentId, configuration } = event.detail;
            this.updateComponentBindings(componentId, configuration);
        });
        
        // Listen for data updates
        document.addEventListener('gmkb:data-updated', (event) => {
            const { dataSource, data } = event.detail;
            this.updateDataCache(dataSource, data);
            this.refreshAllBindings();
        });
        
        this.logger.info('✅ PHASE 2: DataBindingEngine initialized');
    }
    
    /**
     * Check if the data binding engine is ready
     * @returns {boolean} True if engine is initialized and ready to use
     */
    isReady() {
        return true; // Engine is ready when instantiated
    }
    
    /**
     * Bind Pods field data to component properties
     */
    bindComponentData(componentId, componentType, dataBindings, sourceData = null) {
        if (!window.componentConfigurationManager) {
            this.logger.warn('⚠️ PHASE 2: ComponentConfigurationManager not available');
            return {};
        }
        
        const schema = window.componentConfigurationManager.getSchema(componentType);
        if (!schema || !schema.dataBindings) {
            this.logger.warn(`⚠️ PHASE 2: No data bindings found for ${componentType}`);
            return {};
        }
        
        // Use provided data or get from cache/global data
        const data = sourceData || this.getDataForBinding(componentId);
        if (!data) {
            this.logger.warn(`⚠️ PHASE 2: No source data available for ${componentId}`);
            return {};
        }
        
        const boundData = {};
        const bindings = dataBindings || schema.dataBindings;
        
        // Process each data binding
        Object.entries(bindings).forEach(([componentProp, dataField]) => {
            const value = this.resolveDataField(data, dataField);
            if (value !== undefined && value !== null) {
                boundData[componentProp] = value;
            } else {
                this.logger.debug(`📊 PHASE 2: No data found for field ${dataField} in ${componentId}`);
                boundData[componentProp] = this.getDefaultValue(componentProp, componentType);
            }
        });
        
        // Store binding information
        this.bindings.set(componentId, {
            componentType,
            dataBindings: bindings,
            lastBoundData: boundData,
            timestamp: Date.now()
        });
        
        this.logger.info(`✅ PHASE 2: Data bound for ${componentType} (${componentId})`, boundData);
        return boundData;
    }
    
    /**
     * Alias for bindComponentData (backward compatibility)
     * This is the method called by enhanced-component-manager.js
     */
    bindData(componentId, podsData, componentConfiguration) {
        if (!componentConfiguration || !componentConfiguration.component_type) {
            this.logger.warn(`⚠️ PHASE 2: Invalid configuration for bindData: ${componentId}`);
            return {};
        }
        
        return this.bindComponentData(
            componentId, 
            componentConfiguration.component_type, 
            componentConfiguration.dataBindings,
            podsData
        );
    }
    
    /**
     * Watch for binding changes (sets up automatic updates)
     * This is called by enhanced-component-manager.js
     */
    watchBinding(componentId, callback) {
        // Store the callback for this component
        const bindingInfo = this.bindings.get(componentId);
        if (bindingInfo) {
            bindingInfo.watchCallback = callback;
            this.bindings.set(componentId, bindingInfo);
            
            this.logger.info(`👁️ PHASE 2: Watching binding changes for ${componentId}`);
        } else {
            this.logger.warn(`⚠️ PHASE 2: Cannot watch - no binding found for ${componentId}`);
        }
    }
    
    /**
     * Alias for removeComponentBindings (backward compatibility)  
     * This is the method called by enhanced-component-manager.js
     */
    removeBinding(componentId) {
        return this.removeComponentBindings(componentId);
    }
    
    /**
     * Resolve data field value with dot notation support
     */
    resolveDataField(data, fieldPath) {
        if (!fieldPath || !data) return null;
        
        // Handle dot notation (e.g., 'user.profile.name')
        const fields = fieldPath.split('.');
        let value = data;
        
        for (const field of fields) {
            if (value && typeof value === 'object' && field in value) {
                value = value[field];
            } else {
                return null;
            }
        }
        
        return value;
    }
    
    /**
     * Get data for binding from various sources
     */
    getDataForBinding(componentId) {
        // Check cache first
        if (this.dataCache.has(componentId)) {
            return this.dataCache.get(componentId);
        }
        
        // Try global data sources
        const globalData = this.getGlobalData();
        if (globalData) {
            return globalData;
        }
        
        // Try WordPress data
        if (typeof gmkbData !== 'undefined') {
            return this.extractWordPressData(gmkbData);
        }
        
        return null;
    }
    
    /**
     * Extract data from WordPress/global sources
     */
    extractWordPressData(wpData) {
        // Extract various data sources
        const extractedData = {};
        
        // Post data
        if (wpData.post_id) {
            extractedData.post_id = wpData.post_id;
            extractedData.postId = wpData.post_id;
        }
        
        // User data (if available)
        if (wpData.user) {
            Object.assign(extractedData, wpData.user);
        }
        
        // Custom fields data
        if (wpData.custom_fields) {
            Object.assign(extractedData, wpData.custom_fields);
        }
        
        // Pods data (if available)
        if (wpData.pods_data) {
            Object.assign(extractedData, wpData.pods_data);
        }
        
        // Component data
        if (wpData.components) {
            extractedData.components = wpData.components;
        }
        
        return extractedData;
    }
    
    /**
     * Get global data from various sources
     */
    getGlobalData() {
        // Try various global data sources
        const sources = [
            () => window.gmkbData,
            () => window.wpData,
            () => window.userData,
            () => window.podsData
        ];
        
        for (const getSource of sources) {
            try {
                const data = getSource();
                if (data && typeof data === 'object') {
                    return this.extractWordPressData(data);
                }
            } catch (e) {
                // Continue to next source
            }
        }
        
        return null;
    }
    
    /**
     * Get default value for a component property
     */
    getDefaultValue(componentProp, componentType) {
        // Common defaults based on property names
        const defaults = {
            title: 'Untitled',
            subtitle: '',
            description: '',
            name: 'Name',
            email: '',
            phone: '',
            website: '',
            image: '',
            topics: [],
            content: ''
        };
        
        return defaults[componentProp] || '';
    }
    
    /**
     * Update component bindings
     */
    updateComponentBindings(componentId, configuration) {
        if (!configuration.dataBindings) return;
        
        const bindingInfo = this.bindings.get(componentId);
        if (bindingInfo) {
            // Re-bind with updated configuration
            const newBoundData = this.bindComponentData(
                componentId, 
                configuration.component_type, 
                configuration.dataBindings
            );
            
            // Dispatch update event
            this.dispatchDataBindingUpdate(componentId, newBoundData);
        }
    }
    
    /**
     * Update data cache
     */
    updateDataCache(dataSource, data) {
        this.dataCache.set(dataSource, data);
        this.logger.info(`📊 PHASE 2: Data cache updated for ${dataSource}`);
    }
    
    /**
     * Refresh all bindings (when global data changes)
     */
    refreshAllBindings() {
        this.bindings.forEach((bindingInfo, componentId) => {
            const newBoundData = this.bindComponentData(
                componentId,
                bindingInfo.componentType,
                bindingInfo.dataBindings
            );
            
            // Only dispatch if data actually changed
            if (JSON.stringify(newBoundData) !== JSON.stringify(bindingInfo.lastBoundData)) {
                this.dispatchDataBindingUpdate(componentId, newBoundData);
            }
        });
        
        this.logger.info('🔄 PHASE 2: All data bindings refreshed');
    }
    
    /**
     * Dispatch data binding update event
     */
    dispatchDataBindingUpdate(componentId, boundData) {
        // Trigger watch callback if exists
        const bindingInfo = this.bindings.get(componentId);
        if (bindingInfo && bindingInfo.watchCallback) {
            try {
                bindingInfo.watchCallback(boundData);
                this.logger.debug(`👁️ PHASE 2: Watch callback triggered for ${componentId}`);
            } catch (error) {
                this.logger.warn(`⚠️ PHASE 2: Watch callback error for ${componentId}:`, error);
            }
        }
        
        const event = new CustomEvent('gmkb:data-binding-updated', {
            detail: {
                componentId,
                boundData,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(event);
        
        this.logger.info(`🔄 PHASE 2: Data binding updated for ${componentId}`);
    }
    
    /**
     * Get binding information for component
     */
    getBindingInfo(componentId) {
        return this.bindings.get(componentId) || null;
    }
    
    /**
     * Remove bindings for component
     */
    removeComponentBindings(componentId) {
        const removed = this.bindings.delete(componentId);
        if (removed) {
            this.logger.info(`🗑️ PHASE 2: Removed bindings for ${componentId}`);
        }
        return removed;
    }
    
    /**
     * Transform data based on binding configuration
     */
    transformBoundData(boundData, transformations = {}) {
        const transformed = { ...boundData };
        
        Object.entries(transformations).forEach(([field, transformation]) => {
            if (transformed[field] !== undefined) {
                switch (transformation.type) {
                    case 'uppercase':
                        transformed[field] = String(transformed[field]).toUpperCase();
                        break;
                    case 'lowercase':
                        transformed[field] = String(transformed[field]).toLowerCase();
                        break;
                    case 'truncate':
                        const maxLength = transformation.length || 100;
                        if (String(transformed[field]).length > maxLength) {
                            transformed[field] = String(transformed[field]).substring(0, maxLength) + '...';
                        }
                        break;
                    case 'format_date':
                        try {
                            transformed[field] = new Date(transformed[field]).toLocaleDateString();
                        } catch (e) {
                            // Keep original value if date parsing fails
                        }
                        break;
                    case 'array_join':
                        if (Array.isArray(transformed[field])) {
                            transformed[field] = transformed[field].join(transformation.separator || ', ');
                        }
                        break;
                }
            }
        });
        
        return transformed;
    }
    
    /**
     * Debug method - get current state
     */
    getDebugInfo() {
        return {
            bindingsCount: this.bindings.size,
            cacheSize: this.dataCache.size,
            bindings: Array.from(this.bindings.entries()),
            dataCache: Array.from(this.dataCache.entries())
        };
    }
}

// Global instance
window.DataBindingEngine = DataBindingEngine;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dataBindingEngine = new DataBindingEngine();
    });
} else {
    window.dataBindingEngine = new DataBindingEngine();
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataBindingEngine;
}
