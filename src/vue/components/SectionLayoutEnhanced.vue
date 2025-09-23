<template>
  <div class="gmkb-section-layout">
    <!-- Section Controls Bar -->
    <div class="gmkb-section-toolbar">
      <div class="section-toolbar__left">
        <h3>Layout</h3>
      </div>
      <div class="section-toolbar__right">
        <button 
          v-for="layoutType in layoutOptions" 
          :key="layoutType.value"
          @click="addSection(layoutType.value)"
          class="layout-btn"
          :class="{ active: false }"
          :title="layoutType.label"
        >
          <span class="layout-icon" v-html="layoutType.icon"></span>
          <span class="layout-label">{{ layoutType.label }}</span>
        </button>
      </div>
    </div>

    <!-- Sections Container -->
    <div class="gmkb-sections-wrapper">
      <div class="gmkb-sections-container" ref="sectionsContainer">
        <div 
          v-for="(section, index) in sections"
          :key="section.section_id"
          class="gmkb-section"
          :class="[
            `gmkb-section--${section.type}`,
            { 'gmkb-section--active': hoveredSection === section.section_id }
          ]"
          :data-section-id="section.section_id"
          @mouseenter="hoveredSection = section.section_id"
          @mouseleave="hoveredSection = null"
        >
          <!-- Section Header with Controls -->
          <div class="gmkb-section__header">
            <div class="section-handle">
              <span class="handle-icon">⋮⋮</span>
              <span class="section-type">{{ getSectionLabel(section.type) }}</span>
            </div>
            <div class="section-controls">
              <button 
                @click="moveSection(index, -1)"
                class="control-btn"
                title="Move Up"
                :disabled="index === 0"
              >
                <span>↑</span>
              </button>
              <button 
                @click="moveSection(index, 1)"
                class="control-btn"
                title="Move Down"
                :disabled="index === sections.length - 1"
              >
                <span>↓</span>
              </button>
              <button 
                @click="duplicateSection(section.section_id)"
                class="control-btn"
                title="Duplicate Section"
              >
                <span>📄</span>
              </button>
              <button 
                @click="openSectionSettings(section.section_id)"
                class="control-btn"
                title="Section Settings"
              >
                <span>⚙️</span>
              </button>
              <button 
                @click="removeSection(section.section_id)"
                class="control-btn control-btn--delete"
                title="Delete Section"
              >
                <span>🗑️</span>
              </button>
            </div>
          </div>

          <!-- Section Content Area -->
          <div class="gmkb-section__content" :class="`layout-${section.type}`">
            <!-- Full Width Layout -->
            <template v-if="section.type === 'full_width'">
              <div class="gmkb-section__column" data-column="1">
                <div 
                  class="component-drop-zone"
                  :ref="el => registerDropZone(el, section.section_id, 1)"
                >
                  <div v-if="(!section.components || section.components.length === 0)" class="drop-placeholder">
                    <span class="drop-icon">📦</span>
                    <span>Drop components here</span>
                  </div>
                  <div v-for="componentId in (section.components || [])" :key="componentId">
                    <ComponentWrapper
                      :component-id="componentId"
                      :component="getComponent(componentId)"
                      :section-id="section.section_id"
                      :column="1"
                    />
                  </div>
                </div>
              </div>
            </template>

            <!-- Two Column Layout -->
            <template v-else-if="section.type === 'two_column'">
              <div class="gmkb-section__column" data-column="1">
                <div 
                  class="component-drop-zone"
                  :ref="el => registerDropZone(el, section.section_id, 1)"
                >
                  <div v-if="!getColumnComponents(section, 1).length" class="drop-placeholder">
                    <span class="drop-icon">📦</span>
                    <span>Column 1</span>
                  </div>
                  <div v-for="componentId in getColumnComponents(section, 1)" :key="componentId">
                    <ComponentWrapper
                      :component-id="componentId"
                      :component="getComponent(componentId)"
                      :section-id="section.section_id"
                      :column="1"
                    />
                  </div>
                </div>
              </div>
              <div class="gmkb-section__column" data-column="2">
                <div 
                  class="component-drop-zone"
                  :ref="el => registerDropZone(el, section.section_id, 2)"
                >
                  <div v-if="!getColumnComponents(section, 2).length" class="drop-placeholder">
                    <span class="drop-icon">📦</span>
                    <span>Column 2</span>
                  </div>
                  <div v-for="componentId in getColumnComponents(section, 2)" :key="componentId">
                    <ComponentWrapper
                      :component-id="componentId"
                      :component="getComponent(componentId)"
                      :section-id="section.section_id"
                      :column="2"
                    />
                  </div>
                </div>
              </div>
            </template>

            <!-- Three Column Layout -->
            <template v-else-if="section.type === 'three_column'">
              <div 
                v-for="col in [1, 2, 3]" 
                :key="`col-${col}`"
                class="gmkb-section__column" 
                :data-column="col"
              >
                <div 
                  class="component-drop-zone"
                  :ref="el => registerDropZone(el, section.section_id, col)"
                >
                  <div v-if="!getColumnComponents(section, col).length" class="drop-placeholder">
                    <span class="drop-icon">📦</span>
                    <span>Column {{ col }}</span>
                  </div>
                  <div v-for="componentId in getColumnComponents(section, col)" :key="componentId">
                    <ComponentWrapper
                      :component-id="componentId"
                      :component="getComponent(componentId)"
                      :section-id="section.section_id"
                      :column="col"
                    />
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="sections.length === 0" class="gmkb-empty-sections">
          <div class="empty-message">
            <span class="empty-icon">🎨</span>
            <h3>Start Building Your Media Kit</h3>
            <p>Choose a layout to begin</p>
            <div class="quick-start-layouts">
              <button 
                v-for="layout in layoutOptions"
                :key="`quick-${layout.value}`"
                @click="addSection(layout.value)"
                class="quick-layout-btn"
              >
                <span v-html="layout.icon"></span>
                <span>{{ layout.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';
import ComponentWrapper from './ComponentWrapper.vue';

const store = useMediaKitStore();

// Layout options
const layoutOptions = [
  { 
    value: 'full_width', 
    label: 'Full Width', 
    icon: '<svg viewBox="0 0 24 24" width="20" height="20"><rect x="3" y="8" width="18" height="8" fill="currentColor"/></svg>' 
  },
  { 
    value: 'two_column', 
    label: 'Two Column', 
    icon: '<svg viewBox="0 0 24 24" width="20" height="20"><rect x="3" y="8" width="8" height="8" fill="currentColor"/><rect x="13" y="8" width="8" height="8" fill="currentColor"/></svg>' 
  },
  { 
    value: 'three_column', 
    label: 'Three Column', 
    icon: '<svg viewBox="0 0 24 24" width="20" height="20"><rect x="2" y="8" width="5" height="8" fill="currentColor"/><rect x="9" y="8" width="6" height="8" fill="currentColor"/><rect x="17" y="8" width="5" height="8" fill="currentColor"/></svg>' 
  }
];

// Refs
const sectionsContainer = ref(null);
const dropZones = new Map();

// Reactive state
const hoveredSection = ref(null);
const sections = computed({
  get: () => store.sections,
  set: (value) => {
    store.sections = value;
    store.hasUnsavedChanges = true;
  }
});

// Methods
const getSectionLabel = (type) => {
  const option = layoutOptions.find(opt => opt.value === type);
  return option ? option.label : type;
};

const getComponent = (componentId) => {
  return store.components[componentId];
};

const getColumnComponents = (section, column) => {
  // Initialize columns if needed
  if (!section.columns) {
    section.columns = { 1: [], 2: [], 3: [] };
  }
  if (!section.columns[column]) {
    section.columns[column] = [];
  }
  
  // For two column layout, ensure we only have columns 1 and 2
  if (section.type === 'two_column' && column > 2) {
    return [];
  }
  
  // Return array of component IDs for this column
  return section.columns[column] || [];
};

const addSection = (type) => {
  const sectionId = store.addSection(type);
  
  // Dispatch event for legacy systems
  document.dispatchEvent(new CustomEvent('gmkb:section-added', {
    detail: { sectionId, type }
  }));
};

const moveSection = (index, direction) => {
  const newIndex = index + direction;
  if (newIndex >= 0 && newIndex < sections.value.length) {
    const temp = sections.value[index];
    sections.value[index] = sections.value[newIndex];
    sections.value[newIndex] = temp;
    store.hasUnsavedChanges = true;
  }
};

const duplicateSection = (sectionId) => {
  const section = store.sections.find(s => s.section_id === sectionId);
  if (section) {
    const newSection = {
      ...section,
      section_id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      components: [...(section.components || [])],
      columns: section.columns ? { ...section.columns } : undefined
    };
    const index = store.sections.findIndex(s => s.section_id === sectionId);
    store.sections.splice(index + 1, 0, newSection);
    store.hasUnsavedChanges = true;
  }
};

const removeSection = (sectionId) => {
  if (confirm('Delete this section and all its components?')) {
    store.removeSection(sectionId);
  }
};

const openSectionSettings = (sectionId) => {
  // Dispatch event for settings panel
  document.dispatchEvent(new CustomEvent('gmkb:section-settings', {
    detail: { sectionId }
  }));
};

// Register drop zones for drag and drop
const registerDropZone = (el, sectionId, column) => {
  if (!el) return;
  
  const key = `${sectionId}-${column}`;
  dropZones.set(key, { element: el, sectionId, column });
  
  // Set up drag and drop handlers
  el.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  });
  
  el.addEventListener('dragleave', (e) => {
    e.currentTarget.classList.remove('drag-over');
  });
  
  el.addEventListener('drop', (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const data = e.dataTransfer.getData('text/plain');
    if (data) {
      handleDrop(sectionId, column, data);
    }
  });
};

// Handle drop event
const handleDrop = (sectionId, column, data) => {
  try {
    // Try to parse as JSON first (for complex component data)
    let componentData;
    try {
      componentData = JSON.parse(data);
    } catch {
      // If not JSON, treat as component type
      componentData = { type: data };
    }
    
    // Add the component
    store.addComponent({
      ...componentData,
      sectionId,
      column
    });
    
    console.log('Component dropped:', componentData.type, 'in section:', sectionId, 'column:', column);
  } catch (error) {
    console.error('Error handling drop:', error);
  }
};

// Lifecycle
onMounted(async () => {
  console.log('✅ Section Layout Enhanced initialized');
  
  // Ensure at least one section exists
  if (store.sections.length === 0) {
    addSection('full_width');
  }
  
  // Initialize drag and drop for sections if Sortable is available
  await nextTick();
  
  // Try to use Sortable if available
  if (window.Sortable || window.sortablejs) {
    const Sortable = window.Sortable || window.sortablejs;
    if (sectionsContainer.value) {
      new Sortable(sectionsContainer.value, {
        handle: '.section-handle',
        animation: 300,
        onEnd: () => {
          store.hasUnsavedChanges = true;
          document.dispatchEvent(new CustomEvent('gmkb:sections-reordered'));
        }
      });
    }
  }
});

// Watch for changes and auto-save
watch(() => store.hasUnsavedChanges, (hasChanges) => {
  if (hasChanges) {
    // Debounced auto-save
    setTimeout(() => {
      if (store.hasUnsavedChanges) {
        store.saveToWordPress().catch(console.error);
      }
    }, 2000);
  }
});
</script>

<style scoped>
.gmkb-section-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Toolbar */
.gmkb-section-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-toolbar__left h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.section-toolbar__right {
  display: flex;
  gap: 8px;
}

.layout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.layout-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.layout-icon svg {
  display: block;
}

.layout-label {
  font-size: 12px;
}

/* Sections Container */
.gmkb-sections-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.gmkb-sections-container {
  min-height: 100%;
}

/* Section */
.gmkb-section {
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  transition: all 0.3s;
}

.gmkb-section--active {
  border-color: rgba(59, 130, 246, 0.3);
  background: rgba(59, 130, 246, 0.05);
}

/* Section Header */
.gmkb-section__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.section-handle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: move;
}

.handle-icon {
  color: #64748b;
  font-size: 16px;
}

.section-type {
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
}

.section-controls {
  display: flex;
  gap: 4px;
}

.control-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.control-btn--delete:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
}

/* Section Content */
.gmkb-section__content {
  padding: 16px;
}

.layout-two_column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.layout-three_column {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

/* Column */
.gmkb-section__column {
  min-height: 100px;
}

/* Drop Zone */
.component-drop-zone {
  min-height: 100px;
  border: 2px dashed transparent;
  border-radius: 6px;
  transition: all 0.3s;
  padding: 8px;
}

.component-drop-zone.drag-over {
  border-color: rgba(59, 130, 246, 0.4);
  background: rgba(59, 130, 246, 0.05);
}

/* Drop Placeholder */
.drop-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: #64748b;
  text-align: center;
}

.drop-icon {
  font-size: 32px;
  margin-bottom: 8px;
  opacity: 0.5;
}

/* Empty State */
.gmkb-empty-sections {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
}

.empty-message {
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-message h3 {
  color: #e2e8f0;
  margin-bottom: 8px;
}

.empty-message p {
  color: #94a3b8;
  margin-bottom: 24px;
}

.quick-start-layouts {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.quick-layout-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-layout-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}

.quick-layout-btn svg {
  width: 40px;
  height: 40px;
  color: #3b82f6;
}

/* Dragging states */
.sortable-ghost {
  opacity: 0.5;
}

.sortable-drag {
  opacity: 0;
}
</style>
