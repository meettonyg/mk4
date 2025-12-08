# Profile Photo Not Showing - Complete Diagnostic

## 🔍 Quick Diagnostic Script

**Copy and paste this into the browser console:**

```javascript
console.log('🔍 === PROFILE PHOTO COMPLETE DIAGNOSTIC ===');

// 1. Check Pods Data
const podsData = window.GMKB?.stores?.mediaKit?.podsData;
console.log('\n1️⃣ PODS DATA CHECK:');
console.log('  Pods data exists:', !!podsData);
console.log('  profile_photo field:', podsData?.profile_photo);
console.log('  Type:', typeof podsData?.profile_photo);

// If it's an object, show its properties
if (typeof podsData?.profile_photo === 'object' && podsData?.profile_photo) {
  console.log('  Properties:', Object.keys(podsData.profile_photo));
  console.log('  Full object:', podsData.profile_photo);
}

// 2. Check MediaKit Store Components
const store = window.GMKB?.stores?.mediaKit;
console.log('\n2️⃣ COMPONENT IN STORE:');
if (store) {
  const profilePhotoComps = Object.entries(store.components || {})
    .filter(([id, comp]) => comp.type === 'profile-photo');
  
  console.log('  Profile photo components found:', profilePhotoComps.length);
  
  profilePhotoComps.forEach(([id, comp]) => {
    console.log(`\n  Component ${id}:`);
    console.log('    Type:', comp.type);
    console.log('    Data:', comp.data);
    console.log('    usePodsData:', comp.data?.usePodsData);
    console.log('    Has photo:', comp.data?.photo);
    console.log('    Settings:', comp.settings);
  });
}

// 3. Check DOM Elements
console.log('\n3️⃣ DOM ELEMENTS:');
const profileElements = document.querySelectorAll('[data-component-type="profile-photo"]');
console.log('  Elements found:', profileElements.length);

profileElements.forEach((el, i) => {
  console.log(`\n  Element ${i}:`);
  console.log('    Component ID:', el.dataset.componentId);
  console.log('    Classes:', el.className);
  console.log('    Visible:', el.offsetParent !== null);
  console.log('    Display:', getComputedStyle(el).display);
  
  // Check for placeholder vs actual image
  const placeholder = el.querySelector('.profile-photo-placeholder');
  const container = el.querySelector('.profile-photo-container');
  const img = el.querySelector('.profile-photo-image');
  
  console.log('    Has placeholder:', !!placeholder);
  console.log('    Has container:', !!container);
  console.log('    Has img:', !!img);
  
  if (img) {
    console.log('    Image src:', img.src);
    console.log('    Image alt:', img.alt);
    console.log('    Image classes:', img.className);
    console.log('    Image display:', getComputedStyle(img).display);
    console.log('    Image visibility:', getComputedStyle(img).visibility);
  }
  
  if (placeholder) {
    console.log('    Placeholder text:', placeholder.textContent.trim());
  }
});

// 4. Check usePodsData composable state
console.log('\n4️⃣ USE PODS DATA COMPOSABLE:');
console.log('  Store podsData keys:', Object.keys(podsData || {}));
console.log('  Fields with "photo":', Object.keys(podsData || {}).filter(k => k.includes('photo')));

// 5. Component Registry Check
const registry = window.GMKB?.services?.registry;
console.log('\n5️⃣ COMPONENT REGISTRY:');
if (registry) {
  const profilePhotoReg = registry.get('profile-photo');
  console.log('  Profile photo registered:', !!profilePhotoReg);
  if (profilePhotoReg) {
    console.log('  Registry entry:', profilePhotoReg);
  }
}

console.log('\n🔍 === DIAGNOSTIC COMPLETE ===');
console.log('\nCopy all output above and send for analysis');
```

---

## 🎯 Quick Checks (Manual)

### Check 1: Is profile_photo in Pods data?

In console:
```javascript
window.GMKB.stores.mediaKit.podsData.profile_photo
```

**Expected:** An object like `{ID: 123, guid: "https://...", ...}` OR a number (attachment ID) OR a URL string

**If undefined:** The Pods field is empty or doesn't exist

---

### Check 2: Is the component set to use Pods?

```javascript
Object.values(window.GMKB.stores.mediaKit.components).filter(c => c.type === 'profile-photo')
```

Look for `usePodsData: true` in the data object.

**If false:** Component won't use Pods data, looking for custom photo instead

---

### Check 3: What's on the page?

Right-click the profile photo area → Inspect Element

**If you see:**
- `<div class="profile-photo-placeholder">` → No photo detected
- `<div class="profile-photo-container"><img...>` → Image exists but might not be loading

---

## 🔧 Common Issues & Fixes

### Issue 1: profile_photo field is empty

**Diagnosis:**
```javascript
!window.GMKB.stores.mediaKit.podsData.profile_photo
```

**Fix:** Upload a profile photo in WordPress admin:
1. Edit the media kit post
2. Find "Profile Photo" field (Pods field)
3. Upload/select an image
4. Save post
5. Refresh media kit page

---

### Issue 2: Component not using Pods data

**Diagnosis:**
```javascript
// Check component settings
const comp = Object.values(window.GMKB.stores.mediaKit.components).find(c => c.type === 'profile-photo');
comp.data.usePodsData === false  // or undefined
```

**Fix:** Toggle "Use Pods Data" in the component editor:
1. Click the profile photo component in the builder
2. In the editor panel, enable "Use Pods Data"
3. Save

---

### Issue 3: Image URL is broken

**Diagnosis:**
```javascript
const photo = window.GMKB.stores.mediaKit.podsData.profile_photo;
// If URL looks like: &amp; or &#x2F; or has HTML entities
```

**Already Fixed in Code:** The `sanitizedPhotoUrl` computed property decodes HTML entities.

If still broken, check:
```javascript
document.querySelector('.profile-photo-image').src
```

---

### Issue 4: Image exists but is hidden by CSS

**Diagnosis:**
```javascript
const img = document.querySelector('.profile-photo-image');
getComputedStyle(img).display  // Should be block or inline
getComputedStyle(img).visibility  // Should be visible
getComputedStyle(img).opacity  // Should be 1
```

**Fix:** Check for conflicting CSS or theme styles

---

## 🚀 Next Steps

1. **Run the diagnostic script** (copy/paste into console)
2. **Copy ALL the output**
3. **Send the output** along with:
   - What you see on the page (placeholder text? broken image?)
   - Screenshot of the area where photo should be
   - Any console errors (red text)

---

## 📋 Expected Working State

When profile photo is working correctly:

```javascript
// Pods data should have:
podsData.profile_photo = {
  ID: 123,
  guid: "https://yoursite.com/wp-content/uploads/...",
  post_title: "Profile Photo"
}
// OR just the URL string
// OR just the attachment ID

// Component should have:
component.data.usePodsData = true

// DOM should show:
<div class="profile-photo-component has-photo pods-source">
  <div class="profile-photo-container">
    <img src="https://..." class="profile-photo-image photo-shape-circle photo-size-medium">
  </div>
</div>
```

---

## 🔍 Most Likely Causes

Based on architecture:

1. **90% probability:** `profile_photo` Pods field is empty
   - **Fix:** Upload photo in WordPress admin

2. **8% probability:** Component `usePodsData` is false
   - **Fix:** Toggle setting in component editor

3. **2% probability:** CSS/rendering issue
   - **Fix:** Inspect element, check styles

---

**Run the diagnostic and send the output!** That will tell us exactly what's happening.
