<template>
  <ComponentEditorTemplate
    :component-id="componentId"
    component-type="Call to Action"
    :show-typography="true"
    :active-tab="activeTab"
    @update:active-tab="activeTab = $event"
    @back="handleBack"
  >
    <!-- Content Tab -->
    <template #content>
      <div class="content-fields">
        <section class="editor-section">
          <h4>Headlines</h4>
          
          <div class="field-group">
            <label for="cta-title">Title</label>
            <input 
              id="cta-title"
              v-model="localData.title" 
              @input="updateComponent"
              type="text"
              placeholder="e.g., Ready to Get Started?"
            />
          </div>
          
          <div class="field-group">
            <label for="cta-description">Description</label>
            <textarea 
              id="cta-description"
              v-model="localData.description" 
              @input="updateComponent"
              rows="3"
              placeholder="Supporting text for your call to action..."
            />
          </div>
        </section>

        <section class="editor-section">
          <h4>Buttons</h4>
          
          <div class="button-group">
            <label class="button-label">Primary Button</label>
            <div class="field-group">
              <input 
                v-model="localData.button_text" 
                @input="updateComponent"
                type="text"
                placeholder="Button text"
              />
            </div>
            <div class="field-group">
              <input 
                v-model="localData.button_url" 
                @input="updateComponent"
                type="url"
                placeholder="https://"
              />
            </div>
          </div>
          
          <div class="button-group">
            <label class="button-label">Secondary Button (Optional)</label>
            <div class="field-group">
              <input 
                v-model="localData.secondary_button_text" 
                @input="updateComponent"
                type="text"
                placeholder="Button text"
              />
            </div>
            <div class="field-group">
              <input 
                v-model="localData.secondary_button_url" 
                @input="updateComponent"
                type="url"
                placeholder="https://"
              />
            </div>
          </div>
        </section>

        <section class="editor-section">
          <h4>Background</h4>
          
          <div class="field-group">
            <label for="background-color">Background Color</label>
            <div class="color-input-wrapper">
              <input 
                id="background-color"
                v-model="localData.background_color" 
                @input="updateComponent"
                type="color"
                class="color-swatch"
              />
              <input 
                v-model="localData.background_color" 
                @input="updateComponent"
                type="text"
                class="color-text"
                placeholder="#3b82f6"
              />
            </div>
          </div>
          
          <div class="field-group">
            <label for="background-image">Background Image URL</label>
            <input 
              id="background-image"
              v-model="localData.background_image" 
              @input="updateComponent"
              type="url"
              placeholder="https://example.com/image.jpg"
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

const localData = ref({
  title: 'Ready to Take Action?',
  description: '',
  button_text: '',
  button_url: '',
  secondary_button_text: '',
  secondary_button_url: '',
  background_color: '#3b82f6',
  background_image: ''
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    localData.value = {
      title: component.data.title || 'Ready to Take Action?',
      description: component.data.description || '',
      button_text: component.data.button_text || '',
      button_url: component.data.button_url || '',
      secondary_button_text: component.data.secondary_button_text || '',
      secondary_button_url: component.data.secondary_button_url || '',
      background_color: component.data.background_color || '#3b82f6',
      background_image: component.data.background_image || ''
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
  margin-bottom: 12px;
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

.field-group input,
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
  font-family: inherit;
}

body.dark-mode .field-group input,
body.dark-mode .field-group select,
body.dark-mode .field-group textarea {
  background: #0f172a;
  border-color: #334155;
  color: #f3f4f6;
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
}

.button-group {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.button-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

body.dark-mode .button-group {
  border-color: #334155;
}

.button-label {
  display: block;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #3b82f6;
}

body.dark-mode .button-label {
  color: #60a5fa;
}

.color-input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-swatch {
  width: 48px;
  height: 40px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  padding: 2px;
}

body.dark-mode .color-swatch {
  border-color: #334155;
}

.color-text {
  flex: 1;
}
</style>
