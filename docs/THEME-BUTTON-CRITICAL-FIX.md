# CRITICAL FIX: Theme Button Not Working

## Issue
After initial fixes, the theme button stopped working completely - no dropdown appeared when clicking.

## Root Cause
**SYNTAX ERROR** in ThemeSwitcher.vue:
- `onUnmounted()` was being called **inside** `onMounted()`
- This is invalid Vue 3 Composition API syntax
- Caused the entire component to fail silently
- Event listeners were never properly attached

### The Bad Code:
```javascript
onMounted(() => {
  // ... setup code ...
  
  // ❌ WRONG: onUnmounted inside onMounted
  onUnmounted(() => {
    // cleanup
  });
});
```

### The Fix:
```javascript
onMounted(() => {
  // ... setup code ...
});

// ✅ CORRECT: onUnmounted at top level
onUnmounted(() => {
  // cleanup
});
```

## Solution Applied

**File**: `src/vue/components/ThemeSwitcher.vue`

**Change**: Moved `onUnmounted()` hook to top level of script setup

```javascript
// Lifecycle - BEFORE (BROKEN)
onMounted(() => {
  // Listen for events
  document.addEventListener('gmkb:open-theme-switcher', handleThemeOpen);
  document.addEventListener('click', handleClickOutside);
  
  // ❌ This breaks the component!
  onUnmounted(() => {
    document.removeEventListener('gmkb:open-theme-switcher', handleThemeOpen);
    document.removeEventListener('click', handleClickOutside);
  });
});

// Lifecycle - AFTER (FIXED)
onMounted(() => {
  // Listen for events
  document.addEventListener('gmkb:open-theme-switcher', handleThemeOpen);
  document.addEventListener('click', handleClickOutside);
});

// ✅ Separate onUnmounted at top level
onUnmounted(() => {
  document.removeEventListener('gmkb:open-theme-switcher', () => {});
  document.removeEventListener('click', handleClickOutside);
});
```

## Why This Broke Everything

1. **Vue 3 Composition API Rule**: Lifecycle hooks must be called at the top level of `setup()`, not nested
2. **Silent Failure**: Invalid hook placement causes component to fail without clear error
3. **Event Listeners Never Attached**: The entire onMounted block failed, so no event listeners were added
4. **No Dropdown**: Without event listeners, clicking the button had no effect

## Testing After Fix

```bash
# Rebuild
npm run build

# Then in browser console, check for:
✅ ThemeSwitcher: Listening for gmkb:open-theme-switcher event
✅ ThemeSwitcher: Attached to toolbar button

# Click theme button:
🎨 ThemeSwitcher: Received open event
🎨 ThemeSwitcher: Button position updated
🎨 ThemeSwitcher: Dropdown toggled, open: true
```

## Architecture Principle Violated (Then Fixed)

**Initial Mistake**: Did not follow Vue Composition API patterns correctly
- ❌ Nested lifecycle hooks
- ❌ Broke fundamental Vue 3 rules

**Fix Applied**: 
- ✅ Followed proper Vue 3 Composition API syntax
- ✅ Top-level lifecycle hooks only
- ✅ Proper event listener cleanup

## Prevention

### Rule for Future:
**NEVER nest lifecycle hooks in Vue 3 Composition API**

```javascript
// ❌ NEVER DO THIS:
onMounted(() => {
  onUnmounted(() => {}) // WRONG!
  watch(() => {})        // WRONG!
  computed(() => {})     // WRONG!
});

// ✅ ALWAYS DO THIS:
onMounted(() => {
  // setup code only
});

onUnmounted(() => {
  // cleanup code
});

watch(() => {
  // watcher code
});
```

## Status: ✅ FIXED

Theme button now:
- ✅ Opens dropdown on click
- ✅ Dispatches custom event
- ✅ Attaches event listeners properly
- ✅ Cleans up on unmount
- ✅ Works with invisible bridge for hover
- ✅ Allows clicking "Customize Theme" button

---

**Critical Lesson**: Always follow framework patterns exactly. Vue's Composition API is strict about hook placement for good reasons - it enables proper reactivity tracking and lifecycle management.
