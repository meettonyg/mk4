# Profile Photo Alignment Fix

## Problem
The Object Position controls in the Advanced tab were showing correctly but not actually repositioning the image in the preview. The image stayed centered regardless of which button was clicked.

## Root Cause
The ProfilePhotoRenderer.vue component had hardcoded CSS:
```css
.profile-photo-container {
  align-items: center;  /* <-- Always forced center */
}
```

This hardcoded flexbox alignment overrode any margin-based positioning from ComponentStyleService.

## Solution Implemented

### 1. Added Dynamic Alignment Class (ProfilePhotoRenderer.vue)
```javascript
// Reads alignment from settings.advanced.layout.alignment
const containerClasses = computed(() => {
  const alignment = props.settings?.advanced?.layout?.alignment || 'center';
  return `align-${alignment}`;
});
```

### 2. Applied Class to Container
```vue
<div class="profile-photo-container" :class="containerClasses">
```

### 3. Updated CSS with Conditional Alignment
```css
.profile-photo-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 0.75rem);
  /* No hardcoded align-items */
}

.profile-photo-container.align-left {
  align-items: flex-start;
}

.profile-photo-container.align-center {
  align-items: center;
}

.profile-photo-container.align-right {
  align-items: flex-end;
}
```

## How It Works

1. **User clicks** Object Position button (Left/Center/Right)
2. **BaseAdvancedPanel** updates `settings.advanced.layout.alignment`
3. **ComponentStyleService** applies margin-based positioning to wrapper
4. **ProfilePhotoRenderer** reads alignment from settings and applies flex alignment
5. **Image repositions** immediately in preview

## Files Modified
- `components/profile-photo/ProfilePhotoRenderer.vue`

## Testing Instructions

1. **Build the changes:**
   ```bash
   cd C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4
   npm run build
   ```

2. **Refresh WordPress admin** (Ctrl+Shift+R)

3. **Test Profile Photo:**
   - Open Profile Photo editor
   - Go to Advanced tab
   - Click "Position Left" → Image should move to left
   - Click "Position Center" → Image should center
   - Click "Position Right" → Image should move to right

4. **Verify persistence:**
   - Save media kit
   - Reload page
   - Alignment should be preserved

5. **Test frontend:**
   - View media kit on frontend
   - Image position should match builder preview

## Expected Behavior

### Position Left
```
[Image]          
          <--- Aligned to left edge
```

### Position Center  
```
      [Image]
          <--- Centered in container
```

### Position Right
```
          [Image]
          <--- Aligned to right edge
```

## Architecture Compliance ✅

- **Root Cause Fix**: Removed hardcoded alignment, made it dynamic based on settings
- **Single Source of Truth**: Alignment stored in `settings.advanced.layout.alignment`
- **Event-Driven**: Uses Vue reactive computed properties
- **No Bloat**: Reused existing settings structure
- **Maintainable**: Clear CSS classes with semantic meaning

## Next Steps

If this pattern works well for Profile Photo, we can apply the same fix to other visual components:
- Hero component
- Logo component  
- Gallery component
- Video component

Each would get the same treatment:
1. Add `containerClasses` computed property
2. Apply class to container element
3. Add `.align-left`, `.align-center`, `.align-right` CSS rules
