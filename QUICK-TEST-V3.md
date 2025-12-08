# QUICK TEST GUIDE - Media Library Fix v3

## ⚡ IMMEDIATE STEPS

### 1. Rebuild Plugin
```powershell
cd C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4
npm run build
```

### 2. Clear Caches
- **Cloudways:** Varnish + Redis
- **Browser:** `Ctrl+Shift+F5`

### 3. Visit Page
```
https://guestify.ai/media-kit/?mkcg_id=32372
```

### 4. Open Console (F12)
```javascript
wp.media  // Should return object, NOT undefined
```

### 5. Test Upload
- Click "Upload Image" button
- Media library modal should open
- Test uploading image

---

## ✅ SUCCESS = All These Return TRUE

```javascript
typeof wp !== 'undefined'
typeof wp.media !== 'undefined'
typeof Backbone !== 'undefined'
typeof _ !== 'undefined'
document.querySelectorAll('script[type="text/html"]').length > 20
```

---

## 🔍 CHECK DEBUG LOG

**Look for:**
```
✅ GMKB: Manually loaded admin dependencies for frontend builder
✅ GMKB: WordPress media library enqueued (called at priority 999)
  - wp_script_is(media-views): TRUE
  - wp_script_is(backbone): TRUE
  - wp_script_is(underscore): TRUE
✅ GMKB: Media templates printed in footer for frontend builder
```

**If you see:**
```
wp_script_is(media-views): FALSE
```
→ Scripts didn't load, check for JavaScript errors

---

## ❌ IF STILL BROKEN

1. Check debug.log for errors
2. Check browser console for errors
3. Verify build completed successfully
4. Try incognito mode (no extensions)
5. Check if jQuery, Backbone, Underscore are loaded:
   ```javascript
   typeof jQuery  // Should be "function"
   typeof Backbone  // Should be "function"  
   typeof _  // Should be "function"
   ```

---

## 📄 FULL DOCS

See `ROOT-FIX-V3-ADMIN-CONTEXT.md` for complete details

---

**Status:** ✅ READY TO TEST  
**Risk:** 🟢 LOW  
**Expected Result:** Media library works perfectly!
