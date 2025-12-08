# PROFILE PHOTO COMPONENT - QUICK TEST CHECKLIST ✅
**Fast verification for Profile Photo / Photo Gallery separation**

---

## ⚡ 5-MINUTE SMOKE TEST

### 1. Component Discovery (1 min)
```javascript
// In browser console:
fetch('/wp-json/gmkb/v1/components/discover')
  .then(r => r.json())
  .then(data => {
    const found = data.find(c => c.type === 'profile-photo');
    console.log(found ? '✅ FOUND' : '❌ NOT FOUND', found);
  });
```
- [ ] Returns component object
- [ ] `type: "profile-photo"`
- [ ] `name: "Profile Photo"`
- [ ] `available: true`

---

### 2. Palette Appearance (1 min)
- [ ] Open media kit builder
- [ ] Check component palette
- [ ] "Profile Photo" appears in Media category
- [ ] Icon shows user circle (fa-solid fa-user-circle)

---

### 3. Basic Functionality (2 min)
- [ ] Drag Profile Photo to canvas
- [ ] Component renders (either photo or placeholder)
- [ ] Click component
- [ ] Editor sidebar opens
- [ ] Content/Style tabs visible

---

### 4. Console Check (1 min)
- [ ] No red errors
- [ ] See: `✅ SINGLE FIELD PATTERN: Profile Photo Data Integration loaded`
- [ ] No "undefined" warnings

---

## 📋 10-MINUTE INTEGRATION TEST

### Test A: Pods Data Loading (3 min)
**If Pods CPT has profile_photo:**
- [ ] Profile Photo component shows image automatically
- [ ] Image URL is correct
- [ ] Caption displays (if exists)

**If Pods CPT is empty:**
- [ ] Shows placeholder with user icon
- [ ] Message: "No profile photo available"

**Console verification:**
```javascript
// Check Pods data:
window.gmkbStore.podsData.profile_photo
// Should show image URL or be undefined
```

---

### Test B: Editor Functionality (3 min)
- [ ] Click Profile Photo component
- [ ] **Content Tab:**
  - [ ] Pods toggle present (if Pods has data)
  - [ ] Custom photo URL input works
  - [ ] Preview updates as you type
- [ ] **Style Tab:**
  - [ ] Shape selector (circle/square/rounded)
  - [ ] Size selector (small/medium/large)
  - [ ] Changes apply to preview

---

### Test C: Data Independence (3 min)
- [ ] Add Profile Photo component
- [ ] Add Photo Gallery component
- [ ] Profile shows SINGLE image
- [ ] Gallery shows MULTIPLE images
- [ ] No data mixing
- [ ] Both function independently

---

### Test D: Persistence (1 min)
- [ ] Add custom photo URL
- [ ] Save media kit
- [ ] Reload page
- [ ] Custom photo still there ✅

---

## 🎯 30-MINUTE COMPREHENSIVE TEST

### Phase 1: Empty State Testing (5 min)
**Scenario:** New media kit, no Pods data
- [ ] Add Profile Photo component
- [ ] Shows placeholder state
- [ ] No errors in console
- [ ] Click to edit
- [ ] Can add custom photo URL
- [ ] Preview shows custom photo

---

### Phase 2: Pods Data Testing (5 min)
**Scenario:** Pods CPT has profile_photo populated
- [ ] Add Profile Photo component
- [ ] Automatically loads Pods image
- [ ] Image displays correctly
- [ ] Caption shows (if exists)
- [ ] Console shows: `✅ Profile Photo: Enriched props for post X`

---

### Phase 3: Hybrid Testing (5 min)
**Scenario:** Mix of Pods and custom data
- [ ] Component shows Pods photo initially
- [ ] Turn off "Use Pods data" toggle
- [ ] Add custom photo URL
- [ ] Custom photo displays
- [ ] Turn toggle back on
- [ ] Pods photo returns

---

### Phase 4: Gallery Independence (5 min)
**Scenario:** Both components in same media kit
- [ ] Add Profile Photo (top of kit)
- [ ] Add Photo Gallery (middle of kit)
- [ ] Profile shows ONE image
- [ ] Gallery shows MULTIPLE images
- [ ] Edit Profile Photo → Gallery unaffected
- [ ] Edit Gallery → Profile unaffected
- [ ] No "profile_photo" in Gallery editor

**Verify Photo Gallery:**
```javascript
// Check Photo Gallery component data:
// Should ONLY have gallery_photos, NO profile_photo
```

---

### Phase 5: Multiple Instances (5 min)
**Scenario:** Multiple Profile Photo components
- [ ] Add Profile Photo #1
- [ ] Add Profile Photo #2
- [ ] Both function independently
- [ ] Edit #1 → #2 unaffected
- [ ] Different photos possible
- [ ] Different settings possible

---

### Phase 6: Frontend Rendering (5 min)
**Scenario:** Preview vs Frontend consistency
- [ ] Save media kit
- [ ] View on frontend
- [ ] Profile photo displays correctly
- [ ] Size matches settings
- [ ] Shape matches settings
- [ ] Caption shows (if exists)
- [ ] No 404 image errors
- [ ] Builder preview === Frontend display

---

## 🚨 FAILURE CONDITIONS

### STOP TESTING IF YOU SEE:

#### Critical Failures:
- ❌ Component doesn't appear in palette
- ❌ Console error: "profile_photo" in PhotoGalleryEditor
- ❌ PHP fatal errors in data-integration.php
- ❌ Vue compilation errors

#### Major Issues:
- ❌ Pods photo doesn't load when it should
- ❌ Custom photo doesn't persist after save
- ❌ Gallery shows profile photo
- ❌ Profile shows gallery photos
- ❌ Editor doesn't open

#### Minor Issues (Fix but not blockers):
- ⚠️ Styling inconsistencies
- ⚠️ Missing captions
- ⚠️ Slow loading
- ⚠️ Console warnings (not errors)

---

## 🔧 QUICK DEBUG COMMANDS

### Check Component Registration:
```javascript
fetch('/wp-json/gmkb/v1/components/profile-photo/manifest')
  .then(r => r.json())
  .then(d => console.log(d));
```

### Check Pods Data:
```javascript
console.log('Profile Photo:', window.gmkbStore.podsData.profile_photo);
console.log('Gallery Photos:', window.gmkbStore.podsData.gallery_photos);
```

### Check Component Data:
```javascript
// Get component instance
const components = window.gmkbStore.components;
const profilePhotoComponents = Object.values(components)
  .filter(c => c.type === 'profile-photo');
console.log('Profile Photo Components:', profilePhotoComponents);
```

### Check Filter Hook:
```php
// In PHP (WP-CLI or snippet):
add_filter('gmkb_enrich_profile-photo_props', function($props, $post_id) {
    error_log('✅ Profile Photo filter fired for post: ' . $post_id);
    error_log(print_r($props, true));
    return $props;
}, 20, 2);
```

---

## ✅ TEST RESULTS LOG

### Test Run #1 - Date: ___________
- [ ] 5-min smoke test: PASS / FAIL
- [ ] 10-min integration test: PASS / FAIL
- [ ] 30-min comprehensive test: PASS / FAIL

**Issues Found:**
1. _________________________________
2. _________________________________
3. _________________________________

**Console Errors:**
```
(paste errors here)
```

**Next Actions:**
- [ ] Fix issue #1
- [ ] Fix issue #2
- [ ] Retest

---

## 📊 PASS/FAIL CRITERIA

### ✅ PASS = All of these true:
- Component appears in palette
- Pods data loads correctly
- Custom data works
- Editor functions properly
- Gallery is independent
- Frontend renders correctly
- No console errors
- Data persists after save

### ❌ FAIL = Any of these true:
- Component not discoverable
- PHP errors in data-integration.php
- Vue compilation errors
- Pods data doesn't load
- Gallery shows profile photo
- Editor doesn't open
- Critical console errors

---

## 📞 TROUBLESHOOTING QUICK REFERENCE

### Issue: Component Not in Palette
**Fix:** Check component.json syntax, rebuild, clear cache

### Issue: Pods Data Not Loading
**Fix:** Verify field name is `profile_photo`, check filter hook

### Issue: Editor Not Opening
**Fix:** Check ProfilePhotoEditor.vue path in component.json

### Issue: Gallery Has Profile Photo
**Fix:** Check PhotoGalleryEditor.vue for any profile_photo references

---

## 🎯 SUCCESS CHECKLIST

### Backend Files:
- [x] component.json exists
- [x] pods-config.json exists
- [x] data-integration.php exists

### Vue Components:
- [x] ProfilePhotoRenderer.vue exists
- [x] ProfilePhotoEditor.vue exists
- [x] schema.json exists

### Functionality:
- [ ] Component discoverable
- [ ] Pods data loads
- [ ] Custom data works
- [ ] Editor functions
- [ ] Gallery independent
- [ ] Frontend renders

### Quality:
- [ ] No console errors
- [ ] No PHP errors
- [ ] Data persists
- [ ] Tests pass

---

**Total Testing Time:**
- Smoke test: 5 minutes
- Integration test: 10 minutes
- Comprehensive test: 30 minutes
- **TOTAL: ~45 minutes** (with no issues)

**If issues found:** Add 30-60 minutes for debugging and fixes

---

**Last Updated:** October 31, 2025  
**Status:** Ready for testing  
**Next Step:** Run 5-minute smoke test first
