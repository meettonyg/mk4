/**
 * Action Types for Media Kit Builder State Management
 * 
 * Following Phase 2: State Management Enhancement
 * These action types ensure predictable state mutations and better debugging
 * 
 * @file actionTypes.js
 * @description Centralized action type constants for the reducer pattern
 */

// Component Actions
export const COMPONENT_ACTIONS = {
    ADD_COMPONENT: 'ADD_COMPONENT',
    UPDATE_COMPONENT: 'UPDATE_COMPONENT',
    DELETE_COMPONENT: 'DELETE_COMPONENT',
    REMOVE_COMPONENT: 'REMOVE_COMPONENT', // Alias for DELETE_COMPONENT
    MOVE_COMPONENT: 'MOVE_COMPONENT',
    DUPLICATE_COMPONENT: 'DUPLICATE_COMPONENT',
    UPDATE_COMPONENT_PROPS: 'UPDATE_COMPONENT_PROPS',
    UPDATE_COMPONENT_CONTENT: 'UPDATE_COMPONENT_CONTENT',
    BATCH_UPDATE_COMPONENTS: 'BATCH_UPDATE_COMPONENTS',
    CLEAR_ALL_COMPONENTS: 'CLEAR_ALL_COMPONENTS'
};

// Layout Actions  
export const LAYOUT_ACTIONS = {
    SET_LAYOUT: 'SET_LAYOUT',
    UPDATE_LAYOUT_ORDER: 'UPDATE_LAYOUT_ORDER',
    REORDER_COMPONENTS: 'REORDER_COMPONENTS',
    UPDATE_COMPONENT_ORDER: 'UPDATE_COMPONENT_ORDER'
};

// Section Actions (Phase 3 Support)
export const SECTION_ACTIONS = {
    ADD_SECTION: 'ADD_SECTION',
    UPDATE_SECTION: 'UPDATE_SECTION',
    DELETE_SECTION: 'DELETE_SECTION',
    UPDATE_SECTIONS: 'UPDATE_SECTIONS',
    MOVE_SECTION: 'MOVE_SECTION',
    UPDATE_SECTION_LAYOUT: 'UPDATE_SECTION_LAYOUT',
    ASSIGN_COMPONENT_TO_SECTION: 'ASSIGN_COMPONENT_TO_SECTION',
    REMOVE_COMPONENT_FROM_SECTION: 'REMOVE_COMPONENT_FROM_SECTION',
    REORDER_SECTION_COMPONENTS: 'REORDER_SECTION_COMPONENTS'
};

// Theme Actions
export const THEME_ACTIONS = {
    SET_THEME: 'SET_THEME',
    UPDATE_THEME: 'UPDATE_THEME',
    UPDATE_THEME_SETTINGS: 'UPDATE_THEME_SETTINGS',
    RESET_THEME: 'RESET_THEME',
    APPLY_CUSTOM_THEME: 'APPLY_CUSTOM_THEME'
};

// Global Settings Actions
export const SETTINGS_ACTIONS = {
    UPDATE_GLOBAL_SETTINGS: 'UPDATE_GLOBAL_SETTINGS',
    SET_GLOBAL_SETTINGS: 'SET_GLOBAL_SETTINGS',
    UPDATE_LAYOUT_MODE: 'UPDATE_LAYOUT_MODE',
    UPDATE_RESPONSIVE_SETTINGS: 'UPDATE_RESPONSIVE_SETTINGS',
    UPDATE_META_SETTINGS: 'UPDATE_META_SETTINGS'
};

// State Management Actions
export const STATE_ACTIONS = {
    SET_STATE: 'SET_STATE',
    RESET_STATE: 'RESET_STATE',
    LOAD_STATE: 'LOAD_STATE',
    MERGE_STATE: 'MERGE_STATE',
    IMPORT_STATE: 'IMPORT_STATE',
    EXPORT_STATE: 'EXPORT_STATE',
    CLEAR_STATE: 'CLEAR_STATE'
};

// Transaction Actions (for batch operations)
export const TRANSACTION_ACTIONS = {
    START_BATCH: 'START_BATCH',
    END_BATCH: 'END_BATCH',
    COMMIT_TRANSACTION: 'COMMIT_TRANSACTION',
    ROLLBACK_TRANSACTION: 'ROLLBACK_TRANSACTION'
};

// Save/Load Actions
export const PERSISTENCE_ACTIONS = {
    SAVE_STATE: 'SAVE_STATE',
    SAVE_STATE_SUCCESS: 'SAVE_STATE_SUCCESS',
    SAVE_STATE_FAILURE: 'SAVE_STATE_FAILURE',
    LOAD_STATE_REQUEST: 'LOAD_STATE_REQUEST',
    LOAD_STATE_SUCCESS: 'LOAD_STATE_SUCCESS',
    LOAD_STATE_FAILURE: 'LOAD_STATE_FAILURE',
    AUTO_SAVE: 'AUTO_SAVE',
    MANUAL_SAVE: 'MANUAL_SAVE'
};

// UI Actions (for UI state that might affect components)
export const UI_ACTIONS = {
    SELECT_COMPONENT: 'SELECT_COMPONENT',
    DESELECT_COMPONENT: 'DESELECT_COMPONENT',
    HOVER_COMPONENT: 'HOVER_COMPONENT',
    FOCUS_COMPONENT: 'FOCUS_COMPONENT',
    OPEN_COMPONENT_SETTINGS: 'OPEN_COMPONENT_SETTINGS',
    CLOSE_COMPONENT_SETTINGS: 'CLOSE_COMPONENT_SETTINGS',
    TOGGLE_PREVIEW_MODE: 'TOGGLE_PREVIEW_MODE'
};

// History Actions (for undo/redo)
export const HISTORY_ACTIONS = {
    UNDO: 'UNDO',
    REDO: 'REDO',
    ADD_TO_HISTORY: 'ADD_TO_HISTORY',
    CLEAR_HISTORY: 'CLEAR_HISTORY',
    SET_HISTORY_POINTER: 'SET_HISTORY_POINTER'
};

// Error Actions
export const ERROR_ACTIONS = {
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
    LOG_ERROR: 'LOG_ERROR'
};

// Combine all action types for easy import
export const ACTION_TYPES = {
    ...COMPONENT_ACTIONS,
    ...LAYOUT_ACTIONS,
    ...SECTION_ACTIONS,
    ...THEME_ACTIONS,
    ...SETTINGS_ACTIONS,
    ...STATE_ACTIONS,
    ...TRANSACTION_ACTIONS,
    ...PERSISTENCE_ACTIONS,
    ...UI_ACTIONS,
    ...HISTORY_ACTIONS,
    ...ERROR_ACTIONS
};

// Action type validation helper
export const isValidActionType = (type) => {
    return Object.values(ACTION_TYPES).includes(type);
};

// Action creator helpers
export const createAction = (type, payload, meta = {}) => {
    if (!isValidActionType(type)) {
        console.warn(`Invalid action type: ${type}`);
    }
    
    return {
        type,
        payload,
        meta: {
            ...meta,
            timestamp: Date.now(),
            id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
    };
};

// Batch action creator
export const createBatchAction = (actions) => {
    return createAction(TRANSACTION_ACTIONS.START_BATCH, {
        actions,
        batchId: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
};

// Export default
export default ACTION_TYPES;
