<template>
  <div class="gmkb-sidebar gmkb-sidebar-tabs">
    <!-- Tab Navigation -->
    <div class="sidebar-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-button"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>
    
    <!-- Tab Content -->
    <div class="sidebar-content">
      <!-- Components Tab -->
      <div v-show="activeTab === 'components'" class="tab-panel">
        <!-- Component Library for Adding New Components -->
        <div class="component-library-sidebar">
          <div class="library-header">
            <h3>Add Components</h3>
          </div>
          <div class="library-components">
            <div
              v-for="compType in componentTypes"
              :key="compType.type"
              class="library-component"
              :draggable="true"
              @dragstart="onDragStart($event, compType.type)"
              @dragend="onDragEnd"
            >
              <span class="component-icon">{{ compType.icon }}</span>
              <span class="component-name">{{ compType.name }}</span>
              <button @click="addComponent(compType.type)" class="add-btn" title="Add">+</button>
            </div>
          </div>
        </div>
        
        <!-- Divider -->
        <div class="sidebar-divider"></div>
        
        <!-- Existing Components List -->
        <ComponentList />
      </div>
      
      <!-- Layout Tab -->
      <div v-show="activeTab === 'layout'" class="tab-panel">
        <div class="layout-panel">
          <h3>Sections</h3>
          
          <div class="layout-options">
            <button 
              v-for="layout in layouts" 
              :key="layout.value"
              @click="addSection(layout.value)"
              class="layout-option"
              :title="layout.label"
            >
              <div class="layout-icon" v-html="layout.icon"></div>
              <span>{{ layout.label }}</span>
            </button>
          </div>
          
          <!-- Section List -->
          <div class="section-list">
            <h4>Current Sections ({{ sectionCount }})</h4>
            <div 
              v-for="(section, index) in sections" 
              :key="section.section_id"
              class="section-item"
            >
              <span class="section-number">{{ index + 1 }}</span>
              <span class="section-type">{{ getSectionLabel(section.type) }}</span>
              <button @click="removeSection(section.section_id)" class="remove-btn" title="Remove">
                ×
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Settings Tab -->
      <div v-show="activeTab === 'settings'" class="tab-panel">
        <div class="settings-panel">
          <h3>Media Kit Settings</h3>
          
          <!-- Theme Selection -->
          <div class="setting-group">
            <label>Theme</label>
            <select v-model="selectedTheme" @change="updateTheme" class="setting-select">
              <option 
                v-for="theme in availableThemes" 
                :key="theme.id" 
                :value="theme.id"
              >
                {{ theme.name }}
              </option>
            </select>
          </div>
          
          <!-- Auto-save Toggle -->
          <div class="setting-group">
            <label class="toggle-label">
              <input type="checkbox" v-model="autoSave" @change="toggleAutoSave" class="toggle-input" />
              <span>Auto-save</span>
            </label>
          </div>
          
          <!-- ROOT FIX: Wire up export/import buttons -->
          <div class="setting-group">
            <button class="setting-btn" @click="openExportModal">Export Media Kit</button>
            <button class="setting-btn" @click="openImportModal">Import Media Kit</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useMediaKitStore } from '../../../stores/mediaKit';
import { useThemeStore } from '../../../stores/theme';
import UnifiedComponentRegistry from '../../../services/UnifiedComponentRegistry';
import ComponentList from './ComponentList.vue';

export default {
  name: 'SidebarTabs',
  components: {
    ComponentList
  },
  
  setup() {
    const store = useMediaKitStore();
    const themeStore = useThemeStore();
    
    // Tab configuration
    const tabs = [
      { id: 'components', label: 'Components', icon: '📦' },
      { id: 'layout', label: 'Layout', icon: '🎨' },
      { id: 'settings', label: 'Settings', icon: '⚙️' }
    ];
    
    const activeTab = ref('components');
    
    // ROOT FIX: Load component types from registry instead of hard-coding
    const componentTypes = ref([]);
    
    // ROOT FIX: Component label mapping for friendly display names
    const componentLabels = {
      'hero': 'Hero Section',
      'biography': 'Biography',
      'topics': 'Speaking Topics',
      'topics-questions': 'Topics & Questions',
      'questions': 'Questions',
      'guest-intro': 'Guest Introduction',
      'contact': 'Contact Info',
      'social': 'Social Links',
      'testimonials': 'Testimonials',
      'stats': 'Statistics',
      'authority-hook': 'Authority Hook',
      'logo-grid': 'Logo Grid',
      'call-to-action': 'Call to Action',
      'booking-calendar': 'Booking Calendar',
      'video-intro': 'Video Introduction',
      'photo-gallery': 'Photo Gallery',
      'podcast-player': 'Podcast Player'
    };
    
    // ROOT FIX: Component icon mapping
    const componentIcons = {
      'hero': '🎯',
      'biography': '👤',
      'topics': '💬',
      'topics-questions': '❓',
      'questions': '❓',
      'guest-intro': '👋',
      'contact': '📧',
      'social': '🔗',
      'testimonials': '⭐',
      'stats': '📊',
      'authority-hook': '🏆',
      'logo-grid': '🖼️',
      'call-to-action': '🎯',
      'booking-calendar': '📅',
      'video-intro': '🎥',
      'photo-gallery': '📷',
      'podcast-player': '🎙️'
    };
    
    // Function to refresh component types from registry
    const refreshComponentTypes = () => {
      const registryComponents = UnifiedComponentRegistry.getAll();
      componentTypes.value = registryComponents.map(comp => ({
        type: comp.type,
        name: componentLabels[comp.type] || comp.name || comp.type,
        icon: componentIcons[comp.type] || comp.icon || '📦'
      }));
      console.log(`✅ SidebarTabs: Loaded ${componentTypes.value.length} components from registry`);
    };
    
    // Initialize component types
    refreshComponentTypes();
    
    // Listen for component discovery events
    const handleComponentsDiscovered = () => {
      refreshComponentTypes();
    };
    
    // Layout options
    const layouts = [
      { 
        value: 'full_width', 
        label: 'Full Width', 
        icon: '<svg viewBox="0 0 24 24" width="32" height="32"><rect x="3" y="8" width="18" height="8" fill="currentColor"/></svg>' 
      },
      { 
        value: 'two_column', 
        label: '2 Column', 
        icon: '<svg viewBox="0 0 24 24" width="32" height="32"><rect x="3" y="8" width="8" height="8" fill="currentColor"/><rect x="13" y="8" width="8" height="8" fill="currentColor"/></svg>' 
      },
      { 
        value: 'three_column', 
        label: '3 Column', 
        icon: '<svg viewBox="0 0 24 24" width="32" height="32"><rect x="2" y="8" width="5" height="8" fill="currentColor"/><rect x="9" y="8" width="6" height="8" fill="currentColor"/><rect x="17" y="8" width="5" height="8" fill="currentColor"/></svg>' 
      }
    ];
    
    // Computed
    const sections = computed(() => store.sections);
    const sectionCount = computed(() => store.sectionCount);
    // ROOT FIX: Use computed property to stay synced with store
    const selectedTheme = computed({
      get: () => store.theme,
      set: (value) => {
        store.theme = value;
      }
    });
    const autoSave = ref(store.autoSaveEnabled !== false); // Default to true if undefined
    
    // ROOT FIX: Load available themes from theme store
    const availableThemes = computed(() => {
      if (!themeStore.availableThemes || themeStore.availableThemes.length === 0) {
        // Fallback to default themes
        return [
          { id: 'professional_clean', name: 'Professional Clean' },
          { id: 'creative_bold', name: 'Creative Bold' },
          { id: 'minimal_elegant', name: 'Minimal Elegant' },
          { id: 'modern_dark', name: 'Modern Dark' }
        ];
      }
      return themeStore.availableThemes;
    });
    
    // Methods
    const openComponentLibrary = () => {
      store.setComponentLibraryOpen(true);
      document.dispatchEvent(new CustomEvent('gmkb:open-component-library'));
    };
    
    const addSection = (type) => {
      store.addSection(type);
      console.log('Added section:', type);
    };
    
    const removeSection = (sectionId) => {
      if (confirm('Remove this section?')) {
        store.removeSection(sectionId);
      }
    };
    
    const getSectionLabel = (type) => {
      const labels = {
        'full_width': 'Full Width',
        'two_column': 'Two Column',
        'three_column': 'Three Column'
      };
      return labels[type] || type;
    };
    
    const updateTheme = () => {
      // Update store theme
      store.theme = selectedTheme.value;
      store._trackChange();
      
      // Trigger the correct event that ThemeProvider listens for
      document.dispatchEvent(new CustomEvent('gmkb:change-theme', {
        detail: { themeId: selectedTheme.value }
      }));
      
      console.log('✅ Theme changed to:', selectedTheme.value);
    };
    
    // ROOT FIX: Wire up auto-save toggle - properly set store property
    const toggleAutoSave = () => {
      if (!store.autoSaveEnabled && store.autoSaveEnabled !== false) {
        // Property doesn't exist, add it
        store.$patch({ autoSaveEnabled: autoSave.value });
      } else {
        store.autoSaveEnabled = autoSave.value;
      }
      console.log('✅ Auto-save', autoSave.value ? 'enabled' : 'disabled');
    };
    
    // Drag handlers for component library
    const onDragStart = (event, componentType) => {
      event.dataTransfer.effectAllowed = 'copy';
      event.dataTransfer.setData('text/plain', componentType);
      event.dataTransfer.setData('component-type', componentType);
      event.dataTransfer.setData('application/json', JSON.stringify({ type: componentType }));
      
      // Add visual feedback
      event.target.classList.add('dragging');
      
      console.log('Started dragging component type:', componentType);
    };
    
    const onDragEnd = (event) => {
      event.target.classList.remove('dragging');
      console.log('Ended dragging');
    };
    
    // Add component directly (non-drag method)
    const addComponent = (type) => {
      // Ensure we have at least one section
      if (store.sections.length === 0) {
        store.addSection('full_width');
      }
      
      // Add component to first section
      const firstSection = store.sections[0];
      store.addComponent({
        type: type,
        sectionId: firstSection.section_id
      });
      
      console.log('Added component:', type);
    };
    
    // ROOT FIX: Add methods to open export/import modals
    const openExportModal = () => {
      // Dispatch event that ImportExportModal component listens for
      document.dispatchEvent(new CustomEvent('gmkb:open-export'));
      console.log('✅ Dispatched gmkb:open-export event');
    };
    
    const openImportModal = () => {
      // Dispatch event that ImportExportModal component listens for  
      document.dispatchEvent(new CustomEvent('gmkb:open-import'));
      console.log('✅ Dispatched gmkb:open-import event');
    };
    
    // ROOT FIX: Register event listeners with proper cleanup
    onMounted(() => {
      document.addEventListener('gmkb:components-discovered', handleComponentsDiscovered);
    });
    
    // ROOT FIX: Clean up event listeners to prevent memory leaks
    onBeforeUnmount(() => {
      document.removeEventListener('gmkb:components-discovered', handleComponentsDiscovered);
    });
    
    return {
      tabs,
      activeTab,
      layouts,
      sections,
      sectionCount,
      selectedTheme,
      autoSave,
      availableThemes,
      componentTypes,
      openComponentLibrary,
      addSection,
      removeSection,
      getSectionLabel,
      updateTheme,
      toggleAutoSave,
      onDragStart,
      onDragEnd,
      addComponent,
      openExportModal,
      openImportModal
    };
  }
};
</script>

<style>
/* Unscoped styles - properly namespace everything with .gmkb-sidebar */

/* Main sidebar container */
.gmkb-sidebar {
  height: 100%;  display: flex;
  flex-direction: column;
  background: #0f172a !important;
  border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* Tab Navigation - CONSOLIDATED */
.gmkb-sidebar .sidebar-tabs {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  position: relative !important;
  z-index: 10 !important;
  min-height: 48px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.gmkb-sidebar .tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  background: transparent;
  border: none;
  color: #64748b !important;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
  font-size: 13px;
}

.gmkb-sidebar .tab-button:hover {
  color: #94a3b8 !important;
  background: rgba(255, 255, 255, 0.02);
}

.gmkb-sidebar .tab-button.active {
  color: #3b82f6 !important;
  border-bottom-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.gmkb-sidebar .tab-icon {
  font-size: 16px;
}

.gmkb-sidebar .tab-label {
  font-size: 13px;
  font-weight: 500;
}

/* Tab Content */
.gmkb-sidebar .sidebar-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.gmkb-sidebar .tab-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Rest of the styles remain the same but with .gmkb-sidebar prefix */
.gmkb-sidebar .component-library-sidebar {
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  margin: 12px;
}

.gmkb-sidebar .library-header h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.gmkb-sidebar .library-components {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  max-height: 300px;
  overflow-y: auto;
}

.gmkb-sidebar .library-component {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  cursor: move;
  transition: all 0.2s;
}

.gmkb-sidebar .library-component:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.gmkb-sidebar .library-component.dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

.gmkb-sidebar .component-icon {
  font-size: 18px;
}

.gmkb-sidebar .component-name {
  flex: 1;
  font-size: 13px;
  color: #cbd5e1;
  font-weight: 500;
}

.gmkb-sidebar .add-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 4px;
  color: #3b82f6;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.gmkb-sidebar .add-btn:hover {
  background: rgba(59, 130, 246, 0.3);
  transform: scale(1.1);
}

.gmkb-sidebar .sidebar-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 12px;
}

/* Layout Panel */
.gmkb-sidebar .layout-panel {
  padding: 16px;
}

.gmkb-sidebar .layout-panel h3 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.gmkb-sidebar .layout-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 24px;
}

.gmkb-sidebar .layout-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.gmkb-sidebar .layout-option:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.gmkb-sidebar .layout-icon {
  width: 32px;
  height: 32px;
}

.gmkb-sidebar .layout-option span {
  font-size: 11px;
  font-weight: 500;
}

/* Section List */
.gmkb-sidebar .section-list {
  margin-top: 24px;
}

.gmkb-sidebar .section-list h4 {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: #cbd5e1;
}

.gmkb-sidebar .section-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  margin-bottom: 6px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
}

.gmkb-sidebar .section-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 4px;
  color: #3b82f6;
  font-size: 12px;
  font-weight: 600;
}

.gmkb-sidebar .section-type {
  flex: 1;
  font-size: 13px;
  color: #cbd5e1;
}

.gmkb-sidebar .remove-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 4px;
  color: #ef4444;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.gmkb-sidebar .remove-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.1);
}

/* Settings Panel */
.gmkb-sidebar .settings-panel {
  padding: 16px;
}

.gmkb-sidebar .settings-panel h3 {
  margin: 0 0 20px 0;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.gmkb-sidebar .setting-group {
  margin-bottom: 20px;
}

.gmkb-sidebar .setting-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: #94a3b8;
}

.gmkb-sidebar .setting-select {
  width: 100%;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
  cursor: pointer;
}

.gmkb-sidebar .setting-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.gmkb-sidebar .toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.gmkb-sidebar .toggle-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.gmkb-sidebar .setting-btn {
  width: 100%;
  padding: 10px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #cbd5e1;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.gmkb-sidebar .setting-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

/* Scrollbar styling */
.gmkb-sidebar .library-components::-webkit-scrollbar {
  width: 4px;
}

.gmkb-sidebar .library-components::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
}

.gmkb-sidebar .library-components::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.gmkb-sidebar .library-components::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}
</style>
