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
          
          <!-- Pods Data Toggle -->
          <div v-if="hasPodsPhoto" class="pods-data-toggle">
            <label class="toggle-label">
              <input 
                type="checkbox" 
                v-model="localData.usePodsData" 
                @change="updateComponent"
              />
              <span>Use profile photo from Pods</span>
            </label>
          </div>

          <!-- Pods Photo Display -->
          <div v-if="localData.usePodsData && podsPhoto" class="pods-photo-display">
            <div class="field-group">
              <label>Photo from Pods</label>
              <div class="pods-photo-preview">
                <img :src="podsPhoto.url" :alt="podsPhoto.alt || 'Profile Photo'" />
                <div class="photo-info">
                  <p class="photo-caption" v-if="podsPhoto.caption">{{ podsPhoto.caption }}</p>
                  <p class="field-hint">Loaded from your guest profile</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Modern Photo Upload (jQuery-Free) -->
          <div v-if="!localData.usePodsData || !hasPodsPhoto">
            <!-- Use Modern Media Library Component -->
            <ModernMediaLibrary
              button-text="Upload Photo"
              accept="image/*"
              :multiple="false"
              @selected="handlePhotoSelected"
              @error="handleUploadError"
            />

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
import { usePodsData } from '@composables/usePodsData';
import { usePodsFieldUpdate } from '@composables/usePodsFieldUpdate';
import ComponentEditorTemplate from '@/vue/components/sidebar/editors/ComponentEditorTemplate.vue';
import ModernMediaLibrary from '@/vue/components/ModernMediaLibrary.vue';

const props = defineProps({ 
  componentId: { 
    type: String, 
    required: true 
  } 
});

const emit = defineEmits(['close']);

const store = useMediaKitStore();
const { profilePhoto, allData: podsData } = usePodsData();
const { updatePodsField, isUpdating: isSavingToPods } = usePodsFieldUpdate();

// Active tab state
const activeTab = ref('content');

const localData = ref({ 
  photo: { 
    url: '', 
    caption: '', 
    alt: 'Profile Photo' 
  },
  usePodsData: true,
  shape: 'circle',
  size: 'medium'
});

// Get photo from Pods
const podsPhoto = computed(() => {
  const photo = profilePhoto.value;
  if (!photo) return null;
  
  return {
    url: typeof photo === 'object' 
      ? (photo.guid || photo.url || photo.ID) 
      : photo,
    caption: typeof photo === 'object' 
      ? (photo.post_excerpt || photo.caption || '') 
      : '',
    alt: typeof photo === 'object' 
      ? (photo.post_title || 'Profile Photo') 
      : 'Profile Photo'
  };
});

const hasPodsPhoto = computed(() => !!podsPhoto.value);

// Determine effective photo
const effectivePhoto = computed(() => {
  if (localData.value.usePodsData && hasPodsPhoto.value) {
    return podsPhoto.value;
  }
  return localData.value.photo;
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component?.data) {
    localData.value = {
      photo: component.data.photo || { url: '', caption: '', alt: 'Profile Photo' },
      usePodsData: component.data.usePodsData !== false,
      shape: component.data.shape || 'circle',
      size: component.data.size || 'medium'
    };
  }
  
  // If no custom photo and Pods has data, use Pods
  if ((!localData.value.photo.url || localData.value.photo.url === '') && hasPodsPhoto.value) {
    localData.value.usePodsData = true;
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

watch(podsPhoto, () => {
  // If using Pods data and Pods value changes, trigger update
  if (localData.value.usePodsData) {
    updateComponent();
  }
}, { deep: true });

// Update component with debouncing
let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) clearTimeout(updateTimeout);
  
  updateTimeout = setTimeout(() => {
    const dataToSave = {
      photo: effectivePhoto.value,
      usePodsData: localData.value.usePodsData,
      shape: localData.value.shape,
      size: localData.value.size
    };
    
    store.updateComponent(props.componentId, { data: dataToSave });
    store.isDirty = true;
  }, 300);
};

// Handle photo selection from modern uploader
const handlePhotoSelected = async (attachment) => {
  if (!attachment) return;
  
  console.log('📸 Profile Photo: Image selected', attachment);
  
  // Update local state with selected photo
  localData.value.photo = {
    url: attachment.url,
    caption: attachment.caption || '',
    alt: attachment.alt || 'Profile Photo',
    id: attachment.id
  };
  
  // Disable Pods data since we have a custom photo
  localData.value.usePodsData = false;
  
  // Save to Pods if we have an ID
  if (attachment.id) {
    try {
      const postId = store.postId;
      if (postId) {
        await updatePodsField(postId, 'profile_photo', attachment.id);
        console.log('✅ Profile Photo: Saved to Pods');
        // Re-enable Pods data since it's now saved there
        localData.value.usePodsData = true;
      }
    } catch (error) {
      console.error('Failed to save to Pods:', error);
      // Keep using custom photo if Pods save fails
    }
  }
  
  // Update component
  updateComponent();
};

const handleUploadError = (error) => {
  console.error('❌ Profile Photo: Upload failed', error);
  alert('Failed to upload photo: ' + error.message);
};

const handleBack = () => emit('close');
</script>

<style scoped>
/* ... existing styles ... */
</style>
