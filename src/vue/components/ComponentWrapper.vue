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
    
    <!-- V2 ARCHITECTURE: Direct Component Rendering - NO INTERMEDIATE LAYERS -->
    <component
      v-if="component && componentMap[component.type]"
      :is="componentMap[component.type]"
      :key="componentId || component.id"
      :component-id="componentId || component.id"
      :data="component.data"
      :props="component.props"
      :settings="component.settings"
      :is-editing="isEditing"
      :is-selected="isSelected"
      class="component-root"
      :class="`${component.type}-component`"
    />
    
    <!-- Fallback for unknown component or missing component -->
    <div v-else class="component-placeholder">
      <span class="placeholder-icon">⚠️</span>
      <span v-if="!component">Component not found: {{ componentId }}</span>
      <span v-else>Unknown component type: {{ component.type }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { useMediaKitStore } from '@/stores/mediaKit'
import ComponentControls from './builder/ComponentControls.vue'

// Import all component types directly
// Using @components alias defined in vite.config.js
const componentMap = {
  // V2 Components - Following simplified architecture
  'biography': defineAsyncComponent(() => 
    import('@components/biography/Biography.vue')
  ),
  'hero': defineAsyncComponent(() => 
    import('@components/hero/Hero.vue')
  ),
  'guest-intro': defineAsyncComponent(() => 
    import('@components/guest-intro/GuestIntro.vue')
  ),
  'topics': defineAsyncComponent(() => 
    import('@components/topics/Topics.vue')
  ),
  'stats': defineAsyncComponent(() => 
    import('@components/stats/Stats.vue')
  ),
  'contact': defineAsyncComponent(() => 
    import('@components/contact/Contact.vue')
  ),
  // Batch 1: Simple Components
  'social': defineAsyncComponent(() => 
    import('@components/social/Social.vue')
  ),
  'call-to-action': defineAsyncComponent(() => 
    import('@components/call-to-action/CallToAction.vue')
  ),
  'logo-grid': defineAsyncComponent(() => 
    import('@components/logo-grid/LogoGrid.vue')
  ),
  // Batch 2: Medium Components
  'testimonials': defineAsyncComponent(() => 
    import('@components/testimonials/Testimonials.vue')
  ),
  'questions': defineAsyncComponent(() => 
    import('@components/questions/Questions.vue')
  ),
  'video-intro': defineAsyncComponent(() => 
    import('@components/video-intro/VideoIntro.vue')
  ),
  'topics-questions': defineAsyncComponent(() => 
    import('@components/topics-questions/TopicsQuestions.vue')
  ),
  // Batch 3: Complex Components
  'photo-gallery': defineAsyncComponent(() => 
    import('@components/photo-gallery/PhotoGallery.vue')
  ),
  'podcast-player': defineAsyncComponent(() => 
    import('@components/podcast-player/PodcastPlayer.vue')
  ),
  'booking-calendar': defineAsyncComponent(() => 
    import('@components/booking-calendar/BookingCalendar.vue')
  )
}

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
  /* Margin applied via inline styles from ComponentStyleService */
  /* No default margins - all spacing controlled by component settings */
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

/* V2 ARCHITECTURE: Component root handles all visual styles */
.component-root {
  /* All styling applied via inline styles from ComponentStyleService */
  /* Background, padding, border, typography, effects, etc. */
  display: block;
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
