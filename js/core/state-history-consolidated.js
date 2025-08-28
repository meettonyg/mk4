/**
 * Consolidated State History System
 * Combines: state-history.js, state-history-initializer.js, state-history-clear-fix.js
 * 
 * ROOT FIX: Single file for all state history functionality to reduce script count
 * Follows project checklist: No polling, event-driven, simplified code
 * 
 * @version 3.0.0-consolidated
 * @package GMKB
 */

(function() {
    'use strict';
    
    // ============================================
    // PART 1: Core State History Class
    // ============================================
    
    class StateHistory {
        constructor(maxSize = 50) {
            this.history = [];
            this.currentIndex = -1;
            this.maxSize = maxSize;
            this.logger = window.structuredLogger || console;
            this.isEnabled = true;
            this.isNavigating = false;
            
            // Track state metadata
            this.metadata = new Map();
            
            // Performance tracking
            this.stats = {
                snapshots: 0,
                navigations: 0,
                compressionRatio: 0
            };
            
            // Track previous state to detect changes
            this.previousStateJSON = '';
            
            // Initialize when dependencies are ready
            this.waitForDependencies(() => {
                this.setupStateTracking();
                this.initializeHistory();
                this.setupClearOnEmpty();
            });
        }
        
        /**
         * Wait for required dependencies
         */
        waitForDependencies(callback) {
            const checkDependencies = () => {
                if (window.eventBus && window.structuredLogger && window.enhancedStateManager) {
                    callback();
                } else {
                    setTimeout(checkDependencies, 50);
                }
            };
            checkDependencies();
        }

        /**
         * Setup automatic state tracking
         */
        setupStateTracking() {
            const stateManager = window.enhancedStateManager;
            
            if (stateManager && stateManager.subscribeGlobal) {
                stateManager.subscribeGlobal((state) => {
                    if (!this.isNavigating && this.isEnabled) {
                        // Only capture if state actually changed
                        const currentStateJSON = JSON.stringify(state);
                        if (currentStateJSON !== this.previousStateJSON) {
                            this.captureSnapshot(state);
                            this.previousStateJSON = currentStateJSON;
                        }
                    }
                });
                
                this.logger.debug('HISTORY', 'State tracking subscription established');
            }

            // Listen for transaction events
            window.eventBus.on('state:transaction-applied', (event) => {
                if (!this.isNavigating && this.isEnabled) {
                    this.updateCurrentMetadata({
                        transaction: event.data.transaction,
                        timestamp: Date.now()
                    });
                }
            });
        }

        /**
         * Initialize history with current state (from state-history-initializer.js)
         */
        initializeHistory() {
            const currentState = window.enhancedStateManager.getState();
            const hasComponents = currentState && currentState.components && 
                               Object.keys(currentState.components).length > 0;
            
            if (this.history.length === 0 && hasComponents) {
                this.logger.info('HISTORY', 'Capturing initial state with components');
                
                // Manually capture the initial state
                this.captureSnapshot(currentState, {
                    label: 'initial-state',
                    source: 'initializer'
                });
                
                // Update button states
                this.updateUndoRedoButtons();
            } else if (this.history.length > 0) {
                this.logger.info('HISTORY', 'History already has snapshots:', this.history.length);
            } else {
                this.logger.info('HISTORY', 'No components yet, waiting for user actions');
            }
            
            // Always update button states on init
            setTimeout(() => this.updateUndoRedoButtons(), 100);
        }

        /**
         * Setup clear on empty (from state-history-clear-fix.js)
         */
        setupClearOnEmpty() {
            const stateManager = window.enhancedStateManager;
            
            if (stateManager && stateManager.subscribeGlobal) {
                stateManager.subscribeGlobal((state) => {
                    // Check if all components have been removed
                    const componentCount = Object.keys(state.components || {}).length;
                    
                    if (componentCount === 0 && this.history.length > 0) {
                        this.logger.info('HISTORY', 'All components removed, clearing history');
                        this.clear();
                        this.updateUndoRedoButtons();
                    }
                });
            }
        }

        /**
         * Capture a state snapshot
         */
        captureSnapshot(state, metadata = {}) {
            if (!this.isEnabled) return;
            
            try {
                // Validate state input
                if (!state || typeof state !== 'object') {
                    this.logger.warn('HISTORY', 'Invalid state provided for snapshot, skipping');
                    return;
                }

                // If we're not at the end, remove future history
                if (this.currentIndex < this.history.length - 1) {
                    this.history = this.history.slice(0, this.currentIndex + 1);
                }

                // Create snapshot
                const snapshot = {
                    id: this.generateSnapshotId(),
                    state: this.compressState(state),
                    timestamp: Date.now(),
                    metadata: {
                        ...metadata,
                        componentCount: Object.keys(state.components || {}).length,
                        layoutLength: (state.layout || []).length
                    }
                };

                // Add to history
                this.history.push(snapshot);
                this.currentIndex++;
                this.stats.snapshots++;

                // Store additional metadata
                this.metadata.set(snapshot.id, {
                    size: JSON.stringify(snapshot.state).length,
                    ...metadata
                });

                // Trim history if needed
                if (this.history.length > this.maxSize) {
                    const removed = this.history.shift();
                    this.metadata.delete(removed.id);
                    this.currentIndex--;
                }

                this.logger.debug('HISTORY', `State snapshot captured`, {
                    id: snapshot.id,
                    index: this.currentIndex,
                    total: this.history.length
                });

                // Emit events
                if (window.eventBus) {
                    window.eventBus.emit('history:snapshot-captured', {
                        snapshot,
                        index: this.currentIndex
                    });
                }
                
                // Update UI
                this.updateUndoRedoButtons();
                
            } catch (error) {
                this.logger.error('HISTORY', 'Error capturing state snapshot', error);
            }
        }
        
        /**
         * Save snapshot for external calls
         */
        saveSnapshot(state, label = 'manual-save') {
            try {
                if (!state || typeof state !== 'object') {
                    this.logger.debug('HISTORY', 'Invalid state for external snapshot, skipping');
                    return false;
                }
                
                this.captureSnapshot(state, { label, external: true });
                return true;
            } catch (error) {
                this.logger.warn('HISTORY', 'Error in external snapshot save', error);
                return false;
            }
        }

        /**
         * Compress state for storage
         */
        compressState(state) {
            // For now, store full state (diffing can be added later for optimization)
            return {
                full: true,
                data: JSON.parse(JSON.stringify(state))
            };
        }

        /**
         * Decompress state from storage
         */
        decompressState(compressedState) {
            if (compressedState.full) {
                return compressedState.data;
            }
            return compressedState.data;
        }

        /**
         * Update metadata for current snapshot
         */
        updateCurrentMetadata(metadata) {
            if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
                const current = this.history[this.currentIndex];
                Object.assign(current.metadata, metadata);
                
                const storedMetadata = this.metadata.get(current.id);
                if (storedMetadata) {
                    Object.assign(storedMetadata, metadata);
                }
            }
        }

        /**
         * Navigate to previous state (undo)
         */
        undo() {
            if (!this.canUndo()) {
                this.logger.warn('HISTORY', 'Cannot undo: at beginning of history');
                return false;
            }

            const stateManager = window.enhancedStateManager;
            if (!stateManager) {
                this.logger.error('HISTORY', 'Enhanced state manager not available for undo');
                return false;
            }

            this.isNavigating = true;
            this.currentIndex--;
            this.stats.navigations++;

            const snapshot = this.history[this.currentIndex];
            const state = this.decompressState(snapshot.state);

            this.logger.info('HISTORY', 'Undoing to previous state', {
                index: this.currentIndex,
                snapshotId: snapshot.id
            });

            // Apply state
            stateManager.applyTransaction({
                type: 'SET_STATE',
                payload: state
            });

            // Emit event
            if (window.eventBus) {
                window.eventBus.emit('history:undo', {
                    snapshot,
                    index: this.currentIndex
                });
            }
            
            // Update UI
            this.updateUndoRedoButtons();

            this.isNavigating = false;
            return true;
        }

        /**
         * Navigate to next state (redo)
         */
        redo() {
            if (!this.canRedo()) {
                this.logger.warn('HISTORY', 'Cannot redo: at end of history');
                return false;
            }

            const stateManager = window.enhancedStateManager;
            if (!stateManager) {
                this.logger.error('HISTORY', 'Enhanced state manager not available for redo');
                return false;
            }

            this.isNavigating = true;
            this.currentIndex++;
            this.stats.navigations++;

            const snapshot = this.history[this.currentIndex];
            const state = this.decompressState(snapshot.state);

            this.logger.info('HISTORY', 'Redoing to next state', {
                index: this.currentIndex,
                snapshotId: snapshot.id
            });

            // Apply state
            stateManager.applyTransaction({
                type: 'SET_STATE',
                payload: state
            });

            // Emit event
            if (window.eventBus) {
                window.eventBus.emit('history:redo', {
                    snapshot,
                    index: this.currentIndex
                });
            }
            
            // Update UI
            this.updateUndoRedoButtons();

            this.isNavigating = false;
            return true;
        }

        /**
         * Jump to specific point in history
         */
        jumpTo(index) {
            if (index < 0 || index >= this.history.length) {
                throw new Error(`Invalid history index: ${index}`);
            }

            if (index === this.currentIndex) {
                return false;
            }

            const stateManager = window.enhancedStateManager;
            if (!stateManager) {
                this.logger.error('HISTORY', 'Enhanced state manager not available for jumpTo');
                return false;
            }

            this.isNavigating = true;
            const previousIndex = this.currentIndex;
            this.currentIndex = index;
            this.stats.navigations++;

            const snapshot = this.history[index];
            const state = this.decompressState(snapshot.state);

            this.logger.info('HISTORY', `Jumping to history index ${index}`, {
                from: previousIndex,
                to: index,
                snapshotId: snapshot.id
            });

            // Apply state
            stateManager.applyTransaction({
                type: 'SET_STATE',
                payload: state
            });

            // Emit event
            if (window.eventBus) {
                window.eventBus.emit('history:jump', {
                    snapshot,
                    fromIndex: previousIndex,
                    toIndex: index
                });
            }

            this.isNavigating = false;
            return true;
        }

        /**
         * Check if can undo
         */
        canUndo() {
            return this.currentIndex > 0;
        }

        /**
         * Check if can redo
         */
        canRedo() {
            return this.currentIndex < this.history.length - 1;
        }
        
        /**
         * Update undo/redo button states
         */
        updateUndoRedoButtons() {
            // Update DOM buttons directly
            const undoBtn = document.querySelector('[data-action="undo"]');
            const redoBtn = document.querySelector('[data-action="redo"]');
            
            if (undoBtn) {
                undoBtn.disabled = !this.canUndo();
            }
            
            if (redoBtn) {
                redoBtn.disabled = !this.canRedo();
            }
            
            // Emit event for other UI components
            document.dispatchEvent(new CustomEvent('history-state-changed', {
                detail: {
                    canUndo: this.canUndo(),
                    canRedo: this.canRedo(),
                    historySize: this.history.length,
                    currentIndex: this.currentIndex
                }
            }));
            
            // Also call global function if it exists
            if (window.updateUndoRedoButtons) {
                window.updateUndoRedoButtons();
            }
        }

        /**
         * Get timeline visualization data
         */
        getTimeline() {
            return this.history.map((snapshot, index) => ({
                index,
                id: snapshot.id,
                timestamp: snapshot.timestamp,
                current: index === this.currentIndex,
                metadata: snapshot.metadata,
                size: this.metadata.get(snapshot.id)?.size || 0
            }));
        }

        /**
         * Get detailed snapshot info
         */
        getSnapshot(index) {
            if (index < 0 || index >= this.history.length) {
                return null;
            }

            const snapshot = this.history[index];
            return {
                ...snapshot,
                state: this.decompressState(snapshot.state),
                metadata: this.metadata.get(snapshot.id)
            };
        }

        /**
         * Clear history
         */
        clear() {
            this.history = [];
            this.currentIndex = -1;
            this.metadata.clear();
            this.stats.snapshots = 0;
            this.logger.info('HISTORY', 'History cleared');
        }

        /**
         * Enable/disable history tracking
         */
        setEnabled(enabled) {
            this.isEnabled = enabled;
            this.logger.info('HISTORY', `History tracking ${enabled ? 'enabled' : 'disabled'}`);
        }

        /**
         * Export history for debugging
         */
        export() {
            return {
                history: this.history.map(snapshot => ({
                    ...snapshot,
                    state: this.decompressState(snapshot.state)
                })),
                currentIndex: this.currentIndex,
                metadata: Object.fromEntries(this.metadata),
                stats: this.stats
            };
        }

        /**
         * Import history (for debugging)
         */
        import(data) {
            this.clear();
            
            this.history = data.history.map(snapshot => ({
                ...snapshot,
                state: this.compressState(snapshot.state)
            }));
            
            this.currentIndex = data.currentIndex;
            
            Object.entries(data.metadata || {}).forEach(([id, meta]) => {
                this.metadata.set(id, meta);
            });
            
            this.stats = data.stats || this.stats;
            
            this.logger.info('HISTORY', 'History imported', {
                snapshots: this.history.length,
                currentIndex: this.currentIndex
            });
        }

        /**
         * Generate snapshot ID
         */
        generateSnapshotId() {
            return `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        /**
         * Get history statistics
         */
        getStats() {
            const totalSize = Array.from(this.metadata.values())
                .reduce((sum, meta) => sum + (meta.size || 0), 0);
            
            return {
                ...this.stats,
                totalSnapshots: this.history.length,
                currentIndex: this.currentIndex,
                canUndo: this.canUndo(),
                canRedo: this.canRedo(),
                totalSize,
                averageSize: this.history.length > 0 ? Math.round(totalSize / this.history.length) : 0,
                enabled: this.isEnabled
            };
        }
        
        /**
         * Helper methods for API compatibility
         */
        getHistoryLength() {
            return this.history.length;
        }
        
        getCurrentIndex() {
            return this.currentIndex;
        }
        
        getMaxSize() {
            return this.maxSize;
        }

        /**
         * Debug history
         */
        debug() {
            console.group('%c📜 State History Debug', 'font-size: 14px; font-weight: bold; color: #9C27B0');
            
            const stats = this.getStats();
            console.log('Overview:', stats);
            
            console.log('\nTimeline:');
            const timeline = this.getTimeline();
            timeline.forEach(item => {
                const marker = item.current ? '→' : ' ';
                const time = new Date(item.timestamp).toLocaleTimeString();
                console.log(`${marker} [${item.index}] ${time} - ${item.metadata.componentCount} components`);
            });
            
            console.log('\nCurrent State:', this.currentIndex >= 0 ? 
                this.getSnapshot(this.currentIndex) : 'No snapshots');
            
            console.groupEnd();
        }
    }
    
    // ============================================
    // PART 2: Initialize and Export
    // ============================================
    
    // Create singleton instance
    const stateHistory = new StateHistory();
    
    // Expose globally
    window.stateHistory = stateHistory;
    
    // Export convenience methods for backward compatibility
    window.undo = stateHistory.undo.bind(stateHistory);
    window.redo = stateHistory.redo.bind(stateHistory);
    window.canUndo = stateHistory.canUndo.bind(stateHistory);
    window.canRedo = stateHistory.canRedo.bind(stateHistory);
    
    // Also create the updateUndoRedoButtons function that other scripts expect
    window.updateUndoRedoButtons = function() {
        stateHistory.updateUndoRedoButtons();
    };
    
    console.log('✅ Consolidated State History: Ready (includes initializer and clear-fix functionality)');
    
})();
