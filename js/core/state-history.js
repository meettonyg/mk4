/**
 * State History for Time-Travel Debugging
 * Tracks all state changes for debugging and undo/redo functionality
 * Part of Phase 3: Enhanced State Integration
 * 
 * PHASE 3 FIX: Removed circular dependency with enhancedStateManager
 */

// REMOVED: import { enhancedStateManager } from './enhanced-state-manager.js';
import { eventBus } from './event-bus.js';
import { structuredLogger } from '../utils/structured-logger.js';

class StateHistory {
    constructor(maxSize = 50) {
        this.history = [];
        this.currentIndex = -1;
        this.maxSize = maxSize;
        this.logger = structuredLogger;
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
        
        // Setup state tracking
        this.setupStateTracking();
    }

    /**
     * Setup automatic state tracking
     * PHASE 3 FIX: Access enhancedStateManager through window to avoid circular dependency
     */
    setupStateTracking() {
        // Subscribe to state changes - access via window to avoid circular dependency
        const getStateManager = () => window.enhancedStateManager;
        
        // Set up subscription when state manager becomes available
        const subscribeWhenReady = () => {
            const stateManager = getStateManager();
            if (stateManager && stateManager.subscribeGlobal) {
                stateManager.subscribeGlobal((state) => {
                    if (!this.isNavigating && this.isEnabled) {
                        this.captureSnapshot(state);
                    }
                });
                
                this.logger.debug('HISTORY', 'State tracking subscription established');
            } else {
                // Retry after a short delay if state manager not ready
                setTimeout(subscribeWhenReady, 100);
            }
        };
        
        // Start subscription process
        subscribeWhenReady();

        // Listen for transaction events
        eventBus.on('state:transaction-applied', (event) => {
            if (!this.isNavigating && this.isEnabled) {
                this.updateCurrentMetadata({
                    transaction: event.data.transaction,
                    timestamp: Date.now()
                });
            }
        });
    }

    /**
     * Capture a state snapshot
     * GEMINI FIX: Added error handling to prevent snapshot failures
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

            // Create snapshot with error handling
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

            // Store additional metadata with error handling
            try {
                this.metadata.set(snapshot.id, {
                    size: JSON.stringify(snapshot.state).length,
                    ...metadata
                });
            } catch (metadataError) {
                this.logger.warn('HISTORY', 'Error storing metadata', metadataError);
            }

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

            // Emit event with error handling
            try {
                eventBus.emit('history:snapshot-captured', {
                    snapshot,
                    index: this.currentIndex
                });
            } catch (eventError) {
                this.logger.warn('HISTORY', 'Error emitting snapshot event', eventError);
            }
        } catch (error) {
            this.logger.error('HISTORY', 'Error capturing state snapshot', error);
            // Don't throw - just log and continue
        }
    }
    
    /**
     * Save snapshot for external calls (like from save-service)
     * GEMINI FIX: Enhanced with error handling and validation
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
        // Simple compression: store only changed properties
        if (this.currentIndex >= 0) {
            const previousSnapshot = this.history[this.currentIndex];
            if (previousSnapshot) {
                return this.createStateDiff(previousSnapshot.state, state);
            }
        }
        
        // First snapshot: store full state
        return {
            full: true,
            data: JSON.parse(JSON.stringify(state))
        };
    }

    /**
     * Create a diff between two states
     */
    createStateDiff(baseState, newState) {
        const diff = {
            full: false,
            changes: {},
            added: {},
            removed: []
        };

        // For simplicity, store full state for now
        // In production, implement proper diffing algorithm
        return {
            full: true,
            data: JSON.parse(JSON.stringify(newState))
        };
    }

    /**
     * Decompress state from storage
     */
    decompressState(compressedState) {
        if (compressedState.full) {
            return compressedState.data;
        }
        
        // Apply diff to reconstruct state
        // For now, we're storing full states
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
     * PHASE 3 FIX: Access enhancedStateManager through window
     */
    undo() {
        if (!this.canUndo()) {
            this.logger.warn('HISTORY', 'Cannot undo: at beginning of history');
            return false;
        }

        // Access state manager through window
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
        eventBus.emit('history:undo', {
            snapshot,
            index: this.currentIndex
        });

        this.isNavigating = false;
        return true;
    }

    /**
     * Navigate to next state (redo)
     * PHASE 3 FIX: Access enhancedStateManager through window
     */
    redo() {
        if (!this.canRedo()) {
            this.logger.warn('HISTORY', 'Cannot redo: at end of history');
            return false;
        }

        // Access state manager through window
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
        eventBus.emit('history:redo', {
            snapshot,
            index: this.currentIndex
        });

        this.isNavigating = false;
        return true;
    }

    /**
     * Jump to specific point in history
     * PHASE 3 FIX: Access enhancedStateManager through window
     */
    jumpTo(index) {
        if (index < 0 || index >= this.history.length) {
            throw new Error(`Invalid history index: ${index}`);
        }

        if (index === this.currentIndex) {
            return false;
        }

        // Access state manager through window
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
        eventBus.emit('history:jump', {
            snapshot,
            fromIndex: previousIndex,
            toIndex: index
        });

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
     * Find snapshots by criteria
     */
    findSnapshots(criteria) {
        return this.history.filter((snapshot, index) => {
            if (criteria.transaction && snapshot.metadata.transaction !== criteria.transaction) {
                return false;
            }
            
            if (criteria.after && snapshot.timestamp < criteria.after) {
                return false;
            }
            
            if (criteria.before && snapshot.timestamp > criteria.before) {
                return false;
            }
            
            return true;
        }).map((snapshot, index) => ({
            ...snapshot,
            index: this.history.indexOf(snapshot)
        }));
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

// Create singleton instance
export const stateHistory = new StateHistory();

// Expose globally for debugging
window.stateHistory = stateHistory;

// Export convenience methods
export const undo = stateHistory.undo.bind(stateHistory);
export const redo = stateHistory.redo.bind(stateHistory);
export const canUndo = stateHistory.canUndo.bind(stateHistory);
export const canRedo = stateHistory.canRedo.bind(stateHistory);
