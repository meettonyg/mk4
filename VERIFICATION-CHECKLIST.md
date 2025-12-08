# Drag-and-Drop Fix Verification Checklist

## Pre-Flight Check
Run these commands before testing in the browser:

```bash
# Build the project
npm run build

# Check for TypeScript/syntax errors  
npm run type-check

# Run tests (if available)
npm test
```

## Browser Testing Steps

### Test 1: Empty Canvas - Drag from Sidebar
**Steps:**
1. Open Media Kit Builder in browser
2. Delete all existing sections (if any)
3. Verify empty state message appears
4. Open browser console (F12)
5. Drag "Hero" component from sidebar Quick Add
6. Hover over empty canvas - verify drop zone highlights
7. Drop component

**Expected Console Output:**
```
🎯 Started dragging component from sidebar: hero
✅ Auto-created two_column section for component: section_[timestamp]
✅ Component added to auto-created section: comp_[timestamp]
✅ Sections now: 1
✅ Drag ended
```

**Expected UI:**
- New two-column section appears
- Hero component is in column 1
- Component is immediately selectable

**Pass Criteria:** ✅ Component added successfully, no errors

---

### Test 2: Existing Section - Drag from Sidebar
**Steps:**
1. Ensure at least one section exists
2. Drag "Biography" from sidebar Quick Add
3. Drop into section column 2

**Expected:**
- Component appears in column 2
- No new section created
- Save indicator shows unsaved changes

**Pass Criteria:** ✅ Component in correct column

---

### Test 3: Drag from Component Library Modal
**Steps:**
1. Click "Browse All Components"
2. Drag "Contact" component
3. Drop onto canvas

**Expected:**
- Works identically to sidebar drag
- Modal stays open (doesn't close on drag)
- Component added successfully

**Pass Criteria:** ✅ No regression, works as before

---

### Test 4: Visual Feedback
**Steps:**
1. Hover over draggable component
2. Start dragging
3. Hover over drop zone
4. Complete drop

**Expected Visual States:**
1. **Hover**: Cursor shows "grab" icon
2. **Dragging**: 
   - Cursor shows "grabbing" icon
   - Component becomes semi-transparent (opacity: 0.5)
3. **Over Drop Zone**:
   - Drop zone border turns blue
   - Drop zone background highlights
4. **After Drop**:
   - Visual feedback clears
   - Component renders normally

**Pass Criteria:** ✅ All visual states work correctly

---

### Test 5: Multiple Component Types
**Steps:**
1. Drag and drop each component type:
   - Hero
   - Biography  
   - Topics
   - Contact
   - Social Media
   - Call to Action

**Expected:**
- All types drag successfully
- Correct default data/props applied
- No console errors

**Pass Criteria:** ✅ All 6 component types work

---

### Test 6: Recent Components
**Steps:**
1. Add a few components using click (to populate recent)
2. Drag a component from "Recently Used" section
3. Drop onto canvas

**Expected:**
- Recent components also draggable
- Same behavior as Quick Add

**Pass Criteria:** ✅ Recent components draggable

---

### Test 7: Edge Cases

#### 7a: Cancel Drag (ESC or drag outside)
**Steps:**
1. Start dragging component
2. Press ESC key
3. Verify state clears

**Expected:**
- Drag state cleared
- No component added
- Visual feedback removed

#### 7b: Rapid Dragging
**Steps:**
1. Rapidly drag and drop multiple components
2. Verify no race conditions

**Expected:**
- All components added correctly
- No undefined errors
- Correct section assignment

#### 7c: Drag Between Columns
**Steps:**
1. Add component to column 1
2. Drag existing component to column 2

**Expected:**
- Component moves to column 2
- No duplication
- Original position empty

**Pass Criteria:** ✅ All edge cases handled

---

## Console Error Check

### Zero Tolerance Errors
These should NEVER appear:
- ❌ "Cannot read property 'type' of undefined"
- ❌ "Component not found"
- ❌ "Section not found"
- ❌ "Uncaught TypeError"

### Acceptable Warnings
These are OK:
- ⚠️ "Component validation warnings" (if data incomplete)
- ⚠️ "Pods enrichment warnings" (if Pods not configured)

---

## Network Tab Check

### Expected API Calls
When dropping a component:
1. **No immediate save** - waits for auto-save (2 second debounce)
2. **After 2 seconds**: POST to `/wp-json/gmkb/v2/media-kits/[id]`
3. **Response**: `{"success": true, "components_saved": X}`

### Pass Criteria
- ✅ No failed network requests
- ✅ Auto-save triggers after 2 seconds
- ✅ Response confirms component saved

---

## Store State Validation

### Open Vue DevTools

**Check UI Store:**
```javascript
// Should show:
{
  isDragging: false (when not dragging)
  draggedComponentId: null
  draggedComponentType: null
  dropTargetId: null
}
```

**Check MediaKit Store:**
```javascript
// Should show:
{
  components: { comp_xxx: {...} }  // New component
  sections: [{ section_id: ..., columns: {...} }]
  isDirty: true  // Unsaved changes flag
}
```

**Pass Criteria:** ✅ State matches expected values

---

## Regression Testing

### Features That Should Still Work
- [x] Click to add components (sidebar)
- [x] Click to add components (modal)
- [x] Section creation via Layout tab
- [x] Component editing
- [x] Component deletion
- [x] Undo/Redo
- [x] Save functionality
- [x] Theme switching
- [x] Device preview modes

### Pass Criteria
✅ **All existing features work exactly as before**

---

## Performance Check

### Metrics to Monitor
1. **Time to First Interaction**
   - Drag should start < 16ms (1 frame)
   
2. **Drop Response Time**
   - Component should appear < 100ms
   
3. **Memory Usage**
   - No memory leaks during repeated drag/drop
   - Check Chrome Task Manager

### Pass Criteria
✅ No performance degradation vs. previous version

---

## Cross-Browser Testing

### Required Browsers
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if Mac available)

### Pass Criteria
✅ Works in all major browsers

---

## Mobile Testing (Optional)

### Touch Events
While drag-drop is primarily for desktop, verify:
- Click-to-add still works on mobile
- No JavaScript errors on touch devices

---

## Final Sign-Off

### Critical Pass Criteria (Must All Pass)
1. ✅ Components can be dragged from sidebar
2. ✅ Components can be dropped on empty canvas
3. ✅ Components can be dropped in existing sections
4. ✅ Visual feedback works correctly
5. ✅ No console errors
6. ✅ Auto-save triggers
7. ✅ State management correct
8. ✅ No regressions in existing features

### Sign-Off
- **Tested By:** _________________
- **Date:** _________________
- **Build Version:** _________________
- **Result:** PASS / FAIL
- **Notes:** _________________

---

## Troubleshooting

### Issue: Components not draggable
**Check:**
1. `draggable="true"` attribute present?
2. `@dragstart` handler attached?
3. Console errors?

### Issue: Drop doesn't work
**Check:**
1. Drop zone has `@drop.prevent`?
2. Drop zone has `@dragover.prevent`?
3. `event.dataTransfer` data set correctly?

### Issue: Component added to wrong place
**Check:**
1. `sectionId` and `column` parameters correct?
2. Section structure initialized?
3. Store `addComponent` logic working?

### Issue: Visual feedback not working
**Check:**
1. CSS classes applied during drag?
2. `.dragging` class defined?
3. Browser CSS cache cleared?

---

## Next Steps After Verification

1. **If ALL tests pass:**
   - Commit changes with detailed message
   - Push to repository
   - Create pull request
   - Update documentation

2. **If ANY test fails:**
   - Document failure details
   - Debug specific issue
   - Re-run verification
   - Do not commit until all pass

---

## Git Commit Message Template

```
fix: enable drag-and-drop for sidebar components

ROOT CAUSE:
- SidebarComponents.vue only had click handlers
- Missing @dragstart/@dragend event handlers
- Incorrect store usage (mediaKit vs ui)

SOLUTION:
- Added draggable="true" to component buttons
- Implemented onDragStart/onDragEnd handlers
- Fixed store references to use UI store
- Added visual feedback CSS

IMPACT:
- Users can now drag from sidebar Quick Add
- Users can now drag from Recent Components
- Maintains backward compatibility (click still works)
- No performance impact

TESTING:
- Verified drag from sidebar to empty canvas
- Verified drag from sidebar to existing sections
- Verified Component Library modal still works
- Verified visual feedback works correctly
- Zero console errors

FILES MODIFIED:
- src/vue/components/SidebarComponents.vue
- src/vue/components/ComponentLibraryNew.vue

CHECKLIST: ✅ All phases passed
```
