<template>
  <div 
    class="component-wrapper"
    :class="wrapperClass"
    :data-component-id="componentId"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div v-if="showControls" class="component-controls">
      <button 
        @click="$emit('edit')"
        class="control-btn"
        title="Edit Component"
      >
        <svg viewBox="0 0 24 24" width="14" height="14">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
      </button>
      
      <button 
        @click="$emit('duplicate')"
        class="control-btn"
        title="Duplicate Component"
      >
        <svg viewBox="0 0 24 24" width="14" height="14">
          <path d="M5 7v12a2 2 0 002 2h10M9 3h8a2 2 0 012 2v8a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
      </button>
      
      <button 
        @click="$emit('remove')"
        class="control-btn control-btn--delete"
        title="Remove Component"
      >
        <svg viewBox="0 0 24 24" width="14" height="14">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    
    <ComponentRenderer
      v-if="component"
      :component="component"
      :section-id="sectionId"
    />
    
    <div v-else class="component-placeholder">
      <span class="placeholder-icon">⚠️</span>
      <span>Component not found: {{ componentId }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMediaKitStore } from '@/stores/mediaKit'
import ComponentRenderer from './ComponentRenderer.vue'

const props = defineProps({
  componentId: {
    type: String,
    required: true
  },
  component: {
    type: Object,
    default: null
  },
  sectionId: {
    type: String,
    required: true
  },
  column: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['edit', 'duplicate', 'remove'])

const store = useMediaKitStore()
const isHovered = ref(false)

// Show controls on hover or when component is selected
const showControls = computed(() => 
  isHovered.value || store.selectedComponentId === props.componentId
)

// Wrapper classes
const wrapperClass = computed(() => ({
  'component-wrapper--selected': store.selectedComponentId === props.componentId,
  'component-wrapper--editing': store.editingComponentId === props.componentId,
  'component-wrapper--hovering': isHovered.value,
  [`component-wrapper--${props.component?.type}`]: props.component?.type
}))

// Mouse events
function onMouseEnter() {
  isHovered.value = true
  store.setHoveredComponent(props.componentId)
}

function onMouseLeave() {
  isHovered.value = false
  if (store.hoveredComponentId === props.componentId) {
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

/* Component Controls */
.component-controls {
  position: absolute;
  top: -1px;
  right: -1px;
  display: flex;
  gap: 2px;
  background: rgba(0, 0, 0, 0.9);
  padding: 2px;
  border-radius: 4px;
  z-index: 10;
  opacity: 0;
  transform: translateY(-100%);
  transition: all 0.2s ease;
}

.component-wrapper:hover .component-controls {
  opacity: 1;
}

.control-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.control-btn--delete:hover {
  background: rgba(239, 68, 68, 0.5);
  color: #fff;
}

.control-btn svg {
  width: 14px;
  height: 14px;
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
