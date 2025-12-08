# Profile Photo Quick Fix Guide

## 🎯 TL;DR - Most Likely Causes

**99% of the time, it's one of these:**

### 1. Pods Field is Empty (90% probability)
**Check:**
```javascript
window.GMKB.stores.mediaKit.podsData.profile_photo
```

**If `undefined` or empty → Fix:**
1. Go to WordPress Admin
2. Edit your media kit post
3. Find "Profile Photo" Pods field
4. Upload/select image
5. Save post
6. Refresh media kit page

---

### 2. Component Not Using Pods Data (8% probability)
**Check:**
```javascript
Object.values(window.GMKB.stores.mediaKit.components).find(c => c.type === 'profile-photo')?.data?.usePodsData
```

**If `false` or `undefined` → Fix:**
1. Click profile photo component in builder
2. In editor panel, toggle "Use Pods Data" ON
3. Save

---

### 3. Component Doesn't Exist (1% probability)
**Check:**
```javascript
Object.values(window.GMKB.stores.mediaKit.components).filter(c => c.type === 'profile-photo').length
```

**If `0` → Fix:**
1. Click "Add Component" in builder
2. Select "Profile Photo"
3. Add to section
4. Configure settings

---

### 4. CSS Hiding It (1% probability)
**Check:**
```javascript
document.querySelector('.profile-photo-image')
```

**If exists but not visible → Check theme/CSS conflicts**

---

## ⚡ One-Line Diagnostic

**Run this first:**

```javascript
console.log('Photo:', window.GMKB.stores.mediaKit.podsData.profile_photo, 'UsePods:', Object.values(window.GMKB.stores.mediaKit.components).find(c => c.type === 'profile-photo')?.data?.usePodsData);
```

**Results tell you:**
- `Photo: undefined` = No photo uploaded (Fix #1)
- `Photo: {...}, UsePods: false` = Component not using Pods (Fix #2)
- `Photo: {...}, UsePods: true` = Data exists, component configured correctly → CSS/rendering issue

---

## 🔧 Complete Diagnostic (If Quick Checks Don't Help)

See **PROFILE-PHOTO-DIAGNOSTIC-COMPLETE.md** for full diagnostic script.

---

## 📸 What a Working Profile Photo Looks Like

**In Console:**
```javascript
// Pods data has photo:
window.GMKB.stores.mediaKit.podsData.profile_photo
// Output: {ID: 123, guid: "https://...", ...} OR "https://..." OR 123

// Component uses Pods:
Object.values(window.GMKB.stores.mediaKit.components).find(c => c.type === 'profile-photo').data.usePodsData
// Output: true

// DOM shows image:
document.querySelector('.profile-photo-image').src
// Output: "https://yoursite.com/wp-content/uploads/..."
```

**On Page:**
- You see the profile photo image
- No placeholder icon
- No "No profile photo available" text

---

## 🚀 Still Not Working?

Run the complete diagnostic and send output:

1. Open browser console (F12)
2. Copy/paste diagnostic from **PROFILE-PHOTO-DIAGNOSTIC-COMPLETE.md**
3. Copy ALL the output
4. Send it along with a screenshot

That will show exactly what's happening.
