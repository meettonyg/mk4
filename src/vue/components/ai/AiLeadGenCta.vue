<template>
  <div class="gmkb-ai-cta" :class="`gmkb-ai-cta--${variant}`">
    <svg class="gmkb-ai-cta__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
    <div class="gmkb-ai-cta__content">
      <p class="gmkb-ai-cta__title">{{ title }}</p>
      <p class="gmkb-ai-cta__text">{{ text }}</p>
    </div>
    <a :href="signupUrl" class="gmkb-ai-cta__link" target="_blank">
      {{ buttonText }}
    </a>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  /**
   * CTA variant: 'default', 'exhausted', 'compact'
   */
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'exhausted', 'compact'].includes(v)
  }
});

/**
 * Get signup URL from global config
 */
const signupUrl = computed(() => {
  return window.gmkbPublicData?.signupUrl || '/pricing/';
});

/**
 * CTA title based on variant
 */
const title = computed(() => {
  switch (props.variant) {
    case 'exhausted':
      return 'Want unlimited generations?';
    case 'compact':
      return 'Go Pro';
    default:
      return 'Like what you see?';
  }
});

/**
 * CTA text based on variant
 */
const text = computed(() => {
  switch (props.variant) {
    case 'exhausted':
      return 'Upgrade to Pro for unlimited AI-powered content generation.';
    case 'compact':
      return 'Unlimited generations';
    default:
      return 'Get unlimited AI generations with a Pro account.';
  }
});

/**
 * Button text based on variant
 */
const buttonText = computed(() => {
  switch (props.variant) {
    case 'exhausted':
      return 'Upgrade Now';
    case 'compact':
      return 'Upgrade';
    default:
      return 'Learn More';
  }
});
</script>
