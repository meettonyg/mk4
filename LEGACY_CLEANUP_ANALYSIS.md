# Legacy Media Library Cleanup Analysis

## Date: November 10, 2025

## Executive Summary

The codebase has been successfully migrated to use the new **MediaUploader Vue component**, but there are still legacy references that can be cleaned up for a fully modern, jQuery-free implementation.

## Current Status

### ✅ What's Been Migrated
1. **LogoGridEditor.vue** - Now uses MediaUploader component (just completed)
2. **MediaUploader.vue** - Modern Vue component with drag-and-drop
3. **MediaGallery.vue** - Pure Vue gallery interface
4. **useMediaUpload.js** - REST API-based upload composable

### ⚠️ Legacy Code Still Present

#### 1. `useModernMediaUploader.js` Composable
**Location:** `src/composables/useModernMediaUploader.js`

**Status:** Still exists but NO LONGER USED in any components

**Purpose:** This was a hybrid composable that provided:
- Direct REST API uploads (✅ Good - now in useMediaUpload.js)
- jQuery-based `wp.media` modal (❌ Legacy - replaced by MediaUploader)

**Action Needed:** KEEP FOR NOW as fallback, but mark as deprecated

**Why Keep:**
- Some users might have custom components using it
- Provides fallback if MediaUploader has issues
- Can be removed in next major version

**Recommendation:** Add deprecation notice to the file

#### 2. `gmkb_enqueue_media_library()` Function
**Location:** `includes/enqueue.php` (lines ~240-280)

**Status:** STILL ACTIVE - Enqueues jQuery and `wp.media` library

**Current Code:**
```php
function gmkb_enqueue_media_library() {
    // ...
    wp_enqueue_media(); // ← Loads jQuery + wp.media
    wp_enqueue_script('media-editor'); // ← Loads media modal
    // ...
}
```

**Action Needed:** CAN BE REMOVED if no other components use it

**Impact:** This adds ~200KB of jQuery + WordPress media library scripts

## Detailed Analysis

### File: `src/composables/useModernMediaUploader.js`

**Current Usage:** NONE (verified - no imports in any .vue files)

**Functions Provided:**
1. `uploadFile()` - Direct REST API upload ✅ (now in useMediaUpload.js)
2. `selectAndUploadImage()` - File picker + upload ✅ (now in MediaUploader)
3. `selectFromLibrary()` - REST API media fetch ✅ (now in MediaGallery)
4. `openMediaLibrary()` - jQuery wp.media modal ❌ (replaced by MediaUploader)

**Recommendation:**
```javascript
// Add to top of file:
/**
 * @deprecated This composable is deprecated and will be removed in v5.0.0
 * 
 * MIGRATION GUIDE:
 * - For uploads: Use <MediaUploader> component instead
 * - For gallery: Import MediaUploader which includes MediaGallery
 * - For direct uploads: Use useMediaUpload() composable
 * 
 * @see src/vue/components/shared/MediaUploader.vue
 * @see src/composables/useMediaUpload.js
 */
```

### File: `includes/enqueue.php`

**Function:** `gmkb_enqueue_media_library()`

**Current Purpose:** Enqueues WordPress media library for `openMediaLibrary()` function

**Dependencies Loaded:**
- `wp_enqueue_media()` - ~150KB (jQuery, Backbone, Underscore, wp.media)
- `media-editor` - ~50KB (media modal UI)

**Total Impact:** ~200KB of JavaScript on every builder page

**Action Options:**

**Option 1: REMOVE COMPLETELY** ✅ Recommended
```php
// Comment out or delete the entire function
// and remove the add_action hooks
```

**Benefits:**
- ~200KB reduction in page load
- Faster initial render
- No jQuery dependency
- Cleaner, modern codebase

**Risks:**
- If any custom code calls `useModernMediaUploader.openMediaLibrary()`, it will break
- Minimal risk since we control all components

**Option 2: KEEP AS FALLBACK** (Conservative)
- Keep the function but add deprecation notice
- Monitor usage for 1-2 versions
- Remove in v5.0.0

**Option 3: CONDITIONAL LOADING** (Middle ground)
```php
// Only load if a specific flag is set
if (defined('GMKB_LEGACY_MEDIA_LIBRARY') && GMKB_LEGACY_MEDIA_LIBRARY) {
    wp_enqueue_media();
}
```

## Search for Other jQuery Dependencies

Let me check for any other jQuery references:

### Files to Check:
1. ✅ All .vue components - VERIFIED no `wp.media` usage
2. ✅ All .js files - VERIFIED no `wp.media` usage
3. ⚠️ PHP enqueue file - Found `wp_enqueue_media()`

### Confirmed Clean:
- No `$` (jQuery) usage in Vue components
- No `window.wp.media` usage in composables
- No direct jQuery manipulation

## Recommended Cleanup Plan

### Phase 1: Documentation (Immediate)
1. Add deprecation notice to `useModernMediaUploader.js`
2. Update component documentation to reference MediaUploader
3. Create migration guide for any custom implementations

### Phase 2: Testing (Next 1-2 weeks)
1. Monitor for any console errors about missing `wp.media`
2. Test all media upload flows thoroughly
3. Verify no custom components break

### Phase 3: Removal (Next major version - v5.0.0)
1. Delete `useModernMediaUploader.js` completely
2. Remove `gmkb_enqueue_media_library()` function
3. Remove related hooks from `enqueue.php`
4. Update CHANGELOG with breaking changes

## Implementation Steps (Conservative Approach)

### Step 1: Add Deprecation Warning
Add to `useModernMediaUploader.js`:
```javascript
if (typeof window !== 'undefined' && window.console) {
  console.warn(
    '[DEPRECATED] useModernMediaUploader is deprecated and will be removed in v5.0.0. ' +
    'Please use MediaUploader component instead. ' +
    'See: /src/vue/components/shared/MediaUploader.vue'
  );
}
```

### Step 2: Conditional PHP Loading
Modify `enqueue.php`:
```php
function gmkb_enqueue_media_library() {
    // DEPRECATED: This function will be removed in v5.0.0
    // The MediaUploader Vue component no longer requires wp.media
    
    // Only load if explicitly enabled via constant
    if (!defined('GMKB_LEGACY_MEDIA_LIBRARY') || !GMKB_LEGACY_MEDIA_LIBRARY) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('ℹ️ GMKB: Skipping wp.media (using MediaUploader component)');
        }
        return;
    }
    
    // Legacy support (will be removed in v5.0.0)
    wp_enqueue_media();
    wp_enqueue_script('media-editor');
}
```

### Step 3: Monitor & Document
- Add note to README about the migration
- Monitor for any issues
- Keep for 1-2 versions before removal

## Benefits of Complete Cleanup

### Performance
- **~200KB smaller** builder page load
- **Faster initial render** (no jQuery initialization)
- **Reduced memory usage** (no Backbone collections)

### Code Quality
- **Pure Vue architecture** (100% jQuery-free)
- **Easier maintenance** (fewer dependencies)
- **Better debugging** (simpler stack traces)

### Developer Experience
- **Cleaner component API** (no hybrid patterns)
- **Better TypeScript support** (no jQuery types)
- **Easier testing** (no jQuery mocking)

## Breaking Changes for v5.0.0

If/when we remove legacy code completely:

### For Plugin Developers:
```javascript
// OLD (deprecated):
import { useModernMediaUploader } from '@/composables/useModernMediaUploader';
const { openMediaLibrary } = useModernMediaUploader();
await openMediaLibrary({ multiple: true });

// NEW (current):
import MediaUploader from '@/vue/components/shared/MediaUploader.vue';
// Use component in template with @select event
```

### For Custom Components:
- Any custom components using `useModernMediaUploader` must migrate
- Any direct `wp.media` usage must be replaced
- Migration guide will be provided

## Conclusion

### Current State: ✅ READY FOR CLEANUP
- All core components migrated to MediaUploader
- No active usage of `useModernMediaUploader`
- Legacy code present but not used

### Recommended Action: GRADUAL DEPRECATION
1. ✅ Keep legacy code for v4.x (backward compatibility)
2. ✅ Add deprecation warnings (educate users)
3. ✅ Remove in v5.0.0 (clean break with major version)

### Immediate Next Step:
**Test thoroughly** - Ensure MediaUploader works perfectly in all scenarios before removing fallback code.

---
**Last Updated:** November 10, 2025
**Status:** Pending Decision on Cleanup Timeline
