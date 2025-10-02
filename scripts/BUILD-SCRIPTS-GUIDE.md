# 🛠️ Build Scripts Guide

Quick reference for building the Media Kit Builder Vue application.

---

## 🚀 Quick Start (Easiest)

### Double-Click Build (Windows)
Just double-click this file in the root directory:
```
BUILD.bat
```
That's it! It will:
- Install dependencies (if needed)
- Build the production bundle
- Show you the results
- Pause so you can see the output

---

## 📜 PowerShell Scripts

Located in `scripts/` directory.

### 1. Simple Build Script
```powershell
# Navigate to plugin directory first
cd C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4

# Run the build script
.\scripts\build.ps1
```

**What it does:**
- Checks for dependencies
- Runs production build
- Shows bundle size
- Provides next steps

**Or use the batch wrapper:**
```cmd
.\scripts\build.bat
```

---

### 2. Quick Build Script
```powershell
# Basic build
.\scripts\quick-build.ps1

# Watch mode (auto-rebuild on file changes)
.\scripts\quick-build.ps1 -Watch

# Development server
.\scripts\quick-build.ps1 -Dev

# Clean build (removes old files first)
.\scripts\quick-build.ps1 -Clean
```

---

### 3. Development Helper (Full-Featured)
```powershell
# Show help
.\scripts\dev.ps1 help

# Production build
.\scripts\dev.ps1 build

# Watch mode
.\scripts\dev.ps1 watch

# Dev server
.\scripts\dev.ps1 dev

# Clean everything
.\scripts\dev.ps1 clean

# Clean including node_modules
.\scripts\dev.ps1 clean -Force

# Install dependencies
.\scripts\dev.ps1 install

# Run linter (if configured)
.\scripts\dev.ps1 lint

# Run tests (if configured)
.\scripts\dev.ps1 test
```

---

## 📋 Manual Commands

If you prefer to run npm commands directly:

```bash
# Navigate to plugin directory
cd C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4

# Install dependencies
npm install

# Production build
npm run build

# Watch mode (if configured)
npm run watch

# Development server (if configured)
npm run dev
```

---

## 🎯 Common Workflows

### First Time Setup
```powershell
# 1. Navigate to plugin
cd C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4

# 2. Install dependencies
npm install

# 3. Build
npm run build
```

### Daily Development
```powershell
# Option A: Watch mode (auto-rebuild)
.\scripts\quick-build.ps1 -Watch

# Option B: Manual builds as needed
.\scripts\dev.ps1 build
```

### After Pulling Changes
```powershell
# 1. Update dependencies
.\scripts\dev.ps1 install

# 2. Clean build
.\scripts\dev.ps1 clean
.\scripts\dev.ps1 build
```

### Troubleshooting Build Issues
```powershell
# 1. Full clean
.\scripts\dev.ps1 clean -Force

# 2. Reinstall
.\scripts\dev.ps1 install

# 3. Build
.\scripts\dev.ps1 build
```

---

## 📦 Build Output

After building, you'll find:
```
dist/
├── gmkb.iife.js       # Main Vue bundle
├── gmkb.iife.js.map   # Source map (for debugging)
└── style.css          # Compiled styles (if separate)
```

**Main bundle:** `dist/gmkb.iife.js`
- This is what WordPress loads
- Should be under 500KB (gzipped)
- Includes all Vue components

---

## 🔧 Configuration

### package.json Scripts
```json
{
  "scripts": {
    "build": "vite build",
    "watch": "vite build --watch",
    "dev": "vite"
  }
}
```

### vite.config.js
Located in plugin root. Controls:
- Entry point (`src/main.js`)
- Output format (IIFE)
- Output filename (`gmkb.iife.js`)
- Build optimizations

---

## 🚨 Troubleshooting

### "npm not found"
**Solution:** Install Node.js from https://nodejs.org/

### "Access Denied" or "Cannot run scripts"
**Solution:** Run PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Build succeeds but changes don't appear
**Solution:**
1. Clear WordPress cache (if using cache plugin)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Hard reload (Ctrl+F5)
4. Check console for 304 Not Modified responses

### "Module not found" errors
**Solution:**
```powershell
.\scripts\dev.ps1 clean -Force
.\scripts\dev.ps1 install
.\scripts\dev.ps1 build
```

### Bundle size too large
**Solution:**
- Check for duplicate dependencies
- Use code splitting
- Lazy load components
- Review imported libraries

---

## 💡 Tips

### Speed Up Builds
- Use watch mode during development
- Keep terminal open
- Use SSD for node_modules

### Verify Build Success
```powershell
# Check if bundle exists
Test-Path "dist\gmkb.iife.js"

# Check bundle size
(Get-Item "dist\gmkb.iife.js").Length / 1KB
```

### Clear Caches After Build
```powershell
# WordPress (if using WP Super Cache)
# Visit: Tools > WP Super Cache > Delete Cache

# Browser
# Chrome: Ctrl+Shift+Delete > Cached images and files
```

---

## 📊 Build Metrics

**Target Performance:**
- Build time: <10 seconds
- Bundle size: <500KB (gzipped <150KB)
- Watch rebuild: <2 seconds

**Check your build:**
```powershell
# Run build with timing
Measure-Command { .\scripts\dev.ps1 build }
```

---

## 🔗 Related Documentation

- [Vue Migration Plan](../Media%20Kit%20Builder%20-%20Complete%20Vue%20Migration%20Plan%20v3.0%20(Final))
- [Development Setup](./DEVELOPMENT-SETUP.md)
- [Component Architecture](../docs/COMPONENT-ARCHITECTURE.md)

---

## ⚡ Quick Reference Card

```
┌─────────────────────────────────────────┐
│  Quick Command Reference                │
├─────────────────────────────────────────┤
│  BUILD.bat              - One-click     │
│  .\scripts\dev.ps1 build - Production   │
│  .\scripts\dev.ps1 watch - Auto-rebuild │
│  .\scripts\dev.ps1 clean - Clean all    │
│  npm run build           - Direct build │
└─────────────────────────────────────────┘
```

---

**Happy Building! 🚀**
