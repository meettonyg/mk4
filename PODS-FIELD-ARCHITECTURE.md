# Pods Field Architecture - Single vs Repeatable Fields

**Date:** October 30, 2025  
**Critical Reference:** Understanding Pods Field Types

---

## 🎯 **Critical Distinction**

Pods fields come in TWO fundamentally different types that MUST be handled differently:

### **1. Single Fields (ONE attachment)**
Returns a single attachment object or attachment ID

**Examples:**
- `personal_brand_logo` - ONE logo
- `company_logo` - ONE logo
- `profile_photo` - ONE photo
- `video_intro` - ONE URL

**Data Structure:**
```javascript
// Single field returns ONE object/ID (NOT an array)
{
  ID: 123,
  guid: "https://example.com/logo.png",
  post_title: "Company Logo",
  url: "https://example.com/logo.png"
}

// OR just an ID:
123
```

**Correct Handling:**
```javascript
// ✅ CORRECT - Single field
const personalLogo = podsData.value?.personal_brand_logo;
if (personalLogo) {
  // It's ONE object or ID, not an array
  const logoUrl = typeof personalLogo === 'object' 
    ? (personalLogo.guid || personalLogo.url)
    : personalLogo;
}
```

**Wrong Handling:**
```javascript
// ❌ WRONG - Don't iterate single fields
const personalLogo = podsData.value?.personal_brand_logo;
if (personalLogo && Array.isArray(personalLogo)) { // This will be false!
  personalLogo.forEach(...) // Will never execute
}
```

---

### **2. Repeatable Fields (ARRAY of attachments)**
Returns an **array** of attachment objects or attachment IDs

**Examples:**
- `featured_logos` - ARRAY of logos
- `gallery_photos` - ARRAY of photos

**Data Structure:**
```javascript
// Repeatable field returns ARRAY of objects/IDs
[
  {
    ID: 123,
    guid: "https://example.com/logo1.png",
    post_title: "Client Logo 1",
    url: "https://example.com/logo1.png"
  },
  {
    ID: 124,
    guid: "https://example.com/logo2.png",
    post_title: "Client Logo 2",
    url: "https://example.com/logo2.png"
  }
]

// OR array of IDs:
[123, 124, 125]
```

**Correct Handling:**
```javascript
// ✅ CORRECT - Repeatable field
const featuredLogos = podsData.value?.featured_logos;
if (featuredLogos && Array.isArray(featuredLogos) && featuredLogos.length > 0) {
  // It's an ARRAY, so iterate through it
  featuredLogos.forEach((logo, index) => {
    const logoUrl = typeof logo === 'object'
      ? (logo.guid || logo.url)
      : logo;
  });
}
```

**Wrong Handling:**
```javascript
// ❌ WRONG - Don't treat repeatable as single
const featuredLogos = podsData.value?.featured_logos;
const logoUrl = featuredLogos.guid; // Will be undefined! It's an array, not an object
```

---

## 📊 **Field Type Reference Table**

| Field Name | Type | Returns | Max Count | Use Case |
|------------|------|---------|-----------|----------|
| `personal_brand_logo` | Single | Object/ID | 1 | Personal logo |
| `company_logo` | Single | Object/ID | 1 | Company logo |
| `profile_photo` | Single | Object/ID | 1 | Main headshot |
| `video_intro` | Single | String | 1 | Video URL |
| `featured_logos` | Repeatable | Array | 50 | Client/partner logos |
| `gallery_photos` | Repeatable | Array | 50 | Photo collection |

---

## 🏗️ **Implementation Pattern**

### **For Single Fields:**
```javascript
// Load single attachment
const singleField = podsData.value?.field_name;
if (singleField) {
  // Handle object or ID
  const url = typeof singleField === 'object'
    ? (singleField.guid || singleField.url)
    : singleField;
  const name = typeof singleField === 'object'
    ? (singleField.post_title || 'Default Name')
    : 'Default Name';
  
  // Use url and name...
}
```

### **For Repeatable Fields:**
```javascript
// Load array of attachments
const repeatableField = podsData.value?.field_name;
if (repeatableField && Array.isArray(repeatableField) && repeatableField.length > 0) {
  // Iterate through array
  repeatableField.forEach((item, index) => {
    if (item) {
      const url = typeof item === 'object'
        ? (item.guid || item.url)
        : item;
      const name = typeof item === 'object'
        ? (item.post_title || `Item ${index + 1}`)
        : `Item ${index + 1}`;
      
      // Use url and name...
    }
  });
}
```

---

## 🔧 **PHP Backend (data-integration.php)**

### **Loading Single Fields:**
```php
// Use get_post_meta() with third parameter = true (single value)
$personal_logo_id = get_post_meta($post_id, 'personal_brand_logo', true);
if ($personal_logo_id) {
    $personal_url = wp_get_attachment_url($personal_logo_id);
    // Returns ONE URL string
}
```

### **Loading Repeatable Fields:**
```php
// Use get_post_meta() with third parameter = false (array)
$featured_logos = get_post_meta($post_id, 'featured_logos', false);
if (!empty($featured_logos) && is_array($featured_logos)) {
    foreach ($featured_logos as $logo_data) {
        // Each $logo_data is one attachment
        if (is_numeric($logo_data)) {
            $logo_url = wp_get_attachment_url($logo_data);
        }
    }
}
```

---

## ⚠️ **Common Mistakes to Avoid**

### **Mistake #1: Treating Single as Array**
```javascript
// ❌ WRONG
const profilePhoto = podsData.value?.profile_photo;
profilePhoto.forEach(...) // Error! It's not an array
```

### **Mistake #2: Treating Array as Single**
```javascript
// ❌ WRONG
const galleryPhotos = podsData.value?.gallery_photos;
const photoUrl = galleryPhotos.guid; // Undefined! It's an array
```

### **Mistake #3: Not Checking Array Length**
```javascript
// ❌ WRONG
if (featuredLogos && Array.isArray(featuredLogos)) {
  // Might still be empty array []
}

// ✅ CORRECT
if (featuredLogos && Array.isArray(featuredLogos) && featuredLogos.length > 0) {
  // Definitely has items
}
```

### **Mistake #4: Using Wrong get_post_meta Parameter**
```php
// ❌ WRONG - Will only get first item of repeatable field
$featured_logos = get_post_meta($post_id, 'featured_logos', true);

// ✅ CORRECT - Gets all items
$featured_logos = get_post_meta($post_id, 'featured_logos', false);
```

---

## 🎯 **Component Implementation Checklist**

When implementing Pods integration for ANY component:

### **Step 1: Identify Field Types**
- [ ] List all Pods fields the component needs
- [ ] Mark each as SINGLE or REPEATABLE
- [ ] Document max count for repeatable fields

### **Step 2: PHP Backend (data-integration.php)**
- [ ] Use `get_post_meta($id, $field, true)` for single fields
- [ ] Use `get_post_meta($id, $field, false)` for repeatable fields
- [ ] Check `is_array()` for repeatable fields
- [ ] Use `foreach` only for repeatable fields

### **Step 3: Vue Frontend (ComponentEditor.vue)**
- [ ] Check if field exists before accessing
- [ ] For single: Access directly (no iteration)
- [ ] For repeatable: Check `Array.isArray()` AND `length > 0`
- [ ] Use `forEach` only for repeatable fields
- [ ] Handle both object and ID formats

### **Step 4: Testing**
- [ ] Test with 0 items (empty)
- [ ] Test with 1 item (single and repeatable)
- [ ] Test with multiple items (repeatable only)
- [ ] Test with max items (repeatable only)
- [ ] Verify data structure in console

---

## 📝 **Real-World Examples**

### **Logo Grid Component:**
```javascript
// SINGLE fields (2)
- personal_brand_logo  → 1 logo
- company_logo         → 1 logo

// REPEATABLE field (1)
- featured_logos       → 0-50 logos

Total logos displayed: 2 + (0 to 50) = 2 to 52 logos
```

### **Photo Gallery Component:**
```javascript
// SINGLE field (1)
- profile_photo        → 1 photo

// REPEATABLE field (1)
- gallery_photos       → 0-50 photos

Total photos displayed: 1 + (0 to 50) = 1 to 51 photos
```

### **Video Intro Component:**
```javascript
// SINGLE field (1)
- video_intro          → 1 URL string

// REPEATABLE fields (0)
None

Total videos displayed: 1 video
```

---

## 🚀 **Best Practices**

1. **Always Check Type:** Don't assume - check if value is object, ID, or array
2. **Use Explicit Checks:** `Array.isArray()` AND `length > 0` for arrays
3. **Handle Both Formats:** Pods can return objects OR IDs
4. **Fallback Values:** Always provide defaults for missing names/titles
5. **Comment Your Code:** Mark fields as SINGLE or REPEATABLE in comments
6. **Consistent Patterns:** Use same handling approach across all components
7. **Test Edge Cases:** Empty, single, multiple, max items

---

## 🎓 **Key Takeaway**

**Single Field = One Thing (object/ID)**  
**Repeatable Field = Array of Things ([object/ID, object/ID, ...])**

**Never confuse the two!** Different data structures require different handling approaches.

---

**Remember:** This distinction is CRITICAL for correct Pods integration. When in doubt, console.log the field value to see its actual structure before writing handler code.

