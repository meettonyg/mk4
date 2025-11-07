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
import { usePodsData } from '../../src/composables/usePodsData';

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
    // COMPOSITION API: Access Pods data via composable
    const podsData = usePodsData();
    
    // TITLE: Component data > default
    const title = computed(() => {
      return props.data?.title || 'Ready to Take Action?';
    });
    
    // DESCRIPTION: Component data > Pods fallback > empty
    const description = computed(() => {
      // Priority 1: Component data
      if (props.data?.description) {
        return props.data.description;
      }
      
      // Priority 2: Pods data
      if (podsData.rawPodsData?.value) {
        const rawData = podsData.rawPodsData.value;
        return rawData.cta_description || '';
      }
      
      // Priority 3: Empty
      return '';
    });
    
    // BUTTONS: Priority is component data > Pods fallback > empty array
    const buttons = computed(() => {
      // Priority 1: Component data (user customization)
      if (props.data?.buttons && Array.isArray(props.data.buttons)) {
        return props.data.buttons;
      }
      
      // Priority 2: Pods data (from database)
      if (podsData.rawPodsData?.value) {
        const buttonsArray = [];
        const rawData = podsData.rawPodsData.value;
        
        // Extract CTA buttons 1-5
        for (let i = 1; i <= 5; i++) {
          const textKey = `cta_button_${i}_text`;
          const urlKey = `cta_button_${i}_url`;
          const styleKey = `cta_button_${i}_style`;
          const targetKey = `cta_button_${i}_target`;
          
          if (rawData[textKey] && rawData[urlKey]) {
            buttonsArray.push({
              text: rawData[textKey],
              url: rawData[urlKey],
              style: rawData[styleKey] || 'primary',
              target: rawData[targetKey] || '_self'
            });
          }
        }
        
        if (buttonsArray.length > 0) {
          return buttonsArray;
        }
      }
      
      // Priority 3: Empty array (will show no buttons)
      return [];
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
