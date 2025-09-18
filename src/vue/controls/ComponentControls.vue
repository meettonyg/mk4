<template>
  <Teleport to="body">
    <div 
      v-if="shouldShow"
      class="gmkb-component-controls"
      :style="controlStyles"
      @click.stop
    >
      <button 
        class="control-btn control-btn--move-up"
        @click="handleAction('move-up')"
        :disabled="isFirst"
        title="Move Up"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="19" x2="12" y2="5"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
      </button>
      
      <button 
        class="control-btn control-btn--move-down"
        @click="handleAction('move-down')"
        :disabled="isLast"
        title="Move Down"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <polyline points="19 12 12 19 5 12"></polyline>
        </svg>
      </button>
      
      <button 
        class="control-btn control-btn--edit"
        @click="handleAction('edit')"
        title="Edit"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </button>
      
      <button 
        class="control-btn control-btn--duplicate"
        @click="handleAction('duplicate')"
        title="Duplicate"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </button>
      
      <button 
        class="control-btn control-btn--delete"
        @click="handleAction('delete')"
        title="Delete"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  </Teleport>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

export default {
  name: 'ComponentControls',
  
  props: {
    component: {
      type: Object,
      required: true
    },
    isHovered: {
      type: Boolean,
      default: false
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['action'],
  
  setup(props, { emit }) {
    const elementPosition = ref({ top: 0, left: 0, width: 0 });
    const shouldShow = ref(false);
    
    // Check if this is first or last component in its section
    const isFirst = computed(() => {
      const state = window.GMKB?.stateManager?.getState();
      if (!state) return true;
      
      // If component is in a section
      if (props.component.sectionId) {
        const section = state.sections?.find(s => s.section_id === props.component.sectionId);
        if (section?.components) {
          return section.components[0] === props.component.id;
        }
      }
      
      // If component is in layout
      if (state.layout?.length > 0) {
        return state.layout[0] === props.component.id;
      }
      
      return true;
    });
    
    const isLast = computed(() => {
      const state = window.GMKB?.stateManager?.getState();
      if (!state) return true;
      
      // If component is in a section
      if (props.component.sectionId) {
        const section = state.sections?.find(s => s.section_id === props.component.sectionId);
        if (section?.components) {
          return section.components[section.components.length - 1] === props.component.id;
        }
      }
      
      // If component is in layout
      if (state.layout?.length > 0) {
        return state.layout[state.layout.length - 1] === props.component.id;
      }
      
      return true;
    });
    
    // Calculate control position (right-aligned at top)
    const controlStyles = computed(() => {
      return {
        position: 'fixed',
        top: `${elementPosition.value.top + 8}px`,
        right: `${window.innerWidth - (elementPosition.value.left + elementPosition.value.width) + 8}px`,
        zIndex: 1002
      };
    });
    
    // Update element position
    const updatePosition = () => {
      const element = document.querySelector(`[data-component-id="${props.component.id}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        elementPosition.value = {
          top: rect.top,
          left: rect.left,
          width: rect.width
        };
      }
    };
    
    // Watch for hover/selection changes
    watch([() => props.isHovered, () => props.isSelected], ([hovered, selected]) => {
      shouldShow.value = hovered || selected;
      if (shouldShow.value) {
        updatePosition();
      }
    });
    
    // Update position on scroll/resize
    const handleScroll = () => {
      if (shouldShow.value) {
        updatePosition();
      }
    };
    
    // Handle control actions
    const handleAction = (action) => {
      emit('action', { 
        action, 
        componentId: props.component.id 
      });
    };
    
    onMounted(() => {
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);
      updatePosition();
    });
    
    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    });
    
    return {
      shouldShow,
      controlStyles,
      isFirst,
      isLast,
      handleAction
    };
  }
};
</script>

<style scoped>
.gmkb-component-controls {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(226, 232, 240, 0.8);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.control-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #64748b;
  padding: 0;
}

.control-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #1e293b;
  transform: translateY(-1px);
}

.control-btn:active:not(:disabled) {
  transform: translateY(0);
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.control-btn svg {
  width: 14px;
  height: 14px;
}

/* Specific button colors */
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
</style>
