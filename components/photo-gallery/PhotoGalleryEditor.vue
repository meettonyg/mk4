<template>
  <div class="photo-gallery-editor">
    <div class="editor-header">
      <h3>Photo Gallery Component</h3>
      <button @click="closeEditor" class="close-btn">×</button>
    </div>
    
    <!-- Tab Navigation -->
    <div class="editor-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>
    
    <div class="editor-content">
      <!-- CONTENT TAB -->
      <div v-show="activeTab === 'content'" class="tab-panel">
        <section class="editor-section">
          <h4>Gallery Settings</h4>
          
          <div class="field-group">
            <label for="gallery-title">Gallery Title</label>
            <input 
              id="gallery-title"
              v-model="localData.title" 
              @input="updateComponent"
              placeholder="e.g., Event Photos"
            >
          </div>
        </section>

        <section class="editor-section">
          <h4>Gallery Images</h4>
          
          <div class="images-list">
            <div 
              v-for="(image, index) in localData.images" 
              :key="index"
              class="image-item"
            >
              <div class="image-preview">
                <img v-if="image.url" :src="image.url" :alt="image.caption">
                <div v-else class="image-placeholder">No Image</div>
              </div>
              
              <div class="image-fields">
                <input 
                  v-model="image.url" 
                  @input="updateComponent"
                  placeholder="Image URL"
                  class="image-field"
                >
                
                <input 
                  v-model="image.caption" 
                  @input="updateComponent"
                  placeholder="Caption (optional)"
                  class="image-field"
                >
                
                <input 
                  v-model="image.alt" 
                  @input="updateComponent"
                  placeholder="Alt text"
                  class="image-field"
                >
                
                <button 
                  @click="removeImage(index)"
                  class="remove-btn"
                  title="Remove image"
                >×</button>
              </div>
            </div>
            
            <div class="add-image-buttons">
              <button 
                @click="addImage"
                class="add-btn"
              >
                + Add Image Manually
              </button>
              
              <button 
                @click="openMediaLibrary"
                class="add-btn primary"
              >
                📷 Choose from Media Library
              </button>
            </div>
          </div>
        </section>

        <section class="editor-section">
          <h4>Display Options</h4>
          
          <div class="field-group">
            <label for="layout">Layout</label>
            <select 
              id="layout"
              v-model="localData.layout" 
              @change="updateComponent"
            >
              <option value="grid">Grid</option>
              <option value="masonry">Masonry</option>
              <option value="carousel">Carousel</option>
              <option value="justified">Justified</option>
            </select>
          </div>
          
          <div class="field-group" v-if="localData.layout === 'grid'">
            <label for="columns">Columns</label>
            <select 
              id="columns"
              v-model="localData.columns" 
              @change="updateComponent"
            >
              <option value="2">2 Columns</option>
              <option value="3">3 Columns</option>
              <option value="4">4 Columns</option>
              <option value="5">5 Columns</option>
            </select>
          </div>
          
          <div class="field-group">
            <label>
              <input 
                type="checkbox"
                v-model="localData.enableLightbox" 
                @change="updateComponent"
              >
              Enable Lightbox (Click to Enlarge)
            </label>
          </div>
          
          <div class="field-group">
            <label>
              <input 
                type="checkbox"
                v-model="localData.showCaptions" 
                @change="updateComponent"
              >
              Show Captions
            </label>
          </div>
          
          <div class="field-group">
            <label>
              <input 
                type="checkbox"
                v-model="localData.lazyLoad" 
                @change="updateComponent"
              >
              Lazy Load Images
            </label>
          </div>
        </section>
      </div>
      
      <!-- STYLE TAB -->
      <div v-show="activeTab === 'style'" class="tab-panel">
        <BaseStylePanel
          :component-id="componentId"
          :component-type="'photo-gallery'"
          :show-typography="false"
        />
      </div>
      
      <!-- ADVANCED TAB -->
      <div v-show="activeTab === 'advanced'" class="tab-panel">
        <BaseAdvancedPanel
          :component-id="componentId"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import BaseStylePanel from '../../src/vue/components/sidebar/editors/BaseStylePanel.vue';
import BaseAdvancedPanel from '../../src/vue/components/sidebar/editors/BaseAdvancedPanel.vue';

const props = defineProps({
  componentId: {
    type: String,
    required: true
  }
});

const store = useMediaKitStore();

// Tab state
const activeTab = ref('content');
const tabs = [
  { id: 'content', label: 'Content' },
  { id: 'style', label: 'Style' },
  { id: 'advanced', label: 'Advanced' }
];

const localData = ref({
  title: '',
  images: [],
  layout: 'grid',
  columns: '3',
  enableLightbox: true,
  showCaptions: true,
  lazyLoad: true
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    localData.value = {
      title: component.data.title || '',
      images: Array.isArray(component.data.images) ? [...component.data.images] : [],
      layout: component.data.layout || 'grid',
      columns: String(component.data.columns || '3'),
      enableLightbox: component.data.enableLightbox !== false,
      showCaptions: component.data.showCaptions !== false,
      lazyLoad: component.data.lazyLoad !== false
    };
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

// Add image
const addImage = () => {
  localData.value.images.push({
    url: '',
    caption: '',
    alt: ''
  });
  updateComponent();
};

// Remove image
const removeImage = (index) => {
  localData.value.images.splice(index, 1);
  updateComponent();
};

// Open WordPress Media Library
const openMediaLibrary = () => {
  if (window.wp && window.wp.media) {
    const frame = window.wp.media({
      title: 'Select Gallery Images',
      button: {
        text: 'Add to Gallery'
      },
      multiple: true
    });
    
    frame.on('select', () => {
      const attachments = frame.state().get('selection').toJSON();
      attachments.forEach(attachment => {
        localData.value.images.push({
          url: attachment.url,
          caption: attachment.caption || '',
          alt: attachment.alt || attachment.title || ''
        });
      });
      updateComponent();
    });
    
    frame.open();
  } else {
    alert('WordPress Media Library not available. Please add images manually.');
  }
};

// Update component
let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) clearTimeout(updateTimeout);
  
  updateTimeout = setTimeout(() => {
    store.updateComponent(props.componentId, {
      data: {
        title: localData.value.title,
        images: localData.value.images.filter(img => img.url),
        layout: localData.value.layout,
        columns: parseInt(localData.value.columns),
        enableLightbox: localData.value.enableLightbox,
        showCaptions: localData.value.showCaptions,
        lazyLoad: localData.value.lazyLoad
      }
    });
    store.isDirty = true;
  }, 300);
};

const closeEditor = () => {
  store.closeEditPanel();
};
</script>

<style scoped>
.photo-gallery-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--gmkb-spacing-md, 16px) 20px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(to bottom, #ffffff, #f9fafb);
}

.editor-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 24px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.editor-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.tab-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.tab-btn.active {
  color: #3b82f6;
  background: white;
  border-bottom-color: #3b82f6;
}

.editor-content {
  flex: 1;
  overflow-y: auto;
  background: #f9fafb;
}

.tab-panel {
  padding: 20px;
}

.editor-section {
  background: white;
  border-radius: 8px;
  padding: var(--gmkb-spacing-md, 16px);
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
}

.editor-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-group {
  margin-bottom: 16px;
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

.field-group input,
.field-group select {
  width: 100%;
  padding: var(--gmkb-spacing-sm, 8px) 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  transition: all 0.2s;
}

.field-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

.field-group input:focus,
.field-group select:focus {
  outline: none;
  border-color: var(--gmkb-color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.images-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.image-item {
  display: flex;
  gap: 12px;
  padding: var(--gmkb-spacing-md, 12px);
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.image-preview {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #94a3b8;
  font-size: 11px;
}

.image-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-field {
  margin: 0 !important;
}

.remove-btn {
  width: 32px;
  height: 32px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #ef4444;
  border-radius: 6px;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.remove-btn:hover {
  background: #fee2e2;
  border-color: #f87171;
}

.add-image-buttons {
  display: flex;
  gap: 8px;
}

.add-btn {
  flex: 1;
  padding: var(--gmkb-spacing-md, 12px);
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0284c7;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.add-btn:hover {
  background: #e0f2fe;
}

.add-btn.primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.add-btn.primary:hover {
  background: #2563eb;
}

/* Scrollbar styling */
.editor-content::-webkit-scrollbar {
  width: 6px;
}

.editor-content::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.editor-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.editor-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
