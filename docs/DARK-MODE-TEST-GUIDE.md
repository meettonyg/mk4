# Quick Test Guide - Dark Mode Color Fix

## How to Test

1. **Open the Media Kit Builder**
   - Navigate to any media kit edit page
   - Look for the moon icon (🌙) in the toolbar

2. **Toggle Dark Mode**
   - Click the moon/sun icon in the top-right toolbar
   - Body should receive `.dark-mode` class

3. **Visual Verification**

### ✅ Toolbar (Top Bar)
- [ ] Background is deep slate blue `#0f172a` (not gray)
- [ ] Desktop/Tablet/Mobile buttons are clearly visible
- [ ] Inactive device buttons show `#cbd5e1` text
- [ ] Active device button shows cyan `#06b6d4` background
- [ ] Hover on device buttons shows subtle background

### ✅ Sidebar (Left Panel)
- [ ] Main background is deep slate `#0f172a`
- [ ] Tab bar (Components/Layout/Settings) is slate-800 `#1e293b`
- [ ] Active tab has slate-900 background with pink underline
- [ ] Search box has slate-800 background `#1e293b`
- [ ] Component cards have slate-800 background `#1e293b`
- [ ] Card borders are slate-700 `#334155`
- [ ] All borders throughout sidebar use consistent slate-700

### ✅ Main Content Area
- [ ] Background behind preview is slate-700 `#334155`
- [ ] This creates clear separation from sidebar

### ✅ Preview Area
- [ ] Background is slate-600 `#475569`
- [ ] Distinct from main content area
- [ ] Scrollbar track is slate-700 `#334155`
- [ ] Scrollbar thumb is slate-500 `#64748b`

## Color Consistency Check

Open DevTools and verify these color values:

```css
/* Should see these in dark mode */
.gmkb-toolbar--dark {
  background: #0f172a;     /* ✅ Slate-900 */
  border-bottom: #334155;   /* ✅ Slate-700 */
}

.gmkb-sidebar.dark-mode {
  background: #0f172a;      /* ✅ Slate-900 */
  border-right: #334155;    /* ✅ Slate-700 */
}

body.dark-mode #gmkb-main-content {
  background: #334155;      /* ✅ Slate-700 */
}

body.dark-mode #media-kit-preview {
  background: #475569;      /* ✅ Slate-600 */
}
```

## Common Issues

### Device Buttons Not Visible
**Symptom:** Can't see Desktop/Tablet/Mobile buttons in dark mode
**Fix:** Text color should be `#cbd5e1`, verify in DevTools

### Sidebar Stays White
**Symptom:** Sidebar doesn't change to dark
**Fix:** Check that `dark-mode` class is on `<body>` element

### Preview Area Same as Sidebar
**Symptom:** Can't distinguish preview from sidebar
**Fix:** Preview should be lighter (`#475569` vs `#0f172a`)

## Browser DevTools Check

1. Open DevTools (F12)
2. Click the moon icon to toggle dark mode
3. Inspect `<body>` element - should have `class="dark-mode"`
4. Check computed styles on:
   - `.gmkb-toolbar`
   - `.gmkb-sidebar`
   - `#gmkb-main-content`
   - `#media-kit-preview`

## Screenshot Comparison

### Before (Gray Palette)
- Toolbar: `#111827` (pure gray, no blue)
- Sidebar: `#1f2937` (flat gray)
- Borders: `#374151` (gray borders)

### After (Slate Palette)
- Toolbar: `#0f172a` (blue-tinted dark)
- Sidebar: `#1e293b` (slate secondary)
- Borders: `#334155` (slate borders)

## Success Criteria

✅ All dark mode colors have blue undertone (slate palette)
✅ Device selector buttons clearly visible
✅ Visual hierarchy maintained (preview ≠ sidebar ≠ main)
✅ Consistent border colors throughout
✅ Smooth transitions when toggling dark mode

## If Something's Wrong

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+F5)
3. **Check console** for JavaScript errors
4. **Verify files** were actually updated on server

## Files to Verify on Server

```
src/vue/components/MediaKitToolbarComplete.vue
src/vue/components/sidebar/SidebarTabs.vue
templates/builder-template-vue-pure.php
```

## Expected Behavior

**Light Mode:**
- Clean white sidebar
- Light gray preview area
- Professional appearance

**Dark Mode:**
- Deep slate navy everywhere
- Blue undertones (not pure gray)
- Clear visual separation between zones
- All text readable with proper contrast

---

**Last Updated:** Current Session
**Status:** ✅ All fixes implemented
**Test Result:** Ready for validation
