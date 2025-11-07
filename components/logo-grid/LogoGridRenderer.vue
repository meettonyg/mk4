<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--logogrid" :data-component-id="componentId">
    <div class="component-root logo-grid-content">
    <h2 v-if="title" class="section-title">{{ title }}</h2>
    <div class="logo-grid">
      <div v-for="(logo, index) in logos" :key="index" class="logo-item">
        <img :src="logo.url" :alt="logo.name || `Logo ${index + 1}`" />
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { usePodsData } from '../../src/composables/usePodsData';

export default {
  name: 'LogoGridRenderer',
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
      return props.data?.title || 'As Featured On';
    });
    
    // LOGOS: Priority is component data > Pods fallback > empty array
    const logos = computed(() => {
      // Priority 1: Component data (user customization)
      if (props.data?.logos && Array.isArray(props.data.logos)) {
        return props.data.logos;
      }
      
      // Priority 2: Pods data (from database)
      // Extract logos from Pods rawPodsData
      if (podsData.rawPodsData?.value) {
        const logosArray = [];
        const rawData = podsData.rawPodsData.value;
        
        // Extract logos 1-20
        for (let i = 1; i <= 20; i++) {
          const logoKey = `featured_logo_${i}`;
          const nameKey = `featured_logo_${i}_name`;
          
          if (rawData[logoKey]) {
            const logo = rawData[logoKey];
            // Handle both URL strings and logo objects
            logosArray.push({
              url: typeof logo === 'object' 
                ? (logo.guid || logo.url || logo.ID) 
                : logo,
              name: rawData[nameKey] || ''
            });
          }
        }
        
        if (logosArray.length > 0) {
          return logosArray;
        }
      }
      
      // Priority 3: Empty array (will show no logos)
      return [];
    });
    
    return {
      title,
      logos
    };
  }
}
</script>

<style>
/* ROOT FIX: NO scoped styles */
</style>
