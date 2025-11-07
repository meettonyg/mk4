<template>
  <!-- ROOT FIX: Simplified renderer for introduction-only component -->
  <div class="gmkb-component gmkb-component--guestintro" :data-component-id="componentId">
    <div class="intro-container">
      <div class="intro-content">
        <p v-if="displayIntroduction" class="intro-text">{{ displayIntroduction }}</p>
        <p v-else class="intro-text intro-text--placeholder">No introduction available.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import { usePodsData } from '../../src/composables/usePodsData';

// ROOT FIX: Pods data is PRIMARY source for introduction
export default {
  name: 'GuestIntroRenderer',
  props: {
    // STANDARD INTERFACE: All components accept the same props structure
    componentId: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      default: () => ({})
    },
    props: {
      type: Object,
      default: () => ({})
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    // Optional editing state
    isEditing: {
      type: Boolean,
      default: false
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const store = useMediaKitStore();
    const podsData = usePodsData();
    
    // Computed property - ONLY from Pods (text content never in component JSON)
    const displayIntroduction = computed(() => {
      // Debug logging
      if (window.gmkbDebug) {
        console.log('[GuestIntroRenderer] Pods data (ONLY source):', {
          podsIntroduction: podsData.introduction?.value,
          isLoaded: podsData.isLoaded?.value
        });
      }
      
      // ONLY SOURCE: Pods introduction field
      // Text content is NEVER stored in component JSON
      return podsData.introduction?.value || '';
    });
    
    // Lifecycle
    onMounted(() => {
      // Event-driven approach - dispatch mount event
      if (store.components[props.componentId]) {
        console.log('GuestIntro component mounted:', props.componentId);
        
        document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
          detail: {
            type: 'guest-intro',
            id: props.componentId,
            hasData: !!displayIntroduction.value
          }
        }));
      }
    });
    
    return {
      displayIntroduction
    };
  }
};
</script>

<style>
/* ROOT FIX: Simplified styles for introduction-only component */
.gmkb-component--guestintro {
  padding: var(--gmkb-spacing-xl, 2rem);
  background: var(--gmkb-color-surface, #fff);
}

.intro-container {
  max-width: 900px;
  margin: 0 auto;
}

.intro-text {
  color: var(--gmkb-color-text, #333);
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-base, 1rem);
  line-height: var(--gmkb-line-height-relaxed, 1.7);
  margin: 0;
}

.intro-text--placeholder {
  opacity: 0.6;
  font-style: italic;
}
</style>
