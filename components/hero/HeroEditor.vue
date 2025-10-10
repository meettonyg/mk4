<template>
  <ComponentEditorTemplate
    :component-id="componentId"
    component-type="Hero"
    :show-typography="true"
    :active-tab="activeTab"
    @update:active-tab="activeTab = $event"
    @back="handleBack"
  >
    <!-- Content Tab -->
    <template #content>
      <div class="content-fields">
        <section class="editor-section">
          <h4>Hero Content</h4>
          
          <div class="field-group">
            <label for="hero-title">Title</label>
            <input 
              id="hero-title"
              v-model="localData.title" 
              @input="updateComponent"
              type="text"
              placeholder="Enter headline..."
            />
          </div>
          
          <div class="field-group">
            <label for="hero-subtitle">Subtitle</label>
            <textarea 
              id="hero-subtitle"
              v-model="localData.subtitle" 
              @input="updateComponent"
              rows="3"
              placeholder="Enter subheading..."
            />
          </div>
        </section>

        <section class="editor-section">
          <h4>Call to Action</h4>
          
          <div class="field-group">
            <label for="hero-cta-text">Button Text</label>
            <input 
              id="hero-cta-text"
              v-model="localData.ctaText" 
              @input="updateComponent"
              type="text"
              placeholder="Get in Touch"
            />
          </div>
          
          <div class="field-group">
            <label for="hero-cta-url">Button URL</label>
            <input 
              id="hero-cta-url"
              v-model="localData.ctaUrl" 
              @input="updateComponent"
              type="url"
              placeholder="#contact"
            />
          </div>
        </section>

        <section class="editor-section">
          <h4>Background Image</h4>
          
          <div class="field-group">
            <label for="hero-bg-image">Background Image URL</label>
            <input 
              id="hero-bg-image"
              v-model="localData.backgroundImage" 
              @input="updateComponent"
              type="url"
              placeholder="https://example.com/background.jpg"
            />
            <button @click="openMediaLibrary" class="media-btn">
              Choose from Media Library
            </button>
          </div>
          
          <!-- Image Preview -->
          <div v-if="localData.backgroundImage" class="image-preview">
            <img :src="localData.backgroundImage" alt="Background preview" />
          </div>
        </section>

        <section class="editor-section">
          <h4>Layout</h4>
          
          <div class="field-group">
            <label for="hero-alignment">Content Alignment</label>
            <select 
              id="hero-alignment"
              v-model="localData.alignment" 
              @change="updateComponent"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </section>
      </div>
    </template>
  </ComponentEditorTemplate>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import ComponentEditorTemplate from '../../src/vue/components/sidebar/editors/ComponentEditorTemplate.vue';

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

// Local data state
const localData = ref({
  title: '',
  subtitle: '',
  backgroundImage: '',
  ctaText: '',
  ctaUrl: '',
  alignment: 'center'
});

// Initialize local data from store
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    localData.value = {
      title: component.data.title || '',
      subtitle: component.data.subtitle || '',
      backgroundImage: component.data.backgroundImage || '',
      ctaText: component.data.ctaText || '',
      ctaUrl: component.data.ctaUrl || '#',
      alignment: component.data.alignment || 'center'
    };
  }
};

// Watch for component changes
watch(() => props.componentId, () => {
  loadComponentData();
}, { immediate: true });

// Update component in store with debouncing
let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
  
  updateTimeout = setTimeout(() => {
    store.updateComponent(props.componentId, {
      data: {
        title: localData.value.title,
        subtitle: localData.value.subtitle,
        backgroundImage: localData.value.backgroundImage,
        ctaText: localData.value.ctaText,
        ctaUrl: localData.value.ctaUrl,
        alignment: localData.value.alignment
      }
    });
    
    store.isDirty = true;
  }, 300);
};

// Open WordPress Media Library
const openMediaLibrary = () => {
  if (window.wp && window.wp.media) {
    const frame = window.wp.media({
      title: 'Select Background Image',
      button: {
        text: 'Use this image'
      },
      multiple: false
    });
    
    frame.on('select', () => {
      const attachment = frame.state().get('selection').first().toJSON();
      localData.value.backgroundImage = attachment.url;
      updateComponent();
    });
    
    frame.open();
  } else {
    alert('WordPress Media Library not available. Please enter an image URL manually.');
  }
};

// Handle back button
const handleBack = () => {
  emit('close');
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

body.dark-mode .field-group label {
  color: #94a3b8;
}

.field-group input[type="text"],
.field-group input[type="url"],
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

body.dark-mode .field-group input[type="text"],
body.dark-mode .field-group input[type="url"],
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
  min-height: 80px;
}

.media-btn {
  margin-top: 8px;
  width: 100%;
  padding: 10px 16px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: #475569;
}

.media-btn:hover {
  background: #ec4899;
  color: white;
  border-color: #ec4899;
}

body.dark-mode .media-btn {
  background: #1e293b;
  border-color: #334155;
  color: #d1d5db;
}

body.dark-mode .media-btn:hover {
  background: #ec4899;
  border-color: #ec4899;
  color: white;
}

.image-preview {
  margin-top: 12px;
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  height: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

body.dark-mode .image-preview img {
  border-color: #334155;
}
</style>
