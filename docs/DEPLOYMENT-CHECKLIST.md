# 🚀 Production Deployment Checklist

**Plugin**: Guestify Media Kit Builder v3.0  
**Last Updated**: 2025-01-02

---

## ✅ PRE-DEPLOYMENT CHECKS

### 1. Build Process
- [ ] Run `npm run build` to compile Vue
- [ ] Verify `dist/gmkb.iife.js` exists
- [ ] Verify file size is reasonable (~200-500KB)
- [ ] No build errors in console

### 2. Testing
- [ ] All tests passing locally
- [ ] Test on staging environment
- [ ] Browser console shows no errors
- [ ] Save/load operations working

### 3. Backup
- [ ] Database backup created
- [ ] Files backup created
- [ ] Backup tested/verified

---

## 📦 FILES TO UPLOAD

### ✅ REQUIRED Files/Folders

```
mk4/
├── guestify-media-kit-builder.php (main plugin file)
├── dist/
│   └── gmkb.iife.js ← CRITICAL: Compiled Vue bundle
├── includes/ (all PHP files)
│   ├── api/
│   ├── gmkb-ajax-handlers.php
│   ├── ComponentDiscovery.php
│   ├── enqueue.php
│   └── ... (all other PHP files)
├── components/ (all component folders)
├── system/
├── assets/
└── templates/
```

### ❌ DO NOT UPLOAD

```
❌ node_modules/
❌ src/ (source code - already compiled to dist/)
❌ tests/
❌ package.json
❌ package-lock.json
❌ vite.config.js
❌ vitest.config.js
❌ .git/
❌ .vscode/
❌ *.md files (optional - can upload for docs)
```

---

## 🔧 DEPLOYMENT METHODS

### Method 1: FTP/SFTP (Manual)

**Step 1**: Build locally
```bash
cd C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4
npm run build
```

**Step 2**: Upload via FTP
- Connect to server
- Navigate to `/wp-content/plugins/mk4/`
- Upload ONLY production files (see list above)
- **IMPORTANT**: Delete `node_modules/` and `src/` from server if they exist

**Step 3**: Verify
- Check that `dist/gmkb.iife.js` exists on server
- File size should be ~200-500KB
- Test the plugin on the live site

---

### Method 2: Git Deployment (Recommended)

**Create `.deployignore`** (already done ✅)

**Deploy command** (if using deployment tool):
```bash
# Example with git deployment
git add .
git commit -m "Production build"
git push production main
```

**Server receives**:
- All PHP files ✅
- Compiled `dist/` files ✅
- Components ✅
- **Excludes**: `node_modules/`, `src/`, config files ✅

---

### Method 3: ZIP Upload (WordPress Admin)

**Step 1**: Create production ZIP

```bash
# On your local machine, from plugin root:

# Build first
npm run build

# Create production ZIP (Windows PowerShell)
$compress = @{
  Path = "guestify-media-kit-builder.php", "dist", "includes", "components", "system", "assets", "templates"
  CompressionLevel = "Optimal"
  DestinationPath = "mk4-production.zip"
}
Compress-Archive @compress

# This creates mk4-production.zip with ONLY production files
```

**Step 2**: Upload via WordPress
- Go to: Plugins → Add New → Upload Plugin
- Choose `mk4-production.zip`
- Click "Install Now"
- Activate plugin

---

## 🔍 POST-DEPLOYMENT VERIFICATION

### 1. File Check
```bash
# SSH into server and verify:
cd /path/to/wp-content/plugins/mk4/

# Should exist:
ls -lh dist/gmkb.iife.js  # ~200-500KB
ls -lh includes/          # PHP files
ls -lh components/        # Component folders

# Should NOT exist:
ls node_modules/  # Should show "No such file or directory"
ls src/           # Should show "No such file or directory"
```

### 2. Browser Check
- [ ] Open browser console (F12)
- [ ] Navigate to Media Kit Builder
- [ ] No 404 errors for `gmkb.iife.js`
- [ ] No console errors
- [ ] Vue app mounts successfully

### 3. Functionality Check
- [ ] Can create new media kit
- [ ] Can add components
- [ ] Can save changes
- [ ] Data persists after reload
- [ ] No race conditions on rapid saves

### 4. Performance Check
- [ ] Page loads in < 2 seconds
- [ ] Bundle size reasonable
- [ ] Network tab shows REST API calls (not AJAX)

---

## 🚨 ROLLBACK PLAN

If deployment fails:

1. **Restore from backup**
   ```bash
   # Copy backup over current files
   cp -r /path/to/backup/mk4/ /path/to/wp-content/plugins/mk4/
   ```

2. **Clear caches**
   - Clear WordPress cache
   - Clear CDN cache (if applicable)
   - Hard refresh browser (Ctrl+Shift+R)

3. **Verify rollback**
   - Check that old version works
   - Restore database if needed

---

## 📊 FILE SIZE GUIDELINES

| File/Folder | Expected Size | Notes |
|-------------|---------------|-------|
| `dist/gmkb.iife.js` | 200-500 KB | Compiled Vue bundle |
| `includes/` | ~100-200 KB | PHP files |
| `components/` | ~500 KB - 1 MB | All components |
| `node_modules/` | **0 KB** | Should NOT exist on server |
| `src/` | **0 KB** | Should NOT exist on server |

---

## 🎯 QUICK DEPLOYMENT COMMAND

**For experienced developers with deployment setup**:

```bash
# Build and deploy in one command
npm run build && \
  rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude 'src' \
  --exclude '*.config.js' \
  --exclude 'package*.json' \
  --exclude '.git' \
  --exclude 'tests' \
  ./ user@server:/path/to/wp-content/plugins/mk4/
```

---

## ⚠️ CRITICAL REMINDERS

1. **ALWAYS run `npm run build` before deploying**
2. **NEVER upload `node_modules/` to production**
3. **NEVER upload `src/` to production** (it's compiled to `dist/`)
4. **VERIFY `dist/gmkb.iife.js` exists on server**
5. **Test on staging before production**

---

## 📞 TROUBLESHOOTING

### Issue: Vue app not loading
**Check**: `dist/gmkb.iife.js` exists on server?
**Fix**: Re-upload `dist/` folder

### Issue: Console shows 404 for gmkb.iife.js
**Check**: File permissions correct? (644)
**Fix**: `chmod 644 dist/gmkb.iife.js`

### Issue: Old version still showing
**Fix**: Clear all caches (WordPress, browser, CDN)

### Issue: Components not rendering
**Check**: `components/` folder uploaded?
**Fix**: Upload entire `components/` directory

---

**Last Review**: 2025-01-02  
**Next Review**: Before each deployment  
**Status**: ✅ Production Ready
