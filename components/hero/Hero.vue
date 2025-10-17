<template>
  <!-- V2 ARCHITECTURE: Single root element with component-root class -->
  <!-- ROOT FIX: Removed data-component-id - it's on the wrapper, not here -->
  <div 
    class="component-root hero-component"
    :class="{ 'hero--has-bg': backgroundImage }"
  >
    <div class="hero-overlay" v-if="backgroundImage"></div>
    
    <div class="hero-content">
      <h1 v-if="title" class="hero-title">{{ title }}</h1>
      <p v-if="subtitle" class="hero-subtitle">{{ subtitle }}</p>
      
      <div v-if="ctaText" class="hero-actions">
        <a 
          :href="ctaUrl || '#'" 
          class="hero-cta"
        >
          {{ ctaText }}
        </a>
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

// Extract data from both data and props for compatibility
// ROOT FIX: Added safety checks for undefined props
const title = computed(() => {
  if (!props) return '';
  return props.data?.title || props.props?.title || '';
});

const subtitle = computed(() => {
  if (!props) return '';
  return props.data?.subtitle || props.props?.subtitle || '';
});

const backgroundImage = computed(() => {
  if (!props) return '';
  return props.data?.backgroundImage || props.props?.backgroundImage || '';
});

const ctaText = computed(() => {
  if (!props) return '';
  return props.data?.ctaText || props.props?.ctaText || '';
});

const ctaUrl = computed(() => {
  if (!props) return '#';
  return props.data?.ctaUrl || props.props?.ctaUrl || '#';
});

const alignment = computed(() => {
  if (!props) return 'center';
  return props.data?.alignment || props.props?.alignment || 'center';
});
</script>

<style scoped>
/* V2 ARCHITECTURE: Minimal component styles */
/* All visual styles (background, padding, border, etc.) applied via ComponentStyleService */

.hero-component {
  /* Styles applied via inline styles from ComponentStyleService */
  position: relative;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero--has-bg {
  color: white;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(0, 0, 0, 0.4) 0%, 
    rgba(0, 0, 0, 0.2) 100%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  width: 100%;
  text-align: center;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  margin: 0 0 1rem;
  line-height: 1.2;
  color: inherit;
}

.hero--has-bg .hero-title {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.25rem);
  margin: 0 0 2rem;
  line-height: 1.6;
  opacity: 0.9;
}

.hero--has-bg .hero-subtitle {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.hero-actions {
  margin-top: 2rem;
}

.hero-cta {
  display: inline-block;
  padding: 12px 32px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.3s ease;
  background-color: #3b82f6;
  color: white;
  cursor: pointer;
}

.hero-cta:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.hero--has-bg .hero-cta {
  background-color: white;
  color: #3b82f6;
}

.hero--has-bg .hero-cta:hover {
  background-color: #f8f9fa;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-component {
    min-height: 300px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
}
</style>
