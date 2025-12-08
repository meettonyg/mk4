# 🎯 FINAL NULL SAFETY SWEEP

## Progress: 86 → 43 failures ✅ (50% fixed!)

The Pods mock is working! We just need to add `?.` to ALL remaining `props.data` accesses.

---

## Remaining Fixes Needed

Based on errors, we need `?.` on these lines:

### 1. AuthorityHookRenderer - Line 76
```javascript
// ❌ Before:
if (Array.isArray(props.data.authority_points)) {

// ✅ After:
if (Array.isArray(props.data?.authority_points)) {
```

### 2. BookingCalendarRenderer - Line 99
```javascript
// ❌ Before:
if (props.data.title) return props.data.title;

// ✅ After:
if (props.data?.title) return props.data.title;
```

### 3. CallToActionRenderer - Line 107
```javascript
// ❌ Before:
if (props.data.background_color) {

// ✅ After:
if (props.data?.background_color) {
```

### 4. ContactRenderer - Line 134
Missing ref: `podsLocation` not in mock

### 5. GuestIntroRenderer - Line 124
```javascript
// ❌ Before:
return props.data.availability || '';

// ✅ After:
return props.data?.availability || '';
```

### 6. LogoGridRenderer
Missing ref: `companyLogo` - Already in mock but destructured wrong

### 7. PhotoGalleryRenderer - Line 103
Missing ref: `headshotUrl`

### 8. PodcastPlayerRenderer - Line 71
```javascript
// ❌ Before:
return props.data.title || 'Podcast Episodes';

// ✅ After:
return props.data?.title || 'Podcast Episodes';
```

### 9. SocialRenderer - Line 77
Already using Pods refs but they're undefined - destructure issue

### 10. StatsRenderer - Line 56
```javascript
// ❌ Before:
if (Array.isArray(props.data.stats)) {

// ✅ After:
if (Array.isArray(props.data?.stats)) {
```

### 11. VideoIntroRenderer - Line 67
```javascript
// ❌ Before:
if (props.data.title) return props.data.title;

// ✅ After:
if (props.data?.title) return props.data.title;
```

---

## Strategy

We need TWO things:

1. **Add `?.` to ALL `props.data` accesses** (not just first one)
2. **Add missing refs to Pods mock**:
   - `podsLocation`
   - `headshotUrl`

---

## Files to Fix

1. AuthorityHookRenderer.vue - Line 76
2. BookingCalendarRenderer.vue - Line 99, 105, 108, etc.
3. CallToActionRenderer.vue - Line 107, 108, etc.
4. GuestIntroRenderer.vue - Line 124
5. PodcastPlayerRenderer.vue - Line 71, 74, etc.
6. StatsRenderer.vue - Line 56, 57, etc.
7. VideoIntroRenderer.vue - Line 67
8. tests/setup.js - Add missing refs

---

## Next Action

Fix ALL of these systematically.
