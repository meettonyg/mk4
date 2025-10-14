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
    <!-- ROOT FIX: Use actualComponent computed for null safety -->
    <ComponentControls
      v-if="showControlsComputed && actualComponent"
      :component-id="componentId || actualComponent.id"
      :component-type="actualComponent.type"
      :index="index"
      :total-components="totalComponents"
    />
    
    <!-- V2 ARCHITECTURE: Direct Component Rendering - NO INTERMEDIATE LAYERS -->
    <!-- ROOT FIX: Use actualComponent computed instead of component prop directly -->
    <component
      v-if="actualComponent && componentMap[actualComponent.type]"
      :is="componentMap[actualComponent.type]"
      :key="componentId || actualComponent.id"
      :component-id="componentId || actualComponent.id"
      :data="actualComponent.data || {}"
      :props="actualComponent.props || {}"
      :settings="actualComponent.settings || {}"
      :is-editing="isEditing"
      :is-selected="isSelected"
      class="component-root"
      :class="`${actualComponent.type}-component`"
    />
    
    <!-- Fallback for unknown component or missing component -->
    <div v-else class="component-placeholder">
      <span class="placeholder-icon">⚠️</span>
      <span v-if="!actualComponent">Component not found: {{ componentId }}</span>
      <span v-else>Unknown component type: {{ actualComponent.type }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { useMediaKitStore } from '@/stores/mediaKit'
import ComponentControls from './builder/ComponentControls.vue'
import DeprecatedComponentPlaceholder from './DeprecatedComponentPlaceholder.vue'

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
  ),
  // Deprecated component placeholder
  'deprecated-placeholder': DeprecatedComponentPlaceholder
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
// ROOT FIX: Added comprehensive null safety to prevent .value errors
const actualComponent = computed(() => {
  try {
    // CRITICAL: Validate props exist before accessing
    if (!props) {
      console.warn('[ComponentWrapper] Props is undefined');
      return null;
    }
    
    // Try component prop first
    if (props.component && typeof props.component === 'object') {
      return props.component;
    }
    
    // Try componentId prop
    if (props.componentId && typeof props.componentId === 'string') {
      // CRITICAL: Validate store and components exist
      if (!store || !store.components) {
        console.warn('[ComponentWrapper] Store or store.components is undefined');
        return null;
      }
      
      const component = store.components[props.componentId];
      
      // CRITICAL: Validate component exists and has required properties
      if (!component) {
        console.warn(`[ComponentWrapper] Component not found: ${props.componentId}`);
        return null;
      }
      
      if (!component.type) {
        console.error(`[ComponentWrapper] Component missing type: ${props.componentId}`, component);
        return null;
      }
      
      return component;
    }
    
    // No valid component data
    return null;
  } catch (error) {
    console.error('[ComponentWrapper] Error in actualComponent computed:', error);
    console.error('[ComponentWrapper] Props:', props);
    console.error('[ComponentWrapper] Store:', store);
    return null;
  }
})

// Computed properties
// ROOT FIX: Added null safety to prevent accessing undefined values
const isSelected = computed(() => {
  try {
    if (!props || !store) return false;
    
    const id = props.componentId || props.component?.id;
    if (!id) return false;
    
    return store.selectedComponentId === id;
  } catch (error) {
    console.error('[ComponentWrapper] Error in isSelected:', error);
    return false;
  }
})

const isEditing = computed(() => {
  try {
    if (!props || !store) return false;
    
    const id = props.componentId || props.component?.id;
    if (!id) return false;
    
    return store.editingComponentId === id;
  } catch (error) {
    console.error('[ComponentWrapper] Error in isEditing:', error);
    return false;
  }
})

// Show controls when hovering or selected
const showControlsComputed = computed(() => {
  try {
    return props.showControls && (isHovered.value || isSelected.value);
  } catch (error) {
    console.error('[ComponentWrapper] Error in showControlsComputed:', error);
    return false;
  }
})

// Wrapper classes
// ROOT FIX: Added null safety for actualComponent.value
const wrapperClass = computed(() => {
  try {
    const classes = {
      'component-wrapper--selected': isSelected.value,
      'component-wrapper--editing': isEditing.value,
      'component-wrapper--hovering': isHovered.value
    };
    
    // CRITICAL: Only add type class if component exists and has type
    if (actualComponent.value && actualComponent.value.type) {
      classes[`component-wrapper--${actualComponent.value.type}`] = true;
    }
    
    return classes;
  } catch (error) {
    console.error('[ComponentWrapper] Error in wrapperClass:', error);
    console.error('[ComponentWrapper] actualComponent:', actualComponent);
    return {};
  }
})

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
