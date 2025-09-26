<template>
  <div class="gmkb-section-controls-panel">
    <div class="controls-header">
      <h3>Section Settings</h3>
      <button @click="close" class="close-btn">×</button>
    </div>

    <div class="controls-body" v-if="section">
      <!-- Section Type -->
      <div class="control-group">
        <label>Layout Type</label>
        <div class="layout-selector">
          <button
            v-for="layout in layoutOptions"
            :key="layout.value"
            @click="updateLayout(layout.value)"
            :class="{ active: section.type === layout.value }"
            class="layout-option"
          >
            <div class="layout-icon" v-html="layout.icon"></div>
            <span class="layout-label">{{ layout.label }}</span>
          </button>
        </div>
      </div>

      <!-- Section Background -->
      <div class="control-group">
        <label>Background Color</label>
        <div class="color-picker">
          <input
            type="color"
            v-model="backgroundColor"
            @input="updateBackground"
          />
          <input
            type="text"
            v-model="backgroundColor"
            @input="updateBackground"
            placeholder="#ffffff"
          />
        </div>
      </div>

      <!-- Section Padding -->
      <div class="control-group">
        <label>Padding</label>
        <div class="padding-controls">
          <input
            type="range"
            min="0"
            max="100"
            v-model="padding"
            @input="updatePadding"
          />
          <span>{{ padding }}px</span>
        </div>
      </div>

      <!-- Column Gap (for multi-column layouts) -->
      <div class="control-group" v-if="section.type !== 'full_width'">
        <label>Column Gap</label>
        <div class="gap-controls">
          <input
            type="range"
            min="0"
            max="60"
            v-model="columnGap"
            @input="updateColumnGap"
          />
          <span>{{ columnGap }}px</span>
        </div>
      </div>

      <!-- Advanced Settings -->
      <div class="control-group">
        <label>CSS Classes</label>
        <input
          type="text"
          v-model="cssClasses"
          @input="updateCssClasses"
          placeholder="custom-class another-class"
        />
      </div>

      <!-- Section ID -->
      <div class="control-group">
        <label>Section ID</label>
        <input
          type="text"
          v-model="sectionId"
          @input="updateSectionId"
          placeholder="section-id"
        />
      </div>
    </div>

    <div class="controls-footer">
      <button @click="deleteSection" class="delete-btn">Delete Section</button>
      <button @click="close" class="done-btn">Done</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useMediaKitStore } from '../../../stores/mediaKit';

const props = defineProps({
  sectionId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close']);

const store = useMediaKitStore();

// Layout options
const layoutOptions = [
  { 
    value: 'full_width', 
    label: 'Full Width', 
    icon: '<svg viewBox="0 0 24 24" width="24" height="24"><rect x="3" y="8" width="18" height="8" fill="currentColor"/></svg>' 
  },
  { 
    value: 'two_column', 
    label: '2 Columns', 
    icon: '<svg viewBox="0 0 24 24" width="24" height="24"><rect x="3" y="8" width="8" height="8" fill="currentColor"/><rect x="13" y="8" width="8" height="8" fill="currentColor"/></svg>' 
  },
  { 
    value: 'three_column', 
    label: '3 Columns', 
    icon: '<svg viewBox="0 0 24 24" width="24" height="24"><rect x="2" y="8" width="5" height="8" fill="currentColor"/><rect x="9" y="8" width="6" height="8" fill="currentColor"/><rect x="17" y="8" width="5" height="8" fill="currentColor"/></svg>' 
  },
  { 
    value: 'main_sidebar', 
    label: 'Main + Sidebar', 
    icon: '<svg viewBox="0 0 24 24" width="24" height="24"><rect x="3" y="8" width="12" height="8" fill="currentColor"/><rect x="17" y="8" width="4" height="8" fill="currentColor"/></svg>' 
  }
];

// Get the section
const section = computed(() => {
  return store.sections.find(s => s.section_id === props.sectionId);
});

// Section settings
const backgroundColor = ref(section.value?.settings?.backgroundColor || '#ffffff');
const padding = ref(section.value?.settings?.padding || 20);
const columnGap = ref(section.value?.settings?.columnGap || 20);
const cssClasses = ref(section.value?.settings?.cssClasses || '');
const sectionId = ref(section.value?.settings?.customId || '');

// Update functions
const updateLayout = (newType) => {
  if (section.value) {
    store.updateSection(props.sectionId, { type: newType });
  }
};

const updateBackground = () => {
  store.updateSectionSettings(props.sectionId, { backgroundColor: backgroundColor.value });
};

const updatePadding = () => {
  store.updateSectionSettings(props.sectionId, { padding: padding.value });
};

const updateColumnGap = () => {
  store.updateSectionSettings(props.sectionId, { columnGap: columnGap.value });
};

const updateCssClasses = () => {
  store.updateSectionSettings(props.sectionId, { cssClasses: cssClasses.value });
};

const updateSectionId = () => {
  store.updateSectionSettings(props.sectionId, { customId: sectionId.value });
};

const deleteSection = () => {
  if (confirm('Are you sure you want to delete this section and all its components?')) {
    store.removeSection(props.sectionId);
    close();
  }
};

const close = () => {
  emit('close');
};

// Watch for section changes
watch(section, (newSection) => {
  if (newSection) {
    backgroundColor.value = newSection.settings?.backgroundColor || '#ffffff';
    padding.value = newSection.settings?.padding || 20;
    columnGap.value = newSection.settings?.columnGap || 20;
    cssClasses.value = newSection.settings?.cssClasses || '';
    sectionId.value = newSection.settings?.customId || '';
  }
});
</script>

<style scoped>
.gmkb-section-controls-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  max-width: 90vw;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

.controls-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.controls-header h3 {
  margin: 0;
  color: #e2e8f0;
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #e2e8f0;
}

.controls-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.control-group {
  margin-bottom: 20px;
}

.control-group label {
  display: block;
  margin-bottom: 8px;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 500;
}

/* Layout Selector */
.layout-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.layout-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.layout-option:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.layout-option.active {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
}

.layout-icon {
  margin-bottom: 4px;
  color: #e2e8f0;
}

.layout-label {
  font-size: 11px;
  color: #94a3b8;
}

/* Color Picker */
.color-picker {
  display: flex;
  gap: 8px;
}

.color-picker input[type="color"] {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  cursor: pointer;
}

.color-picker input[type="text"] {
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #e2e8f0;
}

/* Range Controls */
.padding-controls,
.gap-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.padding-controls input[type="range"],
.gap-controls input[type="range"] {
  flex: 1;
}

.padding-controls span,
.gap-controls span {
  color: #e2e8f0;
  font-size: 13px;
  min-width: 40px;
}

/* Text Inputs */
input[type="text"] {
  width: 100%;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #e2e8f0;
}

/* Footer */
.controls-footer {
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.delete-btn {
  padding: 8px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.done-btn {
  padding: 8px 24px;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #3b82f6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.done-btn:hover {
  background: rgba(59, 130, 246, 0.3);
}

/* Range input styling */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
}
</style>