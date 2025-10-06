<template>
  <div v-if="hasError" class="gmkb-error-boundary">
    <div class="error-boundary__container">
      <div class="error-boundary__icon">⚠️</div>
      
      <h2 class="error-boundary__title">
        {{ errorTitle }}
      </h2>
      
      <p class="error-boundary__message">
        {{ errorMessage }}
      </p>
      
      <div v-if="showDetails && error" class="error-boundary__details">
        <details>
          <summary>Error Details</summary>
          <pre>{{ errorDetails }}</pre>
        </details>
      </div>
      
      <div class="error-boundary__actions">
        <button 
          @click="handleReset"
          class="error-boundary__button error-boundary__button--primary"
        >
          Try Again
        </button>
        
        <button 
          @click="handleReload"
          class="error-boundary__button error-boundary__button--secondary"
        >
          Reload Page
        </button>
        
        <button 
          v-if="onReport"
          @click="handleReport"
          class="error-boundary__button error-boundary__button--tertiary"
        >
          Report Issue
        </button>
      </div>
    </div>
  </div>
  
  <slot v-else></slot>
</template>

<script setup>
import { ref, computed, onErrorCaptured } from 'vue';
import { trackError } from '@/services/Analytics.js';

const props = defineProps({
  errorTitle: {
    type: String,
    default: 'Something went wrong'
  },
  errorMessage: {
    type: String,
    default: 'An unexpected error occurred. Please try again.'
  },
  showDetails: {
    type: Boolean,
    default: true
  },
  onReset: {
    type: Function,
    default: null
  },
  onReport: {
    type: Function,
    default: null
  },
  fallback: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['error', 'reset']);

// State
const hasError = ref(false);
const error = ref(null);
const errorInfo = ref(null);

// Computed
const errorDetails = computed(() => {
  if (!error.value) return '';
  
  return JSON.stringify({
    message: error.value.message,
    stack: error.value.stack,
    info: errorInfo.value
  }, null, 2);
});

/**
 * Error capture handler
 */
onErrorCaptured((err, instance, info) => {
  hasError.value = true;
  error.value = err;
  errorInfo.value = info;
  
  console.error('🔴 Error Boundary caught error:', {
    error: err,
    component: instance?.$options?.name,
    info
  });
  
  // Track error
  trackError(err, {
    component: instance?.$options?.name,
    info,
    boundary: 'ErrorBoundary'
  });
  
  // Emit error event
  emit('error', { error: err, info });
  
  // Prevent propagation
  return false;
});

/**
 * Handle reset
 */
const handleReset = () => {
  hasError.value = false;
  error.value = null;
  errorInfo.value = null;
  
  // Call custom reset handler
  if (props.onReset) {
    props.onReset();
  }
  
  emit('reset');
  
  console.log('🔄 Error boundary reset');
};

/**
 * Handle reload
 */
const handleReload = () => {
  window.location.reload();
};

/**
 * Handle report
 */
const handleReport = () => {
  if (props.onReport) {
    props.onReport({
      error: error.value,
      info: errorInfo.value
    });
  }
};
</script>

<style scoped>
.gmkb-error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.error-boundary__container {
  max-width: 600px;
  width: 100%;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.error-boundary__icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.error-boundary__title {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 12px;
}

.error-boundary__message {
  font-size: 16px;
  color: #718096;
  margin: 0 0 24px;
  line-height: 1.5;
}

.error-boundary__details {
  margin: 24px 0;
  text-align: left;
}

.error-boundary__details details {
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.error-boundary__details summary {
  cursor: pointer;
  font-weight: 500;
  color: #4a5568;
  user-select: none;
}

.error-boundary__details summary:hover {
  color: #2d3748;
}

.error-boundary__details pre {
  margin: 12px 0 0;
  padding: 12px;
  background: #2d3748;
  color: #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.4;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.error-boundary__actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.error-boundary__button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.error-boundary__button--primary {
  background: #3182ce;
  color: white;
}

.error-boundary__button--primary:hover {
  background: #2c5aa0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(49, 130, 206, 0.3);
}

.error-boundary__button--secondary {
  background: #e2e8f0;
  color: #2d3748;
}

.error-boundary__button--secondary:hover {
  background: #cbd5e0;
}

.error-boundary__button--tertiary {
  background: transparent;
  color: #4a5568;
  border: 1px solid #cbd5e0;
}

.error-boundary__button--tertiary:hover {
  background: #f7fafc;
  border-color: #a0aec0;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .gmkb-error-boundary {
    padding: 20px;
    min-height: 300px;
  }
  
  .error-boundary__container {
    padding: 24px;
  }
  
  .error-boundary__icon {
    font-size: 48px;
  }
  
  .error-boundary__title {
    font-size: 20px;
  }
  
  .error-boundary__message {
    font-size: 14px;
  }
  
  .error-boundary__actions {
    flex-direction: column;
  }
  
  .error-boundary__button {
    width: 100%;
  }
}
</style>
