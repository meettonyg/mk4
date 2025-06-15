/**
 * Undo/Redo functionality
 */

import { getState, setState } from '../state.js';
import { markUnsaved } from './save-service.js';
import { setupElementSelection, setupContentEditableUpdates } from '../ui/element-editor.js';

/**
 * Save the current state for undo/redo
 */
export function saveCurrentState() {
    const state = document.getElementById('media-kit-preview').innerHTML;
    const undoStack = getState('undoStack');
    
    setState('undoStack', [...undoStack, state]);
    setState('redoStack', []);
    
    // Limit undo stack to 50 items
    if (getState('undoStack').length > 50) {
        setState('undoStack', getState('undoStack').slice(1));
    }
    
    // Update button states
    document.getElementById('undo-btn').disabled = false;
    document.getElementById('redo-btn').disabled = true;
}

/**
 * Undo the last change
 */
export function undo() {
    const undoStack = getState('undoStack');
    const redoStack = getState('redoStack');
    
    if (undoStack.length > 0) {
        const currentState = document.getElementById('media-kit-preview').innerHTML;
        const newRedoStack = [...redoStack, currentState];
        
        const previousState = undoStack[undoStack.length - 1];
        const newUndoStack = undoStack.slice(0, -1);
        
        document.getElementById('media-kit-preview').innerHTML = previousState;
        
        // Re-attach event listeners
        setupElementSelection();
        setupContentEditableUpdates();

        // Update state
        setState('undoStack', newUndoStack);
        setState('redoStack', newRedoStack);

        // Update button states
        document.getElementById('undo-btn').disabled = newUndoStack.length === 0;
        document.getElementById('redo-btn').disabled = false;
        
        markUnsaved();
    }
}

/**
 * Redo the last undone change
 */
export function redo() {
    const undoStack = getState('undoStack');
    const redoStack = getState('redoStack');
    
    if (redoStack.length > 0) {
        const currentState = document.getElementById('media-kit-preview').innerHTML;
        const newUndoStack = [...undoStack, currentState];
        
        const nextState = redoStack[redoStack.length - 1];
        const newRedoStack = redoStack.slice(0, -1);
        
        document.getElementById('media-kit-preview').innerHTML = nextState;
        
        // Re-attach event listeners
        setupElementSelection();
        setupContentEditableUpdates();

        // Update state
        setState('undoStack', newUndoStack);
        setState('redoStack', newRedoStack);

        // Update button states
        document.getElementById('undo-btn').disabled = false;
        document.getElementById('redo-btn').disabled = newRedoStack.length === 0;
        
        markUnsaved();
    }
}
