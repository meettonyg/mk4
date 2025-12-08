# Quick Reference: What Changed & How to Test

## âœ… FILES MODIFIED (This Session)

### 1. `src/stores/mediaKit.js`
**Changes**:
- Event-driven initialization (no more polling)
- Fixed history index drift bug
- Removed duplicate `hasUnsavedChanges` property
- Component ID normalization (strings only)
- Performance: Removed unnecessary deep cloning
- Performance: Shallow clone with Object.assign()

**How to Test**:
```javascript
// In browser console:
GMKB.stores.mediaKit.checkForOrphanedComponents()
// Should show 0 orphaned with consistent IDs

// Test undo/redo
GMKB.stores.mediaKit.addComponent({ type: 'hero' });
GMKB.stores.mediaKit.undo();
GMKB.stores.mediaKit.redo();
// Should work smoothly without lag
```

---

### 2. `src/services/APIService.js`
**Changes**:
- Added 30-second timeout to all API calls
- Proper AbortController usage
- Clear timeout error messages

**How to Test**:
```javascript
// Throttle network to "Slow 3G" in DevTools
// Try loading - should timeout after 30s with clear message

// Or force timeout:
GMKB.services.api.load().catch(err => console.log(err.message));
// Should say "Request timeout after 30 seconds" if network is slow
```

---

### 3. `src/main.js`
**Changes**:
- Added Vue global error handler
- Consolidated namespace into `window.GMKB`
- Removed 15+ individual window assignments
- Removed ~200 lines of commented code

**How to Test**:
```javascript
// In browser console, type:
GMKB

// Should see organized object:
// {
//   version: '4.0.0-pure-vue',
//   app: {...},
//   stores: { mediaKit, theme, ui, pinia },
//   services: { api, security, undoRedo, keyboard, performance, analytics, toast, console, pods }
// }

// Test error handler by forcing an error:
GMKB.app.$forceUpdate(); // Should log error gracefully, not crash
```

---

## ðŸš€ QUICK START TESTING

### Test 1: Verify No Console Errors
```bash
1. Open media kit builder
2. Open DevTools console (F12)
3. Should see only green âœ… checkmarks, no red âŒ errors
4. Look for:
   - âœ… Store initialized
   - âœ… API Service ready
   - âœ… Theme initialized
   - âœ… Vue mounted successfully
```

### Test 2: Performance Check
```bash
1. Add 20 components rapidly
2. Drag components around
3. Should be smooth 60fps, no lag
4. Check DevTools Performance tab
5. No long tasks >50ms
```

### Test 3: Namespace Check
```javascript
// All these should work:
GMKB.stores.mediaKit.addComponent({ type: 'hero' });
GMKB.services.api.save(GMKB.stores.mediaKit.$state);
GMKB.services.toast.show('Test', 'success');

// Legacy aliases still work (deprecated):
window.gmkbStore.addComponent({ type: 'hero' });
window.gmkbAPI.save(window.gmkbStore.$state);
```

### Test 4: Timeout Handling
```bash
1. Open DevTools Network tab
2. Set throttle to "Slow 3G"
3. Try to save
4. Should see retry attempts
5. After 30 seconds, should timeout gracefully
6. User sees clear error message
```

---

## 🔍 DEBUGGING HELPERS

### Check System Status
```javascript
// See everything at a glance
console.table({
  'Store Initialized': GMKB.stores.mediaKit.isInitialized,
  'Components': GMKB.stores.mediaKit.componentCount,
  'Sections': GMKB.stores.mediaKit.sectionCount,
  'Is Dirty': GMKB.stores.mediaKit.isDirty,
  'API Cache': GMKB.services.api.getCacheStatus().total + ' entries'
});
```

### Check for Orphans
```javascript
const report = GMKB.stores.mediaKit.checkForOrphanedComponents();
console.log(`Orphans: ${report.orphaned}/${report.total}`);

if (report.orphaned > 0) {
  GMKB.stores.mediaKit.fixOrphanedComponents();
}
```

### Check Performance
```javascript
const perf = performance.getEntriesByType('measure');
console.table(perf.map(p => ({
  name: p.name,
  duration: Math.round(p.duration) + 'ms'
})));
```

---

## â›"ï¸ WHAT NOT TO DO

### DON'T:
âŒ Directly modify `window.gmkbStore` or other globals  
âœ… Use: `GMKB.stores.mediaKit` instead

âŒ Call `deepClone()` on large objects  
âœ… Use: `Object.assign({}, obj)` for shallow clone

âŒ Set `setTimeout()` to wait for systems  
âœ… Use: Event listeners or Promise chains

âŒ Assign multiple things to window  
âœ… Use: `GMKB` namespace only

---

## ðŸ"§ ROLLBACK PROCEDURE

If issues arise:

```bash
# 1. Check git status
git status

# 2. See what changed
git diff

# 3. Revert specific file
git checkout HEAD -- src/main.js

# 4. Or revert all changes
git reset --hard HEAD

# 5. Rebuild
npm run build

# 6. Test
# Open browser, check console
```

---

## 📞 SUPPORT

**Console Errors?**
1. Check `GMKB` is defined
2. Check `GMKB.stores.mediaKit` exists
3. Check `GMKB.services.api` exists
4. Check browser console for initialization errors

**Performance Issues?**
1. Check bundle size: Should be <500KB
2. Check for memory leaks in DevTools
3. Profile with Performance tab
4. Check for O(n²) operations

**Save Failures?**
1. Check network tab for 403/500 errors
2. Check nonce is valid
3. Check post ID is correct
4. Try manual save: `GMKB.stores.mediaKit.save()`

---

**Version**: 2.0 (January 2025)  
**Status**: 11/25 fixes complete  
**Next**: P0 remaining issues
