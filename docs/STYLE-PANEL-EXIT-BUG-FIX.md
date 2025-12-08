# Style Panel Exit Bug - Root Cause Fix

## Issue
When editing component styles in the **Style tab** or **Advanced tab** of the component editor sidebar, the panel immediately exits after each field update, forcing the user to reopen it repeatedly.

## Root Cause
The issue was in both `BaseStylePanel.vue` and `BaseAdvancedPanel.vue` update methods. Every time a style or advanced field was changed:

1. The update method would create **entirely new settings objects** using spread operators
2. Call `store.updateComponent(componentId, { settings: newSettings })`
3. This replaced the entire component object in the store
4. Vue's reactivity system detected the component reference change
5. The `ComponentEditor.vue` component's computed properties re-evaluated
6. This triggered a remount of the editor component
7. The remount caused the panel to close/reset

## The Fix
Changed all update methods in both panel files to **mutate settings in place** instead of creating new objects:

### Before (Broken):
```javascript
const updateBackground = (property, value) => {
  const component = store.components[props.componentId];
  if (component) {
    const newSettings = {
      ...component.settings,
      style: {
        ...component.settings.style,
        background: {
          ...component.settings.style.background,
          [property]: value
        }
      }
    };
    
    store.updateComponent(props.componentId, { settings: newSettings });
  }
};
```

### After (Fixed):
```javascript
const updateBackground = (property, value) => {
  const component = store.components[props.componentId];
  if (!component || !component.settings) return;
  
  // Mutate in place - preserves Vue reactivity references
  if (!component.settings.style) component.settings.style = {};
  if (!component.settings.style.background) component.settings.style.background = {};
  
  component.settings.style.background[property] = value;
  
  componentStyleService.applyStyling(props.componentId, component.settings);
  
  // Mark store as dirty without triggering full component replacement
  store.isDirty = true;
};
```

## Key Changes
1. **Direct mutation** instead of object recreation
2. **No more `store.updateComponent()` calls** - just direct property updates
3. **Set `store.isDirty = true` directly** instead of calling `_trackChange()` (which saves to history on every keystroke)
4. **Preserves Vue reactivity** - same object reference, so no remount

## Files Modified

### BaseStylePanel.vue
- `updateSpacing()`
- `updateBackground()`
- `updateTypography()`
- `updateBorderWidth()`
- `updateBorder()`
- `updateBorderRadius()`
- `updateEffect()`

### BaseAdvancedPanel.vue
- `updateLayoutWidth()`
- `updateLayout()`
- `updateResponsive()`
- `updateCustom()`

## Testing
✅ Style fields can now be updated without exiting the panel
✅ Advanced fields can now be updated without exiting the panel
✅ Live preview still updates correctly
✅ Changes are still tracked as dirty
✅ Auto-save still works
✅ No component remounting on every keystroke

## Architectural Notes
This fix follows Vue 3 best practices:
- Mutating reactive objects in place is the correct approach for fine-grained updates
- Creating new object references should only be done when replacing entire state trees
- Direct mutation of nested reactive properties is efficient and prevents unnecessary re-renders
