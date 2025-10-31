<template>
  <ComponentEditorTemplate
    :component-id="componentId"
    component-type="Contact"
    :show-typography="true"
    :active-tab="activeTab"
    @update:active-tab="activeTab = $event"
    @close="handleClose"
  >
    <!-- Content Tab -->
    <template #content>
      <div class="content-fields">
        <section class="editor-section">
          <h4>Section Content</h4>
          
          <div class="field-group">
            <label for="contact-title">Section Title</label>
            <input 
              id="contact-title"
              v-model="localData.title" 
              @input="updateComponent"
              type="text"
              placeholder="e.g., Get in Touch"
            />
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
            />
          </div>
          
          <div class="field-group">
            <label for="contact-phone">Phone</label>
            <input 
              id="contact-phone"
              v-model="localData.phone" 
              @input="updateComponent"
              type="tel"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          
          <div class="field-group">
            <label for="contact-skype">Skype</label>
            <input 
              id="contact-skype"
              v-model="localData.skype" 
              @input="updateComponent"
              type="text"
              placeholder="skype_username"
            />
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


      </div>
    </template>
  </ComponentEditorTemplate>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import ComponentEditorTemplate from '../../src/vue/components/sidebar/editors/ComponentEditorTemplate.vue';

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
  title: 'Get in Touch',
  description: '',
  email: '',
  phone: '',
  skype: '',
  address: ''
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
      skype: component.data.skype || '',
      address: component.data.address || ''
    };
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

// Update component with debouncing
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
.field-group input[type="email"],
.field-group input[type="tel"],
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

body.dark-mode .field-group input,
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
  min-height: 80px;
}
</style>
