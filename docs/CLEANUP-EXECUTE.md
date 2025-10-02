# Cleanup Script - Execute Cleanup

**IMPORTANT**: Review CLEANUP-PLAN.md before running this script!

## Quick Cleanup (Recommended)

### Step 1: Create Archive Directory
```powershell
New-Item -ItemType Directory -Path "CLEANUP-ARCHIVE-2025-01-29" -Force
```

### Step 2: Move Build Scripts (30+ files)
```powershell
# Move all .bat files
Get-ChildItem *.bat | Move-Item -Destination CLEANUP-ARCHIVE-2025-01-29/ -Force

# Move all .sh files
Get-ChildItem *.sh | Move-Item -Destination CLEANUP-ARCHIVE-2025-01-29/ -Force

# Move all .ps1 files  
Get-ChildItem *.ps1 | Move-Item -Destination CLEANUP-ARCHIVE-2025-01-29/ -Force
```

### Step 3: Move Test Files (15 files)
```powershell
# Move test files
Get-ChildItem test-*.js, test-*.html, diagnostic-*.*, verify-*.js | Move-Item -Destination CLEANUP-ARCHIVE-2025-01-29/ -Force

# Move specific test files
Move-Item "fix-phase2-api.php" CLEANUP-ARCHIVE-2025-01-29/ -Force -ErrorAction SilentlyContinue
```

### Step 4: Move Old Phase Documentation (Keep only Phase 5)
```powershell
# Move Phase 1-4 docs
Get-ChildItem PHASE-*.md | Where-Object {$_.Name -notlike "PHASE-5-*"} | Move-Item -Destination CLEANUP-ARCHIVE-2025-01-29/ -Force

# Move PHASE3 docs
Get-ChildItem PHASE3-*.md | Move-Item -Destination CLEANUP-ARCHIVE-2025-01-29/ -Force

# Move PHASE1 docs
Get-ChildItem PHASE1-*.md | Move-Item -Destination CLEANUP-ARCHIVE-2025-01-29/ -Force
```

### Step 5: Move Obsolete Documentation
```powershell
# List of specific files to move
$obsolete_docs = @(
    "ALL-EDITORS-COMPLETE.md",
    "API-FIX-COMPLETE.md",
    "ARCHIVE-LEGACY-FILES.md",
    "BUGFIX-COMPONENT-MOVE-CONTROLS.md",
    "COMPONENT-CSS-AUDIT-COMPLETE.md",
    "CONSOLE-ERROR-FIXES.md",
    "CSS-SELECTOR-FIX.md",
    "CUSTOM-THEMES-FIX-COMPLETE.md",
    "DEBUG-THEME-BUTTON.md",
    "edit-control-fix-v2.md",
    "FINAL-ALL-17-EDITORS-COMPLETE.md",
    "fix-edit-control.md",
    "FIX-TIMING-ISSUE.md",
    "GIT-COMMIT-TEMPLATE.md",
    "LEGACY-REMOVAL-PLAN.md",
    "MIGRATION-COMPLETE.md",
    "QUICK-FIX-BUTTON-IDS.md",
    "REFACTOR-THEMESWITCHER-EVENTS.md",
    "REMAINING-COMPONENTS-UPDATE.md",
    "ROOT-FIXES-APPLIED.md",
    "SAVE-TO-DATABASE-FIX.md",
    "SELF-CONTAINED-EDITORS-COMPLETE.md",
    "SIMPLIFIED-ARCHITECTURE.md",
    "THEME-403-FIX.md",
    "THEME-CSS-VARIABLE-AUDIT.md",
    "THEME-FIX-GEMINI.txt",
    "THEME-PERSISTENCE-FIX-COMPLETE.md",
    "THEME-PERSISTENCE-FIX.md",
    "THEME-REST-API-FIX.md",
    "THEME-SWITCHER-FIX-COMPLETE.md",
    "THEME-SYSTEM-FIX-COMPLETE.md",
    "THEME_ANALYSIS.md",
    "VUE-MIGRATION-COMPLETE.md",
    "VUE-MIGRATION-STATUS.md",
    "VUE-MIGRATION-SUMMARY.md",
    "VUE-PURE-MODE-IMPLEMENTATION.md"
)

foreach ($file in $obsolete_docs) {
    if (Test-Path $file) {
        Move-Item $file CLEANUP-ARCHIVE-2025-01-29/ -Force
    }
}
```

### Step 6: Move Git Helper Files
```powershell
Move-Item ".git-commit-message.txt" CLEANUP-ARCHIVE-2025-01-29/ -Force -ErrorAction SilentlyContinue
Move-Item ".architecture-separated" CLEANUP-ARCHIVE-2025-01-29/ -Force -ErrorAction SilentlyContinue
```

### Step 7: REMOVE js/ Folder (Obsolete)
```powershell
# js/ folder is NOT used by Vue build (verified in enqueue-vue-only.php)
# All JavaScript now in src/ folder
Remove-Item -Path "js" -Recurse -Force
```

### Step 8: Verify Build Still Works
```powershell
npm run build
```

### Step 9: Create Cleanup Report
```powershell
$archived_count = (Get-ChildItem CLEANUP-ARCHIVE-2025-01-29 -Recurse | Measure-Object).Count
Write-Host "✅ Cleanup Complete!"
Write-Host "📦 Files archived: $archived_count"
Write-Host "📁 Archive location: CLEANUP-ARCHIVE-2025-01-29/"
```

---

## All-in-One Cleanup Script

Save this as `cleanup.ps1` and run:

```powershell
# ============================================
# Guestify Media Kit Builder - Cleanup Script
# ============================================

Write-Host "🧹 Starting cleanup..." -ForegroundColor Cyan

# Create archive
New-Item -ItemType Directory -Path "CLEANUP-ARCHIVE-2025-01-29" -Force | Out-Null
Write-Host "✅ Created archive directory" -ForegroundColor Green

# Move build scripts
$build_scripts = Get-ChildItem *.bat, *.sh, *.ps1
Write-Host "📦 Moving $($build_scripts.Count) build scripts..." -ForegroundColor Yellow
$build_scripts | Move-Item -Destination CLEANUP-ARCHIVE-2025-01-29/ -Force

# Move test files
$test_files = Get-ChildItem test-*.js, test-*.html, diagnostic-*.*, verify-*.js, fix-phase2-api.php -ErrorAction SilentlyContinue
Write-Host "📦 Moving $($test_files.Count) test files..." -ForegroundColor Yellow
$test_files | Move-Item -Destination CLEANUP-ARCHIVE-2025-01-29/ -Force

# Move old phase docs
$old_phase_docs = Get-ChildItem PHASE-*.md, PHASE1-*.md, PHASE3-*.md | Where-Object {$_.Name -notlike "PHASE-5-*"}
Write-Host "📦 Moving $($old_phase_docs.Count) old phase documents..." -ForegroundColor Yellow
$old_phase_docs | Move-Item -Destination CLEANUP-ARCHIVE-2025-01-29/ -Force

# Move obsolete docs
$obsolete_docs = @(
    "ALL-EDITORS-COMPLETE.md",
    "API-FIX-COMPLETE.md",
    "ARCHIVE-LEGACY-FILES.md",
    "BUGFIX-COMPONENT-MOVE-CONTROLS.md",
    "COMPONENT-CSS-AUDIT-COMPLETE.md",
    "CONSOLE-ERROR-FIXES.md",
    "CSS-SELECTOR-FIX.md",
    "CUSTOM-THEMES-FIX-COMPLETE.md",
    "DEBUG-THEME-BUTTON.md",
    "edit-control-fix-v2.md",
    "FINAL-ALL-17-EDITORS-COMPLETE.md",
    "fix-edit-control.md",
    "FIX-TIMING-ISSUE.md",
    "GIT-COMMIT-TEMPLATE.md",
    "LEGACY-REMOVAL-PLAN.md",
    "MIGRATION-COMPLETE.md",
    "QUICK-FIX-BUTTON-IDS.md",
    "REFACTOR-THEMESWITCHER-EVENTS.md",
    "REMAINING-COMPONENTS-UPDATE.md",
    "ROOT-FIXES-APPLIED.md",
    "SAVE-TO-DATABASE-FIX.md",
    "SELF-CONTAINED-EDITORS-COMPLETE.md",
    "SIMPLIFIED-ARCHITECTURE.md",
    "THEME-403-FIX.md",
    "THEME-CSS-VARIABLE-AUDIT.md",
    "THEME-FIX-GEMINI.txt",
    "THEME-PERSISTENCE-FIX-COMPLETE.md",
    "THEME-PERSISTENCE-FIX.md",
    "THEME-REST-API-FIX.md",
    "THEME-SWITCHER-FIX-COMPLETE.md",
    "THEME-SYSTEM-FIX-COMPLETE.md",
    "THEME_ANALYSIS.md",
    "VUE-MIGRATION-COMPLETE.md",
    "VUE-MIGRATION-STATUS.md",
    "VUE-MIGRATION-SUMMARY.md",
    "VUE-PURE-MODE-IMPLEMENTATION.md"
)

$moved_count = 0
foreach ($file in $obsolete_docs) {
    if (Test-Path $file) {
        Move-Item $file CLEANUP-ARCHIVE-2025-01-29/ -Force
        $moved_count++
    }
}
Write-Host "📦 Moved $moved_count obsolete documentation files" -ForegroundColor Yellow

# Move git helper files
if (Test-Path ".git-commit-message.txt") {
    Move-Item ".git-commit-message.txt" CLEANUP-ARCHIVE-2025-01-29/ -Force
}
if (Test-Path ".architecture-separated") {
    Move-Item ".architecture-separated" CLEANUP-ARCHIVE-2025-01-29/ -Force
}

# Remove js/ folder (verified unused)
if (Test-Path "js") {
    Write-Host "🗑️  Removing js/ folder (unused - all code in src/)..." -ForegroundColor Yellow
    Remove-Item -Path "js" -Recurse -Force
    Write-Host "✅ Removed js/ folder" -ForegroundColor Green
}

# Count archived files
$archived_count = (Get-ChildItem CLEANUP-ARCHIVE-2025-01-29 -Recurse | Measure-Object).Count

Write-Host ""
Write-Host "✅ Cleanup Complete!" -ForegroundColor Green
Write-Host "📦 Files archived: $archived_count" -ForegroundColor Cyan
Write-Host "📁 Archive location: CLEANUP-ARCHIVE-2025-01-29/" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: npm run build" -ForegroundColor White
Write-Host "2. Test: Load Media Kit Builder in browser" -ForegroundColor White
Write-Host "3. Commit: git add . && git commit -m 'Cleanup: Remove obsolete files'" -ForegroundColor White
Write-Host ""
```

---

## Verification After Cleanup

### 1. Check Build
```powershell
npm run build
# Should complete without errors
```

### 2. Check File Count
```powershell
# Before: ~200 files in root
# After: ~30 files in root
Get-ChildItem -File | Measure-Object
```

### 3. Test Plugin
1. Open WordPress admin
2. Navigate to Media Kit Builder
3. Add a component
4. Save changes
5. Verify no console errors

### 4. Check What Remains
```powershell
Get-ChildItem -File | Where-Object {$_.Extension -in '.md','.bat','.sh','.ps1'} | Select-Object Name
```

Should only show:
- ✅ README.md
- ✅ CLEANUP-PLAN.md
- ✅ CLEANUP-EXECUTE.md (this file)
- ✅ PHASE-5-*.md (5 files)

---

## Rollback (If Needed)

```powershell
# Restore everything
Move-Item CLEANUP-ARCHIVE-2025-01-29\* . -Force

# Restore js/ folder
git checkout js/
```

---

## Expected Results

### Before Cleanup
```
Root directory: ~200 files
- 30+ build scripts (.bat, .sh, .ps1)
- 15 test files
- 60+ markdown docs
- js/ folder (unused)
```

### After Cleanup
```
Root directory: ~30 files
- Essential config (package.json, vite.config.js, etc.)
- Current phase docs (PHASE-5-*.md)
- Main plugin file
- README.md
- CLEANUP docs
```

### Size Reduction
- **~105 files removed/archived**
- **js/ folder deleted (unused)**
- **Much cleaner structure**

---

**Ready to execute?** Run the PowerShell script above!
