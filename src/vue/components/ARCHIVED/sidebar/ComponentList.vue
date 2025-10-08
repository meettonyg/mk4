<template>
  <div class="gmkb-component-list">
    <div class="component-list-header">
      <h3>Components</h3>
      <span class="component-count">{{ componentCount }}</span>
    </div>
    
    <div v-if="componentCount === 0" class="empty-component-list">
      <div class="empty-icon">📦</div>
      <p>No components yet</p>
      <button @click="openLibrary" class="add-first-btn">
        Add Component
      </button>
    </div>
    
    <draggable
      v-else
      v-model="componentList"
      group="components"
      item-key="id"
      class="component-items"
      :animation="200"
      ghost-class="ghost"
      drag-class="dragging"
      handle=".drag-handle"
      @start="onDragStart"
      @end="onDragEnd"
    >
      <template #item="{element: component}">
        <div 
          class="component-list-item"
          :class="{ 
            'selected': isSelected(component.id),
            'hovered': isHovered(component.id)
          }"
          @click="selectComponent(component.id)"
          @mouseenter="hoverComponent(component.id)"
          @mouseleave="unhoverComponent"
          :data-component-id="component.id"
        >
          <div class="drag-handle" title="Drag to reorder">
            ⋮⋮
          </div>
          
          <div class="component-info">
            <span class="component-type">{{ getComponentLabel(component.type) }}</span>
            <span class="component-title" v-if="component.data?.title">
              {{ component.data.title }}
            </span>
          </div>
          
          <div class="component-actions">
            <button 
              @click.stop="editComponent(component.id)" 
              class="action-btn"
              title="Edit"
            >
              ✏️
            </button>
            <button 
              @click.stop="duplicateComponent(component.id)" 
              class="action-btn"
              title="Duplicate"
            >
              📄
            </button>
            <button 
              @click.stop="deleteComponent(component.id)" 
              class="action-btn action-delete"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import { useMediaKitStore } from '../../../stores/mediaKit';
import draggable from 'vuedraggable';

export default {
  name: 'ComponentList',
  components: {
    draggable
  },
  
  setup() {
    const store = useMediaKitStore();
    
    // Computed
    const componentCount = computed(() => store.componentCount);
    
    // Get flat list of all components with their positions
    const componentList = computed({
      get() {
        const list = [];
        store.sections.forEach(section => {
          if (section.components) {
            section.components.forEach(compId => {
              const comp = store.components[compId];
              if (comp) {
                list.push({
                  ...comp,
                  sectionId: section.section_id
                });
              }
            });
          }
          if (section.columns) {
            Object.keys(section.columns).forEach(col => {
              section.columns[col].forEach(compId => {
                const comp = store.components[compId];
                if (comp) {
                  list.push({
                    ...comp,
                    sectionId: section.section_id,
                    column: parseInt(col)
                  });
                }
              });
            });
          }
        });
        return list;
      },
      set(newList) {
        // Handle reordering
        console.log('Component list reordered:', newList);
        // This will be handled by vuedraggable's events
      }
    });
    
    const isSelected = (componentId) => {
      return store.selectedComponentId === componentId;
    };
    
    const isHovered = (componentId) => {
      return store.hoveredComponentId === componentId;
    };
    
    // Methods
    const getComponentLabel = (type) => {
      const labels = {
        'hero': 'Hero Section',
        'biography': 'Biography',
        'topics': 'Topics',
        'contact': 'Contact',
        'testimonials': 'Testimonials',
        'social': 'Social Links',
        'questions': 'Q&A',
        'call-to-action': 'Call to Action',
        'stats': 'Statistics',
        'video-intro': 'Video Intro',
        'photo-gallery': 'Photo Gallery',
        'podcast-player': 'Podcast Player',
        'booking-calendar': 'Booking',
        'authority-hook': 'Authority Hook',
        'guest-intro': 'Guest Intro',
        'logo-grid': 'Logo Grid'
      };
      return labels[type] || type;
    };
    
    const selectComponent = (componentId) => {
      store.setSelectedComponent(componentId);
      
      // Scroll component into view
      setTimeout(() => {
        const element = document.querySelector(`[data-component-id="${componentId}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    };
    
    const hoverComponent = (componentId) => {
      store.setHoveredComponent(componentId);
    };
    
    const unhoverComponent = () => {
      store.setHoveredComponent(null);
    };
    
    const editComponent = (componentId) => {
      store.openEditPanel(componentId);
    };
    
    const duplicateComponent = (componentId) => {
      store.duplicateComponent(componentId);
    };
    
    const deleteComponent = (componentId) => {
      if (confirm('Delete this component?')) {
        store.removeComponent(componentId);
      }
    };
    
    const openLibrary = () => {
      store.setComponentLibraryOpen(true);
      document.dispatchEvent(new CustomEvent('gmkb:open-component-library'));
    };
    
    // Drag handlers
    const onDragStart = (evt) => {
      console.log('Started dragging from list:', evt);
      store.isDragging = true;
      store.draggedComponentId = evt.item.dataset.componentId;
    };
    
    const onDragEnd = (evt) => {
      console.log('Ended dragging from list:', evt);
      store.isDragging = false;
      store.draggedComponentId = null;
      store.hasUnsavedChanges = true;
    };
    
    return {
      componentCount,
      componentList,
      isSelected,
      isHovered,
      getComponentLabel,
      selectComponent,
      hoverComponent,
      unhoverComponent,
      editComponent,
      duplicateComponent,
      deleteComponent,
      openLibrary,
      onDragStart,
      onDragEnd
    };
  }
};
</script>

<style scoped>
.gmkb-component-list {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.component-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.component-list-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.component-count {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.empty-component-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
  text-align: center;
  padding: 24px;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
  margin-bottom: 12px;
}

.empty-component-list p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

.add-first-btn {
  padding: 8px 16px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  color: #3b82f6;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-first-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

.component-items {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.component-list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.component-list-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.15);
}

.component-list-item.selected {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.4);
}

.component-list-item.hovered {
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
}

.drag-handle {
  color: #64748b;
  cursor: move;
  font-size: 14px;
  padding: 0 4px;
}

.drag-handle:hover {
  color: #94a3b8;
}

.component-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.component-type {
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.component-title {
  font-size: 13px;
  color: #cbd5e1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.component-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.component-list-item:hover .component-actions {
  opacity: 1;
}

.action-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.action-delete:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
}

/* Draggable ghost styles */
.ghost {
  opacity: 0.5;
  background: rgba(59, 130, 246, 0.1);
}

.dragging {
  opacity: 0;
}
</style>
