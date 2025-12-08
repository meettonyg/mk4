# Using Media Library for Headshot Selection

## Current Functionality: Already Implemented! ✅

### How to Select Existing Images (No Re-Upload)

#### Step 1: Open Logo Grid Editor
- Click to edit Logo Grid component

#### Step 2: Click "Upload Logo(s)" Button
- This opens the MediaUploader modal

#### Step 3: Switch to "Media Library" Tab
- You'll see TWO tabs at the top:
  - **Upload Files** (for new uploads)
  - **Media Library** (for existing images) ← Click this!

#### Step 4: Browse Existing Images
- See ALL previously uploaded media
- Search by filename
- Filter by type (JPEG, PNG, etc.)
- Images show at 300x300 quality (clear, not pixelated)

#### Step 5: Select Image(s)
- Click on any existing image
- Multiple selection supported
- Selected images show checkmark
- Click "Insert Selected"

#### Step 6: Done!
- Image added to Logo Grid
- No upload bandwidth used
- No duplicate files created
- Same file referenced by URL

## Example Workflow

### Scenario: Speaker has headshots already uploaded

**First Time:**
```
1. Upload headshot via MediaUploader → "Upload Files" tab
2. WordPress stores: /uploads/2025/11/speaker-headshot.jpg
3. Logo Grid stores: { "url": "https://.../speaker-headshot.jpg" }
```

**Next Time (Different Media Kit):**
```
1. Open Logo Grid editor
2. Click "Upload Logo(s)"
3. Switch to "Media Library" tab
4. Find "speaker-headshot.jpg" in gallery
5. Click it → "Insert Selected"
6. Done! Same file, no re-upload
```

**Result:**
- Both media kits reference SAME file
- No duplication
- Change file once, both update

## Media Library Features

### Search
- Search box at top
- Searches filename and title
- Example: Type "headshot" to find all headshots

### Filter
- Dropdown to filter by type
- JPEG, PNG, GIF, WebP
- Helps narrow results

### Visual Preview
- 300x300px thumbnails (clear quality)
- See image before selecting
- Hover for details

### Multiple Selection
- Check multiple images at once
- Bulk insert supported
- Great for logo grids

## Storage & Efficiency

### WordPress Media Library (Central Repository)
```
/wp-content/uploads/
└── 2025/11/
    ├── kerstin-headshot.jpg         (original)
    ├── kerstin-headshot-150x150.jpg (thumbnail)
    ├── kerstin-headshot-300x300.jpg (medium)
    └── kerstin-headshot-1024x1024.jpg (large)
```

### Component References (Multiple Media Kits)
```json
// Media Kit 1 - Logo Grid
{
  "logos": [
    { "url": "https://site.com/uploads/2025/11/kerstin-headshot.jpg" }
  ]
}

// Media Kit 2 - Logo Grid  
{
  "logos": [
    { "url": "https://site.com/uploads/2025/11/kerstin-headshot.jpg" }
  ]
}
```

**Key Points:**
- ✅ ONE file on server
- ✅ TWO components reference it
- ✅ Change file → both update
- ✅ Delete file → both show broken link (intentional, prevents accidental deletion)

## Comparison: Media Library vs Pods

### Media Library Selection (Current)
```
User Flow:
1. Open component editor
2. Click "Upload Logo(s)"
3. Switch to "Media Library" tab
4. Select existing image
5. Done

Storage:
- File: WordPress Media Library
- Reference: Component JSON

Re-use:
- Can select same file in multiple components
- Can select same file in multiple media kits
- Manual selection each time
```

### Pods Integration (Alternative)
```
User Flow:
1. Upload to Pods field (once)
2. Component automatically loads it
3. Done

Storage:
- File: WordPress Media Library (same)
- Reference: Pods meta field
- Component: Pulls from Pods

Re-use:
- Automatic on all media kits
- No manual selection needed
- Change once, updates everywhere
```

## Which Approach for Headshots?

### Use Case 1: **Same Headshot Everywhere**
**Use:** Profile Photo component with Pods

**Why:**
- Upload once, appears on all media kits
- Change once, updates all pages
- No repetitive selection

**Example:**
- Speaker's primary headshot
- Author photo for all books
- CEO headshot for all press kits

### Use Case 2: **Different Headshot Per Context**
**Use:** Logo Grid with Media Library selection

**Why:**
- Different headshot for different audiences
- Formal vs casual contexts
- Different outfit/background per event

**Example:**
- Corporate headshot for business events
- Casual headshot for tech conferences
- Professional photo for medical talks

### Use Case 3: **Multiple Team Members**
**Use:** Logo Grid with Media Library selection

**Why:**
- Not about one person (no Pods field)
- Select different team members per page
- Flexible roster

**Example:**
- Team page with multiple speakers
- Panel discussion participants
- Company leadership grid

## Recommendation for Your Use Case

Based on your question: **"swap out and not need to upload a new image each time"**

### **Use Media Library Selection** ✅

**Reason:**
- You said "**swap out**" - implies variation per media kit
- You want to "**not upload new**" - Media Library tab solves this
- You're using Logo Grid - already built for this

**How User Does It:**
1. **First upload** (one time):
   - Upload all headshot variations to Media Library
   - Professional headshot
   - Casual headshot  
   - Event-specific photos

2. **Each media kit** (quick):
   - Open Logo Grid editor
   - Click "Upload Logo(s)" → Media Library tab
   - Select appropriate headshot for this context
   - Insert → Done in 3 clicks

3. **Result:**
   - No duplicate uploads
   - No Pods configuration needed
   - Maximum flexibility
   - User-friendly

## Technical Details: How Selection Works

### MediaUploader Component Code
```vue
<template>
  <div class="gmkb-media-uploader__tabs">
    <!-- Tab 1: Upload New Files -->
    <button @click="activeTab = 'upload'">
      Upload Files
    </button>
    
    <!-- Tab 2: Select Existing Files -->
    <button @click="activeTab = 'gallery'">
      Media Library  ← User clicks this
    </button>
  </div>
  
  <!-- Media Library Tab Content -->
  <div v-if="activeTab === 'gallery'">
    <MediaGallery
      :multiple="true"
      @select="handleSelect"
    />
  </div>
</template>
```

### MediaGallery Loads Existing Files
```javascript
// Fetches from WordPress Media Library
async function loadMediaLibrary() {
  const response = await fetch('/wp-json/wp/v2/media?per_page=20');
  const media = await response.json();
  
  // Display in gallery grid
  mediaItems.value = media.map(item => ({
    id: item.id,
    url: item.source_url,
    medium: item.media_details?.sizes?.medium?.source_url,
    title: item.title.rendered
  }));
}
```

### User Selects → Component Stores
```javascript
// LogoGridEditor receives selection
function handleMediaSelect(selected) {
  const files = Array.isArray(selected) ? selected : [selected];
  
  files.forEach(file => {
    localData.value.logos.push({
      url: file.url,        // ← URL reference to existing file
      name: file.title,
      alt: file.alt
    });
  });
  
  updateComponent(); // Saves to JSON
}
```

### Final JSON
```json
{
  "logos": [
    {
      "url": "https://site.com/uploads/2025/11/headshot.jpg",
      "name": "Professional Headshot"
    }
  ]
}
```

## User Documentation

### How to Reuse Images Without Re-Uploading

**For Headshots, Logos, or Any Images:**

1. **Build Your Media Library First**
   - Upload all your headshots once
   - Upload all your logos once
   - Upload any image you'll reuse

2. **When Adding to Components**
   - Click the upload button
   - Switch to "Media Library" tab
   - Select from existing images
   - No new upload needed!

3. **Benefits**
   - Faster (no upload wait)
   - Organized (see all your images)
   - Efficient (no duplicates)
   - Consistent (same image everywhere you use it)

## Summary

**Your question:** "Can I use media gallery for headshot so user can swap without re-upload?"

**Answer:** **YES! This already works perfectly!** ✅

**How:**
1. Click "Upload Logo(s)" button
2. Switch to "Media Library" tab (don't use Upload tab)
3. Select existing image
4. Done - no upload, no duplication

**When to use:**
- ✅ Different headshot per media kit
- ✅ Want to choose from uploaded images
- ✅ Need flexibility per context

**When to use Pods instead:**
- ✅ Same headshot on ALL media kits always
- ✅ Want automatic loading
- ✅ Change once, update everywhere

**For your use case (swapping headshots):** Use the Media Library tab! It's perfect for this.

---

**Want me to:**
1. Create user guide on Media Library tab usage?
2. Show how to set up Pods for automatic headshot if you prefer that?
3. Explain other components that could use this pattern?
