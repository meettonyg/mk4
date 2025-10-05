<!-- Vue Error Boundary Component
     Catches errors in child components and provides fallback UI
     ROOT FIX: Prevents entire app crash from component errors -->
<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-boundary__content">
      <div class="error-boundary__icon">⚠️</div>
      <h3 class="error-boundary__title">Component Error</h3>
      <p class="error-boundary__message">{{ errorMessage }}</p>
      
      <div class="error-boundary__actions">
        <button @click="retry" class="error-boundary__btn error-boundary__btn--primary">
          Retry
        </button>
        <button @click="reset" class="error-boundary__btn">
          Reset Component
        </button>
      </div>
      
      <details v-if="showDetails" class="error-boundary__details">
        <summary>Error Details</summary>
        <pre>{{ errorDetails }}</pre>
      </details>
    </div>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured, defineEmits, defineProps } from 'vue';

const props = defineProps({
  showDetails: {
    type: Boolean,
    default: false
  },
  fallback: {
    type: String,
    default: ''
  },
  onError: {
    type: Function,
    default: null
  }
});

const emit = defineEmits(['error', 'retry', 'reset']);

const hasError = ref(false);
const errorMessage = ref('');
const errorDetails = ref('');
const errorInfo = ref(null);

// Catch errors from child components
onErrorCaptured((err, instance, info) => {
  hasError.value = true;
  errorMessage.value = err.message || 'An unexpected error occurred';
  errorDetails.value = err.stack || err.toString();
  errorInfo.value = { err, instance, info };
  
  // Log error in development
  if (window.gmkbData?.debugMode) {
    console.error('🔥 Error Boundary caught:', err);
    console.error('Component:', instance);
    console.error('Info:', info);
  }
  
  // Call custom error handler if provided
  if (props.onError) {
    props.onError(err, instance, info);
  }
  
  // Emit error event
  emit('error', { error: err, instance, info });
  
  // Report to error tracking service in production
  if (window.gmkbData?.environment === 'production') {
    // TODO: Send to error tracking service like Sentry
    console.error('Production error:', {
      message: err.message,
      stack: err.stack,
      component: instance?.$options.name || 'Unknown',
      info
    });
  }
  
  // Prevent error from propagating
  return false;
});

// Retry rendering the component
const retry = () => {
  hasError.value = false;
  errorMessage.value = '';
  errorDetails.value = '';
  emit('retry');
};

// Reset component completely
const reset = () => {
  hasError.value = false;
  errorMessage.value = '';
  errorDetails.value = '';
  
  // Force re-render by changing key
  emit('reset');
};
</script>

<style scoped>
.error-boundary {
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.error-boundary__content {
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}

.error-boundary__icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.error-boundary__title {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px;
}

.error-boundary__message {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 24px;
}

.error-boundary__actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}

.error-boundary__btn {
  padding: 10px 20px;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.error-boundary__btn:hover {
  background: #f8fafc;
}

.error-boundary__btn--primary {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #fff;
}

.error-boundary__btn--primary:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.error-boundary__details {
  text-align: left;
  margin-top: 24px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 6px;
}

.error-boundary__details summary {
  cursor: pointer;
  font-weight: 500;
  color: #475569;
  margin-bottom: 12px;
}

.error-boundary__details pre {
  margin: 0;
  font-size: 12px;
  color: #ef4444;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
