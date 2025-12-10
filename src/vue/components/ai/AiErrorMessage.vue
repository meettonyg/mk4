<template>
  <div class="gmkb-ai-error">
    <svg class="gmkb-ai-error__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    <div class="gmkb-ai-error__content">
      <p class="gmkb-ai-error__message">{{ message }}</p>
      <button
        v-if="retryable"
        class="gmkb-ai-error__retry"
        @click="$emit('retry')"
      >
        Try Again
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  /**
   * Error message to display
   */
  message: {
    type: String,
    required: true
  },

  /**
   * Whether a retry button should be shown
   */
  retryable: {
    type: Boolean,
    default: false
  }
});

defineEmits(['retry']);
</script>
