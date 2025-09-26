/**
 * Pinia Plugin for Undo/Redo functionality
 * Best practice implementation - no legacy dependencies
 * 
 * @version 1.0.0
 */

export function createUndoRedoPlugin() {
    return ({ store }) => {
        // Only apply to mediaKit store
        if (store.$id !== 'mediaKit') return;
        
        // Initialize undo/redo state
        store.$state._history = [];
        store.$state._historyIndex = -1;
        store.$state._maxHistorySize = 50;
        store.$state._isUndoingOrRedoing = false;
        
        // Create snapshot of current state
        const createSnapshot = (state) => {
            return {
                components: JSON.parse(JSON.stringify(state.components)),
                sections: JSON.parse(JSON.stringify(state.sections)),
                theme: state.theme,
                themeCustomizations: JSON.parse(JSON.stringify(state.themeCustomizations))
            };
        };
        
        // Apply snapshot to state
        const applySnapshot = (snapshot) => {
            store.$patch((state) => {
                state.components = snapshot.components;
                state.sections = snapshot.sections;
                state.theme = snapshot.theme;
                state.themeCustomizations = snapshot.themeCustomizations;
            });
        };
        
        // Subscribe to all mutations
        store.$subscribe((mutation, state) => {
            // Skip if we're in undo/redo operation
            if (state._isUndoingOrRedoing) return;
            
            // Skip internal history mutations
            if (mutation.events?.some(e => e.key?.startsWith('_history'))) return;
            
            // Create snapshot and add to history
            const snapshot = createSnapshot(state);
            
            // Remove future history if we're not at the end
            if (state._historyIndex < state._history.length - 1) {
                state._history = state._history.slice(0, state._historyIndex + 1);
            }
            
            // Add new snapshot
            state._history.push({
                snapshot,
                timestamp: Date.now(),
                mutation: mutation.type
            });
            
            // Limit history size
            if (state._history.length > state._maxHistorySize) {
                state._history.shift();
            } else {
                state._historyIndex++;
            }
        });
        
        // Add undo action
        store.undo = function() {
            if (this._historyIndex <= 0) {
                console.log('Nothing to undo');
                return false;
            }
            
            this._isUndoingOrRedoing = true;
            this._historyIndex--;
            
            const historyEntry = this._history[this._historyIndex];
            if (historyEntry) {
                applySnapshot(historyEntry.snapshot);
                console.log(`Undone: ${historyEntry.mutation || 'state change'}`);
            }
            
            // Reset flag after next tick
            setTimeout(() => {
                this._isUndoingOrRedoing = false;
            }, 0);
            
            return true;
        };
        
        // Add redo action
        store.redo = function() {
            if (this._historyIndex >= this._history.length - 1) {
                console.log('Nothing to redo');
                return false;
            }
            
            this._isUndoingOrRedoing = true;
            this._historyIndex++;
            
            const historyEntry = this._history[this._historyIndex];
            if (historyEntry) {
                applySnapshot(historyEntry.snapshot);
                console.log(`Redone: ${historyEntry.mutation || 'state change'}`);
            }
            
            // Reset flag after next tick
            setTimeout(() => {
                this._isUndoingOrRedoing = false;
            }, 0);
            
            return true;
        };
        
        // Add computed properties for UI
        store.canUndo = function() {
            return this._historyIndex > 0;
        };
        
        store.canRedo = function() {
            return this._historyIndex < this._history.length - 1;
        };
        
        store.clearHistory = function() {
            this._history = [];
            this._historyIndex = -1;
            console.log('History cleared');
        };
        
        store.getHistoryInfo = function() {
            return {
                size: this._history.length,
                index: this._historyIndex,
                canUndo: this.canUndo(),
                canRedo: this.canRedo()
            };
        };
    };
}
