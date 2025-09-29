<template>
  <div 
    class="gmkb-section" 
    :class="`gmkb-section--${section.layout}`"
    :data-section-id="section.section_id"
  >
    <!-- Section Controls -->
    <div class="gmkb-section-controls" v-if="showControls">
      <button @click="$emit('remove', section.section_id)" title="Delete Section">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" stroke="currentColor" fill="none" stroke-width="2"/>
        </svg>
      </button>
    </div>

    <!-- Section Content based on layout -->
    <div class="gmkb-section-content">
      <!-- Full Width Layout -->
      <div v-if="section.layout === 'full_width'" class="section-full">
        <ComponentWrapper
          v-for="(component, index) in components"
          :key="component.id"
          :component="component"
          :section-id="section.section_id"
          :index="index"
          :total-components="components.length"
          :show-controls="showControls"
        />
        <div v-if="components.length === 0" class="section-placeholder">
          Drop components here or click to add
        </div>
      </div>

      <!-- Two Column Layout -->
      <div v-else-if="section.layout === 'two_column'" class="section-columns section-columns--two">
        <div class="section-column" data-column="1">
          <ComponentWrapper
            v-for="(component, index) in leftComponents"
            :key="component.id"
            :component="component"
            :section-id="section.section_id"
            :index="index * 2"
            :total-components="components.length"
            :show-controls="showControls"
          />
          <div v-if="leftComponents.length === 0" class="section-placeholder">
            Left column
          </div>
        </div>
        <div class="section-column" data-column="2">
          <ComponentWrapper
            v-for="(component, index) in rightComponents"
            :key="component.id"
            :component="component"
            :section-id="section.section_id"
            :index="index * 2 + 1"
            :total-components="components.length"
            :show-controls="showControls"
          />
          <div v-if="rightComponents.length === 0" class="section-placeholder">
            Right column
          </div>
        </div>
      </div>

      <!-- Three Column Layout -->
      <div v-else-if="section.layout === 'three_column'" class="section-columns section-columns--three">
        <div 
          v-for="col in 3" 
          :key="col"
          class="section-column" 
          :data-column="col"
        >
          <ComponentWrapper
            v-for="(component, index) in getColumnComponents(col)"
            :key="component.id"
            :component="component"
            :section-id="section.section_id"
            :index="getComponentIndex(col, index)"
            :total-components="components.length"
            :show-controls="showControls"
          />
          <div v-if="getColumnComponents(col).length === 0" class="section-placeholder">
            Column {{ col }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import ComponentWrapper from './builder/ComponentWrapper.vue';

export default {
  name: 'SectionRenderer',
  
  components: {
    ComponentWrapper
  },
  
  props: {
    section: {
      type: Object,
      required: true
    },
    components: {
      type: Array,
      default: () => []
    },
    showControls: {
      type: Boolean,
      default: true
    }
  },
  
  emits: ['remove', 'move-up', 'move-down'],
  
  setup(props) {
    // For two-column layout
    const leftComponents = computed(() => {
      return props.components.filter((_, index) => index % 2 === 0);
    });
    
    const rightComponents = computed(() => {
      return props.components.filter((_, index) => index % 2 === 1);
    });
    
    // For three-column layout
    const getColumnComponents = (column) => {
      return props.components.filter((_, index) => (index % 3) === (column - 1));
    };
    
    // Get the actual index of the component in the main array
    const getComponentIndex = (column, localIndex) => {
      return (localIndex * 3) + (column - 1);
    };
    
    return {
      leftComponents,
      rightComponents,
      getColumnComponents,
      getComponentIndex
    };
  }
};
</script>

<style scoped>
.gmkb-section {
  position: relative;
  margin-bottom: 30px;
  min-height: 100px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.gmkb-section-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
}

.gmkb-section:hover .gmkb-section-controls {
  opacity: 1;
}

.gmkb-section-controls button {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 4px;
  color: #94a3b8;
  padding: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.gmkb-section-controls button:hover {
  background: #334155;
  color: #f1f5f9;
}

.gmkb-section-content {
  width: 100%;
}

.section-full {
  width: 100%;
}

.section-columns {
  display: grid;
  gap: 20px;
}

.section-columns--two {
  grid-template-columns: 1fr 1fr;
}

.section-columns--three {
  grid-template-columns: 1fr 1fr 1fr;
}

.section-column {
  min-height: 200px;
}

.section-placeholder {
  padding: 40px 20px;
  text-align: center;
  color: #64748b;
  border: 2px dashed #334155;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.section-placeholder:hover {
  border-color: #475569;
  background: rgba(71, 85, 105, 0.1);
}

@media (max-width: 768px) {
  .section-columns--two,
  .section-columns--three {
    grid-template-columns: 1fr;
  }
}
</style>
