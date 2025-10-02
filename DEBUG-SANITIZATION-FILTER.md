# Database Bloat Fix - Sanitization Filter Debug

## Current Issue
The sanitization filter (`gmkb_before_save_media_kit_state`) is not being triggered during save operations, allowing Pods data to be saved to the database causing bloat.

**Evidence**: Biography component still has 1,551 chars after save (should be ~0 if filter worked).

## Root Cause Investigation

### Files Involved
1. **includes/component-data-sanitization.php** - Defines the filter
2. **includes/gmkb-ajax-handlers.php** - Calls the filter (line ~444)
3. **guestify-media-kit-builder.php** - Includes sanitization file

### Filter Registration
**File**: `includes/component-data-sanitization.php`
- Filter registered: `add_filter('gmkb_before_save_media_kit_state', 'gmkb_sanitize_components_before_save', 5, 2)`
- Priority: 5 (should run early)
- Function: `gmkb_sanitize_components_before_save($state, $post_id)`

### Filter Call
**File**: `includes/gmkb-ajax-handlers.php` (line ~444)
```php
// 4. ROOT FIX: Clean Pods data BEFORE saving (prevent database bloat)
$state = apply_filters('gmkb_before_save_media_kit_state', $state, $post_id);
```

### File Loading Order
**File**: `guestify-media-kit-builder.php`
```php
// ROOT FIX: Include component data sanitization (prevent database bloat)
if (file_exists(GUESTIFY_PLUGIN_DIR . 'includes/component-data-sanitization.php')) {
    require_once GUESTIFY_PLUGIN_DIR . 'includes/component-data-sanitization.php';
}
```

## Debug Logging Added

### 1. Filter Registration Confirmation
**File**: `includes/component-data-sanitization.php`
```php
// ROOT FIX: Log that the filter is registered
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ GMKB SANITIZATION: Filter gmkb_before_save_media_kit_state registered with priority 5');
    error_log('✅ GMKB SANITIZATION: Target function: gmkb_sanitize_components_before_save');
}
```

### 2. Filter Execution Logging
**File**: `includes/component-data-sanitization.php` (inside function)
```php
// CRITICAL DEBUG: Log that filter was triggered
error_log('================================');
error_log('🚨 GMKB SANITIZATION FILTER TRIGGERED!');
error_log('Post ID: ' . $post_id);
error_log('State type: ' . gettype($state));
error_log('State keys: ' . (is_array($state) ? implode(', ', array_keys($state)) : 'N/A'));
error_log('Components count: ' . (isset($state['components']) ? count($state['components']) : 0));
error_log('================================');
```

### 3. Filter Call Investigation
**File**: `includes/gmkb-ajax-handlers.php`
```php
error_log('🔍 GMKB SAVE: About to apply filter gmkb_before_save_media_kit_state');
error_log('🔍 GMKB SAVE: Filter registered? ' . (has_filter('gmkb_before_save_media_kit_state') ? 'YES' : 'NO'));
if (has_filter('gmkb_before_save_media_kit_state')) {
    global $wp_filter;
    if (isset($wp_filter['gmkb_before_save_media_kit_state'])) {
        error_log('🔍 GMKB SAVE: Filter callbacks: ' . print_r($wp_filter['gmkb_before_save_media_kit_state']->callbacks, true));
    }
}

$state = apply_filters('gmkb_before_save_media_kit_state', $state, $post_id);

error_log('🔍 GMKB SAVE: Filter applied, state returned');
error_log('🔍 GMKB SAVE: Components after filter: ' . (isset($state['components']) ? count($state['components']) : 0));
```

## Next Steps to Debug

### Step 1: Check WordPress Error Log
Look for these log messages after saving a media kit:
1. `✅ GMKB SANITIZATION: Filter gmkb_before_save_media_kit_state registered` (on page load)
2. `🔍 GMKB SAVE: About to apply filter` (before save)
3. `🔍 GMKB SAVE: Filter registered? YES/NO` (check if filter exists)
4. `🚨 GMKB SANITIZATION FILTER TRIGGERED!` (inside filter function)

### Step 2: Possible Issues

#### Issue A: Filter Not Registered
**Symptoms**: Log shows "Filter registered? NO"
**Cause**: Sanitization file not loaded or loaded after AJAX handler
**Fix**: Check file loading order in `guestify-media-kit-builder.php`

#### Issue B: Filter Registered But Not Triggered
**Symptoms**: Log shows "Filter registered? YES" but no "FILTER TRIGGERED" message
**Cause**: WordPress not calling the filter callback
**Fixes**:
1. Check filter priority conflicts
2. Check if another plugin is clearing filters
3. Verify PHP function exists when filter is called

#### Issue C: Filter Triggered But Not Cleaning
**Symptoms**: Log shows "FILTER TRIGGERED" but data still has Pods bloat
**Cause**: Cleaning logic not working correctly
**Fix**: Check the sanitization logic in `gmkb_sanitize_components_before_save()`

### Step 3: Fallback Solutions

If filter doesn't work, alternatives:
1. **Call function directly** instead of using filter
2. **Clean in AJAX handler** before applying filter
3. **Clean on load** instead of on save (less efficient)

## Expected Log Output (Success Case)

```
[timestamp] ✅ GMKB SANITIZATION: Filter gmkb_before_save_media_kit_state registered with priority 5
[timestamp] ✅ GMKB SANITIZATION: Target function: gmkb_sanitize_components_before_save
... (later, during save)
[timestamp] 🔍 GMKB SAVE: About to apply filter gmkb_before_save_media_kit_state
[timestamp] 🔍 GMKB SAVE: Filter registered? YES
[timestamp] 🔍 GMKB SAVE: Filter callbacks: Array ( [5] => Array ( [function_name] => Array ... ) )
[timestamp] ================================
[timestamp] 🚨 GMKB SANITIZATION FILTER TRIGGERED!
[timestamp] Post ID: 123
[timestamp] State type: array
[timestamp] State keys: components, sections, layout, theme
[timestamp] Components count: 3
[timestamp] ================================
[timestamp] 🧹 GMKB: Sanitizing components before save (removing Pods bloat)
[timestamp] ✅ GMKB: Cleaned 3 components
[timestamp] 📊 GMKB: Saved 1234 bytes by removing Pods bloat
[timestamp] 🔍 GMKB SAVE: Filter applied, state returned
[timestamp] 🔍 GMKB SAVE: Components after filter: 3
```

## Test Procedure

1. **Enable WP_DEBUG** in `wp-config.php`:
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   define('WP_DEBUG_DISPLAY', false);
   ```

2. **Clear browser cache** and reload the media kit builder

3. **Save a media kit** with Biography component

4. **Check error log** at `wp-content/debug.log`

5. **Analyze log output** to identify which step is failing

6. **Report findings** with relevant log excerpts

## Status
- ✅ Debug logging added to all critical points
- ✅ File paths verified
- ✅ Filter registration code checked
- ⏳ Waiting for test results from error log

## File Changes Made
1. `includes/component-data-sanitization.php` - Added registration logging and execution logging
2. `includes/gmkb-ajax-handlers.php` - Added filter investigation logging around apply_filters call
