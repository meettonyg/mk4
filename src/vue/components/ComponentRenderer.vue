<template>
  <div 
    class="gmkb-component-wrapper" 
    :data-component-id="componentId"
    :class="{
      'gmkb-component--selected': isSelected,
      'gmkb-component--hovered': isHovered
    }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @click="selectComponent"
  >
    <!-- Component Controls -->
    <div class="gmkb-component-controls" v-if="isHovered || isSelected">
      <span class="component-type-badge">{{ component?.type }}</span>
      <div class="control-buttons">
        <button @click.stop="moveUp" :disabled="isFirst" title="Move Up" class="control-btn">↑</button>
        <button @click.stop="moveDown" :disabled="isLast" title="Move Down" class="control-btn">↓</button>
        <button @click.stop="edit" title="Edit" class="control-btn">✏️</button>
        <button @click.stop="duplicate" title="Duplicate" class="control-btn">📄</button>
        <button @click.stop="remove" title="Delete" class="control-btn control-btn--delete">🗑️</button>
      </div>
    </div>

    <!-- Component Content -->
    <div class="gmkb-component-content">
      <component 
        v-if="componentImplementation && !isLoading"
        :is="componentImplementation" 
        v-bind="componentProps"
        @update="handleUpdate"
      />
      <div v-else-if="isLoading" class="component-loading">
        Loading {{ component.type }} component...
      </div>
      <div v-else-if="loadError" class="component-error">
        Error loading {{ component.type }}: {{ loadError }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';
import UnifiedComponentRegistry from '../../services/UnifiedComponentRegistry';
import FallbackRenderer from './FallbackRenderer.vue';

export default {
  name: 'ComponentRenderer',
  
  props: {
    componentId: {
      type: String,
      required: true
    },
    component: {
      type: Object,
      required: true
    },
    sectionId: {
      type: String,
      default: null
    },
    column: {
      type: Number,
      default: 1
    }
  },
  
  setup(props) {
    const store = useMediaKitStore();
    const componentImplementation = ref(null);
    const isLoading = ref(true);
    const loadError = ref(null);
    const isHovered = ref(false);
    const isSelected = computed(() => store.selectedComponentId === props.componentId);
    
    // Load component dynamically
    const loadComponent = async () => {
      isLoading.value = true;
      loadError.value = null;
      
      try {
        // Get Vue component from unified registry
        const vueComponent = UnifiedComponentRegistry.getVueComponent(props.component.type);
        
        if (vueComponent) {
          componentImplementation.value = vueComponent;
        } else {
          // Fallback to basic renderer
          console.warn(`[ComponentRenderer] Using fallback for '${props.component.type}'`);
          componentImplementation.value = FallbackRenderer;
        }
      } catch (error) {
        console.error(`[ComponentRenderer] Failed to load component '${props.component.type}':`, error);
        loadError.value = error.message;
        componentImplementation.value = FallbackRenderer;
      } finally {
        isLoading.value = false;
      }
    };
    
    // Load on mount
    onMounted(() => {
      loadComponent();
    });
    
    // Reload if component type changes
    watch(() => props.component.type, () => {
      loadComponent();
    });
    
    // Component props to pass down
    const componentProps = computed(() => ({
      componentId: props.componentId,
      data: props.component.data || {},
      settings: props.component.settings || {},
      config: {
        type: props.component.type,
        ...props.component.config
      }
    }));
    
    // Select this component
    const selectComponent = () => {
      store.setSelectedComponent(props.componentId);
    };
    
    // Check if component is first/last using store getters
    const isFirst = computed(() => store.isComponentFirst(props.componentId));
    const isLast = computed(() => store.isComponentLast(props.componentId));
    
    // Component actions
    const moveUp = () => {
      store.moveComponent(props.componentId, 'up');
    };
    
    const moveDown = () => {
      store.moveComponent(props.componentId, 'down');
    };
    
    const edit = () => {
      // ROOT FIX: Directly open edit panel
      store.openEditPanel(props.componentId);
      store.setSelectedComponent(props.componentId);
      console.log('[ComponentRenderer] Edit clicked for:', props.componentId, props.component?.type);
    };
    
    const duplicate = () => {
      store.duplicateComponent(props.componentId);
    };
    
    const remove = () => {
      if (confirm('Delete this component?')) {
        store.removeComponent(props.componentId);
      }
    };
    
    const handleUpdate = (updates) => {
      store.updateComponent(props.componentId, updates);
    };
    
    return {
      componentImplementation,
      componentProps,
      isLoading,
      loadError,
      isFirst,
      isLast,
      isHovered,
      isSelected,
      selectComponent,
      moveUp,
      moveDown,
      edit,
      duplicate,
      remove,
      handleUpdate
    };
  }
};
</script>

<style scoped>
.gmkb-component-wrapper {
  position: relative;
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  transition: all 0.3s;
  cursor: move;
}

.gmkb-component-wrapper:hover {
  border-color: rgba(59, 130, 246, 0.3);
  background: rgba(59, 130, 246, 0.05);
}

.gmkb-component--selected {
  border-color: rgba(59, 130, 246, 0.5) !important;
  background: rgba(59, 130, 246, 0.08) !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

/* Component Controls */
.gmkb-component-controls {
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

.gmkb-component-content {
  min-height: 100px;
  position: relative;
}

.component-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  color: #64748b;
  font-size: 14px;
}

/* Hover outline for component */
.gmkb-component-wrapper:hover .gmkb-component-content::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px dashed #3b82f6;
  border-radius: 4px;
  pointer-events: none;
  opacity: 0.3;
}
</style>
