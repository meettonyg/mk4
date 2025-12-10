<template>
  <div class="gmkb-ai-usage" :class="usageClass">
    <svg class="gmkb-ai-usage__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
    <span class="gmkb-ai-usage__text">
      <template v-if="remaining > 0">
        {{ remaining }} of {{ limit }} free {{ remaining === 1 ? 'generation' : 'generations' }} remaining
      </template>
      <template v-else>
        Free limit reached. Resets {{ resetTimeFormatted }}
      </template>
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  /**
   * Remaining generations
   */
  remaining: {
    type: Number,
    required: true
  },

  /**
   * Total limit
   */
  limit: {
    type: Number,
    default: 3
  },

  /**
   * Time until reset (seconds)
   */
  resetTime: {
    type: Number,
    default: null
  }
});

/**
 * CSS class based on remaining usage
 */
const usageClass = computed(() => {
  if (props.remaining === 0) return 'gmkb-ai-usage--exhausted';
  if (props.remaining === 1) return 'gmkb-ai-usage--warning';
  return '';
});

/**
 * Format reset time for display
 */
const resetTimeFormatted = computed(() => {
  if (!props.resetTime) return 'soon';

  const minutes = Math.floor(props.resetTime / 60);
  if (minutes < 1) return 'in less than a minute';
  if (minutes === 1) return 'in 1 minute';
  if (minutes < 60) return `in ${minutes} minutes`;

  const hours = Math.floor(minutes / 60);
  if (hours === 1) return 'in about 1 hour';
  return `in about ${hours} hours`;
});
</script>
