<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--calltoaction" :data-component-id="componentId">
    <div class="component-root cta-content">
    <h2 v-if="title" class="cta-title">{{ title }}</h2>
    <p v-if="description" class="cta-description">{{ description }}</p>
    
    <div class="cta-buttons">
      <!-- Placeholder buttons when editing with no data -->
      <template v-if="showPlaceholders">
        <span
          v-for="(button, index) in placeholderButtons"
          :key="index"
          :class="['cta-button', 'cta-button--placeholder', button.style || 'primary']"
        >
          {{ button.text }}
        </span>
      </template>

      <!-- Actual buttons when data exists -->
      <template v-else>
        <a
          v-for="(button, index) in buttons"
          :key="index"
          :href="button.url"
          :class="['cta-button', button.style || 'primary']"
          :target="button.target || '_self'"
        >
          {{ button.text }}
        </a>
      </template>
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
    },
    isBuilderMode: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    // Data from component JSON state (single source of truth)
    const title = computed(() => props.data?.title || props.props?.title || 'Ready to Take Action?');

    const description = computed(() => props.data?.description || props.props?.description || '');

    // Buttons from component data
    // ROOT FIX: Support multiple data formats from profile pre-population
    const buttons = computed(() => {
      const data = props.data || props.props || {};

      // 1. Check for pre-built buttons array
      if (data.buttons && Array.isArray(data.buttons) && data.buttons.length > 0) {
        return data.buttons;
      }

      const buttonsList = [];

      // 2. Check for single cta_button_text/url fields (from profile pre-population)
      if (data.cta_button_text && data.cta_button_url) {
        buttonsList.push({
          text: data.cta_button_text,
          url: data.cta_button_url,
          style: 'primary',
          target: '_self'
        });
      }

      // 3. Check for booking_url as secondary button
      if (data.booking_url) {
        buttonsList.push({
          text: 'Book Now',
          url: data.booking_url,
          style: buttonsList.length > 0 ? 'secondary' : 'primary',
          target: '_blank'
        });
      }

      // 4. Check for contact_email as button
      if (data.contact_email && buttonsList.length < 2) {
        buttonsList.push({
          text: 'Contact Me',
          url: `mailto:${data.contact_email}`,
          style: buttonsList.length > 0 ? 'secondary' : 'primary',
          target: '_self'
        });
      }

      // Return if we found profile-populated buttons
      if (buttonsList.length > 0) {
        return buttonsList;
      }

      // 5. Fall back to numbered button fields (legacy format)
      for (let i = 1; i <= 5; i++) {
        const textKey = `cta_button_${i}_text`;
        const urlKey = `cta_button_${i}_url`;
        const styleKey = `cta_button_${i}_style`;
        const targetKey = `cta_button_${i}_target`;

        const buttonText = data[textKey];
        const buttonUrl = data[urlKey];

        if (buttonText && buttonUrl) {
          buttonsList.push({
            text: buttonText,
            url: buttonUrl,
            style: data[styleKey] || 'primary',
            target: data[targetKey] || '_self'
          });
        }
      }

      return buttonsList;
    });

    // Show placeholders when in builder mode with no buttons
    const showPlaceholders = computed(() => {
      return buttons.value.length === 0 && (props.isBuilderMode || props.isEditing || props.isSelected);
    });

    // Placeholder buttons
    const placeholderButtons = [
      { text: 'Primary Action', url: '#', style: 'primary' },
      { text: 'Secondary Action', url: '#', style: 'secondary' }
    ];

    return {
      title,
      description,
      buttons,
      showPlaceholders,
      placeholderButtons
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
