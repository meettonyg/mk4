/**
 * Data-Only State Management
 * PHASE 2: Component Communication Redesign - Clean State Management
 * 
 * Separates data from UI state, only persisting essential fields
 * Reduces state size from 260KB+ to <1KB per component
 * 
 * @version 1.0.0
 * @package GMKB/Core
 * 
 * ARCHITECTURAL PRINCIPLES:
 * - Data-only persistence (no UI state)
 * - Minimal field storage
 * - Clean separation of concerns
 * - Event-driven updates
 */

(function(window) {
    'use strict';
    
    const logger = window.structuredLogger || console;
    
    /**
     * DataState - Clean state management for components
     * Only stores essential data, no metadata or UI state
     */
    class DataState {
        constructor() {
            this.components = new Map();
            this.sections = new Map();
            this.layout = [];
            
            // Track state size for monitoring
            this.lastStateSize = 0;
            
            logger.info('DATA_STATE', 'Data-only state manager initialized');
        }
        
        /**
         * Add or update a component with ONLY essential data
         */
        setComponent(componentId, componentData) {
            if (!componentId) {
                logger.error('DATA_STATE', 'Cannot set component without ID');
                return false;
            }
            
            // Extract ONLY essential fields
            const cleanData = this.extractEssentialData(componentData);
            
            // Store the clean data
            this.components.set(componentId, cleanData);
            
            // Emit event for state change
            this.emitStateChange('component:updated', {
                componentId,
                data: cleanData
            });
            
            // Log size reduction
            this.logSizeReduction(componentData, cleanData);
            
            return true;
        }
        
        /**
         * Extract only essential data fields from component
         * This is the KEY to reducing state size
         */
        extractEssentialData(componentData) {
            // Start with absolute minimum
            const essential = {
                id: componentData.id || componentData.componentId,
                type: componentData.type || componentData.componentType,
                sectionId: componentData.sectionId || null
            };
            
            // Add actual content data (not metadata)
            if (componentData.data) {
                essential.data = this.cleanDataObject(componentData.data);
            } else if (componentData.props) {
                essential.data = this.cleanDataObject(componentData.props);
            }
            
            return essential;
        }
        
        /**
         * Clean data object by removing all metadata and keeping only content
         */
        cleanDataObject(data) {
            if (!data || typeof data !== 'object') {
                return {};
            }
            
            const cleaned = {};
            
            // List of metadata fields to EXCLUDE
            const metadataFields = [
                'timestamp', 'enrichmentTimestamp', 'lastModified', 'createdAt',
                'updatedAt', 'loaded_topics', 'topics_count', 'has_topics',
                'data_source', 'podsDataLoaded', 'dragDropCreated', 'isLoading',
                'isError', 'error', 'loading', 'loaded', 'initialized', 'ready',
                '_internal', '_meta', '_ui', '_temp', '_cache', '_state'
            ];
            
            // Only keep actual content fields
            Object.keys(data).forEach(key => {
                // Skip metadata fields
                if (metadataFields.includes(key)) {
                    return;
                }
                
                // Skip internal/private fields
                if (key.startsWith('_')) {
                    return;
                }
                
                // Skip UI-related fields
                if (key.includes('loading') || key.includes('error') || 
                    key.includes('timestamp') || key.includes('cache')) {
                    return;
                }
                
                // Keep the actual data
                const value = data[key];
                
                // For nested objects, clean them too
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    cleaned[key] = this.cleanDataObject(value);
                } else {
                    cleaned[key] = value;
                }
            });
            
            return cleaned;
        }
        
        /**
         * Get component data
         */
        getComponent(componentId) {
            return this.components.get(componentId) || null;
        }
        
        /**
         * Remove a component
         */
        removeComponent(componentId) {
            const existed = this.components.has(componentId);
            this.components.delete(componentId);
            
            if (existed) {
                this.emitStateChange('component:removed', { componentId });
            }
            
            return existed;
        }
        
        /**
         * Get all components as a clean object (for persistence)
         */
        getStateForPersistence() {
            const state = {
                components: {},
                layout: this.layout,
                sections: {}
            };
            
            // Convert Map to object for components
            this.components.forEach((data, id) => {
                state.components[id] = data;
            });
            
            // Convert Map to object for sections
            this.sections.forEach((data, id) => {
                state.sections[id] = data;
            });
            
            return state;
        }
        
        /**
         * Load state from persistence
         */
        loadFromPersistence(persistedState) {
            if (!persistedState) return;
            
            // Clear current state
            this.components.clear();
            this.sections.clear();
            this.layout = [];
            
            // Load components
            if (persistedState.components) {
                Object.entries(persistedState.components).forEach(([id, data]) => {
                    // Clean the data again to ensure no bloat
                    const cleaned = this.extractEssentialData(data);
                    this.components.set(id, cleaned);
                });
            }
            
            // Load sections
            if (persistedState.sections) {
                Object.entries(persistedState.sections).forEach(([id, data]) => {
                    this.sections.set(id, data);
                });
            }
            
            // Load layout
            if (Array.isArray(persistedState.layout)) {
                this.layout = persistedState.layout;
            }
            
            logger.info('DATA_STATE', `Loaded state with ${this.components.size} components`);
        }
        
        /**
         * Get current state size in bytes
         */
        getStateSize() {
            const state = this.getStateForPersistence();
            const json = JSON.stringify(state);
            return new Blob([json]).size;
        }
        
        /**
         * Log size reduction for monitoring
         */
        logSizeReduction(original, cleaned) {
            const originalSize = new Blob([JSON.stringify(original)]).size;
            const cleanedSize = new Blob([JSON.stringify(cleaned)]).size;
            const reduction = Math.round((1 - cleanedSize / originalSize) * 100);
            
            if (reduction > 0) {
                logger.info('DATA_STATE', 
                    `Size reduced by ${reduction}% (${originalSize}B → ${cleanedSize}B)`
                );
            }
            
            // Track total state size
            const totalSize = this.getStateSize();
            logger.debug('DATA_STATE', `Total state size: ${totalSize} bytes`);
            
            // Warn if state is getting large
            if (totalSize > 50000) { // 50KB warning threshold
                logger.warn('DATA_STATE', 
                    `State size exceeding 50KB (${totalSize} bytes). Consider cleanup.`
                );
            }
        }
        
        /**
         * Emit state change event
         */
        emitStateChange(eventType, detail) {
            document.dispatchEvent(new CustomEvent(`data-state:${eventType}`, {
                detail: {
                    ...detail,
                    stateSize: this.getStateSize(),
                    timestamp: Date.now()
                }
            }));
        }
        
        /**
         * Clear all state
         */
        clear() {
            this.components.clear();
            this.sections.clear();
            this.layout = [];
            this.emitStateChange('cleared', {});
            logger.info('DATA_STATE', 'State cleared');
        }
        
        /**
         * Get statistics about current state
         */
        getStats() {
            return {
                componentCount: this.components.size,
                sectionCount: this.sections.size,
                layoutItems: this.layout.length,
                totalSizeBytes: this.getStateSize(),
                averageComponentSize: this.components.size > 0 ? 
                    Math.round(this.getStateSize() / this.components.size) : 0
            };
        }
        
        /**
         * Validate and clean existing state
         * Useful for migrating from bloated state to clean state
         */
        cleanExistingState(bloatedState) {
            if (!bloatedState || !bloatedState.components) {
                return null;
            }
            
            const cleanState = {
                components: {},
                layout: bloatedState.layout || [],
                sections: bloatedState.sections || {}
            };
            
            // Clean each component
            Object.entries(bloatedState.components).forEach(([id, component]) => {
                cleanState.components[id] = this.extractEssentialData(component);
            });
            
            // Log the cleanup results
            const originalSize = new Blob([JSON.stringify(bloatedState)]).size;
            const cleanSize = new Blob([JSON.stringify(cleanState)]).size;
            const reduction = Math.round((1 - cleanSize / originalSize) * 100);
            
            logger.info('DATA_STATE', 
                `Cleaned existing state: ${reduction}% size reduction (${originalSize}B → ${cleanSize}B)`
            );
            
            return cleanState;
        }
    }
    
    // Create global instance
    window.dataState = new DataState();
    
    // Also export the class for testing
    window.DataState = DataState;
    
    // Log successful load
    logger.info('DATA_STATE', 'Data-only state management loaded');
    
})(window);
