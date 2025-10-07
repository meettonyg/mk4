/**
 * Debounced Input Component
 * 
 * ROOT FIX: Prevents excessive re-renders from input events
 * Debounces all text inputs, throttles sliders
 * 
 * @package GMKB
 * @version 2.0.0
 */

<template>
  <div class="debounced-input">
    <!-- Text Input -->
    <input
      v-if="type === 'text' || type === 'email' || type === 'url'"
      :type="type"
      :value="displayValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="inputClass"
      @input="handleTextInput"
      @blur="handleBlur"
    />
    
    <!-- Textarea -->
    <textarea
      v-else-if="type === 'textarea'"
      :value="displayValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      :class="inputClass"
      @input="handleTextInput"
      @blur="handleBlur"
    />
    
    <!-- Number Input -->
    <input
      v-else-if="type === 'number'"
      type="number"
      :value="displayValue"
      :min="min"
      :max="max"
      :step="step"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="inputClass"
      @input="handleNumberInput"
      @blur="handleBlur"
    />
    
    <!-- Range Slider -->
    <div v-else-if="type === 'range'" class="range-wrapper">
      <input
        type="range"
        :value="displayValue"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        :class="inputClass"
        @input="handleRangeInput"
        @change="handleBlur"
      />
      <span class="range-value">{{ displayValue }}</span>
    </div>
    
    <!-- Color Picker -->
    <input
      v-else-if="type === 'color'"
      type="color"
      :value="displayValue"
      :disabled="disabled"
      :class="inputClass"
      @input="handleColorInput"
      @change="handleBlur"
    />
    
    <!-- Saving indicator -->
    <transition name="fade">
      <span v-if="isPending" class="saving-indicator">
        <svg class="spinner" width="12" height="12" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="60" stroke-dashoffset="0">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
          </circle>
        </svg>
        Saving...
      </span>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { debounce, throttle } from '../../utils/optimized';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) => [
      'text', 'email', 'url', 'textarea', 'number', 
      'range', 'color'
    ].includes(value)
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  debounceDelay: {
    type: Number,
    default: 300
  },
  throttleDelay: {
    type: Number,
    default: 100
  },
  // Number/Range props
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  step: {
    type: Number,
    default: 1
  },
  // Textarea props
  rows: {
    type: Number,
    default: 3
  },
  // Styling
  inputClass: {
    type: String,
    default: 'form-input'
  },
  showSaveIndicator: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'change', 'blur']);

// Local state
const displayValue = ref(props.modelValue);
const isPending = ref(false);
const pendingTimer = ref(null);

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (newValue !== displayValue.value) {
    displayValue.value = newValue;
  }
});

/**
 * Create debounced update function
 */
const debouncedUpdate = debounce((value) => {
  emit('update:modelValue', value);
  emit('change', value);
  isPending.value = false;
}, props.debounceDelay);

/**
 * Create throttled update for sliders
 */
const throttledUpdate = throttle((value) => {
  emit('update:modelValue', value);
  displayValue.value = value;
}, props.throttleDelay);

/**
 * Handle text input
 */
function handleTextInput(event) {
  const value = event.target.value;
  displayValue.value = value;
  
  if (props.showSaveIndicator) {
    isPending.value = true;
  }
  
  debouncedUpdate(value);
}

/**
 * Handle number input
 */
function handleNumberInput(event) {
  const value = parseFloat(event.target.value) || 0;
  displayValue.value = value;
  
  if (props.showSaveIndicator) {
    isPending.value = true;
  }
  
  debouncedUpdate(value);
}

/**
 * Handle range input (throttled)
 */
function handleRangeInput(event) {
  const value = parseFloat(event.target.value);
  throttledUpdate(value);
}

/**
 * Handle color input (throttled)
 */
const handleColorInput = throttle((event) => {
  const value = event.target.value;
  displayValue.value = value;
  emit('update:modelValue', value);
}, 200);

/**
 * Handle blur event - immediately save
 */
function handleBlur() {
  // Cancel pending debounced update
  debouncedUpdate.cancel?.();
  
  // Immediately emit current value
  if (displayValue.value !== props.modelValue) {
    emit('update:modelValue', displayValue.value);
    emit('change', displayValue.value);
  }
  
  isPending.value = false;
  emit('blur', displayValue.value);
}
</script>

<style scoped>
.debounced-input {
  position: relative;
  display: inline-block;
  width: 100%;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Range slider styles */
.range-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.range-value {
  min-width: 3ch;
  font-size: 14px;
  color: #6b7280;
}

/* Saving indicator */
.saving-indicator {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
  pointer-events: none;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Textarea specific */
textarea.form-input {
  resize: vertical;
  min-height: 60px;
}

/* Color input specific */
input[type="color"].form-input {
  height: 40px;
  padding: 4px;
  cursor: pointer;
}

/* Range input specific */
input[type="range"] {
  flex: 1;
}
</style>
