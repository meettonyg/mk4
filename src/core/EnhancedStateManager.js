/**
 * Enhanced State Manager with Reducer Pattern
 * 
 * Phase 2: State Management Enhancement
 * Implements predictable state mutations through dispatch and reducer pattern
 * 
 * @file EnhancedStateManager.js
 * @description Enhanced state management with action types and reducer pattern
 */

import HistoryManager from './HistoryManager.js';
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
    components: {}, // { [componentId]: ComponentData } - MUST be object, not array
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
        past: [],  // TODO: Implement diff-based history instead of full state copies
        future: [],
        maxHistorySize: 10  // Limited to 10 entries when properly implemented
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
    // Log all actions for debugging (except @@INIT)
    if (window.gmkbData?.debugMode && action.type !== '@@INIT') {
        console.log('🔄 Reducer:', action.type, action.payload);
    }
    
    // Handle special initialization action
    if (action.type === '@@INIT') {
        return state;
    }
    
    // Validate action type
    if (!isValidActionType(action.type)) {
        // Only warn about non-init actions
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
            
            // ROOT FIX: If no sections exist, create a default one
            if (!newState.sections || newState.sections.length === 0) {
                const defaultSectionId = `section_default_${Date.now()}`;
                newState.sections = [{
                    section_id: defaultSectionId,
                    section_type: 'full_width',
                    type: 'full_width',
                    components: [],
                    layout: {},
                    section_options: {},
                    created_at: Date.now(),
                    updated_at: Date.now()
                }];
                console.log('Created default section for new component');
            }
            
            // ROOT FIX: Ensure component has a sectionId
            if (!component.sectionId && newState.sections.length > 0) {
                // Assign to first section by default
                component.sectionId = newState.sections[0].section_id;
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
            
            // ROOT FIX: Ensure components is an object before adding
            if (Array.isArray(newState.components)) {
                console.warn('ROOT FIX: Converting components from array to object before adding');
                newState.components = {};
            }
            
            // Add to components map
            newState.components = {
                ...newState.components,
                [component.id]: normalizedComponent
            };
            
            // ROOT FIX: When sections exist, ONLY track in sections, NOT in layout
            // This prevents double rendering - components should be in ONE place only
            if (normalizedComponent.sectionId) {
                // Component is in a section - add to section ONLY
                newState = addComponentToSection(newState, component.id, normalizedComponent.sectionId);
                // DO NOT add to layout array when using sections
            } else if (newState.sections.length === 0) {
                // No sections - use flat layout mode
                if (!newState.layout.includes(component.id)) {
                    newState.layout = [...newState.layout, component.id];
                }
            }
            // If sections exist but component has no sectionId, it's orphaned
            // Don't add to layout - it won't render
            
            // ROOT FIX: Dispatch event when component is added so controls can re-attach
            setTimeout(() => {
                document.dispatchEvent(new CustomEvent('gmkb:component-added', {
                    detail: { componentId: component.id, type: component.type }
                }));
            }, 0);
            
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
            
            // ROOT FIX: Ensure components is an object
            if (Array.isArray(newState.components)) {
                newState.components = {};
            }
            break;
        }
        
        case STATE_ACTIONS.RESET_STATE: {
            newState = { ...STATE_SCHEMA };
            break;
        }
        
        case STATE_ACTIONS.MERGE_STATE: {
            // Deep merge with existing state
            const mergedState = deepMerge(newState, action.payload);
            
            // ROOT FIX: If incoming state has no sections but current state has properly configured sections,
            // don't overwrite them. This prevents localStorage from clearing section assignments.
            if (action.payload.sections && 
                Array.isArray(action.payload.sections) && 
                action.payload.sections.length === 0 &&
                newState.sections && 
                newState.sections.length > 0) {
                // Keep existing sections if they have components assigned
                const hasAssignedComponents = newState.sections.some(s => 
                    s.components && s.components.length > 0
                );
                
                if (hasAssignedComponents) {
                    console.log('Preserving existing sections with assigned components');
                    mergedState.sections = newState.sections;
                }
            }
            
            newState = mergedState;
            
            // ROOT FIX: Ensure components is an object after merge
            if (Array.isArray(newState.components)) {
                newState.components = {};
            }
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
            // DISABLED - History was causing exponential data growth
            return state;
            /*
            const { past } = newState.history;
            const maxSize = newState.history.maxHistorySize;
            
            newState.history = {
                ...newState.history,
                past: [...past.slice(-(maxSize - 1)), action.payload],
                future: [] // Clear future on new action
            };
            break;
            */
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
        
        // ROOT FIX: Clean up any corrupted localStorage state before processing
        this.cleanupCorruptedLocalStorage();
        
        // Process WordPress data if available
        const wpState = this.processWordPressData(initialState);
        if (wpState && Object.keys(wpState).length > 0) {
            this.state = mainReducer(this.state, createAction(STATE_ACTIONS.MERGE_STATE, wpState));
        }
        
        // ROOT FIX: Ensure components is always an object, never an array
        if (Array.isArray(this.state.components)) {
            console.warn('ROOT FIX: Converting components from array to object');
            this.state.components = {};
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
        
        // Initialize proper history manager
        this.historyManager = new HistoryManager(10); // Max 10 undo levels
        
        console.log('✅ Enhanced State Manager initialized with reducer pattern and proper history');
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
            // FIXED: Use the new HistoryManager instead of storing full states
            const skipHistory = [
                'UNDO', 
                'REDO', 
                'ADD_TO_HISTORY',  // No longer used
                PERSISTENCE_ACTIONS.SAVE_STATE_SUCCESS,
                PERSISTENCE_ACTIONS.SAVE_STATE_FAILURE,
                PERSISTENCE_ACTIONS.LOAD_STATE_SUCCESS,
                PERSISTENCE_ACTIONS.LOAD_STATE_FAILURE
            ];
            
            if (!skipHistory.includes(finalAction.type)) {
                // Record action in the new history manager (stores only diffs)
                this.historyManager.recordAction(finalAction);
                
                if (window.gmkbData?.debugMode) {
                    const stats = this.historyManager.getStats();
                    console.log(`📜 History: ${stats.pastCount} undo levels, ~${(stats.estimatedSize / 1024).toFixed(1)}KB`);
                }
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
        // Store previous values for undo
        const currentComponent = this.state.components[id];
        const previousValues = {};
        
        if (currentComponent) {
            // Store only the properties being updated
            Object.keys(updates).forEach(key => {
                previousValues[key] = currentComponent[key];
            });
        }
        
        this.dispatch(createAction(COMPONENT_ACTIONS.UPDATE_COMPONENT, { 
            id, 
            updates,
            previousValues // Include for undo functionality
        }));
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
        // Use the new HistoryManager to get the inverse action
        const inverseAction = this.historyManager.undo();
        
        if (inverseAction) {
            // Temporarily disable history recording while undoing
            this.historyManager.isRecording = false;
            this.dispatch(inverseAction);
            this.historyManager.isRecording = true;
            
            console.log('⟲ Undo:', inverseAction.type);
            return true;
        }
        
        console.log('⚠️ No actions to undo');
        return false;
    }
    
    redo() {
        // Use the new HistoryManager to get the action to redo
        const actionToRedo = this.historyManager.redo();
        
        if (actionToRedo) {
            // Temporarily disable history recording while redoing
            this.historyManager.isRecording = false;
            this.dispatch(actionToRedo);
            this.historyManager.isRecording = true;
            
            console.log('⟳ Redo:', actionToRedo.type);
            return true;
        }
        
        console.log('⚠️ No actions to redo');
        return false;
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
        const stateCopy = JSON.parse(JSON.stringify(this.state));
        
        // ROOT FIX: Ensure components is always an object in returned state
        if (Array.isArray(stateCopy.components)) {
            stateCopy.components = {};
        }
        
        return stateCopy;
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
        // Skip persistence for UI-only actions and HISTORY actions
        const skipPersistence = [
            'SELECT_COMPONENT',
            'DESELECT_COMPONENT',
            'HOVER_COMPONENT',
            'FOCUS_COMPONENT',
            'ADD_TO_HISTORY',  // Don't trigger save for history actions
            'UNDO',
            'REDO',
            PERSISTENCE_ACTIONS.SAVE_STATE_SUCCESS,
            PERSISTENCE_ACTIONS.SAVE_STATE_FAILURE
        ];
        
        if (!skipPersistence.includes(action.type)) {
            // ROOT FIX: Only auto-save to localStorage for drafts, not existing posts
            // For existing posts, localStorage is only for emergency recovery
            const postId = window.gmkbData?.postId;
            const isDraft = !postId || postId === 'new' || postId === '0';
            
            if (isDraft) {
                // Schedule save for drafts (debounced)
                if (manager.saveTimeout) {
                    clearTimeout(manager.saveTimeout);
                }
                manager.saveTimeout = setTimeout(() => {
                    manager.saveToStorage();
                }, 1000);
            }
            // For existing posts, rely on auto-save to WordPress database instead
        }
        
        return action;
    }
    
    /**
     * Save state to localStorage
     * ROOT FIX: Post-aware localStorage with proper key naming
     */
    saveToStorage() {
        try {
            // ROOT FIX: Use post-specific key or draft key
            const postId = window.gmkbData?.postId;
            const storageKey = postId && postId !== 'new' && postId !== '0' 
                ? `gmkb_state_post_${postId}`  // Post-specific key
                : 'gmkb_state_draft';           // Draft for new media kits
            
            const stateToSave = {
                components: this.state.components,
                layout: this.state.layout,
                sections: this.state.sections,
                theme: this.state.theme,
                themeSettings: this.state.themeSettings,
                globalSettings: this.state.globalSettings,
                meta: {
                    ...this.state.meta,
                    savedAt: Date.now(),
                    postId: postId || 'draft'
                }
            };
            
            // ROOT FIX: Validate state before saving
            // Never save components without proper sections
            if (stateToSave.components && Object.keys(stateToSave.components).length > 0) {
                if (!stateToSave.sections || stateToSave.sections.length === 0) {
                    console.warn('Fixing invalid state before saving: components without sections');
                    // Create default section with all components
                    const componentIds = stateToSave.layout || Object.keys(stateToSave.components);
                    stateToSave.sections = [{
                        section_id: `section_default_${Date.now()}`,
                        section_type: 'full_width',
                        type: 'full_width',
                        components: componentIds.map(id => ({
                            component_id: id,
                            column: 1,
                            order: componentIds.indexOf(id),
                            assigned_at: Date.now()
                        })),
                        layout: {},
                        section_options: {},
                        created_at: Date.now(),
                        updated_at: Date.now()
                    }];
                }
            }
            
            localStorage.setItem(storageKey, JSON.stringify(stateToSave));
            
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
     * Clean up corrupted localStorage state
     * ROOT FIX: Clean up old localStorage keys and fix corrupted data
     */
    cleanupCorruptedLocalStorage() {
        try {
            // ROOT FIX: Migrate from old key format
            const oldKey = 'gmkb_state';
            const oldState = localStorage.getItem(oldKey);
            
            if (oldState) {
                console.log('🔧 Migrating from old localStorage key format');
                
                // Remove the old key - we'll use post-specific keys going forward
                localStorage.removeItem(oldKey);
                
                // Only migrate if we're not editing a specific post
                // (If editing a post, WordPress data is the source of truth)
                const postId = window.gmkbData?.postId;
                if (!postId || postId === 'new' || postId === '0') {
                    // Save as draft for potential recovery
                    const state = JSON.parse(oldState);
                    
                    // Fix corrupted state if needed
                    if (state.components && 
                        Object.keys(state.components).length > 0 && 
                        (!state.sections || state.sections.length === 0)) {
                        
                        console.log('Fixing corrupted state during migration');
                        const componentIds = state.layout || Object.keys(state.components);
                        state.sections = [{
                            section_id: `section_recovered_${Date.now()}`,
                            section_type: 'full_width',
                            type: 'full_width',
                            components: componentIds.map(id => ({
                                component_id: id,
                                column: 1,
                                order: componentIds.indexOf(id),
                                assigned_at: Date.now()
                            })),
                            layout: {},
                            section_options: {},
                            created_at: Date.now(),
                            updated_at: Date.now()
                        }];
                    }
                    
                    // Save as draft
                    localStorage.setItem('gmkb_state_draft', JSON.stringify(state));
                    console.log('✅ Migrated old localStorage to draft');
                } else {
                    console.log('✅ Removed old localStorage - using WordPress data for post', postId);
                }
            }
        } catch (error) {
            console.error('Error cleaning up localStorage:', error);
        }
    }
    
    /**
     * Process WordPress data into proper state format
     */
    processWordPressData(data) {
        if (!data || typeof data !== 'object') {
            return {};
        }
        
        let processedData = {};
        
        // If it's already in the correct format, start with that
        if (data.components && typeof data.components === 'object') {
            // ROOT FIX: Ensure components is an object, not an array
            if (Array.isArray(data.components) && data.components.length === 0) {
                // Convert empty array to empty object
                processedData = { ...data, components: {} };
            } else {
                processedData = { ...data };
            }
        }
        // Convert saved_components array to components object
        else if (data.saved_components && Array.isArray(data.saved_components)) {
            const components = {};
            const layout = [];
            
            data.saved_components.forEach(comp => {
                if (comp && comp.id) {
                    components[comp.id] = comp;
                    layout.push(comp.id);
                }
            });
            
            processedData = {
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
        } else {
            processedData = data;
        }
        
        // ROOT FIX: Check if we have orphaned components in sections but not in components object
        // This happens when components are added to sections but not to the main components map
        if (processedData.sections && processedData.sections.length > 0) {
            // First, collect all component IDs referenced in sections
            const componentsInSections = new Set();
            processedData.sections.forEach(section => {
                if (section.components && Array.isArray(section.components)) {
                    section.components.forEach(comp => {
                        const compId = typeof comp === 'string' ? comp : (comp.component_id || comp.id);
                        if (compId) {
                            componentsInSections.add(compId);
                        }
                    });
                }
            });
            
            // Initialize components object if it doesn't exist
            if (!processedData.components || Array.isArray(processedData.components)) {
                processedData.components = {};
            }
            
            // Check for missing components
            const missingComponents = Array.from(componentsInSections).filter(id => !processedData.components[id]);
            
            if (missingComponents.length > 0) {
                console.warn(`Found ${missingComponents.length} components in sections but not in components object:`, missingComponents);
                
                // Reconstruct missing components with minimal data
                // These will be properly populated when the component renders
                missingComponents.forEach(id => {
                    // Extract type from ID if possible (format: type_timestamp_random)
                    const parts = id.split('_');
                    const type = parts.length > 2 ? parts[0] : 'unknown';
                    
                    // Find which section this component belongs to
                    let sectionId = null;
                    processedData.sections.forEach(section => {
                        if (section.components) {
                            const hasComponent = section.components.some(comp => {
                                const compId = typeof comp === 'string' ? comp : (comp.component_id || comp.id);
                                return compId === id;
                            });
                            if (hasComponent) {
                                sectionId = section.section_id || section.id;
                            }
                        }
                    });
                    
                    processedData.components[id] = {
                        id: id,
                        type: type,
                        props: {},
                        data: {},
                        content: {},
                        sectionId: sectionId,
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    };
                    
                    console.log(`Reconstructed missing component: ${id} (type: ${type}, section: ${sectionId})`);
                });
            }
        }
        
        // ROOT FIX: Repair corrupted data structures and ensure proper section assignment
        if (processedData.components && Object.keys(processedData.components).length > 0) {
        // Fix array corruption in all components
                    Object.keys(processedData.components).forEach(id => {
                        const comp = processedData.components[id];
                        
                        // Convert corrupted arrays back to objects
                        if (Array.isArray(comp.props)) {
                            console.log(`Fixing corrupted props for ${comp.type} component ${id}`);
                            comp.props = {};
                        }
                        if (Array.isArray(comp.data)) {
                            console.log(`Fixing corrupted data for ${comp.type} component ${id}`);
                            comp.data = {};
                        }
                        if (Array.isArray(comp.content)) {
                            console.log(`Fixing corrupted content for ${comp.type} component ${id}`);
                            comp.content = {};
                        }
                        
                        // Ensure all components have proper object structures
                        if (!comp.props || typeof comp.props !== 'object') {
                            comp.props = {};
                        }
                        if (!comp.data || typeof comp.data !== 'object') {
                            comp.data = {};
                        }
                    });
                    
                    const componentIds = processedData.layout || Object.keys(processedData.components);
            
            // ROOT FIX: If no sections exist, create default section and CLEAR layout
            // Components should be in sections OR layout, never both
            if (!processedData.sections || processedData.sections.length === 0) {
                // Clear layout array since we're moving to section-based rendering
                processedData.layout = [];
                
                processedData.sections = [{
                    section_id: `section_default_${Date.now()}`,
                    section_type: 'full_width',
                    type: 'full_width',
                    components: componentIds.map(id => ({
                        component_id: id,
                        column: 1,
                        order: componentIds.indexOf(id),
                        assigned_at: Date.now()
                    })),
                    layout: {},
                    section_options: {},
                    created_at: Date.now(),
                    updated_at: Date.now()
                }];
                
                // Mark components as assigned to this section
                componentIds.forEach(id => {
                    if (processedData.components[id]) {
                        processedData.components[id].sectionId = processedData.sections[0].section_id;
                    }
                });
                
                console.log('Created default section for', componentIds.length, 'components');
            }
            // If sections exist but components aren't properly assigned
            else if (processedData.sections && processedData.sections.length > 0) {
                // ROOT FIX: Clear layout array when using sections
                // Components should be in sections, not in both layout and sections
                processedData.layout = [];
                // Check if components are properly assigned
                let assignedComponents = new Set();
                
                processedData.sections.forEach(section => {
                    if (section.components && Array.isArray(section.components)) {
                        section.components.forEach(comp => {
                            const compId = typeof comp === 'string' ? comp : comp.component_id;
                            assignedComponents.add(compId);
                        });
                    }
                });
                
                // Find unassigned components
                const unassignedIds = componentIds.filter(id => !assignedComponents.has(id));
                
                if (unassignedIds.length > 0) {
                    // Add unassigned components to the first section
                    const firstSection = processedData.sections[0];
                    if (!firstSection.components) {
                        firstSection.components = [];
                    }
                    
                    // Convert existing components to proper format if needed
                    const existingComponents = firstSection.components.map(comp => {
                        if (typeof comp === 'string') {
                            return {
                                component_id: comp,
                                column: 1,
                                order: firstSection.components.indexOf(comp),
                                assigned_at: Date.now()
                            };
                        }
                        return comp;
                    });
                    
                    // Add unassigned components
                    const newComponents = unassignedIds.map((id, index) => ({
                        component_id: id,
                        column: 1,
                        order: existingComponents.length + index,
                        assigned_at: Date.now()
                    }));
                    
                    firstSection.components = [...existingComponents, ...newComponents];
                    
                    // Mark components as assigned
                    unassignedIds.forEach(id => {
                        if (processedData.components[id]) {
                            processedData.components[id].sectionId = firstSection.section_id;
                        }
                    });
                    
                    console.log('Assigned', unassignedIds.length, 'unassigned components to first section');
                }
            }
        }
        
        return processedData;
    }
    
    /**
     * Load state from localStorage
     * ROOT FIX: Post-aware loading with proper key selection
     */
    loadFromStorage() {
        try {
            // ROOT FIX: Use correct storage key based on context
            const postId = window.gmkbData?.postId;
            const storageKey = postId && postId !== 'new' && postId !== '0' 
                ? `gmkb_state_post_${postId}`  // Post-specific temporary changes
                : 'gmkb_state_draft';           // Draft for new media kits
            
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const loadedState = JSON.parse(saved);
                
                // ROOT FIX: Validate loaded state
                // If loaded state has components but no proper sections, create them
                if (loadedState.components && Object.keys(loadedState.components).length > 0) {
                    if (!loadedState.sections || loadedState.sections.length === 0) {
                        // Check if current state already has sections with these components
                        const currentSections = this.state.sections;
                        if (currentSections && currentSections.length > 0) {
                            // Use existing sections
                            loadedState.sections = currentSections;
                            console.log('Preserving existing sections during localStorage load');
                        } else {
                            // Create new sections for the components
                            const processedState = this.processWordPressData(loadedState);
                            loadedState.sections = processedState.sections;
                            console.log('Created sections for localStorage components');
                        }
                    }
                    
                    // ROOT FIX: Clear layout array if sections exist
                    // Prevent double rendering by ensuring components are only in one place
                    if (loadedState.sections && loadedState.sections.length > 0) {
                        loadedState.layout = [];
                        console.log('Cleared layout array - using section-based rendering');
                    }
                }
                
                this.dispatch(createAction(STATE_ACTIONS.MERGE_STATE, loadedState));
                console.log(`✅ State loaded from localStorage (${storageKey})`);
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
