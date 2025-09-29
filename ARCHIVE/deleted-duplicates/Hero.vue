<template>
  <div 
    class="gmkb-hero" 
    :class="classList"
    :style="heroStyle"
  >
    <div class="hero-overlay" v-if="backgroundImage"></div>
    <div class="hero-content">
      <h1 class="hero-title" v-if="title">{{ title }}</h1>
      <p class="hero-subtitle" v-if="subtitle">{{ subtitle }}</p>
      <div class="hero-actions" v-if="ctaText">
        <a 
          :href="ctaUrl" 
          class="hero-cta btn btn--primary"
          @click="handleCtaClick"
        >
          {{ ctaText }}
        </a>
        <a 
          v-if="secondaryCtaText"
          :href="secondaryCtaUrl" 
          class="hero-cta btn btn--secondary"
        >
          {{ secondaryCtaText }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePodsData } from '../../composables/usePodsData';

const props = defineProps({
  componentId: String,
  data: {
    type: Object,
    default: () => ({})
  },
  settings: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update', 'remove', 'cta-click']);

// OPTIMIZED: No API calls here - just accessing store data
const podsData = usePodsData();

const title = computed(() => 
  props.data?.title || podsData.fullName.value || 'Welcome to Your Media Kit'
);

const subtitle = computed(() =>
  props.data?.subtitle || podsData.tagline.value || ''
);

const backgroundImage = computed(() =>
  props.data?.backgroundImage || ''
);

const ctaText = computed(() =>
  props.data?.ctaText || ''
);

const ctaUrl = computed(() =>
  props.data?.ctaUrl || '#'
);

const secondaryCtaText = computed(() =>
  props.data?.secondaryCtaText || ''
);

const secondaryCtaUrl = computed(() =>
  props.data?.secondaryCtaUrl || '#'
);

const heroStyle = computed(() => {
  const style = {};
  if (backgroundImage.value) {
    style.backgroundImage = `url(${backgroundImage.value})`;
  }
  if (props.settings?.minHeight) {
    style.minHeight = `${props.settings.minHeight}px`;
  }
  return style;
});

const classList = computed(() => ({
  'hero--left': props.settings?.alignment === 'left',
  'hero--center': props.settings?.alignment === 'center',
  'hero--right': props.settings?.alignment === 'right',
  'hero--has-bg': !!backgroundImage.value,
  'hero--dark': props.settings?.variant === 'dark',
  'hero--fullscreen': props.settings?.fullscreen === true
}));

const handleCtaClick = (e) => {
  emit('cta-click', e);
  // Track analytics if needed
  console.log('Hero CTA clicked:', ctaUrl.value);
};
</script>

<style scoped>
.gmkb-hero {
  position: relative;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl, 4rem) var(--spacing-lg, 2rem);
  background-color: var(--color-surface, #f8f9fa);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
  transition: all 0.3s ease;
}

.hero--fullscreen {
  min-height: 100vh;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(0, 0, 0, 0.5) 0%, 
    rgba(0, 0, 0, 0.3) 100%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: var(--max-width, 800px);
  width: 100%;
  text-align: center;
}

.hero--left .hero-content {
  text-align: left;
}

.hero--right .hero-content {
  text-align: right;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  margin: 0 0 1rem;
  color: var(--color-text, #1a1a1a);
  line-height: 1.2;
}

.hero--has-bg .hero-title,
.hero--dark .hero-title {
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.25rem);
  margin: 0 0 2rem;
  color: var(--color-text-light, #666);
  line-height: 1.6;
}

.hero--has-bg .hero-subtitle,
.hero--dark .hero-subtitle {
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.hero--center .hero-actions {
  justify-content: center;
}

.hero--right .hero-actions {
  justify-content: flex-end;
}

.hero-cta {
  display: inline-block;
  padding: 12px 32px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: var(--radius-sm, 6px);
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn--primary {
  background-color: var(--color-primary, #3b82f6);
  color: white;
  border: 2px solid var(--color-primary, #3b82f6);
}

.btn--primary:hover {
  background-color: var(--color-primary-hover, #2563eb);
  border-color: var(--color-primary-hover, #2563eb);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn--secondary {
  background-color: transparent;
  color: var(--color-primary, #3b82f6);
  border: 2px solid var(--color-primary, #3b82f6);
}

.btn--secondary:hover {
  background-color: var(--color-primary, #3b82f6);
  color: white;
  transform: translateY(-2px);
}

.hero--has-bg .btn--primary,
.hero--dark .btn--primary {
  background-color: white;
  color: var(--color-primary, #3b82f6);
  border-color: white;
}

.hero--has-bg .btn--primary:hover,
.hero--dark .btn--primary:hover {
  background-color: #f8f9fa;
  border-color: #f8f9fa;
}

.hero--has-bg .btn--secondary,
.hero--dark .btn--secondary {
  color: white;
  border-color: white;
}

.hero--has-bg .btn--secondary:hover,
.hero--dark .btn--secondary:hover {
  background-color: white;
  color: var(--color-primary, #3b82f6);
}

/* Dark variant */
.hero--dark {
  background-color: var(--color-surface-dark, #1a1a1a);
}

/* Responsive */
@media (max-width: 768px) {
  .gmkb-hero {
    padding: var(--spacing-xl, 3rem) var(--spacing-md, 1.5rem);
    min-height: 300px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .hero-cta {
    width: 100%;
    text-align: center;
  }
}
</style>
