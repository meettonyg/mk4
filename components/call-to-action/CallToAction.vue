<template>
  <!-- V2 ARCHITECTURE: Single root element with component-root class -->
  <!-- ROOT FIX: Removed data-component-id - it's on the wrapper, not here -->
  <div 
    class="component-root cta-component"
    :style="containerStyle"
  >
    <h2 v-if="title" class="cta-title">{{ title }}</h2>
    <p v-if="description" class="cta-description">{{ description }}</p>
    
    <div class="cta-buttons">
      <a
        v-for="(button, index) in displayButtons"
        :key="index"
        :href="button.url"
        :class="['cta-button', button.style || 'primary']"
        :target="button.target || '_self'"
        @click="handleButtonClick(button, $event)"
      >
        {{ button.text }}
      </a>
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

const emit = defineEmits(['cta-click']);

// Data from component JSON state (single source of truth)
const title = computed(() => props.data?.title || props.props?.title || 'Ready to Take Action?');
const description = computed(() => props.data?.description || props.props?.description || '');

const displayButtons = computed(() => {
  if (Array.isArray(props.data?.buttons) && props.data.buttons.length > 0) {
    return props.data.buttons;
  }

  // Build from individual button fields
  const buttonsList = [];

  const buttonText = props.data?.button_text || props.props?.button_text;
  const buttonUrl = props.data?.button_url || props.props?.button_url;

  if (buttonText && buttonUrl) {
    buttonsList.push({
      text: buttonText,
      url: buttonUrl,
      style: 'primary',
      target: props.data?.button_target || props.props?.button_target || '_self'
    });
  }

  const secondaryText = props.data?.secondary_button_text || props.props?.secondary_button_text;
  const secondaryUrl = props.data?.secondary_button_url || props.props?.secondary_button_url;

  if (secondaryText && secondaryUrl) {
    buttonsList.push({
      text: secondaryText,
      url: secondaryUrl,
      style: 'secondary',
      target: props.data?.secondary_button_target || props.props?.secondary_button_target || '_self'
    });
  }

  return buttonsList;
});

const containerStyle = computed(() => {
  const styles = {};
  
  const bgColor = props.data?.background_color || props.props?.background_color;
  if (bgColor) {
    styles.background = bgColor;
  }
  
  const bgImage = props.data?.background_image || props.props?.background_image;
  if (bgImage) {
    styles.backgroundImage = `url(${bgImage})`;
    styles.backgroundSize = 'cover';
    styles.backgroundPosition = 'center';
  }
  
  return styles;
});

const handleButtonClick = (button, event) => {
  emit('cta-click', {
    buttonText: button.text,
    buttonUrl: button.url,
    componentId: props.componentId
  });
  
  document.dispatchEvent(new CustomEvent('gmkb:cta-click', {
    detail: {
      componentId: props.componentId,
      button: button
    }
  }));
};

</script>

<style scoped>
/* V2 ARCHITECTURE: Minimal component styles */
/* All visual styles (background, padding, border, etc.) applied via ComponentStyleService */

.cta-component {
  /* Styles applied via inline styles from ComponentStyleService */
  text-align: center;
  position: relative;
  color: white;
}

.cta-title {
  /* font-size and font-weight inherited from component-root */
  margin: 0 0 1rem 0;
  /* line-height inherited from component-root */
  color: inherit;
}

.cta-description {
  /* font-size and line-height inherited from component-root */
  margin: 0 auto 2rem auto;
  opacity: 0.95;
  max-width: 600px;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.cta-button {
  display: inline-block;
  padding: 1rem 2rem;
  /* font-size and font-weight inherited from component-root */
  text-decoration: none;
  border-radius: var(--button-radius, 6px);
  transition: all 0.3s ease;
  cursor: pointer;
  text-align: center;
}

.cta-button.primary {
  background: var(--button-bg-on-dark, white);
  color: var(--primary-color, #3b82f6);
  border: 2px solid var(--button-bg-on-dark, white);
}

.cta-button.primary:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

.cta-button.secondary {
  background: transparent;
  color: var(--button-text-on-dark, white);
  border: 2px solid var(--button-text-on-dark, white);
}

.cta-button.secondary:hover {
  background: var(--button-bg-on-dark, white);
  color: var(--primary-color, #3b82f6);
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .cta-title {
    font-size: 2rem;
  }
  
  .cta-description {
    font-size: 1rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-button {
    width: 100%;
    max-width: 300px;
  }
}
</style>
