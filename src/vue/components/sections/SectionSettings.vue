<template>
  <Teleport to="body">
    <div class="section-settings-overlay" @click.self="$emit('close')">
      <div class="section-settings-panel">
        <div class="settings-header">
          <h3>Section Settings</h3>
          <button @click="$emit('close')" class="close-btn">×</button>
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
          <button @click="$emit('close')" class="btn-secondary">Cancel</button>
          <button @click="saveSettings" class="btn-primary">Apply Settings</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

const props = defineProps({
  sectionId: {
    type: String,
    required: true
  },
  section: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'update'])

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
const settings = reactive({
  ...(props.section.settings || {})
})

const currentLayout = computed(() => props.section.layout || props.section.type || 'full_width')

// Update individual setting
function updateSetting(key, value) {
  settings[key] = value
}

// Update layout
function updateLayout(layout) {
  emit('update', { 
    layout,
    type: layout // For backwards compatibility
  })
}

// Save all settings
function saveSettings() {
  emit('update', { 
    settings: { ...settings }
  })
  emit('close')
}
</script>

<style scoped>
.section-settings-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.section-settings-panel {
  background: var(--panel-bg, #1a1a1a);
  color: var(--text-color, #fff);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.settings-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-color, #fff);
  font-size: 24px;
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
}

.color-input-wrapper input[type="color"] {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  cursor: pointer;
}

.opacity-slider {
  display: flex;
  align-items: center;
  gap: 12px;
}

.opacity-slider input[type="range"] {
  flex: 1;
}

.opacity-value {
  min-width: 40px;
  text-align: right;
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
}

.spacing-options select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--text-color, #fff);
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
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
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.advanced-options input[type="text"] {
  width: 100%;
  padding: 8px;
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
</style>
