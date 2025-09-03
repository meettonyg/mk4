# Component Lifecycle Specification

## Phase 1: Component Communication Redesign

### Version 1.0.0
### Architecture: Event-Driven Component Lifecycle Management

---

## Overview

This specification defines the standard lifecycle events and communication patterns that ALL component editors must follow in the Media Kit Builder. The goal is to eliminate race conditions, polling behaviors, and architectural mismatches through a consistent event-driven approach.

## Core Principles

1. **Event-Driven Only** - No polling, no setTimeout waiting
2. **Standardized Lifecycle** - All components follow the same event flow
3. **Clear DOM Ownership** - Each element has exactly one owner
4. **Root Cause Fixes** - Address fundamental issues, not symptoms

## Lifecycle Events

All components MUST emit these standard lifecycle events in the proper order:

```javascript
const LIFECYCLE_EVENTS = {
    RENDERING: 'component:rendering',       // Before render starts
    DOM_READY: 'component:dom-ready',       // DOM elements created  
    EDITOR_READY: 'component:editor-ready', // Editor fully initialized
    DATA_CHANGED: 'component:data-changed', // Data modified
    DESTROYED: 'component:destroyed'        // Component removed
};
```

### Event Details

#### `component:rendering`
- **When**: Before any DOM manipulation begins
- **Purpose**: Allow other systems to prepare
- **Payload**: 
  ```javascript
  {
    componentId: string,
    componentType: string,
    timestamp: number
  }
  ```

#### `component:dom-ready`
- **When**: After DOM elements are created and inserted
- **Purpose**: Signal that DOM queries will now succeed
- **Payload**:
  ```javascript
  {
    componentId: string,
    componentType: string,
    container: HTMLElement,
    timestamp: number
  }
  ```

#### `component:editor-ready`
- **When**: After event listeners are attached and editor is interactive
- **Purpose**: Signal that the editor is fully operational
- **Payload**:
  ```javascript
  {
    componentId: string,
    componentType: string,
    container: HTMLElement,
    data: object,
    timestamp: number
  }
  ```

#### `component:data-changed`
- **When**: Any time component data is modified
- **Purpose**: Enable sync and state management
- **Payload**:
  ```javascript
  {
    componentId: string,
    componentType: string,
    oldData: object,
    newData: object,
    changes: object,
    timestamp: number
  }
  ```

#### `component:destroyed`
- **When**: Before component is removed from DOM
- **Purpose**: Allow cleanup and state updates
- **Payload**:
  ```javascript
  {
    componentId: string,
    componentType: string,
    timestamp: number
  }
  ```

## Implementation Requirements

### 1. Extend ComponentLifecycle Base Class

All component editors MUST extend the `ComponentLifecycle` base class:

```javascript
class MyComponentEditor extends ComponentLifecycle {
    constructor(containerEl, componentId, initialData, onUpdate) {
        super(containerEl, componentId, 'my-component-type', initialData);
        this.onUpdate = onUpdate;
    }
    
    async render() {
        // Your rendering logic here
        this.container.innerHTML = this.generateHTML();
        return Promise.resolve();
    }
    
    attachEventListeners() {
        // Call parent first
        super.attachEventListeners();
        
        // Use helper methods for tracked listeners
        this.addEventListener(this.button, 'click', this.handleClick.bind(this));
    }
}
```

### 2. Use performRender() Method

Never call `render()` directly. Always use `performRender()`:

```javascript
const editor = new MyComponentEditor(container, id, data, callback);
await editor.performRender(); // This emits all lifecycle events properly
```

### 3. Update Data Through updateData()

Always use the `updateData()` method to modify component data:

```javascript
// RIGHT
this.updateData({ title: 'New Title' }); // Emits data-changed event

// WRONG  
this.data.title = 'New Title'; // No event emitted
```

### 4. Clean Up Properly

Always call `destroy()` when removing a component:

```javascript
editor.destroy(); // Emits destroyed event and cleans up listeners
```

## Component Registry Integration

Components should register with the ComponentEditorRegistry:

```javascript
if (window.componentEditorRegistry) {
    window.componentEditorRegistry.register('my-component', MyComponentEditor);
}
```

## Sync System Integration

The universal sync system listens for lifecycle events to coordinate:

```javascript
// Sync system automatically listens for these events
document.addEventListener('component:editor-ready', (event) => {
    // Set up bi-directional sync for the component
});

document.addEventListener('component:data-changed', (event) => {
    // Sync changes between sidebar and preview
});
```

## DOM Ownership Rules

1. **Preview Container**: Read-only by default, no inline contenteditable
2. **Editor Container**: Owns all input elements and form controls
3. **Sync Coordinator**: Mediates between preview and editor
4. **Edit Mode**: Explicit toggle for preview editing (if enabled)

## Anti-Patterns to Avoid

### ❌ Polling for Ready State
```javascript
// WRONG
const checkReady = setInterval(() => {
    if (element.querySelector('.ready')) {
        clearInterval(checkReady);
        init();
    }
}, 100);
```

### ❌ Direct DOM Manipulation Without Events
```javascript
// WRONG
element.innerHTML = newContent;
// No event emitted, other systems don't know
```

### ❌ Multiple Initialization Paths
```javascript
// WRONG
class Editor {
    init() { /* ... */ }
    initialize() { /* ... */ }
    setup() { /* ... */ }
    // Which one to call?
}
```

### ❌ Assuming Synchronous Availability
```javascript
// WRONG
const editor = new Editor();
editor.doSomething(); // May not be ready yet
```

## Best Practices

### ✅ Single Initialization Path
```javascript
// RIGHT
const editor = new Editor(container, id, data);
await editor.performRender(); // Single, async initialization
```

### ✅ Event-Driven Coordination
```javascript
// RIGHT
document.addEventListener('component:editor-ready', (event) => {
    if (event.detail.componentId === targetId) {
        // Component is ready, proceed
    }
});
```

### ✅ Proper Error Handling
```javascript
// RIGHT
try {
    await editor.performRender();
} catch (error) {
    console.error('Failed to render editor:', error);
    // Handle gracefully
}
```

### ✅ Clean Separation of Concerns
```javascript
// RIGHT
class Editor extends ComponentLifecycle {
    // Only editor logic here
}

class SyncCoordinator {
    // Only sync logic here
}
```

## Testing

To verify lifecycle compliance:

```javascript
// Test that all events are emitted
const events = [];
const eventTypes = Object.values(LIFECYCLE_EVENTS);

eventTypes.forEach(eventType => {
    document.addEventListener(eventType, (e) => {
        events.push(e.type);
    });
});

const editor = new MyComponentEditor(container, 'test-1', {});
await editor.performRender();
editor.updateData({ test: true });
editor.destroy();

// Should have: rendering, dom-ready, editor-ready, data-changed, destroyed
console.assert(events.length === 5, 'All lifecycle events emitted');
```

## Migration Guide

### Converting Existing Editors

1. **Change Base Class**
   ```javascript
   // Before
   class TopicsEditor extends BaseComponentEditor
   
   // After
   class TopicsEditor extends ComponentLifecycle
   ```

2. **Update Constructor**
   ```javascript
   // Before
   constructor(container, id, data, callback) {
       this.container = container;
       // ...
   }
   
   // After
   constructor(container, id, data, callback) {
       super(container, id, 'topics', data);
       this.onUpdate = callback;
   }
   ```

3. **Make Render Async**
   ```javascript
   // Before
   render() {
       this.container.innerHTML = html;
       this.attachEventListeners();
   }
   
   // After
   async render() {
       this.container.innerHTML = html;
       return Promise.resolve();
   }
   // attachEventListeners called automatically by performRender
   ```

4. **Use Tracked Event Listeners**
   ```javascript
   // Before
   button.addEventListener('click', handler);
   
   // After
   this.addEventListener(button, 'click', handler);
   ```

5. **Update Data Properly**
   ```javascript
   // Before
   this.data = newData;
   this.onUpdate(this.id, newData);
   
   // After
   this.updateData(newData); // Handles both
   ```

## Compliance Checklist

- [ ] Extends `ComponentLifecycle` base class
- [ ] Constructor calls `super()` with proper parameters
- [ ] `render()` method is async and returns Promise
- [ ] Uses `performRender()` for initialization
- [ ] Uses `updateData()` for data changes
- [ ] Uses `addEventListener()` helper for event tracking
- [ ] Calls `destroy()` for cleanup
- [ ] Registers with `componentEditorRegistry`
- [ ] No polling or setTimeout for waiting
- [ ] No direct DOM manipulation without events

## Support

For questions or issues with the lifecycle implementation:

1. Check the test suite: `tests/component-lifecycle-tests.js`
2. Review the base class: `js/core/component-lifecycle.js`
3. See example implementation: `components/topics/TopicsEditor.js`
