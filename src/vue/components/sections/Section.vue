<template>
  <div 
    class="gmkb-section" 
    :class="sectionClass"
    :data-section-id="sectionId"
  >
    <SectionControls
      v-if="isEditing"
      data-builder-only
      @duplicate="$emit('duplicate')"
      @remove="$emit('remove')"
      @settings="openSectionSettings"
    />

    <div class="section-grid" :class="gridClass">
      <TransitionGroup name="component-move">
        <div 
          v-for="(column, index) in columns"
          :key="`col-${index}`"
          class="section-column"
          :data-column="index + 1"
          :data-section-id="sectionId"
          @drop="onDrop($event, index + 1)"
          @dragover.prevent
          @dragenter.prevent
        >
          <draggable
            v-model="column.components"
            group="components"
            :component-data="{ 
              class: 'column-components',
              'data-section-id': sectionId,
              'data-column': index + 1 
            }"
            item-key="id"
            @start="onDragStart"
            @end="onDragEnd"
            @change="onChange"
            :animation="200"
            :ghost-class="'component-ghost'"
            :drag-class="'component-drag'"
          >
            <template #item="{ element }">
              <ComponentWrapper
                :key="element.id"
                :component-id="element.id"
                :component="getComponent(element.id)"
                :section-id="sectionId"
                :column="index + 1"
                @duplicate="duplicateComponent(element.id)"
                @remove="removeComponent(element.id)"
                @edit="editComponent(element.id)"
              />
            </template>
          </draggable>

          <div
            v-if="column.components.length === 0"
            class="drop-placeholder gmkb-section__content--droppable"
            data-builder-only
            :data-section-id="sectionId"
            :data-column="index + 1"
          >
            <svg class="drop-icon" viewBox="0 0 24 24" width="32" height="32">
              <path d="M12 2v20M2 12h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>Drop components here</span>
          </div>
        </div>
      </TransitionGroup>
    </div>


  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useMediaKitStore } from '@/stores/mediaKit'
import { useUIStore } from '@/stores/ui'
import draggable from 'vuedraggable'
import SectionControls from './SectionControls.vue'
import ComponentWrapper from '../ComponentWrapper.vue'

const props = defineProps({
  sectionId: {
    type: String,
    required: true
  },
  section: {
    type: Object,
    required: true
  },
  isEditing: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['duplicate', 'remove', 'update'])

const store = useMediaKitStore()
const uiStore = useUIStore()

// Compute section classes
const sectionClass = computed(() => ({
  'gmkb-section--editing': props.isEditing,
  'gmkb-section--dragging': store.isDragging,
  [`gmkb-section--${props.section.layout || props.section.type}`]: true
}))

// Compute grid classes based on layout
const gridClass = computed(() => {
  const layout = props.section.layout || props.section.type || 'full_width'
  return {
    'grid-full': layout === 'full_width',
    'grid-two': layout === 'two_column',
    'grid-three': layout === 'three_column'
  }
})

// Compute columns based on layout with reactive component arrays
const columns = computed(() => {
  const layout = props.section.layout || props.section.type || 'full_width'
  
  if (layout === 'full_width') {
    return [{
      components: props.section.components?.map(id => ({ id })) || []
    }]
  } else if (layout === 'two_column') {
    return [
      { components: (props.section.columns?.['1'] || []).map(id => ({ id })) },
      { components: (props.section.columns?.['2'] || []).map(id => ({ id })) }
    ]
  } else if (layout === 'three_column') {
    return [
      { components: (props.section.columns?.['1'] || []).map(id => ({ id })) },
      { components: (props.section.columns?.['2'] || []).map(id => ({ id })) },
      { components: (props.section.columns?.['3'] || []).map(id => ({ id })) }
    ]
  }
  
  return [{ components: [] }]
})

// Get component data
function getComponent(componentId) {
  return store.components[componentId]
}

// Handle drag start
function onDragStart(evt) {
  store.isDragging = true
  console.log('🎯 Drag started in section', props.sectionId)
}

// Handle drag end
function onDragEnd(evt) {
  store.isDragging = false
  console.log('✅ Drag ended in section', props.sectionId)
}

// Handle vuedraggable change events
function onChange(evt) {
  console.log('Section change:', evt)
  
  // Update store based on the change
  if (evt.added) {
    // Component was added to this column
    const { element, newIndex } = evt.added
    const columnIndex = parseInt(evt.to.dataset.column)
    
    // Add component to section in store
    store.moveComponentToSection(element.id, props.sectionId, columnIndex)
  } else if (evt.removed) {
    // Component was removed from this column
    const { element } = evt.removed
    console.log('Component removed:', element.id)
  } else if (evt.moved) {
    // Component was reordered within column
    console.log('Component moved within column')
    store._trackChange()
  }
}

// Handle native drop for components from sidebar
function onDrop(event, columnIndex) {
  event.preventDefault()
  
  // Get component type from drag data
  const componentType = event.dataTransfer.getData('component-type') || 
                       event.dataTransfer.getData('text/plain')
  
  if (componentType && componentType !== 'new-component') {
    console.log(`🎯 Dropping ${componentType} into section ${props.sectionId}, column ${columnIndex}`)
    
    // Add new component
    const componentId = store.addComponent({
      type: componentType,
      sectionId: props.sectionId,
      column: columnIndex
    })
    
    if (componentId) {
      console.log(`✅ Added component ${componentId} to column ${columnIndex}`)
      
      // Show feedback
      if (window.showToast) {
        window.showToast(`Added ${componentType} to column ${columnIndex}`, 'success')
      }
    }
  }
  
  // Clean up visual feedback
  event.target.classList.remove('drag-over')
}

// Component operations
function duplicateComponent(componentId) {
  store.duplicateComponent(componentId)
}

function removeComponent(componentId) {
  if (confirm('Remove this component?')) {
    store.removeComponent(componentId)
  }
}

function editComponent(componentId) {
  store.openComponentEditor(componentId)
}

// ROOT FIX: Open section editor in sidebar (Elementor-style)
function openSectionSettings() {
  console.log('🔴🔴🔴 SECTION BUTTON CLICKED! 🔴🔴🔴');
  console.log('   Section ID:', props.sectionId);
  console.log('   UI Store:', uiStore);
  console.log('   UI Store method exists?', typeof uiStore.openSectionEditor);
  
  uiStore.openSectionEditor(props.sectionId)
  console.log('✅ Section: Opening section editor for:', props.sectionId)
}
</script>

<style scoped>
.gmkb-section {
  margin-bottom: var(--spacing-lg, 20px);
  padding: var(--spacing-lg, 20px);
  background: var(--section-bg, rgba(255, 255, 255, 0.02));
  border-radius: var(--radius-lg, 8px);
  position: relative;
  transition: all 0.3s ease;
}

.gmkb-section:hover {
  background: var(--section-hover-bg, rgba(255, 255, 255, 0.04));
}

.gmkb-section--dragging {
  background: var(--section-drag-bg, rgba(59, 130, 246, 0.05));
}

/* Section Grid */
.section-grid {
  display: grid;
  gap: var(--spacing-md, 16px);
  min-height: 100px;
}

.grid-full {
  grid-template-columns: 1fr;
}

.grid-two {
  grid-template-columns: repeat(2, 1fr);
}

@media (max-width: 768px) {
  .grid-two {
    grid-template-columns: 1fr;
  }
}

.grid-three {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 1024px) {
  .grid-three {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .grid-three {
    grid-template-columns: 1fr;
  }
}

/* Columns */
.section-column {
  min-height: 100px;
  padding: var(--spacing-sm, 8px);
  border: 2px dashed transparent;
  border-radius: var(--radius-md, 6px);
  transition: all 0.3s ease;
}

.section-column.drag-over,
.gmkb-section__content--droppable.drag-over {
  border-color: var(--primary-color, #3b82f6);
  background: var(--drag-over-bg, rgba(59, 130, 246, 0.05));
}

/* Drop Placeholder */
.drop-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl, 40px);
  border: 2px dashed var(--border-color, rgba(255, 255, 255, 0.1));
  border-radius: var(--radius-md, 6px);
  color: var(--text-muted, #64748b);
  text-align: center;
  min-height: 120px;
  transition: all 0.3s ease;
}

.drop-placeholder:hover {
  border-color: var(--primary-color, #3b82f6);
  background: var(--hover-bg, rgba(59, 130, 246, 0.05));
  color: var(--primary-color, #3b82f6);
}

.drop-icon {
  opacity: 0.4;
  margin-bottom: 8px;
}

.drop-placeholder:hover .drop-icon {
  opacity: 0.8;
}

/* Component animations */
.component-move-move,
.component-move-enter-active,
.component-move-leave-active {
  transition: all 0.3s ease;
}

.component-move-enter-from,
.component-move-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Drag states */
.component-ghost {
  opacity: 0.5;
  background: var(--ghost-bg, rgba(59, 130, 246, 0.1));
}

.component-drag {
  opacity: 0;
}

/* Column components container */
.column-components {
  min-height: 50px;
}
</style>
