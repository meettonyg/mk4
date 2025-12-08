# 🚀 Quick Build Guide

## Build the Plugin

### Option 1: Use PowerShell Script (Recommended)
```powershell
# From mk4 directory in PowerShell
.\build.ps1
```

### Option 2: Manual npm Build
```bash
# From mk4 directory
npm run build
```

### Option 3: Development Mode (Watch)
```bash
# For continuous development
npm run dev
```

## After Building

1. **Refresh WordPress admin page** (Ctrl+F5 to clear cache)
2. **Open Logo Grid component editor**
3. **Click "Upload Logo(s)" button**
4. **Verify the new MediaUploader modal opens**

## What You Should See

### MediaUploader Interface
- **Two tabs**:
  - 📤 **Upload Files**: Drag & drop or click to browse
  - 🖼️ **Media Library**: Select from existing media
  
### Features
- ✅ Drag-and-drop file upload
- ✅ Multiple file selection
- ✅ Upload progress indicator
- ✅ Recently uploaded files preview
- ✅ File type validation
- ✅ File size validation (10MB max)
- ✅ Visual feedback with toast notifications

## Testing Checklist

- [ ] MediaUploader modal opens when clicking "Upload Logo(s)"
- [ ] Can drag & drop files onto upload zone
- [ ] Can click to browse and select files
- [ ] Upload progress shows during upload
- [ ] Can select multiple files at once
- [ ] Can switch to Media Library tab
- [ ] Can select from existing media
- [ ] Selected logos appear in editor list
- [ ] Logos display correctly in preview
- [ ] No console errors

## Troubleshooting

### Modal doesn't open
1. Check browser console for errors
2. Verify build completed successfully
3. Hard refresh browser (Ctrl+Shift+R)
4. Check if MediaUploader component is properly imported

### Files don't upload
1. Check file size (must be < 10MB)
2. Check file type (must be image)
3. Check WordPress upload permissions
4. Check server PHP upload_max_filesize

### Console Errors
1. Check for JavaScript errors in browser console
2. Verify all dependencies are installed: `npm install`
3. Rebuild: `npm run build`
4. Check WordPress debug.log for PHP errors

## Build Output Location
```
mk4/dist/
├── main.js         (Vue app bundle)
├── main.css        (Compiled styles)
└── main.js.map     (Source map)
```

## Next Steps
After successful testing:
1. Test other components that might benefit from MediaUploader
2. Consider removing old `useModernMediaUploader` composable
3. Document the new MediaUploader API for other developers
4. Create reusable patterns for media uploads

---
**Last Updated:** November 10, 2025
