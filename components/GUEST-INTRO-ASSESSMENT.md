# Guest Intro Component - Assessment ⚠️

**Date:** October 14, 2025  
**Status:** NEEDS REFACTORING - Duplication Found

---

## Current Fields

### Section 1: Guest Information
1. **Guest Name**
2. **Title / Position**
3. **Company/Organization**

### Section 2: Profile Image ⚠️ DUPLICATE
4. **Profile Image URL** - Has media library integration
5. **Image Position** - Left/Right/Top

### Section 3: Introduction Text
6. **Introduction** - Main text content

### Section 4: Key Talking Points (Conditional)
7. **Show Key Talking Points** (checkbox)
8. **Key Points** (repeatable array)

### Section 5: Guest Links (Conditional) ⚠️ DUPLICATE
9. **Show Guest Links** (checkbox)
10. **Website URL**
11. **LinkedIn URL** - DUPLICATE of Social Links
12. **Book/Product URL**

###Section 6: Display Options
13. **Layout Style** - Side by side/Centered/Card/Minimal

**Total Fields:** 13 (8 always visible + 5 conditional)

---

## Issues Found

### ❌ **Problem 1: Profile Image Duplication**

Guest Intro has its own profile image field with media library integration.

**Question:** Should Guest Intro manage its own images, or use a separate image component?

**Considerations:**
- Guest Intro is specifically for podcast/show guests
- Having image inline makes sense for guest context
- BUT it duplicates media library logic from Biography (which we just removed)

**My Recommendation:** **KEEP the image** - Guest Intro is contextually different from Biography. It's for introducing external guests, not the media kit owner. The image is tightly coupled to the guest intro purpose.

---

### ❌ **Problem 2: Social Links Duplication**

Guest Intro has:
- LinkedIn URL (DUPLICATE)
- Website URL
- Book/Product URL

**Analysis:**
- **LinkedIn** duplicates Social Links component
- **Website** is somewhat generic
- **Book/Product** is unique and relevant to guest promotion

**My Recommendation:** **REMOVE LinkedIn, KEEP Book/Product URL**

**Why keep Book/Product?**
- Very specific to guest promotion
- Not a social platform
- Common use case: "Buy the guest's book"
- Doesn't fit in Social Links component

**Why remove LinkedIn?**
- Duplicates Social Links component
- If you need guest's LinkedIn, use Social Links component

**Website URL?** - Could go either way:
- Option A: Keep it (guest's main site is relevant)
- Option B: Remove it (use Social Links or Contact)
- **My vote: KEEP IT** - Guest website is core to guest intro

---

## Recommended Changes

### ✅ **KEEP (No Changes):**
1. Guest Name
2. Title/Position
3. Company/Organization
4. **Profile Image** ← KEEP (guest-specific context)
5. **Image Position** ← KEEP
6. Introduction Text
7. Show Key Talking Points (checkbox)
8. Key Talking Points (array)
9. Show Guest Links (checkbox)
10. **Website URL** ← KEEP (main guest site)
11. **Book/Product URL** ← KEEP (unique, promotional)
12. Layout Style

### ❌ **REMOVE:**
13. **LinkedIn URL** ← REMOVE (use Social Links component)

---

## Rationale

### Why Guest Intro is Different:

**Guest Intro** is for introducing **external guests** (podcast guests, interviewees):
- Different person than media kit owner
- Temporary/per-episode context
- Promotional focus (buy their book, visit their site)

**Biography** is for **media kit owner** (the speaker/host):
- Permanent identity
- Personal brand
- Use separate components for images/social

**Therefore:**
- Guest Intro can have its own image (guest photo)
- Guest Intro can have website (guest's main site)
- Guest Intro can have book/product (promotion)
- Guest Intro should NOT have LinkedIn (use Social Links if needed)

---

## Final Structure After Refactor

```
Guest Intro Component (12 fields)
├─ Guest Information
│  ├─ Guest Name ✓
│  ├─ Title/Position ✓
│  └─ Company/Organization ✓
├─ Profile Image
│  ├─ Image URL ✓ (guest-specific)
│  └─ Image Position ✓
├─ Introduction Text
│  └─ Introduction ✓
├─ Key Talking Points (Optional)
│  ├─ Show Key Points ✓
│  └─ Points Array ✓
├─ Guest Links (Optional)
│  ├─ Show Links ✓
│  ├─ Website URL ✓ (guest's main site)
│  ├─ LinkedIn URL ❌ REMOVE
│  └─ Book/Product URL ✓ (promotional)
└─ Display Options
   └─ Layout Style ✓
```

**Before:** 13 fields  
**After:** 12 fields  
**Removed:** 1 field (LinkedIn URL)

---

##Recommendation

**REMOVE LinkedIn URL only**

**Why this approach:**
1. ✅ Eliminates LinkedIn duplication
2. ✅ Keeps guest-specific fields (image, website, book)
3. ✅ Maintains Guest Intro's unique purpose
4. ✅ Doesn't break the guest introduction workflow

---

**Proceed with removal?** Y/N
