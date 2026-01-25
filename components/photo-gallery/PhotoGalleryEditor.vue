<template>
  <ComponentEditorTemplate
    :component-id="componentId"
    component-type="Photo Gallery"
    :show-typography="true"
    :active-tab="activeTab"
    @update:active-tab="activeTab = $event"
    @close="handleClose"
  >
    <template #content>
      <div class="content-fields">
        <section class="editor-section">
          <h4>Section Settings</h4>
          
          <div class="field-group">
            <label for="gallery-title">Section Title</label>
            <input
              id="gallery-title" 
              v-model="localData.title" 
              @input="updateComponent"
              type="text" 
              placeholder="e.g., Photo Gallery" 
            />
          </div>
          
          <div class="field-group">
            <label for="gallery-description">Description</label>
            <textarea
              id="gallery-description" 
              v-model="localData.description" 
              @input="updateComponent" 
              rows="2"
              placeholder="Optional description..."
            />
          </div>
        </section>

        <section class="editor-section">
          <h4>Photo Source</h4>

          <!-- PHASE 5: Profile Image Picker -->
          <ProfileImagePicker
            type="carousel"
            title="Use from Profile Branding"
            icon="🖼️"
            @select="handleProfilePhotoSelect"
          />

          <!-- Custom Photos Section -->
          <div>
            <div class="field-group">
              <MediaUploader
                v-if="localData.photos.length < 12"
                ref="mediaUploaderRef"
                label="Upload Photo(s)"
                :multiple="true"
                :accepted-types="['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']"
                :max-size="10 * 1024 * 1024"
                @select="handleMediaSelect"
              />
              <p class="field-hint">Upload or select photos from media library (up to 12 total)</p>
            </div>

            <p class="help-text">Or add photos manually:</p>
            
            <!-- ✅ DRAG-AND-DROP: Draggable wrapper for photos list -->
            <draggable 
              v-model="localData.photos" 
              @end="updateComponent"
              item-key="url"
              handle=".drag-handle"
              class="photos-list"
              ghost-class="ghost-item"
              animation="200"
            >
              <template #item="{element: photo, index}">
              <div class="photo-item">
                <div class="photo-header">
                  <!-- ✅ DRAG HANDLE -->
                  <div class="drag-handle" title="Drag to reorder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                  </div>
                  <span class="photo-number">Photo {{ index + 1 }}</span>
                  <button 
                    @click="removePhoto(index)" 
                    class="remove-btn"
                    title="Remove photo"
                  >×</button>
                </div>
                
                <div class="field-group">
                  <label>Image URL *</label>
                  <input 
                    v-model="photo.url" 
                    @input="updateComponent" 
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
                
                <div class="field-group">
                  <label>Caption</label>
                  <input 
                    v-model="photo.caption" 
                    @input="updateComponent"
                    type="text"
                    placeholder="Optional caption..."
                  />
                </div>
                
                <div class="field-group">
                  <label>Alt Text (SEO)
                    <span class="seo-badge" title="Improves search engine ranking">SEO</span>
                  </label>
                  <input 
                    v-model="photo.alt" 
                    @input="updateComponent"
                    type="text"
                    placeholder="Describe this photo for screen readers and search engines"
                  />
                  <p class="field-hint">E.g., "Speaking at Tech Conference 2024". Helps with SEO and accessibility.</p>
                </div>
                
                <!-- Image Preview & Crop Button -->
                <div v-if="photo.url" class="image-preview-section">
                  <div class="image-preview-wrapper">
                    <img :src="photo.url" :alt="photo.alt || 'Preview'" class="image-preview" />
                    <button 
                      @click="openCropper(index)"
                      class="crop-btn"
                      type="button"
                      title="Crop image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"></path>
                        <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"></path>
                      </svg>
                      Crop
                    </button>
                  </div>
                </div>
              </div>
              </template>
            </draggable>
            
            <button 
              v-if="localData.photos.length < 12" 
              @click="addPhoto" 
              class="add-btn"
            >
              + Add Photo
            </button>
          </div>
        </section>

        <section class="editor-section">
          <h4>Display Options</h4>
          
          <!-- ✅ NEW: Layout Style Selector -->
          <div class="field-group">
            <label for="layout-style">Layout Style</label>
            <select 
              id="layout-style"
              v-model="localData.layoutStyle" 
              @change="handleLayoutChange"
            >
              <option value="grid">Standard Grid</option>
              <option value="masonry">Masonry (Pinterest Style)</option>
              <option value="carousel">Carousel/Slider</option>
            </select>
            <p class="field-hint">Choose how your photos are displayed</p>
          </div>

          <!-- ✅ Grid-specific options (only show for grid/masonry) -->
          <div v-if="localData.layoutStyle !== 'carousel'" class="field-group">
            <label for="columns">Grid Columns</label>
            <select 
              id="columns"
              v-model="localData.columns" 
              @change="updateComponent"
            >
              <option value="2">2 Columns</option>
              <option value="3">3 Columns</option>
              <option value="4">4 Columns</option>
            </select>
          </div>

          <!-- ✅ NEW: Conditional Carousel Settings -->
          <div v-if="localData.layoutStyle === 'carousel'" class="carousel-settings">
            <h5 class="subsection-title">Carousel Settings</h5>
            
            <div class="field-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="localData.carouselSettings.autoplay"
                  @change="updateComponent"
                />
                <span>Autoplay</span>
              </label>
            </div>

            <div v-if="localData.carouselSettings.autoplay" class="field-group">
              <label for="autoplay-speed">Autoplay Speed (ms)</label>
              <input 
                type="number"
                id="autoplay-speed"
                v-model.number="localData.carouselSettings.autoplaySpeed"
                @change="updateComponent"
                min="1000"
                max="10000"
                step="500"
              />
              <p class="field-hint">Time between slides (1000ms = 1 second)</p>
            </div>

            <div class="field-group">
              <label for="slides-desktop">Slides to Show (Desktop)</label>
              <input 
                type="number"
                id="slides-desktop"
                v-model.number="localData.carouselSettings.slidesToShow"
                @change="updateComponent"
                min="1"
                max="6"
              />
            </div>

            <div class="field-group">
              <label for="slides-tablet">Slides to Show (Tablet)</label>
              <input 
                type="number"
                id="slides-tablet"
                v-model.number="localData.carouselSettings.slidesToShowTablet"
                @change="updateComponent"
                min="1"
                max="4"
              />
            </div>

            <div class="field-group">
              <label for="slides-mobile">Slides to Show (Mobile)</label>
              <input 
                type="number"
                id="slides-mobile"
                v-model.number="localData.carouselSettings.slidesToShowMobile"
                @change="updateComponent"
                min="1"
                max="2"
              />
            </div>

            <div class="field-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="localData.carouselSettings.arrows"
                  @change="updateComponent"
                />
                <span>Show Navigation Arrows</span>
              </label>
            </div>

            <div class="field-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="localData.carouselSettings.dots"
                  @change="updateComponent"
                />
                <span>Show Pagination Dots</span>
              </label>
            </div>
          </div>
          
          <div class="field-group">
            <label for="caption-style">Caption Style</label>
            <select 
              id="caption-style"
              v-model="localData.captionStyle" 
              @change="updateComponent"
            >
              <option value="overlay">Overlay (Always Visible)</option>
              <option value="below">Below Image</option>
              <option value="hover">Show on Hover</option>
              <option value="none">No Captions</option>
            </select>
            <p class="field-hint">Choose how photo captions are displayed</p>
          </div>
        </section>
      </div>
    </template>
  </ComponentEditorTemplate>
  
  <!-- Image Cropper Component -->
  <ImageCropper 
    ref="cropperRef"
    :image-url="currentCropImageUrl"
    @crop="handleCropComplete"
    @cancel="currentCropIndex = null"
  />
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import draggable from 'vuedraggable';
import { useMediaKitStore } from '@/stores/mediaKit';
import { ToastService } from '@/services/ToastService';
import ComponentEditorTemplate from '@/vue/components/sidebar/editors/ComponentEditorTemplate.vue';
import ImageCropper from '@/vue/components/shared/ImageCropper.vue';
import MediaUploader from '@/vue/components/shared/MediaUploader.vue';
// PHASE 5: Profile branding integration
import ProfileImagePicker from '@/vue/components/shared/ProfileImagePicker.vue';

const props = defineProps({ 
  componentId: { 
    type: String, 
    required: true 
  } 
});

const emit = defineEmits(['close']);

const store = useMediaKitStore();

// Active tab state
const activeTab = ref('content');

// Image cropper state
const cropperRef = ref(null);
const currentCropIndex = ref(null);

// Media uploader ref
const mediaUploaderRef = ref(null);

const localData = ref({ 
  title: 'Photo Gallery', 
  description: '', 
  photos: [], 
  columns: '3',
  captionStyle: 'overlay', // Default caption style
  layoutStyle: 'grid', // ✅ NEW: Default layout style
  carouselSettings: { // ✅ NEW: Carousel settings (only saved when carousel selected)
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 3,
    slidesToShowTablet: 2,
    slidesToShowMobile: 1,
    infinite: true,
    arrows: true,
    dots: true
  },
  usePodsData: false
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component?.data) {
    localData.value = {
      title: component.data.title || 'Photo Gallery',
      description: component.data.description || '',
      photos: Array.isArray(component.data.photos) 
        ? [...component.data.photos] 
        : [],
      columns: component.data.columns || '3',
      captionStyle: component.data.captionStyle || 'overlay',
      layoutStyle: component.data.layoutStyle || 'grid', // ✅ Load layout style
      carouselSettings: component.data.carouselSettings || { // ✅ Load carousel settings
        autoplay: true,
        autoplaySpeed: 3000,
        slidesToShow: 3,
        slidesToShowTablet: 2,
        slidesToShowMobile: 1,
        infinite: true,
        arrows: true,
        dots: true
      },
      usePodsData: false
    };
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

// Add photo
const addPhoto = () => {
  localData.value.photos.push({ 
    url: '', 
    caption: '',
    alt: ''  // ✅ NEW: Alt text for SEO
  });
  updateComponent();
};

// Remove photo
const removePhoto = (index) => {
  localData.value.photos.splice(index, 1);
  updateComponent();
};

// ✅ NEW: Handle layout change - Initialize or clean up carousel settings
const handleLayoutChange = () => {
  // Initialize carousel settings if switching to carousel
  if (localData.value.layoutStyle === 'carousel' && !localData.value.carouselSettings) {
    localData.value.carouselSettings = {
      autoplay: true,
      autoplaySpeed: 3000,
      slidesToShow: 3,
      slidesToShowTablet: 2,
      slidesToShowMobile: 1,
      infinite: true,
      arrows: true,
      dots: true
    };
  }
  
  // ✅ NO BLOAT: Clean up carousel settings if switching away
  // (Settings will not be saved in updateComponent if layoutStyle !== 'carousel')
  
  updateComponent();
};

// Update component with debouncing
let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) clearTimeout(updateTimeout);
  
  updateTimeout = setTimeout(() => {
    const dataToSave = {
      title: localData.value.title,
      description: localData.value.description,
      photos: localData.value.photos,
      columns: localData.value.columns,
      captionStyle: localData.value.captionStyle,
      layoutStyle: localData.value.layoutStyle // ✅ Save layout style
    };
    
    // ✅ NO BLOAT: Only save carouselSettings when layoutStyle is 'carousel'
    if (localData.value.layoutStyle === 'carousel') {
      dataToSave.carouselSettings = localData.value.carouselSettings;
    }
    // If layout is NOT carousel, carouselSettings won't be saved (no bloat)
    
    store.updateComponent(props.componentId, { data: dataToSave });
    store.isDirty = true;
  }, 300);
};

// Handle media selection from MediaUploader
const handleMediaSelect = async (selected) => {
  try {
    // Handle both single file and array
    const attachments = Array.isArray(selected) ? selected : [selected];

    if (attachments && attachments.length > 0) {
      // Add each photo, respecting the 12 photo limit
      attachments.forEach(attachment => {
        if (localData.value.photos.length < 12) {
          // Sanitize URL (decode HTML entities)
          const sanitizedUrl = attachment.url
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'");

          localData.value.photos.push({
            url: sanitizedUrl,
            caption: attachment.caption || attachment.title || '',
            alt: attachment.alt || attachment.title || '',
            id: attachment.id
          });
        }
      });

      // Save to Pods field
      await savePhotosToPods();

      // Update component
      updateComponent();

      // Show success toast
      ToastService.success(
        `${attachments.length} photo${attachments.length > 1 ? 's' : ''} uploaded successfully`,
        { duration: 3000 }
      );
    }
  } catch (error) {
    console.error('Failed to upload photos:', error);
    ToastService.error(
      'Failed to upload photos. Please try again.',
      { duration: 5000 }
    );
  }
};

// Save photos to Pods field
const savePhotosToPods = async () => {
  const postId = store.postId;
  if (!postId || !localData.value.photos || localData.value.photos.length === 0) {
    return;
  }
  
  try {
    // Extract photo IDs for Pods field (repeatable file field)
    const photoIds = localData.value.photos
      .map(photo => photo.id)
      .filter(id => id); // Remove any null/undefined IDs
    
    if (photoIds.length === 0) {
      return;
    }
    
    // Update Pods field via REST API
    const response = await fetch(`${window.wpApiSettings.root}wp/v2/media-kit/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': window.wpApiSettings.nonce
      },
      body: JSON.stringify({
        meta: {
          gallery_photos: photoIds
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save photos: ${response.statusText}`);
    }
    
    console.log('✅ Photos saved to Pods field successfully');
  } catch (error) {
    console.error('Error saving photos to Pods:', error);
    ToastService.warning(
      'Photos added to component but not saved to profile',
      { duration: 5000 }
    );
  }
};

const handleClose = () => emit('close');

// Computed property for current crop image URL
const currentCropImageUrl = computed(() => {
  if (currentCropIndex.value !== null && localData.value.photos[currentCropIndex.value]) {
    return localData.value.photos[currentCropIndex.value].url;
  }
  return '';
});

// Open image cropper
const openCropper = (index) => {
  currentCropIndex.value = index;
  setTimeout(() => {
    cropperRef.value?.open();
  }, 100);
};

// Handle crop complete
const handleCropComplete = async ({ blob, url }) => {
  if (currentCropIndex.value === null) return;
  
  try {
    // Create a File object from the blob
    const file = new File([blob], `cropped-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
    
    // Upload the cropped image to WordPress media library
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', `Cropped Photo ${currentCropIndex.value + 1}`);
    
    const response = await fetch(`${window.wpApiSettings.root}wp/v2/media`, {
      method: 'POST',
      headers: {
        'X-WP-Nonce': window.wpApiSettings.nonce
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload cropped image');
    }
    
    const attachment = await response.json();
    
    // Update photo URL with the new cropped image
    localData.value.photos[currentCropIndex.value].url = attachment.source_url;
    localData.value.photos[currentCropIndex.value].id = attachment.id;
    
    // Update component
    updateComponent();
    
    ToastService.success('Image cropped successfully', { duration: 3000 });
  } catch (error) {
    console.error('Error uploading cropped image:', error);
    ToastService.error('Failed to save cropped image', { duration: 5000 });
  } finally {
    currentCropIndex.value = null;
  }
};

/**
 * PHASE 5: Handle selection from profile branding carousel images
 * @param {Object} image - Selected image object from ProfileImagePicker
 */
const handleProfilePhotoSelect = (image) => {
  if (!image) return;

  // Check photo limit
  if (localData.value.photos.length >= 12) {
    ToastService.warning('Maximum 12 photos allowed', { duration: 3000 });
    return;
  }

  console.log('🖼️ Photo Gallery: Selected from profile branding', image);

  // Add the photo to the list
  localData.value.photos.push({
    url: image.url,
    caption: image.alt || '',
    alt: image.alt || '',
    id: image.id,
    source: 'profile'
  });

  // Update component
  updateComponent();

  ToastService.success('Photo added from profile branding', { duration: 2000 });
};
</script>

<style scoped>
.content-fields {
  padding: 20px;
}

.editor-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
}

body.dark-mode .editor-section {
  background: #1e293b;
  border-color: #334155;
}

.editor-section:last-child {
  margin-bottom: 0;
}

.editor-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

body.dark-mode .editor-section h4 {
  color: #94a3b8;
}

.help-text {
  margin: -8px 0 16px 0;
  font-size: 12px;
  color: #64748b;
}

body.dark-mode .help-text {
  color: #94a3b8;
}

.field-group {
  margin-bottom: 12px;
}

.field-group:last-child {
  margin-bottom: 0;
}

.field-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

body.dark-mode .field-group label {
  color: #94a3b8;
}

.field-group input,
.field-group select,
.field-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #1f2937;
  transition: all 0.2s;
  font-family: inherit;
}

body.dark-mode .field-group input,
body.dark-mode .field-group select,
body.dark-mode .field-group textarea {
  background: #0f172a;
  border-color: #334155;
  color: #f3f4f6;
}

.field-group input:focus,
.field-group select:focus,
.field-group textarea:focus {
  outline: none;
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.field-group textarea {
  resize: vertical;
}

/* Pods Data Toggle */
.pods-data-toggle {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

body.dark-mode .pods-data-toggle {
  background: #0c4a6e;
  border-color: #0369a1;
}

.toggle-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #0369a1;
  font-weight: 500;
}

body.dark-mode .toggle-label {
  color: #7dd3fc;
}

.toggle-label input[type="checkbox"] {
  margin-top: 2px;
  cursor: pointer;
  width: auto;
}

.toggle-label span {
  flex: 1;
}

/* Pods Photos Display */
.pods-photos-display {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

body.dark-mode .pods-photos-display {
  background: #0f172a;
  border-color: #334155;
}

.pods-photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

body.dark-mode .pods-photos-grid {
  background: #1e293b;
  border-color: #334155;
}

.pods-photo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.pods-photo-item img {
  max-width: 100%;
  max-height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.photo-label {
  font-size: 11px;
  color: #64748b;
  text-align: center;
  word-break: break-word;
}

body.dark-mode .photo-label {
  color: #94a3b8;
}

.field-hint {
  margin: 6px 0 0 0;
  font-size: 12px;
  color: #64748b;
  font-style: italic;
}

body.dark-mode .field-hint {
  color: #94a3b8;
}

.photos-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.photo-item {
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

body.dark-mode .photo-item {
  background: #0f172a;
  border-color: #334155;
}

.photo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.photo-number {
  font-weight: 600;
  color: #3b82f6;
  font-size: 14px;
}

body.dark-mode .photo-number {
  color: #60a5fa;
}

.remove-btn {
  width: 24px;
  height: 24px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #ef4444;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #fee2e2;
  border-color: #f87171;
}

body.dark-mode .remove-btn {
  background: #450a0a;
  border-color: #7f1d1d;
  color: #fca5a5;
}

.add-btn {
  padding: 12px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0284c7;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  width: 100%;
}

.add-btn:hover {
  background: #e0f2fe;
}

body.dark-mode .add-btn {
  background: #0c4a6e;
  border-color: #0369a1;
  color: #7dd3fc;
}

/* SEO Badge */
.seo-badge {
  display: inline-block;
  padding: 2px 6px;
  background: #10b981;
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 3px;
  margin-left: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: help;
}

body.dark-mode .seo-badge {
  background: #059669;
}

/* Upload Button */
.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;
}

.upload-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);
}

.upload-btn:active:not(:disabled) {
  transform: translateY(0);
}

.upload-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-btn svg {
  flex-shrink: 0;
}

body.dark-mode .upload-btn {
  background: #2563eb;
}

body.dark-mode .upload-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

/* Drag Handle */
.drag-handle {
  cursor: grab;
  padding: 4px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.drag-handle:hover {
  color: #3b82f6;
}

.drag-handle:active {
  cursor: grabbing;
}

body.dark-mode .drag-handle {
  color: #64748b;
}

body.dark-mode .drag-handle:hover {
  color: #60a5fa;
}

/* Ghost Item (while dragging) */
.ghost-item {
  opacity: 0.5;
  background: #f0f9ff;
  border: 2px dashed #3b82f6;
}

body.dark-mode .ghost-item {
  background: #0c4a6e;
  border-color: #60a5fa;
}

/* Image Preview Section */
.image-preview-section {
  margin-top: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

body.dark-mode .image-preview-section {
  background: #0f172a;
  border-color: #334155;
}

.image-preview-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
}

.image-preview {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

body.dark-mode .image-preview {
  border-color: #334155;
}

.crop-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  color: #0284c7;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.crop-btn:hover {
  background: #e0f2fe;
  border-color: #7dd3fc;
  transform: translateY(-1px);
}

.crop-btn:active {
  transform: translateY(0);
}

body.dark-mode .crop-btn {
  background: #0c4a6e;
  border-color: #0369a1;
  color: #7dd3fc;
}

body.dark-mode .crop-btn:hover {
  background: #075985;
  border-color: #0284c7;
}

/* ✅ NEW: Carousel Settings Styles */
.carousel-settings {
  margin-top: 16px;
  padding: 16px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
}

body.dark-mode .carousel-settings {
  background: #0c4a6e;
  border-color: #0369a1;
}

.subsection-title {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: #0369a1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

body.dark-mode .subsection-title {
  color: #7dd3fc;
}

/* Checkbox Label Styles (already defined, ensuring consistency) */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

body.dark-mode .checkbox-label {
  color: #94a3b8;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  cursor: pointer;
  margin: 0;
}

.checkbox-label span {
  flex: 1;
}

.checkbox-label:hover span {
  color: #3b82f6;
}

body.dark-mode .checkbox-label:hover span {
  color: #60a5fa;
}
</style>
