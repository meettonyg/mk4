<template>
  <div 
    class="component-renderer"
    :class="[
      `component-type--${componentType}`,
      { 
        'component-renderer--editing': isEditing,
        'component-renderer--selected': isSelected,
        'component-renderer--loading': isLoading
      }
    ]"
    :data-component-id="componentId"
  >
    <!-- Loading State -->
    <div v-if="isLoading" class="component-loading">
      <div class="loading-spinner"></div>
      <span>Loading {{ componentType }}...</span>
    </div>
    
    <!-- Dynamic Component Loading -->
    <component
      v-else-if="dynamicComponent"
      :is="dynamicComponent"
      v-bind="componentProps"
      @edit="handleEdit"
      @update="handleUpdate"
    />
    
    <!-- Fallback if component not found -->
    <FallbackRenderer
      v-else
      :component-id="componentId"
      :data="componentData"
      :settings="componentSettings"
      :config="{ type: componentType }"
    />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';
import FallbackRenderer from './FallbackRenderer.vue';
import ComponentDiscoveryService from '../services/ComponentDiscoveryService';

const props = defineProps({
  componentId: {
    type: String,
    required: false
  },
  component: {
    type: Object,
    default: null
  },
  sectionId: {
    type: String,
    default: ''
  },
  column: {
    type: Number,
    default: 1
  },
  isEditing: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['edit', 'update']);

const store = useMediaKitStore();

// State
const dynamicComponent = ref(null);
const isLoading = ref(true);

// Get component from store or props
const currentComponent = computed(() => {
  // Prefer component prop over looking up by ID
  if (props.component) {
    return props.component;
  }
  // Fallback to componentId if no component provided
  if (props.componentId) {
    return store.components[props.componentId] || {};
  }
  return {};
});

// Determine the component ID from various sources
const componentId = computed(() => {
  return props.componentId || props.component?.id || currentComponent.value?.id || 'unknown';
});

// Component properties
const componentType = computed(() => {
  return currentComponent.value?.type || 'unknown';
});

const componentData = computed(() => {
  return currentComponent.value?.data || currentComponent.value?.props || {};
});

const componentSettings = computed(() => {
  return currentComponent.value?.settings || {};
});

const isSelected = computed(() => {
  return store.selectedComponentId === componentId.value;
});

// Props to pass to the actual component
const componentProps = computed(() => {
  return {
    id: componentId.value,
    componentId: componentId.value,
    data: componentData.value,
    props: componentData.value, // Some components use 'props' instead of 'data'
    settings: componentSettings.value,
    isEditing: props.isEditing,
    isSelected: isSelected.value,
    sectionId: props.sectionId,
    column: props.column
  };
});

// Load component dynamically using discovery service
const loadComponent = async () => {
  const type = componentType.value;
  
  if (!type || type === 'unknown') {
    isLoading.value = false;
    return;
  }
  
  isLoading.value = true;
  
  try {
    // First, try to load the component manifest if not already loaded
    await ComponentDiscoveryService.loadManifest(type);
    
    // Get the component from discovery service
    const component = await ComponentDiscoveryService.getComponent(type);
    
    if (component) {
      dynamicComponent.value = component;
      console.log(`✅ Loaded component: ${type}`);
    } else {
      console.warn(`⚠️ Component "${type}" not found, using fallback`);
    }
  } catch (error) {
    console.error(`Error loading component "${type}":`, error);
  } finally {
    isLoading.value = false;
  }
};

// Event handlers
const handleEdit = () => {
  emit('edit');
  store.openComponentEditor(componentId.value);
};

const handleUpdate = (updates) => {
  emit('update', updates);
  store.updateComponent(componentId.value, updates);
};

// Lifecycle
onMounted(() => {
  loadComponent();
});

// Watch for type changes
watch(componentType, () => {
  loadComponent();
});
</script>

<style scoped>
.component-renderer {
  position: relative;
  min-height: 50px;
  transition: all 0.3s ease;
}

/* Add margin between components */
.component-renderer + .component-renderer {
  margin-top: 16px;
}

/* Loading state */
.component-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: rgba(248, 250, 252, 0.5);
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  min-height: 150px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.component-loading span {
  color: #64748b;
  font-size: 14px;
}

/* Selected state */
.component-renderer--selected {
  position: relative;
}

.component-renderer--selected::before {
  content: '';
  position: absolute;
  inset: -4px;
  border: 2px solid var(--gmkb-color-primary, #3b82f6);
  border-radius: 8px;
  pointer-events: none;
  z-index: 1;
}

/* Editing state */
.component-renderer--editing {
  position: relative;
}

.component-renderer--editing::after {
  content: 'EDITING';
  position: absolute;
  top: -20px;
  right: 0;
  background: var(--gmkb-color-primary, #3b82f6);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
  z-index: 2;
}

/* Component type specific styles */
.component-type--hero {
  min-height: 200px;
}

.component-type--biography {
  min-height: 150px;
}

.component-type--unknown {
  opacity: 0.8;
}

/* Hover effects */
.component-renderer:hover {
  cursor: pointer;
}

/* Shimmer loading animation */
.component-renderer--loading {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #f8f8f8 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
