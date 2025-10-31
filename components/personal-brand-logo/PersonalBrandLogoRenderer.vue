<template>
  <div class="personal-brand-logo-component" :class="componentClasses">
    <div v-if="logo" class="brand-logo-container">
      <img 
        :src="logo.url" 
        :alt="logo.alt || 'Personal Brand Logo'"
        class="brand-logo-image"
        loading="lazy"
      />
    </div>
    <div v-else class="brand-logo-placeholder">
      <i class="fa-solid fa-star"></i>
      <p>No personal brand logo available</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePodsData } from '../../src/composables/usePodsData';

const props = defineProps({
  componentId: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    default: () => ({})
  }
});

const { podsData } = usePodsData();

// SINGLE FIELD PATTERN: Simple logo object or null
const logo = computed(() => {
  // Check if using Pods data
  if (props.data?.usePodsData && podsData.value?.personal_brand_logo) {
    const podsLogo = podsData.value.personal_brand_logo;
    
    // Handle both simple URL and complex object formats
    return {
      url: typeof podsLogo === 'object' 
        ? (podsLogo.guid || podsLogo.url || podsLogo.ID) 
        : podsLogo,
      alt: typeof podsLogo === 'object' 
        ? (podsLogo.post_title || 'Personal Brand Logo') 
        : 'Personal Brand Logo'
    };
  }
  
  // Fallback to custom logo
  return props.data?.logo || null;
});

const componentClasses = computed(() => ({
  'has-logo': !!logo.value,
  'no-logo': !logo.value,
  'pods-source': props.data?.usePodsData && !!podsData.value?.personal_brand_logo,
  'custom-source': !props.data?.usePodsData || !podsData.value?.personal_brand_logo
}));
</script>

<style scoped>
.personal-brand-logo-component {
  width: 100%;
  padding: var(--spacing-md, 1rem);
}

.brand-logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm, 0.75rem);
}

.brand-logo-image {
  max-width: 250px;
  width: 100%;
  height: auto;
  object-fit: contain;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.brand-logo-image:hover {
  transform: scale(1.05);
  opacity: 0.9;
}

.brand-logo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl, 2rem);
  color: var(--color-text-muted, #94a3b8);
  background: var(--color-surface, #f8fafc);
  border-radius: var(--border-radius, 8px);
  border: 2px dashed var(--color-border, #e2e8f0);
}

.brand-logo-placeholder i {
  font-size: 4rem;
  margin-bottom: var(--spacing-md, 1rem);
  opacity: 0.5;
}

.brand-logo-placeholder p {
  margin: 0;
  font-size: var(--font-size-sm, 0.875rem);
  font-style: italic;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .brand-logo-image {
    max-width: 180px;
  }
}

/* Dark mode support */
body.dark-mode .brand-logo-placeholder {
  background: var(--color-surface-dark, #1e293b);
  border-color: var(--color-border-dark, #334155);
  color: var(--color-text-muted-dark, #94a3b8);
}
</style>
