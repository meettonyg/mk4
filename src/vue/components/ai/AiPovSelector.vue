<template>
  <div class="gmkb-ai-form-group">
    <label class="gmkb-ai-label">Point of View</label>
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
    <span v-if="showExample && selectedOption" class="gmkb-ai-hint">
      Example: "{{ selectedOption.example }}"
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { POV_OPTIONS } from '../../../composables/useAIBiography';

const props = defineProps({
  /**
   * Selected POV value
   */
  modelValue: {
    type: String,
    default: 'third'
  },

  /**
   * Available POV options (defaults to standard options)
   */
  options: {
    type: Array,
    default: () => POV_OPTIONS
  },

  /**
   * Whether to show usage example
   */
  showExample: {
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
