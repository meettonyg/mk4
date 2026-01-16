<template>
  <div class="component-renderer">
    <!-- Loading State -->
    <div v-if="isLoading" class="component-skeleton">
      <div class="skeleton-header"></div>
      <div class="skeleton-content">
        <div class="skeleton-line"></div>
        <div class="skeleton-line skeleton-line--short"></div>
      </div>
    </div>
    
    <!-- Error State -->
    <div v-else-if="hasError" class="component-error">
      <div class="error-icon">⚠️</div>
      <p class="error-message">Failed to load component</p>
      <button class="retry-button" @click="retry">
        <span>🔄</span> Retry
      </button>
    </div>
    
    <!-- Rendered Component -->
    <component
      v-else-if="canRender && componentType"
      :is="componentType"
      :key="componentKey"
      v-bind="componentProps"
      @ready="onComponentReady"
      @error="onComponentError"
    />
    
    <!-- Fallback for unknown component -->
    <div v-else class="component-fallback">
      <div class="fallback-icon">📦</div>
      <p class="fallback-message">Unknown component type: {{ componentData?.type }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useMediaKitStore } from '@/stores/mediaKit';
import UnifiedComponentRegistry from '@/services/UnifiedComponentRegistry';
// Issue #24 FIX: Removed EventBus import, using Pinia state and DOM events
import { useCleanup } from '@/composables/useCleanup';

const props = defineProps({
  componentId: {
    type: String,
    required: false, // CRITICAL FIX: Changed to false to handle undefined gracefully
    default: null
  },
  waitForPods: {
    type: Boolean,
    default: false  // Changed: Templates should render immediately with their data
  },
  retryAttempts: {
    type: Number,
    default: 3
  },
  retryDelay: {
    type: Number,
    default: 1000
  }
});

const emit = defineEmits(['ready', 'error', 'retry']);

const store = useMediaKitStore();
const { registerCleanup, addEventListener } = useCleanup();

// State
const isLoading = ref(true);
const hasError = ref(false);
const componentReady = ref(false);
const currentRetry = ref(0);
const componentKey = ref(0); // For force re-render

// Computed
const componentData = computed(() => {
  // CRITICAL FIX: Guard against undefined/null componentId
  if (!props.componentId) {
    console.error('❌ ComponentRenderer: componentId is undefined or null');
    return null;
  }
  
  // Check if component exists in store
  if (!store.components[props.componentId]) {
    console.warn(`⚠️ Component ${props.componentId} not found in store`);
    return null;
  }
  
  const component = store.components[props.componentId];
  
  // Ensure component has required data
  if (!component.type) {
    console.error(`❌ Component ${props.componentId} missing type property`);
    return null;
  }
  
  return component;
});

const canRender = computed(() => {
  // Check basic requirements
  if (!componentData.value) return false;

  // CARRD-LIKE UX: If component has data (from template), render immediately
  // Only wait for profile data if component data is empty AND waitForPods is true
  const hasComponentData = componentData.value.data && Object.keys(componentData.value.data).length > 0;

  if (hasComponentData) {
    // Component has template data - render immediately
    return true;
  }

  // No template data - check if we should wait for profile data
  if (props.waitForPods) {
    const profileDataAvailable = store.podsData && Object.keys(store.podsData).length > 0;
    if (!profileDataAvailable) {
      console.log(`⏳ Component ${props.componentId} has no data, waiting for profile data`);
      return false;
    }
  }

  return true;
});

const componentType = computed(() => {
  if (!componentData.value?.type) {
    console.warn('❌ ComponentRenderer: No component type provided');
    return null;
  }
  
  // ROOT FIX: Use getVueComponent instead of get
  // UnifiedComponentRegistry.get() returns the definition
  // UnifiedComponentRegistry.getVueComponent() returns the actual Vue component
  try {
    const vueComponent = UnifiedComponentRegistry.getVueComponent(componentData.value.type);
    
    if (!vueComponent) {
      console.error(`Component type not found: ${componentData.value.type}`);
      return null;
    }
    
    console.log(`✅ Loaded Vue component for type: ${componentData.value.type}`);
    return vueComponent;
    
  } catch (error) {
    console.error(`Failed to load component ${componentData.value.type}:`, error);
    return null;
  }
});

const componentProps = computed(() => {
  if (!componentData.value) return {};
  
  return {
    component: componentData.value,
    componentId: props.componentId,
    data: componentData.value.data || {},
    props: componentData.value.props || {},
    settings: componentData.value.settings || {}
  };
});

// Methods
const loadComponent = async () => {
  try {
    isLoading.value = true;
    hasError.value = false;
    
    // Issue #24 FIX: Wait for store initialization using Pinia state
    if (!store.isInitialized) {
      console.log(`⏳ Waiting for store initialization for component ${props.componentId}`);
      
      // Use Pinia $subscribe to wait for initialization
      await new Promise((resolve, reject) => {
        const unwatch = store.$subscribe((mutation, state) => {
          if (state.isInitialized) {
            unwatch();
            resolve();
          }
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          unwatch();
          reject(new Error('Store initialization timeout'));
        }, 5000);
      });
    }
    
    // CARRD-LIKE UX: Skip waiting for profile data if component has template data
    const component = store.components[props.componentId];
    const hasTemplateData = component?.data && Object.keys(component.data).length > 0;

    if (!hasTemplateData && props.waitForPods && (!store.podsData || Object.keys(store.podsData).length === 0)) {
      console.log(`⏳ Component ${props.componentId} has no data, waiting for profile data`);

      // Wait for profile data using DOM event (with timeout)
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.warn(`⚠️ Profile data timeout for component ${props.componentId}, rendering anyway`);
          resolve(); // Don't reject - just render with empty state
        }, 2000); // Reduced timeout - fail fast for better UX

        const handler = () => {
          clearTimeout(timeout);
          resolve();
        };

        document.addEventListener('gmkb:pods-loaded', handler, { once: true });
      });
    }
    
    // Verify component can render
    await nextTick();
    
    if (!canRender.value) {
      throw new Error(`Cannot render component ${props.componentId}: Missing required data`);
    }
    
    isLoading.value = false;
    emit('ready', props.componentId);
    
  } catch (error) {
    console.error(`Failed to load component ${props.componentId}:`, error);
    
    if (currentRetry.value < props.retryAttempts) {
      setTimeout(() => retry(), props.retryDelay);
    } else {
      hasError.value = true;
      isLoading.value = false;
      emit('error', { componentId: props.componentId, error });
    }
  }
};

const retry = async () => {
  currentRetry.value++;
  hasError.value = false;
  componentKey.value++; // Force re-render
  
  console.log(`🔄 Retrying component ${props.componentId} (attempt ${currentRetry.value}/${props.retryAttempts})`);
  emit('retry', { componentId: props.componentId, attempt: currentRetry.value });
  
  await loadComponent();
};

const onComponentReady = () => {
  componentReady.value = true;
  console.log(`✅ Component ${props.componentId} ready`);
};

const onComponentError = (error) => {
  console.error(`Component ${props.componentId} error:`, error);
  hasError.value = true;
  isLoading.value = false;
};

// Lifecycle
onMounted(async () => {
  // CRITICAL FIX: Guard against undefined/null componentId
  // Must be in onMounted after refs are created
  if (!props.componentId) {
    console.error('❌ ComponentRenderer: componentId is required but was not provided');
    hasError.value = true;
    isLoading.value = false;
    return; // Exit early
  }
  
  await loadComponent();
  
  // Listen for Pods data updates
  const handlePodsLoaded = () => {
    if (!componentReady.value && !hasError.value) {
      console.log(`📦 Pods data loaded, retrying component ${props.componentId}`);
      loadComponent();
    }
  };
  
  addEventListener(document, 'gmkb:pods-loaded', handlePodsLoaded);
});

// Watch for component data changes
watch(componentData, (newData, oldData) => {
  if (newData && !oldData) {
    // Component became available
    loadComponent();
  }
});
</script>

<style scoped>
.component-renderer {
  position: relative;
  min-height: 80px;
}

/* Skeleton Loading */
.component-skeleton {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  animation: pulse 1.5s infinite;
}

.skeleton-header {
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-bottom: 12px;
  width: 40%;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 16px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
}

.skeleton-line--short {
  width: 60%;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* Error State */
.component-error {
  padding: 32px;
  text-align: center;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
  filter: grayscale(0);
}

.error-message {
  color: #f87171;
  margin: 0 0 16px 0;
  font-size: 14px;
}

.retry-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 6px;
  color: #fca5a5;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-button:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

/* Fallback */
.component-fallback {
  padding: 32px;
  text-align: center;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 8px;
}

.fallback-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.fallback-message {
  color: #fbbf24;
  margin: 0;
  font-size: 14px;
}
</style>
