# Media Kit Builder - Production Cleanup Plan
**Date**: January 30, 2025
**Status**: Ready for cleanup
**Goal**: Remove all legacy code, test files, and documentation bloat for production

## 🎯 Cleanup Overview

### Current State
- Vue 3 + Pinia architecture fully implemented
- All legacy systems archived
- Development/debug files mixed with production
- Excessive documentation files
- Unused test files and scripts

### Target State
- Clean, production-ready codebase
- Only essential documentation
- No debug/test files
- Streamlined build process
- Clear file structure

---

## 📁 FILES TO DELETE

### 1. Legacy Documentation (Root Level)
These files document completed work and are no longer needed:
```
- ALL-EDITORS-COMPLETE.md
- FINAL-ALL-17-EDITORS-COMPLETE.md
- FINAL-MODERNIZATION-STATUS.md
- LEGACY-REMOVAL-PLAN.md
- MODERNIZATION-100-COMPLETE.md
- PHASE-3-THEME-FIX-STATUS.md
- PHASE-4-8-COMPLETE.md
- SELF-CONTAINED-EDITORS-COMPLETE.md
- SIMPLIFIED-ARCHITECTURE.md
- THEME-CSS-VARIABLE-AUDIT.md
- VUE-MIGRATION-COMPLETE.md
- VUE-MIGRATION-STATUS.md
- VUE-PURE-MODE-IMPLEMENTATION.md
```

### 2. Build Scripts (Legacy)
Remove unused build scripts:
```
- build-fix.sh
- check-categories.sh
- fix-css-selectors.sh
- clean-install-build.bat
- rebuild.bat
- rebuild-vue.bat
- clean-rebuild.bat
```

Keep only:
```
✓ build.bat
✓ build.sh
✓ package.json scripts
```

### 3. Debug & Test Files
```
debug/
  - test-undo-redo-vue.js  [DELETE]

src/tests/
  - testVueUndoRedo.js     [DELETE]

scripts/
  - check-css-compliance.js       [DELETE - development only]
  - fix-component-css-variables.js [DELETE - one-time fix]
  - theme-tests.js                 [DELETE - development only]
```

### 4. Documentation Cleanup

#### Keep These Core Docs:
```
docs/
  - README.md (main documentation)
  - ARCHITECTURE.md (system overview)
  - DEVELOPER_GUIDE.md (for contributors)
  - QUICK_START.md (getting started)
  - COMPONENTS.md (component reference)
```

#### Delete All Archive Docs:
```
docs/archive/           [DELETE ENTIRE FOLDER]
docs/implementation-plan/ [DELETE ENTIRE FOLDER]
docs/fixes/             [DELETE ENTIRE FOLDER]
docs/issues/            [DELETE ENTIRE FOLDER]
```

#### Delete Implementation Docs:
```
docs/
  - All implementation-specific .md files
  - All status reports
  - All fix summaries
```

### 5. Component Documentation
```
components/
  - DATA-INTEGRATION-PATTERN.md     [DELETE]
  - TEMPLATE-FALLBACK-PATTERN.md    [DELETE]
  
components/topics/
  - POST-ID-FIX-SUMMARY.md         [DELETE]
  - POST-ID-TROUBLESHOOTING.md     [DELETE]
  - TOPICS-SAVE-HANDLER-FIX.md     [DELETE]
```

### 6. Legacy JS Files to Review
Check if these are still needed:
```
js/fixes/       [Review and likely DELETE entire folder]
src/debug/      [DELETE if only contains test code]
```

### 7. Backup Files
```
src/main.js.backup-phase4  [DELETE]
Any .bak files              [DELETE]
```

---

## 📁 FILES TO ARCHIVE (Move to ARCHIVE folder)

If any of these contain useful reference material:
```
- Implementation plans
- Migration guides
- Historical fix documentation
```

---

## 📁 FILES TO KEEP & UPDATE

### Essential Documentation
```
README.md - Update with:
  - Current features
  - Installation guide
  - Basic usage
  - Link to developer guide

docs/ARCHITECTURE.md - Ensure reflects current Vue architecture
docs/DEVELOPER_GUIDE.md - Update for Vue-only development
docs/COMPONENTS.md - Current component list
```

### Core Build Files
```
package.json
vite.config.js
.gitignore
```

### Production Code
```
src/ (all Vue components and stores)
includes/ (PHP files)
admin/ (WordPress admin)
css/ (styles)
dist/ (built files)
```

---

## 🧹 CLEANUP COMMANDS

### Step 1: Archive Important Docs (if needed)
```bash
mkdir -p ARCHIVE/legacy-docs-2025-01-30
mv docs/archive ARCHIVE/legacy-docs-2025-01-30/
mv docs/implementation-plan ARCHIVE/legacy-docs-2025-01-30/
```

### Step 2: Delete Legacy Files
```bash
# Root level docs
rm -f ALL-EDITORS-COMPLETE.md
rm -f FINAL-ALL-17-EDITORS-COMPLETE.md
rm -f FINAL-MODERNIZATION-STATUS.md
rm -f LEGACY-REMOVAL-PLAN.md
rm -f MODERNIZATION-100-COMPLETE.md
rm -f PHASE-3-THEME-FIX-STATUS.md
rm -f PHASE-4-8-COMPLETE.md
rm -f SELF-CONTAINED-EDITORS-COMPLETE.md
rm -f SIMPLIFIED-ARCHITECTURE.md
rm -f THEME-CSS-VARIABLE-AUDIT.md
rm -f VUE-MIGRATION-COMPLETE.md
rm -f VUE-MIGRATION-STATUS.md
rm -f VUE-PURE-MODE-IMPLEMENTATION.md

# Build scripts
rm -f build-fix.sh
rm -f check-categories.sh
rm -f fix-css-selectors.sh
rm -f clean-install-build.bat
rm -f rebuild.bat
rm -f rebuild-vue.bat
rm -f clean-rebuild.bat

# Debug/test files
rm -rf debug/
rm -rf src/tests/
rm -rf scripts/

# Documentation
rm -rf docs/archive/
rm -rf docs/implementation-plan/
rm -rf docs/fixes/
rm -rf docs/issues/

# Component docs
rm -f components/*.md
rm -rf components/topics/*.md

# Backup files
find . -name "*.bak" -delete
find . -name "*.backup*" -delete
```

### Step 3: Clean Empty Directories
```bash
find . -type d -empty -delete
```

### Step 4: Update Git
```bash
git add -A
git commit -m "Production cleanup: Remove legacy code, tests, and documentation"
```

---

## ✅ POST-CLEANUP CHECKLIST

### File Structure Should Be:
```
mk4/
├── admin/          # WordPress admin files
├── components/     # Component PHP files
├── css/           # Styles
├── dist/          # Built Vue app
├── docs/          # Essential documentation only
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── DEVELOPER_GUIDE.md
│   ├── COMPONENTS.md
│   └── QUICK_START.md
├── includes/      # PHP includes
├── js/           # Minimal JS (if needed)
├── src/          # Vue source
│   ├── composables/
│   ├── constants/
│   ├── core/
│   ├── features/
│   ├── stores/
│   ├── utils/
│   ├── vue/
│   └── main.js
├── system/       # System files
├── templates/    # Templates
├── themes/       # Theme files
├── .gitignore
├── build.bat
├── build.sh
├── package.json
├── README.md
├── vite.config.js
└── guestify-media-kit-builder.php
```

### Verification Steps:
1. [ ] No test files in production code
2. [ ] No debug files or folders
3. [ ] No backup files (.bak, .backup)
4. [ ] No implementation/migration docs
5. [ ] No legacy build scripts
6. [ ] Clean git history
7. [ ] Build still works: `npm run build`
8. [ ] Plugin activates in WordPress
9. [ ] All features functional

---

## 🚀 FINAL PRODUCTION BUILD

After cleanup:
```bash
# Clean install
rm -rf node_modules
npm install

# Production build
npm run build

# Test in WordPress
# Deploy to production
```

---

## 📊 Expected Results

### Before Cleanup:
- ~200+ documentation files
- Multiple test/debug files
- Legacy build scripts
- Confusing file structure

### After Cleanup:
- ~5 essential documentation files
- Production code only
- Simple build process
- Clear, maintainable structure
- Reduced repository size by ~50%

---

## ⚠️ IMPORTANT NOTES

1. **Make a full backup before cleanup**
2. **Test the build after cleanup**
3. **Verify all WordPress functionality**
4. **Archive may be deleted after confirming everything works**
5. **Update README.md with current information**
