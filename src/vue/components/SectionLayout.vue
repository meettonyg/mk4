<template>
  <div class="gmkb-section" :class="sectionClasses" :data-section-id="section.id">
    <!-- Section Controls -->
    <div class="section-controls" v-if="showControls">
      <button @click="moveUp" :disabled="isFirst" title="Move Section Up">↑</button>
      <button @click="moveDown" :disabled="isLast" title="Move Section Down">↓</button>
      <button @click="changeLayout" title="Change Layout">⚏</button>
      <button @click="deleteSection" title="Delete Section">×</button>
    </div>

    <!-- Section Content based on layout -->
    <div class="section-content">
      <!-- Full Width Layout -->
      <div v-if="section.layout === 'full_width'" class="layout-full">
        <div class="column full-column" data-column="0">
          <div class="drop-zone" v-if="!hasComponents(0)">
            <p>Drop components here</p>
          </div>
          <draggable
            v-else
            :list="getColumnComponents(0)"
            group="components"
            item-key="id"
            class="component-list"
          >
            <template #item="{element}">
              <ComponentRenderer :component="element" :section-id="section.id" />
            </template>
          </draggable>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div v-else-if="section.layout === 'two_column'" class="layout-two-column">
        <div class="column left-column" data-column="0">
          <div class="drop-zone" v-if="!hasComponents(0)">
            <p>Drop components here</p>
          </div>
          <draggable
            v-else
            :list="getColumnComponents(0)"
            group="components"
            item-key="id"
            class="component-list"
          >
            <template #item="{element}">
              <ComponentRenderer :component="element" :section-id="section.id" />
            </template>
          </draggable>
        </div>
        
        <div class="column right-column" data-column="1">
          <div class="drop-zone" v-if="!hasComponents(1)">
            <p>Drop components here</p>
          </div>
          <draggable
            v-else
            :list="getColumnComponents(1)"
            group="components"
            item-key="id"
            class="component-list"
          >
            <template #item="{element}">
              <ComponentRenderer :component="element" :section-id="section.id" />
            </template>
          </draggable>
        </div>
      </div>

      <!-- Main + Sidebar Layout (70/30) -->
      <div v-else-if="section.layout === 'main_sidebar'" class="layout-main-sidebar">
        <div class="column main-column" data-column="0">
          <div class="drop-zone" v-if="!hasComponents(0)">
            <p>Drop components here</p>
          </div>
          <draggable
            v-else
            :list="getColumnComponents(0)"
            group="components"
            item-key="id"
            class="component-list"
          >
            <template #item="{element}">
              <ComponentRenderer :component="element" :section-id="section.id" />
            </template>
          </draggable>
        </div>
        
        <div class="column sidebar-column" data-column="1">
          <div class="drop-zone" v-if="!hasComponents(1)">
            <p>Drop components here</p>
          </div>
          <draggable
            v-else
            :list="getColumnComponents(1)"
            group="components"
            item-key="id"
            class="component-list"
          >
            <template #item="{element}">
              <ComponentRenderer :component="element" :section-id="section.id" />
            </template>
          </draggable>
        </div>
      </div>

      <!-- Sidebar + Main Layout (30/70) -->
      <div v-else-if="section.layout === 'sidebar_main'" class="layout-sidebar-main">
        <div class="column sidebar-column" data-column="0">
          <div class="drop-zone" v-if="!hasComponents(0)">
            <p>Drop components here</p>
          </div>
          <draggable
            v-else
            :list="getColumnComponents(0)"
            group="components"
            item-key="id"
            class="component-list"
          >
            <template #item="{element}">
              <ComponentRenderer :component="element" :section-id="section.id" />
            </template>
          </draggable>
        </div>
        
        <div class="column main-column" data-column="1">
          <div class="drop-zone" v-if="!hasComponents(1)">
            <p>Drop components here</p>
          </div>
          <draggable
            v-else
            :list="getColumnComponents(1)"
            group="components"
            item-key="id"
            class="component-list"
          >
            <template #item="{element}">
              <ComponentRenderer :component="element" :section-id="section.id" />
            </template>
          </draggable>
        </div>
      </div>

      <!-- Three Column Layout -->
      <div v-else-if="section.layout === 'three_column'" class="layout-three-column">
        <div class="column" v-for="col in 3" :key="col" :data-column="col - 1">
          <div class="drop-zone" v-if="!hasComponents(col - 1)">
            <p>Drop components here</p>
          </div>
          <draggable
            v-else
            :list="getColumnComponents(col - 1)"
            group="components"
            item-key="id"
            class="component-list"
          >
            <template #item="{element}">
              <ComponentRenderer :component="element" :section-id="section.id" />
            </template>
          </draggable>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import draggable from 'vuedraggable';
import ComponentRenderer from './ComponentRenderer.vue';
import { useMediaKitStore } from '../../stores/mediaKit';

export default {
  name: 'SectionLayout',
  components: {
    draggable,
    ComponentRenderer
  },
  props: {
    section: {
      type: Object,
      required: true
    },
    showControls: {
      type: Boolean,
      default: true
    },
    isFirst: {
      type: Boolean,
      default: false
    },
    isLast: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const store = useMediaKitStore();
    
    const sectionClasses = computed(() => ({
      [`layout-${props.section.layout}`]: true,
      'section-empty': !hasAnyComponents.value
    }));
    
    const hasAnyComponents = computed(() => {
      return store.getComponentsInSection(props.section.id).length > 0;
    });
    
    const hasComponents = (columnIndex) => {
      return getColumnComponents(columnIndex).length > 0;
    };
    
    const getColumnComponents = (columnIndex) => {
      return store.getComponentsInColumn(props.section.id, columnIndex);
    };
    
    const moveUp = () => {
      emit('move', props.section.id, 'up');
    };
    
    const moveDown = () => {
      emit('move', props.section.id, 'down');
    };
    
    const changeLayout = () => {
      emit('change-layout', props.section.id);
    };
    
    const deleteSection = () => {
      if (confirm('Delete this section and all its components?')) {
        emit('delete', props.section.id);
      }
    };
    
    return {
      sectionClasses,
      hasAnyComponents,
      hasComponents,
      getColumnComponents,
      moveUp,
      moveDown,
      changeLayout,
      deleteSection
    };
  }
};
</script>

<style>
/* Component styles - not scoped so device preview can override */
.gmkb-section {
  position: relative;
  margin-bottom: 2rem;
  min-height: 100px;
}

.section-controls {
  position: absolute;
  top: -40px;
  right: 0;
  display: flex;
  gap: 0.5rem;
  background: #1e293b;
  padding: 0.5rem;
  border-radius: 6px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 100;
}

.gmkb-section:hover .section-controls {
  opacity: 1;
}

.section-controls button {
  background: #334155;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.section-controls button:hover:not(:disabled) {
  background: #475569;
}

.section-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.section-content {
  width: 100%;
}

/* Layouts */
.layout-full {
  width: 100%;
}

.layout-two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.layout-main-sidebar {
  display: grid;
  grid-template-columns: 70fr 30fr;
  gap: 2rem;
}

.layout-sidebar-main {
  display: grid;
  grid-template-columns: 30fr 70fr;
  gap: 2rem;
}

.layout-three-column {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2rem;
}

/* Columns */
.column {
  min-height: 150px;
  background: var(--gmkb-color-surface, #f8f9fa);
  border-radius: 8px;
  padding: 1rem;
  position: relative;
}

.drop-zone {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--gmkb-color-border, #dee2e6);
  border-radius: 8px;
  color: var(--gmkb-color-text-light, #6c757d);
  padding: 2rem;
  text-align: center;
}

.drop-zone p {
  margin: 0;
  font-size: 14px;
}

.component-list {
  min-height: 100px;
}

/* Responsive */
@media (max-width: 768px) {
  .layout-two-column,
  .layout-main-sidebar,
  .layout-sidebar-main,
  .layout-three-column {
    grid-template-columns: 1fr;
  }
}

/* Device Preview Mode - Support BOTH naming conventions */
/* Original naming convention */
#media-kit-preview.device-mobile .layout-two-column,
#media-kit-preview.device-mobile .layout-main-sidebar,
#media-kit-preview.device-mobile .layout-sidebar-main,
#media-kit-preview.device-mobile .layout-three-column,
/* BEM naming convention */
#media-kit-preview.gmkb-device--mobile .layout-two-column,
#media-kit-preview.gmkb-device--mobile .layout-main-sidebar,
#media-kit-preview.gmkb-device--mobile .layout-sidebar-main,
#media-kit-preview.gmkb-device--mobile .layout-three-column,
/* Also target compound classes */
#media-kit-preview.gmkb-device--mobile .gmkb-section__content.layout-two-column,
#media-kit-preview.gmkb-device--mobile [class*="layout-two-column"],
#media-kit-preview.gmkb-device--mobile [class*="layout-three-column"] {
  grid-template-columns: 1fr !important;
}

/* Tablet mode */
#media-kit-preview.device-tablet .layout-three-column,
#media-kit-preview.gmkb-device--tablet .layout-three-column,
#media-kit-preview.gmkb-device--tablet [class*="layout-three-column"] {
  grid-template-columns: repeat(2, 1fr) !important;
}
</style>
