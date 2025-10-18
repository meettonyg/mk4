<template>
  <button
    @click="handleReset"
    :class="['reset-button', `reset-${mode}`]"
    :title="tooltipText"
    :disabled="disabled"
  >
    <i class="fa-solid fa-rotate-left"></i>
    <span v-if="showLabel">{{ buttonText }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue';
import { useMediaKitStore } from '../../../stores/mediaKit';

const props = defineProps({
  componentId: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    default: 'settings',
    validator: v => ['settings', 'full'].includes(v)
  },
  showLabel: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const store = useMediaKitStore();

const buttonText = computed(() => {
  return props.mode === 'settings' ? 'Reset Styles' : 'Reset All';
});

const tooltipText = computed(() => {
  return props.mode === 'settings' 
    ? 'Reset component styles to defaults (preserves content)'
    : 'Reset component completely (clears content and styles)';
});

const handleReset = () => {
  const confirmMessage = props.mode === 'settings'
    ? 'Reset this component\'s styles to defaults?\n\n(Your content will be preserved)'
    : 'Reset this component completely?\n\n⚠️ WARNING: This will delete all content!';
  
  if (!confirm(confirmMessage)) return;
  
  const success = props.mode === 'settings' 
    ? store.resetComponentSettings(props.componentId)
    : store.resetComponent(props.componentId);
  
  if (success) {
    // Success notification dispatched via store action
    if (typeof window.showToast === 'function') {
      window.showToast(`Component ${props.mode === 'settings' ? 'styles' : 'fully'} reset`, 'success');
    }
  } else {
    // Error notification
    if (typeof window.showToast === 'function') {
      window.showToast('Failed to reset component', 'error');
    }
  }
};
</script>

<style scoped>
.reset-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background: white;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-button:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
}

.reset-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reset-button.reset-full {
  color: #dc2626;
  border-color: #fecaca;
}

.reset-button.reset-full:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #fca5a5;
}
</style>
