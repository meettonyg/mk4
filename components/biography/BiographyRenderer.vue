<template>
  <!-- ROOT FIX: Use design system classes -->
  <!-- SIMPLIFIED: Biography component displays ONLY biography text -->
  <div class="gmkb-component gmkb-component--biography" :data-component-id="componentId">
    <div class="component-root biography-content">
      <div v-if="biography" class="biography-text" v-html="formattedBio"></div>
      <p v-else class="biography-placeholder">
        Add your full biography and professional background here.
      </p>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'BiographyRenderer',
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
    // Data from component JSON state (single source of truth)
    const biography = computed(() => {
      return props.data?.biography || props.props?.biography ||
             props.data?.bio || props.props?.bio || '';
    });

    // FORMATTED BIO: Convert plain text to HTML paragraphs if needed
    const formattedBio = computed(() => {
      if (!biography.value) return '';

      // If already has HTML tags, return as-is
      if (biography.value.includes('<p>')) {
        return biography.value;
      }

      // Convert newlines to paragraphs
      return biography.value
        .split('\n\n')
        .filter(p => p.trim())
        .map(p => `<p>${p}</p>`)
        .join('');
    });

    return {
      biography,
      formattedBio
    };
  }
}
</script>

<style>
/* ROOT FIX: NO scoped styles
   All styling comes from design-system/components.css:
   - .gmkb-component (base component wrapper)
   - .gmkb-component--biography (biography-specific styles)
   - .biography-content, .biography-name, .biography-title, .biography-text
*/
</style>
