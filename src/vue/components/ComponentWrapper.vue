<template>
  <div 
    class="component-wrapper"
    :class="wrapperClass"
    :data-component-id="componentId || component?.id"
    :data-draggable="true"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- Single unified control system -->
    <ComponentControls
      v-if="showControlsComputed && component"
      :component-id="componentId || component.id"
      :component-type="component.type"
      :index="index"
      :total-components="totalComponents"
    />
    
    <div class="component-wrapper__content">
      <ComponentRenderer
        v-if="component"
        :component-id="componentId || component.id"
        :component="component"
        :section-id="sectionId"
        :is-editing="isEditing"
        :is-selected="isSelected"
      />
      
      <div v-else class="component-placeholder">
        <span class="placeholder-icon">⚠️</span>
        <span>Component not found: {{ componentId }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMediaKitStore } from '@/stores/mediaKit'
import ComponentRenderer from './ComponentRenderer.vue'
import ComponentControls from './builder/ComponentControls.vue'

const props = defineProps({
  // Support both ways of passing component data for compatibility
  componentId: {
    type: String,
    default: null
  },
  component: {
    type: Object,
    default: null
  },
  sectionId: {
    type: String,
    default: null
  },
  column: {
    type: Number,
    default: 1
  },
  index: {
    type: Number,
    default: 0
  },
  totalComponents: {
    type: Number,
    default: 1
  },
  showControls: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['edit', 'duplicate', 'remove'])

const store = useMediaKitStore()
const isHovered = ref(false)

// Get component data (support both prop methods)
const actualComponent = computed(() => {
  if (props.component) return props.component
  if (props.componentId) return store.components[props.componentId]
  return null
})

// Computed properties
const isSelected = computed(() => {
  const id = props.componentId || props.component?.id
  return store.selectedComponentId === id
})

const isEditing = computed(() => {
  const id = props.componentId || props.component?.id
  return store.editingComponentId === id
})

// Show controls when hovering or selected
const showControlsComputed = computed(() => 
  props.showControls && (isHovered.value || isSelected.value)
)

// Wrapper classes
const wrapperClass = computed(() => ({
  'component-wrapper--selected': isSelected.value,
  'component-wrapper--editing': isEditing.value,
  'component-wrapper--hovering': isHovered.value,
  [`component-wrapper--${actualComponent.value?.type}`]: actualComponent.value?.type
}))

// Mouse events
function onMouseEnter() {
  isHovered.value = true
  const id = props.componentId || props.component?.id
  if (id) {
    store.setHoveredComponent(id)
  }
}

function onMouseLeave() {
  isHovered.value = false
  const id = props.componentId || props.component?.id
  if (id && store.hoveredComponentId === id) {
    store.setHoveredComponent(null)
  }
}
</script>

<style scoped>
.component-wrapper {
  position: relative;
  transition: all 0.3s ease;
  border-radius: var(--radius-md, 6px);
  margin-bottom: var(--spacing-md, 16px);
}

.component-wrapper:last-child {
  margin-bottom: 0;
}

.component-wrapper:first-child {
  margin-top: 40px; /* Space for controls */
}

.component-wrapper--hovering {
  outline: 2px dashed rgba(59, 130, 246, 0.5);
  outline-offset: 2px;
}

.component-wrapper--selected {
  outline: 2px solid var(--primary-color, #3b82f6);
  outline-offset: 2px;
}

.component-wrapper--editing {
  outline: 2px solid var(--success-color, #10b981);
  outline-offset: 2px;
}

/* Component content */
.component-wrapper__content {
  position: relative;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

/* Component Placeholder */
.component-placeholder {
  padding: 40px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-md, 6px);
  text-align: center;
  color: var(--text-muted, #64748b);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.placeholder-icon {
  font-size: 24px;
}
</style>
