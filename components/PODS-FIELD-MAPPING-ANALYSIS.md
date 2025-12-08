# Media Kit Builder ↔ Pods Guest One Sheets Field Mapping Analysis

**Date:** October 14, 2025  
**Purpose:** Identify which component fields map to Pods fields and find gaps

---

## Executive Summary

**Pods Fields:** 84 total across 8 groups  
**Components:** 16 total  
**Strong Mappings:** 6 components (Guest Intro, Social Links, Topics & Questions, Photo Gallery)  
**Partial Mappings:** 7 components  
**No Mappings:** 3 components (Stats, Testimonials, Booking Calendar)

---

## Perfect Matches ✅

### 1. Guest Intro Component → Pods Contact/Messaging
| Component Field | Pods Field | Match |
|----------------|------------|-------|
| Guest Name | `full_name` | ✅ |
| Title/Position | `guest_title` | ✅ |
| Company | `company` | ✅ |
| Introduction | `introduction` | ✅ |

**100% Match!**

---

### 2. Topics & Questions Component → Pods Topics-Questions
| Component Field | Pods Field | Match |
|----------------|------------|-------|
| Topic 1-5 | `topic_1` - `topic_5` | ✅ |
| Question 1-10 | `question_1` - `question_10` | ✅ |

**100% Match!** (Component uses 10 questions, Pods has 25 available)

---

### 3. Social Links Component → Pods Links
| Component Field | Pods Field | Match |
|----------------|------------|-------|
| Facebook | `1_facebook` | ✅ |
| Twitter | `1_twitter` | ✅ |
| LinkedIn | `1_linkedin` | ✅ |
| Instagram | `1_instagram` | ✅ |
| YouTube | `guest_youtube` | ✅ |
| TikTok | `1_tiktok` | ✅ |
| Pinterest | `1_pinterest` | ✅ |
| GitHub | ❌ NO MATCH | ⚠️ |

**87.5% Match!** (7/8 platforms)

---

## Strong Partial Matches 🔶

### 4. Biography Component
| Component Field | Pods Field | Match |
|----------------|------------|-------|
| Name | `full_name`, `first_name`, `last_name` | ✅ |
| Title | `guest_title` | ✅ |
| Biography | `biography` | ✅ |
| Location | ❌ NO MATCH | ⚠️ |

**75% Match** - Missing Location field in Pods

---

### 5. Contact Component
| Component Field | Pods Field | Match |
|----------------|------------|-------|
| Email | `email` | ✅ |
| Website | `1_website`, `2_website` | ✅ |
| Phone | ❌ NO MATCH | ⚠️ |
| Address | ❌ NO MATCH | ⚠️ |

**50% Match** - Missing Phone, Address in Pods

---

### 6. Photo Gallery Component
| Component Field | Pods Field | Match |
|----------------|------------|-------|
| Photos Array | `carousel_images`, `guest_carousel_images` | ✅ |

**Good conceptual match** - Pods has carousel images

---

### 7. Podcast Player Component
| Component Field | Pods Field | Match |
|----------------|------------|-------|
| Episode Title | `1_episode`, `episode_2`, `episode_3` | ✅ |
| Episode Link | `episode_1_link`, `episode_2_link`, `episode_3_link` | ✅ |
| Episode Description | ❌ NO MATCH | ⚠️ |
| Audio URL | ❌ NO MATCH | ⚠️ |
| Spotify URL | ❌ NO MATCH | ⚠️ |
| Apple URL | ❌ NO MATCH | ⚠️ |
| Duration | ❌ NO MATCH | ⚠️ |

**Structural difference:**
- Pods: 3 episodes (Title + Link only)
- Component: 5 episodes (Title + Description + Audio + Spotify + Apple + Duration)

---

### 8. Call-to-Action Component
| Component Field | Pods Field | Match |
|----------------|------------|-------|
| Button Text | `1_offer`, `offer_2` | 🔶 |
| Button URL | `cta_link`, `cta_link_2` | 🔶 |
| Background Color | `background_color` | ✅ |

**Structural difference:**
- Pods: Offer + Link + Description (3 fields per CTA)
- Component: Title + Description + Button Text + Button URL (4 fields per CTA)

---

## Weak/No Matches ⚠️

### 9. Hero Component
**Conceptual match only** - Hero is presentation layer, Pods has raw content
- Title might use `tagline`
- Background might use `horizontal_image` or `vertical_image`
- CTA might use `1_offer` + `cta_link`

---

### 10. Logo Grid Component
**Partial match:**
- Pods has `logo_image`, `guest_logo`
- But no structured grid data (no logo name, link, etc.)

---

### 11. Questions Component (FAQ)
**Structural mismatch:**
- Pods: `question_1` - `question_25` (questions only, no answers)
- Component: Q&A pairs (question + answer)

---

### 12. Topics Component
**Partial match:**
- Pods: `topic_1` - `topic_5` (5 fixed fields)
- Component: Repeatable array (unlimited topics)

---

## No Match Components ❌

### 13. Booking Calendar
**No Pods equivalent** - Scheduling is user/host-specific, not guest-specific

### 14. Stats Component
**No Pods equivalent** - No statistics fields in Pods

### 15. Testimonials Component
**No Pods equivalent** - No testimonial fields in Pods

### 16. Video Intro Component
**No Pods equivalent** - No video fields in Pods

---

## Critical Gaps Analysis

### Missing in Pods (Component fields with no Pods match):

**Biography:**
- ❌ Location

**Contact:**
- ❌ Phone
- ❌ Address

**Social Links:**
- ❌ GitHub

**Podcast Player:**
- ❌ Episode Description
- ❌ Audio URL
- ❌ Spotify URL
- ❌ Apple Podcasts URL
- ❌ Duration

**Hero/CTA:**
- ❌ Section titles
- ❌ Section descriptions
- ❌ Background images (for CTAs)

**General:**
- ❌ All Stats data
- ❌ All Testimonials data
- ❌ All Booking Calendar data
- ❌ Video intro URLs

---

### Missing in Components (Pods fields with no component match):

**Contact:**
- `skype` - Skype username
- `org_id` - Organization ID
- `highlevel_contact_id` - HighLevel Contact ID

**Messaging:**
- `hook_when`, `hook_what`, `hook_how`, `hook_where`, `hook_why` - 5 hook fields

**Questions:**
- `question_11` through `question_25` - Extra 15 questions beyond component's 10

**Design Assets:**
- `_guest_layout_options` - Layout configuration
- Duplicate image fields (`logo_image` vs `guest_logo`, etc.)

**Colors:**
- All 8 color fields (not in any component)

---

## Recommendations

### 1. Add Missing Fields to Pods

**High Priority:**
- Add `location` field to Contact group
- Add `phone` field to Contact group
- Add `address` field to Contact group
- Add `github` field to Links group

**Medium Priority:**
- Add podcast episode metadata (Audio URL, Spotify, Apple, Duration, Description)
- Add Stats group (if stats are needed)
- Add Testimonials group (if testimonials are needed)
- Add Video group (video URL, thumbnail)

### 2. Create Field Mapping Configuration

```php
// Example mapping structure
$field_map = [
    'guest_intro' => [
        'name' => 'full_name',
        'title' => 'guest_title',
        'company' => 'company',
        'introduction' => 'introduction'
    ],
    'biography' => [
        'name' => 'full_name',
        'title' => 'guest_title',
        'biography' => 'biography',
        'location' => null // No Pods field
    ],
    'social' => [
        'facebook' => '1_facebook',
        'twitter' => '1_twitter',
        'linkedin' => '1_linkedin',
        'instagram' => '1_instagram',
        'youtube' => 'guest_youtube',
        'tiktok' => '1_tiktok',
        'pinterest' => '1_pinterest',
        'github' => null // No Pods field
    ]
    // ... etc
];
```

### 3. Handle Hook Fields

The 5 hook fields (`hook_when`, `hook_what`, `hook_how`, `hook_where`, `hook_why`) in Pods don't map to any component. Options:
- **Option A:** Create a "Hooks" component
- **Option B:** Add to Guest Intro or Biography as optional fields
- **Option C:** Ignore if not needed

### 4. Handle Color Fields

8 color fields in Pods have no component equivalent. Options:
- **Option A:** Use Design tab (colors are styling, not content)
- **Option B:** Create "Brand Colors" component
- **Option C:** Ignore and use theme colors

---

## Summary Table

| Component | Match Quality | Pods Coverage | Notes |
|-----------|--------------|---------------|-------|
| Guest Intro | ✅ Perfect | 100% | All 4 fields map |
| Topics & Questions | ✅ Perfect | 100% | Exact structure match |
| Social Links | ✅ Strong | 87.5% | Missing GitHub |
| Biography | 🔶 Good | 75% | Missing Location |
| Contact | 🔶 Partial | 50% | Missing Phone, Address |
| Photo Gallery | 🔶 Good | Conceptual | Carousel images |
| Podcast Player | 🔶 Weak | Structure differs | Limited fields |
| Call-to-Action | 🔶 Weak | Structure differs | Different approach |
| Hero | ⚠️ Weak | Conceptual | Presentation vs content |
| Logo Grid | ⚠️ Weak | Partial | Has logo, no grid data |
| Questions | ⚠️ Weak | Questions only | No answers |
| Topics | ⚠️ Weak | Fixed vs repeatable | Structure differs |
| Booking Calendar | ❌ None | 0% | Not guest-specific |
| Stats | ❌ None | 0% | No Pods fields |
| Testimonials | ❌ None | 0% | No Pods fields |
| Video Intro | ❌ None | 0% | No Pods fields |

---

## Implementation Priority

### Phase 1: Perfect Matches (Implement First)
1. ✅ Guest Intro → Pods Contact/Messaging
2. ✅ Topics & Questions → Pods Topics-Questions
3. ✅ Social Links → Pods Links

### Phase 2: Strong Matches (Implement Second)
4. ✅ Biography → Pods Contact/Messaging (add Location)
5. ✅ Photo Gallery → Pods Design Assets

### Phase 3: Requires Discussion/Refactoring
6. Contact (add Phone, Address to Pods?)
7. Podcast Player (expand Pods fields or simplify component?)
8. Call-to-Action (align structures?)
9. Questions (add answers to Pods or remove from component?)

### Phase 4: Standalone Features (May not need Pods)
10. Hero (presentation layer)
11. Logo Grid (layout component)
12. Booking Calendar (user-specific)
13. Stats (dynamic/calculated?)
14. Testimonials (separate post type?)
15. Video Intro (media component)

---

**Conclusion:**  
Strong foundation with **3 perfect matches** and several strong partial matches. Main gaps are presentation/layout fields in components and metadata fields in Pods. Priority should be mapping core content fields first (Guest Intro, Topics, Social Links, Biography).
