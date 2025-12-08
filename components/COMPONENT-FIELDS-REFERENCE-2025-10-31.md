# Component Field Reference - Updated October 31, 2025
**Authoritative source for which component uses which Pods fields**

---

## ✅ FULLY VALIDATED COMPONENTS

### Biography Component
**Type:** Pods-based  
**Pods Fields Used:**
- `biography` (WYSIWYG text)

**Status:** ✅ CONSISTENT  
**Notes:** Intentionally simplified - name/title/images belong to other components

---

### Guest-Intro Component  
**Type:** Pods-based  
**Pods Fields Used:**
- `introduction` (paragraph text)

**Pods Fields Declared but Unused:**
- `first_name` (not used)
- `last_name` (not used)

**Status:** ⚠️ Minor cleanup recommended  
**Notes:** Remove unused fields from pods-config.json (optional)

---

### Contact Component
**Type:** Pods-based  
**Pods Fields Used:**
- `email` (email address)
- `phone` (phone number)
- `skype` (Skype username)
- `address` (street address)
- `city` (city name)
- `state` (state/province)
- `zip` (postal code)
- `country` (country name)

**Status:** ✅ CONSISTENT  
**Notes:** Most complete Pods integration. Does NOT include website (that's in Social)

---

### Social Component **[UPDATED 2025-10-31]**
**Type:** Pods-based  
**Pods Fields Used:**
- `1_twitter` (Twitter/X URL)
- `1_facebook` (Facebook URL)
- `1_instagram` (Instagram URL)
- `1_linkedin` (LinkedIn URL)
- `1_tiktok` (TikTok URL)
- `1_pinterest` (Pinterest URL)
- `guest_youtube` (YouTube channel URL)
- `1_website` (primary website)
- `2_website` (secondary website)

**Previously Incorrect Fields (REMOVED):**
- `email` → Moved to Contact
- `phone` → Moved to Contact

**Status:** ✅ FIXED & CONSISTENT  
**Notes:** 
- Critical fix applied 2025-10-31
- NO GitHub field (confirmed intentional)
- Uses `1_` prefix for most platforms
- Uses `guest_` prefix for YouTube only

---

## 🔍 NEEDS VERIFICATION

### Topics Component
**Type:** Pods-based  
**Pods Fields Expected:**
- `topic_1` through `topic_5` (5 topic text fields)

**Status:** 🔍 Needs data-integration.php verification

---

### Questions (FAQ) Component
**Type:** Pods-based  
**Pods Fields Expected:**
- `question_1` through `question_25` (25 question text fields)

**Status:** ⚠️ Known issue - Preview shows only 3 of 25 questions  
**Action Needed:** Investigate if intentional pagination or bug

---

### Topics-Questions Component
**Type:** Pods-based  
**Pods Fields Expected:**
- `topic_1` through `topic_5` (5 topics)
- `question_1` through `question_25` (25 questions)
- Total: 30 fields

**Status:** 🔍 Needs verification

---

### Hero Component
**Type:** Pods-based  
**Pods Fields Expected:**
- `first_name`, `last_name`, `full_name`
- `guest_title`, `company`
- `introduction`, `tagline`
- `vertical_image`, `horizontal_image`, `guest_headshot`
- Total: ~10 fields

**Status:** 🔍 Needs verification

---

### Photo Gallery Component
**Type:** Pods-based  
**Pods Fields Expected:**
- `vertical_image`, `horizontal_image`
- `carousel_images`, `guest_carousel_images`
- `guest_headshot`
- Total: ~5 image fields

**Status:** 🔍 Needs verification

---

### Podcast Player Component
**Type:** Pods-based  
**Pods Fields Expected:**
- `1_episode`, `episode_2`, `episode_3` (episode titles)
- `episode_1_link`, `episode_2_link`, `episode_3_link` (episode URLs)
- Total: 6 fields (3 episodes × 2 fields each)

**Status:** 🔍 Needs verification  
**Note:** Component may support more episodes with custom data

---

### Video Intro Component
**Type:** Pods-based  
**Pods Fields Expected:**
- `guest_youtube` (video URL)

**Status:** 🔍 Needs verification  
**Note:** May also use custom video URL field

---

### Logo Grid Component
**Type:** Mixed (Pods + Custom)  
**Pods Fields Expected:**
- `logo_image` (company/brand logo)
- `guest_logo` (alternative logo)

**Custom Data:**
- Array of client/partner logos (manually entered)

**Status:** 🔍 Needs verification

---

### Company Logo Component
**Type:** Pods-based  
**Pods Fields Expected:**
- `company_logo` or `logo_image` (single logo)

**Status:** 🔍 Needs verification

---

### Personal Brand Logo Component
**Type:** Pods-based  
**Pods Fields Expected:**
- `personal_brand_logo` or `guest_logo` (single logo)

**Status:** 🔍 Needs verification

---

### Profile Photo Component
**Type:** Pods-based  
**Pods Fields Expected:**
- `profile_photo` or `guest_headshot` (single photo)

**Status:** 🔍 Needs verification

---

### Call-to-Action Component
**Type:** Mixed (Pods + Custom)  
**Pods Fields Expected:**
- `1_offer`, `offer_2` (CTA offer text)
- `cta_link`, `cta_link_2` (CTA URLs)
- `background_color` (CTA background)

**Custom Data:**
- Button text
- Button styling

**Status:** 🔍 Needs verification

---

## ❌ CUSTOM DATA COMPONENTS (Do NOT Use Pods)

### Stats Component
**Type:** Custom data only  
**Pods Fields:** NONE (should not have pods-config.json)  
**Status:** ⚠️ Has pods-config.json but shouldn't  
**Data Source:** Manually entered statistics in component editor

---

### Testimonials Component
**Type:** Custom data only  
**Pods Fields:** NONE (should not have pods-config.json)  
**Status:** ⚠️ Has pods-config.json but shouldn't  
**Data Source:** Manually entered testimonials in component editor

---

### Booking Calendar Component
**Type:** Custom data only  
**Pods Fields:** NONE (should not have pods-config.json)  
**Status:** ⚠️ Has pods-config.json but shouldn't  
**Data Source:** User-specific calendar integration (not guest data)

---

## 📋 PODS FIELD NAMING CONVENTIONS

### Standard Pattern:
Most social media fields use: `1_[platform]`
- Examples: `1_twitter`, `1_facebook`, `1_instagram`

### Exceptions:
- YouTube: `guest_youtube` (not `1_youtube`)
- Websites: `1_website`, `2_website`
- Email/Phone: Just `email`, `phone` (no prefix)

### Image Fields:
- Profile images: `guest_headshot`, `profile_photo`
- Gallery: `carousel_images`, `guest_carousel_images`
- Logos: `logo_image`, `guest_logo`, `company_logo`, `personal_brand_logo`

### Name Fields:
- Individual: `first_name`, `last_name`
- Combined: `full_name`
- Title: `guest_title`
- Organization: `company`

### Content Fields:
- Short text: `introduction`, `tagline`
- Long text: `biography`, `biography_long`

### Repeatable Fields:
- Topics: `topic_1` through `topic_5`
- Questions: `question_1` through `question_25`
- Episodes: `1_episode`, `episode_2`, `episode_3`
- Episode Links: `episode_1_link`, `episode_2_link`, `episode_3_link`

---

## 🎯 FIELD OWNERSHIP RULES

### Contact Information:
- Email → **Contact Component ONLY**
- Phone → **Contact Component ONLY**
- Address → **Contact Component ONLY**
- Skype → **Contact Component ONLY**

### Social Media:
- All Social Platforms → **Social Component ONLY**
- Website URLs → **Social Component ONLY**
- **Exception:** NO GitHub (intentionally excluded)

### Personal Info:
- Name/Title → **Guest-Intro & Hero** (shared between these two)
- Biography → **Biography Component ONLY**
- Introduction → **Guest-Intro Component ONLY**

### Media:
- Profile Photos → Dedicated photo components
- Logos → Dedicated logo components
- Gallery Images → Photo Gallery Component
- Videos → Video Intro Component

### Structured Content:
- Topics → Topics or Topics-Questions Component
- Questions/FAQ → Questions or Topics-Questions Component
- Podcasts → Podcast Player Component

### User-Generated:
- Stats → Stats Component (custom data)
- Testimonials → Testimonials Component (custom data)
- Calendar → Booking Component (custom data)

---

## 🚫 FIELDS THAT DON'T EXIST (Confirmed)

These fields were mentioned in old documentation but do NOT exist in Pods:

- ❌ `github` or `1_github` (intentionally excluded)
- ❌ `location` (Biography component wants this but it doesn't exist)
- ❌ Individual episode fields beyond the 3 provided
- ❌ Detailed podcast metadata (duration, description, Spotify URL, Apple URL)

---

## 📊 SUMMARY STATISTICS

### By Component Status:
- ✅ Fully Validated: 4 components
- 🔍 Needs Verification: 12 components
- ⚠️ Minor Issues: 3 components (unnecessary pods-config files)

### By Data Source:
- Pods-based: 14 components
- Custom data: 3 components
- Mixed: 2 components

### Field Counts:
- Contact fields: 8
- Social fields: 9
- Name fields: 5
- Content fields: 3
- Topics: 5
- Questions: 25
- Total unique Pods fields: ~60+

---

## 🔄 WHEN TO UPDATE THIS DOCUMENT

Update this reference when:
1. Adding new Pods fields to schema
2. Creating new components that use Pods
3. Changing which component owns which fields
4. Verifying any of the 🔍 status components
5. Removing pods-config from custom data components

---

**Last Updated:** October 31, 2025  
**Updated By:** Claude (AI Assistant)  
**Verified By:** Tony (confirmed Biography, Guest-Intro, and GitHub decisions)

---

**Quick Links:**
- [Complete Audit Report](./PODS-FIELD-AUDIT-COMPLETE-2025-10-31.md)
- [Action Plan](./ACTION-PLAN-2025-10-31.md)
- [Audit Status](./PODS-FIELD-AUDIT-STATUS-2025-10-31.md)
