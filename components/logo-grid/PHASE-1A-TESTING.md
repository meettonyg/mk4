# Phase 1A Testing Guide

## Quick Browser Console Tests

Open browser console in WordPress admin while editing a media kit with Logo Grid component:

### 1. Test Expansion State
```javascript
// Check initial expansion state (should have index 0)
console.log('Expanded items:', Array.from(document.querySelectorAll('.logo-item:not(.is-collapsed)')).length);

// Should show: 1 (first item expanded by default)
```

### 2. Test Add Logo
```javascript
// Click "+ Add Logo" button
document.querySelector('.add-btn').click();

// New logo should auto-expand
// Check last logo item has expanded class
const lastItem = document.querySelectorAll('.logo-item')[document.querySelectorAll('.logo-item').length - 1];
console.log('Last item expanded:', !lastItem.classList.contains('is-collapsed'));
// Should show: true
```

### 3. Test Duplicate
```javascript
// Click first duplicate button
document.querySelector('.duplicate-btn').click();

// Original should collapse, duplicate should expand
const items = document.querySelectorAll('.logo-item');
console.log('First collapsed:', items[0].classList.contains('is-collapsed'));
console.log('Second expanded:', !items[1].classList.contains('is-collapsed'));
// Should show: true, true
```

### 4. Test Toggle
```javascript
// Click header to toggle
document.querySelector('.logo-header').click();

// Check if state changed
setTimeout(() => {
  const firstItem = document.querySelector('.logo-item');
  console.log('First item collapsed:', firstItem.classList.contains('is-collapsed'));
}, 100);
```

### 5. Test Delete
```javascript
// Get initial count
const initialCount = document.querySelectorAll('.logo-item').length;

// Click first remove button
document.querySelector('.remove-btn').click();

// Check count decreased
setTimeout(() => {
  const newCount = document.querySelectorAll('.logo-item').length;
  console.log('Deleted successfully:', newCount === initialCount - 1);
}, 100);
```

## Visual Checks

### Header Structure
Each collapsed logo should show:
- ✅ Drag handle (≡) on left
- ✅ 40×40px thumbnail (if URL exists)
- ✅ "Logo #" in blue text
- ✅ Logo name in gray text below (if name exists)
- ✅ Duplicate button (📋 icon) in blue
- ✅ Remove button (×) in red
- ✅ Expand indicator (▼) on right

### Interaction Tests

1. **Click Header:**
   - Should toggle expansion
   - Animation should be smooth (0.2s)
   - Arrow should flip (▲ ↔ ▼)

2. **Click Drag Handle:**
   - Should NOT toggle expansion
   - Cursor should show "grab"
   - Should be draggable

3. **Click Duplicate:**
   - Should NOT toggle expansion
   - Should create copy below original
   - Original should collapse
   - Copy should expand

4. **Click Remove:**
   - Should NOT toggle expansion
   - Should delete immediately
   - No confirmation dialog

5. **Hover Effects:**
   - Header: light background change
   - Duplicate button: lift slightly
   - Remove button: lift slightly
   - Drag handle: darker background

### Dark Mode Test
Toggle dark mode and verify:
- ✅ All colors invert correctly
- ✅ No white-on-white text
- ✅ Borders visible
- ✅ Hover states work

## Expected Behavior Summary

| Action | Expected Result |
|--------|----------------|
| Initial load | First logo expanded, rest collapsed |
| Add logo | New logo auto-expands |
| Duplicate logo | Copy expands, original collapses |
| Delete logo | State cleaned, no errors |
| Click header | Toggle expansion smoothly |
| Click action button | Action executes, no toggle |
| Drag logo | Reorders, no toggle |

## Error Conditions to Check

### Should NOT See:
- ❌ Console errors
- ❌ Orphaned expansion state after delete
- ❌ Multiple items with same index
- ❌ Broken layout with missing thumbnail
- ❌ Toggle when clicking action buttons
- ❌ Layout shift when expanding/collapsing

### Should See:
- ✅ Smooth animations
- ✅ Consistent spacing
- ✅ Proper text truncation
- ✅ Working dark mode
- ✅ Accessible focus states

## Performance Check

With 12 logos:
- Initial render: < 100ms
- Toggle expansion: < 50ms
- Add/duplicate: < 100ms
- Delete: < 50ms

## Accessibility Check

1. Tab through items - headers should be focusable
2. Enter/Space on header - should toggle (future enhancement)
3. Action buttons have proper titles
4. Thumbnail has alt text

---

## Quick Pass/Fail Test

Run through this sequence:

1. ✅ Load page → First logo expanded
2. ✅ Click "+ Add Logo" → New logo expands
3. ✅ Click duplicate on logo 1 → Copy expands, original collapses
4. ✅ Click header on logo 2 → Toggles smoothly
5. ✅ Drag logo 1 to position 3 → Reorders correctly
6. ✅ Delete logo 2 → Removed cleanly
7. ✅ Toggle dark mode → Colors correct
8. ✅ No console errors → Clean

If all ✅, Phase 1A is working correctly!
