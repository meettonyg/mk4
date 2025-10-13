<template>
  <ComponentEditorTemplate
    :component-id="componentId"
    component-type="Logo Grid"
    :show-typography="true"
    :active-tab="activeTab"
    @update:active-tab="activeTab = $event"
    @back="handleBack"
  >
    <!-- Content Tab -->
    <template #content>
      <div class="content-fields">
        <section class="editor-section">
          <h4>Section Settings</h4>
          
          <div class="field-group">
            <label for="logo-title">Section Title</label>
            <input 
              id="logo-title"
              v-model="localData.title" 
              @input="updateComponent"
              type="text"
              placeholder="e.g., Featured In"
            />
          </div>
          
          <div class="field-group">
            <label for="logo-description">Description</label>
            <textarea 
              id="logo-description"
              v-model="localData.description" 
              @input="updateComponent"
              rows="2"
              placeholder="Optional description..."
            />
          </div>
        </section>

        <section class="editor-section">
          <h4>Logos</h4>
          <p class="help-text">Add up to 12 logos</p>
          
          <div class="logos-list">
            <div 
              v-for="(logo, index) in localData.logos" 
              :key="index"
              class="logo-item"
            >
              <div class="logo-header">
                <span class="logo-number">Logo {{ index + 1 }}</span>
                <button 
                  @click="removeLogo(index)"
                  class="remove-btn"
                  title="Remove logo"
                >×</button>
              </div>
              
              <div class="field-group">
                <label>Image URL *</label>
                <input 
                  v-model="logo.url" 
                  @input="updateComponent"
                  type="url"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              
              <div class="field-group">
                <label>Logo Name</label>
                <input 
                  v-model="logo.name" 
                  @input="updateComponent"
                  type="text"
                  placeholder="Company name"
                />
              </div>
              
              <div class="field-group">
                <label>Link URL (Optional)</label>
                <input 
                  v-model="logo.link" 
                  @input="updateComponent"
                  type="url"
                  placeholder="https://company.com"
                />
              </div>
            </div>
            
            <button 
              v-if="localData.logos.length < 12"
              @click="addLogo"
              class="add-btn"
            >
              + Add Logo
            </button>
          </div>
        </section>

        <section class="editor-section">
          <h4>Display Options</h4>
          
          <div class="field-group">
            <label for="columns">Grid Columns</label>
            <select 
              id="columns"
              v-model="localData.columns" 
              @change="updateComponent"
            >
              <option value="auto">Auto (Responsive)</option>
              <option value="3">3 Columns</option>
              <option value="4">4 Columns</option>
              <option value="6">6 Columns</option>
            </select>
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
  title: 'Featured In',
  description: '',
  logos: [],
  columns: 'auto'
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component && component.data) {
    localData.value = {
      title: component.data.title || 'Featured In',
      description: component.data.description || '',
      logos: Array.isArray(component.data.logos) 
        ? [...component.data.logos]
        : [],
      columns: component.data.columns || 'auto'
    };
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

// Add logo
const addLogo = () => {
  localData.value.logos.push({
    url: '',
    name: '',
    link: ''
  });
  updateComponent();
};

// Remove logo
const removeLogo = (index) => {
  localData.value.logos.splice(index, 1);
  updateComponent();
};

// Update component with debouncing
let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) clearTimeout(updateTimeout);
  
  updateTimeout = setTimeout(() => {
    store.updateComponent(props.componentId, {
      data: {
        title: localData.value.title,
        description: localData.value.description,
        logos: localData.value.logos.filter(l => l.url.trim()),
        columns: localData.value.columns
      }
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

.help-text {
  margin: -8px 0 16px 0;
  font-size: 12px;
  color: #64748b;
}

body.dark-mode .help-text {
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

.logos-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.logo-item {
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

body.dark-mode .logo-item {
  background: #0f172a;
  border-color: #334155;
}

.logo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.logo-number {
  font-weight: 600;
  color: #3b82f6;
  font-size: 14px;
}

body.dark-mode .logo-number {
  color: #60a5fa;
}

.remove-btn {
  width: 24px;
  height: 24px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #ef4444;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #fee2e2;
  border-color: #f87171;
}

body.dark-mode .remove-btn {
  background: #450a0a;
  border-color: #7f1d1d;
  color: #fca5a5;
}

.add-btn {
  padding: 12px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0284c7;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  width: 100%;
}

.add-btn:hover {
  background: #e0f2fe;
}

body.dark-mode .add-btn {
  background: #0c4a6e;
  border-color: #0369a1;
  color: #7dd3fc;
}
</style>
