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
  <div class="debounced-input" :class="{ 'has-error': hasError, 'is-valid': isValid && showValidation }">
    <!-- Text Input -->
    <input
      v-if="type === 'text' || type === 'email' || type === 'url'"
      ref="inputRef"
      :type="type"
      :value="displayValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[inputClass, { 'input-error': hasError, 'input-valid': isValid && showValidation }]"
      :required="required"
      :minlength="minLength"
      :maxlength="maxLength"
      :pattern="pattern"
      :aria-invalid="hasError"
      :aria-describedby="hasError ? `${inputId}-error` : undefined"
      @input="handleTextInput"
      @blur="handleBlur"
    />

    <!-- Textarea -->
    <textarea
      v-else-if="type === 'textarea'"
      ref="inputRef"
      :value="displayValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      :class="[inputClass, { 'input-error': hasError, 'input-valid': isValid && showValidation }]"
      :required="required"
      :minlength="minLength"
      :maxlength="maxLength"
      :aria-invalid="hasError"
      :aria-describedby="hasError ? `${inputId}-error` : undefined"
      @input="handleTextInput"
      @blur="handleBlur"
    />

    <!-- Number Input -->
    <input
      v-else-if="type === 'number'"
      ref="inputRef"
      type="number"
      :value="displayValue"
      :min="min"
      :max="max"
      :step="step"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[inputClass, { 'input-error': hasError, 'input-valid': isValid && showValidation }]"
      :required="required"
      :aria-invalid="hasError"
      :aria-describedby="hasError ? `${inputId}-error` : undefined"
      @input="handleNumberInput"
      @blur="handleBlur"
    />

    <!-- Range Slider -->
    <div v-else-if="type === 'range'" class="range-wrapper">
      <input
        ref="inputRef"
        type="range"
        :value="displayValue"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        :class="inputClass"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="displayValue"
        @input="handleRangeInput"
        @change="handleBlur"
      />
      <span class="range-value" aria-hidden="true">{{ displayValue }}</span>
    </div>

    <!-- Color Picker -->
    <input
      v-else-if="type === 'color'"
      ref="inputRef"
      type="color"
      :value="displayValue"
      :disabled="disabled"
      :class="inputClass"
      :aria-label="placeholder || 'Color picker'"
      @input="handleColorInput"
      @change="handleBlur"
    />

    <!-- Character count (for text inputs with maxLength) -->
    <div
      v-if="showCharCount && maxLength && (type === 'text' || type === 'textarea')"
      class="char-count"
      :class="{ 'char-count-warning': charCountWarning, 'char-count-error': charCountError }"
      aria-live="polite"
    >
      {{ displayValue?.length || 0 }}/{{ maxLength }}
    </div>

    <!-- Saving indicator -->
    <transition name="fade">
      <span v-if="isPending && !hasError" class="saving-indicator" aria-live="polite">
        <svg class="spinner" width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="60" stroke-dashoffset="0">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
          </circle>
        </svg>
        Saving...
      </span>
    </transition>

    <!-- Validation error message -->
    <transition name="slide-fade">
      <div
        v-if="hasError && errorMessage"
        :id="`${inputId}-error`"
        class="error-message"
        role="alert"
      >
        <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
        {{ errorMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { debounce, throttle } from '../../utils/optimized';

// Generate unique ID for ARIA
let idCounter = 0;
const inputId = `debounced-input-${++idCounter}`;

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
  },
  // Validation props
  required: {
    type: Boolean,
    default: false
  },
  minLength: {
    type: Number,
    default: null
  },
  maxLength: {
    type: Number,
    default: null
  },
  pattern: {
    type: String,
    default: null
  },
  customValidator: {
    type: Function,
    default: null
  },
  errorMessages: {
    type: Object,
    default: () => ({
      required: 'This field is required',
      email: 'Please enter a valid email address',
      url: 'Please enter a valid URL',
      minLength: 'Must be at least {min} characters',
      maxLength: 'Must be no more than {max} characters',
      pattern: 'Please match the requested format',
      min: 'Value must be at least {min}',
      max: 'Value must be no more than {max}'
    })
  },
  validateOnBlur: {
    type: Boolean,
    default: true
  },
  showCharCount: {
    type: Boolean,
    default: false
  },
  showValidation: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'validation']);

// Local state
const inputRef = ref(null);
const displayValue = ref(props.modelValue);
const isPending = ref(false);
const pendingTimer = ref(null);
const hasBeenTouched = ref(false);
const validationError = ref(null);

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (newValue !== displayValue.value) {
    displayValue.value = newValue;
  }
});

// Validation computed properties
const hasError = computed(() => {
  if (!props.showValidation) return false;
  if (!hasBeenTouched.value && !props.validateOnBlur) return false;
  return validationError.value !== null;
});

const isValid = computed(() => {
  if (!hasBeenTouched.value) return false;
  return validationError.value === null && displayValue.value !== '';
});

const errorMessage = computed(() => validationError.value);

// Character count helpers
const charCountWarning = computed(() => {
  if (!props.maxLength) return false;
  const len = String(displayValue.value || '').length;
  return len >= props.maxLength * 0.8 && len < props.maxLength;
});

const charCountError = computed(() => {
  if (!props.maxLength) return false;
  return String(displayValue.value || '').length >= props.maxLength;
});

/**
 * Validate the current value
 */
function validate(value) {
  const val = value ?? displayValue.value;
  const strVal = String(val || '');

  // Required check
  if (props.required && (!val || strVal.trim() === '')) {
    return props.errorMessages.required;
  }

  // Skip other validations if empty and not required
  if (!val && !props.required) {
    return null;
  }

  // Email validation
  if (props.type === 'email' && val) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(strVal)) {
      return props.errorMessages.email;
    }
  }

  // URL validation
  if (props.type === 'url' && val) {
    try {
      new URL(strVal);
    } catch {
      return props.errorMessages.url;
    }
  }

  // Min length check
  if (props.minLength !== null && strVal.length < props.minLength) {
    return props.errorMessages.minLength.replace('{min}', props.minLength);
  }

  // Max length check
  if (props.maxLength !== null && strVal.length > props.maxLength) {
    return props.errorMessages.maxLength.replace('{max}', props.maxLength);
  }

  // Pattern check
  if (props.pattern && val) {
    const regex = new RegExp(props.pattern);
    if (!regex.test(strVal)) {
      return props.errorMessages.pattern;
    }
  }

  // Number range checks
  if (props.type === 'number') {
    const numVal = parseFloat(val);
    if (!isNaN(numVal)) {
      if (numVal < props.min) {
        return props.errorMessages.min.replace('{min}', props.min);
      }
      if (numVal > props.max) {
        return props.errorMessages.max.replace('{max}', props.max);
      }
    }
  }

  // Custom validator
  if (props.customValidator) {
    const customError = props.customValidator(val);
    if (customError) return customError;
  }

  return null;
}

/**
 * Run validation and update state
 */
function runValidation(value) {
  const error = validate(value);
  validationError.value = error;
  emit('validation', { valid: error === null, error });
  return error === null;
}

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
 * Handle blur event - immediately save and validate
 */
function handleBlur() {
  // Mark as touched for validation display
  hasBeenTouched.value = true;

  // Cancel pending debounced update
  debouncedUpdate.cancel?.();

  // Immediately emit current value
  if (displayValue.value !== props.modelValue) {
    emit('update:modelValue', displayValue.value);
    emit('change', displayValue.value);
  }

  // Run validation on blur
  if (props.validateOnBlur) {
    runValidation(displayValue.value);
  }

  isPending.value = false;
  emit('blur', displayValue.value);
}

// Expose validation method for parent components
defineExpose({
  validate: () => runValidation(displayValue.value),
  isValid: () => validationError.value === null,
  focus: () => inputRef.value?.focus()
});
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

/* Validation styles */
.input-error {
  border-color: #ef4444 !important;
  background-color: rgba(239, 68, 68, 0.05);
}

.input-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-valid {
  border-color: #10b981;
}

.input-valid:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* Error message */
.error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  padding: 8px 12px;
  font-size: 13px;
  color: #dc2626;
  background: rgba(239, 68, 68, 0.08);
  border-radius: 6px;
  border-left: 3px solid #ef4444;
}

.error-message i {
  font-size: 14px;
  flex-shrink: 0;
}

/* Character count */
.char-count {
  position: absolute;
  right: 12px;
  bottom: -20px;
  font-size: 11px;
  color: #9ca3af;
  transition: color 0.2s;
}

.char-count-warning {
  color: #f59e0b;
}

.char-count-error {
  color: #ef4444;
  font-weight: 500;
}

/* Slide fade transition for error message */
.slide-fade-enter-active {
  transition: all 0.2s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.15s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Validation state indicators */
.has-error .form-input {
  padding-right: 36px;
}

.is-valid .form-input::after {
  content: '✓';
  position: absolute;
  right: 12px;
  color: #10b981;
}
</style>
