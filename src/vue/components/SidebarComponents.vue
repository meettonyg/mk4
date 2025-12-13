<template>
  <div class="gmkb-sidebar-components">
    <!-- Quick Add Section -->
    <div class="gmkb-quick-add">
      <h3 class="gmkb-section-title">Quick Add</h3>
      <div class="gmkb-quick-grid">
        <button
          v-for="component in quickComponents"
          :key="component.type"
          class="gmkb-quick-item"
          draggable="true"
          @click="addComponent(component)"
          @dragstart="onDragStart($event, component)"
          @dragend="onDragEnd"
          :title="`Click to add or drag ${component.name} to canvas`"
        >
          <component :is="getIcon(component.icon)" class="gmkb-quick-icon" />
          <span class="gmkb-quick-label">{{ component.name }}</span>
        </button>
      </div>
    </div>

    <!-- Browse All Button -->
    <button 
      class="gmkb-browse-button"
      @click="openLibrary"
    >
      <svg class="gmkb-browse-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="12" y1="3" x2="12" y2="21"></line>
        <line x1="3" y1="12" x2="21" y2="12"></line>
      </svg>
      Browse All Components
    </button>

    <!-- Recent Components -->
    <div v-if="recentComponents.length > 0" class="gmkb-recent">
      <h3 class="gmkb-section-title">Recently Used</h3>
      <div class="gmkb-recent-list">
        <button
          v-for="component in recentComponents"
          :key="`recent-${component.type}`"
          class="gmkb-recent-item"
          draggable="true"
          @click="addComponent(component)"
          @dragstart="onDragStart($event, component)"
          @dragend="onDragEnd"
          :title="`Click to add or drag ${component.name} to canvas`"
        >
          <component :is="getIcon(component.icon)" class="gmkb-recent-icon" />
          <span class="gmkb-recent-name">{{ component.name }}</span>
          <svg class="gmkb-add-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- Component Library Modal -->
    <ComponentLibrary ref="componentLibrary" />
  </div>
</template>

<script>
import { ref, computed, h } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';
import { useUIStore } from '../../stores/ui';
import ComponentLibrary from './ComponentLibraryNew.vue';
// PHASE 2: Import the Registry instead of the static data file
import UnifiedComponentRegistry from '../../services/UnifiedComponentRegistry';
// ROOT FIX: Import StorageService for centralized localStorage access
import storageService from '../../services/StorageService';

// Icon components
const icons = {
  layout: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' })
  ]),
  user: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
    h('circle', { cx: '12', cy: '7', r: '4' })
  ]),
  list: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('line', { x1: '8', y1: '6', x2: '21', y2: '6' }),
    h('line', { x1: '8', y1: '12', x2: '21', y2: '12' }),
    h('line', { x1: '8', y1: '18', x2: '21', y2: '18' })
  ]),
  mail: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' }),
    h('polyline', { points: '22,6 12,13 2,6' })
  ]),
  default: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' })
  ])
};

export default {
  name: 'SidebarComponents',
  
  components: {
    ComponentLibrary
  },
  
  setup() {
    const store = useMediaKitStore();
    const uiStore = useUIStore();
    const componentLibrary = ref(null);
    const recentTypes = ref([]);
    
    // PHASE 2: Use the Registry to look up components dynamically
    const quickComponents = computed(() => {
      const quickTypes = ['hero', 'biography', 'topics', 'contact', 'social', 'call-to-action'];
      return quickTypes.map(type =>
        UnifiedComponentRegistry.get(type) // Retrieve from Registry
      ).filter(Boolean);
    });
    
    // PHASE 2: Use the Registry for recent components
    const recentComponents = computed(() => {
      return recentTypes.value.map(type =>
        UnifiedComponentRegistry.get(type) // Retrieve from Registry
      ).filter(Boolean);
    });
    
    // Methods
    const addComponent = (component) => {
      // PHASE 2: Get default props from Registry standard API
      const defaultProps = UnifiedComponentRegistry.getDefaultProps(component.type);

      // Add to store
      store.addComponent({
        type: component.type,
        data: defaultProps,
        props: defaultProps // Ensure compatibility with new data structure
      });

      // Track in recent
      updateRecent(component.type);

      // Show feedback
      if (window.showToast) {
        window.showToast(`Added ${component.name}`, 'success');
      }
    };
    
    const updateRecent = (type) => {
      // Remove if already in list
      const index = recentTypes.value.indexOf(type);
      if (index > -1) {
        recentTypes.value.splice(index, 1);
      }
      
      // Add to beginning
      recentTypes.value.unshift(type);
      
      // Keep only last 3
      recentTypes.value = recentTypes.value.slice(0, 3);
      
      // ROOT FIX: Use StorageService instead of direct localStorage
      storageService.set('recent-components', recentTypes.value);
    };
    
    const openLibrary = () => {
      // Open component library modal
      if (componentLibrary.value) {
        componentLibrary.value.open();
      } else if (window.openComponentLibrary) {
        window.openComponentLibrary();
      } else {
        document.dispatchEvent(new CustomEvent('gmkb:open-component-library'));
      }
    };
    
    // ROOT FIX: Add drag-and-drop handlers for sidebar components
    const onDragStart = (event, component) => {
      // Set drag data with component information
      event.dataTransfer.effectAllowed = 'copy';
      event.dataTransfer.dropEffect = 'copy';

      // Set multiple data formats for compatibility
      event.dataTransfer.setData('text/plain', component.type);
      event.dataTransfer.setData('component-type', component.type);

      // PHASE 2: Ensure dragged data uses Registry defaults
      const defaultProps = UnifiedComponentRegistry.getDefaultProps(component.type);
      event.dataTransfer.setData('application/json', JSON.stringify({
        type: component.type,
        name: component.name,
        defaultData: defaultProps
      }));

      // Set dragging state in UI store
      uiStore.startDrag(null, component.type);

      // Add visual feedback
      event.target.classList.add('dragging');

      console.log('🎯 Started dragging component from sidebar:', component.type);
    };
    
    const onDragEnd = (event) => {
      // Clear dragging state
      uiStore.endDrag();
      
      // Remove visual feedback
      event.target.classList.remove('dragging');
      
      console.log('✅ Drag ended');
    };
    
    const getIcon = (iconName) => {
      return icons[iconName] || icons.default;
    };
    
    // ROOT FIX: Use StorageService instead of direct localStorage
    // Load recent from localStorage on mount
    const saved = storageService.get('recent-components', []);
    if (saved && Array.isArray(saved)) {
      recentTypes.value = saved;
    }
    
    return {
      quickComponents,
      recentComponents,
      componentLibrary,
      addComponent,
      openLibrary,
      getIcon,
      onDragStart,
      onDragEnd
    };
  }
};
</script>

<style scoped>
.gmkb-sidebar-components {
  padding: 20px;
}

.gmkb-section-title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #94a3b8;
  margin: 0 0 12px 0;
}

/* Quick Add Grid */
.gmkb-quick-add {
  margin-bottom: 24px;
}

.gmkb-quick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.gmkb-quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.gmkb-quick-item:hover {
  background: #334155;
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.gmkb-quick-item.dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.gmkb-quick-item[draggable="true"] {
  cursor: grab;
}

.gmkb-quick-icon {
  width: 24px;
  height: 24px;
  color: #64748b;
  margin-bottom: 6px;
}

.gmkb-quick-item:hover .gmkb-quick-icon {
  color: #3b82f6;
}

.gmkb-quick-label {
  font-size: 11px;
  color: #94a3b8;
  text-align: center;
  line-height: 1.2;
}

/* Browse Button */
.gmkb-browse-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 24px;
}

.gmkb-browse-button:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2);
}

.gmkb-browse-icon {
  width: 18px;
  height: 18px;
}

/* Recent Components */
.gmkb-recent-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.gmkb-recent-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.gmkb-recent-item:hover {
  background: #1e293b;
  border-color: #334155;
}

.gmkb-recent-item.dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.gmkb-recent-item[draggable="true"] {
  cursor: grab;
}

.gmkb-recent-icon {
  width: 18px;
  height: 18px;
  color: #64748b;
  flex-shrink: 0;
}

.gmkb-recent-name {
  flex: 1;
  font-size: 13px;
  color: #cbd5e1;
}

.gmkb-add-icon {
  width: 16px;
  height: 16px;
  color: #64748b;
  opacity: 0;
  transition: opacity 0.2s;
}

.gmkb-recent-item:hover .gmkb-add-icon {
  opacity: 1;
  color: #3b82f6;
}
</style>
