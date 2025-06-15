/**
 * Global state management for the Guestify Media Kit Builder
 */

// Global state object
const state = {
    draggedComponent: null,
    selectedElement: null,
    undoStack: [],
    redoStack: [],
    isUnsaved: false,
    currentTheme: 'blue',
};

/**
 * Get a state value
 * @param {string} key - The state key to retrieve
 * @returns {*} The state value
 */
export function getState(key) {
    return state[key];
}

/**
 * Set a state value
 * @param {string} key - The state key to set
 * @param {*} value - The value to set
 */
export function setState(key, value) {
    state[key] = value;
}

/**
 * Reset all state to default values
 */
export function resetState() {
    state.draggedComponent = null;
    state.selectedElement = null;
    state.undoStack = [];
    state.redoStack = [];
    state.isUnsaved = false;
    state.currentTheme = 'blue';
}

export default state;
