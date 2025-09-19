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
    
    // Get state manager - try multiple sources
    const getStateManager = () => {
      return window.GMKB?.stateManager || 
             window.stateManager || 
             window.gmkbStateManager ||
             window.enhancedStateManager;
    };
    
    // Computed properties for visible elements
    const visibleSections = computed(() => {
      return sections.value.filter(section => {
        // Check multiple possible selectors for sections
        const element = document.querySelector(`[data-section-id="${section.section_id}"]`) ||
                       document.querySelector(`#${section.section_id}`) ||
                       document.querySelector(`.section-${section.section_id}`);
        return element && element.offsetParent !== null;
      });
    });
    
    const visibleComponents = computed(() => {
      return Object.values(components.value).filter(component => {
        // Check multiple possible selectors for components
        const element = document.querySelector(`[data-component-id="${component.id}"]`) ||
                       document.querySelector(`#${component.id}`) ||
                       document.querySelector(`.component-${component.id}`);
        return element && element.offsetParent !== null;
      });
    });
    
    // Update state from state manager
    const updateState = () => {
      const sm = getStateManager();
      if (sm) {
        const state = sm.getState();
        sections.value = state.sections || [];
        components.value = state.components || {};
        console.log('Vue controls updated state:', {
          sections: sections.value.length,
          components: Object.keys(components.value).length
        });
      } else {
        console.warn('No state manager found');
      }
    };
    
    // Handle hover detection - direct, no debouncing for better responsiveness
    const handleMouseEnter = (e) => {
      // Check if we're hovering over controls themselves
      if (e.target.closest('.gmkb-component-controls, .gmkb-section-controls')) {
        return;
      }
      
      // Check for component
      const componentEl = e.target.closest('[data-component-id]');
      if (componentEl) {
        const componentId = componentEl.getAttribute('data-component-id');
        if (componentId) {
          hoveredComponentId.value = componentId;
          console.log('Component hover:', componentId);
        }
      }
      
      // Check for section
      const sectionEl = e.target.closest('[data-section-id]');
      if (sectionEl) {
        const sectionId = sectionEl.getAttribute('data-section-id');
        if (sectionId) {
          hoveredSectionId.value = sectionId;
        }
      }
    };
    
    const handleMouseLeave = (e) => {
      // Only clear hover if we're leaving the component/section entirely
      const relatedTarget = e.relatedTarget;
      
      // Check if we're moving to controls
      if (relatedTarget && relatedTarget.closest('.gmkb-component-controls, .gmkb-section-controls')) {
        return;
      }
      
      // Check if we're still within the same component
      const componentEl = e.target.closest('[data-component-id]');
      if (componentEl) {
        const componentId = componentEl.getAttribute('data-component-id');
        if (relatedTarget && relatedTarget.closest(`[data-component-id="${componentId}"]`)) {
          return;
        }
        hoveredComponentId.value = null;
      }
      
      // Check if we're still within the same section
      const sectionEl = e.target.closest('[data-section-id]');
      if (sectionEl) {
        const sectionId = sectionEl.getAttribute('data-section-id');
        if (relatedTarget && relatedTarget.closest(`[data-section-id="${sectionId}"]`)) {
          return;
        }
        hoveredSectionId.value = null;
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
    
    // Define setupHoverListeners outside onMounted so it's accessible
    const setupHoverListeners = () => {
        // ROOT FIX: Use event delegation instead of individual listeners
        // This way we don't need to re-attach when DOM changes
        
        // Remove the old approach's listeners if any
        document.querySelectorAll('[data-component-id]').forEach(el => {
          el.removeEventListener('mouseenter', handleMouseEnter);
          el.removeEventListener('mouseleave', handleMouseLeave);
        });
        document.querySelectorAll('[data-section-id]').forEach(el => {
          el.removeEventListener('mouseenter', handleMouseEnter);
          el.removeEventListener('mouseleave', handleMouseLeave);
        });
        
        // Now add fresh listeners to ALL elements
        document.querySelectorAll('[data-component-id]').forEach(el => {
          el.addEventListener('mouseenter', handleMouseEnter);
          el.addEventListener('mouseleave', handleMouseLeave);
        });
        document.querySelectorAll('[data-section-id]').forEach(el => {
          el.addEventListener('mouseenter', handleMouseEnter);
          el.addEventListener('mouseleave', handleMouseLeave);
        });
        
        const componentCount = document.querySelectorAll('[data-component-id]').length;
        const sectionCount = document.querySelectorAll('[data-section-id]').length;
        console.log(`Hover listeners set up for ${componentCount} components, ${sectionCount} sections`);
        
        // Update state to ensure controls know about all elements
        updateState();
    };
    
    // Lifecycle hooks
    onMounted(() => {
      // The controls now only mount after state is ready, so we can update immediately
      updateState();
      
      // Subscribe to state changes
      const sm = getStateManager();
      if (sm && sm.subscribe) {
        sm.subscribe(updateState);
        console.log('Vue controls subscribed to state changes');
      }
      
      // ROOT FIX: Components should already be in DOM when controls mount
      // because main.js waits for them before mounting ControlsOverlay
      // Set up listeners immediately since components are guaranteed to exist
      setupHoverListeners();
      console.log('Initial hover listener setup - components already in DOM');
      
      // Add click listener
      document.addEventListener('click', handleClick);
      
      // Listen for external state updates
      document.addEventListener('gmkb:state-updated', updateState);
      
      // ROOT FIX: Re-attach listeners whenever DOM changes
      // Listen for component render events and re-attach listeners
      const componentRenderedHandler = () => {
        setTimeout(() => {
          updateState();
          setupHoverListeners();
          console.log('Re-attached hover listeners after component rendered');
        }, 100);
      };
      
      // Listen for all components rendered
      const allComponentsRenderedHandler = () => {
        setTimeout(() => {
          updateState();
          setupHoverListeners();
          console.log('Re-attached hover listeners after all components rendered');
          console.log('Found components:', document.querySelectorAll('[data-component-id]').length);
        }, 300);
      };
      
      // ROOT FIX: Critical - re-attach on state changes (includes adding components)
      const stateUpdatedHandler = () => {
        // Use requestAnimationFrame to ensure DOM has updated
        requestAnimationFrame(() => {
          setTimeout(() => {
            updateState();
            setupHoverListeners();
            console.log('Re-attached hover listeners after state change');
          }, 100);
        });
      };
      
      // ROOT FIX: Also listen for component add events specifically
      const componentAddedHandler = (e) => {
        console.log('Component added event:', e.detail);
        requestAnimationFrame(() => {
          setTimeout(() => {
            updateState();
            setupHoverListeners();
            console.log('Re-attached hover listeners after component added');
          }, 200);
        });
      };
      
      document.addEventListener('gmkb:component-rendered', componentRenderedHandler);
      document.addEventListener('gmkb:all-components-rendered', allComponentsRenderedHandler);
      document.addEventListener('gmkb:state-updated', stateUpdatedHandler);
      document.addEventListener('gmkb:component-added', componentAddedHandler);
      document.addEventListener('state:changed', stateUpdatedHandler);  // Also listen for state:changed
    });
    
    onUnmounted(() => {
      // Clean up all event listeners
      document.querySelectorAll('[data-component-id]').forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
      document.querySelectorAll('[data-section-id]').forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
      
      document.removeEventListener('click', handleClick);
      document.removeEventListener('gmkb:state-updated', updateState);
      document.removeEventListener('gmkb:component-rendered', updateState);
      document.removeEventListener('gmkb:all-components-rendered', updateState);
    });
    
    // Export setupHoverListeners to window for external access
    window.gmkbSetupHoverListeners = setupHoverListeners;
    
    return {
      hoveredSectionId,
      hoveredComponentId,
      selectedComponentId,
      visibleSections,
      visibleComponents,
      handleSectionAction,
      handleComponentAction,
      setupHoverListeners
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
