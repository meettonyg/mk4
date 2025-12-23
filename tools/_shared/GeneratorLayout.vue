<template>
  <div class="generator__container gmkb-generator-root" :class="containerClass">
    <!-- Header -->
    <div class="generator__header">
      <h1 class="generator__title">{{ title }}</h1>
      <p v-if="subtitle" class="generator__subtitle">{{ subtitle }}</p>
    </div>

    <!-- Main Content Area -->
    <div class="generator__content">
      <!-- Left Panel (Form) -->
      <div class="generator__panel generator__panel--left">
        <!-- Intro Text -->
        <p v-if="introText" class="generator__intro">{{ introText }}</p>

        <!-- Left Panel Slot (Form Fields, Authority Hook, etc.) -->
        <slot name="left"></slot>

        <!-- Results Area (appears in left panel below form) -->
        <div v-if="hasResults" class="generator__results">
          <slot name="results"></slot>
        </div>
      </div>

      <!-- Right Panel (Guidance) -->
      <div class="generator__panel generator__panel--right">
        <slot name="right"></slot>
      </div>
    </div>

    <!-- Footer (optional, for actions spanning full width) -->
    <div v-if="$slots.footer" class="generator__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  /**
   * Generator title (h1)
   */
  title: {
    type: String,
    required: true
  },

  /**
   * Subtitle below title
   */
  subtitle: {
    type: String,
    default: ''
  },

  /**
   * Introduction paragraph text
   */
  introText: {
    type: String,
    default: ''
  },

  /**
   * Generator type for specific styling (e.g., 'biography', 'topics')
   */
  generatorType: {
    type: String,
    default: ''
  },

  /**
   * Whether results are available to show
   */
  hasResults: {
    type: Boolean,
    default: false
  },

  /**
   * Loading state
   */
  isLoading: {
    type: Boolean,
    default: false
  }
});

/**
 * Container class based on generator type
 */
const containerClass = computed(() => {
  const classes = [];

  if (props.generatorType) {
    classes.push(`${props.generatorType}-generator`);
  }

  if (props.isLoading) {
    classes.push('generator--loading');
  }

  return classes;
});
</script>

<style>
/* Import the unified generator styles */
@import '@/styles/generator-unified.css';
</style>

<style scoped>
/* Component-specific styles that enhance the base system */
.generator--loading {
  opacity: 0.7;
  pointer-events: none;
}

.generator__footer {
  margin-top: var(--mkcg-space-lg);
  padding-top: var(--mkcg-space-md);
  border-top: 1px solid var(--mkcg-border-light);
}
</style>
