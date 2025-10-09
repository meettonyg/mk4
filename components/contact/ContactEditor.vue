<template>
  <div class="contact-editor">
    <div class="editor-header">
      <h3>Contact Component</h3>
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
          <h4>Section Content</h4>
          
          <div class="field-group">
            <label for="contact-title">Section Title</label>
            <input 
              id="contact-title"
              v-model="localData.title" 
              @input="updateComponent"
              placeholder="e.g., Get in Touch"
            >
          </div>
          
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
        </section>

        <section class="editor-section">
          <h4>Contact Information</h4>
          
          <div class="field-group">
            <label for="contact-email">Email</label>
            <input 
              id="contact-email"
              v-model="localData.email" 
              @input="updateComponent"
              type="email"
              placeholder="contact@example.com"
            >
          </div>
          
          <div class="field-group">
            <label for="contact-phone">Phone</label>
            <input 
              id="contact-phone"
              v-model="localData.phone" 
              @input="updateComponent"
              type="tel"
              placeholder="+1 (555) 123-4567"
            >
          </div>
          
          <div class="field-group">
            <label for="contact-website">Website</label>
            <input 
              id="contact-website"
              v-model="localData.website" 
              @input="updateComponent"
              type="url"
              placeholder="https://example.com"
            >
          </div>
          
          <div class="field-group">
            <label for="contact-address">Address</label>
            <textarea 
              id="contact-address"
              v-model="localData.address" 
              @input="updateComponent"
              rows="2"
              placeholder="123 Main St, City, State 12345"
            />
          </div>
        </section>

        <section class="editor-section">
          <h4>Social Media Links</h4>
          
          <div class="field-group">
            <label for="contact-linkedin">LinkedIn</label>
            <input 
              id="contact-linkedin"
              v-model="localData.linkedin" 
              @input="updateComponent"
              placeholder="https://linkedin.com/in/username"
            >
          </div>
          
          <div class="field-group">
            <label for="contact-twitter">Twitter/X</label>
            <input 
              id="contact-twitter"
              v-model="localData.twitter" 
              @input="updateComponent"
              placeholder="https://twitter.com/username"
            >
          </div>
          
          <div class="field-group">
            <label for="contact-instagram">Instagram</label>
            <input 
              id="contact-instagram"
              v-model="localData.instagram" 
              @input="updateComponent"
              placeholder="https://instagram.com/username"
            >
          </div>
          
          <div class="field-group">
            <label for="contact-facebook">Facebook</label>
            <input 
              id="contact-facebook"
              v-model="localData.facebook" 
              @input="updateComponent"
              placeholder="https://facebook.com/username"
            >
          </div>
        </section>

        <section class="editor-section">
          <h4>Display Options</h4>
          
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
        </section>
      </div>
      
      <!-- STYLE TAB -->
      <div v-show="activeTab === 'style'" class="tab-panel">
        <BaseStylePanel
          :component-id="componentId"
          :component-type="'contact'"
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
    store.isDirty = true;
  }, 300);
};

const closeEditor = () => {
  store.closeEditPanel();
};
</script>

<style scoped>
.contact-editor {
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
.field-group input[type="email"],
.field-group input[type="tel"],
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
