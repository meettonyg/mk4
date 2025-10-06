<template>
  <div class="biography-editor">
    <div class="editor-header">
      <h3>Edit Biography Section</h3>
      <button @click="closeEditor" class="close-btn">×</button>
    </div>
    
    <div class="editor-fields">
      <!-- Name Fields -->
      <div class="field-group">
        <label for="bio-name">Full Name</label>
        <input 
          id="bio-name"
          v-model="localData.name" 
          @input="updateComponent"
          placeholder="Enter full name..."
        >
      </div>
      
      <!-- Title/Role Field -->
      <div class="field-group">
        <label for="bio-title">Title / Role</label>
        <input 
          id="bio-title"
          v-model="localData.title" 
          @input="updateComponent"
          placeholder="e.g., CEO, Author, Speaker..."
        >
      </div>
      
      <!-- Biography Text -->
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
      
      <!-- Profile Image -->
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
      
      <!-- Additional Information -->
      <div class="field-group">
        <label for="bio-location">Location</label>
        <input 
          id="bio-location"
          v-model="localData.location" 
          @input="updateComponent"
          placeholder="City, Country"
        >
      </div>
      
      <!-- Social Links -->
      <div class="field-group">
        <label>Social Links</label>
        <div class="social-links">
          <input 
            v-model="localData.linkedin" 
            @input="updateComponent"
            placeholder="LinkedIn URL"
            class="small-input"
          >
          <input 
            v-model="localData.twitter" 
            @input="updateComponent"
            placeholder="Twitter/X URL"
            class="small-input"
          >
          <input 
            v-model="localData.website" 
            @input="updateComponent"
            placeholder="Personal Website"
            class="small-input"
          >
        </div>
      </div>
      
      <!-- Display Options -->
      <details class="advanced-section">
        <summary>Display Options</summary>
        
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
              v-model="localData.showSocialLinks" 
              @change="updateComponent"
            >
            Show Social Links
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
    
    store.hasUnsavedChanges = true;
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
  background: white;
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
  min-height: 120px;
  font-family: inherit;
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

.social-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.small-input {
  margin-bottom: 0 !important;
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

.advanced-section[open] summary {
  margin-bottom: 16px;
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
