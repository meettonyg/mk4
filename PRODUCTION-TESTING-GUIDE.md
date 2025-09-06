# Media Kit Builder - Production Testing Guide

## 🚀 Quick Start Testing

Based on the QA Testing Plan, here's how to test the Media Kit Builder in production.

## Prerequisites

1. **Access the Builder**:
   - Navigate to: `/tools/media-kit/` 
   - OR go to WordPress Admin → Media Kit Builder
   - Add `?post_id={id}` to edit a specific guest post

2. **Browser Setup**:
   - Open Developer Tools (F12)
   - Check Console for initialization messages
   - Look for: `"✅ GMKB: Comprehensive WordPress-native assets enqueued successfully"`

---

## 🧪 Core Functionality Tests

### Test 1: Component Library (CRITICAL)
```javascript
// In browser console, verify component library loads
console.log('Component Library Ready:', !!window.componentLibrarySystem);
console.log('Components Available:', window.componentDiscovery?.getComponents());
```

**Manual Test**:
1. Click "Add Component" button
2. ✅ Modal opens without "Loading components..." stuck state
3. ✅ All component types visible (Hero, Biography, Topics, etc.)
4. ✅ Click a component to add it
5. ✅ Component appears instantly in preview

### Test 2: Save/Load Functionality
```javascript
// Test save functionality
window.enhancedComponentManager.manualSave();

// Check last save time
console.log('Last Save:', window.enhancedStateManager.getState().lastSaved);
```

**Manual Test**:
1. Add 2-3 components
2. Click Save button
3. Refresh the page
4. ✅ All components reload in correct order
5. ✅ Component data preserved

### Test 3: Component Controls
```javascript
// Verify controls system
console.log('Controls Manager:', !!window.componentControlsManager);
console.log('Controls Ready:', window.componentControlsManager?.isInitialized);
```

**Manual Test**:
1. Hover over any component
2. ✅ Control buttons appear (Move Up/Down, Duplicate, Delete, Edit)
3. Test each control:
   - **Move**: Changes position
   - **Duplicate**: Creates copy
   - **Delete**: Removes with confirmation
   - **Edit**: Opens design panel

### Test 4: Design Panel & Editing
```javascript
// Test design panel
const firstComponent = document.querySelector('[data-component-id]');
if (firstComponent) {
    const id = firstComponent.dataset.componentId;
    window.designPanel.show(firstComponent.dataset.componentType, id);
}
```

**Manual Test**:
1. Click Edit on any component
2. ✅ Design panel slides in from right
3. ✅ Make changes in panel
4. ✅ Changes reflect in preview instantly
5. ✅ Panel stays open during edits

### Test 5: Theme System
```javascript
// Check theme system
console.log('Theme Manager:', !!window.themeManager);
console.log('Available Themes:', window.themeManager?.getAvailableThemes());
```

**Manual Test**:
1. Click theme button (🎨) in toolbar
2. ✅ 4 themes appear in dropdown
3. Switch between themes
4. ✅ Instant style changes
5. ✅ No layout breaking

### Test 6: Section System
```javascript
// Test section system
console.log('Section Manager:', !!window.sectionLayoutManager);
console.log('Sections:', window.sectionLayoutManager?.getAllSections());
```

**Manual Test**:
1. Click "Add Section" in sidebar
2. Choose section type (Full Width, Two Column, Three Column)
3. ✅ Section appears with proper layout
4. ✅ Can drag components to columns
5. ✅ Components stay in assigned columns

---

## 📊 Performance Tests

### Load Time Test
```javascript
// Measure initialization time
console.time('Builder Ready');
// Reload page
// After load, run:
console.timeEnd('Builder Ready');
// Should be < 3 seconds
```

### Component Stress Test
```javascript
// Add multiple components quickly
for(let i = 0; i < 10; i++) {
    window.enhancedComponentManager.addComponent('hero', {
        title: `Test Component ${i}`
    });
}
// Check performance remains smooth
```

---

## 🔍 Diagnostic Commands

Run these in browser console for detailed diagnostics:

```javascript
// Full system status
gmkbData

// State inspection
window.enhancedStateManager.getState()

// Component discovery status
window.componentDiscovery.getDebugInfo()

// Theme information
window.themeManager.getDebugInfo()

// Section information
window.sectionLayoutManager.getSections()

// Check for errors
window.enhancedErrorHandler?.getRecentErrors()

// Force save
window.enhancedComponentManager.manualSave()

// Enable debug mode
window.gmkbData.debugMode = true
```

---

## 🐛 Common Issues & Fixes

### Issue: Component Library Stuck Loading
```javascript
// Force refresh components
window.componentDiscovery.forceRefresh();
```

### Issue: Controls Not Appearing
```javascript
// Reinitialize controls
window.componentControlsManager?.initialize();
```

### Issue: Save Not Working
```javascript
// Check save pipeline
console.log('Can Save:', window.enhancedComponentManager?.canSave());
console.log('Post ID:', window.gmkbData?.postId);
```

### Issue: Theme Not Applying
```javascript
// Force theme refresh
window.themeManager?.applyTheme(window.themeManager.currentTheme);
```

---

## ✅ Testing Checklist

### Phase 1: Basic Functionality
- [ ] Builder loads without errors
- [ ] Component library opens and displays components
- [ ] Can add components to preview
- [ ] Component controls appear on hover
- [ ] Edit panel opens and updates work
- [ ] Save persists data across refresh

### Phase 2: Advanced Features
- [ ] Sections can be created
- [ ] Components can be dragged between sections
- [ ] Themes switch properly
- [ ] Auto-save works (check after 30 seconds)
- [ ] Responsive preview works
- [ ] Undo/Redo functions (if buttons visible)

### Phase 3: Data Integration
- [ ] Pods data loads in components (for existing posts)
- [ ] Topics component loads guest topics
- [ ] Biography shows guest bio
- [ ] Contact info displays correctly

### Phase 4: Frontend Display
- [ ] View guest post on frontend
- [ ] Media kit displays if saved
- [ ] Components render with correct data
- [ ] Theme styles apply

---

## 📝 Bug Reporting

When reporting issues, include:

1. **Browser Console Output**:
   ```javascript
   // Copy all of this:
   console.log({
       url: window.location.href,
       postId: window.gmkbData?.postId,
       components: window.enhancedStateManager?.getState()?.components?.length,
       errors: window.enhancedErrorHandler?.getRecentErrors(),
       browser: navigator.userAgent
   });
   ```

2. **Steps to Reproduce**
3. **Expected vs Actual Behavior**
4. **Screenshots if applicable**

---

## 🎯 Priority Test Flow (5 minutes)

1. **Load Builder** → No console errors
2. **Add Component** → Opens library, adds instantly
3. **Edit Component** → Panel works, changes save
4. **Save** → Success message
5. **Refresh** → Everything reloads
6. **Switch Theme** → Styles change
7. **View Frontend** → Media kit displays

If all pass, core functionality is working!

---

## 📚 Additional Resources

- **Archived Tests**: `/ARCHIVE/test-files/` contains 100+ test scripts
- **Documentation**: `/docs/` folder for detailed documentation
- **Debug Tools**: `/debug/` folder for diagnostic utilities

## Support

For issues or questions:
1. Check browser console for errors
2. Run diagnostic commands above
3. Review common issues section
4. Report with full bug report template
