<template>
  <ComponentEditorTemplate
    :component-id="componentId"
    component-type="Biography"
    :show-typography="true"
    :active-tab="activeTab"
    @update:active-tab="activeTab = $event"
    @back="handleBack"
  >
    <!-- Content Tab -->
    <template #content>
      <div class="content-fields">
        <section class="editor-section">
          <h4>Personal Information</h4>
          
          <div class="field-group">
            <label for="bio-name">Full Name</label>
            <input 
              id="bio-name"
              v-model="localData.name" 
              @input="updateComponent"
              type="text"
              placeholder="Enter full name..."
            />
          </div>
          
          <div class="field-group">
            <label for="bio-title">Title / Role</label>
            <input 
              id="bio-title"
              v-model="localData.title" 
              @input="updateComponent"
              type="text"
              placeholder="e.g., CEO, Author, Speaker..."
            />
          </div>
          
          <div class="field-group">
            <label for="bio-location">Location</label>
            <input 
              id="bio-location"
              v-model="localData.location" 
              @input="updateComponent"
              type="text"
              placeholder="City, Country"
            />
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
              type="url"
              placeholder="https://example.com/profile.jpg"
            />
            <button @click="openMediaLibrary" class="media-btn">
              Choose from Media Library
            </button>
          </div>
          
          <!-- Image Preview -->
          <div v-if="localData.imageUrl" class="image-preview">
            <img :src="localData.imageUrl" alt="Profile preview" />
          </div>
        </section>

        <section class="editor-section">
          <h4>Social Links</h4>
          
          <div class="field-group">
            <label for="bio-linkedin">LinkedIn URL</label>
            <input 
              id="bio-linkedin"
              v-model="localData.linkedin" 
              @input="updateComponent"
              type="url"
              placeholder="https://linkedin.com/in/..."
            />
          </div>
          
          <div class="field-group">
            <label for="bio-twitter">Twitter/X URL</label>
            <input 
              id="bio-twitter"
              v-model="localData.twitter" 
              @input="updateComponent"
              type="url"
              placeholder="https://twitter.com/..."
            />
          </div>
          
          <div class="field-group">
            <label for="bio-website">Personal Website</label>
            <input 
              id="bio-website"
              v-model="localData.website" 
              @input="updateComponent"
              type="url"
              placeholder="https://..."
            />
          </div>
        </section>
      </div>
    </template>
  </ComponentEditorTemplate>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useMediaKitStore } from '@stores/mediaKit';
import ComponentEditorTemplate from '@/vue/components/sidebar/editors/ComponentEditorTemplate.vue';

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
  name: '',
  title: '',
  biography: '',
  imageUrl: '',
  location: '',
  linkedin: '',
  twitter: '',
  website: ''
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
      website: component.data.website || ''
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
body.dark-mode .field-group textarea {
  background: #0f172a;
  border-color: #334155;
  color: #f3f4f6;
}

.field-group input:focus,
.field-group textarea:focus {
  outline: none;
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.field-group textarea {
  resize: vertical;
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

.image-preview {
  margin-top: 12px;
  text-align: center;
}

.image-preview img {
  max-width: 200px;
  height: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

body.dark-mode .image-preview img {
  border-color: #334155;
}
</style>
