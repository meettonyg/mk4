<template>
  <div class="gmkb-ai-form-group">
    <label class="gmkb-ai-label">Length</label>
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
    <span v-if="showWordCount && selectedOption" class="gmkb-ai-hint">
      Approximately {{ selectedOption.wordRange }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { LENGTH_OPTIONS } from '../../../composables/useAIBiography';

const props = defineProps({
  /**
   * Selected length value
   */
  modelValue: {
    type: String,
    default: 'medium'
  },

  /**
   * Available length options (defaults to standard options)
   */
  options: {
    type: Array,
    default: () => LENGTH_OPTIONS
  },

  /**
   * Whether to show word count range
   */
  showWordCount: {
    type: Boolean,
    default: true
  }
});

defineEmits(['update:modelValue']);

/**
 * Get the currently selected option object
 */
const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === props.modelValue);
});
</script>
