# Archived Files - Recovery Guide

## Quick Recovery

If you need to restore any archived file:

```bash
# From the plugin root directory
cp ARCHIVE/src-legacy-2025-01-02/[filename] src/
```

## Archived Files

### 1. main.js.backup-phase4
- **Original Path**: `src/main.js.backup-phase4`
- **Why Archived**: Backup from Phase 4, no longer needed
- **Restore If**: Never (backup only)

### 2. main-clean.js
- **Original Path**: `src/main-clean.js`
- **Why Archived**: Duplicate of main.js
- **Restore If**: Need to compare implementations (reference only)

### 3. componentLibraryIntegration.js
- **Original Path**: `src/integrations/componentLibraryIntegration.js`
- **Why Archived**: Legacy bridge for pre-Vue component library
- **Replaced By**: `ComponentLibraryNew.vue` handles all functionality
- **Restore If**: Need to revert to hybrid PHP/Vue mode (not recommended)

### 4. VueComponentDiscovery.js
- **Original Path**: `src/loaders/VueComponentDiscovery.js`
- **Why Archived**: Replaced by UnifiedComponentRegistry
- **Replaced By**: `UnifiedComponentRegistry.js`
- **Restore If**: Registry system fails (should not happen)

## Archive Integrity

All files are preserved exactly as they were before archiving. No modifications were made.

## Timestamps

- **Archive Created**: January 2, 2025
- **Migration Phase**: Phase 5 - Cleanup
- **Project State**: Pure Vue Migration

## Related Documentation

- `AUDIT-SUMMARY.md` - Complete audit report
- `ARCHIVE-INVENTORY.md` - Archive strategy and inventory
- `../../SRC-AUDIT-COMPLETE.md` - Post-audit status
- `../../QUICK-REF-AUDIT.md` - Quick reference card

## Safe Deletion

These files can be safely deleted after:
1. Successful Phase 6-8 completion
2. Application running in production for 30+ days
3. No issues reported

**Recommendation**: Keep archive for at least 90 days after production deployment.
