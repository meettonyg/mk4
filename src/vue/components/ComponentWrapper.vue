<template>
  <div
    class="component-wrapper"
    :class="wrapperClass"
    :id="customId"
    :data-component-id="componentId || component?.id"
    :data-draggable="true"
    data-component-wrapper
    role="region"
    :aria-label="componentAriaLabel"
    :tabindex="showControls && !uiStore.previewMode ? 0 : -1"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @focus="onFocus"
    @blur="onBlur"
    @keydown="handleKeydown"
  >
    <!-- Click-to-edit hint (Carrd-like UX) -->
    <Transition name="fade">
      <div
        v-if="showEditHint"
        class="edit-hint"
        data-builder-only
        @click.stop="handleEditClick"
        role="button"
        aria-label="Click to edit this component"
        tabindex="-1"
      >
        <span class="edit-hint-text" aria-hidden="true">Click to edit</span>
      </div>
    </Transition>

    <!-- Single unified control system -->
    <!-- ROOT FIX: Use actualComponent computed for null safety -->
    <ComponentControls
      v-if="showControlsComputed && actualComponent"
      data-builder-only
      :component-id="componentId || actualComponent.id"
      :component-type="actualComponent.type"
      :index="index"
      :total-components="totalComponents"
    />
    
    <!-- V2 ARCHITECTURE: Direct Component Rendering - NO INTERMEDIATE LAYERS -->
    <!-- ROOT FIX: Use UnifiedComponentRegistry.getVueComponent() for dynamic loading -->
    <component
      v-if="actualComponent && vueComponent"
      :is="vueComponent"
      :key="componentId || actualComponent.id"
      :component-id="componentId || actualComponent.id"
      :data="actualComponent.data || {}"
      :props="actualComponent.props || {}"
      :settings="actualComponent.settings || {}"
      :is-editing="isEditing"
      :is-selected="isSelected"
      :is-builder-mode="isBuilderMode"
      class="component-root"
      :class="componentRootClass"
    />
    
    <!-- Fallback for unknown component or missing component -->
    <div v-else class="component-placeholder">
      <span class="placeholder-icon">⚠️</span>
      <span v-if="!actualComponent">Component not found: {{ componentId }}</span>
      <span v-else-if="!vueComponent">Component type not registered: {{ actualComponent.type }}</span>
      <span v-else>Unknown error loading component: {{ actualComponent.type }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMediaKitStore } from '@/stores/mediaKit'
import { useUIStore } from '@/stores/ui'
import ComponentControls from './builder/ComponentControls.vue'
import UnifiedComponentRegistry from '@/services/UnifiedComponentRegistry'

// ROOT FIX: Eliminated hardcoded componentMap - using UnifiedComponentRegistry instead
// This follows the single source of truth principle and ensures all components
// are loaded consistently via import.meta.glob in UnifiedComponentRegistry

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
const uiStore = useUIStore()
const isHovered = ref(false)
const isFocused = ref(false)

// ROOT FIX: Get Vue component from UnifiedComponentRegistry
// This replaces the hardcoded componentMap and ensures consistency
const vueComponent = computed(() => {
  try {
    if (!actualComponent.value?.type) {
      return null;
    }
    
    // Use UnifiedComponentRegistry to get the Vue component dynamically
    // This auto-discovers components via import.meta.glob
    const component = UnifiedComponentRegistry.getVueComponent(actualComponent.value.type);
    
    if (!component) {
      console.warn(`[ComponentWrapper] No Vue component registered for type: ${actualComponent.value.type}`);
      return null;
    }
    
    return component;
  } catch (error) {
    console.error('[ComponentWrapper] Error getting Vue component:', error);
    return null;
  }
});

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

// Detect if we're in builder mode (not preview mode)
// This allows components to show placeholders when empty
const isBuilderMode = computed(() => {
  return !uiStore.previewMode;
})

// Show controls when hovering or selected (but not in preview mode)
const showControlsComputed = computed(() => {
  try {
    // Hide all controls in preview mode for clean preview
    if (uiStore.previewMode) return false;

    return props.showControls && (isHovered.value || isSelected.value);
  } catch (error) {
    console.error('[ComponentWrapper] Error in showControlsComputed:', error);
    return false;
  }
})

// Show edit hint on hover (subtle Carrd-like prompt)
const showEditHint = computed(() => {
  try {
    // Only show in edit mode, not in preview
    if (uiStore.previewMode) return false;
    if (!props.showControls) return false;

    // Show on hover/focus but not when already selected/editing
    return (isHovered.value || isFocused.value) && !isSelected.value && !isEditing.value;
  } catch (error) {
    return false;
  }
})

// Accessible label for the component
const componentAriaLabel = computed(() => {
  if (!actualComponent.value) return 'Media kit component';
  const type = actualComponent.value.type || 'component';
  const name = actualComponent.value.data?.name ||
               actualComponent.value.data?.title ||
               type.replace(/-/g, ' ');
  return `${name} - ${type} component. ${props.showControls && !uiStore.previewMode ? 'Press Enter to edit.' : ''}`;
})

// Handle clicking the edit hint - use same logic as ComponentControls edit button
function handleEditClick() {
  const id = props.componentId || props.component?.id;
  if (id) {
    // Open component editor in sidebar (same as ComponentControls edit button)
    uiStore.openComponentEditor(id);
    console.log('[ComponentWrapper] Opening component editor for:', id);
  }
}

// ROOT FIX: Custom CSS ID from settings
const customId = computed(() => {
  try {
    if (!actualComponent.value) return null;
    const customCssId = actualComponent.value.settings?.advanced?.custom?.cssId;
    return customCssId || null;
  } catch (error) {
    console.error('[ComponentWrapper] Error in customId:', error);
    return null;
  }
});

// Wrapper classes
// ROOT FIX: Added null safety for actualComponent.value + custom CSS classes
// FIX: Only apply builder UI classes (hover/selected/editing borders) when showControls is true
const wrapperClass = computed(() => {
  try {
    // Only show builder UI borders when:
    // 1. showControls is enabled (edit mode)
    // 2. NOT in preview mode (uiStore.previewMode is false)
    // This prevents borders from appearing in preview/published mode
    const showBuilderUI = props.showControls && !uiStore.previewMode;
    const classes = {
      'component-wrapper--selected': showBuilderUI && isSelected.value,
      'component-wrapper--editing': showBuilderUI && isEditing.value,
      'component-wrapper--hovering': showBuilderUI && isHovered.value
    };
    
    // CRITICAL: Only add type class if component exists and has type
    if (actualComponent.value && actualComponent.value.type) {
      classes[`component-wrapper--${actualComponent.value.type}`] = true;
    }
    
    // ROOT FIX: Add custom CSS classes from settings
    const customClasses = actualComponent.value?.settings?.advanced?.custom?.cssClasses;
    if (customClasses) {
      // Handle both string and array formats
      const classArray = Array.isArray(customClasses) 
        ? customClasses 
        : customClasses.split(' ').filter(c => c.trim());
      
      classArray.forEach(className => {
        if (className && className.trim()) {
          classes[className.trim()] = true;
        }
      });
    }
    
    return classes;
  } catch (error) {
    console.error('[ComponentWrapper] Error in wrapperClass:', error);
    console.error('[ComponentWrapper] actualComponent:', actualComponent);
    return {};
  }
});

// ROOT FIX: Component root classes (type + custom classes)
const componentRootClass = computed(() => {
  try {
    if (!actualComponent.value) return '';
    
    const classes = [`${actualComponent.value.type}-component`];
    
    // ROOT FIX: Custom classes also apply to component root for more targeting flexibility
    const customClasses = actualComponent.value.settings?.advanced?.custom?.cssClasses;
    if (customClasses) {
      const classArray = Array.isArray(customClasses) 
        ? customClasses 
        : customClasses.split(' ').filter(c => c.trim());
      
      classes.push(...classArray.map(c => c.trim()).filter(Boolean));
    }
    
    return classes.join(' ');
  } catch (error) {
    console.error('[ComponentWrapper] Error in componentRootClass:', error);
    return actualComponent.value?.type ? `${actualComponent.value.type}-component` : '';
  }
})

// Mouse events
function onMouseEnter() {
  console.log('🟢 MOUSE ENTER - Component:', props.componentId || props.component?.id)
  console.log('   showControls prop:', props.showControls)
  console.log('   actualComponent exists:', !!actualComponent.value)
  isHovered.value = true
  console.log('   isHovered set to:', isHovered.value)
  console.log('   showControlsComputed:', showControlsComputed.value)
  const id = props.componentId || props.component?.id
  if (id) {
    store.setHoveredComponent(id)
  }
}

function onMouseLeave(event) {
  console.log('🔴 MOUSE LEAVE - Component:', props.componentId || props.component?.id)
  // ROOT FIX: Don't remove hover if mouse is over the controls
  // Check if the mouse is moving to the controls element
  const controls = event.currentTarget.querySelector('.component-controls')
  console.log('   Controls element exists:', !!controls)
  console.log('   Related target:', event.relatedTarget)
  if (controls && event.relatedTarget && controls.contains(event.relatedTarget)) {
    console.log('   ✅ Keeping hover - mouse over controls')
    // Mouse moved to controls, keep hover state
    return
  }

  console.log('   ❌ Removing hover')
  isHovered.value = false
  const id = props.componentId || props.component?.id
  if (id && store.hoveredComponentId === id) {
    store.setHoveredComponent(null)
  }
}

// Focus events for keyboard accessibility
function onFocus() {
  isFocused.value = true
  const id = props.componentId || props.component?.id
  if (id) {
    store.setHoveredComponent(id)
  }
}

function onBlur() {
  isFocused.value = false
  const id = props.componentId || props.component?.id
  if (id && store.hoveredComponentId === id) {
    store.setHoveredComponent(null)
  }
}

// Keyboard navigation
function handleKeydown(event) {
  // Only handle keyboard in edit mode
  if (uiStore.previewMode || !props.showControls) return

  const id = props.componentId || props.component?.id
  if (!id) return

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      // Open component editor in sidebar (same as ComponentControls edit button)
      uiStore.openComponentEditor(id)
      break
    case 'Escape':
      event.preventDefault()
      if (isSelected.value || isEditing.value) {
        store.selectComponent(null)
      }
      break
    case 'Delete':
    case 'Backspace':
      if (event.metaKey || event.ctrlKey) {
        event.preventDefault()
        emit('remove', id)
      }
      break
    case 'd':
      if (event.metaKey || event.ctrlKey) {
        event.preventDefault()
        emit('duplicate', id)
      }
      break
  }
}
</script>

<style scoped>
.component-wrapper {
  position: relative;
  transition: all 0.3s ease;
  border-radius: var(--radius-md, 6px);
  overflow: visible; /* ROOT FIX: Allow absolutely positioned controls to render outside bounds */
  /* Margin applied via inline styles from ComponentStyleService */
  /* No default margins - all spacing controlled by component settings */
  isolation: isolate; /* Create stacking context for z-index to work properly */
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

/* Focus styles for keyboard navigation */
.component-wrapper:focus {
  outline: 2px solid var(--primary-color, #3b82f6);
  outline-offset: 2px;
}

.component-wrapper:focus:not(:focus-visible) {
  outline: none;
}

.component-wrapper:focus-visible {
  outline: 2px solid var(--primary-color, #3b82f6);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

/* V2 ARCHITECTURE: Component root handles all visual styles */
.component-root {
  /* All styling applied via inline styles from ComponentStyleService */
  /* Background, padding, border, typography, effects, etc. */
  display: block;
  border-radius: 8px;
  overflow: hidden;
  /* Ensure component content stays below edit-hint overlay (z-index: 100) */
  position: relative;
  z-index: 1;
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

/* Edit Hint (Carrd-like UX) - Full overlay for better clickability */
.edit-hint {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100; /* Must be above component content but below ComponentControls (z-index: 10000) */
  pointer-events: auto;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.02); /* Subtle overlay to indicate clickable area */
  transition: background 0.2s ease;
}

.edit-hint:hover {
  background: rgba(99, 102, 241, 0.05);
}

.edit-hint-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(99, 102, 241, 0.95);
  color: white;
  font-size: 13px;
  font-weight: 500;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  white-space: nowrap;
  transition: all 0.2s ease;
}

.edit-hint:hover .edit-hint-text {
  background: rgba(79, 70, 229, 1);
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5);
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}

/* Touch-friendly styles */
@media (hover: none) and (pointer: coarse) {
  /* Larger touch target for edit hint */
  .edit-hint-text {
    padding: 12px 20px;
    font-size: 14px;
    min-height: 44px;
  }

  /* Active state for touch feedback */
  .edit-hint:active .edit-hint-text {
    transform: scale(0.95);
    background: rgba(79, 70, 229, 1);
  }

  /* Remove hover transforms on touch */
  .edit-hint:hover .edit-hint-text {
    transform: none;
  }

  /* Larger tap targets for component wrapper */
  .component-wrapper {
    min-height: 44px;
  }
}
</style>
