<template>
  <!-- When hideChrome is true, render content directly without container wrapper -->
  <template v-if="hideChrome">
    <slot name="left"></slot>
    <div v-if="hasResults" class="generator__results">
      <slot name="results"></slot>
    </div>
  </template>

  <!-- Full layout with container when not hiding chrome -->
  <div v-else class="generator__container gmkb-generator-root" :class="containerClass">
    <!-- Profile Context Banner (for logged-in users) -->
    <div v-if="$slots['profile-context']" class="generator__profile-context">
      <slot name="profile-context"></slot>
    </div>

    <!-- Header -->
    <div class="generator__header">
      <h1 class="generator__title">{{ title }}</h1>
      <p v-if="subtitle" class="generator__subtitle">{{ subtitle }}</p>
    </div>

    <!-- Main Content Area -->
    <div class="generator__content" :class="{ 'generator__content--single': singleColumn || !$slots.right }">
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

      <!-- Right Panel (Guidance) - hidden in single column mode -->
      <div v-if="!singleColumn && $slots.right" class="generator__panel generator__panel--right">
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
  },

  /**
   * Single column mode (no right panel)
   */
  singleColumn: {
    type: Boolean,
    default: false
  },

  /**
   * Hide chrome (header, profile banner) when inside EmbeddedToolWrapper
   */
  hideChrome: {
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

/* Single column mode - left panel takes full width */
.generator__content--single .generator__panel--left {
  flex: 1 1 100%;
  max-width: 100%;
}
</style>
