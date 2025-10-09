<template>
  <div class="guest-intro-editor">
    <div class="editor-header">
      <h3>Guest Introduction Component</h3>
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
          <h4>Guest Information</h4>
          
          <div class="field-group">
            <label for="guest-name">Guest Name</label>
            <input 
              id="guest-name"
              v-model="localData.name" 
              @input="updateComponent"
              placeholder="Full name of the guest"
            >
          </div>
          
          <div class="field-group">
            <label for="guest-title">Title / Position</label>
            <input 
              id="guest-title"
              v-model="localData.title" 
              @input="updateComponent"
              placeholder="e.g., CEO of Company, Author, Speaker"
            >
          </div>
          
          <div class="field-group">
            <label for="company">Company/Organization</label>
            <input 
              id="company"
              v-model="localData.company" 
              @input="updateComponent"
              placeholder="Company or organization name"
            >
          </div>
        </section>

        <section class="editor-section">
          <h4>Profile Image</h4>
          
          <div class="field-group">
            <label for="profile-image">Profile Image URL</label>
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
        </section>

        <section class="editor-section">
          <h4>Introduction Text</h4>
          
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
        </section>

        <section class="editor-section">
          <h4>Key Talking Points</h4>
          
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
          
          <div v-if="localData.showKeyPoints" class="points-list">
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
        </section>

        <section class="editor-section">
          <h4>Guest Links</h4>
          
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
          
          <div v-if="localData.showLinks">
            <div class="field-group">
              <label for="website-url">Website URL</label>
              <input 
                id="website-url"
                v-model="localData.websiteUrl" 
                @input="updateComponent"
                placeholder="Personal/Company website"
              >
            </div>
            
            <div class="field-group">
              <label for="linkedin-url">LinkedIn URL</label>
              <input 
                id="linkedin-url"
                v-model="localData.linkedinUrl" 
                @input="updateComponent"
                placeholder="LinkedIn profile"
              >
            </div>
            
            <div class="field-group">
              <label for="book-url">Book/Product URL</label>
              <input 
                id="book-url"
                v-model="localData.bookUrl" 
                @input="updateComponent"
                placeholder="Book/Product link"
              >
            </div>
          </div>
        </section>

        <section class="editor-section">
          <h4>Display Options</h4>
          
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
        </section>
      </div>
      
      <!-- STYLE TAB -->
      <div v-show="activeTab === 'style'" class="tab-panel">
        <BaseStylePanel
          :component-id="componentId"
          :component-type="'guest-intro'"
          :show-typography="true"
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
    store.isDirty = true;
  }, 300);
};

const closeEditor = () => {
  store.closeEditPanel();
};
</script>

<style scoped>
.guest-intro-editor {
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
.field-group textarea,
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
.field-group textarea:focus,
.field-group select:focus {
  outline: none;
  border-color: var(--gmkb-color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-group textarea {
  resize: vertical;
  font-family: inherit;
}

.media-btn {
  margin-top: 8px;
  width: 100%;
  padding: var(--gmkb-spacing-sm, 8px) 12px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  color: #475569;
  font-weight: 500;
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
  margin-top: 12px;
}

.point-item {
  display: flex;
  gap: 8px;
}

.point-input {
  flex: 1;
  padding: var(--gmkb-spacing-sm, 8px) 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.point-input:focus {
  outline: none;
  border-color: var(--gmkb-color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
  font-weight: 500;
  transition: all 0.2s;
}

.add-btn:hover {
  background: #e0f2fe;
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
