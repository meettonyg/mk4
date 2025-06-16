# GMKB Console Reference

## Accessing the State Manager

The `stateManager` is a module-scoped variable and cannot be accessed directly from the console. Instead, use the global `gmkbDebug` object:

### Correct Usage:
```javascript
// Get current state
gmkbDebug.stateManager.getSerializableState()

// Get all components
gmkbDebug.stateManager.getOrderedComponents()

// Get specific component
gmkbDebug.stateManager.getComponent('component-id-here')

// Check data binding engine
gmkbDebug.dataBindingEngine

// Check component manager
gmkbDebug.componentManager
```

### Common Debugging Commands:

```javascript
// View current state
gmkbDebug.getState()

// Reset everything
gmkbDebug.resetAll()

// Force reload
gmkbDebug.forceReload()

// View history service
gmkbDebug.historyService
```

### Incorrect Usage (will cause errors):
```javascript
// ❌ These will NOT work:
stateManager.getSerializableState()  // ReferenceError: stateManager is not defined
dataBindingEngine                    // ReferenceError: dataBindingEngine is not defined
componentManager                     // ReferenceError: componentManager is not defined
```

## Architecture Overview

The enhanced system uses centralized state management:

1. **State Manager** - Manages all component data and state changes
2. **Component Manager** - Handles component lifecycle (add, remove, move, duplicate)
3. **Data Binding Engine** - Syncs data between UI and state
4. **History Service** - Manages undo/redo functionality

All DOM manipulations should go through the Component Manager to ensure state consistency.
