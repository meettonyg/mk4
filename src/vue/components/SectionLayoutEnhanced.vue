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
            { 'gmkb-section--active': hoveredSection === section.section_id },
            { 'gmkb-section--full-width': section.settings?.fullWidth },
            { 'gmkb-section--reverse-mobile': section.settings?.reverseOnMobile }
          ]"
          :data-section-id="section.section_id"
          :id="section.settings?.customId || undefined"
          :style="getSectionStyles(section)"
          @mouseenter="hoveredSection = section.section_id"
          @mouseleave="hoveredSection = null"
        >
          <!-- Section Header with Controls - Shows on hover only -->
          <div class="gmkb-section__header">
            <div class="gmkb-section__header-bar">
              <div class="section-handle">
                <span class="handle-icon">⋮⋮</span>
                <span class="section-type">{{ getSectionLabel(section.type) }}</span>
              </div>
              <div class="section-controls">
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
          </div>

          <!-- Section Content Area - ROOT FIX: Corrected CSS class + vertical alignment -->
          <div 
            class="gmkb-section__content" 
            :class="[
              getLayoutClass(section.type),
              getVerticalAlignClass(section)
            ]"
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
                  :item-key="(item) => {
                    // Handle various formats of component references
                    if (typeof item === 'string') return item;
                    if (item && typeof item === 'object') {
                      return item.component_id || item.id || String(Math.random());
                    }
                    // Fallback for any other type
                    return String(item || Math.random());
                  }"
                  class="component-list"
                  @change="onComponentOrderChange"
                  :animation="200"
                  ghost-class="ghost"
                  drag-class="drag"
                >
                  <template #item="{element: componentId, index}">
                    <ComponentWrapper
                      v-if="componentId && getComponent(componentId)"
                      :component="getComponent(componentId)"
                      :component-id="componentId"
                      :index="index"
                      :total-components="section.components.length"
                      :show-controls="true"
                    />
                    <!-- CRITICAL: Debug placeholder for undefined IDs -->
                    <div v-else-if="!componentId" class="component-error-placeholder">
                      <span>❌ Missing component ID at index {{ index }}</span>
                    </div>
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
                    :item-key="(item) => {
                      // Handle various formats of component references
                      if (typeof item === 'string') return item;
                      if (item && typeof item === 'object') {
                        return item.component_id || item.id || String(Math.random());
                      }
                      // Fallback for any other type
                      return String(item || Math.random());
                    }"
                    class="component-list"
                    @change="onComponentOrderChange"
                    :animation="200"
                    ghost-class="ghost"
                    drag-class="drag"
                  >
                    <template #item="{element: componentId, index}">
                      <ComponentWrapper
                        v-if="componentId && getComponent(componentId)"
                        :component="getComponent(componentId)"
                        :component-id="componentId"
                        :index="index"
                        :total-components="getColumnComponents(section, 1).length"
                        :show-controls="true"
                      />
                      <div v-else-if="!componentId" class="component-error-placeholder">
                        <span>❌ Missing component ID at index {{ index }}</span>
                      </div>
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
                    :item-key="(item) => {
                      // Handle various formats of component references
                      if (typeof item === 'string') return item;
                      if (item && typeof item === 'object') {
                        return item.component_id || item.id || String(Math.random());
                      }
                      // Fallback for any other type
                      return String(item || Math.random());
                    }"
                    class="component-list"
                    @change="onComponentOrderChange"
                    :animation="200"
                    ghost-class="ghost"
                    drag-class="drag"
                  >
                    <template #item="{element: componentId, index}">
                      <ComponentWrapper
                        v-if="componentId && getComponent(componentId)"
                        :component="getComponent(componentId)"
                        :component-id="componentId"
                        :index="index"
                        :total-components="getColumnComponents(section, 2).length"
                        :show-controls="true"
                      />
                      <div v-else-if="!componentId" class="component-error-placeholder">
                        <span>❌ Missing component ID at index {{ index }}</span>
                      </div>
                    </template>
                  </draggable>
                </div>
              </div>
            </template>

            <!-- Main + Sidebar Layout (70% / 30%) -->
            <template v-else-if="section.type === 'main_sidebar'">
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
                    <span>Main Column</span>
                  </div>
                  <draggable
                    v-else
                    :model-value="getColumnComponents(section, 1)"
                    @update:model-value="updateColumnComponents(section, 1, $event)"
                    group="components"
                    :item-key="(item) => {
                      if (typeof item === 'string') return item;
                      if (item && typeof item === 'object') {
                        return item.component_id || item.id || String(Math.random());
                      }
                      return String(item || Math.random());
                    }"
                    class="component-list"
                    @change="onComponentOrderChange"
                    :animation="200"
                    ghost-class="ghost"
                    drag-class="drag"
                  >
                    <template #item="{element: componentId, index}">
                      <ComponentWrapper
                        v-if="componentId && getComponent(componentId)"
                        :component="getComponent(componentId)"
                        :component-id="componentId"
                        :index="index"
                        :total-components="getColumnComponents(section, 1).length"
                        :show-controls="true"
                      />
                      <div v-else-if="!componentId" class="component-error-placeholder">
                        <span>❌ Missing component ID at index {{ index }}</span>
                      </div>
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
                    <span>Sidebar</span>
                  </div>
                  <draggable
                    v-else
                    :model-value="getColumnComponents(section, 2)"
                    @update:model-value="updateColumnComponents(section, 2, $event)"
                    group="components"
                    :item-key="(item) => {
                      if (typeof item === 'string') return item;
                      if (item && typeof item === 'object') {
                        return item.component_id || item.id || String(Math.random());
                      }
                      return String(item || Math.random());
                    }"
                    class="component-list"
                    @change="onComponentOrderChange"
                    :animation="200"
                    ghost-class="ghost"
                    drag-class="drag"
                  >
                    <template #item="{element: componentId, index}">
                      <ComponentWrapper
                        v-if="componentId && getComponent(componentId)"
                        :component="getComponent(componentId)"
                        :component-id="componentId"
                        :index="index"
                        :total-components="getColumnComponents(section, 2).length"
                        :show-controls="true"
                      />
                      <div v-else-if="!componentId" class="component-error-placeholder">
                        <span>❌ Missing component ID at index {{ index }}</span>
                      </div>
                    </template>
                  </draggable>
                </div>
              </div>
            </template>

            <!-- Sidebar + Main Layout (30% / 70%) -->
            <template v-else-if="section.type === 'sidebar_main'">
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
                    <span>Sidebar</span>
                  </div>
                  <draggable
                    v-else
                    :model-value="getColumnComponents(section, 1)"
                    @update:model-value="updateColumnComponents(section, 1, $event)"
                    group="components"
                    :item-key="(item) => {
                      if (typeof item === 'string') return item;
                      if (item && typeof item === 'object') {
                        return item.component_id || item.id || String(Math.random());
                      }
                      return String(item || Math.random());
                    }"
                    class="component-list"
                    @change="onComponentOrderChange"
                    :animation="200"
                    ghost-class="ghost"
                    drag-class="drag"
                  >
                    <template #item="{element: componentId, index}">
                      <ComponentWrapper
                        v-if="componentId && getComponent(componentId)"
                        :component="getComponent(componentId)"
                        :component-id="componentId"
                        :index="index"
                        :total-components="getColumnComponents(section, 1).length"
                        :show-controls="true"
                      />
                      <div v-else-if="!componentId" class="component-error-placeholder">
                        <span>❌ Missing component ID at index {{ index }}</span>
                      </div>
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
                    <span>Main Column</span>
                  </div>
                  <draggable
                    v-else
                    :model-value="getColumnComponents(section, 2)"
                    @update:model-value="updateColumnComponents(section, 2, $event)"
                    group="components"
                    :item-key="(item) => {
                      if (typeof item === 'string') return item;
                      if (item && typeof item === 'object') {
                        return item.component_id || item.id || String(Math.random());
                      }
                      return String(item || Math.random());
                    }"
                    class="component-list"
                    @change="onComponentOrderChange"
                    :animation="200"
                    ghost-class="ghost"
                    drag-class="drag"
                  >
                    <template #item="{element: componentId, index}">
                      <ComponentWrapper
                        v-if="componentId && getComponent(componentId)"
                        :component="getComponent(componentId)"
                        :component-id="componentId"
                        :index="index"
                        :total-components="getColumnComponents(section, 2).length"
                        :show-controls="true"
                      />
                      <div v-else-if="!componentId" class="component-error-placeholder">
                        <span>❌ Missing component ID at index {{ index }}</span>
                      </div>
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
                    :item-key="(item) => {
                      // Handle various formats of component references
                      if (typeof item === 'string') return item;
                      if (item && typeof item === 'object') {
                        return item.component_id || item.id || item;
                      }
                      return item;
                    }"
                    class="component-list"
                    @change="onComponentOrderChange"
                    :animation="200"
                    ghost-class="ghost"
                    drag-class="drag"
                  >
                    <template #item="{element: componentId, index}">
                      <ComponentWrapper
                        v-if="componentId && getComponent(componentId)"
                        :component="getComponent(componentId)"
                        :component-id="componentId"
                        :index="index"
                        :total-components="getColumnComponents(section, col).length"
                        :show-controls="true"
                      />
                      <div v-else-if="!componentId" class="component-error-placeholder">
                        <span>❌ Missing component ID in col {{ col }} at index {{ index }}</span>
                      </div>
                    </template>
                  </draggable>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Empty State - ROOT FIX: Made it a drop zone -->
        <div 
          v-if="sections.length === 0" 
          class="gmkb-empty-sections"
          @dragover.prevent="onEmptyDragOver"
          @dragleave="onEmptyDragLeave"
          @drop.prevent="onEmptyDrop"
          :class="{ 'drag-over': isEmptyDragOver }"
        >
          <div class="empty-message">
            <span class="empty-icon">🎨</span>
            <h3>Start Building Your Media Kit</h3>
            <p>Drag components here or use the Layout tab to add sections</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';
import { useUIStore } from '../../stores/ui';
import ComponentWrapper from './ComponentWrapper.vue';
import draggable from 'vuedraggable';

const store = useMediaKitStore();
const uiStore = useUIStore();

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

// Reactive state
const hoveredSection = ref(null);
const isEmptyDragOver = ref(false); // Track drag over empty state
const sections = computed({
  get: () => store.sections,
  set: (value) => {
    store.sections = value;
    store.hasUnsavedChanges = true;
  }
});

// Methods
const getSectionLabel = (type) => {
  const labels = {
    'full_width': 'Full Width',
    'two_column': 'Two Column',
    'three_column': 'Three Column',
    'main_sidebar': 'Main + Sidebar',
    'sidebar_main': 'Sidebar + Main'
  };
  return labels[type] || type;
};

// ROOT FIX: Get proper layout CSS class
const getLayoutClass = (type) => {
  // Map section types to CSS classes
  const classMap = {
    'full_width': 'layout-full-width',
    'two_column': 'layout-two-column',
    'three_column': 'layout-three-column',
    'main_sidebar': 'layout-main-sidebar',
    'sidebar_main': 'layout-sidebar-main'
  };
  return classMap[type] || `layout-${type}`;
};

// ROOT FIX: Get vertical alignment CSS class for multi-column sections
const getVerticalAlignClass = (section) => {
  // Only apply to multi-column layouts
  if (section.type === 'full_width') {
    return '';
  }
  
  // Get vertical align setting (default to 'start')
  const verticalAlign = section.settings?.verticalAlign || 'start';
  
  // Map to CSS class
  return `gmkb-section__columns--valign-${verticalAlign}`;
};

const getComponent = (componentId) => {
  try {
    // CRITICAL FIX: Handle various component reference formats
    if (!componentId) {
      console.warn('⚠️ getComponent called with undefined/null componentId');
      return null;
    }
    
    // Normalize the component ID
    let normalizedId = componentId;
    
    // If componentId is an object, extract the actual ID
    if (typeof componentId === 'object' && componentId !== null) {
      if (componentId.component_id) {
        console.log('🔧 Extracting component_id from object:', componentId.component_id);
        normalizedId = componentId.component_id;
      } else if (componentId.id) {
        console.log('🔧 Extracting id from object:', componentId.id);
        normalizedId = componentId.id;
      } else {
        console.error('❌ Object has no recognizable ID property:', componentId);
        return null;
      }
    }
    
    // Ensure we have a string ID
    if (typeof normalizedId !== 'string') {
      console.error('❌ Component ID is not a string:', normalizedId, typeof normalizedId);
      return null;
    }
    
    // Look up the component
    const component = store.components[normalizedId];
    
    if (!component) {
      console.warn(`⚠️ Component not found: ${normalizedId}`);
      return null;
    }
    
    // CRITICAL FIX: Validate component has required data
    if (!component.type) {
      console.error('❌ Component missing type:', normalizedId, component);
      return null;
    }
    
    return component;
  } catch (error) {
    console.error('[SectionLayoutEnhanced] Error in getComponent:', error);
    console.error('[SectionLayoutEnhanced] componentId:', componentId);
    console.error('[SectionLayoutEnhanced] store:', store);
    return null;
  }
};

const getColumnComponents = (section, column) => {
  // Initialize columns if needed
  if (!section.columns) {
    section.columns = { 1: [], 2: [], 3: [] };
  }
  if (!section.columns[column]) {
    section.columns[column] = [];
  }
  
  // For two column layouts (including sidebar layouts), ensure we only have columns 1 and 2
  const twoColumnLayouts = ['two_column', 'main_sidebar', 'sidebar_main'];
  if (twoColumnLayouts.includes(section.type) && column > 2) {
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
    // Create component ID mapping for duplicated components
    const componentIdMap = {};
    
    // Clone components with new IDs
    const cloneComponents = (componentIds) => {
      if (!componentIds || !Array.isArray(componentIds)) return [];
      
      return componentIds.map(oldId => {
        const newId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        componentIdMap[oldId] = newId;
        
        // Clone the component in the store
        const originalComponent = store.components[oldId];
        if (originalComponent) {
          store.components[newId] = {
            ...originalComponent,
            id: newId,
            data: { ...originalComponent.data },
            props: { ...originalComponent.props },
            settings: { ...originalComponent.settings }
          };
        }
        
        return newId;
      });
    };
    
    // Create new section with cloned components
    const newSection = {
      ...section,
      section_id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      components: section.components ? cloneComponents(section.components) : undefined,
      columns: section.columns ? {
        1: cloneComponents(section.columns[1] || []),
        2: cloneComponents(section.columns[2] || []),
        3: cloneComponents(section.columns[3] || [])
      } : undefined,
      settings: section.settings ? { ...section.settings } : {}
    };
    
    const index = store.sections.findIndex(s => s.section_id === sectionId);
    store.sections.splice(index + 1, 0, newSection);
    store.hasUnsavedChanges = true;
    store._trackChange();
    
    console.log(`✅ Duplicated section with ${Object.keys(componentIdMap).length} new components`);
  }
};

const removeSection = (sectionId) => {
  if (confirm('Delete this section and all its components?')) {
    store.removeSection(sectionId);
  }
};

// ROOT FIX: Open section editor in sidebar (Elementor-style)
const openSectionSettings = (sectionId) => {
  uiStore.openSectionEditor(sectionId);
};

// Drag and Drop Event Handlers
const onDragOver = (e) => {
  e.currentTarget.classList.add('drag-over');
};

const onDragLeave = (e) => {
  e.currentTarget.classList.remove('drag-over');
};

// GEMINI FIX #3: Guard drop workflow with comprehensive verification
const onDrop = (e, sectionId, column) => {
  e.currentTarget.classList.remove('drag-over');
  
  // Handle multiple data transfer formats
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
    
    // GEMINI FIX #3: Verify component was actually added before declaring success
    if (!newComponentId) {
      throw new Error('addComponent returned no ID');
    }
    
    // GEMINI FIX #3: Verify component exists in store
    const component = store.components[newComponentId];
    if (!component) {
      throw new Error(`Component ${newComponentId} not found in store after adding`);
    }
    
    // GEMINI FIX #3: Verify component has required properties
    if (!component.type) {
      throw new Error(`Component ${newComponentId} has no type`);
    }
    
    // GEMINI FIX #3: Verify component is actually in the section
    const section = store.sections.find(s => s.section_id === sectionId);
    if (!section) {
      throw new Error(`Section ${sectionId} not found`);
    }
    
    let componentInSection = false;
    if (section.components) {
      componentInSection = section.components.includes(newComponentId);
    } else if (section.columns && section.columns[column]) {
      componentInSection = section.columns[column].includes(newComponentId);
    }
    
    if (!componentInSection) {
      throw new Error(`Component ${newComponentId} not found in section ${sectionId}`);
    }
    
    // NOW we can log success (verified)
    console.log('✅ Component dropped (verified):', componentData.type, 'in section:', sectionId, 'column:', column, 'id:', newComponentId);
    
    // Trigger success event (only after verification)
    document.dispatchEvent(new CustomEvent('gmkb:component-dropped', {
      detail: {
        componentId: newComponentId,
        componentType: componentData.type,
        sectionId,
        column
      }
    }));
    
  } catch (error) {
    console.error('❌ Failed to add component:', error);
    
    // GEMINI FIX #3: Show error to user
    document.dispatchEvent(new CustomEvent('gmkb:error', {
      detail: {
        message: 'Failed to add component: ' + error.message,
        type: 'error'
      }
    }));
  }
};

// ROOT FIX: Empty state drop handlers
const onEmptyDragOver = (e) => {
  isEmptyDragOver.value = true;
};

const onEmptyDragLeave = (e) => {
  isEmptyDragOver.value = false;
};

const onEmptyDrop = async (e) => {
  isEmptyDragOver.value = false;
  
  // Handle multiple data transfer formats
  const textData = e.dataTransfer.getData('text/plain');
  const jsonData = e.dataTransfer.getData('application/json');
  const componentType = e.dataTransfer.getData('component-type');
  
  // Try to get component data from various sources
  let data = jsonData || textData || componentType;
  if (!data) {
    console.warn('⚠️ No data in drop event');
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
    
    console.log('🎯 Dropping component on empty canvas:', componentData.type);
    
    // ROOT FIX: Add component without specifying section
    // The store's addComponent will auto-create a two-column section
    const newComponentId = store.addComponent(componentData);
    
    if (!newComponentId) {
      throw new Error('addComponent returned no ID');
    }
    
    // Verify component was added
    const component = store.components[newComponentId];
    if (!component) {
      throw new Error(`Component ${newComponentId} not found in store after adding`);
    }
    
    console.log('✅ Component added to auto-created section:', newComponentId);
    console.log('✅ Sections now:', store.sections.length);
    
    // Wait for Vue to update the DOM
    await nextTick();
    
    // Trigger success event
    document.dispatchEvent(new CustomEvent('gmkb:component-dropped', {
      detail: {
        componentId: newComponentId,
        componentType: componentData.type,
        sectionId: store.sections[0]?.section_id,
        column: 1
      }
    }));
    
  } catch (error) {
    console.error('❌ Failed to add component:', error);
    
    // Show error to user
    document.dispatchEvent(new CustomEvent('gmkb:error', {
      detail: {
        message: 'Failed to add component: ' + error.message,
        type: 'error'
      }
    }));
  }
};

// GEMINI FIX #2: Update column components through store action
// This prevents direct state mutation from view layer
const updateColumnComponents = (section, column, newComponents) => {
  store.updateColumnComponents(section.section_id, column, newComponents);
};

// Handle component order changes
const onComponentOrderChange = (evt) => {
  console.log('Component order changed:', evt);
  store.hasUnsavedChanges = true;
  store._trackChange(); // Track change for history and auto-save
};

// Get section styles from settings
const getSectionStyles = (section) => {
  const styles = {};
  
  if (section.settings?.backgroundColor) {
    styles.backgroundColor = section.settings.backgroundColor;
  }
  
  // Map padding tokens to actual px values
  if (section.settings?.padding) {
    const paddingMap = {
      'small': '20px',
      'medium': '40px',
      'large': '60px',
      'extra-large': '100px',
      'none': '0px'
    };
    
    const padding = section.settings.padding;
    // If it's a token, map it; otherwise use as-is
    styles.padding = paddingMap[padding] || `${padding}px`;
  }
  
  // Apply background opacity if set
  if (section.settings?.backgroundOpacity !== undefined) {
    const bgColor = section.settings.backgroundColor || '#ffffff';
    const opacity = section.settings.backgroundOpacity;
    
    // Convert hex to rgba if needed
    if (bgColor.startsWith('#')) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      styles.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }
  
  return styles;
};

// Get column gap styles
const getColumnStyles = (section) => {
  const styles = {};
  
  // Support both 'gap' and 'columnGap' keys for backwards compatibility
  const gapValue = section.settings?.columnGap || section.settings?.gap;
  
  // Map semantic tokens to actual pixel values
  const gapMap = {
    'small': '12px',
    'medium': '24px',
    'large': '40px',
    'none': '0px'
  };
  
  // If gapValue exists, map it; otherwise default to '0px'
  const mappedGap = gapValue ? (gapMap[gapValue] || (typeof gapValue === 'number' ? `${gapValue}px` : gapValue)) : '0px';
  styles.gap = mappedGap;
  
  // Also control content padding to respect section padding setting
  const paddingValue = section.settings?.padding;
  const paddingMap = {
    'small': '20px',
    'medium': '40px',
    'large': '60px',
    'extra-large': '100px',
    'none': '0px'
  };
  const mappedPadding = paddingValue ? (paddingMap[paddingValue] || `${paddingValue}px`) : '0px';
  styles.padding = mappedPadding;
  
  return styles;
};

// Lifecycle
onMounted(async () => {
  console.log('✅ Section Layout Enhanced initialized');
  
  // CRITICAL DEBUG: Log current state
  console.log('📑 Sections:', store.sections.length);
  console.log('📑 Components:', Object.keys(store.components).length);
  
  // CRITICAL: Check for components with undefined types
  Object.entries(store.components).forEach(([id, comp]) => {
    if (!comp || !comp.type) {
      console.error('❌ Invalid component found:', { id, component: comp });
    }
  });
  
  // CRITICAL: Check sections for invalid component references
  store.sections.forEach((section, idx) => {
    console.log(`Section ${idx} (${section.section_id}):`, {
      type: section.type,
      components: section.components || 'none',
      columns: section.columns || 'none'
    });
    
    // Check full width sections
    if (section.components) {
      section.components.forEach((compId, i) => {
        if (!compId) {
          console.error(`❌ Section ${idx} has undefined component at index ${i}`);
        } else if (!store.components[compId]) {
          console.error(`❌ Section ${idx} references non-existent component: ${compId}`);
        } else if (!store.components[compId].type) {
          console.error(`❌ Component ${compId} has no type:`, store.components[compId]);
        }
      });
    }
    
    // Check columned sections
    if (section.columns) {
      Object.entries(section.columns).forEach(([col, compIds]) => {
        if (compIds) {
          compIds.forEach((compId, i) => {
            if (!compId) {
              console.error(`❌ Section ${idx} col ${col} has undefined component at index ${i}`);
            } else if (!store.components[compId]) {
              console.error(`❌ Section ${idx} col ${col} references non-existent component: ${compId}`);
            } else if (!store.components[compId].type) {
              console.error(`❌ Component ${compId} in col ${col} has no type:`, store.components[compId]);
            }
          });
        }
      });
    }
  });
  
  // Ensure at least one section exists
  if (store.sections.length === 0) {
    addSection('full_width');
  }
  
  // Initialize sections if needed
  await nextTick();
  
  // GEMINI FIX #2: Initialize columns through store action (proper architecture)
  // This moves the logic from view layer to store, preventing direct state mutation
  store.sections.forEach(section => {
    store.initializeSectionColumns(section.section_id);
  });
});

// Listen for section settings modal events

// Watch for changes and auto-save with proper debouncing
let autoSaveTimer = null;
watch(() => store.hasUnsavedChanges, (hasChanges) => {
  // Clear any existing timer
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
  }
  
  if (hasChanges) {
    // Debounced auto-save
    autoSaveTimer = setTimeout(() => {
      if (store.hasUnsavedChanges && !store.isSaving) {
        store.saveToWordPress().catch(console.error).finally(() => {
          autoSaveTimer = null;
        });
      }
    }, 2000);
  }
});

// Clean up timer on unmount
onUnmounted(() => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
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

/* Section Header - appears on hover like ComponentControls */
.gmkb-section__header {
  position: absolute;
  top: -40px;
  left: 0;
  right: 0;
  z-index: 100;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  pointer-events: none;
}

.gmkb-section__header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border: 1px solid var(--gmkb-color-primary, #4a90e2);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  pointer-events: all;
}

/* Show header on section hover */
.gmkb-section:hover .gmkb-section__header,
.gmkb-section--active .gmkb-section__header {
  opacity: 1;
  visibility: visible;
}

.section-handle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: move;
  user-select: none;
}

.handle-icon {
  color: var(--gmkb-color-text-muted, #999);
  font-size: 14px;
}

.section-type {
  font-size: 12px;
  font-weight: 500;
  color: var(--gmkb-color-primary, #4a90e2);
  padding: 0 8px;
}

.section-controls {
  display: flex;
  gap: 2px;
  align-items: center;
}

.control-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--gmkb-color-text, #333);
}

.control-btn:hover:not(:disabled) {
  background: var(--gmkb-color-surface, #f5f5f5);
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.control-btn--delete:hover:not(:disabled) {
  background: #fee;
  color: #dc3545;
}

/* Section Content - padding controlled by inline styles from getColumnStyles */
.gmkb-section__content {
  min-height: 200px;
}

/* ROOT FIX: Proper CSS classes for layouts */
.layout-full-width {
  display: block;
}

.layout-two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  /* gap controlled by inline styles */
}

.layout-three-column {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  /* gap controlled by inline styles */
}

.layout-main-sidebar {
  display: grid;
  grid-template-columns: 7fr 3fr;
  /* gap controlled by inline styles */
}

.layout-sidebar-main {
  display: grid;
  grid-template-columns: 3fr 7fr;
  /* gap controlled by inline styles */
}

/* Keep old classes for backward compatibility */
.layout-two_column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  /* gap controlled by inline styles */
}

.layout-three_column {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  /* gap controlled by inline styles */
}

/* Column */
.gmkb-section__column {
  min-height: 150px;
}

/* Drop Zone - no padding to respect section settings */
.component-drop-zone {
  min-height: 120px;
  border: 2px dashed rgba(59, 130, 246, 0.3);
  border-radius: 6px;
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

/* Empty State - ROOT FIX: Made it a drop zone */
.gmkb-empty-sections {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
  border: 3px dashed rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  transition: all 0.3s;
  cursor: pointer;
  background: rgba(59, 130, 246, 0.02);
}

.gmkb-empty-sections:hover {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(59, 130, 246, 0.04);
}

.gmkb-empty-sections.drag-over {
  border-color: rgba(59, 130, 246, 0.8);
  background: rgba(59, 130, 246, 0.1);
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
  transform: scale(1.02);
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

/* Component Error Placeholder */
.component-error-placeholder {
  padding: 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 2px dashed rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #ef4444;
  text-align: center;
  font-size: 13px;
  margin-bottom: 8px;
}

/* Full Width Container */
.gmkb-section--full-width {
  margin-left: calc(-1 * var(--gmkb-container-padding, 16px));
  margin-right: calc(-1 * var(--gmkb-container-padding, 16px));
  width: calc(100% + 2 * var(--gmkb-container-padding, 16px));
  max-width: none;
}

/* Reverse Columns on Mobile */
@media (max-width: 768px) {
  .gmkb-section--reverse-mobile .layout-two-column,
  .gmkb-section--reverse-mobile .layout-three-column,
  .gmkb-section--reverse-mobile .layout-main-sidebar,
  .gmkb-section--reverse-mobile .layout-sidebar-main {
    display: flex;
    flex-direction: column-reverse;
  }
  
  /* Ensure columns still display in reverse */
  .gmkb-section--reverse-mobile .gmkb-section__column {
    width: 100%;
  }
}

/* ============================================
   DEVICE PREVIEW MODE - MOBILE OVERRIDES
   ============================================
   ROOT FIX: When the DevicePreview component applies
   the gmkb-device--mobile class to #media-kit-preview,
   force all multi-column layouts to stack.
   
   This restores the mobile preview functionality that
   existed in the legacy SectionLayout.vue component.
   ============================================ */

/* Mobile Device Preview - Force Single Column */
#media-kit-preview.gmkb-device--mobile .layout-two-column,
#media-kit-preview.gmkb-device--mobile .layout-three-column,
#media-kit-preview.gmkb-device--mobile .layout-main-sidebar,
#media-kit-preview.gmkb-device--mobile .layout-sidebar-main,
#media-kit-preview.gmkb-device--mobile .layout-two_column,
#media-kit-preview.gmkb-device--mobile .layout-three_column {
  grid-template-columns: 1fr !important;
}

/* Tablet Device Preview - Two Column Max */
#media-kit-preview.gmkb-device--tablet .layout-three-column,
#media-kit-preview.gmkb-device--tablet .layout-three_column {
  grid-template-columns: repeat(2, 1fr) !important;
}

/* Ensure columns stack properly in mobile view */
#media-kit-preview.gmkb-device--mobile .gmkb-section__column {
  width: 100%;
}

/* Handle reverse mobile setting in device preview mode */
#media-kit-preview.gmkb-device--mobile .gmkb-section--reverse-mobile .layout-two-column,
#media-kit-preview.gmkb-device--mobile .gmkb-section--reverse-mobile .layout-three-column,
#media-kit-preview.gmkb-device--mobile .gmkb-section--reverse-mobile .layout-main-sidebar,
#media-kit-preview.gmkb-device--mobile .gmkb-section--reverse-mobile .layout-sidebar-main {
  display: flex !important;
  flex-direction: column-reverse !important;
}
</style>
