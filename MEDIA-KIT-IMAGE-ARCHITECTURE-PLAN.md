# Media Kit Image Architecture - Implementation Plan

**Date:** October 30, 2025  
**Strategy:** Hybrid Approach (Singles + Collections)  
**Goal:** Support all profile types with optimal user experience

---

## Executive Summary

This plan replaces the current fragmented image field structure (7 fields: vertical_image, horizontal_image, logo_image, carousel_images, guest_logo, guest_headshot, guest_carousel_images) with a streamlined hybrid approach that:

1. **Enforces critical singles** - Profile photo and logos (required/optional singles)
2. **Provides flexible collections** - Unlimited gallery photos and logos (repeatable)
3. **Auto-handles cropping** - One upload, multiple uses (square, portrait, landscape)
4. **Supports all profiles** - Speakers, podcasters, authors, consultants, influencers

---

## Recommended Pods Field Structure

### **Critical Singles (Enforced)**
```
1. profile_photo (Single file, optional)
   - Field Type: File / Image / Video
   - Purpose: Primary headshot/profile photo
   - Usage: Auto-cropped for Guest Intro, Hero, Contact, thumbnails
   - User uploads: Any size/orientation
   - System generates: Square (1:1), Portrait (4:5), Landscape (16:9)

2. personal_brand_logo (Single file, optional)
   - Field Type: File / Image / Video
   - Purpose: Personal brand mark/logo
   - Usage: Watermarks, headers, Logo Grid
   - User uploads: PNG with transparency preferred

3. company_logo (Single file, optional)
   - Field Type: File / Image / Video
   - Purpose: Current employer/business logo
   - Usage: Bio sections, Logo Grid
   - User uploads: PNG with transparency preferred
```

### **Flexible Collections (Repeatable)**
```
4. gallery_photos (Repeatable, max 50)
   - Field Type: File / Image / Video (repeatable)
   - Purpose: All additional photos (lifestyle, speaking, events, etc.)
   - Usage: Photo Gallery, Hero alternatives
   - User uploads: Multiple photos, any size
   - Metadata: Caption (optional), use_as_hero flag (optional)

5. featured_logos (Repeatable, max 50)
   - Field Type: File / Image / Video (repeatable)
   - Purpose: Media/clients/partners/certifications
   - Usage: Logo Grid component
   - User uploads: Multiple logos
   - Metadata: Type (dropdown), Name (text)
   - Types: "Featured In" | "Client" | "Partner" | "Certification"
```

---

## Component → Field Mapping

| Component | Pods Fields Used | Behavior |
|-----------|-----------------|----------|
| **Guest Intro** | `profile_photo` | Auto-crop to portrait (4:5), display with intro text |
| **Hero** | `profile_photo` OR first `gallery_photos` with `use_as_hero` flag | Auto-crop to landscape (16:9), large banner |
| **Photo Gallery** | `gallery_photos` | Display all images in grid, captions optional |
| **Logo Grid** | `personal_brand_logo`, `company_logo`, `featured_logos` | Display logos in grid, filterable by type |
| **Biography** | None (text only) | No images (Guest Intro handles profile photo) |
| **Contact** | `profile_photo` (optional) | Small thumbnail next to contact info |

---

## Migration Plan: Old → New Fields

### **Fields to Remove (Archive)**
```
❌ vertical_image          → Migrate to profile_photo
❌ horizontal_image        → Migrate to profile_photo or gallery_photos
❌ carousel_images         → Migrate to gallery_photos
❌ guest_carousel_images   → Migrate to gallery_photos
❌ logo_image              → Migrate to personal_brand_logo
❌ guest_logo              → Migrate to company_logo
❌ guest_headshot          → Migrate to profile_photo
```

### **Migration Script (Phase 0)**
```php
// Migration function to run once
function migrate_legacy_image_fields() {
    $guests = get_posts(['post_type' => 'guests', 'posts_per_page' => -1]);
    
    foreach ($guests as $guest) {
        $post_id = $guest->ID;
        
        // Migrate headshot → profile_photo
        $headshot = get_post_meta($post_id, 'guest_headshot', true);
        if ($headshot) {
            update_post_meta($post_id, 'profile_photo', $headshot);
        }
        
        // Migrate vertical/horizontal → profile_photo if empty
        if (!$headshot) {
            $vertical = get_post_meta($post_id, 'vertical_image', true);
            $horizontal = get_post_meta($post_id, 'horizontal_image', true);
            if ($vertical) {
                update_post_meta($post_id, 'profile_photo', $vertical);
            } elseif ($horizontal) {
                update_post_meta($post_id, 'profile_photo', $horizontal);
            }
        }
        
        // Migrate logos
        $logo_image = get_post_meta($post_id, 'logo_image', true);
        if ($logo_image) {
            update_post_meta($post_id, 'personal_brand_logo', $logo_image);
        }
        
        $guest_logo = get_post_meta($post_id, 'guest_logo', true);
        if ($guest_logo) {
            update_post_meta($post_id, 'company_logo', $guest_logo);
        }
        
        // Migrate carousel images → gallery_photos
        $carousel = get_post_meta($post_id, 'carousel_images', true);
        $guest_carousel = get_post_meta($post_id, 'guest_carousel_images', true);
        
        // Combine and migrate to gallery_photos
        // (Implementation depends on how carousel fields store data)
    }
}
```

---

## Phase 0: Preparation & Migration

**Objective:** Set up new field structure and migrate existing data

### **Tasks:**

1. **Create new Pods fields in WordPress admin:**
   ```
   Pod: guests
   
   New Fields:
   ├── profile_photo (File / Image / Video, single)
   ├── personal_brand_logo (File / Image / Video, single)
   ├── company_logo (File / Image / Video, single)
   ├── gallery_photos (File / Image / Video, repeatable, max 50)
   └── featured_logos (File / Image / Video, repeatable, max 50)
       ├── Sub-field: logo_type (dropdown: Featured In, Client, Partner, Certification)
       └── Sub-field: logo_name (text)
   ```

2. **Run migration script** (see above) to move data from old fields

3. **Test migration** on dev/staging environment

4. **Archive old fields** (don't delete yet - keep as backup)

**Deliverables:**
- ✅ New fields created in Pods
- ✅ Migration script executed successfully
- ✅ Data integrity verified
- ✅ Old fields archived (hidden from UI)

**Time Estimate:** 2-3 hours

---

## Phase 1: Core Implementation (MVP)

**Objective:** Implement basic Pods integration for all components

### **1.1 Photo Gallery Component**

**Files to Create/Modify:**
- `components/photo-gallery/data-integration.php` (NEW)
- `components/photo-gallery/pods-config.json` (UPDATE)
- `components/photo-gallery/PhotoGalleryEditor.vue` (UPDATE)

**Implementation:**

#### **data-integration.php**
```php
class Photo_Gallery_Data_Integration {
    protected static $field_mappings = array(
        'profile_photo' => 'profile_photo',
        'gallery_photos' => 'gallery_photos'
    );
    
    public static function load_component_data($post_id) {
        $result = array(
            'photos' => array(),
            'count' => 0,
            'success' => false
        );
        
        // Load profile photo
        $profile = get_post_meta($post_id, 'profile_photo', true);
        if ($profile) {
            $result['photos'][] = array(
                'url' => wp_get_attachment_url($profile),
                'caption' => 'Profile Photo',
                'source' => 'pods'
            );
            $result['count']++;
        }
        
        // Load gallery photos (repeatable field)
        $gallery = get_post_meta($post_id, 'gallery_photos', false);
        if (is_array($gallery)) {
            foreach ($gallery as $photo_id) {
                if ($photo_id) {
                    $result['photos'][] = array(
                        'url' => wp_get_attachment_url($photo_id),
                        'caption' => get_post_meta($photo_id, '_wp_attachment_image_alt', true),
                        'source' => 'pods'
                    );
                    $result['count']++;
                }
            }
        }
        
        $result['success'] = $result['count'] > 0;
        return $result;
    }
}
```

#### **pods-config.json**
```json
{
  "dataSource": "pods",
  "description": "Photo gallery loads from profile_photo and gallery_photos Pods fields",
  "fields": {
    "profile_photo": {
      "type": "file",
      "required": false,
      "description": "Primary profile photo"
    },
    "gallery_photos": {
      "type": "file",
      "repeatable": true,
      "max": 50,
      "required": false,
      "description": "Additional gallery photos"
    }
  }
}
```

#### **PhotoGalleryEditor.vue**
```vue
<template>
  <section class="editor-section">
    <h4>Photo Source</h4>
    
    <!-- Pods Photos -->
    <div v-if="podsPhotos.length > 0" class="pods-photos">
      <label>
        <input type="checkbox" v-model="localData.usePodsPhotos" />
        Use photos from Pods ({{ podsPhotos.length }} photos)
      </label>
      
      <div v-if="localData.usePodsPhotos" class="pods-photo-grid">
        <div v-for="(photo, idx) in podsPhotos" :key="idx" class="pods-photo">
          <img :src="photo.url" :alt="photo.caption" />
        </div>
      </div>
    </div>
    
    <!-- Custom Photos -->
    <div class="custom-photos">
      <h5>Custom Photos</h5>
      <div v-for="(photo, index) in localData.customPhotos" :key="index">
        <input v-model="photo.url" placeholder="Image URL" />
        <input v-model="photo.caption" placeholder="Caption (optional)" />
        <button @click="removePhoto(index)">Remove</button>
      </div>
      <button @click="addPhoto">+ Add Photo</button>
    </div>
  </section>
</template>

<script setup>
import { usePodsData } from '../../src/composables/usePodsData';

const { podsData } = usePodsData();

const podsPhotos = computed(() => {
  const photos = [];
  if (podsData.value?.profile_photo) {
    photos.push({ url: podsData.value.profile_photo, caption: 'Profile Photo' });
  }
  if (podsData.value?.gallery_photos) {
    photos.push(...podsData.value.gallery_photos);
  }
  return photos;
});
</script>
```

**Testing Checklist:**
- [ ] Photo Gallery loads profile_photo from Pods
- [ ] Photo Gallery loads gallery_photos from Pods
- [ ] Toggle between Pods/Custom photos works
- [ ] Custom photos can be added alongside Pods photos
- [ ] Preview displays all photos correctly
- [ ] Frontend displays all photos correctly

---

### **1.2 Logo Grid Component**

**Files to Create/Modify:**
- `components/logo-grid/data-integration.php` (NEW)
- `components/logo-grid/pods-config.json` (UPDATE)
- `components/logo-grid/LogoGridEditor.vue` (UPDATE)

**Implementation:**

#### **data-integration.php**
```php
class Logo_Grid_Data_Integration {
    protected static $field_mappings = array(
        'personal_brand_logo' => 'personal_brand_logo',
        'company_logo' => 'company_logo',
        'featured_logos' => 'featured_logos'
    );
    
    public static function load_component_data($post_id) {
        $result = array(
            'logos' => array(),
            'count' => 0,
            'success' => false
        );
        
        // Load personal brand logo
        $personal_logo = get_post_meta($post_id, 'personal_brand_logo', true);
        if ($personal_logo) {
            $result['logos'][] = array(
                'url' => wp_get_attachment_url($personal_logo),
                'name' => 'Personal Brand',
                'type' => 'brand',
                'source' => 'pods'
            );
            $result['count']++;
        }
        
        // Load company logo
        $company_logo = get_post_meta($post_id, 'company_logo', true);
        if ($company_logo) {
            $result['logos'][] = array(
                'url' => wp_get_attachment_url($company_logo),
                'name' => 'Company',
                'type' => 'company',
                'source' => 'pods'
            );
            $result['count']++;
        }
        
        // Load featured logos (repeatable field)
        if (function_exists('pods')) {
            $pod = pods('guests', $post_id);
            $featured = $pod->field('featured_logos');
            
            if (is_array($featured)) {
                foreach ($featured as $logo) {
                    $result['logos'][] = array(
                        'url' => $logo['guid'] ?? '',
                        'name' => $logo['logo_name'] ?? '',
                        'type' => $logo['logo_type'] ?? 'featured',
                        'source' => 'pods'
                    );
                    $result['count']++;
                }
            }
        }
        
        $result['success'] = $result['count'] > 0;
        return $result;
    }
}
```

#### **pods-config.json**
```json
{
  "dataSource": "pods",
  "description": "Logo grid loads from personal_brand_logo, company_logo, and featured_logos Pods fields",
  "fields": {
    "personal_brand_logo": {
      "type": "file",
      "required": false,
      "description": "Personal brand logo"
    },
    "company_logo": {
      "type": "file",
      "required": false,
      "description": "Company/employer logo"
    },
    "featured_logos": {
      "type": "file",
      "repeatable": true,
      "max": 50,
      "required": false,
      "description": "Featured in, clients, partners, certifications",
      "subfields": {
        "logo_type": {
          "type": "pick",
          "options": ["Featured In", "Client", "Partner", "Certification"]
        },
        "logo_name": {
          "type": "text"
        }
      }
    }
  }
}
```

#### **LogoGridEditor.vue**
```vue
<template>
  <section class="editor-section">
    <h4>Logo Source</h4>
    
    <!-- Pods Logos -->
    <div v-if="podsLogos.length > 0" class="pods-logos">
      <label>
        <input type="checkbox" v-model="localData.usePodsLogos" />
        Use logos from Pods ({{ podsLogos.length }} logos)
      </label>
      
      <div v-if="localData.usePodsLogos" class="pods-logo-grid">
        <div v-for="(logo, idx) in podsLogos" :key="idx" class="pods-logo">
          <img :src="logo.url" :alt="logo.name" />
          <span class="logo-name">{{ logo.name }}</span>
          <span class="logo-type">{{ logo.type }}</span>
        </div>
      </div>
    </div>
    
    <!-- Custom Logos -->
    <div class="custom-logos">
      <h5>Custom Logos</h5>
      <div v-for="(logo, index) in localData.customLogos" :key="index">
        <input v-model="logo.url" placeholder="Logo URL" />
        <input v-model="logo.name" placeholder="Name" />
        <button @click="removeLogo(index)">Remove</button>
      </div>
      <button @click="addLogo">+ Add Logo</button>
    </div>
  </section>
</template>

<script setup>
import { usePodsData } from '../../src/composables/usePodsData';

const { podsData } = usePodsData();

const podsLogos = computed(() => {
  const logos = [];
  if (podsData.value?.personal_brand_logo) {
    logos.push({ 
      url: podsData.value.personal_brand_logo, 
      name: 'Personal Brand',
      type: 'brand'
    });
  }
  if (podsData.value?.company_logo) {
    logos.push({ 
      url: podsData.value.company_logo, 
      name: 'Company',
      type: 'company'
    });
  }
  if (podsData.value?.featured_logos) {
    logos.push(...podsData.value.featured_logos);
  }
  return logos;
});
</script>
```

**Testing Checklist:**
- [ ] Logo Grid loads personal_brand_logo from Pods
- [ ] Logo Grid loads company_logo from Pods
- [ ] Logo Grid loads featured_logos from Pods
- [ ] Toggle between Pods/Custom logos works
- [ ] Custom logos can be added alongside Pods logos
- [ ] Logo types display correctly (Featured In, Client, etc.)
- [ ] Preview displays all logos correctly
- [ ] Frontend displays all logos correctly

---

### **1.3 Guest Intro Component**

**Files to Modify:**
- `components/guest-intro/pods-config.json` (UPDATE)
- `components/guest-intro/data-integration.php` (UPDATE - add profile_photo)

**Implementation:**

#### **pods-config.json**
```json
{
  "dataSource": "pods",
  "description": "Guest intro loads introduction text and profile photo from Pods",
  "fields": {
    "introduction": {
      "type": "paragraph",
      "required": false,
      "description": "Guest introduction text"
    },
    "first_name": {
      "type": "text",
      "required": false
    },
    "last_name": {
      "type": "text",
      "required": false
    },
    "profile_photo": {
      "type": "file",
      "required": false,
      "description": "Profile photo (auto-cropped to portrait)"
    }
  }
}
```

#### **Update data-integration.php**
Add profile_photo to field mappings and prepare_template_props to include the image URL.

**Testing Checklist:**
- [ ] Guest Intro loads profile_photo from Pods
- [ ] Profile photo displays correctly
- [ ] Introduction text displays correctly
- [ ] Frontend displays correctly

---

### **1.4 Hero Component** *(Phase 3 - Premium)*

**Note:** Hero component implementation will be covered in Phase 3.

**Brief Overview:**
- Load `profile_photo` as fallback
- Check `gallery_photos` for images with `use_as_hero` flag
- Auto-crop to landscape (16:9)
- Apply optional overlay/gradient

---

**Phase 1 Deliverables:**
- ✅ Photo Gallery fully integrated with Pods
- ✅ Logo Grid fully integrated with Pods
- ✅ Guest Intro includes profile photo
- ✅ All components support toggle between Pods/Custom
- ✅ All components tested and working

**Time Estimate:** 6-8 hours

---

## Phase 2: Smart Features & Enhancements

**Objective:** Add intelligent features to improve user experience

### **2.1 Auto-Cropping System**

**Implementation:**

#### **Create Image Processing Service**
`src/services/ImageCropService.js`

```javascript
class ImageCropService {
  /**
   * Generate multiple crop sizes from single image
   * @param {string} imageUrl - Original image URL
   * @returns {Object} - Object with different crop URLs
   */
  static async generateCrops(imageUrl) {
    // WordPress handles cropping via image sizes
    // Return different size URLs
    const imageId = this.getAttachmentIdFromUrl(imageUrl);
    
    return {
      original: imageUrl,
      square: this.getImageSize(imageId, 'square-800'),
      portrait: this.getImageSize(imageId, 'portrait-800x1000'),
      landscape: this.getImageSize(imageId, 'landscape-1200x675'),
      thumbnail: this.getImageSize(imageId, 'thumbnail-300')
    };
  }
  
  static getImageSize(attachmentId, size) {
    // Call WordPress REST API to get specific size
    return `/wp-json/wp/v2/media/${attachmentId}?size=${size}`;
  }
}
```

#### **Register WordPress Image Sizes**
`includes/image-sizes.php`

```php
// Register custom image sizes
add_action('after_setup_theme', function() {
    // Square crop (1:1)
    add_image_size('gmkb-square-800', 800, 800, true);
    
    // Portrait crop (4:5)
    add_image_size('gmkb-portrait-800', 800, 1000, true);
    
    // Landscape crop (16:9)
    add_image_size('gmkb-landscape-1200', 1200, 675, true);
    
    // Thumbnail
    add_image_size('gmkb-thumbnail-300', 300, 300, true);
});

// Make sizes available in REST API
add_filter('rest_prepare_attachment', function($response, $post, $request) {
    $response->data['media_details']['sizes']['gmkb-square-800'] = array(
        'file' => wp_get_attachment_image_src($post->ID, 'gmkb-square-800')[0],
        'width' => 800,
        'height' => 800,
        'source_url' => wp_get_attachment_image_src($post->ID, 'gmkb-square-800')[0]
    );
    // Repeat for other sizes...
    return $response;
}, 10, 3);
```

**Testing Checklist:**
- [ ] Upload image generates all crop sizes
- [ ] Guest Intro uses portrait crop
- [ ] Logo Grid uses square crop (if needed)
- [ ] Photo Gallery uses optimal sizes
- [ ] Crops maintain aspect ratio

---

### **2.2 Image Metadata & Captions**

**Implementation:**

Update `gallery_photos` field to support metadata:

#### **Pods Configuration**
```
Field: gallery_photos (Repeatable)
├── photo (File)
├── caption (Text, optional)
├── credit (Text, optional)
└── use_as_hero (Checkbox, optional)
```

#### **Update PhotoGalleryRenderer.vue**
```vue
<div class="photo-item">
  <img :src="photo.url" :alt="photo.caption" />
  <div v-if="photo.caption" class="photo-caption">
    {{ photo.caption }}
  </div>
  <div v-if="photo.credit" class="photo-credit">
    Photo by {{ photo.credit }}
  </div>
</div>
```

**Testing Checklist:**
- [ ] Captions display in gallery
- [ ] Credits display in gallery
- [ ] Hero flag works for selecting hero image

---

### **2.3 Bulk Upload & Management**

**Implementation:**

#### **Bulk Upload UI**
`components/photo-gallery/BulkUpload.vue`

```vue
<template>
  <div class="bulk-upload">
    <button @click="openMediaLibrary">Upload Multiple Photos</button>
    
    <div v-if="selectedPhotos.length > 0" class="selected-photos">
      <h5>Selected Photos ({{ selectedPhotos.length }})</h5>
      <div class="photo-grid">
        <div v-for="photo in selectedPhotos" :key="photo.id">
          <img :src="photo.url" />
          <input v-model="photo.caption" placeholder="Caption" />
          <button @click="removePhoto(photo.id)">Remove</button>
        </div>
      </div>
      <button @click="savePhotos">Save to Gallery</button>
    </div>
  </div>
</template>
```

**Testing Checklist:**
- [ ] Can select multiple images at once
- [ ] Bulk upload saves to Pods correctly
- [ ] Can add captions during bulk upload

---

**Phase 2 Deliverables:**
- ✅ Auto-cropping system implemented
- ✅ Image metadata (captions, credits) working
- ✅ Bulk upload functionality
- ✅ Image management UI improvements

**Time Estimate:** 4-6 hours

---

## Phase 3: Premium Components & Advanced Features

**Objective:** Implement Hero component and advanced features

### **3.1 Hero Component Integration**

**Implementation follows same pattern as Video Intro:**
- Load `profile_photo` or `gallery_photos` with `use_as_hero` flag
- Auto-crop to landscape (16:9)
- Support overlay/gradient options

### **3.2 Advanced Features (Future)**

**Potential enhancements:**
- Focal point selection (mark face/subject position)
- Drag-and-drop reordering
- Image filters (grayscale, sepia, etc.)
- AI-powered alt text generation
- Image compression optimization
- Lazy loading implementation
- Progressive image loading

---

## Implementation Priority

### **Immediate (Start Now):**
1. ✅ Phase 0: Create new fields and migrate data
2. ✅ Phase 1: Photo Gallery Pods integration
3. ✅ Phase 1: Logo Grid Pods integration

### **Next (After Photo Gallery & Logo Grid working):**
4. ⏳ Phase 1: Guest Intro photo integration
5. ⏳ Phase 2: Auto-cropping system
6. ⏳ Phase 2: Metadata & captions

### **Future (After core features stable):**
7. 🚀 Phase 3: Hero component
8. 🚀 Phase 3: Advanced features

---

## User Workflows

### **Workflow 1: Minimal Setup (Podcaster)**
```
1. Upload profile photo → Appears in Guest Intro, Contact
2. Upload personal logo → Appears in header/footer
3. Add 5 "Featured In" logos → Logo Grid displays them
Result: Professional media kit in 5 minutes
```

### **Workflow 2: Rich Media (Speaker)**
```
1. Upload profile photo → Multiple components use it
2. Upload 15 event photos → Photo Gallery displays them
3. Mark 1 photo "use as hero" → Hero component uses it
4. Upload personal + company logos → Logo Grid shows them
5. Add 20 client logos with names → Logo Grid categorizes them
Result: Comprehensive media kit with rich visuals
```

### **Workflow 3: Hybrid (Author)**
```
1. Upload profile photo from Pods
2. Upload 5 book covers to Photo Gallery via Pods
3. Add 3 custom promotional images via component editor
4. Upload author brand logo to Pods
5. Add 8 media logos to Pods
Result: Mixed Pods + Custom media kit
```

---

## Testing Strategy

### **Unit Tests**
- Image cropping functions
- Data integration classes
- Metadata handling

### **Integration Tests**
- Pods field loading
- Component rendering with Pods data
- Toggle between Pods/Custom

### **User Acceptance Tests**
- Upload workflow is intuitive
- Images display correctly across all components
- Performance is acceptable with 50 images
- No data loss on save/reload

---

## Success Metrics

**Phase 1 Success:**
- ✅ All components load Pods images correctly
- ✅ Users can toggle between Pods/Custom
- ✅ No regression in existing functionality
- ✅ Page load time < 3 seconds with 20 images

**Phase 2 Success:**
- ✅ Auto-cropping works for all orientations
- ✅ Bulk upload saves time (upload 10 images in < 2 minutes)
- ✅ Captions display correctly

**Phase 3 Success:**
- ✅ Hero component uses best image automatically
- ✅ Advanced features improve user experience
- ✅ System scales to 100+ images without issues

---

## Architecture Compliance Checklist

### **Before Starting Implementation:**
- [ ] Read through entire plan
- [ ] Understand hybrid approach rationale
- [ ] Review component mappings
- [ ] Verify Pods field structure

### **During Implementation:**
- [ ] Follow data-integration.php pattern (from video-intro)
- [ ] Use event-driven architecture (no polling)
- [ ] Implement proper error handling
- [ ] Add debug logging (WP_DEBUG)
- [ ] Sanitize all inputs
- [ ] Use single source of truth (Pods)

### **After Implementation:**
- [ ] Test all components thoroughly
- [ ] Verify data persistence
- [ ] Check frontend rendering
- [ ] Test toggle functionality
- [ ] Verify no console errors
- [ ] Test with various image sizes/formats

---

## Next Conversation Starter

**Copy/paste this to start implementation in new conversation:**

```
I need to implement Phase 1 of the Media Kit Image Architecture Plan.

CONTEXT:
- We're replacing 7 fragmented image fields with a hybrid approach
- 5 new Pods fields: profile_photo, personal_brand_logo, company_logo, gallery_photos, featured_logos
- Components: Photo Gallery, Logo Grid need Pods integration

PHASE 1 TASKS:
1. Photo Gallery - Pods integration (data-integration.php + editor updates)
2. Logo Grid - Pods integration (data-integration.php + editor updates)
3. Guest Intro - Add profile_photo support

REFERENCE:
- Follow video-intro pattern (already implemented)
- Use hybrid approach (Pods + Custom toggle)
- File locations: components/[component-name]/

Please start with Photo Gallery component implementation.
```

---

## Document Version

**Version:** 1.0  
**Date:** October 30, 2025  
**Status:** Ready for Implementation  
**Next Review:** After Phase 1 completion
