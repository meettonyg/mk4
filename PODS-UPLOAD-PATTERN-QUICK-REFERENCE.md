# Pods Upload Pattern Quick Reference

## 🚀 Quick Implementation Guide

Use this reference to implement Pods field upload functionality for any component.

## 📋 Checklist for New Component

### 1. **Component Configuration** (Required)
Update `component.json` to declare Pods field dependencies:

```json
{
  "type": "your-component",
  "name": "Your Component",
  // ... other config
  "podsFields": [
    "your_pods_field_name"
  ]
}
```

### 2. **Editor Component** (Required)
Import the composables in your editor:

```vue
<script setup>
import { usePodsFieldUpdate } from '@/composables/usePodsFieldUpdate';
import { useMediaUploader } from '@/composables/useMediaUploader';
import { useMediaKitStore } from '@/stores/mediaKit';

const store = useMediaKitStore();
const { updatePodsField, isUpdating } = usePodsFieldUpdate();
const { selectLogo, isUploading } = useMediaUploader(); // or selectImage, selectImages
</script>
```

### 3. **Upload Handler** (Copy & Customize)
```vue
<script setup>
const handleUpload = async () => {
  try {
    // Step 1: Select media
    const attachment = await selectLogo(); // or selectImage()
    if (!attachment) return; // User cancelled
    
    if (window.gmkbDebug) {
      console.log('📸 YourComponent: Media selected', {
        id: attachment.id,
        url: attachment.url
      });
    }
    
    // Step 2: Save to Pods field
    try {
      const postId = store.postId;
      if (!postId) {
        throw new Error('Post ID not available');
      }
      
      await updatePodsField(postId, 'your_pods_field_name', attachment.id);
      
      if (window.gmkbDebug) {
        console.log('✅ YourComponent: Saved to Pods successfully');
      }
      
      // Step 3: Update local state
      localData.value.yourField = {
        url: attachment.url,
        alt: attachment.alt || 'Default Alt Text',
        id: attachment.id
      };
      
      // Step 4: Trigger component update
      updateComponent();
      
    } catch (saveError) {
      console.error('❌ YourComponent: Failed to save to Pods', saveError);
      
      // Still update local state even if Pods save fails
      localData.value.yourField = {
        url: attachment.url,
        alt: attachment.alt || 'Default Alt Text',
        id: attachment.id
      };
      updateComponent();
      
      alert('Media selected but could not be saved to your profile. Please try again.');
    }
    
  } catch (error) {
    console.error('❌ YourComponent: Upload failed', error);
    if (error.message !== 'No media selected') {
      alert('Failed to upload media. Please try again.');
    }
  }
};
</script>
```

### 4. **Upload Button** (Copy & Customize)
```vue
<template>
  <button 
    @click="handleUpload"
    :disabled="isUploading || isUpdating"
    class="upload-btn"
    type="button"
  >
    <span v-if="isUploading">Selecting media...</span>
    <span v-else-if="isUpdating">Saving to profile...</span>
    <span v-else>
      <!-- Your upload icon here -->
      Upload Media
    </span>
  </button>
</template>
```

## 🎯 Available Media Selection Methods

### Single Image
```javascript
const { selectImage } = useMediaUploader();
const attachment = await selectImage({
  title: 'Select Image',
  buttonText: 'Use This Image'
});
```

### Multiple Images
```javascript
const { selectImages } = useMediaUploader();
const attachments = await selectImages({
  title: 'Select Images',
  buttonText: 'Use These Images'
});
```

### Logo (Optimized)
```javascript
const { selectLogo } = useMediaUploader();
const attachment = await selectLogo({
  title: 'Select Logo',
  buttonText: 'Use This Logo'
});
```

### Any Media Type
```javascript
const { openMediaLibrary } = useMediaUploader();
const attachment = await openMediaLibrary({
  title: 'Select Media',
  buttonText: 'Use This Media',
  multiple: false,
  library: { type: 'image' } // or 'video', 'audio', etc.
});
```

## 🔧 Pods Field Update Methods

### Single Field Update
```javascript
const { updatePodsField } = usePodsFieldUpdate();
await updatePodsField(postId, 'field_name', value);
```

### Multiple Fields Update
```javascript
const { updatePodsFields } = usePodsFieldUpdate();
const results = await updatePodsFields(postId, {
  'field_1': value1,
  'field_2': value2,
  'field_3': value3
});
```

## 🐛 Debug Commands

### Enable Debug Mode
```javascript
window.gmkbDebug = true;
```

### Check Store State
```javascript
// Check all Pods data
console.log('Pods Data:', store.podsData);

// Check specific field
console.log('Your Field:', store.podsData?.your_field_name);

// Check post ID
console.log('Post ID:', store.postId);
```

### Test Composable Directly
```javascript
const { updatePodsField } = usePodsFieldUpdate();
updatePodsField(store.postId, 'your_field_name', 'test_value');
```

## 📋 Common Pods Field Names

### Media Fields
- `profile_image` - Profile/headshot photos
- `profile_photo` - Alternative profile field
- `company_logo` - Company/organization logo
- `personal_brand_logo` - Personal brand logo
- `gallery_images` - Multiple images (array)

### Text Fields
- `biography` - Short bio
- `biography_long` - Extended bio
- `first_name` - First name
- `last_name` - Last name
- `email` - Email address
- `phone` - Phone number
- `website` - Website URL

### Topic Fields
- `topic_1` through `topic_5` - Speaking topics

### Social Media Fields
- `1_facebook` - Facebook URL
- `1_instagram` - Instagram URL
- `1_linkedin` - LinkedIn URL
- `1_twitter` - Twitter URL
- `guest_youtube` - YouTube URL

## ⚠️ Important Notes

### 1. Always Check Post ID
```javascript
const postId = store.postId;
if (!postId) {
  throw new Error('Post ID not available');
}
```

### 2. Handle User Cancellation
```javascript
const attachment = await selectImage();
if (!attachment) {
  return; // User cancelled - this is normal
}
```

### 3. Graceful Degradation
```javascript
try {
  await updatePodsField(postId, 'field_name', value);
  // Success path
} catch (saveError) {
  // Still update local state even if Pods save fails
  localData.value.field = value;
  updateComponent();
  alert('Could not save to profile. Please try again.');
}
```

### 4. Debug Logging
Always include debug logging for troubleshooting:
```javascript
if (window.gmkbDebug) {
  console.log('🔧 YourComponent: Action description', {
    key: value,
    data: objectData
  });
}
```

## 🎉 That's It!

This pattern provides:
- ✅ Consistent user experience
- ✅ Proper error handling  
- ✅ Debug logging
- ✅ Store synchronization
- ✅ Graceful degradation
- ✅ WordPress integration

Copy, customize, and you're ready to go! 🚀
