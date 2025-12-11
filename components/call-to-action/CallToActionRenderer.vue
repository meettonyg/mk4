<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--calltoaction" :data-component-id="componentId">
    <div class="component-root cta-content">
    <h2 v-if="title" class="cta-title">{{ title }}</h2>
    <p v-if="description" class="cta-description">{{ description }}</p>
    
    <div class="cta-buttons">
      <a
        v-for="(button, index) in buttons"
        :key="index"
        :href="button.url"
        :class="['cta-button', button.style || 'primary']"
        :target="button.target || '_self'"
      >
        {{ button.text }}
      </a>
    </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'CallToActionRenderer',
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
    const title = computed(() => props.data?.title || props.props?.title || 'Ready to Take Action?');

    const description = computed(() => props.data?.description || props.props?.description || '');

    // Buttons from component data
    const buttons = computed(() => {
      if (props.data?.buttons && Array.isArray(props.data.buttons)) {
        return props.data.buttons;
      }

      // Build from individual button fields
      const buttonsList = [];
      for (let i = 1; i <= 5; i++) {
        const textKey = `cta_button_${i}_text`;
        const urlKey = `cta_button_${i}_url`;
        const styleKey = `cta_button_${i}_style`;
        const targetKey = `cta_button_${i}_target`;

        const buttonText = props.data?.[textKey] || props.props?.[textKey];
        const buttonUrl = props.data?.[urlKey] || props.props?.[urlKey];

        if (buttonText && buttonUrl) {
          buttonsList.push({
            text: buttonText,
            url: buttonUrl,
            style: props.data?.[styleKey] || props.props?.[styleKey] || 'primary',
            target: props.data?.[targetKey] || props.props?.[targetKey] || '_self'
          });
        }
      }

      return buttonsList;
    });

    return {
      title,
      description,
      buttons
    };
  }
}
</script>

<style>
/* ROOT FIX: NO scoped styles
   All styling comes from design-system/components.css:
   - .gmkb-component (base component wrapper)
   - .gmkb-component--cta (cta-specific styles)
   - .cta-title, .cta-description, .cta-buttons, .cta-button
*/
</style>
