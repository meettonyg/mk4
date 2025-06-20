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
import {
    stateValidator
} from './state-validator.js';
import {
    eventBus
} from './event-bus.js';
import {
    structuredLogger
} from '../utils/structured-logger.js';

// FIX: Removed the import for enhancedComponentRenderer to break the circular dependency.
// The state manager should not be aware of the renderer. The renderer subscribes to the state manager instead.

class EnhancedStateManager {
    constructor() {
        this.state = {
            layout: [],
            components: {},
            globalSettings: {},
            version: '2.0.0'
        };
        this.subscribers = [];
        this.transactionQueue = [];
        this.transactionHistory = [];
        this.isBatching = false;
        this.isValidationEnabled = true;
        this.logger = structuredLogger;
        this.eventBus = eventBus;
        
        // Performance tracking
        this.operationCount = 0;
        this.lastOperationTime = performance.now();
        
        // Debouncing timeouts
        this.subscriberNotificationTimeout = null;
        this.saveTimeout = null;
        
        this.logger.info('STATE', 'Enhanced State Manager initialized with validation and event bus');
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
     * Notifies all subscribers of a state change with performance optimization.
     */
    notifySubscribers() {
        if (this.subscriberNotificationTimeout) {
            clearTimeout(this.subscriberNotificationTimeout);
        }
        
        // Debounce subscriber notifications for performance
        this.subscriberNotificationTimeout = setTimeout(() => {
            const startTime = performance.now();
            
            this.logger.debug('STATE', `Notifying ${this.subscribers.length} subscribers`);
            
            let errorCount = 0;
            this.subscribers.forEach((callback, index) => {
                try {
                    callback(this.state);
                } catch (e) {
                    errorCount++;
                    this.logger.error('STATE', `Subscriber ${index} callback error`, e);
                }
            });
            
            const duration = performance.now() - startTime;
            
            // Track performance
            if (window.mkPerf) {
                window.mkPerf.track('state-notify-subscribers', startTime, {
                    subscriberCount: this.subscribers.length,
                    errorCount
                });
            }
            
            // Emit event for subscriber notifications
            this.eventBus.emit('state:subscribers-notified', {
                subscriberCount: this.subscribers.length,
                errorCount,
                duration
            });
            
            if (duration > 10) {
                this.logger.warn('STATE', `Subscriber notification took ${duration.toFixed(2)}ms (slow)`);
            }
            
            this.subscriberNotificationTimeout = null;
        }, 16); // ~60fps debounce
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

        const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const batchStart = performance.now();
        
        this.logger.info('STATE', `Processing batch: ${this.transactionQueue.length} transactions`, { batchId });
        
        // Emit batch start event
        this.eventBus.emit('state:batch-start', {
            batchId,
            transactionCount: this.transactionQueue.length,
            transactions: [...this.transactionQueue]
        });

        const results = [];
        this.transactionQueue.forEach(transaction => {
            const result = this.applyTransaction(transaction, true);
            results.push(result);
        });

        const batchDuration = performance.now() - batchStart;
        this.transactionQueue = [];
        
        // Emit batch complete event
        this.eventBus.emit('state:batch-complete', {
            batchId,
            duration: batchDuration,
            results,
            state: this.state
        });
        
        this.notifySubscribers();
        this.eventBus.emit('state:changed', { state: this.state, batch: true });
        
        // Immediate save for batch operations (no debounce)
        saveService.saveState(this.state);
        
        this.logger.info('STATE', `Batch processed: ${batchId}`, {
            duration: `${batchDuration.toFixed(2)}ms`,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length
        });
    }

    /**
     * Applies a transaction to the state with validation and event emission.
     * @param {object} transaction - The transaction object.
     * @param {boolean} [batch=false] - Whether this is part of a batch update.
     */
    applyTransaction(transaction, batch = false) {
        const perfStart = performance.now();
        
        // Add transaction ID and timestamp
        const enrichedTransaction = {
            ...transaction,
            id: transaction.id || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            batch
        };
        
        if (this.isBatching && !batch) {
            this.transactionQueue.push(enrichedTransaction);
            this.logger.debug('STATE', `Transaction queued: ${transaction.type}`, { id: enrichedTransaction.id });
            return { success: true, queued: true, id: enrichedTransaction.id };
        }

        // Validate transaction if validation is enabled
        if (this.isValidationEnabled) {
            const validation = stateValidator.validateTransaction(enrichedTransaction, this.state);
            
            if (!validation.valid) {
                this.logger.error('STATE', `Transaction validation failed: ${transaction.type}`, null, {
                    errors: validation.errors,
                    transaction: enrichedTransaction
                });
                
                // Attempt recovery if possible
                if (validation.errors.some(e => e.recoverable)) {
                    this.logger.info('STATE', 'Attempting transaction recovery');
                    try {
                        const recovered = stateValidator.attemptRecovery(
                            enrichedTransaction,
                            validation.errors,
                            { transaction: enrichedTransaction, state: this.state }
                        );
                        
                        if (recovered) {
                            enrichedTransaction.payload = recovered.payload || recovered;
                            this.logger.info('STATE', 'Transaction recovered successfully');
                        } else {
                            showToast('Invalid operation: ' + validation.errors[0].message, 'error');
                            return { success: false, errors: validation.errors, id: enrichedTransaction.id };
                        }
                    } catch (recoveryError) {
                        this.logger.error('STATE', 'Transaction recovery failed', recoveryError);
                        showToast('Operation failed and could not be recovered', 'error');
                        return { success: false, errors: validation.errors, id: enrichedTransaction.id };
                    }
                } else {
                    showToast('Invalid operation: ' + validation.errors[0].message, 'error');
                    return { success: false, errors: validation.errors, id: enrichedTransaction.id };
                }
            }
        }

        // Store previous state for rollback
        const previousState = JSON.parse(JSON.stringify(this.state));
        
        try {
            // Apply transaction
            switch (enrichedTransaction.type) {
                case 'ADD_COMPONENT':
                    this.state.components[enrichedTransaction.payload.id] = enrichedTransaction.payload;
                    this.state.layout.push(enrichedTransaction.payload.id);
                    break;
                case 'REMOVE_COMPONENT':
                    delete this.state.components[enrichedTransaction.payload];
                    this.state.layout = this.state.layout.filter(id => id !== enrichedTransaction.payload);
                    break;
                case 'UPDATE_COMPONENT':
                    {
                        const {
                            componentId,
                            newProps
                        } = enrichedTransaction.payload;
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
                        } = enrichedTransaction.payload;
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
                    this.state.layout = enrichedTransaction.payload;
                    break;
                case 'SET_STATE':
                    this.state = { ...enrichedTransaction.payload, version: this.state.version };
                    break;
                case 'UPDATE_GLOBAL_SETTINGS':
                    this.state.globalSettings = { 
                        ...this.state.globalSettings,
                        ...enrichedTransaction.payload
                    };
                    break;
                default:
                    throw new Error(`Unknown transaction type: ${enrichedTransaction.type}`);
            }
            
            // Validate final state if validation is enabled
            if (this.isValidationEnabled) {
                const stateValidation = stateValidator.validateState(this.state, { autoRecover: true });
                
                if (!stateValidation.valid && !stateValidation.recovered) {
                    // Rollback on validation failure
                    this.state = previousState;
                    this.logger.error('STATE', 'Post-transaction state validation failed, rolled back', null, {
                        errors: stateValidation.errors
                    });
                    return { success: false, errors: stateValidation.errors, rolledBack: true, id: enrichedTransaction.id };
                }
                
                if (stateValidation.recovered) {
                    this.state = stateValidation.fixed;
                    this.logger.info('STATE', 'State auto-repaired after transaction');
                }
            }
            
            // Add to transaction history
            this.transactionHistory.push({
                ...enrichedTransaction,
                previousState,
                newState: JSON.parse(JSON.stringify(this.state)),
                duration: performance.now() - perfStart,
                success: true
            });
            
            // Trim history if too long
            if (this.transactionHistory.length > 100) {
                this.transactionHistory.shift();
            }
            
            // Track performance
            this.operationCount++;
            this.lastOperationTime = performance.now();
            
            // Emit events
            this.eventBus.emit('state:transaction-applied', {
                transaction: enrichedTransaction,
                state: this.state,
                previousState
            });
            
            this.eventBus.emit(`state:${enrichedTransaction.type.toLowerCase().replace('_', '-')}`, {
                payload: enrichedTransaction.payload,
                state: this.state
            });
            
            if (!this.isBatching) {
                this.notifySubscribers();
                this.eventBus.emit('state:changed', { state: this.state });
                
                // Debounced save for performance
                this.debouncedSave();
            }
            
            const duration = performance.now() - perfStart;
            this.logger.debug('STATE', `Transaction applied: ${enrichedTransaction.type}`, {
                id: enrichedTransaction.id,
                duration: `${duration.toFixed(2)}ms`,
                components: Object.keys(this.state.components).length,
                layout: this.state.layout.length
            });
            
            return { success: true, duration, id: enrichedTransaction.id };
            
        } catch (error) {
            // Rollback on any error
            this.state = previousState;
            this.logger.error('STATE', `Transaction failed: ${enrichedTransaction.type}`, error, {
                transaction: enrichedTransaction
            });
            
            this.eventBus.emit('state:transaction-failed', {
                transaction: enrichedTransaction,
                error: error.message
            });
            
            return { success: false, error: error.message, rolledBack: true, id: enrichedTransaction.id };
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
    
    /**
     * Enable or disable state validation
     */
    setValidationEnabled(enabled) {
        this.isValidationEnabled = enabled;
        this.logger.info('STATE', `Validation ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Get transaction history
     */
    getTransactionHistory() {
        return [...this.transactionHistory];
    }
    
    /**
     * Get the last N transactions
     */
    getRecentTransactions(count = 10) {
        return this.transactionHistory.slice(-count);
    }
    
    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        const now = performance.now();
        const recentTransactions = this.getRecentTransactions(20);
        
        return {
            totalOperations: this.operationCount,
            lastOperationTime: this.lastOperationTime,
            timeSinceLastOperation: now - this.lastOperationTime,
            queueSize: this.transactionQueue.length,
            historySize: this.transactionHistory.length,
            validationEnabled: this.isValidationEnabled,
            averageTransactionTime: recentTransactions.length > 0 
                ? (recentTransactions.reduce((sum, tx) => sum + (tx.duration || 0), 0) / recentTransactions.length).toFixed(2) + 'ms'
                : 'N/A',
            validationStats: this.isValidationEnabled ? stateValidator.getStats() : null
        };
    }
    
    /**
     * Debug state manager
     */
    debug() {
        console.group('%c💾 Enhanced State Manager Debug', 'font-size: 14px; font-weight: bold; color: #00BCD4');
        
        console.log('Current State:', this.getState());
        console.log('Performance Stats:', this.getPerformanceStats());
        console.log('Recent Transactions:', this.getRecentTransactions(5));
        
        if (this.transactionQueue.length > 0) {
            console.log('Queued Transactions:', this.transactionQueue);
        }
        
        console.log('Subscribers:', this.subscribers.length);
        
        if (this.isValidationEnabled) {
            console.log('Validation Stats:', stateValidator.getStats());
        }
        
        console.groupEnd();
    }
    
    /**
     * Force validate current state
     */
    validateCurrentState() {
        const validation = stateValidator.validateState(this.state, { autoRecover: true });
        
        if (!validation.valid) {
            this.logger.warn('STATE', 'Current state validation failed', validation.errors);
            
            if (validation.recovered) {
                this.state = validation.fixed;
                this.logger.info('STATE', 'State auto-repaired');
                this.notifySubscribers();
                this.eventBus.emit('state:repaired', { state: this.state });
            }
        }
        
        return validation;
    }
    
    /**
     * Rollback to previous state
     */
    rollbackLastTransaction() {
        if (this.transactionHistory.length === 0) {
            this.logger.warn('STATE', 'No transactions to rollback');
            return false;
        }
        
        const lastTransaction = this.transactionHistory[this.transactionHistory.length - 1];
        this.state = lastTransaction.previousState;
        this.transactionHistory.pop();
        
        this.logger.info('STATE', `Rolled back transaction: ${lastTransaction.type}`);
        this.notifySubscribers();
        this.eventBus.emit('state:rollback', { transaction: lastTransaction });
        saveService.saveState(this.state);
        
        return true;
    }
    
    /**
     * Debounced save to prevent excessive saves during rapid changes
     */
    debouncedSave() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        this.saveTimeout = setTimeout(() => {
            saveService.saveState(this.state);
            this.saveTimeout = null;
        }, 1000); // 1 second debounce
    }
    
    /**
     * Performance optimized batch operations
     */
    performBatchOperations(operations) {
        const perfEnd = performance.monitor?.start('batch-operations', { count: operations.length });
        
        this.startBatchUpdate();
        
        try {
            const results = operations.map(operation => {
                switch (operation.type) {
                    case 'add':
                        return this.addComponent(operation.component);
                    case 'remove':
                        return this.removeComponent(operation.componentId);
                    case 'update':
                        return this.updateComponent(operation.componentId, operation.props);
                    case 'move':
                        return this.moveComponent(operation.componentId, operation.direction);
                    default:
                        this.logger.warn('STATE', `Unknown batch operation: ${operation.type}`);
                        return false;
                }
            });
            
            this.endBatchUpdate();
            
            perfEnd?.();
            
            this.logger.info('STATE', `Batch operations completed`, {
                total: operations.length,
                successful: results.filter(r => r).length
            });
            
            return results;
            
        } catch (error) {
            this.endBatchUpdate();
            perfEnd?.();
            this.logger.error('STATE', 'Batch operations failed', error);
            throw error;
        }
    }
    
    /**
     * Optimized state comparison for change detection
     */
    hasStateChanged(newState, oldState = this.lastValidatedState) {
        if (!oldState) return true;
        
        // Quick checks first
        if (newState === oldState) return false;
        
        // Check component count
        const newKeys = Object.keys(newState.components || {});
        const oldKeys = Object.keys(oldState.components || {});
        if (newKeys.length !== oldKeys.length) return true;
        
        // Check layout length
        if ((newState.layout || []).length !== (oldState.layout || []).length) return true;
        
        // Deep comparison only if needed
        try {
            return JSON.stringify(newState) !== JSON.stringify(oldState);
        } catch (error) {
            this.logger.warn('STATE', 'State comparison failed, assuming changed', error);
            return true;
        }
    }
    
    /**
     * Clear all timeouts on destruction
     */
    destroy() {
        if (this.subscriberNotificationTimeout) {
            clearTimeout(this.subscriberNotificationTimeout);
        }
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        
        this.subscribers = [];
        this.transactionQueue = [];
        this.transactionHistory = [];
        
        this.logger.info('STATE', 'Enhanced State Manager destroyed');
    }
}

// Export a single instance to act as a singleton
export const enhancedStateManager = new EnhancedStateManager();

// Expose for debugging
window.enhancedStateManager = enhancedStateManager;
