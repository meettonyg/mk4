<template>
  <div class="logo-grid-editor">
    <div class="editor-header">
      <h3>Edit Logo Grid</h3>
      <button @click="closeEditor" class="close-btn">×</button>
    </div>
    
    <div class="editor-fields">
      <!-- Section Title -->
      <div class="field-group">
        <label for="grid-title">Section Title</label>
        <input 
          id="grid-title"
          v-model="localData.title" 
          @input="updateComponent"
          placeholder="e.g., Trusted By, Featured In, Partners"
        >
      </div>
      
      <!-- Subtitle -->
      <div class="field-group">
        <label for="grid-subtitle">Subtitle</label>
        <input 
          id="grid-subtitle"
          v-model="localData.subtitle" 
          @input="updateComponent"
          placeholder="Optional subtitle text"
        >
      </div>
      
      <!-- Logos List -->
      <div class="field-group">
        <label>Logos</label>
        <div class="logos-list">
          <div 
            v-for="(logo, index) in localData.logos" 
            :key="index"
            class="logo-item"
          >
            <div class="logo-preview">
              <img v-if="logo.imageUrl" :src="logo.imageUrl" :alt="logo.name">
              <div v-else class="logo-placeholder">No Logo</div>
            </div>
            
            <div class="logo-fields">
              <input 
                v-model="logo.name" 
                @input="updateComponent"
                placeholder="Company/Brand name"
                class="logo-field"
              >
              
              <input 
                v-model="logo.imageUrl" 
                @input="updateComponent"
                placeholder="Logo image URL"
                class="logo-field"
              >
              
              <input 
                v-model="logo.link" 
                @input="updateComponent"
                placeholder="Website URL (optional)"
                class="logo-field"
              >
              
              <button 
                @click="removeLogo(index)"
                class="remove-btn"
                title="Remove logo"
              >×</button>
            </div>
          </div>
          
          <div class="add-logo-buttons">
            <button 
              @click="addLogo"
              class="add-btn"
            >
              + Add Logo Manually
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
          <label for="columns">Columns (Desktop)</label>
          <select 
            id="columns"
            v-model="localData.columns" 
            @change="updateComponent"
          >
            <option value="3">3 Columns</option>
            <option value="4">4 Columns</option>
            <option value="5">5 Columns</option>
            <option value="6">6 Columns</option>
          </select>
        </div>
        
        <div class="field-group">
          <label for="logo-style">Logo Style</label>
          <select 
            id="logo-style"
            v-model="localData.logoStyle" 
            @change="updateComponent"
          >
            <option value="default">Default</option>
            <option value="grayscale">Grayscale</option>
            <option value="color-on-hover">Color on Hover</option>
          </select>
        </div>
        
        <div class="field-group">
          <label for="alignment">Alignment</label>
          <select 
            id="alignment"
            v-model="localData.alignment" 
            @change="updateComponent"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
        
        <div class="field-group">
          <label>
            <input 
              type="checkbox"
              v-model="localData.showBorders" 
              @change="updateComponent"
            >
            Show Borders
          </label>
        </div>
        
        <div class="field-group">
          <label>
            <input 
              type="checkbox"
              v-model="localData.makeClickable" 
              @change="updateComponent"
            >
            Make Logos Clickable
          </label>
        </div>
        
        <div class="field-group">
          <label>
            <input 
              type="checkbox"
              v-model="localData.autoScroll" 
              @change="updateComponent"
            >
            Auto-Scroll (Carousel)
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
  subtitle: '',
  logos: [],
  columns: '4',
  logoStyle: 'default',
  alignment: 'center',
  showBorders: false,
  makeClickable: true,
  autoScroll: false
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    localData.value = {
      title: component.data.title || '',
      subtitle: component.data.subtitle || '',
      logos: Array.isArray(component.data.logos) ? [...component.data.logos] : [],
      columns: String(component.data.columns || '4'),
      logoStyle: component.data.logoStyle || 'default',
      alignment: component.data.alignment || 'center',
      showBorders: component.data.showBorders || false,
      makeClickable: component.data.makeClickable !== false,
      autoScroll: component.data.autoScroll || false
    };
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

// Add logo
const addLogo = () => {
  localData.value.logos.push({
    name: '',
    imageUrl: '',
    link: ''
  });
  updateComponent();
};

// Remove logo
const removeLogo = (index) => {
  localData.value.logos.splice(index, 1);
  updateComponent();
};

// Open WordPress Media Library
const openMediaLibrary = () => {
  if (window.wp && window.wp.media) {
    const frame = window.wp.media({
      title: 'Select Logo Images',
      button: {
        text: 'Add to Logo Grid'
      },
      multiple: true
    });
    
    frame.on('select', () => {
      const attachments = frame.state().get('selection').toJSON();
      attachments.forEach(attachment => {
        localData.value.logos.push({
          name: attachment.title || '',
          imageUrl: attachment.url,
          link: ''
        });
      });
      updateComponent();
    });
    
    frame.open();
  } else {
    alert('WordPress Media Library not available. Please add logos manually.');
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
        subtitle: localData.value.subtitle,
        logos: localData.value.logos.filter(logo => logo.imageUrl || logo.name),
        columns: parseInt(localData.value.columns),
        logoStyle: localData.value.logoStyle,
        alignment: localData.value.alignment,
        showBorders: localData.value.showBorders,
        makeClickable: localData.value.makeClickable,
        autoScroll: localData.value.autoScroll
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
.logo-grid-editor {
  background: white;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--gmkb-spacing-md, 16px) 20px;
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

.logos-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.logo-item {
  display: flex;
  gap: 12px;
  padding: var(--gmkb-space-3, 12px);
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.logo-preview {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.logo-placeholder {
  color: #94a3b8;
  font-size: 10px;
  text-align: center;
}

.logo-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.logo-field {
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

.add-logo-buttons {
  display: flex;
  gap: 8px;
}

.add-btn {
  flex: 1;
  padding: var(--gmkb-space-3, 12px);
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
  padding: var(--gmkb-spacing-md, 16px);
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
