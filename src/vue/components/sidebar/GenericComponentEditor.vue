<template>
  <div class="generic-editor">
    <!-- Content Tab -->
    <div v-show="activeTab === 'content'" class="editor-section">
      <div class="empty-state">
        <i class="fa-solid fa-pen-to-square empty-icon"></i>
        <p class="empty-text">This component doesn't have a custom editor yet.</p>
        <p class="empty-hint">Basic properties can be edited below</p>
      </div>
      
      <!-- Component Props -->
      <div v-if="component && component.props" class="props-section">
        <h3 class="section-title">Properties</h3>
        <div
          v-for="(value, key) in component.props"
          :key="key"
          class="prop-row"
        >
          <label class="prop-label">{{ formatPropName(key) }}</label>
          <input
            v-if="typeof value === 'string' || typeof value === 'number'"
            :value="value"
            @input="updateProp(key, $event.target.value)"
            class="prop-input"
          />
          <textarea
            v-else-if="typeof value === 'object' && value !== null"
            :value="JSON.stringify(value, null, 2)"
            @input="updatePropJSON(key, $event.target.value)"
            class="prop-textarea"
            rows="4"
          ></textarea>
          <span v-else class="prop-value">{{ value }}</span>
        </div>
      </div>
    </div>
    
    <!-- Style Tab -->
    <div v-show="activeTab === 'style'" class="editor-section">
      <div class="empty-state">
        <i class="fa-solid fa-palette empty-icon"></i>
        <p class="empty-text">Style options coming soon</p>
      </div>
    </div>
    
    <!-- Advanced Tab -->
    <div v-show="activeTab === 'advanced'" class="editor-section">
      <div class="setting-group">
        <label class="setting-label">Component ID</label>
        <input
          type="text"
          :value="componentId"
          readonly
          class="text-input readonly"
        />
      </div>
      
      <div class="setting-group">
        <label class="setting-label">Component Type</label>
        <input
          type="text"
          :value="component?.type || 'Unknown'"
          readonly
          class="text-input readonly"
        />
      </div>
      
      <div class="setting-group">
        <label class="setting-label">Custom CSS Class</label>
        <input
          type="text"
          :value="component?.customClass || ''"
          @input="updateCustomClass($event.target.value)"
          placeholder="e.g., my-custom-component"
          class="text-input"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMediaKitStore } from '@/stores/mediaKit'

const props = defineProps({
  componentId: {
    type: String,
    required: true
  },
  activeTab: {
    type: String,
    default: 'content'
  }
})

const store = useMediaKitStore()

// Get component
const component = computed(() => {
  return store.components[props.componentId]
})

// Format property name for display
function formatPropName(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

// Update prop
function updateProp(key, value) {
  if (!component.value) return
  
  store.updateComponent(props.componentId, {
    props: {
      ...component.value.props,
      [key]: value
    }
  })
  
  console.log('✅ GenericEditor: Updated prop:', key, '=', value)
}

// Update prop from JSON
function updatePropJSON(key, jsonString) {
  try {
    const value = JSON.parse(jsonString)
    updateProp(key, value)
  } catch (error) {
    console.warn('Invalid JSON:', error.message)
  }
}

// Update custom class
function updateCustomClass(value) {
  if (!component.value) return
  
  store.updateComponent(props.componentId, {
    customClass: value
  })
  
  console.log('✅ GenericEditor: Updated custom class:', value)
}
</script>

<style scoped>
.generic-editor {
  padding: 16px;
}

.editor-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 12px;
  opacity: 0.5;
}

body.dark-mode .empty-icon {
  color: #475569;
}

.empty-text {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  margin: 0 0 4px;
}

body.dark-mode .empty-text {
  color: #9ca3af;
}

.empty-hint {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

body.dark-mode .empty-hint {
  color: #6b7280;
}

/* Props Section */
.props-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px;
}

body.dark-mode .section-title {
  color: #d1d5db;
}

.prop-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.prop-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

body.dark-mode .prop-label {
  color: #d1d5db;
}

.prop-input,
.prop-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #374151;
  transition: all 0.2s;
}

.prop-input:focus,
.prop-textarea:focus {
  outline: none;
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

body.dark-mode .prop-input,
body.dark-mode .prop-textarea {
  background: #1e293b;
  border-color: #334155;
  color: #f3f4f6;
}

.prop-textarea {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  resize: vertical;
}

.prop-value {
  font-size: 14px;
  color: #6b7280;
  padding: 8px 0;
}

body.dark-mode .prop-value {
  color: #9ca3af;
}

/* Setting Groups */
.setting-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.setting-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

body.dark-mode .setting-label {
  color: #d1d5db;
}

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

.text-input:focus {
  outline: none;
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.text-input.readonly {
  background: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

body.dark-mode .text-input {
  background: #1e293b;
  border-color: #334155;
  color: #f3f4f6;
}

body.dark-mode .text-input.readonly {
  background: #334155;
  color: #9ca3af;
}
</style>
