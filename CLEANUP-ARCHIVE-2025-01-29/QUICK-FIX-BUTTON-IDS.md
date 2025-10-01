# 🔧 QUICK FIX - Theme & Save Button IDs

## Issue
After moving buttons to the new toolbar, the legacy code couldn't find them:
- `#global-theme-btn` not found
- `#save-btn` not found

## Solution ✅
Added the expected IDs to the buttons in `MediaKitToolbarComplete.vue`:

```vue
<!-- Theme button -->
<button 
  id="global-theme-btn"
  @click="handleTheme"
  ...
>

<!-- Save button -->
<button 
  id="save-btn"
  @click="handleSave"
  ...
>
```

## How It Works
1. ThemeSwitcher looks for clicks on `#global-theme-btn`
2. Our button now has that ID
3. ThemeSwitcher will catch the click and open the theme panel
4. Same for save button

## Testing
After rebuild (`npm run build`):
1. Click Theme button → Theme switcher should open
2. Click Save button → Should save media kit
3. No console warnings about missing buttons

## Status
✅ Fixed - Ready to rebuild and test

---

**Next step**: Run `npm run build` and test!
