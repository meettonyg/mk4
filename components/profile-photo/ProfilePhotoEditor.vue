<template>
  <ComponentEditorTemplate
    :component-id="componentId"
    component-type="Profile Photo"
    :show-typography="false"
    :active-tab="activeTab"
    @update:active-tab="activeTab = $event"
    @back="handleBack"
  >
    <template #content>
      <div class="content-fields">
        <section class="editor-section">
          <h4>Photo Source</h4>
          
          <!-- Custom Photo Section -->
          <div>
            <!-- Upload Button -->
            <div class="field-group">
              <button 
                @click="handleUploadPhoto"
                :disabled="isUploading || isSavingToPods"
                class="upload-btn"
                type="button"
              >
                <span v-if="isUploading">Selecting image...</span>
                <span v-else-if="isSavingToPods">Saving to profile...</span>
                <span v-else>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  Upload Photo
                </span>
              </button>
              <p class="field-hint">Upload or select from media library</p>
            </div>

            <div class="field-group">
              <label for="photo-url">Or enter Image URL</label>
              <input
                id="photo-url" 
                v-model="localData.photo.url" 
                @input="updateComponent"
                type="url" 
                placeholder="https://example.com/photo.jpg" 
              />
              <p class="field-hint">Enter the URL of your profile photo</p>
            </div>
            
            <div class="field-group">
              <label for="photo-caption">Caption</label>
              <input
                id="photo-caption" 
                v-model="localData.photo.caption" 
                @input="updateComponent"
                type="text"
                placeholder="Optional caption..."
              />
            </div>

            <!-- Photo Preview -->
            <div v-if="localData.photo.url" class="custom-photo-preview">
              <label>Preview</label>
              <img :src="localData.photo.url" :alt="localData.photo.alt || 'Profile Photo'" />
            </div>
          </div>
        </section>

        <section class="editor-section">
          <h4>Display Options</h4>
          
          <div class="field-group">
            <label for="photo-shape">Shape</label>
            <select 
              id="photo-shape"
              v-model="localData.shape" 
              @change="updateComponent"
            >
              <option value="circle">Circle</option>
              <option value="square">Square</option>
              <option value="rounded">Rounded Square</option>
            </select>
          </div>

          <div class="field-group">
            <label for="photo-size">Size</label>
            <select 
              id="photo-size"
              v-model="localData.size" 
              @change="updateComponent"
            >
              <option value="small">Small (150px)</option>
              <option value="medium">Medium (250px)</option>
              <option value="large">Large (350px)</option>
            </select>
          </div>
        </section>
      </div>
    </template>
  </ComponentEditorTemplate>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useMediaKitStore } from '@/stores/mediaKit';
// jQuery-Free: Using modern REST API uploader instead of WordPress Media Library
import { useModernMediaUploader } from '@composables/useModernMediaUploader';
import ComponentEditorTemplate from '@/vue/components/sidebar/editors/ComponentEditorTemplate.vue';

const props = defineProps({ 
  componentId: { 
    type: String, 
    required: true 
  } 
});

const emit = defineEmits(['close']);

const store = useMediaKitStore();
// jQuery-Free: Using modern uploader with direct REST API calls
const { selectAndUploadImage, isUploading } = useModernMediaUploader();

// Active tab state
const activeTab = ref('content');

const localData = ref({ 
  photo: { 
    url: '', 
    caption: '', 
    alt: 'Profile Photo' 
  },
  usePodsData: false,
  shape: 'circle',
  size: 'medium'
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component?.data) {
    localData.value = {
      photo: component.data.photo || { url: '', caption: '', alt: 'Profile Photo' },
      usePodsData: false,
      shape: component.data.shape || 'circle',
      size: component.data.size || 'medium'
    };
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

// Update component with debouncing
let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) clearTimeout(updateTimeout);
  
  updateTimeout = setTimeout(() => {
    const dataToSave = {
      photo: localData.value.photo,
      usePodsData: false,
      shape: localData.value.shape,
      size: localData.value.size
    };
    
    store.updateComponent(props.componentId, { data: dataToSave });
    store.isDirty = true;
  }, 300);
};

// Handle photo upload - jQuery-Free Implementation
const handleUploadPhoto = async () => {
  try {
    // Step 1: Open file selector and upload via REST API
    const attachment = await selectAndUploadImage({
      accept: 'image/*',
      multiple: false
    });
    
    if (!attachment) {
      return; // User cancelled
    }
    
    if (window.gmkbDebug || window.gmkbData?.debugMode) {
      console.log('📸 Profile Photo: Image uploaded via REST API', {
        id: attachment.id,
        url: attachment.url
      });
    }
    
    // Step 2: Save attachment ID to Pods field
    try {
      const postId = store.postId || window.gmkbData?.postId;
      if (!postId) {
        console.error('❌ Profile Photo: No post ID available');
        throw new Error('Post ID not available');
      }
      
      if (window.gmkbDebug || window.gmkbData?.debugMode) {
        console.log('💾 Profile Photo: Saving to Pods field', {
          postId,
          fieldName: 'profile_photo',
          attachmentId: attachment.id
        });
      }
      
      // ROOT FIX: Save the attachment ID (not URL) to the profile_photo Pods field
      // Pods expects the attachment ID for image fields
      // Try multiple field names as different Pods configurations may use different names
      const fieldNamesToTry = ['profile_photo', 'profile_image', 'headshot'];
      let fieldSaved = false;
      let lastError = null;
      
      for (const fieldName of fieldNamesToTry) {
        try {
          await updatePodsField(postId, fieldName, attachment.id);
          fieldSaved = true;
          if (window.gmkbDebug || window.gmkbData?.debugMode) {
            console.log(`✅ Profile Photo: Saved to Pods field '${fieldName}' successfully`);
          }
          break; // Success, stop trying other field names
        } catch (fieldError) {
          lastError = fieldError;
          if (window.gmkbDebug || window.gmkbData?.debugMode) {
            console.log(`⚠️ Profile Photo: Field '${fieldName}' failed:`, fieldError.message);
          }
          // Continue to try next field name
        }
      }
      
      if (!fieldSaved) {
        throw lastError || new Error('Could not save to any known Pods field');
      }
      
      if (window.gmkbDebug || window.gmkbData?.debugMode) {
        console.log('✅ Profile Photo: Saved to Pods successfully');
      }
      
      // Step 3: Update local state to show custom photo
      localData.value.photo = {
        url: attachment.url,
        caption: attachment.caption || '',
        alt: attachment.alt || 'Profile Photo',
        id: attachment.id,
        source: 'custom'
      };

      // Step 4: Update component state immediately
      // ROOT FIX: Don't use debounce for upload actions - update immediately
      const dataToSave = {
        photo: localData.value.photo,
        usePodsData: false,
        shape: localData.value.shape,
        size: localData.value.size
      };
      
      store.updateComponent(props.componentId, { data: dataToSave });
      store.isDirty = true;
      
      if (window.gmkbDebug || window.gmkbData?.debugMode) {
        console.log('✅ Profile Photo: Upload complete, component updated');
      }
      
    } catch (saveError) {
      console.error('❌ Profile Photo: Failed to save to Pods', saveError);
      
      // ROOT FIX: Still update local state even if Pods save fails
      // Use the uploaded image directly without Pods
      localData.value.photo = {
        url: attachment.url,
        caption: attachment.caption || '',
        alt: attachment.alt || 'Profile Photo',
        id: attachment.id,
        source: 'custom'
      };
      localData.value.usePodsData = false; // Don't use Pods data if save failed
      
      // Update component immediately
      const dataToSave = {
        photo: localData.value.photo,
        usePodsData: false,
        shape: localData.value.shape,
        size: localData.value.size
      };
      
      store.updateComponent(props.componentId, { data: dataToSave });
      store.isDirty = true;
      
      // Show user-friendly error
      const errorMessage = 'Image uploaded but could not be saved to your profile. The image will be used for this media kit only.';
      // Use ToastService if available
      if (window.GMKB?.services?.toast) {
        window.GMKB.services.toast.show(errorMessage, 'warning');
      } else {
        alert(errorMessage);
      }
    }
    
  } catch (error) {
    console.error('❌ Profile Photo: Upload failed', error);
    // jQuery-Free: Better error handling for REST API errors
    if (error.message && !error.message.includes('No file selected')) {
      const errorMessage = 'Failed to upload photo: ' + error.message;
      // Use ToastService if available
      if (window.GMKB?.services?.toast) {
        window.GMKB.services.toast.show(errorMessage, 'error');
      } else {
        alert(errorMessage);
      }
    }
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
.field-group select {
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
body.dark-mode .field-group select {
  background: #0f172a;
  border-color: #334155;
  color: #f3f4f6;
}

.field-group input:focus,
.field-group select:focus {
  outline: none;
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
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

/* Pods Photo Display */
.pods-photo-display {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

body.dark-mode .pods-photo-display {
  background: #0f172a;
  border-color: #334155;
}

.pods-photo-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

body.dark-mode .pods-photo-preview {
  background: #1e293b;
  border-color: #334155;
}

.pods-photo-preview img {
  max-width: 150px;
  max-height: 150px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.photo-info {
  text-align: center;
  width: 100%;
}

.photo-caption {
  margin: 0 0 6px 0;
  font-size: 13px;
  color: #475569;
  font-weight: 500;
}

body.dark-mode .photo-caption {
  color: #94a3b8;
}

/* Custom Photo Preview */
.custom-photo-preview {
  margin-top: 12px;
  text-align: center;
}

.custom-photo-preview img {
  max-width: 150px;
  max-height: 150px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 8px;
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
