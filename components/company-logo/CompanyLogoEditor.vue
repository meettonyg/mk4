<template>
  <ComponentEditorTemplate
    :component-id="componentId"
    component-type="Company Logo"
    :show-typography="false"
    :active-tab="activeTab"
    @update:active-tab="activeTab = $event"
    @back="handleBack"
  >
    <template #content>
      <div class="content-fields">
        <section class="editor-section">
          <h4>Logo Source</h4>
          
          <!-- Pods Data Toggle -->
          <div v-if="hasPodsLogo" class="pods-data-toggle">
            <label class="toggle-label">
              <input 
                type="checkbox" 
                v-model="localData.usePodsData" 
                @change="updateComponent"
              />
              <span>Use company logo from Pods</span>
            </label>
          </div>

          <!-- Pods Logo Display -->
          <div v-if="localData.usePodsData && podsLogo" class="pods-logo-display">
            <div class="field-group">
              <label>Logo from Pods</label>
              <div class="pods-logo-preview">
                <img :src="podsLogo.url" :alt="podsLogo.alt || 'Company Logo'" />
                <div class="logo-info">
                  <p class="field-hint">Loaded from your guest profile</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Custom Logo Section -->
          <div v-if="!localData.usePodsData || !hasPodsLogo">
            <div class="field-group">
              <label for="logo-url">Logo URL *</label>
              <input
                id="logo-url" 
                v-model="localData.logo.url" 
                @input="updateComponent"
                type="url" 
                placeholder="https://example.com/company-logo.png" 
              />
              <p class="field-hint">Enter the URL of your company logo</p>
            </div>

            <!-- Logo Preview -->
            <div v-if="localData.logo.url" class="custom-logo-preview">
              <label>Preview</label>
              <img :src="localData.logo.url" :alt="localData.logo.alt || 'Company Logo'" />
            </div>
          </div>
        </section>

        <section class="editor-section">
          <h4>Display Options</h4>
          
          <div class="field-group">
            <label for="logo-size">Size</label>
            <select 
              id="logo-size"
              v-model="localData.size" 
              @change="updateComponent"
            >
              <option value="small">Small (150px)</option>
              <option value="medium">Medium (250px)</option>
              <option value="large">Large (350px)</option>
            </select>
          </div>

          <div class="field-group">
            <label for="logo-alignment">Alignment</label>
            <select 
              id="logo-alignment"
              v-model="localData.alignment" 
              @change="updateComponent"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </section>
      </div>
    </template>
  </ComponentEditorTemplate>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import { usePodsData } from '../../src/composables/usePodsData';
import ComponentEditorTemplate from '../../src/vue/components/sidebar/editors/ComponentEditorTemplate.vue';

const props = defineProps({ 
  componentId: { 
    type: String, 
    required: true 
  } 
});

const emit = defineEmits(['close']);

const store = useMediaKitStore();
const { podsData } = usePodsData();

// Active tab state
const activeTab = ref('content');

const localData = ref({ 
  logo: { 
    url: '', 
    alt: 'Company Logo' 
  },
  usePodsData: true,
  size: 'medium',
  alignment: 'center'
});

// Get logo from Pods (SINGLE field - simple!)
const podsLogo = computed(() => {
  const logo = podsData.value?.company_logo;
  if (!logo) return null;
  
  return {
    url: typeof logo === 'object' 
      ? (logo.guid || logo.url || logo.ID) 
      : logo,
    alt: typeof logo === 'object' 
      ? (logo.post_title || 'Company Logo') 
      : 'Company Logo'
  };
});

const hasPodsLogo = computed(() => !!podsLogo.value);

// Determine effective logo (Pods or custom)
const effectiveLogo = computed(() => {
  if (localData.value.usePodsData && hasPodsLogo.value) {
    return podsLogo.value;
  }
  return localData.value.logo;
});

// Load component data
const loadComponentData = () => {
  const component = store.components[props.componentId];
  if (component?.data) {
    localData.value = {
      logo: component.data.logo || { url: '', alt: 'Company Logo' },
      usePodsData: component.data.usePodsData !== false,
      size: component.data.size || 'medium',
      alignment: component.data.alignment || 'center'
    };
  }
  
  // If no custom logo and Pods has data, use Pods
  if ((!localData.value.logo.url || localData.value.logo.url === '') && hasPodsLogo.value) {
    localData.value.usePodsData = true;
  }
};

watch(() => props.componentId, loadComponentData, { immediate: true });

watch(podsLogo, () => {
  // If using Pods data and Pods value changes, trigger update
  if (localData.value.usePodsData) {
    updateComponent();
  }
}, { deep: true });

// Update component with debouncing
let updateTimeout = null;
const updateComponent = () => {
  if (updateTimeout) clearTimeout(updateTimeout);
  
  updateTimeout = setTimeout(() => {
    const dataToSave = {
      logo: effectiveLogo.value,
      usePodsData: localData.value.usePodsData,
      size: localData.value.size,
      alignment: localData.value.alignment
    };
    
    store.updateComponent(props.componentId, { data: dataToSave });
    store.isDirty = true;
  }, 300);
};

const handleBack = () => emit('close');
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
.field-group select {
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
body.dark-mode .field-group select {
  background: #0f172a;
  border-color: #334155;
  color: #f3f4f6;
}

.field-group input:focus,
.field-group select:focus {
  outline: none;
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.field-hint {
  margin: 6px 0 0 0;
  font-size: 12px;
  color: #64748b;
  font-style: italic;
}

body.dark-mode .field-hint {
  color: #94a3b8;
}

/* Pods Data Toggle */
.pods-data-toggle {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

body.dark-mode .pods-data-toggle {
  background: #0c4a6e;
  border-color: #0369a1;
}

.toggle-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #0369a1;
  font-weight: 500;
}

body.dark-mode .toggle-label {
  color: #7dd3fc;
}

.toggle-label input[type="checkbox"] {
  margin-top: 2px;
  cursor: pointer;
  width: auto;
}

.toggle-label span {
  flex: 1;
}

/* Pods Logo Display */
.pods-logo-display {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

body.dark-mode .pods-logo-display {
  background: #0f172a;
  border-color: #334155;
}

.pods-logo-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

body.dark-mode .pods-logo-preview {
  background: #1e293b;
  border-color: #334155;
}

.pods-logo-preview img {
  max-width: 200px;
  max-height: 150px;
  object-fit: contain;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo-info {
  text-align: center;
  width: 100%;
}

/* Custom Logo Preview */
.custom-logo-preview {
  margin-top: 12px;
  text-align: center;
}

.custom-logo-preview img {
  max-width: 200px;
  max-height: 150px;
  object-fit: contain;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 8px;
}
</style>
