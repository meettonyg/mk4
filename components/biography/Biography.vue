<template>
  <!-- V2 ARCHITECTURE: Single root element with component-root class -->
  <!-- SIMPLIFIED: Biography text only - other fields moved to separate components -->
  <div class="component-root biography-component">
    <div v-if="biography" class="biography-text" v-html="formattedBiography"></div>
    <div v-else class="biography-placeholder">
      <p>No biography available.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

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

// SIMPLIFIED: Only extract biography text
const biography = computed(() => {
  if (!props) return '';
  return props.data?.biography || props.props?.biography || props.data?.bio || props.props?.bio || '';
});

// Format biography text
const formattedBiography = computed(() => {
  if (!biography.value) return '';
  
  let formatted = biography.value;
  
  // Preserve line breaks
  formatted = formatted.replace(/\n\n/g, '</p><p>');
  formatted = formatted.replace(/\n/g, '<br>');
  formatted = `<p>${formatted}</p>`;
  
  return formatted;
});
</script>

<style scoped>
/* V2 ARCHITECTURE: Minimal component styles */
/* SIMPLIFIED: Biography text only */

.biography-component {
  /* Styles applied via inline styles from ComponentStyleService */
  display: block;
}

.biography-text {
  /* line-height inherited from component-root via ComponentStyleService */
  color: inherit;
}

.biography-text p {
  margin: 0 0 1rem 0;
}

.biography-text p:last-child {
  margin-bottom: 0;
}

.biography-placeholder {
  padding: 2rem;
  text-align: center;
  opacity: 0.6;
  font-style: italic;
}
</style>
