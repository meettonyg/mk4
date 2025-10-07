<template>
  <div class="gmkb-logo-grid-component" :data-component-id="componentId">
    <div class="logo-container">
      <h2 v-if="title" class="logo-title">{{ title }}</h2>
      <p v-if="description" class="logo-description">{{ description }}</p>
      
      <div class="logo-grid" :class="gridStyle">
        <div v-for="(logo, index) in displayLogos" :key="index" class="logo-item">
          <a v-if="logo.link" :href="logo.link" target="_blank" rel="noopener">
            <img :src="logo.url" :alt="logo.name || `Logo ${index + 1}`" />
          </a>
          <img v-else :src="logo.url" :alt="logo.name || `Logo ${index + 1}`" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import { usePodsData } from '../../src/composables/usePodsData';

export default {
  name: 'LogoGridRenderer',
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
  setup(props) {
    // Store and composables
    const store = useMediaKitStore();
    const { media } = usePodsData();
    
    // Extract company logo from media
    const companyLogo = computed(() => media.value?.logo || '');
    
    // Computed properties
    const title = computed(() => {
      return props.data?.title || 'Featured In';
    });
    
    const description = computed(() => {
      return props.data?.description || '';
    });
    
    const gridStyle = computed(() => {
      return props.data?.grid_style || 'grid-auto';
    });
    
    const displayLogos = computed(() => {
      // Handle array format
      if (Array.isArray(props.data?.logos) && props.data.logos.length > 0) {
        return props.data.logos;
      }
      
      // Build from individual logo fields
      const logosList = [];
      for (let i = 1; i <= 12; i++) {
        if (props.data?.[`logo_${i}_url`]) {
          logosList.push({
            url: props.data[`logo_${i}_url`],
            name: props.data[`logo_${i}_name`] || '',
            link: props.data[`logo_${i}_link`] || ''
          });
        }
      }
      
      // ROOT FIX: Add company logo from Pods if available and no other logos
      if (logosList.length === 0 && companyLogo.value) {
        logosList.push({
          url: companyLogo.value,
          name: 'Company Logo',
          link: ''
        });
      }
      
      // Return empty array instead of placeholders
      return logosList;
    });
    
    // Lifecycle
    onMounted(() => {
      // ROOT FIX: No polling or global checking - use event-driven approach
      if (store.components[props.componentId]) {
        console.log('LogoGrid component mounted:', props.componentId);
        
        // Check if using Pods data
        const usingPodsData = displayLogos.value.some(logo => 
          logo.url === companyLogo.value
        );
        
        // Dispatch mount event
        document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
          detail: {
            type: 'logo-grid',
            id: props.componentId,
            podsDataUsed: usingPodsData
          }
        }));
      }
    });
    
    return {
      title,
      description,
      gridStyle,
      displayLogos
    };
  }
};
</script>

<style scoped>
.gmkb-logo-grid-component {
  padding: var(--gmkb-spacing-2xl, 3rem) var(--gmkb-spacing-xl, 2rem);
  background: var(--gmkb-color-background, #f8f9fa);
}

.logo-container {
  max-width: var(--gmkb-container-max-width, 1200px);
  margin: 0 auto;
}

.logo-title {
  text-align: center;
  color: var(--gmkb-color-text, #333);
  font-family: var(--gmkb-font-heading, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-2xl, 2rem);
  font-weight: var(--gmkb-font-weight-bold, 700);
  line-height: var(--gmkb-line-height-heading, 1.2);
  margin-bottom: var(--gmkb-spacing-md, 1rem);
}

.logo-description {
  text-align: center;
  color: var(--gmkb-color-text-light, #666);
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-base, 1rem);
  line-height: var(--gmkb-line-height-base, 1.6);
  margin-bottom: var(--gmkb-spacing-2xl, 3rem);
}

.logo-grid {
  display: grid;
  gap: var(--gmkb-spacing-xl, 2rem);
  align-items: center;
  justify-items: center;
}

.logo-grid.grid-auto {
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.logo-grid.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.logo-grid.grid-4 {
  grid-template-columns: repeat(4, 1fr);
}

.logo-grid.grid-6 {
  grid-template-columns: repeat(6, 1fr);
}

.logo-item {
  width: 100%;
  max-width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--gmkb-spacing-md, 1rem);
  background: var(--gmkb-color-surface, #fff);
  border-radius: var(--gmkb-border-radius, 8px);
  transition: var(--gmkb-transition, all 0.3s ease);
}

.logo-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--gmkb-shadow-md, 0 4px 6px rgba(0,0,0,0.1));
}

.logo-item img {
  width: 100%;
  height: auto;
  max-height: 60px;
  object-fit: contain;
  filter: grayscale(100%);
  opacity: 0.7;
  transition: var(--gmkb-transition, all 0.3s ease);
}

.logo-item:hover img {
  filter: grayscale(0%);
  opacity: 1;
}

.logo-item a {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-max-width: var(--gmkb-max-width-content, 768px)) {
  .logo-grid.grid-auto {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
  
  .logo-grid.grid-3,
  .logo-grid.grid-4 {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .logo-grid.grid-6 {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .logo-item {
    padding: var(--gmkb-spacing-sm, 0.75rem);
  }
}

@media (max-width: 480px) {
  .logo-grid.grid-6 {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
