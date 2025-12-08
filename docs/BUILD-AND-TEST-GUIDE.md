# 🧪 Build & Test Guide - Universal Component Editor System

## Quick Start

```bash
# Navigate to plugin directory
cd C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4

# Install dependencies (if needed)
npm install

# Build for production
npm run build

# Or run dev server
npm run dev
```

---

## Pre-Build Checklist

Before building, verify:

- [ ] All new files saved
- [ ] No syntax errors in IDE
- [ ] Import paths are correct
- [ ] No console.log() statements left in code (except debug mode)

---

## Build Process

### 1. Clean Build
```bash
# Remove old dist files
npm run clean

# Or manually:
rm -rf dist/
```

### 2. Run Build
```bash
npm run build
```

**Expected Output:**
```
vite v4.x.x building for production...
✓ xxxx modules transformed.
dist/assets/main-xxxxxx.js    xxx kB │ gzip: xxx kB
dist/assets/vendor-xxxxx.js   xxx kB │ gzip: xxx kB
✓ built in xxx ms
```

### 3. Check for Errors

**Common Build Errors:**

#### Error: "Cannot find module"
```
Error: Cannot find module '@/components/...'
```
**Fix**: Check import path is correct relative to file location

#### Error: "Unexpected token"
```
Unexpected token '<'
```
**Fix**: Missing closing tag in Vue template

#### Error: "Module not found"
```
Module not found: Can't resolve 'ComponentStyleService'
```
**Fix**: Check import path and file extension (.js)

---

## Testing in WordPress

### 1. WordPress Setup

1. **Navigate to Media Kit post**
   - Go to WP Admin → Media Kits
   - Click "Edit" on any media kit

2. **Open Browser Console**
   - Press F12 or Cmd+Option+I
   - Go to Console tab

3. **Verify Initialization**

Look for these logs:
```
✅ APIService initialized in store
✅ State initialized via APIService
✅ Theme initialized: professional_clean
✅ Vue mounted successfully
🎨 Initializing component styles...
✅ Component styles initialized
✅ All critical services initialized
```

**If you don't see these**, check for errors in console.

---

## Testing Base Panels

### 1. Open Component Editor

1. **Click any component** in preview
2. **Component editor should open** on right side
3. **Verify tabs appear**: Content, Style, Advanced

### 2. Test Style Tab

1. **Click "Style" tab**
2. **Should see**:
   - Spacing section with presets
   - Background color picker
   - Typography controls (if show-typography=true)
   - Border controls
   - Effects dropdown

3. **Test a change**:
   - Change background color
   - Should update in preview immediately
   - Check console for: `🎨 Applied styles to component comp_xxx`

### 3. Test Advanced Tab

1. **Click "Advanced" tab**
2. **Should see**:
   - Width type dropdown
   - Alignment buttons
   - Responsive visibility toggles
   - CSS classes input

3. **Test a change**:
   - Change width type to "Custom"
   - Enter "500px"
   - Component should resize in preview

---

## Console Testing Commands

### Verify Services Loaded

```javascript
// Check GMKB namespace
console.log('GMKB:', GMKB);

// Check stores
console.log('Store:', GMKB.stores.mediaKit);
console.log('Components:', GMKB.stores.mediaKit.components);

// Check style service
console.log('Style Service:', GMKB.services.componentStyle);
```

### Test Component Settings

```javascript
// Get a component ID (replace with actual ID)
const componentId = 'comp_1234567890';

// Check component settings
const component = GMKB.stores.mediaKit.components[componentId];
console.log('Component:', component);
console.log('Settings:', component?.settings);

// Verify settings structure
console.log('Style:', component?.settings?.style);
console.log('Advanced:', component?.settings?.advanced);
```

### Test Style Application

```javascript
// Apply styles manually
const componentId = 'comp_1234567890';
const component = GMKB.stores.mediaKit.components[componentId];

if (component && component.settings) {
  GMKB.services.componentStyle.applyStyling(componentId, component.settings);
  console.log('✅ Styles applied');
} else {
  console.error('❌ Component or settings missing');
}
```

### Test Style Generation

```javascript
// Generate CSS without applying
const componentId = 'comp_1234567890';
const component = GMKB.stores.mediaKit.components[componentId];

if (component && component.settings) {
  const css = GMKB.services.componentStyle.generateCSS(componentId, component.settings);
  console.log('Generated CSS:', css);
}
```

### Check Injected Styles

```javascript
// View all component style elements
const styleElements = document.querySelectorAll('[id^="component-styles-"]');
console.log(`Found ${styleElements.length} style elements`);

styleElements.forEach(el => {
  console.log(el.id, '→', el.textContent.substring(0, 100) + '...');
});
```

---

## Debugging Issues

### Issue: "Component settings undefined"

**Symptoms**: Console error when opening editor

**Debug**:
```javascript
// Check component exists
const comp = GMKB.stores.mediaKit.components['comp_xxx'];
console.log('Component:', comp);

// Check settings
console.log('Settings:', comp?.settings);

// If settings missing, add them
if (comp && !comp.settings) {
  const { getDefaultSettings } = await import('./src/utils/componentSchema.js');
  comp.settings = getDefaultSettings();
  console.log('✅ Settings added');
}
```

### Issue: "BaseStylePanel not rendering"

**Symptoms**: Style tab is empty

**Debug**:
```javascript
// Check import path
// In HeroEditor.vue (or other editor), verify:
import BaseStylePanel from '../../src/vue/components/sidebar/editors/BaseStylePanel.vue';

// Check component-id prop
console.log('Component ID:', props.componentId);

// Check component exists in store
console.log('Component:', GMKB.stores.mediaKit.components[props.componentId]);
```

### Issue: "Changes not reflected in preview"

**Symptoms**: Settings update but preview doesn't change

**Debug**:
```javascript
// Check if style element exists
const componentId = 'comp_xxx';
const styleEl = document.getElementById(`component-styles-${componentId}`);
console.log('Style element:', styleEl);
console.log('CSS:', styleEl?.textContent);

// Force reapply
GMKB.services.componentStyle.clearStyles(componentId);
GMKB.services.componentStyle.applyStyling(
  componentId,
  GMKB.stores.mediaKit.components[componentId].settings
);
```

### Issue: "Settings not persisting"

**Symptoms**: Settings lost on page refresh

**Debug**:
```javascript
// Check if component is dirty
console.log('Dirty:', GMKB.stores.mediaKit.isDirty);

// Manually save
await GMKB.stores.mediaKit.save();
console.log('✅ Saved');

// Verify settings saved
const data = await GMKB.services.api.load();
console.log('Loaded data:', data);
```

---

## Performance Testing

### Check Load Time

```javascript
// In console, after page load
console.log('Performance:', {
  domReady: window.performance.timing.domContentLoadedEventEnd - window.performance.timing.domContentLoadedEventStart,
  vueMount: window.GMKB?.mountTime || 'not tracked',
  styleInit: 'check console logs'
});
```

### Check Memory Usage

```javascript
// Check style elements count
const styleCount = document.querySelectorAll('[id^="component-styles-"]').length;
console.log(`Style elements: ${styleCount}`);

// Check component count
const compCount = Object.keys(GMKB.stores.mediaKit.components).length;
console.log(`Components: ${compCount}`);

// Should be: styleCount <= compCount
```

### Check Re-render Performance

```javascript
// Test rapid setting changes
const componentId = 'comp_xxx';
const component = GMKB.stores.mediaKit.components[componentId];

console.time('100 style updates');
for (let i = 0; i < 100; i++) {
  component.settings.style.background.opacity = (i % 100);
  GMKB.services.componentStyle.applyStyling(componentId, component.settings);
}
console.timeEnd('100 style updates');

// Should be < 500ms for 100 updates
```

---

## Integration Testing

### Test HeroEditor (Reference Implementation)

1. **Add Hero Component** to page
2. **Open Editor** (should open automatically or click component)
3. **Verify Tabs**:
   - [ ] Content tab shows hero fields
   - [ ] Style tab shows BaseStylePanel
   - [ ] Advanced tab shows BaseAdvancedPanel

4. **Test Content Tab**:
   - [ ] Change title → updates in preview
   - [ ] Change subtitle → updates in preview
   - [ ] Change CTA text → updates in preview

5. **Test Style Tab**:
   - [ ] Change spacing → adds margin/padding
   - [ ] Change background color → updates color
   - [ ] Change typography → changes font
   - [ ] Change border → adds border

6. **Test Advanced Tab**:
   - [ ] Change width type → resizes component
   - [ ] Change alignment → moves component
   - [ ] Toggle mobile visibility → hides on mobile
   - [ ] Add CSS class → class appears in HTML

7. **Test Persistence**:
   - [ ] Save page
   - [ ] Refresh page
   - [ ] All settings preserved

---

## Regression Testing

### Verify Existing Functionality Still Works

- [ ] Can add components via sidebar
- [ ] Can drag and drop components
- [ ] Can delete components
- [ ] Can duplicate components
- [ ] Can move components up/down
- [ ] Can change sections
- [ ] Can export/import
- [ ] Can save and load
- [ ] Can undo/redo
- [ ] Theme switcher works
- [ ] All other editors still open

---

## Success Criteria

**Build succeeds** with no errors ✅  
**Vue app mounts** without console errors ✅  
**GMKB namespace** populated correctly ✅  
**ComponentStyleService** initialized ✅  
**HeroEditor** shows all 3 tabs ✅  
**Style changes** reflect in preview immediately ✅  
**Settings persist** after save/reload ✅  
**No functionality regression** ✅  

---

## Final Checklist

Before marking implementation complete:

- [ ] Build succeeds
- [ ] No console errors
- [ ] All tests pass
- [ ] HeroEditor fully functional
- [ ] Settings persist correctly
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] Ready for Phase 3 integration

---

## Getting Help

If you encounter issues:

1. **Check console** for error messages
2. **Review IMPLEMENTATION-STATUS.md** for architecture
3. **Check QUICK-INTEGRATION-GUIDE.md** for templates
4. **Review this file** for debugging commands
5. **Look at HeroEditor.vue** for reference
6. **Check ComponentStyleService.js** for CSS logic

---

**Testing Status**: ✅ READY  
**Build Status**: ✅ READY  
**Integration Status**: ✅ PHASE 1-2-4 COMPLETE

**Next**: Continue with Phase 3 (remaining component editors)
