# Phase 4 Testing Guide - Section & Layout System

## 🎯 Testing Overview
This guide will help you test all the new Phase 4 features including VueDraggable integration, section management, and drag & drop functionality.

## 📋 Pre-Testing Checklist

1. **Build Complete**: Ensure `npm run build` completed successfully
2. **WordPress Running**: Your local WordPress site should be running
3. **Browser Console Open**: Press F12 to open DevTools for debugging
4. **Media Kit Page Loaded**: Navigate to your Media Kit Builder page

## 🧪 Test Scenarios

### 1. Initial Load Test
**Goal**: Verify Vue app initializes correctly

```javascript
// In browser console, check these:
gmkbStore.$state          // Should show store state
gmkbStore.sections        // Should show sections array
gmkbStore.components      // Should show components object
window.GMKB               // Should have helper methods
```

**Expected**: 
- ✅ No console errors
- ✅ Vue DevTools shows component tree
- ✅ Store is accessible

---

### 2. Section Creation Test
**Goal**: Test adding different section layouts

```javascript
// Test 1: Add full-width section
GMKB.addSection('full_width')

// Test 2: Add two-column section
GMKB.addSection('two_column')

// Test 3: Add three-column section
GMKB.addSection('three_column')

// Verify sections were added
gmkbStore.sections.length  // Should be 3
```

**Visual Check**:
- ✅ Sections appear in the builder
- ✅ Each section has correct layout
- ✅ Empty drop zones show "Drop components here"
- ✅ Section controls appear on hover

---

### 3. Component Adding via Console
**Goal**: Test programmatic component addition

```javascript
// Add components to specific sections and columns
// Get first section ID
const sectionId = gmkbStore.sections[0]?.section_id

// Add hero to first section
GMKB.addComponent({
  type: 'hero',
  sectionId: sectionId
})

// Add biography to second column of two-column section
const twoColSection = gmkbStore.sections.find(s => s.layout === 'two_column')
if (twoColSection) {
  GMKB.addComponent({
    type: 'biography',
    sectionId: twoColSection.section_id,
    column: 2
  })
}

// Add multiple components
['topics', 'contact', 'social'].forEach(type => {
  GMKB.addComponent({ type })
})
```

**Expected**:
- ✅ Components appear in correct sections
- ✅ Components show in specified columns
- ✅ Component wrapper shows hover controls

---

### 4. Drag & Drop Test - Sidebar to Section
**Goal**: Test dragging from sidebar to sections

**Steps**:
1. Open component library (click "Add Component" or use sidebar)
2. Drag a component (e.g., "Hero") from sidebar
3. Drop onto a section's drop zone
4. Try dropping in different columns

**Expected**:
- ✅ Component becomes draggable (cursor changes)
- ✅ Drop zones highlight when hovering
- ✅ Component appears where dropped
- ✅ Toast notification confirms addition

---

### 5. Component Reordering Test
**Goal**: Test VueDraggable within sections

**Steps**:
1. Add 3+ components to a section
2. Drag a component to reorder within the same column
3. Drag a component to a different column (in multi-column sections)

**Expected**:
- ✅ Components animate smoothly during drag
- ✅ Ghost element shows during drag
- ✅ Components reorder correctly
- ✅ State updates in store

```javascript
// Verify order in console
gmkbStore.getSectionComponents(sectionId)
```

---

### 6. Section Reordering Test
**Goal**: Test section drag & drop

**Steps**:
1. Create 3+ sections
2. Hover over a section to see controls
3. Drag section using the drag handle (⋮⋮)
4. Drop to reorder sections

**Expected**:
- ✅ Section becomes draggable with handle
- ✅ Sections reorder smoothly
- ✅ Components stay within their sections

---

### 7. Section Controls Test
**Goal**: Test section management controls

**For each section, test**:

**A. Duplicate Section**:
- Click duplicate button (📑)
- Verify new section appears with same layout
- Check if components are also duplicated

**B. Section Settings**:
- Click settings button (⚙️)
- Modal should open with layout options
- Try changing:
  - Layout type
  - Background color
  - Opacity
  - Padding/spacing
  - Advanced options

**C. Remove Section**:
- Click delete button (✕)
- Confirm dialog should appear
- Section and its components should be removed

---

### 8. Component Controls Test
**Goal**: Test individual component management

**For each component**:
- Hover to see controls
- **Edit**: Click edit button, verify editor opens
- **Duplicate**: Click duplicate, verify copy appears
- **Remove**: Click remove, confirm deletion

---

### 9. Keyboard Shortcuts Test
**Goal**: Test keyboard functionality

```javascript
// First make some changes
GMKB.addComponent({ type: 'hero' })

// Test shortcuts:
// Ctrl+S (or Cmd+S on Mac) - Save
// Ctrl+Z - Undo
// Ctrl+Shift+Z - Redo
```

**Expected**:
- ✅ Save shows toast notification
- ✅ Undo removes last action
- ✅ Redo restores action

---

### 10. Save & Reload Test
**Goal**: Verify persistence

**Steps**:
1. Add sections and components
2. Save (Ctrl+S or click Save button)
3. Refresh the page
4. Check if layout persists

```javascript
// After reload, verify:
gmkbStore.sections.length    // Should match what you created
gmkbStore.componentCount     // Should match component count
```

---

### 11. Responsive Design Test
**Goal**: Test mobile responsiveness

**Steps**:
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test at different breakpoints:
   - Mobile: 320px, 375px, 414px
   - Tablet: 768px
   - Desktop: 1024px, 1440px

**Expected**:
- ✅ Three columns stack on mobile
- ✅ Two columns stack on tablets
- ✅ Controls remain accessible
- ✅ Drag & drop works on touch devices

---

### 12. Empty State Test
**Goal**: Test first-user experience

```javascript
// Clear everything
gmkbStore.clearAllComponents()
gmkbStore.clearAllSections()
```

**Expected**:
- ✅ Empty state message appears
- ✅ "Add Your First Section" button works
- ✅ Tips are displayed

---

### 13. Theme Integration Test
**Goal**: Verify theme variables work

```javascript
// Switch themes
switchTheme('modern_dark')
switchTheme('creative_bold')
switchTheme('minimal_elegant')
```

**Expected**:
- ✅ Section backgrounds adapt to theme
- ✅ Controls maintain visibility
- ✅ Drop zones remain clear

---

### 14. Performance Test
**Goal**: Ensure smooth operation

**Steps**:
1. Add 10+ sections
2. Add 20+ components
3. Perform rapid drag operations
4. Monitor performance

```javascript
// Check performance
performance.memory  // Monitor memory usage
gmkbStore.componentCount  // Count components
```

**Expected**:
- ✅ No lag during drag operations
- ✅ Smooth animations (60fps)
- ✅ No memory leaks

---

### 15. Error Handling Test
**Goal**: Test error scenarios

```javascript
// Try invalid operations
GMKB.addComponent({ type: 'invalid_type' })  // Should be rejected
GMKB.removeSection('fake_id')  // Should handle gracefully
GMKB.addComponent({})  // Missing type

// Check console for proper error messages
```

**Expected**:
- ✅ Invalid operations are rejected
- ✅ Meaningful error messages
- ✅ App doesn't crash

---

## 🐛 Debug Commands

If something isn't working, use these commands:

```javascript
// View current state
console.log(gmkbStore.$state)

// Check sections structure
gmkbStore.sections.forEach(s => {
  console.log(`Section ${s.section_id}:`, s)
})

// Check component locations
gmkbStore.orderedComponents

// Force a re-render
gmkbStore._trackChange()

// Check for Vue instance
window.gmkbVueInstance

// Check drag & drop manager
window.gmkbDragDrop

// View all available component types
UnifiedComponentRegistry.getAvailableTypes()
```

---

## 📊 Test Results Checklist

### Core Functionality
- [ ] Vue app initializes without errors
- [ ] Sections can be created (all 3 layouts)
- [ ] Components can be added programmatically
- [ ] Drag from sidebar works
- [ ] Component reordering works
- [ ] Section reordering works
- [ ] Section controls work (duplicate/settings/remove)
- [ ] Component controls work (edit/duplicate/remove)
- [ ] Keyboard shortcuts work
- [ ] Save and reload preserves state

### UI/UX
- [ ] Drop zones highlight on hover
- [ ] Drag animations are smooth
- [ ] Toast notifications appear
- [ ] Empty state shows when appropriate
- [ ] Controls appear on hover
- [ ] Settings modal works

### Responsive
- [ ] Mobile layout works
- [ ] Tablet layout works
- [ ] Touch drag works (if testing on device)

### Performance
- [ ] No console errors
- [ ] Smooth 60fps animations
- [ ] No memory leaks
- [ ] Fast section/component operations

---

## 🆘 Troubleshooting

### Issue: Components not dropping
```javascript
// Check if drag manager is initialized
window.gmkbDragDrop
// Re-initialize if needed
initDragDrop()
```

### Issue: Sections not appearing
```javascript
// Check store state
gmkbStore.sections
// Force add a section
gmkbStore.addSection('full_width')
```

### Issue: Vue not loading
```javascript
// Check for Vue instance
window.gmkbApp
window.gmkbVueInstance
// Check for errors
console.error
```

### Issue: Save not working
```javascript
// Check nonce
window.gmkbData.nonce
// Try manual save
gmkbStore.saveToWordPress()
```

---

## 📝 Report Template

After testing, document results:

```
Phase 4 Test Results
Date: [DATE]
Tester: [NAME]
Environment: [Browser/OS]

✅ Passed Tests:
- [List passed tests]

❌ Failed Tests:
- [List failed tests with error details]

🐛 Bugs Found:
1. [Bug description]
   - Steps to reproduce
   - Expected vs Actual
   - Console errors

📊 Performance:
- Load time: [X]s
- Components tested: [X]
- Sections tested: [X]
- Memory usage: [X]MB

💡 Suggestions:
- [Any improvement ideas]
```

---

## 🎉 Success Criteria

Phase 4 is successful if:
- ✅ All section layouts work
- ✅ Drag & drop is intuitive and smooth
- ✅ No console errors during normal use
- ✅ State persists after save/reload
- ✅ Performance remains good with many components
- ✅ Mobile responsive design works

Good luck testing! 🚀
