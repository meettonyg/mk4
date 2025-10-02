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
              <option value="professional_clean">Professional Clean</option>
              <option value="creative_bold">Creative Bold</option>
              <option value="minimal_elegant">Minimal Elegant</option>
              <option value="modern_dark">Modern Dark</option>
            </select>
          </div>
          
          <!-- Auto-save Toggle -->
          <div class="setting-group">
            <label class="toggle-label">
              <input type="checkbox" v-model="autoSave" class="toggle-input" />
              <span>Auto-save</span>
            </label>
          </div>
          
          <!-- Export/Import -->
          <div class="setting-group">
            <button class="setting-btn">Export Media Kit</button>
            <button class="setting-btn">Import Media Kit</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useMediaKitStore } from '../../../stores/mediaKit';
import ComponentList from './ComponentList.vue';

export default {
  name: 'SidebarTabs',
  components: {
    ComponentList
  },
  
  setup() {
    const store = useMediaKitStore();
    
    // Tab configuration
    const tabs = [
      { id: 'components', label: 'Components', icon: '📦' },
      { id: 'layout', label: 'Layout', icon: '🎨' },
      { id: 'settings', label: 'Settings', icon: '⚙️' }
    ];
    
    const activeTab = ref('components');
    
    // Component types for library
    const componentTypes = [
      { type: 'hero', name: 'Hero', icon: '🌟' },
      { type: 'biography', name: 'Biography', icon: '👤' },
      { type: 'topics', name: 'Topics', icon: '📚' },
      { type: 'authority-hook', name: 'Authority', icon: '🎯' },
      { type: 'guest-intro', name: 'Guest Intro', icon: '🎤' },
      { type: 'questions', name: 'Q&A', icon: '❓' },
      { type: 'testimonials', name: 'Testimonials', icon: '💬' },
      { type: 'call-to-action', name: 'CTA', icon: '📢' },
      { type: 'social', name: 'Social Links', icon: '🔗' },
      { type: 'contact', name: 'Contact', icon: '📧' },
      { type: 'stats', name: 'Statistics', icon: '📊' },
      { type: 'photo-gallery', name: 'Gallery', icon: '🖼️' },
      { type: 'video-intro', name: 'Video', icon: '🎥' },
      { type: 'podcast-player', name: 'Podcast', icon: '🎙️' },
      { type: 'booking-calendar', name: 'Booking', icon: '📅' },
      { type: 'logo-grid', name: 'Logos', icon: '🏢' }
    ];
    
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
    const selectedTheme = ref(store.theme);
    const autoSave = ref(true);
    
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
      store.theme = selectedTheme.value;
      // Trigger theme change event
      document.dispatchEvent(new CustomEvent('gmkb:theme-changed', {
        detail: { theme: selectedTheme.value }
      }));
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
    
    return {
      tabs,
      activeTab,
      layouts,
      sections,
      sectionCount,
      selectedTheme,
      autoSave,
      componentTypes,
      openComponentLibrary,
      addSection,
      removeSection,
      getSectionLabel,
      updateTheme,
      onDragStart,
      onDragEnd,
      addComponent
    };
  }
};
</script>

<style scoped>
.gmkb-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #0f172a;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

/* Tab Navigation */
.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.tab-button:hover {
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.02);
}

.tab-button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.tab-icon {
  font-size: 16px;
}

.tab-label {
  font-size: 13px;
  font-weight: 500;
}

/* Tab Content */
.sidebar-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.tab-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Component Library Sidebar */
.component-library-sidebar {
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  margin: 12px;
}

.library-header h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.library-components {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  max-height: 300px;
  overflow-y: auto;
}

.library-component {
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

.library-component:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.library-component.dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

.component-icon {
  font-size: 18px;
}

.component-name {
  flex: 1;
  font-size: 13px;
  color: #cbd5e1;
  font-weight: 500;
}

.add-btn {
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

.add-btn:hover {
  background: rgba(59, 130, 246, 0.3);
  transform: scale(1.1);
}

/* Sidebar Divider */
.sidebar-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 12px;
}

/* Layout Panel */
.layout-panel {
  padding: 16px;
}

.layout-panel h3 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.layout-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 24px;
}

.layout-option {
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

.layout-option:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.layout-icon {
  width: 32px;
  height: 32px;
}

.layout-option span {
  font-size: 11px;
  font-weight: 500;
}

/* Section List */
.section-list {
  margin-top: 24px;
}

.section-list h4 {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: #cbd5e1;
}

.section-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  margin-bottom: 6px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
}

.section-number {
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

.section-type {
  flex: 1;
  font-size: 13px;
  color: #cbd5e1;
}

.remove-btn {
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

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.1);
}

/* Settings Panel */
.settings-panel {
  padding: 16px;
}

.settings-panel h3 {
  margin: 0 0 20px 0;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: #94a3b8;
}

.setting-select {
  width: 100%;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 14px;
  cursor: pointer;
}

.setting-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.toggle-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.setting-btn {
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

.setting-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

/* Scrollbar styling */
.library-components::-webkit-scrollbar {
  width: 4px;
}

.library-components::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
}

.library-components::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.library-components::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}
</style>
