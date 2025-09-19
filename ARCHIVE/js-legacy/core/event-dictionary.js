/**
 * GMKB Event Dictionary
 * Central reference for all custom events in the Media Kit Builder system
 * 
 * This file serves as documentation and a constant reference to prevent typos
 * and ensure consistency across the application.
 * 
 * @version 1.0.0
 * @package GMKB/Core
 */

export const GMKB_EVENTS = {
    // System initialization events
    STATE_MANAGER_READY: 'gmkb:state-manager:ready',
    SECTION_MANAGER_READY: 'gmkb:section-manager:ready',
    COMPONENT_MANAGER_READY: 'gmkb:component-manager:ready',
    RENDERER_READY: 'gmkb:renderer:ready',
    CORE_SYSTEMS_READY: 'gmkb:core-systems-ready',
    SECTION_SYSTEMS_READY: 'gmkb:section-systems-ready',
    
    // State management events
    INITIAL_STATE_LOADED: 'gmkb:initial-state:loaded',
    STATE_CHANGED: 'gmkb:state:changed',
    STATE_SAVED: 'gmkb:state:saved',
    STATE_SYNC_REQUIRED: 'gmkb:state:sync-required',
    
    // Section events
    SECTION_CREATED: 'gmkb:section:created',
    SECTION_REGISTERED: 'gmkb:section-registered',
    SECTION_RENDERED: 'gmkb:section-rendered',
    SECTION_REMOVED: 'gmkb:section:removed',
    SECTION_UPDATED: 'gmkb:section:updated',
    SECTION_EDIT_REQUESTED: 'gmkb:section-edit-requested',
    SECTION_REFRESHED: 'gmkb:section:refreshed',
    SECTIONS_REORDERED: 'gmkb:sections-reordered',
    ALL_SECTIONS_REMOVED: 'gmkb:all-sections-removed',
    SECTION_RENDERED_DISPLAY_UPDATE: 'gmkb:section-rendered-display-update',
    
    // Component events
    COMPONENT_ADDED: 'gmkb:component:added',
    COMPONENT_RENDERED: 'gmkb:component:rendered',
    COMPONENT_REMOVED: 'gmkb:component:removed',
    COMPONENT_UPDATED: 'gmkb:component:updated',
    COMPONENT_MOVED: 'gmkb:component:moved',
    COMPONENT_SELECTED: 'gmkb:component:selected',
    COMPONENT_DESELECTED: 'gmkb:component:deselected',
    COMPONENT_DELETE_REQUESTED: 'gmkb:component-delete-requested',
    COMPONENT_ASSIGNED_TO_SECTION: 'gmkb:component-assigned-to-section',
    COMPONENT_REMOVED_FROM_SECTION: 'gmkb:component-removed-from-section',
    
    // UI events
    DESIGN_PANEL_OPENED: 'gmkb:design-panel:opened',
    DESIGN_PANEL_CLOSED: 'gmkb:design-panel:closed',
    MODAL_OPENED: 'gmkb:modal:opened',
    MODAL_CLOSED: 'gmkb:modal:closed',
    
    // Save/Load events
    MANUAL_SAVE_START: 'gmkb:manual-save-start',
    AUTO_SAVE_TRIGGERED: 'gmkb:auto-save:triggered',
    SAVE_SUCCESS: 'gmkb:save:success',
    SAVE_ERROR: 'gmkb:save:error',
    
    // Component library events
    COMPONENT_LIBRARY_OPENED: 'gmkb:component-library:opened',
    COMPONENT_SELECTED_FROM_LIBRARY: 'gmkb:component:selected-from-library',
    
    // Drag and drop events
    DRAG_START: 'gmkb:drag:start',
    DRAG_END: 'gmkb:drag:end',
    DROP_ZONE_ACTIVE: 'gmkb:drop-zone:active',
    DROP_ZONE_INACTIVE: 'gmkb:drop-zone:inactive',
    
    // Error events
    ERROR: 'gmkb:error',
    WARNING: 'gmkb:warning',
    
    // Component specific events
    FORCE_COMPONENT_RERENDER: 'gmkb:force-component-rerender',
    BEFORE_COMPONENT_UPDATE: 'gmkb:before-component-update',
    AFTER_COMPONENT_UPDATE: 'gmkb:after-component-update',
    
    // Section-component integration events
    ADD_COMPONENT_TO_SECTION: 'gmkb:add-component-to-section',
    SECTION_NEEDS_COMPONENTS: 'gmkb:section-needs-components',
    
    // Theme events
    THEME_CHANGED: 'gmkb:theme:changed',
    THEME_CUSTOMIZED: 'gmkb:theme:customized'
};

// Event payload standards for consistency
export const EVENT_PAYLOAD_STANDARDS = {
    // All events should include these base fields
    source: 'string',      // Class/module name that emitted the event
    timestamp: 'number',   // Date.now()
    
    // Component events should include
    componentId: 'string',
    componentType: 'string',
    componentData: 'object',
    
    // Section events should include
    sectionId: 'string',
    sectionType: 'string',
    section: 'object',
    
    // State events should include
    state: 'object',
    previousState: 'object',
    changes: 'object',
    
    // Error events should include
    error: 'Error|string',
    context: 'object',
    severity: 'string'    // 'error', 'warning', 'info'
};

// Helper function to create standardized event detail
export function createEventDetail(baseDetail, source) {
    return {
        ...baseDetail,
        source: source || 'Unknown',
        timestamp: Date.now()
    };
}

// Helper function to dispatch standardized event
export function dispatchGMKBEvent(eventType, detail, source) {
    const standardizedDetail = createEventDetail(detail, source);
    
    const event = new CustomEvent(eventType, {
        detail: standardizedDetail,
        bubbles: true,
        cancelable: false
    });
    
    document.dispatchEvent(event);
    
    // Optional: Log event dispatch in debug mode
    if (window.gmkbData?.debugMode) {
        console.log(`[Event] ${eventType}`, standardizedDetail);
    }
}

// Export for both ES6 modules and global access
if (typeof window !== 'undefined') {
    window.GMKB_EVENTS = GMKB_EVENTS;
    window.createGMKBEventDetail = createEventDetail;
    window.dispatchGMKBEvent = dispatchGMKBEvent;
}
