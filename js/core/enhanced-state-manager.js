/**
 * Enhanced State Manager
 * Extends the existing state manager with improved functionality
 */

import { stateManager as BaseStateManager } from '../services/state-manager.js';
import { performanceMonitor } from '../utils/performance-monitor.js';

class EnhancedStateManager {
    constructor() {
        // Use the existing singleton instance
        this.baseManager = BaseStateManager;
        
        // Additional properties for enhanced functionality
        this.pendingActions = new Set();
        this.batchMode = false;
        this.queuedNotifications = [];
        this.componentMeta = new Map();
        
        // Copy existing state if any
        this.state = this.baseManager.state || {
            components: {},
            metadata: {
                title: 'My Media Kit',
                theme: 'default',
                lastModified: new Date().toISOString()
            },
            layout: [] // **FIX**: Ensure layout array exists from the start
        };
        
        this.listeners = this.baseManager.listeners || new Map();
        this.globalListeners = this.baseManager.globalListeners || new Set();
        this.history = this.baseManager.history || [];
        this.historyIndex = this.baseManager.historyIndex || -1;
        this.maxHistorySize = this.baseManager.maxHistorySize || 50;
        
        // Proxy the base manager methods
        this.setupProxy();
        
        // **FIX**: Ensure base manager state also has layout
        if (!this.baseManager.state.layout) {
            this.baseManager.state.layout = [];
        }
    }
    
    /**
     * Setup proxy to intercept and enhance base manager methods
     */
    setupProxy() {
        // Methods to proxy directly
        const proxyMethods = [
            'subscribe', 'subscribeGlobal', 'getState', 'getSerializableState',
            'updateMetadata', 'undo', 'redo', 'clearState', 'getComponentSetting',
            'saveHistory', 'cloneState', 'restoreState',
            'notifyListeners', 'notifyGlobalListeners', 'loadState'
        ];
        
        proxyMethods.forEach(method => {
            if (this.baseManager[method]) {
                this[method] = (...args) => this.baseManager[method](...args);
            }
        });
    }
    
    /**
     * Enhanced initComponent with meta support
     */
    initComponent(componentId, componentType, initialData = {}, skipNotification = false) {
        console.log(`EnhancedStateManager: initComponent - ID: ${componentId}, Type: ${componentType}`);
        
        // Initialize component meta
        this.componentMeta.set(componentId, {
            isDeleting: false,
            isMoving: false,
            isDirty: false,
            lastModified: Date.now()
        });
        
        // Call base implementation
        return this.baseManager.initComponent(componentId, componentType, initialData, skipNotification);
    }
    
    /**
     * Enhanced updateComponent with meta tracking
     */
    updateComponent(componentId, key, value) {
        // Update meta
        const meta = this.componentMeta.get(componentId);
        if (meta) {
            meta.isDirty = true;
            meta.lastModified = Date.now();
        }
        
        // Call base implementation
        return this.baseManager.updateComponent(componentId, key, value);
    }
    
    /**
     * Update component meta state
     */
    updateComponentMeta(componentId, updates) {
        const meta = this.componentMeta.get(componentId);
        if (meta) {
            Object.assign(meta, updates);
            this.componentMeta.set(componentId, meta);
            
            // Notify listeners about meta change
            this.baseManager.notifyListeners(componentId);
        }
    }
    
    /**
     * Get component with meta
     */
    getComponent(componentId) {
        const component = this.baseManager.getComponent(componentId);
        if (component) {
            const meta = this.componentMeta.get(componentId) || {};
            return {
                ...component,
                meta
            };
        }
        return null;
    }
    
    /**
     * Enhanced removeComponent with meta cleanup
     */
    removeComponent(componentId) {
        console.log(`EnhancedStateManager: removeComponent - ${componentId}`);
        
        // Clean up meta
        this.componentMeta.delete(componentId);
        
        // Call base implementation
        return this.baseManager.removeComponent(componentId);
    }
    
    /**
     * Enhanced batch update with proper notification queuing
     */
    async batchUpdate(updateFn) {
        const perfEnd = performanceMonitor.start('state-batch-update');
        
        if (this.batchMode) {
            // Already in batch mode, just execute
            const result = await updateFn();
            perfEnd();
            return result;
        }
        
        this.batchMode = true;
        this.queuedNotifications = [];
        
        // Store the original pause state
        const originalPauseState = this.baseManager.pauseNotifications;
        
        // Pause notifications in the base manager
        this.baseManager.pauseNotifications = true;
        
        // Temporarily override the base manager's notify methods to track what would be notified
        const originalNotifyListeners = this.baseManager.notifyListeners;
        const originalNotifyGlobal = this.baseManager.notifyGlobalListeners;
        
        const notifiedComponents = new Set();
        
        this.baseManager.notifyListeners = (componentId) => {
            notifiedComponents.add(componentId);
            this.queuedNotifications.push({ type: 'component', componentId });
        };
        
        this.baseManager.notifyGlobalListeners = () => {
            this.queuedNotifications.push({ type: 'global' });
        };
        
        try {
            await updateFn();
        } finally {
            // Restore original methods
            this.baseManager.notifyListeners = originalNotifyListeners;
            this.baseManager.notifyGlobalListeners = originalNotifyGlobal;
            this.baseManager.pauseNotifications = originalPauseState;
            
            this.batchMode = false;
            
            // Send one consolidated notification
            if (this.queuedNotifications.length > 0) {
                // Use the bound method to ensure proper 'this' context
                originalNotifyGlobal.call(this.baseManager);
            }
            
            perfEnd();
        }
    }
    
    /**
     * Check if an action is pending
     */
    isPendingAction(action, componentId) {
        const key = `${action}-${componentId}`;
        return this.pendingActions.has(key);
    }
    
    /**
     * Set a pending action
     */
    setPendingAction(action, componentId) {
        const key = `${action}-${componentId}`;
        this.pendingActions.add(key);
        
        // Auto-clear after timeout
        setTimeout(() => {
            this.pendingActions.delete(key);
        }, 1000);
    }
    
    /**
     * Clear a pending action
     */
    clearPendingAction(action, componentId) {
        const key = `${action}-${componentId}`;
        this.pendingActions.delete(key);
    }
    
    /**
     * Get ordered components with meta
     */
    getOrderedComponents() {
        const components = this.baseManager.getOrderedComponents();
        return components.map(component => ({
            ...component,
            meta: this.componentMeta.get(component.id) || {}
        }));
    }
    
    /**
     * Load serialized state with meta support
     */
    loadSerializedState(serializedState, options = {}) {
        const perfEnd = performanceMonitor.start('state-load');
        
        // Clear existing meta
        this.componentMeta.clear();
        
        // Load base state
        this.baseManager.loadSerializedState(serializedState);
        
        // Copy the updated state
        this.state = this.baseManager.state;
        
        // **FIX**: Ensure state has required structure
        if (!this.state.components) this.state.components = {};
        if (!this.state.metadata) this.state.metadata = {};
        if (!Array.isArray(this.state.layout)) {
            // If layout is missing, create it from the component keys ordered by their order property
            console.warn('State loaded without layout array. Reconstructing from components.');
            const orderedComponents = Object.entries(this.state.components)
                .sort((a, b) => (a[1].order || 0) - (b[1].order || 0))
                .map(([id]) => id);
            this.state.layout = orderedComponents;
        }
        
        // Re-sync the base manager's state with the sanitized version
        this.baseManager.state = this.state;
        
        // Initialize meta for loaded components
        Object.keys(this.state.components || {}).forEach(componentId => {
            this.componentMeta.set(componentId, {
                isDeleting: false,
                isMoving: false,
                isDirty: false,
                lastModified: Date.now()
            });
        });
        
        // Handle skipInitialRender option
        if (options.skipInitialRender) {
            // Temporarily disable notifications
            const originalNotify = this.baseManager.notifyGlobalListeners;
            this.baseManager.notifyGlobalListeners = () => {};
            
            // Restore after a tick
            setTimeout(() => {
                this.baseManager.notifyGlobalListeners = originalNotify;
            }, 0);
        }
        
        perfEnd();
    }
    
    /**
     * Replace a drop zone with a component
     */
    replaceDropZone(zoneId, componentId) {
        // This is handled by the component renderer
        // Just trigger a global update
        this.baseManager.notifyGlobalListeners();
    }
    
    /**
     * Add a component with all its data in a single atomic operation
     */
    async addComponent(componentId, componentType, componentData, insertAfterId = null) {
        const perfEnd = performanceMonitor.start('state-add-component', { componentId, componentType });
        
        await this.batchUpdate(async () => {
            // Initialize component meta
            this.componentMeta.set(componentId, {
                isDeleting: false,
                isMoving: false,
                isDirty: false,
                lastModified: Date.now()
            });
            
            // Add component to state with all data in one operation
            this.baseManager.initComponent(componentId, componentType, componentData, true);
            
            // **FIX**: Ensure layout array exists and add the new component
            if (!Array.isArray(this.state.layout)) {
                this.state.layout = this.getOrderedComponents().map(c => c.id);
            }
            
            // Add to layout array
            if (insertAfterId) {
                const afterIndex = this.state.layout.indexOf(insertAfterId);
                if (afterIndex >= 0) {
                    this.state.layout.splice(afterIndex + 1, 0, componentId);
                } else {
                    this.state.layout.push(componentId);
                }
            } else {
                this.state.layout.push(componentId);
            }
            
            // Update component orders to match layout
            this.state.layout.forEach((id, index) => {
                if (this.state.components[id]) {
                    this.state.components[id].order = index;
                }
            });
            
            // **FIX**: Sync layout back to base manager
            this.baseManager.state.layout = [...this.state.layout];
        });
        
        perfEnd();
        return componentId;
    }
    
    /**
     * Update component data (enhanced version)
     */
    updateComponentData(componentId, key, value, skipHistory = false) {
        // Update meta
        const meta = this.componentMeta.get(componentId);
        if (meta) {
            meta.isDirty = true;
            meta.lastModified = Date.now();
        }
        
        // Use base manager's updateComponent method
        return this.baseManager.updateComponent(componentId, key, value);
    }
    
    /**
     * Get state for a specific component
     */
    getStateForComponent(componentId) {
        return this.baseManager.getComponent(componentId);
    }
    
    /**
     * Get the layout array, ensuring it always exists
     */
    getLayout() {
        // Ensure layout exists
        if (!Array.isArray(this.state.layout)) {
            this.state.layout = this.getOrderedComponents().map(c => c.id);
        }
        return [...this.state.layout];
    }
    
    /**
     * Override removeComponent to maintain layout array
     */
    removeComponent(componentId) {
        console.log(`EnhancedStateManager: removeComponent - ${componentId}`);
        
        // Remove from layout array if it exists
        if (Array.isArray(this.state.layout)) {
            const index = this.state.layout.indexOf(componentId);
            if (index > -1) {
                this.state.layout.splice(index, 1);
                // **FIX**: Sync layout back to base manager
                this.baseManager.state.layout = [...this.state.layout];
            }
        }
        
        // Clean up meta
        this.componentMeta.delete(componentId);
        
        // Call base implementation
        return this.baseManager.removeComponent(componentId);
    }
    
    /**
     * Override moveComponent to maintain layout array
     */
    moveComponent(componentId, direction) {
        const layout = this.getLayout();
        const currentIndex = layout.indexOf(componentId);
        
        if (currentIndex === -1) return;
        
        let newIndex;
        if (direction === 'up' && currentIndex > 0) {
            newIndex = currentIndex - 1;
        } else if (direction === 'down' && currentIndex < layout.length - 1) {
            newIndex = currentIndex + 1;
        } else {
            return;
        }
        
        // Remove from current position
        layout.splice(currentIndex, 1);
        // Insert at new position
        layout.splice(newIndex, 0, componentId);
        
        // Update state
        this.state.layout = layout;
        
        // **FIX**: Sync layout back to base manager
        this.baseManager.state.layout = layout;
        
        // Update component orders to match layout
        layout.forEach((id, index) => {
            if (this.state.components[id]) {
                this.state.components[id].order = index;
            }
        });
        
        // Notify listeners
        this.baseManager.notifyGlobalListeners();
    }
    
    /**
     * Override reorderComponents to use layout array
     */
    reorderComponents(componentIds = null) {
        if (componentIds && Array.isArray(componentIds)) {
            // Update layout array
            this.state.layout = [...componentIds];
            
            // **FIX**: Sync layout back to base manager
            this.baseManager.state.layout = this.state.layout;
            
            // Update component orders to match
            componentIds.forEach((id, index) => {
                if (this.state.components[id]) {
                    this.state.components[id].order = index;
                }
            });
        } else {
            // Auto-reorder based on current order
            this.state.layout = this.getOrderedComponents().map(c => c.id);
            this.baseManager.state.layout = this.state.layout;
        }
        
        // Call base implementation to update orders and notify
        this.baseManager.reorderComponents(componentIds || this.state.layout);
    }
    
    /**
     * Override getState to ensure layout is included
     */
    getState() {
        const state = this.baseManager.getState();
        
        // Ensure layout array exists in returned state
        if (!state.layout) {
            state.layout = this.getLayout();
        }
        
        return state;
    }
    
    /**
     * Override getSerializableState to include layout
     */
    getSerializableState() {
        const serializedState = this.baseManager.getSerializableState();
        
        // Add layout array to serialized state
        serializedState.layout = this.getLayout();
        
        return serializedState;
    }
}

// Create and export the enhanced singleton instance
export const enhancedStateManager = new EnhancedStateManager();

// Also export as default for easier imports
export default enhancedStateManager;