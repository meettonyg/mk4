<template>
  <div class="builder-canvas">
    <!-- Sections -->
    <div 
      v-for="section in sections" 
      :key="section.id"
      class="canvas-section"
      :class="`canvas-section--${section.layout}`"
    >
      <div class="section-header">
        <span class="section-label">{{ getSectionLabel(section.layout) }}</span>
        <button class="section-remove" @click="removeSection(section.id)">×</button>
      </div>
      
      <div class="section-content">
        <div 
          v-for="componentId in section.components"
          :key="componentId"
          class="section-slot"
        >
          <ComponentRenderer
            v-if="components[componentId]"
            :component="components[componentId]"
            @update="(updates) => $emit('update-component', componentId, updates)"
            @remove="() => $emit('remove-component', componentId)"
          />
        </div>
        
        <!-- Empty slot for adding components -->
        <div 
          v-if="section.components.length < getMaxComponents(section.layout)"
          class="section-slot section-slot--empty"
          @click="addToSection(section.id)"
        >
          <span>+ Add Component</span>
        </div>
      </div>
    </div>
    
    <!-- Standalone components (not in sections) -->
    <div 
      v-for="componentId in standaloneComponents"
      :key="componentId"
      class="canvas-component"
    >
      <ComponentRenderer
        v-if="components[componentId]"
        :component="components[componentId]"
        @update="(updates) => $emit('update-component', componentId, updates)"
        @remove="() => $emit('remove-component', componentId)"
      />
    </div>
    
    <!-- Drop zones for adding new components/sections -->
    <div class="canvas-drop-zone" @click="showAddMenu">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      <span>Add Component or Section</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import ComponentRenderer from './ComponentRenderer.vue';

const props = defineProps({
  components: {
    type: Object,
    default: () => ({})
  },
  sections: {
    type: Array,
    default: () => []
  },
  layout: {
    type: Array,
    default: () => []
  },
  theme: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update-component', 'remove-component', 'reorder']);

// Computed: standalone components (not in any section)
const standaloneComponents = computed(() => {
  const inSections = new Set();
  props.sections.forEach(section => {
    section.components.forEach(id => inSections.add(id));
  });
  
  return props.layout.filter(id => !inSections.has(id));
});

// Methods
function getSectionLabel(layout) {
  const labels = {
    'full': 'Full Width Section',
    '2-col': 'Two Column Section',
    '3-col': 'Three Column Section',
    'sidebar-left': 'Sidebar Left',
    'sidebar-right': 'Sidebar Right'
  };
  return labels[layout] || 'Section';
}

function getMaxComponents(layout) {
  const maxComponents = {
    'full': 999,
    '2-col': 2,
    '3-col': 3,
    'sidebar-left': 2,
    'sidebar-right': 2
  };
  return maxComponents[layout] || 1;
}

function removeSection(sectionId) {
  // Implement section removal
  console.log('Remove section:', sectionId);
}

function addToSection(sectionId) {
  // Implement adding component to section
  console.log('Add to section:', sectionId);
}

function showAddMenu() {
  // Implement add menu
  console.log('Show add menu');
}
</script>

<style scoped>
.builder-canvas {
  padding: 20px;
  min-height: 100%;
}

/* Sections */
.canvas-section {
  margin-bottom: 24px;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: white;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  letter-spacing: 0.5px;
}

.section-remove {
  width: 24px;
  height: 24px;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  transition: all 0.2s;
}

.section-remove:hover {
  background: #fecaca;
}

.section-content {
  display: flex;
  gap: 16px;
}

/* Section layouts */
.canvas-section--full .section-content {
  flex-direction: column;
}

.canvas-section--2-col .section-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.canvas-section--3-col .section-content {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}

.canvas-section--sidebar-left .section-content {
  display: grid;
  grid-template-columns: 300px 1fr;
}

.canvas-section--sidebar-right .section-content {
  display: grid;
  grid-template-columns: 1fr 300px;
}

/* Section slots */
.section-slot {
  min-height: 100px;
  position: relative;
}

.section-slot--empty {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s;
}

.section-slot--empty:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

/* Standalone components */
.canvas-component {
  margin-bottom: 16px;
}

/* Drop zone */
.canvas-drop-zone {
  padding: 40px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
}

.canvas-drop-zone:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

.canvas-drop-zone svg {
  width: 32px;
  height: 32px;
}

.canvas-drop-zone span {
  font-size: 14px;
  font-weight: 500;
}
</style>
