<template>
  <div 
    class="component-wrapper"
    :class="[
      `component-type-${component?.type}`,
      { 'component-selected': isSelected },
      { 'component-hovered': isHovered }
    ]"
    :data-component-id="componentId"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @click="selectComponent"
  >
    <!-- Component Controls -->
    <div v-if="isHovered" class="component-controls">
      <span class="component-type-badge">{{ component?.type }}</span>
      <div class="control-buttons">
        <button 
          @click.stop="moveComponent('up')"
          class="control-btn"
          title="Move Up"
          :disabled="isFirst"
        >↑</button>
        <button 
          @click.stop="moveComponent('down')"
          class="control-btn"
          title="Move Down"
          :disabled="isLast"
        >↓</button>
        <button 
          @click.stop="duplicateComponent"
          class="control-btn"
          title="Duplicate"
        >📄</button>
        <button 
          @click.stop="editComponent"
          class="control-btn"
          title="Edit"
        >✏️</button>
        <button 
          @click.stop="deleteComponent"
          class="control-btn control-btn--delete"
          title="Delete"
        >🗑️</button>
      </div>
    </div>

    <!-- Component Content -->
    <div class="component-content">
      <ComponentRenderer 
        v-if="component"
        :component="component"
        :component-id="componentId"
      />
      <div v-else class="component-placeholder">
        <span class="placeholder-icon">⚠️</span>
        <span>Component not found</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';
import ComponentRenderer from './ComponentRenderer.vue';

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
});

const store = useMediaKitStore();

// Local state
const isHovered = ref(false);

// Computed properties
const isSelected = computed(() => store.selectedComponentId === props.componentId);
const isFirst = computed(() => store.isComponentFirst(props.componentId));
const isLast = computed(() => store.isComponentLast(props.componentId));

// Methods
const selectComponent = () => {
  store.setSelectedComponent(props.componentId);
};

const moveComponent = (direction) => {
  store.moveComponent(props.componentId, direction);
  
  // Dispatch event for legacy systems
  document.dispatchEvent(new CustomEvent(`gmkb:component-move-${direction}-requested`, {
    detail: { componentId: props.componentId }
  }));
};

const duplicateComponent = () => {
  const newId = store.duplicateComponent(props.componentId);
  
  // Dispatch event for legacy systems
  document.dispatchEvent(new CustomEvent('gmkb:component-duplicated', {
    detail: { 
      originalId: props.componentId, 
      newId 
    }
  }));
};

const editComponent = () => {
  store.openEditPanel(props.componentId);
  
  // Dispatch event for design panel
  document.dispatchEvent(new CustomEvent('gmkb:component-edit-requested', {
    detail: { componentId: props.componentId }
  }));
};

const deleteComponent = () => {
  if (confirm('Delete this component?')) {
    store.removeComponent(props.componentId);
    
    // Dispatch event for legacy systems
    document.dispatchEvent(new CustomEvent('gmkb:component-delete-requested', {
      detail: { 
        componentId: props.componentId,
        skipConfirmation: true 
      }
    }));
  }
};
</script>

<style scoped>
.component-wrapper {
  position: relative;
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  transition: all 0.3s;
  cursor: move;
}

.component-wrapper:hover {
  border-color: rgba(59, 130, 246, 0.3);
  background: rgba(59, 130, 246, 0.05);
}

.component-selected {
  border-color: rgba(59, 130, 246, 0.5) !important;
  background: rgba(59, 130, 246, 0.08) !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

/* Component Controls */
.component-controls {
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 6px 6px 0 0;
  z-index: 10;
}

.component-type-badge {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #3b82f6;
}

.control-buttons {
  display: flex;
  gap: 4px;
}

.control-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.control-btn--delete:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
}

/* Component Content */
.component-content {
  padding: 16px;
}

/* Placeholder */
.component-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px;
  color: #94a3b8;
}

.placeholder-icon {
  font-size: 24px;
}

/* Dragging States */
.sortable-ghost {
  opacity: 0.5;
}

.sortable-drag {
  opacity: 0 !important;
}

.sortable-chosen {
  background: rgba(59, 130, 246, 0.1);
}
</style>
