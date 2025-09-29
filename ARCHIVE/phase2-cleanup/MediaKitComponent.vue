<template>
  <div 
    class="gmkb-component"
    :class="`gmkb-component--${component.type}`"
    :data-component-id="component.id"
    @mouseenter="showControls = true"
    @mouseleave="showControls = false"
    @click="selectComponent"
  >
    <!-- Integrated Component Controls -->
    <transition name="fade">
      <div v-if="showControls || isSelected" class="gmkb-component-controls">
        <button 
          @click.stop="moveUp"
          :disabled="isFirst"
          class="control-btn control-btn--move-up"
          title="Move Up"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
        <button 
          @click.stop="moveDown"
          :disabled="isLast"
          class="control-btn control-btn--move-down"
          title="Move Down"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <button 
          @click.stop="editComponent"
          class="control-btn control-btn--edit"
          title="Edit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button 
          @click.stop="duplicateComponent"
          class="control-btn control-btn--duplicate"
          title="Duplicate"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        <button 
          @click.stop="deleteComponent"
          class="control-btn control-btn--delete"
          title="Delete"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </transition>

    <!-- Component Content -->
    <div class="gmkb-component__content">
      <!-- Dynamic component rendering based on type -->
      <component 
        :is="componentRenderer"
        v-bind="componentProps"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent, h, onMounted, onUnmounted } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';

// Props
const props = defineProps({
  component: {
    type: Object,
    required: true
  },
  sectionId: {
    type: String,
    required: true
  }
});

// Store
const store = useMediaKitStore();

// State
const showControls = ref(false);

// Computed
const isSelected = computed(() => store.selectedComponentId === props.component.id);
const isFirst = computed(() => store.isComponentFirst(props.component.id));
const isLast = computed(() => store.isComponentLast(props.component.id));

// Dynamic component loading from self-contained components
const componentRenderer = computed(() => {
  // ROOT FIX: Load the actual self-contained component renderer
  // These components already know how to fetch Pods data
  const type = props.component.type;
  
  // Check if we have a Vue component for this type
  const vueComponents = window.gmkbVueComponents || {};
  if (vueComponents[type]) {
    // Use the discovered Vue component
    return {
      name: `${type}-component`,
      setup() {
        const componentRef = ref(null);
        
        onMounted(async () => {
          if (!componentRef.value) return;
          
          // Get the renderer module
          const rendererModule = vueComponents[type];
          if (rendererModule && rendererModule.render) {
            // Render the self-contained component
            const componentData = {
              ...props.component,
              id: props.component.id,
              componentId: props.component.id
            };
            
            // The renderer handles Pods data fetching internally
            rendererModule.render(componentData, componentRef.value);
          }
        });
        
        onUnmounted(() => {
          if (componentRef.value) {
            const rendererModule = vueComponents[type];
            if (rendererModule && rendererModule.destroy) {
              rendererModule.destroy(componentRef.value);
            }
          }
        });
        
        return () => h('div', { 
          ref: componentRef,
          class: 'self-contained-component-mount'
        });
      }
    };
  }
  
  // Fallback for components without Vue renderers
  return {
    name: 'FallbackComponent',
    setup() {
      return () => h('div', {
        style: {
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#94a3b8'
        }
      }, `${type} component (legacy renderer)`);
    }
  };
});

// Component props to pass to renderer
const componentProps = computed(() => ({
  id: props.component.id,
  data: props.component.data || {},
  props: props.component.props || {},
  settings: props.component.settings || {}
}));

// Methods
const selectComponent = () => {
  store.setSelectedComponent(props.component.id);
};

const moveUp = () => {
  store.moveComponent(props.component.id, 'up');
};

const moveDown = () => {
  store.moveComponent(props.component.id, 'down');
};

const editComponent = () => {
  // ROOT FIX: Dispatch event to open the component's design panel
  // The self-contained component should handle its own editing
  const componentEl = document.querySelector(`[data-component-id="${props.component.id}"]`);
  if (componentEl) {
    // Try to trigger the component's own edit functionality
    const editEvent = new CustomEvent('gmkb:open-vue-panel', {
      detail: { componentId: props.component.id }
    });
    document.dispatchEvent(editEvent);
  }
  
  // Also open our edit panel as fallback
  store.openEditPanel(props.component.id);
};

const duplicateComponent = () => {
  store.duplicateComponent(props.component.id);
};

const deleteComponent = () => {
  if (confirm('Delete this component?')) {
    store.removeComponent(props.component.id);
  }
};
</script>

<style scoped>
.gmkb-component {
  position: relative;
  margin-bottom: 15px;
  transition: all 0.2s;
}

.gmkb-component:hover {
  outline: 2px solid rgba(59, 130, 246, 0.2);
  outline-offset: 2px;
}

.gmkb-component.is-selected {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Integrated Component Controls */
.gmkb-component-controls {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.98);
  padding: 4px;
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(226, 232, 240, 0.8);
  z-index: 100;
}

.control-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.15s ease;
  padding: 0;
}

.control-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #1e293b;
  transform: translateY(-1px);
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.control-btn svg {
  width: 16px;
  height: 16px;
}

/* Specific button hover colors */
.control-btn--move-up:hover:not(:disabled),
.control-btn--move-down:hover:not(:disabled) {
  background: #faf5ff;
  border-color: #c4b5fd;
  color: #7c3aed;
}

.control-btn--edit:hover:not(:disabled) {
  background: #f0f9ff;
  border-color: #7dd3fc;
  color: #0284c7;
}

.control-btn--duplicate:hover:not(:disabled) {
  background: #f0fdf4;
  border-color: #86efac;
  color: #16a34a;
}

.control-btn--delete:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #dc2626;
}

/* Content */
.gmkb-component__content {
  position: relative;
  z-index: 1;
}

/* Self-contained component mount */
.self-contained-component-mount {
  width: 100%;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
