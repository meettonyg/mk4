# Source Code Archive - January 2, 2025

## Purpose
This archive contains legacy/duplicate/obsolete files from the src directory as part of the pure Vue migration cleanup (Phase 5).

## Archive Strategy
- **Keep**: Files actively used in pure Vue architecture
- **Archive**: Legacy PHP integration code, duplicate files, obsolete core systems

## Files Archived

### 1. Obsolete Entry Points
- `main.js.backup-phase4` - Backup file, no longer needed
- `main-clean.js` - Duplicate of main.js, archived for reference

**Why**: Only `main.js` is needed as the single entry point. Backup files and duplicates create confusion.

### 2. Legacy Core Systems (NOT archived - still needed)
The following files in `src/core/` are KEPT because they're still used:
- `EnhancedStateManager.js` - Used by Pinia store for state management
- `StateManager.js` - Exports EnhancedStateManager
- `EventBus.js` - Used for event communication
- `HistoryManager.js` - Used by EnhancedStateManager for undo/redo
- `PodsDataIntegration.js` - Used for Pods field integration
- `SectionDragDropManager.js` - Used for drag-drop functionality

**Note**: These appear legacy but are actually integrated with the Vue system.

### 3. Legacy Integrations (Evaluate)
Files in `src/integrations/`:
- `componentLibraryIntegration.js` - May be obsolete if ComponentLibraryNew.vue handles this

**Action Needed**: Check if this is still used by the new component library.

### 4. Data Definitions
Files in `src/data/`:
- `componentDefinitions.js` - Check if UnifiedComponentRegistry replaces this

### 5. Empty Directories
- `src/debug/` - Empty, can be removed
- `src/plugins/` - Empty, can be removed
- `src/tests/` - Empty, should be populated or removed
- `src/vue/discovery/` - Empty, can be removed

## Recommendations

### ARCHIVE NOW:
1. `main.js.backup-phase4` - Backup no longer needed
2. `main-clean.js` - Duplicate of main.js
3. Empty directories: `debug/`, `plugins/`, `vue/discovery/`

### EVALUATE & POTENTIALLY ARCHIVE:
1. `src/integrations/componentLibraryIntegration.js` - Check usage
2. `src/data/componentDefinitions.js` - Check if redundant with UnifiedComponentRegistry
3. `src/loaders/VueComponentDiscovery.js` - Check if still used

### KEEP (Active in Pure Vue):
1. All stores (`src/stores/*.js`)
2. All services (`src/services/*.js`)
3. All Vue components (`src/vue/components/**/*.vue`)
4. Core systems (`src/core/*.js`) - integrated with Pinia
5. Utilities (`src/utils/*.js`)
6. `main.js` - Single entry point

## Post-Archive Tasks

1. **Test the application** - Ensure nothing broke
2. **Update imports** - Remove any references to archived files
3. **Documentation** - Update architecture docs to reflect current structure
4. **Git commit** - Commit archive with clear message

## Recovery
If anything breaks, all files can be restored from this archive directory.
Archive location: `ARCHIVE/src-legacy-2025-01-02/`
