# URL DETECTION FIX - TESTING CHECKLIST

## Pre-Flight Checks
- [ ] WordPress DEBUG mode is enabled (`WP_DEBUG = true`)
- [ ] PHP error logging is enabled
- [ ] Browser console is open (F12)
- [ ] All WordPress caches cleared
- [ ] Browser cache cleared (hard refresh: Ctrl+Shift+R)

---

## Test 1: Basic URL Detection (PHP Level)

### Run the automated test:
```bash
php test-url-detection.php
```

**Expected Result:**  
✅ ALL TESTS PASSED! (25/25 test cases)

**If Failed:**
- Check PHP version (must be 7.4+)
- Review error messages in output
- Compare regex patterns with fix documentation

---

## Test 2: WordPress Page Load

### Test URLs to verify:

#### Media Kit Builder (Should Load):
- [ ] `/media-kit` (basic)
- [ ] `/media-kit/` (with trailing slash)
- [ ] `/media-kit?mkcg_id=123` (with query, no slash)
- [ ] `/media-kit/?mkcg_id=32372` **← PRIMARY TEST CASE**
- [ ] `/tools/media-kit`
- [ ] `/tools/media-kit/?mkcg_id=456`
- [ ] `/guestify-media-kit/?id=789`

#### Other Tools (Should NOT Load Media Kit):
- [ ] `/tools/topics` (different tool)
- [ ] `/tools/questions` (different tool)
- [ ] `/tools/offer-generator` (different tool)

**Expected Behavior:**
- Media kit URLs → Load Vue app + WordPress media library
- Other URLs → Normal WordPress behavior

---

## Test 3: Debug Log Verification

### Check WordPress debug.log for each test URL:

**For Media Kit URLs, should see:**
```
🔍 GMKB: gmkb_is_builder_page() checking URI: /media-kit/?mkcg_id=32372
  - Pattern 1 (/tools/media-kit): NO MATCH
  - Pattern 2 (^/media-kit): MATCH
  - Pattern 3 (^/guestify-media-kit): NO MATCH
  - Final result: TRUE (is builder page)
✅ GMKB: Detected BUILDER page (URL pattern match): /media-kit/?mkcg_id=32372
🔍 GMKB: gmkb_enqueue_media_library() called
  - is_admin(): FALSE
  - REQUEST_URI: /media-kit/?mkcg_id=32372
✅ GMKB: WordPress media library enqueued at priority 10
```

**For Non-Media-Kit URLs, should see:**
```
🔍 GMKB: gmkb_is_builder_page() checking URI: /tools/topics
  - Pattern 1 (/tools/media-kit): NO MATCH
  - Pattern 2 (^/media-kit): NO MATCH
  - Pattern 3 (^/guestify-media-kit): NO MATCH
  - Final result: FALSE (not builder page)
❌ GMKB: NOT a media kit URL, skipping. URI: /tools/topics
```

**Location of debug.log:**
```
/wp-content/debug.log
```

---

## Test 4: WordPress Media Library Verification

### Open browser console (F12) on media kit page:

**Test 1: Check wp object exists**
```javascript
typeof wp !== 'undefined'
```
**Expected:** `true`

**Test 2: Check wp.media exists**
```javascript
typeof wp.media !== 'undefined'
```
**Expected:** `true`

**Test 3: Check media object structure**
```javascript
wp.media
```
**Expected:** Should return a large object with properties like `view`, `model`, `controller`, etc.

**Test 4: Test media uploader can be created**
```javascript
const frame = wp.media({ title: 'Test' });
console.log('Media frame created:', !!frame);
```
**Expected:** `Media frame created: true`

---

## Test 5: Component Upload Functionality

### Test actual image upload in media kit builder:

- [ ] Navigate to Biography component
- [ ] Click "Upload Image" button
- [ ] Media library modal opens (not browser file picker)
- [ ] Can select existing image from media library
- [ ] Can upload new image
- [ ] Image displays correctly after upload

**If media library doesn't open:**
- Check browser console for JavaScript errors
- Verify `wp.media` is available (Test 4 above)
- Check if `gmkb_enqueue_media_library()` was called (debug.log)

---

## Test 6: Edge Cases

### Test unusual URL patterns:

- [ ] `/media-kit//` (double slash)
- [ ] `/media-kit?` (query string marker, no params)
- [ ] `/media-kit/?` (slash + query marker, no params)
- [ ] `/media-kit?mkcg_id=123&debug=true` (multiple params)
- [ ] `/media-kit/?mkcg_id=123&debug=true` (slash + multiple params)

**Expected:** All should work (detect as builder page)

---

## Test 7: Cross-Browser Testing

### Test in multiple browsers:

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (Mac only)

**Expected:** Identical behavior across all browsers

---

## Test 8: Cache Verification

### Ensure no caching issues:

- [ ] Clear WordPress object cache
- [ ] Clear WordPress transients
- [ ] Clear CDN cache (if applicable)
- [ ] Clear browser cache (Ctrl+Shift+R)
- [ ] Test in incognito/private mode

---

## Troubleshooting Guide

### ❌ Media library still not loading

**Check these in order:**

1. **PHP Syntax Error**
   ```bash
   php -l includes/enqueue.php
   ```
   Should output: `No syntax errors detected`

2. **WordPress Cache Not Cleared**
   ```bash
   wp cache flush
   ```
   Or use caching plugin admin panel

3. **Old Code Still Loading**
   - Check file modification time: `ls -l includes/enqueue.php`
   - Verify file contents match the fix
   - Restart PHP-FPM/Apache if needed

4. **JavaScript Errors Blocking wp.media**
   - Open browser console
   - Look for red error messages
   - Check if errors occur before media library loads

5. **Hooks Not Firing**
   - Add more debug logging to `gmkb_enqueue_media_library()`
   - Check if `wp_enqueue_scripts` hook is being called
   - Verify WordPress is not in maintenance mode

---

## Success Criteria

### ✅ All tests must pass:

- [x] Automated regex test: 25/25 passed
- [ ] WordPress page loads successfully
- [ ] Debug log shows correct detection
- [ ] `wp.media` object is available
- [ ] Media library modal opens
- [ ] Image upload works
- [ ] All edge cases handled
- [ ] Cross-browser compatible
- [ ] No cache issues

---

## Sign-Off

**Tester:** ___________________________  
**Date:** ___________________________  
**Result:** [ ] PASS  [ ] FAIL  
**Notes:** _____________________________  
________________________________________  
________________________________________  

---

## Next Steps After Testing

If all tests pass:
1. ✅ Mark fix as verified
2. ✅ Update plugin version number
3. ✅ Create git commit with fix details
4. ✅ Deploy to staging environment
5. ✅ Deploy to production

If tests fail:
1. ❌ Document failure details
2. ❌ Review fix implementation
3. ❌ Check for WordPress compatibility issues
4. ❌ Re-test after corrections
