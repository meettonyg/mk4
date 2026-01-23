<template>
  <div class="sidebar-editor">
    <!-- Header - Matches Component Editor Style -->
    <div class="editor-header">
      <h3 class="editor-title">Edit Section</h3>
      
      <!-- Reset Button (icon only) -->
      <button 
        @click="handleReset" 
        class="reset-button reset-settings"
        title="Reset section settings to defaults"
      >
        <i class="fa-solid fa-rotate-left"></i>
      </button>
      
      <!-- Close Button -->
      <button @click="handleClose" class="close-btn" aria-label="Close panel">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
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
        
        <!-- ROOT FIX: Vertical Alignment Control -->
        <div v-if="currentLayout !== 'full_width'" class="setting-group">
          <label class="setting-label">
            Column Vertical Alignment
            <span class="setting-tooltip" title="Controls how columns align vertically when they have different heights">
              <i class="fa-solid fa-circle-info"></i>
            </span>
          </label>
          <div class="valign-grid">
            <button
              @click="updateSetting('verticalAlign', 'start')"
              class="valign-option"
              :class="{ active: (settings.verticalAlign || 'start') === 'start' }"
              title="Align to Top"
            >
              <div class="valign-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <rect x="6" y="8" width="4" height="8" fill="currentColor" opacity="0.3" />
                  <rect x="14" y="8" width="4" height="12" fill="currentColor" opacity="0.3" />
                </svg>
              </div>
              <span class="valign-label">Top</span>
            </button>
            
            <button
              @click="updateSetting('verticalAlign', 'center')"
              class="valign-option"
              :class="{ active: settings.verticalAlign === 'center' }"
              title="Align to Center"
            >
              <div class="valign-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <rect x="6" y="10" width="4" height="8" fill="currentColor" opacity="0.3" />
                  <rect x="14" y="8" width="4" height="12" fill="currentColor" opacity="0.3" />
                </svg>
              </div>
              <span class="valign-label">Center</span>
            </button>
            
            <button
              @click="updateSetting('verticalAlign', 'end')"
              class="valign-option"
              :class="{ active: settings.verticalAlign === 'end' }"
              title="Align to Bottom"
            >
              <div class="valign-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="4" y1="18" x2="20" y2="18" />
                  <rect x="6" y="8" width="4" height="8" fill="currentColor" opacity="0.3" />
                  <rect x="14" y="6" width="4" height="12" fill="currentColor" opacity="0.3" />
                </svg>
              </div>
              <span class="valign-label">Bottom</span>
            </button>
            
            <button
              @click="updateSetting('verticalAlign', 'stretch')"
              class="valign-option"
              :class="{ active: settings.verticalAlign === 'stretch' }"
              title="Stretch to Equal Height"
            >
              <div class="valign-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                  <rect x="6" y="6" width="4" height="12" fill="currentColor" opacity="0.3" />
                  <rect x="14" y="6" width="4" height="12" fill="currentColor" opacity="0.3" />
                </svg>
              </div>
              <span class="valign-label">Stretch</span>
            </button>
          </div>
          <p class="input-hint">
            Choose how columns should align when they have different heights.
            <strong>Stretch</strong> will make all columns equal height.
          </p>
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
          
          <!-- Background Type Selector -->
          <div class="bg-type-selector">
            <button
              @click="updateSetting('backgroundType', 'color')"
              class="bg-type-btn"
              :class="{ active: (settings.backgroundType || 'color') === 'color' }"
              title="Solid Color Background"
            >
              <span class="bg-type-icon">
                <i class="fa-solid fa-palette"></i>
              </span>
              <span class="bg-type-label">Color</span>
            </button>
            <button
              @click="updateSetting('backgroundType', 'gradient')"
              class="bg-type-btn"
              :class="{ active: settings.backgroundType === 'gradient' }"
              title="Gradient Background"
            >
              <span class="bg-type-icon">
                <i class="fa-solid fa-brush"></i>
              </span>
              <span class="bg-type-label">Gradient</span>
            </button>
            <button
              @click="updateSetting('backgroundType', 'image')"
              class="bg-type-btn"
              :class="{ active: settings.backgroundType === 'image' }"
              title="Image Background"
            >
              <span class="bg-type-icon">
                <i class="fa-solid fa-image"></i>
              </span>
              <span class="bg-type-label">Image</span>
            </button>
          </div>
          
          <!-- Color Background Options -->
          <div v-if="(settings.backgroundType || 'color') === 'color'" class="bg-options">
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
          </div>
          
          <!-- Gradient Background Options -->
          <div v-if="settings.backgroundType === 'gradient'" class="bg-options">
            <div class="input-row">
              <label class="input-label">Start Color</label>
              <div class="color-input-wrapper">
                <input
                  type="color"
                  :value="settings.gradientStart || '#3b82f6'"
                  @input="updateSetting('gradientStart', $event.target.value)"
                  class="color-input"
                />
                <input
                  type="text"
                  :value="settings.gradientStart || '#3b82f6'"
                  @input="updateSetting('gradientStart', $event.target.value)"
                  class="text-input color-hex"
                  placeholder="#3b82f6"
                />
              </div>
            </div>
            <div class="input-row">
              <label class="input-label">End Color</label>
              <div class="color-input-wrapper">
                <input
                  type="color"
                  :value="settings.gradientEnd || '#8b5cf6'"
                  @input="updateSetting('gradientEnd', $event.target.value)"
                  class="color-input"
                />
                <input
                  type="text"
                  :value="settings.gradientEnd || '#8b5cf6'"
                  @input="updateSetting('gradientEnd', $event.target.value)"
                  class="text-input color-hex"
                  placeholder="#8b5cf6"
                />
              </div>
            </div>
            <div class="input-row">
              <label class="input-label">Direction</label>
              <select
                :value="settings.gradientDirection || '135deg'"
                @change="updateSetting('gradientDirection', $event.target.value)"
                class="select-input"
              >
                <option value="0deg">Top to Bottom</option>
                <option value="90deg">Left to Right</option>
                <option value="180deg">Bottom to Top</option>
                <option value="270deg">Right to Left</option>
                <option value="45deg">Diagonal ↗</option>
                <option value="135deg">Diagonal ↘</option>
                <option value="225deg">Diagonal ↙</option>
                <option value="315deg">Diagonal ↖</option>
              </select>
            </div>
          </div>
          
          <!-- Image Background Options -->
          <div v-if="settings.backgroundType === 'image'" class="bg-options">
            <div class="input-row">
              <label class="input-label">Image URL</label>
              <input
                type="text"
                :value="settings.backgroundImage || ''"
                @input="updateSetting('backgroundImage', $event.target.value)"
                placeholder="https://example.com/image.jpg"
                class="text-input"
              />
            </div>
            <div class="input-row">
              <label class="input-label">Size</label>
              <select
                :value="settings.backgroundSize || 'cover'"
                @change="updateSetting('backgroundSize', $event.target.value)"
                class="select-input"
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div class="input-row">
              <label class="input-label">Position</label>
              <select
                :value="settings.backgroundPosition || 'center center'"
                @change="updateSetting('backgroundPosition', $event.target.value)"
                class="select-input"
              >
                <option value="center center">Center</option>
                <option value="top left">Top Left</option>
                <option value="top center">Top Center</option>
                <option value="top right">Top Right</option>
                <option value="center left">Center Left</option>
                <option value="center right">Center Right</option>
                <option value="bottom left">Bottom Left</option>
                <option value="bottom center">Bottom Center</option>
                <option value="bottom right">Bottom Right</option>
              </select>
            </div>
            <div class="input-row">
              <label class="input-label">Repeat</label>
              <select
                :value="settings.backgroundRepeat || 'no-repeat'"
                @change="updateSetting('backgroundRepeat', $event.target.value)"
                class="select-input"
              >
                <option value="no-repeat">No Repeat</option>
                <option value="repeat">Repeat</option>
                <option value="repeat-x">Repeat X</option>
                <option value="repeat-y">Repeat Y</option>
              </select>
            </div>
          </div>
          
          <!-- Opacity (applies to all background types) -->
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
    value: 'main_sidebar', 
    label: 'Main + Sidebar',
    columns: [70, 30]
  },
  { 
    value: 'sidebar_main', 
    label: 'Sidebar + Main',
    columns: [30, 70]
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

// Handle reset button
function handleReset() {
  if (!sectionId.value) return
  
  if (confirm('Reset all section settings to defaults? This will not affect components within the section.')) {
    store.updateSectionSettings(sectionId.value, {
      padding: 'medium',
      gap: 'medium',
      backgroundType: 'color',
      backgroundColor: '#ffffff',
      backgroundOpacity: 1,
      gradientStart: '#3b82f6',
      gradientEnd: '#8b5cf6',
      gradientDirection: '135deg',
      backgroundImage: '',
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      fullWidth: false,
      reverseOnMobile: false,
      customClass: '',
      verticalAlign: 'start'
    })
    
    // Update local settings
    Object.assign(settings, {
      padding: 'medium',
      gap: 'medium',
      backgroundType: 'color',
      backgroundColor: '#ffffff',
      backgroundOpacity: 1,
      gradientStart: '#3b82f6',
      gradientEnd: '#8b5cf6',
      gradientDirection: '135deg',
      backgroundImage: '',
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      fullWidth: false,
      reverseOnMobile: false,
      customClass: '',
      verticalAlign: 'start'
    })
    
    console.log('✅ Section settings reset to defaults')
  }
}

// Handle close button
function handleClose() {
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

/* Header - Matches Component Editor Style */
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

/* Reset Button (icon only) */
.reset-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  padding: 0;
}

.reset-button:hover {
  background: #fef3c7;
  border-color: #fbbf24;
  color: #d97706;
}

body.dark-mode .reset-button {
  border-color: #334155;
  color: #9ca3af;
}

body.dark-mode .reset-button:hover {
  background: rgba(251, 191, 36, 0.1);
  border-color: #fbbf24;
  color: #fbbf24;
}

/* Close Button */
.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  padding: 0;
}

.close-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

body.dark-mode .close-btn {
  color: #9ca3af;
}

body.dark-mode .close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
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

/* ROOT FIX: Vertical Alignment Grid */
.valign-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.valign-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.valign-option:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.valign-option.active {
  border-color: #ec4899;
  background: #fdf2f8;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

body.dark-mode .valign-option {
  background: #1e293b;
  border-color: #334155;
}

body.dark-mode .valign-option:hover {
  background: #334155;
  border-color: #475569;
}

body.dark-mode .valign-option.active {
  background: rgba(236, 72, 153, 0.1);
  border-color: #ec4899;
}

.valign-icon {
  width: 24px;
  height: 24px;
  color: #6b7280;
  transition: color 0.2s;
}

.valign-option:hover .valign-icon {
  color: #374151;
}

.valign-option.active .valign-icon {
  color: #ec4899;
}

body.dark-mode .valign-icon {
  color: #9ca3af;
}

body.dark-mode .valign-option:hover .valign-icon {
  color: #d1d5db;
}

body.dark-mode .valign-option.active .valign-icon {
  color: #ec4899;
}

.valign-label {
  font-size: 11px;
  font-weight: 500;
  color: #374151;
  text-align: center;
}

body.dark-mode .valign-label {
  color: #d1d5db;
}

.setting-tooltip {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  color: #9ca3af;
  font-size: 11px;
  cursor: help;
}

.setting-tooltip:hover {
  color: #6b7280;
}

body.dark-mode .setting-tooltip {
  color: #6b7280;
}

body.dark-mode .setting-tooltip:hover {
  color: #9ca3af;
}

/* Background Type Selector */
.bg-type-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.bg-type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 70px;
}

.bg-type-btn:hover {
  border-color: #d1d5db;
  background: #f9fafb;
  transform: translateY(-1px);
}

.bg-type-btn.active {
  border-color: #ec4899;
  background: #fdf2f8;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

body.dark-mode .bg-type-btn {
  background: #1e293b;
  border-color: #334155;
}

body.dark-mode .bg-type-btn:hover {
  background: #334155;
  border-color: #475569;
}

body.dark-mode .bg-type-btn.active {
  background: rgba(236, 72, 153, 0.1);
  border-color: #ec4899;
}

.bg-type-icon {
  font-size: 20px;
  color: #6b7280;
  transition: color 0.2s;
}

.bg-type-btn:hover .bg-type-icon {
  color: #374151;
}

.bg-type-btn.active .bg-type-icon {
  color: #ec4899;
}

body.dark-mode .bg-type-icon {
  color: #9ca3af;
}

body.dark-mode .bg-type-btn:hover .bg-type-icon {
  color: #d1d5db;
}

body.dark-mode .bg-type-btn.active .bg-type-icon {
  color: #ec4899;
}

.bg-type-label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  transition: color 0.2s;
}

.bg-type-btn:hover .bg-type-label {
  color: #111827;
}

.bg-type-btn.active .bg-type-label {
  color: #ec4899;
  font-weight: 600;
}

body.dark-mode .bg-type-label {
  color: #d1d5db;
}

body.dark-mode .bg-type-btn:hover .bg-type-label {
  color: #f3f4f6;
}

body.dark-mode .bg-type-btn.active .bg-type-label {
  color: #ec4899;
}

/* Background Options Container */
.bg-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

body.dark-mode .bg-options {
  background: #1e293b;
  border-color: #334155;
}
</style>
