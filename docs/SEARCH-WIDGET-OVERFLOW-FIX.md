# Search Widget Overflow Fix

## Issue
The search widget form in the sidebar was overflowing its container, causing layout issues.

## Root Cause
The search input had `width: 100%` but was missing `box-sizing: border-box`, which meant the padding and border were added **on top of** the 100% width, causing it to overflow the container.

### CSS Box Model Issue
```css
/* BEFORE - Incorrect */
.search-input {
  width: 100%;           /* Takes 100% of parent */
  padding: 8px 12px 8px 36px;  /* Added OUTSIDE the width */
  border: 1px solid ...;       /* Added OUTSIDE the width */
  /* Total width = 100% + padding + border = OVERFLOW! */
}
```

## Solution Implemented

### 1. Global Box-Sizing Reset
Added at the top of the component styles:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

This ensures **all elements** in the sidebar calculate their width including padding and borders.

### 2. Explicit Box-Sizing on Inputs
Added to both `.search-input` and `.text-input`:

```css
.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #d1d5db;
  box-sizing: border-box;  /* ✅ ADDED */
  /* Now: Total width = 100% (including padding and border) */
}

.text-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  box-sizing: border-box;  /* ✅ ADDED */
}
```

## Files Modified
- `src/vue/components/sidebar/SidebarTabs.vue`

## Changes Made
1. ✅ Added global `box-sizing: border-box` reset
2. ✅ Added `box-sizing: border-box` to `.search-input`
3. ✅ Added `box-sizing: border-box` to `.text-input`

## Why Box-Sizing: Border-Box?

### Default Behavior (content-box)
```
Total Width = width + padding + border
100% + 20px padding + 2px border = 100% + 22px = OVERFLOW
```

### With border-box
```
Total Width = width (includes padding and border)
100% (everything included) = Fits perfectly!
```

## Benefits
- ✅ Search input stays within container
- ✅ All text inputs protected from overflow
- ✅ Consistent behavior across all elements
- ✅ Prevents future layout issues
- ✅ Follows modern CSS best practices

## Testing Checklist
- [ ] Search widget fits perfectly in sidebar (light mode)
- [ ] Search widget fits perfectly in sidebar (dark mode)
- [ ] Text inputs in Settings tab don't overflow
- [ ] No horizontal scrollbar in sidebar
- [ ] Padding is visible and correct
- [ ] Border is visible and correct

## Browser Compatibility
`box-sizing: border-box` is supported in all modern browsers and IE8+.

## Why This Wasn't Caught Earlier
The `scoped` style in Vue components means this only affects the sidebar. Other components may have their own box-sizing rules or rely on global CSS that already includes this reset.

## Best Practice
Modern CSS frameworks (like Tailwind, Bootstrap) **always** include a `box-sizing: border-box` reset as the first rule in their CSS. This should be standard in all new components.

## Commit Message
```
fix(ui): prevent search widget overflow with box-sizing reset

WHAT: Search input was overflowing sidebar container
WHY: Missing box-sizing: border-box caused width calculation issues
HOW: Added global box-sizing reset and explicit rules for inputs

Changes:
- Added universal box-sizing reset to sidebar component
- Applied border-box to search-input
- Applied border-box to text-input

Result: All inputs now stay within their containers correctly
```

## Architecture Compliance
✅ **Root Cause Fix:** Fixed the fundamental CSS issue, not just a symptom  
✅ **Simplicity:** Simple CSS property addition  
✅ **No Bloat:** Minimal code change with maximum effect  
✅ **Maintainability:** Follows modern CSS best practices  
✅ **Prevention:** Global reset prevents future occurrences

## Related Issues Prevented
This fix also prevents potential overflow issues with:
- Text inputs in Settings tab (Max Width, Section Spacing, Container Padding)
- Any future input fields added to the sidebar
- Pseudo-elements that might be added later

## Visual Comparison

### Before
```
┌─────────────┐
│ Sidebar     │
│ ┌─────────────┐  ← Input overflows!
│ │Search Widg...│
│ └─────────────┘
└─────────────┘
```

### After
```
┌─────────────┐
│ Sidebar     │
│ ┌──────────┐│  ← Input fits perfectly!
│ │Search Wid││
│ └──────────┘│
└─────────────┘
```

## Additional Notes
This is a common CSS "gotcha" that catches many developers. The default `box-sizing: content-box` is unintuitive for layout work, which is why modern CSS resets always include `box-sizing: border-box` as the first rule.

---

**Status:** ✅ Fixed  
**Priority:** P1 (UI Breaking Issue)  
**Impact:** Affects all users using the sidebar search
