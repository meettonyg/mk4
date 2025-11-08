<template>
  <div class="personal-brand-logo-component" :class="componentClasses">
    <div v-if="logo" class="brand-logo-container" :class="containerClasses">
      <img 
        :src="sanitizedLogoUrl" 
        :alt="logo.alt || 'Personal Brand Logo'"
        class="brand-logo-image"
        :class="imageClasses"
        :style="imageStyles"
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
import { usePodsData } from '@composables/usePodsData';

const props = defineProps({
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
});

const { podsData } = usePodsData();

// SINGLE FIELD PATTERN: Simple logo object or null
const logo = computed(() => {
  // ROOT FIX: Add null safety checks for podsData
  // podsData might be undefined during initial render
  if (!podsData || !podsData.value) {
    // Fallback to custom logo if Pods data not available
    return props.data?.logo || null;
  }
  
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

// ROOT FIX: Fix URL encoding issues
// WordPress sometimes returns HTML-encoded URLs, we need to decode them
const sanitizedLogoUrl = computed(() => {
  if (!logo.value?.url) return '';
  
  let url = logo.value.url;
  
  // ROOT FIX: Decode HTML entities
  // This fixes issues like &amp; becoming & and &#x2F; becoming /
  const textarea = document.createElement('textarea');
  textarea.innerHTML = url;
  url = textarea.value;
  
  // ROOT FIX: Ensure URL is properly formatted
  // Remove any double slashes except after protocol
  url = url.replace(/([^:]\/)\/+/g, '$1');
  
  return url;
});

const componentClasses = computed(() => ({
  'has-logo': !!logo.value,
  'no-logo': !logo.value,
  // ROOT FIX: Add null safety for podsData access
  'pods-source': props.data?.usePodsData && podsData?.value && !!podsData.value?.personal_brand_logo,
  'custom-source': !props.data?.usePodsData || !podsData?.value || !podsData.value?.personal_brand_logo
}));

// ROOT FIX: Apply size and alignment settings from component data
const imageClasses = computed(() => {
  const classes = [];
  
  // Apply size class
  const size = props.data?.size || 'medium';
  classes.push(`logo-size-${size}`);
  
  return classes.join(' ');
});

// ROOT FIX: Dynamic image styles based on size setting
const imageStyles = computed(() => {
  const styles = {};
  const size = props.data?.size || 'medium';
  
  // Define size mappings
  const sizeMap = {
    'small': '150px',
    'medium': '250px',
    'large': '350px'
  };
  
  styles.maxWidth = sizeMap[size] || '250px';
  styles.maxHeight = sizeMap[size] || '250px';
  
  return styles;
});

// ROOT FIX: Get alignment class for container positioning
const containerClasses = computed(() => {
  const alignment = props.data?.alignment || 'center';
  return `align-${alignment}`;
});
</script>

<style scoped>
.personal-brand-logo-component {
  width: 100%;
  padding: var(--spacing-md, 1rem);
}

.brand-logo-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 0.75rem);
}

/* ROOT FIX: Dynamic alignment based on advanced settings */
.brand-logo-container.align-left {
  align-items: flex-start;
}

.brand-logo-container.align-center {
  align-items: center;
}

.brand-logo-container.align-right {
  align-items: flex-end;
}

.brand-logo-image {
  width: 100%;
  height: auto;
  object-fit: contain;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* ROOT FIX: Size variations (these are overridden by inline styles) */
.brand-logo-image.logo-size-small {
  max-width: 150px;
  max-height: 150px;
}

.brand-logo-image.logo-size-medium {
  max-width: 250px;
  max-height: 250px;
}

.brand-logo-image.logo-size-large {
  max-width: 350px;
  max-height: 350px;
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
