<template>
  <div class="photo-gallery-editor">
    <div class="editor-header">
      <h3>Edit Photo Gallery</h3>
      <button @click="closeEditor" class="close-btn">×</button>
    </div>
    
    <div class="editor-fields">
      <!-- Section Title -->
      <div class="field-group">
        <label for="gallery-title">Gallery Title</label>
        <input 
          id="gallery-title"
          v-model="localData.title" 
          @input="updateComponent"
          placeholder="e.g., Event Photos"
        >
      </div>
      
      <!-- Gallery Images -->
      <div class="field-group">
        <label>Gallery Images</label>
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
      </div>
      
      <!-- Display Options -->
      <details class="advanced-section">
        <summary>Display Options</summary>
        
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
      </details>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';

const props = defineProps({
  componentId: {
    type: String,
    required: true
  }
});

const store = useMediaKitStore();
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
    store.hasUnsavedChanges = true;
  }, 300);
};

const closeEditor = () => {
  store.closeEditPanel();
};
</script>

<style scoped>
.photo-gallery-editor {
  background: white;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.editor-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #64748b;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.editor-fields {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.field-group {
  margin-bottom: 20px;
}

.field-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 13px;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-group input,
.field-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.field-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

.images-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.image-item {
  display: flex;
  gap: 12px;
  padding: 12px;
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
  padding: 12px;
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

.advanced-section {
  margin-top: 24px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.advanced-section summary {
  cursor: pointer;
  font-weight: 500;
  color: #475569;
  font-size: 14px;
  user-select: none;
}
</style>
