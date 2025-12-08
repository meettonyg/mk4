# Image Storage Architecture - Complete Flow

## Date: November 10, 2025

## Overview

The Guestify Media Kit Builder stores images in **three separate locations** depending on the context:

1. **WordPress Media Library** (wp_posts table) - Physical files
2. **Component State** (post_meta) - Logo references 
3. **Pods Custom Fields** (optional) - Dynamic content source

## The Three Storage Layers

### Layer 1: WordPress Media Library 📁

**Where:** Physical files on server + database entries

**Tables:**
```sql
wp_posts (post_type = 'attachment')
  ├── ID (media ID)
  ├── guid (file URL)
  ├── post_title (filename)
  ├── post_mime_type (image/jpeg, etc.)
  
wp_postmeta
  ├── _wp_attached_file (physical path)
  ├── _wp_attachment_metadata (image sizes, dimensions)
```

**File Structure:**
```
wp-content/uploads/
└── 2025/11/
    ├── logo-microsoft.jpg         (original)
    ├── logo-microsoft-150x150.jpg (thumbnail)
    ├── logo-microsoft-300x300.jpg (medium)
    └── logo-microsoft-1024x1024.jpg (large)
```

**How Images Get Here:**

1. User uploads via MediaUploader component
2. `useMediaUpload.js` composable sends file via REST API
3. WordPress processes upload:
   ```javascript
   POST /wp-json/wp/v2/media
   Headers: { 'X-WP-Nonce': nonce }
   Body: FormData with file
   ```
4. WordPress creates:
   - Physical file in `/uploads`
   - Database entry in `wp_posts`
   - Thumbnail variations
   - Metadata in `wp_postmeta`

**Response:**
```json
{
  "id": 123,
  "source_url": "https://site.com/wp-content/uploads/2025/11/logo.jpg",
  "media_details": {
    "width": 800,
    "height": 600,
    "sizes": {
      "thumbnail": { "source_url": "...-150x150.jpg" },
      "medium": { "source_url": "...-300x300.jpg" },
      "large": { "source_url": "...-1024x1024.jpg" }
    }
  }
}
```

### Layer 2: Component State (Logo References) 💾

**Where:** `wp_postmeta` table with key `gmkb_media_kit_state`

**Structure:**
```json
{
  "sections": [
    {
      "id": "section-1",
      "components": [
        {
          "id": "comp-logo-grid-1",
          "type": "logo-grid",
          "data": {
            "title": "Featured In",
            "usePodsData": false,
            "logos": [
              {
                "url": "https://site.com/wp-content/uploads/2025/11/microsoft-logo.jpg",
                "name": "Microsoft",
                "alt": "Microsoft logo",
                "link": "https://microsoft.com",
                "linkNewTab": true
              },
              {
                "url": "https://site.com/wp-content/uploads/2025/11/apple-logo.jpg",
                "name": "Apple",
                "alt": "Apple logo"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

**What's Stored:**

The component data stores **ONLY the URL reference** to the media file, NOT the file itself:

```javascript
{
  "url": "https://site.com/wp-content/uploads/2025/11/logo.jpg",  // ← Reference to WP Media
  "name": "Company Name",      // ← User-provided
  "alt": "Company logo",       // ← User-provided
  "link": "https://company.com", // ← Optional user-provided
  "linkNewTab": true           // ← Only if checked
}
```

**Important:** Notice what's NOT saved:
- ❌ `id` - Temporary upload ID (removed before save)
- ❌ `thumbnail`, `medium`, `large` - Regenerated from URL
- ❌ `source`, `type` - Only relevant for Pods data
- ❌ Validation errors - UI state only

**How It Gets Here:**

1. User uploads logo via MediaUploader
2. MediaUploader emits `@select` event with file data:
   ```javascript
   {
     id: 123,
     url: "https://...",
     title: "Logo",
     alt: "Logo alt text",
     // ... other metadata
   }
   ```

3. LogoGridEditor receives the selection:
   ```javascript
   async function handleMediaSelect(selected) {
     const files = Array.isArray(selected) ? selected : [selected];
     
     files.forEach(file => {
       localData.value.logos.push({
         url: file.url,           // ← Store URL reference
         name: file.title,
         alt: file.alt,
         link: '',
         id: file.id              // ← Temporary (removed before save)
       });
     });
     
     updateComponent(); // Triggers save
   }
   ```

4. `updateComponent()` cleans and saves:
   ```javascript
   const updateComponent = () => {
     setTimeout(() => {
       // Clean data before saving
       const cleanLogos = localData.value.logos.map(logo => {
         const clean = {
           url: logo.url,    // ← Only the essentials
           name: logo.name,
           alt: logo.alt,
           link: logo.link
         };
         
         // Only include linkNewTab if true
         if (logo.linkNewTab === true) {
           clean.linkNewTab = true;
         }
         
         return clean;
       });
       
       // Save to Pinia store
       store.updateComponent(componentId, {
         data: { logos: cleanLogos, ... }
       });
     }, 300);
   }
   ```

5. Pinia store saves to WordPress:
   ```javascript
   // In mediaKit store
   async saveState() {
     const response = await fetch('/wp-json/gmkb/v2/state', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'X-WP-Nonce': nonce
       },
       body: JSON.stringify(this.state)
     });
   }
   ```

6. REST API saves to database:
   ```php
   // In REST API v2
   update_post_meta(
     $post_id,
     'gmkb_media_kit_state',
     $clean_state
   );
   ```

### Layer 3: Pods Custom Fields (Dynamic Source) 🔌

**Where:** Pods manages custom post meta

**Fields:**
```
personal_brand_logo      (Single file field)
company_logo            (Single file field)
featured_logos          (Repeatable file field - array)
```

**Storage:**
```sql
wp_postmeta
  ├── personal_brand_logo → 123 (attachment ID)
  ├── company_logo → 456 (attachment ID)
  ├── featured_logos → [789, 790, 791] (array of IDs)
```

**How This Works:**

When `usePodsData: true` is enabled, the component fetches logos from Pods instead of using stored component data:

```javascript
// In LogoGridRenderer.vue
const logos = computed(() => {
  // Priority 1: Custom logos (if usePodsData = false)
  if (data.usePodsData === false && data.logos) {
    return data.logos;
  }
  
  // Priority 2: Pods data (if usePodsData = true)
  if (data.usePodsData !== false) {
    const podsLogos = [];
    
    // Personal brand logo (single field)
    if (podsData.value?.personal_brand_logo) {
      podsLogos.push({
        url: podsData.value.personal_brand_logo.guid,
        name: 'Personal Brand'
      });
    }
    
    // Featured logos (repeatable field)
    if (podsData.value?.featured_logos) {
      podsData.value.featured_logos.forEach(logo => {
        podsLogos.push({
          url: logo.guid,
          name: logo.post_title
        });
      });
    }
    
    if (podsLogos.length > 0) return podsLogos;
  }
  
  // Priority 3: Fallback to component custom logos
  return data.logos || [];
});
```

## Complete Upload Flow (Step by Step)

### Step 1: User Clicks "Upload Logo(s)"

```vue
<!-- LogoGridEditor.vue -->
<MediaUploader
  ref="mediaUploaderRef"
  :multiple="true"
  @select="handleMediaSelect"
/>
```

### Step 2: MediaUploader Opens Modal

User can:
- Drag & drop files
- Click to browse files
- Select from existing media library

### Step 3: File Upload (if new file)

```javascript
// useMediaUpload.js
async function uploadSingleFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/wp-json/wp/v2/media', {
    method: 'POST',
    headers: { 'X-WP-Nonce': nonce },
    body: formData
  });
  
  const media = await response.json();
  
  return {
    id: media.id,
    url: media.source_url,
    thumbnail: media.media_details?.sizes?.thumbnail?.source_url,
    medium: media.media_details?.sizes?.medium?.source_url,
    title: media.title?.rendered,
    alt: media.alt_text
  };
}
```

**WordPress processes:**
1. Validates file type/size
2. Generates unique filename
3. Saves to `/uploads/YYYY/MM/`
4. Creates thumbnails
5. Inserts into `wp_posts` table
6. Returns attachment data

### Step 4: MediaUploader Emits Selection

```javascript
// MediaUploader.vue
function handleGallerySelect(selected) {
  emit('select', selected);
  closeGallery();
}
```

### Step 5: Editor Receives Selection

```javascript
// LogoGridEditor.vue
async function handleMediaSelect(selected) {
  const files = Array.isArray(selected) ? selected : [selected];
  
  files.forEach(file => {
    localData.value.logos.push({
      url: file.url,        // ← Store URL reference
      name: file.title,
      alt: file.alt,
      link: '',
      id: file.id          // ← Temporary
    });
  });
  
  updateComponent(); // Triggers save after 300ms
}
```

### Step 6: Data Cleaning & Save

```javascript
// LogoGridEditor.vue
const updateComponent = () => {
  setTimeout(() => {
    // CLEAN: Remove temporary fields
    const cleanLogos = localData.value.logos.map(logo => ({
      url: logo.url,      // ✅ Keep
      name: logo.name,    // ✅ Keep
      alt: logo.alt,      // ✅ Keep
      link: logo.link,    // ✅ Keep
      linkNewTab: logo.linkNewTab === true ? true : undefined // ✅ Only if true
      // ❌ id removed
      // ❌ thumbnail/medium/large removed
    }));
    
    store.updateComponent(componentId, {
      data: {
        logos: cleanLogos,
        title: localData.value.title,
        usePodsData: localData.value.usePodsData
      }
    });
  }, 300);
}
```

### Step 7: Store Saves to Database

```javascript
// Pinia store (auto-save)
watch(
  () => store.isDirty,
  (isDirty) => {
    if (isDirty) {
      debouncedSave();
    }
  }
);

async function saveState() {
  await fetch('/wp-json/gmkb/v2/state', {
    method: 'POST',
    body: JSON.stringify(store.state)
  });
}
```

### Step 8: Database Storage

```php
// REST API v2
update_post_meta(
  $post_id,
  'gmkb_media_kit_state',
  json_encode($state)
);
```

**Final database entry:**
```sql
INSERT INTO wp_postmeta 
  (post_id, meta_key, meta_value)
VALUES 
  (123, 'gmkb_media_kit_state', '{
    "sections": [{
      "components": [{
        "type": "logo-grid",
        "data": {
          "logos": [
            {
              "url": "https://site.com/wp-content/uploads/2025/11/logo.jpg",
              "name": "Microsoft",
              "alt": "Microsoft logo"
            }
          ]
        }
      }]
    }]
  }')
```

## Display Flow (Frontend)

### Step 1: Page Load

WordPress loads post meta:
```php
$state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
```

### Step 2: Vue Renders Component

```vue
<!-- LogoGridRenderer.vue -->
<template>
  <div class="logo-grid">
    <div v-for="logo in logos" class="logo-item">
      <img :src="logo.url" :alt="logo.alt" />
      <div class="logo-name">{{ logo.name }}</div>
    </div>
  </div>
</template>
```

### Step 3: Browser Loads Images

```html
<img src="https://site.com/wp-content/uploads/2025/11/microsoft-logo.jpg" 
     alt="Microsoft logo" />
```

Browser fetches the image file from the server.

## Key Principles

### 1. **Single Source of Truth**
- WordPress Media Library = Physical files
- Component State = Configuration (URLs + metadata)
- Pods = Optional dynamic content source

### 2. **No File Duplication**
- Files stored ONCE in WordPress uploads
- Components reference files by URL
- Multiple components can reference same file

### 3. **Clean Data Storage**
- Only essential data saved to database
- Temporary fields removed before save
- Optional fields only saved if set

### 4. **Efficient Loading**
- Thumbnail sizes for gallery view
- Medium sizes for display
- Full size on demand (lightbox)

## Database Size Optimization

### Before Cleanup:
```json
{
  "url": "...",
  "id": 123,
  "thumbnail": "...-150x150.jpg",
  "medium": "...-300x300.jpg",
  "large": "...-1024x1024.jpg",
  "full": "...",
  "filename": "logo.jpg",
  "filesize": 123456,
  "mime_type": "image/jpeg",
  "width": 800,
  "height": 600,
  "uploaded": "2025-11-10T12:00:00Z",
  "linkNewTab": false  // ← Even when false!
}
```
**Size:** ~400 bytes per logo

### After Cleanup:
```json
{
  "url": "...",
  "name": "Microsoft",
  "alt": "Microsoft logo",
  "link": "https://microsoft.com",
  "linkNewTab": true
}
```
**Size:** ~150 bytes per logo

**Savings:** 62% reduction per logo! 🎉

## Troubleshooting

### Images Not Displaying?

1. **Check URL:** View page source, verify `<img src="...">`
2. **Check Media Library:** Does attachment exist?
3. **Check Permissions:** Can WordPress serve the file?
4. **Check Component Data:** Does logo object have `url` field?

### Images Pixelated in Gallery?

- Was fixed by changing MediaGallery from `thumbnail` to `medium` size
- Thumbnail = 150×150px (pixelated when scaled)
- Medium = 300×300px (better quality)

### Uploads Failing?

1. **Check nonce:** Is REST API nonce valid?
2. **Check permissions:** Can user upload files?
3. **Check file size:** Within WordPress limits?
4. **Check file type:** Allowed MIME types?

---

**Last Updated:** November 10, 2025
