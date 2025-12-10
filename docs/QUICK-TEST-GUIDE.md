# ðŸš€ Quick Test Guide - Media Kit Builder v4.0

**Last Updated**: January 2025  
**Status**: 14/25 fixes complete, production-ready

---

## âš¡ 5-MINUTE SMOKE TEST

### 1. Load Test (30 seconds)
```bash
1. Open media kit builder URL
2. Open DevTools Console (F12)
3. Look for green checkmarks:
   ✅ Store initialized
   ✅ API Service ready  
   ✅ Theme initialized
   ✅ Vue mounted successfully
4. Check for ZERO red errors
```

**Expected**: Page loads in <2s with no errors

---

### 2. Basic Operations (2 minutes)
```bash
1. Click "Add Component" button
2. Select "Hero" component
3. Component should appear immediately
4. Try dragging component (should be smooth)
5. Click Save button
6. Should see "Saved successfully" toast
```

**Expected**: All operations smooth, no lag

---

### 3. Console Check (1 minute)
```javascript
// Type in console:
GMKB

// Should see organized object:
{
  version: "4.0.0-pure-vue",
  architecture: "pure-vue",
  stores: {...},
  services: {...}
}

// Check stats:
GMKB.stores.mediaKit.componentCount  // Should match UI
GMKB.stores.mediaKit.isDirty         // false after save
```

**Expected**: Clean namespace, accurate state

---

### 4. Performance Check (1 minute)
```bash
1. Add 10 components rapidly
2. Drag them around
3. Should be smooth 60fps
4. Check DevTools Performance tab
5. No long tasks >50ms
```

**Expected**: No jank, smooth interactions

---

### 5. Error Handling (30 seconds)
```bash
1. DevTools Network tab
2. Set throttle to "Slow 3G"
3. Try to save
4. Should see retry attempts
5. Clear message after timeout
```

**Expected**: Graceful failure, clear messages

---

## 🔍 DETAILED TESTING (30 minutes)

### Test 1: Component Operations (5 min)
```
âœ… Add component from library
âœ… Edit component data
âœ… Duplicate component
âœ… Move component up/down
âœ… Delete component
âœ… Undo delete (Ctrl+Z)
âœ… Redo (Ctrl+Y)
```

**Pass Criteria**: All operations work, no errors

---

### Test 2: Section Management (5 min)
```
âœ… Add full-width section
âœ… Add two-column section
âœ… Add three-column section
âœ… Move components between sections
âœ… Delete section (components removed)
âœ… Section settings work
```

**Pass Criteria**: Sections behave correctly

---

### Test 3: Theme Switching (3 min)
```
âœ… Open theme selector
âœ… Switch to "Creative Bold"
âœ… Colors update immediately
âœ… Switch to "Minimal Elegant"
âœ… Typography changes
âœ… Custom theme loads (if available)
```

**Pass Criteria**: Themes apply instantly

---

### Test 4: Save/Load (5 min)
```
âœ… Make changes
âœ… Click Save
âœ… See success message
âœ… Reload page (Ctrl+R)
âœ… All changes persisted
âœ… Check browser console (no errors)
```

**Pass Criteria**: Data persists correctly

---

### Test 5: Performance (5 min)
```
âœ… Add 20 components
âœ… Drag components (smooth?)
âœ… Undo/redo operations (fast?)
âœ… Switch themes (instant?)
âœ… Save large state (<2s?)
âœ… Memory stable (check DevTools)
```

**Pass Criteria**: 
- Operations <100ms
- No memory leaks
- Smooth animations

---

### Test 6: Error Recovery (3 min)
```
âœ… Set network to "Offline"
âœ… Try to save
âœ… See error message
âœ… Go back "Online"
âœ… Save succeeds
âœ… Check localStorage backup exists
```

**Pass Criteria**: Graceful error handling

---

### Test 7: Browser Compatibility (4 min)
```
âœ… Chrome (should work)
âœ… Firefox (test)
âœ… Safari (test if available)
âœ… Edge (test if available)
```

**Pass Criteria**: Works in all modern browsers

---

## ðŸ§ª REGRESSION TESTS

### Load Existing Media Kits
```bash
1. Open media kit with ID: [your test ID]
2. Should load all components
3. Pods data should populate
4. Theme should match saved
5. No console errors
```

---

### Pods Data Integration
```bash
1. Check if Pods fields populate:
   - Biography text
   - Topics (1-5)
   - Questions (1-10)
   - Contact info
2. Data should appear in components
3. Console: Check GMKB.services.pods
```

---

### Import/Export
```bash
1. Export current media kit
2. Get JSON file
3. Clear all components
4. Import JSON file
5. Everything restored
```

---

## ⚠️ KNOWN ISSUES TO WATCH

### Not Yet Fixed (P1/P2)
1. EventBus still present (to be removed)
2. Bundle size not optimized (<500KB target)
3. Some legacy templates still exist (archived)

### These Are Expected
- Custom themes may not load (non-fatal)
- Some console warnings in dev mode (normal)
- First load slower than subsequent (caching)

---

## 🐛 BUG REPORT TEMPLATE

If you find issues:

```markdown
**Bug Title**: Clear description

**Steps to Reproduce**:
1. Step one
2. Step two
3. Step three

**Expected Behavior**:
What should happen

**Actual Behavior**:
What actually happens

**Console Errors**:
Paste console.log output

**Browser Info**:
- Browser: Chrome 120
- OS: Windows 11
- Date/Time: 2025-01-20 14:30

**Screenshots**:
Attach if helpful

**GMKB State**:
```javascript
// Run in console:
JSON.stringify({
  version: GMKB.version,
  componentCount: GMKB.stores.mediaKit.componentCount,
  sectionCount: GMKB.stores.mediaKit.sectionCount,
  isDirty: GMKB.stores.mediaKit.isDirty
}, null, 2)
```
```

---

## âœ… ACCEPTANCE CRITERIA

### Must Pass (Blocking)
- [ ] No console errors on load
- [ ] Can add/edit/delete components
- [ ] Can save and reload
- [ ] Undo/redo works
- [ ] Performance acceptable (<100ms operations)

### Should Pass (Important)
- [ ] All themes work
- [ ] Pods data populates
- [ ] Import/export works
- [ ] Mobile responsive
- [ ] Cross-browser compatible

### Nice to Have (Future)
- [ ] Bundle size <500KB
- [ ] Lighthouse score >90
- [ ] Offline mode works
- [ ] PWA features

---

## 📊 PERFORMANCE BENCHMARKS

### Load Performance
```
Target: Page load <2s
Measure: window.performance.timing
```

### Operation Performance
```
Target: All operations <100ms
Measure: Chrome DevTools Performance tab
```

### Memory Usage
```
Target: <100MB after 20 operations
Measure: Chrome DevTools Memory profiler
```

### Bundle Size
```
Target: <500KB gzipped
Measure: npm run build, check dist/gmkb.iife.js.gz
```

---

## 🔧 DEBUG COMMANDS

### Check System Health
```javascript
console.table({
  'Initialized': GMKB.stores.mediaKit.isInitialized,
  'Components': GMKB.stores.mediaKit.componentCount,
  'Sections': GMKB.stores.mediaKit.sectionCount,
  'Dirty': GMKB.stores.mediaKit.isDirty,
  'Theme': GMKB.stores.theme.activeThemeId,
  'API Cache': GMKB.services.api.getCacheStatus().total
});
```

### Force Save
```javascript
GMKB.stores.mediaKit.save()
  .then(() => console.log('✅ Saved'))
  .catch(err => console.error('❌ Failed:', err));
```

### Check for Orphans
```javascript
const report = GMKB.stores.mediaKit.checkForOrphanedComponents();
console.log(`Orphans: ${report.orphaned}/${report.total}`);
if (report.orphaned > 0) {
  GMKB.stores.mediaKit.fixOrphanedComponents();
}
```

### Clear Cache
```javascript
GMKB.services.api.clearCache();
console.log('✅ Cache cleared');
```

### Trigger Undo/Redo
```javascript
GMKB.stores.mediaKit.undo();  // Undo
GMKB.stores.mediaKit.redo();  // Redo
```

---

## 📞 SUPPORT

**Issues?** Check:
1. Browser console for errors
2. Network tab for failed requests
3. `GMKB` object in console
4. This testing guide

**Still Stuck?**
- Review `CRITICAL-ISSUES-FIXED.md`
- Check `FIXES-IMPLEMENTATION-COMPLETE.md`
- See git commit history for details

---

**Happy Testing!** 🎉

Remember: All P0 critical fixes are complete. The system is production-ready with monitoring.
