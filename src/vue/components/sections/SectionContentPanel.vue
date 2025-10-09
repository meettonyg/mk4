<template>
  <div class="section-content-panel">
    <!-- Layout Selection -->
    <section class="content-section">
      <h4 class="content-section-title">
        Layout Type
        <Tooltip text="Choose how content is organized in this section. Full width uses the entire container, while column layouts split the space." />
      </h4>
      
      <div class="layout-options">
        <button 
          v-for="layout in layouts"
          :key="layout.value"
          @click="updateLayout(layout.value)"
          :class="['layout-option', { active: currentLayout === layout.value }]"
          :title="layout.description"
        >
          <div class="layout-preview">
            <component :is="layout.icon" />
          </div>
          <span class="layout-label">{{ layout.label }}</span>
        </button>
      </div>
    </section>

    <!-- Container Settings -->
    <section class="content-section">
      <h4 class="content-section-title">
        Container
        <Tooltip text="Control how the section container behaves and its maximum width." />
      </h4>
      
      <label class="checkbox-label">
        <input 
          type="checkbox" 
          :checked="settings.fullWidth || false"
          @change="updateSetting('fullWidth', $event.target.checked)"
        >
        <span>Full Width Container</span>
        <Tooltip text="Extend the section to the full width of the viewport, ignoring the standard container width." position="right" />
      </label>
    </section>

    <!-- Mobile Settings -->
    <section class="content-section">
      <h4 class="content-section-title">
        Mobile Behavior
        <Tooltip text="Customize how this section displays on mobile devices." />
      </h4>
      
      <label class="checkbox-label">
        <input 
          type="checkbox" 
          :checked="settings.reverseOnMobile || false"
          @change="updateSetting('reverseOnMobile', $event.target.checked)"
        >
        <span>Reverse Column Order on Mobile</span>
        <Tooltip text="On mobile devices, display columns in reverse order. Useful for prioritizing certain content on small screens." position="right" />
      </label>
    </section>

    <!-- Spacing Presets -->
    <section class="content-section">
      <h4 class="content-section-title">
        Spacing Presets
        <Tooltip text="Quick presets for common spacing configurations." />
      </h4>
      
      <div class="spacing-presets">
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
    </section>

    <!-- Custom CSS Class -->
    <section class="content-section">
      <h4 class="content-section-title">
        Custom Styling
        <Tooltip text="Add custom CSS classes or IDs for advanced styling." />
      </h4>
      
      <label>
        <span class="field-label">CSS Class:</span>
        <input 
          type="text" 
          :value="settings.customClass || ''"
          @input="updateSetting('customClass', $event.target.value)"
          placeholder="e.g., my-custom-section"
          class="text-input"
        >
      </label>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { useMediaKitStore } from '@/stores/mediaKit'
import Tooltip from '../shared/Tooltip.vue'

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

const store = useMediaKitStore()

const layouts = [
  { 
    value: 'full_width', 
    label: 'Full Width',
    description: 'Single full-width column',
    icon: { 
      template: '<svg viewBox="0 0 60 40"><rect x="5" y="10" width="50" height="20" fill="currentColor" rx="2"/></svg>' 
    }
  },
  { 
    value: 'two_column', 
    label: 'Two Columns',
    description: 'Split into two equal columns',
    icon: { 
      template: '<svg viewBox="0 0 60 40"><rect x="5" y="10" width="23" height="20" fill="currentColor" rx="2"/><rect x="32" y="10" width="23" height="20" fill="currentColor" rx="2"/></svg>' 
    }
  },
  { 
    value: 'three_column', 
    label: 'Three Columns',
    description: 'Split into three equal columns',
    icon: { 
      template: '<svg viewBox="0 0 60 40"><rect x="5" y="10" width="14" height="20" fill="currentColor" rx="2"/><rect x="23" y="10" width="14" height="20" fill="currentColor" rx="2"/><rect x="41" y="10" width="14" height="20" fill="currentColor" rx="2"/></svg>' 
    }
  }
]

const currentLayout = computed(() => {
  return props.section?.layout || props.section?.type || 'full_width'
})

const settings = reactive({})

// Load settings
watch(() => props.section, (newSection) => {
  if (newSection?.settings) {
    Object.assign(settings, newSection.settings)
  }
}, { immediate: true, deep: true })

function updateLayout(layout) {
  store.updateSection(props.sectionId, { 
    layout,
    type: layout
  })
  console.log('✅ SectionContentPanel: Layout updated to:', layout)
}

function updateSetting(key, value) {
  settings[key] = value
  store.updateSectionSettings(props.sectionId, { [key]: value })
  console.log('✅ SectionContentPanel: Setting updated:', key, '=', value)
}
</script>

<style scoped>
.section-content-panel {
  padding: 0;
}

.content-section {
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.content-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.content-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.layout-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.layout-option {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 16px 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #fff;
}

.layout-option:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.layout-option.active {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.15);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

.layout-label {
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #fff;
  padding: 8px 0;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.checkbox-label span {
  flex: 1;
}

.spacing-presets {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.spacing-presets label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #fff;
}

.spacing-presets select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.spacing-presets select:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.spacing-presets select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.spacing-presets select option {
  background: #1a1a1a;
  color: #fff;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
  margin-bottom: 6px;
  display: block;
}

.text-input {
  width: 100%;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.text-input:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.text-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: rgba(255, 255, 255, 0.12);
}

.text-input::placeholder {
  color: #64748b;
}

/* Responsive */
@media (max-width: 640px) {
  .layout-options {
    grid-template-columns: 1fr;
  }
  
  .spacing-presets {
    grid-template-columns: 1fr;
  }
}
</style>
