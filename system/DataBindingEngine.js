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
     * Handle forced component rerender from options UI
     * PHASE 2: Real-time configuration updates
     */
    handleForceRerender(detail) {
        const { componentId, componentData } = detail;
        
        if (this.bindings.has(componentId)) {
            // Re-bind data with current configuration
            const bindingInfo = this.bindings.get(componentId);
            const newBoundData = this.bindComponentData(
                componentId,
                bindingInfo.componentType,
                bindingInfo.dataBindings,
                componentData.props || componentData.data
            );
            
            // Dispatch update for component renderer
            this.dispatchDataBindingUpdate(componentId, newBoundData);
            
            this.logger.info('DATA_BINDING', `🔄 [PHASE 2] Forced rerender for ${componentId}`);
        }
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
        
        // PHASE 2: Listen for forced component rerenders
        document.addEventListener('gmkb:force-component-rerender', (event) => {
            this.handleForceRerender(event.detail);
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
     * ROOT FIX: Preserve existing component data when re-binding
     */
    bindComponentData(componentId, componentType, dataBindings, sourceData = null) {
        if (!window.componentConfigurationManager) {
            this.logger.warn('⚠️ PHASE 2: ComponentConfigurationManager not available');
            return sourceData || {}; // ROOT FIX: Return source data if no config
        }
        
        const schema = window.componentConfigurationManager.getSchema(componentType);
        if (!schema || !schema.dataBindings) {
            this.logger.warn(`⚠️ PHASE 2: No data bindings found for ${componentType}`);
            return sourceData || {}; // ROOT FIX: Return source data if no schema
        }
        
        // ROOT FIX: Get existing component data from state first
        const existingComponentData = this.getExistingComponentData(componentId);
        
        // Use provided data, existing data, or get from cache/global data
        const data = sourceData || existingComponentData || this.getDataForBinding(componentId);
        if (!data) {
            this.logger.warn(`⚠️ PHASE 2: No source data available for ${componentId}`);
            // ROOT FIX: Return existing data if available, otherwise empty object
            return existingComponentData || {};
        }
        
        const bindings = dataBindings || schema.dataBindings;
        
        // ROOT FIX: First, preserve all existing data
        const boundData = { ...data };
        
        // Process each data binding, only override if we have new data
        Object.entries(bindings).forEach(([componentProp, dataField]) => {
            const value = this.resolveDataField(data, dataField);
            if (value !== undefined && value !== null) {
                boundData[componentProp] = value;
            } else if (!boundData[componentProp]) {
                // Only set default if no existing value
                this.logger.debug(`📊 PHASE 2: No data found for field ${dataField} in ${componentId}`);
                boundData[componentProp] = this.getDefaultValue(componentProp, componentType);
            }
            // If boundData already has this property, keep it (preserve existing data)
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
     * ROOT FIX: Update binding for a specific field
     * Called by ComponentOptionsUI when user changes data binding
     */
    updateBinding(componentId, field, source) {
        const bindingInfo = this.bindings.get(componentId);
        if (!bindingInfo) {
            this.logger.warn(`⚠️ PHASE 2: No binding info found for ${componentId}`);
            return;
        }
        
        // Update the specific field binding
        if (!bindingInfo.dataBindings) {
            bindingInfo.dataBindings = {};
        }
        bindingInfo.dataBindings[field] = source;
        
        // Save updated binding
        this.bindings.set(componentId, bindingInfo);
        
        // Refresh component with new binding
        this.refreshComponent(componentId);
        
        this.logger.info(`🔄 PHASE 2: Updated binding for ${field} to ${source} in ${componentId}`);
    }
    
    /**
     * ROOT FIX: Remove binding for a specific field
     * Called by ComponentOptionsUI when user removes data binding
     */
    removeBinding(componentId, field) {
        const bindingInfo = this.bindings.get(componentId);
        if (!bindingInfo || !bindingInfo.dataBindings) {
            this.logger.warn(`⚠️ PHASE 2: No binding info found for ${componentId}`);
            return;
        }
        
        // Remove the specific field binding
        delete bindingInfo.dataBindings[field];
        
        // Save updated binding
        this.bindings.set(componentId, bindingInfo);
        
        // Refresh component with updated binding
        this.refreshComponent(componentId);
        
        this.logger.info(`🗑️ PHASE 2: Removed binding for ${field} in ${componentId}`);
    }
    
    /**
     * ROOT FIX: Get test data for testing bindings
     * Called by ComponentOptionsUI when user clicks "Test Bindings"
     */
    getTestData() {
        return {
            // Personal data
            first_name: 'John',
            last_name: 'Doe',
            full_name: 'John Doe',
            guest_title: 'Senior Marketing Expert',
            tagline: 'Transforming Brands Through Digital Innovation',
            
            // Biography data
            biography: 'John Doe is a seasoned marketing professional with over 15 years of experience in digital marketing, brand strategy, and customer engagement. He has helped Fortune 500 companies transform their digital presence and achieve remarkable growth.',
            biography_short: 'Marketing expert with 15+ years transforming brands through digital innovation.',
            
            // Contact data
            email: 'john.doe@example.com',
            phone: '+1 (555) 123-4567',
            website: 'https://johndoe.com',
            
            // Social media
            twitter: '@johndoe',
            linkedin: 'linkedin.com/in/johndoe',
            facebook: 'facebook.com/johndoe',
            instagram: '@johndoe',
            
            // Topics/expertise
            topics: [
                'Digital Marketing Strategy',
                'Brand Transformation',
                'Customer Experience',
                'Marketing Analytics',
                'Social Media Marketing'
            ],
            topic_1: 'Digital Marketing Strategy',
            topic_2: 'Brand Transformation',
            topic_3: 'Customer Experience',
            topic_4: 'Marketing Analytics',
            topic_5: 'Social Media Marketing',
            
            // Questions
            questions: [
                'How can brands adapt to the digital age?',
                'What are the key metrics for marketing success?',
                'How to build customer loyalty in 2024?'
            ],
            question_1: 'How can brands adapt to the digital age?',
            question_2: 'What are the key metrics for marketing success?',
            question_3: 'How to build customer loyalty in 2024?',
            
            // Media
            guest_headshot: 'https://via.placeholder.com/400x400/4F46E5/ffffff?text=JD',
            profile_image: 'https://via.placeholder.com/400x400/4F46E5/ffffff?text=JD',
            featured_image: 'https://via.placeholder.com/1920x1080/4F46E5/ffffff?text=Featured',
            
            // Call to action
            cta_button_text: 'Book John for Your Event',
            cta_button_link: 'https://example.com/book',
            
            // Company/organization
            company: 'Digital Innovation Co.',
            position: 'Chief Marketing Officer',
            organization: 'Marketing Leaders Association'
        };
    }
    
    /**
     * ROOT FIX: Apply bindings with provided data
     * Called by ComponentOptionsUI to test bindings with sample data
     */
    applyBindings(componentId, testData) {
        const bindingInfo = this.bindings.get(componentId);
        if (!bindingInfo) {
            this.logger.warn(`⚠️ PHASE 2: No binding info found for ${componentId}`);
            return;
        }
        
        // Apply bindings with test data
        const boundData = this.bindComponentData(
            componentId,
            bindingInfo.componentType,
            bindingInfo.dataBindings,
            testData
        );
        
        // Update component with test data
        if (window.enhancedStateManager) {
            window.enhancedStateManager.dispatch({
                type: 'UPDATE_COMPONENT',
                payload: {
                    id: componentId,
                    updates: {
                        props: boundData
                    }
                }
            });
            
            // Trigger component re-render
            document.dispatchEvent(new CustomEvent('gmkb:component-updated', {
                detail: {
                    componentId: componentId,
                    props: boundData,
                    isTestData: true
                }
            }));
        }
        
        this.logger.info(`🧪 PHASE 2: Applied test bindings for ${componentId}`);
    }
    
    /**
     * ROOT FIX: Refresh component with current bindings
     * Called when bindings are updated
     */
    refreshComponent(componentId) {
        const bindingInfo = this.bindings.get(componentId);
        if (!bindingInfo) {
            this.logger.warn(`⚠️ PHASE 2: No binding info found for ${componentId}`);
            return;
        }
        
        // Re-apply bindings with current data
        const boundData = this.bindComponentData(
            componentId,
            bindingInfo.componentType,
            bindingInfo.dataBindings
        );
        
        // Update component
        if (window.enhancedStateManager) {
            window.enhancedStateManager.dispatch({
                type: 'UPDATE_COMPONENT',
                payload: {
                    id: componentId,
                    updates: {
                        props: boundData
                    }
                }
            });
            
            // Trigger component re-render
            document.dispatchEvent(new CustomEvent('gmkb:component-updated', {
                detail: {
                    componentId: componentId,
                    props: boundData,
                    refreshed: true
                }
            }));
        }
        
        this.logger.info(`🔄 PHASE 2: Refreshed component ${componentId} with current bindings`);
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
     * ROOT FIX: Get existing component data from state manager
     */
    getExistingComponentData(componentId) {
        try {
            if (window.enhancedStateManager) {
                const state = window.enhancedStateManager.getState();
                if (state && state.components && state.components[componentId]) {
                    const component = state.components[componentId];
                    // Return the existing props/data
                    return component.props || component.data || {};
                }
            }
        } catch (error) {
            this.logger.warn(`⚠️ PHASE 2: Error getting existing component data: ${error.message}`);
        }
        return null;
    }
    
    /**
     * Get data for binding from various sources
     * ROOT FIX: Check existing component data first
     */
    getDataForBinding(componentId) {
        // ROOT FIX: Check existing component data first
        const existingData = this.getExistingComponentData(componentId);
        if (existingData && Object.keys(existingData).length > 0) {
            return existingData;
        }
        
        // Check cache
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
     * Remove bindings for component (complete removal)
     * This is for when a component is deleted entirely
     */
    removeComponentBindings(componentId) {
        const removed = this.bindings.delete(componentId);
        if (removed) {
            this.logger.info(`🗑️ PHASE 2: Removed all bindings for ${componentId}`);
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
