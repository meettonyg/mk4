# Profile Photo Upload Fix - System Timeout Removed

**Date:** November 6, 2025  
**Issue:** Profile photo uploads but doesn't save to Pods field  
**Error:** `Timeout waiting for system: core`

---

## 🎯 The Problem

### What Was Happening

1. ✅ Image uploads to WordPress media library successfully
2. ✅ Returns attachment ID and URL
3. ❌ Fails to save to Pods field with timeout error

### Console Error

```
✅ Image uploaded: {id: 46321, url: 'https://...'}
❌ Pods field update failed: Timeout waiting for system: core
⚠️ Profile Photo: Field 'profile_photo' failed: Timeout waiting for system: core
```

### Root Cause

The `usePodsFieldUpdate` composable was calling:

```javascript
await systemReadiness.waitForSystem('core');
```

This was waiting for a 'core' system to be ready, but:
1. The composable only runs AFTER full app initialization
2. The system wait was unnecessary - everything is already ready
3. The wait was timing out after 10 seconds
4. No actual system dependencies needed

---

## ✅ The Fix

### Changed File
`src/composables/usePodsFieldUpdate.js`

### What Changed

**Before (Problematic):**
```javascript
try {
  // Wait for system to be ready
  await systemReadiness.waitForSystem('core');
  
  const { apiUrl, nonce } = window.gmkbData.apiSettings;
  // ... proceed with update
}
```

**After (Fixed):**
```javascript
try {
  // No system wait needed - we're already initialized
  // This composable only runs after full app initialization
  
  // Defensive check that gmkbData exists
  if (!window.gmkbData || !window.gmkbData.apiSettings) {
    throw new Error('System not initialized - gmkbData not available');
  }
  
  const { apiUrl, nonce } = window.gmkbData.apiSettings;
  
  if (!apiUrl || !nonce) {
    throw new Error('API settings incomplete');
  }
  
  // ... proceed with update
}
```

### Why This Works

1. **No Unnecessary Wait:** Composable only used after app is fully initialized
2. **Defensive Checks:** Validates gmkbData exists before using it
3. **Clear Errors:** Provides specific error messages if data is missing
4. **Removed Dependency:** No longer imports SystemReadiness service

---

## 🚀 Build & Test

### 1. Build

```bash
npm run build
```

### 2. Test Profile Photo Upload

1. Open media kit in builder
2. Add or edit Profile Photo component
3. Click upload button
4. Select/upload image
5. Verify success message
6. Check that image appears in component

### Expected Success Messages

```
📸 Profile Photo: Image uploaded via REST API {id: ..., url: '...'}
💾 Profile Photo: Saving to Pods field {postId: ..., fieldName: 'profile_photo', attachmentId: ...}
✅ Profile Photo: Saved to Pods field successfully
```

### Should NOT See

- ❌ `Timeout waiting for system: core`
- ❌ `Field update failed`
- ❌ Any timeout errors

---

## 📊 Architecture Notes

### Why The System Wait Was Wrong

**The composable is only accessible from:**
1. Vue components (after app mount)
2. Editor panels (after full initialization)
3. Component logic (after everything is ready)

**Therefore:**
- No need to wait for systems - they're already ready
- Defensive checks sufficient
- Simpler, faster code
- No timeout risk

### Compliance Check

✅ **Phase 1: No Polling** - Removed timeout-based wait  
✅ **Phase 2: Simplicity** - Removed unnecessary complexity  
✅ **Phase 4: Graceful Failure** - Added defensive checks with clear errors  

---

## 🔍 If Still Not Working

### Diagnostic Steps

1. **Check Console for Errors**
   - Look for red error messages
   - Note the exact error text

2. **Verify API Endpoint**
   ```javascript
   // In console:
   window.gmkbData.apiSettings
   // Should show: {apiUrl: '...', nonce: '...'}
   ```

3. **Check Network Tab**
   - Open DevTools → Network
   - Try upload
   - Look for POST request to `/pods/...`
   - Check status code (should be 200)

4. **Verify Pods Field Exists**
   - Go to WordPress Admin
   - Edit media kit post
   - Look for "Profile Photo" field
   - Verify it's a Pods field

---

## 📝 Summary

**Issue:** Unnecessary system readiness wait causing timeout  
**Fix:** Removed wait, added defensive checks  
**Result:** Profile photo uploads should now work immediately  
**Files Changed:** 1 (`src/composables/usePodsFieldUpdate.js`)  
**Lines Changed:** ~15 (removed import, simplified logic)  

---

## 🎯 Expected Behavior After Fix

1. User clicks upload in Profile Photo editor
2. Image uploads to WordPress media library
3. Attachment ID returned
4. Pods field updated immediately (no 10-second wait)
5. Image appears in component
6. Success message shown
7. Component re-renders with new image

**Total time:** < 2 seconds (was timing out at 10 seconds)

---

**Build and test - this should fix the profile photo upload!** 🎉
