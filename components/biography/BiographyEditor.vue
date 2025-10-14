<template>
  <ComponentEditorTemplate
    :component-id="componentId"
    component-type="Biography"
    :show-typography="true"
    :active-tab="activeTab"
    @update:active-tab="activeTab = $event"
    @close="handleClose"
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
  location: ''
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
      location: component.data.location || ''
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
        location: localData.value.location,
        // Legacy field compatibility
        fullName: localData.value.name,
        role: localData.value.title,
        bio: localData.value.biography,
        content: localData.value.biography
      }
    });
    
    store.isDirty = true;
  }, 300);
};

// Handle close button
const handleClose = () => {
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


</style>
