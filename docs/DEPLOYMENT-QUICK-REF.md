# 📦 Deployment Quick Reference

## ❌ NEVER Upload to Server

```
node_modules/       ← Dependencies (too large, not needed)
src/               ← Source code (already compiled to dist/)
tests/             ← Test files
package.json       ← npm config (development only)
package-lock.json  ← npm lock file
vite.config.js     ← Build config
vitest.config.js   ← Test config
*.md files         ← Documentation (optional)
.git/              ← Git repository
.vscode/           ← IDE settings
```

---

## ✅ MUST Upload to Server

```
guestify-media-kit-builder.php  ← Main plugin file
dist/
  └── gmkb.iife.js             ← Compiled Vue bundle ⚠️ CRITICAL
includes/                      ← All PHP files
  ├── api/
  ├── gmkb-ajax-handlers.php
  ├── ComponentDiscovery.php
  └── ... (all PHP files)
components/                    ← All component folders
system/                        ← System files
assets/                        ← CSS, images, etc.
templates/                     ← Template files
```

---

## 🚀 Quick Deploy (3 Steps)

### Step 1: Build
```bash
npm run build
```

### Step 2: Create ZIP
```bash
# Run the build script:
build-production.bat
```

### Step 3: Upload
- Upload `mk4-production.zip` via WordPress admin
- OR extract and upload via FTP

---

## ⚠️ Critical Reminders

1. **ALWAYS build before deploying**: `npm run build`
2. **Verify `dist/gmkb.iife.js` exists** on server
3. **NEVER upload `node_modules/`** - wastes space and causes issues
4. **NEVER upload `src/`** - source is compiled to `dist/`

---

## 🔍 Quick Verification

After upload, check:
- [ ] `dist/gmkb.iife.js` exists on server (200-500KB)
- [ ] Browser console shows no 404 errors
- [ ] Vue app loads correctly
- [ ] No `node_modules/` folder on server
- [ ] No `src/` folder on server

---

## 📊 Expected File Sizes

| What | Size | Status |
|------|------|--------|
| `dist/gmkb.iife.js` | 200-500 KB | ✅ Should exist |
| `node_modules/` | 0 bytes | ❌ Should NOT exist |
| `src/` | 0 bytes | ❌ Should NOT exist |

---

## 🆘 If Something Goes Wrong

1. **Vue not loading?**
   - Check: `dist/gmkb.iife.js` on server?
   - Fix: Re-upload `dist/` folder

2. **404 errors?**
   - Check: File permissions (644 for files, 755 for folders)
   - Fix: `chmod 644 dist/gmkb.iife.js`

3. **Old code running?**
   - Clear WordPress cache
   - Clear browser cache (Ctrl+Shift+R)
   - Clear CDN cache if applicable

---

**See**: `DEPLOYMENT-CHECKLIST.md` for full details
