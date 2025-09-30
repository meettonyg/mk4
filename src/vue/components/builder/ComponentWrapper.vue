<template>
  <div 
    class="component-wrapper"
    :class="{ 
      'component-wrapper--selected': isSelected,
      'component-wrapper--hovering': isHovering 
    }"
    :data-component-id="component.id"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
  >
    <ComponentControls
      v-show="showControls && (isHovering || isSelected)"
      :component-id="component.id"
      :component-type="component.type"
      :index="index"
      :total-components="totalComponents"
    />
    
    <div class="component-wrapper__content">
      <ComponentRenderer 
        :component="component"
        :is-editing="isEditing"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';
import ComponentControls from './ComponentControls.vue';
import ComponentRenderer from '../ComponentRenderer.vue';

// Props
const props = defineProps({
  component: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  totalComponents: {
    type: Number,
    required: true
  },
  showControls: {
    type: Boolean,
    default: true
  }
});

const store = useMediaKitStore();

// State
const isHovering = ref(false);

// Computed
const isSelected = computed(() => store.selectedComponentId === props.component.id);
const isEditing = computed(() => store.editingComponentId === props.component.id);

// Methods
const handleMouseEnter = () => {
  isHovering.value = true;
};

const handleMouseLeave = () => {
  isHovering.value = false;
};

const handleClick = (e) => {
  // Don't select if clicking on controls
  if (e.target.closest('.component-controls')) {
    return;
  }
  store.selectComponent(props.component.id);
};
</script>

<style scoped>
.component-wrapper {
  position: relative;
  margin-bottom: 20px;
  transition: all 0.2s;
}

.component-wrapper--hovering {
  outline: 2px solid rgba(74, 144, 226, 0.3);
  outline-offset: 2px;
  border-radius: 8px;
}

.component-wrapper--selected {
  outline: 2px solid var(--gmkb-color-primary, #4a90e2);
  outline-offset: 2px;
  border-radius: 8px;
}

.component-wrapper__content {
  position: relative;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

/* Ensure components have proper spacing for controls */
.component-wrapper:first-child {
  margin-top: 40px;
}
</style>
