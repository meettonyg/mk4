<template>
  <div class="guest-intro-editor">
    <div class="editor-header">
      <h3>Edit Guest Introduction</h3>
      <button @click="closeEditor" class="close-btn">×</button>
    </div>
    
    <div class="editor-fields">
      <!-- Guest Name -->
      <div class="field-group">
        <label for="guest-name">Guest Name</label>
        <input 
          id="guest-name"
          v-model="localData.name" 
          @input="updateComponent"
          placeholder="Full name of the guest"
        >
      </div>
      
      <!-- Title/Role -->
      <div class="field-group">
        <label for="guest-title">Title / Position</label>
        <input 
          id="guest-title"
          v-model="localData.title" 
          @input="updateComponent"
          placeholder="e.g., CEO of Company, Author, Speaker"
        >
      </div>
      
      <!-- Company/Organization -->
      <div class="field-group">
        <label for="company">Company/Organization</label>
        <input 
          id="company"
          v-model="localData.company" 
          @input="updateComponent"
          placeholder="Company or organization name"
        >
      </div>
      
      <!-- Profile Image -->
      <div class="field-group">
        <label for="profile-image">Profile Image</label>
        <input 
          id="profile-image"
          v-model="localData.imageUrl" 
          @input="updateComponent"
          placeholder="Profile image URL"
        >
        <button @click="openMediaLibrary" class="media-btn">
          Choose from Media Library
        </button>
      </div>
      
      <!-- Introduction Text -->
      <div class="field-group">
        <label for="intro-text">Introduction</label>
        <textarea 
          id="intro-text"
          v-model="localData.introduction" 
          @input="updateComponent"
          rows="6"
          placeholder="Brief introduction about the guest..."
        />
      </div>
      
      <!-- Key Points -->
      <div class="field-group">
        <label>Key Talking Points</label>
        <div class="points-list">
          <div 
            v-for="(point, index) in localData.keyPoints" 
            :key="index"
            class="point-item"
          >
            <input 
              v-model="localData.keyPoints[index]" 
              @input="updateComponent"
              placeholder="Key discussion point..."
              class="point-input"
            >
            <button 
              @click="removePoint(index)"
              class="remove-btn"
              title="Remove point"
            >×</button>
          </div>
          
          <button 
            @click="addPoint"
            class="add-btn"
          >
            + Add Talking Point
          </button>
        </div>
      </div>
      
      <!-- Guest Links -->
      <div class="field-group">
        <label>Guest Links</label>
        <div class="links-fields">
          <input 
            v-model="localData.websiteUrl" 
            @input="updateComponent"
            placeholder="Personal/Company website"
            class="link-field"
          >
          <input 
            v-model="localData.linkedinUrl" 
            @input="updateComponent"
            placeholder="LinkedIn profile"
            class="link-field"
          >
          <input 
            v-model="localData.bookUrl" 
            @input="updateComponent"
            placeholder="Book/Product link"
            class="link-field"
          >
        </div>
      </div>
      
      <!-- Display Options -->
      <details class="advanced-section">
        <summary>Display Options</summary>
        
        <div class="field-group">
          <label for="layout">Layout Style</label>
          <select 
            id="layout"
            v-model="localData.layout" 
            @change="updateComponent"
          >
            <option value="side-by-side">Side by Side</option>
            <option value="centered">Centered</option>
            <option value="card">Card Style</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
        
        <div class="field-group">
          <label for="image-position">Image Position</label>
          <select 
            id="image-position"
            v-model="localData.imagePosition" 
            @change="updateComponent"
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="top">Top</option>
          </select>
        </div>
        
        <div class="field-group">
          <label>
            <input 
              type="checkbox"
              v-model="localData.showKeyPoints" 
              @change="updateComponent"
            >
            Show Key Talking Points
          </label>
        </div>
        
        <div class="field-group">
          <label>
            <input 
              type="checkbox"
              v-model="localData.showLinks" 
              @change="updateComponent"
            >
            Show Guest Links
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
  name: '',
  title: '',
  company: '',
  imageUrl: '',
  introduction: '',
  keyPoints: [],
  websiteUrl: '',
  linkedinUrl: '',
  bookUrl: '',
  layout: 'side-by-side',
  imagePosition: 'left',
  showKeyPoints: true,
  showLinks: true
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    localData.value = {
      name: component.data.name || '',
      title: component.data.title || '',
      company: component.data.company || '',
      imageUrl: component.data.imageUrl || '',
      introduction: component.data.introduction || '',
      keyPoints: Array.isArray(component.data.keyPoints) ? [...component.data.keyPoints] : [],
      websiteUrl: component.data.websiteUrl || '',
      linkedinUrl: component.data.linkedinUrl || '',
      bookUrl: component.data.bookUrl || '',
      layout: component.data.layout || 'side-by-side',
      imagePosition: component.data.imagePosition || 'left',
      showKeyPoints: component.data.showKeyPoints !== false,
      showLinks: component.data.showLinks !== false
    };
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

// Add point
const addPoint = () => {
  localData.value.keyPoints.push('');
  updateComponent();
};

// Remove point
const removePoint = (index) => {
  localData.value.keyPoints.splice(index, 1);
  updateComponent();
};

// Open WordPress Media Library
const openMediaLibrary = () => {
  if (window.wp && window.wp.media) {
    const frame = window.wp.media({
      title: 'Select Guest Profile Image',
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

// Update component
let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) clearTimeout(updateTimeout);
  
  updateTimeout = setTimeout(() => {
    store.updateComponent(props.componentId, {
      data: {
        name: localData.value.name,
        title: localData.value.title,
        company: localData.value.company,
        imageUrl: localData.value.imageUrl,
        introduction: localData.value.introduction,
        keyPoints: localData.value.keyPoints.filter(p => p.trim()),
        websiteUrl: localData.value.websiteUrl,
        linkedinUrl: localData.value.linkedinUrl,
        bookUrl: localData.value.bookUrl,
        layout: localData.value.layout,
        imagePosition: localData.value.imagePosition,
        showKeyPoints: localData.value.showKeyPoints,
        showLinks: localData.value.showLinks
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
.guest-intro-editor {
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
.field-group textarea,
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

.media-btn {
  margin-top: 8px;
  padding: var(--gmkb-spacing-sm, 8px) 12px;
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

.points-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.point-item {
  display: flex;
  gap: 8px;
}

.point-input {
  flex: 1;
  margin: 0 !important;
}

.links-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.link-field {
  margin: 0 !important;
}

.remove-btn {
  width: 32px;
  height: 38px;
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

.add-btn {
  padding: 10px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0284c7;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background: #e0f2fe;
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
