<template>
  <!-- V2 ARCHITECTURE: Single root element with component-root class -->
  <!-- ROOT FIX: Removed data-component-id - it's on the wrapper, not here -->
  <div 
    class="component-root hero-component"
    :class="{ 'hero--has-bg': backgroundImage }"
  >
    <div class="hero-overlay" v-if="backgroundImage"></div>
    
    <div class="hero-content">
      <!-- Placeholder content when editing with no data -->
      <template v-if="showPlaceholders">
        <h1 class="hero-title hero-title--placeholder">Your Headline Here</h1>
        <p class="hero-subtitle hero-subtitle--placeholder">Add a compelling subtitle or tagline</p>
        <div class="hero-actions">
          <span class="hero-cta hero-cta--placeholder">Call to Action</span>
        </div>
      </template>

      <!-- Actual content when data exists -->
      <template v-else>
        <h1 v-if="title" class="hero-title">{{ title }}</h1>
        <p v-if="subtitle" class="hero-subtitle">{{ subtitle }}</p>
        <div v-if="ctaText" class="hero-actions">
          <a :href="ctaUrl || '#'" class="hero-cta">{{ ctaText }}</a>
        </div>
      </template>
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
const title = computed(() => props.data?.title || props.props?.title || '');
const subtitle = computed(() => props.data?.subtitle || props.props?.subtitle || '');

const backgroundImage = computed(() => props.data?.backgroundImage || props.props?.backgroundImage || '');
const ctaText = computed(() => props.data?.ctaText || props.props?.ctaText || '');
const ctaUrl = computed(() => props.data?.ctaUrl || props.props?.ctaUrl || '#');
const alignment = computed(() => props.data?.alignment || props.props?.alignment || 'center');

// Check if any content exists
const hasContent = computed(() => {
  return title.value || subtitle.value || ctaText.value || backgroundImage.value;
});

// Show placeholders when editing with no data configured
const showPlaceholders = computed(() => {
  return !hasContent.value && (props.isEditing || props.isSelected);
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
  font-size: clamp(2rem, 5vw, 3.5rem); /* Keep responsive */
  /* font-weight inherited from component-root */
  margin: 0 0 1rem;
  /* line-height inherited from component-root */
  color: inherit;
}

.hero--has-bg .hero-title {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.25rem);
  margin: 0 0 2rem;
  /* line-height inherited from component-root */
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
  /* font-weight inherited from component-root */
  text-decoration: none;
  border-radius: var(--button-radius, 6px);
  transition: all 0.3s ease;
  background-color: var(--primary-color, #3b82f6);
  color: var(--button-text-color, white);
  cursor: pointer;
}

.hero-cta:hover {
  background-color: var(--primary-hover, #2563eb);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.hero--has-bg .hero-cta {
  background-color: var(--button-bg-on-image, white);
  color: var(--button-text-on-image, #3b82f6);
}

.hero--has-bg .hero-cta:hover {
  background-color: var(--button-bg-hover-on-image, #f8f9fa);
}

/* Placeholder styles for editing mode */
.hero-title--placeholder,
.hero-subtitle--placeholder {
  opacity: 0.6;
  font-style: italic;
}

.hero-cta--placeholder {
  opacity: 0.6;
  border: 2px dashed var(--border-color, #cbd5e1);
  cursor: default;
}

.hero-cta--placeholder:hover {
  transform: none;
  box-shadow: none;
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
