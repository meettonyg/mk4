<template>
  <button
    type="button"
    class="gmkb-ai-button gmkb-ai-button--primary"
    :class="{
      'gmkb-ai-button--full': fullWidth,
      'gmkb-ai-button--loading': loading
    }"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <span v-if="loading" class="gmkb-ai-spinner"></span>
    <svg v-else class="gmkb-ai-button__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
    <span>{{ loading ? loadingText : text }}</span>
  </button>
</template>

<script setup>
defineProps({
  /**
   * Button text
   */
  text: {
    type: String,
    default: 'Generate'
  },

  /**
   * Text shown while loading
   */
  loadingText: {
    type: String,
    default: 'Generating...'
  },

  /**
   * Loading state
   */
  loading: {
    type: Boolean,
    default: false
  },

  /**
   * Disabled state
   */
  disabled: {
    type: Boolean,
    default: false
  },

  /**
   * Full width button
   */
  fullWidth: {
    type: Boolean,
    default: false
  }
});

defineEmits(['click']);
</script>

<style scoped>
.gmkb-ai-button--loading {
  cursor: wait;
}

.gmkb-ai-button__icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
</style>
