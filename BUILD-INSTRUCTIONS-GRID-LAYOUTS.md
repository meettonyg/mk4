# Build Instructions - Grid Layout Features

## ✅ COMPLETED: PhotoGallery Components

### Files Updated:
1. ✅ `src/vue/components/shared/MasonryGrid.vue` - CREATED
2. ✅ `src/vue/components/shared/CarouselGrid.vue` - CREATED  
3. ✅ `components/photo-gallery/PhotoGalleryEditor.vue` - UPDATED
4. ✅ `components/photo-gallery/PhotoGalleryRenderer.vue` - UPDATED

---

## 🚀 ACTION REQUIRED: Build the Project

### Step 1: Run Build Command

```powershell
cd C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4
npm run build
```

This will compile:
- MasonryGrid.vue → dist/gmkb.iife.js
- CarouselGrid.vue → dist/gmkb.iife.js
- PhotoGalleryEditor updates → dist/gmkb.iife.js
- PhotoGalleryRenderer updates → dist/gmkb.iife.js

### Step 2: Test in Browser

After building, test the Photo Gallery component:

1. **Open WordPress Admin** → Media Kit Builder
2. **Add Photo Gallery Component**
3. **Check Display Options** → You should see:
   - Layout Style dropdown (Grid/Masonry/Carousel)
   - Grid Columns (hidden when Carousel selected)
   - Carousel Settings section (visible only when Carousel selected)
4. **Test Each Layout:**
   - Grid: Should show responsive grid
   - Masonry: Should show Pinterest-style layout
   - Carousel: Should show Swiper slider with arrows/dots
5. **Test Lightbox:** Click any photo in any layout → should open lightbox

---

## 📋 Expected Build Output

```
vite v5.4.20 building for production...
✓ XXX modules transformed.
dist/gmkb.css      XXX kB │ gzip:  XX kB
dist/gmkb.iife.js  XXX kB │ gzip: XXX kB
✓ built in XX.XXs
```

**Note:** File sizes will be larger due to Swiper library inclusion (~45KB gzipped).

---

## 🐛 Troubleshooting

### If Build Fails:

**Error: "Cannot find module 'swiper'"**
```powershell
npm install swiper @vueuse/core --save
npm run build
```

**Error: "Cannot find module '@/vue/components/shared/MasonryGrid.vue'"**
- Check that MasonryGrid.vue exists in `src/vue/components/shared/`
- Verify file has no syntax errors
- Run `npm run build` again

**Error: "Unexpected token" or syntax error**
- Check that all `.vue` files have valid syntax
- Look for missing closing tags
- Verify all imports are correct

### If Carousel Doesn't Show:

1. Check browser console for errors
2. Verify Swiper CSS is loaded (inspect element)
3. Check that `layoutStyle === 'carousel'` in component data
4. Verify carouselSettings exists in component data

---

## ✅ Checklist Compliance Verification

After building, verify these architectural principles:

- [ ] **No Polling:** MasonryGrid uses ResizeObserver (event-driven) ✅
- [ ] **Event-Driven:** All updates use @change, lifecycle hooks ✅
- [ ] **No Bloat:** carouselSettings only saved when layoutStyle === 'carousel' ✅
- [ ] **Graceful Fallback:** Missing layoutStyle defaults to 'grid' ✅
- [ ] **Single Source of Truth:** Component JSON stores layout preferences ✅

---

## 📊 What's Left

After successful build and testing:

1. ✅ Photo Gallery Editor - COMPLETE
2. ✅ Photo Gallery Renderer - COMPLETE
3. ⏳ Photo Gallery PHP Template - NOT STARTED
4. ⏳ Logo Grid Editor - NOT STARTED
5. ⏳ Logo Grid Renderer - NOT STARTED
6. ⏳ Logo Grid PHP Template - NOT STARTED

---

## 🎯 Next Steps (After Build Succeeds)

1. Test Photo Gallery layouts in builder
2. Update Photo Gallery PHP template for frontend rendering
3. Replicate changes for Logo Grid component
4. Final testing and documentation

**Please run the build command above and report any errors!**
