<template>
  <div class="gmkb-component gmkb-component--biography" :data-component-id="componentId">
    <div class="component-root biography-content">
      <template v-if="showPlaceholder">
        <p class="biography-placeholder">
          Add your full biography and professional background here.
        </p>
      </template>
      <template v-else>
        <div v-if="biography" class="biography-text" v-html="formattedBio"></div>
      </template>
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
    },
    isBuilderMode: {
      type: Boolean,
      default: true  // Default to true so placeholders show on initial mount before prop is passed
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
      if (biography.value.includes('<p>') || biography.value.includes('<br')) {
        return biography.value;
      }

      // Convert double newlines to paragraphs, single newlines to <br>
      return biography.value
        .split(/\n\n+/)  // Split on double+ newlines for paragraphs
        .filter(p => p.trim())
        .map(p => {
          // Convert single newlines within paragraphs to <br>
          const withBreaks = p.trim().replace(/\n/g, '<br>');
          return `<p>${withBreaks}</p>`;
        })
        .join('');
    });

    // Show placeholder when in builder mode with no biography
    const showPlaceholder = computed(() => {
      return !biography.value && (props.isBuilderMode || props.isEditing || props.isSelected);
    });

    return {
      biography,
      formattedBio,
      showPlaceholder
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
