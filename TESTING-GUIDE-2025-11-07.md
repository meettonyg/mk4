# TESTING GUIDE - Component Refactoring

**Date:** November 7, 2025  
**Components Fixed:** 7/7 (Social, Stats, Testimonials, Video-Intro, Photo-Gallery, Call-to-Action, Logo-Grid)

---

## 🚀 QUICK START

### Step 1: Build the Project
```bash
cd C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4
npm run build
```

### Step 2: Clear WordPress Caches
- Clear browser cache (Ctrl+Shift+Delete)
- Clear WordPress object cache if using caching plugin
- Disable caching plugins temporarily for testing

---

## 🧪 TESTING CHECKLIST

### Test Each Fixed Component (7 Components)

For each component below, perform these tests:

#### 1. Social ✅
- [ ] Add Social component to media kit
- [ ] Component renders without errors
- [ ] Pods social links display correctly (Facebook, Twitter, LinkedIn, etc.)
- [ ] Custom social links can be added
- [ ] Links open in new tabs
- [ ] Icons display correctly

#### 2. Stats ✅
- [ ] Add Stats component to media kit
- [ ] Component renders without errors
- [ ] Pods stats display (years_experience, presentations, audiences, events, etc.)
- [ ] Custom stats can be added
- [ ] Stats format correctly (numbers and labels)
- [ ] Title is editable

#### 3. Testimonials ✅
- [ ] Add Testimonials component to media kit
- [ ] Component renders without errors
- [ ] Pods testimonials display (testimonial_1-10)
- [ ] Shows author names and titles
- [ ] Custom testimonials can be added
- [ ] Grid layout displays correctly

#### 4. Video-Intro ✅
- [ ] Add Video-Intro component to media kit
- [ ] Component renders without errors
- [ ] Pods video URL displays (video_intro_url)
- [ ] Custom video URL works
- [ ] Video iframe embeds correctly
- [ ] Description displays if provided

#### 5. Photo-Gallery ✅
- [ ] Add Photo-Gallery component to media kit
- [ ] Component renders without errors
- [ ] Pods photos display (gallery_photo_1-20)
- [ ] Custom photos can be added
- [ ] Captions display correctly
- [ ] Grid layout responsive

#### 6. Call-to-Action ✅
- [ ] Add Call-to-Action component to media kit
- [ ] Component renders without errors
- [ ] Pods CTA buttons display (cta_button_1-5)
- [ ] Custom buttons can be added
- [ ] Button styles apply correctly
- [ ] Links work correctly

#### 7. Logo-Grid ✅
- [ ] Add Logo-Grid component to media kit
- [ ] Component renders without errors
- [ ] Pods logos display (featured_logo_1-20)
- [ ] Custom logos can be added
- [ ] Logo names display on hover
- [ ] Grid layout responsive

---

## 🔍 DETAILED TESTING SCENARIOS

### Scenario 1: Fresh Install (No Pods Data)
**Purpose:** Verify components handle missing data gracefully

1. Create new media kit
2. Add all 7 fixed components
3. **Expected:** Components render empty state or placeholder content
4. **Expected:** No console errors
5. **Expected:** Components can accept custom data

### Scenario 2: With Pods Data
**Purpose:** Verify Pods integration works

1. Ensure Pods fields have data populated
2. Add all 7 fixed components
3. **Expected:** Pods data displays automatically
4. **Expected:** Data is correctly formatted
5. **Expected:** No duplication of data

### Scenario 3: Custom Data Override
**Purpose:** Verify custom data takes priority

1. Add component with Pods data
2. Override with custom data in component settings
3. **Expected:** Custom data displays instead of Pods
4. **Expected:** Can switch back to Pods data
5. **Expected:** Save/load works correctly

### Scenario 4: Frontend Display
**Purpose:** Verify frontend rendering matches builder

1. Create media kit with all components
2. Save and view on frontend
3. **Expected:** All components display correctly
4. **Expected:** Styling matches builder preview
5. **Expected:** Data is consistent between builder and frontend

---

## 🐛 COMMON ISSUES TO CHECK

### Console Errors
**Check for:**
- ❌ "Cannot read property 'value' of undefined"
- ❌ "props.data is not defined"
- ❌ "usePodsData is not a function"
- ✅ Should see: "Component mounted: [component-id]"

### Data Display Issues
**Check for:**
- ❌ Empty components when Pods data exists
- ❌ Duplicate data display
- ❌ Data not updating after save
- ✅ Should see: Pods data or custom data displaying correctly

### Props Warnings
**Check for:**
- ❌ "Unknown custom element" warnings
- ❌ "Invalid prop" warnings
- ❌ "Missing required prop" warnings
- ✅ Should see: No prop-related warnings

---

## 📊 VERIFICATION COMMANDS

### Check Component Registration
Open browser console and run:
```javascript
// Check if all components are registered
Object.keys(GMKB.components).length
// Should be: 19

// Check specific component
GMKB.components['social']
GMKB.components['stats']
// Should return: component definition objects
```

### Check Pods Data Loading
```javascript
// Check if Pods data loaded
window.gmkbData?.pods_data
// Should return: object with Pods fields

// Check specific fields
window.gmkbData?.pods_data?.facebook_url
window.gmkbData?.pods_data?.testimonial_1_text
// Should return: actual data or undefined
```

### Enable Debug Mode
```javascript
window.gmkbDebug = true;
// Then reload page and watch console for detailed logs
```

---

## ✅ SUCCESS CRITERIA

### All Tests Pass When:
- [ ] All 7 components add without errors
- [ ] Pods data displays correctly in all components
- [ ] Custom data overrides work
- [ ] No console errors or warnings
- [ ] Frontend display matches builder preview
- [ ] Save/load functionality works
- [ ] Theme switching works correctly
- [ ] Responsive design works on mobile

---

## 🚨 IF TESTS FAIL

### Step 1: Check Build
```bash
# Rebuild Vue components
npm run build

# Check for build errors
# Should complete without errors
```

### Step 2: Check Browser Console
```javascript
// Look for specific error messages
// Common issues:
// - Import path errors
// - Missing dependencies
// - Props validation errors
```

### Step 3: Clear All Caches
```bash
# Clear WordPress caches
# Clear browser cache
# Reload page with Ctrl+F5 (hard refresh)
```

### Step 4: Verify File Changes
```bash
# Check that all 7 files were updated:
components/social/SocialRenderer.vue
components/stats/StatsRenderer.vue
components/testimonials/TestimonialsRenderer.vue
components/video-intro/VideoIntroRenderer.vue
components/photo-gallery/PhotoGalleryRenderer.vue
components/call-to-action/CallToActionRenderer.vue
components/logo-grid/LogoGridRenderer.vue
```

---

## 📝 REPORTING ISSUES

If you find issues, report with:
1. **Component Name** (e.g., Social, Stats)
2. **Error Message** (from console)
3. **Steps to Reproduce**
4. **Expected vs Actual Behavior**
5. **Browser & Version**
6. **WordPress Version**

---

## 🎯 EXPECTED OUTCOME

After all tests pass:
- ✅ 19/19 components working
- ✅ 0 console errors
- ✅ 0 data display issues
- ✅ 100% Pods integration working
- ✅ Frontend/builder consistency maintained
- ✅ Ready for production deployment

---

**Good luck with testing! 🚀**
