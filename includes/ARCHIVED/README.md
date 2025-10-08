# ARCHIVED FILES

## Why These Files Were Archived

These files are **legacy/duplicate code** that was causing confusion and bugs. They have been archived to:
- ✅ Prevent accidental edits to wrong files
- ✅ Eliminate duplicate code (DRY violation)
- ✅ Maintain clean architecture
- ✅ Reduce tech debt

---

## ComponentDiscovery.php

**Archived Date**: October 8, 2025
**Reason**: Duplicate of `system/ComponentDiscovery.php`

### The Problem:
- Two ComponentDiscovery.php files existed:
  - ❌ `includes/ComponentDiscovery.php` (namespace GMKB) - NOT USED
  - ✅ `system/ComponentDiscovery.php` (no namespace) - ACTUALLY USED

- WordPress loads from `system/ComponentDiscovery.php` (see enqueue.php line 115)
- Having both files caused developer to edit wrong file
- This caused a critical bug where icons didn't display

### The Fix:
- Archived unused `includes/ComponentDiscovery.php`
- Only `system/ComponentDiscovery.php` remains
- Single source of truth restored ✅

### Why Keep Archive:
- Historical reference
- May contain useful code patterns
- Can be restored if needed (unlikely)

---

## Architecture Compliance

**Before Archiving:**
- ❌ Two identical files with different implementations
- ❌ Violates DRY (Don't Repeat Yourself)
- ❌ Confusing for developers
- ❌ Tech debt

**After Archiving:**
- ✅ Single ComponentDiscovery.php in `system/`
- ✅ DRY compliant
- ✅ Clear architecture
- ✅ Zero tech debt

---

## Recovery Instructions

If this file needs to be restored:
1. Verify it's actually needed
2. Check for any breaking changes in `system/ComponentDiscovery.php`
3. Consider merging useful features instead of restoring
4. Document why restoration was necessary

---

**IMPORTANT**: Do NOT un-archive without thorough investigation!
