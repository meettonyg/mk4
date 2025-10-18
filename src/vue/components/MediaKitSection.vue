<template>
  <div 
    class="gmkb-section"
    :class="[
      `gmkb-section--${section.type}`,
      `gmkb-section--padding-${sectionSettings.padding || 'medium'}`,
      `gmkb-section--gap-${sectionSettings.gap || 'medium'}`
    ]"
    :data-section-id="section.section_id"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Section Controls (integrated, not overlay) -->
    <div v-show="isHovered" class="gmkb-section-controls">
      <button 
        @click="$emit('move-up', section.section_id)"
        class="control-btn"
        title="Move Up"
      >↑</button>
      <button 
        @click="$emit('move-down', section.section_id)"
        class="control-btn"
        title="Move Down"
      >↓</button>
      <button 
        @click="openSettings"
        class="control-btn"
        title="Settings"
      >⚙</button>
      <button 
        @click="$emit('remove', section.section_id)"
        class="control-btn control-btn--delete"
        title="Delete Section"
      >×</button>
    </div>

    <!-- Section Content -->
    <div class="gmkb-section__inner">
      <!-- Full Width Layout -->
      <div v-if="section.type === 'full_width'" class="gmkb-section__content gmkb-section__content--droppable" :data-section-id="section.section_id" data-column="1">
        <ComponentRenderer
          v-for="component in components"
          :key="component.id"
          :component="component"
          :section-id="section.section_id"
        />
        <!-- Always show drop zone at the end, even with components -->
        <div 
          class="drop-zone component-drop-zone"
          :class="{ 'drop-zone--empty': components.length === 0 }"
          :data-section-id="section.section_id"
          data-column="1"
        >
          {{ components.length === 0 ? 'Drop components here' : '+' }}
        </div>
      </div>

      <!-- Two Column Layout -->
      <div v-else-if="section.type === 'two_column'" class="gmkb-section__columns gmkb-section__columns--two">
        <div class="gmkb-section__column gmkb-section__content--droppable" :data-section-id="section.section_id" data-column="1">
          <ComponentRenderer
            v-for="component in leftColumnComponents"
            :key="component.id"
            :component="component"
            :section-id="section.section_id"
          />
          <!-- Always show drop zone -->
          <div 
            class="drop-zone component-drop-zone"
            :class="{ 'drop-zone--empty': leftColumnComponents.length === 0 }"
            :data-section-id="section.section_id"
            data-column="1"
          >
            {{ leftColumnComponents.length === 0 ? 'Drop to Column 1' : '+' }}
          </div>
        </div>
        <div class="gmkb-section__column gmkb-section__content--droppable" :data-section-id="section.section_id" data-column="2">
          <ComponentRenderer
            v-for="component in rightColumnComponents"
            :key="component.id"
            :component="component"
            :section-id="section.section_id"
          />
          <!-- Always show drop zone -->
          <div 
            class="drop-zone component-drop-zone"
            :class="{ 'drop-zone--empty': rightColumnComponents.length === 0 }"
            :data-section-id="section.section_id"
            data-column="2"
          >
            {{ rightColumnComponents.length === 0 ? 'Drop to Column 2' : '+' }}
          </div>
        </div>
      </div>

      <!-- Three Column Layout -->
      <div v-else-if="section.type === 'three_column'" class="gmkb-section__columns gmkb-section__columns--three">
        <div class="gmkb-section__column">
          <ComponentRenderer
            v-for="component in column1Components"
            :key="component.id"
            :component="component"
            :section-id="section.section_id"
          />
          <div 
            v-if="column1Components.length === 0" 
            class="drop-zone component-drop-zone"
            :data-section-id="section.section_id"
            data-column="1"
          >
            Drop to Column 1
          </div>
        </div>
        <div class="gmkb-section__column">
          <ComponentRenderer
            v-for="component in column2Components"
            :key="component.id"
            :component="component"
            :section-id="section.section_id"
          />
          <div 
            v-if="column2Components.length === 0" 
            class="drop-zone component-drop-zone"
            :data-section-id="section.section_id"
            data-column="2"
          >
            Drop to Column 2
          </div>
        </div>
        <div class="gmkb-section__column">
          <ComponentRenderer
            v-for="component in column3Components"
            :key="component.id"
            :component="component"
            :section-id="section.section_id"
          />
          <div 
            v-if="column3Components.length === 0" 
            class="drop-zone component-drop-zone"
            :data-section-id="section.section_id"
            data-column="3"
          >
            Drop to Column 3
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import ComponentRenderer from './ComponentRenderer.vue';

const props = defineProps({
  section: {
    type: Object,
    required: true
  },
  components: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['move-up', 'move-down', 'remove']);

// State
const isHovered = ref(false);

// ROOT FIX: Computed property for section settings
const sectionSettings = computed(() => {
  return props.section.settings || {};
});

// Computed properties for column layouts
const leftColumnComponents = computed(() => {
  return props.components.filter(c => !c.columnIndex || c.columnIndex === 1);
});

const rightColumnComponents = computed(() => {
  return props.components.filter(c => c.columnIndex === 2);
});

const column1Components = computed(() => {
  return props.components.filter(c => !c.columnIndex || c.columnIndex === 1);
});

const column2Components = computed(() => {
  return props.components.filter(c => c.columnIndex === 2);
});

const column3Components = computed(() => {
  return props.components.filter(c => c.columnIndex === 3);
});

// Methods
const openSettings = () => {
  // Emit event to open settings panel
  document.dispatchEvent(new CustomEvent('gmkb:section-settings', {
    detail: { sectionId: props.section.section_id }
  }));
};
</script>

<style scoped>
.gmkb-section {
  position: relative;
  margin-bottom: 20px;
  padding: 20px; /* Default padding */
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  transition: all 0.3s;
}

/* ROOT FIX: Dynamic padding classes */
.gmkb-section--padding-none {
  padding: 0;
}

.gmkb-section--padding-small {
  padding: 12px;
}

.gmkb-section--padding-medium {
  padding: 20px;
}

.gmkb-section--padding-large {
  padding: 32px;
}

.gmkb-section--padding-extra-large {
  padding: 48px;
}

.gmkb-section:hover {
  background: rgba(255, 255, 255, 0.04);
}

/* Section Controls - Integrated */
.gmkb-section-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 4px;
  background: rgba(0, 0, 0, 0.8);
  padding: 4px;
  border-radius: 6px;
  z-index: 10;
}

.control-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.control-btn--delete:hover {
  background: rgba(239, 68, 68, 0.5);
}

/* Section Layouts */
.gmkb-section__inner {
  min-height: 100px;
}

.gmkb-section__content {
  width: 100%;
}

.gmkb-section__columns {
  display: flex;
  gap: 20px; /* Default gap */
}

/* ROOT FIX: Dynamic gap classes */
.gmkb-section--gap-none .gmkb-section__columns {
  gap: 0;
}

.gmkb-section--gap-small .gmkb-section__columns {
  gap: 12px;
}

.gmkb-section--gap-medium .gmkb-section__columns {
  gap: 20px;
}

.gmkb-section--gap-large .gmkb-section__columns {
  gap: 32px;
}

.gmkb-section__columns--two .gmkb-section__column {
  flex: 1;
}

.gmkb-section__columns--three .gmkb-section__column {
  flex: 1;
}

.gmkb-section__column {
  min-height: 100px;
}

/* Drop Zones */
.drop-zone {
  padding: 20px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  text-align: center;
  color: #64748b;
  transition: all 0.3s;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.drop-zone--empty {
  padding: 40px;
}

.drop-zone:not(.drop-zone--empty) {
  margin-top: 10px;
  font-size: 24px;
  opacity: 0.3;
}

.drop-zone:not(.drop-zone--empty):hover {
  opacity: 1;
}

.drop-zone:hover,
.drop-zone.drag-over {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(59, 130, 246, 0.05);
}

/* Content droppable areas */
.gmkb-section__content--droppable {
  min-height: 100px;
}

.gmkb-section__content--droppable.drag-over,
.gmkb-section__column.drag-over {
  background: rgba(59, 130, 246, 0.05);
  border: 2px dashed rgba(59, 130, 246, 0.5);
  border-radius: 8px;
}
</style>
