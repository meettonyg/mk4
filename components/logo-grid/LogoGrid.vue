<template>
  <!-- V2 ARCHITECTURE: Single root element with component-root class -->
  <!-- ROOT FIX: Removed data-component-id - it's on the wrapper, not here -->
  <div 
    class="component-root logo-grid-component"
  >
    <h2 v-if="title" class="logo-title">{{ title }}</h2>
    <p v-if="description" class="logo-description">{{ description }}</p>
    
    <div class="logo-grid" :class="`grid-${columns || 'auto'}`">
      <div v-for="(logo, index) in displayLogos" :key="index" class="logo-item">
        <a v-if="logo.link" :href="logo.link" target="_blank" rel="noopener noreferrer">
          <img :src="logo.url" :alt="logo.name || `Logo ${index + 1}`" />
        </a>
        <img v-else :src="logo.url" :alt="logo.name || `Logo ${index + 1}`" />
      </div>
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

// Data from component JSON state (single source of truth)
const title = computed(() => props.data?.title || props.props?.title || 'Featured In');
const description = computed(() => props.data?.description || props.props?.description || '');
const columns = computed(() => props.data?.columns || props.props?.columns || 'auto');

const displayLogos = computed(() => {
  // Handle array format
  if (Array.isArray(props.data?.logos) && props.data.logos.length > 0) {
    return props.data.logos;
  }

  // Build from individual logo fields
  const logosList = [];
  for (let i = 1; i <= 12; i++) {
    const url = props.data?.[`logo_${i}_url`] || props.props?.[`logo_${i}_url`];
    if (url) {
      logosList.push({
        url: url,
        name: props.data?.[`logo_${i}_name`] || props.props?.[`logo_${i}_name`] || '',
        link: props.data?.[`logo_${i}_link`] || props.props?.[`logo_${i}_link`] || ''
      });
    }
  }

  return logosList;
});
</script>

<style scoped>
/* V2 ARCHITECTURE: Minimal component styles */
/* All visual styles (background, padding, border, etc.) applied via ComponentStyleService */

.logo-grid-component {
  /* Styles applied via inline styles from ComponentStyleService */
}

.logo-title {
  text-align: center;
  /* font-size and font-weight inherited from component-root */
  margin: 0 0 1rem 0;
  color: inherit;
}

.logo-description {
  text-align: center;
  opacity: 0.8; /* Use opacity instead of fixed color */
  margin: 0 0 3rem 0;
  /* line-height inherited from component-root */
}

.logo-grid {
  display: grid;
  gap: 2rem;
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
  padding: 1rem;
  background: var(--card-bg, rgba(248, 250, 252, 0.8));
  border-radius: var(--component-border-radius, 8px);
  transition: all 0.3s ease;
}

.logo-item:hover {
  transform: translateY(-4px);
  /* box-shadow controlled by theme/ComponentStyleService when explicitly set */
}

.logo-item img {
  width: 100%;
  height: auto;
  max-height: 60px;
  object-fit: contain;
  filter: grayscale(100%);
  opacity: 0.7;
  transition: all 0.3s ease;
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

/* Responsive */
@media (max-width: 768px) {
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
  
  .logo-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .logo-grid.grid-6 {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
