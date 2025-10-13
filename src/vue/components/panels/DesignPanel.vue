<template>
  <Teleport to="body">
    <Transition name="panel-slide">
      <div v-if="isOpen" class="design-panel-container" @click.self="closePanel">
        <div class="design-panel" :class="{ 'design-panel--loading': isLoading }">
          <!-- Header -->
          <div class="design-panel__header">
            <div class="header-content">
              <h3>Edit {{ componentTypeLabel }}</h3>
              <span v-if="componentId" class="component-id">{{ componentId }}</span>
            </div>
            <button @click="closePanel" class="close-btn" aria-label="Close panel">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="design-panel__body">
            <div v-if="isLoading" class="loading-state">
              <div class="spinner"></div>
              <p>Loading editor...</p>
            </div>

            <!-- Component-specific editor (if available) -->
            <component 
              v-else-if="customEditor"
              :is="customEditor"
              :component-id="componentId"
              :component-data="componentData"
              @update="handleUpdate"
              @close="closePanel"
            />

            <!-- Generic property editor (fallback) -->
            <div v-else-if="component" class="property-editor">
              <!-- Basic Properties -->
              <div class="property-section">
                <h4>Properties</h4>
                
                <div v-for="(value, key) in editableProperties" :key="key" class="property-field">
                  <label :for="`prop-${key}`">
                    {{ formatPropertyName(key) }}
                  </label>
                  
                  <!-- Text/String -->
                  <input 
                    v-if="getFieldType(value) === 'text'"
                    :id="`prop-${key}`"
                    type="text"
                    v-model="localData[key]"
                    @input="handlePropertyChange(key, $event.target.value)"
                    :placeholder="getPlaceholder(key)"
                  />
                  
                  <!-- Number -->
                  <input 
                    v-else-if="getFieldType(value) === 'number'"
                    :id="`prop-${key}`"
                    type="number"
                    v-model.number="localData[key]"
                    @input="handlePropertyChange(key, $event.target.value)"
                  />
                  
                  <!-- Boolean -->
                  <div v-else-if="getFieldType(value) === 'boolean'" class="checkbox-wrapper">
                    <input 
                      :id="`prop-${key}`"
                      type="checkbox"
                      v-model="localData[key]"
                      @change="handlePropertyChange(key, $event.target.checked)"
                    />
                    <span class="checkbox-label">{{ value ? 'Yes' : 'No' }}</span>
                  </div>
                  
                  <!-- Color -->
                  <div v-else-if="getFieldType(value) === 'color'" class="color-input">
                    <input 
                      :id="`prop-${key}`"
                      type="color"
                      v-model="localData[key]"
                      @input="handlePropertyChange(key, $event.target.value)"
                    />
                    <input 
                      type="text"
                      v-model="localData[key]"
                      @input="handlePropertyChange(key, $event.target.value)"
                      placeholder="#000000"
                    />
                  </div>
                  
                  <!-- URL -->
                  <input 
                    v-else-if="getFieldType(value) === 'url'"
                    :id="`prop-${key}`"
                    type="url"
                    v-model="localData[key]"
                    @input="handlePropertyChange(key, $event.target.value)"
                    placeholder="https://"
                  />
                  
                  <!-- Textarea for longer text -->
                  <textarea 
                    v-else-if="getFieldType(value) === 'textarea'"
                    :id="`prop-${key}`"
                    v-model="localData[key]"
                    @input="handlePropertyChange(key, $event.target.value)"
                    rows="4"
                    :placeholder="getPlaceholder(key)"
                  />
                  
                  <!-- Array/List -->
                  <div v-else-if="Array.isArray(value)" class="array-editor">
                    <div v-for="(item, index) in localData[key]" :key="`${key}-${index}`" class="array-item">
                      <input 
                        type="text"
                        v-model="localData[key][index]"
                        @input="handleArrayItemChange(key, index, $event.target.value)"
                      />
                      <button @click="removeArrayItem(key, index)" class="remove-btn">−</button>
                    </div>
                    <button @click="addArrayItem(key)" class="add-item-btn">+ Add Item</button>
                  </div>
                  
                  <!-- Object/JSON -->
                  <textarea 
                    v-else-if="typeof value === 'object'"
                    :id="`prop-${key}`"
                    :value="JSON.stringify(value, null, 2)"
                    @input="handleJsonChange(key, $event.target.value)"
                    rows="6"
                    class="json-editor"
                  />
                </div>
              </div>

              <!-- Advanced Settings -->
              <details class="property-section advanced">
                <summary>Advanced Settings</summary>
                
                <!-- Component ID (read-only) -->
                <div class="property-field">
                  <label>Component ID</label>
                  <input type="text" :value="componentId" disabled />
                </div>
                
                <!-- Component Type (read-only) -->
                <div class="property-field">
                  <label>Component Type</label>
                  <input type="text" :value="component.type" disabled />
                </div>
                
                <!-- Raw JSON Editor -->
                <div class="property-field">
                  <label for="raw-data">Raw Data (JSON)</label>
                  <textarea 
                    id="raw-data"
                    :value="JSON.stringify(localData, null, 2)"
                    @input="handleRawDataChange($event.target.value)"
                    rows="10"
                    class="json-editor"
                  />
                </div>
              </details>

              <!-- Styling Options -->
              <div class="property-section" v-if="hasStyleOptions">
                <h4>Styling</h4>
                
                <div class="property-field">
                  <label for="custom-class">Custom CSS Class</label>
                  <input 
                    id="custom-class"
                    type="text"
                    v-model="localSettings.customClass"
                    @input="handleSettingChange('customClass', $event.target.value)"
                    placeholder="my-custom-class"
                  />
                </div>
                
                <div class="property-field">
                  <label for="margin">Margin</label>
                  <select 
                    id="margin"
                    v-model="localSettings.margin"
                    @change="handleSettingChange('margin', $event.target.value)"
                  >
                    <option value="">Default</option>
                    <option value="none">None</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                
                <div class="property-field">
                  <label for="padding">Padding</label>
                  <select 
                    id="padding"
                    v-model="localSettings.padding"
                    @change="handleSettingChange('padding', $event.target.value)"
                  >
                    <option value="">Default</option>
                    <option value="none">None</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-else class="empty-state">
              <p>No component selected</p>
              <button @click="closePanel" class="btn btn-secondary">Close</button>
            </div>
          </div>

          <!-- Footer with actions -->
          <div class="design-panel__footer" v-if="component">
            <button @click="resetChanges" class="btn btn-secondary" :disabled="!hasChanges">
              Reset
            </button>
            <button @click="applyChanges" class="btn btn-primary" :disabled="!hasChanges">
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, markRaw, defineAsyncComponent, onMounted, onUnmounted } from 'vue';
import { useMediaKitStore } from '../../../stores/mediaKit';

const store = useMediaKitStore();

// Component state
const isLoading = ref(false);
const localData = ref({});
const localSettings = ref({});
const originalData = ref({});
const originalSettings = ref({});
const customEditor = ref(null);

// Computed properties
const isOpen = computed(() => store.designPanelOpen || !!store.editingComponentId);
const componentId = computed(() => store.editingComponentId);
const component = computed(() => {
  if (!componentId.value) return null;
  return store.components[componentId.value];
});

const componentData = computed(() => {
  if (!component.value) return {};
  return component.value.data || component.value.props || {};
});

const componentTypeLabel = computed(() => {
  if (!component.value) return 'Component';
  const type = component.value.type || 'component';
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/[-_]/g, ' ');
});

const editableProperties = computed(() => {
  const data = { ...localData.value };
  // Remove internal properties
  delete data._id;
  delete data._type;
  delete data._internal;
  return data;
});

const hasChanges = computed(() => {
  const dataChanged = JSON.stringify(localData.value) !== JSON.stringify(originalData.value);
  const settingsChanged = JSON.stringify(localSettings.value) !== JSON.stringify(originalSettings.value);
  return dataChanged || settingsChanged;
});

const hasStyleOptions = computed(() => {
  // Show style options for all components
  return true;
});

// Load component editor if available
const loadCustomEditor = async () => {
  if (!component.value) {
    customEditor.value = null;
    return;
  }

  const type = component.value.type;
  
  // Map of component types to their custom editors
  const editorMap = {
    'hero': () => import('../../../../components/hero/HeroEditor.vue').catch(() => null),
    'biography': () => import('../../../../components/biography/BiographyEditor.vue').catch(() => null),
    'topics': () => import('../../../../components/topics/TopicsEditor.vue').catch(() => null),
    'contact': () => import('../../../../components/contact/ContactEditor.vue').catch(() => null),
    'questions': () => import('../../../../components/questions/QuestionsEditor.vue').catch(() => null),
    'social': () => import('../../../../components/social/SocialEditor.vue').catch(() => null),
    'testimonials': () => import('../../../../components/testimonials/TestimonialsEditor.vue').catch(() => null),
    'call-to-action': () => import('../../../../components/call-to-action/CallToActionEditor.vue').catch(() => null),
    'stats': () => import('../../../../components/stats/StatsEditor.vue').catch(() => null),
    'video-intro': () => import('../../../../components/video-intro/VideoIntroEditor.vue').catch(() => null),
    'photo-gallery': () => import('../../../../components/photo-gallery/PhotoGalleryEditor.vue').catch(() => null),
    'podcast-player': () => import('../../../../components/podcast-player/PodcastPlayerEditor.vue').catch(() => null),
    'booking-calendar': () => import('../../../../components/booking-calendar/BookingCalendarEditor.vue').catch(() => null),
    'guest-intro': () => import('../../../../components/guest-intro/GuestIntroEditor.vue').catch(() => null),
    'logo-grid': () => import('../../../../components/logo-grid/LogoGridEditor.vue').catch(() => null),
    'topics-questions': () => import('../../../../components/topics-questions/TopicsQuestionsEditor.vue').catch(() => null),
  };

  if (editorMap[type]) {
    isLoading.value = true;
    try {
      const module = await editorMap[type]();
      if (module) {
        customEditor.value = markRaw(defineAsyncComponent(() => Promise.resolve(module)));
      } else {
        customEditor.value = null;
      }
    } catch (error) {
      console.log(`No custom editor for ${type}, using generic editor`);
      customEditor.value = null;
    } finally {
      isLoading.value = false;
    }
  } else {
    customEditor.value = null;
  }
};

// Load component data when component changes
const loadComponentData = () => {
  if (!component.value) {
    localData.value = {};
    localSettings.value = {};
    return;
  }

  // Deep clone the data
  const data = component.value.data || component.value.props || {};
  localData.value = JSON.parse(JSON.stringify(data));
  originalData.value = JSON.parse(JSON.stringify(data));

  // Load settings
  const settings = component.value.settings || {};
  localSettings.value = JSON.parse(JSON.stringify(settings));
  originalSettings.value = JSON.parse(JSON.stringify(settings));

  // Load custom editor
  loadCustomEditor();
};

// Watch for component changes
watch(componentId, () => {
  if (componentId.value) {
    loadComponentData();
  }
}, { immediate: true });

// Field type detection
const getFieldType = (value) => {
  if (typeof value === 'string') {
    // Check for specific patterns
    if (value.match(/^#[0-9A-Fa-f]{6}$/)) return 'color';
    if (value.match(/^https?:\/\//)) return 'url';
    if (value.length > 100) return 'textarea';
    return 'text';
  }
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  return 'text';
};

// Format property names for display
const formatPropertyName = (key) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, ' ')
    .replace(/^(.)/, str => str.toUpperCase())
    .trim();
};

// Get placeholder text
const getPlaceholder = (key) => {
  const placeholders = {
    title: 'Enter title...',
    subtitle: 'Enter subtitle...',
    description: 'Enter description...',
    content: 'Enter content...',
    text: 'Enter text...',
    label: 'Enter label...',
    url: 'https://example.com',
    link: 'https://example.com',
    image: '/path/to/image.jpg',
    email: 'email@example.com',
    phone: '+1 (555) 123-4567'
  };
  
  return placeholders[key.toLowerCase()] || `Enter ${formatPropertyName(key).toLowerCase()}...`;
};

// Handle property changes with debouncing
let updateTimeout = null;
const handlePropertyChange = (key, value) => {
  localData.value[key] = value;
  
  // Clear existing timeout
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
  
  // Debounce updates
  updateTimeout = setTimeout(() => {
    applyChanges();
  }, 500);
};

// Handle array item changes
const handleArrayItemChange = (key, index, value) => {
  if (!Array.isArray(localData.value[key])) {
    localData.value[key] = [];
  }
  localData.value[key][index] = value;
  
  // Debounced update
  if (updateTimeout) clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    applyChanges();
  }, 500);
};

// Add array item
const addArrayItem = (key) => {
  if (!Array.isArray(localData.value[key])) {
    localData.value[key] = [];
  }
  localData.value[key].push('');
  applyChanges();
};

// Remove array item
const removeArrayItem = (key, index) => {
  if (Array.isArray(localData.value[key])) {
    localData.value[key].splice(index, 1);
    applyChanges();
  }
};

// Handle JSON field changes
const handleJsonChange = (key, value) => {
  try {
    const parsed = JSON.parse(value);
    localData.value[key] = parsed;
    applyChanges();
  } catch (error) {
    console.warn('Invalid JSON for field:', key);
  }
};

// Handle raw data changes
const handleRawDataChange = (value) => {
  try {
    const parsed = JSON.parse(value);
    localData.value = parsed;
    applyChanges();
  } catch (error) {
    console.warn('Invalid JSON in raw data editor');
  }
};

// Handle setting changes
const handleSettingChange = (key, value) => {
  localSettings.value[key] = value;
  applyChanges();
};

// Handle updates from custom editors
const handleUpdate = (updates) => {
  if (updates.data) {
    localData.value = { ...localData.value, ...updates.data };
  }
  if (updates.settings) {
    localSettings.value = { ...localSettings.value, ...updates.settings };
  }
  applyChanges();
};

// Apply changes to store
const applyChanges = () => {
  if (!componentId.value) return;
  
  store.updateComponent(componentId.value, {
    data: { ...localData.value },
    settings: { ...localSettings.value }
  });
  
  // Update originals to track new changes
  originalData.value = JSON.parse(JSON.stringify(localData.value));
  originalSettings.value = JSON.parse(JSON.stringify(localSettings.value));
};

// Reset changes
const resetChanges = () => {
  localData.value = JSON.parse(JSON.stringify(originalData.value));
  localSettings.value = JSON.parse(JSON.stringify(originalSettings.value));
  
  // Apply reset to store
  if (componentId.value) {
    store.updateComponent(componentId.value, {
      data: { ...originalData.value },
      settings: { ...originalSettings.value }
    });
  }
};

// Close panel
const closePanel = () => {
  store.closeDesignPanel();
  store.closeEditPanel(); // Also close edit panel for compatibility
  
  // Clear local state
  localData.value = {};
  localSettings.value = {};
  originalData.value = {};
  originalSettings.value = {};
  customEditor.value = null;
};

// ROOT FIX: Store handler reference for proper cleanup
let keyboardHandler = null;

// Keyboard shortcuts handler
keyboardHandler = (e) => {
  if (e.key === 'Escape' && isOpen.value) {
    closePanel();
  }
  if (e.ctrlKey && e.key === 's' && isOpen.value) {
    e.preventDefault();
    applyChanges();
  }
};

// ROOT FIX: Add keyboard listener in lifecycle hook
onMounted(() => {
  window.addEventListener('keydown', keyboardHandler);
  console.log('✅ DesignPanel: Keyboard shortcuts registered');
});

// ROOT FIX: Proper cleanup in onUnmounted
onUnmounted(() => {
  if (keyboardHandler) {
    window.removeEventListener('keydown', keyboardHandler);
    console.log('✅ DesignPanel: Keyboard shortcuts cleaned up');
  }
  
  // Clear any pending update timeout
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
});
</script>

<style scoped>
/* Container and overlay */
.design-panel-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 10000;
  display: flex;
  justify-content: flex-end;
}

/* Main panel */
.design-panel {
  width: 420px;
  height: 100%;
  background: white;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.design-panel--loading {
  pointer-events: none;
}

/* Header */
.design-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(to bottom, #ffffff, #f9fafb);
}

.header-content h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.component-id {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
  font-family: monospace;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

/* Body */
.design-panel__body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f9fafb;
}

/* Property sections */
.property-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
}

.property-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Property fields */
.property-field {
  margin-bottom: 16px;
}

.property-field:last-child {
  margin-bottom: 0;
}

.property-field label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.property-field input[type="text"],
.property-field input[type="number"],
.property-field input[type="url"],
.property-field input[type="color"],
.property-field select,
.property-field textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  transition: all 0.2s;
}

.property-field input:focus,
.property-field select:focus,
.property-field textarea:focus {
  outline: none;
  border-color: var(--gmkb-color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.property-field input:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}

/* Checkbox styling */
.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-wrapper input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label {
  font-size: 14px;
  color: #475569;
}

/* Color input */
.color-input {
  display: flex;
  gap: 8px;
}

.color-input input[type="color"] {
  width: 48px;
  height: 38px;
  padding: 4px;
  cursor: pointer;
}

.color-input input[type="text"] {
  flex: 1;
}

/* Array editor */
.array-editor {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px;
  background: #f8fafc;
}

.array-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.array-item input {
  flex: 1;
}

.remove-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ef4444;
  background: white;
  color: #ef4444;
  border-radius: 4px;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #ef4444;
  color: white;
}

.add-item-btn {
  width: 100%;
  padding: 6px;
  border: 1px dashed #cbd5e1;
  background: white;
  color: #64748b;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.add-item-btn:hover {
  border-color: var(--gmkb-color-primary, #3b82f6);
  color: var(--gmkb-color-primary, #3b82f6);
  background: #f0f9ff;
}

/* JSON editor */
.json-editor {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  background: #1e293b;
  color: #e2e8f0;
  padding: 12px;
  border: 1px solid #334155;
}

/* Advanced section */
.property-section.advanced {
  background: #f8fafc;
}

details.property-section summary {
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  user-select: none;
  padding: 4px 0;
}

details.property-section[open] summary {
  margin-bottom: 16px;
}

/* Loading state */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #94a3b8;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: var(--gmkb-color-primary, #3b82f6);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #94a3b8;
  text-align: center;
}

/* Footer */
.design-panel__footer {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  background: white;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

/* Buttons */
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--gmkb-color-primary, #3b82f6);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--gmkb-color-primary-hover, #2563eb);
}

.btn-secondary {
  background: white;
  color: #64748b;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

/* Transitions */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: opacity 0.3s ease;
}

.panel-slide-enter-active .design-panel,
.panel-slide-leave-active .design-panel {
  transition: transform 0.3s ease;
}

.panel-slide-enter-from {
  opacity: 0;
}

.panel-slide-enter-from .design-panel {
  transform: translateX(100%);
}

.panel-slide-leave-to {
  opacity: 0;
}

.panel-slide-leave-to .design-panel {
  transform: translateX(100%);
}

/* Responsive */
@media (max-width: 640px) {
  .design-panel {
    width: 100%;
  }
}

/* Scrollbar styling */
.design-panel__body::-webkit-scrollbar {
  width: 6px;
}

.design-panel__body::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.design-panel__body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.design-panel__body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
