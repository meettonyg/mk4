/**
 * @file enhanced-state-manager.js
 * @description Manages the application state with a more robust and scalable approach.
 * It provides a centralized store for the media kit's layout and component data,
 * with subscription-based updates to notify different parts of the application about changes.
 *
 * This version includes a critical fix to remove a circular dependency where the state manager
 * was incorrectly importing and calling the renderer directly.
 */

import {
    showToast
} from '../utils/toast-polyfill.js';
import {
    saveService
} from '../services/save-service.js';

// FIX: Removed the import for enhancedComponentRenderer to break the circular dependency.
// The state manager should not be aware of the renderer. The renderer subscribes to the state manager instead.

class EnhancedStateManager {
    constructor() {
        this.state = {
            layout: [],
            components: {},
            globalSettings: {}
        };
        this.subscribers = [];
        this.transactionQueue = [];
        this.isBatching = false;
        console.log('EnhancedStateManager initialized');
    }

    /**
     * Subscribes a callback function to state changes.
     * @param {Function} callback - The function to call when the state changes.
     * @returns {Function} A function to unsubscribe.
     */
    subscribeGlobal(callback) {
        this.subscribers.push(callback);
        // Immediately call with current state
        try {
            callback(this.state);
        } catch (e) {
            console.error('Error in initial state subscriber callback:', e);
        }

        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }

    /**
     * Notifies all subscribers of a state change.
     */
    notifySubscribers() {
        console.log('Notifying subscribers of state change.');
        this.subscribers.forEach(callback => {
            try {
                callback(this.state);
            } catch (e) {
                console.error('Error in subscriber callback:', e);
            }
        });
    }

    /**
     * Gets a deep copy of the current state.
     * @returns {object} The current state.
     */
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    /**
     * Gets the layout array.
     * @returns {string[]} An array of component IDs.
     */
    getLayout() {
        return this.state.layout;
    }

    /**
     * Gets the components object.
     * @returns {object} The components object.
     */
    getComponents() {
        return Object.values(this.state.components);
    }

    /**
     * Gets a single component's data.
     * @param {string} componentId - The ID of the component.
     * @returns {object|null} The component data or null.
     */
    getComponent(componentId) {
        return this.state.components[componentId] || null;
    }

    /**
     * Starts a batch update. All state changes will be queued until endBatchUpdate is called.
     */
    startBatchUpdate() {
        this.isBatching = true;
    }

    /**
     * Ends a batch update and processes the queue of state changes.
     */
    endBatchUpdate() {
        this.isBatching = false;
        this.processTransactionQueue();
    }

    /**
     * Processes the queue of transactions, applying them to the state.
     */
    processTransactionQueue() {
        if (this.transactionQueue.length === 0) return;

        this.transactionQueue.forEach(transaction => {
            this.applyTransaction(transaction, true);
        });

        this.transactionQueue = [];
        this.notifySubscribers();
        saveService.saveState(this.state);
    }

    /**
     * Applies a transaction to the state.
     * @param {object} transaction - The transaction object.
     * @param {boolean} [batch=false] - Whether this is part of a batch update.
     */
    applyTransaction(transaction, batch = false) {
        if (this.isBatching && !batch) {
            this.transactionQueue.push(transaction);
            return;
        }

        switch (transaction.type) {
            case 'ADD_COMPONENT':
                this.state.components[transaction.payload.id] = transaction.payload;
                this.state.layout.push(transaction.payload.id);
                break;
            case 'REMOVE_COMPONENT':
                delete this.state.components[transaction.payload];
                this.state.layout = this.state.layout.filter(id => id !== transaction.payload);
                break;
            case 'UPDATE_COMPONENT':
                {
                    const {
                        componentId,
                        newProps
                    } = transaction.payload;
                    if (this.state.components[componentId]) {
                        this.state.components[componentId].props = {
                            ...this.state.components[componentId].props,
                            ...newProps
                        };
                    }
                    break;
                }
            case 'MOVE_COMPONENT':
                {
                    const {
                        componentId,
                        direction
                    } = transaction.payload;
                    const index = this.state.layout.indexOf(componentId);
                    if (index === -1) break;

                    if (direction === 'up' && index > 0) {
                        [this.state.layout[index], this.state.layout[index - 1]] = [this.state.layout[index - 1], this.state.layout[index]];
                    } else if (direction === 'down' && index < this.state.layout.length - 1) {
                        [this.state.layout[index], this.state.layout[index + 1]] = [this.state.layout[index + 1], this.state.layout[index]];
                    }
                    break;
                }
            case 'SET_LAYOUT':
                this.state.layout = transaction.payload;
                break;
            case 'SET_STATE':
                this.state = transaction.payload;
                break;
            case 'UPDATE_GLOBAL_SETTINGS':
                this.state.globalSettings = { ...this.state.globalSettings,
                    ...transaction.payload
                };
                break;
        }

        if (!this.isBatching) {
            this.notifySubscribers();
            saveService.saveState(this.state);
        }
    }


    /**
     * Sets the initial state of the application, often from a loaded template or localStorage.
     * @param {object} initialData - The full state object to load.
     */
    async setInitialState(initialData) {
        if (!initialData || typeof initialData !== 'object') {
            console.warn('setInitialState received invalid data. Initializing with default empty state.');
            this.state = {
                layout: [],
                components: {},
                globalSettings: {}
            };
        } else {
            this.state = {
                layout: initialData.layout || [],
                components: initialData.components || {},
                globalSettings: initialData.globalSettings || {}
            };
        }

        console.log('Initial state set:', this.state);

        // Notify subscribers about the new state. The renderer, which subscribes
        // during its own init phase, will pick up this change and render the initial layout.
        this.notifySubscribers();
    }


    /**
     * Loads a serialized state and reconstructs the layout if missing.
     * @param {string} serializedState - The JSON string of the state.
     */
    loadSerializedState(serializedState) {
        try {
            const loadedData = JSON.parse(serializedState);
            this.state.components = loadedData.components || {};
            this.state.globalSettings = loadedData.globalSettings || {};

            if (loadedData.layout && Array.isArray(loadedData.layout)) {
                this.state.layout = loadedData.layout;
            } else {
                console.warn('State loaded without layout array. Reconstructing from components.');
                this.state.layout = Object.keys(this.state.components);
            }
            this.notifySubscribers();
        } catch (error) {
            console.error('Error parsing serialized state:', error);
            showToast('Could not load saved data. It might be corrupted.', 'error');
        }
    }

    // Action creators - these create transaction objects to be dispatched

    addComponent(component) {
        this.applyTransaction({
            type: 'ADD_COMPONENT',
            payload: component
        });
    }

    removeComponent(componentId) {
        console.log(`EnhancedStateManager: removeComponent - ${componentId}`);
        this.applyTransaction({
            type: 'REMOVE_COMPONENT',
            payload: componentId
        });
    }

    updateComponent(componentId, newProps) {
        this.applyTransaction({
            type: 'UPDATE_COMPONENT',
            payload: {
                componentId,
                newProps
            }
        });
    }

    moveComponent(componentId, direction) {
        this.applyTransaction({
            type: 'MOVE_COMPONENT',
            payload: {
                componentId,
                direction
            }
        });
    }

    setLayout(newLayout) {
        this.applyTransaction({
            type: 'SET_LAYOUT',
            payload: newLayout
        });
    }

    updateGlobalSettings(newSettings) {
        this.applyTransaction({
            type: 'UPDATE_GLOBAL_SETTINGS',
            payload: newSettings
        });
    }
}

// Export a single instance to act as a singleton
export const enhancedStateManager = new EnhancedStateManager();
