/**
 * Vue-Pinia to UndoRedoManager Bridge
 * Connects the Vue/Pinia store to the existing UndoRedoManager
 * 
 * This bridge ensures that all Vue component state changes are tracked
 * by the undo/redo system and that undo/redo operations update the Vue store.
 * 
 * @version 1.0.0
 * @since 2.2.0
 */

(function() {
    'use strict';
    
    class VueUndoRedoBridge {
        constructor() {
            this.store = null;
            this.undoRedoManager = null;
            this.isProcessingUndo = false;
            this.lastStoreState = null;
            this.logger = window.structuredLogger || console;
            
            this.init();
        }
        
        /**
         * Initialize the bridge
         */
        init() {
            this.logger.info('VUE-UNDO-BRIDGE', 'Initializing Vue-UndoRedo Bridge...');
            
            // Wait for both systems to be ready
            this.waitForSystems();
        }
        
        /**
         * Wait for both Vue store and UndoRedoManager to be available
         */
        waitForSystems() {
            // Check if systems are already available
            if (this.checkAndConnect()) {
                return;
            }
            
            // Listen for Vue app ready
            document.addEventListener('gmkb:vue-app-ready', () => {
                this.logger.info('VUE-UNDO-BRIDGE', 'Vue app ready, attempting connection...');
                this.checkAndConnect();
            });
            
            // Also listen for store ready specifically
            document.addEventListener('gmkb:store-ready', () => {
                this.logger.info('VUE-UNDO-BRIDGE', 'Store ready, attempting connection...');
                this.checkAndConnect();
            });
            
            // Try periodically (fallback for cases where events aren't fired)
            let attempts = 0;
            const checkInterval = setInterval(() => {
                attempts++;
                if (this.checkAndConnect() || attempts > 20) {
                    clearInterval(checkInterval);
                    if (attempts > 20) {
                        this.logger.warn('VUE-UNDO-BRIDGE', 'Failed to connect after 20 attempts');
                    }
                }
            }, 500);
        }
        
        /**
         * Check if both systems are available and connect them
         */
        checkAndConnect() {
            // Try to get the Vue store
            if (!this.store) {
                // Try different methods to access the store
                if (window.mediaKitStore) {
                    this.store = window.mediaKitStore;
                } else if (window.gmkbApp?.$pinia?.use) {
                    // Get store from Pinia instance
                    const stores = window.gmkbApp.$pinia._s;
                    if (stores && stores.size > 0) {
                        // Get the mediaKit store
                        for (const [key, store] of stores) {
                            if (key === 'mediaKit' || store.$id === 'mediaKit') {
                                this.store = store;
                                break;
                            }
                        }
                    }
                } else if (window.useMediaKitStore) {
                    // Try to instantiate the store
                    try {
                        this.store = window.useMediaKitStore();
                    } catch (e) {
                        this.logger.debug('VUE-UNDO-BRIDGE', 'Cannot instantiate store yet');
                    }
                }
            }
            
            // Try to get the UndoRedoManager
            if (!this.undoRedoManager) {
                this.undoRedoManager = window.undoRedoManager;
            }
            
            // If both are available, connect them
            if (this.store && this.undoRedoManager) {
                this.connectSystems();
                return true;
            }
            
            return false;
        }
        
        /**
         * Connect the Vue store to the UndoRedoManager
         */
        connectSystems() {
            this.logger.info('VUE-UNDO-BRIDGE', 'Connecting Vue store to UndoRedoManager...');
            
            // Override the store's undo/redo methods to use the UndoRedoManager
            this.overrideStoreMethods();
            
            // Watch for store changes and track them in UndoRedoManager
            this.watchStoreChanges();
            
            // Listen for undo/redo events and update store
            this.listenForUndoRedo();
            
            // Add keyboard shortcut handlers to Vue components
            this.setupKeyboardShortcuts();
            
            // Expose global helper for debugging
            window.vueUndoRedoBridge = this;
            
            this.logger.info('VUE-UNDO-BRIDGE', '✅ Vue store and UndoRedoManager connected!');
            
            // Dispatch ready event
            document.dispatchEvent(new CustomEvent('gmkb:vue-undo-bridge-ready'));
        }
        
        /**
         * Override the store's undo/redo methods
         */
        overrideStoreMethods() {
            const originalUndo = this.store.undo?.bind(this.store);
            const originalRedo = this.store.redo?.bind(this.store);
            
            // Replace store's undo with UndoRedoManager's undo
            this.store.undo = () => {
                this.logger.info('VUE-UNDO-BRIDGE', 'Store undo called, delegating to UndoRedoManager');
                return this.undoRedoManager.undo();
            };
            
            // Replace store's redo with UndoRedoManager's redo
            this.store.redo = () => {
                this.logger.info('VUE-UNDO-BRIDGE', 'Store redo called, delegating to UndoRedoManager');
                return this.undoRedoManager.redo();
            };
            
            // Also update the canUndo/canRedo getters if they exist
            if (this.store.canUndo !== undefined) {
                Object.defineProperty(this.store, 'canUndo', {
                    get: () => this.undoRedoManager.canUndo()
                });
            }
            
            if (this.store.canRedo !== undefined) {
                Object.defineProperty(this.store, 'canRedo', {
                    get: () => this.undoRedoManager.canRedo()
                });
            }
        }
        
        /**
         * Watch for store changes and track them
         */
        watchStoreChanges() {
            // Use Pinia's $subscribe to watch for all mutations
            this.store.$subscribe((mutation, state) => {
                // Skip if we're processing an undo/redo operation
                if (this.isProcessingUndo) {
                    return;
                }
                
                // Skip if state hasn't actually changed
                const stateSnapshot = this.createStateSnapshot(state);
                if (this.lastStoreState === stateSnapshot) {
                    return;
                }
                
                this.lastStoreState = stateSnapshot;
                
                this.logger.debug('VUE-UNDO-BRIDGE', 'Store mutation detected:', mutation.type);
                
                // Map mutation types to action descriptions
                let actionType = mutation.type;
                let actionDetail = '';
                
                // Parse Pinia mutation types
                if (mutation.type === 'direct') {
                    // Direct state modification
                    actionType = 'state_changed';
                } else if (mutation.type.includes('addComponent')) {
                    actionType = 'component_added';
                    actionDetail = mutation.payload?.type || 'component';
                } else if (mutation.type.includes('removeComponent')) {
                    actionType = 'component_removed';
                } else if (mutation.type.includes('updateComponent')) {
                    actionType = 'component_updated';
                } else if (mutation.type.includes('addSection')) {
                    actionType = 'section_added';
                } else if (mutation.type.includes('removeSection')) {
                    actionType = 'section_removed';
                }
                
                // Trigger the state change event that UndoRedoManager listens for
                document.dispatchEvent(new CustomEvent('gmkb:state-changed', {
                    detail: {
                        action: actionType,
                        detail: actionDetail,
                        state: {
                            components: state.components,
                            sections: state.sections,
                            theme: state.theme
                        }
                    }
                }));
                
                // Also trigger specific action events
                if (actionType === 'component_added') {
                    document.dispatchEvent(new CustomEvent('gmkb:component-added', {
                        detail: { type: actionDetail }
                    }));
                } else if (actionType === 'component_removed') {
                    document.dispatchEvent(new CustomEvent('gmkb:component-removed', {
                        detail: {}
                    }));
                } else if (actionType === 'component_updated') {
                    document.dispatchEvent(new CustomEvent('gmkb:component-updated', {
                        detail: {}
                    }));
                }
            });
            
            this.logger.info('VUE-UNDO-BRIDGE', 'Store change watching enabled');
        }
        
        /**
         * Listen for undo/redo events and update store
         */
        listenForUndoRedo() {
            // Listen for undo event
            document.addEventListener('gmkb:undo', (event) => {
                this.logger.info('VUE-UNDO-BRIDGE', 'Undo event received, updating store');
                this.isProcessingUndo = true;
                
                try {
                    const newState = event.detail.state;
                    if (newState) {
                        // Update store state directly
                        this.updateStoreState(newState);
                    }
                } finally {
                    setTimeout(() => {
                        this.isProcessingUndo = false;
                    }, 100);
                }
            });
            
            // Listen for redo event
            document.addEventListener('gmkb:redo', (event) => {
                this.logger.info('VUE-UNDO-BRIDGE', 'Redo event received, updating store');
                this.isProcessingUndo = true;
                
                try {
                    const newState = event.detail.state;
                    if (newState) {
                        // Update store state directly
                        this.updateStoreState(newState);
                    }
                } finally {
                    setTimeout(() => {
                        this.isProcessingUndo = false;
                    }, 100);
                }
            });
            
            this.logger.info('VUE-UNDO-BRIDGE', 'Undo/redo event listening enabled');
        }
        
        /**
         * Update the store state from undo/redo operation
         */
        updateStoreState(newState) {
            if (!this.store || !newState) return;
            
            // Use $patch for atomic update
            this.store.$patch((state) => {
                // Update components
                if (newState.components) {
                    state.components = { ...newState.components };
                }
                
                // Update sections
                if (newState.sections) {
                    state.sections = [...newState.sections];
                }
                
                // Update theme if included
                if (newState.theme) {
                    state.theme = newState.theme;
                }
                
                // Clear selection states
                state.selectedComponentId = null;
                state.selectedComponentIds = [];
                state.editingComponentId = null;
                state.editPanelOpen = false;
            });
            
            this.logger.info('VUE-UNDO-BRIDGE', 'Store state updated from undo/redo');
        }
        
        /**
         * Setup keyboard shortcuts for Vue components
         */
        setupKeyboardShortcuts() {
            // Add global key handler that works with Vue
            document.addEventListener('keydown', (e) => {
                // Skip if in input field
                if (e.target.matches('input, textarea, select, [contenteditable="true"]')) {
                    return;
                }
                
                // Check for undo (Ctrl/Cmd + Z)
                if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.store.undo();
                    this.logger.info('VUE-UNDO-BRIDGE', 'Keyboard undo triggered');
                }
                // Check for redo (Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y)
                else if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
                         ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.store.redo();
                    this.logger.info('VUE-UNDO-BRIDGE', 'Keyboard redo triggered');
                }
            }, true); // Use capture phase to intercept before Vue
            
            this.logger.info('VUE-UNDO-BRIDGE', 'Keyboard shortcuts setup complete');
        }
        
        /**
         * Create a snapshot of the current state for comparison
         */
        createStateSnapshot(state) {
            const snapshot = {
                components: state.components,
                sections: state.sections,
                theme: state.theme
            };
            return JSON.stringify(snapshot);
        }
        
        /**
         * Manual trigger for undo (for testing)
         */
        triggerUndo() {
            this.logger.info('VUE-UNDO-BRIDGE', 'Manual undo triggered');
            return this.undoRedoManager.undo();
        }
        
        /**
         * Manual trigger for redo (for testing)
         */
        triggerRedo() {
            this.logger.info('VUE-UNDO-BRIDGE', 'Manual redo triggered');
            return this.undoRedoManager.redo();
        }
        
        /**
         * Get bridge status
         */
        getStatus() {
            return {
                connected: !!(this.store && this.undoRedoManager),
                storeAvailable: !!this.store,
                undoRedoAvailable: !!this.undoRedoManager,
                canUndo: this.undoRedoManager?.canUndo() || false,
                canRedo: this.undoRedoManager?.canRedo() || false,
                isProcessingUndo: this.isProcessingUndo
            };
        }
        
        /**
         * Debug the bridge
         */
        debug() {
            console.group('%c🌉 Vue-UndoRedo Bridge Debug', 'font-size: 14px; font-weight: bold; color: #9C27B0');
            console.log('Status:', this.getStatus());
            console.log('Store:', this.store);
            console.log('UndoRedoManager:', this.undoRedoManager);
            console.log('Processing Undo:', this.isProcessingUndo);
            
            if (this.undoRedoManager) {
                console.log('History:', this.undoRedoManager.getHistory());
            }
            
            console.groupEnd();
        }
    }
    
    // Create and initialize the bridge
    window.VueUndoRedoBridge = VueUndoRedoBridge;
    window.vueUndoRedoBridge = new VueUndoRedoBridge();
    
    console.log('✅ Vue-UndoRedo Bridge: Initialized and waiting for systems');
    
})();
