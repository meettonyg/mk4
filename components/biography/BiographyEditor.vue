<template>
  <div class="biography-editor">
    <!-- Show content based on parent's active tab -->
    
    <!-- CONTENT TAB -->
    <div v-if="activeTab === 'content'" class="tab-content">
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
    <div v-else-if="activeTab === 'style'" class="tab-content">
      <BaseStylePanel
        :component-id="componentId"
        :component-type="'biography'"
        :show-typography="true"
      />
    </div>
    
    <!-- ADVANCED TAB -->
    <div v-else-if="activeTab === 'advanced'" class="tab-content">
      <BaseAdvancedPanel
        :component-id="componentId"
      />
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
  },
  activeTab: {
    type: String,
    default: 'content'
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
    
    store.isDirty = true;
  }, 300);
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
  background: #f9fafb;
}

body.dark-mode .biography-editor {
  background: #0f172a;
}

.tab-content {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
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
}

body.dark-mode .field-group input[type="text"],
body.dark-mode .field-group input[type="url"],
body.dark-mode .field-group select,
body.dark-mode .field-group textarea {
  background: #0f172a;
  border-color: #334155;
  color: #f3f4f6;
}

.field-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
  cursor: pointer;
  accent-color: #ec4899;
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
  font-family: inherit;
  min-height: 120px;
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

.social-links {
  padding-top: 8px;
}

/* Scrollbar styling */
.tab-content::-webkit-scrollbar {
  width: 6px;
}

.tab-content::-webkit-scrollbar-track {
  background: #f1f5f9;
}

body.dark-mode .tab-content::-webkit-scrollbar-track {
  background: #1e293b;
}

.tab-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

body.dark-mode .tab-content::-webkit-scrollbar-thumb {
  background: #475569;
}

.tab-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

body.dark-mode .tab-content::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>
