<template>
  <!-- ROOT FIX: Simplified renderer for introduction-only component -->
  <div class="gmkb-component gmkb-component--guestintro" :data-component-id="componentId">
    <div class="intro-container">
      <div class="intro-content">
        <div v-if="displayIntroduction" class="intro-text" v-html="formattedIntro"></div>
        <p v-else-if="showPlaceholder" class="intro-text intro-text--placeholder">Add your guest introduction here.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';

// Data from component JSON state (single source of truth)
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
    },
    isBuilderMode: {
      type: Boolean,
      default: true  // Default to true so placeholders show on initial mount before prop is passed
    }
  },
  setup(props) {
    const store = useMediaKitStore();

    // Data from component JSON state (single source of truth)
    const displayIntroduction = computed(() => props.data?.introduction || props.props?.introduction || '');

    // FORMATTED INTRO: Convert plain text to HTML paragraphs with line breaks
    const formattedIntro = computed(() => {
      if (!displayIntroduction.value) return '';

      // If already has HTML tags, return as-is
      if (displayIntroduction.value.includes('<p>') || displayIntroduction.value.includes('<br')) {
        return displayIntroduction.value;
      }

      // Convert double newlines to paragraphs, single newlines to <br>
      return displayIntroduction.value
        .split(/\n\n+/)  // Split on double+ newlines for paragraphs
        .filter(p => p.trim())
        .map(p => {
          // Convert single newlines within paragraphs to <br>
          const withBreaks = p.trim().replace(/\n/g, '<br>');
          return `<p>${withBreaks}</p>`;
        })
        .join('');
    });

    // Show placeholder when in builder mode with no introduction
    const showPlaceholder = computed(() => {
      return !displayIntroduction.value && (props.isBuilderMode || props.isEditing || props.isSelected);
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
      displayIntroduction,
      formattedIntro,
      showPlaceholder
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

/* Paragraph spacing within intro text */
.intro-text p {
  margin: 0 0 1em 0;
}

.intro-text p:last-child {
  margin-bottom: 0;
}

.intro-text--placeholder {
  opacity: 0.6;
  font-style: italic;
}
</style>
