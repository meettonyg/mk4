<template>
  <div class="component-renderer" :class="componentClasses">
    <!-- Component Controls -->
    <div class="component-controls">
      <button class="control-btn" @click="editComponent" title="Edit">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </button>
      <button class="control-btn" @click="duplicateComponent" title="Duplicate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </button>
      <button class="control-btn control-btn--danger" @click="$emit('remove')" title="Remove">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
    
    <!-- Component Content -->
    <div class="component-content">
      <!-- Dynamic component rendering based on type -->
      <component
        :is="getComponentType(component.type)"
        v-bind="component.props"
        @update="handleUpdate"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// Import component types - use dynamic imports to prevent build errors
import GenericComponent from './components/GenericComponent.vue';

// These will be dynamically imported when needed
// import HeroComponent from './components/HeroComponent.vue';
// import BiographyComponent from './components/BiographyComponent.vue';
// import TopicsComponent from './components/TopicsComponent.vue';

const props = defineProps({
  component: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update', 'remove']);

// Component type mapping - simplified for build
const componentMap = {
  // Components will be dynamically loaded
  // 'hero': HeroComponent,
  // 'biography': BiographyComponent,
  // 'topics': TopicsComponent,
};

// Computed
const componentClasses = computed(() => ({
  [`component-renderer--${props.component.type}`]: true,
  'component-renderer--active': false // Add selection logic
}));

// Methods
function getComponentType(type) {
  return componentMap[type] || GenericComponent;
}

function editComponent() {
  // Open edit panel
  console.log('Edit component:', props.component.id);
}

function duplicateComponent() {
  // Duplicate this component
  console.log('Duplicate component:', props.component.id);
}

function handleUpdate(updates) {
  emit('update', updates);
}
</script>

<style scoped>
.component-renderer {
  position: relative;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.component-renderer:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.component-renderer:hover .component-controls {
  opacity: 1;
}

.component-renderer--active {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Component controls */
.component-controls {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
}

.control-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.control-btn:hover {
  background: #f3f4f6;
}

.control-btn--danger:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* Component content */
.component-content {
  position: relative;
}
</style>
