<template>
  <!-- V2 ARCHITECTURE: Single root element with component-root class -->
  <!-- ROOT FIX: Only displaying introduction field -->
  <div 
    class="component-root guest-intro-component"
    :class="`layout-${layout}`"
  >
    <div class="guest-intro-content">
      <div v-if="introduction" class="guest-introduction">
        <p>{{ introduction }}</p>
      </div>
      <div v-else class="guest-introduction-placeholder">
        <p>Add your introduction text...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePodsData } from '../../src/composables/usePodsData';

// ROOT FIX: Pods data is PRIMARY source for introduction
const props = defineProps({
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
  isEditing: {
    type: Boolean,
    default: false
  },
  isSelected: {
    type: Boolean,
    default: false
  }
});

// Load Pods data - THIS IS THE ONLY SOURCE FOR TEXT CONTENT
const podsData = usePodsData();

// Extract introduction - ONLY from Pods (no component data override for text)
const introduction = computed(() => {
  // Debug logging
  if (import.meta.env.DEV || window.gmkbDebug) {
    console.log('[GuestIntro] Pods data (ONLY source for text):', {
      podsIntroduction: podsData.introduction?.value,
      isLoaded: podsData.isLoaded?.value
    });
  }
  
  // ONLY SOURCE: Pods introduction field
  // Text content is NEVER stored in component JSON
  return podsData.introduction?.value || '';
});

const layout = computed(() => props.data?.layout || props.props?.layout || 'centered');
</script>

<style scoped>
/* V2 ARCHITECTURE: Minimal component styles */
/* All visual styles (background, padding, border, etc.) applied via ComponentStyleService */
/* ROOT FIX: Simplified styles for introduction-only component */

.guest-intro-component {
  /* Styles applied via inline styles from ComponentStyleService */
}

/* Layout: Centered */
.guest-intro-component.layout-centered .guest-intro-content {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

/* Layout: Left-aligned */
.guest-intro-component.layout-left-aligned .guest-intro-content {
  text-align: left;
  max-width: 900px;
}

/* Layout: Card */
.guest-intro-component.layout-card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.guest-intro-component.layout-card .guest-intro-content {
  padding: 1rem;
}

/* Introduction text */
.guest-introduction p {
  /* font-size and line-height inherited from component-root */
  color: inherit;
  margin: 0;
  line-height: 1.6;
}

/* Placeholder styling */
.guest-introduction-placeholder {
  opacity: 0.5;
  font-style: italic;
}

.guest-introduction-placeholder p {
  color: inherit;
  margin: 0;
}
</style>
