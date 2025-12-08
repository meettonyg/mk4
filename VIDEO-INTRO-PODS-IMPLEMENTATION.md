# Video Intro Component - Pods Integration Implementation

**Date:** October 30, 2025  
**Component:** video-intro  
**Status:** ✅ COMPLETE

---

## Implementation Summary

Successfully implemented full Pods integration for the video-intro component, allowing it to load video URLs from the `video_intro` Pods field while maintaining the ability to override with custom URLs.

---

## Files Created/Modified

### 1. ✅ Created: `data-integration.php`
**Location:** `components/video-intro/data-integration.php`

**Features:**
- Loads `video_intro` field from Pods
- Converts video URLs to embed format (YouTube, Vimeo)
- Provides data in multiple prop formats for compatibility
- Follows standard data-integration.php pattern
- Includes filter hook: `gmkb_enrich_video-intro_props`

**Key Functions:**
- `load_component_data($post_id)` - Loads video URL from Pods
- `prepare_template_props($component_data, $existing_props)` - Prepares props for renderer/template
- `convert_to_embed_url($url)` - Converts YouTube/Vimeo URLs to embed format
- `save_component_data($post_id, $video_data)` - Saves video URL to Pods
- `has_component_data($post_id)` - Checks if video exists

**URL Conversion Support:**
- YouTube watch URLs → YouTube embed URLs
- YouTube short URLs (youtu.be) → YouTube embed URLs  
- Vimeo URLs → Vimeo embed URLs
- Already-embedded URLs → Pass through
- Direct video URLs → Pass through

---

### 2. ✅ Modified: `pods-config.json`
**Location:** `components/video-intro/pods-config.json`

**Changes:**
```json
{
  "dataSource": "pods",  // ✅ Correctly declares Pods integration
  "description": "Video intro component loads from video_intro Pods field (website URL type). Supports YouTube, Vimeo, and direct video URLs.",
  "fields": {
    "video_intro": {
      "type": "website",  // ✅ Changed from "file" to "website"
      "required": false,
      "description": "Video introduction URL (YouTube, Vimeo, or direct video link)"
    }
  }
}
```

---

### 3. ✅ Modified: `VideoIntroEditor.vue`
**Location:** `components/video-intro/VideoIntroEditor.vue`

**New Features:**

#### Pods Integration:
- Imports `usePodsData` composable
- Loads `video_intro` field from Pods automatically
- Displays toggle checkbox when Pods data is available

#### User Experience:
```
┌─────────────────────────────────────────────┐
│ Video Source                                 │
├─────────────────────────────────────────────┤
│                                              │
│ ☑ Use video from Pods                       │
│   (https://youtube.com/watch?v=ABC123...)    │
│                                              │
│ ┌───────────────────────────────────────┐   │
│ │ Video URL (from Pods)                  │   │
│ │ 🔗 https://youtube.com/watch?v=ABC123  │   │
│ │ This video is loaded from your guest   │   │
│ │ profile. Uncheck above to use custom.  │   │
│ └───────────────────────────────────────┘   │
│                                              │
│ Thumbnail URL (Optional)                     │
│ ┌───────────────────────────────────────┐   │
│ │ https://example.com/thumb.jpg         │   │
│ └───────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**When NO Pods data:**
```
┌─────────────────────────────────────────────┐
│ Video Source                                 │
├─────────────────────────────────────────────┤
│ Supports YouTube, Vimeo, or direct video    │
│ URLs                                         │
│                                              │
│ Video URL *                                  │
│ ┌───────────────────────────────────────┐   │
│ │ https://youtube.com/watch?v=...       │   │
│ └───────────────────────────────────────┘   │
│                                              │
│ Thumbnail URL (Optional)                     │
│ ┌───────────────────────────────────────┐   │
│ │ https://example.com/thumb.jpg         │   │
│ └───────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Logic:**
- If Pods has `video_intro` field → Show toggle (checked by default)
- If toggle is checked → Use Pods URL, hide custom input
- If toggle is unchecked → Show custom URL input
- If no Pods data → Show only custom URL input
- Component stores `usePodsData` flag in component data

---

### 4. ✅ Verified: `VideoIntroRenderer.vue`
**Location:** `components/video-intro/VideoIntroRenderer.vue`

**Status:** Already compatible, no changes needed

**Props:**
- `componentId: String`
- `title: String`
- `videoUrl: String` ✅ Works with Pods data
- `description: String`

---

### 5. ✅ Verified: `template.php`
**Location:** `components/video-intro/template.php`

**Status:** Already compatible, no changes needed

**Variable Handling:**
```php
$videoUrl = $props['videoUrl'] ?? $props['video_url'] ?? '';
```
✅ Accepts both `videoUrl` and `video_url` props  
✅ Compatible with data-integration.php output

---

## Data Flow

### Editor (Vue SPA):
```
User opens editor
    ↓
usePodsData loads video_intro from Pods
    ↓
If Pods has data: Show toggle (checked by default)
If no Pods data: Show custom input only
    ↓
User can toggle between Pods/Custom
    ↓
Effective video URL = Pods URL (if toggle checked) OR Custom URL
    ↓
Component data saved with usePodsData flag
```

### Preview/Frontend (PHP):
```
Component renders
    ↓
data-integration.php hook fires (gmkb_enrich_video-intro_props)
    ↓
Loads video_intro from Pods
    ↓
Converts to embed URL (YouTube/Vimeo)
    ↓
Passes videoUrl prop to renderer/template
    ↓
Video displays in iframe
```

---

## Pods Field Configuration

**Field Name:** `video_intro`  
**Field Type:** Website URL  
**Pod:** guests  
**Required:** No  
**Description:** Video introduction URL (YouTube, Vimeo, or direct video link)

**Field was created by user in Pods admin interface.**

---

## Testing Checklist

### ✅ Editor Panel:
- [ ] Open Video Intro component editor
- [ ] If guest has video_intro in Pods, toggle should appear checked
- [ ] Toggle should show/hide Pods URL display
- [ ] Unchecking toggle should show custom URL input
- [ ] Custom URL input should save correctly
- [ ] Switching between Pods/Custom should update preview

### ✅ Preview:
- [ ] Video Intro with Pods data displays correctly
- [ ] Video Intro with custom URL displays correctly
- [ ] YouTube URLs convert to embed format
- [ ] Vimeo URLs convert to embed format
- [ ] Video plays in preview iframe

### ✅ Frontend:
- [ ] Published media kit shows video
- [ ] Video loads from Pods field
- [ ] Video plays correctly
- [ ] Embed URLs work properly

### ✅ Data Persistence:
- [ ] Component saves usePodsData flag
- [ ] Component saves custom video_url when not using Pods
- [ ] Switching between Pods/Custom persists correctly
- [ ] Page reload maintains correct data source

---

## URL Conversion Examples

### YouTube:
```
Input:  https://www.youtube.com/watch?v=dQw4w9WgXcQ
Output: https://www.youtube.com/embed/dQw4w9WgXcQ

Input:  https://youtu.be/dQw4w9WgXcQ
Output: https://www.youtube.com/embed/dQw4w9WgXcQ
```

### Vimeo:
```
Input:  https://vimeo.com/123456789
Output: https://player.vimeo.com/video/123456789
```

### Already Embedded:
```
Input:  https://www.youtube.com/embed/dQw4w9WgXcQ
Output: https://www.youtube.com/embed/dQw4w9WgXcQ (pass through)
```

---

## Architecture Compliance

✅ **Generic data-integration.php Pattern:** Follows established pattern from biography, contact, questions components  
✅ **Single Source of Truth:** Pods is the authoritative data source  
✅ **Event-Driven:** Uses filter hook `gmkb_enrich_video-intro_props`  
✅ **No Polling:** All data loading is event-based  
✅ **Proper Error Handling:** Validates post ID, handles empty data gracefully  
✅ **Debug Logging:** WP_DEBUG-aware logging throughout  
✅ **Sanitization:** All URLs properly sanitized with `esc_url_raw()`  
✅ **Backward Compatible:** Existing custom video URLs continue to work  

---

## User Workflow

### Scenario 1: Guest has video in Pods
1. User adds Video Intro component
2. Editor opens with toggle checked
3. Pods video URL displays automatically
4. User can override by unchecking toggle and entering custom URL
5. Video displays in preview and frontend

### Scenario 2: Guest has NO video in Pods
1. User adds Video Intro component
2. Editor shows custom URL input (no toggle)
3. User enters video URL manually
4. Video displays in preview and frontend

### Scenario 3: Switching between Pods and Custom
1. User has Pods video loaded (toggle checked)
2. User unchecks toggle
3. Custom URL input appears
4. User enters different video URL
5. Custom URL displays in preview
6. User checks toggle again
7. Pods video displays again (custom URL not lost)

---

## Benefits

1. ✅ **Eliminates Data Duplication:** Video URL stored once in Pods, used everywhere
2. ✅ **Consistent UX:** Same pattern as other Pods components
3. ✅ **Flexibility:** Users can override Pods data when needed
4. ✅ **Smart Defaults:** Automatically uses Pods data if available
5. ✅ **URL Conversion:** Automatically converts to embed format
6. ✅ **Clear UI:** Toggle makes it obvious which source is being used

---

## Next Steps

**Immediate:**
1. Test the implementation in WordPress
2. Verify Pods field loads correctly
3. Test toggle between Pods/Custom
4. Test URL conversion (YouTube, Vimeo)

**Future:**
1. Implement similar pattern for photo-gallery component
2. Implement similar pattern for logo-grid component
3. Consider adding video preview in editor panel

---

**Implementation Status:** ✅ COMPLETE  
**Ready for Testing:** YES  
**Breaking Changes:** NONE (backward compatible)
