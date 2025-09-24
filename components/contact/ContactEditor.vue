<template>
  <div class="contact-editor">
    <div class="editor-header">
      <h3>Edit Contact Section</h3>
      <button @click="closeEditor" class="close-btn">×</button>
    </div>
    
    <div class="editor-fields">
      <!-- Section Title -->
      <div class="field-group">
        <label for="contact-title">Section Title</label>
        <input 
          id="contact-title"
          v-model="localData.title" 
          @input="updateComponent"
          placeholder="e.g., Get in Touch"
        >
      </div>
      
      <!-- Description -->
      <div class="field-group">
        <label for="contact-description">Description</label>
        <textarea 
          id="contact-description"
          v-model="localData.description" 
          @input="updateComponent"
          rows="3"
          placeholder="Brief introduction text..."
        />
      </div>
      
      <!-- Contact Information -->
      <div class="field-group">
        <label>Contact Information</label>
        
        <div class="contact-field">
          <label class="sub-label">Email</label>
          <input 
            v-model="localData.email" 
            @input="updateComponent"
            type="email"
            placeholder="contact@example.com"
          >
        </div>
        
        <div class="contact-field">
          <label class="sub-label">Phone</label>
          <input 
            v-model="localData.phone" 
            @input="updateComponent"
            type="tel"
            placeholder="+1 (555) 123-4567"
          >
        </div>
        
        <div class="contact-field">
          <label class="sub-label">Website</label>
          <input 
            v-model="localData.website" 
            @input="updateComponent"
            type="url"
            placeholder="https://example.com"
          >
        </div>
        
        <div class="contact-field">
          <label class="sub-label">Address</label>
          <textarea 
            v-model="localData.address" 
            @input="updateComponent"
            rows="2"
            placeholder="123 Main St, City, State 12345"
          />
        </div>
      </div>
      
      <!-- Social Media -->
      <div class="field-group">
        <label>Social Media Links</label>
        
        <div class="social-field">
          <label class="sub-label">LinkedIn</label>
          <input 
            v-model="localData.linkedin" 
            @input="updateComponent"
            placeholder="https://linkedin.com/in/username"
          >
        </div>
        
        <div class="social-field">
          <label class="sub-label">Twitter/X</label>
          <input 
            v-model="localData.twitter" 
            @input="updateComponent"
            placeholder="https://twitter.com/username"
          >
        </div>
        
        <div class="social-field">
          <label class="sub-label">Instagram</label>
          <input 
            v-model="localData.instagram" 
            @input="updateComponent"
            placeholder="https://instagram.com/username"
          >
        </div>
        
        <div class="social-field">
          <label class="sub-label">Facebook</label>
          <input 
            v-model="localData.facebook" 
            @input="updateComponent"
            placeholder="https://facebook.com/username"
          >
        </div>
      </div>
      
      <!-- Display Options -->
      <details class="advanced-section">
        <summary>Display Options</summary>
        
        <div class="field-group">
          <label for="layout">Layout</label>
          <select 
            id="layout"
            v-model="localData.layout" 
            @change="updateComponent"
          >
            <option value="centered">Centered</option>
            <option value="two-column">Two Column</option>
            <option value="sidebar">Sidebar</option>
          </select>
        </div>
        
        <div class="field-group">
          <label>
            <input 
              type="checkbox"
              v-model="localData.showContactForm" 
              @change="updateComponent"
            >
            Include Contact Form
          </label>
        </div>
        
        <div class="field-group">
          <label>
            <input 
              type="checkbox"
              v-model="localData.showMap" 
              @change="updateComponent"
            >
            Show Map
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
  title: 'Get in Touch',
  description: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  linkedin: '',
  twitter: '',
  instagram: '',
  facebook: '',
  layout: 'centered',
  showContactForm: false,
  showMap: false
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    localData.value = {
      title: component.data.title || 'Get in Touch',
      description: component.data.description || '',
      email: component.data.email || '',
      phone: component.data.phone || '',
      website: component.data.website || '',
      address: component.data.address || '',
      linkedin: component.data.linkedin || '',
      twitter: component.data.twitter || '',
      instagram: component.data.instagram || '',
      facebook: component.data.facebook || '',
      layout: component.data.layout || 'centered',
      showContactForm: component.data.showContactForm || false,
      showMap: component.data.showMap || false
    };
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

// Update component
let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) clearTimeout(updateTimeout);
  
  updateTimeout = setTimeout(() => {
    store.updateComponent(props.componentId, {
      data: { ...localData.value }
    });
    store.hasUnsavedChanges = true;
  }, 300);
};

const closeEditor = () => {
  store.closeEditPanel();
};
</script>

<style scoped>
.contact-editor {
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

.field-group > label {
  display: block;
  margin-bottom: 12px;
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

.contact-field,
.social-field {
  margin-bottom: 12px;
}

.sub-label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
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
  user-select: none;
}
</style>
