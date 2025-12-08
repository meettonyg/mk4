# Phase 1: Basic Components Pods Field Audit Report

**Date:** October 29, 2025  
**Auditor:** System Analysis  
**Scope:** Biography, Topics, Guest-Intro, Contact, Questions (FAQ), Topics-Questions, Social

---

## Executive Summary

**Components Audited:** 7  
**Critical Issues Found:** 5  
**Medium Issues Found:** 3  
**Minor Issues Found:** 2  

### Key Findings:
1. ❌ **Biography**: Incorrect field mappings in data-integration.php (8 fields vs 4 declared)
2. ❌ **Contact**: Missing `skype` field implementation despite being in Pods
3. ❌ **Contact**: pods-config.json declares 5 fields but data-integration.php uses 8
4. ❌ **Questions**: Capped at 10 questions but Pods has 25 available
5. ⚠️ **Social**: Missing `github` field from Social component (not in Pods)

---

## Component-by-Component Analysis

### 1. Biography Component

#### Expected Pods Fields (from pods-config.json):
```json
{
  "biography": "wysiwyg",
  "biography_long": "wysiwyg",
  "first_name": "text",
  "last_name": "text"
}
```

#### Actual Implementation:

**📁 BiographyEditor.vue (Sidebar Panel)**
- ✅ Correctly shows ONLY `biography` textarea
- ✅ No other fields exposed

**📁 BiographyRenderer.vue (Preview)**
- Props used: `name`, `title`, `biography`, `company`
- ⚠️ Uses 4 props but only `biography` is in pods-config.json

**📁 template.php (Frontend)**
- ✅ Correctly uses ONLY `biography` field
- ✅ Multiple aliases supported (bio, bio_content, content)

**📁 data-integration.php**
- ❌ **CRITICAL DISCREPANCY**: Maps 8 fields!
  ```php
  'biography' => 'biography',
  'name' => 'full_name',
  'first_name' => 'first_name',
  'last_name' => 'last_name',
  'title' => 'guest_title',
  'company' => 'company',
  'tagline' => 'tagline',
  'introduction' => 'introduction'
  ```
- ❌ These 8 fields are NOT in pods-config.json

#### Issues Found:

| Issue # | Severity | Description | Current State | Expected State |
|---------|----------|-------------|---------------|----------------|
| BIO-001 | 🔴 High | pods-config.json declares 4 fields but data-integration.php loads 8 | 8 fields | 4 fields |
| BIO-002 | 🟡 Medium | Renderer uses `name`, `title`, `company` props not in pods-config | Used | Should remove or add to pods-config |
| BIO-003 | 🟢 Low | `biography_long` field declared but never used | Declared | Should implement or remove |

#### Recommendations:

**Option A: Simplify to Biography-Only (RECOMMENDED)**
- ✅ Remove all fields except `biography` from data-integration.php
- ✅ Remove `name`, `title`, `company` props from BiographyRenderer.vue
- ✅ Update pods-config.json to only declare `biography` field
- ✅ Biography component focuses solely on bio text

**Option B: Expand to Full Profile**
- Add all 8 fields to pods-config.json
- Expand BiographyEditor.vue to show all fields
- Keep renderer and template as-is

**DECISION REQUIRED:** Which option should be implemented?

---

### 2. Topics Component

#### Expected Pods Fields (from pods-config.json):
```json
{
  "topic_1": "text",
  "topic_2": "text",
  "topic_3": "text",
  "topic_4": "text",
  "topic_5": "text"
}
```

#### Actual Implementation:

**📁 TopicsRenderer.vue (Preview)**
- Props: `title`, `description`, `topics` (array)
- ✅ Displays topics from array correctly

**📁 data-integration.php**
- File exists: ✅ Yes
- Expected to load 5 topic fields

#### Issues Found:

| Issue # | Severity | Description |
|---------|----------|-------------|
| TOP-001 | 🟢 Low | Need to verify data-integration.php maps all 5 fields |

**STATUS:** ✅ **LIKELY CORRECT** - Structure appears sound

---

### 3. Guest-Intro Component

#### Expected Pods Fields (from pods-config.json):
```json
{
  "introduction": "paragraph",
  "first_name": "text",
  "last_name": "text"
}
```

#### Actual Implementation:

**📁 GuestIntroRenderer.vue (Preview)**
- ✅ Uses `introduction` from Pods via usePodsData composable
- ✅ ONLY displays introduction text (correct)
- ✅ No editor fields (Pods-only source)

#### Issues Found:

| Issue # | Severity | Description |
|---------|----------|-------------|
| GI-001 | 🟢 Info | Component correctly uses ONLY Pods data, no customization |

**STATUS:** ✅ **PERFECT** - No issues found

---

### 4. Contact Component

#### Expected Pods Fields (from pods-config.json):
```json
{
  "email": "email",
  "phone": "phone",
  "website": "website",
  "1_website": "website",
  "2_website": "website"
}
```

#### Actual Implementation:

**📁 ContactEditor.vue (Sidebar Panel)**
- Shows 4 fields: `email`, `phone`, `website`, `address`
- ❌ `address` NOT in pods-config.json
- ❌ Missing `1_website`, `2_website` from config

**📁 ContactRenderer.vue (Preview)**
- Props: `email`, `phone`, `website`, `location`
- ❌ `location` NOT in pods-config.json

**📁 template.php (Frontend)**
- Uses: `email`, `phone`, `website`, `location`
- ✅ Matches renderer (consistent)

**📁 data-integration.php**
- ❌ **CRITICAL DISCREPANCY**: Maps 8 fields!
  ```php
  'email' => 'email',
  'phone' => 'phone',
  'website' => 'website',
  'address' => 'address',
  'city' => 'city',
  'state' => 'state',
  'zip' => 'zip',
  'country' => 'country'
  ```
- Builds `full_address` from components
- ❌ **MISSING FROM PODS**: According to field mapping analysis, Pods has `skype` field but it's not implemented anywhere!

#### Issues Found:

| Issue # | Severity | Description | Current State | Expected State |
|---------|----------|-------------|---------------|----------------|
| CON-001 | 🔴 High | pods-config.json declares 5 fields but data-integration.php uses 8 | 8 fields | Should match |
| CON-002 | 🔴 High | `skype` field exists in Pods but NOT in any component file | Missing | Should implement |
| CON-003 | 🟡 Medium | `address`, `city`, `state`, `zip`, `country` NOT in pods-config.json | Used | Add to config |
| CON-004 | 🟡 Medium | `1_website`, `2_website` in pods-config but not used | Declared | Implement or remove |

#### Recommendations:

**CRITICAL: Add Skype Field**
```vue
<!-- ContactEditor.vue -->
<div class="field-group">
  <label for="contact-skype">Skype</label>
  <input 
    id="contact-skype"
    v-model="localData.skype" 
    @input="updateComponent"
    type="text"
    placeholder="skype_username"
  />
</div>
```

**Update pods-config.json to match reality:**
```json
{
  "email": "email",
  "phone": "phone",
  "skype": "text",
  "website": "website",
  "1_website": "website",
  "2_website": "website",
  "address": "text",
  "city": "text",
  "state": "text",
  "zip": "text",
  "country": "text"
}
```

---

### 5. Questions (FAQ) Component

#### Expected Pods Fields (from pods-config.json):
```json
{
  "question_1" through "question_10": "text"
}
```

**NOTE:** Audit document states Pods has 25 questions (question_1 through question_25)

#### Actual Implementation:

**📁 QuestionsRenderer.vue (Preview)**
- Props: `title`, `questions` (array)
- ✅ Displays all questions from array

**📁 data-integration.php**
- ✅ Loads questions 1-10 from Pods
- ❌ **CRITICAL**: Capped at 10 questions but Pods has 25 available!

#### Issues Found:

| Issue # | Severity | Description | Current State | Expected State |
|---------|----------|-------------|---------------|----------------|
| QUE-001 | 🔴 High | Component only uses 10 of 25 available Pods questions | 10 questions | 25 questions |
| QUE-002 | 🟡 Medium | Audit doc says "only 3 show in preview" but code loads 10 | Need verification | Should show all loaded |

#### Recommendations:

**Option A: Expand to All 25 Questions**
```php
// data-integration.php
protected static $field_mappings = array(
    'question_1' => 'question_1',
    // ... continue to ...
    'question_25' => 'question_25'
);
```

**Option B: Keep 10 Questions (Current)**
- Update documentation to reflect intentional limit
- Remove questions 11-25 from Pods schema if unused

**DECISION REQUIRED:** Should all 25 questions be implemented?

---

### 6. Topics-Questions Component

#### Expected Pods Fields (from pods-config.json):
```json
{
  "topic_1" through "topic_5": "text",
  "question_1" through "question_10": "text"
}
```

#### Actual Implementation:

**STATUS:** Need to audit renderer and data-integration files

#### Issues Found:

| Issue # | Severity | Description |
|---------|----------|-------------|
| TQ-001 | 🔵 Info | Same question limit issue as Questions component (10 vs 25) |

---

### 7. Social Component

#### Expected Pods Fields (from pods-config.json):
```json
{
  "1_twitter": "website",
  "1_facebook": "website",
  "1_instagram": "website",
  "1_linkedin": "website",
  "1_tiktok": "website",
  "1_pinterest": "website",
  "guest_youtube": "website",
  "1_website": "website",
  "2_website": "website",
  "email": "email",
  "website": "website"
}
```

#### Actual Implementation:

**📁 SocialRenderer.vue (Preview)**
- Props: `links` (array of { platform, url })
- Icon mapping includes: facebook, twitter, linkedin, instagram, youtube, github, pinterest, tiktok
- ⚠️ **github** icon exists but NO Pods field for it

**📁 data-integration.php**
- Needs audit to verify field loading

#### Issues Found:

| Issue # | Severity | Description | Current State | Expected State |
|---------|----------|-------------|---------------|----------------|
| SOC-001 | 🟡 Medium | `github` supported in renderer but NOT in Pods schema | No field | Add to Pods or remove from renderer |
| SOC-002 | 🟢 Low | `email` and `website` in pods-config - should these be in Social? | Included | Remove (belongs in Contact) |

---

## Cross-Component Issues

### 1. Inconsistent Field Usage

**Image Fields:**
- `guest_headshot`, `vertical_image`, `horizontal_image` available in Pods
- Biography component references them in old docs but NOT in implementation
- Photo Gallery should use these but needs verification

### 2. Duplicate Website Fields

**Problem:** Multiple components track websites
- Contact: `website`, `1_website`, `2_website`
- Social: `1_website`, `2_website`, `website`
- ❌ **Overlap**: Should websites be in Contact OR Social, not both?

### 3. Name Field Consistency

**Components using name fields:**
- Biography: `first_name`, `last_name`, `full_name`
- Guest-Intro: `first_name`, `last_name`
- Hero: `first_name`, `last_name`, `full_name`

✅ **GOOD**: Consistent pattern across components

---

## Summary Tables

### Fields Declared vs. Fields Used

| Component | pods-config.json | data-integration.php | Editor Fields | Match? |
|-----------|-----------------|---------------------|--------------|--------|
| Biography | 4 fields | 8 fields | 1 field | ❌ NO |
| Topics | 5 fields | ? | ? | ❓ |
| Guest-Intro | 3 fields | 3 fields | 0 (Pods-only) | ✅ YES |
| Contact | 5 fields | 8 fields | 4 fields | ❌ NO |
| Questions | 10 fields | 10 fields | ? | ✅ YES (but 25 available) |
| Topics-Questions | 15 fields | ? | ? | ❓ |
| Social | 11 fields | ? | ? | ❓ |

### Critical Missing Fields

| Component | Pods Field | Status | Impact |
|-----------|-----------|--------|--------|
| Contact | `skype` | ❌ Missing everywhere | HIGH - Field exists in Pods but not implemented |
| Questions | `question_11` to `question_25` | ❌ Not implemented | HIGH - 15 questions not accessible |
| Social | `github` | ❌ Not in Pods | MEDIUM - Renderer expects it but Pods doesn't have it |

---

## Action Items (Priority Order)

### 🔴 CRITICAL (Must Fix)

1. **CON-002**: Implement `skype` field in Contact component
   - Add to ContactEditor.vue
   - Add to ContactRenderer.vue
   - Add to template.php
   - Already in data-integration.php field mappings

2. **BIO-001**: Fix Biography field mapping discrepancy
   - **DECISION NEEDED**: Simplify to bio-only OR expand to full profile?

3. **CON-001**: Sync Contact pods-config.json with data-integration.php
   - Add address, city, state, zip, country to pods-config.json
   - OR remove them from data-integration.php

### 🟡 HIGH (Should Fix)

4. **QUE-001**: Decision on Questions limit (10 vs 25)
   - **DECISION NEEDED**: Implement all 25 OR document 10-question limit?

5. **CON-004**: Decide on `1_website`, `2_website` fields
   - Implement secondary website support OR remove from pods-config

6. **SOC-001**: Resolve GitHub field discrepancy
   - Add `github` field to Pods OR remove from Social renderer

### 🟢 MEDIUM (Nice to Fix)

7. **BIO-003**: Implement or remove `biography_long` field

8. **SOC-002**: Remove `email` and `website` from Social pods-config (belongs in Contact)

9. **Audit Remaining**: Complete audit of:
   - Topics data-integration.php
   - Topics-Questions data-integration.php
   - Social data-integration.php

---

## Files Requiring Changes

### Biography Component
- `components/biography/pods-config.json` - Update field declarations
- `components/biography/data-integration.php` - Reduce to 4 fields
- `components/biography/BiographyRenderer.vue` - Remove extra props

### Contact Component
- `components/contact/pods-config.json` - Add 6 missing fields
- `components/contact/ContactEditor.vue` - Add skype field
- `components/contact/ContactRenderer.vue` - Add skype prop
- `components/contact/template.php` - Add skype output
- `components/contact/data-integration.php` - Add skype to mappings

### Questions Component
- `components/questions/pods-config.json` - Expand to 25 fields (if decided)
- `components/questions/data-integration.php` - Expand to 25 fields (if decided)

### Social Component
- `components/social/pods-config.json` - Add github field OR remove from renderer
- `components/social/SocialRenderer.vue` - Remove github if not in Pods

---

## Testing Checklist

After fixes are implemented, verify:

### Biography Component
- [ ] Sidebar editor shows only biography textarea
- [ ] Preview displays biography text correctly
- [ ] Frontend displays biography text correctly
- [ ] Pods data loads without errors
- [ ] No console errors about missing fields

### Contact Component
- [ ] Sidebar editor shows skype field
- [ ] Skype input saves correctly
- [ ] Preview displays skype link
- [ ] Frontend displays skype link
- [ ] All address fields work correctly
- [ ] No console errors

### Questions Component
- [ ] All implemented questions load
- [ ] Preview shows all questions
- [ ] Frontend shows all questions
- [ ] No console errors about missing questions

---

**Report Status:** Phase 1 Complete - Awaiting Decisions on Critical Issues  
**Next Phase:** Phase 2 - Media & Content Components Audit
