# Media Kit Builder Refactoring Implementation Guide

## Overview
This guide provides a comprehensive approach to refactoring the Media Kit Builder plugin, addressing root causes while preserving existing functionality and fixes.

## Phase 1: PHP Investigation and Preparation

### 1.1 Analyze PHP Entry Points
**Files to investigate:**
- `guestify-media-kit-builder.php` - Main plugin file
- `includes/class-media-kit-builder.php` - Core class
- `partials/builder-template.php` - Template structure

**Key areas to check:**
- How components are initially rendered from PHP
- Data localization to JavaScript
- Template loading mechanism
- Asset enqueueing order

### 1.2 PHP Refactoring Requirements
- Ensure all component data is passed through `wp_localize_script()`
- Remove any hardcoded component HTML from `builder-template.php`
- Verify script dependencies are correctly ordered
- Add nonce verification for AJAX operations

## Phase 2: State Management Consolidation

### 2.1 Enhanced StateManager Implementation
```javascript
// Extend existing StateManager with missing functionality
class EnhancedStateManager extends StateManager {
    constructor() {
        super();
        this.pendingActions = new Set();
        this.batchMode = false;
        this.queuedNotifications = [];
    }

    // Preserve existing batch functionality
    batchUpdate(updateFn) {
        this.batchMode = true;
        this.queuedNotifications = [];
        
        try {
            updateFn();
        } finally {
            this.batchMode = false;
            // Send one consolidated notification
            if (this.queuedNotifications.length > 0) {
                this.notifySubscribers(this.state);
            }
        }
    }

    // Track pending actions to prevent duplicates
    isPendingAction(action, componentId) {
        const key = `${action}-${componentId}`;
        return this.pendingActions.has(key);
    }

    setPendingAction(action, componentId) {
        const key = `${action}-${componentId}`;
        this.pendingActions.add(key);
        
        // Auto-clear after timeout
        setTimeout(() => {
            this.pendingActions.delete(key);
        }, 1000);
    }
}
```

### 2.2 Component State Structure
```javascript
// Standardized component state
{
    id: 'component-uuid',
    type: 'hero',
    order: 0,
    data: {
        // All component data
    },
    meta: {
        isDeleting: false,
        isMoving: false,
        isDirty: false,
        lastModified: timestamp
    }
}
```

## Phase 3: Component Manager Refactoring

### 3.1 Remove DOM Manipulation
```javascript
class ComponentManager {
    async addComponent(componentType, targetZoneId = null) {
        // Validate component type
        if (!this.isValidComponentType(componentType)) {
            console.error(`Invalid component type: ${componentType}`);
            return null;
        }

        // Save any active edits first
        await this.saveActiveEditableContent();

        // Generate component data
        const componentId = this.generateComponentId(componentType);
        const schema = await this.loadComponentSchema(componentType);
        const initialData = this.getInitialDataFromSchema(schema);

        // Update state only
        stateManager.batchUpdate(() => {
            stateManager.initComponent(componentId, componentType, initialData);
            
            if (targetZoneId) {
                stateManager.replaceDropZone(targetZoneId, componentId);
            }
        });

        return componentId;
    }

    async removeComponent(componentId) {
        // Check for pending actions
        if (stateManager.isPendingAction('delete', componentId)) {
            return;
        }

        // Save any active edits
        await this.saveActiveEditableContent();

        // Mark as pending
        stateManager.setPendingAction('delete', componentId);

        // Update meta state for animation
        stateManager.updateComponentMeta(componentId, { isDeleting: true });

        // Wait for animation
        setTimeout(() => {
            stateManager.removeComponent(componentId);
        }, 300);
    }

    async handleControlAction(action, componentId) {
        // Debounce control actions
        if (this.controlDebounceTimer) {
            clearTimeout(this.controlDebounceTimer);
        }

        this.controlDebounceTimer = setTimeout(async () => {
            await this.executeControlAction(action, componentId);
        }, 300);
    }
}
```

## Phase 4: Component Renderer Enhancement

### 4.1 Intelligent Diff Rendering
```javascript
class ComponentRenderer {
    constructor() {
        this.renderQueue = new Set();
        this.isRendering = false;
        this.componentCache = new Map();
    }

    async onStateChange(newState, oldState) {
        // Skip if rendering is disabled
        if (this.disableRendering) return;

        // Calculate what changed
        const changes = this.calculateChanges(newState, oldState);
        
        if (changes.length === 0) return;

        // Queue changes
        changes.forEach(change => this.renderQueue.add(change));

        // Process queue
        await this.processRenderQueue();
    }

    calculateChanges(newState, oldState) {
        const changes = [];
        
        // Check for additions
        Object.keys(newState.components).forEach(id => {
            if (!oldState.components[id]) {
                changes.push({ type: 'add', id });
            } else if (newState.components[id] !== oldState.components[id]) {
                changes.push({ type: 'update', id });
            }
        });

        // Check for removals
        Object.keys(oldState.components).forEach(id => {
            if (!newState.components[id]) {
                changes.push({ type: 'remove', id });
            }
        });

        // Check for order changes
        if (newState.order.join(',') !== oldState.order.join(',')) {
            changes.push({ type: 'reorder' });
        }

        return changes;
    }

    async processRenderQueue() {
        if (this.isRendering || this.renderQueue.size === 0) return;
        
        this.isRendering = true;
        const changes = Array.from(this.renderQueue);
        this.renderQueue.clear();

        for (const change of changes) {
            await this.applyChange(change);
        }

        this.updateEmptyState();
        this.isRendering = false;
    }

    setupComponentInteractivity(element) {
        const componentId = element.getAttribute('data-component-id');
        
        // Skip if already interactive
        if (element.hasAttribute('data-interactive')) return;
        
        element.setAttribute('data-interactive', 'true');

        // Delegate control button clicks
        element.addEventListener('click', (e) => {
            const controlBtn = e.target.closest('.control-btn');
            if (!controlBtn) return;

            e.preventDefault();
            e.stopPropagation();

            const action = this.determineAction(controlBtn);
            window.componentManager.handleControlAction(action, componentId);
        });

        // Setup content editable tracking
        this.trackContentEditable(element);
    }
}
```

## Phase 5: Initialization Sequence

### 5.1 Proper Boot Sequence
```javascript
class MediaKitBuilder {
    async initialize() {
        console.log('Media Kit Builder: Starting initialization...');

        // Phase 1: Core services
        this.initializeCoreServices();

        // Phase 2: State restoration
        await this.restoreState();

        // Phase 3: UI initialization
        await this.initializeUI();

        // Phase 4: Template system
        await this.initializeTemplates();

        // Phase 5: Event listeners
        this.setupEventListeners();

        console.log('Media Kit Builder: Initialization complete');
    }

    initializeCoreServices() {
        // Order matters!
        window.stateManager = new EnhancedStateManager();
        window.componentManager = new ComponentManager();
        window.componentRenderer = new ComponentRenderer();
        window.historyService = new HistoryService();
        window.templateLoader = new TemplateLoader();

        // Initialize in dependency order
        window.historyService.init();
        window.componentRenderer.init();
        window.templateLoader.init();
    }

    async restoreState() {
        const savedData = localStorage.getItem('mediaKitData');
        
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                // Load with skipInitialRender flag
                window.stateManager.loadSerializedState(data, { 
                    skipInitialRender: true 
                });

                // Then sync existing DOM if needed
                await window.componentRenderer.syncWithDOM();
            } catch (error) {
                console.error('Failed to restore state:', error);
                this.showError('Failed to load saved data');
            }
        }
    }
}
```

## Phase 6: Migration Strategy

### 6.1 Incremental Migration
1. **Create parallel implementations** alongside existing code
2. **Add feature flags** to toggle between old and new implementations
3. **Migrate one component type at a time**
4. **Validate each migration** with comprehensive testing

### 6.2 Rollback Plan
```javascript
// Feature flag system
const FEATURES = {
    USE_NEW_STATE_MANAGER: false,
    USE_DIFF_RENDERING: false,
    USE_BATCH_UPDATES: true
};

// Conditional implementation
const stateManager = FEATURES.USE_NEW_STATE_MANAGER 
    ? new EnhancedStateManager() 
    : new LegacyStateManager();
```

## Phase 7: Testing Strategy

### 7.1 Critical Test Cases
1. **Component lifecycle**: Add, edit, move, delete
2. **Template loading**: All three presets
3. **State persistence**: Save/load cycles
4. **Control actions**: With and without unsaved edits
5. **Batch operations**: Multiple components at once
6. **Empty state**: Transitions to/from
7. **Drop zones**: Replacement behavior

### 7.2 Performance Benchmarks
- Component addition: < 100ms
- State save: < 50ms
- Full re-render: < 200ms
- Control action response: < 300ms

## Phase 8: Cleanup (Only After Validation)

### 8.1 Safe Removal List
After all functionality is migrated and tested:
1. Remove debug files (see DEBUG_FILES_CLEANUP.md)
2. Consolidate duplicate functionality
3. Remove feature flags
4. Archive old implementations

### 8.2 Code Organization
```
/js
  /core
    - state-manager.js
    - component-manager.js
    - component-renderer.js
  /services
    - template-loader.js
    - history-service.js
    - schema-validator.js
  /ui
    - component-library.js
    - template-library.js
  /utils
    - dom-helpers.js
    - debounce.js
```

## Implementation Timeline

**Week 1**: PHP investigation and state management
**Week 2**: Component manager and renderer refactoring
**Week 3**: Initialization and template system
**Week 4**: Testing and validation
**Week 5**: Cleanup and optimization

## Success Metrics

- Zero duplicate component renders
- No race conditions during initialization
- All control actions work reliably
- State persistence is 100% reliable
- Performance meets all benchmarks
- No regression in existing features