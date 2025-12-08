# Component Controls Visibility Fix

**Date**: November 10, 2025  
**Issue**: Component edit controls (Edit, Duplicate, Delete buttons) were not visible in the builder interface.

## Root Cause Analysis

The component controls were being hidden due to CSS `overflow` clipping. The controls are positioned absolutely with `top: -35px` (for components) and `top: -40px` (for sections), which means they render outside their parent container's bounds.

### Key Finding
Without explicit `overflow: visible` declarations, CSS defaults to `overflow: visible` for regular elements BUT parent containers in a complex layout hierarchy can inadvertently clip child elements. The issue was that multiple container levels in the component rendering chain were missing the `overflow: visible` declaration.

## Files Modified

### 1. SectionLayoutEnhanced.vue
**Path**: `src/vue/components/SectionLayoutEnhanced.vue`

#### Changes Made:
1. **`.gmkb-section`** - Added `position: relative` and `overflow: visible`
   - Required for section header controls to render above the section
   
2. **`.gmkb-section__content`** - Added `overflow: visible`
   - Allows component controls in the content area to render outside bounds
   
3. **`.gmkb-section__column`** - Added `overflow: visible`
   - Ensures controls in multi-column layouts aren't clipped
   
4. **`.component-drop-zone`** - Added `overflow: visible`
   - Drop zones must not clip the controls of contained components
   
5. **`.component-list`** - Added `overflow: visible`
   - Draggable container must allow controls to render outside

### 2. ComponentWrapper.vue
**Path**: `src/vue/components/ComponentWrapper.vue`

#### Changes Made:
1. **`.component-wrapper`** - Added `overflow: visible`
   - The wrapper already had `position: relative`, but needed explicit overflow declaration
   - This ensures ComponentControls (which are absolutely positioned) can render above the component

## Architecture Principles Applied

### ✅ ROOT CAUSE FIX
- Fixed the fundamental CSS stacking and overflow issue
- No patches or workarounds - proper CSS architecture solution

### ✅ CONSISTENT PATTERN
- Applied `overflow: visible` consistently through the entire component rendering hierarchy
- Section → Section Content → Column → Drop Zone → Component List → Component Wrapper

### ✅ NO BLOAT
- Only added necessary CSS properties
- No redundant or "just in case" styling

## CSS Rendering Chain

```
.gmkb-section (position: relative, overflow: visible)
  ├── .gmkb-section__header (position: absolute, top: -40px)
  │   └── Section controls bar
  └── .gmkb-section__content (overflow: visible)
      └── .gmkb-section__column (overflow: visible)
          └── .component-drop-zone (overflow: visible)
              └── .component-list (overflow: visible)
                  └── .component-wrapper (position: relative, overflow: visible)
                      ├── ComponentControls (position: absolute, top: -35px)
                      │   └── Component edit/delete/move buttons
                      └── .component-root (overflow: hidden - OK, only clips content)
                          └── Actual component content
```

## Why This Works

1. **Position Context**: Each absolutely positioned control bar has a proper positioning context via `position: relative` on its parent
2. **Overflow Chain**: Every container in the hierarchy explicitly allows overflow, preventing any level from clipping the controls
3. **Component Root Isolation**: The `.component-root` can keep `overflow: hidden` because controls are positioned on the wrapper, not the root

## Testing Checklist

- [ ] Component controls visible on hover for all component types
- [ ] Section controls visible on hover for all section types
- [ ] Controls render correctly in full-width layouts
- [ ] Controls render correctly in two-column layouts
- [ ] Controls render correctly in three-column layouts
- [ ] Controls render correctly in sidebar layouts
- [ ] Controls don't overlap with adjacent components
- [ ] Drag-and-drop still works correctly
- [ ] No visual regressions in component rendering

## Post-Fix Verification

After applying this fix:
1. Hover over any component in the builder
2. The edit controls bar should appear above the component with Edit, Duplicate, and Delete buttons
3. Hover over a section
4. The section controls should appear above the section with Move, Settings, and Delete buttons
5. All controls should be fully visible and clickable

## Notes

- This fix addresses only the VISIBILITY issue, not any functionality issues
- The controls themselves (ComponentControls.vue) were working correctly - they just weren't being displayed
- No JavaScript changes were needed - purely a CSS rendering issue
- The fix follows WordPress best practices for builder interfaces (similar to Elementor's approach)
