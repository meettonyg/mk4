# Media Kit Builder Refactoring - Migration Guide

## Overview
This guide helps you migrate from the legacy implementation to the enhanced Media Kit Builder system.

## Feature Flags

The system uses feature flags to allow gradual migration. You can enable/disable features through the browser console:

```javascript
// View current feature flags
mediaKitFeatures.FEATURES

// Enable a feature
mediaKitFeatures.toggleFeature('USE_ENHANCED_STATE_MANAGER', true)

// Disable a feature
mediaKitFeatures.toggleFeature('USE_ENHANCED_COMPONENT_MANAGER', false)

// Reset all features to defaults
mediaKitFeatures.resetFeatureFlags()
```

## Available Feature Flags

1. **USE_ENHANCED_STATE_MANAGER** (default: true)
   - Enables component meta state tracking
   - Adds pending action management
   - Improves batch update handling

2. **USE_ENHANCED_COMPONENT_MANAGER** (default: true)
   - Removes all DOM manipulation from component manager
   - Pure state-based component management
   - Better separation of concerns

3. **USE_ENHANCED_COMPONENT_RENDERER** (default: true)
   - Intelligent diff-based rendering
   - Render queue management
   - Optimized DOM updates

4. **USE_ENHANCED_INITIALIZATION** (default: false)
   - New initialization sequence with proper dependency management
   - Better error handling
   - Phased startup process

5. **USE_BATCH_UPDATES** (default: true)
   - Batch multiple state changes into single renders
   - Prevents UI flashing during template loads

6. **USE_PENDING_ACTIONS** (default: true)
   - Prevents duplicate control actions
   - Adds debouncing to rapid clicks

7. **USE_COMPONENT_META** (default: true)
   - Tracks component states (isDeleting, isMoving, isDirty)
   - Enables visual feedback during actions

## Migration Steps

### Phase 1: Enable Enhanced State Manager (Week 1)
```javascript
mediaKitFeatures.toggleFeature('USE_ENHANCED_STATE_MANAGER', true)
```

Test:
- Component CRUD operations
- Undo/redo functionality
- Template loading
- State persistence

### Phase 2: Enable Enhanced Component Manager (Week 2)
```javascript
mediaKitFeatures.toggleFeature('USE_ENHANCED_COMPONENT_MANAGER', true)
```

Test:
- Component addition from library
- Control actions (delete, duplicate, move)
- Drop zone replacements
- Content editing

### Phase 3: Enable Enhanced Component Renderer (Week 3)
```javascript
mediaKitFeatures.toggleFeature('USE_ENHANCED_COMPONENT_RENDERER', true)
```

Test:
- Rendering performance
- DOM diff accuracy
- Animation states
- Empty state transitions

### Phase 4: Enable Enhanced Initialization (Week 4)
```javascript
mediaKitFeatures.toggleFeature('USE_ENHANCED_INITIALIZATION', true)
```

Test:
- Initial page load
- State restoration
- Service initialization order
- Error recovery

## Testing Checklist

### Component Operations
- [ ] Add component from library
- [ ] Add component to drop zone
- [ ] Delete component (with confirmation)
- [ ] Duplicate component
- [ ] Move component up/down
- [ ] Edit component content
- [ ] Save changes

### Template System
- [ ] Load Professional Speaker template
- [ ] Load Podcast Host template
- [ ] Load Minimal Professional template
- [ ] Clear all components
- [ ] Template loads without flashing

### State Management
- [ ] Undo/redo operations
- [ ] Auto-save to localStorage
- [ ] Restore on page reload
- [ ] Export/import state

### UI Interactions
- [ ] Toolbar buttons work
- [ ] Preview mode switching
- [ ] Modal dialogs open/close
- [ ] Keyboard shortcuts
- [ ] Drag and drop

### Performance
- [ ] Component addition < 100ms
- [ ] State save < 50ms
- [ ] Full re-render < 200ms
- [ ] No duplicate renders

## Rollback Procedure

If issues occur, you can rollback specific features:

```javascript
// Rollback to legacy state manager
mediaKitFeatures.toggleFeature('USE_ENHANCED_STATE_MANAGER', false)

// Rollback all features
mediaKitFeatures.FEATURES = {
    USE_ENHANCED_STATE_MANAGER: false,
    USE_ENHANCED_COMPONENT_MANAGER: false,
    USE_ENHANCED_COMPONENT_RENDERER: false,
    USE_ENHANCED_INITIALIZATION: false,
    USE_BATCH_UPDATES: true,
    USE_PENDING_ACTIONS: true,
    USE_COMPONENT_META: false,
    ENABLE_DEBUG_LOGGING: false
}
location.reload()
```

## Debug Tools

```javascript
// View current state
gmkbDebug.getState()

// Check pending actions
enhancedStateManager.pendingActions

// View component meta
enhancedStateManager.componentMeta

// Force render
document.dispatchEvent(new CustomEvent('force-render'))

// Check render queue
enhancedComponentRenderer.renderQueue
```

## Common Issues

### Issue: Components not rendering
Solution: Check if rendering is disabled
```javascript
enhancedComponentRenderer.disableRendering = false
document.dispatchEvent(new CustomEvent('force-render'))
```

### Issue: Duplicate control actions
Solution: Ensure pending actions are enabled
```javascript
mediaKitFeatures.toggleFeature('USE_PENDING_ACTIONS', true)
```

### Issue: State not persisting
Solution: Check localStorage and state manager
```javascript
localStorage.getItem('mediaKitData')
enhancedStateManager.getSerializableState()
```

## Success Metrics

Monitor these metrics to ensure successful migration:

1. **Zero duplicate renders** - Check console for multiple render logs
2. **Consistent state** - State matches DOM at all times
3. **Smooth animations** - No janky transitions
4. **Fast operations** - All actions feel instant
5. **No errors** - Console is clean

## Support

If you encounter issues during migration:

1. Check browser console for errors
2. Review the feature flags settings
3. Try rolling back specific features
4. Document the issue with reproduction steps

## Next Steps

After successful migration:

1. Remove debug files (see DEBUG_FILES_CLEANUP.md)
2. Set all feature flags to use enhanced versions
3. Remove legacy code paths
4. Update documentation

Remember: Take it slow, test thoroughly, and rollback if needed!