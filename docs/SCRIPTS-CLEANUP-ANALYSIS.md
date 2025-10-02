# Scripts Folder Cleanup Analysis

## 📋 Current Files in scripts/

1. ✅ **BUILD-SCRIPTS-GUIDE.md** - KEEP (documentation)
2. ✅ **build.bat** - KEEP (active build script)
3. ✅ **build.ps1** - KEEP (active build script)
4. ❌ **cleanup-legacy-files.sh** - ARCHIVE (one-time cleanup, already done)
5. ❌ **cleanup-remaining.ps1** - ARCHIVE (one-time cleanup, already done)
6. ❌ **comprehensive-cleanup.ps1** - ARCHIVE (one-time cleanup, already done)
7. ❌ **DELETE_ALL_DEPRECATED_FILES.bat** - ARCHIVE (one-time cleanup, already done)
8. ❌ **DELETE_DEPRECATED_FILES.bat** - ARCHIVE (one-time cleanup, already done)
9. ✅ **dev.ps1** - KEEP (active development tool)
10. ❌ **directory-cleanup.ps1** - ARCHIVE (one-time cleanup, already done)
11. ✅ **quick-build.ps1** - KEEP (active build script)
12. ❌ **verify-option-a.ps1** - ARCHIVE (one-time verification, migration complete)
13. ❌ **verify-option-a.sh** - ARCHIVE (one-time verification, migration complete)

---

## ✅ Files to KEEP (5 files)

These are actively used for daily development:

1. **BUILD-SCRIPTS-GUIDE.md** - Documentation for build scripts
2. **build.bat** - Batch file build wrapper
3. **build.ps1** - PowerShell build script
4. **dev.ps1** - All-in-one development helper
5. **quick-build.ps1** - Quick build with watch mode

---

## ❌ Files to ARCHIVE (8 files)

These were one-time migration/cleanup scripts:

### Cleanup Scripts (Already Executed)
1. **cleanup-legacy-files.sh** - Legacy file cleanup (Phase 5)
2. **cleanup-remaining.ps1** - Root cleanup
3. **comprehensive-cleanup.ps1** - Comprehensive cleanup
4. **DELETE_ALL_DEPRECATED_FILES.bat** - Deprecated file deletion
5. **DELETE_DEPRECATED_FILES.bat** - Deprecated file deletion
6. **directory-cleanup.ps1** - Directory cleanup

### Verification Scripts (Migration Complete)
7. **verify-option-a.ps1** - Option A verification
8. **verify-option-a.sh** - Option A verification (bash)

---

## 📁 Proposed Archive Structure

Move to: `ARCHIVE/migration-scripts/`

```
ARCHIVE/
└── migration-scripts/
    ├── cleanup/
    │   ├── cleanup-legacy-files.sh
    │   ├── cleanup-remaining.ps1
    │   ├── comprehensive-cleanup.ps1
    │   ├── DELETE_ALL_DEPRECATED_FILES.bat
    │   ├── DELETE_DEPRECATED_FILES.bat
    │   └── directory-cleanup.ps1
    ├── verification/
    │   ├── verify-option-a.ps1
    │   └── verify-option-a.sh
    └── README.md (explaining what these were for)
```

---

## 🎯 Rationale

**Keep:**
- Scripts used regularly for building
- Scripts with ongoing utility
- Documentation for active scripts

**Archive:**
- One-time migration scripts (already executed)
- Verification scripts (migration complete)
- Cleanup scripts (cleanup done)

---

## ✅ After Cleanup

**scripts/ will contain only:**
```
scripts/
├── BUILD-SCRIPTS-GUIDE.md  # Documentation
├── build.bat                # Build script
├── build.ps1                # Build script
├── dev.ps1                  # Development helper
└── quick-build.ps1          # Quick build
```

**Result:** Clean, focused scripts folder with only active development tools.
