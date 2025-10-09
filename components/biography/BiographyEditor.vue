<template>
  <div class="biography-editor">
    <div class="editor-header">
      <h3>Biography Component</h3>
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
          <h4>Personal Information</h4>
          
          <div class="field-group">
            <label for="bio-name">Full Name</label>
            <input 
              id="bio-name"
              v-model="localData.name" 
              @input="updateComponent"
              placeholder="Enter full name..."
            >
          </div>
          
          <div class="field-group">
            <label for="bio-title">Title / Role</label>
            <input 
              id="bio-title"
              v-model="localData.title" 
              @input="updateComponent"
              placeholder="e.g., CEO, Author, Speaker..."
            >
          </div>
          
          <div class="field-group">
            <label for="bio-location">Location</label>
            <input 
              id="bio-location"
              v-model="localData.location" 
              @input="updateComponent"
              placeholder="City, Country"
            >
          </div>
        </section>

        <section class="editor-section">
          <h4>Biography Text</h4>
          
          <div class="field-group">
            <label for="bio-text">Biography</label>
            <textarea 
              id="bio-text"
              v-model="localData.biography" 
              @input="updateComponent"
              rows="8"
              placeholder="Enter biography text..."
            />
          </div>
        </section>

        <section class="editor-section">
          <h4>Profile Image</h4>
          
          <div class="field-group">
            <label for="bio-image">Profile Image URL</label>
            <input 
              id="bio-image"
              v-model="localData.imageUrl" 
              @input="updateComponent"
              placeholder="https://example.com/profile.jpg"
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
          <h4>Social Links</h4>
          
          <div class="field-group">
            <label>
              <input 
                type="checkbox"
                v-model="localData.showSocialLinks" 
                @change="updateComponent"
              >
              Show Social Links
            </label>
          </div>
          
          <div v-if="localData.showSocialLinks" class="social-links">
            <div class="field-group">
              <label for="bio-linkedin">LinkedIn URL</label>
              <input 
                id="bio-linkedin"
                v-model="localData.linkedin" 
                @input="updateComponent"
                placeholder="https://linkedin.com/in/..."
              >
            </div>
            
            <div class="field-group">
              <label for="bio-twitter">Twitter/X URL</label>
              <input 
                id="bio-twitter"
                v-model="localData.twitter" 
                @input="updateComponent"
                placeholder="https://twitter.com/..."
              >
            </div>
            
            <div class="field-group">
              <label for="bio-website">Personal Website</label>
              <input 
                id="bio-website"
                v-model="localData.website" 
                @input="updateComponent"
                placeholder="https://..."
              >
            </div>
          </div>
        </section>
      </div>
      
      <!-- STYLE TAB -->
      <div v-show="activeTab === 'style'" class="tab-panel">
        <BaseStylePanel
          :component-id="componentId"
          :component-type="'biography'"
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
  biography: '',
  imageUrl: '',
  location: '',
  linkedin: '',
  twitter: '',
  website: '',
  imagePosition: 'left',
  showSocialLinks: true
});

// Initialize local data from store
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    // Merge existing data with defaults
    localData.value = {
      name: component.data.name || component.data.fullName || '',
      title: component.data.title || component.data.role || '',
      biography: component.data.biography || component.data.bio || component.data.content || '',
      imageUrl: component.data.imageUrl || component.data.profileImage || '',
      location: component.data.location || '',
      linkedin: component.data.linkedin || '',
      twitter: component.data.twitter || '',
      website: component.data.website || '',
      imagePosition: component.data.imagePosition || 'left',
      showSocialLinks: component.data.showSocialLinks !== false
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
        // Primary fields
        name: localData.value.name,
        title: localData.value.title,
        biography: localData.value.biography,
        imageUrl: localData.value.imageUrl,
        location: localData.value.location,
        // Social links
        linkedin: localData.value.linkedin,
        twitter: localData.value.twitter,
        website: localData.value.website,
        // Display options
        imagePosition: localData.value.imagePosition,
        showSocialLinks: localData.value.showSocialLinks,
        // Legacy field compatibility
        fullName: localData.value.name,
        role: localData.value.title,
        bio: localData.value.biography,
        content: localData.value.biography,
        profileImage: localData.value.imageUrl
      }
    });
    
    store.isDirty = true;
  }, 300);
};

// Close editor
const closeEditor = () => {
  store.closeEditPanel();
};

// Open WordPress Media Library
const openMediaLibrary = () => {
  if (window.wp && window.wp.media) {
    const frame = window.wp.media({
      title: 'Select Profile Image',
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
</script>

<style scoped>
.biography-editor {
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

.field-group input[type="text"],
.field-group input[type="url"],
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

.field-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
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

.social-links {
  display: flex;
  flex-direction: column;
  gap: 0;
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
