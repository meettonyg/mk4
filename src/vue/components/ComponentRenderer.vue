<template>
  <div class="gmkb-component-wrapper" :data-component-id="component.id">
    <!-- Component Controls -->
    <div class="gmkb-component-controls" v-if="showControls">
      <button @click="moveUp" :disabled="isFirst" title="Move Up">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M7 14l5-5 5 5" stroke="currentColor" fill="none" stroke-width="2"/>
        </svg>
      </button>
      <button @click="moveDown" :disabled="isLast" title="Move Down">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M7 10l5 5 5-5" stroke="currentColor" fill="none" stroke-width="2"/>
        </svg>
      </button>
      <button @click="edit" title="Edit">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" fill="none" stroke-width="2"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" fill="none" stroke-width="2"/>
        </svg>
      </button>
      <button @click="duplicate" title="Duplicate">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" fill="none" stroke-width="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" fill="none" stroke-width="2"/>
        </svg>
      </button>
      <button @click="remove" title="Delete">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" stroke="currentColor" fill="none" stroke-width="2"/>
        </svg>
      </button>
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
    component: {
      type: Object,
      required: true
    },
    sectionId: {
      type: String,
      default: null
    },
    showControls: {
      type: Boolean,
      default: true
    }
  },
  
  setup(props) {
    const store = useMediaKitStore();
    const componentImplementation = ref(null);
    const isLoading = ref(true);
    const loadError = ref(null);
    
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
      componentId: props.component.id,
      data: props.component.data || {},
      settings: props.component.settings || {},
      config: {
        type: props.component.type,
        ...props.component.config
      }
    }));
    
    // Check if component is first/last
    const isFirst = computed(() => {
      const components = store.orderedComponents;
      return components.length > 0 && components[0]?.id === props.component.id;
    });
    
    const isLast = computed(() => {
      const components = store.orderedComponents;
      return components.length > 0 && components[components.length - 1]?.id === props.component.id;
    });
    
    // Component actions
    const moveUp = () => {
      store.moveComponent(props.component.id, 'up');
    };
    
    const moveDown = () => {
      store.moveComponent(props.component.id, 'down');
    };
    
    const edit = () => {
      store.setSelectedComponent(props.component.id);
      // Emit event for design panel
      window.dispatchEvent(new CustomEvent('gmkb:open-design-panel', {
        detail: { componentId: props.component.id }
      }));
    };
    
    const duplicate = () => {
      store.duplicateComponent(props.component.id);
    };
    
    const remove = () => {
      if (confirm('Delete this component?')) {
        store.removeComponent(props.component.id);
      }
    };
    
    const handleUpdate = (updates) => {
      store.updateComponent(props.component.id, updates);
    };
    
    return {
      componentImplementation,
      componentProps,
      isLoading,
      loadError,
      isFirst,
      isLast,
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
  margin-bottom: 20px;
}

.gmkb-component-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
  background: rgba(30, 41, 59, 0.95);
  padding: 4px;
  border-radius: 6px;
  backdrop-filter: blur(4px);
}

.gmkb-component-wrapper:hover .gmkb-component-controls {
  opacity: 1;
}

.gmkb-component-controls button {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 4px;
  color: #94a3b8;
  padding: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.gmkb-component-controls button:hover:not(:disabled) {
  background: #334155;
  color: #f1f5f9;
  border-color: #475569;
}

.gmkb-component-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
