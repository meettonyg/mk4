# INCLUDES CLEANUP CHECKLIST

**Use this checklist to track your progress through the cleanup process.**

---

## ✅ PHASE 1: ENQUEUE FILE CONSOLIDATION (30 minutes)

### Pre-Flight Checks
- [ ] Read executive summary
- [ ] Read full audit report  
- [ ] Backup created: `cp -r includes includes-backup-$(date +%Y%m%d)`
- [ ] Git commit of current state (if using git)

### Execution
- [ ] Create archive directory: `mkdir -p ARCHIVE/enqueue-consolidation`
- [ ] Archive `enqueue.php`: `mv includes/enqueue.php ARCHIVE/enqueue-consolidation/`
- [ ] Archive `enqueue-separated.php`: `mv includes/enqueue-separated.php ARCHIVE/enqueue-consolidation/`
- [ ] Promote Vue version: `mv includes/enqueue-vue-only.php includes/enqueue.php`

### Testing (CRITICAL - Don't skip!)
- [ ] Clear browser cache completely
- [ ] Load media kit builder page
- [ ] Open browser console (F12)
- [ ] Verify `window.gmkbData` exists
  ```javascript
  console.log(window.gmkbData); // Should show object with postId, restUrl, etc.
  ```
- [ ] Verify Vue app mounted
  ```javascript
  console.log(window.gmkbApp); // Should show Vue app instance
  ```
- [ ] Check for JavaScript errors (should be none)
- [ ] Test adding a component
- [ ] Test saving media kit
- [ ] Test theme switching
- [ ] Check network tab - should see ~5-8 scripts (not 60+)

### Verification
- [ ] Page loads faster than before
- [ ] No console errors
- [ ] All functionality works
- [ ] Script count reduced significantly

### Documentation
- [ ] Update CHANGELOG.md with changes
- [ ] Note any issues encountered
- [ ] Performance improvement measured: ______%

### If Problems Occur
- [ ] Check browser console for specific errors
- [ ] Verify `gmkbData` object structure matches Vue expectations
- [ ] Check Network tab for failed requests
- [ ] If all else fails: `cp -r includes-backup includes` (restore backup)

**Phase 1 Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Rolled Back

---

## ✅ PHASE 2: REMOVE LEGACY INITIALIZATION (1-2 hours)

### Pre-Flight Checks
- [ ] Phase 1 complete and tested
- [ ] Fresh backup: `cp -r includes includes-backup-phase2-$(date +%Y%m%d)`
- [ ] Git commit if using version control

### Execution
- [ ] Create archive: `mkdir -p ARCHIVE/legacy-init`
- [ ] Archive `enhanced-init.php`: `mv includes/enhanced-init.php ARCHIVE/legacy-init/`
- [ ] Archive `client-only-integration.php`: `mv includes/client-only-integration.php ARCHIVE/legacy-init/`
- [ ] Archive `architecture-config.php`: `mv includes/architecture-config.php ARCHIVE/legacy-init/`
- [ ] Check main plugin file doesn't require these files
  ```bash
  grep -n "enhanced-init\|client-only\|architecture-config" guestify-media-kit-builder.php
  ```
- [ ] If found, comment out the require statements

### Testing
- [ ] Load media kit builder
- [ ] Check console for errors
- [ ] Test full workflow: add component → edit → save
- [ ] Test with browser refresh (state persistence)
- [ ] Check for any PHP warnings in debug.log

### Verification
- [ ] No errors in console
- [ ] No PHP warnings/errors
- [ ] Functionality identical to Phase 1
- [ ] Code is 800 lines lighter

**Phase 2 Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Rolled Back

---

## ✅ PHASE 3: REMOVE PHP RENDERING SYSTEM (15 minutes)

### Pre-Flight Checks
- [ ] Phase 2 complete
- [ ] Backup if desired (or rely on previous backups)

### Execution
- [ ] Check if `includes/rendering/` folder exists
  ```bash
  ls -la includes/rendering/ 2>/dev/null || echo "Folder doesn't exist"
  ```
- [ ] If exists, archive it: `mv includes/rendering ARCHIVE/php-rendering/`
- [ ] Search for any requires of rendering files
  ```bash
  grep -r "includes/rendering" . --include="*.php"
  ```
- [ ] Comment out any found requires

### Testing
- [ ] Load media kit builder
- [ ] Verify all components render (Vue handles this)
- [ ] Test component editing
- [ ] Check that saved media kits load correctly

### Verification
- [ ] No "file not found" errors
- [ ] Components render properly
- [ ] Vue is handling all rendering

**Phase 3 Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Rolled Back

---

## ✅ PHASE 4: ORGANIZE ADMIN FILES (30 minutes)

### Execution
- [ ] Create admin folder: `mkdir -p includes/admin`
- [ ] Move admin init: `mv includes/admin-init.php includes/admin/` (keep reference)
- [ ] Create diagnostics file: `touch includes/admin/diagnostics.php`
- [ ] Move diagnostic files to new file:
  - [ ] `gmkb-admin-diagnostic.php` → consolidate into diagnostics.php
  - [ ] `gmkb-database-inspector.php` → consolidate into diagnostics.php
- [ ] Update any requires that point to moved files
- [ ] Move `admin-media-kit-viewer.php` to `includes/admin/`

### Testing
- [ ] Access WordPress admin
- [ ] Check media kit admin pages load
- [ ] Test any diagnostic tools still work

**Phase 4 Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

---

## ✅ PHASE 5: AJAX HANDLER CONSOLIDATION (2-4 hours)

### Discovery Phase
- [ ] List all AJAX endpoints currently in use:
  ```bash
  grep -r "wp_ajax_" includes/ --include="*.php" | grep "add_action"
  ```
- [ ] Check which are actually called from JavaScript:
  ```bash
  grep -r "ajaxurl\|ajaxUrl" js/ src/ --include="*.js"
  ```
- [ ] Create migration plan for each:
  - [ ] Endpoint 1: _____________ → [ ] Keep [ ] Migrate to REST [ ] Delete
  - [ ] Endpoint 2: _____________ → [ ] Keep [ ] Migrate to REST [ ] Delete
  - [ ] Endpoint 3: _____________ → [ ] Keep [ ] Migrate to REST [ ] Delete
  - [ ] (Add more as needed)

### Consolidation Phase
- [ ] Create new file: `includes/legacy-ajax-handlers.php`
- [ ] Copy ONLY actively-used handlers to new file
- [ ] Add deprecation notices to each handler
- [ ] Archive old AJAX files:
  ```bash
  mkdir -p ARCHIVE/ajax-consolidation
  mv includes/enhanced-ajax.php ARCHIVE/ajax-consolidation/
  mv includes/ajax-section-handlers.php ARCHIVE/ajax-consolidation/
  mv includes/gmkb-ajax-handlers.php ARCHIVE/ajax-consolidation/
  mv includes/theme-ajax-handlers.php ARCHIVE/ajax-consolidation/
  mv includes/theme-customizer-ajax.php ARCHIVE/ajax-consolidation/
  ```
- [ ] Update main plugin file to require new consolidated file

### Testing
- [ ] Test each AJAX endpoint that was kept
- [ ] Verify deprecated endpoints still work (for backwards compatibility)
- [ ] Check for any JavaScript errors
- [ ] Test features that use AJAX: themes, sections, version history

### Migration Phase (Optional but Recommended)
- [ ] For each kept AJAX handler, create REST endpoint equivalent
- [ ] Update JavaScript to use REST endpoint
- [ ] Test new REST endpoint
- [ ] Remove AJAX handler once REST is working
- [ ] Repeat for each handler

**Phase 5 Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

---

## ✅ PHASE 6: EVALUATE OPTIONAL FOLDERS

### Marketplace Folder
- [ ] Check if marketplace feature is in use
- [ ] If NO: `mv includes/marketplace ARCHIVE/future-features/`
- [ ] If YES: Keep and document

### Fixes Folder
- [ ] List all files in fixes/:
  ```bash
  ls -la includes/fixes/
  ```
- [ ] For each fix:
  - [ ] Fix 1: _____________ → [ ] Integrated [ ] Still needed [ ] Archive
  - [ ] Fix 2: _____________ → [ ] Integrated [ ] Still needed [ ] Archive
  - [ ] Fix 3: _____________ → [ ] Integrated [ ] Still needed [ ] Archive
- [ ] Archive outdated fixes: `mv includes/fixes ARCHIVE/old-fixes/`
- [ ] Move active fixes to main includes/

**Phase 6 Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

---

## ✅ PHASE 7: FINAL VERIFICATION

### File Structure Check
Expected structure after cleanup:
```
includes/
├─ admin/
│  ├─ admin-init.php
│  ├─ admin-media-kit-viewer.php
│  └─ diagnostics.php
├─ api/
├─ component-schemas/
├─ export/
├─ import/
├─ themes/
├─ ComponentDiscovery.php
├─ class-gmkb-frontend-display.php
├─ class-gmkb-mkcg-data-integration.php
├─ enqueue.php
├─ frontend-template-router.php
├─ gmkb-debug-logger.php
└─ legacy-ajax-handlers.php
```

- [ ] Count files in includes/: `ls -1 includes/*.php | wc -l`
  - Expected: ~15-20 files (down from 33)
- [ ] Verify no broken requires:
  ```bash
  php -l includes/*.php
  ```

### Performance Testing
- [ ] Measure page load time (before cleanup): _______ seconds
- [ ] Measure page load time (after cleanup): _______ seconds
- [ ] Calculate improvement: _______% faster
- [ ] Count scripts loaded (Network tab): _______ (should be ~5-8)

### Functional Testing
Complete workflow test:
- [ ] Load builder page
- [ ] Add 3 different components
- [ ] Edit each component
- [ ] Save media kit
- [ ] Refresh page
- [ ] Verify components persist
- [ ] Change theme
- [ ] Save again
- [ ] Test on different browser
- [ ] Test undo/redo if applicable
- [ ] Export media kit if applicable

### Code Quality
- [ ] No PHP errors in debug.log
- [ ] No JavaScript errors in console
- [ ] No 404s in network tab
- [ ] Code passes linting (if applicable)

**Phase 7 Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

---

## 📊 FINAL SCORECARD

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Files in /includes | 33 | _____ | _____% |
| Lines of code | ~8,000 | _____ | _____% |
| Scripts loaded | 60+ | _____ | _____% |
| Page load time | ___s | ___s | _____% |
| PHP errors | _____ | 0 | ✅ |
| JS errors | _____ | 0 | ✅ |

---

## 🎉 SUCCESS CRITERIA

All phases complete when:
- [ ] ✅ All checkboxes above are checked
- [ ] ✅ Media kit builder works flawlessly
- [ ] ✅ Performance improved measurably
- [ ] ✅ Code is cleaner and more maintainable
- [ ] ✅ No errors in console or debug.log
- [ ] ✅ Documentation updated
- [ ] ✅ Team informed of changes

---

## 📝 NOTES & ISSUES

Use this space to track any issues encountered:

**Issue 1**:  
Description:  
Resolution:  
Date:  

**Issue 2**:  
Description:  
Resolution:  
Date:  

---

## 🔄 ROLLBACK PROCEDURES

If you need to rollback:

### Rollback Phase 1:
```bash
cp includes/enqueue.php ARCHIVE/attempted-vue-only.php
cp ARCHIVE/enqueue-consolidation/enqueue.php includes/
```

### Rollback Phase 2:
```bash
cp ARCHIVE/legacy-init/*.php includes/
```

### Rollback All Phases:
```bash
rm -rf includes
cp -r includes-backup includes
```

---

## ✅ COMPLETION

**Date Completed**: _________________  
**Completed By**: _________________  
**Overall Result**: [ ] Success [ ] Partial [ ] Rollback Required  
**Notes**: 

---

**Remember**: Take your time, test thoroughly, and keep backups. This cleanup aligns with Vue Migration Plan Phase 5 and sets you up for long-term success.
