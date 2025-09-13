/**
 * Enhanced State Manager with Reducer Pattern
 * 
 * Phase 2: State Management Enhancement
 * Implements predictable state mutations through dispatch and reducer pattern
 * 
 * @file EnhancedStateManager.js
 * @description Enhanced state management with action types and reducer pattern
 */

import ACTION_TYPES, { 
    createAction, 
    isValidActionType,
    COMPONENT_ACTIONS,
    LAYOUT_ACTIONS,
    SECTION_ACTIONS,
    THEME_ACTIONS,
    SETTINGS_ACTIONS,
    STATE_ACTIONS,
    TRANSACTION_ACTIONS,
    PERSISTENCE_ACTIONS
} from '../constants/actionTypes.js';

/**
 * State Schema Definition
 * Defines the shape of our application state
 */
const STATE_SCHEMA = {
    components: {}, // { [componentId]: ComponentData }
    layout: [], // Array of component IDs in order
    sections: [], // Array of section objects
    theme: 'default', // Current theme identifier
    themeSettings: {}, // Custom theme settings
    globalSettings: {
        layout: 'vertical', // vertical | horizontal | grid
        responsive: true,
        autoSave: true,
        autoSaveInterval: 30000
    },
    ui: {
        selectedComponent: null,
        hoveredComponent: null,
        isPreviewMode: false,
        isSaving: false,
        lastSaved: null
    },
    history: {
        past: [],
        future: [],
        maxHistorySize: 50
    },
    meta: {
        version: '2.2.0',
        lastModified: null,
        createdAt: null,
        author: null
    },
    errors: []
};

/**
 * Main Reducer Function
 * Pure function that returns new state based on action
 */
function mainReducer(state = STATE_SCHEMA, action) {
    // Log all actions for debugging
    if (window.gmkbData?.debugMode) {
        console.log('🔄 Reducer:', action.type, action.payload);
    }
    
    // Validate action type
    if (!isValidActionType(action.type)) {
        console.warn(`Unknown action type: ${action.type}`);
        return state;
    }
    
    // Create new state object for immutability
    let newState = { ...state };
    
    switch (action.type) {
        // ============ COMPONENT ACTIONS ============
        case COMPONENT_ACTIONS.ADD_COMPONENT: {
            const component = action.payload;
            if (!component.id) {
                console.error('ADD_COMPONENT: Component must have an id');
                return state;
            }
            
            // Ensure component has required fields
            const normalizedComponent = {
                id: component.id,
                type: component.type || 'unknown',
                props: component.props || {},
                content: component.content || {},
                sectionId: component.sectionId || null,
                order: component.order || newState.layout.length,
                createdAt: component.createdAt || Date.now(),
                updatedAt: Date.now(),
                ...component
            };
            
            // Add to components map
            newState.components = {
                ...newState.components,
                [component.id]: normalizedComponent
            };
            
            // Add to layout if not already present
            if (!newState.layout.includes(component.id)) {
                newState.layout = [...newState.layout, component.id];
            }
            
            // Add to section if specified
            if (component.sectionId) {
                newState = addComponentToSection(newState, component.id, component.sectionId);
            }
            
            break;
        }
        
        case COMPONENT_ACTIONS.UPDATE_COMPONENT: {
            const { id, updates } = action.payload;
            if (!newState.components[id]) {
                console.warn(`UPDATE_COMPONENT: Component ${id} not found`);
                return state;
            }
            
            newState.components = {
                ...newState.components,
                [id]: {
                    ...newState.components[id],
                    ...updates,
                    updatedAt: Date.now()
                }
            };
            break;
        }
        
        case COMPONENT_ACTIONS.DELETE_COMPONENT:
        case COMPONENT_ACTIONS.REMOVE_COMPONENT: {
            const componentId = typeof action.payload === 'string' ? action.payload : action.payload.id;
            
            if (!newState.components[componentId]) {
                console.warn(`DELETE_COMPONENT: Component ${componentId} not found`);
                return state;
            }
            
            // Get component info before deletion
            const component = newState.components[componentId];
            
            // Remove from components map
            const { [componentId]: deleted, ...remainingComponents } = newState.components;
            newState.components = remainingComponents;
            
            // Remove from layout
            newState.layout = newState.layout.filter(id => id !== componentId);
            
            // Remove from section if it was in one
            if (component.sectionId) {
                newState = removeComponentFromSection(newState, componentId, component.sectionId);
            }
            
            break;
        }
        
        case COMPONENT_ACTIONS.MOVE_COMPONENT: {
            const { componentId, direction, targetIndex } = action.payload;
            const currentIndex = newState.layout.indexOf(componentId);
            
            if (currentIndex === -1) {
                console.warn(`MOVE_COMPONENT: Component ${componentId} not in layout`);
                return state;
            }
            
            const newLayout = [...newState.layout];
            
            if (typeof targetIndex === 'number') {
                // Move to specific index
                newLayout.splice(currentIndex, 1);
                newLayout.splice(targetIndex, 0, componentId);
            } else if (direction === 'up' && currentIndex > 0) {
                // Swap with previous
                [newLayout[currentIndex], newLayout[currentIndex - 1]] = 
                [newLayout[currentIndex - 1], newLayout[currentIndex]];
            } else if (direction === 'down' && currentIndex < newLayout.length - 1) {
                // Swap with next
                [newLayout[currentIndex], newLayout[currentIndex + 1]] = 
                [newLayout[currentIndex + 1], newLayout[currentIndex]];
            }
            
            newState.layout = newLayout;
            break;
        }
        
        case COMPONENT_ACTIONS.DUPLICATE_COMPONENT: {
            const { componentId, newId } = action.payload;
            const original = newState.components[componentId];
            
            if (!original) {
                console.warn(`DUPLICATE_COMPONENT: Component ${componentId} not found`);
                return state;
            }
            
            const duplicateId = newId || `${componentId}_copy_${Date.now()}`;
            const duplicate = {
                ...original,
                id: duplicateId,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            
            // Add duplicate to components
            newState.components = {
                ...newState.components,
                [duplicateId]: duplicate
            };
            
            // Add to layout after original
            const originalIndex = newState.layout.indexOf(componentId);
            newState.layout = [
                ...newState.layout.slice(0, originalIndex + 1),
                duplicateId,
                ...newState.layout.slice(originalIndex + 1)
            ];
            
            break;
        }
        
        case COMPONENT_ACTIONS.BATCH_UPDATE_COMPONENTS: {
            const updates = action.payload; // { [componentId]: updates }
            const updatedComponents = { ...newState.components };
            
            Object.entries(updates).forEach(([componentId, componentUpdates]) => {
                if (updatedComponents[componentId]) {
                    updatedComponents[componentId] = {
                        ...updatedComponents[componentId],
                        ...componentUpdates,
                        updatedAt: Date.now()
                    };
                }
            });
            
            newState.components = updatedComponents;
            break;
        }
        
        case COMPONENT_ACTIONS.CLEAR_ALL_COMPONENTS: {
            newState.components = {};
            newState.layout = [];
            newState.sections = newState.sections.map(section => ({
                ...section,
                components: []
            }));
            break;
        }
        
        // ============ LAYOUT ACTIONS ============
        case LAYOUT_ACTIONS.SET_LAYOUT: {
            const newLayout = action.payload;
            
            // Validate that all IDs in layout exist in components
            const validLayout = newLayout.filter(id => newState.components[id]);
            
            if (validLayout.length !== newLayout.length) {
                console.warn('SET_LAYOUT: Some component IDs do not exist, filtered invalid IDs');
            }
            
            newState.layout = validLayout;
            break;
        }
        
        case LAYOUT_ACTIONS.UPDATE_LAYOUT_ORDER:
        case LAYOUT_ACTIONS.REORDER_COMPONENTS: {
            const { fromIndex, toIndex } = action.payload;
            const newLayout = [...newState.layout];
            const [removed] = newLayout.splice(fromIndex, 1);
            newLayout.splice(toIndex, 0, removed);
            newState.layout = newLayout;
            break;
        }
        
        // ============ SECTION ACTIONS ============
        case SECTION_ACTIONS.ADD_SECTION: {
            const section = {
                section_id: action.payload.section_id || `section_${Date.now()}`,
                section_type: action.payload.section_type || 'full_width',
                components: action.payload.components || [],
                layout: action.payload.layout || {},
                section_options: action.payload.section_options || {},
                created_at: Date.now(),
                updated_at: Date.now(),
                ...action.payload
            };
            
            newState.sections = [...newState.sections, section];
            break;
        }
        
        case SECTION_ACTIONS.UPDATE_SECTION: {
            const { sectionId, updates } = action.payload;
            newState.sections = newState.sections.map(section =>
                section.section_id === sectionId
                    ? { ...section, ...updates, updated_at: Date.now() }
                    : section
            );
            break;
        }
        
        case SECTION_ACTIONS.DELETE_SECTION: {
            const sectionId = action.payload;
            
            // Move components from deleted section to unassigned
            const section = newState.sections.find(s => s.section_id === sectionId);
            if (section && section.components) {
                section.components.forEach(comp => {
                    const componentId = comp.component_id || comp;
                    if (newState.components[componentId]) {
                        newState.components[componentId].sectionId = null;
                    }
                });
            }
            
            newState.sections = newState.sections.filter(s => s.section_id !== sectionId);
            break;
        }
        
        case SECTION_ACTIONS.UPDATE_SECTIONS: {
            newState.sections = action.payload;
            break;
        }
        
        // ============ THEME ACTIONS ============
        case THEME_ACTIONS.SET_THEME: {
            newState.theme = action.payload;
            break;
        }
        
        case THEME_ACTIONS.UPDATE_THEME_SETTINGS: {
            newState.themeSettings = {
                ...newState.themeSettings,
                ...action.payload
            };
            break;
        }
        
        // ============ SETTINGS ACTIONS ============
        case SETTINGS_ACTIONS.UPDATE_GLOBAL_SETTINGS: {
            newState.globalSettings = {
                ...newState.globalSettings,
                ...action.payload
            };
            break;
        }
        
        // ============ STATE ACTIONS ============
        case STATE_ACTIONS.SET_STATE: {
            // Complete state replacement
            newState = {
                ...STATE_SCHEMA,
                ...action.payload,
                meta: {
                    ...STATE_SCHEMA.meta,
                    ...action.payload.meta,
                    lastModified: Date.now()
                }
            };
            break;
        }
        
        case STATE_ACTIONS.RESET_STATE: {
            newState = { ...STATE_SCHEMA };
            break;
        }
        
        case STATE_ACTIONS.MERGE_STATE: {
            // Deep merge with existing state
            newState = deepMerge(newState, action.payload);
            break;
        }
        
        // ============ PERSISTENCE ACTIONS ============
        case PERSISTENCE_ACTIONS.SAVE_STATE_SUCCESS: {
            newState.ui = {
                ...newState.ui,
                isSaving: false,
                lastSaved: Date.now()
            };
            break;
        }
        
        case PERSISTENCE_ACTIONS.SAVE_STATE_FAILURE: {
            newState.ui = {
                ...newState.ui,
                isSaving: false
            };
            newState.errors = [
                ...newState.errors,
                {
                    type: 'SAVE_ERROR',
                    message: action.payload.message || 'Failed to save state',
                    timestamp: Date.now()
                }
            ];
            break;
        }
        
        // ============ UI ACTIONS ============
        case 'SELECT_COMPONENT': {
            newState.ui = {
                ...newState.ui,
                selectedComponent: action.payload
            };
            break;
        }
        
        case 'DESELECT_COMPONENT': {
            newState.ui = {
                ...newState.ui,
                selectedComponent: null
            };
            break;
        }
        
        case 'TOGGLE_PREVIEW_MODE': {
            newState.ui = {
                ...newState.ui,
                isPreviewMode: !newState.ui.isPreviewMode
            };
            break;
        }
        
        // ============ HISTORY ACTIONS ============
        case 'ADD_TO_HISTORY': {
            const { past } = newState.history;
            const maxSize = newState.history.maxHistorySize;
            
            newState.history = {
                ...newState.history,
                past: [...past.slice(-(maxSize - 1)), action.payload],
                future: [] // Clear future on new action
            };
            break;
        }
        
        case 'UNDO': {
            const { past, future } = newState.history;
            if (past.length === 0) return state;
            
            const previous = past[past.length - 1];
            newState = previous;
            newState.history = {
                ...newState.history,
                past: past.slice(0, -1),
                future: [state, ...future]
            };
            break;
        }
        
        case 'REDO': {
            const { past, future } = newState.history;
            if (future.length === 0) return state;
            
            const next = future[0];
            newState = next;
            newState.history = {
                ...newState.history,
                past: [...past, state],
                future: future.slice(1)
            };
            break;
        }
        
        default:
            return state;
    }
    
    // Update metadata
    newState.meta = {
        ...newState.meta,
        lastModified: Date.now()
    };
    
    return newState;
}

/**
 * Helper Functions
 */
function addComponentToSection(state, componentId, sectionId) {
    const newSections = state.sections.map(section => {
        if (section.section_id === sectionId) {
            const components = section.components || [];
            
            // Check if component already exists in section
            const exists = components.some(c => 
                (typeof c === 'string' ? c : c.component_id) === componentId
            );
            
            if (!exists) {
                return {
                    ...section,
                    components: [...components, {
                        component_id: componentId,
                        column: 1,
                        order: components.length,
                        assigned_at: Date.now()
                    }],
                    updated_at: Date.now()
                };
            }
        }
        return section;
    });
    
    return { ...state, sections: newSections };
}

function removeComponentFromSection(state, componentId, sectionId) {
    const newSections = state.sections.map(section => {
        if (section.section_id === sectionId) {
            return {
                ...section,
                components: section.components.filter(c => 
                    (typeof c === 'string' ? c : c.component_id) !== componentId
                ),
                updated_at: Date.now()
            };
        }
        return section;
    });
    
    return { ...state, sections: newSections };
}

function deepMerge(target, source) {
    const output = { ...target };
    
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    output[key] = source[key];
                } else {
                    output[key] = deepMerge(target[key], source[key]);
                }
            } else {
                output[key] = source[key];
            }
        });
    }
    
    return output;
}

function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Enhanced State Manager Class
 */
export class EnhancedStateManager {
    constructor(initialState = {}) {
        // Initialize with schema defaults merged with initial state
        this.state = mainReducer(undefined, { type: '@@INIT' });
        
        // Process WordPress data if available
        const wpState = this.processWordPressData(initialState);
        if (wpState && Object.keys(wpState).length > 0) {
            this.state = mainReducer(this.state, createAction(STATE_ACTIONS.MERGE_STATE, wpState));
        }
        
        // Subscribers for state changes
        this.listeners = new Set();
        
        // Middleware stack
        this.middleware = [];
        
        // Batch update tracking
        this.isBatching = false;
        this.batchQueue = [];
        
        // Initialize logging if debug mode
        if (window.gmkbData?.debugMode) {
            this.addMiddleware(this.loggingMiddleware);
        }
        
        // Initialize validation middleware
        this.addMiddleware(this.validationMiddleware);
        
        // Initialize persistence middleware
        this.addMiddleware(this.persistenceMiddleware);
        
        console.log('✅ Enhanced State Manager initialized with reducer pattern');
    }
    
    /**
     * Main dispatch method - all state changes go through here
     */
    dispatch(action) {
        // Ensure action has required structure
        if (!action.type) {
            console.error('Action must have a type property', action);
            return;
        }
        
        // Add metadata if not present
        if (!action.meta) {
            action.meta = {
                timestamp: Date.now(),
                id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
        }
        
        // If batching, queue the action
        if (this.isBatching) {
            this.batchQueue.push(action);
            return;
        }
        
        // Run through middleware
        let finalAction = action;
        for (const mw of this.middleware) {
            const result = mw(this.state, finalAction, this);
            if (result === false) {
                // Middleware cancelled the action
                return;
            }
            if (result && typeof result === 'object') {
                finalAction = result;
            }
        }
        
        // Store previous state for history
        const previousState = this.state;
        
        // Apply the reducer
        this.state = mainReducer(this.state, finalAction);
        
        // Check if state actually changed
        if (this.state !== previousState) {
            // Add to history if not a history action itself
            if (!['UNDO', 'REDO', 'ADD_TO_HISTORY'].includes(finalAction.type)) {
                this.dispatch({
                    type: 'ADD_TO_HISTORY',
                    payload: previousState
                });
            }
            
            // Notify all listeners
            this.notify();
        }
    }
    
    /**
     * Convenience methods for common actions
     */
    addComponent(component) {
        this.dispatch(createAction(COMPONENT_ACTIONS.ADD_COMPONENT, component));
    }
    
    updateComponent(id, updates) {
        this.dispatch(createAction(COMPONENT_ACTIONS.UPDATE_COMPONENT, { id, updates }));
    }
    
    removeComponent(componentId) {
        this.dispatch(createAction(COMPONENT_ACTIONS.REMOVE_COMPONENT, componentId));
    }
    
    moveComponent(componentId, direction) {
        this.dispatch(createAction(COMPONENT_ACTIONS.MOVE_COMPONENT, { componentId, direction }));
    }
    
    duplicateComponent(componentId, newId) {
        this.dispatch(createAction(COMPONENT_ACTIONS.DUPLICATE_COMPONENT, { componentId, newId }));
    }
    
    setLayout(layout) {
        this.dispatch(createAction(LAYOUT_ACTIONS.SET_LAYOUT, layout));
    }
    
    addSection(section) {
        this.dispatch(createAction(SECTION_ACTIONS.ADD_SECTION, section));
    }
    
    updateSection(sectionId, updates) {
        this.dispatch(createAction(SECTION_ACTIONS.UPDATE_SECTION, { sectionId, updates }));
    }
    
    deleteSection(sectionId) {
        this.dispatch(createAction(SECTION_ACTIONS.DELETE_SECTION, sectionId));
    }
    
    setTheme(theme) {
        this.dispatch(createAction(THEME_ACTIONS.SET_THEME, theme));
    }
    
    updateGlobalSettings(settings) {
        this.dispatch(createAction(SETTINGS_ACTIONS.UPDATE_GLOBAL_SETTINGS, settings));
    }
    
    setState(newState) {
        this.dispatch(createAction(STATE_ACTIONS.SET_STATE, newState));
    }
    
    resetState() {
        this.dispatch(createAction(STATE_ACTIONS.RESET_STATE));
    }
    
    undo() {
        this.dispatch({ type: 'UNDO' });
    }
    
    redo() {
        this.dispatch({ type: 'REDO' });
    }
    
    /**
     * Batch updates for performance
     */
    startBatch() {
        this.isBatching = true;
        this.batchQueue = [];
    }
    
    endBatch() {
        if (!this.isBatching) return;
        
        this.isBatching = false;
        const actions = [...this.batchQueue];
        this.batchQueue = [];
        
        // Process all queued actions
        actions.forEach(action => this.dispatch(action));
    }
    
    /**
     * State access methods
     */
    getState() {
        // Return a deep copy to prevent direct mutation
        return JSON.parse(JSON.stringify(this.state));
    }
    
    getComponent(componentId) {
        return this.state.components[componentId];
    }
    
    getComponents() {
        return Object.values(this.state.components);
    }
    
    getLayout() {
        return [...this.state.layout];
    }
    
    getSections() {
        return [...this.state.sections];
    }
    
    getTheme() {
        return this.state.theme;
    }
    
    getGlobalSettings() {
        return { ...this.state.globalSettings };
    }
    
    /**
     * Subscribe to state changes
     */
    subscribe(listener) {
        this.listeners.add(listener);
        
        // Immediately call with current state
        listener(this.getState());
        
        // Return unsubscribe function
        return () => {
            this.listeners.delete(listener);
        };
    }
    
    /**
     * Notify all listeners of state change
     */
    notify() {
        const state = this.getState();
        this.listeners.forEach(listener => {
            try {
                listener(state);
            } catch (error) {
                console.error('Error in state listener:', error);
            }
        });
        
        // Dispatch custom event for other systems
        document.dispatchEvent(new CustomEvent('gmkb:state-changed', {
            detail: {
                state,
                timestamp: Date.now()
            }
        }));
    }
    
    /**
     * Add middleware
     */
    addMiddleware(middleware) {
        this.middleware.push(middleware);
    }
    
    /**
     * Built-in middleware
     */
    loggingMiddleware = (state, action, manager) => {
        console.group(`🔄 Action: ${action.type}`);
        console.log('Payload:', action.payload);
        console.log('Previous State:', state);
        console.log('Meta:', action.meta);
        console.groupEnd();
        return action;
    }
    
    validationMiddleware = (state, action, manager) => {
        // Validate action types
        if (!isValidActionType(action.type)) {
            console.warn(`Invalid action type: ${action.type}`);
            // Allow unknown actions to pass through for backward compatibility
        }
        
        // Validate component actions
        if (action.type === COMPONENT_ACTIONS.ADD_COMPONENT) {
            const component = action.payload;
            if (!component.id) {
                console.error('Component must have an id');
                return false; // Cancel action
            }
            if (!component.type) {
                console.warn('Component should have a type');
            }
        }
        
        return action;
    }
    
    persistenceMiddleware = (state, action, manager) => {
        // Skip persistence for UI-only actions
        const skipPersistence = [
            'SELECT_COMPONENT',
            'DESELECT_COMPONENT',
            'HOVER_COMPONENT',
            'FOCUS_COMPONENT'
        ];
        
        if (!skipPersistence.includes(action.type)) {
            // Schedule save (debounced)
            if (manager.saveTimeout) {
                clearTimeout(manager.saveTimeout);
            }
            manager.saveTimeout = setTimeout(() => {
                manager.saveToStorage();
            }, 1000);
        }
        
        return action;
    }
    
    /**
     * Save state to localStorage
     */
    saveToStorage() {
        try {
            const stateToSave = {
                components: this.state.components,
                layout: this.state.layout,
                sections: this.state.sections,
                theme: this.state.theme,
                themeSettings: this.state.themeSettings,
                globalSettings: this.state.globalSettings,
                meta: this.state.meta
            };
            
            localStorage.setItem('gmkb_state', JSON.stringify(stateToSave));
            
            this.dispatch({
                type: PERSISTENCE_ACTIONS.SAVE_STATE_SUCCESS
            });
            
            console.log('✅ State saved to localStorage');
        } catch (error) {
            console.error('Failed to save state:', error);
            
            this.dispatch({
                type: PERSISTENCE_ACTIONS.SAVE_STATE_FAILURE,
                payload: { message: error.message }
            });
        }
    }
    
    /**
     * Process WordPress data into proper state format
     */
    processWordPressData(data) {
        if (!data || typeof data !== 'object') {
            return {};
        }
        
        // If it's already in the correct format, return as-is
        if (data.components && typeof data.components === 'object') {
            return data;
        }
        
        // Convert saved_components array to components object
        if (data.saved_components && Array.isArray(data.saved_components)) {
            const components = {};
            const layout = [];
            
            data.saved_components.forEach(comp => {
                if (comp && comp.id) {
                    components[comp.id] = comp;
                    layout.push(comp.id);
                }
            });
            
            return {
                components,
                layout,
                sections: data.sections || [],
                theme: data.theme || 'default',
                globalSettings: data.globalSettings || data.global_settings || {},
                meta: {
                    ...data.meta,
                    version: data.version || '2.2.0'
                }
            };
        }
        
        return data;
    }
    
    /**
     * Load state from localStorage
     */
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('gmkb_state');
            if (saved) {
                const loadedState = JSON.parse(saved);
                this.dispatch(createAction(STATE_ACTIONS.MERGE_STATE, loadedState));
                console.log('✅ State loaded from localStorage');
                return true;
            }
        } catch (error) {
            console.error('Failed to load state:', error);
        }
        return false;
    }
    
    /**
     * Debug helper
     */
    debug() {
        console.group('%c🔍 Enhanced State Manager Debug', 'font-size: 14px; font-weight: bold; color: #4CAF50');
        console.log('Current State:', this.getState());
        console.log('Components:', Object.keys(this.state.components).length);
        console.log('Sections:', this.state.sections.length);
        console.log('Layout:', this.state.layout);
        console.log('Theme:', this.state.theme);
        console.log('Listeners:', this.listeners.size);
        console.log('History:', {
            past: this.state.history.past.length,
            future: this.state.history.future.length
        });
        console.log('Is Batching:', this.isBatching);
        console.log('Batch Queue:', this.batchQueue.length);
        console.groupEnd();
    }
}

// Export for use in other modules
export default EnhancedStateManager;
