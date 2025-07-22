/**
 * @file enhanced-state-manager-simple.js
 * @description ROOT FIX: Simplified WordPress-Compatible Enhanced State Manager
 * Manages application state without ES6 imports
 */

(function() {
    'use strict';
    
    // ROOT FIX: Create fallback utilities if imports not available
    const showToast = window.showToast || function(message, type) {
        console.log(`Toast [${type}]: ${message}`);
    };
    
    const structuredLogger = window.structuredLogger || {
        info: console.log,
        warn: console.warn,
        error: console.error,
        debug: console.debug
    };

    class EnhancedStateManager {
        constructor() {
            this.state = {
                layout: [],
                components: {},
                globalSettings: {},
                version: '2.2.0'
            };
            this.subscribers = [];
            this.transactionQueue = [];
            this.transactionHistory = [];
            this.isBatching = false;
            this.isValidationEnabled = false; // Simplified - disable validation
            this.isNotifyingSubscribers = false;
            this.logger = structuredLogger;
            
            // Performance tracking
            this.operationCount = 0;
            this.lastOperationTime = performance.now();
            
            // Debouncing timeouts
            this.subscriberNotificationTimeout = null;
            this.saveTimeout = null;
            
            // Save management
            this.SAVE_KEY = 'guestifyMediaKitState';
            this.SAVE_VERSION = '2.2.0';
            
            this.logger.info('STATE', 'Enhanced State Manager initialized (simplified)');
        }

        /**
         * Initialize after all systems are ready
         * ROOT FIX: Load WordPress data first, then localStorage as fallback
         */
        async initializeAfterSystems() {
            this.logger.info('STATE', 'Initializing Enhanced State Manager...');
            
            try {
                // ROOT FIX: Priority 1 - Load WordPress saved state
                let savedState = this.loadStateFromWordPress();
                
                // ROOT FIX: Priority 2 - Fallback to localStorage if no WordPress data
                if (!savedState || Object.keys(savedState.components || {}).length === 0) {
                    savedState = this.loadStateFromStorage();
                    this.logger.info('STATE', 'No WordPress state, using localStorage fallback');
                }
                
                if (savedState && Object.keys(savedState.components || {}).length > 0) {
                    this.logger.info('STATE', 'Loaded state from localStorage', {
                        components: Object.keys(savedState.components).length
                    });
                    this.logger.info('STATE', 'Loading saved state with components:');
                    Object.keys(savedState.components).forEach(id => {
                        const comp = savedState.components[id];
                        this.logger.debug('STATE', `  - ${id}: ${comp.type}`);
                    });
                    
                    this.state = this.validateAndNormalizeState(savedState);
                    this.notifySubscribers();
                } else {
                    this.logger.info('STATE', 'No saved state found - starting with empty state');
                }
                
                this.logger.info('STATE', 'Enhanced State Manager initialization completed');
                
            } catch (error) {
                this.logger.error('STATE', 'Error during initialization', error);
            }
        }

        /**
         * Subscribe to state changes
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
         * Notify all subscribers of state changes
         */
        notifySubscribers() {
            if (this.subscriberNotificationTimeout) {
                clearTimeout(this.subscriberNotificationTimeout);
            }
            
            this.subscriberNotificationTimeout = setTimeout(() => {
                this.isNotifyingSubscribers = true;
                
                try {
                    this.subscribers.forEach((callback, index) => {
                        try {
                            callback(this.state);
                        } catch (error) {
                            this.logger.error('STATE', `Subscriber ${index} callback error`, error);
                        }
                    });
                } catch (error) {
                    this.logger.error('STATE', 'Error notifying subscribers', error);
                } finally {
                    this.isNotifyingSubscribers = false;
                    this.subscriberNotificationTimeout = null;
                }
            }, 8); // Short debounce
        }

        /**
         * Get current state
         */
        getState() {
            return JSON.parse(JSON.stringify(this.state));
        }

        /**
         * Get layout array
         */
        getLayout() {
            return this.state.layout;
        }

        /**
         * Get components
         */
        getComponents() {
            return Object.values(this.state.components);
        }

        /**
         * Get single component
         */
        getComponent(componentId) {
            return this.state.components[componentId] || null;
        }

        /**
         * Start batch update
         */
        startBatchUpdate() {
            this.isBatching = true;
            this.transactionQueue = [];
            const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 10)}`;
            
            this.logger.info('STATE', `Batch update started: ${batchId}`);
            return batchId;
        }

        /**
         * End batch update
         */
        async endBatchUpdate() {
            try {
                this.isBatching = false;
                this.processTransactionQueue();
            } catch (error) {
                this.logger.error('STATE', 'Error during batch update completion', error);
            }
        }

        /**
         * Process transaction queue
         */
        processTransactionQueue() {
            if (this.transactionQueue.length === 0) return;

            const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const batchStart = performance.now();
            
            this.logger.info('STATE', `Processing batch: ${this.transactionQueue.length} transactions`);
            
            // Apply all transactions
            this.transactionQueue.forEach(transaction => {
                try {
                    this.applyTransactionDirect(transaction);
                } catch (error) {
                    this.logger.warn('STATE', `Error in batch transaction: ${error.message}`);
                }
            });

            const batchDuration = performance.now() - batchStart;
            this.transactionQueue = [];
            
            this.notifySubscribers();
            this.saveStateToStorage(this.state);
            
            this.logger.info('STATE', `Batch processed: ${batchId} in ${batchDuration.toFixed(2)}ms`);
        }

        /**
         * Apply transaction directly to state
         */
        applyTransactionDirect(transaction) {
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
                    const { componentId, newProps } = transaction.payload;
                    if (this.state.components[componentId]) {
                        this.state.components[componentId].props = {
                            ...this.state.components[componentId].props,
                            ...newProps
                        };
                    }
                    break;
                case 'MOVE_COMPONENT':
                    const { componentId: moveId, direction } = transaction.payload;
                    const index = this.state.layout.indexOf(moveId);
                    if (index === -1) break;

                    if (direction === 'up' && index > 0) {
                        [this.state.layout[index], this.state.layout[index - 1]] = 
                        [this.state.layout[index - 1], this.state.layout[index]];
                    } else if (direction === 'down' && index < this.state.layout.length - 1) {
                        [this.state.layout[index], this.state.layout[index + 1]] = 
                        [this.state.layout[index + 1], this.state.layout[index]];
                    }
                    break;
                case 'SET_LAYOUT':
                    this.state.layout = transaction.payload;
                    break;
                case 'SET_STATE':
                    this.state = { ...transaction.payload, version: this.state.version };
                    break;
                case 'UPDATE_GLOBAL_SETTINGS':
                    this.state.globalSettings = { 
                        ...this.state.globalSettings,
                        ...transaction.payload
                    };
                    break;
            }
        }

        /**
         * Apply transaction with proper handling
         */
        applyTransaction(transaction, batch = false) {
            const enrichedTransaction = {
                ...transaction,
                id: transaction.id || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
                batch
            };
            
            if (this.isBatching && !batch) {
                this.transactionQueue.push(enrichedTransaction);
                return { success: true, queued: true, id: enrichedTransaction.id };
            }

            try {
                this.applyTransactionDirect(enrichedTransaction);
                
                if (!this.isBatching) {
                    this.notifySubscribers();
                    this.debouncedSave();
                }
                
                return { success: true, id: enrichedTransaction.id };
                
            } catch (error) {
                this.logger.error('STATE', `Transaction failed: ${enrichedTransaction.type}`, error);
                return { success: false, error: error.message, id: enrichedTransaction.id };
            }
        }

        // Action creators
        addComponent(component) {
            this.applyTransaction({
                type: 'ADD_COMPONENT',
                payload: component
            });
        }

        removeComponent(componentId) {
            this.applyTransaction({
                type: 'REMOVE_COMPONENT',
                payload: componentId
            });
        }

        updateComponent(componentId, newProps) {
            this.applyTransaction({
                type: 'UPDATE_COMPONENT',
                payload: { componentId, newProps }
            });
        }

        moveComponent(componentId, direction) {
            this.applyTransaction({
                type: 'MOVE_COMPONENT',
                payload: { componentId, direction }
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
         * Check if busy
         */
        isBusy() {
            return this.isBatching || this.isNotifyingSubscribers || this.transactionQueue.length > 0;
        }

        /**
         * Wait until ready
         */
        async waitUntilReady(timeout = 1000) {
            const start = performance.now();
            while (this.isBusy() && (performance.now() - start) < timeout) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            return !this.isBusy();
        }

        /**
         * Debounced save
         */
        debouncedSave() {
            if (this.saveTimeout) {
                clearTimeout(this.saveTimeout);
            }
            this.saveTimeout = setTimeout(() => {
                this.saveStateToStorage(this.state);
                this.saveTimeout = null;
            }, 1000);
        }

        /**
         * ROOT FIX: Load state from WordPress data (priority source)
         */
        loadStateFromWordPress() {
            try {
                // Check for WordPress data in gmkbData.savedState
                if (window.gmkbData && window.gmkbData.savedState) {
                    const wpState = window.gmkbData.savedState;
                    
                    if (wpState && Object.keys(wpState.components || {}).length > 0) {
                        this.logger.info('STATE', 'Loaded state from WordPress', {
                            components: Object.keys(wpState.components).length
                        });
                        return wpState;
                    }
                }
                
                // Check for WordPress data in guestifyData.savedState (fallback)
                if (window.guestifyData && window.guestifyData.savedState) {
                    const wpState = window.guestifyData.savedState;
                    
                    if (wpState && Object.keys(wpState.components || {}).length > 0) {
                        this.logger.info('STATE', 'Loaded state from WordPress (guestifyData)', {
                            components: Object.keys(wpState.components).length
                        });
                        return wpState;
                    }
                }
                
                this.logger.debug('STATE', 'No WordPress saved state available');
                return null;
                
            } catch (error) {
                this.logger.error('STATE', 'Error loading from WordPress data', error);
                return null;
            }
        }
        
        /**
         * Load state from storage
         */
        loadStateFromStorage() {
            try {
                const saved = localStorage.getItem(this.SAVE_KEY);
                if (saved) {
                    const data = JSON.parse(saved);
                    this.logger.info('STATE', 'Loaded state from localStorage', {
                        components: Object.keys(data.components || {}).length
                    });
                    return data;
                }
            } catch (error) {
                this.logger.error('STATE', 'Error loading from localStorage', error);
            }
            return null;
        }

        /**
         * Save state to storage
         */
        saveStateToStorage(state) {
            try {
                localStorage.setItem(this.SAVE_KEY, JSON.stringify(state));
                this.logger.debug('STATE', 'Saved state to localStorage');
            } catch (error) {
                this.logger.error('STATE', 'Error saving to localStorage', error);
            }
        }
        
        /**
         * ROOT FIX: Enhanced state validation with recovery and detailed diagnostics
         */
        validateAndNormalizeState(state) {
            if (!state || typeof state !== 'object') {
                return {
                    layout: [],
                    components: {},
                    globalSettings: {},
                    version: this.SAVE_VERSION
                };
            }
            
            const normalized = {
                layout: Array.isArray(state.layout) ? state.layout : [],
                components: state.components && typeof state.components === 'object' ? state.components : {},
                globalSettings: state.globalSettings && typeof state.globalSettings === 'object' ? state.globalSettings : {},
                version: state.version || this.SAVE_VERSION
            };
            
            // Ensure all components in layout exist in components object
            normalized.layout = normalized.layout.filter(id => normalized.components[id]);
            
            // Enhanced component validation with recovery
            const validComponents = {};
            const recoveredCount = { fixed: 0, removed: 0 };
            
            Object.keys(normalized.components).forEach(id => {
                const component = normalized.components[id];
                
                // Check for missing required properties
                const missingProps = [];
                if (!component.type) missingProps.push('type');
                if (!component.id) missingProps.push('id');
                
                if (missingProps.length > 0) {
                    // Attempt recovery
                    let recovered = false;
                    
                    // Try to infer type from component ID
                    if (!component.type && id) {
                        if (id.includes('topics-') || id.includes('topic-')) {
                            component.type = 'topics';
                            missingProps.splice(missingProps.indexOf('type'), 1);
                            recovered = true;
                            this.logger.info('STATE', `Recovered component type 'topics' for ${id}`);
                        } else if (id.includes('hero-') || id.includes('header-')) {
                            component.type = 'hero';
                            missingProps.splice(missingProps.indexOf('type'), 1);
                            recovered = true;
                            this.logger.info('STATE', `Recovered component type 'hero' for ${id}`);
                        } else if (id.includes('bio-') || id.includes('biography-')) {
                            component.type = 'biography';
                            missingProps.splice(missingProps.indexOf('type'), 1);
                            recovered = true;
                            this.logger.info('STATE', `Recovered component type 'biography' for ${id}`);
                        }
                    }
                    
                    // Set missing ID if not present
                    if (!component.id) {
                        component.id = id;
                        missingProps.splice(missingProps.indexOf('id'), 1);
                        recovered = true;
                        this.logger.info('STATE', `Recovered component id '${id}'`);
                    }
                    
                    // If still missing critical properties, remove component
                    if (missingProps.length > 0) {
                        this.logger.warn('STATE', `Removing invalid component ${id} - missing: ${missingProps.join(', ')}`, {
                            componentData: component,
                            missingProperties: missingProps
                        });
                        normalized.layout = normalized.layout.filter(layoutId => layoutId !== id);
                        recoveredCount.removed++;
                        return; // Skip adding to validComponents
                    }
                    
                    if (recovered) {
                        recoveredCount.fixed++;
                    }
                }
                
                // Add valid/recovered component
                validComponents[id] = component;
            });
            
            // Update normalized components with valid ones
            normalized.components = validComponents;
            
            // Log recovery results
            if (recoveredCount.fixed > 0 || recoveredCount.removed > 0) {
                this.logger.info('STATE', 'Component validation and recovery complete', {
                    totalComponents: Object.keys(normalized.components).length,
                    recovered: recoveredCount.fixed,
                    removed: recoveredCount.removed,
                    layoutComponents: normalized.layout.length
                });
            }
            
            this.logger.debug('STATE', 'State normalized', {
                componentsCount: Object.keys(normalized.components).length,
                layoutCount: normalized.layout.length
            });
            
            return normalized;
        }

        /**
         * Debug state manager
         */
        debug() {
            console.group('%c💾 Enhanced State Manager Debug (Simplified)', 'font-size: 14px; font-weight: bold; color: #00BCD4');
            console.log('Current State:', this.getState());
            console.log('Subscribers:', this.subscribers.length);
            console.log('Is Busy:', this.isBusy());
            console.log('Queue Size:', this.transactionQueue.length);
            console.groupEnd();
        }
    }

    // ROOT FIX: Create and expose globally
    window.EnhancedStateManager = EnhancedStateManager;
    window.enhancedStateManager = new EnhancedStateManager();
    
    console.log('✅ Enhanced State Manager (Simplified): Available globally and ready');
    
})();
