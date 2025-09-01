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
                sections: [], // PHASE 3: Section Layer Support
                globalSettings: {
                    layout: 'vertical' // ROOT FIX: Default to vertical layout from start
                },
                version: '2.2.0'
            };
            this.subscribers = [];
            this.transactionQueue = [];
            this.transactionHistory = [];
            this.isBatching = false;
            this.isValidationEnabled = false; // Simplified - disable validation
            this.isNotifyingSubscribers = false;
            this.isInitialized = false; // ROOT FIX: Track initialization status
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
            this.lastManualSaveTime = 0; // ROOT FIX: Track manual save operations
            
            // ROOT FIX: Listen for manual save events to coordinate with auto-save
            if (typeof document !== 'undefined') {
                document.addEventListener('gmkb:manual-save-start', () => {
                    this.lastManualSaveTime = Date.now();
                    this.logger.debug('STATE', 'Manual save detected - will coordinate with auto-save');
                });
            }
            
            this.logger.info('STATE', 'Enhanced State Manager initialized (simplified)');
        }

        /**
         * Initialize after all systems are ready
         * ROOT FIX: Load WordPress data first, then localStorage as fallback
         */
        async initializeAfterSystems() {
            if (this.isInitialized) {
                this.logger.debug('STATE', 'Already initialized, skipping');
                return;
            }
            
            this.logger.info('STATE', 'Initializing Enhanced State Manager...');
            
            try {
                // ROOT CAUSE FIX: Use robust getInitialState method
                const initialState = this.getInitialStateFromSources();
                
                if (initialState && initialState.components && typeof initialState.components === 'object' && Object.keys(initialState.components).length > 0) {
                    this.logger.info('STATE', 'Loaded state with components:', {
                        components: Object.keys(initialState.components).length
                    });
                    this.logger.info('STATE', 'Loading state with components:');
                    Object.keys(initialState.components).forEach(id => {
                        const comp = initialState.components[id];
                        if (comp && comp.type) {
                            this.logger.debug('STATE', `  - ${id}: ${comp.type}`);
                        }
                    });
                    
                    // ROOT FIX: Log initial state before validation
                    this.logger.debug('STATE', 'initializeAfterSystems: State before validation', {
                        hasSavedComponents: !!(initialState.saved_components && Array.isArray(initialState.saved_components)),
                        savedComponentsLength: initialState.saved_components ? initialState.saved_components.length : 0
                    });
                    
                    this.state = this.validateAndNormalizeState(initialState);
                    
                    // ROOT FIX: Log state after validation
                    this.logger.debug('STATE', 'initializeAfterSystems: State after validation', {
                        hasSavedComponents: !!(this.state.saved_components && Array.isArray(this.state.saved_components)),
                        savedComponentsLength: this.state.saved_components ? this.state.saved_components.length : 0
                    });
                    this.notifySubscribers();
                } else {
                    this.logger.info('STATE', 'No saved state found - starting with empty state');
                    this.state = initialState || {
                        layout: [],
                        components: {},
                        sections: [], // PHASE 3: Section Layer Support
                        globalSettings: {
                            layout: 'vertical' // ROOT FIX: Ensure empty state defaults to vertical layout
                        },
                        version: this.SAVE_VERSION
                    };
                }
                
                this.isInitialized = true;
                this.logger.info('STATE', 'Enhanced State Manager initialization completed');
                
                // ROOT FIX: Dispatch state manager ready event for component manager coordination
                document.dispatchEvent(new CustomEvent('gmkb:state-manager-ready', {
                    detail: {
                        timestamp: Date.now(),
                        componentCount: Object.keys(this.state.components || {}).length,
                        hasComponents: Object.keys(this.state.components || {}).length > 0
                    }
                }));
                
            } catch (error) {
                this.logger.error('STATE', 'Error during initialization', error);
                this.isInitialized = true; // Mark as initialized even on error to prevent retries
            }
        }

        /**
         * ROOT FIX: DELETED - This was a duplicate method. Using getInitialStateFromSources instead.
         * The actual getInitialState() method is defined later in the file.
         */

        /**
         * Maps an array of component data to the object format used by the state.
         * ROOT FIX: Enhanced null safety and error handling
         */
        mapComponentData(components) {
            const componentMap = {};
            if (!components || !Array.isArray(components)) {
                this.logger.warn('STATE', 'mapComponentData received invalid input', { components });
                return componentMap;
            }

            try {
                components.forEach(comp => {
                    if (comp && comp.id && typeof comp === 'object') {
                        componentMap[comp.id] = { ...comp };
                    } else {
                        this.logger.warn('STATE', 'Skipping invalid component in mapComponentData', { comp });
                    }
                });
            } catch (error) {
                this.logger.error('STATE', 'Error in mapComponentData', error);
            }
            
            return componentMap;
        }

        /**
         * Generates a layout array (an array of component IDs) from the component list.
         * ROOT FIX: Enhanced null safety and error handling
         */
        generateLayout(components) {
            if (!components || !Array.isArray(components)) {
                this.logger.warn('STATE', 'generateLayout received invalid input', { components });
                return [];
            }
            
            try {
                return components
                    .map(comp => comp && comp.id ? comp.id : null)
                    .filter(id => !!id);
            } catch (error) {
                this.logger.error('STATE', 'Error in generateLayout', error);
                return [];
            }
        }

        /**
         * Normalizes state structure for backwards compatibility
         */
        normalizeState(state) {
            return this.validateAndNormalizeState(state);
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
         * ROOT FIX: Removed duplicate method - using getInitialStateFromSources instead
         * Get the initial state for components that need it during startup
         * This method is safe to call during initialization
         */
        getInitialState() {
            if (this.isInitialized) {
                const state = this.getState();
                this.logger.debug('STATE', 'getInitialState: Returning initialized state', {
                    componentCount: Object.keys(state.components || {}).length,
                    hasSavedComponents: !!(state.saved_components && Array.isArray(state.saved_components)),
                    savedComponentsLength: state.saved_components ? state.saved_components.length : 0
                });
                return state;
            }
            
            // If not yet initialized, get the state from data sources
            try {
                const initialState = this.getInitialStateFromSources();
                const finalState = initialState || {
                    layout: [],
                    components: {},
                    globalSettings: {
                        layout: 'vertical'
                    },
                    version: this.SAVE_VERSION
                };
                
                this.logger.debug('STATE', 'getInitialState: Returning state from sources', {
                    componentCount: Object.keys(finalState.components || {}).length,
                    hasSavedComponents: !!(finalState.saved_components && Array.isArray(finalState.saved_components)),
                    savedComponentsLength: finalState.saved_components ? finalState.saved_components.length : 0
                });
                
                return finalState;
            } catch (error) {
                this.logger.warn('STATE', 'Error getting initial state, returning empty state', error);
                return {
                    layout: [],
                    components: {},
                    sections: [], // PHASE 3: Section Layer Support
                    globalSettings: {
                        layout: 'vertical'
                    },
                    version: this.SAVE_VERSION
                };
            }
        }

        /**
         * ✅ ROOT CAUSE FIX: Single WordPress data source only
         * Eliminates complex multi-source logic and race conditions
         */
        getInitialStateFromSources() {
            this.logger.info('STATE', '💾 Single source state loading from WordPress data...');
            
            // ✅ SIMPLIFIED: Only use WordPress data - no fallback complexity
            const wpData = window.gmkbData;

            if (!wpData) {
                this.logger.warn('STATE', 'No WordPress data available - starting empty');
                return this.createEmptyState();
            }
            
            this.logger.debug('STATE', 'WordPress data found:', {
                hasSavedComponents: !!(wpData.saved_components && Array.isArray(wpData.saved_components)),
                componentCount: wpData.saved_components ? wpData.saved_components.length : 0,
                hasSavedState: !!(wpData.saved_state),
                savedStateComponentCount: wpData.saved_state?.components ? Object.keys(wpData.saved_state.components).length : 0
            });

            // ROOT FIX: Check saved_state first (complete state from database)
            if (wpData.saved_state && typeof wpData.saved_state === 'object') {
            this.logger.info('STATE', '✅ Using saved_state from WordPress database');
            const savedState = wpData.saved_state;
            
            // ROOT CAUSE FIX: Handle components whether it's an object or array
            let components = {};
            
            // If components is already an object (associative array from PHP)
            if (savedState.components && typeof savedState.components === 'object' && !Array.isArray(savedState.components)) {
                components = savedState.components;
                this.logger.info('STATE', '✅ Components is object format with ' + Object.keys(components).length + ' items');
            }
            // If components is an array, convert to object
            else if (Array.isArray(savedState.components) && savedState.components.length > 0) {
            savedState.components.forEach(comp => {
                if (comp && comp.id) {
                    components[comp.id] = comp;
                }
                });
                this.logger.info('STATE', '🔄 Converted components array to object with ' + Object.keys(components).length + ' items');
            }
            // Empty or invalid components
            else {
                this.logger.info('STATE', '⚠️ Components empty or invalid, starting fresh');
                components = {};
            }
            
                // ROOT CAUSE FIX: Also check layout array - if empty but we have components, rebuild it
            let layout = savedState.layout || [];
            if ((!layout || layout.length === 0) && Object.keys(components).length > 0) {
                // If we have saved_components array, use its order
                if (savedState.saved_components && Array.isArray(savedState.saved_components)) {
                    layout = savedState.saved_components.map(c => c.id).filter(id => !!id);
                    this.logger.info('STATE', '✅ Rebuilt layout from saved_components order');
                } else {
                    // Otherwise use component keys
                    layout = Object.keys(components);
                    this.logger.info('STATE', '⚠️ Rebuilt layout from component keys (order may be wrong)');
                }
            }
            
            // Ensure it has the required structure
            const state = {
                components: components,
                layout: layout,
                globalSettings: savedState.globalSettings || { layout: 'vertical' },
                sections: savedState.sections || [],
                version: savedState.version || '2.2.0'
            };
            
            // Preserve saved_components if exists
            if (savedState.saved_components) {
                state.saved_components = savedState.saved_components;
            }
            
            this.logger.info('STATE', `Loaded complete state with ${Object.keys(state.components).length} components from WordPress`);
            this.logger.info('STATE', `Layout order: ${state.layout.join(', ')}`);
            return state;
        }
            // Fallback: Use saved_components array
            else if (wpData.saved_components && Array.isArray(wpData.saved_components)) {
                this.logger.info('STATE', '⚠️ Using legacy saved_components array (no saved_state found)');
                const components = this.mapComponentData(wpData.saved_components);
                const layout = this.generateLayout(wpData.saved_components);

                const state = {
                    components: components,
                    globalSettings: wpData.global_settings || { layout: 'vertical' },
                    layout: layout,
                    saved_components: wpData.saved_components,
                    sections: [],
                    version: '2.2.0' 
                };
                
                this.logger.info('STATE', `Loaded ${wpData.saved_components.length} components from WordPress saved_components`);
                return state;
            }
            
            // ✅ SIMPLIFIED: No saved components - return empty state
            this.logger.info('STATE', 'No saved components - starting with empty state');
            return this.createEmptyState();
        }
        
        /**
         * ✅ ROOT CAUSE FIX: Consistent empty state creation
         */
        createEmptyState() {
            return {
                components: {},
                sections: [],
                globalSettings: { layout: 'vertical' },
                layout: [],
                version: '2.2.0'
            };
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
                case 'ADD_COMPONENT': {
                    // ROOT FIX: Properly handle component data structure
                    // Use block scope to avoid redeclaration issues
                    const componentData = transaction.payload.componentData || transaction.payload;
                    const compId = transaction.payload.componentId || componentData.id;
                    
                    if (!compId) {
                        this.logger.error('STATE', 'ADD_COMPONENT: No component ID provided');
                        break;
                    }
                    
                    this.state.components[compId] = componentData;
                    
                    // Only add to layout if not already present
                    if (!this.state.layout.includes(compId)) {
                        this.state.layout.push(compId);
                    }
                    break;
                }
                case 'REMOVE_COMPONENT':
                    // ROOT FIX: Ensure component is fully removed from all state properties
                    const componentToRemove = transaction.payload;
                    
                    // Remove from components object
                    delete this.state.components[componentToRemove];
                    
                    // Remove from layout array
                    this.state.layout = this.state.layout.filter(id => id !== componentToRemove);
                    
                    // ROOT FIX: Also remove from saved_components if it exists
                    if (this.state.saved_components && Array.isArray(this.state.saved_components)) {
                        this.state.saved_components = this.state.saved_components.filter(
                            comp => comp && comp.id !== componentToRemove
                        );
                    }
                    
                    this.logger.debug('STATE', `Component ${componentToRemove} removed from all state properties`);
                    break;
                case 'UPDATE_COMPONENT': {
                    const { componentId, newProps } = transaction.payload;
                    if (this.state.components[componentId]) {
                        this.state.components[componentId].props = {
                            ...this.state.components[componentId].props,
                            ...newProps
                        };
                    }
                    break;
                }
                case 'MOVE_COMPONENT': {
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
                }
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
                case 'UPDATE_SECTIONS':
                    this.state.sections = transaction.payload;
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
         * Generic dispatch method for Phase 3 systems
         * Following checklist: Centralized State, Schema Compliance
         */
        dispatch(action) {
            this.applyTransaction(action);
        }

        /**
         * Update sections in state
         * Following checklist: Phase 3 Section Layer Support
         */
        updateSections(sections) {
            this.applyTransaction({
                type: 'UPDATE_SECTIONS',
                payload: sections
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
         * ROOT FIX: Enhanced debounced save with auto-save to database
         * CHECKLIST COMPLIANT: Event-driven, no polling, root cause fix
         */
        debouncedSave() {
            if (this.saveTimeout) {
                clearTimeout(this.saveTimeout);
            }
            this.saveTimeout = setTimeout(async () => {
                // Save to localStorage first (fast)
                this.saveStateToStorage(this.state);
                
                // ROOT FIX: Skip auto-save to database during manual save operations
                // to prevent state conflicts and double-rendering
                const timeSinceLastManualSave = Date.now() - (this.lastManualSaveTime || 0);
                const isRecentManualSave = timeSinceLastManualSave < 5000; // Within 5 seconds
                
                if (!isRecentManualSave) {
                    // ROOT FIX: Also auto-save to database via component manager
                    try {
                        if (window.enhancedComponentManager && window.enhancedComponentManager.autoSaveState) {
                            await window.enhancedComponentManager.autoSaveState('state_changed', {
                                source: 'state_manager_debounced_save',
                                componentCount: Object.keys(this.state.components || {}).length
                            });
                            this.logger.debug('STATE', 'Auto-save to database completed via debounced save');
                        }
                    } catch (error) {
                        this.logger.warn('STATE', 'Auto-save to database failed in debounced save:', error.message);
                        // Don't fail the local save if database save fails
                    }
                } else {
                    this.logger.debug('STATE', 'Skipping debounced auto-save - recent manual save detected');
                }
                
                this.saveTimeout = null;
            }, 1000);
        }

        /**
         * ✅ ROOT CAUSE FIX: Removed - using simplified getInitialStateFromSources instead
         * Single WordPress data source eliminates this complex method
         */
        
        /**
         * Load state from storage
         */
        loadStateFromStorage() {
            try {
                const saved = localStorage.getItem(this.SAVE_KEY);
                if (saved) {
                    const data = JSON.parse(saved);
                    const componentCount = data.components && typeof data.components === 'object' ? Object.keys(data.components).length : 0;
                    this.logger.info('STATE', 'Loaded state from localStorage', {
                        components: componentCount
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
                sections: [], // PHASE 3: Section Layer Support
                globalSettings: {
                    layout: 'vertical' // ROOT FIX: Ensure normalized state defaults to vertical layout
                },
                    version: this.SAVE_VERSION
            };
            }
            
            const normalized = {
                layout: Array.isArray(state.layout) ? state.layout : [],
                components: state.components && typeof state.components === 'object' ? state.components : {},
                sections: Array.isArray(state.sections) ? state.sections : [], // PHASE 3: Section Layer Support
                globalSettings: state.globalSettings && typeof state.globalSettings === 'object' ? state.globalSettings : {},
                version: state.version || this.SAVE_VERSION
            };
            
            // ROOT FIX: Preserve saved_components array if it exists
            if (state.saved_components && Array.isArray(state.saved_components)) {
                normalized.saved_components = state.saved_components;
                this.logger.debug('STATE', 'validateAndNormalizeState: Preserved saved_components array', {
                    length: state.saved_components.length
                });
            }
            
            // Ensure all components in layout exist in components object
            normalized.layout = normalized.layout.filter(id => normalized.components[id]);
            
            // Enhanced component validation with recovery
            const validComponents = {};
            const recoveredCount = { fixed: 0, removed: 0 };
            
            // ROOT FIX: Null safety for Object.keys
            const componentKeys = normalized.components && typeof normalized.components === 'object' ? Object.keys(normalized.components) : [];
            
            componentKeys.forEach(id => {
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
            
            // Log recovery results with null safety
            const finalComponentCount = normalized.components && typeof normalized.components === 'object' ? Object.keys(normalized.components).length : 0;
            
            if (recoveredCount.fixed > 0 || recoveredCount.removed > 0) {
                this.logger.info('STATE', 'Component validation and recovery complete', {
                    totalComponents: finalComponentCount,
                    recovered: recoveredCount.fixed,
                    removed: recoveredCount.removed,
                    layoutComponents: normalized.layout.length
                });
            }
            
            this.logger.debug('STATE', 'State normalized', {
                componentsCount: finalComponentCount,
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
    
    // ROOT CAUSE FIX: Initialize the state manager with saved data
    // This MUST be called to load saved components from gmkbData
    document.addEventListener('DOMContentLoaded', () => {
        // Only initialize if gmkbData is available
        if (window.gmkbData) {
            console.log('🔄 STATE: Initializing state manager with saved data...');
            window.enhancedStateManager.initializeAfterSystems().then(() => {
                console.log('✅ STATE: State manager initialized with saved data');
                const state = window.enhancedStateManager.getState();
                console.log(`📊 STATE: Loaded ${Object.keys(state.components || {}).length} components`);
            }).catch(error => {
                console.error('❌ STATE: Failed to initialize state manager:', error);
            });
        } else {
            console.log('⚠️ STATE: gmkbData not available yet, waiting...');
            // If gmkbData isn't ready yet, wait for it
            const checkInterval = setInterval(() => {
                if (window.gmkbData) {
                    clearInterval(checkInterval);
                    console.log('🔄 STATE: gmkbData now available, initializing...');
                    window.enhancedStateManager.initializeAfterSystems().then(() => {
                        console.log('✅ STATE: State manager initialized with saved data (delayed)');
                        const state = window.enhancedStateManager.getState();
                        console.log(`📊 STATE: Loaded ${Object.keys(state.components || {}).length} components`);
                    });
                }
            }, 100);
            // Stop checking after 5 seconds
            setTimeout(() => clearInterval(checkInterval), 5000);
        }
    });
    
    // ✅ CHECKLIST COMPLIANT: Emit ready event for event-driven architecture
    document.dispatchEvent(new CustomEvent('gmkb:enhanced-state-manager-ready', {
        detail: { 
            stateManager: window.enhancedStateManager,
            timestamp: Date.now()
        }
    }));
    
    console.log('✅ Enhanced State Manager (Simplified): Available globally and ready event emitted');
    
})();
