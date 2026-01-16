<template>
  <div class="generator__guidance">
    <!-- Header -->
    <h2 class="generator__guidance-header">
      <slot name="header-icon"></slot>
      {{ title }}
    </h2>
    <p v-if="subtitle" class="generator__guidance-subtitle">{{ subtitle }}</p>

    <!-- Formula Box -->
    <div v-if="formula || $slots.formula" class="generator__formula-box">
      <span class="generator__formula-label">FORMULA</span>
      <div v-if="formula" v-html="formula"></div>
      <slot v-else name="formula"></slot>
    </div>

    <!-- Process Steps -->
    <div v-if="processSteps.length > 0" class="generator__process">
      <div
        v-for="(step, index) in processSteps"
        :key="index"
        class="generator__process-step"
      >
        <div class="generator__process-icon">
          <component v-if="step.icon" :is="step.icon" />
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
            <text x="12" y="16" text-anchor="middle" font-size="12" fill="currentColor">{{ index + 1 }}</text>
          </svg>
        </div>
        <div class="generator__process-content">
          <h4 class="generator__process-title">{{ step.title }}</h4>
          <p class="generator__process-description">{{ step.description }}</p>
        </div>
      </div>
    </div>

    <!-- Custom Slot for Additional Process Steps -->
    <slot name="process"></slot>

    <!-- Examples Section -->
    <div v-if="examples.length > 0">
      <h3 class="generator__examples-header">{{ examplesTitle }}</h3>
      <div
        v-for="(example, index) in examples"
        :key="index"
        class="generator__example-card"
      >
        <strong>{{ example.title }}</strong>
        <p v-if="example.description">{{ example.description }}</p>
      </div>
    </div>

    <!-- Custom Slot for Additional Examples -->
    <slot name="examples"></slot>

    <!-- Default Slot for Any Additional Content -->
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  /**
   * Guidance panel title
   */
  title: {
    type: String,
    required: true
  },

  /**
   * Subtitle below the main header
   */
  subtitle: {
    type: String,
    default: ''
  },

  /**
   * Formula HTML content (supports highlighting)
   */
  formula: {
    type: String,
    default: ''
  },

  /**
   * Process steps array
   * Each step: { title: string, description: string, icon?: Component }
   */
  processSteps: {
    type: Array,
    default: () => []
  },

  /**
   * Example cards array
   * Each example: { title: string, description?: string }
   */
  examples: {
    type: Array,
    default: () => []
  },

  /**
   * Title for the examples section
   */
  examplesTitle: {
    type: String,
    default: 'Examples'
  }
});
</script>

<style scoped>
/* Component inherits base styles from generator-unified.css */
/* Add any component-specific overrides here */

.generator__guidance {
  /* Container for guidance content */
}

.generator__process {
  margin-bottom: var(--mkcg-space-lg, 30px);
}

:deep(.gfy-highlight) {
  color: var(--mkcg-primary, #3b82f6);
  font-weight: 700;
}

:deep(.generator__highlight) {
  color: var(--mkcg-primary, #3b82f6);
  font-weight: 700;
}
</style>
