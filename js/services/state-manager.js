/**
 * Centralized State Management System
 * Manages all component data and provides Redux-like state management
 */

class StateManager {
    constructor() {
        this.state = {
            components: {},
            metadata: {
                title: 'My Media Kit',
                theme: 'default',
                lastModified: new Date().toISOString()
            }
        };
        
        this.listeners = new Map();
        this.globalListeners = new Set();
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
    }

    /**
     * Initialize a component in the state
     * @param {string} componentId - Unique component instance ID
     * @param {string} componentType - Component type
     * @param {Object} initialData - Initial component data
     */
    initComponent(componentId, componentType, initialData = {}, skipNotification = false) {
        console.log(`StateManager: initComponent called - ID: ${componentId}, Type: ${componentType}, Skip: ${skipNotification}`);
        
        this.state.components[componentId] = {
            type: componentType,
            data: { ...initialData },
            order: Object.keys(this.state.components).length
        };
        
        if (!skipNotification) {
            this.notifyListeners(componentId);
            this.saveHistory('component_added', { componentId, componentType });
        }
    }

    /**
     * Update a component's data
     * @param {string} componentId - Component ID
     * @param {string|Object} key - Setting key or object of updates
     * @param {*} value - New value (if key is string)
     */
    updateComponent(componentId, key, value) {
        if (!this.state.components[componentId]) return;
        
        const previousData = { ...this.state.components[componentId].data };
        
        if (typeof key === 'object') {
            // Batch update
            this.state.components[componentId].data = {
                ...this.state.components[componentId].data,
                ...key
            };
        } else {
            // Single update
            this.state.components[componentId].data[key] = value;
        }
        
        this.notifyListeners(componentId);
        this.saveHistory('component_updated', {
            componentId,
            previousData,
            newData: this.state.components[componentId].data
        });
    }

    /**
     * Get component data
     * @param {string} componentId - Component ID
     * @returns {Object|null} Component data
     */
    getComponent(componentId) {
        return this.state.components[componentId] || null;
    }

    /**
     * Get a specific setting from a component
     * @param {string} componentId - Component ID
     * @param {string} settingKey - Setting key
     * @returns {*} Setting value
     */
    getComponentSetting(componentId, settingKey) {
        const component = this.getComponent(componentId);
        return component ? component.data[settingKey] : null;
    }

    /**
     * Remove a component from state
     * @param {string} componentId - Component ID
     */
    removeComponent(componentId) {
        if (!this.state.components[componentId]) return;
        
        const componentData = { ...this.state.components[componentId] };
        delete this.state.components[componentId];
        
        // Reorder remaining components
        this.reorderComponents();
        
        this.notifyGlobalListeners();
        this.saveHistory('component_removed', { componentId, componentData });
    }

    /**
     * Reorder components
     * @param {Array<string>} componentIds - Ordered array of component IDs
     */
    reorderComponents(componentIds = null) {
        if (componentIds) {
            componentIds.forEach((id, index) => {
                if (this.state.components[id]) {
                    this.state.components[id].order = index;
                }
            });
        } else {
            // Auto-reorder based on current order
            Object.keys(this.state.components)
                .sort((a, b) => this.state.components[a].order - this.state.components[b].order)
                .forEach((id, index) => {
                    this.state.components[id].order = index;
                });
        }
        
        this.notifyGlobalListeners();
        this.saveHistory('components_reordered', { componentIds });
    }

    /**
     * Get all components in order
     * @returns {Array} Ordered array of components with IDs
     */
    getOrderedComponents() {
        return Object.entries(this.state.components)
            .sort((a, b) => a[1].order - b[1].order)
            .map(([id, component]) => ({
                id,
                ...component
            }));
    }

    /**
     * Subscribe to component state changes
     * @param {string} componentId - Component ID to watch
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribe(componentId, callback) {
        if (!this.listeners.has(componentId)) {
            this.listeners.set(componentId, new Set());
        }
        
        this.listeners.get(componentId).add(callback);
        
        // Return unsubscribe function
        return () => {
            const listeners = this.listeners.get(componentId);
            if (listeners) {
                listeners.delete(callback);
                if (listeners.size === 0) {
                    this.listeners.delete(componentId);
                }
            }
        };
    }

    /**
     * Subscribe to all state changes
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribeGlobal(callback) {
        this.globalListeners.add(callback);
        
        return () => {
            this.globalListeners.delete(callback);
        };
    }

    /**
     * Notify component-specific listeners
     * @param {string} componentId - Component ID
     */
    notifyListeners(componentId) {
        const component = this.getComponent(componentId);
        if (!component) return;
        
        const listeners = this.listeners.get(componentId);
        if (listeners) {
            listeners.forEach(callback => {
                callback(component.data, component);
            });
        }
        
        // Also notify global listeners
        this.notifyGlobalListeners();
    }

    /**
     * Notify global listeners
     */
    notifyGlobalListeners() {
        // Skip if notifications are paused
        if (this.pauseNotifications) {
            return;
        }
        
        this.globalListeners.forEach(callback => {
            callback(this.state);
        });
    }
    
    /**
     * Batch update components
     * @param {Function} updateFn - Function that performs multiple updates
     */
    async batchUpdate(updateFn) {
        // Pause notifications
        this.pauseNotifications = true;
        
        try {
            // Execute the update function
            await updateFn();
        } finally {
            // Resume notifications
            this.pauseNotifications = false;
            
            // Trigger a single notification for all changes
            this.notifyGlobalListeners();
        }
    }

    /**
     * Save state to history for undo/redo
     * @param {string} action - Action type
     * @param {Object} data - Action data
     */
    saveHistory(action, data) {
        // Remove any history after current index
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // Add new history entry
        this.history.push({
            action,
            data,
            state: this.cloneState(),
            timestamp: new Date().toISOString()
        });
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history = this.history.slice(-this.maxHistorySize);
        }
        
        this.historyIndex = this.history.length - 1;
    }

    /**
     * Undo last action
     * @returns {boolean} Success
     */
    undo() {
        if (this.historyIndex <= 0) return false;
        
        this.historyIndex--;
        const historyEntry = this.history[this.historyIndex];
        this.restoreState(historyEntry.state);
        
        return true;
    }

    /**
     * Redo last undone action
     * @returns {boolean} Success
     */
    redo() {
        if (this.historyIndex >= this.history.length - 1) return false;
        
        this.historyIndex++;
        const historyEntry = this.history[this.historyIndex];
        this.restoreState(historyEntry.state);
        
        return true;
    }

    /**
     * Clone current state
     * @returns {Object} Cloned state
     */
    cloneState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    /**
     * Restore state from history
     * @param {Object} state - State to restore
     */
    restoreState(state) {
        this.state = this.cloneState.call({ state });
        
        // Notify all listeners
        Object.keys(this.state.components).forEach(componentId => {
            this.notifyListeners(componentId);
        });
        this.notifyGlobalListeners();
    }

    /**
     * Get full state
     * @returns {Object} Complete state
     */
    getState() {
        return this.cloneState();
    }

    /**
     * Load state from saved data
     * @param {Object} savedState - Saved state object
     */
    loadState(savedState) {
        this.state = this.cloneState.call({ state: savedState });
        this.history = [];
        this.historyIndex = -1;
        
        // Notify all listeners
        Object.keys(this.state.components).forEach(componentId => {
            this.notifyListeners(componentId);
        });
        this.notifyGlobalListeners();
    }

    /**
     * Update metadata
     * @param {Object} metadata - Metadata updates
     */
    updateMetadata(metadata) {
        this.state.metadata = {
            ...this.state.metadata,
            ...metadata,
            lastModified: new Date().toISOString()
        };
        
        this.notifyGlobalListeners();
    }

    /**
     * Get a serializable version of the state for saving
     * @returns {Object} Serializable state
     */
    getSerializableState() {
        return {
            version: '1.0.0',
            metadata: this.state.metadata,
            components: Object.entries(this.state.components).map(([id, component]) => ({
                id,
                type: component.type,
                order: component.order,
                data: component.data
            }))
        };
    }

    /**
     * Load from serialized state
     * @param {Object} serializedState - Serialized state
     */
    loadSerializedState(serializedState) {
        const state = {
            metadata: serializedState.metadata || {},
            components: {}
        };
        
        // Reconstruct components
        (serializedState.components || []).forEach(component => {
            state.components[component.id] = {
                type: component.type,
                order: component.order,
                data: component.data
            };
        });
        
        this.loadState(state);
    }

    /**
     * Clear all state
     */
    clearState() {
        this.state = {
            components: {},
            metadata: {
                title: 'My Media Kit',
                theme: 'default',
                lastModified: new Date().toISOString()
            }
        };
        
        this.history = [];
        this.historyIndex = -1;
        
        this.notifyGlobalListeners();
    }
}

// Export singleton instance
export const stateManager = new StateManager();