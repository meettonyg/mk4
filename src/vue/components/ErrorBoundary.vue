<template>
  <div class="error-boundary">
    <div v-if="hasError" class="error-boundary__error">
      <div class="error-boundary__icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
      </div>
      
      <h3 class="error-boundary__title">Component Error</h3>
      
      <p class="error-boundary__message">
        {{ errorMessage || 'An error occurred in this component' }}
      </p>
      
      <div v-if="showDetails && errorDetails" class="error-boundary__details">
        <details>
          <summary>Error Details</summary>
          <pre>{{ errorDetails }}</pre>
        </details>
      </div>
      
      <div class="error-boundary__actions">
        <button @click="retry" class="error-boundary__button error-boundary__button--primary">
          Retry
        </button>
        <button @click="reset" class="error-boundary__button error-boundary__button--secondary">
          Reset Component
        </button>
      </div>
    </div>
    
    <slot v-else />
  </div>
</template>

<script>
import { ref, onErrorCaptured, watch } from 'vue';

export default {
  name: 'ErrorBoundary',
  
  props: {
    showDetails: {
      type: Boolean,
      default: false
    },
    fallback: {
      type: Object,
      default: null
    },
    onError: {
      type: Function,
      default: null
    }
  },
  
  setup(props, { slots }) {
    const hasError = ref(false);
    const errorMessage = ref('');
    const errorDetails = ref('');
    const errorCount = ref(0);
    
    // Capture errors from child components
    onErrorCaptured((err, instance, info) => {
      hasError.value = true;
      errorMessage.value = err?.message || 'Unknown error';
      errorDetails.value = `${err?.stack || err}\n\nComponent: ${instance?.$options.name || 'Unknown'}\nInfo: ${info}`;
      errorCount.value++;
      
      // Log error for debugging
      console.error('ErrorBoundary caught error:', {
        error: err,
        component: instance?.$options.name,
        info,
        count: errorCount.value
      });
      
      // Call custom error handler if provided
      if (props.onError) {
        props.onError(err, instance, info);
      }
      
      // Track error in analytics if available
      if (window.gmkbAnalytics?.track) {
        window.gmkbAnalytics.track('component_error', {
          error: errorMessage.value,
          component: instance?.$options.name || 'Unknown',
          info,
          errorCount: errorCount.value
        });
      }
      
      // Prevent error from propagating further
      return false;
    });
    
    // Reset error state
    const reset = () => {
      hasError.value = false;
      errorMessage.value = '';
      errorDetails.value = '';
      
      console.log('ErrorBoundary: Component reset');
    };
    
    // Retry rendering
    const retry = () => {
      // If we've retried too many times, don't retry again
      if (errorCount.value > 3) {
        console.error('ErrorBoundary: Too many retries, giving up');
        errorMessage.value = 'Component failed after multiple retries';
        return;
      }
      
      reset();
      console.log('ErrorBoundary: Retrying component render');
    };
    
    // Watch for slot changes to reset error state
    watch(() => slots.default?.(), () => {
      if (hasError.value) {
        console.log('ErrorBoundary: Slot changed, resetting error state');
        reset();
      }
    });
    
    return {
      hasError,
      errorMessage,
      errorDetails,
      reset,
      retry
    };
  }
};
</script>

<style scoped>
.error-boundary {
  width: 100%;
  height: 100%;
  position: relative;
}

.error-boundary__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  min-height: 200px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  margin: 1rem;
}

.error-boundary__icon {
  color: #dc2626;
  margin-bottom: 1rem;
}

.error-boundary__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #991b1b;
  margin: 0 0 0.5rem 0;
}

.error-boundary__message {
  color: #7f1d1d;
  margin: 0 0 1rem 0;
  max-width: 500px;
}

.error-boundary__details {
  width: 100%;
  max-width: 600px;
  margin: 1rem 0;
}

.error-boundary__details summary {
  cursor: pointer;
  color: #991b1b;
  font-weight: 500;
  margin-bottom: 0.5rem;
  user-select: none;
}

.error-boundary__details pre {
  background: #fff;
  border: 1px solid #fca5a5;
  border-radius: 4px;
  padding: 1rem;
  font-size: 0.875rem;
  overflow-x: auto;
  text-align: left;
  color: #7f1d1d;
  max-height: 300px;
  overflow-y: auto;
}

.error-boundary__actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.error-boundary__button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.error-boundary__button--primary {
  background: #dc2626;
  color: white;
  border-color: #dc2626;
}

.error-boundary__button--primary:hover {
  background: #b91c1c;
  border-color: #b91c1c;
}

.error-boundary__button--secondary {
  background: white;
  color: #dc2626;
  border-color: #fca5a5;
}

.error-boundary__button--secondary:hover {
  background: #fef2f2;
  border-color: #f87171;
}
</style>
