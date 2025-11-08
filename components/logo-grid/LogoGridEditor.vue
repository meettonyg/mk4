<template>
  <ComponentEditorTemplate
    :component-id="componentId"
    component-type="Logo Grid"
    :show-typography="true"
    :active-tab="activeTab"
    @update:active-tab="activeTab = $event"
    @close="handleClose"
  >
    <!-- Content Tab -->
    <template #content>
      <div class="content-fields">
        <section class="editor-section">
          <h4>Section Settings</h4>
          
          <div class="field-group">
            <label for="logo-title">Section Title</label>
            <input 
              id="logo-title"
              v-model="localData.title" 
              @input="updateComponent"
              type="text"
              placeholder="e.g., Featured In"
            />
          </div>
          
          <div class="field-group">
            <label for="logo-description">Description</label>
            <textarea 
              id="logo-description"
              v-model="localData.description" 
              @input="updateComponent"
              rows="2"
              placeholder="Optional description..."
            />
          </div>
        </section>

        <section class="editor-section">
          <h4>Logo Source</h4>
          
          <!-- Pods Data Toggle -->
          <div v-if="hasPodsLogos" class="pods-data-toggle">
            <label class="toggle-label">
              <input 
                type="checkbox" 
                v-model="localData.usePodsData" 
                @change="updateComponent"
              />
              <span>Use logos from Pods ({{ podsLogosCount }} logo{{ podsLogosCount !== 1 ? 's' : '' }} available)</span>
            </label>
          </div>

          <!-- Pods Logos Display -->
          <div v-if="localData.usePodsData && hasPodsLogos" class="pods-logos-display">
            <div class="field-group">
              <label>Logos from Pods</label>
              <div class="pods-logos-grid">
                <div 
                  v-for="(logo, index) in podsLogos" 
                  :key="index"
                  class="pods-logo-item"
                >
                  <img :src="logo.url" :alt="logo.name" />
                  <span class="logo-label">{{ logo.name }}</span>
                </div>
              </div>
              <p class="field-hint">These logos are loaded from your guest profile. Uncheck above to add custom logos.</p>
            </div>
          </div>

          <!-- Custom Logos Section -->
          <div v-if="!localData.usePodsData || !hasPodsLogos">
            <div class="field-group">
              <button 
                v-if="localData.logos.length < 12"
                @click="handleUploadLogos"
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
                  Upload Logo(s)
                </span>
              </button>
              <p class="field-hint">Upload or select logos from media library (up to 12 total)</p>
            </div>

            <p class="help-text">Or add logos manually:</p>
            
            <!-- ✅ DRAG-AND-DROP: Draggable wrapper for logos list -->
            <draggable 
              v-model="localData.logos" 
              @end="updateComponent"
              item-key="url"
              handle=".drag-handle"
              class="logos-list"
              ghost-class="ghost-item"
              animation="200"
            >
              <template #item="{element: logo, index}">
              <div class="logo-item">
                <div class="logo-header">
                  <!-- ✅ DRAG HANDLE -->
                  <div class="drag-handle" title="Drag to reorder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                  </div>
                  <span class="logo-number">Logo {{ index + 1 }}</span>
                  <button 
                    @click="removeLogo(index)"
                    class="remove-btn"
                    title="Remove logo"
                  >×</button>
                </div>
                
                <div class="field-group">
                  <label>Image URL *</label>
                  <input 
                    v-model="logo.url" 
                    @input="updateComponent"
                    type="url"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                
                <div class="field-group">
                  <label>Logo Name</label>
                  <input 
                    v-model="logo.name" 
                    @input="updateComponent"
                    type="text"
                    placeholder="Company name"
                  />
                </div>
                
                <div class="field-group">
                  <label>Alt Text (SEO) 
                    <span class="seo-badge" title="Improves search engine ranking">SEO</span>
                  </label>
                  <input 
                    v-model="logo.alt" 
                    @input="updateComponent"
                    type="text"
                    placeholder="Describe this logo for screen readers and search engines"
                  />
                  <p class="field-hint">E.g., "Microsoft logo" or "Featured on TechCrunch". Helps with SEO and accessibility.</p>
                </div>
                
                <div class="field-group">
                  <label>Link URL (Optional)</label>
                  <input 
                    v-model="logo.link" 
                    @input="validateLink(logo, index); updateComponent();"
                    @blur="validateLink(logo, index)"
                    type="url"
                    placeholder="https://company.com"
                    :class="{ 'input-error': validationErrors.get(index), 'input-success': logo.link && !validationErrors.get(index) }"
                  />
                  <p v-if="validationErrors.get(index)" class="error-hint">{{ validationErrors.get(index) }}</p>
                  <p v-else-if="logo.link && !validationErrors.get(index)" class="success-hint">✓ Valid URL</p>
                </div>
                
                <!-- NEW: Open in new tab option -->
                <div v-if="logo.link" class="field-group">
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      v-model="logo.linkNewTab" 
                      @change="updateComponent"
                    />
                    <span>Open link in new tab</span>
                  </label>
                </div>
                
                <!-- Image Preview & Crop Button -->
                <div v-if="logo.url" class="image-preview-section">
                  <div class="image-preview-wrapper">
                    <img :src="logo.url" :alt="logo.alt || 'Preview'" class="image-preview" />
                    <button 
                      @click="openCropper(index)"
                      class="crop-btn"
                      type="button"
                      title="Crop logo"
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
              v-if="localData.logos.length < 12"
              @click="addLogo"
              class="add-btn"
            >
              + Add Logo
            </button>
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
              <option value="auto">Auto (Responsive)</option>
              <option value="3">3 Columns</option>
              <option value="4">4 Columns</option>
              <option value="6">6 Columns</option>
            </select>
          </div>
          
          <div class="field-group">
            <label for="logo-name-style">Logo Name Display</label>
            <select 
              id="logo-name-style"
              v-model="localData.logoNameStyle" 
              @change="updateComponent"
            >
              <option value="below">Show Below Logo</option>
              <option value="hover">Show on Hover</option>
              <option value="none">Hide Names</option>
            </select>
            <p class="field-hint">Choose how logo names are displayed</p>
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
import draggable from 'vuedraggable';  // ✅ NEW: Drag-and-drop support
import { useMediaKitStore } from '@/stores/mediaKit';
import { usePodsData } from '@/composables/usePodsData';
import { useModernMediaUploader } from '@/composables/useModernMediaUploader';
import { ToastService } from '@/services/ToastService';
import ComponentEditorTemplate from '@/vue/components/sidebar/editors/ComponentEditorTemplate.vue';
import ImageCropper from '@/vue/components/shared/ImageCropper.vue';  // ✅ NEW: Image cropper

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
const { openMediaLibrary, isUploading } = useModernMediaUploader();

// Active tab state
const activeTab = ref('content');

// Image cropper state
const cropperRef = ref(null);
const currentCropIndex = ref(null);

const localData = ref({
  title: 'Featured In',
  description: '',
  logos: [],
  columns: 'auto',
  logoNameStyle: 'below', // Default logo name style
  usePodsData: true // Default to using Pods data if available
});

// ✅ BLOAT-FREE: Validation errors as local component state (NOT saved to database)
const validationErrors = ref(new Map()); // Map<logoIndex, errorMessage>

// Get logos from Pods
// CRITICAL: Single fields return ONE attachment, repeatable fields return ARRAY
const podsLogos = computed(() => {
  const logos = [];
  
  // ===== SINGLE FIELDS (return one attachment object/ID) =====
  
  // Add personal brand logo (SINGLE field)
  const personalLogo = podsData.value?.personal_brand_logo;
  if (personalLogo) {
    // Single field returns ONE attachment object or ID (not an array)
    const logoUrl = typeof personalLogo === 'object' 
      ? (personalLogo.guid || personalLogo.url) 
      : personalLogo;
    const logoName = typeof personalLogo === 'object' 
      ? (personalLogo.post_title || 'Personal Brand')
      : 'Personal Brand';
    
    if (logoUrl) {
      logos.push({
        url: logoUrl,
        name: logoName,
        type: 'brand',
        source: 'pods'
      });
    }
  }
  
  // Add company logo (SINGLE field)
  const companyLogo = podsData.value?.company_logo;
  if (companyLogo) {
    // Single field returns ONE attachment object or ID (not an array)
    const logoUrl = typeof companyLogo === 'object' 
      ? (companyLogo.guid || companyLogo.url) 
      : companyLogo;
    const logoName = typeof companyLogo === 'object' 
      ? (companyLogo.post_title || 'Company')
      : 'Company';
    
    if (logoUrl) {
      logos.push({
        url: logoUrl,
        name: logoName,
        type: 'company',
        source: 'pods'
      });
    }
  }
  
  // ===== REPEATABLE FIELDS (return array of attachments) =====
  
  // Add featured logos (REPEATABLE field - returns ARRAY of attachments)
  const featuredLogos = podsData.value?.featured_logos;
  if (featuredLogos && Array.isArray(featuredLogos) && featuredLogos.length > 0) {
    // Repeatable field returns an ARRAY where each item is an attachment object or ID
    featuredLogos.forEach((logo, index) => {
      if (logo) {
        // Each item in the array is one attachment
        const logoUrl = typeof logo === 'object' 
          ? (logo.guid || logo.url) 
          : logo;
        const logoName = typeof logo === 'object' 
          ? (logo.post_title || `Featured Logo ${index + 1}`)
          : `Featured Logo ${index + 1}`;
        
        if (logoUrl) {
          logos.push({
            url: logoUrl,
            name: logoName,
            type: 'featured',
            source: 'pods'
          });
        }
      }
    });
  }
  
  return logos;
});

const podsLogosCount = computed(() => podsLogos.value.length);
const hasPodsLogos = computed(() => podsLogosCount.value > 0);

// Determine effective logos (Pods or custom)
const effectiveLogos = computed(() => {
  if (localData.value.usePodsData && hasPodsLogos.value) {
    return podsLogos.value;
  }
  return localData.value.logos || [];
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    localData.value = {
      title: component.data.title || 'Featured In',
      description: component.data.description || '',
      logos: Array.isArray(component.data.logos) 
        ? [...component.data.logos]
        : [],
      columns: component.data.columns || 'auto',
      logoNameStyle: component.data.logoNameStyle || 'below', // Load logo name style
      usePodsData: component.data.usePodsData !== false // Default to true
    };
  }
  
  // If no custom logos and Pods has data, use Pods
  if ((!localData.value.logos || localData.value.logos.length === 0) && hasPodsLogos.value) {
    localData.value.usePodsData = true;
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

watch(podsLogos, () => {
  // If using Pods data and Pods value changes, trigger update
  if (localData.value.usePodsData) {
    updateComponent();
  }
}, { deep: true });

// Add logo - NO BLOAT: Only add fields that are needed
const addLogo = () => {
  localData.value.logos.push({
    url: '',
    name: '',
    alt: '',
    link: ''
    // linkNewTab: only added when user checks the box
  });
  updateComponent();
};

// Remove logo
const removeLogo = (index) => {
  localData.value.logos.splice(index, 1);
  validationErrors.value.delete(index);  // ✅ Clean up validation state
  
  // Reindex remaining errors
  const newErrors = new Map();
  validationErrors.value.forEach((error, oldIndex) => {
    if (oldIndex > index) {
      newErrors.set(oldIndex - 1, error);
    } else if (oldIndex < index) {
      newErrors.set(oldIndex, error);
    }
  });
  validationErrors.value = newErrors;
  
  updateComponent();
};

// ✅ BLOAT-FREE: Validate link URL (errors stored separately, not in logo data)
const validateLink = (logo, index) => {
  if (!logo.link || logo.link.trim() === '') {
    validationErrors.value.delete(index);
    return;
  }
  
  try {
    const url = new URL(logo.link);
    // Check if protocol is http or https
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      validationErrors.value.set(index, 'URL must start with http:// or https://');
      return;
    }
    // Check if domain exists
    if (!url.hostname || url.hostname.length === 0) {
      validationErrors.value.set(index, 'Invalid URL domain');
      return;
    }
    // Valid URL
    validationErrors.value.delete(index);
  } catch (error) {
    validationErrors.value.set(index, 'Invalid URL format. Must include http:// or https://');
  }
};

// Update component with debouncing - NO BLOAT: Clean data before saving
let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) clearTimeout(updateTimeout);
  
  updateTimeout = setTimeout(() => {
    // Clean logos data - only save meaningful fields
    const cleanLogos = (localData.value.usePodsData && hasPodsLogos.value ? effectiveLogos.value : localData.value.logos).map(logo => {
      const clean = {
        url: logo.url,
        name: logo.name,
        alt: logo.alt,
        link: logo.link
      };
      
      // Only include linkNewTab if it's true (NO default false)
      if (logo.linkNewTab === true) {
        clean.linkNewTab = true;
      }
      
      // Never save: id (temporary), linkError (UI state), source/type (from Pods)
      return clean;
    });
    
    const dataToSave = {
      title: localData.value.title,
      description: localData.value.description,
      logos: cleanLogos,
      columns: localData.value.columns,
      logoNameStyle: localData.value.logoNameStyle,
      usePodsData: localData.value.usePodsData
    };
    
    store.updateComponent(props.componentId, { data: dataToSave });
    store.isDirty = true;
  }, 300);
};

// Handle logo upload (single or multiple)
const handleUploadLogos = async () => {
  try {
    // Use REST API uploader with MULTIPLE selection
    // SECURITY: Filter to show only current user's uploads
    const attachments = await openMediaLibrary({
      title: 'Select Logo(s)',
      button: { text: 'Use Selected Logo(s)' },
      multiple: true, // Allow multiple selection
      library: { 
        type: 'image',
        author: window.gmkbData?.user?.userId // ✅ Only show MY uploads
      }
    });
    
    if (attachments && attachments.length > 0) {
      // Add all selected logos
      attachments.forEach(attachment => {
        // Sanitize URL (decode HTML entities)
        const sanitizedUrl = attachment.url
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'");
        
        localData.value.logos.push({
          url: sanitizedUrl,
          name: attachment.title || attachment.filename || 'Logo',
          alt: attachment.alt || attachment.title || '',
          link: ''
          // linkNewTab: only added when checked
          // id: temporary, removed before save
        });
      });
      
      // Save to Pods field
      await saveLogosToPods();
      
      // Update component
      updateComponent();
      
      // Show success toast
      ToastService.success(
        `${attachments.length} logo${attachments.length > 1 ? 's' : ''} uploaded successfully`,
        { duration: 3000 }
      );
    }
  } catch (error) {
    console.error('Failed to upload logo(s):', error);
    ToastService.error(
      'Failed to upload logo(s). Please try again.',
      { duration: 5000 }
    );
  }
};

// Save logos to Pods field
const saveLogosToPods = async () => {
  const postId = store.postId;
  if (!postId || !localData.value.logos || localData.value.logos.length === 0) {
    return;
  }
  
  try {
    // Extract logo IDs for Pods field (repeatable file field)
    const logoIds = localData.value.logos
      .map(logo => logo.id)
      .filter(id => id); // Remove any null/undefined IDs
    
    if (logoIds.length === 0) {
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
          featured_logos: logoIds
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save logos: ${response.statusText}`);
    }
    
    console.log('✅ Logos saved to Pods field successfully');
  } catch (error) {
    console.error('Error saving logos to Pods:', error);
    ToastService.warning(
      'Logos added to component but not saved to profile',
      { duration: 5000 }
    );
  }
};

// Handle close button
const handleClose = () => {
  emit('close');
};

// Computed property for current crop image URL
const currentCropImageUrl = computed(() => {
  if (currentCropIndex.value !== null && localData.value.logos[currentCropIndex.value]) {
    return localData.value.logos[currentCropIndex.value].url;
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
    const file = new File([blob], `cropped-logo-${Date.now()}.jpg`, { type: 'image/jpeg' });
    
    // Upload the cropped image to WordPress media library
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', `Cropped Logo ${currentCropIndex.value + 1}`);
    
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
    
    // Update logo URL with the new cropped image
    localData.value.logos[currentCropIndex.value].url = attachment.source_url;
    localData.value.logos[currentCropIndex.value].id = attachment.id;
    
    // Update component
    updateComponent();
    
    ToastService.success('Logo cropped successfully', { duration: 3000 });
  } catch (error) {
    console.error('Error uploading cropped logo:', error);
    ToastService.error('Failed to save cropped logo', { duration: 5000 });
  } finally {
    currentCropIndex.value = null;
  }
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

/* Pods Logos Display */
.pods-logos-display {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

body.dark-mode .pods-logos-display {
  background: #0f172a;
  border-color: #334155;
}

.pods-logos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

body.dark-mode .pods-logos-grid {
  background: #1e293b;
  border-color: #334155;
}

.pods-logo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.pods-logo-item img {
  max-width: 100%;
  max-height: 60px;
  object-fit: contain;
}

.logo-label {
  font-size: 11px;
  color: #64748b;
  text-align: center;
  word-break: break-word;
}

body.dark-mode .logo-label {
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

.logos-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.logo-item {
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

body.dark-mode .logo-item {
  background: #0f172a;
  border-color: #334155;
}

.logo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.logo-number {
  font-weight: 600;
  color: #3b82f6;
  font-size: 14px;
}

body.dark-mode .logo-number {
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
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
}

body.dark-mode .image-preview {
  border-color: #334155;
  background: #0f172a;
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

/* ✅ NEW: Link Validation Styles */
.input-error {
  border-color: #ef4444 !important;
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.input-success {
  border-color: #10b981 !important;
}

.input-success:focus {
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
}

.error-hint {
  margin: 6px 0 0 0;
  font-size: 12px;
  color: #ef4444;
  font-style: italic;
}

body.dark-mode .error-hint {
  color: #fca5a5;
}

.success-hint {
  margin: 6px 0 0 0;
  font-size: 12px;
  color: #10b981;
  font-style: italic;
}

body.dark-mode .success-hint {
  color: #6ee7b7;
}

/* ✅ NEW: Checkbox Label */
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
