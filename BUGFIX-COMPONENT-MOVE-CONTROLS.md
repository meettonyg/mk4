# Bug Fix: Component Move Up/Down Controls Not Working

## Problem
The component move up and down controls in ComponentControls.vue were not working.

## Root Cause Analysis

### Issue 1: Method Signature Mismatch
**Location**: `src/vue/components/builder/ComponentControls.vue`

The `moveUp()` and `moveDown()` methods were calling `store.moveComponent()` with incorrect arguments:

```javascript
// BEFORE (Incorrect)
const moveUp = () => {
  if (!isFirst.value) {
    store.moveComponent(props.index, props.index - 1);  // Passing indices
  }
};
```

But the store expected:
```javascript
moveComponent(componentId, direction)  // direction = 'up' or 'down'
```

### Issue 2: Incorrect Props in Parent Component
**Location**: `src/vue/components/SectionLayoutEnhanced.vue`

The ComponentWrapper was receiving hardcoded values instead of actual component positions:

```vue
<!-- BEFORE (Incorrect) -->
<ComponentWrapper
  :index="0"              <!-- Always 0! -->
  :total-components="1"   <!-- Always 1! -->
/>
```

This meant:
- Every component thought it was at position 0
- Every component thought there was only 1 component total
- The `isFirst` and `isLast` computed properties were always wrong

## Solution

### Fix 1: Update ComponentControls Method Calls
**File**: `src/vue/components/builder/ComponentControls.vue`

Changed to pass the correct arguments to `store.moveComponent()`:

```javascript
// AFTER (Correct)
const moveUp = () => {
  if (!isFirst.value) {
    console.log('Moving component up:', props.componentId);
    store.moveComponent(props.componentId, 'up');  // componentId + direction
  }
};

const moveDown = () => {
  if (!isLast.value) {
    console.log('Moving component down:', props.componentId);
    store.moveComponent(props.componentId, 'down');  // componentId + direction
  }
};
```

### Fix 2: Pass Correct Props from Parent
**File**: `src/vue/components/SectionLayoutEnhanced.vue`

Updated all draggable templates to pass actual index and count:

```vue
<!-- AFTER (Correct) -->
<!-- Full Width Section -->
<template #item="{element: componentId, index}">
  <ComponentWrapper
    :index="index"
    :total-components="section.components.length"
  />
</template>

<!-- Two Column Section - Column 1 -->
<template #item="{element: componentId, index}">
  <ComponentWrapper
    :index="index"
    :total-components="getColumnComponents(section, 1).length"
  />
</template>

<!-- Two Column Section - Column 2 -->
<template #item="{element: componentId, index}">
  <ComponentWrapper
    :index="index"
    :total-components="getColumnComponents(section, 2).length"
  />
</template>

<!-- Three Column Section -->
<template #item="{element: componentId, index}">
  <ComponentWrapper
    :index="index"
    :total-components="getColumnComponents(section, col).length"
  />
</template>
```

## How the Store Method Works

The `moveComponent` method in the store expects:
1. **componentId**: The unique ID of the component to move
2. **direction**: Either 'up' or 'down'

```javascript
// Store method (src/stores/mediaKit.js)
moveComponent(componentId, direction) {
  for (const section of this.sections) {
    if (section.components) {
      const index = section.components.findIndex(comp => 
        (typeof comp === 'string' ? comp : comp.component_id) === componentId
      );
      
      if (index > -1) {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (newIndex >= 0 && newIndex < section.components.length) {
          // Swap components
          const temp = section.components[index];
          section.components[index] = section.components[newIndex];
          section.components[newIndex] = temp;
          this.isDirty = true;
          this._trackChange();
        }
        return;
      }
    }
    // ... similar logic for multi-column sections
  }
}
```

## Testing Checklist

- [ ] Add multiple components to a full-width section
- [ ] Verify up arrow is disabled for first component
- [ ] Verify down arrow is disabled for last component
- [ ] Click up arrow on second component - should move above first
- [ ] Click down arrow on first component - should move below second
- [ ] Test in two-column layout
- [ ] Test in three-column layout
- [ ] Verify save/persistence works after moving

## Files Modified

1. ✅ `src/vue/components/builder/ComponentControls.vue` - Fixed method calls
2. ✅ `src/vue/components/SectionLayoutEnhanced.vue` - Fixed props passing

## Additional Notes

- The fix also adds console logging to help debug move operations
- The store method properly handles both full-width and multi-column sections
- The fix maintains the existing drag-and-drop functionality (unchanged)
- Component order is persisted on save (already working)

## Related Code References

- Store: `src/stores/mediaKit.js` - Line ~1154 (moveComponent method)
- Controls: `src/vue/components/builder/ComponentControls.vue` - Lines 119-133
- Layout: `src/vue/components/SectionLayoutEnhanced.vue` - Multiple locations

## Prevention Checklist (For Future Development)

When adding similar functionality:
- [ ] Verify method signatures match between caller and callee
- [ ] Ensure props are passed correctly from parent components
- [ ] Use actual data from draggable/v-for instead of hardcoded values
- [ ] Test with multiple items to verify index calculations
- [ ] Add debug logging for complex operations
- [ ] Document expected parameters and behavior
