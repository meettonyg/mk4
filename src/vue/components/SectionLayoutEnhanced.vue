<template>
  <div class="gmkb-section-layout">
    <!-- Section Controls Bar - REMOVED per user request, only sidebar can add sections -->

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
          :id="section.settings?.customId || undefined"
          :style="getSectionStyles(section)"
          @mouseenter="hoveredSection = section.section_id"
          @mouseleave="hoveredSection = null"
        >
          <!-- Section Header with Controls - ROOT FIX: Enhanced visibility -->
          <div class="gmkb-section__header">
            <div class="section-handle">
              <span class="handle-icon">⋮⋮</span>
              <span class="section-type">{{ getSectionLabel(section.type) }}</span>
            </div>
            <div class="section-controls" :class="{ 'force-visible': showControls }">
              <button 
                @click.stop="moveSection(index, -1)"
                class="control-btn"
                title="Move Up"
                :disabled="index === 0"
              >
                <span>↑</span>
              </button>
              <button 
                @click.stop="moveSection(index, 1)"
                class="control-btn"
                title="Move Down"
                :disabled="index === sections.length - 1"
              >
                <span>↓</span>
              </button>
              <button 
                @click.stop="duplicateSection(section.section_id)"
                class="control-btn"
                title="Duplicate Section"
              >
                <span>📄</span>
              </button>
              <button 
                @click.stop="openSectionSettings(section.section_id)"
                class="control-btn"
                title="Section Settings"
              >
                <span>⚙️</span>
              </button>
              <button 
                @click.stop="removeSection(section.section_id)"
                class="control-btn control-btn--delete"
                title="Delete Section"
              >
                <span>🗑️</span>
              </button>
            </div>
          </div>

          <!-- Section Content Area - ROOT FIX: Corrected CSS class -->
          <div 
            class="gmkb-section__content" 
            :class="getLayoutClass(section.type)"
            :style="getColumnStyles(section)"
          >
            <!-- Full Width Layout -->
            <div v-if="section.type === 'full_width'" class="gmkb-section__column" data-column="1">
              <div 
                class="component-drop-zone"
                :data-section-id="section.section_id"
                :data-column="1"
                @dragover.prevent="onDragOver"
                @dragleave="onDragLeave"
                @drop.prevent="onDrop($event, section.section_id, 1)"
              >
                <div v-if="(!section.components || section.components.length === 0)" class="drop-placeholder">
                  <span class="drop-icon">📦</span>
                  <span>Drop components here</span>
                </div>
                <draggable
                  v-else
                  v-model="section.components"
                  group="components"
                  item-key="id"
                  class="component-list"
                  @change="onComponentOrderChange"
                  :animation="200"
                  ghost-class="ghost"
                  drag-class="drag"
                >
                  <template #item="{element: componentId}">
                    <ComponentRenderer
                      :component-id="componentId"
                      :component="getComponent(componentId)"
                      :section-id="section.section_id"
                      :column="1"
                    />
                  </template>
                </draggable>
              </div>
            </div>

            <!-- Two Column Layout -->
            <template v-else-if="section.type === 'two_column'">
              <div class="gmkb-section__column" data-column="1">
                <div 
                  class="component-drop-zone"
                  :data-section-id="section.section_id"
                  :data-column="1"
                  @dragover.prevent="onDragOver"
                  @dragleave="onDragLeave"
                  @drop.prevent="onDrop($event, section.section_id, 1)"
                >
                  <div v-if="!getColumnComponents(section, 1).length" class="drop-placeholder">
                    <span class="drop-icon">📦</span>
                    <span>Column 1</span>
                  </div>
                  <draggable
                    v-else
                    :model-value="getColumnComponents(section, 1)"
                    @update:model-value="updateColumnComponents(section, 1, $event)"
                    group="components"
                    item-key="id"
                    class="component-list"
                    @change="onComponentOrderChange"
                    :animation="200"
                    ghost-class="ghost"
                    drag-class="drag"
                  >
                    <template #item="{element: componentId}">
                      <ComponentRenderer
                        :component-id="componentId"
                        :component="getComponent(componentId)"
                        :section-id="section.section_id"
                        :column="1"
                      />
                    </template>
                  </draggable>
                </div>
              </div>
              <div class="gmkb-section__column" data-column="2">
                <div 
                  class="component-drop-zone"
                  :data-section-id="section.section_id"
                  :data-column="2"
                  @dragover.prevent="onDragOver"
                  @dragleave="onDragLeave"
                  @drop.prevent="onDrop($event, section.section_id, 2)"
                >
                  <div v-if="!getColumnComponents(section, 2).length" class="drop-placeholder">
                    <span class="drop-icon">📦</span>
                    <span>Column 2</span>
                  </div>
                  <draggable
                    v-else
                    :model-value="getColumnComponents(section, 2)"
                    @update:model-value="updateColumnComponents(section, 2, $event)"
                    group="components"
                    item-key="id"
                    class="component-list"
                    @change="onComponentOrderChange"
                    :animation="200"
                    ghost-class="ghost"
                    drag-class="drag"
                  >
                    <template #item="{element: componentId}">
                      <ComponentRenderer
                        :component-id="componentId"
                        :component="getComponent(componentId)"
                        :section-id="section.section_id"
                        :column="2"
                      />
                    </template>
                  </draggable>
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
                  :data-section-id="section.section_id"
                  :data-column="col"
                  @dragover.prevent="onDragOver"
                  @dragleave="onDragLeave"
                  @drop.prevent="onDrop($event, section.section_id, col)"
                >
                  <div v-if="!getColumnComponents(section, col).length" class="drop-placeholder">
                    <span class="drop-icon">📦</span>
                    <span>Column {{ col }}</span>
                  </div>
                  <draggable
                    v-else
                    :model-value="getColumnComponents(section, col)"
                    @update:model-value="updateColumnComponents(section, col, $event)"
                    group="components"
                    item-key="id"
                    class="component-list"
                    @change="onComponentOrderChange"
                    :animation="200"
                    ghost-class="ghost"
                    drag-class="drag"
                  >
                    <template #item="{element: componentId}">
                      <ComponentRenderer
                        :component-id="componentId"
                        :component="getComponent(componentId)"
                        :section-id="section.section_id"
                        :column="col"
                      />
                    </template>
                  </draggable>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Empty State - ROOT FIX: Removed add buttons per user request -->
        <div v-if="sections.length === 0" class="gmkb-empty-sections">
          <div class="empty-message">
            <span class="empty-icon">🎨</span>
            <h3>Start Building Your Media Kit</h3>
            <p>Use the Layout tab in the sidebar to add sections</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';
import ComponentRenderer from './ComponentRenderer.vue';
import draggable from 'vuedraggable';

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
const sectionSettingsModal = ref(null);
const editingSectionId = ref(null);

// Reactive state
const hoveredSection = ref(null);
const showControls = ref(true); // ROOT FIX: Always show controls for now
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

// ROOT FIX: Get proper layout CSS class
const getLayoutClass = (type) => {
  // Map section types to CSS classes
  const classMap = {
    'full_width': 'layout-full-width',
    'two_column': 'layout-two-column',
    'three_column': 'layout-three-column',
    'main_sidebar': 'layout-main-sidebar',
    'sidebar': 'layout-main-sidebar'
  };
  return classMap[type] || `layout-${type}`;
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
      columns: section.columns ? { 
        1: [...(section.columns[1] || [])],
        2: [...(section.columns[2] || [])],
        3: [...(section.columns[3] || [])]
      } : undefined
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
  editingSectionId.value = sectionId;
  // Dispatch event for settings panel
  document.dispatchEvent(new CustomEvent('gmkb:section-settings', {
    detail: { sectionId }
  }));
  // Also dispatch open-section-settings event
  document.dispatchEvent(new CustomEvent('gmkb:open-section-settings', {
    detail: { sectionId }
  }));
};

// Drag and Drop Event Handlers
const onDragOver = (e) => {
  e.currentTarget.classList.add('drag-over');
};

const onDragLeave = (e) => {
  e.currentTarget.classList.remove('drag-over');
};

const onDrop = (e, sectionId, column) => {
  e.currentTarget.classList.remove('drag-over');
  
  // ROOT FIX: Handle multiple data transfer formats
  const textData = e.dataTransfer.getData('text/plain');
  const jsonData = e.dataTransfer.getData('application/json');
  const componentType = e.dataTransfer.getData('component-type');
  
  // Try to get component data from various sources
  let data = jsonData || textData || componentType;
  if (!data) {
    console.warn('No data in drop event');
    return;
  }
  
  try {
    // Try to parse as JSON first (for complex component data)
    let componentData;
    try {
      componentData = typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      // If not JSON, treat as component type
      componentData = { type: data };
    }
    
    // Ensure we have a type
    if (!componentData.type && typeof data === 'string') {
      componentData.type = data;
    }
    
    // Add the component to the specific section and column
    const newComponentId = store.addComponent({
      ...componentData,
      sectionId,
      column
    });
    
    console.log('✅ Component dropped:', componentData.type, 'in section:', sectionId, 'column:', column, 'id:', newComponentId);
    
    // Trigger legacy event for any listeners
    document.dispatchEvent(new CustomEvent('gmkb:component-dropped', {
      detail: {
        componentId: newComponentId,
        componentType: componentData.type,
        sectionId,
        column
      }
    }));
  } catch (error) {
    console.error('Error handling drop:', error);
  }
};

// Update column components when dragging between columns
const updateColumnComponents = (section, column, newComponents) => {
  if (!section.columns) {
    section.columns = { 1: [], 2: [], 3: [] };
  }
  section.columns[column] = newComponents;
  store.hasUnsavedChanges = true;
};

// Handle component order changes
const onComponentOrderChange = (evt) => {
  console.log('Component order changed:', evt);
  store.hasUnsavedChanges = true;
};

// Get section styles from settings
const getSectionStyles = (section) => {
  const styles = {};
  
  if (section.settings?.backgroundColor) {
    styles.backgroundColor = section.settings.backgroundColor;
  }
  
  if (section.settings?.padding) {
    styles.padding = `${section.settings.padding}px`;
  }
  
  return styles;
};

// Get column gap styles
const getColumnStyles = (section) => {
  if (section.settings?.columnGap) {
    return {
      gap: `${section.settings.columnGap}px`
    };
  }
  return {};
};

// Lifecycle
onMounted(async () => {
  console.log('✅ Section Layout Enhanced initialized');
  
  // Ensure at least one section exists
  if (store.sections.length === 0) {
    addSection('full_width');
  }
  
  // Initialize sections if needed
  await nextTick();
  
  // Initialize columns structure for existing sections
  store.sections.forEach(section => {
    if (section.type !== 'full_width' && !section.columns) {
      section.columns = { 1: [], 2: [], 3: [] };
    }
  });
});

// Listen for section settings modal events

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

.force-visible {
  opacity: 1 !important;
  visibility: visible !important;
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

/* ROOT FIX: Always show controls on hover */
.gmkb-section:hover .section-controls,
.gmkb-section__header:hover .section-controls {
  opacity: 1 !important;
  visibility: visible !important;
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
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
}

/* ROOT FIX: Show controls on section or header hover */
.gmkb-section:hover .section-controls,
.section-controls:hover,
.section-controls.force-visible {
  opacity: 1;
  visibility: visible;
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
  min-height: 200px;
}

/* ROOT FIX: Proper CSS classes for layouts */
.layout-full-width {
  display: block;
}

.layout-two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.layout-three-column {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}

.layout-main-sidebar {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

/* Keep old classes for backward compatibility */
.layout-two_column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.layout-three_column {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}

/* Column */
.gmkb-section__column {
  min-height: 150px;
}

/* Drop Zone */
.component-drop-zone {
  min-height: 120px;
  border: 2px dashed rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  padding: 12px;
  transition: all 0.3s;
  background: rgba(59, 130, 246, 0.02);
}

.component-drop-zone:hover {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(59, 130, 246, 0.04);
}

.component-drop-zone.drag-over {
  border-color: rgba(59, 130, 246, 0.6);
  background: rgba(59, 130, 246, 0.08);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
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
  min-height: 80px;
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
  font-size: 16px;
}

/* Draggable styles */
.component-list {
  min-height: 20px;
}

.ghost {
  opacity: 0.5;
  background: rgba(59, 130, 246, 0.1);
}

.drag {
  opacity: 0;
}

.sortable-chosen {
  background: rgba(59, 130, 246, 0.05);
}

.sortable-ghost {
  opacity: 0.4;
  background: rgba(59, 130, 246, 0.1);
  border: 2px dashed rgba(59, 130, 246, 0.5);
}
</style>
