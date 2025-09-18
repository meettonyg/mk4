<template>
  <div class="gmkb-controls-overlay">
    <!-- Section Controls -->
    <SectionControls
      v-for="section in visibleSections"
      :key="section.section_id"
      :section="section"
      :is-hovered="hoveredSectionId === section.section_id"
      @action="handleSectionAction"
    />
    
    <!-- Component Controls -->
    <ComponentControls
      v-for="component in visibleComponents"
      :key="component.id"
      :component="component"
      :is-hovered="hoveredComponentId === component.id"
      :is-selected="selectedComponentId === component.id"
      @action="handleComponentAction"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import SectionControls from './SectionControls.vue';
import ComponentControls from './ComponentControls.vue';

export default {
  name: 'ControlsOverlay',
  
  components: {
    SectionControls,
    ComponentControls
  },
  
  setup() {
    // State
    const hoveredSectionId = ref(null);
    const hoveredComponentId = ref(null);
    const selectedComponentId = ref(null);
    const sections = ref([]);
    const components = ref({});
    
    // Get state manager
    const stateManager = window.GMKB?.stateManager || window.stateManager;
    
    // Computed properties for visible elements
    const visibleSections = computed(() => {
      return sections.value.filter(section => {
        const element = document.querySelector(`[data-section-id="${section.section_id}"]`);
        return element && element.offsetParent !== null;
      });
    });
    
    const visibleComponents = computed(() => {
      return Object.values(components.value).filter(component => {
        const element = document.querySelector(`[data-component-id="${component.id}"]`);
        return element && element.offsetParent !== null;
      });
    });
    
    // Update state from state manager
    const updateState = () => {
      if (stateManager) {
        const state = stateManager.getState();
        sections.value = state.sections || [];
        components.value = state.components || {};
      }
    };
    
    // Handle hover detection
    const handleMouseMove = (e) => {
      // Find section under mouse
      const sectionEl = e.target.closest('.gmkb-section');
      if (sectionEl) {
        const sectionId = sectionEl.getAttribute('data-section-id');
        hoveredSectionId.value = sectionId;
      } else {
        hoveredSectionId.value = null;
      }
      
      // Find component under mouse
      const componentEl = e.target.closest('.gmkb-component');
      if (componentEl) {
        const componentId = componentEl.getAttribute('data-component-id');
        hoveredComponentId.value = componentId;
      } else {
        hoveredComponentId.value = null;
      }
    };
    
    // Handle click for selection
    const handleClick = (e) => {
      const componentEl = e.target.closest('.gmkb-component');
      if (componentEl) {
        const componentId = componentEl.getAttribute('data-component-id');
        selectedComponentId.value = componentId;
      } else if (!e.target.closest('.gmkb-controls')) {
        selectedComponentId.value = null;
      }
    };
    
    // Handle section actions
    const handleSectionAction = ({ action, sectionId }) => {
      console.log('Section action:', action, sectionId);
      
      switch (action) {
        case 'move-up':
          moveSectionUp(sectionId);
          break;
        case 'move-down':
          moveSectionDown(sectionId);
          break;
        case 'settings':
          openSectionSettings(sectionId);
          break;
        case 'delete':
          deleteSection(sectionId);
          break;
      }
    };
    
    // Handle component actions
    const handleComponentAction = ({ action, componentId }) => {
      console.log('Component action:', action, componentId);
      
      // Dispatch event for main app to handle
      document.dispatchEvent(new CustomEvent('gmkb:component-action', {
        detail: { action, componentId }
      }));
    };
    
    // Section action implementations
    const moveSectionUp = (sectionId) => {
      const state = stateManager.getState();
      const sectionsCopy = [...state.sections];
      const index = sectionsCopy.findIndex(s => s.section_id === sectionId);
      
      if (index > 0) {
        [sectionsCopy[index - 1], sectionsCopy[index]] = 
        [sectionsCopy[index], sectionsCopy[index - 1]];
        
        stateManager.dispatch({
          type: 'UPDATE_SECTIONS',
          payload: sectionsCopy
        });
      }
    };
    
    const moveSectionDown = (sectionId) => {
      const state = stateManager.getState();
      const sectionsCopy = [...state.sections];
      const index = sectionsCopy.findIndex(s => s.section_id === sectionId);
      
      if (index < sectionsCopy.length - 1) {
        [sectionsCopy[index], sectionsCopy[index + 1]] = 
        [sectionsCopy[index + 1], sectionsCopy[index]];
        
        stateManager.dispatch({
          type: 'UPDATE_SECTIONS',
          payload: sectionsCopy
        });
      }
    };
    
    const openSectionSettings = (sectionId) => {
      // Dispatch event for settings panel
      document.dispatchEvent(new CustomEvent('gmkb:section-settings', {
        detail: { sectionId }
      }));
    };
    
    const deleteSection = (sectionId) => {
      if (confirm('Delete this section and all its components?')) {
        // Dispatch event for deletion
        document.dispatchEvent(new CustomEvent('gmkb:section-action', {
          detail: { action: 'delete-section', sectionId }
        }));
      }
    };
    
    // Lifecycle hooks
    onMounted(() => {
      updateState();
      
      // Subscribe to state changes
      if (stateManager) {
        stateManager.subscribe(updateState);
      }
      
      // Add event listeners
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('click', handleClick);
      
      // Listen for external state updates
      document.addEventListener('gmkb:state-updated', updateState);
    });
    
    onUnmounted(() => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('gmkb:state-updated', updateState);
    });
    
    return {
      hoveredSectionId,
      hoveredComponentId,
      selectedComponentId,
      visibleSections,
      visibleComponents,
      handleSectionAction,
      handleComponentAction
    };
  }
};
</script>

<style scoped>
.gmkb-controls-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
}

/* Ensure controls are clickable */
.gmkb-controls-overlay :deep(.gmkb-controls) {
  pointer-events: auto;
}
</style>
