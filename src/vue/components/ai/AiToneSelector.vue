<template>
  <div class="gmkb-ai-form-group">
    <label class="gmkb-ai-label">Tone</label>
    <div class="gmkb-ai-toggle-group">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="gmkb-ai-toggle"
        :class="{ 'gmkb-ai-toggle--active': modelValue === option.value }"
        @click="$emit('update:modelValue', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
    <span v-if="hint" class="gmkb-ai-hint">{{ hint }}</span>
  </div>
</template>

<script setup>
import { TONE_OPTIONS } from '../../../composables/useAIBiography';

defineProps({
  /**
   * Selected tone value
   */
  modelValue: {
    type: String,
    default: 'professional'
  },

  /**
   * Available tone options (defaults to standard options)
   */
  options: {
    type: Array,
    default: () => TONE_OPTIONS
  },

  /**
   * Optional hint text
   */
  hint: {
    type: String,
    default: ''
  }
});

defineEmits(['update:modelValue']);
</script>
