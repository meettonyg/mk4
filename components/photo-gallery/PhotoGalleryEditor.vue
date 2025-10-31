<template>
  <ComponentEditorTemplate
    :component-id="componentId"
    component-type="Photo Gallery"
    :show-typography="true"
    :active-tab="activeTab"
    @update:active-tab="activeTab = $event"
    @back="handleBack"
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
          
          <!-- Pods Data Toggle -->
          <div v-if="hasPodsPhotos" class="pods-data-toggle">
            <label class="toggle-label">
              <input 
                type="checkbox" 
                v-model="localData.usePodsData" 
                @change="updateComponent"
              />
              <span>Use photos from Pods ({{ podsPhotosCount }} photo{{ podsPhotosCount !== 1 ? 's' : '' }} available)</span>
            </label>
          </div>

          <!-- Pods Photos Display -->
          <div v-if="localData.usePodsData && hasPodsPhotos" class="pods-photos-display">
            <div class="field-group">
              <label>Photos from Pods</label>
              <div class="pods-photos-grid">
                <div 
                  v-for="(photo, index) in podsPhotos" 
                  :key="index"
                  class="pods-photo-item"
                >
                  <img :src="photo.url" :alt="photo.caption || 'Photo'" />
                  <span class="photo-label">{{ photo.caption || (photo.type === 'profile' ? 'Profile' : `Photo ${index}`) }}</span>
                </div>
              </div>
              <p class="field-hint">These photos are loaded from your guest profile. Uncheck above to add custom photos.</p>
            </div>
          </div>

          <!-- Custom Photos Section -->
          <div v-if="!localData.usePodsData || !hasPodsPhotos">
            <div class="field-group">
              <button 
                v-if="localData.photos.length < 12"
                @click="handleUploadPhotos"
                :disabled="isUploading"
                class="upload-btn"
                type="button"
              >
                <span v-if="isUploading">Uploading...</span>
                <span v-else>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  Upload Photo(s)
                </span>
              </button>
              <p class="field-hint">Upload or select photos from media library (up to 12 total)</p>
            </div>

            <p class="help-text">Or add photos manually:</p>
            
            <div class="photos-list">
              <div 
                v-for="(photo, index) in localData.photos" 
                :key="index" 
                class="photo-item"
              >
                <div class="photo-header">
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
              </div>
              
              <button 
                v-if="localData.photos.length < 12" 
                @click="addPhoto" 
                class="add-btn"
              >
                + Add Photo
              </button>
            </div>
          </div>
        </section>

        <section class="editor-section">
          <h4>Display Options</h4>
          
          <div class="field-group">
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
        </section>
      </div>
    </template>
  </ComponentEditorTemplate>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import { usePodsData } from '../../src/composables/usePodsData';
import { useMediaUploader } from '../../src/composables/useMediaUploader';
import ComponentEditorTemplate from '../../src/vue/components/sidebar/editors/ComponentEditorTemplate.vue';

const props = defineProps({ 
  componentId: { 
    type: String, 
    required: true 
  } 
});

const emit = defineEmits(['close']);

const store = useMediaKitStore();

// Load Pods data
const { podsData } = usePodsData();
const { selectImages, isUploading } = useMediaUploader();

// Active tab state
const activeTab = ref('content');

const localData = ref({ 
  title: 'Photo Gallery', 
  description: '', 
  photos: [], 
  columns: '3',
  usePodsData: true // Default to using Pods data if available
});

// Get photos from Pods - REPEATABLE FIELD ONLY
// REFACTORED: Profile photo moved to separate Profile Photo component
const podsPhotos = computed(() => {
  const photos = [];
  
  // ===== REPEATABLE FIELD: gallery_photos (photo collection) =====
  const galleryPhotos = podsData.value?.gallery_photos;
  if (galleryPhotos && Array.isArray(galleryPhotos) && galleryPhotos.length > 0) {
    // Repeatable field returns an ARRAY where each item is an attachment object or ID
    galleryPhotos.forEach((photo, index) => {
      if (photo) {
        // Each item in the array is one attachment
        const photoUrl = typeof photo === 'object' 
          ? (photo.guid || photo.url) 
          : photo;
        const photoCaption = typeof photo === 'object' 
          ? (photo.post_excerpt || photo.caption || '')
          : '';
        
        if (photoUrl) {
          photos.push({
            url: photoUrl,
            caption: photoCaption,
            type: 'gallery',
            source: 'pods'
          });
        }
      }
    });
  }
  
  return photos;
});

const podsPhotosCount = computed(() => podsPhotos.value.length);
const hasPodsPhotos = computed(() => podsPhotosCount.value > 0);

// Determine effective photos (Pods or custom)
const effectivePhotos = computed(() => {
  if (localData.value.usePodsData && hasPodsPhotos.value) {
    return podsPhotos.value;
  }
  return localData.value.photos || [];
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
      usePodsData: component.data.usePodsData !== false // Default to true
    };
  }
  
  // If no custom photos and Pods has data, use Pods
  if ((!localData.value.photos || localData.value.photos.length === 0) && hasPodsPhotos.value) {
    localData.value.usePodsData = true;
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

watch(podsPhotos, () => {
  // If using Pods data and Pods value changes, trigger update
  if (localData.value.usePodsData) {
    updateComponent();
  }
}, { deep: true });

// Add photo
const addPhoto = () => {
  localData.value.photos.push({ url: '', caption: '' });
  updateComponent();
};

// Remove photo
const removePhoto = (index) => {
  localData.value.photos.splice(index, 1);
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
      photos: effectivePhotos.value,
      columns: localData.value.columns,
      usePodsData: localData.value.usePodsData
    };
    
    store.updateComponent(props.componentId, { data: dataToSave });
    store.isDirty = true;
  }, 300);
};

// Handle photo upload (multiple)
const handleUploadPhotos = async () => {
  try {
    const attachments = await selectImages();
    if (attachments && Array.isArray(attachments)) {
      // Add each photo, respecting the 12 photo limit
      attachments.forEach(attachment => {
        if (localData.value.photos.length < 12) {
          localData.value.photos.push({
            url: attachment.url,
            caption: attachment.caption || attachment.title || '',
            id: attachment.id
          });
        }
      });
      updateComponent();
    }
  } catch (error) {
    console.error('Failed to upload photos:', error);
  }
};

const handleBack = () => emit('close');
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
</style>
