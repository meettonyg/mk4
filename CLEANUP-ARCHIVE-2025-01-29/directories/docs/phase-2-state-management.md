# Phase 2: Enhanced State Management Documentation

## Overview

The Media Kit Builder uses an enhanced state management system with a reducer pattern for predictable state mutations. This implementation follows Redux-like patterns for maintainability and debuggability.

## Key Features

### 1. Reducer Pattern
All state changes go through a centralized reducer function that ensures predictable state updates:

```javascript
// Never mutate state directly:
stateManager.state.components[id] = component; // ❌ Bad

// Always use dispatch with actions:
stateManager.dispatch({
    type: ACTION_TYPES.ADD_COMPONENT,
    payload: component
}); // ✅ Good
```

### 2. Action Types
All actions are defined in a centralized location (`src/constants/actionTypes.js`):

```javascript
import ACTION_TYPES from './constants/actionTypes.js';

// Use predefined action types
stateManager.dispatch({
    type: ACTION_TYPES.ADD_COMPONENT,
    payload: componentData
});
```

### 3. Middleware System
Supports middleware for cross-cutting concerns like logging, validation, and persistence.

## Architecture

### File Structure
```
src/
├── constants/
│   └── actionTypes.js          # All action type definitions
├── core/
│   ├── StateManager.js         # Original simple state manager (deprecated)
│   └── EnhancedStateManager.js # New reducer-based state manager
└── main.js                      # Uses enhanced state manager
```

### State Schema
```javascript
{
    components: {},      // Component data by ID
    layout: [],         // Array of component IDs in order
    sections: [],       // Section definitions
    theme: 'default',   // Current theme
    themeSettings: {},  // Theme customizations
    globalSettings: {   // Global app settings
        layout: 'vertical',
        responsive: true,
        autoSave: true,
        autoSaveInterval: 30000
    },
    ui: {              // UI state
        selectedComponent: null,
        hoveredComponent: null,
        isPreviewMode: false,
        isSaving: false,
        lastSaved: null
    },
    history: {         // For undo/redo
        past: [],
        future: [],
        maxHistorySize: 50
    },
    meta: {           // Metadata
        version: '2.2.0',
        lastModified: null,
        createdAt: null,
        author: null
    },
    errors: []        // Error tracking
}
```

## Usage Examples

### Basic Component Operations

```javascript
// Get state manager instance
const stateManager = window.GMKB.stateManager;

// Add a component
stateManager.dispatch({
    type: ACTION_TYPES.ADD_COMPONENT,
    payload: {
        id: 'hero_123',
        type: 'hero',
        props: {
            title: 'Welcome',
            subtitle: 'To my media kit'
        }
    }
});

// Update a component
stateManager.dispatch({
    type: ACTION_TYPES.UPDATE_COMPONENT,
    payload: {
        id: 'hero_123',
        updates: {
            props: { title: 'Updated Welcome' }
        }
    }
});

// Remove a component
stateManager.dispatch({
    type: ACTION_TYPES.REMOVE_COMPONENT,
    payload: 'hero_123'
});
```

### Convenience Methods

The enhanced state manager provides convenience methods that internally use dispatch:

```javascript
// These methods internally dispatch the correct actions
stateManager.addComponent(componentData);
stateManager.updateComponent(id, updates);
stateManager.removeComponent(id);
stateManager.moveComponent(id, direction);
stateManager.duplicateComponent(id);
stateManager.setTheme('dark');
stateManager.updateGlobalSettings({ autoSave: false });
```

### Batch Operations

For performance when making multiple changes:

```javascript
// Start batch - changes won't trigger notifications until batch ends
stateManager.startBatch();

// Make multiple changes
for (let i = 0; i < 10; i++) {
    stateManager.addComponent({
        id: `component_${i}`,
        type: 'text',
        props: { content: `Item ${i}` }
    });
}

// End batch - single notification for all changes
stateManager.endBatch();
```

### State Subscriptions

Subscribe to state changes:

```javascript
// Subscribe to all state changes
const unsubscribe = stateManager.subscribe((state) => {
    console.log('State updated:', state);
    // Update UI based on new state
});

// Later: unsubscribe
unsubscribe();
```

### Undo/Redo

The enhanced state manager tracks history automatically:

```javascript
// Undo last action
stateManager.undo();

// Redo
stateManager.redo();

// Check history status
const state = stateManager.getState();
console.log('Can undo:', state.history.past.length > 0);
console.log('Can redo:', state.history.future.length > 0);
```

### Persistence

Save and load state from localStorage:

```javascript
// Save current state
stateManager.saveToStorage();

// Load saved state
stateManager.loadFromStorage();
```

## Action Types Reference

### Component Actions
- `ADD_COMPONENT` - Add a new component
- `UPDATE_COMPONENT` - Update component properties
- `DELETE_COMPONENT` / `REMOVE_COMPONENT` - Remove a component
- `MOVE_COMPONENT` - Change component position
- `DUPLICATE_COMPONENT` - Create component copy
- `BATCH_UPDATE_COMPONENTS` - Update multiple components
- `CLEAR_ALL_COMPONENTS` - Remove all components

### Layout Actions
- `SET_LAYOUT` - Set complete layout array
- `UPDATE_LAYOUT_ORDER` - Reorder components
- `REORDER_COMPONENTS` - Move component to new position

### Section Actions
- `ADD_SECTION` - Add new section
- `UPDATE_SECTION` - Update section properties
- `DELETE_SECTION` - Remove section
- `UPDATE_SECTIONS` - Replace all sections
- `ASSIGN_COMPONENT_TO_SECTION` - Add component to section
- `REMOVE_COMPONENT_FROM_SECTION` - Remove from section

### Theme Actions
- `SET_THEME` - Change theme
- `UPDATE_THEME_SETTINGS` - Update theme customizations
- `RESET_THEME` - Reset to default theme

### Global Actions
- `UPDATE_GLOBAL_SETTINGS` - Update app settings
- `SET_STATE` - Replace entire state
- `RESET_STATE` - Reset to initial state
- `MERGE_STATE` - Merge partial state

### Persistence Actions
- `SAVE_STATE_SUCCESS` - Mark successful save
- `SAVE_STATE_FAILURE` - Mark failed save
- `AUTO_SAVE` - Trigger auto-save
- `MANUAL_SAVE` - Trigger manual save

## Middleware System

The enhanced state manager supports middleware for cross-cutting concerns:

```javascript
// Example: Custom logging middleware
const customLogger = (state, action, manager) => {
    console.log(`[${new Date().toISOString()}] Action:`, action.type);
    return action; // Return action to continue, or false to cancel
};

// Add middleware
stateManager.addMiddleware(customLogger);
```

### Built-in Middleware

1. **Logging Middleware**: Logs all actions in debug mode
```javascript
// Automatically enabled when window.gmkbData.debugMode = true
```

2. **Validation Middleware**: Validates action structure and payload
```javascript
// Always enabled - ensures action integrity
```

3. **Persistence Middleware**: Auto-saves state changes
```javascript
// Saves to localStorage after state changes (debounced)
```

## Advanced Features

### Custom Action Creators

Create reusable action creators for complex operations:

```javascript
// Action creator with validation
function createAddComponentAction(type, props) {
    if (!type) throw new Error('Component type required');
    
    return {
        type: ACTION_TYPES.ADD_COMPONENT,
        payload: {
            id: `${type}_${Date.now()}`,
            type,
            props,
            createdAt: Date.now()
        }
    };
}

// Use it
stateManager.dispatch(createAddComponentAction('hero', { title: 'Welcome' }));
```

### State Selectors

Create reusable selectors for accessing state:

```javascript
// Selector functions
const getComponentsByType = (state, type) => {
    return Object.values(state.components).filter(c => c.type === type);
};

const getComponentsInSection = (state, sectionId) => {
    const section = state.sections.find(s => s.section_id === sectionId);
    if (!section) return [];
    return section.components.map(id => state.components[id]).filter(Boolean);
};

// Use selectors
const state = stateManager.getState();
const heroComponents = getComponentsByType(state, 'hero');
const sectionComponents = getComponentsInSection(state, 'section_123');
```

## Testing

Run the test suite in browser console:

```javascript
// Load the test file
const script = document.createElement('script');
script.src = '/wp-content/plugins/guestify-media-kit-builder/tests/state-manager-tests.js';
document.head.appendChild(script);

// Run tests
window.runStateManagerTests();
```

## Performance Considerations

### Batch Updates
Always use batch updates when making multiple changes:
```javascript
// Bad - triggers multiple updates
for (let i = 0; i < 100; i++) {
    stateManager.addComponent({ ... }); // 100 notifications!
}

// Good - single update
stateManager.startBatch();
for (let i = 0; i < 100; i++) {
    stateManager.addComponent({ ... });
}
stateManager.endBatch(); // 1 notification
```

### Subscription Optimization
Keep subscription callbacks lightweight:
```javascript
// Bad - expensive operation in subscription
stateManager.subscribe((state) => {
    renderEntireUI(state); // Expensive!
});

// Good - debounced and optimized
const debouncedRender = debounce((state) => {
    renderOnlyChangedComponents(state);
}, 16);
stateManager.subscribe(debouncedRender);
```

## Troubleshooting

### State not updating
1. Check action type is defined in `actionTypes.js`
2. Verify payload structure matches what reducer expects
3. Look for console warnings about invalid actions
4. Check if you're in batch mode (changes queued until `endBatch()`)

### Performance issues
1. Use batch updates for multiple changes
2. Check subscription callbacks for expensive operations
3. Consider using selectors to compute derived state
4. Enable performance monitoring in debug mode

### History/Undo not working
1. Check that history.maxHistorySize is not exceeded
2. Verify action is not in the skip list for history
3. UI-only actions don't create history entries

## Benefits of the Enhanced System

1. **Predictability**: All state changes go through reducer
2. **Debuggability**: Every action is logged and traceable
3. **Time Travel**: Built-in undo/redo functionality
4. **Type Safety**: Predefined action types prevent typos
5. **Testability**: Pure reducer functions are easy to test
6. **Performance**: Batch updates reduce re-renders
7. **Extensibility**: Middleware system for adding features

## Summary

Phase 2 successfully implements a robust state management system with:
- ✅ Reducer pattern for predictable updates
- ✅ Centralized action types
- ✅ Built-in undo/redo
- ✅ Middleware support
- ✅ Comprehensive testing
- ✅ Performance optimizations
- ✅ Clean, maintainable architecture

The system provides a solid foundation for complex state management while maintaining simplicity and performance.
