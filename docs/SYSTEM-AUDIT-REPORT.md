# System Directory Audit

## 📁 Location
`C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\system\`

---

## 📊 Files & Directories Found

### PHP Files (12):
1. Abstract_Component_Integration.php
2. Base_Component_Data_Service.php
3. Component_Integration_Registry.php
4. **ComponentDiscovery.php** ✅
5. ComponentLoader.php
6. DesignPanel.php
7. **ThemeDiscovery.php** ✅
8. VersionManager.php (in version-control/)

### JavaScript Files (13):
9. component-options-integration.js
10. component-options-ui.css
11. ComponentConfigurationManager.js
12. ComponentOptionsUI.js
13. DataBindingEngine.js
14. DynamicSectionTemplates.js
15. render-gate.js
16. RenderCoordinator.js
17. SectionLayoutManager.js
18. SectionRenderer.js
19. SectionStyleManager.js
20. ThemeCustomizer.js
21. ThemeManager.js
22. UndoRedoManager.js
23. BaseComponentEditor.js (in editors/)
24. ComponentEditorRegistry.js (in editors/)

### Directories (3):
- cache/ (empty)
- editors/
- version-control/

**Total: 24 files + 3 directories**

---

## 🔍 Usage Analysis

### Files ACTIVELY LOADED by Plugin

Based on `guestify-media-kit-builder.php` and `includes/enqueue.php`:

#### ✅ LOADED - PHP (4 files):
1. **ComponentDiscovery.php** - ✅ KEEP
   - Loaded by: guestify-media-kit-builder.php line 114
   - Used by: Main plugin class
   - Purpose: Scans components directory for metadata
   
2. **ThemeDiscovery.php** - ✅ KEEP
   - Loaded by: includes/enqueue.php (explicitly required)
   - Used by: gmkb_get_theme_data()
   - Purpose: Scans themes directory for available themes

3. **Base_Component_Data_Service.php** - ✅ KEEP
   - Loaded by: guestify-media-kit-builder.php line 35
   - Purpose: Admin tools for component data

4. **VersionManager.php** - ✅ KEEP
   - Loaded by: guestify-media-kit-builder.php line 90
   - Purpose: Version control for media kits

#### ❌ NOT LOADED - PHP (4 files):
5. **ComponentLoader.php** - ❌ ALREADY ARCHIVED
   - Status: Moved to ARCHIVE/legacy-rendering/
   - Reason: Legacy PHP rendering (Pure Vue doesn't use)

6. **DesignPanel.php** - ❌ ALREADY ARCHIVED
   - Status: Moved to ARCHIVE/legacy-rendering/
   - Reason: Legacy PHP rendering (Pure Vue doesn't use)

7. **Abstract_Component_Integration.php** - ⚠️ ARCHIVE
   - Not loaded anywhere
   - Appears to be unused abstract class

8. **Component_Integration_Registry.php** - ⚠️ ARCHIVE
   - Not loaded anywhere
   - Appears to be unused registry

---

### JavaScript Files Analysis

#### ⚠️ QUESTION: Are these loaded?

The issue: **NONE of these JS files are explicitly enqueued** in:
- includes/enqueue.php
- guestify-media-kit-builder.php
- Any template files

**Current enqueue system loads:**
- `dist/gmkb.iife.js` (Vue bundle)
- `dist/style.css` (CSS bundle)
- That's it!

**This means all system/*.js files may be legacy!**

Let me check if they're bundled into the Vue bundle...

---

## 🎯 Categorization

### ✅ KEEP (4 files)

1. **ComponentDiscovery.php**
   - **Status:** Actively used
   - **Loaded by:** Main plugin
   - **Purpose:** Component metadata for Vue
   - **Action:** KEEP

2. **ThemeDiscovery.php**
   - **Status:** Actively used
   - **Loaded by:** enqueue.php
   - **Purpose:** Theme metadata for Vue
   - **Action:** KEEP

3. **Base_Component_Data_Service.php**
   - **Status:** Actively used
   - **Loaded by:** Main plugin (admin only)
   - **Purpose:** Component data services
   - **Action:** KEEP

4. **VersionManager.php** (in version-control/)
   - **Status:** Actively loaded
   - **Loaded by:** Main plugin
   - **Purpose:** Version control feature
   - **Action:** KEEP

---

### ❌ ALREADY ARCHIVED (2 files)

5. **ComponentLoader.php**
   - Status: Already in ARCHIVE/legacy-rendering/
   - Original location: system/ComponentLoader.php
   - **Action:** Verify it's archived, remove original

6. **DesignPanel.php**
   - Status: Already in ARCHIVE/legacy-rendering/
   - Original location: system/DesignPanel.php
   - **Action:** Verify it's archived, remove original

---

### ⚠️ PROBABLY UNUSED - NEEDS VERIFICATION (18+ files)

#### PHP Files to Verify (2):
7. **Abstract_Component_Integration.php**
   - Not explicitly loaded
   - May be used by Base_Component_Data_Service
   - **Action:** Check dependencies, likely ARCHIVE

8. **Component_Integration_Registry.php**
   - Not explicitly loaded
   - **Action:** Check dependencies, likely ARCHIVE

#### JavaScript Files to Verify (ALL 13 system/*.js files):
9-21. **ALL JavaScript files in system/**
   - NOT enqueued by WordPress
   - NOT in dist/ bundle list
   - May be legacy from old architecture
   - **Action:** Verify if bundled into Vue, else ARCHIVE

**Key question:** Are these bundled into `dist/gmkb.iife.js`?

---

## 🔍 Critical Investigation Needed

### Investigation 1: JavaScript Files

**Question:** Are system/*.js files imported by Vue?

**Check:**
```bash
# Search Vue source for system/ imports
grep -r "system/" src/
grep -r "from.*system" src/
grep -r "import.*system" src/
```

**Expected Result:**
- If NO imports found → These are LEGACY, should ARCHIVE
- If imports found → Part of Vue bundle, KEEP

### Investigation 2: PHP Abstract Classes

**Question:** Is Abstract_Component_Integration.php used?

**Check:**
```bash
# Search for class usage
grep -r "Abstract_Component_Integration" includes/
grep -r "extends.*Abstract_Component_Integration" includes/
```

---

## 📊 Preliminary Recommendations

### KEEP for Sure (4 files):
1. ✅ ComponentDiscovery.php
2. ✅ ThemeDiscovery.php
3. ✅ Base_Component_Data_Service.php
4. ✅ VersionManager.php

### VERIFY, Then ARCHIVE if Unused:

#### PHP (2 files):
- Abstract_Component_Integration.php
- Component_Integration_Registry.php

#### ALL JavaScript (13 files):
- component-options-integration.js
- component-options-ui.css
- ComponentConfigurationManager.js
- ComponentOptionsUI.js
- DataBindingEngine.js
- DynamicSectionTemplates.js
- render-gate.js
- RenderCoordinator.js
- SectionLayoutManager.js
- SectionRenderer.js
- SectionStyleManager.js
- ThemeCustomizer.js
- ThemeManager.js
- UndoRedoManager.js

#### JavaScript in subdirs (2 files):
- editors/BaseComponentEditor.js
- editors/ComponentEditorRegistry.js

---

## 🎯 Next Steps

### Step 1: Verify JavaScript Files
```bash
cd C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4

# Check if any Vue files import from system/
findstr /S /I "from.*system" src\*.js src\*.vue
findstr /S /I "import.*system" src\*.js src\*.vue
```

**If NO results:** All system/*.js are legacy → ARCHIVE

### Step 2: Verify PHP Abstract Classes
```bash
# Check if Abstract_Component_Integration is used
findstr /S /I "Abstract_Component_Integration" includes\*.php
findstr /S /I "Component_Integration_Registry" includes\*.php
```

**If NO results:** These are unused → ARCHIVE

### Step 3: Check Vite Build Config
```bash
# Check what gets bundled
cat vite.config.js
```

**Look for:** External dependencies or system/ in config

---

## 🚀 Proposed Archive Structure

```
ARCHIVE/
├── legacy-rendering/          # Already exists
│   ├── ComponentLoader.php    # Already archived
│   └── DesignPanel.php        # Already archived
└── legacy-system-files/       # NEW
    ├── php/
    │   ├── Abstract_Component_Integration.php
    │   └── Component_Integration_Registry.php
    ├── javascript/
    │   ├── component-options-integration.js
    │   ├── ComponentConfigurationManager.js
    │   ├── ComponentOptionsUI.js
    │   ├── DataBindingEngine.js
    │   ├── DynamicSectionTemplates.js
    │   ├── render-gate.js
    │   ├── RenderCoordinator.js
    │   ├── SectionLayoutManager.js
    │   ├── SectionRenderer.js
    │   ├── SectionStyleManager.js
    │   ├── ThemeCustomizer.js
    │   ├── ThemeManager.js
    │   ├── UndoRedoManager.js
    │   ├── BaseComponentEditor.js
    │   └── ComponentEditorRegistry.js
    ├── css/
    │   └── component-options-ui.css
    └── README.md
```

---

## ⚠️ Current Status: INVESTIGATION REQUIRED

**Cannot complete audit without verification of:**
1. Whether system/*.js files are imported by Vue
2. Whether Abstract PHP classes are used by other files
3. Whether Vite bundles any of these files

**Recommendation:** Run verification steps before archiving.

---

## 🎯 Expected Final State (After Verification)

```
system/
├── ComponentDiscovery.php       ✅ KEEP (actively used)
├── ThemeDiscovery.php          ✅ KEEP (actively used)
├── Base_Component_Data_Service.php  ✅ KEEP (admin tools)
├── cache/                       ✅ KEEP (cache directory)
└── version-control/
    └── VersionManager.php       ✅ KEEP (version control)
```

**Total: 4 PHP files + 2 directories**
**Archived: 18+ files (after verification)**

---

## 📝 Summary

**Found:** 24 files + 3 directories  
**Actively Used:** 4 files confirmed  
**Already Archived:** 2 files  
**Needs Verification:** 18 files  
**Next Action:** Run verification commands

---

## ⚡ Quick Verification Commands

Run these to complete the audit:

```powershell
cd C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4

# Check Vue imports from system/
Write-Host "Checking Vue imports from system/..." -ForegroundColor Yellow
Get-ChildItem -Path "src" -Recurse -Include "*.js","*.vue" | Select-String -Pattern "from.*['\`"].*system/" | Select-Object Path, LineNumber, Line

# Check PHP class usage
Write-Host "`nChecking Abstract_Component_Integration usage..." -ForegroundColor Yellow
Get-ChildItem -Path "includes","system" -Recurse -Include "*.php" | Select-String -Pattern "Abstract_Component_Integration|Component_Integration_Registry" | Select-Object Path, LineNumber

# Check if ComponentLoader/DesignPanel still exist in system/
Write-Host "`nChecking for already-archived files..." -ForegroundColor Yellow
Test-Path "system\ComponentLoader.php"
Test-Path "system\DesignPanel.php"
```

**After running these, we'll know exactly what to archive!**
