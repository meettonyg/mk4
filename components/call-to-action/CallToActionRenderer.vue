<template>
  <div class="gmkb-cta-component" :data-component-id="componentId">
    <div class="cta-container" :style="containerStyle">
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
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import { usePodsData } from '../../src/composables/usePodsData';

export default {
  name: 'CallToActionRenderer',
  props: {
    componentId: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props, { emit }) {
    // Store and composables
    const store = useMediaKitStore();
    const { email, phone, website } = usePodsData();
    
    // Computed properties
    const title = computed(() => {
      return props.data.title || 'Ready to Take Action?';
    });
    
    const description = computed(() => {
      return props.data.description || '';
    });
    
    const displayButtons = computed(() => {
      if (Array.isArray(props.data.buttons) && props.data.buttons.length > 0) {
        return props.data.buttons;
      }
      
      // Build from individual button fields
      const buttonsList = [];
      
      if (props.data.button_text && props.data.button_url) {
        buttonsList.push({
          text: props.data.button_text,
          url: props.data.button_url,
          style: 'primary',
          target: props.data.button_target || '_self'
        });
      }
      
      if (props.data.secondary_button_text && props.data.secondary_button_url) {
        buttonsList.push({
          text: props.data.secondary_button_text,
          url: props.data.secondary_button_url,
          style: 'secondary',
          target: props.data.secondary_button_target || '_self'
        });
      }
      
      // ROOT FIX: Use Pods data for contact buttons if no buttons configured
      if (buttonsList.length === 0) {
        if (email.value) {
          buttonsList.push({
            text: 'Contact Me',
            url: `mailto:${email.value}`,
            style: 'primary',
            target: '_self'
          });
        }
        
        if (website.value) {
          buttonsList.push({
            text: 'Visit Website',
            url: website.value,
            style: 'secondary',
            target: '_blank'
          });
        }
      }
      
      return buttonsList;
    });
    
    const containerStyle = computed(() => {
      const styles = {};
      
      if (props.data.background_color) {
        styles.background = props.data.background_color;
      }
      
      if (props.data.background_image) {
        styles.backgroundImage = `url(${props.data.background_image})`;
        styles.backgroundSize = 'cover';
        styles.backgroundPosition = 'center';
      }
      
      return styles;
    });
    
    // Methods
    const handleButtonClick = (button, event) => {
      // Track button clicks
      emit('cta-click', {
        buttonText: button.text,
        buttonUrl: button.url,
        componentId: props.componentId
      });
      
      // Dispatch event for analytics
      document.dispatchEvent(new CustomEvent('gmkb:cta-click', {
        detail: {
          componentId: props.componentId,
          button: button
        }
      }));
    };
    
    // Lifecycle
    onMounted(() => {
      // ROOT FIX: No polling or global checking - use event-driven approach
      if (store.components[props.componentId]) {
        console.log('CallToAction component mounted:', props.componentId);
        
        // Check if using Pods data
        const usingPodsData = displayButtons.value.some(button => 
          button.url.includes(email.value) || button.url === website.value
        );
        
        // Dispatch mount event
        document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
          detail: {
            type: 'call-to-action',
            id: props.componentId,
            podsDataUsed: usingPodsData
          }
        }));
      }
    });
    
    return {
      title,
      description,
      displayButtons,
      containerStyle,
      handleButtonClick
    };
  }
};
</script>

<style scoped>
.gmkb-cta-component {
  padding: var(--gmkb-spacing-2xl, 3rem) var(--gmkb-spacing-xl, 2rem);
  background: var(--gmkb-color-primary, #007cba);
  color: white;
}

.cta-container {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  padding: var(--gmkb-spacing-xl, 2rem);
  border-radius: var(--gmkb-border-radius, 8px);
}

.cta-title {
  font-family: var(--gmkb-font-heading, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-3xl, 2.5rem);
  font-weight: var(--gmkb-font-weight-bold, 700);
  line-height: var(--gmkb-line-height-heading, 1.2);
  margin-bottom: var(--gmkb-spacing-md, 1rem);
  color: white;
}

.cta-description {
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-lg, 1.25rem);
  line-height: var(--gmkb-line-height-base, 1.6);
  margin-bottom: var(--gmkb-spacing-xl, 2rem);
  opacity: 0.95;
  color: white;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--gmkb-spacing-md, 1rem);
}

.cta-button {
  display: inline-block;
  padding: var(--gmkb-spacing-md, 1rem) var(--gmkb-spacing-xl, 2rem);
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-lg, 1.1rem);
  font-weight: var(--gmkb-font-weight-bold, 600);
  text-decoration: none;
  border-radius: var(--gmkb-border-radius, 4px);
  transition: var(--gmkb-transition, all 0.3s ease);
  cursor: pointer;
  text-align: center;
}

.cta-button.primary {
  background: white;
  color: var(--gmkb-color-primary, #007cba);
  border: 2px solid white;
}

.cta-button.primary:hover {
  background: var(--gmkb-color-surface, #f0f0f0);
  transform: translateY(-2px);
  box-shadow: var(--gmkb-shadow-lg, 0 10px 25px rgba(0,0,0,0.15));
}

.cta-button.secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.cta-button.secondary:hover {
  background: white;
  color: var(--gmkb-color-primary, #007cba);
  transform: translateY(-2px);
}

@media (max-max-width: var(--gmkb-max-width-content, 768px)) {
  .cta-title {
    font-size: var(--gmkb-font-size-2xl, 2rem);
  }
  
  .cta-description {
    font-size: var(--gmkb-font-size-base, 1rem);
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
