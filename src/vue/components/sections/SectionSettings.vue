<template>
  <Teleport to="body">
    <div v-if="isPanelOpen" class="section-settings-overlay" @click.self="handleClose">
      <div class="section-settings-panel" :class="{ 'section-settings-panel--open': isPanelOpen }">
        <div class="section-settings-panel__content">
          <!-- Header -->
          <div class="settings-header">
            <h3>Section Settings</h3>
            <button @click="handleClose" class="close-btn" title="Close">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          
          <div class="settings-content">
            <!-- Layout Selection -->
            <div class="setting-group">
              <label class="setting-label">Layout</label>
              <div class="layout-options">
                <button 
                  v-for="layout in layouts"
                  :key="layout.value"
                  @click="updateLayout(layout.value)"
                  :class="['layout-option', { active: currentLayout === layout.value }]"
                >
                  <div class="layout-preview">
                    <component :is="layout.icon" />
                  </div>
                  <span>{{ layout.label }}</span>
                </button>
              </div>
            </div>
            
            <!-- Background Settings -->
            <div class="setting-group">
              <label class="setting-label">Background</label>
              <div class="background-options">
                <label class="color-input-wrapper">
                  <span>Color:</span>
                  <input 
                    type="color" 
                    :value="settings.backgroundColor || '#ffffff'"
                    @input="updateSetting('backgroundColor', $event.target.value)"
                  >
                </label>
                <label class="opacity-slider">
                  <span>Opacity:</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    :value="(settings.backgroundOpacity || 1) * 100"
                    @input="updateSetting('backgroundOpacity', $event.target.value / 100)"
                  >
                  <span class="opacity-value">{{ Math.round((settings.backgroundOpacity || 1) * 100) }}%</span>
                </label>
              </div>
            </div>
            
            <!-- Spacing Settings -->
            <div class="setting-group">
              <label class="setting-label">Spacing</label>
              <div class="spacing-options">
                <label>
                  <span>Padding:</span>
                  <select 
                    :value="settings.padding || 'medium'"
                    @change="updateSetting('padding', $event.target.value)"
                  >
                    <option value="none">None</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="extra-large">Extra Large</option>
                  </select>
                </label>
                <label>
                  <span>Gap:</span>
                  <select 
                    :value="settings.gap || 'medium'"
                    @change="updateSetting('gap', $event.target.value)"
                  >
                    <option value="none">None</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </label>
              </div>
            </div>
            
            <!-- Advanced Settings -->
            <div class="setting-group">
              <label class="setting-label">Advanced</label>
              <div class="advanced-options">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    :checked="settings.fullWidth || false"
                    @change="updateSetting('fullWidth', $event.target.checked)"
                  >
                  <span>Full Width Container</span>
                </label>
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    :checked="settings.reverseOnMobile || false"
                    @change="updateSetting('reverseOnMobile', $event.target.checked)"
                  >
                  <span>Reverse Columns on Mobile</span>
                </label>
                <label>
                  <span>Custom CSS Class:</span>
                  <input 
                    type="text" 
                    :value="settings.customClass || ''"
                    @input="updateSetting('customClass', $event.target.value)"
                    placeholder="e.g., my-custom-section"
                  >
                </label>
              </div>
            </div>
          </div>
          
          <div class="settings-footer">
            <button @click="handleClose" class="btn-secondary">Close</button>
            <button @click="saveSettings" class="btn-primary">Apply Settings</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted, onUnmounted } from 'vue'
import { useMediaKitStore } from '@/stores/mediaKit'
import { useUIStore } from '@/stores/ui'

const store = useMediaKitStore()
const uiStore = useUIStore()

// Check if panel is open
const isPanelOpen = computed(() => uiStore.sectionSettingsPanelOpen)
const sectionId = computed(() => uiStore.editingSectionId)

// Get current section
const section = computed(() => {
  if (!sectionId.value) return null
  return store.sections.find(s => s.section_id === sectionId.value)
})

// Layout options with icon components
const layouts = [
  { 
    value: 'full_width', 
    label: 'Full Width',
    icon: { template: '<svg viewBox="0 0 24 24"><rect x="2" y="8" width="20" height="8" fill="currentColor"/></svg>' }
  },
  { 
    value: 'two_column', 
    label: 'Two Columns',
    icon: { template: '<svg viewBox="0 0 24 24"><rect x="2" y="8" width="9" height="8" fill="currentColor"/><rect x="13" y="8" width="9" height="8" fill="currentColor"/></svg>' }
  },
  { 
    value: 'three_column', 
    label: 'Three Columns',
    icon: { template: '<svg viewBox="0 0 24 24"><rect x="2" y="8" width="6" height="8" fill="currentColor"/><rect x="9" y="8" width="6" height="8" fill="currentColor"/><rect x="16" y="8" width="6" height="8" fill="currentColor"/></svg>' }
  }
]

// Current settings (reactive copy)
const settings = reactive({})

// Watch for section changes and update settings
watch(section, (newSection) => {
  if (newSection && newSection.settings) {
    Object.assign(settings, newSection.settings)
    console.log('✅ SectionSettings: Settings loaded for section:', sectionId.value)
  }
}, { immediate: true })

// ROOT FIX: Debug panel open state
watch(isPanelOpen, (isOpen) => {
  if (isOpen) {
    console.log('✅ SectionSettings: Panel OPENED for section:', sectionId.value)
    console.log('📊 SectionSettings: Current section data:', section.value)
  } else {
    console.log('✅ SectionSettings: Panel CLOSED')
  }
})

const currentLayout = computed(() => {
  if (!section.value) return 'full_width'
  return section.value.layout || section.value.type || 'full_width'
})

// Update individual setting
function updateSetting(key, value) {
  settings[key] = value
}

// Update layout
function updateLayout(layout) {
  if (!sectionId.value) return
  
  store.updateSection(sectionId.value, { 
    layout,
    type: layout // For backwards compatibility
  })
}

// Save all settings
function saveSettings() {
  if (!sectionId.value) return
  
  store.updateSectionSettings(sectionId.value, { ...settings })
  handleClose()
}

// Close handler
function handleClose() {
  uiStore.closeSectionSettings()
}

// Escape key handler
let escapeHandler = null

escapeHandler = (e) => {
  if (e.key === 'Escape' && isPanelOpen.value) {
    handleClose()
  }
}

// Add keyboard listener
onMounted(() => {
  document.addEventListener('keydown', escapeHandler)
  console.log('✅ SectionSettings: Escape key listener registered')
})

// Cleanup
onUnmounted(() => {
  if (escapeHandler) {
    document.removeEventListener('keydown', escapeHandler)
    console.log('✅ SectionSettings: Escape key listener cleaned up')
  }
})
</script>

<style scoped>
/* ROOT FIX: Bulletproof Elementor-style sidebar panel - ABSOLUTE POSITIONING */
.section-settings-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(0, 0, 0, 0.5) !important;
  z-index: 999999 !important;
  animation: fadeIn 0.2s ease;
  pointer-events: auto !important;
  /* REMOVED: display: flex, justify-content, align-items */
  /* Using absolute positioning on child instead */
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.section-settings-panel {
  /* CRITICAL ROOT FIX: Absolute positioning for bulletproof right-side placement */
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 400px !important;
  max-width: 400px !important;
  height: 100% !important;
  background: var(--panel-bg, #1a1a1a) !important;
  color: var(--text-color, #fff) !important;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.3) !important;
  transform: translateX(100%) !important; /* CRITICAL: Starts off-screen right */
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  z-index: 1000000 !important; /* Above overlay */
}

.section-settings-panel--open {
  transform: translateX(0) !important; /* CRITICAL: Slides in from right */
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.section-settings-panel__content {
  flex: 1;
  overflow-y: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.settings-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-color, #fff);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-color, #fff);
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.setting-group {
  margin-bottom: 24px;
}

.setting-label {
  display: block;
  margin-bottom: 12px;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

/* Layout Options */
.layout-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.layout-option {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-color, #fff);
}

.layout-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.layout-option.active {
  border-color: var(--primary-color, #3b82f6);
  background: rgba(59, 130, 246, 0.1);
}

.layout-preview {
  width: 60px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.layout-preview svg {
  width: 100%;
  height: 100%;
}

/* Background Options */
.background-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.color-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-color, #fff);
}

.color-input-wrapper input[type="color"] {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  cursor: pointer;
  background: none;
}

.opacity-slider {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-color, #fff);
}

.opacity-slider input[type="range"] {
  flex: 1;
}

.opacity-value {
  min-width: 40px;
  text-align: right;
  color: var(--text-muted, #94a3b8);
}

/* Spacing Options */
.spacing-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.spacing-options label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--text-color, #fff);
}

.spacing-options select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--text-color, #fff);
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
}

.spacing-options select option {
  background: #1a1a1a;
  color: #fff;
}

/* Advanced Options */
.advanced-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-color, #fff);
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.advanced-options label {
  color: var(--text-color, #fff);
}

.advanced-options input[type="text"] {
  width: 100%;
  padding: 8px;
  margin-top: 4px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--text-color, #fff);
  border-radius: 4px;
}

/* Footer */
.settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary-color, #3b82f6);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover, #2563eb);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-color, #fff);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Responsive */
@media (max-width: 640px) {
  .section-settings-panel {
    width: 100% !important;
    max-width: 100% !important;
  }
}

/* ROOT FIX: Bulletproof positioning - no flexbox, pure absolute */
.section-settings-overlay > .section-settings-panel {
  /* All positioning handled in main .section-settings-panel rule */
  /* This selector kept for specificity override protection */
  margin: 0 !important;
  left: auto !important;
}

/* Custom Scrollbar */
.settings-content::-webkit-scrollbar {
  width: 6px;
}

.settings-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.settings-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.settings-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
