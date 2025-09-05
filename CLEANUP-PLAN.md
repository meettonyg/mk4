# MK4 Plugin Cleanup Plan

## Files to Archive/Delete

### 1. Root Level Test Files
- `test-bidirectional-sync.js` → Move to `ARCHIVE/test-scripts/`
- `test-phase14-integration.js` → Move to `ARCHIVE/test-scripts/`
- `git-commit-bidirectional-sync.txt` → Move to `ARCHIVE/documentation/`
- `git-commit-proper-fix.txt` → Move to `ARCHIVE/documentation/`

### 2. Old Documentation
- `CLEANUP-SUMMARY.md` → Move to `ARCHIVE/documentation/`
- `IMPLEMENTATION-COMPLETE.md` → Move to `ARCHIVE/documentation/`
- `PHASE-1-IMPLEMENTATION-COMPLETE.md` → Move to `ARCHIVE/documentation/`
- `ROOT-CAUSE-FIX-IMPLEMENTATION-COMPLETE.md` → Move to `ARCHIVE/documentation/`

### 3. Debug Folder (40+ files)
Move all to `ARCHIVE/debug-scripts/`:
- All `.js` files in `/debug/`
- All `.php` files in `/debug/`
- Everything in `/debug/diagnostic/`
- Everything in `/debug/quick-tests/`
- Everything in `/debug/test-fixes/`
- Everything in `/debug/temp-fixes/`
- Everything in `/debug/discarded/`

Keep only:
- `/debug/README.md` (create new one)

### 4. Remove from version control
Add to `.gitignore`:
```
/debug/*
!/debug/README.md
/ARCHIVE/
*.log
*.tmp
.DS_Store
Thumbs.db
```

## Manual Cleanup Steps (Windows)

1. Create archive directories:
   ```
   mkdir ARCHIVE\debug-scripts
   mkdir ARCHIVE\test-scripts
   mkdir ARCHIVE\documentation
   ```

2. Move files (in File Explorer):
   - Select all debug files → Cut → Paste to `ARCHIVE\debug-scripts\`
   - Move root test files to `ARCHIVE\test-scripts\`
   - Move documentation to `ARCHIVE\documentation\`

3. Delete empty debug subdirectories

4. Create new `/debug/README.md` with usage instructions

## Benefits
- Cleaner root directory
- Organized archive for reference
- Easier to navigate project
- Better for production deployment
- Preserves debug work for future reference
