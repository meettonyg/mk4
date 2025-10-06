<template>
  <div class="hero-editor">
    <div class="editor-header">
      <h3>Hero Component</h3>
      <button @click="$emit('close')" class="close-btn">×</button>
    </div>
    
    <div class="editor-sections">
      <!-- Main Content -->
      <section class="editor-section">
        <h4>Content</h4>
        
        <div class="field-group">
          <label for="hero-title">Main Title</label>
          <input 
            id="hero-title"
            v-model="localData.title" 
            @input="updateField('title')"
            type="text"
            placeholder="Enter hero title..."
          />
        </div>
        
        <div class="field-group">
          <label for="hero-subtitle">Subtitle</label>
          <input 
            id="hero-subtitle"
            v-model="localData.subtitle" 
            @input="updateField('subtitle')"
            type="text"
            placeholder="Enter subtitle..."
          />
        </div>
        
        <div class="field-group">
          <label for="hero-description">Description</label>
          <textarea 
            id="hero-description"
            v-model="localData.description" 
            @input="updateField('description')"
            rows="4"
            placeholder="Enter description..."
          />
        </div>
      </section>

      <!-- Call to Action -->
      <section class="editor-section">
        <h4>Call to Action</h4>
        
        <div class="field-group">
          <label for="hero-cta-text">Button Text</label>
          <input 
            id="hero-cta-text"
            v-model="localData.ctaText" 
            @input="updateField('ctaText')"
            type="text"
            placeholder="e.g., Get Started"
          />
        </div>
        
        <div class="field-group">
          <label for="hero-cta-url">Button Link</label>
          <input 
            id="hero-cta-url"
            v-model="localData.ctaUrl" 
            @input="updateField('ctaUrl')"
            type="url"
            placeholder="https://"
          />
        </div>
      </section>

      <!-- Background -->
      <section class="editor-section">
        <h4>Background</h4>
        
        <div class="field-group">
          <label for="hero-bg-type">Background Type</label>
          <select 
            id="hero-bg-type"
            v-model="localData.backgroundType" 
            @change="updateField('backgroundType')"
          >
            <option value="color">Solid Color</option>
            <option value="gradient">Gradient</option>
            <option value="image">Image</option>
          </select>
        </div>
        
        <div v-if="localData.backgroundType === 'color'" class="field-group">
          <label for="hero-bg-color">Background Color</label>
          <div class="color-input">
            <input 
              id="hero-bg-color"
              v-model="localData.backgroundColor" 
              @input="updateField('backgroundColor')"
              type="color"
            />
            <input 
              v-model="localData.backgroundColor" 
              @input="updateField('backgroundColor')"
              type="text"
              placeholder="#000000"
            />
          </div>
        </div>
        
        <div v-if="localData.backgroundType === 'image'" class="field-group">
          <label for="hero-bg-image">Background Image URL</label>
          <input 
            id="hero-bg-image"
            v-model="localData.backgroundImage" 
            @input="updateField('backgroundImage')"
            type="url"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </section>

      <!-- Layout Options -->
      <section class="editor-section">
        <h4>Layout</h4>
        
        <div class="field-group">
          <label for="hero-alignment">Text Alignment</label>
          <select 
            id="hero-alignment"
            v-model="localData.textAlign" 
            @change="updateField('textAlign')"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
        
        <div class="field-group">
          <label for="hero-height">Section Height</label>
          <select 
            id="hero-height"
            v-model="localData.height" 
            @change="updateField('height')"
          >
            <option value="auto">Auto</option>
            <option value="small">Small (300px)</option>
            <option value="medium">Medium (500px)</option>
            <option value="large">Large (700px)</option>
            <option value="fullscreen">Fullscreen</option>
          </select>
        </div>
      </section>
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
  },
  componentData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update', 'close']);
const store = useMediaKitStore();

// Local data copy
const localData = ref({
  title: '',
  subtitle: '',
  description: '',
  ctaText: '',
  ctaUrl: '',
  backgroundType: 'color',
  backgroundColor: '#1e293b',
  backgroundImage: '',
  textAlign: 'center',
  height: 'medium',
  ...props.componentData
});

// Watch for external data changes
watch(() => props.componentData, (newData) => {
  localData.value = { ...localData.value, ...newData };
}, { deep: true });

// Update field with debouncing
let updateTimeout = null;
const updateField = (field) => {
  if (updateTimeout) clearTimeout(updateTimeout);
  
  updateTimeout = setTimeout(() => {
    // Update store directly
    store.updateComponent(props.componentId, {
      data: { ...localData.value }
    });
    
    // Emit update event
    emit('update', {
      data: { ...localData.value }
    });
    
    // Mark as having unsaved changes
    store.hasUnsavedChanges = true;
  }, 300);
};
</script>

<style scoped>
.hero-editor {
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

.editor-sections {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f9fafb;
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

.field-group input[type="text"],
.field-group input[type="url"],
.field-group input[type="color"],
.field-group select,
.field-group textarea {
  width: 100%;
  padding: var(--gmkb-spacing-sm, 8px) 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  transition: all 0.2s;
}

.field-group input:focus,
.field-group select:focus,
.field-group textarea:focus {
  outline: none;
  border-color: var(--gmkb-color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-group textarea {
  resize: vertical;
  font-family: inherit;
}

/* Color input wrapper */
.color-input {
  display: flex;
  gap: 8px;
}

.color-input input[type="color"] {
  width: 48px;
  height: 36px;
  padding: 4px;
  cursor: pointer;
}

.color-input input[type="text"] {
  flex: 1;
}

/* Scrollbar styling */
.editor-sections::-webkit-scrollbar {
  width: 6px;
}

.editor-sections::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.editor-sections::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.editor-sections::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
