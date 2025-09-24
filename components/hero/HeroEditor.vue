<template>
  <div class="hero-editor">
    <div class="editor-header">
      <h3>Edit Hero Section</h3>
      <button @click="closeEditor" class="close-btn">×</button>
    </div>
    
    <div class="editor-fields">
      <!-- Title Field -->
      <div class="field-group">
        <label for="hero-title">Title</label>
        <input 
          id="hero-title"
          v-model="localData.title" 
          @input="updateComponent"
          placeholder="Enter hero title..."
        >
      </div>
      
      <!-- Subtitle Field -->
      <div class="field-group">
        <label for="hero-subtitle">Subtitle</label>
        <input 
          id="hero-subtitle"
          v-model="localData.subtitle" 
          @input="updateComponent"
          placeholder="Enter subtitle..."
        >
      </div>
      
      <!-- Description Field -->
      <div class="field-group">
        <label for="hero-description">Description</label>
        <textarea 
          id="hero-description"
          v-model="localData.description" 
          @input="updateComponent"
          rows="4"
          placeholder="Enter description..."
        />
      </div>
      
      <!-- Image URL Field -->
      <div class="field-group">
        <label for="hero-image">Image URL</label>
        <input 
          id="hero-image"
          v-model="localData.imageUrl" 
          @input="updateComponent"
          placeholder="https://example.com/image.jpg"
        >
        <button @click="openMediaLibrary" class="media-btn">
          Choose from Media Library
        </button>
      </div>
      
      <!-- Buttons Section -->
      <div class="field-group">
        <label>Buttons</label>
        
        <!-- Primary Button -->
        <div class="button-group">
          <h4>Primary Button</h4>
          <input 
            v-model="localData.primaryButtonText" 
            @input="updateComponent"
            placeholder="Button text..."
            class="small-input"
          >
          <input 
            v-model="localData.primaryButtonUrl" 
            @input="updateComponent"
            placeholder="Button URL..."
            class="small-input"
          >
        </div>
        
        <!-- Secondary Button -->
        <div class="button-group">
          <h4>Secondary Button (Optional)</h4>
          <input 
            v-model="localData.secondaryButtonText" 
            @input="updateComponent"
            placeholder="Button text..."
            class="small-input"
          >
          <input 
            v-model="localData.secondaryButtonUrl" 
            @input="updateComponent"
            placeholder="Button URL..."
            class="small-input"
          >
        </div>
      </div>
      
      <!-- Advanced Options -->
      <details class="advanced-section">
        <summary>Advanced Options</summary>
        
        <!-- Text Alignment -->
        <div class="field-group">
          <label for="text-align">Text Alignment</label>
          <select 
            id="text-align"
            v-model="localData.textAlign" 
            @change="updateComponent"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
        
        <!-- Background Style -->
        <div class="field-group">
          <label for="bg-style">Background Style</label>
          <select 
            id="bg-style"
            v-model="localData.backgroundStyle" 
            @change="updateComponent"
          >
            <option value="default">Default</option>
            <option value="gradient">Gradient</option>
            <option value="image">Image</option>
            <option value="solid">Solid Color</option>
          </select>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
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
  subtitle: '',
  description: '',
  imageUrl: '',
  primaryButtonText: '',
  primaryButtonUrl: '',
  secondaryButtonText: '',
  secondaryButtonUrl: '',
  textAlign: 'left',
  backgroundStyle: 'default'
});

// Initialize local data from store
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    // Merge existing data with defaults
    localData.value = {
      title: component.data.title || component.data.headline || '',
      subtitle: component.data.subtitle || component.data.subheadline || '',
      description: component.data.description || component.data.content || '',
      imageUrl: component.data.imageUrl || component.data.backgroundImage || '',
      primaryButtonText: component.data.primaryButtonText || '',
      primaryButtonUrl: component.data.primaryButtonUrl || '',
      secondaryButtonText: component.data.secondaryButtonText || '',
      secondaryButtonUrl: component.data.secondaryButtonUrl || '',
      textAlign: component.data.textAlign || 'left',
      backgroundStyle: component.data.backgroundStyle || 'default'
    };
    
    // Handle button arrays if they exist
    if (Array.isArray(component.data.buttons) && component.data.buttons.length > 0) {
      const [primary, secondary] = component.data.buttons;
      if (primary) {
        localData.value.primaryButtonText = primary.text || '';
        localData.value.primaryButtonUrl = primary.url || '';
      }
      if (secondary) {
        localData.value.secondaryButtonText = secondary.text || '';
        localData.value.secondaryButtonUrl = secondary.url || '';
      }
    }
  }
};

// Watch for component changes
watch(() => props.componentId, () => {
  loadComponentData();
}, { immediate: true });

// Update component in store with debouncing
let updateTimeout = null;
const updateComponent = () => {
  // Clear existing timeout
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
  
  // Debounce updates to prevent too many saves
  updateTimeout = setTimeout(() => {
    // Prepare buttons array for compatibility
    const buttons = [];
    if (localData.value.primaryButtonText) {
      buttons.push({
        text: localData.value.primaryButtonText,
        url: localData.value.primaryButtonUrl || '#',
        style: 'primary'
      });
    }
    if (localData.value.secondaryButtonText) {
      buttons.push({
        text: localData.value.secondaryButtonText,
        url: localData.value.secondaryButtonUrl || '#',
        style: 'secondary'
      });
    }
    
    // Update store with all data formats for compatibility
    store.updateComponent(props.componentId, {
      data: {
        // New format
        title: localData.value.title,
        subtitle: localData.value.subtitle,
        description: localData.value.description,
        imageUrl: localData.value.imageUrl,
        // Legacy format compatibility
        headline: localData.value.title,
        subheadline: localData.value.subtitle,
        content: localData.value.description,
        backgroundImage: localData.value.imageUrl,
        // Button formats
        primaryButtonText: localData.value.primaryButtonText,
        primaryButtonUrl: localData.value.primaryButtonUrl,
        secondaryButtonText: localData.value.secondaryButtonText,
        secondaryButtonUrl: localData.value.secondaryButtonUrl,
        buttons: buttons,
        // Advanced options
        textAlign: localData.value.textAlign,
        backgroundStyle: localData.value.backgroundStyle
      }
    });
    
    // Mark as having unsaved changes
    store.hasUnsavedChanges = true;
  }, 300); // 300ms debounce delay
};

// Close editor
const closeEditor = () => {
  store.closeEditPanel();
};

// Open WordPress Media Library
const openMediaLibrary = () => {
  if (window.wp && window.wp.media) {
    const frame = window.wp.media({
      title: 'Select Hero Image',
      button: {
        text: 'Use this image'
      },
      multiple: false
    });
    
    frame.on('select', () => {
      const attachment = frame.state().get('selection').first().toJSON();
      localData.value.imageUrl = attachment.url;
      updateComponent();
    });
    
    frame.open();
  } else {
    alert('WordPress Media Library not available. Please enter an image URL manually.');
  }
};

// Load data on mount
onMounted(() => {
  loadComponentData();
});
</script>

<style scoped>
.hero-editor {
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
.field-group textarea,
.field-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  background: white;
}

.field-group input:focus,
.field-group textarea:focus,
.field-group select:focus {
  outline: none;
  border-color: var(--gmkb-color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-group textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.media-btn {
  margin-top: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  color: #475569;
}

.media-btn:hover {
  background: var(--gmkb-color-primary, #3b82f6);
  color: white;
  border-color: var(--gmkb-color-primary, #3b82f6);
}

.button-group {
  background: #f8fafc;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.button-group h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.button-group .small-input {
  margin-bottom: 8px;
}

.button-group .small-input:last-child {
  margin-bottom: 0;
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
  margin-bottom: 12px;
  user-select: none;
}

.advanced-section[open] summary {
  margin-bottom: 16px;
}

.advanced-section .field-group:first-of-type {
  margin-top: 8px;
}

/* Scrollbar styling */
.editor-fields::-webkit-scrollbar {
  width: 6px;
}

.editor-fields::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.editor-fields::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.editor-fields::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
