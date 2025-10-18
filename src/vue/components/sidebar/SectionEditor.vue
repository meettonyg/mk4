<template>
  <div class="sidebar-editor">
    <!-- Header with Back Button -->
    <div class="editor-header">
      <button @click="handleBack" class="back-btn" title="Back to sidebar">
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <h2 class="editor-title">Edit Section</h2>
      <div class="header-spacer"></div>
    </div>
    
    <!-- Editor Tabs -->
    <div class="editor-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="editor-tab"
        :class="{ active: activeTab === tab.id }"
      >
        <i :class="tab.icon"></i>
        <span>{{ tab.label }}</span>
      </button>
    </div>
    
    <!-- Tab Content -->
    <div class="editor-content">
      <!-- LAYOUT TAB -->
      <div v-show="activeTab === 'layout'" class="tab-content">
        <div class="setting-group">
          <label class="setting-label">Layout Type</label>
          <div class="layout-grid">
            <button
              v-for="layout in layouts"
              :key="layout.value"
              @click="updateLayout(layout.value)"
              class="layout-option"
              :class="{ active: currentLayout === layout.value }"
              :title="layout.label"
            >
              <div class="layout-preview">
                <div
                  v-for="(col, idx) in layout.columns"
                  :key="idx"
                  class="layout-col"
                  :style="{ width: col + '%' }"
                ></div>
              </div>
              <span class="layout-label">{{ layout.label }}</span>
            </button>
          </div>
        </div>
        
        <div class="setting-group">
          <label class="setting-label">Spacing</label>
          
          <div class="input-row">
            <label class="input-label">Padding</label>
            <select
              :value="settings.padding || 'medium'"
              @change="updateSetting('padding', $event.target.value)"
              class="select-input"
            >
              <option value="none">None</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="extra-large">Extra Large</option>
            </select>
          </div>
          
          <div class="input-row">
            <label class="input-label">Gap</label>
            <select
              :value="settings.gap || 'medium'"
              @change="updateSetting('gap', $event.target.value)"
              class="select-input"
            >
              <option value="none">None</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- STYLE TAB -->
      <div v-show="activeTab === 'style'" class="tab-content">
        <div class="setting-group">
          <label class="setting-label">Background</label>
          
          <div class="input-row">
            <label class="input-label">Color</label>
            <div class="color-input-wrapper">
              <input
                type="color"
                :value="settings.backgroundColor || '#ffffff'"
                @input="updateSetting('backgroundColor', $event.target.value)"
                class="color-input"
              />
              <input
                type="text"
                :value="settings.backgroundColor || '#ffffff'"
                @input="updateSetting('backgroundColor', $event.target.value)"
                class="text-input color-hex"
                placeholder="#ffffff"
              />
            </div>
          </div>
          
          <div class="input-row">
            <label class="input-label">Opacity</label>
            <div class="slider-wrapper">
              <input
                type="range"
                min="0"
                max="100"
                :value="(settings.backgroundOpacity || 1) * 100"
                @input="updateSetting('backgroundOpacity', $event.target.value / 100)"
                class="slider-input"
              />
              <span class="slider-value">{{ Math.round((settings.backgroundOpacity || 1) * 100) }}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- ADVANCED TAB -->
      <div v-show="activeTab === 'advanced'" class="tab-content">
        <div class="setting-group">
          <label class="setting-label">Container Options</label>
          
          <label class="checkbox-wrapper">
            <input
              type="checkbox"
              :checked="settings.fullWidth || false"
              @change="updateSetting('fullWidth', $event.target.checked)"
              class="checkbox-input"
            />
            <span class="checkbox-label">Full Width Container</span>
          </label>
          
          <label class="checkbox-wrapper">
            <input
              type="checkbox"
              :checked="settings.reverseOnMobile || false"
              @change="updateSetting('reverseOnMobile', $event.target.checked)"
              class="checkbox-input"
            />
            <span class="checkbox-label">Reverse Columns on Mobile</span>
          </label>
        </div>
        
        <div class="setting-group">
          <label class="setting-label">Custom CSS Class</label>
          <input
            type="text"
            :value="settings.customClass || ''"
            @input="updateSetting('customClass', $event.target.value)"
            placeholder="e.g., my-custom-section"
            class="text-input"
          />
          <p class="input-hint">Add a custom CSS class for advanced styling</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useMediaKitStore } from '../../../stores/mediaKit'
import { useUIStore } from '../../../stores/ui'

const store = useMediaKitStore()
const uiStore = useUIStore()

// DEBUG: Log when component mounts
onMounted(() => {
  console.log('✅ SectionEditor: Component mounted for section:', sectionId.value);
});

// Active tab
const activeTab = ref('layout')

// Tabs configuration
const tabs = [
  { id: 'layout', label: 'Layout', icon: 'fa-solid fa-table-cells' },
  { id: 'style', label: 'Style', icon: 'fa-solid fa-palette' },
  { id: 'advanced', label: 'Advanced', icon: 'fa-solid fa-gear' }
]

// Layout options
const layouts = [
  { 
    value: 'full_width', 
    label: 'Full Width',
    columns: [100]
  },
  { 
    value: 'two_column', 
    label: 'Two Columns',
    columns: [50, 50]
  },
  { 
    value: 'three_column', 
    label: 'Three Columns',
    columns: [33, 33, 34]
  }
]

// Get current section
const sectionId = computed(() => uiStore.editingSectionId)

const section = computed(() => {
  if (!sectionId.value) return null
  return store.sections.find(s => s.section_id === sectionId.value)
})

// Current layout
const currentLayout = computed(() => {
  if (!section.value) return 'full_width'
  return section.value.layout || section.value.type || 'full_width'
})

// Settings (reactive copy)
const settings = reactive({})

// Watch section changes and update settings
watch(section, (newSection) => {
  console.log('🔄 SectionEditor: Section changed:', newSection);
  if (newSection && newSection.settings) {
    Object.assign(settings, newSection.settings)
    console.log('✅ SectionEditor: Settings loaded for section:', sectionId.value)
  } else {
    console.warn('⚠️ SectionEditor: Section has no settings:', newSection);
  }
}, { immediate: true })

// Watch sectionId
watch(sectionId, (newId) => {
  console.log('🎯 SectionEditor: Editing section ID changed to:', newId);
}, { immediate: true });

// Update individual setting
function updateSetting(key, value) {
  settings[key] = value
  
  // ROOT FIX: Immediately update store for live preview
  if (sectionId.value) {
    const updatedSettings = { [key]: value }
    store.updateSectionSettings(sectionId.value, updatedSettings)
    console.log('✅ SectionEditor: Live update -', key, '=', value)
  }
}

// Update layout
function updateLayout(layout) {
  if (!sectionId.value) return
  
  store.updateSection(sectionId.value, {
    layout,
    type: layout // For backwards compatibility
  })
  
  console.log('✅ SectionEditor: Layout updated to:', layout)
}

// Handle back button
function handleBack() {
  uiStore.closeSidebarEditor()
}
</script>

<style scoped>
/* ROOT FIX: Elementor-style inline sidebar editor */
.sidebar-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  overflow: hidden;
}

body.dark-mode .sidebar-editor {
  background: #0f172a;
}

/* Header */
.editor-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

body.dark-mode .editor-header {
  border-bottom-color: #334155;
}

.back-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.back-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

body.dark-mode .back-btn {
  border-color: #334155;
  color: #d1d5db;
}

body.dark-mode .back-btn:hover {
  background: #1e293b;
}

.editor-title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

body.dark-mode .editor-title {
  color: #f3f4f6;
}

.header-spacer {
  width: 32px;
  flex-shrink: 0;
}

/* Tabs */
.editor-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  flex-shrink: 0;
}

body.dark-mode .editor-tabs {
  background: #1e293b;
  border-bottom-color: #334155;
}

.editor-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.editor-tab:hover {
  color: #111827;
  background: rgba(0, 0, 0, 0.02);
}

.editor-tab.active {
  color: #ec4899;
  border-bottom-color: #ec4899;
  background: white;
}

body.dark-mode .editor-tab {
  color: #9ca3af;
}

body.dark-mode .editor-tab:hover {
  color: #f3f4f6;
  background: rgba(255, 255, 255, 0.05);
}

body.dark-mode .editor-tab.active {
  background: #0f172a;
}

/* Content */
.editor-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Setting Groups */
.setting-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #374151;
  margin: 0;
}

body.dark-mode .setting-label {
  color: #d1d5db;
}

/* Layout Grid */
.layout-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.layout-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.layout-option:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.layout-option.active {
  border-color: #ec4899;
  background: #fdf2f8;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

body.dark-mode .layout-option {
  background: #1e293b;
  border-color: #334155;
}

body.dark-mode .layout-option:hover {
  background: #334155;
  border-color: #475569;
}

body.dark-mode .layout-option.active {
  background: rgba(236, 72, 153, 0.1);
  border-color: #ec4899;
}

.layout-preview {
  width: 100%;
  height: 32px;
  display: flex;
  gap: 2px;
  padding: 4px;
  background: #f3f4f6;
  border-radius: 4px;
}

body.dark-mode .layout-preview {
  background: #334155;
}

.layout-col {
  background: #9ca3af;
  border-radius: 2px;
}

body.dark-mode .layout-col {
  background: #6b7280;
}

.layout-label {
  font-size: 11px;
  font-weight: 500;
  color: #374151;
  text-align: center;
}

body.dark-mode .layout-label {
  color: #d1d5db;
}

/* Input Rows */
.input-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

body.dark-mode .input-label {
  color: #d1d5db;
}

/* Inputs */
.select-input,
.text-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #374151;
  transition: all 0.2s;
}

.select-input:focus,
.text-input:focus {
  outline: none;
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

body.dark-mode .select-input,
body.dark-mode .text-input {
  background: #1e293b;
  border-color: #334155;
  color: #f3f4f6;
}

.input-hint {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

body.dark-mode .input-hint {
  color: #9ca3af;
}

/* Color Input */
.color-input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-input {
  width: 48px;
  height: 40px;
  padding: 2px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  background: white;
  transition: all 0.2s;
}

.color-input:hover {
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

body.dark-mode .color-input {
  background: #1e293b;
  border-color: #334155;
}

.color-hex {
  flex: 1;
  font-family: 'Monaco', 'Courier New', monospace;
  text-transform: uppercase;
}

/* Slider */
.slider-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider-input {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #ec4899;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider-input::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #ec4899;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

body.dark-mode .slider-input {
  background: #334155;
}

.slider-value {
  min-width: 45px;
  text-align: right;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

body.dark-mode .slider-value {
  color: #d1d5db;
}

/* Checkbox */
.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 0;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label {
  font-size: 14px;
  color: #374151;
}

body.dark-mode .checkbox-label {
  color: #d1d5db;
}

/* Scrollbar */
.editor-content::-webkit-scrollbar {
  width: 6px;
}

.editor-content::-webkit-scrollbar-track {
  background: #f3f4f6;
}

body.dark-mode .editor-content::-webkit-scrollbar-track {
  background: #1e293b;
}

.editor-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

body.dark-mode .editor-content::-webkit-scrollbar-thumb {
  background: #4b5563;
}

.editor-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

body.dark-mode .editor-content::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
