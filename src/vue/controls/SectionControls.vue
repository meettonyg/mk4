<template>
  <Teleport to="body">
    <div 
      v-if="shouldShow"
      class="gmkb-section-controls"
      :style="controlStyles"
      @click.stop
    >
      <button 
        class="control-btn control-btn--move-up" 
        @click="handleAction('move-up')"
        :disabled="isFirst"
        title="Move Section Up"
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
        title="Move Section Down"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <polyline points="19 12 12 19 5 12"></polyline>
        </svg>
      </button>
      
      <button 
        class="control-btn control-btn--settings"
        @click="handleAction('settings')"
        title="Section Settings"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6m3.22-10.22l4.24-4.24M4.54 7.54l4.24-4.24M20.46 16.46l-4.24 4.24M7.78 13.78l-4.24 4.24"></path>
        </svg>
      </button>
      
      <button 
        class="control-btn control-btn--delete"
        @click="handleAction('delete')"
        title="Delete Section"
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
  name: 'SectionControls',
  
  props: {
    section: {
      type: Object,
      required: true
    },
    isHovered: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['action'],
  
  setup(props, { emit }) {
    const elementPosition = ref({ top: 0, left: 0, width: 0 });
    const shouldShow = ref(false);
    
    // Check if this is first or last section
    const isFirst = computed(() => {
      const state = window.GMKB?.stateManager?.getState();
      if (!state?.sections) return true;
      return state.sections[0]?.section_id === props.section.section_id;
    });
    
    const isLast = computed(() => {
      const state = window.GMKB?.stateManager?.getState();
      if (!state?.sections) return true;
      const sections = state.sections;
      return sections[sections.length - 1]?.section_id === props.section.section_id;
    });
    
    // Calculate control position (centered at top)
    const controlStyles = computed(() => {
      return {
        position: 'fixed',
        top: `${elementPosition.value.top + 10}px`,
        left: `${elementPosition.value.left + (elementPosition.value.width / 2)}px`,
        transform: 'translateX(-50%)',
        zIndex: 1001
      };
    });
    
    // Update element position
    const updatePosition = () => {
      const element = document.querySelector(`[data-section-id="${props.section.section_id}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        elementPosition.value = {
          top: rect.top,
          left: rect.left,
          width: rect.width
        };
      }
    };
    
    // Watch for hover changes
    watch(() => props.isHovered, (newVal) => {
      shouldShow.value = newVal;
      if (newVal) {
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
        sectionId: props.section.section_id 
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
.gmkb-section-controls {
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
    transform: translateX(-50%) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.control-btn {
  width: 32px;
  height: 32px;
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
  width: 16px;
  height: 16px;
}

/* Specific button colors */
.control-btn--move-up:hover:not(:disabled),
.control-btn--move-down:hover:not(:disabled) {
  background: #faf5ff;
  border-color: #c4b5fd;
  color: #7c3aed;
}

.control-btn--settings:hover:not(:disabled) {
  background: #f0f9ff;
  border-color: #7dd3fc;
  color: #0284c7;
}

.control-btn--delete:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #dc2626;
}
</style>
