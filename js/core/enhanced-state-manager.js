/**
 * Enhanced State Manager
 * Extends the existing state manager with improved functionality
 */

import { stateManager as BaseStateManager } from '../services/state-manager.js';

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
            }
        };
        
        this.listeners = this.baseManager.listeners || new Map();
        this.globalListeners = this.baseManager.globalListeners || new Set();
        this.history = this.baseManager.history || [];
        this.historyIndex = this.baseManager.historyIndex || -1;
        this.maxHistorySize = this.baseManager.maxHistorySize || 50;
        
        // Proxy the base manager methods
        this.setupProxy();
    }
    
    /**
     * Setup proxy to intercept and enhance base manager methods
     */
    setupProxy() {
        // Methods to proxy directly
        const proxyMethods = [
            'subscribe', 'subscribeGlobal', 'getState', 'getSerializableState',
            'updateMetadata', 'undo', 'redo', 'clearState', 'getComponentSetting',
            'reorderComponents', 'saveHistory', 'cloneState', 'restoreState',
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
        if (this.batchMode) {
            // Already in batch mode, just execute
            return await updateFn();
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
        // Clear existing meta
        this.componentMeta.clear();
        
        // Load base state
        this.baseManager.loadSerializedState(serializedState);
        
        // Copy the updated state
        this.state = this.baseManager.state;
        
        // Initialize meta for loaded components
        const state = this.baseManager.getState();
        Object.keys(state.components || {}).forEach(componentId => {
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
    }
    
    /**
     * Replace a drop zone with a component
     */
    replaceDropZone(zoneId, componentId) {
        // This is handled by the component renderer
        // Just trigger a global update
        this.baseManager.notifyGlobalListeners();
    }
}

// Create and export the enhanced singleton instance
export const enhancedStateManager = new EnhancedStateManager();

// Also export as default for easier imports
export default enhancedStateManager;