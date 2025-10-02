# Delete Section Bug Fix

## Problem

When deleting a section, the components within that section were not being deleted. This was particularly problematic for multi-column sections.

## Root Cause

The `removeSection` method in `src/stores/mediaKit.js` only handled `section.components` (full-width sections) but didn't handle `section.columns` (multi-column sections).

```javascript
// OLD CODE - Only handled full-width sections
if (section.components) {
  section.components.forEach(compRef => {
    const componentId = typeof compRef === 'string' ? compRef : compRef.component_id;
    delete this.components[componentId];
  });
}
```

## The Fix

Enhanced the `removeSection` method to:

1. **Collect all component IDs** from both full-width and multi-column sections
2. **Delete all components** that were in the section
3. **Log the deletions** for debugging
4. **Dispatch an event** so other parts of the system can react

```javascript
// NEW CODE - Handles both section types
const componentIdsToDelete = [];

// Collect from full-width sections
if (section.components && Array.isArray(section.components)) {
  section.components.forEach(compRef => {
    const componentId = typeof compRef === 'string' ? compRef : compRef.component_id;
    if (componentId) {
      componentIdsToDelete.push(componentId);
    }
  });
}

// ROOT FIX: Also collect from multi-column sections
if (section.columns) {
  Object.values(section.columns).forEach(column => {
    if (Array.isArray(column)) {
      column.forEach(componentId => {
        if (componentId) {
          componentIdsToDelete.push(componentId);
        }
      });
    }
  });
}

// Delete all collected components
componentIdsToDelete.forEach(componentId => {
  delete this.components[componentId];
  console.log(`🗑️ Deleted component ${componentId} from section ${sectionId}`);
});
```

## What You'll See Now

When you delete a section, you'll see console logs like:

```
🗑️ Deleted component comp_123 from section section_abc
🗑️ Deleted component comp_456 from section section_abc
🗑️ Deleted component comp_789 from section section_abc
🗑️ Removed section section_abc and 3 components
```

And the components will actually be deleted from the `components` object, not just orphaned.

## Testing

1. **Create a multi-column section** with components
2. **Delete the section**
3. **Check the component count** - it should decrease
4. **Check the data viewer** - components should be gone, not orphaned

## Event

The fix also dispatches an event that can be listened to:

```javascript
document.addEventListener('gmkb:section-removed', (event) => {
  console.log('Section removed:', event.detail);
  // {
  //   sectionId: 'section_123',
  //   componentsDeleted: 3,
  //   componentIds: ['comp_1', 'comp_2', 'comp_3']
  // }
});
```

## Files Modified

- `src/stores/mediaKit.js` - Enhanced `removeSection` method

## Benefits

1. ✅ Components are properly deleted with their sections
2. ✅ Works for both full-width and multi-column sections
3. ✅ Clear logging shows what's being deleted
4. ✅ Event system allows other parts to react
5. ✅ Prevents orphaned components
