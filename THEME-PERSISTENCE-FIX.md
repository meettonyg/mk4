# Theme Persistence Fix

## 🎯 **ROOT CAUSE IDENTIFIED**

From the console logs, we can see:
```
✅ Theme applied: professional_clean  (initial load - correct)
✅ Theme applied: undefined  (after selection - WRONG!)
```

The theme is being set to `undefined` when you select a new theme and save.

## 🔍 **THE PROBLEM**

**File**: `src/stores/theme.js`  
**Line**: ~494 (selectTheme method)

```javascript
// Select a theme
selectTheme(themeId) {
  const theme = this.allThemes.find(t => t.id === themeId);
  if (theme) {
    this.activeThemeId = themeId;
    this.tempCustomizations = {
      colors: {},
      typography: {},
      spacing: {},
      effects: {}
    };
    this.hasUnsavedChanges = true;  // ❌ PROBLEM: Only sets theme store flag
    this.applyThemeToDOM();         // ❌ PROBLEM: Doesn't update media kit store
  }
},
```

**What's missing**:
1. Doesn't call `applyCustomizations()` to update media kit store
2. Doesn't trigger `mediaKitStore._trackChange()` to mark for save

---

## ✅ **THE FIX**

Replace the `selectTheme` method with this:

```javascript
// Select a theme
selectTheme(themeId) {
  const theme = this.allThemes.find(t => t.id === themeId);
  if (theme) {
    this.activeThemeId = themeId;
    this.tempCustomizations = {
      colors: {},
      typography: {},
      spacing: {},
      effects: {}
    };
    this.hasUnsavedChanges = true;
    this.applyThemeToDOM();
    
    // FIX: Update media kit store immediately
    const mediaKitStore = useMediaKitStore();
    mediaKitStore.theme = themeId;
    mediaKitStore._trackChange();  // Mark for save and trigger auto-save
    
    console.log('[Theme Store] Theme selected and saved to media kit store:', themeId);
  }
},
```

---

## 📝 **HOW TO APPLY**

1. Open `src/stores/theme.js` in your editor
2. Find the `selectTheme` method (around line 494)
3. Add these three lines after `this.applyThemeToDOM()`:
   ```javascript
   // FIX: Update media kit store immediately
   const mediaKitStore = useMediaKitStore();
   mediaKitStore.theme = themeId;
   mediaKitStore._trackChange();
   
   console.log('[Theme Store] Theme selected and saved to media kit store:', themeId);
   ```

4. Save the file
5. Run `npm run build`
6. Hard refresh browser

---

## 🧪 **VERIFICATION**

After the fix, when you select a theme, console should show:
```
[Theme Store] Theme selected and saved to media kit store: creative_bold
✅ Theme applied: creative_bold
✅ Saved successfully
```

And when you refresh the page:
```
[Theme Store] Set active theme: creative_bold
✅ Theme applied: creative_bold
```

---

## 🎓 **WHY THIS HAPPENS**

The theme system has **two separate stores**:
1. **Theme Store** - Manages UI state (which theme is active, customizations)
2. **Media Kit Store** - Manages persisted data (what gets saved to WordPress)

When `selectTheme` only updates the Theme Store, the Media Kit Store doesn't know about the change, so when you save, it saves the old theme (or undefined).

The fix ensures **both stores are synchronized** when a theme is selected.

---

## ✅ **FILES TO MODIFY**

- `src/stores/theme.js` - line ~494 (selectTheme method)

After this fix, theme selection will persist correctly!
