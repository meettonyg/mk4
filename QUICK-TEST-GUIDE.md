# Quick Test Guide - Critical Fixes Verification

## 🎯 Fast Testing Protocol (15 minutes)

### Test 1: Component Edit & History (2 min)
1. Add a Hero component
2. Edit the title → Type "Test"
3. Press Ctrl+Z → Title should revert
4. Press Ctrl+Shift+Z → Title should restore
5. ✅ **Pass**: Undo/redo works correctly

### Test 2: Auto-Save Debouncing (3 min)
1. Open Network tab in DevTools
2. Make 5 rapid edits to any component
3. Wait 2 seconds
4. ✅ **Pass**: Only ONE save request appears

### Test 3: Section Duplication (2 min)
1. Add section with 2 components
2. Click duplicate section button
3. Edit component in original section
4. Check duplicate section
5. ✅ **Pass**: Duplicate unchanged

### Test 4: Theme Switching (2 min)
1. Open Settings tab in sidebar
2. Change theme dropdown
3. Check canvas updates immediately
4. Refresh page
5. ✅ **Pass**: Theme persists

### Test 5: Section Settings (3 min)
1. Click section settings (⚙️ button)
2. Change padding to "Large"
3. Set column gap to 40px
4. Set background opacity to 0.5
5. ✅ **Pass**: All changes visible on canvas

### Test 6: Import Success Message (2 min)
1. Export current media kit
2. Create new post
3. Import the file
4. ✅ **Pass**: Success message shows "X components, Y sections"

### Test 7: Component Library (1 min)
1. Open component library
2. Check browser console
3. Close library
4. ✅ **Pass**: No errors, store.componentLibraryOpen = true/false

---

## 🔍 Regression Tests (10 minutes)

### Existing Functionality
- [ ] Add component via drag-and-drop
- [ ] Remove component
- [ ] Move component between sections
- [ ] Save manually (toolbar button)
- [ ] Undo/redo multiple times
- [ ] Create new section
- [ ] Delete section
- [ ] Reorder sections

---

## ⚠️ Known Issues (Not Yet Fixed)

1. **Biography Component Listener**: Leak if component unmounts (file not found)
2. **DOMHandlers Cleanup**: No real implementation (affects legacy code only)
3. **Sidebar Quick Components**: Still use hard-coded list (low priority)

---

## 🐛 Bug Report Template

If you find an issue:

```markdown
**Issue**: [Brief description]
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected**: 
**Actual**: 
**Browser Console**: [Any errors]
**Network Tab**: [Any failed requests]
```

---

## ✅ Sign-Off

After all tests pass:

- [ ] No console errors
- [ ] No network errors
- [ ] All 7 quick tests pass
- [ ] All regression tests pass
- [ ] Ready for deployment

**Tested By**: _______________  
**Date**: _______________  
**Browser**: _______________  
**Notes**: _______________
